import { DecorationConfig } from '../../core/types.js'
import { BaseDecoration } from './base.js'

/**
 * @ldesign/theme - 灯笼装饰元素
 *
 * 实现灯笼装饰元素，支持摆动动画和发光效果
 */

/**
 * 灯笼装饰元素类
 */
declare class LanternDecoration extends BaseDecoration {
  private svgContent?
  private swingAnimation?
  private glowAnimation?
  private isGlowing
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
   * 获取默认灯笼图案
   */
  private getDefaultLantern
  /**
   * 设置灯笼特有样式
   */
  private setupLanternStyles
  /**
   * 显示回调
   */
  protected onShow(): void
  /**
   * 隐藏回调
   */
  protected onHide(): void
  /**
   * 开始摆动动画
   */
  private startSwingAnimation
  /**
   * 获取摆动关键帧
   */
  private getSwingKeyframes
  /**
   * 开始发光动画
   */
  private startGlowAnimation
  /**
   * 停止所有动画
   */
  private stopAllAnimations
  /**
   * 交互回调
   */
  protected onInteract(type: string, event: Event): void
  /**
   * 切换发光效果
   */
  private toggleGlow
  /**
   * 停止发光动画
   */
  private stopGlowAnimation
  /**
   * 播放点击动画
   */
  private playClickAnimation
  /**
   * 增强发光效果
   */
  private enhanceGlow
  /**
   * 恢复发光效果
   */
  private restoreGlow
  /**
   * 创建灯笼对
   */
  static createPair(
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>
  ): [LanternDecoration, LanternDecoration]
  /**
   * 创建灯笼串
   */
  static createString(
    count: number,
    container: HTMLElement,
    baseConfig: Partial<DecorationConfig>
  ): LanternDecoration[]
}
/**
 * 创建灯笼装饰元素
 */
declare function createLanternDecoration(
  config: DecorationConfig,
  container: HTMLElement
): LanternDecoration
/**
 * 创建春节灯笼效果
 */
declare function createSpringFestivalLanterns(
  container: HTMLElement,
  options?: {
    type?: 'pair' | 'string'
    count?: number
    size?: 'small' | 'medium' | 'large'
    interactive?: boolean
  }
): LanternDecoration[]

export {
  LanternDecoration,
  createLanternDecoration,
  createSpringFestivalLanterns,
}
