<template>
  <div class="vue-component-demo">
    <div class="demo-header">
      <h1>Vue 组件使用方式</h1>
      <p>开箱即用的 Vue 组件，完整的功能集成</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h2>功能演示</h2>
        
        <!-- 文件上传区域 -->
        <div class="upload-section">
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect"
            style="display: none"
          >
          <button @click="selectFile" class="upload-btn">
            📁 选择图片
          </button>
          <span v-if="imageSrc" class="file-info">
            图片已加载
          </span>
        </div>

        <!-- 配置选项 -->
        <div class="config-section">
          <div class="config-group">
            <label>主题:</label>
            <select v-model="theme">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">自动</option>
            </select>
          </div>

          <div class="config-group">
            <label>宽高比:</label>
            <select v-model="aspectRatio">
              <option value="free">自由</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
              <option value="3:2">3:2</option>
            </select>
          </div>

          <div class="config-group">
            <label>
              <input type="checkbox" v-model="showToolbar">
              显示工具栏
            </label>
          </div>

          <div class="config-group">
            <label>
              <input type="checkbox" v-model="showControlPanel">
              显示控制面板
            </label>
          </div>
        </div>

        <!-- Vue 组件裁剪器 -->
        <div class="cropper-wrapper">
          <ImageCropper
            v-if="imageSrc"
            :src="imageSrc"
            :theme="theme"
            :aspect-ratio="aspectRatio"
            :show-toolbar="showToolbar"
            :show-control-panel="showControlPanel"
            :loading-text="'正在加载图片...'"
            @ready="handleReady"
            @crop-start="handleCropStart"
            @crop-move="handleCropMove"
            @crop-end="handleCropEnd"
            @crop-change="handleCropChange"
            @image-load="handleImageLoad"
            @image-error="handleImageError"
            @export="handleExport"
            @error="handleError"
            @update:crop-data="handleCropDataUpdate"
            ref="cropperRef"
          />
          <div v-else class="placeholder">
            <div class="placeholder-icon">🖼️</div>
            <p>请选择一张图片开始裁剪</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions" v-if="imageSrc">
          <button @click="exportImage" class="action-btn primary">
            💾 导出图片
          </button>
          <button @click="resetCropper" class="action-btn">
            🔄 重置
          </button>
          <button @click="rotateCropper(-90)" class="action-btn">
            ↺ 左转
          </button>
          <button @click="rotateCropper(90)" class="action-btn">
            ↻ 右转
          </button>
        </div>

        <!-- 事件日志 -->
        <div class="event-log">
          <h3>事件日志</h3>
          <div class="log-content">
            <div 
              v-for="(log, index) in eventLogs" 
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-event">{{ log.event }}</span>
              <span class="log-data">{{ log.data }}</span>
            </div>
          </div>
        </div>

        <!-- 导出结果 -->
        <div class="export-result" v-if="exportResult">
          <h3>导出结果</h3>
          <div class="result-content">
            <img :src="exportResult.dataURL" alt="导出结果" class="result-image">
            <div class="result-info">
              <p>格式: {{ exportResult.format }}</p>
              <p>尺寸: {{ exportResult.width }} × {{ exportResult.height }}</p>
              <p>大小: {{ (exportResult.blob.size / 1024).toFixed(1) }} KB</p>
              <a 
                :href="exportResult.dataURL" 
                :download="`vue-cropped-image.${exportResult.format}`"
                class="download-btn"
              >
                💾 下载图片
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码示例 -->
      <div class="code-section">
        <h2>代码示例</h2>
        <div class="code-tabs">
          <button 
            v-for="tab in codeTabs" 
            :key="tab.name"
            @click="activeCodeTab = tab.name"
            class="code-tab"
            :class="{ active: activeCodeTab === tab.name }"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="code-block">
          <pre><code>{{ currentCodeExample }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { SimpleImageCropper } from '../utils/SimpleCropper.js'

// 注册组件
const ImageCropper = SimpleImageCropper

// 响应式数据
const fileInput = ref(null)
const cropperRef = ref(null)
const imageSrc = ref(null)
const theme = ref('light')
const aspectRatio = ref('free')
const showToolbar = ref(true)
const showControlPanel = ref(false)
const exportResult = ref(null)
const activeCodeTab = ref('template')

const eventLogs = reactive([])

// 代码示例
const codeTabs = [
  { name: 'template', label: 'Template' },
  { name: 'script', label: 'Script' },
  { name: 'props', label: 'Props' }
]

const codeExamples = {
  template: `// Template 示例
&lt;template&gt;
  &lt;ImageCropper
    :src="imageSrc"
    :theme="theme"
    :aspect-ratio="aspectRatio"
    :show-toolbar="showToolbar"
    :show-control-panel="showControlPanel"
    @ready="handleReady"
    @crop-change="handleCropChange"
    @export="handleExport"
    @error="handleError"
    ref="cropperRef"
  /&gt;
&lt;/template&gt;`,

  script: `// Script 示例
import { ref } from 'vue'
import { ImageCropper } from '@ldesign/cropper'

const imageSrc = ref('/path/to/image.jpg')
const theme = ref('light')
const aspectRatio = ref('16:9')
const cropperRef = ref(null)

const handleReady = (data) => {
  console.log('裁剪器就绪:', data)
}

const handleCropChange = (data) => {
  console.log('裁剪变化:', data)
}

const exportImage = async () => {
  const result = await cropperRef.value.exportImage({
    format: 'png',
    quality: 0.9
  })
}`,

  props: `// Props 和 Events 定义
interface Props {
  src?: ImageSource
  cropData?: Partial&lt;CropData&gt;
  config?: Partial&lt;CropperConfig&gt;
  theme?: 'light' | 'dark' | 'auto'
  showToolbar?: boolean
  showControlPanel?: boolean
  loadingText?: string
  aspectRatio?: AspectRatio
  disabled?: boolean
}

interface Emits {
  (e: 'ready', data: CropperEventData): void
  (e: 'cropStart', data: CropperEventData): void
  (e: 'cropMove', data: CropperEventData): void
  (e: 'cropEnd', data: CropperEventData): void
  (e: 'cropChange', data: CropperEventData): void
  (e: 'imageLoad', data: CropperEventData): void
  (e: 'imageError', data: CropperEventData): void
  (e: 'update:cropData', data: CropData): void
  (e: 'export', result: ExportResult): void
  (e: 'error', error: Error): void
}`
}

const currentCodeExample = computed(() => {
  return codeExamples[activeCodeTab.value]
})

// 方法
const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 创建 URL 用于组件
  imageSrc.value = file
  addEventLog('info', 'fileSelect', `选择文件: ${file.name}`)
}

const addEventLog = (type, event, data) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  
  eventLogs.unshift({
    type,
    event,
    data,
    time
  })

  // 保持最近20条记录
  if (eventLogs.length > 20) {
    eventLogs.splice(20)
  }
}

// 事件处理器
const handleReady = (data) => {
  addEventLog('success', 'ready', '裁剪器就绪')
}

const handleCropStart = (data) => {
  addEventLog('info', 'cropStart', '开始裁剪')
}

const handleCropMove = (data) => {
  addEventLog('info', 'cropMove', `裁剪移动: ${JSON.stringify(data.cropData?.area)}`)
}

const handleCropEnd = (data) => {
  addEventLog('info', 'cropEnd', '裁剪结束')
}

const handleCropChange = (data) => {
  addEventLog('info', 'cropChange', `裁剪变化: 比例=${data.cropData?.aspectRatio}`)
}

const handleImageLoad = (data) => {
  addEventLog('success', 'imageLoad', `图片加载成功: ${data.imageMetadata?.width}×${data.imageMetadata?.height}`)
}

const handleImageError = (data) => {
  addEventLog('error', 'imageError', `图片加载失败: ${data.error?.message}`)
}

const handleExport = (result) => {
  exportResult.value = result
  addEventLog('success', 'export', `导出成功: ${result.format} ${result.width}×${result.height}`)
}

const handleError = (error) => {
  addEventLog('error', 'error', `错误: ${error.message}`)
}

const handleCropDataUpdate = (data) => {
  addEventLog('info', 'cropDataUpdate', '裁剪数据更新')
}

// 操作方法
const exportImage = async () => {
  if (cropperRef.value) {
    try {
      await cropperRef.value.exportImage({
        format: 'png',
        quality: 0.9
      })
    } catch (error) {
      addEventLog('error', 'exportError', error.message)
    }
  }
}

const resetCropper = () => {
  if (cropperRef.value) {
    cropperRef.value.reset()
    addEventLog('info', 'reset', '重置裁剪器')
  }
}

const rotateCropper = (angle) => {
  if (cropperRef.value) {
    cropperRef.value.rotate(angle)
    addEventLog('info', 'rotate', `旋转: ${angle}°`)
  }
}
</script>

<style scoped>
.vue-component-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.demo-header p {
  color: #666;
  font-size: 16px;
}

.demo-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.demo-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.upload-section {
  margin-bottom: 20px;
  text-align: center;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #5a67d8;
}

.file-info {
  margin-left: 12px;
  color: #28a745;
  font-size: 14px;
  font-weight: 500;
}

.config-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-group label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.config-group select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.config-group input[type="checkbox"] {
  margin-right: 6px;
}

.cropper-wrapper {
  width: 100%;
  height: 400px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.action-btn.primary:hover {
  background: #5a67d8;
}

.event-log {
  margin-bottom: 20px;
}

.event-log h3 {
  margin-bottom: 12px;
  color: #333;
}

.log-content {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
}

.log-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6c757d;
  font-family: monospace;
}

.log-event {
  font-weight: 500;
}

.log-item.success .log-event {
  color: #28a745;
}

.log-item.error .log-event {
  color: #dc3545;
}

.log-item.info .log-event {
  color: #007bff;
}

.log-data {
  color: #6c757d;
  font-family: monospace;
  font-size: 11px;
}

.export-result {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.export-result h3 {
  margin-bottom: 16px;
  color: #333;
}

.result-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.result-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-info {
  flex: 1;
}

.result-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.download-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 6px 12px;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background 0.3s;
}

.download-btn:hover {
  background: #218838;
}

.code-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.code-section h2 {
  margin-bottom: 16px;
  color: #333;
}

.code-tabs {
  display: flex;
  margin-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.code-tab {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.code-tab:hover {
  color: #333;
}

.code-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #d4d4d4;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .demo-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .config-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-group {
    justify-content: space-between;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .result-content {
    flex-direction: column;
  }
  
  .code-tabs {
    flex-wrap: wrap;
  }
}
</style>
