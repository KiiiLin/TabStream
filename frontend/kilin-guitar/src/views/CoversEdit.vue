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

    <!-- 上传按钮 -->
    <div class="upload-btn-wrapper">
      <button class="upload-btn" @click="showUploadModal = true">
        📤 上传
      </button>
    </div>

    <!-- 上传对话框 -->
    <div v-if="showUploadModal" class="upload-modal" @click.self="closeUploadModal">
      <div class="upload-modal-content">
        <button class="modal-close-btn" @click="closeUploadModal">×</button>
        <h2 class="modal-title">上传新视频</h2>
        <form @submit.prevent="handleUpload" class="upload-form">
          <div class="form-group">
            <label>曲名 *</label>
            <input 
              v-model="uploadForm.songName" 
              type="text" 
              required
              placeholder="请输入曲名"
            />
          </div>
          <div class="form-group">
            <label>艺术家</label>
            <input 
              v-model="uploadForm.artist" 
              type="text"
              placeholder="请输入艺术家名称"
            />
          </div>
          <div class="form-group">
            <label>翻唱</label>
            <input 
              v-model="uploadForm.cover" 
              type="text"
              placeholder="请输入翻唱者名称"
            />
          </div>
          <div class="form-group">
            <label>标签（用逗号分隔）</label>
            <input 
              v-model="uploadForm.tagsInput" 
              type="text"
              placeholder="例如：音乐,吉他,原创"
            />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="uploadForm.description" 
              rows="3"
              placeholder="请输入视频描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>视频文件 *</label>
            <input 
              ref="videoInput"
              type="file" 
              accept="video/*"
              @change="handleVideoFileSelect"
              required
            />
            <div v-if="uploadForm.videoFile" class="file-name">{{ uploadForm.videoFile.name }}</div>
          </div>
          <div class="form-group">
            <label>缩略图</label>
            <input 
              ref="thumbnailInput"
              type="file" 
              accept="image/*"
              @change="handleThumbnailFileSelect"
            />
            <div v-if="uploadForm.thumbnailFile" class="file-name">{{ uploadForm.thumbnailFile.name }}</div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeUploadModal">取消</button>
            <button type="submit" class="submit-btn" :disabled="uploading">
              {{ uploading ? '上传中...' : '上传' }}
            </button>
          </div>
        </form>
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
        class="video-row-wrapper"
      >
        <div 
          class="video-row"
          :class="{ 'visible': video.visible }"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <!-- 删除按钮 -->
          <button class="delete-btn" @click.stop="deleteVideo(video)" :disabled="deleting" title="删除">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#dc3545"/>
              <path d="M5 5L11 11M11 5L5 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- 左侧视频 -->
          <div class="video-left" @click="playVideo(video)">
            <div class="video-thumbnail">
              <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.songName" />
              <div v-else class="no-thumbnail">暂无缩略图</div>
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
  </div>
</template>

<script>
export default {
  name: 'CoversEdit',
  data() {
    return {
      selectedVideo: null,
      videos: [],
      loading: false,
      error: null,
      deleting: false,
      showUploadModal: false,
      uploading: false,
      uploadForm: {
        songName: '',
        artist: '',
        cover: '',
        tagsInput: '',
        description: '',
        videoFile: null,
        thumbnailFile: null
      }
    }
  },
  methods: {
    closeUploadModal() {
      this.showUploadModal = false
      this.resetUploadForm()
    },
    resetUploadForm() {
      this.uploadForm = {
        songName: '',
        artist: '',
        cover: '',
        tagsInput: '',
        description: '',
        videoFile: null,
        thumbnailFile: null
      }
      if (this.$refs.videoInput) this.$refs.videoInput.value = ''
      if (this.$refs.thumbnailInput) this.$refs.thumbnailInput.value = ''
    },
    handleVideoFileSelect(event) {
      this.uploadForm.videoFile = event.target.files[0] || null
    },
    handleThumbnailFileSelect(event) {
      this.uploadForm.thumbnailFile = event.target.files[0] || null
    },
    async handleUpload() {
      if (!this.uploadForm.videoFile) {
        alert('请选择视频文件')
        return
      }

      this.uploading = true

      try {
        // 生成日期+时间戳格式的文件夹名
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
        const timestamp = Date.now()
        const folderName = `${dateStr}-${timeStr}-${timestamp}`

        // 准备上传表单
        const formData = new FormData()
        formData.append('folderName', folderName)
        formData.append('songName', this.uploadForm.songName)
        formData.append('artist', this.uploadForm.artist)
        formData.append('cover', this.uploadForm.cover)
        formData.append('description', this.uploadForm.description)
        
        // 处理标签
        const tags = this.uploadForm.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
        formData.append('tags', JSON.stringify(tags))
        
        // 添加文件
        formData.append('files', this.uploadForm.videoFile)
        if (this.uploadForm.thumbnailFile) {
          formData.append('files', this.uploadForm.thumbnailFile)
        }

        const response = await fetch('http://localhost:3000/api/covers/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '上传失败')
        }

        // 刷新列表
        await this.fetchVideos()
        this.closeUploadModal()
        alert('上传成功！')
      } catch (err) {
        console.error('Upload error:', err)
        alert(`上传失败：${err.message}`)
      } finally {
        this.uploading = false
      }
    },
    async deleteVideo(video) {
      if (!confirm('确定要删除这个视频吗？')) {
        return
      }

      this.deleting = true
      try {
        // 使用保存的文件夹名，如果没有则从 URL 中提取
        let folderName = video.folderName
        if (!folderName) {
          const url = video.videoUrl || video.thumbnail
          const match = url ? url.match(/\/api\/covers\/([^/]+)/) : null
          if (!match) {
            throw new Error('无法找到文件夹名')
          }
          folderName = match[1]
        }

        const response = await fetch(`http://localhost:3000/api/covers/delete/${folderName}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('删除失败')
        }

        // 刷新列表
        await this.fetchVideos()
        alert('删除成功！')
      } catch (err) {
        console.error('Delete error:', err)
        alert('删除失败，请重试')
      } finally {
        this.deleting = false
      }
    },
    async fetchVideos() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('http://localhost:3000/api/covers')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        if (!data || !Array.isArray(data.covers)) {
          console.error('Invalid API response:', data)
          throw new Error('Invalid API response format')
        }
        
        this.videos = data.covers.map(video => ({
          ...video,
          visible: false,
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
        this.handleScroll()
      })
    }
  },
  mounted() {
    this.fetchVideos().then(() => {
      this.setupVisibilityObserver()
    })
    
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
  position: relative;
}

.upload-btn-wrapper {
  position: fixed;
  top: 120px;
  right: 30px;
  z-index: 100;
}

.upload-btn {
  background: #FFB7C5;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 183, 197, 0.4);
  transition: all 0.3s ease;
  letter-spacing: 0.05em;
}

.upload-btn:hover {
  background: #ff9fb5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 183, 197, 0.5);
}

.upload-btn:active {
  transform: translateY(0);
}

.covers-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.video-row-wrapper {
  position: relative;
}

.video-row {
  position: relative;
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

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.delete-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.delete-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn svg {
  width: 100%;
  height: 100%;
}

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
  aspect-ratio: 16 / 9;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail {
  color: #999;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
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

.video-description {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  margin: 0;
}

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

  .upload-btn-wrapper {
    top: 100px;
    right: 15px;
  }

  .upload-btn {
    padding: 10px 18px;
    font-size: 14px;
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

/* 上传对话框样式 */
.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.upload-modal-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s ease;
}

.modal-close-btn:hover {
  color: #222;
}

.modal-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #222;
  margin: 0 0 30px 0;
  letter-spacing: 0.05em;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  letter-spacing: 0.05em;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea,
.form-group input[type="file"] {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #222;
  transition: border-color 0.3s ease;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.form-group input[type="text"]:focus,
.form-group input[type="date"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #FFB7C5;
}

.form-group input[type="file"] {
  padding: 8px;
  border: 1px dashed #ddd;
  cursor: pointer;
}

.file-name {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.submit-btn {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.05em;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.submit-btn {
  background: #FFB7C5;
  color: #fff;
}

.submit-btn:hover:not(:disabled) {
  background: #ff9fb5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 183, 197, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media screen and (max-width: 768px) {
  .upload-modal-content {
    padding: 30px 20px;
    max-width: 100%;
  }

  .modal-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>

