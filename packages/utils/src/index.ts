/**
 * @ldesign/utils - 通用工具函数库
 *
 * 特性：
 * - 类型安全的工具函数
 * - 高性能实现
 * - 树摇优化支持
 * - 完整的单元测试
 * - TypeScript 完整类型支持
 * - 零依赖核心函数
 */

// 对象工具
export * from './object/clone'
export * from './object/merge'
export * from './object/pick'
export * from './object/omit'
export * from './object/get'
export * from './object/set'
export * from './object/has'
export * from './object/isEmpty'
export * from './object/isEqual'
export * from './object/transform'

// 数组工具
export * from './array/chunk'
export * from './array/flatten'
export * from './array/unique'
export * from './array/groupBy'
export * from './array/sortBy'
export * from './array/shuffle'
export * from './array/sample'
export * from './array/difference'
export * from './array/intersection'
export * from './array/union'

// 字符串工具
export * from './string/camelCase'
export * from './string/kebabCase'
export * from './string/snakeCase'
export * from './string/pascalCase'
export * from './string/capitalize'
export * from './string/truncate'
export * from './string/escape'
export * from './string/template'
export * from './string/slugify'
export * from './string/uuid'

// 数字工具
export * from './number/clamp'
export * from './number/random'
export * from './number/round'
export * from './number/format'
export * from './number/range'
export * from './number/sum'
export * from './number/average'
export * from './number/percentage'
export * from './number/currency'
export * from './number/fileSize'

// 日期工具
export * from './date/format'
export * from './date/parse'
export * from './date/add'
export * from './date/subtract'
export * from './date/diff'
export * from './date/isValid'
export * from './date/isBefore'
export * from './date/isAfter'
export * from './date/startOf'
export * from './date/endOf'

// 函数工具
export * from './function/debounce'
export * from './function/throttle'
export * from './function/once'
export * from './function/memoize'
export * from './function/curry'
export * from './function/compose'
export * from './function/pipe'
export * from './function/partial'
export * from './function/delay'
export * from './function/retry'

// 类型检查工具
export * from './type/isString'
export * from './type/isNumber'
export * from './type/isBoolean'
export * from './type/isArray'
export * from './type/isObject'
export * from './type/isFunction'
export * from './type/isDate'
export * from './type/isRegExp'
export * from './type/isNull'
export * from './type/isUndefined'
export * from './type/isNil'
export * from './type/isPrimitive'
export * from './type/getType'

// 验证工具
export * from './validate/email'
export * from './validate/phone'
export * from './validate/url'
export * from './validate/ip'
export * from './validate/creditCard'
export * from './validate/idCard'
export * from './validate/password'
export * from './validate/required'
export * from './validate/length'
export * from './validate/pattern'

// DOM工具
export * from './dom/addClass'
export * from './dom/removeClass'
export * from './dom/hasClass'
export * from './dom/toggleClass'
export * from './dom/getStyle'
export * from './dom/setStyle'
export * from './dom/getRect'
export * from './dom/isVisible'
export * from './dom/scrollTo'
export * from './dom/getScrollTop'

// 浏览器工具
export * from './browser/userAgent'
export * from './browser/device'
export * from './browser/storage'
export * from './browser/cookie'
export * from './browser/url'
export * from './browser/download'
export * from './browser/copy'
export * from './browser/fullscreen'
export * from './browser/notification'
export * from './browser/geolocation'

// 性能工具
export * from './performance/measure'
export * from './performance/fps'
export * from './performance/memory'
export * from './performance/timing'
export * from './performance/observer'
export * from './performance/benchmark'
export * from './performance/cache'
export * from './performance/lazy'
export * from './performance/worker'
export * from './performance/raf'

// 异步工具
export * from './async/sleep'
export * from './async/timeout'
export * from './async/queue'
export * from './async/parallel'
export * from './async/series'
export * from './async/waterfall'
export * from './async/race'
export * from './async/allSettled'
export * from './async/retry'
export * from './async/cancel'

// 事件工具
export * from './event/emitter'
export * from './event/listener'
export * from './event/delegate'
export * from './event/once'
export * from './event/off'
export * from './event/trigger'
export * from './event/prevent'
export * from './event/stop'
export * from './event/key'
export * from './event/mouse'

// 数学工具
export * from './math/lerp'
export * from './math/normalize'
export * from './math/map'
export * from './math/distance'
export * from './math/angle'
export * from './math/vector'
export * from './math/matrix'
export * from './math/bezier'
export * from './math/easing'
export * from './math/random'

// 颜色工具
export * from './color/hex'
export * from './color/rgb'
export * from './color/hsl'
export * from './color/hsv'
export * from './color/convert'
export * from './color/mix'
export * from './color/lighten'
export * from './color/darken'
export * from './color/contrast'
export * from './color/palette'

// 加密工具
export * from './crypto/hash'
export * from './crypto/base64'
export * from './crypto/encrypt'
export * from './crypto/decrypt'
export * from './crypto/random'
export * from './crypto/uuid'
export * from './crypto/token'
export * from './crypto/signature'
export * from './crypto/checksum'
export * from './crypto/password'

// 网络工具
export * from './network/request'
export * from './network/upload'
export * from './network/download'
export * from './network/websocket'
export * from './network/sse'
export * from './network/retry'
export * from './network/cache'
export * from './network/mock'
export * from './network/interceptor'
export * from './network/timeout'

// 类型定义导出
export type {
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  Nullable,
  Optional,
  Primitive,
  NonPrimitive,
  AnyFunction,
  AnyObject,
  KeyOf,
  ValueOf,
  PickByType,
  OmitByType
} from './types/utility'

export type {
  EventHandler,
  EventMap,
  Listener,
  Emitter
} from './types/event'

export type {
  ValidatorFunction,
  ValidationResult,
  ValidationRule,
  ValidationSchema
} from './types/validation'

export type {
  CacheOptions,
  CacheItem,
  CacheStore
} from './types/cache'

export type {
  RequestConfig,
  ResponseData,
  RequestInterceptor,
  ResponseInterceptor
} from './types/network'

/**
 * 常用工具函数集合
 */
export const utils = {
  // 对象操作
  clone: (obj: any) => JSON.parse(JSON.stringify(obj)),
  merge: (target: any, ...sources: any[]) => Object.assign(target, ...sources),
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj } as any
    keys.forEach(key => {
      delete result[key]
    })
    return result
  },

  // 数组操作
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },
  unique: <T>(array: T[]): T[] => [...new Set(array)],
  flatten: <T>(array: (T | T[])[]): T[] => array.flat() as T[],
  shuffle: <T>(array: T[]): T[] => {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  },

  // 字符串操作
  camelCase: (str: string): string => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
  },
  kebabCase: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  },
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    return str.length > length ? str.slice(0, length) + suffix : str
  },

  // 数字操作
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },
  random: (min: number, max: number): number => {
    return Math.random() * (max - min) + min
  },
  round: (value: number, precision: number = 0): number => {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
  },

  // 类型检查
  isString: (value: any): value is string => typeof value === 'string',
  isNumber: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',
  isArray: (value: any): value is any[] => Array.isArray(value),
  isObject: (value: any): value is object => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  },
  isFunction: (value: any): value is Function => typeof value === 'function',
  isNull: (value: any): value is null => value === null,
  isUndefined: (value: any): value is undefined => value === undefined,
  isNil: (value: any): value is null | undefined => value == null,

  // 函数工具
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let lastTime = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastTime >= wait) {
        lastTime = now
        func(...args)
      }
    }
  },
  once: <T extends (...args: any[]) => any>(func: T): T => {
    let called = false
    let result: ReturnType<T>
    return ((...args: Parameters<T>) => {
      if (!called) {
        called = true
        result = func(...args)
      }
      return result
    }) as T
  },

  // 异步工具
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms)
      })
    ])
  },

  // UUID生成
  uuid: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  // 日期格式化
  formatDate: (date: Date, format: string = 'YYYY-MM-DD'): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  // 文件大小格式化
  formatFileSize: (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

// 默认导出
export default utils