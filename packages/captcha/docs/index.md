# @ldesign/captcha

功能完整的网页验证码插件库，支持多种验证方式，提供优秀的用户体验和开发者体验。

## ✨ 特性

- 🧩 **多种验证方式** - 支持滑动拼图、点击文字、旋转图片、点击区域等多种验证方式
- 🎨 **主题定制** - 内置多种主题，支持自定义样式和深色模式
- 📱 **响应式设计** - 完美适配桌面端和移动端，支持触摸操作
- 🔧 **框架无关** - 原生 JavaScript 实现，提供 Vue、React、Angular 适配器
- 🛡️ **TypeScript** - 完整的类型定义，提供优秀的开发体验
- ⚡ **高性能** - 优化的渲染性能，流畅的动画效果
- 🌐 **国际化** - 支持多语言，易于本地化
- ♿ **无障碍** - 遵循 WCAG 标准，支持键盘导航和屏幕阅读器

## 🚀 快速开始

### 安装

```bash
# npm
npm install @ldesign/captcha

# yarn
yarn add @ldesign/captcha

# pnpm
pnpm add @ldesign/captcha
```

### 基础用法

```javascript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'

// 创建滑动拼图验证码
const captcha = new SlidePuzzleCaptcha({
  container: document.getElementById('captcha-container'),
  width: 320,
  height: 180,
  onSuccess: (result) => {
    console.log('验证成功:', result)
  },
  onFail: (error) => {
    console.log('验证失败:', error)
  }
})

// 初始化验证码
await captcha.init()
```

### Vue 组件

```vue
<template>
  <LCaptcha
    type="slide-puzzle"
    :width="320"
    :height="180"
    @success="handleSuccess"
    @fail="handleFail"
  />
</template>

<script setup>
import { LCaptcha } from '@ldesign/captcha/vue'

const handleSuccess = (result) => {
  console.log('验证成功:', result)
}

const handleFail = (error) => {
  console.log('验证失败:', error)
}
</script>
```

### React 组件

```jsx
import React from 'react'
import { LCaptcha } from '@ldesign/captcha/react'

function App() {
  const handleSuccess = (result) => {
    console.log('验证成功:', result)
  }

  const handleFail = (error) => {
    console.log('验证失败:', error)
  }

  return (
    <LCaptcha
      type="slide-puzzle"
      width={320}
      height={180}
      onSuccess={handleSuccess}
      onFail={handleFail}
    />
  )
}
```

## 🎯 验证码类型

### 滑动拼图验证
用户需要拖拽拼图块到正确位置完成验证，支持自定义图片和难度设置。

### 按顺序点击文字验证
用户需要按照指定顺序点击文字完成验证，支持自定义文字内容和样式。

### 滑动滑块图片回正验证
用户需要旋转图片到正确角度完成验证，支持圆形和线性滑块样式。

### 点击验证
用户需要点击图片中的指定区域完成验证，支持多个目标区域和自定义容错范围。

## 🎨 主题系统

内置多种主题，支持自定义样式：

- **默认主题** - 清新简洁的浅色主题
- **暗色主题** - 适合暗色环境的深色主题
- **简约主题** - 极简风格的黑白主题
- **彩色主题** - 活泼鲜艳的彩色主题
- **高对比度主题** - 无障碍友好的高对比度主题

```javascript
import { defaultThemeManager } from '@ldesign/captcha'

// 切换主题
defaultThemeManager.setTheme('dark')

// 自定义主题
defaultThemeManager.registerTheme({
  name: 'custom',
  label: '自定义',
  config: {
    primaryColor: '#ff6b6b',
    backgroundColor: '#ffffff',
    // ... 更多配置
  }
})
```

## 🔧 配置选项

每种验证码都支持丰富的配置选项：

```javascript
const captcha = new SlidePuzzleCaptcha({
  // 基础配置
  container: element,
  width: 320,
  height: 180,
  disabled: false,
  debug: false,
  
  // 滑动拼图特定配置
  tolerance: 5,
  imageUrl: '/api/captcha/image',
  
  // 事件回调
  onSuccess: (result) => {},
  onFail: (error) => {},
  onStatusChange: (status) => {},
  onRetry: () => {},
  
  // 主题配置
  theme: 'default'
})
```

## 📚 文档

- [快速开始](/guide/getting-started) - 了解如何快速集成验证码
- [API 参考](/api/) - 详细的 API 文档
- [示例](/examples/) - 丰富的使用示例
- [最佳实践](/guide/best-practices) - 开发建议和最佳实践

## 🤝 贡献

我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码

请查看 [贡献指南](https://github.com/ldesign-team/captcha/blob/main/CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

[MIT License](https://github.com/ldesign-team/captcha/blob/main/LICENSE)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign-team">LDesign Team</a></sub>
</div>
