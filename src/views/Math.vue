<template>
  <div class="main">
    <h1>YooA Math</h1>
    <div class="game">
      <p id = "inst">Solve the math (#7 = 2pts, #8 = 5pts). DON'T put variables (value only) in #3, 4, 6, 7. ^ = exponent.</p>
      <ol id = "questions">
        <li>1 + 1 = ?</li>
        <input type = "text" id = "q1" name = "q1">
        <li>2 + 2 = ?</li>
        <input type = "text" id = "q2" name = "q2">
        <li>x + 4 = 3</li>
        <input type = "text" id = "q3" name = "q3" placeholder = "Solve for x.">
        <li>3x - 2 = 7</li>
        <input type = "text" id = "q4" name = "q4" placeholder = "Solve for x.">
        <li>(x - 4)<sup>2</sup> = ?</li>
        <input type = "text" id = "q5" name = "q5" placeholder = "Expand (standard form).">
        <li>x + 2y = 6, 2x - y = 7</li>
        <input type = "text" id = "q6" name = "q6" placeholder = "Solve for x and y.">
        <li>
            x = (3! + 15 - 2 * 6 - 1)<sup>(1/4 + 1/2) * 8/9</sup><br>
            A = (x<sup>3</sup>)<sup>2 / 3</sup><br>
            o = A - (x + 1)<sup>2</sup><br>
            Y = (x - 1)(x + 1)<br>
            YooA = ?
        </li>
        <input type = "text" id = "q7" name = "q7" placeholder = "Solve for YooA.">
        <li>
            i = √-1<br>
            M = x<sup>2</sup> + i<sup>(8 - 3<sup>2</sup>) * 4i<sup>2</sup></sup><br>
            m = (x - 1)(x + 1)<br>
            A = (x<sup>5</sup>)(x<sup>(2i)<sup>2</sup></sup>) + 1<br>
            o = A<sup>4</sup> / (x + 1)<sup>2</sup> - 2A<br>
            Y = (m<sup>log<sub>4</sub>(2) + 3 - 5 / 2</sup> + 2) / A<br>
            Mimi - YooA = ?
        </li>
        <input type = "text" id = "q8" name = "q8" placeholder = "Solve for Mimi - YooA (factor).">
      </ol>
      <button id = "submit" @click="submit">Submit</button>
    </div>
  </div>
</template>

<script>
import Math from '../math'

export default {
  methods:{
      submit() {
          Math.submit();
      }
  }
}
</script>

<style>
h3 {
  display: inline;
}

div.main {
  min-height: 100vh;
  background-color: powderblue;
  padding: 45px 15px;
}

div.game {
	text-align: center;
	background-color: #d17be2;
	border-radius: 20px;
	width: 700px;
	min-height: 450px;
	padding: 10px;
	position: relative;
}

input[type = text] {
	padding: 8px 10px;
	margin: 8px 0;
	display: inline-block;
	font-size: 12px;
	font-family: monospace;
	width: 250px;
}

button {
	background-color: #046dAA;
 	color: white;
	padding: 12px 20px;
	margin: 8px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 17px;
	font-family: monospace;
}

button:hover {
	background-color: #075785;
}
</style>
