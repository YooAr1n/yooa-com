import { reactive } from 'vue';

export const options = reactive(getStartOptions());
window.options = options;

export function getStartOptions() {
    return {
        autosave: true,
        autosaveInterval: 30,
        offline: true,
        confirmations: {
            YooAmatter: true
        }
    }
}

export function autoSave() {
    options.autosave = !options.autosave;
}

export function changeAutoInt() {
    let int = [5, 10, 20, 30, 60]
    options.autosaveInterval = int[(int.indexOf(options.autosaveInterval) + 1) % int.length]
}

export function changeOffline() {
    options.offline = !options.offline;
}