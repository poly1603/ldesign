# @ldesign/device

<div align="center">

![Logo](https://via.placeholder.com/120x120/4facfe/ffffff?text=📱)

**现代化的设备信息检测库**

_轻量、高效、类型安全的设备检测解决方案，完美支持 Vue 3_

[![npm version](https://img.shields.io/npm/v/@ldesign/device.svg)](https://www.npmjs.com/package/@ldesign/device)
[![npm downloads](https://img.shields.io/npm/dm/@ldesign/device.svg)](https://www.npmjs.com/package/@ldesign/device)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@ldesign/device.svg)](https://bundlephobia.com/package/@ldesign/device)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@ldesign/device.svg)](https://github.com/ldesign-org/device/blob/main/LICENSE)

[📖 文档](https://ldesign.github.io/device/) | [🚀 快速开始](#快速开始) | [💡 示例](./examples/) |
[🔧 API 参考](./docs/api/)

</div>

---

## ✨ 特性亮点

### 🎯 **精准检测**

- 📱 **设备类型识别** - 智能区分桌面、平板、手机设备
- 🔄 **屏幕方向监听** - 实时响应设备方向变化
- 📏 **自定义断点** - 灵活配置设备类型判断阈值
- 🖱️ **触摸设备检测** - 准确识别触摸屏设备

### ⚡ **高性能**

- 🪶 **轻量级设计** - 核心库仅 ~8KB (gzipped)
- 🌳 **Tree Shaking** - 支持按需打包，减少包体积
- 🧩 **模块化架构** - 扩展功能按需加载
- 🚀 **零依赖** - 无外部依赖，启动更快

### 🔧 **开发友好**

- 📘 **TypeScript 优先** - 完整的类型定义和智能提示
- 🎨 **Vue 3 深度集成** - 原生支持 Composition API
- 📚 **丰富的文档** - 详细的使用指南和最佳实践
- 🧪 **完整测试覆盖** - 保证代码质量和稳定性

### 🌐 **跨平台支持**

- 🖥️ **现代浏览器** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- 📱 **移动设备** - iOS Safari, Chrome Mobile, Samsung Internet
- 🔄 **服务端渲染** - 完美支持 SSR/SSG 环境
- 🛡️ **优雅降级** - 在不支持的环境中提供基础功能

## 📦 安装

选择你喜欢的包管理器：

```bash
# npm
npm install @ldesign/device

# pnpm (推荐)
pnpm add @ldesign/device

# yarn
yarn add @ldesign/device

# bun
bun add @ldesign/device
```

## 🚀 快速开始

### 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector({
  enableResize: true, // 启用窗口大小变化监听
  enableOrientation: true, // 启用屏幕方向变化监听
  debounceDelay: 300, // 防抖延迟（毫秒）
})

// 获取完整设备信息
const deviceInfo = detector.getDeviceInfo()
console.log('设备信息:', deviceInfo)
// {
//   type: 'desktop',
//   orientation: 'landscape',
//   width: 1920,
//   height: 1080,
//   pixelRatio: 1,
//   isTouchDevice: false,
//   os: { name: 'Windows', version: '10' },
//   browser: { name: 'Chrome', version: '91' }
// }

// 快捷方法
console.log('是否移动设备:', detector.isMobile()) // false
console.log('是否平板设备:', detector.isTablet()) // false
console.log('是否桌面设备:', detector.isDesktop()) // true
console.log('屏幕方向:', detector.getOrientation()) // 'landscape'
```

### 事件监听

```typescript
// 监听设备信息变化
detector.on('deviceChange', deviceInfo => {
  console.log('设备信息变化:', deviceInfo)
  // 根据设备类型调整布局
  if (deviceInfo.type === 'mobile') {
    enableMobileLayout()
  }
})

// 监听屏幕方向变化
detector.on('orientationChange', orientation => {
  console.log('屏幕方向变化:', orientation)
  // 根据方向调整界面
  if (orientation === 'landscape') {
    enableLandscapeMode()
  }
})

// 监听窗口大小变化
detector.on('resize', ({ width, height }) => {
  console.log(`窗口大小变化: ${width}×${height}`)
})
```

### 自定义断点

```typescript
const detector = new DeviceDetector({
  breakpoints: {
    mobile: 480, // 0-480px 为移动设备
    tablet: 1024, // 481-1024px 为平板设备
    desktop: 1025, // 1025px+ 为桌面设备
  },
})
```

## 🎨 Vue 3 集成

@ldesign/device 为 Vue 3 提供了完整的集成方案，让你在 Vue 项目中更轻松地使用设备检测功能。

### Composition API

使用响应式的 composables 获取设备信息：

```vue
<script setup>
import { useBattery, useDevice, useGeolocation, useNetwork } from '@ldesign/device/vue'

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
  <nav v-device-mobile class="mobile-nav">移动端导航菜单</nav>

  <nav v-device-desktop class="desktop-nav">桌面端导航菜单</nav>

  <aside v-device-tablet class="tablet-sidebar">平板端侧边栏</aside>

  <!-- 触摸设备检测 -->
  <div v-device-touch class="touch-controls">触摸操作提示</div>

  <div v-device-no-touch class="mouse-controls">鼠标操作提示</div>

  <!-- 屏幕方向检测 -->
  <div v-orientation-portrait class="portrait-layout">竖屏布局</div>

  <div v-orientation-landscape class="landscape-layout">横屏布局</div>

  <!-- 组合条件 -->
  <div v-device="{ type: 'mobile', orientation: 'portrait' }">移动设备竖屏时显示</div>

  <!-- 多设备支持 -->
  <div v-device="['tablet', 'desktop']">平板或桌面设备时显示</div>
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
  <div v-device-mobile>移动端内容</div>
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
detector.on('networkChange', info => {
  if (info.status === 'offline') {
    showOfflineMessage()
  } else if (info.type === '2g') {
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
detector.on('batteryChange', info => {
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
  const watchId = await geoModule.startWatching(position => {
    console.log('位置更新:', position)
    updateMapLocation(position)
  })

  // 停止监听
  geoModule.stopWatching(watchId)
} else {
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
} catch (error) {
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

detector.on('deviceChange', info => {
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
detector.on('networkChange', info => {
  if (info.type === '2g' || info.saveData) {
    loadLowQualityImages()
    disableAnimations()
  } else {
    loadHighQualityImages()
    enableAnimations()
  }
})

// 根据电池状态调整功能
detector.on('batteryChange', info => {
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
} else {
  enableMouseHover()
  showTooltips()
}

// 屏幕方向适配
detector.on('orientationChange', orientation => {
  if (orientation === 'landscape') {
    showLandscapeUI()
  } else {
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
