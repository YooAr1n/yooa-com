<template>
  <div class="prestige-header" v-if="unlocked">
    <h2>You have <span v-html="amount"></span></h2>
    <PrestigeButton ref="btn" :layerName="layerName" @prestige="handlePrestige" />
  </div>
</template>

<script>
import PrestigeButton from "./PrestigeButton.vue";
import { player } from '@/incremental/incremental.js';
import { gameLayers } from "@/incremental/layersData";
import { prestige } from '@/incremental/mainFuncs';

export default {
  name: "PrestigeHeader",
  props: {
    layerName: { type: String, required: true },
  },
  components: { PrestigeButton },
  data() {
    return {
      amount: "",
      unlocked: false,
      amountDec: new Decimal(0), // stable Decimal buffer
      lastFormatted: "", // last displayed formatted string
      lastUnlockedKey: "",
      layerRef: null,
    };
  },
  methods: {
    handlePrestige(layerName) {
      prestige(layerName);
    },

    // update is called every GAME_EVENT.UPDATE
    update() {
      const layer = this.layerRef || gameLayers[this.layerName];
      if (!layer) return;

      const srcAmount = player[this.layerName]?.amount;

      // copy into buffer without allocations
      if (srcAmount && typeof srcAmount.copyFrom === 'function') {
        this.amountDec.copyFrom(srcAmount);
      } else if (srcAmount && typeof srcAmount.toNumber === 'function') {
        this.amountDec.sign = srcAmount.toNumber();
      } else {
        this.amountDec.sign = Number(srcAmount) || 0;
      }

      // compute formatted string
      const formatted = colorText("span", layer.color, formatWhole(this.amountDec)) + " " + layer.currency;

      // update display only if formatting changed (Decimal value may be same)
      if (formatted !== this.lastFormatted) {
        this.lastFormatted = formatted;
        this.amount = formatted;
      }

      // unlocked: cheap boolean change-only writes
      const unlockedNow = Boolean(
        (layer && typeof layer.unlocked === 'function' && layer.unlocked()) ||
        (layer && typeof layer.canReset === 'function' && layer.canReset())
      );
      const unlockedKey = unlockedNow ? '1' : '0';
      if (unlockedKey !== this.lastUnlockedKey) {
        this.lastUnlockedKey = unlockedKey;
        this.unlocked = unlockedNow;
      }
    }
  },
  mounted() {
    this.layerRef = gameLayers[this.layerName] || null;
    this.boundUpdate = this.update.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this.boundUpdate);

    // initial sync
    this.update();
  },
  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
  },
};
</script>

<style scoped>
.prestige-header {
  text-align: center;
  padding: 0px 30px;
}
.prestige-header h2 {
  font-size: 24px;
}
</style>
