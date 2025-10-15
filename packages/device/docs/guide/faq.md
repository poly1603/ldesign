# 常见问题

本页面汇总了使用 @ldesign/device 时的常见问题和解决方案。

## 安装和配置

### 如何安装 @ldesign/device？

使用你喜欢的包管理器：

```bash
# pnpm
pnpm add @ldesign/device

# npm
npm install @ldesign/device

# yarn
yarn add @ldesign/device

# bun
bun add @ldesign/device
```

### 是否支持 TypeScript？

是的，@ldesign/device 使用 TypeScript 编写，提供完整的类型定义。无需额外安装 @types 包。

```typescript
import type { DeviceInfo, DeviceType } from '@ldesign/device'
```

### 是否需要 Vue？

核心功能不需要 Vue。Vue 集成是可选的。

```typescript
// 纯 JavaScript 使用
import { DeviceDetector } from '@ldesign/device'

// Vue 3 集成（可选）
import { useDevice } from '@ldesign/device/vue'
```

## 基础使用

### 如何判断设备类型？

```typescript
const detector = new DeviceDetector()

// 方法 1：快捷方法
if (detector.isMobile()) {
 console.log('移动设备')
}

// 方法 2：获取类型字符串
const type = detector.getDeviceType() // 'mobile' | 'tablet' | 'desktop'
```

### 如何自定义断点？

在创建检测器时传入配置：

```typescript
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 480,  // 小于 480px 为移动设备
  tablet: 768   // 480-768px 为平板
 }
})
```

### 如何监听设备变化？

使用事件监听：

```typescript
detector.on('deviceChange', (deviceInfo) => {
 console.log('设备类型变化:', deviceInfo.type)
})

detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化:', orientation)
})
```

## Vue 集成

### 如何在 Vue 3 中使用？

使用 `useDevice` composable：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { deviceType, isMobile, isTablet } = useDevice()
</script>

<template>
 <div v-if="isMobile">移动端布局</div>
</template>
```

### 如何全局注册？

使用插件方式：

```typescript
// main.ts
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)
app.use(DevicePlugin)
app.mount('#app')
```

### v-device 指令如何使用？

```vue
<template>
 <!-- 只在移动设备显示 -->
 <div v-device="'mobile'">移动端内容</div>

 <!-- 只在桌面显示 -->
 <div v-device="'desktop'">桌面端内容</div>

 <!-- 在平板或桌面显示 -->
 <div v-device="['tablet', 'desktop']">非移动端内容</div>
</template>
```

### 是否支持 Nuxt？

是的，支持 Nuxt 3。在 SSR 环境中会自动处理：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

// 在 Nuxt 中直接使用
const { deviceType } = useDevice()
</script>
```

## 模块系统

### 如何加载扩展模块？

使用 `loadModule` 方法：

```typescript
const detector = new DeviceDetector()

// 加载网络模块
const networkModule = await detector.loadModule('network')

// 加载电池模块
const batteryModule = await detector.loadModule('battery')

// 加载地理位置模块
const geoModule = await detector.loadModule('geolocation')
```

### 模块加载失败怎么办？

使用 try-catch 处理：

```typescript
try {
 const batteryModule = await detector.loadModule('battery')
} catch (error) {
 console.warn('电池 API 不可用:', error)
 // 提供降级方案
}
```

### 如何卸载模块？

```typescript
// 卸载单个模块
await detector.unloadModule('network')

// 销毁检测器时会自动卸载所有模块
await detector.destroy()
```

## 网络模块

### 如何检测网络状态？

```typescript
const networkModule = await detector.loadModule('network')

const info = networkModule.getData()
console.log('是否在线:', info.online)
console.log('连接类型:', info.type)
console.log('下载速度:', info.downlink)
```

### 如何监听网络变化？

```typescript
detector.on('networkChange', (networkInfo) => {
 if (networkInfo.status === 'offline') {
  showOfflineMessage()
 } else {
  hideOfflineMessage()
 }
})
```

### 浏览器不支持 Network API 怎么办？

库会自动降级，提供基础的在线/离线检测：

```typescript
const info = networkModule.getData()

if (!info.supported) {
 // 不支持 Network Information API
 // 只能获取 online/offline 状态
 console.log('在线状态:', info.online)
}
```

## 电池模块

### 如何获取电池信息？

```typescript
const batteryModule = await detector.loadModule('battery')

const info = batteryModule.getData()
console.log('电池电量:', info.level * 100, '%')
console.log('是否充电:', info.charging)
```

### Safari 不支持电池 API 怎么办？

Safari 不支持 Battery Status API。建议使用 try-catch 处理：

```typescript
try {
 const batteryModule = await detector.loadModule('battery')
 // 显示电池信息
} catch (error) {
 // 隐藏电池功能
 console.info('电池 API 不可用')
}
```

### 如何监听电池变化？

```typescript
detector.on('batteryChange', (batteryInfo) => {
 if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
  enablePowerSavingMode()
 }
})
```

## 地理位置模块

### 如何获取当前位置？

```typescript
const geoModule = await detector.loadModule('geolocation')

try {
 const position = await geoModule.getCurrentPosition()
 console.log('纬度:', position.latitude)
 console.log('经度:', position.longitude)
} catch (error) {
 console.error('获取位置失败:', error)
}
```

### 用户拒绝位置权限怎么办？

捕获错误并处理：

```typescript
try {
 const position = await geoModule.getCurrentPosition()
} catch (error) {
 if (error.code === 1) {
  // PERMISSION_DENIED
  showMessage('需要位置权限才能使用此功能')
 }
}
```

### 如何监听位置变化？

```typescript
// 开始监听
await geoModule.startWatching()

detector.on('positionChange', (position) => {
 console.log('位置更新:', position)
 updateMap(position)
})

// 停止监听
await geoModule.stopWatching()
```

## 性能问题

### 包体积太大怎么办？

1. 确保使用 Tree Shaking：

```typescript
// ✅ 只导入需要的功能
import { DeviceDetector } from '@ldesign/device'

// ❌ 避免导入整个库
import * as Device from '@ldesign/device'
```

2. 按需加载模块：

```typescript
// ✅ 只在需要时加载
const networkModule = await detector.loadModule('network')

// ❌ 避免一次性加载所有模块
```

### 事件触发太频繁怎么办？

增加防抖延迟：

```typescript
const detector = new DeviceDetector({
 debounceDelay: 300 // 增加到 300ms
})
```

### 内存泄漏怎么办？

确保正确清理资源：

```typescript
// 保存处理器引用
const handler = (info) => console.log(info)
detector.on('deviceChange', handler)

// 组件卸载时清理
onUnmounted(() => {
 detector.off('deviceChange', handler)
 detector.destroy()
})
```

## 错误处理

### 模块加载失败

```typescript
try {
 const module = await detector.loadModule('battery')
} catch (error) {
 console.warn('模块加载失败:', error.message)
 // 提供降级方案
}
```

### 设备检测错误

```typescript
detector.on('error', (error) => {
 console.error('检测错误:', error)
 // 错误恢复策略
})
```

## SSR/SSG

### 在 Nuxt 3 中如何使用？

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

// 直接使用，会自动处理 SSR
const { deviceType } = useDevice()
</script>
```

### 在 Next.js 中如何使用？

使用客户端组件：

```typescript
'use client'

import { DeviceDetector } from '@ldesign/device'
import { useEffect, useState } from 'react'

export function DeviceInfo() {
 const [deviceType, setDeviceType] = useState('desktop')

 useEffect(() => {
  const detector = new DeviceDetector()
  setDeviceType(detector.getDeviceType())

  return () => {
   detector.destroy()
  }
 }, [])

 return <div>Device: {deviceType}</div>
}
```

### 服务端渲染有默认值吗？

是的，SSR 环境下会返回默认的桌面设备信息：

```typescript
if (typeof window === 'undefined') {
 // 服务端：返回默认值
 // type: 'desktop'
 // orientation: 'landscape'
 // width: 1920
 // height: 1080
}
```

## 浏览器兼容性

### 支持哪些浏览器？

核心功能支持：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

模块支持因浏览器而异，详见各模块文档。

### IE 11 兼容吗？

不支持 IE 11。库使用现代 JavaScript 特性，建议使用现代浏览器。

### 如何检测浏览器支持情况？

```typescript
// 检查模块支持
const networkModule = await detector.loadModule('network')
if (!networkModule.getData().supported) {
 console.warn('Network API 不支持')
}

// 检查地理位置支持
const geoModule = await detector.loadModule('geolocation')
if (!geoModule.isSupported()) {
 console.warn('Geolocation API 不支持')
}
```

## 其他问题

### 可以同时创建多个检测器实例吗？

可以，但不推荐。建议使用单例模式：

```typescript
// ✅ 推荐：单例
export const detector = new DeviceDetector()

// ❌ 不推荐：多个实例
const detector1 = new DeviceDetector()
const detector2 = new DeviceDetector()
```

### 如何调试？

启用调试日志：

```typescript
// 查看性能指标
const metrics = detector.getDetectionMetrics()
console.log('性能指标:', metrics)

// 监听错误事件
detector.on('error', (error) => {
 console.error('检测错误:', error)
})
```

### 如何贡献代码？

欢迎贡献！请访问 [GitHub 仓库](https://github.com/ldesign-org/device)：

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

### 在哪里报告 Bug？

请在 [GitHub Issues](https://github.com/ldesign-org/device/issues) 提交 Bug 报告。

### 如何获取帮助？

- 查看 [完整文档](../)
- 搜索 [GitHub Issues](https://github.com/ldesign-org/device/issues)
- 在 [Discussions](https://github.com/ldesign-org/device/discussions) 提问

## 更多问题？

如果你的问题不在此列表中，请：

1. 查看 [完整文档](../)
2. 搜索 [GitHub Issues](https://github.com/ldesign-org/device/issues)
3. 在 [Discussions](https://github.com/ldesign-org/device/discussions) 提问

我们会持续更新此 FAQ 页面，帮助更多开发者。
