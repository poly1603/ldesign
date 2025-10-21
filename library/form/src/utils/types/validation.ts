/**
 * @ldesign/form - Validation Type Definitions
 * 验证类型定义
 */

import type { FormValues, ValidationRule, ValidationResult } from './core'

/**
 * 验证器函数
 */
export type ValidatorFunction = (
  value: any,
  values: FormValues,
  field?: string
) => boolean | ValidationResult | Promise<boolean | ValidationResult>

/**
 * 验证触发时机
 */
export type ValidationTrigger = 'change' | 'blur' | 'submit' | 'manual'

/**
 * 字段验证结果
 */
export interface FieldValidationResult {
  /** 字段名称 */
  field: string
  /** 是否有效 */
  valid: boolean
  /** 错误消息列表 */
  errors: string[]
}

/**
 * 表单验证结果
 */
export interface FormValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误数量 */
  errorCount: number
  /** 字段验证结果映射 */
  fields: Record<string, FieldValidationResult>
  /** 所有错误消息 */
  errors: Record<string, string[]>
}

/**
 * 验证规则定义
 */
export interface ValidatorRuleDefinition {
  /** 规则名称 */
  name: string
  /** 验证函数 */
  validator: ValidatorFunction
  /** 默认错误消息 */
  message?: string
  /** 是否异步 */
  async?: boolean
}

/**
 * 内置验证规则参数
 */
export interface ValidationRuleParams {
  /** required 规则参数 */
  required?: {
    message?: string
  }
  /** email 规则参数 */
  email?: {
    message?: string
  }
  /** url 规则参数 */
  url?: {
    message?: string
    protocols?: string[]
  }
  /** phone 规则参数 */
  phone?: {
    message?: string
    locale?: string
  }
  /** number 规则参数 */
  number?: {
    message?: string
  }
  /** integer 规则参数 */
  integer?: {
    message?: string
  }
  /** min 规则参数 */
  min?: {
    value: number
    message?: string
  }
  /** max 规则参数 */
  max?: {
    value: number
    message?: string
  }
  /** minLength 规则参数 */
  minLength?: {
    value: number
    message?: string
  }
  /** maxLength 规则参数 */
  maxLength?: {
    value: number
    message?: string
  }
  /** pattern 规则参数 */
  pattern?: {
    value: RegExp
    message?: string
  }
}




