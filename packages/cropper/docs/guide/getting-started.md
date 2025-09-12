# 快速开始

本指南将帮助你快速上手 LDESIGN Cropper，在几分钟内集成到你的项目中。

## 安装

首先，使用你喜欢的包管理器安装 LDESIGN Cropper：

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

## 基础使用

### 原生 JavaScript

最简单的使用方式是直接使用原生 JavaScript：

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

// 创建裁剪器实例
const cropper = new Cropper({
  container: '#cropper-container', // 容器选择器或 DOM 元素
  aspectRatio: 16 / 9,            // 宽高比
  viewMode: 1                     // 视图模式
})

// 设置要裁剪的图片
await cropper.setImage('path/to/your/image.jpg')

// 获取裁剪结果
const canvas = cropper.getCroppedCanvas()
const dataURL = cropper.getCroppedDataURL()
const blob = await cropper.getCroppedBlob()
```

### HTML 结构

在你的 HTML 中添加容器元素：

```html
<!DOCTYPE html>
<html>
<head>
  <title>LDESIGN Cropper 示例</title>
</head>
<body>
  <!-- 裁剪器容器 -->
  <div id="cropper-container" style="width: 800px; height: 600px;"></div>
  
  <!-- 操作按钮 -->
  <div>
    <button id="crop-btn">获取裁剪结果</button>
    <button id="reset-btn">重置</button>
  </div>

  <script type="module">
    import { Cropper } from '@ldesign/cropper'
    import '@ldesign/cropper/style.css'

    const cropper = new Cropper({
      container: '#cropper-container',
      aspectRatio: 16 / 9
    })

    // 设置图片
    cropper.setImage('https://example.com/image.jpg')

    // 绑定事件
    document.getElementById('crop-btn').addEventListener('click', () => {
      const canvas = cropper.getCroppedCanvas()
      // 处理裁剪结果
      console.log('裁剪结果:', canvas)
    })

    document.getElementById('reset-btn').addEventListener('click', () => {
      cropper.reset()
    })
  </script>
</body>
</html>
```

## 框架集成

### Vue 3

在 Vue 3 项目中使用：

```vue
<template>
  <div>
    <!-- 图片上传 -->
    <input type="file" @change="handleFileChange" accept="image/*" />
    
    <!-- 裁剪器组件 -->
    <LCropper
      v-if="imageSrc"
      v-model:crop-data="cropData"
      :src="imageSrc"
      :aspect-ratio="16/9"
      :shape="'rectangle'"
      @crop-change="onCropChange"
      @image-load="onImageLoad"
      class="cropper"
    />
    
    <!-- 操作按钮 -->
    <div v-if="imageSrc" class="actions">
      <button @click="getCroppedImage">获取裁剪结果</button>
      <button @click="resetCropper">重置</button>
    </div>
    
    <!-- 预览结果 -->
    <div v-if="croppedImageUrl" class="preview">
      <h3>裁剪结果：</h3>
      <img :src="croppedImageUrl" alt="裁剪结果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const imageSrc = ref('')
const cropData = ref(null)
const croppedImageUrl = ref('')
const cropperRef = ref()

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSrc.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const onCropChange = (data: any) => {
  console.log('裁剪数据变化:', data)
}

const onImageLoad = () => {
  console.log('图片加载完成')
}

const getCroppedImage = async () => {
  if (cropperRef.value) {
    const canvas = await cropperRef.value.getCroppedCanvas()
    croppedImageUrl.value = canvas.toDataURL()
  }
}

const resetCropper = () => {
  if (cropperRef.value) {
    cropperRef.value.reset()
  }
}
</script>

<style scoped>
.cropper {
  width: 100%;
  max-width: 800px;
  height: 600px;
  margin: 20px 0;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin-right: 10px;
  padding: 8px 16px;
  background: #722ED1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview {
  margin-top: 20px;
}

.preview img {
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

### React

在 React 项目中使用：

```jsx
import React, { useState, useRef } from 'react'
import { Cropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const [imageSrc, setImageSrc] = useState('')
  const [cropData, setCropData] = useState(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState('')
  const cropperRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropChange = (data) => {
    console.log('裁剪数据变化:', data)
    setCropData(data)
  }

  const getCroppedImage = async () => {
    if (cropperRef.current) {
      const canvas = await cropperRef.current.getCroppedCanvas()
      setCroppedImageUrl(canvas.toDataURL())
    }
  }

  const resetCropper = () => {
    if (cropperRef.current) {
      cropperRef.current.reset()
    }
  }

  return (
    <div className="app">
      {/* 图片上传 */}
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept="image/*" 
      />
      
      {/* 裁剪器组件 */}
      {imageSrc && (
        <Cropper
          ref={cropperRef}
          src={imageSrc}
          aspectRatio={16/9}
          shape="rectangle"
          cropData={cropData}
          onCropChange={handleCropChange}
          onImageLoad={() => console.log('图片加载完成')}
          className="cropper"
        />
      )}
      
      {/* 操作按钮 */}
      {imageSrc && (
        <div className="actions">
          <button onClick={getCroppedImage}>获取裁剪结果</button>
          <button onClick={resetCropper}>重置</button>
        </div>
      )}
      
      {/* 预览结果 */}
      {croppedImageUrl && (
        <div className="preview">
          <h3>裁剪结果：</h3>
          <img src={croppedImageUrl} alt="裁剪结果" />
        </div>
      )}
    </div>
  )
}

export default App
```

### Angular

在 Angular 项目中使用：

```typescript
// app.component.ts
import { Component, ViewChild } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper/angular'

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <!-- 图片上传 -->
      <input 
        type="file" 
        (change)="handleFileChange($event)" 
        accept="image/*"
      />
      
      <!-- 裁剪器组件 -->
      <ldesign-cropper
        *ngIf="imageSrc"
        #cropper
        [src]="imageSrc"
        [aspectRatio]="16/9"
        [shape]="'rectangle'"
        [(cropData)]="cropData"
        (cropChange)="onCropChange($event)"
        (imageLoad)="onImageLoad()"
        class="cropper"
      ></ldesign-cropper>
      
      <!-- 操作按钮 -->
      <div *ngIf="imageSrc" class="actions">
        <button (click)="getCroppedImage()">获取裁剪结果</button>
        <button (click)="resetCropper()">重置</button>
      </div>
      
      <!-- 预览结果 -->
      <div *ngIf="croppedImageUrl" class="preview">
        <h3>裁剪结果：</h3>
        <img [src]="croppedImageUrl" alt="裁剪结果" />
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('cropper') cropper!: CropperComponent

  imageSrc = ''
  cropData = null
  croppedImageUrl = ''

  handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imageSrc = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  onCropChange(data: any) {
    console.log('裁剪数据变化:', data)
  }

  onImageLoad() {
    console.log('图片加载完成')
  }

  async getCroppedImage() {
    if (this.cropper) {
      const canvas = await this.cropper.getCroppedCanvas()
      this.croppedImageUrl = canvas.toDataURL()
    }
  }

  resetCropper() {
    if (this.cropper) {
      this.cropper.reset()
    }
  }
}
```

## 配置选项

LDESIGN Cropper 提供了丰富的配置选项：

```javascript
const cropper = new Cropper({
  // 基础配置
  container: '#cropper-container',  // 容器
  aspectRatio: 16 / 9,             // 宽高比
  shape: 'rectangle',              // 裁剪形状
  viewMode: 1,                     // 视图模式
  
  // 尺寸限制
  minCropBoxWidth: 100,            // 最小裁剪宽度
  minCropBoxHeight: 100,           // 最小裁剪高度
  maxCropBoxWidth: 800,            // 最大裁剪宽度
  maxCropBoxHeight: 600,           // 最大裁剪高度
  
  // 交互配置
  dragMode: 'crop',                // 拖拽模式
  resizable: true,                 // 可调整大小
  movable: true,                   // 可移动
  rotatable: true,                 // 可旋转
  scalable: true,                  // 可缩放
  zoomable: true,                  // 可缩放
  
  // UI配置
  showGrid: true,                  // 显示网格
  showCenterIndicator: true,       // 显示中心指示器
  toolbar: {
    show: true,                    // 显示工具栏
    position: 'top',               // 工具栏位置
    tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'reset']
  },
  
  // 主题配置
  theme: 'light',                  // 主题模式
  
  // 性能配置
  performance: {
    hardwareAcceleration: true,    // 硬件加速
    maxFPS: 60,                    // 最大帧率
    memoryLimit: 100               // 内存限制(MB)
  }
})
```

## 下一步

现在你已经成功集成了 LDESIGN Cropper！接下来你可以：

- [学习基本用法](/guide/basic-usage) - 了解更多使用方法
- [探索裁剪形状](/guide/crop-shapes) - 学习不同的裁剪形状
- [查看 API 文档](/api/) - 了解完整的 API
- [浏览示例](/examples/) - 查看更多实际示例

如果遇到问题，请查看 [常见问题](/guide/faq) 或在 [GitHub](https://github.com/ldesign/cropper/issues) 上提出问题。
