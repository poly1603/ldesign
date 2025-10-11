# 🚀 Lottie Plugin Quick Start

Get started with the Lottie plugin in under 2 minutes!

## 🎯 Try the Demos First

Before integrating, see the plugin in action:

```bash
# Clone and navigate to the lottie directory
cd library/lottie

# Run any example
npm run example:vanilla   # Pure JavaScript
npm run example:react     # React
npm run example:vue       # Vue 3
```

Open your browser to `http://localhost:8080` (or the port shown in terminal).

## 📦 Installation

```bash
npm install @ldesign/lottie
# or
pnpm add @ldesign/lottie
# or
yarn add @ldesign/lottie
```

## 🎨 Basic Usage

### Vanilla JavaScript/TypeScript

```typescript
import { createLottie } from '@ldesign/lottie'

// Create and play an animation
const animation = createLottie({
  container: '#my-animation',
  path: '/path/to/animation.json',
  loop: true,
  autoplay: true
})

// Control the animation
animation.play()
animation.pause()
animation.stop()
```

### React

```tsx
import { useLottie, Lottie } from '@ldesign/lottie/react'

// Method 1: Using the hook
function MyComponent() {
  const { containerRef, play, pause } = useLottie({
    path: '/animation.json',
    loop: true
  })

  return (
    <div>
      <div ref={containerRef} style={{ width: 300, height: 300 }} />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </div>
  )
}

// Method 2: Using the component
function MyComponent() {
  return (
    <Lottie
      path="/animation.json"
      loop={true}
      autoplay={true}
      style={{ width: 300, height: 300 }}
    />
  )
}
```

### Vue 3

```vue
<template>
  <div>
    <div ref="container" style="width: 300px; height: 300px" />
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLottie } from '@ldesign/lottie/vue'

const container = ref()
const { play, pause } = useLottie({
  container,
  path: '/animation.json',
  loop: true
})
</script>
```

## 🎭 Where to Find Animations

1. **[LottieFiles.com](https://lottiefiles.com/)** - Thousands of free animations
2. **Create your own** - Use Adobe After Effects + Bodymovin plugin
3. **Use the examples** - Three animations included in `examples/assets/`

## 💡 Common Use Cases

### Loading Spinner

```typescript
const loader = createLottie({
  container: '#loader',
  path: '/loading.json',
  loop: true,
  autoplay: true
})

// Hide when done
loader.addEventListener('complete', () => {
  loader.destroy()
})
```

### Success Animation

```typescript
const success = createLottie({
  container: '#success',
  path: '/success.json',
  loop: false,
  autoplay: true
})

// Play once and remove
success.addEventListener('complete', () => {
  setTimeout(() => success.destroy(), 500)
})
```

### Interactive Button

```typescript
import { InteractiveController } from '@ldesign/lottie'

const heart = createLottie({
  container: '#heart',
  path: '/heart.json',
  loop: false,
  autoplay: false
})

new InteractiveController({
  instance: heart,
  enableClick: true,  // Click to play
  enableHover: true   // Hover to play
})
```

## 🛠️ Advanced Features

### Animation Sequence

```typescript
import { AnimationSequence } from '@ldesign/lottie'

const sequence = new AnimationSequence()

sequence.add({
  config: { container: '#step1', path: '/anim1.json' },
  delay: 0
})

sequence.add({
  config: { container: '#step2', path: '/anim2.json' },
  delay: 500
})

await sequence.play()  // Plays animations in order
```

### Performance Monitoring

```typescript
import { lottieManager } from '@ldesign/lottie'

const stats = lottieManager.getGlobalStats()
console.log('Active instances:', stats.activeInstances)
console.log('Average FPS:', stats.averageFps)
console.log('Cache hit rate:', stats.cacheHitRate)
```

### Caching

```typescript
import { lottieManager } from '@ldesign/lottie'

// Configure global cache
lottieManager.updateConfig({
  cache: {
    enabled: true,
    maxSize: 50,      // Maximum cached animations
    ttl: 3600000      // 1 hour in milliseconds
  }
})
```

## 🎨 Styling

Animations automatically fill their container. Control size with CSS:

```css
.my-animation {
  width: 400px;
  height: 400px;
}

/* Responsive */
.my-animation {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
}
```

## 🐛 Troubleshooting

### Animation not showing?
- Verify the JSON file path is correct
- Check browser console for errors
- Ensure container element exists when creating animation
- Try calling `animation.play()` manually

### Animation looks wrong?
- Verify JSON file is a valid Lottie animation
- Check the animation's original dimensions
- Try different renderer: `renderer: 'canvas'` or `renderer: 'html'`

### Performance issues?
- Enable caching (see above)
- Reduce animation complexity
- Use SVG renderer for simple animations
- Use Canvas renderer for complex animations

## 📚 Learn More

- **[Full Documentation](./README.md)** - Complete API reference
- **[Usage Guide](./USAGE_GUIDE.md)** - Detailed examples
- **[Examples](./examples/README.md)** - Working demo projects
- **[API Docs](./docs/api/core.md)** - TypeScript API documentation

## 🆘 Need Help?

1. Check the [examples directory](./examples/) for working code
2. Review the [troubleshooting section](./examples/README.md#-troubleshooting)
3. Open an issue on GitHub

## 🎉 You're Ready!

That's it! You now know enough to start using Lottie animations in your project. Explore the examples for more advanced features.

---

**Pro Tip**: Start with the standalone test file (`examples/test-lottie.html`) to quickly verify animations work before integrating into your app!
