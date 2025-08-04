/**
 * 验证引擎 - 负责表单验证逻辑
 */

import type {
  FormItemConfig,
  FormConfig,
  ValidationRule,
  ValidationConfig,
} from '../types'
import { EventEmitter } from '../utils/event-emitter'
import { debounce } from '../utils/throttle'

export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

export interface FieldValidationResult extends ValidationResult {
  key: string
  value: any
}

export interface FormValidationResult {
  valid: boolean
  errors: Record<string, string>
  warnings: Record<string, string[]>
  fieldResults: FieldValidationResult[]
}

export interface ValidationEngineOptions {
  /** 验证模式 */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'manual'
  /** 验证防抖延迟 */
  debounceDelay?: number
  /** 是否启用警告 */
  enableWarnings?: boolean
  /** 是否在第一个错误后停止验证 */
  stopOnFirstError?: boolean
  /** 自定义验证器 */
  customValidators?: Record<string, ValidationFunction>
}

export type ValidationFunction = (
  value: any,
  values: Record<string, any>,
  field: FormItemConfig
) => Promise<ValidationResult> | ValidationResult | boolean | string

export interface ValidatorDefinition {
  name: string
  validator: ValidationFunction
  message?: string
  priority?: number
}

export class ValidationEngine extends EventEmitter {
  private config: FormConfig
  private options: Required<ValidationEngineOptions>
  private customValidators = new Map<string, ValidationFunction>()
  private builtInValidators = new Map<string, ValidationFunction>()
  private debouncedValidate: (key?: string, values?: Record<string, any>) => void
  private validationCache = new Map<string, ValidationResult>()
  private validationPromises = new Map<string, Promise<ValidationResult>>()

  constructor(config: FormConfig, options: ValidationEngineOptions = {}) {
    super()
    this.config = config
    this.options = {
      mode: options.mode ?? 'onChange',
      debounceDelay: options.debounceDelay ?? 300,
      enableWarnings: options.enableWarnings ?? true,
      stopOnFirstError: options.stopOnFirstError ?? false,
      customValidators: options.customValidators ?? {},
    }
    
    this.initializeBuiltInValidators()
    this.initializeCustomValidators()
    
    this.debouncedValidate = debounce(
      this.performValidation.bind(this),
      this.options.debounceDelay
    )
  }

  /**
   * 初始化内置验证器
   */
  private initializeBuiltInValidators(): void {
    // 必填验证
    this.builtInValidators.set('required', (value) => {
      const isEmpty = this.isEmpty(value)
      return {
        valid: !isEmpty,
        error: isEmpty ? 'This field is required' : undefined,
      }
    })
    
    // 邮箱验证
    this.builtInValidators.set('email', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      return {
        valid: isValid,
        error: isValid ? undefined : 'Please enter a valid email address',
      }
    })
    
    // URL验证
    this.builtInValidators.set('url', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      try {
        new URL(value)
        return { valid: true }
      } catch {
        return {
          valid: false,
          error: 'Please enter a valid URL',
        }
      }
    })
    
    // 手机号验证
    this.builtInValidators.set('phone', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      const isValid = /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10
      return {
        valid: isValid,
        error: isValid ? undefined : 'Please enter a valid phone number',
      }
    })
    
    // 数字验证
    this.builtInValidators.set('number', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      const isValid = !isNaN(Number(value)) && isFinite(Number(value))
      return {
        valid: isValid,
        error: isValid ? undefined : 'Please enter a valid number',
      }
    })
    
    // 整数验证
    this.builtInValidators.set('integer', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      const isValid = Number.isInteger(Number(value))
      return {
        valid: isValid,
        error: isValid ? undefined : 'Please enter a valid integer',
      }
    })
    
    // 最小值验证
    this.builtInValidators.set('min', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const numValue = Number(value)
      const minValue = rule.min
      const isValid = numValue >= minValue
      return {
        valid: isValid,
        error: isValid ? undefined : `Value must be at least ${minValue}`,
      }
    })
    
    // 最大值验证
    this.builtInValidators.set('max', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const numValue = Number(value)
      const maxValue = rule.max
      const isValid = numValue <= maxValue
      return {
        valid: isValid,
        error: isValid ? undefined : `Value must be at most ${maxValue}`,
      }
    })
    
    // 最小长度验证
    this.builtInValidators.set('minLength', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const length = String(value).length
      const minLength = rule.minLength
      const isValid = length >= minLength
      return {
        valid: isValid,
        error: isValid ? undefined : `Must be at least ${minLength} characters`,
      }
    })
    
    // 最大长度验证
    this.builtInValidators.set('maxLength', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const length = String(value).length
      const maxLength = rule.maxLength
      const isValid = length <= maxLength
      return {
        valid: isValid,
        error: isValid ? undefined : `Must be at most ${maxLength} characters`,
      }
    })
    
    // 正则表达式验证
    this.builtInValidators.set('pattern', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const pattern = new RegExp(rule.pattern)
      const isValid = pattern.test(value)
      return {
        valid: isValid,
        error: isValid ? undefined : (rule.message || 'Invalid format'),
      }
    })
    
    // 确认密码验证
    this.builtInValidators.set('confirm', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const targetValue = values[rule.target]
      const isValid = value === targetValue
      return {
        valid: isValid,
        error: isValid ? undefined : 'Passwords do not match',
      }
    })
    
    // 日期验证
    this.builtInValidators.set('date', (value) => {
      if (this.isEmpty(value)) return { valid: true }
      const date = new Date(value)
      const isValid = !isNaN(date.getTime())
      return {
        valid: isValid,
        error: isValid ? undefined : 'Please enter a valid date',
      }
    })
    
    // 日期范围验证
    this.builtInValidators.set('dateRange', (value, values, field, rule: any) => {
      if (this.isEmpty(value)) return { valid: true }
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Please enter a valid date' }
      }
      
      const { min, max } = rule
      let isValid = true
      let error: string | undefined
      
      if (min && date < new Date(min)) {
        isValid = false
        error = `Date must be after ${min}`
      } else if (max && date > new Date(max)) {
        isValid = false
        error = `Date must be before ${max}`
      }
      
      return { valid: isValid, error }
    })
  }

  /**
   * 初始化自定义验证器
   */
  private initializeCustomValidators(): void {
    Object.entries(this.options.customValidators).forEach(([name, validator]) => {
      this.customValidators.set(name, validator)
    })
  }

  /**
   * 更新配置
   */
  updateConfig(config: FormConfig): void {
    this.config = config
    this.clearCache()
    this.emit('configUpdated', { config })
  }

  /**
   * 注册自定义验证器
   */
  registerValidator(name: string, validator: ValidationFunction): void {
    this.customValidators.set(name, validator)
    this.clearCache()
  }

  /**
   * 注销验证器
   */
  unregisterValidator(name: string): void {
    this.customValidators.delete(name)
    this.clearCache()
  }

  /**
   * 验证单个字段
   */
  async validateField(
    key: string,
    value: any,
    values: Record<string, any> = {}
  ): Promise<FieldValidationResult> {
    const cacheKey = this.getCacheKey(key, value, values)
    
    // 检查缓存
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!
      return {
        key,
        value,
        ...cached,
      }
    }
    
    // 检查是否有正在进行的验证
    const existingPromise = this.validationPromises.get(key)
    if (existingPromise) {
      const result = await existingPromise
      return { key, value, ...result }
    }
    
    // 开始新的验证
    const promise = this.performFieldValidation(key, value, values)
    this.validationPromises.set(key, promise)
    
    try {
      const result = await promise
      
      // 缓存结果
      this.validationCache.set(cacheKey, result)
      
      const fieldResult: FieldValidationResult = {
        key,
        value,
        ...result,
      }
      
      this.emit('fieldValidated', fieldResult)
      return fieldResult
    } finally {
      this.validationPromises.delete(key)
    }
  }

  /**
   * 执行字段验证
   */
  private async performFieldValidation(
    key: string,
    value: any,
    values: Record<string, any>
  ): Promise<ValidationResult> {
    const field = this.config.items.find(item => item.key === key)
    if (!field) {
      return { valid: true }
    }
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // 必填验证
    if (field.required) {
      const result = await this.runValidator('required', value, values, field)
      if (!result.valid && result.error) {
        errors.push(result.error)
        if (this.options.stopOnFirstError) {
          return { valid: false, error: result.error }
        }
      }
      if (result.warnings) {
        warnings.push(...result.warnings)
      }
    }
    
    // 字段级验证规则
    if (field.rules) {
      for (const rule of field.rules) {
        const result = await this.validateRule(rule, value, values, field)
        if (!result.valid && result.error) {
          errors.push(result.error)
          if (this.options.stopOnFirstError) {
            return { valid: false, error: result.error }
          }
        }
        if (result.warnings) {
          warnings.push(...result.warnings)
        }
      }
    }
    
    // 全局验证规则
    if (this.config.validation?.rules?.[key]) {
      for (const rule of this.config.validation.rules[key]) {
        const result = await this.validateRule(rule, value, values, field)
        if (!result.valid && result.error) {
          errors.push(result.error)
          if (this.options.stopOnFirstError) {
            return { valid: false, error: result.error }
          }
        }
        if (result.warnings) {
          warnings.push(...result.warnings)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * 验证规则
   */
  private async validateRule(
    rule: ValidationRule,
    value: any,
    values: Record<string, any>,
    field: FormItemConfig
  ): Promise<ValidationResult> {
    // 函数类型规则
    if (typeof rule === 'function') {
      try {
        const result = await rule(value, values)
        if (typeof result === 'boolean') {
          return { valid: result }
        }
        if (typeof result === 'string') {
          return { valid: false, error: result }
        }
        return result
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : 'Validation error',
        }
      }
    }
    
    // 对象类型规则
    if (typeof rule === 'object' && rule !== null) {
      const { validator, message } = rule
      
      if (typeof validator === 'function') {
        try {
          const result = await validator(value, values)
          if (typeof result === 'boolean') {
            return {
              valid: result,
              error: result ? undefined : (message || 'Validation failed'),
            }
          }
          if (typeof result === 'string') {
            return { valid: false, error: result }
          }
          return result
        } catch (error) {
          return {
            valid: false,
            error: error instanceof Error ? error.message : 'Validation error',
          }
        }
      }
      
      // 内置验证器名称
      if (typeof validator === 'string') {
        return await this.runValidator(validator, value, values, field, rule)
      }
    }
    
    return { valid: true }
  }

  /**
   * 运行验证器
   */
  private async runValidator(
    name: string,
    value: any,
    values: Record<string, any>,
    field: FormItemConfig,
    rule?: any
  ): Promise<ValidationResult> {
    // 优先使用自定义验证器
    const customValidator = this.customValidators.get(name)
    if (customValidator) {
      try {
        const result = await customValidator(value, values, field)
        if (typeof result === 'boolean') {
          return { valid: result }
        }
        if (typeof result === 'string') {
          return { valid: false, error: result }
        }
        return result
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : 'Validation error',
        }
      }
    }
    
    // 使用内置验证器
    const builtInValidator = this.builtInValidators.get(name)
    if (builtInValidator) {
      try {
        const result = await builtInValidator(value, values, field, rule)
        if (typeof result === 'boolean') {
          return { valid: result }
        }
        if (typeof result === 'string') {
          return { valid: false, error: result }
        }
        return result
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : 'Validation error',
        }
      }
    }
    
    console.warn(`Unknown validator: ${name}`)
    return { valid: true }
  }

  /**
   * 验证整个表单
   */
  async validateForm(values: Record<string, any>): Promise<FormValidationResult> {
    const fieldResults: FieldValidationResult[] = []
    const errors: Record<string, string> = {}
    const warnings: Record<string, string[]> = {}
    
    // 并行验证所有字段
    const validationPromises = this.config.items.map(async (item) => {
      const result = await this.validateField(item.key, values[item.key], values)
      fieldResults.push(result)
      
      if (!result.valid && result.error) {
        errors[item.key] = result.error
      }
      
      if (result.warnings && result.warnings.length > 0) {
        warnings[item.key] = result.warnings
      }
      
      return result
    })
    
    await Promise.all(validationPromises)
    
    const formResult: FormValidationResult = {
      valid: Object.keys(errors).length === 0,
      errors,
      warnings,
      fieldResults,
    }
    
    this.emit('formValidated', formResult)
    return formResult
  }

  /**
   * 执行验证（防抖）
   */
  private async performValidation(
    key?: string,
    values: Record<string, any> = {}
  ): Promise<void> {
    if (key) {
      await this.validateField(key, values[key], values)
    } else {
      await this.validateForm(values)
    }
  }

  /**
   * 触发验证
   */
  validate(key?: string, values: Record<string, any> = {}): void {
    if (this.options.mode === 'manual') {
      this.performValidation(key, values)
    } else {
      this.debouncedValidate(key, values)
    }
  }

  /**
   * 立即验证
   */
  async validateImmediate(
    key?: string,
    values: Record<string, any> = {}
  ): Promise<FormValidationResult | FieldValidationResult> {
    if (key) {
      return await this.validateField(key, values[key], values)
    } else {
      return await this.validateForm(values)
    }
  }

  /**
   * 检查值是否为空
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true
    }
    
    if (typeof value === 'string') {
      return value.trim() === ''
    }
    
    if (Array.isArray(value)) {
      return value.length === 0
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length === 0
    }
    
    return false
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    key: string,
    value: any,
    values: Record<string, any>
  ): string {
    return `${key}:${JSON.stringify(value)}:${JSON.stringify(values)}`
  }

  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      // 清除特定字段的缓存
      const keysToDelete: string[] = []
      this.validationCache.forEach((_, cacheKey) => {
        if (cacheKey.startsWith(`${key}:`)) {
          keysToDelete.push(cacheKey)
        }
      })
      keysToDelete.forEach(k => this.validationCache.delete(k))
    } else {
      this.validationCache.clear()
    }
  }

  /**
   * 获取验证器列表
   */
  getValidators(): string[] {
    return [
      ...Array.from(this.builtInValidators.keys()),
      ...Array.from(this.customValidators.keys()),
    ]
  }

  /**
   * 检查验证器是否存在
   */
  hasValidator(name: string): boolean {
    return this.builtInValidators.has(name) || this.customValidators.has(name)
  }

  /**
   * 销毁验证引擎
   */
  destroy(): void {
    this.clearCache()
    this.validationPromises.clear()
    this.customValidators.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建验证引擎
 */
export function createValidationEngine(
  config: FormConfig,
  options?: ValidationEngineOptions
): ValidationEngine {
  return new ValidationEngine(config, options)
}

/**
 * 内置验证器工厂函数
 */
export const validators = {
  required: (message?: string) => ({
    validator: 'required',
    message: message || 'This field is required',
  }),
  
  email: (message?: string) => ({
    validator: 'email',
    message: message || 'Please enter a valid email address',
  }),
  
  url: (message?: string) => ({
    validator: 'url',
    message: message || 'Please enter a valid URL',
  }),
  
  phone: (message?: string) => ({
    validator: 'phone',
    message: message || 'Please enter a valid phone number',
  }),
  
  number: (message?: string) => ({
    validator: 'number',
    message: message || 'Please enter a valid number',
  }),
  
  integer: (message?: string) => ({
    validator: 'integer',
    message: message || 'Please enter a valid integer',
  }),
  
  min: (min: number, message?: string) => ({
    validator: 'min',
    min,
    message: message || `Value must be at least ${min}`,
  }),
  
  max: (max: number, message?: string) => ({
    validator: 'max',
    max,
    message: message || `Value must be at most ${max}`,
  }),
  
  minLength: (minLength: number, message?: string) => ({
    validator: 'minLength',
    minLength,
    message: message || `Must be at least ${minLength} characters`,
  }),
  
  maxLength: (maxLength: number, message?: string) => ({
    validator: 'maxLength',
    maxLength,
    message: message || `Must be at most ${maxLength} characters`,
  }),
  
  pattern: (pattern: string | RegExp, message?: string) => ({
    validator: 'pattern',
    pattern: pattern instanceof RegExp ? pattern.source : pattern,
    message: message || 'Invalid format',
  }),
  
  confirm: (target: string, message?: string) => ({
    validator: 'confirm',
    target,
    message: message || 'Values do not match',
  }),
  
  date: (message?: string) => ({
    validator: 'date',
    message: message || 'Please enter a valid date',
  }),
  
  dateRange: (min?: string, max?: string, message?: string) => ({
    validator: 'dateRange',
    min,
    max,
    message: message || 'Date is out of range',
  }),
}