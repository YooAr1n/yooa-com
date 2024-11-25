<template>
  <div class="main">
    <Main></Main>
    <ProgressBar></ProgressBar>
  </div>
</template>

<script>
import Main from '@/components/Main.vue'
import ProgressBar from '@/components/ProgressBar.vue'

export default {
  components: {
    Main,
    ProgressBar
  },
  methods:{
  }
}
</script>

<style scoped>
div.main {
  text-align: center;
  color: white;
  background-color: black;
}
</style>

