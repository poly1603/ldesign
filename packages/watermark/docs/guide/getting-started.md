# 快速开始

本指南将帮助您在几分钟内开始使用 @ldesign/watermark。

## 安装

::: code-group

```bash [npm]
npm install @ldesign/watermark
```

```bash [yarn]
yarn add @ldesign/watermark
```

```bash [pnpm]
pnpm add @ldesign/watermark
```

:::

## 基本用法

### 1. 创建简单的文字水印

```javascript
import { createWatermark } from '@ldesign/watermark'

// 为指定容器添加水印
const watermark = await createWatermark('#container', {
  content: '机密文档'
})
```

### 2. 自定义水印样式

```javascript
const watermark = await createWatermark('#container', {
  content: '版权所有',
  style: {
    fontSize: 18,
    color: 'rgba(255, 0, 0, 0.3)',
    fontFamily: 'Arial, sans-serif',
    rotate: -30,
    opacity: 0.8
  }
})
```

### 3. 配置水印布局

```javascript
const watermark = await createWatermark('#container', {
  content: '内部资料',
  layout: {
    gapX: 150,      // 水平间距
    gapY: 100,      // 垂直间距
    offsetX: 20,    // 水平偏移
    offsetY: 10     // 垂直偏移
  }
})
```

## Vue 组件用法

如果您使用 Vue，可以直接使用我们提供的组件：

```vue
<template>
  <Watermark
    content="机密文档"
    :style="{ fontSize: 16, color: 'rgba(0,0,0,0.15)' }"
  >
    <div class="content">
      <!-- 您的内容 -->
      <h1>文档标题</h1>
      <p>文档内容...</p>
    </div>
  </Watermark>
</template>

<script setup>
import { Watermark } from '@ldesign/watermark/vue'
</script>
```

## 图片水印

除了文字水印，您还可以使用图片作为水印：

```javascript
const watermark = await createWatermark('#container', {
  content: {
    image: {
      src: '/logo.png',
      width: 100,
      height: 50
    }
  }
})
```

## 多行文字水印

支持多行文字水印：

```javascript
const watermark = await createWatermark('#container', {
  content: ['第一行文字', '第二行文字', '第三行文字']
})
```

## 渲染模式

@ldesign/watermark 支持三种渲染模式：

### DOM 模式（默认）
```javascript
const watermark = await createWatermark('#container', {
  content: '水印文字',
  renderMode: 'dom'  // 默认值
})
```

### Canvas 模式
```javascript
const watermark = await createWatermark('#container', {
  content: '水印文字',
  renderMode: 'canvas'
})
```

### SVG 模式
```javascript
const watermark = await createWatermark('#container', {
  content: '水印文字',
  renderMode: 'svg'
})
```

## 水印管理

### 更新水印
```javascript
// 更新水印内容
await watermark.update({
  content: '新的水印内容'
})

// 更新样式
await watermark.update({
  style: {
    color: 'blue',
    fontSize: 20
  }
})
```

### 暂停和恢复
```javascript
// 暂停水印显示
watermark.pause()

// 恢复水印显示
watermark.resume()
```

### 销毁水印
```javascript
// 销毁水印实例
await watermark.destroy()

// 或者使用全局方法
import { destroyWatermark } from '@ldesign/watermark'
await destroyWatermark(watermark)
```

## 事件监听

水印支持多种事件监听：

```javascript
const watermark = await createWatermark('#container', {
  content: '监听事件',
  onCreated: (instance) => {
    console.log('水印创建成功', instance)
  },
  onUpdated: (instance) => {
    console.log('水印更新成功', instance)
  },
  onError: (error) => {
    console.error('水印错误', error)
  }
})
```

## 安全防护

启用安全防护功能，防止水印被恶意删除：

```javascript
const watermark = await createWatermark('#container', {
  content: '受保护的水印',
  security: {
    level: 'high',           // 安全级别
    mutationObserver: true,  // DOM 变化监控
    styleProtection: true,   // 样式保护
    canvasProtection: true   // Canvas 保护
  }
})
```

## 响应式设计

水印支持响应式设计，自动适配不同屏幕尺寸：

```javascript
const watermark = await createWatermark('#container', {
  content: '响应式水印',
  responsive: {
    enabled: true,
    autoResize: true,
    breakpoints: {
      mobile: { maxWidth: 768 },
      tablet: { minWidth: 769, maxWidth: 1024 },
      desktop: { minWidth: 1025 }
    }
  }
})
```

## 下一步

现在您已经了解了基本用法，可以继续学习：

- [核心概念](/guide/concepts) - 深入理解水印系统的设计理念
- [配置选项](/guide/configuration) - 了解所有可用的配置选项
- [API 参考](/api/core) - 查看完整的 API 文档
- [示例集合](/examples/basic) - 查看更多实际应用示例

## 常见问题

### Q: 水印会影响页面性能吗？
A: @ldesign/watermark 经过性能优化，使用虚拟化和缓存技术，对页面性能影响极小。

### Q: 如何确保水印不被删除？
A: 启用安全防护功能，系统会自动监控 DOM 变化并重新创建被删除的水印。

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge 等。

### Q: 可以在移动端使用吗？
A: 完全支持移动端，并提供响应式设计功能。

如果您遇到其他问题，请查看 [常见问题](/guide/faq) 或在 [GitHub Issues](https://github.com/ldesign/watermark/issues) 中提问。
