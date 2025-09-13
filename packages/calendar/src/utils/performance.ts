/**
 * 性能工具函数
 * 
 * 提供性能监控和优化相关的工具函数：
 * - 性能计时
 * - 内存监控
 * - 渲染优化
 * - 事件优化
 * - 缓存管理
 */

/**
 * 性能计时器
 */
export class PerformanceTimer {
  private timers: Map<string, number> = new Map()
  private marks: Map<string, number> = new Map()

  /**
   * 开始计时
   * @param name 计时器名称
   */
  start(name: string): void {
    this.timers.set(name, performance.now())
  }

  /**
   * 结束计时并返回耗时
   * @param name 计时器名称
   */
  end(name: string): number {
    const startTime = this.timers.get(name)
    if (startTime === undefined) {
      console.warn(`Timer "${name}" not found`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - startTime
    this.timers.delete(name)
    return duration
  }

  /**
   * 标记时间点
   * @param name 标记名称
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量两个标记之间的时间
   * @param startMark 开始标记
   * @param endMark 结束标记
   */
  measure(startMark: string, endMark: string): number {
    const startTime = this.marks.get(startMark)
    const endTime = this.marks.get(endMark)

    if (startTime === undefined || endTime === undefined) {
      console.warn(`Mark "${startMark}" or "${endMark}" not found`)
      return 0
    }

    return endTime - startTime
  }

  /**
   * 清除所有计时器和标记
   */
  clear(): void {
    this.timers.clear()
    this.marks.clear()
  }
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  /**
   * 获取内存使用信息
   */
  static getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory
    }
    return null
  }

  /**
   * 格式化内存大小
   * @param bytes 字节数
   */
  static formatMemorySize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 监控内存使用情况
   * @param interval 监控间隔（毫秒）
   * @param callback 回调函数
   */
  static monitor(interval: number, callback: (usage: any) => void): () => void {
    const intervalId = setInterval(() => {
      const usage = this.getMemoryUsage()
      if (usage) {
        callback(usage)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }
}

/**
 * 渲染优化器
 */
export class RenderOptimizer {
  private static rafId: number | null = null
  private static pendingCallbacks: (() => void)[] = []

  /**
   * 在下一帧执行回调
   * @param callback 回调函数
   */
  static nextFrame(callback: () => void): void {
    this.pendingCallbacks.push(callback)

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        const callbacks = [...this.pendingCallbacks]
        this.pendingCallbacks = []
        this.rafId = null

        callbacks.forEach(cb => {
          try {
            cb()
          } catch (error) {
            console.error('Render callback error:', error)
          }
        })
      })
    }
  }

  /**
   * 批量DOM更新
   * @param updates DOM更新函数数组
   */
  static batchDOMUpdates(updates: (() => void)[]): void {
    this.nextFrame(() => {
      updates.forEach(update => {
        try {
          update()
        } catch (error) {
          console.error('DOM update error:', error)
        }
      })
    })
  }

  /**
   * 虚拟滚动优化
   * @param container 容器元素
   * @param items 数据项
   * @param itemHeight 项目高度
   * @param renderItem 渲染函数
   */
  static virtualScroll<T>(
    container: HTMLElement,
    items: T[],
    itemHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ): void {
    const containerHeight = container.clientHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
    let scrollTop = 0

    const updateVisibleItems = () => {
      const startIndex = Math.floor(scrollTop / itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, items.length)

      // 清空容器
      container.innerHTML = ''

      // 创建占位元素
      const spacerTop = document.createElement('div')
      spacerTop.style.height = `${startIndex * itemHeight}px`
      container.appendChild(spacerTop)

      // 渲染可见项
      for (let i = startIndex; i < endIndex; i++) {
        const element = renderItem(items[i], i)
        container.appendChild(element)
      }

      // 创建底部占位元素
      const spacerBottom = document.createElement('div')
      spacerBottom.style.height = `${(items.length - endIndex) * itemHeight}px`
      container.appendChild(spacerBottom)
    }

    // 监听滚动事件
    container.addEventListener('scroll', () => {
      scrollTop = container.scrollTop
      this.nextFrame(updateVisibleItems)
    })

    // 初始渲染
    updateVisibleItems()
  }
}

/**
 * 缓存管理器
 */
export class CacheManager<T = any> {
  private cache: Map<string, { value: T; timestamp: number; ttl?: number }> = new Map()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 生存时间（毫秒）
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  /**
   * 获取缓存
   * @param key 键
   */
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * 删除缓存
   * @param key 键
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 驱逐最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * 事件优化器
 */
export class EventOptimizer {
  /**
   * 创建防抖事件处理器
   * @param handler 事件处理器
   * @param delay 延迟时间
   */
  static debounce<T extends Event>(
    handler: (event: T) => void,
    delay: number
  ): (event: T) => void {
    let timeoutId: number | undefined

    return (event: T) => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => handler(event), delay)
    }
  }

  /**
   * 创建节流事件处理器
   * @param handler 事件处理器
   * @param delay 延迟时间
   */
  static throttle<T extends Event>(
    handler: (event: T) => void,
    delay: number
  ): (event: T) => void {
    let lastCall = 0

    return (event: T) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        handler(event)
      }
    }
  }

  /**
   * 创建被动事件监听器
   * @param element 目标元素
   * @param event 事件名称
   * @param handler 事件处理器
   */
  static addPassiveListener<T extends Event>(
    element: Element,
    event: string,
    handler: (event: T) => void
  ): void {
    element.addEventListener(event, handler as EventListener, { passive: true })
  }
}

// 创建全局实例
export const performanceTimer = new PerformanceTimer()
export const cacheManager = new CacheManager()

// 导出便捷函数
export const nextFrame = RenderOptimizer.nextFrame.bind(RenderOptimizer)
export const batchDOMUpdates = RenderOptimizer.batchDOMUpdates.bind(RenderOptimizer)
export const debounceEvent = EventOptimizer.debounce.bind(EventOptimizer)
export const throttleEvent = EventOptimizer.throttle.bind(EventOptimizer)
