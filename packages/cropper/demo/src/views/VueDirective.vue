<template>
  <div class="vue-directive-demo">
    <div class="demo-header">
      <h1>Vue 指令使用方式</h1>
      <p>简单的指令式使用，最少的代码量</p>
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
          <span v-if="selectedFile" class="file-info">
            已选择: {{ selectedFile.name }}
          </span>
        </div>

        <!-- 配置面板 -->
        <div class="config-panel">
          <h3>指令配置</h3>
          <div class="config-grid">
            <div class="config-item">
              <label>主题:</label>
              <select v-model="directiveConfig.config.theme">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">自动</option>
              </select>
            </div>
            
            <div class="config-item">
              <label>宽高比:</label>
              <select v-model="directiveConfig.config.aspectRatio">
                <option value="free">自由</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="3:2">3:2</option>
              </select>
            </div>

            <div class="config-item">
              <label>显示网格:</label>
              <input 
                type="checkbox" 
                v-model="directiveConfig.config.showGrid"
              >
            </div>

            <div class="config-item">
              <label>响应式:</label>
              <input 
                type="checkbox" 
                v-model="directiveConfig.config.responsive"
              >
            </div>
          </div>
        </div>

        <!-- 使用指令的裁剪器 -->
        <div class="cropper-section">
          <h3>v-cropper 指令</h3>
          <div 
            v-cropper="directiveConfig"
            class="directive-cropper"
            ref="directiveCropperRef"
          >
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions" v-if="cropperInstance">
          <button @click="getCropperData" class="action-btn">
            📊 获取数据
          </button>
          <button @click="rotateCropper(-90)" class="action-btn">
            ↺ 左转
          </button>
          <button @click="rotateCropper(90)" class="action-btn">
            ↻ 右转
          </button>
          <button @click="scaleCropper(1.1)" class="action-btn">
            🔍 放大
          </button>
          <button @click="scaleCropper(0.9)" class="action-btn">
            🔍 缩小
          </button>
          <button @click="resetCropper" class="action-btn">
            🔄 重置
          </button>
          <button @click="exportCropper" class="action-btn primary">
            💾 导出
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

        <!-- 当前数据显示 -->
        <div class="data-display" v-if="currentCropData">
          <h3>当前裁剪数据</h3>
          <pre class="data-content">{{ JSON.stringify(currentCropData, null, 2) }}</pre>
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
                :download="`directive-cropped-image.${exportResult.format}`"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { vSimpleCropper, getSimpleCropperInstance } from '../utils/SimpleCropper.js'

// 兼容性别名
const vCropper = vSimpleCropper
const getCropperInstance = getSimpleCropperInstance

// 响应式数据
const fileInput = ref(null)
const directiveCropperRef = ref(null)
const selectedFile = ref(null)
const cropperInstance = ref(null)
const currentCropData = ref(null)
const exportResult = ref(null)
const activeCodeTab = ref('basic')

const eventLogs = reactive([])

// 指令配置
const directiveConfig = reactive({
  src: null,
  config: {
    theme: 'light',
    aspectRatio: 'free',
    showGrid: true,
    responsive: true
  },
  onReady: (cropper, data) => {
    cropperInstance.value = cropper
    addEventLog('success', 'ready', '裁剪器就绪')
  },
  onCropStart: (cropper, data) => {
    addEventLog('info', 'cropStart', '开始裁剪')
  },
  onCropMove: (cropper, data) => {
    addEventLog('info', 'cropMove', '裁剪移动')
  },
  onCropEnd: (cropper, data) => {
    addEventLog('info', 'cropEnd', '裁剪结束')
  },
  onCropChange: (cropper, data) => {
    currentCropData.value = data.cropData
    addEventLog('info', 'cropChange', `比例: ${data.cropData?.aspectRatio}`)
  },
  onImageLoad: (cropper, data) => {
    addEventLog('success', 'imageLoad', `图片加载: ${data.imageMetadata?.width}×${data.imageMetadata?.height}`)
  },
  onImageError: (cropper, data) => {
    addEventLog('error', 'imageError', `加载失败: ${data.error?.message}`)
  },
  onError: (cropper, error) => {
    addEventLog('error', 'error', error.message)
  }
})

// 代码示例
const codeTabs = [
  { name: 'basic', label: '基础用法' },
  { name: 'advanced', label: '高级用法' },
  { name: 'api', label: 'API 说明' }
]

const codeExamples = {
  basic: `// 基础用法示例
&lt;template&gt;
  &lt;!-- 最简单的使用方式 --&gt;
  &lt;div v-cropper="{ src: '/path/to/image.jpg' }"&gt;&lt;/div&gt;

  &lt;!-- 带配置的使用方式 --&gt;
  &lt;div v-cropper="cropperOptions"&gt;&lt;/div&gt;
&lt;/template&gt;

import { vCropper } from '@ldesign/cropper'

const cropperOptions = {
  src: '/path/to/image.jpg',
  config: {
    aspectRatio: '16:9',
    theme: 'dark',
    showGrid: true
  },
  onReady: (cropper, data) => {
    console.log('裁剪器就绪')
  },
  onCropChange: (cropper, data) => {
    console.log('裁剪变化:', data.cropData)
  }
}`,

  advanced: `// 高级用法示例
&lt;template&gt;
  &lt;div
    v-cropper="dynamicConfig"
    ref="cropperRef"
    class="my-cropper"
  &gt;&lt;/div&gt;

  &lt;button @click="changeConfig"&gt;切换配置&lt;/button&gt;
  &lt;button @click="exportImage"&gt;导出图片&lt;/button&gt;
&lt;/template&gt;

import { ref, reactive } from 'vue'
import { vCropper, getCropperInstance } from '@ldesign/cropper'

const cropperRef = ref(null)

const dynamicConfig = reactive({
  src: null,
  config: {
    theme: 'light',
    aspectRatio: 'free'
  },
  onReady: (cropper, data) => {
    console.log('就绪:', data)
  },
  onCropChange: (cropper, data) => {
    const cropData = cropper.getCropData()
    console.log('当前裁剪数据:', cropData)
  }
})

// 动态改变配置
const changeConfig = () => {
  dynamicConfig.config.theme = 'dark'
  dynamicConfig.config.aspectRatio = '16:9'
}

// 获取裁剪器实例并导出
const exportImage = async () => {
  const cropper = getCropperInstance(cropperRef.value)
  if (cropper) {
    const result = await cropper.export({
      format: 'png',
      quality: 0.9
    })
    console.log('导出结果:', result)
  }
}

// 设置新图片
const setNewImage = (file) => {
  dynamicConfig.src = file
}`,

  api: `// API 说明
// 指令配置接口
interface CropperDirectiveValue {
  src?: ImageSource
  config?: Partial&lt;CropperConfig&gt;
  cropData?: Partial&lt;CropData&gt;

  // 事件回调
  onReady?: (cropper: Cropper, data: any) =&gt; void
  onCropStart?: (cropper: Cropper, data: any) =&gt; void
  onCropMove?: (cropper: Cropper, data: any) =&gt; void
  onCropEnd?: (cropper: Cropper, data: any) =&gt; void
  onCropChange?: (cropper: Cropper, data: any) =&gt; void
  onImageLoad?: (cropper: Cropper, data: any) =&gt; void
  onImageError?: (cropper: Cropper, data: any) =&gt; void
  onError?: (cropper: Cropper, error: Error) =&gt; void
}

// 获取裁剪器实例
import { getCropperInstance } from '@ldesign/cropper'

const cropper = getCropperInstance(element)
if (cropper) {
  // 使用裁剪器 API
  const cropData = cropper.getCropData()
  cropper.rotate(90)
  cropper.scale(1.2)
  const result = await cropper.export()
}

// 注册指令（全局）
import { createApp } from 'vue'
import { vCropper } from '@ldesign/cropper'

const app = createApp(App)
app.directive('cropper', vCropper)

// 或使用插件方式
import CropperPlugin from '@ldesign/cropper'
app.use(CropperPlugin)`
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

  selectedFile.value = file
  directiveConfig.src = file
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

  // 保持最近15条记录
  if (eventLogs.length > 15) {
    eventLogs.splice(15)
  }
}

const getCropperData = () => {
  if (cropperInstance.value) {
    const data = cropperInstance.value.getCropData()
    currentCropData.value = data
    addEventLog('info', 'getCropData', '获取裁剪数据')
  }
}

const rotateCropper = (angle) => {
  if (cropperInstance.value) {
    cropperInstance.value.rotate(angle)
    addEventLog('info', 'rotate', `旋转: ${angle}°`)
  }
}

const scaleCropper = (factor) => {
  if (cropperInstance.value) {
    cropperInstance.value.scale(factor)
    addEventLog('info', 'scale', `缩放: ${factor}`)
  }
}

const resetCropper = () => {
  if (cropperInstance.value) {
    cropperInstance.value.reset()
    addEventLog('info', 'reset', '重置裁剪器')
  }
}

const exportCropper = async () => {
  if (cropperInstance.value) {
    try {
      const result = await cropperInstance.value.export({
        format: 'png',
        quality: 0.9
      })
      exportResult.value = result
      addEventLog('success', 'export', `导出成功: ${result.format}`)
    } catch (error) {
      addEventLog('error', 'exportError', error.message)
    }
  }
}

// 注册指令
onMounted(() => {
  // 指令已经通过全局注册或局部注册
})
</script>

<style scoped>
.vue-directive-demo {
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

.config-panel {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.config-panel h3 {
  margin: 0 0 12px;
  color: #333;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-item label {
  font-weight: 500;
  color: #666;
}

.config-item select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.config-item input[type="checkbox"] {
  transform: scale(1.2);
}

.cropper-section {
  margin-bottom: 20px;
}

.cropper-section h3 {
  margin: 0 0 12px;
  color: #333;
}

.directive-cropper {
  width: 100%;
  height: 400px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
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
  margin: 0 0 12px;
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

.data-display {
  margin-bottom: 20px;
}

.data-display h3 {
  margin: 0 0 12px;
  color: #333;
}

.data-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
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
  max-width: 120px;
  max-height: 120px;
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
  
  .config-grid {
    grid-template-columns: 1fr;
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
