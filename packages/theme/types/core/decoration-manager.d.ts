import { EventEmitter } from '../utils/event-emitter.js'
import {
  ResourceManagerInstance,
  DecorationManagerInstance,
  DecorationConfig,
} from './types.js'

/**
 * @ldesign/theme - 装饰管理器
 *
 * 负责主题装饰元素的管理和渲染
 */

/**
 * 装饰管理器实现
 */
declare class DecorationManager implements DecorationManagerInstance {
  private decorations
  private container
  private eventEmitter
  private resourceManager
  private observer?
  private resizeObserver?
  constructor(
    container: HTMLElement,
    eventEmitter: EventEmitter,
    resourceManager: ResourceManagerInstance
  )
  /**
   * 添加装饰元素
   */
  add(decoration: DecorationConfig): void
  /**
   * 移除装饰元素
   */
  remove(id: string): void
  /**
   * 更新装饰元素
   */
  update(id: string, updates: Partial<DecorationConfig>): void
  /**
   * 获取装饰元素
   */
  get(id: string): DecorationConfig | undefined
  /**
   * 获取所有装饰元素
   */
  getAll(): DecorationConfig[]
  /**
   * 清空所有装饰元素
   */
  clear(): void
  /**
   * 渲染所有装饰元素
   */
  render(): void
  /**
   * 销毁装饰管理器
   */
  destroy(): void
  /**
   * 创建装饰元素
   */
  private createElement
  /**
   * 更新元素样式
   */
  private updateElementStyle
  /**
   * 更新元素内容
   */
  private updateElementContent
  /**
   * 渲染装饰元素
   */
  private renderDecoration
  /**
   * 取消渲染装饰元素
   */
  private unrenderDecoration
  /**
   * 检查装饰条件
   */
  private checkConditions
  /**
   * 检查单个条件
   */
  private checkCondition
  /**
   * 检查屏幕尺寸条件
   */
  private checkScreenSize
  /**
   * 检查时间条件
   */
  private checkTime
  /**
   * 检查用户偏好条件
   */
  private checkUserPreference
  /**
   * 检查性能条件
   */
  private checkPerformance
  /**
   * 判断是否需要重新创建元素
   */
  private needsRecreate
  /**
   * 应用动画
   */
  private applyAnimation
  /**
   * 添加交互事件
   */
  private addInteractiveEvents
  /**
   * 设置观察器
   */
  private setupObservers
}
/**
 * 创建装饰管理器实例
 */
declare function createDecorationManager(
  container: HTMLElement,
  eventEmitter: EventEmitter,
  resourceManager: ResourceManagerInstance
): DecorationManagerInstance

export { DecorationManager, createDecorationManager }
