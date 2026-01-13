<template>
    <div class="changelog">
        <!-- Loop through the major versions -->
        <div v-for="(majorInfo, majorVersion) in groupedChangelog" :key="majorVersion" class="version-group">
            <h3 @click="toggleVersion(majorVersion)" :class="{ 'expanded': isVersionExpanded(majorVersion) }">
                {{ majorVersion }} - {{ majorInfo.title }} ({{ majorInfo.date }})
            </h3>

            <!-- Show Major version description with animation -->
            <transition name="expand-collapse">
                <div v-if="isVersionExpanded(majorVersion)" class="major-desc">
                    <!-- Bullet points for Major version description -->
                    <ul>
                        <li v-for="(desc, index) in majorInfo.description" :key="index">{{ desc }}</li>
                    </ul>

                    <!-- Loop through minor versions under the major version -->
                    <div v-for="(minorInfo, minorVersion) in majorInfo.minors" :key="minorVersion"
                        class="minor-version-group">
                        <h4 @click="toggleVersion(minorVersion, majorVersion)"
                            :class="{ 'expanded': isVersionExpanded(minorVersion, majorVersion) }">
                            {{ minorVersion }} - {{ minorInfo.title }} ({{ getVersionDate(minorVersion) }})
                        </h4>

                        <!-- Show Minor version description with animation -->
                        <transition name="expand-collapse">
                            <div v-if="isVersionExpanded(minorVersion, majorVersion)" class="minor-desc">
                                <!-- Bullet points for Minor version description -->
                                <ul>
                                    <li v-for="(desc, index) in minorInfo.description" :key="index">{{ desc }}</li>
                                </ul>

                                <!-- Loop through patch versions under the minor version -->
                                <div v-for="patchEntry in minorInfo.patches" :key="patchEntry.version"
                                    class="patch-version-group">
                                    <h5 @click="toggleVersion(patchEntry.version, minorVersion)"
                                        :class="{ 'expanded': isVersionExpanded(patchEntry.version, minorVersion) }">
                                        {{ patchEntry.version }} - {{ patchEntry.title }} ({{ patchEntry.date }})
                                    </h5>

                                    <!-- Show Patch version description with animation -->
                                    <transition name="expand-collapse">
                                        <ul v-if="isVersionExpanded(patchEntry.version, minorVersion)">
                                            <li v-for="(desc, index) in patchEntry.description" :key="index">{{ desc }}
                                            </li>
                                        </ul>
                                    </transition>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    name: "Changelog",
    data() {
        return {
            changelogEntries: [
                {
                    version: "v0", title: "Start of Game", date: "2024-11-25",
                    description: [
                        "Start. – The initial release of the game framework.",
                        "Added main menu. – Introduced the main screen where players can start the game.",
                        "Added options menu. – Added settings like Save, Export, Import, Auto Save, and HARD RESET.",
                        "Implemented basic UI. – Designed the user interface for navigating the game.",
                        "Auto Save Feature. – Auto Save is now ON by default with an interval of 30 seconds."
                    ]
                },
                {
                    version: "v0.1", title: "First Steps", date: "2024-12-24",
                    description: [
                        "Added Achievements. – Introduced a tracking system for player milestones and rewards.",
                        "Added Changelog. – Added a changelog feature to track updates and changes in the game.",
                        "Added Statistics. – Introduced a statistics system to track player progress and game data.",
                        "Save/Load functionality. – Players can now save, load, and export their game progress.",
                        "Added HARD RESET option. – Players can now reset the game to its default state.",
                        "Bug fixes and stability improvements. – Fixed minor issues to improve the overall stability of the game."
                    ]
                },
                {
                    version: "v0.2",
                    title: "Beyond the Basics",
                    date: "2025-01-15",
                    description: [
                        "Added YooAmatter Prestige Layer. – Introduced YooAmatter, allowing players to prestige for powerful boosts.",
                        "Added 3 New Dimensions. – Expanded gameplay with additional YooA Dimensions.",
                        "New Upgrades. – Added more upgrades to enhance progression and unlock new features.",
                        "Expanded Achievements. – Added a new row of achievements to reward milestone accomplishments.",
                        "Gameplay Enhancements. – Improved mechanics and scaling to balance progression.",
                        "Minor Bug Fixes. – Fixed various issues for smoother gameplay."
                    ]
                },
                {
                    version: "v0.3",
                    title: "Arin's Arrival & YooAmatter Trials",
                    date: "2025-01-29",
                    description: [
                        "Added Arin. – Arin from Oh My Girl joins the game! She's YooA's dear friend and a true bundle of joy, now helping by autobuying for YooA.",
                        "Introduced YooAmatter Challenges. – A new layer of difficulty! Take on YooAmatter-based trials to push your progression further.",
                        "More Upgrades. – Additional upgrades to enhance YooA Points and YooAmatter gains.",
                        "Expanded Achievements. – A new row of achievements awaits those who seek to master the labyrinth.",
                        "YooA Point Scale in Stats. – Now showing how your YooA Points scale in relation to real-world physical quantities.",
                        "Added Offline Progress. – The game now calculates progress while you're away, so you continue earning even when not playing!"
                    ]
                },
                {
                    version: "v0.4",
                    title: "Foundations of YooAmatter",
                    date: "2025-02-25",
                    description: [
                        "Added YooAmatter Formations. – A new system that enhances YooAmatter mechanics, providing additional layers of progression.",
                        "Added News Ticker. – Stay updated with dynamic in-game news that brings life to the world of YooA Incremental.",
                        "More Upgrades. – Expanded the upgrade system with new effects to boost YooA Points and YooAmatter gains.",
                        "More Achievements. – Additional achievements to reward players for reaching greater milestones."
                    ]
                },
                {
                    version: "v1",
                    title: "YooAity — Transcendence & Major Systems",
                    date: "2026-01-12",
                    description: [
                        "Added YooAity (Prestige Layer). – Introduced the second Prestige layer, allowing players to Transcend for long-term progression.",
                        "Added Transcendence System. – Players can now Transcend at extreme YooAmatter values, resetting lower layers while preserving key progress.",
                        "Added YooA Essence. – A permanent currency earned from Transcensions, used to purchase powerful upgrades that affect multiple layers.",
                        "Added YooAity Milestones. – Milestones unlock automation, passive bonuses, and quality-of-life improvements for future Transcensions.",
                        "Added Shi-ah Echoes & Embers. – New YooAity resources that behave like dimensions and boost YooA Points, Dimensions, and Challenge upgrades.",
                        "Added YooA's Birth & YooChronium. – Trigger YooA's birth to unlock aging mechanics, time progression, and exponentiation math challenges.",
                        "Added Member & Date-Based Unlocks. – New members unlock as in-game time progresses, each introducing unique currencies and upgrades.",
                        "Added OH MY GIRL System. – Group-wide progression featuring Lights, skills, Sparkles, Miracle Light, and powerful synergies.",
                        "Added MIRACLEs. – Fans that scale with Charisma and amplify group progression and Miracle Light efficiency.",
                        "Added Arin Ranks, Arinium & Arin Tier. – Expanded automation depth with autobuyer-focused upgrades and Arin-Proof mechanics.",
                        "Added Accounts. – YooA opens the Cloud Gate! ☁️✨ Account creation and persistent progression powered by AWS (Amazon Web Services).",
                        "Added Leaderboard. – A world-spanning Miracle Board! 🌍✨ Rankings are synced through AWS Amplify, letting YooA compare miracles across all players.",
                        "Added Notation System. – Introduced YooA Incremental notations for numbers: YooA, Arin, Letters/Cancer emoji, Standard, and Scientific variants to display large numbers with magical style!",
                        "Added Help Section. – In-game guidance explaining mechanics, systems, and progression tips.",
                        "Added 'Last Prestiges' in Stats. – Track your most recent Ascensions and Transcensions for better optimization.",
                        "Expanded Achievements. – Added more achievements tied to YooAity, members, and long-term progression.",
                        "Expanded News. – Added more news entries reflecting new mechanics, world events, and story progression.",
                        "Bug Fixes & Optimizations. – Fixed various issues and optimized systems for smoother performance and stability."
                    ]
                }
            ],
            expandedVersions: [],
        };
    },
    computed: {
        groupedChangelog() {
            return this.changelogEntries.reduce((groups, entry) => {
                const versionParts = entry.version.split('.');
                const majorVersion = versionParts[0];
                const minorVersion = versionParts.length > 1 ? `${versionParts[0]}.${versionParts[1]}` : null;
                const patchVersion = versionParts.length > 2 ? `${minorVersion}.${versionParts[2]}` : null;

                if (!groups[majorVersion]) {
                    groups[majorVersion] = { title: entry.title, date: entry.date, description: null, minors: {} };
                }

                if (!minorVersion && !patchVersion) {
                    groups[majorVersion].description = entry.description;
                }

                if (minorVersion && !groups[majorVersion].minors[minorVersion]) {
                    groups[majorVersion].minors[minorVersion] = { title: entry.title, description: null, patches: [] };
                }

                if (minorVersion && !patchVersion) {
                    groups[majorVersion].minors[minorVersion].description = entry.description;
                }

                if (patchVersion) {
                    groups[majorVersion].minors[minorVersion].patches.push(entry);
                }

                return groups;
            }, {});
        },
    },
    methods: {
        toggleVersion(version, parentVersion = null) {
            const versionKey = parentVersion ? `${parentVersion}:${version}` : version;
            const index = this.expandedVersions.indexOf(versionKey);
            if (index === -1) {
                this.expandedVersions.push(versionKey);
            } else {
                this.expandedVersions.splice(index, 1);
            }
        },

        isVersionExpanded(version, parentVersion = null) {
            const versionKey = parentVersion ? `${parentVersion}:${version}` : version;
            return this.expandedVersions.includes(versionKey);
        },

        getVersionDate(version) {
            const entry = this.changelogEntries.find(e => e.version === version);
            return entry ? entry.date : "No date available.";
        },
    },
};
</script>

<style scoped>
.changelog {
    margin: 20px;
}

h2 {
    color: #333;
    font-size: 1.5rem;
}

.version-group,
.minor-version-group,
.patch-version-group {
    margin-bottom: 20px;
}

h3,
h4,
h5 {
    cursor: pointer;
    transition: color 0.3s;
}

h3 {
    font-size: 20pt;
    color: #0056b3;
}

h4 {
    font-size: 18pt;
    color: #007bff;
}

h5 {
    font-size: 16pt;
    color: #008080;
}

h3.expanded,
h4.expanded,
h5.expanded {
    color: #d17be2;
}

ul {
    list-style-type: disc;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

li {
    margin: 5px 0;
    padding: 8px;
    border-radius: 4px;
    text-align: center;
    /* Centers the text within each list item */
    font-size: 14pt;
}

strong {
    font-weight: bold;
}

.expand-collapse-enter-active,
.expand-collapse-leave-active {
    transition: all 0.5s ease;
}

.expand-collapse-enter,
.expand-collapse-leave-to {
    opacity: 0;
}
</style>
