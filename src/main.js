import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./shims";
import "./format";
import "./incremental/incremental.js";
import "./incremental/menu.js";
import "./incremental/options.js";
import "./incremental/save.js";


const app = createApp(App)
app.use(router).mount('#app')