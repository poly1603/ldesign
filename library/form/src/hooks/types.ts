/**
 * Hooks 类型定义
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Ref, ComputedRef } from 'vue'
import type { FormConfig, FieldConfig, ValidationRule, LayoutConfig } from '../types'

/**
 * useForm Hook 选项
 */
export interface UseFormOptions<T = Record<string, any>> extends FormConfig<T> {
  /** 表单ID */
  id?: string
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * useForm Hook 返回值
 */
export interface UseFormReturn<T = Record<string, any>> {
  /** 表单值 */
  values: ComputedRef<T>
  /** 表单错误 */
  errors: ComputedRef<Record<string, string[]>>
  /** 表单是否有效 */
  valid: ComputedRef<boolean>
  /** 表单是否正在提交 */
  submitting: ComputedRef<boolean>
  /** 表单是否正在验证 */
  validating: ComputedRef<boolean>
  /** 表单是否为脏数据 */
  dirty: ComputedRef<boolean>
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => void
  /** 设置多个字段值 */
  setFieldsValue: (values: Partial<T>) => void
  /** 获取字段值 */
  getFieldValue: (name: string) => any
  /** 获取所有字段值 */
  getFieldsValue: () => T
  /** 验证字段 */
  validateField: (name: string) => Promise<boolean>
  /** 验证多个字段 */
  validateFields: (names?: string[]) => Promise<boolean>
  /** 验证表单 */
  validateForm: () => Promise<boolean>
  /** 重置字段 */
  resetField: (name: string) => void
  /** 重置多个字段 */
  resetFields: (names?: string[]) => void
  /** 重置表单 */
  resetForm: () => void
  /** 提交表单 */
  submitForm: () => Promise<void>
  /** 清除错误 */
  clearErrors: () => void
  /** 清除字段错误 */
  clearFieldError: (name: string) => void
  /** 设置字段错误 */
  setFieldError: (name: string, error: string) => void
  /** 设置多个字段错误 */
  setFieldsError: (errors: Record<string, string>) => void
}

/**
 * useField Hook 选项
 */
export interface UseFieldOptions {
  /** 字段名称 */
  name: string
  /** 初始值 */
  initialValue?: any
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 验证触发方式 */
  validateTrigger?: string | string[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
}

/**
 * useField Hook 返回值
 */
export interface UseFieldReturn {
  /** 字段值 */
  value: Ref<any>
  /** 字段错误 */
  errors: ComputedRef<string[]>
  /** 字段是否有错误 */
  hasError: ComputedRef<boolean>
  /** 字段是否正在验证 */
  validating: ComputedRef<boolean>
  /** 字段是否被触摸 */
  touched: ComputedRef<boolean>
  /** 字段是否为脏数据 */
  dirty: ComputedRef<boolean>
  /** 设置字段值 */
  setValue: (value: any) => void
  /** 验证字段 */
  validate: () => Promise<boolean>
  /** 重置字段 */
  reset: () => void
  /** 清除错误 */
  clearError: () => void
  /** 标记为已触摸 */
  touch: () => void
}

/**
 * useValidation Hook 选项
 */
export interface UseValidationOptions {
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 验证触发方式 */
  trigger?: string | string[]
  /** 是否立即验证 */
  immediate?: boolean
}

/**
 * useValidation Hook 返回值
 */
export interface UseValidationReturn {
  /** 验证错误 */
  errors: Ref<string[]>
  /** 是否有错误 */
  hasError: ComputedRef<boolean>
  /** 是否正在验证 */
  validating: Ref<boolean>
  /** 验证函数 */
  validate: (value: any, values?: Record<string, any>) => Promise<boolean>
  /** 清除错误 */
  clearErrors: () => void
  /** 添加验证规则 */
  addRule: (rule: ValidationRule) => void
  /** 移除验证规则 */
  removeRule: (index: number) => void
  /** 设置验证规则 */
  setRules: (rules: ValidationRule[]) => void
}

/**
 * useLayout Hook 选项
 */
export interface UseLayoutOptions extends LayoutConfig {
  /** 容器元素引用 */
  containerRef?: Ref<HTMLElement | undefined>
}

/**
 * useLayout Hook 返回值
 */
export interface UseLayoutReturn {
  /** 当前列数 */
  columns: ComputedRef<number>
  /** 当前断点 */
  breakpoint: ComputedRef<string>
  /** 容器宽度 */
  containerWidth: Ref<number>
  /** 计算字段样式 */
  calculateFieldStyles: (field: FieldConfig) => Record<string, string | number>
  /** 分组字段 */
  groupFields: (fields: FieldConfig[]) => FieldConfig[][]
  /** 更新布局配置 */
  updateConfig: (config: Partial<LayoutConfig>) => void
}
