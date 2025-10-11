---
layout: home

hero:
  name: "@ldesign/lottie"
  text: "Powerful Lottie Manager"
  tagline: Feature-rich Lottie animation manager for any framework
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/ldesign/lottie
  image:
    src: /hero-image.svg
    alt: Lottie

features:
  - icon: 🎯
    title: Framework Agnostic
    details: Works seamlessly with Vanilla JS, Vue, React, and any other framework

  - icon: ⚡️
    title: High Performance
    details: Built-in instance pooling, caching, and performance monitoring

  - icon: 🎨
    title: Rich Features
    details: Extensive configuration options, event system, and playback controls

  - icon: 📦
    title: Small Bundle Size
    details: Tree-shakeable, optimized build with minimal dependencies

  - icon: 🔧
    title: Developer Friendly
    details: Full TypeScript support with comprehensive type definitions

  - icon: 📊
    title: Performance Monitoring
    details: Real-time FPS, memory usage, and performance metrics tracking
---

## Quick Example

::: code-group
```typescript [Vanilla JS]
import { createLottie } from '@ldesign/lottie'

const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loop: true,
  autoplay: true
})

animation.play()
```

```vue [Vue]
<script setup>
import { useLottie } from '@ldesign/lottie/vue'

const { play, pause, stop } = useLottie({
  container: ref(null),
  path: 'animation.json',
  loop: true
})
</script>

<template>
  <div ref="container" />
  <button @click="play">Play</button>
</template>
```

```tsx [React]
import { Lottie } from '@ldesign/lottie/react'

function App() {
  return (
    <Lottie
      path="animation.json"
      loop
      autoplay
      style={{ width: 300, height: 300 }}
    />
  )
}
```
:::

## Why Choose @ldesign/lottie?

### 🎯 Enterprise Ready

Built for production with comprehensive error handling, performance optimization, and memory management.

### 🔌 Easy Integration

Simple, intuitive API that works with your existing tech stack. No complex setup required.

### 📈 Performance Focused

Advanced features like instance pooling, lazy loading, and automatic quality degradation ensure optimal performance.

### 🛠️ Flexible Configuration

Fine-grained control over every aspect of your animations with sensible defaults.

## Installation

::: code-group
```bash [npm]
npm install @ldesign/lottie
```

```bash [yarn]
yarn add @ldesign/lottie
```

```bash [pnpm]
pnpm add @ldesign/lottie
```
:::

## Community

Join our community and get help with your projects:

- [GitHub Discussions](https://github.com/ldesign/lottie/discussions)
- [Discord](https://discord.gg/ldesign)
- [Twitter](https://twitter.com/ldesign)

## License

[MIT License](https://opensource.org/licenses/MIT) © 2024-present LDesign Team
