<template>
  <div :class="dimensionClass">
    <h2 v-html="dimHeader"></h2>
    <h3 v-if="dimensionGain" v-html="dimensionGain"></h3>

    <p v-if="dimension.tier === 1" v-html="t1Text"></p>
    <p v-else-if="dimension.tier > 1">Produces <span v-html="prevDimensionName"></span>.</p>

    <p>Cost: <span v-html="formattedCost"></span> {{ dimension.costDisp }}</p>
    <p v-if="rankUnlocked">Rank Cost: <span v-html="formattedRankCost"></span> {{ dimension.rankCostDisp }}</p>
    <p v-html="dimension.effectDisplay"></p>

    <button @click="buyDimension" :disabled="!canAfford">Buy</button>
    <button v-if="maxUnlocked" @click="maxDimension" :disabled="!canAfford">Buy Max</button>
    <button class="rank" :disabled="!canAffordRank" v-if="rankUnlocked" @click="harmonizeDimension">Harmonize</button>
    <button class="rank" v-if="rankMaxUnlocked" @click="maxDimensionRank">Harmonize Max</button>
  </div>
</template>

<script>
// Assumes global `format`, `formatWhole`, `player`, and Decimal are available

function decimalKey(val) {
  if (val == null) return 'null';
  if (typeof val === 'object') {
    if ('sign' in val && 'layer' in val && 'mag' in val) return `be:${val.sign}|${val.layer}|${val.mag}`;
    if ('mantissa' in val && 'exponent' in val) return `bi:${val.mantissa}|${val.exponent}`;
    if (typeof val.toNumber === 'function') return `n:${val.toNumber()}`;
  }
  return `p:${String(val)}`;
}

// sanitize type into safe lowercase class token
function normalizeType(type) {
  if (type == null) return 'default';
  return String(type).replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'default';
}

export default {
  name: "Dimension",
  props: {
    dimension: { type: Object, required: true },
    allDimensions: { type: Array, default: () => [] },
    dimGain: { type: String, default: "N/A" },
    currentCurrency: { type: Object, default: null },
    maxUnlocked: { type: Boolean, default: false },
    rankUnlocked: { type: Boolean, default: false },
    rankMaxUnlocked: { type: Boolean, default: false },
  },
  data() {
    return {
      dimHeader: "",
      dimensionGain: "",
      prevDimensionName: "",
      formattedCost: "",
      formattedRankCost: "",
      t1Text: "",
      canAfford: false,
      canAffordRank: false,

      // class string
      dimensionClass: "dimension type-default tier-1 disabled",

      // stable Decimal buffers (no allocations per tick)
      amtDec: new Decimal(0),
      costDec: new Decimal(0),
      rankCostDec: new Decimal(0),

      // last keys for cheap change detection
      lastKeys: {
        header: "",
        gain: "",
        prevName: "",
        cost: "",
        rankCost: "",
        afford: "",
        affordRank: "",
        class: "",
        t1Text: "",
      },
    };
  },

  methods: {
    update() {
      const dim = this.dimension;
      if (!dim) return;

      // ---------- header ----------
      const amtKey = decimalKey(dim.amt ?? dim.amount ?? null);
      const lvlKey = String(dim.level ?? 0);
      const rankKey = String(dim.rank ?? 0);
      const multKey = String(dim.mult ?? "");
      const rankMultKey = String(dim.rankMult ?? "");
      const headerKey = [amtKey, lvlKey, rankKey, multKey, rankMultKey, dim.tier].join("|");

      if (headerKey !== this.lastKeys.header) {
        this.lastKeys.header = headerKey;

        const srcAmt = dim.amt ?? dim.amount;
        if (srcAmt && typeof srcAmt.copyFrom === "function") {
          this.amtDec.copyFrom(srcAmt);
        } else if (srcAmt && typeof srcAmt.toNumber === "function") {
          this.amtDec.sign = srcAmt.toNumber();
        } else {
          this.amtDec.sign = Number(srcAmt) || 0;
        }

        this.t1Text = dim.t1Text ?? "";
        const levelStr = formatWhole(dim.level ?? 0);
        const rankPart = (dim.rankUnlocked && (dim.rank != null)) ? `, Rank ${formatWhole(dim.rank)}` : "";
        const rankMultPart = (dim.rankUnlocked && (dim.rankMult != null)) ? `, ^${format(dim.rankMult)}` : "";
        this.dimHeader = `${format(this.amtDec)} ${dim.name} (Level ${levelStr}${rankPart}) x${format(dim.mult ?? 1)}${rankMultPart}`;
      }

      // ---------- gain ----------
      if (this.dimGain !== this.lastKeys.gain) {
        this.lastKeys.gain = this.dimGain;
        this.dimensionGain = (this.dimGain === "N/A") ? "" : this.dimGain;
      }

      // ---------- prev name ----------
      const prevName = (dim.tier > 1 && this.allDimensions && this.allDimensions[dim.tier - 2])
        ? this.allDimensions[dim.tier - 2].name : "";
      if (prevName !== this.lastKeys.prevName) {
        this.lastKeys.prevName = prevName;
        this.prevDimensionName = prevName;
      }

      // ---------- cost ----------
      const costSrc = dim.cost;
      const costKey = decimalKey(costSrc);
      if (costKey !== this.lastKeys.cost) {
        this.lastKeys.cost = costKey;
        if (costSrc && typeof costSrc.copyFrom === "function") {
          this.costDec.copyFrom(costSrc);
        } else if (costSrc && typeof costSrc.toNumber === "function") {
          this.costDec.sign = costSrc.toNumber();
        } else {
          this.costDec.sign = Number(costSrc) || 0;
        }
        this.formattedCost = format(this.costDec);
      }

      const rankCostSrc = dim.rankCost;
      const rankCostKey = decimalKey(rankCostSrc);
      if (rankCostKey !== this.lastKeys.rankCost) {
        this.lastKeys.rankCost = rankCostKey;
        if (rankCostSrc && typeof rankCostSrc.copyFrom === "function") {
          this.rankCostDec.copyFrom(rankCostSrc);
        } else if (rankCostSrc && typeof rankCostSrc.toNumber === "function") {
          this.rankCostDec.sign = rankCostSrc.toNumber();
        } else {
          this.rankCostDec.sign = Number(rankCostSrc) || 0;
        }
        this.formattedRankCost = format(this.rankCostDec);
      }

      // ---------- affordability ----------
      const curr = (dim.layer === "") ? player.YooAPoints : (player[dim.layer] && player[dim.layer][dim.currency]) || 0;
      const currKey = decimalKey(curr) + "|" + costKey;
      const canAffordNow = (curr && typeof curr.gte === "function") ? curr.gte(dim.cost) : (Number(curr) >= (dim.cost?.toNumber ? dim.cost.toNumber() : Number(dim.cost) || Infinity));

      if (currKey !== this.lastKeys.afford) {
        this.lastKeys.afford = currKey;
        if (canAffordNow !== this.canAfford) this.canAfford = canAffordNow;
      }

      const rankCurr = (dim.rankLayer === "") ? player.YooAPoints : (player[dim.rankLayer] && player[dim.rankLayer][dim.rankCurrency]) || 0;
      const rankCurrKey = decimalKey(rankCurr) + "|" + rankCostKey;
      const canAffordRankNow = (rankCurr && typeof rankCurr.gte === "function") ? rankCurr.gte(dim.rankCost) : (Number(rankCurr) >= (dim.rankCost?.toNumber ? dim.rankCost.toNumber() : Number(dim.rankCost) || Infinity));

      if (rankCurrKey !== this.lastKeys.affordRank) {
        this.lastKeys.affordRank = rankCurrKey;
        if (canAffordRankNow !== this.canAffordRank) this.canAffordRank = canAffordRankNow;
      }

      // ---------- class string (normalized) ----------
      const typeNorm = normalizeType(dim.type);
      const affordPart = this.canAfford ? 'affordable' : 'disabled';
      const tierPart = `tier-${String(dim.tier || 1)}`;
      const newClass = `dimension ${affordPart} type-${typeNorm} ${tierPart}`;
      if (newClass !== this.lastKeys.class) {
        this.lastKeys.class = newClass;
        this.dimensionClass = newClass;
      }
    },

    buyDimension() {
      if (this.canAfford && typeof this.dimension.buy === "function") this.dimension.buy();
    },
    harmonizeDimension() {
      if (this.canAffordRank && typeof this.dimension.harmonize === "function") this.dimension.harmonize();
    },
    maxDimension() {
      if (typeof this.dimension.buyMax === "function") this.dimension.buyMax();
    },
    maxDimensionRank() {
      if (typeof this.dimension.harmonizeMax === "function") this.dimension.harmonizeMax();
    },
  },

  mounted() {
    this.boundUpdate = this.update.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
    this.update();
  },

  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
  },
};
</script>

<style scoped>
.dimension {
    padding: 5px;
    margin: 10px;
    border-radius: 10px;
    transition: box-shadow .12s linear;
    display: block;
    color: #fff;
}

/* base header spacing */
.dimension h2 { margin: 10px; }

/* affordability states */
.dimension.disabled { opacity: 0.88; cursor: not-allowed; }
/* ensure disabled background overrides type backgrounds */
.dimension.disabled { background: linear-gradient(#c51313, #ff5757); }

/* when affordable, add subtle elevation (backgrounds come from type classes) */
.dimension.affordable { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

/* type helpers (lowercase tokens; class names generated are 'type-<normalized>') */
.dimension.type-yooa { background: linear-gradient(#991893, #d17be2); }
.dimension.type-yooamatter { background: linear-gradient(#4caf50, #81c784); }
.dimension.type-shiah { background: linear-gradient(#200642, #230085); }
.dimension.type-default { background: linear-gradient(#4caf50, #81c784); }

/* tier variants (visual accents) */
.dimension.tier-1 { border: 2px solid rgba(255,255,255,0.05); }
.dimension.tier-2 { border: 2px solid rgba(0,0,0,0.02); }

/* rank button */
button.rank { background-color: #6542ff; }
button.rank:hover { background-color: #4f34c7; }

button[disabled] { opacity: 0.5; cursor: not-allowed; }
</style>
