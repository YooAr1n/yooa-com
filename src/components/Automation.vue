<template>
    <div class="center-container">
        <h2>You have <span v-html="yrText"></span> YooArium</h2>
        <h2>
            Arin is level <span v-html="ArinLevel"></span>, which boosts YooArium gain by x<span v-html="ArinYooAriumEff"></span>
            and makes autobuyers x<span v-html="ArinAutoEff"></span> faster
        </h2>
        <!-- Display the button for upgrading Arin -->
        <button @click="upgradeArin" :disabled="!canUpgradeArin" :class="{ disabled: !canUpgradeArin }">
            Upgrade Arin (Cost: {{ ArinUpgradeCost }} YooArium)
        </button>

        <div v-for="(autobuyer, index) in unlockedAutobuyers" :key="index">
            <Autobuyer :autobuyer="autobuyer" :playerAutobuyer="playerAutobuyers(autobuyer.layer, autobuyer.name)" />
        </div>
    </div>
</template>

<script>
import Autobuyer from '@/components/comps/Autobuyer.vue'
import { autobuyers, getArinCost, getArinEffect } from '@/incremental/automation';

export default {
    components: {
        Autobuyer
    },
    computed: {
        ArinYooAriumEff() {
            return colorText("h3", "#046dAA", format(getArinEffect()[0]));
        },
        ArinAutoEff() {
            return colorText("h3", "#046dAA", format(getArinEffect()[1]));
        },
        ArinUpgradeCost() {
            return format(getArinCost());
        },
        ArinLevel() {
            return colorText("h3", "#046dAA", formatWhole(player.Arin));
        },
        canUpgradeArin() {
            return player.YooAmatter.YooArium.gte(getArinCost());
        },
        yrText() {
            return colorText("h3", "#bcc70f", format(player.YooAmatter.YooArium));
        },
        unlockedAutobuyers() {
            let unlockedAutobuyersList = [];
            for (const layer in autobuyers) {
                for (const name in autobuyers[layer]) {
                    const autobuyer = autobuyers[layer][name];
                    if (autobuyer.unlocked()) {
                        unlockedAutobuyersList.push({ layer, name, autobuyer });
                    }
                }
            }
            return unlockedAutobuyersList;
        }
    },
    methods: {
        upgradeArin() {
            if (this.canUpgradeArin) {
                player.YooAmatter.YooArium = player.YooAmatter.YooArium.sub(getArinCost());
                player.Arin = player.Arin.add(1);
            }
        },
        playerAutobuyers(layer, id) {
            return player.autobuyers[layer][id];
        }
    }
};
</script>

<style scoped>
.center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

button.disabled {
    background: linear-gradient(#ff5757, #c51313);
    cursor: not-allowed;
}

h2 {
    margin: 10px 0;
}

button {
    margin: 20px 0;
}
</style>
