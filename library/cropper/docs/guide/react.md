# React Integration

@ldesign/cropper provides full support for React with hooks and TypeScript.

## Installation

```bash
npm install @ldesign/cropper react react-dom
```

## Basic Usage

```jsx
import { useRef } from 'react'
import { ReactCropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const cropperRef = useRef(null)

  const handleReady = (cropper) => {
    console.log('Cropper is ready', cropper)
  }

  const handleCrop = (e) => {
    console.log('Crop data:', e.detail)
  }

  return (
    <div style={{ width: '800px', height: '600px' }}>
      <ReactCropper
        ref={cropperRef}
        src="path/to/image.jpg"
        aspectRatio={16 / 9}
        onReady={handleReady}
        onCrop={handleCrop}
      />
    </div>
  )
}
```

## Component Props

```jsx
<ReactCropper
  src="path/to/image.jpg"
  aspectRatio={16 / 9}
  viewMode={1}
  dragMode="crop"
  autoCrop={true}
  autoCropArea={0.8}
  movable={true}
  rotatable={true}
  scalable={true}
  zoomable={true}
  zoomOnTouch={true}
  zoomOnWheel={true}
  cropBoxMovable={true}
  cropBoxResizable={true}
  background={true}
  guides={true}
  center={true}
  highlight={true}
  responsive={true}
  className="custom-cropper"
  style={{ border: '1px solid #ddd' }}
/>
```

## Event Handlers

```jsx
function App() {
  return (
    <ReactCropper
      src="image.jpg"
      onReady={(cropper) => {
        console.log('Ready', cropper)
      }}
      onCropStart={(e) => {
        console.log('Crop start', e.detail)
      }}
      onCropMove={(e) => {
        console.log('Crop move', e.detail)
      }}
      onCropEnd={(e) => {
        console.log('Crop end', e.detail)
      }}
      onCrop={(e) => {
        console.log('Crop', e.detail)
      }}
      onZoom={(e) => {
        console.log('Zoom', e.detail)
      }}
    />
  )
}
```

## Ref Methods

Access cropper methods through ref:

```jsx
function App() {
  const cropperRef = useRef(null)

  const rotateLeft = () => {
    cropperRef.current?.rotate(-90)
  }

  const rotateRight = () => {
    cropperRef.current?.rotate(90)
  }

  const getCropped = () => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    if (canvas) {
      console.log('Cropped:', canvas)
    }
  }

  const getData = () => {
    const data = cropperRef.current?.getData()
    console.log('Data:', data)
  }

  return (
    <>
      <ReactCropper ref={cropperRef} src="image.jpg" />

      <button onClick={rotateLeft}>Rotate Left</button>
      <button onClick={rotateRight}>Rotate Right</button>
      <button onClick={getCropped}>Get Cropped</button>
      <button onClick={getData}>Get Data</button>
    </>
  )
}
```

## Complete Example

```jsx
import { useState, useRef } from 'react'
import { ReactCropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'
import './App.css'

function App() {
  const cropperRef = useRef(null)
  const [imageSrc, setImageSrc] = useState('')
  const [aspectRatio, setAspectRatio] = useState(NaN)
  const [viewMode, setViewMode] = useState(0)
  const [cropData, setCropData] = useState(null)
  const [croppedImage, setCroppedImage] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageSrc(event.target.result)
        setCroppedImage('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCrop = (e) => {
    setCropData(e.detail)
  }

  const rotate = (degrees) => {
    cropperRef.current?.rotate(degrees)
  }

  const flipHorizontal = () => {
    const cropper = cropperRef.current?.getCropper()
    if (cropper) {
      const imageData = cropper.getImageData()
      cropperRef.current?.scaleX(-imageData.scaleX)
    }
  }

  const flipVertical = () => {
    const cropper = cropperRef.current?.getCropper()
    if (cropper) {
      const imageData = cropper.getImageData()
      cropperRef.current?.scaleY(-imageData.scaleY)
    }
  }

  const reset = () => {
    cropperRef.current?.reset()
  }

  const getCropped = () => {
    const canvas = cropperRef.current?.getCroppedCanvas({
      width: 400,
      height: 400,
      imageSmoothingQuality: 'high'
    })

    if (canvas) {
      setCroppedImage(canvas.toDataURL('image/png'))
    }
  }

  const download = () => {
    if (croppedImage) {
      const link = document.createElement('a')
      link.download = 'cropped-image.png'
      link.href = croppedImage
      link.click()
    }
  }

  return (
    <div className="app">
      <h1>React Cropper Demo</h1>

      {/* File Upload */}
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Cropper */}
      <div className="cropper-wrapper">
        {imageSrc ? (
          <ReactCropper
            ref={cropperRef}
            src={imageSrc}
            aspectRatio={aspectRatio}
            viewMode={viewMode}
            onCrop={handleCrop}
          />
        ) : (
          <div className="placeholder">
            Please select an image
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <label>Aspect Ratio:</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(Number(e.target.value))}
          >
            <option value={NaN}>Free</option>
            <option value={1}>1:1</option>
            <option value={16 / 9}>16:9</option>
            <option value={4 / 3}>4:3</option>
          </select>
        </div>

        <div className="control-group">
          <label>View Mode:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(Number(e.target.value))}
          >
            <option value={0}>Mode 0</option>
            <option value={1}>Mode 1</option>
            <option value={2}>Mode 2</option>
            <option value={3}>Mode 3</option>
          </select>
        </div>
      </div>

      {/* Transform Buttons */}
      <div className="buttons">
        <button onClick={() => rotate(-90)} disabled={!imageSrc}>
          Rotate Left
        </button>
        <button onClick={() => rotate(90)} disabled={!imageSrc}>
          Rotate Right
        </button>
        <button onClick={flipHorizontal} disabled={!imageSrc}>
          Flip H
        </button>
        <button onClick={flipVertical} disabled={!imageSrc}>
          Flip V
        </button>
        <button onClick={reset} disabled={!imageSrc}>
          Reset
        </button>
        <button onClick={getCropped} disabled={!imageSrc}>
          Get Cropped
        </button>
        <button onClick={download} disabled={!croppedImage}>
          Download
        </button>
      </div>

      {/* Preview */}
      {croppedImage && (
        <div className="preview">
          <h3>Preview</h3>
          <img src={croppedImage} alt="Cropped" />
        </div>
      )}

      {/* Crop Data */}
      {cropData && (
        <div className="crop-data">
          <h3>Crop Data</h3>
          <pre>{JSON.stringify(cropData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
```

## TypeScript Support

Full TypeScript support with type definitions:

```tsx
import { useRef } from 'react'
import { ReactCropper, ReactCropperRef } from '@ldesign/cropper/react'
import type { CropData } from '@ldesign/cropper'

function App() {
  const cropperRef = useRef<ReactCropperRef>(null)

  const handleCrop = (e: CustomEvent<CropData>) => {
    const data: CropData = e.detail
    console.log('Crop data:', data)
  }

  return (
    <ReactCropper
      ref={cropperRef}
      src="image.jpg"
      onCrop={handleCrop}
    />
  )
}
```

## Custom Hooks

Create reusable hooks:

```typescript
// hooks/useCropper.ts
import { useRef, useState, useCallback } from 'react'
import type { ReactCropperRef } from '@ldesign/cropper/react'
import type { CropData } from '@ldesign/cropper'

export function useCropper() {
  const cropperRef = useRef<ReactCropperRef>(null)
  const [cropData, setCropData] = useState<CropData | null>(null)
  const [croppedImage, setCroppedImage] = useState('')

  const handleCrop = useCallback((e: CustomEvent<CropData>) => {
    setCropData(e.detail)
  }, [])

  const rotate = useCallback((degrees: number) => {
    cropperRef.current?.rotate(degrees)
  }, [])

  const getCropped = useCallback(() => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    if (canvas) {
      setCroppedImage(canvas.toDataURL())
    }
  }, [])

  const reset = useCallback(() => {
    cropperRef.current?.reset()
    setCroppedImage('')
  }, [])

  return {
    cropperRef,
    cropData,
    croppedImage,
    handleCrop,
    rotate,
    getCropped,
    reset
  }
}

// Usage
function App() {
  const {
    cropperRef,
    cropData,
    croppedImage,
    handleCrop,
    rotate,
    getCropped,
    reset
  } = useCropper()

  return (
    <>
      <ReactCropper
        ref={cropperRef}
        src="image.jpg"
        onCrop={handleCrop}
      />
      <button onClick={() => rotate(90)}>Rotate</button>
      <button onClick={getCropped}>Get Cropped</button>
      <button onClick={reset}>Reset</button>
      {croppedImage && <img src={croppedImage} alt="Cropped" />}
    </>
  )
}
```

## Next Steps

- Learn about [Angular Integration](/guide/angular)
- Explore [Configuration](/guide/configuration)
- See [API Reference](/api/cropper)
