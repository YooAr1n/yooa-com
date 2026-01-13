<template>
  <div class="last-prestiges-stats">
    <div class="mode-toggle" role="toolbar" aria-label="Toggle rate mode">
      <button :class="{ active: rateMode === 'currency' }" @click="setRateMode('currency')">
        Currency rate
      </button>
      <button :class="{ active: rateMode === 'prestige' }" @click="setRateMode('prestige')">
        Prestige rate
      </button>
    </div>

    <div v-for="layer in layers()" :key="layer" class="layer-section">
      <h2 v-html="getLayerText(layer) + ' Last 10 ' + getPrestigeName(layer)"></h2>
      <table class="prestige-table">
        <thead>
          <tr>
            <th style="width: 2%;">#</th>
            <th style="width: 16%;">Time</th>
            <th style="width: 30%;">Resource Gain</th>
            <th style="width: 22%;">Reset Gain</th>
            <th style="width: 30%;">{{ rateMode === 'currency' ? 'Resource Rate' : 'Prestige Rate' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in lastPrestiges[layer]" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ record ? formatTime(record.resetTime) : '—' }}</td>
            <!-- record.amtGain for currency mode -->
            <td>{{ record ? formatAmtGain(layer, record.amtGain) : '—' }}</td>
            <td>{{ record ? formatResetsGain(layer, record.resetsGain) : '—' }}</td>
            <td>
              <span v-if="record && validRecordTime(record.resetTime)">
                {{ formatGainRate(layer, record, record.resetTime) }}
              </span>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { gameLayers } from "@/incremental/layersData";
import { player } from "@/incremental/incremental.js";

export default {
  name: "LastPrestigeStats",
  data() {
    return {
      lastPrestiges: {},
      // 'currency' shows layer.currency per-second rate; 'prestige' shows actionsCurrency per-second rate
      rateMode: "currency"
    };
  },
  methods: {
    update() {
      this.lastPrestiges = player.stats.last_prestiges || {};
      // small reactive nudge if needed
      this.$forceUpdate();
    },
    layers() {
      return Object.keys(gameLayers).filter((l) => {
        const unlocked = typeof gameLayers[l].unlocked === "function"
          ? gameLayers[l].unlocked()
          : gameLayers[l].unlocked;
        return unlocked && Array.isArray(this.lastPrestiges[l]);
      });
    },
    getLayerText(layer) {
      return colorText(
        "span",
        gameLayers[layer].color,
        gameLayers[layer].name || layer
      );
    },
    getPrestigeName(layer) {
      return gameLayers[layer].actionsCurrency;
    },
    formatAmtGain(layer, val) {
      // val can be Decimal/string/number — handle gracefully
      if (val == null) return "—";
      return format(val) + " " + (gameLayers[layer].currency || "");
    },
    formatResetsGain(layer, val) {
      if (val == null) return "—";
      return format(val) + " " + (gameLayers[layer].actionsCurrency || "");
    },
    formatTime(val) {
      return formatTime(val);
    },
    validRecordTime(t) {
      try {
        return new Decimal(t).gt(0);
      } catch (e) {
        return false;
      }
    },
    /**
     * formatGainRate(layer, record, resetTime)
     * - rateMode === 'currency' -> uses record.amtGain and gameLayers[layer].currency
     * - rateMode === 'prestige' -> uses record.resetsGain and gameLayers[layer].actionsCurrency
     */
    formatGainRate(layer, record, time) {
      if (!record) return "—";
      const t = new Decimal(time || 0);
      if (t.lte(0)) return "—";

      const isPrestige = this.rateMode === "prestige";
      const rawGain = isPrestige ? record.resetsGain : record.amtGain;

      // fallback if rawGain null/undefined
      if (rawGain == null) return "—";

      const gainPerSecond = new Decimal(rawGain).div(t);

      // unit label
      const unit = isPrestige ? (gameLayers[layer].actionsCurrency || "") : (gameLayers[layer].currency || "");

      // scaling thresholds (choose display unit by speed)
      const scales = [
        { max: new Decimal(1).div(3600), multiplier: 86400, suffix: "/day" },
        { max: new Decimal(1).div(60), multiplier: 3600, suffix: "/hr" },
        { max: new Decimal(1), multiplier: 60, suffix: "/min" },
        { max: null, multiplier: 1, suffix: "/s" },
      ];

      const scale = scales.find(s => s.max === null || gainPerSecond.lt(s.max));
      const rate = gainPerSecond.mul(scale.multiplier);

      return `${format(rate)} ${unit}${scale.suffix}`;
    },

    setRateMode(mode) {
      if (mode === "currency" || mode === "prestige") this.rateMode = mode;
    }
  },
  mounted() {
    window.addEventListener("GAME_EVENT.PRESTIGE_UPDATE", this.update);
    // also listen to generic game updates if you want automatic refreshes
    window.addEventListener("GAME_EVENT.UPDATE", this.update);
    this.update();
  },
  beforeUnmount() {
    window.removeEventListener("GAME_EVENT.PRESTIGE_UPDATE", this.update);
    window.removeEventListener("GAME_EVENT.UPDATE", this.update);
  }
};
</script>

<style scoped>
.last-prestiges-stats {
  margin-top: -2rem;
  padding: 1rem;
  color: #fff;
}

.mode-toggle {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-toggle button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.mode-toggle button.active {
  background: linear-gradient(90deg, #b9e5ff, #ffd6f0);
  color: #230085;
  border-color: transparent;
}

.layer-section {
  margin-bottom: 1.5rem;
}

.prestige-table {
  width: 90%;
  margin: 0 auto;
  border-collapse: collapse;
  margin-top: 0.5rem;
  table-layout: fixed;
}

.prestige-table th,
.prestige-table td {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  text-align: center;
  word-break: break-word;
}

.prestige-table th {
  font-weight: bold;
}
</style>
