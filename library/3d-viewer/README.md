# 3D Panorama Viewer

A cross-framework 3D panorama image viewer library built with Three.js. Supports PC, tablet, and mobile devices with framework-specific wrappers for Vue, React, and Lit.

## Features

- 🌐 **360° Panorama Support** - View equirectangular panorama images
- 🎮 **Multiple Controls** - Mouse drag, touch gestures, and gyroscope support
- 📱 **Mobile Optimized** - Touch controls and device orientation support
- 🎨 **Framework Agnostic** - Core library works with any framework
- ⚛️ **Framework Wrappers** - Ready-to-use components for Vue 3, React, and Lit
- 🔧 **TypeScript** - Full TypeScript support with type definitions
- 📦 **Modular** - Use only what you need
- 🎯 **Zero Dependencies** - Except for Three.js peer dependency

## Packages

This is a monorepo containing the following packages:

- **@panorama-viewer/core** - Core viewer library (framework-agnostic)
- **@panorama-viewer/vue** - Vue 3 component wrapper
- **@panorama-viewer/react** - React component wrapper
- **@panorama-viewer/lit** - Lit web component wrapper

## Installation

### Using with Vue 3

```bash
npm install @panorama-viewer/vue three
```

### Using with React

```bash
npm install @panorama-viewer/react three
```

### Using with Lit

```bash
npm install @panorama-viewer/lit three
```

### Using Core (Framework Agnostic)

```bash
npm install @panorama-viewer/core three
```

## Quick Start

### Vue 3

```vue
<template>
  <PanoramaViewer
    image="path/to/panorama.jpg"
    :auto-rotate="true"
    width="100%"
    height="600px"
  />
</template>

<script setup>
import { PanoramaViewer } from '@panorama-viewer/vue';
</script>
```

### React

```jsx
import { PanoramaViewer } from '@panorama-viewer/react';

function App() {
  return (
    <PanoramaViewer
      image="path/to/panorama.jpg"
      autoRotate={true}
      width="100%"
      height="600px"
    />
  );
}
```

### Lit

```html
<script type="module">
  import '@panorama-viewer/lit';
</script>

<panorama-viewer
  image="path/to/panorama.jpg"
  auto-rotate
  width="100%"
  height="600px"
></panorama-viewer>
```

### Vanilla JavaScript (Core)

```javascript
import { PanoramaViewer } from '@panorama-viewer/core';

const viewer = new PanoramaViewer({
  container: document.getElementById('viewer'),
  image: 'path/to/panorama.jpg',
  autoRotate: true,
});
```

## API

### Props / Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `image` | `string` | **required** | URL or path to the panorama image |
| `fov` | `number` | `75` | Field of view in degrees |
| `minFov` | `number` | `30` | Minimum field of view for zoom |
| `maxFov` | `number` | `100` | Maximum field of view for zoom |
| `autoRotate` | `boolean` | `false` | Enable auto rotation |
| `autoRotateSpeed` | `number` | `0.5` | Auto rotation speed |
| `gyroscope` | `boolean` | `true` | Enable gyroscope controls on mobile |

### Methods

All framework wrappers expose these methods:

- `loadImage(url: string): Promise<void>` - Load a new panorama image
- `reset(): void` - Reset camera to initial position
- `enableAutoRotate(): void` - Enable auto rotation
- `disableAutoRotate(): void` - Disable auto rotation
- `enableGyroscope(): Promise<boolean>` - Enable gyroscope controls
- `disableGyroscope(): void` - Disable gyroscope controls
- `getRotation(): { x, y, z }` - Get current camera rotation
- `setRotation(x, y, z): void` - Set camera rotation

## Controls

### Desktop

- **Mouse Drag** - Click and drag to rotate the view
- **Mouse Wheel** - Scroll to zoom in/out

### Mobile / Tablet

- **Touch Drag** - Single finger drag to rotate
- **Pinch** - Two finger pinch to zoom
- **Gyroscope** - Device orientation for immersive experience (requires permission on iOS 13+)

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run Vue demo
cd examples/vue-demo
pnpm dev

# Run React demo
cd examples/react-demo
pnpm dev

# Run Lit demo
cd examples/lit-demo
pnpm dev
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers with WebGL support

## License

MIT

## Credits

Built with [Three.js](https://threejs.org/)


