# 设备检测

> 📱 智能设备检测，为每种设备提供最佳用户体验！

## 🎯 概述

设备检测是模板系统的核心功能之一，它能够自动识别用户的设备类型，并选择最适合的模板进行渲染。

## 📱 支持的设备类型

### 设备分类

```typescript
type DeviceType = 'desktop' | 'tablet' | 'mobile'
```

- **🖥️ Desktop (桌面端)**: 屏幕宽度 ≥ 1024px
- **📱 Tablet (平板端)**: 屏幕宽度 768px - 1023px
- **📱 Mobile (移动端)**: 屏幕宽度 < 768px

### 检测规则

```typescript
function detectDevice(): DeviceType {
  const width = window.innerWidth

  if (width >= 1024)
    return 'desktop'
  if (width >= 768)
    return 'tablet'
  return 'mobile'
}
```

## 🔧 基础用法

### 自动检测

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  autoDetectDevice: true, // 启用自动设备检测
  defaultDevice: 'desktop' // 默认设备类型
})

// 获取当前设备类型
const currentDevice = manager.getCurrentDevice()
console.log('当前设备:', currentDevice)

// 渲染适合当前设备的模板
const template = await manager.render({
  category: 'login',
  device: 'auto', // 使用自动检测
  template: 'modern'
})
```

### 手动指定

```typescript
// 强制使用特定设备类型
const mobileTemplate = await manager.render({
  category: 'login',
  device: 'mobile',
  template: 'card'
})
```

## 🎨 Vue 集成

### 响应式设备检测

```vue
<script setup lang="ts">
import { useDeviceDetection } from '@ldesign/template/vue'
import { watch } from 'vue'

const {
  currentDevice,
  windowWidth,
  windowHeight,
  isDesktop,
  isTablet,
  isMobile
} = useDeviceDetection({
  enableResize: true, // 监听窗口大小变化
  debounceTime: 150 // 防抖时间
})

// 监听设备变化
watch(currentDevice, (newDevice, oldDevice) => {
  console.log(`设备类型从 ${oldDevice} 变更为 ${newDevice}`)
})
</script>

<template>
  <div class="device-info">
    <p>当前设备: {{ currentDevice }}</p>
    <p>窗口尺寸: {{ windowWidth }} × {{ windowHeight }}</p>

    <!-- 根据设备类型显示不同内容 -->
    <div v-if="isDesktop" class="desktop-content">
      🖥️ 桌面端专用内容
    </div>
    <div v-else-if="isTablet" class="tablet-content">
      📱 平板端专用内容
    </div>
    <div v-else class="mobile-content">
      📱 移动端专用内容
    </div>
  </div>
</template>
```

### 设备特定样式

```vue
<script setup lang="ts">
import { useDeviceDetection } from '@ldesign/template/vue'
import { computed } from 'vue'

const { currentDevice } = useDeviceDetection()

const deviceClass = computed(() => `device-${currentDevice.value}`)
</script>

<template>
  <div class="responsive-container" :class="deviceClass">
    <component :is="currentTemplate" />
  </div>
</template>

<style scoped>
.responsive-container {
  padding: 1rem;
}

.device-desktop {
  max-width: 1200px;
  margin: 0 auto;
}

.device-tablet {
  max-width: 768px;
  padding: 1.5rem;
}

.device-mobile {
  padding: 1rem 0.5rem;
}
</style>
```

## 🔄 动态切换

### 实时响应

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector({
  enableResize: true,
  onDeviceChange: async (newDevice, oldDevice) => {
    console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)

    // 自动切换到适合新设备的模板
    await manager.switchTemplate('login', newDevice, 'modern')
  }
})

// 开始监听
detector.start()

// 停止监听
detector.stop()
```

### 防抖处理

```typescript
const detector = new DeviceDetector({
  debounceTime: 300, // 300ms 防抖
  onDeviceChange: (device) => {
    // 避免频繁触发
    console.log('设备类型稳定为:', device)
  }
})
```

## 🎯 高级检测

### 自定义断点

```typescript
const manager = new TemplateManager({
  deviceBreakpoints: {
    mobile: 0, // 0 - 767px
    tablet: 768, // 768 - 1199px
    desktop: 1200 // 1200px+
  }
})
```

### 多维度检测

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector({
  detectTouch: true, // 检测触摸支持
  detectOrientation: true, // 检测屏幕方向
  detectPixelRatio: true // 检测像素密度
})

const deviceInfo = detector.getDeviceInfo()
console.log('设备信息:', {
  type: deviceInfo.type,
  hasTouch: deviceInfo.hasTouch,
  orientation: deviceInfo.orientation, // 'portrait' | 'landscape'
  pixelRatio: deviceInfo.pixelRatio,
  userAgent: deviceInfo.userAgent
})
```

### 设备特征检测

```typescript
// 检测特定设备特征
const features = detector.detectFeatures()
console.log('设备特征:', {
  isMobile: features.isMobile,
  isTablet: features.isTablet,
  isDesktop: features.isDesktop,
  hasTouch: features.hasTouch,
  hasKeyboard: features.hasKeyboard,
  hasHover: features.hasHover,
  supportsWebGL: features.supportsWebGL
})
```

## 📊 设备统计

### 使用统计

```typescript
// 记录设备使用情况
const stats = manager.getDeviceStats()
console.log('设备使用统计:', {
  desktop: stats.desktop, // 桌面端使用次数
  tablet: stats.tablet, // 平板端使用次数
  mobile: stats.mobile, // 移动端使用次数
  total: stats.total // 总使用次数
})
```

### 性能监控

```typescript
const manager = new TemplateManager({
  enableMetrics: true,
  onMetrics: (metrics) => {
    console.log('性能指标:', {
      device: metrics.device,
      loadTime: metrics.loadTime,
      renderTime: metrics.renderTime,
      memoryUsage: metrics.memoryUsage
    })
  }
})
```

## 🎨 模板适配策略

### 渐进式适配

```typescript
// 优先级策略：精确匹配 > 兼容匹配 > 默认模板
const template = await manager.render({
  category: 'login',
  device: 'tablet',
  template: 'modern',
  fallbackStrategy: 'progressive' // 渐进式回退
})

// 回退顺序：
// 1. login-tablet-modern
// 2. login-tablet-default
// 3. login-desktop-modern
// 4. login-desktop-default
```

### 智能适配

```typescript
const manager = new TemplateManager({
  adaptationStrategy: 'smart',
  adaptationRules: {
    // 平板端优先使用桌面端模板
    tablet: {
      fallback: 'desktop',
      scaleRatio: 0.8
    },
    // 移动端使用专用模板
    mobile: {
      fallback: 'tablet',
      touchOptimized: true
    }
  }
})
```

## 🔧 配置选项

### 完整配置

```typescript
const manager = new TemplateManager({
  // 设备检测配置
  deviceDetection: {
    enabled: true,
    method: 'viewport', // 'viewport' | 'userAgent' | 'hybrid'
    breakpoints: {
      mobile: 768,
      tablet: 1024
    },
    debounceTime: 150,
    enableResize: true,
    enableOrientation: true
  },

  // 适配策略
  adaptationStrategy: {
    fallbackOrder: ['exact', 'device', 'category', 'default'],
    scaleFactors: {
      tablet: 0.9,
      mobile: 0.8
    }
  }
})
```

## 💡 最佳实践

### 1. 性能优化

```typescript
// 预加载常用设备的模板
await manager.preloadTemplates([
  { category: 'login', device: 'desktop' },
  { category: 'login', device: 'mobile' }
])
```

### 2. 用户体验

```typescript
// 平滑的设备切换动画
const manager = new TemplateManager({
  transitionConfig: {
    duration: 300,
    easing: 'ease-in-out',
    onTransitionStart: () => console.log('切换开始'),
    onTransitionEnd: () => console.log('切换完成')
  }
})
```

### 3. 调试支持

```typescript
// 开发环境下的设备模拟
if (process.env.NODE_ENV === 'development') {
  manager.enableDeviceSimulation({
    showDeviceIndicator: true,
    allowManualSwitch: true
  })
}
```

## 🔗 相关链接

- [模板管理](/guide/template-management)
- [缓存机制](/guide/caching)
- [性能优化](/guide/performance)
- [API 参考](/api/device-detector)
