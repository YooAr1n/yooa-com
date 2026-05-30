<template>
  <div class="progress" ref="progressRoot">
    <div class="percent-fill" ref="percentBar"></div>
    <span
      class="prog-tooltip"
      ref="percentText"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @mousemove="onMouseMove"
    ></span>
    <div
      class="tooltip"
      :class="{ ready: tooltipReady, visible: tooltipActive }"
      ref="tooltipElement"
      @transitionend="onTransitionEnd"
    >
      <span ref="tooltipText"></span>
      <div class="tooltip-arrow" ref="tooltipArrow"></div>
    </div>
  </div>
</template>

<script>
import { inAnyChallenge, player } from '@/incremental/incremental.js';
import { gameLayers } from '@/incremental/layersData';
import { nextTick, markRaw } from 'vue';
import Decimal from '@/incremental/break_eternity.js';

const STAGES = [
  { label: 'YooAmatter', key: 'YooAPoints', scale: 'log', threshold: new Decimal(1e12), startColor: '#929923', endColor: '#bcc70f' },
  { label: 'YooAity', key: 'YooAmatter', scale: 'log', threshold: new Decimal('9.17e1995'), startColor: '#200642', endColor: '#230085' },
  { label: 'OH MY GIRL Debut', key: 'YooAEssence', scale: 'double-log', threshold: new Decimal('eee3'), startColor: '#6b00cf', endColor: '#c500ed' },
  { label: 'Endgame', key: 'MIRACLEs', scale: 'lin', threshold: new Decimal(1e3), startColor: '#6b00cf', endColor: '#c500ed' },
];

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function averageColor(color1, color2) {
  const a = hexToRgb(color1);
  const b = hexToRgb(color2);
  const r = Math.round((a.r + b.r) / 2);
  const g = Math.round((a.g + b.g) / 2);
  const bl = Math.round((a.b + b.b) / 2);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

function stageCurrency(stage) {
  if (stage.key === 'YooAPoints') return player.YooAPoints;
  if (stage.key === 'YooAmatter') return player.YooAmatter.amount;
  if (stage.key === 'YooAEssence') return player.YooAity.amount;
  return gameLayers.OMG.getMIRACLEs();
}

function progressFor(currency, threshold, scale) {
  if (scale === 'log') return currency.max(1).log10().div(threshold.log10()).min(1);
  if (scale === 'double-log') return currency.max(10).log10().log10().div(threshold.log10().log10()).min(1);
  return currency.div(threshold).min(1);
}

export default {
  name: 'ProgressBar',
  data() {
    return {
      tooltipReady: false,
      tooltipActive: false,
    };
  },
  created() {
    this._visual = markRaw({
      stages: STAGES,
      targetPercent: 0,
      lastPercentText: '',
      lastStageIndex: -1,
      lastBackground: '',
      lastTooltipText: '',
      tooltipVisible: false,
      tooltipRaf: 0,
    });
  },
  mounted() {
    window.addEventListener('GAME_EVENT.UPDATE', this.updateTarget, { passive: true });
    window.addEventListener('resize', this.schedulePositionUpdate, { passive: true });
    window.addEventListener('scroll', this.schedulePositionUpdate, true);
    this.initDom();
    this.updateTarget();
    this.schedulePositionUpdate();
  },
  beforeUnmount() {
    window.removeEventListener('GAME_EVENT.UPDATE', this.updateTarget);
    window.removeEventListener('resize', this.schedulePositionUpdate);
    window.removeEventListener('scroll', this.schedulePositionUpdate, true);
    if (this._visual?.tooltipRaf) cancelAnimationFrame(this._visual.tooltipRaf);
  },
  methods: {
    initDom() {
      const bar = this.$refs.percentBar;
      if (bar) {
        bar.style.transformOrigin = 'left center';
        bar.style.transform = 'scaleX(0)';
      }
    },
    updateTarget() {
      const state = this._visual;
      let label = 'YooAmatter';
      let stageIndex = 0;
      let percent = Decimal.dZero;
      let start = STAGES[0].startColor;
      let end = STAGES[0].endColor;

      if (inAnyChallenge()) {
        const chall = player.inChallenge;
        const challenge = gameLayers[chall[0]].challenges[chall[1]];
        const goal = typeof challenge.goal === 'function' ? challenge.goal() : challenge.goal;
        const current = challenge.goalLayer ? player[challenge.goalLayer][challenge.goalInternal] : player[challenge.goalInternal];
        percent = current.max(1).log10().div(goal.log10()).min(1);
        label = 'Challenge goal';
      } else {
        for (let i = 0; i < STAGES.length; i++) {
          const stage = STAGES[i];
          const currency = stageCurrency(stage);
          if (currency.lt(stage.threshold) || i === STAGES.length - 1) {
            stageIndex = i;
            label = stage.label;
            start = stage.startColor;
            end = stage.endColor;
            percent = progressFor(currency, stage.threshold, stage.scale);
            break;
          }
        }
      }

      const nextPercent = Math.max(0, Math.min(1, percent.toNumber()));
      const bar = this.$refs.percentBar;
      if (bar && Math.abs(nextPercent - state.targetPercent) > 0.00001) {
        state.targetPercent = nextPercent;
        bar.style.transform = `scaleX(${nextPercent})`;
      }

      if (bar && stageIndex !== state.lastStageIndex) {
        state.lastStageIndex = stageIndex;
        const background = `linear-gradient(to right, ${start}, ${end})`;
        if (background !== state.lastBackground) {
          state.lastBackground = background;
          bar.style.background = background;
        }
      }

      const text = `${window.format(percent.mul(100))}%`;
      if (text !== state.lastPercentText) {
        state.lastPercentText = text;
        if (this.$refs.percentText) this.$refs.percentText.textContent = text;
        this.schedulePositionUpdate();
      }

      const tooltip = `Percentage to ${label}`;
      if (tooltip !== state.lastTooltipText) {
        state.lastTooltipText = tooltip;
        if (this.$refs.tooltipText) this.$refs.tooltipText.textContent = tooltip;
      }

      if (this.$refs.tooltipElement) {
        this.$refs.tooltipElement.style.background = averageColor(start, end);
      }
      if (state.tooltipVisible) this.schedulePositionUpdate();
    },
    onMouseEnter() {
      this._visual.tooltipVisible = true;
      this.showTooltip();
    },
    onMouseLeave() {
      this._visual.tooltipVisible = false;
      this.tooltipActive = false;
    },
    onMouseMove() {
      if (this._visual.tooltipVisible) this.schedulePositionUpdate();
    },
    schedulePositionUpdate() {
      const state = this._visual;
      if (state.tooltipRaf) return;
      state.tooltipRaf = requestAnimationFrame(() => {
        state.tooltipRaf = 0;
        this.updatePositions();
      });
    },
    async showTooltip() {
      this.updatePositions();
      this.tooltipReady = true;
      await nextTick();
      setTimeout(() => (this.tooltipActive = true), 8);
    },
    onTransitionEnd(e) {
      if (!this.tooltipActive && e.propertyName === 'opacity') this.tooltipReady = false;
    },
    updatePositions() {
      const text = this.$refs.percentText;
      const bar = this.$refs.percentBar;
      const root = this.$refs.progressRoot;
      if (!text || !bar || !root) return;

      const rootRect = root.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();
      const fillCenterX = rootRect.left + rootRect.width * this._visual.targetPercent / 2;
      const margin = 8;
      let textLeft = Math.round(fillCenterX - textRect.width / 2);
      const minLeft = Math.round(rootRect.left + margin);
      const maxLeft = Math.round(rootRect.right - margin - textRect.width);
      if (textLeft < minLeft) textLeft = minLeft;
      if (textLeft > maxLeft) textLeft = maxLeft;

      text.style.left = `${textLeft}px`;
      text.style.top = `${Math.round(rootRect.top + rootRect.height / 2 - textRect.height / 2)}px`;

      if (!this._visual.tooltipVisible) return;
      const tooltip = this.$refs.tooltipElement;
      const arrow = this.$refs.tooltipArrow;
      if (!tooltip || !arrow) return;

      const tooltipRect = tooltip.getBoundingClientRect();
      const targetRect = text.getBoundingClientRect();
      const centerX = targetRect.left + targetRect.width / 2;
      let top = targetRect.top - tooltipRect.height - 8;
      let above = true;
      if (top < 8) {
        top = targetRect.bottom + 8;
        above = false;
      }
      let left = Math.round(centerX - tooltipRect.width / 2);
      const maxTooltipLeft = Math.round(window.innerWidth - tooltipRect.width - margin);
      if (left < margin) left = margin;
      if (left > maxTooltipLeft) left = maxTooltipLeft;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.transform = this.tooltipActive ? 'translateY(0)' : 'translateY(4px)';
      arrow.style.left = `${Math.max(6, Math.min(Math.round(centerX - left - 7), Math.round(tooltipRect.width - 20)))}px`;
      arrow.style.bottom = above ? '-7px' : '';
      arrow.style.top = above ? '' : '-7px';
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

.percent-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: inherit;
  color: white;
  z-index: 1;
  overflow: hidden;
  will-change: transform;
  transition: transform 80ms linear;
}

.prog-tooltip {
  position: fixed;
  z-index: 2;
  pointer-events: auto;
  white-space: nowrap;
  background: transparent;
  padding: 0 6px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0,0,0,0.35);
}

.tooltip {
  position: fixed;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
  transform: translateY(4px);
  font-size: 16pt;
  white-space: nowrap;
  display: inline-block;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  z-index: 9999;
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
