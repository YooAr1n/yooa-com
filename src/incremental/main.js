
import Decimal from "./break_eternity.js";
import { player, getYooAGain, getStartMath } from "./incremental.js";
import { generateNewProblem } from "@/components/comps/MathProblem.vue"; // Import generateNewProblem function
import { resetAllDimensions } from "./dimensions.js";

export const gameLayers = {
  YooA: {
    unlocked: true,
    problemGain() {
      let gain = 1
      if (hasUpgrade("YooAmatter", 12)) gain = gain * upgradeEffect("YooAmatter", 12).toNumber();
      if (hasUpgrade("YooA", 32)) gain = gain * upgradeEffect("YooA", 32).toNumber();
      return gain
    },
    upgrades: {
      costsNothing() {
        return false
      },
      rows: 3,
      cols: 4,
      11: {
        title: "YooA Challenge (YU 11)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooA Points."
        },
        cost(x = getUpgLevels("YooA", 11)) {
          let cost = Decimal.pow(10, x)
          if (x.gte(5)) cost = Decimal.pow(1e5, x.sub(5).pow(1.5)).mul(1e70)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 5
          if (hasUpgrade("YooA", 32)) max += 5
          if (hasUpgrade("YooAmatter", 21)) max += 7
          return new Decimal(max)
        },
        base() {
          return upgradeEffect("YooA", 13).add(2)
        },
        baseDigits() {
          return Decimal.sub(1, upgradeEffect("YooA", 14)).sub(upgradeEffect("YooA", 33))
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
        cost(x = getUpgLevels("YooA", 13)) {
          let cost = Decimal.pow(100, x).mul(100);
          if (x.gte(3)) cost = Decimal.pow(1e10, x.sub(3).pow(1.15)).mul(1e130)
          return cost
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = hasUpgrade("YooAmatter", 21) ? 10 : 3
          return new Decimal(max)
        },
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
        cost(x = getUpgLevels("YooA", 14)) {
          return Decimal.pow(2000, x).mul(5000);
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
          return eff
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
        cost(x = getUpgLevels("YooA", 23)) {
          return Decimal.pow(3, x.pow(1.3)).mul(1e9);
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
          return "Gain 20x more YooA Points."
        },
        cost: new Decimal(1e20),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          return new Decimal(20);
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
        cost(x = getUpgLevels("YooA", 31)) {
          return Decimal.pow(1000, x.pow(1.5)).mul(1e30);
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
      32: {
        title: "YooA Mastery (YU 32)",
        description() {
          return "Add 5 levels to 'YooA Challenge' and boost YooA Dimensions and math problem gain by 20% per 'YooA Challenge' level after 5."
        },
        cost: new Decimal(1e70),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(1),
        effect() {
          return Decimal.pow(1.2, getUpgLevels("YooA", 11).sub(5).max(0));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      33: {
        title: "YooA Streamliner (YU 33)",
        description() {
          return "Reduce the digits added in 'YooA Challenge' by 0.02 and double all YooA Dimension multipliers."
        },
        cost(x = getUpgLevels("YooA", 33)) {
          return Decimal.pow(1e10, x.pow(1.5)).mul(1e150);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(10),
        effect() {
          return getUpgLevels("YooA", 33).div(50)
        },
        effectGain() {
          return Decimal.pow(2, getUpgLevels("YooA", 33))
        },
        effectDisplay() {
          return "-" + format(this.effect()) + ", x" + format(this.effectGain());
        },
        onBuy() {
          generateNewProblem();
        },
      },
      34: {
        title: "YooA Catalyst (YU 34)",
        description() {
          return "Multiply YooA Dimensions by " + format(this.base()) + " (Based on YooA Points)."
        },
        cost(x = getUpgLevels("YooA", 34)) {
          return Decimal.pow(1e6, x.pow(1.55)).mul(1e200);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          return player.YooAPoints.add(10).log10().dilate(0.75).pow(0.3)
        },
        effect() {
          return this.base().pow(getUpgLevels("YooA", 34));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      // Add more upgrades for other rows and columns as needed
    },
  },
  YooAmatter: {
    currency: "YooAmatter",
    baseCurrency: "YooA Points",
    requires: new Decimal(1e12),
    unlocked() {
      return player.YooAPoints.gte(1e12) || player.stats.YooAmatter.totalAmount.gte(1)
    },
    canReset() {
      return player.YooAPoints.gte(1e12)
    },
    effect() {
      return player.YooAmatter.amount.add(1)
    },
    getResetGain() {
      let gain = player.YooAPoints.div(1e12).dilate(0.8).pow(0.5)
      if (gain.gte(300)) gain = gain.div(300).pow(0.5).mul(300)
      return gain.floor()
    },
    getNextAt() {
      let gain = this.getResetGain().add(1)
      if (gain.gte(300)) gain = gain.div(300).pow(2).mul(300)
      return gain.pow(2).dilate(1.25).mul(1e12).max(1e12)
    },
    upgrades: {
      costsNothing() {
        return false
      },
      rows: 3,
      cols: 4,
      11: {
        title: "Eternal Growth (YM 11)",
        description() {
          return "All YooA Dimensions are stronger based on total time played."
        },
        cost: new Decimal(1),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(1),
        effect() {
          return Decimal.pow(player.stats.General.totalTime + 1, 0.3).div(4).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      12: {
        title: "Multi-Solver (YM 12)",
        description() {
          return "Increase YooA Point and YooA math problem gain multiplier by 1."
        },
        cost() {
          let b = 3
          let l = getUpgLevels("YooAmatter", 12)
          if (l.gte(2)) b = Decimal.add(b, l.mul(2))
          return Decimal.pow(b, l).mul(5);
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(4),
        effect() {
          return getUpgLevels("YooAmatter", 12).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "Dimensional Ascension (YM 13)",
        description() {
          return "YooA Points boost all YooA Dimensions and cube YooA Dimension 3+ multiplier per level."
        },
        cost: new Decimal(2025),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(1),
        effect() {
          return player.YooAPoints.add(1).dilate(0.75).pow(0.1)
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      14: {
        title: "Foundation Multiplier (YM 14)",
        description() {
          return "YooAmatter increases the YooA Dimension multiplier per level, and start with 300 math problems."
        },
        cost: new Decimal(5e5),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(1),
        effect() {
          let eff = player.YooAmatter.amount.add(10).log10().pow(0.75).div(1000)
          if (eff.gte(0.012)) eff = eff.add(0.012).div(2)
          return eff
        },
        effectDisplay() {
          let dis = "+" + format(this.effect())
          if (this.effect().gte(0.012)) dis += " (softcapped)"
          return dis;
        },
        onBuy() {
          player.math.YooA.solved += 300
        }
      },
      21: {
        title: "YooA Amplifier (YM 21)",
        description() {
          return "Add 7 levels to 'YooA Challenge' (YU 11) and 'YooA Enhancer' (YU 13) and start with 1,000 math problems."
        },
        cost: new Decimal(1e13),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(1),
        onBuy() {
          if (hasUpgrade("YooAmatter", 14)) player.math.YooA.solved += 700
          else player.math.YooA.solved += 1000
        }
      },
    }
  },
}

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
    title: "Math Genius",
    img: require("@/assets/ach17.jpg"),
    description() {
      return "Solve 500 math problems."
    },
    done() {
      return player.stats.General.totalSolved >= 500
    }
  },
  18: {
    title: "A Matter of YooA",
    img: require("@/assets/ach18.jpg"),
    description() {
      return "Get 1 YooAmatter."
    },
    rewardDescription() {
      return "All YooA Dimensions are 3% stronger and unlock more YooA Dimensions."
    },
    rewardEffect() {
      return new Decimal(1.03)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.stats.YooAmatter.totalAmount.gte(1)
    }
  },
  21: {
    title: "Blast Off",
    img: require("@/assets/ach21.jpg"),
    description() {
      return "Buy 1 YooA Space."
    },
    done() {
      return player.dimensions.YooA[2].level.gte(1)
    }
  },
  22: {
    title: "Universal YooA",
    img: require("@/assets/ach22.jpg"),
    description() {
      return "Have " + format(1e20) + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte(1e20)
    }
  },
  23: {
    title: "YooA Master",
    img: require("@/assets/ach23.jpg"),
    description() {
      return "Have " + format(1e12) + " YooA Points without 'YooA Challenge' (YU11)."
    },
    rewardDescription() {
      return "All YooA Dimensions are 5% stronger and unlock buy max YooA Dimensions."
    },
    rewardEffect() {
      return new Decimal(1.05)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.YooAPoints.gte(1e12) && getUpgLevels("YooA", 11).eq(0)
    }
  },
  24: {
    title: "Realm of YooA",
    img: require("@/assets/ach24.jpg"),
    description() {
      return "Buy 1 YooA Realm."
    },
    done() {
      return player.dimensions.YooA[3].level.gte(1)
    }
  },
  25: {
    title: "YooA Supreme",
    img: require("@/assets/ach25.jpg"),
    description() {
      return "Have " + format(1e100) + " YooA Points."
    },
    rewardDescription() {
      return "All YooA Dimensions are 5% stronger."
    },
    rewardEffect() {
      return new Decimal(1.05)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.YooAPoints.gte(1e100)
    }
  },
  26: {
    title: "YooA Entity Awakens",
    img: require("@/assets/ach26.jpg"),
    description() {
      return "Buy 1 YooA Entity."
    },
    done() {
      return player.dimensions.YooA[4].level.gte(1)
    }
  },
  27: {
    title: "YooAmatter Overload",
    img: require("@/assets/ach27.jpg"),
    description() {
      return "Get " + format(1e24) + " YooAmatter."
    },
    rewardDescription() {
      return "Unlock buy max YooA upgrades and Max All YooA Lines and YooA Planes."
    },
    done() {
      return player.stats.YooAmatter.totalAmount.gte(1e24)
    }
  },
  28: {
    title: "Infinity Unbound",
    img: require("@/assets/ach28.jpg"),
    description() {
      return "Have " + format(Decimal.dNumberMax) + " YooA Points."
    },
    rewardDescription() {
      return "Achievement multiplier boosts YooA Dimensions."
    },
    done() {
      return player.YooAPoints.gte(Decimal.dNumberMax)
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
  let max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl
  const maxLevel = upgrade.maxLvl !== undefined ? max : Decimal.dInf; // Default to INFINITY

  // Handle static or dynamic cost
  const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;
  let curr = upgrade.costLayer ? player[upgrade.costLayer][upgrade.costInternal] : player[upgrade.costInternal]

  return curr.gte(cost) && currentLevel.lt(maxLevel);
}

export function buyUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade

  if (canAffordUpgrade(layer, id)) {
    // Handle static or dynamic cost
    const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;
    let curr = upgrade.costLayer ? player[upgrade.costLayer][upgrade.costInternal] : player[upgrade.costInternal]

    // Deduct the cost
    if (!gameLayers[layer].upgrades.costsNothing()) curr = curr.sub(cost);

    // After subtraction, ensure the player's currency is updated
    if (upgrade.costLayer) {
      player[upgrade.costLayer][upgrade.costInternal] = curr;
    } else {
      player[upgrade.costInternal] = curr;
    }

    // Initialize player.upgrades[layer] if it doesn't exist
    player.upgrades[layer] = player.upgrades[layer] || {};

    // If the upgrade isn't purchased yet, set it to level 1
    if (!player.upgrades[layer][id]) {
      player.upgrades[layer][id] = new Decimal(1); // Start at level 1
    }
    else {
      let max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl
      let nomax = max && player.upgrades[layer][id].lt(max)
      nomax = nomax || !max
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

export function buyMaxUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade

  // Check if the player can afford the upgrade
  if (canAffordUpgrade(layer, id)) {
    // Handle static or dynamic cost
    let curr = upgrade.costLayer ? player[upgrade.costLayer][upgrade.costInternal] : player[upgrade.costInternal];

    let max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl;

    if (max?.eq(1)) {
      buyUpgrade(layer, id)
      return
    }

    // Calculate how many upgrades the player can afford
    let maxBulk
    let nocost = gameLayers[layer].upgrades.costsNothing()

    const tetrabulk = bulkBuyTetraBinarySearch(curr, {
      costFunction: upgrade.cost,
      cumulative: nocost,
      maxLevel: upgrade.maxLvl
    }, getUpgLevels(layer, id));

    if (!tetrabulk) return;

    maxBulk = tetrabulk

    if (maxBulk.quantity.lt(1e15)) {
      const bulk = bulkBuyBinarySearch(curr, {
        costFunction: upgrade.cost,
        cumulative: nocost,
        maxLevel: upgrade.maxLvl
      }, getUpgLevels(layer, id));
      maxBulk = bulk
    }

    const maxAffordable = maxBulk.quantity; // Get the maximum number of upgrades player can afford

    // If no upgrades can be purchased, return early
    if (maxAffordable.lte(0)) return;

    // Subtract the total cost for all the upgrades from the player's currency
    const totalCost = maxBulk.purchasePrice; // Multiply the cost by the number of upgrades the player can afford
    if (!nocost) curr = curr.sub(totalCost);

    // Update the player's currency after the subtraction
    if (upgrade.costLayer) {
      player[upgrade.costLayer][upgrade.costInternal] = curr;
    } else {
      player[upgrade.costInternal] = curr;
    }

    // Initialize player.upgrades[layer] if it doesn't exist
    player.upgrades[layer] = player.upgrades[layer] || {};

    // If the upgrade hasn't been purchased yet, set it to the affordable amount
    if (!player.upgrades[layer][id]) {
      player.upgrades[layer][id] = maxAffordable; // Set the level to the number of upgrades purchased
    } else {
      let nomax = max && player.upgrades[layer][id].lt(max);
      nomax = nomax || !max;

      if (nomax) {
        // Add the maximum number of upgrades that can be afforded, up to the max level
        player.upgrades[layer][id] = player.upgrades[layer][id].add(maxAffordable);
        if (max && player.upgrades[layer][id].gt(max)) {
          player.upgrades[layer][id] = new Decimal(max); // Limit to maxLvl
        }
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

export function prestige(layer) {
    let gain = gameLayers[layer].getResetGain()
    player[layer].amount = player[layer].amount.add(gain)
    player.stats[layer].totalAmount = player.stats[layer].totalAmount.add(gain)
    player.YooAPoints = new Decimal(0)
    player.upgrades.YooA = {}
    player.math.YooA = getStartMath().YooA
    if (hasUpgrade("YooAmatter", 21)) player.math.YooA.solved = 1000
    else if (hasUpgrade("YooAmatter", 14)) player.math.YooA.solved = 300
    resetAllDimensions(player.dimensions.YooA, layer)
}