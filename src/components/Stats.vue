<template>
  <div class="tabs-container">
    <div class="tabs">
      <button :class="{ active: currentTab === 'main' }" @click="changeTab('Stats', 'main')">
        Game Stats
      </button>
      <button :class="{ active: currentTab === 'last-prestiges' }" @click="changeTab('Stats', 'last-prestiges')">
        Last Prestiges
      </button>
    </div>

    <div v-if="currentTab === 'main'" class="gamestats">
      <h1>Game Statistics</h1>
      <!-- General Stats Section -->
      <SectionStats title="General Stats" :stats="[
        { label: 'Points Scale', value: pointsScale }
      ]" :isUnlocked="true" />

      <!-- YooA Stats Section -->
      <SectionStats :title="YooAText + ' Stats'" :isUnlocked="true" :layer="'YooA'" />

      <!-- YooAmatter Stats Section -->
      <SectionStats v-if="unlocked('YooAmatter')" :title="YooAmatterText + ' Stats'" :stats="[
        YooAriumUnlocked ? { label: 'Total YooArium', value: totalYR } : null,
        sparksUnlocked ? { label: 'Total YooAmatter Sparks', value: totalYS } : null,
      ].filter(item => item)" :isUnlocked="true" :layer="'YooAmatter'" />

      <!-- YooAity Stats Section -->
      <SectionStats v-if="unlocked('YooAity')" :title="YooAityText + ' Stats'" :stats="[
        { label: 'Total Shi-ah Embers', value: totalSE },
        YooChroniumUnlocked ? { label: 'Total YooChronium', value: totalYC } : null,
      ].filter(item => item)" :isUnlocked="true" :layer="'YooAity'" />
    </div>

    <div v-if="currentTab === 'last-prestiges'" class="gamestats">
      <h1>Last Prestiges</h1>
      <LastPrestigeStats />
    </div>
  </div>
</template>

<script>
import SectionStats from "./comps/SectionStats.vue";
import { gameLayers } from "@/incremental/layersData";
import { player } from "@/incremental/incremental.js";
import { hasUpgrade, hasMilestone } from "@/incremental/mainFuncs";
import LastPrestigeStats from "./comps/LastPrestigeStats.vue";

export default {
  name: "Stats",
  components: {
    SectionStats,
    LastPrestigeStats
  },
  data() {
    return {
      subtab: "main",
      totalYR: "",
      totalYS: "",
      totalSE: "",
      totalYC: "",
      pointsScale: "",
      YooAriumUnlocked: false,
      sparksUnlocked: false,
      YooChroniumUnlocked: false,
    };
  },
  computed: {
    currentTab() {
      return this.subtab;
    },
    YooAText() {
      return colorText("span", "#d17be2", "YooA");
    },
    YooAmatterText() {
      return colorText("span", gameLayers.YooAmatter.color, "YooAmatter");
    },
    YooAityText() {
      return colorText("span", gameLayers.YooAity.color, "YooAity");
    },
  },
  methods: {
    changeTab(tabName, subtab) {
      // One assignment to reactive data
      player.tab = tabName;
      player.subtabs[tabName] = subtab;
    },
    unlocked(layer) {
      return gameLayers[layer].unlocked();
    },
    pointsText(layer) {
      if (!layer) return format(player.stats.General.totalPoints);
      return format(player.stats[layer].totalAmount);
    },
    timeText(layer) {
      if (!layer) return formatTime(player.stats.General.totalTime);
      return formatTime(player.stats[layer].time);
    },
    solvedText(layer) {
      if (!layer) return formatWhole(player.stats.General.totalSolved);
      return formatWhole(player.math[layer].solved);
    },
    resetsText(layer) {
      return formatWhole(player.stats[layer].resets);
    },
    update() {
      this.subtab = player.subtabs["Stats"]
      this.totalYR = format(player.stats.YooAmatter.totalYooArium);
      this.totalYS = format(player.stats.YooAmatter.totalSparks);
      this.totalSE = format(player.stats.YooAity.totalEmbers);
      this.totalYC = format(player.stats.YooAity.totalYooChronium);
      this.pointsScale = scale(player.YooAPoints);
      this.YooAriumUnlocked = hasUpgrade("YooAmatter", 23);
      this.sparksUnlocked = hasUpgrade("YooAmatter", 44);
      this.YooChroniumUnlocked = hasMilestone("YooAity", 12);
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
.gamestats {
  padding: 0rem 1rem;
  text-align: center;
  color: #fff;
  margin: 0 auto;
}

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
  background-color: #f2b7f5;
  color: #4b004d;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tabs button.active {
  background-color: #4b004d;
  color: #f2b7f5;
}
</style>
