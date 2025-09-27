# ldesign-drawer



<!-- Auto Generated Below -->


## Overview

Drawer 抽屉组件
从屏幕边缘滑出一个面板，常用于显示导航、表单或详情

## Properties

| Property       | Attribute       | Description                                            | Type                                     | Default     |
| -------------- | --------------- | ------------------------------------------------------ | ---------------------------------------- | ----------- |
| `closable`     | `closable`      | 是否显示右上角关闭按钮                                            | `boolean`                                | `true`      |
| `closeOnEsc`   | `close-on-esc`  | 是否允许按下 ESC 关闭                                          | `boolean`                                | `true`      |
| `drawerTitle`  | `drawer-title`  | 标题文本（可通过 slot=header 自定义头部）                            | `string`                                 | `undefined` |
| `getContainer` | `get-container` | 容器（选择器或元素）：若提供，则把组件节点移动到该容器下                           | `HTMLElement \| string`                  | `undefined` |
| `mask`         | `mask`          | 是否显示遮罩层                                                | `boolean`                                | `true`      |
| `maskClosable` | `mask-closable` | 点击遮罩是否关闭                                               | `boolean`                                | `true`      |
| `placement`    | `placement`     | 抽屉出现的位置                                                | `"bottom" \| "left" \| "right" \| "top"` | `'right'`   |
| `size`         | `size`          | 面板尺寸（left/right 为宽度，top/bottom 为高度）。可为数字（px）或任意 CSS 长度 | `number \| string`                       | `360`       |
| `visible`      | `visible`       | 是否显示抽屉                                                 | `boolean`                                | `false`     |
| `zIndex`       | `z-index`       | z-index                                                | `number`                                 | `1000`      |


## Events

| Event                  | Description | Type                   |
| ---------------------- | ----------- | ---------------------- |
| `ldesignClose`         | 事件：关闭       | `CustomEvent<void>`    |
| `ldesignVisibleChange` | 事件：可见性变化    | `CustomEvent<boolean>` |


## Methods

### `close() => Promise<void>`

关闭（等价于 hide），同时触发 close 事件

#### Returns

Type: `Promise<void>`



### `hide() => Promise<void>`

隐藏抽屉（带动画）

#### Returns

Type: `Promise<void>`



### `show(emit?: boolean) => Promise<void>`

显示抽屉

#### Parameters

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| `emit` | `boolean` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ldesign-cascader](../cascader)
 - [ldesign-time-picker](../time-picker)

### Depends on

- [ldesign-icon](../icon)

### Graph
```mermaid
graph TD;
  ldesign-drawer --> ldesign-icon
  ldesign-cascader --> ldesign-drawer
  ldesign-time-picker --> ldesign-drawer
  style ldesign-drawer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
