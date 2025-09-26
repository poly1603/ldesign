# ldesign-picker



<!-- Auto Generated Below -->


## Overview

ldesign-picker
通用滚轮选择器（单列）
- PC：鼠标滚轮按“行”步进，按速度取整步数
- 移动端：手势滑动（Pointer Events）+ 惯性 + 吸附到最近项
- 支持配置容器高度与每项高度；容器通常为 itemHeight 的奇数倍（3/5/7...）
- 正中间指示器高度与子项一致

## Properties

| Property       | Attribute       | Description                               | Type                             | Default     |
| -------------- | --------------- | ----------------------------------------- | -------------------------------- | ----------- |
| `defaultValue` | `default-value` | 默认值（非受控）                                  | `string`                         | `undefined` |
| `disabled`     | `disabled`      | 是否禁用                                      | `boolean`                        | `false`     |
| `friction`     | `friction`      | 惯性摩擦 0-1（越小减速越快）                          | `number`                         | `0.92`      |
| `itemHeight`   | `item-height`   | 行高（自动根据 size 推导，亦可显式覆盖）                   | `number`                         | `undefined` |
| `momentum`     | `momentum`      | 是否启用惯性                                    | `boolean`                        | `true`      |
| `options`      | `options`       | 选项列表（数组或 JSON 字符串）                        | `PickerOption[] \| string`       | `[]`        |
| `panelHeight`  | `panel-height`  | 可视高度（优先），未设置时使用 visibleItems * itemHeight | `number`                         | `undefined` |
| `resistance`   | `resistance`    | 边界阻力系数 0-1（越小阻力越大）                        | `number`                         | `0.35`      |
| `size`         | `size`          | 尺寸，影响每行高度                                 | `"large" \| "medium" \| "small"` | `'medium'`  |
| `value`        | `value`         | 当前值（受控）                                   | `string`                         | `undefined` |
| `visibleItems` | `visible-items` | 可视条目数（未显式 panelHeight 时生效，建议奇数：3/5/7）     | `number`                         | `5`         |


## Events

| Event           | Description        | Type                                                                                                                                     |
| --------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `ldesignChange` | 选中项变化（最终吸附后触发）     | `CustomEvent<{ value: string; option?: PickerOption; }>`                                                                                 |
| `ldesignPick`   | 选择过程事件（滚动/拖拽中也会触发） | `CustomEvent<{ value: string; option?: PickerOption; context: { trigger: "scroll" \| "click" \| "wheel" \| "keyboard" \| "touch"; }; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
