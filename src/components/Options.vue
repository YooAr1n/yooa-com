<template>
  <div class="options">
    <button @click="save(true)">Save</button>
    <button @click="exportSave()">Export</button>
    <button @click="importSave()">Import</button>
    <button @click="hardReset()">HARD RESET</button><br>
    <button id="autosave" @click="autoSave()">Auto Save: ON</button>
    <button id="autoint" @click="changeAutoInt()">Auto Save interval: 1s</button>
  </div>
</template>

<script>
import { options, autoSave, changeAutoInt } from "@/incremental/options.js";
import { save, exportSave, importSave, hardReset } from "@/incremental/save.js";

export default {
  name: 'Main',
  components: {
    
  },
  mounted() {
    // This ensures the DOM is ready for manipulation
    const autosaveElement = document.getElementById("autosave");
    const autointElement = document.getElementById("autoint");
    
    if (autosaveElement) {
      autosaveElement.innerHTML = "Auto Save: " + (options.autosave ? "ON" : "OFF");
    }
    
    if (autointElement) {
      autointElement.innerHTML = "Auto Save interval: " + options.autosaveInterval + "s";
    }
  },
  methods: {
    save,         
    exportSave,   
    importSave,   
    hardReset,
    autoSave,
    changeAutoInt
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
	font-family: monospace;
	width: 160px;
	height: 80px;
	vertical-align: top;
}

.options button:hover {
	background-color: #80177a;
}

#autoint {
  font-size: 12pt;
}
</style>
