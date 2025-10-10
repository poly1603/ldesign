<template>
  <div class="pdf-viewer" :class="viewerClass">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="pdf-toolbar">
      <div class="pdf-toolbar-left">
        <button
          class="pdf-btn"
          :disabled="currentPage <= 1"
          @click="previousPage"
          title="上一页"
        >
          ‹
        </button>
        <span class="pdf-page-info">
          <input
            v-model.number="pageInput"
            type="number"
            min="1"
            :max="totalPages"
            class="pdf-page-input"
            @keyup.enter="handlePageJump"
          />
          / {{ totalPages }}
        </span>
        <button
          class="pdf-btn"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
          title="下一页"
        >
          ›
        </button>
      </div>

      <div class="pdf-toolbar-center">
        <button class="pdf-btn" @click="zoomOut" title="缩小">−</button>
        <span class="pdf-scale-info">{{ Math.round(scale * 100) }}%</span>
        <button class="pdf-btn" @click="zoomIn" title="放大">+</button>
        <button class="pdf-btn" @click="rotate(90)" title="旋转">↻</button>
      </div>

      <div class="pdf-toolbar-right">
        <button
          v-if="showSearch"
          class="pdf-btn"
          @click="toggleSearch"
          title="搜索"
        >
          🔍
        </button>
        <button
          v-if="showPrint"
          class="pdf-btn"
          @click="handlePrint"
          title="打印"
        >
          🖨
        </button>
        <button
          v-if="showDownload"
          class="pdf-btn"
          @click="handleDownload"
          title="下载"
        >
          ⬇
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div v-if="searchVisible" class="pdf-search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="pdf-search-input"
        placeholder="搜索..."
        @keyup.enter="handleSearch"
      />
      <button class="pdf-btn" @click="handleSearch">搜索</button>
      <button class="pdf-btn" @click="toggleSearch">关闭</button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="pdf-loading">
      <div class="pdf-loading-spinner"></div>
      <div class="pdf-loading-text">加载中... {{ Math.round(progress * 100) }}%</div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="pdf-error">
      <div class="pdf-error-icon">⚠</div>
      <div class="pdf-error-message">{{ error.message }}</div>
    </div>

    <!-- 内容容器 -->
    <div ref="containerRef" class="pdf-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue';
import { usePDFViewer } from './usePDFViewer';
import type { PDFSource } from '../../types';
import type { UsePDFViewerOptions } from './usePDFViewer';

interface Props extends UsePDFViewerOptions {
  /** PDF源 */
  source?: PDFSource;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示搜索 */
  showSearch?: boolean;
  /** 是否显示打印 */
  showPrint?: boolean;
  /** 是否显示下载 */
  showDownload?: boolean;
  /** 自定义类名 */
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showToolbar: true,
  showSearch: true,
  showPrint: true,
  showDownload: true,
  autoLoad: true,
});

const emit = defineEmits<{
  load: [];
  error: [error: Error];
  pageChange: [page: number];
}>();

// 使用composable
const sourceRef = toRef(props, 'source');
const {
  viewer,
  containerRef,
  loading,
  progress,
  error,
  currentPage,
  totalPages,
  scale,
  load: loadPDF,
  goToPage,
  nextPage,
  previousPage,
  setScale,
  zoomIn,
  zoomOut,
  rotate,
  search,
  print,
  download,
  refresh,
} = usePDFViewer(sourceRef, props);

// 本地状态
const pageInput = ref(1);
const searchVisible = ref(false);
const searchQuery = ref('');

// 计算属性
const viewerClass = computed(() => ({
  'pdf-viewer--loading': loading.value,
  'pdf-viewer--error': error.value,
  [props.class || '']: true,
}));

// 监听当前页变化
watch(currentPage, (page) => {
  pageInput.value = page;
  emit('pageChange', page);
});

// 监听错误
watch(error, (err) => {
  if (err) {
    emit('error', err);
  }
});

/**
 * 处理页面跳转
 */
const handlePageJump = () => {
  const page = pageInput.value;
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page);
  } else {
    pageInput.value = currentPage.value;
  }
};

/**
 * 切换搜索栏
 */
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value;
  if (!searchVisible.value) {
    searchQuery.value = '';
  }
};

/**
 * 处理搜索
 */
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await search(searchQuery.value);
  }
};

/**
 * 处理打印
 */
const handlePrint = async () => {
  await print();
};

/**
 * 处理下载
 */
const handleDownload = () => {
  download();
};

// 暴露方法给父组件
defineExpose({
  viewer,
  load: loadPDF,
  goToPage,
  nextPage,
  previousPage,
  setScale,
  zoomIn,
  zoomOut,
  rotate,
  search,
  print,
  download,
  refresh,
});
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  position: relative;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}

.pdf-toolbar-left,
.pdf-toolbar-center,
.pdf-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pdf-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pdf-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.pdf-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-page-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.pdf-page-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.pdf-scale-info {
  min-width: 50px;
  text-align: center;
  font-size: 14px;
}

.pdf-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.pdf-search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.pdf-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-loading-text {
  font-size: 14px;
  color: #666;
}

.pdf-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.pdf-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pdf-error-message {
  font-size: 14px;
  color: #d32f2f;
}

.pdf-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-container :deep(canvas) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}
</style>
