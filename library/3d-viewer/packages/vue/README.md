# @panorama-viewer/vue

Vue 3 component wrapper for the panorama viewer.

## Installation

```bash
npm install @panorama-viewer/vue three
```

## Usage

### Basic Usage

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

### With Methods

```vue
<template>
  <div>
    <button @click="reset">Reset</button>
    <button @click="enableGyro">Enable Gyroscope</button>
    
    <PanoramaViewer
      ref="viewer"
      :image="currentImage"
      :auto-rotate="autoRotate"
      @ready="onReady"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PanoramaViewer } from '@panorama-viewer/vue';

const viewer = ref();
const autoRotate = ref(false);
const currentImage = ref('panorama.jpg');

const reset = () => {
  viewer.value?.reset();
};

const enableGyro = async () => {
  const success = await viewer.value?.enableGyroscope();
  console.log('Gyroscope enabled:', success);
};

const onReady = () => {
  console.log('Viewer ready!');
};

const onError = (error) => {
  console.error('Error:', error);
};
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `String` | **required** | Panorama image URL |
| `fov` | `Number` | `75` | Field of view |
| `minFov` | `Number` | `30` | Minimum FOV |
| `maxFov` | `Number` | `100` | Maximum FOV |
| `autoRotate` | `Boolean` | `false` | Auto rotation |
| `autoRotateSpeed` | `Number` | `0.5` | Rotation speed |
| `gyroscope` | `Boolean` | `true` | Enable gyroscope |
| `width` | `String` | `'100%'` | Container width |
| `height` | `String` | `'500px'` | Container height |

## Events

- `@ready` - Emitted when viewer is initialized
- `@error` - Emitted when an error occurs

## Exposed Methods

Access these methods using template refs:

- `loadImage(url: string)`
- `reset()`
- `enableAutoRotate()`
- `disableAutoRotate()`
- `enableGyroscope()`
- `disableGyroscope()`
- `getRotation()`
- `setRotation(x, y, z)`

## License

MIT


