import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue";
import { gameLayers, achievements, hasUpgrade, upgradeEffect } from "./main.js";
import Dimension from "./dimensions.js";

var timer;
const FPS = 60;

// Initialize player as a reactive object
export const player = reactive(getStartPlayer());
window.player = player;

export function getStartPlayer() {
    return {
        tab: "Main-main", // Tab-subtab structure
        subtab: "main",
        time: Date.now(),
        YooAPoints: new Decimal(0),
        YooAmatter: {
            amount: new Decimal(0),
        },
        upgrades: getStartUpgrades(),
        math: getStartMath(),
        dimensions: getStartDimensions(),
        stats: getStartStats(),
        gain: getStartGains(),
        achievements: {}
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

export function getStartDimensions() {
    return {
        YooA: [
            new Dimension("YooA", "YooA Lines", new Decimal(0), new Decimal(0), 1),
            new Dimension("YooA", "YooA Planes", new Decimal(0), new Decimal(0), 2),
            new Dimension("YooA", "YooA Spaces", new Decimal(0), new Decimal(0), 3, "YooAmatter", "YooAmatter"),
            new Dimension("YooA", "YooA Realms", new Decimal(0), new Decimal(0), 4, "YooAmatter", "YooAmatter"),
            new Dimension("YooA", "YooA Entities", new Decimal(0), new Decimal(0), 5, "YooAmatter", "YooAmatter")
        ]
    };
}

export function getStartMath() {
    return {
        YooA: {
            mathProblem: "1 + 1",
            correctAnswer: 2,
            solved: 0,
            isCorrect: false,
            showCorrect: false
        } // Default math structure
    };
}

export function getStartStats() {
    return {
        General: {
            totalPoints: new Decimal(0),
            totalTime: 0,
            totalSolved: 0
        },
        YooA: {
            solved: 0
        },
        YooAmatter: {
            totalAmount: new Decimal(0),
        }
    };
}

export function start() {
    load();
    timer = setInterval(gameLoop, 1000 / FPS);
}

export function getYooAGain() {
    let gain = new Decimal(0.1);
    gain = gain.mul(player.dimensions.YooA[0].effect)
    gain = gain.mul(upgradeEffect("YooA", 11))
        .mul(gameLayers.YooA.upgrades[14].effectGain())
        .mul(upgradeEffect("YooA", 23))
        .mul(upgradeEffect("YooA", 31))
        .mul(calculateAchievementMultiplier())
        .mul(gameLayers.YooAmatter.effect())
    if (hasUpgrade("YooA", 12)) gain = gain.mul(upgradeEffect("YooA", 12));
    if (hasUpgrade("YooA", 24)) gain = gain.mul(upgradeEffect("YooA", 24));
    if (hasUpgrade("YooAmatter", 12)) gain = gain.mul(upgradeEffect("YooAmatter", 12));
    if (hasAchievement(15)) gain = gain.mul(achievements[15].rewardEffect());
    if (hasAchievement(16)) gain = gain.mul(achievements[16].rewardEffect());
    return gain;
}

export function getYooAPerSecond() {
    if (!hasUpgrade("YooA", 21)) return new Decimal(0)
    let gain = getYooAGain().div(10);
    return gain;
}

export function getYooADimensionMult() {
    let mult = new Decimal(1)
    mult = mult.mul(gameLayers.YooA.upgrades[33].effectGain())
        .mul(upgradeEffect("YooA", 34))
    if (hasUpgrade("YooA", 22)) mult = mult.mul(upgradeEffect("YooA", 22))
    if (hasUpgrade("YooA", 32)) mult = mult.mul(upgradeEffect("YooA", 32))
    if (hasUpgrade("YooAmatter", 11)) mult = mult.mul(upgradeEffect("YooAmatter", 11))
    if (hasUpgrade("YooAmatter", 13)) mult = mult.mul(upgradeEffect("YooAmatter", 13))
    if (hasAchievement(18)) mult = mult.mul(achievements[18].rewardEffect());
    if (hasAchievement(23)) mult = mult.mul(achievements[23].rewardEffect());
    if (hasAchievement(25)) mult = mult.mul(achievements[25].rewardEffect());
    if (hasAchievement(28)) mult = mult.mul(calculateAchievementMultiplier())
    return mult
}

// Check if a player has an achievement
export function hasAchievement(id) {
    return !!player.achievements[id];
}

export function calculateAchievementMultiplier() {
    const rows = {};
    let baseMultiplier = new Decimal(1);

    // Group achievements by row based on the definition in the `achievements` constant
    Object.entries(achievements).forEach(([key, achievement]) => {
        const row = Math.floor(key / 10); // First digit of the key determines the row (e.g., 11, 12 -> row 1; 21, 22 -> row 2)

        if (!rows[row]) rows[row] = [];

        // Check if the achievement is completed (based on player's achievement status)
        // We assume that `player.achievements[key]` holds whether the player has completed the achievement
        const completed = player.achievements[key] || false;  // If the player has the achievement, it's marked as true
        rows[row].push(completed); // Push the completion status (true or false)
    });

    // Apply individual achievement multipliers (1.02x per completed achievement)
    Object.entries(player.achievements).forEach(([key, completed]) => {
        if (completed) {
            baseMultiplier = baseMultiplier.mul(1.02); // Apply 1.02x for each completed achievement
        }
    });

    // Apply row completion multipliers (1.1x for fully completed rows)
    Object.values(rows).forEach((rowAchievements) => {
        const allCompleted = rowAchievements.every((completed) => completed === true);
        if (allCompleted) {
            baseMultiplier = baseMultiplier.mul(1.1); // Apply 1.1x for a fully completed row
        }
    });

    return baseMultiplier;
}

export function gainCurrency(pl, currencyPath, gain, diff, percent) {
    const keys = currencyPath.split('.');  // Split the path into keys
    let lastKey = keys.pop();  // Extract the last key
    let currencyObj = keys.reduce((obj, key) => obj[key], pl);  // Traverse to the parent object
    let currency = currencyObj[lastKey];  // Get the reference to the currency

    gain = new Decimal(gain)
    let formattedGain = formatGain(currency, gain, 1 / diff, percent);

    // Update the currency by reference
    currencyObj[lastKey] = currency.add(gain.mul(diff));  // Modify the currency directly

    return formattedGain;  // Return the formatted gain
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
        dims.forEach(dimension => {
            if (dimension.unlocked && (dimension.tier === 1 || dimension.tier === 2)) {
                dimension.buyMax(player);
            }
        });
    } else {
        // Handle other types normally
        dims.forEach(dimension => {
            if (dimension.unlocked) {
                dimension.buyMax(player);
            }
        });
    }
}


export function gameLoop() {
    let now = Date.now();
    let diff = (now - player.time) / 1e3;
    let gain = getYooAPerSecond();

    // Update reactive properties directly without reassigning the object
    player.gain.YooA.points = gainCurrency(player, "YooAPoints", gain, diff);
    gainCurrency(player, "stats.General.totalPoints", gain, diff);

    player.stats.General.totalTime += diff;
    player.stats.YooA.solved = player.math.YooA.solved;

    for (let dimension of player.dimensions.YooA) {
        dimension.updateAmount(diff);
        dimension.updateCost();
        dimension.allMult = getYooADimensionMult();
        dimension.updateEffect();
        dimension.updateUnlocked();
    }

    // Check achievements
    for (const [id, achievement] of Object.entries(achievements)) {
        if (achievement.done() && !hasAchievement(id)) {
            player.achievements[id] = true;
            if (achievement.onComplete) achievement.onComplete()
            // Trigger a notification for the achievement
            notifyAchievement(achievement);
        }
    }

    player.time = now;
}


var exports = {
    start,
    getYooAGain,
    getYooAPerSecond
};
export default exports;
