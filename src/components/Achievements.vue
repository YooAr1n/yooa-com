<template>
  <h2>Achievement Multiplier to YooA Points: x{{ achMult }}</h2>
  <div class="grid-container">
    <!-- Loop through rows -->
    <div v-for="row in gridRows" :key="row" class="grid-row"
      :style="{ width: calculateRowWidth(getValidColumnsForRow(row).length) + 'px' }"
      :class="{ completed: isRowCompleted(row) }">
      <!-- Loop through columns in each row, only for valid achievements -->
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
                Reward: {{ getAchievementRewardDescription(`${row}${col}`) }}<br>
                Effect:
                <span v-if="getAchievementRewardEffect(`${row}${col}`)">
                  {{ getAchievementRewardEffect(`${row}${col}`) }}
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
      defaultImage: require('@/assets/YooA.png'), // Default image for achievements
    };
  },
  computed: {
    achievements() {
      return achievements; // Dynamically fetch achievements
    },
    gridRows() {
      // Calculate the maximum row index dynamically based on achievement IDs
      const maxRow = Math.max(
        ...Object.keys(this.achievements).map((id) => Math.floor(id / 10))
      );
      return Array.from({ length: maxRow }, (_, i) => i + 1);
    },
    achMult() {
      return format(calculateAchievementMultiplier());
    }
  },
  methods: {
    hasAchievement(id) {
      return hasAchievement(id); // Call the imported `hasAchievement` function
    },
    getValidColumnsForRow(row) {
      const columnsPerRow = 8; // Maximum number of achievements per row
      const validColumns = [];

      for (let col = 1; col <= columnsPerRow; col++) {
        const id = `${row}${col}`;
        if (this.achievements[id]) {
          validColumns.push(col); // Push only the column index
        }
      }

      return validColumns; // Return valid column indices for this row
    },
    getAchievementImage(id) {
      // Returns the image of the achievement based on its ID
      return this.achievements[id]?.img;
    },
    getAchievementTitle(id) {
      // Returns the title of the achievement
      return this.achievements[id]?.title + " (" + id + ")";
    },
    getAchievementDescription(id) {
      // Returns the description of the achievement
      return this.achievements[id]?.description();
    },
    getAchievementRewardDescription(id) {
      const rewardDescription = this.achievements[id]?.rewardDescription;
      if (typeof rewardDescription === 'function') {
        return rewardDescription();
      }
      return rewardDescription;
    },
    getAchievementRewardEffect(id) {
      return this.achievements[id].rewardEffDesc();
    },
    calculateRowWidth(achs) {
      const cardWidth = 150; // Width of each achievement card
      const gap = 16; // Space between cards
      return achs * (cardWidth + gap) - gap + 20; // Total width of the row
    },
    isRowCompleted(row) {
      const achievementsInRow = Object.keys(this.achievements)
        .filter((key) => Math.floor(key / 10) === row); // Get all achievements in the row
      return achievementsInRow.every((key) => this.hasAchievement(key)); // Check if all achievements are completed
    }
  }
};
</script>

<style scoped>
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Space between rows */
  padding: 16px;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Space between rows */
  padding: 16px;
  align-items: center;
  /* Center rows horizontally */
  justify-content: center;
  /* Center rows vertically */
  height: 100%;
  /* Ensure it takes up the full container height */
}

.grid-row {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Vertically center items within each row */
  gap: 16px;
  /* Space between achievements in a row */
  height: 170px;
  /* Fixed height for rows */
  border-radius: 10px;
  transition: background-color 0.3s ease;
}


/* Green background for completed rows */
.grid-row.completed {
  background-color: #1d4e1e;
}


.grid-item {
  width: 150px;
  /* Fixed width */
  height: 150px;
  /* Fixed height */
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
