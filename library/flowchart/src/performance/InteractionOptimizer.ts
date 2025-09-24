/**
 * 交互性能优化器
 * 优化拖拽、缩放等高频操作，实现防抖节流、异步渲染和智能更新策略
 */

export interface InteractionOptimizerConfig {
  /** 是否启用交互优化 */
  enabled: boolean
  /** 防抖延迟时间（毫秒） */
  debounceDelay: number
  /** 节流间隔时间（毫秒） */
  throttleInterval: number
  /** 是否启用异步渲染 */
  enableAsyncRender: boolean
  /** 异步渲染批次大小 */
  asyncRenderBatchSize: number
  /** 是否启用智能更新 */
  enableSmartUpdate: boolean
  /** 更新区域检测阈值 */
  updateThreshold: number
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      func(...args)
      timeoutId = undefined
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCallTime >= interval) {
      lastCallTime = now
      func(...args)
    } else if (timeoutId === undefined) {
      timeoutId = window.setTimeout(() => {
        lastCallTime = Date.now()
        func(...args)
        timeoutId = undefined
      }, interval - (now - lastCallTime))
    }
  }
}

/**
 * 异步渲染管理器
 */
export class AsyncRenderManager {
  private renderQueue: Array<() => void> = []
  private isRendering = false
  private batchSize: number

  constructor(batchSize = 10) {
    this.batchSize = batchSize
  }

  /**
   * 添加渲染任务
   */
  addRenderTask(task: () => void): void {
    this.renderQueue.push(task)
    this.scheduleRender()
  }

  /**
   * 清空渲染队列
   */
  clear(): void {
    this.renderQueue = []
    this.isRendering = false
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.renderQueue.length
  }

  /**
   * 调度渲染
   */
  private scheduleRender(): void {
    if (this.isRendering || this.renderQueue.length === 0) {
      return
    }

    this.isRendering = true
    requestAnimationFrame(() => this.processRenderQueue())
  }

  /**
   * 处理渲染队列
   */
  private processRenderQueue(): void {
    const batch = this.renderQueue.splice(0, this.batchSize)

    batch.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('异步渲染任务执行失败:', error)
      }
    })

    if (this.renderQueue.length > 0) {
      requestAnimationFrame(() => this.processRenderQueue())
    } else {
      this.isRendering = false
    }
  }
}

/**
 * 智能更新管理器
 */
export class SmartUpdateManager {
  private updateRegions = new Set<string>()
  private threshold: number
  private lastUpdateTime = 0

  constructor(threshold = 100) {
    this.threshold = threshold
  }

  /**
   * 标记更新区域
   */
  markUpdateRegion(x: number, y: number, width: number, height: number): void {
    const region = `${Math.floor(x / this.threshold)},${Math.floor(y / this.threshold)}`
    this.updateRegions.add(region)
  }

  /**
   * 检查是否需要更新
   */
  shouldUpdate(x: number, y: number): boolean {
    const region = `${Math.floor(x / this.threshold)},${Math.floor(y / this.threshold)}`
    return this.updateRegions.has(region)
  }

  /**
   * 清空更新区域
   */
  clearUpdateRegions(): void {
    this.updateRegions.clear()
    this.lastUpdateTime = Date.now()
  }

  /**
   * 获取更新区域数量
   */
  getUpdateRegionCount(): number {
    return this.updateRegions.size
  }

  /**
   * 获取上次更新时间
   */
  getLastUpdateTime(): number {
    return this.lastUpdateTime
  }
}

/**
 * 拖拽优化器
 */
export class DragOptimizer {
  private isDragging = false
  private dragStartTime = 0
  private dragDistance = 0
  private lastPosition = { x: 0, y: 0 }
  private optimizedHandler?: (event: MouseEvent) => void

  /**
   * 优化拖拽处理器
   */
  optimizeDragHandler(
    handler: (event: MouseEvent) => void,
    throttleInterval = 16 // 60fps
  ): (event: MouseEvent) => void {
    if (this.optimizedHandler) {
      return this.optimizedHandler
    }

    this.optimizedHandler = throttle((event: MouseEvent) => {
      if (this.isDragging) {
        const currentPos = { x: event.clientX, y: event.clientY }
        const distance = Math.sqrt(
          Math.pow(currentPos.x - this.lastPosition.x, 2) +
          Math.pow(currentPos.y - this.lastPosition.y, 2)
        )

        this.dragDistance += distance
        this.lastPosition = currentPos

        handler(event)
      }
    }, throttleInterval)

    return this.optimizedHandler
  }

  /**
   * 开始拖拽
   */
  startDrag(x: number, y: number): void {
    this.isDragging = true
    this.dragStartTime = Date.now()
    this.dragDistance = 0
    this.lastPosition = { x, y }
  }

  /**
   * 结束拖拽
   */
  endDrag(): DragStats {
    if (!this.isDragging) {
      return {
        duration: 0,
        distance: 0,
        avgSpeed: 0
      }
    }

    const stats = {
      duration: Date.now() - this.dragStartTime,
      distance: this.dragDistance,
      avgSpeed: this.dragDistance / Math.max(1, Date.now() - this.dragStartTime) * 1000
    }

    this.isDragging = false
    this.dragStartTime = 0
    this.dragDistance = 0

    return stats
  }

  /**
   * 是否正在拖拽
   */
  isDragActive(): boolean {
    return this.isDragging
  }
}

/**
 * 缩放优化器
 */
export class ZoomOptimizer {
  private zoomLevel = 1
  private zoomHistory: number[] = []
  private lastZoomTime = 0
  private optimizedHandler?: (event: WheelEvent) => void

  /**
   * 优化缩放处理器
   */
  optimizeZoomHandler(
    handler: (event: WheelEvent) => void,
    debounceDelay = 50
  ): (event: WheelEvent) => void {
    if (this.optimizedHandler) {
      return this.optimizedHandler
    }

    this.optimizedHandler = debounce((event: WheelEvent) => {
      this.recordZoom()
      handler(event)
    }, debounceDelay)

    return this.optimizedHandler
  }

  /**
   * 设置缩放级别
   */
  setZoomLevel(level: number): void {
    this.zoomLevel = level
    this.recordZoom()
  }

  /**
   * 获取缩放级别
   */
  getZoomLevel(): number {
    return this.zoomLevel
  }

  /**
   * 获取缩放统计
   */
  getZoomStats(): ZoomStats {
    return {
      currentLevel: this.zoomLevel,
      historyCount: this.zoomHistory.length,
      avgZoomLevel: this.zoomHistory.reduce((sum, level) => sum + level, 0) / Math.max(1, this.zoomHistory.length),
      lastZoomTime: this.lastZoomTime
    }
  }

  /**
   * 记录缩放
   */
  private recordZoom(): void {
    this.zoomHistory.push(this.zoomLevel)
    this.lastZoomTime = Date.now()

    // 保持历史记录在合理范围内
    if (this.zoomHistory.length > 100) {
      this.zoomHistory.shift()
    }
  }
}

/**
 * 交互性能优化器主类
 */
export class InteractionOptimizer {
  private config: InteractionOptimizerConfig
  private asyncRenderManager: AsyncRenderManager
  private smartUpdateManager: SmartUpdateManager
  private dragOptimizer: DragOptimizer
  private zoomOptimizer: ZoomOptimizer

  constructor(config: Partial<InteractionOptimizerConfig> = {}) {
    this.config = {
      enabled: true,
      debounceDelay: 100,
      throttleInterval: 16, // 60fps
      enableAsyncRender: true,
      asyncRenderBatchSize: 10,
      enableSmartUpdate: true,
      updateThreshold: 100,
      ...config
    }

    this.asyncRenderManager = new AsyncRenderManager(this.config.asyncRenderBatchSize)
    this.smartUpdateManager = new SmartUpdateManager(this.config.updateThreshold)
    this.dragOptimizer = new DragOptimizer()
    this.zoomOptimizer = new ZoomOptimizer()
  }

  /**
   * 优化拖拽处理器
   */
  optimizeDragHandler(handler: (event: MouseEvent) => void): (event: MouseEvent) => void {
    if (!this.config.enabled) {
      return handler
    }

    return this.dragOptimizer.optimizeDragHandler(handler, this.config.throttleInterval)
  }

  /**
   * 优化缩放处理器
   */
  optimizeZoomHandler(handler: (event: WheelEvent) => void): (event: WheelEvent) => void {
    if (!this.config.enabled) {
      return handler
    }

    return this.zoomOptimizer.optimizeZoomHandler(handler, this.config.debounceDelay)
  }

  /**
   * 添加异步渲染任务
   */
  addAsyncRenderTask(task: () => void): void {
    if (this.config.enabled && this.config.enableAsyncRender) {
      this.asyncRenderManager.addRenderTask(task)
    } else {
      task()
    }
  }

  /**
   * 标记更新区域
   */
  markUpdateRegion(x: number, y: number, width: number, height: number): void {
    if (this.config.enabled && this.config.enableSmartUpdate) {
      this.smartUpdateManager.markUpdateRegion(x, y, width, height)
    }
  }

  /**
   * 检查是否需要更新
   */
  shouldUpdate(x: number, y: number): boolean {
    if (!this.config.enabled || !this.config.enableSmartUpdate) {
      return true
    }

    return this.smartUpdateManager.shouldUpdate(x, y)
  }

  /**
   * 开始拖拽
   */
  startDrag(x: number, y: number): void {
    this.dragOptimizer.startDrag(x, y)
  }

  /**
   * 结束拖拽
   */
  endDrag(): DragStats {
    return this.dragOptimizer.endDrag()
  }

  /**
   * 设置缩放级别
   */
  setZoomLevel(level: number): void {
    this.zoomOptimizer.setZoomLevel(level)
  }

  /**
   * 获取交互统计
   */
  getInteractionStats(): InteractionStats {
    return {
      asyncRenderQueueSize: this.asyncRenderManager.getQueueSize(),
      updateRegionCount: this.smartUpdateManager.getUpdateRegionCount(),
      dragStats: this.dragOptimizer.isDragActive() ? null : this.dragOptimizer.endDrag(),
      zoomStats: this.zoomOptimizer.getZoomStats(),
      lastUpdateTime: this.smartUpdateManager.getLastUpdateTime()
    }
  }

  /**
   * 清空所有状态
   */
  clear(): void {
    this.asyncRenderManager.clear()
    this.smartUpdateManager.clearUpdateRegions()
  }

  /**
   * 创建防抖函数
   */
  createDebounced<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return debounce(func, this.config.debounceDelay)
  }

  /**
   * 创建节流函数
   */
  createThrottled<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return throttle(func, this.config.throttleInterval)
  }
}

// 类型定义
export interface DragStats {
  duration: number // 拖拽持续时间（毫秒）
  distance: number // 拖拽距离（像素）
  avgSpeed: number // 平均速度（像素/秒）
}

export interface ZoomStats {
  currentLevel: number // 当前缩放级别
  historyCount: number // 缩放历史记录数量
  avgZoomLevel: number // 平均缩放级别
  lastZoomTime: number // 上次缩放时间
}

export interface InteractionStats {
  asyncRenderQueueSize: number // 异步渲染队列大小
  updateRegionCount: number // 更新区域数量
  dragStats: DragStats | null // 拖拽统计
  zoomStats: ZoomStats // 缩放统计
  lastUpdateTime: number // 上次更新时间
}
