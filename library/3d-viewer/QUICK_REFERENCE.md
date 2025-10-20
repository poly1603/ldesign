# Quick Reference Guide

## Installation Commands

### Vue 3 Project
```bash
npm install @panorama-viewer/vue three
# or
yarn add @panorama-viewer/vue three
# or
pnpm add @panorama-viewer/vue three
```

### React Project
```bash
npm install @panorama-viewer/react three
```

### Lit / Web Components
```bash
npm install @panorama-viewer/lit three
```

### Vanilla JavaScript
```bash
npm install @panorama-viewer/core three
```

## Basic Usage Examples

### Vue 3

```vue
<template>
  <PanoramaViewer
    ref="viewer"
    image="panorama.jpg"
    :auto-rotate="true"
    width="100%"
    height="600px"
  />
</template>

<script setup>
import { ref } from 'vue';
import { PanoramaViewer } from '@panorama-viewer/vue';

const viewer = ref();

// Call methods
const reset = () => viewer.value?.reset();
</script>
```

### React

```jsx
import { useRef } from 'react';
import { PanoramaViewer } from '@panorama-viewer/react';

function App() {
  const viewerRef = useRef();

  return (
    <PanoramaViewer
      ref={viewerRef}
      image="panorama.jpg"
      autoRotate={true}
      width="100%"
      height="600px"
      onReady={() => console.log('Ready!')}
    />
  );
}
```

### Lit / HTML

```html
<script type="module">
  import '@panorama-viewer/lit';
</script>

<panorama-viewer
  image="panorama.jpg"
  auto-rotate
  width="100%"
  height="600px"
></panorama-viewer>
```

### Vanilla JavaScript

```javascript
import { PanoramaViewer } from '@panorama-viewer/core';

const viewer = new PanoramaViewer({
  container: document.getElementById('container'),
  image: 'panorama.jpg',
  autoRotate: true,
  fov: 75,
});
```

## Common Props/Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `image` | `string` | **required** | URL to panorama image |
| `fov` | `number` | `75` | Field of view (zoom level) |
| `minFov` | `number` | `30` | Minimum zoom |
| `maxFov` | `number` | `100` | Maximum zoom |
| `autoRotate` | `boolean` | `false` | Enable auto-rotation |
| `autoRotateSpeed` | `number` | `0.5` | Rotation speed |
| `gyroscope` | `boolean` | `true` | Enable gyroscope on mobile |

## Common Methods

### Load New Image
```javascript
// Vue
viewer.value?.loadImage('new-image.jpg');

// React
viewerRef.current?.loadImage('new-image.jpg');

// Lit
document.querySelector('panorama-viewer').loadImage('new-image.jpg');

// Core
viewer.loadImage('new-image.jpg');
```

### Reset Camera
```javascript
viewer.reset();
```

### Enable Gyroscope
```javascript
const success = await viewer.enableGyroscope();
if (success) {
  console.log('Gyroscope enabled!');
}
```

### Toggle Auto Rotate
```javascript
viewer.enableAutoRotate();
viewer.disableAutoRotate();
```

### Get/Set Rotation
```javascript
const rotation = viewer.getRotation(); // { x, y, z }
viewer.setRotation(0, Math.PI, 0);
```

## Event Handling

### Vue
```vue
<PanoramaViewer
  @ready="onReady"
  @error="onError"
/>
```

### React
```jsx
<PanoramaViewer
  onReady={() => console.log('Ready')}
  onError={(error) => console.error(error)}
/>
```

### Lit
```html
<panorama-viewer
  id="viewer"
></panorama-viewer>

<script>
  const viewer = document.getElementById('viewer');
  viewer.addEventListener('ready', () => console.log('Ready'));
  viewer.addEventListener('error', (e) => console.error(e.detail.error));
</script>
```

## Common Issues & Solutions

### Issue: "WebGL not supported"
**Solution:** Ensure browser supports WebGL (Chrome, Firefox, Safari, Edge latest versions)

### Issue: Gyroscope not working on iOS
**Solution:**
1. Serve app over HTTPS
2. Call `enableGyroscope()` on user interaction (button click)
3. User must grant permission when prompted

### Issue: Image not loading
**Solution:**
1. Check image URL is correct
2. Ensure image is accessible (CORS)
3. Verify image is equirectangular format
4. Listen to `error` event for details

### Issue: Blurry or pixelated image
**Solution:** Use higher resolution panorama image (recommended: 4096x2048 or higher)

## Controls Reference

### Desktop
- **Left Click + Drag** - Rotate view
- **Mouse Wheel** - Zoom in/out

### Mobile/Tablet
- **One Finger Drag** - Rotate view
- **Pinch** - Zoom in/out
- **Gyroscope** - Device orientation control (if enabled)

## TypeScript Support

All packages include TypeScript definitions:

```typescript
import { PanoramaViewer } from '@panorama-viewer/core';
import type { ViewerOptions } from '@panorama-viewer/core';

const options: ViewerOptions = {
  container: document.getElementById('viewer')!,
  image: 'panorama.jpg',
  fov: 75,
};

const viewer = new PanoramaViewer(options);
```

## Development Commands (Monorepo)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:lit

# Run examples
pnpm dev:vue     # Vue demo on http://localhost:5173
pnpm dev:react   # React demo on http://localhost:5173
pnpm dev:lit     # Lit demo on http://localhost:5173

# Clean builds
pnpm clean
```

## Sample Panorama Images

For testing, you can use these free panorama images:

1. **Three.js Examples:**
   - `https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg`

2. **Your own photos:**
   - Take 360° photos with smartphone camera

3. **Free resources:**
   - [Poly Haven](https://polyhaven.com/hdris)
   - Search for "equirectangular panorama" on stock photo sites

## License

MIT License - Use freely in commercial and personal projects

## Need More Help?

- Read the [full documentation](README.md)
- Check the [examples](examples/)
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture details
- See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed setup


