# ldesign-resize-box



<!-- Auto Generated Below -->


## Overview

ResizeBox 伸缩框
可通过拖拽指定边来改变容器宽高

## Properties

| Property     | Attribute    | Description                                                                 | Type                                                                         | Default          |
| ------------ | ------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| `controlled` | `controlled` | 受控模式：为 true 时，不会修改 width/height，外部应在事件中设置新值传回                               | `boolean`                                                                    | `false`          |
| `corners`    | `corners`    | 角落把手：top-left/top-right/bottom-right/bottom-left。字符串或数组。默认仅启用 bottom-right。 | `("top-left" \| "top-right" \| "bottom-left" \| "bottom-right")[] \| string` | `'bottom-right'` |
| `directions` | `directions` | 允许伸缩的边：top/right/bottom/left。默认允许 right 与 bottom，满足常见的“右/下/右下角”拖拽需求         | `("top" \| "left" \| "right" \| "bottom")[] \| string`                       | `'right,bottom'` |
| `disabled`   | `disabled`   | 是否禁用伸缩                                                                      | `boolean`                                                                    | `false`          |
| `height`     | `height`     | 初始高度。可传数字（px）或任何合法 CSS 高度值（如 'auto'）。拖拽后以 px 写回。                            | `number \| string`                                                           | `200`            |
| `maxHeight`  | `max-height` |                                                                             | `number`                                                                     | `undefined`      |
| `maxWidth`   | `max-width`  |                                                                             | `number`                                                                     | `undefined`      |
| `minHeight`  | `min-height` |                                                                             | `number`                                                                     | `60`             |
| `minWidth`   | `min-width`  | 最小/最大尺寸（px）                                                                 | `number`                                                                     | `80`             |
| `size`       | `size`       | 尺寸标识，仅影响样式（边框、把手大小等）                                                        | `"large" \| "medium" \| "middle" \| "small"`                                 | `'medium'`       |
| `snap`       | `snap`       | 吸附步进（px）。>0 时，拖拽尺寸会对齐到该步进的整数倍。                                              | `number`                                                                     | `0`              |
| `width`      | `width`      | 初始宽度。可传数字（px）或任何合法 CSS 宽度值（如 '100%'）。拖拽后以 px 写回。                            | `number \| string`                                                           | `360`            |


## Events

| Event                | Description   | Type                                                            |
| -------------------- | ------------- | --------------------------------------------------------------- |
| `ldesignResize`      |               | `CustomEvent<{ width: number; height: number; edge: string; }>` |
| `ldesignResizeEnd`   |               | `CustomEvent<{ width: number; height: number; edge: string; }>` |
| `ldesignResizeStart` | 拖拽开始/进行中/结束事件 | `CustomEvent<{ width: number; height: number; edge: string; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
