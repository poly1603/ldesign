/**
 * 事件相关类型定义
 */

import type { WatermarkInstance } from './instance'
import type { SecurityViolation } from './security'
import type { AnimationInstance } from './animation'
import type { RenderPerformance } from './render'

// 事件类型枚举
export enum WatermarkEventType {
  // 实例生命周期事件
  INSTANCE_CREATED = 'instance:created',
  INSTANCE_UPDATED = 'instance:updated',
  INSTANCE_DESTROYED = 'instance:destroyed',
  INSTANCE_STATE_CHANGED = 'instance:stateChanged',
  
  // 渲染事件
  RENDER_START = 'render:start',
  RENDER_COMPLETE = 'render:complete',
  RENDER_ERROR = 'render:error',
  
  // 安全事件
  SECURITY_VIOLATION = 'security:violation',
  SECURITY_RECOVERED = 'security:recovered',
  
  // 动画事件
  ANIMATION_START = 'animation:start',
  ANIMATION_PAUSE = 'animation:pause',
  ANIMATION_RESUME = 'animation:resume',
  ANIMATION_STOP = 'animation:stop',
  ANIMATION_COMPLETE = 'animation:complete',
  
  // 响应式事件
  BREAKPOINT_CHANGED = 'responsive:breakpointChanged',
  CONTAINER_RESIZED = 'responsive:containerResized',
  ORIENTATION_CHANGED = 'responsive:orientationChanged',
  
  // 可见性事件
  VISIBILITY_CHANGED = 'visibility:changed',
  INTERSECTION_CHANGED = 'intersection:changed',
  
  // 性能事件
  PERFORMANCE_WARNING = 'performance:warning',
  MEMORY_LEAK_DETECTED = 'performance:memoryLeak',
  
  // 错误事件
  ERROR = 'error',
  WARNING = 'warning',
  
  // 自定义事件
  CUSTOM = 'custom'
}

// 基础事件接口
export interface BaseEvent {
  /** 事件类型 */
  type: WatermarkEventType
  /** 事件时间戳 */
  timestamp: number
  /** 事件目标实例ID */
  instanceId?: string
  /** 事件数据 */
  data?: any
  /** 是否可取消 */
  cancelable?: boolean
  /** 是否已取消 */
  cancelled?: boolean
  /** 事件来源 */
  source?: string
}

// 实例事件
export interface InstanceEvent extends BaseEvent {
  type: WatermarkEventType.INSTANCE_CREATED | WatermarkEventType.INSTANCE_UPDATED | WatermarkEventType.INSTANCE_DESTROYED | WatermarkEventType.INSTANCE_STATE_CHANGED
  instance: WatermarkInstance
}

// 渲染事件
export interface RenderEvent extends BaseEvent {
  type: WatermarkEventType.RENDER_START | WatermarkEventType.RENDER_COMPLETE | WatermarkEventType.RENDER_ERROR
  instanceId: string
  performance?: RenderPerformance
  error?: Error
}

// 安全事件
export interface SecurityEvent extends BaseEvent {
  type: WatermarkEventType.SECURITY_VIOLATION | WatermarkEventType.SECURITY_RECOVERED
  instanceId: string
  violation: SecurityViolation
}

// 动画事件
export interface AnimationEvent extends BaseEvent {
  type: WatermarkEventType.ANIMATION_START | WatermarkEventType.ANIMATION_PAUSE | WatermarkEventType.ANIMATION_RESUME | WatermarkEventType.ANIMATION_STOP | WatermarkEventType.ANIMATION_COMPLETE
  instanceId: string
  animation: AnimationInstance
}

// 响应式事件
export interface ResponsiveEvent extends BaseEvent {
  type: WatermarkEventType.BREAKPOINT_CHANGED | WatermarkEventType.CONTAINER_RESIZED | WatermarkEventType.ORIENTATION_CHANGED
  instanceId: string
  oldValue?: any
  newValue: any
}

// 可见性事件
export interface VisibilityEvent extends BaseEvent {
  type: WatermarkEventType.VISIBILITY_CHANGED | WatermarkEventType.INTERSECTION_CHANGED
  instanceId: string
  visible: boolean
  intersectionRatio?: number
}

// 性能事件
export interface PerformanceEvent extends BaseEvent {
  type: WatermarkEventType.PERFORMANCE_WARNING | WatermarkEventType.MEMORY_LEAK_DETECTED
  instanceId?: string
  metric: string
  value: number
  threshold?: number
  details?: Record<string, any>
}

// 错误事件
export interface ErrorEvent extends BaseEvent {
  type: WatermarkEventType.ERROR | WatermarkEventType.WARNING
  instanceId?: string
  error: Error
  context?: Record<string, any>
}

// 自定义事件
export interface CustomEvent extends BaseEvent {
  type: WatermarkEventType.CUSTOM
  customType: string
  payload: any
}

// 联合事件类型
export type WatermarkEvent = 
  | InstanceEvent
  | RenderEvent
  | SecurityEvent
  | AnimationEvent
  | ResponsiveEvent
  | VisibilityEvent
  | PerformanceEvent
  | ErrorEvent
  | CustomEvent

// 事件监听器类型
export type EventListener<T extends WatermarkEvent = WatermarkEvent> = (event: T) => void | Promise<void>

// 事件过滤器
export type EventFilter = (event: WatermarkEvent) => boolean

// 事件管理器接口
export interface EventManager {
  /** 添加事件监听器 */
  on<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void
  /** 添加一次性事件监听器 */
  once<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void
  /** 移除事件监听器 */
  off<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void
  /** 移除所有监听器 */
  removeAllListeners(type?: WatermarkEventType): void
  /** 触发事件 */
  emit(event: WatermarkEvent): Promise<void>
  /** 获取监听器数量 */
  listenerCount(type: WatermarkEventType): number
  /** 获取所有事件类型 */
  eventNames(): WatermarkEventType[]
  /** 设置最大监听器数量 */
  setMaxListeners(n: number): void
  /** 获取最大监听器数量 */
  getMaxListeners(): number
}

// 事件总线接口
export interface EventBus extends EventManager {
  /** 添加事件过滤器 */
  addFilter(filter: EventFilter): void
  /** 移除事件过滤器 */
  removeFilter(filter: EventFilter): void
  /** 清空所有过滤器 */
  clearFilters(): void
  /** 启用/禁用事件 */
  setEnabled(enabled: boolean): void
  /** 是否启用 */
  isEnabled(): boolean
  /** 获取事件历史 */
  getHistory(limit?: number): WatermarkEvent[]
  /** 清空事件历史 */
  clearHistory(): void
}

// 事件配置
export interface EventConfig {
  /** 是否启用事件系统 */
  enabled?: boolean
  /** 最大监听器数量 */
  maxListeners?: number
  /** 是否记录事件历史 */
  recordHistory?: boolean
  /** 历史记录最大数量 */
  maxHistorySize?: number
  /** 是否启用异步事件处理 */
  asyncHandling?: boolean
  /** 事件处理超时时间(毫秒) */
  handlerTimeout?: number
  /** 是否在控制台输出事件日志 */
  logEvents?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

// 事件统计信息
export interface EventStats {
  /** 总事件数量 */
  totalEvents: number
  /** 各类型事件数量 */
  eventCounts: Record<WatermarkEventType, number>
  /** 监听器数量 */
  listenerCounts: Record<WatermarkEventType, number>
  /** 平均处理时间 */
  avgHandlingTime: number
  /** 错误事件数量 */
  errorCount: number
  /** 最后一个事件时间 */
  lastEventTime: number
}

// 事件中间件
export interface EventMiddleware {
  /** 中间件名称 */
  name: string
  /** 处理事件 */
  handle(event: WatermarkEvent, next: () => Promise<void>): Promise<void>
  /** 是否启用 */
  enabled?: boolean
  /** 优先级 */
  priority?: number
}

// 默认事件配置
export const DEFAULT_EVENT_CONFIG: Required<EventConfig> = {
  enabled: true,
  maxListeners: 10,
  recordHistory: false,
  maxHistorySize: 100,
  asyncHandling: true,
  handlerTimeout: 5000,
  logEvents: false,
  logLevel: 'info'
}