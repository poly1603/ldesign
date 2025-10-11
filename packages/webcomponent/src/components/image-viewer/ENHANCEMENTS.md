# 图片查看器增强功能

## ✨ 新增功能

### 1. 多种打开/关闭动画效果

现在支持6种不同的动画效果，可以独立配置打开和关闭动画：

#### 动画类型
- **fade** - 纯淡入淡出
- **zoom** - 缩放效果
- **fade-zoom** - 淡入+缩放（默认）
- **slide-up** - 从下向上滑入
- **slide-down** - 从上向下滑入
- **none** - 无动画

#### 相关Props

```typescript
/** 打开动画效果 */
openAnimation?: 'fade' | 'zoom' | 'fade-zoom' | 'slide-up' | 'slide-down' | 'none' = 'fade-zoom'

/** 打开动画时长（ms，不设置则使用 transitionDuration） */
openDuration?: number

/** 关闭动画效果（不设置则使用 openAnimation） */
closeAnimation?: 'fade' | 'zoom' | 'fade-zoom' | 'slide-up' | 'slide-down' | 'none'

/** 关闭动画时长（ms，不设置则使用 openDuration 或 transitionDuration） */
closeDuration?: number
```

#### 使用示例

```html
<!-- 基础用法：使用相同的开合动画 -->
<ldesign-image-viewer 
  open-animation="zoom"
  open-duration="300"
></ldesign-image-viewer>

<!-- 高级用法：不同的开合动画 -->
<ldesign-image-viewer 
  open-animation="slide-up"
  close-animation="fade"
  open-duration="400"
  close-duration="200"
></ldesign-image-viewer>

<!-- JavaScript控制 -->
<script>
  const viewer = document.querySelector('ldesign-image-viewer');
  viewer.openAnimation = 'fade-zoom';
  viewer.closeAnimation = 'zoom';
  viewer.openDuration = 350;
  viewer.closeDuration = 250;
</script>
```

---

### 2. 多种Caption（标题与描述）显示位置

现在支持4种不同的标题显示位置，在**所有模式下都会显示标题和描述**：

#### 位置选项
- **bottom** - 底部浮层（默认）- 位于工具栏上方，带阴影效果
- **top** - 顶部显示 - 位于缩略图下方
- **inside-bottom** - 内嵌底部 - 完全嵌入底部，带渐变背景
- **custom** - 自定义位置（可通过CSS进一步定制）

#### 相关Props

```typescript
/** 是否显示标题与描述 */
showCaption?: boolean = true

/** 标题与描述的显示位置 */
captionPosition?: 'bottom' | 'top' | 'inside-bottom' | 'custom' = 'bottom'
```

#### 使用示例

```html
<!-- 底部浮层显示（默认） -->
<ldesign-image-viewer 
  show-caption="true"
  caption-position="bottom"
></ldesign-image-viewer>

<!-- 顶部显示 -->
<ldesign-image-viewer 
  caption-position="top"
></ldesign-image-viewer>

<!-- 内嵌底部（带渐变背景） -->
<ldesign-image-viewer 
  caption-position="inside-bottom"
></ldesign-image-viewer>

<!-- JavaScript控制 -->
<script>
  const viewer = document.querySelector('ldesign-image-viewer');
  viewer.captionPosition = 'inside-bottom';
</script>
```

#### 图片数据格式

```javascript
const images = [
  {
    src: 'image1.jpg',
    thumbnail: 'thumb1.jpg',
    title: '图片标题',          // 标题
    description: '图片描述文字',  // 描述
    alt: 'alt text',
    name: 'download-name.jpg'
  }
];
```

---

## 🎨 样式定制

### Caption样式定制

可以通过CSS变量和类名定制caption样式：

```css
/* 定制caption文字样式 */
.ldesign-image-viewer__caption-title {
  font-size: 18px !important;
  font-weight: 700 !important;
}

.ldesign-image-viewer__caption-desc {
  font-size: 14px !important;
  line-height: 1.8 !important;
}

/* 定制inside-bottom的渐变背景 */
.ldesign-image-viewer__caption--inside-bottom {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%) !important;
  padding: 60px 30px 30px !important;
}
```

### 动画时长定制

```css
/* 通过CSS变量全局控制 */
ldesign-image-viewer {
  --iv-open-duration: 400ms;
  --iv-close-duration: 300ms;
  --iv-ease: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性缓动 */
}
```

---

## 📖 完整示例

### 示例1：小窗模式 + 上滑动画 + 顶部caption

```html
<ldesign-image-viewer 
  id="viewer1"
  viewer-mode="modal"
  panel-width="900px"
  panel-height="650px"
  viewer-title="图片预览"
  
  open-animation="slide-up"
  close-animation="slide-down"
  open-duration="350"
  close-duration="300"
  
  caption-position="top"
  show-caption="true"
></ldesign-image-viewer>

<script>
  const viewer1 = document.getElementById('viewer1');
  viewer1.images = JSON.stringify([
    {
      src: 'photo1.jpg',
      title: '美丽风景',
      description: '这是一张美丽的风景照片'
    }
  ]);
  viewer1.visible = true;
</script>
```

### 示例2：全屏模式 + 缩放动画 + 内嵌底部caption

```html
<ldesign-image-viewer 
  id="viewer2"
  viewer-mode="overlay"
  
  open-animation="zoom"
  close-animation="fade"
  open-duration="400"
  close-duration="250"
  
  caption-position="inside-bottom"
  show-thumbnails="true"
></ldesign-image-viewer>
```

### 示例3：动态配置

```javascript
function openViewer(config) {
  const viewer = document.createElement('ldesign-image-viewer');
  
  // 基础配置
  viewer.images = JSON.stringify(imageList);
  viewer.viewerMode = config.mode || 'overlay';
  
  // 动画配置
  viewer.openAnimation = config.openAnim || 'fade-zoom';
  viewer.closeAnimation = config.closeAnim || config.openAnim;
  viewer.openDuration = config.openDur || 300;
  viewer.closeDuration = config.closeDur || 250;
  
  // Caption配置
  viewer.captionPosition = config.captionPos || 'bottom';
  viewer.showCaption = true;
  
  document.body.appendChild(viewer);
  viewer.visible = true;
}

// 使用
openViewer({
  mode: 'modal',
  openAnim: 'slide-up',
  closeAnim: 'fade',
  openDur: 400,
  closeDur: 200,
  captionPos: 'inside-bottom'
});
```

---

## 🔄 向后兼容

所有新增的Props都是**可选**的，默认值保持原有行为：
- 默认动画：`fade-zoom`
- 默认Caption位置：`bottom`
- 默认显示Caption：`true`

现有代码无需修改即可正常工作。

---

## 🎯 最佳实践

### 1. 动画选择建议
- **Modal模式**：推荐使用 `slide-up` 或 `fade-zoom`
- **Overlay模式**：推荐使用 `zoom` 或 `fade-zoom`
- **快速交互**：使用 `fade` 并设置较短时长（150-200ms）
- **强调效果**：使用 `slide-up` 配合较长时长（350-450ms）

### 2. Caption位置建议
- **图片为主**：使用 `bottom` 或 `inside-bottom`
- **信息丰富**：使用 `top`（避免遮挡图片重要部分）
- **沉浸体验**：使用 `inside-bottom`（无边框，更融入）

### 3. 性能建议
- 动画时长建议：200ms - 450ms
- 避免超长动画（>600ms）影响用户体验
- 移动端建议使用较快动画（250ms以内）

---

## 📝 API参考

### 新增Props一览

| Prop名称 | 类型 | 默认值 | 说明 |
|---------|------|-------|------|
| `openAnimation` | `'fade'\|'zoom'\|'fade-zoom'\|'slide-up'\|'slide-down'\|'none'` | `'fade-zoom'` | 打开动画类型 |
| `openDuration` | `number` | - | 打开动画时长(ms) |
| `closeAnimation` | `'fade'\|'zoom'\|'fade-zoom'\|'slide-up'\|'slide-down'\|'none'` | - | 关闭动画类型 |
| `closeDuration` | `number` | - | 关闭动画时长(ms) |
| `captionPosition` | `'bottom'\|'top'\|'inside-bottom'\|'custom'` | `'bottom'` | Caption显示位置 |

### CSS类名

```
.ldesign-image-viewer__caption               // Caption容器
.ldesign-image-viewer__caption--bottom       // 底部位置
.ldesign-image-viewer__caption--top          // 顶部位置
.ldesign-image-viewer__caption--inside-bottom // 内嵌底部
.ldesign-image-viewer__caption--custom       // 自定义位置
.ldesign-image-viewer__caption-title         // 标题
.ldesign-image-viewer__caption-desc          // 描述
```

---

## 🎉 测试页面

运行演示页面查看所有效果：
```bash
# 在浏览器中打开
open test-animations-demo.html
```

演示页面包含：
- 6种动画效果对比
- 4种Caption位置对比
- 多种组合效果示例
