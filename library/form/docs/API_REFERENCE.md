# LDesign Form - 完整 API 参考文档

## 目录

- [核心 API](#核心-api)
- [Vue 3 API](#vue-3-api)
- [React API](#react-api)
- [Lit API](#lit-api)
- [类型定义](#类型定义)
- [验证规则](#验证规则)

---

## 核心 API

### createForm(options)

创建表单实例（框架无关）。

#### 参数

```typescript
interface FormOptions {
  // 初始值
  initialValues?: FormValues
  
  // 布局配置
  layout?: {
    spanWidth?: number        // 列宽，默认 200
    maxSpan?: number          // 最大列数，默认 4
    minSpan?: number          // 最小列数，默认 1
    space?: number            // 垂直间距，默认 16
    gap?: number              // 标题间距，默认 8
    labelAlign?: 'left' | 'right' | 'top'  // 标题对齐，默认 'right'
    labelWidth?: number | string           // 标题宽度，默认 'auto'
    responsive?: boolean                   // 是否响应式，默认 true
    breakpoints?: ResponsiveBreakpoints    // 断点配置
  }
  
  // 展开收起配置
  expand?: {
    previewRows?: number                   // 预览行数，默认 1
    expandMode?: 'visible' | 'popup'       // 展开模式，默认 'visible'
    defaultExpanded?: boolean              // 默认是否展开，默认 false
    expandText?: string                    // 展开按钮文本，默认 '展开'
    collapseText?: string                  // 收起按钮文本，默认 '收起'
  }
  
  // 按钮配置
  button?: {
    buttonPosition?: 'inline' | 'block'    // 按钮位置，默认 'inline'
    buttonAlign?: 'left' | 'center' | 'right'  // 按钮对齐，默认 'right'
    buttonSpan?: number                    // 按钮占列数，默认 1
    showSubmit?: boolean                   // 显示提交按钮，默认 true
    submitText?: string                    // 提交按钮文本，默认 '查询'
    showReset?: boolean                    // 显示重置按钮，默认 true
    resetText?: string                     // 重置按钮文本，默认 '重置'
    showExpand?: boolean                   // 显示展开按钮，默认 true
  }
  
  // 字段配置
  fields?: FieldConfig[]
  
  // 验证配置
  validateOnChange?: boolean  // 值变化时验证，默认 true
  validateOnBlur?: boolean    // 失焦时验证，默认 true
  validateOnSubmit?: boolean  // 提交时验证，默认 true
  
  // 事件回调
  onSubmit?: (values: FormValues) => void | Promise<void>
  onReset?: () => void
  onChange?: (field: string, value: any, values: FormValues) => void
  onValidateFailed?: (errors: Record<string, string[]>) => void
  onExpandChange?: (expanded: boolean) => void
}
```

#### 返回值

返回 `FormCore` 实例。

#### 示例

```typescript
import { createForm } from '@ldesign/form'

const form = createForm({
  initialValues: {
    username: '',
    email: ''
  },
  fields: [
    {
      name: 'username',
      label: '用户名',
      rules: [{ type: 'required', message: '请输入用户名' }]
    }
  ],
  onSubmit: async (values) => {
    console.log('提交:', values)
  }
})
```

---

### FormCore 实例方法

#### getFieldValue(field)

获取字段值。

```typescript
const username = form.getFieldValue('username')
```

#### setFieldValue(field, value)

设置字段值。

```typescript
form.setFieldValue('username', 'John')
```

#### setFieldsValue(values)

批量设置字段值。

```typescript
form.setFieldsValue({
  username: 'John',
  email: 'john@example.com'
})
```

#### getFieldsValue()

获取所有字段值。

```typescript
const values = form.getFieldsValue()
```

#### getFieldState(field)

获取字段状态。

```typescript
const state = form.getFieldState('username')
// {
//   value: 'John',
//   touched: true,
//   dirty: true,
//   valid: true,
//   errors: []
// }
```

#### getFormState()

获取表单状态。

```typescript
const state = form.getFormState()
// {
//   submitting: false,
//   validating: false,
//   valid: true,
//   dirty: true,
//   errorCount: 0
// }
```

#### validateField(field, trigger?)

验证单个字段。

```typescript
const valid = await form.validateField('username')
// 或指定触发方式
const valid = await form.validateField('username', 'change')
```

#### validate()

验证整个表单。

```typescript
const result = await form.validate()
// {
//   valid: true,
//   errorCount: 0,
//   fields: {...},
//   errors: {}
// }
```

#### submit()

提交表单（会先验证）。

```typescript
await form.submit()
```

#### reset()

重置表单到初始值。

```typescript
form.reset()
```

#### toggleExpand()

切换展开/收起状态。

```typescript
form.toggleExpand()
```

#### isExpanded()

获取展开状态。

```typescript
const expanded = form.isExpanded()
```

#### on(event, listener)

监听事件。

```typescript
const unsubscribe = form.on('field:change', (event) => {
  console.log('字段变更:', event.field, event.value)
})

// 取消监听
unsubscribe()
```

#### destroy()

销毁表单实例。

```typescript
form.destroy()
```

---

## Vue 3 API

### useForm(options)

Vue 3 Composition API Hook。

#### 参数

与 `createForm` 相同。

#### 返回值

```typescript
interface UseFormReturn {
  form: FormCore                            // 表单实例
  values: Ref<FormValues>                   // 表单值（响应式）
  state: Ref<FormState>                     // 表单状态（响应式）
  submitting: Ref<boolean>                  // 是否提交中
  validating: Ref<boolean>                  // 是否验证中
  valid: Ref<boolean>                       // 是否有效
  dirty: Ref<boolean>                       // 是否脏数据
  touched: Ref<boolean>                     // 是否已触摸
  setFieldValue: (field: string, value: any) => void
  setFieldsValue: (values: FormValues) => void
  getFieldValue: <T>(field: string) => T
  getFieldsValue: () => FormValues
  validateField: (field: string) => Promise<boolean>
  validate: () => Promise<boolean>
  submit: () => Promise<void>
  reset: () => void
  toggleExpand: () => void
  isExpanded: Ref<boolean>                  // 是否展开
}
```

#### 示例

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'

const {
  values,
  valid,
  dirty,
  setFieldValue,
  submit,
  reset
} = useForm({
  initialValues: { username: '', email: '' },
  onSubmit: (values) => console.log(values)
})
</script>
```

---

### useField(name)

Vue 3 字段 Hook。

#### 参数

- `name` - 字段名（string 或 Ref<string>）

#### 返回值

```typescript
interface UseFieldReturn {
  value: Ref<any>                           // 字段值
  error: Ref<string | undefined>            // 第一个错误
  errors: Ref<string[]>                     // 所有错误
  touched: Ref<boolean>                     // 是否触摸
  dirty: Ref<boolean>                       // 是否脏数据
  validating: Ref<boolean>                  // 是否验证中
  valid: Ref<boolean>                       // 是否有效
  fieldState: Ref<FieldState | undefined>   // 完整字段状态
  setValue: (value: any) => void
  onChange: (value: any) => void
  onBlur: () => void
  onFocus: () => void
  validate: () => Promise<boolean>
}
```

#### 示例

```vue
<script setup lang="ts">
import { useField } from '@ldesign/form/vue'

const {
  value,
  error,
  touched,
  onChange,
  onBlur
} = useField('username')
</script>
```

---

### LForm 组件

Vue 3 表单容器组件。

#### Props

```typescript
interface LFormProps {
  form?: FormCore                   // 外部表单实例
  options?: FormOptions             // 表单选项
  spanWidth?: number                // 列宽
  maxSpan?: number                  // 最大列数
  space?: number                    // 垂直间距
  gap?: number                      // 标题间距
  labelAlign?: 'left' | 'right' | 'top'
  buttonPosition?: 'inline' | 'block'
  buttonAlign?: 'left' | 'center' | 'right'
  buttonSpan?: number
  showSubmit?: boolean
  submitText?: string
  showReset?: boolean
  resetText?: string
  showExpand?: boolean
  expandText?: string
  collapseText?: string
  collapsible?: boolean
  previewRows?: number
  disabled?: boolean
}
```

#### Events

- `@submit` - 表单提交
- `@reset` - 表单重置
- `@change` - 字段变更
- `@expand-change` - 展开收起状态变更

#### Slots

- `default` - 表单内容
- `buttons` - 自定义按钮组

#### 示例

```vue
<template>
  <LForm
    :span-width="200"
    :max-span="3"
    @submit="handleSubmit"
  >
    <LFormItem name="username" label="用户名">
      <input v-model="form.username" />
    </LFormItem>
  </LForm>
</template>
```

---

### LFormItem 组件

Vue 3 表单项组件。

#### Props

```typescript
interface LFormItemProps {
  name: string                      // 字段名（必填）
  label?: string                    // 标签
  required?: boolean                // 是否必填
  rules?: ValidationRule[]          // 验证规则
  span?: number | string            // 占列数
  tooltip?: string                  // 提示信息
  help?: string                     // 帮助文本
  showError?: boolean               // 是否显示错误
  labelWidth?: number | string      // 标签宽度
  labelAlign?: 'left' | 'right' | 'top'
  disabled?: boolean                // 是否禁用
  readonly?: boolean                // 是否只读
}
```

#### Slots

- `default` - 表单控件
- `label` - 自定义标签
- `error` - 自定义错误显示
- `help` - 自定义帮助文本

#### 示例

```vue
<LFormItem name="username" label="用户名" required>
  <input v-model="form.username" />
</LFormItem>
```

---

## React API

### useForm(options)

React Hook。

#### 参数

与 `createForm` 相同。

#### 返回值

```typescript
interface UseFormReturn {
  form: FormCore
  values: FormValues
  state: FormState
  setFieldValue: (field: string, value: any) => void
  setFieldsValue: (values: FormValues) => void
  getFieldValue: <T>(field: string) => T
  getFieldsValue: () => FormValues
  validateField: (field: string) => Promise<boolean>
  validate: () => Promise<boolean>
  submit: () => Promise<void>
  reset: () => void
  toggleExpand: () => void
  isExpanded: boolean
}
```

#### 示例

```tsx
import { useForm } from '@ldesign/form/react'

function MyForm() {
  const { values, submit } = useForm({
    initialValues: { username: '' }
  })
  
  return <div>...</div>
}
```

---

### useField(name)

React 字段 Hook。

#### 参数

- `name` - 字段名（string）

#### 返回值

```typescript
interface UseFieldReturn {
  value: any
  error?: string
  errors: string[]
  touched: boolean
  dirty: boolean
  validating: boolean
  valid: boolean
  fieldState?: FieldState
  setValue: (value: any) => void
  onChange: (value: any) => void
  onBlur: () => void
  onFocus: () => void
  validate: () => Promise<boolean>
}
```

#### 示例

```tsx
import { useField } from '@ldesign/form/react'

function UsernameField() {
  const { value, error, onChange, onBlur } = useField('username')
  
  return (
    <div>
      <input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} />
      {error && <span>{error}</span>}
    </div>
  )
}
```

---

### Form 组件

React 表单容器组件。

#### Props

```typescript
interface FormProps extends FormOptions {
  form?: FormCore
  className?: string
  style?: CSSProperties
  children?: ReactNode
  
  // 布局配置
  spanWidth?: number
  maxSpan?: number
  space?: number
  gap?: number
  labelAlign?: 'left' | 'right' | 'top'
  
  // 按钮配置
  buttonPosition?: 'inline' | 'block'
  buttonAlign?: 'left' | 'center' | 'right'
  buttonSpan?: number
  
  // 事件
  onSubmit?: (values: FormValues) => void | Promise<void>
  onReset?: () => void
  onChange?: (field: string, value: any, values: FormValues) => void
}
```

#### 示例

```tsx
import { Form, FormItem } from '@ldesign/form/react'

function MyForm() {
  return (
    <Form spanWidth={200} maxSpan={3}>
      <FormItem name="username" label="用户名">
        <input />
      </FormItem>
    </Form>
  )
}
```

---

### FormItem 组件

React 表单项组件。

#### Props

```typescript
interface FormItemProps {
  name: string
  label?: string
  required?: boolean
  rules?: ValidationRule[]
  span?: number | string
  tooltip?: string
  help?: string
  showError?: boolean
  labelWidth?: number | string
  labelAlign?: 'left' | 'right' | 'top'
  disabled?: boolean
  readonly?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}
```

---

## Lit API

### FormController

Lit Reactive Controller。

#### 构造函数

```typescript
new FormController(host: ReactiveControllerHost, options: FormOptions)
```

#### 属性

- `values: FormValues` - 表单值
- `state: FormState` - 表单状态
- `isExpanded: boolean` - 是否展开

#### 方法

- `getForm(): FormCore` - 获取表单实例
- `setFieldValue(field, value)` - 设置字段值
- `setFieldsValue(values)` - 批量设置值
- `getFieldValue(field)` - 获取字段值
- `getFieldsValue()` - 获取所有值
- `validateField(field)` - 验证字段
- `validate()` - 验证表单
- `submit()` - 提交表单
- `reset()` - 重置表单
- `toggleExpand()` - 切换展开

#### 示例

```typescript
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FormController } from '@ldesign/form/lit'

@customElement('my-form')
class MyForm extends LitElement {
  private formController = new FormController(this, {
    initialValues: { username: '' }
  })
  
  render() {
    return html`
      <input 
        .value=${this.formController.values.username}
        @input=${(e) => this.formController.setFieldValue('username', e.target.value)}
      />
    `
  }
}
```

---

### FieldController

Lit 字段控制器。

#### 构造函数

```typescript
new FieldController(host: ReactiveControllerHost, form: FormCore, name: string)
```

#### 属性

- `value: any` - 字段值
- `fieldState?: FieldState` - 字段状态
- `error?: string` - 第一个错误
- `errors: string[]` - 所有错误
- `touched: boolean` - 是否触摸
- `dirty: boolean` - 是否脏数据
- `validating: boolean` - 是否验证中
- `valid: boolean` - 是否有效

#### 方法

- `setValue(value)` - 设置值
- `onChange(value)` - 处理变更
- `onBlur()` - 处理失焦
- `onFocus()` - 处理聚焦
- `validate()` - 验证字段

---

### l-form Web Component

Lit 表单元素。

#### 属性

```typescript
@property span-width: number = 200
@property max-span: number = 4
@property space: number = 16
@property gap: number = 8
@property label-align: 'left' | 'right' | 'top' = 'right'
@property button-position: 'inline' | 'block' = 'inline'
@property button-align: 'left' | 'center' | 'right' = 'right'
@property button-span: number = 1
@property collapsible: boolean = false
@property preview-rows: number = 1
```

#### 事件

- `@submit` - 表单提交
- `@reset` - 表单重置
- `@change` - 字段变更
- `@expand-change` - 展开收起

#### 示例

```html
<l-form span-width="200" max-span="3" @submit="${handleSubmit}">
  <l-form-item name="username" label="用户名">
    <input />
  </l-form-item>
</l-form>
```

---

### l-form-item Web Component

Lit 表单项元素。

#### 属性

```typescript
@property name: string                              // 必填
@property label: string = ''
@property required: boolean = false
@property rules: ValidationRule[] = []
@property span: number | string = 1
@property tooltip: string = ''
@property help: string = ''
@property show-error: boolean = true
@property label-width: number | string
@property label-align: 'left' | 'right' | 'top'
@property disabled: boolean = false
@property readonly: boolean = false
```

#### 示例

```html
<l-form-item name="username" label="用户名" required>
  <input />
</l-form-item>
```

---

## 类型定义

### FieldConfig

字段配置类型。

```typescript
interface FieldConfig {
  name: string                              // 字段名（必填）
  label?: string                            // 标签
  component?: string | any                  // 组件类型
  props?: Record<string, any>               // 组件属性
  span?: number | string                    // 占列数
  rules?: ValidationRule[]                  // 验证规则
  required?: boolean                        // 是否必填
  defaultValue?: any                        // 默认值
  disabled?: boolean                        // 是否禁用
  readonly?: boolean                        // 是否只读
  visible?: boolean | ((values) => boolean) // 是否可见
  dependencies?: string[]                   // 依赖字段
  tooltip?: string                          // 提示信息
  placeholder?: string                      // 占位符
  options?: Array<{                         // 选项列表
    label: string
    value: any
    disabled?: boolean
  }>
  loadOptions?: () => Promise<Array<{       // 异步加载选项
    label: string
    value: any
  }>>
}
```

---

### ValidationRule

验证规则类型。

```typescript
interface ValidationRule {
  type: ValidatorType                       // 规则类型
  message?: string                          // 错误消息
  validator?: ValidatorFunction             // 自定义验证器
  params?: any                              // 规则参数
  trigger?: 'change' | 'blur' | 'submit'    // 触发时机
}

type ValidatorType =
  | 'required'
  | 'email'
  | 'url'
  | 'phone'
  | 'number'
  | 'integer'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'
```

---

### FormState

表单状态类型。

```typescript
interface FormState {
  submitting: boolean      // 是否提交中
  validating: boolean      // 是否验证中
  valid: boolean           // 是否有效
  dirty: boolean           // 是否脏数据
  touched: boolean         // 是否已触摸
  pristine: boolean        // 是否原始状态
  errorCount: number       // 错误数量
  fieldCount: number       // 字段数量
}
```

---

### FieldState

字段状态类型。

```typescript
interface FieldState {
  value: any               // 字段值
  initialValue?: any       // 初始值
  touched: boolean         // 是否触摸
  dirty: boolean           // 是否脏数据
  validating: boolean      // 是否验证中
  valid: boolean           // 是否有效
  errors: string[]         // 错误消息
  disabled: boolean        // 是否禁用
  readonly: boolean        // 是否只读
  visible: boolean         // 是否可见
}
```

---

## 验证规则

### 内置验证规则

#### required

必填验证。

```typescript
{ type: 'required', message: '此字段为必填项' }
```

#### email

邮箱验证。

```typescript
{ type: 'email', message: '请输入有效的邮箱地址' }
```

#### url

URL 验证。

```typescript
{ type: 'url', message: '请输入有效的URL地址' }
```

#### phone

手机号验证（中国大陆）。

```typescript
{ type: 'phone', message: '请输入有效的手机号码' }
```

#### number

数字验证。

```typescript
{ type: 'number', message: '请输入有效的数字' }
```

#### integer

整数验证。

```typescript
{ type: 'integer', message: '请输入有效的整数' }
```

#### min / max

最小值/最大值验证（需要params）。

```typescript
{ 
  type: 'min', 
  params: { value: 10 },
  message: '值不能小于 10'
}

{
  type: 'max',
  params: { value: 100 },
  message: '值不能大于 100'
}
```

#### minLength / maxLength

最小/最大长度验证。

```typescript
{
  type: 'minLength',
  params: { value: 3 },
  message: '长度不能少于 3 个字符'
}

{
  type: 'maxLength',
  params: { value: 20 },
  message: '长度不能超过 20 个字符'
}
```

#### pattern

正则表达式验证。

```typescript
{
  type: 'pattern',
  params: { value: /^[a-zA-Z0-9]+$/ },
  message: '只能包含字母和数字'
}
```

#### custom

自定义验证。

```typescript
{
  type: 'custom',
  validator: (value, values) => {
    return value !== 'admin'
  },
  message: '用户名不能是 admin'
}

// 异步验证
{
  type: 'custom',
  validator: async (value) => {
    const exists = await checkUsernameExists(value)
    return !exists
  },
  message: '用户名已存在'
}
```

---

## 国际化 API

### setLocale(locale)

设置当前语言。

```typescript
import { setLocale } from '@ldesign/form/i18n'

setLocale('en-US')  // 英文
setLocale('zh-CN')  // 中文
```

---

### t(path, params?)

翻译函数。

```typescript
import { t } from '@ldesign/form/i18n'

const message = t('validation.required')
// "此字段为必填项"

const messageWithParams = t('validation.min', { min: 10 })
// "值不能小于 10"
```

---

### registerLocale(locale, messages)

注册自定义语言包。

```typescript
import { registerLocale } from '@ldesign/form/i18n'

registerLocale('ja-JP', {
  form: {
    submit: '送信',
    reset: 'リセット'
  }
})
```

---

## 主题 API

### 切换主题

```typescript
// 切换到深色主题
document.documentElement.setAttribute('data-theme', 'dark')

// 切换到浅色主题
document.documentElement.setAttribute('data-theme', 'light')
```

### 自定义主题变量

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-error-color: #ff4d4f;
  --ldesign-success-color: #52c41a;
  /* ...更多变量 */
}
```

---

## 性能优化 API

### 缓存

```typescript
import { LRUCache, SimpleCache } from '@ldesign/form'

// LRU 缓存
const cache = new LRUCache(100)
cache.set('key', 'value')
const value = cache.get('key')

// 简单缓存（支持TTL）
const simpleCache = new SimpleCache()
simpleCache.set('key', 'value', 60000) // 60秒过期
```

### 防抖节流

```typescript
import { debounce, throttle, rafThrottle } from '@ldesign/form'

// 防抖
const debouncedFn = debounce((value) => {
  console.log(value)
}, 300)

// 节流
const throttledFn = throttle((value) => {
  console.log(value)
}, 300)

// RAF 节流
const rafThrottledFn = rafThrottle((value) => {
  console.log(value)
})
```

---

## 高级功能

### 表单分组

```typescript
import { createFormGroupManager } from '@ldesign/form'

const groupManager = createFormGroupManager()

groupManager.registerGroup({
  name: 'basic',
  title: '基础信息',
  fields: ['username', 'email'],
  collapsible: true
})
```

### 动态字段

```typescript
import { createDynamicFieldManager } from '@ldesign/form'

const dynamicFields = createDynamicFieldManager()

// 添加字段
dynamicFields.addField({
  name: 'newField',
  label: '新字段',
  component: 'input'
})

// 移除字段
dynamicFields.removeField('newField')

// 移动字段
dynamicFields.moveField('field1', 2)
```

### 数组字段

```typescript
import { createArrayFieldManager } from '@ldesign/form'

const arrayFields = createArrayFieldManager()

arrayFields.registerArrayField({
  name: 'contacts',
  itemTemplate: [
    { name: 'name', label: '姓名' },
    { name: 'phone', label: '电话' }
  ],
  minItems: 1,
  maxItems: 5
})

// 添加项
arrayFields.addItem('contacts')

// 移除项
arrayFields.removeItem('contacts', 0)
```

---

**完整API文档，涵盖所有公共接口。**



