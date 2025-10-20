# @panorama-viewer/lit

Lit web component wrapper for the panorama viewer.

## Installation

```bash
npm install @panorama-viewer/lit three
```

## Usage

### Basic Usage

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

### With JavaScript

```javascript
import '@panorama-viewer/lit';

const viewer = document.querySelector('panorama-viewer');

// Listen to events
viewer.addEventListener('ready', () => {
  console.log('Viewer ready!');
});

viewer.addEventListener('error', (e) => {
  console.error('Error:', e.detail.error);
});

// Call methods
viewer.reset();
await viewer.enableGyroscope();
```

### In Lit Application

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@panorama-viewer/lit';

@customElement('my-app')
export class MyApp extends LitElement {
  render() {
    return html`
      <panorama-viewer
        image="panorama.jpg"
        auto-rotate
        @ready=${this.handleReady}
        @error=${this.handleError}
      ></panorama-viewer>
    `;
  }

  handleReady() {
    console.log('Ready!');
  }

  handleError(e) {
    console.error(e.detail.error);
  }
}
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `image` | `string` | **required** | Panorama image URL |
| `fov` | `number` | `75` | Field of view |
| `min-fov` | `number` | `30` | Minimum FOV |
| `max-fov` | `number` | `100` | Maximum FOV |
| `auto-rotate` | `boolean` | `false` | Auto rotation |
| `auto-rotate-speed` | `number` | `0.5` | Rotation speed |
| `gyroscope` | `boolean` | `true` | Enable gyroscope |
| `width` | `string` | `'100%'` | Container width |
| `height` | `string` | `'500px'` | Container height |

## Events

- `ready` - Fired when viewer is initialized
- `error` - Fired when error occurs (detail: `{ error }`)

## Methods

Access these methods via JavaScript:

- `loadImage(url: string): Promise<void>`
- `reset(): void`
- `enableAutoRotate(): void`
- `disableAutoRotate(): void`
- `enableGyroscope(): Promise<boolean>`
- `disableGyroscope(): void`
- `getRotation(): { x, y, z }`
- `setRotation(x, y, z): void`

## TypeScript

TypeScript definitions are included:

```typescript
import type { PanoramaViewerElement } from '@panorama-viewer/lit';

const viewer = document.querySelector('panorama-viewer') as PanoramaViewerElement;
```

## License

MIT


