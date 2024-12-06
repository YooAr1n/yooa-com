<template>
  <p></p>
</template>

<script>

import { start } from '@/incremental/incremental.js';

export default {
  name: 'Main',
  mounted() {
    start();
  },
  components: {
    
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
