import { AnimationConfig } from '../../core/types.js'

/**
 * @ldesign/theme - 动画效果基础类
 *
 * 提供动画效果的基础功能和通用方法
 */

/**
 * 动画效果基础类
 */
declare abstract class BaseAnimation {
  protected config: AnimationConfig
  protected elements: HTMLElement[]
  protected animation?: Animation
  protected isRunning: boolean
  protected isPaused: boolean
  protected startTime?: number
  protected pausedTime?: number
  constructor(config: AnimationConfig)
  /**
   * 设置目标元素
   */
  setElements(elements: HTMLElement[]): void
  /**
   * 添加目标元素
   */
  addElement(element: HTMLElement): void
  /**
   * 移除目标元素
   */
  removeElement(element: HTMLElement): void
  /**
   * 开始动画
   */
  start(): void
  /**
   * 停止动画
   */
  stop(): void
  /**
   * 暂停动画
   */
  pause(): void
  /**
   * 恢复动画
   */
  resume(): void
  /**
   * 重启动画
   */
  restart(): void
  /**
   * 检查是否正在运行
   */
  isAnimationRunning(): boolean
  /**
   * 检查是否已暂停
   */
  isAnimationPaused(): boolean
  /**
   * 获取动画配置
   */
  getConfig(): AnimationConfig
  /**
   * 更新动画配置
   */
  updateConfig(updates: Partial<AnimationConfig>): void
  /**
   * 创建动画 - 抽象方法，由子类实现
   */
  protected abstract createAnimation(): void
  /**
   * 开始回调 - 可由子类重写
   */
  protected onStart(): void
  /**
   * 停止回调 - 可由子类重写
   */
  protected onStop(): void
  /**
   * 暂停回调 - 可由子类重写
   */
  protected onPause(): void
  /**
   * 恢复回调 - 可由子类重写
   */
  protected onResume(): void
  /**
   * 重置元素状态
   */
  protected resetElements(): void
  /**
   * 生成CSS关键帧
   */
  protected generateCSSKeyframes(): string
  /**
   * 生成CSS动画规则
   */
  protected generateCSSAnimationRule(): string
  /**
   * 应用性能优化
   */
  protected applyPerformanceOptimizations(): void
  /**
   * 清理性能优化
   */
  protected cleanupPerformanceOptimizations(): void
  /**
   * 插值计算
   */
  protected interpolateValue(from: any, to: any, progress: number): string
  /**
   * 颜色插值
   */
  protected interpolateColor(from: string, to: string, progress: number): string
  /**
   * 十六进制颜色转RGB
   */
  protected hexToRgb(hex: string): {
    r: number
    g: number
    b: number
  } | null
  /**
   * 驼峰转短横线
   */
  protected camelToKebab(str: string): string
  /**
   * 获取缓动函数
   */
  protected getEasingFunction(easing: string): (t: number) => number
  /**
   * 销毁动画
   */
  destroy(): void
}

export { BaseAnimation }
