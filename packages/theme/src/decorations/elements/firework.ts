/**
 * @ldesign/theme - 烟花装饰元素
 *
 * 实现烟花装饰元素，支持绽放动画和粒子效果
 */

import type { DecorationConfig } from '../../core/types'
import { BaseDecoration } from './base'

/**
 * 烟花装饰元素类
 */
export class FireworkDecoration extends BaseDecoration {
  private particles: HTMLElement[] = []
  private burstAnimation?: Animation
  private particleAnimations: Animation[] = []
  private colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
  ]

  constructor(config: DecorationConfig, container: HTMLElement) {
    super(config, container)
  }

  /**
   * 更新内容
   */
  protected async updateContent(): Promise<void> {
    try {
      if (this.config.type === 'svg' && this.config.src) {
        // 加载SVG内容
        const svgContent = await this.loadSVG(this.config.src)
        this.element.innerHTML = svgContent
      } else {
        // 使用默认烟花图案
        this.element.innerHTML = this.getDefaultFirework()
      }

      // 设置烟花特有的样式
      this.setupFireworkStyles()

      // 创建粒子
      this.createParticles()
    } catch (error) {
      console.error('Failed to load firework content:', error)
      this.element.innerHTML = this.getDefaultFirework()
    }
  }

  /**
   * 加载SVG内容
   */
  private async loadSVG(src: string): Promise<string> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${src}`)
    }
    return response.text()
  }

  /**
   * 获取默认烟花图案
   */
  private getDefaultFirework(): string {
    const color = this.getRandomColor()
    return `
      <svg viewBox="0 0 100 100" fill="none" style="width: 100%; height: 100%;">
        <!-- 烟花中心 -->
        <circle cx="50" cy="50" r="3" fill="${color}"/>
        
        <!-- 烟花射线 -->
        <g stroke="${color}" stroke-width="2" opacity="0.8">
          <line x1="50" y1="50" x2="50" y2="20"/>
          <line x1="50" y1="50" x2="80" y2="50"/>
          <line x1="50" y1="50" x2="50" y2="80"/>
          <line x1="50" y1="50" x2="20" y2="50"/>
          <line x1="50" y1="50" x2="71" y2="29"/>
          <line x1="50" y1="50" x2="71" y2="71"/>
          <line x1="50" y1="50" x2="29" y2="71"/>
          <line x1="50" y1="50" x2="29" y2="29"/>
        </g>
        
        <!-- 烟花光点 -->
        <g fill="${color}" opacity="0.6">
          <circle cx="50" cy="15" r="2"/>
          <circle cx="85" cy="50" r="2"/>
          <circle cx="50" cy="85" r="2"/>
          <circle cx="15" cy="50" r="2"/>
          <circle cx="76" cy="24" r="1.5"/>
          <circle cx="76" cy="76" r="1.5"/>
          <circle cx="24" cy="76" r="1.5"/>
          <circle cx="24" cy="24" r="1.5"/>
        </g>
        
        <!-- 发光效果 -->
        <circle cx="50" cy="50" r="25" fill="url(#fireworkGlow)" opacity="0.3"/>
        
        <defs>
          <radialGradient id="fireworkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </radialGradient>
        </defs>
      </svg>
    `
  }

  /**
   * 获取随机颜色
   */
  private getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)]
  }

  /**
   * 设置烟花特有样式
   */
  private setupFireworkStyles(): void {
    // 设置变换原点为中心
    this.element.style.transformOrigin = 'center center'

    // 初始状态为不可见
    this.element.style.opacity = '0'
    this.element.style.transform = 'scale(0)'

    // 添加烟花特有的CSS类
    this.element.classList.add('firework-decoration')
  }

  /**
   * 创建粒子
   */
  private createParticles(): void {
    const particleCount = 12

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'firework-particle'
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${this.getRandomColor()};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
      `

      this.element.appendChild(particle)
      this.particles.push(particle)
    }
  }

  /**
   * 显示回调
   */
  protected onShow(): void {
    super.onShow()

    // 开始绽放动画
    if (this.config.animation?.includes('burst')) {
      this.startBurstAnimation()
    }
  }

  /**
   * 隐藏回调
   */
  protected onHide(): void {
    super.onHide()

    // 停止所有动画
    this.stopAllAnimations()
  }

  /**
   * 开始绽放动画
   */
  private startBurstAnimation(): void {
    const delay = this.config.animation?.includes('delayed') ? 3000 : 0

    setTimeout(() => {
      this.burst()
    }, delay)
  }

  /**
   * 烟花绽放
   */
  private burst(): void {
    // 主体绽放动画
    const mainKeyframes = [
      {
        transform: 'scale(0) rotate(0deg)',
        opacity: 0,
      },
      {
        transform: 'scale(0.5) rotate(90deg)',
        opacity: 1,
        offset: 0.1,
      },
      {
        transform: 'scale(1.5) rotate(180deg)',
        opacity: 0.8,
        offset: 0.5,
      },
      {
        transform: 'scale(0) rotate(360deg)',
        opacity: 0,
      },
    ]

    this.burstAnimation = this.element.animate(mainKeyframes, {
      duration: 2000,
      easing: 'ease-out',
    })

    // 粒子动画
    this.animateParticles()

    // 动画结束后重置
    this.burstAnimation.addEventListener('finish', () => {
      setTimeout(() => {
        this.reset()
        // 如果是无限循环，重新开始
        if (this.config.animation?.includes('infinite')) {
          setTimeout(() => this.burst(), Math.random() * 3000 + 2000)
        }
      }, 500)
    })
  }

  /**
   * 粒子动画
   */
  private animateParticles(): void {
    this.particles.forEach((particle, index) => {
      const angle = (360 / this.particles.length) * index
      const distance = 30 + Math.random() * 20
      const duration = 1500 + Math.random() * 500

      const keyframes = [
        {
          transform: 'translate(-50%, -50%) scale(0)',
          opacity: 0,
        },
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          offset: 0.1,
        },
        {
          transform: `translate(-50%, -50%) translate(${
            Math.cos((angle * Math.PI) / 180) * distance
          }px, ${Math.sin((angle * Math.PI) / 180) * distance}px) scale(0.5)`,
          opacity: 0.8,
          offset: 0.7,
        },
        {
          transform: `translate(-50%, -50%) translate(${
            Math.cos((angle * Math.PI) / 180) * distance * 1.5
          }px, ${
            Math.sin((angle * Math.PI) / 180) * distance * 1.5
          }px) scale(0)`,
          opacity: 0,
        },
      ]

      const animation = particle.animate(keyframes, {
        duration,
        easing: 'ease-out',
        delay: 100,
      })

      this.particleAnimations.push(animation)
    })
  }

  /**
   * 重置烟花状态
   */
  private reset(): void {
    this.element.style.opacity = '0'
    this.element.style.transform = 'scale(0)'

    this.particles.forEach(particle => {
      particle.style.opacity = '0'
      particle.style.transform = 'translate(-50%, -50%)'
    })
  }

  /**
   * 停止所有动画
   */
  private stopAllAnimations(): void {
    if (this.burstAnimation) {
      this.burstAnimation.cancel()
      this.burstAnimation = undefined
    }

    this.particleAnimations.forEach(animation => {
      animation.cancel()
    })
    this.particleAnimations = []
  }

  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void {
    super.onInteract(type, event)

    if (type === 'click') {
      // 点击时立即绽放
      this.burst()
    }
  }

  /**
   * 手动触发绽放
   */
  public triggerBurst(): void {
    this.burst()
  }

  /**
   * 销毁烟花
   */
  destroy(): void {
    this.stopAllAnimations()

    // 清理粒子
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
    this.particles = []

    super.destroy()
  }

  /**
   * 创建烟花秀
   */
  static createShow(
    container: HTMLElement,
    options: {
      count?: number
      duration?: number
      interval?: number
      colors?: string[]
    } = {}
  ): FireworkDecoration[] {
    const { count = 5, duration = 10000, interval = 1000 } = options

    const fireworks: FireworkDecoration[] = []

    for (let i = 0; i < count; i++) {
      const config: DecorationConfig = {
        id: `firework-show-${i}`,
        name: `烟花秀${i + 1}`,
        type: 'svg',
        src: '',
        position: {
          type: 'fixed',
          position: {
            x: `${20 + Math.random() * 60}%`,
            y: `${20 + Math.random() * 40}%`,
          },
          anchor: 'center',
        },
        style: {
          size: {
            width: 40 + Math.random() * 20,
            height: 40 + Math.random() * 20,
          },
          opacity: 0,
          zIndex: 1000 - i,
        },
        animation: 'firework-burst',
        interactive: false,
        responsive: true,
      }

      const firework = new FireworkDecoration(config, container)
      fireworks.push(firework)
    }

    // 显示烟花并开始表演
    fireworks.forEach((firework, index) => {
      firework.show()

      // 随机延迟触发
      const delay = index * interval + Math.random() * interval
      setTimeout(() => {
        firework.triggerBurst()
      }, delay)
    })

    return fireworks
  }
}

/**
 * 创建烟花装饰元素
 */
export function createFireworkDecoration(
  config: DecorationConfig,
  container: HTMLElement
): FireworkDecoration {
  return new FireworkDecoration(config, container)
}

/**
 * 创建庆祝烟花效果
 */
export function createCelebrationFireworks(
  container: HTMLElement,
  options: {
    intensity?: 'light' | 'medium' | 'heavy'
    duration?: number
    colors?: string[]
  } = {}
): FireworkDecoration[] {
  const { intensity = 'medium', duration = 8000 } = options

  const countMap = {
    light: 3,
    medium: 5,
    heavy: 8,
  }

  const intervalMap = {
    light: 1500,
    medium: 1000,
    heavy: 600,
  }

  return FireworkDecoration.createShow(container, {
    count: countMap[intensity],
    duration,
    interval: intervalMap[intensity],
    colors: options.colors,
  })
}
