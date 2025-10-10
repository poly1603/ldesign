<template>
  <div class="demo">
    <h2 class="demo-title">基础示例</h2>
    <p class="demo-desc">最简单的使用方式，只需传入PDF地址即可</p>

    <div class="demo-content">
      <PDFViewerComponent
        :source="pdfUrl"
        :workerSrc="`/pdf.worker.min.mjs`"
        :show-toolbar="true"
        :show-search="true"
        :show-print="true"
        :show-download="true"
        @pageChange="handlePageChange"
        @error="handleError"
      />
    </div>

    <div class="demo-info">
      <p>当前页: {{ currentPage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PDFViewerComponent } from '@ldesign/pdf';

const props = defineProps<{
  pdfUrl: string;
}>();

const currentPage = ref(1);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  console.log('页面切换:', page);
};

const handleError = (error: Error) => {
  console.error('加载错误:', error);
};
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
  margin: 0 0 20px;
  color: #666;
}

.demo-content {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.demo-info {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.demo-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
