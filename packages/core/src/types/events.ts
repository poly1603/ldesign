/**
 * 事件系统类型定义
 */

import type { Unsubscribe } from './base'

/**
 * 事件处理函数
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>

/**
 * 事件选项
 */
export interface EventOptions {
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 是否只触发一次 */
  once?: boolean
  /** 事件命名空间 */
  namespace?: string
  /** 是否为弱引用监听器（自动清理） */
  weak?: boolean
  /** 监听器所有者（用于自动清理） */
  owner?: object
}

/**
 * 事件信息
 */
export interface EventInfo {
  readonly name: string
  readonly listenersCount: number
  readonly namespace?: string
  readonly createdAt: number
  readonly lastTriggered?: number
  readonly triggerCount?: number
}

/**
 * 事件管理器接口
 */
export interface EventManager {
  /** 监听事件 */
  on<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    options?: EventOptions
  ): Unsubscribe

  /** 监听一次事件 */
  once<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    options?: Omit<EventOptions, 'once'>
  ): Unsubscribe

  /** 触发事件 */
  emit<T = any>(eventName: string, data?: T): Promise<void>

  /** 同步触发事件 */
  emitSync<T = any>(eventName: string, data?: T): void

  /** 移除事件监听器 */
  off(eventName: string, handler?: EventHandler): void

  /** 移除命名空间下的所有监听器 */
  offNamespace?(namespace: string): void

  /** 移除所有监听器 */
  removeAllListeners(eventName?: string): void

  /** 获取事件监听器数量 */
  listenerCount(eventName: string): number

  /** 获取所有事件名称 */
  eventNames(): string[]

  /** 获取事件信息 */
  getEventInfo(eventName: string): EventInfo | undefined

  /** 获取所有事件统计信息 */
  getStats?(): {
    totalEvents: number
    totalListeners: number
    events: EventInfo[]
  }

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

