# ldesign-split



<!-- Auto Generated Below -->


## Overview

Split 面板分割
将容器分为左右（vertical）或上下（horizontal）两部分，通过拖拽中间分割条调整比例。

- 组件名：<ldesign-split>
- 方向：vertical（左右）| horizontal（上下）
- 比例：value（0~1），表示起始面板所占比例。拖拽过程中会回写。
- 约束：firstMin / secondMin 用于限制两侧最小尺寸（px）。
- 事件：ldesignSplitStart / ldesignSplit / ldesignSplitEnd

## Properties

| Property                       | Attribute                          | Description                    | Type                         | Default      |
| ------------------------------ | ---------------------------------- | ------------------------------ | ---------------------------- | ------------ |
| `allowDragExpandWhenCollapsed` | `allow-drag-expand-when-collapsed` | 折叠状态下是否允许通过拖拽恢复                | `boolean`                    | `true`       |
| `collapsed`                    | `collapsed`                        | 折叠状态：none \| start \| end      | `"end" \| "none" \| "start"` | `'none'`     |
| `collapsedSize`                | `collapsed-size`                   | 折叠后保留的尺寸（px）                   | `number`                     | `0`          |
| `collapsible`                  | `collapsible`                      | 是否显示快捷折叠按钮                     | `boolean`                    | `false`      |
| `direction`                    | `direction`                        | 分割方向：vertical=左右，horizontal=上下 | `"horizontal" \| "vertical"` | `'vertical'` |
| `disabled`                     | `disabled`                         | 是否禁用拖拽                         | `boolean`                    | `false`      |
| `firstMin`                     | `first-min`                        | 起始/末尾面板的最小尺寸（px）               | `number`                     | `80`         |
| `secondMin`                    | `second-min`                       |                                | `number`                     | `80`         |
| `splitterSize`                 | `splitter-size`                    | 分割条厚度（px）                      | `number`                     | `6`          |
| `value`                        | `value`                            | 起始面板比例（0~1）。拖拽过程中会以小数写回        | `number`                     | `0.5`        |


## Events

| Event                  | Description | Type                                                                     |
| ---------------------- | ----------- | ------------------------------------------------------------------------ |
| `ldesignSplit`         |             | `CustomEvent<{ value: number; direction: "horizontal" \| "vertical"; }>` |
| `ldesignSplitCollapse` | 折叠切换事件      | `CustomEvent<{ side: "none" \| "start" \| "end"; }>`                     |
| `ldesignSplitEnd`      |             | `CustomEvent<{ value: number; direction: "horizontal" \| "vertical"; }>` |
| `ldesignSplitStart`    | 拖拽事件        | `CustomEvent<{ value: number; direction: "horizontal" \| "vertical"; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
