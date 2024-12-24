import Decimal from "./break_eternity.js";

export default class Dimension {
    constructor(name, amt, level, tier, currency = 'YooAPoints') {
        this.name = name;              // Name of the dimension
        this.amt = new Decimal(amt);    // Amount of the dimension
        this.tier = tier

        const BASE_COSTS = [null, 10, 10000];
        const BASE_COST_MULTIPLIERS = [null, 1.15, 1.5];
        this.baseCost = new Decimal(BASE_COSTS[tier]);  // The cost to purchase or upgrade this dimension
        this.costMultiplier = new Decimal(BASE_COST_MULTIPLIERS[tier]);  // The cost to purchase or upgrade this dimension

        this.mult = new Decimal(0);
        this.allMult = new Decimal(0);
        this.effect = new Decimal(0);           // The effect the dimension provides (e.g., YooA Points multiplier)

        this.currency = currency;       // The currency used to purchase the dimension
        this.level = level;    // The current level of the dimension
    }

    // Method to purchase or upgrade the dimension
    buy(player) {
        // Check if the player has enough currency
        if (player[this.currency].gte(this.cost)) {
            player[this.currency] = player[this.currency].sub(this.cost);  // Deduct cost
            this.level = this.level.add(1);  // Increment the level
            this.amt = this.amt.add(1);      // Increment the amount (optional)
        }
    }

    effectDisplay() {
        let dis = "Effect: "
        if (this.tier == 1) {
            dis += "x" + format(this.effect)
        }
        else {
            dis += format(this.effect) + "/s"
        }
        return dis
    }

    updateAmount(diff) {
        if (this.tier > 1) {
            let prevTierDimension = player.dimensions.YooA[this.tier - 2];
            prevTierDimension.amt = prevTierDimension.amt.add(this.effect.mul(diff));
        }
    }

    // Method to update the effect based on the level
    updateEffect() {
        let eff = Decimal.pow(1.01, this.level)
        this.mult = eff.mul(this.allMult);

        if (this.tier == 1) {
            eff = this.mult.mul(this.amt).div(10).add(1)
        }
        else {
            eff = this.mult.mul(this.amt).div(100)
        }
        this.effect = eff
    }

    // Method to update the cost of the dimension after purchase
    updateCost() {
        this.cost = Decimal.pow(this.costMultiplier, this.level).mul(this.baseCost);
    }

    // Method to reset a dimension, for example, in prestige mechanics
    reset() {
        this.level = new Decimal(0);  // Reset the level
        this.amt = new Decimal(0);    // Optionally reset the amount
    }
}
