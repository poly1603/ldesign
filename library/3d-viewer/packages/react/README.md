# @panorama-viewer/react

React component wrapper for the panorama viewer.

## Installation

```bash
npm install @panorama-viewer/react three
```

## Usage

### Basic Usage

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

### With Ref and Methods

```jsx
import { useRef } from 'react';
import { PanoramaViewer } from '@panorama-viewer/react';

function App() {
  const viewerRef = useRef();

  const handleReset = () => {
    viewerRef.current?.reset();
  };

  const handleEnableGyro = async () => {
    const success = await viewerRef.current?.enableGyroscope();
    console.log('Gyroscope enabled:', success);
  };

  return (
    <div>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleEnableGyro}>Enable Gyroscope</button>
      
      <PanoramaViewer
        ref={viewerRef}
        image="panorama.jpg"
        autoRotate={false}
        onReady={() => console.log('Ready!')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `string` | **required** | Panorama image URL |
| `fov` | `number` | `75` | Field of view |
| `minFov` | `number` | `30` | Minimum FOV |
| `maxFov` | `number` | `100` | Maximum FOV |
| `autoRotate` | `boolean` | `false` | Auto rotation |
| `autoRotateSpeed` | `number` | `0.5` | Rotation speed |
| `gyroscope` | `boolean` | `true` | Enable gyroscope |
| `width` | `string \| number` | `'100%'` | Container width |
| `height` | `string \| number` | `'500px'` | Container height |
| `className` | `string` | - | CSS class name |
| `style` | `CSSProperties` | - | Inline styles |
| `onReady` | `() => void` | - | Ready callback |
| `onError` | `(error: Error) => void` | - | Error callback |

## Ref Methods

Access these methods using refs:

```typescript
interface PanoramaViewerRef {
  loadImage(url: string): Promise<void>;
  reset(): void;
  enableAutoRotate(): void;
  disableAutoRotate(): void;
  enableGyroscope(): Promise<boolean>;
  disableGyroscope(): void;
  getRotation(): { x: number; y: number; z: number };
  setRotation(x: number, y: number, z: number): void;
}
```

## TypeScript

Full TypeScript support is included:

```tsx
import { PanoramaViewer, PanoramaViewerRef } from '@panorama-viewer/react';
```

## License

MIT


