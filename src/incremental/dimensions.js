import Decimal from "./break_eternity.js";
import { gainCurrency, getYooADimensionMult, hasAchievement } from "./incremental.js";
import { hasUpgrade, inChallenge, upgradeEffect } from "./main.js";

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

        // Cache base cost and multiplier
        this._baseCost = new Decimal([null, 10, 10000, 10, 1e5, 1e10][this.tier]);
        this._costMultiplier = new Decimal([null, 1.15, 1.5, 1.1, 1.4, 2][this.tier]);

        // Bind the cost function once and reuse it
        this.boundGetDimensionCost = this.getDimensionCost.bind(this);
        this.boundGetDimInvCost = this.getInvDimCost.bind(this);
    }

    // Return cached base cost value
    get baseCost() {
        return this._baseCost;
    }

    // Return cached cost multiplier value
    get costMultiplier() {
        return this._costMultiplier;
    }

    // Cache the dimension cost, only recalculate when necessary
    get cost() {
        if (!this._cachedCost) {
            this._cachedCost = this.getDimensionCost(this.level);
        }
        return this._cachedCost;
    }

    // Cache the multiplier
    get mult() {
        if (!this._cachedMult) {
            const eff = Decimal.pow(getDimMultPerLvl(this.tier), this.level).mul(getYooADimensionMult());
            this._cachedMult = (this.tier === 2 && this.type === "YooA" && inChallenge("YooAmatter", 2))
                ? Decimal.dZero  // Special case
                : eff;
        }
        return this._cachedMult;
    }

    // Cache the effect
    get effect() {
        if (!this._cachedEffect) {
            const effect = this.mult.mul(this.amt);
            this._cachedEffect = this.tier === 1
                ? effect.div(10).add(1)
                : effect.div(100);
        }
        return this._cachedEffect;
    }

    // Unlocked state can be cached
    get unlocked() {
        if (this._unlocked === undefined) {
            this._unlocked = this.tier < 3 || hasAchievement(18);
        }
        return this._unlocked;
    }

    get effectDisplay() {
        const effect = format(this.effect);
        return `Effect: ${this.tier === 1 ? `x${effect}` : `${effect}/s`}`;
    }

    // Cache dimension cost calculation
    getDimensionCost(level = this.level) {
        if (this._cachedDimensionCostLevel === level) return this._cachedDimensionCost;

        const scaledLevel = level.gte(1e4) ? level.div(1e4).pow(2).mul(1e4) : level;
        this._cachedDimensionCost = Decimal.pow(this._costMultiplier, scaledLevel).mul(this._baseCost);
        this._cachedDimensionCostLevel = level;

        return this._cachedDimensionCost;
    }

    getInvDimCost(x = this.layer === '' ? player.YooAPoints : player[this.layer][this.currency]) {
        // If the level hasn't changed or the cache isn't stale, return the cached value
        let level = x.div(this._baseCost).log(this._costMultiplier)

        // Rescale for large levels only when needed
        if (level.gte(1e4)) {
            level = level.div(1e4).root(2).mul(1e4);
        }

        return level;
    }

    // When buying the dimension, cache the new cost
    buy(player) {
        const curr = this.layer === '' ? player.YooAPoints : player[this.layer][this.currency];
        if (!curr.gte(this.cost)) return;

        const subt = curr.sub(this.cost);
        this.level = this.level.add(1);
        this.amt = this.amt.add(1);
        this.resetCache();
        this.updateCurrency(player, subt);
    }

    // Max-buy logic: Cache new cost and other recalculated values
    buyMax(player) {
        const curr = this.layer === '' ? player.YooAPoints : player[this.layer][this.currency];
        if (curr.lt(this.cost)) return;

        let max = Decimal.affordGeometricSeries(curr, this._baseCost, this._costMultiplier, this.level);
        let maxQty = max
        if (this.level.add(max).gte(1e4)) {
            max = bulkBuyBinarySearch(curr, {
                costFunction: this.boundGetDimensionCost,
                invCostFunction: this.boundGetDimInvCost,
            }, this.level);
            maxQty = max.quantity
        }

        if (maxQty.lte(0)) return;
        const maxCost = max.purchasePrice ? max.purchasePrice : Decimal.sumGeometricSeries(max, this._baseCost, this._costMultiplier, this.level);

        this.level = this.level.add(maxQty);
        this.amt = this.amt.add(maxQty);
        this.updateCurrency(player, curr.sub(maxCost));
        this.resetCache(); // Reset all caches at once
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
        const i = this.tier - 2;
        const gainPath = `dimensions.YooA.${i}.amt`;
        if (!this.effect.eq(0)) {
            player.gain.YooA.dimensions[i] = gainCurrency(player, gainPath, this.effect, diff, true);
        }
    }

    // Reset logic
    reset(layer, highestTier) {
        const resetLevel = layer === "YooAmatter" && this.tier <= 2 ? Decimal.dZero : this.level;
        this.level = resetLevel;
        this.amt = this.tier === highestTier && this.tier >= 3 ? this.level : Decimal.dZero;
        this.resetCache(); // Use unified cache reset
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
export function getDimMultPerLvl(tier) {
    let base = new Decimal(1.01);
    if (hasUpgrade("YooAmatter", 14)) base = base.add(upgradeEffect("YooAmatter", 14));
    if (hasUpgrade("YooAmatter", 43)) base = base.add(upgradeEffect("YooAmatter", 43));
    if (tier < 3) return base;
    if (hasUpgrade("YooAmatter", 13)) return base.pow(3);
    return base;
}

export function getHighestTier(dimensions) {
    const validDimensions = dimensions.filter(d => d.level.gte(1));
    return validDimensions.length ? Math.max(...validDimensions.map(d => d.tier)) : 0;
}

export function resetAllDimensions(dimensions, layer) {
    const highestTier = getHighestTier(dimensions);
    dimensions.forEach(d => d.reset(layer, highestTier));
}
