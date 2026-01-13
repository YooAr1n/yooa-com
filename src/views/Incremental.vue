<template>
	<div class="main">
		<!-- Sidebar Navigation -->
		<div id="mySidenav" class="sidenav">
			<a href="javascript:void(0)" class="closebtn" @click="closeNav()">&times;</a>

			<a href="javascript:void(0)" @click="changeTab('Main')" :class="{ active: currentTab === 'Main' }">
				Main
			</a>

			<!-- use cached booleans instead of calling unlock functions inline -->
			<a v-if="isYooAmatterUnlocked" href="javascript:void(0)" @click="changeTab('YooAmatter')"
				:class="{ active: currentTab === 'YooAmatter' }">
				YooAmatter
			</a>
			<a v-if="isYooAityUnlocked" href="javascript:void(0)" @click="changeTab('YooAity')"
				:class="{ active: currentTab === 'YooAity' }">
				YooAity
			</a>

			<a v-if="isAutoUnlocked" href="javascript:void(0)" @click="changeTab('Automation')"
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
			<a href="javascript:void(0)" @click="changeTab('Leaderboard')"
				:class="{ active: currentTab === 'Leaderboard' }">
				Leaderboard
			</a>
			<a href="javascript:void(0)" @click="changeTab('Help')"
				:class="{ active: currentTab === 'Help' }">
				Help
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
		<YooAity v-if="currentTab === 'YooAity'"></YooAity>
		<Automation v-if="currentTab === 'Automation'"></Automation>
		<Options v-if="currentTab === 'Options'"></Options>
		<Stats v-if="currentTab === 'Stats'"></Stats>
		<Achievements v-if="currentTab === 'Achievements'"></Achievements>
		<Leaderboard v-if="currentTab === 'Leaderboard'"></Leaderboard>
		<Help v-if="currentTab === 'Help'"></Help>
		<Changelog v-if="currentTab === 'Changelog'"></Changelog>
		<Notification></Notification>
		<Offline></Offline>
		<br><br><br><br>
		<ProgressBar></ProgressBar>
	</div>
</template>

<script>
import { gameLayers } from '@/incremental/layersData';
import { completedAnyChallenge, hasAchievement, maxAllDimensionRanks, maxAllDimensions, player, start } from '@/incremental/incremental.js';
import Header from '@/components/Header.vue';
import Main from '@/components/Main.vue';
import YooAmatter from '@/components/YooAmatter.vue';
import YooAity, { maxAllHJUpgrades, maxAllMMUpgrades, maxAllSHUpgrades, maxAllYBUpgrades, maxAllYEUpgrades } from '@/components/YooAity.vue';
import Options from '@/components/Options.vue';
import Stats from '@/components/Stats.vue';
import Achievements from '@/components/Achievements.vue';
import Changelog from '@/components/Changelog.vue';
import Notification from '@/components/comps/Notification.vue';
import Offline from '@/components/comps/Offline.vue';
import ProgressBar from '@/components/comps/ProgressBar.vue';
import Leaderboard from '@/components/Leaderboard.vue';
import Automation, { maxAllARUpgrades } from '@/components/Automation.vue';
import Help from '@/components/Help.vue';
import { hasMilestone, hasUpgrade } from '@/incremental/mainFuncs';

export default {
	components: {
		Header,
		Main,
		YooAmatter,
		YooAity,
		Automation,
		Options,
		Stats,
		Achievements,
		Leaderboard,
		Help,
		Changelog,
		Notification,
		Offline,
		ProgressBar,
	},
	data() {
		return {
			tab: "Main",
			headerMessage: 'YooA Incremental',

			// cached unlock booleans (reactive)
			isYooAmatterUnlocked: false,
			isYooAityUnlocked: false,
			isAutoUnlocked: false
		};
	},
	computed: {
		// Bind player.tab to a computed property for better reactivity
		currentTab() {
			return this.tab;
		},
		gameName() {
			return 'YooA Incremental v1.0'
		},
	},
	mounted() {
		document.title = this.gameName;

		// start() may synchronously or asynchronously load the saved player.
		// We call start() and then immediately schedule the "updateUnlocked" check.
		start();

		// If player already contains a saved tab, reflect it now. If not, start() (or subsequent events) will update.
		if (player && player.tab) {
			this.tab = player.tab;
			this.headerMessage = this.tab === 'Main' ? this.gameName : this.tab;
		}

		// Listen for relevant game events and update the cached unlock booleans.
		// GAME_EVENT.UPDATE is dispatched often; updateUnlocked is cheap and uses change-only writes.
		window.addEventListener("GAME_EVENT.UPDATE", this.updateUnlocked);
		window.addEventListener("GAME_EVENT.SAVE_LOADED", this.updateUnlocked);
		window.addEventListener("GAME_EVENT.PRESTIGE_UPDATE", this.updateUnlocked);

		// keyboard handling
		window.addEventListener("keydown", this.handleKeydown);

		// run once now to reflect current state immediately
		this.updateUnlocked();
	},
	beforeUnmount() {
		// Remove the event listeners when the component is destroyed
		window.removeEventListener("keydown", this.handleKeydown);
		window.removeEventListener("GAME_EVENT.UPDATE", this.updateUnlocked);
		window.removeEventListener("GAME_EVENT.SAVE_LOADED", this.updateUnlocked);
		window.removeEventListener("GAME_EVENT.PRESTIGE_UPDATE", this.updateUnlocked);
	},
	methods: {
		// updateUnlocked reads the current game state and updates the three booleans.
		// It only writes to Vue's reactive data when the value changed — this keeps re-renders minimal.
		updateUnlocked() {
			try {
				// compute unlocks quickly using existing logic
				const yooAmatter = !!(gameLayers.YooAmatter && typeof gameLayers.YooAmatter.unlocked === 'function' && gameLayers.YooAmatter.unlocked());
				const yooAity = !!(gameLayers.YooAity && typeof gameLayers.YooAity.unlocked === 'function' && gameLayers.YooAity.unlocked());
				const autoUnl = completedAnyChallenge() || (gameLayers.YooAity && typeof gameLayers.YooAity.unlocked === 'function' && gameLayers.YooAity.unlocked());

				// only set when different to avoid unnecessary reactive updates
				if (this.isYooAmatterUnlocked !== yooAmatter) this.isYooAmatterUnlocked = yooAmatter;
				if (this.isYooAityUnlocked !== yooAity) this.isYooAityUnlocked = yooAity;
				if (this.isAutoUnlocked !== autoUnl) this.isAutoUnlocked = autoUnl;

				// keep header in sync with player's saved tab if present
				if (player && player.tab && player.tab !== this.tab) {
					this.tab = player.tab;
					this.headerMessage = this.tab === 'Main' ? this.gameName : this.tab;
				}
			} catch (err) {
				// swallow errors from gameLayers until game fully initialized
				// but still try to set defaults
				if (!this.isYooAmatterUnlocked) this.isYooAmatterUnlocked = false;
				if (!this.isYooAityUnlocked) this.isYooAityUnlocked = false;
				if (!this.isAutoUnlocked) this.isAutoUnlocked = false;
			}
		},
		unlocked(layer) {
			// keep this available for ad-hoc checks but template now uses cached booleans
			try {
				return gameLayers[layer].unlocked();
			} catch (e) {
				return false;
			}
		},
		autoUnlocked() {
			// fallback helper; template uses isAutoUnlocked
			return this.isAutoUnlocked;
		},
		handleKeydown(event) {
			// keyboard shortcuts — unchanged
			if (hasAchievement(27) && (event.key === 'm' || event.key === 'M')) {
				maxAllDimensions("YooA")
			}
			if (hasMilestone("YooAity", 3) && (event.key === 'x' || event.key === 'X')) {
				maxAllDimensions("YooA", true)
				maxAllDimensions("YooAmatter")
			}
			if (hasMilestone("YooAity", 14) && (event.key === 'a' || event.key === 'A')) {
				maxAllDimensions("Shiah")
				if (hasUpgrade("YooAity", 44)) maxAllYEUpgrades()
				if (hasUpgrade("Hyojung", 21)) maxAllDimensionRanks("YooA")
				if (hasAchievement(63)) {
					maxAllSHUpgrades()
					maxAllYBUpgrades()
				}
				if (hasUpgrade("YooAity", 54)) {
					maxAllARUpgrades()
					maxAllHJUpgrades()
					maxAllMMUpgrades()
				}
			}
		},
		closeNav() {
			// Close the navigation sidebar
			let nav = document.getElementById('mySidenav');
			if (nav) nav.style.width = '0';
		},
		changeTab(tabName) {
			// Update player.tab to switch tabs and update header
			this.tab = tabName;
			if (player) player.tab = tabName;
			this.headerMessage = tabName === 'Main' ? this.gameName : tabName;

			// also refresh unlocks immediately (in case change triggered unlock changes)
			this.updateUnlocked();
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
	z-index: 100; /* ensure sits above many site-level elements */
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