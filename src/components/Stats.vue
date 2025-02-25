<template>
  <div class="gamestats">
    <h1>Game Statistics</h1>

    <section>
      <h2>General Stats</h2>
      <ul>
        <li>Total YooA Points: {{ pointsText() }}</li>
        <li>Total Time Played: {{ timeText() }}</li>
        <li>Total Math Problems Solved: {{ solvedText() }}</li>
        <li>{{ pointsScale }}</li>
      </ul>
    </section>

    <section>
      <h2><span v-html="YooAText"></span> Stats</h2>
      <ul>
        <li>Math Problems Solved: {{ solvedText("YooA") }}</li>
      </ul>
    </section>
    <section v-if="unlocked('YooAmatter')">
      <h2><span v-html="YooAmatterText"></span> Stats</h2>
      <ul>
        <li>Total YooAmatter: {{ pointsText("YooAmatter") }}</li>
        <li>Resets: {{ resetsText("YooAmatter") }}</li>
        <li v-if="YooAriumUnlocked">Total YooArium: {{ totalYR }}</li>
        <li v-if="sparksUnlocked">Total YooAmatter Sparks: {{ totalYS }}</li>
        <li>Time: {{ timeText("YooAmatter") }}</li>
        <li>Math Problems Solved: {{ solvedText("YooAmatter") }}</li>
      </ul>
    </section>
  </div>
</template>

<script>
import { player, getStartStats } from "@/incremental/incremental.js";
import { gameLayers, hasUpgrade } from "@/incremental/main";

export default {
  name: "Stats",
  data() {
    return {
      stats: getStartStats(),
    };
  },
  computed: {
    totalYR() {
      return format(player.stats.YooAmatter.totalYooArium)
    },
    totalYS() {
      return format(player.stats.YooAmatter.totalSparks)
    },
    pointsScale() {
      return scale(player.YooAPoints)
    }, 
    YooAriumUnlocked() {
      return hasUpgrade("YooAmatter", 23)
    },
    sparksUnlocked() {
      return hasUpgrade("YooAmatter", 44)
    },
    YooAText() {
      return colorText("span", "#d17be2", "YooA")
    },
    YooAmatterText() {
      return colorText("span", "#bcc70f", "YooAmatter")
    }
  },
  methods: {
    unlocked(layer) {
      return gameLayers[layer].unlocked()
    },
    pointsText(layer) {
      if (!layer) return format(player.stats.General.totalPoints);
      return format(player.stats[layer].totalAmount)
    },
    timeText(layer) {
      if (!layer) return formatTime(player.stats.General.totalTime);
      return formatTime(player.stats[layer].time)
    },
    solvedText(layer) {
      if (!layer) return formatWhole(player.stats.General.totalSolved);
      return formatWhole(player.math[layer].solved)
    },
    resetsText(layer) {
      return formatWhole(player.stats[layer].resets)
    },
  }
};
</script>

<style scoped>
.gamestats {
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  /* Assuming a dark background */
  width: 100%;
  box-sizing: border-box;
  /* Include padding in the width */
  margin: 0 auto;
  /* Center the element horizontally if it's smaller than the container */
}

h1,
h2 {
  margin: 0;
  padding: 0.5rem 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin: 0.5rem 0;
  font-size: 14pt;
}
</style>