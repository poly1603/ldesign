<template>
  <div class="native-js-demo">
    <div class="demo-header">
      <h1>原生 JavaScript 使用方式</h1>
      <p>直接使用 Cropper 类，适合任何前端项目</p>
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

        <!-- 裁剪器容器 -->
        <div ref="cropperContainer" class="cropper-container">
          <div v-if="!cropperInstance" class="placeholder">
            <div class="placeholder-icon">🖼️</div>
            <p>请选择一张图片开始裁剪</p>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="controls" v-if="cropperInstance">
          <div class="control-group">
            <label>宽高比:</label>
            <select @change="setAspectRatio" v-model="currentAspectRatio">
              <option value="free">自由</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
              <option value="3:2">3:2</option>
            </select>
          </div>

          <div class="control-group">
            <button @click="rotate(-90)" class="control-btn">↺ 左转</button>
            <button @click="rotate(90)" class="control-btn">↻ 右转</button>
            <button @click="flip(true, false)" class="control-btn">⟷ 水平翻转</button>
            <button @click="flip(false, true)" class="control-btn">⟷ 垂直翻转</button>
          </div>

          <div class="control-group">
            <button @click="scale(1.1)" class="control-btn">🔍 放大</button>
            <button @click="scale(0.9)" class="control-btn">🔍 缩小</button>
            <button @click="reset" class="control-btn">🔄 重置</button>
            <button @click="exportImage" class="control-btn primary">💾 导出</button>
          </div>
        </div>

        <!-- 信息面板 -->
        <div class="info-panel" v-if="cropperInstance">
          <h3>裁剪信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>裁剪区域:</label>
              <span>{{ cropInfo.area }}</span>
            </div>
            <div class="info-item">
              <label>图片尺寸:</label>
              <span>{{ cropInfo.imageSize }}</span>
            </div>
            <div class="info-item">
              <label>当前比例:</label>
              <span>{{ cropInfo.aspectRatio }}</span>
            </div>
            <div class="info-item">
              <label>旋转角度:</label>
              <span>{{ cropInfo.rotation }}°</span>
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
                :download="`cropped-image.${exportResult.format}`"
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
        <div class="code-block">
          <pre><code>{{ codeExample }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { SimpleCropper } from '../utils/SimpleCropper.js'

// 响应式数据
const fileInput = ref(null)
const cropperContainer = ref(null)
const selectedFile = ref(null)
const cropperInstance = ref(null)
const currentAspectRatio = ref('free')
const exportResult = ref(null)

const cropInfo = reactive({
  area: '-',
  imageSize: '-',
  aspectRatio: '-',
  rotation: 0
})

// 代码示例
const codeExample = `import { SimpleCropper } from './utils/SimpleCropper.js'

// 创建裁剪器实例
const container = document.getElementById('cropper-container')
const cropper = new SimpleCropper(container, {
  theme: 'light',
  aspectRatio: 'free',
  showGrid: true,
  responsive: true
})

// 设置图片
await cropper.setImageSource(file)

// 监听事件
cropper.on('cropChange', (data) => {
  console.log('裁剪区域变化:', data.cropData)
})

// 导出图片
const result = await cropper.export({
  format: 'png',
  quality: 0.9
})`

// 方法
const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file
  await initializeCropper(file)
}

const initializeCropper = async (file) => {
  try {
    // 销毁现有实例
    if (cropperInstance.value) {
      cropperInstance.value.destroy()
    }

    // 创建新实例
    cropperInstance.value = new SimpleCropper(cropperContainer.value, {
      theme: 'light',
      aspectRatio: 'free',
      showGrid: true,
      responsive: true,
      toolbar: {
        show: true,
        position: 'top',
        tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'reset']
      }
    })

    // 设置事件监听
    cropperInstance.value.on('cropChange', (data) => {
      updateCropInfo(data.cropData)
    })

    cropperInstance.value.on('ready', (data) => {
      console.log('裁剪器就绪:', data)
      // SimpleCropper的ready事件可能没有cropData
      if (data.cropData) {
        updateCropInfo(data.cropData)
      }
      if (data.imageMetadata) {
        cropInfo.imageSize = `${data.imageMetadata.width} × ${data.imageMetadata.height}`
      }
    })

    cropperInstance.value.on('imageLoad', (data) => {
      console.log('图片加载完成:', data)
      if (data.imageData) {
        cropInfo.imageSize = `${data.imageData.width} × ${data.imageData.height}`
      }
    })

    // 加载图片
    await cropperInstance.value.setImageSource(file)
  } catch (error) {
    console.error('初始化裁剪器失败:', error)
    alert('初始化裁剪器失败: ' + error.message)
  }
}

const updateCropInfo = (cropData) => {
  if (!cropData) return

  // 适配SimpleCropper的数据结构
  cropInfo.area = `x:${Math.round(cropData.x || 0)}, y:${Math.round(cropData.y || 0)}, w:${Math.round(cropData.width || 0)}, h:${Math.round(cropData.height || 0)}`
  cropInfo.aspectRatio = cropData.aspectRatio || '-'
  cropInfo.rotation = Math.round(cropData.rotation || 0)
}

const setAspectRatio = () => {
  if (cropperInstance.value) {
    cropperInstance.value.setAspectRatio(currentAspectRatio.value)
  }
}

const rotate = (angle) => {
  if (cropperInstance.value) {
    cropperInstance.value.rotate(angle)
  }
}

const flip = (horizontal, vertical) => {
  if (cropperInstance.value) {
    cropperInstance.value.flip(horizontal, vertical)
  }
}

const scale = (factor) => {
  if (cropperInstance.value) {
    cropperInstance.value.scale(factor)
  }
}

const reset = () => {
  if (cropperInstance.value) {
    cropperInstance.value.reset()
  }
}

const exportImage = async () => {
  if (!cropperInstance.value) return

  try {
    const result = await cropperInstance.value.export({
      format: 'png',
      quality: 0.9
    })
    exportResult.value = result
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败: ' + error.message)
  }
}

// 生命周期
onUnmounted(() => {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
  }
})
</script>

<style scoped>
.native-js-demo {
  max-width: 1000px;
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
  color: #666;
  font-size: 14px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #333;
}

.control-group select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
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

.info-panel {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-panel h3 {
  margin-bottom: 12px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-item label {
  font-weight: 500;
  color: #666;
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
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-info {
  flex: 1;
}

.result-info p {
  margin: 4px 0;
  color: #666;
}

.download-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
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
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .demo-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: space-between;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .result-content {
    flex-direction: column;
  }
}
</style>
