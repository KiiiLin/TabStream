<template>
  <div>
    <HeaderMain />
    <HeroCarousel />
    <FooterMain />
  </div>
</template>

<script>
import HeaderMain from './components/HeaderMain.vue'
import FooterMain from './components/FooterMain.vue'

export default {
  name: 'App',
  components:{ HeaderMain, FooterMain }
}
</script>
