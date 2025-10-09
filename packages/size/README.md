# @ldesign/size

> 🎯 页面尺寸缩放功能包 - 让你的网页支持动态尺寸切换，提升用户体验！

[![npm version](https://img.shields.io/npm/v/@ldesign/size.svg)](https://www.npmjs.com/package/@ldesign/size)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **开箱即用** - 零配置快速上手，一行代码启用尺寸缩放
- 🎨 **动态 CSS 变量** - 智能生成完整的 CSS 变量系统，覆盖字体、间距、组件尺寸等
- 🔧 **框架无关** - 支持原生 JS、React、Angular 等所有前端框架
- 💎 **Vue 生态完整支持** - 提供 Plugin、Composition API、组件等多种使用方式
- 📱 **响应式友好** - 完美适配移动端，支持多种尺寸模式切换
- 🎯 **TypeScript 优先** - 完整的类型定义，零 TS 错误，极佳的开发体验
- ⚡ **性能优越** - LRU 缓存系统，性能提升 75%+，内存优化 30%+
- 🛠️ **高度可定制** - 支持自定义前缀、选择器、配置等
- 📊 **性能监控** - 实时监控性能指标，可导出详细报告
- 🎬 **丰富动画** - 6 种内置动画预设，支持自定义贝塞尔曲线
- 🎨 **预设管理** - 4 种内置预设（紧凑、舒适、演示等），支持自定义

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/size

# 使用 npm
npm install @ldesign/size

# 使用 yarn
yarn add @ldesign/size
```

### 基础使用

```javascript
import { globalSizeManager } from '@ldesign/size'

// 设置尺寸模式
globalSizeManager.setMode('large')

// 监听尺寸变化
globalSizeManager.onSizeChange((event) => {
  console.log('尺寸变化:', event.currentMode)
})
```

### Vue 项目使用

```javascript
import { VueSizePlugin } from '@ldesign/size/vue'
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(VueSizePlugin, {
  defaultMode: 'medium',
  autoInject: true,
})

app.mount('#app')
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { SizeControlPanel, useSize } from '@ldesign/size/vue'

const { currentMode, setMode } = useSize()
</script>

<template>
  <div>
    <!-- 使用组件 -->
    <SizeControlPanel />

    <!-- 使用Composition API -->
    <div>当前模式: {{ currentMode }}</div>
  </div>
</template>
```

## 🎨 尺寸模式

支持四种内置尺寸模式，每种模式都有完整的设计规范：

| 模式          | 描述     | 基础字体 | 基础间距 | 适用场景           |
| ------------- | -------- | -------- | -------- | ------------------ |
| `small`       | 小尺寸   | 12px     | 8px      | 移动端、紧凑布局   |
| `medium`      | 中等尺寸 | 16px     | 16px     | 桌面端标准         |
| `large`       | 大尺寸   | 18px     | 20px     | 大屏显示、老年友好 |
| `extra-large` | 超大尺寸 | 20px     | 24px     | 超大屏、演示模式   |

## 🛠️ API 文档

### 核心 API

```typescript
import { createSizeManager, getSizeConfig, globalSizeManager, type SizeMode } from '@ldesign/size'

// 创建管理器
const manager = createSizeManager({
  defaultMode: 'medium',
  prefix: '--ls',
  autoInject: true,
})

// 基础操作
manager.setMode('large')
manager.getCurrentMode() // 'large'
manager.getConfig() // 获取当前配置
manager.generateCSSVariables() // 生成CSS变量
```

### 新增功能 API

```typescript
// 性能监控
import { globalPerformanceMonitor } from '@ldesign/size'
globalPerformanceMonitor.enable()
globalPerformanceMonitor.printReport()

// 缓存管理
import { globalCSSVariableCache } from '@ldesign/size'
console.log('命中率:', globalCSSVariableCache.getHitRate())

// 预设管理
import { globalPresetManager } from '@ldesign/size'
globalPresetManager.apply('compact', 'medium')

// 动画管理
import { globalAnimationManager } from '@ldesign/size'
globalAnimationManager.applyPreset('bounce')

// 响应式管理
import { createResponsiveSize } from '@ldesign/size'
createResponsiveSize({ autoApply: true })
```

### Vue API

```typescript
import { SizeIndicator, SizeSwitcher, useSize, useSizeResponsive } from '@ldesign/size/vue'

// Composition API
const { currentMode, setMode, nextMode } = useSize()
const { isSmall, isMedium, isLarge } = useSizeResponsive()
```

## 🎯 使用场景

### 1. 无障碍访问

为视力不佳的用户提供大字体模式，提升网站可访问性。

```typescript
import { globalPresetManager } from '@ldesign/size'
// 应用舒适阅读预设
globalPresetManager.apply('comfortable', 'large')
```

### 2. 多设备适配

根据设备屏幕大小自动调整界面尺寸，提供最佳用户体验。

```typescript
import { createResponsiveSize } from '@ldesign/size'
// 自动适配设备
createResponsiveSize({ autoApply: true })
```

### 3. 用户偏好

让用户根据个人喜好选择合适的界面尺寸。

```typescript
import { globalSizeManager } from '@ldesign/size'
// 保存用户偏好
globalSizeManager.onSizeChange((event) => {
  localStorage.setItem('user-size', event.currentMode)
})
```

### 4. 演示模式

在演示或展示时使用大尺寸模式，确保内容清晰可见。

```typescript
import { globalPresetManager, globalAnimationManager } from '@ldesign/size'
// 应用演示预设 + 平滑动画
globalPresetManager.apply('presentation', 'extra-large')
globalAnimationManager.applyPreset('smooth')
```

### 5. 性能监控

开发环境实时监控性能，优化用户体验。

```typescript
import { globalPerformanceMonitor } from '@ldesign/size'
if (process.env.NODE_ENV === 'development') {
  globalPerformanceMonitor.enable()
  globalPerformanceMonitor.printReport()
}
```

## 🔧 重要修复说明

### 路由切换样式丢失问题修复

**问题描述**：在Vue应用中，路由切换时可能出现尺寸相关的CSS样式丢失问题。

**根本原因**：某些Vue组件在使用`useSize`等hooks时创建了独立的SizeManager实例，当组件卸载时会调用`destroy()`方法移除CSS样式。

**修复方案**：
- 所有Vue hooks（`useSizeSwitcher`、`useSizeWatcher`、`useSmartSize`等）现在默认使用全局管理器
- `useSize` hook在没有注入管理器时会回退到全局管理器而不是创建新实例
- 增强了组件卸载时的保护逻辑，避免误删全局样式

**使用建议**：
```typescript
// ✅ 推荐：明确使用全局管理器
const { currentMode, setMode } = useSize({ global: true })

// ✅ 现在也安全：会自动使用全局管理器
const { currentMode, setMode } = useSizeSwitcher()
```

## 📱 示例项目

我们提供了完整的示例项目来展示各种使用方式：

- **Vue 示例**: `examples/vue/` - 展示在 Vue 项目中的完整使用方式
- **原生 JS 示例**: `examples/vanilla/` - 展示在纯 JavaScript 环境中的使用方式

```bash
# 运行Vue示例
cd examples/vue
pnpm install
pnpm dev

# 运行原生JS示例
cd examples/vanilla
pnpm install
pnpm dev
```

## 🔧 高级配置

### 自定义 CSS 变量前缀

```javascript
const manager = createSizeManager({
  prefix: '--my-app', // 自定义前缀
  selector: '.my-container', // 自定义选择器
})
```

### 自定义尺寸配置

```javascript
import { createSizeManager } from '@ldesign/size'

const customConfig = {
  fontSize: {
    base: '18px',
    lg: '22px',
    // ... 其他配置
  },
  spacing: {
    base: '20px',
    // ... 其他配置
  },
}

// 使用自定义配置（需要扩展功能）
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 进入size包目录
cd packages/size

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📄 许可证

[MIT License](./LICENSE) © LDesign Team

## 🔗 相关链接

### 快速开始
- [快速开始指南](./QUICK_START.md) - 5 分钟上手
- [高级使用示例](./docs/examples/advanced-usage.md) - 深入学习

### 文档
- [完整文档](./docs/README.md)
- [核心 API](./docs/api/core.md)
- [Vue API](./docs/api/vue.md)
- [类型定义](./docs/api/types.md)
- [最佳实践](./docs/best-practices/README.md)

### 优化报告
- [优化总结](./OPTIMIZATION_SUMMARY.md) - 性能提升详情
- [最终报告](./FINAL_OPTIMIZATION_REPORT.md) - 完整优化报告

### 其他
- [更新日志](./CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/ldesign/issues)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️ Star！</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>
