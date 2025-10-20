<template>
  <div class="app">
    <header class="header">
      <h1>📊 Excel Viewer - Vue 3 示例</h1>
      <p>功能强大的 Excel 文件预览编辑插件</p>
    </header>

    <div class="container">
      <div class="toolbar">
        <label for="file-input" class="file-label">
          📁 选择 Excel 文件
          <input
            type="file"
            id="file-input"
            accept=".xlsx,.xls,.csv"
            @change="handleFileChange"
            style="display: none"
          >
        </label>
        
        <button class="btn btn-primary" @click="loadSampleFile">
          📄 加载示例文件
        </button>
        <button class="btn btn-secondary" @click="exportToExcel">
          💾 导出 Excel
        </button>
        <button class="btn btn-secondary" @click="exportToCSV">
          📋 导出 CSV
        </button>
        <button class="btn btn-info" @click="exportScreenshot">
          📸 导出截图
        </button>
        
        <div class="search-box">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索内容..."
            @keyup.enter="searchContent"
          >
          <button class="btn btn-info" @click="searchContent">
            🔍 搜索
          </button>
        </div>
      </div>

      <div class="viewer-container">
        <ExcelViewer
          ref="viewerRef"
          :file="currentFile"
          :show-toolbar="true"
          :show-formula-bar="true"
          :show-sheet-tabs="true"
          :allow-edit="true"
          lang="zh"
          theme="light"
          height="700px"
          @load="handleLoad"
          @load-error="handleLoadError"
          @cell-click="handleCellClick"
          @cell-change="handleCellChange"
        />
      </div>

      <div class="status">{{ status }}</div>

      <div v-if="searchResults.length > 0" class="search-results">
        <h3>搜索结果 ({{ searchResults.length }} 个匹配项)</h3>
        <ul>
          <li v-for="(result, index) in searchResults" :key="index">
            工作表: {{ result.sheetName }} | 
            位置: 行{{ result.row + 1 }}, 列{{ result.col + 1 }} | 
            值: {{ result.value }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-vue';
import type { SearchResult } from '@ldesign/excel-viewer-vue';

const viewerRef = ref<InstanceType<typeof ExcelViewer>>();
const currentFile = ref<File | ArrayBuffer | string>();
const status = ref('等待加载文件...');
const searchKeyword = ref('');
const searchResults = ref<SearchResult[]>([]);

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    currentFile.value = file;
    status.value = '⏳ 正在加载文件...';
  }
};

// 加载示例文件
const loadSampleFile = () => {
  // 这里可以加载一个示例 Excel 文件 URL
  alert('请提供示例文件 URL');
};

// 导出为 Excel
const exportToExcel = () => {
  if (!viewerRef.value) return;
  
  viewerRef.value.downloadFile({
    format: 'xlsx',
    filename: 'export.xlsx',
    includeStyles: true,
    includeFormulas: true,
  });
  status.value = '✅ Excel 文件已下载';
};

// 导出为 CSV
const exportToCSV = () => {
  if (!viewerRef.value) return;
  
  viewerRef.value.downloadFile({
    format: 'csv',
    filename: 'export.csv',
  });
  status.value = '✅ CSV 文件已下载';
};

// 导出截图
const exportScreenshot = () => {
  if (!viewerRef.value) return;
  
  // 截图功能需要核心库支持
  status.value = '📸 截图功能开发中...';
};

// 搜索内容
const searchContent = () => {
  if (!viewerRef.value || !searchKeyword.value) {
    alert('请输入搜索关键词');
    return;
  }

  const results = viewerRef.value.search({
    keyword: searchKeyword.value,
    caseSensitive: false,
    matchWholeWord: false,
  });
  
  searchResults.value = results;
  status.value = `🔍 找到 ${results.length} 个匹配项`;
};

// 加载完成
const handleLoad = (data: any) => {
  status.value = `✅ 成功加载 ${data.sheets?.length || 0} 个工作表`;
};

// 加载错误
const handleLoadError = (error: any) => {
  status.value = `❌ 加载失败: ${error.message}`;
};

// 单元格点击
const handleCellClick = (data: any) => {
  console.log('单元格点击:', data);
};

// 单元格变化
const handleCellChange = (data: any) => {
  console.log('单元格变化:', data);
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
  font-size: 14px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.toolbar {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #48bb78;
  color: white;
}

.btn-secondary:hover {
  background: #38a169;
  transform: translateY(-1px);
}

.btn-info {
  background: #4299e1;
  color: white;
}

.btn-info:hover {
  background: #3182ce;
}

.file-label {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.file-label:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.viewer-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.status {
  margin-top: 20px;
  padding: 10px 15px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #4a5568;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
  max-width: 300px;
}

.search-results {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-results h3 {
  margin-bottom: 15px;
  color: #2d3748;
}

.search-results ul {
  list-style: none;
}

.search-results li {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.search-results li:last-child {
  border-bottom: none;
}
</style>


