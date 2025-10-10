# Vue 3 Integration

@ldesign/cropper provides first-class support for Vue 3 with a native component.

## Installation

```bash
npm install @ldesign/cropper vue
```

## Basic Usage

```vue
<template>
  <div class="cropper-container">
    <VueCropper
      :src="imageSrc"
      :aspect-ratio="16 / 9"
      @ready="onReady"
      @crop="onCrop"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')

const onReady = () => {
  console.log('Cropper is ready')
}

const onCrop = (event) => {
  console.log('Crop data:', event.detail)
}
</script>

<style scoped>
.cropper-container {
  width: 100%;
  height: 500px;
}
</style>
```

## Component Props

All cropper options are available as props:

```vue
<template>
  <VueCropper
    :src="imageSrc"
    :aspect-ratio="aspectRatio"
    :view-mode="1"
    :drag-mode="'crop'"
    :auto-crop="true"
    :auto-crop-area="0.8"
    :movable="true"
    :rotatable="true"
    :scalable="true"
    :zoomable="true"
    :zoom-on-touch="true"
    :zoom-on-wheel="true"
    :crop-box-movable="true"
    :crop-box-resizable="true"
    :background="true"
    :guides="true"
    :center="true"
    :highlight="true"
    :responsive="true"
  />
</template>
```

## Component Events

Listen to all cropper events:

```vue
<template>
  <VueCropper
    :src="imageSrc"
    @ready="onReady"
    @cropstart="onCropStart"
    @cropmove="onCropMove"
    @cropend="onCropEnd"
    @crop="onCrop"
    @zoom="onZoom"
  />
</template>

<script setup>
const onReady = () => {
  console.log('Cropper ready')
}

const onCropStart = (e) => {
  console.log('Crop started', e.detail)
}

const onCropMove = (e) => {
  console.log('Cropping', e.detail)
}

const onCropEnd = (e) => {
  console.log('Crop ended', e.detail)
}

const onCrop = (e) => {
  console.log('Crop data:', e.detail)
}

const onZoom = (e) => {
  console.log('Zoom:', e.detail.zoom)
}
</script>
```

## Ref Access

Access the cropper instance using template refs:

```vue
<template>
  <VueCropper ref="cropperRef" :src="imageSrc" />

  <div class="controls">
    <button @click="rotateLeft">Rotate Left</button>
    <button @click="rotateRight">Rotate Right</button>
    <button @click="getCropped">Get Cropped</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'

const cropperRef = ref()
const imageSrc = ref('path/to/image.jpg')

const rotateLeft = () => {
  cropperRef.value?.rotate(-90)
}

const rotateRight = () => {
  cropperRef.value?.rotate(90)
}

const getCropped = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  if (canvas) {
    console.log('Cropped canvas:', canvas)
  }
}
</script>
```

## Available Methods

All cropper methods are exposed through the ref:

```javascript
const cropperRef = ref()

// Get cropper instance
const cropper = cropperRef.value?.getCropper()

// Get cropped canvas
const canvas = cropperRef.value?.getCroppedCanvas(options)

// Get/Set data
const data = cropperRef.value?.getData(rounded)
cropperRef.value?.setData(data)

// Transformations
cropperRef.value?.rotate(degrees)
cropperRef.value?.scale(scaleX, scaleY)
cropperRef.value?.scaleX(scaleX)
cropperRef.value?.scaleY(scaleY)

// Control
cropperRef.value?.reset()
cropperRef.value?.clear()
cropperRef.value?.enable()
cropperRef.value?.disable()
cropperRef.value?.destroy()
```

## Complete Example

Here's a complete Vue 3 example with all features:

```vue
<template>
  <div class="app">
    <h1>Vue 3 Cropper Demo</h1>

    <!-- File Upload -->
    <div class="upload-section">
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange"
      />
    </div>

    <!-- Cropper -->
    <div class="cropper-wrapper">
      <VueCropper
        v-if="imageSrc"
        ref="cropperRef"
        :src="imageSrc"
        :aspect-ratio="aspectRatio"
        :view-mode="viewMode"
        @ready="onReady"
        @crop="onCrop"
      />
      <div v-else class="placeholder">
        Please select an image
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Aspect Ratio:</label>
        <select v-model.number="aspectRatio">
          <option :value="NaN">Free</option>
          <option :value="1">1:1</option>
          <option :value="16 / 9">16:9</option>
          <option :value="4 / 3">4:3</option>
        </select>
      </div>

      <div class="control-group">
        <label>View Mode:</label>
        <select v-model.number="viewMode">
          <option :value="0">Mode 0</option>
          <option :value="1">Mode 1</option>
          <option :value="2">Mode 2</option>
          <option :value="3">Mode 3</option>
        </select>
      </div>
    </div>

    <!-- Transform Buttons -->
    <div class="buttons">
      <button @click="rotate(-90)" :disabled="!imageSrc">
        Rotate Left
      </button>
      <button @click="rotate(90)" :disabled="!imageSrc">
        Rotate Right
      </button>
      <button @click="flipHorizontal" :disabled="!imageSrc">
        Flip H
      </button>
      <button @click="flipVertical" :disabled="!imageSrc">
        Flip V
      </button>
      <button @click="reset" :disabled="!imageSrc">
        Reset
      </button>
      <button @click="getCropped" :disabled="!imageSrc">
        Get Cropped
      </button>
      <button @click="download" :disabled="!croppedImage">
        Download
      </button>
    </div>

    <!-- Preview -->
    <div v-if="croppedImage" class="preview">
      <h3>Preview</h3>
      <img :src="croppedImage" alt="Cropped">
    </div>

    <!-- Crop Data -->
    <div v-if="cropData" class="crop-data">
      <h3>Crop Data</h3>
      <pre>{{ JSON.stringify(cropData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const cropperRef = ref()
const imageSrc = ref('')
const aspectRatio = ref(NaN)
const viewMode = ref<0 | 1 | 2 | 3>(0)
const cropData = ref<any>(null)
const croppedImage = ref('')

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageSrc.value = event.target?.result as string
      croppedImage.value = ''
    }
    reader.readAsDataURL(file)
  }
}

const onReady = () => {
  console.log('Cropper is ready')
}

const onCrop = (e: CustomEvent) => {
  cropData.value = e.detail
}

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

const getCropped = () => {
  const canvas = cropperRef.value?.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingQuality: 'high'
  })

  if (canvas) {
    croppedImage.value = canvas.toDataURL('image/png')
  }
}

const download = () => {
  if (croppedImage.value) {
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImage.value
    link.click()
  }
}
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cropper-wrapper {
  width: 100%;
  height: 500px;
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.controls,
.buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.preview img {
  max-width: 400px;
  border: 1px solid #ddd;
}

.crop-data pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

## TypeScript Support

Full TypeScript support with type definitions:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import type { CropData } from '@ldesign/cropper'

const cropperRef = ref<InstanceType<typeof VueCropper>>()
const cropData = ref<CropData | null>(null)

const onCrop = (e: CustomEvent<CropData>) => {
  cropData.value = e.detail
}
</script>
```

## Composition API

Create reusable composables:

```typescript
// composables/useCropper.ts
import { ref, Ref } from 'vue'
import type { CropData } from '@ldesign/cropper'

export function useCropper(imageSrc: Ref<string>) {
  const cropperRef = ref()
  const cropData = ref<CropData | null>(null)
  const croppedImage = ref('')

  const rotate = (degrees: number) => {
    cropperRef.value?.rotate(degrees)
  }

  const getCropped = () => {
    const canvas = cropperRef.value?.getCroppedCanvas()
    if (canvas) {
      croppedImage.value = canvas.toDataURL()
    }
  }

  const reset = () => {
    cropperRef.value?.reset()
    croppedImage.value = ''
  }

  return {
    cropperRef,
    cropData,
    croppedImage,
    rotate,
    getCropped,
    reset
  }
}
```

## Next Steps

- Explore [React Integration](/guide/react)
- Learn about [Configuration](/guide/configuration)
- Check out [API Reference](/api/cropper)
