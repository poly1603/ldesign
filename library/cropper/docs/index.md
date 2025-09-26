# @ldesign/cropper

::: tip 功能强大的图片裁剪插件
支持移动端、平板和PC端，提供丰富的配置选项和事件系统，支持Vue 3、React、Angular等多种框架。
:::

## ✨ 特性

- 🎯 **多设备支持** - 完美适配移动端、平板和桌面端
- 🎨 **多主题系统** - 内置浅色、深色、高对比度主题
- 🔧 **高度可配置** - 丰富的配置选项和自定义能力
- 📱 **触摸友好** - 支持手势操作和触摸交互
- 🚀 **高性能** - Canvas硬件加速，流畅的60fps体验
- 🎪 **多框架支持** - Vue 3、React、Angular、原生JS
- ♿ **无障碍访问** - WCAG兼容，支持键盘导航和屏幕阅读器
- 📦 **轻量级** - 模块化设计，按需加载

## 🚀 快速开始

### 安装

::: code-group

```bash [npm]
npm install @ldesign/cropper
```

```bash [yarn]
yarn add @ldesign/cropper
```

```bash [pnpm]
pnpm add @ldesign/cropper
```

:::

### 基础用法

```typescript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/styles'

// 创建裁剪器实例
const cropper = new Cropper('#container', {
  theme: 'light',
  aspectRatio: 16 / 9,
  enableGestures: true
})

// 加载图片
cropper.loadImage('/path/to/image.jpg')

// 监听事件
cropper.on('cropChange', (data) => {
  console.log('裁剪区域变化:', data)
})

// 导出裁剪结果
const canvas = cropper.getCroppedCanvas()
const blob = await cropper.getCroppedBlob()
```

## 🎨 主题预览

<div class="theme-preview">
  <div class="theme-item">
    <div class="theme-demo light-theme">
      <div class="cropper-container">
        <div class="crop-area"></div>
        <div class="control-point nw"></div>
        <div class="control-point ne"></div>
        <div class="control-point sw"></div>
        <div class="control-point se"></div>
      </div>
    </div>
    <p>浅色主题</p>
  </div>
  
  <div class="theme-item">
    <div class="theme-demo dark-theme">
      <div class="cropper-container">
        <div class="crop-area"></div>
        <div class="control-point nw"></div>
        <div class="control-point ne"></div>
        <div class="control-point sw"></div>
        <div class="control-point se"></div>
      </div>
    </div>
    <p>深色主题</p>
  </div>
  
  <div class="theme-item">
    <div class="theme-demo high-contrast-theme">
      <div class="cropper-container">
        <div class="crop-area"></div>
        <div class="control-point nw"></div>
        <div class="control-point ne"></div>
        <div class="control-point sw"></div>
        <div class="control-point se"></div>
      </div>
    </div>
    <p>高对比度主题</p>
  </div>
</div>

## 🎪 框架支持

### Vue 3

```vue
<template>
  <LCropper 
    :config="config"
    :src="imageSrc"
    @ready="onReady"
    @crop-change="onCropChange"
  />
</template>

<script setup>
import { LCropper } from '@ldesign/cropper/vue'

const config = {
  theme: 'dark',
  aspectRatio: 1,
  enableGestures: true
}

const onReady = (cropper) => {
  console.log('裁剪器准备就绪:', cropper)
}

const onCropChange = (data) => {
  console.log('裁剪变化:', data)
}
</script>
```

### React

```tsx
import { LCropper, useCropper } from '@ldesign/cropper/react'

function App() {
  const { cropper, containerRef } = useCropper({
    theme: 'light',
    aspectRatio: 16 / 9
  })
  
  return (
    <LCropper 
      config={config}
      src={imageSrc}
      onReady={onReady}
      onCropChange={onCropChange}
    />
  )
}
```

### Angular

```typescript
import { LCropperModule } from '@ldesign/cropper/angular'

@Component({
  template: `
    <l-cropper 
      [config]="config"
      [src]="imageSrc"
      (ready)="onReady($event)"
      (cropChange)="onCropChange($event)">
    </l-cropper>
  `
})
export class AppComponent {
  config = {
    theme: 'light',
    aspectRatio: 1,
    enableGestures: true
  }
}
```

## 📊 性能指标

| 指标 | 目标值 | 实际值 |
|------|--------|--------|
| 初始化时间 | < 100ms | ~80ms |
| 渲染性能 | 60fps | 60fps |
| 内存使用 | < 50MB | ~30MB |
| 包大小 | < 200KB | ~150KB |

## 🌟 核心功能

### 图片处理
- 支持多种图片格式（JPEG、PNG、WebP、AVIF）
- 智能图片压缩和优化
- 图片旋转、翻转、缩放
- 实时预览和编辑

### 裁剪功能
- 矩形、圆形、椭圆形裁剪
- 自由形状裁剪
- 预设宽高比
- 智能裁剪建议

### 交互体验
- 拖拽调整裁剪区域
- 手势缩放和旋转
- 键盘快捷键支持
- 撤销/重做功能

### 导出选项
- 多种格式导出
- 自定义质量和尺寸
- 批量处理
- 水印添加

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign/cropper)
- [在线演示](https://ldesign.github.io/cropper)
- [更新日志](/changelog)
- [问题反馈](https://github.com/ldesign/cropper/issues)

## 📄 许可证

[MIT License](https://github.com/ldesign/cropper/blob/main/LICENSE)

<style>
.theme-preview {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.theme-item {
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.theme-demo {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  padding: 1rem;
  margin: 0 auto 0.5rem;
  position: relative;
  overflow: hidden;
}

.light-theme {
  background: #ffffff;
  border: 1px solid #e5e5e5;
}

.dark-theme {
  background: #1a1a1a;
  border: 1px solid #404040;
}

.high-contrast-theme {
  background: #000000;
  border: 2px solid #ffffff;
}

.cropper-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
}

.dark-theme .cropper-container {
  background: repeating-conic-gradient(#333 0% 25%, transparent 0% 50%) 50% / 20px 20px;
}

.high-contrast-theme .cropper-container {
  background: repeating-conic-gradient(#333 0% 25%, transparent 0% 50%) 50% / 20px 20px;
}

.crop-area {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 60%;
  height: 60%;
  border: 2px solid #722ed1;
  background: rgba(114, 46, 209, 0.1);
}

.high-contrast-theme .crop-area {
  border: 3px solid #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.control-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #722ed1;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.high-contrast-theme .control-point {
  background: #ffffff;
  border: 2px solid #000000;
}

.control-point.nw {
  top: calc(20% - 6px);
  left: calc(20% - 6px);
}

.control-point.ne {
  top: calc(20% - 6px);
  right: calc(20% - 6px);
}

.control-point.sw {
  bottom: calc(20% - 6px);
  left: calc(20% - 6px);
}

.control-point.se {
  bottom: calc(20% - 6px);
  right: calc(20% - 6px);
}
</style>
