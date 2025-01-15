<template>
  <div class="gamestats">
    <h1>Game Statistics</h1>

    <section>
      <h2>General Stats</h2>
      <ul>
        <li>Total YooA Points: {{ pointsText }}</li>
        <li>Total Time Played: {{ timeText }}</li>
        <li>Total Math Problems Solved: {{ totalSolved }}</li>
      </ul>
    </section>

    <section>
      <h2><span v-html="YooAText"></span> Stats</h2>
      <ul>
        <li>Math Problems Solved: {{ YooASolved }}</li>
      </ul>
    </section>
    <section v-if="unlocked('YooAmatter')">
      <h2><span v-html="YooAmatterText"></span> Stats</h2>
      <ul>
        <li>Total YooAmatter: {{ totalYM }}</li>
      </ul>
    </section>
  </div>
</template>

<script>
import { player, getStartStats } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/main";

export default {
  name: "Stats",
  data() {
    return {
      stats: getStartStats(),
    };
  },
  computed: {
    pointsText() {
      return format(player.stats.General.totalPoints);
    },
    timeText() {
      return formatTime(player.stats.General.totalTime);
    },
    totalSolved() {
      return formatWhole(player.stats.General.totalSolved)
    },
    YooASolved() {
      return formatWhole(player.stats.YooA.solved)
    },
    totalYM() {
      return formatWhole(player.stats.YooAmatter.totalAmount)
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