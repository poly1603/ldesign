import type { DecoratorMetadata, StateDecoratorOptions } from '../types'
import { DECORATOR_METADATA_KEY } from '../types/decorators'
import 'reflect-metadata'

/**
 * State 装饰器
 * 用于标记类属性为状态
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @State({ default: '' })
 *   name: string = ''
 *
 *   @State({ default: 0, persist: true })
 *   age: number = 0
 * }
 * ```
 */
export function State(options: StateDecoratorOptions = {}): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new TypeError('State decorator does not support symbol properties')
    }

    // 获取现有的元数据
    const existingMetadata: DecoratorMetadata[]
      = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || []

    // 添加新的元数据
    const newMetadata: DecoratorMetadata = {
      type: 'state',
      key: propertyKey,
      options,
    }

    // 检查是否已存在相同的状态定义
    const existingIndex = existingMetadata.findIndex(
      meta => meta.type === 'state' && meta.key === propertyKey,
    )

    if (existingIndex >= 0) {
      // 更新现有的元数据
      existingMetadata[existingIndex] = newMetadata
    }
    else {
      // 添加新的元数据
      existingMetadata.push(newMetadata)
    }

    // 设置元数据
    Reflect.defineMetadata(
      DECORATOR_METADATA_KEY,
      existingMetadata,
      target.constructor,
    )

    // 设置属性描述符
    const descriptor: PropertyDescriptor = {
      get(this: any) {
        // 如果有 store 实例，从 store 获取值
        if (this._store) {
          return this._store.$state[propertyKey]
        }
        // 否则返回默认值
        return options.default
      },
      set(this: any, value: any) {
        // 如果有 store 实例，更新 store 状态
        if (this._store) {
          this._store.$patch({ [propertyKey]: value })
        }
        else {
          // 否则直接设置属性值
          Object.defineProperty(this, `_${propertyKey}`, {
            value,
            writable: true,
            enumerable: false,
            configurable: true,
          })
        }
      },
      enumerable: true,
      configurable: true,
    }

    // 定义属性
    Object.defineProperty(target, propertyKey, descriptor)
  }
}

/**
 * 响应式状态装饰器
 * 确保状态是深度响应式的
 */
export function ReactiveState(
  options: StateDecoratorOptions = {},
): PropertyDecorator {
  return State({
    ...options,
    deep: true,
  })
}

/**
 * 持久化状态装饰器
 * 自动持久化状态到本地存储
 */
export function PersistentState(
  options: StateDecoratorOptions = {},
): PropertyDecorator {
  return State({
    ...options,
    persist: true,
  })
}

/**
 * 只读状态装饰器
 * 创建只读的状态属性
 */
export function ReadonlyState(
  options: Omit<StateDecoratorOptions, 'default'> & { value: any },
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new TypeError(
        'ReadonlyState decorator does not support symbol properties',
      )
    }

    // 获取现有的元数据
    const existingMetadata: DecoratorMetadata[]
      = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || []

    // 添加新的元数据
    const newMetadata: DecoratorMetadata = {
      type: 'state',
      key: propertyKey,
      options: {
        ...options,
        default: options.value,
      },
    }

    existingMetadata.push(newMetadata)
    Reflect.defineMetadata(
      DECORATOR_METADATA_KEY,
      existingMetadata,
      target.constructor,
    )

    // 设置只读属性描述符
    const descriptor: PropertyDescriptor = {
      get(this: any) {
        if (this._store) {
          return this._store.$state[propertyKey]
        }
        return options.value
      },
      set(this: any, value: any) {
        // 在构造阶段允许设置，运行时禁止
        if (this._isConstructing !== false) {
          // 在构造阶段，直接设置内部属性
          Object.defineProperty(this, `_${propertyKey}`, {
            value,
            writable: false,
            enumerable: false,
            configurable: false,
          })
          return
        }
        // 如果是初始值设置（从装饰器选项），允许设置
        if (value === options.value) {
          return
        }
        throw new Error(`Cannot set readonly state property: ${propertyKey}`)
      },
      enumerable: true,
      configurable: true,
    }

    Object.defineProperty(target, propertyKey, descriptor)
  }
}
