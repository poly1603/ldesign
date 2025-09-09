/**
 * 验证引擎
 * 
 * 提供框架无关的验证功能，包括：
 * - 同步和异步验证
 * - 内置验证规则
 * - 自定义验证规则
 * - 验证缓存
 * - 批量验证
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { EventEmitter } from '../utils/event-emitter'
import { deepClone } from '../utils/helpers'
import type {
  ValidationRule,
  ValidationResult,
  ValidationContext,
  ValidatorFunction,
  ValidationEngineConfig
} from '../types'

/**
 * 验证缓存项
 */
interface ValidationCacheItem {
  /** 缓存的值 */
  value: any
  /** 验证结果 */
  result: ValidationResult
  /** 缓存时间 */
  timestamp: number
}

/**
 * 验证引擎类
 * 
 * 提供完整的验证功能，支持：
 * - 多种验证规则
 * - 异步验证
 * - 验证缓存
 * - 验证器注册
 * 
 */
export class ValidationEngine extends EventEmitter {
  /** 验证器注册表 */
  private validators: Map<string, ValidatorFunction> = new Map()

  /** 验证缓存 */
  private cache: Map<string, ValidationCacheItem> = new Map()

  /** 配置选项 */
  private config: ValidationEngineConfig

  /** 正在进行的验证任务 */
  private pendingValidations: Map<string, Promise<ValidationResult>> = new Map()

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 构造函数
   * 
   * @param config 验证引擎配置
   */
  constructor(config: ValidationEngineConfig = {}) {
    super()

    this.config = {
      enableCache: config.enableCache !== false,
      cacheTimeout: config.cacheTimeout || 5000,
      enableAsync: config.enableAsync !== false,
      maxConcurrentValidations: config.maxConcurrentValidations || 10,
      ...config
    }

    // 注册内置验证器
    this.registerBuiltinValidators()
  }

  /**
   * 注册验证器
   * 
   * @param name 验证器名称
   * @param validator 验证器函数
   */
  registerValidator(name: string, validator: ValidatorFunction): void {
    this.checkDestroyed()
    this.validators.set(name, validator)
    this.emit('validator:registered', { name, validator })
  }

  /**
   * 注销验证器
   * 
   * @param name 验证器名称
   */
  unregisterValidator(name: string): void {
    this.checkDestroyed()
    const removed = this.validators.delete(name)
    if (removed) {
      this.emit('validator:unregistered', { name })
    }
  }

  /**
   * 获取验证器
   * 
   * @param name 验证器名称
   * @returns 验证器函数
   */
  getValidator(name: string): ValidatorFunction | undefined {
    return this.validators.get(name)
  }

  /**
   * 验证单个字段
   * 
   * @param fieldName 字段名称
   * @param value 字段值
   * @param rules 验证规则
   * @param formData 表单数据
   * @returns 验证结果
   */
  async validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule[],
    formData: Record<string, any> = {}
  ): Promise<ValidationResult> {
    this.checkDestroyed()

    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.getCachedResult(fieldName, value, rules)
      if (cached) {
        return cached
      }
    }

    // 检查是否已有相同的验证在进行
    const validationKey = this.getValidationKey(fieldName, value, rules)
    const pendingValidation = this.pendingValidations.get(validationKey)
    if (pendingValidation) {
      return await pendingValidation
    }

    // 开始验证
    const validationPromise = this.performFieldValidation(fieldName, value, rules, formData)
    this.pendingValidations.set(validationKey, validationPromise)

    try {
      const result = await validationPromise

      // 缓存结果
      if (this.config.enableCache) {
        this.cacheResult(fieldName, value, rules, result)
      }

      this.emit('validation:complete', result)
      return result
    } finally {
      this.pendingValidations.delete(validationKey)
    }
  }

  /**
   * 验证整个表单
   * 
   * @param formData 表单数据
   * @param fieldRules 字段验证规则映射
   * @returns 验证结果
   */
  async validateForm(
    formData: Record<string, any>,
    fieldRules: Record<string, ValidationRule[]>
  ): Promise<ValidationResult> {
    this.checkDestroyed()

    const fieldNames = Object.keys(fieldRules)
    const validationPromises = fieldNames.map(fieldName =>
      this.validateField(fieldName, formData[fieldName], fieldRules[fieldName], formData)
    )

    try {
      const results = await Promise.all(validationPromises)

      // 合并验证结果
      const errors: string[] = []
      const fieldErrors: Record<string, string[]> = {}
      let valid = true

      results.forEach((result, index) => {
        const fieldName = fieldNames[index]

        if (!result.valid) {
          valid = false
          fieldErrors[fieldName] = result.errors || []
          errors.push(...(result.errors || []))
        }
      })

      const formResult: ValidationResult = {
        valid,
        errors,
        fieldErrors,
        field: undefined
      }

      this.emit('validation:complete', formResult)
      return formResult
    } catch (error) {
      this.emit('validation:error', { error })
      throw error
    }
  }

  /**
   * 执行字段验证
   */
  private async performFieldValidation(
    fieldName: string,
    value: any,
    rules: ValidationRule[],
    formData: Record<string, any>
  ): Promise<ValidationResult> {
    const errors: string[] = []

    for (const rule of rules) {
      try {
        // 检查验证条件
        if (rule.condition && !rule.condition(formData)) {
          continue
        }

        const context: ValidationContext = {
          field: fieldName,
          value,
          rule,
          formData,
          allValues: formData
        }

        const result = await this.executeRule(context)

        if (!result.valid && result.message) {
          errors.push(result.message)

          // 如果设置了在第一个错误时停止，则跳出循环
          if (rule.stopOnFirstError) {
            break
          }
        }
      } catch (error) {
        this.emit('validation:rule:error', { fieldName, rule, error })
        errors.push(`验证规则执行错误: ${error.message}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      field: fieldName
    }
  }

  /**
   * 执行单个验证规则
   */
  private async executeRule(context: ValidationContext): Promise<ValidationResult> {
    const { rule } = context

    // 使用自定义验证器
    if (rule.validator) {
      const result = await rule.validator(context)

      if (typeof result === 'boolean') {
        return {
          valid: result,
          message: result ? '' : rule.message,
          field: context.field
        }
      }

      if (typeof result === 'string') {
        return {
          valid: false,
          message: result,
          field: context.field
        }
      }

      return result
    }

    // 使用注册的验证器
    const validator = this.validators.get(rule.type)
    if (!validator) {
      throw new Error(`Unknown validator type: ${rule.type}`)
    }

    return await validator(context)
  }

  /**
   * 获取验证缓存键
   */
  private getValidationKey(fieldName: string, value: any, rules: ValidationRule[]): string {
    return `${fieldName}:${JSON.stringify(value)}:${JSON.stringify(rules.map(r => r.type))}`
  }

  /**
   * 获取缓存的验证结果
   */
  private getCachedResult(fieldName: string, value: any, rules: ValidationRule[]): ValidationResult | null {
    const key = this.getValidationKey(fieldName, value, rules)
    const cached = this.cache.get(key)

    if (!cached) return null

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.config.cacheTimeout!) {
      this.cache.delete(key)
      return null
    }

    return deepClone(cached.result)
  }

  /**
   * 缓存验证结果
   */
  private cacheResult(fieldName: string, value: any, rules: ValidationRule[], result: ValidationResult): void {
    const key = this.getValidationKey(fieldName, value, rules)
    this.cache.set(key, {
      value: deepClone(value),
      result: deepClone(result),
      timestamp: Date.now()
    })
  }

  /**
   * 清除验证缓存
   * 
   * @param fieldName 字段名称，如果不提供则清除所有缓存
   */
  clearCache(fieldName?: string): void {
    if (fieldName) {
      // 清除特定字段的缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${fieldName}:`)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }

  /**
   * 注册内置验证器
   */
  private registerBuiltinValidators(): void {
    // 导入内置验证器
    import('../utils/validation').then(({ getValidator, getValidatorNames }) => {
      const validatorNames = getValidatorNames()
      for (const name of validatorNames) {
        const validator = getValidator(name)
        if (validator) {
          this.registerValidator(name, validator)
        }
      }
    }).catch(error => {
      console.warn('Failed to load builtin validators:', error)
    })
  }

  /**
   * 销毁验证引擎
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.validators.clear()
    this.cache.clear()
    this.pendingValidations.clear()

    // 直接清理监听器映射，避免调用checkDestroyed
    this.listeners.clear()
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('ValidationEngine has been destroyed')
    }
  }
}
