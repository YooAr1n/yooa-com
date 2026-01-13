<template>
  <div class="light">
    <h2 class="title">{{ member }}'s Training</h2>
    <h2 class="subtitle">
      You have <span v-html="lightAmountHtml"></span> {{ member }} Light
    </h2>

    <!-- 🎤 VOCALS -->
    <div class="skill">
      <h3>Vocals: Level {{ vocalLevelText }}</h3><br>
      <h3>Effect: <span v-html="vocalEffect"></span></h3>

      <div class="progress-container" aria-hidden="true">
        <div class="progress-bar" :style="{ width: vocalProgress + '%' }"></div>
      </div>

      <small class="meta">
        {{ sparklesText.vocals }} / {{ nextLevelText.vocals }} Sparkles
        <span v-html="vocalGainHtml"></span>
      </small><br>

      <button
        class="allocate-btn"
        :disabled="!canAllocate.vocals"
        :class="{ disabled: !canAllocate.vocals }"
        @click="allocate('vocals')"
      >
        Allocate All Light to Vocals
      </button>
    </div>

    <!-- 💃 DANCE -->
    <div class="skill">
      <h3>Dance: Level {{ danceLevelText }}</h3><br>
      <h3>Effect: <span v-html="danceEffect"></span></h3>

      <div class="progress-container" aria-hidden="true">
        <div class="progress-bar" :style="{ width: danceProgress + '%' }"></div>
      </div>

      <small class="meta">
        {{ sparklesText.dance }} / {{ nextLevelText.dance }} Sparkles
        <span v-html="danceGainHtml"></span>
      </small><br>

      <button
        class="allocate-btn"
        :disabled="!canAllocate.dance"
        :class="{ disabled: !canAllocate.dance }"
        @click="allocate('dance')"
      >
        Allocate All Light to Dance (Requires Vocals Level {{ format100 }})
      </button>
    </div>

    <!-- 🌟 CHARISMA -->
    <div class="skill">
      <h3>Charisma: Level {{ charismaLevelText }}</h3><br>
      <h3>Effect: <span v-html="charismaEffect"></span></h3>

      <div class="progress-container" aria-hidden="true">
        <div class="progress-bar" :style="{ width: charismaProgress + '%' }"></div>
      </div>

      <small class="meta">
        {{ sparklesText.charisma }} / {{ nextLevelText.charisma }} Sparkles
        <span v-html="charismaGainHtml"></span>
      </small><br>

      <button
        class="allocate-btn"
        :disabled="!canAllocate.charisma"
        :class="{ disabled: !canAllocate.charisma }"
        @click="allocate('charisma')"
      >
        Allocate All Light to Charisma (Requires Dance Level {{ format100 }})
      </button>
    </div>
  </div>
</template>

<script>
/**
 * Optimized Light.vue
 * - Uses diffing/cached formatted strings like YooAmatter.vue
 * - Minimizes allocations inside the hot update path (GAME_EVENT.UPDATE)
 * - Keeps Decimal buffers and only reformats when the source changes
 *
 * Assumes the existence of these globals/imports in project scope:
 * - player (game state)
 * - gameLayers (game layer helpers)
 * - format, formatWhole, colorText (formatting helpers)
 *
 * Paths in original file used:
 * import { gainCurrency, player } from "@/incremental/incremental.js";
 * import { gameLayers } from "@/incremental/layersData.js";
 *
 * Here we reference player and gameLayers directly (mirrors original file).
 */

import { player } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/layersData.js";

function decimalKey(val) {
  if (val == null) return "null";
  if (typeof val === "object") {
    if ("sign" in val && "layer" in val && "mag" in val) {
      return `${val.sign}|${val.layer}|${val.mag}`;
    }
    if ("mantissa" in val && "exponent" in val) {
      return `${val.mantissa}|${val.exponent}`;
    }
    if (typeof val.toNumber === "function") {
      return `n:${val.toNumber()}`;
    }
  }
  return `p:${String(val)}`;
}

export default {
  name: "Light",
  props: {
    member: { type: String, required: true },
  },

  data() {
    return {
      // Decimal buffers (avoid re-allocating per update)
      lightDec: new Decimal(0),
      allocatedVocalsDec: new Decimal(0),
      allocatedDanceDec: new Decimal(0),
      allocatedCharismaDec: new Decimal(0),

      vocalLevelDec: new Decimal(0),
      danceLevelDec: new Decimal(0),
      charismaLevelDec: new Decimal(0),

      sparklesVocalsDec: new Decimal(0),
      sparklesDanceDec: new Decimal(0),
      sparklesCharismaDec: new Decimal(0),

      nextReqVocalsDec: new Decimal(0),
      nextReqDanceDec: new Decimal(0),
      nextReqCharismaDec: new Decimal(0),

      // Cached display strings (only updated when source changes)
      lightAmountHtml: "",
      vocalLevelText: "0",
      danceLevelText: "0",
      charismaLevelText: "0",
      vocalEffect: "",
      danceEffect: "",
      charismaEffect: "",
      vocalGainHtml: "",
      danceGainHtml: "",
      charismaGainHtml: "",
      sparklesText: { vocals: "0", dance: "0", charisma: "0" },
      nextLevelText: { vocals: "0", dance: "0", charisma: "0" },

      // Computed percentages (numbers) for progress bars
      vocalProgress: 0,
      danceProgress: 0,
      charismaProgress: 0,

      // Quick booleans for template
      canAllocate: { vocals: false, dance: false, charisma: false },

      // small caches for change detection
      lastKeys: {
        light: "",
        allocVocals: "",
        allocDance: "",
        allocCharisma: "",
        lvlVocals: "",
        lvlDance: "",
        lvlCharisma: "",
        sparkVocals: "",
        sparkDance: "",
        sparkCharisma: "",
        reqVocals: "",
        reqDance: "",
        reqCharisma: "",
      },
    };
  },

  computed: {
    format100() {
      return format(100);
    },
  },

  methods: {
    // Percent calc — number output (no allocation of temporaries)
    calcProgressNum(currentDec, requiredDec) {
      try {
        if (!requiredDec || requiredDec.eq(0)) return 0;
        const pct = currentDec.div(requiredDec).times(100);
        const n = pct.toNumber();
        return Math.min(100, Number.isFinite(n) ? n : 0);
      } catch (e) {
        return 0;
      }
    },

    // Primary hot-path: called on GAME_EVENT.UPDATE
    onGameUpdate() {
      const OMG = gameLayers.OMG;
      const member = this.member;
      const memLayer = member === "Arin" ? "Arinium" : member; // keep legacy mapping

      // 1) Light amount
      const srcLight = player.YooAity?.OMGLight?.[member];
      const keyLight = decimalKey(srcLight);
      if (this.lastKeys.light !== keyLight) {
        this.lastKeys.light = keyLight;
        if (srcLight instanceof Decimal) this.lightDec.copyFrom(srcLight);
        else this.lightDec.sign = srcLight;
        this.lightAmountHtml = colorText("h3", gameLayers[memLayer]?.color || "#ffffff", formatWhole(this.lightDec));
      }

      // 2) Allocated light (object)
      const srcAlloc = player.YooAity?.OMGLightAllocated?.[member] || { vocals: new Decimal(0), dance: new Decimal(0), charisma: new Decimal(0) };
      const keyAllocVoc = decimalKey(srcAlloc.vocals);
      const keyAllocDance = decimalKey(srcAlloc.dance);
      const keyAllocChar = decimalKey(srcAlloc.charisma);

      if (this.lastKeys.allocVocals !== keyAllocVoc) {
        this.lastKeys.allocVocals = keyAllocVoc;
        if (srcAlloc.vocals instanceof Decimal) this.allocatedVocalsDec.copyFrom(srcAlloc.vocals);
        else this.allocatedVocalsDec.sign = srcAlloc.vocals;
      }
      if (this.lastKeys.allocDance !== keyAllocDance) {
        this.lastKeys.allocDance = keyAllocDance;
        if (srcAlloc.dance instanceof Decimal) this.allocatedDanceDec.copyFrom(srcAlloc.dance);
        else this.allocatedDanceDec.sign = srcAlloc.dance;
      }
      if (this.lastKeys.allocCharisma !== keyAllocChar) {
        this.lastKeys.allocCharisma = keyAllocChar;
        if (srcAlloc.charisma instanceof Decimal) this.allocatedCharismaDec.copyFrom(srcAlloc.charisma);
        else this.allocatedCharismaDec.sign = srcAlloc.charisma;
      }

      // 3) Levels (vocals/dance/charisma)
      const lvlVoc = OMG.getLevels(member, "vocals");
      const lvlDance = OMG.getLevels(member, "dance");
      const lvlChar = OMG.getLevels(member, "charisma");

      const kLvlVoc = decimalKey(lvlVoc);
      const kLvlDance = decimalKey(lvlDance);
      const kLvlChar = decimalKey(lvlChar);

      if (this.lastKeys.lvlVocals !== kLvlVoc) {
        this.lastKeys.lvlVocals = kLvlVoc;
        if (lvlVoc instanceof Decimal) this.vocalLevelDec.copyFrom(lvlVoc);
        else this.vocalLevelDec.sign = lvlVoc;
        this.vocalLevelText = formatWhole(this.vocalLevelDec);
      }
      if (this.lastKeys.lvlDance !== kLvlDance) {
        this.lastKeys.lvlDance = kLvlDance;
        if (lvlDance instanceof Decimal) this.danceLevelDec.copyFrom(lvlDance);
        else this.danceLevelDec.sign = lvlDance;
        this.danceLevelText = formatWhole(this.danceLevelDec);
      }
      if (this.lastKeys.lvlCharisma !== kLvlChar) {
        this.lastKeys.lvlCharisma = kLvlChar;
        if (lvlChar instanceof Decimal) this.charismaLevelDec.copyFrom(lvlChar);
        else this.charismaLevelDec.sign = lvlChar;
        this.charismaLevelText = formatWhole(this.charismaLevelDec);
      }

      // 4) Sparkles progress and requirements
      const spVoc = OMG.getSparklesProgress(member, "vocals");
      const spDance = OMG.getSparklesProgress(member, "dance");
      const spChar = OMG.getSparklesProgress(member, "charisma");

      const reqVoc = OMG.getLevelReq(member, "vocals");
      const reqDance = OMG.getLevelReq(member, "dance");
      const reqChar = OMG.getLevelReq(member, "charisma");

      const kSpVoc = decimalKey(spVoc);
      const kSpDance = decimalKey(spDance);
      const kSpChar = decimalKey(spChar);
      const kReqVoc = decimalKey(reqVoc);
      const kReqDance = decimalKey(reqDance);
      const kReqChar = decimalKey(reqChar);

      if (this.lastKeys.sparkVocals !== kSpVoc) {
        this.lastKeys.sparkVocals = kSpVoc;
        if (spVoc instanceof Decimal) this.sparklesVocalsDec.copyFrom(spVoc);
        else this.sparklesVocalsDec.sign = spVoc;
        this.sparklesText.vocals = formatWhole(this.sparklesVocalsDec);
      }
      if (this.lastKeys.sparkDance !== kSpDance) {
        this.lastKeys.sparkDance = kSpDance;
        if (spDance instanceof Decimal) this.sparklesDanceDec.copyFrom(spDance);
        else this.sparklesDanceDec.sign = spDance;
        this.sparklesText.dance = formatWhole(this.sparklesDanceDec);
      }
      if (this.lastKeys.sparkCharisma !== kSpChar) {
        this.lastKeys.sparkCharisma = kSpChar;
        if (spChar instanceof Decimal) this.sparklesCharismaDec.copyFrom(spChar);
        else this.sparklesCharismaDec.sign = spChar;
        this.sparklesText.charisma = formatWhole(this.sparklesCharismaDec);
      }

      if (this.lastKeys.reqVocals !== kReqVoc) {
        this.lastKeys.reqVocals = kReqVoc;
        if (reqVoc instanceof Decimal) this.nextReqVocalsDec.copyFrom(reqVoc);
        else this.nextReqVocalsDec.sign = reqVoc;
        this.nextLevelText.vocals = formatWhole(this.nextReqVocalsDec);
      }
      if (this.lastKeys.reqDance !== kReqDance) {
        this.lastKeys.reqDance = kReqDance;
        if (reqDance instanceof Decimal) this.nextReqDanceDec.copyFrom(reqDance);
        else this.nextReqDanceDec.sign = reqDance;
        this.nextLevelText.dance = formatWhole(this.nextReqDanceDec);
      }
      if (this.lastKeys.reqCharisma !== kReqChar) {
        this.lastKeys.reqCharisma = kReqChar;
        if (reqChar instanceof Decimal) this.nextReqCharismaDec.copyFrom(reqChar);
        else this.nextReqCharismaDec.sign = reqChar;
        this.nextLevelText.charisma = formatWhole(this.nextReqCharismaDec);
      }

      // 5) Gains & Effects (string/HTML) - check if they changed by comparing keys of dependent inputs
      // Gains: OMG.getSparklesGain(member, skill) -> number/Decimal
      const gainVoc = OMG.getSparklesGain(member, "vocals");
      const gainDance = OMG.getSparklesGain(member, "dance");
      const gainChar = OMG.getSparklesGain(member, "charisma");
      const kGainVoc = decimalKey(gainVoc);
      const kGainDance = decimalKey(gainDance);
      const kGainChar = decimalKey(gainChar);

      // store previous keys on lastKeys (reuse req keys object to avoid growing object)
      if (this._lastGainKeys === undefined) this._lastGainKeys = { v: "", d: "", c: "" };
      if (this._lastGainKeys.v !== kGainVoc) {
        this._lastGainKeys.v = kGainVoc;
        this.vocalGainHtml = `(${format(gainVoc)}/s)<br>Allocated Light: ${formatWhole(this.allocatedVocalsDec)}`;
      }
      if (this._lastGainKeys.d !== kGainDance) {
        this._lastGainKeys.d = kGainDance;
        this.danceGainHtml = `(${format(gainDance)}/s)<br>Allocated Light: ${formatWhole(this.allocatedDanceDec)}`;
      }
      if (this._lastGainKeys.c !== kGainChar) {
        this._lastGainKeys.c = kGainChar;
        this.charismaGainHtml = `(${format(gainChar)}/s)<br>Allocated Light: ${formatWhole(this.allocatedCharismaDec)}`;
      }

      // Effects (descriptions) - usually strings; update if changed
      if (this.vocalEffect !== OMG.getSkillDesc(member, "vocals")) this.vocalEffect = OMG.getSkillDesc(member, "vocals");
      if (this.danceEffect !== OMG.getSkillDesc(member, "dance")) this.danceEffect = OMG.getSkillDesc(member, "dance");
      if (this.charismaEffect !== OMG.getSkillDesc(member, "charisma")) this.charismaEffect = OMG.getSkillDesc(member, "charisma");

      // 6) Progress numbers for bars (cheap numeric calc)
      this.vocalProgress = this.calcProgressNum(this.sparklesVocalsDec, this.nextReqVocalsDec);
      this.danceProgress = this.calcProgressNum(this.sparklesDanceDec, this.nextReqDanceDec);
      this.charismaProgress = this.calcProgressNum(this.sparklesCharismaDec, this.nextReqCharismaDec);

      // 7) Can allocate flags (cheap boolean checks)
      this.canAllocate = {
        vocals: this.lightDec.gte(1),
        dance: this.lightDec.gte(1) && OMG.getLevels(member, "vocals").gte(100),
        charisma: this.lightDec.gte(1) && OMG.getLevels(member, "dance").gte(100),
      };

      // Note: we intentionally fetch OMG.getLevels for dance/char checks again because those are cheap and keep UI responsive.
    },

    // Format helper for template compatibility
    format(num) {
      return format(num);
    },

    // Allocation action - not in hot-path heavy
    allocate(stat) {
      const OMG = gameLayers.OMG;
      const member = this.member;
      const light = player.YooAity?.OMGLight?.[member] ?? new Decimal(0);

      // allocate all current light to chosen stat
      // function exists in original file: OMG.allocateAllLight(member, stat, light)
      if (typeof OMG.allocateAllLight === "function") {
        OMG.allocateAllLight(member, stat, light);
      } else {
        // fallback: try calling gameLayers API alternative (best-effort)
        console.warn("allocateAllLight not found on OMG layer");
      }
    },
  },

  mounted() {
    this._boundUpdate = this.onGameUpdate.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this._boundUpdate);
    // initial sync
    this.onGameUpdate();
  },

  beforeUnmount() {
    if (this._boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this._boundUpdate);
  },
};
</script>

<style scoped>
.light {
  width: 600px;         /* fixed width like before */
  flex-shrink: 0;
  text-align: center;
  padding: 15px;
  border-radius: 15px;
  background: linear-gradient(90deg, #ff77e855, #a177ff55, #77d7ff55);
  box-shadow: 0 0 15px rgba(255, 119, 233, 0.5);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill {
  margin: 20px auto;
  width: 600px; /* restore fixed width */
}

.progress-container {
  width: 100%;
  height: 25px; /* original taller bar */
  background-color: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff77e9, #a177ff, #77d7ff);
}

small {
  color: #ccc;
  font-size: 0.85rem;
}

/* 🌸 ALLOCATE BUTTON STYLING */
.allocate-btn {
  background: linear-gradient(90deg, #ff77e9, #a177ff, #77d7ff);
  border: none;
  border-radius: 10px;
  color: white;
  padding: 8px 16px;
  margin-top: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.allocate-btn:hover {
  transform: scale(1.07);
}

/* ✨ DISABLED (Faded Out) */
.allocate-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
</style>
