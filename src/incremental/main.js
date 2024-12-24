import Decimal from "./break_eternity.js";
import { player, getYooAGain } from "./incremental.js";
import { generateNewProblem } from "@/components/MathProblem.vue"; // Import generateNewProblem function

export const gameLayers = {
  YooA: {
    upgrades: {
      rows: 3,
      cols: 4,
      11: {
        title: "YooA Challenge (YU 11)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooA Points."
        },
        cost() {
          return Decimal.pow(10, getUpgLevels("YooA", 11));
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(5),
        base() {
          return upgradeEffect("YooA", 13).add(2)
        },
        baseDigits() {
          return Decimal.sub(1, upgradeEffect("YooA", 14))
        },
        effect() {
          return Decimal.pow(this.base(), getUpgLevels("YooA", 11));
        },
        digits() {
          return Decimal.mul(this.baseDigits(), getUpgLevels("YooA", 11));
        },
        effectDisplay() {
          return "+" + format(this.digits()) + " digits, x" + format(this.effect());
        },
        onBuy() {
          generateNewProblem();
        },
      },
      12: {
        title: "YooA Solver (YU 12)",
        description() {
          return "Gain more YooA Points based on math problems solved."
        },
        cost: new Decimal(5),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          let eff = Decimal.pow(1.01, player.math.YooA.solved)
          if (eff.gte(100)) eff = eff.log10().mul(50)
          return eff;
        },
        effectDisplay() {
          let dis = "x" + format(this.effect())
          if (this.effect().gte(100)) dis += " (softcapped)"
          return dis;
        },
      },
      13: {
        title: "YooA Enhancer (YU 13)",
        description() {
          return "Add 1 to 'YooA Challenge' base multiplier."
        },
        cost() {
          return Decimal.pow(100, getUpgLevels("YooA", 13)).mul(100);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(3),
        effect() {
          return getUpgLevels("YooA", 13)
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      14: {
        title: "YooA Simplifier (YU 14)",
        description() {
          return "Reduce the digits added in 'YooA Challenge' by 0.2. Double YooA Point gain at 2 and 3 levels"
        },
        cost() {
          return Decimal.pow(2000, getUpgLevels("YooA", 14)).mul(5000);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(3),
        effect() {
          return getUpgLevels("YooA", 14).div(5)
        },
        effectGain() {
          return Decimal.pow(2, getUpgLevels("YooA", 14).sub(1).max(0))
        },
        effectDisplay() {
          return "-" + format(this.effect()) + ", x" + format(this.effectGain());
        },
        onBuy() {
          generateNewProblem();
        },
      },
      21: {
        title: "Auto-YooA (YU 21)",
        description() {
          return "Gain 10% of YooA Points gained on solve per second (" + format(this.effect()) + "/s)."
        },
        cost: new Decimal(1e6),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          return getYooAGain().div(10);
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooA", 21)) gain = 0
          return format(gain) + "/s";
        },
      },
      22: {
        title: "Dimension Solver (YU 22)",
        description() {
          return "Boost all YooA dimensions based on math problems solved."
        },
        cost: new Decimal(1e8),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          let eff = Decimal.pow(1.003, player.math.YooA.solved)
          if (eff.gte(100)) eff = eff.log10().mul(50)
          return eff;
        },
        effectDisplay() {
          let dis = "x" + format(this.effect())
          if (this.effect().gte(100)) dis += " (softcapped)"
          return dis;
        },
      },
      23: {
        title: "YooA Doubler (YU 23)",
        description() {
          return "Double YooA Point gain."
        },
        cost() {
          return Decimal.pow(3, getUpgLevels("YooA", 23).pow(1.3)).mul(1e9);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          return Decimal.pow(2, getUpgLevels("YooA", 23));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "YooA Booster (YU 24)",
        description() {
          return "Gain 100x more YooA Points."
        },
        cost: new Decimal(1e20),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          return new Decimal(100);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      31: {
        title: "YooA-er (YU 31)",
        description() {
          return "Gain " + format(this.base()) + "x more YooA Points/s (Based on YooA Points)."
        },
        cost() {
          return Decimal.pow(10, getUpgLevels("YooA", 31).pow(1.5)).mul(1e25);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          return player.YooAPoints.add(10).log10()
        },
        effect() {
          return this.base().pow(getUpgLevels("YooA", 31));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      // Add more upgrades for other rows and columns as needed
    },
  },
  AnotherLayer: { /* another object */ }
};

export const achievements = {
  11: {
    title: "First Step",
    img: require("@/assets/ach11.png"),
    description() {
      return "Get 1 YooA Point."
    },
    done() {
      return player.stats.General.totalPoints.gte(1)
    }
  },
  12: {
    title: "Math Whiz",
    img: require("@/assets/ach12.jpg"),
    description() {
      return "Solve 100 math problems."
    },
    done() {
      return player.stats.General.totalSolved >= 100
    }
  },
  13: {
    title: "Starting Small",
    img: require("@/assets/ach13.png"),
    description() {
      return "Buy 1 YooA Line."
    },
    done() {
      return player.dimensions.YooA[0].level.gte(1)
    }
  },
  14: {
    title: "Taking Off",
    img: require("@/assets/ach14.png"),
    description() {
      return "Buy 1 YooA Plane."
    },
    done() {
      return player.dimensions.YooA[1].level.gte(1)
    }
  },
  15: {
    title: "YooA Millionaire",
    img: require("@/assets/ach15.jpg"),
    description() {
      return "Have 1,000,000 YooA Points."
    },
    rewardDescription() {
      return "Gain 2% more YooA Points."
    },
    rewardEffect() {
      return new Decimal(1.02)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.YooAPoints.gte(1e6)
    }
  },
  16: {
    title: "YooA Billionaire",
    img: require("@/assets/ach16.jpg"),
    description() {
      return "Have " + format(1e9) + " YooA Points."
    },
    rewardDescription() {
      return "Gain 3% more YooA Points."
    },
    rewardEffect() {
      return new Decimal(1.03)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.YooAPoints.gte(1e9)
    }
  },
  17: {
    title: "???",
    description() {
      return "???"
    },
    done() {
      return false
    }
  },
  18: {
    title: "???",
    description() {
      return "???"
    },
    done() {
      return false
    }
  },
}

// Helper function to get upgrade levels
export function getUpgLevels(layer, id) {
  return player.upgrades[layer]?.[id] || new Decimal(0); // Return level or 0 if not purchased
}

// Check if an upgrade can be afforded
export function canAffordUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade
  const currentLevel = getUpgLevels(layer, id); // Use the helper function to get current level
  const maxLevel = upgrade.maxLvl !== undefined ? upgrade.maxLvl : Decimal.dInf; // Default to INFINITY

  // Handle static or dynamic cost
  const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

  return player[upgrade.costInternal].gte(cost) && currentLevel.lt(maxLevel);
}

export function buyUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade

  if (canAffordUpgrade(layer, id)) {
    // Handle static or dynamic cost
    const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

    // Deduct the cost
    player[upgrade.costInternal] = player[upgrade.costInternal].sub(cost);

    // Initialize player.upgrades[layer] if it doesn't exist
    player.upgrades[layer] = player.upgrades[layer] || {};

    // If the upgrade isn't purchased yet, set it to level 1
    if (!player.upgrades[layer][id]) {
      player.upgrades[layer][id] = new Decimal(1); // Start at level 1
    }
    else {
      let nomax = upgrade.maxLvl && player.upgrades[layer][id].lt(upgrade.maxLvl)
      nomax = nomax || !upgrade.maxLvl
      if (nomax) {
        // Increment level if upgrade level is less than maxLvl
        player.upgrades[layer][id] = player.upgrades[layer][id].add(1);
      }
    }

    // Call the onBuy method if it exists
    if (upgrade.onBuy) {
      upgrade.onBuy();
    }
  }
}


// Get the effect of an upgrade
export function upgradeEffect(layer, id) {
  const upgrade = gameLayers[layer]?.upgrades?.[id];
  if (!upgrade) return new Decimal(0); // Return 0 if upgrade doesn't exist

  if (upgrade.effect) {
    return upgrade.effect(); // Call and return the upgrade's effect function
  }

  return new Decimal(0); // Default to 0 if no effect
}

// Check if an upgrade has been purchased
export function hasUpgrade(layer, id) {
  return getUpgLevels(layer, id).gte(1); // Use the helper function for levels
}