# 🎨 LDesign Progress

A modern, flexible, and feature-rich progress bar plugin that works with any framework. Support multiple shapes, dual rendering methods (Canvas & SVG), rich animations, and stunning visual effects.

[![npm version](https://img.shields.io/npm/v/@ldesign/progress.svg)](https://www.npmjs.com/package/@ldesign/progress)
[![license](https://img.shields.io/npm/l/@ldesign/progress.svg)](https://github.com/ldesign/progress/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

> What's New (recent):
>
> - Linear buffer track (showBuffer, buffer, bufferColor)
> - Circular Steps and dashboard-like Ticks for SVG and Canvas
> - SSR/test friendly animations via raf/caf wrappers; auto pause on page hidden
> - Better a11y with role="progressbar" and ARIA attributes

- 🎯 **Multiple Shapes**: Linear, circular, semicircle, and custom image-based shapes
- 🎨 **Dual Rendering**: Both Canvas and SVG rendering support  
- 🌈 **Rich Effects**: Stripes, waves, glow, gradients, shadows, and more
- 🎬 **Smooth Animations**: 30+ built-in easing functions with advanced controls
- 📱 **Responsive**: Automatically adapts to container size
- 🔧 **Highly Customizable**: Extensive configuration options with live updates
- 📦 **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JS
- 💪 **TypeScript Support**: Full type definitions included
- 🎭 **Modern Design**: Beautiful out-of-the-box styles
- ⚡ **High Performance**: Optimized rendering with requestAnimationFrame
- 🎮 **Interactive**: Click, hover, and custom event handlers
- 🔄 **State Management**: Play, pause, resume, and loop animations
- 📏 **Size Presets**: Small, medium, large, and extra-large sizes
- 🎨 **Status Themes**: Success, warning, error, loading, and normal states
- 📝 **Rich Text Formatting**: Multiple built-in formatters for different use cases
- 🎮 **Dynamic Control**: Change status, size, and appearance at runtime

## 📦 Installation

```bash
npm install @ldesign/progress
```

or

```bash
yarn add @ldesign/progress
```

or

```bash
pnpm add @ldesign/progress
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { createLinearProgress } from '@ldesign/progress';

// Create a simple progress bar
const progress = createLinearProgress({
  container: '#my-progress',
  value: 0,
  max: 100
});

// Update the progress
progress.setValue(75);
```

### HTML

```html
<div id="my-progress"></div>
```

## 🎆 Live Demos

- 📊 [Complete Demo](./demo/complete.html) - All features showcase
- 📋 [Linear Progress](./demo/index.html) - Linear progress examples  
- ⭕ [Circular Progress](./demo/circular.html) - Circular progress examples

## 🎥 Quick Examples

### Semicircle Progress

### Linear Buffer (New)

### Spring Easing (New)
```ts
import { LinearProgress } from '@ldesign/progress'
const lp = new LinearProgress({
  container: '#spring',
  renderType: 'svg',
  animation: { duration: 600, easing: 'spring' },
})
// animate to 80%
lp.setProgress(0.8, true)
```
```ts
import { LinearProgress } from '@ldesign/progress'
const bar = new LinearProgress({
  container: '#bar',
  renderType: 'svg',
  showBuffer: true,
  buffer: 0.6,
  progressColor: '#165DFF'
})
// Later
bar.setBuffer(0.8)
bar.setBufferValue(50)
```

### Circular Steps + Ticks (New)
```ts
import { CircularProgress } from '@ldesign/progress'
const ring = new CircularProgress({
  container: '#ring',
  renderType: 'svg',
  steps: { enabled: true, count: 12, gap: 4, progressColor: '#165DFF' },
  ticks: { enabled: true, count: 12, length: 6, width: 2, color: '#666', inside: true },
  strokeWidth: 8,
  startAngle: -90,
  endAngle: 270
})
ring.setProgress(0.75, true)
```
```javascript
const semicircle = createSemicircleProgress({
  container: '#semicircle',
  value: 75,
  orientation: 'top', // 'top', 'bottom', 'left', 'right'
  radius: 80,
  strokeWidth: 12,
  progressColor: '#ff6b6b'
});
```

### Custom Shape Progress
```javascript
const heart = createCustomProgress({
  container: '#heart',
  path: 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5...', // Heart SVG path
  fillDirection: 'vertical',
  progressColor: '#e91e63'
});
```

### Size Presets

```javascript
import { createLinearProgress } from '@ldesign/progress';

// Small size
const smallProgress = createLinearProgress({
  container: '#small-progress',
  size: 'small',
  value: 60
});

// Large circular progress
const largeCircular = createCircularProgress({
  container: '#large-circular',
  size: 'large',
  value: 80
});
```

### Status Themes

```javascript
import { createLinearProgress } from '@ldesign/progress';

// Success status
const successProgress = createLinearProgress({
  container: '#success-progress',
  status: 'success',
  value: 100
});

// Error status
const errorProgress = createLinearProgress({
  container: '#error-progress',
  status: 'error',
  value: 25
});

// Dynamic status change
successProgress.setLoading();
setTimeout(() => successProgress.setSuccess(), 2000);
```

### Text Formatting

```javascript
import { createLinearProgress, TextFormatters } from '@ldesign/progress';

// Built-in formatters
const progress = createLinearProgress({
  container: '#formatted-progress',
  value: 75,
  text: {
    enabled: true,
    format: TextFormatters.percentage // "75%"
  }
});

// Custom formatter
const customProgress = createLinearProgress({
  container: '#custom-progress',
  value: 60,
  text: {
    enabled: true,
    format: (value) => `${value.toFixed(1)}% Complete`
  }
});
```

## 📖 API Documentation

### Creating Progress Bars

#### Linear Progress

```javascript
import { createLinearProgress } from '@ldesign/progress';

const progress = createLinearProgress({
  container: '#progress',
  value: 50,
  width: 400,
  height: 20,
  renderType: 'canvas', // or 'svg'
  progressColor: '#3f51b5',
  backgroundColor: '#e0e0e0'
});
```

### Configuration Options

#### Base Options (All Progress Types)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string \| HTMLElement` | **required** | Container element or selector |
| `renderType` | `'canvas' \| 'svg'` | `'canvas'` | Rendering method |
| `value` | `number` | `0` | Current value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `width` | `number` | `300` | Width in pixels |
| `height` | `number` | `20` | Height in pixels |
| `backgroundColor` | `string \| Gradient` | `'#e0e0e0'` | Background color |
| `progressColor` | `string \| Gradient` | `'#3f51b5'` | Progress bar color |
| `rounded` | `boolean` | `false` | Rounded ends |
| `borderRadius` | `number` | `0` | Border radius in pixels |
| `padding` | `number` | `0` | Internal padding |
| `shadow` | `boolean` | `false` | Enable shadow |
| `responsive` | `boolean` | `true` | Auto-resize with container |

#### Animation Options

```javascript
{
  animation: {
    duration: 500,        // Animation duration in ms
    easing: 'easeInOut', // Easing function
    delay: 0,            // Start delay in ms
    loop: false,         // Loop animation
    yoyo: false          // Reverse animation
  }
}
```

#### Visual Effects

```javascript
{
  // Stripe effect
  stripe: {
    enabled: true,
    width: 10,
    gap: 10,
    angle: 45,
    color: 'rgba(255, 255, 255, 0.2)',
    animated: true,
    animationSpeed: 1
  },
  
  // Wave effect
  wave: {
    enabled: true,
    amplitude: 10,
    frequency: 1,
    speed: 1,
    color: 'rgba(255, 255, 255, 0.3)'
  },
  
  // Glow effect
  glow: {
    enabled: true,
    color: '#3f51b5',
    blur: 10,
    pulse: true,
    pulseSpeed: 1
  },
  
  // Progress text
  text: {
    enabled: true,
    format: (value, total) => `${Math.round(value)}%`,
    fontSize: 14,
    color: '#333',
    position: 'center' // 'center', 'start', 'end', 'follow'
  }
}
```

#### Gradients

```javascript
{
  progressColor: {
    type: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ]
  }
}
```

### Methods

| Method | Description |
|--------|-------------|
| `getValue()` | Get current value |
| `setValue(value, animate?)` | Set value with optional animation |
| `getProgress()` | Get progress percentage (0-1) |
| `setProgress(progress, animate?)` | Set progress percentage |
| `increment(amount?, animate?)` | Increment value |
| `decrement(amount?, animate?)` | Decrement value |
| `reset(animate?)` | Reset to minimum value |
| `complete(animate?)` | Set to maximum value |
| `start()` | Start animation to max |
| `stop()` | Stop current animation |
| `pause()` | Pause animation |
| `resume()` | Resume paused animation |
| `destroy()` | Destroy and cleanup |
| `updateOptions(options)` | Update configuration |
| `resize()` | Force resize |

### Events

```javascript
// Listen to events
progress.on('valueChange', (value, progress) => {
  console.log(`Value: ${value}, Progress: ${progress}`);
});

progress.on('animationStart', () => {
  console.log('Animation started');
});

progress.on('animationEnd', () => {
  console.log('Animation completed');
});

// Remove event listener
progress.off('valueChange', handler);
```

Available events:
- `valueChange` - Value changed
- `progressChange` - Progress percentage changed
- `animationStart` - Animation started
- `animationEnd` - Animation completed
- `animationPause` - Animation paused
- `animationResume` - Animation resumed
- `click` - Progress bar clicked
- `hover` - Mouse hover
- `destroy` - Progress bar destroyed

## 🎨 Examples

### Linear Progress with Gradient and Effects

```javascript
const fancyProgress = createLinearProgress({
  container: '#fancy-progress',
  value: 0,
  width: 500,
  height: 30,
  progressColor: {
    type: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#FF6B6B' },
      { offset: 0.5, color: '#4ECDC4' },
      { offset: 1, color: '#45B7D1' }
    ]
  },
  stripe: {
    enabled: true,
    animated: true
  },
  glow: {
    enabled: true,
    pulse: true
  },
  wave: {
    enabled: true
  },
  text: {
    enabled: true,
    format: (value) => `${Math.round(value)}% Complete`
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutElastic'
  }
});

// Animate to 100%
fancyProgress.start();
```

### Segmented Progress Bar

```javascript
const stepProgress = createLinearProgress({
  container: '#step-progress',
  segments: 5,
  segmentGap: 4,
  value: 60, // Will fill 3 out of 5 segments
  rounded: true,
  progressColor: '#4caf50'
});
```

### Vertical Progress

```javascript
const verticalProgress = createLinearProgress({
  container: '#vertical-progress',
  orientation: 'vertical',
  width: 40,
  height: 200,
  value: 75,
  progressColor: '#ff9800',
  wave: {
    enabled: true,
    amplitude: 5
  }
});
```

### Indeterminate Loading State

```javascript
const loading = createLinearProgress({
  container: '#loading',
  indeterminate: true,
  progressColor: '#2196f3',
  height: 4
});
```

## 🎯 Use Cases

- **File Upload Progress**: Show upload percentage with text
- **Multi-Step Forms**: Use segmented progress for form steps
- **Loading States**: Indeterminate progress for unknown duration
- **Data Visualization**: Display statistics and metrics
- **Game UI**: Health bars, experience bars, skill cooldowns
- **Media Players**: Video/audio playback progress
- **Installation Wizards**: Step-by-step progress indication

## 🛠️ Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';
import { createLinearProgress } from '@ldesign/progress';

function ProgressBar({ value, ...options }) {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && !progressRef.current) {
      progressRef.current = createLinearProgress({
        container: containerRef.current,
        ...options
      });
    }
    
    return () => {
      progressRef.current?.destroy();
    };
  }, []);
  
  useEffect(() => {
    progressRef.current?.setValue(value);
  }, [value]);
  
  return <div ref={containerRef} />;
}
```

### Vue 3

```vue
<template>
  <div ref="progressContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createLinearProgress } from '@ldesign/progress';

const props = defineProps(['value', 'options']);
const progressContainer = ref(null);
let progressInstance = null;

onMounted(() => {
  progressInstance = createLinearProgress({
    container: progressContainer.value,
    ...props.options
  });
});

watch(() => props.value, (newValue) => {
  progressInstance?.setValue(newValue);
});

onUnmounted(() => {
  progressInstance?.destroy();
});
</script>
```

## 🔧 Building from Source

```bash
# Clone repository
git clone https://github.com/ldesign/progress.git
cd progress

# Install dependencies
npm install

# Build library
npm run build

# Run demo
npm run demo
```

## 📝 License

MIT © LDesign Team

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please [create an issue](https://github.com/ldesign/progress/issues) with a detailed description and reproduction steps.

## 💖 Support

If you like this project, please give it a ⭐ on [GitHub](https://github.com/ldesign/progress)!

---

Made with ❤️ by LDesign Team
