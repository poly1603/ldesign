/**
 * 动画管理器
 * 提供丰富的尺寸切换动画效果
 */

export type AnimationEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'

export type AnimationPreset =
  | 'smooth'
  | 'bounce'
  | 'elastic'
  | 'spring'
  | 'fade'
  | 'instant'

export interface AnimationOptions {
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: AnimationEasing
  /** 自定义贝塞尔曲线 */
  cubicBezier?: [number, number, number, number]
  /** 延迟时间（毫秒） */
  delay?: number
  /** 填充模式 */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  /** 是否启用动画 */
  enabled?: boolean
}

export interface AnimationState {
  /** 是否正在动画 */
  isAnimating: boolean
  /** 动画开始时间 */
  startTime: number
  /** 动画结束时间 */
  endTime: number
  /** 动画进度 (0-1) */
  progress: number
}

/**
 * 动画预设配置
 */
const ANIMATION_PRESETS: Record<AnimationPreset, AnimationOptions> = {
  smooth: {
    duration: 300,
    easing: 'ease-in-out',
    enabled: true,
  },
  bounce: {
    duration: 600,
    easing: 'cubic-bezier',
    cubicBezier: [0.68, -0.55, 0.265, 1.55],
    enabled: true,
  },
  elastic: {
    duration: 800,
    easing: 'cubic-bezier',
    cubicBezier: [0.68, -0.6, 0.32, 1.6],
    enabled: true,
  },
  spring: {
    duration: 500,
    easing: 'cubic-bezier',
    cubicBezier: [0.175, 0.885, 0.32, 1.275],
    enabled: true,
  },
  fade: {
    duration: 200,
    easing: 'ease-out',
    enabled: true,
  },
  instant: {
    duration: 0,
    easing: 'linear',
    enabled: false,
  },
}

/**
 * 动画管理器类
 */
export class AnimationManager {
  private options: Required<AnimationOptions>
  private state: AnimationState = {
    isAnimating: false,
    startTime: 0,
    endTime: 0,
    progress: 0,
  }

  private animationFrame: number | null = null
  private callbacks: Array<(state: AnimationState) => void> = []

  constructor(options: AnimationOptions = {}) {
    this.options = {
      duration: options.duration ?? 300,
      easing: options.easing ?? 'ease-in-out',
      cubicBezier: options.cubicBezier,
      delay: options.delay ?? 0,
      fillMode: options.fillMode ?? 'forwards',
      enabled: options.enabled ?? true,
    } as Required<AnimationOptions>
  }

  /**
   * 应用预设
   */
  applyPreset(preset: AnimationPreset): void {
    const presetOptions = ANIMATION_PRESETS[preset]
    this.updateOptions(presetOptions)
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<AnimationOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取选项
   */
  getOptions(): Readonly<Required<AnimationOptions>> {
    return { ...this.options }
  }

  /**
   * 开始动画
   */
  async start(): Promise<void> {
    if (!this.options.enabled || this.options.duration === 0) {
      return Promise.resolve()
    }

    // 如果已经在动画中，先停止
    if (this.state.isAnimating) {
      this.stop()
    }

    return new Promise((resolve) => {
      // 延迟执行
      setTimeout(() => {
        this.state.isAnimating = true
        this.state.startTime = performance.now()
        this.state.endTime = this.state.startTime + this.options.duration
        this.state.progress = 0

        this.animate(resolve)
      }, this.options.delay)
    })
  }

  /**
   * 执行动画
   */
  private animate(resolve: () => void): void {
    const now = performance.now()
    const elapsed = now - this.state.startTime
    const duration = this.options.duration

    if (elapsed >= duration) {
      // 动画完成
      this.state.progress = 1
      this.state.isAnimating = false
      this.notifyCallbacks()
      resolve()
      return
    }

    // 计算进度
    const linearProgress = elapsed / duration
    this.state.progress = this.applyEasing(linearProgress)

    // 通知回调
    this.notifyCallbacks()

    // 继续动画
    this.animationFrame = requestAnimationFrame(() => this.animate(resolve))
  }

  /**
   * 应用缓动函数
   */
  private applyEasing(progress: number): number {
    const { easing, cubicBezier } = this.options

    if (easing === 'cubic-bezier' && cubicBezier) {
      return this.cubicBezierEasing(progress, ...cubicBezier)
    }

    switch (easing) {
      case 'linear':
        return progress
      case 'ease-in':
        return progress * progress
      case 'ease-out':
        return progress * (2 - progress)
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress
      case 'ease':
      default:
        return progress * progress * (3 - 2 * progress)
    }
  }

  /**
   * 三次贝塞尔曲线缓动
   */
  private cubicBezierEasing(
    t: number,
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
  ): number {
    // 简化的贝塞尔曲线实现
    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx

    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

    // 使用牛顿法求解
    let x = t
    for (let i = 0; i < 8; i++) {
      const currentX = sampleCurveX(x) - t
      if (Math.abs(currentX) < 0.001)
        break
      const currentSlope = 3 * ax * x * x + 2 * bx * x + cx
      if (Math.abs(currentSlope) < 0.000001)
        break
      x -= currentX / currentSlope
    }

    return sampleCurveY(x)
  }

  /**
   * 停止动画
   */
  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.state.isAnimating = false
    this.state.progress = 1
  }

  /**
   * 获取动画状态
   */
  getState(): Readonly<AnimationState> {
    return { ...this.state }
  }

  /**
   * 监听动画进度
   */
  onProgress(callback: (state: AnimationState) => void): () => void {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知回调
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(this.state)
      }
      catch (error) {
        console.error('Animation callback error:', error)
      }
    })
  }

  /**
   * 生成 CSS 过渡字符串
   */
  toCSSTransition(properties: string[] = ['all']): string {
    if (!this.options.enabled || this.options.duration === 0) {
      return 'none'
    }

    const duration = `${this.options.duration}ms`
    let timing: string = this.options.easing

    if (this.options.easing === 'cubic-bezier' && this.options.cubicBezier) {
      timing = `cubic-bezier(${this.options.cubicBezier.join(', ')})`
    }

    const delay = this.options.delay ? `${this.options.delay}ms` : '0ms'

    return properties
      .map(prop => `${prop} ${duration} ${timing} ${delay}`)
      .join(', ')
  }

  /**
   * 启用动画
   */
  enable(): void {
    this.options.enabled = true
  }

  /**
   * 禁用动画
   */
  disable(): void {
    this.options.enabled = false
    this.stop()
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.options.enabled
  }
}

/**
 * 全局动画管理器实例
 */
export const globalAnimationManager = new AnimationManager()

/**
 * 获取动画预设
 */
export function getAnimationPreset(preset: AnimationPreset): AnimationOptions {
  return { ...ANIMATION_PRESETS[preset] }
}

/**
 * 获取所有可用的动画预设
 */
export function getAvailablePresets(): AnimationPreset[] {
  return Object.keys(ANIMATION_PRESETS) as AnimationPreset[]
}

