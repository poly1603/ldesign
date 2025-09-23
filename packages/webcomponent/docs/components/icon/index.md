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

## 旋转（spin）

用于加载、刷新等场景：

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="loader-2" spin></ldesign-icon>
    <ldesign-icon name="refresh-cw" spin></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="loader-2" spin></ldesign-icon>
<ldesign-icon name="refresh-cw" spin></ldesign-icon>
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

## API

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| name | 图标名称（Lucide） | `string` | - |
| size | 图标尺寸（预设或像素值） | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| color | 图标颜色 | `string` | `inherit` |
| spin | 是否旋转 | `boolean` | `false` |
| stroke-width | 描边宽度 | `number` | `2` |

## 全量图标预览（Lucide）

<IconGallery />
