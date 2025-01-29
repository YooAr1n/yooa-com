
import Decimal from "./break_eternity.js";
import { player, getYooAGain, inAnyChallenge, hasAchievement, calculateAchievementMultiplier } from "./incremental.js";
import { generateNewProblem } from "@/components/comps/MathProblem.vue"; // Import generateNewProblem function
import { resetAllDimensions } from "./dimensions.js";
import { getArinEffect, resetAllAutobuyerTime } from "./automation.js";

export const gameLayers = {
  YooA: {
    unlocked: true,
    problemGain() {
      let gain = gameLayers.YooAmatter.YooAriumEffect()[1].mul(upgradeEffect("YooAmatter", 34))
      if (player.achievements[38]) {
        gain = gain.mul(calculateAchievementMultiplier());
      }
      if (hasUpgrade("YooAmatter", 12)) gain = gain.mul(upgradeEffect("YooAmatter", 12));
      if (hasUpgrade("YooA", 32)) gain = gain.mul(upgradeEffect("YooA", 32));
      if (hasChallenge("YooAmatter", 1)) gain = gain.mul(challengeEffect("YooAmatter", 1)[1])
      if (hasChallenge("YooAmatter", 4)) gain = gain.mul(challengeEffect("YooAmatter", 4)[2])
      return gain
    },
    digits() {
      let digs = gameLayers.YooA.upgrades[11].digits().toNumber() + 1
      if (inChallenge("YooAmatter", 1)) digs *= 1.5
      if (inChallenge("YooAmatter", 2)) digs *= 1.6
      if (inChallenge("YooAmatter", 3)) digs *= 1.25
      if (inChallenge("YooAmatter", 4)) digs *= 1.5
      if (hasChallenge("YooAmatter", 2)) digs *= challengeEffect("YooAmatter", 2)[0]
      if (hasChallenge("YooAmatter", 3)) digs *= challengeEffect("YooAmatter", 3)[0]
      if (hasChallenge("YooAmatter", 4)) digs *= challengeEffect("YooAmatter", 4)[0]
      return Math.max(digs, 1)
    },
    upgrades: {
      costsNothing() {
        return false
      },
      rows: 3,
      cols: 4,
      11: {
        title: "YooA Challenge (YU 11)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooA Points."
        },
        cost(x = getUpgLevels("YooA", 11)) {
          let cost = Decimal.pow(10, x)
          if (x.gte(5)) cost = Decimal.pow(1e5, x.sub(5).pow(1.5)).mul(1e70)
          if (x.gte(17)) cost = Decimal.pow(1e30, x.sub(17).pow(1.6)).mul("e700")
          return cost;
        },
        invCost(x) {
          let cost = x.log10().min(4)
          if (cost.gte(4) && x.gte(1e70)) cost = x.div(1e70).log(1e5).root(1.5).add(5).min(16)
          if (cost.gte(16) && x.gte("e700")) cost = x.div("e700").log(1e30).root(1.6).add(17)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 5 + getUpgLevels("YooA", 32) * 5
          if (hasUpgrade("YooAmatter", 21)) max += 7
          if (hasChallenge("YooAmatter", 3)) max += 13
          return new Decimal(max)
        },
        base() {
          return upgradeEffect("YooA", 13).add(2).mul(upgradeEffect("YooAmatter", 41))
        },
        baseDigits() {
          return Decimal.sub(1, upgradeEffect("YooA", 14)).sub(upgradeEffect("YooA", 33))
        },
        effect() {
          return Decimal.pow(this.base(), getUpgLevels("YooA", 11));
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
        maxLvl: Decimal.dOne,
        effect() {
          let eff = Decimal.pow(1.01, player.math.YooA.solved)
          if (eff.gte(100)) {
            if (hasUpgrade("YooAmatter", 22)) eff = eff.log10().mul(5).dilate(0.5).div(5).pow10()
            else eff = eff.log10().mul(50)
            if (eff.gte(1e100)) eff = eff.log10().dilate(2).pow(25)
          }
          if (inChallenge("YooAmatter", 3)) {
            eff = eff.pow(19.95)
            if (eff.gte(1e100)) eff = eff.div(1e100).root(19.95).mul(1e100)
          }
          return eff
        },
        effectDisplay() {
          let eff = this.effect();
          let dis = `x${format(eff)}`;
          if (inChallenge("YooAmatter", 3)) eff = eff.root(19.95);
          if (eff.gte(1e100)) dis += " (softcapped)<sup>2</sup>";
          else if (eff.gte(100)) dis += " (softcapped)";
          return dis;
        },
      },
      13: {
        title: "YooA Enhancer (YU 13)",
        description() {
          return "Add 1 to 'YooA Challenge' base multiplier."
        },
        cost(x = getUpgLevels("YooA", 13)) {
          let cost = Decimal.pow(100, x).mul(100);
          if (x.gte(3)) cost = Decimal.pow(1e10, x.sub(3).pow(1.15)).mul(1e130)
          return cost
        },
        invCost(x) {
          let cost = x.div(100).log(100).min(2)
          if (cost.gte(2) && x.gte(1e130)) cost = x.div(1e130).log(1e10).root(1.15).add(3)
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
          return "Reduce the digits added in 'YooA Challenge' by 0.2. Double YooA Point gain at 2 and 3 levels"
        },
        cost(x = getUpgLevels("YooA", 14)) {
          return Decimal.pow(2000, x).mul(5000);
        },
        invCost(x) {
          let cost = x.div(5000).log(2000)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: new Decimal(3),
        effect() {
          return getUpgLevels("YooA", 14).div(5)
        },
        effectGain() {
          return Decimal.pow(2, getUpgLevels("YooA", 14).sub(1).max(0))
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
          let percent = 10
          if (inChallenge("YooAmatter", 2)) percent = 0
          return "Gain " + format(percent) + "% of YooA Points gained on solve per second (" + format(this.effect()) + "/s)."
        },
        cost: new Decimal(1e6),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        effect() {
          if (inChallenge("YooAmatter", 2)) return Decimal.dZero
          return getYooAGain().div(10);
        },
        effectDisplay() {
          let gain = this.effect()
          if (!hasUpgrade("YooA", 21)) gain = 0
          return format(gain) + "/s";
        },
      },
      22: {
        title: "Dimension Solver (YU 22)",
        description() {
          return "Boost all YooA dimensions based on math problems solved."
        },
        cost: new Decimal(1e8),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        effect() {
          let eff = Decimal.pow(1.003, player.math.YooA.solved)
          if (eff.gte(100)) {
            if (hasUpgrade("YooAmatter", 22)) eff = eff.log10().mul(5).dilate(0.5).div(5).pow10()
            else eff = eff.log10().mul(50)
            if (eff.gte(1e30)) eff = eff.log10().mul(10 / 3).dilate(2).pow(7.5)
          }
          if (inChallenge("YooAmatter", 3)) {
            eff = eff.pow(19.95)
            if (eff.gte(1e100)) eff = eff.div(1e100).root(19.95).mul(1e100)
          }
          return eff
        },
        effectDisplay() {
          let eff = this.effect()
          let dis = "x" + format(eff)
          if (inChallenge("YooAmatter", 3)) eff = eff.root(19.95)
          if (eff.gte(1e30)) dis += " (softcapped)<sup>2</sup>"
          else if (eff.gte(100)) dis += " (softcapped)"
          return dis;
        },
      },
      23: {
        title: "YooA Doubler (YU 23)",
        description() {
          return "Double YooA Point gain."
        },
        cost(x = getUpgLevels("YooA", 23)) {
          return Decimal.pow(3, x.pow(1.3)).mul(1e9);
        },
        invCost(x) {
          let cost = x.div(1e9).log(3).root(1.3)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        effect() {
          return Decimal.pow(2, getUpgLevels("YooA", 23));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "YooA Booster (YU 24)",
        description() {
          return "Gain 20x more YooA Points."
        },
        cost: new Decimal(1e20),
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        effect() {
          return new Decimal(20);
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
        cost(x = getUpgLevels("YooA", 31)) {
          return Decimal.pow(1000, x.pow(1.5)).mul(1e30);
        },
        invCost(x) {
          let cost = x.div(1e30).log(1e3).root(1.5)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          return player.YooAPoints.add(10).log10()
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
          return "Add 5 levels to 'YooA Challenge' and boost YooA Dimensions and math problem gain by 20% per 'YooA Challenge' level after 5."
        },
        cost(x = getUpgLevels("YooA", 32)) {
          if (x.lte(0)) return new Decimal(1e70)
          return Decimal.pow("e1000", x.sub(1).pow(2)).mul("e2700");
        },
        invCost(x) {
          let cost = Decimal.dZero
          if (x.gte("e2700")) cost = x.div("e2700").log10().div(1e3).root(2).add(1)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          return new Decimal(hasUpgrade("YooAmatter", 43) ? 5 : 1);
        },
        effect() {
          return Decimal.pow(1.2, getUpgLevels("YooA", 11).sub(5).mul(getUpgLevels("YooA", 32)).max(0));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      33: {
        title: "YooA Streamliner (YU 33)",
        description() {
          let mult = "double all YooA Dimension multipliers"
          if (hasUpgrade("YooAmatter", 24)) mult = "multiply all YooA Dimension multipliers by " + format(this.base())
          return "Reduce the digits added in 'YooA Challenge' by 0.02 and " + mult + "."
        },
        cost(x = getUpgLevels("YooA", 33)) {
          return Decimal.pow(1e10, x.pow(1.5)).mul(1e150);
        },
        invCost(x) {
          let cost = x.div(1e150).log(1e10).root(1.5)
          return cost;
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        maxLvl() {
          let max = 10
          if (hasUpgrade("YooAmatter", 24)) max += 2
          return new Decimal(max)
        },
        base() {
          return hasUpgrade("YooAmatter", 24) ? new Decimal(2.5) : Decimal.dTwo
        },
        effect() {
          return getUpgLevels("YooA", 33).div(50)
        },
        effectGain() {
          return Decimal.pow(this.base(), getUpgLevels("YooA", 33))
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
        cost(x = getUpgLevels("YooA", 34)) {
          return Decimal.pow(1e6, x.pow(1.55)).mul(1e200);
        },
        costCurrency: "YooA Points",
        costInternal: "YooAPoints",
        base() {
          return player.YooAPoints.add(10).log10().dilate(0.75).pow(0.3)
        },
        effect() {
          return this.base().pow(getUpgLevels("YooA", 34));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      // Add more upgrades for other rows and columns as needed
    },
  },
  YooAmatter: {
    currency: "YooAmatter",
    baseCurrency: "YooA Points",
    requires: new Decimal(1e12),
    unlocked() {
      return player.YooAPoints.gte(1e12) || player.stats.YooAmatter.totalAmount.gte(1)
    },
    canReset() {
      return player.YooAPoints.gte(1e12)
    },
    effectExp() {
      let exp = upgradeEffect("YooAmatter", 33).add(1)
      return exp
    },
    effect() {
      return player.YooAmatter.amount.add(1).pow(this.effectExp())
    },
    getGainMult() {
      let mult = this.YooAriumEffect()[0]
      if (hasAchievement(32)) mult = mult.mul(achievements[32].rewardEffect());
      if (hasAchievement(35)) mult = mult.mul(achievements[35].rewardEffect());
      return mult
    },
    getResetGain() {
      let mult = this.getGainMult()
      let gain = player.YooAPoints.div(1e12).dilate(0.8).pow(0.5)
      if (gain.gte(300)) gain = gain.div(300).pow(0.5).mul(300)
      if (gain.gte(1e50)) gain = gain.log10().div(50).pow(0.9).mul(500 / 9).add(400 / 9).div(2).pow10().mul(2).sub(1e50)
      return gain.mul(mult).floor()
    },
    getNextAt() {
      let mult = this.getGainMult()
      let gain = this.getResetGain()
      if (gain.gte(1e6)) gain = gain.log10().floor().add(1).pow10().div(mult)
      else gain = gain.add(1).div(mult)
      if (gain.gte(1e50)) gain = gain.add(1e50).div(2).log10().mul(2).sub(400 / 9).div(500 / 9).root(0.9).mul(50).pow10()
      if (gain.gte(300)) gain = gain.div(300).pow(2).mul(300)
      return gain.pow(2).dilate(1.25).mul(1e12).max(1e12)
    },
    problemGain() {
      let gain = Decimal.dOne
      return gain
    },
    YooAriumEffect() {
      let eff = player.YooAmatter.YooArium.add(1)
      let eff2 = player.YooAmatter.YooArium.pow(0.5).div(10).add(1)
      return [eff, eff2]
    },
    getYooAriumGain() {
      let gain = new Decimal(0.01).mul(getArinEffect()[0])
        .mul(upgradeEffect("YooAmatter", 31))
        .mul(upgradeEffect("YooAmatter", 41))
      if (hasUpgrade("YooAmatter", 32)) gain = gain.mul(upgradeEffect("YooAmatter", 32))
      if (hasUpgrade("YooAmatter", 43)) gain = gain.mul(3)
      if (hasChallenge("YooAmatter", 2)) gain = gain.mul(challengeEffect("YooAmatter", 2)[1])
      if (hasChallenge("YooAmatter", 3)) gain = gain.mul(challengeEffect("YooAmatter", 3)[1])
      return gain
    },
    digits() {
      return gameLayers.YooAmatter.upgrades[31].digits().toNumber() + 1
    },
    upgrades: {
      costsNothing() {
        return false
      },
      rows: 4,
      cols: 4,
      11: {
        title: "Eternal Growth (YM 11)",
        description() {
          return "All YooA Dimensions are stronger based on total time played."
        },
        cost: Decimal.dOne,
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: Decimal.dOne,
        effect() {
          return Decimal.pow(player.stats.General.totalTime.add(1), 0.3).div(4).add(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      12: {
        title: "Multi-Solver (YM 12)",
        description() {
          return "Increase YooA Point and YooA math problem gain multiplier by 1."
        },
        cost() {
          let b = 3
          let l = getUpgLevels("YooAmatter", 12)
          if (l.gte(2)) b = Decimal.add(b, l.mul(2))
          return Decimal.pow(b, l).mul(5);
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
        maxLvl: Decimal.dOne,
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
          return "YooAmatter increases the YooA Dimension multiplier per level, and start with 300 YooA math problems."
        },
        cost: new Decimal(5e5),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: Decimal.dOne,
        effect() {
          let eff = player.YooAmatter.amount.add(10).log10().pow(0.75).div(1000)
          if (eff.gte(0.012)) eff = eff.add(0.012).div(2)
          return eff
        },
        effectDisplay() {
          let dis = "+" + format(this.effect())
          if (this.effect().gte(0.012)) dis += " (softcapped)"
          return dis;
        },
        onBuy() {
          player.math.YooA.solved = player.math.YooA.solved.add(300)
        }
      },
      21: {
        title: "YooA Amplifier (YM 21)",
        description() {
          return "Add 7 levels to 'YooA Challenge' (YU 11) and 'YooA Enhancer' (YU 13) and start with 1,000 YooA math problems."
        },
        cost: new Decimal(1e13),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: Decimal.dOne,
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
        maxLvl: Decimal.dOne,
        percent() {
          if (inChallenge("YooAmatter", 2)) return Decimal.dZero
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
        maxLvl: Decimal.dOne,
        effect() {
          let digits = gameLayers.YooA.digits()
          return Decimal.div(10, digits).max(1);
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      24: {
        title: "Streamliner Spark (YM 24)",
        description() {
          return "Add 2 levels to 'YooA Streamliner' (YU 33) and add 0.5 to its base multiplier, and unlock Challenges."
        },
        cost: new Decimal(1e35),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: Decimal.dOne,
        effect() {
          return new Decimal(0.5);
        },
        effectDisplay() {
          return "+" + format(this.effect());
        },
      },
      31: {
        title: "YooArium Challenge (YM 31)",
        description() {
          return "Add " + format(this.baseDigits()) + " more digits to math problems but gain " + format(this.base()) + "x more YooArium."
        },
        cost(x = getUpgLevels("YooAmatter", 31)) {
          let cost = Decimal.pow(10, x.pow(1.4)).mul(8)
          if (x.gte(5)) cost = Decimal.pow(1e5, x.sub(5).pow(1.8)).mul(1e70)
          return cost;
        },
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        maxLvl() {
          let max = 5
          return new Decimal(max)
        },
        base() {
          return new Decimal(3)
        },
        baseDigits() {
          return new Decimal(0.25)
        },
        effect() {
          return Decimal.pow(this.base(), getUpgLevels("YooAmatter", 31));
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
        maxLvl: Decimal.dOne,
        effect() {
          let eff = Decimal.pow(1.05, player.math.YooAmatter.solved ** 0.5)
          return eff;
        },
        effectDisplay() {
          let dis = "x" + format(this.effect())
          //if (this.effect().gte(100)) dis += " (softcapped)"
          return dis;
        },
      },
      33: {
        title: "Power Surge (YM 33)",
        description() {
          return "Increase the YooAmatter effect exponent by " + format(this.base()) + "."
        },
        cost(x = getUpgLevels("YooAmatter", 33)) {
          return Decimal.pow(1e10, x.pow(1.5)).mul(1e50);
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
        title: "Prime Boost (YM 34)",
        description() {
          return "Gain " + format(this.base()) + "x more YooA math problems (Based on YooA Points), and start with 'Auto-YooA' (YU21)."
        },
        cost(x = getUpgLevels("YooAmatter", 34)) {
          return Decimal.pow(1e5, x.pow(1.7)).mul(1e65);
        },
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        base() {
          return player.YooAPoints.add(10).log10().add(10).log10()
        },
        effect() {
          return Decimal.pow(this.base(), getUpgLevels("YooAmatter", 34));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      41: {
        title: "YooArium Surge (YM 41)",
        description() {
          return "Gain " + format(this.base()) + "x more YooA Points per 'YooA Challenge' (YU 11), and YooArium (Based on YooA math problems)."
        },
        cost(x = getUpgLevels("YooAmatter", 41)) {
          return Decimal.pow(7, x.pow(1.5)).mul(2e4);
        },
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        base() {
          return player.math.YooA.solved.add(10).log10().dilate(1.2).pow(0.5)
        },
        effect() {
          return Decimal.pow(this.base(), getUpgLevels("YooAmatter", 41));
        },
        effectDisplay() {
          return "x" + format(this.effect());
        },
      },
      42: {
        title: "Auto-YooArium (YU 42)",
        description() {
          let percent = 5
          if (inChallenge("YooAmatter", 2)) percent = 0
          return "Gain " + format(percent) + "% of YooArium gained on solve per second (" + format(this.effect()) + "/s). Arin cost scales 1.5x slower."
        },
        cost: new Decimal(1e6),
        costCurrency: "YooArium",
        costLayer: "YooAmatter",
        costInternal: "YooArium",
        maxLvl: Decimal.dOne,
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
          return "YooArium increases the YooA Dimension multiplier per level and add 4 levels to 'YooA Mastery' (YU 32). Gain 3x more YooArium."
        },
        cost: new Decimal(1e104),
        costCurrency: "YooAmatter",
        costLayer: "YooAmatter",
        costInternal: "amount",
        maxLvl: Decimal.dOne,
        effect() {
          let eff = player.YooAmatter.YooArium.div(1e11).add(10).log10().div(1000)
          return eff
        },
        effectDisplay() {
          let dis = "+" + format(this.effect())
          return dis;
        },
      },
    },
    challenges: {
      1: {
        title: "YooA's Math Crisis (YMC 1)",
        description() {
          return "YooA math problems have 50% more digits, YooA Point gain is square rooted, and 'Problem Accelerator' (YM 22) is divided by 10."
        },
        goal: new Decimal(1e72),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        rewardDescription() {
          return "Gain more YooA Points and YooA math problems, and unlock YooA Lines autobuyer."
        },
        rewardEffect() {
          return [new Decimal(1.01), new Decimal(3)];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "^" + format(reward[0]) + " to YooA Points, x" + format(reward[1]) + " to YooA math problems";
        },
      },
      2: {
        title: "YooA's Logical Labyrinth (YMC 2)",
        description() {
          return "YooA math problems have 60% more digits, YooA Planes don't produce any YooA Lines, and 'Auto-YooA' (YU 21) and 'Problem Accelerator' (YM 22) are useless."
        },
        goal: new Decimal(1e147),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        rewardDescription() {
          return "YooA math problems have 20% fewer digits, gain more YooArium, and unlock YooA Planes autobuyer."
        },
        rewardEffect() {
          return [0.8, new Decimal(3)];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "x" + format(reward[0]) + " to digits, x" + format(reward[1]) + " to YooArium";
        },
      },
      3: {
        title: "YooA's Negative Spiral  (YMC 3)",
        description() {
          return "YooA math problems have 25% more digits, YooA Point gain is raised to 0.4, and 'Problem Accelerator' (YM 22) is negated at 40% effect. YU 12 and YU 22 effects are raised to 19.95 below x" + format(1e100) + "."
        },
        goal: new Decimal(1e300),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        rewardDescription() {
          return "YooA math problems have 15% fewer digits, gain more YooArium based on YooAmatter, add 13 levels to 'YooA Challenge' (YU 11), and unlock YooA Upgrades autobuyer."
        },
        rewardEffect() {
          let eff2 = player.YooAmatter.amount.div(1e45).add(1).log10().div(3).add(1).pow(0.75)
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
          return "YooA math problems have 50% more digits, YooA Point gain is dilated to " + format(this.dilEff()) + " (based on YooA math problems), and 'Problem Accelerator' (YM 22) is negated at 40% effect."
        },
        goal: new Decimal(1e90),
        goalCurrency: "YooA Points",
        goalInternal: "YooAPoints",
        maxLvl: Decimal.dOne,
        dilEff() {
          let x = player.math.YooA.solved
          x = x.lt(0) ? x.neg().add(1).log10().pow_base(0.9) : x.add(10).log10()
          return x.recip().add(1).recip()
        },
        rewardDescription() {
          return "YooA math problems have 15% fewer digits, gain more YooA Points and YooA math problems based on YooAmatter resets, and unlock YooAmatter autoprestiger."
        },
        rewardEffect() {
          let eff2 = player.stats.YooAmatter.resets.add(1).log10().pow(2).div(200).add(1)
          let eff3 = player.stats.YooAmatter.resets.div(100).add(1).pow(0.8)
          return [0.85, eff2, eff3];
        },
        rewardEffectDisplay() {
          let reward = this.rewardEffect()
          return "x" + format(reward[0]) + " to digits, ^" + format(reward[1], 3) + " to YooA Points, x" + format(reward[2]) + " to YooA math problems";
        },
      }
    }
  },
}

export const achievements = {
  11: {
    title: "First Step",
    img: require("@/assets/Achievements/ach11.png"),
    description() {
      return "Get 1 YooA Point."
    },
    done() {
      return player.stats.General.totalPoints.gte(1)
    }
  },
  12: {
    title: "Math Whiz",
    img: require("@/assets/Achievements/ach12.jpg"),
    description() {
      return "Solve 100 math problems."
    },
    done() {
      return player.stats.General.totalSolved.gte(100)
    }
  },
  13: {
    title: "Starting Small",
    img: require("@/assets/Achievements/ach13.png"),
    description() {
      return "Buy 1 YooA Line."
    },
    done() {
      return player.dimensions.YooA[0].level.gte(1)
    }
  },
  14: {
    title: "Taking Off",
    img: require("@/assets/Achievements/ach14.png"),
    description() {
      return "Buy 1 YooA Plane."
    },
    done() {
      return player.dimensions.YooA[1].level.gte(1)
    }
  },
  15: {
    title: "YooA Millionaire",
    img: require("@/assets/Achievements/ach15.jpg"),
    description() {
      return "Have 1,000,000 YooA Points."
    },
    rewardDescription() {
      return "Gain 2% more YooA Points."
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
      return "Gain 3% more YooA Points."
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
      return "Solve 500 math problems."
    },
    done() {
      return player.stats.General.totalSolved.gte(500)
    }
  },
  18: {
    title: "A Matter of YooA",
    img: require("@/assets/Achievements/ach18.jpg"),
    description() {
      return "Get 1 YooAmatter."
    },
    rewardDescription() {
      return "All YooA Dimensions are 3% stronger and unlock more YooA Dimensions."
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
      return "Buy 1 YooA Space."
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
      return "Have " + format(1e12) + " YooA Points without 'YooA Challenge' (YU11)."
    },
    rewardDescription() {
      return "All YooA Dimensions are 5% stronger and unlock buy max YooA Dimensions."
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
      return "Buy 1 YooA Realm."
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
      return "All YooA Dimensions are 5% stronger."
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
      return "Buy 1 YooA Entity."
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
      return "Get 1 YooArium."
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
      return "All YooA Dimensions are 10% stronger and gain 10% more YooAmatter."
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
      return "Upgrade Arin to level 3."
    },
    done() {
      return player.Arin.gte(3)
    }
  },
  34: {
    title: "YooAmatter Conqueror",
    img: require("@/assets/Achievements/ach34.jpg"),
    description() {
      return "Complete 3 YooAmatter challenges."
    },
    done() {
      return Object.keys(player.challenges.YooAmatter).length >= 3
    }
  },
  35: {
    title: "Math Mastermind",
    img: require("@/assets/Achievements/ach35.jpg"),
    description() {
      return "Solve 1,000,000 math problems."
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
      return "Upgrade Arin to level 10."
    },
    done() {
      return player.Arin.gte(10)
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
}

// Helper function to get upgrade levels
export function getUpgLevels(layer, id) {
  return player.upgrades[layer]?.[id] || Decimal.dZero; // Return level or 0 if not purchased
}

// Check if an upgrade can be afforded
export function canAffordUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade
  const currentLevel = getUpgLevels(layer, id); // Use the helper function to get current level
  let max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl
  const maxLevel = upgrade.maxLvl !== undefined ? max : Decimal.dInf; // Default to INFINITY

  // Handle static or dynamic cost
  const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;
  let curr = upgrade.costLayer ? player[upgrade.costLayer][upgrade.costInternal] : player[upgrade.costInternal]

  return curr.gte(cost) && currentLevel.lt(maxLevel);
}

export function buyUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade

  if (!canAffordUpgrade(layer, id)) return;  // Early exit if player can't afford upgrade

  // Determine the cost (static or dynamic)
  const cost = typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

  // Access the currency values once
  const costLayer = upgrade.costLayer;
  const costInternal = upgrade.costInternal;
  let curr = costLayer ? player[costLayer][costInternal] : player[costInternal];

  // Deduct the cost only if it's not a free upgrade
  if (!gameLayers[layer].upgrades.costsNothing()) {
    curr = curr.sub(cost);
  }

  // Update the player's currency
  if (costLayer) {
    player[costLayer][costInternal] = curr;
  } else {
    player[costInternal] = curr;
  }

  // Ensure player.upgrades[layer] exists
  player.upgrades[layer] = player.upgrades[layer] || {};

  // Get current level and max level
  const currentLevel = player.upgrades[layer][id] || Decimal.dZero;
  const max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl;

  // If upgrade hasn't been purchased yet, initialize it at level 1
  if (!player.upgrades[layer][id]) {
    player.upgrades[layer][id] = Decimal.dOne;
  } else {
    // Check if the upgrade can be leveled up without exceeding max level
    if (!max || currentLevel.lt(max)) {
      player.upgrades[layer][id] = currentLevel.add(1);
    }
  }

  // Call the onBuy method if it exists
  if (upgrade.onBuy) {
    upgrade.onBuy();
  }
}

export function buyMaxUpgrade(layer, id) {
  const upgrade = gameLayers[layer].upgrades[id]; // Access the specific upgrade

  if (!canAffordUpgrade(layer, id)) return;  // Early exit if player can't afford upgrade

  // Access common upgrade properties
  const costLayer = upgrade.costLayer;
  const costInternal = upgrade.costInternal;
  let curr = costLayer ? player[costLayer][costInternal] : player[costInternal];

  const max = typeof upgrade.maxLvl === "function" ? upgrade.maxLvl() : upgrade.maxLvl;

  // If max level is 1, just buy the upgrade immediately
  if (max?.eq(1)) {
    buyUpgrade(layer, id);
    return;
  }

  // Calculate bulk buying potential
  const nocost = gameLayers[layer].upgrades.costsNothing();
  let maxBulk = bulkBuyTetraBinarySearch(curr, {
    costFunction: upgrade.cost,
    invCostFunction: upgrade.invCost,
    cumulative: nocost,
    maxLevel: upgrade.maxLvl
  }, getUpgLevels(layer, id));

  // If tetrabulk is not found, try the regular bulk search
  if (!maxBulk || maxBulk.quantity.lt(1e15)) {
    maxBulk = bulkBuyBinarySearch(curr, {
      costFunction: upgrade.cost,
      invCostFunction: upgrade.invCost,
      cumulative: nocost,
      maxLevel: upgrade.maxLvl
    }, getUpgLevels(layer, id));
  }

  // If no upgrades can be purchased, return
  if (maxBulk.quantity.lte(0)) return;

  // Calculate total cost and subtract from player currency
  const totalCost = maxBulk.purchasePrice;
  if (!nocost) curr = curr.sub(totalCost);

  // Update player's currency
  if (costLayer) {
    player[costLayer][costInternal] = curr;
  } else {
    player[costInternal] = curr;
  }

  // Initialize player upgrades for the layer if it doesn't exist
  player.upgrades[layer] = player.upgrades[layer] || {};

  const currentLevel = player.upgrades[layer][id] || Decimal.dZero;
  let newLevel = currentLevel.add(maxBulk.quantity);

  // Apply max level cap if applicable
  if (max && newLevel.gt(max)) {
    newLevel = new Decimal(max);
  }

  // Update player's upgrade level
  player.upgrades[layer][id] = newLevel;

  // Execute the onBuy callback if it exists
  if (upgrade.onBuy) {
    upgrade.onBuy();
  }
}



// Get the effect of an upgrade
export function upgradeEffect(layer, id) {
  const upgrade = gameLayers[layer]?.upgrades?.[id];
  return upgrade?.effect ? upgrade.effect() : Decimal.dZero; // Return effect or 0 if none
}

// Check if an upgrade has been purchased
export function hasUpgrade(layer, id) {
  return getUpgLevels(layer, id).gte(1); // Use the helper function for levels
}

export function prestige(layer) {
  let gain = gameLayers[layer].getResetGain();
  player[layer].amount = player[layer].amount.add(gain);
  player.stats[layer].resets = player.stats[layer].resets.add(1);
  player.stats[layer].totalAmount = player.stats[layer].totalAmount.add(gain);
  player.stats[layer].time = Decimal.dZero;
  player.YooAPoints = Decimal.dZero;
  player.upgrades.YooA = {};
  player.math.YooA.solved = Decimal.dZero;
  generateNewProblem("YooA");

  if (!inAnyChallenge()) {
    if (hasUpgrade("YooAmatter", 21)) player.math.YooA.solved = new Decimal(1000);
    else if (hasUpgrade("YooAmatter", 14)) player.math.YooA.solved = new Decimal(300);
  }

  if (hasUpgrade("YooAmatter", 34)) player.upgrades.YooA[21] = Decimal.dOne

  resetAllDimensions(player.dimensions.YooA, layer);
  resetAllAutobuyerTime(player.autobuyers.YooAmatter);
}

export function getChallLevels(layer, id) {
  return player.challenges[layer]?.[id] || Decimal.dZero; // Return level or 0 if not completed
}

export function canCompleteChallenge(layer, id) {
  const challenge = gameLayers[layer].challenges[id]; // Access the specific challenge
  const currentLevel = getChallLevels(layer, id); // Use the helper function to get current level
  let max = typeof challenge.maxLvl === "function" ? challenge.maxLvl() : challenge.maxLvl
  const maxLevel = challenge.maxLvl !== undefined ? max : Decimal.dInf; // Default to INFINITY

  // Handle static or dynamic goal
  const goal = typeof challenge.goal === "function" ? challenge.goal() : challenge.goal;
  let curr = challenge.goalLayer ? player[challenge.goalLayer][challenge.goalInternal] : player[challenge.goalInternal]

  return curr.gte(goal) && currentLevel.lt(maxLevel);
}

export function hasChallenge(layer, id) {
  return getChallLevels(layer, id).gte(1);
}

export function inChallenge(layer, id) {
  return player.inChallenge[0] == layer && player.inChallenge[1] == id;
}

export function completeChallenge(layer, id) {
  const challenge = gameLayers[layer].challenges[id]; // Access the specific challenge

  if (!canCompleteChallenge(layer, id)) return;

  player.inChallenge = ["", ""];
  const message = `${challenge.title} completed!`;
  window.dispatchEvent(new CustomEvent('challenge-completed', { detail: message }));
  prestige(layer);
  // Initialize player.challenges[layer] if it doesn't exist
  player.challenges[layer] = player.challenges[layer] || {};

  // If the challenge isn't purchased yet, set it to level 1
  if (!player.challenges[layer][id]) {
    player.challenges[layer][id] = Decimal.dOne; // Start at level 1
  }
  else {
    let max = typeof challenge.maxLvl === "function" ? challenge.maxLvl() : challenge.maxLvl
    let nomax = max && player.challenges[layer][id].lt(max)
    nomax = nomax || !max
    if (nomax) {
      // Increment level if challenge level is less than maxLvl
      player.challenges[layer][id] = player.challenges[layer][id].add(1);
    }
  }

}

// Get the effect of challenge
export function challengeEffect(layer, id) {
  const challenge = gameLayers[layer]?.challenges?.[id];
  return challenge?.rewardEffect ? challenge.rewardEffect() : Decimal.dZero;
}

export function exitOrComplete(layer, id, con = options.confirmations.YooAmatter) {
  if (!canCompleteChallenge(layer, id)) {
    if (con) {
      let msg = "If you exit now without reaching the goal, you will reset for " + layer + " and lose any chance of earning rewards. Your progress will be lost, and you will need to start over if you want to try again. Are you sure you want to exit the Challenge?"
      if (window.confirm(msg)) {
        player.inChallenge = ["", ""];
        prestige(layer);
      }
    }
    else {
      player.inChallenge = ["", ""];
      prestige(layer);
    }
  } else {
    completeChallenge(layer, id);
  }
}