/**
 * 高级工具函数集合
 * 🚀 提供更多实用的工具函数，增强开发体验
 */

/**
 * 智能重试函数（带指数退避）
 * 🔄 自动重试失败的异步操作，支持自定义重试策略
 * 
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => fetchAPI('/api/data'),
 *   {
 *     maxAttempts: 5,
 *     initialDelay: 1000,
 *     maxDelay: 30000,
 *     backoffFactor: 2,
 *     shouldRetry: (error) => error.message.includes('network')
 *   }
 * )
 * ```
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxAttempts?: number
  /** 初始延迟时间（毫秒） */
  initialDelay?: number
  /** 最大延迟时间（毫秒） */
  maxDelay?: number
  /** 退避因子（每次重试延迟乘以此因子） */
  backoffFactor?: number
  /** 判断是否应该重试的函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean
  /** 重试前的回调函数 */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry = () => true,
    onRetry,
  } = options

  let lastError: Error
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // 最后一次尝试或不应该重试
      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError
      }

      // 触发重试回调
      if (onRetry) {
        onRetry(lastError, attempt, delay)
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // 计算下次延迟（指数退避）
      delay = Math.min(delay * backoffFactor, maxDelay)
      
      // 添加抖动（jitter）避免雷鸣羊群效应
      delay = delay * (0.5 + Math.random() * 0.5)
    }
  }

  throw lastError!
}

/**
 * 函数式编程工具集
 * 🎯 提供常用的函数式编程工具
 */
export const fp = {
  /**
   * 管道函数 - 从左到右组合函数
   * @example pipe(add1, multiply2, subtract3)(5) // (5 + 1) * 2 - 3 = 9
   */
  pipe: <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value),

  /**
   * 组合函数 - 从右到左组合函数
   * @example compose(subtract3, multiply2, add1)(5) // ((5 + 1) * 2) - 3 = 9
   */
  compose: <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value),

  /**
   * 柯里化函数
   * @example
   * const add = (a, b, c) => a + b + c
   * const curriedAdd = curry(add)
   * curriedAdd(1)(2)(3) // 6
   * curriedAdd(1, 2)(3) // 6
   * curriedAdd(1)(2, 3) // 6
   */
  curry: <T extends any[], R>(fn: (...args: T) => R) => {
    const curried = (...args: any[]): any => {
      if (args.length >= fn.length) {
        return fn(...(args as T))
      }
      return (...nextArgs: any[]) => curried(...args, ...nextArgs)
    }
    return curried
  },

  /**
   * 记忆化函数 - 缓存函数结果
   * @example
   * const fibonacci = memoize((n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2))
   */
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map<string, ReturnType<T>>()
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)!
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  },

  /**
   * 偏函数应用
   * @example
   * const add = (a, b, c) => a + b + c
   * const add5 = partial(add, 5)
   * add5(3, 2) // 10
   */
  partial: <T extends any[], R>(fn: (...args: T) => R, ...partialArgs: any[]) =>
    (...remainingArgs: any[]): R =>
      fn(...([...partialArgs, ...remainingArgs] as T)),

  /**
   * 函数节点 - once执行
   * @example
   * const initialize = once(() => console.log('Initialized'))
   * initialize() // 打印 'Initialized'
   * initialize() // 什么都不做
   */
  once: <T extends (...args: any[]) => any>(fn: T): T => {
    let called = false
    let result: ReturnType<T>
    return ((...args: Parameters<T>) => {
      if (!called) {
        called = true
        result = fn(...args)
      }
      return result
    }) as T
  },
}

/**
 * 数据验证工具类
 * 🔍 提供常用的数据验证功能
 */
export class Validator {
  /**
   * 验证邮箱格式
   */
  static isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  /**
   * 验证URL格式
   */
  static isURL(value: string): boolean {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证手机号码（支持多地区）
   */
  static isPhoneNumber(value: string, region: 'CN' | 'US' | 'UK' = 'CN'): boolean {
    const patterns: Record<string, RegExp> = {
      CN: /^1[3-9]\d{9}$/,
      US: /^(\+1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
      UK: /^(\+44)?7\d{9}$/,
    }
    return patterns[region]?.test(value) ?? false
  }

  /**
   * 验证强密码（至少8位，包含大小写字母、数字和特殊字符）
   */
  static isStrongPassword(value: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
  }

  /**
   * 验证数字范围
   */
  static inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  /**
   * 验证字符串长度
   */
  static lengthInRange(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max
  }

  /**
   * 验证信用卡号（Luhn算法）
   */
  static isCreditCard(value: string): boolean {
    const sanitized = value.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(sanitized)) return false

    let sum = 0
    let isEven = false

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * 验证IPv4地址
   */
  static isIPv4(value: string): boolean {
    const parts = value.split('.')
    if (parts.length !== 4) return false

    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255 && part === String(num)
    })
  }

  /**
   * 验证IPv6地址
   */
  static isIPv6(value: string): boolean {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    return ipv6Regex.test(value)
  }

  /**
   * 验证JSON字符串
   */
  static isJSON(value: string): boolean {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证十六进制颜色值
   */
  static isHexColor(value: string): boolean {
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
  }
}

/**
 * 性能监控装饰器
 * ⚡ 自动监控方法执行性能
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @measurePerformance
 *   async fetchData() {
 *     // ...
 *   }
 * }
 * ```
 */
export function measurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = performance.now()
    const label = `${target.constructor.name}.${propertyKey}`

    try {
      const result = await originalMethod.apply(this, args)
      const duration = performance.now() - start

      // 开发环境下输出性能日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
      }

      // 如果性能超过阈值，发出警告
      if (duration > 1000) {
        console.warn(`[Performance Warning] ${label} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`[Performance Error] ${label} failed after ${duration.toFixed(2)}ms`)
      throw error
    }
  }

  return descriptor
}

/**
 * 缓存装饰器
 * 💾 自动缓存方法结果
 * 
 * @example
 * ```typescript
 * class DataService {
 *   @cached(5000) // 缓存5秒
 *   async getData(id: string) {
 *     return await fetchData(id)
 *   }
 * }
 * ```
 */
export function cached(ttl = 60000) {
  const cache = new Map<string, { value: any; expiry: number }>()

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = JSON.stringify(args)
      const now = Date.now()
      const cached = cache.get(key)

      if (cached && cached.expiry > now) {
        return cached.value
      }

      const result = await originalMethod.apply(this, args)
      cache.set(key, { value: result, expiry: now + ttl })

      return result
    }

    return descriptor
  }
}

/**
 * 异步队列
 * 🎯 控制异步操作的并发数
 * 
 * @example
 * ```typescript
 * const queue = new AsyncQueue(3) // 最多3个并发
 * 
 * const results = await Promise.all([
 *   queue.add(() => fetchData(1)),
 *   queue.add(() => fetchData(2)),
 *   queue.add(() => fetchData(3)),
 *   queue.add(() => fetchData(4)), // 等待前面的完成
 * ])
 * ```
 */
export class AsyncQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0

  constructor(private concurrency = 5) {}

  async add<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.concurrency) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    this.running++
    try {
      return await fn()
    } finally {
      this.running--
    }
  }

  get pending(): number {
    return this.queue.length
  }

  get active(): number {
    return this.running
  }
}

/**
 * 事件发射器（类型安全版本）
 * 📡 提供类型安全的事件发射和监听
 * 
 * @example
 * ```typescript
 * interface Events {
 *   'user:login': { userId: string; timestamp: number }
 *   'user:logout': { userId: string }
 * }
 * 
 * const emitter = new TypedEventEmitter<Events>()
 * 
 * emitter.on('user:login', (data) => {
 *   console.log(data.userId) // 类型安全！
 * })
 * 
 * emitter.emit('user:login', { userId: '123', timestamp: Date.now() })
 * ```
 */
export class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>()

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    // 返回取消订阅函数
    return () => this.off(event, handler)
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    const wrapper = (data: T[K]) => {
      handler(data)
      this.off(event, wrapper)
    }
    return this.on(event, wrapper)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

/**
 * 延迟加载类
 * 💤 延迟初始化重量级资源
 * 
 * @example
 * ```typescript
 * const heavyResource = new Lazy(() => createHeavyResource())
 * 
 * // 只在需要时才初始化
 * const resource = heavyResource.value
 * ```
 */
export class Lazy<T> {
  private _value?: T
  private _initialized = false

  constructor(private factory: () => T) {}

  get value(): T {
    if (!this._initialized) {
      this._value = this.factory()
      this._initialized = true
    }
    return this._value!
  }

  get isInitialized(): boolean {
    return this._initialized
  }

  reset(): void {
    this._value = undefined
    this._initialized = false
  }
}

/**
 * 时间格式化工具
 * 🕐 提供灵活的时间格式化功能
 */
export class TimeFormatter {
  /**
   * 格式化为相对时间
   * @example '3分钟前', '2小时前', '昨天', '3天前'
   */
  static relative(date: Date | number, locale = 'zh-CN'): string {
    const now = Date.now()
    const then = typeof date === 'number' ? date : date.getTime()
    const diff = now - then

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (diff < minute) return rtf.format(Math.floor(-diff / 1000), 'second')
    if (diff < hour) return rtf.format(Math.floor(-diff / minute), 'minute')
    if (diff < day) return rtf.format(Math.floor(-diff / hour), 'hour')
    if (diff < week) return rtf.format(Math.floor(-diff / day), 'day')
    if (diff < month) return rtf.format(Math.floor(-diff / week), 'week')
    if (diff < year) return rtf.format(Math.floor(-diff / month), 'month')
    return rtf.format(Math.floor(-diff / year), 'year')
  }

  /**
   * 格式化为友好的日期时间
   */
  static friendly(date: Date | number, locale = 'zh-CN'): string {
    const d = typeof date === 'number' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  /**
   * 格式化持续时间
   * @example '1小时30分钟', '5分30秒'
   */
  static duration(ms: number, locale = 'zh-CN'): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}天${hours % 24}小时`
    }
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    }
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`
    }
    return `${seconds}秒`
  }
}

/**
 * 颜色工具类
 * 🎨 提供颜色格式转换和操作
 */
export class ColorUtils {
  /**
   * 十六进制转RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  /**
   * RGB转十六进制
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 调整颜色亮度
   */
  static adjustBrightness(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex)
    if (!rgb) return hex

    const adjust = (value: number) =>
      Math.min(255, Math.max(0, Math.round(value * (1 + percent / 100))))

    return this.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
  }

  /**
   * 混合两种颜色
   */
  static mix(color1: string, color2: string, weight = 0.5): string {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    if (!rgb1 || !rgb2) return color1

    const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight)
    const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight)
    const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight)

    return this.rgbToHex(r, g, b)
  }
}
