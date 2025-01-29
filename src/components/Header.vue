<template>
  <div class="header">
    <span style="font-size: 30px; cursor: pointer; position: absolute; left: 10px;" @click="openNav()">☰</span>
    <h1>{{ msg }}</h1>
    <PrestigeHeader layerName="YooAmatter"></PrestigeHeader>
    <p class="points">You have <span v-html="pointsText"></span> YooA Points<br>
      <span v-if="ppsText">{{ ppsText }}<br></span>
      Current Endgame: <span v-html="endgameText"></span>
    </p>
  </div>
</template>

<script>
import { getYooAPerSecond, player } from '@/incremental/incremental.js'
import PrestigeHeader from './comps/PrestigeHeader.vue';

export default {
  name: 'Header',
  computed: {
    pointsText() {
      return colorText("h3", "#d17be2", format(player.YooAPoints));
    },
    ppsText() {
      if (getYooAPerSecond().eq(0)) return
      return player.gain.YooA.points;
    },
    endgameText() {
      return colorText("h3", "#bcc70f", format(1e120/*"9.17e1995"*/)) + " YooAmatter"
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
  },
  components: {
    PrestigeHeader
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p.points {
  font-size: 20pt;
}
</style>
