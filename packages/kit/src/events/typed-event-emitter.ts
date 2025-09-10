/**
 * 类型安全的事件发射器
 * 提供完整的TypeScript类型支持
 */

import type { EventListener as BaseEventListener, EventOptions } from '../types'
import { EventEmitter } from './event-emitter'

/**
 * 事件映射类型
 */
export type EventMap = Record<string, unknown[]>

/**
 * 事件监听器类型
 */
export type TypedEventListener<T extends unknown[]> = (...args: T) => void | Promise<void>

/**
 * 类型安全的事件发射器
 */
export class TypedEventEmitter<TEventMap extends EventMap> extends EventEmitter {
  /**
   * 添加类型安全的事件监听器
   */
  override on<K extends keyof TEventMap>(
    event: K,
    listener: TypedEventListener<TEventMap[K]>,
    options?: {
      priority?: number
      namespace?: string
      tags?: string[]
    },
  ): this {
    return super.on(event as string, listener as unknown as BaseEventListener, options)
  }

  /**
   * 添加类型安全的一次性事件监听器
   */
  override once<K extends keyof TEventMap>(
    event: K,
    listener: TypedEventListener<TEventMap[K]>,
    options?: {
      priority?: number
      namespace?: string
      tags?: string[]
    },
  ): this {
    return super.once(event as string, listener as unknown as BaseEventListener, options)
  }

  /**
   * 移除类型安全的事件监听器
   */
  override off<K extends keyof TEventMap>(
    event: K,
    listener?: TypedEventListener<TEventMap[K]>,
  ): this {
    return super.off(event as string, listener as unknown as BaseEventListener)
  }

  /**
   * 发射类型安全的事件
   */
  override emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): boolean {
    return super.emit(event as string, ...args)
  }

  /**
   * 异步发射类型安全的事件
   */
  override async emitAsync<K extends keyof TEventMap>(
    event: K,
    ...args: TEventMap[K]
  ): Promise<unknown[]> {
    return super.emitAsync(event as string, ...args)
  }

  /**
   * 等待类型安全的事件
   */
  override waitFor<K extends keyof TEventMap>(event: K, timeout?: number): Promise<TEventMap[K]> {
    return super.waitFor(event as string, timeout) as Promise<TEventMap[K]>
  }

  /**
   * 检查是否有指定事件的监听器
   */
  override hasListeners<K extends keyof TEventMap>(event: K): boolean {
    return super.hasListeners(event as string)
  }

  /**
   * 获取指定事件的监听器数量
   */
  override getListenerCount(event?: string): number {
    return super.getListenerCount(event)
  }

  /**
   * 获取指定事件的监听器数量（类型安全）
   */
  getTypedListenerCount<K extends keyof TEventMap>(event: K): number {
    return super.getListenerCount(event as string)
  }

  /**
   * 创建类型安全的事件发射器实例
   */
  static override create<TEventMap extends EventMap>(options?: EventOptions): TypedEventEmitter<TEventMap> {
    return new TypedEventEmitter<TEventMap>(options)
  }
}

/**
 * 事件发射器构建器
 */
export class EventEmitterBuilder<TEventMap extends EventMap = Record<string, unknown[]>> {
  /**
   * 添加事件类型定义
   */
  addEvent<K extends string, T extends unknown[]>(
    _event: K,
    _args: T,
  ): EventEmitterBuilder<TEventMap & Record<K, T>> {
    return this as unknown as EventEmitterBuilder<TEventMap & Record<K, T>>
  }

  /**
   * 构建类型安全的事件发射器
   */
  build(options?: EventOptions): TypedEventEmitter<TEventMap> {
    return new TypedEventEmitter<TEventMap>(options)
  }

  /**
   * 创建构建器实例
   */
  static create(): EventEmitterBuilder {
    return new EventEmitterBuilder()
  }
}

/**
 * 预定义的常用事件类型
 */
export interface CommonEvents {
  [event: string]: unknown[]
  error: [Error]
  ready: []
  close: []
  connect: []
  disconnect: []
  data: [unknown]
  change: [unknown, unknown] // [newValue, oldValue]
  update: [unknown]
  create: [unknown]
  delete: [unknown]
  start: []
  stop: []
  pause: []
  resume: []
  progress: [number] // percentage
  complete: []
  timeout: []
  retry: [number] // attempt number
}

/**
 * HTTP事件类型
 */
export interface HttpEvents {
  'request': [unknown] // request object
  'response': [unknown] // response object
  'request:start': [string] // url
  'request:end': [string, number] // url, status
  'request:error': [string, Error] // url, error
}

/**
 * 数据库事件类型
 */
export interface DatabaseEvents {
  'db:connect': []
  'db:disconnect': []
  'db:query': [string] // sql
  'db:result': [unknown] // result
  'db:error': [Error]
  'db:transaction:start': []
  'db:transaction:commit': []
  'db:transaction:rollback': []
}

/**
 * 文件系统事件类型
 */
export interface FileSystemEvents {
  'file:create': [string] // path
  'file:change': [string] // path
  'file:delete': [string] // path
  'file:rename': [string, string] // oldPath, newPath
  'dir:create': [string] // path
  'dir:delete': [string] // path
}

/**
 * 缓存事件类型
 */
export interface CacheEvents {
  'cache:hit': [string] // key
  'cache:miss': [string] // key
  'cache:set': [string, unknown] // key, value
  'cache:delete': [string] // key
  'cache:clear': []
  'cache:expire': [string] // key
}

/**
 * 用户事件类型
 */
export interface UserEvents {
  'user:login': [string] // userId
  'user:logout': [string] // userId
  'user:register': [string] // userId
  'user:update': [string, unknown] // userId, userData
  'user:delete': [string] // userId
}

/**
 * 应用事件类型
 */
export interface AppEvents extends CommonEvents {
  'app:start': []
  'app:stop': []
  'app:restart': []
  'app:config:change': [unknown] // config
  'app:health:check': [boolean] // healthy
}

/**
 * 组合事件类型
 */
export interface AllEvents
  extends CommonEvents,
  HttpEvents,
  DatabaseEvents,
  FileSystemEvents,
  CacheEvents,
  UserEvents,
  AppEvents {
  [event: string]: unknown[]
}

/**
 * 创建类型安全的事件发射器
 */
export function createTypedEventEmitter<TEventMap extends EventMap>(
  options?: EventOptions,
): TypedEventEmitter<TEventMap> {
  return new TypedEventEmitter<TEventMap>(options)
}

/**
 * 创建带有常用事件的事件发射器
 */
export function createCommonEventEmitter(options?: EventOptions): TypedEventEmitter<CommonEvents> {
  return new TypedEventEmitter<CommonEvents>(options)
}

/**
 * 创建带有所有预定义事件的事件发射器
 */
export function createFullEventEmitter(options?: EventOptions): TypedEventEmitter<AllEvents> {
  return new TypedEventEmitter<AllEvents>(options)
}

/**
 * 事件类型工具
 */
/* eslint-disable ts/no-namespace */
export namespace EventTypes {
  /**
   * 提取事件名称
   */
  export type EventNames<TEventMap extends EventMap> = keyof TEventMap

  /**
   * 提取事件参数
   */
  export type EventArgs<TEventMap extends EventMap, K extends keyof TEventMap> = TEventMap[K]

  /**
   * 提取事件监听器类型
   */
  export type EventListener<
    TEventMap extends EventMap,
    K extends keyof TEventMap,
  > = TypedEventListener<TEventMap[K]>

  /**
   * 检查事件是否存在
   */
  export type HasEvent<TEventMap extends EventMap, K extends string> = K extends keyof TEventMap
    ? true
    : false

  /**
   * 合并事件映射
   */
  export type MergeEventMaps<T1 extends EventMap, T2 extends EventMap> = T1 & T2

  /**
   * 过滤事件映射
   */
  export type FilterEventMap<TEventMap extends EventMap, K extends keyof TEventMap> = Pick<
    TEventMap,
    K
  >

  /**
   * 排除事件映射
   */
  export type OmitEventMap<TEventMap extends EventMap, K extends keyof TEventMap> = Omit<
    TEventMap,
    K
  >
}
/* eslint-enable ts/no-namespace */

/**
 * 事件装饰器
 */
export function EventHandler<TEventMap extends EventMap, K extends keyof TEventMap>(
  event: K,
  options?: {
    priority?: number
    namespace?: string
    tags?: string[]
    once?: boolean
  },
) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      interface UnknownEmitter { on?: (...a: unknown[]) => unknown, once?: (...a: unknown[]) => unknown }
      interface HasEmitter { eventEmitter?: UnknownEmitter, emitter?: UnknownEmitter }
      const holder = this as unknown as HasEmitter
      const emitter = holder.eventEmitter ?? holder.emitter
      if (emitter && typeof emitter.on === 'function') {
        const listener = originalMethod.bind(this)
        if (options?.once) {
          emitter.once?.(event, listener, options)
        }
        else {
          emitter.on?.(event, listener, options)
        }
      }
      const typedOriginal = originalMethod as (...a: unknown[]) => unknown
      return typedOriginal.apply(this, args as unknown[])
    }

    return descriptor
  }
}

/**
 * 自动事件绑定装饰器
 */
export function AutoBind<TEventMap extends EventMap>(eventMap: TEventMap) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)

        // 自动绑定事件处理方法
        const prototype = Object.getPrototypeOf(this)
        const methodNames = Object.getOwnPropertyNames(prototype)

        for (const methodName of methodNames) {
          interface UnknownEmitter { on?: (...a: unknown[]) => unknown }
          interface HasEmitter { eventEmitter?: UnknownEmitter, emitter?: UnknownEmitter, [k: string]: unknown }
          const self = this as unknown as HasEmitter
          const maybeFn = self[methodName]
          if (methodName.startsWith('on') && typeof maybeFn === 'function') {
            const eventName = methodName.slice(2).toLowerCase()
            if (eventName in eventMap) {
              const emitter = self.eventEmitter ?? self.emitter
              if (emitter && typeof emitter.on === 'function') {
                emitter.on(eventName, (maybeFn as (...a: unknown[]) => unknown).bind(this))
              }
            }
          }
        }
      }
    }
  }
}
