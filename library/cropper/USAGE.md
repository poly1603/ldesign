# @ldesign/cropper Usage Guide

A powerful, flexible image cropper library with complete support for Vue, React, and Angular.

## Installation

```bash
npm install @ldesign/cropper
# or
yarn add @ldesign/cropper
# or
pnpm add @ldesign/cropper
```

## Vue 3 Usage

### Component Usage

```vue
<template>
  <div>
    <VueCropper
      :src="imageSrc"
      :aspect-ratio="16/9"
      :view-mode="1"
      :toolbar="true"
      @ready="onReady"
      @crop="onCrop"
      ref="cropperRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')
const cropperRef = ref()

const onReady = () => {
  console.log('Cropper is ready')
}

const onCrop = (event: CustomEvent) => {
  console.log('Crop data:', event.detail)
}

// Access cropper instance
const getCroppedImage = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  if (canvas) {
    canvas.toBlob((blob) => {
      // Handle the blob
    })
  }
}
</script>
```

### Composable Usage (Vue Hook)

```vue
<template>
  <div ref="containerRef" style="width: 100%; height: 500px;"></div>
  <button @click="rotateImage">Rotate</button>
  <button @click="getCropped">Get Cropped</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const containerRef = ref<HTMLElement>()

const {
  isReady,
  cropData,
  rotate,
  getCroppedCanvas,
  reset,
  setCropBoxStyle
} = useCropper(containerRef, {
  src: 'path/to/image.jpg',
  aspectRatio: 1,
  toolbar: true,
  onReady: (cropper) => {
    console.log('Cropper ready', cropper)
  },
  onCrop: (data) => {
    console.log('Crop data', data)
  }
})

const rotateImage = () => {
  rotate(90)
}

const getCropped = () => {
  const canvas = getCroppedCanvas()
  // Use the canvas
}
</script>
```

### Directive Usage

```vue
<template>
  <div 
    v-cropper="{
      src: imageSrc,
      aspectRatio: 16/9,
      toolbar: true,
      onCrop: handleCrop
    }"
    style="width: 100%; height: 500px;"
    @cropper:ready="onCropperReady"
    @cropper:crop="onCropperCrop"
  ></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { vCropper, getCropperInstance } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')

const handleCrop = (data: any) => {
  console.log('Crop data from directive:', data)
}

const onCropperReady = (event: CustomEvent) => {
  const cropper = event.detail
  console.log('Cropper ready:', cropper)
}

const onCropperCrop = (event: CustomEvent) => {
  console.log('Crop event:', event.detail)
}

// Access cropper instance from element
const getCropperFromElement = (el: HTMLElement) => {
  const cropper = getCropperInstance(el)
  return cropper
}
</script>
```

## React Usage

### Component Usage

```tsx
import React, { useRef } from 'react'
import { ReactCropper, ReactCropperRef } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const cropperRef = useRef<ReactCropperRef>(null)

  const handleReady = (cropper: Cropper) => {
    console.log('Cropper is ready', cropper)
  }

  const handleCrop = (event: CustomEvent) => {
    console.log('Crop data:', event.detail)
  }

  const getCroppedImage = () => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    if (canvas) {
      canvas.toBlob((blob) => {
        // Handle the blob
      })
    }
  }

  const rotateImage = () => {
    cropperRef.current?.rotate(90)
  }

  return (
    <div>
      <ReactCropper
        ref={cropperRef}
        src="path/to/image.jpg"
        aspectRatio={16/9}
        viewMode={1}
        toolbar={true}
        onReady={handleReady}
        onCrop={handleCrop}
        style={{ width: '100%', height: '500px' }}
      />
      <button onClick={rotateImage}>Rotate</button>
      <button onClick={getCroppedImage}>Get Cropped</button>
    </div>
  )
}

export default App
```

### Hook Usage

```tsx
import React from 'react'
import { useCropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const {
    containerRef,
    isReady,
    cropData,
    rotate,
    getCroppedCanvas,
    reset,
    setCropBoxStyle
  } = useCropper({
    src: 'path/to/image.jpg',
    aspectRatio: 1,
    toolbar: true,
    onReady: (cropper) => {
      console.log('Cropper ready', cropper)
    },
    onCrop: (data) => {
      console.log('Crop data', data)
    }
  })

  const handleRotate = () => {
    rotate(90)
  }

  const handleGetCropped = () => {
    const canvas = getCroppedCanvas()
    if (canvas) {
      canvas.toBlob((blob) => {
        // Handle the blob
      })
    }
  }

  const changeStyle = () => {
    setCropBoxStyle('rounded')
  }

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
      {isReady && (
        <div>
          <button onClick={handleRotate}>Rotate</button>
          <button onClick={handleGetCropped}>Get Cropped</button>
          <button onClick={reset}>Reset</button>
          <button onClick={changeStyle}>Change Style</button>
          <pre>{JSON.stringify(cropData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
```

## Angular Usage

### Component Usage

First, import the module:

```typescript
// app.module.ts
import { AngularCropperModule } from '@ldesign/cropper/angular'

@NgModule({
  imports: [AngularCropperModule],
  // ...
})
export class AppModule { }
```

Then use in your component:

```typescript
// app.component.ts
import { Component, ViewChild } from '@angular/core'
import { AngularCropperComponent } from '@ldesign/cropper/angular'

@Component({
  selector: 'app-root',
  template: `
    <angular-cropper
      #cropper
      [src]="imageSrc"
      [aspectRatio]="aspectRatio"
      [viewMode]="1"
      [toolbar]="true"
      (ready)="onReady($event)"
      (crop)="onCrop($event)"
    ></angular-cropper>
    
    <button (click)="rotate()">Rotate</button>
    <button (click)="getCropped()">Get Cropped</button>
  `,
  styles: [`
    angular-cropper {
      display: block;
      width: 100%;
      height: 500px;
    }
  `]
})
export class AppComponent {
  @ViewChild('cropper') cropperComponent!: AngularCropperComponent
  
  imageSrc = 'path/to/image.jpg'
  aspectRatio = 16/9
  
  onReady(cropper: any) {
    console.log('Cropper is ready', cropper)
  }
  
  onCrop(event: any) {
    console.log('Crop data:', event)
  }
  
  rotate() {
    this.cropperComponent.rotate(90)
  }
  
  getCropped() {
    const canvas = this.cropperComponent.getCroppedCanvas()
    if (canvas) {
      canvas.toBlob((blob) => {
        // Handle the blob
      })
    }
  }
}
```

## Vanilla JavaScript Usage

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const container = document.getElementById('cropper-container')

const cropper = new Cropper(container, {
  src: 'path/to/image.jpg',
  aspectRatio: 16/9,
  viewMode: 1,
  toolbar: true,
  ready: (e) => {
    console.log('Cropper is ready')
  },
  crop: (e) => {
    console.log('Crop data:', e.detail)
  }
})

// Methods
cropper.rotate(90)
cropper.scale(1.5, 1.5)
cropper.reset()

const canvas = cropper.getCroppedCanvas({
  width: 400,
  height: 400,
  imageSmoothingQuality: 'high'
})

// Get crop data
const data = cropper.getData()
console.log(data)
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `aspectRatio` | `number` | `NaN` | Aspect ratio of crop box |
| `viewMode` | `0\|1\|2\|3` | `0` | View mode restrictions |
| `dragMode` | `'crop'\|'move'\|'none'` | `'crop'` | Drag mode |
| `toolbar` | `boolean\|ToolbarOptions` | `true` | Show/configure toolbar |
| `autoCrop` | `boolean` | `true` | Auto show crop box |
| `autoCropArea` | `number` | `0.8` | Auto crop area size (0-1) |
| `background` | `boolean` | `true` | Show background grid |
| `guides` | `boolean` | `true` | Show dashed guides |
| `center` | `boolean` | `true` | Show center indicator |
| `highlight` | `boolean` | `true` | Show highlight overlay |
| `modal` | `boolean` | `true` | Show dark modal |
| `movable` | `boolean` | `true` | Allow move image |
| `rotatable` | `boolean` | `true` | Allow rotate |
| `scalable` | `boolean` | `true` | Allow scale |
| `zoomable` | `boolean` | `true` | Allow zoom |
| `zoomOnTouch` | `boolean` | `true` | Zoom on touch |
| `zoomOnWheel` | `boolean` | `true` | Zoom on wheel |
| `cropBoxMovable` | `boolean` | `true` | Allow move crop box |
| `cropBoxResizable` | `boolean` | `true` | Allow resize crop box |
| `cropBoxStyle` | `string` | `'default'` | Crop box style |
| `themeColor` | `string` | `'#39f'` | Theme color |

## Methods

| Method | Description |
|--------|-------------|
| `rotate(degrees)` | Rotate image |
| `scale(scaleX, scaleY?)` | Scale image |
| `scaleX(scale)` | Scale X axis |
| `scaleY(scale)` | Scale Y axis |
| `move(offsetX, offsetY)` | Move image |
| `reset()` | Reset to initial state |
| `clear()` | Clear crop box |
| `replace(src)` | Replace image source |
| `enable()` | Enable cropper |
| `disable()` | Disable cropper |
| `destroy()` | Destroy cropper instance |
| `getCroppedCanvas(options?)` | Get cropped canvas |
| `getData(rounded?)` | Get crop box data |
| `setData(data)` | Set crop box data |
| `getImageData()` | Get image data |
| `setCropBoxStyle(style)` | Set crop box style |

## Events

| Event | Description |
|-------|-------------|
| `ready` | Fired when cropper is ready |
| `cropstart` | Fired when crop starts |
| `cropmove` | Fired when crop moves |
| `cropend` | Fired when crop ends |
| `crop` | Fired when cropping |
| `zoom` | Fired when zooming |

## Crop Box Styles

- `default` - Standard rectangular crop box
- `rounded` - Rounded corners
- `circle` - Circular crop box
- `minimal` - Minimal style
- `dotted` - Dotted border
- `solid` - Solid border
- `gradient` - Gradient border

## TypeScript Support

The library is written in TypeScript and provides full type definitions for all frameworks.

```typescript
import type { 
  CropperOptions, 
  CropData, 
  GetCroppedCanvasOptions 
} from '@ldesign/cropper'
```

## License

MIT