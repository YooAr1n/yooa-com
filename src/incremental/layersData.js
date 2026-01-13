/* layersData.js */
import Decimal from "./break_eternity.js";
import { GameCache } from "./cache.js";
import { hasAchievement, calculateAchievementMultiplier, player } from "./incremental.js";
import { generateNewProblem } from "@/components/comps/MathProblem.vue"; // Import generateNewProblem function
import { getArinEffect, getArinEffLevels, getAriniumEffect, getArinRankEffect, getArinTierEffect, updateAllAutobuyerTime } from "./automation.js";
import { challengeEffect, getChallLevels, getUpgLevels, hasChallenge, hasMilestone, hasUpgrade, inChallenge, milestoneEffect, upgradeEffect } from "./mainFuncs.js";

// Hot bindings + per-tick cache
const dZero = Decimal.dZero;
const dOne = Decimal.dOne;
const dTwo = new Decimal(2);
const pow = Decimal.pow;
const pow10 = Decimal.pow10;
const SQRT60 = Decimal.sqrt(60);
const LN10 = Decimal.ln(10);

const D_30 = new Decimal(30);
const D_60 = new Decimal(60);
const D_120 = new Decimal(120);
const D_1300 = new Decimal(1300);
const D_1400 = new Decimal(1400);
const D_700 = new Decimal(700);
const D_2500 = new Decimal(2500);
const D_5000 = new Decimal(5000);
const D_1e6 = new Decimal(1e6);
const D_1e8 = new Decimal(1e8);
const D_1e9 = new Decimal(1e9);
const D_1e10 = new Decimal(1e10);
const D_1e20 = new Decimal(1e20);
const D_1e70 = new Decimal(1e70);
const D_1e130 = new Decimal(1e130);
const D_1e140 = new Decimal(1e140);
const D_1e150 = new Decimal(1e150);
const D_1e100 = new Decimal(1e100);
const D_1e200 = new Decimal(1e200);
const D_e700 = new Decimal("1e700");
const D_1e2700 = new Decimal("1e2700");
const D_1e1000 = new Decimal("1e1000");
const D_1e5000 = new Decimal("1e5000");

const C_544_5e7 = new Decimal(544.5e7); // +544.5e7
const K_87e7 = new Decimal(87e7);      // +87e7
const C_1521e5 = new Decimal(1521e5);
const C_1764e5 = new Decimal(1764e5);
const C_2482e5 = new Decimal(2482e5);
const C_3e8 = new Decimal(3e8);

export const gameLayers = {
  YooA: {
    unlocked: true,
    color: "#d17be2",
    problemGain() {
      const baseArr = GameCache.YooAmatter_YooAriumEffect.value;
      let gain = baseArr[1].mul(upgradeEffect('YooAmatter', 34));

      if (hasAchievement(38)) gain = gain.mul(GameCache.AchievementMult.value);
      if (hasUpgrade('YooAmatter', 12)) gain = gain.mul(upgradeEffect('YooAmatter', 12));
      if (hasUpgrade('YooAmatter', 51)) gain = gain.mul(upgradeEffect('YooAmatter', 51)[0]);
      if (hasUpgrade('YooA', 32)) gain = gain.mul(upgradeEffect('YooA', 32));
      if (hasChallenge('YooAmatter', 1)) gain = gain.mul(challengeEffect('YooAmatter', 1)[1]);
      if (hasChallenge('YooAmatter', 4)) gain = gain.mul(challengeEffect('YooAmatter', 4)[2]);

      return gain;
    },
    digits() {
      let digs = gameLayers.YooA.upgrades[11].digits().toNumber() + 1;

      if (inChallenge('YooAmatter', 1)) digs *= 1.5;
      if (inChallenge('YooAmatter', 2)) digs *= 1.6;
      if (inChallenge('YooAmatter', 3)) digs *= 1.25;
      if (inChallenge('YooAmatter', 4)) digs *= 1.5;

      if (hasChallenge('YooAmatter', 2)) digs *= challengeEffect('YooAmatter', 2)[0];
      if (hasChallenge('YooAmatter', 3)) digs *= challengeEffect('YooAmatter', 3)[0];
      if (hasChallenge('YooAmatter', 4)) digs *= challengeEffect('YooAmatter', 4)[0];

      return Math.max(digs, 1);
    },
    effectiveYU11() {
      return getUpgLevels("YooA", 11).add(gameLayers.YooAity.getEffectiveUpgs());
    },
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 11);
      },
      rows: 4,
      cols: 4,
      11: {
        title: "YooA Challenge (YU 11)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooA Points."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 11) : x;
          let cost = pow(10, x);
          if (x.gte(5)) cost = pow(1e5, x.sub(5).pow(1.5)).mul(D_1e70);
          if (x.gte(17)) cost = pow(1e30, x.sub(17).pow(1.6)).mul(D_e700);
          return cost;
        },
        invCost(x) {
          // localize intermediate to avoid repeated chains
          let c = x.log10().min(4);
          if (c.gte(4) && x.gte(D_1e70)) c = x.div(D_1e70).log(1e5).root(1.5).add(5).min(16);
          if (c.gte(16) && x.gte(D_e700)) c = x.div(D_e700).log(1e30).root(1.6).add(17);
          return c;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 5;
          if (hasUpgrade("YooAmatter", 21)) max += 7;
          if (hasChallenge("YooAmatter", 3)) max += 13;
          max = Decimal.add(max, gameLayers.YooA.upgrades[32].addLevels());
          return max;
        },
        base() {
          return upgradeEffect("YooA", 13).add(dTwo).mul(upgradeEffect("YooAmatter", 41));
        },
        baseDigits() {
          // tiny values; keep as Decimal
          return Decimal.sub(1, upgradeEffect("YooA", 14)).sub(upgradeEffect("YooA", 33));
        },
        effect() {
          const exp = gameLayers.YooA.effectiveYU11();
          return pow(this.base(), exp);
        },
        digits() {
          return Decimal.mul(this.baseDigits(), getUpgLevels("YooA", 11));
        },
        effectDisplay() {
          return `+${format(this.digits())} digits, x${format(this.effect())}`;
        },
        onBuy() {
          generateNewProblem("YooA");
        },
      },
      12: {
        title: "YooA Solver (YU 12)",
        description() {
          return "Gain more YooA Points based on math problems solved."
        },
        cost: new Decimal(5),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: dOne,
        effect() {
            let eff = pow(1.01, player.math.YooA.solved);
            if (eff.gte(100)) {
              const dil = hasUpgrade("YooAmatter", 52) ? 0.55 : 0.5;
              if (hasUpgrade("YooAmatter", 22)) eff = eff.log10().mul(5).dilate(dil).div(5).pow10();
              else eff = eff.log10().mul(50);
              if (eff.gte(D_1e100)) eff = eff.log10().dilate(dTwo).pow(25);
            }
            if (inChallenge("YooAmatter", 3)) {
              eff = eff.pow(19.95);
              if (eff.gte(D_1e100)) eff = eff.div(D_1e100).root(19.95).mul(D_1e100);
            }
            if (hasMilestone("YooAity", 7)) eff = eff.pow(milestoneEffect("YooAity", 7));
            return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = `x${format(eff)}`;
          if (inChallenge("YooAmatter", 3)) eff = eff.root(19.95);
          if (hasMilestone("YooAity", 7)) eff = eff.root(milestoneEffect("YooAity", 7));
          if (eff.gte(D_1e100)) dis += softcapText("(softcapped)<sup>2</sup>");
          else if (eff.gte(100)) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      13: {
        title: "YooA Enhancer (YU 13)",
        description() {
          return "Add " + format(1) + " to 'YooA Challenge' base multiplier."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 13) : x;
          let cost = pow(100, x).mul(100);
          if (x.gte(3)) cost = pow(1e10, x.sub(3).pow(1.15)).mul(D_1e130);
          return cost;
        },
        invCost(x) {
          let cost = x.div(100).log(100).min(2);
          if (cost.gte(2) && x.gte(D_1e130)) cost = x.div(D_1e130).log(1e10).root(1.15).add(3);
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          return new Decimal(hasUpgrade("YooAmatter", 21) ? 10 : 3);
        },
        effect() {
          return getUpgLevels("YooA", 13);
        },
        effectDisplay() {
          return `+${format(this.effect())}`;
        },
      },
      14: {
        title: "YooA Simplifier (YU 14)",
        description() {
          return "Reduce the digits added in 'YooA Challenge' by " + format(0.2) + ". Double YooA Point gain at " + formatWhole(2) + " and " + formatWhole(3) + " levels"
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 14) : x;
          return pow(2000, x).mul(5000);
        },
        invCost(x) {
          return x.div(5000).log(2000);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(3),
        effect() {
          return getUpgLevels("YooA", 14).div(5);
        },
        effectGain() {
          return pow(2, getUpgLevels("YooA", 14).sub(1).max(0));
        },
        effectDisplay() {
          return "-" + format(this.effect()) + ", x" + format(this.effectGain());
        },
        onBuy() {
          generateNewProblem("YooA");
        },
      },
      21: {
        title: "Auto-YooA (YU 21)",
        description() {
          let percent = 10;
          if (inChallenge("YooAmatter", 2)) percent = 0;
          return "Gain " + format(percent) + "% of YooA Points gained on solve per second (" + format(this.effect()) + "/s)."
        },
        cost: D_1e6,
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: dOne,
        effect() {
          if (inChallenge("YooAmatter", 2)) return dZero;
          return GameCache.YooAGain.value.div(10);
        },
        effectDisplay() {
          let gain = this.effect();
          if (!hasUpgrade("YooA", 21)) gain = 0;
          return format(gain) + "/s";
        },
      },
      22: {
        title: "Dimension Solver (YU 22)",
        description() {
          return "Boost all YooA dimensions based on math problems solved."
        },
        cost: D_1e8,
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: dOne,
        effect() {
            let eff = pow(1.003, player.math.YooA.solved);
            if (eff.gte(100)) {
              let dil = 0.5;
              if (hasUpgrade("YooAmatter", 52)) dil = 0.55;
              if (hasUpgrade("YooAmatter", 22)) eff = eff.log10().mul(5).dilate(dil).div(5).pow10();
              else eff = eff.log10().mul(50);
              if (eff.gte(1e30)) eff = eff.log10().mul(10 / 3).dilate(2).pow(7.5);
            }
            if (inChallenge("YooAmatter", 3)) {
              eff = eff.pow(19.95);
              if (eff.gte(D_1e100)) eff = eff.div(D_1e100).root(19.95).mul(D_1e100);
            }
            if (hasMilestone("YooAity", 7)) eff = eff.pow(milestoneEffect("YooAity", 7));
            return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = "x" + format(eff);
          if (inChallenge("YooAmatter", 3)) eff = eff.root(19.95);
          if (hasMilestone("YooAity", 7)) eff = eff.root(milestoneEffect("YooAity", 7));
          if (eff.gte(1e30)) dis += softcapText("(softcapped)<sup>2</sup>");
          else if (eff.gte(100)) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      23: {
        title: "YooA Doubler (YU 23)",
        description() {
          return "Double YooA Point gain."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 23) : x;
          let exp = hasUpgrade("YooAity", 41) ? 1.1 : 1.3;
          return pow(3, x.pow(exp)).mul(D_1e9);
        },
        invCost(x) {
          let exp = hasUpgrade("YooAity", 41) ? 1.1 : 1.3;
          return x.div(D_1e9).log(3).root(exp);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          return pow(2, getUpgLevels("YooA", 23));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "YooA Booster (YU 24)",
        description() {
          return "Gain " + format(20) + "x more YooA Points."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 24) : x;
          if (x.lte(0)) return D_1e20;
          let exp = hasUpgrade("YooAity", 41) ? 1.1 : 1.35;
          return pow(1e5, x.sub(1).pow(exp)).mul(D_1e5000);
        },
        invCost(x) {
          let cost = dZero;
          let exp = hasUpgrade("YooAity", 41) ? 1.1 : 1.35;
          if (x.gte(D_1e5000)) cost = x.div(D_1e5000).log(1e5).root(exp).add(1);
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          return hasAchievement(41) ? undefined : dOne;
        },
        effect() {
          return pow(20, getUpgLevels("YooA", 24));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      31: {
        title: "YooA-er (YU 31)",
        description() {
          return "Gain " + format(this.base()) + "x more YooA Points/s (Based on YooA Points)."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 31) : x;
          return pow(1000, x.pow(1.5)).mul(1e30);
        },
        invCost(x) {
          return x.div(1e30).log(1e3).root(1.5);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          let base = player.YooAPoints.add(10).log10();
          if (hasUpgrade("YooAity", 33)) base = base.pow(199.5);
          return base;
        },
        effect() {
          return this.base().pow(getUpgLevels("YooA", 31));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      32: {
        title: "YooA Mastery (YU 32)",
        description() {
          return "Add " + formatWhole(this.base()) + " levels to 'YooA Challenge' and boost YooA Dimensions and math problem gain by " + format(20) + "% per 'YooA Challenge' level after " + formatWhole(5) + "."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 32) : x;
          if (x.lte(0)) return D_1e70;
          return pow(D_1e1000, x.sub(1).pow(2)).mul(D_1e2700);
        },
        invCost(x) {
          let cost = dZero;
          if (x.gte(D_1e2700)) cost = x.div(D_1e2700).log10().div(1e3).root(2).add(1);
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 1;
          if (hasUpgrade("YooAmatter", 43)) max += 4;
          if (hasUpgrade("YooAmatter", 53)) max += 5;
          return new Decimal(max);
        },
        base() {
          let max = 5;
          if (hasUpgrade("YooAmatter", 53)) max += 2;
          if (hasUpgrade("YooAmatter", 54)) max += 2;
          return new Decimal(max).mul(upgradeEffect("sparks", 14));
        },
        addLevels() {
          return getUpgLevels("YooA", 32).mul(this.base()).floor();
        },
        effect() {
          const effUpgs = gameLayers.YooA.effectiveYU11();
          return pow(1.2, effUpgs.sub(5).mul(getUpgLevels("YooA", 32)).max(0));
        },
        effectDisplay() {
          return "+" + formatWhole(this.addLevels()) + " levels, x" + format(this.effect());
        },
      },
      33: {
        title: "YooA Streamliner (YU 33)",
        description() {
          let mult = "double all YooA Dimension multipliers";
          if (hasUpgrade("YooAmatter", 24)) mult = "multiply all YooA Dimension multipliers by " + format(this.base());
          return "Reduce the digits added in 'YooA Challenge' by " + format(0.02) + " and " + mult + ".";
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 33) : x;
          return pow(1e10, x.pow(1.5)).mul(D_1e150);
        },
        invCost(x) {
          return x.div(D_1e150).log(1e10).root(1.5);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 10;
          if (hasUpgrade("YooAmatter", 24)) max += 2;
          return new Decimal(max);
        },
        base() {
          return hasUpgrade("YooAmatter", 24) ? new Decimal(2.5) : Decimal.dTwo;
        },
        effect() {
          return getUpgLevels("YooA", 33).div(50);
        },
        effectGain() {
          return pow(this.base(), getUpgLevels("YooA", 33));
        },
        effectDisplay() {
          return "-" + format(this.effect()) + ", x" + format(this.effectGain());
        },
        onBuy() {
          generateNewProblem("YooA");
        },
      },
      34: {
        title: "YooA Catalyst (YU 34)",
        description() {
          return "Multiply YooA Dimensions by " + format(this.base()) + " (Based on YooA Points)."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 34) : x;
          return pow(1e6, x.pow(1.55)).mul(D_1e200);
        },
        invCost(x) {
          return x.div(D_1e200).log(1e6).root(1.55);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          let exp = 0.3
          if (hasUpgrade("YooAity", 33)) exp *= 917;
          let base = player.YooAPoints.add(10).log10().dilate(0.75).pow(exp);
          return base;
        },
        effect() {
          return this.base().pow(getUpgLevels("YooA", 34));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      41: {
        title: "YooA Rank Shifter (YU 41)",
        description() {
          return "Reduce the layer of exponent in YooA Dimension effective rank for costs by " + format(this.base()) + "."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 41) : x;
          if (hasUpgrade("YooAmatter", 15)) x = x.div(2.5)
          return pow(1.6, pow(1.6, x.pow(1.5)).sub(1)).mul(2e10).pow10().pow10();
        },
        invCost(x) {
          let cost = x.log10().log10().div(2e10).log(1.6).add(1).log(1.6).root(1.5);
          if (hasUpgrade("YooAmatter", 15)) cost = cost.mul(2.5)
          return cost
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(100),
        base() {
          let base = new Decimal(0.01);
          return base;
        },
        effect() {
          let eff = this.base().mul(getUpgLevels("YooA", 41));
          return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = "-" + format(eff);
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 23)
        }
      },
      42: {
        title: "YooA Exponent Booster (YU 42)",
        description() {
          return "Raise YooA Point gain to " + format(this.base()) + " (based on YooA Dimension levels)."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 42) : x;
          return x.pow(1.5).div(10).add(1).mul(4e10).pow10().pow10();
        },
        invCost(x) {
          let cost = x.log10().log10().div(4e10).sub(1).mul(10).root(1.5);
          return cost
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          let levels = dOne
          for (let i = 0; i < 5; i++) {
            levels = levels.mul(player.dimensions.YooA[i].level)
          }
          let baseLog = levels.log10().pow(0.9)
          if (baseLog.gte(2e11)) baseLog = baseLog.div(2e11).pow(0.6).mul(5e10).add(15e10)
          if (baseLog.gte(4e12)) baseLog = baseLog.div(4e12).pow(0.55).mul(2e12).add(2e12)
          const base = baseLog.pow10()
          return base;
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("YooA", 42));
          return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = "^" + format(eff);
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 23)
        }
      },
      43: {
        title: "Miracle Light Amplifier (YU 43)",
        description() {
          return "Multiply Miracle Light gain by " + format(this.base()) + " (based on YooA Points)."
        },
        cost(x) {
          x = x === undefined ? getUpgLevels("YooA", 43) : x;
          if (x.gte(10)) x = pow(1.1, x.sub(10)).mul(10)
          return x.pow(1.55).div(13).add(1).mul(1e12).pow10().pow10();
        },
        invCost(x) {
          let cost = x.log10().log10().div(1e12).sub(1).mul(13).root(1.55);
          if (cost.gte(10)) cost = cost.div(10).log(1.1).add(10)
          return cost
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          let base = player.YooAPoints.add(10).log10().add(10).log10().add(10).log10().dilate(1.5)
          return base;
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("YooA", 43));
          return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = "x" + format(eff);
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 23)
        }
      },
      44: {
        title: "YooA's Secret Garden (YU 44)",
        description() {
          return "YooA Points boost YooA aging speed. Start aging after Secret Garden release."
        },
        cost: new Decimal("eee14"),
        invCost(x) {
          let cost = x.log10().log10().div(1e12).sub(1).mul(13).root(1.55);
          if (cost.gte(10)) cost = cost.div(10).log(1.1).add(10)
          return cost
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAPoints.add(10).log10().add(10).log10().div(1e13).dilate(0.8);
          if (hasMilestone("YooAity", 26)) eff = eff.pow(3)
          return eff;
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = "^" + format(eff);
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 23)
        }
      },
      // Add more upgrades for other rows and columns as needed
    },
  },
  YooAmatter: {
    currency: "YooAmatter",
    baseCurrency: "YooA Points",
    color: "#bcc70f",
    layer: 1,
    action: "Ascend",
    actionsCurrency: "Ascensions",
    actionsCurrencySingular: "Ascension",
    nextLayer: "YooAity",
    requires: new Decimal(1e12),
    unlocked() {
      return player.stats.YooAmatter.totalAmount.gte(1)
    },
    canReset() {
      return player.YooAPoints.gte(1e12) && this.getResetGain().gt(0)
    },
    effectExp() {
      let exp = upgradeEffect("YooAmatter", 33).add(1).mul(upgradeEffect("sparks", 13))
      return exp
    },
    effect() {
      return player.YooAmatter.amount.add(1).pow(this.effectExp())
    },
    problemGain() {
        // heavy base (YooAity computation) only once per tick
        let gain = gameLayers.YooAity.getYooChroniumEffect()[1];
        if (hasUpgrade("YooAmatter", 51)) gain = gain.mul(upgradeEffect("YooAmatter", 51)[1]);
        if (hasUpgrade("YooAity", 21)) gain = gain.mul(upgradeEffect("YooAity", 21));
        if (hasUpgrade("YooAity", 23)) gain = gain.mul(upgradeEffect("YooAity", 23));
        if (hasAchievement(44)) gain = gain.mul(achievements[44].rewardEffect());
        return gain;
    },

    YooAriumExp() {
        let eff = dOne;
        let eff2 = dOne;
        if (hasUpgrade("YooAity", 25)) eff2 = eff2.mul(10);
        if (hasUpgrade("YooAity", 45)) eff2 = eff2.mul(1995);
        return [eff, eff2];
    },

    YooAriumEffect() {
        const expArr = gameLayers.YooAmatter.YooAriumExp();
        // localize player value
        const ya = player.YooAmatter.YooArium;
        const eff = ya.add(1).pow(expArr[0]).dilate(hasUpgrade("YooAmatter", 35) ? 1.2 : 1);
        const eff2 = ya.pow(0.5).div(10).add(1).pow(expArr[1]);
        return [eff, eff2];
    },

    YooAmatterSparkEffect() {
        const sparks = player.YooAmatter.sparks;
        let eff = sparks.add(1).pow(0.75);
        const sc = gameLayers.YooAmatter.sparkSoftcap();
        if (eff.gte(sc)) {
          eff = eff.log10().div(sc.log10()).pow(0.8)
            .mul(sc.log10().mul(4 / 7))
            .add(sc.log10().mul(3 / 7))
            .pow10();
        }

        let eff2 = sparks.add(1).log10().pow(0.5).div(100).add(1);
        if (eff2.gte(1.6) && !hasUpgrade("Hyojung", 21)) eff2 = eff2.div(1.6).pow(0.5).add(0.6);
        if (eff2.gte(4) && !hasUpgrade("Hyojung", 21)) eff2 = eff2.div(4).pow(0.4).add(3);
        return [eff, eff2];
    },

    sparkSoftcap() {
        let eff = new Decimal(1e140);
        if (hasUpgrade("YooAity", 14)) eff = eff.mul(upgradeEffect("YooAity", 14));
        return eff;
    },

    getYooAriumGain() {
        // localize frequently used heavy results
        const arin0 = GameCache.Arin_effect.value[0];
        const spark0 = gameLayers.YooAmatter.YooAmatterSparkEffect()[0];
        const u31 = upgradeEffect("YooAmatter", 31);
        const u41 = upgradeEffect("YooAmatter", 41);
        const ar26 = upgradeEffect("Arinium", 26)[0];
        const ym21 = hasMilestone("YooAity", 21) ? milestoneEffect("YooAity", 21)[1] : dOne;

        let gain = new Decimal(0.01)
          .mul(arin0)
          .mul(spark0)
          .mul(u31)
          .mul(u41);

        if (player.achievements[41]) gain = gain.mul(GameCache.AchievementMult.value);
        if (hasUpgrade("YooAmatter", 32)) gain = gain.mul(upgradeEffect("YooAmatter", 32));
        if (hasUpgrade("YooAmatter", 44)) gain = gain.mul(upgradeEffect("YooAmatter", 44)[0]);
        if (hasUpgrade("YooAmatter", 43)) gain = gain.mul(3);
        if (hasMilestone("YooAity", 1)) gain = gain.mul(milestoneEffect("YooAity", 1));
        if (hasChallenge("YooAmatter", 2)) gain = gain.mul(challengeEffect("YooAmatter", 2)[1]);
        if (hasChallenge("YooAmatter", 3)) gain = gain.mul(challengeEffect("YooAmatter", 3)[1]);
        gain = gain.pow(ar26.mul(ym21))
        return gain;
    },

    digits() {
        return gameLayers.YooAmatter.upgrades[31].digits().toNumber() + 1;
    },

    getGainMult() {
        let mult = GameCache.YooAmatter_YooAriumEffect.value[0];
        if (hasAchievement(32)) mult = mult.mul(achievements[32].rewardEffect());
        if (hasAchievement(35)) mult = mult.mul(achievements[35].rewardEffect());
        return mult;
    },

    getResetGain() {
        let mult = gameLayers.YooAmatter.getGainMult();
        let gain = player.YooAPoints.div(1e12).dilate(0.8).pow(0.5);
        if (gain.gte(300)) gain = gain.div(300).pow(0.5).mul(300);
        if (gain.gte(1e50)) gain = gain.log10().div(50).pow(0.9).mul(500 / 9).add(400 / 9).div(2).pow10().mul(2).sub(1e50);
        if (gain.gte(1e220)) gain = gain.log10().div(220).pow(0.7).mul(2200 / 7).add(880 / 7).div(2).pow10().mul(2).sub(1e220);
        if (gain.gte("e1400")) gain = gain.div("e1400").pow(0.6).mul("e1400");
        return gain.mul(mult).floor();
    },

    getNextAt() {
        let mult = gameLayers.YooAmatter.getGainMult();
        let gain = gameLayers.YooAmatter.getResetGain();
        if (gain.gte(1e6)) gain = gain.log10().floor().add(1).pow10().div(mult);
        else gain = gain.add(1).div(mult);
        if (gain.gte("e1400")) gain = gain.div("e1400").root(0.6).mul("e1400");
        if (gain.gte(1e220)) gain = gain.add(1e220).div(2).log10().mul(2).sub(880 / 7).div(2200 / 7).root(0.7).mul(220).pow10();
        if (gain.gte(1e50)) gain = gain.add(1e50).div(2).log10().mul(2).sub(400 / 9).div(500 / 9).root(0.9).mul(50).pow10();
        if (gain.gte(300)) gain = gain.div(300).pow(2).mul(300);
        return gain.pow(2).dilate(1.25).mul(1e12).max(1e12);
    },
    getPrestigesGain() {
      let gain = dOne
      if (hasUpgrade("Arinium", 12)) gain = gain.mul(upgradeEffect("Arinium", 12))
      gain = gain.pow(gameLayers.OMG.getMiracleLightEffect()[1])
      return gain
    },
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 12)
      },
      rows: 5,
      cols: 5,
      11: {
        title: "Eternal Growth (YM 11)",
        description() {
          return "All YooA Dimensions are stronger based on total time played."
        },
        cost: dOne,
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          return pow(player.stats.General.totalTime.add(1), 0.3).div(4).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      12: {
        title: "Multi-Solver (YM 12)",
        description() {
          return "Increase YooA Point and YooA math problem gain multiplier by " + format(1) + "."
        },
        cost(x = getUpgLevels("YooAmatter", 12)) {
          x = new Decimal(x)
          let b = 3
          if (x.gte(2)) b = Decimal.add(b, x.mul(2))
          return pow(b, x).mul(5);
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: new Decimal(4),
        effect() {
          return getUpgLevels("YooAmatter", 12).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "Dimensional Ascension (YM 13)",
        description() {
          return "YooA Points boost all YooA Dimensions and cube YooA Dimension 3+ multiplier per level."
        },
        cost: new Decimal(2025),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          return player.YooAPoints.add(1).dilate(0.75).pow(0.1)
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      14: {
        title: "Foundation Multiplier (YM 14)",
        description() {
          return "YooAmatter increases the YooA Dimension multiplier per level, and start with " + formatWhole(300) + " YooA math problems."
        },
        cost: new Decimal(5e5),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAmatter.amount.add(10).log10().pow(0.75).div(1000)
          if (eff.gte(0.012) && !hasUpgrade("YooAity", 13)) eff = eff.add(0.012).div(2)
          if (hasUpgrade("YooAity", 13)) eff = eff.mul(player.YooAmatter.amount.add(1).log10().div(500).add(1).pow(0.3).dilate(1.3))
          return eff
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "+" + format(eff)
          if (eff.gte(0.012) && !hasUpgrade("YooAity", 13)) dis += softcapText("(softcapped)")
          return dis;
        },
        onBuy() {
          player.math.YooA.solved = player.math.YooA.solved.add(300)
        }
      },
      15: {
        title: "YooA Rank Enhancer (YM 15)",
        description() {
          return "YooAmatter effect raises YooA Point gain. 'YooA Rank Shifter' (YU 41) cost scales " + format(2.5) + "x slower and gain " + format(10) + "x more Seunghee Light."
        },
        cost: new Decimal("ee6.02214076e23"),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = gameLayers.YooAmatter.effect().add(10).log10()
          return eff
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "^" + format(eff)
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 33)
        }
      },
      21: {
        title: "YooA Amplifier (YM 21)",
        description() {
          return "Add " + formatWhole(7) + " levels to 'YooA Challenge' (YU 11) and 'YooA Enhancer' (YU 13) and start with " + formatWhole(1e3) + " YooA math problems."
        },
        cost: new Decimal(1e13),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        onBuy() {
          if (hasUpgrade("YooAmatter", 14)) player.math.YooA.solved = player.math.YooA.solved.add(700)
          else player.math.YooA.solved = player.math.YooA.solved.add(1000)
        }
      },
      22: {
        title: "Problem Accelerator (YM 22)",
        description() {
          return "Gain " + format(this.percent()) + "% of YooA math problems gained on solve per second (" + format(this.effect()) + "/s) and make 'YooA Solver' (YU 12) and 'Dimension Solver' (YU 22) softcaps weaker."
        },
        cost: new Decimal(2e29),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        percent() {
          if (inChallenge("YooAmatter", 2)) return dZero
          let gain = new Decimal(5)
          if (hasUpgrade("YooAmatter", 23)) gain = gain.mul(upgradeEffect("YooAmatter", 23));
          if (inChallenge("YooAmatter", 1)) gain = gain.div(10)
          if (inChallenge("YooAmatter", 3) || inChallenge("YooAmatter", 4)) gain = gain.mul(-0.4)
          return gain
        },
        effect() {
          return gameLayers.YooA.problemGain().mul(this.percent().div(100));
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooAmatter", 22)) gain = 0
          return format(gain) + "/s";
        },
      },
      23: {
        title: "Digit Optimizer (YM 23)",
        description() {
          return "YooA Math Problem digits boost 'Problem Accelerator' (fewer = better) and unlock YooArium."
        },
        cost: new Decimal(1e33),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let digits = GameCache.YooA_digits.value;
          return Decimal.div(10, digits).max(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "Streamliner Spark (YM 24)",
        description() {
          return "Add " + formatWhole(2) + " levels to 'YooA Streamliner' (YU 33) and add " + format(0.5) + " to its base multiplier, and unlock Challenges."
        },
        cost: new Decimal(1e35),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          return new Decimal(0.5);
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      25: {
        title: "Celestial YooAflow (YM 25)",
        description() {
          return "<span style='font-size: 11px;'>YooAmatter makes YooA's Celestial Overflow weaker. Gain " + format(1.1) + "x YooA Light per Arin Vocal and YooA Dance level and " + format(1.1) + "x Arin Light per Arin Dance and YooA Charisma level.</span>"
        },
        cost: new Decimal("ee15e24"),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAmatter.amount.add(10).log10().add(10).log10().add(10).log10().div(25).max(1)
          let eff2 = pow(1.1, gameLayers.OMG.getLevels("Arin", "vocals").add(gameLayers.OMG.getLevels("YooA", "dance")))
          let eff3 = pow(1.1, gameLayers.OMG.getLevels("Arin", "dance").add(gameLayers.OMG.getLevels("YooA", "charisma")))
          return [eff, eff2, eff3]
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = format(Decimal.sub(1, eff[0].recip()).mul(100)) + "% weaker, x" + format(eff[1]) + " YooA Light, x" + format(eff[2]) + " Arin Light"
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 33)
        }
      },
      31: {
        title: "YooArium Challenge (YM 31)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooArium."
        },
        cost(x = getUpgLevels("YooAmatter", 31)) {
          let cost = pow(10, x.pow(1.4)).mul(8)
          if (x.gte(5)) cost = pow(1e4, x.sub(5).pow(1.75)).mul(1e30)
          if (x.gte(15)) cost = pow(1e100, x.sub(15).pow(2.3)).mul("ee6")
          return cost;
        },
        invCost(x) {
          let cost = x.div(8).log10().root(1.4).min(4)
          if (cost.gte(4) && x.gte(1e30)) cost = x.div(1e30).log(1e4).root(1.75).add(5)
          if (cost.gte(14) && x.gte("ee6")) cost = x.div("ee6").log(1e100).root(2.3).add(15)
          return cost;
        },
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        maxLvl() {
          let max = 5
          if (hasUpgrade("YooAmatter", 51)) max += 5
          if (hasMilestone("YooAity", 3)) max += 5
          max = Decimal.add(max, upgradeEffect("YooAity", 43))
          return new Decimal(max)
        },
        base() {
          let base = 3
          if (hasMilestone("YooAity", 3)) base += 1
          return new Decimal(base)
        },
        baseDigits() {
          let digs = 0.25
          if (hasUpgrade("YooAmatter", 51)) digs -= 0.1
          if (hasMilestone("YooAity", 3)) digs -= 0.05
          return new Decimal(digs)
        },
        effect() {
          return pow(this.base(), getUpgLevels("YooAmatter", 31));
        },
        digits() {
          return Decimal.mul(this.baseDigits(), getUpgLevels("YooAmatter", 31));
        },
        effectDisplay() {
          return "+" + format(this.digits()) + " digits, x" + format(this.effect());
        },
        onBuy() {
          generateNewProblem("YooAmatter");
        },
      },
      32: {
        title: "YooArium Solver (YM 32)",
        description() {
          return "Gain more YooArium based on math problems solved."
        },
        cost: new Decimal(20),
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        maxLvl: dOne,
        effect() {
          let eff = pow(1.05, player.math.YooAmatter.solved.pow(0.5))
          if (eff.gte("ee5")) eff = eff.log10().pow(20).dilate(2).pow(10)
          return eff;
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "x" + format(eff)
          if (eff.gte("ee5")) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      33: { // Scalings: Blooming, Cascading, Radiant, Ethereal
        title() {
          return (getUpgLevels("YooAmatter", 33).gte(45) ? scaleText("Blooming", "blooming") + " " : "") + "Power Surge (YM 33)"
        },
        description() {
          return "Increase the YooAmatter effect exponent by " + format(this.base()) + "."
        },
        cost(x = getUpgLevels("YooAmatter", 33)) {
          if (x.gte(45)) x = x.div(45).pow(2).mul(45)
          return pow(1e10, x.pow(1.5)).mul(1e50);
        },
        invCost(x) {
          let cost = x.div(1e50).log(1e10).root(1.5)
          if (cost.gte(45)) cost = cost.div(45).pow(0.5).mul(45)
          return cost;
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        base() {
          return new Decimal(0.1)
        },
        effect() {
          return getUpgLevels("YooAmatter", 33).mul(this.base());
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      34: {
        title() {
          return (getUpgLevels("YooAmatter", 34).gte(11111) ? scaleText("Blooming", "blooming") + " " : "") + "Prime Boost (YM 34)"
        },
        description() {
          return "Gain " + format(this.base()) + "x more YooA math problems (Based on YooA Points), and start with 'Auto-YooA' (YU21)."
        },
        cost(x = getUpgLevels("YooAmatter", 34)) {
          if (x.gte(11111)) x = x.div(11111).pow(2).mul(11111)
          return pow(1e5, x.pow(1.7)).mul(1e65);
        },
        invCost(x) {
          let cost = x.div(1e65).log(1e5).root(1.7)
          if (cost.gte(11111)) cost = cost.div(11111).pow(0.5).mul(11111)
          return cost;
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        base() {
          return player.YooAPoints.add(10).log10().add(10).log10().pow(upgradeEffect("sparks", 14))
        },
        effect() {
          return pow(this.base(), getUpgLevels("YooAmatter", 34));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      35: {
        title: "Miracle Light Chain (YM 35)",
        description() {
          return "<span style='font-size: 11px;'>Miracle Light boosts YooA Light, which boosts Arin Light, which boosts Seunghee Light. Dilate YooArium 1st effect to " + format(1.2) + " and Blooming OMG 14 starts " + formatWhole(35) + " levels later.</span>"
        },
        cost: new Decimal("ee6e28"),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.MiracleLight.add(1).dilate(0.8).pow(0.15)
          let eff2 = player.YooAity.OMGLight.YooA.add(1).dilate(0.8).pow(0.03)
          let eff3 = player.YooAity.OMGLight.Arin.add(1).dilate(0.8).pow(0.01)
          return [eff, eff2, eff3]
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "x" + format(eff[0]) + " YooA Light, x" + format(eff[1]) + " Arin Light, x" + format(eff[2]) + " Seunghee Light"
          return dis;
        },
        unlocked() {
          return hasUpgrade("OMG", 33)
        }
      },
      41: {
        title: "YooArium Surge (YM 41)",
        description() {
          return "Gain " + format(this.base()) + "x more YooA Points per 'YooA Challenge' (YU 11) level and YooArium (Based on YooA math problems)."
        },
        cost(x = getUpgLevels("YooAmatter", 41)) {
          return pow(7, x.pow(1.5)).mul(2e4);
        },
        invCost(x) {
          let cost = x.div(2e4).log(7).root(1.5)
          return cost;
        },
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        base() {
          return player.math.YooA.solved.add(10).log10().dilate(1.2).pow(0.5)
        },
        effect() {
          return pow(this.base(), getUpgLevels("YooAmatter", 41));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      42: {
        title: "Auto-YooArium (YM 42)",
        description() {
          let percent = 5
          return "Gain " + format(percent) + "% of YooArium gained on solve per second (" + format(this.effect()) + "/s). Arin cost scales " + format(1.5) + "x slower."
        },
        cost: new Decimal(1e6),
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        maxLvl: dOne,
        effect() {
          return gameLayers.YooAmatter.getYooAriumGain().div(20);
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooAmatter", 42)) gain = 0
          return format(gain) + "/s";
        },
      },
      43: {
        title: "YooArium Mastery (YM 43)",
        description() {
          return "<span style = 'font-size:11px;'>YooArium increases the YooA Dimension multiplier per level and add " + formatWhole(4) + " levels to 'YooA Mastery' (YU 32). Gain " + format(3) + "x more YooArium.</span>"
        },
        cost: new Decimal(1e104),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAmatter.YooArium.div(1e11).add(10).log10().div(1000)
          if (hasUpgrade("YooAmatter", 44)) eff = eff.mul(upgradeEffect("YooAmatter", 44)[1])
          if (eff.gte(0.25)) eff = eff.div(0.25).pow(0.8).mul(0.125).add(0.125)
          return eff
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "+" + format(eff)
          if (eff.gte(0.25)) dis += softcapText("(softcapped)")
          return dis;
        },
      },
      44: {
        title: "YooA's Genesis (YM 44)",
        description() {
          return `<span style = 'font-size:10px;'>YooA Points boost YooArium gain
          (x${format(this.effectBase())}/level), double 'YooArium Mastery' effect, 
          and unlock YooAmatter Formations. Arin cost scales ${format(1.3)}x slower.
          </span>`
        },
        cost(x = getUpgLevels("YooAmatter", 44)) {
          if (x.lte(0)) return new Decimal(1e120)
          return pow(1.8, x.sub(1)).mul(3000).pow10();
        },
        invCost(x) {
          let cost = dZero
          if (x.gte("e3000")) cost = x.log10().div(3000).log(1.8).add(1)
          return cost;
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl() {
          let max = 1
          if (hasUpgrade("YooAity", 12)) max += 2
          if (hasUpgrade("Seunghee", 14)) max += 12
          if (hasUpgrade("Yubin", 14)) max += 7
          return new Decimal(max)
        },
        effectBase() {
          let eff1 = player.YooAPoints.div("e3000").add(10).log10().div(100).add(1).pow(0.7)
          if (hasMilestone("YooAity", 5)) eff1 = eff1.mul(player.YooAPoints.div("e3000").add(1).dilate(0.375).pow(0.1))
          if (hasUpgrade("Seunghee", 14)) eff1 = eff1.pow(player.YooAPoints.add(10).log10().pow(0.1))
          return eff1
        },
        effect() {
          let lvl = getUpgLevels("YooAmatter", 44)
          let eff1 = this.effectBase().pow(lvl)
          let eff2 = pow(2, lvl)
          let eff3 = pow(1.3, lvl)
          return [eff1, eff2, eff3]
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "x" + format(eff[0]) + ", x" + format(eff[1]) + ", x" + format(eff[2])
          return dis;
        },
      },
      51: {
        title: "YooArium Simplifier (YM 51)",
        description() {
          return "<span style = 'font-size:11px;'>YooAmatter Sparks boost YooA math problems, each 'YooArium Challenge' doubles YooAmatter math problem gain, add " + formatWhole(5) + " levels to it, and reduce its digits added by " + format(0.1) + ".</span>"
        },
        cost: new Decimal(1e5),
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAmatter.sparks.div(1e4).add(1).pow(0.8)
          let eff2 = pow(2, getUpgLevels("YooAmatter", 31))
          return [eff, eff2]
        },
        effectDisplay() {
          let dis = "x" + format(this.effect()[0]) + ", x" + format(this.effect()[1])
          return dis;
        },
        onBuy() {
          generateNewProblem("YooAmatter");
        },
      },
      52: {
        title: "Transcendent Computation (YM 52)",
        description() {
          return "YooAmatter Sparks boost YMC last rewards, and make 'YooA Solver' (YU 12) and 'Dimension Solver' (YU 22) softcaps weaker."
        },
        cost: new Decimal(1e7),
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAmatter.sparks.add(1).log10().div(10).add(1)
          if (eff.gte(1e18)) eff = eff.div(1e18).pow(0.4).mul(25e17).sub(15e17)
          return eff
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "^" + format(eff)
          if (eff.gte(1e18)) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      53: {
        title: "Mathematical Ascendancy (YM 53)",
        description() {
          return "Boost all YooAmatter Formations based on math problems solved, and add " + formatWhole(5) + " levels to 'YooA Mastery' (YU 32) and increase its added levels by " + formatWhole(2) + "."
        },
        cost: new Decimal(1e13),
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        maxLvl: dOne,
        effect() {
          let eff = pow(1.02, player.math.YooAmatter.solved.pow(0.4))
          if (hasUpgrade("YooAity", 21)) eff = eff.pow(5)
          if (eff.gte("e4e4")) eff = eff.log10().mul(2.5).pow(20).dilate(2).pow(4)
          return eff;
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "x" + format(eff)
          if (eff.gte("e4e4")) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      54: {
        title: "The Spark of Infinity (YM 54)",
        description() {
          return "<span style = 'font-size:11px;'>YooA Points boost all YooAmatter Formations, increase 'YooA Mastery' (YU 32) added levels by " + formatWhole(2) + ", autobuyers are " + format(2) + "x faster, and unlock Spark Upgrades.</span>"
        },
        cost: new Decimal(1e27),
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAPoints.div("e55555").add(1).dilate(0.5).pow(0.02)
          return eff;
        },
        effectDisplay() {
          let dis = "x" + format(this.effect())
          return dis;
        },
        onBuy() {
          updateAllAutobuyerTime(player.autobuyers)
        }
      },
    },
    challenges: {
      1: {
        title: "YooA's Math Crisis (YMC 1)",
        description() {
          return "YooA math problems have " + format(50) + "% more digits, YooA Point gain is square rooted, and 'Problem Accelerator' (YM 22) is divided by " + format(10) + "."
        },
        goal: new Decimal(1e72),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: dOne,
        rewardDescription() {
          return "Gain more YooA Points and YooA math problems, and unlock YooA Lines autobuyer."
        },
        rewardEffect() {
          let eff = new Decimal(3)
          if (hasUpgrade("YooAmatter", 52)) eff = eff.pow(upgradeEffect("YooAmatter", 52))
          return [new Decimal(1.01), eff];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "^" + format(reward[0]) + " to YooA Points, x" + format(reward[1]) + " to YooA math problems";
        },
      },
      2: {
        title: "YooA's Logical Labyrinth (YMC 2)",
        description() {
          return "YooA math problems have " + format(60) + "% more digits, YooA Planes don't produce any YooA Lines, and 'Auto-YooA' (YU 21) and 'Problem Accelerator' (YM 22) are useless."
        },
        goal: new Decimal(1e147),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: dOne,
        rewardDescription() {
          return "YooA math problems have " + format(20) + "% fewer digits, gain more YooArium, and unlock YooA Planes autobuyer."
        },
        rewardEffect() {
          let eff = new Decimal(3)
          if (hasUpgrade("YooAmatter", 52)) eff = eff.pow(upgradeEffect("YooAmatter", 52))
          return [0.8, eff];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "x" + format(reward[0]) + " to digits, x" + format(reward[1]) + " to YooArium";
        },
      },
      3: {
        title: "YooA's Negative Spiral  (YMC 3)",
        description() {
          return "YooA math problems have " + format(25) + "% more digits, YooA Point gain is raised to " + format(0.4) + ", and 'Problem Accelerator' (YM 22) is negated at " + format(40) + "% effect. YU 12 and YU 22 effects are raised to " + format(19.95) + " below x" + format(1e100) + "."
        },
        goal: new Decimal(1e300),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: dOne,
        rewardDescription() {
          return "YooA math problems have " + format(15) + "% fewer digits, gain more YooArium based on YooAmatter, add " + formatWhole(13) + " levels to 'YooA Challenge' (YU 11), and unlock YooA Upgrades autobuyer."
        },
        rewardEffect() {
          let exp = 0.75
          if (hasUpgrade("YooAmatter", 52)) exp = Decimal.mul(exp, upgradeEffect("YooAmatter", 52))
          let eff2 = player.YooAmatter.amount.div(1e45).add(1).log10().div(3).add(1).pow(exp)
          return [0.85, eff2];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "x" + format(reward[0]) + " to digits, x" + format(reward[1]) + " to YooArium";
        },
      },
      4: {
        title: "YooA's Infinite Dilemma (YMC 4)",
        description() {
          return "YooA math problems have " + format(50) + "% more digits, YooA Point gain is dilated to " + format(this.dilEff()) + " (based on YooA math problems), and 'Problem Accelerator' (YM 22) is negated at " + format(40) + "% effect."
        },
        goal: new Decimal(1e90),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: dOne,
        dilEff() {
          let x = player.math.YooA.solved
          x = x.lt(0) ? x.neg().add(1).log10().pow_base(0.9) : x.add(10).log10()
          return x.recip().add(1).recip()
        },
        rewardDescription() {
          return "YooA math problems have " + format(15) + "% fewer digits, gain more YooA Points and YooA math problems based on Ascensions, and unlock YooAmatter autoprestiger."
        },
        rewardEffect() {
          let dil = 1
          if (hasUpgrade("Arinium", 22)) dil *= 3
          if (hasUpgrade("OMG", 12)) dil *= 1.2
          if (hasUpgrade("OMG", 22)) dil *= 1.2

          let tril = 1
          if (hasUpgrade("OMG", 24)) tril *= 1.0618
          if (hasUpgrade("Seunghee", 33)) tril *= 1.125

          let eff2 = player.stats.YooAmatter.resets.add(1).log10().pow(2).div(200).add(1)
          if (hasUpgrade("Arinium", 15)) eff2 = eff2.pow(3)
          eff2 = eff2.dilate(dil).trilate(tril)
          
          let exp3 = 0.8
          if (hasUpgrade("YooAmatter", 52)) exp3 = Decimal.mul(exp3, upgradeEffect("YooAmatter", 52))
          let eff3 = player.stats.YooAmatter.resets.div(100).add(1).pow(exp3)
          
          return [0.85, eff2, eff3];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "x" + format(reward[0]) + " to digits, ^" + format(reward[1], 3) + " to YooA Points, x" + format(reward[2]) + " to YooA math problems";
        },
      }
    }
  },
  sparks: {
    unlocked: true,
    color: "#4caf50",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 12)
      },
      rows: 2,
      cols: 4,
      11: {
        title() {
          const x = getUpgLevels("sparks", 11)
          return (x.gte("e1600") ? scaleText("Cascading", "cascading") + " " : x.gte(25e10) ? scaleText("Blooming", "blooming") + " " : "") + "Dimensional Amplification (YS 11)"
        },
        description() {
          return "Increase YooA Dimension 3+ exponent and YooAmatter Formation multipliers by " + format(this.base()) + "."
        },
        cost(x = getUpgLevels("sparks", 11)) {
          if (x.gte("e1600")) x = x.log10().div(1600).pow(2).mul(1600).pow10()
          if (x.gte(25e10)) x = x.div(25e10).pow(2).mul(25e10)
          return pow(1e5, x.pow(1.6)).mul(1e42);
        },
        invCost(x) {
          let cost = x.div(1e42).log(1e5).root(1.6)
          if (cost.gte(25e10)) cost = cost.div(25e10).root(2).mul(25e10)
          if (cost.gte("1e1600")) cost = cost.log10().div(1600).root(2).mul(1600).pow10()
          return cost;
        },
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        base() {
          return new Decimal(0.02)
        },
        effect() {
          let x = getUpgLevels("sparks", 11)
          let eff = this.base().mul(x)
          let exp = upgradeEffect("YooAity", 45)
          let eff2 = this.base().mul(x.pow(x.pow(exp)))
          return [eff, eff2];
        },
        effectDisplay() {
          let eff = this.effect()
          return "<span style='font-size: 10px;'>^" + format(eff[0]) + " YD 3+ mult/level, +" + format(eff[1]) + " YMF mult/level</span>";
        },
      },
      12: {
        title: "YooArium Infusion (YS 12)",
        description() {
          return "Multiply YooAmatter Formations by " + format(this.base()) + " (Based on YooArium)."
        },
        cost(x = getUpgLevels("sparks", 12)) {
          return pow(1e8, x.pow(1.7)).mul(1e45);
        },
        invCost(x) {
          let cost = x.div(1e45).log(1e8).root(1.7)
          return cost;
        },
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        base() {
          let base = player.YooAmatter.YooArium.add(1).div(1e125).dilate(0.45).pow(0.15)
          if (base.gte(75)) base = base.add(25).log10().div(2).pow(0.8).mul(1.3).add(0.7).pow10().sub(25)
          return base
        },
        effect() {
          return this.base().pow(getUpgLevels("sparks", 12));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title() {
          return (getUpgLevels("sparks", 13).gte(45) ? scaleText("Blooming", "blooming") + " " : "") + "Spark of Exponentiality (YS 13)"
        },
        description() {
          return "Increase YooAmatter effect exponent multiplier by " + format(this.base()) + " (Based on YooAmatter Sparks)."
        },
        cost(x = getUpgLevels("sparks", 13)) {
          if (x.gte(45)) x = x.div(45).pow(2).mul(45)
          return pow(1e10, x.pow(1.65)).mul(1e60);
        },
        invCost(x) {
          let cost = x.div(1e60).log(1e10).root(1.65)
          if (cost.gte(45)) cost = cost.div(45).pow(0.5).mul(45)
          return cost;
        },
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        base() {
          let base = player.YooAmatter.sparks.div(1e50).add(1).log10().pow(0.7).div(15)
          if (base.gte(2.2)) base = base.div(2.2).pow(0.6).mul(1.1).add(1.1)
          if (base.gte(4)) base = base.div(4).pow(0.5).mul(2).add(2)
          return base
        },
        effect() {
          return this.base().mul(getUpgLevels("sparks", 13)).add(1);
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
      14: {
        title() {
          return (getUpgLevels("sparks", 14).gte(75e3) ? scaleText("Blooming", "blooming") + " " : "") + "Mathematical Mastery (YS 14)"
        },
        description() {
          return "'Prime Boost' (YM 34) and 'YooA Mastery' (YU 32) 1st effect are +" + format(this.base().mul(100)) + "% stronger (Based on YooA math problems)."
        },
        cost(x = getUpgLevels("sparks", 14)) {
          if (x.gte(75e3)) x = x.div(75e3).pow(2).mul(75e3)
          return pow(1e10, x.pow(1.8)).mul(1e112);
        },
        invCost(x) {
          let cost = x.div(1e112).log(1e10).root(1.8)
          if (cost.gte(75e3)) cost = cost.div(75e3).pow(0.5).mul(75e3)
          return cost;
        },
        costCurrency: "YooAmatter Sparks",
        costLayer: "YooAmatter",
        costInternal: "sparks",
        base() {
          return player.math.YooA.solved.div(1e300).add(1).log10().pow(0.4).div(30)
        },
        effect() {
          return this.base().mul(getUpgLevels("sparks", 14)).add(1);
        },
        effectDisplay() {
          return "+" + format(this.effect().sub(1).mul(100)) + "% stronger";
        },
      },
    },
  },
  YooAity: {
    currency: "YooA Essence",
    baseCurrency: "YooAmatter",
    color: "#230085",
    layer: 2,
    action: "Transcend",
    actionsCurrency: "Transcensions",
    actionsCurrencySingular: "Transcension",
    requires: new Decimal("9.17e1995"),
    unlocked() {
      return player.stats.YooAity.totalAmount.gte(1)
    },
    canReset() {
      return player.YooAmatter.amount.gte("9.17e1995") && this.getResetGain().gt(0)
    },
    problemBaseGain() {
      let gain = upgradeEffect("OMG", 14)[0]
      if (hasMilestone("YooAity", 23)) gain = gain.mul(2015)
      if (hasUpgrade("Seunghee", 32)) gain = gain.mul(upgradeEffect("Seunghee", 32))
      return gain
    },
    problemGain() {
      let gain = this.problemBaseGain()
      if (hasUpgrade("YooAity", 32)) gain = gain.mul(upgradeEffect("YooAity", 32)[1])
      return gain
    },
    digits() {
      let digs = gameLayers.YooAity.upgrades[31].digits().toNumber() + 0.5
      if (hasMilestone("YooAity", 15)) digs *= 0.6
      return digs
    },
    effectExp() {
      let exp = dOne
      return exp
    },
    effect() {
      return player.YooAity.amount.add(1).pow(this.effectExp())
    },
    getGainMult() {
      let mult = getArinRankEffect()[1]
      if (hasUpgrade("YooAity", 25)) mult = mult.mul(upgradeEffect("YooAity", 25))
      return mult
    },
    getGainExp() {
      let exp = dOne
      if (hasUpgrade("YooAity", 22)) exp = exp.mul(1.1)
      if (hasUpgrade("YooAity", 23)) exp = exp.mul(1.1)
      if (hasUpgrade("YooAity", 24)) exp = exp.mul(1.1)
      if (hasUpgrade("YooAity", 25)) exp = exp.mul(1.11)
      return exp
    },
    getResetGain() {
      let mult = this.getGainMult()
      let exp = this.getGainExp()
      let gainLog = player.YooAmatter.amount.div("9.17e1995").log10().pow(0.5).mul(0.02)
      if (gainLog.gte(2e8)) gainLog = gainLog.div(2e8).pow(0.6).mul(15e7).add(5e7)
      if (gainLog.gte(2e11)) gainLog = gainLog.div(2e11).pow(0.4).mul(15e10).add(5e10)
      if (gainLog.gte(2e12)) gainLog = gainLog.div(2e12).pow(0.3).mul(15e11).add(5e11)
      let gain = Decimal.pow(10, gainLog.mul(exp))
      return gain.mul(mult).floor()
    },
    getNextAt() {
      let mult = this.getGainMult()
      let exp = this.getGainExp()
      let gain = this.getResetGain()
      if (gain.gte(1e6)) gain = gain.log10().floor().add(1).pow10().div(mult).root(exp)
      else gain = gain.add(1).div(mult).root(exp)
      let gainLog = gain.log10()
      if (gainLog.gte(2e12)) gainLog = gainLog.sub(5e11).div(15e11).root(0.3).mul(2e12)
      if (gainLog.gte(2e11)) gainLog = gainLog.sub(5e10).div(15e10).root(0.4).mul(2e11)
      if (gainLog.gte(2e8)) gainLog = gainLog.sub(5e7).div(15e7).root(0.6).mul(2e8)
      gain = gainLog.div(0.02).pow(2).pow10().max(1).mul("9.17e1995")
      return gain
    },
    getPrestigesGain() {
      let gain = Decimal.dOne
      if (hasUpgrade("Arinium", 22)) gain = gain.mul(upgradeEffect("Arinium", 22))
      return gain
    },
    getEffectiveProblems() {
      let x = player.math.YooAity.solved
      if (hasUpgrade("Seunghee", 31)) x = x.dilate(1.15)
      return x;
    },
    getEffectiveAge(baseAge = player.YooAity.age) { //age is in seconds
      let age = baseAge
      if (age.gte(3600)) age = age.pow(0.5).mul(60)
      if (age.gte(14400)) age = age.pow(0.5).mul(120)
      if (age.gte(1e7)) age = age.log10().div(7).pow(0.7).mul(4).add(3).pow10()
      if (age.gte(5.5e7)) age = age.add(544.5e7).div(100)
      if (age.gte(1e8)) age = age.log10().add(2).pow(8)
      if (age.gte(13e7)) age = age.add(87e7).mul(0.13)
      if (age.gte(169e6)) age = age.pow(0.5).mul(1300).add(1521e5)
      if (age.gte(196e6)) age = age.pow(0.5).mul(1400).add(1764e5)
      if (age.gte(292e6)) age = age.mul(0.15).add(2482e5)
      if (age.gte(4e8)) age = age.pow(0.5).mul(5e3).add(3e8).min(7155 * 86400)
      let age2req = hasUpgrade("YooAity", 55) ? "ee5" : "ee6"
      let age2 = baseAge.div(age2req).add(1).log10().pow(0.8)
      if (age2.gte(3e7)) age2 = age2.add(97e7).mul(0.03).min(995 * 86400)
      let age3req = hasUpgrade("YooA", 44) ? "ee22" : "ee33"
      let age3 = baseAge.div(age3req).add(1).log10().div(Decimal.log10(age3req)).add(1).log10().dilate(2).pow(2)
      if (age3.gte(19e6)) age3 = age3.div(19e6).pow(0.2).mul(3e6).add(16e6).min(244 * 86400)
      let age4req = hasUpgrade("YooA", 44) && !hasUpgrade("YooA", 44) ? "eee2222" : "eee3333"
      let age4 = baseAge.div(age4req).add(1).log10().div(Decimal.log10(age4req)).add(1).log10().dilate(2).pow(2).min(995 * 86400)
      age = age.add(age2).add(age3).add(age4)
      return age
    },
    getAgeGain() {
      if (player.YooAity.embers.lt(1e250)) return dZero
      let base = player.YooAity.embers.div(1e250).add(1).log10().div(100)
      base = base.mul(upgradeEffect("Arinium", 16))
      let exp = dOne, exp2 = dOne
      if (hasUpgrade("Seunghee", 24)) exp = exp.add(0.5)
      if (hasUpgrade("Yubin", 24)) exp = exp.add(1)
      if (hasUpgrade("Arinium", 14)) exp = exp.add(0.618)
      if (hasUpgrade("Arinium", 15)) exp = exp.add(upgradeEffect("Arinium", 15))
      if (hasUpgrade("YooA", 44)) exp2 = exp2.mul(upgradeEffect("YooA", 44))
      if (hasUpgrade("Seunghee", 31)) exp2 = exp2.mul(upgradeEffect("Seunghee", 31))
      if (hasMilestone("YooAity", 26)) exp2 = exp2.mul(milestoneEffect("YooAity", 26))
      return base.pow(exp).mul(this.getYooChroniumEffect()[0]).pow(exp2)
    },
    getAgeEffGain() {
      const effAge = this.getEffectiveAge();
      const realAge = player.YooAity.age;
      const realGain = this.getAgeGain();

      if (realGain.eq(dZero)) return dZero;
      let effGain

      if (effAge.gte(7155 * 86400)) {
        effGain = player.YooAity.effectiveAgeGainPerSecond
      }
      else {
        // cheap softcaps first (quick returns when possible)
        effGain = realGain;
        if (effAge.gte(3600)) {
          effGain = realGain.div(realAge.sqrt()).mul(D_30);
        }
        if (effAge.gte(14400)) {
          // 30 * sqrt(60) * t^(-3/4)
          effGain = realGain.div(realAge.pow(0.75)).mul(SQRT60.mul(D_30));
        }
        if (effAge.lt(1e7)) return effGain; // skip heavy chain if not needed

        // --------------------
        // Heavy shared chain (compute ONCE)
        // --------------------
        // a2 = 120 * sqrt(60) * b^(1/4)
        const a2 = SQRT60.mul(D_120).mul(realAge.pow(0.25));
        const u3 = a2.log10().div(7);                      // u = log10(a2)/7
        const A3 = u3.pow(0.7).mul(4).add(3).pow10();      // A3 = 10^(4*u^0.7 + 3)

        // derivatives for A3
        const da2db = SQRT60.mul(D_30).mul(realAge.pow(-0.75)); // 30 * sqrt(60) * b^(-3/4)
        const u3_p03 = u3.pow(0.3);
        const da3da2 = A3.mul(0.4).div(a2.mul(u3_p03));
        const dA3db = da3da2.mul(da2db);

        // softcap 3 contribution
        effGain = dA3db.mul(realGain);

        // fourth soft-cap (divide by 100)
        if (effAge.gte(5.5e7)) effGain = effGain.div(100);
        if (effAge.lt(1e8)) return effGain; // still skip rest if not reached

        // ----- Softcap 5 chain (compute once) -----
        const A4 = A3.add(C_544_5e7).div(100);       // (A3 + C)/100
        const u5 = A4.log10().add(2);
        const dA5db = u5.pow(7).mul(8).div(A4.mul(LN10)).mul(dA3db).div(100);
        const A5 = u5.pow(8);

        effGain = dA5db.mul(realGain);
        if (effAge.gte(13e7)) effGain = effGain.mul(new Decimal(0.13));

        // ----- softcap 7 & onward: compute A7 / da7db once if needed -----
        let da7db = null;
        let A7 = null;
        if (effAge.gte(169e6) || effAge.gte(196e6) || effAge.gte(292e6) || effAge.gte(4e8)) {
          const smallK = new Decimal(0.13);
          const denom7 = Decimal.sqrt(smallK.mul(A5.add(K_87e7))); // sqrt(0.13*(A5+87e7))
          // pref7 = 1300 * 1/2 * 0.13
          const pref7 = D_1300.mul(0.5).mul(smallK);

          // guard denom
          if (denom7.lte(0)) return Decimal.dZero;

          da7db = pref7.mul(dA5db).div(denom7);                  // da7/db
          A7 = D_1300.mul(denom7).add(C_1521e5);                 // A7 = 1300*denom7 + 1521e5
        }

        // if we hit softcap 7
        if (effAge.gte(169e6)) {
          effGain = da7db.mul(realGain);
        }

        // ----- softcap 8: A8 and da8db -----
        let da8db = null;
        let A8 = null;
        if (effAge.gte(196e6)) {
          if (A7.lte(0)) return Decimal.dZero;
          const sqrtA7 = Decimal.sqrt(A7);
          da8db = D_700.mul(da7db).div(sqrtA7);                 // da8/db = 700 * da7db / sqrt(A7)
          A8 = D_1400.mul(sqrtA7).add(C_1764e5);                // A8 = 1400*sqrt(A7) + 1764e5
          effGain = da8db.mul(realGain);
        }

        // 9th soft-cap (multiply by 0.15)
        if (effAge.gte(292e6)) effGain = effGain.mul(new Decimal(0.15));

        // 10th softcap (heavy) uses A8 & da8db -> A9 -> A10 derivative
        if (effAge.gte(4e8)) {
          // ensure A8/da8db exist (compute if user jumped directly to >=4e8)
          if (!A8 || !da8db) {
            // recompute minimal pieces from previously computed A5/dA5db
            const smallK = new Decimal(0.13);
            const denom7 = Decimal.sqrt(smallK.mul(A5.add(K_87e7)));
            const pref7 = D_1300.mul(0.5).mul(smallK);
            const da7 = pref7.mul(dA5db).div(denom7);
            const A7_local = D_1300.mul(denom7).add(C_1521e5);
            const sqrtA7_local = Decimal.sqrt(A7_local);
            da8db = D_700.mul(da7).div(sqrtA7_local);
            A8 = D_1400.mul(sqrtA7_local).add(C_1764e5);
          }

          const A9 = A8.mul(0.15).add(C_2482e5); // A9 = 0.15*A8 + 2482e5
          if (A9.lte(0)) return Decimal.dZero;

          const dA9db = da8db.mul(0.15);
          // A10 = 5000 * sqrt(A9) + 3e8
          // dA10/dA9 = 2500 / sqrt(A9)
          const sqrtA9 = Decimal.sqrt(A9);
          const da10db = D_2500.div(sqrtA9).mul(dA9db);

          effGain = da10db.mul(realGain);
        }
      }
      return effGain;
    },
    getAgeEffect() {
      let age = this.getEffectiveAge()
      let eff = age.add(1)
      if (age.gte(315e6)) age = age.div(315e6).pow(5).mul(2315e6).sub(2e9)
      if (age.gte(196e6)) age = age.div(196e6).pow(5).mul(7e8).sub(504e6)
      if (age.gte(1e8)) age = age.root(8).sub(6).mul(2).pow10()
      if (age.gte(300)) eff = eff.pow(age.div(300).pow(0.4))
      let exp = dOne
      if (hasUpgrade("YooAity", 42)) exp = exp.mul(91.7)
      if (hasUpgrade("YooAity", 45)) exp = exp.mul(91.7)
      eff = eff.pow(exp)
      return eff
    },
    getYooChroniumGain() {
      let gain = this.getYooChroniumBaseGain()
      if (hasUpgrade("YooAity", 32)) gain = gain.mul(upgradeEffect("YooAity", 32)[0])
      return gain
    },
    getYooChroniumBaseGain() {
      let gain = new Decimal(0.01).mul(upgradeEffect("YooAity", 31)).mul(this.getSeungheeEffect()[1])
      if (player.achievements[61]) gain = gain.mul(GameCache.AchievementMult.value);
      if (hasUpgrade("YooAity", 33)) gain = gain.mul(upgradeEffect("YooAity", 33))
      if (hasUpgrade("Seunghee", 34)) gain = gain.pow(upgradeEffect("Seunghee", 34))
      return gain
    },
    getYooChroniumEffectExp() {
      let eff = new Decimal(0.4)
      let eff2 = new Decimal(9.17)
      if (hasUpgrade("YooAity", 43)) eff2 = eff2.mul(35)
      if (hasUpgrade("YooAity", 45)) eff2 = eff2.mul(91.7)
      if (hasUpgrade("Yubin", 24)) eff2 = eff2.mul(123456)
      return [eff, eff2]
    },
    getYooChroniumEffect() {
      const exp = this.getYooChroniumEffectExp()
      let effLog = player.YooAity.YooChronium.add(1).log10().mul(exp[0])
      if (effLog.gte(400)) effLog = effLog.div(400).pow(0.4).mul(400)
      const eff2 = player.YooAity.YooChronium.add(1).pow(exp[1])
      return [effLog.pow10(), eff2]
    },
    getSeungheeGain() {
      let gain = upgradeEffect("Seunghee", 11)
        .mul(upgradeEffect("Seunghee", 12))
        .mul(upgradeEffect("Seunghee", 14))
        .mul(hasMilestone("YooAity", 25) ? dOne : upgradeEffect("Seunghee", 21))
        .mul(upgradeEffect("Yubin", 12))
        .mul(upgradeEffect("Yubin", 14))
        .mul(gameLayers.YooAity.getYubinEffect()[1])
        .mul(gameLayers.OMG.getMiracleLightEffect()[0])
      if (hasUpgrade("YooAity", 42)) gain = gain.mul(9.17)
      if (hasUpgrade("YooAity", 43)) gain = gain.mul(9.17)
      if (hasUpgrade("YooAity", 44)) gain = gain.mul(9.17)
      if (hasUpgrade("Seunghee", 23)) gain = gain.mul(upgradeEffect("Seunghee", 23))
      if (hasUpgrade("Seunghee", 24)) gain = gain.mul(upgradeEffect("Seunghee", 24))
      if (hasMilestone("YooAity", 25)) {
        let exp = gameLayers.Seunghee.upgrades[21].gainExp().mul(gameLayers.OMG.getSkillEffect("Seunghee", "vocals"))
        if (hasUpgrade("Seunghee", 33)) exp = exp.mul(upgradeEffect("Seunghee", 33))
        gain = gain.pow(exp)
      }
      return gain
    },
    getSeungheeEffect() {
      let exp = 1
      if (hasUpgrade("Seunghee", 22)) exp *= 1.25
      if (hasUpgrade("Hyojung", 14)) exp *= 1.3
      if (hasUpgrade("Mimi", 14)) exp *= 1.3
      if (hasUpgrade("YooAity", 51)) exp *= 1.4
      let eff = player.YooAity.SeungheePoints.dilate(0.4).pow(0.6).div(10).add(1).pow(exp)
      let eff2 = player.YooAity.SeungheePoints.add(1)
      return [eff, eff2]
    },
    getYubinGain() {
      let gain = upgradeEffect("Yubin", 11)
        .mul(upgradeEffect("Yubin", 12))
        .mul(upgradeEffect("Yubin", 14))
        .mul(hasMilestone("YooAity", 25) ? dOne : upgradeEffect("Yubin", 21))
        .mul(getAriniumEffect()[1])
        .mul(gameLayers.OMG.getMiracleLightEffect()[0])
      if (hasUpgrade("YooAity", 45)) gain = gain.mul(9.17)
      if (hasUpgrade("Yubin", 23)) gain = gain.mul(upgradeEffect("Yubin", 23))
      if (hasUpgrade("Yubin", 24)) gain = gain.mul(upgradeEffect("Yubin", 24))
      if (hasMilestone("YooAity", 25)) gain = gain.pow(Decimal.sub(1, gameLayers.Yubin.upgrades[21].exp()).recip())
      return gain
    },
    getYubinEffect() {
      let exp = 1
      if (hasUpgrade("Yubin", 22)) exp *= 1.4
      if (hasUpgrade("Hyojung", 14)) exp *= 1.6
      if (hasUpgrade("Mimi", 14)) exp *= 1.6
      if (hasUpgrade("YooAity", 51)) exp *= 1.5
      let eff = player.YooAity.YubinPoints.dilate(0.45).pow(0.66).div(10).add(1).pow(exp)
      let eff2 = player.YooAity.YubinPoints.add(1).pow(0.7)
      return [eff, eff2]
    },
    getHyojungGain() {
      let gain = upgradeEffect("Hyojung", 11)
        .mul(upgradeEffect("Hyojung", 14))
        .mul(gameLayers.YooAity.getMimiEffect()[1])
        .mul(gameLayers.OMG.getMiracleLightEffect()[0])
      if (hasUpgrade("Hyojung", 12)) gain = gain.mul(upgradeEffect("Hyojung", 12))
      if (hasUpgrade("Arinium", 24)) gain = gain.mul(upgradeEffect("Arinium", 24))
      return gain
    },
    getHyojungEffect() {
      let dil = 0.55
      if (hasUpgrade("Hyojung", 22)) dil *= 1.3
      if (hasUpgrade("Hyojung", 23)) dil *= 1.1
      if (hasUpgrade("Mimi", 23)) dil *= 1.2
      let x = player.YooAity.HyojungPoints.dilate(dil)

      let exp = 1
      if (hasUpgrade("Hyojung", 14)) exp *= 3
      if (hasUpgrade("Mimi", 14)) exp *= 2.5
      if (hasUpgrade("YooAity", 51)) exp *= 2
      if (hasUpgrade("Arinium", 25) && player.YooAity.MimiPoints.gte(1e6)) exp *= 1.6
      let eff = x.pow(1.05).div(10).add(1).pow(exp)
      let eff2 = player.YooAity.HyojungPoints.add(1).pow(0.8)
      return [eff, eff2]
    },
    getMimiGain() {
      let gain = upgradeEffect("Mimi", 11)
        .mul(upgradeEffect("Mimi", 13))
        .mul(upgradeEffect("Mimi", 14))
        .mul(gameLayers.OMG.getMiracleLightEffect()[0])
      if (hasUpgrade("Mimi", 12)) gain = gain.mul(5.01)
      if (hasUpgrade("Arinium", 25)) gain = gain.mul(upgradeEffect("Arinium", 25))
      return gain
    },
    getMimiEffect() {
      let dil = 0.6
      if (hasUpgrade("OMG", 26)) dil *= 1.25
      if (hasUpgrade("Hyojung", 22)) dil *= 1.3
      if (hasUpgrade("Hyojung", 23)) dil *= 1.1
      if (hasUpgrade("Mimi", 23)) dil *= 1.2
      let x = player.YooAity.MimiPoints.dilate(dil)

      let exp = 1
      if (hasUpgrade("Arinium", 25) && player.YooAity.MimiPoints.gte(1e6)) exp *= 15.01
      if (hasUpgrade("Mimi", 14)) exp *= 2

      let eff = x.dilate(0.6).pow(2).mul(10).add(1).pow(exp)
      let eff2 = player.YooAity.MimiPoints.add(1).pow(0.75)
      return [eff, eff2]
    },
    ShiahEmberEffect() {
      let exp2 = pow(917, player.YooAity.embers.div(917).min(1))
      let exp = player.YooAity.embers.div(80).add(5).max(10).log10().sub(1).mul(exp2).add(1)
      if (exp.gte(917)) exp = exp.div(917).pow(0.5).mul(917)
      if (hasUpgrade("YooAity", 24)) exp = exp.mul(upgradeEffect("YooAity", 24))
      let eff = player.YooAity.embers.add(1).pow(player.YooAity.embers.add(10).log10().mul(exp))
      if (hasUpgrade("YooAity", 52)) eff = eff.dilate(2)
      if (hasUpgrade("OMG", 13)) eff = eff.dilate(3)
      return eff
    },
    getEffUpgsMult() {
      let mult = dOne
      if (hasMilestone("YooAity", 9)) mult = mult.mul(milestoneEffect("YooAity", 9))
      return mult
    },
    getEffectiveUpgs() {
      return player.YooAity.embers.max(0.001).div(6).log(1.1995).mul(this.getEffUpgsMult()).floor().add(1).max(0)
    },
    getNextUpgAt() {
      return pow(1.1995, this.getEffectiveUpgs().div(this.getEffUpgsMult())).mul(6)
    },
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 19)
      },
      rows: 5,
      cols: 5,
      11: {
        title: "Shi-ah's Resonant Spark (YE 11)",
        description() {
          return "Shi-ah Embers boost YooA Dimension 3+ multiplier per level, and YooA Planes boost Shi-ah Moments."
        },
        cost: dOne,
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.embers.mul(9.17).add(10).log10().pow(0.8);
          let eff2 = player.dimensions.YooA[1].amt.add(1).dilate(0.25).pow(0.07).min("e5e7")
          return [eff, eff2]
        },
        effectDisplay() {
          let eff = this.effect()
          return "^" + format(eff[0]) + ", x" + format(eff[1]);
        },
      },
      12: {
        title: "Shi-ah's Transcendent Pulse (YE 12)",
        description() {
          return "Transcensions make Shi-ah Embers boost YooAmatter Formations, and add " + formatWhole(2) + " levels to 'YooA's Genesis' (YM 44)."
        },
        cost: new Decimal(5),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let exp = player.stats.YooAity.resets.div(20).add(1).div(17)
          if (exp.gte(1)) exp = exp.pow(0.5)
          if (exp.gte(3)) exp = exp.mul(3).add(1).log10().pow(3).add(2)
          let eff = gameLayers.YooAity.ShiahEmberEffect().dilate(0.4).pow(exp)
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
      },
      13: {
        title: "Shi-ah's Infinite Calculation (YE 13)",
        description() {
          return "<span style = 'font-size:11px;'>Gain " + format(this.percent()) + "% of YooAmatter math problems gained on solve per second (" + format(this.effect()) + "/s) and start with 'Digit Optimizer' (YM 23). Remove 'Foundation Multiplier' (YM 14) softcap and make it better.</span>"
        },
        cost: new Decimal(25),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        percent() {
          let gain = new Decimal(2)
          return gain
        },
        effect() {
          return gameLayers.YooAmatter.problemGain().mul(this.percent().div(100));
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooAity", 13)) gain = 0
          return format(gain) + "/s";
        },
        onBuy() {
          player.upgrades.YooAmatter[23] = dOne
        }
      },
      14: {
        title: "Shi-ah's Radiant Singularity (YE 14)",
        description() {
          return "YooA Essence makes YooAmatter Spark 1st effect softcap later and start with 'Auto-YooArium' (YM 42)."
        },
        cost: new Decimal(125),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          return player.YooAity.amount.add(1).pow(15)
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
        onBuy() {
          player.upgrades.YooAmatter[42] = dOne
        }
      },
      15: {
        title: "Shi-ah's Temporal Chorus (YE 15)",
        description() {
          let reset = hasMilestone("YooAity", 13) ? "game" : "Transcension"
          return "Gain Ascensions based on fastest Ascension this " + reset + " and unlock Arin Rank."
        },
        cost: new Decimal(200),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          const gain = gameLayers.YooAmatter.getPrestigesGain()
          let time = hasMilestone("YooAity", 13) ? player.stats.YooAmatter.bestTime : player.stats.YooAmatter.bestTimeThisReset
          return Decimal.div(gain, time).div(4)
        },
        effectDisplay() {
          let gain = this.effect()
          return format(gain) + "/s";
        },
        onBuy() {
          player.upgrades.YooAmatter[42] = dOne
        }
      },
      21: {
        title: "Shi-ah's Calculative Crescendo (YE 21)",
        description() {
          return "YooA Essence boosts YooAmatter math problem gain. 'Mathematical Ascendancy' (YM 53) is raised to " + format(5) + "."
        },
        cost: new Decimal(5e7),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          return player.YooAity.amount.add(1).pow(3).dilate(0.45)
        },
        effectDisplay() {
          let gain = this.effect()
          return "x" + format(gain);
        },
      },
      22: {
        title: "Shi-ah's Echo Resonance (YE 22)",
        description() {
          return "YooAmatter math problems boost Shi-ah Echoes. Raise base YooA Essence gain to " + format(1.1) + "."
        },
        cost: new Decimal(1e12),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let effLog = player.math.YooAmatter.solved.add(1).log10().mul(0.1)
          if (effLog.gte(1e17)) effLog = effLog.div(1e17).pow(0.1).mul(1e18).sub(9e17)
          if (hasUpgrade("YooAity", 43)) effLog = effLog.mul(35)
          return effLog.pow10()
        },
        effectDisplay() {
          let gain = this.effect()
          return "x" + format(gain);
        },
      },
      23: {
        title: "Shi-ah's Recursive Rhapsody (YE 23)",
        description() {
          return "YooA math problems boost YooAmatter math problems. Raise base YooA Essence gain to " + format(1.1) + "."
        },
        cost: new Decimal(1e30),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let exp = 0.1
          if (hasUpgrade("YooAity", 43)) exp *= 35
          if (hasUpgrade("Arinium", 13)) exp *= 100
          if (hasUpgrade("Arinium", 15)) exp *= 6.18
          if (hasUpgrade("Yubin", 24)) exp *= 123
          let eff = player.math.YooA.solved.add(1).dilate(0.18).pow(exp)
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          return "x" + format(gain);
        },
      },
      24: {
        title: "Shi-ah's Ember Bloom (YE 24)",
        description() {
          return "YooA Essence boosts Shi-ah Ember 1st effect. Raise base YooA Essence gain to " + format(1.1) + "."
        },
        cost: new Decimal(1e45),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let exp = 0.6
          if (hasUpgrade("YooAity", 45)) exp *= 2
          if (hasUpgrade("YooAity", 53)) exp *= 2
          if (hasUpgrade("Arinium", 15)) exp *= 1.618
          let eff = player.YooAity.amount.div(1e43).add(10).log10().pow(exp)
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          return "^" + format(gain);
        },
      },
      25: {
        title: "Shi-ah's First Breath (YE 25)",
        description() {
          return "YooArium boosts YooA Essence gain. Raise base YooA Essence gain to " + format(1.11) + ", YooArium 2nd effect to " + format(10) + ", and unlock Shi-ah's Birth."
        },
        cost: new Decimal(1e57),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let exp = 0.015 * (hasUpgrade("YooAity", 44) ? 91.7 : 1)
          let eff = player.YooAmatter.YooArium.add(1).dilate(0.35).pow(exp)
          return eff.min("ee14")
        },
        effectDisplay() {
          let gain = this.effect()
          return "x" + format(gain);
        },
      },
      31: {
        title: "YooChronium Challenge (YE 31)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooChronium."
        },
        cost(x = getUpgLevels("YooAity", 31)) {
          let cost = pow(30, x.pow(1.5)).mul(0.5)
          if (x.gte(28)) x = x.div(28).pow(1.9).mul(60).sub(32)
          if (x.gte(10)) cost = pow(2, x.sub(10).pow(1.2)).mul(1e50).pow10()
          return cost;
        },
        invCost(x) {
          let cost = x.div(0.5).log(30).root(1.5).min(9)
          if (cost.gte(9) && x.gte("ee50")) cost = x.log10().div(1e50).log(2).root(1.2).add(10)
          if (cost.gte(28)) cost = cost.add(32).div(60).root(1.9).mul(28)
          return cost;
        },
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        maxLvl() {
          let max = 10
          if (hasUpgrade("Seunghee", 33)) max += 90
          return new Decimal(max)
        },
        base() {
          let base = 4
          return new Decimal(base)
        },
        baseDigits() {
          let digs = 0.1
          if (hasUpgrade("YooAity", 41)) digs -= 0.03
          return new Decimal(digs)
        },
        effect() {
          return pow(this.base(), getUpgLevels("YooAity", 31));
        },
        digits() {
          return Decimal.mul(this.baseDigits(), getUpgLevels("YooAity", 31));
        },
        effectDisplay() {
          return "+" + format(this.digits()) + " digits, x" + format(this.effect());
        },
        onBuy() {
          generateNewProblem("YooAity");
        },
      },
      32: {
        title: "Shi-ah's Nexus of Numbers (YE 32)",
        description() {
          return "Gain more YooChronium based on math problems solved and problem numbers. Gain more YooAity math problems based on problem numbers."
        },
        cost: new Decimal(2),
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        maxLvl: dOne,
        effect() {
          const YooAityMath = player.math.YooAity
          let x = gameLayers.YooAity.getEffectiveProblems()
          if (hasUpgrade("Mimi", 21)) x = x.dilate(2)
          if (hasUpgrade("Mimi", 22)) x = x.dilate(1.25)
          if (hasUpgrade("YooAity", 54)) x = x.dilate(1.3)
          if (hasUpgrade("OMG", 13)) x = x.dilate(1.2)
          let digs = 1
          if (hasUpgrade("YooAity", 41)) digs *= 1.35
          if (hasMilestone("YooAity", 15)) digs *= 1.7
          let prob = pow(Decimal.abs(YooAityMath.lastBase).pow(digs), Decimal.abs(YooAityMath.lastExp).pow(digs))
          if (prob.gte(1e75)) prob = prob.log10().div(75).pow(0.6).mul(75).pow10()

          let exp1 = prob.add(10).log10().pow(0.5).mul(0.06)
          let exp2 = 1
          if (hasUpgrade("Arinium", 12)) {
            exp1 = exp1.mul(1.1)
            exp2 *= 1.3
          }
          if (hasUpgrade("Yubin", 24)) {
            exp1 = exp1.mul(1.4)
            exp2 *= 1.4
          }
          if (hasUpgrade("Arinium", 23)) exp1 = exp1.mul(9.17)
          if (hasUpgrade("Seunghee", 33)) exp2 *= 420
          
          let eff = x.add(1).dilate(3).pow(exp1)
          let eff2 = prob.add(10).log10().pow(exp2)
          
          return [eff, eff2]
        },
        effectDisplay() {
          let gain = this.effect()
          return "x" + format(gain[0]) + " YooChronium, x" + format(gain[1]) + " math problems";
        },
      },
      33: {
        title: "YooA Resonator (YE 33)",
        description() {
          return "Gain more YooChronium based on YooA Points. Raise 'YooA-er' (YU 31) to " + format(199.5) + " and 'YooA Catalyst' (YU 34) to " + format(917) + "."
        },
        cost: new Decimal(1e3),
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAPoints.add(10).log10().pow(0.4).div(1e6).add(1)
          if (hasUpgrade("Arinium", 13)) eff = eff.pow(upgradeEffect("Arinium", 13))
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
      },
      34: {
        title() {
          return (getUpgLevels("YooAity", 34).gte(150) ? scaleText("Blooming", "blooming") + " " : "") + "Arin's Empowerment (YE 34)"
        },
        description() {
          return "Arin Ranks are +" + format(this.base().mul(100)) + "% stronger (Based on YooChronium)."
        },
        cost(x = getUpgLevels("YooAity", 34)) {
          if (x.gte(150)) x = x.sub(150).div(4).add(1).pow(2).mul(2).add(148)
          let cost = pow(2, x.pow(1.65)).mul(3e5)
          return cost;
        },
        invCost(x) {
          let cost = x.div(3e5).log(2).root(1.65)
          if (cost.gte(150)) cost = cost.sub(148).div(2).root(2).sub(1).mul(4).add(150)
          return cost;
        },
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        base() {
          let eff = player.YooAity.YooChronium.add(1).log10().div(20)
          if (eff.gte(1)) eff = eff.pow(0.6)
          return eff
        },
        effect() {
          let eff = this.base().mul(getUpgLevels("YooAity", 34))
          return eff
        },
        effectDisplay() {
          return "+" + format(this.effect().mul(100)) + "% stronger"
        },
      },
      35: {
        title: "Auto-YooChronium (YE 35)",
        description() {
          let percent = 0.03
          return "Gain " + format(percent) + "% of YooChronium gained on solve (based on max digits) per second (" + format(this.effect()) + "/s). Arin Rank cost scales " + format(1.5) + "x slower."
        },
        cost: new Decimal(1e6),
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        maxLvl: dOne,
        effect() {
          let x = gameLayers.YooAity.getEffectiveProblems()
          if (hasUpgrade("Mimi", 21)) x = x.dilate(2)
          if (hasUpgrade("Mimi", 22)) x = x.dilate(1.25)
          if (hasUpgrade("YooAity", 54)) x = x.dilate(1.3)
          if (hasUpgrade("OMG", 13)) x = x.dilate(1.2)
          let digits = gameLayers.YooAity.digits()
          if (hasUpgrade("YooAity", 41)) digits *= 1.35
          if (hasMilestone("YooAity", 15)) digits *= 1.7
          let prob = pow(pow10(digits * 3), Decimal.abs(pow10(digits)))
          if (prob.gte(1e75)) prob = prob.log10().div(75).pow(0.6).mul(75).pow10()
          
          let exp = prob.add(10).log10().pow(0.5).mul(0.06)
          if (hasUpgrade("Arinium", 12)) exp = exp.mul(1.1)
          if (hasUpgrade("Yubin", 24)) exp = exp.mul(1.4)
          if (hasUpgrade("Arinium", 23)) exp = exp.mul(9.17)
          let eff = x.add(1).dilate(3).pow(exp)
          return gameLayers.YooAity.getYooChroniumBaseGain().mul(eff).mul(3e-4);
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooAity", 35)) gain = 0
          return format(gain) + "/s";
        },
      },
      41: {
        title: "Essence Resonator (YE 41)",
        description() {
          return "<span style = 'font-size:10px;'>YooA Dimensions scale " + format(this.base()) + " levels later per level (Based on YooA Essence). Reduce digits added in YE 31 by " + format(0.03) + ", YU 23 and YU 24 cost exponents to " + format(1.1) + ", and effective digits in YE 32 increased by " + format(35) + "%.</span>"
        },
        cost(x = getUpgLevels("YooAity", 41)) {
          if (x.gte(13000)) x = x.sub(1e4).div(3000).pow(1.1).mul(13000)
          let cost = pow(1e50, x.pow(1.4)).mul("e1700")
          return cost;
        },
        invCost(x) {
          let cost = x.div("e1700").log(1e50).root(1.4)
          if (cost.gte(13000)) cost = cost.div(13000).root(1.1).mul(3000).add(1e4)
          return cost;
        },
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        base() {
          return player.YooAity.amount.add(10).log10().pow(1.3)
        },
        effect() {
          return this.base().mul(getUpgLevels("YooAity", 41))
        },
        effectDisplay() {
          let gain = this.effect()
          return "+" + format(gain) + " levels later";
        },
        onBuy() {
          if (getUpgLevels("YooAity", 41).lt(1)) generateNewProblem("YooAity")
        }
      },
      42: {
        title: "Chrono-Miracle Bloom (YE 42)",
        description() {
          return "<span style = 'font-size:10px;'>YooAmatter Formations scale " + format(this.base()) + " levels later per level (Based on YooA Essence). Raise YooA age effect to " + format(91.7) + " and gain " + format(9.17) + "x more Seunghee Points.</span>"
        },
        cost(x = getUpgLevels("YooAity", 42)) {
          if (x.gte(1e3)) x = x.sub(750).div(250).pow(1.1).mul(1e3)
          let cost = pow("e5000", x.pow(1.6)).mul("e53e4")
          return cost;
        },
        invCost(x) {
          let cost = x.div("e53e4").log("e5000").root(1.6)
          if (cost.gte(1e3)) cost = cost.div(1e3).root(1.1).mul(250).add(750)
          return cost;
        },
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        base() {
          let base = player.YooAity.amount.add(10).log10().pow(0.8)
          if (base.gte(7e6)) base = base.div(7e6).pow(0.5).mul(7e6)
          return base
        },
        effect() {
          return this.base().mul(getUpgLevels("YooAity", 42))
        },
        effectDisplay() {
          let gain = this.effect()
          return "+" + format(gain) + " levels later";
        },
      },
      43: {
        title: "Emberborne Elegy (YE 43)",
        description() {
          return "<span style = 'font-size:10px;'>Add " + format(this.base()) + " levels to YM 31 per level (Based on Shi-ah Embers). Raise YooChronium 2nd effect, YE 22, and YE 23 to " + format(35) + " and gain " + format(9.17) + "x more Seunghee Points.</span>"
        },
        cost(x = getUpgLevels("YooAity", 43)) {
          if (x.gte(1e3)) x = x.sub(750).div(250).pow(1.1).mul(1e3)
          let cost = pow("e7000", x.pow(1.65)).mul("e75e4")
          return cost;
        },
        invCost(x) {
          let cost = x.div("e75e4").log("e7000").root(1.65)
          if (cost.gte(1e3)) cost = cost.div(1e3).root(1.1).mul(250).add(750)
          return cost;
        },
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        base() {
          return player.YooAity.embers.add(10).log10().pow(0.6)
        },
        effect() {
          return this.base().mul(getUpgLevels("YooAity", 43)).floor()
        },
        effectDisplay() {
          let gain = this.effect()
          return "+" + format(gain) + " levels";
        },
      },
      44: {
        title: "Dimensional Starlace (YE 44)",
        description() {
          return "<span style = 'font-size:10px;'>Add " + format(this.base()) + " to YooA Dimension rank multiplier per level (Based on YooA age). Raise YE 25 to " + format(91.7) + ", gain " + format(9.17) + "x more Seunghee Points, and unlock buy max YE upgrades.</span>"
        },
        cost(x = getUpgLevels("YooAity", 44)) {
          if (x.gte(10)) x = x.div(10).pow10()
          let cost = pow("e2e4", x.pow(2.5)).mul("e165e4")
          return cost;
        },
        invCost(x) {
          let cost = x.div("e165e4").log("e2e4").root(2.5)
          if (cost.gte(10)) cost = cost.log10().mul(10)
          return cost;
        },
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        base() {
          let base = gameLayers.YooAity.getEffectiveAge().div(5.5e7).pow(0.6).sub(1).div(5).max(0)
          if (base.gte(0.025)) base = base.div(0.025).pow(0.25).mul(0.05).sub(0.025)
          return base
        },
        effect() {
          return this.base().mul(getUpgLevels("YooAity", 44))
        },
        effectDisplay() {
          let gain = this.effect()
          return "+" + format(gain);
        },
      },
      45: {
        title: "Fractal Aria (YE 45)",
        description() {
          return "<span style = 'font-size:10px;'>Add " + format(this.base()) + " to YS 11 self exponent of 2nd effect per level (Based on YooA age). Raise YooChronium 2nd effect and YooA age effect to " + format(91.7) + ", YooAriun 2nd effect to " + format(1995) + ", YE 24 to " + format(2) + ". Gain " + format(9.17) + "x more Yubin Points.</span>"
        },
        cost(x = getUpgLevels("YooAity", 45)) {
          if (x.gte(8)) x = pow(8, x.div(8))
          let cost = pow("e1234567", x.pow(2.5)).mul("e111111111")
          return cost;
        },
        invCost(x) {
          let cost = x.div("e111111111").log("e1234567").root(2.5)
          if (cost.gte(8)) cost = cost.log(8).mul(8)
          return cost;
        },
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        base() {
          let base = gameLayers.YooAity.getEffectiveAge().div(8e7).pow(0.45).sub(1).div(5).max(0)
          if (base.gte(0.03)) base = base.div(0.03).pow(0.2).mul(0.15).sub(0.12)
          if (base.gte(0.037)) base = base.div(0.037).pow(0.8).mul(0.02).add(0.017)
          return base
        },
        effect() {
          let eff = this.base().mul(getUpgLevels("YooAity", 45))
          if (eff.gte(0.5)) eff = eff.div(0.5).pow(0.3).mul(0.5)
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          let dis = "+" + format(gain)
          if (gain.gte(0.5)) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      51: {
        title: "Ember Serenade (YE 51)",
        description() {
          return "Shi-ah Embers raise YooA Point gain. Raise Seunghee, Yubin, Arinium, Hyojung 1st effs to " + format(1.4) + ", " + format(1.5) + ", " + format(2.5) + ", " + format(2) + "."
        },
        cost: new Decimal("ee16"),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = gameLayers.YooAity.ShiahEmberEffect().add(10).log10().div(1e80).add(1)
          return eff
        },
        effectDisplay() {
          return "^" + format(this.effect())
        },
      },
      52: {
        title: "Tempo Cascade (YE 52)",
        description() {
          return "YooA Dimension Rank Autobuyer speed boosts Arinium gain. Dilate Shi-ah Embers first effect to " + format(2) + "."
        },
        cost: new Decimal("ee21"),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let base = player.autobuyers.YooA['YooA Dimension Rank'].autoInterval.recip()
          return base.div(1e33).max(0).add(1).log10().dilate(3).add(1).pow(3.4)
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
      },
      53: {
        title: "Essence Crescendo (YE 53)",
        description() {
          return "YooA Essence boost Arinium gain. Square YE 24 effect and add " + format(2) + " to HJ 11 exponent."
        },
        cost: new Decimal("e1.111111e111"),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.amount.add(1).log10().div(1e110).add(1)
          if (eff.gte("e15e4")) eff = eff.log10().div(15e4).pow(0.4).mul(15e4).pow10()
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          let dis = "x" + format(gain);
          if (gain.gte("e15e4")) dis += softcapText("(softcapped)");
          return dis
        },
      },
      54: {
        title: "Luminous Harmony (YE 54)",
        description() {
          return "<span style = 'font-size:11px;'>YooA Points boost Arinium gain. Dilate effective YooAity math problems in YE 32, SH 24, and YB 24 to " + format(1.3) + ", and unlock buy max Arinium, Hyojung, and Mimi upgrades.</span>"
        },
        cost: new Decimal("ee174"),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAPoints.add(1).log10().add(1).log10().div(1e4).max(1).pow(0.5)
          if (eff.gte(1.5)) eff = eff.mul(1.5).pow(0.5)
          if (eff.gte(44)) eff = eff.mul(25 / 11).log10().div(2).pow(0.6).mul(2).pow10().div(25 / 11)
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          let dis = "^" + format(gain);
          if (gain.gte(44)) dis += softcapText("(softcapped)");
          return dis
        },
      },
      55: {
        title: "Eternal Debut (YE 55)",
        description() {
          return "Change YooA's name to Yoo Shi-ah, unlock OH MY GIRL debut, and start aging after debut."
        },
        cost: new Decimal("eee3"),
        costCurrency: "YooA Essence",
        costLayer: "YooAity",
        costInternal: "amount",
        maxLvl: dOne,
      },
    },
    milestones: {
      1: {
        title() { return formatWhole(1) + " Transcension" },
        description() {
          return "Unlock buy max YooAmatter Formations and each 'YooA Challenge' (YU 11) level boosts YooArium gain by x" + format(1.05) + "."
        },
        effect() {
          return pow(1.05, gameLayers.YooA.effectiveYU11());
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
        done() {
          return player.stats.YooAity.resets.gte(1)
        }
      },
      2: {
        title() { return formatWhole(2) + " Transcensions" },
        description() {
          return "Unlock YooAity upgrades."
        },
        done() {
          return player.stats.YooAity.resets.gte(2)
        }
      },
      3: {
        title() { return formatWhole(3) + " Transcensions" },
        description() {
          return "Unlock Max All YooAmatter Formations, YooAmatter Upgrades, YooA Spaces, YooA Realms, and YooA Entities. Add " + formatWhole(5) + " levels to 'YooArium Challenge' (YM 31), reduce its added digits by " + format(0.05) + ", and increase its multiplier by " + format(1) + "."
        },
        done() {
          return player.stats.YooAity.resets.gte(3)
        }
      },
      4: {
        title() { return formatWhole(5) + " Transcensions" },
        description() {
          return "Unlock Max Upgrade Arin, and each square rooted Arin level adds " + format(0.01) + " to its base YooArium multiplier."
        },
        effect() {
          return getArinEffLevels().pow(0.5).div(100);
        },
        effectDisplay() {
          return "+" + format(this.effect())
        },
        done() {
          return player.stats.YooAity.resets.gte(5)
        }
      },
      5: {
        title() { return formatWhole(7) + " Transcensions" },
        description() {
          return "Start with Level " + formatWhole(1) + " 'Prime Boost' (YM 34) on Transcension. 'YooA's Genesis' (YM 44) formula is better."
        },
        done() {
          return player.stats.YooAity.resets.gte(7)
        },
        onComplete() {
          player.upgrades.YooAmatter[34] = dOne;
          player.upgrades.YooA[21] = dOne;
        },
      },
      6: {
        title() { return formatWhole(10) + " Transcensions" },
        description() {
          return "Unlock YooA Dimension 3+ autobuyer and more YooAmatter Prestiger options."
        },
        done() {
          return player.stats.YooAity.resets.gte(10)
        },
      },
      7: {
        title() { return formatWhole(25) + " Total YooA Essence" },
        description() {
          return "Start with all YooAmatter Challenges completed on Transcension. Total YooA Essence boosts YU 12 and YU 22 after softcaps."
        },
        effect() {
          return player.stats.YooAity.totalAmount.div(100).add(1).log10().pow(0.7).div(3).add(1);
        },
        effectDisplay() {
          return "^" + format(this.effect())
        },
        done() {
          return player.stats.YooAity.totalAmount.gte(25)
        },
        onComplete() {
          player.challenges.YooAmatter = {
            1: dOne,
            2: dOne,
            3: dOne,
            4: dOne
          }
        },
      },
      8: {
        title() { return formatWhole(25) + " Transcensions" },
        description() {
          return "Unlock YooAmatter Formations autobuyer."
        },
        done() {
          return player.stats.YooAity.resets.gte(20)
        },
      },
      9: {
        title() { return formatWhole(100) + " Total YooA Essence" },
        description() {
          return "Unlock YooAmatter Upgrades autobuyer. Total YooA Essence multiplies free levels from Shi-ah Embers."
        },
        effect() {
          return player.stats.YooAity.totalAmount.div(150).add(1).log10().pow(0.9).mul(10).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
        done() {
          return player.stats.YooAity.totalAmount.gte(100)
        },
      },
      10: {
        title() { return formatWhole(300) + " Total YooA Essence" },
        description() {
          return "Unlock Spark Upgrades and Arin autobuyer."
        },
        done() {
          return player.stats.YooAity.totalAmount.gte(300)
        },
      },
      11: {
        title() { return "Transcend in under " + formatWhole(1) + " minute" },
        description() {
          return "Unlock YooAity autoprestiger, autobuyers are " + format(2) + "x faster, and YooA Dimensions and Upgrades cost nothing."
        },
        done() {
          return player.stats.YooAity.bestTime.lt(60)
        },
        onComplete() {
          updateAllAutobuyerTime(player.autobuyers)
        },
      },
      12: {
        title() { return "YooA Age " + formatWhole(1) + " minute" },
        description() {
          return "Unlock YooChronium, YooA Dimensions scale " + formatWhole(1e4) + " levels later, and YooAmatter Formations and YooAmatter and Spark Upgrades cost nothing."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(60)
        },
      },
      13: {
        title() { return "YooA Age " + formatWhole(8) + " hours" },
        description() {
          return "Gain " + format(1) + "% of YooAmatter gained on Ascension per second, YooA Dimensions scale " + formatWhole(8e4) + " levels later, and 'Shi-ah's Temporal Chorus' (YE 15) is based on fastest Ascension this game."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(28800)
        },
      },
      14: {
        title() { return "YooA Age " + formatWhole(1) + " day" },
        description() {
          return "Unlock YooA Dimension ranks, buy max Shi-ah Echoes, YooA Lines and YooA Planes cost multipliers are raised to " + format(1e-4) + ", and Arin levels cost nothing."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400)
        },
      },
      15: {
        title() { return "YooA Age " + formatWhole(1) + " month" },
        description() {
          return "Unlock max Arin Rank. Reduce the digits in YooAity math problems by " + format(40) + "% and increase the effective digits in YE 32 by " + format(70) + "%."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 30)
        },
        onComplete() {
          generateNewProblem("YooAity")
        },
      },
      16: {
        title() { return "YooA Age " + formatWhole(130) + " days (Seunghee's Birth)" },
        description() {
          return "Unlock Seunghee."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 130)
        },
      },
      17: {
        title() { return "YooA Age " + formatWhole(723) + " days (Yubin's Birth)" },
        description() {
          return "Unlock Yubin, Arin Rank autobuyer, and more YooAity Prestiger options."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 723)
        },
      },
      18: {
        title() { return "YooA Age " + formatWhole(1370) + " days (Arin's Birth)" },
        description() {
          return "Unlock Arinium."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 1370)
        },
      },
      19: {
        title() { return "YooA Age " + formatWhole(2506) + " days (Hyojung Age " + formatWhole(8) + " years)" },
        description() {
          return "Unlock Hyojung, YooAity upgrade autobuyer, and Shi-ah Echoes autobuyer. Arin Ranks, YooAity upgrades, and Shi-ah Echoes cost nothing."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 2506)
        },
      },
      20: {
        title() { return "YooA Age " + formatWhole(3514) + " days (Mimi Age " + formatWhole(10) + " years)" },
        description() {
          return "Unlock Mimi and YooA Dimension Rank autobuyer."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 3514)
        },
      },
      21: {
        title() { return "YooA Age " + formatWhole(7166) + " days (Mimi Age " + formatWhole(20) + " years)" },
        description() {
          return "YooA Points and YooArium boost each other. Dilate MM 14 base to " + format(2) + " and add " + format(0.1) + " to Miracle Light gain dilation. Members' upgrades cost nothing."
        },
        effect() {
          let eff = player.YooAmatter.YooArium.add(10).log10().div("e475e3").add(1).pow(0.5)
          let eff2 = player.YooAPoints.add(10).log10().div("e644e3").add(1).pow(0.01)
          return [eff, eff2];
        },
        effectDisplay() {
          const eff = this.effect()
          return "^" + format(eff[0]) + " YooA Points, ^" + format(eff[1]) + " YooArium"
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 7166)
        },
      },
      22: {
        title() { return "YooA Age " + formatWhole(7214) + " days (Arin Age " + formatWhole(16) + " years)" },
        description() {
          return "Unlock Arinium, Hyojung, and Mimi upgrades autobuyer and Arin Tier."
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 7214)
        },
      },
      23: {
        title() { return "YooA Age " + formatWhole(7521) + " days (OMG Age " + formatWhole(1) + " year)" },
        description() {
          return "Gain " + format(1) + "% of YooAity math problems gained on solve (based on max digits) per second. Gain " + format(2015) + "x more YooAity math problems."
        },
        effect() {
          let digits = gameLayers.YooAity.digits()
          if (hasUpgrade("YooAity", 41)) digits *= 1.35
          if (hasMilestone("YooAity", 15)) digits *= 1.7
          let prob = pow(pow10(digits * 3), Decimal.abs(pow10(digits)))
          if (prob.gte(1e75)) prob = prob.log10().div(75).pow(0.6).mul(75).pow10()
          
          let exp2 = 1
          if (hasUpgrade("Arinium", 12)) exp2 *= 1.3
          if (hasUpgrade("Yubin", 24)) exp2 *= 1.4
          if (hasUpgrade("Seunghee", 33)) exp2 *= 420

          let eff2 = prob.add(10).log10().pow(exp2)
          return gameLayers.YooAity.problemBaseGain().mul(eff2).mul(0.01);
        },
        effectDisplay() {
          return format(this.effect()) + "/s"
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 7521)
        },
      },
      24: {
        title() { return "YooA Vocals Level " + formatWhole(618) },
        description() {
          return "Unlock Arin's Training."
        },
        done() {
          return gameLayers.OMG.getLevels("YooA", "vocals").gte(618)
        },
      },
      25: {
        title() { return formatWhole("ee1e12") + " Total YooA Essence" },
        description() {
          return "Total YooA Essence boosts Miracle Light gain. SH 21 and YB 21 work instantly."
        },
        effect() {
          let e = Decimal.mul(5, hasUpgrade("OMG", 32) ? 10 : 1)
          return player.stats.YooAity.totalAmount.add(10).log10().add(10).log10().div(1e12).add(1).pow(e);
        },
        effectDisplay() {
          return "x" + format(this.effect())
        },
        done() {
          return player.stats.YooAity.totalAmount.gte("ee1e12")
        },
      },
      26: {
        title() { return formatWhole("ee1e15") + " YooAmatter" },
        description() {
          return "YooAmatter boosts YooA aging speed. Cube 'YooA's Secret Garden' (YU 44) effect."
        },
        effect() {
          return player.YooAmatter.amount.add(10).log10().add(10).log10().div(1e14).dilate(0.8).pow(3);
        },
        effectDisplay() {
          return "^" + format(this.effect())
        },
        done() {
          return player.YooAmatter.amount.gte("ee1e15")
        },
      },
      27: {
        title() { return "YooA Age " + formatWhole(8166) + " days (Seunghee Age " + formatWhole(22) + " years)" },
        description() {
          return "Unlock Seunghee's Training. Transcension time boosts Miracle Light exponent and cube its effect on the 1st effect."
        },
        effect() {
          return player.stats.YooAity.time.div(5).add(10).log10().pow(0.5).sub(1).div(10).add(1);
        },
        effectDisplay() {
          return "^" + format(this.effect())
        },
        done() {
          return gameLayers.YooAity.getEffectiveAge().gte(86400 * 8166)
        },
      },
      28: {
        title() { return "Seunghee Vocals Level " + formatWhole(50) },
        description() {
          return "Gain " + format(1.03) + "x Seunghee Light and " + format(2) + "x Arin Light per Seunghee Vocal level."
        },
        effect() {
          let eff = pow(1.03, gameLayers.OMG.getLevels("Seunghee", "vocals"))
          let eff2 = pow(2, gameLayers.OMG.getLevels("Seunghee", "vocals"))
          return [eff, eff2];
        },
        effectDisplay() {
          const eff = this.effect()
          return "x" + format(eff[0]) + " Seunghee Light, x" + format(eff[1]) + " Arin Light"
        },
        done() {
          return gameLayers.OMG.getLevels("Seunghee", "vocals").gte(50)
        },
      },
    }
  },
  Seunghee: {
    unlocked: true,
    color: "#4dffb8",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 21)
      },
      rows: 3,
      cols: 4,
      11: {
        title: "Melodic Blossom (SH 11)",
        description() {
          return "Gain " + format(this.base()) + " Seunghee Points per second."
        },
        cost(x = getUpgLevels("Seunghee", 11)) {
          let base = 5
          if (hasUpgrade("Seunghee", 21)) base /= 2
          return pow(base, x.pow(1.25)).mul(1e30);
        },
        invCost(x) {
          let base = 5
          if (hasUpgrade("Seunghee", 21)) base /= 2
          let cost = x.div(1e30).log(base).root(1.25)
          return cost;
        },
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        base() {
          return new Decimal(0.01)
        },
        effect() {
          let lvl = getUpgLevels("Seunghee", 11)
          if (hasUpgrade("Hyojung", 21)) lvl = lvl.mul(upgradeEffect("Hyojung", 21))
          if (hasUpgrade("Mimi", 12)) lvl = lvl.mul(upgradeEffect("Mimi", 12))
          return this.base().mul(lvl.pow(upgradeEffect("Seunghee", 13).add(1)));
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
      },
      12: {
        title: "Echoing Harmony (SH 12)",
        description() {
          return "Gain " + format(this.base()) + "x more Seunghee Points."
        },
        cost(x = getUpgLevels("Seunghee", 12)) {
          return pow(2, x.pow(1.3)).mul(20);
        },
        invCost(x) {
          let cost = x.div(20).log(2).root(1.3)
          return cost;
        },
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        base() {
          return new Decimal(1.5)
        },
        effect() {
          return this.base().pow(getUpgLevels("Seunghee", 12));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title() {
          return (getUpgLevels("Seunghee", 13).gte(1e5) ? scaleText("Blooming", "blooming") + " " : "") + "Symphonic Amplifier (SH 13)"
        },
        description() {
          return "Increase 'Melodic Blossom' (SH 11) level exponent by " + format(this.base()) + "."
        },
        cost(x = getUpgLevels("Seunghee", 13)) {
          if (x.gte(1e5)) x = x.div(1e5).pow(2).mul(1e5)
          return pow(2.5, x.pow(1.5)).mul(100);
        },
        invCost(x) {
          let cost = x.div(100).log(2.5).root(1.5)
          if (cost.gte(1e5)) cost = cost.div(1e5).pow(0.5).mul(1e5)
          return cost;
        },
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        base() {
          return new Decimal(0.2)
        },
        effect() {
          return this.base().mul(getUpgLevels("Seunghee", 13));
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      14: {
        title: "Seunghee's Soft Petal Amplifier (SH 14)",
        description() {
          return "<span style = 'font-size:11px;'>Gain " + format(this.base()) + "x more Seunghee Points per level (Based on YooA Points). Add " + formatWhole(12) + " levels to 'YooA's Genesis' (YM 44) and make its first effect better.</span>"
        },
        cost(x = getUpgLevels("Seunghee", 14)) {
          return pow(17, x.pow(1.55)).mul(1000);
        },
        invCost(x) {
          let cost = x.div(1000).log(17).root(1.55)
          return cost;
        },
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        base() {
          return player.YooAPoints.add(10).log10().add(10).log10().pow(0.4)
        },
        effect() {
          return this.base().pow(getUpgLevels("Seunghee", 14));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title() {
          const x = getUpgLevels("Seunghee", 21)
          return (x.gte(3500) ? scaleText("Cascading", "cascading") + " " : x.gte(25) ? scaleText("Blooming", "blooming") + " " : "") + "Petal Prism Ascension (SH 21)"
        },
        description() {
          return "Gain more Seunghee Points (Based on level and Seunghee Points). Halve 'Melodic Blossom' (SH 11) cost multiplier."
        },
        cost(x = getUpgLevels("Seunghee", 21)) {
          if (x.gte(3500)) x = x.div(3.5).log10().div(3).pow(2).mul(3).pow10().mul(3.5)
          if (x.gte(25)) x = x.sub(25).div(4).add(1).pow(2).mul(2).add(23)
          return pow(100, x.pow(1.7)).mul(1e10);
        },
        invCost(x) {
          let cost = x.div(1e10).log(100).root(1.7)
          if (cost.gte(25)) cost = cost.sub(23).div(2).root(2).sub(1).mul(4).add(25)
          if (cost.gte(3500)) cost = cost.div(3.5).log10().div(3).root(2).mul(3).pow10().mul(3.5)
          return cost;
        },
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        exp() { // 1 - 1 / (1 + x / 20)
          let x = this.gainExp()
          let exp = Decimal.sub(1, Decimal.div(1, x))
          return exp
        },
        gainExp() {
          let x = getUpgLevels("Seunghee", 21)
          if (hasUpgrade("Seunghee", 34)) x = x.pow(1.1)
          let exp = x.div(20).add(1)
          return exp
        },
        effect() {
          return player.YooAity.SeungheePoints.add(1).pow(this.exp());
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      22: {
        title: "Arinium Bloom (SH 22)",
        description() {
          return "Gain more Arinium based on Seunghee Points. Raise Seunghee Points first effect to " + format(1.25) + "."
        },
        cost: new Decimal(1e90),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          return player.YooAity.SeungheePoints.add(10).log10().dilate(1.5).div(100).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      23: {
        title: "Harmonic Resonance (SH 23)",
        description() {
          return "Gain more Seunghee Points based on YooChronium."
        },
        cost: new Decimal(1e120),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          return player.YooAity.YooChronium.div(1e200).add(1).dilate(0.8).pow(0.15);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "Petalstorm Insight Convergence (SH 24)",
        description() {
          return "Gain more Seunghee Points based on YooAity math problems. Add " + format(0.5) + " to base YooA age gain exponent."
        },
        cost: new Decimal(2.02e202),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          let dil = 1
          if (hasUpgrade("Mimi", 21)) dil *= 2
          if (hasUpgrade("YooAity", 54)) dil *= 1.3
          if (hasUpgrade("OMG", 13)) dil *= 1.2
          let x = gameLayers.YooAity.getEffectiveProblems().dilate(dil)

          let exp = 1
          if (hasUpgrade("Arinium", 23)) exp *= 9.17
          if (hasUpgrade("Arinium", 24) && player.YooAity.MimiPoints.gte(100)) exp *= 4

          let eff = x.add(1).dilate(2.75).pow(0.1).div(10000).add(1).pow(exp);
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      31: {
        title: "Chronium Tempo Boost (SH 31)",
        description() {
          return "YooChronium boosts YooA age gain speed. Dilate effective YooAity math problems to " + format(1.15) + " and unlock buy max Arin Tier."
        },
        cost: new Decimal("ee35"),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.YooChronium.add(10).log10().div(1e35).add(1).dilate(0.75).pow(2);
          return eff
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
      32: {
        title: "Harmonic Amplifier (SH 32)",
        description() {
          return "Seunghee Points boost YooAity math problem and Miracle Light gain."
        },
        cost: new Decimal("e25e36"),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.SeungheePoints.add(10).log10().div(1e37).add(1).dilate(1.5).pow(7);
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      33: {
        title: "Symphonic Legacy (SH 33)",
        description() {
          return "YE 31 levels after " + formatWhole(10) + " boost effective Seunghee Point gain. Add " + formatWhole(90) + " levels to YE 31, raise YE 32 2nd effect to " + formatWhole(420) + ", and trilate YMC 4 2nd effect to " + format(1.125, 3) + "."
        },
        cost: new Decimal("e2e45"),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          let eff = pow(1.5, getUpgLevels("YooAity", 31).sub(10).max(0));
          return eff
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
      34: {
        title: "Petal Prism Mastery (SH 34)",
        description() {
          return "Gain more YooChronium based on math problems solved and max problem numbers. Raise 'Petal Prism Ascension' (SH 21) effective levels to " + format(1.1) + "."
        },
        cost: new Decimal("e5.8e58"),
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        maxLvl: dOne,
        effect() {
          let x = gameLayers.YooAity.getEffectiveProblems()
          let digits = gameLayers.YooAity.digits()
          let prob = pow(pow10(digits * 3), Decimal.abs(pow10(digits)))
          if (prob.gte(1e75)) prob = prob.log10().div(75).pow(0.6).mul(75).pow10()
          let eff = x.add(10).log10().dilate(3).pow(prob.add(10).log10().pow(0.35).div(150)).div(1e3).add(1);
          return eff
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
    }
  },
  Yubin: {
    unlocked: true,
    color: "#9e45e8",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 21)
      },
      rows: 3,
      cols: 4,
      11: {
        title: "Nocturne Bloom (YB 11)",
        description() {
          return "Gain " + format(this.base()) + " Yubin Points per second."
        },
        cost(x = getUpgLevels("Yubin", 11)) {
          let base = 6
          if (hasUpgrade("Yubin", 21)) base /= 2
          return pow(base, x.pow(1.25)).mul(1e72);
        },
        invCost(x) {
          let base = 6
          if (hasUpgrade("Yubin", 21)) base /= 2
          let cost = x.div(1e72).log(base).root(1.25)
          return cost;
        },
        costCurrency: "YooChronium",
        costLayer: "YooAity",
        costInternal: "YooChronium",
        base() {
          return new Decimal(0.01)
        },
        effect() {
          let lvl = getUpgLevels("Yubin", 11)
          if (hasUpgrade("Hyojung", 21)) lvl = lvl.mul(upgradeEffect("Hyojung", 21))
          if (hasUpgrade("Mimi", 12)) lvl = lvl.mul(upgradeEffect("Mimi", 12))
          return this.base().mul(lvl.pow(upgradeEffect("Yubin", 13).add(1)));
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
      },
      12: {
        title: "Moonlight Duet (YB 12)",
        description() {
          return "Gain " + format(this.base()) + "x more Seunghee and Yubin Points."
        },
        cost(x = getUpgLevels("Yubin", 12)) {
          return pow(2, x.pow(1.35)).mul(5);
        },
        invCost(x) {
          let cost = x.div(5).log(2).root(1.35)
          return cost;
        },
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        base() {
          return new Decimal(1.5)
        },
        effect() {
          return this.base().pow(getUpgLevels("Yubin", 12));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title() {
          return (getUpgLevels("Yubin", 13).gte(1e4) ? scaleText("Blooming", "blooming") + " " : "") + "Ethereal Crescendo (YB 13)"
        },
        description() {
          return "Increase 'Nocturne Bloom' (YB 11) level exponent by " + format(this.base()) + "."
        },
        cost(x = getUpgLevels("Yubin", 13)) {
          if (x.gte(1e4)) x = x.div(1e4).pow(2).mul(1e4)
          return pow(3, x.pow(1.5)).mul(200);
        },
        invCost(x) {
          let cost = x.div(200).log(3).root(1.5)
          if (cost.gte(1e4)) cost = cost.div(1e4).pow(0.5).mul(1e4)
          return cost;
        },
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        base() {
          return new Decimal(0.2)
        },
        effect() {
          return this.base().mul(getUpgLevels("Yubin", 13));
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      14: {
        title: "Yubin's Lunar Synergy (YB 14)",
        description() {
          return "<span style = 'font-size:11px;'>Gain " + format(this.base()) + "x more Seunghee and Yubin Points per level (Based on Seunghee Points). Add " + formatWhole(7) + " levels to 'YooA's Genesis' (YM 44) and make Arin Rank first effect better.</span>"
        },
        cost(x = getUpgLevels("Yubin", 14)) {
          return pow(23, x.pow(1.55)).mul(3e4);
        },
        invCost(x) {
          let cost = x.div(3e4).log(23).root(1.55)
          return cost;
        },
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        base() {
          return player.YooAity.SeungheePoints.add(10).log10().pow(0.3)
        },
        effect() {
          return this.base().pow(getUpgLevels("Yubin", 14));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title() {
          const x = getUpgLevels("Yubin", 21)
          return (x.gte(4e3) ? scaleText("Cascading", "cascading") + " " : x.gte(25) ? scaleText("Blooming", "blooming") + " " : "") + "Prismatic Bloom (YB 21)"
        },
        description() {
          return "Gain more Yubin Points (Based on level and Yubin Points). Halve 'Nocturne Bloom' (YB 11) cost multiplier."
        },
        cost(x = getUpgLevels("Yubin", 21)) {
          if (x.gte(4e3)) x = x.div(4).log10().div(3).pow(2).mul(3).pow10().mul(4)
          if (x.gte(25)) x = x.sub(25).div(4).add(1).pow(2).mul(2).add(23)
          return pow(150, x.pow(1.7)).mul(1e10);
        },
        invCost(x) {
          let cost = x.div(1e10).log(150).root(1.7)
          if (cost.gte(25)) cost = cost.sub(23).div(2).root(2).sub(1).mul(4).add(25)
          if (cost.gte(4e3)) cost = cost.div(4).log10().div(3).root(2).mul(3).pow10().mul(4)
          return cost;
        },
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        exp() { // 1 - 1 / (1 + x / 20)
          let x = this.gainExp()
          let exp = Decimal.sub(1, Decimal.div(1, x))
          return exp
        },
        gainExp() {
          let x = getUpgLevels("Yubin", 21)
          //if (hasUpgrade("Yubin", 34)) x = x.pow(1.1)
          let exp = x.div(20).add(1)
          return exp
        },
        effect() {
          return player.YooAity.YubinPoints.add(1).pow(this.exp());
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      22: {
        title: "Astral Resonance (YB 22)",
        description() {
          return "Gain more Arinium based on Yubin Points. Raise Yubin Points first effect to " + format(1.4) + "."
        },
        cost: new Decimal(1e31),
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        maxLvl: dOne,
        effect() {
          return player.YooAity.YubinPoints.add(10).log10().dilate(1.75).pow(1.4).div(100).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      23: {
        title: "Chromatic Moonburst (YB 23)",
        description() {
          return "Gain more Yubin Points based on YooChronium."
        },
        cost: new Decimal(1e50),
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        maxLvl: dOne,
        effect() {
          let eff = player.YooAity.YooChronium.div("e700").add(1).dilate(0.7).pow(0.12)
          if (eff.gte(1e9)) eff = eff.div(1e9).pow(0.5).mul(2e9).sub(1e9)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "Lunara Equation Bloom (YB 24)",
        description() {
          return "<span style = 'font-size:11px;'>Gain more Yubin Points based on YooAity math problems. Add " + format(1) + " to base YooA age gain and HJ 11 exponents, raise YE 32 effects to " + format(1.4) + ", YE 23 to " + format(123) + ", YooChronium 2nd eff to " + format(123456) + ", and add " + format("9.17e1995") + " to Shi-ah Echo mult.</span>"
        },
        cost: new Decimal(1.5e150),
        costCurrency: "Yubin Points",
        costLayer: "YooAity",
        costInternal: "YubinPoints",
        maxLvl: dOne,
        effect() {
          let dil = 1
          if (hasUpgrade("Mimi", 21)) dil *= 2
          if (hasUpgrade("YooAity", 54)) dil *= 1.3
          if (hasUpgrade("OMG", 13)) dil *= 1.2
          let x = gameLayers.YooAity.getEffectiveProblems().dilate(dil)

          let exp = 1
          if (hasUpgrade("Arinium", 23)) exp *= 9.17
          if (hasUpgrade("Arinium", 24) && player.YooAity.MimiPoints.gte(100)) exp *= 2
          let eff = x.add(1).dilate(2.5).pow(0.1).div(1000).add(1).pow(exp);
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
    },
  },
  Arinium: {
    unlocked: true,
    color: "#fd35c7",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 21)
      },
      rows: 5,
      cols: 6,
      11: {
        title: "Arin's Awakening (AR 11)",
        description() {
          return "Unlock an Arin Rank effect."
        },
        cost: new Decimal(5),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
      },
      12: {
        title: "Transcendent Harmony (AR 12)",
        description() {
          return "Transcensions boost Ascensions. Raise 'Shi-ah's Nexus of Numbers' (YE 32) 1st effect to " + format(1.1) + " and 2nd effect to " + format(1.3) + "."
        },
        cost: new Decimal(300),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let x = player.stats.YooAity.resets
          if (x.gte(1e18)) x = x.log10().div(18).pow(0.25).mul(72).sub(54).pow10().div(1e18).pow(0.5).mul(2e18).sub(1e18)
          if (x.gte(1e9)) x = x.div(1e9).pow(0.5).mul(2e9).sub(1e9)
          let eff = x.pow(Decimal.mul(0.3, hasUpgrade("OMG", 32) ? 4.2015 : 1)).pow10()
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "Resonant Prism (AR 13)",
        description() {
          return "Arinium boosts 'YooA Resonator' (YE 33). Raise YE 23 effect to " + format(100) + " and gain " + format(6.18) + "x more Arinium."
        },
        cost: new Decimal(1500),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          return player.Arin.Arinium.div(100).add(10).log10().pow(0.7);
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
      14: {
        title: "Chrono Bloom (AR 14)",
        description() {
          return "YooA age boosts Arinium gain. Increase base YooA age gain exponent by " + format(0.618, 3) + "."
        },
        cost: new Decimal(5e4),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let eff = gameLayers.YooAity.getEffectiveAge().sub(15e7).div(2e7).pow(1.2).pow10().add(1)
          eff = eff.pow(gameLayers.YooAity.getEffectiveAge().sub(649e6).div(5e5).pow(1.5).add(1))
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      15: {
        title: "Golden Ratio Ascension (AR 15)",
        description() {
          return "Arinium increases base YooA age gain exponent. Raise YE 23 to " + format(6.18) + ", YE 24 to " + format(1.618, 3) + ", and cube YMC 4 2nd effect."
        },
        cost: new Decimal(15e6),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          return player.Arin.Arinium.div(1e7).add(1).log10().pow(0.6)
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      16: {
        title: "Phi Multiplier (AR 16)",
        description() {
          return "Multiply Arinium gain and base YooA age gain by " + format(1.618, 3) + "."
        },
        cost(x = getUpgLevels("Arinium", 16)) {
          if (x.gte(31e10)) x = x.div(31e10).pow(1.2).mul(5e11).sub(19e10)
          return pow(2.5, x.pow(1.2)).mul(1e9);
        },
        invCost(x) {
          let cost = x.div(1e9).log(2.5).root(1.2)
          if (cost.gte(31e10)) cost = cost.add(19e10).div(5e11).root(1.2).mul(31e10)
          return cost;
        },
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          return pow(1.618, getUpgLevels("Arinium", 16))
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title: "Nexus Rhythm Amplifier (AR 21)",
        description() {
          return "YooAity Upgrade Autobuyer speed boosts Arinium gain."
        },
        cost: new Decimal(1e25),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let base = player.autobuyers.YooAity['YooAity Upgrades'].autoInterval.recip()
          return base.div(200).max(0).add(1).log10().dilate(2.2).add(1).pow(3)
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      22: {
        title: "Transcendent Pulseflow (AR 22)",
        description() {
          return "YooA Points and Transcension time boost Transcension gain. Dilate YMC 4 2nd effect to " + format(3) + "."
        },
        cost: new Decimal(1e50),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          const transTime = player.stats.YooAity.time
          const base = player.YooAPoints.add(10).log10().add(10).log10().dilate(3).pow(0.2)
          const time = transTime.min(5).mul(transTime.div(5).max(1).pow(0.6))
          let eff = base.mul(time).dilate(hasUpgrade("OMG", 32) ? 1.2 : 1)
          return eff
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      23: {
        title: "Ascension Spiral Bloom (AR 23)",
        description() {
          return "Ascensions boost Arinium gain. Raise YE 32 1st effect, SH 24, YB 24 to " + format(9.17) + "."
        },
        cost: new Decimal(1e58),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let eff = player.stats.YooAmatter.resets.div(1e50).add(1).pow(0.1)
          if (eff.gte(1e200)) eff = eff.log10().div(200).pow(0.4).mul(500).sub(300).pow10().div(1e200).pow(0.5).mul(2e200).sub(1e200)
          if (eff.gte("ee6")) eff = eff.log10().log10().div(6).pow(0.5).mul(6).pow10().pow10()
          if (eff.gte("e2.2222222e22")) eff = eff.log10().div(222.22222).pow(5).dilate(11).pow(2.2222222)
          return eff
        },
        effectDisplay() {
          let gain = this.effect()
          let dis = "x" + format(gain);
          if (gain.gte("e2.2222222e22")) dis += softcapText("(softcapped)<sup>2</sup>");
          else if (gain.gte(1e200)) dis += softcapText("(softcapped)");
          return dis
        },
      },
      24: {
        title: "Harmonic Radiance Convergence (AR 24)",
        description() {
          return "Arinium boosts Hyojung Point gain and add " + format(1) + " to HJ 11 exponent. Raise SH 24 to " + format(4) + " and YB 24 to " + format(2) + ", if you have at least " + formatWhole(100) + " Mimi Points."
        },
        cost: new Decimal(1e76),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          return player.Arin.Arinium.div(1e70).add(1).dilate(0.8).pow(0.2)
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      25: {
        title: "Mimi Resonance Overdrive (AR 25)",
        description() {
          return "Arinium boosts Mimi Point gain and add " + format(1) + " to HJ 11 exponent. Raise Arinium, Hyojung, Mimi 1st effs to " + format(2) + ", " + format(1.6) + ", " + format(15.01) + ", if you have at least " + formatWhole(1e6) + " Mimi Points."
        },
        cost: new Decimal(1e100),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          return player.Arin.Arinium.div(1e90).add(1).dilate(0.6).pow(0.15)
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      26: {
        title: "Duality of Eternal Echoes (AR 26)",
        description() {
          const base = this.base()
          return "YooArium and Arinium boost each other (^" + format(base[0]) + " YooArium, x" + format(base[1]) + " Arinium)."
        },
        cost(x = getUpgLevels("Arinium", 26)) {
          return pow(1e10, x.pow(1.5)).mul(1e300);
        },
        invCost(x) {
          let cost = x.div(1e300).log(1e10).root(1.5)
          return cost;
        },
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        base() {
          let eff1 = player.Arin.Arinium.add(10).log10().pow(2 * (hasUpgrade("Hyojung", 23) ? 1.728 ** 1.728 : 1))
          if (hasUpgrade("Mimi", 23)) eff1 = eff1.dilate(1.501)
          let eff2 = player.YooAmatter.YooArium.add(10).log10().add(10).log10()
          return [eff1, eff2]
        },
        effect() {
          const base = this.base()
          let eff1 = pow(base[0], getUpgLevels("Arinium", 26))
          let eff2 = pow(base[1], getUpgLevels("Arinium", 26))
          return [eff1, eff2]
        },
        effectDisplay() {
          const eff = this.effect()
          return "^" + format(eff[0]) + " YooArium, x" + format(eff[1]) + " Arinium";
        },
      },
    },
  },
  Hyojung: {
    unlocked: true,
    color: "#1e90ff",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 21)
      },
      rows: 3,
      cols: 4,
      11: {
        title: "Blooming Pulse (HJ 11)",
        description() {
          return "Gain " + format(this.base()) + " Hyojung Points per second."
        },
        cost(x = getUpgLevels("Hyojung", 11)) {
          let base = 3
          return pow(base, x.pow(1.25)).mul(1e18);
        },
        invCost(x) {
          let base = 3
          let cost = x.div(1e18).log(base).root(1.25)
          return cost;
        },
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        base() {
          return new Decimal(0.01)
        },
        effect() {
          let exp = dOne.add(upgradeEffect("Hyojung", 24))
          if (hasUpgrade("YooAity", 53)) exp = exp.add(2)
          if (hasUpgrade("Yubin", 24)) exp = exp.add(1)
          if (hasUpgrade("Arinium", 24)) exp = exp.add(1)
          if (hasUpgrade("Arinium", 25)) exp = exp.add(1)
          let lvl = getUpgLevels("Hyojung", 11)
          if (hasUpgrade("Mimi", 22)) lvl = lvl.mul(upgradeEffect("Mimi", 22))
          return this.base().mul(lvl.pow(exp));
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
      },
      12: {
        title: "Celestial Accord (HJ 12)",
        description() {
          return "Each YooA Dimension rank multiplies Hyojung Point gain by x" + format(1.01) + ". Raise effective ranks for harmonization costs to " + format(0.9) + "."
        },
        cost: new Decimal(10),
        maxLvl: dOne,
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        effect() {
          let ranks = dZero
          for (let i = 0; i < 5; i++) {
            ranks = ranks.add(player.dimensions.YooA[i].rank)
          }
          let eff = pow(1.01, ranks)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "Ethereal Weave (HJ 13)",
        description() {
          return "Raise YooA Dimension harmonization costs to " + format(this.base()) + " (raised to YD tier #<sup>" + format(1.2) + "</sup>) per square-rooted HJ 11 level per level."
        },
        cost(x = getUpgLevels("Hyojung", 13)) {
          if (x.gte(20)) x = x.div(20).pow(1.5).mul(30).sub(10)
          return pow(1.4, x.pow(1.3)).mul(300);
        },
        invCost(x) {
          let cost = x.div(300).log(1.4).root(1.3)
          if (cost.gte(20)) cost = cost.add(10).div(30).root(1.5).mul(20)
          return cost;
        },
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        base() {
          return new Decimal(0.98)
        },
        effect() {
          let effLog = this.base().log10().mul(getUpgLevels("Hyojung", 11).pow(0.5).mul(getUpgLevels("Hyojung", 13)))
          if (effLog.lte(-600)) effLog = effLog.div(-600).pow(0.5).mul(-400).sub(200)
          if (effLog.lte(-12e4)) effLog = effLog.div(-1.2).log10().mul(-24e3)
          return effLog.pow10();
        },
        effectDisplay() {
          const eff = this.effect()
          let dis = "^" + format(eff)
          if (eff.lte("e-12e4")) dis += softcapText("(softcapped)<sup>2</sup>");
          else if (eff.lte("e-600")) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      14: {
        title: "Radiant Petal Convergence (HJ 14)",
        description() {
          return "<span style = 'font-size:11px;'>Gain " + format(this.base()) + "x more Hyojung points per level (based on YooA Points). Raise Seunghee, Yubin, Arinium, Hyojung 1st effs to " + format(1.3) + ", " + format(1.6) + ", " + format(2) + ", " + format(3) + ". You must have HJ 13 Level " + formatWhole(8) + " to purchase this.</span>"
        },
        cost(x = getUpgLevels("Hyojung", 14)) {
          if (getUpgLevels("Hyojung", 13).lt(8)) return Decimal.dInf
          if (x.gte(13)) x = x.div(13).pow(1.5).mul(20).sub(7)
          return pow(1.728, x.pow(1.35)).mul(5e3);
        },
        invCost(x) {
          if (getUpgLevels("Hyojung", 13).lt(8)) return dZero
          let cost = x.div(5e3).log(1.728).root(1.35)
          if (cost.gte(13)) cost = cost.add(7).div(20).root(1.5).mul(13)
          return cost;
        },
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        base() {
          return player.YooAPoints.add(10).log10().add(10).log10().sub(80).max(0).div(4).pow(0.4)
        },
        effect() {
          return this.base().pow(getUpgLevels("Hyojung", 14));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title: "Harmonic Spark Ascension (HJ 21)",
        description() {
          return "Hyojung Points boost SH 11 and YB 11 effective levels. Remove YooAmatter Sparks 2nd effect softcap and unlock buy max YooA Dimension Rank and they cost nothing."
        },
        cost: new Decimal(3e19),
        maxLvl: dOne,
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        effect() {
          let eff = player.YooAity.HyojungPoints.add(1).pow(0.04)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      22: {
        title: "Luminous Resonance Expansion (HJ 22)",
        description() {
          return "Hyojung Points boost YooA Dimension multiplier per rank. Dilate effective Arinium, Hyojung, and Mimi Points in 1st effs to " + format(1.3) + "."
        },
        cost: new Decimal(1e189),
        maxLvl: dOne,
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        effect() {
          let eff = player.YooAity.HyojungPoints.add(10).log10().sub(200).max(0).div(100).add(1)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      23: {
        title: "Echoes of Eternal Harmony (HJ 23)",
        description() {
          return "Raise 'Duality of Eternal Echoes' (AR 26) 1st effect to " + format(1.728, 3) + "<sup>" + format(1.728, 3) + "</sup>. Dilate effective Arinium, Hyojung, and Mimi Points in 1st effects to " + format(1.1) + "."
        },
        cost: new Decimal("e493"),
        maxLvl: dOne,
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
      },
      24: {
        title() {
          const x = getUpgLevels("Hyojung", 24)
          return (x.gte(130) ? scaleText("Blooming", "blooming") + " " : "") + "Blooming Radiance Overlayer (HJ 24)"
        },
        description() {
          return "Increase 'Blooming Pulse' (HJ 11) level exponent by " + format(this.base()) + " (based on Hyojung Points)."
        },
        cost(x = getUpgLevels("Hyojung", 24)) {
          if (x.gte(130)) x = x.div(130).pow(2).mul(130)
          return pow(7281994, x.pow(1.728)).mul("e560");
        },
        invCost(x) {
          let cost = x.div("e560").log(7281994).root(1.728)
          if (cost.gte(130)) cost = cost.div(130).root(2).mul(130)
          return cost;
        },
        costCurrency: "Hyojung Points",
        costLayer: "YooAity",
        costInternal: "HyojungPoints",
        base() {
          return player.YooAity.HyojungPoints.add(10).log10().sub(500).max(0).div(50).pow(0.35)
        },
        effect() {
          return this.base().mul(getUpgLevels("Hyojung", 24));
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
    }
  },
  Mimi: {
    unlocked: true,
    color: "#ca3435",
    upgrades: {
      costsNothing() {
        return hasMilestone("YooAity", 21)
      },
      rows: 3,
      cols: 4,
      11: {
        title: "Melody Maker (MM 11)",
        description() {
          return "Gain " + format(this.base()) + " Mimi Points per second."
        },
        cost(x = getUpgLevels("Mimi", 11)) {
          let base = 4
          return pow(base, x.pow(1.25)).mul(1e84);
        },
        invCost(x) {
          let base = 4
          let cost = x.div(1e84).log(base).root(1.25)
          return cost;
        },
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        base() {
          return new Decimal(0.01)
        },
        effect() {
          let exp = dOne.add(upgradeEffect("Mimi", 24))
          return this.base().mul(getUpgLevels("Mimi", 11).pow(exp));
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
      },
      12: {
        title: "Harmony Boost (MM 12)",
        description() {
          return "Each MM 11 level boosts SH 11 and YB 11 effective levels by " + format(1.0501, 4) + "x. Gain " + format(5.01) + "x more Mimi Points."
        },
        cost: new Decimal(30),
        maxLvl: dOne,
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        effect() {
          let eff = pow(1.0501, getUpgLevels("Mimi", 11))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "Symphonic Surge (MM 13)",
        description() {
          return "Gain " + format(1.0501, 4) + "x more Mimi Points per square-rooted MM 11 level per level."
        },
        cost(x = getUpgLevels("Mimi", 13)) {
          if (x.gte(100)) x = x.div(100).pow(1.5).mul(150).sub(50)
          return pow(1.4, x.pow(1.45)).mul(1995);
        },
        invCost(x) {
          let cost = x.div(1995).log(1.4).root(1.45)
          if (cost.gte(100)) cost = cost.add(50).div(150).root(1.5).mul(100)
          return cost;
        },
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        effect() {
          let effLog = getUpgLevels("Mimi", 13).mul(getUpgLevels("Mimi", 11).pow(0.5)).mul(Math.log10(1.0501))
          if (effLog.gte(8e4)) effLog = effLog.div(8e4).pow(0.6).mul(5e4).add(3e4)
          return effLog.pow10();
        },
        effectDisplay() {
          const eff = this.effect()
          let dis = "x" + format(eff)
          if (eff.gte("e8e4")) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      14: {
        title: "Starlit Resonance (MM 14)",
        description() {
          return "<span style = 'font-size:11px;'>Gain " + format(this.base()) + "x more Mimi points per level (based on YooA Points). Raise Seunghee, Yubin, Arinium, Hyojung, Mimi 1st effs to " + format(1.3) + ", " + format(1.6) + ", " + format(2) + ", " + format(2.5) + ", " + format(2) + ".</span>"
        },
        cost(x = getUpgLevels("Mimi", 14)) {
          if (x.gte(20)) x = x.div(20).pow(1.5).mul(30).sub(10)
          return pow(1.501, x.pow(1.501)).mul(5.01e11);
        },
        invCost(x) {
          if (getUpgLevels("Mimi", 13).lt(8)) return dZero
          let cost = x.div(5.01e11).log(1.501).root(1.501)
          if (cost.gte(20)) cost = cost.add(10).div(30).root(1.5).mul(20)
          return cost;
        },
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        base() {
          let base = player.YooAPoints.add(10).log10().add(10).log10().sub(2000).max(0).div(40).pow(0.35).max(1)
          if (hasMilestone("YooAity", 21)) base = base.dilate(2)
          return base
        },
        effect() {
          return this.base().pow(getUpgLevels("Mimi", 14));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title: "Pulse of Precision (MM 21)",
        description() {
          return "Mimi Points boost Arinium 2nd effect. Dilate effective YooAity math problems in YE 32, SH 24, and YB 24 to " + format(2) + ", and unlock Seunghee and Yubin upgrades autobuyer."
        },
        cost: new Decimal(38e37),
        maxLvl: dOne,
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        effect() {
          let eff = player.YooAity.MimiPoints.add(10).log10().sub(20).max(0).pow(0.65).mul(2).add(1)
          return eff;
        },
        effectDisplay() {
          return "^" + format(this.effect());
        },
      },
      22: {
        title: "Echo Infusion (MM 22)",
        description() {
          return "Mimi Points boost HJ 11 effective levels. Dilate effective YooAity math problems in YE 32 to " + format(1.25) + "."
        },
        cost: new Decimal(1e186),
        maxLvl: dOne,
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        effect() {
          let effLog = player.YooAity.MimiPoints.div(1e180).add(1).log10().mul(0.01).pow(0.8)
          if (effLog.gte(50)) effLog = effLog.div(50).pow(0.4).mul(50)
          return effLog.pow10();
        },
        effectDisplay() {
          const eff = this.effect()
          let dis = "x" + format(eff)
          if (eff.gte(1e50)) dis += softcapText("(softcapped)");
          return dis;
        },
      },
      23: {
        title: "Duality Harmonics (MM 23)",
        description() {
          return "Dilate Duality of Eternal Echoes' (AR 26) 1st base to " + format(1.501, 3) + ". Dilate effective Arinium to " + format(1.1) + ", and Hyojung and Mimi Points to " + format(1.2) + " in 1st effects."
        },
        cost: new Decimal(1e303),
        maxLvl: dOne,
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
      },
      24: {
        title: "Melodic Amplifier (MM 24)",
        description() {
          return "Increase 'Melody Maker' (MM 11) level exponent by " + format(this.base()) + " (based on Mimi Points)."
        },
        cost(x = getUpgLevels("Mimi", 24)) {
          return pow(8.88e8, x.pow(1.75)).mul("8.88e888");
        },
        invCost(x) {
          let cost = x.div("8.88e888").log(8.88e8).root(1.75)
          return cost;
        },
        costCurrency: "Mimi Points",
        costLayer: "YooAity",
        costInternal: "MimiPoints",
        base() {
          return player.YooAity.MimiPoints.add(10).log10().sub(800).max(0).div(88).pow(0.35)
        },
        effect() {
          return this.base().mul(getUpgLevels("Mimi", 24));
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
    }
  },
  OMG: {
    unlocked: true,
    color: "#c500ed",
    getLevels(member, skill) {
      const sparkles = player.YooAity.OMGSparkles[member][skill]
      return Decimal.affordGeometricSeries(sparkles, new Decimal(100), new Decimal(1.25), Decimal.dZero)
      //return sparkles.max(0.001).div(100).log(1.2).floor().add(1).max(0)
    },//100 * 1.2^x
    getSparklesProgress(member, skill) {
      const sparkles = player.YooAity.OMGSparkles[member][skill]
      const level = this.getLevels(member, skill)
      return sparkles.sub(Decimal.sumGeometricSeries(level, new Decimal(100), new Decimal(1.25), dZero))
    },
    getSparklesGain(member, skill) {
      const alloc = player.YooAity.OMGLightAllocated[member][skill]
      let base = alloc.pow(0.4)
      let gain
      let vocalMult = {
        YooA: upgradeEffect("OMG", 16),
        Arin: upgradeEffect("OMG", 26),
        Seunghee: dOne,
        Yubin: dOne,
        Hyojung: dOne,
        Mimi: dOne,
      }
      let danceMult = {
        YooA: upgradeEffect("OMG", 26),
        Arin: new Decimal(0.1),
        Seunghee: new Decimal(0.1),
        Yubin: dOne,
        Hyojung: dOne,
        Mimi: dOne,
      }
      let charismaMult = {
        YooA: dOne,
        Arin: dOne,
        Seunghee: dOne,
        Yubin: dOne,
        Hyojung: dOne,
        Mimi: dOne,
      }
      switch (skill) {
        case "vocals":
          if (base.gte(1e130)) base = base.log10().div(130).pow(0.65).mul(200).sub(70).pow10()
          gain = base.mul(vocalMult[member])
          break;
        case "dance":
          base = base.div(1.25 ** 100).pow(0.1)
          if (base.gte(1e130)) base = base.log10().div(130).pow(0.65).mul(200).sub(70).pow10()
          gain = base.mul(danceMult[member])
          break;
        case "charisma":
          base = base.div(1.25 ** 1100).pow(0.01)
          if (base.gte(1e130)) base = base.log10().div(130).pow(0.65).mul(200).sub(70).pow10()
          gain = base.mul(charismaMult[member])
          break;
      }
      return gain
    },
    getLevelReq(member, skill) {
      const level = this.getLevels(member, skill)
      return pow(1.25, level).mul(100)
    },
    getSkillEffect(member, skill) {
      const level = this.getLevels(member, skill)
      let age = gameLayers.YooAity.getEffectiveAge()
      if (age.gte(8150 * 86400 + 19e6)) age = age.pow(age.sub(8150 * 86400 + 19e6).div(1e7).add(1).pow(0.5))
      let BaseDanceExp = age.sub(8150 * 86400).div(100).pow(0.5).add(1)
      if (BaseDanceExp.gte(5)) BaseDanceExp = BaseDanceExp.mul(5).pow(0.5).add(25).div(6)
      let DanceExp = BaseDanceExp.mul(level)
      let eff;
      switch (member) {
        case "YooA":
          eff = {
            vocals: pow(player.YooAPoints.add(10).log10().dilate(0.8), level),
            dance: age.sub(648e6).dilate(0.75).add(1).pow(DanceExp.mul(0.3).mul(BaseDanceExp.sub(6).max(1).pow(7))),
            charisma: level
          };
          break;
        case "Arin":
          eff = {
            vocals: player.Arin.Arinium.add(10).log10().add(10).log10().pow(0.7).div(100).mul(level).add(1),
            dance: DanceExp.min(1600).add(DanceExp.sub(1600).max(0).pow(0.75)),
            charisma: level.pow(1.3).mul(5).floor()
          };
          break;
        case "Seunghee":
          eff = {
            vocals: player.YooAity.SeungheePoints.add(10).log10().add(10).log10().pow(0.7).div(100).mul(level.pow(2)).add(1),
            dance: pow(1.03, gameLayers.YooAity.getEffectiveAge().sub(8394 * 86400).div(100).pow(0.4).add(1).mul(level)),
            charisma: level,
          };
          break;
      }
      return eff[skill]
    },
    getSkillDesc(member, skill) {
      const mem = member === "Arin" ? "Arinium" : member
      const eff = colorText("h3", gameLayers[mem].color, format(this.getSkillEffect(member, skill)))
      let dis;
      switch (member) {
        case "YooA":
          dis = {
            vocals: "^" + eff + " YooA Points (based on YooA Points)",
            dance: "x" + eff + " YooA Dimension rank multiplier (based on YooA age)",
            charisma: "+" + eff + " MIRACLEs"
          };
          break;
        case "Arin":
          dis = {
            vocals: "^" + eff + " Arinium (based on Arinium)",
            dance: "+" + eff + "% stronger Arin Tiers (based on YooA age)",
            charisma: "+" + eff + " MIRACLEs"
          };
          break;
        case "Seunghee":
          dis = {
            vocals: "^" + eff + " effective Seunghee Points (based on Seunghee Points)",
            dance: "x" + eff + " Fan Hearts (based on YooA age) - NEXT UPDATE",
            charisma: "+" + eff + " MIRACLEs"
          };
          break;
      }
      return dis[skill]
    },
    getMIRACLEs() {
      return this.getSkillEffect("YooA", "charisma").add(this.getSkillEffect("Arin", "charisma"))
    },
    getMemberLightGainMult(member) {
      let mult = this.getMIRACLEEffect()[0]
      switch (member) {
        case "YooA":
          mult = mult.mul(upgradeEffect("OMG", 14)[1]).mul(upgradeEffect("OMG", 15))
          if (hasUpgrade("OMG", 12)) mult = mult.mul(upgradeEffect("OMG", 12))
          if (hasUpgrade("OMG", 23)) mult = mult.mul(upgradeEffect("OMG", 23))
          if (hasUpgrade("OMG", 33)) mult = mult.mul(upgradeEffect("OMG", 33))
          if (hasUpgrade("YooAmatter", 25)) mult = mult.mul(upgradeEffect("YooAmatter", 25)[1])
          if (hasUpgrade("YooAmatter", 35)) mult = mult.mul(upgradeEffect("YooAmatter", 35)[0])
          break;
        case "Arin":
          mult = mult.mul(upgradeEffect("OMG", 24)).mul(upgradeEffect("OMG", 25))
          if (hasUpgrade("OMG", 22)) mult = mult.mul(upgradeEffect("OMG", 22))
          if (hasUpgrade("OMG", 33)) mult = mult.mul(upgradeEffect("OMG", 33))
          if (hasUpgrade("YooAmatter", 25)) mult = mult.mul(upgradeEffect("YooAmatter", 25)[2])
          if (hasMilestone("YooAity", 28)) mult = mult.mul(milestoneEffect("YooAity", 28)[1])
          if (hasUpgrade("YooAmatter", 35)) mult = mult.mul(upgradeEffect("YooAmatter", 35)[1])
          break;
        case "Seunghee":
          //mult = mult
          if (hasUpgrade("OMG", 32)) mult = mult.mul(upgradeEffect("OMG", 32))
          if (hasUpgrade("YooAmatter", 15)) mult = mult.mul(10)
          if (hasMilestone("YooAity", 28)) mult = mult.mul(milestoneEffect("YooAity", 28)[0])
          if (hasUpgrade("YooAmatter", 35)) mult = mult.mul(upgradeEffect("YooAmatter", 35)[2])
          break;
      }
      return mult
    },
    getMiracleLightGain() {
      const lights = player.YooAity.OMGLight
      const lightExp = this.getMIRACLEEffect()[1]
      let dil = 0.7
      if (hasMilestone("YooAity", 21)) dil += 0.1
      let gain = lights.YooA.dilate(dil).pow(lightExp.div(2)).div(10).mul(upgradeEffect("OMG", 14)[1]).mul(upgradeEffect("YooA", 43))
        .mul(lights.Arin.dilate(dil * 1.2).add(1).pow(lightExp))
        .mul(lights.Seunghee.dilate(dil * 1.4).add(1).pow(lightExp.mul(10)))
        .mul(getArinTierEffect()[0])
      if (hasUpgrade("OMG", 12)) gain = gain.mul(4.2015)
      if (hasUpgrade("OMG", 13)) gain = gain.mul(upgradeEffect("OMG", 13))
      if (hasMilestone("YooAity", 25)) gain = gain.mul(milestoneEffect("YooAity", 25))
      if (hasUpgrade("Seunghee", 32)) gain = gain.mul(upgradeEffect("Seunghee", 32))
      return gain
    },
    getMiracleLightExp() {
      const lights = player.YooAity.OMGLight
      let exp2 = dOne
      if (hasUpgrade("OMG", 24)) exp2 = exp2.mul(1.1)
      if (hasMilestone("YooAity", 27)) exp2 = exp2.mul(milestoneEffect("YooAity", 27))

      let exp = lights.YooA.add(1).log10().pow(0.35)
        .mul(lights.Arin.add(1).log10().pow(0.4).div(10).add(1))
        .mul(lights.Seunghee.add(1).log10().pow(0.45).div(10).add(1))
        .pow(exp2)
      
      return exp
    },
    getMiracleLightEffect() {
      const x = player.YooAity.MiracleLight
      const exp = this.getMiracleLightExp()
      let exp1 = exp.pow(hasMilestone("YooAity", 27) ? 3 : 1)
      if (hasUpgrade("OMG", 16)) exp1 = exp1.mul(4.2015)
      if (hasUpgrade("OMG", 26)) exp1 = exp1.mul(42015)
      let eff = x.add(1).pow(exp1)
      let eff2 = x.add(10).log10().pow(exp.mul(0.75))
      return [eff, eff2]
    },
    getMIRACLEEffect() {
      let x = this.getMIRACLEs()
      if (x.gte(5)) x = x.div(5).pow(0.5).mul(10).sub(5)
      let eff = pow(6, x)
      if (eff.gte(1e75)) eff = eff.log10().div(75).pow(0.8).mul(20).add(55).pow10()
      let eff2 = x.pow(0.5).div(20).add(1)
      return [eff, eff2]
    },
    allocateAllLight(member, skill, light) {
      player.YooAity.OMGLightAllocated[member][skill] = player.YooAity.OMGLightAllocated[member][skill].add(light)
      player.YooAity.OMGLight[member] = dZero
    },
    upgrades: {
      costsNothing() {
        return false
      },
      rows: 6,
      cols: 6,
      11: {
        title: "YooA's Light (OMG 11)",
        description() {
          return "Gain YooA Light (based on YooA Points)."
        },
        cost: new Decimal("ee55000"),
        maxLvl: dOne,
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          let eff = player.YooAPoints.add(10).log(10).add(10).log(10).sub(55000).div(1e5).max(0)
          eff = eff.mul(gameLayers.OMG.getMemberLightGainMult("YooA"))
          return eff;
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
      },
      12: {
        title: "Shi-ah Radiance Bloom (OMG 12)",
        description() {
          return "Gain more YooA Light (based on YooA Points). Dilate YMC 4 2nd effect to " + format(1.2) + " and gain " + format(4.2015, 4) + "x more Miracle Light."
        },
        cost: new Decimal("ee71000"),
        maxLvl: dOne,
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          let eff = player.YooAPoints.add(10).log(10).add(10).log(10).sub(71000).div(1e4).max(0).add(1).dilate(1.4)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      13: {
        title: "YooA Vocals Crescendo (OMG 13)",
        description() {
          return "Each YooA Vocals level boosts Miracle Light by " + format(1.1) + ". Dilate Shi-ah Ember 1st effect to " + format(3) + " and effective YooAity math problems in YE 32, SH 24, and YB 24 to " + format(1.2) + "."
        },
        cost: new Decimal("ee90000"),
        maxLvl: dOne,
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          let eff = pow(1.1, gameLayers.OMG.getLevels("YooA", "vocals"))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      14: {
        title() {
          const start = this.start()
          return (getUpgLevels("OMG", 14).gte(start) ? scaleText("Blooming", "blooming") + " " : "") + "Miracle Harmony Infusion (OMG 14)"
        },
        start() {
          let start = new Decimal(65)
          if (hasUpgrade("YooAmatter", 35)) start = start.add(35)
          return start;
        },
        description() {
          const [baseEff, baseEff2] = this.base(); // Cache base values
          return `<span style="font-size: 11px;">Gain ${format(baseEff)}x YooAity math problems (based on Miracle Light), and ${format(baseEff2)}x Miracle and YooA Lights (based on YooAity math problems).</span>`;
        },
        cost(x = getUpgLevels("OMG", 14)) {
          const start = gameLayers.OMG.upgrades[14].start()
          if (x.gte(start)) x = x.sub(start).pow(2).add(start)
          if (x.gte(15)) {
            x = x.div(15).pow(1.1).mul(20).sub(5); // Simplify and cache intermediate results
          }
          return pow(6, x.pow(1.6)).mul(5e4);
        },
        invCost(x) {
          const start = gameLayers.OMG.upgrades[14].start()
          let cost = x.div(5e4).log(6).root(1.6); // Cache intermediate results
          if (cost.gte(15)) {
            cost = cost.add(5).div(20).root(1.1).mul(15);
          }
          if (cost.gte(start)) cost = cost.sub(start).pow(0.5).add(start)
          return cost;
        },
        costCurrency: "Miracle Light",
        costLayer: "YooAity",
        costInternal: "MiracleLight",
        base() {
          // Cache player values to avoid repeated access
          const miracleLight = player.YooAity.MiracleLight.add(1);
          const mathSolved = gameLayers.YooAity.getEffectiveProblems().add(1);

          // Optimize calculations
          const eff = miracleLight.dilate(0.5).pow(0.2);
          let eff2 = mathSolved.dilate(0.8).pow(0.1);

          // Apply logarithmic adjustment only if necessary
          if (eff2.gte(1e3)) {
            eff2 = eff2.log10().div(3).pow(0.7).mul(2).add(1).pow10();
          }
          if (eff2.gte(3e4)) {
            eff2 = eff2.div(3).log10().div(4).pow(0.7).mul(2).add(2).pow10().mul(3);
          }

          return [eff, eff2];
        },
        effect() {
          const [baseEff, baseEff2] = this.base(); // Cache base values
          const level = getUpgLevels("OMG", 14); // Cache level value

          // Optimize power calculations
          const eff = baseEff.pow(level);
          const eff2 = baseEff2.pow(level);

          return [eff, eff2];
        },
        effectDisplay() {
          const eff = this.effect()
          return "x" + format(eff[0]) + " math problems, x" + format(eff[1]) + " Lights";
        },
      },
      15: {
        title: "Sparkle-Tuned Resonance (OMG 15)",
        description() {
          const base = this.base()
          return "Gain " + format(base) + "x YooA Light (based on Allocated YooA Light). Raise effective ranks for harmonization costs to " + format(0.99) + "."
        },
        cost(x = getUpgLevels("OMG", 15)) {
          if (x.gte(15)) x = x.div(15).pow(1.15).mul(23).sub(8)
          return pow(6, x.pow(1.6)).mul(4202015);
        },
        invCost(x) {
          let cost = x.div(4202015).log(6).root(1.6)
          if (cost.gte(15)) cost = cost.add(8).div(23).root(1.15).mul(15)
          return cost;
        },
        costCurrency: "Miracle Light",
        costLayer: "YooAity",
        costInternal: "MiracleLight",
        base() {
          const YooALight = player.YooAity.OMGLightAllocated.YooA
          let eff = YooALight.vocals.add(1).mul(YooALight.dance.div(1e16).add(1)).mul(YooALight.charisma.div(1e245).add(1)).dilate(0.5).pow(0.2)
          if (eff.gte(5e4)) eff = eff.mul(2).log10().div(5).pow(0.75).mul(2).add(3).pow10().div(2)
          return eff;
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("OMG", 15))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      16: {
        title: "Vocal Stardust Overflow (OMG 16)",
        description() {
          const base = this.base()
          return "Gain " + format(base) + "x YooA Vocal Sparkles (based on YooA Points). Raise effective ranks for harmonization costs to " + format(0.98) + " and Miracle Light 1st eff to " + format(4.2015, 4) + "."
        },
        cost(x = getUpgLevels("OMG", 16)) {
          return pow(7, x.pow(1.6)).mul(5e10);
        },
        invCost(x) {
          let cost = x.div(5e10).log(7).root(1.6)
          return cost;
        },
        costCurrency: "YooA Light",
        costLayer: "YooAity",
        costInternal: "OMGLight.YooA",
        base() {
          let eff = player.YooAPoints.add(10).log10().add(10).log10().add(10).log10()
          return eff;
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("OMG", 16))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      21: {
        title: "Arin's Light (OMG 21)",
        description() {
          return "Gain Arin Light (based on Arinium)."
        },
        cost: new Decimal("e305e6"),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let eff = player.Arin.Arinium.add(10).log(10).sub(303e6).div(1e9).max(0)
          eff = eff.mul(gameLayers.OMG.getMemberLightGainMult("Arin"))
          return eff;
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
        unlocked() {
          return hasMilestone("YooAity", 24)
        }
      },
      22: {
        title: "Arin's Dreamshine Surge (OMG 22)",
        description() {
          return "Gain more Arin Light (based on YooA Points). Dilate YMC 4 2nd effect to " + format(1.2) + " and gain " + format(4.2015, 4) + "x more Miracle Light."
        },
        cost: new Decimal("e2e9"),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let eff = player.YooAPoints.add(10).log(10).add(10).log(10).sub(14e8).div(1e9).max(0).add(1).dilate(1.3).pow(0.7)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
        unlocked() {
          return hasMilestone("YooAity", 24)
        }
      },
      23: {
        title: "Arin-YooA Light Convergence (OMG 23)",
        description() {
          return "Arin Light boosts YooA Light gain. Unlock a row of YooA Upgrades."
        },
        cost: new Decimal("e725e7"),
        maxLvl: dOne,
        costCurrency: "Arinium",
        costLayer: "Arin",
        costInternal: "Arinium",
        effect() {
          let eff = player.YooAity.OMGLight.Arin.add(1).pow(0.7 * (hasUpgrade("OMG", 33) ? 1.5 : 1))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
        unlocked() {
          return hasMilestone("YooAity", 24)
        }
      },
      24: {
        title: "Arin's Dance Radiance (OMG 24)",
        description() {
          const base = this.base()
          return "Gain " + format(base) + "x Arin Light (based on YooA Dance level). Trilate YMC 4 2nd effect to " + format(1.0618, 4) + " and raise Miracle Light exponent to " + format(1.1) + "."
        },
        cost(x = getUpgLevels("OMG", 24)) {
          if (x.gte(50)) {
            x = x.div(50).pow(1.15).mul(70).sub(20); // Simplify and cache intermediate results
          }
          if (x.gte(5)) {
            x = x.div(5).pow(1.15).mul(7).sub(2); // Simplify and cache intermediate results
          }
          return pow(1e4, x.pow(1.6)).mul(2.07e207);
        },
        invCost(x) {
          let cost = x.div(2.07e207).log(1e4).root(1.6)
          if (cost.gte(5)) {
            cost = cost.add(2).div(7).root(1.15).mul(5);
          }
          if (cost.gte(50)) {
            cost = cost.add(20).div(70).root(1.15).mul(50);
          }
          return cost;
        },
        costCurrency: "Miracle Light",
        costLayer: "YooAity",
        costInternal: "MiracleLight",
        base() {
          const level = gameLayers.OMG.getLevels("YooA", "dance")
          let effLog = level.pow(0.85).mul(Math.log10(1.05))
          if (effLog.gte(4)) effLog = effLog.div(4).pow(0.6).mul(2).add(2)
          return effLog.pow10();
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("OMG", 24))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      25: {
        title: "Arin's Allocated Brilliance (OMG 25)",
        description() {
          const base = this.base()
          return "Gain " + format(base) + "x Arin Light (based on Allocated Arin Light). Raise effective ranks for harmonization costs to " + format(0.95) + "."
        },
        cost(x = getUpgLevels("OMG", 25)) {
          if (x.gte(40)) x = x.div(40).pow(1.15).mul(60).sub(20)
          if (x.gte(4)) x = x.div(4).pow(1.15).mul(6).sub(2)
          return pow(1e6, x.pow(1.6)).mul(2.27e227);
        },
        invCost(x) {
          let cost = x.div(2.27e227).log(1e6).root(1.6)
          if (cost.gte(4)) cost = cost.add(2).div(6).root(1.15).mul(4)
          if (cost.gte(40)) cost = cost.add(20).div(6).root(1.15).mul(40)
          return cost;
        },
        costCurrency: "Miracle Light",
        costLayer: "YooAity",
        costInternal: "MiracleLight",
        base() {
          const ArinLight = player.YooAity.OMGLightAllocated.Arin
          let effLog = ArinLight.vocals.add(1).mul(ArinLight.dance.div(1e28).add(1)).mul(ArinLight.charisma.div(1e270).add(1)).log10().pow(0.5).mul(0.2)
          if (effLog.gte(6)) effLog = effLog.div(6).pow(0.75).mul(2).add(4)
          return effLog.pow10();
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("OMG", 25))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      26: {
        title: "Arin-Mimi Spark Fusion (OMG 26)",
        description() {
          const base = this.base()
          return "<span style='font-size: 11px;'>Gain " + format(base) + "x Arin Vocal and YooA Dance Sparkles (based on Arinium). Raise effective ranks for harmonization costs to " + format(0.9) + " and Miracle Light 1st eff to " + format(42015) + ". Dilate effective Mimi Points in 1st eff to " + format(1.25) + ".</span>"
        },
        cost(x = getUpgLevels("OMG", 26)) {
          return pow(20, x.pow(1.65)).mul(1e78);
        },
        invCost(x) {
          let cost = x.div(1e78).log(20).root(1.65)
          return cost;
        },
        costCurrency: "Arin Light",
        costLayer: "YooAity",
        costInternal: "OMGLight.Arin",
        base() {
          let eff = player.Arin.Arinium.add(10).log10().add(10).log10()
          return eff;
        },
        effect() {
          let eff = this.base().pow(getUpgLevels("OMG", 26))
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      31: {
        title: "Seunghee's Light (OMG 31)",
        description() {
          return "Gain Seunghee Light (based on Seunghee Points). Allocate " + format(1) + "% YooA Light to all skills per second without cost."
        },
        cost: new Decimal("e7.77777e50"),
        maxLvl: dOne,
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        effect() {
          let eff = player.YooAity.SeungheePoints.add(10).log(10).sub(5e50).pow(0.3).div(1e93).max(0)
          eff = eff.mul(gameLayers.OMG.getMemberLightGainMult("Seunghee"))//.mul(player.YooAity.OMGLight.Seunghee.add(1).pow(0.97))
          return eff;
        },
        effectDisplay() {
          return format(this.effect()) + "/s";
        },
        unlocked() {
          return hasMilestone("YooAity", 27)
        }
      },
      32: {
        title: "Seunghee Radiance Bloom (OMG 32)",
        description() {
          return "Gain more Seunghee Light (based on YooA Points). Dilate AR 12 effect to " + format(4.2015, 4) + " and AR 22 effect to " + format(1.2) + " and raise YooAity milestone 25 effect to " + format(10) + "."
        },
        cost: new Decimal("e225e51"),
        maxLvl: dOne,
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        effect() {
          let eff = player.YooAPoints.add(10).log(10).add(10).log(10).sub(9e22).div(1e23).max(0).add(1).dilate(1.2).pow(0.5)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
        unlocked() {
          return hasMilestone("YooAity", 27)
        }
      },
      33: {
        title: "Seunghee Light Convergence (OMG 33)",
        description() {
          return "Seunghee Light boosts YooA and Arin Light gain. Raise OMG 23 effect to " + format(1.5) + ". Unlock a row of Spark Upgrades (NEXT UPDATE) and a column of YooAmatter upgrades."
        },
        cost: new Decimal("e14e55"),
        maxLvl: dOne,
        costCurrency: "Seunghee Points",
        costLayer: "YooAity",
        costInternal: "SeungheePoints",
        effect() {
          let eff = player.YooAity.OMGLight.Seunghee.add(1).pow(3)
          return eff;
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
        unlocked() {
          return hasMilestone("YooAity", 27)
        }
      },
    }
  }
}

export const achievements = {
  11: {
    title: "First Step",
    img: require("@/assets/Achievements/ach11.png"),
    description() {
      return "Get " + formatWhole(1) + " YooA Point."
    },
    done() {
      return player.stats.General.totalPoints.gte(1)
    }
  },
  12: {
    title: "Math Whiz",
    img: require("@/assets/Achievements/ach12.jpg"),
    description() {
      return "Solve " + formatWhole(100) + " math problems."
    },
    done() {
      return player.stats.General.totalSolved.gte(100)
    }
  },
  13: {
    title: "Starting Small",
    img: require("@/assets/Achievements/ach13.png"),
    description() {
      return "Buy " + formatWhole(1) + " YooA Line."
    },
    done() {
      return player.dimensions.YooA[0].level.gte(1)
    }
  },
  14: {
    title: "Taking Off",
    img: require("@/assets/Achievements/ach14.png"),
    description() {
      return "Buy " + formatWhole(1) + " YooA Plane."
    },
    done() {
      return player.dimensions.YooA[1].level.gte(1)
    }
  },
  15: {
    title: "YooA Millionaire",
    img: require("@/assets/Achievements/ach15.jpg"),
    description() {
      return "Have " + formatWhole(1e6) + " YooA Points."
    },
    rewardDescription() {
      return "Gain " + format(2) + "% more YooA Points."
    },
    rewardEffect() {
      return new Decimal(1.02)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.YooAPoints.gte(1e6)
    }
  },
  16: {
    title: "YooA Billionaire",
    img: require("@/assets/Achievements/ach16.jpg"),
    description() {
      return "Have " + format(1e9) + " YooA Points."
    },
    rewardDescription() {
      return "Gain " + format(3) + "% more YooA Points."
    },
    rewardEffect() {
      return new Decimal(1.03)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.YooAPoints.gte(1e9)
    }
  },
  17: {
    title: "Math Genius",
    img: require("@/assets/Achievements/ach17.jpg"),
    description() {
      return "Solve " + formatWhole(500) + " math problems."
    },
    done() {
      return player.stats.General.totalSolved.gte(500)
    }
  },
  18: {
    title: "A Matter of YooA",
    img: require("@/assets/Achievements/ach18.jpg"),
    description() {
      return "Get " + formatWhole(1) + " YooAmatter."
    },
    rewardDescription() {
      return "All YooA Dimensions are " + format(3) + "% stronger and unlock more YooA Dimensions."
    },
    rewardEffect() {
      return new Decimal(1.03)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.stats.YooAmatter.totalAmount.gte(1)
    }
  },
  21: {
    title: "Blast Off",
    img: require("@/assets/Achievements/ach21.jpg"),
    description() {
      return "Buy " + formatWhole(1) + " YooA Space."
    },
    done() {
      return player.dimensions.YooA[2].level.gte(1)
    }
  },
  22: {
    title: "Universal YooA",
    img: require("@/assets/Achievements/ach22.jpg"),
    description() {
      return "Have " + format(1e20) + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte(1e20)
    }
  },
  23: {
    title: "YooA Master",
    img: require("@/assets/Achievements/ach23.jpg"),
    description() {
      return "Have " + format(1e12) + " YooA Points without 'YooA Challenge' (YU 11)."
    },
    rewardDescription() {
      return "All YooA Dimensions are " + format(5) + "% stronger and unlock buy max YooA Dimensions."
    },
    rewardEffect() {
      return new Decimal(1.05)
    },
    rewardEffDesc() {
      return "x" + this.rewardEffect()
    },
    done() {
      return player.YooAPoints.gte(1e12) && getUpgLevels("YooA", 11).eq(0)
    }
  },
  24: {
    title: "Realm of YooA",
    img: require("@/assets/Achievements/ach24.jpg"),
    description() {
      return "Buy " + formatWhole(1) + " YooA Realm."
    },
    done() {
      return player.dimensions.YooA[3].level.gte(1)
    }
  },
  25: {
    title: "YooA Supreme",
    img: require("@/assets/Achievements/ach25.jpg"),
    description() {
      return "Have " + format(1e100) + " YooA Points."
    },
    rewardDescription() {
      return "All YooA Dimensions are " + format(5) + "% stronger."
    },
    rewardEffect() {
      return new Decimal(1.05)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.YooAPoints.gte(1e100)
    }
  },
  26: {
    title: "YooA Entity Awakens",
    img: require("@/assets/Achievements/ach26.jpg"),
    description() {
      return "Buy " + formatWhole(1) + " YooA Entity."
    },
    done() {
      return player.dimensions.YooA[4].level.gte(1)
    }
  },
  27: {
    title: "YooAmatter Overload",
    img: require("@/assets/Achievements/ach27.jpg"),
    description() {
      return "Get " + format(1e24) + " YooAmatter."
    },
    rewardDescription() {
      return "Unlock buy max YooA upgrades and Max All YooA Lines and YooA Planes."
    },
    done() {
      return player.stats.YooAmatter.totalAmount.gte(1e24)
    }
  },
  28: {
    title: "Infinity Unbound",
    img: require("@/assets/Achievements/ach28.jpg"),
    description() {
      return "Have " + format(Decimal.dNumberMax) + " YooA Points."
    },
    rewardDescription() {
      return "Achievement multiplier boosts YooA Dimensions."
    },
    done() {
      return player.YooAPoints.gte(Decimal.dNumberMax)
    }
  },
  31: {
    title: "A Glimmer of YooArium",
    img: require("@/assets/Achievements/ach31.jpg"),
    description() {
      return "Get " + formatWhole(1) + " YooArium."
    },
    done() {
      return player.stats.YooAmatter.totalYooArium.gte(1)
    }
  },
  32: {
    title: "Master of YooAmatter",
    img: require("@/assets/Achievements/ach32.jpg"),
    description() {
      return "Complete a YooAmatter challenge."
    },
    rewardDescription() {
      return "All YooA Dimensions are " + format(10) + "% stronger and gain " + format(10) + "% more YooAmatter."
    },
    rewardEffect() {
      return new Decimal(1.1)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return Object.keys(player.challenges.YooAmatter).length >= 1
    }
  },
  33: {
    title: "Arin's Ascension",
    img: require("@/assets/Achievements/ach33.jpg"),
    description() {
      return "Upgrade Arin to level " + formatWhole(3) + "."
    },
    done() {
      return player.Arin.level.gte(3)
    }
  },
  34: {
    title: "YooAmatter Conqueror",
    img: require("@/assets/Achievements/ach34.jpg"),
    description() {
      return "Complete " + formatWhole(3) + " YooAmatter challenges."
    },
    done() {
      return Object.keys(player.challenges.YooAmatter).length >= 3
    }
  },
  35: {
    title: "Math Mastermind",
    img: require("@/assets/Achievements/ach35.jpg"),
    description() {
      return "Solve " + formatWhole(1e6) + " math problems."
    },
    rewardDescription() {
      return "Total math problems boost YooAmatter gain."
    },
    rewardEffect() {
      return player.stats.General.totalSolved.add(1).log10().pow(0.3).div(10).add(1)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.stats.General.totalSolved.gte(1e6)
    }
  },
  36: {
    title: "YooA Transcendence",
    img: require("@/assets/Achievements/ach36.png"),
    description() {
      return "Have " + format("e1000") + " YooA Points."
    },
    rewardDescription() {
      return "YooA Points boost all YooA Dimensions."
    },
    rewardEffect() {
      return player.YooAPoints.add(1).pow(0.0001)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.YooAPoints.gte("e1000")
    }
  },
  37: {
    title: "Arin's Evolution",
    img: require("@/assets/Achievements/ach37.jpeg"),
    description() {
      return "Upgrade Arin to level " + formatWhole(10) + "."
    },
    done() {
      return player.Arin.level.gte(10)
    }
  },
  38: {
    title: "YooA's Ultimate Trial",
    img: require("@/assets/Achievements/ach38.jpg"),
    description() {
      return "Have " + format("1.11e1111") + " YooA Points in 'YooA's Logical Labyrinth' (YMC 2) without 'YooA Simplifier' (YU 14)."
    },
    rewardDescription() {
      return "Achievement multiplier boosts YooA math problems."
    },
    done() {
      return player.YooAPoints.gte("1.11e1111") && inChallenge("YooAmatter", 2) && !hasUpgrade("YooA", 14)
    }
  },
  41: {
    title: "The Spark of Potential",
    img: require("@/assets/Achievements/ach41.webp"),
    description() {
      return "Get " + formatWhole(1) + " YooAmatter Spark."
    },
    rewardDescription() {
      return "Achievement multiplier boosts YooArium, and remove 'YooA Booster' (YU 24) max level."
    },
    done() {
      return player.stats.YooAmatter.totalSparks.gte(1)
    }
  },
  42: {
    title: "YooAnscendental",
    img: require("@/assets/Achievements/ach42.webp"),
    description() {
      return "Have " + format("ee4") + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte("ee4")
    }
  },
  43: {
    title: "Beyond the Fabric of Reality",
    img: require("@/assets/Achievements/ach43.jpg"),
    description() {
      return "Have " + format(Decimal.dNumberMax) + " YooAmatter."
    },
    rewardDescription() {
      return "YooAmatter boosts YooAmatter Formations."
    },
    rewardEffect() {
      return player.YooAmatter.amount.add(1).pow(0.0001)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.YooAmatter.amount.gte(Decimal.dNumberMax)
    }
  },
  44: {
    title: "The Infinite Theorem",
    img: require("@/assets/Achievements/ach44.jpg"),
    description() {
      return "Solve " + format(1e100) + " math problems."
    },
    rewardDescription() {
      return "YooA math problems boost YooAmatter math problem gain."
    },
    rewardEffect() {
      return player.math.YooA.solved.add(1).log10().pow(0.25).div(20).add(1)
    },
    rewardEffDesc() {
      return "x" + format(this.rewardEffect())
    },
    done() {
      return player.stats.General.totalSolved.gte(1e100)
    }
  },
  45: {
    title: "Power Unleashed",
    img: require("@/assets/Achievements/ach45.jpg"),
    description() {
      return "Buy 'Dimensional Amplification' (YS 11)."
    },
    done() {
      return hasUpgrade("sparks", 11)
    }
  },
  46: {
    title: "Beyond Reality",
    img: require("@/assets/Achievements/ach46.jpg"),
    description() {
      return "Have " + format("ee5") + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte("ee5")
    }
  },
  47: {
    title: "YooA's Logical Conqueror",
    img: require("@/assets/Achievements/ach47.png"),
    description() {
      return "Have " + format("e7e4") + " YooA Points in 'YooA's Logical Labyrinth' (YMC 2) with at least Level " + formatWhole(100) + " 'YooA Challenge' (YU 11)."
    },
    rewardDescription() {
      return "Achievement multiplier boosts YooAmatter Formations."
    },
    done() {
      return player.YooAPoints.gte("e7e4") && inChallenge("YooAmatter", 2) && getUpgLevels("YooA", 11).gte(100)
    }
  },
  48: {
    title: "Arin's Ultimate Evolution",
    img: require("@/assets/Achievements/ach48.jpeg"),
    description() {
      return "Upgrade Arin to level " + formatWhole(350) + "."
    },
    done() {
      return player.Arin.level.gte(350)
    }
  },
  51: {
    title: "Ethereal Transcendence",
    img: require("@/assets/Achievements/ach51.jpg"),
    description() {
      return "Get " + formatWhole(1) + " YooA Essence."
    },
    done() {
      return player.stats.YooAity.totalAmount.gte(1)
    }
  },
  52: {
    title: "YooA Singularity",
    img: require("@/assets/Achievements/ach52.jpg"),
    description() {
      return "Have " + format("ee6") + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte("ee6")
    }
  },
  53: {
    title: "Swift Transcendence",
    img: require("@/assets/Achievements/ach53.jpg"),
    description() {
      return "Transcend in under " + formatWhole(10) + " minutes."
    },
    rewardDescription() {
      return "Unlock buy max Spark Upgrades."
    },
    done() {
      return player.stats.YooAity.bestTime.lt(600)
    }
  },
  54: {
    title: "Harmonic Initiation",
    img: require("@/assets/Achievements/ach54.jpg"),
    description() {
      return "Harmonize Arin to Rank " + formatWhole(1) + "."
    },
    done() {
      return player.Arin.rank.gte(1)
    }
  },
  55: {
    title: "Cosmic Crescendo",
    img: require("@/assets/Achievements/ach55.jpg"),
    description() {
      return "Have " + format("ee12") + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte("ee12")
    }
  },
  56: {
    title: "Shi-ah's First Miracle",
    img: require("@/assets/Achievements/ach56.jpg"),
    description() {
      return "Buy " + formatWhole(1) + " Shi-ah Miracle."
    },
    done() {
      return player.dimensions.Shiah[6].level.gte(1)
    }
  },
  57: {
    title: "Line Harmonization",
    img: require("@/assets/Achievements/ach57.jpg"),
    description() {
      return "Harmonize YooA Lines to Rank " + formatWhole(1) + "."
    },
    done() {
      return player.dimensions.YooA[0].rank.gte(1)
    }
  },
  58: {
    title: "Annual Blossom Jubilee",
    img: require("@/assets/Achievements/ach58.jpg"),
    description() {
      return "Age YooA to " + formatWhole(1) + " year."
    },
    done() {
      return gameLayers.YooAity.getEffectiveAge().gte(31536000)
    }
  },
  61: {
    title: "Cosmic Alignment",
    img: require("@/assets/Achievements/ach61.jpg"),
    description() {
      return "Harmonize YooA Entities to Rank " + formatWhole(1) + "."
    },
    rewardDescription() {
      return "Achievement multiplier boosts Shi-ah Echoes and YooChronium."
    },
    done() {
      return player.dimensions.YooA[4].rank.gte(1)
    }
  },
  62: {
    title: "YooA Explosion",
    img: require("@/assets/Achievements/ach62.jpg"),
    description() {
      return "Have " + format("ee50") + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte("ee50")
    }
  },
  63: {
    title: "Starlight Surge",
    img: require("@/assets/Achievements/ach63.webp"),
    description() {
      return "Have " + format("ee100") + " YooA Points."
    },
    rewardDescription() {
      return "Unlock buy max Seunghee and Yubin upgrades."
    },
    done() {
      return player.YooAPoints.gte("ee100")
    }
  },
  64: {
    title: "Complete Ensemble",
    img: require("@/assets/Achievements/ach64.jpeg"),
    description() {
      return "Unlock all OH MY GIRL members."
    },
    done() {
      return hasMilestone("YooAity", 20)
    }
  },
  65: {
    title: "Debut Anniversary",
    img: require("@/assets/Achievements/ach65.jpg"),
    description() {
      return "Age YooA to " + formatWhole(7155) + " days (OH MY GIRL debut)."
    },
    done() {
      return gameLayers.YooAity.getEffectiveAge().gte(7155 * 86400)
    }
  },
  66: {
    title: "Arin Awakening",
    img: require("@/assets/Achievements/ach66.jpeg"),
    description() {
      return "Radiate Arin to Tier " + formatWhole(1) + "."
    },
    done() {
      return player.Arin.tier.gte(1)
    }
  },
  67: {
    title: "YooA Supernova",
    img: require("@/assets/Achievements/ach67.png"),
    description() {
      return "Have " + format(tet10(4)) + " YooA Points."
    },
    done() {
      return player.YooAPoints.gte(tet10(4))
    }
  },
  68: {
    title: "First Miracle Bloom",
    img: require("@/assets/Achievements/ach68.webp"),
    description() {
      return "Have " + formatWhole(1) + " MIRACLE (OH MY GIRL Fan)."
    },
    done() {
      return gameLayers.OMG.getMIRACLEs().gte(1)
    }
  },
  /*71: {
    title: "Miracle Constellation",
    img: require("@/assets/Achievements/ach68.webp"),
    description() {
      return "Have " + formatWhole(1e3) + " MIRACLEs."
    },
    rewardDescription() {
      return "Unlock buy max OMG upgrades, and unlock OMG Fandom."
    },
    done() {
      return gameLayers.OMG.getMIRACLEs().gte(1e3)
    }
  },*/
};

// layersData.js — register caches for layer fns, upgrades, milestones
// (make sure this runs after `gameLayers` is defined)
(function registerLayerCaches() {
  if (!GameCache) return;

  // avoid double-registering if file gets imported multiple times
  if (GameCache._layerCachesRegistered) return;
  GameCache._layerCachesRegistered = true;

  const eventsToInvalidate = ['GAME_EVENT.UPDATE']; // per-tick invalidation will handle most

  function makeKey(...parts) { return parts.join('_'); }

  // Hand-pick heavy layer-level functions you want cached
  const layerFuncs = [
    ['YooA', 'problemGain'],
    ['YooA', 'digits'],
    ['YooAmatter', 'YooAriumEffect'],
    ['YooAmatter', 'YooAmatterSparkEffect'],
    ['YooAmatter', 'getYooAriumGain'],
    ['YooAity', 'problemGain'],
    // add more pairs for heavy fns you find in layersData
  ];

  for (const [layerName, fnName] of layerFuncs) {
    const key = makeKey(layerName, fnName);
    // Guard: only create cache when function exists
    if (gameLayers[layerName] && typeof gameLayers[layerName][fnName] === 'function') {
      GameCache[key] = new Lazy(() => gameLayers[layerName][fnName]());
      // No need to .invalidateOn here because we call Lazy.invalidateAll() each tick.
      // But if you have an EventHub you can do: GameCache[key].invalidateOn('upgrade-bought', ...);
    }
  }

  // Auto-cache upgrade.effects and milestone.effect()
  for (const layerName in gameLayers) {
    const layer = gameLayers[layerName];
    if (!layer) continue;

    // upgrades
    if (layer.upgrades) {
      for (const upgId in layer.upgrades) {
        const u = layer.upgrades[upgId];
        // only cache if there is a function `effect`
        if (u && typeof u.effect === 'function') {
          const key = makeKey(layerName, 'upg', upgId, 'effect');
          GameCache[key] = new Lazy(() => u.effect());
        }
        // sometimes you compute base() and effect() separately — cache both if present
        if (u && typeof u.base === 'function') {
          const key = makeKey(layerName, 'upg', upgId, 'base');
          GameCache[key] = new Lazy(() => u.base());
        }
      }
    }

    // milestones
    if (layer.milestones) {
      for (const mid in layer.milestones) {
        const m = layer.milestones[mid];
        if (!m) continue;
        if (typeof m.effect === 'function') {
          const key = makeKey(layerName, 'milestone', mid, 'effect');
          GameCache[key] = new Lazy(() => m.effect());
        }
      }
    }
  }

  // helper: optional convenience function to get a cached value
  GameCache.getCached = function(keyOrParts) {
    if (Array.isArray(keyOrParts)) keyOrParts = keyOrParts.join('_');
    const c = GameCache[keyOrParts];
    return c ? c.value : undefined;
  };

})();