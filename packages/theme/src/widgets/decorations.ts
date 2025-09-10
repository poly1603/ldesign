/**
 * @file 装饰挂件实现类
 * @description 提供各种装饰挂件的具体实现
 */

import type { WidgetConfig } from '../core/types'

/**
 * 基础装饰类
 * 所有装饰挂件的基类，提供通用功能
 */
export abstract class BaseDecoration {
  protected element: HTMLElement | null = null
  protected isVisible = false
  protected animationInstance: Animation | null = null

  constructor(
    protected config: WidgetConfig,
    protected container: HTMLElement
  ) {
    this.createElement()
    this.applyStyles()
  }

  /**
   * 获取挂件配置
   */
  getConfig(): WidgetConfig {
    return { ...this.config }
  }

  /**
   * 获取挂件DOM元素
   */
  getElement(): HTMLElement | null {
    return this.element
  }

  /**
   * 显示挂件
   */
  show(): void {
    if (!this.element || this.isVisible) return

    this.container.appendChild(this.element)
    this.applyStyles()
    this.startAnimation()
    this.isVisible = true
  }

  /**
   * 隐藏挂件
   */
  hide(): void {
    if (!this.element || !this.isVisible) return

    this.stopAnimation()
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.isVisible = false
  }

  /**
   * 是否已显示
   */
  isShown(): boolean {
    return this.isVisible
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...updates }
    if (this.isVisible) {
      this.applyStyles()
    }
  }

  /**
   * 销毁挂件
   */
  destroy(): void {
    this.hide()
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
    this.animationInstance = null
  }

  /**
   * 创建DOM元素
   */
  protected createElement(): void {
    this.element = document.createElement('div')
    this.element.className = `widget widget-${this.config.type} widget-${this.config.id}`
    this.element.innerHTML = this.config.content
    this.element.setAttribute('data-decoration-id', this.config.id)

    // 设置基础样式
    this.element.style.position = this.config.position.type
    this.element.style.pointerEvents = this.config.interactive ? 'auto' : 'none'
    this.element.style.userSelect = 'none'
  }

  /**
   * 应用样式
   */
  protected applyStyles(): void {
    if (!this.element) return

    const { position, style } = this.config

    // 设置定位
    this.element.style.position = position.type
    if (position.position.x) {
      this.element.style.left = position.position.x
    }
    if (position.position.y) {
      this.element.style.top = position.position.y
    }

    // 设置样式
    if (style) {
      if (style.size) {
        if (style.size.width) {
          this.element.style.width = typeof style.size.width === 'string' ? style.size.width : `${style.size.width}px`
        }
        if (style.size.height) {
          this.element.style.height = typeof style.size.height === 'string' ? style.size.height : `${style.size.height}px`
        }
      }
      if (style.opacity !== undefined) {
        this.element.style.opacity = style.opacity.toString()
      }
      if (style.zIndex !== undefined) {
        this.element.style.zIndex = style.zIndex.toString()
      }
    }

    // 设置锚点
    this.applyAnchor()
  }

  /**
   * 应用锚点定位
   */
  protected applyAnchor(): void {
    if (!this.element) return

    const anchor = this.config.position.anchor
    switch (anchor) {
      case 'center':
        this.element.style.transform = 'translate(-50%, -50%)'
        break
      case 'top-left':
        this.element.style.transform = 'translate(0, 0)'
        break
      case 'top-right':
        this.element.style.transform = 'translate(-100%, 0)'
        break
      case 'bottom-left':
        this.element.style.transform = 'translate(0, -100%)'
        break
      case 'bottom-right':
        this.element.style.transform = 'translate(-100%, -100%)'
        break
      case 'top-center':
        this.element.style.transform = 'translate(-50%, 0)'
        break
      case 'bottom-center':
        this.element.style.transform = 'translate(-50%, -100%)'
        break
    }
  }

  /**
   * 开始动画
   */
  protected startAnimation(): void {
    if (!this.element || !this.config.animation) return

    const { animation } = this.config
    if (!animation.autoplay) return

    // 停止现有动画
    this.stopAnimation()

    // 创建新动画
    const keyframes = this.getAnimationKeyframes(animation.name)
    if (keyframes) {
      this.animationInstance = this.element.animate(keyframes, {
        duration: animation.duration,
        iterations: animation.iterations === 'infinite' ? Infinity : animation.iterations,
        easing: animation.easing || 'ease-in-out',
        fill: 'both'
      })
    }
  }

  /**
   * 停止动画
   */
  protected stopAnimation(): void {
    if (this.animationInstance) {
      this.animationInstance.cancel()
      this.animationInstance = null
    }
  }

  /**
   * 获取动画关键帧
   */
  protected getAnimationKeyframes(name: string): Keyframe[] | null {
    const animations: Record<string, Keyframe[]> = {
      pulse: [
        { transform: 'scale(1)', opacity: '1' },
        { transform: 'scale(1.1)', opacity: '0.8' },
        { transform: 'scale(1)', opacity: '1' }
      ],
      bounce: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-20px)' },
        { transform: 'translateY(0)' }
      ],
      sparkle: [
        { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        { transform: 'rotate(180deg) scale(1.2)', opacity: '0.8' },
        { transform: 'rotate(360deg) scale(1)', opacity: '1' }
      ],
      float: [
        { transform: 'translateY(0) translateX(0)' },
        { transform: 'translateY(-10px) translateX(5px)' },
        { transform: 'translateY(0) translateX(0)' },
        { transform: 'translateY(10px) translateX(-5px)' },
        { transform: 'translateY(0) translateX(0)' }
      ],
      glow: [
        { filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' },
        { filter: 'brightness(1.5) drop-shadow(0 0 15px currentColor)' },
        { filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' }
      ],
      heartbeat: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ],
      snowfall: [
        { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
        { transform: 'translateY(20px) rotate(360deg)', opacity: '1' },
        { transform: 'translateY(60px) rotate(720deg)', opacity: '0' }
      ],
      sway: [
        { transform: 'rotate(-5deg)' },
        { transform: 'rotate(5deg)' },
        { transform: 'rotate(-5deg)' }
      ]
    }

    return animations[name] || null
  }
}

/**
 * 雪花装饰类
 * 用于圣诞节主题的雪花效果
 */
export class SnowflakeDecoration extends BaseDecoration {
  constructor(config: WidgetConfig, container: HTMLElement) {
    super(config, container)
  }

  protected createElement(): void {
    super.createElement()
    if (this.element) {
      this.element.classList.add('snowflake-decoration')
      // 如果没有提供内容或内容不包含SVG，使用默认雪花SVG
      if (!this.config.content || !this.config.content.includes('svg')) {
        this.element.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1L10 19M1 10L19 10M4.5 4.5L15.5 15.5M15.5 4.5L4.5 15.5"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
          </svg>
        `
      }
    }
  }
}

/**
 * 创建雪花效果
 * @param container 容器元素
 * @param options 配置选项
 */
export function createSnowfallEffect(
  container: HTMLElement,
  options: { count?: number; intensity?: 'light' | 'medium' | 'heavy' } = {}
): { start: () => void; stop: () => void } {
  const { count = 10, intensity = 'medium' } = options
  const snowflakes: SnowflakeDecoration[] = []

  // 根据强度调整数量
  const intensityMultiplier = { light: 0.5, medium: 1, heavy: 2 }
  const actualCount = Math.floor(count * intensityMultiplier[intensity])

  // 创建雪花
  for (let i = 0; i < actualCount; i++) {
    const snowflake = new SnowflakeDecoration({
      id: `snowflake-${i}`,
      name: `雪花 ${i}`,
      type: 'floating' as any,
      content: '',
      position: {
        type: 'fixed',
        position: {
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`
        },
        anchor: 'center'
      },
      style: {
        opacity: Math.random() * 0.5 + 0.3,
        zIndex: 1000 + i
      },
      animation: {
        name: 'snowfall',
        duration: Math.random() * 3000 + 2000,
        iterations: 'infinite',
        autoplay: true
      },
      interactive: false,
      responsive: true
    }, container)

    snowflakes.push(snowflake)
  }

  return {
    start: () => {
      snowflakes.forEach(snowflake => snowflake.show())
    },
    stop: () => {
      snowflakes.forEach(snowflake => snowflake.destroy())
      snowflakes.length = 0
    }
  }
}
