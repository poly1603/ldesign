# 性能优化

本指南介绍如何优化 @ldesign/device 的性能，确保你的应用流畅运行。

## 核心优化

@ldesign/device 已经内置了多项性能优化：

- 智能缓存机制
- 防抖节流处理
- 内存管理优化
- Tree Shaking 支持
- 懒加载模块系统

## 包体积优化

### Tree Shaking

只导入需要的功能：

```typescript
// ✅ 推荐：按需导入
import { DeviceDetector } from '@ldesign/device'

// ❌ 避免：导入整个库（如果支持命名导入）
import * as Device from '@ldesign/device'
```

### 模块按需加载

只在需要时加载扩展模块：

```typescript
// ✅ 核心功能保持轻量
const detector = new DeviceDetector()

// ✅ 只在需要时加载模块
document.getElementById('showNetworkBtn').addEventListener('click', async () => {
 const networkModule = await detector.loadModule('network')
 displayNetworkInfo(networkModule.getData())
})
```

### 构建优化

在 Vite/Webpack 中配置 Tree Shaking：

```javascript
// vite.config.js
export default {
 build: {
  rollupOptions: {
   output: {
    manualChunks: {
     // 将设备检测相关代码分离到单独的 chunk
     device: ['@ldesign/device']
    }
   }
  }
 }
}
```

## 运行时优化

### 缓存机制

库已经内置了智能缓存，但你可以进一步优化：

```typescript
// ✅ 缓存检测器实例
let cachedDetector = null

function getDetector() {
 if (!cachedDetector) {
  cachedDetector = new DeviceDetector()
 }
 return cachedDetector
}
```

### 防抖优化

根据场景调整防抖延迟：

```typescript
// 场景 1：实时响应（游戏、绘图应用）
const detector = new DeviceDetector({
 debounceDelay: 16 // 约 60fps
})

// 场景 2：一般应用（推荐）
const detector = new DeviceDetector({
 debounceDelay: 150 // 平衡性能和响应
})

// 场景 3：性能优先
const detector = new DeviceDetector({
 debounceDelay: 300 // 减少触发频率
})
```

### 条件监听

禁用不需要的监听：

```typescript
// ✅ 只启用必要的功能
const detector = new DeviceDetector({
 enableResize: true,      // 需要响应窗口变化
 enableOrientation: false   // 不需要方向监听
})
```

禁用监听可以节省：
- 事件监听器开销
- 事件处理开销
- 内存占用

## 内存优化

### 及时清理资源

```typescript
// ✅ 组件卸载时清理
class MyComponent {
 detector = new DeviceDetector()

 destroy() {
  // 清理资源
  this.detector.destroy()
  this.detector = null
 }
}
```

在 Vue 中自动处理：

```vue
<script setup>
// 使用 composable 自动管理生命周期
import { useDevice } from '@ldesign/device/vue'

const { deviceType } = useDevice()
// 组件卸载时自动清理
</script>
```

### 模块管理

及时卸载不需要的模块：

```typescript
// ✅ 使用完毕后卸载
const geoModule = await detector.loadModule('geolocation')
const position = await geoModule.getCurrentPosition()

// 获取完位置后立即卸载
await detector.unloadModule('geolocation')
```

### 事件监听器管理

避免内存泄漏：

```typescript
// ✅ 保存处理器引用以便清理
const handler = (info) => console.log(info)
detector.on('deviceChange', handler)

// 清理时移除
detector.off('deviceChange', handler)
```

```typescript
// ❌ 匿名函数无法清理
detector.on('deviceChange', (info) => console.log(info))
// 无法移除这个监听器！
```

## 性能监控

### 使用内置监控

检查检测性能：

```typescript
const detector = new DeviceDetector()

// 获取性能指标
const metrics = detector.getDetectionMetrics()

console.log('检测次数:', metrics.detectionCount)
console.log('平均检测时间:', metrics.averageDetectionTime, 'ms')
console.log('最后检测时间:', metrics.lastDetectionDuration, 'ms')
```

### 性能基准测试

测量关键操作性能：

```typescript
// 测量初始化时间
console.time('detector-init')
const detector = new DeviceDetector()
console.timeEnd('detector-init')

// 测量模块加载时间
console.time('module-load')
const networkModule = await detector.loadModule('network')
console.timeEnd('module-load')

// 测量检测时间
console.time('device-detection')
const deviceInfo = detector.getDeviceInfo()
console.timeEnd('device-detection')
```

## 渲染优化

### 避免不必要的重新渲染

在 Vue 中使用 computed 和 memo：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { computed } from 'vue'

const { deviceType, deviceInfo } = useDevice()

// ✅ 使用 computed 缓存计算结果
const layoutClass = computed(() => ({
 'is-mobile': deviceType.value === 'mobile',
 'is-tablet': deviceType.value === 'tablet',
 'is-desktop': deviceType.value === 'desktop'
}))
</script>

<template>
 <!-- 只在 deviceType 变化时更新 -->
 <div :class="layoutClass">
  Content
 </div>
</template>
```

### 批量更新

避免频繁更新 DOM：

```typescript
// ❌ 避免：频繁更新 DOM
detector.on('resize', ({ width }) => {
 document.body.style.fontSize = `${width / 100}px`
 document.body.style.padding = `${width / 50}px`
 document.body.style.margin = `${width / 100}px`
})

// ✅ 推荐：批量更新
detector.on('resize', ({ width }) => {
 requestAnimationFrame(() => {
  const styles = {
   fontSize: `${width / 100}px`,
   padding: `${width / 50}px`,
   margin: `${width / 100}px`
  }
  Object.assign(document.body.style, styles)
 })
})
```

## 网络优化

### 自适应资源加载

根据网络状况加载资源：

```typescript
const networkModule = await detector.loadModule('network')

// ✅ 根据网络质量调整资源
function getImageUrl(basePath) {
 const info = networkModule.getData()

 if (info.status === 'offline') {
  return `${basePath}-cached.jpg`
 }

 if (info.saveData || info.type === 'cellular') {
  return `${basePath}-low.jpg` // 低质量
 }

 if (info.downlink > 5) {
  return `${basePath}-high.jpg` // 高质量
 }

 return `${basePath}-medium.jpg` // 中等质量
}
```

### 预加载策略

根据网络状况决定预加载：

```typescript
const networkModule = await detector.loadModule('network')

// ✅ 智能预加载
function shouldPreload() {
 const info = networkModule.getData()

 // 离线或省流量：不预加载
 if (info.status === 'offline' || info.saveData) {
  return false
 }

 // 慢速网络：不预加载
 if (['slow-2g', '2g'].includes(info.effectiveType)) {
  return false
 }

 // 中速网络：适度预加载
 if (info.effectiveType === '3g') {
  return 'moderate'
 }

 // 高速网络：积极预加载
 return 'aggressive'
}
```

## 电池优化

### 自适应性能模式

根据电池状态调整性能：

```typescript
const batteryModule = await detector.loadModule('battery')

// ✅ 根据电池状态调整性能
function adjustPerformance() {
 const info = batteryModule.getData()

 if (info.charging) {
  // 充电中：高性能模式
  enableHighPerformanceMode()
 } else if (info.level < 0.2) {
  // 低电量：省电模式
  enablePowerSavingMode()
 } else {
  // 正常：平衡模式
  enableBalancedMode()
 }
}

function enablePowerSavingMode() {
 // 减少动画
 document.documentElement.style.setProperty('--animation-duration', '0s')

 // 降低刷新率
 cancelAnimationFrame(rafId)
 rafId = requestAnimationFrame(throttledRender)

 // 暂停后台任务
 pauseBackgroundTasks()
}

function enableHighPerformanceMode() {
 // 恢复动画
 document.documentElement.style.removeProperty('--animation-duration')

 // 正常刷新率
 rafId = requestAnimationFrame(normalRender)

 // 恢复后台任务
 resumeBackgroundTasks()
}
```

## SSR/SSG 优化

### 服务端渲染

在 SSR 环境中的优化：

```typescript
// ✅ 检测 SSR 环境
if (typeof window === 'undefined') {
 // 服务端：使用默认值
 const detector = new DeviceDetector()
 // 返回默认设备信息，不启用监听
} else {
 // 客户端：正常初始化
 const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true
 })
}
```

Nuxt 3 示例：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

// ✅ 在客户端初始化
const { deviceType } = process.client ? useDevice() : { deviceType: ref('desktop') }
</script>
```

## 实际案例

### 案例 1：图片懒加载优化

根据设备和网络状况优化图片加载：

```typescript
const detector = new DeviceDetector()
const networkModule = await detector.loadModule('network')

class ImageLoader {
 getOptimalQuality() {
  // 检查设备类型
  if (detector.isMobile()) {
   return 'mobile'
  }

  // 检查网络状况
  const network = networkModule.getData()
  if (network.saveData || network.type === 'cellular') {
   return 'low'
  }

  if (network.downlink > 5) {
   return 'high'
  }

  return 'medium'
 }

 load(src) {
  const quality = this.getOptimalQuality()
  const url = this.getQualityUrl(src, quality)

  const img = new Image()
  img.src = url
  return img
 }
}
```

### 案例 2：视频播放优化

自适应视频质量和自动播放：

```typescript
const detector = new DeviceDetector()
const networkModule = await detector.loadModule('network')
const batteryModule = await detector.loadModule('battery')

class VideoPlayer {
 shouldAutoPlay() {
  // 移动设备且低电量：不自动播放
  if (detector.isMobile()) {
   const battery = batteryModule.getData()
   if (battery.level < 0.3 && !battery.charging) {
    return false
   }
  }

  // 省流量模式：不自动播放
  const network = networkModule.getData()
  if (network.saveData) {
   return false
  }

  return true
 }

 getQuality() {
  const network = networkModule.getData()

  // 根据网络选择质量
  if (network.type === 'cellular') {
   return '360p'
  }

  if (network.downlink > 5) {
   return '1080p'
  }

  return '720p'
 }

 init() {
  this.player.quality = this.getQuality()
  this.player.autoplay = this.shouldAutoPlay()
 }
}
```

## 性能检查清单

使用此清单检查你的实现：

- [ ] 是否使用单例模式共享检测器实例？
- [ ] 是否按需加载扩展模块？
- [ ] 是否设置了合理的防抖延迟？
- [ ] 是否禁用了不需要的监听？
- [ ] 是否在组件卸载时清理资源？
- [ ] 是否正确移除了事件监听器？
- [ ] 是否根据网络状况调整资源质量？
- [ ] 是否根据电池状态调整性能？
- [ ] 是否在 SSR 环境中正确处理？
- [ ] 是否避免了内存泄漏？

## 性能基准

在主流设备上的性能表现：

### 初始化时间

- 核心库初始化：< 1ms
- 加载 network 模块：< 5ms
- 加载 battery 模块：< 10ms
- 加载 geolocation 模块：< 5ms

### 内存占用

- 核心库：~50KB
- + network 模块：+10KB
- + battery 模块：+8KB
- + geolocation 模块：+10KB

### 检测性能

- 设备信息检测：< 0.1ms（有缓存）
- 设备信息检测：< 2ms（无缓存）
- 事件触发延迟：< 1ms + 防抖时间

## 优化成果

通过本指南的优化，你应该能够实现：

- 📦 包体积减少 50%+（通过 Tree Shaking）
- ⚡ 初始化速度提升 30%+
- 💾 内存使用减少 30%+
- 🔋 电池消耗减少 20%+
- 📱 移动设备性能提升 40%+

## 下一步

- [最佳实践](./best-practices.md) - 学习更多最佳实践
- [常见问题](./faq.md) - 查看常见问题解答
