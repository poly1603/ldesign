# ldesign-checkbox-group



<!-- Auto Generated Below -->


## Overview

CheckboxGroup 复选框组组件
管理一组复选框的状态

## Properties

| Property         | Attribute         | Description    | Type                                                      | Default        |
| ---------------- | ----------------- | -------------- | --------------------------------------------------------- | -------------- |
| `direction`      | `direction`       | 组方向            | `"horizontal" \| "vertical"`                              | `'horizontal'` |
| `disabled`       | `disabled`        | 是否禁用           | `boolean`                                                 | `false`        |
| `labelPlacement` | `label-placement` | 统一标签位置（可被子项覆盖） | `"left" \| "right"`                                       | `'right'`      |
| `max`            | `max`             | 最大可选数量         | `number`                                                  | `undefined`    |
| `min`            | `min`             | 最小可选数量         | `number`                                                  | `undefined`    |
| `shape`          | `shape`           | 统一形状（可被子项覆盖）   | `"round" \| "square"`                                     | `'square'`     |
| `size`           | `size`            | 复选框组尺寸         | `"large" \| "medium" \| "middle" \| "small"`              | `'medium'`     |
| `status`         | `status`          | 统一外观主题（可被子项覆盖） | `"brand" \| "danger" \| "info" \| "success" \| "warning"` | `'brand'`      |
| `value`          | --                | 绑定值            | `(string \| number)[]`                                    | `[]`           |
| `variant`        | `variant`         | 统一变体（可被子项覆盖）   | `"button" \| "default" \| "filled" \| "outline"`          | `'default'`    |


## Events

| Event           | Description  | Type                                |
| --------------- | ------------ | ----------------------------------- |
| `ldesignChange` | 当绑定值变化时触发的事件 | `CustomEvent<(string \| number)[]>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
