<template>
  <div class="options">
    <button @click="save(true)">Save</button>
    <button @click="exportSave()">Export</button>
    <button @click="importSave()">Import</button>
    <button @click="hardReset()">HARD RESET</button><br>
    <button id="autosave" @click="autoSave()">Auto Save: ON</button>
  </div>
</template>

<script>
import { autoSave } from "@/incremental/options.js";
import { save, exportSave, importSave, hardReset } from "@/incremental/save.js";

export default {
  name: 'Main',
  components: {
    
  },
  methods: {
    save,         
    exportSave,   
    importSave,   
    hardReset,
    autoSave 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.options button {
	background-color: #991893;
 	color: white;
	padding: 12px 20px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 15pt;
	font-family: monospace;
	width: 120px;
	height: 90px;
	vertical-align: top;
}

.options button:hover {
	background-color: #80177a;
}
</style>
