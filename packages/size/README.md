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
- ⚡ **性能优化** - 轻量级设计，运行时开销极小
- 🛠️ **高度可定制** - 支持自定义前缀、选择器、配置等

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
<template>
  <div>
    <!-- 使用组件 -->
    <SizeControlPanel />

    <!-- 使用Composition API -->
    <div>当前模式: {{ currentMode }}</div>
  </div>
</template>

<script setup>
import { SizeControlPanel } from '@ldesign/size/vue'
import { useSize } from '@ldesign/size/vue'

const { currentMode, setMode } = useSize()
</script>
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

### 2. 多设备适配

根据设备屏幕大小自动调整界面尺寸，提供最佳用户体验。

### 3. 用户偏好

让用户根据个人喜好选择合适的界面尺寸。

### 4. 演示模式

在演示或展示时使用大尺寸模式，确保内容清晰可见。

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

- [完整文档](./docs/README.md)
- [API 参考](./docs/api/README.md)
- [最佳实践](./docs/best-practices/README.md)
- [更新日志](./CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/ldesign/issues)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️ Star！</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>

## 特性

- 🚀 **高性能** - 优化的性能表现
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📦 **轻量级** - 最小化的包体积
- 🔧 **易于使用** - 简洁的 API 设计

## 安装

```bash
npm install @ldesign/size
# 或
pnpm add @ldesign/size
# 或
yarn add @ldesign/size
```

## 使用

### 基础用法

```typescript
import { size } from '@ldesign/size'

size()
```

## API 文档

详细的 API 文档请访问：[文档站点](https://ldesign.github.io/size/)

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

MIT © LDesign Team
