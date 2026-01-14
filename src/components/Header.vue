<template>
  <div class="header">
    <NewsTicker v-show="newsOn" ref="newsTicker"></NewsTicker>
    <span style="font-size: 30px; cursor: pointer; position: absolute; left: 10px;" @click="openNav()">☰</span>
    <h1>{{ msg }}</h1>
    <div class="prestige-header">
      <PrestigeHeader layerName="YooAmatter"></PrestigeHeader>
      <PrestigeHeader layerName="YooAity"></PrestigeHeader>
    </div>
    <p class="points">
      You have <span ref="points" v-html="points"></span> YooA Points<br>
      <span v-if="pointsPerSec !== ''" v-html="pointsPerSec"></span><br>
      Current Endgame: <span v-html="endgameText"></span>
    </p>
  </div>
</template>

<script>
import { player } from '@/incremental/incremental.js'
import PrestigeHeader from './comps/PrestigeHeader.vue'
import NewsTicker from './NewsTicker.vue'
import { gameLayers } from '@/incremental/layersData';
import { GameCache } from '../incremental/cache';

// cheap key builder for Decimal-like values (works with Break-Infinity & Break-Eternity)
function decimalKey(val) {
  if (val == null) return 'null';
  if (typeof val === 'object') {
    // Break-Eternity style: sign, layer, mag
    if ('sign' in val && 'layer' in val && 'mag' in val) {
      return `be:${val.sign}|${val.layer}|${val.mag}`;
    }
    // Break-Infinity style: mantissa, exponent
    if ('mantissa' in val && 'exponent' in val) {
      return `bi:${val.mantissa}|${val.exponent}`;
    }
    // If it exposes toNumber, use it (cheap relative)
    if (typeof val.toNumber === 'function') {
      try { return `n:${val.toNumber()}`; } catch (e) { return `obj:${String(val)}`; }
    }
    // fallback object identity
    try { return `o:${val.id || val.key || String(val)}`; } catch (e) { return 'obj'; }
  }
  // primitives
  return `p:${String(val)}`;
}

export default {
  name: 'Header',
  props: { msg: String },
  components: { PrestigeHeader, NewsTicker },

  data() {
    return {
      points: '',
      pointsPerSec: '',
      pointsDec: new Decimal(0),
      yooAGainDec: new Decimal(0),
      yooAGainBaseDec: new Decimal(1),
      perSecDec: new Decimal(0),
      // lastKeys kept for compatibility but primary comparators are lastFormatted*
      lastKeys: {
        points: '',
        perSec: '',
        yooAGain: '',
        yooAGainBase: '',
        yooAGainLog: '',
      },
      // store last *formatted* HTML strings so notation changes trigger updates
      lastFormattedPoints: '',
      lastFormattedPerSec: '',
      endgameText: '',
    };
  },

  mounted() {
    // precompute static-ish text
    this.endgameText = colorText("h3", gameLayers.OMG.color, formatWhole(1e3)) + " MIRACLEs";

    // bind update for points
    this.boundUpdate = this.update.bind(this);
    window.addEventListener("GAME_EVENT.UPDATE", this.boundUpdate);

    // initial tick
    this.update();
  },

  computed: {
    newsOn() { return options.news; }
  },

  methods: {
    openNav() {
      const nav = document.getElementById("mySidenav");
      if (nav) nav.style.width = "250px";
    },

    // helper: try multiple safe strategies to compute log_base(a)
    safeLogBaseAsString(a, b) {
      try {
        if (!a || !b) return null;

        // 1) prefer Decimal-native log10 if available (returns Decimal)
        if (typeof a.log10 === 'function' && typeof b.log10 === 'function') {
          try {
            const la = a.log10();
            const lb = b.log10();
            if (la && lb && typeof la.div === 'function') return la.div(lb);
          } catch (e) { /* fallthrough */ }
        }

        // 2) natural logs if available
        if (typeof a.log === 'function' && typeof b.log === 'function') {
          try {
            const la = a.log();
            const lb = b.log();
            if (la && lb && typeof la.div === 'function') return la.div(lb);
          } catch (e) { /* fallthrough */ }
        }

        // 3) safe numeric fallback when toNumber gives finite numbers
        if (typeof a.toNumber === 'function' && typeof b.toNumber === 'function') {
          const na = a.toNumber();
          const nb = b.toNumber();
          if (Number.isFinite(na) && Number.isFinite(nb) && na > 0 && nb > 0) {
            return Math.log10(na) / Math.log10(nb);
          }
        }

        // 4) string fallbacks (show readable representation)
        const sa = (typeof a.toString === 'function') ? a.toString() : String(a);
        const sb = (typeof b.toString === 'function') ? b.toString() : String(b);

        if (/^ee/i.test(sa)) return sa;

        const sciRe = /^([0-9]*\.?[0-9]+)e[+]?(-?\d+)$/i;
        const ma = sa.match(sciRe);
        const mb = sb.match(sciRe);
        if (ma && mb) {
          const mantA = Number(ma[1]) || 1;
          const expA = Number(ma[2]) || 0;
          const mantB = Number(mb[1]) || 1;
          const expB = Number(mb[2]) || 0;
          const val = (expA + Math.log10(mantA)) / (expB + Math.log10(mantB));
          if (Number.isFinite(val)) return val;
        }

        return sa;
      } catch (e) {
        return null;
      }
    },

    // MAIN hot-path update — called every GAME_EVENT.UPDATE
    update() {
      // --- 1) Points (player.YooAPoints) ---
      const srcPoints = player.YooAPoints;
      // compute the formatted HTML *directly* (format accepts Decimal-like)
      let formattedPoints;
      try {
        formattedPoints = colorText("h3", "#d17be2", format(srcPoints));
      } catch (e) {
        // fallback: try formatting the stable buffer
        formattedPoints = colorText("h3", "#d17be2", format(this.pointsDec));
      }

      // If the formatted string changed (e.g. notation changed), update display & copy buffer
      if (formattedPoints !== this.lastFormattedPoints) {
        this.lastFormattedPoints = formattedPoints;

        // copy into stable Decimal buffer (no allocation) for other uses
        if (srcPoints && typeof srcPoints.copyFrom === 'function') {
          try { this.pointsDec.copyFrom(srcPoints); } catch (e) { /* ignore */ }
        } else if (srcPoints && typeof srcPoints.toNumber === 'function') {
          this.pointsDec.sign = srcPoints.toNumber();
        } else {
          this.pointsDec.sign = Number(srcPoints) || 0;
        }

        // update displayed HTML
        this.points = formattedPoints;
      }

      // --- 2) Points per second (player.gain.YooA.points usually a formatted string) ---
      const srcPerSecRaw = (player.gain && player.gain.YooA && player.gain.YooA.points) ? player.gain.YooA.points : '';
      const perSecCacheVal = GameCache.YooAPerSecond?.value;

      if (perSecCacheVal.neq(0)) {
        // Build per-second HTML string fully and compare to lastFormattedPerSec
        let perSecHtml = srcPerSecRaw || '';

        // Celestial Overflow extra line when YooAGain is huge
        const srcYooAGain = GameCache.YooAGain?.value;
        const srcYooABase = GameCache.YooAGainBase?.value;

        // Determine isHuge in a safe way (don't rely solely on decimalKey)
        let isHuge = false;
        try {
          if (srcYooAGain && typeof srcYooAGain.gte === 'function') {
            isHuge = srcYooAGain.gte("ee24");
          } else if (this.yooAGainDec && typeof this.yooAGainDec.gte === 'function') {
            isHuge = this.yooAGainDec.gte("ee24");
          } else {
            isHuge = false;
          }
        } catch (e) {
          isHuge = false;
        }

        if (isHuge) {
          // compute a printable logVal (use safe helper). We compute res (string|number|Decimal).
          let logRes = null;
          try {
            logRes = this.safeLogBaseAsString(srcYooAGain || this.yooAGainDec, srcYooABase || this.yooAGainBaseDec);
          } catch (e) {
            logRes = null;
          }

          // derive printable string
          let printableLog;
          if (logRes == null) {
            printableLog = 'N/A';
          } else if (typeof logRes === 'string') {
            printableLog = logRes;
          } else if (typeof logRes === 'number') {
            printableLog = String(logRes.toFixed(3));
          } else {
            try { printableLog = format(logRes); } catch (e) { printableLog = (logRes && logRes.toString) ? logRes.toString() : 'N/A'; }
          }

          perSecHtml += "<br>Because of YooA's Celestial Overflow, YooA Point gain is ^" +
            colorText("h3", "#d17be2", printableLog);
        }

        // Only update if the final HTML changed (so notation changes are caught)
        if (perSecHtml !== this.lastFormattedPerSec) {
          this.lastFormattedPerSec = perSecHtml;

          // copy relevant Decimals into buffers now that display will change
          try {
            if (srcYooAGain && typeof srcYooAGain.copyFrom === 'function') this.yooAGainDec.copyFrom(srcYooAGain);
            else if (srcYooAGain && typeof srcYooAGain.toNumber === 'function') this.yooAGainDec.sign = srcYooAGain.toNumber();
          } catch (e) { /* ignore */ }

          try {
            if (srcYooABase && typeof srcYooABase.copyFrom === 'function') this.yooAGainBaseDec.copyFrom(srcYooABase);
            else if (srcYooABase && typeof srcYooABase.toNumber === 'function') this.yooAGainBaseDec.sign = srcYooABase.toNumber();
          } catch (e) { /* ignore */ }

          this.pointsPerSec = perSecHtml;
        }
      }
      // note: we intentionally do not try to micro-opt the intermediate string building more heavily.
      // formatting/notation changes should be relatively rare and this keeps logic simple & correct.
    },
  },

  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
  },
}
</script>

<style scoped>
p.points {
  font-size: 20pt;
}

div.prestige-header {
  display: inline-block;
}
</style>
