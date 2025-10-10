<template>
  <div class="demo">
    <h2 class="demo-title">Composable 示例</h2>
    <p class="demo-desc">使用 usePDFViewer composable 完全控制PDF查看器</p>

    <div class="controls">
      <button @click="previousPage" :disabled="currentPage <= 1" class="btn">
        上一页
      </button>
      <input
        v-model.number="pageInput"
        type="number"
        :min="1"
        :max="totalPages"
        class="page-input"
        @keyup.enter="goToPage(pageInput)"
      />
      <span class="page-info">/ {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="btn">
        下一页
      </button>

      <div class="divider"></div>

      <button @click="zoomOut" class="btn">缩小</button>
      <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn" class="btn">放大</button>

      <div class="divider"></div>

      <button @click="rotate(90)" class="btn">旋转</button>
      <button @click="print" class="btn">打印</button>
      <button @click="download('my-pdf.pdf')" class="btn">下载</button>
      <button @click="refresh" class="btn">刷新</button>
    </div>

    <div class="demo-content">
      <div v-if="loading" class="loading">
        加载中... {{ Math.round(progress * 100) }}%
      </div>
      <div v-if="error" class="error">
        错误: {{ error.message }}
      </div>
      <div ref="containerRef" class="pdf-container"></div>
    </div>

    <div class="demo-info">
      <p>当前页: {{ currentPage }} / {{ totalPages }}</p>
      <p>缩放: {{ Math.round(scale * 100) }}%</p>
      <p v-if="documentInfo">标题: {{ documentInfo.title || '未知' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue';
import { usePDFViewer } from '@ldesign/pdf';

const props = defineProps<{
  pdfUrl: string;
}>();

const pdfSource = toRef(props, 'pdfUrl');

const {
  containerRef,
  loading,
  progress,
  error,
  currentPage,
  totalPages,
  scale,
  documentInfo,
  goToPage,
  nextPage,
  previousPage,
  zoomIn,
  zoomOut,
  rotate,
  print,
  download,
  refresh,
} = usePDFViewer(pdfSource, {
  workerSrc: '/pdf.worker.min.mjs',
  scale: 1.2,
  quality: 'high',
});

const pageInput = ref(1);
</script>

<style scoped>
.demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.demo-title {
  margin: 0 0 8px;
  font-size: 24px;
  color: #333;
}

.demo-desc {
  margin: 0 0 16px;
  color: #666;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.page-info,
.scale-info {
  font-size: 14px;
  color: #666;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 8px;
}

.demo-content {
  flex: 1;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.loading,
.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
}

.error {
  color: #d32f2f;
}

.pdf-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.demo-info {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.demo-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}
</style>
