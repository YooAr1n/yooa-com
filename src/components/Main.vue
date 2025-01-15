<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="{ active: currentTab === 'Main-main' }" @click="changeTab('Main-main')">
        Main
      </button>
      <button :class="{ active: currentTab === 'Main-upgrade' }" @click="changeTab('Main-upgrade')">
        Upgrades
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="currentTab === 'Main-main'" class="tab-content">
      <!-- Main tab content goes here -->
      <h2>Solve math problems to get YooA Points! (+{{ YooAGain }}/solve)</h2>
      <h3>You have solved {{ solved }} math problems. (+{{ problemGain }}/solve)</h3>
      <MathProblem ref="MainMath"></MathProblem>
      <!-- Loop through unlocked dimensions -->
      <br>
      <h3 v-html="dimMultDisp"></h3><br>
      <h3 v-html="dim3MultDisp" v-if="unlockedDim3"></h3><br>
      <button v-if="maxUnlocked" class="max" @click="maxAll">Max All YooA Lines and YooA Planes (M)</button>
      <div v-for="(dimension, index) in unlockedDimensions" :key="index">
        <Dimension :dimension="dimension" :allDimensions="allDimensions" />
      </div>
    </div>

    <div v-if="currentTab === 'Main-upgrade'" class="tab-content">
      <button v-if="maxUnlocked" class="max" @click="maxAllUpgrades">Max All YooA Upgrades</button>
      <UpgradeGrid :layerName="'YooA'" />
    </div>
  </div>
</template>

<script>
import UpgradeGrid from './comps/UpgradeGrid.vue';  // Import the new UpgradeGrid component
import MathProblem from './comps/MathProblem.vue';
import Dimension from './comps/Dimension.vue';
import { player, getYooAGain, hasAchievement, maxAllDimensions } from '@/incremental/incremental.js';    // Import the player object from incremental.js
import { getDimMultPerLvl } from '@/incremental/dimensions';
import { buyMaxUpgrade, gameLayers} from '@/incremental/main'

export default {
  name: 'Main',
  data() {
    return {
      player, // Reactive player object
    };
  },
  computed: {
    // Bind player.tab to a computed property for better reactivity
    currentTab() {
      return this.player.tab;
    },
    YooAGain() {
      return format(getYooAGain());
    },
    solved() {
      return formatWhole(player.math.YooA.solved)
    },
    problemGain() {
      return format(gameLayers.YooA.problemGain())
    },
    allDimensions() {
      return player.dimensions.YooA;  // Assuming YooA is where all dimensions are stored
    },
    unlockedDimensions() {
      // Filter to return only unlocked dimensions
      return player.dimensions.YooA.filter(dimension => dimension.unlocked);
    },
    unlockedUpgrades() {
      // Filter to return only unlocked dimensions
      return gameLayers.YooA.upgrades;
    },
    dimMultDisp() {
      return "Dimension 1-2 Multiplier per level: x" + format(getDimMultPerLvl(1), 3)
    },
    dim3MultDisp() {
      return "Dimension 3+ Multiplier per level: x" + format(getDimMultPerLvl(3), 3)
    },
    unlockedDim3() {
      return hasAchievement(18)
    },
    maxUnlocked() {
      return hasAchievement(27)
    }
  },
  components: {
    UpgradeGrid,
    MathProblem,
    Dimension
  },
  methods: {
    changeTab(tabName) {
      player.tab = tabName; // Change the player tab directly
      player.subtab = this.player.tab.split('-')[1]
    },
    maxAll() {
      // Loop through all dimensions and max out only tier 1 and tier 2
      maxAllDimensions("YooA")
    },
    maxAllUpgrades() {
      // Loop through all upgrades and max out only unlocked upgrades
      Object.entries(this.unlockedUpgrades).forEach(([key, upgrade]) => {
        if (upgrade.title) buyMaxUpgrade("YooA", key)
      });
    },
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
  background-color: #d17be2;
  color: #b9e5ff;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
}

.tabs button.active {
  background-color: #b9e5ff;
  color: #d17be2;
}

.tab-content {
  width: 100%;
}

button.max {
  padding: 8px 16px;
  background-color: #d17be2;
  color: #b9e5ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.max:hover {
  background-color: #b86cc3;
}
</style>
