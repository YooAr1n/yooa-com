import { getStartPlayer } from "./incremental.js";
import { options, getStartOptions } from './options.js';
import Dimension from "./dimensions.js"; 

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function save(click = false) {
    // Strip reactivity and save player data, including tab state
    const strippedPlayer = deepCopy(player);
    localStorage.setItem("YooA", btoa(JSON.stringify(strippedPlayer)));

    // Save options data to localStorage
    localStorage.setItem("YooA_options", btoa(JSON.stringify(options)));

    if (click) {
        const event = new CustomEvent('game-saved');
        window.dispatchEvent(event);
    }
}

export function fixData(defaultData, newData) {
    for (let item in defaultData) {
        if (defaultData[item] == null) {
            if (newData[item] === undefined) newData[item] = null;
        } else if (Array.isArray(defaultData[item])) {
            if (newData[item] === undefined) newData[item] = defaultData[item];
            else fixData(defaultData[item], newData[item]);
        } else if (defaultData[item] instanceof Decimal) {
            if (newData[item] === undefined) newData[item] = new Decimal(defaultData[item].toString());
            else newData[item] = new Decimal(newData[item].toString());
        } else if (defaultData[item] instanceof Dimension) {
            if (newData[item] === undefined) newData[item] = new Dimension(defaultData[item].name, defaultData[item].amt, defaultData[item].level, defaultData[item].tier);
            else newData[item] = new Dimension(newData[item].name, newData[item].amt, newData[item].level, newData[item].tier);
            fixData(defaultData[item], newData[item]);
        } else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
            if (newData[item] === undefined) {
                newData[item] = defaultData[item];
            } else {
                fixData(defaultData[item], newData[item]);
            }
        } else {
            if (newData[item] === undefined) newData[item] = defaultData[item];
        }

        // Explicitly handle player.upgrades.YooA conversion here
        if (item === "upgrades" && newData[item] && newData[item].YooA) {
            for (let upgradeId in newData[item].YooA) {
                if (typeof newData[item].YooA[upgradeId] === "string") {
                    newData[item].YooA[upgradeId] = new Decimal(newData[item].YooA[upgradeId]);
                }
            }
        }
    }
}

export function fixSave() {
    let defaultData = getStartPlayer();
    fixData(defaultData, player);
}

export function load() {
    let get = localStorage.getItem("YooA");
    if (get === null || get === undefined) {
        // Initialize player and options with default values
        Object.assign(player, getStartPlayer());
        Object.assign(options, getStartOptions());
    } else {
        let loadedPlayer = JSON.parse(atob(get)); // Simplified to avoid unnecessary escape/encodeURIComponent
        Object.assign(player, getStartPlayer()); // Start fresh with defaults
        Object.assign(player, loadedPlayer);     // Merge saved data

        if (!player.tab) player.tab = "Main"; // Ensure default tab is "Main" if not in saved data
        fixSave(); // Ensure player data is complete
        loadOptions(); // Load the options from localStorage
    }
    player.time = Date.now();
}

export function loadOptions() {
    let get2 = localStorage.getItem("YooA_options");
    if (get2) {
        // Update the reactive options object
        Object.assign(options, JSON.parse(atob(get2)));
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

export function importSave(imported = undefined) {
    if (imported === undefined) imported = prompt("Paste your save here");
    try {
        let tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)));
        player = tempPlr;
        fixSave();
        save();
        const event = new CustomEvent('import-completed');
        window.dispatchEvent(event);
        setTimeout(() => {
            window.location.reload(); // Reload after the notification is shown
        }, 1000);
    } catch (e) {
        alert("Import failed: Invalid save data.");
    }
}

export function hardReset() {
    if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return;

    Object.assign(player, getStartPlayer()); // Reset player data
    Object.assign(options, getStartOptions()); // Reset options

    save(); // Save the reset state
    window.location.reload(); // Reload the page to reflect the changes
}
