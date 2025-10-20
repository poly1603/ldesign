# Project Summary: 3D Panorama Viewer

## Overview

A production-ready, cross-framework 3D panorama image viewer library built with Three.js and TypeScript. The project provides a framework-agnostic core library with ready-to-use wrappers for Vue 3, React, and Lit.

## Architecture

### Monorepo Structure

The project uses a **pnpm workspace** monorepo architecture with the following benefits:

- **Shared dependencies** - Reduce duplication and ensure version consistency
- **Atomic builds** - Build all packages with a single command
- **Easy local development** - Test changes across packages immediately
- **Isolated packages** - Each package can be published independently

### Package Organization

```
3d-viewer/
├── packages/
│   ├── core/       # Framework-agnostic core (Three.js wrapper)
│   ├── vue/        # Vue 3 component
│   ├── react/      # React component
│   └── lit/        # Lit Web Component
└── examples/
    ├── vue-demo/   # Vue example app
    ├── react-demo/ # React example app
    └── lit-demo/   # Lit example app
```

## Technical Stack

### Core Technologies

- **Three.js** - 3D graphics rendering engine
- **TypeScript** - Type-safe development
- **Rollup** - Module bundler for optimal output
- **pnpm** - Fast, efficient package manager

### Framework Support

- **Vue 3** - Composition API, reactive props, template refs
- **React** - Hooks, forwardRef, TypeScript support
- **Lit** - Web Components, decorators, reactive properties
- **Vanilla JS** - Direct core library usage

## Key Features

### Rendering & Display

- ✅ Equirectangular panorama image support
- ✅ WebGL-based rendering via Three.js
- ✅ Responsive viewport handling
- ✅ Automatic resource cleanup

### Controls

- ✅ **Desktop**: Mouse drag rotation, wheel zoom
- ✅ **Mobile**: Touch drag, pinch zoom
- ✅ **Gyroscope**: Device orientation (with iOS 13+ permission handling)
- ✅ **Keyboard**: Potential for future implementation

### Interaction Features

- ✅ Auto-rotation with configurable speed
- ✅ Field of view (zoom) limits
- ✅ Inertial damping for smooth movement
- ✅ Camera position reset

### Developer Experience

- ✅ Full TypeScript support
- ✅ Comprehensive API documentation
- ✅ Working examples for each framework
- ✅ Tree-shakeable exports
- ✅ ESM and CommonJS builds

## Implementation Details

### Core Package (`@panorama-viewer/core`)

**Main Components:**

1. **PanoramaViewer** (`src/PanoramaViewer.ts`)
   - Initializes Three.js scene, camera, renderer
   - Creates inverted sphere geometry for inside viewing
   - Manages texture loading and application
   - Handles render loop with requestAnimationFrame
   - Provides public API for control

2. **TouchControls** (`src/controls/TouchControls.ts`)
   - Single-finger drag for rotation
   - Two-finger pinch for zoom
   - Inertial damping for smooth motion
   - Event handling for touch devices

3. **GyroscopeControls** (`src/controls/GyroscopeControls.ts`)
   - DeviceOrientationEvent integration
   - iOS 13+ permission request handling
   - Screen orientation compensation
   - Quaternion-based rotation

4. **Utilities**
   - WebGL support detection
   - Type definitions

**Build Output:**

- `dist/index.esm.js` - ES Module
- `dist/index.cjs.js` - CommonJS
- `dist/index.d.ts` - TypeScript definitions

### Framework Wrappers

Each wrapper follows framework best practices:

**Vue 3** (`@panorama-viewer/vue`)
- Single File Component (.vue)
- Composition API with `<script setup>`
- Reactive props with watchers
- `defineExpose()` for method access
- Scoped styles

**React** (`@panorama-viewer/react`)
- Functional component with hooks
- `forwardRef` for imperative API
- `useImperativeHandle` for methods
- TypeScript prop types
- Effect cleanup on unmount

**Lit** (`@panorama-viewer/lit`)
- Custom element with decorators
- Reactive properties
- Lifecycle hooks
- Shadow DOM encapsulation
- Event dispatching

## Build System

### Rollup Configuration

Each package uses Rollup with:

- **Input**: TypeScript source files
- **Output**: ESM + CJS formats
- **Externals**: Framework dependencies and Three.js
- **Plugins**:
  - `@rollup/plugin-typescript` - TypeScript compilation
  - `@rollup/plugin-node-resolve` - Module resolution
  - `rollup-plugin-dts` - Type definition bundling
  - `rollup-plugin-vue` - Vue SFC compilation (Vue package only)

### Build Process

1. Core package builds first (dependency of wrappers)
2. Framework wrappers can build in parallel
3. Examples reference workspace packages via `workspace:*`

## Usage Patterns

### Basic Usage

```javascript
// Core
const viewer = new PanoramaViewer({ container, image });

// Vue
<PanoramaViewer :image="url" />

// React
<PanoramaViewer image={url} />

// Lit
<panorama-viewer image="url"></panorama-viewer>
```

### Advanced Usage

```javascript
// Method access
const viewerRef = useRef();
viewerRef.current?.reset();
await viewerRef.current?.enableGyroscope();

// Event handling
<PanoramaViewer 
  @ready="onReady"
  @error="onError"
/>
```

## Performance Considerations

### Optimizations

- **Lazy texture loading** - Images load asynchronously
- **Efficient render loop** - Only renders when needed
- **Resource disposal** - Proper cleanup prevents memory leaks
- **Damping** - Reduces unnecessary calculations

### Bundle Sizes (Estimated)

- Core: ~15-20 KB (minified + gzipped)
- Vue wrapper: ~2-3 KB
- React wrapper: ~2-3 KB
- Lit wrapper: ~2-3 KB

*Note: Three.js (~150 KB) is a peer dependency*

## Browser Compatibility

- **Modern browsers** with WebGL support
- **Mobile browsers** with touch events
- **iOS Safari** 13+ (with gyroscope permission)
- **Android Chrome** (full support)

## Future Enhancements

### Potential Features

- Multiple panorama formats (cubemap, fisheye)
- VR mode support
- Hotspot/annotation system
- Video panorama support
- Custom controls overlay
- Progressive loading for large images
- Transition effects between panoramas

### Potential Improvements

- Unit tests (Jest + Testing Library)
- E2E tests (Playwright)
- Performance benchmarks
- CDN deployment
- NPM package publishing
- CI/CD pipeline
- Storybook documentation

## Development Workflow

### Quick Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:vue

# Run examples
pnpm dev:vue
pnpm dev:react
pnpm dev:lit

# Clean builds
pnpm clean
```

### Development Tips

1. **Always build core first** when making core changes
2. **Use examples for testing** - Quick feedback loop
3. **Check all frameworks** - Ensure cross-framework compatibility
4. **Update types** - Keep TypeScript definitions current
5. **Document changes** - Update README files

## Publishing

### Pre-publish Checklist

- [ ] All packages build successfully
- [ ] Examples work correctly
- [ ] Version numbers updated
- [ ] CHANGELOG updated
- [ ] README files current
- [ ] License information correct

### Publish Commands

```bash
# Publish specific package
cd packages/core
npm publish

# Publish all packages (with Lerna or manual)
pnpm -r --filter './packages/*' publish
```

## License

MIT License - See LICENSE file for details

## Summary

This project demonstrates modern JavaScript/TypeScript library development with:

- Clean architecture and separation of concerns
- Cross-framework compatibility
- Comprehensive TypeScript support
- Production-ready build system
- Developer-friendly examples
- Complete documentation

The modular monorepo structure allows users to adopt only what they need while maintaining consistency across all framework implementations.


