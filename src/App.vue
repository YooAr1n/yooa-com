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
	position: fixed;
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
</style>
