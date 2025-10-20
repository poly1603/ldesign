/**
 * 请求链路追踪
 *
 * 生成trace ID,跟踪请求的完整生命周期
 */

import type { HttpError, RequestConfig, ResponseData } from '../types'
import { generateId } from './index'

/**
 * 追踪span类型
 */
export enum SpanType {
 /** HTTP请求 */
 HTTP = 'http',
 /** 数据库查询 */
 DATABASE = 'database',
 /** 缓存操作 */
 CACHE = 'cache',
 /** 自定义 */
 CUSTOM = 'custom',
}

/**
 * 追踪span状态
 */
export enum SpanStatus {
 /** 进行中 */
 PENDING = 'pending',
 /** 成功 */
 SUCCESS = 'success',
 /** 失败 */
 ERROR = 'error',
 /** 取消 */
 CANCELLED = 'cancelled',
}

/**
 * 追踪标签
 */
export interface TraceTag {
 key: string
 value: string | number | boolean
}

/**
 * 追踪span
 */
export interface TraceSpan {
 /** Span ID */
 spanId: string
 /** 父Span ID */
 parentSpanId?: string
 /** Trace ID */
 traceId: string
 /** Span名称 */
 name: string
 /** Span类型 */
 type: SpanType
 /** 开始时间 */
 startTime: number
 /** 结束时间 */
 endTime?: number
 /** 持续时间(ms) */
 duration?: number
 /** 状态 */
 status: SpanStatus
 /** 标签 */
 tags: TraceTag[]
 /** 日志 */
 logs: Array<{ timestamp: number, message: string, data?: any }>
 /** 错误信息 */
 error?: { message: string, stack?: string }
}

/**
 * 追踪上下文
 */
export interface TraceContext {
 /** Trace ID */
 traceId: string
 /** 当前Span */
 currentSpan?: TraceSpan
 /** 所有Spans */
 spans: TraceSpan[]
 /** 元数据 */
 metadata: Record<string, any>
}

/**
 * 追踪配置
 */
export interface TraceConfig {
 /** 是否启用 */
 enabled?: boolean
 /** 采样率(0-1) */
 sampleRate?: number
 /** 是否在Header中传递trace ID */
 propagateTraceId?: boolean
 /** Trace ID Header名称 */
 traceIdHeader?: string
 /** Span ID Header名称 */
 spanIdHeader?: string
 /** 导出器 */
 exporter?: (spans: TraceSpan[]) => void | Promise<void>
}

/**
 * 请求追踪管理器
 *
 * @example
 * ```typescript
 * const tracer = new RequestTracer({
 *  enabled: true,
 *  sampleRate: 1.0,
 * })
 *
 * // 开始追踪
 * const trace = tracer.startTrace('GET /api/users')
 *
 * // 添加span
 * const span = trace.startSpan('Query Database', SpanType.DATABASE)
 * span.addTag('table', 'users')
 * span.finish()
 *
 * // 结束追踪
 * trace.finish()
 * ```
 */
export class RequestTracer {
 private config: Required<Omit<TraceConfig, 'exporter'>> & { exporter?: TraceConfig['exporter'] }
 private traces: Map<string, TraceContext> = new Map()

 constructor(config: TraceConfig = {}) {
  this.config = {
   enabled: config.enabled ?? true,
   sampleRate: config.sampleRate ?? 1.0,
   propagateTraceId: config.propagateTraceId ?? true,
   traceIdHeader: config.traceIdHeader ?? 'X-Trace-Id',
   spanIdHeader: config.spanIdHeader ?? 'X-Span-Id',
   exporter: config.exporter,
  }
 }

 /**
  * 开始新的追踪
  */
 startTrace(name: string, type: SpanType = SpanType.HTTP): Trace {
  // 采样决策
  if (!this.shouldSample()) {
   return new NoOpTrace()
  }

  const traceId = this.generateTraceId()
  const spanId = this.generateSpanId()

  const span: TraceSpan = {
   spanId,
   traceId,
   name,
   type,
   startTime: Date.now(),
   status: SpanStatus.PENDING,
   tags: [],
   logs: [],
  }

  const context: TraceContext = {
   traceId,
   currentSpan: span,
   spans: [span],
   metadata: {},
  }

  this.traces.set(traceId, context)

  return new Trace(this, context, span)
 }

 /**
  * 获取追踪上下文
  */
 getTrace(traceId: string): TraceContext | undefined {
  return this.traces.get(traceId)
 }

 /**
  * 结束追踪
  */
 finishTrace(traceId: string): void {
  const context = this.traces.get(traceId)
  if (!context) return

  // 导出spans
  if (this.config?.exporter) {
   const result = this.config?.exporter(context.spans)
   if (result instanceof Promise) {
    result.catch((err: Error) => {
     console.error('Failed to export trace spans:', err)
    })
   }
  }

  // 清理
  this.traces.delete(traceId)
 }

 /**
  * 判断是否应该采样
  */
 private shouldSample(): boolean {
  if (!this.config?.enabled) return false
  return Math.random() < this.config?.sampleRate
 }

 /**
  * 生成Trace ID
  */
 private generateTraceId(): string {
  return `trace-${generateId()}-${Date.now()}`
 }

 /**
  * 生成Span ID
  */
 private generateSpanId(): string {
  return `span-${generateId()}`
 }

 /**
  * 获取配置
  */
 getConfig(): TraceConfig {
  return this.config
 }
}

/**
 * 追踪对象
 */
export class Trace {
 constructor(
  private tracer: RequestTracer,
  private context: TraceContext,
  private rootSpan: TraceSpan,
 ) {}

 /**
  * 获取Trace ID
  */
 get traceId(): string {
  return this.context.traceId
 }

 /**
  * 获取当前Span ID
  */
 get spanId(): string {
  return this.rootSpan.spanId
 }

 /**
  * 开始子Span
  */
 startSpan(name: string, type: SpanType = SpanType.CUSTOM): Span {
  const spanId = `span-${generateId()}`
  const span: TraceSpan = {
   spanId,
   parentSpanId: this.context.currentSpan?.spanId,
   traceId: this.context.traceId,
   name,
   type,
   startTime: Date.now(),
   status: SpanStatus.PENDING,
   tags: [],
   logs: [],
  }

  this.context.spans.push(span)
  this.context.currentSpan = span

  return new Span(span)
 }

 /**
  * 添加标签
  */
 addTag(key: string, value: string | number | boolean): this {
  this.rootSpan.tags.push({ key, value })
  return this
 }

 /**
  * 添加日志
  */
 addLog(message: string, data?: any): this {
  this.rootSpan.logs.push({
   timestamp: Date.now(),
   message,
   data,
  })
  return this
 }

 /**
  * 设置错误
  */
 setError(error: Error): this {
  this.rootSpan.status = SpanStatus.ERROR
  this.rootSpan.error = {
   message: error.message,
   stack: error.stack,
  }
  return this
 }

 /**
  * 结束追踪
  */
 finish(status: SpanStatus = SpanStatus.SUCCESS): void {
  const now = Date.now()
  this.rootSpan.endTime = now
  this.rootSpan.duration = now - this.rootSpan.startTime
  this.rootSpan.status = status

  this.tracer.finishTrace(this.context.traceId)
 }

 /**
  * 获取所有Spans
  */
 getSpans(): TraceSpan[] {
  return [...this.context.spans]
 }

 /**
  * 获取元数据
  */
 getMetadata(): Record<string, any> {
  return this.context.metadata
 }

 /**
  * 设置元数据
  */
 setMetadata(key: string, value: any): this {
  this.context.metadata[key] = value
  return this
 }
}

/**
 * Span对象
 */
export class Span {
 constructor(private span: TraceSpan) {}

 /**
  * 添加标签
  */
 addTag(key: string, value: string | number | boolean): this {
  this.span.tags.push({ key, value })
  return this
 }

 /**
  * 添加日志
  */
 addLog(message: string, data?: any): this {
  this.span.logs.push({
   timestamp: Date.now(),
   message,
   data,
  })
  return this
 }

 /**
  * 设置错误
  */
 setError(error: Error): this {
  this.span.status = SpanStatus.ERROR
  this.span.error = {
   message: error.message,
   stack: error.stack,
  }
  return this
 }

 /**
  * 结束Span
  */
 finish(status: SpanStatus = SpanStatus.SUCCESS): void {
  const now = Date.now()
  this.span.endTime = now
  this.span.duration = now - this.span.startTime
  this.span.status = status
 }

 /**
  * 获取原始span数据
  */
 getRawSpan(): TraceSpan {
  return this.span
 }
}

/**
 * 空追踪对象（未采样时使用）
 */
class NoOpTrace extends Trace {
 constructor() {
  super(null as any, null as any, null as any)
 }

 startSpan(): Span {
  return new NoOpSpan()
 }

 addTag(): this {
  return this
 }

 addLog(): this {
  return this
 }

 setError(): this {
  return this
 }

 finish(): void {}

 getSpans(): TraceSpan[] {
  return []
 }
}

/**
 * 空Span对象
 */
class NoOpSpan extends Span {
 constructor() {
  super(null as any)
 }

 addTag(): this {
  return this
 }

 addLog(): this {
  return this
 }

 setError(): this {
  return this
 }

 finish(): void {}
}

/**
 * 创建请求追踪器
 */
export function createRequestTracer(config?: TraceConfig): RequestTracer {
 return new RequestTracer(config)
}

/**
 * 全局请求追踪器
 */
export const globalTracer = new RequestTracer()

/**
 * 追踪拦截器
 *
 * 自动为每个请求创建追踪
 */
export function createTraceInterceptor(config?: TraceConfig) {
 const tracer = new RequestTracer(config)
 const traces = new Map<string, Trace>()

 return {
  request: {
   onFulfilled: (requestConfig: RequestConfig) => {
    const trace = tracer.startTrace(
     `${requestConfig.method?.toUpperCase()} ${requestConfig.url}`,
     SpanType.HTTP,
    )

    // 添加请求信息
    trace.addTag('http.method', requestConfig.method || 'GET')
    trace.addTag('http.url', requestConfig.url || '')
    if (requestConfig.baseURL) {
     trace.addTag('http.base_url', requestConfig.baseURL)
    }

    // 在请求配置中保存trace
    ;(requestConfig as any).__trace__ = trace

    // 如果配置了传播trace ID,添加到headers
    const tracerConfig = tracer.getConfig()
    if (tracerConfig.propagateTraceId) {
     requestConfig.headers = requestConfig.headers || {}
     if (tracerConfig.traceIdHeader && tracerConfig.spanIdHeader) {
      requestConfig.headers[tracerConfig.traceIdHeader] = trace.traceId
      requestConfig.headers[tracerConfig.spanIdHeader] = trace.spanId
     }
    }

    traces.set(trace.traceId, trace)

    return requestConfig
   },
  },

  response: {
   onFulfilled: (response: ResponseData<any>) => {
    const trace = (response.config as any).__trace__ as Trace
    if (trace) {
     trace.addTag('http.status', response.status)
     trace.addLog('Response received')
     trace.finish(SpanStatus.SUCCESS)
     traces.delete(trace.traceId)
    }
    return response
   },

   onRejected: (error: HttpError) => {
    const trace = (error.config as any).__trace__ as Trace
    if (trace) {
     if (error.response) {
      trace.addTag('http.status', error.response.status)
     }
     trace.setError(error)
     trace.addLog('Request failed', { error: error.message })
     trace.finish(SpanStatus.ERROR)
     traces.delete(trace.traceId)
    }
    throw error
   },
  },
 }
}

/**
 * 控制台导出器
 */
export function consoleExporter(spans: TraceSpan[]): void {
 console.group(`🔍 Trace: ${spans[0]?.traceId}`)

 spans.forEach((span) => {
  const duration = span.duration ? ` ${span.duration}ms` : ''
  const status = span.status === SpanStatus.SUCCESS ? '✅' : span.status === SpanStatus.ERROR ? '❌' : '⏳'

  console.group(`${status} ${span.name}${duration}`)
  console.info('Start:', new Date(span.startTime).toISOString())

  if (span.tags.length > 0) {
   console.info('Tags:', span.tags)
  }

  if (span.logs.length > 0) {
   console.info('Logs:', span.logs)
  }

  if (span.error) {
   console.error('Error:', span.error)
  }

  console.groupEnd()
 })

 console.groupEnd()
}
