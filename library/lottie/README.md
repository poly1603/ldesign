# README

# @ldesign/lottie

A powerful, feature-rich Lottie animation manager for any framework.

[![npm version](https://img.shields.io/npm/v/@ldesign/lottie.svg)](https://www.npmjs.com/package/@ldesign/lottie)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Framework Agnostic** - Vue 3, React, Web Components, Vanilla JS
- 🎨 **16种使用方式** - Composable, Hook, 组件, 指令, Web Components
- ⚡️ **极致性能** - Web Worker, 虚拟化渲染, 批量渲染, 自适应帧率
- 💾 **智能内存管理** - 自动监控, 压力检测, 自动清理
- 📦 **Tree-shakeable** - 按需加载, 优化包体积
- 🔧 **TypeScript** - 完整类型定义, 智能提示
- 📊 **Performance Monitoring** - 实时性能追踪和优化建议

## 📦 Installation

```bash
npm install @ldesign/lottie
```

## 🚀 Quick Start

### Vanilla JavaScript

```typescript
import { createLottie } from '@ldesign/lottie'

const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loop: true,
  autoplay: true
})

animation.play()
```

### Vue 3 (9种用法)

```vue
<!-- Composable -->
<script setup>
import { useLottie } from '@ldesign/lottie/vue'
const { play, pause } = useLottie({ container: ref(null), path: 'animation.json' })
</script>

<!-- 组件 -->
<LottieAnimation path="animation.json" :loop="true" :autoplay="true" />
<LottiePlayer path="animation.json" :showControls="true" />

<!-- 指令 -->
<div v-lottie="'animation.json'" />
<div v-lottie-hover="'animation.json'" />
<div v-lottie-scroll="'animation.json'" />
```

### React (5种用法)

```tsx
// Hook
import { useLottie } from '@ldesign/lottie/react'
const { containerRef, play, pause } = useLottie({ path: 'animation.json' })

// 组件
import { LottieAnimation, LottiePlayer } from '@ldesign/lottie/react'
<LottieAnimation path="animation.json" loop autoplay />
<LottiePlayer path="animation.json" showControls />

// Context
import { LottieProvider, useLottieContext } from '@ldesign/lottie/react'
```

### Web Components (框架无关)

```html
<!-- 可在任何框架中使用 -->
<lottie-animation src="animation.json" loop="true" autoplay="true"></lottie-animation>
<lottie-player src="animation.json" controls="true"></lottie-player>

<script>
  document.querySelector('lottie-animation').play()
</script>
```

## 📚 Documentation

Full documentation is available at [docs site](#).

### Core Concepts

- [Introduction](./docs/guide/introduction.md)
- [Installation](./docs/guide/installation.md)
- [Quick Start](./docs/guide/quick-start.md)
- [Configuration](./docs/guide/configuration.md)
- [API Reference](./docs/api/core.md)

### Framework Integration

- [Vanilla JS](./docs/guide/vanilla.md)
- [Vue](./docs/guide/vue.md)
- [React](./docs/guide/react.md)

## 🎯 Examples

Check out the [examples](./examples) directory for working examples:

- [Vanilla JS Example](./examples/vanilla)
- [Vue Example](./examples/vue)
- [React Example](./examples/react)

## 🔥 Key Features

### Animation Sequence

Play multiple animations in sequence with custom timing:

```typescript
import { AnimationSequence } from '@ldesign/lottie'

const sequence = new AnimationSequence()
sequence
  .add({ config: { container: '#anim1', path: 'step1.json' }, delay: 0 })
  .add({ config: { container: '#anim2', path: 'step2.json' }, delay: 500 })
  .add({ config: { container: '#anim3', path: 'step3.json' }, delay: 500 })

await sequence.play()
```

### Interactive Animations

Add mouse and scroll interactions:

```typescript
import { createLottie, InteractiveController } from '@ldesign/lottie'

const animation = createLottie({ /* config */ })

// Click to play/pause
new InteractiveController({
  instance: animation,
  enableClick: true,
  enableHover: true,
  enableDrag: true,
  enableScroll: true
})
```

### Performance Monitoring

```typescript
const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  advanced: {
    enablePerformanceMonitor: true,
    performanceMonitorInterval: 1000
  },
  events: {
    performanceWarning: (metrics) => {
      console.log('FPS:', metrics.fps)
      console.log('Memory:', metrics.memory, 'MB')
    }
  }
})
```

### Instance Management

```typescript
import { lottieManager } from '@ldesign/lottie'

// Create multiple instances
const anim1 = lottieManager.create({ /* config */ })
const anim2 = lottieManager.create({ /* config */ })

// Control all at once
lottieManager.playAll()
lottieManager.pauseAll()

// Get statistics
const stats = lottieManager.getGlobalStats()
console.log('Total instances:', stats.totalInstances)
console.log('Average FPS:', stats.averageFps)
```

### Smart Caching

```typescript
// Animations are automatically cached
await lottieManager.preload('animation.json')

// Later, this loads instantly from cache
const animation = createLottie({
  container: '#lottie',
  path: 'animation.json'
})
```

### Lazy Loading

```typescript
const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loadStrategy: 'intersection', // Load when visible
  advanced: {
    intersectionOptions: {
      threshold: 0.5 // Load when 50% visible
    }
  }
})
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run examples
pnpm example:vanilla
pnpm example:vue
pnpm example:react

# Build documentation
pnpm docs:build
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

[MIT License](./LICENSE) © 2024-present LDesign Team

## 🙏 Acknowledgments

Built on top of the amazing [lottie-web](https://github.com/airbnb/lottie-web) by Airbnb.

## 📮 Links

- [Documentation](#)
- [GitHub](https://github.com/ldesign/lottie)
- [Issues](https://github.com/ldesign/lottie/issues)
- [Changelog](./CHANGELOG.md)
