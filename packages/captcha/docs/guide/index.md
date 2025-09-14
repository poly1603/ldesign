# 介绍

@ldesign/captcha 是一个功能完整的网页验证码插件库，旨在为开发者提供简单易用、功能强大的验证码解决方案。

## 什么是 @ldesign/captcha？

@ldesign/captcha 是一个现代化的验证码库，支持多种验证方式，包括滑动拼图、点击文字、旋转图片、点击区域等。它采用 TypeScript 开发，提供完整的类型定义，支持在 Vue、React、Angular 等主流前端框架中使用。

## 为什么选择 @ldesign/captcha？

### 🎯 多样化的验证方式

- **滑动拼图验证** - 经典的拖拽拼图验证方式
- **按顺序点击文字验证** - 增强安全性的文字点击验证
- **滑动滑块图片回正验证** - 直观的图片旋转验证
- **点击验证** - 简单的区域点击验证

### 🎨 丰富的主题系统

内置多种主题，支持深色模式和自定义主题：

- 默认主题
- 暗色主题
- 简约主题
- 彩色主题
- 高对比度主题（无障碍友好）

### 📱 响应式设计

完美适配各种设备和屏幕尺寸：

- 桌面端优化
- 移动端友好
- 触摸操作支持
- 自适应布局

### 🔧 框架无关

原生 JavaScript 实现，同时提供主流框架适配器：

- 原生 JavaScript
- Vue 3 组件和组合式 API
- React 组件和 Hooks
- Angular 组件和服务

### 🛡️ TypeScript 支持

完整的类型定义，提供优秀的开发体验：

- 智能代码提示
- 类型检查
- 接口文档
- 重构支持

### ⚡ 高性能

优化的渲染性能和用户体验：

- Canvas 渲染优化
- 事件处理优化
- 内存管理
- 流畅动画

### ♿ 无障碍支持

遵循 WCAG 标准，支持无障碍访问：

- 键盘导航
- 屏幕阅读器支持
- 高对比度主题
- 语义化标记

## 核心概念

### 验证码类型

每种验证码类型都继承自 `BaseCaptcha` 基类，提供统一的 API 接口：

```javascript
import { SlidePuzzleCaptcha, ClickTextCaptcha } from '@ldesign/captcha'

// 滑动拼图验证
const slidePuzzle = new SlidePuzzleCaptcha(config)

// 点击文字验证
const clickText = new ClickTextCaptcha(config)
```

### 事件系统

基于事件驱动的架构，支持监听验证码的各种状态变化：

```javascript
captcha.on('success', (result) => {
  console.log('验证成功:', result)
})

captcha.on('fail', (error) => {
  console.log('验证失败:', error)
})

captcha.on('statusChange', (status) => {
  console.log('状态变化:', status)
})
```

### 配置系统

灵活的配置系统，支持全局配置和实例配置：

```javascript
const captcha = new SlidePuzzleCaptcha({
  // 基础配置
  container: element,
  width: 320,
  height: 180,
  
  // 特定配置
  tolerance: 5,
  imageUrl: '/api/captcha/image',
  
  // 主题配置
  theme: 'dark'
})
```

### 主题系统

强大的主题系统，支持预设主题和自定义主题：

```javascript
import { defaultThemeManager } from '@ldesign/captcha'

// 使用预设主题
defaultThemeManager.setTheme('dark')

// 注册自定义主题
defaultThemeManager.registerTheme({
  name: 'custom',
  label: '自定义',
  config: {
    primaryColor: '#ff6b6b',
    backgroundColor: '#ffffff'
  }
})
```

## 浏览器支持

@ldesign/captcha 支持所有现代浏览器：

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79
- iOS Safari >= 12
- Android Chrome >= 60

## 下一步

- [快速开始](/guide/getting-started) - 学习如何安装和使用
- [安装](/guide/installation) - 详细的安装说明
- [API 参考](/api/) - 完整的 API 文档
- [示例](/examples/) - 丰富的使用示例
