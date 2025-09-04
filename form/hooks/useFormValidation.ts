/**
 * 表单验证 Hook
 * 提供强化的表单验证功能，支持复杂业务场景
 */

import { ref, computed, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { FormStateReturn } from './useFormState'

export interface ValidationRule {
  type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom' | 'async'
  message: string
  trigger?: 'change' | 'blur' | 'submit' | 'manual'
  validator?: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  // 条件验证
  condition?: (formData: Record<string, any>) => boolean
  // 跨字段验证
  dependencies?: string[]
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule[]
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
  firstError?: string
}

export interface FormValidationOptions {
  rules: Ref<ValidationRules> | ComputedRef<ValidationRules>
  formState: FormStateReturn
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceTime?: number
}

export interface FormValidationReturn {
  validating: Ref<boolean>
  validateField: (name: string, trigger?: string) => Promise<string | null>
  validateFields: (names: string[], trigger?: string) => Promise<ValidationResult>
  validateAll: (trigger?: string) => Promise<ValidationResult>
  clearValidation: (names?: string | string[]) => void
  getFieldError: (name: string) => string | undefined
  hasError: (name?: string) => boolean
  isValidating: (name?: string) => boolean
}

/**
 * 表单验证 Hook
 */
export function useFormValidation(options: FormValidationOptions): FormValidationReturn {
  const { rules, formState, validateOnChange = true, validateOnBlur = true, debounceTime = 300 } = options

  const validating = ref(false)
  const fieldValidating = ref<Record<string, boolean>>({})
  const debounceTimers = ref<Record<string, NodeJS.Timeout>>({})

  // 验证引擎
  class ValidationEngine {
    async validateRule(
      rule: ValidationRule,
      value: any,
      formData: Record<string, any>,
      fieldName: string
    ): Promise<boolean> {
      // 检查条件验证
      if (rule.condition && !rule.condition(formData)) {
        return true
      }

      switch (rule.type) {
        case 'required':
          return this.validateRequired(value)
        case 'pattern':
          return this.validatePattern(value, rule.pattern!)
        case 'min':
          return this.validateMin(value, rule.min!)
        case 'max':
          return this.validateMax(value, rule.max!)
        case 'minLength':
          return this.validateMinLength(value, rule.minLength!)
        case 'maxLength':
          return this.validateMaxLength(value, rule.maxLength!)
        case 'custom':
          return this.validateCustom(rule.validator!, value, formData)
        case 'async':
          return this.validateAsync(rule.validator!, value, formData)
        default:
          return true
      }
    }

    private validateRequired(value: any): boolean {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      return value != null && value !== ''
    }

    private validatePattern(value: any, pattern: RegExp): boolean {
      if (value == null || value === '') return true
      return pattern.test(String(value))
    }

    private validateMin(value: any, min: number): boolean {
      if (value == null || value === '') return true
      const numValue = Number(value)
      return !isNaN(numValue) && numValue >= min
    }

    private validateMax(value: any, max: number): boolean {
      if (value == null || value === '') return true
      const numValue = Number(value)
      return !isNaN(numValue) && numValue <= max
    }

    private validateMinLength(value: any, minLength: number): boolean {
      if (value == null) return true
      const length = Array.isArray(value) ? value.length : String(value).length
      return length >= minLength
    }

    private validateMaxLength(value: any, maxLength: number): boolean {
      if (value == null) return true
      const length = Array.isArray(value) ? value.length : String(value).length
      return length <= maxLength
    }

    private validateCustom(
      validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>,
      value: any,
      formData: Record<string, any>
    ): boolean | Promise<boolean> {
      return validator(value, formData)
    }

    private async validateAsync(
      validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>,
      value: any,
      formData: Record<string, any>
    ): Promise<boolean> {
      return await validator(value, formData)
    }
  }

  const engine = new ValidationEngine()

  // 验证单个字段
  const validateField = async (name: string, trigger = 'manual'): Promise<string | null> => {
    const fieldRules = rules.value[name] || []
    const value = formState.getFieldValue(name)
    const formData = formState.formData.value

    // 过滤符合触发条件的规则
    const applicableRules = fieldRules.filter(rule => 
      !rule.trigger || rule.trigger === trigger || trigger === 'manual'
    )

    if (applicableRules.length === 0) {
      return null
    }

    // 设置验证状态
    fieldValidating.value = {
      ...fieldValidating.value,
      [name]: true
    }

    try {
      for (const rule of applicableRules) {
        const isValid = await engine.validateRule(rule, value, formData, name)
        if (!isValid) {
          formState.setError(name, rule.message)
          return rule.message
        }
      }

      // 验证通过，清除错误
      formState.clearError(name)
      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '验证失败'
      formState.setError(name, errorMessage)
      return errorMessage
    } finally {
      fieldValidating.value = {
        ...fieldValidating.value,
        [name]: false
      }
    }
  }

  // 验证多个字段
  const validateFields = async (names: string[], trigger = 'manual'): Promise<ValidationResult> => {
    validating.value = true

    try {
      const results = await Promise.all(
        names.map(name => validateField(name, trigger))
      )

      const errors: Record<string, string> = {}
      let firstError: string | undefined

      results.forEach((error, index) => {
        if (error) {
          const fieldName = names[index]
          errors[fieldName] = error
          if (!firstError) {
            firstError = error
          }
        }
      })

      return {
        valid: Object.keys(errors).length === 0,
        errors,
        firstError
      }
    } finally {
      validating.value = false
    }
  }

  // 验证所有字段
  const validateAll = async (trigger = 'submit'): Promise<ValidationResult> => {
    const allFieldNames = Object.keys(rules.value)
    return validateFields(allFieldNames, trigger)
  }

  // 清除验证
  const clearValidation = (names?: string | string[]) => {
    if (!names) {
      formState.clearAllErrors()
      return
    }

    const fieldNames = Array.isArray(names) ? names : [names]
    fieldNames.forEach(name => {
      formState.clearError(name)
    })
  }

  // 获取字段错误
  const getFieldError = (name: string): string | undefined => {
    return formState.errors.value[name]
  }

  // 检查是否有错误
  const hasError = (name?: string): boolean => {
    if (name) {
      return !!formState.errors.value[name]
    }
    return Object.keys(formState.errors.value).length > 0
  }

  // 检查是否正在验证
  const isValidating = (name?: string): boolean => {
    if (name) {
      return !!fieldValidating.value[name]
    }
    return validating.value || Object.values(fieldValidating.value).some(Boolean)
  }

  // 防抖验证
  const debouncedValidateField = (name: string, trigger: string) => {
    if (debounceTimers.value[name]) {
      clearTimeout(debounceTimers.value[name])
    }

    debounceTimers.value[name] = setTimeout(() => {
      validateField(name, trigger)
      delete debounceTimers.value[name]
    }, debounceTime)
  }

  // 监听表单数据变化进行验证
  if (validateOnChange) {
    // 这里可以添加对 formState.formData 的监听
    // 由于性能考虑，建议在组件中手动调用验证
  }

  return {
    validating,
    validateField,
    validateFields,
    validateAll,
    clearValidation,
    getFieldError,
    hasError,
    isValidating
  }
}

/**
 * 内置验证规则
 */
export const builtInRules = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    type: 'required',
    message,
    trigger: 'blur'
  }),

  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    type: 'pattern',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
    trigger: 'blur'
  }),

  phone: (message = '请输入有效的手机号码'): ValidationRule => ({
    type: 'pattern',
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: 'blur'
  }),

  url: (message = '请输入有效的URL地址'): ValidationRule => ({
    type: 'pattern',
    pattern: /^https?:\/\/.+/,
    message,
    trigger: 'blur'
  }),

  number: (message = '请输入有效的数字'): ValidationRule => ({
    type: 'pattern',
    pattern: /^-?\d+(\.\d+)?$/,
    message,
    trigger: 'blur'
  }),

  integer: (message = '请输入整数'): ValidationRule => ({
    type: 'pattern',
    pattern: /^-?\d+$/,
    message,
    trigger: 'blur'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'minLength',
    minLength: min,
    message: message || `最少输入${min}个字符`,
    trigger: 'blur'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    maxLength: max,
    message: message || `最多输入${max}个字符`,
    trigger: 'change'
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    type: 'custom',
    message: message || `请输入${min}到${max}之间的数值`,
    validator: (value) => {
      const num = Number(value)
      return !isNaN(num) && num >= min && num <= max
    },
    trigger: 'blur'
  }),

  // 跨字段验证：确认密码
  confirmPassword: (passwordField: string, message = '两次输入的密码不一致'): ValidationRule => ({
    type: 'custom',
    message,
    dependencies: [passwordField],
    validator: (value, formData) => {
      return value === formData[passwordField]
    },
    trigger: 'blur'
  }),

  // 异步验证：用户名唯一性
  uniqueUsername: (checkFn: (username: string) => Promise<boolean>, message = '用户名已存在'): ValidationRule => ({
    type: 'async',
    message,
    validator: async (value) => {
      if (!value) return true
      return await checkFn(value)
    },
    trigger: 'blur'
  })
}