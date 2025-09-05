<template>
  <div class="container">
    <div class="logo">🔥</div>
    <h1 class="title">Vue 2 + @ldesign/launcher</h1>
    <p>这是一个使用 @ldesign/launcher 构建的 Vue 2 测试项目</p>
    
    <div class="counter-section">
      <h2>计数器测试</h2>
      <button @click="increment" class="counter-btn">
        点击次数: {{ count }}
      </button>
    </div>

    <div class="features">
      <div class="feature">
        <h3>🔥 热重载</h3>
        <p>修改代码时自动刷新页面</p>
      </div>
      
      <div class="feature">
        <h3>⚡ 快速构建</h3>
        <p>基于 Vite 的极速构建体验</p>
      </div>
      
      <div class="feature">
        <h3>🎯 TypeScript</h3>
        <p>完整的 TypeScript 支持</p>
      </div>
      
      <div class="feature">
        <h3>📦 生产优化</h3>
        <p>自动代码分割和压缩</p>
      </div>
    </div>

    <div class="info">
      <p>当前时间: {{ currentTime }}</p>
      <p>构建环境: {{ isDev ? '开发模式' : '生产模式' }}</p>
      <p>Vue 版本: {{ vueVersion }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
  
  data() {
    return {
      count: 0,
      currentTime: '',
      isDev: import.meta.env.DEV,
      vueVersion: Vue.version,
      timeInterval: null as number | null
    }
  },

  methods: {
    increment() {
      this.count++
      console.log(`计数器更新: ${this.count}`)
    },

    updateTime() {
      this.currentTime = new Date().toLocaleString('zh-CN')
    }
  },

  mounted() {
    this.updateTime()
    this.timeInterval = setInterval(this.updateTime, 1000)
    console.log('✅ App 组件已挂载')
  },

  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
    console.log('🔄 App 组件即将销毁')
  }
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
}

.logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.counter-section {
  margin: 2rem 0;
}

.counter-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.counter-btn:hover {
  background: #ee5a24;
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
}

.feature {
  background: rgba(255, 107, 107, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature h3 {
  margin-top: 0;
  color: #ff6b6b;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: monospace;
}
</style>
