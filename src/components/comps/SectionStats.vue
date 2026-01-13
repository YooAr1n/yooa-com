<template>
  <section v-if="isUnlocked">
    <h2 v-html="title"></h2>
    <ul>
      <li v-for="(stat, index) in displayStats" :key="index">
        {{ stat.label }}: {{ stat.value }}
      </li>
    </ul>
  </section>
</template>

<script>
import { player } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/layersData";

export default {
  name: "SectionStats",
  props: {
    title: {
      type: String,
      required: true,
    },
    // Optional array of stat objects: { label: string, value: any }
    stats: {
      type: Array,
      default: () => [],
    },
    // If no stats array is passed, use this layer to build default values.
    layer: {
      type: String,
      default: null,
    },
    // Determines whether this section is unlocked.
    isUnlocked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      points: null,
      time: null,
      bestTime: null,
      bestTimeThisReset: null,
      solved: null,
      resets: null,
    };
  },
  computed: {
    // Build default stats based on internal data and merge with any stats passed as prop.
    displayStats() {
      let defaultStats = [];
      if (this.points !== null) {
        let curr = this.layer ? gameLayers[this.layer].currency : 'Points'
        defaultStats.push({ label: 'Total ' + curr, value: this.points });
      }
      if (this.time !== null) {
        defaultStats.push({ label: 'Total Time Played', value: this.time });
      }
      if (this.bestTime !== null) {
        defaultStats.push({ label: 'Fastest ' + gameLayers[this.layer].actionsCurrencySingular, value: this.bestTime });
      }
      if (this.bestTimeThisReset !== null) {
        const nextLayer = gameLayers[this.layer].nextLayer
        defaultStats.push({ label: 'Fastest ' + gameLayers[this.layer].actionsCurrencySingular + " this " + gameLayers[nextLayer].actionsCurrencySingular, value: this.bestTimeThisReset });
      }
      if (this.solved !== null) {
        defaultStats.push({ label: 'Total Math Problems Solved', value: this.solved });
      }
      if (this.resets !== null) {
        defaultStats.push({ label: gameLayers[this.layer].actionsCurrency, value: this.resets });
      }
      // Merge the provided stats with the computed default stats.
      return [...defaultStats, ...this.stats];
    },
  },
  methods: {
    update() {
      if (!this.layer) {
        // Use General stats when no layer is specified.
        this.points = format(player.stats.General.totalPoints);
        this.time = formatTime(player.stats.General.totalTime);
        this.bestTime = null;
        this.bestTimeThisReset = null
        this.solved = formatWhole(player.stats.General.totalSolved);
        this.resets = null;
      } else if (!player.stats[this.layer]) {
        // No stats for the layer, so clear all values.
        this.points = null;
        this.time = null;
        this.bestTime = null;
        this.bestTimeThisReset = null
        this.solved = null;
        this.resets = null;
      } else {
        // For a specific layer.
        this.points = player.stats[this.layer].totalAmount
          ? format(player.stats[this.layer].totalAmount)
          : null;
        this.time = player.stats[this.layer].time
          ? formatTime(player.stats[this.layer].time)
          : null;
        this.bestTime = player.stats[this.layer].bestTime
          ? formatTime(player.stats[this.layer].bestTime)
          : null;
        const nextLayer = gameLayers[this.layer].nextLayer
        const isNextLayerUnlocked = nextLayer && gameLayers[nextLayer].unlocked()
        this.bestTimeThisReset = player.stats[this.layer].bestTimeThisReset && isNextLayerUnlocked
          ? formatTime(player.stats[this.layer].bestTimeThisReset)
          : null;
        this.solved = player.math[this.layer].solved
          ? formatWhole(player.math[this.layer].solved)
          : null;
        this.resets = player.stats[this.layer].resets
          ? formatWhole(player.stats[this.layer].resets)
          : null;
      }
    },
  },
  mounted() {
    window.addEventListener("GAME_EVENT.UPDATE", this.update);
  },
  beforeUnmount() {
    window.removeEventListener("GAME_EVENT.UPDATE", this.update);
  },
};
</script>

<style scoped>
section {
  margin-bottom: 1rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
  font-size: 14pt;
}
</style>
