---
layout: home

hero:
  name: "@ldesign/device"
  text: 现代化设备检测库
  tagline: 轻量、高效、类型安全的设备检测解决方案，完美支持 Vue 3 生态系统
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看指南
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign-org/device

features:
  - icon: 🎯
    title: 智能检测
    details: 精准识别设备类型（mobile/tablet/desktop），实时监听屏幕方向变化，提供完整的设备信息

  - icon: ⚡
    title: 轻量高效
    details: 核心库仅 ~8KB (gzipped)，支持 Tree Shaking，零依赖设计，性能卓越

  - icon: 📘
    title: TypeScript 原生支持
    details: 使用 TypeScript 编写，提供完整的类型定义，智能提示让开发更高效

  - icon: 🎨
    title: Vue 3 深度集成
    details: 提供 Composition API、指令、插件等多种使用方式，与 Vue 3 响应式系统完美融合

  - icon: 🧩
    title: 模块化设计
    details: 核心功能保持轻量，网络、电池、地理位置等高级功能按需加载

  - icon: 🌐
    title: 广泛兼容
    details: 支持主流浏览器，SSR 友好，优雅降级，确保在各种环境下都能正常工作

  - icon: 🔄
    title: 事件系统
    details: 完善的事件监听机制，实时响应设备变化、屏幕旋转、窗口大小调整等

  - icon: 🛡️
    title: 生产就绪
    details: 95%+ 测试覆盖率，经过严格测试，可靠稳定，适合企业级应用

  - icon: 📊
    title: 性能监控
    details: 内置性能监控和优化机制，智能缓存，内存使用降低 30%+

  - icon: 🔧
    title: 灵活配置
    details: 支持自定义断点、防抖延迟、事件监听等，满足各种业务需求

  - icon: 🎯
    title: 响应式设计
    details: 完美支持响应式设计，轻松实现跨设备的一致体验

  - icon: 📱
    title: 触摸支持检测
    details: 准确识别触摸设备，帮助优化触摸交互体验
---

## 快速体验

### 安装

::: code-group
```bash [pnpm]
pnpm add @ldesign/device
```

```bash [npm]
npm install @ldesign/device
```

```bash [yarn]
yarn add @ldesign/device
```

```bash [bun]
bun add @ldesign/device
```
:::

### 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建检测器实例
const detector = new DeviceDetector()

// 获取设备信息
const device = detector.getDeviceInfo()
console.log('设备类型:', device.type) // 'mobile' | 'tablet' | 'desktop'
console.log('屏幕方向:', device.orientation) // 'portrait' | 'landscape'

// 监听设备变化
detector.on('deviceChange', (deviceInfo) => {
  console.log('设备变化:', deviceInfo)
})
```

### Vue 3 集成

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  isMobile,
  isTablet,
  isDesktop,
  orientation
} = useDevice()
</script>

<template>
  <div>
    <div v-if="isMobile">移动端布局</div>
    <div v-else-if="isTablet">平板布局</div>
    <div v-else>桌面布局</div>
  </div>
</template>
```

## 为什么选择 @ldesign/device？

在多设备时代，精准的设备检测是优秀用户体验的基石。@ldesign/device 提供了一套完整的解决方案：

- **轻量级** - 核心库仅 8KB，比大多数图片还小
- **高性能** - 智能缓存、内存优化、性能监控
- **类型安全** - 完整的 TypeScript 支持
- **易于使用** - 简洁的 API，完善的文档
- **生产就绪** - 高测试覆盖率，稳定可靠

## 社区与支持

- [GitHub 仓库](https://github.com/ldesign-org/device)
- [问题反馈](https://github.com/ldesign-org/device/issues)
- [讨论区](https://github.com/ldesign-org/device/discussions)
- [更新日志](https://github.com/ldesign-org/device/blob/main/CHANGELOG.md)

## 开源协议

[MIT License](https://github.com/ldesign-org/device/blob/main/LICENSE)
