import { reactive } from 'vue';
import { scrollNextMessage } from '@/components/NewsTicker.vue'; // Import the method from the component

export const options = reactive(getStartOptions());
window.options = options;

export function getStartOptions() {
    return {
        autosave: true,
        autosaveInterval: 30,
        offline: true,
        news: true,
        confirmations: {
            YooAmatter: true
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

export function changeOffline() {
    options.offline = !options.offline;
}

export function changeNews() {
    options.news = !options.news;
}
