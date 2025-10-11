# Quick Start

## Your First Animation

Let's create a simple Lottie animation in just a few lines of code:

```typescript
import { createLottie } from '@ldesign/lottie'

const animation = createLottie({
  container: '#my-animation',
  path: 'https://assets.lottiefiles.com/packages/lf20_example.json',
  loop: true,
  autoplay: true
})
```

That's it! Your animation will load and start playing automatically.

## Basic Example

Here's a complete HTML example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Lottie Animation</title>
  <style>
    #lottie-container {
      width: 400px;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="lottie-container"></div>

  <script type="module">
    import { createLottie } from '@ldesign/lottie'

    const animation = createLottie({
      container: '#lottie-container',
      path: 'animation.json',
      loop: true,
      autoplay: true
    })

    // Control the animation
    document.addEventListener('click', () => {
      if (animation.state === 'playing') {
        animation.pause()
      } else {
        animation.play()
      }
    })
  </script>
</body>
</html>
```

## Common Patterns

### Load from Path

```typescript
import { loadLottie } from '@ldesign/lottie'

const animation = await loadLottie(
  '#container',
  'animation.json',
  {
    loop: true,
    speed: 1.5
  }
)
```

### Load from Data

```typescript
import { loadLottieFromData } from '@ldesign/lottie'

const animationData = {
  v: "5.5.7",
  fr: 60,
  // ... your animation data
}

const animation = loadLottieFromData(
  '#container',
  animationData,
  { loop: false }
)
```

### Using the Manager

```typescript
import { lottieManager } from '@ldesign/lottie'

// Create an instance
const animation = lottieManager.create({
  container: '#container',
  path: 'animation.json',
  name: 'my-animation'
})

await animation.load()

// Get the instance by name later
const same = lottieManager.getByName('my-animation')

// Control all animations
lottieManager.pauseAll()
lottieManager.playAll()
```

## Playback Control

```typescript
const animation = createLottie({ /* config */ })

// Basic controls
animation.play()
animation.pause()
animation.stop()
animation.reset()

// Speed control
animation.setSpeed(2) // 2x speed

// Direction control
animation.setDirection(-1) // Reverse

// Jump to frame
animation.goToAndStop(30, true) // Frame 30
animation.goToAndPlay(50, true)

// Play specific segment
animation.playSegments([30, 60], true)
```

## Event Handling

```typescript
const animation = createLottie({
  container: '#container',
  path: 'animation.json',
  events: {
    complete: () => {
      console.log('Animation completed!')
    },
    loopComplete: () => {
      console.log('Loop completed')
    },
    enterFrame: (e) => {
      console.log('Current frame:', e.currentTime)
    }
  }
})

// Or add listeners later
animation.on('complete', () => {
  console.log('Done!')
})
```

## Next Steps

Now that you've created your first animation, explore more advanced features:

- [Configuration Options](/guide/configuration)
- [Event System](/guide/events)
- [Performance Optimization](/guide/performance)
- [Framework Integration](/guide/vue)
