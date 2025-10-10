<template>
  <div class="app">
    <header class="app-header">
      <h1>@ldesign/pdf - Vue 3 示例</h1>
      <p>功能强大的PDF阅读器插件</p>
    </header>

    <main class="app-main">
      <aside class="app-sidebar">
        <h2>示例列表</h2>
        <nav class="demo-nav">
          <button
            v-for="demo in demos"
            :key="demo.id"
            :class="['demo-btn', { active: currentDemo === demo.id }]"
            @click="currentDemo = demo.id"
          >
            {{ demo.name }}
          </button>
        </nav>

        <div class="file-upload">
          <h3>上传PDF</h3>
          <input
            type="file"
            accept=".pdf"
            @change="handleFileChange"
            class="file-input"
          />
        </div>
      </aside>

      <div class="app-content">
        <!-- 基础示例 -->
        <BasicDemo v-if="currentDemo === 'basic'" :pdf-url="pdfUrl" />

        <!-- 高级示例 -->
        <AdvancedDemo v-else-if="currentDemo === 'advanced'" :pdf-url="pdfUrl" />

        <!-- Composable示例 -->
        <ComposableDemo v-else-if="currentDemo === 'composable'" :pdf-url="pdfUrl" />

        <!-- 自定义工具栏 -->
        <CustomToolbarDemo v-else-if="currentDemo === 'toolbar'" :pdf-url="pdfUrl" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BasicDemo from './demos/BasicDemo.vue';
import AdvancedDemo from './demos/AdvancedDemo.vue';
import ComposableDemo from './demos/ComposableDemo.vue';
import CustomToolbarDemo from './demos/CustomToolbarDemo.vue';

const demos = [
  { id: 'basic', name: '基础示例' },
  { id: 'advanced', name: '高级功能' },
  { id: 'composable', name: 'Composable用法' },
  { id: 'toolbar', name: '自定义工具栏' },
];

const currentDemo = ref('basic');

// 使用公开的PDF测试文件
const pdfUrl = ref('https://pdfobject.com/pdf/sample.pdf');

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const url = URL.createObjectURL(file);
    pdfUrl.value = url;
  }
};
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.app-header p {
  margin: 0;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: 250px;
  padding: 20px;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.app-sidebar h2,
.app-sidebar h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
}

.demo-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.demo-btn {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  transition: all 0.2s;
}

.demo-btn:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.demo-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.file-upload {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.app-content {
  flex: 1;
  overflow: hidden;
}
</style>
