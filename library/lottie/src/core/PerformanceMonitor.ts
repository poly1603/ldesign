import type { PerformanceMetrics } from '../types'

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private startTime: number = 0
  private frameCount: number = 0
  private lastFrameTime: number = 0
  private fps: number = 0
  private animationFrame: number | null = null
  private isMonitoring: boolean = false
  private callbacks: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private interval: number = 1000 // 1秒更新一次

  constructor(
    private totalFrames: number,
    private duration: number,
    interval?: number
  ) {
    if (interval) this.interval = interval
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.frameCount = 0
    this.monitorLoop()
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  /**
   * 监控循环
   */
  private monitorLoop = (): void => {
    if (!this.isMonitoring) return

    const now = performance.now()
    this.frameCount++

    // 每隔指定间隔更新一次指标
    if (now - this.lastFrameTime >= this.interval) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime))
      this.lastFrameTime = now
      this.frameCount = 0

      const metrics = this.getMetrics()
      this.notifyCallbacks(metrics)
    }

    this.animationFrame = requestAnimationFrame(this.monitorLoop)
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    const memory = this.getMemoryUsage()
    const loadTime = performance.now() - this.startTime

    return {
      loadTime,
      fps: this.fps,
      memory,
      duration: this.duration,
      totalFrames: this.totalFrames,
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory
      return Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024 * 100) / 100
    }
    return 0
  }

  /**
   * 添加回调
   */
  onMetrics(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * 通知所有回调
   */
  private notifyCallbacks(metrics: PerformanceMetrics): void {
    this.callbacks.forEach(callback => {
      try {
        callback(metrics)
      } catch (error) {
        console.error('[PerformanceMonitor] Error in callback:', error)
      }
    })
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stop()
    this.callbacks.clear()
  }
}
