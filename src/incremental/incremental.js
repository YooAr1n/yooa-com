import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue";
import { gameLayers, achievements, hasUpgrade, upgradeEffect, inChallenge, hasChallenge, challengeEffect } from "./main.js";
import Dimension from "./dimensions.js";
import Autobuyer from "./automation.js";

const FPS = 60;
window.FPS = FPS

// Initialize player as a reactive object
export const player = reactive(getStartPlayer());
var date = Date.now()
window.player = player;
window.date = date

export function getStartPlayer() {
    return {
        tab: "Main", // Tab-subtab structure
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
            dimensions: Array(5).fill("")
        },
        YooAmatter: {
            amount: ""
        }
    };
}

export function getStartUpgrades() {
    return {
        YooA: {},// Default upgrades structure
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
    return {
        YooA: names.map((name, i) => {
            const tier = i + 1;
            const costType = tier > 2 ? "YooAmatter" : undefined;
            return new Dimension(
                "YooA",
                `YooA ${name}`,
                Decimal.dZero,
                Decimal.dZero,
                tier,
                costType,
                costType
            );
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
        YooA: { // Default math structure
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
            time: Decimal.dZero,
            resets: Decimal.dZero,
        }
    };
}

export function start() {
    load();
}

export function calculateMultipliers(source, layer, ids, baseMultiplier = Decimal.dOne) {
    let multiplier = baseMultiplier;
    for (let i = 0; i < ids.length; i++) {
        if (source(layer, ids[i])) {
            multiplier = multiplier.mul(upgradeEffect(layer, ids[i]));
        }
    }
    return multiplier;
}

export function getYooAGain() {
    // Cache reusable results
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

    // Add achievement multipliers
    if (player.achievements[15]) gain = gain.mul(achievements[15].rewardEffect());
    if (player.achievements[16]) gain = gain.mul(achievements[16].rewardEffect());

    // Apply challenge effects in bulk
    const challengeEffects = {
        1: 0.5,
        3: 0.4,
    };

    Object.entries(challengeEffects).forEach(([id, exponent]) => {
        if (inChallenge("YooAmatter", id)) {
            gain = gain.pow(exponent);
        }
    });

    // Additional challenge effects
    if (hasChallenge("YooAmatter", 1)) gain = gain.pow(challengeEffect("YooAmatter", 1)[0]);
    if (hasChallenge("YooAmatter", 4)) gain = gain.pow(challengeEffect("YooAmatter", 4)[1]);
    if (inChallenge("YooAmatter", 4)) gain = gain.dilate(gameLayers.YooAmatter.challenges[4]?.dilEff() || Decimal.dOne);

    return gain;
}

export function getYooAPerSecond() {
    return hasUpgrade("YooA", 21) ? upgradeEffect("YooA", 21) : Decimal.dZero;
}

export function getYooADimensionMult() {
    // Cache frequently used multipliers
    const yooAUpgrades = calculateMultipliers(hasUpgrade, "YooA", [22, 32, 34]);
    const yooAmatterUpgrades = calculateMultipliers(hasUpgrade, "YooAmatter", [11, 13]);
    const upgrade33Effect = gameLayers.YooA.upgrades[33]?.effectGain() || Decimal.dOne;

    let mult = yooAUpgrades.mul(yooAmatterUpgrades).mul(upgrade33Effect);

    const achievementIds = [18, 23, 25, 32, 36];
    for (let i = 0; i < achievementIds.length; i++) {
        if (player.achievements[achievementIds[i]]) mult = mult.mul(achievements[achievementIds[i]].rewardEffect());
    }

    if (player.achievements[28]) {
        mult = mult.mul(calculateAchievementMultiplier());
    }

    return mult;
}

export function inAnyChallenge() {
    // Check if the player is currently in any active challenge
    return player.inChallenge.some(challenge => challenge !== "");
}

export function completedAnyChallenge() {
    // Check if the player has completed at least one challenge in any challenge category
    return Object.values(player.challenges).some(category =>
        Object.values(category).some(completed => completed)
    );
}

// Check if a player has an achievement
export function hasAchievement(id) {
    return !!player.achievements[id];
}

export function calculateAchievementMultiplier() {
    let baseMultiplier = Decimal.dOne;
    const rows = {};

    // Combine processing for achievements and rows
    const achs = Object.keys(achievements)
    const playerAchs = Object.keys(player.achievements)
    for (let i = 0; i < achs.length; i++) {
        const row = Math.floor(i / 8);

        // Initialize row if it doesn't exist
        if (!rows[row]) rows[row] = true;

        // Check if achievement is completed
        if (playerAchs[i]) {
            baseMultiplier = baseMultiplier.mul(1.02); // Apply individual multiplier
        } else {
            rows[row] = false; // Mark row as incomplete
        }
    }

    // Apply row bonuses
    for (let i = 0; i < Object.keys(rows).length; i++) {
        if (rows[i]) baseMultiplier = baseMultiplier.mul(1.1);
    }

    return baseMultiplier;
}

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
    // You can use a custom notification type for achievements
    // Assuming `this` refers to a Vue component that has `addNotification` method
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: message }));
}

export function maxAllDimensions(type) {
    const dims = player.dimensions[type];

    // If type is "YooA", filter and handle separately for tiers 1 and 2
    if (type === "YooA") {
        for (let i = 0; i < dims.length; i++) {
            if (dims[i].unlocked && (dims[i].tier === 1 || dims[i].tier === 2)) {
                dims[i].buyMax(player);
            }
        }
    } else {
        // Handle other types normally
        for (let i = 0; i < dims.length; i++) {
            if (dims[i].unlocked) {
                dims[i].buyMax(player);
            }
        }
    }
}


export function calc(diff) {
    const now = Date.now();
    const gain = getYooAPerSecond();
    const YooAriumGain = upgradeEffect("YooAmatter", 42);
    const timeIncrement = Decimal.dOne;

    // Batch updates for currencies
    const upgrade22Effect = upgradeEffect("YooAmatter", 22) || Decimal.dZero;

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

    // Update dimensions
    const dims = player.dimensions.YooA
    for (let i = 0; i < dims.length; i++) {
        if (dims[i].unlocked) {
            dims[i].updateAmount(diff);
            dims[i].resetCache();
        }
    }

    // Check achievements efficiently
    Object.entries(achievements).forEach(([id, achievement]) => {
        if (achievement.done() && !player.achievements[id]) {
            player.achievements[id] = true;
            if (achievement.onComplete) achievement.onComplete();
            notifyAchievement(achievement);
        }
    });

    // Handle autobuyers in bulk
    Object.values(player.autobuyers).forEach((autobuyersLayer) => {
        Object.values(autobuyersLayer).forEach((autobuyer) => {
            if (autobuyer.isOn && autobuyer.timeToNextTick.eq(0)) {
                autobuyer.tick();
            }
        });
    });

    player.time = now;
}

export function gameLoop() {
    if (offline.active) return;

    const now = Date.now();
    calc((now - date) / 1e3);
    date = now;
}


var exports = {
    start,
    getYooAGain,
    getYooAPerSecond
};
export default exports;
