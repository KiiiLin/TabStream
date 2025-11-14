<template>
  <header :class="{ 'menu-open': menuOpen }">
    <!-- 右上角 Logo -->
    <div class="logo">
      <a href="https://github.com/KiiiLin/TabStream" class="logo-link">
        <svg width="80" height="50" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg" class="logo-text">
          <text x="0" y="33" font-size="28" font-weight="bold" fill="#222">Kilin&Guitar</text>
        </svg>
        <img src="/author.svg" alt="Logo" class="logo-icon" />
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
          <li><a href="/"><span>Home</span></a></li>
          <li><a href="/scores"><span>Scores</span></a></li>
          <li><a href="/covers"><span>Covers</span></a></li>
          <li><a href="/memories"><span>Memories</span></a></li>
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


