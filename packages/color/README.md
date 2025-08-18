# @ldesign/color

[![npm version](https://img.shields.io/npm/v/@ldesign/color.svg)](https://www.npmjs.com/package/@ldesign/color)
[![npm downloads](https://img.shields.io/npm/dm/@ldesign/color.svg)](https://www.npmjs.com/package/@ldesign/color)
[![License](https://img.shields.io/npm/l/@ldesign/color.svg)](https://github.com/ldesign/color/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

一个现代化的、框架无关的主题色彩管理库，支持原生 JavaScript 和任何前端框架。

## ✨ 特性

- 🎨 **智能色彩生成** - 基于主色调自动生成和谐的配色方案
- 🌓 **明暗模式支持** - 完整的亮色/暗色主题切换
- 📱 **系统主题同步** - 自动检测并同步系统主题偏好
- ⚡ **高性能** - 智能缓存、闲时处理、代码分割
- 🔧 **框架无关** - 支持 Vue、React、原生 JavaScript 等任何框架
- 📦 **模块化设计** - 按需导入，支持 Tree Shaking
- 🎯 **TypeScript** - 完整的类型定义和类型安全
- 🚀 **零配置** - 开箱即用，支持预设主题

## 🚀 快速开始

### 安装

```bash
npm install @ldesign/color
```

### 基础使用

```javascript
import { createThemeManagerWithPresets } from '@ldesign/color'

// 创建主题管理器
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'blue',
  autoDetect: true,
})

// 切换主题
await themeManager.setTheme('green')

// 切换明暗模式
await themeManager.toggleMode()
```

### Vue 3 使用

```vue
<script setup>
import { useTheme, useThemeToggle } from '@ldesign/color/vue'

const { currentTheme } = useTheme()
const { toggle } = useThemeToggle()
</script>

<template>
  <div>
    <h1>当前主题: {{ currentTheme }}</h1>
    <button @click="toggleMode">切换模式</button>
  </div>
</template>
```

### React 使用

```jsx
import { useTheme, useThemeToggle } from '@ldesign/color/react'
import React from 'react'

function App() {
  const { currentTheme } = useTheme()
  const { toggle } = useThemeToggle()

  return (
    <div>
      <h1>
        当前主题:
        {currentTheme}
      </h1>
      <button onClick={toggle}>切换模式</button>
    </div>
  )
}
```

## 📦 模块导入

### 完整包导入

```javascript
import { createThemeManagerWithPresets } from '@ldesign/color'
```

### 按需导入

```javascript
// 核心功能
import { ThemeManager } from '@ldesign/color/core'

// 工具函数
import { hexToRgb, rgbToHex } from '@ldesign/color/utils'

// 预设主题
import { getPresetThemes } from '@ldesign/color/themes'

// Vue适配器
import { useTheme } from '@ldesign/color/vue'

// React适配器
import { useTheme } from '@ldesign/color/react'
```

## 🎨 核心功能

### 智能色彩生成

```javascript
import { generateColorConfig } from '@ldesign/color'

// 从主色调生成完整配色方案
const colors = await generateColorConfig('#1890ff')

console.log(colors)
// {
//   primary: '#1890ff',
//   success: '#52c41a',
//   warning: '#faad14',
//   danger: '#ff4d4f',
//   gray: '#8c8c8c'
// }
```

### 颜色色阶生成

```javascript
import { generateColorScales } from '@ldesign/color'

const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
}

// 生成颜色色阶
const scales = await generateColorScales(colors)

console.log(scales.primary)
// ['#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766']
```

### 系统主题同步

```javascript
import { useSystemThemeSync } from '@ldesign/color/vue' // 或 react

const { syncWithSystem, systemTheme } = useSystemThemeSync()

// 自动同步系统主题
await syncWithSystem()
```

## 🔧 高级配置

### 存储配置

```javascript
import { ThemeManager } from '@ldesign/color'

const themeManager = new ThemeManager({
  storage: {
    type: 'localStorage', // 'localStorage' | 'sessionStorage' | 'memory' | 'cookie' | 'none'
    key: 'app-theme',
    prefix: 'theme-',
  },
})
```

### 缓存配置

```javascript
const themeManager = new ThemeManager({
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600000, // 1小时
  },
})
```

### 性能配置

```javascript
const themeManager = new ThemeManager({
  performance: {
    idleProcessing: true,
    preGenerate: true,
    batchUpdates: true,
  },
})
```

## 📊 性能指标

- **主题切换时间**: < 50ms
- **首屏加载时间**: < 100ms
- **内存使用**: < 2MB
- **包大小**: < 50KB (gzipped)
- **缓存命中率**: > 90%

## 🎯 支持的环境

### 浏览器

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Node.js

- Node.js 16+

### 框架

- Vue 3.x
- React 18.x
- 原生 JavaScript
- 任何支持 ES6+的框架

## 📚 文档

- [快速开始指南](./QUICK_START.md)
- [API 文档](./docs/api/index.md)
- [使用指南](./docs/guide/getting-started.md)
- [主题管理](./docs/guide/theme-management.md)
- [性能优化](./docs/guide/performance.md)
- [优化总结](./OPTIMIZATION_SUMMARY.md)

## 🎨 预设主题

包含多种精心设计的预设主题：

- **基础主题**: blue, green, purple, red, orange, cyan, pink, yellow
- **特殊主题**: dark, minimal, lavender, forest
- **自定义主题**: 支持完全自定义的配色方案

## 🔧 开发工具

### 构建工具

- Rollup (模块打包)
- TypeScript (类型检查)
- ESLint (代码规范)
- Vitest (单元测试)

### 开发工具

- Vite (开发服务器)
- Playwright (E2E 测试)
- VitePress (文档生成)

## 📦 示例项目

- [Vue 3 示例](./examples/vue/)
- [React 示例](./examples/react/)
- [原生 JavaScript 示例](./examples/vanilla/)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./docs/contributing/index.md) 了解详情。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🔗 相关链接

- [GitHub](https://github.com/ldesign/color)
- [npm](https://www.npmjs.com/package/@ldesign/color)
- [在线文档](https://ldesign.github.io/color)
- [在线演示](https://ldesign.github.io/color/demo)

---

🎉 感谢使用 `@ldesign/color`！如有问题或建议，请提交
[Issue](https://github.com/ldesign/color/issues)。
