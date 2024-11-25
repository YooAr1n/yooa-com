import Decimal from "./break_eternity.js";
import Header from '@/components/Header.vue'

var timer

// Initialize player as a reactive object
window.player = getStartPlayer();
console.log(window.player)

export function getStartPlayer() {
    return {
        time: Date.now(),
        YooAPoints: new Decimal(0),
        YooAmatter: new Decimal(0)
    }
}

export function start() {
    /*load()
    main()*/
    timer = setInterval(gameLoop, 33)
}

export function getYooAGain() {
    let gain = new Decimal(124).mul(player.YooAPoints.add(1).pow(0.995)).mul(player.YooAPoints.add(1).log10().pow(0.75).pow10())
    return gain
}

export function getProgress() {
    let progress = player.YooAmatter.add(1).log("9.17e1995").mul(100).min(100)
    document.getElementById("percent").innerHTML = format(progress) + "%"
    document.getElementById("percentbar").style.width = progress.toNumber() + "%"
}

export function gameLoop() {
    let now = Date.now()
	let diff = (now - player.time) / 1e3
    let gain = getYooAGain()
    player.YooAPoints = player.YooAPoints.add(gain.mul(diff))
    player.time = now
    //getProgress()
}

var exports = {
    start,
    getYooAGain
}
export default exports