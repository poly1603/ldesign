<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>@ldesign/cropper Demo</h1>
      <p>A powerful, flexible image cropper with advanced transformation features</p>
    </header>

    <div class="demo-content">
      <!-- Image Upload Section -->
      <section class="demo-section">
        <h2>1. Load Image</h2>
        <div class="controls">
          <input 
            type="file" 
            ref="fileInput"
            accept="image/*" 
            @change="handleFileChange" 
            style="display: none;"
          />
          <input 
            type="text" 
            v-model="placeholderText" 
            placeholder="自定义占位符文字"
            style="margin-right: 10px; padding: 5px;"
          />
          <button @click="updatePlaceholder">更新占位符</button>
          <button @click="loadSampleImage" style="margin-left: 10px;">Load Sample Image</button>
        </div>
      </section>

      <!-- Main Cropper Section -->
      <section class="demo-section">
        <h2>2. Crop & Transform Image</h2>

        <div class="cropper-layout">
          <!-- Main Cropper -->
          <div class="cropper-main">
            <div class="cropper-wrapper" 
                 @click="handlePlaceholderClick"
                 @dragover="handleDragOver"
                 @dragleave="handleDragLeave"
                 @drop="handleDrop"
                 :class="{ 'dragging': isDragging }">
              <VueCropper
                v-if="imageSrc"
                ref="cropperRef"
                :src="imageSrc"
                :aspect-ratio="aspectRatio"
                :view-mode="viewMode"
                :drag-mode="dragMode"
                :auto-crop="true"
                :auto-crop-area="0.8"
                :movable="true"
                :rotatable="true"
                :scalable="true"
                :skewable="true"
                :translatable="true"
                :zoomable="true"
                :zoom-on-touch="true"
                :zoom-on-wheel="true"
                :scale-step="scaleStep"
                :theme-color="themeColor"
                :crop-box-style="cropBoxStyle"
                @ready="onReady"
                @crop="onCrop"
              />
              <div v-else class="placeholder" style="pointer-events: none;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">{{ placeholderText }}</div>
                <div style="font-size: 14px; opacity: 0.7;">支持点击选择或拖拽图片到此处</div>
              </div>
            </div>

            <!-- Toolbar -->
            <div v-if="imageSrc" class="toolbar-container">
              <CropperToolbar
                :disabled="!imageSrc"
                :show-advanced="showAdvanced"
                @rotate="handleRotate"
                @flip="handleFlip"
                @zoom="handleZoom"
                @move="handleMove"
                @skew="handleSkew"
                @reset="reset"
                @crop="getCroppedImage"
              />
            </div>

            <!-- Configuration Panel -->
            <div class="config-panel">
              <h3>Configuration</h3>

              <div class="control-row">
                <label>Aspect Ratio:</label>
                <select v-model.number="aspectRatio">
                  <option :value="NaN">Free</option>
                  <option :value="1">1:1 (Square)</option>
                  <option :value="16 / 9">16:9</option>
                  <option :value="4 / 3">4:3</option>
                  <option :value="3 / 2">3:2</option>
                  <option :value="2 / 3">2:3</option>
                </select>
              </div>

              <div class="control-row">
                <label>View Mode:</label>
                <select v-model.number="viewMode">
                  <option :value="0">0 - No restrictions</option>
                  <option :value="1">1 - Restrict crop box</option>
                  <option :value="2">2 - Fill container</option>
                  <option :value="3">3 - Fill and strict</option>
                </select>
              </div>

              <div class="control-row">
                <label>Drag Mode:</label>
                <select v-model="dragMode">
                  <option value="crop">Crop</option>
                  <option value="move">Move</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div class="control-row">
                <label>Crop Box Style:</label>
                <select v-model="cropBoxStyle" @change="handleStyleChange">
                  <option value="default">Default</option>
                  <option value="rounded">Rounded</option>
                  <option value="circle">Circle</option>
                  <option value="minimal">Minimal</option>
                  <option value="dotted">Dotted</option>
                  <option value="solid">Solid</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>

              <div class="control-row">
                <label>Theme Color:</label>
                <input type="color" v-model="themeColor" />
                <input type="text" v-model="themeColor" class="color-input" />
              </div>

              <div class="control-row">
                <label>Scale Step:</label>
                <input type="number" v-model.number="scaleStep" step="0.01" min="0.01" max="1" />
              </div>

              <div class="control-row">
                <label>
                  <input type="checkbox" v-model="showAdvanced" />
                  Show Advanced Controls (Skew)
                </label>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="cropper-sidebar">
            <!-- Preview -->
            <div class="preview-section">
              <h3>Preview</h3>
              <div v-if="croppedCanvas" class="preview-container">
                <div class="cropper-preview" :style="{ width: '200px', height: '200px' }">
                  <canvas ref="previewCanvas"></canvas>
                </div>
                <button @click="downloadImage" class="download-btn">
                  Download
                </button>
              </div>
              <div v-else class="placeholder-small">
                No preview yet
              </div>
            </div>

            <!-- Image Data -->
            <div class="data-section">
              <h3>Image Data</h3>
              <div class="cropper-info">
                <div class="cropper-info-item">
                  <span class="cropper-info-label">X:</span>
                  <span class="cropper-info-value">{{ cropData.x?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">Y:</span>
                  <span class="cropper-info-value">{{ cropData.y?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">Width:</span>
                  <span class="cropper-info-value">{{ cropData.width?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">Height:</span>
                  <span class="cropper-info-value">{{ cropData.height?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">Rotate:</span>
                  <span class="cropper-info-value">{{ cropData.rotate?.toFixed(2) || '0.00' }}°</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">ScaleX:</span>
                  <span class="cropper-info-value">{{ cropData.scaleX?.toFixed(2) || '1.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">ScaleY:</span>
                  <span class="cropper-info-value">{{ cropData.scaleY?.toFixed(2) || '1.00' }}</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">SkewX:</span>
                  <span class="cropper-info-value">{{ cropData.skewX?.toFixed(2) || '0.00' }}°</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">SkewY:</span>
                  <span class="cropper-info-value">{{ cropData.skewY?.toFixed(2) || '0.00' }}°</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">TranslateX:</span>
                  <span class="cropper-info-value">{{ cropData.translateX?.toFixed(2) || '0.00' }}px</span>
                </div>
                <div class="cropper-info-item">
                  <span class="cropper-info-label">TranslateY:</span>
                  <span class="cropper-info-value">{{ cropData.translateY?.toFixed(2) || '0.00' }}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import CropperToolbar from '../../../src/components/CropperToolbar.vue'
import '@ldesign/cropper/style.css'

// Refs
const cropperRef = ref()
const previewCanvas = ref<HTMLCanvasElement>()
const fileInput = ref<HTMLInputElement>()
const imageSrc = ref('')
const aspectRatio = ref(NaN)
const viewMode = ref<0 | 1 | 2 | 3>(0)
const dragMode = ref<'crop' | 'move' | 'none'>('crop')
const cropData = ref<any>({})
const croppedCanvas = ref<HTMLCanvasElement | null>(null)
const themeColor = ref('#39f')
const scaleStep = ref(0.1)
const showAdvanced = ref(false)
const isDragging = ref(false)
const placeholderText = ref('点击或拖拽图片到这里')
const cropBoxStyle = ref<'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient'>('default')

// Sample image URL
const sampleImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'

// Handle file change
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    loadFile(file)
  }
}

// Load file
const loadFile = (file: File) => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('图片大小不能超过10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    imageSrc.value = event.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Handle placeholder click
const handlePlaceholderClick = () => {
  if (!imageSrc.value && fileInput.value) {
    fileInput.value.click()
  }
}

// Handle drag over
const handleDragOver = (e: DragEvent) => {
  if (!imageSrc.value) {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }
}

// Handle drag leave
const handleDragLeave = (e: DragEvent) => {
  if (!imageSrc.value) {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false
  }
}

// Handle drop
const handleDrop = (e: DragEvent) => {
  if (!imageSrc.value) {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (files && files[0]) {
      loadFile(files[0])
    }
  }
}

// Update placeholder
const updatePlaceholder = () => {
  // Force re-render by toggling imageSrc
  if (!imageSrc.value) {
    // Just update the reactive value
    placeholderText.value = placeholderText.value || '点击或拖拽图片到这里'
  }
}

// Load sample image
const loadSampleImage = () => {
  imageSrc.value = sampleImageUrl
}

// Cropper events
const onReady = () => {
  // Cropper is ready
}

const onCrop = (e: CustomEvent) => {
  cropData.value = e.detail
}

// Toolbar handlers
const handleRotate = (degrees: number) => {
  cropperRef.value?.rotate(degrees)
}

const handleFlip = (direction: 'horizontal' | 'vertical') => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    const imageData = cropper.getImageData()
    if (direction === 'horizontal') {
      cropperRef.value?.scaleX(-imageData.scaleX)
    } else {
      cropperRef.value?.scaleY(-imageData.scaleY)
    }
  }
}

const handleZoom = (direction: 'in' | 'out') => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    const imageData = cropper.getImageData()
    const step = scaleStep.value
    if (direction === 'in') {
      cropperRef.value?.scale(imageData.scaleX + step, imageData.scaleY + step)
    } else {
      cropperRef.value?.scale(imageData.scaleX - step, imageData.scaleY - step)
    }
  }
}

const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
  const step = 10
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    switch (direction) {
      case 'left':
        cropper.move(-step, 0)
        break
      case 'right':
        cropper.move(step, 0)
        break
      case 'up':
        cropper.move(0, -step)
        break
      case 'down':
        cropper.move(0, step)
        break
    }
  }
}

const handleSkew = (axis: 'x' | 'y', value: number) => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    const imageData = cropper.getImageData()
    if (axis === 'x') {
      cropper.skew(imageData.skewX + value, imageData.skewY)
    } else {
      cropper.skew(imageData.skewX, imageData.skewY + value)
    }
  }
}

const reset = () => {
  cropperRef.value?.reset()
}

// Handle style change
const handleStyleChange = () => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    cropper.setCropBoxStyle(cropBoxStyle.value)
  }
}

// Export methods
const getCroppedImage = async () => {
  const canvas = cropperRef.value?.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingQuality: 'high'
  })
  
  if (canvas) {
    // Set the canvas first, which will trigger the v-if to render the preview container
    croppedCanvas.value = canvas
    
    // Wait for the DOM to update so that previewCanvas ref is available
    await nextTick()
    
    if (previewCanvas.value) {
      const ctx = previewCanvas.value.getContext('2d')
      if (ctx) {
        previewCanvas.value.width = canvas.width
        previewCanvas.value.height = canvas.height
        ctx.drawImage(canvas, 0, 0)
      }
    }
  }
}

const downloadImage = () => {
  if (croppedCanvas.value) {
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedCanvas.value.toDataURL()
    link.click()
  }
}

// Watch theme color and apply to CSS variable
watch(themeColor, (newColor) => {
  document.documentElement.style.setProperty('--cropper-theme-color', newColor)
})
</script>

<style scoped>
.demo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.demo-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.demo-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.demo-content {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.controls input[type="file"] {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
}

.controls button {
  padding: 8px 16px;
  background: #39f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.controls button:hover {
  background: #2288ff;
  transform: translateY(-1px);
}

.cropper-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

@media (max-width: 1024px) {
  .cropper-layout {
    grid-template-columns: 1fr;
  }
}

.cropper-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cropper-wrapper {
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px dashed transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cropper-wrapper:hover:has(.placeholder) {
  background: #f0f0f0;
  border-color: #39f;
}

.cropper-wrapper.dragging {
  background: #e8f4ff;
  border-color: #39f;
  border-style: solid;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 1.1rem;
  user-select: none;
}

.toolbar-container {
  width: 100%;
}

.config-panel {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.config-panel h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #333;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.control-row label {
  flex: 0 0 120px;
  font-size: 14px;
  color: #666;
}

.control-row select,
.control-row input[type="number"] {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.control-row input[type="color"] {
  width: 50px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}

.cropper-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-section,
.data-section {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.preview-section h3,
.data-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #333;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-container canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.download-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.download-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.placeholder-small {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 0.9rem;
  background: white;
  border-radius: 4px;
}
</style>
