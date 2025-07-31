# @ldesign/device

现代化的设备信息检测库，提供设备类型、屏幕方向等信息的获取能力，支持模块化按需加载和完整的 Vue3 生态集成。

## 特性

- 🚀 **现代化设计** - 基于 TypeScript，提供完整的类型支持
- 📱 **设备检测** - 准确识别设备类型（桌面、平板、手机等）
- 🔄 **响应式监听** - 实时监听设备方向变化和窗口缩放
- 🧩 **模块化架构** - 按需动态加载扩展模块，减少包体积
- 🎯 **Vue3 集成** - 提供 hooks、指令、插件、组件等便捷功能
- 🛠️ **开发友好** - 完整的开发工具链和测试覆盖

## 安装

```bash
npm install @ldesign/device
# 或
pnpm add @ldesign/device
# 或
yarn add @ldesign/device
```

## 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
})

// 获取设备类型
const deviceType = detector.getDeviceType() // 'desktop' | 'tablet' | 'mobile'

// 获取屏幕方向
const orientation = detector.getOrientation() // 'portrait' | 'landscape'

// 监听设备变化
detector.on('deviceChange', (info) => {
  console.log('设备信息变化:', info)
})

// 监听方向变化
detector.on('orientationChange', (orientation) => {
  console.log('方向变化:', orientation)
})
```

## Vue3 集成

### 使用 Composition API

```vue
<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <p v-device:mobile>仅在移动设备显示</p>
  </div>
</template>

<script setup>
import { useDevice } from '@ldesign/device/vue'

const { deviceType, orientation, isMobile, isTablet, isDesktop } = useDevice()
</script>
```

### 使用插件

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)
app.use(DevicePlugin)
app.mount('#app')
```

### 使用组件

```vue
<template>
  <DeviceInfo :show-network="true" :show-battery="true" />
</template>

<script setup>
import { DeviceInfo } from '@ldesign/device/vue'
</script>
```

## 扩展模块

```typescript
// 动态加载网络信息模块
const networkInfo = await detector.loadModule('network')
console.log('网络状态:', networkInfo.getConnectionType())

// 动态加载电池信息模块
const batteryInfo = await detector.loadModule('battery')
console.log('电池电量:', batteryInfo.getLevel())
```

## API 文档

详细的 API 文档请访问：[文档站点](https://ldesign.github.io/device/)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
```

## 许可证