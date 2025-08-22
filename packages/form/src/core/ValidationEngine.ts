/**
 * @fileoverview Form validation engine with built-in validators
 * @author LDesign Team
 */

import type {
  FormData,
  FormFieldValue,
  ValidationRule,
  FieldValidationResult,
  FormValidationResult,
  ValidatorFunction,
  BuiltInValidatorType,
} from '../types'

/**
 * Built-in validator implementations
 */
export class BuiltInValidators {
  /**
   * Required field validator
   */
  static required(value: FormFieldValue): boolean | string {
    if (value === null || value === undefined || value === '') {
      return '此字段为必填项'
    }
    if (Array.isArray(value) && value.length === 0) {
      return '请至少选择一项'
    }
    return true
  }

  /**
   * Email format validator
   */
  static email(value: FormFieldValue): boolean | string {
    if (!value) return true // Optional field

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof value === 'string' && !emailRegex.test(value)) {
      return '请输入有效的邮箱地址'
    }
    return true
  }

  /**
   * Phone number validator
   */
  static phone(value: FormFieldValue): boolean | string {
    if (!value) return true // Optional field

    const phoneRegex = /^1[3-9]\d{9}$/
    if (typeof value === 'string' && !phoneRegex.test(value)) {
      return '请输入有效的手机号码'
    }
    return true
  }

  /**
   * URL format validator
   */
  static url(value: FormFieldValue): boolean | string {
    if (!value) return true // Optional field

    try {
      new URL(value as string)
      return true
    } catch {
      return '请输入有效的URL地址'
    }
  }

  /**
   * Number validator
   */
  static number(value: FormFieldValue): boolean | string {
    if (!value) return true // Optional field

    if (isNaN(Number(value))) {
      return '请输入有效的数字'
    }
    return true
  }

  /**
   * Minimum value validator
   */
  static min(value: FormFieldValue, params: { value: number }): boolean | string {
    if (!value) return true // Optional field

    const num = Number(value)
    if (isNaN(num) || num < params.value) {
      return `值不能小于 ${params.value}`
    }
    return true
  }

  /**
   * Maximum value validator
   */
  static max(value: FormFieldValue, params: { value: number }): boolean | string {
    if (!value) return true // Optional field

    const num = Number(value)
    if (isNaN(num) || num > params.value) {
      return `值不能大于 ${params.value}`
    }
    return true
  }

  /**
   * Minimum length validator
   */
  static minLength(value: FormFieldValue, params: { length: number }): boolean | string {
    if (!value) return true // Optional field

    const str = String(value)
    if (str.length < params.length) {
      return `长度不能少于 ${params.length} 个字符`
    }
    return true
  }

  /**
   * Maximum length validator
   */
  static maxLength(value: FormFieldValue, params: { length: number }): boolean | string {
    if (!value) return true // Optional field

    const str = String(value)
    if (str.length > params.length) {
      return `长度不能超过 ${params.length} 个字符`
    }
    return true
  }

  /**
   * Pattern (regex) validator
   */
  static pattern(value: FormFieldValue, params: { regexp: RegExp | string }): boolean | string {
    if (!value) return true // Optional field

    const regex = typeof params.regexp === 'string' ? new RegExp(params.regexp) : params.regexp
    if (!regex.test(String(value))) {
      return '格式不正确'
    }
    return true
  }
}

/**
 * Validation engine for form fields and forms
 */
export class ValidationEngine {
  private validators: Map<string, ValidatorFunction> = new Map()
  private defaultMessages: Map<string, string> = new Map()

  constructor() {
    this.initializeBuiltInValidators()
    this.initializeDefaultMessages()
  }

  /**
   * Initialize built-in validators
   */
  private initializeBuiltInValidators(): void {
    this.validators.set('required', BuiltInValidators.required)
    this.validators.set('email', BuiltInValidators.email)
    this.validators.set('phone', BuiltInValidators.phone)
    this.validators.set('url', BuiltInValidators.url)
    this.validators.set('number', BuiltInValidators.number)
    this.validators.set('min', (value, allValues, params) =>
      BuiltInValidators.min(value, params as { value: number })
    )
    this.validators.set('max', (value, allValues, params) =>
      BuiltInValidators.max(value, params as { value: number })
    )
    this.validators.set('minLength', (value, allValues, params) =>
      BuiltInValidators.minLength(value, params as { length: number })
    )
    this.validators.set('maxLength', (value, allValues, params) =>
      BuiltInValidators.maxLength(value, params as { length: number })
    )
    this.validators.set('pattern', (value, allValues, params) =>
      BuiltInValidators.pattern(value, params as { regexp: RegExp | string })
    )
  }

  /**
   * Initialize default error messages
   */
  private initializeDefaultMessages(): void {
    this.defaultMessages.set('required', '此字段为必填项')
    this.defaultMessages.set('email', '请输入有效的邮箱地址')
    this.defaultMessages.set('phone', '请输入有效的手机号码')
    this.defaultMessages.set('url', '请输入有效的URL地址')
    this.defaultMessages.set('number', '请输入有效的数字')
    this.defaultMessages.set('min', '值过小')
    this.defaultMessages.set('max', '值过大')
    this.defaultMessages.set('minLength', '长度过短')
    this.defaultMessages.set('maxLength', '长度过长')
    this.defaultMessages.set('pattern', '格式不正确')
  }

  /**
   * Register custom validator
   */
  registerValidator(name: string, validator: ValidatorFunction): void {
    this.validators.set(name, validator)
  }

  /**
   * Get validator by name
   */
  getValidator(name: string): ValidatorFunction | undefined {
    return this.validators.get(name)
  }

  /**
   * Validate single field
   */
  async validateField(
    fieldName: string,
    value: FormFieldValue,
    rules: ValidationRule[],
    formData: FormData
  ): Promise<FieldValidationResult> {
    if (!rules || rules.length === 0) {
      return { valid: true }
    }

    for (const rule of rules) {
      try {
        let validator: ValidatorFunction

        if (typeof rule.validator === 'string') {
          const builtInValidator = this.validators.get(rule.validator)
          if (!builtInValidator) {
            console.warn(`Unknown validator: ${rule.validator}`)
            continue
          }
          validator = builtInValidator
        } else {
          validator = rule.validator
        }

        // Execute validator
        const result = await validator(value, formData, rule.params)

        if (result !== true) {
          const message = typeof result === 'string'
            ? result
            : rule.message || this.getDefaultMessage(String(rule.validator))

          return {
            valid: false,
            message,
            rule: String(rule.validator)
          }
        }
      } catch (error) {
        console.error(`Validation error for field ${fieldName}:`, error)
        return {
          valid: false,
          message: rule.message || '验证失败',
          rule: String(rule.validator)
        }
      }
    }

    return { valid: true }
  }

  /**
   * Validate entire form
   */
  async validateForm(
    formData: FormData,
    fieldRules: Record<string, ValidationRule[]>
  ): Promise<FormValidationResult> {
    const errors: Record<string, FieldValidationResult> = {}
    const validationPromises: Promise<void>[] = []

    for (const [fieldName, rules] of Object.entries(fieldRules)) {
      const promise = this.validateField(fieldName, formData[fieldName], rules, formData)
        .then(result => {
          if (!result.valid) {
            errors[fieldName] = result
          }
        })

      validationPromises.push(promise)
    }

    await Promise.all(validationPromises)

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Get default error message for validator
   */
  private getDefaultMessage(validatorName: string): string {
    return this.defaultMessages.get(validatorName) || '验证失败'
  }

  /**
   * Set default error message
   */
  setDefaultMessage(validatorName: string, message: string): void {
    this.defaultMessages.set(validatorName, message)
  }

  /**
   * Check if validator exists
   */
  hasValidator(name: string): boolean {
    return this.validators.has(name)
  }

  /**
   * Get all registered validator names
   */
  getValidatorNames(): string[] {
    return Array.from(this.validators.keys())
  }

  /**
   * Remove validator
   */
  removeValidator(name: string): void {
    this.validators.delete(name)
  }

  /**
   * Clear all custom validators (keeps built-in ones)
   */
  clearCustomValidators(): void {
    const builtInValidators = [
      'required', 'email', 'phone', 'url', 'number',
      'min', 'max', 'minLength', 'maxLength', 'pattern'
    ]

    for (const [name] of this.validators) {
      if (!builtInValidators.includes(name)) {
        this.validators.delete(name)
      }
    }
  }
}