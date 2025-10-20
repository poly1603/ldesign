/**
 * 内存泄漏检测工具
 */

import { onBeforeUnmount, onUnmounted, type Ref } from 'vue'

export interface LeakDetectorOptions {
  threshold?: number // 内存增长阈值（MB）
  interval?: number  // 检测间隔（ms）
  onLeak?: (info: LeakInfo) => void
}

export interface LeakInfo {
  type: 'memory' | 'dom' | 'listener' | 'timer'
  description: string
  value?: number
  details?: any
}

/**
 * 内存泄漏检测器
 */
export class MemoryLeakDetector {
  private listeners = new WeakMap<object, Set<{ element: EventTarget; type: string; handler: EventListener }>>()
  private timers = new Set<number>()
  private intervals = new Set<number>()
  private animationFrames = new Set<number>()
  private observers = new Set<MutationObserver | IntersectionObserver | ResizeObserver>()
  private memorySnapshots: number[] = []
  private checkInterval: number | null = null

  constructor(private options: LeakDetectorOptions = {}) {
    this.startMonitoring()
  }

  /**
   * 开始监控
   */
  private startMonitoring() {
    const interval = this.options.interval || 5000
    
    this.checkInterval = window.setInterval(() => {
      this.checkMemoryGrowth()
      this.checkDOMLeaks()
    }, interval)
  }

  /**
   * 检查内存增长
   */
  private checkMemoryGrowth() {
    if (!('memory' in performance)) return

    const memory = (performance as any).memory
    const currentMemory = memory.usedJSHeapSize / 1024 / 1024 // MB

    this.memorySnapshots.push(currentMemory)
    
    // 保留最近10次快照
    if (this.memorySnapshots.length > 10) {
      this.memorySnapshots.shift()
    }

    // 检查内存增长趋势
    if (this.memorySnapshots.length >= 5) {
      const recent = this.memorySnapshots.slice(-5)
      const avgGrowth = recent.reduce((sum, val, i) => {
        if (i === 0) return sum
        return sum + (val - recent[i - 1])
      }, 0) / (recent.length - 1)

      const threshold = this.options.threshold || 10
      if (avgGrowth > threshold) {
        this.options.onLeak?.({
          type: 'memory',
          description: `内存持续增长，平均每次增长 ${avgGrowth.toFixed(2)} MB`,
          value: currentMemory
        })
      }
    }
  }

  /**
   * 检查 DOM 泄漏
   */
  private checkDOMLeaks() {
    // 检查分离的 DOM 节点
    const allNodes = document.querySelectorAll('*')
    let detachedCount = 0

    allNodes.forEach(node => {
      if (!document.body.contains(node) && node.isConnected) {
        detachedCount++
      }
    })

    if (detachedCount > 100) {
      this.options.onLeak?.({
        type: 'dom',
        description: `发现 ${detachedCount} 个分离的 DOM 节点`,
        value: detachedCount
      })
    }
  }

  /**
   * 追踪事件监听器
   */
  trackEventListener(
    element: EventTarget,
    type: string,
    handler: EventListener,
    component?: object
  ): () => void {
    const key = component || element
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    const set = this.listeners.get(key)!
    set.add({ element, type, handler })

    // 返回清理函数
    return () => {
      element.removeEventListener(type, handler)
      set.delete({ element, type, handler })
      if (set.size === 0) {
        this.listeners.delete(key)
      }
    }
  }

  /**
   * 追踪定时器
   */
  trackTimer(id: number, type: 'timeout' | 'interval'): void {
    if (type === 'timeout') {
      this.timers.add(id)
    } else {
      this.intervals.add(id)
    }
  }

  /**
   * 清理定时器
   */
  clearTimer(id: number, type: 'timeout' | 'interval'): void {
    if (type === 'timeout') {
      clearTimeout(id)
      this.timers.delete(id)
    } else {
      clearInterval(id)
      this.intervals.delete(id)
    }
  }

  /**
   * 追踪动画帧
   */
  trackAnimationFrame(id: number): void {
    this.animationFrames.add(id)
  }

  /**
   * 清理动画帧
   */
  clearAnimationFrame(id: number): void {
    cancelAnimationFrame(id)
    this.animationFrames.delete(id)
  }

  /**
   * 追踪观察者
   */
  trackObserver(observer: MutationObserver | IntersectionObserver | ResizeObserver): void {
    this.observers.add(observer)
  }

  /**
   * 清理观察者
   */
  clearObserver(observer: MutationObserver | IntersectionObserver | ResizeObserver): void {
    observer.disconnect()
    this.observers.delete(observer)
  }

  /**
   * 清理所有追踪的资源
   */
  cleanup() {
    // 清理定时器
    this.timers.forEach(id => clearTimeout(id))
    this.intervals.forEach(id => clearInterval(id))
    this.animationFrames.forEach(id => cancelAnimationFrame(id))
    
    // 清理观察者
    this.observers.forEach(observer => observer.disconnect())
    
    // 清理监听器
    this.listeners = new WeakMap()
    
    // 清理监控
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    // 清空集合
    this.timers.clear()
    this.intervals.clear()
    this.animationFrames.clear()
    this.observers.clear()
    this.memorySnapshots = []
  }

  /**
   * 生成泄漏报告
   */
  generateReport() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      animationFrames: this.animationFrames.size,
      observers: this.observers.size,
      memory: this.memorySnapshots[this.memorySnapshots.length - 1] || 0,
      memoryTrend: this.memorySnapshots
    }
  }
}

/**
 * 全局检测器实例
 */
let globalDetector: MemoryLeakDetector | null = null

/**
 * 获取全局检测器
 */
export function getLeakDetector(): MemoryLeakDetector {
  if (!globalDetector) {
    globalDetector = new MemoryLeakDetector({
      onLeak: (info) => {
        console.warn(`[MemoryLeak] ${info.description}`, info)
      }
    })
  }
  return globalDetector
}

/**
 * 使用内存泄漏检测
 */
export function useMemoryLeakDetection(options: LeakDetectorOptions = {}) {
  const detector = new MemoryLeakDetector(options)

  onBeforeUnmount(() => {
    detector.cleanup()
  })

  return {
    trackEventListener: detector.trackEventListener.bind(detector),
    trackTimer: detector.trackTimer.bind(detector),
    clearTimer: detector.clearTimer.bind(detector),
    trackAnimationFrame: detector.trackAnimationFrame.bind(detector),
    clearAnimationFrame: detector.clearAnimationFrame.bind(detector),
    trackObserver: detector.trackObserver.bind(detector),
    clearObserver: detector.clearObserver.bind(detector),
    generateReport: detector.generateReport.bind(detector),
    cleanup: detector.cleanup.bind(detector)
  }
}

/**
 * 安全的 setTimeout 包装
 */
export function safeSetTimeout(
  handler: TimerHandler,
  timeout?: number,
  ...args: any[]
): number {
  const id = setTimeout(handler, timeout, ...args)
  getLeakDetector().trackTimer(id, 'timeout')
  return id
}

/**
 * 安全的 setInterval 包装
 */
export function safeSetInterval(
  handler: TimerHandler,
  timeout?: number,
  ...args: any[]
): number {
  const id = setInterval(handler, timeout, ...args)
  getLeakDetector().trackTimer(id, 'interval')
  return id
}

/**
 * 安全的 requestAnimationFrame 包装
 */
export function safeRequestAnimationFrame(callback: FrameRequestCallback): number {
  const id = requestAnimationFrame(callback)
  getLeakDetector().trackAnimationFrame(id)
  return id
}

/**
 * 自动清理的事件监听器
 */
export function useAutoCleanupListener(
  target: Ref<EventTarget | null> | EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
) {
  const cleanup: (() => void)[] = []

  const addEventListener = () => {
    const element = 'value' in target ? target.value : target
    if (!element) return

    element.addEventListener(event, handler, options)
    cleanup.push(() => element.removeEventListener(event, handler))
  }

  addEventListener()

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

  return {
    cleanup: () => cleanup.forEach(fn => fn())
  }
}