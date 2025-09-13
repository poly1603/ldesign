/**
 * 类型安全工具函数
 * 
 * 提供类型安全的工具函数，减少 any 类型的使用
 */

import type { EventHandler, EventManager, EventMap } from '../types'
import type { ConfigManager } from '../types'
import type { Plugin, PluginManager, PluginContext } from '../types'
import type { Engine } from '../types'

/**
 * 类型安全的事件发射器
 */
export function typedEmit<TEventMap extends EventMap, K extends keyof TEventMap>(
  eventManager: EventManager<TEventMap>,
  event: K,
  data: TEventMap[K]
): void {
  eventManager.emit(event, data)
}

/**
 * 类型安全的事件监听器注册
 */
export function typedOn<TEventMap extends EventMap, K extends keyof TEventMap>(
  eventManager: EventManager<TEventMap>,
  event: K,
  handler: (data: TEventMap[K]) => void,
  priority?: number
): void {
  eventManager.on(event, handler as EventHandler, priority)
}

/**
 * 类型安全的一次性事件监听器注册
 */
export function typedOnce<TEventMap extends EventMap, K extends keyof TEventMap>(
  eventManager: EventManager<TEventMap>,
  event: K,
  handler: (data: TEventMap[K]) => void,
  priority?: number
): void {
  eventManager.once(event, handler as EventHandler, priority)
}

/**
 * 类型安全的配置访问器
 */
export function getTypedConfig<T>(
  config: ConfigManager,
  path: string,
  defaultValue: T
): T {
  const value = config.get(path, defaultValue)
  return value as T
}

/**
 * 类型安全的配置设置器
 */
export function setTypedConfig<T>(
  config: ConfigManager,
  path: string,
  value: T
): void {
  config.set(path, value)
}

/**
 * 创建类型安全的插件上下文
 */
export function createTypedPluginContext<T extends Engine>(engine: T): PluginContext<T> {
  return {
    engine,
    logger: engine.logger,
    config: engine.config,
    events: engine.events,
  }
}

/**
 * 类型安全的插件注册
 */
export async function registerTypedPlugin<T extends Engine>(
  pluginManager: PluginManager,
  plugin: Plugin,
  context?: PluginContext<T>
): Promise<void> {
  await pluginManager.register(plugin)
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
  return typeof value === 'number' && !isNaN(value)
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
export function isFunction(value: unknown): value is Function {
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
  return value instanceof Promise
}

/**
 * 类型安全的深度克隆
 */
export function safeDeepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => safeDeepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as Record<string, unknown>
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = safeDeepClone(obj[key])
      }
    }
    return cloned as T
  }

  return obj
}

/**
 * 类型安全的对象合并
 */
export function safeMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...target }
  
  for (const source of sources) {
    if (isValidObject(source)) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const value = source[key]
          if (value !== undefined) {
            result[key] = value as T[Extract<keyof T, string>]
          }
        }
      }
    }
  }
  
  return result
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
    if (!isValidObject(current) || !(key in current)) {
      return defaultValue
    }
    current = current[key]
  }

  return current as T
}

/**
 * 类型安全的数组过滤
 */
export function safeFilter<T, U extends T>(
  array: T[],
  predicate: (item: T) => item is U
): U[]
export function safeFilter<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[]
export function safeFilter<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  if (!isArray(array)) {
    return []
  }
  
  return array.filter(predicate)
}

/**
 * 类型安全的数组映射
 */
export function safeMap<T, U>(
  array: T[],
  mapper: (item: T, index: number) => U
): U[] {
  if (!isArray(array)) {
    return []
  }
  
  return array.map(mapper)
}

/**
 * 类型安全的异步操作包装
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
    return fallback
  }
}

/**
 * 类型安全的JSON解析
 */
export function safeJsonParse<T = unknown>(
  json: string,
  defaultValue?: T
): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

/**
 * 类型安全的JSON序列化
 */
export function safeJsonStringify(
  value: unknown,
  space?: number
): string | undefined {
  try {
    return JSON.stringify(value, null, space)
  } catch {
    return undefined
  }
}

/**
 * 输入验证工具类
 */
export class InputValidator {
  /**
   * 验证非空字符串
   */
  static validateNonEmptyString(
    value: unknown,
    paramName: string
  ): asserts value is string {
    if (!isString(value) || value.trim() === '') {
      throw new Error(`Parameter "${paramName}" must be a non-empty string`)
    }
  }

  /**
   * 验证数字范围
   */
  static validateNumberInRange(
    value: unknown,
    paramName: string,
    min?: number,
    max?: number
  ): asserts value is number {
    if (!isNumber(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid number`)
    }

    if (min !== undefined && value < min) {
      throw new Error(`Parameter "${paramName}" must be greater than or equal to ${min}`)
    }

    if (max !== undefined && value > max) {
      throw new Error(`Parameter "${paramName}" must be less than or equal to ${max}`)
    }
  }

  /**
   * 验证对象
   */
  static validateObject(
    value: unknown,
    paramName: string
  ): asserts value is Record<string, unknown> {
    if (!isValidObject(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid object`)
    }
  }

  /**
   * 验证数组
   */
  static validateArray(
    value: unknown,
    paramName: string
  ): asserts value is unknown[] {
    if (!isArray(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid array`)
    }
  }

  /**
   * 验证函数
   */
  static validateFunction(
    value: unknown,
    paramName: string
  ): asserts value is Function {
    if (!isFunction(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid function`)
    }
  }

  /**
   * 验证枚举值
   */
  static validateEnum<T extends string | number>(
    value: unknown,
    paramName: string,
    validValues: readonly T[]
  ): asserts value is T {
    if (!validValues.includes(value as T)) {
      throw new Error(
        `Parameter "${paramName}" must be one of: ${validValues.join(', ')}`
      )
    }
  }
}

/**
 * 错误处理工具类
 */
export class ErrorUtil {
  /**
   * 统一格式化错误信息
   */
  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`
    } else if (isString(error)) {
      return error
    } else {
      const jsonStr = safeJsonStringify(error)
      return jsonStr || String(error)
    }
  }

  /**
   * 创建带上下文的错误
   */
  static createContextError(
    message: string,
    context?: Record<string, unknown>
  ): Error {
    const error = new Error(message)
    if (context && isValidObject(context)) {
      Object.assign(error, { context })
    }
    return error
  }

  /**
   * 安全执行函数，自动捕获异常
   */
  static async safeExecute<T>(
    fn: () => Promise<T> | T,
    errorHandler?: (error: Error) => void
  ): Promise<T | undefined> {
    try {
      return await fn()
    } catch (error) {
      const formattedError = error instanceof Error 
        ? error 
        : new Error(this.formatError(error))
      
      if (errorHandler) {
        errorHandler(formattedError)
      }
      return undefined
    }
  }

  /**
   * 安全执行事件监听器
   */
  static safeEventHandler(
    handler: EventHandler,
    logger?: { error: (message: string, error: unknown) => void }
  ): EventHandler {
    return (data: unknown) => {
      try {
        handler(data)
      } catch (error) {
        const message = `Error in event handler: ${this.formatError(error)}`
        if (logger) {
          logger.error(message, error)
        } else {
          console.error(message, error)
        }
      }
    }
  }
}

/**
 * 类型安全的配置管理器包装
 */
export class TypedConfigWrapper {
  constructor(private configManager: ConfigManager) {}

  /**
   * 类型安全的配置获取
   */
  get<T>(path: string, defaultValue: T): T {
    const value = this.configManager.get(path, defaultValue)
    return value as T
  }

  /**
   * 类型安全的配置设置
   */
  set<T>(path: string, value: T): void {
    this.configManager.set(path, value)
  }

  /**
   * 类型安全的配置合并
   */
  merge(config: Record<string, unknown>): void {
    InputValidator.validateObject(config, 'config')
    this.configManager.merge(config)
  }

  /**
   * 安全获取嵌套配置
   */
  getNested<T>(path: string, defaultValue?: T): T | undefined {
    try {
      const value = this.configManager.get(path, defaultValue)
      return value as T
    } catch {
      return defaultValue
    }
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
}
