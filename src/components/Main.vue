<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button 
        :class="{ active: currentTab === 'Main-main' }" 
        @click="changeTab('Main-main')"
      >
        Main
      </button>
      <button 
        :class="{ active: currentTab === 'Main-upgrade' }" 
        @click="changeTab('Main-upgrade')"
      >
        Upgrades
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="currentTab === 'Main-main'" class="tab-content">
      <!-- Main tab content goes here -->
      <h2>Solve math problems to get YooA Points! (+{{ YooAGain }}/solve)</h2>
      <h3>You have solved {{ solved }} math problems.</h3>
      <MathProblem ref="MainMath"></MathProblem>
      <Dimension :dimension="player.dimensions.YooA[0]" :allDimensions="allDimensions" />
      <Dimension :dimension="player.dimensions.YooA[1]" :allDimensions="allDimensions" />
    </div>

    <div v-if="currentTab === 'Main-upgrade'" class="tab-content">
      <UpgradeGrid :layerName="'YooA'" />
    </div>
    <br><br><br><br>
  </div>
</template>

<script>
import UpgradeGrid from './UpgradeGrid.vue';  // Import the new UpgradeGrid component
import MathProblem from './MathProblem.vue'; 
import Dimension from './Dimension.vue'; 
import { player, getYooAGain } from '@/incremental/incremental.js';    // Import the player object from incremental.js

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
    solved () {
      return formatWhole(player.math.YooA.solved)
    },
    allDimensions() {
      return player.dimensions.YooA;  // Assuming YooA is where all dimensions are stored
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
  }
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers the tab container horizontally */
}

.tabs {
  display: flex;
  gap: 16px;
  justify-content: center; /* Centers the buttons horizontally */
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
</style>
