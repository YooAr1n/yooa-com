<template>
  <div class="tabs-container">
    <div class="tabs">
      <button :class="{ active: currentTab === 'main' }" @click="changeTab('YooAmatter', 'main')">
        Main
      </button>
      <button :class="{ active: currentTab === 'upgrade' }" @click="changeTab('YooAmatter', 'upgrade')">
        Upgrades
      </button>
      <button v-if="challengeUnlocked" :class="{ active: currentTab === 'challenge' }"
        @click="changeTab('YooAmatter', 'challenge')">
        Challenges
      </button>
      <button v-if="sparkUpgUnlocked" :class="{ active: currentTab === 'spark-upgrade' }"
        @click="changeTab('YooAmatter', 'spark-upgrade')">
        Spark Upgrades
      </button>
    </div>

    <!-- Main Tab -->
    <div v-if="currentTab === 'main'" class="tab-content">
      <div class="efftext">
        You have <span v-html="YooAmatterText"></span> YooAmatter,
        which boosts YooA Point gain by x<span v-html="ymEffectText"></span>
        <br>
        <span>Effect Formula: (x + {{ format1 }})<sup>{{ effectExponentText }}</sup></span>
      </div><br>

      <div v-if="mathUnlocked">
        <div class="efftext">
          You have <span v-html="YooAriumText"></span> YooArium (+{{ YooAriumGainText }}/solve), which boosts YooAmatter
          gain by
          x<span v-html="yrEffectCached[0]"></span> and YooA math problem gain by x<span v-html="yrEffectCached[1]"></span>
          <br><span>Effect Formula: <span v-html="YooAriumEffect1"></span> to YooAmatter, ((√x / {{ format10 }}) +
            {{ format1 }})<sup>{{ YooAriumExponent2Text }}</sup> to YooA math problems</span>
        </div><br>
        <h3>You have solved {{ solvedText }} math problems. (+{{ problemGainText }}/solve)</h3>
        <MathProblem layerName="YooAmatter" refName="YooAmatterMath" />
      </div>

      <div v-if="unlockedDimensions.length > 0">
        <div class="efftext">
          You have <span v-html="SparkText"></span> YooAmatter Sparks, which boosts YooArium gain by x<span v-html-stable="ysEffectCached[0]"></span> and raises YooA Point gain to <span v-html="ysEffectCached[1]"></span>
          <br><span>Effect Formula: (x + {{ format1 }})<sup>{{ formatNum(0.75) }}</sup> to YooArium, ^√(log<sub>{{
              format10 }}</sub>(x + {{ format1 }})) / {{ formatNum(100) }} + {{ format1 }} to YooA
            Points</span>
        </div><br>
        <h3>Formation costs increase faster at Level <span v-html="scalingStart"></span></h3><br>
        <h3 v-html="dimMultDisp"></h3><br>

        <button v-if="maxAllUnlocked" class="max" @click="maxAllForms">Max All Formations (X)</button>

        <!-- Pass minimal props to <Dimension> -->
        <Dimension v-for="dim in unlockedDimensions" :key="dim.id" :dimension="dim" :canAfford="canAffordDimension(dim)"
          :dimGain="dimensionGain(dim)" :allDimensions="allDimensions" :maxUnlocked="maxDimUnlocked" />
      </div>
    </div>

    <!-- Upgrades -->
    <div v-if="currentTab === 'upgrade'" class="tab-content">
      <button v-if="maxAllUnlocked" class="max" @click="maxAllYMUpgrades">Max All YooAmatter Upgrades</button>
      <UpgradeGrid layerName="YooAmatter" />
    </div>

    <!-- Challenges -->
    <div v-if="currentTab === 'challenge'" class="tab-content">
      <h2 v-once>Completing any challenge unlocks Arin.</h2>
      <Challenge layerName="YooAmatter" challengeId="1" />
      <Challenge layerName="YooAmatter" challengeId="2" />
      <Challenge layerName="YooAmatter" challengeId="3" />
      <Challenge layerName="YooAmatter" challengeId="4" />
    </div>

    <!-- Spark Upgrades -->
    <div v-if="currentTab === 'spark-upgrade'" class="tab-content">
      <div class="efftext">
        You have <span v-html="SparkText"></span> YooAmatter Sparks <span>{{ ysGainText }}</span>
      </div>
      <button v-if="maxSparkUnlocked" class="max" @click="maxSparkUpgrades">Max All Spark Upgrades</button>
      <UpgradeGrid layerName="sparks" />
    </div>
  </div>
</template>

<script>
import { buyMaxUpgrade, buyUpgrade, hasMilestone, hasUpgrade } from "@/incremental/mainFuncs";
import UpgradeGrid from "./comps/UpgradeGrid.vue";
import MathProblem from "./comps/MathProblem.vue";
import Challenge from "./comps/Challenge.vue";
import Dimension from "./comps/Dimension.vue";
import { getDimMultPerLvl, getScalingStart } from "@/incremental/dimensions";
import { gameLayers } from "@/incremental/layersData";
import { hasAchievement, maxAllDimensions } from "@/incremental/incremental";

// helper caches (unchanged)
let _ymKeys;
function getYMKeys() {
  if (!_ymKeys) {
    _ymKeys = [];
    for (const key in gameLayers.YooAmatter.upgrades) {
      if (gameLayers.YooAmatter.upgrades[key].title) _ymKeys.push(key);
    }
  }
  return _ymKeys;
}
let _sparkKeys;
function getSparkKeys() {
  if (!_sparkKeys) {
    _sparkKeys = [];
    for (const key in gameLayers.sparks.upgrades) {
      if (gameLayers.sparks.upgrades[key].title) _sparkKeys.push(key);
    }
  }
  return _sparkKeys;
}
function applyUpgrades(layerName, keys, method) {
  for (const key of keys) method(layerName, key);
}
export function buyAllYMUpgrades() { applyUpgrades("YooAmatter", getYMKeys(), buyUpgrade); }
export function maxAllYMUpgrades() { applyUpgrades("YooAmatter", getYMKeys(), buyMaxUpgrade); }
export function buySparkUpgrades() { applyUpgrades("sparks", getSparkKeys(), buyUpgrade); }
export function maxSparkUpgrades() { applyUpgrades("sparks", getSparkKeys(), buyMaxUpgrade); }

// small helper to build a cheap key for Decimal-like or numeric values
function decimalKey(val) {
  if (val == null) return "null";
  // Break-Eternity style (sign, layer, mag)
  if (typeof val === "object") {
    if ("sign" in val && "layer" in val && "mag" in val) {
      return `${val.sign}|${val.layer}|${val.mag}`;
    }
    // Break-Infinity style (mantissa, exponent)
    if ("mantissa" in val && "exponent" in val) {
      return `${val.mantissa}|${val.exponent}`;
    }
    // fallback: if it has toString but avoid heavy conversion — try numeric conversion
    if (typeof val.toNumber === "function") {
      return `n:${val.toNumber()}`;
    }
  }
  // primitives
  return `p:${String(val)}`;
}

export default {
  name: "YooAmatter",
  components: { UpgradeGrid, MathProblem, Challenge, Dimension },

  data() {
    return {
      subtab: "main",

      // Decimal buffers (stable objects)
      ymAmount: new Decimal(0),
      yooAriumAmount: new Decimal(0),
      sparkAmount: new Decimal(0),
      ymEffectDec: new Decimal(1),
      effectExpDec: new Decimal(1),
      solvedDec: new Decimal(0),
      problemGainDec: new Decimal(0),
      yooAriumGainDec: new Decimal(0),

      // cached formatted strings (shown in template)
      YooAmatterText: "",
      YooAriumText: "",
      SparkText: "",
      ymEffectText: "",
      effectExponentText: "",
      solvedText: "",
      problemGainText: "",
      YooAriumGainText: "",
      ysGainText: "",

      // cached small arrays/strings
      YooAriumEffect1: "",
      YooAriumExponent2Text: "",
      scalingStart: "",
      dimMultDisp: "",
      allDimensions: [],
      unlockedDimensions: [],

      // boolean flags (cheap)
      challengeUnlocked: false,
      sparkUpgUnlocked: false,
      mathUnlocked: false,
      maxDimUnlocked: false,
      maxAllUnlocked: false,
      maxSparkUnlocked: false,

      // last keys for change detection
      lastKeys: {
        ym: "",
        yooA: "",
        spark: "",
        ymEffect: "",
        effectExp: "",
        solved: "",
        problemGain: "",
        yooAriumGain: "",
        ysGain: "",
      },

      lastDimIdsHash: "",
      // cached small effect strings arrays to avoid calling format(...) in template
      yrEffectCached: ["", ""],
      ysEffectCached: ["", ""],
    };
  },

  computed: {
    currentTab() { return this.subtab; },
    format1() { return format(1); },
    format10() { return format(10); },
  },

  methods: {
    formatNum(num) { return format(num); },
    // color wrapper (cheap)
    fmtColor(layerName, text) {
      const color = (gameLayers[layerName] && gameLayers[layerName].color) || '#ffffff';
      return colorText('h3', color, text);
    },

    // Very small helper to update cached effect strings only when underlying effect decimals change
    _maybeUpdateEffectCache() {
      // yrEffect (two entries)
      const yre0 = gameLayers.YooAmatter.YooAriumEffect()[0];
      const yre1 = gameLayers.YooAmatter.YooAriumEffect()[1];
      const ky0 = decimalKey(yre0), ky1 = decimalKey(yre1);
      if (this.lastKeys.yr0 !== ky0) {
        this.lastKeys.yr0 = ky0;
        this.yrEffectCached[0] = this.fmtColor("YooAmatter", format(yre0));
      }
      if (this.lastKeys.yr1 !== ky1) {
        this.lastKeys.yr1 = ky1;
        this.yrEffectCached[1] = this.fmtColor("YooAmatter", format(yre1));
      }

      // ysEffect (two entries)
      const yse0 = gameLayers.YooAmatter.YooAmatterSparkEffect()[0];
      const yse1 = gameLayers.YooAmatter.YooAmatterSparkEffect()[1];
      const yse0sc = gameLayers.YooAmatter.sparkSoftcap();
      const ksy0 = decimalKey(yse0), ksy1 = decimalKey(yse1);
      if (this.lastKeys.ys0 !== ksy0) {
        this.lastKeys.ys0 = ksy0;
        this.ysEffectCached[0] = this.fmtColor("sparks", format(yse0)) + (yse0.gte(yse0sc) ? softcapText("(softcapped)") : "");
      }
      if (this.lastKeys.ys1 !== ksy1) {
        this.lastKeys.ys1 = ksy1;
        this.ysEffectCached[1] = this.fmtColor("sparks", format(yse1));
      }
    },

    _maybeUpdateUnlockedDimensions() {
      const dims = this.allDimensions;
      if (!dims || dims.length === 0) {
        if (this.unlockedDimensions.length !== 0) {
          this.unlockedDimensions = [];
          this.lastDimIdsHash = "";
        }
        return;
      }
      let s = "";
      for (let i = 0; i < dims.length; ++i) {
        const d = dims[i];
        if (d.unlocked) s += d.id + ",";
      }
      if (s !== this.lastDimIdsHash) {
        this.lastDimIdsHash = s;
        this.unlockedDimensions = dims.filter(d => d.unlocked);
      }
    },

    // Primary hot-path: called every GAME_EVENT.UPDATE
    onGameUpdate() {
      // -- 1) Copy decimals only when source changed, and format only when necessary --
      // YooAmatter amount
      const srcYm = player.YooAmatter.amount;
      const keyYm = decimalKey(srcYm);
      if (this.lastKeys.ym !== keyYm) {
        this.lastKeys.ym = keyYm;
        // copy to buffer (no allocation)
        this.ymAmount.copyFrom(srcYm);
        // update cached string (we only format when underlying number changed)
        this.YooAmatterText = this.fmtColor("YooAmatter", formatWhole(this.ymAmount));
      }
      // YooArium
      const srcYA = player.YooAmatter.YooArium;
      const keyYA = decimalKey(srcYA);
      if (this.lastKeys.yooA !== keyYA) {
        this.lastKeys.yooA = keyYA;
        this.yooAriumAmount.copyFrom(srcYA);
        this.YooAriumText = this.fmtColor("YooAmatter", formatWhole(this.yooAriumAmount));
      }
      // Sparks
      const srcSpark = player.YooAmatter.sparks;
      const keySpark = decimalKey(srcSpark);
      if (this.lastKeys.spark !== keySpark) {
        this.lastKeys.spark = keySpark;
        this.sparkAmount.copyFrom(srcSpark);
        this.SparkText = this.fmtColor("sparks", formatWhole(this.sparkAmount));
      }

      // ymEffect (could be Decimal-like or number)
      const eff = gameLayers.YooAmatter.effect();
      const keyEff = decimalKey(eff);
      if (this.lastKeys.ymEffect !== keyEff) {
        this.lastKeys.ymEffect = keyEff;
        if (eff instanceof Decimal) this.ymEffectDec.copyFrom(eff);
        else this.ymEffectDec.sign = eff;
        this.ymEffectText = this.fmtColor("YooAmatter", formatWhole(this.ymEffectDec))
      }

      // effect exponent
      const eExp = gameLayers.YooAmatter.effectExp();
      const keyExp = decimalKey(eExp);
      if (this.lastKeys.effectExp !== keyExp) {
        this.lastKeys.effectExp = keyExp;
        if (eExp instanceof Decimal) this.effectExpDec.copyFrom(eExp);
        else this.effectExpDec.sign = eExp;
        this.effectExponentText = format(this.effectExpDec);
      }

      // solved
      const solvedVal = player.math.YooAmatter.solved;
      const keySolved = decimalKey(solvedVal);
      if (this.lastKeys.solved !== keySolved) {
        this.lastKeys.solved = keySolved;
        if (solvedVal instanceof Decimal) this.solvedDec.copyFrom(solvedVal);
        else this.solvedDec.sign = solvedVal;
        this.solvedText = formatWhole(this.solvedDec);
      }

      // problem gain
      const problemGainVal = gameLayers.YooAmatter.problemGain();
      const keyProblem = decimalKey(problemGainVal);
      if (this.lastKeys.problemGain !== keyProblem) {
        this.lastKeys.problemGain = keyProblem;
        if (problemGainVal instanceof Decimal) this.problemGainDec.copyFrom(problemGainVal);
        else this.problemGainDec.sign = problemGainVal;
        this.problemGainText = format(this.problemGainDec);
      }

      // YooArium gain
      const yaGainVal = gameLayers.YooAmatter.getYooAriumGain();
      const kYAGain = decimalKey(yaGainVal);
      if (this.lastKeys.yooAriumGain !== kYAGain) {
        this.lastKeys.yooAriumGain = kYAGain;
        if (yaGainVal instanceof Decimal) this.yooAriumGainDec.copyFrom(yaGainVal);
        else this.yooAriumGainDec.sign = yaGainVal;
        this.YooAriumGainText = format(this.yooAriumGainDec);
      }

      // ysGain is derived from player.gain; handle it similarly (may be number)
      const srcYs = player.gain?.YooAmatter?.sparks;
      const keyYs = decimalKey(srcYs);
      if (this.lastKeys.ysGain !== keyYs) {
        this.lastKeys.ysGain = keyYs;
        this.ysGainText = typeof srcYs !== "undefined" ? srcYs : this.ysGainText;
      }

      // update small rarely-changing composed strings (cheap to check)
      const newDimMultDisp = `Formation Multiplier per level: x${format(getDimMultPerLvl("YooAmatter", 1), 3)}`;
      if (this.dimMultDisp !== newDimMultDisp) this.dimMultDisp = newDimMultDisp;

      const newScalingStart = format(getScalingStart("YooAmatter"));
      if (this.scalingStart !== newScalingStart) this.scalingStart = newScalingStart;

      // YooAriumEffect1 and exponent2 (rare toggles)
      const format1 = format(1), format10 = format(10);
      const newYAEffect1 = hasUpgrade("YooAmatter", 35)
        ? format10 + "<sup>log<sub>" + format10 + "</sub>(x + " + format1 + ")<sup>" + format(1.2) + "</sup></sup>"
        : "x + " + format1;
      if (this.YooAriumEffect1 !== newYAEffect1) this.YooAriumEffect1 = newYAEffect1;

      const newYAExp2 = format(gameLayers.YooAmatter.YooAriumExp()[1]);
      if (this.YooAriumExponent2Text !== newYAExp2) this.YooAriumExponent2Text = newYAExp2;

      // update flags (cheap)
      this.subtab = player.subtabs["YooAmatter"];
      this.challengeUnlocked = hasUpgrade("YooAmatter", 24) || hasMilestone("YooAity", 7);
      this.sparkUpgUnlocked = hasUpgrade("YooAmatter", 54);
      this.mathUnlocked = hasUpgrade("YooAmatter", 23);
      this.maxDimUnlocked = hasMilestone("YooAity", 1);
      this.maxAllUnlocked = hasMilestone("YooAity", 3);
      this.maxSparkUnlocked = hasAchievement(53);

      // keep reference to array (no allocation) and only rebuild unlockedDimensions when needed
      this.allDimensions = player.dimensions.YooAmatter;
      this._maybeUpdateUnlockedDimensions();

      // update effect caches used in template (yrEffect and ysEffect)
      this._maybeUpdateEffectCache();
    },

    // template helpers now read cached strings/arrays
    yrEffectText(n) { return this.yrEffectCached[n]; },
    ysEffectText(n) { return this.ysEffectCached[n]; },

    canAffordDimension(dimension) {
      const curr = dimension.layer === "" ? player.YooAPoints : player[dimension.layer][dimension.currency];
      return curr?.gte(dimension.cost) ?? false;
    },
    dimensionGain(dimension) {
      return player.gain[dimension.type]?.dimensions?.[dimension.tier - 1] ?? "N/A";
    },

    maxAllForms() { maxAllDimensions("YooAmatter"); },
    maxAllYMUpgrades() { maxAllYMUpgrades(); },
    maxSparkUpgrades() { maxSparkUpgrades(); },
    changeTab(tabName, subtab) { player.tab = tabName; player.subtabs[tabName] = subtab; },
  },

  mounted() {
    // Bind hot-path listener (no throttle). onGameUpdate does cheap diff+copy+occasionally-format.
    this._onGameUpdate = this.onGameUpdate.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this._onGameUpdate);

    // initial sync
    this.onGameUpdate();
  },

  beforeUnmount() {
    if (this._onGameUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this._onGameUpdate);
  },
};
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tabs { display: flex; gap: 16px; justify-content: center; }
.tabs button { padding: 8px 16px; border: none; background-color: #bcc70f; color: #313500; cursor: pointer; font-weight: bold; border-radius: 4px; font-size: 16pt; transition: background-color 0.2s ease, color 0.2s ease; }
.tabs button.active { background-color: #313500; color: #bcc70f; }
.tab-content { width: 100%; }
.efftext { font-size: 16pt; }
button.max { padding: 8px 16px; background-color: #d17be2; color: #b9e5ff; border: none; border-radius: 4px; cursor: pointer; }
button.max:hover { background-color: #b86cc3; }
</style>
