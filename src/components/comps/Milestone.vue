<template>
    <div class="milestone" :class="{ completed: isDone }" :style="milestoneStyle">
        <div>
            <h3 class="milestone-title">{{ milestoneTitle }}</h3>
            <p class="milestone-desc">{{ milestoneDescription }}</p>
            <p v-if="milestone.effectDisplay">Effect: <span v-html-stable="milestoneEffect"></span></p>
            <div class="milestone-badge">
                <span v-if="isDone">🌟 YooA says: "Milestone unlocked!" 🌟</span>
                <span v-else>🔒 YooA says: "Keep going!" 🔒</span>
            </div>
        </div>
    </div>
</template>

<script>
import { hasMilestone } from '@/incremental/mainFuncs';

export default {
    name: "Milestone",
    props: {
        id: {
            type: [String, Number],
            required: true,
        },
        milestone: {
            type: Object,
            required: true,
        },
        layerName: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            milestoneEffect: "",
            isDone: false
        };
    },
    computed: {
        milestoneTitle() {
            return typeof this.milestone.title === 'function'
                ? this.milestone.title()
                : this.milestone.title;
        },
        milestoneDescription() {
            return typeof this.milestone.description === 'function'
                ? this.milestone.description()
                : this.milestone.description;
        },
        milestoneStyle() {
            let background;
            switch (this.layerName) {
                case 'YooAity':
                    background = 'linear-gradient(#200642, #230085)';
                    break;
                default:
                    background = 'linear-gradient(#991893, #d17be2)';
            }
            return { background };
        },
    },
    methods: {
        update() {
            this.isDone = hasMilestone(this.layerName, this.id)
            this.milestoneEffect = this.milestone.effectDisplay ? this.milestone.effectDisplay() : null
        },
    },
    mounted() {
        // Listen for the custom update event and call the update method
        window.addEventListener("GAME_EVENT.UPDATE", this.update)
    },
    beforeUnmount() {
        // Remove the event listener when the component is destroyed
        window.removeEventListener("GAME_EVENT.UPDATE", this.update)
    },
};
</script>

<style scoped>
.milestone {
  max-width: 500px;
  width: 100%;
  height: 175px;
  font-size: 10pt;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.milestone-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.milestone-desc {
    font-size: 1rem;
    margin-bottom: 0.75rem;
}

.milestone-badge {
    display: inline-block;
    font-weight: bold;
}

.completed {
    opacity: 0.8;
    border: 2px solid #f5c518;
}
</style>
