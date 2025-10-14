<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🌟 Vue 3 Cropper Example</h1>
      <p>Component, Composable, and Directive usage demonstration</p>
    </header>

    <div class="demo-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="demo-wrapper">
      <div class="demo-content">
        <!-- Component Demo -->
        <div v-show="activeTab === 'Component'" class="demo-section">
          <h2>📦 Component Usage</h2>
          
          <div class="controls">
            <input 
              type="file" 
              @change="handleFileChange" 
              accept="image/*"
              ref="fileInput"
              style="display: none;"
            />
            <button @click="$refs.fileInput.click()">📁 Choose Image</button>
            <button @click="loadSampleImage">🖼️ Sample Image</button>
            <button @click="rotateImage" :disabled="!imageSrc">🔄 Rotate</button>
            <button @click="resetImage" :disabled="!imageSrc">↩️ Reset</button>
            <button @click="getCroppedImage" :disabled="!imageSrc">✂️ Crop</button>
          </div>

          <div class="cropper-container">
            <VueCropper
              v-if="imageSrc"
              ref="cropperRef"
              :src="imageSrc"
              :aspect-ratio="aspectRatio"
              :view-mode="viewMode"
              :toolbar="true"
              :crop-box-style="cropBoxStyle"
              @ready="onReady"
              @crop="onCrop"
            />
            <div v-else class="placeholder">
              <div class="placeholder-icon">🖼️</div>
              <p>Please select or load an image</p>
            </div>
          </div>

          <div v-if="cropData.x !== undefined" class="info-panel">
            <h3>Crop Data</h3>
            <pre>{{ JSON.stringify(cropData, null, 2) }}</pre>
          </div>

          <div v-if="croppedImageUrl" class="preview-panel">
            <h3>Cropped Result</h3>
            <img :src="croppedImageUrl" alt="Cropped" />
            <button @click="downloadCropped" class="download-btn">⬇️ Download</button>
          </div>
        </div>

        <!-- Composable Demo -->
        <div v-show="activeTab === 'Composable'" class="demo-section">
          <h2>🎣 Composable (Hook) Usage</h2>
          
          <div class="controls">
            <button @click="composableRotate" :disabled="!composableReady">🔄 Rotate</button>
            <button @click="composableReset" :disabled="!composableReady">↩️ Reset</button>
            <button @click="composableGetCropped" :disabled="!composableReady">✂️ Get Cropped</button>
            <button @click="composableChangeStyle" :disabled="!composableReady">🎨 Change Style</button>
          </div>

          <div class="cropper-container" ref="composableContainer"></div>

          <div v-if="composableCropData.x !== undefined" class="info-panel">
            <h3>Composable State</h3>
            <div class="state-info">
              <span :class="['status', { ready: composableReady }]">
                {{ composableReady ? '✅ Ready' : '⏳ Loading' }}
              </span>
            </div>
            <pre>{{ JSON.stringify(composableCropData, null, 2) }}</pre>
          </div>
        </div>

        <!-- Directive Demo -->
        <div v-show="activeTab === 'Directive'" class="demo-section">
          <h2>🎯 Directive Usage</h2>
          
          <div class="controls">
            <button @click="directiveAction('rotate')">🔄 Rotate</button>
            <button @click="directiveAction('reset')">↩️ Reset</button>
            <button @click="directiveAction('crop')">✂️ Get Cropped</button>
          </div>

          <div 
            v-cropper="directiveOptions"
            ref="directiveElement"
            class="cropper-container"
            @cropper:ready="onDirectiveReady"
            @cropper:crop="onDirectiveCrop"
          ></div>

          <div v-if="directiveCropData.x !== undefined" class="info-panel">
            <h3>Directive Events</h3>
            <pre>{{ JSON.stringify(directiveCropData, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Configuration Panel -->
      <div class="config-panel">
        <h3>⚙️ Configuration</h3>
        
        <div class="config-row">
          <label>Aspect Ratio:</label>
          <select v-model.number="aspectRatio">
            <option :value="NaN">Free</option>
            <option :value="1">1:1 (Square)</option>
            <option :value="16/9">16:9 (Wide)</option>
            <option :value="4/3">4:3 (Standard)</option>
            <option :value="9/16">9:16 (Portrait)</option>
          </select>
        </div>

        <div class="config-row">
          <label>View Mode:</label>
          <select v-model.number="viewMode">
            <option :value="0">No restrictions</option>
            <option :value="1">Restrict crop box</option>
            <option :value="2">Fit container</option>
            <option :value="3">Fit and fill</option>
          </select>
        </div>

        <div class="config-row">
          <label>Crop Box Style:</label>
          <select v-model="cropBoxStyle">
            <option value="default">Default</option>
            <option value="rounded">Rounded</option>
            <option value="circle">Circle</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  VueCropper, 
  useCropper, 
  vCropper,
  getCropperInstance 
} from '../../../src/adapters/vue'
import '../../../src/styles/cropper.css'

// Tabs
const tabs = ['Component', 'Composable', 'Directive']
const activeTab = ref('Component')

// Shared config
const aspectRatio = ref(NaN)
const viewMode = ref<0 | 1 | 2 | 3>(0)
const cropBoxStyle = ref<'default' | 'rounded' | 'circle' | 'minimal'>('default')

// Sample image
const sampleImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200'

// Component Demo
const cropperRef = ref()
const fileInput = ref()
const imageSrc = ref('')
const cropData = ref<any>({})
const croppedImageUrl = ref('')

const onReady = () => {
  console.log('Component: Cropper ready')
}

const onCrop = (event: CustomEvent) => {
  cropData.value = event.detail
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageSrc.value = event.target?.result as string
      croppedImageUrl.value = '' // Clear previous crop
    }
    reader.readAsDataURL(file)
  }
}

const loadSampleImage = () => {
  imageSrc.value = sampleImageUrl
  croppedImageUrl.value = ''
}

const rotateImage = () => {
  cropperRef.value?.getCropper()?.rotate(90)
}

const resetImage = () => {
  cropperRef.value?.getCropper()?.reset()
}

const getCroppedImage = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  if (canvas) {
    croppedImageUrl.value = canvas.toDataURL()
  }
}

const downloadCropped = () => {
  if (croppedImageUrl.value) {
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImageUrl.value
    link.click()
  }
}

// Composable Demo
const composableContainer = ref<HTMLElement>()
const composableCropData = ref<any>({})
const composableReady = ref(false)

const {
  isReady,
  cropData: hookCropData,
  rotate,
  reset,
  getCroppedCanvas,
  setCropBoxStyle
} = useCropper(composableContainer, {
  src: sampleImageUrl,
  aspectRatio: aspectRatio.value,
  viewMode: viewMode.value,
  toolbar: true,
  onReady: () => {
    console.log('Composable: Cropper ready')
    composableReady.value = true
  },
  onCrop: (data) => {
    composableCropData.value = data
  }
})

watch([aspectRatio, viewMode], () => {
  if (isReady.value) {
    reset()
  }
})

const composableRotate = () => rotate(90)
const composableReset = () => reset()
const composableGetCropped = () => {
  const canvas = getCroppedCanvas()
  if (canvas) {
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Got cropped blob:', blob)
        // Could upload or process the blob here
        const url = URL.createObjectURL(blob)
        window.open(url)
      }
    })
  }
}
const composableChangeStyle = () => {
  const styles = ['default', 'rounded', 'circle', 'minimal'] as const
  const currentIndex = styles.indexOf(cropBoxStyle.value)
  const nextStyle = styles[(currentIndex + 1) % styles.length]
  cropBoxStyle.value = nextStyle
  setCropBoxStyle(nextStyle)
}

// Directive Demo
const directiveElement = ref<HTMLElement>()
const directiveCropData = ref<any>({})
const directiveCropper = ref<any>()

const directiveOptions = computed(() => ({
  src: sampleImageUrl,
  aspectRatio: aspectRatio.value,
  viewMode: viewMode.value,
  toolbar: true,
  cropBoxStyle: cropBoxStyle.value,
  onReady: (cropper: any) => {
    directiveCropper.value = cropper
    console.log('Directive: Cropper ready')
  },
  onCrop: (data: any) => {
    directiveCropData.value = data
  }
}))

const onDirectiveReady = (event: CustomEvent) => {
  console.log('Directive ready event:', event.detail)
}

const onDirectiveCrop = (event: CustomEvent) => {
  directiveCropData.value = event.detail
}

const directiveAction = (action: string) => {
  if (!directiveElement.value) return
  
  const cropper = getCropperInstance(directiveElement.value)
  if (!cropper) return

  switch(action) {
    case 'rotate':
      cropper.rotate(90)
      break
    case 'reset':
      cropper.reset()
      break
    case 'crop':
      const canvas = cropper.getCroppedCanvas()
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            window.open(url)
          }
        })
      }
      break
  }
}
</script>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #42b983;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.app-header p {
  color: #666;
  font-size: 1.1em;
}

.demo-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 0;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-btn:hover {
  color: #42b983;
}

.tab-btn.active {
  color: #42b983;
  border-bottom: 3px solid #42b983;
  margin-bottom: -2px;
}

.demo-wrapper {
  display: flex;
  gap: 20px;
}

.demo-content {
  flex: 1;
}

.demo-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 18px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.controls button:hover:not(:disabled) {
  background: #369b73;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.cropper-container {
  width: 100%;
  height: 500px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f9f9f9;
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
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder p {
  font-size: 18px;
  margin: 0;
}

.info-panel, .preview-panel {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-panel h3, .preview-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.info-panel pre {
  background: white;
  padding: 15px;
  border-radius: 6px;
  overflow: auto;
  max-height: 250px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
}

.state-info {
  margin-bottom: 15px;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status.ready {
  background: #e8f5e9;
  color: #2e7d32;
}

.preview-panel img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 6px;
  display: block;
  margin-bottom: 15px;
}

.download-btn {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.download-btn:hover {
  background: #369b73;
}

.config-panel {
  width: 320px;
  padding: 25px;
  background: #f9f9f9;
  border-radius: 8px;
  height: fit-content;
  border: 1px solid #e0e0e0;
}

.config-panel h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.config-row {
  margin-bottom: 20px;
}

.config-row label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.config-row select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.config-row select:focus {
  outline: none;
  border-color: #42b983;
}
</style>