import { getStartPlayer } from "./incremental.js";
import { options, getStartOptions } from './options.js';

export function save(click = false) {
	// Save player data to localStorage
	localStorage.setItem("YooA", btoa(unescape(encodeURIComponent(JSON.stringify(player)))));
	
	// Save options data to localStorage
	localStorage.setItem("YooA_options", btoa(unescape(encodeURIComponent(JSON.stringify(options)))));
  
	if (click) {
	  const event = new CustomEvent('game-saved');
	  window.dispatchEvent(event);
	}
}

export function fixData(defaultData, newData) {
	for (let item in defaultData){
		if (defaultData[item] == null) {
			if (newData[item] === undefined) newData[item] = null
		}
		else if (Array.isArray(defaultData[item])) {
			if (newData[item] === undefined) newData[item] = defaultData[item]
			else fixData(defaultData[item], newData[item])
		}
		else if (defaultData[item] instanceof Decimal) { // Convert to Decimal
			if (newData[item] === undefined) newData[item] = defaultData[item]
			else newData[item] = new Decimal(newData[item])
		}
		else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
			if (newData[item] === undefined || (typeof defaultData[item] !== "object")) {
				newData[item] = defaultData[item]
			} else fixData(defaultData[item], newData[item])
		}
		else {
			if (newData[item] === undefined) newData[item] = defaultData[item]
		}
	}	
}

export function fixSave() {
	let defaultData = getStartPlayer()
	fixData(defaultData, player)
}

export function load() {
	let get = localStorage.getItem("YooA");
	if (get === null || get === undefined) {
	  player = getStartPlayer();
	  Object.assign(options, getStartOptions()); // Ensure options is initialized
	} else {
	  player = Object.assign(getStartPlayer(), JSON.parse(decodeURIComponent(escape(atob(get)))));
	  fixSave();
	  loadOptions(); // Load the options from localStorage
	}
	player.time = Date.now();
  }

export function loadOptions() {
	let get2 = localStorage.getItem("YooA_options");
	if (get2) {
	  // Update the reactive options object
	  Object.assign(options, JSON.parse(decodeURIComponent(escape(atob(get2)))));
	} else {
	  // If no saved options, initialize with defaults
	  Object.assign(options, getStartOptions());
	}
	// Fix data to ensure default values are applied
	fixData(options, getStartOptions());
  }
  

export function exportSave() {
	let str = btoa(JSON.stringify(player));
	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
    el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
	const event = new CustomEvent('export-completed');
  	window.dispatchEvent(event);
}

export function importSave(imported=undefined) {
	if (imported===undefined) imported = prompt("Paste your save here")
	try {
		let tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)))
		player = tempPlr;
		fixSave();
		save();
		const event = new CustomEvent('import-completed');
  		window.dispatchEvent(event);
	} catch (e) {
		return;
	}
}

export function hardReset() {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return;
  
	player = getStartPlayer(); // Reset player data
	Object.assign(options, getStartOptions()); // Reset options
  
	save(); // Save the reset state
	window.location.reload(); // Reload the page to reflect the changes
  }