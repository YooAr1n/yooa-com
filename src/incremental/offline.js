import { calc } from "./incremental"
import { reactive } from "vue";

export const offline = reactive({
    active: false,
    nosave: false,
    speed: new Decimal(10),
    time: Decimal.dZero,
    elapsed: Decimal.dZero,
})
window.offline = offline

let date

window.simulateOffline = function simulateOffline(time) {
    if (offline.active) return

    time = new Decimal(time)
    if (time.lt(60)) {
        offline.active = false
        offline.nosave = true
    }
    else offline.nosave = offline.active = true
    offline.speed = Decimal.max(12, Decimal.div(time, 5))
    offline.elapsed = Decimal.dZero
    offline.time = time

    date = Date.now()

    var ol = setInterval(()=>{
        var diff = (Date.now()-date)/1000
        var dt = Decimal.min(time, offline.elapsed.add(Decimal.mul(diff, offline.speed))).sub(offline.elapsed)
        // console.log(diff,dt,tt)
        calc(dt)
        offline.elapsed = offline.elapsed.add(dt)

        date = Date.now()

        if (offline.elapsed.gte(time)) {
            offline.nosave = false
            clearInterval(ol)
        }
    }, 1000/60)
}