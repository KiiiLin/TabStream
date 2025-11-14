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
      <!-- 导航框 -->
      <div class="navigation-boxes">
        <router-link to="/scores" class="nav-box">
          <div class="nav-box-content">
            <h2 class="nav-title">Scores</h2>
            <p class="nav-description">上传吉他谱文件，查看精美的乐谱展示</p>
          </div>
        </router-link>
        
        <router-link to="/covers" class="nav-box">
          <div class="nav-box-content">
            <h2 class="nav-title">Covers</h2>
            <p class="nav-description">浏览精彩的音乐翻唱视频和作品集</p>
          </div>
        </router-link>
        
        <router-link to="/memories" class="nav-box">
          <div class="nav-box-content">
            <h2 class="nav-title">Memories</h2>
            <p class="nav-description">珍藏美好的音乐时光和回忆瞬间</p>
          </div>
        </router-link>
      </div>
      
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding-bottom: 20px;
  justify-content: flex-end;
}

.home-content h1 {
  margin: 0;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: #fff;
}

.home-content.content-visible {
  opacity: 1;
}

/* 导航框容器 */
.navigation-boxes {
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
}

/* 导航框 */
.nav-box {
  flex: 1;
  max-width: 320px;
  min-width: 250px;
  background: rgba(255, 183, 197, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 40px 30px;
  text-decoration: none;
  color: #222;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 183, 197, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-box:hover {
  transform: translateY(-8px);
  background: rgba(255, 183, 197, 0.95);
  box-shadow: 0 8px 24px rgba(255, 183, 197, 0.4);
}

.nav-box-content {
  width: 100%;
  text-align: center;
}

.nav-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin: 0 0 20px 0;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-description {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

  .home-content {
    padding-bottom: 30px;
    gap: 30px;
  }

  .home-content h1 {
    font-size: 18px;
  }

  .navigation-boxes {
    flex-direction: column;
    gap: 20px;
    padding: 0 15px;
  }

  .nav-box {
    max-width: 100%;
    width: 100%;
    min-width: auto;
    padding: 30px 20px;
    min-height: 160px;
  }

  .nav-title {
    font-size: 24px;
    margin-bottom: 15px;
    color: #fff;
  }

  .nav-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
  }
}

@media screen and (max-width: 1024px) and (min-width: 769px) {
  .navigation-boxes {
    gap: 20px;
  }

  .nav-box {
    max-width: 280px;
    padding: 35px 25px;
    min-height: 180px;
  }

  .nav-title {
    font-size: 26px;
    color: #fff;
  }

  .nav-description {
    color: rgba(255, 255, 255, 0.9);
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
