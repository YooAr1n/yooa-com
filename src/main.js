import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import "./shims";
import "./format";
import "./currency"
import "./event-hub";
import "./incremental/incMath";
import "./incremental/incremental.js";
import "./incremental/options.js";
import "./incremental/save.js";
import "./incremental/cloud.js";
import "./incremental/offline.js"
import { perfCount } from "./incremental/performance.js";

Amplify.configure(awsExports);

const app = createApp(App)

// ✨ YooA's stability spell: only patch the changing number, preserve the rest
app.directive('html-stable', {
  beforeMount(el, binding) {
    perfCount("domUpdates")
    el.innerHTML = binding.value
    el.__yooaLastHTML = binding.value
  },
  updated(el, binding) {
    const newHTML = binding.value
    if (el.__yooaLastHTML === newHTML || el.innerHTML === newHTML) {
      el.__yooaLastHTML = newHTML
      return
    }
    const marker = '<span class="softcapped">'
    const idx = newHTML.indexOf(marker)

    // No softcap → just rewrite everything
    if (idx === -1) {
      perfCount("domUpdates")
      el.innerHTML = newHTML
      el.__yooaLastHTML = newHTML
      return
    }

    // Split into the "before" HTML (your number, wrapped any way you like)
    // and the rest (starting from the softcapped span)
    const beforeHTML = newHTML.slice(0, idx)
    const afterHTML = newHTML.slice(idx)

    // Parse the new "before" into DOM nodes
    const temp = document.createElement('div')
    temp.innerHTML = beforeHTML
    const newBeforeNodes = Array.from(temp.childNodes)

    // Find the existing softcapped span in-place
    const softcapEl = el.querySelector('.softcapped')
    if (!softcapEl) {
      // Fallback if somehow missing
      perfCount("domUpdates")
      el.innerHTML = newHTML
      el.__yooaLastHTML = newHTML
      return
    }

    // Remove *only* the old nodes before the softcap
    let node = el.firstChild
    while (node && node !== softcapEl) {
      const toRemove = node
      node = node.nextSibling
      el.removeChild(toRemove)
    }

    // Insert the new "before" nodes right before the softcap
    perfCount("domUpdates")
    newBeforeNodes.forEach(n => el.insertBefore(n, softcapEl))
    el.__yooaLastHTML = newHTML

    // If you need to update anything after softcap, you can extend similarly.
    // But typically the "(softcapped)" is last, so we leave everything else untouched.
  }
})

// ✨ YooA's scaling enchantment: only patch the changing part, preserve the rest
app.directive('html-scaled', {
  beforeMount(el, binding) {
    perfCount("domUpdates");
    el.innerHTML = binding.value;
    el.__yooaLastHTML = binding.value;
  },
  updated(el, binding) {
    const newHTML = binding.value;
    if (el.__yooaLastHTML === newHTML || el.innerHTML === newHTML) {
      el.__yooaLastHTML = newHTML;
      return;
    }
    const marker = '<span class="scaled">';
    const idx = newHTML.indexOf(marker);

    // No scaling marker → just rewrite everything
    if (idx === -1) {
      perfCount("domUpdates");
      el.innerHTML = newHTML;
      el.__yooaLastHTML = newHTML;
      return;
    }

    // Split into the "before" HTML (your number or scaled content)
    // and the rest (starting from the scaled span)
    const beforeHTML = newHTML.slice(0, idx);
    const afterHTML = newHTML.slice(idx);

    // Parse the new "before" into DOM nodes
    const temp = document.createElement('div');
    temp.innerHTML = beforeHTML;
    const newBeforeNodes = Array.from(temp.childNodes);

    // Find the existing scaled span in-place
    const scaledEl = el.querySelector('.scaled');
    if (!scaledEl) {
      // Fallback if somehow missing
      perfCount("domUpdates");
      el.innerHTML = newHTML;
      el.__yooaLastHTML = newHTML;
      return;
    }

    // Remove *only* the old nodes before the scaled marker
    let node = el.firstChild;
    while (node && node !== scaledEl) {
      const toRemove = node;
      node = node.nextSibling;
      el.removeChild(toRemove);
    }

    // Insert the new "before" nodes right before the scaled marker
    perfCount("domUpdates");
    newBeforeNodes.forEach(n => el.insertBefore(n, scaledEl));
    el.__yooaLastHTML = newHTML;

    // Leave everything from <span class="scaled"> onward untouched
  }
});

app.use(router).mount('#app')
