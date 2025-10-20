# Getting Started

This guide will help you get the 3D Panorama Viewer project up and running.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **pnpm** 8 or higher

You can install pnpm with:
```bash
npm install -g pnpm
```

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd 3d-viewer
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

   This will install dependencies for all packages in the monorepo.

3. **Build all packages:**
   ```bash
   pnpm build
   ```

   This builds the core library and all framework wrappers.

## Running Examples

### Vue Example

```bash
cd examples/vue-demo
pnpm dev
```

Then open your browser to `http://localhost:5173`

### React Example

```bash
cd examples/react-demo
pnpm dev
```

Then open your browser to `http://localhost:5173`

### Lit Example

```bash
cd examples/lit-demo
pnpm dev
```

Then open your browser to `http://localhost:5173`

## Using in Your Project

### Option 1: Vue 3 Project

1. Install the package:
   ```bash
   npm install @panorama-viewer/vue three
   ```

2. Use in your component:
   ```vue
   <template>
     <PanoramaViewer
       image="https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg"
       :auto-rotate="true"
       width="100%"
       height="600px"
     />
   </template>

   <script setup>
   import { PanoramaViewer } from '@panorama-viewer/vue';
   </script>
   ```

### Option 2: React Project

1. Install the package:
   ```bash
   npm install @panorama-viewer/react three
   ```

2. Use in your component:
   ```jsx
   import { PanoramaViewer } from '@panorama-viewer/react';

   function App() {
     return (
       <PanoramaViewer
         image="https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg"
         autoRotate={true}
         width="100%"
         height="600px"
       />
     );
   }
   ```

### Option 3: Lit / Web Components

1. Install the package:
   ```bash
   npm install @panorama-viewer/lit three
   ```

2. Use in your HTML/JavaScript:
   ```html
   <script type="module">
     import '@panorama-viewer/lit';
   </script>

   <panorama-viewer
     image="https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg"
     auto-rotate
     width="100%"
     height="600px"
   ></panorama-viewer>
   ```

### Option 4: Vanilla JavaScript

1. Install the core package:
   ```bash
   npm install @panorama-viewer/core three
   ```

2. Use in your JavaScript:
   ```javascript
   import { PanoramaViewer } from '@panorama-viewer/core';

   const viewer = new PanoramaViewer({
     container: document.getElementById('viewer'),
     image: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
     autoRotate: true,
   });
   ```

## Getting Panorama Images

You can use panorama images from various sources:

1. **Your own photos** - Take 360° photos with your smartphone (most modern phones support this)
2. **Stock photo sites** - Search for "360 panorama" or "equirectangular"
3. **Three.js examples** - Use test images from Three.js repository
4. **Free resources**:
   - [Poly Haven](https://polyhaven.com/hdris) - Free HDRIs
   - [HDRI Haven](https://hdrihaven.com/) - Free HDR panoramas

## Controls

### Desktop
- **Click and Drag** - Rotate the view
- **Mouse Wheel** - Zoom in/out

### Mobile
- **Touch Drag** - Rotate with one finger
- **Pinch** - Zoom with two fingers
- **Gyroscope** - Move your device to look around (requires permission on iOS)

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
rm -rf packages/*/node_modules packages/*/dist
rm -rf examples/*/node_modules

pnpm install
pnpm build
```

### WebGL Errors

If you see WebGL errors:
- Ensure your browser supports WebGL (check at https://get.webgl.org/)
- Update your graphics drivers
- Try a different browser

### Gyroscope Not Working

On iOS 13+:
- The app must be served over HTTPS
- User must grant permission when prompted
- Call `enableGyroscope()` on user interaction (button click)

## Next Steps

- Check out the [API documentation](README.md#api)
- Explore the [examples](examples/)
- Read the [contributing guide](CONTRIBUTING.md)

## Need Help?

If you encounter issues or have questions, please open an issue on the project repository.


