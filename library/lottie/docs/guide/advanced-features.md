# Advanced Features

## Animation Sequence

Play multiple animations in sequence with delays and custom logic.

### Basic Usage

```typescript
import { AnimationSequence } from '@ldesign/lottie'

const sequence = new AnimationSequence()

// Add animations to the sequence
sequence
  .add({
    config: {
      container: '#anim1',
      path: 'loading.json',
      loop: false
    },
    delay: 0,
    onComplete: () => console.log('Animation 1 done')
  })
  .add({
    config: {
      container: '#anim2',
      path: 'success.json',
      loop: false
    },
    delay: 500, // Wait 500ms before starting
    duration: 2000, // Force stop after 2 seconds
    onComplete: () => console.log('Animation 2 done')
  })

// Play the sequence
await sequence.play()
```

### Control Methods

```typescript
// Play the sequence
await sequence.play()

// Pause
sequence.pause()

// Resume
sequence.resume()

// Stop
sequence.stop()

// Jump to specific index
await sequence.goTo(2) // Jump to 3rd animation

// Get current state
const isPlaying = sequence.getIsPlaying()
const isPaused = sequence.getIsPaused()
const current = sequence.getCurrentIndex()
const total = sequence.getLength()
```

### Advanced Configuration

```typescript
const sequence = new AnimationSequence([
  {
    config: { /* config */ },
    delay: 1000,
    duration: 3000, // Auto-stop after 3 seconds
    onComplete: () => {
      // Custom logic when this animation completes
      console.log('Step completed')
    }
  },
  // ... more animations
])

// Batch add
sequence.addMultiple([
  { config: { /* ... */ } },
  { config: { /* ... */ } },
])

// Clean up when done
sequence.destroy()
```

## Interactive Controller

Add mouse and scroll interactions to your animations.

### Click Interaction

Click to toggle play/pause:

```typescript
import { createLottie, InteractiveController } from '@ldesign/lottie'

const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loop: true,
  autoplay: false
})

new InteractiveController({
  instance: animation,
  enableClick: true
})
```

### Hover Interaction

Play on hover, pause when leaving:

```typescript
new InteractiveController({
  instance: animation,
  enableHover: true
})
```

### Drag Control

Scrub through animation by dragging:

```typescript
new InteractiveController({
  instance: animation,
  enableDrag: true
})
```

Track frame changes:

```typescript
animation.on('enterFrame', (e) => {
  console.log(`Frame: ${e.currentTime} / ${e.totalTime}`)
})
```

### Scroll Control

Control animation based on scroll position:

```typescript
const controller = new InteractiveController({
  instance: animation,
  enableScroll: true,
  scrollThreshold: 0.1 // Trigger when 10% visible
})

// Get scroll progress (0-1)
const progress = controller.getScrollProgress()
```

### Multiple Interactions

Combine multiple interaction types:

```typescript
new InteractiveController({
  instance: animation,
  enableClick: true,
  enableHover: true,
  enableScroll: true,
  scrollThreshold: 0.2
})
```

### Cleanup

```typescript
const controller = new InteractiveController({ /* ... */ })

// When done
controller.destroy()
```

## Use Cases

### Loading Sequence

```typescript
const loadingSequence = new AnimationSequence()

loadingSequence
  .add({
    config: {
      container: '#step1',
      path: 'checking.json'
    },
    duration: 2000
  })
  .add({
    config: {
      container: '#step2',
      path: 'loading.json'
    },
    duration: 3000
  })
  .add({
    config: {
      container: '#step3',
      path: 'success.json',
      loop: false
    }
  })

await loadingSequence.play()
```

### Scroll-Triggered Story

```typescript
// Create multiple scroll-controlled animations
const scenes = [
  { container: '#scene1', path: 'intro.json' },
  { container: '#scene2', path: 'action.json' },
  { container: '#scene3', path: 'conclusion.json' },
]

scenes.forEach(scene => {
  const animation = createLottie(scene)
  new InteractiveController({
    instance: animation,
    enableScroll: true,
    scrollThreshold: 0.3
  })
})
```

### Interactive Product Demo

```typescript
const demo = createLottie({
  container: '#product-demo',
  path: 'product.json',
  loop: false,
  autoplay: false
})

// Click to explore different features
new InteractiveController({
  instance: demo,
  enableClick: true
})

// Track which feature is shown
demo.on('enterFrame', (e) => {
  const progress = e.currentTime / e.totalTime
  updateFeatureHighlight(progress)
})
```

### Scroll-Parallax Effect

```typescript
const bgAnimation = createLottie({
  container: '#background',
  path: 'bg-parallax.json',
  loop: false
})

const controller = new InteractiveController({
  instance: bgAnimation,
  enableScroll: true,
  scrollThreshold: 0
})

// Update UI based on scroll
setInterval(() => {
  const progress = controller.getScrollProgress()
  updateParallaxLayers(progress)
}, 16) // 60fps
```

## Performance Tips

### Sequence Performance

```typescript
// Use duration to prevent long-running animations
sequence.add({
  config: { /* ... */ },
  duration: 3000, // Auto-stop after 3s
})

// Clean up when done
sequence.on('complete', () => {
  setTimeout(() => sequence.destroy(), 1000)
})
```

### Interactive Performance

```typescript
// Optimize scroll performance
new InteractiveController({
  instance: animation,
  enableScroll: true,
  scrollThreshold: 0.5 // Only animate when mostly visible
})

// Disable during heavy operations
controller.destroy() // Removes all listeners
```

### Memory Management

```typescript
// Create sequence, use, then clean up
async function playOnboarding() {
  const sequence = new AnimationSequence(/* ... */)
  await sequence.play()
  sequence.destroy() // Free memory
}
```

## See Also

- [Core API](/api/core)
- [Performance Guide](/guide/performance)
- [Examples](/examples/vanilla)
