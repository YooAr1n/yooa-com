/*
  incremental.js
  Full file with a fixed FPS scheduler (default 60 FPS) and start/stop/setFPS controls.
*/

import Decimal from "./break_eternity.js";
import { GameCache, Lazy } from "./cache.js";
import { load } from "./save.js";
import {
  hasUpgrade,
  upgradeEffect,
  inChallenge,
  hasChallenge,
  challengeEffect,
  hasMilestone,
  milestoneEffect,
  precomputeMeta,
} from "./mainFuncs.js";
import Dimension from "./dimensions.js";
import Autobuyer, {
  getAriniumEffect,
  getAriniumGain,
  updateAllAutobuyerTime
} from "./automation.js";
import { achievements, gameLayers } from "./layersData.js";

// ---------------- prebind Decimal constants ----------------
const dZero = Decimal.dZero;
const dOne = Decimal.dOne;
const dTwo = new Decimal(2);
const dInf = Decimal.dInf;
const decOneE6 = new Decimal(1e-6);
const d100 = new Decimal(100);
// small Decimal constants used in hot paths (avoid allocating repeatedly)
const DEC_0_1 = new Decimal(0.1);
const DEC_0_5 = new Decimal(0.5);
const DEC_0_4 = new Decimal(0.4);
const DEC_1_3 = new Decimal(1 / 3);

// ---------------- small helpers optimized for hot path ----------------
// prebind prototype method references (call style to avoid repeated property lookup)
const DEC_PROTO = Decimal.prototype;
const DEC_ADD = DEC_PROTO.add;
const DEC_SUB = DEC_PROTO.sub;
const DEC_MUL = DEC_PROTO.mul;
const DEC_DIV = DEC_PROTO.div;
const DEC_POW = DEC_PROTO.pow;
const DEC_EQ = DEC_PROTO.eq;
const DEC_GTE = DEC_PROTO.gte;
const DEC_LOG10 = DEC_PROTO.log10;
const DEC_TO_STRING = DEC_PROTO.toString;

let date = Date.now();
window.date = date;

// ---------------- helper: advance tick (keeps existing name) ----------------
export function nextYooATick() {
  updateAllAutobuyerTime();
}

// ---------------- precompute helpers ----------------
export let __achKeysArray = null;
export let __milestoneKeysByLayer = null;
export let __OMGLights = null;

export function precomputeAchievementList() {
  const keys = Object.keys(achievements);
  const out = new Array(keys.length);
  for (let i = 0; i < keys.length; ++i) out[i] = { id: keys[i], ach: achievements[keys[i]] };
  __achKeysArray = out;
}

export function precomputeMilestoneLists(layersObj) {
  const out = {};
  for (const ln in layersObj) {
    const layer = layersObj[ln];
    if (!layer || !layer.milestones) continue;
    const ks = Object.keys(layer.milestones);
    const arr = new Array(ks.length);
    for (let i = 0; i < ks.length; ++i) arr[i] = { id: ks[i], m: layer.milestones[ks[i]] };
    out[ln] = arr;
  }
  __milestoneKeysByLayer = out;
}

// cloneDecimals optimized (avoid map/allocation when possible)
function cloneDecimals(val) {
  if (val instanceof Decimal) return new Decimal(val);
  if (Array.isArray(val)) {
    const out = new Array(val.length);
    for (let i = 0; i < val.length; ++i) out[i] = cloneDecimals(val[i]);
    return out;
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) out[k] = cloneDecimals(val[k]);
    }
    return out;
  }
  return val; // primitive
}

export function start() {
    load();
    precomputeMeta();
    precomputeAchievementList();
    precomputeMilestoneLists(gameLayers);
    if (player && player.YooAity && player.YooAity.OMGLight) __OMGLights = Object.keys(player.YooAity.OMGLight);
}

// ---------------- start player and helpers ----------------
export function getStartPlayer() {
  const p = {
    tab: 'Main', version: 2 /*2 is v1.0*/, subtabs: { Main: 'main', Options: 'saving', Stats: 'main', YooAmatter: 'main', YooAity: 'main', Automation: 'YooA' },
    time: Date.now(), YooAPoints: dZero,
    YooAmatter: { amount: dZero, YooArium: dZero, sparks: dZero },
    YooAity: {}, inChallenge: ['', ''], upgrades: {}, milestones: {}, challenges: {}, math: {}, dimensions: {}, stats: {}, gain: {}, achievements: {}, autobuyers: {}, Arin: { level: dZero, rank: dZero, tier: dZero, Arinium: dZero }
  };

  // YooAity defaults - build compactly
  const omgl = { YooA: dZero, Arin: dZero, Seunghee: dZero, Yubin: dZero, Hyojung: dZero, Mimi: dZero };
  function zerosObj() { return { vocals: dZero, dance: dZero, charisma: dZero }; }
  const omgsparkles = { YooA: zerosObj(), Arin: zerosObj(), Seunghee: zerosObj(), Yubin: zerosObj(), Hyojung: zerosObj(), Mimi: zerosObj() };
  const alloc = cloneDecimals(omgsparkles);

  p.YooAity = {
    amount: dZero, embers: dZero, age: dZero, frameBasedAgeGain: dZero, effectiveAgeGainPerSecond: dZero, YooChronium: dZero,
    SeungheePoints: dZero, YubinPoints: dZero, HyojungPoints: dZero, MimiPoints: dZero, MiracleLight: dZero,
    OMGLight: omgl, OMGSparkles: omgsparkles, OMGLightAllocated: alloc
  };

  p.upgrades = getStartUpgrades(); p.milestones = getStartMilestones(); p.challenges = getStartChallenges(); p.math = getStartMath();
  p.dimensions = getStartDimensions(); p.stats = getStartStats(); p.gain = getStartGains(); p.autobuyers = getStartAutobuyers();
  return p;
}

export const player = getStartPlayer();
window.player = player;

export function getStartGains() {
  return { YooA: { points: '', dimensions: Array(5).fill('') }, YooAmatter: { amount: '', dimensions: Array(5).fill(''), sparks: '' }, YooAity: { amount: '', embers: '', YooChronium: '', SeungheePoints: '', YubinPoints: '', HyojungPoints: '', MimiPoints: '', MiracleLight: '' }, Shiah: { dimensions: Array(7).fill('') }, Arin: { Arinium: '' } };
}
export function getStartUpgrades() { return { YooA: {}, YooAmatter: {}, YooAity: {} }; }
export function getStartMilestones() { return { YooAity: {} }; }
export function getStartChallenges() { return { YooAmatter: {} }; }
export function getStartMath() { return { YooA: { mathProblem: '1 + 1', correctAnswer: 2, solved: dZero, isCorrect: false, showCorrect: false }, YooAmatter: { mathProblem: '1 * 1', correctAnswer: 1, solved: dZero, isCorrect: false, showCorrect: false }, YooAity: { mathProblem: '1 ^ 1', correctAnswer: 1, solved: dZero, isCorrect: false, showCorrect: false } }; }
export function getStartStats() { return { General: { totalPoints: dZero, totalTime: dZero, totalSolved: dZero }, YooA: { solved: dZero }, YooAmatter: { totalAmount: dZero, totalYooArium: dZero, totalSparks: dZero, time: dZero, bestTime: new Decimal(1e100), bestTimeThisReset: new Decimal(1e100), resets: dZero, solved: dZero }, YooAity: { totalAmount: dZero, totalEmbers: dZero, totalYooChronium: dZero, time: dZero, bestTime: new Decimal(1e100), bestTimeThisReset: new Decimal(1e100), resets: dZero, solved: dZero }, last_prestiges: { YooAmatter: Array(10).fill(null), YooAity: Array(10).fill(null) } } }

export function getStartDimensions() {
  const names = ["Lines", "Planes", "Spaces", "Realms", "Entities"];
  const ymNames = ["Threads", "Weaves", "Flows", "Realizations", "Cores"];
  const shNames = ["Moments", "Steps", "Notes", "Verses", "Stages", "Dreams", "Miracles"];

  const out = {};
  out.YooA = names.map((name, i) => new Dimension(
    "YooA",
    `YooA ${name}`,
    dZero, dZero, dZero,
    i + 1,
    i + 1 > 2 ? "YooAmatter" : undefined, // costDisp (display label if you want)
    "YooChronium",                        // rankCostDisp
    i + 1 > 2 ? "YooAmatter" : "",        // layer: use player.YooAmatter for tier>=3
    "amount",                             // currency property within that layer
    "YooAity",
    "YooChronium"
  ));
  out.YooAmatter = ymNames.map((name, i) => new Dimension("YooAmatter", `YooAmatter ${name}`, dZero, dZero, dZero, i + 1, "YooAmatter", undefined, "YooAmatter"));
  out.Shiah = shNames.map((name, i) => new Dimension("Shiah", `Shi-ah ${name}`, dZero, dZero, dZero, i + 1, "YooA Essence", undefined, "YooAity"));
  return out;
}

export function getStartAutobuyers() {
  const make = (a, b, c, d, e, f) => new Autobuyer(a, b, c, d, e, f);
  return {
    YooA: { "YooA Lines": make("YooA", "YooAmatter", "YooA Lines", false, 0), "YooA Planes": make("YooA", "YooAmatter", "YooA Planes", false, 0), "YooA Dimension 3+": make("YooA", "YooAmatter", "YooA Dimension 3+", false, 0), "YooA Upgrades": make("YooA", "YooAmatter", "YooA Upgrades", false, 0), "YooA Dimension Rank": make("YooA", "YooAmatter", "YooA Dimension Rank", false, 0) },
    YooAmatter: { "YooAmatter Prestige": make("YooAmatter", "YooAity", "YooAmatter Prestige", false, 0, 0), "YooAmatter Formations": make("YooAmatter", "YooAity", "YooAmatter Formations", false, 0), "YooAmatter Upgrades": make("YooAmatter", "YooAity", "YooAmatter Upgrades", false, 0), "Spark Upgrades": make("YooAmatter", "YooAity", "Spark Upgrades", false, 0), "Arin Level": make("YooAmatter", "YooAity", "Arin Level", false, 0) },
    YooAity: { "YooAity Prestige": make("YooAity", null, "YooAity Prestige", false, 0, 0), "Arin Rank": make("YooAity", null, "Arin Rank", false, 0), "YooAity Upgrades": make("YooAity", null, "YooAity Upgrades", false, 0), "Shi-ah Echoes": make("YooAity", null, "Shi-ah Echoes", false, 0), "Seunghee Upgrades": make("YooAity", null, "Seunghee Upgrades", false, 0), "Yubin Upgrades": make("YooAity", null, "Yubin Upgrades", false, 0), "Arinium Upgrades (Arin-Proof)": make("YooAity", null, "Arinium Upgrades (Arin-Proof)", false, 0), "Hyojung Upgrades (Arin-Proof)": make("YooAity", null, "Hyojung Upgrades (Arin-Proof)", false, 0), "Mimi Upgrades (Arin-Proof)": make("YooAity", null, "Mimi Upgrades (Arin-Proof)", false, 0) }
  };
}

// ---------------- core micro-optimized helpers ----------------
export function calculateMultipliers(source, layer, ids, baseMultiplier = dOne) {
  let m = baseMultiplier;
  for (let i = 0, len = ids.length; i < len; ++i) {
    if (source(layer, ids[i])) m = DEC_MUL.call(m, upgradeEffect(layer, ids[i]));
  }
  return m;
}

function computeYooAExponent() {
  const sparkEffectExponent = (gameLayers.YooAmatter && gameLayers.YooAmatter.YooAmatterSparkEffect && gameLayers.YooAmatter.YooAmatterSparkEffect() && gameLayers.YooAmatter.YooAmatterSparkEffect()[1]) || dOne;
  const SeungheeEffectExponent = (gameLayers.YooAity && gameLayers.YooAity.getSeungheeEffect && gameLayers.YooAity.getSeungheeEffect() && gameLayers.YooAity.getSeungheeEffect()[0]) || dOne;
  const YubinEffectExponent = (gameLayers.YooAity && gameLayers.YooAity.getYubinEffect && gameLayers.YooAity.getYubinEffect() && gameLayers.YooAity.getYubinEffect()[0]) || dOne;
  const HyojungEffectExponent = (gameLayers.YooAity && gameLayers.YooAity.getHyojungEffect && gameLayers.YooAity.getHyojungEffect() && gameLayers.YooAity.getHyojungEffect()[0]) || dOne;
  const MimiEffectExponent = (gameLayers.YooAity && gameLayers.YooAity.getMimiEffect && gameLayers.YooAity.getMimiEffect() && gameLayers.YooAity.getMimiEffect()[0]) || dOne;
  const YE51Exponent = hasUpgrade('YooAity', 51) ? upgradeEffect('YooAity', 51) : dOne;
  const YTM21Exponent = hasMilestone('YooAity', 21) ? milestoneEffect('YooAity', 21)[0] : dOne;
  const YU42Exponent = upgradeEffect('YooA', 42);
  const YM15Exponent = hasUpgrade('YooAmatter', 15) ? upgradeEffect('YooAmatter', 15) : dOne;
  const AriniumEffectExponent = getAriniumEffect()[0];
  const YooAVocalExponent = (gameLayers.OMG && gameLayers.OMG.getSkillEffect && gameLayers.OMG.getSkillEffect('YooA', 'vocals')) || dOne;

  // combine exponents cheaply by repeated mul calls
  let exponent = DEC_MUL.call(sparkEffectExponent, YE51Exponent);
  exponent = DEC_MUL.call(exponent, SeungheeEffectExponent);
  exponent = DEC_MUL.call(exponent, YubinEffectExponent);
  exponent = DEC_MUL.call(exponent, AriniumEffectExponent);
  exponent = DEC_MUL.call(exponent, HyojungEffectExponent);
  exponent = DEC_MUL.call(exponent, MimiEffectExponent);
  exponent = DEC_MUL.call(exponent, YooAVocalExponent);
  exponent = DEC_MUL.call(exponent, YTM21Exponent);
  exponent = DEC_MUL.call(exponent, YU42Exponent);
  exponent = DEC_MUL.call(exponent, YM15Exponent);

  let gain = exponent;
  if (inChallenge('YooAmatter', 1)) gain = DEC_MUL.call(gain, new Decimal(0.5));
  if (inChallenge('YooAmatter', 3)) gain = DEC_MUL.call(gain, new Decimal(0.4));
  if (hasChallenge('YooAmatter', 1)) {
    gain = DEC_MUL.call(gain, challengeEffect('YooAmatter', 1)[0]);
  }
  if (hasChallenge('YooAmatter', 4)) {
    gain = DEC_MUL.call(gain, challengeEffect('YooAmatter', 4)[1]);
  }
  
  return gain
}

// compute YooA gain base
export function computeYooAGainBase() {
  const playerDims = player.dimensions;
  const yooAUpgrades = calculateMultipliers(hasUpgrade, 'YooA', [11, 12, 14, 23, 24, 31], DEC_0_1);
  const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, 'YooAmatter', [12]);
  const dimensionEffect = (playerDims.YooA && playerDims.YooA[0] && playerDims.YooA[0].effect) || dOne;
  const upgrade14Effect = (gameLayers.YooA && gameLayers.YooA.upgrades && gameLayers.YooA.upgrades[14] && gameLayers.YooA.upgrades[14].effectGain && gameLayers.YooA.upgrades[14].effectGain()) || dOne;
  const achievementMultiplier = GameCache.AchievementMult.value;
  const yooAmatterEffect = (gameLayers.YooAmatter && gameLayers.YooAmatter.effect && gameLayers.YooAmatter.effect()) || dOne;
  const emberEffect = (gameLayers.YooAity && gameLayers.YooAity.ShiahEmberEffect && gameLayers.YooAity.ShiahEmberEffect()) || dOne;
  const MiracleLightEffect = (gameLayers.OMG && gameLayers.OMG.getMiracleLightEffect && gameLayers.OMG.getMiracleLightEffect() && gameLayers.OMG.getMiracleLightEffect()[0]) || dOne;

  let gain = DEC_MUL.call(yooAUpgrades, yooAmatterUpgrades);
  gain = DEC_MUL.call(gain, dimensionEffect);
  gain = DEC_MUL.call(gain, upgrade14Effect);
  gain = DEC_MUL.call(gain, achievementMultiplier);
  gain = DEC_MUL.call(gain, yooAmatterEffect);
  gain = DEC_MUL.call(gain, emberEffect);
  gain = DEC_MUL.call(gain, MiracleLightEffect);

  if (player.achievements[15]) gain = DEC_MUL.call(gain, achievements[15].rewardEffect());
  if (player.achievements[16]) gain = DEC_MUL.call(gain, achievements[16].rewardEffect());

  const exponent = computeYooAExponent();

  // Short-circuit expensive pow when exponent is 1
  if (!DEC_EQ.call(exponent, dOne)) {
    gain = DEC_POW.call(gain, exponent);
  }
  if (inChallenge('YooAmatter', 4) && gameLayers.YooAmatter && gameLayers.YooAmatter.challenges && gameLayers.YooAmatter.challenges[4]) {
    gain = gain.dilate(gameLayers.YooAmatter.challenges[4].dilEff());
  }

  return gain;
}

// compute YooAGain
export function computeYooAGain() {
  let gain = GameCache.YooAGainBase.value;
  let power = dOne;
  if (hasUpgrade("YooAmatter", 25)) power = DEC_DIV.call(dOne, upgradeEffect("YooAmatter", 25)[0]);

  const powA = DEC_POW.call(DEC_0_5, power);
  const powB = DEC_POW.call(DEC_0_4, power);
  const powC = DEC_POW.call(DEC_1_3, power);

  if (DEC_GTE.call(gain, new Decimal('ee24'))) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div(1e24), powA).mul(powA.recip().mul(1e24)).sub(powA.recip().sub(1).mul(1e24)).pow10();
  }
  if (DEC_GTE.call(gain, new Decimal('ee36'))) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div(1e36), powB).mul(powB.recip().mul(1e36)).sub(powB.recip().sub(1).mul(1e36)).pow10();
  }
  if (DEC_GTE.call(gain, new Decimal('ee55555'))) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div('e55555'), powC).mul(powC.recip().mul('e55555')).sub(powC.recip().sub(1).mul('e55555')).pow10();
  }
  return gain;
}

// compute YooAPerSecond 
export function computeYooAPerSecond() {
  return hasUpgrade('YooA', 21) ? upgradeEffect('YooA', 21) : dZero;
}

// compute YooADimensionMult 
export function computeYooADimensionMult() {
  const yooAUpgrades = calculateMultipliers(hasUpgrade, 'YooA', [22, 32, 34]);
  const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, 'YooAmatter', [11, 13]);
  const upgrade33Effect = (gameLayers.YooA && gameLayers.YooA.upgrades && gameLayers.YooA.upgrades[33] && gameLayers.YooA.upgrades[33].effectGain && gameLayers.YooA.upgrades[33].effectGain()) || dOne;
  const emberEffect = (gameLayers.YooAity && gameLayers.YooAity.ShiahEmberEffect && gameLayers.YooAity.ShiahEmberEffect()) || dOne;

  let mult = DEC_MUL.call(yooAUpgrades, yooAmatterUpgrades);
  mult = DEC_MUL.call(mult, upgrade33Effect);
  mult = DEC_MUL.call(mult, emberEffect);

  const achievementIds = [18, 23, 25, 32, 36];
  for (let i = 0; i < achievementIds.length; ++i) {
    const id = achievementIds[i]; if (player.achievements[id]) mult = DEC_MUL.call(mult, achievements[id].rewardEffect());
  }
  if (player.achievements[28]) mult = DEC_MUL.call(mult, GameCache.AchievementMult.value);
  return mult;
}

// compute YooAmatterFormationMult
export function computeYooAmatterFormationMult() {
  const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, 'YooAmatter', [53, 54]);
  const sparkUpgrades = calculateMultipliers(hasUpgrade, 'sparks', [12]);
  const YooAityUpgrades = calculateMultipliers(hasUpgrade, 'YooAity', [12]);
  let mult = DEC_MUL.call(yooAmatterUpgrades, sparkUpgrades);
  mult = DEC_MUL.call(mult, YooAityUpgrades);
  if (player.achievements[43]) mult = DEC_MUL.call(mult, achievements[43].rewardEffect());
  if (player.achievements[47]) mult = DEC_MUL.call(mult, GameCache.AchievementMult.value);
  return mult;
}

// compute ShiahEchoMult 
export function computeShiahEchoMult() {
  const yooAityUpgrades = calculateMultipliers(hasUpgrade, 'YooAity', [22]);
  let mult = DEC_MUL.call(yooAityUpgrades, gameLayers.YooAity.getAgeEffect());
  if (player.achievements[61]) mult = DEC_MUL.call(mult, GameCache.AchievementMult.value);
  return mult;
}

// compute Achievement Multiplier 
export function computeAchievementMultiplier() {
  let _achKeys = Object.keys(achievements);
  let countAch = 0, rows = Math.ceil(_achKeys.length / 8), base = dOne;
  const pAch = player.achievements;
  for (let r = 0; r < rows; ++r) {
    let rowComplete = true;
    for (let j = 0; j < 8; ++j) {
      const idx = r * 8 + j;
      if (idx >= _achKeys.length) break;
      if (pAch[_achKeys[idx]]) countAch++; else rowComplete = false;
    }
    if (rowComplete) base = DEC_MUL.call(base, new Decimal(1.1));
  }
  return DEC_MUL.call(base, DEC_POW.call(new Decimal(1.02), countAch));
}

// IMPORTANT: do this once after functions are declared (prevents circular import / missing reference)
(function initGameCache() {
  // If GameCache was already populated (unlikely), overwrite to ensure correct bindings.
  GameCache.YooAGainBase = new Lazy(() => computeYooAGainBase());
  GameCache.YooAGain = new Lazy(() => computeYooAGain());
  GameCache.YooAPerSecond = new Lazy(() => computeYooAPerSecond());

  GameCache.YooADimensionMult = new Lazy(() => computeYooADimensionMult());
  GameCache.YooAmatterFormationMult = new Lazy(() => computeYooAmatterFormationMult());
  GameCache.ShiahEchoMult = new Lazy(() => computeShiahEchoMult());

  GameCache.AchievementMult = new Lazy(() => computeAchievementMultiplier());
})();

// ---------------- gainCurrency: parsed path now uses a local path cache Map ----------------
const _pathCache = new Map();

function _parsePath(path) {
  let keys = _pathCache.get(path);
  if (!keys) {
    keys = path.split('.');
    _pathCache.set(path, keys);
  }
  return keys;
}

function isDecimalLike(v) {
  return v && typeof v.eq === "function";
}

export function gainCurrency(pl, currencyPath, gain, diff, percent) {
  if (!currencyPath) return '';
  if (!isDecimalLike(gain)) gain = gain == null ? dZero : new Decimal(gain);
  const inv = __cachedInvDiff || DEC_DIV.call(dOne, diff);
  const dotIdx = currencyPath.indexOf('.');
  if (dotIdx === -1) {
    const oldVal = pl[currencyPath];
    pl[currencyPath] = DEC_ADD.call(oldVal, DEC_MUL.call(gain, diff));
    return formatGain(oldVal, gain, inv, percent);
  }
  const keys = _parsePath(currencyPath);
  let obj = pl;
  const len = keys.length - 1;
  for (let i = 0; i < len; ++i) obj = obj[keys[i]];
  const last = keys[len], oldVal = obj[last];
  obj[last] = DEC_ADD.call(oldVal, DEC_MUL.call(gain, diff));
  return formatGain(oldVal, gain, inv, percent);
}

/* (START) Helper functions for various checks that CHATGPT ALWAYS REMOVES - DONT REMOVE*/
export function inAnyChallenge() {
  const ic = player.inChallenge; return ic[0] !== '' || ic[1] !== '';
}

export function completedAnyChallenge() {
  const keys = Object.keys(player.challenges);
  for (let i = 0; i < keys.length; ++i) {
    const cat = player.challenges[keys[i]]; const sub = Object.keys(cat);
    for (let j = 0; j < sub.length; ++j) if (cat[sub[j]]) return true;
  }
  return false;
}

export function hasAchievement(id) { return !!player.achievements[id]; }
/* (END) Helper functions for various checks that CHATGPT ALWAYS REMOVES - DONT REMOVE*/

export function notifyAchievement(achievement) {
  // dispatch event as before
  window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: `${achievement.title} unlocked!` }));
  // caches removed -> nothing else to invalidate
}
export function notifyMilestone(milestone, layerName) {
  window.dispatchEvent(new CustomEvent('milestone-unlocked', { detail: { message: `${milestone.title} unlocked!`, layerName } }));
  // caches removed -> nothing else to invalidate
}

export function maxAllDimensions(type, isAll = false) {
  const dims = player.dimensions[type]; if (!dims) return;
  if (type === 'YooA') {
    for (let i = 0, len = dims.length; i < len; ++i) { const dim = dims[i]; if (dim.unlocked && (dim.tier === 1 || dim.tier === 2 || isAll)) dim.buyMax(player); }
  } else { for (let i = 0, len = dims.length; i < len; ++i) { const dim = dims[i]; if (dim.unlocked) dim.buyMax(player); } }
}

export function maxAllDimensionRanks(type) { const dims = player.dimensions[type]; if (!dims) return; for (let i = 0, len = dims.length; i < len; ++i) { const d = dims[i]; if (d.rankUnlocked) d.harmonizeMax(player); } }

// ---------------- main tick function ----------------
let __cachedInvDiff = null;
const _dOne = Decimal.dOne;
let _pDims, _pGain, _pStats, _pAutobuyers, _pAch, _pMilestones = null;
export function calc(diff) {
  nextYooATick();
  // Invalidate caches once per tick so each cached value is computed at most once per tick.
  // (This is safe and simple: first access inside the tick will compute and subsequent accesses use the cached result.)
  Lazy.invalidateAll();

  __cachedInvDiff = DEC_DIV.call(dOne, diff);

  _pDims = player.dimensions;
  _pGain = player.gain;
  _pStats = player.stats;
  _pAutobuyers = player.autobuyers;
  _pAch = player.achievements;
  _pMilestones = player.milestones;

  // compute once per tick expensive read-only values (no cache store)
  const __tickComputed = {
    YooAGainBase: GameCache.YooAGainBase.value,
    YooAGain: GameCache.YooAGain.value,
    YooAPerSecond: GameCache.YooAPerSecond.value
  };

  // expose for UI and external readers to avoid re-computation
  if (typeof window !== 'undefined') {
    window._lastYooAGainBase = __tickComputed.YooAGainBase;
    window._lastYooAGain = __tickComputed.YooAGain;
    window._lastYooAPerSecond = __tickComputed.YooAPerSecond;
  }

  const perSecondGain = __tickComputed.YooAPerSecond;
  const dimsYooAm = _pDims.YooAmatter;
  const dimsShiah = _pDims.Shiah;
  const sparkGain = (dimsYooAm && dimsYooAm[0] && dimsYooAm[0].effect) || dZero;
  const emberGain = (dimsShiah && dimsShiah[0] && dimsShiah[0].effect) || dZero;

  const YooAityLayer = gameLayers.YooAity;
  const SeungheeGain = (YooAityLayer && YooAityLayer.getSeungheeGain && YooAityLayer.getSeungheeGain()) || dZero;
  const YubinGain = (YooAityLayer && YooAityLayer.getYubinGain && YooAityLayer.getYubinGain()) || dZero;
  const HyojungGain = (YooAityLayer && YooAityLayer.getHyojungGain && YooAityLayer.getHyojungGain()) || dZero;
  const MimiGain = (YooAityLayer && YooAityLayer.getMimiGain && YooAityLayer.getMimiGain()) || dZero;
  const ageGain = (YooAityLayer && YooAityLayer.getAgeGain && YooAityLayer.getAgeGain()) || dZero;


  const frameBaseInc = DEC_MUL.call(ageGain, diff);
  const baseAge = player.YooAity.age;
  const pYooAity = player.YooAity;
  // compute the effective age delta directly each tick (no persistent cache)
  if (DEC_EQ ? DEC_EQ.call(frameBaseInc, dZero) : frameBaseInc.eq(dZero)) {
    pYooAity.frameBasedAgeGain = dZero;
    pYooAity.effectiveAgeGainPerSecond = dZero;
  } else {
    const relChange = frameBaseInc.abs().div(baseAge.abs().add(dOne));
    if (relChange.lt(1e-9)) {
      // approximate derivative by small h
      const h = Decimal.max(baseAge.abs().mul(decOneE6), decOneE6);
      const effBase = YooAityLayer.getEffectiveAge(baseAge);
      const effPlus = YooAityLayer.getEffectiveAge(baseAge.add(h));
      const derivative = effPlus.sub(effBase).div(h);
      const effDelta = derivative.mul(frameBaseInc);
      pYooAity.frameBasedAgeGain = effDelta;
      pYooAity.effectiveAgeGainPerSecond = effDelta.div(diff);
    } else {
      const effectiveNow = YooAityLayer.getEffectiveAge(baseAge);
      const effectiveAfter = YooAityLayer.getEffectiveAge(baseAge.add(frameBaseInc));
      const effectiveDelta = effectiveAfter.sub(effectiveNow);
      pYooAity.frameBasedAgeGain = effectiveDelta;
      pYooAity.effectiveAgeGainPerSecond = effectiveDelta.div(diff);
    }
  }


  const resetGainRaw = (gameLayers.YooAmatter && gameLayers.YooAmatter.getResetGain && gameLayers.YooAmatter.getResetGain()) || dZero;
  const resetGainRaw2 = (YooAityLayer && YooAityLayer.getResetGain && YooAityLayer.getResetGain()) || dZero;
  const prestGain = DEC_DIV.call(resetGainRaw, d100);
  const prestGain2 = DEC_DIV.call(resetGainRaw2, d100);

  const ascGain = upgradeEffect('YooAity', 15);
  const ariumGain = upgradeEffect('YooAmatter', 42);
  const chroniumGain = upgradeEffect('YooAity', 35);
  const YooALightGain = upgradeEffect('OMG', 11);
  const ArinLightGain = upgradeEffect('OMG', 21);
  const SeungheeLightGain = upgradeEffect('OMG', 31);
  const AllocYooAGain = DEC_DIV.call(player.YooAity.OMGLight.YooA, new Decimal(100));
  const AriniumGain = getAriniumGain();
  const MiracleLightGain = (gameLayers.OMG && gameLayers.OMG.getMiracleLightGain && gameLayers.OMG.getMiracleLightGain()) || dZero;

  // cached booleans per tick (avoid duplicate hasUpgrade calls)
  const hasY22 = hasUpgrade('YooAmatter', 22);
  const hasU13 = hasUpgrade('YooAity', 13);
  const hasU15 = hasUpgrade('YooAity', 15);
  const hasU35 = hasUpgrade('YooAity', 35);
  const hasOMG11 = hasUpgrade('OMG', 11);
  const hasOMG21 = hasUpgrade('OMG', 21);
  const hasOMG31 = hasUpgrade('OMG', 31);
  const hasY42 = hasUpgrade('YooAmatter', 42);
  const hasM13 = hasMilestone('YooAity', 13);
  const hasM23 = hasMilestone('YooAity', 23);

  // compute effects only when needed and cache deltas (mul diff) for reuse inside this tick
  const u22 = hasY22 ? upgradeEffect('YooAmatter', 22) : dZero;
  const u13 = hasU13 ? upgradeEffect('YooAity', 13) : dZero;
  const m23 = hasM23 ? milestoneEffect('YooAity', 23) : dZero;

  const diffMul = diff; // small local alias
  const u22Delta = u22.mul(diffMul);
  const u13Delta = u13.mul(diffMul);
  const m23Delta = m23.mul(diffMul);
  const ascGainDelta = ascGain.mul(diffMul);
  const ariumGainDelta = ariumGain.mul(diffMul);
  const prestGainDelta = prestGain.mul(diffMul);
  const chroniumGainDelta = chroniumGain.mul(diffMul);
  const AllocYooADelta = AllocYooAGain.mul(diffMul);
  const YooALightGainDelta = YooALightGain.mul(diffMul);
  const ArinLightGainDelta = ArinLightGain.mul(diffMul);
  const SeungheeLightGainDelta = SeungheeLightGain.mul(diffMul);

  const pGainYooAity = _pGain.YooAity;
  _pGain.YooA.points = gainCurrency(player, 'YooAPoints', perSecondGain, diff);
  _pGain.YooAmatter.sparks = gainCurrency(player, 'YooAmatter.sparks', sparkGain, diff);
  pGainYooAity.SeungheePoints = gainCurrency(player, 'YooAity.SeungheePoints', SeungheeGain, diff);
  pGainYooAity.YubinPoints = gainCurrency(player, 'YooAity.YubinPoints', YubinGain, diff);
  pGainYooAity.HyojungPoints = gainCurrency(player, 'YooAity.HyojungPoints', HyojungGain, diff);
  pGainYooAity.MimiPoints = gainCurrency(player, 'YooAity.MimiPoints', MimiGain, diff);
  pGainYooAity.MiracleLight = gainCurrency(player, 'YooAity.MiracleLight', MiracleLightGain, diff);

  if (hasU35) pGainYooAity.YooChronium = gainCurrency(player, 'YooAity.YooChronium', chroniumGain, diff);
  if (hasM13) _pGain.Arin.Arinium = gainCurrency(player, 'Arin.Arinium', AriniumGain, diff);

  _pStats.General.totalPoints = _pStats.General.totalPoints.add(perSecondGain.mul(diff));
  _pStats.General.totalTime = _pStats.General.totalTime.add(diff);
  _pStats.YooAmatter.time = _pStats.YooAmatter.time.add(diff);
  _pStats.YooAity.time = _pStats.YooAity.time.add(diff);
  _pStats.YooAmatter.totalSparks = _pStats.YooAmatter.totalSparks.add(Decimal.mul(sparkGain, diff));
  pYooAity.embers = pYooAity.embers.add(Decimal.mul(emberGain, diff));
  _pStats.YooAity.totalEmbers = _pStats.YooAity.totalEmbers.add(Decimal.mul(emberGain, diff));
  pYooAity.age = pYooAity.age.add(ageGain.mul(diff));

  const OMG = gameLayers.OMG;
  const OMGLights = __OMGLights || Object.keys(player.YooAity.OMGLight);
  __OMGLights = OMGLights;

  if (hasY22) { player.math.YooA.solved = player.math.YooA.solved.add(u22Delta); _pStats.General.totalSolved = _pStats.General.totalSolved.add(u22Delta); }
  if (hasU13) { player.math.YooAmatter.solved = player.math.YooAmatter.solved.add(u13Delta); _pStats.General.totalSolved = _pStats.General.totalSolved.add(u13Delta); }
  if (hasM23) { player.math.YooAity.solved = player.math.YooAity.solved.add(m23Delta); _pStats.General.totalSolved = _pStats.General.totalSolved.add(m23Delta); }
  if (hasU15) _pStats.YooAmatter.resets = _pStats.YooAmatter.resets.add(ascGainDelta);
  if (hasY42) { _pStats.YooAmatter.totalYooArium = _pStats.YooAmatter.totalYooArium.add(ariumGainDelta); player.YooAmatter.YooArium = player.YooAmatter.YooArium.add(ariumGainDelta); }
  if (hasM13) { player.YooAmatter.amount = player.YooAmatter.amount.add(prestGainDelta); _pStats.YooAmatter.totalAmount = _pStats.YooAmatter.totalAmount.add(prestGainDelta);}
  if (hasU35) _pStats.YooAity.totalYooChronium = _pStats.YooAity.totalYooChronium.add(chroniumGainDelta);
  if (hasOMG11) player.YooAity.OMGLight.YooA = player.YooAity.OMGLight.YooA.add(YooALightGainDelta);
  if (hasOMG21) player.YooAity.OMGLight.Arin = player.YooAity.OMGLight.Arin.add(ArinLightGainDelta);
  if (hasOMG31) {
    player.YooAity.OMGLight.Seunghee = player.YooAity.OMGLight.Seunghee.add(SeungheeLightGainDelta);
    player.YooAity.OMGLightAllocated.YooA.vocals = player.YooAity.OMGLightAllocated.YooA.vocals.add(AllocYooADelta);
    player.YooAity.OMGLightAllocated.YooA.dance = player.YooAity.OMGLightAllocated.YooA.dance.add(AllocYooADelta);
    player.YooAity.OMGLightAllocated.YooA.charisma = player.YooAity.OMGLightAllocated.YooA.charisma.add(AllocYooADelta);
  }


  const dimsYooA = _pDims.YooA;
  for (let i = 0, len = dimsYooA.length; i < len; i++) {
    const d = dimsYooA[i];
    if (d.unlocked) { d.updateAmount(diff); }
  }
  for (let i = 0, len = dimsYooAm.length; i < len; i++) {
    const d = dimsYooAm[i];
    if (d.unlocked) { d.updateAmount(diff); }
  }
  for (let i = 0, len = dimsShiah.length; i < len; i++) {
    const d = dimsShiah[i];
    if (d.unlocked) { d.updateAmount(diff); }
  }


  // OMGLights sparkles (hot loop optimized)
  const omgSparkles = pYooAity.OMGSparkles;
  if (OMGLights && OMGLights.length > 0) {

    const _getSG = (k, s) => OMG.getSparklesGain(k, s);
    for (let i = 0, len = OMGLights.length; i < len; ++i) {
      const k = OMGLights[i];
      const sparkle = omgSparkles[k];
      const sgVoc = _getSG(k, 'vocals').mul(diff);
      const sgDance = _getSG(k, 'dance').mul(diff);
      const sgChar = _getSG(k, 'charisma').mul(diff);
      sparkle.vocals = sparkle.vocals.add(sgVoc);
      sparkle.dance = sparkle.dance.add(sgDance);
      sparkle.charisma = sparkle.charisma.add(sgChar);
    }

  }

  if (__achKeysArray) {
    for (let ai = 0, alen = __achKeysArray.length; ai < alen; ++ai) {
      const rec = __achKeysArray[ai];
      const id = rec.id;
      if (!_pAch[id]) {
        const ach = rec.ach;
        if (ach.done?.()) {
          _pAch[id] = true;
          if (ach.onComplete) ach.onComplete();
          notifyAchievement(ach);
        }
      }
    }
  }

  if (__milestoneKeysByLayer) {
    for (const layerName in __milestoneKeysByLayer) {
      const layerDef = gameLayers[layerName];
      if (!layerDef) continue;
      const playerMilestones = _pMilestones[layerName];
      if (!playerMilestones) continue;
      const arr = __milestoneKeysByLayer[layerName];
      for (let mi = 0, mlen = arr.length; mi < mlen; ++mi) {
        const rec = arr[mi];
        const mid = rec.id;
        if (!playerMilestones[mid]) {
          const m = rec.m;
          if (m.done?.()) {
            playerMilestones[mid] = true;
            if (m.onComplete) m.onComplete();
            notifyMilestone(m, layerName);
          }
        }
      }
    }
  }

  for (const layer in _pAutobuyers) {
    const abList = _pAutobuyers[layer];
    for (const k in abList) {
      const ab = abList[k];
      const time = ab.timeToNextTick
      if (ab && ab.isOn && time && time == 0) ab.tick();
    }
  }

  // Prestige bestTime update
  for (const key in _pStats) {
    const st = _pStats[key];
    if (st && st.bestTime !== undefined) {
      const next = (gameLayers[key] && gameLayers[key].nextLayer) ? gameLayers[key].nextLayer : null;
      if (!next || !gameLayers[next].unlocked()) st.bestTimeThisReset = st.bestTime;
    }
  }

  // clear per-dimension caches once at end of tick (dimension.resetCache still exists but it's fine)
  for (const t in player.dimensions) {
    const arr = player.dimensions[t];
    for (let i = 0; i < arr.length; ++i) {
      const d = arr[i];
      if (d && d.resetCache) d.resetCache();
    }
  }

  __cachedInvDiff = null;
}

export function gameLoop() {
  if (typeof offline !== 'undefined' && offline.active) return;
  const now = Date.now();
  calc((now - (date || Date.now())) / 1000);
  date = now;
  window.dispatchEvent(new CustomEvent('GAME_EVENT.UPDATE'));
}

const exportsObj = {
    start
};
export default exportsObj;
