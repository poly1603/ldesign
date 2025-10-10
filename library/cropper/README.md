# @ldesign/cropper

A powerful, flexible image cropper library inspired by [cropperjs](https://github.com/fengyuanchen/cropperjs), that works with any framework (Vue, React, Angular, or Vanilla JS).

## Features

- 🖼️ **Universal Support**: Works on PC, tablets, and mobile devices
- 🎯 **Touch & Mouse**: Full support for mouse, touch, and gesture interactions
- 🎨 **Rich Configuration**: Highly customizable with extensive options
- 🔧 **Framework Agnostic**: Use with Vue, React, Angular, or vanilla JavaScript
- 📦 **Lightweight**: Tree-shakeable with minimal dependencies
- 🚀 **High Performance**: Optimized for smooth interactions
- 🎭 **Extensible**: Plugin system for custom features
- 📱 **Responsive**: Adapts to different screen sizes
- ♿ **Accessible**: ARIA-compliant for screen readers
- 🌍 **TypeScript**: Full TypeScript support

## Core Features

- ✅ **Image Cropping**: Crop images with adjustable crop box
- ✅ **Aspect Ratio**: Lock aspect ratio or free-form cropping
- ✅ **Rotate & Flip**: Rotate and flip images before cropping
- ✅ **Zoom**: Zoom in/out with mouse wheel or pinch gestures
- ✅ **Move**: Move the image within the crop area
- ✅ **Resize**: Resize crop box by dragging corners and edges
- ✅ **Modal Overlay**: Dark overlay outside crop area
- ✅ **Grid Lines**: Visual guides for better composition
- ✅ **Center Indicator**: Shows center of crop box
- ✅ **Multiple View Modes**: Control how crop box is constrained
- ✅ **Export**: Get cropped image as canvas, blob, or data URL

## Installation

```bash
npm install @ldesign/cropper
# or
yarn add @ldesign/cropper
# or
pnpm add @ldesign/cropper
```

## Quick Start

### Vanilla JavaScript

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9,
  viewMode: 1
})

// Get cropped image
const croppedCanvas = cropper.getCroppedCanvas()
```

### Vue 3

```vue
<template>
  <Cropper
    :src="imageSrc"
    :aspect-ratio="16 / 9"
    @ready="onReady"
    @crop="onCrop"
  />
</template>

<script setup lang="ts">
import { Cropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')

const onReady = (cropper) => {
  console.log('Cropper is ready', cropper)
}

const onCrop = (event) => {
  console.log('Crop data:', event.detail)
}
</script>
```

### React

```jsx
import { Cropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const cropperRef = useRef(null)

  const handleReady = (cropper) => {
    console.log('Cropper is ready', cropper)
  }

  return (
    <Cropper
      ref={cropperRef}
      src="path/to/image.jpg"
      aspectRatio={16 / 9}
      onReady={handleReady}
    />
  )
}
```

## API

### Constructor

```javascript
new Cropper(element, options)
```

### Methods

- `replace(src: string)`: Replace image source
- `getCroppedCanvas(options?)`: Get cropped canvas
- `getData(rounded?)`: Get crop box data
- `getImageData()`: Get image data
- `setData(data)`: Set crop box data
- `rotate(degrees)`: Rotate image
- `scale(scaleX, scaleY?)`: Scale image
- `scaleX(scale)`: Flip horizontal
- `scaleY(scale)`: Flip vertical
- `reset()`: Reset to initial state
- `clear()`: Clear crop box
- `disable()`: Disable cropper
- `enable()`: Enable cropper
- `destroy()`: Destroy cropper instance

### Options

```typescript
{
  // Image source
  src?: string

  // Aspect ratio
  aspectRatio?: number

  // View mode (0-3)
  viewMode?: 0 | 1 | 2 | 3

  // Drag mode
  dragMode?: 'crop' | 'move' | 'none'

  // Auto crop
  autoCrop?: boolean
  autoCropArea?: number

  // Interaction
  movable?: boolean
  rotatable?: boolean
  scalable?: boolean
  zoomable?: boolean
  zoomOnWheel?: boolean
  zoomOnTouch?: boolean
  wheelZoomRatio?: number

  // Crop box
  cropBoxMovable?: boolean
  cropBoxResizable?: boolean
  minCropBoxWidth?: number
  minCropBoxHeight?: number
  maxCropBoxWidth?: number
  maxCropBoxHeight?: number

  // Visual
  modal?: boolean
  guides?: boolean
  center?: boolean
  highlight?: boolean
  background?: boolean

  // Events
  ready?: (event) => void
  cropstart?: (event) => void
  crop?: (event) => void
  cropend?: (event) => void
  zoom?: (event) => void
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run the example:

```bash
npm run dev
```

Then open `docs/index.html` in your browser for a quick test.

## License

MIT
