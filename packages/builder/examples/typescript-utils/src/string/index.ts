/**
 * 字符串工具模块
 * 导出所有字符串相关的工具函数
 */

// 导入格式化函数
import {
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  capitalizeWords,
  truncate,
  trim,
  pad
} from './format'

// 导入验证函数
import {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidIdCard,
  validatePassword,
  isNumeric,
  isAlpha,
  isAlphanumeric
} from './validate'

// 重新导出格式化函数
export {
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  capitalizeWords,
  truncate,
  trim,
  pad
}

// 重新导出验证函数
export {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidIdCard,
  validatePassword,
  isNumeric,
  isAlpha,
  isAlphanumeric
}

/**
 * 字符串工具类型定义
 */
export interface StringUtils {
  /** 格式化工具 */
  format: {
    toCamelCase: typeof toCamelCase
    toPascalCase: typeof toPascalCase
    toKebabCase: typeof toKebabCase
    toSnakeCase: typeof toSnakeCase
    capitalize: typeof capitalize
    capitalizeWords: typeof capitalizeWords
    truncate: typeof truncate
    trim: typeof trim
    pad: typeof pad
  }
  /** 验证工具 */
  validate: {
    isValidEmail: typeof isValidEmail
    isValidUrl: typeof isValidUrl
    isValidPhone: typeof isValidPhone
    isValidIdCard: typeof isValidIdCard
    validatePassword: typeof validatePassword
    isNumeric: typeof isNumeric
    isAlpha: typeof isAlpha
    isAlphanumeric: typeof isAlphanumeric
  }
}

/**
 * 密码验证选项类型
 */
export interface PasswordValidationOptions {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
}

/**
 * 密码验证结果类型
 */
export interface PasswordValidationResult {
  strength: 'weak' | 'medium' | 'strong'
  isValid: boolean
  score: number
  issues: string[]
}
