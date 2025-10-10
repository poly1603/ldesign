# Options API

Configuration options for the Cropper constructor.

## Basic Options

### src

Image source URL.

- **Type:** `string`
- **Default:** `undefined`
- **Required:** `true`

```javascript
new Cropper('#container', {
  src: 'path/to/image.jpg'
})
```

---

### alt

Alternative text for the image.

- **Type:** `string`
- **Default:** `''`

```javascript
new Cropper('#container', {
  src: 'image.jpg',
  alt: 'Profile picture'
})
```

---

### aspectRatio

Aspect ratio constraint for the crop box.

- **Type:** `number`
- **Default:** `NaN` (free ratio)

```javascript
// Common aspect ratios
new Cropper('#container', {
  aspectRatio: 16 / 9  // 16:9
})

// Square
aspectRatio: 1       // 1:1

// Standard
aspectRatio: 4 / 3   // 4:3

// Free
aspectRatio: NaN     // No constraint
```

---

### viewMode

Define how the cropper is displayed in the container.

- **Type:** `0 | 1 | 2 | 3`
- **Default:** `0`

**Modes:**
- `0` - No restrictions
- `1` - Restrict crop box to not exceed canvas
- `2` - Restrict canvas to fit within container (minimum canvas size)
- `3` - Restrict canvas to fill container (exact canvas size)

```javascript
new Cropper('#container', {
  viewMode: 1
})
```

---

### dragMode

Define the dragging mode.

- **Type:** `'crop' | 'move' | 'none'`
- **Default:** `'crop'`

**Modes:**
- `'crop'` - Create a new crop box
- `'move'` - Move the canvas
- `'none'` - Do nothing

```javascript
new Cropper('#container', {
  dragMode: 'move'
})
```

## Auto Crop

### autoCrop

Enable auto crop when image is loaded.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  autoCrop: true
})
```

---

### autoCropArea

Define the automatic cropping area size (percentage).

- **Type:** `number` (0 to 1)
- **Default:** `0.8`

```javascript
new Cropper('#container', {
  autoCrop: true,
  autoCropArea: 0.5  // 50% of image
})
```

## Behavior Options

### movable

Enable to move the image.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  movable: false
})
```

---

### rotatable

Enable to rotate the image.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  rotatable: true
})
```

---

### scalable

Enable to scale the image.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  scalable: true
})
```

---

### zoomable

Enable to zoom the image.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  zoomable: true
})
```

---

### zoomOnTouch

Enable to zoom by touch (pinch).

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  zoomOnTouch: true
})
```

---

### zoomOnWheel

Enable to zoom by mouse wheel.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  zoomOnWheel: true
})
```

---

### wheelZoomRatio

Define the zoom ratio when zooming by mouse wheel.

- **Type:** `number`
- **Default:** `0.1`

```javascript
new Cropper('#container', {
  zoomOnWheel: true,
  wheelZoomRatio: 0.2  // 20% per scroll
})
```

## Crop Box Options

### cropBoxMovable

Enable to move the crop box by dragging.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  cropBoxMovable: true
})
```

---

### cropBoxResizable

Enable to resize the crop box by dragging.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  cropBoxResizable: true
})
```

---

### minCropBoxWidth

Minimum crop box width.

- **Type:** `number`
- **Default:** `0`

```javascript
new Cropper('#container', {
  minCropBoxWidth: 100
})
```

---

### minCropBoxHeight

Minimum crop box height.

- **Type:** `number`
- **Default:** `0`

```javascript
new Cropper('#container', {
  minCropBoxHeight: 100
})
```

---

### maxCropBoxWidth

Maximum crop box width.

- **Type:** `number`
- **Default:** `Infinity`

```javascript
new Cropper('#container', {
  maxCropBoxWidth: 800
})
```

---

### maxCropBoxHeight

Maximum crop box height.

- **Type:** `number`
- **Default:** `Infinity`

```javascript
new Cropper('#container', {
  maxCropBoxHeight: 600
})
```

## Visual Options

### modal

Show the black modal above the image and under the crop box.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  modal: true
})
```

---

### guides

Show the dashed lines in the crop box.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  guides: true
})
```

---

### center

Show the center indicator in the crop box.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  center: true
})
```

---

### highlight

Show the white modal above the crop box.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  highlight: false
})
```

---

### background

Show the grid background of the container.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  background: true
})
```

## Responsive

### responsive

Re-render the cropper when resizing the window.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  responsive: true
})
```

---

### restore

Restore the cropped area after resizing the window.

- **Type:** `boolean`
- **Default:** `true`

```javascript
new Cropper('#container', {
  restore: true
})
```

## Container Constraints

### minContainerWidth

Minimum container width.

- **Type:** `number`
- **Default:** `200`

```javascript
new Cropper('#container', {
  minContainerWidth: 300
})
```

---

### minContainerHeight

Minimum container height.

- **Type:** `number`
- **Default:** `100`

```javascript
new Cropper('#container', {
  minContainerHeight: 200
})
```

## Events

All event options accept a function that will be called when the event is triggered.

### ready

Triggered when the cropper is ready.

```javascript
new Cropper('#container', {
  ready: (event) => {
    console.log('Cropper is ready')
  }
})
```

---

### cropstart

Triggered when starting to crop.

```javascript
new Cropper('#container', {
  cropstart: (event) => {
    console.log('Crop started', event.detail)
  }
})
```

---

### cropmove

Triggered when cropping.

```javascript
new Cropper('#container', {
  cropmove: (event) => {
    console.log('Cropping', event.detail)
  }
})
```

---

### cropend

Triggered when ending cropping.

```javascript
new Cropper('#container', {
  cropend: (event) => {
    console.log('Crop ended', event.detail)
  }
})
```

---

### crop

Triggered when the crop box changes.

```javascript
new Cropper('#container', {
  crop: (event) => {
    const data = event.detail
    console.log('Crop data:', data)
  }
})
```

---

### zoom

Triggered when zooming.

```javascript
new Cropper('#container', {
  zoom: (event) => {
    console.log('Zoom:', event.detail.zoom)
  }
})
```

## Complete Example

```javascript
const cropper = new Cropper('#container', {
  // Basic
  src: 'path/to/image.jpg',
  alt: 'My image',
  aspectRatio: 16 / 9,
  viewMode: 1,
  dragMode: 'crop',

  // Auto crop
  autoCrop: true,
  autoCropArea: 0.8,

  // Behavior
  movable: true,
  rotatable: true,
  scalable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  wheelZoomRatio: 0.1,

  // Crop box
  cropBoxMovable: true,
  cropBoxResizable: true,
  minCropBoxWidth: 100,
  minCropBoxHeight: 100,

  // Visual
  modal: true,
  guides: true,
  center: true,
  highlight: true,
  background: true,

  // Responsive
  responsive: true,
  restore: true,

  // Events
  ready: (e) => console.log('Ready'),
  crop: (e) => console.log('Crop data:', e.detail),
  zoom: (e) => console.log('Zoom:', e.detail.zoom)
})
```

## See Also

- [Cropper API](/api/cropper)
- [Events API](/api/events)
- [Types API](/api/types)
