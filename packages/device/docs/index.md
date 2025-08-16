---
layout: home

hero:
  name: '@ldesign/device'
  text: '现代化设备检测库'
  tagline: '轻量、高效、类型安全的设备检测解决方案，完美支持 Vue 3'
  image:
    src: /logo.svg
    alt: LDesign Device
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign-org/device

features:
  - icon: 🎯
    title: 精准检测
    details: 准确识别设备类型、屏幕方向、触摸支持等关键信息，支持自定义断点配置

  - icon: ⚡
    title: 高性能
    details: 轻量级设计，零依赖，支持 Tree Shaking，按需加载扩展模块

  - icon: 🔧
    title: 易于使用
    details: 简洁的 API 设计，完整的 TypeScript 支持，丰富的使用示例

  - icon: 🎨
    title: Vue 3 集成
    details: 原生支持 Composition API，提供插件、指令和组件，开箱即用

  - icon: 📱
    title: 响应式监听
    details: 实时监听设备变化，支持窗口大小调整和屏幕方向变化

  - icon: 🔌
    title: 模块化架构
    details: 可扩展的模块系统，支持网络状态、电池信息、地理位置等扩展功能

  - icon: 🌐
    title: 跨平台支持
    details: 支持现代浏览器和移动设备，兼容服务端渲染环境

  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验和代码提示
---

## 快速体验

### 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()
console.log(deviceInfo.type) // 'mobile' | 'tablet' | 'desktop'
console.log(deviceInfo.orientation) // 'portrait' | 'landscape'

// 检测设备类型
if (detector.isMobile()) {
  console.log('当前是移动设备')
}

// 监听设备变化
detector.on('deviceChange', info => {
  console.log('设备信息已更新:', info)
})
```

### Vue 3 集成

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { deviceType, orientation, isMobile, isTablet, isDesktop } = useDevice()
</script>

<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <p>是否移动设备: {{ isMobile }}</p>

    <!-- 使用指令 -->
    <div v-device-mobile>移动设备专用内容</div>
    <div v-device-desktop>桌面设备专用内容</div>
  </div>
</template>
```

### 扩展功能

```typescript
import { BatteryModule, DeviceDetector, NetworkModule } from '@ldesign/device'

const detector = new DeviceDetector()

// 加载网络模块
await detector.loadModule('network', NetworkModule)
const networkInfo = detector.getModule('network')?.getNetworkInfo()
console.log('网络类型:', networkInfo?.type)
console.log('在线状态:', networkInfo?.isOnline)

// 加载电池模块
await detector.loadModule('battery', BatteryModule)
const batteryInfo = detector.getModule('battery')?.getBatteryInfo()
console.log('电池电量:', batteryInfo?.level)
console.log('充电状态:', batteryInfo?.charging)
```

## 为什么选择 @ldesign/device？

### 🎯 专业可靠

- 基于现代 Web API 构建
- 经过充分测试验证
- 持续维护和更新

### ⚡ 性能优异

- 包体积小于 10KB (gzipped)
- 支持 Tree Shaking
- 按需加载扩展模块

### 🔧 开发友好

- 完整的 TypeScript 支持
- 丰富的文档和示例
- 活跃的社区支持

### 🎨 Vue 生态

- 原生 Vue 3 支持
- Composition API 优先
- 提供完整的 Vue 集成方案

## 立即开始

选择适合你的安装方式：

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

然后查看我们的[快速开始指南](/guide/getting-started)，几分钟内即可上手使用！
