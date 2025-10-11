# 快速使用指南

## 🚀 开始使用

### 1. 安装依赖

```bash
cd library/lottie
pnpm install
```

### 2. 构建库

```bash
pnpm build
```

构建完成后，会在 `dist` 目录生成以下文件：
- `index.js` / `index.cjs` - 主入口
- `adapters/vue.js` - Vue 适配器
- `adapters/react.js` - React 适配器
- 对应的 `.d.ts` 类型文件

### 3. 运行示例

#### Vanilla JavaScript 示例
```bash
pnpm example:vanilla
```
访问 http://localhost:5173

#### Vue 示例
```bash
pnpm example:vue
```
访问 http://localhost:5173

#### React 示例
```bash
pnpm example:react
```
访问 http://localhost:5173

### 4. 查看文档

```bash
# 开发模式
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建后的文档
pnpm docs:preview
```

## 📖 基本用法

### Vanilla JavaScript

```typescript
import { createLottie } from '@ldesign/lottie'

// 基础���法
const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loop: true,
  autoplay: true
})

// 控制动画
animation.play()
animation.pause()
animation.stop()
animation.setSpeed(2)

// 监听事件
animation.on('complete', () => {
  console.log('动画完成')
})
```

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useLottie } from '@ldesign/lottie/vue'

const container = ref<HTMLElement>()

const {
  play,
  pause,
  stop,
  state,
  isPlaying
} = useLottie({
  container,
  path: 'animation.json',
  loop: true,
  autoplay: false
})
</script>

<template>
  <div>
    <div ref="container" class="lottie-container" />
    <button @click="play">播放</button>
    <button @click="pause">暂停</button>
    <button @click="stop">停止</button>
    <p>状态: {{ state }}</p>
  </div>
</template>
```

或使用指令：

```vue
<template>
  <div v-lottie="{ path: 'animation.json', loop: true, autoplay: true }" />
</template>
```

### React

```tsx
import { Lottie, useLottie } from '@ldesign/lottie/react'

// 使用组件
function App1() {
  return (
    <Lottie
      path="animation.json"
      loop
      autoplay
      style={{ width: 300, height: 300 }}
      onComplete={() => console.log('完成')}
    />
  )
}

// 使用 Hook
function App2() {
  const { containerRef, play, pause, isPlaying } = useLottie({
    path: 'animation.json',
    loop: true,
    autoplay: false
  })

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
      <p>播放中: {isPlaying.toString()}</p>
    </div>
  )
}
```

## 🎨 高级功能

### 性能监控

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
      console.log('内存:', metrics.memory, 'MB')
      console.log('帧数:', metrics.totalFrames)
    }
  }
})
```

### 懒加载

```typescript
const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loadStrategy: 'intersection', // 进入视口时加载
  advanced: {
    intersectionOptions: {
      threshold: 0.5 // 50% 可见时加载
    }
  }
})
```

### 使用管理器

```typescript
import { lottieManager } from '@ldesign/lottie'

// 预加载动画
await lottieManager.preload('animation1.json')
await lottieManager.preload('animation2.json')

// 批量预加载
await lottieManager.preloadBatch([
  'animation1.json',
  'animation2.json',
  'animation3.json'
])

// 创建实例
const anim1 = lottieManager.create({ /* config */ })
const anim2 = lottieManager.create({ /* config */ })

// 全局控制
lottieManager.playAll()
lottieManager.pauseAll()
lottieManager.stopAll()
lottieManager.setGlobalSpeed(2)

// 获取统计信息
const stats = lottieManager.getGlobalStats()
console.log('总实例数:', stats.totalInstances)
console.log('活跃实例:', stats.activeInstances)
console.log('平均 FPS:', stats.averageFps)
console.log('缓存命中率:', stats.cacheHitRate)
```

### 智能缓存

```typescript
// 配置全局缓存
import { LottieManager } from '@ldesign/lottie'

const manager = LottieManager.getInstance({
  cache: {
    enabled: true,
    maxSize: 100, // MB
    ttl: 3600000 // 1小时
  }
})

// 动画数据会自动缓存
const animation = manager.create({
  path: 'animation.json',
  advanced: {
    enableCache: true,
    cacheKey: 'my-animation' // 自定义缓存键
  }
})

// 获取缓存统计
const cacheStats = manager.getCacheStats()
console.log('缓存大小:', cacheStats.size, 'MB')
console.log('命中率:', cacheStats.hitRate)
```

## 🔧 配置选项

完整的配置选项请查看 [API 文档](./docs/api/core.md) 或 TypeScript 类型定义。

主要配置项：

```typescript
interface LottieConfig {
  // 容器
  container?: HTMLElement | string

  // 数据来源（二选一）
  path?: string
  animationData?: any

  // 渲染器
  renderer?: 'svg' | 'canvas' | 'html'

  // 播放控制
  loop?: boolean | number
  autoplay?: boolean
  speed?: number
  playMode?: 'normal' | 'bounce' | 'reverse'

  // 质量
  quality?: 'low' | 'medium' | 'high' | 'auto'

  // 加载策略
  loadStrategy?: 'eager' | 'lazy' | 'intersection'

  // 事件
  events?: LottieEvents

  // 高级选项
  advanced?: AdvancedOptions
}
```

## 📚 更多资源

- [完整文档](./docs/index.md)
- [API 参考](./docs/api/core.md)
- [示例代码](./examples/)
- [项目总结](./PROJECT_SUMMARY.md)

## ⚡️ ��能建议

1. **使用懒加载**: 对于不在首屏的动画使用 `intersection` 策略
2. **启用缓存**: 对于复用的动画启用缓存
3. **预加载**: 在空闲时间预加载动画数据
4. **监控性能**: 启用性能监控，及时发现问题
5. **选择合适的渲染器**: SVG 质量好但性能较低，Canvas 性能好但质量略低

## 🐛 常见问题

### 动画不显示？

1. 检查容器元素是否存在
2. 检查动画数据路径是否正确
3. 检查容器是否有高度和宽度
4. 查看浏览器控制台是否有错误

### 性能不佳？

1. 降低动画质量设置
2. 使用 Canvas 渲染器
3. 减少同时播放的动画数量
4. 启用性能监控查看瓶颈

### TypeScript 类型错误？

1. 确保安装了最新版本
2. 检查 tsconfig.json 配置
3. 导入正确的类型

## 💡 提示

- 所有示例都包含完整的注释和说明
- 文档中有详细的 API 参考
- 可以直接复制示例代码使用
- 遇到问题可以查看示例项目的实现

祝你使用愉快！🎉
