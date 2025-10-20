/**
 * Performance monitoring for grid instances
 */

import type { PerformanceStats } from '../types'

export class PerformanceMonitor {
  private itemCount = 0
  private visibleItemCount = 0
  private renderTimes: number[] = []
  private maxRenderSamples = 100
  private fps = 60
  private lastFrameTime = 0
  private frameCount = 0
  private fpsInterval: number | undefined

  constructor() {
    this.startFPSMonitoring()
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    let lastTime = performance.now()
    let frames = 0

    const measureFPS = () => {
      const now = performance.now()
      frames++

      if (now >= lastTime + 1000) {
        this.fps = Math.round((frames * 1000) / (now - lastTime))
        frames = 0
        lastTime = now
      }

      requestAnimationFrame(measureFPS)
    }

    measureFPS()
  }

  /**
   * Record render time
   */
  recordRender(startTime: number): void {
    const renderTime = performance.now() - startTime
    this.renderTimes.push(renderTime)

    if (this.renderTimes.length > this.maxRenderSamples) {
      this.renderTimes.shift()
    }
  }

  /**
   * Update item count
   */
  updateItemCount(total: number, visible?: number): void {
    this.itemCount = total
    if (visible !== undefined) {
      this.visibleItemCount = visible
    } else {
      this.visibleItemCount = total
    }
  }

  /**
   * Get average render time
   */
  getAvgRenderTime(): number {
    if (this.renderTimes.length === 0) return 0
    const sum = this.renderTimes.reduce((a, b) => a + b, 0)
    return sum / this.renderTimes.length
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize
    }
    return undefined
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps
  }

  /**
   * Get performance stats
   */
  getStats(): PerformanceStats {
    return {
      itemCount: this.itemCount,
      visibleItemCount: this.visibleItemCount,
      avgRenderTime: this.getAvgRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      fps: this.fps,
      lastUpdate: Date.now()
    }
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    return this.fps < 30 || this.getAvgRenderTime() > 16.67 // ~60fps threshold
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.fps < 30) {
      recommendations.push('Enable virtual scrolling to improve FPS')
    }

    if (this.getAvgRenderTime() > 16.67) {
      recommendations.push('Enable batch updates to reduce render time')
    }

    if (this.itemCount > 100 && this.visibleItemCount === this.itemCount) {
      recommendations.push('Consider enabling lazy rendering for better performance')
    }

    return recommendations
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.renderTimes = []
    this.itemCount = 0
    this.visibleItemCount = 0
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval)
    }
  }
}













