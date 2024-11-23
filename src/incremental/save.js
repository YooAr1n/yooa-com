function save(click = false) {
	localStorage.setItem("YooA", btoa(unescape(encodeURIComponent(JSON.stringify(player)))))
	localStorage.setItem("YooA_options", btoa(unescape(encodeURIComponent(JSON.stringify(options)))));
	if (click) alert("Saved!")
}

function fixData(defaultData, newData) {
	for (item in defaultData){
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

function fixSave() {
	defaultData = getStartPlayer()
	fixData(defaultData, player)
}

function load() {
	let get = localStorage.getItem("YooA");
	if (get === null || get === undefined) {
		player = getStartPlayer();
		options = getStartOptions();
	}
	else {
		player = Object.assign(getStartPlayer(), JSON.parse(decodeURIComponent(escape(atob(get)))));
        fixSave()
		loadOptions()
	}
	player.time = Date.now();
}

function loadOptions() {
	let get2 = localStorage.getItem("YooA_options");
	if (get2) 
		options = Object.assign(getStartOptions(), JSON.parse(decodeURIComponent(escape(atob(get2)))));
	else 
		options = getStartOptions()
	//if (themes.indexOf(options.theme) < 0) theme = "default"
	fixData(options, getStartOptions())
}

function exportSave() {
	let str = btoa(JSON.stringify(player));
	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
    el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
	alert("Exported!")
}

function importSave(imported=undefined) {
	if (imported===undefined) imported = prompt("Paste your save here")
	try {
		tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)))
		player = tempPlr;
		fixSave();
		save();
		window.location.reload();
	} catch (e) {
		return;
	}
}

function hardReset() {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return
	player = null
	options = null
	save();
	window.location.reload();
}