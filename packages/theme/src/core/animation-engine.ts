/**
 * @file 动画引擎
 * @description 负责管理和执行节日主题的动画效果
 */

import type { AnimationConfig, IAnimationEngine } from './types'

/**
 * 预定义动画关键帧
 */
const PREDEFINED_ANIMATIONS = {
  // 雪花飘落动画
  snowfall: {
    keyframes: [
      { transform: 'translateY(-100vh) rotate(0deg)', opacity: 0 },
      { transform: 'translateY(0) rotate(180deg)', opacity: 1, offset: 0.1 },
      { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
    ],
    options: { duration: 3000, easing: 'linear' }
  },

  // 灯笼摆动动画
  lanternSwing: {
    keyframes: [
      { transform: 'rotate(-5deg)' },
      { transform: 'rotate(5deg)' },
      { transform: 'rotate(-5deg)' }
    ],
    options: { duration: 2000, easing: 'ease-in-out' }
  },

  // 烟花绽放动画
  firework: {
    keyframes: [
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1, offset: 0.7 },
      { transform: 'scale(1.2)', opacity: 0 }
    ],
    options: { duration: 1500, easing: 'ease-out' }
  },

  // 闪烁动画
  sparkle: {
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0.3, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    options: { duration: 1000, easing: 'ease-in-out' }
  },

  // 发光动画
  glow: {
    keyframes: [
      { filter: 'drop-shadow(0 0 5px currentColor)' },
      { filter: 'drop-shadow(0 0 20px currentColor)' },
      { filter: 'drop-shadow(0 0 5px currentColor)' }
    ],
    options: { duration: 2000, easing: 'ease-in-out' }
  },

  // 浮动动画
  float: {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0px)' }
    ],
    options: { duration: 3000, easing: 'ease-in-out' }
  },

  // 旋转动画
  rotate: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ],
    options: { duration: 2000, easing: 'linear' }
  },

  // 弹跳动画
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-20px)', offset: 0.5 },
      { transform: 'translateY(0)' }
    ],
    options: { duration: 1000, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
  },

  // 脉冲动画
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' }
    ],
    options: { duration: 1500, easing: 'ease-in-out' }
  },

  // 摇摆动画
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ],
    options: { duration: 500, easing: 'ease-in-out' }
  }
}

/**
 * 动画引擎
 * 
 * 负责管理和执行各种动画效果，支持 CSS 动画和 Web Animations API
 * 提供预定义动画和自定义动画注册功能
 * 
 * @example
 * ```typescript
 * const animationEngine = new AnimationEngine()
 * 
 * // 播放预定义动画
 * await animationEngine.play(element, {
 *   name: 'snowfall',
 *   duration: 3000,
 *   iterations: 'infinite'
 * })
 * 
 * // 注册自定义动画
 * animationEngine.registerAnimation('customBounce', [
 *   { transform: 'translateY(0)' },
 *   { transform: 'translateY(-50px)' },
 *   { transform: 'translateY(0)' }
 * ], { duration: 1000 })
 * ```
 */
export class AnimationEngine implements IAnimationEngine {
  private _customAnimations: Map<string, { keyframes: Keyframe[], options?: KeyframeAnimationOptions }> = new Map()
  private _activeAnimations: Map<HTMLElement, Animation[]> = new Map()
  private _isDestroyed = false

  /**
   * 创建动画引擎实例
   */
  constructor() {
    // 注册预定义动画
    Object.entries(PREDEFINED_ANIMATIONS).forEach(([name, config]) => {
      this._customAnimations.set(name, config)
    })
  }

  /**
   * 播放动画
   * @param element 目标元素
   * @param config 动画配置
   */
  async play(element: HTMLElement, config: AnimationConfig): Promise<void> {
    if (this._isDestroyed) {
      throw new Error('AnimationEngine has been destroyed')
    }

    if (!element) {
      throw new Error('Target element is required')
    }

    try {
      // 获取动画定义
      const animationDef = this._getAnimationDefinition(config.name)
      if (!animationDef) {
        throw new Error(`Animation "${config.name}" not found`)
      }

      // 构建动画选项
      const options: KeyframeAnimationOptions = {
        ...animationDef.options,
        duration: config.duration ?? animationDef.options?.duration ?? 1000,
        delay: config.delay ?? 0,
        easing: config.easing ?? animationDef.options?.easing ?? 'ease',
        iterations: config.iterations ?? 1,
        direction: config.direction ?? 'normal',
        fill: config.fillMode ?? 'none'
      }

      // 检查触发条件
      if (config.trigger && config.trigger !== 'manual') {
        await this._waitForTrigger(element, config.trigger)
      }

      // 创建并播放动画
      const animation = element.animate(animationDef.keyframes, options)

      // 保存动画引用
      if (!this._activeAnimations.has(element)) {
        this._activeAnimations.set(element, [])
      }
      this._activeAnimations.get(element)!.push(animation)

      // 自动播放
      if (config.autoplay !== false) {
        animation.play()
      }

      // 等待动画完成
      await animation.finished

      // 清理动画引用
      this._removeAnimationReference(element, animation)

    } catch (error) {
      console.error(`Failed to play animation "${config.name}":`, error)
      throw error
    }
  }

  /**
   * 停止动画
   * @param element 目标元素
   */
  stop(element: HTMLElement): void {
    const animations = this._activeAnimations.get(element)
    if (animations) {
      animations.forEach(animation => {
        animation.cancel()
      })
      this._activeAnimations.delete(element)
    }
  }

  /**
   * 暂停动画
   * @param element 目标元素
   */
  pause(element: HTMLElement): void {
    const animations = this._activeAnimations.get(element)
    if (animations) {
      animations.forEach(animation => {
        animation.pause()
      })
    }
  }

  /**
   * 恢复动画
   * @param element 目标元素
   */
  resume(element: HTMLElement): void {
    const animations = this._activeAnimations.get(element)
    if (animations) {
      animations.forEach(animation => {
        animation.play()
      })
    }
  }

  /**
   * 注册自定义动画
   * @param name 动画名称
   * @param keyframes 关键帧
   * @param options 动画选项
   */
  registerAnimation(name: string, keyframes: Keyframe[], options?: KeyframeAnimationOptions): void {
    this._customAnimations.set(name, { keyframes, options })
  }

  /**
   * 获取已注册的动画列表
   */
  getRegisteredAnimations(): string[] {
    return Array.from(this._customAnimations.keys())
  }

  /**
   * 检查动画是否存在
   * @param name 动画名称
   */
  hasAnimation(name: string): boolean {
    return this._customAnimations.has(name)
  }

  /**
   * 销毁动画引擎
   */
  destroy(): void {
    // 停止所有活动动画
    this._activeAnimations.forEach((animations, element) => {
      animations.forEach(animation => animation.cancel())
    })

    // 清理引用
    this._activeAnimations.clear()
    this._customAnimations.clear()
    this._isDestroyed = true
  }

  /**
   * 获取动画定义
   * @param name 动画名称
   */
  private _getAnimationDefinition(name: string): { keyframes: Keyframe[], options?: KeyframeAnimationOptions } | null {
    return this._customAnimations.get(name) || null
  }

  /**
   * 等待触发条件
   * @param element 目标元素
   * @param trigger 触发类型
   */
  private async _waitForTrigger(element: HTMLElement, trigger: string): Promise<void> {
    return new Promise((resolve) => {
      switch (trigger) {
        case 'load':
          if (document.readyState === 'complete') {
            resolve()
          } else {
            window.addEventListener('load', () => resolve(), { once: true })
          }
          break

        case 'hover':
          element.addEventListener('mouseenter', () => resolve(), { once: true })
          break

        case 'click':
          element.addEventListener('click', () => resolve(), { once: true })
          break

        case 'scroll':
          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              observer.disconnect()
              resolve()
            }
          })
          observer.observe(element)
          break

        default:
          resolve()
      }
    })
  }

  /**
   * 移除动画引用
   * @param element 目标元素
   * @param animation 动画实例
   */
  private _removeAnimationReference(element: HTMLElement, animation: Animation): void {
    const animations = this._activeAnimations.get(element)
    if (animations) {
      const index = animations.indexOf(animation)
      if (index > -1) {
        animations.splice(index, 1)
      }
      if (animations.length === 0) {
        this._activeAnimations.delete(element)
      }
    }
  }
}

/**
 * 全局动画引擎实例
 */
export const globalAnimationEngine = new AnimationEngine()

/**
 * 便捷的动画播放函数
 * @param element 目标元素
 * @param config 动画配置
 */
export async function playAnimation(element: HTMLElement, config: AnimationConfig): Promise<void> {
  return globalAnimationEngine.play(element, config)
}

/**
 * 便捷的动画停止函数
 * @param element 目标元素
 */
export function stopAnimation(element: HTMLElement): void {
  globalAnimationEngine.stop(element)
}

/**
 * 便捷的动画注册函数
 * @param name 动画名称
 * @param keyframes 关键帧
 * @param options 动画选项
 */
export function registerAnimation(name: string, keyframes: Keyframe[], options?: KeyframeAnimationOptions): void {
  globalAnimationEngine.registerAnimation(name, keyframes, options)
}
