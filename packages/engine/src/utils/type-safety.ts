/**
 * 类型安全工具函数
 *
 * 提供类型安全的工具函数，减少 any 类型的使用
 */

import type { ConfigManager } from '../types'

/**
 * 错误处理工具类
 */
export class ErrorUtil {
  /**
   * 安全地获取错误消息
   */
  static getMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return String(error)
  }

  /**
   * 安全地获取错误堆栈
   */
  static getStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack
    }
    return undefined
  }

  /**
   * 创建标准化的错误对象
   */
  static normalize(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(this.getMessage(error))
  }

  /**
   * 格式化错误 (测试期望的方法名)
   */
  static formatError(error: unknown): string {
    const message = this.getMessage(error)
    const stack = this.getStack(error)
    return stack ? `${message}\n${stack}` : message
  }

  /**
   * 创建类型化错误 (测试期望的方法名)
   */
  static createTypedError(type: string, message: string, details?: Record<string, unknown>): Error & { type: string; details?: Record<string, unknown> } {
    const error = new Error(message) as Error & { type: string; details?: Record<string, unknown> }
    error.name = 'TypedError'
    error.type = type
    if (details) {
      error.details = details
    }
    return error
  }

  /**
   * 安全地提取错误信息 (测试期望的方法名)
   */
  static safeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      return (error as any).message
    }
    if (error === null) {
      return 'Unknown error'
    }
    return String(error)
  }
}

/**
 * 安全的JSON字符串化函数
 */
export function safeJsonStringify(value: unknown, space?: string | number): { success: boolean; data?: string; error?: Error } {
  try {
    // 首先检查是否有循环引用
    const hasCircularRef = (() => {
      const seen = new WeakSet()
      const check = (obj: unknown): boolean => {
        if (obj && typeof obj === 'object') {
          if (seen.has(obj)) {
            return true
          }
          seen.add(obj)
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              if (check((obj as Record<string, unknown>)[key])) {
                return true
              }
            }
          }
        }
        return false
      }
      return check(value)
    })()

    if (hasCircularRef) {
      return { success: false, error: new Error('Converting circular structure to JSON') }
    }

    const result = JSON.stringify(value, null, space)
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * 类型守卫：检查是否为有效的对象
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 类型守卫：检查是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 类型守卫：检查是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 类型守卫：检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 类型守卫：检查是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * 类型守卫：检查是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 类型守卫：检查是否为Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (value !== null && typeof value === 'object' && typeof (value as any).then === 'function')
}

/**
 * 类型安全的深度克隆
 */
export function safeDeepClone<T>(obj: T, visited = new WeakSet()): { success: boolean; data?: T; error?: Error } {
  try {
    if (obj === null || typeof obj !== 'object') {
      return { success: true, data: obj }
    }

    // 检查循环引用
    if (visited.has(obj as object)) {
      return { success: false, error: new Error('Circular reference detected') }
    }

    visited.add(obj as object)

    if (obj instanceof Date) {
      return { success: true, data: new Date(obj.getTime()) as unknown as T }
    }

    if (Array.isArray(obj)) {
      const clonedArray: unknown[] = []
      for (const item of obj) {
        const result = safeDeepClone(item, visited)
        if (!result.success) {
          return result as { success: false; error: Error }
        }
        clonedArray.push(result.data)
      }
      return { success: true, data: clonedArray as unknown as T }
    }

    if (typeof obj === 'object') {
      const cloned = {} as Record<string, unknown>
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key]
          // 跳过函数、Symbol和undefined
          if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
            continue
          }
          const result = safeDeepClone(value, visited)
          if (!result.success) {
            return result as { success: false; error: Error }
          }
          cloned[key] = result.data
        }
      }
      return { success: true, data: cloned as T }
    }

    return { success: true, data: obj }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的对象合并
 */
export function safeMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): { success: boolean; data?: T; error?: Error } {
  try {
    if (!isValidObject(target)) {
      return { success: false, error: new Error('Target must be a valid object') }
    }

    const result = { ...target }

    for (const source of sources) {
      if (!isValidObject(source)) {
        return { success: false, error: new Error('Source must be a valid object') }
      }

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const value = source[key]
          if (value !== undefined) {
            // 深度合并对象
            if (isValidObject(value) && isValidObject(result[key])) {
              const mergeResult = safeMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>)
              if (mergeResult.success && mergeResult.data) {
                result[key] = mergeResult.data as T[Extract<keyof T, string>]
              }
            } else {
              result[key] = value as T[Extract<keyof T, string>]
            }
          }
        }
      }
    }

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的属性访问
 */
export function safeGet<T, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (!isValidObject(obj)) {
    return defaultValue
  }

  const value = obj[key as string]
  return value !== undefined ? (value as T[K]) : defaultValue
}

/**
 * 类型安全的深度属性访问
 */
export function safeGetNested<T>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!isValidObject(obj) || !isString(path)) {
    return defaultValue
  }

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue
    }

    // 处理数组索引
    if (isArray(current) && /^\d+$/.test(key)) {
      const index = Number.parseInt(key, 10)
      current = current[index]
    } else if (isValidObject(current) && key in current) {
      current = current[key]
    } else {
      return defaultValue
    }
  }

  return current as T
}

/**
 * 类型安全的数组过滤
 */
export function safeFilter<T>(
  array: T[],
  predicate: (item: T) => boolean
): { success: boolean; data: T[]; error?: Error } {
  try {
    if (!isArray(array)) {
      return { success: false, data: [], error: new Error('Input must be an array') }
    }

    const result = array.filter(predicate)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, data: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的数组映射
 */
export function safeMap<T, U>(
  array: T[],
  mapper: (item: T, index: number) => U
): { success: boolean; data: U[]; error?: Error } {
  try {
    if (!isArray(array)) {
      return { success: false, data: [], error: new Error('Input must be an array') }
    }

    const result = array.map(mapper)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, data: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的异步操作包装
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  timeoutMs?: number
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    let result: T

    if (timeoutMs) {
      result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
        )
      ])
    } else {
      result = await operation()
    }

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的JSON解析
 */
export function safeJsonParse<T = unknown>(
  json: string,
  defaultValue?: T
): { success: boolean; data?: T; error?: Error } {
  try {
    const result = JSON.parse(json) as T
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      data: defaultValue,
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * 类型安全的配置管理器包装
 */
export class TypedConfigWrapper {
  private config: Record<string, any>

  constructor(config: Record<string, any>) {
    this.config = { ...config }
  }

  /**
   * 类型安全的配置获取
   */
  get<T>(path: string, defaultValue?: T): T | undefined {
    return safeGetNested(this.config, path, defaultValue)
  }

  /**
   * 类型安全的配置设置
   */
  set<T>(path: string, value: T): void {
    const keys = path.split('.')
    let current = this.config

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 检查配置是否存在
   */
  has(path: string): boolean {
    const value = safeGetNested(this.config, path)
    return value !== undefined
  }

  /**
   * 删除配置
   */
  delete(path: string): boolean {
    const keys = path.split('.')
    let current = this.config

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        return false
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey in current) {
      delete current[lastKey]
      return true
    }
    return false
  }

  /**
   * 获取所有配置
   */
  getAll(): Record<string, any> {
    return { ...this.config }
  }
}

/**
 * 创建类型安全的配置管理器
 */
export function createTypedConfigManager(configManager: ConfigManager): TypedConfigWrapper {
  return new TypedConfigWrapper(configManager)
}

/**
 * 类型安全的Promise工具
 */
export class PromiseUtil {
  /**
   * 带超时的Promise
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      })
    ])
  }

  /**
   * 重试Promise
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  /**
   * 并行执行Promise并收集结果
   */
  static async allSettled<T>(
    promises: Promise<T>[]
  ): Promise<Array<{ success: true; value: T } | { success: false; error: Error }>> {
    const results = await Promise.allSettled(promises)

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return { success: true as const, value: result.value }
      } else {
        return {
          success: false as const,
          error: result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason))
        }
      }
    })
  }

  /**
   * Promise超时 (测试期望的方法名)
   */
  static timeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Promise timed out')), timeoutMs)
      )
    ])
  }

  /**
   * 类型化的Promise.allSettled (测试期望的方法名)
   */
  static async allSettledTyped<T>(promises: Promise<T>[]): Promise<{
    fulfilled: T[]
    rejected: Error[]
  }> {
    const results = await Promise.allSettled(promises)

    const fulfilled: T[] = []
    const rejected: Error[] = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        fulfilled.push(result.value)
      } else {
        rejected.push(result.reason instanceof Error ? result.reason : new Error(String(result.reason)))
      }
    }

    return { fulfilled, rejected }
  }
}

// 测试期望的函数

/**
 * 类型安全的事件发射
 */
export function typedEmit(emitter: Record<string, unknown>, eventName: string, data: unknown): { success: boolean; error?: Error } {
  try {
    if (!emitter || typeof emitter.emit !== 'function') {
      return { success: false, error: new Error('Invalid event emitter') }
    }
    if (typeof eventName !== 'string') {
      return { success: false, error: new Error('Event name must be a string') }
    }

    emitter.emit(eventName, data)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的事件发射器（测试期望的函数）
 */
export const typedEmit2 = typedEmit

/**
 * 类型安全的事件监听
 */
export function typedOn(emitter: Record<string, unknown>, eventName: string, handler: unknown): { success: boolean; unsubscribe?: () => void; error?: Error } {
  try {
    if (!emitter || typeof emitter.on !== 'function') {
      return { success: false, error: new Error('Invalid event emitter') }
    }
    if (typeof eventName !== 'string') {
      return { success: false, error: new Error('Event name must be a string') }
    }
    if (typeof handler !== 'function') {
      return { success: false, error: new Error('Handler must be a function') }
    }

    emitter.on(eventName, handler)

    const unsubscribe = () => {
      if (emitter && typeof emitter.off === 'function') {
        emitter.off(eventName, handler)
      } else if (emitter && typeof emitter.removeListener === 'function') {
        emitter.removeListener(eventName, handler)
      }
    }

    return { success: true, unsubscribe }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的配置获取
 */
export function getTypedConfig(configManager: Record<string, unknown>, path: string, defaultValue: unknown): { success: boolean; value?: unknown; error?: Error } {
  try {
    if (!configManager || typeof configManager.get !== 'function') {
      return { success: false, error: new Error('Invalid config manager') }
    }

    const value = configManager.get(path)
    if (value === undefined || value === null) {
      return { success: false, value: defaultValue, error: new Error('Config not found') }
    }

    // 简单的类型检查
    if (defaultValue !== undefined && typeof value !== typeof defaultValue) {
      return { success: false, value: defaultValue, error: new Error('Type validation failed') }
    }

    return { success: true, value }
  } catch (error) {
    return { success: false, value: defaultValue, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 类型安全的配置设置
 */
export function setTypedConfig(configManager: Record<string, unknown>, path: string, value: unknown): { success: boolean; error?: Error } {
  try {
    if (!configManager || typeof configManager.set !== 'function') {
      return { success: false, error: new Error('Invalid config manager') }
    }

    configManager.set(path, value)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * 输入验证器
 */
export class InputValidator {
  private rules: Map<string, Array<(value: unknown) => boolean | string>> = new Map()

  addRule(field: string, validator: (value: unknown) => boolean | string): void {
    if (!this.rules.has(field)) {
      this.rules.set(field, [])
    }
    this.rules.get(field)!.push(validator)
  }

  validate(data: Record<string, any>, schema?: Record<string, any>): { success: boolean; errors?: string[] } {
    const errors: string[] = []

    // 如果提供了schema，使用schema验证
    if (schema) {
      for (const field in schema) {
        const fieldSchema = schema[field]
        const value = data[field]

        // 检查必填字段
        if (fieldSchema.required && (value === undefined || value === null)) {
          errors.push(`${field} is required`)
          continue
        }

        // 检查类型
        if (value !== undefined && fieldSchema.type) {
          const expectedType = fieldSchema.type
          const actualType = typeof value

          if (expectedType === 'string' && actualType !== 'string') {
            errors.push(`${field} must be a string`)
          } else if (expectedType === 'number' && actualType !== 'number') {
            errors.push(`${field} must be a number`)
          } else if (expectedType === 'boolean' && actualType !== 'boolean') {
            errors.push(`${field} must be a boolean`)
          }
        }

        // 自定义验证器
        if (value !== undefined && fieldSchema.validator) {
          const result = fieldSchema.validator(value)
          if (result !== null && result !== true) {
            errors.push(typeof result === 'string' ? result : `Invalid value for ${field}`)
          }
        }
      }
    } else {
      // 使用预定义的规则
      for (const [field, validators] of this.rules.entries()) {
        const value = data[field]

        for (const validator of validators) {
          const result = validator(value)
          if (result !== true) {
            errors.push(typeof result === 'string' ? result : `Invalid value for ${field}`)
          }
        }
      }
    }

    return errors.length > 0 ? { success: false, errors } : { success: true }
  }
}
