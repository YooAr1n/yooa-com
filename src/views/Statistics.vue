<template>
  <div class="main">
    <h1>YooA Statistics</h1>
	<p>Find the mean, median, mode, and standard deviation (2 decimal places).</p>
	<table class = "stats">
		<tr>
			<th colspan = "2">OH MY GIRL Members Age (2024)</th>
		</tr>
		<tr>
			<td>Hyojung</td>
			<td>30</td>
		</tr>
		<tr>
			<td>Mimi</td>
			<td>29</td>
		</tr>
		<tr>
			<td>YooA</td>
			<td>29</td>
		</tr>
		<tr>
			<td>Seunghee</td>
			<td>28</td>
		</tr>
		<tr>
			<td>Yubin</td>
			<td>27</td>
		</tr>
		<tr>
			<td>Arin</td>
			<td>25</td>
		</tr>
	</table>
	<p>Mean: </p>
	<input type = "text" id = "mean1" name = "mean1" placeholder = "Mean"><br>
	<p>Median: </p>
	<input type = "text" id = "median1" name = "median1" placeholder = "Median"><br>
	<p>Mode: </p>
	<input type = "text" id = "mode1" name = "mode1" placeholder = "Mode"><br>
	<p>Standard Deviation: </p>
	<input type = "text" id = "sd1" name = "sd1" placeholder = "Standard Deviation"><br>
	<button @click="submit">Submit</button>
  </div>
</template>

<script>
import Statistics from '../statistics'

export default {
  methods:{
      submit() {
        Statistics.submit();
      }
  }
}
</script>

<style>
.stats th, .stats td {
	border: 2px solid blue;
	text-align: center;
	padding: 5px;
}

.stats {
	color: blue;
	border: 2px solid blue;
	border-collapse: collapse;
	font-size: 12pt;
	margin-left: 8px;
	z-index: -1;
	width: 300px;
}
</style>
