import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue";
import { hasUpgrade, upgradeEffect } from "./main.js";
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
        dimensions: getStartDimensions()
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

export function start() {
    load();
    timer = setInterval(gameLoop, 33);
}

export function getYooAGain() {
    let gain = new Decimal(0.1);
    gain = gain.mul(player.dimensions.YooA[0].effect)
    gain = gain.mul(upgradeEffect("YooA", 11)).mul(upgradeEffect("YooA", 22)).mul(upgradeEffect("YooA", 31));
    if (hasUpgrade("YooA", 12)) gain = gain.mul(upgradeEffect("YooA", 12));
    if (hasUpgrade("YooA", 23)) gain = gain.mul(upgradeEffect("YooA", 23));
    return gain;
}

export function gameLoop() {
    let now = Date.now();
    let diff = (now - player.time) / 1e3;
    let gain = upgradeEffect("YooA", 21);

    // Update reactive properties directly without reassigning the object
    if (hasUpgrade("YooA", 21)) player.YooAPoints = player.YooAPoints.add(gain.mul(diff));
    for (let dimension of player.dimensions.YooA) {
        dimension.updateCost(); 
        dimension.updateEffect(); 
        dimension.updateAmount(diff); 
    }
    player.time = now;
}

var exports = {
    start,
    getYooAGain
};
export default exports;
