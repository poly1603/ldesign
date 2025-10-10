<template>
  <div class="demo">
    <h2 class="demo-title">高级功能示例</h2>
    <p class="demo-desc">展示更多高级功能和配置选项</p>

    <div class="controls">
      <div class="control-group">
        <label>缩放模式:</label>
        <select v-model="scaleMode">
          <option value="auto">自动</option>
          <option value="page-fit">适应页面</option>
          <option value="page-width">适应宽度</option>
          <option value="1">100%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select>
      </div>

      <div class="control-group">
        <label>渲染质量:</label>
        <select v-model="quality">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="ultra">超高</option>
        </select>
      </div>

      <div class="control-group">
        <label>布局模式:</label>
        <select v-model="layout">
          <option value="single">单页</option>
          <option value="continuous">连续</option>
          <option value="double">双页</option>
        </select>
      </div>
    </div>

    <div class="demo-content">
      <PDFViewerComponent
        :source="pdfUrl"
        :workerSrc="`/pdf.worker.min.mjs`"
        :scale="scaleMode"
        :quality="quality"
        :layout="layout"
        :enable-text-selection="true"
        :enable-annotations="true"
        :cache="{
          enabled: true,
          maxPages: 100,
          strategy: 'lru',
          preloadPages: 5,
        }"
        :render="{
          dpi: 150,
          useWorker: true,
          maxConcurrent: 5,
        }"
        @load="handleLoad"
      />
    </div>

    <div class="demo-info">
      <p v-if="docInfo">
        文档标题: {{ docInfo.title || '未知' }} |
        页数: {{ docInfo.numPages }} |
        作者: {{ docInfo.author || '未知' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PDFViewerComponent } from '@ldesign/pdf';
import type { DocumentInfo } from '@ldesign/pdf';

const props = defineProps<{
  pdfUrl: string;
}>();

const scaleMode = ref<any>('auto');
const quality = ref<any>('medium');
const layout = ref<any>('continuous');
const docInfo = ref<DocumentInfo | null>(null);

const handleLoad = () => {
  console.log('PDF加载完成');
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
  margin: 0 0 16px;
  color: #666;
}

.controls {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 14px;
  color: #666;
}

.control-group select {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
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
