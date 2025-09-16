<template>
  <div class="vue-hook-demo">
    <div class="demo-header">
      <h1>Vue Hook 使用方式</h1>
      <p>Composition API Hook，灵活的状态管理</p>
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

        <!-- Hook 状态显示 -->
        <div class="status-panel">
          <div class="status-grid">
            <div class="status-item">
              <label>加载状态:</label>
              <span :class="{ loading: loading }">
                {{ loading ? '加载中...' : '就绪' }}
              </span>
            </div>
            <div class="status-item">
              <label>错误信息:</label>
              <span class="error">{{ error || '无' }}</span>
            </div>
            <div class="status-item">
              <label>是否就绪:</label>
              <span :class="{ ready: isReady }">
                {{ isReady ? '是' : '否' }}
              </span>
            </div>
            <div class="status-item">
              <label>图片尺寸:</label>
              <span>
                {{ imageMetadata ? `${imageMetadata.width} × ${imageMetadata.height}` : '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 裁剪器容器 -->
        <div ref="containerRef" class="cropper-container">
          <div v-if="!cropperInstance" class="placeholder">
            <div class="placeholder-icon">🖼️</div>
            <p>请选择一张图片开始裁剪</p>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="controls" v-if="isReady">
          <div class="control-section">
            <h3>基础操作</h3>
            <div class="control-group">
              <button @click="rotate(-90)" class="control-btn">↺ 左转</button>
              <button @click="rotate(90)" class="control-btn">↻ 右转</button>
              <button @click="scale(1.1)" class="control-btn">🔍 放大</button>
              <button @click="scale(0.9)" class="control-btn">🔍 缩小</button>
            </div>
          </div>

          <div class="control-section">
            <h3>翻转操作</h3>
            <div class="control-group">
              <button @click="flip(true, false)" class="control-btn">⟷ 水平翻转</button>
              <button @click="flip(false, true)" class="control-btn">⟷ 垂直翻转</button>
              <button @click="flip(true, true)" class="control-btn">🔄 双向翻转</button>
            </div>
          </div>

          <div class="control-section">
            <h3>宽高比设置</h3>
            <div class="control-group">
              <button @click="setAspectRatio('free')" class="control-btn">自由</button>
              <button @click="setAspectRatio('1:1')" class="control-btn">1:1</button>
              <button @click="setAspectRatio('4:3')" class="control-btn">4:3</button>
              <button @click="setAspectRatio('16:9')" class="control-btn">16:9</button>
            </div>
          </div>

          <div class="control-section">
            <h3>其他操作</h3>
            <div class="control-group">
              <button @click="reset" class="control-btn">🔄 重置</button>
              <button @click="exportImage" class="control-btn primary">💾 导出</button>
            </div>
          </div>
        </div>

        <!-- 裁剪数据显示 -->
        <div class="crop-data-panel" v-if="cropData">
          <h3>当前裁剪数据</h3>
          <div class="data-grid">
            <div class="data-item">
              <label>裁剪区域:</label>
              <span>
                x: {{ Math.round(cropData.area.x) }}, 
                y: {{ Math.round(cropData.area.y) }}, 
                w: {{ Math.round(cropData.area.width) }}, 
                h: {{ Math.round(cropData.area.height) }}
              </span>
            </div>
            <div class="data-item">
              <label>宽高比:</label>
              <span>{{ cropData.aspectRatio }}</span>
            </div>
            <div class="data-item">
              <label>旋转角度:</label>
              <span>{{ Math.round(cropData.rotation) }}°</span>
            </div>
            <div class="data-item">
              <label>缩放比例:</label>
              <span>{{ cropData.scale.toFixed(2) }}</span>
            </div>
            <div class="data-item">
              <label>翻转状态:</label>
              <span>
                {{ cropData.flip.horizontal ? '水平' : '' }}
                {{ cropData.flip.vertical ? '垂直' : '' }}
                {{ !cropData.flip.horizontal && !cropData.flip.vertical ? '无' : '' }}
              </span>
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
                :download="`hook-cropped-image.${exportResult.format}`"
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
import { ref, computed, onMounted } from 'vue'
import { useSimpleCropper } from '../utils/SimpleCropper.js'

// 文件相关
const fileInput = ref(null)
const selectedFile = ref(null)
const exportResult = ref(null)
const activeCodeTab = ref('basic')

// 使用 useSimpleCropper Hook
const {
  cropperRef,
  cropper,
  isReady,
  cropData,
  initCropper,
  setImageSource,
  exportImage: hookExportImage
} = useSimpleCropper({
  theme: 'light',
  aspectRatio: 'free',
  showGrid: true,
  responsive: true
})

// 兼容性别名
const containerRef = cropperRef
const cropperInstance = cropper
const loading = ref(false)
const error = ref(null)
const imageMetadata = ref(null)

// 兼容性方法
const initialize = initCropper
const getCropData = () => cropData.value
const setCropArea = () => {}
const setAspectRatio = () => {}
const rotate = () => {}
const scale = () => {}
const flip = () => {}
const reset = () => {}
const destroy = () => {}
const updateConfig = () => {}

// 初始化
onMounted(() => {
  initCropper()
})

// 代码示例
const codeTabs = [
  { name: 'basic', label: '基础用法' },
  { name: 'advanced', label: '高级用法' },
  { name: 'options', label: '配置选项' }
]

const codeExamples = {
  basic: `// 基础用法示例
&lt;template&gt;
  &lt;div ref="containerRef" class="cropper-container"&gt;&lt;/div&gt;
  &lt;div v-if="loading"&gt;加载中...&lt;/div&gt;
  &lt;div v-if="error"&gt;错误: {{ error }}&lt;/div&gt;
  &lt;div v-if="isReady"&gt;
    &lt;button @click="exportImage"&gt;导出&lt;/button&gt;
    &lt;button @click="rotate(90)"&gt;旋转&lt;/button&gt;
  &lt;/div&gt;
&lt;/template&gt;

import { useCropper } from '@ldesign/cropper'

const {
  containerRef,
  cropData,
  loading,
  error,
  isReady,
  setImageSource,
  exportImage,
  rotate,
  scale,
  flip,
  reset
} = useCropper({
  aspectRatio: 16/9,
  onCropChange: (data) => {
    console.log('裁剪变化:', data)
  }
})

// 设置图片
await setImageSource('/path/to/image.jpg')`,

  advanced: `// 高级用法示例
import { useCropper } from '@ldesign/cropper'

const {
  containerRef,
  cropperInstance,
  cropData,
  imageMetadata,
  loading,
  error,
  isReady,
  setImageSource,
  setCropArea,
  setAspectRatio,
  exportImage,
  updateConfig
} = useCropper({
  config: {
    theme: 'dark',
    showGrid: true,
    toolbar: {
      show: true,
      position: 'top'
    }
  },
  onReady: (data) => {
    console.log('就绪:', data)
  },
  onCropChange: (data) => {
    console.log('裁剪数据:', data.cropData)
  },
  onImageLoad: (data) => {
    console.log('图片元数据:', data.imageMetadata)
  }
})

// 高级操作
const customCrop = () => {
  setCropArea({
    x: 100,
    y: 100,
    width: 300,
    height: 200
  })
}

const changeTheme = () => {
  updateConfig({ theme: 'dark' })
}

// 导出多种格式
const exportMultiple = async () => {
  const png = await exportImage({ format: 'png' })
  const jpeg = await exportImage({ format: 'jpeg', quality: 0.8 })
  const webp = await exportImage({ format: 'webp', quality: 0.9 })
}`,

  options: `// useCropper 配置选项
interface UseCropperOptions {
  // 初始配置
  config?: Partial&lt;CropperConfig&gt;

  // 初始图像源
  src?: ImageSource

  // 初始裁剪数据
  initialCropData?: Partial&lt;CropData&gt;

  // 宽高比
  aspectRatio?: AspectRatio

  // 是否自动初始化
  autoInit?: boolean

  // 事件回调
  onReady?: (data: CropperEventData) =&gt; void
  onCropStart?: (data: CropperEventData) =&gt; void
  onCropMove?: (data: CropperEventData) =&gt; void
  onCropEnd?: (data: CropperEventData) =&gt; void
  onCropChange?: (data: CropperEventData) =&gt; void
  onImageLoad?: (data: CropperEventData) =&gt; void
  onImageError?: (data: CropperEventData) =&gt; void
  onError?: (error: Error) =&gt; void
}

// 返回值
interface UseCropperReturn {
  // 响应式状态
  containerRef: Ref&lt;HTMLElement | undefined&gt;
  cropperInstance: Ref&lt;Cropper | null&gt;
  cropData: Ref&lt;CropData | null&gt;
  imageMetadata: Ref&lt;ImageMetadata | null&gt;
  loading: Ref&lt;boolean&gt;
  error: Ref&lt;string | null&gt;
  isReady: Ref&lt;boolean&gt;

  // 方法
  initialize: (container?: HTMLElement) =&gt; Promise&lt;void&gt;
  setImageSource: (src: ImageSource) =&gt; Promise&lt;void&gt;
  getCropData: () =&gt; CropData | null
  setCropArea: (area: Rect) =&gt; void
  setAspectRatio: (ratio: AspectRatio) =&gt; void
  rotate: (angle: number) =&gt; void
  scale: (factor: number) =&gt; void
  flip: (horizontal?: boolean, vertical?: boolean) =&gt; void
  reset: () =&gt; void
  exportImage: (options?: ExportOptions) =&gt; Promise&lt;ExportResult&gt;
  destroy: () =&gt; void
  updateConfig: (config: Partial&lt;CropperConfig&gt;) =&gt; void
}`
}

const currentCodeExample = computed(() => {
  return codeExamples[activeCodeTab.value]
})

// 方法
const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file
  
  try {
    await setImageSource(file)
  } catch (err) {
    console.error('设置图片失败:', err)
  }
}

const exportImage = async () => {
  try {
    const result = await hookExportImage({
      format: 'png',
      quality: 0.9
    })
    exportResult.value = result
  } catch (err) {
    console.error('导出失败:', err)
  }
}
</script>

<style scoped>
.vue-hook-demo {
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

.status-panel {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item label {
  font-weight: 500;
  color: #666;
}

.status-item span {
  font-family: monospace;
  font-size: 14px;
}

.status-item .loading {
  color: #007bff;
  animation: pulse 1.5s infinite;
}

.status-item .error {
  color: #dc3545;
}

.status-item .ready {
  color: #28a745;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.cropper-container {
  width: 100%;
  height: 400px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
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

.controls {
  margin-bottom: 20px;
}

.control-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-section h3 {
  margin: 0 0 12px;
  color: #333;
  font-size: 16px;
}

.control-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.control-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.control-btn.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.control-btn.primary:hover {
  background: #5a67d8;
}

.crop-data-panel {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.crop-data-panel h3 {
  margin: 0 0 12px;
  color: #333;
}

.data-grid {
  display: grid;
  gap: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.data-item label {
  font-weight: 500;
  color: #666;
}

.data-item span {
  font-family: monospace;
  font-size: 13px;
  color: #333;
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
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .control-group {
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
