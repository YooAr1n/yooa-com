<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="{ active: isCurrentTab('main') }" @click="changeTab('Main', 'main')">Main</button>
      <button :class="{ active: isCurrentTab('upgrade') }" @click="changeTab('Main', 'upgrade')">Upgrades</button>
    </div>

    <!-- Tab Content -->
    <div v-if="isCurrentTab('main')" class="tab-content">
      <h2>Solve math problems to get YooA Points! (+{{ YooAGain }}/solve)</h2>
      <h3>You have solved {{ solved }} math problems. (+{{ problemGain }}/solve)</h3>
      <MathProblem layerName="YooA" refName="MainMath" />
      <br />
      <h3>Dimension costs increase faster at Level 10,000</h3><br>
      <h3 v-html="dimMultDisp"></h3><br>
      <h3 v-html="dim3MultDisp" v-if="unlockedDim3"></h3><br>
      <button v-if="maxUnlocked" class="max" @click="maxAll">Max All YooA Lines and YooA Planes (M)</button>
      <div v-for="dimension in unlockedDimensions" :key="dimension.id">
        <Dimension :dimension="dimension" :allDimensions="allDimensions" />
      </div>
    </div>

    <div v-if="isCurrentTab('upgrade')" class="tab-content">
      <button v-if="maxUnlocked" class="max" @click="maxAllUpgrades">Max All YooA Upgrades</button>
      <UpgradeGrid layerName="YooA" />
    </div>
  </div>
</template>

<script>
import UpgradeGrid from './comps/UpgradeGrid.vue';
import MathProblem from './comps/MathProblem.vue';
import Dimension from './comps/Dimension.vue';
import {
  player,
  getYooAGain,
  hasAchievement,
  maxAllDimensions,
} from '@/incremental/incremental.js';
import { buyMaxUpgrade, gameLayers } from '@/incremental/main';
import { getDimMultPerLvl } from '@/incremental/dimensions';

export function maxAllUpgrades() {
  Object.entries(gameLayers.YooA.upgrades).forEach(([key, upgrade]) => {
    if (upgrade.title) buyMaxUpgrade('YooA', key);
  });
}

export default {
  name: 'Main',
  data() {
    return {
      player, // Reactive player object
    };
  },
  computed: {
    YooAGain() {
      return format(getYooAGain());
    },
    solved() {
      return formatWhole(player.math.YooA.solved);
    },
    problemGain() {
      return format(gameLayers.YooA.problemGain());
    },
    allDimensions() {
      return player.dimensions.YooA;
    },
    unlockedDimensions() {
      // Cache unlocked dimensions to reduce re-evaluation
      return this.allDimensions.filter(dimension => dimension.unlocked);
    },
    dimMultDisp() {
      return `Dimension 1-2 Multiplier per level: x${format(
        getDimMultPerLvl("YooA", 1),
        3
      )}`;
    },
    dim3MultDisp() {
      return `Dimension 3+ Multiplier per level: x${format(
        getDimMultPerLvl("YooA", 3),
        3
      )}`;
    },
    unlockedDim3() {
      return hasAchievement(18);
    },
    maxUnlocked() {
      return hasAchievement(27);
    },
  },
  methods: {
    changeTab(tabName, subtab) {
      this.player.tab = tabName;
      this.player.subtabs[tabName] = subtab;
    },
    maxAll() {
      maxAllDimensions('YooA');
    },
    maxAllUpgrades() {
      maxAllUpgrades();
    },
    isCurrentTab(tab) {
      return this.player.subtabs['Main'] === tab;
    },
  },
  components: {
    UpgradeGrid,
    MathProblem,
    Dimension,
  },
};
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 16px;
  justify-content: center;
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
