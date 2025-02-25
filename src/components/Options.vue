<template>
  <div class="tabs">
    <button :class="{ active: currentTab === 'saving' }" @click="changeTab('Options', 'saving')">
      Saving
    </button>
    <button :class="{ active: currentTab === 'confirm' }" @click="changeTab('Options', 'confirm')">
      Confirmations
    </button>
  </div>
  <div class="options">
    <div v-if="currentTab === 'saving'" class="tab-content">
      <button @click="save(true)">Save</button>
      <button @click="exportSave()">Export</button>
      <button @click="importSave()">Import</button>
      <button @click="hardReset()">HARD RESET</button><br>
      <button id="autosave" @click="autoSave()">Auto Save: {{ autoSaveOn }}</button>
      <button id="autoint" @click="changeAutoInt()">Auto Save interval: {{ interval }}</button>
      <button id="offline" @click="changeOffline()">Offline Progress: {{ offlineOn }}</button>
      <button id="news" @click="changeNews()">News Ticker: {{ newsOn }}</button>
    </div>
    <div v-if="currentTab === 'confirm'" class="tab-content">
      <button v-for="(value, layer) in confirmations" :key="layer" @click="toggleConfirmation(layer)">
        {{ confirmText(layer, value) }}
      </button>
    </div>
  </div>
</template>

<script>
import { autoSave, changeAutoInt, changeOffline, changeNews } from "@/incremental/options.js";
import { save, exportSave, importSave, hardReset } from "@/incremental/save.js";

export default {
  name: 'Main',
  computed: {
    confirmations() {
      return options.confirmations
    },
    currentTab() {
      return player.subtabs["Options"];
    },
    interval() {
      return options.autosaveInterval + "s"
    },
    autoSaveOn() {
      return options.autosave ? "ON" : "OFF"
    },
    offlineOn() {
      return options.offline ? "ON" : "OFF"
    },
    newsOn() {
      return options.news ? "ON" : "OFF"
    }
  },
  mounted() {
    // This ensures the DOM is ready for manipulation
    const autosaveElement = document.getElementById("autosave");
    const autointElement = document.getElementById("autoint");
    const offlineElement = document.getElementById("offline");

    if (autosaveElement) {
      autosaveElement.innerHTML = "Auto Save: " + (options.autosave ? "ON" : "OFF");
    }

    if (autointElement) {
      autointElement.innerHTML = "Auto Save interval: " + options.autosaveInterval + "s";
    }

    if (offlineElement) {
      offlineElement.innerHTML = "Offline Progress: " + (options.offline ? "ON" : "OFF");
    }
  },
  methods: {
    changeTab(tabName, subtab) {
      player.tab = tabName; // Change the player tab directly
      player.subtabs[tabName] = subtab
    },
    confirmText(layer, value) {
      return `${layer}: ${value ? "ON" : "OFF"}`;
    },
    toggleConfirmation(layer) {
      options.confirmations[layer] = !options.confirmations[layer];
    },
    save,
    exportSave,
    importSave,
    hardReset,
    autoSave,
    changeAutoInt,
    changeOffline,
    changeNews
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.options button {
  background-color: #991893;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15pt;
  width: 180px;
  height: 90px;
  vertical-align: top;
}

.options button:hover {
  background-color: #80177a;
}

#autoint,
#offline {
  font-size: 12pt;
}

.tabs {
  display: flex;
  gap: 16px;
  justify-content: center;
  /* Centers the buttons horizontally */
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #991893;
  color: #b9e5ff;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  font-size: 16pt;
}

.tabs button.active {
  background-color: #b9e5ff;
  color: #991893;
}

.tab-content {
  width: 100%;
}
</style>
