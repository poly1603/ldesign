<template>
  <div class="app">
    <div class="container">
      <!-- 头部 -->
      <header class="header text-center mb-40">
        <h1>🌊 LDesign Watermark</h1>
        <p>Vue 3 + TypeScript 水印组件示例</p>
      </header>

      <!-- 导航标签 -->
      <nav class="nav-tabs mb-30">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['nav-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- 标签内容 -->
      <div class="tab-content">
        <!-- 基础示例 -->
        <BasicExamples v-if="activeTab === 'basic'" />
        
        <!-- Composition API 示例 -->
        <CompositionExamples v-if="activeTab === 'composition'" />
        
        <!-- Options API 示例 -->
        <OptionsExamples v-if="activeTab === 'options'" />
        
        <!-- 高级功能 -->
        <AdvancedExamples v-if="activeTab === 'advanced'" />
        
        <!-- 组件化示例 -->
        <ComponentExamples v-if="activeTab === 'component'" />
      </div>

      <!-- 页脚 -->
      <footer class="footer text-center">
        <p>© 2024 LDesign. 基于 Vue 3 + TypeScript + Vite 构建</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicExamples from './components/BasicExamples.vue'
import CompositionExamples from './components/CompositionExamples.vue'
import OptionsExamples from './components/OptionsExamples.vue'
import AdvancedExamples from './components/AdvancedExamples.vue'
import ComponentExamples from './components/ComponentExamples.vue'

// 标签页配置
const tabs = [
  { key: 'basic', label: '基础示例' },
  { key: 'composition', label: 'Composition API' },
  { key: 'options', label: 'Options API' },
  { key: 'advanced', label: '高级功能' },
  { key: 'component', label: '组件化' }
]

// 当前活跃标签
const activeTab = ref('basic')
</script>

<style lang="less" scoped>
.app {
  min-height: 100vh;
}

.header {
  color: white;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  
  .nav-tab {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    
    &.active {
      background: white;
      color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

.tab-content {
  min-height: 600px;
}

.footer {
  color: white;
  opacity: 0.8;
  margin-top: 40px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .nav-tabs {
    .nav-tab {
      padding: 10px 16px;
      font-size: 14px;
    }
  }
}
</style>
