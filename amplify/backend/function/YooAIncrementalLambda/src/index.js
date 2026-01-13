// index.js (Node 18+ / aws-sdk v3)
// ... keep your existing requires ...
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand, UpdateItemCommand, GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { Decimal } = require('break_eternity.js'); // npm i break_eternity.js

const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const TABLE = process.env.TABLE_NAME || "YooAIncrementalData-dev";
const MAX_DATA_BYTES = 350 * 1024;

// add helper: make sortable score (same logic previously shared)
function padLeft(s, len) { return String(s).padStart(len, '0'); }
function makeSortableScoreFromDecimalInput(dec) {
    const sign = dec.sign;
    const layer = Math.max(0, Math.floor(dec.layer || 0));
    const mag = Number(dec.mag || 0);

    if (sign === 0 || (layer === 0 && mag === 0)) {
        const L = 6, I = 17, F = 12;
        return `${padLeft(0, L)}:${padLeft(0, I)}.${'0'.repeat(F)}`;
    }
    if (sign < 0) throw new Error("Negative YooA Points not supported by this encoding.");

    const LAYER_PAD = 6, INT_PAD = 17, FRAC_PAD = 12;
    const magFixed = Number.isFinite(mag) ? mag.toFixed(FRAC_PAD) : '0.' + '0'.repeat(FRAC_PAD);
    const [magInt, magFrac = ''] = String(magFixed).split('.');
    return `${padLeft(layer, LAYER_PAD)}:${padLeft(magInt.replace(/^[-+]/, ''), INT_PAD)}.${magFrac.padEnd(FRAC_PAD, '0').slice(0, FRAC_PAD)}`;
}

// helper: decode JWT payload (base64url -> JSON)
function decodeJwtPayload(token) {
    try {
        const parts = (token || "").split(".");
        if (parts.length < 2) return null;
        // base64url -> base64
        let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        // pad
        while (payload.length % 4) payload += "=";
        const json = Buffer.from(payload, "base64").toString("utf8");
        return JSON.parse(json);
    } catch (e) {
        console.warn("JWT decode failed:", e && e.message);
        return null;
    }
}

exports.handler = async (event) => {
    console.log("EVENT:", JSON.stringify(event, null, 2));
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

    try {
        const rawHeaders = event.headers || {};
        const authHeader = rawHeaders.Authorization || rawHeaders.authorization || rawHeaders["Authorization"] || rawHeaders["authorization"];
        const token = authHeader ? String(authHeader).replace(/^Bearer\s+/i, "").trim() : null;
        if (!token) {
            console.warn("Missing token");
            return { statusCode: 401, headers, body: "Missing or invalid token" };
        }

        // decode token payload to get stable user id (sub)
        const payload = decodeJwtPayload(token);
        const userId = (payload && (payload.sub || payload.username || payload.email)) ? (payload.sub || payload.username || payload.email) : token;
        // userId will now be stable across sessions if sub exists

        const path = event.path || "";
        const method = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method) || "";

        // ---------- SAVE ----------
        if (path.endsWith("/save") && method === "POST") {
            let bodyObj = {};
            try {
                bodyObj = event.body ? JSON.parse(event.body) : {};
            } catch (parseErr) {
                console.error("Invalid JSON body:", parseErr);
                return { statusCode: 400, headers, body: "Invalid JSON body" };
            }

            const slot = bodyObj.slot || "main";
            const data = bodyObj.data || null;
            if (!data || typeof data !== "string") {
                return { statusCode: 400, headers, body: "Missing or invalid data" };
            }

            const bytes = Buffer.byteLength(data, 'utf8');
            if (bytes > MAX_DATA_BYTES) {
                console.warn("Save data too large:", bytes);
                return { statusCode: 413, headers, body: "Save too large. Use cloud storage (S3) and store pointer in DB." };
            }

            const now = new Date().toISOString();
            const updateParams = {
                TableName: TABLE,
                Key: {
                    userId: { S: userId },
                    slot: { S: slot }
                },
                UpdateExpression: "SET #d = :d, updatedAt = :now, version = if_not_exists(version, :zero) + :inc",
                ExpressionAttributeNames: { "#d": "data" },
                ExpressionAttributeValues: {
                    ":d": { S: data },
                    ":now": { S: now },
                    ":inc": { N: "1" },
                    ":zero": { N: "0" }
                },
                ReturnValues: "ALL_NEW"
            };

            const updateRes = await ddb.send(new UpdateItemCommand(updateParams));
            const newVersion = updateRes.Attributes && updateRes.Attributes.version && updateRes.Attributes.version.N ? Number(updateRes.Attributes.version.N) : 0;
            const updatedAt = updateRes.Attributes && updateRes.Attributes.updatedAt && updateRes.Attributes.updatedAt.S ? updateRes.Attributes.updatedAt.S : now;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true, version: newVersion, updatedAt })
            };
        }

        // ---------- LOAD ----------
        if (path.endsWith("/load") && method === "GET") {
            const q = event.queryStringParameters || {};
            const slot = q.slot || "main";

            const params = {
                TableName: TABLE,
                Key: { userId: { S: userId }, slot: { S: slot } }
            };

            const result = await ddb.send(new GetItemCommand(params));
            console.log("DynamoDB get result:", JSON.stringify(result));

            if (!result || !result.Item) {
                return { statusCode: 404, headers, body: "No cloud save found" };
            }

            const version = result.Item.version && result.Item.version.N ? Number(result.Item.version.N) : 0;
            const data = result.Item.data && result.Item.data.S ? result.Item.data.S : "";

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ slot, version, data })
            };
        }

        // ---------- LEADERBOARD: UPDATE (non-destructive) ----------
        if (path.endsWith("/leaderboard/update") && method === "POST") {
            // Auth already done above; "userId" variable available
            let bodyObj = {};
            try { bodyObj = event.body ? JSON.parse(event.body) : {}; }
            catch (e) { return { statusCode: 400, headers, body: "Invalid JSON body" }; }

            const slot = bodyObj.slot || "main";
            // require explicit scoreRaw from client (safer): do NOT try to reconstruct save data here unless explicitly asked
            if (!bodyObj.scoreRaw && !bodyObj.YooAPoints) {
                return { statusCode: 400, headers, body: "Missing scoreRaw (send break_eternity string)" };
            }

            const scoreRaw = String(bodyObj.scoreRaw ?? bodyObj.YooAPoints);
            // compute sortable safely
            let sortableScore;
            try {
                const dec = new Decimal(String(scoreRaw));
                sortableScore = makeSortableScoreFromDecimalInput(dec);
            } catch (err) {
                console.error("sortable compute failed", err && err.message);
                return { statusCode: 400, headers, body: "Invalid score value" };
            }

            const displayName = bodyObj.displayName ?? (payload && (payload.email || payload.username)) ?? userId;
            const avatarKey = bodyObj.avatarKey ?? null;
            const now = new Date().toISOString();

            // Update *only* leaderboard attributes — do not modify `data`
            const params = {
                TableName: TABLE,
                Key: { userId: { S: userId }, slot: { S: slot } },
                UpdateExpression: `
      SET
        pk = :pk,
        scoreRaw = :sr,
        sortableScore = :ss,
        displayName = :dn,
        avatarKey = :av,
        leaderboardUpdatedAt = :now,
        leaderboardVersion = if_not_exists(leaderboardVersion, :zero) + :inc
    `,
                ExpressionAttributeValues: {
                    ":pk": { S: "leaderboard" },
                    ":sr": { S: String(scoreRaw) },
                    ":ss": { S: String(sortableScore) },
                    ":dn": { S: String(displayName) },
                    ":av": avatarKey ? { S: String(avatarKey) } : { NULL: true },
                    ":now": { S: now },
                    ":inc": { N: "1" },
                    ":zero": { N: "0" }
                },
                ReturnValues: "ALL_NEW"
            };

            const upd = await ddb.send(new UpdateItemCommand(params));
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true, saved: { scoreRaw, sortableScore } }) };
        }

        return { statusCode: 400, headers, body: "Invalid route" };

    } catch (err) {
        console.error("UNHANDLED ERROR:", err && err.stack ? err.stack : err);
        return { statusCode: 500, headers, body: "Internal Server Error" };
    }
};
