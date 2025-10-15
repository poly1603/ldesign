# 最佳实践

本指南汇总了使用 @ldesign/device 的最佳实践和推荐模式，帮助你构建高质量的应用。

## 基础使用

### ✅ 单例模式

在整个应用中共享一个检测器实例：

```typescript
// ✅ 推荐：创建单例
// deviceDetector.ts
import { DeviceDetector } from '@ldesign/device'

export const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true
})

// 在其他文件中使用
import { detector } from './deviceDetector'
```

```typescript
// ❌ 避免：重复创建实例
// 每次都创建新实例会浪费资源
function Component() {
 const detector = new DeviceDetector() // 不推荐
}
```

### ✅ 及时清理

组件卸载时清理资源：

```typescript
// ✅ 推荐：手动清理
const detector = new DeviceDetector()

// 使用完毕后清理
onUnmounted(async () => {
 await detector.destroy()
})
```

在 Vue 中使用 composable 时自动处理：

```vue
<script setup>
// ✅ 推荐：使用 composable 自动清理
import { useDevice } from '@ldesign/device/vue'

const { deviceType } = useDevice()
// 组件卸载时自动清理，无需手动调用
</script>
```

### ✅ 错误处理

始终添加错误处理：

```typescript
// ✅ 推荐：完善的错误处理
try {
 const batteryModule = await detector.loadModule('battery')
 const info = batteryModule.getData()
} catch (error) {
 console.warn('电池模块不可用:', error)
 // 提供降级方案
 showFeatureUnavailable('battery')
}
```

```typescript
// ❌ 避免：忽略错误
const batteryModule = await detector.loadModule('battery') // 可能失败
```

## 性能优化

### ✅ 按需加载模块

只在需要时加载模块：

```typescript
// ✅ 推荐：按需加载
const showNetworkInfo = async () => {
 const networkModule = await detector.loadModule('network')
 const info = networkModule.getData()
 displayNetworkInfo(info)
}
```

```typescript
// ❌ 避免：初始化时加载所有模块
const detector = new DeviceDetector()
await detector.loadModule('network')  // 可能不需要
await detector.loadModule('battery')  // 可能不需要
await detector.loadModule('geolocation') // 可能不需要
```

### ✅ 合理设置防抖

根据场景调整防抖延迟：

```typescript
// ✅ 实时性要求高的场景
const detector = new DeviceDetector({
 debounceDelay: 50 // 快速响应
})

// ✅ 性能优先的场景
const detector = new DeviceDetector({
 debounceDelay: 300 // 减少触发频率
})
```

### ✅ 条件启用监听

根据需要启用监听：

```typescript
// ✅ 只启用需要的监听
const detector = new DeviceDetector({
 enableResize: true,     // 需要响应窗口变化
 enableOrientation: false  // 不需要方向监听
})
```

```typescript
// ❌ 总是启用所有监听
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true // 可能不需要
})
```

## 响应式设计

### ✅ 使用断点系统

利用配置的断点系统：

```typescript
// ✅ 推荐：使用检测器的断点
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,
  tablet: 1024
 }
})

if (detector.isMobile()) {
 // 移动端布局
}
```

```typescript
// ❌ 避免：硬编码断点
if (window.innerWidth < 768) { // 不推荐
 // 移动端布局
}
```

### ✅ 监听设备变化

响应设备类型变化：

```vue
<script setup>
// ✅ 推荐：监听变化
import { useDevice } from '@ldesign/device/vue'
import { watch } from 'vue'

const { deviceType } = useDevice()

watch(deviceType, (newType) => {
 // 设备类型变化时调整布局
 adjustLayout(newType)
})
</script>
```

### ✅ 使用 v-device 指令

声明式控制元素显示：

```vue
<template>
 <!-- ✅ 推荐：使用指令 -->
 <nav v-device="'mobile'" class="mobile-nav" />
 <nav v-device="'desktop'" class="desktop-nav" />

 <!-- ❌ 避免：手动判断 -->
 <nav v-if="isMobile" class="mobile-nav" />
 <nav v-if="isDesktop" class="desktop-nav" />
</template>
```

## 模块使用

### ✅ 缓存模块实例

避免重复加载：

```typescript
// ✅ 推荐：缓存模块
let networkModule = null

async function getNetworkModule() {
 if (!networkModule) {
  networkModule = await detector.loadModule('network')
 }
 return networkModule
}
```

### ✅ 及时卸载模块

不使用时卸载：

```typescript
// ✅ 推荐：使用完毕后卸载
const geoModule = await detector.loadModule('geolocation')
const position = await geoModule.getCurrentPosition()

// 获取完位置后卸载
await detector.unloadModule('geolocation')
```

### ✅ 条件加载模块

根据设备类型加载：

```typescript
// ✅ 推荐：只在移动设备加载电池模块
if (detector.isMobile()) {
 const batteryModule = await detector.loadModule('battery')
 // 使用电池模块
}
```

## 用户体验

### ✅ 提供视觉反馈

操作时提供反馈：

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'
import { ref } from 'vue'

const { getCurrentPosition } = useGeolocation()
const loading = ref(false)

const getLocation = async () => {
 loading.value = true
 try {
  await getCurrentPosition()
 } finally {
  loading.value = false
 }
}
</script>

<template>
 <!-- ✅ 推荐：显示加载状态 -->
 <button @click="getLocation" :disabled="loading">
  {{ loading ? '定位中...' : '获取位置' }}
 </button>
</template>
```

### ✅ 优雅降级

为不支持的功能提供替代方案：

```typescript
// ✅ 推荐：优雅降级
try {
 const batteryModule = await detector.loadModule('battery')
 showBatteryWidget(batteryModule)
} catch (error) {
 // 电池 API 不可用，隐藏相关功能
 hideBatteryWidget()
 console.info('电池功能在此设备上不可用')
}
```

### ✅ 明确告知用户

说明为什么需要权限：

```vue
<template>
 <div v-if="needsPermission">
  <p>我们需要访问您的位置来显示附近的商店</p>
  <button @click="requestLocation">允许访问位置</button>
 </div>
</template>
```

## 网络优化

### ✅ 根据网络状况调整

自适应网络质量：

```typescript
// ✅ 推荐：根据网络调整资源质量
const networkModule = await detector.loadModule('network')

detector.on('networkChange', (info) => {
 if (info.saveData || info.type === 'cellular') {
  // 省流量模式：加载低质量资源
  imageLoader.setQuality('low')
  videoPlayer.setQuality('360p')
 } else if (info.downlink > 5) {
  // 高速网络：加载高质量资源
  imageLoader.setQuality('high')
  videoPlayer.setQuality('1080p')
 }
})
```

### ✅ 离线支持

提供离线功能：

```typescript
// ✅ 推荐：支持离线模式
const networkModule = await detector.loadModule('network')

if (networkModule.isOffline()) {
 // 离线时从缓存加载
 loadFromCache()
} else {
 // 在线时从服务器加载
 loadFromServer()
}
```

## 电池优化

### ✅ 根据电量调整性能

自适应电池状态：

```typescript
// ✅ 推荐：根据电量调整性能
const batteryModule = await detector.loadModule('battery')

detector.on('batteryChange', (info) => {
 if (info.level < 0.2 && !info.charging) {
  // 低电量：启用省电模式
  app.disableAnimations()
  app.reduceBackgroundActivity()
 } else {
  // 电量充足：正常模式
  app.enableAnimations()
  app.normalBackgroundActivity()
 }
})
```

### ✅ 避免频繁通知

设置通知冷却：

```typescript
// ✅ 推荐：限制通知频率
let lastNotificationTime = 0
const COOLDOWN = 5 * 60 * 1000 // 5分钟

detector.on('batteryChange', (info) => {
 const now = Date.now()

 if (now - lastNotificationTime < COOLDOWN) {
  return // 跳过通知
 }

 if (info.level < 0.2 && !info.charging) {
  showNotification('电量不足')
  lastNotificationTime = now
 }
})
```

## TypeScript 使用

### ✅ 使用类型定义

充分利用 TypeScript 类型：

```typescript
// ✅ 推荐：使用类型定义
import type {
 DeviceInfo,
 DeviceType,
 NetworkInfo,
 BatteryInfo
} from '@ldesign/device'

function handleDevice(info: DeviceInfo) {
 const type: DeviceType = info.type
 // 享受类型检查和自动补全
}
```

### ✅ 类型守卫

使用类型守卫确保类型安全：

```typescript
// ✅ 推荐：类型守卫
function isDeviceInfo(obj: unknown): obj is DeviceInfo {
 return (
  typeof obj === 'object'
  && obj !== null
  && 'type' in obj
  && 'orientation' in obj
 )
}
```

## 测试

### ✅ 模拟设备环境

在测试中模拟不同设备：

```typescript
// ✅ 推荐：模拟设备
import { vi } from 'vitest'

describe('Device Detection', () => {
 it('should detect mobile device', () => {
  // 模拟移动设备
  vi.stubGlobal('innerWidth', 375)
  vi.stubGlobal('innerHeight', 667)

  const detector = new DeviceDetector()
  expect(detector.isMobile()).toBe(true)
 })
})
```

### ✅ 测试事件监听

确保事件正确触发：

```typescript
// ✅ 推荐：测试事件
it('should emit deviceChange event', async () => {
 const detector = new DeviceDetector()
 const handler = vi.fn()

 detector.on('deviceChange', handler)

 // 触发变化
 window.innerWidth = 375
 window.dispatchEvent(new Event('resize'))

 await vi.waitFor(() => {
  expect(handler).toHaveBeenCalled()
 })
})
```

## 常见陷阱

### ❌ 避免内存泄漏

```typescript
// ❌ 错误：忘记清理
const detector = new DeviceDetector()
detector.on('deviceChange', handler)
// 组件销毁时忘记清理

// ✅ 正确：及时清理
onUnmounted(async () => {
 detector.off('deviceChange', handler)
 await detector.destroy()
})
```

### ❌ 避免过度监听

```typescript
// ❌ 错误：监听过于频繁
const detector = new DeviceDetector({
 debounceDelay: 0 // 立即触发
})

// ✅ 正确：合理防抖
const detector = new DeviceDetector({
 debounceDelay: 100 // 适度防抖
})
```

### ❌ 避免阻塞初始化

```typescript
// ❌ 错误：阻塞应用启动
const detector = new DeviceDetector()
await detector.loadModule('network')
await detector.loadModule('battery')
await detector.loadModule('geolocation')
// 启动应用

// ✅ 正确：异步加载
const detector = new DeviceDetector()
// 立即启动应用
startApp()

// 后台加载模块
loadModulesInBackground()
```

## 推荐配置

### 通用应用

```typescript
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 768,
  tablet: 1024
 },
 debounceDelay: 150
})
```

### 高性能应用

```typescript
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: false,
 debounceDelay: 300
})
```

### 实时应用

```typescript
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true,
 debounceDelay: 50
})
```

## 下一步

- [性能优化](./performance.md) - 深入了解性能优化技巧
- [常见问题](./faq.md) - 查看常见问题解答
