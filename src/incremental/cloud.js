// cloud.js (browser) — patched
const API = "https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev";

/* ===== UTF-8 safe base64 helpers ===== */
export function toBase64Safe(obj) {
  const str = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function fromBase64Safe(b64) {
  if (!b64) return null;
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decoder = new TextDecoder();
    const json = decoder.decode(bytes);
    return JSON.parse(json);
  } catch (err) {
    // not a valid base64-encoded JSON or decode failed
    // console.debug("fromBase64Safe: not a base64 JSON:", err);
    return null;
  }
}

/* cloudSaveRaw now accepts either:
   - a string (already-serialized save, e.g. exportSave())
   - or an object (we will base64-encode it)
*/
export async function cloudSaveRaw(objectOrString, token, slot = "main") {
  if (!token) throw new Error("Missing token");

  const payload = { slot, data: null };

  if (typeof objectOrString === "string") {
    // send string directly (this is what exportSave() likely returns)
    payload.data = objectOrString;
  } else {
    // fallback: encode arbitrary object
    payload.data = toBase64Safe(objectOrString);
  }

  const res = await fetch(`${API}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text().catch(() => "");
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { /* leave json null */ }

  if (!res.ok) {
    // include server body (if any) to make debugging easier
    const serverMsg = json && json.error ? json.error : text || `status ${res.status}`;
    throw new Error(`cloudSaveRaw failed: ${serverMsg}`);
  }

  // Return parsed JSON if present, otherwise raw text
  return json ?? { rawText: text };
}

/* cloudLoadRaw returns both parsed (if it was base64) and raw string */
export async function cloudLoadRaw(token, slot = "main") {
  if (!token) throw new Error("Missing token");
  const url = `${API}/load?slot=${encodeURIComponent(slot)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.status === 404) {
    // no saved data on the server for this key
    return null;
  }
  const text = await res.text().catch(()=>null);
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { /* ignore parse error */ }

  if (!res.ok) {
    const serverMsg = json && json.error ? json.error : text || `status ${res.status}`;
    throw new Error(`cloudLoadRaw failed: ${serverMsg}`);
  }

  // Support both server shapes:
  // older: { ok: true, data: "<raw string>" }
  // current: { ok: true, raw: "<raw string>" }
  const raw = (json && (typeof json.raw === "string" ? json.raw : (typeof json.data === "string" ? json.data : null))) ?? text ?? null;

  // attempt to base64-decode (if it was saved as base64)
  let parsed = null;
  if (raw) {
    parsed = fromBase64Safe(raw);
    // If parsed is null, raw might be plain save-string; leave parsed null to indicate not decoded.
  }

  // debug-friendly return
  return {
    saved: parsed,     // parsed object if it was base64-encoded JSON, otherwise null
    raw: raw,          // raw string value from server (if any)
    version: (json && (json.version ?? json.ver)) ?? null,
    meta: json         // entire server response for debugging
  };
}
