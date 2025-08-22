import { DecorationConfig, Position } from '../../core/types.js'

/**
 * @ldesign/theme - 装饰元素基础类
 *
 * 提供装饰元素的基础功能和通用方法
 */

/**
 * 装饰元素基础类
 */
declare abstract class BaseDecoration {
  protected config: DecorationConfig
  protected element: HTMLElement
  protected container: HTMLElement
  protected isVisible: boolean
  protected isInteractive: boolean
  constructor(config: DecorationConfig, container: HTMLElement)
  /**
   * 创建DOM元素
   */
  protected createElement(): HTMLElement
  /**
   * 设置元素
   */
  protected setupElement(): void
  /**
   * 更新位置
   */
  protected updatePosition(): void
  /**
   * 设置位置值
   */
  protected setPositionValue(property: string, value: number | string): void
  /**
   * 应用锚点
   */
  protected applyAnchor(anchor: string): void
  /**
   * 应用偏移
   */
  protected applyOffset(offset: Position): void
  /**
   * 更新样式
   */
  protected updateStyle(): void
  /**
   * 设置尺寸值
   */
  protected setSizeValue(property: string, value: number | string): void
  /**
   * 更新内容 - 抽象方法，由子类实现
   */
  protected abstract updateContent(): Promise<void> | void
  /**
   * 设置交互性
   */
  protected setupInteractivity(): void
  /**
   * 处理点击事件
   */
  protected handleClick(event: MouseEvent): void
  /**
   * 处理鼠标进入事件
   */
  protected handleMouseEnter(event: MouseEvent): void
  /**
   * 处理鼠标离开事件
   */
  protected handleMouseLeave(event: MouseEvent): void
  /**
   * 处理触摸开始事件
   */
  protected handleTouchStart(event: TouchEvent): void
  /**
   * 处理触摸结束事件
   */
  protected handleTouchEnd(event: TouchEvent): void
  /**
   * 交互回调 - 可由子类重写
   */
  protected onInteract(type: string, event: Event): void
  /**
   * 显示装饰元素
   */
  show(): void
  /**
   * 隐藏装饰元素
   */
  hide(): void
  /**
   * 更新配置
   */
  updateConfig(updates: Partial<DecorationConfig>): void
  /**
   * 获取元素
   */
  getElement(): HTMLElement
  /**
   * 获取配置
   */
  getConfig(): DecorationConfig
  /**
   * 检查是否可见
   */
  isShown(): boolean
  /**
   * 显示回调 - 可由子类重写
   */
  protected onShow(): void
  /**
   * 隐藏回调 - 可由子类重写
   */
  protected onHide(): void
  /**
   * 销毁装饰元素
   */
  destroy(): void
}

export { BaseDecoration }
