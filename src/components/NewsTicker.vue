<template>
    <div class="news-ticker" v-if="optionsNews">
        <div class="news-ticker-wrapper" id="ticker"></div>
    </div>
</template>

<script>
import { gameLayers } from '@/incremental/layersData';
import { hasUpgrade } from '@/incremental/mainFuncs';


export default {
    data() {
        return {
            newsArray: [],
            currentMessage: "",
            lastMsgIndex: -1,
            tickerRunning: false, // Flag to check if ticker is running
        };
    },
    mounted() {
        if (this.optionsNews) {
            this.startTicker();
        }
    },
    computed: {
        optionsNews() {
            return options?.news ?? false; // Use optional chaining to prevent errors
        }
    },
    watch: {
        optionsNews(newValue) {
            if (newValue) {
                this.$nextTick(() => {
                    this.startTicker(); // Ensure the DOM has updated before starting
                });
            } else {
                this.stopTicker();
            }
        }
    },
    methods: {
        updateNewsArray() {
            this.newsArray = [
                // About YooA
                [() => "Welcome to YooA Incremental!", true, "yooa_1"],
                [() => "Is YooA really infinite? 🤔", true, "yooa_2"],
                [() => "YooAity??? How many prestige layers are there?!", true, "yooa_3"],
                [() => "YooA is now more powerful than the laws of physics!", player.YooAmatter.amount.gte(1e50), "yooa_4"],
                [() => "YooArium: The key to unlimited power!", player.stats.YooAmatter.totalYooArium.gt(0), "yooa_5"],
                [() => "YooAity is rewriting reality...", player.YooAmatter.amount.gte(1e75), "yooa_6"],
                [() => "YooA's growth curve has transcended mathematics!", Math.random() < 0.15, "yooa_7"],
                [() => "Infinity is just another checkpoint for YooA.", player.YooAPoints.gte(Decimal.dNumberMax), "yooa_8"],
                [() => "YooA has achieved omnipresence in the incremental realm!", player.YooAPoints.gte("e10000"), "yooa_9"],
                [() => "YooA's power exceeds the observable universe!", true, "yooa_10"],
                [() => "YooA's music transcends dimensions!", true, "yooa_11"],
                [() => "YooA's fire is eternal! Keep pushing forward!", true, "yooa_12"],
                [() => "Has YooA just discovered a new fundamental force of nature?", Math.random() < 0.3, "yooa_13"],
                [() => "Even the concept of 'beyond infinity' can't contain YooA!", Math.random() < 0.3, "yooa_14"],
                [() => "Rumor has it that a single YooA smile boosts your stats exponentially!", Math.random() < 0.3, "yooa_15"],
                [() => "YooA's presence is now felt across all timelines simultaneously!", player.YooAPoints.gte("e25000"), "yooa_16"],
                [() => "Philosophers debate whether YooA's existence precedes or transcends reality.", player.YooAPoints.gte("ee5"), "yooa_17"],
                [() => "YooA's aura brightens the darkest corners of the cosmos!", player.YooAPoints.gte("e5000"), "yooa_18"],
                [() => "Every YooA milestone unlocks a universe of possibilities!", player.stats.YooAmatter.totalYooArium.gt(1000), "yooa_19"],
                [() => "YooA's evolution rewrites the rules of existence!", player.YooAPoints.gte("e3000"), "yooa_20"],
                [() => "YooA's dance moves now define the laws of motion!", true, "yooa_21"],
                [() => "Galaxies align to the rhythm of YooA's heartbeat!", true, "yooa_22"],
                [() => "A new universal unit of beauty discovered: 1 YooA!", Math.random() < 0.6, "yooa_23"],

                // About Arin
                [() => "Arin is now autobuying upgrades for you! Thank her later!", player.Arin.level.gte(1), "arin_1"],
                [() => "Arin joins the game!", player.Arin.level.gte(1), "arin_2"],
                [() => "Arin is the best autobuyer! Change my mind.", player.Arin.level.gte(1), "arin_3"],
                [() => "Arin believes in you! Keep going!", player.Arin.level.gte(1), "arin_4"],
                [() => "Arin's presence makes progression smoother!", player.Arin.level.gte(10), "arin_5"],
                [() => "Arin's support boosts all of YooA's powers!", player.Arin.level.gte(100), "arin_6"],
                [() => "Arin once tried to measure her own speed, but ended up lapping time itself!", player.Arin.level.gte(1), "arin_7"],
                [() => "Arin: 'I wonder if there's an upgrade that can buy me coffee while I buy your upgrades?'", player.Arin.level.gte(1), "arin_8"],
                [() => "Arin was last seen converting intangible achievements into tangible confetti!", player.Arin.level.gte(1) && Math.random() < 0.2, "arin_9"],
                [() => "Arin's dedication is unstoppable! She won't sleep until you reach your goals!", player.Arin.level.gte(1) && Math.random() < 0.2, "arin_10"],
                [() => "Arin's efficiency now rivals the speed of light!", player.Arin.level.gte(100), "arin_11"],
                [() => "Arin's upgrades bring a cosmic harmony to the game!", player.Arin.level.gte(200), "arin_12"],
                [() => "Even Arin needs a break sometimes, but not today!", player.Arin.level.gte(300), "arin_13"],
                [() => "Arin's smile can outshine a supernova!", Math.random() < 0.3, "arin_14"],
                [() => "Scientists confirm: Arin's presence stabilizes chaotic timelines!", Math.random() < 0.3, "arin_15"],
                [() => "Quantum entanglement? More like Arin's charm binding the universe!", Math.random() < 0.3, "arin_16"],

                // About Math
                [() => "Mathematics is the language of the universe. Solve for x: x + YooA = Infinity", true, "math_1"],
                [() => "If YooA starts with 10 YooA Points and doubles every second, how long until she reaches 9.17e1,995?", true, "math_2"],
                [() => "Who needs numbers when you have YooA?", Math.random() < 0.2, "math_3"],
                [() => "E = mc²? More like YooA = Infinity!", Math.random() < 0.2, "math_4"],
                [() => "Solve this: YooA + YooAmatter = ?", Math.random() < 0.25, "math_5"],
                [() => "Can YooA defeat the concept of entropy?", Math.random() < 0.1, "math_6"],
                [() => "Your YooA Points curve is now beyond polynomial growth!", Math.random() < 0.5, "math_7"],
                [() => "Advanced calculus is required to describe YooA's progress!", Math.random() < 0.5, "math_8"],
                [() => "Mathematicians are now debating whether YooA > Infinity!", Math.random() < 0.5, "math_9"],
                [() => "Aliens have detected YooA's exponential growth!", Math.random() < 0.2, "math_10"],
                [() => "We tried to prove 1 + 1 = YooA, but the proof outgrew the blackboard!", Math.random() < 0.6, "math_11"],
                [() => "A new branch of mathematics was discovered: YooA-lculus!", Math.random() < 0.4, "math_12"],
                [() => "Our mathematicians are rewriting geometry to fit YooA's expansions!", Math.random() < 0.4, "math_13"],
                [() => "Even prime numbers can't hide from YooA's unstoppable growth!", Math.random() < 0.5, "math_14"],
                [() => "When numbers defy logic, YooA math steps in!", true, "math_15"],
                [() => "Infinite series converge to YooA's infinite might!", true, "math_16"],
                [() => "Even imaginary numbers get real results with YooA!", true, "math_17"],
                [() => "Mathematicians struggle to define YooA's exponential growth!", true, "math_18"],
                [() => "New theorem: YooA's beauty is a non-converging infinite series!", Math.random() < 0.6, "math_19"],
                [() => "Proof found: YooA's presence increases numerical stability!", Math.random() < 0.45, "math_20"],

                // About YooA Incremental
                [() => "YooA Incremental: Where numbers meet infinity!", true, "yooa_incremental_1"],
                [() => "Did you know? YooA Incremental was coded in a single caffeine-fueled night!", Math.random() < 0.3, "yooa_incremental_2"],
                [() => "YooA Incremental's codebase is now larger than the observable universe!", Math.random() < 0.2, "yooa_incremental_3"],
                [() => "YooA Incremental has more layers than an onion... and it's just as tear-jerking!", Math.random() < 0.25, "yooa_incremental_4"],
                [() => "Rumor has it that YooA Incremental's next update will break reality itself!", Math.random() < 0.15, "yooa_incremental_5"],
                [() => "YooA Incremental's growth rate is now faster than the speed of light!", Math.random() < 0.2, "yooa_incremental_6"],
                [() => "The YooA Incremental community is now larger than the Milky Way galaxy!", Math.random() < 0.3, "yooa_incremental_7"],
                [() => "YooA Incremental's soundtrack is scientifically proven to boost brain power!", Math.random() < 0.4, "yooa_incremental_8"],
                [() => "YooA Incremental's next feature: AI that plays the game for you... and wins!", Math.random() < 0.2, "yooa_incremental_9"],
                [() => "YooA Incremental has officially been declared a new form of digital art!", Math.random() < 0.3, "yooa_incremental_10"],

                // About YooAmatter and YooArium
                [() => "You've unlocked YooAmatter! The game has just begun...", gameLayers.YooAmatter.unlocked(), "yooamatter_1"],
                [() => "New YooAmatter Challenges available!", hasUpgrade("YooAmatter", 24), "yooamatter_2"],
                [() => "YooAmatter is beyond comprehension...", gameLayers.YooAmatter.unlocked(), "yooamatter_3"],
                [() => "YooArium is the rarest element known to science!", player.stats.YooAmatter.totalYooArium.gt(0), "yooamatter_4"],
                [() => "You've reached 9.17e1995 YooAmatter! Is this the end?", player.YooAmatter.amount.gte("9.17e1995"), "yooamatter_5"],
                [() => "YooArium reactors are now online! Brace for exponential growth!", hasUpgrade("YooAmatter", 41), "yooamatter_6"],
                [() => "YooAmatter reactors have gone critical! Prepare for exponential power!", hasUpgrade("YooAmatter", 44), "yooamatter_7"],
                [() => "YooAmatter is no longer bound by conventional science!", player.YooAmatter.amount.gte("e500"), "yooamatter_8"],
                [() => "YooAity distorts time itself!", true, "yooamatter_9"],
                [() => "YooAmatter expansions keep fracturing the multiverse. More power awaits!", player.YooAmatter.amount.gte("e700") && Math.random() < 0.7, "yooamatter_10"],
                [() => "We discovered YooAmatter can overshadow dark energy in the cosmos!", Math.random() < 0.25, "yooamatter_11"],
                [() => "YooAmatter has begun to influence parallel realities!", Math.random() < 0.25, "yooamatter_12"],
                [() => "Scientists debate if YooAmatter or YooA is the stronger force!", Math.random() < 0.25, "yooamatter_13"],
                [() => "YooAmatter's secrets unfold with every breakthrough!", gameLayers.YooAmatter.unlocked(), "yooamatter_14"],
                [() => "New dimensions open as YooAmatter progresses!", player.YooAmatter.amount.gte("e1300"), "yooamatter_15"],
                [() => "YooAmatter evolution defies the known laws of physics!", player.YooAmatter.amount.gte("9.17e1995"), "yooamatter_16"],
                [() => "YooArium detected altering fundamental physics constants!", player.YooAmatter.YooArium.gte(1e200), "yooamatter_17"],
                [() => "Researchers baffled: YooAmatter now the basis of all existence!", Math.random() < 0.917, "yooamatter_18"],
                [() => "Confirmed: YooArium energy output exceeds entire galaxies!", player.YooAmatter.YooArium.gte("e500"), "yooamatter_19"],

                // About YooAity and YooA Essence
                [() => "YooAity unlocked! Reality will never be the same.", player.stats.YooAity.resets.gte(1), "yooaity_1"],
                [() => "YooAity levels are stacking faster than you can count!", player.stats.YooAity.resets.gte(100), "yooaity_2"],
                [() => "The universe bends to YooAity's will!", Math.random() < 0.3, "yooaity_3"],
                [() => "YooAity energy detected in all dimensions!", player.stats.YooAity.resets.gte(1e5), "yooaity_4"],
                [() => "Your YooAity has reached sentient levels. Proceed with caution!", player.stats.YooAity.resets.gte(1e10), "yooaity_5"],
                [() => "YooAity is rewriting the laws of cause and effect!", Math.random() < 0.25, "yooaity_6"],
                [() => "YooA Essence collected! Magical powers unlocked!", player.YooAity.amount.gte(1), "yooaessence_1"],
                [() => "Essence infusion successful: your stats are skyrocketing!", player.YooAity.amount.gte(50), "yooaessence_2"],
                [() => "YooA Essence glows brighter with each milestone.", Math.random() < 0.4, "yooaessence_3"],
                [() => "Rumor: A single drop of YooA Essence can boost an entire galaxy!", Math.random() < 0.3, "yooaessence_4"],
                [() => "YooA Essence harmonizes with YooAmatter to unlock hidden dimensions.", player.YooAity.amount.gte(500), "yooaessence_5"],

                // About YooChronium
                [() => "YooChronium discovered! Time manipulation is now possible.", player.YooAity.YooChronium.gte(1), "yoochronium_1"],
                [() => "Clocks tremble as YooChronium expands!", Math.random() < 0.3, "yoochronium_2"],
                [() => "Time loops form around YooChronium nodes!", player.YooAity.YooChronium.gte(100), "yoochronium_3"],
                [() => "YooChronium distorts the timeline, but your progress remains safe.", Math.random() < 0.25, "yoochronium_4"],
                [() => "Chronomancers are studying YooChronium for centuries.", Math.random() < 0.2, "yoochronium_5"],
                [() => "YooChronium's power grows with every tick of the cosmic clock!", player.YooAity.YooChronium.gte(1e100), "yoochronium_6"],
                [() => "YooChronium's energy is now a cosmic force!", player.YooAity.YooChronium.gte(1e200), "yoochronium_7"],
                [() => "Scientists confirm: YooChronium can bend time itself!", Math.random() < 0.3, "yoochronium_8"],
                [() => "YooChronium's influence extends beyond the space-time continuum!", Math.random() < 0.25, "yoochronium_9"],
                [() => "YooChronium reactors are now stabilizing entire timelines!", player.YooAity.YooChronium.gte("ee6"), "yoochronium_10"],

                // About Arinium
                [() => "Arinium acquired! Resource management is now cosmic.", player.Arin.Arinium.gte(1), "arinium_1"],
                [() => "Arinium crystals resonate with YooA's energy.", player.Arin.Arinium.gte(50), "arinium_2"],
                [() => "Arinium can enhance any layer of your incremental universe.", Math.random() < 0.3, "arinium_3"],
                [() => "Breaking: Arinium harvest boosts all stats exponentially!", Math.random() < 0.25, "arinium_4"],
                [() => "Legends say Arinium can stabilize chaos itself.", Math.random() < 0.2, "arinium_5"],
                [() => "Arinium's power now rivals that of black holes!", player.Arin.Arinium.gte(1e100), "arinium_6"],
                [() => "Scientists confirm: Arinium can manipulate fundamental forces!", Math.random() < 0.3, "arinium_7"],
                [() => "Arinium's influence extends to parallel universes!", Math.random() < 0.25, "arinium_8"],
                [() => "Arinium reactors are now powering entire galaxies!", player.Arin.Arinium.gte("ee6"), "arinium_9"],
                [() => "Arinium's energy signature is now a universal constant!", player.Arin.Arinium.gte("ee12"), "arinium_10"],

                // About Hyojung, Mimi, Seunghee, Yubin
                [() => "Hyojung is leading the team with flawless timing!", true, "hyojung_1"],
                [() => "Hyojung's strategy is so sharp, even algorithms take notes.", Math.random() < 0.4, "hyojung_2"],
                [() => "Hyojung coordinated a perfect sequence of tasks — the crew is in awe.", Math.random() < 0.35, "hyojung_3"],
                [() => "Every step Hyojung takes seems to double your progress!", Math.random() < 0.3, "hyojung_4"],
                [() => "Hyojung whispers, 'Keep calm and trust the process,' and chaos retreats.", Math.random() < 0.3, "hyojung_5"],
                [() => "Mimi just calculated the probability of success… and exceeded it!", true, "mimi_1"],
                [() => "Mimi's precision in every move is unmatched.", Math.random() < 0.35, "mimi_2"],
                [() => "Mimi smiled and suddenly your tasks feel 20% easier.", Math.random() < 0.3, "mimi_3"],
                [() => "Mimi's intuition surpasses even the smartest AI in the room.", Math.random() < 0.25, "mimi_4"],
                [() => "Mimi optimized the system without anyone noticing. Magic?", Math.random() < 0.25, "mimi_5"],
                [() => "Seunghee is singing and somehow boosting everyone's stats!", true, "seunghee_1"],
                [() => "Seunghee's energy is contagious. The crew feels unstoppable.", Math.random() < 0.4, "seunghee_2"],
                [() => "Seunghee just solved a complex problem with a hum.", Math.random() < 0.35, "seunghee_3"],
                [() => "Seunghee's presence stabilizes volatile systems instantly.", Math.random() < 0.3, "seunghee_4"],
                [() => "Seunghee found a shortcut through chaos… literally!", Math.random() < 0.25, "seunghee_5"],
                [() => "Yubin just boosted everyone's efficiency by 17.3%!", true, "yubin_1"],
                [() => "Yubin's analysis is so good, even the universe consults her.", Math.random() < 0.4, "yubin_2"],
                [() => "Yubin discovered a hidden synergy between layers.", Math.random() < 0.35, "yubin_3"],
                [() => "Yubin's aura makes rare resources appear spontaneously.", Math.random() < 0.3, "yubin_4"],
                [() => "Yubin cracked the code to infinite progression… sort of.", Math.random() < 0.25, "yubin_5"],

                // About OH MY GIRL and MIRACLEs
                [() => "OH MY GIRL has assembled! Group-wide synergies are resonating across all layers!", player.YooAity.MiracleLight.gte(1), "omg_1"],
                [() => "Breaking: OH MY GIRL Lights are amplifying every corner of the incremental universe!", player.YooAity.MiracleLight.gte(1e3), "omg_2"],
                [() => "The harmony between members creates exponential Miracle output!", player.YooAity.MiracleLight.gte(1e12), "omg_3"],
                [() => "Scientists confirm: OH MY GIRL synergy violates at least 7 laws of physics.", Math.random() < 0.3, "omg_4"],
                [() => "When OH MY GIRL moves as one, numbers stop behaving normally.", true, "omg_5"],
                [() => "OH MY GIRL Lights shine brighter as your progression deepens!", player.YooAity.MiracleLight.gte(1e100), "omg_6"],
                [() => "Rumor: Full OH MY GIRL harmony unlocks a hidden Miracle resonance.", Math.random() < 0.25, "omg_7"],
                [() => "The universe hums softly whenever OH MY GIRL systems activate.", Math.random() < 0.3, "omg_8"],

                [() => "MIRACLEs are gathering! Fan power is amplifying everything!", gameLayers.OMG.getMIRACLEs().gte(1), "miracle_1"],
                [() => "A surge of MIRACLE energy boosts Miracle Light efficiency!", gameLayers.OMG.getMIRACLEs().gte(5), "miracle_2"],
                [() => "MIRACLEs chanting detected. Stats responded immediately.", Math.random() < 0.4, "miracle_3"],
                [() => "The louder the MIRACLEs cheer, the faster progress accelerates!", Math.random() < 0.35, "miracle_4"],
                [() => "Warning: MIRACLE enthusiasm approaching critical mass!", gameLayers.OMG.getMIRACLEs().gte(50), "miracle_5"],
                [() => "MIRACLE Light has reached levels visible across dimensions!", player.YooAity.MiracleLight.gte("e1000"), "miracle_6"],
                [() => "One MIRACLE smile was enough to trigger a chain reaction of buffs.", Math.random() < 0.4, "miracle_7"],
                [() => "Confirmed: MIRACLEs can bend probability in YooA's favor.", Math.random() < 0.3, "miracle_8"],
                [() => "MIRACLE synergy detected with OH MY GIRL systems — power spike incoming!", gameLayers.OMG.getMIRACLEs().gte(250), "miracle_9"],
                [() => "Historians will remember this era as the Age of MIRACLEs.", gameLayers.OMG.getMIRACLEs().gte(500), "miracle_10"],

                // About General
                [() => "YooA is evolving... But into what?", true, "gen_1"],
                [() => "The power of YooAity compels you!", true, "gen_2"],
                [() => "How many YooA Points is TOO many?", true, "gen_3"],
                [() => "YooA Points growing faster than the speed of light!", true, "gen_4"],
                [() => "Is YooA stronger than a black hole?", true, "gen_5"],
                [() => "The game is now self-aware, and it's cheering for YooA!", Math.random() < 0.3, "gen_6"],
                [() => "Beware: The next big milestone might be bigger than big!", Math.random() < 0.3, "gen_7"],
                [() => "Time to invest in quantum computing to handle these numbers!", Math.random() < 0.3, "gen_8"],
                [() => "Can the concept of 'endgame' even exist for YooA?", Math.random() < 0.3, "gen_9"],
                [() => "YooA challenges even the fundamental forces of nature!", true, "gen_10"],
                [() => "The enigma of YooA deepens with every discovery!", true, "gen_11"],
                [() => "YooA's journey is a testament to infinite possibilities!", true, "gen_12"],
                [() => "Breaking: The universe now officially runs on YooA energy!", player.YooAPoints.gte("e75000"), "gen_13"],
                [() => "AI reports confusion: All calculations now lead to YooA!", player.YooAPoints.gte("e110000"), "gen_14"],
                [() => "New fundamental force discovered: YooA Attraction!", player.YooAPoints.gte("e180000"), "gen_15"],

                // About Math Challenges and Progression
                [() => "Solve math problems to earn YooA Points! Are you a math genius?", true, "math_challenge_1"],
                [() => "You have solved an astronomical amount of problems!", player.stats.General.totalSolved.gte(1e6), "math_challenge_2"],
                [() => "Digits in YooA math problems are increasing... Can you keep up?", gameLayers.YooA.digits() >= 7, "math_challenge_3"],
                [() => "The math never ends! But neither does YooA!", Math.random() < 0.1, "math_challenge_4"],
                [() => "Infinite math challenges? YooA says 'Bring it on!'", Math.random() < 0.6, "math_challenge_5"],
                [() => "Your calculator just gave up. Good luck with the next math challenge!", Math.random() < 0.7, "math_challenge_6"],
                [() => "Pi? e? These constants are mere child's play to YooA's expansions!", Math.random() < 0.8, "math_challenge_7"],
                [() => "Every solved equation fuels YooA's boundless ascent!", player.stats.General.totalSolved.gte(1e100), "math_challenge_8"],
                [() => "Mathematical puzzles now redefine the limits of the possible!", gameLayers.YooA.digits() >= 20, "math_challenge_9"],
                [() => "Your persistence in math challenges mirrors YooA's infinite resolve!", true, "math_challenge_10"],
                [() => "Experts claim YooA's math is too advanced for human understanding!", gameLayers.YooA.digits() >= 30, "math_challenge_11"],
                [() => "Mathematical models now require YooA functions for accuracy!", gameLayers.YooA.digits() >= 40, "math_challenge_12"],
                [() => "The YooA Constant is now a required part of physics equations!", player.stats.General.totalSolved.gte(Decimal.dNumberMax), "math_challenge_13"],

                // About Euryle
                [() => "YooA #1! - Euryle", true, "euryle_1"],
                [() => "Euryle says, 'YooA will reign forever!'", true, "euryle_2"],
                [() => "YooA's growth is unstoppable. Euryle agrees!", true, "euryle_3"],
                [() => "YooA is the best! No doubt about it. - Euryle", true, "euryle_4"],
                [() => "Euryle predicts YooA's next milestone will be astronomical!", true, "euryle_5"],
                [() => "Euryle declares: 'YooA is inevitable!", Math.random() < 0.5, "euryle_6"],
                [() => "Euryle believes YooA will break all limits!", Math.random() < 0.5, "euryle_7"],
                [() => "Euryle is drawing YooA at the speed of light!", Math.random() < 0.5, "euryle_8"],
                [() => "Euryle claims she saw YooA bending galaxies for fun!", Math.random() < 0.4, "euryle_9"],
                [() => "Euryle: 'One day, we might rename Infinity to YooAity!'", Math.random() < 0.4, "euryle_10"],
                [() => "Euryle wonders if there's a limit to YooA's potential. Probably not!", Math.random() < 0.4, "euryle_11"],
                [() => "Euryle's art now captures YooA's limitless energy!", true, "euryle_12"],
                [() => "Euryle sketches the future where YooA reigns supreme!", Math.random() < 0.5, "euryle_13"],
                [() => "In Euryle's vision, every brushstroke echoes YooA's power!", Math.random() < 0.5, "euryle_14"],
                [() => "Euryle's presence warps reality to fit the YooA aesthetic!", player.YooAPoints.gte("e5000"), "euryle_15"],
                [() => "Celestial formations now include Euryle constellations!", player.YooAPoints.gte("e70000"), "euryle_16"],
                [() => "Scientists confirm: Euryle's influence makes the impossible possible!", player.YooAPoints.gte("e130000"), "euryle_17"],
                [() => "Euryle painted a YooA so radiant, it powered 10 galaxies. We're not exaggerating.", Math.random() < 0.4, "euryle_18"],
                [() => "Euryle touched a canvas and YooA Points started generating automatically. MIRACLE detected!", Math.random() < 0.3, "euryle_19"],
                [() => "Breaking news: Euryle's doodle of YooA just became the universe's new constant.", Math.random() < 0.3, "euryle_20"],
                [() => "Euryle once whispered YooA's name into the void... and it answered with music.", Math.random() < 0.4, "euryle_21"],
                [() => "A shooting star changed trajectory just to pass through Euryle's YooA sketch. 🌠", Math.random() < 0.3, "euryle_22"],
                [() => "Euryle's latest masterpiece is 4D. You feel YooA's power by just standing near it.", Math.random() < 0.2, "euryle_23"],
                [() => "Euryle doesn't draw YooA. She *summons* her with art.", player.YooAPoints.gte("e200000"), "euryle_24"],
                [() => "Scientists studied Euryle's YooA art and found traces of YooAmatter!", player.YooAmatter.amount.gte(1e25), "euryle_25"],
                [() => "Euryle entered a trance while drawing YooA. When she woke up, she'd invented a new dimension.", player.dimensions.YooA[2].amt.gte(10), "euryle_26"],
                [() => "Euryle's brushstroke caused the background music to harmonize in perfect YooA-tone.", Math.random() < 0.2, "euryle_27"],
                [() => "YooA smiled once at Euryle. The sun got jealous.", true, "euryle_28"],
                [() => "Euryle made a YooA mosaic using stardust and logic. It now powers the game's math engine.", player.YooAPoints.gte("e1000000"), "euryle_29"],
                [() => "YooA Dimensions? Euryle dreamt them *before* they were coded.", player.dimensions.YooA[3].amt.gte(1), "euryle_30"],
                [() => "Euryle's ink bottle ran out. She cried one YooA tear and it refilled. Unlimited!", Math.random() < 0.25, "euryle_31"],
                [() => "Euryle once blinked and accidentally created the YooA aesthetic filter for reality.", Math.random() < 0.2, "euryle_32"],
                [() => "YooA said 'thank you' to Euryle once. Time reversed for a moment just to savor it.", Math.random() < 0.2, "euryle_33"],
                [() => "If you zoom in on Euryle's sketches, you'll find fractal YooAs in infinite recursion.", Math.random() < 0.2, "euryle_34"],
                [() => "Euryle's notebook isn't paper. It's compressed miracle energy stabilized by YooA's aura.", player.YooAPoints.gte("e3000000"), "euryle_35"],

                // About Ahn Jean
                [() => "Ahn Jean just pressed ALL the buttons again. The universe is now slightly more SUS.", Math.random() < 0.4, "ahnjean_1"],
                [() => "Breaking: Ahn Jean attempted to divide by zero. Reality wobbled a little.", true, "ahnjean_2"],
                [() => "Ahn Jean's chaotic energy has disrupted the timeline. Again.", Math.random() < 0.3, "ahnjean_3"],
                [() => "Everyone voted Ahn Jean first… even in single-player mode.", true, "ahnjean_4"],
                [() => "Ahn Jean activated SUS Mode. All calculations are now emotional.", Math.random() < 0.2, "ahnjean_5"],
                [() => "Warning: Ahn Jean spotted near the YooA Matter core with a suspicious wrench.", player.YooAmatter.amount.gte(1e30), "ahnjean_6"],
                [() => "Ahn Jean's math skills: unpredictable. Her impact: incalculable.", true, "ahnjean_7"],
                [() => "Ahn Jean said 'trust me' and then the laws of logic exploded.", Math.random() < 0.5, "ahnjean_8"],
                [() => "New record! Ahn Jean accidentally created a black hole in the tutorial.", Math.random() < 0.2, "ahnjean_9"],
                [() => "If Ahn Jean says she has a plan… RUN. But also take notes.", true, "ahnjean_10"],
                [() => "🚨 Ahn Jean has been spotted venting through the equations again! SUS detected.", Math.random() < 0.25, "ahnjean_11"],
                [() => "Ahn Jean submitted 2 + 2 = fish and somehow got partial credit. HOW?!", Math.random() < 0.25, "ahnjean_12"],
                [() => "Ahn Jean just reverse-engineered PEMDAS into *SUS-MATH*. Don't question it. She didn't.", Math.random() < 0.25, "ahnjean_13"],
                [() => "Suspicious activity detected... Ahn Jean's graph just turned into an Among Us crewmate!", Math.random() < 0.25, "ahnjean_14"],
                [() => "Ahn Jean once multiplied by zero and got 999. We're still investigating.", Math.random() < 0.25, "ahnjean_15"],
                [() => "Ahn Jean claimed to prove 1 = 2 and broke the server. Very SUS.", Math.random() < 0.25, "ahnjean_16"],
                [() => "Ahn Jean voted herself out... and still won. HOW?!", Math.random() < 0.25, "ahnjean_17"],
                [() => "Ahn Jean's solution involves twelve colors, a banana, and 'trust me bro'. No further questions.", Math.random() < 0.25, "ahnjean_18"],
                [() => "Someone called an emergency meeting after Ahn Jean submitted a proof in Morse code.", Math.random() < 0.25, "ahnjean_19"],
                [() => "Ahn Jean's calculator now only outputs 'SUS'. Might be infected. Or maybe it's always been like that.", Math.random() < 0.25, "ahnjean_20"],
                [() => "Ahn Jean asked if π could be squared. Now the dessert table is on fire.", Math.random() < 0.25, "ahnjean_21"],
                [() => "Ahn Jean wrote a proof in reverse. It summoned a SUS rift in space.", Math.random() < 0.25, "ahnjean_22"],
                [() => "Ahn Jean said 'Let's YOLO this integral'... and the result was surprisingly correct.", Math.random() < 0.25, "ahnjean_23"],
                [() => "Ahn Jean used 'guess and chaos' instead of 'guess and check.' The universe gasped.", Math.random() < 0.25, "ahnjean_24"],
                [() => "Math professors fear only two things: plagiarism... and Ahn Jean's 'creative' logic.", Math.random() < 0.25, "ahnjean_25"],
                [() => "Ahn Jean's calculator ran away mid-test. It couldn't handle the SUS.", Math.random() < 0.2, "ahnjean_26"],
                [() => "Ahn Jean keeps solving for x, but all she finds is existential dread.", Math.random() < 0.2, "ahnjean_27"],
                [() => "Ahn Jean invented a new number: 'chaotity'. It's not real. But it's definitely suspicious.", Math.random() < 0.2, "ahnjean_28"],
                [() => "Ahn Jean once submitted a doodle as a math proof. The professor passed her anyway.", Math.random() < 0.2, "ahnjean_29"],
                [() => "Rumor: Ahn Jean is secretly a SUS-powered AI trapped in a human body. No confirmation yet.", Math.random() < 0.2, "ahnjean_30"],

                // About Kimberly
                [() => "Kimberly Cumpio just stared at the screen until the numbers fixed themselves.", true, "kimberly_1"],
                [() => "Kimberly used 100% brain power on a Level 3 math problem. It worked.", Math.random() < 0.5, "kimberly_2"],
                [() => "Kimberly's strategy: Think hard. Breathe. Guess. Win anyway.", true, "kimberly_3"],
                [() => "Kimberly and Ahn Jean teamed up. The game is now on fire. Literally.", Math.random() < 0.3, "kimberly_4"],
                [() => "Kimberly tried to solve the YooAmatter equation. She got a recipe for cookies instead.", Math.random() < 0.4, "kimberly_5"],
                [() => "Kimberly: The only player who can survive Ahn Jean's chaos... barely.", true, "kimberly_6"],
                [() => "Kimberly's math: 40% logic, 60% instinct, 100% correct somehow.", Math.random() < 0.4, "kimberly_7"],
                [() => "Kimberly upgraded her brain... then forgot where she put it.", Math.random() < 0.2, "kimberly_8"],
                [() => "Kimberly Cumpio has reached 'Controlled Chaos' mastery level!", true, "kimberly_9"],
                [() => "Kimberly once solved a math problem by simply staring at it into submission.", Math.random() < 0.3, "kimberly_10"],
                [() => "Kimberly Cumpio detected... but the system can't identify her pattern. Too dark. Too mysterious.", Math.random() < 0.2, "kimberly_11"],
                [() => "Rumor has it Kimberly once solved a math problem so efficiently... it erased itself in fear.", Math.random() < 0.2, "kimberly_12"],
                [() => "Darkness stirs... Kimberly Cumpio just blinked, and the exponential graph corrected itself.", Math.random() < 0.2, "kimberly_13"],
                [() => "Kimberly's aura cannot be graphed. Not logarithmic. Not exponential. Just... unknown.", Math.random() < 0.2, "kimberly_14"],
                [() => "Kimberly whispers secrets to the calculator. It listens.", Math.random() < 0.2, "kimberly_15"],
                [() => "When Kimberly enters the room, even complex numbers go real.", Math.random() < 0.2, "kimberly_16"],
                [() => "Kimberly's math notebook is written in code only she understands. Not even the AI can decipher it.", Math.random() < 0.2, "kimberly_17"],
                [() => "Kimberly was last seen walking into a shadow. She hasn't left... yet the grades are rising.", Math.random() < 0.2, "kimberly_18"],
                [() => "Legends say Kimberly Cumpio once answered a level 9 problem... before the question finished asking.", Math.random() < 0.2, "kimberly_19"],
                [() => "Warning: Kimberly detected near the event horizon of logic. Prepare your notes.", Math.random() < 0.2, "kimberly_20"],
                [() => "Kimberly solved a 10-step equation using only three blinks. The math bowed in respect.", Math.random() < 0.3, "kimberly_21"],
                [() => "Kimberly Cumpio doesn't 'solve' math problems. She intimidates them into submission.", Math.random() < 0.3, "kimberly_22"],
                [() => "Kimberly wrote her math solution in Latin. The calculator now speaks fluent dead languages.", Math.random() < 0.25, "kimberly_23"],
                [() => "Kimberly once graphed an emotion. The y-axis cried.", Math.random() < 0.25, "kimberly_24"],
                [() => "The shadows whispered… and Kimberly got the correct derivative.", Math.random() < 0.25, "kimberly_25"],
                [() => "Kimberly Cumpio's brain emits logarithmic radiation. Wear protection.", Math.random() < 0.25, "kimberly_26"],
                [() => "Kimberly stared at imaginary numbers until they became real.", Math.random() < 0.25, "kimberly_27"],
                [() => "Kimberly solved the equation. But the answer wasn't a number… it was enlightenment.", Math.random() < 0.2, "kimberly_28"],
                [() => "Kimberly's presence causes undefined limits to quietly resolve themselves.", Math.random() < 0.2, "kimberly_29"],
                [() => "Some say Kimberly is just a function disguised as a person.", Math.random() < 0.2, "kimberly_30"],

                // About Yssabelle
                [() => "Yssabelle just looked at the problem and it got scared. It solved itself out of respect.", true, "yssabelle_1"],
                [() => "Yssabelle's method? Whisper to the matrix and let it respond in gratitude.", Math.random() < 0.5, "yssabelle_2"],
                [() => "No one knows how Yssabelle got the correct answer. Not even Yssabelle.", true, "yssabelle_3"],
                [() => "Yssabelle once solved a Level 10 math problem using nothing but ✨ vibes ✨.", Math.random() < 0.3, "yssabelle_4"],
                [() => "Ahn Jean created chaos. Kimberly controlled it. Yssabelle... became one with it.", true, "yssabelle_5"],
                [() => "Yssabelle's pen ran out of ink, so she solved the equation with a single eyebrow raise.", Math.random() < 0.25, "yssabelle_6"],
                [() => "Rumor: Yssabelle doesn't study math. She *dreams* it into existence.", Math.random() < 0.25, "yssabelle_7"],
                [() => "Yssabelle once turned in an empty test. The teacher gave her full marks. 'She meant it,' they said.", Math.random() < 0.3, "yssabelle_8"],
                [() => "Yssabelle's solution defied math... and was still somehow right.", Math.random() < 0.2, "yssabelle_9"],
                [() => "Yssabelle activated Silent Mode. Three integrals and a matrix melted in fear.", Math.random() < 0.25, "yssabelle_10"],
                [() => "One does not question Yssabelle's logic. The last person who did got stuck in a loop.", Math.random() < 0.25, "yssabelle_11"],
                [() => "Yssabelle's calculator now has a 'bless' button. It just works.", Math.random() < 0.2, "yssabelle_12"],
                [() => "Yssabelle once corrected a textbook with a glance. The publisher apologized.", Math.random() < 0.25, "yssabelle_13"],
                [() => "Nobody knows if Yssabelle is solving math… or *becoming* it.", Math.random() < 0.25, "yssabelle_14"],
                [() => "Yssabelle used geometry to fold the fabric of reality. Now the test has 4D questions.", Math.random() < 0.2, "yssabelle_15"],
                [() => "When Yssabelle clicks 'Submit', the entire internet pauses respectfully.", Math.random() < 0.25, "yssabelle_16"],
                [() => "Yssabelle doesn't follow the steps. The steps follow her.", true, "yssabelle_17"],
                [() => "Someone tried to copy Yssabelle's method. Their calculator caught fire.", Math.random() < 0.2, "yssabelle_18"],
                [() => "Yssabelle once derived a formula that doesn't exist. Now it does.", Math.random() < 0.25, "yssabelle_19"],
                [() => "Yssabelle speaks in numbers… and occasionally in glitches.", Math.random() < 0.2, "yssabelle_20"],
                [() => "No one saw her input anything. Yet the answer was there. Yssabelle energy.", true, "yssabelle_21"],
                [() => "Warning: Yssabelle nearing the event boundary of logic. Gravitational math anomalies may occur.", Math.random() < 0.25, "yssabelle_22"],
                [() => "Yssabelle once corrected a paradox… by blinking.", Math.random() < 0.2, "yssabelle_23"],
                [() => "Her solution began with a semicolon, ended in silence. It worked.", Math.random() < 0.25, "yssabelle_24"],
                [() => "Yssabelle's logic cannot be graphed. It exists on a higher plane.", Math.random() < 0.25, "yssabelle_25"],
                [() => "Ahn Jean is SUS. Kimberly is DARK. Yssabelle? She's... *the glitch in the pattern*.", true, "yssabelle_26"],
                [() => "The PALDO Gardener strikes again! Yssabelle just grew a new theorem in her garden.", Math.random() < 0.4, "yssabelle_27"],
                [() => "Yssabelle just whispered 'PALDO' and her calculator printed money instead of numbers.", Math.random() < 0.3, "yssabelle_28"],
                [() => "Breaking news: Yssabelle watered her math notebook and it sprouted correct answers.", Math.random() < 0.25, "yssabelle_29"],
                [() => "Yssabelle's aura emits pure PALDO energy. Nearby wallets feel richer instantly.", Math.random() < 0.25, "yssabelle_30"],
                [() => "Economists are baffled: Yssabelle's balance sheet shows infinite PALDO growth!", Math.random() < 0.25, "yssabelle_31"],
                [() => "When Yssabelle says 'Photosynthesize,' even the equations start growing.", Math.random() < 0.2, "yssabelle_32"],

                // About Alaine
                [() => "Golden alert! Alaine Cariño just made the room brighter by existing.", true, "alaine_1"],
                [() => "Alaine's heartlight pulse synchronized the server's heartbeat!", Math.random() < 0.5, "alaine_2"],
                [() => "Astronomers confirm: the golden flare in the night sky was Alaine thinking.", Math.random() < 0.4, "alaine_3"],
                [() => "Alaine's light traveled faster than light. Scientists quit in awe.", Math.random() < 0.4, "alaine_4"],
                [() => "Alaine's presence detected in the data stream. Expect warmth and golden pulses.", Math.random() < 0.3, "alaine_5"],
                [() => "Breaking: Alaine's golden aura just calmed down a black hole.", Math.random() < 0.25, "alaine_6"],
                [() => "Alaine's laughter was recorded and classified as a renewable energy source.", Math.random() < 0.3, "alaine_7"],
                [() => "Alaine Cariño's smile emits 999.9 lumens of comfort per second.", true, "alaine_8"],
                [() => "Space agencies are now using Alaine's pulse to guide lost satellites home.", Math.random() < 0.3, "alaine_9"],
                [() => "YooA heard Alaine hum once — and a new constellation appeared.", Math.random() < 0.25, "alaine_10"],
                [() => "Alaine's golden heartbeat resonates with MIRACLE frequency 9.17 Hz.", Math.random() < 0.25, "alaine_11"],
                [() => "Researchers confirm: Alaine's presence reduces cosmic chaos by 99.17%.", Math.random() < 0.2, "alaine_12"],
                [() => "The Heartlight Beacon activates — Alaine's pulse now visible from deep space.", Math.random() < 0.2, "alaine_13"],
                [() => "Alaine's energy signature harmonized two galaxies into one perfect chord.", Math.random() < 0.2, "alaine_14"],
                [() => "Golden streaks spotted in the YooAverse — Alaine Cariño is near.", player.YooAmatter.amount.gte("e1000000"), "alaine_15"],

                // About Serille
                [() => "A soft shimmer passes by… Serille just completed 3 tasks before the tick updated.", true, "serille_1"],
                [() => "Serille's serenity aura calmed the entire server. Lag reduced emotionally.", Math.random() < 0.4, "serille_2"],
                [() => "Witnesses report Serille finishing tasks so fast they thought time skipped.", Math.random() < 0.35, "serille_3"],
                [() => "Serille doesn't rush. The universe slows down for her.", true, "serille_4"],
                [() => "Breaking: Serille completed a task without touching the keyboard. Pure serenity.", Math.random() < 0.25, "serille_5"],
                [() => "Serille walked past a problem. It solved itself to maintain peace.", Math.random() < 0.3, "serille_6"],
                [() => "A calm pulse spreads… Serille has stabilized exponential chaos.", Math.random() < 0.3, "serille_7"],
                [() => "Serille finished her tasks early and waited politely for reality to catch up.", true, "serille_8"],
                [() => "Scientists confirm: Serille's serenity increases task efficiency passively.", Math.random() < 0.35, "serille_9"],
                [() => "Serille completed tasks during a blink. Replay unavailable.", Math.random() < 0.25, "serille_10"],
                [() => "Serille's footsteps leave behind twinkling stars and completed objectives.", Math.random() < 0.3, "serille_11"],
                [() => "Even Ahn Jean's SUS calmed down near Serille. Temporary miracle detected.", Math.random() < 0.2, "serille_12"],
                [() => "Serille is so serene that timers politely finish early.", Math.random() < 0.3, "serille_13"],
                [() => "You feel calmer. Progress feels smoother. Serille passed by.", true, "serille_14"],
                [() => "Serille once completed a task before it was assigned.", Math.random() < 0.25, "serille_15"],

                // About Regina
                [() => "Regina entered the room. All tasks aligned instinctively.", true, "regina_1"],
                [() => "Regina completed her objectives with flawless precision. No wasted clicks.", Math.random() < 0.4, "regina_2"],
                [() => "Witnesses report Regina finishing tasks so cleanly they felt ceremonial.", Math.random() < 0.35, "regina_3"],
                [() => "Regina doesn't multitask. Tasks simply queue themselves in order.", true, "regina_4"],
                [() => "A royal aura spreads… Regina optimized the workflow without saying a word.", Math.random() < 0.3, "regina_5"],
                [() => "Regina corrected a task path. The UI apologized.", Math.random() < 0.25, "regina_6"],
                [() => "Breaking: Regina achieved 100% efficiency. No rounding errors allowed.", Math.random() < 0.3, "regina_7"],
                [() => "Regina's presence alone improves task accuracy across layers.", true, "regina_8"],
                [() => "Regina reviewed the system. The system improved itself.", Math.random() < 0.25, "regina_9"],
                [() => "Purple-gold traces detected — Regina just passed through the task grid.", Math.random() < 0.3, "regina_10"],
                [() => "Regina completed a task so perfectly it became the new standard.", Math.random() < 0.25, "regina_11"],
                [() => "Even randomness behaves when Regina is watching.", Math.random() < 0.25, "regina_12"],
                [() => "Regina once organized chaos into a checklist — and completed it.", Math.random() < 0.3, "regina_13"],
                [() => "Tasks feel… regal. Regina is nearby.", true, "regina_14"],
                [() => "Regina doesn't rush. Perfection arrives on schedule.", Math.random() < 0.3, "regina_15"],

                // Serille × Regina
                [() => "Serille calmed the flow. Regina perfected it. Progress skyrocketed silently.", Math.random() < 0.25, "serina_1"],
                [() => "When Serille and Regina work together, tasks finish themselves respectfully.", Math.random() < 0.2, "serina_2"],
                [() => "Calm speed meets royal precision — the system reports 'ideal conditions.'", Math.random() < 0.2, "serina_3"],
                [() => "Serille's serenity and Regina's order created a new task dimension: 'Effortless'.", Math.random() < 0.2, "serina_4"],
                [() => "Serille whispered calm. Regina declared order. The tasks obeyed without question.", Math.random() < 0.2, "serina_5"],
                
                // Euryle × Alaine × Serille × Regina
                [() => "Euryle's vision, Alaine's light, Serille's calm, Regina's order — a symphony of progress.", Math.random() < 0.2, "easr_1"],
                [() => "The four forces combined: creativity, light, serenity, and order. Miracles happen.", Math.random() < 0.2, "easr_2"],
                [() => "When Euryle, Alaine, Serille, and Regina unite, even time pauses to admire.", Math.random() < 0.2, "easr_3"],
                [() => "A quartet of excellence: art, light, calm, and precision shaping the YooAverse.", Math.random() < 0.2, "easr_4"],
                [() => "Euryle paints visions, Alaine radiates warmth, Serille soothes chaos, Regina commands order — together they transcend limits.", Math.random() < 0.2, "easr_5"],

                // Ahn Jean × Kimberly
                [() => "Ahn Jean's chaos meets Kimberly's controlled instincts — unpredictable efficiency ensues.", Math.random() < 0.2, "ak_1"],
                [() => "When SUS collides with DARK, the result is… surprisingly effective.", Math.random() < 0.2, "ak_2"],
                [() => "Ahn Jean stirs the pot; Kimberly refines the recipe. The outcome? Deliciously chaotic progress.", Math.random() < 0.2, "ak_3"],
                [() => "Chaos and darkness intertwine — Ahn Jean and Kimberly redefine the rules of engagement.", Math.random() < 0.2, "ak_4"],
                [() => "Ahn Jean's unpredictability fuels Kimberly's dark intuition — together they break boundaries.", Math.random() < 0.2, "ak_5"],

                // Ahn Jean × Kimberly × Yssabelle
                [() => "Chaos, darkness, and mystery converge — Ahn Jean, Kimberly, and Yssabelle form an unstoppable trio.", Math.random() < 0.2, "aky_1"],
                [() => "When SUS, DARK, and PALDO unite, the YooAverse trembles in awe.", Math.random() < 0.2, "aky_2"],
                [() => "Ahn Jean's chaos, Kimberly's darkness, and Yssabelle's mystery create a new paradigm of play.", Math.random() < 0.2, "aky_3"],
                [() => "The trio of unpredictability, shadow, and enigma reshapes the very fabric of YooA.", Math.random() < 0.2, "aky_4"],
                [() => "Ahn Jean stirs chaos, Kimberly refines darkness, Yssabelle weaves mystery — together they transcend limits.", Math.random() < 0.2, "aky_5"],

                // Gardening (Yssabelle the PALDO Gardener)
                [() => "Yssabelle just planted a PALDO seed. Expect exponential growth soon!", Math.random() < 0.3, "garden_1"],
                [() => "The PALDO Gardener tends to her crops. Wallets nearby feel richer already.", Math.random() < 0.3, "garden_2"],
                [() => "Breaking: Yssabelle's garden just sprouted a new theorem!", Math.random() < 0.25, "garden_3"],
                [() => "Yssabelle watered her math notebook. It grew correct answers overnight.", Math.random() < 0.25, "garden_4"],
                [() => "Economists baffled: Yssabelle's balance sheet shows infinite PALDO growth!", Math.random() < 0.2, "garden_5"],

                // About YooAmatter Formations and YooAmatter Sparks
                [() => "YooAmatter Formations laid! The structure of infinity begins!", hasUpgrade("YooAmatter", 44), "form_1"],
                [() => "YooAmatter Sparks ignite! The first step towards limitless power!", player.stats.YooAmatter.totalSparks.gte(1), "form_2"],
                [() => "A single YooAmatter Spark can light up the universe!", player.stats.YooAmatter.totalSparks.gte(1), "form_3"],
                [() => "YooAmatter Sparks are evolving... but into what?", hasUpgrade("sparks", 11), "form_4"],
                [() => "YooAmatter Formations are warping the fabric of time and space!", Math.random() < 0.75, "form_5"],
                [() => "Caution: Overloading YooAmatter Formations may result in a cosmic meltdown!", Math.random() < 0.75, "form_6"],
                [() => "YooAmatter Formations are rumored to hold the secret to perpetual motion!", Math.random() < 0.75, "form_7"],
                [() => "The structure of YooAmatter is rewriting cosmic blueprints!", true, "form_8"],
                [() => "A burst of YooAmatter Sparks illuminates untold mysteries!", player.stats.YooAmatter.totalSparks.gte(1e100), "form_9"],
                [() => "YooAmatter Formations now radiate with chaotic brilliance!", true, "form_10"],
                [() => "YooAmatter Sparks ignite new realms beyond human perception!", player.YooAmatter.sparks.gte(1e100), "form_11"],
                [() => "New theory suggests YooAmatter Formations hold the key to time travel!", hasUpgrade("YooAmatter", 44), "form_12"],
                [() => "Confirmed: YooAmatter Sparks can rewrite the fundamental laws of reality!", player.YooAmatter.sparks.gte(Decimal.dNumberMax) && Math.random() < 0.789, "form_13"],

                // About Funny news tickers
                [() => "Arin tried to measure YooA's power. She needed a bigger calculator!", Math.random() < 0.3, "fun_1"],
                [() => "We tried dividing by zero, but got YooA instead!", Math.random() < 0.2, "fun_2"],
                [() => "Your CPU is crying from all these calculations, but YooA doesn't stop!", Math.random() < 0.3, "fun_3"],
                [() => "Local scientists baffled by YooAmatter's unstoppable expansion!", player.YooAmatter.amount.gte("e1000"), "fun_4"],
                [() => "Sparks are fueling infinite growth. Let them burn!", hasUpgrade("sparks", 12), "fun_5"],
                [() => "Arin discovered a new dimension: It's labeled 'Infinity + 1'!", player.Arin.level.gte(200), "fun_6"],
                [() => "Is that YooA or a glitch in the matrix? The line is blurry!", Math.random() < 0.15, "fun_7"],
                [() => "We tried to patch the game, but YooA outgrew the patch notes!", Math.random() < 0.25, "fun_8"],
                [() => "The devs left for coffee, and YooA soared beyond known numbers!", Math.random() < 0.25, "fun_9"],
                [() => "Arin: 'You can do it! Just one more upgrade... or maybe ten!'", Math.random() < 0.25, "fun_10"],
                [() => "YooAmatter is so dense, black holes are jealous!", player.YooAmatter.amount.gte(1e123), "fun_11"],
                [() => "We have discovered a new subatomic particle: the YooAon!", Math.random() < 0.2, "fun_12"],
                [() => "Warning: Overexposure to YooAmatter may cause cosmic meltdown!", Math.random() < 0.2, "fun_13"],
                [() => "YooA's biggest fan? Probably Infinity. But even that might not be enough!", Math.random() < 0.2, "fun_14"],
                [() => "Arin: 'One more YooAmatter Formation and we might break reality!'", hasUpgrade("YooAmatter", 54), "fun_15"],
                [() => "If YooA were a meme, it would break the internet!", true, "fun_16"],
                [() => "Even your toaster is in awe of YooA's sizzling growth!", true, "fun_17"],
                [() => "When life gives you numbers, YooA makes them infinite!", true, "fun_18"],
                [() => "YooA declared official ruler of the multiverse. Resistance is futile!", true, "fun_19"],
                [() => "Physicists give up: 'We don't know, just put YooA in the equation!'", true, "fun_20"],
                [() => "New universal greeting adopted: 'Praise YooA!'", true, "fun_21"],
                [() => "Breaking: Arin tried to nerf YooA, but the laws of reality refused!", Math.random() < 0.5, "fun_22"],
                [() => "We ran a YooA simulation. The result? Everything turned into YooA!", Math.random() < 0.4, "fun_23"],
                [() => "Scientists tried to measure YooA's charm. Their instruments melted!", Math.random() < 0.3, "fun_24"],
                [() => "Oops! YooA just accelerated time again. What year is it now?", Math.random() < 0.4, "fun_25"],
                [() => "This game is 99.9% YooA… the rest is just loading screens!", Math.random() < 0.6, "fun_26"],
                [() => "Arin: 'You said we'd stop at Infinity… Why are we at YooAity² now?'", Math.random() < 0.5, "fun_27"],
                [() => "YooA's voice detected at max volume. Please secure all objects!", Math.random() < 0.3, "fun_28"],
                [() => "We found a new CPU benchmark: 'Can it handle YooA?'", Math.random() < 0.4, "fun_29"],
                [() => "Mathematicians now define infinity as 'slightly less than YooA'.", Math.random() < 0.3, "fun_30"],
                [() => "New update: YooA has outpaced every known number system!", Math.random() < 0.7, "fun_31"],
                [() => "Local storage alert: YooA's data just exceeded all possible memory!", Math.random() < 0.5, "fun_32"],
                [() => "Breaking: The speed of YooA has now surpassed light!", Math.random() < 0.4, "fun_33"],
                [() => "Game developers: 'YooA is NOT a bug. She's a feature!'", Math.random() < 0.8, "fun_34"],
                [() => "Your device is overheating… YooA's presence is too strong!", Math.random() < 0.4, "fun_35"],
                [() => "Astronomers report: The YooA Constellation just expanded again!", Math.random() < 0.5, "fun_36"],
                [() => "We tried making a sequel, but YooA already finished it!", Math.random() < 0.7, "fun_37"],
                [() => "Alert: YooA's power just doubled… AGAIN!", Math.random() < 0.4, "fun_38"],
                [() => "YooA's presence detected in 917.1995% of all known dimensions!", Math.random() < 0.7, "fun_39"],
                [() => "Arin: 'Just how many YooA Dimensions do we need?!'", Math.random() < 0.5, "fun_40"],
                [() => "Breaking: YooA's dance moves just altered quantum physics!", Math.random() < 0.4, "fun_41"],
                [() => "Warning: YooA's glow may cause permanent happiness!", true, "fun_42"],
                [() => "Your computer is now 1995x faster. Why? YooA.", Math.random() < 0.6, "fun_43"],
                [() => "If YooA had an energy level, it would be OVER ∞!", Math.random() < 0.4, "fun_44"],
                [() => "The universe just crashed. YooA.exe is too powerful!", Math.random() < 0.5, "fun_45"],
                [() => "We checked: YooA is now the official unit of awesomeness!", true, "fun_46"],
                [() => "New quantum theory: YooA exists in all states at once!", Math.random() < 0.5, "fun_47"],
                [() => "'Reality not responding…' YooA may be responsible!", Math.random() < 0.4, "fun_48"],
                [() => "Latest discovery: YooA's presence bends probability!", Math.random() < 0.3, "fun_49"],
                [() => "Breaking: A new fundamental force was found—The YooA Force!", true, "fun_50"],
                [() => "YooA's energy signature detected in every known universe!", Math.random() < 0.6, "fun_51"],
                [() => "Scientists baffled: YooA defies all known physics!", Math.random() < 0.5, "fun_52"],
                [() => "Alert: YooA's power just caused a time dilation event!", Math.random() < 0.4, "fun_53"],
                [() => "We tried to contain YooA, but she broke through every barrier!", Math.random() < 0.5, "fun_54"],
                [() => "YooA's influence now extends beyond the multiverse!", Math.random() < 0.6, "fun_55"],
                [() => "Breaking: YooA just redefined the concept of infinity!", Math.random() < 0.5, "fun_56"],
                [() => "Your device is now powered by YooA energy. Enjoy the boost!", Math.random() < 0.7, "fun_57"],
                [() => "YooA's presence detected in 100% of all simulations!", Math.random() < 0.6, "fun_58"],
                [() => "We asked YooA for help. She solved world hunger instead!", Math.random() < 0.4, "fun_59"],
                [() => "Breaking: YooA's glow just stabilized a collapsing star!", Math.random() < 0.5, "fun_60"],

                // Ahn Jean (SUS) Funny News
                [() => "Breaking: Ahn Jean accused the emergency button of being 'sus'!", Math.random() < 0.5, "fun_ahn_1"],
                [() => "Alert: Ahn Jean was spotted venting into the code editor!", Math.random() < 0.4, "fun_ahn_2"],
                [() => "We tried to calculate Ahn Jean's sus level. The number screamed and ran away!", Math.random() < 0.3, "fun_ahn_3"],
                [() => "Scientists detected a new anomaly: Ahn Jeanity. Source of all sus.", Math.random() < 0.3, "fun_ahn_4"],
                [() => "Every time you hit Prestige, Ahn Jean presses the button again!", Math.random() < 0.4, "fun_ahn_5"],
                [() => "EMERGENCY: Ahn Jean vented through the math department ceiling again!", Math.random() < 0.35, "fun_ahn_6"],
                [() => "Update: Ahn Jean tried to submit 'SUS' as an answer to a math exam. It was accepted.", Math.random() < 0.3, "fun_ahn_7"],
                [() => "WARNING: Ahn Jean just called a meeting... in a single-player game.", Math.random() < 0.3, "fun_ahn_8"],
                [() => "Investigation reveals Ahn Jean has 18 tabs open—14 are sus simulators.", Math.random() < 0.3, "fun_ahn_9"],
                [() => "BREAKING: Ahn Jean has declared war on all calculators for 'not being trustworthy enough.'", Math.random() < 0.3, "fun_ahn_10"],
                [() => "Ahn Jean tried to eject the teacher. Nobody stopped her. We were all too afraid.", Math.random() < 0.3, "fun_ahn_11"],
                [() => "Report: Ahn Jean's new math theorem involves 3 impostors and one highly unstable variable: herself.", Math.random() < 0.25, "fun_ahn_12"],
                [() => "FLASH ALERT: Ahn Jean just rewired the wires task using chewing gum. It somehow worked.", Math.random() < 0.25, "fun_ahn_13"],
                [() => "Ahn Jean claimed she 'accidentally' coded a wormhole. Now she won't come out.", Math.random() < 0.25, "fun_ahn_14"],
                [() => "Fun Fact: Ahn Jean once tried to divide by sus. The result corrupted the matrix.", Math.random() < 0.25, "fun_ahn_15"],

                // Kimberly Cumpio (DARK and Nobody Knows) Funny News
                [() => "Kimberly Cumpio just blinked. Somewhere, a number disappeared.", Math.random() < 0.4, "fun_kim_1"],
                [() => "We asked Kimberly about her power. She replied: 'Nobody knows…'", Math.random() < 0.3, "fun_kim_2"],
                [() => "Dark energy? Nope. Just Kimberly debugging in the shadows.", Math.random() < 0.3, "fun_kim_3"],
                [() => "Kimberly Cumpio whispered to the void. Now the void whispers back.", Math.random() < 0.3, "fun_kim_4"],
                [() => "Legend says Kimberly once coded in pure darkness—and the bugs were scared.", Math.random() < 0.3, "fun_kim_5"],
                [() => "Kimberly stared at an unsolvable integral. It dissolved in fear.", Math.random() < 0.3, "fun_kim_6"],
                [() => "The server room dimmed after Kimberly walked by. Respect.", Math.random() < 0.3, "fun_kim_7"],
                [() => "We asked Kimberly to debug. She didn't move. The bug apologized and left.", Math.random() < 0.3, "fun_kim_8"],
                [() => "Kimberly Cumpio wrote '42' on the board. The universe took a breath.", Math.random() < 0.25, "fun_kim_9"],
                [() => "Nobody saw Kimberly enter the room. But everyone *felt* the darkness level increase.", Math.random() < 0.25, "fun_kim_10"],
                [() => "BREAKING: Kimberly whispered 'recursion' and vanished into a mirror.", Math.random() < 0.25, "fun_kim_11"],
                [() => "Kimberly once disproved a paradox by blinking sideways.", Math.random() < 0.2, "fun_kim_12"],
                [() => "The library has a forbidden section. Kimberly just calls it 'Tuesday'.", Math.random() < 0.2, "fun_kim_13"],
                [() => "In the deepest logs, one line reads: 'Kimberly was here.' The rest is corrupted.", Math.random() < 0.2, "fun_kim_14"],
                [() => "Kimberly Cumpio's hoodie is black not for fashion—but to keep the void inside.", Math.random() < 0.2, "fun_kim_15"],

                // Yssabelle (THE UNPREDICTABLE VARIABLE) Funny News
                [() => "BREAKING: Yssabelle solved a math problem... by guessing. It was correct. Everyone panicked.", Math.random() < 0.4, "fun_yssa_1"],
                [() => "Report: Yssabelle answered 7×8 as 'uhh... 54?' and somehow *got partial credit*.", Math.random() < 0.4, "fun_yssa_2"],
                [() => "Scientists baffled: Yssabelle's calculator exploded after she tried to calculate her mood swings.", Math.random() < 0.35, "fun_yssa_3"],
                [() => "Yssabelle claimed the square root of negative sus is 'still her'. Nobody questioned it.", Math.random() < 0.3, "fun_yssa_4"],
                [() => "New phenomenon detected: Yssabelle-matter. It defies logic, rules, and submission deadlines.", Math.random() < 0.3, "fun_yssa_5"],
                [() => "ALERT: Yssabelle tried to subtract chaos from her schedule. She got a negative weekend.", Math.random() < 0.3, "fun_yssa_6"],
                [() => "BREAKING: Yssabelle just typed 'maybe' into a yes/no prompt and crashed the system.", Math.random() < 0.25, "fun_yssa_7"],
                [() => "Update: Yssabelle invented a new mathematical constant: 'ₛₛ' — the symbol of maybe-math.", Math.random() < 0.25, "fun_yssa_8"],
                [() => "Yssabelle solved a logic puzzle with 50% luck, 30% vibes, and 20% coffee.", Math.random() < 0.25, "fun_yssa_9"],
                [() => "The equation was unsolvable. Yssabelle doodled a heart. It worked. We're concerned.", Math.random() < 0.2, "fun_yssa_10"],
                [() => "WARNING: Yssabelle just filed a bug report against math. It was approved.", Math.random() < 0.2, "fun_yssa_11"],
                [() => "Legend says if you say 'Yssabelle' three times near a math exam, the formulas will rearrange themselves out of fear.", Math.random() < 0.2, "fun_yssa_12"],
                [() => "We asked Yssabelle to calculate the limit. She said 'my patience'.", Math.random() < 0.2, "fun_yssa_13"],
                [() => "Yssabelle just drew a cat instead of solving the problem... and got an A+. Professor is reevaluating reality.", Math.random() < 0.2, "fun_yssa_14"],
                [() => "Yssabelle found a loophole in the test instructions and scored 110%. With doodles.", Math.random() < 0.2, "fun_yssa_15"],

                // Yssabelle (PALDO) Funny News
                [() => "Yssabelle tried budgeting. It failed. The universe just gave her more money.", Math.random() < 0.2, "fun_yssa_16"],
                [() => "BREAKING: Yssabelle turned homework into PALDO. Teachers are both impressed and scared.", Math.random() < 0.2, "fun_yssa_17"],
                [() => "Update: Yssabelle's lunch became a gold buffet. Students now eat for free.", Math.random() < 0.2, "fun_yssa_18"],
                [() => "Report: Yssabelle smiled at a coin. The coin gained interest overnight.", Math.random() < 0.2, "fun_yssa_19"],
                [() => "FINAL UPDATE: Yssabelle is now officially a walking, talking, breathing PALDO generator.", Math.random() < 0.2, "fun_yssa_20"],
                [() => "Yssabelle's calculator now prints money instead of numbers. Economists are baffled.", Math.random() < 0.2, "fun_yssa_21"],
                [() => "Yssabelle just turned her math notes into a business plan. Investors are calling.", Math.random() < 0.2, "fun_yssa_22"],
                [() => "BREAKING: Yssabelle's budget spreadsheet now predicts stock market trends accurately.", Math.random() < 0.2, "fun_yssa_23"],
                [() => "Yssabelle whispered 'PALDO' and her piggy bank exploded with coins.", Math.random() < 0.2, "fun_yssa_24"],
                [() => "Yssabelle's presence increases local GDP by 9.17% instantly.", Math.random() < 0.2, "fun_yssa_25"],

                // Alaine Funny News
                [() => "BREAKING: Alaine's heartlight was spotted glowing so bright, it blinded 3 streetlights in Hà Nội.", Math.random() < 0.4, "fun_alaine_1"],
                [() => "Report: Alaine smiled at her phone, and it started charging by pure golden energy.", Math.random() < 0.35, "fun_alaine_2"],
                [() => "Alaine waved hello — satellites mistook it as a solar flare.", Math.random() < 0.3, "fun_alaine_3"],
                [() => "Locals report: Alaine's laughter can power 9.17 lightbulbs for 9.17 days straight.", Math.random() < 0.3, "fun_alaine_4"],
                [() => "NEW DISCOVERY: Alaine's golden aura attracts butterflies, Wi-Fi signals, and random good luck.", Math.random() < 0.3, "fun_alaine_5"],
                [() => "BREAKING: Alaine said 'Stay Golden!' — and someone's phone wallpaper literally turned gold.", Math.random() < 0.25, "fun_alaine_6"],
                [() => "Alaine's heartlight pulse synced perfectly with YooA's rhythm... Scientists call it the 'Miracle Resonance.'", Math.random() < 0.25, "fun_alaine_7"],
                [() => "Fun fact: Alaine once sneezed glitter. The world hasn't recovered yet.", Math.random() < 0.25, "fun_alaine_8"],
                [() => "NEW TREND: People in Hà Nội now wear sunglasses at night. Reason: Alaine walked by.", Math.random() < 0.2, "fun_alaine_9"],
                [() => "Alaine's smile was declared an alternative energy source by MIRACLE scientists.", Math.random() < 0.2, "fun_alaine_10"],

                // Funny Serille
                [() => "Serille finished all tasks, made tea, and waited politely. You were still loading.", Math.random() < 0.35, "serille_fun_1"],
                [() => "Serille blinked. Three objectives vanished. Nobody saw how.", Math.random() < 0.3, "serille_fun_2"],
                [() => "Speedrun detected! Serille completed tasks without triggering animations.", Math.random() < 0.25, "serille_fun_3"],
                [() => "Serille is so calm that even the countdown timer relaxed.", Math.random() < 0.35, "serille_fun_4"],
                [() => "Witness report: Serille completed tasks *before* reading the instructions.", Math.random() < 0.25, "serille_fun_5"],
                [() => "Serille walked through the task room. Everything auto-completed out of respect.", Math.random() < 0.3, "serille_fun_6"],
                [() => "Serille asked, 'Is that all?' The universe felt judged.", Math.random() < 0.2, "serille_fun_7"],
                [() => "Serille finished tasks during a system lag. Authorities confused.", Math.random() < 0.25, "serille_fun_8"],
                [() => "Even Serille's idle animation completes tasks.", Math.random() < 0.3, "serille_fun_9"],
                [() => "Serille completed 10 tasks in silence. Nobody clapped. Everyone feared her.", Math.random() < 0.25, "serille_fun_10"],

                // Funny Regina
                [() => "Regina inspected the task list. Half of it fixed itself in shame.", Math.random() < 0.35, "regina_fun_1"],
                [() => "Regina reorganized the UI. Buttons now behave.", Math.random() < 0.3, "regina_fun_2"],
                [() => "Regina finished a task so cleanly it sparkled.", Math.random() < 0.25, "regina_fun_3"],
                [() => "Regina stared at inefficiency. It left.", Math.random() < 0.3, "regina_fun_4"],
                [() => "Regina completed a task with such precision the tutorial updated.", Math.random() < 0.25, "regina_fun_5"],
                [() => "Regina does not spam clicks. Each click has purpose.", true, "regina_fun_6"],
                [() => "Regina reviewed your progress. She nodded once. That's approval.", Math.random() < 0.3, "regina_fun_7"],
                [() => "A task tried to glitch. Regina said no.", Math.random() < 0.25, "regina_fun_8"],
                [() => "Regina's task order was so perfect the system stopped randomizing.", Math.random() < 0.25, "regina_fun_9"],
                [() => "Regina completed objectives wearing metaphorical heels. Gracefully.", Math.random() < 0.3, "regina_fun_10"],

                // Funny Serille × Regina
                [() => "Serille finished the tasks. Regina checked them. Both were satisfied. Rare event.", Math.random() < 0.2, "serina_fun_1"],
                [() => "Serille moved too fast. Regina slowed time to review perfection.", Math.random() < 0.2, "serina_fun_2"],
                [() => "Calm speed met royal discipline. The server whispered 'okay sorry'.", Math.random() < 0.2, "serina_fun_3"],
                [() => "Serille cleared tasks instantly. Regina made it official.", Math.random() < 0.25, "serina_fun_4"],
                [() => "When Serille and Regina work together, even Ahn Jean behaves. Briefly.", Math.random() < 0.15, "serina_fun_5"],

                // 🌸 Miraculous News (Euryle & Alaine)
                [() => "BREAKING: Euryle just trailed pink, blue, and gold in the sky forming 'YooA' and 'Arin'. Astronomers are confused.", Math.random() < 0.4, "miracle_euryle_1"],
                [() => "Report: Euryle's aura caused all nearby devices to play OH MY GIRL songs simultaneously.", Math.random() < 0.35, "miracle_euryle_2"],
                [() => "Scientists baffled: Euryle's MIRACLE energy temporarily turned her coffee into starlight.", Math.random() < 0.3, "miracle_euryle_3"],
                [() => "ALERT: Euryle just winked, and your progress bars instantly filled halfway.", Math.random() < 0.25, "miracle_euryle_4"],
                [() => "Euryle performed the 'YooAity move' and accidentally created a mini black hole… oops!", Math.random() < 0.2, "miracle_euryle_5"],

                [() => "BREAKING: Alaine's golden Heartlight pulsed across the map, calming chaos and guiding lost items.", Math.random() < 0.4, "miracle_alaine_1"],
                [() => "Report: Alaine's pulse synced with 7 players' actions perfectly. Coincidence? We think not.", Math.random() < 0.35, "miracle_alaine_2"],
                [() => "Scientists baffled: Alaine's golden aura increased everyone's PALDO gain by 17.3%.", Math.random() < 0.3, "miracle_alaine_3"],
                [() => "ALERT: Alaine just calmed a SUS storm! Players everywhere sighed in relief.", Math.random() < 0.25, "miracle_alaine_4"],
                [() => "FINAL UPDATE: Alaine and Euryle teamed up — pink, blue, gold, and golden beams intertwined, forming a magical rainbow over Celestia.", Math.random() < 0.22, "miracle_team_1"],

                [() => "BREAKING: YooA just performed in Hà Nội! Locals report pink and gold lights trailing across the Red River.", Math.random() < 0.8, "hanoi_1"],
                [() => "Report: Euryle's MIRACLE aura caused all street performers in Hà Nội to dance in sync.", Math.random() < 0.65, "hanoi_2"],
                [() => "ALERT: Alaine's golden Heartlight pulsed across Hoàn Kiếm Lake, calming traffic and boosting everyone's PALDO!", Math.random() < 0.6, "hanoi_3"],
                [() => "BREAKING: Ahn Jean entered the Old Quarter. Vendors reported sudden SUS vibes… chaos ensued at 19:19.", Math.random() < 0.45, "hanoi_4"],
                [() => "FINAL UPDATE: The combined MIRACLE energies of YooA, Euryle, and Alaine created a rainbow over the Temple of Literature — magic confirmed!", Math.random() < 0.7, "hanoi_5"],
                [() => "BREAKING: YooA's concert in Hà Nội just caused a temporary surge in PALDO across the city!", Math.random() < 0.5, "hanoi_6"],
                [() => "Report: Euryle's MIRACLE energy made all street food taste even better. Phở vendors are grateful.", Math.random() < 0.4, "hanoi_7"],
                [() => "Scientists baffled: Alaine's golden Heartlight increased local Wi-Fi speeds by 17.3% during the concert!", Math.random() < 0.3, "hanoi_8"],
                [() => "ALERT: Ahn Jean tried to vent in the Old Quarter but got lost in the maze of alleys instead!", Math.random() < 0.25, "hanoi_9"],
                [() => "FINAL UPDATE: The MIRACLE energies from YooA, Euryle, Alaine, and even Ahn Jean created a spectacular light show over the Long Biên Bridge!", Math.random() < 0.6, "hanoi_10"],
                // 🌆 More Hà Nội News
                [() => "BREAKING: Serille was spotted near Hoàn Kiếm Lake. Tasks across the city auto-completed in silence.", Math.random() < 0.45, "hanoi_11"],
                [() => "Report: Regina walked through a Hà Nội café. The queue reorganized itself into perfect order.", Math.random() < 0.4, "hanoi_12"],
                [() => "ALERT: YooA waved from the stage — nearby buildings started glowing pink and gold.", Math.random() < 0.7, "hanoi_13"],
                [() => "BREAKING: Euryle tripped slightly in Hà Nội. The sky responded with pink, blue, and gold apologies.", Math.random() < 0.55, "hanoi_14"],
                [() => "Scientists baffled: Alaine's Heartlight reflected off West Lake, calming drivers instantly.", Math.random() < 0.5, "hanoi_15"],
                [() => "REPORT: Ahn Jean asked 'Is this vent?' in the Old Quarter. Locals replied 'This is a café.'", Math.random() < 0.35, "hanoi_16"],
                [() => "BREAKING: Kimberly's dark aura caused all neon signs in Hà Nội to enter aesthetic mode.", Math.random() < 0.3, "hanoi_17"],
                [() => "ALERT: Yssabelle visited a Hà Nội market. PALDO detected. Vendors smiling uncontrollably.", Math.random() < 0.45, "hanoi_18"],
                [() => "Report: Regina inspected a Hà Nội crosswalk. Traffic lights now obey flawlessly.", Math.random() < 0.35, "hanoi_19"],
                [() => "BREAKING: Serille crossed the street so calmly that time slowed to let her pass.", Math.random() < 0.4, "hanoi_20"],
                [() => "ALERT: YooA sang one note backstage. Nearby pigeons formed perfect choreography.", Math.random() < 0.6, "hanoi_21"],
                [() => "Report: Euryle's MIRACLE aura caused lanterns in Hà Nội to glow brighter in YooA colors.", Math.random() < 0.5, "hanoi_22"],
                [() => "BREAKING: Alaine and Euryle walked together — witnesses reported a rainbow reflection on every window.", Math.random() < 0.55, "hanoi_23"],
                [() => "SUS ALERT: Ahn Jean said 'Trust me' near Long Biên Bridge. Everyone ran. Correct choice.", Math.random() < 0.3, "hanoi_24"],
                [() => "FINAL UPDATE: Hà Nội night sky confirmed MIRACLE-certified after YooA, Euryle, and Alaine smiled at once.", Math.random() < 0.65, "hanoi_25"],

                // Funny Hà Nội and Việt Nam news
                [() => "BREAKING: A street vendor in Hà Nội just sold a bowl of phở that granted infinite PALDO!", Math.random() < 0.4, "fun_hanoi_1"],
                [() => "Report: A motorbike in Hà Nội was seen zipping around so fast it created a mini time loop!", Math.random() < 0.35, "fun_hanoi_2"],
                [() => "ALERT: A stray dog in Hà Nội just completed a task list faster than any player!", Math.random() < 0.3, "fun_hanoi_3"],
                [() => "BREAKING: A café in Hà Nội accidentally brewed coffee that boosts YooAmatter gains by 9.17%!", Math.random() < 0.25, "fun_hanoi_4"],
                [() => "FINAL UPDATE: A street performer in Hà Nội just danced so well that nearby players received a morale boost!", Math.random() < 0.2, "fun_hanoi_5"],

                // Group (YooA, Arin, Hyojung, Mimi, Seunghee, Yubin, Euryle, Alaine, Serille, Regina, Ahn Jean, Kimberly, and Yssabelle) Hà Nội and Việt Nam
                [() => "BREAKING: The whole crew just visited Hà Nội! Locals report a sudden surge in MIRACLE energy and PALDO everywhere!", Math.random() < 0.5, "group_hanoi_1"],
                [() => "Report: Arin tried to organize a group photo in Hà Nội. Chaos ensued, but the vibes were immaculate.", Math.random() < 0.4, "group_hanoi_2"],
                [() => "ALERT: Euryle and Alaine teamed up to create a golden-pink light show over Hoàn Kiếm Lake!", Math.random() < 0.35, "group_hanoi_3"],
                [() => "BREAKING: Serille and Regina completed tasks so efficiently in Hà Nội that time itself paused to admire.", Math.random() < 0.3, "group_hanoi_4"],
                [() => "SUS ALERT: Ahn Jean tried to vent in a crowded Hà Nội market. Kimberly had to step in and restore order!", Math.random() < 0.25, "group_hanoi_5"],
                [() => "FINAL UPDATE: Yssabelle's unpredictable variable caused a spontaneous PALDO jackpot for everyone in Hà Nội!", Math.random() < 0.4, "group_hanoi_6"],

                // Funny Seoul and Korea news
                [() => "BREAKING: A street vendor in Seoul just sold a bowl of tteokbokki that granted infinite PALDO!", Math.random() < 0.4, "fun_seoul_1"],
                [() => "Report: A subway train in Seoul was seen zipping around so fast it created a mini time loop!", Math.random() < 0.35, "fun_seoul_2"],
                [() => "ALERT: A stray cat in Seoul just completed a task list faster than any player!", Math.random() < 0.3, "fun_seoul_3"],
                [() => "BREAKING: A café in Seoul accidentally brewed coffee that boosts YooAmatter gains by 9.17%!", Math.random() < 0.25, "fun_seoul_4"],
                [() => "FINAL UPDATE: A street performer in Seoul just danced so well that nearby players received a morale boost!", Math.random() < 0.2, "fun_seoul_5"],
                [() => "BREAKING: A convenience store in Seoul sold ramyeon so powerful it instantly maxed out stamina bars!", Math.random() < 0.4, "fun_seoul_6"],
                [() => "Report: An escalator in Myeongdong moved with such efficiency that Regina nodded in approval.", Math.random() < 0.35, "fun_seoul_7"],
                [() => "ALERT: A K-pop dance practice room in Seoul caused nearby XP to double just by existing!", Math.random() < 0.3, "fun_seoul_8"],
                [() => "BREAKING: A café in Hongdae played OH MY GIRL nonstop — MIRACLE levels spiked citywide!", Math.random() < 0.25, "fun_seoul_9"],
                [() => "FINAL UPDATE: A street busker hit a high note so clean that Serille auto-completed three tasks nearby.", Math.random() < 0.2, "fun_seoul_10"],

                // 🇰🇷 Korea-wide Chaos
                [() => "BREAKING: Korea experienced a sudden productivity spike. Experts blame Regina energy.", Math.random() < 0.35, "fun_korea_1"],
                [() => "Report: Nationwide Wi-Fi briefly synchronized during YooA's chorus. Engineers gave up.", Math.random() < 0.3, "fun_korea_2"],
                [() => "ALERT: Ahn Jean caused localized SUS near a crosswalk. Pedestrians voted instantly.", Math.random() < 0.25, "fun_korea_3"],
                [() => "BREAKING: Kimberly entered dark mode on a rainy day. Seoul lights dimmed aesthetically.", Math.random() < 0.25, "fun_korea_4"],
                [() => "FINAL UPDATE: Yssabelle's PALDO sense activated in Gangnam. Wallets felt nervous.", Math.random() < 0.3, "fun_korea_5"],

                // 🌸 Group in Seoul & Korea
                [() => "BREAKING: The entire crew arrived in Seoul — MIRACLE levels immediately normalized to 'too high'.", Math.random() < 0.45, "group_seoul_1"],
                [() => "Report: YooA waved in Seoul. Three timelines collapsed into one better timeline.", Math.random() < 0.35, "group_seoul_2"],
                [() => "ALERT: Euryle's MIRACLE trail reflected off Han River — pink, blue, gold confirmed!", Math.random() < 0.3, "group_seoul_3"],
                [() => "BREAKING: Alaine's Heartlight pulse calmed rush hour traffic. Drivers felt peace.", Math.random() < 0.3, "group_seoul_4"],
                [() => "Report: Serille walked through Seoul Station. Tasks finished themselves out of respect.", Math.random() < 0.25, "group_seoul_5"],
                [() => "ALERT: Regina reorganized a café line. Customers experienced spiritual order.", Math.random() < 0.25, "group_seoul_6"],
                [() => "SUS WARNING: Ahn Jean attempted to speedwalk. Kimberly corrected the timeline.", Math.random() < 0.2, "group_seoul_7"],
                [() => "FINAL UPDATE: Group photo in Seoul succeeded. Nobody knows how. Probably MIRACLE.", Math.random() < 0.35, "group_seoul_8"],

                // 🌆 Seoul Chaos Moments
                [() => "Seoul was calm… until Ahn Jean asked, 'What if we take different exits?'", Math.random() < 0.3, "seoul_chaos_1"],
                [() => "Serille restored calm in Seoul. Regina optimized it. Everyone else just followed.", Math.random() < 0.25, "seoul_chaos_2"],
                [() => "Kimberly stared at the skyline. Darkness aesthetic approved.", Math.random() < 0.25, "seoul_chaos_3"],
                [() => "Yssabelle said 'PALDO feels near.' A mall sale appeared instantly.", Math.random() < 0.3, "seoul_chaos_4"],

                // 🇰🇷 Wholesome Korea
                [() => "Everyone worked quietly in Seoul. Efficiency levels were… unsettling.", true, "korea_wholesome_1"],
                [() => "The group shared snacks. Morale increased. SUS decreased.", Math.random() < 0.3, "korea_wholesome_2"],
                [() => "You feel supported. Korea vibes detected.", true, "korea_wholesome_3"],

                // 🌏 Hà Nội × Seoul Crossover News
                [() => "BREAKING: Hà Nội and Seoul briefly synchronized time zones. Nobody noticed except Serille, who finished tasks in both.", Math.random() < 0.35, "hanoi_seoul_1"],
                [() => "Report: A livestream connected Hà Nội street food to Seoul cafés. PALDO gains spread internationally.", Math.random() < 0.3, "hanoi_seoul_2"],
                [() => "ALERT: YooA waved in Seoul while Euryle trailed MIRACLE lights over Hà Nội — satellites gave up.", Math.random() < 0.3, "hanoi_seoul_3"],
                [() => "BREAKING: Alaine's golden Heartlight pulsed from Hoàn Kiếm Lake to the Han River. Both cities felt calm.", Math.random() < 0.28, "hanoi_seoul_4"],
                [() => "Report: Ahn Jean caused SUS in Hà Nội at 19:19. Seoul felt it five seconds later. Experts concerned.", Math.random() < 0.25, "hanoi_seoul_5"],
                [() => "FINAL UPDATE: Regina reviewed efficiency levels in both cities. She approved Seoul. Hà Nội improved instantly.", Math.random() < 0.25, "hanoi_seoul_6"],

                // 🍜🍙 Funny City Moments
                [() => "BREAKING: Phở in Hà Nội and tteokbokki in Seoul formed an alliance. Hunger defeated worldwide.", Math.random() < 0.4, "hanoi_seoul_fun_1"],
                [() => "Report: A Hà Nội motorbike and a Seoul subway raced through space-time. Result: tie. Physics cried.", Math.random() < 0.35, "hanoi_seoul_fun_2"],
                [() => "ALERT: A Hà Nội dog and a Seoul cat completed tasks together. New meta discovered.", Math.random() < 0.3, "hanoi_seoul_fun_3"],
                [() => "BREAKING: Coffee brewed simultaneously in Hà Nội and Seoul boosted YooAmatter by 9.17% globally!", Math.random() < 0.3, "hanoi_seoul_fun_4"],
                [() => "FINAL UPDATE: Street performers in both cities danced at the same time. Morale went critical.", Math.random() < 0.25, "hanoi_seoul_fun_5"],

                // 🌸 Group in Hà Nội × Seoul
                [() => "BREAKING: The whole crew split between Hà Nội and Seoul. MIRACLE energy balanced perfectly.", Math.random() < 0.45, "group_hanoi_seoul_1"],
                [() => "Report: Arin tried to organize a dual-city group photo. Everyone blinked at different times.", Math.random() < 0.35, "group_hanoi_seoul_2"],
                [() => "ALERT: Euryle painted the sky pink-blue-gold over both cities. Distance no longer mattered.", Math.random() < 0.3, "group_hanoi_seoul_3"],
                [() => "BREAKING: Serille completed tasks in Hà Nội. Regina validated them from Seoul. Server relaxed.", Math.random() < 0.25, "group_hanoi_seoul_4"],
                [() => "SUS WARNING: Ahn Jean attempted to vent between cities. Kimberly closed the portal.", Math.random() < 0.2, "group_hanoi_seoul_5"],
                [() => "FINAL UPDATE: Yssabelle's PALDO sense triggered in both cities. Wallets screamed in harmony.", Math.random() < 0.35, "group_hanoi_seoul_6"],

                // 🌆 Dual-City Chaos
                [() => "Hà Nội was calm. Seoul was calm. Then Ahn Jean said 'What if we connect them?'", Math.random() < 0.3, "hanoi_seoul_chaos_1"],
                [() => "Serille calmed both cities simultaneously. Regina filed one report. Efficiency unmatched.", Math.random() < 0.25, "hanoi_seoul_chaos_2"],
                [() => "Kimberly stared at a map. Darkness spread aesthetically across borders.", Math.random() < 0.25, "hanoi_seoul_chaos_3"],
                [() => "Group conclusion: Hà Nội vibes + Seoul precision = unstoppable.", true, "hanoi_seoul_chaos_4"],

                // 💖 Wholesome Crossover
                [() => "Both cities felt supported. MIRACLE detected across borders.", true, "hanoi_seoul_wholesome_1"],
                [() => "Tasks completed quietly in two countries. Efficiency questioned.", Math.random() < 0.3, "hanoi_seoul_wholesome_2"],
                [() => "You feel watched over. Hà Nội and Seoul are smiling.", true, "hanoi_seoul_wholesome_3"],

                // 🌏 Việt Nam × Korea National News
                [() => "BREAKING: Việt Nam and Korea briefly shared the same vibe. Productivity and happiness spiked simultaneously.", Math.random() < 0.4, "vn_kr_1"],
                [() => "Report: A livestream between Việt Nam and Korea caused PALDO gains to synchronize across borders.", Math.random() < 0.35, "vn_kr_2"],
                [() => "ALERT: YooA waved in Korea while Euryle's MIRACLE trail appeared over Việt Nam. Distance officially cancelled.", Math.random() < 0.3, "vn_kr_3"],
                [() => "BREAKING: Alaine's golden Heartlight pulsed from Việt Nam to Korea, calming chaos nationwide.", Math.random() < 0.3, "vn_kr_4"],
                [() => "Report: Ahn Jean caused SUS in Việt Nam at 19:19. Korea felt it shortly after. Scientists concerned.", Math.random() < 0.25, "vn_kr_5"],
                [() => "FINAL UPDATE: Regina reviewed national efficiency. Korea passed. Việt Nam adapted instantly.", Math.random() < 0.25, "vn_kr_6"],

                // 🍜🍲 Food Diplomacy
                [() => "BREAKING: Phở and kimchi formed an alliance. Hunger was defeated internationally.", Math.random() < 0.45, "vn_kr_food_1"],
                [() => "Report: Coffee in Việt Nam and convenience-store ramyeon in Korea boosted YooAmatter by 9.17% globally.", Math.random() < 0.35, "vn_kr_food_2"],
                [() => "ALERT: Street food vendors in both countries received MIRACLE buffs.", Math.random() < 0.3, "vn_kr_food_3"],
                [() => "FINAL UPDATE: A single meal caused morale to hit maximum in two countries.", Math.random() < 0.25, "vn_kr_food_4"],

                // 🌸 Group Across Việt Nam × Korea
                [() => "BREAKING: The whole crew split between Việt Nam and Korea. MIRACLE energy stayed perfectly balanced.", Math.random() < 0.45, "group_vn_kr_1"],
                [() => "Report: Arin attempted a cross-country group photo. Everyone smiled. Time lagged.", Math.random() < 0.35, "group_vn_kr_2"],
                [() => "ALERT: Euryle painted both skies pink, blue, and gold. Satellites retired.", Math.random() < 0.3, "group_vn_kr_3"],
                [() => "BREAKING: Serille completed tasks in Việt Nam. Regina validated them from Korea. Servers relaxed.", Math.random() < 0.25, "group_vn_kr_4"],
                [() => "SUS WARNING: Ahn Jean tried to vent internationally. Kimberly closed the portal immediately.", Math.random() < 0.2, "group_vn_kr_5"],
                [() => "FINAL UPDATE: Yssabelle's PALDO sense triggered in both countries. Wallets trembled.", Math.random() < 0.35, "group_vn_kr_6"],

                // ⚠️ Cross-Border Chaos
                [() => "Việt Nam was calm. Korea was calm. Then Ahn Jean said, 'What if we connect them?'", Math.random() < 0.3, "vn_kr_chaos_1"],
                [() => "Serille calmed two nations at once. Regina filed one report. Efficiency peaked.", Math.random() < 0.25, "vn_kr_chaos_2"],
                [() => "Kimberly stared at a map. Darkness spread tastefully.", Math.random() < 0.25, "vn_kr_chaos_3"],
                [() => "Group conclusion: Việt Nam vibes + Korea precision = unstoppable combo.", true, "vn_kr_chaos_4"],

                // 💖 Wholesome Nation-Level
                [() => "Both countries felt supported. MIRACLE diplomacy confirmed.", true, "vn_kr_wholesome_1"],
                [() => "Tasks completed quietly across borders. Efficiency questioned by experts.", Math.random() < 0.3, "vn_kr_wholesome_2"],
                [() => "You feel watched over. Việt Nam and Korea are smiling.", true, "vn_kr_wholesome_3"],

                // 🚗 Celestia Cars & Timeline News
                [() => "BREAKING 18:00: Normal cars began swelling rapidly. Citizens reported 'why is my car breathing?'", Math.random() < 0.4, "car_1800_1"],
                [() => "ALERT 18:15: Cars reached √9.17 size. Parking lots entered panic mode.", Math.random() < 0.35, "car_1815_1"],
                [() => "FINAL UPDATE 18:30: CHUNKERS achieved. Cars now officially larger than responsibility.", Math.random() < 0.45, "car_1830_1"],

                [() => "BREAKING 19:00: Cars abruptly shrank back to normal and became Ahn Jean cars.", Math.random() < 0.4, "car_1900_1"],
                [() => "⚠️ SUS ALERT 19:19: Ahn Jean cars gained SUS. Turn signals became suspicious.", Math.random() < 0.45, "car_1919_1"],
                [() => "Report: Drivers voted their own cars during traffic. Nobody knows why.", Math.random() < 0.3, "car_1919_2"],

                [() => "BREAKING 20:00: Cars entered Cumpio dark mode. Headlights refused to turn on.", Math.random() < 0.4, "car_2000_1"],
                [() => "Report: Kimberly-approved darkness increased focus but reduced vibes.", Math.random() < 0.3, "car_2000_2"],

                [() => "ALERT 20:30: Golden pulses detected — Alaine Heartlight MIRACLE cars active!", Math.random() < 0.45, "car_2030_1"],
                [() => "Report: Traffic calmed instantly. Drivers felt emotionally supported.", Math.random() < 0.35, "car_2030_2"],

                [() => "BREAKING 21:00: Euryle MIRACLE cars appeared — pink, blue, and gold trails confirmed!", Math.random() < 0.45, "car_2100_1"],
                [() => "ALERT 21:17: YooAity activated. Cars started playing OH MY GIRL automatically.", Math.random() < 0.5, "car_2117_1"],

                [() => "BREAKING 21:15: Serille Serenity cars joined — serene shimmer trails detected.", Math.random() < 0.4, "car_2115_1"],
                [() => "Report: Cars completed routes before drivers realized they left.", Math.random() < 0.3, "car_2115_2"],

                [() => "ALERT 22:00: Yssabelle PALDO cars emerged — gardens installed on rooftops.", Math.random() < 0.45, "car_2200_1"],
                [() => "Report: Vehicles began generating passive income while parked.", Math.random() < 0.35, "car_2200_2"],

                [() => "BREAKING 22:30: Regina Royal cars entered — majestic aura, purple-gold comet trails!", Math.random() < 0.4, "car_2230_1"],
                [() => "FINAL UPDATE: Traffic lanes reorganized themselves. Regina approved.", Math.random() < 0.35, "car_2230_2"],

                [() => "BREAKING 23:00: Yssabelle PALDO cars returned to normal. Wallets sighed.", Math.random() < 0.35, "car_2300_1"],
                [() => "FINAL UPDATE 23:30: Regina Royal cars exited. Cars reverted to normal existence.", Math.random() < 0.4, "car_2330_1"],

                // 🌏 Viet Nam × Korea Car Reactions
                [() => "Report: Viet Nam drivers adapted instantly to CHUNKERS. Korea drivers measured everything.", Math.random() < 0.3, "car_vn_kr_1"],
                [() => "ALERT: Ahn Jean cars caused SUS traffic in both countries at exactly 19:19.", Math.random() < 0.35, "car_vn_kr_2"],
                [() => "BREAKING: Alaine Heartlight cars calmed rush hour in Seoul and Hà Nội simultaneously.", Math.random() < 0.4, "car_vn_kr_3"],
                [() => "FINAL UPDATE: Euryle MIRACLE cars made both skylines sparkle. Photos exceeded storage limits.", Math.random() < 0.45, "car_vn_kr_4"],

                // ⚠️ Car Chaos Moments
                [() => "Ahn Jean asked, 'What if cars vote?' Traffic lights immediately panicked.", Math.random() < 0.3, "car_chaos_1"],
                [() => "Serille Serenity cars finished everyone's commute early. Nobody complained.", Math.random() < 0.25, "car_chaos_2"],
                [() => "Regina Royal cars enforced lane discipline using pure aura.", Math.random() < 0.25, "car_chaos_3"],
                [() => "Kimberly dark cars absorbed all streetlight reflections. Aesthetic confirmed.", Math.random() < 0.25, "car_chaos_4"],
                [() => "Yssabelle PALDO cars planted money trees in parking spaces. Authorities confused.", Math.random() < 0.3, "car_chaos_5"],

                // 💖 Wholesome Cars
                [() => "Cars felt calm tonight. Timeline functioning perfectly.", true, "car_wholesome_1"],
                [() => "You feel safe driving. Celestia cars are watching over you.", true, "car_wholesome_2"],
                [() => "Traffic flowed smoothly. MIRACLE energy detected on the roads.", true, "car_wholesome_3"],

                // Group (YooA, Arin, Hyojung, Mimi, Seunghee, Yubin, Euryle, Alaine, Serille, Regina, Ahn Jean, Kimberly, and Yssabelle)
                [() => "Cosmic event: YooA and her friends just created a MIRACLE wave that boosted everyone's stats by 9.17%!", Math.random() < 0.3, "group_1"],
                [() => "Breaking: Arin's enthusiasm just caused a chain reaction of upgrades across the universe!", Math.random() < 0.25, "group_2"],
                [() => "Euryle and Alaine teamed up to create a golden-pink energy field that enhances all YooAmatter gains!", Math.random() < 0.2, "group_3"],
                [() => "Serille and Regina's teamwork just optimized task completion rates by 17.3%!", Math.random() < 0.15, "group_4"],
                [() => "Ahn Jean's sus vibes were neutralized by Kimberly's dark energy, restoring balance to the multiverse!", Math.random() < 0.2, "group_5"],
                [() => "Yssabelle's unpredictable variable just caused a spontaneous PALDO jackpot for all players!", Math.random() < 0.25, "group_6"],
                [() => "The entire crew just performed a synchronized dance that boosted everyone's morale and productivity!", Math.random() < 0.3, "group_7"],

                // Group Chaos Moments
                [() => "The group was calm… until Ahn Jean asked 'What if we press everything?'", Math.random() < 0.3, "group_chaos_1"],
                [() => "Serille calmed the chaos. Regina fixed it. Ahn Jean broke it again. Balance restored.", Math.random() < 0.25, "group_chaos_2"],
                [() => "Kimberly stared. Yssabelle vibed. The problem solved itself.", Math.random() < 0.25, "group_chaos_3"],
                [() => "Group meeting outcome: Progress increased, logic questioned, vibes immaculate.", true, "group_chaos_4"],
                [() => "Ahn Jean caused SUS. Serille neutralized it. Regina filed a report.", Math.random() < 0.25, "group_chaos_5"],

                // Group Wholesome
                [() => "Everyone worked quietly together. It was… suspiciously efficient.", true, "group_wholesome_1"],
                [() => "The group didn't speak. Tasks still completed perfectly.", Math.random() < 0.25, "group_wholesome_2"],
                [() => "You feel supported. The group is nearby.", true, "group_wholesome_3"],
                [() => "Progress feels lighter today. Group harmony detected.", Math.random() < 0.3, "group_wholesome_4"],

                // Math + Group
                [() => "Yssabelle tried to calculate the group's efficiency. The answer was 'infinite vibes'.", Math.random() < 0.25, "group_math_1"],
                [() => "Alaine's Heartlight synced with Euryle's MIRACLE energy, creating a golden-pink mathematical harmony.", Math.random() < 0.2, "group_math_2"],
                [() => "Serille calculated the optimal task order. Regina approved it with royal precision.", Math.random() < 0.2, "group_math_3"],
                [() => "Kimberly attempted to quantify Ahn Jean's sus level. The result was 'undefined'.", Math.random() < 0.25, "group_math_4"],
                [() => "YooA's energy output just caused a mathematical anomaly: 9.17% increase in all stats across the board!", Math.random() < 0.3, "group_math_5"],
                [() => "The group's combined vibes just created a feedback loop of positivity and productivity!", Math.random() < 0.3, "group_math_6"],
                [() => "Yssabelle's calculations just predicted a 100% chance of good vibes whenever the group is together!", Math.random() < 0.25, "group_math_7"],
                [() => "Euryle and Alaine's energy signatures just formed a perfect mathematical ratio, enhancing everyone's YooAmatter gains!", Math.random() < 0.2, "group_math_8"],
                [() => "Serille and Regina's efficiency algorithms just broke the internet with a 17.3% boost in task completion rates!", Math.random() < 0.15, "group_math_9"],
                [() => "Ahn Jean's sus level just spiked… but Kimberly's dark energy balanced it out perfectly!", Math.random() < 0.2, "group_math_10"],

                // About Rare news
                [() => "A glitch in the simulation? YooA just blinked and rewrote history!", Math.random() < 0.1, "rare_01"],
                [() => "Breaking: All known scientific constants have been replaced by YooA!", Math.random() < 0.05, "rare_02"],
                [() => "Astronomers baffled: A new star appeared, shaped like YooA!", Math.random() < 0.05, "rare_03"],
                [() => "Oops! Looks like YooA accidentally duplicated the universe again!", Math.random() < 0.1, "rare_04"],
                [() => "YooA's voice just caused a quantum resonance across the multiverse!", Math.random() < 0.05, "rare_05"],
                [() => "Error 404: Reality not found. Please try again after YooA resets it.", Math.random() < 0.1, "rare_06"],
                [() => "NASA confirms: The Milky Way is now officially called 'YooA Way'!", Math.random() < 0.02, "rare_07"],
                [() => "Time paradox detected! YooA's debut song just predated the Big Bang!", Math.random() < 0.03, "rare_08"],
                [() => "The YooA Paradox: The more you listen to her, the more time accelerates!", Math.random() < 0.05, "rare_09"],
                [() => "A mysterious force just upgraded your YooA Points by 9.170 quattuorsexagintisescentillion times!", Math.random() < 0.00917, "rare_10"],
                [() => "It is a MIRACLE to get this message!", Math.random() < 0.001, "rare_11"],
                [() => "It is a 1 in a YooA chance to get this message!", Math.random() < 0.917 / 1995, "rare_12"],
                [() => "You win the MIRACLE lottery!", Math.random() < 1e-8, "rare_13"],

                // About Rare news featuring YooA, Euryle, Alaine, Ahn Jean, Kimberly, and Yssabelle
                [() => "A cosmic ripple has occurred: YooA's song is now the official soundtrack of the entire universe!", Math.random() < 0.04, "rare_14"],
                [() => "Breaking: Arin just unlocked the secret of immortality with a single high note. She's now timeless!", Math.random() < 0.03, "rare_15"],
                [() => "Euryle just bent the laws of physics. Her favorite dance move now powers every atom in existence!", Math.random() < 0.05, "rare_16"],
                [() => "Ahn Jean accidentally created an infinite loop of 'SUS' that's now repeating in every timeline. We're all stuck!", Math.random() < 0.07, "rare_17"],
                [() => "Yssabelle just solved the universe's greatest equation: Love + Music = Eternity.", Math.random() < 0.04, "rare_18"],
                [() => "Kimberly has discovered a way to extract YooAmatter from thoughts. She's now a walking power generator!", Math.random() < 0.05, "rare_19"],
                [() => "Breaking: Euryle's laugh just rewired the multiverse. Now, every alternate reality is slightly funnier!", Math.random() < 0.03, "rare_20"],
                [() => "YooA just caused the sky to shimmer in a thousand colors, creating a new Aurora Borealis across all worlds!", Math.random() < 0.06, "rare_21"],
                [() => "Ahn Jean has just found a glitch in the matrix—now all doors lead to different dimensions depending on your mood.", Math.random() < 0.05, "rare_22"],
                [() => "Yssabelle just calculated the speed of light in her head, and the result was 'Infinity', followed by an explosion of sparkles.", Math.random() < 0.04, "rare_23"],
                [() => "YooA's voice has officially crossed over into other dimensions. Now, even parallel YooA's are singing her songs!", Math.random() < 0.04, "rare_24"],
                [() => "Breaking news: Kimberly and Ahn Jean just teamed up to create a paradox that turns every coffee cup into a galaxy!", Math.random() < 0.06, "rare_25"],
                [() => "Euryle has just unlocked a hidden ability: every dog in existence is now her ally. She's unstoppable!", Math.random() < 0.05, "rare_26"],
                [() => "YooA has just rewritten the laws of probability—now winning the lottery is a guaranteed daily event!", Math.random() < 0.02, "rare_27"],
                [() => "Arin just realized she's the key to the universe's reset. She can reboot existence with a single wink!", Math.random() < 0.03, "rare_28"],
                [() => "Breaking: Yssabelle just created a song so beautiful that it reversed entropy for a split second. Everything was perfect.", Math.random() < 0.03, "rare_29"],
                [() => "Ahn Jean has discovered the perfect blend of chaos and order. The universe now operates on 'SUS' logic, and it works surprisingly well!", Math.random() < 0.06, "rare_30"],
                [() => "Euryle's voice has just amplified so much, it created a new dimension where every sound echoes forever.", Math.random() < 0.04, "rare_31"],
                [() => "YooA's dance moves have been deemed a universal constant. Now, they're the basis for all movement across all galaxies!", Math.random() < 0.05, "rare_32"],

                // 🌸 Rare News (YooA, Arin, Hyojung, Mimi, Seunghee, Yubin, Euryle, Alaine, Ahn Jean, Kimberly, and Yssabelle)
                [() => "BREAKING RARE NEWS: YooA just declared Euryle 'the Miraculous of MIRACLEs.' Euryle fainted from joy.", Math.random() < 0.04, "fun_rare_1"],
                [() => "Report: Ahn Jean tried to vote out Kimberly. Kimberly darkly replied, 'Too late. I voted you first.'", Math.random() < 0.035, "fun_rare_2"],
                [() => "Euryle shouted 'YooA #1!! Arin #1!!' so loudly that nearby Wi-Fi networks became MIRACLE-fied.", Math.random() < 0.03, "fun_rare_3"],
                [() => "Yssabelle attempted to invest in 'YooAcoin'. It turned into PALDO in 9.17 seconds.", Math.random() < 0.03, "fun_rare_4"],
                [() => "BREAKING: Kimberly Cumpio entered dark mode manually. The entire classroom lights dimmed automatically.", Math.random() < 0.03, "fun_rare_5"],
                [() => "Euryle's YooA shrine gained sentience and now sings 'Dun Dun Dance' at 21:17 every night.", Math.random() < 0.025, "fun_rare_6"],
                [() => "YooA's Miracle Market launched a limited edition 'SUS-detector.' It broke when Ahn Jean entered.", Math.random() < 0.025, "fun_rare_7"],
                [() => "Breaking News: Alaine's golden pulse reached Euryle's pink aura — they formed a rainbow over Quezon City.", Math.random() < 0.025, "fun_rare_8"],
                [() => "Kimberly said, 'Darkness is my comfort.' The lights flickered, and Yssabelle's wallet screamed 'PALDO!'", Math.random() < 0.02, "fun_rare_9"],
                [() => "FINAL UPDATE: YooA, Euryle, Alaine, Ahn Jean, Kimberly, and Yssabelle are forming a band — name undecided, but probably 'The Miraculous SUSlights'.", Math.random() < 0.02, "fun_rare_10"],
                [() => "Arin just blinked once — and three students suddenly became MIRACLE fans.", Math.random() < 0.03, "fun_rare_11"],
                [() => "Mimi dropped a beat so powerful it fixed Euryle's Wi-Fi and summoned Ahn Jean from another timeline.", Math.random() < 0.03, "fun_rare_12"],
                [() => "Seunghee laughed too hard. Half the Celestia crew entered emotional critical state due to joy overload.", Math.random() < 0.025, "fun_rare_13"],
                [() => "Hyojung tried to organize a group photo, but everyone was too busy orbiting YooA.", Math.random() < 0.03, "fun_rare_14"],
                [() => "Yubin accidentally pressed the wrong button — now every announcement in Celestia ends with 'YooA #1!'", Math.random() < 0.03, "fun_rare_15"],
                [() => "Euryle declared 21:17 as National YooA Time. Even clocks started smiling.", Math.random() < 0.025, "fun_rare_16"],
                [() => "BREAKING: Ahn Jean tried to explain 'SUSSITY' to Kimberly. She replied, 'Darkness doesn't do math.'", Math.random() < 0.025, "fun_rare_17"],
                [() => "Yssabelle was seen watering her PALDO garden again — new sprouts labeled '₱9.17k each'.", Math.random() < 0.025, "fun_rare_18"],
                [() => "Alaine's Heartlight pulse synchronized with Arin's smile — satellites reported 'too much perfection'.", Math.random() < 0.025, "fun_rare_19"],
                [() => "Celestia scientists confirm: whenever YooA giggles, Euryle gains +9.17 joy per second.", Math.random() < 0.02, "fun_rare_20"],
            ];
        },
        startTicker() {
            if (this.tickerRunning) return; // Prevent multiple instances
            this.tickerRunning = true;
            this.scrollNextMessage();
        },

        stopTicker() {
            this.tickerRunning = false;
            const ticker = document.getElementById("ticker");
            if (ticker) {
                ticker.style.transition = "none";
                ticker.style.transform = "translateX(0)";
            }
        },

        scrollNextMessage() {
            if (!this.tickerRunning) return;

            this.updateNewsArray();
            let nextMsgIndex;
            try {
                do {
                    nextMsgIndex = Math.floor(Math.random() * this.newsArray.length);
                } while (!eval(this.newsArray[nextMsgIndex][1]) || nextMsgIndex === this.lastMsgIndex);
            } catch (e) {
                console.log("Error with news array at index " + nextMsgIndex);
            }

            const message = this.newsArray[nextMsgIndex][0]();
            const ticker = document.getElementById("ticker");
            if (!ticker) return;
            ticker.innerHTML = message;

            const parentWidth = ticker.parentElement.clientWidth;
            const tickerWidth = ticker.clientWidth;
            const dist = parentWidth + tickerWidth + 20;

            ticker.style.transition = "";
            ticker.style.transform = `translateX(${parentWidth}px)`;

            setTimeout(() => {
                if (!this.tickerRunning) return; // Prevent movement if disabled mid-animation

                ticker.style.transition = `transform ${dist / 250}s linear`;
                ticker.style.transform = `translateX(-${tickerWidth + 5}px)`;

                const transitionEndHandler = () => {
                    ticker.removeEventListener("transitionend", transitionEndHandler);
                    this.lastMsgIndex = nextMsgIndex;
                    this.scrollNextMessage();
                };

                ticker.addEventListener("transitionend", transitionEndHandler);
            }, 100);
        },
    },
};
</script>

<style scoped>
.news-ticker {
    width: 100%;
    overflow: hidden;
    background: #222;
    color: white;
    padding: 10px 0;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    text-align: left;
}

.news-ticker-wrapper {
    white-space: nowrap;
    position: relative;
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    transition: transform 0s linear;
}
</style>
