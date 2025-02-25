<template>
    <div class="dimension" :class="{ disabled: !canAfford }" :style="dimensionStyle">
        <h2>{{ dimHeader }}</h2>
        <h3>{{ dimGain }}</h3>
        <p v-if="dimension.tier === 1">{{ dimension.t1Text }}</p>
        <p v-else-if="dimension.tier > 1">
            Produces {{ prevDimensionName }}.
        </p>
        <p>Cost: {{ formattedCost }} {{ dimension.costDisp }}</p>
        <p>{{ dimension.effectDisplay }}</p>
        <button @click="buyDimension">Buy</button>
        <button v-if="maxUnlocked" @click="maxDimension">Buy Max</button>
    </div>
</template>

<script>
import { hasAchievement, player } from "@/incremental/incremental.js";

export default {
    props: {
        dimension: {
            type: Object,
            required: true,
        },
        allDimensions: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        // Build the dimension header using properties directly from the dimension prop
        dimHeader() {
            const { amt, name, level, mult } = this.dimension;
            return `${format(amt)} ${name} (Level ${formatWhole(level)}) x${format(mult)}`;
        },
        // Get the current gain value from the global player object
        dimGain() {
            const { type, tier } = this.dimension;
            return player.gain[type]?.dimensions?.[tier - 1] ?? "N/A";
        },
        // Returns the current currency (either YooAPoints or a layer-specific currency)
        currency() {
            const { layer, currency } = this.dimension;
            return layer === ""
                ? player.YooAPoints
                : player[layer]?.[currency];
        },
        // Determines if the player can afford the dimension cost
        canAfford() {
            return this.currency?.gte(this.dimension.cost) ?? false;
        },
        // Unlocks max-buy if the achievement is reached
        maxUnlocked() {
            return hasAchievement(23);
        },
        // Computes the background gradient based on type, tier, and affordability
        dimensionStyle() {
            const { type, tier } = this.dimension;
            const disabled = "linear-gradient(#c51313, #ff5757)";
            const gradientYooA =
                tier < 3
                    ? "linear-gradient(#991893, #d17be2)"
                    : "linear-gradient(#ad1480, #dd14b1)";
            const gradientDefault = "linear-gradient(#4caf50, #81c784)";

            return {
                background: this.canAfford
                    ? type === "YooA"
                        ? gradientYooA
                        : gradientDefault
                    : disabled,
            };
        },
        // Retrieves the name of the previous dimension (if any)
        prevDimensionName() {
            const tier = this.dimension.tier;
            return tier > 1 && this.allDimensions[tier - 2]
                ? this.allDimensions[tier - 2].name
                : "";
        },
        // Formats the cost for display
        formattedCost() {
            return format(this.dimension.cost);
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