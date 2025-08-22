/**
 * @fileoverview Core type definitions for the @ldesign/form package
 * @author LDesign Team
 */

import type { Component, Ref, VNode } from 'vue'

// ================================
// 基础类型定义
// ================================

/**
 * 表单字段值类型
 */
export type FormFieldValue = string | number | boolean | Date | null | undefined | Array<string | number | boolean | Date | null | undefined> | Record<string, string | number | boolean | Date | null | undefined>

/**
 * 表单数据类型
 */
export type FormData = Record<string, FormFieldValue>

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * 断点类型
 */
export type BreakpointType = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * 标题位置
 */
export type LabelPosition = 'left' | 'right' | 'top'

/**
 * 按钮位置
 */
export type ButtonPosition = 'inline' | 'newline'

/**
 * 按钮对齐方式
 */
export type ButtonAlign = 'left' | 'center' | 'right'

/**
 * 展开方式
 */
export type ExpandMode = 'toggle' | 'modal'

/**
 * 表单类型
 */
export type FormType = 'query' | 'detail' | 'edit' | 'custom'

// ================================
// 验证系统类型
// ================================

/**
 * 验证规则函数
 */
export type ValidatorFunction = (value: FormFieldValue, allValues: FormData) => boolean | string | Promise<boolean | string>

/**
 * 内置验证规则类型
 */
export type BuiltInValidatorType =
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'

/**
 * 验证规则配置
 */
export interface ValidationRule {
  /** 验证器类型或自定义验证函数 */
  validator: BuiltInValidatorType | ValidatorFunction
  /** 验证失败时的错误信息 */
  message?: string
  /** 验证器参数 */
  params?: Record<string, any>
  /** 是否异步验证 */
  async?: boolean
  /** 何时触发验证 */
  trigger?: 'change' | 'blur' | 'submit'
}

/**
 * 字段验证结果
 */
export interface FieldValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息 */
  message?: string
  /** 验证规则名称 */
  rule?: string
}

/**
 * 表单验证结果
 */
export interface FormValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 字段验证结果 */
  errors: Record<string, FieldValidationResult>
}

// ================================
// 条件渲染系统类型
// ================================

/**
 * 条件渲染配置
 */
export interface ConditionalRenderConfig {
  /** 依赖的字段名 */
  dependsOn: string | string[]
  /** 条件判断函数 */
  condition: (values: FormData) => boolean
  /** 动态配置函数 */
  render?: (values: FormData) => Partial<FormItemConfig>
}

// ================================
// 表单配置类型
// ================================

/**
 * 响应式断点配置
 */
export interface ResponsiveBreakpoints {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

/**
 * 响应式配置
 */
export type ResponsiveConfig<T> = T | Partial<Record<BreakpointType, T>>

/**
 * 表单项配置
 */
export interface FormItemConfig {
  /** 字段标题/标签 */
  title: string
  /** 字段名称，用于数据绑定 */
  name: string
  /** 所占列数，支持数值或百分比 */
  span?: number | string | ResponsiveConfig<number | string>
  /** 表单组件类型 */
  component: string | Component
  /** 传递给表单组件的属性对象 */
  props?: Record<string, any>
  /** 字段默认值 */
  defaultValue?: FormFieldValue
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hidden?: boolean
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 条件渲染配置 */
  conditionalRender?: ConditionalRenderConfig
  /** 字段级别的样式类 */
  class?: string | string[] | Record<string, boolean>
  /** 字段级别的内联样式 */
  style?: string | Record<string, string | number>
  /** 字段提示信息 */
  tooltip?: string
  /** 字段帮助文本 */
  help?: string
}

/**
 * 表单组配置
 */
export interface FormGroupConfig {
  /** 分组名称 */
  groupName: string
  /** 分组标题 */
  title?: string
  /** 是否可折叠 */
  collapsible?: boolean
  /** 默认是否折叠 */
  collapsed?: boolean
  /** 分组内的字段配置 */
  fields: FormItemConfig[]
  /** 分组样式类 */
  class?: string | string[] | Record<string, boolean>
  /** 分组内联样式 */
  style?: string | Record<string, string | number>
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 默认展示行数，超出部分可展开/收起 */
  defaultRows?: number
  /** 每列最小宽度，单位像素 */
  minColumnWidth?: number | ResponsiveConfig<number>
  /** 是否自动计算列数 */
  autoCalculate?: boolean
  /** 固定列数，设置后禁用 autoCalculate */
  columns?: number | ResponsiveConfig<number>
  /** 表单项水平间距，单位像素 */
  horizontalGap?: number | ResponsiveConfig<number>
  /** 表单项垂直间距，单位像素 */
  verticalGap?: number | ResponsiveConfig<number>
  /** 响应式断点配置 */
  breakpoints?: ResponsiveBreakpoints
}

/**
 * 标题系统配置
 */
export interface LabelConfig {
  /** 是否显示标题后的冒号 */
  showColon?: boolean
  /** 标题位置 */
  position?: LabelPosition | ResponsiveConfig<LabelPosition>
  /** 标题宽度 */
  width?: 'auto' | number | number[] | ResponsiveConfig<'auto' | number | number[]>
  /** 标题对齐方式 */
  align?: 'left' | 'center' | 'right' | ResponsiveConfig<'left' | 'center' | 'right'>
  /** 标题样式类 */
  class?: string | string[] | Record<string, boolean>
  /** 标题内联样式 */
  style?: string | Record<string, string | number>
}

/**
 * 按钮组配置
 */
export interface ButtonConfig {
  /** 按钮位置 */
  position?: ButtonPosition | ResponsiveConfig<ButtonPosition>
  /** 按钮组所占列数 */
  span?: number | ResponsiveConfig<number>
  /** 按钮对齐方式 */
  align?: ButtonAlign | ResponsiveConfig<ButtonAlign>
  /** 展开方式 */
  expandMode?: ExpandMode
  /** 展开按钮文本 */
  expandText?: string
  /** 收起按钮文本 */
  collapseText?: string
  /** 是否显示提交按钮 */
  showSubmit?: boolean
  /** 提交按钮文本 */
  submitText?: string
  /** 是否显示重置按钮 */
  showReset?: boolean
  /** 重置按钮文本 */
  resetText?: string
  /** 是否显示展开/收起按钮 */
  showExpand?: boolean
  /** 自定义按钮配置 */
  custom?: Array<{
    text: string
    type?: 'primary' | 'default' | 'danger' | 'warning' | 'success'
    onClick: (formData: FormData) => void | Promise<void>
    disabled?: boolean | ((formData: FormData) => boolean)
    loading?: boolean | ((formData: FormData) => boolean)
  }>
}

/**
 * 样式配置
 */
export interface StyleConfig {
  /** 表单类型 */
  type?: FormType
  /** 主题名称 */
  theme?: string
  /** 自定义CSS变量 */
  cssVars?: Record<string, string | number>
  /** 表单容器样式类 */
  class?: string | string[] | Record<string, boolean>
  /** 表单容器内联样式 */
  style?: string | Record<string, string | number>
  /** 是否启用响应式设计 */
  responsive?: boolean
}

/**
 * 完整的表单配置选项
 */
export interface FormOptions {
  /** 表单字段配置 */
  fields?: FormItemConfig[]
  /** 表单分组配置 */
  groups?: FormGroupConfig[]
  /** 布局配置 */
  layout?: LayoutConfig
  /** 标题系统配置 */
  label?: LabelConfig
  /** 按钮组配置 */
  button?: ButtonConfig
  /** 样式配置 */
  style?: StyleConfig
  /** 表单级别的验证规则 */
  rules?: Record<string, ValidationRule[]>
  /** 表单初始数据 */
  initialData?: FormData
  /** 是否启用开发模式调试 */
  debug?: boolean
}

// ================================
// 事件系统类型
// ================================

/**
 * 表单事件类型
 */
export interface FormEvents {
  /** 表单提交事件 */
  submit: (data: FormData, valid: boolean) => void
  /** 表单重置事件 */
  reset: (data: FormData) => void
  /** 表单验证事件 */
  validate: (result: FormValidationResult) => void
  /** 表单数据变化事件 */
  change: (data: FormData, field: string, value: FormFieldValue) => void
  /** 字段变化事件 */
  fieldChange: (field: string, value: FormFieldValue, oldValue: FormFieldValue) => void
  /** 字段获得焦点事件 */
  fieldFocus: (field: string, value: FormFieldValue) => void
  /** 字段失去焦点事件 */
  fieldBlur: (field: string, value: FormFieldValue) => void
  /** 字段验证事件 */
  fieldValidate: (field: string, result: FieldValidationResult) => void
  /** 表单展开/收起事件 */
  expand: (expanded: boolean) => void
  /** 分组展开/收起事件 */
  groupToggle: (groupName: string, collapsed: boolean) => void
}

/**
 * 事件监听器类型
 */
export type EventListener<T extends keyof FormEvents> = FormEvents[T]

// ================================
// 组件相关类型
// ================================

/**
 * 表单组件属性类型
 */
export interface FormComponentProps {
  /** 字段值 */
  modelValue?: FormFieldValue
  /** 字段配置 */
  config: FormItemConfig
  /** 是否禁用 */
  disabled?: boolean
  /** 验证错误信息 */
  error?: string
  /** 是否必填 */
  required?: boolean
  /** 组件大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否只读 */
  readonly?: boolean
}

/**
 * 表单组件发射事件类型
 */
export interface FormComponentEmits {
  /** 更新值 */
  'update:modelValue': (value: FormFieldValue) => void
  /** 获得焦点 */
  focus: (event: FocusEvent) => void
  /** 失去焦点 */
  blur: (event: FocusEvent) => void
  /** 值变化 */
  change: (value: FormFieldValue, oldValue: FormFieldValue) => void
}

// ================================
// API 接口类型
// ================================

/**
 * 表单实例接口
 */
export interface FormInstance {
  /** 设置表单数据 */
  setFormData(data: Partial<FormData>): void
  /** 获取表单数据 */
  getFormData(): FormData
  /** 设置单个字段值 */
  setFieldValue(name: string, value: FormFieldValue): void
  /** 获取单个字段值 */
  getFieldValue(name: string): FormFieldValue
  /** 验证表单 */
  validate(): Promise<FormValidationResult>
  /** 验证单个字段 */
  validateField(name: string): Promise<FieldValidationResult>
  /** 重置表单 */
  reset(): void
  /** 清空验证错误 */
  clearValidation(): void
  /** 清空单个字段验证错误 */
  clearFieldValidation(name: string): void
  /** 提交表单 */
  submit(): Promise<{ data: FormData, valid: boolean }>
  /** 监听事件 */
  on<T extends keyof FormEvents>(event: T, callback: EventListener<T>): void
  /** 取消监听事件 */
  off<T extends keyof FormEvents>(event: T, callback: EventListener<T>): void
  /** 触发事件 */
  emit<T extends keyof FormEvents>(event: T, ...args: Parameters<FormEvents[T]>): void
  /** 销毁表单实例 */
  destroy(): void
  /** 获取表单配置 */
  getOptions(): FormOptions
  /** 更新表单配置 */
  updateOptions(options: Partial<FormOptions>): void
  /** 获取验证错误 */
  getErrors(): Record<string, FieldValidationResult>
  /** 是否有验证错误 */
  hasErrors(): boolean
  /** 获取表单状态 */
  getState(): {
    data: FormData
    errors: Record<string, FieldValidationResult>
    loading: boolean
    expanded: boolean
    groupStates: Record<string, { collapsed: boolean }>
  }
}

/**
 * Composition API 返回类型
 */
export interface UseFormReturn {
  /** 表单数据响应式引用 */
  formData: Ref<FormData>
  /** 验证错误响应式引用 */
  errors: Ref<Record<string, FieldValidationResult>>
  /** 加载状态响应式引用 */
  loading: Ref<boolean>
  /** 展开状态响应式引用 */
  expanded: Ref<boolean>
  /** 分组状态响应式引用 */
  groupStates: Ref<Record<string, { collapsed: boolean }>>
  /** 表单实例 */
  formInstance: FormInstance
  /** 验证表单 */
  validate: () => Promise<FormValidationResult>
  /** 重置表单 */
  reset: () => void
  /** 设置字段值 */
  setFieldValue: (name: string, value: FormFieldValue) => void
  /** 获取字段值 */
  getFieldValue: (name: string) => FormFieldValue
  /** 提交表单 */
  submit: () => Promise<{ data: FormData, valid: boolean }>
  /** 渲染表单 */
  renderForm: () => VNode
}

// ================================
// 原生 JavaScript API 类型
// ================================

/**
 * 原生 JavaScript 表单创建选项
 */
export interface VanillaFormOptions extends FormOptions {
  /** 挂载容器 */
  container: string | HTMLElement
  /** 提交事件回调 */
  onSubmit?: (data: FormData, valid: boolean) => void | Promise<void>
  /** 数据变化回调 */
  onChange?: (data: FormData, field: string, value: FormFieldValue) => void
  /** 验证回调 */
  onValidate?: (result: FormValidationResult) => void
  /** 重置回调 */
  onReset?: (data: FormData) => void
  /** 字段变化回调 */
  onFieldChange?: (field: string, value: FormFieldValue, oldValue: FormFieldValue) => void
  /** 字段焦点回调 */
  onFieldFocus?: (field: string, value: FormFieldValue) => void
  /** 字段失焦回调 */
  onFieldBlur?: (field: string, value: FormFieldValue) => void
}

/**
 * 原生 JavaScript 表单实例工厂函数返回类型
 */
export interface VanillaFormInstance extends FormInstance {
  /** 获取 DOM 容器 */
  getContainer(): HTMLElement
  /** 重新渲染表单 */
  render(): void
  /** 挂载到新容器 */
  mount(container: string | HTMLElement): void
  /** 卸载表单 */
  unmount(): void
}

// ================================
// 插件系统类型
// ================================

/**
 * 表单插件接口
 */
export interface FormPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 安装插件 */
  install: (app: any, options?: any) => void
  /** 组件注册 */
  components?: Record<string, Component>
  /** 验证器注册 */
  validators?: Record<string, ValidatorFunction>
  /** 样式注册 */
  styles?: string | Record<string, string>
}

// ================================
// 工具类型
// ================================

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 可选键类型
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 必需键类型
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]