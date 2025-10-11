/**
 * 验证工具函数
 *
 * 提供语言代码、翻译键、翻译参数等验证功能
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import { StringUtils, TypeGuards } from './common'

/**
 * 语言代码正则表达式
 * 支持 ISO 639-1 (两位) 和 BCP 47 格式
 */
const LANGUAGE_CODE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/

/**
 * 翻译键正则表达式
 * 支持点分隔的嵌套键，允许字母、数字、下划线、连字符
 */
const TRANSLATION_KEY_REGEX = /^[\w-]+(\.[\w-]+)*$/

/**
 * 统一验证工具类
 */
export class ValidationUtils {
  /**
   * 验证必需参数
   */
  static validateRequired<T>(value: T, name: string): T {
    if (value === null || value === undefined) {
      throw new Error(`${name} is required`)
    }
    return value
  }

  /**
   * 验证字符串参数
   */
  static validateString(value: unknown, name: string, allowEmpty = false): string {
    if (!TypeGuards.isString(value)) {
      throw new TypeError(`${name} must be a string`)
    }
    if (!allowEmpty && StringUtils.isBlank(value)) {
      throw new Error(`${name} cannot be empty`)
    }
    return value
  }

  /**
   * 验证对象参数
   */
  static validateObject(value: unknown, name: string): Record<string, unknown> {
    if (!TypeGuards.isObject(value)) {
      throw new TypeError(`${name} must be an object`)
    }
    return value
  }

  /**
   * 验证数组参数
   */
  static validateArray(value: unknown, name: string): unknown[] {
    if (!TypeGuards.isArray(value)) {
      throw new TypeError(`${name} must be an array`)
    }
    return value
  }

  /**
   * 验证函数参数
   */
  static validateFunction(value: unknown, name: string): Function {
    if (!TypeGuards.isFunction(value)) {
      throw new TypeError(`${name} must be a function`)
    }
    return value
  }

  /**
   * 验证枚举值
   */
  static validateEnum<T extends string | number>(
    value: unknown,
    enumValues: T[],
    name: string,
  ): T {
    if (!enumValues.includes(value as T)) {
      throw new Error(`${name} must be one of: ${enumValues.join(', ')}`)
    }
    return value as T
  }

  /**
   * 验证范围
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    name: string,
  ): number {
    if (value < min || value > max) {
      throw new Error(`${name} must be between ${min} and ${max}`)
    }
    return value
  }
}

/**
 * 验证语言代码
 *
 * @param languageCode 语言代码
 * @returns 是否有效
 *
 * @example
 * ```typescript
 * validateLanguageCode('zh-CN') // true
 * validateLanguageCode('en') // true
 * validateLanguageCode('invalid') // false
 * ```
 */
export function validateLanguageCode(languageCode: string): boolean {
  if (!TypeGuards.isNonEmptyString(languageCode)) {
    return false
  }

  return LANGUAGE_CODE_REGEX.test(languageCode)
}

/**
 * 验证翻译键
 *
 * @param key 翻译键
 * @returns 是否有效
 *
 * @example
 * ```typescript
 * validateTranslationKey('common.ok') // true
 * validateTranslationKey('user.profile.name') // true
 * validateTranslationKey('invalid..key') // false
 * ```
 */
export function validateTranslationKey(key: string): boolean {
  if (typeof key !== 'string') {
    return false
  }

  if (key.length === 0) {
    return false
  }

  // 不能以点开头或结尾
  if (key.startsWith('.') || key.endsWith('.')) {
    return false
  }

  // 不能包含连续的点
  if (key.includes('..')) {
    return false
  }

  return TRANSLATION_KEY_REGEX.test(key)
}

/**
 * 验证翻译参数
 *
 * @param params 翻译参数
 * @returns 是否有效
 *
 * @example
 * ```typescript
 * validateTranslationParams({ name: 'John', age: 25 }) // true
 * validateTranslationParams({ name: 'John', nested: { value: 1 } }) // false
 * ```
 */
export function validateTranslationParams(params: any): boolean {
  if (params === null || params === undefined) {
    return true
  }

  if (typeof params !== 'object') {
    return false
  }

  if (Array.isArray(params)) {
    return false
  }

  // 检查所有值是否为基本类型
  for (const [key, value] of Object.entries(params)) {
    // 键必须是有效的标识符
    if (!/^[a-z_$][\w$]*$/i.test(key)) {
      return false
    }

    // 值必须是基本类型
    const valueType = typeof value
    if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
      return false
    }
  }

  return true
}

/**
 * 验证语言环境
 *
 * @param locale 语言环境字符串
 * @returns 是否有效
 *
 * @example
 * ```typescript
 * isValidLocale('zh-CN') // true
 * isValidLocale('en-US') // true
 * isValidLocale('invalid-locale') // false
 * ```
 */
export function isValidLocale(locale: string): boolean {
  if (!validateLanguageCode(locale)) {
    return false
  }

  try {
    // 使用 Intl.Locale 验证
    new Intl.Locale(locale)
    return true
  }
  catch {
    return false
  }
}

/**
 * 验证翻译消息对象
 *
 * @param messages 翻译消息对象
 * @returns 验证结果
 *
 * @example
 * ```typescript
 * const result = validateMessages({
 *   'zh-CN': { hello: '你好' },
 *   'en': { hello: 'Hello' }
 * })
 * ```
 */
export function validateMessages(messages: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!messages || typeof messages !== 'object') {
    errors.push('Messages must be an object')
    return { valid: false, errors }
  }

  if (Array.isArray(messages)) {
    errors.push('Messages cannot be an array')
    return { valid: false, errors }
  }

  // 验证每个语言的消息
  for (const [locale, localeMessages] of Object.entries(messages)) {
    // 验证语言代码
    if (!validateLanguageCode(locale)) {
      errors.push(`Invalid language code: ${locale}`)
      continue
    }

    // 验证消息对象
    if (!localeMessages || typeof localeMessages !== 'object') {
      errors.push(`Messages for locale "${locale}" must be an object`)
      continue
    }

    if (Array.isArray(localeMessages)) {
      errors.push(`Messages for locale "${locale}" cannot be an array`)
      continue
    }

    // 验证消息键和值
    const validateMessageObject = (obj: any, path = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key

        // 验证键
        if (!/^[\w-]+$/.test(key)) {
          errors.push(`Invalid message key "${fullPath}" in locale "${locale}"`)
          continue
        }

        // 验证值
        if (typeof value === 'string') {
          // 字符串值是有效的
          continue
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          // 递归验证嵌套对象
          validateMessageObject(value, fullPath)
        }
        else {
          errors.push(`Invalid message value for key "${fullPath}" in locale "${locale}". Must be string or object.`)
        }
      }
    }

    validateMessageObject(localeMessages)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证 I18n 配置选项
 *
 * @param options I18n 配置选项
 * @returns 验证结果
 */
export function validateI18nOptions(options: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!options || typeof options !== 'object') {
    errors.push('Options must be an object')
    return { valid: false, errors }
  }

  // 验证 locale
  if (options.locale !== undefined) {
    if (typeof options.locale !== 'string') {
      errors.push('locale must be a string')
    }
    else if (!validateLanguageCode(options.locale)) {
      errors.push(`Invalid locale: ${options.locale}`)
    }
  }

  // 验证 fallbackLocale
  if (options.fallbackLocale !== undefined) {
    if (typeof options.fallbackLocale !== 'string') {
      errors.push('fallbackLocale must be a string')
    }
    else if (!validateLanguageCode(options.fallbackLocale)) {
      errors.push(`Invalid fallbackLocale: ${options.fallbackLocale}`)
    }
  }

  // 验证 messages
  if (options.messages !== undefined) {
    const messageValidation = validateMessages(options.messages)
    if (!messageValidation.valid) {
      errors.push(...messageValidation.errors)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 标准化语言代码
 *
 * @param languageCode 语言代码
 * @returns 标准化后的语言代码
 *
 * @example
 * ```typescript
 * normalizeLanguageCode('zh_CN') // 'zh-CN'
 * normalizeLanguageCode('EN') // 'en'
 * ```
 */
export function normalizeLanguageCode(languageCode: string): string {
  if (typeof languageCode !== 'string') {
    return languageCode
  }

  // 替换下划线为连字符
  const normalized = languageCode.replace('_', '-')

  // 分割语言和地区
  const parts = normalized.split('-')

  if (parts.length === 1) {
    // 只有语言代码，转为小写
    return parts[0].toLowerCase()
  }
  else if (parts.length === 2) {
    // 语言代码转小写，地区代码转大写
    return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`
  }

  // 其他情况直接返回
  return normalized
}

/**
 * 检查是否为有效的插值表达式
 *
 * @param expression 插值表达式
 * @returns 是否有效
 *
 * @example
 * ```typescript
 * isValidInterpolation('{name}') // true
 * isValidInterpolation('{user.name}') // true
 * isValidInterpolation('{invalid..key}') // false
 * ```
 */
export function isValidInterpolation(expression: string): boolean {
  if (typeof expression !== 'string') {
    return false
  }

  // 匹配 {key} 格式
  const match = expression.match(/^\{([^}]+)\}$/)
  if (!match) {
    return false
  }

  const key = match[1]

  // 验证键格式
  return /^[a-z_$][\w$]*(\.[a-z_$][\w$]*)*$/i.test(key)
}

/**
 * 默认导出
 */
export default {
  validateLanguageCode,
  validateTranslationKey,
  validateTranslationParams,
  isValidLocale,
  validateMessages,
  validateI18nOptions,
  normalizeLanguageCode,
  isValidInterpolation,
}
