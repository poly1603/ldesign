<template>
  <div class="app">
    <header class="header">
      <h1>📄 Word Viewer - Vue 3 示例</h1>
      <p>使用 Composition API 的 Vue 3 实现</p>
    </header>

    <div class="toolbar">
      <div class="file-input-wrapper">
        <input 
          type="file" 
          id="fileInput" 
          accept=".docx,.doc" 
          @change="handleFileChange"
          ref="fileInputRef"
        />
        <label for="fileInput" class="btn btn-primary">📁 选择文档</label>
      </div>
      <button @click="zoomIn" class="btn">🔍 放大</button>
      <button @click="zoomOut" class="btn">🔎 缩小</button>
      <button @click="toggleEdit" class="btn">
        {{ isEditing ? '📖 查看模式' : '✏️ 编辑模式' }}
      </button>
      <button @click="toggleTheme" class="btn">
        🌓 {{ currentTheme === 'light' ? '深色' : '浅色' }}主题
      </button>
      <button @click="exportPDF" class="btn">📥 导出 PDF</button>
      <button @click="exportHTML" class="btn">📄 导出 HTML</button>
      <input 
        v-model="searchKeyword"
        type="text" 
        placeholder="搜索文本..." 
        class="search-input"
        @keyup.enter="search"
      />
      <button @click="search" class="btn">🔍 搜索</button>
    </div>

    <Transition name="fade">
      <div v-if="statusMessage" :class="['status', statusType, 'show']">
        {{ statusMessage }}
      </div>
    </Transition>

    <div class="viewer-wrapper">
      <div ref="viewerContainer" class="viewer-container"></div>
    </div>

    <div class="info-panel">
      <h3>文档信息</h3>
      <div class="info-content">
        <p><strong>标题:</strong> {{ docInfo.title || '未知' }}</p>
        <p><strong>作者:</strong> {{ docInfo.author || '未知' }}</p>
        <p><strong>页数:</strong> {{ pageInfo.total }}</p>
        <p><strong>当前页:</strong> {{ pageInfo.current }}</p>
        <p><strong>字数:</strong> {{ docInfo.wordCount || '未知' }}</p>
        <p><strong>编辑中:</strong> {{ isEditing ? '是' : '否' }}</p>
        <p><strong>已修改:</strong> {{ isDirty ? '是' : '否' }}</p>
        <p><strong>缩放:</strong> {{ Math.round(currentZoom * 100) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import { WordViewer } from '@word-viewer/core';

// 响应式状态
const viewerContainer = ref(null);
const fileInputRef = ref(null);
const searchKeyword = ref('');
const statusMessage = ref('');
const statusType = ref('info');
const currentTheme = ref('light');
const currentZoom = ref(1.0);
const isEditing = ref(false);
const isDirty = ref(false);

const docInfo = reactive({
  title: '未加载',
  author: '',
  wordCount: 0,
});

const pageInfo = reactive({
  current: 0,
  total: 0,
});

let viewer = null;
let statusTimer = null;

// 初始化查看器
onMounted(() => {
  if (viewerContainer.value) {
    try {
      viewer = new WordViewer(viewerContainer.value, {
        theme: currentTheme.value,
        editable: false,
        showToolbar: false,
      });

      // 绑定事件
      viewer.on('loaded', handleLoaded);
      viewer.on('error', handleError);
      viewer.on('progress', handleProgress);
      viewer.on('changed', handleChanged);
      viewer.on('zoom', handleZoom);

      showStatus('✅ 查看器初始化成功！', 'success');
    } catch (error) {
      showStatus(`❌ 初始化失败: ${error.message}`, 'error');
      console.error('初始化错误', error);
    }
  }
});

// 清理
onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  if (statusTimer) {
    clearTimeout(statusTimer);
  }
});

// 事件处理函数
function handleLoaded(data) {
  showStatus('✅ 文档加载成功！', 'success');
  updateDocInfo();
  console.log('文档已加载', data);
}

function handleError(error) {
  showStatus(`❌ 错误: ${error.message}`, 'error');
  console.error('错误', error);
}

function handleProgress(progress) {
  showStatus(`⏳ 加载中... ${progress.percentage}%`, 'info');
}

function handleChanged() {
  showStatus('📝 文档已修改', 'info');
  isDirty.value = true;
  console.log('文档已修改');
}

function handleZoom(level) {
  currentZoom.value = level;
  showStatus(`🔍 缩放: ${Math.round(level * 100)}%`, 'info');
}

// 更新文档信息
function updateDocInfo() {
  if (!viewer) return;

  const info = viewer.getDocumentInfo();
  const pInfo = viewer.getPageInfo();
  const editState = viewer.getEditState();

  if (info) {
    docInfo.title = info.title || '未知';
    docInfo.author = info.author || '未知';
    docInfo.wordCount = info.wordCount || 0;
  }

  pageInfo.current = pInfo.current;
  pageInfo.total = pInfo.total;

  isEditing.value = editState.isEditing;
  isDirty.value = editState.isDirty;
}

// 文件选择
function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (file && viewer) {
    viewer.loadFile(file).catch(error => {
      console.error('加载失败', error);
    });
  }
}

// 工具栏功能
function zoomIn() {
  if (viewer) {
    viewer.setZoom(viewer.getZoom() + 0.1);
  }
}

function zoomOut() {
  if (viewer) {
    viewer.setZoom(viewer.getZoom() - 0.1);
  }
}

function toggleEdit() {
  if (!viewer) return;

  const state = viewer.getEditState();
  if (state.isEditing) {
    viewer.disableEdit();
    isEditing.value = false;
    showStatus('📖 已切换到查看模式', 'info');
  } else {
    viewer.enableEdit();
    isEditing.value = true;
    showStatus('✏️ 已切换到编辑模式', 'info');
  }
  updateDocInfo();
}

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  if (viewer) {
    viewer.updateOptions({ theme: currentTheme.value });
    showStatus(
      `🌓 已切换到${currentTheme.value === 'light' ? '浅色' : '深色'}主题`, 
      'info'
    );
  }
}

async function exportPDF() {
  if (!viewer) return;

  try {
    showStatus('⏳ 正在导出 PDF...', 'info');
    const blob = await viewer.exportToPDF();
    downloadBlob(blob, 'document.pdf');
    showStatus('✅ PDF 导出成功！', 'success');
  } catch (error) {
    showStatus(`❌ 导出失败: ${error.message}`, 'error');
  }
}

function exportHTML() {
  if (!viewer) return;

  try {
    const html = viewer.exportToHTML();
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'document.html');
    showStatus('✅ HTML 导出成功！', 'success');
  } catch (error) {
    showStatus(`❌ 导出失败: ${error.message}`, 'error');
  }
}

function search() {
  if (!searchKeyword.value || !viewer) return;

  const results = viewer.search(searchKeyword.value);
  showStatus(`🔍 找到 ${results.length} 个结果`, 'success');
  console.log('搜索结果:', results);
}

// 工具函数
function showStatus(message, type = 'info') {
  statusMessage.value = message;
  statusType.value = type;
  
  if (statusTimer) {
    clearTimeout(statusTimer);
  }
  
  statusTimer = setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
}

function downloadBlob(blob, filename) {
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: white;
  padding: 30px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.header h1 {
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
}

.header p {
  color: #666;
  font-size: 14px;
}

.toolbar {
  background: white;
  padding: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  border-top: 1px solid #e0e0e0;
}

.file-input-wrapper {
  position: relative;
}

.file-input-wrapper input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover {
  background: #f5f5f5;
  border-color: #42b883;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  border: none;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.status {
  background: white;
  padding: 12px 20px;
  border-left: 4px solid #2196f3;
  margin: 15px 0;
  font-size: 14px;
  border-radius: 0 6px 6px 0;
}

.status.success {
  background: #e8f5e9;
  border-left-color: #4caf50;
  color: #2e7d32;
}

.status.error {
  background: #ffebee;
  border-left-color: #f44336;
  color: #c62828;
}

.status.info {
  background: #e3f2fd;
  border-left-color: #2196f3;
  color: #1976d2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.viewer-wrapper {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden;
}

.viewer-container {
  height: 600px;
  background: #f8f9fa;
}

.info-panel {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.info-panel h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid #42b883;
  padding-bottom: 10px;
}

.info-content p {
  color: #666;
  margin: 8px 0;
  font-size: 14px;
}

.info-content strong {
  color: #333;
  min-width: 80px;
  display: inline-block;
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  .header {
    padding: 20px;
  }

  .header h1 {
    font-size: 20px;
  }

  .toolbar {
    padding: 10px;
    gap: 6px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .viewer-container {
    height: 400px;
  }
}
</style>

