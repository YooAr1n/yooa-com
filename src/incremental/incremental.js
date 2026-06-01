/*
  incremental.js
  Full file with a fixed FPS scheduler (default 60 FPS) and start/stop/setFPS controls.
*/

import Decimal from "./break_eternity.js";
import { GameCache, GameDirty, Lazy } from "./cache.js";
import { instrumentDecimal, perfBegin, perfEnd, perfFrame } from "./performance.js";
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
  updateAllAutobuyerTime,
  flushAutobuyerInvalidation 
} from "./automation.js";
import { achievements, gameLayers } from "./layersData.js";
import { songs } from "./songs.js";

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
const DEC_0_8 = new Decimal(0.8);
const DEC_0_6 = new Decimal(0.6);
const DEC_0_4 = new Decimal(0.4);
const DEC_1_3 = new Decimal(1 / 3);
const DEC_1_02 = new Decimal(1.02);
const DEC_1_1 = new Decimal(1.1);
const DEC_EE24 = new Decimal('ee24');
const DEC_EE36 = new Decimal('ee36');
const DEC_EE55555 = new Decimal('ee55555');
const DEC_EEE46 = new Decimal('eee46');
const DEC_EEE200 = new Decimal('eee200');

instrumentDecimal(Decimal);

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
let __loopHandle = null;
let __loopRunning = false;
let __hiddenTimer = null;
let __lastSimAt = 0;
let __simAccumulator = 0;
const SIM_INTERVAL_MS = 1000/60; // 60 fps

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

export function resolveAllAutobuyerDefs() {
  if (!player?.autobuyers) return;
  for (const layerName in player.autobuyers) {
    for (const name in player.autobuyers[layerName]) {
      player.autobuyers[layerName][name]._getDef();  // triggers permanent cache
    }
  }
}

export function start() {
  load();
  resolveAllAutobuyerDefs();
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
    YooA: { energy: dZero },
    YooAmatter: { amount: dZero, YooArium: dZero, sparks: dZero, harmonics: dZero },
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
    OMGLight: omgl, OMGSparkles: omgsparkles, OMGLightAllocated: alloc, FanHearts: dZero,
    stream: {
      money: dZero,
      currentAlbumKey: "OHMYGIRL",
      currentSongIndex: { OHMYGIRL: 1, CLOSER: 1, PINKOCEAN: 1, LISTENTOMYWORD: 1, COLORINGBOOK: 1, SECRETGARDEN: 1, REMEMBERME: 1 },
      progress: { OHMYGIRL: 0, CLOSER: 0, PINKOCEAN: 0, LISTENTOMYWORD: 0, COLORINGBOOK: 0, SECRETGARDEN: 0, REMEMBERME: 0 },
      isStreaming: { OHMYGIRL: false, CLOSER: false, PINKOCEAN: false, LISTENTOMYWORD: false, COLORINGBOOK: false, SECRETGARDEN: false, REMEMBERME: false },
      unlocked: { OHMYGIRL: true, CLOSER: false, PINKOCEAN: false, LISTENTOMYWORD: false, COLORINGBOOK: false, SECRETGARDEN: false, REMEMBERME: false },
      hasAuto: { OHMYGIRL: false, CLOSER: false, PINKOCEAN: false, LISTENTOMYWORD: false, COLORINGBOOK: false, SECRETGARDEN: false, REMEMBERME: false },
      streams: { OHMYGIRL: Decimal.dZero, CLOSER: Decimal.dZero, PINKOCEAN: Decimal.dZero, LISTENTOMYWORD: Decimal.dZero, COLORINGBOOK: Decimal.dZero, SECRETGARDEN: Decimal.dZero, REMEMBERME: Decimal.dZero }
    }
  };

  p.upgrades = getStartUpgrades(); p.milestones = getStartMilestones(); p.challenges = getStartChallenges(); p.math = getStartMath();
  p.dimensions = getStartDimensions(); p.stats = getStartStats(); p.gain = getStartGains(); p.autobuyers = getStartAutobuyers();
  return p;
}

export const player = getStartPlayer();
window.player = player;

export function getStartGains() {
  return { YooA: { points: '', dimensions: Array(5).fill(''), energy: '' }, YooAmatter: { amount: '', dimensions: Array(5).fill(''), sparks: '', harmonics: '' }, YooAity: { amount: '', embers: '', YooChronium: '', SeungheePoints: '', YubinPoints: '', HyojungPoints: '', MimiPoints: '', MiracleLight: '' }, Shiah: { dimensions: Array(7).fill('') }, Arin: { Arinium: '' } };
}
export function getStartUpgrades() { return { YooA: {}, YooA_energy: {}, YooAmatter: {}, YooAity: {}, sparks: {}, Seunghee: {}, Yubin: {}, Arinium: {}, Hyojung: {}, Mimi: {}, OMG: {}, Fandom: {} }; }
export function getStartMilestones() { return { YooAity: {} }; }
export function getStartChallenges() { return { YooAmatter: {} }; }
export function getStartMath() { return { YooA: { mathProblem: '1 + 1', correctAnswer: 2, solved: dZero, isCorrect: false, showCorrect: false }, YooAmatter: { mathProblem: '1 * 1', correctAnswer: 1, solved: dZero, isCorrect: false, showCorrect: false }, YooAity: { mathProblem: '1 ^ 1', correctAnswer: 1, solved: dZero, isCorrect: false, showCorrect: false } }; }
export function getStartStats() { return { General: { totalPoints: dZero, totalTime: dZero, totalSolved: dZero }, YooA: { solved: dZero }, YooAmatter: { totalAmount: dZero, totalYooArium: dZero, totalSparks: dZero, time: dZero, bestTime: new Decimal(1e100), bestTimeThisReset: new Decimal(1e100), resets: dZero, solved: dZero }, YooAity: { totalAmount: dZero, totalEmbers: dZero, totalYooChronium: dZero, totalFanHearts: dZero, totalMoney: dZero, time: dZero, bestTime: new Decimal(1e100), bestTimeThisReset: new Decimal(1e100), resets: dZero, solved: dZero }, last_prestiges: { YooAmatter: Array(10).fill(null), YooAity: Array(10).fill(null) } } }

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
  out.YooAmatter = ymNames.map((name, i) => new Dimension(
    "YooAmatter",
    `YooAmatter ${name}`,
    dZero, dZero, dZero,
    i + 1,
    "YooAmatter", // costDisp (display label if you want)
    "Fan Hearts",                        // rankCostDisp
    "YooAmatter",        // layer: use player.YooAmatter for tier>=3
    "amount",                             // currency property within that layer
    "YooAity",
    "FanHearts"
  ));
  out.Shiah = shNames.map((name, i) => new Dimension("Shiah", `Shi-ah ${name}`, dZero, dZero, dZero, i + 1, "YooA Essence", undefined, "YooAity"));
  return out;
}

export function getStartAutobuyers() {
  const make = (a, b, c, d, e, f) => new Autobuyer(a, b, c, d, e, f);
  return {
    YooA: { "YooA Lines": make("YooA", "YooAmatter", "YooA Lines", false, 0), "YooA Planes": make("YooA", "YooAmatter", "YooA Planes", false, 0), "YooA Dimension 3+": make("YooA", "YooAmatter", "YooA Dimension 3+", false, 0), "YooA Upgrades": make("YooA", "YooAmatter", "YooA Upgrades", false, 0), "YooA Dimension Rank": make("YooA", "YooAmatter", "YooA Dimension Rank", false, 0) },
    YooAmatter: { "YooAmatter Prestige": make("YooAmatter", "YooAity", "YooAmatter Prestige", false, 0, 0), "YooAmatter Formations": make("YooAmatter", "YooAity", "YooAmatter Formations", false, 0), "YooAmatter Upgrades": make("YooAmatter", "YooAity", "YooAmatter Upgrades", false, 0), "Spark Upgrades": make("YooAmatter", "YooAity", "Spark Upgrades", false, 0), "Arin Level": make("YooAmatter", "YooAity", "Arin Level", false, 0) },
    YooAity: {
      "YooAity Prestige": make("YooAity", null, "YooAity Prestige", false, 0, 0),
      "Arin Rank": make("YooAity", null, "Arin Rank", false, 0),
      "YooAity Upgrades": make("YooAity", null, "YooAity Upgrades", false, 0),
      "Shi-ah Echoes": make("YooAity", null, "Shi-ah Echoes", false, 0),
      "Seunghee Upgrades": make("YooAity", null, "Seunghee Upgrades", false, 0),
      "Yubin Upgrades": make("YooAity", null, "Yubin Upgrades", false, 0),
      "Arinium Upgrades (Arin-Proof)": make("YooAity", null, "Arinium Upgrades (Arin-Proof)", false, 0),
      "Hyojung Upgrades (Arin-Proof)": make("YooAity", null, "Hyojung Upgrades (Arin-Proof)", false, 0),
      "Mimi Upgrades (Arin-Proof)": make("YooAity", null, "Mimi Upgrades (Arin-Proof)", false, 0),
      "Arin Tier (Arin-Proof)": make("YooAity", null, "Arin Tier (Arin-Proof)", false, 0),
      "OH MY GIRL Upgrades (Arin-Proof)": make("YooAity", null, "OH MY GIRL Upgrades (Arin-Proof)", false, 0)
    }
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
  if (inChallenge('YooAmatter', 1)) gain = DEC_MUL.call(gain, DEC_0_5);
  if (inChallenge('YooAmatter', 3)) gain = DEC_MUL.call(gain, DEC_0_4);
  if (hasChallenge('YooAmatter', 1)) {
    gain = DEC_MUL.call(gain, challengeEffect('YooAmatter', 1)[0]);
  }
  if (hasChallenge('YooAmatter', 4)) {
    gain = DEC_MUL.call(gain, challengeEffect('YooAmatter', 4)[1]);
  }

  return gain
}

function computeYooADilation() {
  let gain = hasUpgrade("YooA_energy", 11) ? upgradeEffect("YooA_energy", 11) : dOne
  if (inChallenge('YooAmatter', 4) && gameLayers.YooAmatter && gameLayers.YooAmatter.challenges && gameLayers.YooAmatter.challenges[4]) {
    gain = DEC_MUL.call(gain, gameLayers.YooAmatter.challenges[4].dilEff());
  }
  gain = DEC_MUL.call(gain, upgradeEffect("sparks", 21));
  if (hasUpgrade("Yubin", 34)) gain = DEC_MUL.call(gain, upgradeEffect("Yubin", 34));
  if (hasUpgrade("Arinium", 32)) gain = DEC_MUL.call(gain, upgradeEffect("Arinium", 32));
  if (hasUpgrade("Arinium", 33)) gain = DEC_MUL.call(gain, upgradeEffect("Arinium", 33));
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
  const dilation = computeYooADilation();

  // Short-circuit expensive pow when exponent is 1
  if (!DEC_EQ.call(exponent, dOne)) {
    gain = DEC_POW.call(gain, exponent);
  }
  if (!DEC_EQ.call(dilation, dOne)) {
    gain = gain.dilate(dilation)
  }

  return gain;
}

export function computeYooAGainBase2() {
  let gain = GameCache.YooAGainBase.value;
  let power = dOne;
  if (hasUpgrade("YooAmatter", 25)) power = DEC_DIV.call(dOne, upgradeEffect("YooAmatter", 25)[0]);

  const powA = DEC_POW.call(DEC_0_5, power);
  const powB = DEC_POW.call(DEC_0_4, power);
  const powC = DEC_POW.call(DEC_1_3, power);

  if (DEC_GTE.call(gain, DEC_EE24)) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div(1e24), powA).mul(powA.recip().mul(1e24)).sub(powA.recip().sub(1).mul(1e24)).pow10();
  }
  if (DEC_GTE.call(gain, DEC_EE36)) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div(1e36), powB).mul(powB.recip().mul(1e36)).sub(powB.recip().sub(1).mul(1e36)).pow10();
  }
  if (DEC_GTE.call(gain, DEC_EE55555)) {
    const lg = DEC_LOG10.call(gain);
    gain = DEC_POW.call(lg.div('e55555'), powC).mul(powC.recip().mul('e55555')).sub(powC.recip().sub(1).mul('e55555')).pow10();
  }
  return gain;
}

export function computeYooAGain() {
  let gain = GameCache.YooAGainBase2.value;
  let power = dOne;

  const powA = DEC_POW.call(DEC_0_8, power);
  const powB = DEC_POW.call(DEC_0_6, power);

  if (DEC_GTE.call(gain, DEC_EEE46)) {
    const lg = DEC_LOG10.call(DEC_LOG10.call(gain));
    gain = DEC_POW.call(lg.div(1e46), powA).mul(powA.recip().mul(1e46)).sub(powA.recip().sub(1).mul(1e46)).pow10().pow10();
  }
  if (DEC_GTE.call(gain, DEC_EEE200)) {
    const lg = DEC_LOG10.call(DEC_LOG10.call(gain));
    gain = DEC_POW.call(lg.div(1e200), powB).mul(powB.recip().mul(1e200)).sub(powB.recip().sub(1).mul(1e200)).pow10().pow10();
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

// compute YooADimensionPowerMult 
export function computeYooADimensionPowerMult() {
  let mult = gameLayers.YooAmatter.getYooAmatterHarmonicsEffect();
  if (hasUpgrade("OMG", 36)) mult = DEC_MUL.call(mult, 12.5)
  if (hasUpgrade("YooA_energy", 12)) mult = DEC_MUL.call(mult, upgradeEffect("YooA_energy", 12))
  mult = DEC_MUL.call(mult, upgradeEffect("YooA_energy", 13))
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
    if (rowComplete) base = DEC_MUL.call(base, DEC_1_1);
  }
  return DEC_MUL.call(base, DEC_POW.call(DEC_1_02, countAch));
}

// IMPORTANT: do this once after functions are declared (prevents circular import / missing reference)
(function initGameCache() {
  // If GameCache was already populated (unlikely), overwrite to ensure correct bindings.
  GameCache.YooAGainBase = new Lazy(() => computeYooAGainBase());
  GameCache.YooAGainBase2 = new Lazy(() => computeYooAGainBase2());
  GameCache.YooAGain = new Lazy(() => computeYooAGain());
  GameCache.YooAPerSecond = new Lazy(() => computeYooAPerSecond());

  GameCache.YooADimensionMult = new Lazy(() => computeYooADimensionMult());
  GameCache.YooADimensionPowerMult = new Lazy(() => computeYooADimensionPowerMult());
  GameCache.YooAmatterFormationMult = new Lazy(() => computeYooAmatterFormationMult());
  GameCache.ShiahEchoMult = new Lazy(() => computeShiahEchoMult());

  GameCache.AchievementMult = new Lazy(() => computeAchievementMultiplier(), { persistent: true });
  GameCache.YooAmatterHarmonicsGain = new Lazy(() => gameLayers.YooAmatter.getYooAmatterHarmonicsGain());
  GameCache.YooAmatterResetGain = new Lazy(() => gameLayers.YooAmatter.getResetGain());
  GameCache.YooAityResetGain = new Lazy(() => gameLayers.YooAity.getResetGain());
  GameCache.YooAitySeungheeGain = new Lazy(() => gameLayers.YooAity.getSeungheeGain());
  GameCache.YooAityYubinGain = new Lazy(() => gameLayers.YooAity.getYubinGain());
  GameCache.YooAityHyojungGain = new Lazy(() => gameLayers.YooAity.getHyojungGain());
  GameCache.YooAityMimiGain = new Lazy(() => gameLayers.YooAity.getMimiGain());
  GameCache.YooAityAgeGain = new Lazy(() => gameLayers.YooAity.getAgeGain());
  GameCache.AriniumGain = new Lazy(() => getAriniumGain());
  GameCache.OMGMiracleLightGain = new Lazy(() => gameLayers.OMG.getMiracleLightGain());
  GameCache.OMGFanHeartGain = new Lazy(() => gameLayers.OMG.getFanHeartGain());
  GameCache.OMGSparklesGains = new Lazy(() => precomputeSparklesGains());
})();

function precomputeSparklesGains() {
  const OMG = gameLayers.OMG;
  const keys = __OMGLights || Object.keys(player.YooAity.OMGLight);
  __OMGLights = keys;
  const out = {};
  for (let i = 0, len = keys.length; i < len; ++i) {
    const k = keys[i];
    out[k] = {
      vocals: OMG.getSparklesGain(k, 'vocals'),
      dance: OMG.getSparklesGain(k, 'dance'),
      charisma: OMG.getSparklesGain(k, 'charisma')
    };
  }
  return out;
}

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
    const nextVal = DEC_ADD.call(oldVal, DEC_MUL.call(gain, diff));
    pl[currencyPath] = nextVal;
    if (!nextVal.eq(oldVal)) GameDirty.currencies = true;
    return formatGain(oldVal, gain, inv, percent);
  }
  const keys = _parsePath(currencyPath);
  let obj = pl;
  const len = keys.length - 1;
  for (let i = 0; i < len; ++i) obj = obj[keys[i]];
  const last = keys[len], oldVal = obj[last];
  const nextVal = DEC_ADD.call(oldVal, DEC_MUL.call(gain, diff));
  obj[last] = nextVal;
  if (!nextVal.eq(oldVal)) GameDirty.currencies = true;
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
  GameDirty.markAll();
}
export function notifyMilestone(milestone, layerName) {
  const name = typeof milestone.title === 'function' ? milestone.title() : milestone.title;
  window.dispatchEvent(new CustomEvent('milestone-unlocked', { detail: { message: `${name} unlocked!`, layerName } }));
  GameDirty.markAll();
}

export function notifySong(song) {
  // dispatch event as before
  window.dispatchEvent(new CustomEvent('song', { detail: `${song.name} streamed!` }));
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
  const __perf = perfBegin();
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
  const harmonicsGain = GameCache.YooAmatterHarmonicsGain.value;
  const sparkGain = (dimsYooAm && dimsYooAm[0] && dimsYooAm[0].effect) || dZero;
  const emberGain = (dimsShiah && dimsShiah[0] && dimsShiah[0].effect) || dZero;

  const YooAityLayer = gameLayers.YooAity;
  const SeungheeGain = GameCache.YooAitySeungheeGain.value || dZero;
  const YubinGain = GameCache.YooAityYubinGain.value || dZero;
  const HyojungGain = GameCache.YooAityHyojungGain.value || dZero;
  const MimiGain = GameCache.YooAityMimiGain.value || dZero;
  const ageGain = GameCache.YooAityAgeGain.value || dZero;


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


  const resetGainRaw = GameCache.YooAmatterResetGain.value || dZero;
  const resetGainRaw2 = GameCache.YooAityResetGain.value || dZero;
  const prestGain = DEC_DIV.call(resetGainRaw, d100);
  const prestGain2 = DEC_DIV.call(resetGainRaw2, d100);

  const ascGain = upgradeEffect('YooAity', 15);
  const ariumGain = upgradeEffect('YooAmatter', 42);
  const chroniumGain = upgradeEffect('YooAity', 35);
  const YooALightGain = upgradeEffect('OMG', 11);
  const ArinLightGain = upgradeEffect('OMG', 21);
  const SeungheeLightGain = upgradeEffect('OMG', 31);
  const YubinLightGain = upgradeEffect('OMG', 41);
  const YooAPower = gameLayers.YooA_energy.getYooAPower()
  const AllocYooAGain = DEC_DIV.call(player.YooAity.OMGLight.YooA, d100);
  const AllocArinGain = DEC_DIV.call(player.YooAity.OMGLight.Arin, d100);
  const AllocSeungheeGain = DEC_DIV.call(player.YooAity.OMGLight.Seunghee, d100);
  const AllocYubinGain = DEC_DIV.call(player.YooAity.OMGLight.Yubin, d100);
  const AriniumGain = GameCache.AriniumGain.value || dZero;
  const MiracleLightGain = GameCache.OMGMiracleLightGain.value || dZero;

  // cached booleans per tick (avoid duplicate hasUpgrade calls)
  const hasY22 = hasUpgrade('YooAmatter', 22);
  const hasU13 = hasUpgrade('YooAity', 13);
  const hasU15 = hasUpgrade('YooAity', 15);
  const hasU35 = hasUpgrade('YooAity', 35);
  const hasOMG11 = hasUpgrade('OMG', 11);
  const hasOMG21 = hasUpgrade('OMG', 21);
  const hasOMG31 = hasUpgrade('OMG', 31);
  const hasOMG41 = hasUpgrade('OMG', 41);
  const hasY42 = hasUpgrade('YooAmatter', 42);
  const hasM13 = hasMilestone('YooAity', 13);
  const hasM23 = hasMilestone('YooAity', 23);
  const hasMIR13 = hasUpgrade("Fandom", 13);
  const hasMIR23 = hasUpgrade("Fandom", 23);
  const hasAR33 = hasUpgrade("Arinium", 33);

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
  const AllocArinDelta = AllocArinGain.mul(diffMul);
  const AllocSeungheeDelta = AllocSeungheeGain.mul(diffMul);
  const AllocYubinDelta = AllocYubinGain.mul(diffMul);
  const YooALightGainDelta = YooALightGain.mul(diffMul);
  const ArinLightGainDelta = ArinLightGain.mul(diffMul);
  const SeungheeLightGainDelta = SeungheeLightGain.mul(diffMul);
  const YubinLightGainDelta = YubinLightGain.mul(diffMul);
  const YooAEnergyGainDelta = YooAPower.mul(diffMul);

  const pGainYooAity = _pGain.YooAity;
  _pGain.YooA.points = gainCurrency(player, 'YooAPoints', perSecondGain, diff);
  _pGain.YooAmatter.sparks = gainCurrency(player, 'YooAmatter.sparks', sparkGain, diff);
  _pGain.YooAmatter.harmonics = gainCurrency(player, 'YooAmatter.harmonics', harmonicsGain, diff);
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
  if (hasM13) { player.YooAmatter.amount = player.YooAmatter.amount.add(prestGainDelta); _pStats.YooAmatter.totalAmount = _pStats.YooAmatter.totalAmount.add(prestGainDelta); }
  if (hasU35) _pStats.YooAity.totalYooChronium = _pStats.YooAity.totalYooChronium.add(chroniumGainDelta);
  if (hasOMG11) player.YooAity.OMGLight.YooA = player.YooAity.OMGLight.YooA.add(YooALightGainDelta);
  if (hasOMG21) player.YooAity.OMGLight.Arin = player.YooAity.OMGLight.Arin.add(ArinLightGainDelta);
  if (hasOMG31) {
    player.YooAity.OMGLight.Seunghee = player.YooAity.OMGLight.Seunghee.add(SeungheeLightGainDelta);
    player.YooAity.OMGLightAllocated.YooA.vocals = player.YooAity.OMGLightAllocated.YooA.vocals.add(AllocYooADelta);
    player.YooAity.OMGLightAllocated.YooA.dance = player.YooAity.OMGLightAllocated.YooA.dance.add(AllocYooADelta);
    player.YooAity.OMGLightAllocated.YooA.charisma = player.YooAity.OMGLightAllocated.YooA.charisma.add(AllocYooADelta);
  }
  if (hasOMG41) player.YooAity.OMGLight.Yubin = player.YooAity.OMGLight.Yubin.add(YubinLightGainDelta);
  if (hasMIR13) {
    player.YooAity.OMGLightAllocated.Arin.vocals = player.YooAity.OMGLightAllocated.Arin.vocals.add(AllocArinDelta);
    player.YooAity.OMGLightAllocated.Arin.dance = player.YooAity.OMGLightAllocated.Arin.dance.add(AllocArinDelta);
    player.YooAity.OMGLightAllocated.Arin.charisma = player.YooAity.OMGLightAllocated.Arin.charisma.add(AllocArinDelta);
  }

  if (hasMIR23) {
    player.YooAity.OMGLightAllocated.Seunghee.vocals = player.YooAity.OMGLightAllocated.Seunghee.vocals.add(AllocSeungheeDelta);
    player.YooAity.OMGLightAllocated.Seunghee.dance = player.YooAity.OMGLightAllocated.Seunghee.dance.add(AllocSeungheeDelta);
    player.YooAity.OMGLightAllocated.Seunghee.charisma = player.YooAity.OMGLightAllocated.Seunghee.charisma.add(AllocSeungheeDelta);
  }

  if (hasAR33) {
    player.YooAity.OMGLightAllocated.Yubin.vocals = player.YooAity.OMGLightAllocated.Yubin.vocals.add(AllocYubinDelta);
    player.YooAity.OMGLightAllocated.Yubin.dance = player.YooAity.OMGLightAllocated.Yubin.dance.add(AllocYubinDelta);
    player.YooAity.OMGLightAllocated.Yubin.charisma = player.YooAity.OMGLightAllocated.Yubin.charisma.add(AllocYubinDelta);
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

    const sparklesGains = GameCache.OMGSparklesGains.value;
    for (let i = 0, len = OMGLights.length; i < len; ++i) {
      const k = OMGLights[i];
      const sparkle = omgSparkles[k];
      const gains = sparklesGains[k];
      if (!gains) continue;
      const sgVoc = gains.vocals.mul(diff);
      const sgDance = gains.dance.mul(diff);
      const sgChar = gains.charisma.mul(diff);
      sparkle.vocals = sparkle.vocals.add(sgVoc);
      sparkle.dance = sparkle.dance.add(sgDance);
      sparkle.charisma = sparkle.charisma.add(sgChar);
    }

  }

  const playerStream = player.YooAity.stream;
  for (const album in playerStream.isStreaming) {
    const currentAlbumKey = album;
    const currentAlbum = songs.albums[currentAlbumKey];
    const songLength = currentAlbum.lengthPerSong / gameLayers.Fandom.getStreamSpeed(); // seconds per song
    const isAutomated = playerStream.hasAuto[currentAlbumKey]
    if (playerStream.isStreaming[currentAlbumKey] && (album === playerStream.currentAlbumKey || currentAlbum.isBackStreamable())) {
      playerStream.progress[currentAlbumKey] += parseFloat(diff)
      if (playerStream.progress[currentAlbumKey] >= songLength) {
        const times = isAutomated ? Math.floor(playerStream.progress[currentAlbumKey] / songLength) : 1;
        playerStream.progress[currentAlbumKey] -= times * songLength;
        playerStream.streams[currentAlbumKey] = playerStream.streams[currentAlbumKey].add(times);
        const fanGain = GameCache.OMGFanHeartGain.value.mul(times)
        const moneyGain = gameLayers.Fandom.getMoneyGain(currentAlbum).mul(times)
        player.YooAity.FanHearts = player.YooAity.FanHearts.add(fanGain);
        player.stats.YooAity.totalFanHearts = player.stats.YooAity.totalFanHearts.add(fanGain);

        if (hasUpgrade("Fandom", 13)) {
          player.YooAity.stream.money = player.YooAity.stream.money.add(moneyGain);
          player.stats.YooAity.totalMoney = player.stats.YooAity.totalMoney.add(moneyGain);
        }

        if (!isAutomated) {
          notifySong(currentAlbum.songs[playerStream.currentSongIndex[currentAlbumKey]]);
          playerStream.isStreaming[currentAlbumKey] = false;
          playerStream.progress[currentAlbumKey] = 0;
        }
        playerStream.currentSongIndex[currentAlbumKey] = (playerStream.currentSongIndex[currentAlbumKey] + times - 1) % Object.keys(currentAlbum.songs).length + 1;
      }
    }
  }

  if (player.dimensions.YooA[0].powerUnlocked) player.YooA.energy = player.YooA.energy.add(YooAEnergyGainDelta)

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

  flushAutobuyerInvalidation();

  for (const layer in _pAutobuyers) {
    const abList = _pAutobuyers[layer];
    for (const k in abList) {
      const ab = abList[k];
      if (ab && typeof ab.tickDue === 'function') ab.tickDue();
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

  __cachedInvDiff = null;
  perfEnd('calc', __perf);
}

export function gameLoop() {
  const __frame = perfBegin();
  if (typeof offline !== 'undefined' && offline.active) return;
  const now = Date.now();
  calc((now - (date || Date.now())) / 1000);
  date = now;
  const __ui = perfBegin();
  window.dispatchEvent(new CustomEvent('GAME_EVENT.UPDATE'));
  perfEnd('uiUpdate', __ui);
  GameDirty.clearFrame();
  return perfEnd('gameLoop', __frame);
}

function rafLoop(ts) {
  if (!__loopRunning) return;
  const __frame = perfBegin();
  let scripting = 0;
  if (typeof document !== 'undefined' && document.hidden) {
    __hiddenTimer = window.setTimeout(rafLoop, 1000);
    scripting += gameLoop() || 0;
    perfFrame(__frame, scripting);
    return;
  }
  if (!__lastSimAt) __lastSimAt = ts;
  __simAccumulator += ts - __lastSimAt;
  __lastSimAt = ts;
  if (__simAccumulator >= SIM_INTERVAL_MS) {
    scripting += gameLoop() || 0;
    __simAccumulator = 0;
  }
  perfFrame(__frame, scripting);
  __loopHandle = window.requestAnimationFrame(rafLoop);
}

export function startGameLoop() {
  if (__loopRunning) return;
  __loopRunning = true;
  __lastSimAt = 0;
  __simAccumulator = 0;
  date = Date.now();
  window.date = date;
  __loopHandle = window.requestAnimationFrame(rafLoop);
}

export function stopGameLoop() {
  __loopRunning = false;
  if (__loopHandle !== null) window.cancelAnimationFrame(__loopHandle);
  if (__hiddenTimer !== null) window.clearTimeout(__hiddenTimer);
  __loopHandle = null;
  __hiddenTimer = null;
  __lastSimAt = 0;
  __simAccumulator = 0;
}

const exportsObj = {
  start
};
export default exportsObj;
