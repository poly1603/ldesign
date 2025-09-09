/**
 * 表单组件核心类型定义
 *
 * 本文件定义了表单系统的核心类型，包括：
 * - 表单状态管理相关类型
 * - 字段配置和状态类型
 * - 验证系统类型
 * - 布局系统类型
 * - 框架无关的核心接口
 *
 * @author LDesign Team
 * @since 2.0.0
 */

// 移除Vue依赖，使其框架无关
// import type { Component, Ref } from 'vue'

/**
 * 表单状态接口
 * 管理整个表单的状态信息
 * 
 * @template T 表单数据类型，默认为 Record<string, any>
 */
export interface FormState<T = Record<string, any>> {
  /** 表单字段值 */
  values: T
  /** 表单验证错误信息，key为字段名，value为错误消息数组 */
  errors: Record<string, string[]>
  /** 字段是否被触摸过（失去焦点） */
  touched: Record<string, boolean>
  /** 字段值是否被修改过 */
  dirty: Record<string, boolean>
  /** 表单是否正在提交 */
  submitting: boolean
  /** 表单是否正在验证 */
  validating: boolean
  /** 表单是否有效（无验证错误） */
  valid: boolean
}

/**
 * 表单配置接口
 * 用于配置表单的行为和初始状态
 */
export interface FormConfig<T = Record<string, any>> {
  /** 表单唯一标识 */
  id?: string
  /** 表单初始值 */
  initialValues?: T
  /** 字段配置数组 */
  fields?: FieldConfig[]
  /** 验证模式配置 */
  validationSchema?: ValidationSchema
  /** 验证引擎配置 */
  validationConfig?: ValidationEngineConfig
  /** 是否在值改变时验证，默认为 true */
  validateOnChange?: boolean
  /** 是否在失去焦点时验证，默认为 true */
  validateOnBlur?: boolean
  /** 是否在提交时验证，默认为 true */
  validateOnSubmit?: boolean
  /** 是否在挂载时验证，默认为 false */
  validateOnMount?: boolean
  /** 布局配置 */
  layout?: LayoutConfig
}

/**
 * 字段配置接口
 * 定义单个表单字段的配置信息
 */
export interface FieldConfig {
  /** 字段名称，用于标识字段 */
  name: string
  /** 字段标签 */
  label?: string
  /** 字段类型 */
  type?: string
  /** 字段默认值 */
  defaultValue?: any
  /** 字段占位符 */
  placeholder?: string
  /** 传递给组件的属性 */
  props?: Record<string, any>
  /** 验证规则数组 */
  rules?: ValidationRule[]
  /** 依赖的其他字段名称数组 */
  dependencies?: string[]
  /** 字段是否可见，可以是布尔值或返回布尔值的函数 */
  visible?: boolean | ((values: any) => boolean)
  /** 字段是否禁用 */
  disabled?: boolean | ((values: any) => boolean)
  /** 字段是否只读 */
  readonly?: boolean | ((values: any) => boolean)
  /** 字段布局配置 */
  layout?: FieldLayout
  /** 在水平布局中占用的列数，默认为1 */
  colSpan?: number
}

/**
 * 字段状态接口
 * 管理单个字段的状态信息
 */
export interface FieldState {
  /** 字段当前值 */
  value: any
  /** 字段验证错误信息（单个错误） */
  error?: string
  /** 字段验证错误信息（多个错误） */
  errors: string[]
  /** 字段是否被触摸过 */
  touched: boolean
  /** 字段值是否被修改过 */
  dirty: boolean
  /** 字段是否正在验证 */
  validating: boolean
  /** 字段是否有效 */
  valid: boolean
}

/**
 * 验证规则接口
 * 定义字段的验证规则
 */
export interface ValidationRule {
  /** 验证规则类型 */
  type: 'required' | 'pattern' | 'min' | 'max' | 'email' | 'url' | 'custom'
  /** 验证失败时的错误消息 */
  message: string
  /** 自定义验证器函数，返回 true 表示验证通过 */
  validator?: (value: any, values: any) => boolean | Promise<boolean>
  /** 验证规则的参数，如 min/max 的数值，pattern 的正则表达式等 */
  params?: any
  /** 验证触发时机 */
  trigger?: 'change' | 'blur' | 'submit'
}

/**
 * 验证模式接口
 * 定义整个表单的验证规则集合
 */
export interface ValidationSchema {
  /** 字段名到验证规则数组的映射 */
  [fieldName: string]: ValidationRule[]
}

/**
 * 布局模式类型
 * 定义表单的布局方向
 */
export type LayoutMode = 'vertical' | 'horizontal'

/**
 * 布局配置接口
 * 定义表单的整体布局配置
 */
export interface LayoutConfig {
  /** 布局模式，默认为 'vertical' */
  mode?: LayoutMode
  /** 表单列数，默认为 1 */
  columns?: number
  /** 字段间距，默认为 16 */
  gutter?: number
  /** 标签宽度，可以是数字（px）或字符串（如 '120px', '20%'） */
  labelWidth?: number | string
  /** 标签对齐方式，默认为 'right' */
  labelAlign?: 'left' | 'right' | 'top'
  /** 标签布局方式，默认为 'vertical'（标签在上方），'horizontal' 表示标签和输入框在一行 */
  labelLayout?: 'vertical' | 'horizontal'
  /** 当 labelLayout 为 'horizontal' 时，是否自动计算标签宽度（以最长文本为准），默认为 true */
  autoLabelWidth?: boolean
  /** 是否启用响应式布局，默认为 true */
  responsive?: boolean
  /** 响应式断点配置 */
  breakpoints?: {
    xs?: number  // < 576px
    sm?: number  // >= 576px
    md?: number  // >= 768px
    lg?: number  // >= 992px
    xl?: number  // >= 1200px
    xxl?: number // >= 1600px
  }
  /** 水平布局配置 */
  horizontal?: {
    /** 每行的列数，默认为 columns 值 */
    columnsPerRow?: number
    /** 是否使用 CSS Grid 布局，默认为 true */
    useGrid?: boolean
    /** Grid 模板列配置，如 'repeat(3, 1fr)' */
    gridTemplateColumns?: string
    /** Grid 行间距 */
    rowGap?: number | string
    /** Grid 列间距 */
    columnGap?: number | string
    /** 是否自动填充行，默认为 true */
    autoFill?: boolean
    /** 按钮组位置，默认为 'separate-row' */
    buttonPosition?: 'separate-row' | 'inline'
    /** 按钮组占用的列数，默认为 1 */
    buttonColSpan?: number
    /** 标签布局方式，默认为 'vertical'（标签在上方），'horizontal' 表示标签和输入框在一行 */
    labelLayout?: 'vertical' | 'horizontal'
    /** 当 labelLayout 为 'horizontal' 时，标签宽度，可以是数字（px）或字符串（如 '120px', '20%'） */
    labelWidth?: number | string
    /** 当 labelLayout 为 'horizontal' 时，是否自动计算标签宽度（以最长文本为准），默认为 true */
    autoLabelWidth?: boolean
    /** 当 labelLayout 为 'horizontal' 时，标签对齐方式，默认为 'right' */
    labelAlign?: 'left' | 'right'
    /** 表单项之间的垂直间隔，单位px，默认为 16 */
    itemSpacing?: number
    /** 标签和输入框之间的水平间隔，单位px，默认为 12 */
    labelControlSpacing?: number
    /** 按钮组对齐方式，默认为 'right' */
    buttonAlign?: 'left' | 'center' | 'right' | 'space-between'
    /** 重置行为，'empty' 重置为空值，'default' 重置为默认值，默认为 'empty' */
    resetBehavior?: 'empty' | 'default'
  }
  /** 展开/收起配置 */
  collapsible?: {
    /** 是否启用展开/收起功能，默认为 false */
    enabled?: boolean
    /** 默认显示的行数，默认为 3（横向和纵向布局都使用此配置） */
    defaultVisibleRows?: number
    /** 展开按钮文本，默认为 '展开' */
    expandText?: string
    /** 收起按钮文本，默认为 '收起' */
    collapseText?: string
    /** 按钮位置，默认为 'bottom' */
    buttonPosition?: 'top' | 'bottom' | 'inline'
    /** 是否显示字段计数，默认为 true */
    showFieldCount?: boolean
    /** 动画持续时间（毫秒），默认为 300 */
    animationDuration?: number
  }
  /** 操作按钮配置 */
  actions?: {
    /** 是否显示操作按钮组，默认为 false */
    enabled?: boolean
    /** 按钮组位置，默认为 'bottom' */
    position?: 'top' | 'bottom'
    /** 提交按钮配置 */
    submit?: {
      /** 按钮文本，默认为 '提交' */
      text?: string
      /** 点击回调函数 */
      onClick?: () => void | Promise<void>
    }
    /** 重置按钮配置 */
    reset?: {
      /** 按钮文本，默认为 '重置' */
      text?: string
      /** 点击回调函数 */
      onClick?: () => void | Promise<void>
    }
  }
}

/**
 * 字段布局接口
 * 定义单个字段的布局配置
 */
export interface FieldLayout {
  /** 字段占用的列数 */
  span?: number
  /** 字段左侧偏移的列数 */
  offset?: number
  /** 字段的显示顺序 */
  order?: number
  /** 响应式布局配置 */
  responsive?: {
    xs?: { span?: number; offset?: number }
    sm?: { span?: number; offset?: number }
    md?: { span?: number; offset?: number }
    lg?: { span?: number; offset?: number }
    xl?: { span?: number; offset?: number }
    xxl?: { span?: number; offset?: number }
  }
}

/**
 * 表单操作接口
 * 定义表单的操作方法
 */
export interface FormActions<T = Record<string, any>> {
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => void
  /** 设置多个字段值 */
  setFieldsValue: (values: Partial<T>) => void
  /** 获取字段值 */
  getFieldValue: (name: string) => any
  /** 获取所有字段值 */
  getFieldsValue: () => T
  /** 设置字段错误 */
  setFieldError: (name: string, error: string) => void
  /** 设置多个字段错误 */
  setFieldsError: (errors: Record<string, string>) => void
  /** 清除字段错误 */
  clearFieldError: (name: string) => void
  /** 清除所有错误 */
  clearErrors: () => void
  /** 验证指定字段 */
  validateField: (name: string) => Promise<boolean>
  /** 验证多个字段 */
  validateFields: (names?: string[]) => Promise<boolean>
  /** 验证整个表单 */
  validateForm: () => Promise<boolean>
  /** 重置指定字段 */
  resetField: (name: string) => void
  /** 重置多个字段 */
  resetFields: (names?: string[]) => void
  /** 重置整个表单 */
  resetForm: () => void
  /** 提交表单 */
  submitForm: () => Promise<void>
  /** 标记字段为已触摸 */
  touchField: (name: string) => void
  /** 标记多个字段为已触摸 */
  touchFields: (names: string[]) => void
}

/**
 * 表单实例接口
 * 表单组件暴露的实例方法和属性
 */
export interface FormInstance<T = Record<string, any>> extends FormActions<T> {
  /** 表单状态的响应式引用 */
  state: Ref<FormState<T>>
  /** 表单值的响应式引用 */
  values: Ref<T>
  /** 表单错误的响应式引用 */
  errors: Ref<Record<string, string[]>>
  /** 表单是否有效的响应式引用 */
  valid: Ref<boolean>
  /** 表单是否正在提交的响应式引用 */
  submitting: Ref<boolean>
}

/**
 * 字段实例接口
 * 字段组件暴露的实例方法和属性
 */
export interface FieldInstance {
  /** 字段状态的响应式引用 */
  state: Ref<FieldState>
  /** 字段值的响应式引用 */
  value: Ref<any>
  /** 字段错误的响应式引用 */
  error: Ref<string | undefined>
  /** 设置字段值 */
  setValue: (value: any) => void
  /** 设置字段错误 */
  setError: (error: string) => void
  /** 清除字段错误 */
  clearError: () => void
  /** 验证字段 */
  validate: () => Promise<boolean>
  /** 重置字段 */
  reset: () => void
  /** 标记字段为已触摸 */
  touch: () => void
}

/**
 * 事件回调类型定义
 */
export interface FormEventCallbacks<T = Record<string, any>> {
  /** 表单值改变时的回调 */
  onValuesChange?: (values: T, changedValues: Partial<T>) => void
  /** 字段值改变时的回调 */
  onFieldChange?: (name: string, value: any, values: T) => void
  /** 表单提交时的回调 */
  onSubmit?: (values: T) => void | Promise<void>
  /** 表单提交失败时的回调 */
  onSubmitFailed?: (errors: Record<string, string[]>, values: T) => void
  /** 表单验证失败时的回调 */
  onValidationFailed?: (errors: Record<string, string[]>, values: T) => void
  /** 表单重置时的回调 */
  onReset?: (values: T) => void
}

/**
 * 验证引擎配置接口
 */
export interface ValidationEngineConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存超时时间（毫秒） */
  cacheTimeout?: number
  /** 是否启用异步验证 */
  enableAsync?: boolean
  /** 最大并发验证数量 */
  maxConcurrentValidations?: number
}

/**
 * 验证上下文接口
 */
export interface ValidationContext {
  /** 字段名称 */
  field: string
  /** 字段值 */
  value: any
  /** 验证规则 */
  rule: ValidationRule
  /** 表单数据 */
  formData: Record<string, any>
  /** 所有表单值 */
  allValues: Record<string, any>
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息 */
  message?: string
  /** 错误消息数组 */
  errors?: string[]
  /** 字段名称 */
  field?: string
  /** 字段错误映射 */
  fieldErrors?: Record<string, string[]>
}

/**
 * 验证器函数类型
 */
export type ValidatorFunction = (context: ValidationContext) => ValidationResult | Promise<ValidationResult>

/**
 * 字段实例接口（框架无关）
 */
export interface FieldInstance {
  /** 字段名称 */
  name: string
  /** 字段配置 */
  config: FieldConfig
  /** 字段状态 */
  state: FieldState
  /** 更新字段状态 */
  updateState: (updates: Partial<FieldState>) => void
  /** 验证字段 */
  validate: () => Promise<boolean>
}
