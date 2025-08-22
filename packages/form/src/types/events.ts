/**
 * @fileoverview Event system types and interfaces for the form system
 * @author LDesign Team
 */

import type { FormData, FormFieldValue, FormValidationResult, FieldValidationResult } from './index'

// ================================
// 基础事件类型
// ================================

/**
 * 事件监听器函数类型
 */
export type EventCallback<T = any> = (data: T) => void | Promise<void>

/**
 * 事件取消器函数类型
 */
export type EventUnsubscriber = () => void

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 是否只监听一次 */
  once?: boolean
  /** 监听器优先级 */
  priority?: number
  /** 监听器条件 */
  condition?: (data: any) => boolean
  /** 错误处理器 */
  errorHandler?: (error: Error) => void
}

// ================================
// 表单事件类型定义
// ================================

/**
 * 表单初始化事件数据
 */
export interface FormInitEvent {
  /** 表单配置 */
  options: any
  /** 初始数据 */
  initialData: FormData
  /** 初始化时间戳 */
  timestamp: number
}

/**
 * 表单提交事件数据
 */
export interface FormSubmitEvent {
  /** 表单数据 */
  data: FormData
  /** 是否验证通过 */
  valid: boolean
  /** 验证结果 */
  validationResult: FormValidationResult
  /** 提交时间戳 */
  timestamp: number
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

/**
 * 表单重置事件数据
 */
export interface FormResetEvent {
  /** 重置前的数据 */
  oldData: FormData
  /** 重置后的数据 */
  newData: FormData
  /** 重置时间戳 */
  timestamp: number
}

/**
 * 表单验证事件数据
 */
export interface FormValidateEvent {
  /** 验证结果 */
  result: FormValidationResult
  /** 触发验证的原因 */
  trigger: 'manual' | 'submit' | 'change' | 'blur'
  /** 验证时间戳 */
  timestamp: number
  /** 验证耗时 */
  duration?: number
}

/**
 * 表单数据变化事件数据
 */
export interface FormChangeEvent {
  /** 变化后的完整数据 */
  data: FormData
  /** 变化的字段名 */
  field: string
  /** 新值 */
  value: FormFieldValue
  /** 旧值 */
  oldValue: FormFieldValue
  /** 变化时间戳 */
  timestamp: number
  /** 变化来源 */
  source: 'user' | 'programmatic' | 'reset' | 'validation'
}

/**
 * 字段焦点事件数据
 */
export interface FieldFocusEvent {
  /** 字段名 */
  field: string
  /** 字段值 */
  value: FormFieldValue
  /** 原生事件 */
  nativeEvent?: FocusEvent
  /** 时间戳 */
  timestamp: number
}

/**
 * 字段失焦事件数据
 */
export interface FieldBlurEvent {
  /** 字段名 */
  field: string
  /** 字段值 */
  value: FormFieldValue
  /** 原生事件 */
  nativeEvent?: FocusEvent
  /** 时间戳 */
  timestamp: number
}

/**
 * 字段变化事件数据
 */
export interface FieldChangeEvent {
  /** 字段名 */
  field: string
  /** 新值 */
  value: FormFieldValue
  /** 旧值 */
  oldValue: FormFieldValue
  /** 变化来源 */
  source: 'user' | 'programmatic' | 'reset' | 'validation'
  /** 时间戳 */
  timestamp: number
}

/**
 * 字段验证事件数据
 */
export interface FieldValidateEvent {
  /** 字段名 */
  field: string
  /** 验证结果 */
  result: FieldValidationResult
  /** 字段值 */
  value: FormFieldValue
  /** 触发验证的原因 */
  trigger: 'manual' | 'change' | 'blur' | 'submit'
  /** 验证时间戳 */
  timestamp: number
  /** 验证耗时 */
  duration?: number
}

/**
 * 表单展开事件数据
 */
export interface FormExpandEvent {
  /** 是否展开 */
  expanded: boolean
  /** 展开的行数 */
  visibleRows?: number
  /** 总行数 */
  totalRows?: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 分组切换事件数据
 */
export interface GroupToggleEvent {
  /** 分组名称 */
  groupName: string
  /** 是否折叠 */
  collapsed: boolean
  /** 分组中的字段 */
  fields: string[]
  /** 时间戳 */
  timestamp: number
}

/**
 * 表单错误事件数据
 */
export interface FormErrorEvent {
  /** 错误对象 */
  error: Error
  /** 错误类型 */
  type: 'validation' | 'submit' | 'render' | 'config' | 'network'
  /** 错误上下文 */
  context?: {
    field?: string
    action?: string
    data?: any
  }
  /** 时间戳 */
  timestamp: number
}

/**
 * 表单加载事件数据
 */
export interface FormLoadingEvent {
  /** 是否加载中 */
  loading: boolean
  /** 加载原因 */
  reason: 'submit' | 'validation' | 'fetch' | 'custom'
  /** 时间戳 */
  timestamp: number
}

/**
 * 表单销毁事件数据
 */
export interface FormDestroyEvent {
  /** 销毁原因 */
  reason: 'unmount' | 'manual' | 'error'
  /** 最终数据 */
  finalData: FormData
  /** 时间戳 */
  timestamp: number
}

// ================================
// 完整事件映射
// ================================

/**
 * 表单事件映射
 */
export interface FormEventMap {
  /** 表单初始化 */
  'form:init': FormInitEvent
  /** 表单提交 */
  'form:submit': FormSubmitEvent
  /** 表单重置 */
  'form:reset': FormResetEvent
  /** 表单验证 */
  'form:validate': FormValidateEvent
  /** 表单数据变化 */
  'form:change': FormChangeEvent
  /** 表单展开/收起 */
  'form:expand': FormExpandEvent
  /** 表单错误 */
  'form:error': FormErrorEvent
  /** 表单加载状态 */
  'form:loading': FormLoadingEvent
  /** 表单销毁 */
  'form:destroy': FormDestroyEvent

  /** 字段焦点 */
  'field:focus': FieldFocusEvent
  /** 字段失焦 */
  'field:blur': FieldBlurEvent
  /** 字段变化 */
  'field:change': FieldChangeEvent
  /** 字段验证 */
  'field:validate': FieldValidateEvent

  /** 分组切换 */
  'group:toggle': GroupToggleEvent

  /** 自定义事件 */
  [key: `custom:${string}`]: any
}

// ================================
// 事件系统接口
// ================================

/**
 * 事件发射器接口
 */
export interface EventEmitter<T extends Record<string, any> = FormEventMap> {
  /** 监听事件 */
  on<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>,
    config?: EventListenerConfig
  ): EventUnsubscriber

  /** 监听一次事件 */
  once<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>,
    config?: Omit<EventListenerConfig, 'once'>
  ): EventUnsubscriber

  /** 取消监听事件 */
  off<K extends keyof T>(event: K, callback?: EventCallback<T[K]>): void

  /** 发射事件 */
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>

  /** 获取事件监听器数量 */
  listenerCount(event: keyof T): number

  /** 获取所有事件名 */
  eventNames(): (keyof T)[]

  /** 移除所有监听器 */
  removeAllListeners(event?: keyof T): void

  /** 设置最大监听器数量 */
  setMaxListeners(n: number): void

  /** 获取最大监听器数量 */
  getMaxListeners(): number
}

/**
 * 事件拦截器接口
 */
export interface EventInterceptor<T = any> {
  /** 拦截器名称 */
  name: string
  /** 拦截前处理 */
  before?: (event: string, data: T) => T | Promise<T>
  /** 拦截后处理 */
  after?: (event: string, data: T, result: any) => void | Promise<void>
  /** 错误处理 */
  error?: (event: string, data: T, error: Error) => void | Promise<void>
  /** 拦截条件 */
  condition?: (event: string, data: T) => boolean
}

/**
 * 事件中间件接口
 */
export interface EventMiddleware<T = any> {
  /** 中间件名称 */
  name: string
  /** 中间件处理函数 */
  handle: (event: string, data: T, next: () => Promise<void>) => Promise<void>
  /** 优先级 */
  priority?: number
}

/**
 * 事件总线接口
 */
export interface EventBus extends EventEmitter {
  /** 添加事件拦截器 */
  addInterceptor<T = any>(interceptor: EventInterceptor<T>): void

  /** 移除事件拦截器 */
  removeInterceptor(name: string): void

  /** 添加事件中间件 */
  addMiddleware<T = any>(middleware: EventMiddleware<T>): void

  /** 移除事件中间件 */
  removeMiddleware(name: string): void

  /** 创建命名空间 */
  namespace(name: string): EventBus

  /** 桥接到其他事件总线 */
  bridge(bus: EventBus, events?: string[]): void

  /** 启用/禁用事件 */
  enable(enabled: boolean): void

  /** 获取事件历史 */
  getHistory(event?: string, limit?: number): Array<{
    event: string
    data: any
    timestamp: number
  }>

  /** 清空事件历史 */
  clearHistory(): void
}

// ================================
// 事件工具类型
// ================================

/**
 * 事件过滤器
 */
export type EventFilter<T = any> = (event: string, data: T) => boolean

/**
 * 事件转换器
 */
export type EventTransformer<T = any, R = any> = (event: string, data: T) => R

/**
 * 事件聚合器配置
 */
export interface EventAggregatorConfig {
  /** 聚合窗口大小（毫秒） */
  windowSize: number
  /** 最大事件数量 */
  maxEvents?: number
  /** 聚合函数 */
  aggregator: (events: Array<{ event: string, data: any, timestamp: number }>) => any
}

/**
 * 事件重试配置
 */
export interface EventRetryConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 重试延迟 */
  delay: number
  /** 延迟增长因子 */
  backoffFactor?: number
  /** 重试条件 */
  shouldRetry?: (error: Error, attempt: number) => boolean
}

// ================================
// 导出类型
// ================================

export type {
  EventCallback,
  EventUnsubscriber,
  EventListenerConfig,
  FormEventMap,
  EventEmitter,
  EventInterceptor,
  EventMiddleware,
  EventBus,
  EventFilter,
  EventTransformer,
  EventAggregatorConfig,
  EventRetryConfig,
}