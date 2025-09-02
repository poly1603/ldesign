# ld-tooltip



<!-- Auto Generated Below -->


## Overview

Tooltip 提示框组件

简单的文字提示气泡框，在鼠标悬停时显示

## Properties

| Property             | Attribute               | Description  | Type                                                                                                                                                                 | Default     |
| -------------------- | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `arrowPointAtCenter` | `arrow-point-at-center` | 箭头是否指向目标元素中心 | `boolean`                                                                                                                                                            | `false`     |
| `content`            | `content`               | 提示内容         | `string`                                                                                                                                                             | `undefined` |
| `customClass`        | `custom-class`          | 自定义样式类名      | `string`                                                                                                                                                             | `undefined` |
| `disabled`           | `disabled`              | 是否禁用         | `boolean`                                                                                                                                                            | `false`     |
| `hideDelay`          | `hide-delay`            | 隐藏延迟（毫秒）     | `number`                                                                                                                                                             | `100`       |
| `placement`          | `placement`             | 显示位置         | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start"` | `'top'`     |
| `showDelay`          | `show-delay`            | 显示延迟（毫秒）     | `number`                                                                                                                                                             | `100`       |
| `trigger`            | `trigger`               | 触发方式         | `"click" \| "focus" \| "hover" \| "manual"`                                                                                                                          | `'hover'`   |
| `visible`            | `visible`               | 是否可见         | `boolean`                                                                                                                                                            | `false`     |
| `zIndex`             | `z-index`               | z-index 层级   | `number`                                                                                                                                                             | `1060`      |


## Events

| Event    | Description | Type                |
| -------- | ----------- | ------------------- |
| `ldHide` | 隐藏事件        | `CustomEvent<void>` |
| `ldShow` | 显示事件        | `CustomEvent<void>` |


## Methods

### `hide() => Promise<void>`

隐藏提示框

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

显示提示框

#### Returns

Type: `Promise<void>`



### `toggle() => Promise<void>`

切换显示状态

#### Returns

Type: `Promise<void>`



### `updatePosition() => Promise<void>`

更新位置

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
