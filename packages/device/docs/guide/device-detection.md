# 设备检测指南

本指南详细介绍 @ldesign/device 的设备检测功能，帮助你充分利用这个强大的工具。

## 设备类型检测

@ldesign/device 可以自动识别三种主要设备类型：

- **mobile** - 移动设备（手机）
- **tablet** - 平板设备
- **desktop** - 桌面设备

### 基本检测

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

// 方式 1：使用快捷方法
if (detector.isMobile()) {
 console.log('当前是移动设备')
}

if (detector.isTablet()) {
 console.log('当前是平板设备')
}

if (detector.isDesktop()) {
 console.log('当前是桌面设备')
}

// 方式 2：获取设备类型字符串
const deviceType = detector.getDeviceType()
console.log('设备类型:', deviceType) // 'mobile' | 'tablet' | 'desktop'

// 方式 3：从完整设备信息中获取
const deviceInfo = detector.getDeviceInfo()
console.log('设备类型:', deviceInfo.type)
```

### 检测原理

设备类型主要基于屏幕宽度判断：

```typescript
// 默认断点
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,  // 宽度 < 768px → 移动设备
  tablet: 1024  // 768px ≤ 宽度 < 1024px → 平板设备
          // 宽度 ≥ 1024px → 桌面设备
 }
})
```

你可以根据项目需求自定义断点。更多信息请参考 [配置选项](./configuration.md#breakpoints)。

## 屏幕方向检测

检测屏幕是横屏还是竖屏：

```typescript
// 获取当前方向
const orientation = detector.getOrientation()
console.log('屏幕方向:', orientation) // 'portrait' 或 'landscape'

// 从设备信息中获取
const deviceInfo = detector.getDeviceInfo()
console.log('方向:', deviceInfo.orientation)
```

方向判断规则：
- **portrait**（竖屏）: 高度 > 宽度
- **landscape**（横屏）: 宽度 ≥ 高度

## 触摸设备检测

检测设备是否支持触摸：

```typescript
// 方式 1：使用快捷方法
if (detector.isTouchDevice()) {
 console.log('支持触摸操作')
 enableTouchGestures()
} else {
 console.log('不支持触摸')
 enableMouseInteractions()
}

// 方式 2：从设备信息中获取
const deviceInfo = detector.getDeviceInfo()
if (deviceInfo.isTouchDevice) {
 // 触摸设备特殊处理
}

// 方式 3：从 features 对象获取
if (deviceInfo.features.touch) {
 // 启用触摸功能
}
```

## 完整设备信息

`getDeviceInfo()` 方法返回包含所有设备信息的对象：

```typescript
const deviceInfo = detector.getDeviceInfo()

console.log(deviceInfo)
// {
//  type: 'mobile',          // 设备类型
//  orientation: 'portrait',      // 屏幕方向
//  width: 375,             // 窗口宽度
//  height: 667,            // 窗口高度
//  pixelRatio: 2,           // 像素比
//  isTouchDevice: true,        // 是否触摸设备
//  userAgent: 'Mozilla/5.0...',    // 用户代理字符串
//  os: {                // 操作系统信息
//   name: 'iOS',
//   version: '15.0'
//  },
//  browser: {             // 浏览器信息
//   name: 'Safari',
//   version: '15.0'
//  },
//  screen: {              // 屏幕信息
//   width: 375,
//   height: 667,
//   pixelRatio: 2,
//   availWidth: 375,
//   availHeight: 667
//  },
//  features: {             // 功能支持
//   touch: true,
//   webgl: true
//  }
// }
```

### 屏幕信息

```typescript
const { screen } = deviceInfo

console.log('屏幕宽度:', screen.width)
console.log('屏幕高度:', screen.height)
console.log('像素比:', screen.pixelRatio)
console.log('可用宽度:', screen.availWidth)
console.log('可用高度:', screen.availHeight)

// 计算物理分辨率
const physicalWidth = screen.width * screen.pixelRatio
const physicalHeight = screen.height * screen.pixelRatio
console.log('物理分辨率:', physicalWidth, 'x', physicalHeight)
```

### 操作系统信息

```typescript
const { os } = deviceInfo

console.log('操作系统:', os.name)  // 'Windows', 'macOS', 'iOS', 'Android' 等
console.log('系统版本:', os.version)

// 根据操作系统执行不同逻辑
switch (os.name) {
 case 'iOS':
  console.log('iOS 设备')
  break
 case 'Android':
  console.log('Android 设备')
  break
 case 'Windows':
  console.log('Windows 系统')
  break
 case 'macOS':
  console.log('macOS 系统')
  break
}
```

### 浏览器信息

```typescript
const { browser } = deviceInfo

console.log('浏览器:', browser.name)   // 'Chrome', 'Firefox', 'Safari' 等
console.log('浏览器版本:', browser.version)

// 根据浏览器执行特定逻辑
if (browser.name === 'Safari') {
 // Safari 特殊处理
}
```

### 功能检测

```typescript
const { features } = deviceInfo

// 触摸支持
if (features.touch) {
 console.log('支持触摸')
}

// WebGL 支持
if (features.webgl) {
 console.log('支持 WebGL')
 enableWebGLFeatures()
}
```

## 实时更新

设备信息会在窗口大小或屏幕方向变化时自动更新（需要启用相应的监听）：

```typescript
const detector = new DeviceDetector({
 enableResize: true,     // 监听窗口大小变化
 enableOrientation: true   // 监听屏幕方向变化
})

// 监听设备变化
detector.on('deviceChange', (newDeviceInfo) => {
 console.log('设备信息已更新:', newDeviceInfo)

 // 根据新的设备类型调整布局
 if (newDeviceInfo.type === 'mobile') {
  switchToMobileLayout()
 } else if (newDeviceInfo.type === 'tablet') {
  switchToTabletLayout()
 } else {
  switchToDesktopLayout()
 }
})

// 监听方向变化
detector.on('orientationChange', (orientation) => {
 console.log('方向变化:', orientation)

 if (orientation === 'landscape') {
  enableLandscapeMode()
 } else {
  enablePortraitMode()
 }
})
```

## 手动刷新

如果你禁用了自动监听，可以手动刷新设备信息：

```typescript
const detector = new DeviceDetector({
 enableResize: false,
 enableOrientation: false
})

// 在需要时手动刷新
detector.refresh()

// 获取最新的设备信息
const deviceInfo = detector.getDeviceInfo()
```

## Vue 3 集成

在 Vue 组件中使用设备检测：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

const {
 deviceType,
 orientation,
 deviceInfo,
 isMobile,
 isTablet,
 isDesktop,
 isTouchDevice
} = useDevice()
</script>

<template>
 <div>
  <!-- 设备类型 -->
  <h2>设备类型: {{ deviceType }}</h2>

  <!-- 条件渲染 -->
  <div v-if="isMobile">
   <h3>移动端界面</h3>
   <p>屏幕方向: {{ orientation }}</p>
  </div>

  <div v-else-if="isTablet">
   <h3>平板界面</h3>
  </div>

  <div v-else>
   <h3>桌面界面</h3>
  </div>

  <!-- 触摸设备提示 -->
  <p v-if="isTouchDevice">
   检测到触摸设备，启用手势操作
  </p>

  <!-- 设备详情 -->
  <details>
   <summary>设备详情</summary>
   <dl>
    <dt>屏幕尺寸</dt>
    <dd>{{ deviceInfo.width }} × {{ deviceInfo.height }}</dd>

    <dt>像素比</dt>
    <dd>{{ deviceInfo.pixelRatio }}</dd>

    <dt>操作系统</dt>
    <dd>{{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</dd>

    <dt>浏览器</dt>
    <dd>{{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</dd>

    <dt>WebGL 支持</dt>
    <dd>{{ deviceInfo.features.webgl ? '是' : '否' }}</dd>
   </dl>
  </details>
 </div>
</template>
```

## 实际应用场景

### 响应式导航栏

根据设备类型显示不同的导航：

```vue
<template>
 <header>
  <!-- 移动端：汉堡菜单 -->
  <nav v-if="isMobile" class="mobile-nav">
   <button @click="toggleMenu">☰</button>
   <div v-if="menuOpen" class="menu">
    <a href="/">首页</a>
    <a href="/about">关于</a>
    <a href="/contact">联系</a>
   </div>
  </nav>

  <!-- 桌面端：横向导航 -->
  <nav v-else class="desktop-nav">
   <a href="/">首页</a>
   <a href="/about">关于</a>
   <a href="/contact">联系</a>
  </nav>
 </header>
</template>
```

### 自适应布局

根据设备类型使用不同的列数：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { computed } from 'vue'

const { isMobile, isTablet } = useDevice()

const gridColumns = computed(() => {
 if (isMobile.value) return 1
 if (isTablet.value) return 2
 return 3
})
</script>

<template>
 <div :style="{ display: 'grid', gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
  <div v-for="item in items" :key="item.id">
   {{ item.title }}
  </div>
 </div>
</template>
```

### 触摸优化

根据是否支持触摸调整交互：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { isTouchDevice } = useDevice()
</script>

<template>
 <div
  :class="{
   'touch-optimized': isTouchDevice,
   'mouse-optimized': !isTouchDevice
  }"
 >
  <!-- 触摸设备：更大的点击区域 -->
  <button
   :style="{
    padding: isTouchDevice ? '16px' : '8px',
    fontSize: isTouchDevice ? '18px' : '14px'
   }"
  >
   点击按钮
  </button>
 </div>
</template>
```

### 方向锁定提示

在横屏模式下提示用户旋转设备：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { orientation, isMobile } = useDevice()
</script>

<template>
 <div v-if="isMobile && orientation === 'landscape'" class="rotate-prompt">
  <div class="rotate-icon">📱</div>
  <p>为了更好的体验，请竖屏使用</p>
 </div>
</template>

<style scoped>
.rotate-prompt {
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(0, 0, 0, 0.9);
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 color: white;
 z-index: 9999;
}

.rotate-icon {
 font-size: 64px;
 animation: rotate 2s infinite;
}

@keyframes rotate {
 0%, 100% { transform: rotate(0deg); }
 50% { transform: rotate(90deg); }
}
</style>
```

## 下一步

- [事件系统](./events.md) - 学习如何监听设备变化
- [模块系统](./modules.md) - 使用扩展模块
- [最佳实践](./best-practices.md) - 了解最佳实践和优化技巧
