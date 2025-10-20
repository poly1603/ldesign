# Examples

This directory contains example implementations of the 3D Panorama Viewer in different frameworks.

## Available Examples

### Vue Demo (`vue-demo`)
Demonstrates the Vue 3 component wrapper.

```bash
cd vue-demo
pnpm install
pnpm dev
```

### React Demo (`react-demo`)
Demonstrates the React component wrapper.

```bash
cd react-demo
pnpm install
pnpm dev
```

### Lit Demo (`lit-demo`)
Demonstrates the Lit web component wrapper.

```bash
cd lit-demo
pnpm install
pnpm dev
```

## Features Demonstrated

All examples showcase:

- Loading and displaying panorama images
- Mouse drag controls (desktop)
- Touch controls (mobile)
- Zoom with mouse wheel or pinch gestures
- Auto-rotation toggle
- Reset camera position
- Gyroscope controls (mobile devices)
- Dynamic image loading

## Notes

- Make sure to build the packages first: `pnpm build` from the root directory
- For gyroscope to work on iOS 13+, the app must be served over HTTPS and the user must grant permission
- The examples use placeholder panorama images from the Three.js repository


