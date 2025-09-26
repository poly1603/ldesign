# ldesign-countdown



<!-- Auto Generated Below -->


## Overview

Countdown 倒计时组件
支持按结束时间或时长倒计时，提供格式化显示、事件与方法控制

## Properties

| Property       | Attribute       | Description                                                    | Type                                                                    | Default      |
| -------------- | --------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| `autoStart`    | `auto-start`    | 是否在初始化时自动开始                                                    | `boolean`                                                               | `true`       |
| `circleSize`   | `circle-size`   | 环形进度的像素尺寸（正方形）                                                 | `number`                                                                | `undefined`  |
| `circleStroke` | `circle-stroke` | 环形进度的描边宽度                                                      | `number`                                                                | `4`          |
| `endTime`      | `end-time`      | 绝对结束时间（优先级高于 value），支持时间戳、日期字符串或 Date 对象                       | `Date \| number \| string`                                              | `undefined`  |
| `format`       | `format`        | 显示格式，支持 DD、HH、mm、ss、SSS 令牌组合                                   | `string`                                                                | `'HH:mm:ss'` |
| `label`        | `title`         | 可选标题文本（展示在数值前）。属性名仍使用 title，避免与 HTMLElement.prototype.title 冲突 | `string`                                                                | `undefined`  |
| `millisecond`  | `millisecond`   | 是否以更高频率更新毫秒（约 50ms 一次）。为 false 时每秒更新一次                         | `boolean`                                                               | `false`      |
| `paused`       | `paused`        | 是否暂停（受控）                                                       | `boolean`                                                               | `false`      |
| `progressAs`   | `progress-as`   | 进度展示采用已消耗还是剩余（用于 progress-* 样式）                                | `"elapsed" \| "remaining"`                                              | `'elapsed'`  |
| `showUnit`     | `show-unit`     | 是否在分段/翻牌样式中显示单位（天/时/分/秒/毫秒）                                    | `boolean`                                                               | `false`      |
| `size`         | `size`          | 尺寸（对齐其他组件的 size 体系）                                            | `"large" \| "medium" \| "middle" \| "small"`                            | `'middle'`   |
| `value`        | `value`         | 倒计时时长（毫秒）。当未提供 endTime 时，以当前时间为起点倒计时 value 毫秒                  | `number`                                                                | `undefined`  |
| `variant`      | `variant`       | 展现形式：文本、分段、翻牌、进度条、环形进度                                         | `"flip" \| "progress-circle" \| "progress-line" \| "segment" \| "text"` | `'text'`     |


## Events

| Event           | Description     | Type                                                     |
| --------------- | --------------- | -------------------------------------------------------- |
| `ldesignChange` | 变化事件：倒计时数值变化时触发 | `CustomEvent<{ remaining: number; formatted: string; }>` |
| `ldesignFinish` | 完成事件：倒计时结束时触发   | `CustomEvent<void>`                                      |


## Methods

### `pause() => Promise<void>`

暂停倒计时（不会重置剩余时间）

#### Returns

Type: `Promise<void>`



### `reset() => Promise<void>`

重置并（在 autoStart=true 且未暂停时）重新开始

#### Returns

Type: `Promise<void>`



### `start() => Promise<void>`

开始/继续倒计时

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
