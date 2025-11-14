<template>
  <div class="covers-page">
    <!-- 大屏播放器 -->
    <div v-if="selectedVideo" class="video-modal" @click="closeVideo">
      <div class="video-modal-content" @click.stop>
        <button class="close-btn" @click="closeVideo">×</button>
        <video 
          :src="selectedVideo.videoUrl" 
          controls 
          autoplay
          class="fullscreen-video"
        ></video>
        <div class="video-info-modal">
          <h2>{{ selectedVideo.songName }}</h2>
          <p class="video-description">{{ selectedVideo.description }}</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="covers-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-message">
        正在加载视频列表...
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error && !loading" class="error-message">
        {{ error }}
      </div>
      
      <!-- 视频列表 -->
      <div 
        v-for="(video, index) in videos" 
        :key="video.id" 
        class="video-row"
        :class="{ 'visible': video.visible }"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <!-- 左侧视频 -->
        <div class="video-left" @click="playVideo(video)">
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.songName" />
            <div class="play-overlay">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.6)"/>
                <path d="M25 20L40 30L25 40V20Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 右侧描述 -->
        <div class="video-info">
          <div class="info-item">
            <span class="info-label">曲名：</span>
            <span class="info-value">{{ video.songName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">艺术家：</span>
            <span class="info-value">{{ video.artist }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">翻唱：</span>
            <span class="info-value">{{ video.cover }}</span>
          </div>
          <div class="info-item info-tags-wrapper" v-if="video.tags && video.tags.length > 0">
            <span class="info-label"></span>
            <div class="info-tags">
              <span 
                v-for="tag in video.tags" 
                :key="tag" 
                class="tag"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Covers',
  data() {
    return {
      selectedVideo: null,
      videos: [],
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchVideos() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('http://localhost:3000/api/covers')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        // 检查返回的数据格式
        if (!data || !Array.isArray(data.covers)) {
          console.error('Invalid API response:', data)
          throw new Error('Invalid API response format')
        }
        
        // 为每个视频添加 visible 属性
        this.videos = data.covers.map(video => ({
          ...video,
          visible: false,
          // 将相对路径转换为完整 URL
          thumbnail: video.thumbnail && video.thumbnail.startsWith('http') 
            ? video.thumbnail 
            : video.thumbnail
            ? `http://localhost:3000${video.thumbnail}`
            : null,
          videoUrl: video.videoUrl && video.videoUrl.startsWith('http')
            ? video.videoUrl
            : video.videoUrl
            ? `http://localhost:3000${video.videoUrl}`
            : null
        }))
      } catch (err) {
        console.error('Error fetching covers:', err)
        this.error = '加载视频列表失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    playVideo(video) {
      this.selectedVideo = video
    },
    closeVideo() {
      this.selectedVideo = null
    },
    handleScroll() {
      const videoRows = document.querySelectorAll('.video-row')
      const windowHeight = window.innerHeight
      
      videoRows.forEach((row) => {
        const rect = row.getBoundingClientRect()
        const video = this.videos.find(v => v.id === parseInt(row.dataset.id || row.getAttribute('data-id')))
        
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          if (video) {
            video.visible = true
          }
        }
      })
    },
    setupVisibilityObserver() {
      // 使用 Intersection Observer 优化性能
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const videoId = parseInt(entry.target.getAttribute('data-video-id'))
            const video = this.videos.find(v => v.id === videoId)
            if (video) {
              video.visible = true
            }
          }
        })
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      })
      
      this.$nextTick(() => {
        const videoRows = document.querySelectorAll('.video-row')
        videoRows.forEach((row, index) => {
          if (this.videos[index]) {
            row.setAttribute('data-video-id', this.videos[index].id)
            observer.observe(row)
          }
        })
        // 初始检查可见性
        this.handleScroll()
      })
    }
  },
  mounted() {
    this.fetchVideos().then(() => {
      // 数据加载完成后设置可见性观察
      this.setupVisibilityObserver()
    })
    
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
.covers-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: #fff;
}

.covers-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* 视频行布局 */
.video-row {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 50px;
  align-items: center;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.video-row.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 左侧视频 */
.video-left {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.video-left:hover {
  transform: scale(1.02);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 16 / 9; /* 16:9 比例 */
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.video-left:hover .play-overlay {
  opacity: 1;
}

/* 右侧描述信息 */
.video-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #222;
}

.info-label {
  font-weight: 400;
  color: #666;
  min-width: 80px;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.info-value {
  font-weight: 400;
  color: #222;
  flex: 1;
  letter-spacing: 0.05em;
}

.info-tags-wrapper {
  align-items: flex-start;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #FFB7C5;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* 大屏播放器模态框 */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  animation: fadeIn 0.3s ease;
}

.video-modal-content {
  position: relative;
  width: 100%;
  max-width: 1200px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fullscreen-video {
  width: 100%;
  height: auto;
  display: block;
}

.video-info-modal {
  padding: 30px;
  background: #fff;
}

.video-info-modal h2 {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #222;
  margin: 0 0 15px 0;
  letter-spacing: 0.05em;
}

.video-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.video-description {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  margin: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .video-row {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .video-thumbnail {
    max-width: 100%;
  }

  .video-info {
    padding: 0;
  }
}

@media screen and (max-width: 768px) {
  .covers-page {
    padding: 80px 15px 30px;
  }

  .covers-container {
    gap: 40px;
  }

  .video-row {
    gap: 20px;
  }

  .info-item {
    font-size: 14px;
  }

  .info-label {
    min-width: 70px;
  }

  .video-modal {
    padding: 20px;
  }
}

.loading-message,
.error-message {
  text-align: center;
  padding: 60px 20px;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #d32f2f;
}
</style>

