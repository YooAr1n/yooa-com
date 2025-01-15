<template>
  <div class="upgrade" :class="{ disabled: !canAfford, maxed: isMaxed, purchased: purchaseAnimation }" v-if="upgrade"
    @click="buy" :style="upgradeStyle">
    <h2>{{ upgrade.title }}</h2>
    <p>
      {{ upgrade.description() }}
    </p>
    <p>
      Cost: {{ formatCost(typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost) }} {{ upgrade.costCurrency
      }}
      <br />
      {{ lvlDisplay }}
    </p>
    <p v-if="upgrade.effectDisplay">Effect: {{ upgrade.effectDisplay() }}</p>
  </div>
</template>

<script>
import Decimal from "@/incremental/break_eternity.js";
import { player } from "@/incremental/incremental.js";
import { gameLayers, canAffordUpgrade, buyUpgrade } from "@/incremental/main.js";

export default {
  name: "Upgrade",
  props: {
    layerName: {
      type: String,
      required: true
    },
    upgradeId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      purchaseAnimation: false, // Track whether the animation should play
    };
  },
  computed: {
    upgrade() {
      const layer = gameLayers[this.layerName];
      return layer ? layer.upgrades[this.upgradeId] : null;
    },
    canAfford() {
      return canAffordUpgrade(this.layerName, this.upgradeId);
    },
    playerLevel() {
      const level = player.upgrades[this.layerName]?.[this.upgradeId] || 0;
      return new Decimal(level);
    },
    maxLevel() {
      return typeof this.upgrade.maxLvl === 'function' ? this.upgrade.maxLvl() : this.upgrade.maxLvl
    },
    isMaxed() {
      return this.maxLevel && this.playerLevel.gte(this.maxLevel);
    },
    lvlDisplay() {
      let dis = "Level: " + formatWhole(this.playerLevel);
      if (this.maxLevel) dis += "/" + formatWhole(this.maxLevel);
      if (this.isMaxed) dis += " (MAXED)";
      return dis;
    },
    // Dynamic style based on the layer name
    upgradeStyle() {
      let backgroundColor;
      if (this.layerName === 'YooA') {
        backgroundColor = '#d17be2'; // For the YooA layer
      } else if (this.layerName === 'YooAmatter') {
        backgroundColor = '#bcc70f'; // For the YooAmatter layer
      } else {
        backgroundColor = '#d17be2'; // Default color for other layers
      }
      return {
        backgroundColor: backgroundColor,
      };
    }
  },
  methods: {
    buy() {
      if (this.canAfford) {
        buyUpgrade(this.layerName, this.upgradeId);

        // Trigger animation
        this.purchaseAnimation = true;

        // Reset animation after it finishes
        setTimeout(() => {
          this.purchaseAnimation = false;
        }, 200);
      }
    },
    formatCost(cost) {
      return cost instanceof Decimal ? format(cost) : cost.toString();
    }
  }
};
</script>

<style scoped>
/* Keyframes for purchase animation */
@keyframes upgradePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 1);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
}

/* Base upgrade style */
div.upgrade {
  width: 100%;
  height: 100%;
  font-size: 10pt;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Hover effect for upgrades */
div.upgrade:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

/* Disabled upgrade style */
div.upgrade.disabled {
  background: linear-gradient(#ff5757, #c51313);
  cursor: not-allowed;
}

/* Maxed upgrade style */
div.upgrade.maxed {
  background: linear-gradient(to bottom, #ffd700, #ffbf00);
  color: #4b2905;
  font-weight: bold;
  box-shadow: 0 0 10px #ffbf00;
  cursor: default;
}

/* Purchased animation style */
div.upgrade.purchased {
  animation: upgradePulse 0.2s ease-out;
}

div.upgrade h2 {
  margin: 10px 0;
}

div.upgrade p {
  margin: 6px 0;
}
</style>
