<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="{ active: currentTab === 'main' }" @click="changeTab('YooAmatter', 'main')">
        Main
      </button>
      <button :class="{ active: currentTab === 'upgrade' }" @click="changeTab('YooAmatter', 'upgrade')">
        Upgrades
      </button>
      <button v-if="challengeUnlocked" :class="{ active: currentTab === 'challenge' }"
        @click="changeTab('YooAmatter', 'challenge')">
        Challenges
      </button>
      <button v-if="sparkUpgUnlocked" :class="{ active: currentTab === 'spark-upgrade' }"
        @click="changeTab('YooAmatter', 'spark-upgrade')">
        Spark Upgrades
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="currentTab === 'main'" class="tab-content">
      <!-- Main tab content goes here -->
      <div class="efftext">
        You have <span v-html="ymText"></span> YooAmatter, which boosts YooA Point gain by x<span
          v-html="ymEffect"></span>
        <br><span>Effect Formula: (x + 1)<sup>{{ effectExponent }}</sup></span>
      </div>
      <PrestigeButton layerName="YooAmatter" @prestige="handlePrestige"></PrestigeButton>
      <br>
      <div v-if="mathUnlocked">
        <div class="efftext">
          You have <span v-html="yrText"></span> YooArium (+{{ YooAriumGain }}/solve), which boosts YooAmatter gain by
          x<span v-html="yrEffect(0)"></span> and YooA math problem gain by x<span v-html="yrEffect(1)"></span>
          <br><span>Effect Formula: x + 1 to YooAmatter, (√x / 10) + 1 to YooA math problems</span>
        </div>
        <br>
        <h3>You have solved {{ solved }} math problems. (+{{ problemGain }}/solve)</h3>
        <MathProblem layerName="YooAmatter" refName="YooAmatterMath"></MathProblem>
      </div><br>
      <div v-if="unlockedDimensions.length > 0">
        <div class="efftext">
          You have <span v-html="ysText"></span> YooAmatter Sparks, which boosts YooArium gain by x<span
            v-html="ysEffect(0)"></span> and raises YooA Point gain to <span v-html="ysEffect(1)"></span>
          <br><span>Effect Formula: (x + 1)<sup>0.75</sup> to YooArium, ^√(log<sub>10</sub>(x + 1)) / 100 + 1 to YooA
            Points</span>
        </div>
        <br>
        <h3 v-html="dimMultDisp"></h3><br>
      </div>
      <div v-for="dimension in unlockedDimensions" :key="dimension.id">
        <Dimension :dimension="dimension" :allDimensions="allDimensions" />
      </div>
    </div>

    <div v-if="currentTab === 'upgrade'" class="tab-content">
      <UpgradeGrid :layerName="'YooAmatter'" />
    </div>

    <div v-if="currentTab === 'challenge'" class="tab-content">
      <h2>Completing any challenge unlocks Arin.</h2>
      <Challenge layerName="YooAmatter" challengeId="1" />
      <Challenge layerName="YooAmatter" challengeId="2" />
      <Challenge layerName="YooAmatter" challengeId="3" />
      <Challenge layerName="YooAmatter" challengeId="4" />
    </div>

    <div v-if="currentTab === 'spark-upgrade'" class="tab-content">
      <div class="efftext">
        You have <span v-html="ysText"></span> YooAmatter Sparks <span>{{ ysGain }}</span>
      </div>
      <UpgradeGrid :layerName="'sparks'" />
    </div>
  </div>
</template>

<script>
import { gameLayers, hasUpgrade, prestige } from '@/incremental/main';
import UpgradeGrid from './comps/UpgradeGrid.vue';  // Import the new UpgradeGrid component
import { player } from '@/incremental/incremental.js';    // Import the player object from incremental.js
import PrestigeButton from './comps/PrestigeButton.vue';
import MathProblem from './comps/MathProblem.vue';
import Challenge from './comps/Challenge.vue';
import Dimension from './comps/Dimension.vue';
import { getDimMultPerLvl } from '@/incremental/dimensions';

export default {
  name: 'YooAmatter',
  data() {
    return {
      player, // Reactive player object
    };
  },
  computed: {
    // Bind player.tab to a computed property for better reactivity
    currentTab() {
      return this.player.subtabs["YooAmatter"];
    },
    solved() {
      return formatWhole(player.math.YooAmatter.solved)
    },
    problemGain() {
      return format(gameLayers.YooAmatter.problemGain())
    },
    YooAriumGain() {
      return format(gameLayers.YooAmatter.getYooAriumGain());
    },
    ysGain() {
      return player.gain.YooAmatter.sparks
    },
    yrText() {
      return colorText("h3", "#bcc70f", format(player.YooAmatter.YooArium));
    },
    ysText() {
      return colorText("h3", "#4caf50", format(player.YooAmatter.sparks));
    },
    ymText() {
      return colorText("h3", "#bcc70f", formatWhole(player.YooAmatter.amount));
    },
    ymEffect() {
      return colorText("h3", "#bcc70f", format(gameLayers.YooAmatter.effect()));
    },
    effectExponent() {
      return format(gameLayers.YooAmatter.effectExp())
    },
    mathUnlocked() {
      return hasUpgrade("YooAmatter", 23)
    },
    challengeUnlocked() {
      return hasUpgrade("YooAmatter", 24)
    },
    sparkUpgUnlocked() {
      return hasUpgrade("YooAmatter", 54)
    },
    allDimensions() {
      return player.dimensions.YooAmatter;
    },
    unlockedDimensions() {
      // Cache unlocked dimensions to reduce re-evaluation
      return this.allDimensions.filter(dimension => dimension.unlocked);
    },
    dimMultDisp() {
      return `Formation Multiplier per level: x${format(
        getDimMultPerLvl("YooAmatter", 1),
        3
      )}`;
    },
  },
  components: {
    UpgradeGrid,
    PrestigeButton,
    MathProblem,
    Challenge,
    Dimension
  },
  methods: {
    changeTab(tabName, subtab) {
      player.tab = tabName; // Change the player tab directly
      player.subtabs[tabName] = subtab
    },
    yrEffect(n) {
      return colorText("h3", "#bcc70f", format(gameLayers.YooAmatter.YooAriumEffect()[n]))
    },
    ysEffect(n) {
      let eff = gameLayers.YooAmatter.YooAmatterSparkEffect()[n]
      let dis = colorText("h3", "#4caf50", format(eff))
      if (n == 0 && eff.gte(1e140)) dis += " (softcapped)"
      return dis
    },
    handlePrestige() {
      prestige("YooAmatter")
    }
  }
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Centers the tab container horizontally */
}

.tabs {
  display: flex;
  gap: 16px;
  justify-content: center;
  /* Centers the buttons horizontally */
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #bcc70f;
  color: #313500;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
}

.tabs button.active {
  background-color: #313500;
  color: #bcc70f;
}

.tab-content {
  width: 100%;
}

.efftext {
  font-size: 16pt;
}
</style>
