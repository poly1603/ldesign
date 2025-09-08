/**
 * 表单验证器
 * 提供专门的表单数据验证功能
 */

import type {
  FieldValidationResult,
  FormValidationResult,
  FormValidationRule,
  FormValidatorOptions,
} from '../types'
import { EventEmitter } from 'node:events'
import { Validator } from './validator'

/**
 * 表单验证器类
 */
export class FormValidator extends EventEmitter {
  private validator: Validator
  private fieldRules: Map<string, FormValidationRule[]> = new Map()
  private crossFieldRules: FormValidationRule[] = []
  private options: Required<FormValidatorOptions>

  constructor(options: FormValidatorOptions = {}) {
    super()

    this.options = {
      validateOnChange: options.validateOnChange !== false,
      validateOnBlur: options.validateOnBlur !== false,
      validateOnSubmit: options.validateOnSubmit !== false,
      showErrorsImmediately: options.showErrorsImmediately !== false,
      stopOnFirstError: options.stopOnFirstError !== false,
      enableRealTimeValidation: options.enableRealTimeValidation !== false,
      debounceTime: options.debounceTime || 300,
      enableCrossFieldValidation: options.enableCrossFieldValidation !== false,
    }

    this.validator = new Validator({
      stopOnFirstError: this.options.stopOnFirstError,
    })
  }

  /**
   * 添加字段验证规则
   */
  addFieldRule(fieldName: string, rule: FormValidationRule): this {
    if (!this.fieldRules.has(fieldName)) {
      this.fieldRules.set(fieldName, [])
    }

    this.fieldRules.get(fieldName)!.push(rule)
    this.emit('fieldRuleAdded', { fieldName, rule })
    return this
  }

  /**
   * 批量添加字段规则
   */
  addFieldRules(rules: Record<string, FormValidationRule | FormValidationRule[]>): this {
    for (const [fieldName, rule] of Object.entries(rules)) {
      if (Array.isArray(rule)) {
        rule.forEach(r => this.addFieldRule(fieldName, r))
      }
      else {
        this.addFieldRule(fieldName, rule)
      }
    }
    return this
  }

  /**
   * 添加跨字段验证规则
   */
  addCrossFieldRule(rule: FormValidationRule): this {
    this.crossFieldRules.push(rule)
    this.emit('crossFieldRuleAdded', rule)
    return this
  }

  /**
   * 验证整个表单
   */
  async validateForm(formData: Record<string, any>): Promise<FormValidationResult> {
    const result: FormValidationResult = {
      valid: true,
      errors: {},
      warnings: {},
      fieldResults: {},
      crossFieldErrors: [],
      data: { ...formData },
    }

    this.emit('formValidationStart', formData)

    try {
      // 验证各个字段
      for (const [fieldName] of this.fieldRules) {
        const fieldResult = await this.validateField(fieldName, formData[fieldName], formData)
        result.fieldResults[fieldName] = fieldResult

        if (!fieldResult.valid) {
          result.valid = false
          result.errors[fieldName] = fieldResult.errors
        }

        if (fieldResult.warnings.length > 0) {
          result.warnings[fieldName] = fieldResult.warnings
        }

        // 应用转换后的值
        if (fieldResult.transformedValue !== undefined) {
          result.data[fieldName] = fieldResult.transformedValue
        }

        if (this.options.stopOnFirstError && !fieldResult.valid) {
          break
        }
      }

      // 跨字段验证
      if (this.options.enableCrossFieldValidation && this.crossFieldRules.length > 0) {
        const crossFieldResult = await this.validateCrossFields(result.data)
        if (!crossFieldResult.valid) {
          result.valid = false
          result.crossFieldErrors = crossFieldResult.errors
        }
      }

      this.emit('formValidationEnd', result)
      return result
    }
    catch (error) {
      this.emit('formValidationError', error)
      throw error
    }
  }

  /**
   * 验证单个字段
   */
  async validateField(
    fieldName: string,
    value: any,
    formData: Record<string, any> = {},
  ): Promise<FieldValidationResult> {
    const result: FieldValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      transformedValue: value,
    }

    const rules = this.fieldRules.get(fieldName) || []

    this.emit('fieldValidationStart', { fieldName, value, formData })

    for (const rule of rules) {
      try {
        const ruleResult = await this.executeFieldRule(rule, value, fieldName, formData)

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
          result.transformedValue = ruleResult.transformedValue
          value = ruleResult.transformedValue // 为下一个规则更新值
        }
      }
      catch (error) {
        result.valid = false
        result.errors.push({
          field: fieldName,
          message: `Rule execution error: ${error}`,
          code: 'RULE_ERROR',
          value,
        })

        if (this.options.stopOnFirstError) {
          break
        }
      }
    }

    this.emit('fieldValidationEnd', { fieldName, result })
    return result
  }

  /**
   * 跨字段验证
   */
  private async validateCrossFields(
    formData: Record<string, any>,
  ): Promise<{ valid: boolean, errors: any[] }> {
    const result = { valid: true, errors: [] as any[] }

    for (const rule of this.crossFieldRules) {
      try {
        const ruleResult = await this.executeCrossFieldRule(rule, formData)

        if (!ruleResult.valid) {
          result.valid = false
          result.errors.push(...ruleResult.errors)
        }
      }
      catch (error) {
        result.valid = false
        result.errors.push({
          message: `Cross-field rule execution error: ${error}`,
          code: 'CROSS_FIELD_ERROR',
          fields: rule.fields || [],
        })
      }
    }

    return result
  }

  /**
   * 执行字段规则
   */
  private async executeFieldRule(
    rule: FormValidationRule,
    value: any,
    fieldName: string,
    formData: Record<string, any>,
  ): Promise<FieldValidationResult> {
    const result: FieldValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      transformedValue: value,
    }

    // 检查条件
    if (rule.condition && !rule.condition(value, formData, fieldName)) {
      return result
    }

    // 执行验证
    if (rule.validator) {
      const validationResult = await rule.validator(value, formData, fieldName)

      if (typeof validationResult === 'boolean') {
        if (!validationResult) {
          result.valid = false
          result.errors.push({
            field: fieldName,
            message: this.getFieldErrorMessage(rule, fieldName, value),
            code: rule.code || 'VALIDATION_ERROR',
            value,
          })
        }
      }
      else if (validationResult && typeof validationResult === 'object') {
        if (!validationResult.valid) {
          result.valid = false
          result.errors.push({
            field: fieldName,
            message: validationResult.message || this.getFieldErrorMessage(rule, fieldName, value),
            code: validationResult.code || rule.code || 'VALIDATION_ERROR',
            value,
          })
        }

        if (validationResult.transformedValue !== undefined) {
          result.transformedValue = validationResult.transformedValue
        }

        if (validationResult.warning) {
          result.warnings.push({
            field: fieldName,
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
        result.transformedValue = rule.transformer(result.transformedValue, formData, fieldName)
      }
      catch (error) {
        result.valid = false
        result.errors.push({
          field: fieldName,
          message: `Transformation error: ${error}`,
          code: 'TRANSFORM_ERROR',
          value,
        })
      }
    }

    return result
  }

  /**
   * 执行跨字段规则
   */
  private async executeCrossFieldRule(
    rule: FormValidationRule,
    formData: Record<string, any>,
  ): Promise<{ valid: boolean, errors: any[] }> {
    const result = { valid: true, errors: [] as any[] }

    if (rule.validator) {
      const validationResult = await rule.validator(formData, formData, '')

      if (typeof validationResult === 'boolean') {
        if (!validationResult) {
          result.valid = false
          result.errors.push({
            message: rule.message || 'Cross-field validation failed',
            code: rule.code || 'CROSS_FIELD_ERROR',
            fields: rule.fields || [],
          })
        }
      }
      else if (validationResult && typeof validationResult === 'object') {
        if (!validationResult.valid) {
          result.valid = false
          result.errors.push({
            message: validationResult.message || rule.message || 'Cross-field validation failed',
            code: validationResult.code || rule.code || 'CROSS_FIELD_ERROR',
            fields: rule.fields || [],
          })
        }
      }
    }

    return result
  }

  /**
   * 获取字段错误消息
   */
  private getFieldErrorMessage(rule: FormValidationRule, fieldName: string, value: any): string {
    if (rule.message) {
      if (typeof rule.message === 'function') {
        return rule.message(fieldName, value)
      }
      return rule.message
    }

    return `Validation failed for field: ${fieldName}`
  }

  /**
   * 实时验证字段
   */
  async validateFieldRealTime(
    fieldName: string,
    value: any,
    formData: Record<string, any> = {},
  ): Promise<FieldValidationResult> {
    if (!this.options.enableRealTimeValidation) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        transformedValue: value,
      }
    }

    // 防抖处理
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.validateField(fieldName, value, formData)
        this.emit('realTimeValidation', { fieldName, result })
        resolve(result)
      }, this.options.debounceTime)
    })
  }

  /**
   * 获取字段规则
   */
  getFieldRules(fieldName: string): FormValidationRule[] {
    return this.fieldRules.get(fieldName) || []
  }

  /**
   * 获取跨字段规则
   */
  getCrossFieldRules(): FormValidationRule[] {
    return [...this.crossFieldRules]
  }

  /**
   * 移除字段规则
   */
  removeFieldRule(fieldName: string, rule?: FormValidationRule): this {
    const rules = this.fieldRules.get(fieldName)
    if (!rules)
      return this

    if (rule) {
      const index = rules.indexOf(rule)
      if (index !== -1) {
        rules.splice(index, 1)
        this.emit('fieldRuleRemoved', { fieldName, rule })
      }
    }
    else {
      this.fieldRules.delete(fieldName)
      this.emit('fieldRulesCleared', fieldName)
    }

    return this
  }

  /**
   * 移除跨字段规则
   */
  removeCrossFieldRule(rule: FormValidationRule): boolean {
    const index = this.crossFieldRules.indexOf(rule)
    if (index !== -1) {
      this.crossFieldRules.splice(index, 1)
      this.emit('crossFieldRuleRemoved', rule)
      return true
    }
    return false
  }

  /**
   * 清空所有规则
   */
  clear(): this {
    this.fieldRules.clear()
    this.crossFieldRules = []
    this.validator.clear()
    this.emit('rulesCleared')
    return this
  }

  /**
   * 获取所有字段名
   */
  getFieldNames(): string[] {
    return Array.from(this.fieldRules.keys())
  }

  /**
   * 检查字段是否有规则
   */
  hasFieldRules(fieldName: string): boolean {
    return this.fieldRules.has(fieldName) && this.fieldRules.get(fieldName)!.length > 0
  }

  /**
   * 创建表单验证器实例
   */
  static create(options?: FormValidatorOptions): FormValidator {
    return new FormValidator(options)
  }

  /**
   * 创建带规则的表单验证器
   */
  static createWithRules(
    fieldRules: Record<string, FormValidationRule | FormValidationRule[]>,
    crossFieldRules: FormValidationRule[] = [],
    options?: FormValidatorOptions,
  ): FormValidator {
    const validator = new FormValidator(options)
    validator.addFieldRules(fieldRules)
    crossFieldRules.forEach(rule => validator.addCrossFieldRule(rule))
    return validator
  }
}
