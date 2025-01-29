<template>
    <div v-if="isOffline" class="overlay">
        <div class="offline-container">
            <h1>Offline Progress</h1>
            <p>You have been offline for {{ offlineTime }}</p>
            <p>Elapsed Time: {{ elapsedTime }}</p>
            <progress :value="progress" max="1"></progress>
            <button v-if="done" @click="finishOffline">Done</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "Offline",
    computed: {
        isOffline() {
            return offline.active;
        },
        offlineTime() {
            return formatTime(offline.time);
        },
        elapsedTime() {
            return formatTime(offline.elapsed);
        },
        progress() {
            return offline.elapsed.div(offline.time);
        },
        done() {
            return offline.elapsed.gte(offline.time);
        },
    },
    methods: {
        finishOffline() {
            offline.active = false;
        },
    },
};
</script>

<style scoped>
/* Full-screen overlay */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    /* Semi-transparent black background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    /* Ensure it appears above other content */
}

/* Pop-up container styling */
.offline-container {
    background: #991893;
    padding: 10px 20px;
    text-align: center;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    /* Makes it responsive */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    animation: fadeIn 0.3s ease-in-out;
    /* Add a fade-in effect */
}

h1 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

p {
    margin: 5px 0;
    font-size: 1rem;
}

progress {
    width: 100%;
    height: 20px;
    margin: 10px 0;
    appearance: none;
}

button {
    background: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background: #45a049;
}

/* Fade-in animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>