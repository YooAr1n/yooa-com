<template>
    <div class="math-problem-container">
        <h2>Digits: {{ formatDigits }}</h2>
        <h2>{{ problem }}</h2>
        <h2 id="correct" v-if="showCorrect" :style="{ color: isCorrect ? '#7bff7b' : '#ff7b7b' }">
            {{ correct }}
        </h2>
        <input v-model="userAnswer" type="text" :id="refName" :name="refName" placeholder="Your answer"
            @keyup.enter="submit" :disabled="showCorrect" />
        <br />
        <button @click="submit" :disabled="showCorrect">
            Submit
        </button>
    </div>
</template>

<script>
import { player } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/layersData.js";

function wrap(n) {
    return n < 0 ? `(${n})` : `${n}`
}

export function generateNewProblem(layerName) {  // Accept layerName as a parameter
    const getRandomNumber = (idx) => {
        let num;
        do {
            let digs = gameLayers[layerName].digits(); // Use the passed layerName here
            if (layerName === "YooAity" && idx === 1) {
                digs *= 3
            }
            let x = Math.round(10 ** digs - 1);
            num = Math.floor(Math.random() * (x * 2 + 1)) - x; // Range: -9 to 9
        } while (num === 0 && !(layerName === "YooAity" && idx === 2));
        return num;
    };

    let num1 = getRandomNumber(1); // Pass layerName to getRandomNumber
    let num2 = getRandomNumber(2); // Pass layerName to getRandomNumber

    let operations;
    if (layerName === "YooA") {
        // For YooA layer: Addition and Subtraction
        operations = ["+", "-"];
    } else if (layerName === "YooAmatter") {
        // For YooAmatter layer: Multiplication and Division
        operations = ["*", "/"];
    } else if (layerName === "YooAity") {
        // For YooAity layer: Exponent
        operations = ["^"];
    } else {
        // Default operations in case of an invalid layerName
        operations = ["+", "-"];
    }

    const operation = operations[Math.floor(Math.random() * operations.length)];

    let correctAnswer;
    let problemText;

    switch (operation) {
        case "+":
            correctAnswer = num1 + num2;
            problemText = `${num1} + ${num2}`;
            break;
        case "-":
            correctAnswer = num1 - num2;
            problemText = `${num1} - ${num2}`;
            break;
        case "*":
            correctAnswer = num1 * num2;
            problemText = `${num1} * ${num2}`;
            break;
        case "/":
            // Avoid division by zero
            if (num2 === 0) {
                num2 = 1; // Prevent division by zero
            }
            correctAnswer = num1;
            problemText = `${num1 * num2} / ${num2}`;
            break;
        case "^": {
            // Only flip a coin for negative bases
            let useParen = false
            if (num1 < 0) {
                useParen = Math.random() < 0.5
            }

            let baseText, computedAnswer

            if (num1 < 0) {
                // negative base: either (–4)^2 or –4^2
                if (useParen) {
                    baseText = `(${num1})`
                    computedAnswer = num1 ** num2
                } else {
                    baseText = `${num1}`
                    computedAnswer = -((Math.abs(num1)) ** num2)
                }
            } else {
                // positive base: always plain exponent
                baseText = `${num1}`
                computedAnswer = num1 ** num2
            }

            // Exponent never needs parentheses around it
            const expText = `${num2}`;

            problemText = `${baseText} ^ ${expText}`
            correctAnswer = computedAnswer
            break;
        }
    }

    player.math[layerName].mathProblem = problemText;
    player.math[layerName].correctAnswer = correctAnswer;
    player.math[layerName].lastBase = num1;
    player.math[layerName].lastExp = num2;
}

export default {
    name: "MathProblem",
    data() {
        return {
            formatDigits: "",
            problem: "",
            problemGain: Decimal.dZero,
            correctAnswer: "",
            lastBase: null,
            lastExp: null,
            isCorrect: false,
            showCorrect: false,
            userAnswer: "", // Store the user's input
        };
    },
    props: {
        layerName: {
            type: String,
            required: true
        },
        refName: {
            type: String,
            required: true
        },
    },
    computed: {
        correct() {
            if (this.isCorrect) return "Correct! " + this.correctText(this.layerName)

            // Build fraction form *only* if exponent was negative
            let fracForm = null
            // only when exponent is negative:
            if (this.lastExp < 0) {
                // ✅ derive sign from the actual correctAnswer
                const den = Math.abs(this.lastBase) ** Math.abs(this.lastExp)
                const sign = Math.sign(this.correctAnswer)  // -1 for negative result, +1 for positive
                fracForm = `${sign === -1 ? '-' : ''}1/${den}`
            }

            const decForm = this.correctAnswer.toString()

            if (fracForm && this.layerName === "YooAity") return `Incorrect! The correct answer is ${fracForm} or ${decForm}.`
            return `Incorrect! The correct answer is ${decForm}.`
        },
    },
    methods: {
        update() {
            const layer = this.layerName
            this.formatDigits = format(gameLayers[layer].digits())
            if (layer === "YooAity") this.formatDigits = format(gameLayers[layer].digits() * 3) + " (base), " + this.formatDigits + " (exponent)"
            this.problem = player.math[layer].mathProblem;
            this.problemGain = gameLayers[layer].problemGain();
            this.correctAnswer = player.math[layer].correctAnswer
            this.isCorrect = player.math[layer].isCorrect;
            this.showCorrect = player.math[layer].showCorrect;
            this.lastBase = player.math[this.layerName].lastBase
            this.lastExp = player.math[this.layerName].lastExp
        },
        parseAnswer(raw) {
            raw = raw.trim()
            // If it looks like a fraction “a/b”
            if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(raw)) {
                const [num, den] = raw.split('/').map(Number)
                if (den === 0) return NaN
                return num / den
            }
            // Otherwise try decimal
            const val = parseFloat(raw)
            return isNaN(val) ? NaN : val
        },
        submit() {
            player.math[this.layerName].showCorrect = true; // Show the correct answer on submit

            if (this.parseAnswer(this.userAnswer) === this.correctAnswer) {
                let gain = this.problemGain;

                if (this.layerName === "YooA") {
                    player.YooAPoints = player.YooAPoints.add(GameCache.YooAGain.value); // Example point reward
                    player.stats.General.totalPoints = player.stats.General.totalPoints.add(GameCache.YooAGain.value); // Example point reward
                }

                if (this.layerName === "YooAmatter") {
                    player.YooAmatter.YooArium = player.YooAmatter.YooArium.add(gameLayers.YooAmatter.getYooAriumGain());
                    player.stats.YooAmatter.totalYooArium = player.stats.YooAmatter.totalYooArium.add(gameLayers.YooAmatter.getYooAriumGain());
                }

                if (this.layerName === "YooAity") {
                    player.YooAity.YooChronium = player.YooAity.YooChronium.add(gameLayers.YooAity.getYooChroniumGain());
                    player.stats.YooAity.totalYooChronium = player.stats.YooAity.totalYooChronium.add(gameLayers.YooAity.getYooChroniumGain());
                }

                player.math[this.layerName].solved = player.math[this.layerName].solved.add(gain);
                player.stats.General.totalSolved = player.stats.General.totalSolved.add(gain);
                player.math[this.layerName].isCorrect = true; // Mark as correct
            } else {
                player.math[this.layerName].isCorrect = false; // Mark as incorrect
            }

            this.userAnswer = ""; // Clear the input field

            // Hide the correct answer after 5 seconds
            setTimeout(() => {
                player.math[this.layerName].showCorrect = false;
                this.generateNewProblem(this.layerName);
            }, 5000);
        },
        generateNewProblem(layer) {
            generateNewProblem(layer); // Pass the layerName to the global function
        },
        correctText(layer) {
            let dis = layer === "YooA" ? "YooA Points have increased!" : layer === "YooAmatter" ? "YooArium has increased!" : layer === "YooAity" ? "YooChronium has increased!" : ""
            return dis
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
.math-problem-container {
    text-align: center;
    margin-top: 16px;
}

input {
    margin: 8px 0;
    padding: 4px;
    font-size: 16px;
}

button {
    padding: 8px 16px;
    background-color: #d17be2;
    color: #b9e5ff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #b86cc3;
}

#correct {
    margin-top: 8px;
}
</style>