import Decimal from "./break_eternity.js";
import { gainCurrency, getYooADimensionMult, getYooAmatterFormationMult, hasAchievement } from "./incremental.js";
import { hasUpgrade, inChallenge, upgradeEffect } from "./main.js";

// Cache common constants
const LEVEL_SCALE_THRESHOLD = new Decimal(1e4);

// Pre-cached base cost and multiplier values (shared between instances)
const BASE_COSTS = {
    YooA: [null, new Decimal(10), new Decimal(10000), new Decimal(10), new Decimal(1e5), new Decimal(1e10)],
    YooAmatter: [null, new Decimal("1e150"), new Decimal("1e250"), new Decimal("e400"), new Decimal("e700"), new Decimal("e1400")]
};

const COST_MULTS = {
    YooA: [null, new Decimal(1.15), new Decimal(1.5), new Decimal(1.1), new Decimal(1.4), new Decimal(2)],
    YooAmatter: [null, new Decimal(1e5), new Decimal(1e10), new Decimal(1e20), new Decimal(1e30), new Decimal(1e50)]
};

export default class Dimension {
    constructor(type, name, amt, level, tier, costDisp = "YooA Points", layer = '', currency = 'amount') {
        this.type = type;
        this.name = name;
        this.amt = new Decimal(amt);
        this.level = level;
        this.tier = tier;
        this.costDisp = costDisp;
        this.layer = layer;
        this.currency = currency;

        // Use pre-cached constants instead of redefining them per instance
        if (BASE_COSTS[this.type] && COST_MULTS[this.type]) {
            this._baseCost = BASE_COSTS[this.type][this.tier];
            this._costMultiplier = COST_MULTS[this.type][this.tier];
        } else {
            console.error("Invalid type or tier");
        }

        // Bind cost functions once to reuse in bulk-buy logic
        this.boundGetDimensionCost = this.getDimensionCost.bind(this);
        this.boundGetDimInvCost = this.getInvDimCost.bind(this);
    }

    // Getters for base cost and cost multiplier
    get baseCost() {
        return this._baseCost;
    }

    get costMultiplier() {
        return this._costMultiplier;
    }

    // Lazy cache for cost calculation
    get cost() {
        if (this._cachedCost === undefined) {
            this._cachedCost = this.getDimensionCost(this.level);
        }
        return this._cachedCost;
    }

    // Lazy cache for multiplier calculation
    get mult() {
        if (this._cachedMult === undefined) {
            let eff = Decimal.pow(getDimMultPerLvl(this.type, this.tier), this.level);
            if (this.type === "YooA") eff = eff.mul(getYooADimensionMult());
            if (this.type === "YooAmatter") eff = eff.mul(getYooAmatterFormationMult());
            this._cachedMult = (this.tier === 2 && this.type === "YooA" && inChallenge("YooAmatter", 2))
                ? Decimal.dZero  // Special case
                : eff;
        }
        return this._cachedMult;
    }

    // Lazy cache for effect calculation
    get effect() {
        if (this._cachedEffect === undefined) {
            const effect = this.mult.mul(this.amt);
            this._cachedEffect = (this.tier === 1 && this.type === "YooA")
                ? effect.div(10).add(1)
                : effect.div(100);
        }
        return this._cachedEffect;
    }

    get unlocked() {
        if (this.type === "YooA") return this.tier < 3 || hasAchievement(18);
        if (this.type === "YooAmatter") return hasUpgrade("YooAmatter", 44);
        return false;
    }

    get effectDisplay() {
        const effect = format(this.effect);
        return `Effect: ${this.tier === 1 && this.type === "YooA" ? `x${effect}` : `${effect}/s`}`;
    }

    get t1Text() {
        if (this.type === "YooA") return "Boosts YooA Point gain.";
        if (this.type === "YooAmatter") return "Produces YooAmatter Sparks.";
        return "";
    }

    // Caches the dimension cost calculation, recalculating only when level changes
    getDimensionCost(level = this.level) {
        if (this._cachedDimensionCostLevel && this._cachedDimensionCostLevel.equals(level)) return this._cachedDimensionCost;

        const scaledLevel = level.gte(LEVEL_SCALE_THRESHOLD)
            ? level.div(LEVEL_SCALE_THRESHOLD).pow(2).mul(LEVEL_SCALE_THRESHOLD)
            : level;
        this._cachedDimensionCost = Decimal.pow(this.costMultiplier, scaledLevel).mul(this.baseCost);
        this._cachedDimensionCostLevel = level;

        return this._cachedDimensionCost;
    }

    // Inverts the cost calculation
    getInvDimCost(x = (this.layer === '' ? player.YooAPoints : player[this.layer][this.currency])) {
        let level = x.div(this.baseCost).log(this.costMultiplier);

        if (level.gte(LEVEL_SCALE_THRESHOLD)) {
            level = level.div(LEVEL_SCALE_THRESHOLD).root(2).mul(LEVEL_SCALE_THRESHOLD);
        }

        return level;
    }

    // Buy one unit of the dimension
    buy(player) {
        const curr = (this.layer === '' ? player.YooAPoints : player[this.layer][this.currency]);
        if (!curr.gte(this.cost)) return;

        const newCurr = curr.sub(this.cost);
        this.level = this.level.add(1);
        this.amt = this.amt.add(1);
        this.resetCache();
        this.updateCurrency(player, newCurr);
    }

    // Buy as many dimensions as possible
    buyMax(player) {
        const curr = (this.layer === '' ? player.YooAPoints : player[this.layer][this.currency]);
        if (curr.lt(this.cost)) return;

        let maxPurchase = Decimal.affordGeometricSeries(curr, this.baseCost, this.costMultiplier, this.level);
        let maxQty = maxPurchase;
        if (this.level.add(maxPurchase).gte(LEVEL_SCALE_THRESHOLD)) {
            maxPurchase = bulkBuyBinarySearch(curr, {
                costFunction: this.boundGetDimensionCost,
                invCostFunction: this.boundGetDimInvCost,
            }, this.level);
            maxQty = maxPurchase.quantity;
        }

        if (maxQty.lte(0)) return;
        const maxCost = maxPurchase.purchasePrice 
            ? maxPurchase.purchasePrice 
            : Decimal.sumGeometricSeries(maxPurchase, this.baseCost, this.costMultiplier, this.level);

        if (curr.lt(maxCost)) return;

        this.level = this.level.add(maxQty);
        this.amt = this.amt.add(maxQty);
        this.updateCurrency(player, curr.sub(maxCost));
        this.resetCache();
    }

    updateCurrency(player, curr) {
        if (this.layer === '') {
            player.YooAPoints = curr;
        } else {
            player[this.layer][this.currency] = curr;
        }
    }

    updateAmount(diff) {
        if (this.tier <= 1) return;
        const index = this.tier - 2;
        const gainPath = `dimensions.${this.type}.${index}.amt`;
        if (!this.effect.eq(0)) {
            player.gain[this.type].dimensions[index] = gainCurrency(player, gainPath, this.effect, diff, true);
        }
    }

    reset(layer, highestTier) {
        if (this.type === "YooA") {
            const resetLevel = (layer === "YooAmatter" && this.tier <= 2) ? Decimal.dZero : this.level;
            this.level = resetLevel;
            this.amt = (this.tier === highestTier && this.tier >= 3) ? this.level : Decimal.dZero;
        } else {
            const resetLevel = (layer === "YooAmatter") ? this.level : Decimal.dZero;
            this.level = resetLevel;
            this.amt = this.level;
        }
        this.resetCache();
    }

    resetCache() {
        this._cachedCost = undefined;
        this._cachedMult = undefined;
        this._cachedEffect = undefined;
        this._cachedDimensionCost = undefined;
        this._cachedDimensionCostLevel = undefined;
    }
}

// Helper function to calculate dimension multipliers based on tier
export function getDimMultPerLvl(type, tier) {
    const baseValues = {
        YooA: new Decimal(1.01),
        YooAmatter: new Decimal(1.5)
    };
    let base = baseValues[type];

    if (type === "YooA") {
        if (hasUpgrade("YooAmatter", 14)) base = base.add(upgradeEffect("YooAmatter", 14));
        if (hasUpgrade("YooAmatter", 43)) base = base.add(upgradeEffect("YooAmatter", 43));
        if (tier < 3) return base;
        if (hasUpgrade("YooAmatter", 13)) {
            const sparkEffect = upgradeEffect("sparks", 11).add(1);
            return base.pow(3).pow(sparkEffect);
        }
    }

    if (type === "YooAmatter") {
        base = base.add(upgradeEffect("sparks", 11));
    }
    return base;
}

// Optimized: Use a single loop to find the highest tier among dimensions
export function getHighestTier(dimensions) {
    let maxTier = 0;
    for (let i = 0; i < dimensions.length; i++) {
        if (dimensions[i].level.gte(1) && dimensions[i].tier > maxTier) {
            maxTier = dimensions[i].tier;
        }
    }
    return maxTier;
}

// Reset all dimensions by iterating once over the list
export function resetAllDimensions(dimensions, layer) {
    const highestTier = getHighestTier(dimensions);
    for (let i = 0; i < dimensions.length; i++) {
        dimensions[i].reset(layer, highestTier);
    }
}
