<template>
  <header :class="{ 'menu-open': menuOpen }">
    <!-- 左上角 Logo -->
    <div class="logo">
      <a href="#">
        <svg width="80" height="40">
          <use href="/src/assets/sprite.svg#fc-logo"></use>
        </svg>
      </a>
    </div>

    <!-- 桌面端 MENU 按钮 -->
    <div class="drawer__btn pc" @click="toggleMenu">
      <div class="inner">
        <span></span>
      </div>
    </div>

    <!-- 移动端备用按钮 -->
    <div class="drawer__btn sp" @click="toggleMenu">
      <div class="inner">
        <span></span>
      </div>
    </div>

    <!-- 抽屉菜单 -->
    <div class="drawer" v-show="menuOpen">
      <nav class="g-nav">
        <ul>
          <li><a href="#"><span>Home</span></a></li>
          <li><a href="#"><span>Works</span></a></li>
          <li><a href="#"><span>About</span></a></li>
          <li><a href="#"><span>Contact</span></a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderMain',
  data() {
    return { menuOpen: false }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    }
  }
}
</script>


