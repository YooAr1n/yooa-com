<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="{ active: currentTab === 'YooAmatter-main' }" @click="changeTab('YooAmatter-main')">
        Main
      </button>
      <button :class="{ active: currentTab === 'YooAmatter-upgrade' }" @click="changeTab('YooAmatter-upgrade')">
        Upgrades
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="currentTab === 'YooAmatter-main'" class="tab-content">
      <!-- Main tab content goes here -->
      You have <span v-html="ymText"></span> YooAmatter, which boosts YooA Point gain by x<span v-html="ymEffect"></span>
      <br><span>Effect Formula: x + 1</span>
      <PrestigeButton layerName="YooAmatter" @prestige="handlePrestige"></PrestigeButton>
    </div>

    <div v-if="currentTab === 'YooAmatter-upgrade'" class="tab-content">
      <UpgradeGrid :layerName="'YooAmatter'" />
    </div>
  </div>
</template>

<script>
import { gameLayers, prestige } from '@/incremental/main';
import UpgradeGrid from './comps/UpgradeGrid.vue';  // Import the new UpgradeGrid component
import { player } from '@/incremental/incremental.js';    // Import the player object from incremental.js
import PrestigeButton from './comps/PrestigeButton.vue';

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
      return this.player.tab;
    },
    ymText() {
      return colorText("h3", "#bcc70f", formatWhole(player.YooAmatter.amount));
    },
    ymEffect() {
      return colorText("h3", "#bcc70f", format(gameLayers.YooAmatter.effect()));
    },
  },
  components: {
    UpgradeGrid,
    PrestigeButton
  },
  methods: {
    changeTab(tabName) {
      player.tab = tabName; // Change the player tab directly
      player.subtab = this.player.tab.split('-')[1]
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
  font-size: 16pt;
}
</style>
