/**
 * 统一工具库入口
 * 
 * 整合所有工具函数，提供统一的导出接口
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

// 导出通用工具 - 避免重复导出
export {
  StringUtils,
  ArrayUtils,
  ObjectUtils,
  TimeUtils,
  CacheKeyUtils,
  ErrorUtils,
  TypeGuards,
} from './common'

// 导出缓存操作
export * from './cache-operations'

// 导出错误处理
export * from './error-handling'

// 导出格式化工具
export * from './formatters'

// 导出插值工具
export * from './interpolation'

// 导出对象池
export * from './object-pool'

// 导出路径工具
export * from './path'

// 导出性能优化工具
export * from './performance-optimizations'

// 导出复数处理
export * from './pluralization'

// 导出验证工具
export * from './validation'


// 统一的工具集合类
export class UnifiedUtils {
  // 性能测量工具
  static measurePerformance<T>(
    name: string,
    fn: () => T
  ): { result: T; duration: number } {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    return { result, duration }
  }

  // 异步性能测量
  static async measurePerformanceAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    return { result, duration }
  }

  // 安全的JSON解析
  static safeJsonParse<T>(json: string, defaultValue?: T): T | undefined {
    try {
      return JSON.parse(json)
    } catch {
      return defaultValue
    }
  }

  // 安全的JSON字符串化
  static safeJsonStringify(value: any, space?: string | number): string | undefined {
    try {
      return JSON.stringify(value, null, space)
    } catch {
      return undefined
    }
  }

  // 生成唯一ID
  static generateId(prefix = ''): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 9)
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
  }

  // 深度冻结对象
  static deepFreeze<T>(obj: T): Readonly<T> {
    Object.freeze(obj)
    
    if (obj !== null && typeof obj === 'object') {
      Object.values(obj).forEach(value => {
        if ((typeof value === 'object' || typeof value === 'function') && !Object.isFrozen(value)) {
          UnifiedUtils.deepFreeze(value)
        }
      })
    }
    
    return obj as Readonly<T>
  }

  // 深度比较
  static deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime()
    }
    
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
      return a === b
    }
    
    if (a === null || a === undefined || b === null || b === undefined) {
      return false
    }
    
    if (a.prototype !== b.prototype) return false
    
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    
    return keys.every(k => UnifiedUtils.deepEqual(a[k], b[k]))
  }

  // 函数组合
  static compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg)
  }

  // 管道函数
  static pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg)
  }

  // 柯里化
  static curry<T extends (...args: any[]) => any>(
    fn: T
  ): (...args: Parameters<T>) => ReturnType<T> | ((...args: any[]) => any) {
    return function curried(...args: any[]): any {
      if (args.length >= fn.length) {
        return fn(...args)
      }
      return (...nextArgs: any[]) => curried(...args, ...nextArgs)
    }
  }

  // 限制并发
  static async limitConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<void>[] = []
    
    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result)
      })
      
      executing.push(promise)
      
      if (executing.length >= limit) {
        await Promise.race(executing)
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        )
      }
    }
    
    await Promise.all(executing)
    return results
  }

  // 重试机制
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      delay?: number
      backoff?: number
      onRetry?: (attempt: number, error: Error) => void
    } = {}
  ): Promise<T> {
    const { maxAttempts = 3, delay = 1000, backoff = 2, onRetry } = options
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === maxAttempts) throw error
        
        const waitTime = delay * Math.pow(backoff, attempt - 1)
        if (onRetry) onRetry(attempt, error as Error)
        
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    throw new Error('Retry failed')
  }

  // 内存大小格式化
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // URL参数解析
  static parseQueryString(query: string): Record<string, string> {
    const params: Record<string, string> = {}
    const pairs = query.replace(/^\?/, '').split('&')
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=')
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
      }
    }
    
    return params
  }

  // 构建URL参数
  static buildQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  }
}

// 导出单例实例
export const utils = UnifiedUtils