import { AnimationConfig } from '../../core/types.js'
import { BaseAnimation } from './base.js'

/**
 * @ldesign/theme - 漂浮动画
 *
 * 实现各种漂浮动画效果，如幽灵飘浮、气球漂浮等
 */

/**
 * 漂浮动画类
 */
declare class FloatingAnimation extends BaseAnimation {
  private animationId?
  private floaters
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
   * 初始化漂浮元素
   */
  private initializeFloaters
  /**
   * 开始动画循环
   */
  private startAnimationLoop
  /**
   * 更新漂浮元素状态
   */
  private updateFloaters
  /**
   * 渲染漂浮元素
   */
  private renderFloaters
  /**
   * 停止回调
   */
  protected onStop(): void
  /**
   * 创建幽灵漂浮动画
   */
  static createGhostFloat(
    elements: HTMLElement[],
    options?: {
      amplitude?: number
      frequency?: number
      opacity?: boolean
    }
  ): FloatingAnimation
  /**
   * 创建气球漂浮动画
   */
  static createBalloonFloat(
    elements: HTMLElement[],
    options?: {
      rise?: boolean
      sway?: boolean
      speed?: number
    }
  ): FloatingAnimation
  /**
   * 创建云朵漂浮动画
   */
  static createCloudFloat(
    elements: HTMLElement[],
    options?: {
      speed?: number
      direction?: 'left' | 'right'
      vertical?: boolean
    }
  ): FloatingAnimation
  /**
   * 创建水中漂浮动画
   */
  static createUnderwaterFloat(
    elements: HTMLElement[],
    options?: {
      intensity?: 'gentle' | 'moderate' | 'strong'
      bubbles?: boolean
    }
  ): FloatingAnimation
}
/**
 * 创建漂浮动画
 */
declare function createFloatingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[]
): FloatingAnimation

export { FloatingAnimation, createFloatingAnimation }
