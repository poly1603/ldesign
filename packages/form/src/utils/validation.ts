// 验证工具函数

import type {
  BuiltinValidationRules,
  ValidationResult,
  ValidationRule,
} from '../types/validation'

/**
 * 内置验证规则
 */
export const builtinRules: BuiltinValidationRules = {
  required: {
    message: '此字段为必填项',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
    message: '请输入有效的邮箱地址',
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的URL地址',
  },
  number: {
    pattern: /^-?\d+(\.\d+)?$/,
    message: '请输入有效的数字',
  },
  integer: {
    pattern: /^-?\d+$/,
    message: '请输入有效的整数',
  },
  float: {
    pattern: /^-?\d+\.\d+$/,
    message: '请输入有效的小数',
  },
  min: {
    message: '值不能小于 {min}',
  },
  max: {
    message: '值不能大于 {max}',
  },
  minLength: {
    message: '长度不能少于 {minLength} 个字符',
  },
  maxLength: {
    message: '长度不能超过 {maxLength} 个字符',
  },
  pattern: {
    message: '格式不正确',
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: '请输入有效的日期格式 (YYYY-MM-DD)',
  },
  time: {
    pattern: /^\d{2}:\d{2}(:\d{2})?$/,
    message: '请输入有效的时间格式 (HH:MM 或 HH:MM:SS)',
  },
  datetime: {
    pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/,
    message: '请输入有效的日期时间格式 (YYYY-MM-DD HH:MM)',
  },
}

/**
 * 检查值是否为空
 */
export function isEmpty(value: any): boolean {
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
 * 验证必填字段
 */
export function validateRequired(value: any): boolean {
  return !isEmpty(value)
}

/**
 * 验证邮箱格式
 */
export function validateEmail(value: string): boolean {
  if (isEmpty(value))
    return true // 空值由 required 规则处理
  return builtinRules.email.pattern.test(value)
}

/**
 * 验证手机号格式
 */
export function validatePhone(value: string): boolean {
  if (isEmpty(value))
    return true
  return builtinRules.phone.pattern.test(value)
}

/**
 * 验证URL格式
 */
export function validateUrl(value: string): boolean {
  if (isEmpty(value))
    return true
  return builtinRules.url.pattern.test(value)
}

/**
 * 验证数字格式
 */
export function validateNumber(value: any): boolean {
  if (isEmpty(value))
    return true
  return !isNaN(Number(value)) && isFinite(Number(value))
}

/**
 * 验证整数格式
 */
export function validateInteger(value: any): boolean {
  if (isEmpty(value))
    return true
  return Number.isInteger(Number(value))
}

/**
 * 验证最小值
 */
export function validateMin(value: any, min: number): boolean {
  if (isEmpty(value))
    return true
  return Number(value) >= min
}

/**
 * 验证最大值
 */
export function validateMax(value: any, max: number): boolean {
  if (isEmpty(value))
    return true
  return Number(value) <= max
}

/**
 * 验证最小长度
 */
export function validateMinLength(
  value: string | any[],
  minLength: number,
): boolean {
  if (isEmpty(value))
    return true
  const length = typeof value === 'string' ? value.length : value.length
  return length >= minLength
}

/**
 * 验证最大长度
 */
export function validateMaxLength(
  value: string | any[],
  maxLength: number,
): boolean {
  if (isEmpty(value))
    return true
  const length = typeof value === 'string' ? value.length : value.length
  return length <= maxLength
}

/**
 * 验证正则表达式
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  if (isEmpty(value))
    return true
  return pattern.test(value)
}

/**
 * 验证日期格式
 */
export function validateDate(value: string): boolean {
  if (isEmpty(value))
    return true

  if (!builtinRules.date.pattern.test(value)) {
    return false
  }

  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * 验证时间格式
 */
export function validateTime(value: string): boolean {
  if (isEmpty(value))
    return true
  return builtinRules.time.pattern.test(value)
}

/**
 * 验证日期时间格式
 */
export function validateDateTime(value: string): boolean {
  if (isEmpty(value))
    return true

  if (!builtinRules.datetime.pattern.test(value)) {
    return false
  }

  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * 验证数组
 */
export function validateArray(value: any): boolean {
  return Array.isArray(value)
}

/**
 * 验证对象
 */
export function validateObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 验证枚举值
 */
export function validateEnum(value: any, enumValues: any[]): boolean {
  if (isEmpty(value))
    return true
  return enumValues.includes(value)
}

/**
 * 验证范围
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
): boolean {
  if (isEmpty(value))
    return true
  const num = Number(value)
  return num >= min && num <= max
}

/**
 * 格式化错误消息
 */
export function formatMessage(
  template: string,
  params: Record<string, any>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * 执行单个验证规则
 */
export async function executeRule(
  value: any,
  rule: ValidationRule,
  formData: Record<string, any>,
  field: string,
): Promise<ValidationResult> {
  try {
    // 检查条件
    if (rule.condition && !rule.condition(value, formData)) {
      return { valid: true, errors: [], field, rule }
    }

    let valid = true
    let message = rule.message

    // 自定义验证器
    if (rule.validator) {
      const result = await rule.validator(value, formData, field)
      if (typeof result === 'boolean') {
        valid = result
      }
      else {
        valid = false
        message = result
      }
    }
    else {
      // 内置验证规则
      switch (rule.type) {
        case 'required':
          valid = validateRequired(value)
          message = message || builtinRules.required.message
          break

        case 'email':
          valid = validateEmail(value)
          message = message || builtinRules.email.message
          break

        case 'phone':
          valid = validatePhone(value)
          message = message || builtinRules.phone.message
          break

        case 'url':
          valid = validateUrl(value)
          message = message || builtinRules.url.message
          break

        case 'number':
          valid = validateNumber(value)
          message = message || builtinRules.number.message
          break

        case 'integer':
          valid = validateInteger(value)
          message = message || builtinRules.integer.message
          break

        case 'min':
          valid = validateMin(value, rule.params)
          message
            = message
              || formatMessage(builtinRules.min.message, { min: rule.params })
          break

        case 'max':
          valid = validateMax(value, rule.params)
          message
            = message
              || formatMessage(builtinRules.max.message, { max: rule.params })
          break

        case 'minLength':
          valid = validateMinLength(value, rule.params)
          message
            = message
              || formatMessage(builtinRules.minLength.message, {
                minLength: rule.params,
              })
          break

        case 'maxLength':
          valid = validateMaxLength(value, rule.params)
          message
            = message
              || formatMessage(builtinRules.maxLength.message, {
                maxLength: rule.params,
              })
          break

        case 'pattern':
          valid = validatePattern(value, rule.params)
          message = message || builtinRules.pattern.message
          break

        case 'date':
          valid = validateDate(value)
          message = message || builtinRules.date.message
          break

        case 'time':
          valid = validateTime(value)
          message = message || builtinRules.time.message
          break

        case 'datetime':
          valid = validateDateTime(value)
          message = message || builtinRules.datetime.message
          break

        case 'array':
          valid = validateArray(value)
          message = message || '必须是数组类型'
          break

        case 'object':
          valid = validateObject(value)
          message = message || '必须是对象类型'
          break

        case 'enum':
          valid = validateEnum(value, rule.params)
          message = message || '值不在允许的范围内'
          break

        case 'range':
          valid = validateRange(value, rule.params.min, rule.params.max)
          message
            = message || `值必须在 ${rule.params.min} 到 ${rule.params.max} 之间`
          break

        default:
          valid = true
      }
    }

    return {
      valid,
      errors: valid ? [] : [message || '验证失败'],
      field,
      rule,
    }
  }
  catch (error) {
    return {
      valid: false,
      errors: [`验证过程中发生错误: ${error.message}`],
      field,
      rule,
    }
  }
}

/**
 * 验证字段的所有规则
 */
export async function validateField(
  value: any,
  rules: ValidationRule[],
  formData: Record<string, any>,
  field: string,
): Promise<ValidationResult> {
  const errors: string[] = []

  for (const rule of rules) {
    const result = await executeRule(value, rule, formData, field)
    if (!result.valid) {
      errors.push(...result.errors)

      // 如果遇到错误且不是 required 规则，停止后续验证
      if (rule.type !== 'required') {
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    field,
  }
}

/**
 * 创建验证规则
 */
export function createRule(
  type: ValidationRule['type'],
  params?: any,
  message?: string,
  options?: Partial<ValidationRule>,
): ValidationRule {
  return {
    type,
    params,
    message,
    trigger: 'change',
    async: false,
    ...options,
  }
}

/**
 * 创建必填规则
 */
export function required(message?: string): ValidationRule {
  return createRule('required', undefined, message)
}

/**
 * 创建邮箱规则
 */
export function email(message?: string): ValidationRule {
  return createRule('email', undefined, message)
}

/**
 * 创建手机号规则
 */
export function phone(message?: string): ValidationRule {
  return createRule('phone', undefined, message)
}

/**
 * 创建最小值规则
 */
export function min(value: number, message?: string): ValidationRule {
  return createRule('min', value, message)
}

/**
 * 创建最大值规则
 */
export function max(value: number, message?: string): ValidationRule {
  return createRule('max', value, message)
}

/**
 * 创建最小长度规则
 */
export function minLength(length: number, message?: string): ValidationRule {
  return createRule('minLength', length, message)
}

/**
 * 创建最大长度规则
 */
export function maxLength(length: number, message?: string): ValidationRule {
  return createRule('maxLength', length, message)
}

/**
 * 创建正则表达式规则
 */
export function pattern(regex: RegExp, message?: string): ValidationRule {
  return createRule('pattern', regex, message)
}

/**
 * 创建自定义验证规则
 */
export function custom(
  validator: (
    value: any,
    formData: Record<string, any>,
    field: string
  ) => boolean | string | Promise<boolean | string>,
  message?: string,
): ValidationRule {
  return createRule('custom', undefined, message, { validator })
}

/**
 * 创建异步验证规则
 */
export function asyncCustom(
  validator: (
    value: any,
    formData: Record<string, any>,
    field: string
  ) => Promise<boolean | string>,
  message?: string,
): ValidationRule {
  return createRule('custom', undefined, message, { validator, async: true })
}

/**
 * 创建条件验证规则
 */
export function when(
  condition: (value: any, formData: Record<string, any>) => boolean,
  rule: ValidationRule,
): ValidationRule {
  return {
    ...rule,
    condition,
  }
}

/**
 * 创建字段比较规则
 */
export function compareWith(
  targetField: string,
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' = 'eq',
  message?: string,
): ValidationRule {
  const validator = (value: any, formData: Record<string, any>) => {
    const targetValue = formData[targetField]

    switch (operator) {
      case 'eq':
        return value === targetValue
      case 'ne':
        return value !== targetValue
      case 'gt':
        return Number(value) > Number(targetValue)
      case 'gte':
        return Number(value) >= Number(targetValue)
      case 'lt':
        return Number(value) < Number(targetValue)
      case 'lte':
        return Number(value) <= Number(targetValue)
      default:
        return true
    }
  }

  return createRule('custom', undefined, message, { validator })
}

/**
 * 创建确认字段规则（常用于密码确认）
 */
export function confirm(targetField: string, message?: string): ValidationRule {
  return compareWith(
    targetField,
    'eq',
    message || `必须与${targetField}字段值相同`,
  )
}

/**
 * 创建数组长度规则
 */
export function arrayLength(
  min?: number,
  max?: number,
  message?: string,
): ValidationRule {
  const validator = (value: any) => {
    if (!Array.isArray(value))
      return false

    if (min !== undefined && value.length < min)
      return false
    if (max !== undefined && value.length > max)
      return false

    return true
  }

  return createRule('custom', undefined, message, { validator })
}

/**
 * 创建文件类型验证规则
 */
export function fileType(
  allowedTypes: string[],
  message?: string,
): ValidationRule {
  const validator = (value: any) => {
    if (!value)
      return true

    // 处理 File 对象
    if (value instanceof File) {
      return allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return value.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return value.type.includes(type)
      })
    }

    // 处理文件名字符串
    if (typeof value === 'string') {
      return allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return value.toLowerCase().endsWith(type.toLowerCase())
        }
        return false
      })
    }

    return false
  }

  return createRule('custom', undefined, message, { validator })
}

/**
 * 创建文件大小验证规则
 */
export function fileSize(maxSize: number, message?: string): ValidationRule {
  const validator = (value: any) => {
    if (!value)
      return true

    if (value instanceof File) {
      return value.size <= maxSize
    }

    return true
  }

  return createRule('custom', undefined, message, { validator })
}

/**
 * 验证规则组合器
 */
export class RuleBuilder {
  private rules: ValidationRule[] = []

  /**
   * 添加必填规则
   */
  required(message?: string): this {
    this.rules.push(required(message))
    return this
  }

  /**
   * 添加邮箱规则
   */
  email(message?: string): this {
    this.rules.push(email(message))
    return this
  }

  /**
   * 添加手机号规则
   */
  phone(message?: string): this {
    this.rules.push(phone(message))
    return this
  }

  /**
   * 添加最小值规则
   */
  min(value: number, message?: string): this {
    this.rules.push(min(value, message))
    return this
  }

  /**
   * 添加最大值规则
   */
  max(value: number, message?: string): this {
    this.rules.push(max(value, message))
    return this
  }

  /**
   * 添加最小长度规则
   */
  minLength(length: number, message?: string): this {
    this.rules.push(minLength(length, message))
    return this
  }

  /**
   * 添加最大长度规则
   */
  maxLength(length: number, message?: string): this {
    this.rules.push(maxLength(length, message))
    return this
  }

  /**
   * 添加正则表达式规则
   */
  pattern(regex: RegExp, message?: string): this {
    this.rules.push(pattern(regex, message))
    return this
  }

  /**
   * 添加自定义规则
   */
  custom(
    validator: (
      value: any,
      formData: Record<string, any>,
      field: string
    ) => boolean | string | Promise<boolean | string>,
    message?: string,
  ): this {
    this.rules.push(custom(validator, message))
    return this
  }

  /**
   * 添加条件规则
   */
  when(
    condition: (value: any, formData: Record<string, any>) => boolean,
    rule: ValidationRule,
  ): this {
    this.rules.push(when(condition, rule))
    return this
  }

  /**
   * 构建规则数组
   */
  build(): ValidationRule[] {
    return [...this.rules]
  }

  /**
   * 重置规则
   */
  reset(): this {
    this.rules = []
    return this
  }
}

/**
 * 创建规则构建器
 */
export function createRuleBuilder(): RuleBuilder {
  return new RuleBuilder()
}
