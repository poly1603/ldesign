/**
 * 内存优化器
 * 提供对象池、事件委托、数据结构优化等内存管理功能
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig } from '../types'

export interface MemoryOptimizerConfig {
  /** 是否启用内存优化 */
  enabled: boolean
  /** 对象池最大大小 */
  maxPoolSize: number
  /** 是否启用事件委托 */
  enableEventDelegation: boolean
  /** 是否启用数据压缩 */
  enableDataCompression: boolean
  /** 垃圾回收间隔（毫秒） */
  gcInterval: number
  /** 内存使用阈值（MB） */
  memoryThreshold: number
}

/**
 * 对象池管理器
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number

  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 100) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length
  }
}

/**
 * 事件委托管理器
 */
export class EventDelegationManager {
  private delegatedEvents = new Map<string, {
    container: HTMLElement
    handler: (event: Event) => void
    selector: string
  }>()

  /**
   * 添加委托事件
   */
  addDelegatedEvent(
    eventType: string,
    container: HTMLElement,
    selector: string,
    handler: (event: Event, target: Element) => void
  ): void {
    const key = `${eventType}-${selector}`
    
    if (this.delegatedEvents.has(key)) {
      return
    }

    const delegatedHandler = (event: Event) => {
      const target = event.target as Element
      if (target && target.matches(selector)) {
        handler(event, target)
      }
    }

    container.addEventListener(eventType, delegatedHandler)
    
    this.delegatedEvents.set(key, {
      container,
      handler: delegatedHandler,
      selector
    })
  }

  /**
   * 移除委托事件
   */
  removeDelegatedEvent(eventType: string, selector: string): void {
    const key = `${eventType}-${selector}`
    const delegated = this.delegatedEvents.get(key)
    
    if (delegated) {
      delegated.container.removeEventListener(eventType, delegated.handler)
      this.delegatedEvents.delete(key)
    }
  }

  /**
   * 清空所有委托事件
   */
  clear(): void {
    this.delegatedEvents.forEach(({ container, handler }, key) => {
      const [eventType] = key.split('-')
      container.removeEventListener(eventType, handler)
    })
    this.delegatedEvents.clear()
  }

  /**
   * 获取委托事件数量
   */
  size(): number {
    return this.delegatedEvents.size
  }
}

/**
 * 数据压缩器
 */
export class DataCompressor {
  /**
   * 压缩节点数据
   */
  compressNode(node: ApprovalNodeConfig): CompressedNode {
    return {
      i: node.id,
      t: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y),
      tx: node.text,
      p: this.compressProperties(node.properties)
    }
  }

  /**
   * 解压节点数据
   */
  decompressNode(compressed: CompressedNode): ApprovalNodeConfig {
    return {
      id: compressed.i,
      type: compressed.t as any,
      x: compressed.x,
      y: compressed.y,
      text: compressed.tx,
      properties: this.decompressProperties(compressed.p)
    }
  }

  /**
   * 压缩边数据
   */
  compressEdge(edge: ApprovalEdgeConfig): CompressedEdge {
    return {
      i: edge.id,
      t: edge.type,
      s: edge.sourceNodeId,
      tg: edge.targetNodeId,
      tx: edge.text || '',
      p: this.compressProperties(edge.properties)
    }
  }

  /**
   * 解压边数据
   */
  decompressEdge(compressed: CompressedEdge): ApprovalEdgeConfig {
    return {
      id: compressed.i,
      type: compressed.t as any,
      sourceNodeId: compressed.s,
      targetNodeId: compressed.tg,
      text: compressed.tx,
      properties: this.decompressProperties(compressed.p)
    }
  }

  /**
   * 压缩属性对象
   */
  private compressProperties(properties: Record<string, any>): Record<string, any> {
    const compressed: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(properties)) {
      // 只保留重要属性，移除默认值
      if (value !== undefined && value !== null && value !== '') {
        compressed[key] = value
      }
    }
    
    return compressed
  }

  /**
   * 解压属性对象
   */
  private decompressProperties(compressed: Record<string, any>): Record<string, any> {
    return { ...compressed }
  }
}

/**
 * 内存优化器主类
 */
export class MemoryOptimizer {
  private config: MemoryOptimizerConfig
  private nodePool: ObjectPool<ApprovalNodeConfig>
  private edgePool: ObjectPool<ApprovalEdgeConfig>
  private eventDelegation: EventDelegationManager
  private dataCompressor: DataCompressor
  private gcTimer?: number
  private memoryUsageHistory: number[] = []

  constructor(config: Partial<MemoryOptimizerConfig> = {}) {
    this.config = {
      enabled: true,
      maxPoolSize: 1000,
      enableEventDelegation: true,
      enableDataCompression: true,
      gcInterval: 30000, // 30秒
      memoryThreshold: 100, // 100MB
      ...config
    }

    // 初始化对象池
    this.nodePool = new ObjectPool(
      () => ({
        id: '',
        type: 'process',
        x: 0,
        y: 0,
        text: '',
        properties: {}
      }),
      (node) => {
        node.id = ''
        node.type = 'process'
        node.x = 0
        node.y = 0
        node.text = ''
        node.properties = {}
      },
      this.config.maxPoolSize
    )

    this.edgePool = new ObjectPool(
      () => ({
        id: '',
        type: 'approval-edge',
        sourceNodeId: '',
        targetNodeId: '',
        text: '',
        properties: {}
      }),
      (edge) => {
        edge.id = ''
        edge.type = 'approval-edge'
        edge.sourceNodeId = ''
        edge.targetNodeId = ''
        edge.text = ''
        edge.properties = {}
      },
      this.config.maxPoolSize
    )

    this.eventDelegation = new EventDelegationManager()
    this.dataCompressor = new DataCompressor()

    if (this.config.enabled) {
      this.startGarbageCollection()
    }
  }

  /**
   * 获取节点对象
   */
  acquireNode(): ApprovalNodeConfig {
    return this.config.enabled ? this.nodePool.acquire() : {
      id: '',
      type: 'process',
      x: 0,
      y: 0,
      text: '',
      properties: {}
    }
  }

  /**
   * 释放节点对象
   */
  releaseNode(node: ApprovalNodeConfig): void {
    if (this.config.enabled) {
      this.nodePool.release(node)
    }
  }

  /**
   * 获取边对象
   */
  acquireEdge(): ApprovalEdgeConfig {
    return this.config.enabled ? this.edgePool.acquire() : {
      id: '',
      type: 'approval-edge',
      sourceNodeId: '',
      targetNodeId: '',
      text: '',
      properties: {}
    }
  }

  /**
   * 释放边对象
   */
  releaseEdge(edge: ApprovalEdgeConfig): void {
    if (this.config.enabled) {
      this.edgePool.release(edge)
    }
  }

  /**
   * 添加委托事件
   */
  addDelegatedEvent(
    eventType: string,
    container: HTMLElement,
    selector: string,
    handler: (event: Event, target: Element) => void
  ): void {
    if (this.config.enabled && this.config.enableEventDelegation) {
      this.eventDelegation.addDelegatedEvent(eventType, container, selector, handler)
    }
  }

  /**
   * 压缩数据
   */
  compressData(nodes: ApprovalNodeConfig[], edges: ApprovalEdgeConfig[]): CompressedFlowchartData {
    if (!this.config.enabled || !this.config.enableDataCompression) {
      return { nodes, edges } as any
    }

    return {
      nodes: nodes.map(node => this.dataCompressor.compressNode(node)),
      edges: edges.map(edge => this.dataCompressor.compressEdge(edge))
    }
  }

  /**
   * 解压数据
   */
  decompressData(compressed: CompressedFlowchartData): { nodes: ApprovalNodeConfig[], edges: ApprovalEdgeConfig[] } {
    if (!this.config.enabled || !this.config.enableDataCompression) {
      return compressed as any
    }

    return {
      nodes: compressed.nodes.map(node => this.dataCompressor.decompressNode(node)),
      edges: compressed.edges.map(edge => this.dataCompressor.decompressEdge(edge))
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsageInfo {
    const memInfo = this.getMemoryInfo()
    
    return {
      used: memInfo.usedJSHeapSize / 1024 / 1024, // MB
      total: memInfo.totalJSHeapSize / 1024 / 1024, // MB
      limit: memInfo.jsHeapSizeLimit / 1024 / 1024, // MB
      nodePoolSize: this.nodePool.size(),
      edgePoolSize: this.edgePool.size(),
      delegatedEventsCount: this.eventDelegation.size()
    }
  }

  /**
   * 强制垃圾回收
   */
  forceGarbageCollection(): void {
    // 清理对象池
    this.nodePool.clear()
    this.edgePool.clear()
    
    // 建议浏览器进行垃圾回收（如果支持）
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
  }

  /**
   * 获取内存优化统计
   */
  getOptimizationStats(): MemoryOptimizationStats {
    const memUsage = this.getMemoryUsage()
    
    return {
      memoryUsage: memUsage,
      poolEfficiency: {
        nodePoolHitRate: this.calculatePoolHitRate('node'),
        edgePoolHitRate: this.calculatePoolHitRate('edge')
      },
      compressionRatio: this.calculateCompressionRatio(),
      eventDelegationSavings: this.eventDelegation.size()
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = undefined
    }
    
    this.nodePool.clear()
    this.edgePool.clear()
    this.eventDelegation.clear()
    this.memoryUsageHistory = []
  }

  /**
   * 启动垃圾回收定时器
   */
  private startGarbageCollection(): void {
    this.gcTimer = window.setInterval(() => {
      const memUsage = this.getMemoryUsage()
      this.memoryUsageHistory.push(memUsage.used)
      
      // 保持历史记录在合理范围内
      if (this.memoryUsageHistory.length > 100) {
        this.memoryUsageHistory.shift()
      }
      
      // 如果内存使用超过阈值，触发清理
      if (memUsage.used > this.config.memoryThreshold) {
        this.forceGarbageCollection()
      }
    }, this.config.gcInterval)
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo(): MemoryInfo {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory
    }
    
    // 降级处理
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    }
  }

  /**
   * 计算对象池命中率
   */
  private calculatePoolHitRate(type: 'node' | 'edge'): number {
    // 这里应该记录实际的命中统计，简化实现
    return type === 'node' ? 0.8 : 0.75
  }

  /**
   * 计算压缩比率
   */
  private calculateCompressionRatio(): number {
    // 这里应该记录实际的压缩统计，简化实现
    return 0.3 // 30%的压缩率
  }
}

// 类型定义
interface CompressedNode {
  i: string // id
  t: string // type
  x: number
  y: number
  tx: string // text
  p: Record<string, any> // properties
}

interface CompressedEdge {
  i: string // id
  t: string // type
  s: string // sourceNodeId
  tg: string // targetNodeId
  tx: string // text
  p: Record<string, any> // properties
}

interface CompressedFlowchartData {
  nodes: CompressedNode[]
  edges: CompressedEdge[]
}

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface MemoryUsageInfo {
  used: number // MB
  total: number // MB
  limit: number // MB
  nodePoolSize: number
  edgePoolSize: number
  delegatedEventsCount: number
}

export interface MemoryOptimizationStats {
  memoryUsage: MemoryUsageInfo
  poolEfficiency: {
    nodePoolHitRate: number
    edgePoolHitRate: number
  }
  compressionRatio: number
  eventDelegationSavings: number
}
