<template>
  <div :class="{ 'intro-animation-complete': introComplete }">
    <HeaderMain :class="{ 'header-hidden': !introComplete && isHomePage }" />
    <router-view @intro-complete="handleIntroComplete" />
    <FooterMain />
  </div>
</template>

<script>
import HeaderMain from './components/HeaderMain.vue'
import FooterMain from './components/FooterMain.vue'

export default {
  name: 'App',
  components:{ HeaderMain, FooterMain },
  data() {
    return {
      introComplete: false,
      isHomePage: false
    }
  },
  watch: {
    $route(to) {
      this.isHomePage = to.path === '/'
      if (to.path !== '/') {
        this.introComplete = true
      }
    }
  },
  mounted() {
    this.isHomePage = this.$route.path === '/'
    if (this.$route.path !== '/') {
      this.introComplete = true
    }
  },
  methods: {
    handleIntroComplete() {
      this.introComplete = true
    }
  }
}
</script>

<style>
.header-hidden {
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>
