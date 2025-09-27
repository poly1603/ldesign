# 使用指南

## 基本概念

### 裁剪器实例

`Cropper` 是核心类，负责管理整个裁剪过程：

```typescript
import { Cropper } from '@ldesign/cropper'

const cropper = new Cropper({
  container: '#my-container',
  // 其他配置...
})
```

### 图片源类型

支持多种图片源：

```typescript
// 1. 图片URL
await cropper.setImage('https://example.com/image.jpg')

// 2. File对象（来自input[type="file"]）
const file = event.target.files[0]
await cropper.setImage(file)

// 3. HTMLImageElement
const img = new Image()
img.src = 'path/to/image.jpg'
await cropper.setImage(img)

// 4. HTMLCanvasElement
const canvas = document.createElement('canvas')
// ... 在canvas上绘制内容
await cropper.setImage(canvas)
```

## 配置选项详解

### 裁剪形状

```typescript
import { CropShape } from '@ldesign/cropper'

// 矩形裁剪
const cropper = new Cropper({
  container: '#container',
  shape: CropShape.RECTANGLE
})

// 圆形裁剪
const cropper = new Cropper({
  container: '#container',
  shape: CropShape.CIRCLE
})

// 椭圆裁剪
const cropper = new Cropper({
  container: '#container',
  shape: CropShape.ELLIPSE
})
```

### 宽高比约束

```typescript
import { AspectRatio } from '@ldesign/cropper'

// 自由比例
aspectRatio: AspectRatio.FREE // 或 0

// 正方形
aspectRatio: AspectRatio.SQUARE // 或 1

// 常用比例
aspectRatio: AspectRatio.RATIO_16_9 // 或 16/9
aspectRatio: AspectRatio.RATIO_4_3  // 或 4/3

// 自定义比例
aspectRatio: 2.5 // 宽度是高度的2.5倍
```

### 尺寸限制

```typescript
const cropper = new Cropper({
  container: '#container',
  minCropSize: { width: 100, height: 100 },
  maxCropSize: { width: 800, height: 600 }
})
```

### 缩放范围

```typescript
const cropper = new Cropper({
  container: '#container',
  zoomRange: [0.5, 3] // 最小0.5倍，最大3倍
})
```

## 事件处理

### 监听事件

```typescript
import { CropperEventType } from '@ldesign/cropper'

// 图片加载完成
cropper.on(CropperEventType.IMAGE_LOADED, (event) => {
  console.log('图片信息:', event.imageInfo)
})

// 裁剪区域变化
cropper.on(CropperEventType.CROP_CHANGE, (event) => {
  console.log('裁剪数据:', event.cropData)
})

// 缩放变化
cropper.on(CropperEventType.ZOOM_CHANGE, (event) => {
  console.log('缩放比例:', event.scale)
})

// 旋转变化
cropper.on(CropperEventType.ROTATION_CHANGE, (event) => {
  console.log('旋转角度:', event.rotation)
})
```

### 移除事件监听

```typescript
const handler = (event) => {
  console.log('裁剪变化:', event.cropData)
}

// 添加监听
cropper.on(CropperEventType.CROP_CHANGE, handler)

// 移除特定监听器
cropper.off(CropperEventType.CROP_CHANGE, handler)

// 移除所有监听器
cropper.off(CropperEventType.CROP_CHANGE)
```

## 图片操作

### 变换操作

```typescript
// 缩放
cropper.zoom(1.5) // 缩放到1.5倍
cropper.zoomIn(0.1) // 放大10%
cropper.zoomOut(0.1) // 缩小10%

// 旋转
cropper.rotate(45) // 旋转45度
cropper.rotateLeft() // 向左旋转90度
cropper.rotateRight() // 向右旋转90度

// 翻转
cropper.flip(true, false) // 水平翻转
cropper.flipHorizontal() // 水平翻转
cropper.flipVertical() // 垂直翻转

// 重置所有变换
cropper.reset()
```

### 裁剪数据操作

```typescript
// 获取当前裁剪数据
const cropData = cropper.getCropData()
console.log(cropData)
// {
//   x: 100,
//   y: 50,
//   width: 300,
//   height: 200,
//   shape: 'rectangle'
// }

// 设置裁剪数据
cropper.setCropData({
  x: 50,
  y: 25,
  width: 400,
  height: 300
})
```

## 导出功能

### 获取裁剪结果

```typescript
import { ImageFormat } from '@ldesign/cropper'

// 获取Canvas
const canvas = cropper.getCroppedCanvas()

// 获取DataURL
const dataURL = cropper.getCroppedDataURL({
  format: ImageFormat.PNG,
  quality: 0.9
})

// 获取Blob
const blob = await cropper.getCroppedBlob({
  format: ImageFormat.JPEG,
  quality: 0.8
})
```

### 自定义输出尺寸

```typescript
// 指定输出尺寸
const canvas = cropper.getCroppedCanvas({
  size: { width: 400, height: 300 }
})

// 填充背景色
const canvas = cropper.getCroppedCanvas({
  fillBackground: true,
  backgroundColor: '#ffffff'
})
```

### 下载图片

```typescript
async function downloadCroppedImage() {
  const blob = await cropper.getCroppedBlob({
    format: ImageFormat.PNG,
    quality: 0.9
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'cropped-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

## 响应式设计

### 容器大小变化

```typescript
const cropper = new Cropper({
  container: '#container',
  responsive: true // 启用响应式
})

// 手动触发重新计算
window.addEventListener('resize', () => {
  // 裁剪器会自动处理，无需手动操作
})
```

### 移动端优化

```typescript
const cropper = new Cropper({
  container: '#container',
  touchEnabled: true, // 启用触摸支持
  responsive: true
})
```

## 预览功能

### 实时预览

```typescript
const cropper = new Cropper({
  container: '#container',
  preview: {
    container: '#preview',
    size: { width: 200, height: 150 },
    realtime: true
  }
})
```

### 手动更新预览

```typescript
function updatePreview() {
  const canvas = cropper.getCroppedCanvas({
    size: { width: 200, height: 150 }
  })
  
  const previewContainer = document.getElementById('preview')
  previewContainer.innerHTML = ''
  previewContainer.appendChild(canvas)
}

cropper.on(CropperEventType.CROP_CHANGE, updatePreview)
```

## 错误处理

### 兼容性检查

```typescript
import { checkCompatibility } from '@ldesign/cropper'

const compatibility = checkCompatibility()
if (!compatibility.supported) {
  console.error('浏览器不支持:', compatibility.errors)
  // 显示降级方案
}
```

### 图片加载错误

```typescript
cropper.on(CropperEventType.IMAGE_ERROR, (event) => {
  console.error('图片加载失败:', event.error)
  // 显示错误提示
})

try {
  await cropper.setImage('invalid-image-url')
} catch (error) {
  console.error('设置图片失败:', error)
}
```

## 性能优化

### 大图片处理

```typescript
// 对于大图片，可以先创建缩略图
import { createThumbnail } from '@ldesign/cropper'

const image = new Image()
image.onload = async () => {
  // 创建缩略图用于预览
  const thumbnail = createThumbnail(image, 800)
  await cropper.setImage(thumbnail)
}
```

### 内存管理

```typescript
// 组件销毁时清理资源
function cleanup() {
  cropper.destroy()
}

// 在适当的时机调用cleanup
window.addEventListener('beforeunload', cleanup)
```

## 常见问题

### Q: 如何限制裁剪区域在图片范围内？

A: 裁剪器会自动约束裁剪区域在图片边界内，无需额外配置。

### Q: 如何实现圆形头像裁剪？

```typescript
const cropper = new Cropper({
  container: '#container',
  shape: CropShape.CIRCLE,
  aspectRatio: 1 // 正方形比例
})
```

### Q: 如何禁用某些功能？

```typescript
const cropper = new Cropper({
  container: '#container',
  movable: false,    // 禁用拖拽
  resizable: false,  // 禁用调整大小
  zoomable: false,   // 禁用缩放
  rotatable: false   // 禁用旋转
})
```

### Q: 如何获取原图信息？

```typescript
cropper.on(CropperEventType.IMAGE_LOADED, (event) => {
  const { naturalWidth, naturalHeight, aspectRatio } = event.imageInfo
  console.log(`原图尺寸: ${naturalWidth} x ${naturalHeight}`)
  console.log(`宽高比: ${aspectRatio}`)
})
```
