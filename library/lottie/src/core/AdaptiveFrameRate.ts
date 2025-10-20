/**
 * 自适应帧率管理器
 * 根据设备性能动态调整帧率
 */

import type { ILottieInstance } from '../types'

export interface AdaptiveFrameRateConfig {
  /** 目标帧率 */
  targetFPS?: number
  /** 最小帧率 */
  minFPS?: number
  /** 最大帧率 */
  maxFPS?: number
  /** 调整间隔（ms） */
  adjustInterval?: number
  /** 历史记录大小 */
  historySize?: number
  /** 启用自适应 */
  enabled?: boolean
}

export interface FrameRateStats {
  currentFPS: number
  targetFPS: number
  actualFPS: number
  adjustmentCount: number
  status: 'optimal' | 'degraded' | 'recovering'
}

/**
 * 自适应帧率管理器
 */
export class AdaptiveFrameRate {
  private instance: ILottieInstance
  private config: Required<AdaptiveFrameRateConfig>
  private frameTimeHistory: number[] = []
  private currentFPS: number
  private adjustmentCount = 0
  private monitorTimer: number | null = null
  private lastAdjustTime = 0
  private adjustCooldown = 2000 // 2秒调整冷却期

  constructor(instance: ILottieInstance, config?: AdaptiveFrameRateConfig) {
    this.instance = instance
    
    this.config = {
      targetFPS: config?.targetFPS ?? 60,
      minFPS: config?.minFPS ?? 15,
      maxFPS: config?.maxFPS ?? 60,
      adjustInterval: config?.adjustInterval ?? 1000,
      historySize: config?.historySize ?? 60,
      enabled: config?.enabled ?? true
    }

    this.currentFPS = this.config.targetFPS

    if (this.config.enabled) {
      this.startMonitoring()
    }
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.monitorTimer !== null) return

    // 监听帧事件
    this.instance.on('enterFrame', this.recordFrame)

    // 启动调整循环
    this.adjustLoop()

    console.log('[AdaptiveFrameRate] Started monitoring for instance:', this.instance.id)
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitorTimer !== null) {
      clearTimeout(this.monitorTimer)
      this.monitorTimer = null
    }

    this.instance.off('enterFrame', this.recordFrame)

    console.log('[AdaptiveFrameRate] Stopped monitoring for instance:', this.instance.id)
  }

  /**
   * 记录帧时间
   */
  private recordFrame = (): void => {
    const now = performance.now()
    
    if (this.frameTimeHistory.length > 0) {
      const lastTime = this.frameTimeHistory[this.frameTimeHistory.length - 1]
      const frameTime = now - lastTime
      
      this.frameTimeHistory.push(now)

      // 限制历史记录大小
      if (this.frameTimeHistory.length > this.config.historySize) {
        this.frameTimeHistory.shift()
      }
    } else {
      this.frameTimeHistory.push(now)
    }
  }

  /**
   * 调整循环
   */
  private adjustLoop = (): void => {
    // 执行调整
    this.adjust()

    // 调度下一次调整
    this.monitorTimer = window.setTimeout(
      this.adjustLoop,
      this.config.adjustInterval
    )
  }

  /**
   * 执行帧率调整
   */
  private adjust(): void {
    if (!this.config.enabled || this.frameTimeHistory.length < 30) {
      return
    }

    // 检查冷却期
    const now = performance.now()
    if (now - this.lastAdjustTime < this.adjustCooldown) {
      return
    }

    // 计算实际帧率
    const actualFPS = this.calculateActualFPS()
    
    if (actualFPS === 0) return

    const target = this.currentFPS
    const ratio = actualFPS / target

    // 判断是否需要调整
    if (ratio < 0.80) {
      // 实际帧率低于目标的 80%，降低目标帧率
      const newFPS = Math.max(
        this.config.minFPS,
        Math.floor(this.currentFPS * 0.9)
      )

      if (newFPS !== this.currentFPS) {
        this.setFrameRate(newFPS)
        console.warn(`[AdaptiveFrameRate] Degrading FPS: ${this.currentFPS} -> ${newFPS} (actual: ${actualFPS.toFixed(1)})`)
      }
    } else if (ratio >= 0.95 && this.currentFPS < this.config.maxFPS) {
      // 实际帧率接近目标，且当前帧率低于最大值，尝试提升
      const newFPS = Math.min(
        this.config.maxFPS,
        Math.floor(this.currentFPS * 1.1)
      )

      if (newFPS !== this.currentFPS) {
        this.setFrameRate(newFPS)
        console.log(`[AdaptiveFrameRate] Recovering FPS: ${this.currentFPS} -> ${newFPS} (actual: ${actualFPS.toFixed(1)})`)
      }
    }
  }

  /**
   * 计算实际帧率
   */
  private calculateActualFPS(): number {
    if (this.frameTimeHistory.length < 2) return 0

    // 计算平均帧时间（最近30帧）
    const recent = this.frameTimeHistory.slice(-30)
    let totalTime = 0

    for (let i = 1; i < recent.length; i++) {
      totalTime += recent[i] - recent[i - 1]
    }

    const avgFrameTime = totalTime / (recent.length - 1)
    
    if (avgFrameTime === 0) return 0

    return Math.round(1000 / avgFrameTime)
  }

  /**
   * 设置帧率
   */
  private setFrameRate(fps: number): void {
    const previousFPS = this.currentFPS
    this.currentFPS = fps
    this.adjustmentCount++
    this.lastAdjustTime = performance.now()

    // 通过调整播放速度来控制帧率
    const speedAdjustment = fps / this.config.targetFPS
    
    try {
      // 保存原始速度
      const originalSpeed = (this.instance as any)._originalSpeed || this.instance.config.speed || 1
      if (!(this.instance as any)._originalSpeed) {
        (this.instance as any)._originalSpeed = originalSpeed
      }

      // 应用调整后的速度
      const adjustedSpeed = originalSpeed * speedAdjustment
      this.instance.setSpeed(adjustedSpeed)
    } catch (error) {
      console.error('[AdaptiveFrameRate] Failed to adjust speed:', error)
    }
  }

  /**
   * 获取当前帧率
   */
  getCurrentFPS(): number {
    return this.currentFPS
  }

  /**
   * 获取实际帧率
   */
  getActualFPS(): number {
    return this.calculateActualFPS()
  }

  /**
   * 获取统计信息
   */
  getStats(): FrameRateStats {
    const actualFPS = this.calculateActualFPS()
    const ratio = actualFPS / this.config.targetFPS

    let status: FrameRateStats['status']
    if (ratio >= 0.9) {
      status = 'optimal'
    } else if (this.currentFPS < this.config.targetFPS) {
      status = 'degraded'
    } else {
      status = 'recovering'
    }

    return {
      currentFPS: this.currentFPS,
      targetFPS: this.config.targetFPS,
      actualFPS,
      adjustmentCount: this.adjustmentCount,
      status
    }
  }

  /**
   * 重置帧率
   */
  reset(): void {
    this.setFrameRate(this.config.targetFPS)
    this.frameTimeHistory = []
    this.adjustmentCount = 0
  }

  /**
   * 启用自适应
   */
  enable(): void {
    if (this.config.enabled) return

    this.config.enabled = true
    this.startMonitoring()
  }

  /**
   * 禁用自适应
   */
  disable(): void {
    if (!this.config.enabled) return

    this.config.enabled = false
    this.stopMonitoring()
    this.reset()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AdaptiveFrameRateConfig>): void {
    Object.assign(this.config, config)

    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.enable()
      } else {
        this.disable()
      }
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopMonitoring()
    this.frameTimeHistory = []

    // 恢复原始速度
    if ((this.instance as any)._originalSpeed) {
      try {
        this.instance.setSpeed((this.instance as any)._originalSpeed)
        delete (this.instance as any)._originalSpeed
      } catch (error) {
        // 忽略错误
      }
    }

    console.log('[AdaptiveFrameRate] Destroyed')
  }
}


