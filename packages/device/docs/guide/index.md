# 指南介绍

欢迎使用 @ldesign/device！这是一个现代化的设备检测库，专为构建响应式 Web 应用而设计。

## 什么是 @ldesign/device？

@ldesign/device 是一个轻量、高效、类型安全的设备检测库，它可以帮助你：

- 🎯 **精准识别设备类型** - 自动判断用户使用的是手机、平板还是桌面设备
- 📱 **监听屏幕方向** - 实时响应设备旋转，提供最佳的横竖屏体验
- ⚡ **高性能检测** - 智能缓存和优化，对性能影响微乎其微
- 🧩 **模块化扩展** - 按需加载网络、电池、地理位置等高级功能
- 🎨 **Vue 3 集成** - 深度集成 Vue 3，提供响应式的设备检测体验

## 核心特性

### 轻量高效

核心库经过精心优化，gzip 后仅 ~8KB，支持 Tree Shaking，确保只打包你真正使用的功能。

```typescript
import { DeviceDetector } from '@ldesign/device'

// 只引入核心功能，按需加载扩展模块
const detector = new DeviceDetector()
```

### TypeScript 原生支持

使用 TypeScript 编写，提供完整的类型定义，享受智能提示和类型检查。

```typescript
import type { DeviceInfo, DeviceType, Orientation } from '@ldesign/device'

const handleDevice = (info: DeviceInfo) => {
 const type: DeviceType = info.type // 'mobile' | 'tablet' | 'desktop'
 const orientation: Orientation = info.orientation // 'portrait' | 'landscape'
}
```

### Vue 3 深度集成

提供 Composition API、指令、插件等多种使用方式，与 Vue 3 响应式系统完美融合。

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { isMobile, isTablet, isDesktop } = useDevice()
</script>

<template>
 <div v-device="'mobile'">移动端专属内容</div>
</template>
```

### 事件驱动

完善的事件系统，实时响应设备变化。

```typescript
detector.on('deviceChange', (info) => {
 console.log('设备类型变化:', info.type)
})

detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化:', orientation)
})
```

## 主要使用场景

### 响应式布局

根据设备类型动态调整页面布局：

```vue
<template>
 <div>
  <MobileLayout v-if="isMobile" />
  <TabletLayout v-else-if="isTablet" />
  <DesktopLayout v-else />
 </div>
</template>
```

### 性能优化

根据设备性能调整功能：

```typescript
if (detector.isMobile()) {
 // 移动设备使用低分辨率图片
 loadLowResImages()
} else {
 // 桌面设备使用高清图片
 loadHighResImages()
}
```

### 触摸优化

针对触摸设备优化交互：

```typescript
if (detector.isTouchDevice()) {
 enableTouchGestures()
 increaseTouchTargetSize()
} else {
 enableMouseHover()
 showTooltips()
}
```

### 屏幕方向适配

响应屏幕旋转：

```typescript
detector.on('orientationChange', (orientation) => {
 if (orientation === 'landscape') {
  showWideScreenLayout()
 } else {
  showNarrowLayout()
 }
})
```

## 浏览器兼容性

@ldesign/device 支持所有主流现代浏览器：

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Chrome Mobile 60+

对于不支持某些高级功能的浏览器，库会自动进行优雅降级，确保基础功能正常工作。

## 接下来

现在你已经了解了 @ldesign/device 的基本概念，可以继续阅读以下章节：

- [快速开始](./getting-started.md) - 安装和基础使用
- [配置选项](./configuration.md) - 详细的配置说明
- [设备检测](./device-detection.md) - 设备检测功能详解
- [事件系统](./events.md) - 事件监听和处理
- [模块系统](./modules.md) - 扩展模块使用指南

如果你在使用过程中遇到问题，可以查看 [常见问题](./faq.md) 或在 [GitHub Issues](https://github.com/ldesign-org/device/issues) 提出。
