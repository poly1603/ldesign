<template>
  <div class="demo">
    <h2 class="demo-title">自定义工具栏示例</h2>
    <p class="demo-desc">完全自定义的工具栏和控制面板</p>

    <div class="custom-toolbar">
      <div class="toolbar-section">
        <h3>页面导航</h3>
        <div class="toolbar-controls">
          <button @click="goToPage(1)" class="toolbar-btn" title="首页">
            ⏮
          </button>
          <button @click="previousPage" class="toolbar-btn" title="上一页">
            ◀
          </button>
          <span class="page-display">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button @click="nextPage" class="toolbar-btn" title="下一页">
            ▶
          </button>
          <button @click="goToPage(totalPages)" class="toolbar-btn" title="末页">
            ⏭
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h3>缩放控制</h3>
        <div class="toolbar-controls">
          <button @click="setScale(0.5)" class="toolbar-btn">50%</button>
          <button @click="setScale(1)" class="toolbar-btn">100%</button>
          <button @click="setScale(1.5)" class="toolbar-btn">150%</button>
          <button @click="setScale(2)" class="toolbar-btn">200%</button>
          <input
            v-model.number="customScale"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            @input="setScale(customScale)"
            class="scale-slider"
          />
          <span class="scale-value">{{ Math.round(scale * 100) }}%</span>
        </div>
      </div>

      <div class="toolbar-section">
        <h3>操作</h3>
        <div class="toolbar-controls">
          <button @click="rotate(90)" class="toolbar-btn">↻ 旋转</button>
          <button @click="handlePrint" class="toolbar-btn">🖨 打印</button>
          <button @click="handleDownload" class="toolbar-btn">⬇ 下载</button>
        </div>
      </div>

      <div class="toolbar-section">
        <h3>信息</h3>
        <div class="info-display" v-if="documentInfo">
          <p><strong>标题:</strong> {{ documentInfo.title || '未知' }}</p>
          <p><strong>作者:</strong> {{ documentInfo.author || '未知' }}</p>
          <p><strong>页数:</strong> {{ documentInfo.numPages }}</p>
        </div>
      </div>
    </div>

    <div class="demo-content">
      <PDFViewerComponent
        ref="pdfViewer"
        :source="pdfUrl"
        :workerSrc="`/pdf.worker.min.mjs`"
        :show-toolbar="false"
        @pageChange="currentPage = $event"
        @scaleChange="scale = $event"
        @loadComplete="documentInfo = $event"
      />
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

const pdfViewer = ref<InstanceType<typeof PDFViewerComponent>>();
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const customScale = ref(1);
const documentInfo = ref<DocumentInfo | null>(null);

const goToPage = (page: number) => {
  pdfViewer.value?.goToPage(page);
};

const nextPage = () => {
  pdfViewer.value?.nextPage();
};

const previousPage = () => {
  pdfViewer.value?.previousPage();
};

const setScale = (s: number) => {
  customScale.value = s;
  pdfViewer.value?.setScale(s);
};

const rotate = (angle: number) => {
  pdfViewer.value?.rotate(angle);
};

const handlePrint = () => {
  pdfViewer.value?.print();
};

const handleDownload = () => {
  pdfViewer.value?.download('custom-pdf.pdf');
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

.custom-toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.toolbar-section h3 {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.page-display,
.scale-value {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.scale-slider {
  flex: 1;
  min-width: 100px;
}

.info-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 4px;
}

.info-display p {
  margin: 4px 0;
  font-size: 13px;
}

.demo-content {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}
</style>
