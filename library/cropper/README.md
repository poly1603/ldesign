# @ldesign/cropper

一个功能强大、框架无关的 TypeScript 图片裁剪库，支持 Vue 3、React、Angular。

## ✨ 特性

- 🎯 **精确裁剪** - 支持像素级精确裁剪，多种裁剪形状（矩形、圆形、椭圆）
- 🔄 **图片变换** - 支持旋转、翻转、缩放等变换操作
- 📱 **触摸支持** - 完整的移动端触摸支持，包括双指缩放、旋转
- 🎨 **自定义样式** - 丰富的样式配置选项，支持深色/浅色主题
- 📤 **多格式导出** - 支持导出为 PNG、JPEG、WebP 等格式
- ⚡ **高性能** - 基于 Canvas 的高性能渲染
- 🔧 **TypeScript** - 完整的 TypeScript 类型定义
- 🌐 **框架支持** - 支持 Vue 3、React、Angular

## 📦 安装

```bash
npm install @ldesign/cropper
# 或
yarn add @ldesign/cropper
# 或
pnpm add @ldesign/cropper
```

## 🚀 快速开始

### 原生 JavaScript/TypeScript

```typescript
import { Cropper, CropShape, ImageFormat } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

// 创建裁剪器实例
const cropper = new Cropper({
  container: '#cropper-container',
  shape: CropShape.RECTANGLE,
  aspectRatio: 16/9,
  zoomable: true,
  rotatable: true
})

// 加载图片
await cropper.setImage('path/to/image.jpg')

// 获取裁剪结果
const canvas = cropper.getCroppedCanvas()
const blob = await cropper.getCroppedBlob({
  format: ImageFormat.PNG,
  quality: 0.9
})
```

### Vue 3

```vue
<template>
  <VueCropper
    ref="cropperRef"
    :src="imageSrc"
    shape="rectangle"
    :aspect-ratio="16/9"
    @crop-change="handleCropChange"
    @image-loaded="handleImageLoaded"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const cropperRef = ref()
const imageSrc = ref('path/to/image.jpg')

const handleCropChange = (cropData) => {
  console.log('裁剪数据:', cropData)
}

const handleImageLoaded = (imageInfo) => {
  console.log('图片信息:', imageInfo)
}

// 导出图片
const exportImage = async () => {
  const blob = await cropperRef.value?.getCroppedBlob()
  // 处理导出的图片
}
</script>
```

### React

```tsx
import React, { useRef } from 'react'
import { ReactCropper, type ReactCropperRef } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const cropperRef = useRef<ReactCropperRef>(null)

  const handleCropChange = (cropData) => {
    console.log('裁剪数据:', cropData)
  }

  const exportImage = async () => {
    const blob = await cropperRef.current?.getCroppedBlob()
    // 处理导出的图片
  }

  return (
    <div>
      <ReactCropper
        ref={cropperRef}
        src="path/to/image.jpg"
        shape="rectangle"
        aspectRatio={16/9}
        onCropChange={handleCropChange}
      />
      <button onClick={exportImage}>导出图片</button>
    </div>
  )
}
```

### Angular

```typescript
// app.module.ts
import { AngularCropperModule } from '@ldesign/cropper/angular'

@NgModule({
  imports: [AngularCropperModule],
  // ...
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<ng-cropper
  #cropper
  [src]="imageSrc"
  shape="rectangle"
  [aspectRatio]="16/9"
  (cropChange)="handleCropChange($event)"
  (imageLoaded)="handleImageLoaded($event)"
></ng-cropper>

<button (click)="exportImage()">导出图片</button>
```

```typescript
// app.component.ts
import { Component, ViewChild } from '@angular/core'
import { AngularCropperComponent } from '@ldesign/cropper/angular'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @ViewChild('cropper') cropper!: AngularCropperComponent

  imageSrc = 'path/to/image.jpg'

  handleCropChange(cropData: any) {
    console.log('裁剪数据:', cropData)
  }

  async exportImage() {
    const blob = await this.cropper.getCroppedBlob()
    // 处理导出的图片
  }
}
```

## 📖 API 文档

### Cropper 类

#### 构造函数

```typescript
new Cropper(options: CropperOptions)
```

#### 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| container | HTMLElement \| string | - | 容器元素或选择器 |
| shape | CropShape | 'rectangle' | 裁剪形状 |
| aspectRatio | number | 0 | 宽高比，0 表示自由比例 |
| movable | boolean | true | 是否可拖拽移动 |
| resizable | boolean | true | 是否可调整大小 |
| zoomable | boolean | true | 是否可缩放 |
| rotatable | boolean | true | 是否可旋转 |
| zoomRange | [number, number] | [0.1, 10] | 缩放范围 |
| guides | boolean | true | 是否显示辅助线 |
| responsive | boolean | true | 是否响应式 |
| touchEnabled | boolean | true | 是否启用触摸支持 |

#### 主要方法

```typescript
// 图片操作
setImage(source: ImageSource): Promise<void>

// 裁剪操作
getCropData(): CropData
setCropData(data: Partial<CropData>): void
getCroppedCanvas(options?: CropOutputOptions): HTMLCanvasElement
getCroppedDataURL(options?: CropOutputOptions): string
getCroppedBlob(options?: CropOutputOptions): Promise<Blob>

// 变换操作
zoom(scale: number): void
zoomIn(delta?: number): void
zoomOut(delta?: number): void
rotate(angle: number): void
rotateLeft(): void
rotateRight(): void
flip(horizontal: boolean, vertical: boolean): void
flipHorizontal(): void
flipVertical(): void
reset(): void

// 生命周期
destroy(): void
```

#### 事件

```typescript
cropper.on('ready', () => {})
cropper.on('imageLoaded', (event) => {})
cropper.on('cropChange', (event) => {})
cropper.on('zoomChange', (event) => {})
cropper.on('rotationChange', (event) => {})
```

### 预设宽高比

```typescript
import { AspectRatio } from '@ldesign/cropper'

AspectRatio.FREE      // 0 - 自由比例
AspectRatio.SQUARE    // 1 - 正方形
AspectRatio.RATIO_4_3 // 4/3
AspectRatio.RATIO_16_9 // 16/9
```

### 裁剪形状

```typescript
import { CropShape } from '@ldesign/cropper'

CropShape.RECTANGLE // 矩形
CropShape.CIRCLE    // 圆形
CropShape.ELLIPSE   // 椭圆
```

### 图片格式

```typescript
import { ImageFormat } from '@ldesign/cropper'

ImageFormat.PNG  // 'image/png'
ImageFormat.JPEG // 'image/jpeg'
ImageFormat.WEBP // 'image/webp'
```

## 🎨 样式自定义

### CSS 变量

```css
.cropper-container {
  --cropper-border-color: #39f;
  --cropper-handle-color: #39f;
  --cropper-guide-color: rgba(255, 255, 255, 0.5);
  --cropper-mask-color: rgba(0, 0, 0, 0.6);
}
```

### 主题

```css
/* 深色主题 */
.cropper-container.cropper-theme-dark {
  --cropper-border-color: #0af;
  --cropper-handle-color: #0af;
}

/* 浅色主题 */
.cropper-container.cropper-theme-light {
  --cropper-border-color: #007bff;
  --cropper-handle-color: #007bff;
}
```

## 🌐 浏览器兼容性

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [文档](https://github.com/ldesign/cropper/docs)
2. 搜索 [Issues](https://github.com/ldesign/cropper/issues)
3. 提交新的 [Issue](https://github.com/ldesign/cropper/issues/new)

---

Made with ❤️ by LDesign Team
