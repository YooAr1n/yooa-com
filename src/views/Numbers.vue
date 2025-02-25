<template>
  <div class="main">
    <h1>YooA Numbers</h1>
    <p>Learning numbers in any language is always a bit challenging, but Korean numbers are kind of… twice as hard. This is because in Korean, there are two sets of numbers: Sino-Korean numbers and Native Korean numbers.
    Each number system has its own specific uses, so it's important to learn both number systems.</p>
    <p>Type the English (numerals) / Korean (words) number.</p>
    <p>
        Click to type Korean:
        <a href = "https://www.branah.com/korean" target="_blank">Korean Keyboard</a>
    </p>
    <div class = "game">
      <p id = "number" ref = "number" style = "font-size: 20pt;">Korean Numbers (한국어 숫자)<br></p>
      <div class="center">
        <input style = "width: 340px; display: none;" type = "text" id = "knum" ref = "knum" name = "knum" placeholder = "Number (English = numerals, 한국어 = 단어 (words))"><br>
        <button style = "display: none;" id = "submit" ref = "submit" @click="submit">Submit</button>
      </div>
      <button style = "width: 150px; height: 100px; font-size: 30pt;" id = "start" @click="start">Start</button>
    </div>
  </div>
</template>

<script>

import Numbers from '../numbers'

export default {
  mounted() {
	  document.title = "YooA Numbers"
  },
  methods:{
      start() {
        Numbers.start(this.$refs.submit, this.$refs.knum, this.$refs.number);
      },
      submit() {
        Numbers.submit(this.$refs.knum);
      }
  }
}
</script>

<style>

</style>
