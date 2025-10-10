---
layout: home

hero:
  name: "@ldesign/cropper"
  text: "Powerful Image Cropper"
  tagline: A flexible image cropper library that works with any framework - PC, tablet, and mobile
  image:
    src: /hero.svg
    alt: "@ldesign/cropper"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/ldesign/cropper

features:
  - icon: 🖼️
    title: Universal Support
    details: Works seamlessly on PC, tablets, and mobile devices with full touch and mouse support

  - icon: 🎯
    title: Touch & Gestures
    details: Native support for touch events, pinch-to-zoom, and multi-touch gestures

  - icon: 🎨
    title: Rich Configuration
    details: Highly customizable with extensive options for every use case

  - icon: 🔧
    title: Framework Agnostic
    details: Use with Vue, React, Angular, or vanilla JavaScript

  - icon: 📦
    title: Lightweight
    details: Tree-shakeable with minimal dependencies and small bundle size

  - icon: 🚀
    title: High Performance
    details: Optimized for smooth interactions with requestAnimationFrame

  - icon: 🎭
    title: Extensible
    details: Plugin system for custom features and behaviors

  - icon: 📱
    title: Responsive
    details: Automatically adapts to different screen sizes

  - icon: ♿
    title: Accessible
    details: ARIA-compliant for screen readers and keyboard navigation

  - icon: 🌍
    title: TypeScript
    details: Full TypeScript support with complete type definitions

  - icon: 🔒
    title: Reliable
    details: Comprehensive test coverage and battle-tested

  - icon: 📚
    title: Well Documented
    details: Extensive documentation with live examples
---

## Quick Start

### Installation

::: code-group

```bash [npm]
npm install @ldesign/cropper
```

```bash [yarn]
yarn add @ldesign/cropper
```

```bash [pnpm]
pnpm add @ldesign/cropper
```

:::

### Basic Usage

::: code-group

```javascript [Vanilla JS]
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9,
  viewMode: 1
})

// Get cropped image
const canvas = cropper.getCroppedCanvas()
```

```vue [Vue 3]
<template>
  <Cropper
    :src="imageSrc"
    :aspect-ratio="16 / 9"
    @ready="onReady"
    @crop="onCrop"
  />
</template>

<script setup>
import { Cropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')
</script>
```

```jsx [React]
import { Cropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  return (
    <Cropper
      src="path/to/image.jpg"
      aspectRatio={16 / 9}
      onReady={(cropper) => console.log('Ready', cropper)}
    />
  )
}
```

```typescript [Angular]
import { AngularCropperModule } from '@ldesign/cropper/angular'
import '@ldesign/cropper/style.css'

@Component({
  template: `
    <ldesign-cropper
      [src]="imageSrc"
      [aspectRatio]="16 / 9"
      (ready)="onReady($event)"
    ></ldesign-cropper>
  `
})
export class AppComponent {
  imageSrc = 'path/to/image.jpg'
}
```

:::

## Why @ldesign/cropper?

- **Universal**: Works on any device - desktop, tablet, or mobile
- **Framework Flexible**: Use with your favorite framework or vanilla JS
- **Feature Rich**: Crop, rotate, zoom, flip, and more
- **Developer Friendly**: Intuitive API with TypeScript support
- **Production Ready**: Battle-tested and actively maintained

## Community

- [GitHub Discussions](https://github.com/ldesign/cropper/discussions)
- [Issue Tracker](https://github.com/ldesign/cropper/issues)
- [Contributing Guide](https://github.com/ldesign/cropper/blob/main/CONTRIBUTING.md)

## License

[MIT License](https://github.com/ldesign/cropper/blob/main/LICENSE) © 2025-present ldesign
