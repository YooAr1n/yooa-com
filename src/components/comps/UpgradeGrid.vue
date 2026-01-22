<template>
  <div class="scroll-wrap">
    <div class="grid-container">
      <div
        v-for="(rowObj, idx) in gridRowsWithCols"
        :key="`row-${rowObj.row}-${idx}`"
        class="grid-row"
        :style="rowGridStyle(rowObj.cols.length)"
      >
        <div
          v-for="col in rowObj.cols"
          :key="`u-${rowObj.row}-${col}`"
          class="grid-item"
        >
          <Upgrade :layerName="layerName" :upgradeId="`${rowObj.row}${col}`"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Upgrade from './Upgrade.vue';
import { gameLayers } from '@/incremental/layersData.js';

export default {
  name: 'UpgradeGrid',
  props: {
    layerName: {
      type: String,
      required: true
    }
  },
  components: { Upgrade },
  computed: {
    // Build an array of { row, cols: [validColNumbers...] } skipping empty rows.
    gridRowsWithCols() {
      const layer = gameLayers[this.layerName];
      if (!layer || !layer.upgrades) return [];

      const rows = layer.upgrades.rows || 0;
      const cols = layer.upgrades.cols || 0;

      const out = [];
      for (let r = 1; r <= rows; ++r) {
        const validCols = [];
        for (let c = 1; c <= cols; ++c) {
          if (this._hasUpgradeForGrid(r, c)) validCols.push(c);
        }
        if (validCols.length > 0) out.push({ row: r, cols: validCols });
      }
      return out;
    }
  },
  methods: {
    // internal helper - checks both existence and (logical) unlocked state
    _hasUpgradeForGrid(row, col) {
      const layer = gameLayers[this.layerName];
      if (!layer || !layer.upgrades) return false;
      const upgradeId = `${row}${col}`;
      const def = layer.upgrades[upgradeId];
      if (!def) return false;

      // follow the same unlocked logic as Upgrade.vue:
      try {
        if (typeof def.unlocked === 'function') return !!def.unlocked();
        // if there's an unlocked boolean property, the original component treated
        // undefined as unlocked; it used `!this.upgrade.unlocked` — keep that behavior:
        return def.unlocked === undefined ? true : !def.unlocked;
      } catch (e) {
        // if evaluating unlocked throws, treat as locked to be safe
        console.warn('Error evaluating upgrade unlocked for', upgradeId, e);
        return false;
      }
    },

    // Generate inline style to set grid-template-columns to N columns for this row
    rowGridStyle(visibleColsCount) {
      const cols = Math.max(1, visibleColsCount || 1);
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 250px)`, // fixed width columns
        gap: '16px',
        justifyContent: 'center', // center the whole grid (no stretching)
        alignItems: 'center',
      };
    }
  }
};
</script>

<style scoped>
/* Parent container */
.grid-container {
  display: inline-flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Each row is a CSS grid now; columns are set dynamically inline */
.grid-row {
  border-radius: 10px;
  width: auto; /* let grid shrinkwrap the items */
}

/* Grid item styling */
.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 250px;  /* same as before */
  max-width: 250px;
  height: 250px;
  box-sizing: border-box;
}

.scroll-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

</style>
