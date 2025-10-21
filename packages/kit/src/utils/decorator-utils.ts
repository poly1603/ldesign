/**
 * 装饰器工具类
 * 提供常用的方法装饰器
 * 
 * @example
 * ```typescript
 * import { memoize, debounce, throttle, retry } from '@ldesign/kit'
 * 
 * class MyService {
 *   @memoize()
 *   async fetchData(id: number) {
 *     return await api.get(`/data/${id}`)
 *   }
 * 
 *   @debounce(300)
 *   handleSearch(query: string) {
 *     // 处理搜索
 *   }
 * 
 *   @retry({ maxAttempts: 3 })
 *   async riskyOperation() {
 *     // 可能失败的操作
 *   }
 * }
 * ```
 */

/**
 * 缓存装饰器
 * 缓存方法的返回结果
 */
export function memoize(options: { ttl?: number; key?: (...args: any[]) => string } = {}): MethodDecorator {
  const { ttl, key: keyFn } = options
  const cache = new Map<string, { value: any; expiry: number }>()

  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args)
      const cached = cache.get(key)

      if (cached && (!ttl || cached.expiry > Date.now())) {
        return cached.value
      }

      const result = await originalMethod.apply(this, args)

      cache.set(key, {
        value: result,
        expiry: ttl ? Date.now() + ttl : Infinity,
      })

      return result
    }

    return descriptor
  }
}

/**
 * 防抖装饰器
 * 延迟执行方法，如果在等待期间再次调用则重置计时器
 */
export function debounce(wait: number): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const timeoutMap = new WeakMap<any, NodeJS.Timeout>()

    descriptor.value = function (...args: any[]) {
      const existingTimeout = timeoutMap.get(this)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const timeout = setTimeout(() => {
        originalMethod.apply(this, args)
      }, wait)

      timeoutMap.set(this, timeout)
    }

    return descriptor
  }
}

/**
 * 节流装饰器
 * 限制方法在指定时间内只能执行一次
 */
export function throttle(wait: number): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const lastCallMap = new WeakMap<any, number>()

    descriptor.value = function (...args: any[]) {
      const now = Date.now()
      const lastCall = lastCallMap.get(this) || 0

      if (now - lastCall >= wait) {
        lastCallMap.set(this, now)
        return originalMethod.apply(this, args)
      }
    }

    return descriptor
  }
}

/**
 * 重试装饰器
 * 失败时自动重试
 */
export function retry(options: {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
  onRetry?: (error: Error, attempt: number) => void
} = {}): MethodDecorator {
  const { maxAttempts = 3, delay = 1000, backoff = false, onRetry } = options

  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      let lastError: Error | undefined

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args)
        }
        catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          if (attempt < maxAttempts) {
            if (onRetry) {
              onRetry(lastError, attempt)
            }

            const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }

      throw lastError
    }

    return descriptor
  }
}

/**
 * 超时装饰器
 * 为方法添加超时控制
 */
export function timeout(ms: number, message = 'Operation timed out'): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return Promise.race([
        originalMethod.apply(this, args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(message)), ms),
        ),
      ])
    }

    return descriptor
  }
}

/**
 * 日志装饰器
 * 记录方法的调用和返回
 */
export function log(options: {
  level?: 'debug' | 'info' | 'warn' | 'error'
  logArgs?: boolean
  logResult?: boolean
  logError?: boolean
} = {}): MethodDecorator {
  const { level = 'info', logArgs = true, logResult = true, logError = true } = options

  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const methodName = String(propertyKey)

      if (logArgs) {
        console[level](`[${methodName}] Called with args:`, args)
      }

      try {
        const result = await originalMethod.apply(this, args)

        if (logResult) {
          console[level](`[${methodName}] Returned:`, result)
        }

        return result
      }
      catch (error) {
        if (logError) {
          console.error(`[${methodName}] Error:`, error)
        }
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 性能监控装饰器
 * 监控方法执行时间
 */
export function measure(options: {
  label?: string
  logThreshold?: number
  onComplete?: (duration: number) => void
} = {}): MethodDecorator {
  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const { label = String(propertyKey), logThreshold, onComplete } = options

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()

      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - startTime

        if (!logThreshold || duration >= logThreshold) {
          console.log(`[${label}] Took ${duration}ms`)
        }

        if (onComplete) {
          onComplete(duration)
        }

        return result
      }
      catch (error) {
        const duration = Date.now() - startTime
        console.error(`[${label}] Failed after ${duration}ms`)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 验证装饰器
 * 验证方法参数
 */
export function validate(validators: Array<(value: any) => boolean | string>): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < validators.length && i < args.length; i++) {
        const validator = validators[i]
        if (validator) {
          const result = validator(args[i])
          if (result !== true) {
            throw new Error(typeof result === 'string' ? result : `Validation failed for argument ${i}`)
          }
        }
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 弃用警告装饰器
 * 标记方法为已弃用
 */
export function deprecated(message?: string, alternative?: string): MethodDecorator {
  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const methodName = String(propertyKey)
      const warning = message || `${methodName} is deprecated.`
      const suggestion = alternative ? ` Use ${alternative} instead.` : ''
      console.warn(`⚠️  ${warning}${suggestion}`)

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 只读装饰器
 * 防止属性被修改
 */
export function readonly(_target: any, _propertyKey: string): any {
  return {
    writable: false,
    enumerable: true,
    configurable: false,
  }
}

/**
 * 单例装饰器
 * 确保类只有一个实例
 */
export function singleton<T extends { new(...args: any[]): any }>(_constructor: T): T {
  let instance: any

  return class extends _constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance
      }

      super(...args)
      instance = this
    }
  } as T
}

/**
 * 绑定装饰器
 * 自动绑定 this 上下文
 */
export function bind(_target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value

  return {
    configurable: true,
    get() {
      const bound = originalMethod.bind(this)
      Object.defineProperty(this, propertyKey, {
        value: bound,
        configurable: true,
        writable: true,
      })
      return bound
    },
  }
}

/**
 * 异步锁装饰器
 * 确保方法同时只有一个实例在执行
 */
export function lock(): MethodDecorator {
  const lockMap = new WeakMap<any, Promise<any>>()

  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const existingLock = lockMap.get(this)
      if (existingLock) {
        await existingLock
      }

      const promise = originalMethod.apply(this, args)
      lockMap.set(this, promise)

      try {
        return await promise
      }
      finally {
        lockMap.delete(this)
      }
    }

    return descriptor
  }
}

/**
 * 条件执行装饰器
 * 只在满足条件时执行方法
 */
export function conditional(condition: (...args: any[]) => boolean): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      if (condition(...args)) {
        return originalMethod.apply(this, args)
      }
    }

    return descriptor
  }
}

/**
 * 结果转换装饰器
 * 转换方法返回值
 */
export function transform<T, R>(transformer: (result: T) => R): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args)
      return transformer(result)
    }

    return descriptor
  }
}

/**
 * 异常捕获装饰器
 * 捕获并处理异常
 */
export function catchError(handler: (error: Error) => any): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      }
      catch (error) {
        return handler(error as Error)
      }
    }

    return descriptor
  }
}

/**
 * 前置处理装饰器
 * 在方法执行前执行处理
 */
export function before(handler: (...args: any[]) => void | Promise<void>): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      await handler(...args)
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 后置处理装饰器
 * 在方法执行后执行处理
 */
export function after(handler: (result: any, ...args: any[]) => void | Promise<void>): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args)
      await handler(result, ...args)
      return result
    }

    return descriptor
  }
}

/**
 * 环绕处理装饰器
 * 在方法执行前后执行处理
 */
export function around(handler: {
  before?: (...args: any[]) => void | Promise<void>
  after?: (result: any, ...args: any[]) => void | Promise<void>
  error?: (error: Error, ...args: any[]) => void | Promise<void>
}): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      if (handler.before) {
        await handler.before(...args)
      }

      try {
        const result = await originalMethod.apply(this, args)

        if (handler.after) {
          await handler.after(result, ...args)
        }

        return result
      }
      catch (error) {
        if (handler.error) {
          await handler.error(error as Error, ...args)
        }
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 速率限制装饰器
 * 限制方法调用频率
 */
export function rateLimit(options: {
  maxCalls: number
  windowMs: number
}): MethodDecorator {
  const { maxCalls, windowMs } = options
  const callsMap = new WeakMap<any, number[]>()

  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const now = Date.now()
      const calls = callsMap.get(this) || []

      // 移除过期的调用记录
      const validCalls = calls.filter(time => now - time < windowMs)

      if (validCalls.length >= maxCalls) {
        throw new Error('Rate limit exceeded')
      }

      validCalls.push(now)
      callsMap.set(this, validCalls)

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}


