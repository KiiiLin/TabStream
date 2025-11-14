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
      <div 
        v-for="(memory, index) in memories" 
        :key="memory.id" 
        class="memory-item"
        :class="{ 'visible': memory.visible }"
        :style="{ animationDelay: `${index * 0.2}s` }"
        :data-memory-id="memory.id"
      >
        <!-- 居中图片 -->
        <div class="memory-image-wrapper" @click="openModal(memory)">
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
      memories: [
        {
          id: 1,
          image: 'https://picsum.photos/600/400?random=1',
          date: '2024-01-15',
          description: '这是一个美好的回忆描述。',
          detailedDescription: '这是一个美好的回忆描述。记录了某个特殊的时刻和感受。那是一个温暖的午后，阳光透过窗户洒在桌面上，一切都显得那么宁静而美好。这个瞬间让我感受到了生活的美好，值得永远珍藏。',
          visible: false
        },
        {
          id: 2,
          image: 'https://picsum.photos/600/400?random=2',
          date: '2024-02-20',
          description: '另一个值得珍藏的瞬间。',
          detailedDescription: '另一个值得珍藏的瞬间。这些回忆构成了我们生活的点点滴滴。每一个瞬间都承载着特殊的意义，让我们在回忆中感受到温暖和幸福。这些美好的时光将成为我们人生中最宝贵的财富。',
          visible: false
        },
        {
          id: 3,
          image: 'https://picsum.photos/600/400?random=3',
          date: '2024-03-10',
          description: '春天的午后，阳光洒在脸上。',
          detailedDescription: '春天的午后，阳光洒在脸上，这一刻值得永远铭记。万物复苏的季节，一切都充满了生机和希望。在这样的日子里，心情也变得格外轻松愉快，仿佛所有的烦恼都随风而去。',
          visible: false
        },
        {
          id: 4,
          image: 'https://picsum.photos/600/400?random=4',
          date: '2024-04-25',
          description: '与朋友们一起度过的快乐时光。',
          detailedDescription: '与朋友们一起度过的快乐时光，这些回忆让我们感到温暖。友谊是人生中最珍贵的礼物，与朋友们在一起的每一刻都是那么珍贵。我们一起笑，一起哭，一起经历生活的酸甜苦辣，这些都将成为我们最美好的回忆。',
          visible: false
        },
        {
          id: 5,
          image: 'https://picsum.photos/600/400?random=5',
          date: '2024-05-30',
          description: '一次难忘的旅行，风景如画。',
          detailedDescription: '一次难忘的旅行，风景如画，心情如诗。旅行的意义不仅在于看风景，更在于感受不同的文化和生活方式。每一次旅行都是一次心灵的洗礼，让我们更加了解这个世界，也更加了解自己。',
          visible: false
        },
        {
          id: 6,
          image: 'https://picsum.photos/600/400?random=6',
          date: '2024-06-15',
          description: '夏日的傍晚，微风轻拂。',
          detailedDescription: '夏日的傍晚，微风轻拂，一切都是那么美好。夏天的夜晚总是那么迷人，天空中的星星闪烁着光芒，微风带来阵阵凉意。在这样的夜晚，一切都显得那么宁静而祥和，让人感到无比的舒适和放松。',
          visible: false
        },
        {
          id: 7,
          image: 'https://picsum.photos/600/400?random=7',
          date: '2024-07-20',
          description: '海边的日落，金色的光芒。',
          detailedDescription: '海边的日落，金色的光芒洒在海面上，美得让人屏息。大海总是能给人带来无限的遐想和感动。站在海边，看着夕阳慢慢落下，感受着海风的轻抚，这一刻所有的烦恼都被抛到了脑后，只剩下内心的宁静和满足。',
          visible: false
        },
        {
          id: 8,
          image: 'https://picsum.photos/600/400?random=8',
          date: '2024-08-10',
          description: '音乐节上的快乐时光。',
          detailedDescription: '音乐节上的快乐时光，音乐、人群、欢乐交织在一起。音乐有着神奇的魔力，能够将不同的人聚集在一起，共同感受节奏和旋律带来的快乐。在音乐节上，每个人都可以尽情地释放自己，享受音乐带来的无限乐趣。',
          visible: false
        }
      ]
    }
  },
  methods: {
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
    }
  },
  mounted() {
    // 初始检查可见性
    this.handleScroll()
    
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
    
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
    })
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
</style>

