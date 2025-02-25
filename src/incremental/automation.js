import Decimal from "./break_eternity.js";
import { buyAllUpgrades, maxAllUpgrades } from "@/components/Main.vue";
import { gameLayers, hasChallenge, hasUpgrade, prestige } from "./main";
import { inAnyChallenge } from "./incremental.js";

// Autobuyer class optimized for cached lookups and direct instance updates
export default class Autobuyer {
  constructor(layer, name, isOn = false, mode = 0, amount = null) {
    this.layer = layer;
    this.name = name;
    this.isOn = isOn;
    this.mode = mode;
    this.amount = amount;
    this.time = Decimal.dZero;
  }

  toggle() {
    // Directly update instance property
    this.isOn = !this.isOn;
  }

  toggleMode() {
    this.mode++;
  }

  updateAmount(amt) {
    this.amount = Decimal.max(0, amt);
  }

  get autoInterval() {
    // Cache lookup from global autobuyers object
    return autobuyers[this.layer][this.name].interval();
  }

  get timeToNextTick() {
    // Cache player's stat time in a local variable
    const statTime = player.stats[this.layer].time;
    return this.time.sub(statTime).max(0) || Decimal.dZero;
  }

  set tickTime(value) {
    this.time = value;
  }

  get autobuyerMode() {
    // Use constant mode arrays to avoid re-creating them
    const BUYER_MODES = ["SINGLE", "MAX"];
    const PRESTIGER_MODES = ["AMOUNT", "TIME"];
    const type = autobuyers[this.layer][this.name].type;
    const modes = type === "Buyer" ? BUYER_MODES : PRESTIGER_MODES;
    return modes[this.mode % modes.length];
  }

  resetTime() {
    this.time = player.stats[this.layer].time.add(this.autoInterval);
  }

  prestigeTime() {
    this.time = this.autoInterval;
  }

  tick() {
    if (this.isOn && this.timeToNextTick.eq(0)) {
      // Cache local reference to the current autobuyer object
      const ab = autobuyers[this.layer][this.name];
      ab.tickMethod();
      this.resetTime();
    }
  }
}

// Autobuyer definitions with cached local lookups in tick methods
export const autobuyers = {
  YooAmatter: {
    "YooA Lines": {
      type: "Buyer",
      unlocked: () => hasChallenge("YooAmatter", 1),
      interval: () => Decimal.dOne.div(getAutobuyerSpeed()),
      tickMethod: () => {
        const ab = player.autobuyers.YooAmatter["YooA Lines"];
        const dimension = player.dimensions.YooA[0];
        // Cache the mode locally
        const mode = ab.autobuyerMode;
        mode === "SINGLE" ? dimension.buy(player) : dimension.buyMax(player);
      }
    },
    "YooA Planes": {
      type: "Buyer",
      unlocked: () => hasChallenge("YooAmatter", 2),
      interval: () => Decimal.dTwo.div(getAutobuyerSpeed()),
      tickMethod: () => {
        const ab = player.autobuyers.YooAmatter["YooA Planes"];
        const dimension = player.dimensions.YooA[1];
        const mode = ab.autobuyerMode;
        mode === "SINGLE" ? dimension.buy(player) : dimension.buyMax(player);
      }
    },
    "YooA Upgrades": {
      type: "Buyer",
      unlocked: () => hasChallenge("YooAmatter", 3),
      interval: () => new Decimal(5).div(getAutobuyerSpeed()),
      tickMethod: () => {
        const ab = player.autobuyers.YooAmatter["YooA Upgrades"];
        const mode = ab.autobuyerMode;
        mode === "SINGLE" ? buyAllUpgrades() : maxAllUpgrades();
      }
    },
    "YooAmatter Prestige": {
      type: "Prestiger",
      unlocked: () => hasChallenge("YooAmatter", 4),
      interval: () => new Decimal(10).div(getAutobuyerSpeed()),
      tickMethod: () => {
        const ab = player.autobuyers.YooAmatter["YooAmatter Prestige"];
        if (!gameLayers.YooAmatter.canReset() || inAnyChallenge()) return;
        const mode = ab.autobuyerMode;
        if (mode === "AMOUNT" && gameLayers.YooAmatter.getResetGain().gte(ab.amount)) {
          prestige("YooAmatter");
        } else if (mode === "TIME" && player.stats.YooAmatter.time.gte(ab.amount)) {
          prestige("YooAmatter");
        }
      }
    }
  }
};

export function getArinCost() {
  let x = player.Arin;
  if (hasUpgrade("YooAmatter", 42)) x = x.div(1.5);
  if (hasUpgrade("YooAmatter", 44)) x = x.div(1.3);
  return Decimal.pow(5, x.pow(1.3));
}

export function getArinEffect() {
  const eff = Decimal.pow(2, player.Arin);
  const eff2 = Decimal.pow(1.2, player.Arin.pow(0.5));
  return [eff, eff2];
}

export function getAutobuyerSpeed() {
  // Cache the second effect from getArinEffect
  let [, effect2] = getArinEffect();
  if (hasUpgrade("YooAmatter", 54)) effect2 = effect2.mul(2);
  return effect2;
}

export function resetAllAutobuyerTime(autobuyerGroup) {
  for (const buyer of Object.values(autobuyerGroup)) {
    buyer.prestigeTime();
  }
}
