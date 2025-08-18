import { AnimationConfig } from '../../core/types.js'
import { BaseAnimation } from './base.js'

/**
 * @ldesign/theme - 动画工厂
 *
 * 提供动画效果的统一创建接口
 */

/**
 * 动画构造函数类型
 */
type AnimationConstructor = new (config: AnimationConfig) => BaseAnimation
/**
 * 动画工厂类
 */
declare class AnimationFactory {
  /**
   * 创建动画
   */
  static create(config: AnimationConfig, elements: HTMLElement[]): BaseAnimation
  /**
   * 批量创建动画
   */
  static createMultiple(
    configs: AnimationConfig[],
    elementsMap: Map<string, HTMLElement[]>
  ): BaseAnimation[]
  /**
   * 注册动画类型
   */
  static register(name: string, constructor: AnimationConstructor): void
  /**
   * 注销动画类型
   */
  static unregister(name: string): void
  /**
   * 检查是否支持某种动画类型
   */
  static isSupported(name: string): boolean
  /**
   * 获取所有支持的动画类型
   */
  static getSupportedTypes(): string[]
  /**
   * 根据配置推断动画类型
   */
  private static inferAnimationType
  /**
   * 创建预设动画组合
   */
  static createPreset(
    preset: 'christmas' | 'spring-festival' | 'halloween' | 'celebration',
    elements: HTMLElement[],
    options?: {
      intensity?: 'light' | 'medium' | 'heavy'
      duration?: number
    }
  ): BaseAnimation[]
  /**
   * 创建圣诞节动画
   */
  private static createChristmasAnimations
  /**
   * 创建春节动画
   */
  private static createSpringFestivalAnimations
  /**
   * 创建万圣节动画
   */
  private static createHalloweenAnimations
  /**
   * 创建庆祝动画
   */
  private static createCelebrationAnimations
  /**
   * 创建自定义动画序列
   */
  static createSequence(
    sequence: Array<{
      config: AnimationConfig
      elements: HTMLElement[]
      delay?: number
    }>
  ): BaseAnimation[]
  /**
   * 创建响应式动画
   */
  static createResponsive(
    config: AnimationConfig,
    elements: HTMLElement[],
    breakpoints: {
      mobile?: Partial<AnimationConfig>
      tablet?: Partial<AnimationConfig>
      desktop?: Partial<AnimationConfig>
    }
  ): BaseAnimation
  /**
   * 创建性能优化的动画
   */
  static createOptimized(
    config: AnimationConfig,
    elements: HTMLElement[],
    options?: {
      reduceMotion?: boolean
      lowPowerMode?: boolean
      maxElements?: number
    }
  ): BaseAnimation
}

export { AnimationFactory }
