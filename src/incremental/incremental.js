import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue";
import { gameLayers, achievements, hasUpgrade, upgradeEffect, inChallenge, hasChallenge, challengeEffect } from "./main.js";
import Dimension from "./dimensions.js";
import Autobuyer from "./automation.js";

const FPS = 60;
window.FPS = FPS;

// Initialize player as a reactive object
export const player = reactive(getStartPlayer());
let date = Date.now();
window.player = player;
window.date = date;

export function getStartPlayer() {
    return {
        tab: "Main",
        subtabs: {
            Main: "main",
            Options: "saving",
            YooAmatter: "main",
        },
        time: Date.now(),
        YooAPoints: Decimal.dZero,
        YooAmatter: {
            amount: Decimal.dZero,
            YooArium: Decimal.dZero,
            sparks: Decimal.dZero,
        },
        inChallenge: ["", ""],
        upgrades: getStartUpgrades(),
        challenges: getStartChallenges(),
        math: getStartMath(),
        dimensions: getStartDimensions(),
        stats: getStartStats(),
        gain: getStartGains(),
        achievements: {},
        autobuyers: getStartAutobuyers(),
        Arin: Decimal.dZero
    };
}

export function getStartGains() {
    return {
        YooA: {
            points: "",
            dimensions: Array(5).fill(""),
        },
        YooAmatter: {
            amount: "",
            dimensions: Array(5).fill(""),
            sparks: ""
        }
    };
}

export function getStartUpgrades() {
    return {
        YooA: {},
        YooAmatter: {}
    };
}

export function getStartChallenges() {
    return {
        YooAmatter: {}
    };
}

export function getStartDimensions() {
    const names = ["Lines", "Planes", "Spaces", "Realms", "Entities"];
    const ymNames = ["Threads", "Weaves", "Flows", "Realizations", "Cores"];
    return {
        YooA: names.map((name, i) => {
            const tier = i + 1;
            // For tiers > 2, use "YooAmatter" as cost type if needed.
            const costType = tier > 2 ? "YooAmatter" : undefined;
            return new Dimension("YooA", `YooA ${name}`, Decimal.dZero, Decimal.dZero, tier, costType, costType);
        }),
        YooAmatter: ymNames.map((name, i) => {
            const tier = i + 1;
            const costType = "YooAmatter";
            return new Dimension("YooAmatter", `YooAmatter ${name}`, Decimal.dZero, Decimal.dZero, tier, costType, costType);
        }),
    };
}

export function getStartAutobuyers() {
    return {
        YooAmatter: {
            "YooA Lines": new Autobuyer("YooAmatter", "YooA Lines", false, 0),
            "YooA Planes": new Autobuyer("YooAmatter", "YooA Planes", false, 0),
            "YooA Upgrades": new Autobuyer("YooAmatter", "YooA Upgrades", false, 0),
            "YooAmatter Prestige": new Autobuyer("YooAmatter", "YooAmatter Prestige", false, 0, 0)
        }
    };
}

export function getStartMath() {
    return {
        YooA: {
            mathProblem: "1 + 1",
            correctAnswer: 2,
            solved: Decimal.dZero,
            isCorrect: false,
            showCorrect: false
        },
        YooAmatter: {
            mathProblem: "1 * 1",
            correctAnswer: 1,
            solved: Decimal.dZero,
            isCorrect: false,
            showCorrect: false
        }
    };
}

export function getStartStats() {
    return {
        General: {
            totalPoints: Decimal.dZero,
            totalTime: Decimal.dZero,
            totalSolved: Decimal.dZero
        },
        YooAmatter: {
            totalAmount: Decimal.dZero,
            totalYooArium: Decimal.dZero,
            totalSparks: Decimal.dZero,
            time: Decimal.dZero,
            resets: Decimal.dZero,
        }
    };
}

export function start() {
    load();
}

//–––––––––––––––––––––––––––
// CALCULATOR FUNCTIONS
//–––––––––––––––––––––––––––

/**
 * Multiplies a base multiplier by each upgrade effect whose condition is met.
 */
export function calculateMultipliers(source, layer, ids, baseMultiplier = Decimal.dOne) {
    let multiplier = baseMultiplier;
    for (let id of ids) {
        if (source(layer, id)) {
            multiplier = multiplier.mul(upgradeEffect(layer, id));
        }
    }
    return multiplier;
}

/**
 * Calculates the gain for YooA Points.
 */
export function getYooAGain() {
    const yooAUpgrades = calculateMultipliers(hasUpgrade, "YooA", [11, 12, 14, 23, 24, 31], new Decimal(0.1));
    const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, "YooAmatter", [12]);
    const dimensionEffect = player.dimensions.YooA[0]?.effect || Decimal.dOne;
    const upgrade14Effect = gameLayers.YooA.upgrades[14]?.effectGain() || Decimal.dOne;
    const achievementMultiplier = calculateAchievementMultiplier();
    const yooAmatterEffect = gameLayers.YooAmatter.effect();

    let gain = yooAUpgrades
        .mul(yooAmatterUpgrades)
        .mul(dimensionEffect)
        .mul(upgrade14Effect)
        .mul(achievementMultiplier)
        .mul(yooAmatterEffect);

    if (player.achievements[15]) gain = gain.mul(achievements[15].rewardEffect());
    if (player.achievements[16]) gain = gain.mul(achievements[16].rewardEffect());

    // Process challenge effects in a simple loop.
    const challengeEffects = { 1: 0.5, 3: 0.4 };
    for (const [id, exponent] of Object.entries(challengeEffects)) {
        if (inChallenge("YooAmatter", id)) {
            gain = gain.pow(exponent);
        }
    }

    const sparkEffectExponent = gameLayers.YooAmatter.YooAmatterSparkEffect()[1];
    gain = gain.pow(sparkEffectExponent);

    if (hasChallenge("YooAmatter", 1)) gain = gain.pow(challengeEffect("YooAmatter", 1)[0]);
    if (hasChallenge("YooAmatter", 4)) gain = gain.pow(challengeEffect("YooAmatter", 4)[1]);
    if (inChallenge("YooAmatter", 4)) gain = gain.dilate(gameLayers.YooAmatter.challenges[4]?.dilEff() || Decimal.dOne);

    return gain;
}

export function getYooAPerSecond() {
    return hasUpgrade("YooA", 21) ? upgradeEffect("YooA", 21) : Decimal.dZero;
}

/**
 * Computes a multiplier for YooA dimensions.
 */
export function getYooADimensionMult() {
    const yooAUpgrades = calculateMultipliers(hasUpgrade, "YooA", [22, 32, 34]);
    const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, "YooAmatter", [11, 13]);
    const upgrade33Effect = gameLayers.YooA.upgrades[33]?.effectGain() || Decimal.dOne;

    let mult = yooAUpgrades.mul(yooAmatterUpgrades).mul(upgrade33Effect);

    const achievementIds = [18, 23, 25, 32, 36];
    for (let id of achievementIds) {
        if (player.achievements[id]) {
            mult = mult.mul(achievements[id].rewardEffect());
        }
    }

    if (player.achievements[28]) {
        mult = mult.mul(calculateAchievementMultiplier());
    }

    return mult;
}

/**
 * Computes a multiplier for YooAmatter formation.
 */
export function getYooAmatterFormationMult() {
    const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, "YooAmatter", [53, 54]);
    const sparkUpgrades = calculateMultipliers(hasUpgrade, "sparks", [12]);

    let mult = yooAmatterUpgrades.mul(sparkUpgrades);
    
    const achievementIds = [43];
    for (let id of achievementIds) {
        if (player.achievements[id]) {
            mult = mult.mul(achievements[id].rewardEffect());
        }
    }

    if (player.achievements[47]) {
        mult = mult.mul(calculateAchievementMultiplier());
    }
    return mult;
}

/**
 * Returns true if the player is in any challenge.
 */
export function inAnyChallenge() {
    return player.inChallenge.some(challenge => challenge !== "");
}

/**
 * Returns true if any challenge has been completed.
 */
export function completedAnyChallenge() {
    return Object.values(player.challenges).some(category =>
        Object.values(category).some(completed => completed)
    );
}

/**
 * Checks whether the given achievement is unlocked.
 */
export function hasAchievement(id) {
    return !!player.achievements[id];
}

/**
 * Optimized achievement multiplier calculation.
 * It counts individual unlocked achievements and applies a row bonus (1.1×) if a row is complete.
 */
export function calculateAchievementMultiplier() {
    let baseMultiplier = Decimal.dOne;
    const playerAchs = new Set(Object.keys(player.achievements));
    const achKeys = Object.keys(achievements);
    let countAch = 0;
    const totalRows = Math.ceil(achKeys.length / 8);

    for (let row = 0; row < totalRows; row++) {
        let rowComplete = true;
        for (let j = 0; j < 8; j++) {
            const index = row * 8 + j;
            if (index >= achKeys.length) break;
            if (playerAchs.has(achKeys[index])) {
                countAch++;
            } else {
                rowComplete = false;
            }
        }
        if (rowComplete) {
            baseMultiplier = baseMultiplier.mul(1.1);
        }
    }
    // Multiply individual achievement multipliers at once.
    baseMultiplier = baseMultiplier.mul(Decimal.pow(1.02, countAch));
    return baseMultiplier;
}

/**
 * Increases the player's currency along a given path.
 * The currency object is traversed only once per call.
 */
export function gainCurrency(pl, currencyPath, gain, diff, percent) {
    const keys = currencyPath.split(".");
    const lastKey = keys.pop();
    const currencyObj = keys.reduce((obj, key) => obj[key], pl);

    const formattedGain = formatGain(currencyObj[lastKey], gain, Decimal.div(1, diff), percent);
    currencyObj[lastKey] = currencyObj[lastKey].add(gain.mul(diff));
    return formattedGain;
}

export function notifyAchievement(achievement) {
    const message = `${achievement.title} unlocked!`;
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: message }));
}

/**
 * Runs a buy-max operation on all dimensions of the specified type.
 */
export function maxAllDimensions(type) {
    const dims = player.dimensions[type];
    if (type === "YooA") {
        for (const dim of dims) {
            if (dim.unlocked && (dim.tier === 1 || dim.tier === 2)) {
                dim.buyMax(player);
            }
        }
    } else {
        for (const dim of dims) {
            if (dim.unlocked) {
                dim.buyMax(player);
            }
        }
    }
}

/**
 * Main game tick: updates currencies, dimensions, achievements, and autobuyers.
 */
export function calc(diff) {
    const now = Date.now();
    const gain = getYooAPerSecond();
    const sparkGain = player.dimensions.YooAmatter[0].effect;
    const YooAriumGain = upgradeEffect("YooAmatter", 42);
    const timeIncrement = Decimal.dOne;
    const upgrade22Effect = upgradeEffect("YooAmatter", 22) || Decimal.dZero;

    // Batch currency updates.
    player.gain.YooA.points = gainCurrency(player, "YooAPoints", gain, diff);
    gainCurrency(player, "stats.General.totalPoints", gain, diff);
    gainCurrency(player, "stats.General.totalTime", timeIncrement, diff);
    gainCurrency(player, "stats.YooAmatter.time", timeIncrement, diff);

    if (hasUpgrade("YooAmatter", 22)) {
        gainCurrency(player, "math.YooA.solved", upgrade22Effect, diff);
        gainCurrency(player, "stats.General.totalSolved", upgrade22Effect, diff);
    }

    if (hasUpgrade("YooAmatter", 42)) {
        gainCurrency(player, "stats.YooAmatter.totalYooArium", YooAriumGain, diff);
        gainCurrency(player, "YooAmatter.YooArium", YooAriumGain, diff);
    }

    player.gain.YooAmatter.sparks = gainCurrency(player, "YooAmatter.sparks", sparkGain, diff);
    gainCurrency(player, "stats.YooAmatter.totalSparks", sparkGain, diff);

    // Update dimensions for YooA.
    const dimsYooA = player.dimensions.YooA;
    for (const dim of dimsYooA) {
        if (dim.unlocked) {
            dim.updateAmount(diff);
            dim.resetCache();
        }
    }

    // Update dimensions for YooAmatter.
    const dimsYooAmatter = player.dimensions.YooAmatter;
    for (const dim of dimsYooAmatter) {
        if (dim.unlocked) {
            dim.updateAmount(diff);
            dim.resetCache();
        }
    }

    // Efficient achievement checking.
    for (const id in achievements) {
        if (achievements[id].done() && !player.achievements[id]) {
            player.achievements[id] = true;
            if (achievements[id].onComplete) achievements[id].onComplete();
            notifyAchievement(achievements[id]);
        }
    }

    // Handle autobuyers.
    for (const autobuyersLayer of Object.values(player.autobuyers)) {
        for (const autobuyer of Object.values(autobuyersLayer)) {
            if (autobuyer.isOn && autobuyer.timeToNextTick.eq(0)) {
                autobuyer.tick();
            }
        }
    }

    player.time = now;
}

export function gameLoop() {
    if (offline.active) return;
    const now = Date.now();
    calc((now - date) / 1e3);
    date = now;
}

const exportsObj = {
    start,
    getYooAGain,
    getYooAPerSecond
};
export default exportsObj;
