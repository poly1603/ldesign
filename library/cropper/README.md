# @ldesign/cropper

一个功能强大、易于使用的现代图片裁剪库，支持多种裁剪形状、图片变换和导出格式。

[![npm version](https://badge.fury.io/js/@ldesign%2Fcropper.svg)](https://badge.fury.io/js/@ldesign%2Fcropper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ 特性

### 🎯 核心功能
- **多种裁剪形状**：矩形、圆形、椭圆、多边形、自定义路径
- **灵活比例控制**：自由比例、预设比例（1:1、4:3、16:9等）、自定义比例
- **丰富的变换操作**：旋转、缩放、翻转、平移
- **实时预览**：所见即所得的裁剪体验

### 🎨 图像处理
- **色彩调节**：亮度、对比度、饱和度、色相调整
- **滤镜效果**：灰度、棕褐色、复古、暖色调、冷色调等
- **几何变换**：透视变换、阴影效果、边框装饰
- **特效装饰**：水印、背景、拼贴等

### 🖱️ 交互体验
- **多平台支持**：鼠标、触摸、键盘操作
- **手势识别**：双指缩放、旋转手势
- **键盘快捷键**：提高操作效率
- **响应式设计**：适配各种屏幕尺寸

### 🚀 性能优化
- **内存管理**：智能缓存和自动清理
- **性能监控**：实时监控帧率、内存使用
- **硬件加速**：利用 GPU 加速渲染
- **大图优化**：分块处理和渐进加载

### 🔧 框架集成
- **Vue 3 组件**：开箱即用的 Vue 组件
- **Composition API**：Vue 3 Hook 支持
- **Vue 指令**：简单的指令式使用
- **框架无关**：核心逻辑与框架解耦

## 📦 安装

```bash
npm install @ldesign/cropper
# 或
yarn add @ldesign/cropper
# 或
pnpm add @ldesign/cropper
```

## 🔧 基础使用

### 原生 JavaScript

```javascript
import { Cropper } from '@ldesign/cropper';

const container = document.getElementById('cropper-container');
const cropper = new Cropper(container, {
  theme: 'light',
  aspectRatio: 16/9,
  showGrid: true
});

// 设置图片
await cropper.setImageSource('/path/to/image.jpg');

// 监听事件
cropper.on('cropChange', (data) => {
  console.log('裁剪区域变化:', data.cropData);
});

// 导出图片
const result = await cropper.export({
  format: 'png',
  quality: 0.9
});
```

### Vue 3 组件

```vue
<template>
  <ImageCropper
    :src="imageSrc"
    :aspect-ratio="16/9"
    theme="light"
    show-toolbar
    @crop-change="handleCropChange"
    @export="handleExport"
  />
</template>

<script setup>
import { ImageCropper } from '@ldesign/cropper';

const imageSrc = ref('/path/to/image.jpg');

const handleCropChange = (data) => {
  console.log('裁剪变化:', data);
};

const handleExport = (result) => {
  console.log('导出结果:', result);
};
</script>
```

### Vue 3 Composition API

```javascript
import { useCropper } from '@ldesign/cropper';

const {
  containerRef,
  cropData,
  loading,
  setImageSource,
  exportImage,
  rotate,
  scale
} = useCropper({
  aspectRatio: 16/9,
  onCropChange: (data) => {
    console.log('裁剪变化:', data);
  }
});
```

### Vue 3 指令

```vue
<template>
  <div v-cropper="cropperOptions"></div>
</template>

<script setup>
const cropperOptions = {
  src: '/path/to/image.jpg',
  config: {
    aspectRatio: 16/9,
    theme: 'dark'
  },
  onCropChange: (cropper, data) => {
    console.log('裁剪变化:', data);
  }
};
</script>
```

## 🎛️ 配置选项

```typescript
interface CropperConfig {
  // 主题设置
  theme: 'light' | 'dark' | 'auto';

  // 响应式设计
  responsive: boolean;

  // 裁剪设置
  aspectRatio: AspectRatio;
  minCropSize: Size;
  maxCropSize: Size;
  cropShape: CropShape;

  // 显示设置
  showGrid: boolean;
  gridLines: number;

  // 工具栏配置
  toolbar: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    tools: string[];
  };

  // 键盘快捷键
  keyboard: {
    enabled: boolean;
    shortcuts: Record<string, string>;
  };

  // 触摸支持
  touch: {
    enabled: boolean;
    pinchToZoom: boolean;
    doubleTapToFit: boolean;
  };

  // 动画效果
  animation: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}
```

## 🎨 主题定制

```css
:root {
  --cropper-primary-color: #1890ff;
  --cropper-background-color: #ffffff;
  --cropper-border-color: #d9d9d9;
  --cropper-text-color: #333333;
  --cropper-shadow-color: rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] {
  --cropper-primary-color: #177ddc;
  --cropper-background-color: #1f1f1f;
  --cropper-border-color: #434343;
  --cropper-text-color: #ffffff;
  --cropper-shadow-color: rgba(255, 255, 255, 0.15);
}
```

## 📚 API 文档

### 核心方法

- `setImageSource(src)` - 设置图片源
- `getCropData()` - 获取裁剪数据
- `setCropArea(area)` - 设置裁剪区域
- `setAspectRatio(ratio)` - 设置宽高比
- `rotate(angle)` - 旋转图片
- `scale(factor)` - 缩放图片
- `flip(horizontal, vertical)` - 翻转图片
- `export(options)` - 导出图片
- `reset()` - 重置状态
- `destroy()` - 销毁实例

### 事件系统

- `ready` - 裁剪器就绪
- `imageLoad` - 图片加载完成
- `imageError` - 图片加载失败
- `cropStart` - 开始裁剪
- `cropMove` - 裁剪中
- `cropEnd` - 裁剪结束
- `cropChange` - 裁剪区域变化

## 🔧 高级功能

### 形状裁剪

```javascript
// 圆形裁剪
cropper.setShape('circle');

// 多边形裁剪
cropper.setShape('polygon', { sides: 6 });

// 自定义路径
cropper.setShape('custom', {
  path: 'M10,10 L90,10 L90,90 L10,90 Z'
});
```

### 图像特效

```javascript
import { EffectsProcessor } from '@ldesign/cropper';

const effects = new EffectsProcessor();
effects.setSourceImage(image);

// 添加边框
effects.addBorder({
  width: 10,
  color: '#ff0000',
  style: 'solid'
});

// 添加水印
effects.addWatermark({
  type: 'text',
  content: '版权所有',
  position: 'bottom-right',
  opacity: 0.7
});
```

### 性能监控

```javascript
import { PerformanceMonitor } from '@ldesign/cropper';

const monitor = new PerformanceMonitor();
monitor.startMonitoring();

// 获取性能报告
const report = monitor.getPerformanceReport();
console.log('性能指标:', report.metrics);
console.log('优化建议:', report.recommendations);
```

## 🌐 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 📱 响应式设计

裁剪器完全响应式，支持：
- **桌面端** - 完整功能界面
- **平板端** - 优化的触摸控制
- **移动端** - 精简的小屏界面

## ⌨️ 键盘快捷键

- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Y` - 重做
- `Ctrl/Cmd + S` - 快速保存
- `Ctrl/Cmd + E` - 导出选项
- `Delete` - 清除选区
- `Escape` - 取消操作

## 🎯 导出预设

### 社交媒体
- Instagram 方形 (1080×1080)
- Instagram 故事 (1080×1920)
- Facebook 帖子 (1200×630)
- Twitter 帖子 (1200×675)

### 打印
- 4×6 照片 (1800×1200)
- 8×10 照片 (3000×2400)

### 网页
- 大尺寸 (1920×1080 max)
- 中等尺寸 (1200×800 max)
- 缩略图 (400×300 max)

## 🛠️ 开发

### 从源码构建

```bash
git clone https://github.com/ldesign/cropper.git
cd cropper/packages/cropper
npm install
npm run build
```

### 运行测试

```bash
npm test
npm run test:coverage
```

### 开发服务器

```bash
npm run dev
```

## 🤝 贡献

欢迎贡献代码！请阅读我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 🗺️ 路线图

### v1.1 (即将发布)
- [ ] React 集成支持
- [ ] Angular 集成支持
- [ ] WebGL 滤镜加速
- [ ] 视频裁剪支持

### v1.2
- [ ] AI 智能裁剪建议
- [ ] 背景移除功能
- [ ] 协作编辑
- [ ] 插件系统

## 📄 许可证

MIT License © 2024 LDesign Team

## 🤝 支持

如有问题，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/ldesign/cropper/issues)
- 邮箱: support@ldesign.com
- 文档: [在线文档](https://cropper.ldesign.com)

---

Made with ❤️ by LDesign Team
