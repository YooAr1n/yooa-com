import Decimal from "./break_eternity.js";
import { buyAllUpgrades, maxAllUpgrades } from "@/components/Main.vue";
import { gameLayers, hasChallenge, hasUpgrade, prestige } from "./main"
import { inAnyChallenge } from "./incremental.js";

export default class Autobuyer {
    constructor(layer, name, isOn = false, mode = 0, amount = null) {
        this.layer = layer;
        this.name = name;
        this.isOn = isOn;
        this.mode = mode;
        this.amount = amount;
        this.time = Decimal.dZero;
    }

    toggle(player) {
        player.autobuyers[this.layer][this.name].isOn = !this.isOn;
    }

    toggleMode(player) {
        player.autobuyers[this.layer][this.name].mode++;
    }

    updateAmount(player, amt) {
        player.autobuyers[this.layer][this.name].amount = Decimal.max(0, amt);
    }

    get autoInterval() {
        return autobuyers[this.layer][this.name].interval();
    }

    get timeToNextTick() {
        return this.time.sub(player.stats[this.layer].time).max(0) || Decimal.dZero;
    }

    set tickTime(value) {
        this.time = value;
    }

    get autobuyerMode() {
        const autobuyerType = autobuyers[this.layer][this.name].type;
        const modes = autobuyerType === "Buyer" ? ["SINGLE", "MAX"] : ["AMOUNT", "TIME"];
        return modes[this.mode % modes.length];
    }

    resetTime() {
        this.time = player.stats[this.layer].time.add(this.autoInterval);
    }

    prestigeTime() {
        this.time = this.autoInterval
    }

    tick() {
        if (this.isOn && this.timeToNextTick.eq(0)) {
            const autobuyer = autobuyers[this.layer][this.name];
            autobuyer.tickMethod();
            this.resetTime();
        }
    }
}

export const autobuyers = {
    YooAmatter: {
        "YooA Lines": {
            type: "Buyer",
            unlocked: () => hasChallenge("YooAmatter", 1),
            interval: () => Decimal.dOne.div(getArinEffect()[1]),
            tickMethod: () => {
                const autobuyer = player.autobuyers.YooAmatter["YooA Lines"];
                const dimension = player.dimensions.YooA[0];
                autobuyer.autobuyerMode === "SINGLE" ? dimension.buy(player) : dimension.buyMax(player);
            }
        },
        "YooA Planes": {
            type: "Buyer",
            unlocked: () => hasChallenge("YooAmatter", 2),
            interval: () => Decimal.dTwo.div(getArinEffect()[1]),
            tickMethod: () => {
                const autobuyer = player.autobuyers.YooAmatter["YooA Planes"];
                const dimension = player.dimensions.YooA[1];
                autobuyer.autobuyerMode === "SINGLE" ? dimension.buy(player) : dimension.buyMax(player);
            }
        },
        "YooA Upgrades": {
            type: "Buyer",
            unlocked: () => hasChallenge("YooAmatter", 3),
            interval: () => new Decimal(5).div(getArinEffect()[1]),
            tickMethod: () => {
                const autobuyer = player.autobuyers.YooAmatter["YooA Upgrades"];
                autobuyer.autobuyerMode === "SINGLE" ? buyAllUpgrades() : maxAllUpgrades();
            }
        },
        "YooAmatter Prestige": {
            type: "Prestiger",
            unlocked: () => hasChallenge("YooAmatter", 4),
            interval: () => new Decimal(10).div(getArinEffect()[1]),
            tickMethod: () => {
                const autobuyer = player.autobuyers.YooAmatter["YooAmatter Prestige"];
                if (!gameLayers.YooAmatter.canReset() || inAnyChallenge()) return;

                if (autobuyer.autobuyerMode === "AMOUNT" && gameLayers.YooAmatter.getResetGain().gte(autobuyer.amount)) {
                    prestige("YooAmatter");
                } else if (autobuyer.autobuyerMode === "TIME" && player.stats.YooAmatter.time.gte(autobuyer.amount)) {
                    prestige("YooAmatter");
                }
            }
        }
    }
};

export function getArinCost() {
    let x = player.Arin
    if (hasUpgrade("YooAmatter", 42)) x = x.div(1.5)
    return Decimal.pow(5, x.pow(1.3));
}

export function getArinEffect() {
    const eff = Decimal.pow(2, player.Arin);
    const eff2 = Decimal.pow(1.2, player.Arin.pow(0.5));
    return [eff, eff2];
}

export function resetAllAutobuyerTime(autobuyer) {
    Object.values(autobuyer).forEach(buyer => buyer.prestigeTime());
}