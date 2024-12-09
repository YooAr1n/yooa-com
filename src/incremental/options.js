import { reactive } from 'vue';

export const options = reactive(getStartOptions());
window.options = options;

export function getStartOptions() {
    return {
        autosave: true,
        autosaveInterval: 30
    }
}

export function autoSave() {
    options.autosave = !options.autosave;
	document.getElementById("autosave").innerHTML = "Auto Save: " + (options.autosave ? "ON" : "OFF")
}

export function changeAutoInt() {
    let int = [5, 10, 20, 30, 60]
    options.autosaveInterval = int[(int.indexOf(options.autosaveInterval) + 1) % int.length]
	document.getElementById("autoint").innerHTML = "Auto Save interval: " + options.autosaveInterval + "s"
}