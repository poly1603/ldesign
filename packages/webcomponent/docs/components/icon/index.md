# Icon 图标

图标用于传达意义和功能，提供视觉提示和导航辅助。Icon 组件基于 Lucide 图标库，支持尺寸、颜色、描边宽度和旋转等能力。

> 提示：下方“全量图标预览（Lucide）”会展示当前 Lucide 提供的全部图标，支持搜索与点击复制名称。

## 基础用法

使用 `name` 属性指定要显示的图标：

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="search"></ldesign-icon>
    <ldesign-icon name="heart"></ldesign-icon>
    <ldesign-icon name="download"></ldesign-icon>
    <ldesign-icon name="star"></ldesign-icon>
    <ldesign-icon name="plus"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="search"></ldesign-icon>
<ldesign-icon name="heart"></ldesign-icon>
<ldesign-icon name="download"></ldesign-icon>
<ldesign-icon name="star"></ldesign-icon>
<ldesign-icon name="plus"></ldesign-icon>
```

## 尺寸（size）

- 预设：`small | medium | large`
- 自定义：传入数值表示像素尺寸

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">预设尺寸:</span>
    <ldesign-icon name="search" size="small"></ldesign-icon>
    <ldesign-icon name="search" size="medium"></ldesign-icon>
    <ldesign-icon name="search" size="large"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义数值:</span>
    <ldesign-icon name="search" size="16"></ldesign-icon>
    <ldesign-icon name="search" size="24"></ldesign-icon>
    <ldesign-icon name="search" size="32"></ldesign-icon>
    <ldesign-icon name="search" size="48"></ldesign-icon>
  </div>
</div>

```html
<!-- 预设尺寸 -->
<ldesign-icon name="search" size="small"></ldesign-icon>
<ldesign-icon name="search" size="medium"></ldesign-icon>
<ldesign-icon name="search" size="large"></ldesign-icon>

<!-- 自定义像素尺寸 -->
<ldesign-icon name="search" size="16"></ldesign-icon>
<ldesign-icon name="search" size="24"></ldesign-icon>
<ldesign-icon name="search" size="32"></ldesign-icon>
<ldesign-icon name="search" size="48"></ldesign-icon>
```

## 颜色（color）

使用 `color` 属性设置图标颜色：

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

## 动画效果（animation）

支持多种动画效果，适用于不同场景：

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">spin:</span>
    <ldesign-icon name="loader-2" animation="spin"></ldesign-icon>
    <ldesign-icon name="refresh-cw" animation="spin"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">pulse:</span>
    <ldesign-icon name="heart" animation="pulse" color="red"></ldesign-icon>
    <ldesign-icon name="wifi" animation="pulse" color="blue"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">bounce:</span>
    <ldesign-icon name="arrow-down" animation="bounce" color="green"></ldesign-icon>
    <ldesign-icon name="chevron-down" animation="bounce"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">flash:</span>
    <ldesign-icon name="zap" animation="flash" color="orange"></ldesign-icon>
    <ldesign-icon name="alert-triangle" animation="flash" color="red"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">shake:</span>
    <ldesign-icon name="bell" animation="shake" color="purple"></ldesign-icon>
    <ldesign-icon name="phone" animation="shake" color="green"></ldesign-icon>
  </div>
</div>

```html
<!-- 旋转动画（加载、刷新） -->
<ldesign-icon name="loader-2" animation="spin"></ldesign-icon>

<!-- 脉冲动画（心跳、信号） -->
<ldesign-icon name="heart" animation="pulse" color="red"></ldesign-icon>

<!-- 弹跳动画（引导、提示） -->
<ldesign-icon name="arrow-down" animation="bounce"></ldesign-icon>

<!-- 闪烁动画（警告、强调） -->
<ldesign-icon name="zap" animation="flash" color="orange"></ldesign-icon>

<!-- 摇晃动画（通知、提醒） -->
<ldesign-icon name="bell" animation="shake"></ldesign-icon>
```

## 渐变色（gradient）

为图标添加渐变色效果，让界面更加生动：

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">默认渐变:</span>
    <ldesign-icon name="rocket" gradient size="32"></ldesign-icon>
    <ldesign-icon name="star" gradient size="32"></ldesign-icon>
    <ldesign-icon name="heart" gradient size="32"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义颜色:</span>
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

## 变换（rotate/flip）

支持旋转和翻转变换：

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">旋转角度:</span>
    <ldesign-icon name="arrow-right" size="24"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="45" size="24"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="90" size="24"></ldesign-icon>
    <ldesign-icon name="arrow-right" rotate="180" size="24"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">翻转:</span>
    <ldesign-icon name="play" size="24"></ldesign-icon>
    <ldesign-icon name="play" flip="horizontal" size="24"></ldesign-icon>
    <ldesign-icon name="play" flip="vertical" size="24"></ldesign-icon>
    <ldesign-icon name="play" flip="both" size="24"></ldesign-icon>
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

## 描边宽度（stroke-width）

Lucide 图标默认描边宽度为 2，你可以通过 `stroke-width` 调整：

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">stroke-width 1:</span>
    <ldesign-icon name="search" stroke-width="1"></ldesign-icon>
    <span class="demo-label">2:</span>
    <ldesign-icon name="search" stroke-width="2"></ldesign-icon>
    <span class="demo-label">3:</span>
    <ldesign-icon name="search" stroke-width="3"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="search" stroke-width="1"></ldesign-icon>
<ldesign-icon name="search" stroke-width="2"></ldesign-icon>
<ldesign-icon name="search" stroke-width="3"></ldesign-icon>
```

## 命名规范

你可以传入以下任意形式，都会被自动规范化为 Lucide 的 kebab-case 名称：

- `alarm-clock`（推荐，和 Lucide 一致）
- `alarmClock`
- `AlarmClock`
- `alarm_clock`
- `  alarm-clock  `（会自动去掉空格）

```html
<ldesign-icon name="alarm-clock"></ldesign-icon>
<ldesign-icon name="alarmClock"></ldesign-icon>
<ldesign-icon name="AlarmClock"></ldesign-icon>
<ldesign-icon name="alarm_clock"></ldesign-icon>
```

## 在文本中使用

图标可以与文字组合，提供更好的视觉效果：

<div class="demo-container">
  <div class="demo-row">
    <p style="display:flex;align-items:center;gap:8px;margin:0;">
      <ldesign-icon name="download" size="small"></ldesign-icon>
      下载文件
    </p>
    <p style="display:flex;align-items:center;gap:8px;margin:0;">
      <ldesign-icon name="search" size="small"></ldesign-icon>
      搜索内容
    </p>
  </div>
</div>

```html
<p style="display:flex;align-items:center;gap:8px;">
  <ldesign-icon name="download" size="small"></ldesign-icon>
  下载文件
</p>
<p style="display:flex;align-items:center;gap:8px;">
  <ldesign-icon name="search" size="small"></ldesign-icon>
  搜索内容
</p>
```

## 自定义 SVG

支持传入自定义的 SVG 内容：

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
  custom-svg='<svg viewBox="0 0 24 24">...</svg>'
  size="32"
  color="#52c41a"
></ldesign-icon>
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| name | 图标名称（Lucide） | `string` | - |
| size | 图标尺寸（预设或像素值） | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| color | 图标颜色 | `string` | `inherit` |
| animation | 动画类型 | `'spin' \| 'pulse' \| 'bounce' \| 'flash' \| 'shake' \| 'none'` | `'none'` |
| stroke-width | 描边宽度 | `number` | `2` |
| rotate | 旋转角度 | `number` | - |
| flip | 翻转方向 | `'horizontal' \| 'vertical' \| 'both'` | - |
| gradient | 是否使用渐变色 | `boolean` | `false` |
| gradient-colors | 渐变色数组 | `string \| string[]` | `['#667eea', '#764ba2']` |
| gradient-direction | 渐变方向 | `'horizontal' \| 'vertical' \| 'diagonal'` | `'horizontal'` |
| label | 无障碍标签 | `string` | - |
| decorative | 是否为装饰性图标 | `boolean` | `false` |
| custom-svg | 自定义 SVG 内容 | `string` | - |
| spin | 是否旋转（已废弃） | `boolean` | `false` |

### 方法

| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| preloadIcons | `iconNames: string[]` | `Promise<void>` | 预加载指定图标 |
| searchIcons | `keyword: string` | `Promise<string[]>` | 搜索匹配的图标名称 |

## 所有图标列表

Lucide 提供了超过 1400+ 个精心设计的图标。下面是所有可用图标的列表，您可以：
- 🔍 **搜索图标** - 在搜索框中输入关键词快速查找
- 📋 **点击复制** - 点击任意图标即可复制其名称
- 👀 **实时预览** - 查看图标的实际显示效果

<IconGallery />
