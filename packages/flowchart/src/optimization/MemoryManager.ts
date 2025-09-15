/**
 * 内存管理器
 * 
 * 负责内存使用监控、垃圾回收、内存泄漏检测和自动清理
 */

import { EventEmitter } from 'events'
import type {
  IMemoryManager,
  MemoryUsage,
  MemoryLeakDetection,
  MemoryManagerConfig
} from './types'

/**
 * 内存管理器实现
 */
export class MemoryManager extends EventEmitter implements IMemoryManager {
  private config: MemoryManagerConfig
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private objectRegistry: WeakMap<object, string> = new WeakMap()
  private eventListeners: Map<string, Set<Function>> = new Map()
  private timers: Set<NodeJS.Timeout> = new Set()
  private cleanupInterval?: NodeJS.Timeout
  private leakDetectionInterval?: NodeJS.Timeout

  constructor(config: MemoryManagerConfig) {
    super()
    this.config = {
      enabled: true,
      memoryThreshold: 80,
      gcInterval: 30000,
      autoCleanup: true,
      cache: {
        maxSize: 100,
        ttl: 300000,
        strategy: 'lru'
      },
      leakDetection: {
        enabled: true,
        interval: 60000,
        threshold: 10
      },
      ...config
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化内存管理器
   */
  private initialize(): void {
    // 启动定期清理
    if (this.config.autoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, this.config.gcInterval)
    }

    // 启动内存泄漏检测
    if (this.config.leakDetection.enabled) {
      this.leakDetectionInterval = setInterval(() => {
        this.detectLeaks()
      }, this.config.leakDetection.interval)
    }

    // 监听内存压力事件
    this.setupMemoryPressureHandling()

    console.log('内存管理器已初始化')
    this.emit('initialized', { timestamp: Date.now() })
  }

  /**
   * 获取内存使用情况
   */
  getUsage(): MemoryUsage {
    const memory = (performance as any).memory
    const usage: MemoryUsage = {
      used: 0,
      total: 0,
      percentage: 0,
      heap: {
        used: 0,
        total: 0,
        limit: 0
      },
      objects: {
        nodes: document.querySelectorAll('*').length,
        edges: document.querySelectorAll('svg line, svg path').length,
        listeners: this.getEventListenerCount(),
        timers: this.timers.size
      }
    }

    if (memory) {
      usage.used = memory.usedJSHeapSize
      usage.total = memory.totalJSHeapSize
      usage.percentage = (usage.used / usage.total) * 100
      usage.heap = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    } else {
      // 估算内存使用
      const estimatedUsed = this.estimateMemoryUsage()
      const estimatedTotal = estimatedUsed * 1.5
      usage.used = estimatedUsed
      usage.total = estimatedTotal
      usage.percentage = (estimatedUsed / estimatedTotal) * 100
    }

    return usage
  }

  /**
   * 执行内存清理
   */
  async cleanup(): Promise<void> {
    console.log('开始内存清理...')
    const startTime = Date.now()
    let cleanedItems = 0

    try {
      // 清理过期缓存
      cleanedItems += this.cleanupCache()

      // 清理无效的事件监听器
      cleanedItems += this.cleanupEventListeners()

      // 清理过期的定时器
      cleanedItems += this.cleanupTimers()

      // 清理DOM引用
      cleanedItems += this.cleanupDOMReferences()

      // 触发垃圾回收（如果可用）
      this.triggerGarbageCollection()

      const duration = Date.now() - startTime
      console.log(`内存清理完成，清理了 ${cleanedItems} 个项目，耗时 ${duration}ms`)

      this.emit('cleanupCompleted', {
        cleanedItems,
        duration,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('内存清理失败:', error)
      this.emit('cleanupFailed', { error, timestamp: Date.now() })
    }
  }

  /**
   * 检测内存泄漏
   */
  async detectLeaks(): Promise<MemoryLeakDetection> {
    console.log('开始内存泄漏检测...')
    const detection: MemoryLeakDetection = {
      hasLeak: false,
      leakTypes: [],
      recommendations: [],
      timestamp: Date.now()
    }

    try {
      // 检测DOM泄漏
      const domLeaks = this.detectDOMLeaks()
      if (domLeaks.count > 0) {
        detection.leakTypes.push(domLeaks)
        detection.hasLeak = true
      }

      // 检测事件监听器泄漏
      const eventLeaks = this.detectEventListenerLeaks()
      if (eventLeaks.count > 0) {
        detection.leakTypes.push(eventLeaks)
        detection.hasLeak = true
      }

      // 检测定时器泄漏
      const timerLeaks = this.detectTimerLeaks()
      if (timerLeaks.count > 0) {
        detection.leakTypes.push(timerLeaks)
        detection.hasLeak = true
      }

      // 检测闭包泄漏
      const closureLeaks = this.detectClosureLeaks()
      if (closureLeaks.count > 0) {
        detection.leakTypes.push(closureLeaks)
        detection.hasLeak = true
      }

      // 检测缓存泄漏
      const cacheLeaks = this.detectCacheLeaks()
      if (cacheLeaks.count > 0) {
        detection.leakTypes.push(cacheLeaks)
        detection.hasLeak = true
      }

      // 生成建议
      detection.recommendations = this.generateLeakRecommendations(detection.leakTypes)

      console.log('内存泄漏检测完成:', detection)
      this.emit('leakDetectionCompleted', detection)
    } catch (error) {
      console.error('内存泄漏检测失败:', error)
      this.emit('leakDetectionFailed', { error, timestamp: Date.now() })
    }

    return detection
  }

  /**
   * 优化内存使用
   */
  async optimize(): Promise<void> {
    console.log('开始内存优化...')
    const startTime = Date.now()

    try {
      // 执行清理
      await this.cleanup()

      // 检测并修复泄漏
      const leaks = await this.detectLeaks()
      if (leaks.hasLeak) {
        await this.fixLeaks(leaks)
      }

      // 优化缓存策略
      this.optimizeCache()

      // 压缩数据结构
      this.compressDataStructures()

      const duration = Date.now() - startTime
      console.log(`内存优化完成，耗时 ${duration}ms`)

      this.emit('optimizationCompleted', {
        duration,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('内存优化失败:', error)
      this.emit('optimizationFailed', { error, timestamp: Date.now() })
    }
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): number {
    let cleanedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    // 如果缓存超过最大大小，清理最旧的项目
    if (this.cache.size > this.config.cache.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, this.cache.size - this.config.cache.maxSize)
      toRemove.forEach(([key]) => {
        this.cache.delete(key)
        cleanedCount++
      })
    }

    return cleanedCount
  }

  /**
   * 清理事件监听器
   */
  private cleanupEventListeners(): number {
    let cleanedCount = 0

    for (const [event, listeners] of this.eventListeners.entries()) {
      const validListeners = new Set<Function>()
      
      for (const listener of listeners) {
        // 检查监听器是否仍然有效
        if (this.isValidEventListener(listener)) {
          validListeners.add(listener)
        } else {
          cleanedCount++
        }
      }

      if (validListeners.size === 0) {
        this.eventListeners.delete(event)
      } else {
        this.eventListeners.set(event, validListeners)
      }
    }

    return cleanedCount
  }

  /**
   * 清理定时器
   */
  private cleanupTimers(): number {
    let cleanedCount = 0

    for (const timer of this.timers) {
      try {
        clearTimeout(timer)
        this.timers.delete(timer)
        cleanedCount++
      } catch (error) {
        // 定时器可能已经被清理
      }
    }

    return cleanedCount
  }

  /**
   * 清理DOM引用
   */
  private cleanupDOMReferences(): number {
    let cleanedCount = 0

    // 清理已删除的DOM节点引用
    const allElements = document.querySelectorAll('*')
    const validElements = new Set(allElements)

    // 这里应该清理对已删除DOM节点的引用
    // 实际实现中需要维护DOM节点的引用列表

    return cleanedCount
  }

  /**
   * 触发垃圾回收
   */
  private triggerGarbageCollection(): void {
    // 在支持的环境中触发垃圾回收
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  /**
   * 检测DOM泄漏
   */
  private detectDOMLeaks() {
    const detachedNodes = this.findDetachedNodes()
    return {
      type: 'dom' as const,
      count: detachedNodes.length,
      description: `检测到 ${detachedNodes.length} 个分离的DOM节点`,
      severity: detachedNodes.length > 10 ? 'high' as const : 'medium' as const
    }
  }

  /**
   * 检测事件监听器泄漏
   */
  private detectEventListenerLeaks() {
    const totalListeners = this.getEventListenerCount()
    const threshold = this.config.leakDetection.threshold * 10
    
    return {
      type: 'event' as const,
      count: Math.max(0, totalListeners - threshold),
      description: `事件监听器数量过多: ${totalListeners}`,
      severity: totalListeners > threshold * 2 ? 'high' as const : 'medium' as const
    }
  }

  /**
   * 检测定时器泄漏
   */
  private detectTimerLeaks() {
    const timerCount = this.timers.size
    const threshold = this.config.leakDetection.threshold
    
    return {
      type: 'timer' as const,
      count: Math.max(0, timerCount - threshold),
      description: `活跃定时器过多: ${timerCount}`,
      severity: timerCount > threshold * 2 ? 'high' as const : 'medium' as const
    }
  }

  /**
   * 检测闭包泄漏
   */
  private detectClosureLeaks() {
    // 简化的闭包泄漏检测
    const functionCount = this.getFunctionCount()
    const threshold = 1000
    
    return {
      type: 'closure' as const,
      count: Math.max(0, functionCount - threshold),
      description: `函数对象过多，可能存在闭包泄漏: ${functionCount}`,
      severity: functionCount > threshold * 2 ? 'medium' as const : 'low' as const
    }
  }

  /**
   * 检测缓存泄漏
   */
  private detectCacheLeaks() {
    const cacheSize = this.cache.size
    const threshold = this.config.cache.maxSize
    
    return {
      type: 'cache' as const,
      count: Math.max(0, cacheSize - threshold),
      description: `缓存大小超过阈值: ${cacheSize}`,
      severity: cacheSize > threshold * 1.5 ? 'medium' as const : 'low' as const
    }
  }

  /**
   * 生成泄漏修复建议
   */
  private generateLeakRecommendations(leakTypes: any[]): string[] {
    const recommendations: string[] = []

    leakTypes.forEach(leak => {
      switch (leak.type) {
        case 'dom':
          recommendations.push('清理分离的DOM节点引用')
          recommendations.push('使用WeakMap存储DOM节点相关数据')
          break
        case 'event':
          recommendations.push('及时移除不需要的事件监听器')
          recommendations.push('使用AbortController管理事件监听器')
          break
        case 'timer':
          recommendations.push('清理不需要的定时器')
          recommendations.push('使用clearTimeout/clearInterval清理定时器')
          break
        case 'closure':
          recommendations.push('避免创建不必要的闭包')
          recommendations.push('及时释放闭包中的大对象引用')
          break
        case 'cache':
          recommendations.push('实施更严格的缓存清理策略')
          recommendations.push('减少缓存大小或TTL时间')
          break
      }
    })

    return [...new Set(recommendations)]
  }

  /**
   * 修复内存泄漏
   */
  private async fixLeaks(detection: MemoryLeakDetection): Promise<void> {
    for (const leak of detection.leakTypes) {
      switch (leak.type) {
        case 'dom':
          this.fixDOMLeaks()
          break
        case 'event':
          this.fixEventListenerLeaks()
          break
        case 'timer':
          this.fixTimerLeaks()
          break
        case 'cache':
          this.fixCacheLeaks()
          break
      }
    }
  }

  /**
   * 修复DOM泄漏
   */
  private fixDOMLeaks(): void {
    // 清理分离的DOM节点引用
    const detachedNodes = this.findDetachedNodes()
    detachedNodes.forEach(node => {
      // 清理与该节点相关的引用
      this.objectRegistry.delete(node)
    })
  }

  /**
   * 修复事件监听器泄漏
   */
  private fixEventListenerLeaks(): void {
    // 清理无效的事件监听器
    this.cleanupEventListeners()
  }

  /**
   * 修复定时器泄漏
   */
  private fixTimerLeaks(): void {
    // 清理所有定时器
    this.cleanupTimers()
  }

  /**
   * 修复缓存泄漏
   */
  private fixCacheLeaks(): void {
    // 强制清理缓存
    const targetSize = Math.floor(this.config.cache.maxSize * 0.7)
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, this.cache.size - targetSize)
    toRemove.forEach(([key]) => {
      this.cache.delete(key)
    })
  }

  /**
   * 优化缓存策略
   */
  private optimizeCache(): void {
    // 根据使用频率优化缓存
    const entries = Array.from(this.cache.entries())
    
    // 实施LRU策略
    if (this.config.cache.strategy === 'lru') {
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
      const keepCount = Math.floor(this.config.cache.maxSize * 0.8)
      
      this.cache.clear()
      entries.slice(0, keepCount).forEach(([key, value]) => {
        this.cache.set(key, value)
      })
    }
  }

  /**
   * 压缩数据结构
   */
  private compressDataStructures(): void {
    // 压缩大型数据结构
    // 这里可以实现具体的数据压缩逻辑
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): number {
    const domNodes = document.querySelectorAll('*').length
    const eventListeners = this.getEventListenerCount()
    const cacheSize = this.cache.size
    
    return (domNodes * 1000) + (eventListeners * 500) + (cacheSize * 2000) + 10000000
  }

  /**
   * 获取事件监听器数量
   */
  private getEventListenerCount(): number {
    let count = 0
    for (const listeners of this.eventListeners.values()) {
      count += listeners.size
    }
    return count + document.querySelectorAll('[onclick], [onchange], [onsubmit]').length
  }

  /**
   * 查找分离的DOM节点
   */
  private findDetachedNodes(): Element[] {
    // 简化的分离节点检测
    const detached: Element[] = []
    
    // 实际实现中需要更复杂的检测逻辑
    // 这里只是示例
    
    return detached
  }

  /**
   * 检查事件监听器是否有效
   */
  private isValidEventListener(listener: Function): boolean {
    // 简化的有效性检查
    return typeof listener === 'function'
  }

  /**
   * 获取函数对象数量
   */
  private getFunctionCount(): number {
    // 简化的函数计数
    return 500 // 默认值
  }

  /**
   * 设置内存压力处理
   */
  private setupMemoryPressureHandling(): void {
    // 监听内存压力事件（如果支持）
    if ('memory' in performance && 'addEventListener' in performance.memory) {
      (performance.memory as any).addEventListener('memorypressure', () => {
        console.log('检测到内存压力，执行紧急清理')
        this.cleanup()
      })
    }
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    if (this.leakDetectionInterval) {
      clearInterval(this.leakDetectionInterval)
    }

    this.cache.clear()
    this.eventListeners.clear()
    this.timers.clear()

    console.log('内存管理器已销毁')
    this.emit('destroyed', { timestamp: Date.now() })
  }
}
