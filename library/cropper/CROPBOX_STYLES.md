# 裁剪框样式 (Crop Box Styles)

## 🎨 支持的样式

### 1. Default (默认)
- 标准的蓝色边框
- 带有网格线指引
- 适合大多数使用场景
```javascript
cropBoxStyle: 'default'
```

### 2. Rounded (圆角)
- 带有圆角的裁剪框
- 12px 圆角半径
- 更柔和的视觉效果
```javascript
cropBoxStyle: 'rounded'
```

### 3. Circle (圆形)
- 完全圆形的裁剪框
- 适合头像裁剪
- 建议配合 `aspectRatio: 1` 使用
```javascript
cropBoxStyle: 'circle'
aspectRatio: 1 // 保持正方形
```

### 4. Minimal (极简)
- 简洁的白色边框
- 淡化的背景遮罩
- 低调的视觉风格
```javascript
cropBoxStyle: 'minimal'
```

### 5. Dotted (虚线)
- 点状虚线边框
- 动态边框动画效果
- 活泼的视觉风格
```javascript
cropBoxStyle: 'dotted'
```

### 6. Solid (实心)
- 粗实边框
- 带有发光效果
- 强调的视觉风格
```javascript
cropBoxStyle: 'solid'
```

### 7. Gradient (渐变)
- 渐变色边框
- 从蓝色到紫色渐变
- 现代化的视觉效果
```javascript
cropBoxStyle: 'gradient'
```

## 📝 使用方法

### 初始化时设置样式

```javascript
// Vue 组件中
<VueCropper
  :src="imageSrc"
  :crop-box-style="'rounded'"
  :theme-color="#ff6b6b"
/>
```

```javascript
// JavaScript 中
const cropper = new Cropper('container', {
  cropBoxStyle: 'circle',
  aspectRatio: 1,
  themeColor: '#4caf50'
});
```

### 动态切换样式

```javascript
// 获取 cropper 实例并切换样式
cropper.setCropBoxStyle('gradient');

// Vue 中通过 ref 访问
cropperRef.value.getCropper().setCropBoxStyle('minimal');
```

## 🎯 最佳实践

### 场景匹配

| 使用场景 | 推荐样式 | 配置建议 |
|---------|---------|---------|
| 用户头像 | `circle` | `aspectRatio: 1` |
| 产品图片 | `default` | `aspectRatio: 4/3` |
| Banner图片 | `rounded` | `aspectRatio: 16/9` |
| 艺术作品 | `gradient` | 自由比例 |
| 文档扫描 | `minimal` | 自由比例 |
| 社交媒体 | `solid` | 根据平台要求 |

### 主题颜色搭配

```javascript
// 蓝色主题（默认）
themeColor: '#39f'
cropBoxStyle: 'default'

// 绿色主题
themeColor: '#4caf50'
cropBoxStyle: 'solid'

// 红色主题
themeColor: '#ff5252'
cropBoxStyle: 'rounded'

// 紫色主题
themeColor: '#9c27b0'
cropBoxStyle: 'gradient'

// 暗色主题
themeColor: '#333'
cropBoxStyle: 'minimal'
```

## 🔧 自定义样式

如果预设样式不满足需求，可以通过 CSS 自定义：

```css
/* 自定义裁剪框样式 */
.cropper-crop-box.style-custom .cropper-view-box {
  border: 2px dashed #ff6b6b;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.cropper-crop-box.style-custom .cropper-point {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border: 2px solid #fff;
  width: 10px;
  height: 10px;
}

.cropper-crop-box.style-custom .cropper-dashed {
  border-color: rgba(255, 107, 107, 0.5);
}
```

然后在初始化时使用：
```javascript
cropBoxStyle: 'custom'
```

## 🌈 样式组合示例

### 圆形头像裁剪
```javascript
{
  cropBoxStyle: 'circle',
  aspectRatio: 1,
  viewMode: 1,
  dragMode: 'move',
  minCropBoxWidth: 100,
  minCropBoxHeight: 100
}
```

### 产品图片裁剪
```javascript
{
  cropBoxStyle: 'solid',
  aspectRatio: 4/3,
  viewMode: 2,
  themeColor: '#4caf50',
  guides: true,
  center: true
}
```

### Instagram 风格
```javascript
{
  cropBoxStyle: 'gradient',
  aspectRatio: 1,
  themeColor: '#e1306c',
  background: true,
  modal: true,
  modalOpacity: 0.4
}
```

### 文档扫描
```javascript
{
  cropBoxStyle: 'minimal',
  aspectRatio: NaN, // 自由比例
  viewMode: 0,
  themeColor: '#666',
  guides: false,
  center: false
}
```

## 📱 响应式考虑

不同的样式在不同设备上的表现：

- **Default, Solid**: 在所有设备上都表现良好
- **Circle**: 确保容器有足够空间显示完整圆形
- **Gradient**: 可能在低端设备上有性能影响
- **Minimal**: 在小屏幕上可能不够明显
- **Dotted**: 动画可能影响移动设备电池寿命

## 🎯 性能优化

- 避免频繁切换样式
- 在低端设备上优先使用 `default` 或 `minimal`
- 如果不需要动画效果，使用 `solid` 代替 `dotted`
- 渐变样式 (`gradient`) 可能会略微影响性能