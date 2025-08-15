/**
 * @ldesign/theme - 动画管理器
 *
 * 负责主题动画的管理和控制
 */

import type { AnimationManagerInstance, AnimationConfig } from './types'
import type { EventEmitter } from '../utils/event-emitter'

/**
 * 动画实例
 */
interface AnimationInstance {
  config: AnimationConfig
  elements: HTMLElement[]
  animation?: Animation
  isRunning: boolean
  isPaused: boolean
}

/**
 * CSS 动画实例
 */
interface CSSAnimationInstance extends AnimationInstance {
  styleElement: HTMLStyleElement
}

/**
 * JavaScript 动画实例
 */
interface JSAnimationInstance extends AnimationInstance {
  animationId?: number
  startTime?: number
  pausedTime?: number
}

/**
 * 动画管理器实现
 */
export class AnimationManager implements AnimationManagerInstance {
  private animations = new Map<string, AnimationInstance>()
  private eventEmitter: EventEmitter
  private container: HTMLElement

  constructor(container: HTMLElement, eventEmitter: EventEmitter) {
    this.container = container
    this.eventEmitter = eventEmitter
  }

  /**
   * 注册动画
   */
  register(animation: AnimationConfig): void {
    if (this.animations.has(animation.name)) {
      console.warn(`Animation "${animation.name}" already exists`)
      return
    }

    const instance = this.createAnimationInstance(animation)
    this.animations.set(animation.name, instance)
  }

  /**
   * 注销动画
   */
  unregister(name: string): void {
    const instance = this.animations.get(name)
    if (instance) {
      this.stop(name)
      this.animations.delete(name)
    }
  }

  /**
   * 开始动画
   */
  start(name: string): void {
    const instance = this.animations.get(name)
    if (!instance) {
      console.warn(`Animation "${name}" not found`)
      return
    }

    if (instance.isRunning) {
      return
    }

    this.startAnimation(instance)
    this.eventEmitter.emit('animation-started', { animation: name })
  }

  /**
   * 停止动画
   */
  stop(name: string): void {
    const instance = this.animations.get(name)
    if (!instance) {
      return
    }

    if (!instance.isRunning) {
      return
    }

    this.stopAnimation(instance)
    this.eventEmitter.emit('animation-ended', { animation: name })
  }

  /**
   * 暂停动画
   */
  pause(name: string): void {
    const instance = this.animations.get(name)
    if (!instance || !instance.isRunning || instance.isPaused) {
      return
    }

    this.pauseAnimation(instance)
  }

  /**
   * 恢复动画
   */
  resume(name: string): void {
    const instance = this.animations.get(name)
    if (!instance || !instance.isRunning || !instance.isPaused) {
      return
    }

    this.resumeAnimation(instance)
  }

  /**
   * 获取所有动画配置
   */
  getAll(): AnimationConfig[] {
    return Array.from(this.animations.values()).map(instance => instance.config)
  }

  /**
   * 检查动画是否正在运行
   */
  isRunning(name: string): boolean {
    const instance = this.animations.get(name)
    return instance ? instance.isRunning : false
  }

  /**
   * 销毁动画管理器
   */
  destroy(): void {
    for (const name of this.animations.keys()) {
      this.stop(name)
    }
    this.animations.clear()
  }

  /**
   * 创建动画实例
   */
  private createAnimationInstance(config: AnimationConfig): AnimationInstance {
    const elements = this.findElements(config.elements || [])

    const baseInstance = {
      config,
      elements,
      isRunning: false,
      isPaused: false,
    }

    switch (config.type) {
      case 'css':
        return {
          ...baseInstance,
          styleElement: this.createCSSAnimation(config),
        } as CSSAnimationInstance

      case 'js':
        return {
          ...baseInstance,
        } as JSAnimationInstance

      default:
        return baseInstance
    }
  }

  /**
   * 查找动画目标元素
   */
  private findElements(selectors: string[]): HTMLElement[] {
    const elements: HTMLElement[] = []

    for (const selector of selectors) {
      const found = this.container.querySelectorAll(selector)
      elements.push(...(Array.from(found) as HTMLElement[]))
    }

    return elements
  }

  /**
   * 创建 CSS 动画
   */
  private createCSSAnimation(config: AnimationConfig): HTMLStyleElement {
    const style = document.createElement('style')
    const keyframes = this.generateCSSKeyframes(config)
    const animationRule = this.generateCSSAnimationRule(config)

    style.textContent = `
      ${keyframes}
      .${config.name} {
        ${animationRule}
      }
    `

    return style
  }

  /**
   * 生成 CSS 关键帧
   */
  private generateCSSKeyframes(config: AnimationConfig): string {
    if (!config.keyframes || config.keyframes.length === 0) {
      return ''
    }

    const keyframeRules = config.keyframes
      .map(keyframe => {
        const percentage = Math.round(keyframe.offset * 100)
        const properties = Object.entries(keyframe.properties)
          .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value}`)
          .join('; ')

        return `${percentage}% { ${properties} }`
      })
      .join('\n  ')

    return `@keyframes ${config.name} {\n  ${keyframeRules}\n}`
  }

  /**
   * 生成 CSS 动画规则
   */
  private generateCSSAnimationRule(config: AnimationConfig): string {
    const rules = [
      `animation-name: ${config.name}`,
      `animation-duration: ${config.duration}ms`,
    ]

    if (config.delay) {
      rules.push(`animation-delay: ${config.delay}ms`)
    }

    if (config.timing) {
      rules.push(`animation-timing-function: ${config.timing}`)
    }

    if (config.iterations) {
      rules.push(`animation-iteration-count: ${config.iterations}`)
    }

    if (config.direction) {
      rules.push(`animation-direction: ${config.direction}`)
    }

    if (config.fillMode) {
      rules.push(`animation-fill-mode: ${config.fillMode}`)
    }

    if (config.playState) {
      rules.push(`animation-play-state: ${config.playState}`)
    }

    return rules.join('; ')
  }

  /**
   * 开始动画
   */
  private startAnimation(instance: AnimationInstance): void {
    switch (instance.config.type) {
      case 'css':
        this.startCSSAnimation(instance as CSSAnimationInstance)
        break
      case 'js':
        this.startJSAnimation(instance as JSAnimationInstance)
        break
    }

    instance.isRunning = true
    instance.isPaused = false
  }

  /**
   * 停止动画
   */
  private stopAnimation(instance: AnimationInstance): void {
    switch (instance.config.type) {
      case 'css':
        this.stopCSSAnimation(instance as CSSAnimationInstance)
        break
      case 'js':
        this.stopJSAnimation(instance as JSAnimationInstance)
        break
    }

    instance.isRunning = false
    instance.isPaused = false
  }

  /**
   * 暂停动画
   */
  private pauseAnimation(instance: AnimationInstance): void {
    switch (instance.config.type) {
      case 'css':
        this.pauseCSSAnimation(instance as CSSAnimationInstance)
        break
      case 'js':
        this.pauseJSAnimation(instance as JSAnimationInstance)
        break
    }

    instance.isPaused = true
  }

  /**
   * 恢复动画
   */
  private resumeAnimation(instance: AnimationInstance): void {
    switch (instance.config.type) {
      case 'css':
        this.resumeCSSAnimation(instance as CSSAnimationInstance)
        break
      case 'js':
        this.resumeJSAnimation(instance as JSAnimationInstance)
        break
    }

    instance.isPaused = false
  }

  /**
   * 开始 CSS 动画
   */
  private startCSSAnimation(instance: CSSAnimationInstance): void {
    // 添加样式到文档
    document.head.appendChild(instance.styleElement)

    // 为元素添加动画类
    instance.elements.forEach(element => {
      element.classList.add(instance.config.name)
    })
  }

  /**
   * 停止 CSS 动画
   */
  private stopCSSAnimation(instance: CSSAnimationInstance): void {
    // 移除动画类
    instance.elements.forEach(element => {
      element.classList.remove(instance.config.name)
    })

    // 移除样式
    if (instance.styleElement.parentNode) {
      instance.styleElement.parentNode.removeChild(instance.styleElement)
    }
  }

  /**
   * 暂停 CSS 动画
   */
  private pauseCSSAnimation(instance: CSSAnimationInstance): void {
    instance.elements.forEach(element => {
      element.style.animationPlayState = 'paused'
    })
  }

  /**
   * 恢复 CSS 动画
   */
  private resumeCSSAnimation(instance: CSSAnimationInstance): void {
    instance.elements.forEach(element => {
      element.style.animationPlayState = 'running'
    })
  }

  /**
   * 开始 JavaScript 动画
   */
  private startJSAnimation(instance: JSAnimationInstance): void {
    instance.startTime = performance.now()

    const animate = (currentTime: number) => {
      if (!instance.isRunning) {
        return
      }

      if (instance.isPaused) {
        instance.animationId = requestAnimationFrame(animate)
        return
      }

      const elapsed = currentTime - (instance.startTime || 0)
      const progress = Math.min(elapsed / instance.config.duration, 1)

      this.updateJSAnimation(instance, progress)

      if (progress < 1) {
        instance.animationId = requestAnimationFrame(animate)
      } else {
        this.handleAnimationComplete(instance)
      }
    }

    instance.animationId = requestAnimationFrame(animate)
  }

  /**
   * 停止 JavaScript 动画
   */
  private stopJSAnimation(instance: JSAnimationInstance): void {
    if (instance.animationId) {
      cancelAnimationFrame(instance.animationId)
      instance.animationId = undefined
    }
  }

  /**
   * 暂停 JavaScript 动画
   */
  private pauseJSAnimation(instance: JSAnimationInstance): void {
    instance.pausedTime = performance.now()
  }

  /**
   * 恢复 JavaScript 动画
   */
  private resumeJSAnimation(instance: JSAnimationInstance): void {
    if (instance.pausedTime && instance.startTime) {
      const pauseDuration = performance.now() - instance.pausedTime
      instance.startTime += pauseDuration
      instance.pausedTime = undefined
    }
  }

  /**
   * 更新 JavaScript 动画
   */
  private updateJSAnimation(
    instance: JSAnimationInstance,
    progress: number
  ): void {
    if (!instance.config.keyframes) {
      return
    }

    // 找到当前进度对应的关键帧
    const keyframes = instance.config.keyframes
    let currentKeyframe = keyframes[0]
    let nextKeyframe = keyframes[1]

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (
        progress >= keyframes[i].offset &&
        progress <= keyframes[i + 1].offset
      ) {
        currentKeyframe = keyframes[i]
        nextKeyframe = keyframes[i + 1]
        break
      }
    }

    if (!nextKeyframe) {
      nextKeyframe = currentKeyframe
    }

    // 计算插值
    const localProgress =
      nextKeyframe.offset === currentKeyframe.offset
        ? 0
        : (progress - currentKeyframe.offset) /
          (nextKeyframe.offset - currentKeyframe.offset)

    // 应用插值后的样式
    instance.elements.forEach(element => {
      this.applyInterpolatedStyles(
        element,
        currentKeyframe.properties,
        nextKeyframe.properties,
        localProgress
      )
    })
  }

  /**
   * 应用插值样式
   */
  private applyInterpolatedStyles(
    element: HTMLElement,
    from: Record<string, any>,
    to: Record<string, any>,
    progress: number
  ): void {
    for (const prop in from) {
      const fromValue = from[prop]
      const toValue = to[prop] || fromValue
      const interpolatedValue = this.interpolateValue(
        fromValue,
        toValue,
        progress
      )

      element.style.setProperty(this.camelToKebab(prop), interpolatedValue)
    }
  }

  /**
   * 插值计算
   */
  private interpolateValue(from: any, to: any, progress: number): string {
    if (typeof from === 'number' && typeof to === 'number') {
      return (from + (to - from) * progress).toString()
    }

    // 对于非数值类型，直接返回目标值
    return progress >= 0.5 ? to : from
  }

  /**
   * 处理动画完成
   */
  private handleAnimationComplete(instance: JSAnimationInstance): void {
    const iterations = instance.config.iterations

    if (iterations === 'infinite') {
      // 重新开始
      this.startJSAnimation(instance)
    } else if (typeof iterations === 'number' && iterations > 1) {
      // 减少迭代次数并重新开始
      instance.config.iterations = iterations - 1
      this.startJSAnimation(instance)
    } else {
      // 动画结束
      instance.isRunning = false
      this.eventEmitter.emit('animation-ended', {
        animation: instance.config.name,
      })
    }
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}

/**
 * 创建动画管理器实例
 */
export function createAnimationManager(
  container: HTMLElement,
  eventEmitter: EventEmitter
): AnimationManagerInstance {
  return new AnimationManager(container, eventEmitter)
}
