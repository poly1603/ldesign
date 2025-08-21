/**
 * @ldesign/theme - 下落动画
 *
 * 实现各种下落动画效果，如雪花飘落、金币下落等
 */

import type { AnimationConfig } from '../../core/types'
import { BaseAnimation } from './base'

/**
 * 下落动画类
 */
export class FallingAnimation extends BaseAnimation {
  private animationId?: number
  private particles: Array<{
    element: HTMLElement
    x: number
    y: number
    vx: number
    vy: number
    rotation: number
    rotationSpeed: number
    scale: number
    opacity: number
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
        element.style.animationDelay = `${this.config.delay + index * 100}ms`
      }

      // 添加随机起始位置
      this.randomizeStartPosition(element)
    })

    // 应用性能优化
    this.applyPerformanceOptimizations()
  }

  /**
   * 创建JavaScript动画
   */
  private createJSAnimation(): void {
    // 初始化粒子
    this.initializeParticles()

    // 开始动画循环
    this.startAnimationLoop()
  }

  /**
   * 初始化粒子
   */
  private initializeParticles(): void {
    this.particles = this.elements.map((element) => {
      const rect = element.getBoundingClientRect()

      return {
        element,
        x: rect.left + rect.width / 2,
        y: -rect.height,
        vx: (Math.random() - 0.5) * 2, // 水平速度
        vy: 1 + Math.random() * 2, // 垂直速度
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        scale: 0.8 + Math.random() * 0.4,
        opacity: 0.6 + Math.random() * 0.4,
      }
    })
  }

  /**
   * 开始动画循环
   */
  private startAnimationLoop(): void {
    const animate = () => {
      if (!this.isRunning) {
        return
      }

      if (!this.isPaused) {
        this.updateParticles()
        this.renderParticles()
      }

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 更新粒子状态
   */
  private updateParticles(): void {
    const deltaTime = 16 / 1000 // 假设60fps

    this.particles.forEach((particle) => {
      // 更新位置
      particle.x += particle.vx
      particle.y += particle.vy

      // 更新旋转
      particle.rotation += particle.rotationSpeed

      // 添加重力效果
      particle.vy += 0.1

      // 添加空气阻力
      particle.vx *= 0.999
      particle.vy *= 0.999

      // 边界检测和重置
      if (particle.y > window.innerHeight + 100) {
        this.resetParticle(particle)
      }

      // 水平边界
      if (particle.x < -100 || particle.x > window.innerWidth + 100) {
        particle.vx *= -0.5
      }
    })
  }

  /**
   * 渲染粒子
   */
  private renderParticles(): void {
    this.particles.forEach((particle) => {
      const { element, x, y, rotation, scale, opacity } = particle

      element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`
      element.style.opacity = opacity.toString()
    })
  }

  /**
   * 重置粒子
   */
  private resetParticle(particle: any): void {
    particle.x = Math.random() * window.innerWidth
    particle.y = -100
    particle.vx = (Math.random() - 0.5) * 2
    particle.vy = 1 + Math.random() * 2
    particle.rotation = Math.random() * 360
    particle.rotationSpeed = (Math.random() - 0.5) * 4
    particle.scale = 0.8 + Math.random() * 0.4
    particle.opacity = 0.6 + Math.random() * 0.4
  }

  /**
   * 随机化起始位置
   */
  private randomizeStartPosition(element: HTMLElement): void {
    const randomX = Math.random() * window.innerWidth
    const randomDelay = Math.random() * 2000

    element.style.left = `${randomX}px`
    element.style.animationDelay = `${randomDelay}ms`
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
   * 创建雪花下落动画
   */
  static createSnowfall(
    elements: HTMLElement[],
    options: {
      duration?: number
      intensity?: 'light' | 'medium' | 'heavy'
      wind?: number
    } = {},
  ): FallingAnimation {
    const { duration = 8000, intensity = 'medium', wind = 0 } = options

    const intensityMap = {
      light: { speed: 0.5, drift: 50 },
      medium: { speed: 1, drift: 100 },
      heavy: { speed: 1.5, drift: 150 },
    }

    const { speed, drift } = intensityMap[intensity]

    const config: AnimationConfig = {
      name: 'snowfall',
      type: 'js',
      duration: duration / speed,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-20px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 0.9,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 1,
          properties: {
            transform: `translateY(100vh) translateX(${
              drift + wind
            }px) rotate(360deg)`,
            opacity: 0,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    }

    const animation = new FallingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建金币下落动画
   */
  static createCoinFall(
    elements: HTMLElement[],
    options: {
      duration?: number
      bounce?: boolean
      sparkle?: boolean
    } = {},
  ): FallingAnimation {
    const { duration = 6000, bounce = true, sparkle = true } = options

    const config: AnimationConfig = {
      name: 'coin-fall',
      type: 'js',
      duration,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) rotateY(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 0.9,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) rotateY(720deg)',
            opacity: 0,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    }

    const animation = new FallingAnimation(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 创建花瓣飘落动画
   */
  static createPetalFall(
    elements: HTMLElement[],
    options: {
      duration?: number
      swirl?: boolean
      colors?: string[]
    } = {},
  ): FallingAnimation {
    const { duration = 10000, swirl = true } = options

    const config: AnimationConfig = {
      name: 'petal-fall',
      type: 'js',
      duration,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-20px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.9,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: swirl
              ? 'translateY(50vh) translateX(30px) rotate(180deg)'
              : 'translateY(50vh) rotate(180deg)',
            opacity: 0.7,
          },
        },
        {
          offset: 0.9,
          properties: {
            opacity: 0.5,
          },
        },
        {
          offset: 1,
          properties: {
            transform: swirl
              ? 'translateY(100vh) translateX(0px) rotate(360deg)'
              : 'translateY(100vh) rotate(360deg)',
            opacity: 0,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    }

    const animation = new FallingAnimation(config)
    animation.setElements(elements)

    return animation
  }
}

/**
 * 创建下落动画
 */
export function createFallingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[],
): FallingAnimation {
  const animation = new FallingAnimation(config)
  animation.setElements(elements)
  return animation
}
