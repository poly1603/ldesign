<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ appConfig.appName || 'LDesign Launcher' }}</h1>
      <p>Vue 3 + TypeScript 示例项目 v{{ appConfig.version || '1.0.0' }}</p>
      
      <div class="card">
        <button @click="count++">
          计数: {{ count }}
        </button>
        <p>
          编辑 <code>src/App.vue</code> 并保存来测试热更新
        </p>
      </div>
      
      <div class="features">
        <h2>✨ 特性展示</h2>
        <ul>
          <li>🚀 快速热更新</li>
          <li>📦 TypeScript 支持</li>
          <li>🎨 单文件组件 (SFC)</li>
          <li>⚡ 组合式 API</li>
          <li>🔧 智能插件系统</li>
        </ul>
      </div>
      
      <Counter />
      
      <div class="app-config" :style="configStyle">
        <h3>📄 应用配置 (import.meta.env.appConfig)</h3>
        <pre>{{ JSON.stringify(appConfig, null, 2) }}</pre>
        <p>修改 .ldesign/app.config.ts 后保存，配置会自动热更新</p>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Counter from './components/Counter.vue'

const count = ref(0)

// 获取应用配置
const appConfig = (import.meta.env.appConfig as any) || {}

// 动态样式
const configStyle = computed(() => ({
  marginTop: '2rem',
  padding: '1rem',
  backgroundColor: appConfig.theme?.primaryColor ? `${appConfig.theme.primaryColor}22` : '#42b88322',
  borderRadius: '8px',
  border: `1px solid ${appConfig.theme?.primaryColor || '#42b883'}`,
  textAlign: 'left' as const,
  fontSize: '0.9rem'
}))
</script>

<style scoped>
.app {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

button {
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 184, 131, 0.3);
}

button:active {
  transform: translateY(0);
}

.features {
  margin-top: 2rem;
}

.features h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.features ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.features li {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.features li:hover {
  transform: scale(1.05);
}

code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.app-config {
  margin-top: 2rem;
  color: white;
}

.app-config h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.app-config pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.8rem;
  margin: 0;
}

.app-config p {
  margin-top: 1rem;
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>
