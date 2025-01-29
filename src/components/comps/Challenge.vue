<template>
    <div class="challenge" :class="{ maxed: isMaxed }" v-if="currentChallenge" :style="mergedChallengeStyle">
        <h2>{{ currentChallenge.title }}</h2>
        <p>{{ penaltyDescription }}</p>
        <p>
            Goal: {{ formatGoal(currentChallenge.goal) }} {{ currentChallenge.goalCurrency }}
        </p>
        <p>{{ lvlDisplay }}</p>
        <br v-if="getChallengeRewardDescription" />
        <em v-if="getChallengeRewardDescription">
            Reward: {{ getChallengeRewardDescription }}<br />
            <span v-if="getChallengeRewardEffect">
                Effect: {{ getChallengeRewardEffect }}
            </span>
        </em>

        <!-- Start Challenge Button -->
        <button v-if="!challengeStarted" @click="confirmStartChallenge()" class="start-btn">Start Challenge</button>

        <!-- Exit or Complete Challenge Button -->
        <button v-if="challengeStarted" @click="confirmExitOrComplete(layerName, challengeId)" :class="{
            'exit-complete-btn': !isGoalReached,
            'exit-complete-btn complete': isGoalReached
        }">
            {{ isGoalReached ? 'Complete Challenge' : 'Exit Challenge' }}
        </button>
    </div>
</template>

<script>
import { player } from "@/incremental/incremental";
import { gameLayers, canCompleteChallenge, prestige, inChallenge, exitOrComplete } from "@/incremental/main.js";

export default {
    name: "Challenge",
    props: {
        layerName: {
            type: String,
            required: true
        },
        challengeId: {
            type: [String, Number],
            required: true
        }
    },
    computed: {
        currentChallenge() {
            const layer = gameLayers[this.layerName];
            return layer ? layer.challenges[this.challengeId] : null;
        },
        playerLevel() {
            const level = player.challenges[this.layerName]?.[this.challengeId] || 0;
            return new Decimal(level);
        },
        maxLevel() {
            return typeof this.currentChallenge.maxLvl === 'function' ? this.currentChallenge.maxLvl() : this.currentChallenge.maxLvl
        },
        isMaxed() {
            return this.maxLevel && this.playerLevel.gte(this.maxLevel);
        },
        lvlDisplay() {
            let dis = "Level: " + formatWhole(this.playerLevel);
            if (this.maxLevel) dis += "/" + formatWhole(this.maxLevel);
            if (this.isMaxed) dis += " (COMPLETED)";
            return dis;
        },
        penaltyDescription() {
            return this.currentChallenge.description() || "No penalties.";
        },
        challengeStyle() {
            let backgroundColor;
            if (this.layerName === 'YooA') {
                backgroundColor = 'linear-gradient(#991893, #d17be2)'; // For the YooA layer
            } else if (this.layerName === 'YooAmatter') {
                backgroundColor = 'linear-gradient(#929923, #bcc70f)'; // For the YooAmatter layer
            } else {
                backgroundColor = 'linear-gradient(#991893, #d17be2)'; // Default color for other layers
            }
            return {
                background: backgroundColor,
            };
        },
        mergedChallengeStyle() {
            return {
                ...this.challengeStyle,
                background: this.isMaxed ? 'linear-gradient(to bottom, #ffd700, #ffbf00)' : this.challengeStyle.background,
            };
        },
        isGoalReached() {
            return canCompleteChallenge(this.layerName, this.challengeId);
        },
        challengeStarted() {
            return inChallenge(this.layerName, this.challengeId)
        },
        getChallengeRewardDescription() {
            const challenge = this.currentChallenge;
            return challenge?.rewardDescription ? (typeof challenge.rewardDescription === 'function' ? challenge.rewardDescription() : challenge.rewardDescription) : null;
        },
        getChallengeRewardEffect() {
            const challenge = this.currentChallenge;
            return challenge?.rewardEffectDisplay ? (typeof challenge.rewardEffectDisplay === 'function' ? challenge.rewardEffectDisplay() : challenge.rewardEffectDisplay) : null;
        },
    },
    methods: {
        confirmStartChallenge(con = options.confirmations.YooAmatter) {
            if (con) {
                let msg = "You are about to reset for " + this.layerName + " and begin a new journey within this Challenge, where all restrictions and modifiers will be active. To complete it, you must reach the goal without carrying over any YooA math problems, regardless of upgrades. Are you sure you want to start and take on this Challenge?"
                if (window.confirm(msg)) {
                    this.startChallenge();
                }
            }
            else {
                this.startChallenge();
            }
        },
        startChallenge() {
            player.inChallenge = [this.layerName, this.challengeId];
            prestige(this.layerName);
        },
        confirmExitOrComplete(layer, id) {
            exitOrComplete(layer, id)
        },
        formatGoal(goal) {
            return goal instanceof Decimal ? format(goal) : goal.toString();
        }
    }
};
</script>

<style scoped>
/* Base challenge style */
div.challenge {
    width: 100%;
    height: 100%;
    font-size: 14pt;
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

/* Hover effect for challenges */
button {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

/* Maxed challenge style */
div.challenge.maxed {
    background: linear-gradient(to bottom, #ffd700, #ffbf00);
    color: #4b2905;
    font-weight: bold;
    box-shadow: 0 0 10px #ffbf00;
    cursor: default;
}

div.challenge h2 {
    margin: 10px 0;
}

div.challenge p {
    margin: 6px 0;
}

button.start-btn {
    margin-top: 10px;
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    background-color: #3b82f6;
    /* Blue for start */
    color: white;
    border: none;
    border-radius: 5px;
}

button.exit-complete-btn {
    margin-top: 10px;
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    background-color: #e11d48;
    /* Red for exit */
    color: white;
    border: none;
    border-radius: 5px;
}

/* Green for complete challenge */
button.exit-complete-btn.complete {
    background-color: #10b981;
    /* Green for complete */
}
</style>
