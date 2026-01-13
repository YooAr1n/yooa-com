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
import dedent from "dedent";
import { inAnyChallenge } from '@/incremental/incremental';
import { exitOrComplete } from '@/incremental/mainFuncs';
import { gameLayers } from "@/incremental/layersData";

export default {
    name: "PrestigeButton",
    props: {
        layerName: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            gain: Decimal.dZero,
            nextAt: Decimal.dZero,
            prestigeCurrency: "",
            prestigeAction: "Reset",
            baseCurrency: Decimal.dZero,
            requires: Decimal.dZero,
            canReset: false,

        };
    },
    computed: {
        prestigeDesc() {
            const hotkey = this.triggerKey;
            return `${this.prestigeAction} for ${formatWhole(this.gain)} ${this.prestigeCurrency}${hotkey ? " (" + hotkey.toUpperCase() + ")" : ""}`;
        },
        nextAtDesc() {
            if (!this.canReset) return `Req: ${format(this.requires)} ${this.baseCurrency}`
            let oom = this.gain.gte(1e6) ? "OoM" : ""
            return `Next ${oom} at ${format(this.nextAt)} ${this.baseCurrency}`;
        },
        // 🌸 YooA's own magic key! 🌸
        triggerKey() {
            if (this.layerName === "YooAmatter") return "y";
            if (this.layerName === "YooAity") return "t";
            return null;
        }
    },
    methods: {
        update() {
            this.gain = gameLayers[this.layerName].getResetGain()
            this.nextAt = gameLayers[this.layerName].getNextAt()
            this.prestigeCurrency = gameLayers[this.layerName].currency
            this.prestigeAction = gameLayers[this.layerName].action ?? "Reset"
            this.baseCurrency = gameLayers[this.layerName].baseCurrency
            this.requires = gameLayers[this.layerName].requires
            this.canReset = gameLayers[this.layerName].canReset()
        },
        confirmPrestige(con = options.confirmations[this.layerName]) {
            if (!this.canReset) return; // Ensure reset is possible

            if (inAnyChallenge()) {
                const chall = player.inChallenge;
                exitOrComplete(chall[0], chall[1]);
            } else {
                // Check confirmation status
                if (con) {
                    // general message (any reset)
                    let message =
                        `🌸 YooA says... "Are you *really* sure you want to reset?" 🌸\n` +
                        `🎶 You'll earn ${formatWhole(this.gain ?? 0)} ${this.prestigeCurrency}, but your progress in ${this.baseCurrency} will vanish in a sparkle of magic! ✨\n` +
                        `💫 Think wisely, magical adventurer... YooA believes in your choices! 💖`;

                    if (this.layerName === "YooAmatter") {
                        message = dedent(`Are you sure you want to ascend into YooAmatter?
                        This will reset your current progress, including YooA Points and all ${this.baseCurrency}-related upgrades, for ${formatWhole(this.gain ?? 0)} ${this.prestigeCurrency}.
                        This is the first step toward YooA's divine evolution. Do you wish to proceed?`);
                    }

                    if (this.layerName === "YooAity") {
                        message = dedent(`Are you sure you want to transcend into YooAity?
                        This will reset all your progress, including YooA Points, YooAmatter, YooArium, and all upgrades for ${formatWhole(this.gain ?? 0)} ${this.prestigeCurrency}. However, automation will be preserved to help you rebuild faster.
                        This is a significant step toward YooA's ultimate evolution. Do you wish to proceed?`);
                    }

                    if (confirm(message)) {
                        this.performPrestige();
                    }
                } else {
                    // Directly perform prestige if confirmation is disabled
                    this.performPrestige();
                }

            }
        },
        performPrestige(layer = this.layerName) {
            const gain = gameLayers[layer].getResetGain();
            if (!gain.gt(0)) return
            this.$emit("prestige", layer);
        },
        onGlobalKeydown(e) {
            if (!e.key) return
            // only fire when our key matches, button is enabled, and this component is visible
            if (
                this.triggerKey &&
                e.key.toLowerCase() === this.triggerKey &&
                this.canReset
            ) {
                this.confirmPrestige();
            }
        }
    },
    mounted() {
        // Listen for the custom update event and call the update method
        window.addEventListener("GAME_EVENT.UPDATE", this.update)
        window.addEventListener("keydown", this.onGlobalKeydown);
    },
    beforeUnmount() {
        // Remove the event listener when the component is destroyed
        window.removeEventListener("GAME_EVENT.UPDATE", this.update)
        window.removeEventListener("keydown", this.onGlobalKeydown);
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

.prestige-button.layer-YooAity {
    background: linear-gradient(#200642, #230085)
}

.prestige-button.disabled {
    background: linear-gradient(#ff5757, #c51313);
    cursor: not-allowed;
    pointer-events: none;
}

.prestige-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}
</style>
