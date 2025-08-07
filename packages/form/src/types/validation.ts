// 验证相关类型定义

/**
 * 验证配置
 */
export interface ValidationConfig {
  /** 是否在值变化时验证 */
  validateOnChange?: boolean

  /** 是否在失去焦点时验证 */
  validateOnBlur?: boolean

  /** 是否在提交时验证 */
  validateOnSubmit?: boolean

  /** 验证延迟时间（毫秒） */
  validateDelay?: number

  /** 是否显示验证错误 */
  showErrors?: boolean

  /** 错误显示位置 */
  errorPosition?: ErrorPosition

  /** 自定义错误消息 */
  messages?: Record<string, string>

  /** 验证模式 */
  mode?: ValidationMode
}

/**
 * 错误显示位置
 */
export type ErrorPosition = 'bottom' | 'right' | 'tooltip' | 'none'

/**
 * 验证模式
 */
export type ValidationMode = 'eager' | 'lazy' | 'aggressive'

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: ValidationRuleType

  /** 规则参数 */
  params?: any

  /** 错误消息 */
  message?: string

  /** 验证触发时机 */
  trigger?: ValidationTrigger

  /** 是否异步验证 */
  async?: boolean

  /** 验证函数 */
  validator?: ValidationFunction

  /** 验证条件 */
  condition?: (value: any, formData: Record<string, any>) => boolean
}

/**
 * 验证规则类型
 */
export type ValidationRuleType =
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'integer'
  | 'float'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'
  | 'date'
  | 'time'
  | 'datetime'
  | 'array'
  | 'object'
  | 'enum'
  | 'range'

/**
 * 验证触发时机
 */
export type ValidationTrigger = 'change' | 'blur' | 'submit' | 'manual'

/**
 * 验证函数
 */
export type ValidationFunction = (
  value: any,
  formData: Record<string, any>,
  field: string
) => Promise<boolean | string> | boolean | string

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean

  /** 错误消息 */
  errors: string[]

  /** 验证的字段 */
  field?: string

  /** 验证规则 */
  rule?: ValidationRule
}

/**
 * 验证器接口
 */
export interface Validator {
  /** 验证单个字段 */
  validateField(
    value: any,
    rules: ValidationRule[],
    formData: Record<string, any>,
    field: string
  ): Promise<ValidationResult>

  /** 验证整个表单 */
  validateForm(
    formData: Record<string, any>,
    rules: Record<string, ValidationRule[]>
  ): Promise<Record<string, ValidationResult>>

  /** 添加自定义验证规则 */
  addRule(type: string, validator: ValidationFunction): void

  /** 移除验证规则 */
  removeRule(type: string): void

  /** 获取验证规则 */
  getRule(type: string): ValidationFunction | undefined
}

/**
 * 内置验证规则配置
 */
export interface BuiltinValidationRules {
  required: {
    message: string
  }
  email: {
    pattern: RegExp
    message: string
  }
  phone: {
    pattern: RegExp
    message: string
  }
  url: {
    pattern: RegExp
    message: string
  }
  number: {
    pattern: RegExp
    message: string
  }
  integer: {
    pattern: RegExp
    message: string
  }
  float: {
    pattern: RegExp
    message: string
  }
  min: {
    message: string
  }
  max: {
    message: string
  }
  minLength: {
    message: string
  }
  maxLength: {
    message: string
  }
  pattern: {
    message: string
  }
  date: {
    pattern: RegExp
    message: string
  }
  time: {
    pattern: RegExp
    message: string
  }
  datetime: {
    pattern: RegExp
    message: string
  }
}

/**
 * 异步验证器
 */
export interface AsyncValidator {
  /** 验证函数 */
  validate: ValidationFunction

  /** 防抖延迟 */
  debounce?: number

  /** 缓存结果 */
  cache?: boolean

  /** 缓存时间（毫秒） */
  cacheTime?: number
}
