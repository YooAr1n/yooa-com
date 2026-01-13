<!-- src/components/comps/Autobuyer.vue -->
<template>
  <div class="autobuyer">
    <h3>{{ label }} Autobuyer</h3>

    <p>Interval: <span v-text="interval"></span></p>
    <p>Auto: <span v-text="auto"></span></p>

    <button @click="toggleAuto" :style="autoStyle" :aria-pressed="auto === 'ON'">
      {{ auto === 'ON' ? 'Turn Off' : 'Turn On' }}
    </button>

    <button @click="toggleMode" :style="modeStyle">
      {{ autobuyerMode }}
    </button>

    <div v-if="showPrestiger" class="prestiger-input">
      <label :for="inputId" v-text="prestigerLabel"></label>
      <input
        :id="inputId"
        type="text"
        @change="updateAmount"
        :placeholder="prestigerPlaceholder"
        v-model="inputValue"
      />
    </div>
  </div>
</template>

<script>
import Decimal from '@/incremental/break_eternity.js' // your Decimal lib

export default {
  name: 'Autobuyer',
  props: {
    label: { type: String, required: true },
    autobuyer: { type: Object, required: true },
    playerAutobuyer: { type: Object, required: true },
  },

  data() {
    // pre-create style objects to avoid allocation each tick
    const STYLE_ON = { backgroundColor: '#e11d48' }   // e.g. red for active single
    const STYLE_OK = { backgroundColor: '#10b981' }   // green for good states
    return {
      // displayed strings (only updated when keys change)
      interval: '',
      auto: '',
      autobuyerType: '',
      autobuyerMode: '',
      autoStyle: STYLE_OK,
      modeStyle: STYLE_OK,
      prestigerLabel: '',
      prestigerPlaceholder: '',
      inputValue: '',

      // style constants (reused)
      STYLE_ON,
      STYLE_OK,

      // stable buffers for Decimal-like copying
      buf: {
        interval: new Decimal(0),
        amount: new Decimal(0),
      },

      // keys of last values to avoid unnecessary updates
      lastKeys: {
        interval: null,
        isOn: null,
        type: null,
        mode: null,
        amount: null,
      },

      boundUpdate: null
    }
  },

  computed: {
    inputId() {
      const safeLabel = (this.label || '').replace(/\W+/g, '-').toLowerCase()
      return `prestige-${safeLabel}`
    },
    showPrestiger() {
      return this.autobuyerType === 'Prestiger'
    }
  },

  mounted() {
    // bind once
    this.boundUpdate = this.update.bind(this)
    window.addEventListener('GAME_EVENT.UPDATE', this.boundUpdate)

    // initial format & update
    this.formatInput()    // keep initial inputValue consistent with player state
    this.update()
  },

  beforeUnmount() {
    if (this.boundUpdate) window.removeEventListener('GAME_EVENT.UPDATE', this.boundUpdate)
  },

  methods: {
    // ---- cheap key builder for Decimal-like values ----
    cheapKey(v) {
      if (v == null) return 'null'
      if (typeof v === 'object') {
        if ('sign' in v && 'layer' in v && 'mag' in v) return `be:${v.sign}|${v.layer}|${v.mag}`
        if ('mantissa' in v && 'exponent' in v) return `bi:${v.mantissa}|${v.exponent}`
        if (typeof v.toNumber === 'function') return `n:${v.toNumber()}`
        try { return `o:${v.id || v.key || String(v)}` } catch (e) { return 'obj' }
      }
      return `p:${String(v)}`
    },

    // copyIntoBuffer uses copyFrom when available
    copyIntoBuffer(buf, src) {
      if (!buf) return
      if (src && typeof src.copyFrom === 'function') buf.copyFrom(src)
      else if (src && typeof src.toNumber === 'function') buf.sign = src.toNumber()
      else buf.sign = Number(src) || 0
    },

    // Keep user input in sync when mode or amount changes
    formatInput() {
      const amt = this.playerAutobuyer && this.playerAutobuyer.amount != null ? this.playerAutobuyer.amount : null
      if (amt == null) {
        this.inputValue = ''
        return
      }
      // avoid heavy ops if we can derive a cheap key
      const kAmt = this.cheapKey(amt)
      if (kAmt === this.lastKeys.amount) return

      this.lastKeys.amount = kAmt
      // format according to mode
      const mode = this.playerAutobuyer.autobuyerMode
      if (mode === 'AMOUNT') {
        this.inputValue = formatWhole(amt)
      } else if (mode === 'TIME') {
        // if amount is numeric seconds
        if (typeof amt.toNumber === 'function') this.inputValue = formatTime(amt)
        else this.inputValue = String(amt)
      } else {
        this.inputValue = format(amt)
      }
    },

    // public toggles (call into playerAutobuyer helpers)
    toggleAuto() {
      if (this.playerAutobuyer && typeof this.playerAutobuyer.toggle === 'function') {
        this.playerAutobuyer.toggle(window.player)
      }
    },

    toggleMode() {
      if (this.playerAutobuyer && typeof this.playerAutobuyer.toggleMode === 'function') {
        this.playerAutobuyer.toggleMode(window.player)
        // update labels/placeholders once after toggle
        this.formatInput()
        this.update() // ensure UI reflects new mode
      }
    },

    // only triggered by user change event — parsing happens on demand
    updateAmount(event) {
      const raw = event && event.target ? event.target.value : this.inputValue
      try {
        // parse using library so we can copyFrom into player's amount if needed
        const parsed = new Decimal(raw)
        if (parsed && typeof parsed.gte === 'function' && parsed.gte(0)) {
          if (typeof this.playerAutobuyer.updateAmount === 'function') this.playerAutobuyer.updateAmount(parsed)
        } else {
          if (typeof this.playerAutobuyer.updateAmount === 'function') this.playerAutobuyer.updateAmount(Decimal.dZero)
        }
      } catch (e) {
        // invalid parse -> set zero to keep safe
        if (typeof this.playerAutobuyer.updateAmount === 'function') this.playerAutobuyer.updateAmount(Decimal.dZero)
      }
      this.formatInput()
    },

    // hot-path update run every GAME_EVENT.UPDATE — must avoid allocations here
    update() {
      const ab = this.autobuyer
      const pab = this.playerAutobuyer

      // guard — if props missing just skip
      if (!ab || !pab) return

      // 1) interval: many games return a number or Decimal via autobuyer.interval()
      let intervalSrc
      try { intervalSrc = ab.interval ? ab.interval() : null } catch (e) { intervalSrc = null }
      const kInterval = this.cheapKey(intervalSrc)
      if (kInterval !== this.lastKeys.interval) {
        this.lastKeys.interval = kInterval
        // copy into buf then format
        this.copyIntoBuffer(this.buf.interval, intervalSrc)
        // formatTime is likely string -> store string once
        this.interval = formatTime(this.buf.interval)
      }

      // 2) auto on/off
      const isOn = !!(pab && pab.isOn)
      const kIsOn = isOn ? 'on' : 'off'
      if (kIsOn !== this.lastKeys.isOn) {
        this.lastKeys.isOn = kIsOn
        this.auto = isOn ? 'ON' : 'OFF'
        // reuse pre-created style objects (no new object allocation)
        this.autoStyle = isOn ? this.STYLE_ON : this.STYLE_OK
      }

      // 3) autobuyer type (static-ish)
      const abType = ab.type || ''
      if (abType !== this.lastKeys.type) {
        this.lastKeys.type = abType
        this.autobuyerType = abType
      }

      // 4) mode (single / max / amount / time / other)
      const mode = pab.autobuyerMode || ''
      if (mode !== this.lastKeys.mode) {
        this.lastKeys.mode = mode
        this.autobuyerMode = mode
        // pick one of pre-created style refs
        switch (mode) {
          case 'SINGLE':
            this.modeStyle = this.STYLE_ON
            this.prestigerLabel = ''
            this.prestigerPlaceholder = ''
            break
          case 'MAX':
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = ''
            this.prestigerPlaceholder = ''
            break
          case 'AMOUNT':
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = 'Prestige Amount:'
            this.prestigerPlaceholder = 'Enter prestige amount'
            break
          case 'TIME':
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = 'Prestige Time (Seconds):'
            this.prestigerPlaceholder = 'Enter prestige time'
            break
          case 'X TIMES YOOAMATTER':
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = 'X times Current YooAmatter:'
            this.prestigerPlaceholder = 'Enter prestige multiplier'
            break
          case 'X TIMES YOOA ESSENCE':
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = 'X times Current YooA Essence:'
            this.prestigerPlaceholder = 'Enter prestige multiplier'
            break
          default:
            this.modeStyle = this.STYLE_OK
            this.prestigerLabel = ''
            this.prestigerPlaceholder = ''
        }
        // ensure formatted input reflects current playerAutobuyer amount after mode change
        this.formatInput()
      }

      // 5) prestiger amount shown in inputValue: only update when amount key differs
      const amtSrc = pab.amount != null ? pab.amount : null
      const kAmt = this.cheapKey(amtSrc)
      if (kAmt !== this.lastKeys.amount) {
        this.lastKeys.amount = kAmt
        // do not allocate - copy into buffer and then format appropriately by mode
        this.copyIntoBuffer(this.buf.amount, amtSrc)
        // only update displayed input string if the mode expects an input string
        if (this.autobuyerType === 'Prestiger') {
          if (this.autobuyerMode === 'AMOUNT') this.inputValue = formatWhole(this.buf.amount)
          else if (this.autobuyerMode === 'TIME') this.inputValue = formatTime(this.buf.amount)
          else this.inputValue = format(this.buf.amount)
        }
      }
    }
  }
}
</script>

<style scoped>
.autobuyer {
    padding: 10px;
    border: 1px solid #ccc;
    width: 500px;
    border-radius: 10px;
    margin: 10px;
}

button {
    padding: 5px 10px;
    cursor: pointer;
    color: white;
    border: none;
    margin-top: 10px;
}

button:hover {
    opacity: 0.9;
}

.prestiger-input {
    margin-top: 10px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input[type="text"] {
    width: 95%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
</style>
