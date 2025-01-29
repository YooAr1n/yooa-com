<template>
    <div
        class="dimension"
        :class="{ 'disabled': !canAfford }"
        :style="dimensionStyle"
    >
        <h2>{{ dimHeader }}</h2>
        <h3>{{ dimGain }}</h3>
        <p v-if="dimension.tier === 1">Boosts YooA Point gain.</p>
        <p v-else-if="dimension.tier > 1">
            Produces {{ prevDimensionName }}.
        </p>
        <p>Cost: {{ formattedCost }} {{ costCurrDisp }}</p>
        <p>{{ dimension.effectDisplay }}</p>
        <button @click="buyDimension">Buy</button>
        <button v-if="maxUnlocked" @click="maxDimension">Buy Max</button>
    </div>
</template>

<script>
import { hasAchievement, player } from "@/incremental/incremental.js"; // Import the player object

export default {
    props: {
        dimension: Object,
        allDimensions: Array,
    },
    computed: {
        // Cached dimension properties to avoid redundant access
        dimensionData() {
            const { amt, name, level, mult, tier, costDisp, cost, effectDisplay, layer, currency, type } = this.dimension;
            return {
                amt, name, level, mult, tier, costDisp, cost, effectDisplay, layer, currency, type
            };
        },

        dimHeader() {
            const { amt, name, level, mult } = this.dimensionData;
            return `${format(amt)} ${name} (Level ${formatWhole(level)}) x${format(mult)}`;
        },

        dimGain() {
            const { tier } = this.dimensionData;
            const layer = "YooA";
            return player.gain[layer]?.dimensions?.[tier - 1] ?? "N/A"; // Use optional chaining
        },

        costCurrDisp() {
            return this.dimensionData.costDisp;
        },

        currency() {
            const { layer, currency } = this.dimensionData;
            return layer === "" ? player.YooAPoints : player[layer]?.[currency];
        },

        canAfford() {
            return this.currency?.gte(this.dimensionData.cost) ?? false;
        },

        maxUnlocked() {
            return hasAchievement(23);
        },

        dimensionStyle() {
            const { type, tier } = this.dimensionData;
            const disabled = "linear-gradient(#c51313, #ff5757)";
            const gradientYooA = tier < 3 ? "linear-gradient(#991893, #d17be2)" : "linear-gradient(#ad1480, #dd14b1)";
            const gradientDefault = "linear-gradient(#4caf50, #81c784)";

            return {
                background: this.canAfford
                    ? type === "YooA"
                        ? gradientYooA
                        : gradientDefault
                    : disabled,
            };
        },

        prevDimensionName() {
            const prevDimension = this.allDimensions[this.dimensionData.tier - 2]; // Array is 0-indexed
            return prevDimension?.name || "";
        },

        formattedCost() {
            return format(this.dimensionData.cost);
        },
    },
    methods: {
        buyDimension() {
            this.dimension.buy(player);
        },
        maxDimension() {
            this.dimension.buyMax(player);
        },
    },
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
