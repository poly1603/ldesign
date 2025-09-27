# ldesign-row



<!-- Auto Generated Below -->


## Overview

Row 行容器
- 作为一行的网格容器
- 可独立配置列数与间距，或继承上级 ldesign-grid 的默认值

## Properties

| Property | Attribute | Description                                           | Type               | Default     |
| -------- | --------- | ----------------------------------------------------- | ------------------ | ----------- |
| `cols`   | `cols`    | 每行的列数；未设置时将继承上级 ldesign-grid 的 cols（默认 24）            | `number`           | `undefined` |
| `dense`  | `dense`   | 是否密集填充（尽量填补空位）；未设置时继承上级 grid，默认 true                  | `boolean`          | `undefined` |
| `gap`    | `gap`     | 统一间距（横纵同时生效），number 视为 px；未设置则继承上级 ldesign-grid 的 gap | `number \| string` | `undefined` |
| `xGap`   | `x-gap`   | 横向列间距；未设置时取 gap，再继承上级 grid 的 x-gap/gap                | `number \| string` | `undefined` |
| `yGap`   | `y-gap`   | 纵向行间距；未设置时取 gap，再继承上级 grid 的 y-gap/gap                | `number \| string` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
