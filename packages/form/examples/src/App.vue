<!--
LemonForm 完整功能演示
-->

<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <h1>🍋 LemonForm 完整功能演示</h1>
        <p>Vue 3 动态表单库 - 覆盖所有功能的综合示例</p>
      </div>
    </header>

    <nav class="app-nav">
      <div class="container">
        <div class="nav-tabs">
          <button
            v-for="demo in demos"
            :key="demo.key"
            :class="{ active: currentDemo === demo.key }"
            @click="currentDemo = demo.key"
          >
            {{ demo.name }}
          </button>
        </div>
      </div>
    </nav>

    <main class="app-main">
      <div class="container">
        <component :is="currentDemoComponent" />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>LemonForm v1.0.0 - 完整功能演示</p>
        <p>
          <a href="https://github.com/lemonform/form" target="_blank">GitHub</a> |
          <a href="https://www.npmjs.com/package/@lemonform/form" target="_blank">NPM</a> |
          <a href="/docs" target="_blank">文档</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 导入所有演示组件
import ComprehensiveDemo from './demos/ComprehensiveDemo.vue'
import FieldTypesDemo from './demos/FieldTypesDemo.vue'
import ValidationDemo from './demos/ValidationDemo.vue'
import LayoutDemo from './demos/LayoutDemo.vue'
import ConditionalDemo from './demos/ConditionalDemo.vue'
import CustomComponentDemo from './demos/CustomComponentDemo.vue'
import AdvancedFeaturesDemo from './demos/AdvancedFeaturesDemo.vue'
import RealWorldDemo from './demos/RealWorldDemo.vue'

// 当前演示
const currentDemo = ref('comprehensive')

// 演示列表
const demos = [
  { key: 'comprehensive', name: '🎯 综合演示', component: ComprehensiveDemo },
  { key: 'field-types', name: '📝 字段类型', component: FieldTypesDemo },
  { key: 'validation', name: '✅ 表单验证', component: ValidationDemo },
  { key: 'layout', name: '📱 布局系统', component: LayoutDemo },
  { key: 'conditional', name: '🔄 条件渲染', component: ConditionalDemo },
  { key: 'custom', name: '🎨 自定义组件', component: CustomComponentDemo },
  { key: 'advanced', name: '🚀 高级功能', component: AdvancedFeaturesDemo },
  { key: 'real-world', name: '🌍 实际应用', component: RealWorldDemo }
]

// 当前演示组件
const currentDemoComponent = computed(() => {
  const demo = demos.find(d => d.key === currentDemo.value)
  return demo?.component || ComprehensiveDemo
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-header {
  background: linear-gradient(135deg, #f7d51d 0%, #f39c12 100%);
  color: white;
  padding: 40px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.app-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-nav {
  background: white;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tabs button {
  padding: 15px 20px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  font-size: 14px;
}

.nav-tabs button:hover {
  color: #f39c12;
  background: #f8f9fa;
}

.nav-tabs button.active {
  color: #f39c12;
  border-bottom-color: #f39c12;
  background: #fff;
}

.app-main {
  flex: 1;
  background: #f8f9fa;
  padding: 30px 0;
  min-height: calc(100vh - 200px);
}

.app-footer {
  background: #343a40;
  color: white;
  text-align: center;
  padding: 20px 0;
  margin-top: auto;
}

.app-footer p {
  margin: 5px 0;
  font-size: 14px;
}

.app-footer a {
  color: #f7d51d;
  text-decoration: none;
  margin: 0 5px;
}

.app-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }

  .app-header p {
    font-size: 1rem;
  }

  .nav-tabs button {
    padding: 12px 16px;
    font-size: 13px;
  }

  .container {
    padding: 0 15px;
  }
}
</style>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: #f8f9fa;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
