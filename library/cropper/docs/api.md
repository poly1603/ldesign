# Cropper API 文档

## 概述

Cropper 是一个功能强大的图片裁剪库，支持多种裁剪形状、图片变换和导出格式。

## 安装

```bash
npm install @ldesign/cropper
```

## 基本用法

```typescript
import { Cropper } from '@ldesign/cropper';

// 创建裁剪器实例
const container = document.getElementById('cropper-container');
const cropper = new Cropper(container, {
  aspectRatio: 16 / 9,
  cropShape: 'rectangle',
  showGrid: true
});

// 加载图片
await cropper.loadImage('path/to/image.jpg');

// 获取裁剪结果
const croppedCanvas = cropper.getCroppedCanvas();
const croppedBlob = await cropper.getCroppedBlob();
```

## 构造函数

### `new Cropper(container, config?)`

创建一个新的 Cropper 实例。

**参数：**
- `container: HTMLElement` - 容器元素
- `config?: CropperConfig` - 可选的配置对象

**示例：**
```typescript
const cropper = new Cropper(document.getElementById('container'), {
  aspectRatio: 1,
  cropShape: 'circle',
  minCropSize: { width: 100, height: 100 }
});
```

## 配置选项 (CropperConfig)

### 基本配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `aspectRatio` | `number \| null` | `null` | 裁剪区域的宽高比，null 表示自由比例 |
| `cropShape` | `'rectangle' \| 'circle' \| 'ellipse'` | `'rectangle'` | 裁剪形状 |
| `initialCropSize` | `{ width: number; height: number } \| null` | `null` | 初始裁剪区域大小 |
| `minCropSize` | `{ width: number; height: number }` | `{ width: 50, height: 50 }` | 最小裁剪区域大小 |
| `maxCropSize` | `{ width: number; height: number } \| null` | `null` | 最大裁剪区域大小 |

### 显示配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `showGrid` | `boolean` | `true` | 是否显示网格线 |
| `showCropArea` | `boolean` | `true` | 是否显示裁剪区域边框 |
| `showControlPoints` | `boolean` | `true` | 是否显示控制点 |
| `showMask` | `boolean` | `true` | 是否显示遮罩 |
| `showInfo` | `boolean` | `false` | 是否显示裁剪信息 |

### 交互配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `draggable` | `boolean` | `true` | 是否允许拖拽裁剪区域 |
| `resizable` | `boolean` | `true` | 是否允许调整裁剪区域大小 |
| `rotatable` | `boolean` | `true` | 是否允许旋转图片 |
| `scalable` | `boolean` | `true` | 是否允许缩放图片 |
| `zoomable` | `boolean` | `true` | 是否允许缩放 |

### 样式配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `cropAreaColor` | `string` | `'#007bff'` | 裁剪区域边框颜色 |
| `cropAreaLineWidth` | `number` | `2` | 裁剪区域边框宽度 |
| `maskColor` | `string` | `'rgba(0, 0, 0, 0.5)'` | 遮罩颜色 |
| `gridColor` | `string` | `'rgba(255, 255, 255, 0.3)'` | 网格线颜色 |
| `controlPointColor` | `string` | `'#007bff'` | 控制点颜色 |
| `controlPointSize` | `number` | `8` | 控制点大小 |

### 限制配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `maxFileSize` | `number` | `10 * 1024 * 1024` | 最大文件大小（字节） |
| `supportedFormats` | `string[]` | `['image/jpeg', 'image/png', 'image/webp']` | 支持的图片格式 |
| `maxImageSize` | `{ width: number; height: number }` | `{ width: 4096, height: 4096 }` | 最大图片尺寸 |

## 实例方法

### 图片加载

#### `loadImage(source)`

加载图片到裁剪器中。

**参数：**
- `source: string | File | HTMLImageElement` - 图片源

**返回值：** `Promise<void>`

**示例：**
```typescript
// 从URL加载
await cropper.loadImage('https://example.com/image.jpg');

// 从文件加载
const file = event.target.files[0];
await cropper.loadImage(file);

// 从Image元素加载
const img = document.querySelector('img');
await cropper.loadImage(img);
```

#### `hasImage()`

检查是否已加载图片。

**返回值：** `boolean`

#### `getImageInfo()`

获取当前图片信息。

**返回值：** `{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null`

### 裁剪区域管理

#### `setCropData(data)`

设置裁剪区域数据。

**参数：**
- `data: CropData` - 裁剪数据

**CropData 接口：**
```typescript
interface CropData {
  x: number;        // X坐标
  y: number;        // Y坐标
  width: number;    // 宽度
  height: number;   // 高度
  shape: 'rectangle' | 'circle' | 'ellipse'; // 形状
}
```

**示例：**
```typescript
cropper.setCropData({
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  shape: 'rectangle'
});
```

#### `getCropData()`

获取当前裁剪区域数据。

**返回值：** `CropData | null`

### 图片变换

#### `setScale(scale)`

设置图片缩放比例。

**参数：**
- `scale: number` - 缩放比例（大于0）

#### `getScale()`

获取当前缩放比例。

**返回值：** `number`

#### `setRotation(angle)`

设置图片旋转角度。

**参数：**
- `angle: number` - 旋转角度（度）

#### `getRotation()`

获取当前旋转角度。

**返回值：** `number`

#### `setFlip(flipX, flipY)`

设置图片翻转状态。

**参数：**
- `flipX: boolean` - 水平翻转
- `flipY: boolean` - 垂直翻转

#### `getFlip()`

获取当前翻转状态。

**返回值：** `{ flipX: boolean; flipY: boolean }`

#### `reset()`

重置所有变换到初始状态。

### 导出功能

#### `getCroppedCanvas(options?)`

获取裁剪后的 Canvas 元素。

**参数：**
- `options?: ExportOptions` - 导出选项

**ExportOptions 接口：**
```typescript
interface ExportOptions {
  width?: number;           // 输出宽度
  height?: number;          // 输出高度
  quality?: number;         // 图片质量 (0-1)
  fillColor?: string;       // 背景填充颜色
  imageSmoothingEnabled?: boolean; // 是否启用图片平滑
  imageSmoothingQuality?: 'low' | 'medium' | 'high'; // 平滑质量
}
```

**返回值：** `HTMLCanvasElement | null`

**示例：**
```typescript
const canvas = cropper.getCroppedCanvas({
  width: 400,
  height: 300,
  quality: 0.9
});
```

#### `getCroppedBlob(options?)`

获取裁剪后的 Blob 对象。

**参数：**
- `options?: BlobOptions` - Blob 选项

**BlobOptions 接口：**
```typescript
interface BlobOptions extends ExportOptions {
  type?: string;    // MIME 类型，如 'image/jpeg'
}
```

**返回值：** `Promise<Blob | null>`

**示例：**
```typescript
const blob = await cropper.getCroppedBlob({
  type: 'image/jpeg',
  quality: 0.8
});
```

#### `getCroppedDataURL(options?)`

获取裁剪后的 Data URL。

**参数：**
- `options?: BlobOptions` - 选项

**返回值：** `string | null`

### 配置管理

#### `getConfig()`

获取当前配置。

**返回值：** `CropperConfig`

#### `updateConfig(config)`

更新配置。

**参数：**
- `config: Partial<CropperConfig>` - 部分配置对象

**示例：**
```typescript
cropper.updateConfig({
  aspectRatio: 1,
  showGrid: false,
  cropAreaColor: '#ff0000'
});
```

### 事件系统

#### `on(event, handler)`

添加事件监听器。

**参数：**
- `event: string` - 事件名称
- `handler: Function` - 事件处理函数

#### `off(event, handler?)`

移除事件监听器。

**参数：**
- `event: string` - 事件名称
- `handler?: Function` - 可选的事件处理函数

#### `emit(event, ...args)`

触发事件。

**参数：**
- `event: string` - 事件名称
- `...args: any[]` - 事件参数

### 实用方法

#### `destroy()`

销毁裁剪器实例，清理资源。

#### `checkSupport()`

检查浏览器支持情况。

**返回值：** `{ canvas: boolean; fileReader: boolean; blob: boolean }`

## 事件

### `IMAGE_LOADED`

图片加载完成时触发。

**回调参数：**
- `imageInfo: { width: number; height: number; naturalWidth: number; naturalHeight: number }`

**示例：**
```typescript
cropper.on('IMAGE_LOADED', (imageInfo) => {
  console.log('图片已加载:', imageInfo);
});
```

### `CROP_CHANGE`

裁剪区域改变时触发。

**回调参数：**
- `cropData: CropData`

**示例：**
```typescript
cropper.on('CROP_CHANGE', (cropData) => {
  console.log('裁剪区域已改变:', cropData);
});
```

### `SCALE_CHANGE`

缩放比例改变时触发。

**回调参数：**
- `scale: number`

### `ROTATION_CHANGE`

旋转角度改变时触发。

**回调参数：**
- `rotation: number`

### `FLIP_CHANGE`

翻转状态改变时触发。

**回调参数：**
- `flip: { flipX: boolean; flipY: boolean }`

### `RENDER`

渲染完成时触发。

### `ERROR`

发生错误时触发。

**回调参数：**
- `error: Error`

## 静态方法

### `Cropper.checkSupport()`

检查浏览器支持情况。

**返回值：** `{ canvas: boolean; fileReader: boolean; blob: boolean }`

## 类型定义

### CropperConfig

完整的配置接口定义。

### CropData

裁剪数据接口定义。

### ExportOptions

导出选项接口定义。

### BlobOptions

Blob 选项接口定义。

## 最佳实践

### 1. 错误处理

```typescript
try {
  await cropper.loadImage(file);
} catch (error) {
  console.error('图片加载失败:', error);
}

cropper.on('ERROR', (error) => {
  console.error('裁剪器错误:', error);
});
```

### 2. 性能优化

```typescript
// 使用防抖处理频繁的裁剪变化
import { debounce } from 'lodash';

const handleCropChange = debounce((cropData) => {
  // 处理裁剪变化
}, 100);

cropper.on('CROP_CHANGE', handleCropChange);
```

### 3. 响应式设计

```typescript
// 监听窗口大小变化
window.addEventListener('resize', () => {
  cropper.updateCanvasSize();
});
```

### 4. 内存管理

```typescript
// 组件销毁时清理资源
componentWillUnmount() {
  cropper.destroy();
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License