/**
 * 表单组件核心类型定义
 * 
 * 本文件定义了表单系统的核心类型，包括：
 * - 表单状态管理相关类型
 * - 字段配置和状态类型
 * - 验证系统类型
 * - 布局系统类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Component, Ref } from 'vue'

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
  /** 表单初始值 */
  initialValues?: T
  /** 验证模式配置 */
  validationSchema?: ValidationSchema
  /** 是否在值改变时验证，默认为 true */
  validateOnChange?: boolean
  /** 是否在失去焦点时验证，默认为 true */
  validateOnBlur?: boolean
  /** 是否在提交时验证，默认为 true */
  validateOnSubmit?: boolean
  /** 是否在挂载时验证，默认为 false */
  validateOnMount?: boolean
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
  /** 字段组件 */
  component: Component
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
}

/**
 * 字段状态接口
 * 管理单个字段的状态信息
 */
export interface FieldState {
  /** 字段当前值 */
  value: any
  /** 字段验证错误信息 */
  error?: string
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
 * 布局配置接口
 * 定义表单的整体布局配置
 */
export interface LayoutConfig {
  /** 表单列数，默认为 1 */
  columns?: number
  /** 字段间距，默认为 16 */
  gutter?: number
  /** 标签宽度，可以是数字（px）或字符串（如 '120px', '20%'） */
  labelWidth?: number | string
  /** 标签对齐方式，默认为 'right' */
  labelAlign?: 'left' | 'right' | 'top'
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
