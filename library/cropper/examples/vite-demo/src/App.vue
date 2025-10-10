<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>@ldesign/cropper Demo</h1>
      <p>A powerful, flexible image cropper that works on PC, tablet, and mobile</p>
    </header>

    <div class="demo-content">
      <!-- Image Upload Section -->
      <section class="demo-section">
        <h2>1. Load Image</h2>
        <div class="controls">
          <input type="file" accept="image/*" @change="handleFileChange" />
          <button @click="loadSampleImage">Load Sample Image</button>
        </div>
      </section>

      <!-- Cropper Section -->
      <section class="demo-section">
        <h2>2. Crop Image</h2>
        <div class="cropper-wrapper">
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
            :zoomable="true"
            :zoom-on-touch="true"
            :zoom-on-wheel="true"
            @ready="onReady"
            @crop="onCrop"
          />
          <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">
            Please load an image to start cropping
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <div class="control-group">
            <label>Aspect Ratio:</label>
            <select v-model.number="aspectRatio">
              <option :value="NaN">Free</option>
              <option :value="1">1:1 (Square)</option>
              <option :value="16 / 9">16:9</option>
              <option :value="4 / 3">4:3</option>
              <option :value="3 / 2">3:2</option>
            </select>
          </div>

          <div class="control-group">
            <label>View Mode:</label>
            <select v-model.number="viewMode">
              <option :value="0">0 - No restrictions</option>
              <option :value="1">1 - Restrict crop box</option>
              <option :value="2">2 - Fill container</option>
              <option :value="3">3 - Fill and strict</option>
            </select>
          </div>

          <div class="control-group">
            <label>Drag Mode:</label>
            <select v-model="dragMode">
              <option value="crop">Crop</option>
              <option value="move">Move</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Transform Controls -->
      <section class="demo-section">
        <h2>3. Transform</h2>
        <div class="controls">
          <button @click="rotate(-90)" :disabled="!imageSrc">Rotate Left</button>
          <button @click="rotate(90)" :disabled="!imageSrc">Rotate Right</button>
          <button @click="flipHorizontal" :disabled="!imageSrc">Flip Horizontal</button>
          <button @click="flipVertical" :disabled="!imageSrc">Flip Vertical</button>
          <button @click="reset" :disabled="!imageSrc">Reset</button>
        </div>
      </section>

      <!-- Export Section -->
      <section class="demo-section">
        <h2>4. Export</h2>
        <div class="controls">
          <button @click="getCroppedImage" :disabled="!imageSrc">Get Cropped Image</button>
          <button @click="downloadImage" :disabled="!croppedCanvas">Download</button>
        </div>

        <div v-if="croppedCanvas" class="preview-container">
          <div class="preview-box">
            <h3>Preview</h3>
            <div class="preview-content">
              <canvas ref="previewCanvas"></canvas>
            </div>
          </div>
        </div>
      </section>

      <!-- Crop Data Section -->
      <section class="demo-section">
        <h2>5. Crop Data</h2>
        <div class="info-box">
          <pre>{{ JSON.stringify(cropData, null, 2) }}</pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

// Refs
const cropperRef = ref()
const previewCanvas = ref<HTMLCanvasElement>()
const imageSrc = ref('')
const aspectRatio = ref(NaN)
const viewMode = ref<0 | 1 | 2 | 3>(0)
const dragMode = ref<'crop' | 'move' | 'none'>('crop')
const cropData = ref<any>({})
const croppedCanvas = ref<HTMLCanvasElement | null>(null)

// Sample image URL (you can replace with your own)
const sampleImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'

// Handle file change
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageSrc.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Load sample image
const loadSampleImage = () => {
  imageSrc.value = sampleImageUrl
}

// Cropper events
const onReady = () => {
  console.log('Cropper is ready')
}

const onCrop = (e: CustomEvent) => {
  cropData.value = e.detail
}

// Transform methods
const rotate = (degrees: number) => {
  cropperRef.value?.rotate(degrees)
}

const flipHorizontal = () => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    const imageData = cropper.getImageData()
    cropperRef.value?.scaleX(-imageData.scaleX)
  }
}

const flipVertical = () => {
  const cropper = cropperRef.value?.getCropper()
  if (cropper) {
    const imageData = cropper.getImageData()
    cropperRef.value?.scaleY(-imageData.scaleY)
  }
}

const reset = () => {
  cropperRef.value?.reset()
}

// Export methods
const getCroppedImage = () => {
  const canvas = cropperRef.value?.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingQuality: 'high'
  })

  if (canvas && previewCanvas.value) {
    croppedCanvas.value = canvas
    const ctx = previewCanvas.value.getContext('2d')
    if (ctx) {
      previewCanvas.value.width = canvas.width
      previewCanvas.value.height = canvas.height
      ctx.drawImage(canvas, 0, 0)
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
</script>
