<template>
  <div class="app">
    <header class="header">
      <h1>📄 Word Viewer - Vue 3 示例</h1>
    </header>

    <div class="toolbar">
      <input
        type="file"
        accept=".docx,.doc"
        @change="handleFileChange"
        ref="fileInput"
      />
      <button @click="zoomIn">放大 +</button>
      <button @click="zoomOut">缩小 -</button>
      <button @click="toggleEdit">
        {{ editable ? '禁用编辑' : '启用编辑' }}
      </button>
      <button @click="toggleTheme">
        {{ theme === 'light' ? '深色主题' : '浅色主题' }}
      </button>
      <button @click="exportPDF">导出 PDF</button>
      <button @click="exportHTML">导出 HTML</button>
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索..."
        @keyup.enter="search"
        class="search-input"
      />
      <button @click="search">搜索</button>
    </div>

    <div v-if="statusMessage" :class="['status', { error: isError }]">
      {{ statusMessage }}
    </div>

    <WordViewer
      ref="viewerRef"
      :source="documentFile"
      :zoom="zoom"
      :editable="editable"
      :theme="theme"
      @loaded="onLoaded"
      @error="onError"
      @changed="onChanged"
      @zoom="onZoom"
      @page-change="onPageChange"
      class="viewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '../../dist/vue.esm.js';

const viewerRef = ref();
const documentFile = ref<File | null>(null);
const zoom = ref(1.0);
const editable = ref(false);
const theme = ref<'light' | 'dark'>('light');
const searchKeyword = ref('');
const statusMessage = ref('');
const isError = ref(false);

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    documentFile.value = file;
  }
}

function zoomIn() {
  zoom.value = Math.min(3.0, zoom.value + 0.1);
}

function zoomOut() {
  zoom.value = Math.max(0.5, zoom.value - 0.1);
}

function toggleEdit() {
  editable.value = !editable.value;
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

async function exportPDF() {
  try {
    const viewer = viewerRef.value?.getViewer();
    if (viewer) {
      const blob = await viewer.exportToPDF();
      downloadBlob(blob, 'document.pdf');
      showStatus('PDF 导出成功！', false);
    }
  } catch (error) {
    showStatus('导出失败: ' + (error as Error).message, true);
  }
}

function exportHTML() {
  try {
    const viewer = viewerRef.value?.getViewer();
    if (viewer) {
      const html = viewer.exportToHTML();
      const blob = new Blob([html], { type: 'text/html' });
      downloadBlob(blob, 'document.html');
      showStatus('HTML 导出成功！', false);
    }
  } catch (error) {
    showStatus('导出失败: ' + (error as Error).message, true);
  }
}

function search() {
  if (!searchKeyword.value) return;
  
  const viewer = viewerRef.value?.getViewer();
  if (viewer) {
    const results = viewer.search(searchKeyword.value);
    showStatus(`找到 ${results.length} 个结果`, false);
    console.log('搜索结果:', results);
  }
}

function onLoaded(data: any) {
  showStatus('文档加载成功！', false);
  console.log('文档已加载', data);
}

function onError(error: any) {
  showStatus(`加载错误: ${error.message}`, true);
  console.error('错误', error);
}

function onChanged() {
  console.log('文档已修改');
}

function onZoom(level: number) {
  console.log('缩放级别:', level);
}

function onPageChange(pageInfo: any) {
  console.log('页面变化:', pageInfo);
}

function showStatus(message: string, error: boolean) {
  statusMessage.value = message;
  isError.value = error;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background-color: #4285f4;
  color: white;
  padding: 20px;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.toolbar {
  background-color: white;
  padding: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar button,
.toolbar input[type="file"] {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.toolbar button:hover {
  background-color: #f5f5f5;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.status {
  padding: 10px 15px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  margin: 15px;
  border-radius: 4px;
}

.status.error {
  background-color: #ffebee;
  border-left-color: #f44336;
}

.viewer {
  flex: 1;
  overflow: auto;
}
</style>



