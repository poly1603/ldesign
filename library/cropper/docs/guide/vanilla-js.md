# Vanilla JavaScript

Use @ldesign/cropper with vanilla JavaScript - no framework required.

## Installation

```bash
npm install @ldesign/cropper
```

## Basic Usage

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9
})
```

## HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Cropper</title>
  <link rel="stylesheet" href="path/to/@ldesign/cropper/style.css">
  <style>
    #container {
      width: 800px;
      height: 600px;
      margin: 20px auto;
    }
  </style>
</head>
<body>
  <div id="container"></div>

  <script type="module">
    import { Cropper } from '@ldesign/cropper'

    const cropper = new Cropper('#container', {
      src: 'image.jpg'
    })
  </script>
</body>
</html>
```

## File Upload

Handle file upload from input:

```javascript
const input = document.querySelector('input[type="file"]')

input.addEventListener('change', (e) => {
  const file = e.target.files[0]

  if (file) {
    const reader = new FileReader()

    reader.onload = (event) => {
      cropper.replace(event.target.result)
    }

    reader.readAsDataURL(file)
  }
})
```

## Controls

Add interactive controls:

```html
<div class="controls">
  <button id="rotateLeft">Rotate Left</button>
  <button id="rotateRight">Rotate Right</button>
  <button id="flipH">Flip Horizontal</button>
  <button id="flipV">Flip Vertical</button>
  <button id="reset">Reset</button>
  <button id="crop">Get Cropped</button>
</div>

<script type="module">
  import { Cropper } from '@ldesign/cropper'

  const cropper = new Cropper('#container', {
    src: 'image.jpg'
  })

  // Rotate left
  document.getElementById('rotateLeft').addEventListener('click', () => {
    cropper.rotate(-90)
  })

  // Rotate right
  document.getElementById('rotateRight').addEventListener('click', () => {
    cropper.rotate(90)
  })

  // Flip horizontal
  document.getElementById('flipH').addEventListener('click', () => {
    const data = cropper.getData()
    cropper.scaleX(-data.scaleX)
  })

  // Flip vertical
  document.getElementById('flipV').addEventListener('click', () => {
    const data = cropper.getData()
    cropper.scaleY(-data.scaleY)
  })

  // Reset
  document.getElementById('reset').addEventListener('click', () => {
    cropper.reset()
  })

  // Get cropped image
  document.getElementById('crop').addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas()

    // Display or download
    document.body.appendChild(canvas)
  })
</script>
```

## Export Options

### Download as File

```javascript
document.getElementById('download').addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas()

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'cropped-image.jpg'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/jpeg', 0.9)
})
```

### Upload to Server

```javascript
document.getElementById('upload').addEventListener('click', async () => {
  const canvas = cropper.getCroppedCanvas()

  canvas.toBlob(async (blob) => {
    const formData = new FormData()
    formData.append('image', blob, 'cropped.jpg')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    console.log('Uploaded:', result)
  }, 'image/jpeg', 0.9)
})
```

## CDN Usage

For quick prototyping, use a CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/cropper/dist/style.css">
</head>
<body>
  <div id="container"></div>

  <script type="module">
    import { Cropper } from 'https://unpkg.com/@ldesign/cropper/dist/index.js'

    const cropper = new Cropper('#container', {
      src: 'image.jpg'
    })
  </script>
</body>
</html>
```

## TypeScript

Use with TypeScript for type safety:

```typescript
import { Cropper, CropperOptions } from '@ldesign/cropper'

const options: CropperOptions = {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  viewMode: 1
}

const cropper = new Cropper('#container', options)

// Typed crop data
const data = cropper.getData()
console.log(data.width, data.height)
```

## Next Steps

- Learn about [Configuration](/guide/configuration)
- Explore [API Reference](/api/cropper)
- See [Examples](/examples/)
