<template>
  <div class="tabs-container">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="{ active: isCurrentTab('main') }" @click="changeTab('Main', 'main')">Main</button>
      <button :class="{ active: isCurrentTab('upgrade') }" @click="changeTab('Main', 'upgrade')">Upgrades</button>
    </div>

    <!-- Tab Content: Main -->
    <div v-if="isCurrentTab('main')" class="tab-content">
      <h2>Solve math problems to get YooA Points! (+{{ YooAGainFormatted }}/solve)</h2>
      <h3>You have solved {{ solved }} math problems. (+{{ problemGain }}/solve)</h3>
      <MathProblem layerName="YooA" refName="MainMath" />

      <h2 v-if="rankUnlocked">Each dimension's rank directly amplifies its own per-level multiplier and its output effect.</h2><br>
      <h3>Dimension costs increase faster at Level <span v-html="scalingStart"></span></h3><br>
      <h3 v-html="dimMultDisp"></h3><br>
      <h3 v-if="unlockedDim3" v-html="dim3MultDisp"></h3><br>
      <h3 v-if="rankUnlocked" v-html="dimRankMultDisp"></h3><br>

      <button v-if="maxUnlocked" class="max" @click="maxAll">Max All YooA Lines and YooA Planes (M)</button>
      <button v-if="maxAllUnlocked" class="max" @click="maxAllDims">Max All Dimensions (X)</button>
      <button v-if="rankMaxUnlocked" class="max" @click="maxAllDimRanks">Max All Dimension Ranks (A)</button>


      <Dimension 
        v-for="dim in unlockedDimensions" 
        :key="dim.id" 
        :dimension="dim" 
        :dimGain="dimensionGain(dim)"
        :canAfford="canAffordDimension(dim)" 
        :allDimensions="allDimensions"
        :maxUnlocked="maxDimUnlocked"
        :rankUnlocked="rankUnlocked"
        :rankMaxUnlocked="rankMaxUnlocked"
      />
    </div>

    <!-- Tab Content: Upgrades -->
    <div v-if="isCurrentTab('upgrade')" class="tab-content">
      <button v-if="maxDimUnlocked" class="max" @click="maxAllUpgrades">Max All YooA Upgrades</button>
      <UpgradeGrid layerName="YooA" />
    </div>
  </div>
</template>

<script>
import { maxAllDimensions, hasAchievement, maxAllDimensionRanks } from "@/incremental/incremental.js";
import { buyUpgrade, buyMaxUpgrade, hasMilestone, hasUpgrade } from "@/incremental/mainFuncs";
import { getDimMultPerLvl, getDimMultPerRank, getScalingStart } from '@/incremental/dimensions';
import UpgradeGrid from "./comps/UpgradeGrid.vue";
import MathProblem from "./comps/MathProblem.vue";
import Dimension from "./comps/Dimension.vue";
import { gameLayers } from "@/incremental/layersData";
import { GameCache } from "@/incremental/cache";

// Lazy cache for YooA upgrade keys
let _yooAKeys;
function getYooAKeys() {
  if (!_yooAKeys) {
    _yooAKeys = [];
    for (const key in gameLayers.YooA.upgrades) {
      if (gameLayers.YooA.upgrades[key].title) {
        _yooAKeys.push(key);
      }
    }
  }
  return _yooAKeys;
}

// Generic helper
function applyUpgrades(layerName, keys, method) {
  for (const key of keys) {
    method(layerName, key);
  }
}

// Optimized exports
export function buyAllUpgrades() {
  applyUpgrades("YooA", getYooAKeys(), buyUpgrade);
}

export function maxAllUpgrades() {
  applyUpgrades("YooA", getYooAKeys(), buyMaxUpgrade);
}

export default {
  name: "Main",
  components: { UpgradeGrid, MathProblem, Dimension },
  data() {
    return {
      YooAGainFormatted: "",
      solved: "",
      problemGain: Decimal.dZero,
      allDimensions: [],
      unlockedDimensions: [],
      dimMultDisp: "",
      dim3MultDisp: "",
      dimRankMultDisp: "",
      scalingStart: "",
      unlockedDim3: false,
      maxUnlocked: false,
      maxAllUnlocked: false,
      maxDimUnlocked: false,
      rankUnlocked: false,
      rankMaxUnlocked: false,
      subtab: "main"
    };
  },
  methods: {
    update() {
      this.YooAGainFormatted = format(GameCache.YooAGain.value);
      this.solved = formatWhole(player.math.YooA.solved);
      this.problemGain = format(gameLayers.YooA.problemGain());
      this.allDimensions = player.dimensions.YooA
      this.unlockedDimensions = this.allDimensions.filter(d => d.unlocked);
      const mult12 = getDimMultPerLvl("YooA", 1);
      const mult3 = getDimMultPerLvl("YooA", 3);
      const multRank = getDimMultPerRank("YooA");
      this.dimMultDisp = `Dimension 1-2 Multiplier per level: x${format(mult12, 3)}`
      this.dim3MultDisp = `Dimension 3+ Multiplier per level: x${format(mult3, 3)}`;
      this.dimRankMultDisp = `Dimension Multiplier per rank: x${format(multRank, 3)}`;
      this.scalingStart = format(getScalingStart("YooA"))
      this.unlockedDim3 = hasAchievement(18);
      this.maxUnlocked = hasAchievement(27);
      this.maxAllUnlocked = hasMilestone("YooAity", 3);
      this.maxDimUnlocked = hasAchievement(23);
      this.rankUnlocked = hasMilestone("YooAity", 14);
      this.rankMaxUnlocked = hasUpgrade("Hyojung", 21);
      this.subtab = player.subtabs["Main"]
    },
    changeTab(tabName, subtab) {
      player.tab = tabName;
      player.subtabs[tabName] = subtab;
    },
    maxAll() {
      maxAllDimensions("YooA");
    },
    maxAllDims() {
      maxAllDimensions("YooA", true);
    },
    maxAllDimRanks() {
      maxAllDimensionRanks("YooA");
    },
    maxAllUpgrades() {
      maxAllUpgrades()
    },
    isCurrentTab(tab) {
      return this.subtab === tab;
    },
    // Provide a minimal function to pass as a prop to <Dimension>
    dimensionGain(dim) {
      return player.gain[dim.type]?.dimensions?.[dim.tier - 1] ?? "N/A";
    },
    canAffordDimension(dim) {
      const curr = dim.layer === "" ? player.YooAPoints : player[dim.layer][dim.currency];
      return curr?.gte(dim.cost) ?? false;
    },
  },
  mounted() {
    // Listen for the custom update event and call the update method
    window.addEventListener("GAME_EVENT.UPDATE", this.update)
  },
  beforeUnmount() {
    // Remove the event listener when the component is destroyed
    window.removeEventListener("GAME_EVENT.UPDATE", this.update)
  },
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
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #d17be2;
  color: #b9e5ff;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tabs button.active {
  background-color: #b9e5ff;
  color: #d17be2;
}

.tab-content {
  width: 100%;
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
</style>
