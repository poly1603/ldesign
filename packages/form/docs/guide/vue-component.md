# Vue 组件

@ldesign/form 提供了多种 Vue 组件，让你可以灵活地构建表单界面。

## DynamicForm 组件

`DynamicForm` 是核心组件，通过配置对象动态生成表单。

### 基础用法

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})

const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      required: true,
    },
  ],
}

const handleSubmit = data => {
  console.log('表单数据:', data)
}
</script>
```

### Props

| 属性         | 类型          | 默认值  | 说明             |
| ------------ | ------------- | ------- | ---------------- |
| `modelValue` | `Object`      | `{}`    | 表单数据         |
| `options`    | `FormOptions` | -       | 表单配置         |
| `disabled`   | `Boolean`     | `false` | 是否禁用整个表单 |
| `readonly`   | `Boolean`     | `false` | 是否只读         |

### Events

| 事件名              | 参数                               | 说明         |
| ------------------- | ---------------------------------- | ------------ |
| `update:modelValue` | `(value: Object)`                  | 表单数据更新 |
| `submit`            | `(data: Object)`                   | 表单提交     |
| `validate`          | `(valid: Boolean, errors: Object)` | 表单验证     |
| `field-change`      | `(name: string, value: any)`       | 字段值变化   |

## FormField 组件

`FormField` 是单个字段组件，可以独立使用。

### 基础用法

```vue
<template>
  <FormField v-model="value" :config="fieldConfig" />
</template>

<script setup>
import { ref } from 'vue'
import { FormField } from '@ldesign/form'

const value = ref('')

const fieldConfig = {
  name: 'username',
  label: '用户名',
  component: 'FormInput',
  required: true,
  placeholder: '请输入用户名',
}
</script>
```

### Props

| 属性         | 类型          | 默认值  | 说明     |
| ------------ | ------------- | ------- | -------- |
| `modelValue` | `any`         | -       | 字段值   |
| `config`     | `FieldConfig` | -       | 字段配置 |
| `disabled`   | `Boolean`     | `false` | 是否禁用 |
| `readonly`   | `Boolean`     | `false` | 是否只读 |

## 内置字段组件

### FormInput

文本输入框组件。

```vue
<FormInput
  v-model="value"
  type="text"
  placeholder="请输入内容"
  :disabled="false"
  :readonly="false"
/>
```

**Props:**

- `type`: 输入类型 (`text`, `email`, `password`, `number` 等)
- `placeholder`: 占位符文本
- `maxlength`: 最大长度
- `minlength`: 最小长度

### FormSelect

下拉选择组件。

```vue
<FormSelect
  v-model="value"
  :options="options"
  placeholder="请选择"
  :multiple="false"
  :clearable="true"
/>
```

**Props:**

- `options`: 选项数组
- `multiple`: 是否多选
- `clearable`: 是否可清空
- `filterable`: 是否可搜索

### FormRadio

单选框组件。

```vue
<FormRadio v-model="value" :options="options" :disabled="false" />
```

### FormCheckbox

多选框组件。

```vue
<FormCheckbox v-model="value" :options="options" :disabled="false" />
```

### FormSwitch

开关组件。

```vue
<FormSwitch v-model="value" :disabled="false" active-text="开启" inactive-text="关闭" />
```

### FormTextarea

多行文本输入组件。

```vue
<FormTextarea v-model="value" placeholder="请输入内容" :rows="4" :maxlength="500" />
```

### FormDatePicker

日期选择组件。

```vue
<FormDatePicker v-model="value" type="date" placeholder="请选择日期" format="YYYY-MM-DD" />
```

**Props:**

- `type`: 日期类型 (`date`, `datetime`, `daterange` 等)
- `format`: 日期格式
- `disabledDate`: 禁用日期函数

## 组件注册

### 全局注册

```javascript
import { createApp } from 'vue'
import LDesignForm from '@ldesign/form'
import '@ldesign/form/dist/style.css'

const app = createApp(App)
app.use(LDesignForm)
```

### 按需引入

```javascript
import { DynamicForm, FormField, FormInput } from '@ldesign/form'

export default {
  components: {
    DynamicForm,
    FormField,
    FormInput,
  },
}
```

## 自定义组件

你可以创建自定义字段组件并注册到表单系统中：

```vue
<!-- CustomComponent.vue -->
<template>
  <div class="custom-component">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
      :readonly="readonly"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
  readonly: Boolean,
})

defineEmits(['update:modelValue'])
</script>
```

注册自定义组件：

```javascript
import CustomComponent from './CustomComponent.vue'

const formOptions = {
  components: {
    CustomComponent,
  },
  fields: [
    {
      name: 'custom',
      label: '自定义字段',
      component: 'CustomComponent',
    },
  ],
}
```

## 最佳实践

1. **组件复用**: 将常用的字段配置抽取为可复用的配置对象
2. **类型安全**: 使用 TypeScript 获得更好的开发体验
3. **性能优化**: 对于大型表单，考虑使用 `v-show` 而不是 `v-if`
4. **无障碍访问**: 确保自定义组件支持键盘导航和屏幕阅读器

## 下一步

- [Composition API](/guide/composition-api) - 学习使用 Hook 方式
- [表单验证](/guide/validation) - 了解验证系统
- [自定义组件](/guide/custom-components) - 创建自定义组件
