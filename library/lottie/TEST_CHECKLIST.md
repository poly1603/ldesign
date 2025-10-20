# 🧪 测试检查清单

> 确保所有功能正常工作

---

## ✅ 性能优化功能测试

### Web Worker

- [ ] **Worker 初始化**
  ```bash
  # 打开浏览器控制台
  import { workerManager } from '@ldesign/lottie'
  await workerManager.init()
  console.log(workerManager.getStats())
  ```

- [ ] **解析动画数据**
  ```typescript
  const data = await workerManager.parseAnimation(jsonString, {
    validate: true,
    removeHiddenLayers: true
  })
  // 应该返回解析后的对象
  ```

- [ ] **压缩/解压缩**
  ```typescript
  const compressed = await workerManager.compressAnimation(data)
  const decompressed = await workerManager.decompressAnimation(compressed)
  // 应该相等
  ```

### 虚拟化渲染

- [ ] **创建虚拟化渲染器**
  ```typescript
  import { VirtualRenderer } from '@ldesign/lottie'
  const virtualRenderer = new VirtualRenderer()
  ```

- [ ] **注册实例**
  ```typescript
  virtualRenderer.register(animation)
  const stats = virtualRenderer.getStats()
  console.log('Visible:', stats.visibleInstances)
  ```

- [ ] **滚动测试**
  - 创建50个动画
  - 滚动页面
  - 观察只有可见的在播放
  - 检查内存节省

### 内存管理

- [ ] **启动监控**
  ```typescript
  import { memoryManager } from '@ldesign/lottie'
  memoryManager.startMonitoring()
  ```

- [ ] **获取统计**
  ```typescript
  const stats = memoryManager.getStats()
  console.log('Used:', stats.used, 'MB')
  console.log('Status:', stats.status)
  ```

- [ ] **压力测试**
  - 创建100个动画
  - 观察内存警告
  - 检查自动清理

### 批量渲染

- [ ] **创建多个实例**
  ```typescript
  // 创建50个动画
  // 观察帧率是否稳定
  ```

- [ ] **获取统计**
  ```typescript
  import { batchRenderer } from '@ldesign/lottie'
  const stats = batchRenderer.getStats()
  console.log('Queue:', stats.queueSize)
  ```

### 自适应帧率

- [ ] **创建实例**
  ```typescript
  import { AdaptiveFrameRate } from '@ldesign/lottie'
  const adaptiveFPS = new AdaptiveFrameRate(animation, {
    targetFPS: 60,
    minFPS: 20
  })
  ```

- [ ] **观察调整**
  ```typescript
  setInterval(() => {
    const stats = adaptiveFPS.getStats()
    console.log('Current:', stats.currentFPS)
    console.log('Actual:', stats.actualFPS)
  }, 1000)
  ```

---

## ✅ Vue 3 适配器测试

### Composables

- [ ] **useLottie**
  ```vue
  <script setup>
  import { ref } from 'vue'
  import { useLottie } from '@ldesign/lottie/vue'
  
  const container = ref(null)
  const { play, pause, state } = useLottie({
    container,
    path: '/animation.json'
  })
  </script>
  
  <template>
    <div ref="container" />
    <button @click="play">Play</button>
    <div>{{ state }}</div>
  </template>
  ```
  - [ ] 动画加载
  - [ ] 播放/暂停
  - [ ] 状态更新

- [ ] **useLottieInteractive**
  ```vue
  <script setup>
  const lottie = useLottieInteractive({
    container: ref(null),
    path: '/animation.json',
    enableClick: true,
    enableHover: true
  })
  </script>
  ```
  - [ ] 点击交互
  - [ ] 悬停交互
  - [ ] 拖拽交互

- [ ] **useLottieSequence**
  ```vue
  <script setup>
  const seq = useLottieSequence({
    items: [
      { config: { path: '/anim1.json' } },
      { config: { path: '/anim2.json' }, delay: 500 }
    ]
  })
  </script>
  ```
  - [ ] 序列播放
  - [ ] 暂停/恢复
  - [ ] 进度显示

### 组件

- [ ] **LottieAnimation**
  ```vue
  <LottieAnimation path="/animation.json" :loop="true" />
  ```
  - [ ] 渲染
  - [ ] Props 响应
  - [ ] 事件触发

- [ ] **LottiePlayer**
  ```vue
  <LottiePlayer path="/animation.json" :showControls="true" />
  ```
  - [ ] 控制栏显示
  - [ ] 播放/暂停按钮
  - [ ] 进度条
  - [ ] 速度选择

- [ ] **LottieSequence**
  ```vue
  <LottieSequence :items="items" :showControls="true" />
  ```
  - [ ] 序列切换
  - [ ] 进度显示
  - [ ] 控制按钮

### 指令

- [ ] **v-lottie**
  ```vue
  <div v-lottie="'/animation.json'" />
  ```
  - [ ] 自动加载
  - [ ] 自动播放

- [ ] **v-lottie-hover**
  ```vue
  <div v-lottie-hover="'/animation.json'" />
  ```
  - [ ] 悬停播放
  - [ ] 离开暂停

- [ ] **v-lottie-scroll**
  ```vue
  <div v-lottie-scroll="'/animation.json'" />
  ```
  - [ ] 滚动控制
  - [ ] 进度跟随

### 插件

- [ ] **全局注册**
  ```typescript
  import { LottiePlugin } from '@ldesign/lottie/vue'
  app.use(LottiePlugin)
  ```
  - [ ] 组件全局可用
  - [ ] 指令全局可用

---

## ✅ React 适配器测试

### Hooks

- [ ] **useLottie**
  ```tsx
  const { containerRef, play, pause } = useLottie({
    path: '/animation.json'
  })
  ```
  - [ ] Ref 绑定
  - [ ] 控制方法
  - [ ] 状态更新

- [ ] **useLottieInteractive**
  - [ ] 交互功能
  - [ ] 自动清理

- [ ] **useLottieSequence**
  - [ ] 序列管理
  - [ ] 控制方法

- [ ] **useLottieControls**
  - [ ] 细粒度控制
  - [ ] 帧控制

### 组件

- [ ] **LottieAnimation**
  ```tsx
  <LottieAnimation path="/animation.json" loop autoplay />
  ```
  - [ ] 渲染正常
  - [ ] Props 更新
  - [ ] 事件回调

- [ ] **LottiePlayer**
  - [ ] 控制栏功能
  - [ ] 所有按钮工作

- [ ] **LottieSequence**
  - [ ] 序列播放
  - [ ] 控制正常

### Context

- [ ] **LottieProvider**
  ```tsx
  <LottieProvider>
    <App />
  </LottieProvider>
  ```
  - [ ] Context 提供
  - [ ] 实例注册

- [ ] **useLottieContext**
  ```tsx
  const { playAll, pauseAll, instances } = useLottieContext()
  ```
  - [ ] 批量控制
  - [ ] 实例列表

---

## ✅ Lit (Web Components) 测试

### 基础元素

- [ ] **<lottie-animation>**
  ```html
  <lottie-animation src="/animation.json" loop="true"></lottie-animation>
  ```
  - [ ] 渲染正常
  - [ ] 属性响应
  - [ ] 自动播放

- [ ] **<lottie-player>**
  ```html
  <lottie-player src="/animation.json" controls="true"></lottie-player>
  ```
  - [ ] 控制栏显示
  - [ ] 所有功能正常

### JavaScript 控制

- [ ] **方法调用**
  ```javascript
  const elem = document.querySelector('lottie-animation')
  elem.play()
  elem.pause()
  elem.stop()
  ```
  - [ ] 所有方法工作

- [ ] **事件监听**
  ```javascript
  elem.addEventListener('ready', () => console.log('Ready'))
  elem.addEventListener('complete', () => console.log('Complete'))
  ```
  - [ ] 事件触发

### 动态创建

- [ ] **createElement**
  ```javascript
  const lottie = document.createElement('lottie-animation')
  lottie.setAttribute('src', '/animation.json')
  document.body.appendChild(lottie)
  ```
  - [ ] 创建成功
  - [ ] 正常渲染

---

## ✅ 示例页面测试

### Vue 示例

```bash
npm run example:vue
```

- [ ] 页面加载正常
- [ ] 所有9种用法显示
- [ ] 控制按钮工作
- [ ] 状态更新正确
- [ ] 事件日志记录
- [ ] 无控制台错误

### React 示例

```bash
npm run example:react
```

- [ ] 页面加载正常
- [ ] 所有5种用法显示
- [ ] Hook 功能正常
- [ ] 组件渲染正确
- [ ] Context 工作
- [ ] 无控制台错误

### Lit 示例

```bash
npm run example:lit
```

- [ ] 页面加载正常
- [ ] Web Components 渲染
- [ ] JavaScript 控制工作
- [ ] 事件监听正常
- [ ] 动态创建成功
- [ ] 无控制台错误

### 框架对比页面

```bash
npm run example:all
# 访问 /all-frameworks.html
```

- [ ] 页面加载正常
- [ ] 所有框架说明显示
- [ ] 代码示例正确
- [ ] 链接工作
- [ ] 样式美观

### 性能测试页面

```bash
# 直接打开
open examples/performance-test.html
```

- [ ] 页面加载正常
- [ ] 统计显示正确
- [ ] 加载动画功能
- [ ] 性能指标更新
- [ ] 日志记录

---

## ✅ 配置文件测试

### package.json

- [ ] **exports 配置**
  ```json
  {
    "./vue": "./dist/adapters/vue/index.js",
    "./react": "./dist/adapters/react/index.js",
    "./lit": "./dist/adapters/lit/index.js"
  }
  ```

- [ ] **scripts 配置**
  ```bash
  npm run example:vue    # 应该工作
  npm run example:react  # 应该工作
  npm run example:lit    # 应该工作
  npm run example:all    # 应该工作
  ```

---

## ✅ TypeScript 类型测试

### 导入测试

```typescript
// 应该都有智能提示，无类型错误

// Vue
import { 
  useLottie, 
  LottieAnimation,
  vLottie 
} from '@ldesign/lottie/vue'

// React
import { 
  useLottie, 
  LottieAnimation,
  LottieProvider 
} from '@ldesign/lottie/react'

// Lit
import { 
  LottieElement,
  LottiePlayerElement 
} from '@ldesign/lottie/lit'

// Core
import {
  createLottie,
  VirtualRenderer,
  memoryManager
} from '@ldesign/lottie'
```

---

## 📊 性能基准测试

### 场景 1: 单个大文件

```typescript
// 测试 2MB 动画文件
const start = performance.now()
const data = await workerManager.parseAnimation(largeJson)
const loadTime = performance.now() - start

// 期望: < 1秒
console.log('Load time:', loadTime, 'ms')
```

### 场景 2: 50个动画

```typescript
// 创建50个动画实例
const animations = []
for (let i = 0; i < 50; i++) {
  animations.push(createLottie({ ... }))
}

// 启用虚拟化
const virtualRenderer = new VirtualRenderer()
animations.forEach(anim => virtualRenderer.register(anim))

// 检查统计
const stats = virtualRenderer.getStats()
console.log('Visible:', stats.visibleInstances)  // 期望: ~15
console.log('Hidden:', stats.hiddenInstances)    // 期望: ~35
console.log('Memory saved:', stats.memorySaved)  // 期望: ~250MB
```

### 场景 3: 内存压力测试

```typescript
// 创建大量实例直到触发警告
memoryManager.startMonitoring()

let warningTriggered = false
memoryManager.onMemoryPressure((event) => {
  warningTriggered = true
  console.log('Pressure:', event.action, event.stats)
})

// 期望: 在适当时候触发警告
```

---

## 🎯 验收标准

### 功能完整性

- [ ] 所有16种使用方式都能工作
- [ ] 所有示例页面正常运行
- [ ] 所有性能优化功能生效
- [ ] 无控制台错误或警告

### 性能要求

- [ ] 大文件加载 < 1秒
- [ ] 50个动画帧率 > 50 FPS
- [ ] 内存占用 < 300MB
- [ ] 崩溃率 = 0%

### 代码质量

- [ ] TypeScript 无类型错误
- [ ] 所有文件有完整注释
- [ ] 代码格式统一
- [ ] 无 ESLint 警告

### 文档完整

- [ ] 所有API有文档
- [ ] 所有功能有示例
- [ ] README 更新完整
- [ ] CHANGELOG 记录清晰

---

## 🚀 发布前检查

### 代码检查

- [ ] 运行 `npm run build` 无错误
- [ ] 所有示例测试通过
- [ ] TypeScript 编译成功
- [ ] 包大小合理

### 文档检查

- [ ] README.md 更新
- [ ] CHANGELOG 完整
- [ ] 所有文档链接有效
- [ ] 示例代码正确

### 版本检查

- [ ] package.json 版本号更新
- [ ] Git tag 创建
- [ ] CHANGELOG 版本匹配

### 发布检查

- [ ] NPM 凭证配置
- [ ] Git 仓库干净
- [ ] 所有文件已提交
- [ ] 准备发布说明

---

## 📝 测试报告模板

```markdown
# 测试报告

## 环境
- 浏览器: Chrome 120
- Node.js: 20.x
- 操作系统: macOS/Windows/Linux

## 性能优化测试
- [x] Web Worker: ✅ 通过
- [x] 虚拟化渲染: ✅ 通过
- [x] 内存管理: ✅ 通过
- [x] 批量渲染: ✅ 通过
- [x] 自适应帧率: ✅ 通过

## 框架适配器测试
- [x] Vue 3 (9种): ✅ 通过
- [x] React (5种): ✅ 通过
- [x] Lit (2种): ✅ 通过

## 示例测试
- [x] 所有示例: ✅ 通过

## 性能基准
- 大文件加载: 0.8s (目标: <1s) ✅
- 50动画帧率: 55 FPS (目标: >50 FPS) ✅
- 内存占用: 280MB (目标: <300MB) ✅

## 总体评价
✅ 通过所有测试，可以发布！
```

---

## 🎊 完成确认

当所有测试项都打勾后：

```
✅ 性能优化功能 - 全部通过
✅ Vue 3 适配器 - 全部通过
✅ React 适配器 - 全部通过
✅ Lit 适配器 - 全部通过
✅ 示例页面 - 全部通过
✅ 性能基准 - 达到目标
✅ 文档完整 - 确认无误
✅ 可以发布 🎉
```

---

**准备好发布了吗？让我们开始吧！🚀**

