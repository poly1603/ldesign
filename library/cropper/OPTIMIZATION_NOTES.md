# 裁剪框初始化优化

## 优化内容

### 1. 默认显示正方形裁剪框
- 修改了 `initialAspectRatio` 默认值为 `1`（正方形）
- 之前默认值为 `NaN`，现在默认为正方形比例

### 2. 裁剪框自动居中（相对于图片）
- ✅ 修复了裁剪框相对于图片的居中问题
- 裁剪框现在正确地居中于图片，而不是容器
- 通过 `getDisplayRect()` 方法获取图片的实际位置和大小

### 3. 可配置的初始大小
- 新增 `initialCropBoxSize` 选项（默认值：0.5）
- 可以精确控制初始裁剪框大小（相对于图片较小尺寸的比例）
- 保留 `autoCropArea` 选项以保持向后兼容性

### 4. 改进图片显示模式
- 将图片显示从 `cover` 模式改为 `contain` 模式
- 确保整张图片都能在容器内完全显示
- 避免图片被裁切的问题

### 5. 移除CSS硬编码位置
- 删除了CSS中的硬编码初始位置（`top: 20%; left: 20%;`）
- 完全由JavaScript控制裁剪框的初始位置和大小
- 提供更精确的控制

## 关键代码修改

### Cropper.ts - 默认配置
```typescript
const DEFAULTS = {
  // ...
  initialAspectRatio: 1,      // 默认为正方形
  initialCropBoxSize: 0.5,    // 默认裁剪框为图片较小尺寸的50%
  autoCropArea: 0.8,          // 已废弃，推荐使用 initialCropBoxSize
  // ...
}
```

### Cropper.ts - initCropBox方法
```typescript
private initCropBox(): void {
  // ...
  if (this.options.autoCrop) {
    const area = this.options.autoCropArea || 0.6
    const aspectRatio = this.options.aspectRatio || this.options.initialAspectRatio || 1
    
    // 对于正方形，使用较小的尺寸
    if (aspectRatio === 1) {
      const minDimension = Math.min(imageData.width, imageData.height)
      width = minDimension * area
      height = width
    }
    // ... 其他比例的处理
    
    // 居中裁剪框
    this.cropBox.setData({
      left: (imageData.width - width) / 2,
      top: (imageData.height - height) / 2,
      width,
      height
    })
  }
}
```

### ImageProcessor.ts - 图片显示模式
```typescript
// 使用contain模式确保整张图片可见
if (imageAspect > containerAspect) {
  // 图片较宽 - 适配宽度
  displayWidth = containerWidth
  displayHeight = containerWidth / imageAspect
} else {
  // 图片较高 - 适配高度
  displayHeight = containerHeight
  displayWidth = containerHeight * imageAspect
}
```

## 使用示例

### 默认配置（正方形）
```javascript
const cropper = new Cropper('container', {
  src: 'image.jpg'
  // 默认显示居中的正方形裁剪框，大小为图片较小尺寸的50%
});
```

### 自定义初始大小
```javascript
const cropper = new Cropper('container', {
  src: 'image.jpg',
  initialCropBoxSize: 0.3  // 裁剪框大小为图片较小尺寸的30%
});
```

### 自定义宽高比和大小
```javascript
const cropper = new Cropper('container', {
  src: 'image.jpg',
  aspectRatio: 16/9,         // 16:9 比例
  initialCropBoxSize: 0.7    // 占 70% 的大小
});
```

### 禁用初始宽高比
```javascript
const cropper = new Cropper('container', {
  src: 'image.jpg',
  initialAspectRatio: NaN,   // 不限制比例
  aspectRatio: NaN,          // 自由调整
  initialCropBoxSize: 0.6    // 裁剪框大小为60%
});
```

## 测试
运行 `test-square-crop.html` 文件可以查看优化效果：
1. 打开文件后会自动加载一张默认图片
2. 裁剪框会自动显示为居中的正方形
3. 可以调整大小、位置，或上传新图片测试

## 优势
1. ✨ 更好的初始用户体验
2. 📐 默认正方形适合大多数场景（头像、缩略图等）
3. 🎯 自动居中，无需手动调整
4. 👁️ 图片完整显示，不会被裁切
5. 🔧 更灵活的JavaScript控制