/**
 * 验证引擎实现
 * 
 * 提供强大的表单验证功能，支持同步/异步验证、自定义验证器、验证缓存等
 */

import type {
  ValidationConfig,
  ValidationRule,
  ValidationResult,
  FieldValidationResult,
  FormValidationResult,
  ValidationEngine as IValidationEngine,
  ValidatorFunction,
  ValidatorRegistration,
  ValidationTrigger,
  EventBus,
  AnyObject
} from '../types'

/**
 * 内置验证器
 */
const BUILTIN_VALIDATORS: Record<string, ValidatorFunction> = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return false
    }
    if (Array.isArray(value) && value.length === 0) {
      return false
    }
    return true
  },
  
  email: (value: string) => {
    if (!value) return true // 空值由required验证器处理
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  
  phone: (value: string) => {
    if (!value) return true
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(value)
  },
  
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  
  number: (value: any) => {
    if (value === null || value === undefined || value === '') return true
    return !isNaN(Number(value))
  },
  
  integer: (value: any) => {
    if (value === null || value === undefined || value === '') return true
    return Number.isInteger(Number(value))
  },
  
  min: (value: any, formData: AnyObject, fieldConfig: any) => {
    if (value === null || value === undefined || value === '') return true
    const minValue = fieldConfig?.value || 0
    return Number(value) >= minValue
  },
  
  max: (value: any, formData: AnyObject, fieldConfig: any) => {
    if (value === null || value === undefined || value === '') return true
    const maxValue = fieldConfig?.value || Infinity
    return Number(value) <= maxValue
  },
  
  minLength: (value: string, formData: AnyObject, fieldConfig: any) => {
    if (!value) return true
    const minLength = fieldConfig?.value || 0
    return value.length >= minLength
  },
  
  maxLength: (value: string, formData: AnyObject, fieldConfig: any) => {
    if (!value) return true
    const maxLength = fieldConfig?.value || Infinity
    return value.length <= maxLength
  },
  
  pattern: (value: string, formData: AnyObject, fieldConfig: any) => {
    if (!value) return true
    const pattern = fieldConfig?.value
    if (!pattern) return true
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern)
    return regex.test(value)
  }
}

/**
 * 验证缓存项
 */
interface ValidationCacheItem {
  result: ValidationResult
  timestamp: number
  ttl: number
}

/**
 * 验证引擎实现类
 */
export class ValidationEngine implements IValidationEngine {
  // 验证器注册表
  private validators = new Map<string, ValidatorRegistration>()
  
  // 验证缓存
  private cache = new Map<string, ValidationCacheItem>()
  
  // 验证配置
  private config: ValidationConfig = {}
  
  // 事件总线
  private eventBus: EventBus
  
  // 统计信息
  private stats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    totalTime: 0,
    cacheHits: 0
  }
  
  // 内部状态
  private initialized = false
  private destroyed = false
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.registerBuiltinValidators()
  }
  
  /**
   * 注册内置验证器
   */
  private registerBuiltinValidators(): void {
    for (const [name, validator] of Object.entries(BUILTIN_VALIDATORS)) {
      this.registerValidator({
        name,
        validator,
        defaultMessage: this.getDefaultMessage(name),
        description: `内置验证器: ${name}`
      })
    }
  }
  
  /**
   * 获取默认错误消息
   */
  private getDefaultMessage(validatorName: string): string {
    const messages: Record<string, string> = {
      required: '此字段为必填项',
      email: '请输入有效的邮箱地址',
      phone: '请输入有效的手机号码',
      url: '请输入有效的URL地址',
      number: '请输入有效的数字',
      integer: '请输入有效的整数',
      min: '值不能小于最小值',
      max: '值不能大于最大值',
      minLength: '长度不能少于最小长度',
      maxLength: '长度不能超过最大长度',
      pattern: '格式不正确'
    }
    
    return messages[validatorName] || '验证失败'
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(
    field: string,
    value: any,
    rule: ValidationRule,
    formData: AnyObject
  ): string {
    const ruleKey = typeof rule.validator === 'string' 
      ? rule.validator 
      : rule.validator.toString()
    
    return `${field}:${JSON.stringify(value)}:${ruleKey}:${JSON.stringify(rule.value)}`
  }
  
  /**
   * 检查缓存
   */
  private checkCache(cacheKey: string): ValidationResult | null {
    if (!this.config.cache?.enabled) {
      return null
    }
    
    const cacheItem = this.cache.get(cacheKey)
    if (!cacheItem) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
      this.cache.delete(cacheKey)
      return null
    }
    
    this.stats.cacheHits++
    return cacheItem.result
  }
  
  /**
   * 设置缓存
   */
  private setCache(cacheKey: string, result: ValidationResult): void {
    if (!this.config.cache?.enabled) {
      return
    }
    
    const ttl = this.config.cache.ttl || 300000 // 默认5分钟
    const cacheItem: ValidationCacheItem = {
      result,
      timestamp: Date.now(),
      ttl
    }
    
    this.cache.set(cacheKey, cacheItem)
    
    // 限制缓存大小
    const maxSize = this.config.cache.maxSize || 100
    if (this.cache.size > maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }
  
  /**
   * 执行单个验证规则
   */
  private async executeValidationRule(
    field: string,
    value: any,
    rule: ValidationRule,
    formData: AnyObject
  ): Promise<ValidationResult> {
    const startTime = performance.now()
    
    try {
      // 检查验证条件
      if (rule.condition && !rule.condition(formData)) {
        return {
          valid: true,
          status: 'success'
        }
      }
      
      // 检查缓存
      const cacheKey = this.generateCacheKey(field, value, rule, formData)
      const cachedResult = this.checkCache(cacheKey)
      if (cachedResult) {
        return cachedResult
      }
      
      let validator: ValidatorFunction
      let defaultMessage = '验证失败'
      
      // 获取验证器
      if (typeof rule.validator === 'string') {
        const registration = this.validators.get(rule.validator)
        if (!registration) {
          throw new Error(`未找到验证器: ${rule.validator}`)
        }
        validator = registration.validator
        defaultMessage = registration.defaultMessage || defaultMessage
      } else {
        validator = rule.validator
      }
      
      // 执行验证
      const validationResult = await Promise.resolve(
        validator(value, formData, rule)
      )
      
      let valid: boolean
      let message: string
      
      if (typeof validationResult === 'boolean') {
        valid = validationResult
        message = rule.message || defaultMessage
      } else {
        valid = false
        message = validationResult
      }
      
      const result: ValidationResult = {
        valid,
        message: valid ? undefined : message,
        status: valid ? 'success' : 'error',
        duration: performance.now() - startTime,
        validator: typeof rule.validator === 'string' ? rule.validator : 'custom'
      }
      
      // 设置缓存
      this.setCache(cacheKey, result)
      
      return result
      
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : '验证过程中发生错误',
        status: 'error',
        duration: performance.now() - startTime,
        validator: typeof rule.validator === 'string' ? rule.validator : 'custom'
      }
    }
  }
  
  /**
   * 初始化验证引擎
   */
  public initialize(config: ValidationConfig): void {
    if (this.initialized) {
      return
    }
    
    this.initialized = true
    this.config = {
      enabled: true,
      trigger: 'change',
      stopOnFirstError: false,
      timeout: 5000,
      showStatus: true,
      showIcon: true,
      showMessage: true,
      messagePosition: 'bottom',
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 100
      },
      debounce: {
        enabled: true,
        delay: 300
      },
      ...config
    }
    
    // 注册自定义验证器
    if (this.config.customValidators) {
      for (const [name, validator] of Object.entries(this.config.customValidators)) {
        this.registerValidator({
          name,
          validator,
          description: '自定义验证器'
        })
      }
    }
  }
  
  /**
   * 注册验证器
   */
  public registerValidator(registration: ValidatorRegistration): void {
    this.validators.set(registration.name, registration)
    
    this.eventBus.emit('validator:register', {
      type: 'validator:register',
      timestamp: Date.now(),
      id: `register_${Date.now()}`,
      data: { registration }
    })
  }
  
  /**
   * 注销验证器
   */
  public unregisterValidator(name: string): void {
    const removed = this.validators.delete(name)
    
    if (removed) {
      this.eventBus.emit('validator:unregister', {
        type: 'validator:unregister',
        timestamp: Date.now(),
        id: `unregister_${Date.now()}`,
        data: { name }
      })
    }
  }
  
  /**
   * 获取验证器
   */
  public getValidator(name: string): ValidatorFunction | undefined {
    const registration = this.validators.get(name)
    return registration?.validator
  }
  
  /**
   * 验证单个字段
   */
  public async validateField(
    field: string,
    value: any,
    rules: ValidationRule[],
    formData: AnyObject
  ): Promise<FieldValidationResult> {
    if (!this.config.enabled) {
      return {
        field,
        value,
        valid: true,
        status: 'success'
      }
    }
    
    const startTime = performance.now()
    this.stats.totalValidations++
    
    this.eventBus.emit('validation:start', {
      type: 'validation:start',
      timestamp: Date.now(),
      id: `validation_${Date.now()}`,
      field,
      value,
      formData
    })
    
    try {
      // 按优先级排序规则
      const sortedRules = rules.sort((a, b) => (a.priority || 100) - (b.priority || 100))
      
      for (const rule of sortedRules) {
        const result = await this.executeValidationRule(field, value, rule, formData)
        
        if (!result.valid) {
          const fieldResult: FieldValidationResult = {
            field,
            value,
            valid: false,
            message: result.message,
            status: 'error',
            duration: performance.now() - startTime,
            rule
          }
          
          this.stats.failedValidations++
          this.stats.totalTime += fieldResult.duration || 0
          
          this.eventBus.emit('validation:error', {
            type: 'validation:error',
            timestamp: Date.now(),
            id: `error_${Date.now()}`,
            field,
            value,
            result: fieldResult
          })
          
          return fieldResult
        }
        
        // 如果配置了在第一个错误时停止，则继续下一个规则
        if (this.config.stopOnFirstError && !result.valid) {
          break
        }
      }
      
      const fieldResult: FieldValidationResult = {
        field,
        value,
        valid: true,
        status: 'success',
        duration: performance.now() - startTime
      }
      
      this.stats.successfulValidations++
      this.stats.totalTime += fieldResult.duration || 0
      
      this.eventBus.emit('validation:success', {
        type: 'validation:success',
        timestamp: Date.now(),
        id: `success_${Date.now()}`,
        field,
        value,
        result: fieldResult
      })
      
      return fieldResult
      
    } catch (error) {
      const fieldResult: FieldValidationResult = {
        field,
        value,
        valid: false,
        message: error instanceof Error ? error.message : '验证过程中发生未知错误',
        status: 'error',
        duration: performance.now() - startTime
      }
      
      this.stats.failedValidations++
      this.stats.totalTime += fieldResult.duration || 0
      
      this.eventBus.emit('validation:error', {
        type: 'validation:error',
        timestamp: Date.now(),
        id: `error_${Date.now()}`,
        field,
        value,
        result: fieldResult,
        error
      })
      
      return fieldResult
    }
  }
  
  /**
   * 验证表单
   */
  public async validateForm(
    formData: AnyObject,
    fieldRules: Record<string, ValidationRule[]>
  ): Promise<FormValidationResult> {
    const startTime = performance.now()
    const fields: Record<string, FieldValidationResult> = {}
    const errorFields: string[] = []
    const warningFields: string[] = []
    
    // 并行验证所有字段
    const validationPromises = Object.entries(fieldRules).map(async ([field, rules]) => {
      const value = this.getNestedValue(formData, field)
      const result = await this.validateField(field, value, rules, formData)
      
      fields[field] = result
      
      if (!result.valid) {
        if (result.status === 'error') {
          errorFields.push(field)
        } else if (result.status === 'warning') {
          warningFields.push(field)
        }
      }
    })
    
    await Promise.all(validationPromises)
    
    const result: FormValidationResult = {
      valid: errorFields.length === 0,
      fields,
      errorFields,
      warningFields,
      duration: performance.now() - startTime,
      timestamp: new Date()
    }
    
    this.eventBus.emit('validation:complete', {
      type: 'validation:complete',
      timestamp: Date.now(),
      id: `complete_${Date.now()}`,
      validationResult: result
    })
    
    return result
  }
  
  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: AnyObject, path: string): any {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return undefined
      }
      current = current[key]
    }
    
    return current
  }
  
  /**
   * 清除验证缓存
   */
  public clearCache(field?: string): void {
    if (field) {
      // 清除特定字段的缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${field}:`)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }
  
  /**
   * 获取验证统计
   */
  public getStatistics(): {
    totalValidations: number
    successfulValidations: number
    failedValidations: number
    averageValidationTime: number
    cacheHitRate: number
  } {
    return {
      totalValidations: this.stats.totalValidations,
      successfulValidations: this.stats.successfulValidations,
      failedValidations: this.stats.failedValidations,
      averageValidationTime: this.stats.totalValidations > 0 
        ? this.stats.totalTime / this.stats.totalValidations 
        : 0,
      cacheHitRate: this.stats.totalValidations > 0 
        ? this.stats.cacheHits / this.stats.totalValidations 
        : 0
    }
  }
  
  /**
   * 获取调试信息
   */
  public getDebugInfo(): AnyObject {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      config: this.config,
      validatorCount: this.validators.size,
      cacheSize: this.cache.size,
      stats: this.stats
    }
  }
  
  /**
   * 销毁验证引擎
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }
    
    this.destroyed = true
    
    // 清理所有数据
    this.validators.clear()
    this.cache.clear()
    this.config = {}
    this.stats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      totalTime: 0,
      cacheHits: 0
    }
  }
}
