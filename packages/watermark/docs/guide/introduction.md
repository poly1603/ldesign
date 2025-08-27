# 介绍

@ldesign/watermark 是一个强大、灵活、易用的前端水印解决方案，专为现代 Web 应用设计。

## 什么是水印？

水印是一种在文档、图片或其他媒体内容上添加标识信息的技术。在 Web 应用中，水印通常用于：

- **版权保护** - 标识内容的所有者和来源
- **安全防护** - 防止敏感信息的未授权传播
- **品牌标识** - 展示公司或产品的品牌信息
- **用户追踪** - 标识特定用户的操作记录

## 为什么选择 @ldesign/watermark？

### 🚀 现代化设计

- **TypeScript 原生支持** - 完整的类型定义，提供优秀的开发体验
- **ES6+ 语法** - 使用现代 JavaScript 特性，代码简洁高效
- **模块化架构** - 清晰的代码结构，易于维护和扩展

### 🎨 多样化渲染

支持三种渲染模式，满足不同场景需求：

- **DOM 渲染** - 最佳兼容性，支持复杂样式和动画
- **Canvas 渲染** - 高性能，适合大量水印的场景
- **SVG 渲染** - 矢量图形，支持无损缩放

### 🛡️ 安全可靠

- **防篡改机制** - 多重保护策略，防止水印被恶意删除
- **DOM 监控** - 实时监控页面变化，自动恢复被破坏的水印
- **样式保护** - 防止通过 CSS 隐藏或修改水印样式

### 📱 响应式友好

- **自适应布局** - 自动适配不同屏幕尺寸和设备类型
- **断点支持** - 支持自定义断点和响应式配置
- **动态调整** - 窗口大小变化时自动重新计算布局

### ⚡ 高性能优化

- **虚拟化渲染** - 只渲染可见区域的水印，提升性能
- **智能缓存** - 缓存渲染结果，避免重复计算
- **异步处理** - 非阻塞的异步 API，不影响页面响应

### 🔧 高度可定制

- **丰富的配置选项** - 支持文字、图片、多行文字等多种内容类型
- **灵活的样式系统** - 支持字体、颜色、旋转、透明度等样式配置
- **插件化架构** - 支持自定义渲染器和功能扩展

## 核心特性

### 多种内容类型

```javascript
// 文字水印
{ content: '版权所有' }

// 图片水印
{ content: { image: { src: '/logo.png', width: 100, height: 50 } } }

// 多行文字
{ content: ['第一行', '第二行', '第三行'] }

// 混合内容
{ content: { text: '公司名称', image: { src: '/logo.png' } } }
```

### 丰富的样式选项

```javascript
{
  style: {
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    color: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: 8,
    rotate: -22,
    opacity: 0.8,
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  }
}
```

### 智能布局算法

```javascript
{
  layout: {
    gapX: 100,           // 水平间距
    gapY: 80,            // 垂直间距
    offsetX: 0,          // 水平偏移
    offsetY: 0,          // 垂直偏移
    rows: 'auto',        // 行数（自动计算）
    cols: 'auto',        // 列数（自动计算）
    autoCalculate: true  // 自动计算最佳布局
  }
}
```

### 动画效果支持

```javascript
{
  animation: {
    type: 'fade',        // 动画类型
    duration: 2000,      // 持续时间
    delay: 0,            // 延迟时间
    iteration: 'infinite', // 重复次数
    easing: 'ease-in-out'  // 缓动函数
  }
}
```

## 框架支持

### Vue 集成

```vue
<template>
  <Watermark content="Vue 水印">
    <div>您的内容</div>
  </Watermark>
</template>

<script setup>
import { Watermark } from '@ldesign/watermark/vue'
</script>
```

### React 集成

```jsx
import { Watermark } from '@ldesign/watermark/react'

function App() {
  return (
    <Watermark content="React 水印">
      <div>您的内容</div>
    </Watermark>
  )
}
```

### 原生 JavaScript

```javascript
import { createWatermark } from '@ldesign/watermark'

const watermark = await createWatermark('#container', {
  content: '原生 JS 水印'
})
```

## 使用场景

### 文档保护系统

为企业内部文档添加用户身份水印，防止信息泄露：

```javascript
const watermark = await createWatermark('#document', {
  content: `${userName} - ${department} - ${timestamp}`,
  security: { level: 'high' },
  style: { color: 'rgba(255, 0, 0, 0.1)' }
})
```

### 图片版权保护

为图片添加版权信息，保护知识产权：

```javascript
const watermark = await createWatermark('#image-container', {
  content: {
    image: { src: '/copyright-logo.png' },
    text: '© 2024 公司名称'
  },
  layout: { offsetX: -50, offsetY: -30 }
})
```

### 视频内容标识

为视频播放器添加品牌水印：

```javascript
const watermark = await createWatermark('#video-player', {
  content: '品牌标识',
  style: { 
    position: 'fixed',
    top: '20px',
    right: '20px',
    opacity: 0.6
  }
})
```

## 浏览器兼容性

@ldesign/watermark 支持所有现代浏览器：

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **移动端浏览器** - iOS Safari 12+, Android Chrome 60+

对于不支持的浏览器，系统会自动降级到基础功能，确保基本的水印显示。

## 性能表现

经过优化的渲染算法确保优秀的性能表现：

- **初始化时间** < 50ms
- **渲染 1000 个水印** < 100ms
- **内存占用** < 5MB
- **CPU 使用率** < 1%

## 开源协议

@ldesign/watermark 采用 MIT 开源协议，您可以自由使用、修改和分发。

## 下一步

- [快速开始](/guide/getting-started) - 立即开始使用
- [安装指南](/guide/installation) - 详细的安装说明
- [核心概念](/guide/concepts) - 深入理解设计理念
- [API 文档](/api/core) - 完整的 API 参考
