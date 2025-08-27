# @ldesign/watermark

<div align="center">

**强大、灵活、易用的前端水印解决方案**

[![npm version](https://img.shields.io/npm/v/@ldesign/watermark.svg)](https://www.npmjs.com/package/@ldesign/watermark)
[![npm downloads](https://img.shields.io/npm/dm/@ldesign/watermark.svg)](https://www.npmjs.com/package/@ldesign/watermark)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@ldesign/watermark.svg)](https://bundlephobia.com/package/@ldesign/watermark)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@ldesign/watermark.svg)](https://github.com/ldesign/watermark/blob/main/LICENSE)

[📖 文档](./docs) | [🚀 快速开始](#快速开始) | [💡 示例](./docs/examples) | [🔧 API](./docs/api)

</div>

## ✨ 特性亮点

### 🎯 核心功能
- **🚀 开箱即用** - 零配置启动，简单 API 设计，几行代码即可添加水印
- **🎨 多种渲染模式** - 支持 DOM、Canvas、SVG 三种渲染模式，满足不同场景需求
- **🛡️ 安全防护** - 内置多重防篡改机制，DOM 监控、样式保护、Canvas 保护
- **📱 响应式设计** - 智能适配不同屏幕尺寸，支持自定义断点和布局策略

### ⚡ 性能优化
- **虚拟化渲染** - 只渲染可见区域，大幅提升性能
- **智能缓存** - 缓存渲染结果，避免重复计算
- **异步处理** - 非阻塞 API，不影响页面响应
- **内存优化** - 自动清理无用资源，防止内存泄漏

### 🔧 开发体验
- **TypeScript 原生支持** - 完整类型定义，优秀的 IDE 智能提示
- **框架无关** - 支持 Vue、React、Angular 等主流框架
- **插件化架构** - 支持自定义渲染器和功能扩展
- **丰富的配置选项** - 满足各种复杂需求

### 🎭 高级功能
- **动画效果** - 内置多种动画效果，支持自定义动画和过渡
- **多内容类型** - 支持文字、图片、多行文字、混合内容
- **安全等级** - 可配置的安全防护等级，从基础到企业级
- **事件系统** - 完整的事件监听和处理机制

## 📦 安装

```bash
# npm
npm install @ldesign/watermark

# yarn
yarn add @ldesign/watermark

# pnpm
pnpm add @ldesign/watermark
```

## 🚀 快速开始

### 基础用法

```javascript
import { createWatermark } from '@ldesign/watermark'

// 创建简单文字水印
const watermark = await createWatermark('#container', {
  content: '机密文档'
})

// 自定义样式
const styledWatermark = await createWatermark('#container', {
  content: '版权所有',
  style: {
    fontSize: 18,
    color: 'rgba(255, 0, 0, 0.3)',
    rotate: -30,
    opacity: 0.8
  },
  layout: {
    gapX: 150,
    gapY: 100
  }
})
```

### Vue 组件

```vue
<template>
  <Watermark
    content="机密文档"
    :style="{ fontSize: 16, color: 'rgba(0,0,0,0.15)' }"
    :security="{ level: 'high' }"
  >
    <div class="content">
      <h1>文档标题</h1>
      <p>这里是您的内容...</p>
    </div>
  </Watermark>
</template>

<script setup>
import { Watermark } from '@ldesign/watermark/vue'
</script>
```

### 图片水印

```javascript
const imageWatermark = await createWatermark('#container', {
  content: {
    image: {
      src: '/logo.png',
      width: 100,
      height: 50
    }
  }
})
```

### 多行文字

```javascript
const multilineWatermark = await createWatermark('#container', {
  content: ['第一行文字', '第二行文字', '第三行文字']
})
```

### Canvas 渲染模式

```typescript
import { createWatermark } from '@ldesign/watermark'

// 使用Canvas渲染，性能更好
const instance = await createWatermark('#canvas-container', {
  content: 'Canvas水印',
  renderMode: 'canvas',
  style: {
    fontSize: 18,
    color: '#4CAF50',
    opacity: 0.3,
  },
})
```

### 动画水印

```typescript
import { createWatermark } from '@ldesign/watermark'

// 带动画效果的水印
const instance = await createWatermark('#animated-container', {
  content: '动态水印',
  animation: {
    type: 'fade',
    duration: 2000,
    iteration: 'infinite',
  },
})
```

## 🎛️ 配置选项

### WatermarkConfig

| 属性         | 类型                         | 默认值  | 描述                       |
| ------------ | ---------------------------- | ------- | -------------------------- |
| `content`    | `string \| WatermarkImage`   | -       | 水印内容，可以是文字或图片 |
| `style`      | `WatermarkStyle`             | -       | 样式配置                   |
| `layout`     | `WatermarkLayout`            | -       | 布局配置                   |
| `renderMode` | `'dom' \| 'canvas' \| 'svg'` | `'dom'` | 渲染模式                   |
| `animation`  | `AnimationConfig`            | -       | 动画配置                   |
| `security`   | `SecurityConfig`             | -       | 安全配置                   |
| `responsive` | `ResponsiveConfig`           | -       | 响应式配置                 |

### WatermarkStyle

| 属性         | 类型     | 默认值               | 描述         |
| ------------ | -------- | -------------------- | ------------ |
| `fontSize`   | `number` | `16`                 | 字体大小     |
| `fontFamily` | `string` | `'Arial'`            | 字体系列     |
| `color`      | `string` | `'rgba(0,0,0,0.15)'` | 文字颜色     |
| `opacity`    | `number` | `1`                  | 透明度 (0-1) |
| `rotate`     | `number` | `-22`                | 旋转角度     |

## 🔧 Vue 3 集成

### 组合式 API

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWatermark } from '@ldesign/watermark/vue'

const containerRef = ref<HTMLElement>()
const { create, destroy, loading, error } = useWatermark(containerRef)

onMounted(async () => {
  await create('Vue水印', {
    style: { fontSize: 18, color: '#42b883' },
  })
})
</script>

<template>
  <div ref="containerRef" class="container">
    <!-- 内容 -->
  </div>
</template>
```

### 水印组件

```vue
<template>
  <Watermark content="组件水印" :style="{ fontSize: 16, color: 'rgba(0,0,0,0.1)' }">
    <div class="content">
      <!-- 需要添加水印的内容 -->
    </div>
  </Watermark>
</template>

<script setup>
import { Watermark } from '@ldesign/watermark/vue'
</script>
```

## 📚 API 文档

### createWatermark(container, config)

创建水印实例

**参数：**

- `container: Element | string` - 容器元素或选择器
- `config: Partial<WatermarkConfig>` - 水印配置

**返回：**

- `Promise<WatermarkInstance>` - 水印实例

### destroyWatermark(instance)

销毁水印实例

**参数：**

- `instance: WatermarkInstance` - 水印实例

**返回：**

- `Promise<void>`

## 🎯 示例项目

项目包含完整的示例代码：

- **Vue 3 示例** - `examples/vue3/` - 展示 Vue 集成用法
- **原生 JS 示例** - `examples/vanilla-js/` - 展示原生 JavaScript 用法

```bash
# 运行Vue3示例
cd examples/vue3
pnpm dev

# 运行原生JS示例
cd examples/vanilla-js
pnpm dev
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# 代码检查
pnpm lint
```

## 📄 许可证

MIT © LDesign Team
