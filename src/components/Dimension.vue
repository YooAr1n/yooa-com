<template>
    <div class="dimension" :class="{ 'disabled': !canAfford }">
        <h2>{{ dimHeader }}</h2>
        <p v-if="dimension.tier === 1">Boosts YooA Point gain.</p>
        <p v-else-if="dimension.tier > 1">Produces {{ getPrevDimensionName(dimension.tier) }}.</p>
        <p>Cost: {{ formatCost(dimension.cost) }} YooA Points</p>
        <p>{{ getEffectDisplay(dimension) }}</p> <!-- Call the method directly -->
        <button @click="buyDimension" :disabled="!canAfford">Buy</button>
    </div>
</template>

<script>
import { player } from "@/incremental/incremental.js";  // Import the player object

export default {
    props: {
        dimension: Object,
        allDimensions: Array
    },
    computed: {
        dimHeader() {
            return format(this.dimension.amt) + " " + this.dimension.name + " (Level " + formatWhole(this.dimension.level) + ") x" + format(this.dimension.mult)
        },
        canAfford() {
            return player[this.dimension.currency].gte(this.dimension.cost)
        }
    },
    methods: {
        buyDimension() {
            this.dimension.buy(player);
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
    background: linear-gradient(to right, #991893, #d17be2);
    padding: 5px;
    margin: 10px;
    border-radius: 10px;
}

.dimension h2 {
    margin: 10px;
}

.dimension.disabled {
    background: linear-gradient(to right, #c51313, #ff5757);
    cursor: not-allowed;
}
</style>