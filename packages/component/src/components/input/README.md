# ld-input



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                                                                      | Default      |
| --------------- | ---------------- | ----------- | ----------------------------------------------------------------------------------------- | ------------ |
| `addonAfter`    | `addon-after`    | 输入框后置标签     | `string`                                                                                  | `undefined`  |
| `addonBefore`   | `addon-before`   | 输入框前置标签     | `string`                                                                                  | `undefined`  |
| `autocomplete`  | `autocomplete`   | 自动完成        | `string`                                                                                  | `undefined`  |
| `autofocus`     | `autofocus`      | 自动聚焦        | `boolean`                                                                                 | `false`      |
| `autosize`      | `autosize`       | 是否自动调整高度    | `boolean`                                                                                 | `false`      |
| `clearable`     | `clearable`      | 是否允许清空      | `boolean`                                                                                 | `false`      |
| `customClass`   | `custom-class`   | 自定义 CSS 类名  | `string`                                                                                  | `undefined`  |
| `customStyle`   | `custom-style`   | 自定义内联样式     | `{ [key: string]: string; }`                                                              | `undefined`  |
| `defaultValue`  | `default-value`  | 默认值         | `string`                                                                                  | `undefined`  |
| `disabled`      | `disabled`       | 是否禁用        | `boolean`                                                                                 | `false`      |
| `errorMessage`  | `error-message`  | 错误消息        | `string`                                                                                  | `undefined`  |
| `helpText`      | `help-text`      | 帮助文本        | `string`                                                                                  | `undefined`  |
| `inputmode`     | `inputmode`      | 输入模式        | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"`     | `undefined`  |
| `max`           | `max`            | 最大值         | `number \| string`                                                                        | `undefined`  |
| `maxRows`       | `max-rows`       | 文本域最大行数     | `number`                                                                                  | `undefined`  |
| `maxlength`     | `maxlength`      | 最大长度        | `number`                                                                                  | `undefined`  |
| `min`           | `min`            | 最小值         | `number \| string`                                                                        | `undefined`  |
| `minRows`       | `min-rows`       | 文本域最小行数     | `number`                                                                                  | `undefined`  |
| `minlength`     | `minlength`      | 最小长度        | `number`                                                                                  | `undefined`  |
| `name`          | `name`           | 表单控件名称      | `string`                                                                                  | `undefined`  |
| `placeholder`   | `placeholder`    | 占位符文本       | `string`                                                                                  | `undefined`  |
| `prefixContent` | `prefix-content` | 前缀文本        | `string`                                                                                  | `undefined`  |
| `prefixIcon`    | `prefix-icon`    | 前缀图标        | `string`                                                                                  | `undefined`  |
| `readonly`      | `readonly`       | 是否只读        | `boolean`                                                                                 | `false`      |
| `required`      | `required`       | 是否必填        | `boolean`                                                                                 | `false`      |
| `resize`        | `resize`         | 是否可调整大小     | `boolean`                                                                                 | `true`       |
| `rows`          | `rows`           | 文本域行数       | `number`                                                                                  | `3`          |
| `showCount`     | `show-count`     | 是否显示字符计数    | `boolean`                                                                                 | `false`      |
| `showPassword`  | `show-password`  | 是否显示密码切换按钮  | `boolean`                                                                                 | `false`      |
| `size`          | `size`           | 输入框尺寸       | `"large" \| "medium" \| "small"`                                                          | `'medium'`   |
| `spellcheck`    | `spellcheck`     | 拼写检查        | `boolean`                                                                                 | `true`       |
| `status`        | `status`         | 输入框状态       | `"default" \| "error" \| "info" \| "primary" \| "success" \| "warning"`                   | `undefined`  |
| `step`          | `step`           | 步长          | `number \| string`                                                                        | `undefined`  |
| `suffix`        | `suffix`         | 后缀文本        | `string`                                                                                  | `undefined`  |
| `suffixIcon`    | `suffix-icon`    | 后缀图标        | `string`                                                                                  | `undefined`  |
| `tabindex`      | `tabindex`       | Tab 索引      | `number`                                                                                  | `undefined`  |
| `type`          | `type`           | 输入框类型       | `"email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "textarea" \| "url"` | `'text'`     |
| `value`         | `value`          | 输入框值        | `string`                                                                                  | `undefined`  |
| `variant`       | `variant`        | 输入框变体       | `"borderless" \| "filled" \| "outlined"`                                                  | `'outlined'` |


## Events

| Event                        | Description | Type                                  |
| ---------------------------- | ----------- | ------------------------------------- |
| `ldBlur`                     | 失焦事件        | `CustomEvent<InputFocusEventDetail>`  |
| `ldChange`                   | 变化事件        | `CustomEvent<InputChangeEventDetail>` |
| `ldClear`                    | 清空事件        | `CustomEvent<InputClearEventDetail>`  |
| `ldEnter`                    | 回车事件        | `CustomEvent<KeyboardEvent>`          |
| `ldFocus`                    | 聚焦事件        | `CustomEvent<InputFocusEventDetail>`  |
| `ldInput`                    | 输入事件        | `CustomEvent<InputInputEventDetail>`  |
| `ldPasswordVisibilityToggle` | 密码可见性切换事件   | `CustomEvent<boolean>`                |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
