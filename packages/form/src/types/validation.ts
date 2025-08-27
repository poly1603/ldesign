/**
 * 验证相关类型定义
 */

import type { AnyObject, ConditionalFunction, AsyncConditionalFunction } from './common'

// 验证触发时机
export type ValidationTrigger = 'change' | 'blur' | 'submit' | 'manual'

// 验证状态
export type ValidationStatus = 'validating' | 'success' | 'error' | 'warning'

// 内置验证器类型
export type BuiltinValidatorType = 
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
  | 'date'
  | 'time'
  | 'datetime'
  | 'json'
  | 'base64'
  | 'uuid'
  | 'ip'
  | 'mac'
  | 'creditCard'
  | 'idCard'
  | 'passport'
  | 'custom'

// 验证器函数类型
export type ValidatorFunction = (
  value: any,
  formData: AnyObject,
  fieldConfig?: any
) => boolean | string | Promise<boolean | string>

// 异步验证器函数类型
export type AsyncValidatorFunction = (
  value: any,
  formData: AnyObject,
  fieldConfig?: any
) => Promise<boolean | string>

// 验证规则配置
export interface ValidationRule {
  // 验证器类型或函数
  validator: BuiltinValidatorType | ValidatorFunction | AsyncValidatorFunction
  
  // 错误消息
  message?: string | ((value: any, formData: AnyObject) => string)
  
  // 验证触发时机
  trigger?: ValidationTrigger | ValidationTrigger[]
  
  // 验证条件（只有满足条件才执行验证）
  condition?: ConditionalFunction
  
  // 验证参数（用于内置验证器）
  value?: any
  
  // 验证优先级（数字越小优先级越高）
  priority?: number
  
  // 是否异步验证
  async?: boolean
  
  // 验证超时时间（毫秒）
  timeout?: number
  
  // 是否在验证失败时停止后续验证
  stopOnError?: boolean
  
  // 自定义验证器参数
  params?: AnyObject
}

// 验证结果
export interface ValidationResult {
  // 是否验证通过
  valid: boolean
  
  // 错误消息
  message?: string
  
  // 错误代码
  code?: string
  
  // 验证状态
  status: ValidationStatus
  
  // 验证耗时（毫秒）
  duration?: number
  
  // 验证器名称
  validator?: string
  
  // 额外信息
  extra?: AnyObject
}

// 字段验证结果
export interface FieldValidationResult extends ValidationResult {
  // 字段名称
  field: string
  
  // 字段值
  value: any
  
  // 验证规则
  rule?: ValidationRule
}

// 表单验证结果
export interface FormValidationResult {
  // 整体是否验证通过
  valid: boolean
  
  // 字段验证结果
  fields: Record<string, FieldValidationResult>
  
  // 错误字段列表
  errorFields: string[]
  
  // 警告字段列表
  warningFields: string[]
  
  // 验证总耗时（毫秒）
  duration: number
  
  // 验证时间戳
  timestamp: Date
}

// 验证错误信息
export interface ValidationError {
  // 字段名称
  field: string
  
  // 错误消息
  message: string
  
  // 错误代码
  code?: string
  
  // 错误类型
  type?: string
  
  // 错误值
  value?: any
  
  // 验证规则
  rule?: ValidationRule
}

// 验证警告信息
export interface ValidationWarning {
  // 字段名称
  field: string
  
  // 警告消息
  message: string
  
  // 警告代码
  code?: string
  
  // 警告类型
  type?: string
  
  // 警告值
  value?: any
}

// 验证配置
export interface ValidationConfig {
  // 是否启用验证
  enabled?: boolean
  
  // 默认验证触发时机
  trigger?: ValidationTrigger | ValidationTrigger[]
  
  // 是否在第一个错误时停止验证
  stopOnFirstError?: boolean
  
  // 验证超时时间（毫秒）
  timeout?: number
  
  // 是否显示验证状态
  showStatus?: boolean
  
  // 是否显示验证图标
  showIcon?: boolean
  
  // 是否显示验证消息
  showMessage?: boolean
  
  // 验证消息显示位置
  messagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'tooltip'
  
  // 自定义验证器
  customValidators?: Record<string, ValidatorFunction>
  
  // 验证规则预设
  rulePresets?: Record<string, ValidationRule[]>
  
  // 国际化配置
  i18n?: {
    locale?: string
    messages?: Record<string, Record<string, string>>
  }
  
  // 验证缓存配置
  cache?: {
    enabled?: boolean
    ttl?: number // 缓存时间（毫秒）
    maxSize?: number // 最大缓存条目数
  }
  
  // 验证防抖配置
  debounce?: {
    enabled?: boolean
    delay?: number // 防抖延迟（毫秒）
  }
  
  // 验证节流配置
  throttle?: {
    enabled?: boolean
    interval?: number // 节流间隔（毫秒）
  }
}

// 验证器注册信息
export interface ValidatorRegistration {
  // 验证器名称
  name: string
  
  // 验证器函数
  validator: ValidatorFunction
  
  // 默认错误消息
  defaultMessage?: string
  
  // 验证器描述
  description?: string
  
  // 验证器参数定义
  params?: {
    [paramName: string]: {
      type: string
      required?: boolean
      default?: any
      description?: string
    }
  }
  
  // 是否异步验证器
  async?: boolean
  
  // 验证器版本
  version?: string
  
  // 验证器作者
  author?: string
}

// 验证引擎接口
export interface ValidationEngine {
  // 注册验证器
  registerValidator(registration: ValidatorRegistration): void
  
  // 注销验证器
  unregisterValidator(name: string): void
  
  // 获取验证器
  getValidator(name: string): ValidatorFunction | undefined
  
  // 验证单个字段
  validateField(
    field: string,
    value: any,
    rules: ValidationRule[],
    formData: AnyObject
  ): Promise<FieldValidationResult>
  
  // 验证表单
  validateForm(
    formData: AnyObject,
    fieldRules: Record<string, ValidationRule[]>
  ): Promise<FormValidationResult>
  
  // 清除验证缓存
  clearCache(field?: string): void
  
  // 获取验证统计
  getStatistics(): {
    totalValidations: number
    successfulValidations: number
    failedValidations: number
    averageValidationTime: number
    cacheHitRate: number
  }
}

// 验证中间件类型
export type ValidationMiddleware = (
  context: {
    field: string
    value: any
    rule: ValidationRule
    formData: AnyObject
  },
  next: () => Promise<ValidationResult>
) => Promise<ValidationResult>

// 验证插件接口
export interface ValidationPlugin {
  // 插件名称
  name: string
  
  // 插件版本
  version?: string
  
  // 安装插件
  install(engine: ValidationEngine): void
  
  // 卸载插件
  uninstall?(engine: ValidationEngine): void
  
  // 插件配置
  options?: AnyObject
}

// 验证事件类型
export type ValidationEventType = 
  | 'validation:start'
  | 'validation:success'
  | 'validation:error'
  | 'validation:warning'
  | 'validation:complete'
  | 'validator:register'
  | 'validator:unregister'

// 验证事件数据
export interface ValidationEventData {
  type: ValidationEventType
  field?: string
  value?: any
  result?: ValidationResult
  error?: Error
  timestamp: Date
  duration?: number
}

// 验证监听器类型
export type ValidationListener = (event: ValidationEventData) => void

// 验证状态管理器接口
export interface ValidationStateManager {
  // 设置字段验证状态
  setFieldStatus(field: string, status: ValidationStatus, message?: string): void
  
  // 获取字段验证状态
  getFieldStatus(field: string): { status: ValidationStatus; message?: string } | undefined
  
  // 清除字段验证状态
  clearFieldStatus(field: string): void
  
  // 清除所有验证状态
  clearAllStatus(): void
  
  // 获取所有验证状态
  getAllStatus(): Record<string, { status: ValidationStatus; message?: string }>
  
  // 监听状态变化
  onStatusChange(listener: (field: string, status: ValidationStatus, message?: string) => void): void
  
  // 取消监听状态变化
  offStatusChange(listener: (field: string, status: ValidationStatus, message?: string) => void): void
}
