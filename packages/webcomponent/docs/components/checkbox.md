# Checkbox 复选框

在一组备选项中进行多选。

## 基础用法

单独使用可以表示两种状态之间的切换，写在标签中的内容为 checkbox 按钮后的介绍。

<div class="demo-container">
  <ldesign-checkbox>备选项</ldesign-checkbox>
</div>

```html
<ldesign-checkbox>备选项</ldesign-checkbox>
```

## 禁用状态

多选框不可用状态。

<div class="demo-container">
  <ldesign-checkbox disabled>备选项1</ldesign-checkbox>
  <ldesign-checkbox checked disabled>备选项2</ldesign-checkbox>
</div>

```html
<ldesign-checkbox disabled>备选项1</ldesign-checkbox>
<ldesign-checkbox checked disabled>备选项2</ldesign-checkbox>
```

## 多选框组

适用于多个勾选框绑定到同一个数组的情景，通过是否勾选来表示这一组选项中选中的项。

<div class="demo-container">
  <ldesign-checkbox-group>
    <ldesign-checkbox value="apple">苹果</ldesign-checkbox>
    <ldesign-checkbox value="orange">橙子</ldesign-checkbox>
    <ldesign-checkbox value="banana">香蕉</ldesign-checkbox>
  </ldesign-checkbox-group>
</div>

```html
<ldesign-checkbox-group>
  <ldesign-checkbox value="apple">苹果</ldesign-checkbox>
  <ldesign-checkbox value="orange">橙子</ldesign-checkbox>
  <ldesign-checkbox value="banana">香蕉</ldesign-checkbox>
</ldesign-checkbox-group>
```

## 半选状态

`indeterminate` 属性用以表示 checkbox 的不确定状态，一般用于实现全选的效果。

<div class="demo-container">
  <ldesign-checkbox indeterminate>全选</ldesign-checkbox>
  <div style="margin: 15px 0;"></div>
  <ldesign-checkbox-group>
    <ldesign-checkbox value="option1">选项1</ldesign-checkbox>
    <ldesign-checkbox value="option2">选项2</ldesign-checkbox>
    <ldesign-checkbox value="option3">选项3</ldesign-checkbox>
  </ldesign-checkbox-group>
</div>

```html
<ldesign-checkbox indeterminate>全选</ldesign-checkbox>
<ldesign-checkbox-group>
  <ldesign-checkbox value="option1">选项1</ldesign-checkbox>
  <ldesign-checkbox value="option2">选项2</ldesign-checkbox>
  <ldesign-checkbox value="option3">选项3</ldesign-checkbox>
</ldesign-checkbox-group>
```

## 可选项目数量的限制

使用 `min` 和 `max` 属性能够限制可以被勾选的项目的数量。

<div class="demo-container">
  <ldesign-checkbox-group min="1" max="2">
    <ldesign-checkbox value="shanghai">上海</ldesign-checkbox>
    <ldesign-checkbox value="beijing">北京</ldesign-checkbox>
    <ldesign-checkbox value="guangzhou">广州</ldesign-checkbox>
    <ldesign-checkbox value="shenzhen">深圳</ldesign-checkbox>
  </ldesign-checkbox-group>
</div>

```html
<ldesign-checkbox-group min="1" max="2">
  <ldesign-checkbox value="shanghai">上海</ldesign-checkbox>
  <ldesign-checkbox value="beijing">北京</ldesign-checkbox>
  <ldesign-checkbox value="guangzhou">广州</ldesign-checkbox>
  <ldesign-checkbox value="shenzhen">深圳</ldesign-checkbox>
</ldesign-checkbox-group>
```

## 按钮样式

按钮样式的多选组合。

<div class="demo-container">
  <ldesign-checkbox-group>
    <ldesign-checkbox value="shanghai" button>上海</ldesign-checkbox>
    <ldesign-checkbox value="beijing" button>北京</ldesign-checkbox>
    <ldesign-checkbox value="guangzhou" button>广州</ldesign-checkbox>
    <ldesign-checkbox value="shenzhen" button>深圳</ldesign-checkbox>
  </ldesign-checkbox-group>
</div>

```html
<ldesign-checkbox-group>
  <ldesign-checkbox value="shanghai" button>上海</ldesign-checkbox>
  <ldesign-checkbox value="beijing" button>北京</ldesign-checkbox>
  <ldesign-checkbox value="guangzhou" button>广州</ldesign-checkbox>
  <ldesign-checkbox value="shenzhen" button>深圳</ldesign-checkbox>
</ldesign-checkbox-group>
```

## 带有边框

设置 `border` 属性可以渲染为带有边框的多选框。

<div class="demo-container">
  <ldesign-checkbox border>选项1</ldesign-checkbox>
  <ldesign-checkbox border checked>选项2</ldesign-checkbox>
</div>

```html
<ldesign-checkbox border>选项1</ldesign-checkbox>
<ldesign-checkbox border checked>选项2</ldesign-checkbox>
```

## API

### Checkbox 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |
| `value` | `string \| number` | `-` | 选中状态的值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `indeterminate` | `boolean` | `false` | 设置半选状态，只负责样式控制 |
| `border` | `boolean` | `false` | 是否显示边框 |
| `button` | `boolean` | `false` | 是否为按钮样式 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 多选框的尺寸 |

### CheckboxGroup 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `Array<string \| number>` | `[]` | 绑定值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `min` | `number` | `-` | 可被勾选的 checkbox 的最小数量 |
| `max` | `number` | `-` | 可被勾选的 checkbox 的最大数量 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 多选框组尺寸 |

### Checkbox 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignChange` | 当绑定值变化时触发的事件 | `(event: CustomEvent<boolean>) => void` |

### CheckboxGroup 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignChange` | 当绑定值变化时触发的事件 | `(event: CustomEvent<Array<string \| number>>) => void` |

## 无障碍

Checkbox 组件遵循 WAI-ARIA 规范：

- 支持键盘导航（Space 键切换选中状态）
- 提供 `aria-checked` 属性表示选中状态
- 提供 `aria-disabled` 属性表示禁用状态
- 支持屏幕阅读器
- 提供适当的焦点管理

## 设计指南

### 何时使用

- 在一组可选项中进行多项选择时
- 单独使用用于标记切换是与否

### 何时不使用

- 当选项之间是互斥的时候，请使用单选框

### 最佳实践

- 复选框的标签应该清晰地描述选项
- 使用复选框组时，应该提供清晰的组标题
- 对于必选项，应该有明确的标识
- 避免使用过多的复选框选项，考虑使用其他组件如下拉选择器
