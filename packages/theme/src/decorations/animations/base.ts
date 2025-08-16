/**
 * @ldesign/theme - 动画效果基础类
 *
 * 提供动画效果的基础功能和通用方法
 */

import type { AnimationConfig } from '../../core/types'

/**
 * 动画效果基础类
 */
export abstract class BaseAnimation {
  protected config: AnimationConfig
  protected elements: HTMLElement[] = []
  protected animation?: Animation
  protected isRunning = false
  protected isPaused = false
  protected startTime?: number
  protected pausedTime?: number

  constructor(config: AnimationConfig) {
    this.config = config
  }

  /**
   * 设置目标元素
   */
  setElements(elements: HTMLElement[]): void {
    this.elements = elements
  }

  /**
   * 添加目标元素
   */
  addElement(element: HTMLElement): void {
    if (!this.elements.includes(element)) {
      this.elements.push(element)
    }
  }

  /**
   * 移除目标元素
   */
  removeElement(element: HTMLElement): void {
    const index = this.elements.indexOf(element)
    if (index > -1) {
      this.elements.splice(index, 1)
    }
  }

  /**
   * 开始动画
   */
  start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.isPaused = false
    this.startTime = performance.now()

    this.onStart()
    this.createAnimation()
  }

  /**
   * 停止动画
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    this.isPaused = false

    if (this.animation) {
      this.animation.cancel()
      this.animation = undefined
    }

    this.onStop()
    this.resetElements()
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return
    }

    this.isPaused = true
    this.pausedTime = performance.now()

    if (this.animation) {
      this.animation.pause()
    }

    this.onPause()
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return
    }

    this.isPaused = false

    if (this.pausedTime && this.startTime) {
      const pauseDuration = performance.now() - this.pausedTime
      this.startTime += pauseDuration
      this.pausedTime = undefined
    }

    if (this.animation) {
      this.animation.play()
    }

    this.onResume()
  }

  /**
   * 重启动画
   */
  restart(): void {
    this.stop()
    setTimeout(() => this.start(), 50)
  }

  /**
   * 检查是否正在运行
   */
  isAnimationRunning(): boolean {
    return this.isRunning
  }

  /**
   * 检查是否已暂停
   */
  isAnimationPaused(): boolean {
    return this.isPaused
  }

  /**
   * 获取动画配置
   */
  getConfig(): AnimationConfig {
    return this.config
  }

  /**
   * 更新动画配置
   */
  updateConfig(updates: Partial<AnimationConfig>): void {
    const wasRunning = this.isRunning

    if (wasRunning) {
      this.stop()
    }

    this.config = { ...this.config, ...updates }

    if (wasRunning) {
      this.start()
    }
  }

  /**
   * 创建动画 - 抽象方法，由子类实现
   */
  protected abstract createAnimation(): void

  /**
   * 开始回调 - 可由子类重写
   */
  protected onStart(): void {
    // 子类可以重写此方法
  }

  /**
   * 停止回调 - 可由子类重写
   */
  protected onStop(): void {
    // 子类可以重写此方法
  }

  /**
   * 暂停回调 - 可由子类重写
   */
  protected onPause(): void {
    // 子类可以重写此方法
  }

  /**
   * 恢复回调 - 可由子类重写
   */
  protected onResume(): void {
    // 子类可以重写此方法
  }

  /**
   * 重置元素状态
   */
  protected resetElements(): void {
    this.elements.forEach(element => {
      // 移除动画相关的样式
      element.style.animation = ''
      element.style.transform = ''
      element.style.opacity = ''
      element.style.filter = ''

      // 移除动画类
      element.classList.remove(`animation-${this.config.name}`)
    })
  }

  /**
   * 生成CSS关键帧
   */
  protected generateCSSKeyframes(): string {
    if (!this.config.keyframes || this.config.keyframes.length === 0) {
      return ''
    }

    const keyframeRules = this.config.keyframes
      .map(keyframe => {
        const percentage = Math.round(keyframe.offset * 100)
        const properties = Object.entries(keyframe.properties)
          .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value}`)
          .join('; ')

        return `${percentage}% { ${properties} }`
      })
      .join('\n  ')

    return `@keyframes ${this.config.name} {\n  ${keyframeRules}\n}`
  }

  /**
   * 生成CSS动画规则
   */
  protected generateCSSAnimationRule(): string {
    const rules = [
      `animation-name: ${this.config.name}`,
      `animation-duration: ${this.config.duration}ms`,
    ]

    if (this.config.delay) {
      rules.push(`animation-delay: ${this.config.delay}ms`)
    }

    if (this.config.timing) {
      rules.push(`animation-timing-function: ${this.config.timing}`)
    }

    if (this.config.iterations) {
      rules.push(`animation-iteration-count: ${this.config.iterations}`)
    }

    if (this.config.direction) {
      rules.push(`animation-direction: ${this.config.direction}`)
    }

    if (this.config.fillMode) {
      rules.push(`animation-fill-mode: ${this.config.fillMode}`)
    }

    return rules.join('; ')
  }

  /**
   * 应用性能优化
   */
  protected applyPerformanceOptimizations(): void {
    if (!this.config.performance) {
      return
    }

    const { performance } = this.config

    this.elements.forEach(element => {
      if (performance.useGPU) {
        element.style.transform = element.style.transform || 'translateZ(0)'
      }

      if (performance.willChange) {
        element.style.willChange = performance.willChange.join(', ')
      }

      if (performance.backfaceVisibility) {
        element.style.backfaceVisibility = performance.backfaceVisibility
      }
    })
  }

  /**
   * 清理性能优化
   */
  protected cleanupPerformanceOptimizations(): void {
    this.elements.forEach(element => {
      element.style.willChange = ''
      element.style.backfaceVisibility = ''
    })
  }

  /**
   * 插值计算
   */
  protected interpolateValue(from: any, to: any, progress: number): string {
    if (typeof from === 'number' && typeof to === 'number') {
      return (from + (to - from) * progress).toString()
    }

    // 对于颜色值的插值
    if (typeof from === 'string' && typeof to === 'string') {
      if (from.startsWith('#') && to.startsWith('#')) {
        return this.interpolateColor(from, to, progress)
      }
    }

    // 对于非数值类型，直接返回目标值
    return progress >= 0.5 ? to : from
  }

  /**
   * 颜色插值
   */
  protected interpolateColor(
    from: string,
    to: string,
    progress: number
  ): string {
    const fromRgb = this.hexToRgb(from)
    const toRgb = this.hexToRgb(to)

    if (!fromRgb || !toRgb) {
      return progress >= 0.5 ? to : from
    }

    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress)
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress)
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress)

    return `rgb(${r}, ${g}, ${b})`
  }

  /**
   * 十六进制颜色转RGB
   */
  protected hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  /**
   * 驼峰转短横线
   */
  protected camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  /**
   * 获取缓动函数
   */
  protected getEasingFunction(easing: string): (t: number) => number {
    switch (easing) {
      case 'linear':
        return (t: number) => t
      case 'ease-in':
        return (t: number) => t * t
      case 'ease-out':
        return (t: number) => t * (2 - t)
      case 'ease-in-out':
        return (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
      default:
        return (t: number) => t
    }
  }

  /**
   * 销毁动画
   */
  destroy(): void {
    this.stop()
    this.cleanupPerformanceOptimizations()
    this.elements = []
    this.config = null as any
  }
}
