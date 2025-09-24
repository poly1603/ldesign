/**
 * 通用工具函数
 * 
 * 提供项目中常用的工具函数，消除重复代码
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

/**
 * 类型检查工具
 */
export const TypeGuards = {
  /**
   * 检查是否为字符串
   */
  isString(value: unknown): value is string {
    return typeof value === 'string'
  },

  /**
   * 检查是否为非空字符串
   */
  isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0
  },

  /**
   * 检查是否为数字
   */
  isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value)
  },

  /**
   * 检查是否为对象
   */
  isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  },

  /**
   * 检查是否为数组
   */
  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value)
  },

  /**
   * 检查是否为函数
   */
  isFunction(value: unknown): value is Function {
    return typeof value === 'function'
  },

  /**
   * 检查是否为Promise
   */
  isPromise(value: unknown): value is Promise<unknown> {
    return value instanceof Promise || (
      value !== null &&
      typeof value === 'object' &&
      typeof (value as any).then === 'function'
    )
  }
}

/**
 * 数组工具
 */
export const ArrayUtils = {
  /**
   * 安全地移除数组中的元素
   */
  removeItem<T>(array: T[], item: T): boolean {
    const index = array.indexOf(item)
    if (index > -1) {
      array.splice(index, 1)
      return true
    }
    return false
  },

  /**
   * 去重数组
   */
  unique<T>(array: T[]): T[] {
    return [...new Set(array)]
  },

  /**
   * 分组数组
   */
  groupBy<T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<K, T[]>)
  },

  /**
   * 安全地获取数组的第一个元素
   */
  first<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[0] : undefined
  },

  /**
   * 安全地获取数组的最后一个元素
   */
  last<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[array.length - 1] : undefined
  }
}

/**
 * 对象工具
 */
export const ObjectUtils = {
  /**
   * 安全地获取对象属性
   */
  safeGet<T>(obj: Record<string, unknown>, key: string, defaultValue?: T): T | undefined {
    return obj.hasOwnProperty(key) ? obj[key] as T : defaultValue
  },

  /**
   * 检查对象是否为空
   */
  isEmpty(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0
  },

  /**
   * 深度克隆对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (obj instanceof Array) {
      return obj.map(item => ObjectUtils.deepClone(item)) as unknown as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as Record<string, unknown>
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = ObjectUtils.deepClone((obj as any)[key])
        }
      }
      return cloned as T
    }

    return obj
  },

  /**
   * 合并对象（浅合并）
   */
  merge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
    return Object.assign({}, target, ...sources)
  },

  /**
   * 获取对象的所有键
   */
  keys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
  }
}

/**
 * 字符串工具
 */
export const StringUtils = {
  /**
   * 首字母大写
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * 驼峰命名转换
   */
  camelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
  },

  /**
   * 短横线命名转换
   */
  kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  },

  /**
   * 截断字符串
   */
  truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) {
      return str
    }
    return str.slice(0, length - suffix.length) + suffix
  },

  /**
   * 检查字符串是否为空或只包含空白字符
   */
  isBlank(str: string): boolean {
    return str.trim().length === 0
  }
}

/**
 * 时间工具
 */
export const TimeUtils = {
  /**
   * 获取当前时间戳
   */
  now(): number {
    return Date.now()
  },

  /**
   * 格式化时间差
   */
  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    }
    if (ms < 3600000) {
      return `${(ms / 60000).toFixed(1)}m`
    }
    return `${(ms / 3600000).toFixed(1)}h`
  },

  /**
   * 检查时间戳是否过期
   */
  isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl
  },

  /**
   * 延迟执行
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 错误处理工具
 */
export const ErrorUtils = {
  /**
   * 安全地执行函数，捕获错误
   */
  safeExecute<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn()
    } catch (error) {
      console.warn('Safe execution failed:', error)
      return fallback
    }
  },

  /**
   * 安全地执行异步函数
   */
  async safeExecuteAsync<T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
    try {
      return await fn()
    } catch (error) {
      console.warn('Safe async execution failed:', error)
      return fallback
    }
  },

  /**
   * 创建错误消息
   */
  createErrorMessage(prefix: string, details: string): string {
    return `${prefix}: ${details}`
  },

  /**
   * 检查是否为错误对象
   */
  isError(value: unknown): value is Error {
    return value instanceof Error
  }
}

/**
 * 缓存键生成工具
 */
export const CacheKeyUtils = {
  /**
   * 生成翻译缓存键
   */
  translationKey(locale: string, key: string, params?: Record<string, unknown>): string {
    const paramsStr = params && Object.keys(params).length > 0 
      ? JSON.stringify(params) 
      : ''
    return `translation:${locale}:${key}:${paramsStr}`
  },

  /**
   * 生成语言包缓存键
   */
  packageKey(locale: string): string {
    return `package:${locale}`
  },

  /**
   * 生成通用缓存键
   */
  genericKey(prefix: string, ...parts: string[]): string {
    return [prefix, ...parts].join(':')
  }
}
