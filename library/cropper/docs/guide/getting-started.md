# 快速开始

本指南将帮助您快速上手 @ldesign/cropper，在几分钟内创建一个功能完整的图片裁剪器。

## 安装

首先，使用您喜欢的包管理器安装 @ldesign/cropper：

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

## 基础用法

### 1. 引入样式和脚本

```typescript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/styles'
```

### 2. 创建HTML容器

```html
<div id="cropper-container" style="width: 800px; height: 600px;"></div>
```

### 3. 初始化裁剪器

```typescript
// 创建裁剪器实例
const cropper = new Cropper('#cropper-container', {
  // 基础配置
  theme: 'light',
  aspectRatio: 16 / 9,
  enableGestures: true,
  enableKeyboard: true,
  
  // 裁剪配置
  cropShape: 'rectangle',
  minCropSize: { width: 100, height: 100 },
  maxCropSize: { width: 2000, height: 2000 },
  
  // 界面配置
  showGrid: true,
  showCenterLines: true,
  showCropInfo: true
})
```

### 4. 加载图片

```typescript
// 方式1: 通过URL加载
cropper.loadImage('/path/to/your/image.jpg')

// 方式2: 通过File对象加载
const fileInput = document.querySelector('#file-input')
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0]
  if (file) {
    cropper.loadImage(file)
  }
})

// 方式3: 通过Image对象加载
const img = new Image()
img.onload = () => cropper.loadImage(img)
img.src = '/path/to/your/image.jpg'
```

### 5. 监听事件

```typescript
// 裁剪器准备就绪
cropper.on('ready', (event) => {
  console.log('裁剪器已准备就绪', event.detail)
})

// 图片加载完成
cropper.on('imageLoaded', (event) => {
  console.log('图片加载完成', event.detail)
})

// 裁剪区域变化
cropper.on('cropChange', (event) => {
  console.log('裁剪区域变化', event.detail)
})

// 变换操作（缩放、旋转等）
cropper.on('transform', (event) => {
  console.log('变换操作', event.detail)
})
```

### 6. 获取裁剪结果

```typescript
// 获取裁剪后的Canvas
const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 600,
  quality: 0.9
})

// 获取裁剪后的Blob
const blob = await cropper.getCroppedBlob({
  type: 'image/jpeg',
  quality: 0.9
})

// 获取裁剪后的DataURL
const dataURL = cropper.getCroppedDataURL({
  type: 'image/png',
  quality: 1.0
})

// 获取裁剪数据
const cropData = cropper.getCropData()
console.log(cropData)
// {
//   x: 100,
//   y: 50,
//   width: 400,
//   height: 300,
//   shape: 'rectangle'
// }
```

## 完整示例

这里是一个完整的工作示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图片裁剪器示例</title>
  <style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .cropper-container {
      width: 100%;
      height: 500px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 8px 16px;
      border: 1px solid #722ed1;
      background: #722ed1;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn:hover {
      background: #5e2aa7;
    }
    
    .btn.secondary {
      background: transparent;
      color: #722ed1;
    }
    
    .btn.secondary:hover {
      background: #f1ecf9;
    }
    
    .file-input {
      display: none;
    }
    
    .preview {
      margin-top: 20px;
      text-align: center;
    }
    
    .preview canvas {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>@ldesign/cropper 示例</h1>
    
    <!-- 文件选择 -->
    <input type="file" id="file-input" class="file-input" accept="image/*">
    
    <!-- 裁剪器容器 -->
    <div id="cropper-container" class="cropper-container"></div>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button class="btn" onclick="selectImage()">选择图片</button>
      <button class="btn secondary" onclick="resetCrop()">重置裁剪</button>
      <button class="btn secondary" onclick="rotateLeft()">向左旋转</button>
      <button class="btn secondary" onclick="rotateRight()">向右旋转</button>
      <button class="btn secondary" onclick="flipHorizontal()">水平翻转</button>
      <button class="btn secondary" onclick="flipVertical()">垂直翻转</button>
      <button class="btn" onclick="exportImage()">导出图片</button>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview" id="preview"></div>
  </div>

  <script type="module">
    import { Cropper } from '@ldesign/cropper'
    import '@ldesign/cropper/styles'
    
    // 创建裁剪器实例
    const cropper = new Cropper('#cropper-container', {
      theme: 'light',
      aspectRatio: null, // 自由比例
      enableGestures: true,
      enableKeyboard: true,
      showGrid: true,
      showCenterLines: true,
      showCropInfo: true,
      cropShape: 'rectangle',
      minCropSize: { width: 50, height: 50 }
    })
    
    // 监听事件
    cropper.on('ready', () => {
      console.log('裁剪器准备就绪')
    })
    
    cropper.on('imageLoaded', (event) => {
      console.log('图片加载完成:', event.detail)
    })
    
    cropper.on('cropChange', (event) => {
      console.log('裁剪区域变化:', event.detail)
    })
    
    // 文件选择处理
    document.getElementById('file-input').addEventListener('change', (event) => {
      const file = event.target.files[0]
      if (file) {
        cropper.loadImage(file)
      }
    })
    
    // 全局函数
    window.selectImage = () => {
      document.getElementById('file-input').click()
    }
    
    window.resetCrop = () => {
      cropper.reset()
    }
    
    window.rotateLeft = () => {
      cropper.rotate(-90)
    }
    
    window.rotateRight = () => {
      cropper.rotate(90)
    }
    
    window.flipHorizontal = () => {
      cropper.flip('horizontal')
    }
    
    window.flipVertical = () => {
      cropper.flip('vertical')
    }
    
    window.exportImage = async () => {
      try {
        const canvas = cropper.getCroppedCanvas({
          width: 800,
          height: 600,
          quality: 0.9
        })
        
        // 显示预览
        const preview = document.getElementById('preview')
        preview.innerHTML = '<h3>裁剪结果预览</h3>'
        preview.appendChild(canvas)
        
        // 下载图片
        const blob = await cropper.getCroppedBlob({
          type: 'image/jpeg',
          quality: 0.9
        })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cropped-image.jpg'
        a.click()
        URL.revokeObjectURL(url)
        
      } catch (error) {
        console.error('导出失败:', error)
        alert('导出失败，请先选择图片')
      }
    }
    
    // 加载示例图片
    cropper.loadImage('/path/to/sample-image.jpg')
  </script>
</body>
</html>
```

## 下一步

现在您已经成功创建了一个基础的图片裁剪器！接下来您可以：

- 📖 查看 [配置选项](/guide/configuration) 了解更多自定义选项
- 🎨 探索 [主题系统](/guide/themes) 自定义外观
- 🔧 学习 [事件系统](/guide/events) 处理用户交互
- 🎪 查看 [框架集成](/guide/vue) 在您的项目中使用

## 常见问题

### Q: 如何设置固定的宽高比？

```typescript
const cropper = new Cropper('#container', {
  aspectRatio: 16 / 9 // 固定16:9比例
})
```

### Q: 如何限制裁剪区域的最小/最大尺寸？

```typescript
const cropper = new Cropper('#container', {
  minCropSize: { width: 100, height: 100 },
  maxCropSize: { width: 1000, height: 1000 }
})
```

### Q: 如何禁用某些功能？

```typescript
const cropper = new Cropper('#container', {
  enableGestures: false,    // 禁用手势
  enableKeyboard: false,    // 禁用键盘
  enableRotation: false,    // 禁用旋转
  enableScale: false        // 禁用缩放
})
```

### Q: 如何处理移动端？

```typescript
const cropper = new Cropper('#container', {
  enableTouch: true,        // 启用触摸
  enableGestures: true,     // 启用手势
  responsive: true,         // 响应式
  touchSensitivity: 1.2     // 触摸灵敏度
})
```
