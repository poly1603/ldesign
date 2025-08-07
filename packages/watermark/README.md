# @ldesign/watermark

🌊 强大的水印组件库，支持文字水印、图片水印、Canvas 渲染、动画效果等多种功能。

## ✨ 特性

- 🚀 **高性能渲染** - 支持 DOM、Canvas、SVG 多种渲染模式
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📦 **轻量级** - 最小化的包体积，按需加载
- 🔧 **易于使用** - 简洁直观的 API 设计
- 🎨 **丰富样式** - 支持文字、图片、渐变等多种水印类型
- 🔒 **安全防护** - 内置防篡改和防删除机制
- 📱 **响应式** - 自动适配不同屏幕尺寸
- ⚡ **动画效果** - 支持淡入淡出、旋转等动画
- 🎭 **Vue3 集成** - 提供组合式 API 和组件

## 📦 安装

```bash
npm install @ldesign/watermark
# 或
pnpm add @ldesign/watermark
# 或
yarn add @ldesign/watermark
```

## 🚀 快速开始

### 基础文字水印

```typescript
import { createWatermark } from '@ldesign/watermark'

// 创建简单文字水印
const instance = await createWatermark(document.body, {
  content: '机密文档',
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)',
    opacity: 0.8,
  },
})
```

### 图片水印

```typescript
import { createWatermark } from '@ldesign/watermark'

// 创建图片水印
const instance = await createWatermark('#container', {
  content: {
    src: '/logo.png',
    width: 120,
    height: 40,
  },
  layout: {
    gapX: 200,
    gapY: 150,
  },
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
