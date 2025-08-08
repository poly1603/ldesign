# 类型定义

本章节详细介绍 @ldesign/form 的所有类型定义。

## 表单相关类型

### FormOptions

表单配置选项的主要接口。

```typescript
interface FormOptions {
  fields: FieldConfig[] // 字段配置数组
  layout?: LayoutConfig // 布局配置
  validation?: ValidationConfig // 验证配置
  theme?: ThemeConfig | string // 主题配置
  submitButton?: ButtonConfig | false // 提交按钮配置
  resetButton?: ButtonConfig | false // 重置按钮配置
  loading?: boolean // 是否显示加载状态
  disabled?: boolean // 是否禁用整个表单
  readonly?: boolean // 是否只读
}
```

### FormState

表单状态接口。

```typescript
interface FormState {
  submitting: boolean // 是否正在提交
  validating: boolean // 是否正在验证
  dirty: boolean // 是否有修改
  valid: boolean // 是否验证通过
  touched: boolean // 是否有交互
  loading: boolean // 是否加载中
  disabled: boolean // 是否禁用
  readonly: boolean // 是否只读
}
```

### FormData

表单数据类型。

```typescript
type FormData = Record<string, any>
```

## 字段相关类型

### FieldConfig

字段配置接口。

```typescript
interface FieldConfig {
  name: string // 字段名称（必需）
  label?: string // 字段标签
  component: ComponentType // 组件类型（必需）
  required?: boolean // 是否必填
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  readonly?: boolean // 是否只读
  placeholder?: string // 占位符
  defaultValue?: any // 默认值
  props?: ComponentProps // 组件属性
  rules?: ValidationRule[] // 验证规则
  span?: number | 'full' // 跨列数
  order?: number // 排序权重
  group?: string // 分组名称
  tooltip?: string // 提示信息
  description?: string // 描述信息
  conditional?: ConditionalConfig // 条件配置
}
```

### FieldState

字段状态接口。

```typescript
interface FieldState {
  value: any // 字段值
  dirty: boolean // 是否有修改
  touched: boolean // 是否有交互
  valid: boolean // 是否验证通过
  errors: string[] // 错误信息
  visible: boolean // 是否可见
  disabled: boolean // 是否禁用
  readonly: boolean // 是否只读
  loading: boolean // 是否加载中
  focused: boolean // 是否获得焦点
}
```

### ComponentType

组件类型枚举。

```typescript
type ComponentType =
  | 'FormInput'
  | 'FormTextarea'
  | 'FormSelect'
  | 'FormRadio'
  | 'FormCheckbox'
  | 'FormDatePicker'
  | 'FormTimePicker'
  | 'FormSwitch'
  | 'FormSlider'
  | 'FormRate'
  | string // 自定义组件名称
```

### ComponentProps

组件属性类型。

```typescript
type ComponentProps = Record<string, any>

// 具体组件属性类型
interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  maxlength?: number
  minlength?: number
  autocomplete?: string
  clearable?: boolean
  showPassword?: boolean
  prefixIcon?: string
  suffixIcon?: string
}

interface FormSelectProps {
  options: SelectOption[]
  multiple?: boolean
  filterable?: boolean
  clearable?: boolean
  loading?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<SelectOption[]>
}

interface FormCheckboxProps {
  options: CheckboxOption[]
  direction?: 'horizontal' | 'vertical'
  max?: number
  min?: number
}

interface FormRadioProps {
  options: RadioOption[]
  direction?: 'horizontal' | 'vertical'
}

interface FormTextareaProps {
  rows?: number
  maxlength?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autosize?: boolean | { minRows?: number; maxRows?: number }
  showWordLimit?: boolean
}

interface FormDatePickerProps {
  type?: 'date' | 'datetime' | 'daterange' | 'datetimerange'
  format?: string
  valueFormat?: string
  disabledDate?: (date: Date) => boolean
  clearable?: boolean
}

interface FormTimePickerProps {
  format?: string
  step?: string
  clearable?: boolean
}

interface FormSwitchProps {
  activeText?: string
  inactiveText?: string
  activeValue?: boolean | string | number
  inactiveValue?: boolean | string | number
}

interface FormSliderProps {
  min?: number
  max?: number
  step?: number
  range?: boolean
  showStops?: boolean
  showTooltip?: boolean
  marks?: Record<number, string>
}

interface FormRateProps {
  max?: number
  allowHalf?: boolean
  showText?: boolean
  texts?: string[]
  colors?: string[]
}
```

## 选项相关类型

### SelectOption

下拉选择选项接口。

```typescript
interface SelectOption {
  label: string // 显示文本
  value: any // 选项值
  disabled?: boolean // 是否禁用
  children?: SelectOption[] // 子选项（用于级联选择）
}
```

### CheckboxOption

复选框选项接口。

```typescript
interface CheckboxOption {
  label: string // 显示文本
  value: any // 选项值
  disabled?: boolean // 是否禁用
}
```

### RadioOption

单选框选项接口。

```typescript
interface RadioOption {
  label: string // 显示文本
  value: any // 选项值
  disabled?: boolean // 是否禁用
}
```

## 布局相关类型

### LayoutConfig

布局配置接口。

```typescript
interface LayoutConfig {
  columns?: number | ResponsiveColumns // 列数配置
  gap?: number | GapConfig // 间距配置
  labelPosition?: LabelPosition // 标签位置
  labelWidth?: number | string // 标签宽度
  labelAlign?: 'left' | 'center' | 'right' // 标签对齐
  size?: ComponentSize // 组件尺寸
  direction?: 'horizontal' | 'vertical' // 排列方向
}
```

### ResponsiveColumns

响应式列数配置。

```typescript
interface ResponsiveColumns {
  xs?: number // < 576px
  sm?: number // >= 576px
  md?: number // >= 768px
  lg?: number // >= 992px
  xl?: number // >= 1200px
  xxl?: number // >= 1600px
}
```

### GapConfig

间距配置接口。

```typescript
interface GapConfig {
  horizontal?: number // 水平间距
  vertical?: number // 垂直间距
}
```

### LabelPosition

标签位置类型。

```typescript
type LabelPosition = 'top' | 'left' | 'right'
```

### ComponentSize

组件尺寸类型。

```typescript
type ComponentSize = 'small' | 'medium' | 'large'
```

## 验证相关类型

### ValidationConfig

验证配置接口。

```typescript
interface ValidationConfig {
  validateOnChange?: boolean // 值变化时验证
  validateOnBlur?: boolean // 失去焦点时验证
  validateOnSubmit?: boolean // 提交时验证
  stopOnFirstError?: boolean // 遇到第一个错误时停止
  debounceTime?: number // 防抖时间
  customValidators?: Record<string, ValidationFunction> // 自定义验证器
}
```

### ValidationRule

验证规则接口。

```typescript
interface ValidationRule {
  required?: boolean // 是否必填
  min?: number // 最小值
  max?: number // 最大值
  minLength?: number // 最小长度
  maxLength?: number // 最大长度
  pattern?: RegExp // 正则表达式
  email?: boolean // 邮箱验证
  phone?: boolean // 手机号验证
  url?: boolean // URL验证
  number?: boolean // 数字验证
  integer?: boolean // 整数验证
  validator?: ValidationFunction // 自定义验证函数
  message?: string // 错误信息
  trigger?: ValidationTrigger // 触发时机
}
```

### ValidationFunction

验证函数类型。

```typescript
type ValidationFunction = (
  value: any,
  formData: FormData,
  fieldConfig: FieldConfig
) => boolean | string | Promise<boolean | string>
```

### ValidationTrigger

验证触发时机类型。

```typescript
type ValidationTrigger = 'change' | 'blur' | 'submit'
```

### ValidationResult

验证结果接口。

```typescript
interface ValidationResult {
  valid: boolean // 是否验证通过
  errors: string[] // 错误信息列表
  fieldName?: string // 字段名称
}
```

### ValidationState

验证状态接口。

```typescript
interface ValidationState {
  valid: boolean // 整体是否验证通过
  validating: boolean // 是否正在验证
  errors: Record<string, string[]> // 错误信息映射
}
```

### FieldValidationState

字段验证状态接口。

```typescript
interface FieldValidationState {
  valid: boolean // 是否验证通过
  errors: string[] // 错误信息
  validating: boolean // 是否正在验证
  touched: boolean // 是否已触摸
}
```

## 主题相关类型

### ThemeConfig

主题配置接口。

```typescript
interface ThemeConfig {
  name?: string // 主题名称
  primaryColor?: string // 主色调
  borderRadius?: string // 圆角大小
  fontSize?: string // 字体大小
  fontFamily?: string // 字体族
  spacing?: SpacingConfig // 间距配置
  colors?: ColorConfig // 颜色配置
  shadows?: ShadowConfig // 阴影配置
  transitions?: TransitionConfig // 过渡配置
}
```

### SpacingConfig

间距配置接口。

```typescript
interface SpacingConfig {
  xs?: string // 超小间距
  sm?: string // 小间距
  md?: string // 中等间距
  lg?: string // 大间距
  xl?: string // 超大间距
}
```

### ColorConfig

颜色配置接口。

```typescript
interface ColorConfig {
  primary?: string // 主色
  success?: string // 成功色
  warning?: string // 警告色
  error?: string // 错误色
  info?: string // 信息色
  text?: string // 文本色
  border?: string // 边框色
  background?: string // 背景色
}
```

## 事件相关类型

### FormEvents

表单事件接口。

```typescript
interface FormEvents {
  submit: (data: FormData) => void
  reset: () => void
  change: (data: FormData) => void
  'field-change': (name: string, value: any, formData: FormData) => void
  'field-focus': (name: string) => void
  'field-blur': (name: string) => void
  validate: (result: ValidationResult) => void
}
```

### EventHandler

事件处理函数类型。

```typescript
type EventHandler<T = any> = (...args: T[]) => void | Promise<void>
```

## 条件渲染相关类型

### ConditionalConfig

条件配置接口。

```typescript
interface ConditionalConfig {
  when?: ConditionalRule[] // 显示条件
  unless?: ConditionalRule[] // 隐藏条件
  dependencies?: string[] // 依赖字段
}
```

### ConditionalRule

条件规则接口。

```typescript
interface ConditionalRule {
  field: string // 依赖字段名
  operator: ConditionalOperator // 操作符
  value: any // 比较值
}
```

### ConditionalOperator

条件操作符类型。

```typescript
type ConditionalOperator =
  | 'eq' // 等于
  | 'ne' // 不等于
  | 'gt' // 大于
  | 'gte' // 大于等于
  | 'lt' // 小于
  | 'lte' // 小于等于
  | 'in' // 包含
  | 'notIn' // 不包含
  | 'contains' // 字符串包含
  | 'startsWith' // 字符串开头
  | 'endsWith' // 字符串结尾
  | 'isEmpty' // 为空
  | 'isNotEmpty' // 不为空
```

## 按钮相关类型

### ButtonConfig

按钮配置接口。

```typescript
interface ButtonConfig {
  text?: string // 按钮文本
  type?: ButtonType // 按钮类型
  size?: ComponentSize // 按钮尺寸
  disabled?: boolean // 是否禁用
  loading?: boolean // 是否加载中
  icon?: string // 图标
  onClick?: () => void | Promise<void> // 点击事件
}
```

### ButtonType

按钮类型。

```typescript
type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'text'
```

## 工具类型

### DeepPartial

深度可选类型。

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

### RequiredKeys

必需键类型。

```typescript
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]
```

### OptionalKeys

可选键类型。

```typescript
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]
```
