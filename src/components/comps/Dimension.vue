<template>
    <div class="dimension" :class="{ 'disabled': !canAfford }" :style="dimensionStyle">
        <h2>{{ dimHeader }}</h2>
        <h3>{{ dimGain }}</h3>
        <p v-if="dimension.tier === 1">Boosts YooA Point gain.</p>
        <p v-else-if="dimension.tier > 1">Produces {{ getPrevDimensionName(dimension.tier) }}.</p>
        <p>Cost: {{ formatCost(dimension.cost) }} {{ costCurrDisp }}</p>
        <p>{{ getEffectDisplay(dimension) }}</p>
        <button @click="buyDimension">Buy</button>
        <button v-if="maxUnlocked" @click="maxDimension">Buy Max</button>
    </div>
</template>

<script>
import { hasAchievement, player } from "@/incremental/incremental.js";  // Import the player object

export default {
    props: {
        dimension: Object,
        allDimensions: Array
    },
    computed: {
        dimHeader() {
            return format(this.dimension.amt) + " " + this.dimension.name + " (Level " + formatWhole(this.dimension.level) + ") x" + format(this.dimension.mult)
        },
        dimGain() {
            const layer = "YooA";
            const tier = this.dimension.tier - 1;
            if (player.gain[layer] && player.gain[layer].dimensions && player.gain[layer].dimensions[tier] !== undefined) {
                return player.gain[layer].dimensions[tier];
            }
            return "N/A";  // Return a default value if dimensions is not defined
        },
        costCurrDisp() {
            return this.dimension.costDisp
        },
        currency() {
            return this.dimension.layer === '' ? player.YooAPoints : player[this.dimension.layer][this.dimension.currency]
        },
        canAfford() {
            return this.currency.gte(this.dimension.cost)
        },
        maxUnlocked() {
            return hasAchievement(23)
        },
        dimensionStyle() {
            // Check if the dimension belongs to "YooA" and return the corresponding gradient
            let disabled = "linear-gradient(to right, #c51313, #ff5757)"
            if (this.dimension.type === "YooA") {
                if (this.dimension.tier < 3) return { //Style for YooA Point costs
                    background: this.canAfford ? "linear-gradient(to right, #991893, #d17be2)" : disabled
                }
                return { //Style for YooAmatter costs
                    background: this.canAfford ? "linear-gradient(to right, #ad1480, #dd14b1)" : disabled
                };
            }
            else {
                return {
                    background: this.canAfford ? "linear-gradient(to right, #4caf50, #81c784)" : disabled
                };
            }
        }
    },
    methods: {
        buyDimension() {
            this.dimension.buy(player);
        },
        maxDimension() {
            this.dimension.buyMax(player);
        },
        getPrevDimensionName(tier) {
            const prevDimension = this.allDimensions[tier - 2]; // tier-2 because array is 0-indexed
            return prevDimension ? prevDimension.name : '';
        },
        getEffectDisplay(dimension) {
            // Directly call the effectDisplay function from the dimension
            return dimension.effectDisplay();  // Ensure effectDisplay is a method
        },
        formatCost(cost) {
            return format(cost);
        }
    }
};
</script>

<style scoped>
.dimension {
    padding: 5px;
    margin: 10px;
    border-radius: 10px;
}

.dimension h2 {
    margin: 10px;
}

/* Disabled style for when you can't afford the dimension */
.dimension.disabled {
    cursor: not-allowed;
}
</style>
