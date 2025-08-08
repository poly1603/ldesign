# 组件 API

本章节详细介绍 @ldesign/form 提供的所有组件及其 API。

## DynamicForm

动态表单组件，是 @ldesign/form 的核心组件。

### Props

| 属性         | 类型                  | 默认值  | 说明                |
| ------------ | --------------------- | ------- | ------------------- |
| `modelValue` | `Record<string, any>` | `{}`    | 表单数据（v-model） |
| `options`    | `FormOptions`         | -       | 表单配置选项        |
| `disabled`   | `boolean`             | `false` | 是否禁用整个表单    |
| `readonly`   | `boolean`             | `false` | 是否只读            |
| `loading`    | `boolean`             | `false` | 是否显示加载状态    |

### Events

| 事件名              | 参数                                                        | 说明         |
| ------------------- | ----------------------------------------------------------- | ------------ |
| `update:modelValue` | `(value: Record<string, any>)`                              | 表单数据更新 |
| `submit`            | `(data: Record<string, any>)`                               | 表单提交     |
| `reset`             | `()`                                                        | 表单重置     |
| `change`            | `(data: Record<string, any>)`                               | 表单数据变化 |
| `field-change`      | `(name: string, value: any, formData: Record<string, any>)` | 字段值变化   |
| `field-focus`       | `(name: string)`                                            | 字段获得焦点 |
| `field-blur`        | `(name: string)`                                            | 字段失去焦点 |
| `validate`          | `(result: ValidationResult)`                                | 表单验证完成 |

### Slots

| 插槽名               | 参数                                    | 说明               |
| -------------------- | --------------------------------------- | ------------------ |
| `default`            | `{ formData, fields, validate, reset }` | 自定义表单内容     |
| `header`             | `{ formData }`                          | 表单头部内容       |
| `footer`             | `{ formData, validate, reset, submit }` | 表单底部内容       |
| `field-{name}`       | `{ field, value, setValue, validate }`  | 自定义特定字段     |
| `field-label-{name}` | `{ field }`                             | 自定义字段标签     |
| `field-error-{name}` | `{ field, errors }`                     | 自定义字段错误信息 |

### 方法

通过 ref 可以调用以下方法：

| 方法名          | 参数                              | 返回值                | 说明               |
| --------------- | --------------------------------- | --------------------- | ------------------ |
| `validate`      | `(fieldNames?: string[])`         | `Promise<boolean>`    | 验证表单或指定字段 |
| `validateField` | `(fieldName: string)`             | `Promise<boolean>`    | 验证单个字段       |
| `reset`         | `()`                              | `void`                | 重置表单           |
| `resetField`    | `(fieldName: string)`             | `void`                | 重置单个字段       |
| `setFieldValue` | `(fieldName: string, value: any)` | `void`                | 设置字段值         |
| `getFieldValue` | `(fieldName: string)`             | `any`                 | 获取字段值         |
| `setFormData`   | `(data: Record<string, any>)`     | `void`                | 设置表单数据       |
| `getFormData`   | `()`                              | `Record<string, any>` | 获取表单数据       |
| `showField`     | `(fieldName: string)`             | `void`                | 显示字段           |
| `hideField`     | `(fieldName: string)`             | `void`                | 隐藏字段           |
| `enableField`   | `(fieldName: string)`             | `void`                | 启用字段           |
| `disableField`  | `(fieldName: string)`             | `void`                | 禁用字段           |

### 示例

```vue
<template>
  <DynamicForm
    ref="formRef"
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @field-change="handleFieldChange"
  >
    <template #header>
      <h2>用户信息</h2>
    </template>

    <template #field-username="{ field, value, setValue }">
      <CustomInput :value="value" @input="setValue" :placeholder="field.placeholder" />
    </template>

    <template #footer="{ validate, reset }">
      <div>
        <button @click="validate">验证</button>
        <button @click="reset">重置</button>
      </div>
    </template>
  </DynamicForm>
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formRef = ref()
const formData = ref({})

const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
    },
  ],
}

const handleSubmit = data => {
  console.log('提交:', data)
}

const handleFieldChange = (name, value) => {
  console.log('字段变化:', name, value)
}

// 调用组件方法
const validateForm = async () => {
  const isValid = await formRef.value.validate()
  console.log('验证结果:', isValid)
}
</script>
```

## FormInput

文本输入组件。

### Props

| 属性           | 类型                             | 默认值     | 说明                 |
| -------------- | -------------------------------- | ---------- | -------------------- |
| `modelValue`   | `string \| number`               | `''`       | 输入值               |
| `type`         | `string`                         | `'text'`   | 输入类型             |
| `placeholder`  | `string`                         | -          | 占位符               |
| `disabled`     | `boolean`                        | `false`    | 是否禁用             |
| `readonly`     | `boolean`                        | `false`    | 是否只读             |
| `maxlength`    | `number`                         | -          | 最大长度             |
| `minlength`    | `number`                         | -          | 最小长度             |
| `autocomplete` | `string`                         | -          | 自动完成             |
| `size`         | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸                 |
| `clearable`    | `boolean`                        | `false`    | 是否可清空           |
| `showPassword` | `boolean`                        | `false`    | 是否显示密码切换按钮 |
| `prefixIcon`   | `string`                         | -          | 前缀图标             |
| `suffixIcon`   | `string`                         | -          | 后缀图标             |

### Events

| 事件名              | 参数                        | 说明     |
| ------------------- | --------------------------- | -------- |
| `update:modelValue` | `(value: string \| number)` | 值更新   |
| `input`             | `(value: string \| number)` | 输入事件 |
| `change`            | `(value: string \| number)` | 值变化   |
| `focus`             | `(event: FocusEvent)`       | 获得焦点 |
| `blur`              | `(event: FocusEvent)`       | 失去焦点 |
| `clear`             | `()`                        | 清空内容 |

### Slots

| 插槽名   | 说明     |
| -------- | -------- |
| `prefix` | 前缀内容 |
| `suffix` | 后缀内容 |

## FormSelect

下拉选择组件。

### Props

| 属性           | 类型                                         | 默认值     | 说明         |
| -------------- | -------------------------------------------- | ---------- | ------------ |
| `modelValue`   | `any \| any[]`                               | -          | 选中值       |
| `options`      | `SelectOption[]`                             | `[]`       | 选项列表     |
| `multiple`     | `boolean`                                    | `false`    | 是否多选     |
| `filterable`   | `boolean`                                    | `false`    | 是否可搜索   |
| `clearable`    | `boolean`                                    | `false`    | 是否可清空   |
| `placeholder`  | `string`                                     | -          | 占位符       |
| `disabled`     | `boolean`                                    | `false`    | 是否禁用     |
| `size`         | `'small' \| 'medium' \| 'large'`             | `'medium'` | 尺寸         |
| `loading`      | `boolean`                                    | `false`    | 是否加载中   |
| `remote`       | `boolean`                                    | `false`    | 是否远程搜索 |
| `remoteMethod` | `(query: string) => Promise<SelectOption[]>` | -          | 远程搜索方法 |

### Types

```typescript
interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  children?: SelectOption[]
}
```

### Events

| 事件名              | 参数                    | 说明               |
| ------------------- | ----------------------- | ------------------ |
| `update:modelValue` | `(value: any \| any[])` | 值更新             |
| `change`            | `(value: any \| any[])` | 值变化             |
| `focus`             | `()`                    | 获得焦点           |
| `blur`              | `()`                    | 失去焦点           |
| `clear`             | `()`                    | 清空选择           |
| `visible-change`    | `(visible: boolean)`    | 下拉框显示状态变化 |

## FormCheckbox

复选框组件。

### Props

| 属性         | 类型                             | 默认值         | 说明         |
| ------------ | -------------------------------- | -------------- | ------------ |
| `modelValue` | `any[]`                          | `[]`           | 选中值数组   |
| `options`    | `CheckboxOption[]`               | `[]`           | 选项列表     |
| `disabled`   | `boolean`                        | `false`        | 是否禁用     |
| `size`       | `'small' \| 'medium' \| 'large'` | `'medium'`     | 尺寸         |
| `direction`  | `'horizontal' \| 'vertical'`     | `'horizontal'` | 排列方向     |
| `max`        | `number`                         | -              | 最大选择数量 |
| `min`        | `number`                         | -              | 最小选择数量 |

### Types

```typescript
interface CheckboxOption {
  label: string
  value: any
  disabled?: boolean
}
```

## FormRadio

单选框组件。

### Props

| 属性         | 类型                             | 默认值         | 说明     |
| ------------ | -------------------------------- | -------------- | -------- |
| `modelValue` | `any`                            | -              | 选中值   |
| `options`    | `RadioOption[]`                  | `[]`           | 选项列表 |
| `disabled`   | `boolean`                        | `false`        | 是否禁用 |
| `size`       | `'small' \| 'medium' \| 'large'` | `'medium'`     | 尺寸     |
| `direction`  | `'horizontal' \| 'vertical'`     | `'horizontal'` | 排列方向 |

### Types

```typescript
interface RadioOption {
  label: string
  value: any
  disabled?: boolean
}
```

## FormTextarea

多行文本输入组件。

### Props

| 属性            | 类型                                                | 默认值       | 说明         |
| --------------- | --------------------------------------------------- | ------------ | ------------ |
| `modelValue`    | `string`                                            | `''`         | 输入值       |
| `placeholder`   | `string`                                            | -            | 占位符       |
| `disabled`      | `boolean`                                           | `false`      | 是否禁用     |
| `readonly`      | `boolean`                                           | `false`      | 是否只读     |
| `rows`          | `number`                                            | `3`          | 行数         |
| `maxlength`     | `number`                                            | -            | 最大长度     |
| `resize`        | `'none' \| 'both' \| 'horizontal' \| 'vertical'`    | `'vertical'` | 调整大小     |
| `autosize`      | `boolean \| { minRows?: number, maxRows?: number }` | `false`      | 自适应高度   |
| `showWordLimit` | `boolean`                                           | `false`      | 显示字数统计 |

## FormDatePicker

日期选择组件。

### Props

| 属性           | 类型                                                     | 默认值         | 说明             |
| -------------- | -------------------------------------------------------- | -------------- | ---------------- |
| `modelValue`   | `Date \| string \| Date[] \| string[]`                   | -              | 选中日期         |
| `type`         | `'date' \| 'datetime' \| 'daterange' \| 'datetimerange'` | `'date'`       | 选择器类型       |
| `format`       | `string`                                                 | `'YYYY-MM-DD'` | 显示格式         |
| `valueFormat`  | `string`                                                 | -              | 值格式           |
| `placeholder`  | `string`                                                 | -              | 占位符           |
| `disabled`     | `boolean`                                                | `false`        | 是否禁用         |
| `clearable`    | `boolean`                                                | `true`         | 是否可清空       |
| `disabledDate` | `(date: Date) => boolean`                                | -              | 禁用日期判断函数 |

## FormTimePicker

时间选择组件。

### Props

| 属性          | 类型             | 默认值       | 说明       |
| ------------- | ---------------- | ------------ | ---------- |
| `modelValue`  | `string \| Date` | -            | 选中时间   |
| `format`      | `string`         | `'HH:mm:ss'` | 时间格式   |
| `placeholder` | `string`         | -            | 占位符     |
| `disabled`    | `boolean`        | `false`      | 是否禁用   |
| `clearable`   | `boolean`        | `true`       | 是否可清空 |
| `step`        | `string`         | `'00:01:00'` | 时间间隔   |

## FormSwitch

开关组件。

### Props

| 属性            | 类型                             | 默认值     | 说明             |
| --------------- | -------------------------------- | ---------- | ---------------- |
| `modelValue`    | `boolean \| string \| number`    | `false`    | 开关状态         |
| `disabled`      | `boolean`                        | `false`    | 是否禁用         |
| `size`          | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸             |
| `activeText`    | `string`                         | -          | 打开时的文字描述 |
| `inactiveText`  | `string`                         | -          | 关闭时的文字描述 |
| `activeValue`   | `boolean \| string \| number`    | `true`     | 打开时的值       |
| `inactiveValue` | `boolean \| string \| number`    | `false`    | 关闭时的值       |

## FormSlider

滑块组件。

### Props

| 属性          | 类型                     | 默认值  | 说明           |
| ------------- | ------------------------ | ------- | -------------- |
| `modelValue`  | `number \| number[]`     | `0`     | 滑块值         |
| `min`         | `number`                 | `0`     | 最小值         |
| `max`         | `number`                 | `100`   | 最大值         |
| `step`        | `number`                 | `1`     | 步长           |
| `disabled`    | `boolean`                | `false` | 是否禁用       |
| `range`       | `boolean`                | `false` | 是否为范围选择 |
| `showStops`   | `boolean`                | `false` | 是否显示间断点 |
| `showTooltip` | `boolean`                | `true`  | 是否显示提示   |
| `marks`       | `Record<number, string>` | -       | 标记           |

## FormRate

评分组件。

### Props

| 属性         | 类型       | 默认值  | 说明             |
| ------------ | ---------- | ------- | ---------------- |
| `modelValue` | `number`   | `0`     | 评分值           |
| `max`        | `number`   | `5`     | 最大评分         |
| `disabled`   | `boolean`  | `false` | 是否禁用         |
| `allowHalf`  | `boolean`  | `false` | 是否允许半选     |
| `showText`   | `boolean`  | `false` | 是否显示辅助文字 |
| `texts`      | `string[]` | -       | 辅助文字数组     |
| `colors`     | `string[]` | -       | 颜色数组         |
