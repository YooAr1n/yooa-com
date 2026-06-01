// Autobuyer performance-tuned (YooA patch) — caches removed
// ------------------------------------------------
import Decimal from "./break_eternity.js";
import { buyAllUpgrades, maxAllUpgrades } from "@/components/Main.vue";
import { hasChallenge, hasMilestone, hasUpgrade, milestoneEffect, prestige, upgradeEffect } from "./mainFuncs";
import { inAnyChallenge, player } from "./incremental.js";
import { gameLayers } from "./layersData.js";
import { buyAllYMUpgrades, buySparkUpgrades, maxAllYMUpgrades, maxSparkUpgrades } from "@/components/YooAmatter.vue";
import { buyAllHJUpgrades, buyAllMMUpgrades, buyAllOMGUpgrades, buyAllSHUpgrades, buyAllYBUpgrades, buyAllYEUpgrades, maxAllHJUpgrades, maxAllMMUpgrades, maxAllOMGUpgrades, maxAllSHUpgrades, maxAllYBUpgrades, maxAllYEUpgrades } from "@/components/YooAity.vue";
import { buyAllARUpgrades, maxAllARUpgrades } from "@/components/Automation.vue";
import { Lazy, GameCache, GameDirty, globalCacheVersion } from "./cache.js";
import { perfBegin, perfEnd } from "./performance.js";

// ——— Constants ———
const dZero = Decimal.dZero;
const DEC_0_1 = new Decimal(0.1);
const DEC_5 = new Decimal(5);
const DEC_10 = new Decimal(10);
const DEC_15 = new Decimal(15);
const DEC_100 = new Decimal(100);
const DEC_500 = new Decimal(500);
const DEC_1995 = new Decimal(1995);
const DEC_1999 = new Decimal(1999);
const DEC_5000 = new Decimal(5000);
const DEC_1E5 = new Decimal(1e5);
const DEC_1E18 = new Decimal(1e18);
const DEC_1E43 = new Decimal(1e43);
const DEC_1E88 = new Decimal(1e88);
const DEC_EE3 = new Decimal("ee3");
const DEC_2E4 = new Decimal(2e4);
const DEC_4E4 = new Decimal(4e4);
const BUYER_MODES = ["SINGLE", "MAX"];
const PRESTIGER_BASE = ["AMOUNT", "TIME"];

// ——— cheap Decimal-like duck check — avoids instanceof overhead
function isDecimalLike(v) {
  return v && typeof v.eq === "function";
}

// safe live-binding wrappers — they call the real import at runtime
const _hasChallenge = (...args) => (typeof hasChallenge === 'function') ? hasChallenge(...args) : false;
const _hasMilestone  = (...args) => (typeof hasMilestone === 'function') ? hasMilestone(...args) : false;
const _hasUpgrade    = (...args) => (typeof hasUpgrade === 'function') ? hasUpgrade(...args) : false;
const _upgradeEffect = (...args) => (typeof upgradeEffect === 'function') ? upgradeEffect(...args) : Decimal.dZero;
const _inAnyChallenge = (...args) => (typeof inAnyChallenge === 'function') ? inAnyChallenge(...args) : false;

// ——— Helpers ———
function autobuyerModeName(name, defType, mode) {
  let len = 2;
  if (defType !== "Buyer") {
    if (name === "YooAmatter Prestige" && _hasMilestone("YooAity", 6)) len++;
    if (name === "YooAity Prestige" && _hasMilestone("YooAity", 17)) len++;
  }
  let idx = mode % len;
  if (idx < 0) idx += len;
  if (defType === "Buyer") return BUYER_MODES[idx];
  if (idx < 2) return PRESTIGER_BASE[idx];
  if (name === "YooAmatter Prestige") return "X TIMES YOOAMATTER";
  return "X TIMES YOOA ESSENCE";
}

function makeDimTick(layerName, indices, isRank = false) {
  const len = indices.length;
  return function tickMethod() {
    if (!this._unlocked()) return;
    const mode = this.autobuyerMode;
    const dims = player.dimensions[layerName];
    if (!dims) return;
    if (isRank) {
      if (mode === "SINGLE") {
        for (let i = 0; i < len; ++i) dims[indices[i]]?.harmonize(player);
      } else {
        for (let i = 0; i < len; ++i) dims[indices[i]]?.harmonizeMax(player);
      }
    } else {
      if (mode === "SINGLE") {
        for (let i = 0; i < len; ++i) dims[indices[i]]?.buy(player);
      } else {
        for (let i = 0; i < len; ++i) dims[indices[i]]?.buyMax(player);
      }
    }
  };
}

// ——— Autobuyer Class ———
export default class Autobuyer {
  constructor(layer, resetLayer, name, isOn = false, mode = 0, amount = null, time = null) {
    this.layer = layer;
    this.resetLayer = resetLayer;
    this.name = name;
    this.isOn = isOn;
    this.mode = mode | 0;
    this.time = time;

    // lazy: don't read global `autobuyers` now (it may be declared later).
    // we keep lightweight runtime wrappers that call the real def functions.
    this._def = null;
    this._getDef = () => {
      if (this._def) return this._def;
      // autobuyers may not exist yet at construction time, so defer
      if (typeof autobuyers === 'undefined') return null;
      const layerDefs = autobuyers[this.layer];
      if (!layerDefs) return null;
      const d = layerDefs[this.name];
      if (d) {
        // Permanently cache — the definition object never changes
        this._def = d;
        // Pre-bind the unlocked and interval functions directly to avoid wrapper closures
        this._unlocked = typeof d.unlocked === 'function' ? d.unlocked : () => false;
        this._intervalFn = typeof d.interval === 'function' ? d.interval : () => Decimal.dZero;
      }
      return d || null;
    };

    this._unlocked = () => {
      const d = this._getDef();
      return d && typeof d.unlocked === 'function' ? d.unlocked() : false;
    };

    this._intervalFn = () => {
      const d = this._getDef();
      return d && typeof d.interval === 'function' ? d.interval() : Decimal.dZero;
    };

    // wrapper that calls the def's tickMethod with the autobuyer instance as `this`
    this._tickMethod = function(...args) {
      const d = this._getDef();
      if (d && typeof d.tickMethod === 'function') {
        return d.tickMethod.apply(this, args);
      }
    };

    // coerce amount to Decimal once (avoid allocating on each abAmount access)
    if (amount == null) this.amount = null;
    else this.amount = isDecimalLike(amount) ? amount : new Decimal(amount);

    this._cachedAutoInterval = null;
    this._cachedAutoIntervalVer = -1;
    this._cachedModeStr = null;
    this._cachedModeVal = -1;  // the mode integer at time of caching
  }

  // helper (instance method alternative; keeps code compatible if other code expects it)
  _getDef() { // fallback in case something calls the prototype version (kept for safety)
    return (typeof autobuyers !== 'undefined' && autobuyers[this.layer]) ? autobuyers[this.layer][this.name] : undefined;
  }

  toggle() { this.isOn = !this.isOn; }
  toggleMode() { this.mode++; }
  updateAmount(a) { this.amount = isDecimalLike(a) ? a : new Decimal(a || 0); }

  // avoid new Decimal() every access — return existing Decimal or dZero
  get abAmount() { return this.amount == null ? dZero : this.amount; }

  // autoInterval computed live
  get autoInterval() {
    if (this._cachedAutoInterval && this._cachedAutoIntervalVer === globalCacheVersion) {
      return this._cachedAutoInterval;
    }
    const v = this._intervalFn();
    this._cachedAutoInterval = isDecimalLike(v) ? v : new Decimal(v || 0);
    this._cachedAutoIntervalVer = globalCacheVersion;
    return this._cachedAutoInterval;
  }

  get timeToNextTick() {
    if (!this.time) this.resetTime();
    const statTime = this.resetLayer ? player.stats[this.resetLayer].time : player.stats.General.totalTime;
    const remaining = (this.time && isDecimalLike(this.time)) ? this.time.sub(statTime) : dZero;
    return remaining.max(Decimal.dZero).min(this.autoInterval);
  }
  set tickTime(v) { this.time = v; }

  get autobuyerMode() {
    // mode is an integer that only changes on toggleMode() call
    if (this._cachedModeVal === this.mode && this._cachedModeStr !== null) {
      return this._cachedModeStr;
    }
    const def = this._getDef();
    const defType = def?.type ?? null;
    this._cachedModeStr = autobuyerModeName(this.name, defType, this.mode);
    this._cachedModeVal = this.mode;
    return this._cachedModeStr;
  }

  resetTime() {
    const statTime = this.resetLayer ? player.stats[this.resetLayer].time : player.stats.General.totalTime;
    this.time = statTime.add(this.autoInterval);
  }
  prestigeTime() { this.time = this.autoInterval; }

  tick() {
    const __perf = perfBegin();
    if (!this.isOn || !this._unlocked()) { perfEnd('tickDue', __perf); return; }
    const ttn = this.timeToNextTick;
    if (!isDecimalLike(ttn) || ttn.gt(Decimal.dZero)) { perfEnd('tickDue', __perf); return; }
    // call wrapper — it will find and call the real tickMethod with correct `this`
    const __tick = perfBegin();
    this._tickMethod.call(this);
    perfEnd('Autobuyer_tickMethod', __tick);
    this.resetTime();
    perfEnd('tickDue', __perf);
  }

  tickDue() {
    if (!this.isOn) return;

    // Single def resolution for this entire call
    const d = this._getDef();
    if (!d) return;

    // _unlocked is now the def's unlocked fn directly (no wrapper)
    if (!this._unlocked()) return;

    if (!this.time) {
      // Initialize time without a separate resetTime() call
      const statTime = this.resetLayer
        ? player.stats[this.resetLayer].time
        : player.stats.General.totalTime;
      this.time = statTime.add(this.autoInterval);
      return;
    }

    const statTime = this.resetLayer
      ? player.stats[this.resetLayer].time
      : player.stats.General.totalTime;

    // Inline the remaining check — avoids timeToNextTick getter which does max/min
    const remaining = this.time.sub(statTime);
    if (remaining.sign > 0) return;  // sign check: no .gt() call, no allocation

    // tickMethod: call the def's function directly (skip _tickMethod wrapper)
    d.tickMethod.call(this);

    // resetTime inline — reuse statTime already fetched above
    const iv = this.autoInterval;
    this.time = statTime.add(iv);
  }
}


// ——— Shared prestige tick logic ———
export function prestigeTick(layerKey) {
  return function tickMethod() {
    const ab = player.autobuyers[layerKey][this.name];
    if (!ab || !ab.abAmount) return;
    if (!gameLayers[layerKey].canReset()) return;
    if (_inAnyChallenge()) return;

    const mode = ab.autobuyerMode;
    const amt = ab.abAmount;
    const gain = gameLayers[layerKey].getResetGain();

    if (mode === "AMOUNT" && gain.gte(amt)) {
      prestige(layerKey);
    } else if (mode === "TIME" && player.stats[layerKey].time.gte(amt)) {
      prestige(layerKey);
    } else if (mode.startsWith("X TIMES") && gain.gte( amt.mul( player[layerKey].amount.max(1) ) )) {
      prestige(layerKey);
    }
  };
}

// ——— Autobuyer definitions ———
export const autobuyers = {
  YooA: {
    "YooA Lines": {
      type: "Buyer",
      unlocked: () => _hasChallenge("YooAmatter", 1) || gameLayers.YooAity.unlocked(),
      interval: () => Decimal.dOne.div(GameCache.autobuyerSpeed.value),
      tickMethod: function () {
        const dim = player.dimensions.YooA?.[0];
        if (!dim) return;
        this.autobuyerMode === "SINGLE" ? dim.buy(player) : dim.buyMax(player);
      }
    },
    "YooA Planes": {
      type: "Buyer",
      unlocked: () => _hasChallenge("YooAmatter", 2) || gameLayers.YooAity.unlocked(),
      interval: () => Decimal.dTwo.div(GameCache.autobuyerSpeed.value),
      tickMethod: function () {
        const dim = player.dimensions.YooA?.[1];
        if (!dim) return;
        this.autobuyerMode === "SINGLE" ? dim.buy(player) : dim.buyMax(player);
      }
    },
    "YooA Dimension 3+": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 6),
      interval: () => DEC_100.div(GameCache.autobuyerSpeed.value),
      tickMethod: makeDimTick("YooA", [2,3,4])
    },
    "YooA Upgrades": {
      type: "Buyer",
      unlocked: () => _hasChallenge("YooAmatter", 3) || gameLayers.YooAity.unlocked(),
      interval: () => DEC_5.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllUpgrades() : maxAllUpgrades();
      }
    },
    "YooA Dimension Rank": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 20),
      interval: () => DEC_1E88.div(GameCache.autobuyerSpeed.value),
      tickMethod: makeDimTick("YooA", [0,1,2,3,4], true)
    },
  },
  YooAmatter: {
    "YooAmatter Prestige": {
      type: "Prestiger",
      unlocked: () => _hasChallenge("YooAmatter", 4) || gameLayers.YooAity.unlocked(),
      interval: () => DEC_10.div(GameCache.autobuyerSpeed.value),
      tickMethod: prestigeTick("YooAmatter")
    },
    "YooAmatter Formations": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 8),
      interval: () => DEC_500.div(GameCache.autobuyerSpeed.value),
      tickMethod: makeDimTick("YooAmatter", [0,1,2,3,4])
    },
    "YooAmatter Upgrades": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 9),
      interval: () => DEC_1995.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllYMUpgrades() : maxAllYMUpgrades();
      }
    },
    "Spark Upgrades": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 10),
      interval: () => DEC_5000.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buySparkUpgrades() : maxSparkUpgrades();
      }
    },
    "Arin Level": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 10),
      interval: () => DEC_1999.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? arinSingleBuy() : arinBulkBuy();
      }
    },
  },
  YooAity: {
    "YooAity Prestige": {
      type: "Prestiger",
      unlocked: () => _hasMilestone("YooAity", 11),
      interval: () => DEC_1E5.div(GameCache.autobuyerSpeed.value),
      tickMethod: prestigeTick("YooAity")
    },
    "Arin Rank": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 17),
      interval: () => DEC_1E18.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? arinSingleRank() : arinRankBulkBuy();
      }
    },
    "YooAity Upgrades": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 19),
      interval: () => DEC_1E43.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllYEUpgrades() : maxAllYEUpgrades();
      }
    },
    "Shi-ah Echoes": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 19),
      interval: () => DEC_1E43.div(GameCache.autobuyerSpeed.value),
      tickMethod: makeDimTick("Shiah", [0,1,2,3,4,5,6])
    },
    "Seunghee Upgrades": {
      type: "Buyer",
      unlocked: () => _hasUpgrade("Mimi", 21),
      interval: () => DEC_EE3.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllSHUpgrades() : maxAllSHUpgrades();
      }
    },
    "Yubin Upgrades": {
      type: "Buyer",
      unlocked: () => _hasUpgrade("Mimi", 21),
      interval: () => DEC_EE3.div(GameCache.autobuyerSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllYBUpgrades() : maxAllYBUpgrades();
      }
    },
    "Arinium Upgrades (Arin-Proof)": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 22),
      interval: () => DEC_5.div(GameCache.Arin_proofSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllARUpgrades() : maxAllARUpgrades();
      }
    },
    "Hyojung Upgrades (Arin-Proof)": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 22),
      interval: () => DEC_10.div(GameCache.Arin_proofSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllHJUpgrades() : maxAllHJUpgrades();
      }
    },
    "Mimi Upgrades (Arin-Proof)": {
      type: "Buyer",
      unlocked: () => _hasMilestone("YooAity", 22),
      interval: () => DEC_15.div(GameCache.Arin_proofSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllMMUpgrades() : maxAllMMUpgrades();
      }
    },
    "Arin Tier (Arin-Proof)": {
      type: "Buyer",
      unlocked: () => _hasUpgrade("YooA_energy", 12),
      interval: () => DEC_2E4.div(GameCache.Arin_proofSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? arinSingleTier() : arinTierBulkBuy();
      }
    },
    "OH MY GIRL Upgrades (Arin-Proof)": {
      type: "Buyer",
      unlocked: () => _hasUpgrade("YooA_energy", 12),
      interval: () => DEC_4E4.div(GameCache.Arin_proofSpeed.value),
      tickMethod: function() {
        this.autobuyerMode === "SINGLE" ? buyAllOMGUpgrades() : maxAllOMGUpgrades();
      }
    },
  }
};

// ——— allAutobuyers ———
export function allAutobuyers() {
  if (!player?.autobuyers) return [];
  const out = [];
  for (const layerName in player.autobuyers) {
    const layer = player.autobuyers[layerName];
    for (const name in layer) out.push(layer[name]);
  }
  return out;
}

// ——— Global update function ———
export function updateAllAutobuyerTime() {
  const totalTime = player.stats.General.totalTime;
  for (const layerName in player.autobuyers) {
    const layer = player.autobuyers[layerName];
    for (const abName in layer) {
      const b = layer[abName];
      if (!b || !b.time) continue;
      const statTime = b.resetLayer ? player.stats[b.resetLayer].time : totalTime;
      const interval = b.autoInterval;
      if (!isDecimalLike(interval)) continue;
      let rem = Decimal.dZero;
      if (isDecimalLike(b.time) && isDecimalLike(statTime)) {
        rem = b.time.sub(statTime).max(Decimal.dZero);
      } else if (typeof b.time === 'number' || typeof statTime === 'number') {
        const bt = isDecimalLike(b.time) ? b.time : new Decimal(b.time || 0);
        const st = isDecimalLike(statTime) ? statTime : new Decimal(statTime || 0);
        rem = bt.sub(st).max(Decimal.dZero);
      }
      if (rem.gt(interval) && interval.gt(DEC_0_1)) b.resetTime();
    }
  }
}

export function invalidateAutobuyerIntervals() {
  if (!player?.autobuyers) return;
  for (const layerName in player.autobuyers) {
    const layer = player.autobuyers[layerName];
    for (const abName in layer) {
      const ab = layer[abName];
      if (ab) ab._cachedAutoIntervalVer = -1;
    }
  }
}

/* -------------------------------------------------
 * 🌸 YooA Autobuyer Caches
 * ------------------------------------------------- */

// avoid duplicate registration (HMR / multiple imports)
if (!GameCache._autobuyerCachesInit) {
  GameCache._autobuyerCachesInit = true;

  // — Autobuyer speed (used everywhere)
  GameCache.autobuyerSpeed = new Lazy(() => {
    let speed = GameCache.Arin_effect.value[1];
    if (hasUpgrade('YooAmatter', 54)) speed = speed.mul(2);
    if (hasMilestone('YooAity', 11)) speed = speed.mul(2);
    return speed;
  }, { persistent: true });

  // — Arin effects (VERY hot path)
  GameCache.Arin_effect = new Lazy(() => getArinEffect(), { persistent: true });
  GameCache.Arin_rankEffect = new Lazy(() => getArinRankEffect(), { persistent: true });
  GameCache.Arin_tierEffect = new Lazy(() => getArinTierEffect(), { persistent: true });
  GameCache.Arinium_effect = new Lazy(() => getAriniumEffect());

  // — Arin costs
  GameCache.Arin_cost = new Lazy(() => getArinCost(), { persistent: true });
  GameCache.Arin_rankCost = new Lazy(() => getArinRankCost(), { persistent: true });
  GameCache.Arin_tierCost = new Lazy(() => getArinTierCost(), { persistent: true });

  // — Proof speed
  GameCache.Arin_proofSpeed = new Lazy(() => GameCache.Arin_tierEffect.value[1], { persistent: true });

  GameCache.ArinRankAutobuyerRecip = new Lazy(() => {
    const ab = player?.autobuyers?.YooAity?.['Arin Rank'];
    return ab ? ab.autoInterval.recip() : Decimal.dZero;
  }, { persistent: true });
}

// ——— Arin helpers (no caching; computed live) ———
function getArinParams() {
  return {
    free: {
      YooAmatter: _hasMilestone("YooAity", 14),
      YooAity: _hasMilestone("YooAity", 19),
      Miracle: _hasUpgrade("YooA_energy", 12)
    },
    u42: _hasUpgrade("YooAmatter", 42),
    u44: (_upgradeEffect("YooAmatter", 44) || Decimal.dZero)[2] || null,
    ye35: _hasUpgrade("YooAity", 35)
  };
}

// ——— Cost / Inverse Cost ———
export function getArinCost(x = player.Arin.level) {
  const { u42, u44 } = getArinParams();
  let level = x;
  if (level.gte(1e33)) level = level.div(1e33).pow(2).mul(1e33);
  if (u42) level = level.div(1.5);
  if (u44) level = level.div(u44);
  // cost = 5^(level^1.3)
  return Decimal.pow(5, level.pow(1.3));
}

export function getArinInvCost(x) {
  const { u42, u44 } = getArinParams();
  let mult = Decimal.dOne;
  if (u42) mult = mult.mul(1.5);
  if (u44) mult = mult.mul(u44);
  // inv cost: (log5 x)^(1/1.3) * mult
  let level = x.log(5).root(1.3).mul(mult);
  if (level.gte(1e33)) level = level.div(1e33).root(2).mul(1e33);
  return level;
}

// ——— Rank cost ———
export function getArinRankCost(r = player.Arin.rank) {
  const { ye35 } = getArinParams();
  let level = r;
  if (ye35) level = level.div(1.5);
  // cost = 500 * 10^(eff^1.3)
  return Decimal.pow(10, level.pow(1.3)).mul(500);
}

export function getArinRankInvCost(x) {
  const { ye35 } = getArinParams();
  let mult = Decimal.dOne;
  if (ye35) mult = mult.mul(1.5);
  // inv cost: (log10 (x/500))^(1/1.3) * mult
  let rank = x.div(500).log10().root(1.3).mul(mult);
  return rank;
}

// ——— Tier cost ———
export function getArinTierCost(t = player.Arin.tier) {
  let level = t;
  if (level.gte(618)) level = level.div(618).pow(2).mul(618);
  // cost = 1e9 * 6.18^(eff^1.3)
  return Decimal.pow(6.18, level.pow(1.3)).mul(1e9);
}

export function getArinTierInvCost(x) {
  let mult = Decimal.dOne;
  let tier = x.div(1e9).log(6.18).root(1.3).mul(mult);
  if (tier.gte(618)) tier = tier.div(618).root(2).mul(618);
  return tier;
}

export function getAriniumGain() {
  let base = GameCache.ArinRankAutobuyerRecip.value;
  base = base.div(1e11).sub(0.2).max(0).add(1).log10().dilate(1.5);
  base = base.mul(upgradeEffect("Arinium", 16)).mul(gameLayers.YooAity.getHyojungEffect()[1]).mul(gameLayers.OMG.getMiracleLightEffect()[0]);
  if (hasUpgrade("Arinium", 13)) base = base.mul(6.18);
  if (hasUpgrade("Seunghee", 22)) base = base.mul(upgradeEffect("Seunghee", 22));
  if (hasUpgrade("Yubin", 22)) base = base.mul(upgradeEffect("Yubin", 22));
  if (hasUpgrade("Arinium", 14)) base = base.mul(upgradeEffect("Arinium", 14));
  if (hasUpgrade("Arinium", 21)) base = base.mul(upgradeEffect("Arinium", 21));
  if (hasUpgrade("Arinium", 23)) base = base.mul(upgradeEffect("Arinium", 23));
  if (hasUpgrade("YooAity", 52)) base = base.mul(upgradeEffect("YooAity", 52));
  if (hasUpgrade("YooAity", 53)) base = base.mul(upgradeEffect("YooAity", 53));

  let exp = gameLayers.OMG.getSkillEffect("Arin", "vocals");
  if (hasUpgrade("YooAity", 54)) exp = exp.mul(upgradeEffect("YooAity", 54));
  if (hasUpgrade("Arinium", 31)) exp = exp.mul(upgradeEffect("Arinium", 31));
  base = base.mul(upgradeEffect("Arinium", 26)[1]).pow(exp);
  return base;
}

// ——— Effects ———
export function getArinEffLevels() {
  return player.Arin.level.add(GameCache.Arin_rankEffect.value[0]);
}

export function getArinEffect() {
  const lvl = getArinEffLevels().mul(hasUpgrade("Arinium", 11) ? GameCache.Arin_rankEffect.value[2] : Decimal.dOne);
  const base = Decimal.dTwo.add(hasMilestone("YooAity", 4) ? milestoneEffect("YooAity", 4) : Decimal.dZero);
  const eff1 = Decimal.pow(base, lvl);
  let eff2 = Decimal.pow(1.2, lvl.sqrt());
  if (eff2.gte(1e4)) eff2 = eff2.log10().div(4).pow(0.5).mul(2).add(2).pow10();
  if (eff2.gte(1e5)) eff2 = eff2.log10().div(5).pow(0.4).mul(2).add(3).pow10();
  if (eff2.gte(1e17)) eff2 = eff2.log10().sub(7).pow(17);
  if (eff2.gte(5e27)) eff2 = eff2.div(5e27).pow(0.5).mul(1e28).sub(5e27);
  return [eff1, eff2];
}

export function getArinRankEffect() {
  const mult = (upgradeEffect("YooAity", 34) || Decimal.dZero).add(1);
  const x = player.Arin.rank.mul(mult);
  let exp = x.pow(1.4).mul(100);
  if (hasUpgrade("Yubin", 14)) exp = exp.pow(1.23);
  const eff1 = exp;
  const eff2 = Decimal.pow(2, x);
  let eff3 = x.div(1e9).add(1);
  if (eff3.gte(1e4)) eff3 = eff3.div(1e4).pow(0.4).mul(1e4);
  return [eff1, eff2, eff3];
}

export function getArinTierEffect() {
  const mult = gameLayers.OMG.getSkillEffect("Arin", "dance").div(100).add(1);
  const tier = player.Arin.tier.mul(mult);
  const base = Decimal.dTwo;
  const eff1 = Decimal.pow(base, tier);
  let eff2 = Decimal.pow(1.2, tier.sqrt());
  if (eff2.gte(1e3)) eff2 = eff2.log10().div(3).pow(0.2).mul(1.5).add(1.5).pow10();
  return [eff1, eff2];
}

export function getAriniumEffect() {
  let x = player.Arin.Arinium;
  let dil = 1;
  if (hasUpgrade("Hyojung", 22)) dil *= 1.3;
  if (hasUpgrade("Hyojung", 23)) dil *= 1.1;
  if (hasUpgrade("Mimi", 23)) dil *= 1.1;
  if (hasUpgrade("Yubin", 33)) dil *= 1.4
  let eff1 = x.dilate(dil * 0.5).pow(0.8).div(10).add(1);
  if (hasUpgrade("Hyojung", 14)) eff1 = eff1.pow(2);
  if (hasUpgrade("Mimi", 14)) eff1 = eff1.pow(2);
  if (hasUpgrade("YooAity", 14)) eff1 = eff1.pow(2.5);
  if (hasUpgrade("Arinium", 25) && player.YooAity.MimiPoints.gte(1e6)) eff1 = eff1.pow(2);
  let eff2 = player.Arin.Arinium.add(1).pow(0.6);
  if (hasUpgrade("Mimi", 21)) eff2 = eff2.pow(upgradeEffect("Mimi", 21));
  return [eff1, eff2];
}

// ——— Purchases ———
// Module-level flag
let _pendingInvalidation = false;

function _scheduleInvalidation() {
  _pendingInvalidation = true;
}

export function flushAutobuyerInvalidation() {
  if (!_pendingInvalidation) return;
  _pendingInvalidation = false;
  GameDirty.markAll();
  invalidateAutobuyerIntervals();
  updateAllAutobuyerTime();
}

export function arinSingleBuy() {
  const cost = GameCache.Arin_cost.value;
  const curr = player.YooAmatter.YooArium;
  if (curr.lt(cost)) return;
  if (!getArinParams().free.YooAmatter) player.YooAmatter.YooArium = curr.sub(cost).max(dZero);
  player.Arin.level = player.Arin.level.add(1);
  _scheduleInvalidation();
}

export function arinSingleRank() {
  const cost = GameCache.Arin_rankCost.value;
  const curr = player.YooAity.amount;
  if (curr.lt(cost)) return;
  if (!getArinParams().free.YooAity) player.YooAity.amount = curr.sub(cost).max(dZero);
  player.Arin.rank = player.Arin.rank.add(1);
  _scheduleInvalidation();
}

export function arinSingleTier() {
  const cost = GameCache.Arin_tierCost.value;
  const curr = player.YooAity.MiracleLight;
  if (curr.lt(cost)) return;
  if (!getArinParams().free.Miracle) player.YooAity.MiracleLight = curr.sub(cost).max(dZero);
  player.Arin.tier = player.Arin.tier.add(1);
  _scheduleInvalidation();
}

function arinDoBulkBuy(layerKey, resourceKey, costFn, invFn, levelRef) {
  const { free } = getArinParams();
  let money = player[layerKey][resourceKey];
  if (!isDecimalLike(money) || money.lte(dZero)) return null;
  const bulk = bulkBuyBinarySearch(
    money,
    { costFunction: costFn, invCostFunction: invFn || null, cumulative: !free[layerKey] },
    levelRef
  );
  if (!bulk || bulk.quantity.lte(0)) return null;
  return bulk;
}

export function arinBulkBuy() {
  const bulk = arinDoBulkBuy('YooAmatter', 'YooArium', getArinCost, getArinInvCost, player.Arin.level);
  if (!bulk) return;
  const { free } = getArinParams();
  if (!free.YooAmatter) player.YooAmatter.YooArium = player.YooAmatter.YooArium.sub(bulk.purchasePrice).max(dZero);
  player.Arin.level = player.Arin.level.add(bulk.quantity);
  _scheduleInvalidation();
}

export function arinRankBulkBuy() {
  const bulk = arinDoBulkBuy('YooAity', 'amount', getArinRankCost, getArinRankInvCost, player.Arin.rank);
  if (!bulk) return;
  const { free } = getArinParams();
  if (!free.YooAity) player.YooAity.amount = player.YooAity.amount.sub(bulk.purchasePrice).max(dZero);
  player.Arin.rank = player.Arin.rank.add(bulk.quantity);
  _scheduleInvalidation();
}

export function arinTierBulkBuy() {
  const bulk = arinDoBulkBuy('YooAity', 'MiracleLight', getArinTierCost, getArinTierInvCost, player.Arin.tier);
  if (!bulk) return;
  const { free } = getArinParams();
  if (!free.Miracle) player.YooAity.MiracleLight = player.YooAity.MiracleLight.sub(bulk.purchasePrice).max(dZero);
  player.Arin.tier = player.Arin.tier.add(bulk.quantity);
  _scheduleInvalidation();
}

// ——— Reset autobuyer timers ———
export function resetAllAutobuyerTime(group) {
  for (const k in group) {
    const ab = group[k];
    if (ab && typeof ab.prestigeTime === "function") ab.prestigeTime();
  }
}
