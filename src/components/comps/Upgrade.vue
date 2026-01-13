<template>
  <div class="upgrade" :class="{ disabled: !canAfford, maxed: isMaxed, purchased: purchaseAnimation }"
    v-if="upgradeExists && isUnlocked" @click="buy" :style="mergedUpgradeStyle">
    <h2 v-html="titleHtml"></h2>
    <p v-html="upgDesc"></p>

    <p>
      Cost: <span v-html="formattedCost"></span> {{ costCurrency }}
      <br />
      {{ lvlDisplay }}
    </p>

    <p v-if="upgradeEffect"><span>Effect: </span><span v-html="upgradeEffect"></span></p>
  </div>
</template>

<script>
import { player } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/layersData";
import { canAffordUpgrade, buyUpgrade } from "@/incremental/mainFuncs.js";

// cheap key builder for Decimal-like values (works with Break-Infinity & Break-Eternity)
// improved: prefer toString() where available to avoid precision loss
function decimalKey(val) {
  if (val == null) return "null";
  if (typeof val === "object") {
    // Break-Eternity representation
    if ("sign" in val && "layer" in val && "mag" in val) return `be:${val.sign}|${val.layer}|${val.mag}`;
    // Break-Infinity representation
    if ("mantissa" in val && "exponent" in val) return `bi:${val.mantissa}|${val.exponent}`;
    // Prefer toString() if it returns something useful (not "[object Object]")
    if (typeof val.toString === "function") {
      try {
        const s = val.toString();
        if (s && !s.startsWith("[object")) return `s:${s}`;
      } catch (e) {
        // fallthrough
      }
    }
    // Fallback to JSON if possible
    try {
      return `j:${JSON.stringify(val)}`;
    } catch (e) {
      return `o:${String(val)}`;
    }
  }
  // primitives
  return `p:${String(val)}`;
}

// small helper to choose a background gradient for a layer name
function bgForLayer(layerName) {
  switch (String(layerName)) {
    case "YooA": return "linear-gradient(#991893, #d17be2)";
    case "YooAmatter": return "linear-gradient(#929923, #bcc70f)";
    case "sparks": return "linear-gradient(#4caf50, #81c784)";
    case "YooAity": return "linear-gradient(#200642, #230085)";
    case "Seunghee": return "linear-gradient(#39a379, #60d6a8)";
    case "Yubin": return "linear-gradient(#920fff, #9e45e8)";
    case "Arinium": return "linear-gradient(#AF0D83, #fd35c7)";
    case "Hyojung": return "linear-gradient(#216db8, #1e90ff)";
    case "Mimi": return "linear-gradient(#FD47E8, #ca3435)";
    case "OMG": return "linear-gradient(#c500ed, #dc57f7)";
    default: return "linear-gradient(#991893, #d17be2)";
  }
}

export default {
  name: "Upgrade",
  props: {
    layerName: { type: String, required: true },
    upgradeId: { type: [String, Number], required: true },
  },
  data() {
    return {
      // cached flags and strings for template
      titleHtml: "",
      upgDesc: "",
      upgradeEffect: "",
      formattedCost: "",
      costCurrency: "",
      lvlDisplay: "",

      canAfford: false,
      isUnlocked: false,
      isMaxed: false,
      purchaseAnimation: false,

      // stable Decimal buffers (no allocations on hot path)
      playerLevelDec: new Decimal(0),
      maxLevelDec: new Decimal(0),
      costDec: new Decimal(0),

      // stable style object (mutated only when styleKey changes)
      mergedUpgradeStyle: { background: bgForLayer("default"), cursor: "not-allowed" },

      // cheap last-keys to avoid recomputing strings
      lastKeys: {
        main: "",
        cost: "",
        style: "",
      },

      // small cache pointers
      upgradeExists: false,
      lastUpgradeObjRef: null,

      boundUpdate: null,
    };
  },

  methods: {
    // format cost with Decimal-awareness (kept simple and safe)
    formatCost(costVal) {
      if (costVal == null) return "";
      try {
        return format(costVal);
      } catch (e) {
        return String(costVal);
      }
    },

    // hot-path update — called by events and polling
    update() {
      try {
        const layer = gameLayers[this.layerName];
        if (!layer) {
          this.upgradeExists = false;
          return;
        }

        const upg = layer.upgrades ? layer.upgrades[this.upgradeId] : null;
        this.upgradeExists = Boolean(upg);
        if (!upg) return;

        // unlocked (cheap)
        const unlockedNow =
          upg.unlocked === undefined
            ? true // unlocked by default
            : (typeof upg.unlocked === "function" ? !!upg.unlocked() : !!upg.unlocked);
        this.isUnlocked = unlockedNow;
        
        // current player level (raw source)
        const playerLvlSrc = (player.upgrades && player.upgrades[this.layerName]) ? player.upgrades[this.layerName][this.upgradeId] : 0;

        // if cost function expects level, pass level; otherwise fallback
        const srcCost = (typeof upg.cost === "function") ? upg.cost(playerLvlSrc) : upg.cost;

        const maxLvlSrc = (typeof upg.maxLvl === "function") ? upg.maxLvl() : upg.maxLvl;
        const effSrc = (typeof upg.effect === "function") ? upg.effect() : null;

        // build main key: upgrade identity + player level + max level + cost (string form) + purchased flag
        const mainKey = [
          String(this.layerName) + ":" + String(this.upgradeId),
          decimalKey(playerLvlSrc),
          decimalKey(maxLvlSrc),
          decimalKey(srcCost),
          decimalKey(effSrc),
          String(upg.purchased ?? "")
        ].join("|");

        // If any of the main-determining values changed, update text fields
        if (mainKey !== this.lastKeys.main) {
          this.lastKeys.main = mainKey;

          // update playerLevelDec (stable object)
          if (playerLvlSrc && typeof playerLvlSrc.copyFrom === "function") {
            this.playerLevelDec.copyFrom(playerLvlSrc);
          } else if (playerLvlSrc && typeof playerLvlSrc.toString === "function") {
            // try to parse a string into sign (cheap)
            const s = playerLvlSrc.toString();
            const n = Number(s);
            this.playerLevelDec.sign = Number.isFinite(n) ? n : 0;
          } else {
            this.playerLevelDec.sign = Number(playerLvlSrc) || 0;
          }

          // update maxLevelDec
          if (maxLvlSrc && typeof maxLvlSrc.copyFrom === "function") {
            this.maxLevelDec.copyFrom(maxLvlSrc);
          } else if (maxLvlSrc && typeof maxLvlSrc.toString === "function") {
            const s = maxLvlSrc.toString();
            const n = Number(s);
            this.maxLevelDec.sign = Number.isFinite(n) ? n : 0;
          } else {
            this.maxLevelDec.sign = Number(maxLvlSrc) || 0;
          }

          let maxLvlDisplay = "";
          let isUnlimited = (maxLvlSrc === undefined || maxLvlSrc === null);

          if (!isUnlimited) {
            this.isMaxed = (this.maxLevelDec && typeof this.maxLevelDec.gte === "function")
              ? this.playerLevelDec.gte(this.maxLevelDec)
              : (this.playerLevelDec.sign >= (this.maxLevelDec.sign || 0));
            maxLvlDisplay = `/${formatWhole(this.maxLevelDec)}`;
          } else {
            this.isMaxed = false;
            maxLvlDisplay = "";
          }

          this.lvlDisplay = `Level: ${formatWhole(this.playerLevelDec)}${maxLvlDisplay}${this.isMaxed ? " (MAXED)" : ""}`;

          // update title/description/effect
          try {
            this.titleHtml = (typeof upg.title === "function") ? upg.title() : (upg.title ?? "");
          } catch (e) {
            this.titleHtml = (upg.title ?? "").toString();
          }
          try {
            this.upgDesc = (typeof upg.description === "function") ? upg.description() : (upg.description ?? "");
          } catch (e) {
            this.upgDesc = (upg.description ?? "").toString();
          }
          try {
            this.upgradeEffect = upg.effectDisplay ? (typeof upg.effectDisplay === "function" ? upg.effectDisplay() : upg.effectDisplay) : "";
          } catch (e) {
            this.upgradeEffect = "";
          }
        } // end mainKey diff

        // cost handling: update costDec+formatted only when cost changes
        const costKey = decimalKey(srcCost);
        if (costKey !== this.lastKeys.cost) {
          this.lastKeys.cost = costKey;

          if (srcCost && typeof srcCost.copyFrom === "function") {
            this.costDec.copyFrom(srcCost);
            this.formattedCost = format(this.costDec);
          } else {
            try {
              this.formattedCost = format(srcCost);
            } catch (e) {
              this.formattedCost = String(srcCost);
            }
          }
          // cost currency (static text)
          this.costCurrency = upg.costCurrency ?? (layer.currency ?? "");
        }

        // afford check (cheap)
        const canAff = !!canAffordUpgrade(this.layerName, this.upgradeId);
        if (canAff !== this.canAfford) this.canAfford = canAff;

        // style: only rebuild when relevant bits change
        const styleKey = [this.layerName, String(this.canAfford ? 1 : 0), String(this.isMaxed ? 1 : 0)].join("|");
        if (styleKey !== this.lastKeys.style) {
          this.lastKeys.style = styleKey;
          let bg = bgForLayer(this.layerName);
          if (this.isMaxed) bg = "linear-gradient(to bottom, #ffd700, #ffbf00)";
          else if (!this.canAfford) bg = "linear-gradient(#ff5757, #c51313)";
          const cursor = this.isMaxed ? "default" : this.canAfford ? "pointer" : "not-allowed";
          this.mergedUpgradeStyle = { background: bg, cursor };
        }
      } catch (err) {
        // defensive
        // eslint-disable-next-line no-console
        console.error("Upgrade.update error:", err);
      }
    },

    buy() {
      if (!this.canAfford) return;
      buyUpgrade(this.layerName, this.upgradeId);
      // animation: short pulse (non-blocking)
      this.purchaseAnimation = true;
      setTimeout(() => { this.purchaseAnimation = false; }, 200);
    },
  },

  mounted() {
    // bind update handler once (hot-path) and use correct event name
    this.boundUpdate = this.update.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this.boundUpdate); // <<-- FIXED: use GAME_EVENT.UPDATE

    // initial sync
    this.update();
  },

  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
  },
};
</script>

<style scoped>
/* Animation */
@keyframes upgradePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  50% {
    transform: scale(1.06);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.9);
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
  transition: transform 0.12s linear, box-shadow 0.12s linear;
  color: inherit;
}

/* Hover (only when affordable) */
div.upgrade:hover {
  transform: scale(1.02);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.22);
}

/* Disabled upgrade style */
div.upgrade.disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

/* Maxed upgrade style */
div.upgrade.maxed {
  color: #4b2905;
  font-weight: bold;
  box-shadow: 0 0 10px #ffbf00;
}

/* Purchased animation style */
div.upgrade.purchased {
  animation: upgradePulse 0.2s ease-out;
}

div.upgrade h2 {
  margin: 6px 0;
  text-align: center;
}

div.upgrade p {
  margin: 6px 0;
  text-align: center;
}
</style>
