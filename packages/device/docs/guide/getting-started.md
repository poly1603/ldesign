# 快速开始

本指南将帮助你快速上手 @ldesign/device，从安装到基础使用，一步步带你体验设备检测的强大功能。

## 安装

选择你喜欢的包管理器进行安装：

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

## 基础使用

### 创建设备检测器

最简单的使用方式是创建一个 `DeviceDetector` 实例：

```typescript
import { DeviceDetector } from '@ldesign/device'

// 使用默认配置创建检测器
const detector = new DeviceDetector()

// 获取当前设备信息
const deviceInfo = detector.getDeviceInfo()

console.log('设备类型:', deviceInfo.type) // 'mobile' | 'tablet' | 'desktop'
console.log('屏幕方向:', deviceInfo.orientation) // 'portrait' | 'landscape'
console.log('屏幕尺寸:', deviceInfo.width, 'x', deviceInfo.height)
console.log('是否触摸设备:', deviceInfo.isTouchDevice)
```

### 使用快捷方法

`DeviceDetector` 提供了一些便捷的方法来快速判断设备类型：

```typescript
// 判断设备类型
if (detector.isMobile()) {
 console.log('这是一个移动设备')
}

if (detector.isTablet()) {
 console.log('这是一个平板设备')
}

if (detector.isDesktop()) {
 console.log('这是一个桌面设备')
}

// 判断是否支持触摸
if (detector.isTouchDevice()) {
 console.log('支持触摸操作')
}

// 获取设备类型和方向
const type = detector.getDeviceType() // 'mobile' | 'tablet' | 'desktop'
const orientation = detector.getOrientation() // 'portrait' | 'landscape'
```

### 监听设备变化

设备信息可能会在运行时发生变化（如窗口大小调整、屏幕旋转等），你可以通过事件监听来响应这些变化：

```typescript
// 监听设备类型变化
detector.on('deviceChange', (deviceInfo) => {
 console.log('设备类型变化为:', deviceInfo.type)

 // 根据新的设备类型调整布局
 updateLayout(deviceInfo.type)
})

// 监听屏幕方向变化
detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化为:', orientation)

 // 根据新的方向调整界面
 updateOrientation(orientation)
})

// 监听窗口大小变化
detector.on('resize', ({ width, height }) => {
 console.log('窗口大小变化为:', width, 'x', height)
})
```

## Vue 3 集成

如果你使用 Vue 3，@ldesign/device 提供了更便捷的集成方式。

### 使用 Composition API

在 Vue 组件中使用 `useDevice` composable：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

// 获取响应式的设备信息
const {
 deviceType,   // 设备类型
 orientation,   // 屏幕方向
 deviceInfo,   // 完整设备信息
 isMobile,    // 是否移动设备
 isTablet,    // 是否平板
 isDesktop,    // 是否桌面
 isTouchDevice,  // 是否触摸设备
 refresh     // 手动刷新方法
} = useDevice()
</script>

<template>
 <div>
  <!-- 根据设备类型显示不同内容 -->
  <div v-if="isMobile" class="mobile-layout">
   <h1>移动端界面</h1>
   <p>设备类型: {{ deviceType }}</p>
   <p>屏幕方向: {{ orientation }}</p>
  </div>

  <div v-else-if="isTablet" class="tablet-layout">
   <h1>平板界面</h1>
  </div>

  <div v-else class="desktop-layout">
   <h1>桌面界面</h1>
  </div>

  <!-- 显示完整设备信息 -->
  <div class="device-info">
   <p>屏幕尺寸: {{ deviceInfo.width }} × {{ deviceInfo.height }}</p>
   <p>像素比: {{ deviceInfo.pixelRatio }}</p>
   <p>触摸支持: {{ isTouchDevice ? '是' : '否' }}</p>
   <p>浏览器: {{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</p>
   <p>操作系统: {{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</p>
  </div>

  <!-- 手动刷新按钮 -->
  <button @click="refresh">刷新设备信息</button>
 </div>
</template>

<style scoped>
.mobile-layout { padding: 8px; }
.tablet-layout { padding: 16px; }
.desktop-layout { padding: 24px; }
</style>
```

### 使用指令

@ldesign/device 还提供了 Vue 指令，让你可以声明式地控制元素的显示：

```vue
<template>
 <div>
  <!-- 只在移动设备显示 -->
  <nav v-device="'mobile'" class="mobile-nav">
   移动端导航
  </nav>

  <!-- 只在平板或桌面显示 -->
  <nav v-device="['tablet', 'desktop']" class="desktop-nav">
   桌面端导航
  </nav>

  <!-- 只在桌面显示 -->
  <aside v-device="'desktop'" class="sidebar">
   侧边栏（仅桌面）
  </aside>

  <!-- 反向匹配：非移动设备显示 -->
  <div v-device="{ type: 'mobile', inverse: true }">
   非移动设备内容
  </div>
 </div>
</template>
```

### 全局插件

你可以将 @ldesign/device 作为 Vue 插件全局安装：

```typescript
// main.ts
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(DevicePlugin, {
 // 自定义配置
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 768,
  tablet: 1024
 }
})

app.mount('#app')
```

安装插件后，你可以在任何组件中通过全局属性访问设备信息：

```vue
<template>
 <div>
  <p>当前设备: {{ $device.type }}</p>
  <p>屏幕方向: {{ $device.orientation }}</p>
 </div>
</template>

<script setup>
import { inject } from 'vue'

// 或者通过 inject 获取检测器实例
const device = inject('device')
</script>
```

## 自定义配置

你可以在创建检测器时传入配置选项：

```typescript
const detector = new DeviceDetector({
 // 自定义断点
 breakpoints: {
  mobile: 768,  // 小于 768px 为移动设备
  tablet: 1024  // 768px-1024px 为平板
 },

 // 启用窗口大小变化监听
 enableResize: true,

 // 启用屏幕方向变化监听
 enableOrientation: true,

 // 事件防抖延迟（毫秒）
 debounceDelay: 300
})
```

更多配置选项请参考 [配置选项](./configuration.md)。

## 完整示例

下面是一个完整的示例，展示了如何在 Vue 3 应用中使用 @ldesign/device：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'
import { computed } from 'vue'

const {
 deviceType,
 isMobile,
 isTablet,
 isDesktop,
 orientation,
 deviceInfo
} = useDevice()

// 计算布局类名
const layoutClass = computed(() => ({
 'layout-mobile': isMobile.value,
 'layout-tablet': isTablet.value,
 'layout-desktop': isDesktop.value,
 'layout-portrait': orientation.value === 'portrait',
 'layout-landscape': orientation.value === 'landscape'
}))

// 计算列数
const columns = computed(() => {
 if (isMobile.value) return 1
 if (isTablet.value) return 2
 return 3
})
</script>

<template>
 <div :class="layoutClass">
  <!-- 响应式导航 -->
  <header>
   <nav v-if="isMobile" class="mobile-nav">
    <button class="menu-toggle">☰</button>
   </nav>
   <nav v-else class="desktop-nav">
    <a href="/">首页</a>
    <a href="/about">关于</a>
    <a href="/contact">联系</a>
   </nav>
  </header>

  <!-- 响应式网格 -->
  <main :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
   <div v-for="i in 6" :key="i" class="card">
    卡片 {{ i }}
   </div>
  </main>

  <!-- 设备信息面板 -->
  <aside v-if="isDesktop" class="device-panel">
   <h3>设备信息</h3>
   <dl>
    <dt>设备类型</dt>
    <dd>{{ deviceType }}</dd>

    <dt>屏幕方向</dt>
    <dd>{{ orientation }}</dd>

    <dt>屏幕尺寸</dt>
    <dd>{{ deviceInfo.width }} × {{ deviceInfo.height }}</dd>

    <dt>像素比</dt>
    <dd>{{ deviceInfo.pixelRatio }}</dd>
   </dl>
  </aside>
 </div>
</template>

<style scoped>
.layout-mobile { padding: 8px; }
.layout-tablet { padding: 16px; }
.layout-desktop { padding: 24px; }

main {
 display: grid;
 gap: 16px;
 margin: 20px 0;
}

.card {
 padding: 20px;
 background: #f0f0f0;
 border-radius: 8px;
}

.device-panel {
 position: fixed;
 top: 20px;
 right: 20px;
 padding: 16px;
 background: white;
 border-radius: 8px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
```

## 下一步

现在你已经掌握了 @ldesign/device 的基础使用，可以继续探索更多功能：

- [配置选项](./configuration.md) - 了解所有配置选项
- [设备检测](./device-detection.md) - 深入了解设备检测功能
- [事件系统](./events.md) - 掌握事件监听和处理
- [模块系统](./modules.md) - 使用网络、电池等扩展模块
- [最佳实践](./best-practices.md) - 学习最佳实践和优化技巧
