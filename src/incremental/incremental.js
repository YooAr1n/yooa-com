import Decimal from "./break_eternity.js";
import { load } from "./save.js";

var timer

// Initialize player as a reactive object
export var player = getStartPlayer();
window.player = player; 

export function getStartPlayer() {
    return {
        tab: "Main",
        time: Date.now(),
        YooAPoints: new Decimal(10),
        YooAmatter: new Decimal(0)
    }
}

export function start() {
    load()
    timer = setInterval(gameLoop, 33)
}

export function getYooAGain() {
    let gain = new Decimal(0)
    gain = player.YooAPoints.add(1).pow(0.995).mul(1000)
    return gain
}

export function gameLoop() {
    let now = Date.now()
	let diff = (now - player.time) / 1e3
    let gain = getYooAGain()
    player = window.player
    player.YooAPoints = player.YooAPoints.add(gain.mul(diff))
    player.time = now
}

var exports = {
    start,
    getYooAGain
}
export default exports