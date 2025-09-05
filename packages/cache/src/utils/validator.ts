/**
 * 数据验证工具类
 * 
 * 提供统一的数据验证功能，用于验证缓存操作的输入参数
 */

import type { SetOptions, StorageEngine } from '../types'

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * 验证规则接口
 */
export interface ValidationRule<T = any> {
  /** 验证函数 */
  validate: (value: T) => boolean
  /** 错误消息 */
  message: string
}

/**
 * 数据验证器类
 */
export class Validator {
  /**
   * 验证缓存键
   * 
   * @param key - 缓存键
   * @throws {ValidationError} 当键无效时抛出错误
   * 
   * @example
   * ```typescript
   * Validator.validateKey('user:123') // 通过
   * Validator.validateKey('') // 抛出错误
   * ```
   */
  static validateKey(key: unknown): asserts key is string {
    if (typeof key !== 'string') {
      throw new ValidationError('Cache key must be a string', 'key')
    }
    
    if (key.trim() === '') {
      throw new ValidationError('Cache key cannot be empty', 'key')
    }
    
    if (key.length > 250) {
      throw new ValidationError('Cache key is too long (maximum 250 characters)', 'key')
    }

    // 检查是否包含控制字符（使用 Unicode 属性）
    if (/\p{Cc}/u.test(key)) {
      throw new ValidationError('Cache key contains invalid control characters', 'key')
    }
  }

  /**
   * 验证缓存值
   * 
   * @param value - 缓存值
   * @throws {ValidationError} 当值无效时抛出错误
   */
  static validateValue(value: unknown): void {
    if (value === undefined) {
      throw new ValidationError('Cache value cannot be undefined', 'value')
    }

    // 检查是否可序列化
    try {
      JSON.stringify(value)
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('circular')) {
        // 循环引用会在序列化时处理，这里只是警告
        console.warn('Cache value contains circular references, will be simplified during serialization')
      }
      else {
        throw new ValidationError('Cache value is not serializable', 'value')
      }
    }
  }

  /**
   * 验证TTL值
   * 
   * @param ttl - 生存时间
   * @throws {ValidationError} 当TTL无效时抛出错误
   */
  static validateTTL(ttl: unknown): asserts ttl is number {
    if (ttl !== undefined) {
      if (typeof ttl !== 'number') {
        throw new ValidationError('TTL must be a number', 'ttl')
      }
      
      if (!Number.isFinite(ttl)) {
        throw new ValidationError('TTL must be a finite number', 'ttl')
      }
      
      if (ttl < 0) {
        throw new ValidationError('TTL must be non-negative', 'ttl')
      }
      
      if (ttl > 0 && ttl < 1000) {
        console.warn('TTL is less than 1 second, this may cause frequent cache misses')
      }

      // 检查是否过大（超过1年）
      const oneYear = 365 * 24 * 60 * 60 * 1000
      if (ttl > oneYear) {
        console.warn('TTL is greater than 1 year, consider using persistent storage')
      }
    }
  }

  /**
   * 验证存储引擎
   * 
   * @param engine - 存储引擎名称
   * @throws {ValidationError} 当引擎无效时抛出错误
   */
  static validateEngine(engine: unknown): asserts engine is StorageEngine {
    if (engine !== undefined) {
      const validEngines: StorageEngine[] = ['localStorage', 'sessionStorage', 'cookie', 'indexedDB', 'memory']
      
      if (typeof engine !== 'string' || !validEngines.includes(engine as StorageEngine)) {
        throw new ValidationError(
          `Invalid storage engine. Must be one of: ${validEngines.join(', ')}`,
          'engine',
        )
      }
    }
  }

  /**
   * 验证设置选项
   * 
   * @param options - 设置选项
   * @throws {ValidationError} 当选项无效时抛出错误
   */
  static validateSetOptions(options: unknown): asserts options is SetOptions | undefined {
    if (options !== undefined) {
      if (typeof options !== 'object' || options === null) {
        throw new ValidationError('Options must be an object', 'options')
      }

      const opts = options as Record<string, unknown>

      // 验证TTL
      if ('ttl' in opts) {
        this.validateTTL(opts.ttl)
      }

      // 验证引擎
      if ('engine' in opts) {
        this.validateEngine(opts.engine)
      }

      // 验证加密选项
      if ('encrypt' in opts && typeof opts.encrypt !== 'boolean') {
        throw new ValidationError('Encrypt option must be a boolean', 'options.encrypt')
      }

      // 验证键名混淆选项
      if ('obfuscateKey' in opts && typeof opts.obfuscateKey !== 'boolean') {
        throw new ValidationError('ObfuscateKey option must be a boolean', 'options.obfuscateKey')
      }
    }
  }

  /**
   * 验证缓存设置的完整输入
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param options - 设置选项
   * @throws {ValidationError} 当任何参数无效时抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   Validator.validateSetInput('user:123', userData, { ttl: 3600000 })
   *   // 验证通过，可以安全地设置缓存
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error(`Validation failed for ${error.field}: ${error.message}`)
   *   }
   * }
   * ```
   */
  static validateSetInput<T>(key: unknown, value: T, options?: unknown): void {
    this.validateKey(key)
    this.validateValue(value)
    this.validateSetOptions(options)
  }

  /**
   * 创建自定义验证规则
   * 
   * @param rules - 验证规则数组
   * @returns 验证函数
   */
  static createValidator<T>(rules: ValidationRule<T>[]) {
    return (value: T, fieldName?: string): void => {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          throw new ValidationError(rule.message, fieldName)
        }
      }
    }
  }

  /**
   * 常用验证规则
   */
  static readonly rules = {
    /** 非空字符串 */
    nonEmptyString: {
      validate: (value: unknown): value is string => 
        typeof value === 'string' && value.trim().length > 0,
      message: 'Value must be a non-empty string',
    },

    /** 正整数 */
    positiveInteger: {
      validate: (value: unknown): value is number => 
        typeof value === 'number' && Number.isInteger(value) && value > 0,
      message: 'Value must be a positive integer',
    },

    /** 非负数 */
    nonNegativeNumber: {
      validate: (value: unknown): value is number => 
        typeof value === 'number' && Number.isFinite(value) && value >= 0,
      message: 'Value must be a non-negative number',
    },

    /** 布尔值 */
    boolean: {
      validate: (value: unknown): value is boolean => typeof value === 'boolean',
      message: 'Value must be a boolean',
    },

    /** 对象 */
    object: {
      validate: (value: unknown): value is object => 
        typeof value === 'object' && value !== null,
      message: 'Value must be an object',
    },

    /** 数组 */
    array: {
      validate: (value: unknown): value is unknown[] => Array.isArray(value),
      message: 'Value must be an array',
    },
  }

  /**
   * 批量验证
   * 
   * @param validations - 验证配置数组
   * @throws {ValidationError} 当任何验证失败时抛出错误
   */
  static validateBatch(validations: Array<{
    value: unknown
    rules: ValidationRule[]
    fieldName?: string
  }>): void {
    for (const { value, rules, fieldName } of validations) {
      const validator = this.createValidator(rules)
      validator(value, fieldName)
    }
  }
}

/**
 * 快捷验证函数
 */
export const validateKey = Validator.validateKey
export const validateValue = Validator.validateValue
export const validateTTL = Validator.validateTTL
export const validateEngine = Validator.validateEngine
export const validateSetOptions = Validator.validateSetOptions
export const validateSetInput = Validator.validateSetInput
