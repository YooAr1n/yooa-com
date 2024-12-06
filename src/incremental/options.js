export var options = getStartOptions();
window.options = options; 

export function getStartOptions() {
    return {
        autosave: true
    }
}

export function autoSave() {
    options.autosave = !options.autosave;
    window.options = options; 
	document.getElementById("autosave").innerHTML = "Auto Save: " + (options.autosave ? "ON" : "OFF")
}