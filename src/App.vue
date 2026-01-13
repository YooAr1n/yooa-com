<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/math">YooA Math</router-link>
    <router-link to="/cryptography">Cryptography</router-link>
    <router-link to="/statistics">Statistics</router-link>
    <router-link to="/illions">YooA-illions</router-link>
    <router-link to="/numbers">Korean Numbers</router-link>
    <router-link to="/incremental">YooA Incremental</router-link>
  </nav>
  <router-view/>
</template>

<style>
#app {
  font-family: monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: blue;
  font-size: 12pt;
}

nav {
  overflow: hidden;
	top: 0;
	background-color: #333;
	width: 100%;
	box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
	z-index: 1;
}

nav a {
  font-weight: bold;
  color: #046daa;
  text-decoration: none;
  font-size: 17pt;
  padding: 14px 16px;
  float: left;
}

nav a:hover {
  background-color: #ddd;
  color: black;
}

nav a.router-link-exact-active {
  color: white;
  background-color: #046daa;
}

.softcapped {
  position: relative;
  display: inline-block;
  font-size: 1rem;
  color: #d03b78;
  background: linear-gradient(to right, #fff0f9, #fcd9ea);
  border: 1px solid #fca3d2;
  border-radius: 12px;
  padding: 4px 10px;
  margin-left: 6px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(252, 163, 210, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 1px white;
}

.softcapped:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(252, 163, 210, 0.6);
}

.softcapped .tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff8fb;
  color: #c91b6f;
  border: 1px solid #fca3d2;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: normal;
  text-align: center;
  z-index: 10;
  box-shadow: 0 0 8px rgba(252, 163, 210, 0.3);
  width: 220px;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.softcapped:hover .tooltip,
.softcapped .tooltip:hover {
  opacity: 1;
  pointer-events: auto;
}

.scaled {
  position: relative;
  display: inline-block;
  font-size: 1rem;
  color: #3b78d0;
  background: linear-gradient(to right, #f0f5ff, #dbeaff);
  border: 1px solid #a3c2f0;
  border-radius: 12px;
  padding: 4px 10px;
  margin-left: 6px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(163, 194, 240, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 1px white;
}

.scaled:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(163, 194, 240, 0.6);
}

.scaled .tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f4f8ff;
  color: #1b4fae;
  border: 1px solid #a3c2f0;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: normal;
  text-align: center;
  z-index: 10;
  box-shadow: 0 0 8px rgba(163, 194, 240, 0.3);
  width: 220px;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.scaled:hover .tooltip,
.scaled .tooltip:hover {
  opacity: 1;
  pointer-events: auto;
}

/* ✿ Blooming (pink blossoms) */
.scaled.blooming {
  color: #d03b78;
  background: linear-gradient(to right, #fff0f9, #fcd9ea);
  border-color: #fca3d2;
  box-shadow: 0 1px 4px rgba(252,163,210,0.3);
}
.scaled.blooming:hover {
  box-shadow: 0 2px 8px rgba(252,163,210,0.6);
}

/* ✿ Cascading (teal waterfalls) */
.scaled.cascading {
  color: #1e7f7f;
  background: linear-gradient(to right, #e0f7f7, #c2eff0);
  border-color: #7fd5d5;
  box-shadow: 0 1px 4px rgba(127,213,213,0.3);
}
.scaled.cascading:hover {
  box-shadow: 0 2px 8px rgba(127,213,213,0.6);
}

/* ✿ Radiant (gold glow) */
.scaled.radiant {
  color: #b27f1e;
  background: linear-gradient(to right, #fff9e6, #f8eac2);
  border-color: #e0c07f;
  box-shadow: 0 1px 4px rgba(224,192,127,0.3);
}
.scaled.radiant:hover {
  box-shadow: 0 2px 8px rgba(224,192,127,0.6);
}

/* ✿ Ethereal (purple mist) */
.scaled.ethereal {
  color: #6e1e7f;
  background: linear-gradient(to right, #f4e6ff, #e2c2f0);
  border-color: #c27fd5;
  box-shadow: 0 1px 4px rgba(194,127,213,0.3);
}
.scaled.ethereal:hover {
  box-shadow: 0 2px 8px rgba(194,127,213,0.6);
}

/* 🌸 Blooming tooltip */
.scaled.blooming .tooltip {
  background-color: #fff0f9;
  color: #d03b78;
  border-color: #fca3d2;
  box-shadow: 0 0 8px rgba(252,163,210,0.3);
}

/* 🌊 Cascading tooltip */
.scaled.cascading .tooltip {
  background-color: #e0f7f7;
  color: #1e7f7f;
  border-color: #7fd5d5;
  box-shadow: 0 0 8px rgba(127,213,213,0.3);
}

/* ☀️ Radiant tooltip */
.scaled.radiant .tooltip {
  background-color: #fff9e6;
  color: #b27f1e;
  border-color: #e0c07f;
  box-shadow: 0 0 8px rgba(224,192,127,0.3);
}

/* 🌌 Ethereal tooltip */
.scaled.ethereal .tooltip {
  background-color: #f4e6ff;
  color: #6e1e7f;
  border-color: #c27fd5;
  box-shadow: 0 0 8px rgba(194,127,213,0.3);
}

.yooa-glow {
  filter: drop-shadow(0 0 6px currentColor);
  contain: paint;
  transform: translateZ(0);
}


</style>
