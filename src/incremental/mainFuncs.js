/*
  mainFuncs.js
*/

import Decimal from "./break_eternity.js";
import { player, inAnyChallenge } from "./incremental.js";
import { generateNewProblem } from "@/components/comps/MathProblem.vue";
import { resetAllDimensions } from "./dimensions.js";
import { resetAllAutobuyerTime } from "./automation.js";
import { gameLayers } from "./layersData.js";

// Cached Decimal constants
const dZero = Decimal.dZero;
const dOne = Decimal.dOne;
const D_HUGE = new Decimal(1e100);

// One-time metadata caches
let UpgMeta = null;    // { layer: { id: metaObj } }
let LayerNoCost = null; // { layer: bool }
let ChallMeta = null;  // { layer: { id: metaObj } }

// Build upgrade meta once (cheap to call repeatedly)
export function initUpgradeMeta() {
  if (UpgMeta) return;
  UpgMeta = {};
  LayerNoCost = {};

  // iterate layers
  const glKeys = Object.keys(gameLayers);
  for (let i = 0; i < glKeys.length; ++i) {
    const layer = glKeys[i];
    const gLayer = gameLayers[layer] || {};
    const upgs = gLayer.upgrades || {};

    LayerNoCost[layer] = !!(gLayer.upgrades && typeof gLayer.upgrades.costsNothing === "function" ? gLayer.upgrades.costsNothing() : false);

    const layerMap = {};
    const upgKeys = Object.keys(upgs);
    for (let j = 0; j < upgKeys.length; ++j) {
      const id = upgKeys[j];
      const u = upgs[id];
      layerMap[id] = {
        maxLvlFunc: typeof u.maxLvl === "function" ? u.maxLvl : (() => u.maxLvl),
        costFunc: typeof u.cost === "function" ? u.cost : (() => u.cost),
        invCostFunc: typeof u.invCost === "function" ? u.invCost : null,
        costLayer: u.costLayer,
        costInternal: u.costInternal,
        onBuy: u.onBuy,
        firstCost: u.firstCost,
        _upgradeObj: u
      };
    }
    UpgMeta[layer] = layerMap;
  }
}

export function initChallengeMeta() {
  if (ChallMeta) return;
  ChallMeta = {};
  const glKeys = Object.keys(gameLayers);
  for (let i = 0; i < glKeys.length; ++i) {
    const layer = glKeys[i];
    const chs = (gameLayers[layer] && gameLayers[layer].challenges) || {};
    const layerMap = {};
    const chKeys = Object.keys(chs);
    for (let j = 0; j < chKeys.length; ++j) {
      const id = chKeys[j];
      const c = chs[id];
      layerMap[id] = {
        maxLvl: typeof c.maxLvl === "function" ? c.maxLvl : (() => c.maxLvl),
        goal: typeof c.goal === "function" ? c.goal : (() => c.goal),
        goalLayer: c.goalLayer,
        goalInternal: c.goalInternal,
        _challengeObj: c
      };
    }
    ChallMeta[layer] = layerMap;
  }
}

export function precomputeMeta() {
  initUpgradeMeta();
  initChallengeMeta();
}

// -------- path helpers (lightweight, avoids split every use) --------
function _resolveParentForPath(baseObj, path, create = false) {
  if (!path) return { parent: baseObj, key: undefined };
  const parts = String(path).split(".");
  let parent = baseObj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (parent[p] == null) {
      if (create) parent[p] = {};
      else return { parent: undefined, key: undefined };
    }
    parent = parent[p];
  }
  return { parent, key: parts[parts.length - 1] };
}

function getByPath(baseObj, path) {
  const { parent, key } = _resolveParentForPath(baseObj, path, false);
  if (!parent) return dZero;
  return parent[key] ?? dZero;
}

function setByPath(baseObj, path, value) {
  const { parent, key } = _resolveParentForPath(baseObj, path, true);
  parent[key] = value;
}

// -----------------------------
// Lightweight hot helpers
// -----------------------------
export function getUpgLevels(layer, id) {
  return player.upgrades[layer]?.[id] || dZero;
}

export function isUpgradeUnlocked(layer, id) {
  return UpgMeta[layer]?.[id]?._upgradeObj?.unlocked ? UpgMeta[layer][id]._upgradeObj.unlocked() : true;
}

// canAffordUpgrade — now direct compute (no tick cache)
export function canAffordUpgrade(layer, id) {
  initUpgradeMeta();
  const metaLayer = UpgMeta[layer];
  if (!metaLayer) return false;
  const meta = metaLayer[id];
  if (!meta) return false;

  const lvl = getUpgLevels(layer, id);
  const maxL = meta.maxLvlFunc ? meta.maxLvlFunc() : undefined;
  if (maxL && lvl.gte(maxL)) return false;

  const cost = meta.costFunc ? meta.costFunc() : dZero;

  const curr = meta.costLayer
    ? getByPath(player[meta.costLayer], meta.costInternal)
    : getByPath(player, meta.costInternal);

  return curr.gte(cost);
}

// buyUpgrade — optimized, direct compute
export function buyUpgrade(layer, id) {
  if (!canAffordUpgrade(layer, id) || !isUpgradeUnlocked(layer, id)) return;
  const meta = UpgMeta[layer][id];
  const lvl = getUpgLevels(layer, id);
  const maxL = meta.maxLvlFunc ? meta.maxLvlFunc() : undefined;

  // Deduct once (use direct cost)
  const costLayer = meta.costLayer;
  const costInternal = meta.costInternal;
  let curr = costLayer ? getByPath(player[costLayer], costInternal) : getByPath(player, costInternal);

  if (!LayerNoCost[layer]) {
    const cost = meta.costFunc ? meta.costFunc() : dZero;
    const newCurr = curr.sub(cost).max(dZero);
    if (costLayer) setByPath(player[costLayer], costInternal, newCurr);
    else setByPath(player, costInternal, newCurr);
  }

  // Update level (batch assign)
  const upgrades = player.upgrades;
  if (!upgrades[layer]) upgrades[layer] = {};
  upgrades[layer][id] = lvl.eq(dZero) ? dOne : (maxL ? Decimal.min(lvl.add(dOne), maxL) : lvl.add(dOne));

  if (meta.onBuy) meta.onBuy();
}

// buyMaxUpgrade — optimized bulk buy (direct compute)
export function buyMaxUpgrade(layer, id) {
  if (!canAffordUpgrade(layer, id) || !isUpgradeUnlocked(layer, id)) return;
  const meta = UpgMeta[layer][id];
  const lvl = getUpgLevels(layer, id);
  const maxL = meta.maxLvlFunc ? meta.maxLvlFunc() : undefined;

  // Fast path for single-level upgrades
  if (maxL && maxL.eq(dOne)) { buyUpgrade(layer, id); return; }

  const noCost = LayerNoCost[layer];
  const costLayer = meta.costLayer;
  const costInternal = meta.costInternal;
  let curr = costLayer ? getByPath(player[costLayer], costInternal) : getByPath(player, costInternal);

  const bulk = bulkBuyBinarySearch(
    curr,
    {
      costFunction: meta.costFunc,
      invCostFunction: meta.invCostFunc || null,
      cumulative: !noCost,
      maxLevel: meta.maxLvlFunc,
      firstCost: meta.firstCost
    },
    lvl
  );

  if (!bulk || bulk.quantity.lte(0)) return;

  if (!noCost) {
    curr = curr.sub(bulk.purchasePrice).max(dZero);
    if (costLayer) setByPath(player[costLayer], costInternal, curr);
    else setByPath(player, costInternal, curr);
  }

  const upgrades = player.upgrades;
  if (!upgrades[layer]) upgrades[layer] = {};
  let newLvl = lvl.add(bulk.quantity).floor();
  if (maxL && newLvl.gt(maxL)) newLvl = maxL;
  upgrades[layer][id] = newLvl;

  if (meta.onBuy) meta.onBuy();
}

// quick wrappers
// upgradeEffect — direct compute (no per-tick memo)
export function upgradeEffect(layer, id) {
  // try cache (returns value or undefined)
  const cached = GameCache.getCached([layer, 'upg', String(id), 'effect']);
  if (cached !== undefined) return cached;

  // fallback: call the original function (unchanged behavior)
  const u = gameLayers[layer]?.upgrades?.[id];
  return u?.effect ? u.effect() : dZero;
}
export function hasUpgrade(layer, id) { return getUpgLevels(layer, id).gte(dOne); }
export function hasMilestone(layer, id) { return !!player.milestones[layer]?.[id]; }
// milestoneEffect — prefer cache, fall back
export function milestoneEffect(layer, id) {
  const cached = GameCache.getCached([layer, 'milestone', String(id), 'effect']);
  if (cached !== undefined) return cached;

  const m = gameLayers[layer]?.milestones?.[id];
  return m?.effect ? m.effect() : dZero;
}

// ------------------ Prestige ------------------
const MIN_PRESTIGE_TIME = new Decimal(0);
export function prestige(layer, isChall) {
  const layerDef = gameLayers[layer];
  if (!layerDef) return;
  const gain = layerDef.getResetGain();
  const prestigeGain = layerDef.getPrestigesGain ? layerDef.getPrestigesGain() : dOne;

  if (!gain.gt(0) && !isChall) return;

  const layerStats = player.stats[layer];
  const playerLayer = player[layer];
  const layerTier = layerDef.layer;

  if (!layerStats.time || typeof layerStats.time.eq !== 'function') layerStats.time = dZero;

  if (!isChall && layerStats.time.lte(MIN_PRESTIGE_TIME)) return;

  const priorTime = layerStats.time;
  const newLayerAmount = playerLayer.amount.add(gain);
  const newResets = layerStats.resets.add(prestigeGain);
  const newTotalAmount = layerStats.totalAmount.add(gain);

  playerLayer.amount = newLayerAmount;
  layerStats.resets = newResets;
  layerStats.totalAmount = newTotalAmount;

  // record brief last prestige summary (capped at 10)
  const lp = player.stats.last_prestiges[layer];
  if (Array.isArray(lp)) {
    lp.pop(); lp.unshift({ resetTime: priorTime, amtGain: gain, resetsGain: prestigeGain });
  }

  if (priorTime.lt(layerStats.bestTime)) layerStats.bestTime = priorTime;
  if (priorTime.lt(layerStats.bestTimeThisReset)) layerStats.bestTimeThisReset = priorTime;
  layerStats.time = dZero;

  // Batch resets (only fields changed)
  player.YooAPoints = dZero;
  player.upgrades.YooA = {};
  player.math.YooA.solved = dZero;
  player.YooAmatter.sparks = dZero;
  generateNewProblem("YooA");

  if (layerTier > 1) {
    player.YooAmatter.amount = dZero;
    player.YooAmatter.YooArium = dZero;
    player.YooAity.embers = dZero;
    player.Arin.level = dZero;
    player.YooAity.MiracleLight = dZero;
    player.upgrades.YooAmatter = {};
    player.upgrades.sparks = {};
    player.math.YooAmatter.solved = dZero;
    player.stats.YooAmatter.resets = dZero;
    player.stats.YooAmatter.bestTimeThisReset = D_HUGE;
    player.stats.YooAmatter.time = dZero;
    if (!hasMilestone("YooAity", 7)) player.challenges.YooAmatter = {};
    player.stats.last_prestiges.YooAmatter = Array(10).fill(null);
    generateNewProblem("YooAmatter");

    if (hasMilestone("YooAity", 5)) player.upgrades.YooAmatter[34] = dOne;
  }

  // cached upgrade checks (direct calls)
  const hasYM21 = hasUpgrade("YooAmatter", 21);
  const hasYM14 = hasUpgrade("YooAmatter", 14);
  const hasYM34 = hasUpgrade("YooAmatter", 34);
  const hasYA13 = hasUpgrade("YooAity", 13);
  const hasYA14 = hasUpgrade("YooAity", 14);

  if (!inAnyChallenge()) {
    if (hasYM21) player.math.YooA.solved = new Decimal(1000);
    else if (hasYM14) player.math.YooA.solved = new Decimal(300);
  }
  if (hasYM34) player.upgrades.YooA[21] = dOne;
  if (hasYA13) player.upgrades.YooAmatter[23] = dOne;
  if (hasYA14) player.upgrades.YooAmatter[42] = dOne;

  // Reset dims & autobuyers
  resetAllDimensions(player.dimensions.YooA, layer);
  resetAllDimensions(player.dimensions.YooAmatter, layer);
  resetAllDimensions(player.dimensions.Shiah, layer);
  resetAllAutobuyerTime(player.autobuyers.YooA);
  if (layerTier > 1) resetAllAutobuyerTime(player.autobuyers.YooAmatter);

  window.dispatchEvent(new CustomEvent("GAME_EVENT.PRESTIGE_UPDATE"));
}

// ------------------ Challenges ------------------
export function getChallLevels(layer, id) { return player.challenges[layer]?.[id] || dZero; }

export function canCompleteChallenge(layer, id) {
  initChallengeMeta();
  const meta = ChallMeta[layer]?.[id];
  if (!meta) return false;

  const lvlCurrent = getChallLevels(layer, id);
  const lvlMax = (meta.maxLvl ? meta.maxLvl() : undefined) ?? Decimal.dInf;
  if (lvlCurrent.gte(lvlMax)) return false;

  const goalVal = meta.goal ? meta.goal() : dZero;
  const have = meta.goalLayer
    ? getByPath(player[meta.goalLayer], meta.goalInternal)
    : getByPath(player, meta.goalInternal);

  return have.gte(goalVal);
}

export function hasChallenge(layer, id) { return getChallLevels(layer, id).gte(dOne); }

export function inChallenge(layer, id) {
  return String(player.inChallenge[0]) === String(layer) && String(player.inChallenge[1]) === String(id);
}

export function completeChallenge(layer, id) {
  if (!canCompleteChallenge(layer, id)) return;
  initChallengeMeta();
  const meta = ChallMeta[layer][id];

  player.inChallenge = ["", ""];
  window.dispatchEvent(new CustomEvent("challenge-completed", { detail: `${gameLayers[layer].challenges[id].title} completed!` }));

  prestige(layer);

  player.challenges[layer] ||= {};
  const cur = getChallLevels(layer, id);
  const mx = meta.maxLvl ? meta.maxLvl() : Decimal.dInf;
  player.challenges[layer][id] = cur.add(1).min(mx);
}

// challengeEffect — prefer cache, fall back
export function challengeEffect(layer, id) {
  // If you registered challenges (see note below), then use cached value:
  const cached = GameCache.getCached([layer, 'challenge', String(id), 'rewardEffect']);
  if (cached !== undefined) return cached;

  // Fallback to original
  const c = gameLayers[layer]?.challenges?.[id];
  return c?.rewardEffect ? c.rewardEffect() : dZero;
}

// exitOrComplete (keeps confirmation behaviour)
export function exitOrComplete(layer, id, con = options.confirmations?.YooAmatter) {
  if (!canCompleteChallenge(layer, id)) {
    if (con) {
      const msg = `If you exit now without reaching the goal, you will reset for ${layer} and lose any chance of earning rewards. Your progress will be lost. Are you sure you want to exit the Challenge?`;
      if (window.confirm(msg)) {
        player.inChallenge = ["", ""]; prestige(layer, true);
      }
    } else {
      player.inChallenge = ["", ""]; prestige(layer, true);
    }
  } else {
    completeChallenge(layer, id);
  }
}
