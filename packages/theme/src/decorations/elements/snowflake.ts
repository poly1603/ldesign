/**
 * @ldesign/theme - 雪花装饰元素
 *
 * 实现雪花装饰元素，支持多种雪花样式和飘落动画
 */

import type { DecorationConfig } from '../../core/types'
import { BaseDecoration } from './base'

/**
 * 雪花装饰元素类
 */
export class SnowflakeDecoration extends BaseDecoration {
  private svgContent?: string
  private fallAnimation?: Animation

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
        this.svgContent = await this.loadSVG(this.config.src)
        this.element.innerHTML = this.svgContent
      }
      else {
        // 使用默认雪花图案
        this.element.innerHTML = this.getDefaultSnowflake()
      }

      // 设置雪花特有的样式
      this.setupSnowflakeStyles()
    }
    catch (error) {
      console.error('Failed to load snowflake content:', error)
      this.element.innerHTML = this.getDefaultSnowflake()
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
   * 获取默认雪花图案
   */
  private getDefaultSnowflake(): string {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;">
        <path d="M12 2L13.09 8.26L19 7L17.74 9.74L24 12L17.74 14.26L19 17L13.09 15.74L12 22L10.91 15.74L5 17L6.26 14.26L0 12L6.26 9.74L5 7L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
        <circle cx="12" cy="12" r="1" fill="white"/>
      </svg>
    `
  }

  /**
   * 设置雪花特有样式
   */
  private setupSnowflakeStyles(): void {
    // 设置雪花颜色
    this.element.style.color = 'white'

    // 添加阴影效果
    this.element.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))'

    // 设置混合模式
    this.element.style.mixBlendMode = 'screen'

    // 添加雪花特有的CSS类
    this.element.classList.add('snowflake-decoration')
  }

  /**
   * 显示回调
   */
  protected onShow(): void {
    super.onShow()

    // 开始飘落动画
    if (
      this.config.animation === 'snowfall'
      || this.config.animation?.includes('snowfall')
    ) {
      this.startFallAnimation()
    }
  }

  /**
   * 隐藏回调
   */
  protected onHide(): void {
    super.onHide()

    // 停止飘落动画
    if (this.fallAnimation) {
      this.fallAnimation.cancel()
      this.fallAnimation = undefined
    }
  }

  /**
   * 开始飘落动画
   */
  private startFallAnimation(): void {
    const duration = this.getFallDuration()
    const keyframes = this.getFallKeyframes()

    this.fallAnimation = this.element.animate(keyframes, {
      duration,
      iterations: Infinity,
      easing: 'linear',
    })

    // 添加随机延迟
    this.fallAnimation.currentTime = Math.random() * duration
  }

  /**
   * 获取飘落持续时间
   */
  private getFallDuration(): number {
    const animationName = this.config.animation || 'snowfall'

    switch (animationName) {
      case 'snowfall-slow':
        return 12000 + Math.random() * 3000 // 12-15秒
      case 'snowfall-fast':
        return 5000 + Math.random() * 2000 // 5-7秒
      default:
        return 8000 + Math.random() * 2000 // 8-10秒
    }
  }

  /**
   * 获取飘落关键帧
   */
  private getFallKeyframes(): Keyframe[] {
    const startX = this.getRandomStartX()
    const endX = startX + this.getRandomDrift()
    const rotation = Math.random() * 360

    return [
      {
        transform: `translateY(-20px) translateX(${startX}px) rotate(${rotation}deg)`,
        opacity: 0,
      },
      {
        transform: `translateY(10vh) translateX(${startX + this.getRandomDrift() * 0.3
        }px) rotate(${rotation + 90}deg)`,
        opacity: 0.8,
        offset: 0.1,
      },
      {
        transform: `translateY(90vh) translateX(${startX + this.getRandomDrift() * 0.7
        }px) rotate(${rotation + 270}deg)`,
        opacity: 0.8,
        offset: 0.9,
      },
      {
        transform: `translateY(100vh) translateX(${endX}px) rotate(${rotation + 360
        }deg)`,
        opacity: 0,
      },
    ]
  }

  /**
   * 获取随机起始X位置
   */
  private getRandomStartX(): number {
    return (Math.random() - 0.5) * 100 // -50px 到 50px
  }

  /**
   * 获取随机漂移距离
   */
  private getRandomDrift(): number {
    return (Math.random() - 0.5) * 200 // -100px 到 100px
  }

  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void {
    super.onInteract(type, event)

    if (type === 'click') {
      // 点击时产生闪烁效果
      this.sparkle()
    }
  }

  /**
   * 闪烁效果
   */
  private sparkle(): void {
    const originalFilter = this.element.style.filter

    this.element.style.filter = 'drop-shadow(0 0 10px white) brightness(1.5)'

    setTimeout(() => {
      this.element.style.filter = originalFilter
    }, 200)
  }

  /**
   * 创建多个雪花实例
   */
  static createMultiple(
    count: number,
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>,
  ): SnowflakeDecoration[] {
    const snowflakes: SnowflakeDecoration[] = []

    for (let i = 0; i < count; i++) {
      const config: DecorationConfig = {
        id: `snowflake-${i}`,
        name: `雪花${i + 1}`,
        type: 'svg',
        src: baseConfig.src || '',
        position: {
          type: 'fixed',
          position: {
            x: `${Math.random() * 100}%`,
            y: '-20px',
          },
          anchor: 'top-left',
        },
        style: {
          size: {
            width: 15 + Math.random() * 15, // 15-30px
            height: 15 + Math.random() * 15,
          },
          opacity: 0.6 + Math.random() * 0.3, // 0.6-0.9
          zIndex: 1000 - i,
        },
        animation: SnowflakeDecoration.getRandomAnimation(),
        interactive: false,
        responsive: true,
        ...baseConfig,
      }

      const snowflake = new SnowflakeDecoration(config, container)
      snowflakes.push(snowflake)
    }

    return snowflakes
  }

  /**
   * 获取随机动画类型
   */
  private static getRandomAnimation(): string {
    const animations = ['snowfall', 'snowfall-slow', 'snowfall-fast']
    return animations[Math.floor(Math.random() * animations.length)]
  }

  /**
   * 批量显示雪花
   */
  static showMultiple(snowflakes: SnowflakeDecoration[], delay = 100): void {
    snowflakes.forEach((snowflake, index) => {
      setTimeout(() => {
        snowflake.show()
      }, index * delay)
    })
  }

  /**
   * 批量隐藏雪花
   */
  static hideMultiple(snowflakes: SnowflakeDecoration[]): void {
    snowflakes.forEach((snowflake) => {
      snowflake.hide()
    })
  }

  /**
   * 批量销毁雪花
   */
  static destroyMultiple(snowflakes: SnowflakeDecoration[]): void {
    snowflakes.forEach((snowflake) => {
      snowflake.destroy()
    })
  }
}

/**
 * 创建雪花装饰元素
 */
export function createSnowflakeDecoration(
  config: DecorationConfig,
  container: HTMLElement,
): SnowflakeDecoration {
  return new SnowflakeDecoration(config, container)
}

/**
 * 创建雪花群效果
 */
export function createSnowfallEffect(
  container: HTMLElement,
  options: {
    count?: number
    duration?: number
    intensity?: 'light' | 'medium' | 'heavy'
    size?: 'small' | 'medium' | 'large' | 'mixed'
  } = {},
): SnowflakeDecoration[] {
  const { count = 20, intensity = 'medium' } = options

  const baseConfig: Partial<DecorationConfig> = {
    type: 'svg',
    interactive: false,
    responsive: true,
  }

  // 根据强度调整参数
  let actualCount = count
  switch (intensity) {
    case 'light':
      actualCount = Math.floor(count * 0.5)
      break
    case 'heavy':
      actualCount = Math.floor(count * 1.5)
      break
  }

  const snowflakes = SnowflakeDecoration.createMultiple(
    actualCount,
    container,
    baseConfig,
  )

  // 显示雪花
  SnowflakeDecoration.showMultiple(snowflakes, 50)

  return snowflakes
}
