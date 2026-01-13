<template>
    <div class="milestones-container">
        <Milestone v-for="(ms, key) in layerMilestones" :key="key" :id="key" :milestone="ms" :layerName="layer" />
    </div>
</template>

<script>
import Milestone from "./Milestone.vue";
import { gameLayers } from "@/incremental/layersData";

export default {
    name: "Milestones",
    components: { Milestone },
    props: {
        layer: {
            type: String,
            required: true,
        },
    },
    computed: {
        layerMilestones() {
            return gameLayers[this.layer].milestones || {};
        },
    },
};
</script>

<style scoped>
.milestones-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  width: 95%;
}
</style>
