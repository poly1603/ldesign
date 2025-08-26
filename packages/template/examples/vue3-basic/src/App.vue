<script setup lang="ts">
import { ref } from 'vue'
import CompleteTemplateDemo from './CompleteTemplateDemo.vue'
import ExternalTemplateDemo from './ExternalTemplateDemo.vue'
import SimpleExtensionDemo from './SimpleExtensionDemo.vue'

// 当前激活的标签页
const activeTab = ref('basic')

// 标签页配置
const tabs = [
  { id: 'basic', label: '基础演示' },
  { id: 'extension', label: '扩展演示' },
  { id: 'advanced', label: '高级功能' },
]
</script>

<template>
  <div id="app">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="logo">🎨</span>
          @ldesign/template Vue3 示例
        </h1>
        <nav class="nav-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 基础演示 -->
      <div v-if="activeTab === 'basic'" class="demo-section">
        <div class="section-header">
          <h2>基础模板演示</h2>
          <p>展示模板系统的基本功能：响应式设备检测、模板切换、主题支持等</p>
        </div>
        <CompleteTemplateDemo />
      </div>

      <!-- 扩展演示 -->
      <div v-if="activeTab === 'extension'" class="demo-section">
        <div class="section-header">
          <h2>模板扩展演示</h2>
          <p>展示如何注册和使用外部模板，实现模板系统的扩展</p>
        </div>
        <ExternalTemplateDemo />
      </div>

      <!-- 高级功能 -->
      <div v-if="activeTab === 'advanced'" class="demo-section">
        <div class="section-header">
          <h2>高级功能演示</h2>
          <p>展示模板系统的高级特性：缓存管理、性能监控、错误处理等</p>
        </div>
        <SimpleExtensionDemo />
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 @ldesign/template - Vue3 模板系统演示</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/template" target="_blank">GitHub</a>
          <a href="https://ldesign.dev/template" target="_blank">文档</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 应用整体样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 头部样式 */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.logo {
  font-size: 1.8rem;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
}

.nav-tab {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-tab.active {
  background: #667eea;
  color: white;
}

/* 主要内容样式 */
.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.demo-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.section-header p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
}

/* 底部样式 */
.app-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-content p {
  margin: 0;
  color: #718096;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #5a67d8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .app-main {
    padding: 1rem;
  }

  .demo-section {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>