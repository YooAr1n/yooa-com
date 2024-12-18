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
        <Upgrade :layerName="'YooA'" :upgradeId="`${row}${col}`"></Upgrade>
      </div>
    </div>
  </div>
</template>

<script>
import Upgrade from './Upgrade.vue';
import { start } from '@/incremental/incremental.js';
import { gameLayers } from '@/incremental/main.js';  // Adjust path as needed

export default {
  name: 'Main',
  mounted() {
    start();
  },
  computed: {
    gridRows() {
      return Array.from({ length: gameLayers.YooA.upgrades.rows }, (_, i) => i + 1); // Row indices
    }
  },
  methods: {
    // Get valid columns for a specific row (based on upgrades availability)
    getValidColumnsForRow(row) {
      // Loop through columns and return only those that have an upgrade
      return Array.from({ length: gameLayers.YooA.upgrades.cols }, (_, col) => col + 1)
        .filter(col => this.hasUpgradeForGrid(row, col));
    },
    
    // Check if an upgrade exists for the given row and col
    hasUpgradeForGrid(row, col) {
      // Construct the upgradeId (e.g., "11", "12", "21", etc.)
      const upgradeId = `${row}${col}`;
      // Use Object.prototype.hasOwnProperty.call to safely check if upgrade exists
      return Object.prototype.hasOwnProperty.call(gameLayers.YooA.upgrades, upgradeId);
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
