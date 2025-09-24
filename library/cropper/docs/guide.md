# Cropper 使用指南

## 目录

1. [快速开始](#快速开始)
2. [基本概念](#基本概念)
3. [配置选项详解](#配置选项详解)
4. [常用场景](#常用场景)
5. [高级功能](#高级功能)
6. [样式定制](#样式定制)
7. [事件处理](#事件处理)
8. [性能优化](#性能优化)
9. [故障排除](#故障排除)

## 快速开始

### 安装

```bash
npm install @ldesign/cropper
```

### 基本使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>Cropper 示例</title>
  <style>
    #cropper-container {
      width: 800px;
      height: 600px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div id="cropper-container"></div>
  <input type="file" id="image-input" accept="image/*">
  <button id="export-btn">导出图片</button>

  <script type="module">
    import { Cropper } from '@ldesign/cropper';

    const container = document.getElementById('cropper-container');
    const imageInput = document.getElementById('image-input');
    const exportBtn = document.getElementById('export-btn');

    // 创建裁剪器实例
    const cropper = new Cropper(container, {
      aspectRatio: 16 / 9,
      showGrid: true,
      cropShape: 'rectangle'
    });

    // 处理图片上传
    imageInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          await cropper.loadImage(file);
        } catch (error) {
          alert('图片加载失败: ' + error.message);
        }
      }
    });

    // 导出图片
    exportBtn.addEventListener('click', async () => {
      const blob = await cropper.getCroppedBlob({
        type: 'image/jpeg',
        quality: 0.9
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cropped-image.jpg';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  </script>
</body>
</html>
```

## 基本概念

### 1. 容器元素

裁剪器需要一个 HTML 容器元素来渲染界面：

```javascript
const container = document.getElementById('my-container');
const cropper = new Cropper(container);
```

容器应该有明确的宽高：

```css
#my-container {
  width: 800px;
  height: 600px;
  position: relative; /* 推荐 */
}
```

### 2. 裁剪区域

裁剪区域是用户可以调整的选择框，支持三种形状：
- `rectangle`: 矩形（默认）
- `circle`: 圆形
- `ellipse`: 椭圆形

### 3. 坐标系统

裁剪器使用图片的原始坐标系统：
- 原点 (0, 0) 在图片左上角
- X 轴向右为正
- Y 轴向下为正

## 配置选项详解

### 宽高比控制

```javascript
// 固定宽高比
const cropper = new Cropper(container, {
  aspectRatio: 16 / 9  // 16:9 比例
});

// 正方形
const cropper = new Cropper(container, {
  aspectRatio: 1
});

// 自由比例
const cropper = new Cropper(container, {
  aspectRatio: null
});
```

### 裁剪形状

```javascript
// 矩形裁剪
const cropper = new Cropper(container, {
  cropShape: 'rectangle'
});

// 圆形裁剪（适合头像）
const cropper = new Cropper(container, {
  cropShape: 'circle',
  aspectRatio: 1  // 圆形通常需要 1:1 比例
});

// 椭圆形裁剪
const cropper = new Cropper(container, {
  cropShape: 'ellipse'
});
```

### 尺寸限制

```javascript
const cropper = new Cropper(container, {
  // 最小裁剪尺寸
  minCropSize: { width: 100, height: 100 },
  
  // 最大裁剪尺寸
  maxCropSize: { width: 1000, height: 1000 },
  
  // 初始裁剪尺寸
  initialCropSize: { width: 300, height: 200 }
});
```

### 交互控制

```javascript
const cropper = new Cropper(container, {
  draggable: true,    // 允许拖拽裁剪区域
  resizable: true,    // 允许调整大小
  rotatable: true,    // 允许旋转图片
  scalable: true,     // 允许缩放图片
  zoomable: true      // 允许缩放
});
```

## 常用场景

### 1. 头像裁剪

```javascript
const avatarCropper = new Cropper(container, {
  aspectRatio: 1,           // 正方形
  cropShape: 'circle',      // 圆形裁剪
  minCropSize: { width: 100, height: 100 },
  showGrid: false,          // 隐藏网格
  cropAreaColor: '#007bff'
});

// 导出头像
async function exportAvatar() {
  const blob = await avatarCropper.getCroppedBlob({
    type: 'image/png',
    width: 200,
    height: 200
  });
  return blob;
}
```

### 2. 横幅图片裁剪

```javascript
const bannerCropper = new Cropper(container, {
  aspectRatio: 16 / 9,      // 横幅比例
  cropShape: 'rectangle',
  showGrid: true,
  gridColor: 'rgba(255, 255, 255, 0.5)'
});
```

### 3. 产品图片裁剪

```javascript
const productCropper = new Cropper(container, {
  aspectRatio: 4 / 3,       // 产品图片常用比例
  cropShape: 'rectangle',
  showMask: true,
  maskColor: 'rgba(0, 0, 0, 0.6)',
  showInfo: true            // 显示尺寸信息
});
```

### 4. 自由裁剪

```javascript
const freeCropper = new Cropper(container, {
  aspectRatio: null,        // 自由比例
  cropShape: 'rectangle',
  minCropSize: { width: 50, height: 50 }
});
```

## 高级功能

### 1. 图片变换

```javascript
// 缩放
cropper.setScale(1.5);  // 放大 1.5 倍
cropper.setScale(0.8);  // 缩小到 0.8 倍

// 旋转
cropper.setRotation(90);   // 顺时针旋转 90 度
cropper.setRotation(-45);  // 逆时针旋转 45 度

// 翻转
cropper.setFlip(true, false);  // 水平翻转
cropper.setFlip(false, true);  // 垂直翻转
cropper.setFlip(true, true);   // 水平和垂直翻转

// 重置所有变换
cropper.reset();
```

### 2. 程序化设置裁剪区域

```javascript
// 设置裁剪区域
cropper.setCropData({
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  shape: 'rectangle'
});

// 获取当前裁剪区域
const cropData = cropper.getCropData();
console.log(cropData);
```

### 3. 多格式导出

```javascript
// 导出为 JPEG
const jpegBlob = await cropper.getCroppedBlob({
  type: 'image/jpeg',
  quality: 0.9
});

// 导出为 PNG
const pngBlob = await cropper.getCroppedBlob({
  type: 'image/png'
});

// 导出为 WebP
const webpBlob = await cropper.getCroppedBlob({
  type: 'image/webp',
  quality: 0.8
});

// 导出为 Data URL
const dataURL = cropper.getCroppedDataURL({
  type: 'image/jpeg',
  quality: 0.9
});
```

### 4. 批量处理

```javascript
async function batchCrop(files, cropConfig) {
  const results = [];
  
  for (const file of files) {
    await cropper.loadImage(file);
    cropper.setCropData(cropConfig);
    
    const blob = await cropper.getCroppedBlob({
      type: 'image/jpeg',
      quality: 0.9
    });
    
    results.push({
      originalFile: file,
      croppedBlob: blob
    });
  }
  
  return results;
}
```

## 样式定制

### 1. CSS 变量

```css
.cropper-container {
  --cropper-crop-area-color: #007bff;
  --cropper-mask-color: rgba(0, 0, 0, 0.5);
  --cropper-grid-color: rgba(255, 255, 255, 0.3);
  --cropper-control-point-color: #007bff;
  --cropper-control-point-size: 8px;
}
```

### 2. 主题切换

```javascript
// 使用内置主题
import { ThemeManager } from '@ldesign/cropper/styles';

const themeManager = new ThemeManager();

// 切换到深色主题
themeManager.setTheme('dark');

// 切换到浅色主题
themeManager.setTheme('light');

// 自动检测系统主题
themeManager.setTheme('auto');
```

### 3. 自定义样式

```css
/* 自定义裁剪区域样式 */
.cropper-crop-area {
  border: 2px dashed #ff6b6b !important;
  border-radius: 8px;
}

/* 自定义控制点样式 */
.cropper-control-point {
  background: #ff6b6b;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 自定义遮罩样式 */
.cropper-mask {
  background: linear-gradient(45deg, 
    rgba(0, 0, 0, 0.3), 
    rgba(0, 0, 0, 0.6)
  );
}
```

## 事件处理

### 1. 基本事件

```javascript
// 图片加载完成
cropper.on('IMAGE_LOADED', (imageInfo) => {
  console.log('图片尺寸:', imageInfo.width, 'x', imageInfo.height);
  console.log('原始尺寸:', imageInfo.naturalWidth, 'x', imageInfo.naturalHeight);
});

// 裁剪区域改变
cropper.on('CROP_CHANGE', (cropData) => {
  console.log('裁剪区域:', cropData);
  updatePreview(cropData);
});

// 缩放改变
cropper.on('SCALE_CHANGE', (scale) => {
  console.log('当前缩放:', scale);
});

// 旋转改变
cropper.on('ROTATION_CHANGE', (rotation) => {
  console.log('当前旋转:', rotation);
});

// 错误处理
cropper.on('ERROR', (error) => {
  console.error('裁剪器错误:', error);
  showErrorMessage(error.message);
});
```

### 2. 实时预览

```javascript
function updatePreview(cropData) {
  const canvas = cropper.getCroppedCanvas({
    width: 200,
    height: 150
  });
  
  if (canvas) {
    const previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = '';
    previewContainer.appendChild(canvas);
  }
}

cropper.on('CROP_CHANGE', updatePreview);
```

### 3. 防抖处理

```javascript
import { debounce } from 'lodash';

// 防抖处理频繁的裁剪变化
const debouncedCropChange = debounce((cropData) => {
  // 执行耗时操作，如实时预览
  updatePreview(cropData);
}, 100);

cropper.on('CROP_CHANGE', debouncedCropChange);
```

## 性能优化

### 1. 图片预处理

```javascript
// 压缩大图片
async function compressImage(file, maxWidth = 2048, maxHeight = 2048) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      
      if (ratio < 1) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      } else {
        resolve(file);
      }
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// 使用压缩后的图片
const compressedFile = await compressImage(originalFile);
await cropper.loadImage(compressedFile);
```

### 2. 延迟加载

```javascript
// 延迟创建裁剪器
let cropper = null;

function initCropper() {
  if (!cropper) {
    cropper = new Cropper(container, config);
  }
  return cropper;
}

// 只在需要时创建
document.getElementById('crop-btn').addEventListener('click', () => {
  const cropperInstance = initCropper();
  // 使用裁剪器...
});
```

### 3. 内存管理

```javascript
// 组件销毁时清理
function cleanup() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

// 在适当的时机调用清理
window.addEventListener('beforeunload', cleanup);
```

## 故障排除

### 1. 常见问题

**问题：图片加载失败**
```javascript
// 检查文件类型
const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!supportedTypes.includes(file.type)) {
  throw new Error('不支持的图片格式');
}

// 检查文件大小
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('文件太大');
}
```

**问题：裁剪区域不显示**
```javascript
// 确保容器有尺寸
const container = document.getElementById('container');
console.log('容器尺寸:', container.offsetWidth, 'x', container.offsetHeight);

// 检查 CSS 样式
const styles = getComputedStyle(container);
console.log('计算样式:', styles.width, styles.height);
```

**问题：导出的图片质量差**
```javascript
// 使用更高的导出尺寸
const canvas = cropper.getCroppedCanvas({
  width: cropData.width * 2,  // 2倍尺寸
  height: cropData.height * 2,
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high'
});
```

### 2. 调试技巧

```javascript
// 启用调试模式
const cropper = new Cropper(container, {
  debug: true  // 显示调试信息
});

// 监听所有事件
const events = ['IMAGE_LOADED', 'CROP_CHANGE', 'SCALE_CHANGE', 'ROTATION_CHANGE', 'ERROR'];
events.forEach(event => {
  cropper.on(event, (...args) => {
    console.log(`事件 ${event}:`, args);
  });
});

// 检查浏览器支持
const support = cropper.checkSupport();
console.log('浏览器支持:', support);
```

### 3. 性能监控

```javascript
// 监控渲染性能
let renderCount = 0;
let renderTime = 0;

cropper.on('RENDER', () => {
  renderCount++;
  const now = performance.now();
  if (renderTime > 0) {
    const fps = 1000 / (now - renderTime);
    console.log(`FPS: ${fps.toFixed(1)}, 渲染次数: ${renderCount}`);
  }
  renderTime = now;
});
```

## 最佳实践

1. **始终处理错误**：使用 try-catch 和错误事件监听
2. **合理设置尺寸限制**：避免过大或过小的裁剪区域
3. **优化大图片**：预先压缩大尺寸图片
4. **使用防抖**：处理频繁的用户交互
5. **及时清理资源**：在组件销毁时调用 destroy()
6. **响应式设计**：监听窗口大小变化
7. **提供用户反馈**：显示加载状态和错误信息

## 更多示例

查看 `examples/` 目录中的完整示例：
- `basic.html` - 基本功能演示
- `advanced.html` - 高级功能演示
- `integration.html` - 项目集成示例

## 支持

如果遇到问题或需要帮助，请：
1. 查看 [API 文档](./api.md)
2. 检查 [常见问题](#故障排除)
3. 提交 Issue 到 GitHub 仓库