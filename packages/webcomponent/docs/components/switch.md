# Switch 开关

表示两种相互对立的状态间的切换，多用于触发「开/关」。

## 基础用法

表示开关状态/两种状态之间的切换。

<div class="demo-container">
  <ldesign-switch></ldesign-switch>
  <ldesign-switch checked></ldesign-switch>
</div>

```html
<ldesign-switch></ldesign-switch>
<ldesign-switch checked></ldesign-switch>
```

## 禁用状态

开关不可用状态。

<div class="demo-container">
  <ldesign-switch disabled></ldesign-switch>
  <ldesign-switch checked disabled></ldesign-switch>
</div>

```html
<ldesign-switch disabled></ldesign-switch>
<ldesign-switch checked disabled></ldesign-switch>
```

## 文字描述

使用 `checked-text` 和 `unchecked-text` 属性来设置开关的文字描述。

<div class="demo-container">
  <ldesign-switch checked-text="开" unchecked-text="关"></ldesign-switch>
  <ldesign-switch checked checked-text="ON" unchecked-text="OFF"></ldesign-switch>
</div>

```html
<ldesign-switch checked-text="开" unchecked-text="关"></ldesign-switch>
<ldesign-switch checked checked-text="ON" unchecked-text="OFF"></ldesign-switch>
```

## 扩展的 value 类型

设置 `checked-value` 和 `unchecked-value` 属性，接受 `Boolean`、`String` 或 `Number` 类型的值。

<div class="demo-container">
  <ldesign-switch checked-value="100" unchecked-value="0"></ldesign-switch>
  <ldesign-switch checked checked-value="yes" unchecked-value="no"></ldesign-switch>
</div>

```html
<ldesign-switch checked-value="100" unchecked-value="0"></ldesign-switch>
<ldesign-switch checked checked-value="yes" unchecked-value="no"></ldesign-switch>
```

## 不同尺寸

使用 `size` 属性改变开关大小。

<div class="demo-container">
  <ldesign-switch size="large"></ldesign-switch>
  <ldesign-switch size="medium"></ldesign-switch>
  <ldesign-switch size="small"></ldesign-switch>
</div>

```html
<ldesign-switch size="large"></ldesign-switch>
<ldesign-switch size="medium"></ldesign-switch>
<ldesign-switch size="small"></ldesign-switch>
```

## 加载中

设置 `loading` 属性，表示加载中的状态。

<div class="demo-container">
  <ldesign-switch loading></ldesign-switch>
  <ldesign-switch checked loading></ldesign-switch>
</div>

```html
<ldesign-switch loading></ldesign-switch>
<ldesign-switch checked loading></ldesign-switch>
```

## 不同颜色

用于表示不同语义状态的颜色风格。

<div class="demo-container">
  <ldesign-switch color="brand" checked></ldesign-switch>
  <ldesign-switch color="success" checked></ldesign-switch>
  <ldesign-switch color="warning" checked></ldesign-switch>
  <ldesign-switch color="error" checked></ldesign-switch>
  <ldesign-switch color="neutral" checked></ldesign-switch>
</div>

```html
<ldesign-switch color="brand" checked></ldesign-switch>
<ldesign-switch color="success" checked></ldesign-switch>
<ldesign-switch color="warning" checked></ldesign-switch>
<ldesign-switch color="error" checked></ldesign-switch>
<ldesign-switch color="neutral" checked></ldesign-switch>
```

## 外观风格

通过 `variant` 控制不同的视觉风格。

<div class="demo-container">
  <ldesign-switch variant="solid" checked></ldesign-switch>
  <ldesign-switch variant="soft" checked></ldesign-switch>
  <ldesign-switch variant="outline" checked></ldesign-switch>
  <ldesign-switch variant="ghost" checked></ldesign-switch>
</div>

```html
<ldesign-switch variant="solid" checked></ldesign-switch>
<ldesign-switch variant="soft" checked></ldesign-switch>
<ldesign-switch variant="outline" checked></ldesign-switch>
<ldesign-switch variant="ghost" checked></ldesign-switch>
```

## 形状

通过 `shape` 控制轨道与滑块的圆角。

<div class="demo-container">
  <ldesign-switch shape="pill" checked></ldesign-switch>
  <ldesign-switch shape="rounded" checked></ldesign-switch>
  <ldesign-switch shape="square" checked></ldesign-switch>
</div>

```html
<ldesign-switch shape="pill" checked></ldesign-switch>
<ldesign-switch shape="rounded" checked></ldesign-switch>
<ldesign-switch shape="square" checked></ldesign-switch>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | 是否选中 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否加载中 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 开关的尺寸 |
| `color` | `'brand' \| 'success' \| 'warning' \| 'error' \| 'neutral'` | `'brand'` | 颜色风格 |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'` | 外观风格 |
| `shape` | `'pill' \| 'rounded' \| 'square'` | `'pill'` | 形状（轨道与滑块圆角） |
| `checked-value` | `string \| number \| boolean` | `true` | 选中时的值 |
| `unchecked-value` | `string \| number \| boolean` | `false` | 未选中时的值 |
| `checked-text` | `string` | `-` | 选中时的文字描述 |
| `unchecked-text` | `string` | `-` | 未选中时的文字描述 |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldesignChange` | 开关状态发生变化时的回调函数 | `(event: CustomEvent<string \| number \| boolean>) => void` |

## 无障碍

Switch 组件遵循 WAI-ARIA 规范：

- 支持键盘导航（Space 键切换状态）
- 提供 `aria-checked` 属性表示选中状态
- 提供 `aria-disabled` 属性表示禁用状态
- 支持屏幕阅读器
- 提供适当的焦点管理

## 设计指南

### 何时使用

- 需要表示开关状态，和 `checkbox` 的区别是，切换 `switch` 会直接触发状态改变，而 `checkbox` 一般用于状态标记，需要和提交操作配合。

### 何时不使用

- 当需要多选时，使用 Checkbox 复选框
- 当选项过多时，建议使用 Select 选择器

### 最佳实践

- 开关的标签应该清晰地描述其功能
- 使用一致的开关样式和行为
- 提供清晰的视觉反馈来表示当前状态
- 考虑使用文字描述来增强可理解性
