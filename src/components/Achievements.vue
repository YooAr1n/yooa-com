<template>
  <h2>You have completed {{ achCompleted }} achievements.</h2>
  <h2>Achievement Multiplier to {{ achBoost }}: x{{ achMult }}</h2>
  <h3>Achievements with a ⭐ icon also give an additional reward.</h3>
  <div class="grid-container">
    <div v-for="row in gridRows" :key="row" class="grid-row" :class="{ completed: isRowCompleted(row) }">
      <div v-for="col in getValidColumnsForRow(row)" :key="col" class="grid-item">
        <div class="achievement-card" :class="{ completed: hasAchievement(`${row}${col}`) }"
          :style="{ backgroundImage: 'url(' + (getAchievementImage(`${row}${col}`) || defaultImage) + ')' }">
          <div class="achievement-title">
            <h2>{{ getAchievementTitle(`${row}${col}`) }}</h2>
          </div>
          <div class="ach-tooltip-container">
            <span class="ach-tooltip-text">
              {{ getAchievementDescription(`${row}${col}`) }}
              <br v-if="getAchievementRewardDescription(`${row}${col}`)" />
              <em v-if="getAchievementRewardDescription(`${row}${col}`)">
                Reward: {{ getAchievementRewardDescription(`${row}${col}`) }}<br />
                <span v-if="getAchievementRewardEffect(`${row}${col}`)">
                  Effect: {{ getAchievementRewardEffect(`${row}${col}`) }}
                </span>
              </em>
            </span>
          </div>
          <div v-if="getAchievementRewardDescription(`${row}${col}`)" class="reward-star-container" :style="{
            borderColor: hasAchievement(`${row}${col}`) ? '#1d4e1e' : '#ddd',
            backgroundColor: hasAchievement(`${row}${col}`) ? '#84ff8e' : '#f9f9f9',
          }">
            ⭐
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { achievements } from "@/incremental/main.js";
import { hasAchievement, calculateAchievementMultiplier } from "@/incremental/incremental.js";

export default {
  name: "AchievementsGrid",
  data() {
    return {
      defaultImage: require('@/assets/YooA.png'),
    };
  },
  computed: {
    achievements() {
      return achievements;
    },
    gridRows() {
      const maxRow = Math.max(
        ...Object.keys(this.achievements).map((id) => Math.floor(id / 10))
      );
      return Array.from({ length: maxRow }, (_, i) => i + 1);
    },
    achMult() {
      return format(calculateAchievementMultiplier());
    },
    achCompleted() {
      const completedCount = Object.keys(this.achievements).filter(id => hasAchievement(id)).length;
      const totalCount = Object.keys(this.achievements).length;
      return `${completedCount}/${totalCount}`;
    },
    achBoost() {
      let dis = ["YooA Points"];
      if (hasAchievement(28)) {
        dis.push("YooA Dimensions");
      }
      if (hasAchievement(38)) {
        dis.push("YooA math problems");
      }
      if (hasAchievement(41)) {
        dis.push("YooArium");
      }
      if (hasAchievement(47)) {
        dis.push("YooAmatter Formations");
      }

      // Format the display text with Oxford comma if more than 2 items
      if (dis.length > 2) {
        return dis.slice(0, -1).join(", ") + ", and " + dis[dis.length - 1];
      }
      // For 2 items, just use "and"
      if (dis.length == 2) {
        return dis[0] + " and " + dis[1];
      }
      return dis[0];
    }
  },
  methods: {
    hasAchievement(id) {
      return hasAchievement(id);
    },
    getValidColumnsForRow(row) {
      const columnsPerRow = 8;
      const validColumns = [];
      for (let col = 1; col <= columnsPerRow; col++) {
        const id = `${row}${col}`;
        if (this.achievements[id]) validColumns.push(col);
      }
      return validColumns;
    },
    getAchievementImage(id) {
      return this.achievements[id]?.img;
    },
    getAchievementTitle(id) {
      return this.achievements[id]?.title + " (" + id + ")";
    },
    getAchievementDescription(id) {
      return this.achievements[id]?.description();
    },
    getAchievementRewardDescription(id) {
      const rewardDescription = this.achievements[id]?.rewardDescription;
      return typeof rewardDescription === 'function' ? rewardDescription() : rewardDescription;
    },
    getAchievementRewardEffect(id) {
      const achievement = this.achievements[id];
      return achievement?.rewardEffDesc ? (typeof achievement.rewardEffDesc === 'function' ? achievement.rewardEffDesc() : achievement.rewardEffDesc) : null;
    },
    isRowCompleted(row) {
      const achievementsInRow = Object.keys(this.achievements)
        .filter((key) => Math.floor(key / 10) === row);
      return achievementsInRow.every((key) => this.hasAchievement(key));
    }
  }
};
</script>

<style scoped>
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  align-items: center;
}

.grid-row {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  /* Ensure padding matches default */
  gap: 16px;
  justify-content: center;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.grid-row.completed {
  background-color: #1d4e1e;
}

.grid-item {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

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
