// 表单配置相关类型定义

import type { FormItemConfig } from './field'
import type { LayoutConfig } from './layout'
import type { ValidationConfig } from './validation'
import type { FormEvents } from './events'
import type { ThemeConfig } from './theme'
import type { FormGroupConfig } from './group'

/**
 * 表单配置选项
 */
export interface FormOptions {
  /** 表单字段配置 */
  fields: FormItemConfig[]

  /** 布局配置 */
  layout?: LayoutConfig

  /** 验证配置 */
  validation?: ValidationConfig

  /** 主题配置 */
  theme?: ThemeConfig

  /** 分组配置 */
  groups?: FormGroupConfig[]

  /** 表单类型 */
  type?: FormType

  /** 是否只读 */
  readonly?: boolean

  /** 是否禁用 */
  disabled?: boolean

  /** 表单标题 */
  title?: string

  /** 表单描述 */
  description?: string

  /** 自定义CSS类名 */
  className?: string

  /** 自定义样式 */
  style?: Record<string, any>
}

/**
 * 表单类型
 */
export type FormType = 'query' | 'detail' | 'edit' | 'custom'

/**
 * 表单数据
 */
export type FormData = Record<string, any>

/**
 * 表单状态
 */
export interface FormState {
  /** 表单数据 */
  data: FormData

  /** 验证错误 */
  errors: Record<string, string[]>

  /** 字段状态 */
  fieldStates: Record<string, FieldState>

  /** 是否正在提交 */
  submitting: boolean

  /** 是否正在验证 */
  validating: boolean

  /** 表单是否已修改 */
  dirty: boolean

  /** 表单是否有效 */
  valid: boolean

  /** 是否已初始化 */
  initialized: boolean
}

/**
 * 字段状态
 */
export interface FieldState {
  /** 字段值 */
  value: any

  /** 是否已修改 */
  dirty: boolean

  /** 是否已访问 */
  touched: boolean

  /** 是否正在验证 */
  validating: boolean

  /** 验证错误 */
  errors: string[]

  /** 是否有效 */
  valid: boolean

  /** 是否可见 */
  visible: boolean

  /** 是否禁用 */
  disabled: boolean

  /** 是否只读 */
  readonly: boolean
}

/**
 * 表单实例接口
 */
export interface IFormInstance {
  /** 获取表单数据 */
  getFormData(): FormData

  /** 设置表单数据 */
  setFormData(data: FormData): void

  /** 获取字段值 */
  getFieldValue(name: string): any

  /** 设置字段值 */
  setFieldValue(name: string, value: any): void

  /** 验证表单 */
  validate(): Promise<boolean>

  /** 验证字段 */
  validateField(name: string): Promise<boolean>

  /** 重置表单 */
  reset(): void

  /** 重置字段 */
  resetField(name: string): void

  /** 清空验证错误 */
  clearValidation(): void

  /** 提交表单 */
  submit(): Promise<void>

  /** 监听事件 */
  on<K extends keyof FormEvents>(event: K, handler: FormEvents[K]): void

  /** 取消监听事件 */
  off<K extends keyof FormEvents>(event: K, handler: FormEvents[K]): void

  /** 触发事件 */
  emit<K extends keyof FormEvents>(
    event: K,
    ...args: Parameters<FormEvents[K]>
  ): void

  /** 销毁表单实例 */
  destroy(): void
}

/**
 * 表单配置构建器
 */
export interface FormConfigBuilder {
  /** 添加字段 */
  addField(field: FormItemConfig): FormConfigBuilder

  /** 设置布局 */
  setLayout(layout: LayoutConfig): FormConfigBuilder

  /** 设置验证 */
  setValidation(validation: ValidationConfig): FormConfigBuilder

  /** 设置主题 */
  setTheme(theme: ThemeConfig): FormConfigBuilder

  /** 构建配置 */
  build(): FormOptions
}
