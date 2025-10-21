/**
 * @ldesign/form - Built-in Validation Rules
 * 内置验证规则
 */

import type { ValidatorFunction, ValidationResult } from './types'
import { isEmpty, isString, isNumber, isArray } from './helpers/type'

/**
 * 必填验证
 */
export const required: ValidatorFunction = (value): ValidationResult => {
  const valid = !isEmpty(value)
  return {
    valid,
    message: valid ? '' : '此字段为必填项'
  }
}

/**
 * 邮箱验证
 */
export const email: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true, message: '' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const valid = emailRegex.test(String(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的邮箱地址'
  }
}

/**
 * URL 验证
 */
export const url: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  try {
    new URL(String(value))
    return { valid: true }
  } catch {
    return {
      valid: false,
      message: '请输入有效的URL地址'
    }
  }
}

/**
 * 手机号验证（中国大陆）
 */
export const phone: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  const valid = phoneRegex.test(String(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的手机号码'
  }
}

/**
 * 数字验证
 */
export const number: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const valid = isNumber(Number(value)) && !isNaN(Number(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的数字'
  }
}

/**
 * 整数验证
 */
export const integer: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const num = Number(value)
  const valid = isNumber(num) && Number.isInteger(num)

  return {
    valid,
    message: valid ? '' : '请输入有效的整数'
  }
}

/**
 * 最小值验证
 */
export function min(minValue: number, message?: string): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const num = Number(value)
    const valid = isNumber(num) && num >= minValue

    return {
      valid,
      message: valid ? '' : message || `值不能小于 ${minValue}`
    }
  }
}

/**
 * 最大值验证
 */
export function max(maxValue: number, message?: string): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const num = Number(value)
    const valid = isNumber(num) && num <= maxValue

    return {
      valid,
      message: valid ? '' : message || `值不能大于 ${maxValue}`
    }
  }
}

/**
 * 最小长度验证
 */
export function minLength(
  minLen: number,
  message?: string
): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    let length = 0

    if (isString(value)) {
      length = value.length
    } else if (isArray(value)) {
      length = value.length
    } else {
      length = String(value).length
    }

    const valid = length >= minLen

    return {
      valid,
      message: valid ? '' : message || `长度不能少于 ${minLen} 个字符`
    }
  }
}

/**
 * 最大长度验证
 */
export function maxLength(
  maxLen: number,
  message?: string
): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    let length = 0

    if (isString(value)) {
      length = value.length
    } else if (isArray(value)) {
      length = value.length
    } else {
      length = String(value).length
    }

    const valid = length <= maxLen

    return {
      valid,
      message: valid ? '' : message || `长度不能超过 ${maxLen} 个字符`
    }
  }
}

/**
 * 正则表达式验证
 */
export function pattern(regex: RegExp, message?: string): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const valid = regex.test(String(value))

    return {
      valid,
      message: valid ? '' : message || '格式不正确'
    }
  }
}

/**
 * 范围验证（数值）
 */
export function range(
  minValue: number,
  maxValue: number,
  message?: string
): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const num = Number(value)
    const valid = isNumber(num) && num >= minValue && num <= maxValue

    return {
      valid,
      message:
        valid ? '' : message || `值必须在 ${minValue} 到 ${maxValue} 之间`
    }
  }
}

/**
 * 确认密码验证（两个字段值相等）
 */
export function confirm(targetField: string, message?: string): ValidatorFunction {
  return (value, values): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const targetValue = values[targetField]
    const valid = value === targetValue

    return {
      valid,
      message: valid ? '' : message || '两次输入不一致'
    }
  }
}

/**
 * 自定义验证器
 */
export function custom(
  validator: (value: any, values: any) => boolean | ValidationResult | Promise<boolean | ValidationResult>,
  message?: string
): ValidatorFunction {
  return async (value, values): Promise<ValidationResult> => {
    const result = await validator(value, values)

    if (typeof result === 'boolean') {
      return {
        valid: result,
        message: result ? '' : message || '验证失败'
      }
    }

    return result
  }
}

/**
 * 身份证号验证（中国大陆）
 */
export const idCard: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  const valid = idCardRegex.test(String(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的身份证号码'
  }
}

/**
 * 信用卡验证（Luhn算法）
 */
export const creditCard: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const cardNumber = String(value).replace(/\s/g, '')

  if (!/^\d+$/.test(cardNumber)) {
    return { valid: false, message: '信用卡号只能包含数字' }
  }

  // Luhn algorithm
  let sum = 0
  let isEven = false
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    isEven = !isEven
  }

  const valid = sum % 10 === 0

  return {
    valid,
    message: valid ? '' : '请输入有效的信用卡号码'
  }
}

/**
 * IP地址验证（IPv4）
 */
export const ip: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const valid = ipRegex.test(String(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的IP地址'
  }
}

/**
 * 邮政编码验证（中国大陆）
 */
export const postalCode: ValidatorFunction = (value): ValidationResult => {
  if (isEmpty(value)) {
    return { valid: true }
  }

  const postalCodeRegex = /^[1-9]\d{5}$/
  const valid = postalCodeRegex.test(String(value))

  return {
    valid,
    message: valid ? '' : '请输入有效的邮政编码'
  }
}

/**
 * 文件类型验证
 */
export function fileType(types: string[], message?: string): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    // 支持 File 对象或文件名字符串
    let fileName: string
    if (value instanceof File) {
      fileName = value.name
    } else {
      fileName = String(value)
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const valid = types.map(t => t.toLowerCase()).includes(ext)

    return {
      valid,
      message: valid ? '' : message || `文件类型必须是: ${types.join(', ')}`
    }
  }
}

/**
 * 文件大小验证（单位：字节）
 */
export function fileSize(maxSize: number, message?: string): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    // 支持 File 对象
    if (value instanceof File) {
      const valid = value.size <= maxSize
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)

      return {
        valid,
        message: valid ? '' : message || `文件大小不能超过 ${maxSizeMB}MB`
      }
    }

    return { valid: true }
  }
}

/**
 * 密码强度验证
 */
export function passwordStrength(
  level: 'weak' | 'medium' | 'strong',
  message?: string
): ValidatorFunction {
  return (value): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const password = String(value)
    let valid = false

    switch (level) {
      case 'weak':
        // 至少6个字符
        valid = password.length >= 6
        break
      case 'medium':
        // 至少8个字符，包含数字和字母
        valid = password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
        break
      case 'strong':
        // 至少8个字符，包含大小写字母、数字和特殊字符
        valid =
          password.length >= 8 &&
          /[a-z]/.test(password) &&
          /[A-Z]/.test(password) &&
          /\d/.test(password) &&
          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        break
    }

    const defaultMessages = {
      weak: '密码至少需要6个字符',
      medium: '密码至少需要8个字符，且包含数字和字母',
      strong: '密码至少需要8个字符，且包含大小写字母、数字和特殊字符'
    }

    return {
      valid,
      message: valid ? '' : message || defaultMessages[level]
    }
  }
}

/**
 * 跨字段比较验证
 */
export function compareWith(
  field: string,
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne',
  message?: string
): ValidatorFunction {
  return (value, values): ValidationResult => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    const compareValue = values[field]
    if (isEmpty(compareValue)) {
      return { valid: true }
    }

    const val = Number(value)
    const compareVal = Number(compareValue)

    let valid = false
    let defaultMessage = ''

    switch (operator) {
      case 'gt':
        valid = val > compareVal
        defaultMessage = `必须大于${field}`
        break
      case 'gte':
        valid = val >= compareVal
        defaultMessage = `必须大于或等于${field}`
        break
      case 'lt':
        valid = val < compareVal
        defaultMessage = `必须小于${field}`
        break
      case 'lte':
        valid = val <= compareVal
        defaultMessage = `必须小于或等于${field}`
        break
      case 'eq':
        valid = val === compareVal
        defaultMessage = `必须等于${field}`
        break
      case 'ne':
        valid = val !== compareVal
        defaultMessage = `不能等于${field}`
        break
    }

    return {
      valid,
      message: valid ? '' : message || defaultMessage
    }
  }
}

/**
 * 异步唯一性验证
 */
export function uniqueUsername(
  checkAPI: (username: string) => Promise<boolean>,
  message?: string
): ValidatorFunction {
  return async (value): Promise<ValidationResult> => {
    if (isEmpty(value)) {
      return { valid: true }
    }

    try {
      const isUnique = await checkAPI(String(value))
      return {
        valid: isUnique,
        message: isUnique ? '' : message || '该用户名已被使用'
      }
    } catch (error) {
      return {
        valid: false,
        message: '验证失败，请稍后重试'
      }
    }
  }
}

/**
 * 所有内置验证规则
 */
export const builtinValidators = {
  required,
  email,
  url,
  phone,
  number,
  integer,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  range,
  confirm,
  custom,
  idCard,
  creditCard,
  ip,
  postalCode,
  fileType,
  fileSize,
  passwordStrength,
  compareWith,
  uniqueUsername
}



