<template>
	<div class="progress">
		<div id="percentbar" class="percent" :style="progressBarStyle">
			<span id="percent" class="prog-tooltip" ref="tooltipTarget" @mouseenter="showTooltip"
				@mouseleave="hideTooltip">
				{{ percentFormatted }}
			</span>
		</div>
		<div v-if="tooltipVisible" class="tooltip" :style="tooltipStyle" ref="tooltipElement">
			{{ tooltipText }}
			<div class="tooltip-arrow" :style="tooltipArrowStyle"></div>
		</div>
	</div>
</template>

<script>
import { inAnyChallenge, player } from '@/incremental/incremental.js';
import { gameLayers } from '@/incremental/main';

// Helper functions
const hexToRgb = (hex) => {
	hex = hex.replace('#', '');
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	return { r, g, b };
};

const rgbToHex = (r, g, b) => `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;

const averageColor = (color1, color2) => {
	const { r: r1, g: g1, b: b1 } = hexToRgb(color1);
	const { r: r2, g: g2, b: b2 } = hexToRgb(color2);
	const avgR = Math.round((r1 + r2) / 2);
	const avgG = Math.round((g1 + g2) / 2);
	const avgB = Math.round((b1 + b2) / 2);
	return rgbToHex(avgR, avgG, avgB);
};

export default {
	name: 'ProgressBar',
	data() {
		return {
			tooltipVisible: false,
			tooltipText: '',
			tooltipStyle: {},
			tooltipArrowStyle: {},
		};
	},
	computed: {
		// Define progress stages with label, threshold, and colors dynamically
		progressStages() {
			return [
				{ label: 'YooAmatter', currency: player.YooAPoints, threshold: new Decimal(1e12), startColor: '#929923', endColor: '#bcc70f' },
				{ label: 'YooAity', currency: player.YooAmatter.amount, threshold: new Decimal('9.17e1995'), startColor: '#200642', endColor: '#230085' },
				// Add more stages here as needed
			];
		},
		// Dynamically get the appropriate stage based on the player's currency
		currentStage() {
			if (inAnyChallenge()) return 0
			return this.progressStages.findIndex((stage) => {
				return stage.currency.lt(stage.threshold);
			});
		},
		// Get the current stage's threshold dynamically, ensuring a valid stage is returned
		threshold() {
			if (inAnyChallenge()) {
				return gameLayers[player.inChallenge[0]].challenges[player.inChallenge[1]].goal
			}
			const currentStageIndex = this.currentStage;
			// Ensure that we don't access an invalid stage index
			const stage = this.progressStages[currentStageIndex] || this.progressStages[0]; // Default to stage 0
			return stage.threshold;
		},
		// Dynamically get the appropriate label based on the current stage
		progressLabel() {
			if (inAnyChallenge()) return 'Challenge goal'
			const currentStageIndex = this.currentStage;
			const stage = this.progressStages[currentStageIndex] || this.progressStages[0]; // Default to stage 0
			return stage.label;
		},
		// Get the start and end colors based on the current stage
		gradientColors() {
			const currentStageIndex = this.currentStage;
			const stage = this.progressStages[currentStageIndex] || this.progressStages[0]; // Default to stage 0
			return { start: stage.startColor, end: stage.endColor };
		},
		percent() {
			if (inAnyChallenge()) {
				let challenge = gameLayers[player.inChallenge[0]].challenges[player.inChallenge[1]]
				const goal = typeof challenge.goal === "function" ? challenge.goal() : challenge.goal;
				let curr = challenge.goalLayer ? player[challenge.goalLayer][challenge.goalInternal] : player[challenge.goalInternal]
				return curr.max(1).log10().div(goal.log10()).min(1)
			}

			const currentStageIndex = this.currentStage;
			const stage = this.progressStages[currentStageIndex] || this.progressStages[0]; // Default to stage 0
			return stage.currency.max(1).log10().div(this.threshold.log10()).min(1);
		},
		percentFormatted() {
			return format(this.percent.mul(100)) + '%';
		},
		progressWidth() {
			return `${this.percent.toNumber() * 100}%`;
		},
		progressBarStyle() {
			const { start, end } = this.gradientColors;
			return {
				width: this.progressWidth,
				background: `linear-gradient(to right, ${start}, ${end})`,
			};
		},
		tooltipBackground() {
			const { start, end } = this.gradientColors;
			return averageColor(start, end);
		},
		calcLeft() {
			const target = this.$refs.tooltipTarget.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const tooltipWidth = 200;

			let left = target.left + target.width / 2 - tooltipWidth / 2;
			left = Math.max(10, Math.min(left, viewportWidth - tooltipWidth - 10));
			return left
		}
	},

	methods: {
		showTooltip() {
			this.tooltipVisible = true;
			this.tooltipText = `Percentage to ${this.progressLabel}`;

			// Calculate position for tooltip
			const target = this.$refs.tooltipTarget.getBoundingClientRect();
			const tooltipWidth = 200;
			let left = this.calcLeft

			// Tooltip style
			this.tooltipStyle = {
				position: 'fixed',
				left: `${left}px`,
				opacity: 0,
				transform: 'translateY(-10px)',
				background: this.tooltipBackground,
				color: '#fff',
				padding: '10px',
				borderRadius: '10px',
				pointerEvents: 'none',
				whiteSpace: 'normal',
				zIndex: 1000,
				width: `${tooltipWidth}px`,
				textAlign: 'center',
				overflowWrap: 'break-word',
				transition: 'all 0.3s ease-in-out',
			};

			this.tooltipArrowStyle = {
				borderTop: `10px solid ${this.tooltipBackground}`,
			};

			this.$nextTick(() => {
				const tooltipElement = this.$refs.tooltipElement;
				const tooltipHeight = tooltipElement ? tooltipElement.offsetHeight : 0;
				const top = target.top - tooltipHeight - 20;

				this.tooltipStyle.top = `${top}px`;
				this.tooltipStyle.opacity = 1;
				this.tooltipStyle.transform = 'translateY(0)';
			});
		},
		hideTooltip() {
			this.tooltipStyle.opacity = 0;
			this.tooltipStyle.transform = 'translateY(10px)';
		},
	},
};
</script>

<style scoped>
div.progress {
	position: fixed;
	bottom: 10px;
	left: 15px;
	width: calc(100% - 30px);
	font-size: 16pt;
	text-align: left;
	background-color: #747474;
	border-radius: var(--var-border-radius, 0.5rem);
	margin: 0 auto;
	overflow: hidden;
}

div.percent {
	width: 0;
	text-align: center;
	border-radius: inherit;
	color: white;
}

.tooltip {
	position: fixed;
	color: #fff;
	padding: 10px;
	border-radius: 10px;
	white-space: normal;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	opacity: 0;
	z-index: 1000;
	pointer-events: none;
	text-align: center;
	overflow-wrap: break-word;
	transition: all 0.3s ease-in-out;
}

.tooltip-arrow {
	position: absolute;
	left: 50%;
	bottom: -10px;
	margin-left: -10px;
	border-left: 10px solid transparent;
	border-right: 10px solid transparent;
}
</style>