/**
 * @ldesign/theme - 灯笼装饰元素
 *
 * 实现灯笼装饰元素，支持摆动动画和发光效果
 */

import type { DecorationConfig } from '../../core/types'
import { BaseDecoration } from './base'

/**
 * 灯笼装饰元素类
 */
export class LanternDecoration extends BaseDecoration {
  private svgContent?: string
  private swingAnimation?: Animation
  private glowAnimation?: Animation
  private isGlowing = false

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
      } else {
        // 使用默认灯笼图案
        this.element.innerHTML = this.getDefaultLantern()
      }

      // 设置灯笼特有的样式
      this.setupLanternStyles()
    } catch (error) {
      console.error('Failed to load lantern content:', error)
      this.element.innerHTML = this.getDefaultLantern()
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
   * 获取默认灯笼图案
   */
  private getDefaultLantern(): string {
    return `
      <svg viewBox="0 0 100 120" fill="none" style="width: 100%; height: 100%;">
        <!-- 灯笼顶部 -->
        <rect x="35" y="5" width="30" height="8" rx="4" fill="#8B4513"/>
        
        <!-- 灯笼主体 -->
        <ellipse cx="50" cy="35" rx="25" ry="15" fill="#DC2626"/>
        <ellipse cx="50" cy="65" rx="28" ry="20" fill="#DC2626"/>
        <ellipse cx="50" cy="85" rx="25" ry="15" fill="#DC2626"/>
        
        <!-- 灯笼装饰线条 -->
        <line x1="25" y1="35" x2="75" y2="35" stroke="#F59E0B" stroke-width="2"/>
        <line x1="22" y1="65" x2="78" y2="65" stroke="#F59E0B" stroke-width="2"/>
        <line x1="25" y1="85" x2="75" y2="85" stroke="#F59E0B" stroke-width="2"/>
        
        <!-- 灯笼中心装饰 -->
        <circle cx="50" cy="65" r="8" fill="#F59E0B"/>
        <text x="50" y="70" text-anchor="middle" fill="#DC2626" font-size="10" font-weight="bold">福</text>
        
        <!-- 灯笼底部流苏 -->
        <rect x="48" y="100" width="4" height="15" fill="#F59E0B"/>
        <circle cx="50" cy="118" r="3" fill="#F59E0B"/>
        
        <!-- 发光效果 -->
        <ellipse cx="50" cy="65" rx="28" ry="20" fill="url(#lanternGlow)" opacity="0.3"/>
        
        <defs>
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#FBBF24;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:0" />
          </radialGradient>
        </defs>
      </svg>
    `
  }

  /**
   * 设置灯笼特有样式
   */
  private setupLanternStyles(): void {
    // 设置变换原点为顶部中心（用于摆动动画）
    this.element.style.transformOrigin = 'center top'

    // 添加初始发光效果
    this.element.style.filter = 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'

    // 添加灯笼特有的CSS类
    this.element.classList.add('lantern-decoration')
  }

  /**
   * 显示回调
   */
  protected onShow(): void {
    super.onShow()

    // 开始摆动动画
    if (this.config.animation?.includes('swing')) {
      this.startSwingAnimation()
    }

    // 开始发光动画
    if (this.config.animation?.includes('glow')) {
      this.startGlowAnimation()
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
   * 开始摆动动画
   */
  private startSwingAnimation(): void {
    const isReverse = this.config.animation?.includes('reverse')
    const keyframes = this.getSwingKeyframes(isReverse)

    this.swingAnimation = this.element.animate(keyframes, {
      duration: 4000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    })
  }

  /**
   * 获取摆动关键帧
   */
  private getSwingKeyframes(reverse = false): Keyframe[] {
    const angle1 = reverse ? 3 : -3
    const angle2 = reverse ? -3 : 3

    return [
      {
        transform: `rotate(${angle1}deg)`,
      },
      {
        transform: `rotate(${angle2}deg)`,
      },
    ]
  }

  /**
   * 开始发光动画
   */
  private startGlowAnimation(): void {
    const keyframes = [
      {
        filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
      },
      {
        filter:
          'drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 30px rgba(220, 38, 38, 0.5))',
      },
    ]

    this.glowAnimation = this.element.animate(keyframes, {
      duration: 2000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    })

    this.isGlowing = true
  }

  /**
   * 停止所有动画
   */
  private stopAllAnimations(): void {
    if (this.swingAnimation) {
      this.swingAnimation.cancel()
      this.swingAnimation = undefined
    }

    if (this.glowAnimation) {
      this.glowAnimation.cancel()
      this.glowAnimation = undefined
      this.isGlowing = false
    }
  }

  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void {
    super.onInteract(type, event)

    switch (type) {
      case 'click':
        this.toggleGlow()
        this.playClickAnimation()
        break
      case 'hover':
        this.enhanceGlow()
        break
      case 'leave':
        this.restoreGlow()
        break
    }
  }

  /**
   * 切换发光效果
   */
  private toggleGlow(): void {
    if (this.isGlowing) {
      this.stopGlowAnimation()
    } else {
      this.startGlowAnimation()
    }
  }

  /**
   * 停止发光动画
   */
  private stopGlowAnimation(): void {
    if (this.glowAnimation) {
      this.glowAnimation.cancel()
      this.glowAnimation = undefined
      this.isGlowing = false

      // 恢复基础发光
      this.element.style.filter = 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
    }
  }

  /**
   * 播放点击动画
   */
  private playClickAnimation(): void {
    const keyframes = [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.1) rotate(2deg)' },
      { transform: 'scale(1) rotate(0deg)' },
    ]

    this.element.animate(keyframes, {
      duration: 300,
      easing: 'ease-out',
    })
  }

  /**
   * 增强发光效果
   */
  private enhanceGlow(): void {
    if (!this.isGlowing) {
      this.element.style.filter =
        'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 25px rgba(220, 38, 38, 0.3))'
    }
  }

  /**
   * 恢复发光效果
   */
  private restoreGlow(): void {
    if (!this.isGlowing) {
      this.element.style.filter = 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
    }
  }

  /**
   * 创建灯笼对
   */
  static createPair(
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>
  ): [LanternDecoration, LanternDecoration] {
    const leftConfig: DecorationConfig = {
      id: 'lantern-left',
      name: '左侧灯笼',
      type: 'svg',
      src: baseConfig.src || '',
      position: {
        type: 'fixed',
        position: { x: '5%', y: '10%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '60px', height: '80px' },
        opacity: 0.9,
        zIndex: 1001,
      },
      animation: 'lantern-swing',
      interactive: true,
      responsive: true,
      ...baseConfig,
    }

    const rightConfig: DecorationConfig = {
      ...leftConfig,
      id: 'lantern-right',
      name: '右侧灯笼',
      position: {
        type: 'fixed',
        position: { x: '95%', y: '10%' },
        anchor: 'top-right',
      },
      animation: 'lantern-swing-reverse',
    }

    const leftLantern = new LanternDecoration(leftConfig, container)
    const rightLantern = new LanternDecoration(rightConfig, container)

    return [leftLantern, rightLantern]
  }

  /**
   * 创建灯笼串
   */
  static createString(
    count: number,
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>
  ): LanternDecoration[] {
    const lanterns: LanternDecoration[] = []
    const spacing = 100 / (count + 1) // 均匀分布

    for (let i = 0; i < count; i++) {
      const config: DecorationConfig = {
        id: `lantern-string-${i}`,
        name: `灯笼串${i + 1}`,
        type: 'svg',
        src: baseConfig.src || '',
        position: {
          type: 'fixed',
          position: {
            x: `${spacing * (i + 1)}%`,
            y: '8%',
          },
          anchor: 'top-center',
        },
        style: {
          size: { width: '50px', height: '65px' },
          opacity: 0.9,
          zIndex: 1000 - i,
        },
        animation: i % 2 === 0 ? 'lantern-swing' : 'lantern-swing-reverse',
        interactive: true,
        responsive: true,
        ...baseConfig,
      }

      const lantern = new LanternDecoration(config, container)
      lanterns.push(lantern)
    }

    return lanterns
  }
}

/**
 * 创建灯笼装饰元素
 */
export function createLanternDecoration(
  config: DecorationConfig,
  container: HTMLElement
): LanternDecoration {
  return new LanternDecoration(config, container)
}

/**
 * 创建春节灯笼效果
 */
export function createSpringFestivalLanterns(
  container: HTMLElement,
  options: {
    type?: 'pair' | 'string'
    count?: number
    size?: 'small' | 'medium' | 'large'
    interactive?: boolean
  } = {}
): LanternDecoration[] {
  const {
    type = 'pair',
    count = 3,
    size = 'medium',
    interactive = true,
  } = options

  const sizeMap = {
    small: { width: '40px', height: '55px' },
    medium: { width: '60px', height: '80px' },
    large: { width: '80px', height: '105px' },
  }

  const baseConfig: Partial<DecorationConfig> = {
    type: 'svg',
    interactive,
    responsive: true,
    style: {
      size: sizeMap[size],
      opacity: 0.9,
      zIndex: 1001,
    },
  }

  if (type === 'pair') {
    const [left, right] = LanternDecoration.createPair(container, baseConfig)
    return [left, right]
  } else {
    return LanternDecoration.createString(count, container, baseConfig)
  }
}
