<template>
  <Header msg = "YooA Incremental" ref="header"></Header>
</template>

<script>
import Header from './Header.vue'

import { start } from '@/incremental/incremental.js';

export default {
  name: 'Main',
  mounted() {
    start();
  },
  components: {
    Header
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
