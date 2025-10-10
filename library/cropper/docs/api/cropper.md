# Cropper API

The main Cropper class provides all methods for image cropping.

## Constructor

```typescript
new Cropper(element: string | Element, options?: CropperOptions)
```

### Parameters

- `element` - Container element selector or DOM element
- `options` - Configuration options (see [Options](/api/options))

### Example

```javascript
const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9
})
```

## Methods

### replace()

Replace the image source.

```typescript
replace(src: string): Promise<void>
```

**Parameters:**
- `src` - New image URL or data URL

**Example:**
```javascript
await cropper.replace('path/to/new-image.jpg')
```

---

### getData()

Get the crop box position and size data.

```typescript
getData(rounded?: boolean): CropData
```

**Parameters:**
- `rounded` - Round the values (default: `false`)

**Returns:**
```typescript
{
  x: number        // X coordinate
  y: number        // Y coordinate
  width: number    // Width
  height: number   // Height
  rotate: number   // Rotation in degrees
  scaleX: number   // Horizontal scale
  scaleY: number   // Vertical scale
}
```

**Example:**
```javascript
const data = cropper.getData()
console.log(data)
// { x: 100, y: 50, width: 400, height: 300, rotate: 0, scaleX: 1, scaleY: 1 }

const roundedData = cropper.getData(true)
```

---

### setData()

Set the crop box position and size.

```typescript
setData(data: Partial<CropBoxData>): void
```

**Parameters:**
- `data` - Crop box data (partial update)

**Example:**
```javascript
cropper.setData({
  x: 100,
  y: 50,
  width: 400,
  height: 300
})
```

---

### getCroppedCanvas()

Get the cropped area as a canvas element.

```typescript
getCroppedCanvas(options?: GetCroppedCanvasOptions): HTMLCanvasElement | null
```

**Parameters:**
- `options` - Canvas options

**Options:**
```typescript
{
  width?: number                      // Output width
  height?: number                     // Output height
  minWidth?: number                   // Minimum width
  minHeight?: number                  // Minimum height
  maxWidth?: number                   // Maximum width
  maxHeight?: number                  // Maximum height
  fillColor?: string                  // Background fill color
  imageSmoothingEnabled?: boolean     // Enable image smoothing
  imageSmoothingQuality?: 'low' | 'medium' | 'high'
}
```

**Returns:** HTMLCanvasElement or null

**Example:**
```javascript
const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 600,
  imageSmoothingQuality: 'high'
})

// Convert to blob
canvas.toBlob((blob) => {
  // Upload or download
}, 'image/jpeg', 0.9)

// Convert to data URL
const dataURL = canvas.toDataURL('image/png')
```

---

### rotate()

Rotate the image.

```typescript
rotate(degrees: number): void
```

**Parameters:**
- `degrees` - Rotation angle in degrees (positive = clockwise)

**Example:**
```javascript
cropper.rotate(90)   // Rotate right
cropper.rotate(-90)  // Rotate left
cropper.rotate(45)   // Rotate 45 degrees
```

---

### scale()

Scale (flip) the image.

```typescript
scale(scaleX: number, scaleY?: number): void
```

**Parameters:**
- `scaleX` - Horizontal scale (-1 to flip horizontally)
- `scaleY` - Vertical scale (-1 to flip vertically)

**Example:**
```javascript
cropper.scale(-1, 1)  // Flip horizontally
cropper.scale(1, -1)  // Flip vertically
cropper.scale(-1, -1) // Flip both
```

---

### scaleX()

Scale (flip) the image horizontally.

```typescript
scaleX(scaleX: number): void
```

**Parameters:**
- `scaleX` - Horizontal scale

**Example:**
```javascript
cropper.scaleX(-1)  // Flip horizontally
cropper.scaleX(1)   // Reset
```

---

### scaleY()

Scale (flip) the image vertically.

```typescript
scaleY(scaleY: number): void
```

**Parameters:**
- `scaleY` - Vertical scale

**Example:**
```javascript
cropper.scaleY(-1)  // Flip vertically
cropper.scaleY(1)   // Reset
```

---

### reset()

Reset the image and crop box to initial state.

```typescript
reset(): void
```

**Example:**
```javascript
cropper.reset()
```

---

### clear()

Clear (hide) the crop box.

```typescript
clear(): void
```

**Example:**
```javascript
cropper.clear()
```

---

### enable()

Enable (activate) the cropper.

```typescript
enable(): void
```

**Example:**
```javascript
cropper.enable()
```

---

### disable()

Disable (deactivate) the cropper.

```typescript
disable(): void
```

**Example:**
```javascript
cropper.disable()
```

---

### destroy()

Destroy the cropper instance and clean up.

```typescript
destroy(): void
```

**Example:**
```javascript
cropper.destroy()
```

## Properties

### ready

Check if the cropper is ready.

```typescript
readonly ready: boolean
```

**Example:**
```javascript
if (cropper.ready) {
  console.log('Cropper is ready')
}
```

## Static Methods

### version

Get the library version.

```typescript
static version: string
```

**Example:**
```javascript
console.log(Cropper.version)
```

## Complete Example

```javascript
import { Cropper } from '@ldesign/cropper'

// Create cropper
const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9,
  ready: (e) => {
    console.log('Cropper is ready')
  },
  crop: (e) => {
    console.log('Crop data:', e.detail)
  }
})

// Get data
const data = cropper.getData()

// Set data
cropper.setData({
  x: 100,
  y: 50,
  width: 400,
  height: 300
})

// Rotate
cropper.rotate(90)

// Flip
cropper.scaleX(-1)

// Get cropped canvas
const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 600
})

// Download
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = 'cropped.jpg'
  link.href = url
  link.click()
}, 'image/jpeg', 0.9)

// Reset
cropper.reset()

// Destroy
cropper.destroy()
```

## See Also

- [Options API](/api/options)
- [Events API](/api/events)
- [Types API](/api/types)
