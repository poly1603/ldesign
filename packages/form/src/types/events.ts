/**
 * 事件相关类型定义
 */

import type { AnyObject, AnyFunction } from './common'
import type { FormFieldConfig } from './field'
import type { ValidationResult, FormValidationResult } from './validation'

// 事件类型
export type EventType = 
  // 表单事件
  | 'form:created'
  | 'form:mounted'
  | 'form:updated'
  | 'form:destroyed'
  | 'form:reset'
  | 'form:submit'
  | 'form:change'
  | 'form:validate'
  | 'form:error'
  | 'form:success'
  
  // 字段事件
  | 'field:created'
  | 'field:mounted'
  | 'field:updated'
  | 'field:destroyed'
  | 'field:change'
  | 'field:focus'
  | 'field:blur'
  | 'field:validate'
  | 'field:error'
  | 'field:clear'
  
  // 布局事件
  | 'layout:calculated'
  | 'layout:updated'
  | 'layout:responsive'
  | 'layout:expand'
  | 'layout:collapse'
  
  // 用户交互事件
  | 'user:click'
  | 'user:keydown'
  | 'user:keyup'
  | 'user:input'
  | 'user:scroll'
  | 'user:resize'
  
  // 生命周期事件
  | 'lifecycle:beforeCreate'
  | 'lifecycle:created'
  | 'lifecycle:beforeMount'
  | 'lifecycle:mounted'
  | 'lifecycle:beforeUpdate'
  | 'lifecycle:updated'
  | 'lifecycle:beforeDestroy'
  | 'lifecycle:destroyed'
  
  // 插件事件
  | 'plugin:installed'
  | 'plugin:uninstalled'
  | 'plugin:enabled'
  | 'plugin:disabled'
  
  // 自定义事件
  | string

// 事件优先级
export type EventPriority = 'highest' | 'high' | 'normal' | 'low' | 'lowest'

// 事件阶段
export type EventPhase = 'capture' | 'target' | 'bubble'

// 基础事件数据
export interface BaseEventData {
  // 事件类型
  type: EventType
  
  // 事件时间戳
  timestamp: number
  
  // 事件ID
  id: string
  
  // 事件源
  source?: string
  
  // 事件目标
  target?: any
  
  // 事件数据
  data?: AnyObject
  
  // 事件元数据
  metadata?: AnyObject
}

// 表单事件数据
export interface FormEventData extends BaseEventData {
  // 表单实例
  form: any
  
  // 表单数据
  formData?: AnyObject
  
  // 表单配置
  formConfig?: any
  
  // 验证结果
  validationResult?: FormValidationResult
  
  // 错误信息
  error?: Error
}

// 字段事件数据
export interface FieldEventData extends BaseEventData {
  // 字段配置
  field: FormFieldConfig
  
  // 字段值
  value?: any
  
  // 旧值
  oldValue?: any
  
  // 表单数据
  formData?: AnyObject
  
  // 验证结果
  validationResult?: ValidationResult
  
  // 原生事件
  nativeEvent?: Event
}

// 布局事件数据
export interface LayoutEventData extends BaseEventData {
  // 布局配置
  layoutConfig?: any
  
  // 布局结果
  layoutResult?: any
  
  // 容器尺寸
  containerSize?: { width: number; height: number }
  
  // 断点信息
  breakpoint?: string
  
  // 响应式变化
  responsiveChange?: {
    from: string
    to: string
  }
}

// 用户交互事件数据
export interface UserEventData extends BaseEventData {
  // 原生事件
  nativeEvent: Event
  
  // 事件目标元素
  element?: HTMLElement
  
  // 鼠标位置
  mousePosition?: { x: number; y: number }
  
  // 键盘信息
  keyboard?: {
    key: string
    code: string
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    metaKey: boolean
  }
  
  // 触摸信息
  touch?: {
    touches: TouchList
    changedTouches: TouchList
    targetTouches: TouchList
  }
}

// 生命周期事件数据
export interface LifecycleEventData extends BaseEventData {
  // 生命周期阶段
  phase: string
  
  // 组件实例
  instance?: any
  
  // 组件配置
  config?: any
  
  // 上下文数据
  context?: AnyObject
}

// 插件事件数据
export interface PluginEventData extends BaseEventData {
  // 插件名称
  pluginName: string
  
  // 插件版本
  pluginVersion?: string
  
  // 插件配置
  pluginConfig?: AnyObject
  
  // 插件实例
  pluginInstance?: any
}

// 事件数据联合类型
export type EventData = 
  | FormEventData
  | FieldEventData
  | LayoutEventData
  | UserEventData
  | LifecycleEventData
  | PluginEventData
  | BaseEventData

// 事件监听器类型
export type EventListener<T extends EventData = EventData> = (event: T) => void | Promise<void>

// 事件监听器配置
export interface EventListenerConfig {
  // 监听器函数
  listener: EventListener
  
  // 事件类型
  type: EventType | EventType[]
  
  // 监听器优先级
  priority?: EventPriority
  
  // 是否只执行一次
  once?: boolean
  
  // 是否在捕获阶段执行
  capture?: boolean
  
  // 是否被动监听器
  passive?: boolean
  
  // 条件函数（返回true才执行监听器）
  condition?: (event: EventData) => boolean
  
  // 防抖延迟（毫秒）
  debounce?: number
  
  // 节流间隔（毫秒）
  throttle?: number
  
  // 监听器描述
  description?: string
  
  // 监听器标签
  tags?: string[]
  
  // 监听器元数据
  metadata?: AnyObject
}

// 事件过滤器类型
export type EventFilter = (event: EventData) => boolean

// 事件转换器类型
export type EventTransformer = (event: EventData) => EventData

// 事件中间件类型
export type EventMiddleware = (
  event: EventData,
  next: () => void | Promise<void>
) => void | Promise<void>

// 事件总线接口
export interface EventBus {
  // 添加事件监听器
  on<T extends EventData = EventData>(
    type: EventType | EventType[],
    listener: EventListener<T>,
    options?: Partial<EventListenerConfig>
  ): () => void
  
  // 添加一次性事件监听器
  once<T extends EventData = EventData>(
    type: EventType | EventType[],
    listener: EventListener<T>,
    options?: Partial<EventListenerConfig>
  ): () => void
  
  // 移除事件监听器
  off(type: EventType | EventType[], listener?: EventListener): void
  
  // 触发事件
  emit(type: EventType, data?: Partial<EventData>): Promise<void>
  
  // 同步触发事件
  emitSync(type: EventType, data?: Partial<EventData>): void
  
  // 添加事件过滤器
  addFilter(filter: EventFilter): void
  
  // 移除事件过滤器
  removeFilter(filter: EventFilter): void
  
  // 添加事件转换器
  addTransformer(transformer: EventTransformer): void
  
  // 移除事件转换器
  removeTransformer(transformer: EventTransformer): void
  
  // 添加事件中间件
  use(middleware: EventMiddleware): void
  
  // 获取所有监听器
  getListeners(type?: EventType): EventListenerConfig[]
  
  // 清除所有监听器
  clear(): void
  
  // 销毁事件总线
  destroy(): void
  
  // 获取事件统计
  getStats(): EventStats
}

// 事件统计信息
export interface EventStats {
  // 总事件数
  totalEvents: number
  
  // 事件类型统计
  eventTypes: Record<EventType, number>
  
  // 监听器数量
  listenerCount: number
  
  // 平均处理时间
  averageProcessTime: number
  
  // 错误数量
  errorCount: number
  
  // 最后事件时间
  lastEventTime: number
  
  // 性能指标
  performance: {
    slowestEvent: { type: EventType; duration: number }
    fastestEvent: { type: EventType; duration: number }
    memoryUsage: number
  }
}

// 事件调度器接口
export interface EventScheduler {
  // 调度事件
  schedule(event: EventData, delay?: number): void
  
  // 取消调度
  cancel(eventId: string): void
  
  // 暂停调度
  pause(): void
  
  // 恢复调度
  resume(): void
  
  // 清除所有调度
  clear(): void
  
  // 获取调度队列
  getQueue(): EventData[]
}

// 事件记录器接口
export interface EventLogger {
  // 记录事件
  log(event: EventData): void
  
  // 获取事件日志
  getLogs(filter?: EventFilter): EventData[]
  
  // 清除日志
  clearLogs(): void
  
  // 导出日志
  exportLogs(format: 'json' | 'csv' | 'xml'): string
  
  // 设置日志级别
  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void
  
  // 设置日志大小限制
  setMaxSize(size: number): void
}

// 事件重放器接口
export interface EventReplayer {
  // 开始记录
  startRecording(): void
  
  // 停止记录
  stopRecording(): void
  
  // 重放事件
  replay(events: EventData[]): Promise<void>
  
  // 获取记录的事件
  getRecordedEvents(): EventData[]
  
  // 清除记录
  clearRecording(): void
  
  // 保存记录
  saveRecording(name: string): void
  
  // 加载记录
  loadRecording(name: string): EventData[]
}

// 事件分析器接口
export interface EventAnalyzer {
  // 分析事件模式
  analyzePatterns(events: EventData[]): EventPattern[]
  
  // 分析性能
  analyzePerformance(events: EventData[]): PerformanceAnalysis
  
  // 分析用户行为
  analyzeUserBehavior(events: EventData[]): UserBehaviorAnalysis
  
  // 生成报告
  generateReport(events: EventData[]): EventReport
}

// 事件模式
export interface EventPattern {
  // 模式名称
  name: string
  
  // 模式描述
  description: string
  
  // 事件序列
  sequence: EventType[]
  
  // 出现频率
  frequency: number
  
  // 平均间隔
  averageInterval: number
  
  // 置信度
  confidence: number
}

// 性能分析结果
export interface PerformanceAnalysis {
  // 总处理时间
  totalProcessTime: number
  
  // 平均处理时间
  averageProcessTime: number
  
  // 最慢事件
  slowestEvents: Array<{ type: EventType; duration: number }>
  
  // 最快事件
  fastestEvents: Array<{ type: EventType; duration: number }>
  
  // 内存使用情况
  memoryUsage: {
    peak: number
    average: number
    current: number
  }
  
  // 性能建议
  recommendations: string[]
}

// 用户行为分析结果
export interface UserBehaviorAnalysis {
  // 用户会话时长
  sessionDuration: number
  
  // 交互次数
  interactionCount: number
  
  // 最常用功能
  mostUsedFeatures: Array<{ feature: string; count: number }>
  
  // 错误率
  errorRate: number
  
  // 完成率
  completionRate: number
  
  // 用户路径
  userPaths: Array<{ path: EventType[]; frequency: number }>
  
  // 行为建议
  recommendations: string[]
}

// 事件报告
export interface EventReport {
  // 报告时间
  timestamp: number
  
  // 报告期间
  period: { start: number; end: number }
  
  // 基础统计
  basicStats: EventStats
  
  // 性能分析
  performanceAnalysis: PerformanceAnalysis
  
  // 用户行为分析
  userBehaviorAnalysis: UserBehaviorAnalysis
  
  // 事件模式
  patterns: EventPattern[]
  
  // 异常事件
  anomalies: EventData[]
  
  // 建议
  recommendations: string[]
}
