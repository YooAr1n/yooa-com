import Decimal from "./break_eternity.js";
import { gainCurrency, hasAchievement } from "./incremental.js";
import { hasUpgrade, upgradeEffect } from "./main.js";

export default class Dimension {
    constructor(type, name, amt, level, tier, costDisp = "YooA Points", layer = '', currency = 'amount') {
        this.type = type;              // Type of the dimension
        this.name = name;              // Name of the dimension
        this.amt = new Decimal(amt);    // Amount of the dimension
        this.tier = tier;

        const BASE_COSTS = [null, 10, 10000, 10, 1e5, 1e10];
        const BASE_COST_MULTIPLIERS = [null, 1.15, 1.5, 1.1, 1.4, 2];
        this.baseCost = new Decimal(BASE_COSTS[tier]);  // The cost to purchase or upgrade this dimension
        this.costMultiplier = new Decimal(BASE_COST_MULTIPLIERS[tier]);  // The cost to purchase or upgrade this dimension

        this.mult = new Decimal(0);
        this.allMult = new Decimal(0);
        this.effect = new Decimal(0);           // The effect the dimension provides (e.g., YooA Points multiplier)

        this.costDisp = costDisp;
        this.layer = layer;
        this.currency = currency;       // The currency used to purchase the dimension
        this.level = level;    // The current level of the dimension

        this.unlocked = this.tier < 3;
        this.effMult = new Decimal(1.01)
    }

    buy(player) {
        let curr = this.layer == '' ? player.YooAPoints : player[this.layer][this.currency];

        if (curr.gte(this.cost)) {
            curr = curr.sub(this.cost);  // Deduct cost
            this.level = this.level.add(1);  // Increment the level
            this.amt = this.amt.add(1);      // Increment the amount (optional)
        }

        if (this.layer === '') {
            player.YooAPoints = curr;  // Update the player’s YooAPoints directly by reference
        } else {
            player[this.layer][this.currency] = curr;  // Update based on layer and currency
        }
    }

    buyMax(player) {
        let curr = this.layer == '' ? player.YooAPoints : player[this.layer][this.currency];

        if (curr.gte(this.cost)) {
            let max = Decimal.affordGeometricSeries(curr, this.baseCost, this.costMultiplier, this.level)
            let maxCost = Decimal.sumGeometricSeries(max, this.baseCost, this.costMultiplier, this.level)
            curr = curr.sub(maxCost);  // Deduct cost
            this.level = this.level.add(max);  // Increment the level
            this.amt = this.amt.add(max);      // Increment the amount (optional)
        }

        if (this.layer === '') {
            player.YooAPoints = curr;  // Update the player’s YooAPoints directly by reference
        } else {
            player[this.layer][this.currency] = curr;  // Update based on layer and currency
        }
    }

    effectDisplay() {
        let dis = "Effect: ";
        if (this.tier == 1) {
            dis += "x" + format(this.effect);
        } else {
            dis += format(this.effect) + "/s";
        }
        return dis;
    }

    updateAmount(diff) {
        if (this.tier > 1) {
            let i = this.tier - 2;
            if (this.effect.eq(0)) player.gain.YooA.dimensions[i] = "";
            else player.gain.YooA.dimensions[i] = gainCurrency(player, "dimensions.YooA." + i + ".amt", this.effect, diff, true);
        }
    }

    updateEffect() {
        let base = getDimMultPerLvl(this.tier)
        let eff = Decimal.pow(base, this.level);
        this.mult = eff.mul(this.allMult);

        if (this.tier == 1) {
            eff = this.mult.mul(this.amt).div(10).add(1);
        } else {
            eff = this.mult.mul(this.amt).div(100);
        }
        this.effect = eff;
    }

    updateCost() {
        this.cost = Decimal.pow(this.costMultiplier, this.level).mul(this.baseCost);
    }

    updateUnlocked() {
        this.unlocked = this.tier < 3 || hasAchievement(18);
    }

    reset(layer, highestTier) {
        this.effect = new Decimal(0);
        if (layer === "YooAmatter") {
            // Reset tiers 1 and 2 only
            if (this.tier === 1 || this.tier === 2) {
                this.level = new Decimal(0);
            }
        } else {
            // Reset all tiers for higher layers
            this.level = new Decimal(0);
        }

        // Set highest bought dimension amount to its level
        if (this.tier === highestTier && this.tier >= 3) {
            this.amt = this.level;
        }
        else this.amt = new Decimal(0);
    }
}

export function getDimMultPerLvl(tier) {
    let base = new Decimal(1.01)
    if (hasUpgrade("YooAmatter", 14)) base = base.add(upgradeEffect("YooAmatter", 14))
    if (tier < 3) return base
    if (hasUpgrade("YooAmatter", 13)) return base.pow(3)
    return base
}

export function getHighestTier(dimensions) {
    const validDimensions = dimensions.filter(d => d.level.gte(1)); // Only dimensions with level >= 1
    if (validDimensions.length === 0) return 0; // No dimensions with level >= 1
    return Math.max(...validDimensions.map(d => d.tier)); // Get the highest tier
}


export function resetAllDimensions(dimensions, layer) {
    const highestTier = getHighestTier(dimensions); // Get highest tier with level >= 1
    dimensions.forEach(d => d.reset(layer, highestTier)); // Pass highestTier to each dimension's reset
}
