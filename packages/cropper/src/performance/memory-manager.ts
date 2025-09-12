/**
 * @file 内存管理器
 * @description 管理图片裁剪器的内存使用和资源清理
 */

import { EventEmitter } from '@/core/event-emitter'

/**
 * 内存使用统计
 */
export interface MemoryStats {
  /** 已使用内存（字节） */
  usedMemory: number
  /** 图片缓存数量 */
  imageCount: number
  /** Canvas缓存数量 */
  canvasCount: number
  /** 事件监听器数量 */
  listenerCount: number
  /** 最大内存使用量 */
  maxMemory: number
  /** 内存使用率 */
  memoryUsage: number
}

/**
 * 可清理的资源接口
 */
export interface Disposable {
  /** 释放资源 */
  dispose(): void
  /** 是否已释放 */
  isDisposed(): boolean
}

/**
 * 内存警告级别
 */
export enum MemoryWarningLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 内存管理器类
 */
export class MemoryManager extends EventEmitter {
  /** 图片缓存 */
  private imageCache: Map<string, HTMLImageElement> = new Map()

  /** Canvas缓存 */
  private canvasCache: Map<string, HTMLCanvasElement> = new Map()

  /** 可清理资源列表 */
  private disposables: Set<Disposable> = new Set()

  /** 内存使用监控定时器 */
  private memoryMonitorTimer?: number

  /** 最大缓存大小（字节） */
  private maxCacheSize: number = 100 * 1024 * 1024 // 100MB

  /** 内存警告阈值 */
  private memoryWarningThresholds = {
    [MemoryWarningLevel.LOW]: 0.6,      // 60%
    [MemoryWarningLevel.MEDIUM]: 0.75,  // 75%
    [MemoryWarningLevel.HIGH]: 0.85,    // 85%
    [MemoryWarningLevel.CRITICAL]: 0.95 // 95%
  }

  /** 当前内存警告级别 */
  private currentWarningLevel: MemoryWarningLevel | null = null

  /** 是否启用自动清理 */
  private autoCleanupEnabled: boolean = true

  /** 清理间隔（毫秒） */
  private cleanupInterval: number = 30000 // 30秒

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: {
    maxCacheSize?: number
    autoCleanupEnabled?: boolean
    cleanupInterval?: number
  } = {}) {
    super()

    this.maxCacheSize = options.maxCacheSize || this.maxCacheSize
    this.autoCleanupEnabled = options.autoCleanupEnabled ?? this.autoCleanupEnabled
    this.cleanupInterval = options.cleanupInterval || this.cleanupInterval

    // 启动内存监控
    this.startMemoryMonitoring()

    // 监听页面卸载事件
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup()
      })
    }
  }

  /**
   * 缓存图片
   * @param key 缓存键
   * @param image 图片元素
   */
  cacheImage(key: string, image: HTMLImageElement): void {
    // 检查缓存大小
    if (this.shouldEvictCache()) {
      this.evictOldestImages()
    }

    this.imageCache.set(key, image)
    this.emit('imageCached', { key, size: this.estimateImageSize(image) })
  }

  /**
   * 获取缓存的图片
   * @param key 缓存键
   */
  getCachedImage(key: string): HTMLImageElement | undefined {
    return this.imageCache.get(key)
  }

  /**
   * 移除图片缓存
   * @param key 缓存键
   */
  removeCachedImage(key: string): void {
    const image = this.imageCache.get(key)
    if (image) {
      this.imageCache.delete(key)
      this.emit('imageEvicted', { key })
    }
  }

  /**
   * 缓存Canvas
   * @param key 缓存键
   * @param canvas Canvas元素
   */
  cacheCanvas(key: string, canvas: HTMLCanvasElement): void {
    if (this.shouldEvictCache()) {
      this.evictOldestCanvases()
    }

    this.canvasCache.set(key, canvas)
    this.emit('canvasCached', { key, size: this.estimateCanvasSize(canvas) })
  }

  /**
   * 获取缓存的Canvas
   * @param key 缓存键
   */
  getCachedCanvas(key: string): HTMLCanvasElement | undefined {
    return this.canvasCache.get(key)
  }

  /**
   * 移除Canvas缓存
   * @param key 缓存键
   */
  removeCachedCanvas(key: string): void {
    const canvas = this.canvasCache.get(key)
    if (canvas) {
      // 清理Canvas上下文
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      
      this.canvasCache.delete(key)
      this.emit('canvasEvicted', { key })
    }
  }

  /**
   * 注册可清理资源
   * @param disposable 可清理资源
   */
  registerDisposable(disposable: Disposable): void {
    this.disposables.add(disposable)
  }

  /**
   * 注销可清理资源
   * @param disposable 可清理资源
   */
  unregisterDisposable(disposable: Disposable): void {
    this.disposables.delete(disposable)
  }

  /**
   * 获取内存使用统计
   */
  getMemoryStats(): MemoryStats {
    const imageMemory = Array.from(this.imageCache.values())
      .reduce((total, img) => total + this.estimateImageSize(img), 0)
    
    const canvasMemory = Array.from(this.canvasCache.values())
      .reduce((total, canvas) => total + this.estimateCanvasSize(canvas), 0)

    const usedMemory = imageMemory + canvasMemory
    const memoryUsage = usedMemory / this.maxCacheSize

    return {
      usedMemory,
      imageCount: this.imageCache.size,
      canvasCount: this.canvasCache.size,
      listenerCount: this.getListenerCount(),
      maxMemory: this.maxCacheSize,
      memoryUsage
    }
  }

  /**
   * 强制垃圾回收（如果支持）
   */
  forceGarbageCollection(): void {
    // 清理已释放的资源
    this.disposables.forEach(disposable => {
      if (disposable.isDisposed()) {
        this.disposables.delete(disposable)
      }
    })

    // 尝试触发垃圾回收（仅在开发环境）
    if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc()
        this.emit('garbageCollected')
      } catch (error) {
        console.warn('Failed to trigger garbage collection:', error)
      }
    }
  }

  /**
   * 清理所有缓存
   */
  clearAllCaches(): void {
    // 清理图片缓存
    this.imageCache.clear()
    
    // 清理Canvas缓存
    this.canvasCache.forEach(canvas => {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    })
    this.canvasCache.clear()

    this.emit('cachesCleared')
  }

  /**
   * 执行内存清理
   */
  cleanup(): void {
    // 清理所有可清理资源
    this.disposables.forEach(disposable => {
      if (!disposable.isDisposed()) {
        try {
          disposable.dispose()
        } catch (error) {
          console.error('Error disposing resource:', error)
        }
      }
    })
    this.disposables.clear()

    // 清理缓存
    this.clearAllCaches()

    // 停止内存监控
    this.stopMemoryMonitoring()

    // 强制垃圾回收
    this.forceGarbageCollection()

    this.emit('cleanupCompleted')
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    if (!this.autoCleanupEnabled) return

    this.memoryMonitorTimer = window.setInterval(() => {
      const stats = this.getMemoryStats()
      this.checkMemoryWarnings(stats)
      
      // 如果内存使用过高，执行自动清理
      if (stats.memoryUsage > this.memoryWarningThresholds[MemoryWarningLevel.HIGH]) {
        this.performAutoCleanup()
      }
    }, this.cleanupInterval)
  }

  /**
   * 停止内存监控
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer)
      this.memoryMonitorTimer = undefined
    }
  }

  /**
   * 检查内存警告
   */
  private checkMemoryWarnings(stats: MemoryStats): void {
    let warningLevel: MemoryWarningLevel | null = null

    if (stats.memoryUsage >= this.memoryWarningThresholds[MemoryWarningLevel.CRITICAL]) {
      warningLevel = MemoryWarningLevel.CRITICAL
    } else if (stats.memoryUsage >= this.memoryWarningThresholds[MemoryWarningLevel.HIGH]) {
      warningLevel = MemoryWarningLevel.HIGH
    } else if (stats.memoryUsage >= this.memoryWarningThresholds[MemoryWarningLevel.MEDIUM]) {
      warningLevel = MemoryWarningLevel.MEDIUM
    } else if (stats.memoryUsage >= this.memoryWarningThresholds[MemoryWarningLevel.LOW]) {
      warningLevel = MemoryWarningLevel.LOW
    }

    if (warningLevel !== this.currentWarningLevel) {
      this.currentWarningLevel = warningLevel
      if (warningLevel) {
        this.emit('memoryWarning', { level: warningLevel, stats })
      }
    }
  }

  /**
   * 执行自动清理
   */
  private performAutoCleanup(): void {
    // 清理最旧的缓存项
    this.evictOldestImages(Math.floor(this.imageCache.size * 0.3))
    this.evictOldestCanvases(Math.floor(this.canvasCache.size * 0.3))

    // 清理已释放的资源
    this.disposables.forEach(disposable => {
      if (disposable.isDisposed()) {
        this.disposables.delete(disposable)
      }
    })

    this.emit('autoCleanupPerformed')
  }

  /**
   * 是否应该清理缓存
   */
  private shouldEvictCache(): boolean {
    const stats = this.getMemoryStats()
    return stats.memoryUsage > this.memoryWarningThresholds[MemoryWarningLevel.MEDIUM]
  }

  /**
   * 清理最旧的图片缓存
   */
  private evictOldestImages(count: number = 1): void {
    const keys = Array.from(this.imageCache.keys())
    for (let i = 0; i < Math.min(count, keys.length); i++) {
      this.removeCachedImage(keys[i])
    }
  }

  /**
   * 清理最旧的Canvas缓存
   */
  private evictOldestCanvases(count: number = 1): void {
    const keys = Array.from(this.canvasCache.keys())
    for (let i = 0; i < Math.min(count, keys.length); i++) {
      this.removeCachedCanvas(keys[i])
    }
  }

  /**
   * 估算图片大小
   */
  private estimateImageSize(image: HTMLImageElement): number {
    return image.naturalWidth * image.naturalHeight * 4 // RGBA
  }

  /**
   * 估算Canvas大小
   */
  private estimateCanvasSize(canvas: HTMLCanvasElement): number {
    return canvas.width * canvas.height * 4 // RGBA
  }

  /**
   * 获取事件监听器数量
   */
  private getListenerCount(): number {
    return this.listenerCount()
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.cleanup()
    this.removeAllListeners()
  }
}
