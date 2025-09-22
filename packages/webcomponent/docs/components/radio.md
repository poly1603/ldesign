# Radio 单选框

在一组备选项中进行单选。

## 基础用法

由于选项默认可见，不宜过多，若选项过多，建议使用 Select 选择器。

<div class="demo-container">
  <ldesign-radio-group>
    <ldesign-radio value="1">备选项1</ldesign-radio>
    <ldesign-radio value="2">备选项2</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group>
  <ldesign-radio value="1">备选项1</ldesign-radio>
  <ldesign-radio value="2">备选项2</ldesign-radio>
</ldesign-radio-group>
```

## 禁用状态

单选框不可用的状态。

<div class="demo-container">
  <ldesign-radio-group>
    <ldesign-radio value="1" disabled>备选项1</ldesign-radio>
    <ldesign-radio value="2">备选项2</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group>
  <ldesign-radio value="1" disabled>备选项1</ldesign-radio>
  <ldesign-radio value="2">备选项2</ldesign-radio>
</ldesign-radio-group>
```

## 单选框组

适用于在多个互斥的选项中选择的场景。

<div class="demo-container">
  <ldesign-radio-group value="shanghai">
    <ldesign-radio value="shanghai">上海</ldesign-radio>
    <ldesign-radio value="beijing">北京</ldesign-radio>
    <ldesign-radio value="guangzhou">广州</ldesign-radio>
    <ldesign-radio value="shenzhen">深圳</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group value="shanghai">
  <ldesign-radio value="shanghai">上海</ldesign-radio>
  <ldesign-radio value="beijing">北京</ldesign-radio>
  <ldesign-radio value="guangzhou">广州</ldesign-radio>
  <ldesign-radio value="shenzhen">深圳</ldesign-radio>
</ldesign-radio-group>
```

## 按钮样式

按钮样式的单选组合。

<div class="demo-container">
  <ldesign-radio-group value="shanghai">
    <ldesign-radio value="shanghai" button>上海</ldesign-radio>
    <ldesign-radio value="beijing" button>北京</ldesign-radio>
    <ldesign-radio value="guangzhou" button>广州</ldesign-radio>
    <ldesign-radio value="shenzhen" button>深圳</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group value="shanghai">
  <ldesign-radio value="shanghai" button>上海</ldesign-radio>
  <ldesign-radio value="beijing" button>北京</ldesign-radio>
  <ldesign-radio value="guangzhou" button>广州</ldesign-radio>
  <ldesign-radio value="shenzhen" button>深圳</ldesign-radio>
</ldesign-radio-group>
```

## 带有边框

设置 `border` 属性可以渲染为带有边框的单选框。

<div class="demo-container">
  <ldesign-radio-group>
    <ldesign-radio value="1" border>选项1</ldesign-radio>
    <ldesign-radio value="2" border>选项2</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group>
  <ldesign-radio value="1" border>选项1</ldesign-radio>
  <ldesign-radio value="2" border>选项2</ldesign-radio>
</ldesign-radio-group>
```

## 尺寸

Radio 的尺寸，仅在 border 为真时有效。

<div class="demo-container">
  <ldesign-radio-group>
    <ldesign-radio value="1" border size="large">大型</ldesign-radio>
    <ldesign-radio value="2" border size="medium">中等</ldesign-radio>
    <ldesign-radio value="3" border size="small">小型</ldesign-radio>
  </ldesign-radio-group>
</div>

```html
<ldesign-radio-group>
  <ldesign-radio value="1" border size="large">大型</ldesign-radio>
  <ldesign-radio value="2" border size="medium">中等</ldesign-radio>
  <ldesign-radio value="3" border size="small">小型</ldesign-radio>
</ldesign-radio-group>
```

## 垂直排列

设置 `direction="vertical"` 可以让单选框垂直排列。

<div class="demo-container">
  <ldesign-radio-group direction="vertical">
    <ldesign-radio value="1">备选项1</ldesign-radio>
    <ldesign-radio value="2">备选项2</ldesign-radio>
    <ldesign-radio value="3">备选项3</ldesign-radio>
  </ldesign-radio-group>
</div>



```html
<ldesign-radio-group direction="vertical">
  <ldesign-radio value="1">备选项1</ldesign-radio>
  <ldesign-radio value="2">备选项2</ldesign-radio>
  <ldesign-radio value="3">备选项3</ldesign-radio>
</ldesign-radio-group>
```

## API

### Radio 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `string \| number` | `-` | 单选框的值 |
| `checked` | `boolean` | `false` | 是否选中 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `border` | `boolean` | `false` | 是否显示边框 |
| `button` | `boolean` | `false` | 是否为按钮样式 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 单选框的尺寸 |

### RadioGroup 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `string \| number` | `-` | 绑定值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 单选框组尺寸 |

### Radio 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignChange` | 绑定值变化时触发 | `(event: CustomEvent<string \| number>) => void` |

### RadioGroup 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignChange` | 绑定值变化时触发 | `(event: CustomEvent<string \| number>) => void` |

## 无障碍

Radio 组件遵循 WAI-ARIA 规范：

- 支持键盘导航（方向键切换选项，Space 键选中）
- 提供 `aria-checked` 属性表示选中状态
- 提供 `aria-disabled` 属性表示禁用状态
- 支持屏幕阅读器
- 提供适当的焦点管理
- 单选框组具有 `role="radiogroup"` 属性

## 设计指南

### 何时使用

- 用于在多个互斥的选项中选择一个
- 当选项少于 7 个时推荐使用
- 当用户需要看到所有可选项时

### 何时不使用

- 当选项过多时，建议使用 Select 选择器
- 当需要多选时，使用 Checkbox 复选框

### 最佳实践

- 单选框的标签应该清晰地描述选项
- 使用单选框组时，应该提供清晰的组标题
- 默认应该有一个选项被选中
- 选项的排列应该有逻辑顺序（如按重要性、字母顺序等）
- 避免使用过多的单选框选项
