import Decimal from "./break_eternity.js";
import { player, getYooAGain } from "./incremental.js";

export const gameLayers = {
    YooA: {
        upgrades: {
          rows: 3,
          cols: 3,
          11: {
              title: "Start (YU 11)",
              description() {
                return "Gain " + format(getYooAGain()) + " YooA Points/s."
              },
              cost: new Decimal(10),
              costCurrency: "YooA Points",
              costInternal: "YooAPoints",
              maxLvl: new Decimal(1),
              effect() {
                return true;
              },
              effectDisplay() {
                let gain = getYooAGain()
                if (!hasUpgrade("YooA", 11)) gain = 0
                return format(gain) + "/s";
              },
          },
          12: {
              title: "YooA Doubler (YU 12)",
              description() { 
                return "Double YooA Points/s."
              },
              cost() {
                return Decimal.pow(1.3, getUpgLevels("YooA", 12).pow(1.3));
              },
              costCurrency: "YooA Points",
              costInternal: "YooAPoints",
              //maxLvl: new Decimal(10),
              effect() {
                return Decimal.pow(player.YooAPoints.max(10).log10().div(100).add(1.5), getUpgLevels("YooA", 12));
              },
              effectDisplay() {
                return "x" + format(this.effect());
              },
          },
          21: {
              title: "YooA Booster (YU 21)",
              description() { 
                return "Gain 100x more YooA Points/s."
              },
              cost: new Decimal(1e11),
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
          // Add more upgrades for other rows and columns as needed
        },
      },
    AnotherLayer: { /* another object */ }
};

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
