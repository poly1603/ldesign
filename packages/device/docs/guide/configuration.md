# 配置选项

@ldesign/device 提供了丰富的配置选项，让你可以根据实际需求自定义设备检测行为。

## DeviceDetectorOptions

在创建 `DeviceDetector` 实例时，可以传入配置对象：

```typescript
import { DeviceDetector } from '@ldesign/device'
import type { DeviceDetectorOptions } from '@ldesign/device'

const options: DeviceDetectorOptions = {
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 768,
  tablet: 1024
 },
 debounceDelay: 300
}

const detector = new DeviceDetector(options)
```

## 配置项详解

### enableResize

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用窗口大小变化监听

当设置为 `true` 时，检测器会监听 `window.resize` 事件，并在窗口大小发生变化时更新设备信息。

```typescript
const detector = new DeviceDetector({
 enableResize: true // 启用窗口大小监听
})

// 当窗口大小变化时，会触发相应事件
detector.on('resize', ({ width, height }) => {
 console.log('窗口大小变化:', width, height)
})

detector.on('deviceChange', (info) => {
 console.log('设备类型可能变化:', info.type)
})
```

如果你的应用不需要响应窗口大小变化，可以将其设置为 `false` 以提升性能：

```typescript
const detector = new DeviceDetector({
 enableResize: false // 禁用窗口大小监听
})
```

### enableOrientation

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用屏幕方向变化监听

当设置为 `true` 时，检测器会监听 `orientationchange` 事件，并在屏幕方向发生变化时更新设备信息。

```typescript
const detector = new DeviceDetector({
 enableOrientation: true // 启用屏幕方向监听
})

detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化:', orientation) // 'portrait' 或 'landscape'
})
```

### breakpoints

- **类型**: `{ mobile?: number; tablet?: number }`
- **默认值**: `{ mobile: 768, tablet: 1024 }`
- **说明**: 设备类型判断断点（单位：像素）

断点用于根据屏幕宽度判断设备类型：

- 宽度 < `mobile` → 移动设备
- `mobile` ≤ 宽度 < `tablet` → 平板设备
- 宽度 ≥ `tablet` → 桌面设备

```typescript
// 默认断点
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,  // 小于 768px 为移动设备
  tablet: 1024  // 768-1024px 为平板，大于等于 1024px 为桌面
 }
})
```

你可以根据项目需求自定义断点：

```typescript
// 自定义断点示例 1：更小的移动端断点
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 480,  // 小于 480px 为移动设备
  tablet: 768   // 480-768px 为平板
 }
})

// 自定义断点示例 2：更大的桌面端断点
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,
  tablet: 1280  // 需要更大的屏幕才算桌面设备
 }
})

// 自定义断点示例 3：只区分移动端和桌面端
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,
  tablet: 768   // tablet 和 mobile 相同，实际上只有移动和桌面两种
 }
})
```

### debounceDelay

- **类型**: `number`
- **默认值**: `100`
- **说明**: 事件防抖延迟时间（毫秒）

为了避免在窗口大小或方向快速变化时触发过多事件，检测器会对事件进行防抖处理。

```typescript
// 默认 100ms 防抖
const detector = new DeviceDetector({
 debounceDelay: 100
})

// 增加防抖延迟，减少事件触发频率
const detector2 = new DeviceDetector({
 debounceDelay: 300 // 300ms 防抖
})

// 减少防抖延迟，提高响应速度
const detector3 = new DeviceDetector({
 debounceDelay: 50 // 50ms 防抖
})

// 禁用防抖（不推荐）
const detector4 = new DeviceDetector({
 debounceDelay: 0 // 立即触发
})
```

**建议**:
- 一般应用：100-200ms
- 实时性要求高：50-100ms
- 性能优先：200-500ms

## Vue 插件配置

在 Vue 应用中使用插件时，可以传入相同的配置选项：

```typescript
// main.ts
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

app.use(DevicePlugin, {
 // 设备检测器配置
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 768,
  tablet: 1024
 },
 debounceDelay: 200
})

app.mount('#app')
```

## Composable 配置

使用 `useDevice` composable 时也可以传入配置：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

// 使用自定义配置
const { deviceType, isMobile } = useDevice({
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 480,
  tablet: 768
 },
 debounceDelay: 150
})
</script>
```

注意：每次调用 `useDevice` 都会创建一个新的检测器实例。如果在多个组件中使用相同配置，建议使用插件方式全局安装。

## 配置示例

### 移动优先应用

如果你的应用主要面向移动端，可以使用较小的断点：

```typescript
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 480,   // 更小的移动端断点
  tablet: 768    // 更小的平板断点
 },
 enableResize: true,
 enableOrientation: true,
 debounceDelay: 100
})
```

### 桌面优先应用

如果你的应用主要面向桌面端，可以使用较大的断点：

```typescript
const detector = new DeviceDetector({
 breakpoints: {
  mobile: 768,
  tablet: 1280   // 更大的桌面断点
 },
 enableResize: true,
 enableOrientation: false, // 桌面应用可能不需要方向监听
 debounceDelay: 200
})
```

### 高性能配置

如果你的应用对性能要求较高，可以禁用一些功能：

```typescript
const detector = new DeviceDetector({
 enableResize: false,      // 禁用窗口大小监听
 enableOrientation: false,   // 禁用屏幕方向监听
 debounceDelay: 500       // 增加防抖延迟
})

// 只在需要时手动刷新
detector.refresh()
```

### 实时响应配置

如果需要快速响应设备变化：

```typescript
const detector = new DeviceDetector({
 enableResize: true,
 enableOrientation: true,
 debounceDelay: 50 // 减少防抖延迟
})
```

## TypeScript 类型

@ldesign/device 提供完整的 TypeScript 类型定义：

```typescript
import type {
 DeviceDetectorOptions,
 DeviceType,
 Orientation,
 DeviceInfo,
 Breakpoints
} from '@ldesign/device'

// 配置类型
const options: DeviceDetectorOptions = {
 enableResize: true,
 enableOrientation: true,
 breakpoints: {
  mobile: 768,
  tablet: 1024
 },
 debounceDelay: 100
}

// 断点类型
const breakpoints: Breakpoints = {
 mobile: 768,
 tablet: 1024
}

// 设备类型
const type: DeviceType = 'mobile' // 'mobile' | 'tablet' | 'desktop'

// 屏幕方向
const orientation: Orientation = 'portrait' // 'portrait' | 'landscape'

// 设备信息
const info: DeviceInfo = {
 type: 'mobile',
 orientation: 'portrait',
 width: 375,
 height: 667,
 pixelRatio: 2,
 isTouchDevice: true,
 userAgent: '...',
 os: { name: 'iOS', version: '15.0' },
 browser: { name: 'Safari', version: '15.0' },
 screen: {
  width: 375,
  height: 667,
  pixelRatio: 2,
  availWidth: 375,
  availHeight: 667
 },
 features: {
  touch: true,
  webgl: true
 }
}
```

## 环境变量

你也可以通过环境变量配置某些行为（需要在构建时设置）：

```bash
# 禁用开发模式日志
VITE_DEVICE_DEBUG=false

# 设置默认断点
VITE_DEVICE_MOBILE_BREAKPOINT=768
VITE_DEVICE_TABLET_BREAKPOINT=1024
```

## 下一步

- [设备检测指南](./device-detection.md) - 了解设备检测的详细功能
- [事件系统](./events.md) - 学习如何监听和处理事件
- [性能优化](./performance.md) - 了解性能优化技巧
