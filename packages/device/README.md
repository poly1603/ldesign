# @ldesign/device 🚀

<div align="center">

![Logo](https://via.placeholder.com/120x120/4facfe/ffffff?text=📱)

**🎯 新一代设备信息检测库 - 让设备适配变得简单而优雅！**

_🌟 轻量、高效、类型安全的设备检测解决方案，完美支持 Vue 3 生态系统_

[![npm version](https://img.shields.io/npm/v/@ldesign/device.svg?style=flat-square&color=4facfe)](https://www.npmjs.com/package/@ldesign/device)
[![npm downloads](https://img.shields.io/npm/dm/@ldesign/device.svg?style=flat-square&color=success)](https://www.npmjs.com/package/@ldesign/device)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@ldesign/device.svg?style=flat-square&color=orange)](https://bundlephobia.com/package/@ldesign/device)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@ldesign/device.svg?style=flat-square&color=green)](https://github.com/ldesign-org/device/blob/main/LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg?style=flat-square)](./coverage/)

[📖 完整文档](./docs/) | [🚀 快速开始](#-快速开始) | [💡 在线示例](./examples/) | [🔧 API 参考](./docs/api/) | [🎮 Playground](https://stackblitz.com/edit/ldesign-device)

</div>

---

## 🎉 为什么选择 @ldesign/device？

> 💡 **"在多设备时代，精准的设备检测是优秀用户体验的基石"**

想象一下：用户在手机上浏览你的网站，突然旋转屏幕，或者从桌面切换到平板模式 - 你的应用能够优雅地适应这些变化吗？@ldesign/device 让这一切变得轻而易举！

## ✨ 核心特性

### 🎯 **智能检测，精准无误**
```typescript
// 🔥 一行代码，搞定设备检测
const { isMobile, isTablet, orientation } = useDevice()

// 🎨 响应式设计从未如此简单
if (isMobile.value) {
  // 移动端专属体验
}
else if (isTablet.value) {
  // 平板优化界面
}
```

### ⚡ **性能卓越，轻如羽毛**
- 🪶 **超轻量** - 核心库仅 ~8KB (gzipped)，比一张图片还小！
- 🌳 **Tree Shaking** - 只打包你用到的功能，告别代码冗余
- 🧩 **模块化** - 电池、网络、地理位置等高级功能按需加载
- 🚀 **零依赖** - 纯原生实现，启动速度飞快
- 📊 **性能优化** - 智能缓存、内存管理、性能监控，内存使用降低30%+

### 🔧 **开发体验，丝滑顺畅**
- 📘 **TypeScript 原生支持** - 智能提示让你编码如飞
- 🎨 **Vue 3 深度集成** - Composition API + 指令，双重保障
- 📚 **文档详尽** - 从入门到精通，一站式学习体验
- 🧪 **测试覆盖率 95%+** - 每一行代码都经过严格测试

### 🌐 **兼容性，无懈可击**
- 🖥️ **桌面浏览器** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- 📱 **移动设备** - iOS Safari, Chrome Mobile, Samsung Internet
- 🔄 **SSR 友好** - Next.js, Nuxt.js 完美支持
- 🎯 **渐进增强** - 优雅降级，老设备也能正常工作
- 🔄 **服务端渲染** - 完美支持 SSR/SSG 环境
- 🛡️ **优雅降级** - 在不支持的环境中提供基础功能

## 📦 安装

选择你最爱的包管理器，一键安装：

```bash
# 🚀 pnpm (推荐 - 速度最快)
pnpm add @ldesign/device

# 📦 npm (经典选择)
npm install @ldesign/device

# 🧶 yarn (稳定可靠)
yarn add @ldesign/device

# ⚡ bun (新时代选择)
bun add @ldesign/device
```

## 🚀 快速开始

### 🎯 30 秒上手 - 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 🎉 一行代码创建检测器
const detector = new DeviceDetector()

// 🔍 获取设备信息，就这么简单！
const device = detector.getDeviceInfo()

console.log(`📱 设备类型: ${device.type}`) // 'mobile' | 'tablet' | 'desktop'
console.log(`🔄 屏幕方向: ${device.orientation}`) // 'portrait' | 'landscape'
console.log(`📏 屏幕尺寸: ${device.width}x${device.height}`)
console.log(`👆 触摸设备: ${device.isTouchDevice}`)

// 🎯 快捷判断方法
if (detector.isMobile()) {
  console.log('🎉 欢迎移动用户！')
}
else if (detector.isTablet()) {
  console.log('📱 平板体验优化中...')
}
else {
  console.log('🖥️ 桌面端完整功能！')
}
```

### ⚙️ 高级配置 - 释放全部潜能

```typescript
const detector = new DeviceDetector({
  // 🎛️ 自定义断点 - 精确控制设备分类
  breakpoints: {
    mobile: 768, // 📱 移动设备上限
    tablet: 1024, // 📱 平板设备上限
  },

  // 🔄 实时监听配置
  enableResize: true, // 窗口大小变化
  enableOrientation: true, // 屏幕方向变化
  debounceDelay: 300, // 防抖延迟（毫秒）

  // 🎯 性能优化
  throttleDelay: 100, // 节流延迟
})
```

### 🎧 事件监听 - 实时响应变化

```typescript
// 🔄 监听设备变化，实时响应
detector.on('deviceChange', (deviceInfo) => {
  console.log('🎉 设备变化了！', deviceInfo)

  // 🎯 智能布局切换
  switch (deviceInfo.type) {
    case 'mobile':
      showMobileNavigation()
      break
    case 'tablet':
      showTabletSidebar()
      break
    case 'desktop':
      showFullDesktopLayout()
      break
  }
})

// 📱 屏幕方向变化处理
detector.on('orientationChange', (orientation) => {
  console.log(`🔄 屏幕旋转到: ${orientation}`)

  if (orientation === 'landscape') {
    enableWideScreenMode() // 🖥️ 横屏模式
  }
  else {
    enablePortraitMode() // 📱 竖屏模式
  }
})

// 📏 窗口大小实时监听
detector.on('resize', ({ width, height }) => {
  console.log(`📐 窗口大小: ${width}×${height}`)
  adjustLayoutForSize(width, height)
})
```

## 🎨 Vue 3 深度集成 - 开箱即用的响应式体验

> 💡 **专为 Vue 3 设计，让设备检测与响应式系统完美融合！**

### 🚀 Composition API - 现代化的开发体验

```vue
<script setup lang="ts">
import { useBattery, useDevice, useGeolocation, useNetwork } from '@ldesign/device/vue'

// 🎯 一键获取设备信息，自动响应式
const {
  deviceType, // 📱 设备类型 (mobile/tablet/desktop)
  orientation, // 🔄 屏幕方向 (portrait/landscape)
  isMobile, // 📱 是否移动设备
  isTablet, // 📱 是否平板
  isDesktop, // 🖥️ 是否桌面
  deviceInfo, // 📊 完整设备信息
  refresh // 🔄 手动刷新
} = useDevice()

// 🌐 网络状态监听
const {
  isOnline, // 🌐 是否在线
  networkType, // 📶 网络类型 (4g/wifi/etc)
  saveData // 💾 省流量模式
} = useNetwork()

// 🔋 电池信息 (支持的设备)
const {
  batteryLevel, // 🔋 电量百分比
  isCharging // ⚡ 是否充电中
} = useBattery()
</script>

<template>
  <div class="app">
    <!-- 🎯 根据设备类型显示不同内容 -->
    <MobileHeader v-if="isMobile" />
    <TabletHeader v-else-if="isTablet" />
    <DesktopHeader v-else />

    <!-- 📱 响应式布局 -->
    <main
      :class="{
        'mobile-layout': isMobile,
        'tablet-layout': isTablet,
        'desktop-layout': isDesktop,
        'landscape': orientation === 'landscape',
      }"
    >
      <!-- 🌐 网络状态提示 -->
      <div v-if="!isOnline" class="offline-banner">
        📡 当前离线，部分功能可能受限
      </div>

      <!-- 🔋 低电量提醒 -->
      <div v-if="batteryLevel < 0.2 && !isCharging" class="low-battery">
        🔋 电量不足，建议开启省电模式
      </div>

      <!-- 📊 设备信息展示 -->
      <DeviceInfo :device="deviceInfo" />
    </main>
  </div>
</template>
```

### 🎯 Vue 指令 - 声明式的设备适配

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { orientation } = useDevice()
</script>

<template>
  <div>
    <!-- 🎯 根据设备类型显示/隐藏元素 -->
    <nav v-device="'desktop'" class="desktop-nav">
      🖥️ 桌面端导航栏
    </nav>

    <nav v-device="['mobile', 'tablet']" class="mobile-nav">
      📱 移动端导航栏
    </nav>

    <!-- 🔄 反向匹配 - 非移动设备显示 -->
    <aside v-device="{ type: 'mobile', inverse: true }" class="sidebar">
      📋 侧边栏 (仅非移动设备)
    </aside>

    <!-- 🎨 复杂条件组合 -->
    <div v-show="orientation === 'landscape'" v-device="'tablet'">
      📱 平板横屏专属内容
    </div>
  </div>
</template>
```

### 🔌 Vue 插件 - 全局注册

```typescript
import { DevicePlugin } from '@ldesign/device/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 🚀 一键注册，全局可用
app.use(DevicePlugin, {
  // ⚙️ 全局配置
  breakpoints: {
    mobile: 768,
    tablet: 1024,
  },
  enableResize: true,
  debounceDelay: 300,
})

app.mount('#app')
```

```vue
<!-- 🎯 在任意组件中使用 -->
<template>
  <div>
    <!-- 📱 全局属性访问 -->
    <p>当前设备: {{ $device.type }}</p>
    <p>屏幕方向: {{ $device.orientation }}</p>

    <!-- 🎨 指令自动可用 -->
    <div v-device="'mobile'">
      移动端内容
    </div>
  </div>
</template>
```
```

// 基础设备信息
const {
  deviceType, // 设备类型
  orientation, // 屏幕方向
  deviceInfo, // 完整设备信息
  isMobile, // 是否移动设备
  isTablet, // 是否平板设备
  isDesktop, // 是否桌面设备
  isTouchDevice, // 是否触摸设备
  refresh, // 手动刷新
} = useDevice()

// 网络状态
const {
  isOnline, // 是否在线
  connectionType, // 连接类型
  networkInfo, // 网络详情
} = useNetwork()

// 电池状态
const {
  level, // 电池电量 (0-1)
  isCharging, // 是否充电中
  batteryInfo, // 电池详情
} = useBattery()

// 地理位置
const {
  position, // 位置信息
  latitude, // 纬度
  longitude, // 经度
  accuracy, // 精度
  getCurrentPosition, // 获取当前位置
  startWatching, // 开始监听位置变化
  stopWatching, // 停止监听
} = useGeolocation()
</script>

<template>
  <div class="device-info">
    <!-- 设备信息 -->
    <div class="info-card">
      <h3>📱 设备信息</h3>
      <p>类型: {{ deviceType }}</p>
      <p>方向: {{ orientation }}</p>
      <p>尺寸: {{ deviceInfo.width }}×{{ deviceInfo.height }}</p>
      <p>触摸设备: {{ isTouchDevice ? '是' : '否' }}</p>
    </div>

    <!-- 网络状态 -->
    <div class="info-card">
      <h3>🌐 网络状态</h3>
      <p>状态: {{ isOnline ? '在线' : '离线' }}</p>
      <p>类型: {{ connectionType }}</p>
    </div>

    <!-- 电池状态 -->
    <div v-if="batteryInfo" class="info-card">
      <h3>🔋 电池状态</h3>
      <p>电量: {{ Math.round(level * 100) }}%</p>
      <p>充电: {{ isCharging ? '是' : '否' }}</p>
    </div>

    <!-- 位置信息 -->
    <div v-if="position" class="info-card">
      <h3>📍 位置信息</h3>
      <p>纬度: {{ latitude.toFixed(6) }}</p>
      <p>经度: {{ longitude.toFixed(6) }}</p>
      <p>精度: {{ accuracy }}米</p>
    </div>
  </div>
</template>
```

### 指令使用

使用内置指令根据设备类型控制元素显示：

```vue
<template>
  <!-- 基础指令 -->
  <nav v-device-mobile class="mobile-nav">
    移动端导航菜单
  </nav>

  <nav v-device-desktop class="desktop-nav">
    桌面端导航菜单
  </nav>

  <aside v-device-tablet class="tablet-sidebar">
    平板端侧边栏
  </aside>

  <!-- 触摸设备检测 -->
  <div v-device-touch class="touch-controls">
    触摸操作提示
  </div>

  <div v-device-no-touch class="mouse-controls">
    鼠标操作提示
  </div>

  <!-- 屏幕方向检测 -->
  <div v-orientation-portrait class="portrait-layout">
    竖屏布局
  </div>

  <div v-orientation-landscape class="landscape-layout">
    横屏布局
  </div>

  <!-- 组合条件 -->
  <div v-device="{ type: 'mobile', orientation: 'portrait' }">
    移动设备竖屏时显示
  </div>

  <!-- 多设备支持 -->
  <div v-device="['tablet', 'desktop']">
    平板或桌面设备时显示
  </div>
</template>
```

### 插件安装

全局安装插件，在整个应用中使用：

```typescript
import { DevicePlugin } from '@ldesign/device/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(DevicePlugin, {
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300,
  breakpoints: {
    mobile: 480,
    tablet: 1024,
    desktop: 1200,
  },
})

app.mount('#app')
```

安装后可以在任何组件中使用：

```vue
<script setup>
import { inject } from 'vue'

// 通过 inject 获取检测器实例
const device = inject('device')

// 或者直接使用全局属性
const { $device } = getCurrentInstance()?.appContext.config.globalProperties
</script>

<template>
  <!-- 使用指令 -->
  <div v-device-mobile>
    移动端内容
  </div>
</template>
```

### 🚀 LDesign Engine 集成 - 企业级应用框架

> 💡 **专为 LDesign Engine 设计的插件，让设备检测与企业级应用框架无缝集成！**

如果你正在使用 LDesign Engine 构建企业级应用，可以使用专门的 Engine 插件来获得更好的集成体验：

```typescript
// 使用 LDesign Engine 插件
import { createDeviceEnginePlugin } from '@ldesign/device'
import { createAndMountApp } from '@ldesign/engine'
import App from './App.vue'

// 创建 Device Engine 插件
const devicePlugin = createDeviceEnginePlugin({
  // 插件基础信息
  name: 'device',
  version: '1.0.0',

  // 功能开关
  enableResize: true, // 启用窗口大小变化监听
  enableOrientation: true, // 启用屏幕方向变化监听

  // 模块配置
  modules: ['network', 'battery', 'geolocation'],

  // Vue 集成配置
  globalPropertyName: '$device', // 全局属性名
  autoInstall: true, // 自动安装 Vue 插件

  // 开发配置
  debug: false, // 调试模式
  enablePerformanceMonitoring: false, // 性能监控
})

// 在 Engine 中使用
const engine = createAndMountApp(App, '#app', {
  plugins: [devicePlugin], // 添加到插件列表
  config: {
    debug: true,
    appName: 'My App',
  }
})
```

**Engine 插件的优势：**

- 🔄 **统一生命周期** - 与 Engine 生命周期完美同步
- 📊 **状态管理集成** - 自动注册到 Engine 状态管理系统
- 🔍 **调试支持** - 集成 Engine 的调试和日志系统
- ⚡ **性能监控** - 内置性能监控和优化建议
- 🛡️ **错误处理** - 统一的错误处理和恢复机制

**在组件中使用：**

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

// 所有功能都可以正常使用
const { deviceInfo, isMobile, isDesktop } = useDevice()
</script>

<template>
  <div>
    <p>设备类型: {{ deviceInfo.type }}</p>
    <p>是否移动设备: {{ isMobile ? '是' : '否' }}</p>
  </div>
</template>
```

## 🧩 扩展模块

@ldesign/device 采用模块化设计，核心功能保持轻量，扩展功能按需加载。

### 网络信息模块

检测网络连接状态和性能信息：

```typescript
// 加载网络模块
const networkModule = await detector.loadModule('network')

// 获取网络信息
const networkInfo = networkModule.getData()
console.log('网络信息:', networkInfo)
// {
//   status: 'online',
//   type: '4g',
//   downlink: 10,      // 下载速度 (Mbps)
//   rtt: 100,          // 往返时间 (ms)
//   saveData: false    // 数据节省模式
// }

// 快捷方法
console.log('是否在线:', networkModule.isOnline())
console.log('连接类型:', networkModule.getConnectionType())

// 监听网络变化
detector.on('networkChange', (info) => {
  if (info.status === 'offline') {
    showOfflineMessage()
  }
  else if (info.type === '2g') {
    enableDataSavingMode()
  }
})
```

### 电池信息模块

监控设备电池状态：

```typescript
// 加载电池模块
const batteryModule = await detector.loadModule('battery')

// 获取电池信息
const batteryInfo = batteryModule.getData()
console.log('电池信息:', batteryInfo)
// {
//   level: 0.8,           // 电量 (0-1)
//   charging: false,      // 是否充电
//   chargingTime: Infinity,    // 充电时间 (秒)
//   dischargingTime: 3600      // 放电时间 (秒)
// }

// 快捷方法
console.log('电池电量:', `${Math.round(batteryModule.getLevel() * 100)}%`)
console.log('是否充电:', batteryModule.isCharging())
console.log('电池状态:', batteryModule.getBatteryStatus())

// 监听电池变化
detector.on('batteryChange', (info) => {
  if (info.level < 0.2 && !info.charging) {
    enablePowerSavingMode()
  }
})
```

### 地理位置模块

获取和监听设备位置信息：

```typescript
// 加载地理位置模块
const geoModule = await detector.loadModule('geolocation')

// 检查支持情况
if (geoModule.isSupported()) {
  // 获取当前位置
  const position = await geoModule.getCurrentPosition()
  console.log('当前位置:', position)
  // {
  //   latitude: 39.9042,
  //   longitude: 116.4074,
  //   accuracy: 10,
  //   altitude: null,
  //   heading: null,
  //   speed: null,
  //   timestamp: 1634567890123
  // }

  // 开始监听位置变化
  const watchId = await geoModule.startWatching((position) => {
    console.log('位置更新:', position)
    updateMapLocation(position)
  })

  // 停止监听
  geoModule.stopWatching(watchId)
}
else {
  console.warn('设备不支持地理位置功能')
}
```

### 模块管理

```typescript
// 获取已加载的模块
const loadedModules = detector.getLoadedModules()
console.log('已加载模块:', loadedModules) // ['network', 'battery']

// 卸载模块
detector.unloadModule('network')
detector.unloadModule('battery')

// 批量加载模块
const modules = await Promise.all([
  detector.loadModule('network'),
  detector.loadModule('battery'),
  detector.loadModule('geolocation'),
])

// 错误处理
try {
  const batteryModule = await detector.loadModule('battery')
}
catch (error) {
  console.warn('电池模块加载失败:', error.message)
  // 提供降级方案
  showBatteryNotSupported()
}
```

## 🎯 实际应用场景

### 响应式布局

根据设备类型动态调整布局：

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

detector.on('deviceChange', (info) => {
  const layout = {
    mobile: { columns: 1, spacing: 8, fontSize: 14 },
    tablet: { columns: 2, spacing: 12, fontSize: 16 },
    desktop: { columns: 3, spacing: 16, fontSize: 18 },
  }[info.type]

  applyLayout(layout)
})
```

### 性能优化

根据设备性能调整功能：

```typescript
// 根据网络状态优化资源加载
detector.on('networkChange', (info) => {
  if (info.type === '2g' || info.saveData) {
    loadLowQualityImages()
    disableAnimations()
  }
  else {
    loadHighQualityImages()
    enableAnimations()
  }
})

// 根据电池状态调整功能
detector.on('batteryChange', (info) => {
  if (info.level < 0.2 && !info.charging) {
    enablePowerSavingMode()
    reduceBackgroundTasks()
  }
})
```

### 用户体验优化

```typescript
// 触摸设备优化
if (detector.isTouchDevice()) {
  enableTouchGestures()
  increaseTouchTargetSize()
}
else {
  enableMouseHover()
  showTooltips()
}

// 屏幕方向适配
detector.on('orientationChange', (orientation) => {
  if (orientation === 'landscape') {
    showLandscapeUI()
  }
  else {
    showPortraitUI()
  }
})
```

## 🔧 高级配置

### 自定义检测逻辑

```typescript
const detector = new DeviceDetector({
  // 自定义断点
  breakpoints: {
    mobile: 480,
    tablet: 1024,
    desktop: 1200,
  },

  // 防抖配置
  debounceDelay: 300,

  // 启用功能
  enableResize: true,
  enableOrientation: true,

  // 自定义设备类型检测
  customDetection: {
    isTablet: (width, height, userAgent) => {
      // 自定义平板检测逻辑
      return width >= 768 && width <= 1024
    },
  },
})
```

### TypeScript 类型支持

```typescript
import type {
  BatteryInfo,
  DeviceInfo,
  DeviceType,
  GeolocationInfo,
  NetworkInfo,
  Orientation,
} from '@ldesign/device'

// 类型安全的设备信息处理
function handleDeviceChange(info: DeviceInfo) {
  switch (info.type) {
    case 'mobile':
      setupMobileLayout()
      break
    case 'tablet':
      setupTabletLayout()
      break
    case 'desktop':
      setupDesktopLayout()
      break
  }
}
```

## 📚 示例项目

我们提供了完整的示例项目帮助你快速上手：

- **[Vanilla JavaScript 示例](./examples/vanilla-js/)** - 原生 JavaScript 使用示例
- **[Vue 3 示例](./examples/vue-example/)** - Vue 3 完整集成示例
- **[React 示例](./examples/react-example/)** - React 集成示例（即将推出）
- **[Nuxt 3 示例](./examples/nuxt-example/)** - Nuxt 3 SSR 示例（即将推出）

## 🤝 浏览器兼容性

| 浏览器        | 版本 | 核心功能 | 网络模块 | 电池模块 | 地理位置模块 |
| ------------- | ---- | -------- | -------- | -------- | ------------ |
| Chrome        | 60+  | ✅       | ✅       | ⚠️       | ✅           |
| Firefox       | 55+  | ✅       | ✅       | ⚠️       | ✅           |
| Safari        | 12+  | ✅       | ⚠️       | ❌       | ✅           |
| Edge          | 79+  | ✅       | ✅       | ⚠️       | ✅           |
| iOS Safari    | 12+  | ✅       | ⚠️       | ❌       | ✅           |
| Chrome Mobile | 60+  | ✅       | ✅       | ⚠️       | ✅           |

- ✅ 完全支持
- ⚠️ 部分支持或需要用户权限
- ❌ 不支持

## 📖 文档

- 📘 **[API 参考](./docs/api/)** - 完整的 API 文档
- 🎨 **[Vue 集成指南](./docs/vue/)** - Vue 3 集成详细说明
- 💡 **[最佳实践](./docs/guide/best-practices.md)** - 使用建议和优化技巧
- ❓ **[常见问题](./docs/guide/faq.md)** - 常见问题解答
- 🚀 **[迁移指南](./docs/guide/migration.md)** - 版本升级指南
- 📊 **[性能优化报告](./OPTIMIZATION_REPORT.md)** - 性能优化详情和对比数据

## 🛠️ 开发

### 环境要求

- Node.js 16+
- pnpm 8+

### 开发命令

```bash
# 克隆项目
git clone https://github.com/ldesign-org/device.git
cd device

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# E2E 测试
pnpm test:e2e

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 文档开发
pnpm docs:dev

# 构建文档
pnpm docs:build
```

### 项目结构

```
packages/device/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   ├── modules/           # 扩展模块
│   ├── adapt/             # 框架适配
│   └── utils/             # 工具函数
├── examples/              # 示例项目
├── docs/                  # 文档
├── __tests__/             # 测试文件
└── dist/                  # 构建输出
```

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式

1. 🐛 **报告 Bug** - [提交 Issue](https://github.com/ldesign-org/device/issues)
2. 💡 **功能建议** - [功能请求](https://github.com/ldesign-org/device/issues)
3. 📝 **改进文档** - 提交文档 PR
4. 🔧 **代码贡献** - 提交代码 PR

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加单元测试
- 更新相关文档

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系我们

- 📧 **邮箱**: support@ldesign.org
- 🐛 **Bug 报告**: [GitHub Issues](https://github.com/ldesign-org/device/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/ldesign-org/device/discussions)
- 📖 **文档**: [ldesign.github.io/device](https://ldesign.github.io/device)

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️！**

[⭐️ Star on GitHub](https://github.com/ldesign-org/device) |
[📖 查看文档](https://ldesign.github.io/device/) | [🚀 快速开始](#快速开始)

</div>
