# Examples

Explore live examples of @ldesign/cropper in action.

## Basic Examples

### Simple Cropper

The most basic usage with default options.

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg'
})
```

[View Demo →](#)

---

### Fixed Aspect Ratio

Crop images with a fixed aspect ratio.

```javascript
const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9
})
```

[View Demo →](#)

---

### Square Crop

Perfect for profile pictures and avatars.

```javascript
const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 1,
  viewMode: 1
})
```

[View Demo →](#)

---

### Free Aspect Ratio

Allow users to crop at any aspect ratio.

```javascript
const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: NaN
})
```

[View Demo →](#)

## Image Transformations

### Rotate Image

Rotate images by 90-degree increments or custom angles.

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg'
})

// Rotate right
document.querySelector('#rotateRight').addEventListener('click', () => {
  cropper.rotate(90)
})

// Rotate left
document.querySelector('#rotateLeft').addEventListener('click', () => {
  cropper.rotate(-90)
})
```

[View Demo →](#)

---

### Flip Image

Flip images horizontally or vertically.

```javascript
// Flip horizontal
document.querySelector('#flipH').addEventListener('click', () => {
  const data = cropper.getData()
  cropper.scaleX(-data.scaleX)
})

// Flip vertical
document.querySelector('#flipV').addEventListener('click', () => {
  const data = cropper.getData()
  cropper.scaleY(-data.scaleY)
})
```

[View Demo →](#)

---

### Zoom Controls

Add custom zoom controls.

```javascript
// Zoom in
document.querySelector('#zoomIn').addEventListener('click', () => {
  cropper.zoom(0.1)
})

// Zoom out
document.querySelector('#zoomOut').addEventListener('click', () => {
  cropper.zoom(-0.1)
})
```

[View Demo →](#)

## Export Options

### Download as PNG

Export the cropped image as PNG.

```javascript
document.querySelector('#download').addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas()

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
})
```

[View Demo →](#)

---

### Download as JPEG

Export with custom quality settings.

```javascript
document.querySelector('#downloadJPEG').addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas()

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'cropped-image.jpg'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/jpeg', 0.9)  // 90% quality
})
```

[View Demo →](#)

---

### Upload to Server

Upload the cropped image to a server.

```javascript
document.querySelector('#upload').addEventListener('click', async () => {
  const canvas = cropper.getCroppedCanvas()

  canvas.toBlob(async (blob) => {
    const formData = new FormData()
    formData.append('image', blob, 'cropped.jpg')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    console.log('Upload successful:', result)
  }, 'image/jpeg', 0.9)
})
```

[View Demo →](#)

## Framework Examples

### Vue 3 Example

```vue
<template>
  <div>
    <VueCropper
      ref="cropperRef"
      :src="imageSrc"
      :aspect-ratio="16 / 9"
      @crop="onCrop"
    />
    <button @click="getCropped">Get Cropped</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'

const cropperRef = ref()
const imageSrc = ref('image.jpg')

const onCrop = (e) => {
  console.log('Crop data:', e.detail)
}

const getCropped = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  console.log('Cropped canvas:', canvas)
}
</script>
```

[View Demo →](#)

---

### React Example

```jsx
import { useRef } from 'react'
import { ReactCropper } from '@ldesign/cropper/react'

function App() {
  const cropperRef = useRef(null)

  const handleCrop = (e) => {
    console.log('Crop data:', e.detail)
  }

  const getCropped = () => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    console.log('Cropped canvas:', canvas)
  }

  return (
    <div>
      <ReactCropper
        ref={cropperRef}
        src="image.jpg"
        aspectRatio={16 / 9}
        onCrop={handleCrop}
      />
      <button onClick={getCropped}>Get Cropped</button>
    </div>
  )
}
```

[View Demo →](#)

## Advanced Examples

### Multiple Croppers

Use multiple cropper instances on the same page.

```javascript
const cropper1 = new Cropper('#container1', {
  src: 'image1.jpg',
  aspectRatio: 16 / 9
})

const cropper2 = new Cropper('#container2', {
  src: 'image2.jpg',
  aspectRatio: 1
})
```

[View Demo →](#)

---

### Custom Crop Shapes

Create custom crop shapes with CSS.

```css
/* Circle crop */
.cropper-crop-box {
  border-radius: 50%;
}

.cropper-view-box {
  border-radius: 50%;
  outline: 0;
}

/* Rounded rectangle */
.cropper-crop-box {
  border-radius: 12px;
}
```

[View Demo →](#)

---

### Before/After Comparison

Show before and after images side by side.

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  crop: (e) => {
    const canvas = cropper.getCroppedCanvas()
    document.querySelector('#preview').src = canvas.toDataURL()
  }
})
```

[View Demo →](#)

---

### Batch Processing

Crop multiple images in sequence.

```javascript
const images = ['image1.jpg', 'image2.jpg', 'image3.jpg']
let currentIndex = 0

const cropper = new Cropper('#container', {
  src: images[0]
})

document.querySelector('#next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length
  cropper.replace(images[currentIndex])
})
```

[View Demo →](#)

## Mobile Examples

### Touch Gestures

Enable pinch-to-zoom and touch interactions.

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  zoomOnTouch: true,
  zoomOnWheel: false,
  viewMode: 1
})
```

[View Demo →](#)

---

### Responsive Layout

Adapt to different screen sizes.

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  responsive: true,
  restore: true,
  viewMode: 1
})
```

[View Demo →](#)

## Integration Examples

### With File Upload

Integrate with file input for image selection.

```javascript
const input = document.querySelector('input[type="file"]')

input.addEventListener('change', (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()

  reader.onload = (event) => {
    cropper.replace(event.target.result)
  }

  reader.readAsDataURL(file)
})
```

[View Demo →](#)

---

### With Drag and Drop

Support drag-and-drop file upload.

```javascript
const dropzone = document.querySelector('#dropzone')

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files[0]

  const reader = new FileReader()
  reader.onload = (event) => {
    cropper.replace(event.target.result)
  }
  reader.readAsDataURL(file)
})

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
})
```

[View Demo →](#)

---

### With Camera Capture

Integrate with device camera.

```html
<input type="file" accept="image/*" capture="camera" id="camera">
```

```javascript
document.querySelector('#camera').addEventListener('change', (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()

  reader.onload = (event) => {
    cropper.replace(event.target.result)
  }

  reader.readAsDataURL(file)
})
```

[View Demo →](#)

## Try It Yourself

Visit our [Interactive Playground](#) to experiment with all features and options.

## Next Steps

- Check out [Advanced Examples](/examples/advanced)
- Learn about [Mobile Examples](/examples/mobile)
- Read the [API Reference](/api/cropper)
