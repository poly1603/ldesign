/**
 * @fileoverview Vue 3 specific types and interfaces for the form system
 * @author LDesign Team
 */

import type {
  App,
  Component,
  ComputedRef,
  DefineComponent,
  ExtractPropTypes,
  PropType,
  Ref,
  VNode,
  VNodeChild,
} from 'vue'
import type {
  FormData,
  FormFieldValue,
  FormInstance,
  FormItemConfig,
  FormOptions,
  FormValidationResult,
  FieldValidationResult,
  UseFormReturn,
} from './index'
import type { EventEmitter, FormEventMap } from './events'

// ================================
// Vue 组件属性类型
// ================================

/**
 * 动态表单组件属性
 */
export interface DynamicFormProps {
  /** 表单数据 v-model */
  modelValue?: FormData
  /** 表单配置选项 */
  options: FormOptions
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 表单大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示验证错误 */
  showValidation?: boolean
  /** 验证触发方式 */
  validateTrigger?: 'change' | 'blur' | 'submit'
  /** 是否立即验证 */
  validateFirst?: boolean
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>
  /** 自定义样式 */
  style?: string | Record<string, string | number>
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 动态表单组件事件
 */
export interface DynamicFormEmits {
  /** 更新表单数据 */
  'update:modelValue': (value: FormData) => void
  /** 表单提交 */
  submit: (data: FormData, valid: boolean) => void
  /** 表单重置 */
  reset: (data: FormData) => void
  /** 表单验证 */
  validate: (result: FormValidationResult) => void
  /** 表单数据变化 */
  change: (data: FormData, field: string, value: FormFieldValue) => void
  /** 字段变化 */
  fieldChange: (field: string, value: FormFieldValue, oldValue: FormFieldValue) => void
  /** 字段获得焦点 */
  fieldFocus: (field: string, value: FormFieldValue) => void
  /** 字段失去焦点 */
  fieldBlur: (field: string, value: FormFieldValue) => void
  /** 字段验证 */
  fieldValidate: (field: string, result: FieldValidationResult) => void
  /** 表单展开/收起 */
  expand: (expanded: boolean) => void
  /** 分组展开/收起 */
  groupToggle: (groupName: string, collapsed: boolean) => void
  /** 表单准备就绪 */
  ready: (instance: FormInstance) => void
  /** 表单错误 */
  error: (error: Error) => void
}

/**
 * 表单项组件属性
 */
export interface FormItemProps {
  /** 字段配置 */
  config: FormItemConfig
  /** 字段值 */
  modelValue?: FormFieldValue
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 组件大小 */
  size?: 'small' | 'medium' | 'large'
  /** 验证错误信息 */
  error?: string
  /** 是否显示验证错误 */
  showError?: boolean
  /** 字段索引 */
  index?: number
  /** 表单实例引用 */
  formInstance?: FormInstance
}

/**
 * 表单项组件事件
 */
export interface FormItemEmits {
  /** 更新字段值 */
  'update:modelValue': (value: FormFieldValue) => void
  /** 字段获得焦点 */
  focus: (event: FocusEvent) => void
  /** 字段失去焦点 */
  blur: (event: FocusEvent) => void
  /** 字段值变化 */
  change: (value: FormFieldValue, oldValue: FormFieldValue) => void
}

// ================================
// Vue 组合式 API 类型
// ================================

/**
 * useForm 配置选项
 */
export interface UseFormOptions extends FormOptions {
  /** 是否立即初始化 */
  immediate?: boolean
  /** 自动验证延迟 */
  autoValidateDelay?: number
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * useFormItem 返回类型
 */
export interface UseFormItemReturn {
  /** 字段值 */
  value: Ref<FormFieldValue>
  /** 字段错误 */
  error: Ref<string>
  /** 是否验证中 */
  validating: Ref<boolean>
  /** 是否已修改 */
  dirty: Ref<boolean>
  /** 是否已触碰 */
  touched: Ref<boolean>
  /** 设置字段值 */
  setValue: (value: FormFieldValue) => void
  /** 验证字段 */
  validate: () => Promise<FieldValidationResult>
  /** 清空验证 */
  clearValidation: () => void
  /** 重置字段 */
  reset: () => void
  /** 标记为已触碰 */
  touch: () => void
}

/**
 * useFormValidation 返回类型
 */
export interface UseFormValidationReturn {
  /** 验证错误 */
  errors: Ref<Record<string, string>>
  /** 是否有错误 */
  hasErrors: ComputedRef<boolean>
  /** 是否验证中 */
  validating: Ref<boolean>
  /** 验证表单 */
  validate: () => Promise<FormValidationResult>
  /** 验证字段 */
  validateField: (field: string) => Promise<FieldValidationResult>
  /** 清空验证 */
  clearValidation: (field?: string) => void
  /** 添加自定义错误 */
  setFieldError: (field: string, error: string) => void
  /** 移除字段错误 */
  removeFieldError: (field: string) => void
}

/**
 * useFormLayout 返回类型
 */
export interface UseFormLayoutReturn {
  /** 响应式列数 */
  columns: ComputedRef<number>
  /** 响应式间距 */
  gaps: ComputedRef<{ horizontal: number, vertical: number }>
  /** 当前设备类型 */
  deviceType: Ref<'mobile' | 'tablet' | 'desktop'>
  /** 当前断点 */
  breakpoint: Ref<'xs' | 'sm' | 'md' | 'lg' | 'xl'>
  /** 容器尺寸 */
  containerSize: Ref<{ width: number, height: number }>
  /** 是否展开 */
  expanded: Ref<boolean>
  /** 可见行数 */
  visibleRows: ComputedRef<number>
  /** 切换展开状态 */
  toggleExpanded: () => void
}

// ================================
// Vue 指令类型
// ================================

/**
 * v-form-validate 指令参数
 */
export interface FormValidateDirectiveValue {
  /** 验证规则 */
  rules?: any[]
  /** 验证触发方式 */
  trigger?: 'change' | 'blur' | 'input'
  /** 错误消息显示位置 */
  errorPlacement?: 'bottom' | 'right' | 'tooltip'
}

/**
 * v-form-focus 指令参数
 */
export interface FormFocusDirectiveValue {
  /** 是否自动获得焦点 */
  auto?: boolean
  /** 延迟时间 */
  delay?: number
  /** 选择文本 */
  select?: boolean
}

// ================================
// Vue 插件类型
// ================================

/**
 * 表单插件配置
 */
export interface FormPluginOptions {
  /** 全局组件前缀 */
  prefix?: string
  /** 默认表单配置 */
  defaultOptions?: Partial<FormOptions>
  /** 全局验证器 */
  validators?: Record<string, any>
  /** 全局组件 */
  components?: Record<string, Component>
  /** 主题配置 */
  theme?: Record<string, any>
  /** 国际化配置 */
  i18n?: {
    locale?: string
    messages?: Record<string, Record<string, string>>
  }
}

/**
 * Vue 表单插件接口
 */
export interface FormPlugin {
  /** 插件安装函数 */
  install: (app: App, options?: FormPluginOptions) => void
  /** 插件版本 */
  version: string
  /** 插件名称 */
  name: string
}

// ================================
// 组件注册类型
// ================================

/**
 * 表单组件注册表
 */
export interface FormComponentRegistry {
  /** 注册组件 */
  register(name: string, component: Component): void
  /** 批量注册组件 */
  registerBatch(components: Record<string, Component>): void
  /** 获取组件 */
  get(name: string): Component | undefined
  /** 检查组件是否存在 */
  has(name: string): boolean
  /** 获取所有组件名 */
  getNames(): string[]
  /** 注销组件 */
  unregister(name: string): void
  /** 清空所有组件 */
  clear(): void
}

// ================================
// 渲染函数类型
// ================================

/**
 * 表单渲染器接口
 */
export interface FormRenderer {
  /** 渲染表单 */
  render(options: FormOptions, data: FormData): VNode
  /** 渲染表单项 */
  renderField(config: FormItemConfig, value: FormFieldValue): VNode
  /** 渲染表单组 */
  renderGroup(group: any): VNode
  /** 渲染按钮组 */
  renderButtons(config: any): VNode
}

/**
 * 自定义渲染函数类型
 */
export type CustomRenderFunction = (h: typeof VNode, props: any) => VNodeChild

/**
 * 插槽内容类型
 */
export interface FormSlots {
  /** 默认插槽 */
  default?: (props: { formData: FormData, formInstance: FormInstance }) => VNodeChild
  /** 表单头部插槽 */
  header?: (props: { formData: FormData, formInstance: FormInstance }) => VNodeChild
  /** 表单尾部插槽 */
  footer?: (props: { formData: FormData, formInstance: FormInstance }) => VNodeChild
  /** 按钮区域插槽 */
  buttons?: (props: { formData: FormData, formInstance: FormInstance }) => VNodeChild
  /** 字段前缀插槽 */
  'field-prefix'?: (props: { config: FormItemConfig, value: FormFieldValue }) => VNodeChild
  /** 字段后缀插槽 */
  'field-suffix'?: (props: { config: FormItemConfig, value: FormFieldValue }) => VNodeChild
  /** 字段标签插槽 */
  'field-label'?: (props: { config: FormItemConfig }) => VNodeChild
  /** 字段错误插槽 */
  'field-error'?: (props: { config: FormItemConfig, error: string }) => VNodeChild
  /** 分组标题插槽 */
  'group-title'?: (props: { group: any }) => VNodeChild
  /** 展开按钮插槽 */
  'expand-button'?: (props: { expanded: boolean, toggle: () => void }) => VNodeChild
}

// ================================
// 组件定义类型
// ================================

/**
 * 动态表单组件类型
 */
export type DynamicFormComponent = DefineComponent<
  DynamicFormProps,
  {},
  {},
  {},
  {},
  {},
  {},
  DynamicFormEmits,
  string,
  {},
  {},
  string,
  FormSlots
>

/**
 * 表单项组件类型
 */
export type FormItemComponent = DefineComponent<
  FormItemProps,
  {},
  {},
  {},
  {},
  {},
  {},
  FormItemEmits
>

// ================================
// 工具类型
// ================================

/**
 * 提取组件属性类型
 */
export type ExtractComponentProps<T> = T extends DefineComponent<infer P, any, any, any, any, any, any, any>
  ? P
  : never

/**
 * 提取组件事件类型
 */
export type ExtractComponentEmits<T> = T extends DefineComponent<any, any, any, any, any, any, any, infer E>
  ? E
  : never

/**
 * Vue 响应式表单数据类型
 */
export type ReactiveFormData = Ref<FormData>

/**
 * Vue 计算属性表单数据类型
 */
export type ComputedFormData = ComputedRef<FormData>

// ================================
// 导出所有类型
// ================================

export type {
  DynamicFormProps,
  DynamicFormEmits,
  FormItemProps,
  FormItemEmits,
  UseFormOptions,
  UseFormItemReturn,
  UseFormValidationReturn,
  UseFormLayoutReturn,
  FormValidateDirectiveValue,
  FormFocusDirectiveValue,
  FormPluginOptions,
  FormPlugin,
  FormComponentRegistry,
  FormRenderer,
  CustomRenderFunction,
  FormSlots,
  DynamicFormComponent,
  FormItemComponent,
  ExtractComponentProps,
  ExtractComponentEmits,
  ReactiveFormData,
  ComputedFormData,
}