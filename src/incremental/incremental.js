import Decimal from "./break_eternity.js";
import { load } from "./save.js";
import { reactive } from "vue"; // Import Vue's reactivity system
import { hasUpgrade, upgradeEffect } from "./main.js"

var timer

// Initialize player as a reactive object
export const player = reactive(getStartPlayer());
window.player = player;

export function getStartPlayer() {
    return {
        tab: "Main",
        time: Date.now(),
        YooAPoints: new Decimal(10),
        YooAmatter: new Decimal(0),
        upgrades: getStartUpgrades()
    };
}

export function getStartUpgrades() {
    return {
        YooA: {} // Default upgrades structure
    };
}

export function start() {
    load()
    timer = setInterval(gameLoop, 33);
}

export function getYooAGain() {
    let gain = new Decimal(0.1)
    gain = gain.mul(upgradeEffect("YooA", 12))
    if (hasUpgrade("YooA", 21)) gain = gain.mul(upgradeEffect("YooA", 21))
    return gain
}

export function gameLoop() {
    let now = Date.now()
    let diff = (now - player.time) / 1e3
    let gain = getYooAGain()

    // Update reactive properties directly without reassigning the object
    if (hasUpgrade("YooA", 11)) player.YooAPoints = player.YooAPoints.add(gain.mul(diff));
    player.time = now;
}

var exports = {
    start,
    getYooAGain
}
export default exports
