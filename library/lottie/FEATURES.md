# Lottie Plugin 完整功能文档

## 📋 目录

- [基础功能](#基础功能)
- [播放控制](#播放控制)
- [高级控制](#高级控制)
- [性能优化](#性能优化)
- [事件系统](#事件系统)
- [框架集成](#框架集成)
- [最佳实践](#最佳实践)

## 基础功能

### 1. 创建动画

```typescript
import { createLottie } from '@ldesign/lottie'

const animation = createLottie({
  container: '#my-animation',  // 容器选择器或 HTMLElement
  path: '/path/to/animation.json',  // 动画 JSON 文件路径
  loop: true,  // 是否循环
  autoplay: true,  // 是否自动播放
  renderer: 'svg',  // 渲染器: 'svg' | 'canvas' | 'html'
})
```

### 2. 基础播放控制

```typescript
animation.play()   // 播放
animation.pause()  // 暂停
animation.stop()   // 停止
animation.reset()  // 重置到第一帧
```

## 播放控制

### 1. 速度控制

```typescript
// 设置播放速度 (0.1 - 3.0)
animation.setSpeed(2)  // 2倍速
animation.setSpeed(0.5)  // 0.5倍速（慢动作）
```

**示例**：
```typescript
const animation = createLottie({
  container: '#animation',
  path: '/heart.json',
  speed: 1.5  // 初始1.5倍速
})

// 动态调整
document.getElementById('speedSlider').addEventListener('input', (e) => {
  const speed = parseFloat(e.target.value)
  animation.setSpeed(speed)
})
```

### 2. 方向控制

```typescript
// 设置播放方向
animation.setDirection(1)   // 正向播放
animation.setDirection(-1)  // 反向播放

// 切换方向
const currentDir = animation.animation.playDirection
animation.setDirection(currentDir === 1 ? -1 : 1)
```

**示例 - 来回播放**：
```typescript
const animation = createLottie({
  container: '#animation',
  path: '/loading.json',
  playMode: 'bounce'  // 自动来回播放
})
```

### 3. 帧精确控制

```typescript
// 跳转到指定帧并停止
animation.goToAndStop(50, true)  // 跳转到第50帧

// 跳转到指定时间（秒）并停止
animation.goToAndStop(2.5, false)  // 跳转到2.5秒

// 跳转并播放
animation.goToAndPlay(0, true)  // 从第一帧开始播放
```

**示例 - 帧滑块**：
```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  autoplay: false
})

animation.on('data_ready', () => {
  const slider = document.getElementById('frameSlider')
  slider.max = animation.animation.totalFrames - 1
  
  slider.addEventListener('input', (e) => {
    const frame = parseInt(e.target.value)
    animation.goToAndStop(frame, true)
  })
})
```

### 4. 分段播放

```typescript
// 播放第10-50帧
animation.playSegments([10, 50], true)

// 播放多个片段
animation.playSegments([[0, 30], [60, 90]], true)

// forceFlag: true 立即播放，false 等待当前片段结束
```

**示例 - 多阶段动画**：
```typescript
const animation = createLottie({
  container: '#animation',
  path: '/multi-stage.json',
  loop: false
})

// 只播放介绍部分
function playIntro() {
  animation.playSegments([0, 60], true)
}

// 只播放主体部分
function playMain() {
  animation.playSegments([60, 180], true)
}

// 只播放结尾部分
function playOutro() {
  animation.playSegments([180, 240], true)
}
```

## 高级控制

### 1. 渲染器切换

```typescript
// SVG 渲染器（默认）- 最好的质量和灵活性
const svgAnimation = createLottie({
  container: '#animation',
  path: '/animation.json',
  renderer: 'svg'
})

// Canvas 渲染器 - 更好的性能，适合复杂动画
const canvasAnimation = createLottie({
  container: '#animation',
  path: '/complex.json',
  renderer: 'canvas'
})

// HTML 渲染器 - 轻量级，适合简单动画
const htmlAnimation = createLottie({
  container: '#animation',
  path: '/simple.json',
  renderer: 'html'
})
```

**性能对比**：
- **SVG**: 最佳质量，支持所有特性，中等性能
- **Canvas**: 最佳性能，适合复杂动画和粒子效果
- **HTML**: 最轻量，但功能有限

### 2. 质量控制

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  quality: 'high',  // 'low' | 'medium' | 'high' | 'auto'
  advanced: {
    enableAutoDegradation: true,  // 自动降级
    minFps: 30,  // 最低FPS阈值
  }
})
```

### 3. 加载策略

```typescript
// 立即加载（默认）
const eagerAnimation = createLottie({
  container: '#animation',
  path: '/animation.json',
  loadStrategy: 'eager'
})

// 懒加载 - 滚动到可视区域时加载
const lazyAnimation = createLottie({
  container: '#animation',
  path: '/animation.json',
  loadStrategy: 'intersection',
  advanced: {
    intersectionOptions: {
      threshold: 0.1  // 10% 可见时触发
    }
  }
})

// 手动加载
const manualAnimation = createLottie({
  container: '#animation',
  path: '/animation.json',
  loadStrategy: 'lazy',
  autoplay: false
})
// 稍后手动加载
manualAnimation.load().then(() => {
  manualAnimation.play()
})
```

### 4. 自定义加载器

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  advanced: {
    customLoader: async (path) => {
      // 从缓存或其他来源加载
      const cached = localStorage.getItem(path)
      if (cached) {
        return JSON.parse(cached)
      }
      
      const response = await fetch(path)
      const data = await response.json()
      
      // 缓存数据
      localStorage.setItem(path, JSON.stringify(data))
      
      return data
    }
  }
})
```

## 性能优化

### 1. 缓存管理

```typescript
import { lottieManager } from '@ldesign/lottie'

// 配置全局缓存
lottieManager.updateConfig({
  cache: {
    enabled: true,
    maxSize: 50,      // 最多缓存50个动画
    ttl: 3600000      // 缓存1小时
  }
})
```

### 2. 实例池

```typescript
// 启用实例池复用
lottieManager.updateConfig({
  enableInstancePool: true,
  poolSize: 50
})
```

### 3. 性能监控

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  advanced: {
    enablePerformanceMonitor: true,
    performanceMonitorInterval: 1000  // 每秒检查一次
  }
})

// 获取性能指标
const metrics = animation.getMetrics()
console.log('FPS:', metrics.fps)
console.log('Memory:', metrics.memory)
console.log('Dropped Frames:', metrics.droppedFrames)
```

### 4. 自动性能降级

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  quality: 'auto',
  advanced: {
    enableAutoDegradation: true,
    minFps: 30,  // 低于30fps时自动降级
    maxMemory: 100  // 内存超过100MB时降级
  }
})
```

## 事件系统

### 完整事件列表

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json'
})

// 状态事件
animation.on('stateChange', (state) => {
  console.log('State:', state)  // 'idle' | 'loading' | 'loaded' | 'playing' | 'paused' | 'stopped' | 'error'
})

// 数据加载事件
animation.on('data_ready', () => {
  console.log('Animation data loaded')
})

animation.on('data_failed', (error) => {
  console.error('Failed to load:', error)
})

// 播放事件
animation.on('complete', () => {
  console.log('Animation completed')
})

animation.on('loopComplete', () => {
  console.log('Loop completed')
})

// 帧事件
animation.on('enterFrame', (e) => {
  console.log('Current frame:', e.currentTime)
  console.log('Direction:', e.direction)
})

// 片段事件
animation.on('segmentStart', () => {
  console.log('Segment started')
})

// DOM 事件
animation.on('DOMLoaded', () => {
  console.log('DOM elements loaded')
})

// 性能事件
animation.on('performanceWarning', (metrics) => {
  console.warn('Performance issue:', metrics)
})
```

### 配置中的事件

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  events: {
    data_ready: () => console.log('Ready!'),
    complete: () => console.log('Done!'),
    data_failed: (error) => console.error('Error:', error)
  }
})
```

## 框架集成

### React

```tsx
import { useLottie, Lottie } from '@ldesign/lottie/react'

// Hook 方式
function MyComponent() {
  const { containerRef, play, pause, setSpeed } = useLottie({
    path: '/animation.json',
    loop: true,
    autoplay: false
  })

  return (
    <div>
      <div ref={containerRef} style={{ width: 400, height: 400 }} />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <input type="range" onChange={(e) => setSpeed(Number(e.target.value))} />
    </div>
  )
}

// 组件方式
function SimpleComponent() {
  return (
    <Lottie
      path="/animation.json"
      loop={true}
      autoplay={true}
      style={{ width: 400, height: 400 }}
      onComplete={() => console.log('Done!')}
    />
  )
}
```

### Vue 3

```vue
<template>
  <div>
    <div ref="container" style="width: 400px; height: 400px" />
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
    <input type="range" @input="updateSpeed" v-model="speed" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLottie } from '@ldesign/lottie/vue'

const container = ref()
const speed = ref(1)

const { play, pause, setSpeed } = useLottie({
  container,
  path: '/animation.json',
  loop: true,
  autoplay: false
})

const updateSpeed = () => {
  setSpeed(speed.value)
}
</script>
```

## 最佳实践

### 1. 响应式设计

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  style: {
    width: '100%',
    height: 'auto',
    maxWidth: '500px'
  }
})

// 窗口大小改变时调整
window.addEventListener('resize', () => {
  animation.resize()
})
```

### 2. 预加载关键动画

```typescript
// 预加载但不显示
const preloadedAnimation = createLottie({
  container: document.createElement('div'),  // 临时容器
  path: '/important-animation.json',
  autoplay: false
})

// 稍后使用时快速加载（从缓存）
```

### 3. 错误处理

```typescript
const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  events: {
    data_failed: (error) => {
      // 显示后备内容
      document.getElementById('animation').innerHTML = 
        '<img src="/fallback.gif" alt="Animation" />'
    }
  }
})
```

### 4. 内存管理

```typescript
// 不再需要时销毁动画
animation.destroy()

// 批量销毁
lottieManager.destroyAll()
```

### 5. 动画序列

```typescript
import { AnimationSequence } from '@ldesign/lottie'

const sequence = new AnimationSequence()

sequence.add({
  config: { container: '#step1', path: '/step1.json' },
  delay: 0
})

sequence.add({
  config: { container: '#step2', path: '/step2.json' },
  delay: 500  // 500ms 延迟
})

sequence.add({
  config: { container: '#step3', path: '/step3.json' },
  delay: 300
})

// 播放整个序列
await sequence.play()

// 控制
sequence.pause()
sequence.stop()
```

### 6. 交互控制

```typescript
import { InteractiveController } from '@ldesign/lottie'

const animation = createLottie({
  container: '#animation',
  path: '/animation.json',
  loop: false,
  autoplay: false
})

// 添加交互
new InteractiveController({
  instance: animation,
  enableClick: true,   // 点击播放/暂停
  enableHover: true,   // 悬停播放
  enableScroll: false  // 滚动控制
})
```

## 📊 示例演示

查看 `/examples` 目录获取完整的工作示例：

- **Vanilla JS**: 12+ 个完整示例
- **React**: 5+ 个示例（Hooks & Components）
- **Vue 3**: 5+ 个示例（Composables & Directives）

运行示例：
```bash
npm run example:vanilla
npm run example:react
npm run example:vue
```

## 🔗 相关链接

- [主文档](./README.md)
- [快速开始](./QUICK_START.md)
- [API 文档](./docs/api/core.md)
- [示例说明](./examples/README.md)
