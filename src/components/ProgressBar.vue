<template>
  <div class="progress">
    <div id="percentbar" class="percent">
      <span data-text = "Percentage to YooAity" id="percent" class="tooltip">{{ percent }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ProgressBar',
  mounted() {
    setInterval(() => this.update(), 33); // Use Vue instance's method
  },
  data() {
    return {
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
      this.progress = player.YooAPoints.max(10).log10().div(198895).min(1)
      document.getElementById("percentbar").style.width = this.progress.toNumber() * 100 + "%"
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
	background-color: #a3a3a3;
	border-radius: var(--var-border-radius, 0.5rem);
	margin-right: auto;
	margin-left: auto;
}

div.percent{
	width: 0;
	text-align: center;
	background-color: #200642;
	border-radius: inherit;
	transition-duration: 0.1s;
	color: white;
}

.tooltip {
	overflow-wrap: normal;
	position: relative;
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
	background: #200642;
	color: #fff;
	text-align: center;

	visibility: hidden;
	opacity: 0;
  	transition: .3s;
}

.tooltip:hover:before, .tooltip:hover:after {
	display: block;
	opacity: 1;
	visibility: visible;
}

.tooltip:after {
	content: "";
	position: absolute;

	bottom: 100%;
	margin-bottom: -5px;

	left: 50%;
	transform: translateX(-50%);

	border: 10px solid #200642;
	border-color: #200642 transparent transparent transparent;

	visibility: hidden;
	opacity: 0;
  	transition: .3s;
}
</style>
