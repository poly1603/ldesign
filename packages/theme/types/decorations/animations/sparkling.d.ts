import { AnimationConfig } from '../../core/types.js'
import { BaseAnimation } from './base.js'

/**
 * @ldesign/theme - 闪烁动画
 *
 * 实现各种闪烁动画效果，如星光闪烁、发光效果等
 */

/**
 * 闪烁动画类
 */
declare class SparklingAnimation extends BaseAnimation {
  private animationId?
  private sparklers
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
   * 初始化闪烁元素
   */
  private initializeSparklers
  /**
   * 创建闪烁点
   */
  private createSparklePoints
  /**
   * 获取元素发光颜色
   */
  private getElementGlowColor
  /**
   * 开始动画循环
   */
  private startAnimationLoop
  /**
   * 更新闪烁元素状态
   */
  private updateSparklers
  /**
   * 渲染闪烁元素
   */
  private renderSparklers
  /**
   * 渲染闪烁点
   */
  private renderSparklePoints
  /**
   * 停止回调
   */
  protected onStop(): void
  /**
   * 创建星光闪烁动画
   */
  static createStarSparkle(
    elements: HTMLElement[],
    options?: {
      intensity?: 'subtle' | 'moderate' | 'intense'
      color?: string
      frequency?: number
    }
  ): SparklingAnimation
  /**
   * 创建霓虹灯闪烁动画
   */
  static createNeonFlicker(
    elements: HTMLElement[],
    options?: {
      color?: string
      flickerRate?: number
      glowIntensity?: number
    }
  ): SparklingAnimation
  /**
   * 创建魔法闪烁动画
   */
  static createMagicSparkle(
    elements: HTMLElement[],
    options?: {
      colors?: string[]
      particleCount?: number
      duration?: number
    }
  ): SparklingAnimation
  /**
   * 创建呼吸灯效果
   */
  static createBreathingLight(
    elements: HTMLElement[],
    options?: {
      color?: string
      minOpacity?: number
      maxOpacity?: number
      duration?: number
    }
  ): SparklingAnimation
}
/**
 * 创建闪烁动画
 */
declare function createSparklingAnimation(
  config: AnimationConfig,
  elements: HTMLElement[]
): SparklingAnimation

export { SparklingAnimation, createSparklingAnimation }
