/**
 * 追踪Span管理模块
 * 
 * 提供Span的创建、管理和操作功能
 */

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
  /** 中间件 */
  MIDDLEWARE = 'middleware',
  /** 服务调用 */
  SERVICE = 'service',
  /** 消息队列 */
  MESSAGE = 'message',
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
  /** 超时 */
  TIMEOUT = 'timeout',
  /** 警告 */
  WARNING = 'warning',
}

/**
 * 追踪标签
 */
export interface TraceTag {
  key: string
  value: string | number | boolean
}

/**
 * 追踪日志
 */
export interface TraceLog {
  timestamp: number
  level?: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
}

/**
 * 追踪事件
 */
export interface TraceEvent {
  name: string
  timestamp: number
  attributes?: Record<string, any>
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
  logs: TraceLog[]
  /** 事件 */
  events?: TraceEvent[]
  /** 错误信息 */
  error?: { 
    message: string
    stack?: string
    code?: string | number
    type?: string
  }
  /** 属性 */
  attributes?: Record<string, any>
  /** 子Span ID列表 */
  childSpanIds?: string[]
}

/**
 * Span构建器
 */
export class SpanBuilder {
  private span: TraceSpan

  constructor(traceId: string, name: string, type: SpanType = SpanType.CUSTOM) {
    this.span = {
      spanId: this.generateSpanId(),
      traceId,
      name,
      type,
      startTime: Date.now(),
      status: SpanStatus.PENDING,
      tags: [],
      logs: [],
      events: [],
      childSpanIds: [],
    }
  }

  /**
   * 设置父Span
   */
  setParent(parentSpanId: string): this {
    this.span.parentSpanId = parentSpanId
    return this
  }

  /**
   * 设置类型
   */
  setType(type: SpanType): this {
    this.span.type = type
    return this
  }

  /**
   * 添加标签
   */
  addTag(key: string, value: string | number | boolean): this {
    this.span.tags.push({ key, value })
    return this
  }

  /**
   * 批量添加标签
   */
  addTags(tags: Record<string, string | number | boolean>): this {
    Object.entries(tags).forEach(([key, value]) => {
      this.addTag(key, value)
    })
    return this
  }

  /**
   * 设置属性
   */
  setAttribute(key: string, value: any): this {
    if (!this.span.attributes) {
      this.span.attributes = {}
    }
    this.span.attributes[key] = value
    return this
  }

  /**
   * 批量设置属性
   */
  setAttributes(attributes: Record<string, any>): this {
    if (!this.span.attributes) {
      this.span.attributes = {}
    }
    Object.assign(this.span.attributes, attributes)
    return this
  }

  /**
   * 构建Span
   */
  build(): TraceSpan {
    return { ...this.span }
  }

  private generateSpanId(): string {
    return `span-${generateId()}`
  }
}

/**
 * Span操作器
 */
export class SpanOperator {
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
  addLog(message: string, data?: any, level: TraceLog['level'] = 'info'): this {
    this.span.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    })
    return this
  }

  /**
   * 添加事件
   */
  addEvent(name: string, attributes?: Record<string, any>): this {
    if (!this.span.events) {
      this.span.events = []
    }
    this.span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    })
    return this
  }

  /**
   * 设置错误
   */
  setError(error: Error | string | { message: string; code?: string | number; type?: string }): this {
    this.span.status = SpanStatus.ERROR
    
    if (typeof error === 'string') {
      this.span.error = { message: error }
    } else if (error instanceof Error) {
      this.span.error = {
        message: error.message,
        stack: error.stack,
        type: error.name,
      }
    } else {
      this.span.error = error
    }
    
    return this
  }

  /**
   * 设置状态
   */
  setStatus(status: SpanStatus): this {
    this.span.status = status
    return this
  }

  /**
   * 结束Span
   */
  finish(status?: SpanStatus): void {
    const now = Date.now()
    this.span.endTime = now
    this.span.duration = now - this.span.startTime
    
    if (status !== undefined) {
      this.span.status = status
    } else if (this.span.status === SpanStatus.PENDING) {
      this.span.status = SpanStatus.SUCCESS
    }
  }

  /**
   * 获取Span数据
   */
  getSpan(): TraceSpan {
    return this.span
  }

  /**
   * 添加子Span ID
   */
  addChildSpanId(spanId: string): this {
    if (!this.span.childSpanIds) {
      this.span.childSpanIds = []
    }
    this.span.childSpanIds.push(spanId)
    return this
  }

  /**
   * 获取持续时间
   */
  getDuration(): number | undefined {
    if (this.span.duration !== undefined) {
      return this.span.duration
    }
    
    if (this.span.endTime) {
      return this.span.endTime - this.span.startTime
    }
    
    return Date.now() - this.span.startTime
  }

  /**
   * 是否已完成
   */
  isFinished(): boolean {
    return this.span.endTime !== undefined
  }

  /**
   * 是否有错误
   */
  hasError(): boolean {
    return this.span.status === SpanStatus.ERROR || this.span.error !== undefined
  }
}

/**
 * Span集合管理器
 */
export class SpanCollection {
  private spans: Map<string, TraceSpan> = new Map()
  private spansByTrace: Map<string, Set<string>> = new Map()
  private childToParent: Map<string, string> = new Map()

  /**
   * 添加Span
   */
  add(span: TraceSpan): void {
    this.spans.set(span.spanId, span)
    
    // 按trace ID分组
    if (!this.spansByTrace.has(span.traceId)) {
      this.spansByTrace.set(span.traceId, new Set())
    }
    this.spansByTrace.get(span.traceId)!.add(span.spanId)
    
    // 记录父子关系
    if (span.parentSpanId) {
      this.childToParent.set(span.spanId, span.parentSpanId)
    }
  }

  /**
   * 获取Span
   */
  get(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId)
  }

  /**
   * 获取trace的所有Spans
   */
  getByTraceId(traceId: string): TraceSpan[] {
    const spanIds = this.spansByTrace.get(traceId)
    if (!spanIds) {
      return []
    }
    
    return Array.from(spanIds)
      .map(id => this.spans.get(id))
      .filter((span): span is TraceSpan => span !== undefined)
  }

  /**
   * 获取根Spans
   */
  getRootSpans(traceId: string): TraceSpan[] {
    return this.getByTraceId(traceId).filter(span => !span.parentSpanId)
  }

  /**
   * 获取子Spans
   */
  getChildSpans(parentSpanId: string): TraceSpan[] {
    const children: TraceSpan[] = []
    
    this.spans.forEach(span => {
      if (span.parentSpanId === parentSpanId) {
        children.push(span)
      }
    })
    
    return children
  }

  /**
   * 获取Span路径（从根到当前Span）
   */
  getSpanPath(spanId: string): TraceSpan[] {
    const path: TraceSpan[] = []
    let currentId: string | undefined = spanId
    
    while (currentId) {
      const span = this.spans.get(currentId)
      if (span) {
        path.unshift(span)
        currentId = span.parentSpanId
      } else {
        break
      }
    }
    
    return path
  }

  /**
   * 删除Span
   */
  remove(spanId: string): boolean {
    const span = this.spans.get(spanId)
    if (!span) {
      return false
    }
    
    this.spans.delete(spanId)
    this.spansByTrace.get(span.traceId)?.delete(spanId)
    this.childToParent.delete(spanId)
    
    return true
  }

  /**
   * 删除trace的所有Spans
   */
  removeByTraceId(traceId: string): number {
    const spanIds = this.spansByTrace.get(traceId)
    if (!spanIds) {
      return 0
    }
    
    let count = 0
    spanIds.forEach(spanId => {
      if (this.remove(spanId)) {
        count++
      }
    })
    
    this.spansByTrace.delete(traceId)
    
    return count
  }

  /**
   * 清空所有Spans
   */
  clear(): void {
    this.spans.clear()
    this.spansByTrace.clear()
    this.childToParent.clear()
  }

  /**
   * 获取大小
   */
  size(): number {
    return this.spans.size
  }

  /**
   * 获取trace数量
   */
  traceCount(): number {
    return this.spansByTrace.size
  }

  /**
   * 构建Span树
   */
  buildSpanTree(traceId: string): SpanTreeNode[] {
    const spans = this.getByTraceId(traceId)
    const roots = spans.filter(span => !span.parentSpanId)
    
    return roots.map(root => this.buildTreeNode(root, spans))
  }

  private buildTreeNode(span: TraceSpan, allSpans: TraceSpan[]): SpanTreeNode {
    const children = allSpans
      .filter(s => s.parentSpanId === span.spanId)
      .map(child => this.buildTreeNode(child, allSpans))
    
    return {
      span,
      children,
    }
  }
}

/**
 * Span树节点
 */
export interface SpanTreeNode {
  span: TraceSpan
  children: SpanTreeNode[]
}

/**
 * 创建Span构建器
 */
export function createSpanBuilder(
  traceId: string,
  name: string,
  type: SpanType = SpanType.CUSTOM,
): SpanBuilder {
  return new SpanBuilder(traceId, name, type)
}

/**
 * 创建Span操作器
 */
export function createSpanOperator(span: TraceSpan): SpanOperator {
  return new SpanOperator(span)
}

/**
 * 创建Span集合
 */
export function createSpanCollection(): SpanCollection {
  return new SpanCollection()
}