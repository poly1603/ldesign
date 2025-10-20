/**
 * 验证和错误处理工具
 * 提供输入验证、类型检查、错误处理等功能
 */

/**
 * 验证规则类型
 */
export interface ValidationRule<T = any> {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => boolean | string
  message?: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证器类
 */
export class Validator {
  /**
   * 验证单个值
   */
  static validate<T>(value: T, rules: ValidationRule<T>): ValidationResult {
    const errors: string[] = []

    // Required 检查
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push(rules.message || 'Value is required')
      return { valid: false, errors }
    }

    // 如果值为空且非必需，跳过其他验证
    if (value === null || value === undefined) {
      return { valid: true, errors: [] }
    }

    // 类型检查
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== rules.type) {
        errors.push(
          rules.message || `Expected type ${rules.type}, got ${actualType}`
        )
      }
    }

    // 数字范围检查
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(
          rules.message || `Value must be at least ${rules.min}`
        )
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(
          rules.message || `Value must be at most ${rules.max}`
        )
      }
    }

    // 字符串长度和模式检查
    if (typeof value === 'string') {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push(
          rules.message || `Length must be at least ${rules.min}`
        )
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push(
          rules.message || `Length must be at most ${rules.max}`
        )
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(
          rules.message || `Value does not match required pattern`
        )
      }
    }

    // 数组长度检查
    if (Array.isArray(value)) {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push(
          rules.message || `Array length must be at least ${rules.min}`
        )
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push(
          rules.message || `Array length must be at most ${rules.max}`
        )
      }
    }

    // 自定义验证
    if (rules.custom) {
      const result = rules.custom(value)
      if (result === false) {
        errors.push(rules.message || 'Custom validation failed')
      } else if (typeof result === 'string') {
        errors.push(result)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 验证对象
   */
  static validateObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, ValidationRule>
  ): ValidationResult {
    const errors: string[] = []

    for (const key in schema) {
      const value = obj[key]
      const rules = schema[key]
      const result = this.validate(value, rules)
      
      if (!result.valid) {
        errors.push(...result.errors.map(err => `${String(key)}: ${err}`))
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 断言验证（验证失败抛出异常）
   */
  static assert<T>(
    value: T,
    rules: ValidationRule<T>,
    errorPrefix = 'Validation failed'
  ): void {
    const result = this.validate(value, rules)
    if (!result.valid) {
      throw new ValidationError(
        `${errorPrefix}: ${result.errors.join(', ')}`
      )
    }
  }

  /**
   * 断言对象验证
   */
  static assertObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, ValidationRule>,
    errorPrefix = 'Object validation failed'
  ): void {
    const result = this.validateObject(obj, schema)
    if (!result.valid) {
      throw new ValidationError(
        `${errorPrefix}: ${result.errors.join(', ')}`
      )
    }
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Store 配置验证器
 */
export class StoreConfigValidator {
  /**
   * 验证 Store ID
   */
  static validateStoreId(id: string): void {
    Validator.assert(id, {
      required: true,
      type: 'string',
      min: 1,
      max: 100,
      pattern: /^[a-z][\w-]*$/i,
      message: 'Store ID must be a valid identifier (alphanumeric, -, _)',
    }, 'Invalid Store ID')
  }

  /**
   * 验证缓存配置
   */
  static validateCacheOptions(options: any): void {
    if (options.maxSize !== undefined) {
      Validator.assert(options.maxSize, {
        type: 'number',
        min: 1,
        max: 100000,
        message: 'maxSize must be between 1 and 100000',
      }, 'Invalid cache config')
    }

    if (options.defaultTTL !== undefined) {
      Validator.assert(options.defaultTTL, {
        type: 'number',
        min: 0,
        message: 'defaultTTL must be a positive number',
      }, 'Invalid cache config')
    }
  }

  /**
   * 验证持久化配置
   */
  static validatePersistOptions(options: any): void {
    if (options.key !== undefined) {
      Validator.assert(options.key, {
        type: 'string',
        min: 1,
        max: 200,
        message: 'Persist key must be between 1 and 200 characters',
      }, 'Invalid persist config')
    }

    if (options.paths !== undefined) {
      Validator.assert(options.paths, {
        type: 'array',
        message: 'paths must be an array',
      }, 'Invalid persist config')
    }
  }
}

/**
 * 类型守卫工具
 */
export class TypeGuards {
  /**
   * 检查是否为对象
   */
  static isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  /**
   * 检查是否为普通对象
   */
  static isPlainObject(value: any): value is Record<string, any> {
    if (!this.isObject(value)) return false
    const proto = Object.getPrototypeOf(value)
    return proto === null || proto === Object.prototype
  }

  /**
   * 检查是否为空对象
   */
  static isEmptyObject(value: any): boolean {
    return this.isObject(value) && Object.keys(value).length === 0
  }

  /**
   * 检查是否为 Promise
   */
  static isPromise(value: any): value is Promise<any> {
    return value instanceof Promise || (
      value !== null &&
      typeof value === 'object' &&
      typeof value.then === 'function'
    )
  }

  /**
   * 检查是否为函数
   */
  static isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === 'function'
  }

  /**
   * 检查是否为异步函数
   */
  static isAsyncFunction(value: any): boolean {
    return this.isFunction(value) && value.constructor.name === 'AsyncFunction'
  }

  /**
   * 检查是否为字符串
   */
  static isString(value: any): value is string {
    return typeof value === 'string'
  }

  /**
   * 检查是否为非空字符串
   */
  static isNonEmptyString(value: any): value is string {
    return this.isString(value) && value.trim().length > 0
  }

  /**
   * 检查是否为数字
   */
  static isNumber(value: any): value is number {
    return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  }

  /**
   * 检查是否为正整数
   */
  static isPositiveInteger(value: any): value is number {
    return this.isNumber(value) && value > 0 && Number.isInteger(value)
  }

  /**
   * 检查是否为布尔值
   */
  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean'
  }

  /**
   * 检查是否为数组
   */
  static isArray<T = any>(value: any): value is T[] {
    return Array.isArray(value)
  }

  /**
   * 检查是否为非空数组
   */
  static isNonEmptyArray<T = any>(value: any): value is T[] {
    return this.isArray(value) && value.length > 0
  }

  /**
   * 检查是否为 null 或 undefined
   */
  static isNullOrUndefined(value: any): value is null | undefined {
    return value === null || value === undefined
  }

  /**
   * 检查是否为有效值（非 null/undefined）
   */
  static isValidValue<T>(value: T | null | undefined): value is T {
    return !this.isNullOrUndefined(value)
  }
}

/**
 * 断言工具
 */
export class Assert {
  /**
   * 断言条件为真
   */
  static isTrue(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言条件为假
   */
  static isFalse(condition: boolean, message: string): asserts condition is false {
    if (condition) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值已定义
   */
  static isDefined<T>(
    value: T | null | undefined,
    message = 'Value must be defined'
  ): asserts value is T {
    if (TypeGuards.isNullOrUndefined(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值为对象
   */
  static isObject(
    value: any,
    message = 'Value must be an object'
  ): asserts value is Record<string, any> {
    if (!TypeGuards.isObject(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值为数组
   */
  static isArray<T = any>(
    value: any,
    message = 'Value must be an array'
  ): asserts value is T[] {
    if (!TypeGuards.isArray(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值为函数
   */
  static isFunction(
    value: any,
    message = 'Value must be a function'
  ): asserts value is (...args: any[]) => any {
    if (!TypeGuards.isFunction(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值为字符串
   */
  static isString(
    value: any,
    message = 'Value must be a string'
  ): asserts value is string {
    if (!TypeGuards.isString(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值为数字
   */
  static isNumber(
    value: any,
    message = 'Value must be a number'
  ): asserts value is number {
    if (!TypeGuards.isNumber(value)) {
      throw new AssertionError(message)
    }
  }

  /**
   * 断言值在范围内
   */
  static inRange(
    value: number,
    min: number,
    max: number,
    message?: string
  ): void {
    if (value < min || value > max) {
      throw new AssertionError(
        message || `Value must be between ${min} and ${max}`
      )
    }
  }

  /**
   * 断言数组非空
   */
  static notEmpty<T>(
    array: T[],
    message = 'Array must not be empty'
  ): asserts array is [T, ...T[]] {
    if (!TypeGuards.isNonEmptyArray(array)) {
      throw new AssertionError(message)
    }
  }
}

/**
 * 断言错误类
 */
export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private static handlers = new Map<string, (error: Error) => void>()

  /**
   * 注册错误处理器
   */
  static register(type: string, handler: (error: Error) => void): void {
    this.handlers.set(type, handler)
  }

  /**
   * 处理错误
   */
  static handle(error: Error, type = 'default'): void {
    const handler = this.handlers.get(type) || this.handlers.get('default')
    
    if (handler) {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    } else {
      console.error(`Unhandled error (${type}):`, error)
    }
  }

  /**
   * 包装异步函数，自动处理错误
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorType = 'default'
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handle(error as Error, errorType)
        throw error
      }
    }) as T
  }

  /**
   * 安全执行（捕获并处理错误）
   */
  static async safeExecute<T>(
    fn: () => Promise<T> | T,
    errorType = 'default'
  ): Promise<T | null> {
    try {
      return await fn()
    } catch (error) {
      this.handle(error as Error, errorType)
      return null
    }
  }

  /**
   * 清除所有处理器
   */
  static clear(): void {
    this.handlers.clear()
  }
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse<T = any>(
  json: string,
  defaultValue?: T
): T | null {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue !== undefined ? defaultValue : null
  }
}

/**
 * 安全地序列化为 JSON
 */
export function safeJsonStringify(
  value: any,
  space?: number
): string | null {
  try {
    return JSON.stringify(value, null, space)
  } catch {
    return null
  }
}
