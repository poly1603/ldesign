---
layout: home
hero:
  name: '@ldesign/color'
  text: 现代化的主题色彩管理库
  tagline: 支持原生JavaScript和任何前端框架，提供智能色彩生成、明暗模式切换、系统主题同步等功能
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看API
      link: /api/
    - theme: alt
      text: 在线演示
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/color

features:
  - icon: 🎨
    title: 智能色彩生成
    details: 基于主色调自动生成和谐的配色方案，支持多种色彩算法和预设
  - icon: 🌓
    title: 明暗模式支持
    details: 完整的亮色/暗色主题切换，支持平滑过渡动画和系统主题同步
  - icon: ⚡
    title: 高性能
    details: 智能缓存、闲时处理、代码分割，确保主题切换在50ms内完成
  - icon: 🔧
    title: 框架无关
    details: 支持Vue、React、原生JavaScript等任何框架，提供完整的适配器
  - icon: 📦
    title: 模块化设计
    details: 按需导入、Tree Shaking支持，最小化包体积，优化加载性能
  - icon: 🎯
    title: TypeScript
    details: 完整的类型定义和类型安全，提供优秀的开发体验和智能提示
---

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

## 🎨 预设主题

包含多种精心设计的预设主题：

- **基础主题**: blue, green, purple, red, orange, cyan, pink, yellow
- **特殊主题**: dark, minimal, lavender, forest
- **自定义主题**: 支持完全自定义的配色方案

## 🔧 核心功能

### 智能色彩生成

基于主色调自动生成和谐的配色方案，支持多种色彩算法：

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

生成完整的颜色色阶，支持不同级别的渐变：

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

自动检测并同步系统主题偏好：

```javascript
import { useSystemThemeSync } from '@ldesign/color/vue'

const { syncWithSystem, systemTheme } = useSystemThemeSync()

// 自动同步系统主题
await syncWithSystem()
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

## 🎯 最佳实践

### 1. 按需导入

```javascript
// ✅ 推荐
import { useTheme } from '@ldesign/color/vue'

// ❌ 不推荐
import { useTheme } from '@ldesign/color'
```

### 2. 错误处理

```javascript
try {
  await themeManager.setTheme('non-existent-theme')
} catch (error) {
  console.error('主题切换失败:', error.message)
  // 回退到默认主题
  await themeManager.setTheme('default')
}
```

### 3. 性能优化

```javascript
// 预生成主题
await themeManager.preGenerateThemes(['blue', 'green', 'purple'])

// 使用闲时处理
themeManager.enableIdleProcessing()
```

### 4. 类型安全

```typescript
import type { ColorMode, ThemeConfig } from '@ldesign/color'

const theme: ThemeConfig = {
  name: 'my-theme',
  colors: {
    light: { primary: '#1890ff' },
    dark: { primary: '#177ddc' },
  },
}

const mode: ColorMode = 'light'
```

## 🔍 调试和监控

### 性能监控

```javascript
import { usePerformance } from '@ldesign/color/vue'

const { performanceStats } = usePerformance()

console.log('主题切换平均耗时:', performanceStats.averageThemeChangeTime)
console.log('总操作次数:', performanceStats.totalOperations)
```

### 调试模式

```javascript
const themeManager = new ThemeManager({
  debug: true,
})

// 启用详细日志
themeManager.enableDebugLogs()
```

## 📚 更多资源

- [完整 API 文档](./api/)
- [使用指南](./guide/getting-started)
- [主题管理](./guide/theme-management)
- [性能优化](./guide/performance)
- [示例项目](./examples/)

## 🆘 常见问题

### Q: 如何在服务端渲染中使用？

A: 使用 `memory` 存储类型，避免访问浏览器 API。

### Q: 如何自定义颜色生成算法？

A: 实现自定义的 `ColorGenerator` 接口。

### Q: 如何支持更多框架？

A: 参考现有的 Vue 和 React 适配器实现。

### Q: 如何处理主题切换动画？

A: 使用 CSS 过渡动画，配合主题切换事件。

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./contributing/) 了解详情。

## 📄 许可证

MIT License - 查看 [LICENSE](https://github.com/ldesign/color/blob/main/LICENSE) 文件了解详情。

---

🎉 感谢使用 `@ldesign/color`！如有问题或建议，请提交
[Issue](https://github.com/ldesign/color/issues)。
