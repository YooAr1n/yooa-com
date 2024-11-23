var options

function getStartOptions() {
    return {
        autosave: true
    }
}

function autoSave() {
    options.autosave = !options.autosave;
	document.getElementById("autosave").innerHTML = "Auto Save: " + (options.autosave ? "ON" : "OFF")
}