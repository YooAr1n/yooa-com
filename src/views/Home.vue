<template>
  <div class="main">
    <h1>YooA</h1>

    <p>
      Yoo Si-ah, better known by her stage name YooA is a South Korean singer,
      and is a member of the girl group Oh My Girl under WM Entertainment.
      She made her debut as a solo artist, with her first EP Bon Voyage,
      on September 7, 2020.
    </p>

    <ul>
      <li>Full name: Yoo Shi Ah (유시아)</li>
      <li>Birthday: September 17, 1995</li>
      <li>Age: {{ age }} years old</li>
      <li>Group: OH MY GIRL</li>
    </ul>

    <img src="../assets/YooA.png" width="300" height="400">
  </div>
</template>

<script>
export default {
  data() {
    return {
      birthDate: new Date(1995, 8, 17) // Month is 0-based (September = 8)
    }
  },

  computed: {
    age() {
      const today = new Date()
      let age = today.getFullYear() - this.birthDate.getFullYear()

      const hasHadBirthdayThisYear =
        today.getMonth() > this.birthDate.getMonth() ||
        (today.getMonth() === this.birthDate.getMonth() &&
         today.getDate() >= this.birthDate.getDate())

      if (!hasHadBirthdayThisYear) {
        age--
      }

      return age
    }
  },

  mounted() {
    document.title = "YooA"
  }
}
</script>
