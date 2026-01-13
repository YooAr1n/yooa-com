<template>
  <div class="achievement-card" :class="{ completed: unlocked }"
       :style="{ backgroundImage: 'url(' + (getAchievementImage(achievementId) || defaultImage) + ')' }">
    <div class="achievement-title">
      <h2>{{ getAchievementTitle(achievementId) }}</h2>
    </div>
    <div class="ach-tooltip-container">
      <span class="ach-tooltip-text">
        {{ achDesc }}
        <br v-if="getAchievementRewardDescription(achievementId)" />
        <em v-if="getAchievementRewardDescription(achievementId)">
          Reward: {{ achRewardDesc }}<br />
          <span v-if="getAchievementRewardEffect(achievementId)">
            Effect: {{ achRewardEff }}
          </span>
        </em>
      </span>
    </div>
    <div v-if="getAchievementRewardDescription(achievementId)" class="reward-star-container"
         :style="{
           borderColor: unlocked ? '#1d4e1e' : '#ddd',
           backgroundColor: unlocked ? '#84ff8e' : '#f9f9f9'
         }">
      ⭐
    </div>
  </div>
</template>

<script>
import { achievements } from "@/incremental/layersData.js";
import { hasAchievement } from "@/incremental/incremental.js";

export default {
  name: "Achievement",
  props: {
    achievementId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      defaultImage: require('@/assets/YooA.png'),
      unlocked: false,
      achDesc: "",
      achRewardDesc: "",
      achRewardEff: "",
    }
  },
  methods: {
    update() {
      const id = this.achievementId
      this.unlocked = hasAchievement(id)
      this.achDesc = achievements[id]?.description()
      const rewardDescription = achievements[id]?.rewardDescription;
      this.achRewardDesc = typeof rewardDescription === 'function' ? rewardDescription() : rewardDescription;
      const achievement = achievements[id];
      this.achRewardEff = achievement?.rewardEffDesc
        ? (typeof achievement.rewardEffDesc === 'function'
            ? achievement.rewardEffDesc()
            : achievement.rewardEffDesc)
        : null;
    },
    getAchievementImage(id) {
      return achievements[id]?.img;
    },
    getAchievementTitle(id) {
      return achievements[id]?.title + " (" + id + ")";
    },
    getAchievementDescription(id) {
      return achievements[id]?.description();
    },
    getAchievementRewardDescription(id) {
      const rewardDescription = achievements[id]?.rewardDescription;
      return typeof rewardDescription === 'function' ? rewardDescription() : rewardDescription;
    },
    getAchievementRewardEffect(id) {
      const achievement = achievements[id];
      return achievement?.rewardEffDesc
        ? (typeof achievement.rewardEffDesc === 'function'
            ? achievement.rewardEffDesc()
            : achievement.rewardEffDesc)
        : null;
    }
  },
  mounted() {
    window.addEventListener("GAME_EVENT.UPDATE", this.update);
  },
  beforeUnmount() {
    window.removeEventListener("GAME_EVENT.UPDATE", this.update);
  },
}
</script>

<style scoped>
.achievement-card {
  width: 150px;
  height: 150px;
  background: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  background-size: cover;
  background-position: center;
  transition: transform 0.2s, border-color 0.2s;
}

.achievement-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s ease;
}

.achievement-card.completed {
  border-color: #1d4e1e;
  background-color: #84ff8e;
}

.achievement-card.completed::after {
  background-color: rgba(0, 128, 0, 0.25);
}

.achievement-card:hover {
  transform: scale(1.05);
  border-color: #90caf9;
}

.achievement-title h2 {
  font-size: 12pt;
  margin: 5px 0;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8);
}

.ach-tooltip-container {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
}

.ach-tooltip-text {
  visibility: hidden;
  opacity: 0;
  background-color: #991893;
  color: #fff;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  width: 300px;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.ach-tooltip-text::after {
  content: "";
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top: 8px solid #991893;
}

.achievement-card:hover .ach-tooltip-text {
  visibility: visible;
  opacity: 1;
}

.reward-star-container {
  position: absolute;
  bottom: 0px;
  right: 0px;
  font-size: 14px;
  color: gold;
  padding: 2px;
  border: 2px solid;
  border-radius: 10px 0;
}
</style>
