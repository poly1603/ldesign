# ldesign-radio-group



<!-- Auto Generated Below -->


## Overview

RadioGroup 单选框组组件
管理一组单选框的状态

## Properties

| Property    | Attribute   | Description | Type                                         | Default        |
| ----------- | ----------- | ----------- | -------------------------------------------- | -------------- |
| `direction` | `direction` | 排列方向        | `"horizontal" \| "vertical"`                 | `'horizontal'` |
| `disabled`  | `disabled`  | 是否禁用        | `boolean`                                    | `false`        |
| `name`      | `name`      | 组名称，用于原生表单  | `string`                                     | `undefined`    |
| `size`      | `size`      | 单选框组尺寸      | `"large" \| "medium" \| "middle" \| "small"` | `'medium'`     |
| `value`     | `value`     | 绑定值         | `number \| string`                           | `undefined`    |


## Events

| Event           | Description  | Type                            |
| --------------- | ------------ | ------------------------------- |
| `ldesignChange` | 当绑定值变化时触发的事件 | `CustomEvent<number \| string>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
