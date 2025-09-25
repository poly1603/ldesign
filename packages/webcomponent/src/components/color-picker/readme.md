# ldesign-color-picker



<!-- Auto Generated Below -->


## Overview

ColorPicker 颜色选择器
- 支持 SV 色板 + Hue 滑条 + 可选 Alpha
- 支持 HEX/RGB/HSL/HSV 输入与预设/历史颜色

## Properties

| Property        | Attribute        | Description                                   | Type                                                                                                                                                                 | Default          |
| --------------- | ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `cancelText`    | `cancel-text`    |                                               | `string`                                                                                                                                                             | `'取消'`           |
| `confirmText`   | `confirm-text`   | 自定义按钮文案                                       | `string`                                                                                                                                                             | `'确定'`           |
| `customTrigger` | `custom-trigger` | 使用具名插槽自定义触发器（slot="trigger"）；为 true 时不渲染默认触发器 | `boolean`                                                                                                                                                            | `false`          |
| `disabled`      | `disabled`       |                                               | `boolean`                                                                                                                                                            | `false`          |
| `format`        | `format`         |                                               | `"hex" \| "hsl" \| "hsv" \| "rgb"`                                                                                                                                   | `'hex'`          |
| `gradientTypes` | `gradient-types` | 渐变类型：'linear' \| 'radial' \| 'both'（传递给面板）    | `"both" \| "linear" \| "radial"`                                                                                                                                     | `'both'`         |
| `hideOnSelect`  | `hide-on-select` | 选择后是否自动关闭弹层                                   | `boolean`                                                                                                                                                            | `true`           |
| `modes`         | `modes`          | 面板模式：'solid' \| 'gradient' \| 'both'          | `"both" \| "gradient" \| "solid"`                                                                                                                                    | `'both'`         |
| `placement`     | `placement`      | 弹出位置                                          | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start"` | `'bottom-start'` |
| `popupWidth`    | `popup-width`    | 设置弹层宽度（数字或 CSS 长度），panel 将铺满此宽度               | `number \| string`                                                                                                                                                   | `undefined`      |
| `presets`       | `presets`        |                                               | `string[]`                                                                                                                                                           | `[]`             |
| `recentMax`     | `recent-max`     |                                               | `number`                                                                                                                                                             | `12`             |
| `showActions`   | `show-actions`   | 是否显示“确定/取消”操作区（默认 false）                      | `boolean`                                                                                                                                                            | `false`          |
| `showAlpha`     | `show-alpha`     |                                               | `boolean`                                                                                                                                                            | `true`           |
| `showHistory`   | `show-history`   |                                               | `boolean`                                                                                                                                                            | `true`           |
| `showPreset`    | `show-preset`    |                                               | `boolean`                                                                                                                                                            | `true`           |
| `size`          | `size`           |                                               | `"large" \| "medium" \| "small"`                                                                                                                                     | `'medium'`       |
| `value`         | `value`          |                                               | `string`                                                                                                                                                             | `'#1677ff'`      |


## Events

| Event           | Description | Type                  |
| --------------- | ----------- | --------------------- |
| `ldesignChange` |             | `CustomEvent<string>` |
| `ldesignInput`  |             | `CustomEvent<string>` |


## Dependencies

### Depends on

- [ldesign-popup](../popup)
- [ldesign-color-picker-panel](../color-picker-panel)

### Graph
```mermaid
graph TD;
  ldesign-color-picker --> ldesign-popup
  ldesign-color-picker --> ldesign-color-picker-panel
  style ldesign-color-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
