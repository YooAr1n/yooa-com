import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue";
import { gameLayers, achievements, hasUpgrade, upgradeEffect } from "./main.js";
import Dimension from "./dimensions.js"; 

var timer;

// Initialize player as a reactive object
export const player = reactive(getStartPlayer());
window.player = player;

export function getStartPlayer() {
    return {
        tab: "Main-main", // Tab-subtab structure
        subtab: "main",
        time: Date.now(),
        YooAPoints: new Decimal(0),
        YooAmatter: new Decimal(0),
        upgrades: getStartUpgrades(),
        math: getStartMath(),
        dimensions: getStartDimensions(),
        stats: getStartStats(),
        achievements: {}
    };
}

export function getStartUpgrades() {
    return {
        YooA: {} // Default upgrades structure
    };
}

export function getStartDimensions() {
    return {
        YooA: [
            new Dimension("YooA Lines", new Decimal(0), new Decimal(0), 1),
            new Dimension("YooA Planes", new Decimal(0), new Decimal(0), 2)
        ]
    };
}

export function getStartMath() {
    return {
        YooA: {
            mathProblem: "1 + 1",
            correctAnswer: 2,
            solved: 0
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
        }
    };
}

export function start() {
    load();
    timer = setInterval(gameLoop, 33);
}

export function getYooAGain() {
    let gain = new Decimal(0.1);
    gain = gain.mul(player.dimensions.YooA[0].effect)
    gain = gain.mul(upgradeEffect("YooA", 11))
    .mul(gameLayers.YooA.upgrades[14].effectGain())
    .mul(upgradeEffect("YooA", 23))
    .mul(upgradeEffect("YooA", 31))
    .mul(calculateAchievementMultiplier())
    if (hasUpgrade("YooA", 12)) gain = gain.mul(upgradeEffect("YooA", 12));
    if (hasUpgrade("YooA", 24)) gain = gain.mul(upgradeEffect("YooA", 24));
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
    if (hasUpgrade("YooA", 22)) mult = mult.mul(upgradeEffect("YooA", 22))
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

// Update gameLoop to check for achievements
export function gameLoop() {
    let now = Date.now();
    let diff = (now - player.time) / 1e3;
    let gain = getYooAPerSecond();

    // Update reactive properties directly without reassigning the object
    player.YooAPoints = player.YooAPoints.add(gain.mul(diff));
    player.stats.General.totalPoints = player.stats.General.totalPoints.add(gain.mul(diff));
    player.stats.General.totalTime += diff;
    player.stats.YooA.solved = player.math.YooA.solved;

    for (let dimension of player.dimensions.YooA) {
        dimension.updateAmount(diff); 
        dimension.updateCost();
        dimension.allMult = getYooADimensionMult();
        dimension.updateEffect(); 
    }

    // Check achievements
    for (const [id, achievement] of Object.entries(achievements)) {
        if (achievement.done() && !hasAchievement(id)) {
            player.achievements[id] = true;
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
