# Installation

## Package Manager

Install `@ldesign/lottie` using your preferred package manager:

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

## Framework-Specific Installation

### Vue

If you're using Vue, you might want to install Vue as a peer dependency if you haven't already:

```bash
npm install vue@^3.0.0
npm install @ldesign/lottie
```

### React

For React projects:

```bash
npm install react@^18.0.0 react-dom@^18.0.0
npm install @ldesign/lottie
```

## CDN

You can also use a CDN to include the library directly in your HTML:

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/lottie"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/lottie@1.0.0"></script>
```

When using the CDN, the library is available as `LDesignLottie` global variable:

```html
<script>
  const { createLottie } = LDesignLottie

  const animation = createLottie({
    container: '#lottie',
    path: 'animation.json'
  })
</script>
```

## TypeScript

The library includes TypeScript definitions out of the box. No additional `@types` packages are needed.

```typescript
import type { LottieConfig, ILottieInstance } from '@ldesign/lottie'
```

## Imports

### Core Library

```typescript
// Main exports
import {
  createLottie,
  loadLottie,
  loadLottieFromData,
  LottieManager,
  lottieManager
} from '@ldesign/lottie'

// Type exports
import type {
  LottieConfig,
  ILottieInstance,
  AnimationState,
  PerformanceMetrics
} from '@ldesign/lottie'
```

### Vue Adapter

```typescript
// Composables and directives
import { useLottie, vLottie } from '@ldesign/lottie/vue'

// Plugin
import LottiePlugin from '@ldesign/lottie/vue'
```

### React Adapter

```typescript
// Hooks and components
import {
  useLottie,
  Lottie,
  LottieProvider,
  useLottieManager
} from '@ldesign/lottie/react'
```

## Verification

To verify your installation, try creating a simple animation:

```typescript
import { createLottie } from '@ldesign/lottie'

// This should work without errors
const animation = createLottie({
  container: document.getElementById('lottie'),
  animationData: { /* your animation data */ },
  loop: true,
  autoplay: true
})

console.log('Animation created:', animation.id)
```

## Troubleshooting

### Module not found

If you see "Module not found" errors, make sure:

1. The package is properly installed in `node_modules`
2. Your bundler is configured correctly
3. You're using the correct import path

### TypeScript Errors

If you encounter TypeScript errors:

1. Ensure your `tsconfig.json` includes the node_modules
2. Try deleting `node_modules` and reinstalling
3. Update TypeScript to the latest version

### Build Errors

For build errors with various bundlers:

**Vite**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/lottie']
  }
})
```

**Webpack**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  }
}
```

## Next Steps

Now that you have the library installed, head over to the [Quick Start](/guide/quick-start) guide to create your first animation!
