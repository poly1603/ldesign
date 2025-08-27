<!--
开发环境主应用
-->

<template>
  <div id="app">
    <header class="app-header">
      <h1>🍋 LemonForm 开发环境</h1>
      <nav class="app-nav">
        <button
          v-for="example in examples"
          :key="example.key"
          :class="{ active: currentExample === example.key }"
          @click="currentExample = example.key"
        >
          {{ example.name }}
        </button>
      </nav>
    </header>

    <main class="app-main">
      <component :is="currentExampleComponent" />
    </main>

    <footer class="app-footer">
      <p>LemonForm v{{ version }} - 开发环境</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VERSION } from '../src'
import BasicExample from '../examples/basic-example.vue'

// 当前示例
const currentExample = ref('basic')

// 示例列表
const examples = [
  { key: 'basic', name: '基础示例', component: BasicExample },
  // 可以添加更多示例
]

// 当前示例组件
const currentExampleComponent = computed(() => {
  const example = examples.find(ex => ex.key === currentExample.value)
  return example?.component || BasicExample
})

// 版本信息
const version = VERSION
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #f7d51d 0%, #f39c12 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.app-nav button {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.app-nav button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.app-nav button.active {
  background: white;
  color: #f39c12;
  border-color: white;
}

.app-main {
  flex: 1;
  background: #f8f9fa;
  padding: 20px;
}

.app-footer {
  background: #343a40;
  color: white;
  text-align: center;
  padding: 15px;
}

.app-footer p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-nav {
    flex-direction: column;
    align-items: center;
  }
  
  .app-nav button {
    width: 200px;
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
