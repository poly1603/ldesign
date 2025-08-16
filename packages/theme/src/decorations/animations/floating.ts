/**
 * @ldesign/theme - 漂浮动画
 *
 * 实现各种漂浮动画效果，如幽灵飘浮、气球漂浮等
 */

import type { AnimationConfig } from '../../core/types'
import { BaseAnimation } from './base'

/**
 * 漂浮动画类
 */
export class FloatingAnimation extends BaseAnimation {
  private animationId?: number
  private floaters: Array<{
    element: HTMLElement
    baseX: number
    baseY: number
    offsetX: number
    offsetY: number
    phaseX: number
    phaseY: number
    amplitudeX: number
    amplitudeY: number
    frequencyX: number
    frequencyY: number
    opacity: number
    baseOpacity: number
  }> = []

  constructor(config: AnimationConfig) {
    super(config)
  }

  /**
   * 创建动画
   */
  protected createAnimation(): void {
    if (this.config.type === 'css') {
      this.createCSSAnimation()
    }
    else {
      this.createJSAnimation()
    }
  }

  /**
   * 创建CSS动画
   */
  private createCSSAnimation(): void {
    // 创建样式元素
    const style = document.createElement('style')
    const keyframes = this.generateCSSKeyframes()
    const animationRule = this.generateCSSAnimationRule()

    style.textContent = `
      ${keyframes}
      .animation-${this.config.name} {
        ${animationRule}
      }
    `

    document.head.appendChild(style)

    // 为元素添加动画类
    this.elements.forEach((element, index) => {
      element.classList.add(`animation-${this.config.name}`)

      // 添加随机延迟
      if (this.config.delay) {
        element.style.animationDelay = `${this.config.delay + index * 200}ms`
      }
    })

    // 应用性能优化
    this.applyPerformanceOptimizations()
  }

  /**
   * 创建JavaScript动画
   */
  private createJSAnimation(): void {
    // 初始化漂浮元素
    this.initializeFloaters()

    // 开始动画循环
    this.startAnimationLoop()
  }

  /**
   * 初始化漂浮元素
   */
  private initializeFloaters(): void {
    this.floaters = this.elements.map((element) => {
      const rect = element.getBoundingClientRect()

      return {
        element,
        baseX: rect.left,
        baseY: rect.top,
        offsetX: 0,
        offsetY: 0,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amplitudeX: 10 + Math.random() * 20, // 水平漂浮幅度
        amplitudeY: 5 + Math.random() * 15, // 垂直漂浮幅度
        frequencyX: 0.001 + Math.random() * 0.002, // 水平频率
        frequencyY: 0.0015 + Math.random() * 0.003, // 垂直频率
        opacity: 1,
        baseOpacity: 0.7 + Math.random() * 0.3,
      }
    })
  }

  /**
   * 开始动画循环
   */
  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      if (!this.isRunning) {
        return
      }

      if (!this.isPaused) {
        this.updateFloaters(currentTime)
        this.renderFloaters()
      }

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 更新漂浮元素状态
   */
  private updateFloaters(currentTime: number): void {
    this.floaters.forEach((floater) => {
      // 计算正弦波漂浮
      floater.offsetX
        = Math.sin(currentTime * floater.frequencyX + floater.phaseX)
          * floater.amplitudeX
      floater.offsetY
        = Math.sin(currentTime * floater.frequencyY + floater.phaseY)
          * floater.amplitudeY

      // 计算透明度变化
      floater.opacity
        = floater.baseOpacity
          + Math.sin(currentTime * 0.001 + floater.phaseX) * 0.2
      floater.opacity = Math.max(0.3, Math.min(1, floater.opacity))
    })
  }

  /**
   * 渲染漂浮元素
   */
  private renderFloaters(): void {
    this.floaters.forEach((floater) => {
      const { element, baseX, baseY, offsetX, offsetY, opacity } = floater

      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      element.style.opacity = opacity.toString()
    })
  }

  /**
   * 停止回调
   */
  protected onStop(): void {
    super.onStop()

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }

    // 清理CSS动画
    const styles = document.querySelectorAll(
      `style:contains("${this.config.name}")`,
    )
    styles.forEach((style) => {
      if (style.textContent?.includes(this.config.name)) {
        style.remove()
      }
    })
  }

  /**
   * 创建幽灵漂浮动画
   */
  static createGhostFloat(
    elements: HTMLElement[],
    options: {
      amplitude?: number
      frequency?: number
      opacity?: boolean
    } = {},
  ): FloatingAnimation {
    const { amplitude = 15, frequency = 0.002, opacity = true } = options

    const config: AnimationConfig = {
      name: 'ghost-float',
      type: 'js',
      duration: 4000,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: opacity ? 0.7 : 1,
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: `translateY(-${amplitude * 0.7}px) translateX(${
              amplitude * 0.3
            }px)`,
            opacity: opacity ? 0.8 : 1,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: `translateY(-${amplitude * 0.3}px) translateX(${
              amplitude * 0.7
            }px)`,
            opacity: opacity ? 0.6 : 1,
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: `translateY(-${amplitude}px) translateX(${
              amplitude * 0.3
            }px)`,
            opacity: opacity ? 0.9 : 1,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: opacity ? 0.7 : 1,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    }

    const animation = new FloatingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建气球漂浮动画
   */
  static createBalloonFloat(
    elements: HTMLElement[],
    options: {
      rise?: boolean
      sway?: boolean
      speed?: number
    } = {},
  ): FloatingAnimation {
    const { rise = true, sway = true, speed = 1 } = options

    const config: AnimationConfig = {
      name: 'balloon-float',
      type: 'js',
      duration: 6000 / speed,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: sway
              ? `translateY(${rise ? -5 : 0}px) translateX(8px) rotate(2deg)`
              : `translateY(${rise ? -5 : 0}px) translateX(0px) rotate(0deg)`,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: `translateY(${
              rise ? -10 : 0
            }px) translateX(0px) rotate(0deg)`,
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: sway
              ? `translateY(${rise ? -5 : 0}px) translateX(-8px) rotate(-2deg)`
              : `translateY(${rise ? -5 : 0}px) translateX(0px) rotate(0deg)`,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform'],
        transform3d: true,
      },
    }

    const animation = new FloatingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建云朵漂浮动画
   */
  static createCloudFloat(
    elements: HTMLElement[],
    options: {
      speed?: number
      direction?: 'left' | 'right'
      vertical?: boolean
    } = {},
  ): FloatingAnimation {
    const { speed = 1, direction = 'right', vertical = true } = options

    const horizontalDistance = direction === 'right' ? 50 : -50

    const config: AnimationConfig = {
      name: 'cloud-float',
      type: 'css',
      duration: 20000 / speed,
      iterations: 'infinite',
      timing: 'linear',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: vertical
              ? 'translateX(0px) translateY(0px)'
              : 'translateX(0px)',
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: vertical
              ? `translateX(${horizontalDistance}px) translateY(-10px)`
              : `translateX(${horizontalDistance}px)`,
          },
        },
        {
          offset: 1,
          properties: {
            transform: vertical
              ? 'translateX(0px) translateY(0px)'
              : 'translateX(0px)',
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform'],
        transform3d: true,
      },
    }

    const animation = new FloatingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建水中漂浮动画
   */
  static createUnderwaterFloat(
    elements: HTMLElement[],
    options: {
      intensity?: 'gentle' | 'moderate' | 'strong'
      bubbles?: boolean
    } = {},
  ): FloatingAnimation {
    const { intensity = 'moderate', bubbles = false } = options

    const intensityMap = {
      gentle: { amplitude: 8, frequency: 0.001 },
      moderate: { amplitude: 15, frequency: 0.002 },
      strong: { amplitude: 25, frequency: 0.003 },
    }

    const { amplitude } = intensityMap[intensity]

    const config: AnimationConfig = {
      name: 'underwater-float',
      type: 'js',
      duration: 8000,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            filter: bubbles ? 'blur(0px)' : 'none',
          },
        },
        {
          offset: 0.2,
          properties: {
            transform: `translateY(-${amplitude * 0.3}px) translateX(${
              amplitude * 0.5
            }px) rotate(1deg)`,
            filter: bubbles ? 'blur(0.5px)' : 'none',
          },
        },
        {
          offset: 0.4,
          properties: {
            transform: `translateY(-${amplitude * 0.7}px) translateX(${
              amplitude * 0.2
            }px) rotate(-1deg)`,
            filter: bubbles ? 'blur(0px)' : 'none',
          },
        },
        {
          offset: 0.6,
          properties: {
            transform: `translateY(-${amplitude * 0.4}px) translateX(-${
              amplitude * 0.4
            }px) rotate(2deg)`,
            filter: bubbles ? 'blur(0.3px)' : 'none',
          },
        },
        {
          offset: 0.8,
          properties: {
            transform: `translateY(-${amplitude * 0.1}px) translateX(-${
              amplitude * 0.6
            }px) rotate(-1deg)`,
            filter: bubbles ? 'blur(0.7px)' : 'none',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            filter: bubbles ? 'blur(0px)' : 'none',
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'filter'],
        transform3d: true,
      },
    }

    const animation = new FloatingAnimation(config)
    animation.setElements(elements)

    return animation
  }
}

/**
 * 创建漂浮动画
 */
export function createFloatingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[],
): FloatingAnimation {
  const animation = new FloatingAnimation(config)
  animation.setElements(elements)
  return animation
}
