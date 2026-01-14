// save.js — fixed, full migration + load + save file
// Handles robust Decimal revival, Dimension & Autobuyer reconstruction,
// and safe defaults merging for old saves.

import { gameLoop, getStartAutobuyers, getStartDimensions, getStartPlayer, player } from "./incremental.js";
import { getStartOptions } from './options.js';
import Dimension from "./dimensions.js";
import { generateNewProblem } from "@/components/comps/MathProblem.vue";
import Autobuyer from "./automation.js";
import Decimal from "./break_eternity.js";

const dZero = Decimal.dZero;

// --- Utilities ------------------------------------------------------------

function deepCopy(obj) {
  // intentionally simple plain-JSON copy for saving; migration revives complex instances
  return JSON.parse(JSON.stringify(obj));
}

async function fetchAuthProfileForLeaderboard() {
  try {
    // fetch session
    let session = null;
    try {
      session = await fetchAuthSession().catch(() => null);
    } catch (e) {
      session = null;
    }
    const hasTokens = !!(session && session.tokens && session.tokens.idToken);
    if (!hasTokens) return { displayName: null, avatarUrl: null };

    // fetch user attributes
    let attrs = null;
    try {
      attrs = await fetchUserAttributes();
    } catch (e) {
      // Some flows may not allow fetchUserAttributes; fall back to none
      console.warn('save.js: fetchUserAttributes failed', e);
      attrs = null;
    }

    const attrsMap = {};
    if (Array.isArray(attrs)) {
      attrs.forEach(a => {
        const name = a.Name || a.name;
        const value = a.Value || a.value;
        if (name) attrsMap[name] = value;
      });
    } else if (attrs && typeof attrs === 'object' && Object.keys(attrs).length) {
      Object.assign(attrsMap, attrs);
    }

    // Determine display name
    const displayName = attrsMap['custom:displayName'] || attrsMap['name'] || session?.username || null;

    // Determine avatar URL
    const pic = attrsMap['custom:picture'] || attrsMap['picture'] || null;
    let avatarUrl = null;
    if (pic && typeof pic === 'string') {
      // If it's a data URL saved as legacy, use it directly
      if (pic.startsWith('data:')) {
        avatarUrl = pic;
      } else {
        // Otherwise assume it's an S3 key and request a signed URL
        try {
          const signed = await getUrl({ key: pic, options: { level: 'protected' } });
          const signedUrlObj = signed?.url || signed?.result?.url || signed;
          if (signedUrlObj) {
            avatarUrl = typeof signedUrlObj === 'string' ? signedUrlObj : (signedUrlObj?.toString?.() || null);
          } else if (typeof signed === 'string') {
            avatarUrl = signed;
          } else if (signed?.Location && typeof signed.Location === 'string') {
            avatarUrl = signed.Location;
          }
        } catch (e) {
          console.warn('save.js: getUrl failed for avatar key', e);
        }
      }
    }

    return { displayName: displayName || null, avatarUrl: avatarUrl || null };
  } catch (err) {
    console.warn('save.js: fetchAuthProfileForLeaderboard() error', err);
    return { displayName: null, avatarUrl: null };
  }
}

// save.js
export async function savePlayerToLeaderboardOnly() {
  if (!player?.YooAPoints || player.YooAPoints.lt?.(0)) return;

  try {
    const { default: leaderboard } = await import('./leaderboard.js');

    let meta = { displayName: null, avatarUrl: null };
    try {
      meta = await fetchAuthProfileForLeaderboard();
    } catch (e) {
      console.warn('savePlayerToLeaderboardOnly: meta fetch failed', e);
    }

    await leaderboard.savePlayerData(player.stats.General.totalPoints, {
      displayName: meta.displayName,
      avatarUrl: meta.avatarUrl
    });
  } catch (e) {
    console.warn('savePlayerToLeaderboardOnly failed:', e);
  }
}

export function save(click = false) {
  if (typeof offline !== "undefined" && offline.nosave) return;
  // Update player.time to current time before saving
  player.time = Date.now();
  // Strip reactivity and save player data, including tab state
  const strippedPlayer = deepCopy(player);
  if (strippedPlayer && typeof strippedPlayer === 'object') {
    strippedPlayer.gain = {}; // or delete strippedPlayer.gain;
  }
  localStorage.setItem("YooA", btoa(JSON.stringify(strippedPlayer)));

  // Save options data to localStorage
  const strippedOptions = deepCopy(options);
  localStorage.setItem("YooA_options", btoa(JSON.stringify(strippedOptions)));

  // Auto-save to leaderboard (async, don't block save)
  savePlayerToLeaderboardOnly()

  if (click) {
    const event = new CustomEvent('game-saved');
    window.dispatchEvent(event);
  }
}

// --- Legacy fixData (keeps previous behavior) ----------------------------

export function fixData(defaultData, newData) {
  for (let item in defaultData) {
    if (defaultData[item] == null) {
      if (newData[item] === undefined) newData[item] = null;
    } else if (Array.isArray(defaultData[item])) {
      if (newData[item] === undefined) newData[item] = defaultData[item];
      else fixData(defaultData[item], newData[item]);
    } else if (defaultData[item] instanceof Decimal) {
      if (newData[item] === undefined) newData[item] = new Decimal(defaultData[item].toString());
      else newData[item] = new Decimal(newData[item].toString());
    } else if (defaultData[item] instanceof Autobuyer) {
      if (newData[item] === undefined) newData[item] = new Autobuyer(defaultData[item].layer, defaultData[item].resetLayer, defaultData[item].name, defaultData[item].isOn, defaultData[item].mode, defaultData[item].amount, new Decimal(defaultData[item].time));
      else newData[item] = new Autobuyer(newData[item].layer, newData[item].resetLayer, newData[item].name, newData[item].isOn, newData[item].mode, newData[item].amount, new Decimal(newData[item].time));
      fixData(defaultData[item], newData[item]);
    } else if (defaultData[item] instanceof Dimension) {
      if (newData[item] === undefined) newData[item] = new Dimension(defaultData[item].type, defaultData[item].name, defaultData[item].amt, defaultData[item].level, defaultData[item].rank, defaultData[item].tier, defaultData[item].costDisp, defaultData[item].rankCostDisp, defaultData[item].layer, defaultData[item].currency, defaultData[item].rankLayer, defaultData[item].rankCurrency);
      else newData[item] = new Dimension(newData[item].type, newData[item].name, newData[item].amt, newData[item].level, newData[item].rank, newData[item].tier, newData[item].costDisp, newData[item].rankCostDisp, newData[item].layer, newData[item].currency, newData[item].rankLayer, newData[item].rankCurrency);
      fixData(defaultData[item], newData[item]);
    } else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
      if (newData[item] === undefined) {
        newData[item] = defaultData[item];
      } else {
        fixData(defaultData[item], newData[item]);
      }
    } else {
      if (newData[item] === undefined) newData[item] = defaultData[item];
    }

    if (item === "math" && newData[item]) {
      for (let layer in newData[item]) {
        if (newData[item][layer].showCorrect) {
          newData[item][layer].showCorrect = false;
          generateNewProblem(layer);
        }
      }
    }

    // Explicitly handle player.upgrades conversion here for all layers
    if (item === "upgrades" && newData[item]) {
      for (let layer in newData[item]) {
        for (let upgradeId in newData[item][layer]) {
          let upgrade = newData[item][layer][upgradeId];
          if (typeof upgrade === "string") {
            newData[item][layer][upgradeId] = new Decimal(upgrade);
          }
        }
      }
    }

    if (item === "challenges" && newData[item]) {
      for (let layer in newData[item]) {
        for (let challengeId in newData[item][layer]) {
          let challenge = newData[item][layer][challengeId];
          if (typeof challenge === "string") {
            newData[item][layer][challengeId] = new Decimal(challenge);
          }
        }
      }
    }
  }
}

export function fixSave() {
  let defaultData = getStartPlayer();
  fixData(defaultData, player);
}

// -------------------------------------------------------------------------
// Migration + load helpers
// -------------------------------------------------------------------------

const CURRENT_SAVE_VERSION = 2;

function isPlainObject(x) {
  return !!x && typeof x === "object" && x.constructor === Object;
}

function reviveDecimal(val) {
  if (val === null || val === undefined) return dZero;
  if (val instanceof Decimal) return val;
  // numbers and numeric strings
  if (typeof val === "number" || (typeof val === "string" && val !== "")) {
    try { return new Decimal(val); } catch (e) { return dZero; }
  }
  // try plain-object forms
  try {
    if (isPlainObject(val)) {
      if (typeof val.toString === "function") {
        try { return new Decimal(val.toString()); } catch (e) { /* fallthrough */ }
      }
      for (const k of Object.keys(val)) {
        const v = val[k];
        if (typeof v === "number" || (typeof v === "string" && v !== "")) {
          try { return new Decimal(v); } catch (e) { /* continue */ }
        }
      }
    }
  } catch (e) { /* ignore */ }
  return dZero;
}

// --- helpers for safe in-place merge (paste near reviveDecimal / clone helpers) ---

function looksNumericKey(key) {
  return /(amt|amount|level|rank|time|interval|bought|power|base|cost|tick|Arin|Arinium|YooA|YooAmatter|embers|Miracle|points|sparks)/i.test(key);
}

/**
 * Merge source -> target in-place.
 * - target is the reactive `player` object (or a nested object inside it).
 * - source is the migrated/normalized plain object (may contain Decimal instances).
 *
 * Rules:
 *  - If source value is a non-plain object (has a prototype other than Object.prototype)
 *    we assign it directly (this preserves Dimension/Autobuyer instances reconstructed earlier).
 *  - If target already contains a Decimal instance or the key looks numeric, reviveDecimal(source) is used.
 *  - For plain objects/arrays we recurse.
 */
function mergeIntoPlayer(target, source) {
  if (!source || typeof source !== 'object') return;

  for (const k of Object.keys(source)) {
    const sVal = source[k];
    const tVal = target[k];

    // If source is a complex instance (Dimension/Autobuyer/other class), assign directly.
    if (sVal && typeof sVal === 'object' && Object.getPrototypeOf(sVal) !== Object.prototype && !Array.isArray(sVal)) {
      target[k] = sVal;
      continue;
    }

    // If target already has a Decimal instance -> revive source into Decimal (if possible)
    if (tVal instanceof Decimal) {
      target[k] = reviveDecimal(sVal);
      continue;
    }

    // With this safer version:
    if (typeof sVal === 'number' || (typeof sVal === 'string' && sVal !== '' && !Number.isNaN(Number(sVal)))) {
      // revive to Decimal only if the target already expects a Decimal,
      // or the key strongly suggests a numeric/decimal field
      if (tVal instanceof Decimal || looksNumericKey(k)) {
        target[k] = reviveDecimal(sVal);
      } else {
        // keep primitive as-is (so correctAnswer stays a number)
        target[k] = sVal;
      }
      continue;
    }

    // Arrays: ensure target has an array, then merge entries
    if (Array.isArray(sVal)) {
      if (!Array.isArray(tVal)) target[k] = [];
      for (let i = 0; i < sVal.length; ++i) {
        const sv = sVal[i];
        const tv = (target[k] || [])[i];

        if (sv && typeof sv === 'object' && !Array.isArray(sv) && Object.getPrototypeOf(sv) === Object.prototype) {
          if (tv === undefined) target[k][i] = {};
          mergeIntoPlayer(target[k][i], sv);
        } else if (sv && typeof sv === 'object' && Array.isArray(sv)) {
          if (!Array.isArray(target[k][i])) target[k][i] = [];
          mergeIntoPlayer(target[k][i], sv);
        } else {
          // primitive: copy (revive if number-like)
          // change to (safer)
          if (tv instanceof Decimal || (typeof sv !== 'string' && typeof sv === 'number') || (typeof sv === 'string' && sv !== '' && !Number.isNaN(Number(sv)) && looksNumericKey(k))) {
            target[k][i] = reviveDecimal(sv);
          } else {
            target[k][i] = sv;
          }
        }
      }
      continue;
    }

    // Plain objects: ensure target object exists then recurse
    if (sVal && typeof sVal === 'object' && Object.getPrototypeOf(sVal) === Object.prototype) {
      if (!tVal || typeof tVal !== 'object') target[k] = {};
      mergeIntoPlayer(target[k], sVal);
      continue;
    }

    // Fallback: primitives (strings, booleans, etc.)
    target[k] = sVal;
  }
}

/**
 * Create an object that has the same prototype as prototypeInstance
 * and then patch saved primitive/state keys onto it.
 * - If prototype value for a key is a Decimal, attempt to revive saved value to Decimal.
 * - numericKeys: explicit list of keys to revive as Decimal
 */
function cloneWithPrototypeAndPatch(prototypeInstance, savedObj = {}, numericKeys = []) {
  const clone = Object.assign(Object.create(Object.getPrototypeOf(prototypeInstance)), prototypeInstance);

  if (!savedObj || typeof savedObj !== "object") return clone;

  const protoKeys = Object.keys(prototypeInstance);
  for (const k of Object.keys(savedObj)) {
    const savedVal = savedObj[k];

    // 1) If prototype has key and it's a Decimal there -> revive
    if (protoKeys.indexOf(k) !== -1) {
      try {
        const protoVal = prototypeInstance[k];
        if (protoVal instanceof Decimal) {
          clone[k] = reviveDecimal(savedVal);
          continue;
        }
      } catch (e) {
        // ignore and fallthrough
      }
    }

    // 2) explicit numeric key list
    if (numericKeys && numericKeys.indexOf(k) !== -1) {
      clone[k] = reviveDecimal(savedVal);
      continue;
    }

    // 3) heuristic: numeric-looking saved value and field-name suggests number
    if (typeof savedVal === "number" || (typeof savedVal === "string" && savedVal !== "" && !Number.isNaN(Number(savedVal)))) {
      const nameSuggestsNumeric = /(amt|amount|level|rank|time|interval|bought|power|base|cost)/i.test(k);
      if (protoKeys.indexOf(k) !== -1) {
        const protoVal = prototypeInstance[k];
        if (protoVal instanceof Decimal || nameSuggestsNumeric || (numericKeys && numericKeys.indexOf(k) !== -1)) {
          clone[k] = reviveDecimal(savedVal);
          continue;
        }
      } else if (nameSuggestsNumeric || (numericKeys && numericKeys.indexOf(k) !== -1)) {
        clone[k] = reviveDecimal(savedVal);
        continue;
      }
    }

    // 4) fallback: copy as-is
    clone[k] = savedVal;
  }

  return clone;
}

// --- Autobuyer normalization for migration ----------------------

/**
 * Normalize old rawPlayer.autobuyers into the schema produced by getStartAutobuyers().
 * Places saved autobuyers into the layer where the new prototype declares the same name,
 * or into the original layer if not found. Also copies prototype defaults for missing entries.
 *
 * This preserves saved primitive settings (isOn, mode, amount, time...) so later revive
 * will properly turn them into Autobuyer instances with revived Decimal fields.
 */
function normalizeAutobuyers(rawPlayer) {
  const freshAuto = getStartAutobuyers(); // canonical prototype
  const savedAuto = rawPlayer.autobuyers || {};

  // optional explicit renames map: {'old name': 'new name'} if you renamed any autobuyer keys.
  const legacyNameMap = {
    // example: "Old Autoname": "New Autoname",
    // add pairs here if you changed names between versions
  };

  // Prepare output with same layer keys as freshAuto
  const out = {};
  for (const L of Object.keys(freshAuto)) out[L] = {};

  // Helper to find layer that contains a given name in freshAuto
  function findLayerForName(name) {
    for (const L of Object.keys(freshAuto)) {
      if (freshAuto[L] && freshAuto[L][name] !== undefined) return L;
    }
    return null;
  }

  // Copy saved entries into the best-matching layer/name
  for (const oldLayer of Object.keys(savedAuto)) {
    const bucket = savedAuto[oldLayer];
    if (!bucket || typeof bucket !== 'object') continue;
    for (const rawName of Object.keys(bucket)) {
      const mappedName = legacyNameMap[rawName] ?? rawName;
      // prefer same-layer exact match
      if (freshAuto[oldLayer] && freshAuto[oldLayer][mappedName]) {
        out[oldLayer][mappedName] = bucket[rawName];
        continue;
      }
      // else search across layers for name
      const foundLayer = findLayerForName(mappedName);
      if (foundLayer) {
        out[foundLayer][mappedName] = bucket[rawName];
        continue;
      }
      // fallback: keep under original layer (preserve user's key)
      if (!out[oldLayer]) out[oldLayer] = {};
      out[oldLayer][mappedName] = bucket[rawName];
    }
  }

  // Ensure every prototype autobuyer has at least a placeholder entry in out
  for (const L of Object.keys(freshAuto)) {
    if (!out[L]) out[L] = {};
    for (const name of Object.keys(freshAuto[L])) {
      if (out[L][name] === undefined) {
        // don't deep-clone prototype now — reviveComplexInstances will handle reconstruction.
        // But put the prototype object so reviveComplexInstances can detect missing saved values.
        out[L][name] = freshAuto[L][name];
      }
    }
  }

  rawPlayer.autobuyers = out;
}


/**
 * Deep-merge defaults and revive decimals based on defaults' types.
 * defaultObj: canonical default structure (from getStartPlayer())
 * targetObj: incoming object to be filled/normalized
 */
function mergeDefaultsRecursive(defaultObj, targetObj) {
  // Decimal sentinel
  if (defaultObj instanceof Decimal) {
    return reviveDecimal(targetObj);
  }

  // Arrays
  if (Array.isArray(defaultObj)) {
    if (!Array.isArray(targetObj)) {
      return defaultObj.map((v, i) => (typeof v === 'object' ? mergeDefaultsRecursive(v, (targetObj && targetObj[i]) || undefined) : (targetObj && targetObj[i] !== undefined ? targetObj[i] : v)));
    }
    for (let i = 0; i < defaultObj.length; ++i) {
      if (targetObj[i] === undefined) {
        targetObj[i] = typeof defaultObj[i] === 'object' ? mergeDefaultsRecursive(defaultObj[i], undefined) : defaultObj[i];
      } else if (typeof defaultObj[i] === 'object') {
        targetObj[i] = mergeDefaultsRecursive(defaultObj[i], targetObj[i]);
      }
    }
    return targetObj;
  }

  // Plain objects
  if (isPlainObject(defaultObj)) {
    if (!isPlainObject(targetObj)) {
      const out = {};
      for (const k in defaultObj) {
        out[k] = mergeDefaultsRecursive(defaultObj[k], (targetObj && targetObj[k]) !== undefined ? targetObj[k] : undefined);
      }
      return out;
    }
    for (const k in defaultObj) {
      if (targetObj[k] === undefined) {
        targetObj[k] = mergeDefaultsRecursive(defaultObj[k], undefined);
      } else {
        targetObj[k] = mergeDefaultsRecursive(defaultObj[k], targetObj[k]);
      }
    }
    return targetObj;
  }

  // primitive fallback
  return targetObj === undefined ? defaultObj : targetObj;
}

/**
 * Recreate Dimension and Autobuyer instances from saved plain objects,
 * reviving Decimal fields when necessary.
 */
function reviveComplexInstances(rawPlayer) {
  const freshDims = getStartDimensions();
  rawPlayer.dimensions = rawPlayer.dimensions || {};

  for (const type in freshDims) {
    const protoList = freshDims[type];

    if (!Array.isArray(rawPlayer.dimensions[type])) rawPlayer.dimensions[type] = [];

    // expand missing dims
    if (rawPlayer.dimensions[type].length < protoList.length) {
      for (let i = rawPlayer.dimensions[type].length; i < protoList.length; ++i) {
        rawPlayer.dimensions[type][i] = cloneWithPrototypeAndPatch(protoList[i]);
      }
    }

    // For Dimensions, keys that should be Decimal
    const dimensionDecimalKeys = ["amt", "amount", "level", "rank", "baseAmount", "bought", "power"];

    for (let i = 0; i < protoList.length; ++i) {
      const saved = rawPlayer.dimensions[type][i] || {};
      const proto = protoList[i];

      const newDim = cloneWithPrototypeAndPatch(proto, saved, dimensionDecimalKeys);

      // Force canonical metadata (layer/currency/etc) from the canonical prototype.
      // This ensures dimension-layer routing and currency fields always match getStartDimensions()
      // regardless of older saved overrides.
      try {
        newDim.type = proto.type;
        newDim.name = proto.name;
        newDim.tier = proto.tier;
        newDim.costDisp = proto.costDisp;
        newDim.rankCostDisp = proto.rankCostDisp;
        newDim.layer = proto.layer;
        newDim.currency = proto.currency;
        newDim.rankLayer = proto.rankLayer;
        newDim.rankCurrency = proto.rankCurrency;
      } catch (e) {
        // If any of these are missing on proto for some reason, ignore — it's non-fatal.
      }

      // copy unknown fields from saved so we don't drop extra data, but avoid
      // overwriting canonical fields (they're already forced above).
      for (const k in saved) {
        if (!dimensionDecimalKeys.includes(k) && !(k in proto)) newDim[k] = saved[k];
      }

      rawPlayer.dimensions[type][i] = newDim;
    }
  }

  // Autobuyers
  const freshAuto = getStartAutobuyers();
  rawPlayer.autobuyers = rawPlayer.autobuyers || {};

  // Autobuyer numeric keys that may be Decimal-like
  const autobuyerDecimalKeys = ["amount", "time", "tickTime", "interval", "timeToNextTick"];

  for (const layer in freshAuto) {
    if (!rawPlayer.autobuyers[layer] || !isPlainObject(rawPlayer.autobuyers[layer])) rawPlayer.autobuyers[layer] = {};
    for (const name in freshAuto[layer]) {
      const proto = freshAuto[layer][name];
      const saved = rawPlayer.autobuyers[layer][name];

      if (!saved) {
        rawPlayer.autobuyers[layer][name] = proto;
        continue;
      }

      // If saved already an instance with correct prototype, keep but fill missing keys
      if (!isPlainObject(saved) && Object.getPrototypeOf(saved) === Object.getPrototypeOf(proto)) {
        for (const k in proto) if (saved[k] === undefined) saved[k] = proto[k];
        rawPlayer.autobuyers[layer][name] = saved;
        continue;
      }

      // else reconstruct
      const newAuto = cloneWithPrototypeAndPatch(proto, saved, autobuyerDecimalKeys);

      // force canonical routing metadata from prototype (layer/resetLayer/name)
      try {
        newAuto.layer = proto.layer;
        newAuto.resetLayer = proto.resetLayer;
        newAuto.name = proto.name;
      } catch (e) {
        // ignore
      }

      // copy safe primitives & plain objects
      for (const k in saved) {
        const v = saved[k];
        if (v === null || typeof v === "number" || typeof v === "string" || typeof v === "boolean" || Array.isArray(v)) newAuto[k] = v;
        else if (isPlainObject(v)) newAuto[k] = v;
      }

      rawPlayer.autobuyers[layer][name] = newAuto;
    }
  }
}

// ---------------- Main migration function ---------------------------------

export function migrateSave(rawPlayer) {
  if (!rawPlayer) return getStartPlayer(); // no save: fine to return fresh
  if (!isPlainObject(rawPlayer)) {
    // if it's not a plain object, prefer to return it as-is so load() can attempt merge
    // this avoids throwing away progress during unexpected shapes
    return rawPlayer;
  }

  rawPlayer.version = rawPlayer.version ?? 0;

  const fresh = getStartPlayer();

  // Normalize gain/gains naming (safety)
  if (!rawPlayer.gain && rawPlayer.gains) rawPlayer.gain = rawPlayer.gains;
  else if (!rawPlayer.gains && rawPlayer.gain) rawPlayer.gains = rawPlayer.gain;
  rawPlayer.gain = rawPlayer.gain || (fresh.gain || {});
  rawPlayer.gains = rawPlayer.gains || (fresh.gain || {});

  // Ensure top-level keys exist
  for (const key in fresh) {
    if (rawPlayer[key] === undefined) rawPlayer[key] = fresh[key];
  }

  // -----------------------
  // Ensure upgrades/milestones/challenges structure
  // -----------------------
  for (const section of ["upgrades", "milestones", "challenges"]) {
    rawPlayer[section] = rawPlayer[section] || {};
    for (const layer in fresh[section]) {
      if (rawPlayer[section][layer] === undefined) rawPlayer[section][layer] = fresh[section][layer];
    }
  }

  // ---------------------------------------------------------------------
  // IMPORTANT FIX: revive numeric upgrade / challenge values into Decimal
  // ---------------------------------------------------------------------
  // Upgrades should be Decimal levels (not plain numbers). Older saves may
  // store them as numbers or numeric-strings. Convert them here.
  if (rawPlayer.upgrades) {
    for (const layer in rawPlayer.upgrades) {
      const uLayer = rawPlayer.upgrades[layer] || {};
      for (const id in uLayer) {
        const v = uLayer[id];
        // skip booleans (some upgrades might be flags); convert numeric-like to Decimal
        if (v instanceof Decimal) continue;
        if (typeof v === 'boolean' || v === null || v === undefined) continue;
        rawPlayer.upgrades[layer][id] = reviveDecimal(v);
      }
    }
  }

  // Do the same for challenges if you expect numeric completion counts or levels
  if (rawPlayer.challenges) {
    for (const layer in rawPlayer.challenges) {
      const cLayer = rawPlayer.challenges[layer] || {};
      for (const id in cLayer) {
        const v = cLayer[id];
        if (v instanceof Decimal) continue;
        if (typeof v === 'boolean' || v === null || v === undefined) continue;
        rawPlayer.challenges[layer][id] = reviveDecimal(v);
      }
    }
  }

  // Milestones are often boolean flags — leave them as-is unless you used numbers for them.

  // Math: revive decimals where defaults indicate
  rawPlayer.math = rawPlayer.math || {};
  for (const layer in fresh.math) {
    rawPlayer.math[layer] = rawPlayer.math[layer] || {};
    for (const key in fresh.math[layer]) {
      if (rawPlayer.math[layer][key] === undefined) {
        rawPlayer.math[layer][key] = fresh.math[layer][key];
      } else if (fresh.math[layer][key] instanceof Decimal) {
        rawPlayer.math[layer][key] = reviveDecimal(rawPlayer.math[layer][key]);
      }
    }
  }

  // Stats: revive Decimal fields
  rawPlayer.stats = rawPlayer.stats || {};
  for (const layer in fresh.stats) {
    rawPlayer.stats[layer] = rawPlayer.stats[layer] || {};
    for (const key in fresh.stats[layer]) {
      if (rawPlayer.stats[layer][key] === undefined) rawPlayer.stats[layer][key] = fresh.stats[layer][key];
      else if (fresh.stats[layer][key] instanceof Decimal) rawPlayer.stats[layer][key] = reviveDecimal(rawPlayer.stats[layer][key]);
    }
  }

  // Dimensions & Autobuyers reconstruction
  try {
    // remap any legacy autobuyer layout into canonical schema so we keep user settings
    try {
      normalizeAutobuyers(rawPlayer);
    } catch (e) {
      console.warn("normalizeAutobuyers failed — continuing with raw autobuyers:", e);
    }

    reviveComplexInstances(rawPlayer);
  } catch (e) {
    console.warn("reviveComplexInstances failed:", e);
    rawPlayer.dimensions = getStartDimensions();
    rawPlayer.autobuyers = getStartAutobuyers();
  }

  // Legacy Arin structure fix
  // Old saves used a single Decimal for Arin (Arin level). New saves expect an object:
  // Arin: { level: Decimal, rank: Decimal, tier: Decimal, Arinium: Decimal }
  if (rawPlayer.Arin === undefined || rawPlayer.Arin === null) {
    rawPlayer.Arin = Object.assign({}, fresh.Arin);
  } else if (rawPlayer.Arin instanceof Decimal || typeof rawPlayer.Arin === 'number' || (typeof rawPlayer.Arin === 'string' && rawPlayer.Arin !== '')) {
    // convert old scalar Arin -> new object with level preserved
    rawPlayer.Arin = Object.assign({}, fresh.Arin, { level: reviveDecimal(rawPlayer.Arin) });
  } else if (!isPlainObject(rawPlayer.Arin) || Array.isArray(rawPlayer.Arin)) {
    // weird shape -> use canonical
    rawPlayer.Arin = Object.assign({}, fresh.Arin);
  } else {
    // plain object: fill missing keys and revive numeric fields
    for (const k in fresh.Arin) if (rawPlayer.Arin[k] === undefined) rawPlayer.Arin[k] = fresh.Arin[k];
    for (const k in rawPlayer.Arin) {
      if (fresh.Arin[k] instanceof Decimal) {
        rawPlayer.Arin[k] = reviveDecimal(rawPlayer.Arin[k]);
      }
    }
  }

  // Ensure any missing primitive top-level keys
  for (const key in fresh) {
    if (rawPlayer[key] === undefined) rawPlayer[key] = fresh[key];
  }

  // Revive commonly numeric top-level fields to Decimal so nothing becomes a plain number/string.
  const topNumericKeys = ['YooAPoints', 'time'];
  for (const k of topNumericKeys) {
    if (rawPlayer[k] !== undefined && !(rawPlayer[k] instanceof Decimal)) rawPlayer[k] = reviveDecimal(rawPlayer[k]);
  }

  // YooAmatter nested numeric revival (old saves may have strings/numbers)
  if (rawPlayer.YooAmatter) {
    rawPlayer.YooAmatter.amount = reviveDecimal(rawPlayer.YooAmatter.amount);
    rawPlayer.YooAmatter.YooArium = reviveDecimal(rawPlayer.YooAmatter.YooArium);
    rawPlayer.YooAmatter.sparks = reviveDecimal(rawPlayer.YooAmatter.sparks);
  }


  // Per-version migrations (extend as needed)
  if ((rawPlayer.version ?? 0) < 1) {
    // example migration placeholder
    if (rawPlayer.oldName !== undefined && rawPlayer.newName === undefined) {
      rawPlayer.newName = rawPlayer.oldName;
      delete rawPlayer.oldName;
    }
  }

  // Bump to current version
  if (rawPlayer.version < CURRENT_SAVE_VERSION) rawPlayer.version = CURRENT_SAVE_VERSION;

  return rawPlayer;
}

export function loadOldVersion(rawPlayer) {
  try {
    return migrateSave(rawPlayer);
  } catch (e) {
    console.error("Save migration failed; returning rawPlayer (if available) to avoid reset:", e);
    // If we cannot migrate, return raw player (not a fresh player) so later mergeIntoPlayer
    // can attempt to apply the raw fields without wiping progress.
    return rawPlayer || getStartPlayer();
  }
}


// applyDefaultsToPlayer: merges raw onto canonical player structure
function applyDefaultsToPlayer(raw) {
  const base = getStartPlayer();
  const merged = mergeDefaultsRecursive(base, raw);
  return merged;
}

// ---------------- Load / Import / Export / HardReset -----------------------

export function load() {
  const saved = localStorage.getItem("YooA");
  if (!saved) {
    // No save: start fresh
    Object.assign(player, getStartPlayer());
  } else {
    try {
      let raw = JSON.parse(atob(saved));
      raw = loadOldVersion(raw);
      const final = applyDefaultsToPlayer(raw);
      // Instead of replacing the reactive player object wholesale, merge into it in-place
      try {
        mergeIntoPlayer(player, final);
        // ensure any new top-level keys that did not exist are added (shallow)
        for (const k of Object.keys(final)) if (player[k] === undefined) player[k] = final[k];
        if (!player.tab) player.tab = "Main";
      } catch (e) {
        console.error("In-place merge failed; falling back to replace assignment:", e);
        Object.keys(player).forEach(k => delete player[k]);
        Object.assign(player, final);
        if (!player.tab) player.tab = "Main";
      }

    } catch (e) {
      // Previously we reset to a fresh player here; that can lose progress.
      // Now we preserve the existing in-memory `player` and log the error for debugging.
      console.error("Failed to parse or migrate save; preserving current in-memory player. Error:", e);
      // Optionally: attempt to merge defaults onto the existing player to ensure required keys exist:
      try {
        const merged = applyDefaultsToPlayer(player);
        Object.keys(player).forEach(k => delete player[k]);
        Object.assign(player, merged);
      } catch (mergeErr) {
        // If even merging the in-memory player fails, fallback to a fresh player.
        console.error("Failed to apply defaults to in-memory player; falling back to fresh. Error:", mergeErr);
        Object.assign(player, getStartPlayer());
      }
    }
  }

  // options
  const optSaved = localStorage.getItem("YooA_options");
  if (!optSaved) {
    Object.assign(options, getStartOptions());
  } else {
    try {
      let rawOpt = JSON.parse(atob(optSaved)) || {};
      const baseOpt = getStartOptions();
      const mergedOpt = mergeDefaultsRecursive(baseOpt, rawOpt);
      Object.keys(options).forEach(k => delete options[k]);
      Object.assign(options, mergedOpt);
    } catch (e) {
      console.warn("Failed to load options; using defaults.", e);
      Object.assign(options, getStartOptions());
    }
  }

  // start loop / simulate offline unchanged below
  setTimeout(() => {
    const offline_t = (Date.now() - (player.time || Date.now())) / 1000;
    gameLoop();
    if (options && options.offline) {
      try { simulateOffline(offline_t); } catch (e) { /* simulateOffline may be defined elsewhere */ }
    }
    setInterval(gameLoop, 1000 / 60);
  }, 100);
}

export function importSave(imported = undefined) {
  if (imported === undefined) imported = prompt("Paste your save here");
  try {
    const parsed = JSON.parse(atob(imported));
    if (parsed.player && parsed.options) {
      // Migrate & revive the saved player
      const raw = loadOldVersion(parsed.player);
      const finalPlayer = applyDefaultsToPlayer(raw);

      // FULL REPLACE (user expects imported save to overwrite current progress)
      try {
        // wipe reactive player in-place, then assign revived finalPlayer
        Object.keys(player).forEach(k => delete player[k]);
        Object.assign(player, finalPlayer);
      } catch (e) {
        // extremely unlikely, but if assignment fails fallback to per-key copy
        console.error("Full replace assignment failed; attempting per-key copy:", e);
        for (const k of Object.keys(finalPlayer)) player[k] = finalPlayer[k];
      }

      // merge options the same safe way as before
      const rawOpt = parsed.options ?? {};
      const mergedOpt = mergeDefaultsRecursive(getStartOptions(), rawOpt);
      Object.keys(options).forEach(k => delete options[k]);
      Object.assign(options, mergedOpt);

      save(); // persist the now-replaced save
      window.dispatchEvent(new CustomEvent('import-completed'));

      // reload so UI & any cached prototypes pick up new state
      setTimeout(() => window.location.reload(), 1000);
    } else {
      throw new Error("Invalid save format.");
    }
  } catch (e) {
    console.error(e);
    alert("Import failed: Invalid save data.");
  }
}

export function exportSave() {
  const saveData = { player: player, options: options };
  let str = btoa(JSON.stringify(saveData));
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(el);
  window.dispatchEvent(new CustomEvent('export-completed'));
  return str;
}

export function hardReset() {
  if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return;
  Object.assign(player, getStartPlayer());
  Object.assign(options, getStartOptions());
  save();
  window.location.reload();
}

// --- Dev helper: scan for raw numbers where Decimals expected ------------
// Use during development to find any remaining plain numbers in player.
export function scanForNumbers(root = player, path = "") {
  for (const k in root) {
    const v = root[k];
    const full = path ? `${path}.${k}` : k;
    if (v === null || v === undefined) continue;
    if (v instanceof Decimal) continue;
    if (typeof v === "number") {
      console.warn("Found plain number at", full, v);
    } else if (Array.isArray(v)) {
      for (let i = 0; i < v.length; ++i) {
        if (typeof v[i] === 'number') console.warn("Found plain number in array", `${full}[${i}]`, v[i]);
        else if (typeof v[i] === 'object') scanForNumbers(v[i], `${full}[${i}]`);
      }
    } else if (typeof v === "object") {
      scanForNumbers(v, full);
    }
  }
}
