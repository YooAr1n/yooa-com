<template>
    <div class="math-problem-container">
        <h2>Digits: {{ formatDigits }}</h2>
        <h2>{{ problem }}</h2>
        <h2 id="correct" v-if="showCorrect" :style="{ color: isCorrect ? '#7bff7b' : '#ff7b7b' }">
            {{ correct }}
        </h2>
        <input v-model="userAnswer" type="text" :id="inputId" :name="inputId" placeholder="Your answer"
            @keyup.enter="submit" :disabled="showCorrect" />
        <br />
        <button @click="submit" :disabled="showCorrect">
            Submit
        </button>
    </div>
</template>

<script>
import { player, getYooAGain } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/main.js";

export function generateNewProblem(layerName) {  // Accept layerName as a parameter
    const getRandomNumber = () => {
        let num;
        do {
            let digs = gameLayers[layerName].digits(); // Use the passed layerName here
            let x = Math.round(10 ** digs - 1);
            num = Math.floor(Math.random() * (x * 2 + 1)) - x; // Range: -9 to 9
        } while (num === 0);
        return num;
    };

    let num1 = getRandomNumber(layerName); // Pass layerName to getRandomNumber
    let num2 = getRandomNumber(layerName); // Pass layerName to getRandomNumber

    let operations;
    if (layerName === "YooA") {
        // For YooA layer: Addition and Subtraction
        operations = ["+", "-"];
    } else if (layerName === "YooAmatter") {
        // For YooAmatter layer: Multiplication and Division
        operations = ["*", "/"];
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
    }

    player.math[layerName].mathProblem = problemText;
    player.math[layerName].correctAnswer = correctAnswer;
}

export default {
    name: "MathProblem",
    data() {
        return {
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
        formatDigits() {
            return format(gameLayers[this.layerName].digits())
        },
        inputId() {
            return this.refName; // Dynamically set the input id
        },
        problem() {
            return player.math[this.layerName].mathProblem; // Display the current math problem
        },
        problemGain() {
            return gameLayers[this.layerName].problemGain();
        },
        correctAnswer() {
            return player.math[this.layerName].correctAnswer; // Reference the correct answer
        },
        correct() {
            return player.math[this.layerName].isCorrect
                ? "Correct! " + this.correctText(this.layerName)
                : "Incorrect! The correct answer is " + this.correctAnswer;
        },
        isCorrect() {
            return player.math[this.layerName].isCorrect;
        },
        showCorrect() {
            return player.math[this.layerName].showCorrect;
        }
    },
    methods: {
        submit() {
            player.math[this.layerName].showCorrect = true; // Show the correct answer on submit

            if (parseFloat(this.userAnswer) === this.correctAnswer) {
                let gain = this.problemGain;

                if (this.layerName === "YooA") {
                    player.YooAPoints = player.YooAPoints.add(getYooAGain()); // Example point reward
                    player.stats.General.totalPoints = player.stats.General.totalPoints.add(getYooAGain()); // Example point reward
                }

                if (this.layerName === "YooAmatter") {
                    player.YooAmatter.YooArium = player.YooAmatter.YooArium.add(gameLayers.YooAmatter.getYooAriumGain());
                    player.stats.YooAmatter.totalYooArium = player.stats.YooAmatter.totalYooArium.add(gameLayers.YooAmatter.getYooAriumGain()); 
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
            let dis = layer === "YooA" ? "YooA Points have increased!" : layer === "YooAmatter" ? "YooArium has increased!" : ""
            return dis
        }
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