<template>
    <div class="streaming-container">
        <h2>🎧 OMG Streaming Station 🎧</h2>

        <p class="flavor">
            🌸 YooA says… “Choose your album wisely, MIRACLE!” 🌸
        </p>

        <!-- Album Selector -->
        <div class="album-select">
            <button v-for="(album, key) in unlockedAlbums" :key="key"
                :class="{ active: currentAlbumKey === key, locked: !album.unlocked }" @click="selectAlbum(key)">
                <span v-if="album.unlocked">💿 {{ album.album }}</span>
                <span v-else>🔒 {{ album.album }} (Unlock: {{ formatCurrency(album.unlockCost) }})</span>
            </button>
        </div>

        <p>MIRACLEs streamed this album {{ formatWhole(streams[currentAlbumKey]) }} times</p>

        <!-- Current Song -->
        <div class="song-card" v-if="currentSong">
            <h3>🎶 Now Streaming:</h3>
            <p class="song-name">{{ currentSong.name }}</p>
            <p class="era">Album: {{ currentAlbum.album }}</p>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
            <div class="progress" :style="{ width: progressPercent.toFixed(2) + '%' }"></div>
        </div>

        <p class="progress-text">
            {{ formatNum(progressPercent) }}% streamed
        </p>
        <p class="time-info">
            ⏱ Time Remaining: <strong>{{ remainingTime }}</strong>
            | Stream Duration: <strong>{{ formatTime(streamDurationPerSong) }}</strong>
        </p>

        <!-- Controls -->
        <div class="controls">
            <button class="start" @click="startStreaming" :disabled="isStreaming[currentAlbumKey]">▶ Start Streaming</button>
            <button class="stop" @click="stopStreaming" :disabled="!isStreaming[currentAlbumKey]">⏸ Stop</button>
            <!-- Auto-Streamer -->
            <button class="auto-streamer" :class="{ owned: hasAuto }" @click="buyAutoStream"
                :disabled="!canAffordAuto || hasAuto">
                <span v-if="hasAuto">✨ Auto-Streamer Active ✨</span>
                <span v-else>Buy Auto-Streamer (Cost: {{ formatCurrency(this.autoCost) }})</span>
            </button>
        </div>
    </div>
</template>

<script>
import { gameLayers } from "@/incremental/layersData";
import { songs } from "@/incremental/songs.js";

export default {
    name: "Song",
    data() {
        return {
            songData: songs,
            currentAlbumKey: null,
            currentSongIndex: { OHMYGIRL: 1, CLOSER: 1, PINKOCEAN: 1, LISTENTOMYWORD: 1, COLORINGBOOK: 1, SECRETGARDEN: 1, REMEMBERME: 1 },
            progress: { OHMYGIRL: 0, CLOSER: 0, PINKOCEAN: 0, LISTENTOMYWORD: 0, COLORINGBOOK: 0, SECRETGARDEN: 0, REMEMBERME: 0 },
            isStreaming: { OHMYGIRL: false, CLOSER: false, PINKOCEAN: false, LISTENTOMYWORD: false, COLORINGBOOK: false, SECRETGARDEN: false, REMEMBERME: false },
            remainingTime: 0,
            streamDurationPerSong: 0,
            canAffordAuto: false,
            autoCost: Decimal.dZero,
            hasAuto: false,
            streams: { OHMYGIRL: Decimal.dZero, CLOSER: Decimal.dZero, PINKOCEAN: Decimal.dZero, LISTENTOMYWORD: Decimal.dZero, COLORINGBOOK: Decimal.dZero, SECRETGARDEN: Decimal.dZero, REMEMBERME: Decimal.dZero },
            unlocked: {} // ✅ REACTIVE MIRROR
        };
    },

    computed: {
        // album list from songs.js
        unlockedAlbums() {
            const out = {};

            for (const key in this.songData.albums) {
                const album = this.songData.albums[key];

                out[key] = {
                    ...album,
                    unlocked: !!this.unlocked[key] // ← SOURCE OF TRUTH
                };
            }
            return out;
        },
        currentAlbum() {
            return this.songData.albums[this.currentAlbumKey] || { album: "Unknown", songs: {} };
        },
        currentSong() {
            return this.currentAlbum?.songs[this.currentSongIndex[this.currentAlbumKey]] || null;
        },
        progressPercent() {
            return (this.progress[this.currentAlbumKey] / this.streamDurationPerSong) * 100;
        }
    },

    methods: {
        formatNum(num) {
            return format(num)
        },
        formatCurrency(num) {
            return formatCurrency(num)
        },
        formatWhole(num) {
            return formatWhole(num)
        },
        formatTime(num) {
            return formatTime(num)
        },
        update() {
            const playerStream = player.YooAity.stream
            this.currentAlbumKey = playerStream.currentAlbumKey;
            this.currentSongIndex[this.currentAlbumKey] = playerStream.currentSongIndex[this.currentAlbumKey];
            this.progress[this.currentAlbumKey] = playerStream.progress[this.currentAlbumKey];
            this.isStreaming[this.currentAlbumKey] = playerStream.isStreaming[this.currentAlbumKey];
            this.streams = playerStream.streams;
            this.unlocked = { ...playerStream.unlocked };
            this.streamDurationPerSong = this.currentAlbum.lengthPerSong / gameLayers.Fandom.getStreamSpeed();
            if (this.currentAlbumKey) {
                this.hasAuto = playerStream.hasAuto[this.currentAlbumKey];
                this.autoCost = this.songData.albums[this.currentAlbumKey].autoCost;
                this.canAffordAuto = playerStream.money.gte(this.autoCost);
            } else {
                this.hasAuto = false;
                this.autoCost = Decimal.dZero;
                this.canAffordAuto = false;
            }

            this.remainingTime = formatTime(Math.max(0, this.streamDurationPerSong - this.progress[this.currentAlbumKey]));
        },
        buyAutoStream() {
            if (!this.canAffordAuto) return;
            player.YooAity.stream.money = player.YooAity.stream.money.sub(this.autoCost)
            player.YooAity.stream.hasAuto[this.currentAlbumKey] = true
        },
        startStreaming() {
            if (this.isStreaming[this.currentAlbumKey]) return;
            player.YooAity.stream.isStreaming[this.currentAlbumKey] = true;
        },
        stopStreaming() {
            if (!this.isStreaming[this.currentAlbumKey]) return;
            player.YooAity.stream.isStreaming[this.currentAlbumKey] = false;
        },
        selectAlbum(key) {
            const album = this.songData.albums[key];
            if (!album) return;

            const stream = player.YooAity.stream;

            if (!stream.unlocked[key]) {
                if (!stream.money.gte(album.unlockCost)) {
                    alert(
                        `🌸 YooA says… “You need ${this.formatCurrency(album.unlockCost)} to unlock ${album.album}!” 🌸`
                    );
                    return;
                }

                stream.money = stream.money.sub(album.unlockCost);
                stream.unlocked[key] = true; // ✅ PLAYER ONLY
            }

            stream.currentAlbumKey = key;
        }
    },

    mounted() {
        // bind update handler once (hot-path) and use correct event name
        this.boundUpdate = this.update.bind(this);
        window.addEventListener("GAME_EVENT.UPDATE", this.boundUpdate); // <<-- FIXED: use GAME_EVENT.UPDATE

        // initial sync
        this.update();
    },

    beforeUnmount() {
        if (this.boundUpdate) window.removeEventListener("GAME_EVENT.UPDATE", this.boundUpdate);
    },
};
</script>

<style scoped>
/* styles unchanged */
.streaming-container {
    background: linear-gradient(135deg, #880a4b, #085a89);
    border-radius: 16px;
    padding: 16px;
    max-width: 900px;
    margin: auto;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.flavor {
    font-style: italic;
    margin-bottom: 12px;
}

.song-card {
    background: rgb(49, 3, 80);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
}

.song-name {
    font-weight: bold;
    font-size: 1.1rem;
}

.progress-bar {
    background: #eee;
    border-radius: 10px;
    overflow: hidden;
    height: 14px;
    margin: 8px 0;
}

.progress {
    height: 100%;
    background: linear-gradient(90deg, #ff7eb3, #65c7f7);
}

.controls button {
    margin: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
}

.controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.time-info {
    font-size: 0.9rem;
    margin-bottom: 8px;
    color: #ffd1f0;
}

.album-select {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.album-select button {
    padding: 6px 10px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    background: #444;
    color: white;
    font-size: 0.8rem;
}

.album-select button.active {
    background: linear-gradient(90deg, #ff7eb3, #65c7f7);
    font-weight: bold;
}

.album-select button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Add these scoped styles for the Auto-Streamer button */
.auto-streamer {
    margin: 6px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;
    color: #fff;
    background: linear-gradient(90deg, #ff7eb3, #65c7f7);
    box-shadow: 0 4px 15px rgba(255, 126, 179, 0.6);
    transition: transform 0.2s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
}

.auto-streamer:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 126, 179, 0.8);
}

.auto-streamer:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Active / Owned state */
.auto-streamer.owned {
    background: linear-gradient(90deg, #ffd1f0, #65c7f7);
    box-shadow: 0 0 25px 2px rgba(255, 200, 255, 0.7);
    animation: glowPulse 2s infinite alternate;
}

@keyframes glowPulse {
    0% {
        box-shadow: 0 0 15px 2px rgba(255, 200, 255, 0.5);
    }

    50% {
        box-shadow: 0 0 35px 4px rgba(255, 200, 255, 0.9);
    }

    100% {
        box-shadow: 0 0 15px 2px rgba(255, 200, 255, 0.5);
    }
}

/* Start / Stop buttons */
.controls button.start,
.controls button.stop {
    margin: 6px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;
    color: #fff;
    transition: transform 0.2s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
}

.controls button.start {
    background: linear-gradient(90deg, #ffb347, #ffcc33);
    box-shadow: 0 4px 15px rgba(255, 180, 70, 0.6);
}

.controls button.stop {
    background: linear-gradient(90deg, #ff4747, #ff3d33);
    box-shadow: 0 4px 15px rgba(255, 70, 70, 0.6);
}

.controls button.start:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 200, 90, 0.9);
}

.controls button.stop:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 120, 120, 0.9);
}

.controls button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Optional pulse animation when streaming */
.controls button.start.active {
    animation: startPulse 1.5s infinite alternate;
}

.controls button.stop.active {
    animation: stopPulse 1.5s infinite alternate;
}

@keyframes startPulse {
    0% {
        box-shadow: 0 4px 15px rgba(255, 180, 70, 0.6);
    }

    50% {
        box-shadow: 0 4px 25px rgba(255, 200, 100, 0.9);
    }

    100% {
        box-shadow: 0 4px 15px rgba(255, 180, 70, 0.6);
    }
}

@keyframes stopPulse {
    0% {
        box-shadow: 0 4px 15px rgba(255, 120, 120, 0.6);
    }

    50% {
        box-shadow: 0 4px 25px rgba(255, 150, 150, 0.9);
    }

    100% {
        box-shadow: 0 4px 15px rgba(255, 120, 120, 0.6);
    }
}
</style>
