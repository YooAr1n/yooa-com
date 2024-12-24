<template>
  <div class="header">
    <span style="font-size: 30px; cursor: pointer; position: absolute; left: 10px;" @click="openNav()">☰</span>
    <h1>{{ msg }}</h1>
    <p class="points">You have <span v-html="pointsText"></span> YooA Points<br>
      <span v-if="ppsText">({{ ppsText }}/s)<br></span>
      Current Endgame: <span v-html="endgameText"></span>
    </p>
  </div>
</template>

<script>
import { player } from '@/incremental/incremental.js'
import { getYooAPerSecond } from '@/incremental/incremental.js'
import { hasUpgrade } from '@/incremental/main.js';

export default {
  name: 'Header',
  computed: {
    pointsText() {
      return colorText("h3", "#d17be2", format(player.YooAPoints));
    },
    ppsText() {
      if (!hasUpgrade("YooA", 21)) return
      let pps = getYooAPerSecond()
      return format(pps);
    },
    endgameText() {
      return colorText("h3", "#d17be2", format(1e12)) + " YooA Points"//colorText("h3", "#bcc70f", format("9.17e1995")) + " YooAmatter"
    }
  },
  methods: {
    openNav() {
      let nav = document.getElementById("mySidenav")
      nav.style.width = "250px";
    }
  },
  props: {
    msg: String,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p.points {
  font-size: 20pt;
}
</style>
