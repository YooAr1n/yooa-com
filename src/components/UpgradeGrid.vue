<template>
  <div class="grid-container">
    <!-- Loop through rows -->
    <div v-for="row in gridRows" :key="row" class="grid-row">
      <!-- Loop through columns in each row, only for valid upgrades -->
      <div 
        v-for="col in getValidColumnsForRow(row)" 
        :key="col" 
        class="grid-item"
      >
        <Upgrade :layerName="layerName" :upgradeId="`${row}${col}`"></Upgrade>
      </div>
    </div>
  </div>
</template>

<script>
import Upgrade from './Upgrade.vue';
import { gameLayers } from '@/incremental/main.js';  // Adjust the path as necessary

export default {
  name: 'UpgradeGrid',
  props: {
    layerName: {
      type: String,
      required: true
    }
  },
  computed: {
    gridRows() {
      return Array.from({ length: gameLayers[this.layerName].upgrades.rows }, (_, i) => i + 1); // Row indices for the specific layer
    }
  },
  methods: {
    // Get valid columns for a specific row (based on upgrades availability for the given layer)
    getValidColumnsForRow(row) {
      return Array.from({ length: gameLayers[this.layerName].upgrades.cols }, (_, col) => col + 1)
        .filter(col => this.hasUpgradeForGrid(row, col));
    },
    
    // Check if an upgrade exists for the given row and col in the specified layer
    hasUpgradeForGrid(row, col) {
      const upgradeId = `${row}${col}`;
      return Object.prototype.hasOwnProperty.call(gameLayers[this.layerName].upgrades, upgradeId);
    }
  },
  components: {
    Upgrade
  }
}
</script>

<style scoped>
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between rows */
  padding: 16px;
}

.grid-row {
  display: flex;
  justify-content: center;
  gap: 16px; /* Space between upgrades in a row */
}

.grid-item {
  width: 250px;  /* Fixed width */
  height: 250px; /* Fixed height */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
