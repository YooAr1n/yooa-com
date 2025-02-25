<template>
	<div class="main">
		<!-- Sidebar Navigation -->
		<div id="mySidenav" class="sidenav">
			<a href="javascript:void(0)" class="closebtn" @click="closeNav()">&times;</a>
			<a href="javascript:void(0)" @click="changeTab('Main')" :class="{ active: currentTab === 'Main' }">
				Main
			</a>
			<a v-if="unlocked('YooAmatter')" href="javascript:void(0)" @click="changeTab('YooAmatter')"
				:class="{ active: currentTab === 'YooAmatter' }">
				YooAmatter
			</a>
			<a v-if="autoUnlocked" href="javascript:void(0)" @click="changeTab('Automation')"
				:class="{ active: currentTab === 'Automation' }">
				Arin
			</a>
			<a href="javascript:void(0)" @click="changeTab('Options')" :class="{ active: currentTab === 'Options' }">
				Options
			</a>
			<a href="javascript:void(0)" @click="changeTab('Stats')" :class="{ active: currentTab === 'Stats' }">
				Stats
			</a>
			<a href="javascript:void(0)" @click="changeTab('Achievements')"
				:class="{ active: currentTab === 'Achievements' }">
				Achievements
			</a>
			<a href="javascript:void(0)" @click="changeTab('Changelog')"
				:class="{ active: currentTab === 'Changelog' }">
				Changelog
			</a>
		</div>

		<!-- Header Component -->
		<Header :msg="headerMessage" ref="header"></Header>

		<!-- Main Content -->
		<Main v-if="currentTab === 'Main'" ref="main"></Main>
		<YooAmatter v-if="currentTab === 'YooAmatter'"></YooAmatter>
		<Automation v-if="currentTab === 'Automation'"></Automation>
		<Options v-if="currentTab === 'Options'"></Options>
		<Stats v-if="currentTab === 'Stats'"></Stats>
		<Achievements v-if="currentTab === 'Achievements'"></Achievements>
		<Changelog v-if="currentTab === 'Changelog'"></Changelog>
		<Notification></Notification>
		<Offline></Offline>
		<br><br><br><br>
		<ProgressBar></ProgressBar>
	</div>
</template>

<script>
import { gameLayers } from '@/incremental/main';
import { completedAnyChallenge, hasAchievement, maxAllDimensions, player, start } from '@/incremental/incremental.js'; // Import player as reactive state
import Header from '@/components/Header.vue';
import Main from '@/components/Main.vue';
import YooAmatter from '@/components/YooAmatter.vue';
import Options from '@/components/Options.vue';
import Stats from '@/components/Stats.vue';
import Achievements from '@/components/Achievements.vue';
import Changelog from '@/components/Changelog.vue';
import Notification from '@/components/comps/Notification.vue';
import Offline from '@/components/comps/Offline.vue';
import ProgressBar from '@/components/comps/ProgressBar.vue';
import Automation from '@/components/Automation.vue';

export default {
	components: {
		Header,
		Main,
		YooAmatter,
		Automation,
		Options,
		Stats,
		Achievements,
		Changelog,
		Notification,
		Offline,
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
			return this.player.tab;
		},
		gameName() {
			return 'YooA Incremental v0.4 (WIP)'
		},
		autoUnlocked() {
			return completedAnyChallenge()
		},
	},
	mounted() {
		document.title = this.gameName;
		start();
		this.headerMessage = this.currentTab === 'Main' ? this.gameName : this.currentTab;
		window.addEventListener("keydown", this.handleKeydown);
	},
	beforeUnmount() {
		// Remove the event listener when the component is destroyed
		window.removeEventListener("keydown", this.handleKeydown);
	},
	methods: {
		unlocked(layer) {
			return gameLayers[layer].unlocked()
		},
		handleKeydown(event) {
			if (hasAchievement(27) && (event.key === 'm' || event.key === 'M')) {
				maxAllDimensions("YooA")
			}
		},
		closeNav() {
			// Close the navigation sidebar
			let nav = document.getElementById('mySidenav');
			nav.style.width = '0';
		},
		changeTab(tabName) {
			// Update player.tab to switch tabs
			this.player.tab = tabName;

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