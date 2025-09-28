# Icon 图标

图标用于传达意义和功能，提供视觉提示和导航辅助。

## 基础用法

使用 `name` 属性指定要显示的图标。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="heart"></ldesign-icon>
    <ldesign-icon name="star"></ldesign-icon>
    <ldesign-icon name="download"></ldesign-icon>
    <ldesign-icon name="search"></ldesign-icon>
    <ldesign-icon name="plus"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="heart"></ldesign-icon>
<ldesign-icon name="star"></ldesign-icon>
<ldesign-icon name="download"></ldesign-icon>
<ldesign-icon name="search"></ldesign-icon>
<ldesign-icon name="plus"></ldesign-icon>
```

## 图标尺寸

使用 `size` 属性来设置图标的大小，支持预设尺寸和自定义数值。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">预设尺寸:</span>
    <ldesign-icon name="heart" size="small"></ldesign-icon>
    <ldesign-icon name="heart" size="medium"></ldesign-icon>
    <ldesign-icon name="heart" size="large"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义尺寸:</span>
    <ldesign-icon name="heart" size="16"></ldesign-icon>
    <ldesign-icon name="heart" size="24"></ldesign-icon>
    <ldesign-icon name="heart" size="32"></ldesign-icon>
    <ldesign-icon name="heart" size="48"></ldesign-icon>
  </div>
</div>

```html
<!-- 预设尺寸 -->
<ldesign-icon name="heart" size="small"></ldesign-icon>
<ldesign-icon name="heart" size="medium"></ldesign-icon>
<ldesign-icon name="heart" size="large"></ldesign-icon>

<!-- 自定义尺寸 -->
<ldesign-icon name="heart" size="16"></ldesign-icon>
<ldesign-icon name="heart" size="24"></ldesign-icon>
<ldesign-icon name="heart" size="32"></ldesign-icon>
<ldesign-icon name="heart" size="48"></ldesign-icon>
```

## 图标颜色

使用 `color` 属性来设置图标的颜色。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="heart" color="red"></ldesign-icon>
    <ldesign-icon name="star" color="orange"></ldesign-icon>
    <ldesign-icon name="download" color="blue"></ldesign-icon>
    <ldesign-icon name="search" color="green"></ldesign-icon>
    <ldesign-icon name="plus" color="#722ED1"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="heart" color="red"></ldesign-icon>
<ldesign-icon name="star" color="orange"></ldesign-icon>
<ldesign-icon name="download" color="blue"></ldesign-icon>
<ldesign-icon name="search" color="green"></ldesign-icon>
<ldesign-icon name="plus" color="#722ED1"></ldesign-icon>
```

## 动画效果

使用 `animation` 属性为图标添加动画效果，支持多种动画类型。

### 旋转动画

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="loader-2" animation="spin"></ldesign-icon>
    <ldesign-icon name="refresh-cw" animation="spin"></ldesign-icon>
    <ldesign-icon name="settings" animation="spin" color="#52c41a"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="loader-2" animation="spin"></ldesign-icon>
<ldesign-icon name="refresh-cw" animation="spin"></ldesign-icon>
<ldesign-icon name="settings" animation="spin" color="#52c41a"></ldesign-icon>
```

### 其他动画效果

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">pulse:</span>
    <ldesign-icon name="heart" animation="pulse" color="red" size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">bounce:</span>
    <ldesign-icon name="arrow-down" animation="bounce" color="#52c41a" size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">flash:</span>
    <ldesign-icon name="zap" animation="flash" color="orange" size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">shake:</span>
    <ldesign-icon name="bell" animation="shake" color="#722ed1" size="32"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="heart" animation="pulse" color="red"></ldesign-icon>
<ldesign-icon name="arrow-down" animation="bounce" color="#52c41a"></ldesign-icon>
<ldesign-icon name="zap" animation="flash" color="orange"></ldesign-icon>
<ldesign-icon name="bell" animation="shake" color="#722ed1"></ldesign-icon>
```

## 渐变色效果

使用 `gradient` 属性为图标添加渐变色效果。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">默认渐变:</span>
    <ldesign-icon name="rocket" gradient size="32"></ldesign-icon>
    <ldesign-icon name="star" gradient size="32"></ldesign-icon>
    <ldesign-icon name="heart" gradient size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义渐变:</span>
    <ldesign-icon name="flame" gradient gradient-colors='["#ff0080", "#ff8000"]' size="32"></ldesign-icon>
    <ldesign-icon name="droplet" gradient gradient-colors='["#00f0ff", "#0080ff"]' size="32"></ldesign-icon>
    <ldesign-icon name="leaf" gradient gradient-colors='["#00ff00", "#00a000"]' size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">渐变方向:</span>
    <ldesign-icon name="arrow-right" gradient gradient-direction="horizontal" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-down" gradient gradient-direction="vertical" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-down-right" gradient gradient-direction="diagonal" size="32"></ldesign-icon>
  </div>
</div>

```html
<!-- 默认渐变 -->
<ldesign-icon name="rocket" gradient></ldesign-icon>

<!-- 自定义渐变色 -->
<ldesign-icon 
  name="flame" 
  gradient 
  gradient-colors='["#ff0080", "#ff8000"]'
></ldesign-icon>

<!-- 渐变方向 -->
<ldesign-icon 
  name="arrow-right" 
  gradient 
  gradient-direction="horizontal"
></ldesign-icon>
```

## 变换效果

使用 `rotate` 和 `flip` 属性对图标进行变换。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">旋转角度:</span>
    <ldesign-icon name="arrow-right" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="45" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="90" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="135" size="32"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="180" size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">翻转效果:</span>
    <ldesign-icon name="play" size="32"></ldesign-icon>
    <ldesign-icon name="play" flip="horizontal" size="32"></ldesign-icon>
    <ldesign-icon name="play" flip="vertical" size="32"></ldesign-icon>
    <ldesign-icon name="play" flip="both" size="32"></ldesign-icon>
  </div>
</div>

```html
<!-- 旋转 -->
<ldesign-icon name="arrow-right" rotate="45"></ldesign-icon>
<ldesign-icon name="arrow-right" rotate="90"></ldesign-icon>
<ldesign-icon name="arrow-right" rotate="180"></ldesign-icon>

<!-- 翻转 -->
<ldesign-icon name="play" flip="horizontal"></ldesign-icon>
<ldesign-icon name="play" flip="vertical"></ldesign-icon>
<ldesign-icon name="play" flip="both"></ldesign-icon>
```

## 自定义SVG

使用 `custom-svg` 属性可以传入自定义的 SVG 内容。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon 
      custom-svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>'
      size="32"
      color="#52c41a"
    ></ldesign-icon>
    <ldesign-icon 
      custom-svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
      size="32"
      color="#faad14"
    ></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon 
  custom-svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>'
  size="32"
  color="#52c41a"
></ldesign-icon>
```

## 在文本中使用

图标可以与文本组合使用，提供更好的视觉效果。

<div class="demo-container">
  <div class="demo-row">
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="download" size="small"></ldesign-icon>
      下载文件
    </p>
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="search" size="small"></ldesign-icon>
      搜索内容
    </p>
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="heart" size="small" color="red"></ldesign-icon>
      收藏
    </p>
  </div>
</div>

```html
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="download" size="small"></ldesign-icon>
  下载文件
</p>
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="search" size="small"></ldesign-icon>
  搜索内容
</p>
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="heart" size="small" color="red"></ldesign-icon>
  收藏
</p>
```

## 所有图标列表

Lucide 提供了超过 1400+ 个精心设计的图标。下面是所有可用图标的列表，您可以：
- 🔍 **搜索图标** - 在搜索框中输入关键词快速查找
- 📋 **点击复制** - 点击任意图标即可复制其名称
- 👀 **实时预览** - 查看图标的实际显示效果

<IconGallery />

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `name` | `string` | - | 图标名称（使用 Lucide 图标库的图标名） |
| `size` | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 图标尺寸 |
| `color` | `string` | - | 图标颜色，支持任何有效的 CSS 颜色值 |
| `spin` | `boolean` | `false` | 是否旋转（已废弃，请使用 animation="spin"） |
| `animation` | `'spin' \| 'pulse' \| 'bounce' \| 'flash' \| 'shake' \| 'none'` | `'none'` | 动画效果类型 |
| `stroke-width` | `number` | `2` | 描边宽度 |
| `rotate` | `number` | - | 旋转角度（度数） |
| `flip` | `'horizontal' \| 'vertical' \| 'both'` | - | 翻转方向 |
| `gradient` | `boolean` | `false` | 是否使用渐变色 |
| `gradient-colors` | `string \| string[]` | `['#667eea', '#764ba2']` | 渐变色数组，支持 JSON 字符串或数组 |
| `gradient-direction` | `'horizontal' \| 'vertical' \| 'diagonal'` | `'horizontal'` | 渐变方向 |
| `label` | `string` | - | 无障碍标签 |
| `decorative` | `boolean` | `false` | 是否为装饰性图标（无语义） |
| `custom-svg` | `string` | - | 自定义 SVG 内容 |

### 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `preloadIcons` | `iconNames: string[]` | `Promise<void>` | 预加载指定的图标 |
| `searchIcons` | `keyword: string` | `Promise<string[]>` | 搜索匹配关键词的图标名称 |

### CSS 变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--ls-icon-size-small` | `20px` | 小图标尺寸 |
| `--ls-icon-size-medium` | `22px` | 中图标尺寸 |
| `--ls-icon-size-large` | `24px` | 大图标尺寸 |
| `--icon-color` | `currentColor` | 图标颜色 |
| `--icon-opacity` | `1` | 图标不透明度 |
| `--icon-transition` | `all 0.2s ease-in-out` | 图标过渡动画 |

## 无障碍

Icon 组件遵循无障碍设计原则：

- 默认提供 `role="img"` 属性标识图标角色
- 支持 `label` 属性自定义图标含义描述（会设置为 `aria-label`）
- 支持 `decorative` 属性标记装饰性图标（将设置 `aria-hidden="true"`）
- 支持高对比度模式
- 图标颜色符合 WCAG 对比度要求

```html
<!-- 有语义的图标 -->
<ldesign-icon name="download" label="下载文件"></ldesign-icon>

<!-- 装饰性图标 -->
<ldesign-icon name="star" decorative></ldesign-icon>
```

## 设计指南

### 何时使用

- 作为功能入口的视觉辅助
- 在有限的空间内传达信息
- 提供视觉层次和导航提示
- 增强用户界面的美观性

### 何时不使用

- 不要仅依赖图标传达重要信息，应配合文字说明
- 避免使用过于复杂或难以理解的图标
- 不要在同一界面中使用过多不同风格的图标

### 最佳实践

- 保持图标风格的一致性
- 确保图标含义清晰易懂
- 在重要操作中结合文字标签
- 考虑不同文化背景下的图标理解差异
- 为图标提供合适的点击区域（至少 44px × 44px）
- 合理使用动画效果，避免过度动画
- 渐变色应与品牌色调保持一致
- 装饰性图标应正确标记以提升无障碍体验

### 图标选择原则

- **简洁性**: 图标应该简洁明了，避免过多细节
- **识别性**: 图标应该容易识别和理解
- **一致性**: 同一系统中的图标应该保持风格一致
- **通用性**: 优先选择通用的、被广泛认知的图标
