/**
 * @ldesign/form - Configuration Type Definitions
 * 配置类型定义
 */

import type { ValidationRule, FormValues } from './core'

/**
 * 标签对齐方式
 */
export type LabelAlign = 'left' | 'right' | 'top'

/**
 * 按钮位置
 */
export type ButtonPosition = 'inline' | 'block'

/**
 * 按钮对齐方式
 */
export type ButtonAlign = 'left' | 'center' | 'right'

/**
 * 展开模式
 */
export type ExpandMode = 'visible' | 'popup'

/**
 * 字段占列配置（支持数字或百分比字符串）
 */
export type FieldSpan = number | string

/**
 * 响应式断点
 */
export interface ResponsiveBreakpoints {
  /** < 576px */
  xs?: number
  /** >= 576px */
  sm?: number
  /** >= 768px */
  md?: number
  /** >= 992px */
  lg?: number
  /** >= 1200px */
  xl?: number
  /** >= 1600px */
  xxl?: number
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 列宽（用于自动计算列数） */
  spanWidth?: number
  /** 最大列数 */
  maxSpan?: number
  /** 最小列数 */
  minSpan?: number
  /** 垂直间距 */
  space?: number
  /** 标题与组件间距 */
  gap?: number
  /** 标题对齐方式 */
  labelAlign?: LabelAlign
  /** 标题宽度 */
  labelWidth?: number | string
  /** 是否响应式 */
  responsive?: boolean
  /** 响应式断点配置 */
  breakpoints?: ResponsiveBreakpoints
}

/**
 * 展开收起配置
 */
export interface ExpandConfig {
  /** 预览行数 */
  previewRows?: number
  /** 展开模式 */
  expandMode?: ExpandMode
  /** 默认是否展开 */
  defaultExpanded?: boolean
  /** 展开按钮文本 */
  expandText?: string
  /** 收起按钮文本 */
  collapseText?: string
}

/**
 * 按钮配置
 */
export interface ButtonConfig {
  /** 按钮位置 */
  buttonPosition?: ButtonPosition
  /** 按钮对齐方式 */
  buttonAlign?: ButtonAlign
  /** 按钮占列数 */
  buttonSpan?: number
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  /** 提交按钮文本 */
  submitText?: string
  /** 是否显示重置按钮 */
  showReset?: boolean
  /** 重置按钮文本 */
  resetText?: string
  /** 是否显示展开按钮 */
  showExpand?: boolean
}

/**
 * 字段配置
 */
export interface FieldConfig {
  /** 字段名称 */
  name: string
  /** 字段标签 */
  label?: string
  /** 字段组件类型 */
  component?: string | any
  /** 组件属性 */
  props?: Record<string, any>
  /** 占用列数 */
  span?: FieldSpan
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 是否必填 */
  required?: boolean
  /** 默认值 */
  defaultValue?: any
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可见 */
  visible?: boolean | ((values: FormValues) => boolean)
  /** 字段依赖 */
  dependencies?: string[]
  /** 提示信息 */
  tooltip?: string
  /** 占位符 */
  placeholder?: string
  /** 选项列表（用于 select、radio、checkbox 等） */
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  /** 异步加载选项 */
  loadOptions?: () => Promise<Array<{ label: string; value: any }>>
}

/**
 * 表单配置
 */
export interface FormConfig {
  /** 初始值 */
  initialValues?: FormValues
  /** 布局配置 */
  layout?: LayoutConfig
  /** 展开收起配置 */
  expand?: ExpandConfig
  /** 按钮配置 */
  button?: ButtonConfig
  /** 字段配置列表 */
  fields?: FieldConfig[]
  /** 值变化时是否验证 */
  validateOnChange?: boolean
  /** 失焦时是否验证 */
  validateOnBlur?: boolean
  /** 提交时是否验证 */
  validateOnSubmit?: boolean
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
}

/**
 * 表单事件配置
 */
export interface FormEvents {
  /** 提交事件 */
  onSubmit?: (values: FormValues) => void | Promise<void>
  /** 重置事件 */
  onReset?: () => void
  /** 值变化事件 */
  onChange?: (field: string, value: any, values: FormValues) => void
  /** 验证失败事件 */
  onValidateFailed?: (errors: Record<string, string[]>) => void
  /** 展开收起事件 */
  onExpandChange?: (expanded: boolean) => void
}

/**
 * 完整表单选项
 */
export interface FormOptions extends FormConfig, FormEvents {
  /** 表单名称（用于调试） */
  name?: string
}




