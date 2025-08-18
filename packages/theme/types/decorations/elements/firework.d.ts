import { DecorationConfig } from '../../core/types.js'
import { BaseDecoration } from './base.js'

/**
 * @ldesign/theme - 烟花装饰元素
 *
 * 实现烟花装饰元素，支持绽放动画和粒子效果
 */

/**
 * 烟花装饰元素类
 */
declare class FireworkDecoration extends BaseDecoration {
  private particles
  private burstAnimation?
  private particleAnimations
  private colors
  constructor(config: DecorationConfig, container: HTMLElement)
  /**
   * 更新内容
   */
  protected updateContent(): Promise<void>
  /**
   * 加载SVG内容
   */
  private loadSVG
  /**
   * 获取默认烟花图案
   */
  private getDefaultFirework
  /**
   * 获取随机颜色
   */
  private getRandomColor
  /**
   * 设置烟花特有样式
   */
  private setupFireworkStyles
  /**
   * 创建粒子
   */
  private createParticles
  /**
   * 显示回调
   */
  protected onShow(): void
  /**
   * 隐藏回调
   */
  protected onHide(): void
  /**
   * 开始绽放动画
   */
  private startBurstAnimation
  /**
   * 烟花绽放
   */
  private burst
  /**
   * 粒子动画
   */
  private animateParticles
  /**
   * 重置烟花状态
   */
  private reset
  /**
   * 停止所有动画
   */
  private stopAllAnimations
  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void
  /**
   * 手动触发绽放
   */
  triggerBurst(): void
  /**
   * 销毁烟花
   */
  destroy(): void
  /**
   * 创建烟花秀
   */
  static createShow(
    container: HTMLElement,
    options?: {
      count?: number
      duration?: number
      interval?: number
      colors?: string[]
    }
  ): FireworkDecoration[]
}
/**
 * 创建烟花装饰元素
 */
declare function createFireworkDecoration(
  config: DecorationConfig,
  container: HTMLElement
): FireworkDecoration
/**
 * 创建庆祝烟花效果
 */
declare function createCelebrationFireworks(
  container: HTMLElement,
  options?: {
    intensity?: 'light' | 'medium' | 'heavy'
    duration?: number
    colors?: string[]
  }
): FireworkDecoration[]

export {
  FireworkDecoration,
  createCelebrationFireworks,
  createFireworkDecoration,
}
