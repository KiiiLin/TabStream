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
          <h2>{{ selectedVideo.title }}</h2>
          <p class="video-description">{{ selectedVideo.description }}</p>
          <div class="video-meta">
            <span class="video-date">{{ selectedVideo.date }}</span>
            <span class="video-duration">{{ selectedVideo.duration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="covers-container">
      <!-- 左侧视频列表 -->
      <div class="video-list">
        <h2 class="section-title">视频列表</h2>
        <div class="video-grid">
          <div 
            v-for="video in videos" 
            :key="video.id" 
            class="video-item"
            @click="playVideo(video)"
          >
            <div class="video-thumbnail">
              <img :src="video.thumbnail" :alt="video.title" />
              <div class="play-overlay">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.6)"/>
                  <path d="M25 20L40 30L25 40V20Z" fill="white"/>
                </svg>
              </div>
            </div>
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-date-small">{{ video.date }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧视频信息 -->
      <div class="video-info-panel">
        <div v-if="currentVideo" class="info-content">
          <h2 class="info-title">{{ currentVideo.title }}</h2>
          <div class="info-meta">
            <span class="info-date">{{ currentVideo.date }}</span>
            <span class="info-duration">{{ currentVideo.duration }}</span>
          </div>
          <p class="info-description">{{ currentVideo.description }}</p>
          <div class="info-tags" v-if="currentVideo.tags">
            <span 
              v-for="tag in currentVideo.tags" 
              :key="tag" 
              class="tag"
            >{{ tag }}</span>
          </div>
        </div>
        <div v-else class="info-placeholder">
          <p>点击左侧视频查看详细信息</p>
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
      currentVideo: null,
      selectedVideo: null,
      videos: [
        {
          id: 1,
          title: '示例视频 1',
          description: '这是一个示例视频的描述信息。你可以在这里添加视频的详细说明、创作背景、技术要点等内容。',
          date: '2024-01-15',
          duration: '3:45',
          thumbnail: 'https://via.placeholder.com/320x180/FFB7C5/FFFFFF?text=Video+1',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          tags: ['音乐', '吉他', '原创']
        },
        {
          id: 2,
          title: '示例视频 2',
          description: '这是另一个示例视频的描述。描述可以包含视频的主要内容、特色、演奏技巧等信息。',
          date: '2024-01-20',
          duration: '4:20',
          thumbnail: 'https://via.placeholder.com/320x180/FFC0CB/FFFFFF?text=Video+2',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          tags: ['翻唱', '流行']
        },
        {
          id: 3,
          title: '示例视频 3',
          description: '第三个示例视频的描述信息。这里可以详细介绍视频的创作灵感、演奏风格等。',
          date: '2024-01-25',
          duration: '5:10',
          thumbnail: 'https://via.placeholder.com/320x180/FF8FA3/FFFFFF?text=Video+3',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          tags: ['原创', '指弹']
        },
        {
          id: 4,
          title: '示例视频 4',
          description: '第四个示例视频的描述。可以在这里添加更多关于视频内容的详细信息。',
          date: '2024-02-01',
          duration: '3:30',
          thumbnail: 'https://via.placeholder.com/320x180/FFB7C5/FFFFFF?text=Video+4',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          tags: ['音乐', '演奏']
        }
      ]
    }
  },
  methods: {
    playVideo(video) {
      this.currentVideo = video
      this.selectedVideo = video
    },
    closeVideo() {
      this.selectedVideo = null
    }
  },
  mounted() {
    // 默认选择第一个视频
    if (this.videos.length > 0) {
      this.currentVideo = this.videos[0]
    }
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
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

/* 左侧视频列表 */
.video-list {
  width: 100%;
}

.section-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #222;
  margin-bottom: 30px;
  letter-spacing: 0.1em;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.video-item {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-item:hover {
  transform: translateY(-5px);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
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
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.video-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #222;
  margin: 0 0 8px 0;
  letter-spacing: 0.05em;
}

.video-date-small {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 右侧信息面板 */
.video-info-panel {
  position: sticky;
  top: 100px;
  height: fit-content;
  background: #fafafa;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.info-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 22px;
  font-weight: 400;
  color: #222;
  margin: 0 0 15px 0;
  letter-spacing: 0.05em;
}

.info-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.info-description {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  margin: 0 0 20px 0;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #FFB7C5;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.info-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
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
  .covers-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .video-info-panel {
    position: static;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
}

@media screen and (max-width: 768px) {
  .covers-page {
    padding: 80px 15px 30px;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .video-info-panel {
    padding: 20px;
  }

  .video-modal {
    padding: 20px;
  }
}
</style>

