/**
 * 批量渲染优化器
 * 合并多个动画的渲染周期，减少重复计算
 */

import type { ILottieInstance } from '../types'

export interface BatchRendererConfig {
  /** 最大批次大小 */
  maxBatchSize?: number
  /** 是否使用 requestIdleCallback */
  useIdleCallback?: boolean
  /** 优先级队列启用 */
  enablePriorityQueue?: boolean
}

export interface RenderTask {
  instance: ILottieInstance
  priority: number
  timestamp: number
}

/**
 * 批量渲染器
 */
export class BatchRenderer {
  private static instance: BatchRenderer | null = null
  private config: Required<BatchRendererConfig>
  private renderQueue: Map<string, RenderTask> = new Map()
  private rafId: number | null = null
  private idleCallbackId: number | null = null
  private isRendering = false
  private frameCount = 0
  private lastFrameTime = 0

  private constructor(config?: BatchRendererConfig) {
    this.config = {
      maxBatchSize: config?.maxBatchSize ?? 50,
      useIdleCallback: config?.useIdleCallback ?? true,
      enablePriorityQueue: config?.enablePriorityQueue ?? true
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: BatchRendererConfig): BatchRenderer {
    if (!BatchRenderer.instance) {
      BatchRenderer.instance = new BatchRenderer(config)
    }
    return BatchRenderer.instance
  }

  /**
   * 调度渲染
   */
  scheduleRender(instance: ILottieInstance, priority: number = 0): void {
    // 添加到队列
    this.renderQueue.set(instance.id, {
      instance,
      priority,
      timestamp: performance.now()
    })

    // 如果还没有调度渲染，启动
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.render())
    }
  }

  /**
   * 批量渲染
   */
  private render(): void {
    if (this.isRendering) return

    this.isRendering = true
    const startTime = performance.now()

    // 获取所有任务
    const tasks = Array.from(this.renderQueue.values())
    
    if (tasks.length === 0) {
      this.isRendering = false
      this.rafId = null
      return
    }

    // 按优先级排序
    if (this.config.enablePriorityQueue) {
      tasks.sort((a, b) => {
        // 优先级高的在前
        if (b.priority !== a.priority) {
          return b.priority - a.priority
        }
        // 同优先级，按可见性排序
        const aVisible = this.isVisible(a.instance)
        const bVisible = this.isVisible(b.instance)
        if (aVisible !== bVisible) {
          return bVisible ? 1 : -1
        }
        // 最后按时间戳排序
        return a.timestamp - b.timestamp
      })
    }

    // 分离高优先级和低优先级任务
    const highPriority: RenderTask[] = []
    const lowPriority: RenderTask[] = []

    tasks.forEach(task => {
      const isVisible = this.isVisible(task.instance)
      const isHighPriority = task.priority > 0 || isVisible
      
      if (isHighPriority) {
        highPriority.push(task)
      } else {
        lowPriority.push(task)
      }
    })

    // 立即渲染高优先级任务
    let rendered = 0
    const maxPerFrame = this.config.maxBatchSize

    for (const task of highPriority) {
      if (rendered >= maxPerFrame) break
      
      try {
        this.renderInstance(task.instance)
        rendered++
      } catch (error) {
        console.error('[BatchRenderer] Render error:', error)
      }
    }

    // 清空已渲染的任务
    highPriority.slice(0, rendered).forEach(task => {
      this.renderQueue.delete(task.instance.id)
    })

    // 使用 requestIdleCallback 渲染低优先级任务
    if (lowPriority.length > 0 && this.config.useIdleCallback) {
      this.renderLowPriority(lowPriority)
    } else {
      // 如果不支持 requestIdleCallback，下一帧继续渲染
      lowPriority.forEach(task => {
        this.renderQueue.delete(task.instance.id)
      })
    }

    // 统计
    const renderTime = performance.now() - startTime
    this.frameCount++

    if (this.frameCount % 60 === 0) {
      const avgTime = (performance.now() - this.lastFrameTime) / 60
      console.log(`[BatchRenderer] Average frame time: ${avgTime.toFixed(2)}ms, rendered: ${rendered}/${tasks.length}`)
      this.lastFrameTime = performance.now()
    }

    // 完成
    this.isRendering = false
    this.rafId = null

    // 如果还有任务，继续调度
    if (this.renderQueue.size > 0) {
      this.rafId = requestAnimationFrame(() => this.render())
    }
  }

  /**
   * 渲染低优先级任务
   */
  private renderLowPriority(tasks: RenderTask[]): void {
    if (typeof requestIdleCallback === 'undefined') {
      // 不支持，直接渲染
      tasks.forEach(task => {
        try {
          this.renderInstance(task.instance)
          this.renderQueue.delete(task.instance.id)
        } catch (error) {
          console.error('[BatchRenderer] Render error:', error)
        }
      })
      return
    }

    this.idleCallbackId = requestIdleCallback((deadline) => {
      let index = 0

      while (
        index < tasks.length &&
        (deadline.timeRemaining() > 1 || deadline.didTimeout)
      ) {
        const task = tasks[index]
        
        try {
          this.renderInstance(task.instance)
          this.renderQueue.delete(task.instance.id)
        } catch (error) {
          console.error('[BatchRenderer] Render error:', error)
        }

        index++
      }

      // 如果还有未完成的任务，继续调度
      if (index < tasks.length) {
        this.renderLowPriority(tasks.slice(index))
      }
    }, { timeout: 1000 })
  }

  /**
   * 渲染单个实例
   */
  private renderInstance(instance: ILottieInstance): void {
    // 检查实例状态
    if (!instance.animation || instance.state !== 'playing') {
      return
    }

    // 渲染当前帧
    try {
      const animation = instance.animation as any
      
      if (animation.renderer && typeof animation.renderer.renderFrame === 'function') {
        animation.renderer.renderFrame(animation.currentFrame)
      }
    } catch (error) {
      console.error('[BatchRenderer] Failed to render frame:', error)
    }
  }

  /**
   * 检查实例是否可见
   */
  private isVisible(instance: ILottieInstance): boolean {
    if (!instance.container) return false

    const rect = instance.container.getBoundingClientRect()
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  /**
   * 取消渲染任务
   */
  cancelRender(instanceId: string): void {
    this.renderQueue.delete(instanceId)
  }

  /**
   * 取消所有渲染任务
   */
  cancelAll(): void {
    this.renderQueue.clear()

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    if (this.idleCallbackId !== null && typeof cancelIdleCallback !== 'undefined') {
      cancelIdleCallback(this.idleCallbackId)
      this.idleCallbackId = null
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    queueSize: number
    frameCount: number
    isRendering: boolean
  } {
    return {
      queueSize: this.renderQueue.size,
      frameCount: this.frameCount,
      isRendering: this.isRendering
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<BatchRendererConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 重置单例
   */
  static reset(): void {
    if (BatchRenderer.instance) {
      BatchRenderer.instance.destroy()
      BatchRenderer.instance = null
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cancelAll()
    this.renderQueue.clear()
    this.frameCount = 0
    console.log('[BatchRenderer] Destroyed')
  }
}

// 导出单例
export const batchRenderer = BatchRenderer.getInstance()


