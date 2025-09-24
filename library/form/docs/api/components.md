# Vue 组件 API 参考

## LDesignForm

主表单容器组件，提供表单上下文和基础功能。

### Props

```typescript
interface LDesignFormProps {
  /** 表单配置 */
  config?: FormConfig;
  /** 表单实例 */
  form?: ReactiveFormInstance;
  /** 标签位置 */
  labelPosition?: 'top' | 'left' | 'right';
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'center' | 'right';
  /** 是否显示必填标记 */
  showRequiredMark?: boolean;
  /** 是否显示验证图标 */
  showValidationIcon?: boolean;
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 表单尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用整个表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
}
```

### Events

```typescript
interface LDesignFormEmits {
  /** 表单提交事件 */
  submit: (result: SubmitResult) => void;
  /** 表单重置事件 */
  reset: () => void;
  /** 表单值变化事件 */
  change: (values: Record<string, any>) => void;
  /** 表单验证状态变化事件 */
  validationChange: (validation: Record<string, ValidationResult>) => void;
}
```

### 使用示例

```vue
<template>
  <LDesignForm
    :form="form"
    label-position="left"
    label-width="100px"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <LDesignFormItem name="username" label="用户名" :rules="usernameRules">
      <LDesignInput v-model="form.data.username" />
    </LDesignFormItem>
    
    <LDesignFormItem>
      <LDesignButton html-type="submit" type="primary">提交</LDesignButton>
      <LDesignButton html-type="reset">重置</LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'
import { required } from '@ldesign/form/validators'

const form = useForm({
  initialValues: { username: '' }
})

const usernameRules = [
  { validator: required(), message: '请输入用户名' }
]

const handleSubmit = (result) => {
  console.log('提交结果:', result)
}

const handleReset = () => {
  console.log('表单已重置')
}
</script>
```

## LDesignFormItem

表单项组件，用于包装表单控件并提供标签、验证等功能。

### Props

```typescript
interface LDesignFormItemProps {
  /** 字段名称 */
  name?: string;
  /** 字段标签 */
  label?: string;
  /** 标签位置 */
  labelPosition?: 'top' | 'left' | 'right';
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'center' | 'right';
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 是否必填 */
  required?: boolean;
  /** 帮助文本 */
  help?: string;
  /** 额外信息 */
  extra?: string;
  /** 是否显示验证状态 */
  showValidationStatus?: boolean;
  /** 验证状态 */
  validationStatus?: 'success' | 'warning' | 'error' | 'validating';
  /** 自定义验证消息 */
  validateMessage?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 表单项尺寸 */
  size?: 'small' | 'medium' | 'large';
}
```

### Slots

```typescript
interface LDesignFormItemSlots {
  /** 默认插槽 - 表单控件 */
  default: () => VNode[];
  /** 标签插槽 */
  label: () => VNode[];
  /** 帮助文本插槽 */
  help: () => VNode[];
  /** 额外信息插槽 */
  extra: () => VNode[];
  /** 错误信息插槽 */
  error: (props: { error: string }) => VNode[];
}
```

### 使用示例

```vue
<template>
  <LDesignFormItem
    name="email"
    label="邮箱地址"
    :rules="emailRules"
    help="请输入有效的邮箱地址"
    required
  >
    <LDesignInput
      v-model="form.data.email"
      placeholder="example@domain.com"
      type="email"
    />
    
    <template #extra>
      <span class="text-gray-500">我们不会泄露您的邮箱信息</span>
    </template>
  </LDesignFormItem>
</template>

<script setup lang="ts">
import { required, email } from '@ldesign/form/validators'

const emailRules = [
  { validator: required(), message: '请输入邮箱地址' },
  { validator: email(), message: '请输入有效的邮箱地址' }
]
</script>
```

## LDesignQueryForm

查询表单组件，专门用于搜索和筛选场景。

### Props

```typescript
interface LDesignQueryFormProps {
  /** 字段配置 */
  fields: QueryFormField[];
  /** 列数 */
  colCount?: number;
  /** 默认显示行数 */
  defaultRowCount?: number;
  /** 是否收起 */
  collapsed?: boolean;
  /** 是否显示收起/展开按钮 */
  showCollapseButton?: boolean;
  /** 操作按钮位置 */
  actionPosition?: 'auto' | 'inline' | 'block';
  /** 操作按钮对齐方式 */
  actionAlign?: 'left' | 'center' | 'right' | 'justify';
  /** 标签位置 */
  labelPosition?: 'top' | 'left';
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'justify';
  /** 标签宽度 */
  labelWidth?: string;
  /** 是否响应式 */
  responsive?: boolean;
  /** 响应式断点 */
  breakpoints?: Record<string, number>;
  /** 提交按钮文本 */
  submitText?: string;
  /** 重置按钮文本 */
  resetText?: string;
  /** 展开按钮文本 */
  expandText?: string;
  /** 收起按钮文本 */
  collapseText?: string;
}
```

### Events

```typescript
interface LDesignQueryFormEmits {
  /** 提交查询 */
  submit: (values: Record<string, any>) => void;
  /** 重置查询 */
  reset: () => void;
  /** 展开/收起状态变化 */
  collapse: (collapsed: boolean) => void;
  /** 字段值变化 */
  change: (values: Record<string, any>) => void;
}
```

### 使用示例

```vue
<template>
  <LDesignQueryForm
    :fields="queryFields"
    :col-count="4"
    :default-row-count="1"
    :collapsed="true"
    :show-collapse-button="true"
    action-position="inline"
    action-align="right"
    @submit="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup lang="ts">
const queryFields = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入关键词'
  },
  {
    name: 'category',
    label: '分类',
    type: 'select',
    placeholder: '请选择分类',
    options: [
      { label: '全部', value: '' },
      { label: '技术', value: 'tech' },
      { label: '产品', value: 'product' }
    ]
  },
  {
    name: 'dateRange',
    label: '日期范围',
    type: 'dateRange',
    placeholder: ['开始日期', '结束日期']
  }
]

const handleSearch = (values) => {
  console.log('搜索参数:', values)
}

const handleReset = () => {
  console.log('重置搜索')
}
</script>
```

## FormProvider

表单上下文提供者组件，用于在组件树中共享表单实例。

### Props

```typescript
interface FormProviderProps {
  /** 表单实例 */
  form: ReactiveFormInstance;
}
```

### 使用示例

```vue
<template>
  <FormProvider :form="form">
    <CustomFormFields />
    <CustomFormActions />
  </FormProvider>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  initialValues: {
    name: '',
    email: ''
  }
})
</script>
```

## FieldArray

动态字段数组组件，用于处理可变长度的表单字段。

### Props

```typescript
interface FieldArrayProps {
  /** 字段名称 */
  name: string;
  /** 最小项目数 */
  min?: number;
  /** 最大项目数 */
  max?: number;
  /** 默认值 */
  defaultValue?: any;
  /** 验证规则 */
  rules?: ValidationRule[];
}
```

### Slots

```typescript
interface FieldArraySlots {
  /** 默认插槽 - 渲染每个数组项 */
  default: (props: {
    field: ReactiveFieldInstance;
    index: number;
    remove: () => void;
    move: (from: number, to: number) => void;
  }) => VNode[];
  
  /** 添加按钮插槽 */
  add: (props: { add: (value?: any) => void }) => VNode[];
}
```

### 使用示例

```vue
<template>
  <FieldArray name="contacts" :min="1" :max="5">
    <template #default="{ field, index, remove }">
      <div class="contact-item">
        <LDesignFormItem :name="`contacts.${index}.name`" label="姓名">
          <LDesignInput v-model="field.value.name" />
        </LDesignFormItem>
        
        <LDesignFormItem :name="`contacts.${index}.phone`" label="电话">
          <LDesignInput v-model="field.value.phone" />
        </LDesignFormItem>
        
        <LDesignButton @click="remove" type="error" size="small">
          删除
        </LDesignButton>
      </div>
    </template>
    
    <template #add="{ add }">
      <LDesignButton @click="() => add({ name: '', phone: '' })" type="primary">
        添加联系人
      </LDesignButton>
    </template>
  </FieldArray>
</template>
```
