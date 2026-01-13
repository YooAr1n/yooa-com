<template>
    <div class="tabs-container">
        <!-- ─── MAIN TABS: dynamically generate and color them ─── -->
        <div class="tabs">
            <button v-if="AriniumUnlocked" :class="{ active: currentLayer === 'upgrade' }"
                @click="changeLayer('upgrade')">
                Upgrades
            </button>
            <button v-for="layer in availableLayers" :key="layer" @click="changeLayer(layer)" :style="tabStyle(layer)">
                {{ layer }}
            </button>
        </div>

        <!-- ─── DISPLAY COMMON STATS ─── -->
        <div class="center-container">
            <h2>
                You have <span v-html="yrText"></span> YooArium
            </h2>
            <h2 v-if="tierUnlocked">
                You have <span v-html="miracleText"></span> Miracle Light
            </h2>
            <h2>
                Arin is level <span v-html="ArinLevel"></span>,
                which boosts YooArium gain by x<span v-html="ArinYooAriumEff"></span>
                and makes autobuyers x<span v-html="ArinAutoEff"></span> faster
            </h2>
            <h2 v-if="rankUnlocked">
                Arin is rank <span v-html="ArinRank"></span>,
                which adds <span v-html="ArinFreeLevelEff"></span> effective Arin levels<span v-if="ArinRankEffUnlocked"
                    v-html="ArinRankBoost"></span>
                and boosts YooA Essence gain by x<span v-html="ArinEssenceEff"></span>
            </h2>
            <h2 v-if="tierUnlocked">
                Arin is tier <span v-html="ArinTier"></span>,
                which boosts Miracle Light gain by x<span v-html="ArinMiracleEff"></span>
                and makes Arin-Proof autobuyers x<span v-html="ArinAutoEff2"></span> faster
            </h2>
            <h2 v-if="AriniumUnlocked">
                You have <span v-html="Arinium"></span> Arinium <span v-html="AriniumGain"></span>(based on Arin Rank
                autobuyer speed, starts at {{ formatNum(2e10) }} autobuys/s),
                which boosts YooA Points by ^<span v-html="AriniumYooAEff"></span>
                and Yubin point gain by x<span v-html="AriniumYubinEff"></span>
            </h2>
            <button @click="upgradeArin" :disabled="!canUpgradeArin" :class="{ disabled: !canUpgradeArin }">
                Upgrade Arin (Cost: {{ ArinUpgradeCost }} YooArium)
            </button>
            <button v-if="maxArinUnlocked" @click="maxArin" :disabled="!canUpgradeArin"
                :class="{ disabled: !canUpgradeArin }">
                Max Arin Level
            </button>
            <button class="rank" v-if="rankUnlocked" @click="harmonizeArin" :disabled="!canHarmonizeArin"
                :class="{ disabled: !canHarmonizeArin }">
                Harmonize Arin (Cost: {{ ArinHarmonizeCost }} YooA Essence)
            </button>
            <button class="rank" v-if="maxArinRankUnlocked" @click="maxArinRank" :disabled="!canHarmonizeArin"
                :class="{ disabled: !canHarmonizeArin }">
                Max Arin Rank
            </button>
            <button class="tier" v-if="tierUnlocked" @click="radiateArin" :disabled="!canRadiateArin"
                :class="{ disabled: !canRadiateArin }">
                Radiate Arin (Cost: {{ ArinRadiateCost }} Miracle Light)
            </button>
            <button class="tier" v-if="maxArinTierUnlocked" @click="maxArinTier" :disabled="!canRadiateArin"
                :class="{ disabled: !canRadiateArin }">
                Max Arin Tier
            </button>
        </div>

        <!-- ─── LIST ALL UNLOCKED AUTOBUYERS FOR THE SELECTED LAYER ─── -->
        <div class="automation-container" v-if="currentLayer !== 'upgrade'">
            <Autobuyer v-for="entry in unlockedForCurrentLayer" :key="entry.name" :label="entry.name"
                :autobuyer="entry.autobuyer" :playerAutobuyer="playerAutobuyers(entry.layer, entry.name)" />
            <p v-if="unlockedForCurrentLayer.length === 0" class="no-autobuyers">
                No autobuyers unlocked for {{ currentLayer }}.
            </p>
        </div>

        <div v-if="currentLayer === 'upgrade'">
            <button v-if="maxAriniumUnlocked" class="max" @click="maxAllARUpgrades">Max All Arinium Upgrades
                (A)</button>
            <UpgradeGrid layerName="Arinium" />
        </div>
    </div>
</template>

<script>
import UpgradeGrid from './comps/UpgradeGrid.vue'
import Autobuyer from '@/components/comps/Autobuyer.vue'
import {
    arinBulkBuy,
    arinRankBulkBuy,
    arinSingleBuy,
    arinSingleRank,
    arinSingleTier,
    arinTierBulkBuy,
    autobuyers as AUTO_DEFS,
    getArinCost,
    getArinEffect,
    getAriniumEffect,
    getArinRankCost,
    getArinRankEffect,
    getArinTierCost,
    getArinTierEffect,
} from '@/incremental/automation'
import { buyMaxUpgrade, buyUpgrade, hasMilestone, hasUpgrade } from '@/incremental/mainFuncs'
import Decimal from '@/incremental/break_eternity.js' // Decimal library
import { gameLayers } from '@/incremental/layersData'
import { GameCache } from '@/incremental/cache'
import { player } from '@/incremental/incremental' // local player ref

// ---------- helpers ----------
function cheapKey(v) {
    if (v == null) return 'null';
    if (typeof v === 'object') {
        if ('sign' in v && 'layer' in v && 'mag' in v) return `be:${v.sign}|${v.layer}|${v.mag}`;
        if ('mantissa' in v && 'exponent' in v) return `bi:${v.mantissa}|${v.exponent}`;
        if (typeof v.toNumber === 'function') return `n:${v.toNumber()}`;
        try { return `o:${v.id||v.key||String(v)}` } catch(e){ return 'obj'; }
    }
    return `p:${String(v)}`;
}
function copyIntoBuffer(buf, src) {
    if (!buf) return;
    if (src && typeof src.copyFrom === 'function') buf.copyFrom(src);
    else if (src && typeof src.toNumber === 'function') buf.sign = src.toNumber();
    else buf.sign = Number(src) || 0;
}
function arrKey(arr) {
    // build a cheap key for an array of Decimal-like values
    if (!arr || !Array.isArray(arr)) return 'null';
    let s = '';
    for (let i = 0; i < arr.length; ++i) s += '|' + cheapKey(arr[i]);
    return s;
}

// color map
const TAB_COLOR_MAP = {
    YooA: ['#d17be2', '#b9e5ff'],
    YooAmatter: ['#bcc70f', '#313500'],
    YooAity: ['#230085', '#a585ff']
};

let _arKeys;
function getARKeys() {
    if (_arKeys) return _arKeys;
    _arKeys = [];
    const ups = gameLayers.Arinium && gameLayers.Arinium.upgrades;
    if (!ups) return _arKeys;
    for (const key in ups) if (ups[key] && ups[key].title) _arKeys.push(key);
    return _arKeys;
}
function applyUpgrades(layerName, keys, method) {
    for (const key of keys) method(layerName, key);
}
export function buyAllARUpgrades() { applyUpgrades('Arinium', getARKeys(), buyUpgrade); }
export function maxAllARUpgrades() { applyUpgrades('Arinium', getARKeys(), buyMaxUpgrade); }

export default {
    name: 'Automation',
    components: { Autobuyer, UpgradeGrid },

    data() {
        return {
            // reactive displayed HTML fields (only updated when underlying value changes)
            currentLayer: 'YooA',
            ArinYooAriumEff: '',
            ArinAutoEff: '',
            ArinAutoEff2: '',
            ArinMiracleEff: '',
            AriniumYooAEff: '',
            AriniumYubinEff: '',
            ArinUpgradeCost: '',
            ArinHarmonizeCost: '',
            ArinRadiateCost: '',
            ArinLevel: '',
            ArinRank: '',
            ArinTier: '',
            Arinium: '',
            AriniumGain: '',
            canUpgradeArin: false,
            canHarmonizeArin: false,
            canRadiateArin: false,
            maxArinUnlocked: false,
            maxArinRankUnlocked: false,
            maxArinTierUnlocked: false,
            rankUnlocked: false,
            tierUnlocked: false,
            AriniumUnlocked: false,
            ArinRankEffUnlocked: false,
            maxAriniumUnlocked: false,
            yrText: '',
            miracleText: '',

            // stable helpers
            availableLayers: [],
            unlockedByLayer: {},
            allAutobuyerEntries: [],

            // prev keys (cheapKey strings) instead of storing raw Decimal refs
            prevKeys: {
                arinEff: null,
                arinRankEff: null,
                arinTierEff: null,
                ariniumEff: null,
                arinCost: null,
                arinRankCost: null,
                arinTierCost: null,
                arinLevel: null,
                arinRank: null,
                arinTier: null,
                arinium: null,
                yr: null,
                miracle: null
            },

            // Decimal buffers (stable objects we copyIntoBuffer to)
            buf: {
                yr: new Decimal(0),
                arinium: new Decimal(0),
                arinLevel: new Decimal(0),
                arinRank: new Decimal(0),
                arinTier: new Decimal(0),
                // effect buffers are arrays of Decimal if needed
                arinEff: [ new Decimal(1), new Decimal(1) ],
                arinRankEff: [ new Decimal(1), new Decimal(1), new Decimal(1) ],
                arinTierEff: [ new Decimal(1), new Decimal(1) ],
                ariniumEff: [ new Decimal(1), new Decimal(1) ],
            },

            boundUpdate: null
        }
    },

    computed: {
        unlockedForCurrentLayer() {
            return this.unlockedByLayer[this.currentLayer] || [];
        }
    },

    methods: {
        upgradeArin() { arinSingleBuy(); },
        maxArin() { arinBulkBuy(); },
        harmonizeArin() { arinSingleRank(); },
        maxArinRank() { arinRankBulkBuy(); },
        radiateArin() { arinSingleTier(); },
        maxArinTier() { arinTierBulkBuy(); },

        formatNum(n) { return format(n); },

        playerAutobuyers(layer, name) { return player?.autobuyers?.[layer]?.[name]; },

        tabStyle(layer) {
            const colors = TAB_COLOR_MAP[layer] || ['#888888', '#cccccc'];
            if (this.currentLayer === layer) return { backgroundColor: colors[1], color: colors[0] };
            return { backgroundColor: colors[0], color: colors[1] };
        },

        // hot update
        update() {
            const p = player;
            if (!p) return;

            // mirror external subtab immediately
            if (p.subtabs && p.subtabs.Automation && this.currentLayer !== p.subtabs.Automation) {
                this.currentLayer = p.subtabs.Automation;
            }

            // ---------- get cached values (prefer GameCache) ----------
            const newArinEff = (GameCache.Arin_effect && GameCache.Arin_effect.value) || getArinEffect();
            const newArinRankEff = (GameCache.Arin_rankEffect && GameCache.Arin_rankEffect.value) || getArinRankEffect();
            const newArinTierEff = (GameCache.Arin_tierEffect && GameCache.Arin_tierEffect.value) || getArinTierEffect();
            const newAriniumEff = (GameCache.Arinium_effect && GameCache.Arinium_effect.value) || getAriniumEffect();

            // ---------- effects: detect change via keys, then copyIntoBuffer (copyFrom) ----------
            const kArinEff = arrKey(newArinEff);
            if (kArinEff !== this.prevKeys.arinEff) {
                this.prevKeys.arinEff = kArinEff;
                // copy each element into stable buffer using copyFrom when possible
                if (!this.buf.arinEff) this.buf.arinEff = [ new Decimal(1), new Decimal(1) ];
                copyIntoBuffer(this.buf.arinEff[0], newArinEff[0]);
                copyIntoBuffer(this.buf.arinEff[1], newArinEff[1]);
                this.ArinYooAriumEff = window.colorText ? window.colorText('h3', '#046dAA', format(this.buf.arinEff[0])) : format(this.buf.arinEff[0]);
                this.ArinAutoEff = window.colorText ? window.colorText('h3', '#046dAA', format(this.buf.arinEff[1])) : format(this.buf.arinEff[1]);
            }

            const kArinRankEff = arrKey(newArinRankEff);
            if (kArinRankEff !== this.prevKeys.arinRankEff) {
                this.prevKeys.arinRankEff = kArinRankEff;
                if (!this.buf.arinRankEff) this.buf.arinRankEff = [ new Decimal(1), new Decimal(1), new Decimal(1) ];
                copyIntoBuffer(this.buf.arinRankEff[0], newArinRankEff[0]);
                copyIntoBuffer(this.buf.arinRankEff[1], newArinRankEff[1]);
                copyIntoBuffer(this.buf.arinRankEff[2], newArinRankEff[2]);
                this.ArinFreeLevelEff = window.colorText ? window.colorText('h3', '#6542ff', format(this.buf.arinRankEff[0])) : format(this.buf.arinRankEff[0]);
                this.ArinEssenceEff = window.colorText ? window.colorText('h3', '#6542ff', format(this.buf.arinRankEff[1])) : format(this.buf.arinRankEff[1]);
                this.ArinRankBoost = ", makes them +" + (window.colorText ? window.colorText('h3', '#6542ff', format(this.buf.arinRankEff[2].sub(1).mul(100))) : format(this.buf.arinRankEff[2].sub(1).mul(100))) + "% stronger,";
            }

            const kArinTierEff = arrKey(newArinTierEff);
            if (kArinTierEff !== this.prevKeys.arinTierEff) {
                this.prevKeys.arinTierEff = kArinTierEff;
                if (!this.buf.arinTierEff) this.buf.arinTierEff = [ new Decimal(1), new Decimal(1) ];
                copyIntoBuffer(this.buf.arinTierEff[0], newArinTierEff[0]);
                copyIntoBuffer(this.buf.arinTierEff[1], newArinTierEff[1]);
                this.ArinMiracleEff = window.colorText ? window.colorText('h3', '#dd52ff', format(this.buf.arinTierEff[0])) : format(this.buf.arinTierEff[0]);
                this.ArinAutoEff2 = window.colorText ? window.colorText('h3', '#dd52ff', format(this.buf.arinTierEff[1])) : format(this.buf.arinTierEff[1]);
            }

            const kAriniumEff = arrKey(newAriniumEff);
            if (kAriniumEff !== this.prevKeys.ariniumEff) {
                this.prevKeys.ariniumEff = kAriniumEff;
                if (!this.buf.ariniumEff) this.buf.ariniumEff = [ new Decimal(1), new Decimal(1) ];
                copyIntoBuffer(this.buf.ariniumEff[0], newAriniumEff[0]);
                copyIntoBuffer(this.buf.ariniumEff[1], newAriniumEff[1]);
                this.AriniumYooAEff = window.colorText ? window.colorText('h3', '#fd35c7', format(this.buf.ariniumEff[0])) : format(this.buf.ariniumEff[0]);
                this.AriniumYubinEff = window.colorText ? window.colorText('h3', '#fd35c7', format(this.buf.ariniumEff[1])) : format(this.buf.ariniumEff[1]);
            }

            // ---------- costs: use cheapKey and copyIntoBuffer (copyFrom) for buffers when possible ----------
            const newArinCost = getArinCost();
            const kArinCost = cheapKey(newArinCost);
            if (kArinCost !== this.prevKeys.arinCost) {
                this.prevKeys.arinCost = kArinCost;
                // cost formatting (no persistent buffer needed for display, but we can still copy if desired)
                this.ArinUpgradeCost = format(newArinCost);
            }

            const newArinRankCost = getArinRankCost();
            const kArinRankCost = cheapKey(newArinRankCost);
            if (kArinRankCost !== this.prevKeys.arinRankCost) {
                this.prevKeys.arinRankCost = kArinRankCost;
                this.ArinHarmonizeCost = format(newArinRankCost);
            }

            const newArinTierCost = getArinTierCost();
            const kArinTierCost = cheapKey(newArinTierCost);
            if (kArinTierCost !== this.prevKeys.arinTierCost) {
                this.prevKeys.arinTierCost = kArinTierCost;
                this.ArinRadiateCost = format(newArinTierCost);
            }

            // ---------- levels & values: copyFrom into stable buffers ----------
            const kArinLevel = cheapKey(p.Arin.level);
            if (kArinLevel !== this.prevKeys.arinLevel) {
                this.prevKeys.arinLevel = kArinLevel;
                copyIntoBuffer(this.buf.arinLevel, p.Arin.level);
                this.ArinLevel = window.colorText ? window.colorText('h3', '#046dAA', formatWhole(this.buf.arinLevel)) : formatWhole(this.buf.arinLevel);
            }

            const kArinRank = cheapKey(p.Arin.rank);
            if (kArinRank !== this.prevKeys.arinRank) {
                this.prevKeys.arinRank = kArinRank;
                copyIntoBuffer(this.buf.arinRank, p.Arin.rank);
                this.ArinRank = window.colorText ? window.colorText('h3', '#6542ff', formatWhole(this.buf.arinRank)) : formatWhole(this.buf.arinRank);
            }

            const kArinTier = cheapKey(p.Arin.tier);
            if (kArinTier !== this.prevKeys.arinTier) {
                this.prevKeys.arinTier = kArinTier;
                copyIntoBuffer(this.buf.arinTier, p.Arin.tier);
                this.ArinTier = window.colorText ? window.colorText('h3', '#dd52ff', formatWhole(this.buf.arinTier)) : formatWhole(this.buf.arinTier);
            }

            const kArinium = cheapKey(p.Arin.Arinium);
            if (kArinium !== this.prevKeys.arinium) {
                this.prevKeys.arinium = kArinium;
                copyIntoBuffer(this.buf.arinium, p.Arin.Arinium);
                this.Arinium = window.colorText ? window.colorText('h3', '#fd35c7', format(this.buf.arinium)) : format(this.buf.arinium);
            }

            // YooArium
            const yrVal = p.YooAmatter?.YooArium ?? Decimal.dZero;
            const kYr = cheapKey(yrVal);
            if (kYr !== this.prevKeys.yr) {
                this.prevKeys.yr = kYr;
                copyIntoBuffer(this.buf.yr, yrVal);
                this.yrText = window.colorText ? window.colorText('h3', '#bcc70f', format(this.buf.yr)) : format(this.buf.yr);
            }

            // Miracle light
            const miracleVal = p.YooAity?.MiracleLight ?? Decimal.dZero;
            const kMir = cheapKey(miracleVal);
            if (kMir !== this.prevKeys.miracle) {
                this.prevKeys.miracle = kMir;
                // reuse the arinium buffer for display? better keep separate, but we already have no buffer - use copy into arinium as temp
                // create one-off small buffer:
                if (!this.buf.miracle) this.buf.miracle = new Decimal(0);
                copyIntoBuffer(this.buf.miracle, miracleVal);
                this.miracleText = window.colorText ? window.colorText('h3', gameLayers.OMG.color, format(this.buf.miracle)) : format(this.buf.miracle);
            }

            // AriniumGain (raw string likely)
            const ag = p.gain?.Arin?.Arinium ?? '';
            if (this.AriniumGain !== ag) this.AriniumGain = ag;

            // afford checks
            this.canUpgradeArin = !!(p.YooAmatter && p.YooAmatter.YooArium && typeof p.YooAmatter.YooArium.gte === 'function' && p.YooAmatter.YooArium.gte(getArinCost()));
            this.canHarmonizeArin = !!(p.YooAity && p.YooAity.amount && typeof p.YooAity.amount.gte === 'function' && p.YooAity.amount.gte(getArinRankCost()));
            this.canRadiateArin = !!(p.YooAity && p.YooAity.MiracleLight && typeof p.YooAity.MiracleLight.gte === 'function' && p.YooAity.MiracleLight.gte(getArinTierCost()));

            // flags / unlocks
            this.maxArinUnlocked = hasMilestone('YooAity', 4);
            this.maxArinRankUnlocked = hasMilestone('YooAity', 15);
            this.maxArinTierUnlocked = hasUpgrade('Seunghee', 31);
            this.AriniumUnlocked = hasMilestone('YooAity', 18);
            this.ArinRankEffUnlocked = hasUpgrade("Arinium", 11);
            this.rankUnlocked = hasUpgrade('YooAity', 15);
            this.tierUnlocked = hasMilestone('YooAity', 22);
            this.maxAriniumUnlocked = hasUpgrade('YooAity', 54);

            // unlocked autobuyers: reuse arrays in-place
            const all = this.allAutobuyerEntries;
            const byLayer = this.unlockedByLayer;
            for (let i = 0; i < this.availableLayers.length; ++i) {
                const layer = this.availableLayers[i];
                const arr = byLayer[layer];
                if (arr) arr.length = 0;
            }
            for (let i = 0; i < all.length; ++i) {
                const e = all[i];
                try {
                    if (e.autobuyer && e.autobuyer.unlocked && e.autobuyer.unlocked()) {
                        byLayer[e.layer].push(e);
                    }
                } catch (err) {
                    // keep frame alive
                }
            }
        },

        changeLayer(layerName) {
            const p = player;
            if (p) p.subtabs.Automation = layerName;
            this.currentLayer = layerName;
        }
    },

    mounted() {
        // Precompute available layers and autobuyer entries (stable references)
        this.availableLayers = Object.keys(AUTO_DEFS || {});
        for (let i = 0; i < this.availableLayers.length; ++i) {
            this.unlockedByLayer[this.availableLayers[i]] = [];
        }
        const entries = [];
        for (const layer in AUTO_DEFS) {
            const layerObj = AUTO_DEFS[layer];
            for (const name in layerObj) entries.push({ layer, name, autobuyer: layerObj[name] });
        }
        this.allAutobuyerEntries = entries;

        // bind update
        this.boundUpdate = this.update.bind(this);
        window.addEventListener('GAME_EVENT.UPDATE', this.boundUpdate);

        // initial run
        this.update();
    },

    beforeUnmount() {
        if (this.boundUpdate) window.removeEventListener('GAME_EVENT.UPDATE', this.boundUpdate);
    }
}
</script>

<style scoped>
/* rest unchanged */
.tabs {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 12px;
}

.tabs button {
    padding: 8px 16px;
    border: none;
    background-color: #fd35c7;
    color: #6b004f;
    cursor: pointer;
    font-weight: bold;
    border-radius: 4px;
    font-size: 16pt;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.tabs button.active {
    background-color: #6b004f;
    color: #fd35c7;
}

.center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 24px;
}

button.disabled {
    background: linear-gradient(#ff5757, #c51313);
    cursor: not-allowed;
}

h2 { margin: 8px 0; }
button { margin: 6px 0; }
button.rank { background-color: #6542ff; }
button.tier { background-color: #dd52ff; }

button.max {
    padding: 8px 16px;
    background-color: #d17be2;
    color: #b9e5ff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
button.max:hover { background-color: #b86cc3; }

.automation-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
}
.no-autobuyers { color: #777; font-style: italic; }
</style>
