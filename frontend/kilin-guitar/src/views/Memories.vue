<template>
  <div class="memories-page">
    <!-- 图片放大模态框 -->
    <div v-if="selectedMemory" class="memory-modal" @click="closeModal">
      <div class="memory-modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <div class="modal-body">
          <!-- 左侧：放大的图片 -->
          <div class="modal-image-wrapper">
            <img :src="selectedMemory.image" :alt="selectedMemory.description" class="modal-image" />
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
        class="memory-item"
        :class="{ 'visible': memory.visible }"
        :style="{ animationDelay: `${index * 0.2}s` }"
        :data-memory-id="memory.id"
      >
        <!-- 居中图片 -->
        <div v-if="memory.image" class="memory-image-wrapper" @click="openModal(memory)">
          <img :src="memory.image" :alt="memory.description" class="memory-image" />
        </div>
        
        <!-- 日期 -->
        <div class="memory-date">{{ memory.date }}</div>
        
        <!-- 描述 -->
        <div class="memory-description">{{ memory.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Memories',
  data() {
    return {
      selectedMemory: null,
      memories: [],
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchMemories() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('http://localhost:3000/api/memories')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        // 检查返回的数据格式
        if (!data || !Array.isArray(data.memories)) {
          console.error('Invalid API response:', data)
          throw new Error('Invalid API response format')
        }
        
        // 为每个回忆添加 visible 属性
        this.memories = data.memories.map(memory => ({
          ...memory,
          visible: false,
          // 将相对路径转换为完整 URL
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
      // 使用 Intersection Observer 优化性能
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
        // 初始检查可见性
        this.handleScroll()
      })
    }
  },
  mounted() {
    this.fetchMemories().then(() => {
      // 数据加载完成后设置可见性观察
      this.setupVisibilityObserver()
    })
    
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    // 确保页面滚动恢复
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.memories-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: #fff;
}

.memories-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 80px;
}

/* 记忆项 */
.memory-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.memory-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 图片容器 */
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

/* 日期 */
.memory-date {
  font-family: aktiv-grotesk, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  text-align: center;
}

/* 描述 */
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

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .memories-page {
    padding: 80px 15px 30px;
  }

  .memories-container {
    gap: 60px;
  }

  .memory-item {
    gap: 15px;
  }

  .memory-image-wrapper {
    margin-bottom: 15px;
  }

  .memory-date {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .memory-description {
    font-size: 14px;
  }
}

/* 图片放大模态框 */
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

/* 响应式设计 - 模态框 */
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
</style>

