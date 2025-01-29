<template>
    <div class="prestige-button-container">
        <button class="prestige-button" :class="[canReset ? `layer-${layerName}` : 'disabled']" :disabled="!canReset"
            @click="confirmPrestige()">
            {{ prestigeDesc }} <br>
            {{ nextAtDesc }}
        </button>
    </div>
</template>

<script>
import { inAnyChallenge } from '@/incremental/incremental';
import { exitOrComplete, gameLayers } from '@/incremental/main';

export default {
    name: "PrestigeButton",
    props: {
        layerName: {
            type: String,
            required: true
        },
    },
    computed: {
        gain() {
            return gameLayers[this.layerName].getResetGain();
        },
        nextAt() {
            return gameLayers[this.layerName].getNextAt();
        },
        prestigeCurrency() {
            return gameLayers[this.layerName].currency;
        },
        baseCurrency() {
            return gameLayers[this.layerName].baseCurrency;
        },
        requires() {
            return gameLayers[this.layerName].requires;
        },
        canReset() {
            return gameLayers[this.layerName].canReset();
        },
        prestigeDesc() {
            return `Reset for ${formatWhole(this.gain)} ${this.prestigeCurrency}`;
        },
        nextAtDesc() {
            if (!this.canReset) return `Req: ${format(this.requires)} ${this.baseCurrency}`
            let oom = this.gain.gte(1e6) ? "OoM" : ""
            return `Next ${oom} at ${format(this.nextAt)} ${this.baseCurrency}`;
        },
    },
    methods: {
        confirmPrestige(con = options.confirmations.YooAmatter) {
            if (!this.canReset) return; // Ensure reset is possible

            if (inAnyChallenge()) {
                const chall = player.inChallenge;
                exitOrComplete(chall[0], chall[1]);
            } else {
                // Check confirmation status
                if (con) {
                    const userConfirmed = confirm(
                        `Are you sure you want to reset? You will gain ${formatWhole(this.gain)} ${this.prestigeCurrency}. This will reset your current progress in ${this.baseCurrency}.`
                    );
                    if (userConfirmed) {
                        this.performPrestige();
                    }
                } else {
                    // Directly perform prestige if confirmation is disabled
                    this.performPrestige();
                }
            }
        },
        performPrestige() {
            this.$emit("prestige", this.layerName);
        },
    },
};
</script>

<style scoped>
.prestige-button-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

.prestige-button {
    background-color: #4caf50;
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.prestige-button.layer-YooAmatter {
    background: linear-gradient(#929923, #bcc70f)
}

.prestige-button.disabled {
    background: linear-gradient(#ff5757, #c51313);
    cursor: not-allowed;
}

.prestige-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}
</style>
