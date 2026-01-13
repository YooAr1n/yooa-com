# GitHub Copilot instructions — YooA Incremental

This file is aimed at AI coding agents and contributors to be immediately productive in this repository. Keep changes small and focused; prefer performance-preserving edits unless explicitly optimizing.

## Quick setup & commands ✅
- Install: `npm install`
- Dev server: `npm run serve` (open http://localhost:8080)
- Production build: `npm run build` (use `--modern` for modern-only builds)
- Analyze bundle: `npm run build:report`
- Deploy: `npm run deploy` (GitHub Pages)
- Lint: `npm run lint`
- Microbenchmarks: run `node perf-compare.js` or `node perf-test.js` for targeted hotspots

## High-level architecture 🧭
- Frontend: Vue 3 with Vue Router — code under `src/` and views in `src/views/`.
- Game logic: `src/incremental/` implements the core game loop, math, and layers.
  - `incremental.js` contains the player model (`getStartPlayer()`), global tick (`nextYooATick()`), and performance primitives (`yooaCache`, `perTickCache`, `cacheAllFuncs`).
  - `layersData.js` declares `gameLayers` (upgrades, milestones, effects) and is the main place to modify game rules.
  - `automation.js` implements autobuyers and timing.
- Big-number math is handled by `src/incremental/break_eternity.js` (Decimal). Prefer Decimal for numeric game values.
- Backend / Cloud: AWS Amplify configuration under `amplify/` and `src/aws-exports.js`.

## Project-specific patterns & conventions 🔧
- Game runs at 60 FPS. DONT throttle, and NEVER THINK ABOUT THROTTLING.
- Per-tick caching is essential: use `perTickCache(key, () => compute())` for expensive reads inside `layersData.js` and `incremental.js`.
  - Example: `perTickCache('YooA.problemGain', () => { ... })`.
- Wrap pure layer functions for fast memoization using `cacheAllFuncs(gameLayers)` (already invoked in `incremental.js`). Add functions to `gameLayers` to benefit from this.
- Hot-loop micro-optimizations are common:
  - Prebind Decimal methods and constants (see top of `incremental.js`) instead of repeated property lookups.
  - Avoid allocations in hot paths (reuse objects, avoid Array.join in tight loops).
- Player state is the canonical source of truth (`player` in `incremental.js`). If adding persistent state, add defaults in `getStartPlayer()`.
- Use `cloneDecimals()` helper when duplicating data structures containing Decimal instances.

## Where to change game rules & UI 📝
- Add new upgrades/milestones/achievements in `src/incremental/layersData.js` under the appropriate `gameLayers` entry.
  - Use cached helpers like `_hasU(layer,id)`, `_upgEff(layer,id)`, `_playerVal(path)` for tidy, performant code.
- For UI changes, update components in `src/components/` and route views in `src/views/`.
- If adding new player fields, update `getStartPlayer()` and save/load functions in `save.js`.

## Debugging & performance tips ⚡
- In the browser console:
  - Inspect `yooaCache.entries.size` (cache pressure)

  - Watch `window.player` for state
- Use project microbenchmarks (`perf-*.js`) to verify perf deltas before/after changes.
- Follow existing style: prefer clarity + micro-optimizations in performance-sensitive code; keep complex math in `layersData.js` or `incremental.js` where Decimal helpers are available.

## Tests & CI expectations 🧪
- There are no automated unit tests in the repo. Before merging: run `npm run lint`, `npm run build`, and manual smoke tests (serve the app and sanity-check major flows).

## Integration notes & gotchas ⚠️
- The codebase targets tiny bundle sizes—avoid adding large dependencies.
- Vue CLI (not Vite) is used; pass `--modern` to `npm run build` when targeting modern browsers only.
- Amplify artifacts live in `amplify/` and include generated files — use Amplify CLI when modifying backend resources.

## Examples to reference 🔍
- Per-tick cache usage: `src/incremental/layersData.js` (e.g., `YooA.problemGain`).
- Player schema: `src/incremental/incremental.js` (`getStartPlayer`).
- Autobuyer patterns: `src/incremental/automation.js`.
- Benchmark/normalize optimization example: `perf-compare.js` and `src/incremental/break_eternity.js`.

---
If anything here is unclear or you'd like more specifics (e.g., exact code snippets for adding a new upgrade or a perf checklist for PRs), tell me which section to expand and I’ll update this file. ✨
