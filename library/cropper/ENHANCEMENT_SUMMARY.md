# 图片裁剪插件增强功能总结

## 概述

本次更新参照 CropperJS v2 playground 的功能特性，对图片裁剪插件进行了全面的增强和优化，新增了多项高级变换功能和视觉改进。

## 新增功能

### 1. 高级变换功能

#### Skew（倾斜）变换
- 新增 `skewX` 和 `skewY` 方法
- 支持独立控制水平和垂直倾斜
- 可通过工具栏按钮进行倾斜调整

```typescript
cropper.skew(10, 5)  // 水平倾斜10度，垂直倾斜5度
cropper.skewX(10)    // 仅水平倾斜
cropper.skewY(5)     // 仅垂直倾斜
```

#### Translate（平移）功能
- 新增 `translate(x, y)` 方法实现图片平移
- 新增 `move(deltaX, deltaY)` 方法实现相对移动
- 支持键盘方向键操作（通过工具栏）

```typescript
cropper.translate(50, 30)   // 平移到指定位置
cropper.move(10, -10)       // 相对移动
```

### 2. 配置选项增强

#### 主题颜色（Theme Color）
- 新增 `themeColor` 配置选项
- 支持自定义裁剪框、手柄等UI元素颜色
- 通过 CSS 变量 `--cropper-theme-color` 实现
- 支持实时切换

```typescript
const cropper = new Cropper(element, {
  themeColor: '#39f'  // 默认蓝色
})
```

#### 缩放步进（Scale Step）
- 新增 `scaleStep` 配置选项
- 控制缩放时的增量大小
- 默认值为 0.1

```typescript
const cropper = new Cropper(element, {
  scaleStep: 0.1  // 每次缩放10%
})
```

#### 可选功能开关
- 新增 `skewable` 选项：启用/禁用倾斜功能
- 新增 `translatable` 选项：启用/禁用平移功能

### 3. 视觉样式增强

#### 透明背景网格
- 增强的棋盘格背景（Checkerboard Pattern）
- 使用 CSS 渐变实现，更清晰美观
- 20x20px 网格大小，灰白配色

#### 裁剪框样式改进
- **边框**: 2px 实线，使用主题颜色
- **手柄**:
  - 8px 圆形手柄，带白色边框
  - 添加阴影效果增强立体感
  - 鼠标悬停时缩放至 1.3倍
  - 支持移动端触摸（14px 加大尺寸）
- **指示线**:
  - 使用 RGBA 半透明白色
  - 改进九宫格辅助线
  - 更清晰的中心十字线

#### 交互反馈
- 手柄和边缘添加悬停效果
- 平滑的过渡动画（0.2s）
- 拖动时的视觉反馈

### 4. UI 组件

#### 工具栏组件（CropperToolbar.vue）
完整的操作工具栏，包含以下功能组：

**变换组**
- 左旋转 90°
- 右旋转 90°

**翻转组**
- 水平翻转
- 垂直翻转

**缩放组**
- 放大
- 缩小

**移动组**
- 上下左右四个方向移动

**高级控制组（可选显示）**
- X轴倾斜（左/右）
- Y轴倾斜（上/下）

**操作组**
- 重置所有变换
- 获取裁剪图片

#### 预览组件（CropperPreview.vue）
- 实时预览裁剪结果
- 支持自定义预览尺寸
- 透明背景网格显示

### 5. 数据增强

#### 完整的图片数据
现在 `getData()` 方法返回完整的变换数据：

```typescript
interface CropData {
  x: number           // 裁剪框X坐标
  y: number           // 裁剪框Y坐标
  width: number       // 裁剪框宽度
  height: number      // 裁剪框高度
  rotate: number      // 旋转角度
  scaleX: number      // X轴缩放
  scaleY: number      // Y轴缩放
  skewX: number       // X轴倾斜（新增）
  skewY: number       // Y轴倾斜（新增）
  translateX: number  // X轴平移（新增）
  translateY: number  // Y轴平移（新增）
}
```

## 样式文件改进

### CSS 变量支持
```css
:root {
  --cropper-theme-color: #39f;           /* ��题色 */
  --cropper-guide-color: rgba(255, 255, 255, 0.4);  /* 辅助线颜色 */
  --cropper-point-size: 8px;             /* 手柄大小 */
  --cropper-line-width: 2px;             /* 线条宽度 */
}
```

### 响应式设计
- 移动端优化（< 768px）
- 手柄尺寸自动调整
- 触摸友好的交互区域

### 新增样式类
- `.cropper-toolbar`: 工具栏容器
- `.cropper-toolbar-button`: 工具栏按钮
- `.cropper-preview`: 预览容器
- `.cropper-info`: 信息面板

## Demo 更新

### 全新的演示界面
参考 CropperJS playground 设计，提供：

1. **左侧主区域**
   - 大型裁剪画布
   - 工具栏控制
   - 配置面板

2. **右侧侧边栏**
   - 实时预览
   - 详细的图片数据显示
   - 下载按钮

3. **配置面板**
   - 宽高比选择
   - 视图模式
   - 拖动模式
   - 主题颜色选择器
   - 缩放步进调整
   - 高级功能开关

### 美观的UI设计
- 渐变色背景
- 卡片式布局
- 现代化的按钮样式
- 平滑的动画效果

## 使用示例

### Vue 3
```vue
<template>
  <div>
    <VueCropper
      :src="imageSrc"
      :aspect-ratio="16/9"
      :theme-color="#39f"
      :scale-step="0.1"
      :skewable="true"
      :translatable="true"
      @crop="onCrop"
    />
  </div>
</template>

<script setup>
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'

const onCrop = (e) => {
  console.log('Crop data:', e.detail)
}
</script>
```

### React
```tsx
import { ReactCropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'

function App() {
  const cropperRef = useRef()

  const handleCrop = (e) => {
    console.log('Crop data:', e.detail)
  }

  return (
    <ReactCropper
      ref={cropperRef}
      src={imageSrc}
      aspectRatio={16/9}
      themeColor="#39f"
      scaleStep={0.1}
      skewable
      translatable
      onCrop={handleCrop}
    />
  )
}
```

### Angular
```typescript
<ldesign-cropper
  [src]="imageSrc"
  [aspectRatio]="16/9"
  [themeColor]="'#39f'"
  [scaleStep]="0.1"
  [skewable]="true"
  [translatable]="true"
  (crop)="onCrop($event)"
></ldesign-cropper>
```

## API 新增方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `skew(x, y?)` | `x: number, y?: number` | 倾斜图片 |
| `skewX(x)` | `x: number` | X轴倾斜 |
| `skewY(y)` | `y: number` | Y轴倾斜 |
| `translate(x, y)` | `x: number, y: number` | 平移图片到指定位置 |
| `move(deltaX, deltaY)` | `deltaX: number, deltaY: number` | 相对移动图片 |

## 兼容性

- ✅ Vue 3.x
- ✅ React 16.8+ / 17.x / 18.x
- ✅ Angular 15+ / 16+ / 17+
- ✅ 原生 JavaScript/TypeScript
- ✅ 现代浏览器（Chrome, Firefox, Safari, Edge）
- ✅ 移动端浏览器（iOS Safari, Android Chrome）

## 性能优化

- CSS 变量实现主题色，避免重新渲染
- 使用 CSS Transform 进行变换，GPU 加速
- 平滑的过渡动画（transform, opacity）
- 响应式设计，自动适配不同屏幕

## 构建信息

```
dist/style.css    6.53 kB │ gzip: 1.57 kB
dist/index.js    35.43 kB │ gzip: 8.47 kB
dist/vue.js       4.42 kB │ gzip: 1.06 kB
dist/react.js     2.94 kB │ gzip: 0.84 kB
dist/angular.js   8.97 kB │ gzip: 2.99 kB
```

## 总结

本次更新全面提升了图片裁剪插件的功能性和易用性，新增的倾斜、平移等高级变换功能，配合改进的视觉效果和完整的工具栏，使得插件的功能已经���到甚至超越 CropperJS v2 的水平。同时保持了良好的性能和跨框架兼容性。
