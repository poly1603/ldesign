# Configuration

Learn how to configure @ldesign/cropper for your needs.

## Overview

The cropper accepts various options to customize its behavior and appearance. Options can be passed to the constructor or component props.

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  viewMode: 1,
  // ... more options
})
```

## Common Configurations

### Fixed Aspect Ratio

Lock the crop box to a specific aspect ratio:

```javascript
// Square (1:1)
new Cropper('#container', {
  aspectRatio: 1
})

// Widescreen (16:9)
new Cropper('#container', {
  aspectRatio: 16 / 9
})

// Standard (4:3)
new Cropper('#container', {
  aspectRatio: 4 / 3
})

// Portrait (9:16)
new Cropper('#container', {
  aspectRatio: 9 / 16
})

// Free (no constraint)
new Cropper('#container', {
  aspectRatio: NaN
})
```

### Circle Crop

Create a circular crop area:

```javascript
new Cropper('#container', {
  aspectRatio: 1,
  viewMode: 1
})

// In CSS
.cropper-crop-box {
  border-radius: 50%;
}

.cropper-view-box {
  border-radius: 50%;
}
```

### Mobile-Friendly

Optimize for mobile devices:

```javascript
new Cropper('#container', {
  viewMode: 1,
  zoomOnTouch: true,
  zoomOnWheel: false,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: false,
  minCropBoxWidth: 50,
  minCropBoxHeight: 50
})
```

### Read-Only Mode

Display without allowing modifications:

```javascript
new Cropper('#container', {
  movable: false,
  zoomable: false,
  rotatable: false,
  scalable: false,
  cropBoxMovable: false,
  cropBoxResizable: false,
  dragMode: 'none'
})
```

### Minimal UI

Hide visual guides:

```javascript
new Cropper('#container', {
  modal: false,
  guides: false,
  center: false,
  highlight: false,
  background: false
})
```

## Size Constraints

### Crop Box Limits

```javascript
new Cropper('#container', {
  minCropBoxWidth: 100,
  minCropBoxHeight: 100,
  maxCropBoxWidth: 800,
  maxCropBoxHeight: 600
})
```

### Container Limits

```javascript
new Cropper('#container', {
  minContainerWidth: 300,
  minContainerHeight: 200
})
```

### Output Size

Control the cropped image size:

```javascript
const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 600,
  minWidth: 400,
  minHeight: 300,
  maxWidth: 1920,
  maxHeight: 1080
})
```

## View Modes Explained

### Mode 0: No Restrictions

```javascript
new Cropper('#container', {
  viewMode: 0
})
```

- Crop box can exceed the canvas
- Canvas can exceed the container
- Most flexible

### Mode 1: Restrict Crop Box

```javascript
new Cropper('#container', {
  viewMode: 1
})
```

- Crop box restricted to canvas size
- Recommended for most use cases

### Mode 2: Minimum Canvas

```javascript
new Cropper('#container', {
  viewMode: 2
})
```

- Canvas must fit within container
- Image size fits the container

### Mode 3: Fill Container

```javascript
new Cropper('#container', {
  viewMode: 3
})
```

- Canvas fills the entire container
- Strictest mode

## Zoom Configuration

### Disable Zoom

```javascript
new Cropper('#container', {
  zoomable: false,
  zoomOnTouch: false,
  zoomOnWheel: false
})
```

### Mouse Wheel Zoom

```javascript
new Cropper('#container', {
  zoomOnWheel: true,
  wheelZoomRatio: 0.1  // 10% per scroll
})
```

### Touch Zoom

```javascript
new Cropper('#container', {
  zoomOnTouch: true  // Pinch to zoom
})
```

## Responsive Behavior

### Auto Resize

```javascript
new Cropper('#container', {
  responsive: true,  // Re-render on window resize
  restore: true      // Restore crop box position
})
```

### Manual Resize Handling

```javascript
const cropper = new Cropper('#container')

window.addEventListener('resize', () => {
  // Save current crop data
  const data = cropper.getData()

  // Re-initialize cropper
  cropper.destroy()
  const newCropper = new Cropper('#container', {
    src: imageSrc,
    data: data  // Restore crop data
  })
})
```

## Performance Optimization

### Disable Unnecessary Features

```javascript
new Cropper('#container', {
  background: false,   // No background grid
  guides: false,       // No guide lines
  highlight: false,    // No highlight
  responsive: false    // Manual resize handling
})
```

### Optimize Canvas Size

```javascript
// Don't create unnecessarily large canvases
const canvas = cropper.getCroppedCanvas({
  maxWidth: 1920,
  maxHeight: 1080,
  imageSmoothingQuality: 'high'
})
```

## Cross-Origin Images

### Enable Cross-Origin

```javascript
new Cropper('#container', {
  src: 'https://example.com/image.jpg',
  checkCrossOrigin: true,
  crossorigin: 'anonymous'
})
```

### Handle CORS Errors

```javascript
new Cropper('#container', {
  src: 'image.jpg',
  ready: () => {
    console.log('Image loaded successfully')
  }
})
```

## Data Restoration

### Save and Restore Crop Data

```javascript
// Save
const data = cropper.getData()
localStorage.setItem('cropData', JSON.stringify(data))

// Restore
const savedData = JSON.parse(localStorage.getItem('cropData'))
new Cropper('#container', {
  src: 'image.jpg',
  data: savedData,
  ready: () => {
    cropper.setData(savedData)
  }
})
```

## Framework-Specific Configuration

### Vue 3

```vue
<template>
  <VueCropper
    :src="imageSrc"
    :aspect-ratio="16 / 9"
    :view-mode="1"
    :auto-crop="true"
    :movable="true"
    :zoomable="true"
  />
</template>
```

### React

```jsx
<ReactCropper
  src="image.jpg"
  aspectRatio={16 / 9}
  viewMode={1}
  autoCrop={true}
  movable={true}
  zoomable={true}
/>
```

### Angular

```html
<ldesign-cropper
  [src]="imageSrc"
  [aspectRatio]="16 / 9"
  [viewMode]="1"
  [autoCrop]="true"
  [movable]="true"
  [zoomable]="true"
></ldesign-cropper>
```

## Best Practices

1. **Always set container dimensions**
   ```css
   #container {
     width: 100%;
     height: 500px;
   }
   ```

2. **Use appropriate view mode**
   - Mode 1 for most cases
   - Mode 3 for fixed layouts

3. **Set aspect ratio for consistency**
   ```javascript
   aspectRatio: 16 / 9
   ```

4. **Optimize for target device**
   - Mobile: Enable touch zoom
   - Desktop: Enable wheel zoom

5. **Handle errors gracefully**
   ```javascript
   try {
     const cropper = new Cropper('#container', options)
   } catch (error) {
     console.error('Failed to initialize cropper:', error)
   }
   ```

## Next Steps

- Learn about [Methods](/guide/methods)
- Understand [Events](/guide/events)
- See [API Reference](/api/options)
