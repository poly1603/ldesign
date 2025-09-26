# ldesign-draggable



<!-- Auto Generated Below -->


## Overview

ldesign-draggable
通用可拖拽/缩放/旋转容器（图片优先），支持：
- PC：滚轮缩放、拖拽平移、双击 1x/2x 切换
- 移动端：双指缩放+旋转、单指平移、松手回弹、动量滚动

用法：
1) 直接传入 src 渲染图片
   <ldesign-draggable src="/big.jpg" style="width:100%;height:100%" />
2) 插槽自定义内容（若无 src）：
   <ldesign-draggable style="width:100%;height:100%">
     <img src="/big.jpg" />
   </ldesign-draggable>

## Properties

| Property         | Attribute          | Description           | Type      | Default     |
| ---------------- | ------------------ | --------------------- | --------- | ----------- |
| `alt`            | `alt`              |                       | `string`  | `undefined` |
| `doubleTapZoom`  | `double-tap-zoom`  | 双击切换到的缩放倍数            | `number`  | `2`         |
| `enableRotate`   | `enable-rotate`    | 是否允许旋转（移动端双指）         | `boolean` | `true`      |
| `initialOffsetX` | `initial-offset-x` |                       | `number`  | `0`         |
| `initialOffsetY` | `initial-offset-y` |                       | `number`  | `0`         |
| `initialRotate`  | `initial-rotate`   |                       | `number`  | `0`         |
| `initialScale`   | `initial-scale`    | 初始状态                  | `number`  | `1`         |
| `maxScale`       | `max-scale`        |                       | `number`  | `4`         |
| `minScale`       | `min-scale`        | 最小/最大缩放               | `number`  | `0.25`      |
| `src`            | `src`              | 若提供则内部渲染 img；否则使用默认插槽 | `string`  | `undefined` |
| `wheelZoom`      | `wheel-zoom`       | PC 滚轮缩放               | `boolean` | `true`      |
| `zoomStep`       | `zoom-step`        | 缩放步进（滚轮/按钮）           | `number`  | `0.1`       |


## Events

| Event                    | Description | Type                                                                                |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------- |
| `ldesignGestureEnd`      |             | `CustomEvent<void>`                                                                 |
| `ldesignGestureStart`    |             | `CustomEvent<void>`                                                                 |
| `ldesignTransformChange` |             | `CustomEvent<{ scale: number; rotate: number; offsetX: number; offsetY: number; }>` |


## Methods

### `getState() => Promise<{ scale: number; rotate: number; offsetX: number; offsetY: number; }>`



#### Returns

Type: `Promise<{ scale: number; rotate: number; offsetX: number; offsetY: number; }>`



### `getTransformString() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `reset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setOffsets(x: number, y: number) => Promise<void>`



#### Parameters

| Name | Type     | Description |
| ---- | -------- | ----------- |
| `x`  | `number` |             |
| `y`  | `number` |             |

#### Returns

Type: `Promise<void>`



### `setRotate(deg: number) => Promise<void>`



#### Parameters

| Name  | Type     | Description |
| ----- | -------- | ----------- |
| `deg` | `number` |             |

#### Returns

Type: `Promise<void>`



### `zoomTo(scale: number, clientX?: number, clientY?: number) => Promise<void>`



#### Parameters

| Name      | Type     | Description |
| --------- | -------- | ----------- |
| `scale`   | `number` |             |
| `clientX` | `number` |             |
| `clientY` | `number` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
