// 验证引擎

import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import type {
  ValidationConfig,
  ValidationFunction,
  ValidationResult,
  ValidationRule,
  Validator,
} from '../types/validation'
import { SimpleEventEmitter } from '../utils/event'
import { debounce } from '../utils/throttle'
import { validateField } from '../utils/validation'

/**
 * 验证引擎
 */
export class ValidationEngine extends SimpleEventEmitter implements Validator {
  private config: ValidationConfig
  private customRules: Map<string, ValidationFunction> = new Map()
  private fieldRules: Map<string, ValidationRule[]> = new Map()
  private validationCache: Map<
    string,
    { result: ValidationResult, timestamp: number }
  > = new Map()

  private debouncedValidators: Map<string, Function> = new Map()

  constructor(config: ValidationConfig = {}) {
    super()
    this.config = {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      validateDelay: 300,
      showErrors: true,
      errorPosition: 'bottom',
      mode: 'lazy',
      ...config,
    }
  }

  /**
   * 设置字段验证规则
   */
  setFieldRules(fieldName: string, rules: ValidationRule[]): void {
    this.fieldRules.set(fieldName, rules)

    // 为异步验证创建防抖函数
    const asyncRules = rules.filter(rule => rule.async)
    if (asyncRules.length > 0) {
      const debouncedValidator = debounce(
        (value: any, formData: FormData) =>
          this.validateFieldInternal(fieldName, value, formData),
        this.config.validateDelay || 300,
      )
      this.debouncedValidators.set(fieldName, debouncedValidator)
    }
  }

  /**
   * 从字段配置设置验证规则
   */
  setRulesFromFields(fields: FormItemConfig[]): void {
    fields.forEach((field) => {
      if (field.rules && field.rules.length > 0) {
        this.setFieldRules(field.name, field.rules)
      }
    })
  }

  /**
   * 验证单个字段
   */
  async validateField(
    value: any,
    rules: ValidationRule[],
    formData: FormData,
    field: string,
  ): Promise<ValidationResult> {
    return this.validateFieldInternal(field, value, formData, rules)
  }

  /**
   * 内部字段验证方法
   */
  private async validateFieldInternal(
    fieldName: string,
    value: any,
    formData: FormData,
    customRules?: ValidationRule[],
  ): Promise<ValidationResult> {
    const rules = customRules || this.fieldRules.get(fieldName) || []

    if (rules.length === 0) {
      return { valid: true, errors: [], field: fieldName }
    }

    // 检查缓存
    const cacheKey = this.generateCacheKey(fieldName, value, formData)
    const cached = this.validationCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 5000) {
      // 5秒缓存
      return cached.result
    }

    try {
      this.emit('fieldValidate', fieldName, {
        valid: true,
        errors: [],
        field: fieldName,
      })

      const result = await validateField(value, rules, formData, fieldName)

      // 缓存结果
      this.validationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      })

      // 清理过期缓存
      this.cleanExpiredCache()

      this.emit('fieldValidate', fieldName, result)
      return result
    }
    catch (error) {
      const errorResult: ValidationResult = {
        valid: false,
        errors: [`验证过程中发生错误: ${error.message}`],
        field: fieldName,
      }

      this.emit('fieldValidate', fieldName, errorResult)
      return errorResult
    }
  }

  /**
   * 验证整个表单
   */
  async validateForm(
    formData: FormData,
    rules?: Record<string, ValidationRule[]>,
  ): Promise<Record<string, ValidationResult>> {
    const allRules = rules || Object.fromEntries(this.fieldRules)
    const results: Record<string, ValidationResult> = {}

    // 并行验证所有字段
    const validationPromises = Object.entries(allRules).map(
      async ([fieldName, fieldRules]) => {
        const value = formData[fieldName]
        const result = await this.validateFieldInternal(
          fieldName,
          value,
          formData,
          fieldRules,
        )
        results[fieldName] = result
        return result
      },
    )

    await Promise.all(validationPromises)

    // 触发表单验证事件
    const overallValid = Object.values(results).every(result => result.valid)
    const overallErrors = Object.values(results).flatMap(
      result => result.errors,
    )

    this.emit('validate', {
      valid: overallValid,
      errors: overallErrors,
      field: undefined,
    })

    return results
  }

  /**
   * 验证指定字段（带防抖）
   */
  async validateFieldDebounced(
    fieldName: string,
    value: any,
    formData: FormData,
  ): Promise<void> {
    const debouncedValidator = this.debouncedValidators.get(fieldName)
    if (debouncedValidator) {
      debouncedValidator(value, formData)
    }
    else {
      await this.validateFieldInternal(fieldName, value, formData)
    }
  }

  /**
   * 添加自定义验证规则
   */
  addRule(type: string, validator: ValidationFunction): void {
    this.customRules.set(type, validator)
  }

  /**
   * 移除验证规则
   */
  removeRule(type: string): void {
    this.customRules.delete(type)
  }

  /**
   * 获取验证规则
   */
  getRule(type: string): ValidationFunction | undefined {
    return this.customRules.get(type)
  }

  /**
   * 清空验证缓存
   */
  clearCache(): void {
    this.validationCache.clear()
  }

  /**
   * 清空字段缓存
   */
  clearFieldCache(fieldName: string): void {
    const keysToDelete: string[] = []
    this.validationCache.forEach((_, key) => {
      if (key.startsWith(`${fieldName}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.validationCache.delete(key))
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    fieldName: string,
    value: any,
    formData: FormData,
  ): string {
    const valueStr = JSON.stringify(value)
    const formDataStr = JSON.stringify(formData)
    return `${fieldName}:${valueStr}:${formDataStr}`
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.validationCache.forEach((cached, key) => {
      if (now - cached.timestamp > 30000) {
        // 30秒过期
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => this.validationCache.delete(key))
  }

  /**
   * 获取字段的验证规则
   */
  getFieldRules(fieldName: string): ValidationRule[] {
    return this.fieldRules.get(fieldName) || []
  }

  /**
   * 检查字段是否有验证规则
   */
  hasFieldRules(fieldName: string): boolean {
    return (
      this.fieldRules.has(fieldName)
      && this.fieldRules.get(fieldName)!.length > 0
    )
  }

  /**
   * 获取所有字段的验证规则
   */
  getAllFieldRules(): Record<string, ValidationRule[]> {
    return Object.fromEntries(this.fieldRules)
  }

  /**
   * 移除字段的验证规则
   */
  removeFieldRules(fieldName: string): void {
    this.fieldRules.delete(fieldName)
    this.debouncedValidators.delete(fieldName)
    this.clearFieldCache(fieldName)
  }

  /**
   * 更新验证配置
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config }

    // 重新创建防抖验证器
    this.debouncedValidators.clear()
    this.fieldRules.forEach((rules, fieldName) => {
      const asyncRules = rules.filter(rule => rule.async)
      if (asyncRules.length > 0) {
        const debouncedValidator = debounce(
          (value: any, formData: FormData) =>
            this.validateFieldInternal(fieldName, value, formData),
          this.config.validateDelay || 300,
        )
        this.debouncedValidators.set(fieldName, debouncedValidator)
      }
    })
  }

  /**
   * 获取验证配置
   */
  getConfig(): ValidationConfig {
    return { ...this.config }
  }

  /**
   * 检查是否应该在指定触发时机验证
   */
  shouldValidateOnTrigger(trigger: 'change' | 'blur' | 'submit'): boolean {
    switch (trigger) {
      case 'change':
        return this.config.validateOnChange || false
      case 'blur':
        return this.config.validateOnBlur || false
      case 'submit':
        return this.config.validateOnSubmit || false
      default:
        return false
    }
  }

  /**
   * 获取验证统计信息
   */
  getStats(): {
    totalRules: number
    customRules: number
    cacheSize: number
    debouncedValidators: number
  } {
    return {
      totalRules: Array.from(this.fieldRules.values()).reduce(
        (sum, rules) => sum + rules.length,
        0,
      ),
      customRules: this.customRules.size,
      cacheSize: this.validationCache.size,
      debouncedValidators: this.debouncedValidators.size,
    }
  }

  /**
   * 销毁验证引擎
   */
  destroy(): void {
    this.fieldRules.clear()
    this.customRules.clear()
    this.validationCache.clear()
    this.debouncedValidators.clear()
    this.removeAllListeners()
  }
}
