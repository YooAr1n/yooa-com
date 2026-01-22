<template>
  <div class="tabs-container">
    <div class="tabs">
      <button :class="{ active: subtab === 'main' }" @click="changeTab('YooAity', 'main')">Main</button>
      <button v-if="uiCache.upgradeUnlocked" :class="{ active: subtab === 'upgrade' }"
        @click="changeTab('YooAity', 'upgrade')">Upgrades</button>
      <button :class="{ active: subtab === 'milestone' }" @click="changeTab('YooAity', 'milestone')">Milestones</button>
      <button v-if="uiCache.SeungheeUnlocked" :class="{ active: subtab === 'seunghee' }"
        @click="changeTab('YooAity', 'seunghee')">Seunghee</button>
      <button v-if="uiCache.YubinUnlocked" :class="{ active: subtab === 'yubin' }"
        @click="changeTab('YooAity', 'yubin')">Yubin</button>
      <button v-if="uiCache.HyojungUnlocked" :class="{ active: subtab === 'hyojung' }"
        @click="changeTab('YooAity', 'hyojung')">Hyojung</button>
      <button v-if="uiCache.MimiUnlocked" :class="{ active: subtab === 'mimi' }"
        @click="changeTab('YooAity', 'mimi')">Mimi</button>
      <button v-if="uiCache.OMGUnlocked" :class="{ active: subtab === 'omg' }" @click="changeTab('YooAity', 'omg')">OH
        MY
        GIRL</button>
      <button v-if="uiCache.FandomUnlocked" :class="{ active: subtab === 'fandom' }"
        @click="changeTab('YooAity', 'fandom')">Fandom</button>
    </div>

    <!-- MAIN -->
    <div v-if="subtab === 'main'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.YooAEssenceText"></span> YooA Essence</div>
      <br />
      <div class="efftext">You have <span v-html="uiCache.EmberText"></span> Shi-ah Embers, which boosts YooA Points and
        YooA
        Dimensions by x<span v-html="uiCache.emberEffect"></span>, and adds <span v-html="uiCache.effectiveUpgs"></span>
        effective
        'YooA Challenge' (YU 11) levels (no added digits) (Next at <span v-html="uiCache.nextAt"></span> Shi-ah Embers)
      </div>

      <br />
      <div class="efftext" v-if="uiCache.birthUnlocked">YooA (Yoo <span v-html="uiCache.name"></span>) is <span
          v-html="uiCache.ageText"></span> (starts at {{ formatNum(1e250) }} Shi-ah Embers), which boosts Shi-ah Echoes by x<span
          v-html="uiCache.ageEffect"></span><br /><span v-html="uiCache.dateText"></span></div>

      <br />
      <div v-if="uiCache.mathUnlocked">
        <div class="efftext">You have <span v-html="uiCache.YooChroniumText"></span> YooChronium (+{{
          uiCache.YooChroniumGainDisplay }}/solve), which boosts YooA aging speed by x<span
            v-html-stable="uiCache.YooChroniumEffect0"></span> and YooAmatter math problem gain by x<span
            v-html="uiCache.YooChroniumEffect1"></span><br><span>Effect Formula: (x + {{ format1 }})<sup>{{
              formatNum(0.4) }}</sup> to aging speed, (x +
            {{ format1 }})<sup>{{ uiCache.YooChroniumExp }}</sup> to YooAmatter math problems</span></div>
        <br />
        <h3>You have solved {{ uiCache.solved }} math problems. (+{{ uiCache.problemGain }}/solve)</h3>
        <MathProblem layerName="YooAity" refName="YooAityMath" />
        <br />
      </div>

      <h3>Echo costs increase faster at Level <span v-html="uiCache.scalingStart"></span></h3>
      <br />
      <h3 v-html="uiCache.dimMultDisp"></h3>
      <br />
      <button v-if="uiCache.maxAllUnlocked" class="max" @click="maxAllEchoes">Max All Echoes (A)</button>

      <Dimension v-for="dim in uiCache.unlockedDimensions" :key="dim.id" :dimension="dim"
        :canAfford="canAffordDimension(dim)" :dimGain="dimensionGain(dim)" :allDimensions="uiCache.allDimensions"
        :maxUnlocked="uiCache.maxAllUnlocked" />
    </div>

    <!-- rest of tabs unchanged -->
    <div v-if="subtab === 'upgrade'" class="tab-content">
      <button v-if="uiCache.maxYEUnlocked" class="max" @click="maxAllYEUpgrades">Max All YooAity Upgrades (A)</button>
      <UpgradeGrid layerName="YooAity" />
    </div>

    <div v-if="subtab === 'milestone'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.TranscensionsText"></span> Transcensions</div>
      <br />
      <Milestones layer="YooAity" />
    </div>

    <div v-if="subtab === 'seunghee'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.SeungheeText"></span> Seunghee Points <span>{{
        uiCache.SeungheeGain }}</span>, which boost YooA Points by ^<span v-html="uiCache.SeungheeEffect0"></span> and
        YooChronium gain by x<span v-html="uiCache.SeungheeEffect1"></span></div>
      <br />
      <div class="efftext" v-if="uiCache.expUnlocked">Because of 'Petal Prism Ascension' (SH 21), your effective
        Seunghee
        Point gain is ^<span v-html="uiCache.SeungheeExp"></span>, which makes a doubling effectively x<span
          v-html="uiCache.SeungheeDouble"></span></div>
      <div class="efftext">You have <span v-html="uiCache.YooChroniumText"></span> YooChronium <span>{{ uiCache.ycGain
          }}</span></div>
      <button v-if="uiCache.maxOM1Unlocked" class="max" @click="maxAllSHUpgrades">Max All Seunghee Upgrades (A)</button>
      <UpgradeGrid layerName="Seunghee" />
    </div>

    <div v-if="subtab === 'yubin'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.YubinText"></span> Yubin Points <span>{{ uiCache.YubinGain
          }}</span>,
        which boost YooA Points by ^<span v-html="uiCache.YubinEffect0"></span> and Seunghee Point gain by x<span
          v-html="uiCache.YubinEffect1"></span></div>
      <br />
      <div class="efftext" v-if="uiCache.YubinExpUnlocked">Because of 'Prismatic Bloom' (YB 21), your effective Yubin
        Point
        gain is ^<span v-html="uiCache.YubinExp"></span>, which makes a doubling effectively x<span
          v-html="uiCache.YubinDouble"></span></div>
      <div class="efftext">You have <span v-html="uiCache.YooChroniumText"></span> YooChronium <span>{{ uiCache.ycGain
          }}</span></div>
      <button v-if="uiCache.maxOM1Unlocked" class="max" @click="maxAllYBUpgrades">Max All Yubin Upgrades (A)</button>
      <UpgradeGrid layerName="Yubin" />
    </div>

    <div v-if="subtab === 'hyojung'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.HyojungText"></span> Hyojung Points <span>{{
        uiCache.HyojungGain }}</span>, which boost YooA Points by ^<span v-html="uiCache.HyojungEffect0"></span> and
        Arinium gain by x<span v-html="uiCache.HyojungEffect1"></span></div>
      <br />
      <div class="efftext">You have <span v-html="uiCache.ArinText"></span> Arinium <span>{{ uiCache.arGain }}</span>
      </div>
      <button v-if="uiCache.maxOM2Unlocked" class="max" @click="maxAllHJUpgrades">Max All Hyojung Upgrades (A)</button>
      <UpgradeGrid layerName="Hyojung" />
    </div>

    <div v-if="subtab === 'mimi'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.MimiText"></span> Mimi Points <span>{{ uiCache.MimiGain
          }}</span>, which boost YooA Points by ^<span v-html="uiCache.MimiEffect0"></span> and Hyojung Point gain by
        x<span v-html="uiCache.MimiEffect1"></span></div>
      <br />
      <div class="efftext">You have <span v-html="uiCache.ArinText"></span> Arinium <span>{{ uiCache.arGain }}</span>
      </div>
      <button v-if="uiCache.maxOM2Unlocked" class="max" @click="maxAllMMUpgrades">Max All Mimi Upgrades (A)</button>
      <UpgradeGrid layerName="Mimi" />
    </div>

    <div v-if="subtab === 'omg'" class="tab-content">
      <div class="efftext">You have <span v-html="uiCache.MiracleText"></span> Miracle Light<sup
          v-html="uiCache.MiracleExp"></sup> <span>{{ uiCache.MiracleLightGain }}</span> (based on all members' lights),
        which
        boosts all members' points by x<span v-html="uiCache.MiracleEffect0"></span> and Ascension gain by ^<span
          v-html="uiCache.MiracleEffect1"></span></div>
      <div class="efftext">OH MY GIRL has <span v-html="uiCache.FanText"></span> MIRACLEs, which
        boosts all members' lights by x<span v-html="uiCache.FanEffect0"></span> and their boost to Miracle Light gain
        by ^<span v-html="uiCache.FanEffect1"></span></div>
      <div class="light-cards">
        <Light member="YooA" />
        <Light v-if="uiCache.ArinTrainingUnlocked" member="Arin" />
        <Light v-if="uiCache.SeungheeTrainingUnlocked" member="Seunghee" />
      </div>
      <UpgradeGrid layerName="OMG" />
    </div>
  </div>
</template>

<script>
import UpgradeGrid from "./comps/UpgradeGrid.vue";
import Milestones from "./comps/Milestones.vue";
import Dimension from "./comps/Dimension.vue";
import MathProblem from "./comps/MathProblem.vue";
import Light from "./comps/Light.vue";
import { gameLayers } from "@/incremental/layersData";
import { getDimMultPerLvl, getScalingStart } from "@/incremental/dimensions";
import { buyUpgrade, buyMaxUpgrade, hasMilestone, hasUpgrade } from "@/incremental/mainFuncs";
import { hasAchievement, maxAllDimensions } from "@/incremental/incremental";

/* -------------------------
   Helpers (cheap, hot-path-safe)
   ------------------------- */

// cheap key builder for Decimal-like values (works for Break-Eternity and Break-Infinity)
function cheapKey(v) {
  if (v == null) return "null";
  if (typeof v === "object") {
    if ("sign" in v && "layer" in v && "mag" in v) return `be:${v.sign}|${v.layer}|${v.mag}`;
    if ("mantissa" in v && "exponent" in v) return `bi:${v.mantissa}|${v.exponent}`;
    if (typeof v.toNumber === "function") return `n:${v.toNumber()}`;
    // fallback identify object by id/name if available
    try { return `o:${v.id || v.key || String(v)}`; } catch (e) { return "obj"; }
  }
  return `p:${String(v)}`;
}

function applyUpgrades(layer, keys, fn) { for (let i = 0; i < keys.length; ++i) fn(layer, keys[i]); }
let YE_KEYS, SH_KEYS, YB_KEYS, HJ_KEYS, MM_KEYS;
function makeKeys(layer) {
  const g = gameLayers[layer] && gameLayers[layer].upgrades;
  if (!g) return [];
  return Object.keys(g).filter(k => g[k].title);
}
function getYEKeys() { if (YE_KEYS) return YE_KEYS; YE_KEYS = makeKeys('YooAity'); return YE_KEYS; }
function getSHKeys() { if (SH_KEYS) return SH_KEYS; SH_KEYS = makeKeys('Seunghee'); return SH_KEYS; }
function getYBKeys() { if (YB_KEYS) return YB_KEYS; YB_KEYS = makeKeys('Yubin'); return YB_KEYS; }
function getHJKeys() { if (HJ_KEYS) return HJ_KEYS; HJ_KEYS = makeKeys('Hyojung'); return HJ_KEYS; }
function getMMKeys() { if (MM_KEYS) return MM_KEYS; MM_KEYS = makeKeys('Mimi'); return MM_KEYS; }

export function buyAllYEUpgrades() { applyUpgrades('YooAity', getYEKeys(), buyUpgrade); }
export function buyAllSHUpgrades() { applyUpgrades('Seunghee', getSHKeys(), buyUpgrade); }
export function buyAllYBUpgrades() { applyUpgrades('Yubin', getYBKeys(), buyUpgrade); }
export function buyAllHJUpgrades() { applyUpgrades('Hyojung', getHJKeys(), buyUpgrade); }
export function buyAllMMUpgrades() { applyUpgrades('Mimi', getMMKeys(), buyUpgrade); }
export function maxAllYEUpgrades() { applyUpgrades('YooAity', getYEKeys(), buyMaxUpgrade); }
export function maxAllSHUpgrades() { applyUpgrades('Seunghee', getSHKeys(), buyMaxUpgrade); }
export function maxAllYBUpgrades() { applyUpgrades('Yubin', getYBKeys(), buyMaxUpgrade); }
export function maxAllHJUpgrades() { applyUpgrades('Hyojung', getHJKeys(), buyMaxUpgrade); }
export function maxAllMMUpgrades() { applyUpgrades('Mimi', getMMKeys(), buyMaxUpgrade); }

export default {
  name: 'YooAity',
  components: { UpgradeGrid, Milestones, Dimension, MathProblem, Light },

  data() {
    return {
      subtab: 'main',
      tick: 0,

      // UI cache (strings & simple values for template)
      uiCache: {
        // formatted strings
        YooAEssenceText: '',
        EmberText: '',
        YooChroniumText: '',
        ArinText: '',
        TranscensionsText: '',
        SeungheeText: '',
        YubinText: '',
        HyojungText: '',
        MimiText: '',
        MiracleText: '',
        FanText: '',
        MiracleExp: '',
        // numeric strings
        solved: '',
        problemGain: '',
        YooChroniumGainDisplay: '',
        YooChroniumExp: '',
        ycGain: 0,
        arGain: 0,
        // heavier strings
        emberEffect: '',
        ageEffect: '',
        effectiveUpgs: '',
        nextAt: '',
        YooChroniumEffect0: '',
        YooChroniumEffect1: '',
        SeungheeEffect0: '',
        SeungheeEffect1: '',
        SeungheeExp: '',
        SeungheeDouble: '',
        YubinEffect0: '',
        YubinEffect1: '',
        YubinExp: '',
        YubinDouble: '',
        HyojungEffect0: '',
        HyojungEffect1: '',
        MimiEffect0: '',
        MimiEffect1: '',
        MiracleEffect0: '',
        MiracleEffect1: '',
        FanEffect0: '',
        FanEffect1: '',
        dimMultDisp: '',
        scalingStart: '',
        ageText: '',
        dateText: '',
        name: '',
        allDimensions: [],
        unlockedDimensions: [],
        // flags
        upgradeUnlocked: false,
        birthUnlocked: false,
        mathUnlocked: false,
        maxAllUnlocked: false,
        maxYEUnlocked: false,
        maxOM1Unlocked: false,
        maxOM2Unlocked: false,
        SeungheeUnlocked: false,
        YubinUnlocked: false,
        HyojungUnlocked: false,
        MimiUnlocked: false,
        OMGUnlocked: false,
        expUnlocked: false,
        YubinExpUnlocked: false,
        ArinTrainingUnlocked: false,
        SeungheeTrainingUnlocked: false,
        // direct numeric getters used in templates
        YooChroniumGain: '',
        SeungheeGain: 0,
        YubinGain: 0,
        HyojungGain: 0,
        MimiGain: 0,
        MiracleLightGain: 0,
      },

      // stable Decimal buffers and lastKeys for cheap change detection
      uiBuf: {
        YooAAmount: null,
        EmberAmount: null,
        YooChronium: null,
        SeungheeAmount: null,
        YubinAmount: null,
        HyojungAmount: null,
        MimiAmount: null,
        solved: null,
        lastKeys: {},
      },

      // bound handler reference
      boundUpdate: null,
    };
  },

  computed: {
    format1() { return format(1); }
  },

  methods: {
    // color wrapper (cheap)
    fmtColor(layerName, text) {
      const color = (gameLayers[layerName] && gameLayers[layerName].color) || '#ffffff';
      return colorText('h3', color, text);
    },

    // hot-path update (called often). Uses cheapKey + copyFrom buffers to avoid allocations.
    update() {
      // increment tick so any computed depending on it updates if needed
      this.tick++;

      const gl = gameLayers;
      const p = player;
      this.subtab = p.subtabs["YooAity"];

      // small local to avoid repeated lookups
      const last = this.uiBuf.lastKeys;

      // build keys for the small set of frequently-changing values
      const kYooA = cheapKey(p.YooAity?.amount ?? p.YooAity?.YooA ?? 0);
      const kEmber = cheapKey(p.YooAity?.embers ?? 0);
      const kYooChron = cheapKey(gl.YooAity.getYooChroniumGain ? gl.YooAity.getYooChroniumGain() : (p.YooAity?.YooChronium ?? 0));
      const kSolved = cheapKey(p.math?.YooAity?.solved ?? 0);

      // YooA amount
      if (kYooA !== last.YooA_amt) {
        last.YooA_amt = kYooA;
        // use buffer & copyFrom when available
        if (!this.uiBuf.YooAAmount) this.uiBuf.YooAAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const src = p.YooAity?.amount ?? p.YooAity?.YooA ?? 0;
        if (this.uiBuf.YooAAmount && src && typeof src.copyFrom === 'function') this.uiBuf.YooAAmount.copyFrom(src);
        else if (this.uiBuf.YooAAmount && typeof src.toNumber === 'function') this.uiBuf.YooAAmount.sign = src.toNumber();
        else if (this.uiBuf.YooAAmount) this.uiBuf.YooAAmount.sign = Number(src) || 0;

        this.uiCache.YooAEssenceText = this.fmtColor('YooAity', formatWhole(this.uiBuf.YooAAmount));
      }

      // Embers and ember-derived things
      if (kEmber !== last.Ember) {
        last.Ember = kEmber;
        if (!this.uiBuf.EmberAmount) this.uiBuf.EmberAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const srcEm = p.YooAity?.embers ?? 0;
        if (this.uiBuf.EmberAmount && srcEm && typeof srcEm.copyFrom === 'function') this.uiBuf.EmberAmount.copyFrom(srcEm);
        else if (this.uiBuf.EmberAmount && typeof srcEm.toNumber === 'function') this.uiBuf.EmberAmount.sign = srcEm.toNumber();
        else if (this.uiBuf.EmberAmount) this.uiBuf.EmberAmount.sign = Number(srcEm) || 0;

        this.uiCache.EmberText = this.fmtColor('YooAity', formatWhole(this.uiBuf.EmberAmount));
        this.uiCache.emberEffect = this.fmtColor('YooAity', format(gl.YooAity.ShiahEmberEffect()));
        this.uiCache.effectiveUpgs = this.fmtColor('YooAity', formatWhole(gl.YooAity.getEffectiveUpgs()));
        this.uiCache.nextAt = this.fmtColor('YooAity', format(gl.YooAity.getNextUpgAt()));
      }

      // YooChronium related
      if (kYooChron !== last.YooChron) {
        last.YooChron = kYooChron;
        const yc = gl.YooAity.getYooChroniumGain();
        // buffer not strictly necessary here — format the result once
        this.uiCache.YooChroniumText = this.fmtColor('YooAity', format(yc));
        this.uiCache.YooChroniumGainDisplay = format(yc);
        this.uiCache.YooChroniumGainRaw = yc;
        const ycEff = gl.YooAity.getYooChroniumEffect();
        this.uiCache.YooChroniumEffect0 = this.fmtColor('YooAity', format(ycEff[0]));
        if (ycEff[0] && typeof ycEff[0].gte === 'function' && ycEff[0].gte("e400")) this.uiCache.YooChroniumEffect0 += softcapText("(softcapped)");
        this.uiCache.YooChroniumEffect1 = this.fmtColor('YooAity', format(ycEff[1]));
        this.uiCache.YooChroniumExp = format(gl.YooAity.getYooChroniumEffectExp()[1]);
      }

      // solved & problemGain
      if (kSolved !== last.solved) {
        last.solved = kSolved;
        if (!this.uiBuf.solved) this.uiBuf.solved = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const ssrc = p.math?.YooAity?.solved ?? 0;
        if (this.uiBuf.solved && ssrc && typeof ssrc.copyFrom === 'function') this.uiBuf.solved.copyFrom(ssrc);
        else if (this.uiBuf.solved && typeof ssrc.toNumber === 'function') this.uiBuf.solved.sign = ssrc.toNumber();
        else if (this.uiBuf.solved) this.uiBuf.solved.sign = Number(ssrc) || 0;

        this.uiCache.solved = formatWhole(this.uiBuf.solved);
        this.uiCache.problemGain = format(gl.YooAity.problemGain());
      }

      // --- add this inside update(), after "solved & problemGain" block ---

      // --- member points using copyFrom buffers (AD-style) ---
      const seRaw = p.YooAity?.SeungheePoints ?? p.YooAity?.Seunghee ?? 0;
      const ybRaw = p.YooAity?.YubinPoints ?? p.YooAity?.Yubin ?? 0;
      const hjRaw = p.YooAity?.HyojungPoints ?? p.YooAity?.Hyojung ?? 0;
      const mmRaw = p.YooAity?.MimiPoints ?? p.YooAity?.Mimi ?? 0;

      const kSePts = cheapKey(seRaw);
      const kYbPts = cheapKey(ybRaw);
      const kHjPts = cheapKey(hjRaw);
      const kMmPts = cheapKey(mmRaw);

      if (kSePts !== last.SePoints) {
        last.SePoints = kSePts;
        if (!this.uiBuf.SeungheeAmount) this.uiBuf.SeungheeAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const src = seRaw;
        if (this.uiBuf.SeungheeAmount && src && typeof src.copyFrom === 'function') this.uiBuf.SeungheeAmount.copyFrom(src);
        else if (this.uiBuf.SeungheeAmount && typeof src.toNumber === 'function') this.uiBuf.SeungheeAmount.sign = src.toNumber();
        else if (this.uiBuf.SeungheeAmount) this.uiBuf.SeungheeAmount.sign = Number(src) || 0;
        this.uiCache.SeungheeText = this.fmtColor('Seunghee', format(this.uiBuf.SeungheeAmount ?? src));
      }

      if (kYbPts !== last.YbPoints) {
        last.YbPoints = kYbPts;
        if (!this.uiBuf.YubinAmount) this.uiBuf.YubinAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const src = ybRaw;
        if (this.uiBuf.YubinAmount && src && typeof src.copyFrom === 'function') this.uiBuf.YubinAmount.copyFrom(src);
        else if (this.uiBuf.YubinAmount && typeof src.toNumber === 'function') this.uiBuf.YubinAmount.sign = src.toNumber();
        else if (this.uiBuf.YubinAmount) this.uiBuf.YubinAmount.sign = Number(src) || 0;
        this.uiCache.YubinText = this.fmtColor('Yubin', format(this.uiBuf.YubinAmount ?? src));
      }

      if (kHjPts !== last.HjPoints) {
        last.HjPoints = kHjPts;
        if (!this.uiBuf.HyojungAmount) this.uiBuf.HyojungAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const src = hjRaw;
        if (this.uiBuf.HyojungAmount && src && typeof src.copyFrom === 'function') this.uiBuf.HyojungAmount.copyFrom(src);
        else if (this.uiBuf.HyojungAmount && typeof src.toNumber === 'function') this.uiBuf.HyojungAmount.sign = src.toNumber();
        else if (this.uiBuf.HyojungAmount) this.uiBuf.HyojungAmount.sign = Number(src) || 0;
        this.uiCache.HyojungText = this.fmtColor('Hyojung', format(this.uiBuf.HyojungAmount ?? src));
      }

      if (kMmPts !== last.MmPoints) {
        last.MmPoints = kMmPts;
        if (!this.uiBuf.MimiAmount) this.uiBuf.MimiAmount = (typeof Decimal !== 'undefined') ? new Decimal(0) : null;
        const src = mmRaw;
        if (this.uiBuf.MimiAmount && src && typeof src.copyFrom === 'function') this.uiBuf.MimiAmount.copyFrom(src);
        else if (this.uiBuf.MimiAmount && typeof src.toNumber === 'function') this.uiBuf.MimiAmount.sign = src.toNumber();
        else if (this.uiBuf.MimiAmount) this.uiBuf.MimiAmount.sign = Number(src) || 0;
        this.uiCache.MimiText = this.fmtColor('Mimi', format(this.uiBuf.MimiAmount ?? src));
      }

      // age-related heavy objects — compute only when effective age changes
      const ageKey = cheapKey(gl.YooAity.getEffectiveAge ? gl.YooAity.getEffectiveAge() : 0);
      if (ageKey !== last.ageKey) {
        last.ageKey = ageKey;
        this.uiCache.ageEffect = this.fmtColor('YooAity', format(gl.YooAity.getAgeEffect()));
        this.uiCache.ageText = this.fmtColor('YooAity', formatTime(gl.YooAity.getEffectiveAge(), 3)) + " old (" + this.fmtColor('YooAity', formatTime(gl.YooAity.getAgeEffGain(), 3)) + "/s)";
        try {
          const bd = new Date('1995-09-17T00:00:00Z');
          const sec = (gl.YooAity.getEffectiveAge && typeof gl.YooAity.getEffectiveAge === 'function') ? gl.YooAity.getEffectiveAge().toNumber() : 0;
          bd.setSeconds(bd.getSeconds() + sec);
          this.uiCache.dateText = "Date: " + this.fmtColor('YooAity', bd.toLocaleString('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }));
        } catch (e) {
          this.uiCache.dateText = this.fmtColor('YooAity', 'Date N/A');
        }
        this.uiCache.name = hasUpgrade('YooAity', 55) ? 'Shi-ah' : 'Yeon-joo';
      }

      // Seunghee group (compute when their effect inputs change)
      const sEffKey = cheapKey(gl.YooAity.getSeungheeEffect ? gl.YooAity.getSeungheeEffect() : 0);
      if (sEffKey !== last.sEffKey) {
        last.sEffKey = sEffKey;
        const sEff = gl.YooAity.getSeungheeEffect();
        this.uiCache.SeungheeEffect0 = this.fmtColor('Seunghee', format(sEff[0]));
        this.uiCache.SeungheeEffect1 = this.fmtColor('Seunghee', format(sEff[1]));
        const seExp = (gl.Seunghee && gl.Seunghee.upgrades && gl.Seunghee.upgrades[21] && typeof gl.Seunghee.upgrades[21].gainExp === 'function')
          ? gl.Seunghee.upgrades[21].gainExp() : 1;
        this.uiCache.SeungheeExp = this.fmtColor('Seunghee', format(seExp));
        this.uiCache.SeungheeDouble = this.fmtColor('Seunghee', format((seExp && seExp.pow2) ? seExp.pow2() : (typeof seExp === 'object' && typeof seExp.toNumber === 'function' ? (seExp.toNumber() * 2) : (seExp * 2))));
      }

      // Yubin
      const ybKey = cheapKey(gl.YooAity.getYubinEffect ? gl.YooAity.getYubinEffect() : 0);
      if (ybKey !== last.ybKey) {
        last.ybKey = ybKey;
        const ybEff = gl.YooAity.getYubinEffect();
        this.uiCache.YubinEffect0 = this.fmtColor('Yubin', format(ybEff[0]));
        this.uiCache.YubinEffect1 = this.fmtColor('Yubin', format(ybEff[1]));
        try {
          // Decimal ops wrapped defensively
          const ybExp = Decimal.sub(1, gl.Yubin.upgrades[21].exp()).recip();
          this.uiCache.YubinExp = this.fmtColor('Yubin', format(ybExp));
          this.uiCache.YubinDouble = this.fmtColor('Yubin', format(ybExp.pow2()));
        } catch (e) {
          this.uiCache.YubinExp = this.fmtColor('Yubin', '1');
          this.uiCache.YubinDouble = this.fmtColor('Yubin', '2');
        }
      }

      // Hyojung / Mimi / OMG groups
      const hjKey = cheapKey(gl.YooAity.getHyojungEffect ? gl.YooAity.getHyojungEffect() : 0);
      if (hjKey !== last.hjKey) {
        last.hjKey = hjKey;
        const hEff = gl.YooAity.getHyojungEffect();
        this.uiCache.HyojungEffect0 = this.fmtColor('Hyojung', format(hEff[0]));
        this.uiCache.HyojungEffect1 = this.fmtColor('Hyojung', format(hEff[1]));
      }

      const mmKey = cheapKey(gl.YooAity.getMimiEffect ? gl.YooAity.getMimiEffect() : 0);
      if (mmKey !== last.mmKey) {
        last.mmKey = mmKey;
        const mEff = gl.YooAity.getMimiEffect();
        this.uiCache.MimiEffect0 = this.fmtColor('Mimi', format(mEff[0]));
        this.uiCache.MimiEffect1 = this.fmtColor('Mimi', format(mEff[1]));
      }

      const mirKey = cheapKey(gl.OMG.getMiracleLightEffect ? gl.OMG.getMiracleLightEffect() : 0);
      if (mirKey !== last.mirKey) {
        last.mirKey = mirKey;
        const mirEff = gl.OMG.getMiracleLightEffect();
        this.uiCache.MiracleEffect0 = this.fmtColor('OMG', format(mirEff[0]));
        this.uiCache.MiracleEffect1 = this.fmtColor('OMG', format(mirEff[1]));
        const fanEff = gl.OMG.getMIRACLEEffect();
        this.uiCache.FanEffect0 = this.fmtColor('OMG', format(fanEff[0]));
        this.uiCache.FanEffect1 = this.fmtColor('OMG', format(fanEff[1]));
      }

      // static-ish per-tick cheap values
      this.uiCache.dimMultDisp = `Echo Multiplier per level: x${format(getDimMultPerLvl('Shiah', 1), 3)}`;
      this.uiCache.scalingStart = format(getScalingStart('Shiah'));

      // dimensions: only rebuild unlockedDimensions array if IDs change
      const allDims = p.dimensions?.Shiah ?? [];
      this.uiCache.allDimensions = allDims;
      const unlockedIds = allDims.map(d => d.unlocked ? d.id : '').join(',');
      if (unlockedIds !== last.unlockedIds) {
        last.unlockedIds = unlockedIds;
        this.uiCache.unlockedDimensions = allDims.filter(d => d.unlocked);
      }

      // flags/unlocks (cheap booleans)
      this.uiCache.upgradeUnlocked = hasMilestone('YooAity', 2);
      this.uiCache.birthUnlocked = hasUpgrade('YooAity', 25);
      this.uiCache.mathUnlocked = hasMilestone('YooAity', 12);
      this.uiCache.maxAllUnlocked = hasMilestone('YooAity', 14);
      this.uiCache.maxYEUnlocked = hasUpgrade('YooAity', 44);
      this.uiCache.maxOM1Unlocked = hasAchievement(63);
      this.uiCache.maxOM2Unlocked = hasUpgrade('YooAity', 54);
      this.uiCache.SeungheeUnlocked = hasMilestone('YooAity', 16);
      this.uiCache.YubinUnlocked = hasMilestone('YooAity', 17);
      this.uiCache.HyojungUnlocked = hasMilestone('YooAity', 19);
      this.uiCache.MimiUnlocked = hasMilestone('YooAity', 20);
      this.uiCache.OMGUnlocked = hasUpgrade('YooAity', 55);
      this.uiCache.expUnlocked = hasUpgrade('Seunghee', 21);
      this.uiCache.YubinExpUnlocked = hasUpgrade('Yubin', 21);
      this.uiCache.ArinTrainingUnlocked = hasMilestone('YooAity', 24);
      this.uiCache.SeungheeTrainingUnlocked = hasMilestone('YooAity', 27);

      // small numeric getters used in templates
      this.uiCache.YooChroniumGain = this.uiCache.YooChroniumGainDisplay;
      this.uiCache.ycGain = p.gain?.YooAity?.YooChronium ?? 0;
      this.uiCache.arGain = p.gain?.Arin?.Arinium ?? 0;
      this.uiCache.SeungheeGain = p.gain?.YooAity?.SeungheePoints ?? 0;
      this.uiCache.YubinGain = p.gain?.YooAity?.YubinPoints ?? 0;
      this.uiCache.HyojungGain = p.gain?.YooAity?.HyojungPoints ?? 0;
      this.uiCache.MimiGain = p.gain?.YooAity?.MimiPoints ?? 0;
      this.uiCache.MiracleLightGain = p.gain?.YooAity?.MiracleLight ?? 0;

      // some small display strings
      this.uiCache.TranscensionsText = this.fmtColor('YooAity', formatWhole(p.stats?.YooAity?.resets ?? 0));
      this.uiCache.ArinText = this.fmtColor('Arinium', format(p.Arin?.Arinium ?? 0));
      this.uiCache.MiracleText = this.fmtColor('OMG', format(p.YooAity?.MiracleLight ?? 0));
      this.uiCache.FanText = this.fmtColor('OMG', formatWhole(gl.OMG.getMIRACLEs()));
      this.uiCache.MiracleExp = this.fmtColor('OMG', format(gl.OMG.getMiracleLightExp()));
    },

    formatNum(n) { return format(n); },
    maxAllYEUpgrades() { maxAllYEUpgrades(); },
    maxAllSHUpgrades() { maxAllSHUpgrades(); },
    maxAllYBUpgrades() { maxAllYBUpgrades(); },
    maxAllHJUpgrades() { maxAllHJUpgrades(); },
    maxAllMMUpgrades() { maxAllMMUpgrades(); },
    maxAllEchoes() { maxAllDimensions('Shiah'); },

    changeTab(tabName, sub) {
      player.tab = tabName;
      player.subtabs[tabName] = sub;
    },

    canAffordDimension(d) { const curr = d.layer === '' ? player.YooAPoints : (player[d.layer] && player[d.layer][d.currency]); return curr?.gte(d.cost) ?? false; },
    dimensionGain(d) { return player.gain?.[d.type]?.dimensions?.[d.tier - 1] ?? 'N/A'; }
  },

  mounted() {
    // bind once and keep cheap onGameUpdate
    this.boundUpdate = this.update.bind(this);
    window.addEventListener('GAME_EVENT.UPDATE', this.boundUpdate);

    // initial sync
    this.update();
  },

  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener('GAME_EVENT.UPDATE', this.boundUpdate);
  }
};
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #230085;
  color: #a585ff;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
  transition: background-color .2s ease, color .2s ease;
}

.tabs button.active {
  background-color: #a585ff;
  color: #230085;
}

.tab-content {
  width: 100%;
}

.efftext {
  font-size: 16pt;
}

button.max {
  padding: 8px 16px;
  background-color: #d17be2;
  color: #b9e5ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.max:hover {
  background-color: #b86cc3;
}

.light-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
