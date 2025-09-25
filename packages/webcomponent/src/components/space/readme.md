# ldesign-space

Space 间距组件：用于在一组元素之间提供一致的间距与对齐控制。

## 使用示例

- 基本用法（默认横向、medium 间距）
```html path=null start=null
<ldesign-space>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
</ldesign-space>
```

- 垂直间距
```html path=null start=null
<ldesign-space direction="vertical">
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
  <ldesign-button>Button</ldesign-button>
</ldesign-space>
```

- 间距大小（small / medium / large）
```html path=null start=null
<ldesign-space size="small">
  <ldesign-button>Small</ldesign-button>
  <ldesign-button>Small</ldesign-button>
</ldesign-space>
<ldesign-space size="medium">
  <ldesign-button>Medium</ldesign-button>
  <ldesign-button>Medium</ldesign-button>
</ldesign-space>
<ldesign-space size="large">
  <ldesign-button>Large</ldesign-button>
  <ldesign-button>Large</ldesign-button>
</ldesign-space>
```

- 自定义像素间距（number），如下为 12px
```html path=null start=null
<ldesign-space size="12">
  <ldesign-button>12px</ldesign-button>
  <ldesign-button>12px</ldesign-button>
  <ldesign-button>12px</ldesign-button>
</ldesign-space>
```

- 对齐方式（start / center / end / baseline）
```html path=null start=null
<ldesign-space align="start">
  <ldesign-button>Start</ldesign-button>
  <ldesign-button>Start</ldesign-button>
</ldesign-space>

<ldesign-space align="end">
  <ldesign-button>End</ldesign-button>
  <ldesign-button>End</ldesign-button>
</ldesign-space>

<ldesign-space direction="horizontal" align="baseline">
  <span style="font-size: 12px">Text 12</span>
  <span style="font-size: 20px">Text 20</span>
  <span style="font-size: 16px">Text 16</span>
</ldesign-space>
```

- 自动换行（break-line），常用于容器宽度不足时
```html path=null start=null
<div style="width: 260px; border: 1px dashed var(--ldesign-border-color); padding: 8px;">
  <ldesign-space break-line>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
    <ldesign-button>Button</ldesign-button>
  </ldesign-space>
</div>
```

- 组合嵌套
```html path=null start=null
<ldesign-space>
  <ldesign-button>Button</ldesign-button>
  <ldesign-space>
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button type="outline">Outline</ldesign-button>
  </ldesign-space>
  <ldesign-button type="text">Text</ldesign-button>
</ldesign-space>
```

- 设置分隔符（内置：line）
```html path=null start=null
<ldesign-space split="line">
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</ldesign-space>
```

> 下方为自动生成的属性与事件文档，构建后会自动更新。

<!-- Auto Generated Below -->


## Overview

Space 间距组件
用于在一组元素之间提供一致的间距与对齐控制

## Properties

| Property    | Attribute    | Description                                     | Type                                         | Default        |
| ----------- | ------------ | ----------------------------------------------- | -------------------------------------------- | -------------- |
| `align`     | `align`      | 交叉轴对齐方式                                         | `"baseline" \| "center" \| "end" \| "start"` | `'center'`     |
| `block`     | `block`      | 是否占满容器宽度                                        | `boolean`                                    | `false`        |
| `breakLine` | `break-line` | 是否自动换行（仅在横向时有效）                                 | `boolean`                                    | `false`        |
| `direction` | `direction`  | 间距方向                                            | `"horizontal" \| "vertical"`                 | `'horizontal'` |
| `size`      | `size`       | 间距尺寸。可选预设：small \| medium \| large；也可传数字，单位为 px | `number \| string`                           | `'medium'`     |
| `split`     | `split`      | 分隔符样式：none 不显示分隔符；line 使用 1px 分隔线               | `"line" \| "none"`                           | `'none'`       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
