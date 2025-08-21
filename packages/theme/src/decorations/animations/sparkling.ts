/**
 * @ldesign/theme - 闪烁动画
 *
 * 实现各种闪烁动画效果，如星光闪烁、发光效果等
 */

import type { AnimationConfig } from '../../core/types'
import { BaseAnimation } from './base'

/**
 * 闪烁动画类
 */
export class SparklingAnimation extends BaseAnimation {
  private animationId?: number
  private sparklers: Array<{
    element: HTMLElement
    baseOpacity: number
    currentOpacity: number
    phase: number
    frequency: number
    intensity: number
    glowColor: string
    sparklePoints: Array<{
      x: number
      y: number
      size: number
      opacity: number
      phase: number
    }>
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
        element.style.animationDelay = `${this.config.delay + index * 300}ms`
      }
    })

    // 应用性能优化
    this.applyPerformanceOptimizations()
  }

  /**
   * 创建JavaScript动画
   */
  private createJSAnimation(): void {
    // 初始化闪烁元素
    this.initializeSparklers()

    // 开始动画循环
    this.startAnimationLoop()
  }

  /**
   * 初始化闪烁元素
   */
  private initializeSparklers(): void {
    this.sparklers = this.elements.map((element) => {
      const sparklePoints = this.createSparklePoints(element)

      return {
        element,
        baseOpacity: Number.parseFloat(getComputedStyle(element).opacity) || 1,
        currentOpacity: 1,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.002 + Math.random() * 0.003,
        intensity: 0.3 + Math.random() * 0.7,
        glowColor: this.getElementGlowColor(element),
        sparklePoints,
      }
    })
  }

  /**
   * 创建闪烁点
   */
  private createSparklePoints(element: HTMLElement): Array<any> {
    const rect = element.getBoundingClientRect()
    const pointCount = 3 + Math.floor(Math.random() * 5)
    const points = []

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: 2 + Math.random() * 4,
        opacity: 0,
        phase: Math.random() * Math.PI * 2,
      })
    }

    return points
  }

  /**
   * 获取元素发光颜色
   */
  private getElementGlowColor(element: HTMLElement): string {
    const computedStyle = getComputedStyle(element)
    const color = computedStyle.color || computedStyle.backgroundColor

    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      return color
    }

    // 默认颜色
    return '#FFD700' // 金色
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
        this.updateSparklers(currentTime)
        this.renderSparklers()
      }

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 更新闪烁元素状态
   */
  private updateSparklers(currentTime: number): void {
    this.sparklers.forEach((sparkler) => {
      // 更新主要透明度
      const opacityWave = Math.sin(
        currentTime * sparkler.frequency + sparkler.phase,
      )
      sparkler.currentOpacity
        = sparkler.baseOpacity * (0.5 + 0.5 * opacityWave * sparkler.intensity)

      // 更新闪烁点
      sparkler.sparklePoints.forEach((point) => {
        const pointWave = Math.sin(currentTime * 0.005 + point.phase)
        point.opacity = Math.max(0, pointWave * 0.8)
      })
    })
  }

  /**
   * 渲染闪烁元素
   */
  private renderSparklers(): void {
    this.sparklers.forEach((sparkler) => {
      const { element, currentOpacity, glowColor, sparklePoints } = sparkler

      // 设置主元素透明度和发光效果
      element.style.opacity = currentOpacity.toString()

      const glowIntensity = currentOpacity * 10
      element.style.filter = `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`

      // 渲染闪烁点
      this.renderSparklePoints(element, sparklePoints)
    })
  }

  /**
   * 渲染闪烁点
   */
  private renderSparklePoints(element: HTMLElement, points: Array<any>): void {
    // 移除旧的闪烁点
    const oldPoints = element.querySelectorAll('.sparkle-point')
    oldPoints.forEach(point => point.remove())

    // 添加新的闪烁点
    points.forEach((point) => {
      if (point.opacity > 0.1) {
        const sparkleElement = document.createElement('div')
        sparkleElement.className = 'sparkle-point'
        sparkleElement.style.cssText = `
          position: absolute;
          left: ${point.x}px;
          top: ${point.y}px;
          width: ${point.size}px;
          height: ${point.size}px;
          background: radial-gradient(circle, white 0%, transparent 70%);
          border-radius: 50%;
          opacity: ${point.opacity};
          pointer-events: none;
          z-index: 1000;
        `

        element.appendChild(sparkleElement)
      }
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

    // 清理闪烁点
    this.elements.forEach((element) => {
      const sparklePoints = element.querySelectorAll('.sparkle-point')
      sparklePoints.forEach(point => point.remove())
    })

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
   * 创建星光闪烁动画
   */
  static createStarSparkle(
    elements: HTMLElement[],
    options: {
      intensity?: 'subtle' | 'moderate' | 'intense'
      color?: string
      frequency?: number
    } = {},
  ): SparklingAnimation {
    const {
      intensity = 'moderate',
      color = '#FFD700',
      frequency = 0.003,
    } = options

    const intensityMap = {
      subtle: { amplitude: 0.2, glowSize: 5 },
      moderate: { amplitude: 0.5, glowSize: 10 },
      intense: { amplitude: 0.8, glowSize: 20 },
    }

    const { amplitude, glowSize } = intensityMap[intensity]

    const config: AnimationConfig = {
      name: 'star-sparkle',
      type: 'js',
      duration: 2000,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            opacity: 1 - amplitude,
            filter: `drop-shadow(0 0 ${glowSize * 0.5}px ${color})`,
          },
        },
        {
          offset: 0.5,
          properties: {
            opacity: 1,
            filter: `drop-shadow(0 0 ${glowSize}px ${color})`,
          },
        },
        {
          offset: 1,
          properties: {
            opacity: 1 - amplitude,
            filter: `drop-shadow(0 0 ${glowSize * 0.5}px ${color})`,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['opacity', 'filter'],
        transform3d: true,
      },
    }

    const animation = new SparklingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建霓虹灯闪烁动画
   */
  static createNeonFlicker(
    elements: HTMLElement[],
    options: {
      color?: string
      flickerRate?: number
      glowIntensity?: number
    } = {},
  ): SparklingAnimation {
    const { color = '#00FFFF', flickerRate = 0.1, glowIntensity = 15 } = options

    const config: AnimationConfig = {
      name: 'neon-flicker',
      type: 'js',
      duration: 100,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            opacity: 1,
            filter: `drop-shadow(0 0 ${glowIntensity}px ${color}) brightness(1)`,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.8,
            filter: `drop-shadow(0 0 ${
              glowIntensity * 0.5
            }px ${color}) brightness(0.8)`,
          },
        },
        {
          offset: 0.2,
          properties: {
            opacity: 1,
            filter: `drop-shadow(0 0 ${glowIntensity}px ${color}) brightness(1)`,
          },
        },
        {
          offset: 1,
          properties: {
            opacity: 1,
            filter: `drop-shadow(0 0 ${glowIntensity}px ${color}) brightness(1)`,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['opacity', 'filter'],
        transform3d: true,
      },
    }

    const animation = new SparklingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建魔法闪烁动画
   */
  static createMagicSparkle(
    elements: HTMLElement[],
    options: {
      colors?: string[]
      particleCount?: number
      duration?: number
    } = {},
  ): SparklingAnimation {
    const {
      colors = ['#FFD700', '#FF69B4', '#00FFFF', '#98FB98'],
      particleCount = 8,
      duration = 3000,
    } = options

    const config: AnimationConfig = {
      name: 'magic-sparkle',
      type: 'js',
      duration,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            opacity: 0.7,
            transform: 'scale(1) rotate(0deg)',
            filter: 'hue-rotate(0deg) brightness(1)',
          },
        },
        {
          offset: 0.25,
          properties: {
            opacity: 1,
            transform: 'scale(1.1) rotate(90deg)',
            filter: 'hue-rotate(90deg) brightness(1.2)',
          },
        },
        {
          offset: 0.5,
          properties: {
            opacity: 0.8,
            transform: 'scale(0.9) rotate(180deg)',
            filter: 'hue-rotate(180deg) brightness(1)',
          },
        },
        {
          offset: 0.75,
          properties: {
            opacity: 1,
            transform: 'scale(1.05) rotate(270deg)',
            filter: 'hue-rotate(270deg) brightness(1.1)',
          },
        },
        {
          offset: 1,
          properties: {
            opacity: 0.7,
            transform: 'scale(1) rotate(360deg)',
            filter: 'hue-rotate(360deg) brightness(1)',
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['opacity', 'transform', 'filter'],
        transform3d: true,
      },
    }

    const animation = new SparklingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建呼吸灯效果
   */
  static createBreathingLight(
    elements: HTMLElement[],
    options: {
      color?: string
      minOpacity?: number
      maxOpacity?: number
      duration?: number
    } = {},
  ): SparklingAnimation {
    const {
      color = '#FFFFFF',
      minOpacity = 0.3,
      maxOpacity = 1,
      duration = 4000,
    } = options

    const config: AnimationConfig = {
      name: 'breathing-light',
      type: 'css',
      duration,
      iterations: 'infinite',
      direction: 'alternate',
      timing: 'ease-in-out',
      keyframes: [
        {
          offset: 0,
          properties: {
            opacity: minOpacity,
            filter: `drop-shadow(0 0 5px ${color})`,
          },
        },
        {
          offset: 1,
          properties: {
            opacity: maxOpacity,
            filter: `drop-shadow(0 0 20px ${color})`,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['opacity', 'filter'],
        transform3d: true,
      },
    }

    const animation = new SparklingAnimation(config)
    animation.setElements(elements)

    return animation
  }
}

/**
 * 创建闪烁动画
 */
export function createSparklingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[],
): SparklingAnimation {
  const animation = new SparklingAnimation(config)
  animation.setElements(elements)
  return animation
}
