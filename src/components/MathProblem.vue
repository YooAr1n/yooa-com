<template>
    <div class="math-problem-container">
      <h2>{{ problem }}</h2>
      <h2 
        id="correct" 
        v-if="showCorrect" 
        :style="{ color: answeredCorrect ? '#7bff7b' : '#ff7b7b' }"
      >
        {{ correct }}
      </h2>
      <input 
        v-model="userAnswer" 
        type="text" 
        id="MainMath" 
        name="MainMath" 
        placeholder="Your answer" 
        @keyup.enter="submit" 
        :disabled="showCorrect" 
      />
      <br />
      <button 
        @click="submit" 
        :disabled="showCorrect" 
      >
        Submit
      </button>
    </div>
</template>

<script>
import { player, getYooAGain } from "@/incremental/incremental.js";
import { gameLayers } from "@/incremental/main.js";

export function generateNewProblem() {
    const getRandomNumber = () => {
    let num;
    do {
        let digs = gameLayers.YooA.upgrades[11].digits().toNumber() + 1
        let x = Math.round(10 ** (digs) - 1)
        num = Math.floor(Math.random() * (x * 2 + 1)) - x; // Range: -9 to 9
    } while (num === 0);
    return num;
    };

    const num1 = getRandomNumber();
    const num2 = getRandomNumber();

    const operations = ["+", "-"];
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
    }

    player.math.YooA.mathProblem = problemText;
    player.math.YooA.correctAnswer = correctAnswer;
}

export default {
    name: "MathProblem",
    data() {
        return {
            userAnswer: "", // Store the user's input
            showCorrect: false, // Control the visibility of the correct answer
            answeredCorrect: false, // Track if the last answer was correct
        };
    },
    computed: {
        problem() {
            return player.math.YooA.mathProblem; // Display the current math problem
        },
        correctAnswer() {
            return player.math.YooA.correctAnswer; // Reference the correct answer
        },
        correct() {
            return this.answeredCorrect
            ? "Correct! YooA Points have increased!"
            : "Incorrect! The correct answer is " + this.correctAnswer;
        },
    },
    methods: {
        submit() {
            this.showCorrect = true; // Show the correct answer on submit

            if (parseFloat(this.userAnswer) === this.correctAnswer) {
                player.YooAPoints = player.YooAPoints.add(getYooAGain()); // Example point reward
                player.math.YooA.solved ++;
                player.stats.General.totalSolved ++;
                this.answeredCorrect = true; // Mark as correct
            } 
            else {
                this.answeredCorrect = false; // Mark as incorrect
            }

            this.userAnswer = ""; // Clear the input field

            // Hide the correct answer after 5 seconds
            setTimeout(() => {
            this.showCorrect = false;
            this.generateNewProblem();
            }, 5000);
        },
        generateNewProblem() {
            generateNewProblem(); // Call the global function to generate a new problem
        },
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
  