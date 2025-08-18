import { EventEmitter } from '../utils/event-emitter.js'
import { AnimationManagerInstance, AnimationConfig } from './types.js'

/**
 * @ldesign/theme - 动画管理器
 *
 * 负责主题动画的管理和控制
 */

/**
 * 动画管理器实现
 */
declare class AnimationManager implements AnimationManagerInstance {
  private animations
  private eventEmitter
  private container
  constructor(container: HTMLElement, eventEmitter: EventEmitter)
  /**
   * 注册动画
   */
  register(animation: AnimationConfig): void
  /**
   * 注销动画
   */
  unregister(name: string): void
  /**
   * 开始动画
   */
  start(name: string): void
  /**
   * 停止动画
   */
  stop(name: string): void
  /**
   * 暂停动画
   */
  pause(name: string): void
  /**
   * 恢复动画
   */
  resume(name: string): void
  /**
   * 获取所有动画配置
   */
  getAll(): AnimationConfig[]
  /**
   * 检查动画是否正在运行
   */
  isRunning(name: string): boolean
  /**
   * 销毁动画管理器
   */
  destroy(): void
  /**
   * 创建动画实例
   */
  private createAnimationInstance
  /**
   * 查找动画目标元素
   */
  private findElements
  /**
   * 创建 CSS 动画
   */
  private createCSSAnimation
  /**
   * 生成 CSS 关键帧
   */
  private generateCSSKeyframes
  /**
   * 生成 CSS 动画规则
   */
  private generateCSSAnimationRule
  /**
   * 开始动画
   */
  private startAnimation
  /**
   * 停止动画
   */
  private stopAnimation
  /**
   * 暂停动画
   */
  private pauseAnimation
  /**
   * 恢复动画
   */
  private resumeAnimation
  /**
   * 开始 CSS 动画
   */
  private startCSSAnimation
  /**
   * 停止 CSS 动画
   */
  private stopCSSAnimation
  /**
   * 暂停 CSS 动画
   */
  private pauseCSSAnimation
  /**
   * 恢复 CSS 动画
   */
  private resumeCSSAnimation
  /**
   * 开始 JavaScript 动画
   */
  private startJSAnimation
  /**
   * 停止 JavaScript 动画
   */
  private stopJSAnimation
  /**
   * 暂停 JavaScript 动画
   */
  private pauseJSAnimation
  /**
   * 恢复 JavaScript 动画
   */
  private resumeJSAnimation
  /**
   * 更新 JavaScript 动画
   */
  private updateJSAnimation
  /**
   * 应用插值样式
   */
  private applyInterpolatedStyles
  /**
   * 插值计算
   */
  private interpolateValue
  /**
   * 处理动画完成
   */
  private handleAnimationComplete
  /**
   * 驼峰转短横线
   */
  private camelToKebab
}
/**
 * 创建动画管理器实例
 */
declare function createAnimationManager(
  container: HTMLElement,
  eventEmitter: EventEmitter
): AnimationManagerInstance

export { AnimationManager, createAnimationManager }
