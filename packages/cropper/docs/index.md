---
layout: home

hero:
  name: "LDESIGN Cropper"
  text: "现代图片裁剪器"
  tagline: 功能强大、高性能、支持多框架的图片裁剪解决方案
  image:
    src: /logo-large.svg
    alt: LDESIGN Cropper
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/cropper

features:
  - icon: 🎯
    title: 多种裁剪形状
    details: 支持矩形、圆形、椭圆形和自由形状裁剪，满足各种业务需求
  - icon: 🌐
    title: 多框架支持
    details: 原生支持 Vue 3、React、Angular 和原生 JavaScript，一套代码多端使用
  - icon: 📱
    title: 响应式设计
    details: 完美适配桌面端和移动端，支持触摸手势和高DPI屏幕
  - icon: ⚡
    title: 高性能渲染
    details: 基于 Canvas API 的硬件加速渲染，支持大图片处理和内存优化
  - icon: 🎨
    title: 主题定制
    details: 基于 LDESIGN 设计系统，支持亮色/暗色主题和完全自定义样式
  - icon: 🌍
    title: 国际化支持
    details: 内置多语言支持，可轻松扩展到任何语言
  - icon: 🔧
    title: 丰富配置
    details: 提供丰富的配置选项和预设，满足各种使用场景
  - icon: 📦
    title: TypeScript
    details: 完整的 TypeScript 支持，提供优秀的开发体验和类型安全
  - icon: 🚀
    title: 现代化
    details: 使用最新的 Web 技术栈，支持 ESM、Tree Shaking 和现代浏览器特性
---

## 快速体验

::: code-group

```javascript [原生 JavaScript]
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper({
  container: '#cropper-container',
  aspectRatio: 16 / 9
})

await cropper.setImage('path/to/image.jpg')
const canvas = cropper.getCroppedCanvas()
```

```vue [Vue 3]
<template>
  <LCropper
    v-model:crop-data="cropData"
    :src="imageSrc"
    :aspect-ratio="16/9"
    @crop-change="onCropChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { LCropper } from '@ldesign/cropper/vue'

const imageSrc = ref('path/to/image.jpg')
const cropData = ref(null)

const onCropChange = (data) => {
  console.log('裁剪数据:', data)
}
</script>
```

```jsx [React]
import React, { useState } from 'react'
import { Cropper } from '@ldesign/cropper/react'

function App() {
  const [imageSrc, setImageSrc] = useState('path/to/image.jpg')
  const [cropData, setCropData] = useState(null)

  return (
    <Cropper
      src={imageSrc}
      aspectRatio={16/9}
      cropData={cropData}
      onCropChange={setCropData}
    />
  )
}
```

```typescript [Angular]
@Component({
  selector: 'app-root',
  template: `
    <ldesign-cropper
      [src]="imageSrc"
      [aspectRatio]="16/9"
      [(cropData)]="cropData"
      (cropChange)="onCropChange($event)"
    ></ldesign-cropper>
  `
})
export class AppComponent {
  imageSrc = 'path/to/image.jpg'
  cropData = null

  onCropChange(data: any) {
    console.log('裁剪数据:', data)
  }
}
```

:::

## 为什么选择 LDESIGN Cropper？

### 🎯 专业级功能
- **精确裁剪**：像素级精度的裁剪控制
- **多种形状**：矩形、圆形、椭圆形、自由形状
- **丰富操作**：拖拽、缩放、旋转、翻转、重置
- **实时预览**：所见即所得的裁剪体验

### 🚀 卓越性能
- **硬件加速**：利用 GPU 加速渲染
- **内存优化**：智能内存管理，防止内存泄漏
- **大图支持**：分块处理超大图片
- **流畅交互**：60fps 的丝滑动画

### 🌐 全平台支持
- **多框架**：Vue、React、Angular、原生 JS
- **跨平台**：桌面端、移动端、平板端
- **现代浏览器**：Chrome、Firefox、Safari、Edge
- **TypeScript**：完整的类型定义

### 🎨 设计优雅
- **LDESIGN 设计系统**：统一的视觉语言
- **主题系统**：亮色、暗色、自动切换
- **响应式**：完美适配各种屏幕尺寸
- **可定制**：丰富的样式配置选项

## 立即开始

<div class="vp-doc">
  <div class="custom-block tip">
    <p class="custom-block-title">💡 提示</p>
    <p>LDESIGN Cropper 设计简洁、功能强大，只需几行代码就能集成到你的项目中。</p>
  </div>
</div>

[开始使用 →](/guide/getting-started)

## 社区与支持

- **GitHub**: [ldesign/cropper](https://github.com/ldesign/cropper)
- **NPM**: [@ldesign/cropper](https://www.npmjs.com/package/@ldesign/cropper)
- **文档**: [ldesign-cropper.vercel.app](https://ldesign-cropper.vercel.app)
- **问题反馈**: [GitHub Issues](https://github.com/ldesign/cropper/issues)

---

<div style="text-align: center; margin-top: 2rem; color: var(--vp-c-text-2);">
  <p>Built with ❤️ by LDESIGN Team</p>
</div>
