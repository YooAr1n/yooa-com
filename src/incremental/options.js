import { reactive } from 'vue';

export const options = reactive(getStartOptions());
window.options = options;

export function getStartOptions() {
    return {
        autosave: true,
        autosaveInterval: 30,
        offline: true,
        news: true,
        notation: "Scientific",
        confirmations: {
            YooAmatter: true,
            YooAity: true
        }
    }
}

export function autoSave() {
    options.autosave = !options.autosave;
}

export function changeAutoInt() {
    let int = [5, 10, 20, 30, 60];
    options.autosaveInterval = int[(int.indexOf(options.autosaveInterval) + 1) % int.length];
}

export function changeNotation() {
    let nots = ["Scientific", "Engineering", "Standard", "Standard (Long Scale)", "Mixed Scientific", "Mixed Scientific (Long Scale)", "Mixed Engineering", "Mixed Engineering (Long Scale)", "Logarithm", "Mixed Logarithm", "Mixed Logarithm (Long Scale)", "Letters", "Cancer", "YooA", "Arin", "Blind", "YesNo"];
    options.notation = nots[(nots.indexOf(options.notation) + 1) % nots.length];
}

export function changeOffline() {
    options.offline = !options.offline;
}

export function changeNews() {
    options.news = !options.news;
}
