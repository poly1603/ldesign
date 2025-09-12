# @ldesign/cropper

一个强大的、框架无关的图片裁剪库，支持 Vue 3、React、Angular 和原生 JavaScript。

## ✨ 特性

### 🎯 核心功能
- **多种裁剪形状**：矩形、圆形、椭圆、自由形状
- **丰富的操作**：拖拽、缩放、旋转、翻转、重置
- **多格式支持**：JPEG、PNG、WebP、BMP
- **高质量输出**：可配置质量、尺寸、格式转换

### 📱 设备兼容
- **响应式设计**：完美适配桌面端和移动端
- **触摸支持**：原生触摸手势操作
- **高DPI支持**：清晰显示在高分辨率屏幕

### ⚡ 性能优化
- **Canvas渲染**：硬件加速的高性能渲染
- **大图片处理**：智能分块处理和懒加载
- **内存优化**：自动内存管理，防止内存泄漏
- **流畅交互**：60fps 的丝滑动画体验

### 🎨 丰富配置
- **比例限制**：可配置裁剪区域比例
- **尺寸控制**：最小/最大裁剪尺寸限制
- **主题系统**：基于 LDESIGN 设计系统，支持自定义主题
- **工具栏**：可配置的工具按钮
- **国际化**：多语言支持

### 🔧 易于使用
- **简洁API**：直观的接口设计
- **TypeScript**：完整的类型定义
- **链式调用**：支持方法链式调用
- **预设配置**：常用场景的预设配置

## 📦 安装

```bash
# npm
npm install @ldesign/cropper

# yarn
yarn add @ldesign/cropper

# pnpm
pnpm add @ldesign/cropper
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

// 创建裁剪器实例
const cropper = new Cropper({
  container: '#cropper-container',
  shape: 'rectangle',
  aspectRatio: 16 / 9,
})

// 设置图片
await cropper.setImage('path/to/image.jpg')

// 获取裁剪结果
const canvas = cropper.getCroppedCanvas()
const blob = await cropper.getCroppedBlob()
```

### Vue 3

```vue
<template>
  <div>
    <LCropper
      v-model:crop-data="cropData"
      :src="imageSrc"
      :shape="shape"
      :aspect-ratio="16/9"
      @crop-change="onCropChange"
    />
    <button @click="downloadImage">下载图片</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('path/to/image.jpg')
const cropData = ref(null)
const shape = ref('rectangle')

const onCropChange = (data) => {
  console.log('裁剪数据变化:', data)
}

const downloadImage = async () => {
  const canvas = await cropper.value.getCroppedCanvas()
  // 下载逻辑
}
</script>
```

### React

```tsx
import React, { useState, useRef } from 'react'
import { Cropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const [imageSrc, setImageSrc] = useState('path/to/image.jpg')
  const [cropData, setCropData] = useState(null)
  const cropperRef = useRef(null)

  const handleCropChange = (data) => {
    console.log('裁剪数据变化:', data)
    setCropData(data)
  }

  const downloadImage = async () => {
    if (cropperRef.current) {
      const canvas = await cropperRef.current.getCroppedCanvas()
      // 下载逻辑
    }
  }

  return (
    <div>
      <Cropper
        ref={cropperRef}
        src={imageSrc}
        shape="rectangle"
        aspectRatio={16/9}
        onCropChange={handleCropChange}
      />
      <button onClick={downloadImage}>下载图片</button>
    </div>
  )
}
```

### Angular

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper/angular'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-cropper
      [src]="imageSrc"
      [shape]="shape"
      [aspectRatio]="aspectRatio"
      (cropChange)="onCropChange($event)"
      #cropper
    ></ldesign-cropper>
    <button (click)="downloadImage()">下载图片</button>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageSrc = 'path/to/image.jpg'
  shape = 'rectangle'
  aspectRatio = 16 / 9

  onCropChange(data: any) {
    console.log('裁剪数据变化:', data)
  }

  async downloadImage() {
    const canvas = await this.cropper.getCroppedCanvas()
    // 下载逻辑
  }
}
```

## 📖 API 文档

### 基础配置

```typescript
interface CropperOptions {
  container: HTMLElement | string    // 容器元素
  shape?: CropShape                  // 裁剪形状
  aspectRatio?: number              // 宽高比
  minSize?: Size                    // 最小尺寸
  maxSize?: Size                    // 最大尺寸
  resizable?: boolean               // 是否可调整大小
  movable?: boolean                 // 是否可移动
  rotatable?: boolean               // 是否可旋转
  showGrid?: boolean                // 显示网格线
  touchEnabled?: boolean            // 启用触摸支持
  wheelZoom?: boolean               // 鼠标滚轮缩放
  theme?: ThemeConfig               // 主题配置
  toolbar?: ToolbarConfig           // 工具栏配置
}
```

### 主要方法

```typescript
class Cropper {
  // 设置图片
  setImage(src: string | File | HTMLImageElement): Promise<void>
  
  // 获取裁剪结果
  getCroppedCanvas(config?: OutputConfig): HTMLCanvasElement
  getCroppedBlob(config?: OutputConfig): Promise<Blob>
  getCroppedDataURL(config?: OutputConfig): string
  
  // 获取/设置裁剪数据
  getCropData(): CropArea
  setCropData(cropArea: Partial<CropArea>): void
  
  // 变换操作
  zoom(ratio: number): void
  rotate(angle: number): void
  flip(horizontal?: boolean, vertical?: boolean): void
  reset(): void
  
  // 事件监听
  on(event: CropperEventType, listener: CropperEventListener): void
  off(event: CropperEventType, listener: CropperEventListener): void
  
  // 销毁
  destroy(): void
}
```

## 🎨 主题定制

```typescript
const customTheme = {
  name: 'custom',
  primaryColor: '#722ED1',
  borderColor: '#d9d9d9',
  handleColor: '#722ED1',
  gridColor: 'rgba(255, 255, 255, 0.3)',
  backgroundColor: '#ffffff',
  maskColor: 'rgba(0, 0, 0, 0.5)',
}

const cropper = new Cropper({
  container: '#cropper',
  theme: customTheme,
})
```

## 🌍 国际化

```typescript
const i18nConfig = {
  locale: 'zh-CN',
  messages: {
    'toolbar.zoomIn': '放大',
    'toolbar.zoomOut': '缩小',
    'toolbar.rotateLeft': '向左旋转',
    'toolbar.rotateRight': '向右旋转',
    'toolbar.flipHorizontal': '水平翻转',
    'toolbar.flipVertical': '垂直翻转',
    'toolbar.reset': '重置',
    'toolbar.download': '下载',
  },
}

const cropper = new Cropper({
  container: '#cropper',
  i18n: i18nConfig,
})
```

## 📱 响应式配置

```typescript
const cropper = new Cropper({
  container: '#cropper',
  // 移动端优化配置
  touchEnabled: true,
  toolbar: {
    position: 'bottom', // 移动端工具栏放底部
    tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'reset'],
  },
  // 性能配置
  performance: {
    hardwareAcceleration: true,
    maxFPS: 60,
    memoryLimit: 100, // 100MB
  },
})
```

## 🔧 高级用法

### 自定义工具栏

```typescript
const cropper = new Cropper({
  container: '#cropper',
  toolbar: {
    show: true,
    position: 'top',
    tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right'],
    customTools: [
      {
        name: 'custom-filter',
        icon: '🎨',
        tooltip: '应用滤镜',
        action: () => {
          // 自定义操作
        },
      },
    ],
  },
})
```

### 批量处理

```typescript
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg']
const results = []

for (const imageSrc of images) {
  await cropper.setImage(imageSrc)
  const canvas = cropper.getCroppedCanvas({
    width: 300,
    height: 200,
    quality: 0.9,
  })
  results.push(canvas)
}
```

## 🧪 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 📄 许可证

MIT License © 2024 LDesign Team
