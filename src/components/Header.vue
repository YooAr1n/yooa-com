<template>
  <div class="header">
    <h1>{{ msg }}</h1>
    <p class="points">You have <span v-html="pointsText"></span> YooA Points<br>
    ({{ ppsText }}/s)<br>
    Current Endgame: <span v-html="endgameText"></span> YooAmatter
    </p>
  </div>
</template>

<script>
import { getYooAGain } from '@/incremental/incremental.js';

export default {
  name: 'Header',
  data() {
    return {
      points: new Decimal(0),
      pointsPerSecond: new Decimal(0)
    }
  },
  computed: {
    pointsText() {
      return colorText("h3", "#d17be2", format(this.points));
    },
    ppsText() {
      return format(this.pointsPerSecond);
    },
    endgameText() {
      return colorText("h3", "#bcc70f", format("9.17e1995"))
    }
  },
  methods: {
    update() {
      console.log(format(this.points))
      this.points = player.YooAPoints
      this.pointsPerSecond = getYooAGain()
    },
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
