<script setup>
import { ref } from 'vue'
import AdvancedExample from './components/AdvancedExample.vue'
import BasicExample from './components/BasicExample.vue'
import GroupExample from './components/GroupExample.vue'
import HookExample from './components/HookExample.vue'
import PerformanceExample from './components/PerformanceExample.vue'
import ValidationExample from './components/ValidationExample.vue'

const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '基础用法', icon: '📐' },
  { key: 'advanced', label: '高级功能', icon: '🚀' },
  { key: 'validation', label: '表单验证', icon: '✅' },
  { key: 'group', label: '表单分组', icon: '📋' },
  { key: 'hook', label: 'Hook用法', icon: '🔧' },
  { key: 'performance', label: '性能测试', icon: '⚡' },
]
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1>🚀 自适应表单布局系统</h1>
        <p>Vue3示例 - 体验组件化的智能表单布局</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <div class="container">
        <!-- 导航标签 -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab" :class="[{ active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- 标签内容 -->
        <div class="tab-content">
          <!-- 基础用法 -->
          <BasicExample v-if="activeTab === 'basic'" />

          <!-- 高级功能 -->
          <AdvancedExample v-if="activeTab === 'advanced'" />

          <!-- 表单验证 -->
          <ValidationExample v-if="activeTab === 'validation'" />

          <!-- 表单分组 -->
          <GroupExample v-if="activeTab === 'group'" />

          <!-- Hook用法 -->
          <HookExample v-if="activeTab === 'hook'" />

          <!-- 性能测试 -->
          <PerformanceExample v-if="activeTab === 'performance'" />
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 自适应表单布局系统 - Vue3集成示例</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tab {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

.footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 1rem 0;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .tabs {
    flex-direction: column;
    align-items: center;
  }

  .tab {
    width: 200px;
  }
}
</style>
