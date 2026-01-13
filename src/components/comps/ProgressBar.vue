<template>
	<div class="progress" ref="progressRoot">
		<!-- filled portion -->
		<div id="percentbar" class="percent-fill" :style="progressBarStyle" ref="percentBar"></div>

		<!-- percent text sits centered on the filled part; style is computed in JS -->
		<span id="percent"
		      class="prog-tooltip"
		      ref="tooltipTarget"
		      :style="percentTextStyle"
		      @mouseenter="onMouseEnter"
		      @mouseleave="onMouseLeave"
		      @mousemove="onMouseMove">
			{{ percentFormatted }}
		</span>

		<!-- tooltip (unchanged behavior) -->
		<div class="tooltip" :class="{ ready: tooltipReady, visible: tooltipActive }" :style="tooltipStyle"
		     ref="tooltipElement" @transitionend="onTransitionEnd">
			{{ tooltipText }}
			<div class="tooltip-arrow" :style="tooltipArrowStyle"></div>
		</div>
	</div>
</template>

<script>
import { inAnyChallenge, player } from '@/incremental/incremental.js';
import { gameLayers } from '@/incremental/layersData';
import { nextTick } from 'vue';

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
			YooAPoints: Decimal.dZero,
			YooAmatter: Decimal.dZero,
			YooAEssence: Decimal.dZero,
			MIRACLEs: Decimal.dZero,
			inChallenge: ['', ''],
			challCurr: Decimal.dZero,
			currentStage: 0,

			// tooltip state
			tooltipVisible: false,
			tooltipReady: false,
			tooltipActive: false,
			tooltipStyle: {
				position: 'fixed',
				left: '0px',
				top: '0px',
				opacity: 0,
				transform: 'translateY(0px)'
			},
			tooltipArrowStyle: {},
			updateRaf: null,

			// percent text inline style (centers text on filled part)
			percentTextStyle: {
				position: 'fixed',
				left: '0px',
				top: '0px',
				transform: 'translateY(-50%)',
				zIndex: 2,
				pointerEvents: 'auto', // still allow hover
				whiteSpace: 'nowrap'
			},
		};
	},
	computed: {
		progressStages() {
			return [
				{ label: 'YooAmatter', currency: this.YooAPoints, scale: "log", threshold: new Decimal(1e12), startColor: '#929923', endColor: '#bcc70f' },
				{ label: 'YooAity', currency: this.YooAmatter, scale: "log", threshold: new Decimal('9.17e1995'), startColor: '#200642', endColor: '#230085' },
				{ label: 'OH MY GIRL Debut', currency: this.YooAEssence, scale: "double-log", threshold: new Decimal('eee3'), startColor: '#6b00cf', endColor: '#c500ed' },
				{ label: 'Endgame', currency: this.MIRACLEs, scale: "lin", threshold: new Decimal(1e3), startColor: '#6b00cf', endColor: '#c500ed' },
			];
		},
		threshold() {
			if (inAnyChallenge()) {
				return gameLayers[this.inChallenge[0]].challenges[this.inChallenge[1]].goal;
			}
			const stage = this.progressStages[this.currentStage] || this.progressStages[0];
			return stage.threshold;
		},
		progressLabel() {
			if (inAnyChallenge()) return 'Challenge goal';
			const stage = this.progressStages[this.currentStage] || this.progressStages[0];
			return stage.label;
		},
		gradientColors() {
			const stage = this.progressStages[this.currentStage] || this.progressStages[0];
			return { start: stage.startColor, end: stage.endColor };
		},
		percent() {
			if (inAnyChallenge()) {
				let challenge = gameLayers[this.inChallenge[0]].challenges[this.inChallenge[1]];
				const goal = typeof challenge.goal === "function" ? challenge.goal() : challenge.goal;
				return this.challCurr.max(1).log10().div(goal.log10()).min(1);
			}
			const stage = this.progressStages[this.currentStage] || this.progressStages[0];
			if (stage.scale === "linear") return stage.currency.div(this.threshold).min(1);
			if (stage.scale === "log") return stage.currency.max(1).log10().div(this.threshold.log10()).min(1);
			if (stage.scale === "double-log") return stage.currency.max(10).log10().log10().div(this.threshold.log10().log10()).min(1);
			return stage.currency.div(this.threshold).min(1);
		},
		percentFormatted() {
			return format(this.percent.mul(100)) + '%';
		},
		progressWidth() {
			const pct = Math.max(0, Math.min(1, isFinite(this.percent.toNumber()) ? this.percent.toNumber() : 0));
			// keep high precision to avoid tiny off-by-one pixel issues, but it will be exactly 0% when percent==0
			return `${(pct * 100).toFixed(4)}%`;
		},
		progressBarStyle() {
			const { start, end } = this.gradientColors;
			return {
				width: this.progressWidth,
				height: '100%',
				background: `linear-gradient(to right, ${start}, ${end})`,
				borderRadius: 'inherit',
			};
		},
		tooltipBackground() {
			const { start, end } = this.gradientColors;
			return averageColor(start, end);
		},
		tooltipText() {
			return `Percentage to ${this.progressLabel}`;
		},
	},
	mounted() {
		window.addEventListener("GAME_EVENT.UPDATE", this.update);
		window.addEventListener('resize', this.scheduleUpdateTooltip);
		window.addEventListener('scroll', this.scheduleUpdateTooltip, true);
		// ensure initial position
		this.$nextTick(() => this.scheduleUpdateTooltip());
	},
	beforeUnmount() {
		window.removeEventListener("GAME_EVENT.UPDATE", this.update);
		window.removeEventListener('resize', this.scheduleUpdateTooltip);
		window.removeEventListener('scroll', this.scheduleUpdateTooltip, true);
		if (this.updateRaf) cancelAnimationFrame(this.updateRaf);
	},
	methods: {
		update() {
			this.YooAPoints = player.YooAPoints;
			this.YooAmatter = player.YooAmatter.amount;
			this.YooAEssence = player.YooAity.amount;
			this.MIRACLEs = gameLayers.OMG.getMIRACLEs();
			this.inChallenge = player.inChallenge;

			if (inAnyChallenge()) {
				let challenge = gameLayers[this.inChallenge[0]].challenges[this.inChallenge[1]];
				this.challCurr = challenge.goalLayer ? player[challenge.goalLayer][challenge.goalInternal] : player[challenge.goalInternal];
				this.currentStage = 0;
			} else {
				const stageIndex = this.progressStages.findIndex((stage) => {
					const currency = stage.currency ?? new Decimal(0);
					const threshold = stage.threshold ?? new Decimal(1);
					return currency.lt(threshold);
				});
				this.currentStage = stageIndex === -1 ? this.progressStages.length - 1 : stageIndex;
			}

			if (this.tooltipVisible) this.scheduleUpdateTooltip();
			// always reposition percent text on update too
			this.scheduleUpdateTooltip();
		},

		onMouseEnter() {
			this.tooltipVisible = true;
			this.showTooltip();
		},
		onMouseLeave() {
			this.tooltipVisible = false;
			this.hideTooltip();
		},
		onMouseMove() {
			if (this.tooltipVisible) this.scheduleUpdateTooltip();
		},

		scheduleUpdateTooltip() {
			if (this.updateRaf) cancelAnimationFrame(this.updateRaf);
			this.updateRaf = requestAnimationFrame(() => {
				this.updateRaf = null;
				this.updateTooltipPosition();
				this.updatePercentTextPosition();
			});
		},

		async showTooltip() {
			this.updateTooltipPosition();
			this.tooltipReady = true;
			await nextTick();
			setTimeout(() => (this.tooltipActive = true), 8);
		},

		hideTooltip() {
			this.tooltipActive = false;
		},

		onTransitionEnd(e) {
			if (!this.tooltipActive && e.propertyName === 'opacity') {
				this.tooltipReady = false;
			}
		},

		updateTooltipPosition() {
			const target = this.$refs.tooltipTarget;
			const tooltip = this.$refs.tooltipElement;
			const bar = this.$refs.percentBar;
			const root = this.$refs.progressRoot;
			if (!target || !tooltip || !bar || !root) return;

			const targetRect = target.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();
			const barRect = bar.getBoundingClientRect();

			const centerX = targetRect.left + targetRect.width / 2;

			let top = targetRect.top - tooltipRect.height - 8;
			let placeAbove = true;
			if (top < 8) {
				top = targetRect.bottom + 8;
				placeAbove = false;
			}

			const margin = 8;
			let left = Math.round(centerX - tooltipRect.width / 2);
			const maxLeft = Math.round(window.innerWidth - tooltipRect.width - margin);
			if (left < margin) left = margin;
			if (left > maxLeft) left = maxLeft;

			const arrowCenter = Math.round(centerX - left);
			const arrowHalf = 7;
			let arrowLeft = arrowCenter - arrowHalf;
			const minArrowLeft = 6;
			const maxArrowLeft = Math.round(tooltipRect.width - arrowHalf * 2 - 6);
			if (arrowLeft < minArrowLeft) arrowLeft = minArrowLeft;
			if (arrowLeft > maxArrowLeft) arrowLeft = maxArrowLeft;

			this.tooltipStyle = {
				position: 'fixed',
				left: `${left}px`,
				top: `${top}px`,
				opacity: this.tooltipActive ? 1 : 0,
				transform: this.tooltipActive ? (placeAbove ? 'translateY(0)' : 'translateY(0)') : 'translateY(4px)',
				background: this.tooltipBackground,
				color: '#fff',
				padding: '8px 12px',
				borderRadius: '6px',
				boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
				transition: 'opacity 160ms ease, transform 160ms ease',
				zIndex: 9999,
			};

			this.tooltipArrowStyle = {
				position: 'absolute',
				left: `${arrowLeft}px`,
				bottom: placeAbove ? '-7px' : undefined,
				top: placeAbove ? undefined : '-7px',
			};
		},

		updatePercentTextPosition() {
			// center the percent text on the filled portion, but clamp it within the progress container
			const target = this.$refs.tooltipTarget; // the span
			const bar = this.$refs.percentBar; // the filled element
			const root = this.$refs.progressRoot;
			if (!target || !bar || !root) return;

			const targetRect = target.getBoundingClientRect();
			const barRect = bar.getBoundingClientRect();
			const rootRect = root.getBoundingClientRect();

			// center of the filled area
			const fillCenterX = barRect.left + barRect.width / 2;

			// default left for the percent text (centered on fill center)
			let textLeft = Math.round(fillCenterX - targetRect.width / 2);

			// clamp to stay inside the progress container (8px margin)
			const margin = 8;
			const minLeft = Math.round(rootRect.left + margin);
			const maxLeft = Math.round(rootRect.right - margin - targetRect.width);
			if (textLeft < minLeft) textLeft = minLeft;
			if (textLeft > maxLeft) textLeft = maxLeft;

			// vertical center of the progress container
			const textTop = Math.round(rootRect.top + rootRect.height / 2 - targetRect.height / 2);

			this.percentTextStyle = {
				position: 'fixed',
				left: `${textLeft}px`,
				top: `${textTop}px`,
				transform: 'translateY(0)', // we've pre-calculated vertical center
				zIndex: 2,
				pointerEvents: 'auto',
				whiteSpace: 'nowrap'
			};
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
	height: 35px;
	font-size: 16pt;
	text-align: left;
	background-color: #747474;
	border-radius: var(--var-border-radius, 0.5rem);
	margin: 0 auto;
	overflow: hidden;
	padding: 6px 12px;
	box-sizing: border-box;
}

/* filled portion now aligns to left:0 and width is the percent (0% will be exactly zero width) */
.percent-fill {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	border-radius: inherit;
	color: white;
	z-index: 1;
	overflow: hidden;
}

/* percent text is positioned using percentTextStyle (fixed coords computed in JS) */
.prog-tooltip {
	/* no static positioning here; JS controls its fixed coords */
	background: transparent;
	padding: 0 6px;
	font-weight: 600;
	color: #fff;
	text-shadow: 0 1px 0 rgba(0,0,0,0.35);
}

/* tooltip styles unchanged from before */
.tooltip {
	position: fixed;
	opacity: 0;
	pointer-events: none;
	transition: opacity 160ms ease, transform 160ms ease;
	transform: translateY(4px);
	font-size: 16pt;
	white-space: nowrap;
	display: inline-block;
}

.tooltip.ready { pointer-events: auto; }
.tooltip.visible { opacity: 1; transform: translateY(0); }

.tooltip-arrow {
	position: absolute;
	width: 0;
	height: 0;
	border-left: 7px solid transparent;
	border-right: 7px solid transparent;
	border-top: 7px solid rgba(0,0,0,0.2);
}
</style>
