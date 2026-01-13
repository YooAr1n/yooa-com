<template>
  <div>
    <h2>You have completed {{ achCompleted }} achievements.</h2>
    <h2>Achievement Multiplier to {{ achBoost }}: x{{ achMult }}</h2>
    <h3>Achievements with a ⭐ icon also give an additional reward.</h3>
    <div class="grid-container">
      <div v-for="row in gridRows" :key="row" class="grid-row" :class="{ completed: isRowCompleted(row) }">
        <div v-for="col in getValidColumnsForRow(row)" :key="col" class="grid-item">
          <Achievement :achievement-id="`${row}${col}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Achievement from './comps/Achievement.vue';
import { achievements } from "@/incremental/layersData.js";
import { hasAchievement } from "@/incremental/incremental.js";
import { GameCache } from '@/incremental/cache';

export default {
  name: "AchievementsGrid",
  components: {
    Achievement
  },
  data() {
    return {
      achCompleted: "",
      achMult: "",
      achBoost: "",
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
  },
  methods: {
    update() {
      // Assuming 'format' is available in your scope.
      this.achMult = format(GameCache.AchievementMult.value);
      const completedCount = Object.keys(this.achievements).filter(id => hasAchievement(id)).length;
      const totalCount = Object.keys(this.achievements).length;
      this.achCompleted = `${formatWhole(completedCount)}/${formatWhole(totalCount)}`;

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
      if (hasAchievement(61)) {
        dis.push("Shi-ah Echoes");
        dis.push("YooChronium");
      }

      if (dis.length > 2) {
        this.achBoost = dis.slice(0, -1).join(", ") + ", and " + dis[dis.length - 1];
      } else if (dis.length === 2) {
        this.achBoost = dis[0] + " and " + dis[1];
      } else {
        this.achBoost = dis[0];
      }
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
    isRowCompleted(row) {
      const achievementsInRow = Object.keys(this.achievements)
        .filter((key) => Math.floor(key / 10) === row);
      return achievementsInRow.every((key) => hasAchievement(key));
    }
  },
  mounted() {
    window.addEventListener("GAME_EVENT.UPDATE", this.update);
  },
  beforeUnmount() {
    window.removeEventListener("GAME_EVENT.UPDATE", this.update);
  },
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
</style>
