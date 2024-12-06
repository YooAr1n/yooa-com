<template>
  <div class="main">
    <h1>YooA-illions</h1>
    <p>Type the number to convert to -illions (1 to eee2.9999999999e60): </p>
    <input type = "text" id = "num" name = "num" placeholder = "Number (sci not: XeY, eXeY, ...)"><br>
    <p id = "illions" style = "font-size: 20pt;">-illions: </p>
    <button @click="submit">Submit</button>
  </div>
</template>

<script>
import Illions from '../illions'

export default {
  mounted() {
	  document.title = "YooA-illions"
  },
  methods:{
      submit() {
        Illions.submit();
      }
  }
}
</script>

