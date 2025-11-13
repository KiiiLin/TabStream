<template>
  <div class="home">
    <!-- 开场动画 -->
    <div v-if="!animationComplete" class="intro-animation">
      <div class="intro-background" :class="{ 'blur-clear': blurClear }"></div>
      
      <!-- Logo 和文字容器 -->
      <div class="intro-logo-container" :class="{ 'fade-out': fadeOut }">
        <!-- 文字 - 完整文本 -->
        <div class="intro-text" :class="{ 'text-typing': textTyping }">
          <span class="text-content">Kilin&Guitar</span>
        </div>
        
        <!-- Logo 图标 -->
        <div class="intro-logo-icon" :class="{ 'logo-appear': logoAppear }">
          <img src="/author.svg" alt="Logo" />
        </div>
      </div>
    </div>

    <!-- 正常内容 -->
    <div class="home-content" :class="{ 'content-visible': animationComplete }">
      <h1>Welcome to Kilin&Guitar</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      logoAppear: false,
      textTyping: false,
      fadeOut: false,
      blurClear: false,
      animationComplete: false
    }
  },
  mounted() {
    this.startAnimation()
  },
  methods: {
    startAnimation() {
      // 1. Logo 出现 (0.3s)
      setTimeout(() => {
        this.logoAppear = true
      }, 300)

      // 2. 文字打印 (0.8s 后开始，持续1.2s)
      setTimeout(() => {
        this.textTyping = true
      }, 800)

      // 3. 背景清晰化 (2.0s 后开始)
      setTimeout(() => {
        this.blurClear = true
      }, 2000)

      // 4. 停顿0.5秒后渐隐 (2.5s 后开始)
      setTimeout(() => {
        this.fadeOut = true
      }, 2500)

      // 5. 动画完成 (3.0s 后)
      setTimeout(() => {
        this.animationComplete = true
        this.$emit('intro-complete')
      }, 3000)
    }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: url('/background.jpeg') center center / cover no-repeat fixed;
}

/* 开场动画容器 */
.intro-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景模糊效果 */
.intro-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/background.jpeg') center center / cover no-repeat;
  filter: blur(20px);
  opacity: 0.8;
  transition: filter 1s ease, opacity 1s ease;
}

.intro-background.blur-clear {
  filter: blur(0px);
  opacity: 1;
}

/* Logo 和文字容器 */
.intro-logo-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 1;
  transition: opacity 0.5s ease;
  z-index: 2001;
}

.intro-logo-container.fade-out {
  opacity: 0;
}

/* Logo 图标 */
.intro-logo-icon {
  width: 120px;
  height: 120px;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.intro-logo-icon.logo-appear {
  opacity: 1;
  transform: scale(1);
}

.intro-logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 文字样式 */
.intro-text {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 48px;
  font-weight: bold;
  color: #222;
  letter-spacing: 0.05em;
  position: relative;
  line-height: 1;
}

.text-content {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
}

.intro-text.text-typing .text-content {
  animation: typing 1.2s steps(12, end) forwards;
}

@keyframes typing {
  from { width: 0; }
  to { width: 12ch; } /* "Kilin&Guitar" */
}

/* 正常内容 */
.home-content {
  opacity: 0;
  transition: opacity 0.5s ease;
  padding: 20px;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  color: #fff;
}

.home-content.content-visible {
  opacity: 1;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .intro-text {
    font-size: 32px;
  }

  .intro-logo-icon {
    width: 80px;
    height: 80px;
  }

  .intro-logo-container {
    gap: 6px;
  }
}
</style>

<style>
/* 消除首页 header 上方的白边框 */
/* 由于 Home 组件只在首页显示，这些样式只会在首页生效 */

/* 设置背景透明，让背景图显示 */
body,
html {
  background: transparent !important;
}

/* Header 样式 */
header {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  margin: 0 !important;
}

/* 移除 drawer__btn 的白色边框，但保留彩色背景 */
header .drawer__btn span,
header .drawer__btn .inner {
  border: none !important;
}

/* 桌面端特殊设置 */
@media screen and (min-width: 961px) {
  header {
    position: fixed !important;
    top: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>
