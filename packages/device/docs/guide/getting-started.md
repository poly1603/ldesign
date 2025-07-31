# 快速开始

本指南将帮助你在几分钟内开始使用 `@ldesign/device`。

## 安装

首先，使用你喜欢的包管理器安装 `@ldesign/device`：

::: code-group

```bash [npm]
npm install @ldesign/device
```

```bash [yarn]
yarn add @ldesign/device
```

```bash [pnpm]
pnpm add @ldesign/device
```

:::

## 基础使用

### 创建设备检测器

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector()

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()
console.log(deviceInfo)
```

### 检测设备类型

```typescript
// 检测设备类型
const deviceType = detector.getDeviceType()
console.log(deviceType) // 'mobile' | 'tablet' | 'desktop'

// 使用便捷方法
if (detector.isMobile()) {
  console.log('当前是移动设备')
} else if (detector.isTablet()) {
  console.log('当前是平板设备')
} else if (detector.isDesktop()) {
  console.log('当前是桌面设备')
}
```

### 检测屏幕方向

```typescript
// 获取屏幕方向
const orientation = detector.getOrientation()
console.log(orientation) // 'portrait' | 'landscape'
```

### 检测触摸支持

```typescript
// 检测是否支持触摸
if (detector.isTouchDevice()) {
  console.log('设备支持触摸操作')
}
```

## 监听设备变化

`@ldesign/device` 提供了强大的事件系统，可以监听设备状态的变化：

```typescript
// 监听设备信息变化
detector.on('deviceChange', (deviceInfo) => {
  console.log('设备信息已更新:', deviceInfo)
})

// 监听设备类型变化
detector.on('deviceTypeChange', (deviceType) => {
  console.log('设备类型已变化:', deviceType)
})

// 监听屏幕方向变化
detector.on('orientationChange', (orientation) => {
  console.log('屏幕方向已变化:', orientation)
})
```

## 自定义配置

你可以通过配置选项来自定义设备检测的行为：

```typescript
const detector = new DeviceDetector({
  // 自定义断点
  breakpoints: {
    mobile: 600,   // 小于 600px 为移动设备
    tablet: 1024,  // 600px - 1024px 为平板设备
  },
  
  // 防抖延迟（毫秒）
  debounceDelay: 250,
  
  // 是否启用窗口大小变化监听
  enableResize: true,
  
  // 是否启用屏幕方向变化监听
  enableOrientation: true,
})
```

## Vue 3 集成

如果你使用 Vue 3，可以使用我们提供的 Composition API：

```vue
<template>
  <div>
    <h2>设备信息</h2>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <p>屏幕尺寸: {{ width }} x {{ height }}</p>
    <p>像素比: {{ pixelRatio }}</p>
    
    <div v-if="isMobile">
      <h3>移动设备专用内容</h3>
      <p>这里是移动设备的特殊布局</p>
    </div>
    
    <div v-else-if="isTablet">
      <h3>平板设备专用内容</h3>
      <p>这里是平板设备的特殊布局</p>
    </div>
    
    <div v-else>
      <h3>桌面设备专用内容</h3>
      <p>这里是桌面设备的特殊布局</p>
    </div>
  </div>
</template>

<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  orientation,
  width,
  height,
  pixelRatio,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
} = useDevice()
</script>
```

### 使用 Vue 插件

你也可以将 `@ldesign/device` 作为 Vue 插件使用：

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(DevicePlugin, {
  // 全局属性名（可选）
  globalProperty: '$device',
  
  // 设备检测器配置（可选）
  detectorOptions: {
    breakpoints: {
      mobile: 600,
      tablet: 1024,
    },
  },
})

app.mount('#app')
```

然后在组件中使用：

```vue
<template>
  <div>
    <p>设备类型: {{ $device.getDeviceType() }}</p>
    
    <!-- 使用指令 -->
    <div v-device-mobile>移动设备内容</div>
    <div v-device-tablet>平板设备内容</div>
    <div v-device-desktop>桌面设备内容</div>
  </div>
</template>

<script setup>
import { useDeviceDetector } from '@ldesign/device/vue'

// 获取设备检测器实例
const detector = useDeviceDetector()

// 监听设备变化
detector.on('deviceChange', (info) => {
  console.log('设备信息变化:', info)
})
</script>
```

## 扩展功能

`@ldesign/device` 支持动态加载扩展模块来获取更多设备信息：

### 网络状态检测

```typescript
import { NetworkModule } from '@ldesign/device'

// 加载网络模块
await detector.loadModule('network', NetworkModule)

// 获取网络信息
const networkModule = detector.getModule('network')
const networkInfo = networkModule?.getNetworkInfo()

console.log('网络类型:', networkInfo?.type)
console.log('在线状态:', networkInfo?.isOnline)
console.log('下载速度:', networkInfo?.downlink)
```

### 电池状态检测

```typescript
import { BatteryModule } from '@ldesign/device'

// 加载电池模块
await detector.loadModule('battery', BatteryModule)

// 获取电池信息
const batteryModule = detector.getModule('battery')
const batteryInfo = batteryModule?.getBatteryInfo()

console.log('电池电量:', batteryInfo?.level)
console.log('充电状态:', batteryInfo?.charging)
```

### 地理位置检测

```typescript
import { GeolocationModule } from '@ldesign/device'

// 加载地理位置模块
await detector.loadModule('geolocation', GeolocationModule)

// 获取当前位置
const geolocationModule = detector.getModule('geolocation')
await geolocationModule?.getCurrentPosition()

const position = geolocationModule?.getPosition()
console.log('纬度:', position?.latitude)
console.log('经度:', position?.longitude)
```

## 清理资源

当不再需要设备检测器时，记得清理资源：

```typescript
// 清理资源
await detector.destroy()
```

## 下一步

现在你已经掌握了 `@ldesign/device` 的基础用法！接下来你可以：

- 查看 [API 文档](/api/) 了解更多功能
- 浏览 [示例](/examples/) 学习实际应用
- 了解 [Vue 集成](/guide/vue-composables) 的更多用法
- 探索 [扩展模块](/guide/modules) 的强大功能

如果遇到问题，欢迎查看我们的 [GitHub 仓库](https://github.com/ldesign-org/device) 或提交 Issue。