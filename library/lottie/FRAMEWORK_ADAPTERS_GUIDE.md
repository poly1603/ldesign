# 🎯 框架适配器完整指南

> @ldesign/lottie v1.2.0 - 支持 Vue 3、React、Web Components、Vanilla JS

---

## 📋 目录

- [总览](#总览)
- [Vue 3 适配器](#vue-3-适配器)
- [React 适配器](#react-适配器)
- [Lit (Web Components)](#lit-web-components)
- [Vanilla JS](#vanilla-js)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

---

## 🌟 总览

### 支持的框架/平台

| 框架 | 用法数量 | 难度 | 推荐指数 |
|------|---------|------|---------|
| **Vue 3** | 9种 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **React** | 5种 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Web Components** | 2种 | ⭐ | ⭐⭐⭐⭐⭐ |
| **Vanilla JS** | ∞ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 快速选择

```
需要最简单的用法？           → Web Components
Vue 3 项目？                → Vue Composable/组件/指令
React 项目？                → React Hook/组件
需要完全控制？              → Vanilla JS
需要指令简化代码？          → Vue 指令
需要全局管理？              → Vue 插件 / React Context
```

---

## 💚 Vue 3 适配器

### 安装和导入

```typescript
import {
  // Composables
  useLottie,
  useLottieInteractive,
  useLottieSequence,
  
  // 组件
  LottieAnimation,
  LottiePlayer,
  LottieSequence,
  
  // 指令
  vLottie,
  vLottieHover,
  vLottieScroll,
  
  // 插件
  LottiePlugin
} from '@ldesign/lottie/vue'
```

### 方式 1: useLottie Composable ⭐⭐⭐⭐⭐

**最灵活的方式，推荐用于复杂场景**

```vue
<template>
  <div>
    <div ref="containerRef" class="animation" />
    <button @click="play">播放</button>
    <button @click="pause">暂停</button>
    <button @click="stop">停止</button>
    <div>状态: {{ state }}</div>
    <div>播放中: {{ isPlaying }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLottie } from '@ldesign/lottie/vue'

const containerRef = ref(null)

const {
  instance,
  state,
  isPlaying,
  isLoaded,
  play,
  pause,
  stop,
  reset,
  setSpeed,
  setDirection,
  goToFrame,
  destroy
} = useLottie({
  container: containerRef,
  path: '/animation.json',
  loop: true,
  autoplay: true
})

// 控制速度
const handleSpeedChange = (speed: number) => {
  setSpeed(speed)
}

// 跳转到指定帧
const jumpTo = (frame: number) => {
  goToFrame(frame, true) // true 表示跳转后播放
}
</script>
```

### 方式 2: useLottieInteractive ⭐⭐⭐⭐

**自动处理交互，适合交互场景**

```vue
<template>
  <div ref="containerRef" class="interactive-animation" />
  <div class="hint">点击、悬停或拖拽查看效果</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLottieInteractive } from '@ldesign/lottie/vue'

const containerRef = ref(null)

const lottie = useLottieInteractive({
  container: containerRef,
  path: '/animation.json',
  loop: false,
  autoplay: false,
  enableClick: true,      // 点击切换播放/暂停
  enableHover: true,      // 悬停时播放
  enableDrag: true,       // 拖拽控制进度
  enableScroll: false     // 滚动控制
})
</script>
```

### 方式 3: useLottieSequence ⭐⭐⭐⭐

**序列播放多个动画**

```vue
<template>
  <div>
    <div>进度: {{ Math.round(progress) }}%</div>
    <div>当前: {{ currentIndex + 1 }} / {{ totalCount }}</div>
    <button @click="play">播放序列</button>
    <button @click="pause">暂停</button>
    <button @click="stop">停止</button>
  </div>
</template>

<script setup lang="ts">
import { useLottieSequence } from '@ldesign/lottie/vue'

const {
  currentIndex,
  totalCount,
  progress,
  isPlaying,
  play,
  pause,
  resume,
  stop,
  goTo
} = useLottieSequence({
  items: [
    { 
      config: { path: '/step1.json' },
      delay: 0
    },
    { 
      config: { path: '/step2.json' },
      delay: 500 
    },
    { 
      config: { path: '/step3.json' },
      delay: 500 
    }
  ],
  loop: false,
  autoplay: true
})

// 跳转到特定步骤
const jumpToStep = (index: number) => {
  goTo(index)
}
</script>
```

### 方式 4: LottieAnimation 组件 ⭐⭐⭐⭐⭐

**最简单的组件方式**

```vue
<template>
  <LottieAnimation
    path="/animation.json"
    :loop="true"
    :autoplay="true"
    :speed="1.5"
    width="400px"
    height="400px"
    renderer="svg"
    @ready="onReady"
    @complete="onComplete"
    @error="onError"
    ref="animRef"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LottieAnimation } from '@ldesign/lottie/vue'

const animRef = ref(null)

const onReady = () => console.log('动画加载完成')
const onComplete = () => console.log('动画播放完成')
const onError = (error) => console.error('错误:', error)

// 通过 ref 调用方法
const playAnimation = () => {
  animRef.value?.play()
}
</script>
```

### 方式 5: LottiePlayer 组件 ⭐⭐⭐⭐⭐

**带完整控制栏的播放器**

```vue
<template>
  <LottiePlayer
    path="/animation.json"
    :loop="true"
    :autoplay="false"
    :showControls="true"
    height="500px"
    @ready="onReady"
  />
</template>

<script setup lang="ts">
import { LottiePlayer } from '@ldesign/lottie/vue'

const onReady = () => console.log('播放器就绪')
</script>
```

### 方式 6: LottieSequence 组件 ⭐⭐⭐⭐

**序列组件，可视化控制**

```vue
<template>
  <LottieSequence
    :items="sequenceItems"
    :loop="false"
    :autoplay="false"
    :showControls="true"
    @indexChange="onIndexChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LottieSequence } from '@ldesign/lottie/vue'

const sequenceItems = ref([
  { config: { path: '/step1.json' }, delay: 0 },
  { config: { path: '/step2.json' }, delay: 300 },
  { config: { path: '/step3.json' }, delay: 300 }
])

const onIndexChange = (index: number) => {
  console.log('当前步骤:', index + 1)
}
</script>
```

### 方式 7: v-lottie 指令 ⭐⭐⭐⭐⭐

**最简单的用法，一行代码搞定**

```vue
<template>
  <!-- 直接传路径 -->
  <div v-lottie="'/animation.json'" style="width: 300px; height: 300px;" />
  
  <!-- 传配置对象 -->
  <div 
    v-lottie="{ path: '/animation.json', loop: true, speed: 2 }"
    style="width: 300px; height: 300px;"
  />
</template>
```

### 方式 8: v-lottie-hover 指令 ⭐⭐⭐⭐

**鼠标悬停时播放**

```vue
<template>
  <div 
    v-lottie-hover="'/heart.json'"
    class="hover-animation"
    style="width: 200px; height: 200px; cursor: pointer;"
  >
    悬停我！
  </div>
</template>
```

### 方式 9: v-lottie-scroll 指令 ⭐⭐⭐⭐

**滚动驱动动画**

```vue
<template>
  <div 
    v-lottie-scroll="'/animation.json'"
    style="width: 400px; height: 400px; margin: 200px 0;"
  />
  <div class="hint">向下滚动查看效果</div>
</template>
```

### Vue 插件全局注册

```typescript
// main.ts
import { createApp } from 'vue'
import { LottiePlugin } from '@ldesign/lottie/vue'
import App from './App.vue'

const app = createApp(App)

app.use(LottiePlugin, {
  componentPrefix: 'Lottie',  // 组件前缀
  components: true,            // 注册组件
  directives: true             // 注册指令
})

app.mount('#app')

// 现在可以直接使用，无需导入
// <LottieAnimation path="..." />
// <div v-lottie="..." />
```

---

## ⚛️ React 适配器

### 安装和导入

```typescript
import {
  // Hooks
  useLottie,
  useLottieInteractive,
  useLottieSequence,
  useLottieControls,
  
  // 组件
  LottieAnimation,
  LottiePlayer,
  LottieSequence,
  
  // Context
  LottieProvider,
  useLottieContext
} from '@ldesign/lottie/react'
```

### 方式 1: useLottie Hook ⭐⭐⭐⭐⭐

**标准 Hook 方式**

```tsx
import { useLottie } from '@ldesign/lottie/react'

function MyComponent() {
  const {
    containerRef,
    instance,
    state,
    isPlaying,
    play,
    pause,
    stop,
    setSpeed
  } = useLottie({
    path: '/animation.json',
    loop: true,
    autoplay: true
  })

  return (
    <div>
      <div ref={containerRef} style={{ width: 400, height: 400 }} />
      <button onClick={play}>播放</button>
      <button onClick={pause}>暂停</button>
      <div>状态: {state}</div>
    </div>
  )
}
```

### 方式 2: LottieAnimation 组件 ⭐⭐⭐⭐⭐

**声明式组件**

```tsx
import { LottieAnimation } from '@ldesign/lottie/react'

function App() {
  const animRef = useRef(null)

  return (
    <>
      <LottieAnimation
        ref={animRef}
        path="/animation.json"
        loop={true}
        autoplay={true}
        speed={1.5}
        style={{ width: 400, height: 400 }}
        onReady={() => console.log('Ready')}
        onComplete={() => console.log('Complete')}
      />
      
      <button onClick={() => animRef.current?.play()}>
        播放
      </button>
    </>
  )
}
```

### 方式 3: LottiePlayer 组件 ⭐⭐⭐⭐⭐

**带控制栏的播放器**

```tsx
import { LottiePlayer } from '@ldesign/lottie/react'

function App() {
  return (
    <LottiePlayer
      path="/animation.json"
      loop={true}
      autoplay={false}
      showControls={true}
      height="500px"
      onReady={() => console.log('Player ready')}
    />
  )
}
```

### 方式 4: LottieSequence 组件 ⭐⭐⭐⭐

**序列播放**

```tsx
import { LottieSequence } from '@ldesign/lottie/react'

function App() {
  const items = [
    { config: { path: '/step1.json' }, delay: 0 },
    { config: { path: '/step2.json' }, delay: 500 },
    { config: { path: '/step3.json' }, delay: 500 }
  ]

  return (
    <LottieSequence
      items={items}
      loop={false}
      autoplay={false}
      showControls={true}
    />
  )
}
```

### 方式 5: Context Provider ⭐⭐⭐⭐

**全局管理多个实例**

```tsx
import { LottieProvider, useLottieContext } from '@ldesign/lottie/react'

function App() {
  return (
    <LottieProvider>
      <Gallery />
      <Controls />
    </LottieProvider>
  )
}

function Controls() {
  const { playAll, pauseAll, stopAll, instances } = useLottieContext()

  return (
    <div>
      <div>实例数: {instances.size}</div>
      <button onClick={playAll}>播放全部</button>
      <button onClick={pauseAll}>暂停全部</button>
      <button onClick={stopAll}>停止全部</button>
    </div>
  )
}
```

---

## 🌐 Lit (Web Components)

### 安装和导入

```typescript
// 自动注册自定义元素
import '@ldesign/lottie/lit'

// 或手动注册
import { registerLottieElements } from '@ldesign/lottie/lit'
registerLottieElements('my-prefix') // <my-prefix-animation>
```

### 方式 1: <lottie-animation> ⭐⭐⭐⭐⭐

**最简单的 Web Component**

```html
<!-- 基础用法 -->
<lottie-animation 
  src="/animation.json"
  loop="true"
  autoplay="true"
  renderer="svg"
  speed="1.5"
></lottie-animation>

<!-- JavaScript 控制 -->
<script>
  const lottie = document.querySelector('lottie-animation')
  
  lottie.play()
  lottie.pause()
  lottie.stop()
  lottie.setSpeed(2)
  
  lottie.addEventListener('ready', () => {
    console.log('动画加载完成')
  })
  
  lottie.addEventListener('complete', () => {
    console.log('动画播放完成')
  })
</script>
```

### 方式 2: <lottie-player> ⭐⭐⭐⭐⭐

**带完整控制栏的播放器**

```html
<lottie-player
  src="/heart.json"
  loop="true"
  autoplay="false"
  controls="true"
></lottie-player>

<!-- 内置进度条、播放/暂停、速度控制等 -->
```

### 在任何框架中使用

```jsx
// Vue 3
<template>
  <lottie-animation src="/animation.json" />
</template>

// React
function App() {
  return <lottie-animation src="/animation.json" />
}

// Angular
<lottie-animation src="/animation.json"></lottie-animation>

// Svelte
<lottie-animation src="/animation.json" />

// 纯 HTML
<lottie-animation src="/animation.json"></lottie-animation>
```

---

## ⚡ Vanilla JS

### 完整 API 访问

```typescript
import {
  createLottie,
  lottieManager,
  AnimationSequence,
  InteractiveController,
  VirtualRenderer,
  memoryManager,
  workerManager
} from '@ldesign/lottie'

// 基础用法
const animation = createLottie({
  container: '#lottie',
  path: '/animation.json',
  loop: true,
  autoplay: true
})

// 序列播放
const sequence = new AnimationSequence()
sequence.add({ config: { path: '/anim1.json' } })
sequence.add({ config: { path: '/anim2.json' }, delay: 500 })
await sequence.play()

// 交互控制
new InteractiveController({
  instance: animation,
  enableClick: true,
  enableHover: true
})

// 虚拟化渲染（性能优化）
const virtualRenderer = new VirtualRenderer()
virtualRenderer.register(animation)

// 内存管理
memoryManager.startMonitoring()
memoryManager.onMemoryPressure((event) => {
  console.log('Memory:', event.stats)
})

// Worker 加速
const data = await workerManager.parseAnimation(jsonString)
```

---

## 🚀 性能优化

### 所有框架都支持

```typescript
import {
  VirtualRenderer,
  memoryManager,
  workerManager,
  AdaptiveFrameRate
} from '@ldesign/lottie'

// 1. 虚拟化渲染
const virtualRenderer = new VirtualRenderer()
animations.forEach(anim => virtualRenderer.register(anim))

// 2. 内存监控
memoryManager.startMonitoring()

// 3. Worker 加速
const optimized = await workerManager.optimizeAnimation(data)

// 4. 自适应帧率
const adaptiveFPS = new AdaptiveFrameRate(animation, {
  targetFPS: 60,
  minFPS: 20
})
```

---

## 📚 完整示例

### Vue 3 完整应用

查看: `examples/vue/src/App.vue`

包含:
- ✅ 所有 9种用法
- ✅ 实时状态显示
- ✅ 完整控制演示
- ✅ 事件日志

### React 完整应用

查看: `examples/react/src/App.tsx`

包含:
- ✅ 所有 5种用法
- ✅ Hook 和组件示例
- ✅ Context 管理演示
- ✅ TypeScript 完整类型

### Web Components 示例

查看: `examples/lit/index.html`

包含:
- ✅ 基础用法
- ✅ JavaScript 控制
- ✅ 事件监听
- ✅ 动态创建
- ✅ 多实例

### 框架对比页面

查看: `examples/all-frameworks.html`

包含:
- ✅ 所有框架对比
- ✅ 功能对比表
- ✅ 代码示例
- ✅ 选择建议

---

## 💡 最佳实践

### Vue 3 项目

```vue
<!-- 推荐结构 -->
<script setup lang="ts">
// 1. 简单场景：使用组件
import { LottieAnimation } from '@ldesign/lottie/vue'

// 2. 复杂场景：使用 Composable
import { useLottie } from '@ldesign/lottie/vue'
const lottie = useLottie({ ... })

// 3. 快速原型：使用指令
// <div v-lottie="'/animation.json'" />
</script>
```

### React 项目

```tsx
// 推荐结构

// 1. 简单场景：使用组件
import { LottieAnimation } from '@ldesign/lottie/react'
<LottieAnimation path="..." />

// 2. 需要控制：使用 Hook
import { useLottie } from '@ldesign/lottie/react'
const lottie = useLottie({ ... })

// 3. 全局管理：使用 Context
import { LottieProvider } from '@ldesign/lottie/react'
<LottieProvider>...</LottieProvider>
```

### 微前端/多框架

```html
<!-- 使用 Web Components -->
<script type="module">
  import '@ldesign/lottie/lit'
</script>

<lottie-animation src="/animation.json"></lottie-animation>
<!-- 在任何框架中都能工作 -->
```

---

## 🎯 使用场景建议

### 场景 1: 简单的图标动画
**推荐**: 
- Vue: `v-lottie` 指令
- React: `<LottieAnimation>` 组件
- 其他: `<lottie-animation>` Web Component

### 场景 2: 需要播放控制
**推荐**: 
- Vue: `useLottie` Composable 或 `<LottiePlayer>`
- React: `useLottie` Hook 或 `<LottiePlayer>`

### 场景 3: 交互动画
**推荐**:
- Vue: `useLottieInteractive` 或 `v-lottie-hover`
- React: `useLottieInteractive` Hook
- 其他: `InteractiveController` (Vanilla JS)

### 场景 4: 序列动画
**推荐**:
- Vue: `useLottieSequence` 或 `<LottieSequence>`
- React: `<LottieSequence>` 组件
- 其他: `AnimationSequence` (Vanilla JS)

### 场景 5: 大量动画
**推荐**: 
- 启用 `VirtualRenderer` 虚拟化渲染
- 使用 `memoryManager` 内存管理
- 所有框架都适用

---

## 🔧 高级技巧

### 组合使用

```vue
<!-- Vue: 组合指令和 Composable -->
<template>
  <!-- 简单动画用指令 -->
  <div v-lottie="'/icon.json'" />
  
  <!-- 需要控制的用 Composable -->
  <div ref="complexRef" />
</template>

<script setup>
import { ref } from 'vue'
import { useLottie } from '@ldesign/lottie/vue'

const complexRef = ref(null)
const { play, pause } = useLottie({
  container: complexRef,
  path: '/complex.json'
})
</script>
```

```tsx
// React: 组合 Hook 和组件
function App() {
  // 简单的用组件
  return (
    <>
      <LottieAnimation path="/icon.json" />
      
      {/* 需要控制的用 Hook */}
      <ComplexAnimation />
    </>
  )
}

function ComplexAnimation() {
  const { containerRef, play, pause } = useLottie({
    path: '/complex.json'
  })
  
  return <div ref={containerRef} />
}
```

---

## 🎊 总结

### 16种使用方式！

```
Vue 3:            9种 (3+3+3)
React:            5种 (4+3+1)  
Web Components:   2种
-----------------------------------
总计:            16种用法
```

### 适用于所有场景

- ✅ 简单图标动画
- ✅ 复杂交互动画
- ✅ 序列动画
- ✅ 滚动驱动
- ✅ 批量管理
- ✅ 性能优化

### 学习曲线友好

```
Web Components:  ⭐        (最简单)
Vue 指令:        ⭐        (非常简单)
Vue 组件:        ⭐⭐      (简单)
React 组件:      ⭐⭐      (简单)
Composable/Hook: ⭐⭐⭐    (中等)
Vanilla JS:      ⭐⭐⭐⭐  (需要学习 API)
```

---

## 📞 获取帮助

- 📖 查看示例：`examples/` 目录
- 📄 阅读文档：`docs/` 目录
- 🌐 在线对比：`examples/all-frameworks.html`
- 💬 GitHub Issues
- 📧 技术支持

---

**🎉 享受最丰富的 Lottie 框架支持体验！**


