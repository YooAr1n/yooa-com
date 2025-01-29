import { gameLoop, getStartPlayer } from "./incremental.js";
import { options, getStartOptions } from './options.js';
import Dimension from "./dimensions.js"; 
import { generateNewProblem } from "@/components/comps/MathProblem.vue";
import Autobuyer from "./automation.js";

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function save(click = false) {
    if (offline.nosave) return
    // Strip reactivity and save player data, including tab state
    const strippedPlayer = deepCopy(player);
    localStorage.setItem("YooA", btoa(JSON.stringify(strippedPlayer)));

    // Save options data to localStorage
    const strippedOptions = deepCopy(options);
    localStorage.setItem("YooA_options", btoa(JSON.stringify(strippedOptions)));

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
        } else if (defaultData[item] instanceof Autobuyer) {
            if (newData[item] === undefined) newData[item] = new Autobuyer(defaultData[item].layer, defaultData[item].name, defaultData[item].isOn, defaultData[item].mode);
            else newData[item] = new Autobuyer(newData[item].layer, newData[item].name, newData[item].isOn, newData[item].mode);
            fixData(defaultData[item], newData[item]);
        } else if (defaultData[item] instanceof Dimension) {
            if (newData[item] === undefined) newData[item] = new Dimension(defaultData[item].type, defaultData[item].name, defaultData[item].amt, defaultData[item].level, defaultData[item].tier, defaultData[item].costDisp, defaultData[item].layer, defaultData[item].currency);
            else newData[item] = new Dimension(newData[item].type, newData[item].name, newData[item].amt, newData[item].level, newData[item].tier, newData[item].costDisp, newData[item].layer, newData[item].currency);
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


        if (item === "math" && newData[item]) {
            for (let layer in newData[item]) {
                if (newData[item][layer].showCorrect) {
                    newData[item][layer].showCorrect = false
                    generateNewProblem(layer)
                }
            }
        }

        // Explicitly handle player.upgrades conversion here for all layers
        if (item === "upgrades" && newData[item]) {
            for (let layer in newData[item]) {
                for (let upgradeId in newData[item][layer]) {
                    let upgrade = newData[item][layer][upgradeId];
                    if (typeof upgrade === "string") {
                        newData[item][layer][upgradeId] = new Decimal(upgrade);
                    }
                }
            }
        }

        if (item === "challenges" && newData[item]) {
            for (let layer in newData[item]) {
                for (let challengeId in newData[item][layer]) {
                    let challenge = newData[item][layer][challengeId];
                    if (typeof challenge === "string") {
                        newData[item][layer][challengeId] = new Decimal(challenge);
                    }
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
    let playerSave = localStorage.getItem("YooA");
    let optionsSave = localStorage.getItem("YooA_options");

    if (playerSave === null || playerSave === undefined) {
        Object.assign(player, getStartPlayer());
    } else {
        let loadedPlayer = JSON.parse(atob(playerSave));
        Object.assign(player, getStartPlayer());
        Object.assign(player, loadedPlayer);
        if (!player.tab) player.tab = "Main";
        fixSave();
    }

    if (optionsSave === null || optionsSave === undefined) {
        Object.assign(options, getStartOptions());
    } else {
        let loadedOptions = JSON.parse(atob(optionsSave));
        Object.assign(options, getStartOptions());
        Object.assign(options, loadedOptions);
        fixData(options, getStartOptions());
    }

    setTimeout(() => {
        var offline_t = (Date.now() - player.time) / 1000;
        gameLoop();
        if (options.offline) simulateOffline(offline_t);
        setInterval(gameLoop, 1000 / FPS);
    }, 100);
}

export function exportSave() {
    const saveData = {
        player: player,
        options: options
    };
    let str = btoa(JSON.stringify(saveData));
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
        let parsedSave = JSON.parse(atob(imported));

        if (parsedSave.player && parsedSave.options) {
            // Apply loaded player data
            let tempPlayer = Object.assign(getStartPlayer(), parsedSave.player);
            Object.assign(player, tempPlayer);
            fixSave();

            // Apply loaded options data
            let tempOptions = Object.assign(getStartOptions(), parsedSave.options);
            Object.assign(options, tempOptions);
            fixData(options, getStartOptions());

            save();

            const event = new CustomEvent('import-completed');
            window.dispatchEvent(event);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error("Invalid save format.");
        }
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
