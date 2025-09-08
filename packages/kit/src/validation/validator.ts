/**
 * 核心验证器
 * 提供灵活的数据验证功能
 */

import type {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidatorOptions,
} from '../types'
import { EventEmitter } from 'node:events'

/**
 * 验证器类
 */
export class Validator extends EventEmitter {
  private rules: Map<string, ValidationRule[]> = new Map()
  private options: Required<ValidatorOptions>

  constructor(options: ValidatorOptions = {}) {
    super()

    this.options = {
      stopOnFirstError: options.stopOnFirstError !== false,
      allowUnknownFields: options.allowUnknownFields !== false,
      stripUnknownFields: options.stripUnknownFields !== false,
      enableAsync: options.enableAsync !== false,
      enableCustomMessages: options.enableCustomMessages !== false,
      locale: options.locale || 'zh-CN',
    }
  }

  /**
   * 添加验证规则
   */
  addRule(field: string, rule: ValidationRule): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, [])
    }

    this.rules.get(field)!.push(rule)
    this.emit('ruleAdded', { field, rule })
    return this
  }

  /**
   * 批量添加验证规则
   */
  addRules(rules: Record<string, ValidationRule | ValidationRule[]>): this {
    for (const [field, rule] of Object.entries(rules)) {
      if (Array.isArray(rule)) {
        rule.forEach(r => this.addRule(field, r))
      }
      else {
        this.addRule(field, rule)
      }
    }
    return this
  }

  /**
   * 移除验证规则
   */
  removeRule(field: string, rule?: ValidationRule): this {
    const fieldRules = this.rules.get(field)
    if (!fieldRules)
      return this

    if (rule) {
      const index = fieldRules.indexOf(rule)
      if (index !== -1) {
        fieldRules.splice(index, 1)
        this.emit('ruleRemoved', { field, rule })
      }
    }
    else {
      this.rules.delete(field)
      this.emit('fieldRulesRemoved', field)
    }

    return this
  }

  /**
   * 验证数据
   */
  async validate(data: any, context: ValidationContext = {}): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      data: this.options.stripUnknownFields ? {} : { ...data },
    }

    const validationContext: ValidationContext = {
      ...context,
      validator: this,
      options: this.options,
      originalData: data,
    }

    this.emit('validationStart', { data, context: validationContext })

    try {
      // 验证已定义字段
      for (const [field, rules] of this.rules) {
        const fieldResult = await this.validateField(field, data, rules, validationContext)

        if (!fieldResult.valid) {
          result.valid = false
          result.errors.push(...fieldResult.errors)

          if (this.options.stopOnFirstError) {
            break
          }
        }

        if (fieldResult.warnings.length > 0) {
          result.warnings.push(...fieldResult.warnings)
        }

        // 更新处理后的数据
        if (fieldResult.transformedValue !== undefined) {
          this.setNestedValue(result.data, field, fieldResult.transformedValue)
        }
      }

      // 检查未知字段
      if (!this.options.allowUnknownFields) {
        const unknownFields = this.findUnknownFields(data)
        for (const field of unknownFields) {
          result.valid = false
          result.errors.push({
            field,
            message: `Unknown field: ${field}`,
            code: 'UNKNOWN_FIELD',
            value: this.getNestedValue(data, field),
          })
        }
      }

      this.emit('validationEnd', { result, data, context: validationContext })
      return result
    }
    catch (error) {
      this.emit('validationError', error)
      throw error
    }
  }

  /**
   * 验证单个字段
   */
  async validateField(
    field: string,
    data: any,
    rules: ValidationRule[],
    context: ValidationContext,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      transformedValue: undefined,
    }

    const value = this.getNestedValue(data, field)
    let currentValue = value

    for (const rule of rules) {
      try {
        const ruleResult = await this.executeRule(rule, currentValue, field, data, context)

        if (!ruleResult.valid) {
          result.valid = false
          result.errors.push(...ruleResult.errors)

          if (this.options.stopOnFirstError) {
            break
          }
        }

        if (ruleResult.warnings.length > 0) {
          result.warnings.push(...ruleResult.warnings)
        }

        // 应用转换
        if (ruleResult.transformedValue !== undefined) {
          currentValue = ruleResult.transformedValue
        }
      }
      catch (error) {
        result.valid = false
        result.errors.push({
          field,
          message: `Rule execution error: ${error}`,
          code: 'RULE_ERROR',
          value: currentValue,
        })

        if (this.options.stopOnFirstError) {
          break
        }
      }
    }

    result.transformedValue = currentValue
    return result
  }

  /**
   * 执行验证规则
   */
  private async executeRule(
    rule: ValidationRule,
    value: any,
    field: string,
    data: any,
    context: ValidationContext,
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      transformedValue: value,
    }

    // 检查条件
    if (rule.condition && !rule.condition(value, data, context)) {
      return result
    }

    // 执行验证函数
    if (rule.validator) {
      const validationResult = await Promise.resolve(rule.validator(value, data, context))

      if (typeof validationResult === 'boolean') {
        if (!validationResult) {
          result.valid = false
          result.errors.push({
            field,
            message: this.getErrorMessage(rule, field, value),
            code: rule.code || 'VALIDATION_ERROR',
            value,
          })
        }
      }
      else if (validationResult && typeof validationResult === 'object') {
        if (!validationResult.valid) {
          result.valid = false
          result.errors.push({
            field,
            message: validationResult.message || this.getErrorMessage(rule, field, value),
            code: validationResult.code || rule.code || 'VALIDATION_ERROR',
            value,
          })
        }

        if (validationResult.transformedValue !== undefined) {
          result.transformedValue = validationResult.transformedValue
        }

        if (validationResult.warning) {
          result.warnings.push({
            field,
            message: validationResult.warning,
            code: 'WARNING',
            value,
          })
        }
      }
    }

    // 应用转换器
    if (rule.transformer && result.valid) {
      try {
        result.transformedValue = rule.transformer(result.transformedValue, data, context)
      }
      catch (error) {
        result.valid = false
        result.errors.push({
          field,
          message: `Transformation error: ${error}`,
          code: 'TRANSFORM_ERROR',
          value,
        })
      }
    }

    return result
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(rule: ValidationRule, field: string, value: any): string {
    if (this.options.enableCustomMessages && rule.message) {
      if (typeof rule.message === 'function') {
        return rule.message(field, value)
      }
      return rule.message
    }

    return rule.defaultMessage || `Validation failed for field: ${field}`
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
  }

  /**
   * 查找未知字段
   */
  private findUnknownFields(data: any, prefix = ''): string[] {
    const unknownFields: string[] = []

    if (!data || typeof data !== 'object') {
      return unknownFields
    }

    for (const key in data) {
      const fullPath = prefix ? `${prefix}.${key}` : key

      if (!this.rules.has(fullPath)) {
        // 检查是否有父级规则
        const hasParentRule = Array.from(this.rules.keys()).some(ruleKey =>
          fullPath.startsWith(`${ruleKey}.`),
        )

        if (!hasParentRule) {
          unknownFields.push(fullPath)
        }
      }

      // 递归检查嵌套对象
      if (typeof data[key] === 'object' && data[key] !== null) {
        unknownFields.push(...this.findUnknownFields(data[key], fullPath))
      }
    }

    return unknownFields
  }

  /**
   * 清空所有规则
   */
  clear(): this {
    this.rules.clear()
    this.emit('rulesCleared')
    return this
  }

  /**
   * 获取字段规则
   */
  getRules(field?: string): Map<string, ValidationRule[]> | ValidationRule[] | undefined {
    if (field) {
      return this.rules.get(field)
    }
    return new Map(this.rules)
  }

  /**
   * 检查字段是否有规则
   */
  hasRules(field: string): boolean {
    return this.rules.has(field) && this.rules.get(field)!.length > 0
  }

  /**
   * 获取所有字段名
   */
  getFields(): string[] {
    return Array.from(this.rules.keys())
  }

  /**
   * 克隆验证器
   */
  clone(): Validator {
    const cloned = new Validator(this.options)

    for (const [field, rules] of this.rules) {
      cloned.rules.set(field, [...rules])
    }

    return cloned
  }

  /**
   * 合并验证器
   */
  merge(other: Validator): this {
    for (const [field, rules] of other.rules) {
      for (const rule of rules) {
        this.addRule(field, rule)
      }
    }
    return this
  }

  /**
   * 创建验证器实例
   */
  static create(options?: ValidatorOptions): Validator {
    return new Validator(options)
  }

  /**
   * 创建带规则的验证器
   */
  static createWithRules(
    rules: Record<string, ValidationRule | ValidationRule[]>,
    options?: ValidatorOptions,
  ): Validator {
    const validator = new Validator(options)
    validator.addRules(rules)
    return validator
  }
}
