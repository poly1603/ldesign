/**
 * 事件管理类型定义
 * 包含事件管理器、事件处理器等相关类型
 */

import type { EventHandler, EventMap } from './base'

// 事件管理器接口
export interface EventManager<TEventMap extends EventMap = EventMap> {
  on: (<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ) => void) &
    ((event: string, handler: EventHandler) => void)

  off: (<K extends keyof TEventMap>(
    event: K,
    handler?: EventHandler<TEventMap[K]>
  ) => void) &
    ((event: string, handler?: EventHandler) => void)

  emit: (<K extends keyof TEventMap>(event: K, data: TEventMap[K]) => void) &
    ((event: string, ...args: unknown[]) => void)

  once: (<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ) => void) &
    ((event: string, handler: EventHandler) => void)

  eventNames: () => string[]
  listenerCount: (event: string) => number
  listeners: (event: string) => EventHandler[]
  removeAllListeners: (event?: string) => void
  setMaxListeners: (n: number) => void
  getMaxListeners: () => number
  getStats: () => Record<string, unknown>
}

// 事件总线接口
export interface EventBus {
  subscribe: (event: string, handler: EventHandler) => () => void
  publish: (event: string, data?: unknown) => void
  unsubscribe: (event: string, handler: EventHandler) => void
  clear: () => void
  getSubscribers: (event: string) => EventHandler[]
}

// 事件管道接口
export interface EventPipeline {
  add: (event: string, handler: EventHandler) => void
  remove: (event: string, handler: EventHandler) => void
  execute: (event: string, data?: unknown) => Promise<void>
  clear: () => void
  getHandlers: (event: string) => EventHandler[]
}

// 事件过滤器接口
export interface EventFilter {
  name: string
  shouldProcess: (event: string, data?: unknown) => boolean
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 事件转换器接口
export interface EventTransformer {
  name: string
  transform: (event: string, data: unknown) => unknown
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 事件聚合器接口
export interface EventAggregator {
  add: (event: string, data: unknown) => void
  getAggregated: () => Record<string, unknown>
  clear: () => void
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 事件分析器接口
export interface EventAnalyzer {
  analyze: (
    events: Array<{ event: string; data: unknown; timestamp: number }>
  ) => EventAnalysis
  getPatterns: () => string[]
  getFrequentEvents: () => Array<{ event: string; count: number }>
  getStatistics: () => EventStatistics
}

// 事件分析结果
export interface EventAnalysis {
  patterns: string[]
  frequentEvents: Array<{ event: string; count: number }>
  statistics: EventStatistics
  recommendations: string[]
}

// 事件统计信息
export interface EventStatistics {
  total: number
  byEvent: Record<string, number>
  byTime: Record<string, number>
  averageDataSize: number
  eventRate: number
  handlerCount: number
}

// 引擎事件映射类型
export interface EngineEventMap extends EventMap {
  'engine:start': { timestamp: number; config: Record<string, unknown> }
  'engine:stop': { timestamp: number; reason: string }
  'engine:error': { error: Error; context: string; timestamp: number }
  'engine:warning': { message: string; context: string; timestamp: number }
  'engine:info': { message: string; context: string; timestamp: number }
  'plugin:load': { name: string; version: string; timestamp: number }
  'plugin:unload': { name: string; timestamp: number }
  'plugin:error': { name: string; error: Error; timestamp: number }
  'middleware:add': { name: string; priority: number; timestamp: number }
  'middleware:remove': { name: string; timestamp: number }
  'middleware:error': { name: string; error: Error; timestamp: number }
  'config:change': {
    path: string
    oldValue: unknown
    newValue: unknown
    timestamp: number
  }
  'state:change': {
    path: string
    oldValue: unknown
    newValue: unknown
    timestamp: number
  }
  'cache:set': { key: string; value: unknown; timestamp: number }
  'cache:get': { key: string; value: unknown; timestamp: number }
  'cache:delete': { key: string; timestamp: number }
  'cache:clear': { timestamp: number }
  'performance:measure': { name: string; duration: number; timestamp: number }
  'security:check': { type: string; result: boolean; timestamp: number }
  'notification:show': { type: string; message: string; timestamp: number }
  'notification:hide': { id: string; timestamp: number }
  'lifecycle:phase': { phase: string; timestamp: number }
  'directive:register': { name: string; timestamp: number }
  'directive:unregister': { name: string; timestamp: number }
  'environment:change': { oldEnv: string; newEnv: string; timestamp: number }
  'logger:log': { level: string; message: string; timestamp: number }
  'error:caught': { error: Error; context: string; timestamp: number }
  'error:handled': { error: Error; context: string; timestamp: number }
}
