<template>
	<div class="main">
		<!-- Sidebar Navigation -->
		<div id="mySidenav" class="sidenav">
		<a href="javascript:void(0)" class="closebtn" @click="closeNav()">&times;</a>
		<a href="javascript:void(0)" 
			@click="changeTab('Main')" 
			:class="{ active: currentTab === 'Main' }">
			Main
		</a>
		<a href="javascript:void(0)" 
			@click="changeTab('Options')" 
			:class="{ active: currentTab === 'Options' }">
			Options
		</a>
		</div>

		<!-- Header Component -->
		<Header :msg="headerMessage" ref="header"></Header>

		<!-- Main Content -->
		<Main v-show="currentTab === 'Main'"></Main>
		<Options v-show="currentTab === 'Options'"></Options>
		<Notification></Notification>
		<ProgressBar></ProgressBar>
	</div>
</template>

<script>
import { player } from '@/incremental/incremental.js'; // Import player as reactive state
import Header from '@/components/Header.vue';
import Main from '@/components/Main.vue';
import Options from '@/components/Options.vue';
import Notification from '@/components/Notification.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
	components: {
		Header,
		Main,
		Options,
		Notification,
		ProgressBar,
	},
	data() {
		return {
			player, // Reactive player object
			headerMessage: 'YooA Incremental',
		};
	},
	computed: {
		// Bind player.tab to a computed property for better reactivity
		currentTab() {
			return this.player.tab;
		},
	},
	mounted() {
		document.title = 'YooA Incremental';
		this.headerMessage = this.currentTab === 'Main' ? 'YooA Incremental' : this.currentTab;
	},
	methods: {
		closeNav() {
			// Close the navigation sidebar
			let nav = document.getElementById('mySidenav');
			nav.style.width = '0';
		},
		changeTab(tabName) {
			// Update player.tab to switch tabs
			this.player.tab = tabName;

			// Update header message based on active tab
			this.headerMessage = tabName === 'Main' ? 'YooA Incremental' : tabName;
		}
	}

};
</script>

<style scoped>
/* Main Container */
div.main {
	text-align: center;
	color: white;
	background-color: black;
}

/* Sidebar Navigation */
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
	padding: 8px;
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
	color: #b9e5ff;
}

/* Active Tab Styling */
.sidenav a.active {
	background-color: #b9e5ff;
	color: #991893;
}
</style>
  