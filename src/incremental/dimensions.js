// 🌸 YooA's Performance Patch for Dimension Module (cache-enabled)
import Decimal from "./break_eternity.js";
import {
  gainCurrency,
  hasAchievement
} from "./incremental.js";
import { gameLayers } from "./layersData.js";
import { hasMilestone, hasUpgrade, inChallenge, upgradeEffect } from "./mainFuncs.js";
import { Lazy, GameCache } from "./cache.js"; // <- added cache primitives

// Local aliases (fewer property lookups)
const dZero = Decimal.dZero;
const dOne = Decimal.dOne;
const dInf = Decimal.dInf;
const floor = Decimal.floor;
const min = Decimal.min;

// micro-optimized duck-typed Decimal check (faster than instanceof)
function isDecimalLike(v) {
  return v && typeof v.eq === "function";
}

// --------------------
// Module-level constants (avoid re-allocating Decimals repeatedly)
const CONST_1_01 = new Decimal(1.01);
const CONST_1_5 = new Decimal(1.5);
const CONST_2 = new Decimal(2);
const CONST_1_05 = new Decimal(1.05);
const CONST_0_9 = new Decimal(0.9);
const CONST_0_99 = new Decimal(0.99);
const CONST_0_98 = new Decimal(0.98);
const CONST_0_95 = new Decimal(0.95);
const CONST_0_0001 = new Decimal(0.0001);
const CONST_10 = new Decimal(10);
const CONST_100 = new Decimal(100);
const HUGE = new Decimal(1e100);

// Provided by user — keep as-is (already pre-created Decimals)
const LEVEL_SCALE_THRESHOLD = {
  YooA: new Decimal(1e4),
  YooAmatter: new Decimal(1e4),
  Shiah: new Decimal(123456789)
};

const BASE_COSTS = {
  YooA: [null, new Decimal(10), new Decimal(10000), new Decimal(10), new Decimal(1e5), new Decimal(1e10)],
  YooAmatter: [null, new Decimal("1e150"), new Decimal("1e250"), new Decimal("e400"), new Decimal("e700"), new Decimal("e1400")],
  Shiah: [null, new Decimal(1), new Decimal(100), new Decimal(1e4), new Decimal(1e10), new Decimal(1e25), new Decimal(1e50), new Decimal(1e100)],
};

const COST_MULTS = {
  YooA: [null, new Decimal(1.15), new Decimal(1.5), new Decimal(1.1), new Decimal(1.4), new Decimal(2)],
  YooAmatter: [null, new Decimal(1e5), new Decimal(1e10), new Decimal(1e20), new Decimal(1e30), new Decimal(1e50)],
  Shiah: [null, new Decimal(2), new Decimal(3), new Decimal(4), new Decimal(10), new Decimal(50), new Decimal(1995), new Decimal(1e5)],
};

const RANK_BASE_COSTS = {
  YooA: [null, new Decimal(1e6), new Decimal(1e10), new Decimal(1e20), new Decimal(1e50), new Decimal(1e100)],
  YooAmatter: [null, new Decimal("1e150"), new Decimal("1e250"), new Decimal("e400"), new Decimal("e700"), new Decimal("e1400")],
  Shiah: [null, new Decimal(1), new Decimal(100), new Decimal(1e4), new Decimal(1e10), new Decimal(1e25), new Decimal(1e50), new Decimal(1e100)],
};

const RANK_COST_MULTS = {
  YooA: [null, new Decimal(1.1), new Decimal(1.13), new Decimal(1.2), new Decimal(1.25), new Decimal(1.3)],
  YooAmatter: [null, new Decimal(1e5), new Decimal(1e10), new Decimal(1e20), new Decimal(1e30), new Decimal(1e50)],
  Shiah: [null, new Decimal(2), new Decimal(3), new Decimal(4), new Decimal(10), new Decimal(50), new Decimal(1995), new Decimal(1e5)],
};

// --------------------
// Lightweight helpers (cached local references)
const _hasMilestone = hasMilestone;
const _hasUpgrade = hasUpgrade;
const _upgradeEffect = upgradeEffect;
const _inChallenge = inChallenge;

// cheap cached booleans per tick replaced with direct calls (tickCache removed)
function costNothing(type) {
  switch(type) {
    case "YooA": return !!_hasMilestone("YooAity", 11);
    case "YooAmatter": return !!_hasMilestone("YooAity", 12);
    case "Shiah": return !!_hasMilestone("YooAity", 19);
    default: return false;
  }
}
function rankCostNothing(type) {
  return type === "YooA" && !!_hasUpgrade("Hyojung", 21);
}

const _resetLayerMap = { YooA: 0, YooAmatter: 1, Shiah: 2 };
function getResetLayer(type) {
  return _resetLayerMap[type] || 0;
}

// --------------------
// Dimension class (unchanged internals)
export default class Dimension {
  constructor(type, name, amt, level, rank, tier, costDisp = "YooA Points", rankCostDisp = "YooA Points", layer = "", currency = "amount", rankLayer = "", rankCurrency = "amount") {
    this.type = type;
    this.name = name;

    // avoid wrapping if already Decimal-like
    this.amt = isDecimalLike(amt) ? amt : new Decimal(amt);
    this.level = isDecimalLike(level) ? level : new Decimal(level);
    this.rank = isDecimalLike(rank) ? rank : new Decimal(rank);

    this.tier = tier;
    this.costDisp = costDisp;
    this.rankCostDisp = rankCostDisp;
    this.layer = layer;
    this.currency = currency;
    this.rankLayer = rankLayer;
    this.rankCurrency = rankCurrency;

    // Cache instance-specific precomputed decimals to reduce repeated array indexing
    this._baseCost = (BASE_COSTS[type] && BASE_COSTS[type][tier]) ? BASE_COSTS[type][tier] : new Decimal(1);
    this._costMultiplier = (COST_MULTS[type] && COST_MULTS[type][tier]) ? COST_MULTS[type][tier] : new Decimal(1);
    this._rankBaseCost = (RANK_BASE_COSTS[type] && RANK_BASE_COSTS[type][tier]) ? RANK_BASE_COSTS[type][tier] : new Decimal(1);
    this._rankCostMultiplier = (RANK_COST_MULTS[type] && RANK_COST_MULTS[type][tier]) ? RANK_COST_MULTS[type][tier] : new Decimal(1);

    if (this.tier > 1) {
      this._gainIndex = this.tier - 2;
      this._gainPath = `dimensions.${this.type}.${this._gainIndex}.amt`;
    } else {
      this._gainIndex = -1;
      this._gainPath = null;
    }

    // caches
    this._cachedDimensionCostLevelRef = null;
    this._cachedDimensionCost = undefined;
    this._cachedDimensionRankCostLevelRef = null;
    this._cachedDimensionRankCost = undefined;
    this._cachedCost = undefined;
    this._cachedRankCost = undefined;
    this._cachedMult = undefined;
    this._cachedRankMult = undefined;
    this._cachedEffect = undefined;
    this._cachedRankEffect = undefined;
  }

  // simple accessors
  get baseCost() { return this._baseCost; }

  get costMultiplier() {
    if (this.type === "YooA" && this.tier < 3) {
      return _hasMilestone("YooAity", 14) ? this._costMultiplier.pow(CONST_0_0001) : this._costMultiplier;
    }
    return this._costMultiplier;
  }

  get rankBaseCost() { return this._rankBaseCost; }
  get rankCostMultiplier() { return this._rankCostMultiplier; }

  // cached cost getters
  get cost() {
    if (this._cachedCost === undefined) this._cachedCost = this.getDimensionCost(this.level);
    return this._cachedCost;
  }
  get rankCost() {
    if (this._cachedRankCost === undefined) this._cachedRankCost = this.getDimensionRankCost(this.rank);
    return this._cachedRankCost;
  }

  // safe coercion without throwing
  _coerceDecimal(v, fallback = dZero) {
    return (v == null || !isDecimalLike(v)) ? fallback : v;
  }

  get mult() {
    if (this._cachedMult !== undefined) return this._cachedMult;
    if (this.tier === 2 && this.type === "YooA" && _inChallenge("YooAmatter", 2)) return this._cachedMult = dZero;
    const basePerLvl = getDimMultPerLvl(this.type, this.tier) || CONST_1_01;
    const rankEff = this.rankEffect || dOne;
    const lvl = this.level || dZero;
    let eff = basePerLvl.pow(rankEff.mul(lvl));
    const t = this.type;
    if (t === "YooA") eff = eff.mul(GameCache.YooADimensionMult.value || dOne);
    else if (t === "YooAmatter") eff = eff.mul(GameCache.YooAmatterFormationMult.value || dOne);
    else if (t === "Shiah") {
      eff = eff.mul(GameCache.ShiahEchoMult.value || dOne);
      if (this.tier === 1 && _hasUpgrade("YooAity", 11)) {
        // previous code cached upgrade effect per tick; now fetch directly
        const uVal = _upgradeEffect("YooAity", 11)[1];
        eff = eff.mul(uVal || dOne);
      }
    }
    return this._cachedMult = eff;
  }

  get rankMult() {
    return this._cachedRankMult !== undefined ? this._cachedRankMult : (this._cachedRankMult = (getDimMultPerRank(this.type) || CONST_1_05).pow(this.rank || dZero));
  }

  get rankEffect() {
    return this._cachedRankEffect !== undefined ? this._cachedRankEffect : (this._cachedRankEffect = this.rankMult || dOne);
  }

  get effect() {
    if (this._cachedEffect !== undefined) return this._cachedEffect;

    const m = this.mult || dZero;
    const a = (this.amt || dZero);
    const isYooA1 = this.type === "YooA" && this.tier === 1;

    if ((!isYooA1 && a.lte(dZero)) || m.lte(dZero)) {
      return this._cachedEffect = dZero;
    }

    const r = this.rankEffect || dOne;

    const base = m.mul(a);
    let eff;
    if (r.eq(dOne)) eff = base;
    else eff = base.pow(r);

    const result = isYooA1 ? eff.div(CONST_10).add(dOne) : eff.div(CONST_100);

    return this._cachedEffect = result;
  }

  get unlocked() {
    if (this.type === "YooA") return this.tier < 3 || hasAchievement(18);
    if (this.type === "YooAmatter") return _hasUpgrade("YooAmatter", 44);
    if (this.type === "Shiah") return true;
    return false;
  }

  get rankUnlocked() {
    return (this.type === "YooA") ? _hasMilestone("YooAity", 14) : false;
  }

  get effectDisplay() {
    const effectStr = format(this.effect);
    return this.tier === 1 && this.type === "YooA" ? `Effect: x${effectStr}` : `Effect: ${effectStr}/s`;
  }

  get t1Text() {
    if (this.type === "YooA") return "Boosts YooA Point gain.";
    if (this.type === "YooAmatter") return "Produces YooAmatter Sparks.";
    if (this.type === "Shiah") return "Produces Shi-ah Embers.";
    return "";
  }

  // -----------------------------
  // Cost calculations with reference-cached level checks
  getDimensionCost(level = this.level) {
    if (this._cachedDimensionCostLevelRef === level && this._cachedDimensionCost !== undefined) {
      return this._cachedDimensionCost;
    }

    const threshold = getScalingStart(this.type);
    let scaledLevel;
    if (threshold && level.gte(threshold)) {
      scaledLevel = level.div(threshold).pow(2).mul(threshold);
    } else {
      scaledLevel = level;
    }

    const costMult = this._costMultiplier;
    const base = this._baseCost;

    // costMult.pow(scaledLevel).mul(base) (avoid Decimal.pow function overhead)
    const computed = costMult.pow(scaledLevel).mul(base);
    this._cachedDimensionCost = computed;
    this._cachedDimensionCostLevelRef = level;
    return computed;
  }

  getInvDimCost(x) {
    const currency = (this.layer === "") ? player.YooAPoints : player[this.layer][this.currency];
    x = x === undefined ? currency : x;

    // compute level by logs
    let level = x.div(this._baseCost).log(this._costMultiplier);

    const threshold = getScalingStart(this.type);
    if (threshold && level.gte(threshold)) {
      level = level.div(threshold).root(2).mul(threshold);
    }

    return level;
  }

  getDimensionRankCost(rank = this.rank) {
    if (this._cachedDimensionRankCostLevelRef === rank && this._cachedDimensionRankCost !== undefined) {
      return this._cachedDimensionRankCost;
    }

    let scaledRank = slogsub(rank, _upgradeEffect("YooA", 41));

    const exp = _upgradeEffect("Hyojung", 13).pow(this.tier ** 1.2);
    if (_hasUpgrade("Hyojung", 12)) scaledRank = scaledRank.pow(CONST_0_9);
    if (_hasUpgrade("OMG", 15)) scaledRank = scaledRank.pow(CONST_0_99);
    if (_hasUpgrade("OMG", 16)) scaledRank = scaledRank.pow(CONST_0_98);
    if (_hasUpgrade("OMG", 25)) scaledRank = scaledRank.pow(CONST_0_95);
    if (_hasUpgrade("OMG", 26)) scaledRank = scaledRank.pow(CONST_0_9);

    this._cachedDimensionRankCost = this._rankBaseCost.pow(this._rankCostMultiplier.pow(scaledRank).mul(exp));
    this._cachedDimensionRankCostLevelRef = rank;
    return this._cachedDimensionRankCost;
  }

  getInvDimRankCost(x) {
    const currency = (this.rankLayer === "") ? player.YooAPoints : player[this.rankLayer][this.rankCurrency];
    x = x === undefined ? currency : x;

    const exp = _upgradeEffect("Hyojung", 13).pow(this.tier ** 1.2);
    let rank = x.log(this._rankBaseCost).div(exp).log(this._rankCostMultiplier);
    rank = slogsub(rank, _upgradeEffect("YooA", 41).neg())
    if (_hasUpgrade("Hyojung", 12)) rank = rank.root(CONST_0_9);
    if (_hasUpgrade("OMG", 15)) rank = rank.root(CONST_0_99);
    if (_hasUpgrade("OMG", 16)) rank = rank.root(CONST_0_98);
    if (_hasUpgrade("OMG", 25)) rank = rank.root(CONST_0_95);
    if (_hasUpgrade("OMG", 26)) rank = rank.root(CONST_0_9);

    return rank;
  }

  // -----------------------------
  // Purchase logic (kept semantics, optimized checks & limited recompute)
  buy() {
    const curr = (this.layer === "") ? player.YooAPoints : player[this.layer][this.currency];
    if (!curr.gte(this.cost)) return;

    const newCurr = costNothing(this.type) ? curr : curr.sub(this.cost);
    this.level = this.level.add(1);
    this.amt = this.amt.add(1);

    this.resetCache();
    this.updateCurrency(player, newCurr.max(0));
  }

  buyMax() {
    const noCost = costNothing(this.type);
    const curr = (this.layer === "") ? player.YooAPoints : player[this.layer][this.currency];
    const cost = this.cost;
    if (curr.lt(cost)) return;

    const threshold = getScalingStart(this.type);
    const geomMax = Decimal.affordGeometricSeries(curr, this._baseCost, this._costMultiplier, this.level);
    const useScaling = threshold && this.level.gte(threshold.sub(geomMax));

    let result;
    if (useScaling) {
      result = bulkBuyBinarySearch(curr, {
        costFunction: idx => this.getDimensionCost(idx),
        invCostFunction: x => this.getInvDimCost(x),
        cumulative: !noCost
      }, this.level);
    } else {
      const inv = noCost ? this.getInvDimCost() : geomMax;
      const price = noCost ? dZero : Decimal.sumGeometricSeries(inv, this._baseCost, this._costMultiplier, this.level);
      result = { quantity: inv, purchasePrice: price };
    }

    if (!result || result.quantity.lte(0)) return;

    const qty = result.quantity;
    const price = result.purchasePrice ?? Decimal.sumGeometricSeries(qty, this._baseCost, this._costMultiplier, this.level);

    if (!noCost && curr.lt(price)) return;

    this.level = this.level.add(qty).floor();
    this.amt = this.amt.add(qty);

    if (!noCost) this.updateCurrency(player, curr.sub(price).max(0));
    this.resetCache();
  }

  harmonize() {
    const curr = (this.rankLayer === "") ? player.YooAPoints : player[this.rankLayer][this.rankCurrency];
    if (!curr.gte(this.rankCost)) return;

    const newCurr = rankCostNothing(this.type) ? curr : curr.sub(this.rankCost);
    this.rank = this.rank.add(1);

    this.resetCache();
    this.updateCurrency(player, newCurr.max(0), true);
  }

  harmonizeMax() {
    const noCost = rankCostNothing(this.type);
    const curr = (this.rankLayer === "") ? player.YooAPoints : player[this.rankLayer][this.rankCurrency];
    if (!curr.gte(this.rankCost)) return;

    const result = bulkBuyBinarySearch(curr, {
      costFunction: idx => this.getDimensionRankCost(idx),
      invCostFunction: x => this.getInvDimRankCost(x),
      cumulative: !noCost
    }, this.rank);

    if (!result || result.quantity.lte(0)) return;

    const qty = result.quantity;
    const price = result.purchasePrice;

    if (!noCost && curr.lt(price)) return;

    this.rank = this.rank.add(qty);

    if (!noCost) this.updateCurrency(player, curr.sub(price).max(0));
    this.resetCache();
  }

  updateCurrency(playerObj, newCurr, isRank = false) {
    if (isRank) {
      if (this.rankLayer === "") playerObj.YooAPoints = newCurr;
      else playerObj[this.rankLayer][this.rankCurrency] = newCurr;
    } else {
      if (this.layer === "") playerObj.YooAPoints = newCurr;
      else playerObj[this.layer][this.currency] = newCurr;
    }
  }

  // production per tick (hot)
  updateAmount(diff) {
    if (this.tier <= 1) return;
    // fast path: no amount
    if (this.amt <= 0) {
      player.gain[this.type].dimensions[this._gainIndex] = null;
      return;
    }
    const eff = this.effect;
    if (!eff || eff <= 0) {
      player.gain[this.type].dimensions[this._gainIndex] = null;
      return;
    }
    player.gain[this.type].dimensions[this._gainIndex] = gainCurrency(player, this._gainPath, eff, diff, true);
  }

  // reset & caching
  reset(resetLayer, highestTier) {
    if (this.type === "YooA") {
      const resetLevel = (gameLayers[resetLayer].layer <= 1 && this.tier > 2) ? this.level : dZero;
      this.level = resetLevel;
      this.amt = (this.tier === highestTier && this.tier >= 3) ? this.level : dZero;
    } else {
      const resetLevel = (gameLayers[resetLayer].layer <= getResetLayer(this.type)) ? this.level : dZero;
      this.level = resetLevel;
      this.amt = this.level;
    }
    this.resetCache();
  }

  resetCache() {
    this._cachedCost = undefined;
    this._cachedRankCost = undefined;
    this._cachedMult = undefined;
    this._cachedEffect = undefined;
    this._cachedRankMult = undefined;
    this._cachedRankEffect = undefined;
    this._cachedDimensionCost = undefined;
    this._cachedDimensionCostLevelRef = null;
    this._cachedDimensionRankCost = undefined;
    this._cachedDimensionRankCostLevelRef = null;
  }
}

// -----------------------------
// Cache-enabled helper functions
// Helper to get-or-create a keyed Lazy inside GameCache
function _getOrCreateLazyMap(mapName, key, factory) {
  if (!GameCache[mapName]) GameCache[mapName] = {};
  let entry = GameCache[mapName][key];
  if (!entry) {
    entry = new Lazy(factory);
    GameCache[mapName][key] = entry;
  }
  return entry;
}

export function getDimMultPerLvl(type, tier) {
  // key by type+tier
  const key = `${type}|${tier}`;
  const lazy = _getOrCreateLazyMap("dimMultPerLvl", key, () => {
    // compute body copied from original function
    let base = type === "YooA" ? CONST_1_01 : (type === "YooAmatter" ? CONST_1_5 : CONST_2);

    if (type === "YooA") {
      if (_hasUpgrade("YooAmatter", 14)) base = base.add(_upgradeEffect("YooAmatter", 14));
      if (_hasUpgrade("YooAmatter", 43)) base = base.add(_upgradeEffect("YooAmatter", 43));

      if (tier < 3) return base;

      if (_hasUpgrade("YooAmatter", 13)) base = base.pow(3);
      if (_hasUpgrade("YooAity", 11)) base = base.pow(_upgradeEffect("YooAity", 11)[0]);

      return base.pow(_upgradeEffect("sparks", 11)[0].add(1));
    }

    if (type === "YooAmatter") {
      return base.add(_upgradeEffect("sparks", 11)[1]);
    }

    if (type === "Shiah" && _hasUpgrade("Yubin", 24)) {
      return base.add("9.17e1995");
    }

    return base;
  });
  return lazy.value;
}

export function getDimMultPerRank(type) {
  const key = `${type}|rank`;
  const lazy = _getOrCreateLazyMap("dimMultPerRank", key, () => {
    if (type !== "YooA") return CONST_1_05;

    let base = CONST_1_05;
    base = base.add(_upgradeEffect("YooAity", 44));
    base = base.mul(_upgradeEffect("Hyojung", 22));
    base = base.mul(gameLayers.OMG.getSkillEffect("YooA", "dance"));
    return base;
  });
  return lazy.value;
}

export function getHighestTier(dimensions) {
  let maxTier = 0;
  for (let i = dimensions.length - 1; i >= 0; --i) {
    const d = dimensions[i];
    if (d.level.gte(dOne)) {
      maxTier = d.tier;
      break;
    }
  }
  return maxTier;
}

export function getScalingStart(type) {
  const key = `${type}|scale`;
  const lazy = _getOrCreateLazyMap("scalingStart", key, () => {
    // compute body copied from original function
    let start = LEVEL_SCALE_THRESHOLD[type] || dZero;
    if (type === "YooA") {
      if (_hasMilestone("YooAity", 12)) start = start.add(1e4);
      if (_hasMilestone("YooAity", 13)) start = start.add(8e4);
      if (_hasUpgrade("YooAity", 41)) start = start.add(_upgradeEffect("YooAity", 41));
    } else if (type === "YooAmatter" && _hasUpgrade("YooAity", 42)) {
      start = start.add(_upgradeEffect("YooAity", 42));
    }
    return start;
  });
  return lazy.value;
}

export function resetAllDimensions(dimensions, resetLayer) {
  const type = dimensions[0].type;
  if (gameLayers[resetLayer].layer < getResetLayer(type)) return;
  const highestTier = getHighestTier(dimensions);
  for (let i = 0, len = dimensions.length; i < len; ++i) {
    dimensions[i].reset(resetLayer, highestTier);
  }
}
