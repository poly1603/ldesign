# Basic Usage

This guide covers the fundamental concepts and basic usage patterns of @ldesign/cropper.

## Creating a Cropper Instance

The most basic way to create a cropper is to pass a container selector and image source:

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg'
})
```

### Container Requirements

The container element should have explicit dimensions:

```html
<div id="container" style="width: 800px; height: 600px;"></div>
```

Or use CSS:

```css
#container {
  width: 100%;
  height: 500px;
}
```

## Loading Images

### From URL

```javascript
const cropper = new Cropper('#container', {
  src: 'https://example.com/image.jpg'
})
```

### From File Input

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

### Replace Image

Replace the current image with a new one:

```javascript
cropper.replace('path/to/new-image.jpg')
```

## Basic Configuration

### Aspect Ratio

Constrain the crop box to a specific aspect ratio:

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9  // 16:9 aspect ratio
})

// Common aspect ratios
// 1 / 1        - Square (1:1)
// 16 / 9       - Widescreen (16:9)
// 4 / 3        - Standard (4:3)
// 3 / 2        - Classic (3:2)
// NaN          - Free aspect ratio
```

### View Mode

Control how the image is displayed:

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  viewMode: 1
})
```

View modes:
- `0` - No restrictions
- `1` - Restrict crop box to not exceed the size of the canvas
- `2` - Restrict canvas to fit within the container
- `3` - Restrict canvas to fill the container

### Auto Crop

Automatically show the crop box when the image is loaded:

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  autoCrop: true,
  autoCropArea: 0.8  // 80% of the image area
})
```

## Getting Cropped Image

### As Canvas

Get the cropped area as an HTMLCanvasElement:

```javascript
const canvas = cropper.getCroppedCanvas()

// Display in page
document.body.appendChild(canvas)

// Get as data URL
const dataURL = canvas.toDataURL('image/jpeg', 0.9)

// Get as Blob
canvas.toBlob((blob) => {
  // Upload or download
  const formData = new FormData()
  formData.append('image', blob, 'cropped.jpg')
}, 'image/jpeg', 0.9)
```

### With Options

Specify dimensions and quality:

```javascript
const canvas = cropper.getCroppedCanvas({
  width: 400,
  height: 300,
  minWidth: 200,
  minHeight: 150,
  maxWidth: 1000,
  maxHeight: 1000,
  fillColor: '#fff',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high'
})
```

## Getting Crop Data

Get the crop box position and size:

```javascript
const data = cropper.getData()
console.log(data)
// {
//   x: 100,
//   y: 50,
//   width: 400,
//   height: 300,
//   rotate: 0,
//   scaleX: 1,
//   scaleY: 1
// }

// Get rounded values
const roundedData = cropper.getData(true)
```

## Setting Crop Data

Restore a previous crop state:

```javascript
// Save crop data
const savedData = cropper.getData()
localStorage.setItem('cropData', JSON.stringify(savedData))

// Restore later
const restoredData = JSON.parse(localStorage.getItem('cropData'))
cropper.setData(restoredData)
```

## Transformations

### Rotate

Rotate the image by degrees:

```javascript
// Rotate right 90 degrees
cropper.rotate(90)

// Rotate left 90 degrees
cropper.rotate(-90)

// Rotate by any angle
cropper.rotate(45)
```

### Scale

Scale (flip) the image:

```javascript
// Flip horizontal
cropper.scaleX(-1)

// Flip vertical
cropper.scaleY(-1)

// Reset
cropper.scaleX(1)
cropper.scaleY(1)
```

### Reset

Reset all transformations:

```javascript
cropper.reset()
```

## Events

Listen to cropper events:

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',

  ready: (e) => {
    console.log('Cropper is ready')
  },

  crop: (e) => {
    const data = e.detail
    console.log('Crop data:', data)
  },

  zoom: (e) => {
    console.log('Zoom ratio:', e.detail.zoom)
  }
})
```

## Lifecycle

### Enable/Disable

```javascript
// Disable cropper
cropper.disable()

// Enable cropper
cropper.enable()
```

### Clear

Hide the crop box:

```javascript
cropper.clear()
```

### Destroy

Clean up the cropper instance:

```javascript
cropper.destroy()
```

## Complete Example

Here's a complete example with file input and download:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/@ldesign/cropper/style.css">
  <style>
    #container {
      width: 800px;
      height: 600px;
      margin: 20px auto;
    }
    .controls {
      text-align: center;
      margin: 20px;
    }
    button {
      margin: 0 5px;
      padding: 10px 20px;
    }
  </style>
</head>
<body>
  <div class="controls">
    <input type="file" id="fileInput" accept="image/*">
    <button id="rotateLeft">Rotate Left</button>
    <button id="rotateRight">Rotate Right</button>
    <button id="flipH">Flip H</button>
    <button id="flipV">Flip V</button>
    <button id="reset">Reset</button>
    <button id="download">Download</button>
  </div>

  <div id="container"></div>

  <script type="module">
    import { Cropper } from '@ldesign/cropper'

    const cropper = new Cropper('#container', {
      src: 'path/to/default-image.jpg',
      aspectRatio: 16 / 9,
      viewMode: 1
    })

    // File input
    document.getElementById('fileInput').addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      }
    })

    // Controls
    document.getElementById('rotateLeft').addEventListener('click', () => {
      cropper.rotate(-90)
    })

    document.getElementById('rotateRight').addEventListener('click', () => {
      cropper.rotate(90)
    })

    document.getElementById('flipH').addEventListener('click', () => {
      const data = cropper.getData()
      cropper.scaleX(-data.scaleX)
    })

    document.getElementById('flipV').addEventListener('click', () => {
      const data = cropper.getData()
      cropper.scaleY(-data.scaleY)
    })

    document.getElementById('reset').addEventListener('click', () => {
      cropper.reset()
    })

    document.getElementById('download').addEventListener('click', () => {
      const canvas = cropper.getCroppedCanvas()
      const link = document.createElement('a')
      link.download = 'cropped-image.png'
      link.href = canvas.toDataURL()
      link.click()
    })
  </script>
</body>
</html>
```

## Next Steps

- Learn about [Configuration Options](/guide/configuration)
- Explore [Methods](/guide/methods)
- Understand [Events](/guide/events)
- See [Live Examples](/examples/)
