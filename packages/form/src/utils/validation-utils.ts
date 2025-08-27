/**
 * 验证相关工具函数
 */

import type { ValidationRule, AnyObject } from '../types'

/**
 * 内置验证规则
 */
export const builtinValidators = {
  /**
   * 必填验证
   */
  required: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') {
      return rule.message || '此字段为必填项'
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return rule.message || '请至少选择一项'
    }
    
    return true
  },
  
  /**
   * 最小长度验证
   */
  minLength: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined) return true
    
    const length = String(value).length
    const min = rule.value as number
    
    if (length < min) {
      return rule.message || `最少需要${min}个字符`
    }
    
    return true
  },
  
  /**
   * 最大长度验证
   */
  maxLength: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined) return true
    
    const length = String(value).length
    const max = rule.value as number
    
    if (length > max) {
      return rule.message || `最多允许${max}个字符`
    }
    
    return true
  },
  
  /**
   * 最小值验证
   */
  min: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const num = Number(value)
    const min = rule.value as number
    
    if (isNaN(num) || num < min) {
      return rule.message || `值不能小于${min}`
    }
    
    return true
  },
  
  /**
   * 最大值验证
   */
  max: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const num = Number(value)
    const max = rule.value as number
    
    if (isNaN(num) || num > max) {
      return rule.message || `值不能大于${max}`
    }
    
    return true
  },
  
  /**
   * 正则表达式验证
   */
  pattern: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const pattern = rule.value as RegExp | string
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    
    if (!regex.test(String(value))) {
      return rule.message || '格式不正确'
    }
    
    return true
  },
  
  /**
   * 邮箱验证
   */
  email: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(String(value))) {
      return rule.message || '请输入有效的邮箱地址'
    }
    
    return true
  },
  
  /**
   * 手机号验证
   */
  phone: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const phoneRegex = /^1[3-9]\d{9}$/
    
    if (!phoneRegex.test(String(value))) {
      return rule.message || '请输入有效的手机号码'
    }
    
    return true
  },
  
  /**
   * 身份证号验证
   */
  idCard: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    
    if (!idCardRegex.test(String(value))) {
      return rule.message || '请输入有效的身份证号码'
    }
    
    return true
  },
  
  /**
   * URL验证
   */
  url: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    try {
      new URL(String(value))
      return true
    } catch {
      return rule.message || '请输入有效的URL地址'
    }
  },
  
  /**
   * 数字验证
   */
  number: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    if (isNaN(Number(value))) {
      return rule.message || '请输入有效的数字'
    }
    
    return true
  },
  
  /**
   * 整数验证
   */
  integer: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (value === null || value === undefined || value === '') return true
    
    const num = Number(value)
    if (isNaN(num) || !Number.isInteger(num)) {
      return rule.message || '请输入整数'
    }
    
    return true
  },
  
  /**
   * 自定义验证
   */
  custom: (value: any, rule: ValidationRule, formData: AnyObject) => {
    if (typeof rule.validator === 'function') {
      return rule.validator(value, rule, formData)
    }
    
    return true
  }
}

/**
 * 验证单个值
 */
export function validateValue(
  value: any,
  rules: ValidationRule[],
  formData: AnyObject = {}
): { valid: boolean; message?: string } {
  for (const rule of rules) {
    const validator = builtinValidators[rule.type as keyof typeof builtinValidators]
    
    if (!validator) {
      console.warn(`未知的验证规则类型: ${rule.type}`)
      continue
    }
    
    const result = validator(value, rule, formData)
    
    if (result !== true) {
      return {
        valid: false,
        message: typeof result === 'string' ? result : rule.message || '验证失败'
      }
    }
  }
  
  return { valid: true }
}

/**
 * 验证多个字段
 */
export function validateFields(
  data: AnyObject,
  fieldRules: Record<string, ValidationRule[]>
): { valid: boolean; fields: Record<string, { valid: boolean; message?: string }> } {
  const fields: Record<string, { valid: boolean; message?: string }> = {}
  let allValid = true
  
  for (const [fieldName, rules] of Object.entries(fieldRules)) {
    const value = getNestedValue(data, fieldName)
    const result = validateValue(value, rules, data)
    
    fields[fieldName] = result
    
    if (!result.valid) {
      allValid = false
    }
  }
  
  return { valid: allValid, fields }
}

/**
 * 创建验证规则
 */
export function createValidationRule(
  type: string,
  value?: any,
  message?: string,
  validator?: Function
): ValidationRule {
  return {
    type,
    value,
    message,
    validator
  }
}

/**
 * 创建必填规则
 */
export function required(message?: string): ValidationRule {
  return createValidationRule('required', undefined, message)
}

/**
 * 创建最小长度规则
 */
export function minLength(length: number, message?: string): ValidationRule {
  return createValidationRule('minLength', length, message)
}

/**
 * 创建最大长度规则
 */
export function maxLength(length: number, message?: string): ValidationRule {
  return createValidationRule('maxLength', length, message)
}

/**
 * 创建最小值规则
 */
export function min(value: number, message?: string): ValidationRule {
  return createValidationRule('min', value, message)
}

/**
 * 创建最大值规则
 */
export function max(value: number, message?: string): ValidationRule {
  return createValidationRule('max', value, message)
}

/**
 * 创建正则表达式规则
 */
export function pattern(regex: RegExp | string, message?: string): ValidationRule {
  return createValidationRule('pattern', regex, message)
}

/**
 * 创建邮箱规则
 */
export function email(message?: string): ValidationRule {
  return createValidationRule('email', undefined, message)
}

/**
 * 创建手机号规则
 */
export function phone(message?: string): ValidationRule {
  return createValidationRule('phone', undefined, message)
}

/**
 * 创建身份证号规则
 */
export function idCard(message?: string): ValidationRule {
  return createValidationRule('idCard', undefined, message)
}

/**
 * 创建URL规则
 */
export function url(message?: string): ValidationRule {
  return createValidationRule('url', undefined, message)
}

/**
 * 创建数字规则
 */
export function number(message?: string): ValidationRule {
  return createValidationRule('number', undefined, message)
}

/**
 * 创建整数规则
 */
export function integer(message?: string): ValidationRule {
  return createValidationRule('integer', undefined, message)
}

/**
 * 创建自定义规则
 */
export function custom(
  validator: (value: any, rule: ValidationRule, formData: AnyObject) => boolean | string,
  message?: string
): ValidationRule {
  return createValidationRule('custom', undefined, message, validator)
}

/**
 * 组合多个规则
 */
export function rules(...ruleList: ValidationRule[]): ValidationRule[] {
  return ruleList
}

/**
 * 条件验证规则
 */
export function when(
  condition: (formData: AnyObject) => boolean,
  thenRules: ValidationRule[],
  elseRules: ValidationRule[] = []
): ValidationRule {
  return createValidationRule('custom', undefined, undefined, (value, rule, formData) => {
    const rulesToApply = condition(formData) ? thenRules : elseRules
    const result = validateValue(value, rulesToApply, formData)
    return result.valid ? true : result.message || '验证失败'
  })
}

/**
 * 异步验证规则
 */
export function asyncValidator(
  validator: (value: any, rule: ValidationRule, formData: AnyObject) => Promise<boolean | string>,
  message?: string
): ValidationRule {
  return createValidationRule('custom', undefined, message, validator)
}

// 辅助函数
function getNestedValue(obj: AnyObject, path: string): any {
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
