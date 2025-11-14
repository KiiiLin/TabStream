<template>
  <div class="scores-page">
    <!-- 上传区域 -->
    <div class="scores-container">
      <div 
        v-if="!isUploaded"
        class="upload-box"
        :class="{ 'dragover': isDragover }"
        @click="triggerFileInput"
        @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
        @drop.prevent="handleDrop"
      >
        <div class="upload-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon">
            <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="upload-text">上传 .gp / .gp3 / .gp4 / .gp5 / .gpx 文件</p>
          <p class="upload-hint">支持拖拽文件到此处</p>
        </div>
        <input 
          ref="fileInput" 
          type="file" 
          accept=".gp,.gp3,.gp4,.gp5,.gpx" 
          style="display: none"
          @change="handleFileSelect"
        />
      </div>

      <!-- 进度条 -->
      <div v-if="showProgress" class="progress-container">
        <progress 
          :value="uploadProgress" 
          max="100" 
          :class="{ 'succeed': uploadSuccess, 'error': uploadError }"
        ></progress>
        <span class="progress-text">{{ uploadProgress.toFixed(0) }}%</span>
      </div>

      <!-- 文件名显示 -->
      <p v-if="fileName" class="file-name" :class="{ 'error': uploadError }">
        {{ uploadError ? fileName : (uploadSuccess ? `上传成功：${fileName}` : `上传中：${fileName}`) }}
      </p>

      <!-- 轨道选择器 -->
      <div v-if="tracks.length > 0" class="track-list">
        <button
          v-for="(track, index) in tracks"
          :key="index"
          class="track-btn"
          :class="{ 'active': currentTrackIndex === index }"
          @click="selectTrack(index)"
        >
          {{ track.name || `轨道 ${index + 1}` }}
        </button>
      </div>

      <!-- 乐谱渲染容器 -->
      <div v-if="tracks.length > 0" ref="tabContainer" class="tab-container"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Scores',
  data() {
    return {
      isDragover: false,
      isUploaded: false,
      showProgress: false,
      uploadProgress: 0,
      uploadSuccess: false,
      uploadError: false,
      fileName: '',
      tracks: [],
      currentTrackIndex: 0
    }
  },
  mounted() {
    // 确保 VexTab 和 VexFlow 已加载
    this.checkVexLibs()
  },
  methods: {
    checkVexLibs() {
      if (!window.Vex || !window.VexTabDiv) {
        console.warn('VexTab libraries not loaded yet')
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.handleFile(file)
      }
    },
    handleDrop(event) {
      this.isDragover = false
      const file = event.dataTransfer.files[0]
      if (file) {
        this.handleFile(file)
      }
    },
    handleFile(file) {
      if (!file) return

      // 验证文件类型
      if (!/\.gp(3|4|5|x)?$/i.test(file.name)) {
        this.showError('仅支持 .gp / .gpx / .gp3 / .gp4 / .gp5 文件')
        return
      }

      this.uploadFile(file)
    },
    uploadFile(file) {
      this.resetUploadUI()
      this.fileName = file.name
      this.showProgress = true
      this.uploadProgress = 0
      this.uploadError = false
      this.uploadSuccess = false

      const formData = new FormData()
      formData.append('file', file, file.name)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'http://localhost:3000/upload', true)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          this.uploadProgress = (e.loaded / e.total) * 100
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          let jsonData
          try {
            jsonData = JSON.parse(xhr.responseText)
          } catch (e) {
            this.showError('JSON 解析失败')
            return
          }

          if (jsonData.error) {
            this.showError(jsonData.error)
            return
          }

          if (!jsonData.tracks || jsonData.tracks.length === 0) {
            this.showError('没有可用的轨道')
            return
          }

          this.tracks = jsonData.tracks
          this.uploadSuccess = true
          this.isUploaded = true
          this.showProgress = false

          // 默认渲染第一轨
          this.$nextTick(() => {
            this.selectTrack(0)
          })
        } else {
          this.showError('上传失败')
        }
      }

      xhr.onerror = () => {
        this.showError('上传失败')
      }

      xhr.send(formData)
    },
    selectTrack(index) {
      this.currentTrackIndex = index
      const track = this.tracks[index]
      if (track && track.vextab) {
        this.renderGuitarTab(track.vextab)
      }
    },
    renderGuitarTab(vextabText) {
      if (!window.Vex || !window.VexTabDiv) {
        console.error('VexTab libraries not loaded')
        return
      }

      const container = this.$refs.tabContainer
      if (!container) return

      container.innerHTML = ''

      const VF = window.Vex.Flow
      const VTD = window.VexTabDiv

      // 清理 vextab 文本
      const cleanVextab = vextabText
        .replace(/\r/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      // 创建渲染器
      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG)
      renderer.resize(1100, 700)

      const artist = new VTD.Artist(10, 10, 1050, { scale: 0.95 })
      const vextab = new VTD.VexTab(artist)

      try {
        vextab.parse(cleanVextab)
        artist.render(renderer)
      } catch (err) {
        console.error('VexTab Parse Error:', err)
        container.innerHTML = `
          <div class="error-message">
            <p class="error-title">解析错误</p>
            <pre class="error-content">${err.message || err}</pre>
          </div>
        `
      }
    },
    resetUploadUI() {
      this.uploadError = false
      this.uploadSuccess = false
      this.uploadProgress = 0
    },
    showError(msg) {
      this.fileName = msg
      this.uploadError = true
      this.uploadSuccess = false
      this.showProgress = false
    }
  }
}
</script>

<style scoped>
.scores-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: #fff;
}

.scores-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 上传区域 */
.upload-box {
  width: 100%;
  max-width: 800px;
  min-height: 300px;
  border: 2px dashed #FFB7C5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 183, 197, 0.05);
}

.upload-box:hover {
  background: rgba(255, 183, 197, 0.1);
  border-color: #FF8FA3;
}

.upload-box.dragover {
  background: rgba(255, 183, 197, 0.15);
  border-color: #FF8FA3;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
}

.upload-icon {
  color: #FFB7C5;
  width: 64px;
  height: 64px;
}

.upload-text {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #222;
  letter-spacing: 0.05em;
  margin: 0;
}

.upload-hint {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.05em;
  margin: 0;
}

/* 进度条 */
.progress-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 15px;
}

progress {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  appearance: none;
  -webkit-appearance: none;
  border: none;
}

progress::-webkit-progress-bar {
  background-color: #f0f0f0;
  border-radius: 4px;
}

progress::-webkit-progress-value {
  background-color: #FFB7C5;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

progress.succeed::-webkit-progress-value {
  background-color: #4CAF50;
}

progress.error::-webkit-progress-value {
  background-color: #f44336;
}

.progress-text {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #222;
  min-width: 45px;
  text-align: right;
  letter-spacing: 0.05em;
}

/* 文件名 */
.file-name {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #222;
  text-align: center;
  letter-spacing: 0.05em;
  margin: 0;
}

.file-name.error {
  color: #f44336;
}

/* 轨道选择器 */
.track-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 183, 197, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
}

.track-btn {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #222;
  background: #fff;
  border: 1px solid #FFB7C5;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.05em;
}

.track-btn:hover {
  background: #FFB7C5;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 183, 197, 0.3);
}

.track-btn.active {
  background: #FFB7C5;
  color: #fff;
  border-color: #FF8FA3;
}

/* 乐谱容器 */
.tab-container {
  width: 100%;
  max-width: 1100px;
  min-height: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  overflow-x: auto;
}

.error-message {
  padding: 40px;
  text-align: center;
}

.error-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #f44336;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

.error-content {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  text-align: left;
  white-space: pre-wrap;
  overflow-x: auto;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .scores-page {
    padding: 80px 15px 30px;
  }

  .upload-box {
    min-height: 250px;
  }

  .upload-content {
    padding: 30px 20px;
  }

  .upload-text {
    font-size: 16px;
  }

  .upload-hint {
    font-size: 12px;
  }

  .progress-container {
    max-width: 100%;
  }

  .track-list {
    padding: 15px;
  }

  .track-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .tab-container {
    padding: 15px;
  }
}
</style>

