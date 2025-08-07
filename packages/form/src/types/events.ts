// 事件相关类型定义

import type { FormData, FieldState } from './form'
import type { ValidationResult } from './validation'

/**
 * 表单事件接口
 */
export interface FormEvents {
  /** 表单数据变化事件 */
  change: (data: FormData, changedField?: string) => void

  /** 表单提交事件 */
  submit: (data: FormData) => void

  /** 表单重置事件 */
  reset: (data: FormData) => void

  /** 表单验证事件 */
  validate: (result: ValidationResult, field?: string) => void

  /** 字段值变化事件 */
  fieldChange: (name: string, value: any, oldValue: any) => void

  /** 字段获得焦点事件 */
  fieldFocus: (name: string, event: FocusEvent) => void

  /** 字段失去焦点事件 */
  fieldBlur: (name: string, event: FocusEvent) => void

  /** 字段验证事件 */
  fieldValidate: (name: string, result: ValidationResult) => void

  /** 字段状态变化事件 */
  fieldStateChange: (name: string, state: FieldState) => void

  /** 表单初始化完成事件 */
  initialized: (data: FormData) => void

  /** 表单销毁事件 */
  destroyed: () => void

  /** 表单错误事件 */
  error: (error: Error, context?: string) => void

  /** 展开/收起事件 */
  expand: (expanded: boolean) => void

  /** 分组展开/收起事件 */
  groupExpand: (groupName: string, expanded: boolean) => void

  /** 弹窗打开/关闭事件 */
  modalToggle: (visible: boolean) => void
}

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (...args: T[]) => void

/**
 * 事件配置
 */
export interface EventConfig {
  /** 事件名称 */
  name: string

  /** 事件监听器 */
  listener: EventListener

  /** 是否只监听一次 */
  once?: boolean

  /** 事件优先级 */
  priority?: number

  /** 事件条件 */
  condition?: (...args: any[]) => boolean
}

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 监听事件 */
  on<K extends keyof FormEvents>(
    event: K,
    listener: FormEvents[K],
    options?: EventListenerOptions
  ): void

  /** 监听事件（一次性） */
  once<K extends keyof FormEvents>(event: K, listener: FormEvents[K]): void

  /** 取消监听事件 */
  off<K extends keyof FormEvents>(event: K, listener: FormEvents[K]): void

  /** 触发事件 */
  emit<K extends keyof FormEvents>(
    event: K,
    ...args: Parameters<FormEvents[K]>
  ): void

  /** 移除所有监听器 */
  removeAllListeners(event?: keyof FormEvents): void

  /** 获取监听器数量 */
  listenerCount(event: keyof FormEvents): number

  /** 获取所有监听器 */
  listeners<K extends keyof FormEvents>(event: K): FormEvents[K][]
}

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 是否只监听一次 */
  once?: boolean

  /** 事件优先级 */
  priority?: number

  /** 是否在捕获阶段监听 */
  capture?: boolean

  /** 是否被动监听 */
  passive?: boolean
}

/**
 * 自定义事件
 */
export interface CustomEvent<T = any> {
  /** 事件类型 */
  type: string

  /** 事件数据 */
  data: T

  /** 事件时间戳 */
  timestamp: number

  /** 事件目标 */
  target?: any

  /** 是否可取消 */
  cancelable?: boolean

  /** 是否已取消 */
  cancelled?: boolean

  /** 取消事件 */
  preventDefault?: () => void

  /** 停止传播 */
  stopPropagation?: () => void
}

/**
 * 事件处理器
 */
export interface EventHandler<T = any> {
  /** 处理事件 */
  handle(event: CustomEvent<T>): void | Promise<void>

  /** 事件类型 */
  type: string

  /** 处理器优先级 */
  priority?: number

  /** 是否异步处理 */
  async?: boolean
}

/**
 * 事件中间件
 */
export interface EventMiddleware {
  /** 中间件名称 */
  name: string

  /** 处理函数 */
  handler: (event: CustomEvent, next: () => void) => void | Promise<void>

  /** 中间件优先级 */
  priority?: number
}

/**
 * 事件总线接口
 */
export interface EventBus extends EventEmitter {
  /** 添加事件中间件 */
  use(middleware: EventMiddleware): void

  /** 移除事件中间件 */
  removeMiddleware(name: string): void

  /** 创建命名空间 */
  namespace(name: string): EventBus

  /** 销毁事件总线 */
  destroy(): void
}
