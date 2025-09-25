# Space 间距

用于在一组元素之间提供一致的间距与对齐控制。

## 基础用法

默认横向排列，间距为 `medium`。

<div class="demo-container">
  <ldesign-space>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
  </ldesign-space>
</div>

```html
<ldesign-space>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
</ldesign-space>
```

## 垂直排列

将 `direction` 设为 `vertical`，子元素按列排列。

<div class="demo-container">
  <ldesign-space direction="vertical">
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
  </ldesign-space>
</div>

```html
<ldesign-space direction="vertical">
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
</ldesign-space>
```

## 间距大小

通过 `size` 设置间距大小，支持 `small | medium | large`。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">small:</span>
    <ldesign-space size="small">
      <ldesign-button>Small</ldesign-button>
      <ldesign-button>Small</ldesign-button>
      <ldesign-button>Small</ldesign-button>
    </ldesign-space>
  </div>
  <div class="demo-row">
    <span class="demo-label">medium:</span>
    <ldesign-space size="medium">
      <ldesign-button>Medium</ldesign-button>
      <ldesign-button>Medium</ldesign-button>
      <ldesign-button>Medium</ldesign-button>
    </ldesign-space>
  </div>
  <div class="demo-row">
    <span class="demo-label">large:</span>
    <ldesign-space size="large">
      <ldesign-button>Large</ldesign-button>
      <ldesign-button>Large</ldesign-button>
      <ldesign-button>Large</ldesign-button>
    </ldesign-space>
  </div>
</div>

```html
<ldesign-space size="small">...</ldesign-space>
<ldesign-space size="medium">...</ldesign-space>
<ldesign-space size="large">...</ldesign-space>
```

## 自定义像素间距

`size` 也可以是数字或数字字符串（单位 px）。

<div class="demo-container">
  <ldesign-space size="12">
    <ldesign-button>12px</ldesign-button>
    <ldesign-button>12px</ldesign-button>
    <ldesign-button>12px</ldesign-button>
  </ldesign-space>
</div>

```html
<ldesign-space size="12">...</ldesign-space>
```

## 对齐方式（交叉轴）

通过 `align` 控制交叉轴对齐：`start | center | end | baseline`。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">start</span>
    <ldesign-space align="start">
      <ldesign-button>Start</ldesign-button>
      <ldesign-button>Start</ldesign-button>
      <ldesign-button>Start</ldesign-button>
    </ldesign-space>
  </div>
  <div class="demo-row">
    <span class="demo-label">end</span>
    <ldesign-space align="end">
      <ldesign-button>End</ldesign-button>
      <ldesign-button>End</ldesign-button>
      <ldesign-button>End</ldesign-button>
    </ldesign-space>
  </div>
  <div class="demo-row">
    <span class="demo-label">baseline</span>
    <ldesign-space direction="horizontal" align="baseline">
      <span style="font-size: 12px">Text 12</span>
      <span style="font-size: 20px">Text 20</span>
      <span style="font-size: 16px">Text 16</span>
    </ldesign-space>
  </div>
</div>

```html
<ldesign-space align="start">...</ldesign-space>
<ldesign-space align="end">...</ldesign-space>
<ldesign-space direction="horizontal" align="baseline">
  <span style="font-size:12px">Text 12</span>
  <span style="font-size:20px">Text 20</span>
  <span style="font-size:16px">Text 16</span>
</ldesign-space>
```

## 自动换行

横向排列时，开启 `break-line` 遇到容器宽度不足会自动换行。

<div class="demo-container">
  <div style="width: 320px; border: 1px dashed var(--ldesign-border-color); padding: 8px;">
    <ldesign-space break-line>
      <ldesign-button>Button</ldesign-button>
      <ldesign-button>Button</ldesign-button>
      <ldesign-button>Button</ldesign-button>
      <ldesign-button>Button</ldesign-button>
      <ldesign-button>Button</ldesign-button>
      <ldesign-button>Button</ldesign-button>
    </ldesign-space>
  </div>
</div>

```html
<div style="width:320px">
  <ldesign-space break-line>...</ldesign-space>
</div>
```

## 组合与嵌套

Space 可以嵌套使用。

<div class="demo-container">
  <ldesign-space>
    <ldesign-button>Button</ldesign-button>
    <ldesign-space>
      <ldesign-button type="primary">Primary</ldesign-button>
      <ldesign-button type="outline">Outline</ldesign-button>
    </ldesign-space>
    <ldesign-button type="text">Text</ldesign-button>
  </ldesign-space>
</div>

```html
<ldesign-space>
  <ldesign-button>Button</ldesign-button>
  <ldesign-space>
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button type="outline">Outline</ldesign-button>
  </ldesign-space>
  <ldesign-button type="text">Text</ldesign-button>
</ldesign-space>
```

## 分隔线

设置 `split="line"` 可在子元素之间显示分隔线。分隔线会位于 gap 的正中央，保证两侧间距一致。

<div class="demo-container">
  <ldesign-space split="line">
    <span>Item 1</span>
    <span>Item 2</span>
    <span>Item 3</span>
  </ldesign-space>
</div>

```html
<ldesign-space split="line">
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</ldesign-space>
```

## 横纵向组合

横向与纵向可以灵活组合，常用于构建表单行/卡片栅格等布局。

<div class="demo-container">
  <ldesign-space direction="vertical" size="large">
    <ldesign-space>
      <ldesign-button type="primary">保存</ldesign-button>
      <ldesign-button type="secondary">取消</ldesign-button>
      <ldesign-button type="outline">更多</ldesign-button>
    </ldesign-space>
    <ldesign-space split="line" size="large">
      <span>操作日志</span>
      <span>版本 1.2.3</span>
      <span>2025-09-25</span>
    </ldesign-space>
  </ldesign-space>
</div>

```html
<ldesign-space direction="vertical" size="large">
  <ldesign-space>
    <ldesign-button type="primary">保存</ldesign-button>
    <ldesign-button type="secondary">取消</ldesign-button>
    <ldesign-button type="outline">更多</ldesign-button>
  </ldesign-space>
  <ldesign-space split="line" size="large">
    <span>操作日志</span>
    <span>版本 1.2.3</span>
    <span>2025-09-25</span>
  </ldesign-space>
</ldesign-space>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `direction` | `'horizontal' | 'vertical'` | `horizontal` | 布局方向 |
| `size` | `'small' | 'medium' | 'large' | number` | `medium` | 间距大小；数字为像素 |
| `align` | `'start' | 'center' | 'end' | 'baseline'` | `center` | 交叉轴对齐方式 |
| `break-line` | `boolean` | `false` | 横向时是否自动换行 |
| `block` | `boolean` | `false` | 是否占满容器宽度 |
| `split` | `'none' | 'line'` | `none` | 是否显示分隔符 |

### CSS 变量

| 变量名 | 说明 |
|---|---|
| `--gap` | 控制间距，默认由 `size` 预设决定；可通过行内 style 覆盖 |