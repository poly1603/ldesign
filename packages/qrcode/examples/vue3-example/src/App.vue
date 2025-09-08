<template>
  <div id="app">
    <!-- 页面头部 -->
    <header class="header">
      <div class="container">
        <h1 class="title">@ldesign/qrcode Vue 3 示例</h1>
        <p class="subtitle">展示二维码生成库在 Vue 3 + TypeScript 环境中的完整功能</p>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main">
      <div class="container">
        <!-- 导航标签 -->
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

        <!-- 标签内容 -->
        <div class="tab-content">
          <!-- 基础示例 -->
          <BasicExample v-if="activeTab === 'basic'" />
          
          <!-- 高级示例 -->
          <AdvancedExample v-if="activeTab === 'advanced'" />
          
          <!-- 样式定制 -->
          <StyleExample v-if="activeTab === 'style'" />
          
          <!-- 数据类型 -->
          <DataTypeExample v-if="activeTab === 'datatype'" />
          
          <!-- 性能测试 -->
          <PerformanceExample v-if="activeTab === 'performance'" />
        </div>
      </div>
    </main>

    <!-- 页面底部 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 LDesign Team. 基于 @ldesign/qrcode v1.0.0</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicExample from './views/BasicExample.vue'
import AdvancedExample from './views/AdvancedExample.vue'
import StyleExample from './views/StyleExample.vue'
import DataTypeExample from './views/DataTypeExample.vue'
import PerformanceExample from './views/PerformanceExample.vue'

// 响应式数据
const activeTab = ref('basic')

// 标签配置
const tabs = [
  { id: 'basic', label: '基础示例' },
  { id: 'advanced', label: '高级功能' },
  { id: 'style', label: '样式定制' },
  { id: 'datatype', label: '数据类型' },
  { id: 'performance', label: '性能测试' }
]
</script>

<style scoped>
/* 页面头部样式 */
.header {
  background: linear-gradient(135deg, var(--ldesign-brand-color-6), var(--ldesign-brand-color-8));
  color: white;
  padding: var(--ls-spacing-xl) 0;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--ls-spacing-sm);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

/* 主要内容区域 */
.main {
  flex: 1;
  padding: var(--ls-spacing-xl) 0;
  min-height: calc(100vh - 200px);
}

/* 导航标签样式 */
.nav-tabs {
  display: flex;
  gap: var(--ls-spacing-xs);
  margin-bottom: var(--ls-spacing-lg);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  overflow-x: auto;
  padding-bottom: var(--ls-spacing-xs);
}

.nav-tab {
  padding: var(--ls-spacing-sm) var(--ls-spacing-base);
  border: none;
  background: transparent;
  color: var(--ldesign-text-color-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--ls-border-radius-base) var(--ls-border-radius-base) 0 0;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.nav-tab:hover {
  color: var(--ldesign-brand-color-6);
  background: var(--ldesign-brand-color-1);
}

.nav-tab.active {
  color: var(--ldesign-brand-color-6);
  background: var(--ldesign-brand-color-1);
  font-weight: 600;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ldesign-brand-color-6);
}

/* 标签内容区域 */
.tab-content {
  min-height: 500px;
}

/* 页面底部样式 */
.footer {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-base) 0;
  text-align: center;
  color: var(--ldesign-text-color-secondary);
  font-size: 14px;
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .nav-tabs {
    gap: 0;
  }
  
  .nav-tab {
    flex: 1;
    text-align: center;
    font-size: 13px;
    padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
  }
}
</style>
