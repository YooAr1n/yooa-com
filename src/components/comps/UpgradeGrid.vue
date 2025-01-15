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
    // Calculate the number of rows based on upgrades data
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
/* Parent container (scrollable) */
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between rows */
  padding: 16px;
  align-items: center;
  justify-content: center;
  height: 100%; /* Ensure it takes up the full container height */
  overflow: auto; /* Enable scrolling if content overflows */
}

/* Ensure rows are properly displayed */
.grid-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap; /* Allow wrapping for responsiveness */
  border-radius: 10px;
}

/* Grid item styling */
.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 250px;  /* Prevent shrinking below this width */
  max-width: 250px;  /* Prevent stretching beyond 250px */
  height: 250px;     /* Fixed height */
}
</style>

