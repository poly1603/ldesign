/**
 * 内置验证规则
 * 
 * 提供常用的验证规则实现，包括：
 * - 基础验证（必填、长度、范围等）
 * - 格式验证（邮箱、URL、手机号等）
 * - 数值验证（数字、整数、浮点数等）
 * - 自定义验证规则
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { isEmpty } from './helpers'
import type { ValidationContext, ValidationResult, ValidatorFunction } from '../types'

/**
 * 验证消息模板
 */
export const VALIDATION_MESSAGES = {
  required: '此字段为必填项',
  email: '请输入有效的邮箱地址',
  url: '请输入有效的URL地址',
  phone: '请输入有效的手机号码',
  pattern: '格式不正确',
  minLength: '长度不能少于 {min} 个字符',
  maxLength: '长度不能超过 {max} 个字符',
  min: '值不能小于 {min}',
  max: '值不能大于 {max}',
  integer: '请输入整数',
  number: '请输入数字',
  positive: '请输入正数',
  negative: '请输入负数',
  range: '值必须在 {min} 到 {max} 之间',
  enum: '请选择有效的选项',
  custom: '验证失败'
}

/**
 * 格式化验证消息
 * 
 * @param template 消息模板
 * @param params 参数对象
 * @returns 格式化后的消息
 */
function formatMessage(template: string, params: Record<string, any> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * 必填验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function required(message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    const isValid = !isEmpty(value)
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.required),
      field: undefined
    }
  }
}

/**
 * 邮箱验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function email(message?: string): ValidatorFunction {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const isValid = emailRegex.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.email),
      field: undefined
    }
  }
}

/**
 * URL验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function url(message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    try {
      new URL(String(value))
      return { valid: true, message: '', field: undefined }
    } catch {
      return {
        valid: false,
        message: message || VALIDATION_MESSAGES.url,
        field: undefined
      }
    }
  }
}

/**
 * 手机号验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function phone(message?: string): ValidatorFunction {
  const phoneRegex = /^1[3-9]\d{9}$/

  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const isValid = phoneRegex.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.phone),
      field: undefined
    }
  }
}

/**
 * 正则表达式验证器
 * 
 * @param pattern 正则表达式
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function pattern(pattern: RegExp, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const isValid = pattern.test(String(value))
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.pattern),
      field: undefined
    }
  }
}

/**
 * 最小长度验证器
 * 
 * @param min 最小长度
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function minLength(min: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const length = String(value).length
    const isValid = length >= min
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.minLength, { min })),
      field: undefined
    }
  }
}

/**
 * 最大长度验证器
 * 
 * @param max 最大长度
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function maxLength(max: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const length = String(value).length
    const isValid = length <= max
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.maxLength, { max })),
      field: undefined
    }
  }
}

/**
 * 长度范围验证器
 * 
 * @param min 最小长度
 * @param max 最大长度
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function length(min: number, max: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const length = String(value).length
    const isValid = length >= min && length <= max
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.range, { min, max })),
      field: undefined
    }
  }
}

/**
 * 最小值验证器
 * 
 * @param min 最小值
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function min(min: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    if (isNaN(num)) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES.number,
        field: undefined
      }
    }

    const isValid = num >= min
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.min, { min })),
      field: undefined
    }
  }
}

/**
 * 最大值验证器
 * 
 * @param max 最大值
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function max(max: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    if (isNaN(num)) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES.number,
        field: undefined
      }
    }

    const isValid = num <= max
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.max, { max })),
      field: undefined
    }
  }
}

/**
 * 数值范围验证器
 * 
 * @param min 最小值
 * @param max 最大值
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function range(min: number, max: number, message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    if (isNaN(num)) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES.number,
        field: undefined
      }
    }

    const isValid = num >= min && num <= max
    return {
      valid: isValid,
      message: isValid ? '' : (message || formatMessage(VALIDATION_MESSAGES.range, { min, max })),
      field: undefined
    }
  }
}

/**
 * 整数验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function integer(message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    const isValid = !isNaN(num) && Number.isInteger(num)
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.integer),
      field: undefined
    }
  }
}

/**
 * 数字验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function number(message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    const isValid = !isNaN(num) && isFinite(num)
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.number),
      field: undefined
    }
  }
}

/**
 * 正数验证器
 * 
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function positive(message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const num = Number(value)
    const isValid = !isNaN(num) && num > 0
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.positive),
      field: undefined
    }
  }
}

/**
 * 枚举验证器
 * 
 * @param values 允许的值列表
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function enumValidator(values: any[], message?: string): ValidatorFunction {
  return ({ value }: ValidationContext): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true, message: '', field: undefined }
    }

    const isValid = values.includes(value)
    return {
      valid: isValid,
      message: isValid ? '' : (message || VALIDATION_MESSAGES.enum),
      field: undefined
    }
  }
}

/**
 * 自定义验证器
 * 
 * @param validator 自定义验证函数
 * @param message 自定义错误消息
 * @returns 验证器函数
 */
export function custom(
  validator: (value: any, context: ValidationContext) => boolean | string | Promise<boolean | string>,
  message?: string
): ValidatorFunction {
  return async (context: ValidationContext): Promise<ValidationResult> => {
    try {
      const result = await validator(context.value, context)

      if (typeof result === 'boolean') {
        return {
          valid: result,
          message: result ? '' : (message || VALIDATION_MESSAGES.custom),
          field: undefined
        }
      }

      if (typeof result === 'string') {
        return {
          valid: false,
          message: result,
          field: undefined
        }
      }

      return {
        valid: false,
        message: message || VALIDATION_MESSAGES.custom,
        field: undefined
      }
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : (message || VALIDATION_MESSAGES.custom),
        field: undefined
      }
    }
  }
}

/**
 * 内置验证器映射
 */
export const BUILTIN_VALIDATORS: Record<string, ValidatorFunction> = {
  required: required(),
  email: email(),
  url: url(),
  phone: phone(),
  integer: integer(),
  number: number(),
  positive: positive()
}
