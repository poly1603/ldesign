# ldesign-avatar

头像组件，支持图片、图标与文字三种形态，内置文本自动缩放、徽标、组合展示等能力。

> 完整使用文档见 packages/webcomponent/docs/components/avatar.md

## 基本用法

```html path=null start=null
<ldesign-avatar src="https://i.pravatar.cc/100?img=1"></ldesign-avatar>
<ldesign-avatar icon="user"></ldesign-avatar>
<ldesign-avatar text="U" background="#fa8c16"></ldesign-avatar>
```

<!-- Auto Generated Below -->


## Overview

Avatar.Group 头像组合
- 支持溢出显示 +N
- 支持统一 size/shape
- 支持重叠间距（gap）

## Properties

| Property      | Attribute      | Description           | Type                                                   | Default     |
| ------------- | -------------- | --------------------- | ------------------------------------------------------ | ----------- |
| `borderColor` | `border-color` | 边框颜色（用于实现“描边”效果以区分重叠） | `string`                                               | `'#fff'`    |
| `gap`         | `gap`          | 重叠间距（正值，单位px），默认 8    | `number`                                               | `8`         |
| `max`         | `max`          | 展示的最大头像数；超出后折叠为 +N    | `number`                                               | `undefined` |
| `shape`       | `shape`        | 统一形状（未在子项显式指定时生效）     | `"circle" \| "square"`                                 | `undefined` |
| `size`        | `size`         | 统一尺寸（未在子项显式指定时生效）     | `"large" \| "medium" \| "middle" \| "small" \| number` | `undefined` |


## Dependencies

### Depends on

- [ldesign-avatar](.)

### Graph
```mermaid
graph TD;
  ldesign-avatar-group --> ldesign-avatar
  ldesign-avatar --> ldesign-icon
  style ldesign-avatar-group fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
