<template>
  <div class="progress">
    <div id="percentbar" class="percent">
      <span data-text = "Percentage to YooAity" id="percent" class="tooltip">{{ percent }}</span>
    </div>
  </div>
</template>

<script>
import { player } from '@/incremental/incremental.js'

export default {
  name: 'ProgressBar',
  mounted() {
    setInterval(() => this.update(), 33); // Use Vue instance's method
  },
  data() {
    return {
	  player,
      progress: new Decimal(0)
    }
  },
  computed: {
    percent() {
      return format(this.progress.mul(100)) + "%";
    },
  },
  methods: {
    update() {
		this.progress = player.YooAPoints.max(1).log10().div(198895).min(1)
		let prog = document.getElementById("percentbar")
		if (prog) prog.style.width = this.progress.toNumber() * 100 + "%"
    },
  },
  props: {
    msg: String,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.progress{
	position: fixed;
	bottom: 10px;
	left: 15px;
	width: calc(100% - 30px);
	font-size: 16pt;
	text-align: left;
	background-color: #747474;
	border-radius: var(--var-border-radius, 0.5rem);
	margin-right: auto;
	margin-left: auto;
}

div.percent{
	width: 0;
	text-align: center;
	background: linear-gradient(to right, #200642, #230085);
	border-radius: inherit;
	transition-duration: 0.1s;
	color: white;
}

.tooltip {
	overflow-wrap: normal;
	position: relative;
	white-space: nowrap;
}

.tooltip:before {
	content: attr(data-text);
	position: absolute;

	left: 50%;
	transform: translateX(-50%);

	bottom: 100%;
	margin-bottom: 15px;

	width: 200px;
	padding: 10px;
	border-radius: 10px;
	background: #220364;
	color: #fff;
	text-align: center;
	white-space: normal;

	visibility: hidden;
	opacity: 0;
  	transition: .3s;
}

.tooltip:hover:before, .tooltip:hover:after {
	display: block;
	opacity: 1;
	visibility: visible;
	white-space: normal;
}

.tooltip:after {
	content: "";
	position: absolute;

	bottom: 100%;
	margin-bottom: -5px;

	left: 50%;
	transform: translateX(-50%);

	border: 10px solid #220364;
	border-color: #220364 transparent transparent transparent;

	visibility: hidden;
	white-space: normal;
	opacity: 0;
  	transition: .3s;
}
</style>
