import type { DecoratorMetadata, GetterDecoratorOptions } from '../types'
import { DECORATOR_METADATA_KEY } from '../types/decorators'
import { fastHash } from '../utils/cache'
import 'reflect-metadata'

/**
 * Getter 装饰器
 * 用于标记类方法为计算属性
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @State({ default: '' })
 *   firstName: string = ''
 *
 *   @State({ default: '' })
 *   lastName: string = ''
 *
 *   @Getter({ deps: ['firstName', 'lastName'] })
 *   get fullName() {
 *     return `${this.firstName} ${this.lastName}`
 *   }
 *
 *   @Getter({ cache: true })
 *   get expensiveComputation() {
 *     return this.someExpensiveCalculation()
 *   }
 * }
 * ```
 */
export function Getter(options: GetterDecoratorOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof propertyKey === 'symbol') {
      throw new TypeError('Getter decorator does not support symbol properties')
    }

    // 获取现有的元数据
    const existingMetadata: DecoratorMetadata[]
      = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || []

    // 添加新的元数据
    const newMetadata: DecoratorMetadata = {
      type: 'getter',
      key: propertyKey,
      options,
    }

    existingMetadata.push(newMetadata)
    Reflect.defineMetadata(
      DECORATOR_METADATA_KEY,
      existingMetadata,
      target.constructor,
    )

    // 保存原始 getter
    const originalGetter = descriptor.get

    if (typeof originalGetter !== 'function') {
      throw new TypeError(
        `Getter decorator can only be applied to getter methods`,
      )
    }

    // 创建缓存（如果需要）
    let cachedValue: any
    let isCached = false
    let lastDepsHash: string | undefined

    // 包装 getter
    descriptor.get = function (this: any) {
      // 检查依赖是否变化（优化版本 - 使用快速哈希）
      if (options.deps && options.deps.length > 0) {
        const currentDepsValues = options.deps.map((dep) => {
          if (this._store) {
            return this._store.$state[dep]
          }
          return (this as any)[dep]
        })

        // 使用快速哈希替代 JSON.stringify，性能提升显著
        const currentDepsHash = fastHash(currentDepsValues)
        if (isCached && lastDepsHash !== currentDepsHash) {
          isCached = false
        }

        lastDepsHash = currentDepsHash
      }

      // 如果启用缓存且有缓存值，返回缓存值
      if (options.cache && isCached) {
        return cachedValue
      }

      // 计算新值
      const result = originalGetter.call(this)

      // 缓存结果
      if (options.cache) {
        cachedValue = result
        isCached = true
      }

      return result
    }

    // 添加清除缓存的方法
    if (options.cache) {
      const clearCacheMethodName = `clear${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)
        }Cache`

      Object.defineProperty(target, clearCacheMethodName, {
        value(this: any) {
          isCached = false
          cachedValue = undefined
        },
        writable: false,
        enumerable: false,
        configurable: true,
      })
    }

    return descriptor
  }
}

/**
 * 缓存 Getter 装饰器
 * 自动缓存计算结果
 */
export function CachedGetter(deps?: string[]): MethodDecorator {
  return Getter({
    cache: true,
    deps,
  })
}

/**
 * 依赖 Getter 装饰器
 * 指定计算属性的依赖项
 */
export function DependentGetter(deps: string[]): MethodDecorator {
  return Getter({
    deps,
  })
}

/**
 * 记忆化 Getter 装饰器
 * 结合缓存和依赖检查
 */
export function MemoizedGetter(deps: string[]): MethodDecorator {
  return Getter({
    cache: true,
    deps,
  })
}
