# @panorama-viewer/core

Core panorama viewer library built with Three.js. Framework-agnostic implementation that can be used with any JavaScript framework or vanilla JS.

## Installation

```bash
npm install @panorama-viewer/core three
```

## Usage

```javascript
import { PanoramaViewer } from '@panorama-viewer/core';

const viewer = new PanoramaViewer({
  container: document.getElementById('viewer'),
  image: 'path/to/panorama.jpg',
  fov: 75,
  autoRotate: true,
});

// Load a new image
await viewer.loadImage('path/to/new-panorama.jpg');

// Reset view
viewer.reset();

// Enable gyroscope (mobile)
await viewer.enableGyroscope();

// Cleanup
viewer.dispose();
```

## API

### Constructor Options

```typescript
interface ViewerOptions {
  container: HTMLElement;        // Required: Container element
  image: string;                 // Required: Panorama image URL
  fov?: number;                  // Field of view (default: 75)
  minFov?: number;               // Min FOV for zoom (default: 30)
  maxFov?: number;               // Max FOV for zoom (default: 100)
  autoRotate?: boolean;          // Enable auto rotation (default: false)
  autoRotateSpeed?: number;      // Rotation speed (default: 0.5)
  gyroscope?: boolean;           // Enable gyroscope (default: true)
  enableDamping?: boolean;       // Enable inertia (default: true)
  dampingFactor?: number;        // Damping factor (default: 0.05)
}
```

### Methods

- `loadImage(url: string): Promise<void>` - Load a new panorama image
- `enableAutoRotate(): void` - Enable auto rotation
- `disableAutoRotate(): void` - Disable auto rotation
- `reset(): void` - Reset camera to initial position
- `enableGyroscope(): Promise<boolean>` - Enable gyroscope controls
- `disableGyroscope(): void` - Disable gyroscope controls
- `getRotation(): { x, y, z }` - Get current camera rotation
- `setRotation(x, y, z): void` - Set camera rotation
- `dispose(): void` - Cleanup and destroy viewer

## License

MIT


