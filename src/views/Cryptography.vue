<template>
  <div class="main">
    <h1>Matrix Cryptography</h1>
    <div class="game">
		<p id = "inst">Decode/Encode the messages.</p>
		<div id = "questions">
			<p>1. Decode the following message that was encoded using matrix A.</p>
			<p>A = </p>
			<table class = "matrix">
				<tr>
					<td>2</td>
					<td>3</td>
				</tr>
				<tr>
					<td>3</td>
					<td>4</td>
				</tr>
			</table>
			<!--YOOA NUMBER ONE-->
			<!--25 15 15 1 0 14 21 13 2 5 18 0 15 14 5 0-->
			<p>95 135 33 49 42 56 81 115 19 26 36 54 72 101 10 15</p>
			<input type = "text" id = "crypto1" name = "crypto1" placeholder = "Decode (CAPITAL LETTERS)"><br>
			<p>2. Decode the following message that was encoded using matrix B.</p>
			<p>B = </p>
			<table class = "matrix">
				<tr>
					<td>7</td>
					<td>2</td>
				</tr>
				<tr>
					<td>17</td>
					<td>5</td>
				</tr>
			</table>
			<!--Hyojung, Mimi, YooA, Seunghee, Yubin, Arin-->
			<!--8 25 15 10 21 14 7 0 13 9 13 9 0 25 15 15 1 0 19 5 21 14 7 8 5 5 0 25 21 2 9 14 0 1 18 9 14 0-->
			<p>481 141 275 80 385 112 49 14 244 71 244 71 425 125 360 105 7 2 218 63 385 112 185 54 120 35 425 125 181 52 301 88 17 5 279 81 98 28</p>
			<input type = "text" id = "crypto2" name = "crypto2" placeholder = "Decode (CAPITAL LETTERS)"><br>
			<p>3. Encode the following message using matrix C.</p>
			<p>C = </p>
			<table class = "matrix">
				<tr>
					<td style = "width:110px">(3 + √(4<sup>2</sup> + 3<sup>2</sup>)) / 2</td>
					<td style = "width:110px"><sup>10</sup>√3<sup>4! - 2 * 2</sup></td>
				</tr>
				<tr>
					<td>3log<sub>2</sub>(16) / 4</td>
					<td>(log<sub>3</sub>(5<sup>2</sup> + 2))! + 1</td>
				</tr>
			</table>
			<!--4 9-->
			<!--3 7-->
			<p>OH MY GIRL</p>
			<input type = "text" id = "crypto3" name = "crypto3" placeholder = "Encode (numbers)"><br>
			<p>4. Encode the following message using matrix D.</p>
			<p>D = </p>
			<table class = "matrix">
				<tr>
					<td style = "width:110px">(2<sup>2<sup>3</sup></sup> - 4<sup>2</sup>) / 4! + 1</td>
					<td style = "width:110px">2<sup>1.5</sup> * <sup>1.333...</sup>√(log<sub>3</sub>(81))</td>
				</tr>
				<tr>
					<td>10 + log<sub>1.2</sub>(125 / 216)</td>
					<td>(<sup>5/3 - 3/4</sup>√(45<sup>2</sup> + 23) + 10 * 46<sup>2</sup> - 56) / 7!</td>
				</tr>
			</table>
			<!--11 8-->
			<!--7 5-->
			<p id = "miracle">YOU ARE A MIRACLE</p>
			<input type = "text" id = "crypto4" name = "crypto4" placeholder = "Encode (numbers)"><br>
			<button id = "submit" @click="submit">Submit</button>
		</div>
    </div>
  </div>
</template>

<script>
import Cryptography from '../cryptography'

export default {
  mounted() {
	document.title = "Cryptography"
    Cryptography.start();
  },
  methods:{
    submit() {
    	Cryptography.submit();
    }
  }
}
</script>

<style>
.matrix tr {
	height: 30px;
}

.matrix td {
	width: 20px;
	padding: 5px;
	text-align: center;
}

.matrix {
	color: blue;
	font-size: 12pt;
	position: relative;
	margin-left: 8px;
	z-index: 0;
}

.matrix:before {
	left: -6px;
	border: 2px solid blue;
	border-right: 0px;
}

.matrix:after {
	right: -6px;
	border: 2px solid blue;
	border-left: 0px;
}

.matrix:before, .matrix:after {
	content: "";
	width: 6px;
	position: absolute;
	top: 0;
	height: 100%;
} 
</style>
