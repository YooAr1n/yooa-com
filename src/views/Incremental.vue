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
		<a href="javascript:void(0)" 
			@click="changeTab('Stats')" 
			:class="{ active: currentTab === 'Stats' }">
			Stats
		</a>
		<a href="javascript:void(0)" 
			@click="changeTab('Achievements')" 
			:class="{ active: currentTab === 'Achievements' }">
			Achievements
		</a>
		<a href="javascript:void(0)" 
			@click="changeTab('Changelog')" 
			:class="{ active: currentTab === 'Changelog' }">
			Changelog
		</a>
		</div>

		<!-- Header Component -->
		<Header :msg="headerMessage" ref="header"></Header>

		<!-- Main Content -->
		<Main v-if="currentTab === 'Main'"></Main>
		<Options v-if="currentTab === 'Options'"></Options>
		<Stats v-if="currentTab === 'Stats'"></Stats>
		<Achievements v-if="currentTab === 'Achievements'"></Achievements>
		<Changelog v-if="currentTab === 'Changelog'"></Changelog>
		<Notification></Notification>
		<br><br><br><br>
		<ProgressBar></ProgressBar>
	</div>
</template>

<script>
import { player, start } from '@/incremental/incremental.js'; // Import player as reactive state
import Header from '@/components/Header.vue';
import Main from '@/components/Main.vue';
import Options from '@/components/Options.vue';
import Stats from '@/components/Stats.vue';
import Achievements from '@/components/Achievements.vue';
import Changelog from '@/components/Changelog.vue';
import Notification from '@/components/Notification.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
	components: {
		Header,
		Main,
		Options,
		Stats,
		Achievements,
		Changelog,
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
			// Get the first part of player.tab before the '-'
			return this.player.tab.split('-')[0];
		},
		gameName() {
			return 'YooA Incremental v0.1'
		}
	},
	mounted() {
		document.title = this.gameName;
		start();
		this.headerMessage = this.currentTab === 'Main' ? this.gameName : this.currentTab;
	},
	methods: {
		closeNav() {
			// Close the navigation sidebar
			let nav = document.getElementById('mySidenav');
			nav.style.width = '0';
		},
		changeTab(tabName) {
			// Update player.tab to switch tabs
			this.player.tab = tabName + "-" + this.player.subtab;

			// Update header message based on active tab
			this.headerMessage = tabName === 'Main' ? this.gameName : tabName;
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
  