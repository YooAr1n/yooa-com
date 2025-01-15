<template>
  <div class="prestige-header" v-if="unlocked">
    <h2>You have <span v-html="amount"></span> YooAmatter</h2>
    <PrestigeButton :layerName="layerName" @prestige="handlePrestige"></PrestigeButton>
  </div>
</template>

<script>
import PrestigeButton from "./PrestigeButton.vue"; // Adjust path if necessary
import { player } from '@/incremental/incremental.js';
import { gameLayers, prestige } from '@/incremental/main'

export default {
  name: "PrestigeHeader",
  props: {
    layerName: {
      type: String,
      required: true
    },
  },
  components: {
    PrestigeButton,
  },
  methods: {
    handlePrestige(layerName) {
      // Handle the prestige event here (e.g., reset progress or adjust stats)
      prestige(layerName)
    },
  },
  computed: {
    // You can add a computed property to update `yooAmatter` dynamically based on game data
    amount() {
      return colorText("span", "#bcc70f", formatWhole(player[this.layerName].amount))
    },
    unlocked() {
      return gameLayers[this.layerName].unlocked()
    }
  },
};
</script>

<style scoped>
.prestige-header {
  text-align: center;
  margin-top: 20px;
}

.prestige-header h2 {
  font-size: 24px;
}
</style>