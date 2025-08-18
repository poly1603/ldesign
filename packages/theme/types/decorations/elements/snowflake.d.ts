import { DecorationConfig } from '../../core/types.js'
import { BaseDecoration } from './base.js'

/**
 * @ldesign/theme - 雪花装饰元素
 *
 * 实现雪花装饰元素，支持多种雪花样式和飘落动画
 */

/**
 * 雪花装饰元素类
 */
declare class SnowflakeDecoration extends BaseDecoration {
  private svgContent?
  private fallAnimation?
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
   * 获取默认雪花图案
   */
  private getDefaultSnowflake
  /**
   * 设置雪花特有样式
   */
  private setupSnowflakeStyles
  /**
   * 显示回调
   */
  protected onShow(): void
  /**
   * 隐藏回调
   */
  protected onHide(): void
  /**
   * 开始飘落动画
   */
  private startFallAnimation
  /**
   * 获取飘落持续时间
   */
  private getFallDuration
  /**
   * 获取飘落关键帧
   */
  private getFallKeyframes
  /**
   * 获取随机起始X位置
   */
  private getRandomStartX
  /**
   * 获取随机漂移距离
   */
  private getRandomDrift
  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void
  /**
   * 闪烁效果
   */
  private sparkle
  /**
   * 创建多个雪花实例
   */
  static createMultiple(
    count: number,
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>
  ): SnowflakeDecoration[]
  /**
   * 获取随机动画类型
   */
  private static getRandomAnimation
  /**
   * 批量显示雪花
   */
  static showMultiple(snowflakes: SnowflakeDecoration[], delay?: number): void
  /**
   * 批量隐藏雪花
   */
  static hideMultiple(snowflakes: SnowflakeDecoration[]): void
  /**
   * 批量销毁雪花
   */
  static destroyMultiple(snowflakes: SnowflakeDecoration[]): void
}
/**
 * 创建雪花装饰元素
 */
declare function createSnowflakeDecoration(
  config: DecorationConfig,
  container: HTMLElement
): SnowflakeDecoration
/**
 * 创建雪花群效果
 */
declare function createSnowfallEffect(
  container: HTMLElement,
  options?: {
    count?: number
    duration?: number
    intensity?: 'light' | 'medium' | 'heavy'
    size?: 'small' | 'medium' | 'large' | 'mixed'
  }
): SnowflakeDecoration[]

export { SnowflakeDecoration, createSnowfallEffect, createSnowflakeDecoration }
