import { DecorationConfig } from '../core/types.js'
import { BaseDecoration } from './elements/base.js'

/**
 * @ldesign/theme - 装饰元素工厂
 *
 * 提供装饰元素的统一创建接口
 */

/**
 * 装饰元素构造函数类型
 */
type DecorationConstructor = new (
  config: DecorationConfig,
  container: HTMLElement
) => BaseDecoration
/**
 * 装饰元素工厂类
 */
declare class DecorationFactory {
  /**
   * 创建装饰元素
   */
  static create(
    config: DecorationConfig,
    container: HTMLElement
  ): BaseDecoration
  /**
   * 批量创建装饰元素
   */
  static createMultiple(
    configs: DecorationConfig[],
    container: HTMLElement
  ): BaseDecoration[]
  /**
   * 注册装饰元素类型
   */
  static register(type: string, constructor: DecorationConstructor): void
  /**
   * 注销装饰元素类型
   */
  static unregister(type: string): void
  /**
   * 检查是否支持某种装饰类型
   */
  static isSupported(type: string): boolean
  /**
   * 获取所有支持的装饰类型
   */
  static getSupportedTypes(): string[]
  /**
   * 根据配置获取默认装饰类型
   */
  private static getDefaultDecoration
  /**
   * 创建预设装饰组合
   */
  static createPreset(
    preset: 'christmas' | 'spring-festival' | 'halloween' | 'celebration',
    container: HTMLElement,
    options?: {
      intensity?: 'light' | 'medium' | 'heavy'
      interactive?: boolean
      responsive?: boolean
    }
  ): BaseDecoration[]
  /**
   * 创建圣诞节装饰
   */
  private static createChristmasDecorations
  /**
   * 创建春节装饰
   */
  private static createSpringFestivalDecorations
  /**
   * 创建万圣节装饰
   */
  private static createHalloweenDecorations
  /**
   * 创建庆祝装饰
   */
  private static createCelebrationDecorations
  /**
   * 创建自定义装饰组合
   */
  static createCustom(
    template: {
      type: string
      count: number
      baseConfig: Partial<DecorationConfig>
      variations?: Partial<DecorationConfig>[]
    },
    container: HTMLElement
  ): BaseDecoration[]
}

export { DecorationFactory }
