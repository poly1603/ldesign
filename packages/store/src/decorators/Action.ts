import type { ActionDecoratorOptions, DecoratorMetadata } from '../types'
import { DECORATOR_METADATA_KEY } from '../types/decorators'
import { fastHash, LRUCache } from '../utils/cache'
import 'reflect-metadata'

/**
 * Action 装饰器
 * 用于标记类方法为 Action
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @Action()
 *   updateName(name: string) {
 *     this.name = name
 *   }
 *
 *   @Action({ async: true, cache: true })
 *   async fetchUser(id: string) {
 *     const user = await api.getUser(id)
 *     this.user = user
 *     return user
 *   }
 * }
 * ```
 */
export function Action(options: ActionDecoratorOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof propertyKey === 'symbol') {
      throw new TypeError('Action decorator does not support symbol properties')
    }

    // 获取现有的元数据
    const existingMetadata: DecoratorMetadata[]
      = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || []

    // 添加新的元数据
    const newMetadata: DecoratorMetadata = {
      type: 'action',
      key: propertyKey,
      options,
    }

    existingMetadata.push(newMetadata)
    Reflect.defineMetadata(
      DECORATOR_METADATA_KEY,
      existingMetadata,
      target.constructor,
    )

    // 保存原始方法
    const originalMethod = descriptor.value

    if (typeof originalMethod !== 'function') {
      throw new TypeError(`Action decorator can only be applied to methods`)
    }

    // 创建 LRU 缓存（如果需要缓存）
    let cache: LRUCache<string, any> | undefined
    if (options.cache) {
      // 使用 LRU 缓存，自动管理过期和容量
      cache = new LRUCache(100, options.cacheTime || 5 * 60 * 1000)
    }

    // 包装方法
    descriptor.value = function (this: any, ...args: any[]) {
      // 缓存逻辑 - 使用快速哈希替代 JSON.stringify
      if (options.cache && cache) {
        const cacheKey = fastHash(args)
        const cached = cache.get(cacheKey)

        if (cached !== undefined) {
          return cached
        }
      }

      // 防抖逻辑
      if (options.debounce) {
        if ((this as any)[`_debounce_${propertyKey}`]) {
          clearTimeout((this as any)[`_debounce_${propertyKey}`])
        }

        return new Promise((resolve, reject) => {
          ; (this as any)[`_debounce_${propertyKey}`] = setTimeout(async () => {
            try {
              const result = await originalMethod.apply(this, args)
              resolve(result)
            }
            catch (error) {
              reject(error)
            }
          }, options.debounce)
        })
      }

      // 节流逻辑
      if (options.throttle) {
        const lastCall = (this as any)[`_throttle_${propertyKey}_last`] || 0
        const now = Date.now()

        if (now - lastCall < options.throttle) {
          return (this as any)[`_throttle_${propertyKey}_result`]
        }

        ; (this as any)[`_throttle_${propertyKey}_last`] = now
      }

      // 执行原始方法
      const result = originalMethod.apply(this, args)

      // 处理异步结果
      if (options.async && result instanceof Promise) {
        return result
          .then((res: any) => {
            // 缓存结果 - 使用快速哈希
            if (options.cache && cache) {
              const cacheKey = fastHash(args)
              cache.set(cacheKey, res)
            }

            // 保存节流结果
            if (options.throttle) {
              ; (this as any)[`_throttle_${propertyKey}_result`] = res
            }

            return res
          })
          .catch((error: any) => {
            console.error(`Action ${propertyKey} failed:`, error)
            throw error
          })
      }

      // 缓存同步结果 - 使用快速哈希
      if (options.cache && cache) {
        const cacheKey = fastHash(args)
        cache.set(cacheKey, result)
      }

      // 保存节流结果
      if (options.throttle) {
        ; (this as any)[`_throttle_${propertyKey}_result`] = result
      }

      return result
    }

    // 添加清理方法，防止内存泄漏
    const originalDispose = (target as any).$dispose
    if (originalDispose) {
      ; (target as any).$dispose = function (this: any) {
        // 清理缓存
        if (cache) {
          cache.dispose()
        }
        // 调用原始 dispose
        return originalDispose.call(this)
      }
    }

    return descriptor
  }
}

/**
 * 异步 Action 装饰器
 * 专门用于异步操作的 Action
 */
export function AsyncAction(
  options: Omit<ActionDecoratorOptions, 'async'> = {},
): MethodDecorator {
  return Action({
    ...options,
    async: true,
  })
}

/**
 * 缓存 Action 装饰器
 * 自动缓存 Action 的执行结果
 */
export function CachedAction(cacheTime?: number): MethodDecorator {
  return Action({
    cache: true,
    cacheTime,
  })
}

/**
 * 防抖 Action 装饰器
 * 防止 Action 被频繁调用
 */
export function DebouncedAction(delay: number): MethodDecorator {
  return Action({
    debounce: delay,
  })
}

/**
 * 节流 Action 装饰器
 * 限制 Action 的调用频率
 */
export function ThrottledAction(interval: number): MethodDecorator {
  return Action({
    throttle: interval,
  })
}
