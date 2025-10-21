/**
 * @ldesign/form - Validation Engine
 * 验证引擎
 */

import type {
  ValidationRule,
  ValidationResult,
  ValidatorFunction,
  FormValidationResult,
  FieldValidationResult,
  FormValues
} from '../../utils/types'
import { builtinValidators } from '../../utils/validation-rules'
import { LRUCache } from '../../utils/performance'
import { isPromise } from '../../utils/helpers'

/**
 * 验证引擎配置
 */
export interface ValidationEngineConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存大小 */
  cacheSize?: number
}

/**
 * 验证引擎类
 */
export class ValidationEngine {
  private rules: Map<string, ValidationRule[]>
  private validators: Map<string, ValidatorFunction>
  private cache: LRUCache<string, ValidationResult> | null
  private abortControllers: Map<string, AbortController>

  constructor(config: ValidationEngineConfig = {}) {
    this.rules = new Map()
    this.validators = new Map()
    this.cache = config.enableCache !== false ? new LRUCache(config.cacheSize) : null
    this.abortControllers = new Map()

    // 注册内置验证器
    this.registerBuiltinValidators()
  }

  /**
   * 注册内置验证器
   */
  private registerBuiltinValidators(): void {
    Object.entries(builtinValidators).forEach(([name, validator]) => {
      if (typeof validator === 'function' && validator.length <= 2) {
        this.validators.set(name, validator as ValidatorFunction)
      }
    })
  }

  /**
   * 注册自定义验证器
   * @param name 验证器名称
   * @param validator 验证器函数
   */
  registerValidator(name: string, validator: ValidatorFunction): void {
    this.validators.set(name, validator)
  }

  /**
   * 注销验证器
   * @param name 验证器名称
   */
  unregisterValidator(name: string): void {
    this.validators.delete(name)
  }

  /**
   * 添加字段验证规则
   * @param field 字段名
   * @param rules 验证规则
   */
  addRules(field: string, rules: ValidationRule[]): void {
    const existingRules = this.rules.get(field) || []
    this.rules.set(field, [...existingRules, ...rules])
    this.clearFieldCache(field)
  }

  /**
   * 设置字段验证规则（覆盖已有规则）
   * @param field 字段名
   * @param rules 验证规则
   */
  setRules(field: string, rules: ValidationRule[]): void {
    this.rules.set(field, rules)
    this.clearFieldCache(field)
  }

  /**
   * 获取字段验证规则
   * @param field 字段名
   */
  getRules(field: string): ValidationRule[] {
    return this.rules.get(field) || []
  }

  /**
   * 移除字段验证规则
   * @param field 字段名
   */
  removeRules(field: string): void {
    this.rules.delete(field)
    this.clearFieldCache(field)
  }

  /**
   * 验证单个字段
   * @param field 字段名
   * @param value 字段值
   * @param values 所有表单值
   * @param trigger 触发方式
   */
  async validateField(
    field: string,
    value: any,
    values: FormValues,
    trigger?: 'change' | 'blur' | 'submit'
  ): Promise<FieldValidationResult> {
    const rules = this.getRules(field)

    // 根据触发方式过滤规则
    const applicableRules = trigger
      ? rules.filter(rule => !rule.trigger || rule.trigger === trigger)
      : rules

    if (applicableRules.length === 0) {
      return {
        field,
        valid: true,
        errors: []
      }
    }

    // 检查缓存
    const cacheKey = this.getCacheKey(field, value, applicableRules)
    if (this.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      return {
        field,
        valid: cached.valid,
        errors: cached.message ? [cached.message] : []
      }
    }

    // 取消之前的异步验证
    this.cancelFieldValidation(field)

    // 执行验证
    const errors: string[] = []
    let valid = true

    for (const rule of applicableRules) {
      const result = await this.executeRule(rule, value, values, field)

      if (!result.valid) {
        valid = false
        if (result.message) {
          errors.push(result.message)
        }
      }
    }

    const validationResult: ValidationResult = {
      valid,
      message: errors[0],
      errors
    }

    // 缓存结果
    if (this.cache) {
      this.cache.set(cacheKey, validationResult)
    }

    return {
      field,
      valid,
      errors
    }
  }

  /**
   * 验证多个字段
   * @param fields 字段名数组
   * @param values 所有表单值
   * @param trigger 触发方式
   */
  async validateFields(
    fields: string[],
    values: FormValues,
    trigger?: 'change' | 'blur' | 'submit'
  ): Promise<FormValidationResult> {
    const results = await Promise.all(
      fields.map(field =>
        this.validateField(field, values[field], values, trigger)
      )
    )

    return this.aggregateResults(results)
  }

  /**
   * 验证所有字段
   * @param values 所有表单值
   * @param trigger 触发方式
   */
  async validateAll(
    values: FormValues,
    trigger?: 'change' | 'blur' | 'submit'
  ): Promise<FormValidationResult> {
    const fields = Array.from(this.rules.keys())
    return this.validateFields(fields, values, trigger)
  }

  /**
   * 执行单个验证规则
   * @param rule 验证规则
   * @param value 值
   * @param values 所有值
   * @param field 字段名
   */
  private async executeRule(
    rule: ValidationRule,
    value: any,
    values: FormValues,
    field: string
  ): Promise<ValidationResult> {
    try {
      // 如果有自定义验证器函数
      if (rule.validator) {
        const result = rule.validator(value, values, field)
        const resolvedResult = isPromise(result) ? await result : result

        if (typeof resolvedResult === 'boolean') {
          return {
            valid: resolvedResult,
            message: resolvedResult ? '' : rule.message || '验证失败'
          }
        }

        return {
          ...resolvedResult,
          message: resolvedResult.message || rule.message || '验证失败'
        }
      }

      // 使用内置验证器
      const validator = this.validators.get(rule.type)
      if (!validator) {
        console.warn(`Validator "${rule.type}" not found`)
        return { valid: true }
      }

      const result = validator(value, values, field)
      const resolvedResult = isPromise(result) ? await result : result

      if (typeof resolvedResult === 'boolean') {
        return {
          valid: resolvedResult,
          message: resolvedResult ? '' : rule.message || '验证失败'
        }
      }

      return {
        ...resolvedResult,
        message: resolvedResult.message || rule.message || '验证失败'
      }
    } catch (error) {
      console.error(`Error in validation rule for field "${field}":`, error)
      return {
        valid: false,
        message: '验证出错'
      }
    }
  }

  /**
   * 聚合验证结果
   * @param results 字段验证结果数组
   */
  private aggregateResults(
    results: FieldValidationResult[]
  ): FormValidationResult {
    const fields: Record<string, FieldValidationResult> = {}
    const errors: Record<string, string[]> = {}
    let valid = true
    let errorCount = 0

    results.forEach(result => {
      fields[result.field] = result
      if (!result.valid) {
        valid = false
        errors[result.field] = result.errors
        errorCount += result.errors.length
      }
    })

    return {
      valid,
      errorCount,
      fields,
      errors
    }
  }

  /**
   * 获取缓存键
   * @param field 字段名
   * @param value 值
   * @param rules 规则
   */
  private getCacheKey(
    field: string,
    value: any,
    rules: ValidationRule[]
  ): string {
    const ruleTypes = rules.map(r => r.type).join(',')
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
    return `${field}:${ruleTypes}:${valueStr}`
  }

  /**
   * 清空字段缓存
   * @param field 字段名
   */
  private clearFieldCache(field: string): void {
    if (!this.cache) return

    // 清除所有与该字段相关的缓存
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${field}:`)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache!.delete(key))
  }

  /**
   * 取消字段验证
   * @param field 字段名
   */
  private cancelFieldValidation(field: string): void {
    const controller = this.abortControllers.get(field)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(field)
    }

    // 创建新的 AbortController
    this.abortControllers.set(field, new AbortController())
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear()
    }
  }

  /**
   * 销毁验证引擎
   */
  destroy(): void {
    this.rules.clear()
    this.validators.clear()
    this.clearCache()
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
  }
}

/**
 * 创建验证引擎
 */
export function createValidationEngine(
  config?: ValidationEngineConfig
): ValidationEngine {
  return new ValidationEngine(config)
}




