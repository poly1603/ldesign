# Cropper 类

`Cropper` 是 @ldesign/cropper 的核心类，提供了完整的图片裁剪功能。

## 构造函数

### `new Cropper(container, config?)`

创建一个新的裁剪器实例。

**参数:**
- `container` (`string | HTMLElement`) - 容器元素或选择器
- `config` (`CropperConfig`) - 可选的配置对象

**示例:**
```typescript
// 使用选择器
const cropper = new Cropper('#container')

// 使用DOM元素
const element = document.getElementById('container')
const cropper = new Cropper(element)

// 使用配置
const cropper = new Cropper('#container', {
  theme: 'dark',
  aspectRatio: 16 / 9,
  enableGestures: true
})
```

## 图片操作方法

### `loadImage(source)`

加载图片到裁剪器中。

**参数:**
- `source` (`string | File | HTMLImageElement | HTMLCanvasElement`) - 图片源

**返回值:** `Promise<void>`

**示例:**
```typescript
// 从URL加载
await cropper.loadImage('/path/to/image.jpg')

// 从File对象加载
const file = event.target.files[0]
await cropper.loadImage(file)

// 从Image元素加载
const img = new Image()
img.src = '/path/to/image.jpg'
await cropper.loadImage(img)
```

### `hasImage()`

检查是否已加载图片。

**返回值:** `boolean`

**示例:**
```typescript
if (cropper.hasImage()) {
  console.log('已加载图片')
}
```

### `getImageData()`

获取当前图片的数据信息。

**返回值:** `ImageData | null`

**示例:**
```typescript
const imageData = cropper.getImageData()
if (imageData) {
  console.log('图片尺寸:', imageData.width, 'x', imageData.height)
}
```

## 裁剪操作方法

### `setCropData(data)`

设置裁剪区域数据。

**参数:**
- `data` (`CropData`) - 裁剪数据对象

**示例:**
```typescript
cropper.setCropData({
  x: 100,
  y: 50,
  width: 400,
  height: 300,
  shape: 'rectangle'
})
```

### `getCropData()`

获取当前裁剪区域数据。

**返回值:** `CropData | null`

**示例:**
```typescript
const cropData = cropper.getCropData()
if (cropData) {
  console.log('裁剪区域:', cropData)
}
```

### `resetCrop()`

重置裁剪区域到默认状态。

**示例:**
```typescript
cropper.resetCrop()
```

### `moveCrop(deltaX, deltaY)`

移动裁剪区域。

**参数:**
- `deltaX` (`number`) - X轴偏移量
- `deltaY` (`number`) - Y轴偏移量

**示例:**
```typescript
// 向右移动50像素，向下移动30像素
cropper.moveCrop(50, 30)
```

### `resizeCrop(width, height)`

调整裁剪区域大小。

**参数:**
- `width` (`number`) - 新宽度
- `height` (`number`) - 新高度

**示例:**
```typescript
cropper.resizeCrop(400, 300)
```

## 变换操作方法

### `setScale(scale, center?)`

设置图片缩放比例。

**参数:**
- `scale` (`number`) - 缩放比例
- `center` (`Point`) - 可选的缩放中心点

**示例:**
```typescript
// 缩放到2倍
cropper.setScale(2)

// 以指定点为中心缩放
cropper.setScale(1.5, { x: 400, y: 300 })
```

### `getScale()`

获取当前缩放比例。

**返回值:** `number`

### `zoom(delta, center?)`

缩放图片。

**参数:**
- `delta` (`number`) - 缩放增量
- `center` (`Point`) - 可选的缩放中心点

**示例:**
```typescript
// 放大0.1倍
cropper.zoom(0.1)

// 缩小0.1倍
cropper.zoom(-0.1)
```

### `setRotation(angle, center?)`

设置图片旋转角度。

**参数:**
- `angle` (`number`) - 旋转角度（度）
- `center` (`Point`) - 可选的旋转中心点

**示例:**
```typescript
// 旋转45度
cropper.setRotation(45)
```

### `getRotation()`

获取当前旋转角度。

**返回值:** `number`

### `rotate(delta, center?)`

旋转图片。

**参数:**
- `delta` (`number`) - 旋转增量（度）
- `center` (`Point`) - 可选的旋转中心点

**示例:**
```typescript
// 顺时针旋转90度
cropper.rotate(90)

// 逆时针旋转45度
cropper.rotate(-45)
```

### `flip(direction)`

翻转图片。

**参数:**
- `direction` (`'horizontal' | 'vertical'`) - 翻转方向

**示例:**
```typescript
// 水平翻转
cropper.flip('horizontal')

// 垂直翻转
cropper.flip('vertical')
```

### `resetTransform()`

重置所有变换操作。

**示例:**
```typescript
cropper.resetTransform()
```

## 导出方法

### `getCroppedCanvas(options?)`

获取裁剪后的Canvas元素。

**参数:**
- `options` (`ExportOptions`) - 可选的导出选项

**返回值:** `HTMLCanvasElement`

**示例:**
```typescript
const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 600,
  quality: 0.9
})
```

### `getCroppedBlob(options?)`

获取裁剪后的Blob对象。

**参数:**
- `options` (`ExportOptions`) - 可选的导出选项

**返回值:** `Promise<Blob>`

**示例:**
```typescript
const blob = await cropper.getCroppedBlob({
  type: 'image/jpeg',
  quality: 0.8
})
```

### `getCroppedDataURL(options?)`

获取裁剪后的DataURL字符串。

**参数:**
- `options` (`ExportOptions`) - 可选的导出选项

**返回值:** `string`

**示例:**
```typescript
const dataURL = cropper.getCroppedDataURL({
  type: 'image/png',
  quality: 1.0
})
```

### `downloadCroppedImage(filename?, options?)`

下载裁剪后的图片。

**参数:**
- `filename` (`string`) - 可选的文件名
- `options` (`ExportOptions`) - 可选的导出选项

**示例:**
```typescript
// 使用默认文件名
cropper.downloadCroppedImage()

// 指定文件名和选项
cropper.downloadCroppedImage('my-image.jpg', {
  type: 'image/jpeg',
  quality: 0.9
})
```

## 配置方法

### `updateConfig(config)`

更新裁剪器配置。

**参数:**
- `config` (`Partial<CropperConfig>`) - 部分配置对象

**示例:**
```typescript
cropper.updateConfig({
  theme: 'dark',
  aspectRatio: 1,
  showGrid: false
})
```

### `getConfig()`

获取当前配置。

**返回值:** `CropperConfig`

**示例:**
```typescript
const config = cropper.getConfig()
console.log('当前主题:', config.theme)
```

### `setTheme(theme)`

设置主题。

**参数:**
- `theme` (`'light' | 'dark' | 'high-contrast' | 'auto'`) - 主题名称

**示例:**
```typescript
cropper.setTheme('dark')
```

### `getTheme()`

获取当前主题。

**返回值:** `string`

## 事件方法

### `on(event, listener)`

添加事件监听器。

**参数:**
- `event` (`string`) - 事件名称
- `listener` (`Function`) - 监听器函数

**示例:**
```typescript
cropper.on('cropChange', (event) => {
  console.log('裁剪变化:', event.detail)
})
```

### `off(event, listener?)`

移除事件监听器。

**参数:**
- `event` (`string`) - 事件名称
- `listener` (`Function`) - 可选的监听器函数

**示例:**
```typescript
// 移除特定监听器
cropper.off('cropChange', myListener)

// 移除所有监听器
cropper.off('cropChange')
```

### `emit(event, data?)`

触发事件。

**参数:**
- `event` (`string`) - 事件名称
- `data` (`any`) - 可选的事件数据

**示例:**
```typescript
cropper.emit('customEvent', { message: 'Hello' })
```

## 状态方法

### `isReady()`

检查裁剪器是否准备就绪。

**返回值:** `boolean`

### `isSupported()`

检查浏览器是否支持裁剪器功能。

**返回值:** `boolean`

### `getSupportedFeatures()`

获取支持的功能列表。

**返回值:** `SupportedFeatures`

**示例:**
```typescript
const features = cropper.getSupportedFeatures()
console.log('支持WebGL:', features.webgl)
console.log('支持触摸:', features.touch)
```

### `getSupportedExportFormats()`

获取支持的导出格式。

**返回值:** `string[]`

**示例:**
```typescript
const formats = cropper.getSupportedExportFormats()
console.log('支持的格式:', formats)
// ['image/jpeg', 'image/png', 'image/webp']
```

## 工具方法

### `getElement()`

获取裁剪器的DOM元素。

**返回值:** `HTMLElement`

### `getCanvas()`

获取内部Canvas元素。

**返回值:** `HTMLCanvasElement`

### `getContext()`

获取Canvas的2D上下文。

**返回值:** `CanvasRenderingContext2D`

### `refresh()`

刷新裁剪器显示。

**示例:**
```typescript
cropper.refresh()
```

### `resize()`

调整裁剪器大小以适应容器。

**示例:**
```typescript
// 当容器大小改变时调用
window.addEventListener('resize', () => {
  cropper.resize()
})
```

### `reset()`

重置裁剪器到初始状态。

**示例:**
```typescript
cropper.reset()
```

### `destroy()`

销毁裁剪器实例，清理资源。

**示例:**
```typescript
cropper.destroy()
```

## 静态方法

### `Cropper.isSupported()`

检查浏览器是否支持裁剪器功能。

**返回值:** `boolean`

**示例:**
```typescript
if (Cropper.isSupported()) {
  const cropper = new Cropper('#container')
} else {
  console.log('浏览器不支持裁剪器功能')
}
```

### `Cropper.getSupportedFormats()`

获取支持的图片格式。

**返回值:** `string[]`

**示例:**
```typescript
const formats = Cropper.getSupportedFormats()
console.log('支持的格式:', formats)
```
