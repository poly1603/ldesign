/**
 * 表单组件类型定义
 * 
 * 本文件定义了表单组件相关的类型，包括：
 * - Form 组件属性类型
 * - FormItem 组件属性类型
 * - 各种输入组件属性类型
 * - 组件事件类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Component, VNode } from 'vue'
import type {
  FieldConfig,
  FormConfig,
  FormEventCallbacks,
  FormInstance,
  LayoutConfig,
  ValidationRule,
  ValidationSchema,
} from './core'

/**
 * Form 组件属性接口
 * 
 * @template T 表单数据类型
 */
export interface FormProps<T = Record<string, any>> extends FormEventCallbacks<T> {
  /** 表单初始值 */
  initialValues?: T
  /** 表单当前值（受控模式） */
  values?: T
  /** 表单默认值（非受控模式） */
  defaultValues?: T
  /** 表单配置 */
  config?: FormConfig<T>
  /** 验证模式 */
  validationSchema?: ValidationSchema
  /** 字段配置数组（配置式用法） */
  fields?: FieldConfig[]
  /** 布局配置 */
  layout?: LayoutConfig
  /** 表单是否禁用 */
  disabled?: boolean
  /** 表单是否只读 */
  readonly?: boolean
  /** 表单大小 */
  size?: 'small' | 'medium' | 'large'
  /** 表单变体 */
  variant?: 'default' | 'outlined' | 'filled'
  /** 是否显示必填标记 */
  requiredMark?: boolean
  /** 是否显示冒号 */
  colon?: boolean
  /** 表单类名 */
  class?: string
  /** 表单样式 */
  style?: string | Record<string, any>
  /** 表单实例引用 */
  ref?: (instance: FormInstance<T> | null) => void
}

/**
 * FormItem 组件属性接口
 */
export interface FormItemProps {
  /** 字段名称 */
  name: string
  /** 字段标签 */
  label?: string | VNode | (() => VNode)
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 字段依赖 */
  dependencies?: string[]
  /** 字段是否可见 */
  visible?: boolean | ((values: any) => boolean)
  /** 字段是否禁用 */
  disabled?: boolean | ((values: any) => boolean)
  /** 字段是否只读 */
  readonly?: boolean | ((values: any) => boolean)
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 字段布局 */
  layout?: {
    span?: number
    offset?: number
    order?: number
  }
  /** 帮助文本 */
  help?: string | VNode | (() => VNode)
  /** 额外信息 */
  extra?: string | VNode | (() => VNode)
  /** 字段类名 */
  class?: string
  /** 字段样式 */
  style?: string | Record<string, any>
}

/**
 * 基础输入组件属性接口
 * 
 * @template T 值类型
 */
export interface BaseInputProps<T = any> {
  /** 输入值 */
  value?: T
  /** 默认值 */
  defaultValue?: T
  /** 值改变回调 */
  onChange?: (value: T, event?: Event) => void
  /** 失去焦点回调 */
  onBlur?: (event: FocusEvent) => void
  /** 获得焦点回调 */
  onFocus?: (event: FocusEvent) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 组件大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 组件类名 */
  class?: string
  /** 组件样式 */
  style?: string | Record<string, any>
}

/**
 * Input 组件属性接口
 */
export interface InputProps extends BaseInputProps<string> {
  /** 输入类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number
  /** 是否显示字符计数 */
  showCount?: boolean
  /** 前缀图标 */
  prefixIcon?: Component | VNode | (() => VNode)
  /** 后缀图标 */
  suffixIcon?: Component | VNode | (() => VNode)
  /** 前缀内容 */
  prefix?: string | VNode | (() => VNode)
  /** 后缀内容 */
  suffix?: string | VNode | (() => VNode)
  /** 是否自动获得焦点 */
  autofocus?: boolean
  /** 自动完成 */
  autocomplete?: string
  /** 输入回调 */
  onInput?: (value: string, event: InputEvent) => void
  /** 按键回调 */
  onKeydown?: (event: KeyboardEvent) => void
  /** 按键抬起回调 */
  onKeyup?: (event: KeyboardEvent) => void
  /** 回车回调 */
  onEnter?: (event: KeyboardEvent) => void
}

/**
 * Textarea 组件属性接口
 */
export interface TextareaProps extends BaseInputProps<string> {
  /** 行数 */
  rows?: number
  /** 最小行数 */
  minRows?: number
  /** 最大行数 */
  maxRows?: number
  /** 是否自动调整高度 */
  autosize?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 是否显示字符计数 */
  showCount?: boolean
  /** 是否可调整大小 */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

/**
 * Select 组件属性接口
 */
export interface SelectProps extends BaseInputProps<any> {
  /** 选项数据 */
  options: Array<{
    label: string
    value: any
    disabled?: boolean
    children?: Array<{ label: string; value: any; disabled?: boolean }>
  }>
  /** 是否多选 */
  multiple?: boolean
  /** 是否可搜索 */
  searchable?: boolean
  /** 是否可清除 */
  clearable?: boolean
  /** 是否允许创建新选项 */
  allowCreate?: boolean
  /** 搜索过滤函数 */
  filterOption?: (input: string, option: any) => boolean
  /** 下拉框最大高度 */
  maxHeight?: number
  /** 多选时的标签渲染函数 */
  tagRender?: (option: any) => VNode
  /** 选项渲染函数 */
  optionRender?: (option: any) => VNode
  /** 空状态渲染函数 */
  emptyRender?: () => VNode
  /** 加载状态 */
  loading?: boolean
  /** 远程搜索函数 */
  onSearch?: (value: string) => void
}

/**
 * Checkbox 组件属性接口
 */
export interface CheckboxProps extends BaseInputProps<boolean> {
  /** 复选框文本 */
  label?: string | VNode | (() => VNode)
  /** 是否为不确定状态 */
  indeterminate?: boolean
  /** 复选框值（用于复选框组） */
  checkboxValue?: any
}

/**
 * CheckboxGroup 组件属性接口
 */
export interface CheckboxGroupProps extends BaseInputProps<any[]> {
  /** 选项数据 */
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical'
  /** 最大选择数量 */
  max?: number
  /** 最小选择数量 */
  min?: number
}

/**
 * Radio 组件属性接口
 */
export interface RadioProps extends BaseInputProps<any> {
  /** 单选框文本 */
  label?: string | VNode | (() => VNode)
  /** 单选框值 */
  radioValue: any
}

/**
 * RadioGroup 组件属性接口
 */
export interface RadioGroupProps extends BaseInputProps<any> {
  /** 选项数据 */
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical'
  /** 按钮样式 */
  buttonStyle?: 'outline' | 'solid'
}

/**
 * Switch 组件属性接口
 */
export interface SwitchProps extends BaseInputProps<boolean> {
  /** 开启时的文本 */
  checkedText?: string | VNode | (() => VNode)
  /** 关闭时的文本 */
  uncheckedText?: string | VNode | (() => VNode)
  /** 开启时的值 */
  checkedValue?: any
  /** 关闭时的值 */
  uncheckedValue?: any
  /** 加载状态 */
  loading?: boolean
}

/**
 * DatePicker 组件属性接口
 */
export interface DatePickerProps extends BaseInputProps<Date | string | number> {
  /** 日期格式 */
  format?: string
  /** 值格式 */
  valueFormat?: string
  /** 日期类型 */
  type?: 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year'
  /** 范围分隔符 */
  rangeSeparator?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 禁用时间函数 */
  disabledTime?: (date: Date) => { hours?: number[]; minutes?: number[]; seconds?: number[] }
  /** 快捷选项 */
  shortcuts?: Array<{
    text: string
    value: Date | (() => Date)
  }>
}

/**
 * Upload 组件属性接口
 */
export interface UploadProps extends BaseInputProps<any[]> {
  /** 上传地址 */
  action?: string
  /** 上传请求头 */
  headers?: Record<string, string>
  /** 上传参数 */
  data?: Record<string, any>
  /** 文件参数名 */
  name?: string
  /** 接受的文件类型 */
  accept?: string
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否支持拖拽上传 */
  drag?: boolean
  /** 文件大小限制（字节） */
  maxSize?: number
  /** 文件数量限制 */
  maxCount?: number
  /** 上传前的钩子函数 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  /** 自定义上传函数 */
  customRequest?: (options: any) => void
  /** 文件列表类型 */
  listType?: 'text' | 'picture' | 'picture-card'
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 预览函数 */
  onPreview?: (file: any) => void
  /** 移除函数 */
  onRemove?: (file: any) => boolean | Promise<boolean>
  /** 上传成功回调 */
  onSuccess?: (response: any, file: any) => void
  /** 上传失败回调 */
  onError?: (error: Error, file: any) => void
  /** 上传进度回调 */
  onProgress?: (percent: number, file: any) => void
}

/**
 * 组件注册映射类型
 */
export interface ComponentMap {
  Input: Component
  Textarea: Component
  Select: Component
  Checkbox: Component
  CheckboxGroup: Component
  Radio: Component
  RadioGroup: Component
  Switch: Component
  DatePicker: Component
  Upload: Component
  [key: string]: Component
}

/**
 * 组件属性映射类型
 */
export interface ComponentPropsMap {
  Input: InputProps
  Textarea: TextareaProps
  Select: SelectProps
  Checkbox: CheckboxProps
  CheckboxGroup: CheckboxGroupProps
  Radio: RadioProps
  RadioGroup: RadioGroupProps
  Switch: SwitchProps
  DatePicker: DatePickerProps
  Upload: UploadProps
  [key: string]: any
}
