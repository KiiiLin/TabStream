<template>
  <div class="memories-page">
    <!-- 图片放大模态框 -->
    <div v-if="selectedMemory" class="memory-modal" @click="closeModal">
      <div class="memory-modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-body">
          <!-- 左侧：放大的图片 -->
          <div class="modal-image-wrapper">
            <img v-if="selectedMemory.image" :src="selectedMemory.image" :alt="selectedMemory.description" class="modal-image" />
            <div v-else class="no-image">暂无图片</div>
          </div>
          <!-- 右侧：详细描述 -->
          <div class="modal-info">
            <div class="modal-date">{{ selectedMemory.date }}</div>
            <div class="modal-title">回忆</div>
            <div class="modal-description">{{ selectedMemory.detailedDescription || selectedMemory.description }}</div>
          </div>
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
        <h2 class="modal-title">上传新回忆</h2>
        <form @submit.prevent="handleUpload" class="upload-form">
          <div class="form-group">
            <label>日期 *</label>
            <input 
              v-model="uploadForm.date" 
              type="date" 
              required
            />
          </div>
          <div class="form-group">
            <label>描述 *</label>
            <textarea 
              v-model="uploadForm.description" 
              rows="2"
              required
              placeholder="请输入简短描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>详细描述</label>
            <textarea 
              v-model="uploadForm.detailedDescription" 
              rows="4"
              placeholder="请输入详细描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>图片文件 *</label>
            <input 
              ref="imageInput"
              type="file" 
              accept="image/*"
              @change="handleImageFileSelect"
              required
            />
            <div v-if="uploadForm.imageFile" class="file-name">{{ uploadForm.imageFile.name }}</div>
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
    <div class="memories-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-message">
        正在加载回忆列表...
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error && !loading" class="error-message">
        {{ error }}
      </div>
      
      <!-- 回忆列表 -->
      <div 
        v-for="(memory, index) in memories" 
        :key="memory.id" 
        class="memory-item-wrapper"
      >
        <div 
          class="memory-item"
          :class="{ 'visible': memory.visible }"
          :style="{ animationDelay: `${index * 0.2}s` }"
          :data-memory-id="memory.id"
        >
          <!-- 删除按钮 -->
          <button class="delete-btn" @click.stop="deleteMemory(memory)" :disabled="deleting" title="删除">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#dc3545"/>
              <path d="M5 5L11 11M11 5L5 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- 居中图片 -->
          <div v-if="memory.image" class="memory-image-wrapper" @click="openModal(memory)">
            <img :src="memory.image" :alt="memory.description" class="memory-image" />
          </div>
          <div v-else class="memory-image-placeholder">
            暂无图片
          </div>
          
          <!-- 日期 -->
          <div class="memory-date">{{ memory.date }}</div>
          
          <!-- 描述 -->
          <div class="memory-description">{{ memory.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemoriesEdit',
  data() {
    return {
      selectedMemory: null,
      memories: [],
      loading: false,
      error: null,
      deleting: false,
      showUploadModal: false,
      uploading: false,
      uploadForm: {
        date: new Date().toISOString().slice(0, 10),
        description: '',
        detailedDescription: '',
        imageFile: null
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
        date: new Date().toISOString().slice(0, 10),
        description: '',
        detailedDescription: '',
        imageFile: null
      }
      if (this.$refs.imageInput) this.$refs.imageInput.value = ''
    },
    handleImageFileSelect(event) {
      this.uploadForm.imageFile = event.target.files[0] || null
    },
    async handleUpload() {
      if (!this.uploadForm.imageFile) {
        alert('请选择图片文件')
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
        formData.append('date', this.uploadForm.date)
        formData.append('description', this.uploadForm.description)
        formData.append('detailedDescription', this.uploadForm.detailedDescription)
        formData.append('files', this.uploadForm.imageFile)

        const response = await fetch('http://localhost:3000/api/memories/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '上传失败')
        }

        // 刷新列表
        await this.fetchMemories()
        this.closeUploadModal()
        alert('上传成功！')
      } catch (err) {
        console.error('Upload error:', err)
        alert(`上传失败：${err.message}`)
      } finally {
        this.uploading = false
      }
    },
    async deleteMemory(memory) {
      if (!confirm('确定要删除这个回忆吗？')) {
        return
      }

      this.deleting = true
      try {
        // 使用保存的文件夹名，如果没有则从 URL 中提取
        let folderName = memory.folderName
        if (!folderName) {
          const url = memory.image
          const match = url ? url.match(/\/api\/memories\/([^/]+)/) : null
          if (!match) {
            throw new Error('无法找到文件夹名')
          }
          folderName = match[1]
        }

        const response = await fetch(`http://localhost:3000/api/memories/delete/${folderName}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('删除失败')
        }

        // 刷新列表
        await this.fetchMemories()
        alert('删除成功！')
      } catch (err) {
        console.error('Delete error:', err)
        alert('删除失败，请重试')
      } finally {
        this.deleting = false
      }
    },
    async fetchMemories() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('http://localhost:3000/api/memories')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        if (!data || !Array.isArray(data.memories)) {
          console.error('Invalid API response:', data)
          throw new Error('Invalid API response format')
        }
        
        this.memories = data.memories.map(memory => ({
          ...memory,
          visible: false,
          image: memory.image && memory.image.startsWith('http')
            ? memory.image
            : memory.image
            ? `http://localhost:3000${memory.image}`
            : null
        }))
      } catch (err) {
        console.error('Error fetching memories:', err)
        this.error = '加载回忆列表失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    openModal(memory) {
      this.selectedMemory = memory
      document.body.style.overflow = 'hidden'
    },
    closeModal() {
      this.selectedMemory = null
      document.body.style.overflow = ''
    },
    handleScroll() {
      const memoryItems = document.querySelectorAll('.memory-item')
      const windowHeight = window.innerHeight
      
      memoryItems.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const memoryId = parseInt(item.getAttribute('data-memory-id'))
        const memory = this.memories.find(m => m.id === memoryId)
        
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          if (memory) {
            memory.visible = true
          }
        }
      })
    },
    setupVisibilityObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const memoryId = parseInt(entry.target.getAttribute('data-memory-id'))
            const memory = this.memories.find(m => m.id === memoryId)
            if (memory) {
              memory.visible = true
            }
          }
        })
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      })
      
      this.$nextTick(() => {
        const memoryItems = document.querySelectorAll('.memory-item')
        memoryItems.forEach((item) => {
          observer.observe(item)
        })
        this.handleScroll()
      })
    }
  },
  mounted() {
    this.fetchMemories().then(() => {
      this.setupVisibilityObserver()
    })
    
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.memories-page {
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

.memories-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.memory-item-wrapper {
  position: relative;
}

.memory-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.memory-item.visible {
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

.memory-image-wrapper {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;
}

.memory-image-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.memory-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.memory-image-placeholder {
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.memory-date {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  text-align: center;
}

.memory-description {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #222;
  line-height: 1.8;
  text-align: center;
  max-width: 600px;
  letter-spacing: 0.05em;
}

.memory-modal {
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
  overflow-y: auto;
}

.memory-modal-content {
  position: relative;
  width: 100%;
  max-width: 1200px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: #222;
  font-size: 28px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.3s ease;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
}

.modal-image-wrapper {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.no-image {
  color: #999;
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
}

.modal-info {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}

.modal-date {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}

.modal-title {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 32px;
  font-weight: 400;
  color: #222;
  margin-bottom: 30px;
  letter-spacing: 0.05em;
}

.modal-description {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #444;
  line-height: 1.8;
  letter-spacing: 0.05em;
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
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media screen and (max-width: 1024px) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-image-wrapper {
    min-height: 400px;
    max-height: 500px;
  }

  .modal-info {
    padding: 40px 30px;
  }
}

@media screen and (max-width: 768px) {
  .memories-page {
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

  .memories-container {
    gap: 60px;
  }

  .memory-item {
    gap: 15px;
  }

  .memory-image-wrapper,
  .memory-image-placeholder {
    margin-bottom: 15px;
  }

  .memory-date {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .memory-description {
    font-size: 14px;
  }

  .memory-modal {
    padding: 20px;
  }

  .memory-modal-content {
    border-radius: 8px;
  }

  .close-btn {
    top: 10px;
    right: 10px;
    width: 35px;
    height: 35px;
    font-size: 24px;
  }

  .modal-image-wrapper {
    min-height: 300px;
    max-height: 400px;
  }

  .modal-info {
    padding: 30px 20px;
  }

  .modal-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .modal-description {
    font-size: 14px;
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

