<template>
    <div class="news-ticker" v-if="optionsNews">
        <div class="news-ticker-wrapper" id="ticker"></div>
    </div>
</template>

<script>
import { gameLayers, hasUpgrade } from '@/incremental/main';

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
                [() => "Arin is now autobuying upgrades for you! Thank her later!", player.Arin.gte(1), "arin_1"],
                [() => "Arin joins the game!", player.Arin.gte(1), "arin_2"],
                [() => "Arin is the best autobuyer! Change my mind.", player.Arin.gte(1), "arin_3"],
                [() => "Arin believes in you! Keep going!", player.Arin.gte(1), "arin_4"],
                [() => "Arin's presence makes progression smoother!", player.Arin.gte(10), "arin_5"],
                [() => "Arin's support boosts all of YooA's powers!", player.Arin.gte(100), "arin_6"],
                [() => "Arin once tried to measure her own speed, but ended up lapping time itself!", player.Arin.gte(1), "arin_7"],
                [() => "Arin: 'I wonder if there's an upgrade that can buy me coffee while I buy your upgrades?'", player.Arin.gte(1), "arin_8"],
                [() => "Arin was last seen converting intangible achievements into tangible confetti!", player.Arin.gte(1) && Math.random() < 0.2, "arin_9"],
                [() => "Arin's dedication is unstoppable! She won't sleep until you reach your goals!", player.Arin.gte(1) && Math.random() < 0.2, "arin_10"],
                [() => "Arin's efficiency now rivals the speed of light!", player.Arin.gte(100), "arin_11"],
                [() => "Arin's upgrades bring a cosmic harmony to the game!", player.Arin.gte(200), "arin_12"],
                [() => "Even Arin needs a break sometimes, but not today!", player.Arin.gte(300), "arin_13"],
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
                [() => "Arin discovered a new dimension: It's labeled 'Infinity + 1'!", player.Arin.gte(200), "fun_6"],
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

                ticker.style.transition = `transform ${dist / 150}s linear`;
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
