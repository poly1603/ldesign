# ld-form-item



<!-- Auto Generated Below -->


## Overview

FormItem 表单项组件

表单中的单个字段容器，提供标签、验证状态显示等功能

## Properties

| Property           | Attribute            | Description | Type                                   | Default     |
| ------------------ | -------------------- | ----------- | -------------------------------------- | ----------- |
| `customClass`      | `custom-class`       | 自定义样式类名     | `string`                               | `undefined` |
| `help`             | `help`               | 帮助文本        | `string`                               | `undefined` |
| `label`            | `label`              | 字段标签        | `string`                               | `undefined` |
| `labelAlign`       | `label-align`        | 标签对齐方式      | `"left" \| "right" \| "top"`           | `undefined` |
| `labelWidth`       | `label-width`        | 标签宽度        | `number \| string`                     | `undefined` |
| `prop`             | `prop`               | 字段属性名       | `string`                               | `undefined` |
| `required`         | `required`           | 是否必填        | `boolean`                              | `false`     |
| `rules`            | `rules`              | 验证规则        | `FormItemRule \| FormItemRule[]`       | `undefined` |
| `showValidateIcon` | `show-validate-icon` | 是否显示验证图标    | `boolean`                              | `true`      |
| `validateMessage`  | `validate-message`   | 验证消息        | `string`                               | `undefined` |
| `validateStatus`   | `validate-status`    | 验证状态        | `"error" \| "success" \| "validating"` | `undefined` |


## Events

| Event                    | Description | Type                                 |
| ------------------------ | ----------- | ------------------------------------ |
| `ldValidateStatusChange` | 验证状态变化事件    | `CustomEvent<FormItemValidateEvent>` |


## Methods

### `clearValidate() => Promise<void>`

清除验证状态

#### Returns

Type: `Promise<void>`



### `setValidateStatus(status: "validating" | "success" | "error", message?: string) => Promise<void>`

设置验证状态

#### Parameters

| Name      | Type                                   | Description |
| --------- | -------------------------------------- | ----------- |
| `status`  | `"error" \| "success" \| "validating"` |             |
| `message` | `string`                               |             |

#### Returns

Type: `Promise<void>`



### `validate() => Promise<FormItemValidateResult>`

验证字段

#### Returns

Type: `Promise<FormItemValidateResult>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
