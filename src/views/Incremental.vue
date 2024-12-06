<template>
  <div class="main">
    <div id = "mySidenav" class = "sidenav">
		<a href = "javascript:void(0)" class="closebtn" @click="closeNav()">&times;</a>
		<a href="javascript:void(0)" @click="changeTab('Main')">Main</a>
    	<a href="javascript:void(0)" @click="changeTab('Options')">Options</a>
	</div>
	<Header :msg="headerMessage"  ref="header"></Header>
    <Main v-if="player.tab == 'Main'"></Main>
	<Options v-if="player.tab == 'Options'"></Options>
    <ProgressBar></ProgressBar>
  </div>
</template>

<script>
import { player } from '@/incremental/incremental.js'; // Import player from incremental.js
import Header from '@/components/Header.vue'
import Main from '@/components/Main.vue'
import Options from '@/components/Options.vue'
import ProgressBar from '@/components/ProgressBar.vue'

export default {
  mounted() {
	document.title = "YooA Incremental"
  },
  components: {
	Header,
    Main,
	Options,
    ProgressBar
  },
  data() {
    return {
      player,
	  headerMessage: "YooA Incremental"
    };
  },
  methods:{
    closeNav() {
      let nav = document.getElementById("mySidenav")
      nav.style.width = "0";
    },
	changeTab(tabName) {
      this.player.tab = tabName;
	  this.headerMessage = tabName == "Main" ? "YooA Incremental" : tabName
    }
  }
}
</script>

<style scoped>
div.main {
  text-align: center;
  color: white;
  background-color: black;
}

.sidenav {
	height: 100%;
	width: 0;
	position: fixed;
	z-index: 1;
	top: 0;
	left: 0;
	background-color: #991893;
	overflow-x: hidden;
	transition: 0.5s;
	padding-top: 60px;
}
  
.sidenav a {
	padding: 8px 8px 8px 32px;
	text-decoration: none;
	font-size: 25px;
	color: #b9e5ff;
	display: block;
	transition: 0.3s;
}

.sidenav a:hover {
	color: #f1f1f1;
}

.sidenav .closebtn {
	position: absolute;
	top: 0;
	right: 25px;
	font-size: 36px;
	margin-left: 50px;
	color: #b9e5ff;
}
</style>

