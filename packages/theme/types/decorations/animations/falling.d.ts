import { AnimationConfig } from '../../core/types.js'
import { BaseAnimation } from './base.js'

/**
 * @ldesign/theme - 下落动画
 *
 * 实现各种下落动画效果，如雪花飘落、金币下落等
 */

/**
 * 下落动画类
 */
declare class FallingAnimation extends BaseAnimation {
  private animationId?
  private particles
  constructor(config: AnimationConfig)
  /**
   * 创建动画
   */
  protected createAnimation(): void
  /**
   * 创建CSS动画
   */
  private createCSSAnimation
  /**
   * 创建JavaScript动画
   */
  private createJSAnimation
  /**
   * 初始化粒子
   */
  private initializeParticles
  /**
   * 开始动画循环
   */
  private startAnimationLoop
  /**
   * 更新粒子状态
   */
  private updateParticles
  /**
   * 渲染粒子
   */
  private renderParticles
  /**
   * 重置粒子
   */
  private resetParticle
  /**
   * 随机化起始位置
   */
  private randomizeStartPosition
  /**
   * 停止回调
   */
  protected onStop(): void
  /**
   * 创建雪花下落动画
   */
  static createSnowfall(
    elements: HTMLElement[],
    options?: {
      duration?: number
      intensity?: 'light' | 'medium' | 'heavy'
      wind?: number
    }
  ): FallingAnimation
  /**
   * 创建金币下落动画
   */
  static createCoinFall(
    elements: HTMLElement[],
    options?: {
      duration?: number
      bounce?: boolean
      sparkle?: boolean
    }
  ): FallingAnimation
  /**
   * 创建花瓣飘落动画
   */
  static createPetalFall(
    elements: HTMLElement[],
    options?: {
      duration?: number
      swirl?: boolean
      colors?: string[]
    }
  ): FallingAnimation
}
/**
 * 创建下落动画
 */
declare function createFallingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[]
): FallingAnimation

export { FallingAnimation, createFallingAnimation }
