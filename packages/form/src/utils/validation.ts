/**
 * 表单验证工具函数
 * 
 * 提供表单验证相关的工具函数，包括：
 * - 内置验证器
 * - 验证规则处理
 * - 验证结果处理
 * - 验证消息格式化
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidatorFunction,
} from '../types'
import { VALIDATION_MESSAGES, VALIDATION_PATTERNS } from '../types'
import { formatTemplate, isEmpty, isFunction, isNumber, isString } from './helpers'

/**
 * 内置验证器映射
 */
const BUILTIN_VALIDATORS: Record<string, ValidatorFunction> = {
  /**
   * 必填验证器
   */
  required: ({ value, rule }: ValidationContext): ValidationResult => {
    const isValid = !isEmpty(value)
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.required,
      validator: 'required',
    }
  },

  /**
   * 正则表达式验证器
   */
  pattern: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'pattern' }
    }

    const pattern = rule.params as RegExp
    const isValid = pattern.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.pattern,
      validator: 'pattern',
    }
  },

  /**
   * 最小值验证器
   */
  min: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'min' }
    }

    const min = rule.params as number
    const numValue = Number(value)
    const isValid = !Number.isNaN(numValue) && numValue >= min
    return {
      valid: isValid,
      message: isValid ? '' : formatTemplate(rule.message || VALIDATION_MESSAGES.min, { min }),
      validator: 'min',
    }
  },

  /**
   * 最大值验证器
   */
  max: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'max' }
    }

    const max = rule.params as number
    const numValue = Number(value)
    const isValid = !Number.isNaN(numValue) && numValue <= max
    return {
      valid: isValid,
      message: isValid ? '' : formatTemplate(rule.message || VALIDATION_MESSAGES.max, { max }),
      validator: 'max',
    }
  },

  /**
   * 最小长度验证器
   */
  minLength: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'minLength' }
    }

    const min = rule.params as number
    const length = String(value).length
    const isValid = length >= min
    return {
      valid: isValid,
      message: isValid ? '' : formatTemplate(rule.message || VALIDATION_MESSAGES.minLength, { min }),
      validator: 'minLength',
    }
  },

  /**
   * 最大长度验证器
   */
  maxLength: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'maxLength' }
    }

    const max = rule.params as number
    const length = String(value).length
    const isValid = length <= max
    return {
      valid: isValid,
      message: isValid ? '' : formatTemplate(rule.message || VALIDATION_MESSAGES.maxLength, { max }),
      validator: 'maxLength',
    }
  },

  /**
   * 邮箱验证器
   */
  email: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'email' }
    }

    const isValid = VALIDATION_PATTERNS.EMAIL.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.email,
      validator: 'email',
    }
  },

  /**
   * URL验证器
   */
  url: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'url' }
    }

    const isValid = VALIDATION_PATTERNS.URL.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.url,
      validator: 'url',
    }
  },

  /**
   * 手机号验证器
   */
  phone: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'phone' }
    }

    const isValid = VALIDATION_PATTERNS.PHONE.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.phone,
      validator: 'phone',
    }
  },

  /**
   * 身份证号验证器
   */
  idCard: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'idCard' }
    }

    const isValid = VALIDATION_PATTERNS.ID_CARD.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.idCard,
      validator: 'idCard',
    }
  },

  /**
   * 数字验证器
   */
  number: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'number' }
    }

    const isValid = VALIDATION_PATTERNS.NUMBER.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.number,
      validator: 'number',
    }
  },

  /**
   * 整数验证器
   */
  integer: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'integer' }
    }

    const isValid = VALIDATION_PATTERNS.INTEGER.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.integer,
      validator: 'integer',
    }
  },

  /**
   * 浮点数验证器
   */
  float: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'float' }
    }

    const isValid = VALIDATION_PATTERNS.FLOAT.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.float,
      validator: 'float',
    }
  },

  /**
   * 日期验证器
   */
  date: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'date' }
    }

    let isValid = false
    if (value instanceof Date) {
      isValid = !Number.isNaN(value.getTime())
    } else {
      const date = new Date(value)
      isValid = !Number.isNaN(date.getTime())
    }

    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.date,
      validator: 'date',
    }
  },

  /**
   * 数组验证器
   */
  array: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'array' }
    }

    const isValid = Array.isArray(value)
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.array,
      validator: 'array',
    }
  },

  /**
   * 对象验证器
   */
  object: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'object' }
    }

    const isValid = value !== null && typeof value === 'object' && !Array.isArray(value)
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.object,
      validator: 'object',
    }
  },

  /**
   * 枚举验证器
   */
  enum: ({ value, rule }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, validator: 'enum' }
    }

    const enumValues = rule.params as any[]
    const isValid = enumValues.includes(value)
    return {
      valid: isValid,
      message: isValid ? '' : rule.message || VALIDATION_MESSAGES.enum,
      validator: 'enum',
    }
  },
}

/**
 * 获取验证器
 * 
 * @param type 验证器类型
 * @returns 验证器函数
 */
export function getValidator(type: string): ValidatorFunction | undefined {
  return BUILTIN_VALIDATORS[type]
}

/**
 * 注册自定义验证器
 * 
 * @param name 验证器名称
 * @param validator 验证器函数
 */
export function registerValidator(name: string, validator: ValidatorFunction): void {
  BUILTIN_VALIDATORS[name] = validator
}

/**
 * 注销验证器
 * 
 * @param name 验证器名称
 */
export function unregisterValidator(name: string): void {
  delete BUILTIN_VALIDATORS[name]
}

/**
 * 检查验证器是否存在
 * 
 * @param name 验证器名称
 * @returns 是否存在
 */
export function hasValidator(name: string): boolean {
  return name in BUILTIN_VALIDATORS
}

/**
 * 获取所有验证器名称
 * 
 * @returns 验证器名称数组
 */
export function getValidatorNames(): string[] {
  return Object.keys(BUILTIN_VALIDATORS)
}

/**
 * 执行单个验证规则
 * 
 * @param context 验证上下文
 * @returns 验证结果
 */
export async function executeValidationRule(context: ValidationContext): Promise<ValidationResult> {
  const { rule } = context

  // 检查验证条件
  if (rule.condition && !rule.condition(context.values)) {
    return { valid: true, validator: rule.type }
  }

  // 使用自定义验证器
  if (rule.validator) {
    const result = await rule.validator(context)

    if (typeof result === 'boolean') {
      return {
        valid: result,
        message: result ? '' : rule.message,
        validator: rule.type,
      }
    }

    if (typeof result === 'string') {
      return {
        valid: false,
        message: result,
        validator: rule.type,
      }
    }

    return result
  }

  // 使用内置验证器
  const validator = getValidator(rule.type)
  if (!validator) {
    throw new Error(`Unknown validator type: ${rule.type}`)
  }

  return await validator(context)
}

/**
 * 执行多个验证规则
 * 
 * @param fieldName 字段名称
 * @param value 字段值
 * @param rules 验证规则数组
 * @param values 所有表单值
 * @param stopOnFirstError 是否在第一个错误时停止
 * @returns 验证结果数组
 */
export async function executeValidationRules(
  fieldName: string,
  value: any,
  rules: ValidationRule[],
  values: Record<string, any>,
  stopOnFirstError = false
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // 按优先级排序
  const sortedRules = [...rules].sort((a, b) => (a.priority || 0) - (b.priority || 0))

  for (const rule of sortedRules) {
    // 如果设置了跳过错误且已有错误，则跳过
    if (rule.skipOnError && results.some(r => !r.valid)) {
      continue
    }

    const context: ValidationContext = {
      value,
      values,
      fieldName,
      rule,
    }

    try {
      const result = await executeValidationRule(context)
      results.push(result)

      // 如果验证失败且设置了在第一个错误时停止，则停止验证
      if (!result.valid && stopOnFirstError) {
        break
      }
    } catch (error) {
      results.push({
        valid: false,
        message: error instanceof Error ? error.message : 'Validation error',
        validator: rule.type,
      })

      if (stopOnFirstError) {
        break
      }
    }
  }

  return results
}

/**
 * 创建验证规则
 * 
 * @param type 验证类型
 * @param message 错误消息
 * @param params 验证参数
 * @param options 其他选项
 * @returns 验证规则
 */
export function createValidationRule(
  type: string,
  message?: string,
  params?: any,
  options?: Partial<ValidationRule>
): ValidationRule {
  return {
    type: type as any,
    message: message || VALIDATION_MESSAGES[type as keyof typeof VALIDATION_MESSAGES] || 'Validation failed',
    params,
    ...options,
  }
}

/**
 * 创建必填验证规则
 * 
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function required(message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('required', message, undefined, options)
}

/**
 * 创建正则表达式验证规则
 * 
 * @param pattern 正则表达式
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function pattern(pattern: RegExp, message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('pattern', message, pattern, options)
}

/**
 * 创建最小值验证规则
 * 
 * @param min 最小值
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function min(min: number, message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('min', message, min, options)
}

/**
 * 创建最大值验证规则
 * 
 * @param max 最大值
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function max(max: number, message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('max', message, max, options)
}

/**
 * 创建长度范围验证规则
 * 
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param options 其他选项
 * @returns 验证规则数组
 */
export function length(minLength: number, maxLength?: number, options?: Partial<ValidationRule>): ValidationRule[] {
  const rules: ValidationRule[] = []

  if (minLength > 0) {
    rules.push(createValidationRule('minLength', undefined, minLength, options))
  }

  if (maxLength !== undefined) {
    rules.push(createValidationRule('maxLength', undefined, maxLength, options))
  }

  return rules
}

/**
 * 创建邮箱验证规则
 * 
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function email(message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('email', message, undefined, options)
}

/**
 * 创建URL验证规则
 * 
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function url(message?: string, options?: Partial<ValidationRule>): ValidationRule {
  return createValidationRule('url', message, undefined, options)
}

/**
 * 创建自定义验证规则
 *
 * @param validator 验证器函数
 * @param message 错误消息
 * @param options 其他选项
 * @returns 验证规则
 */
export function createCustomRule(
  validator: ValidatorFunction,
  message = 'Validation failed',
  options?: Partial<ValidationRule>
): ValidationRule {
  return {
    type: 'custom',
    message,
    validator,
    ...options,
  }
}
