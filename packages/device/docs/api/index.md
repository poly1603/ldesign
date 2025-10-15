# @ldesign/device API 参考文档

欢迎使用 @ldesign/device 库的 API 参考文档。本文档详细介绍了所有公共 API、类型定义和使用示例。

## 概述

@ldesign/device 是一个高性能的设备检测和信息获取库,提供以下核心功能:

- **设备检测**: 检测设备类型(桌面、移动、平板)和屏幕方向
- **事件系统**: 高性能的事件发射器,支持优先级和命名空间
- **模块化加载**: 按需动态加载功能模块
- **扩展模块**: 网络、电池、地理位置等设备信息模块

## 核心类

### [DeviceDetector](./device-detector.md)
设备检测器主类,负责检测设备类型、监听设备变化、管理扩展模块。

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true,
 modules: ['network', 'battery']
})
```

### [EventEmitter](./event-emitter.md)
高性能事件发射器,支持优先级、命名空间、通配符等高级特性。

```typescript
import { EventEmitter } from '@ldesign/device'

const emitter = new EventEmitter()
emitter.on('myEvent', (data) => {
 console.log(data)
})
```

### [ModuleLoader](./module-loader.md)
模块加载器,负责动态加载和管理扩展模块,支持依赖管理和并行加载。

```typescript
const loader = new ModuleLoader()
const networkModule = await loader.loadModuleInstance('network')
```

## 扩展模块

### [NetworkModule](./network-module.md)
网络信息模块,提供网络状态、连接类型、速度等信息。

```typescript
const networkModule = await detector.loadModule('network')
console.log(networkModule.isOnline())
console.log(networkModule.getConnectionType())
```

### [BatteryModule](./battery-module.md)
电池信息模块,提供电池电量、充电状态、剩余时间等信息。

```typescript
const batteryModule = await detector.loadModule('battery')
console.log(batteryModule.getLevel())
console.log(batteryModule.isCharging())
```

### [GeolocationModule](./geolocation-module.md)
地理位置模块,提供位置获取、位置监听、距离计算等功能。

```typescript
const geoModule = await detector.loadModule('geolocation')
const position = await geoModule.getCurrentPosition()
console.log(position.latitude, position.longitude)
```

## 类型定义

查看 [类型定义文档](./types.md) 了解所有 TypeScript 类型定义。

## 快速开始

### 安装

```bash
npm install @ldesign/device
```

### 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建检测器实例
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true
})

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()
console.log('设备类型:', deviceInfo.type)
console.log('屏幕方向:', deviceInfo.orientation)
console.log('浏览器:', deviceInfo.browser.name)
console.log('操作系统:', deviceInfo.os.name)

// 监听设备变化
detector.on('deviceChange', (info) => {
 console.log('设备信息更新:', info)
})

detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化:', orientation)
})

// 加载扩展模块
const networkModule = await detector.loadModule('network')
networkModule.on('networkChange', (info) => {
 console.log('网络状态变化:', info)
})

// 清理资源
await detector.destroy()
```

### Vue 3 集成

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device'
import App from './App.vue'

const app = createApp(App)
app.use(DevicePlugin, {
 enableResize: true,
 enableOrientation: true
})
app.mount('#app')
```

在组件中使用:

```vue
<script setup>
import { useDevice } from '@ldesign/device'

const { deviceType, isMobile, isDesktop, deviceInfo } = useDevice()
</script>

<template>
 <div>
  <p>设备类型: {{ deviceType }}</p>
  <p v-if="isMobile">移动端界面</p>
  <p v-else-if="isDesktop">桌面端界面</p>
 </div>
</template>
```

## API 文档索引

- [DeviceDetector API](./device-detector.md) - 设备检测器
- [EventEmitter API](./event-emitter.md) - 事件发射器
- [ModuleLoader API](./module-loader.md) - 模块加载器
- [NetworkModule API](./network-module.md) - 网络模块
- [BatteryModule API](./battery-module.md) - 电池模块
- [GeolocationModule API](./geolocation-module.md) - 地理位置模块
- [类型定义](./types.md) - TypeScript 类型

## 进阶使用

### 性能监控

```typescript
const detector = new DeviceDetector()

// 启用性能监控
detector.enablePerformanceMonitoring()

// 获取性能指标
const metrics = detector.getDetectionMetrics()
console.log('检测次数:', metrics.detectionCount)
console.log('平均检测时间:', metrics.averageDetectionTime)
```

### 自定义断点

```typescript
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 640,  // 小于 640px 为移动设备
  tablet: 1280  // 640-1280px 为平板设备
 }
})
```

### 模块预加载

```typescript
const loader = new ModuleLoader()

// 设置模块优先级
loader.setPriority('network', 10)
loader.setPriority('battery', 5)

// 预加载多个模块
await loader.preload(['network', 'battery', 'geolocation'])
```

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 11
- Edge >= 79

## 相关资源

- [GitHub 仓库](https://github.com/your-org/ldesign)
- [更新日志](../../CHANGELOG.md)
- [贡献指南](../../CONTRIBUTING.md)

## 许可证

MIT License
