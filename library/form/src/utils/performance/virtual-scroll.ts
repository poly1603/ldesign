/**
 * @ldesign/form - Virtual Scroll Manager
 * 虚拟滚动管理器
 */

import { rafThrottle } from './debounce'

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 项高度 */
  itemHeight: number
  /** 缓冲区大小（额外渲染的项数） */
  bufferSize?: number
  /** 容器高度 */
  containerHeight?: number
}

/**
 * 虚拟滚动可见范围
 */
export interface VisibleRange {
  /** 开始索引 */
  start: number
  /** 结束索引 */
  end: number
  /** 偏移量 */
  offset: number
}

/**
 * 虚拟滚动管理器类
 */
export class VirtualScrollManager {
  private itemHeight: number
  private bufferSize: number
  private containerHeight: number
  private totalItems: number
  private scrollTop: number
  private visibleRange: VisibleRange
  private listeners: Set<(range: VisibleRange) => void>
  private handleScrollThrottled: () => void

  constructor(config: VirtualScrollConfig) {
    this.itemHeight = config.itemHeight
    this.bufferSize = config.bufferSize ?? 3
    this.containerHeight = config.containerHeight ?? 600
    this.totalItems = 0
    this.scrollTop = 0
    this.visibleRange = { start: 0, end: 0, offset: 0 }
    this.listeners = new Set()

    // 使用 RAF 节流优化滚动性能
    this.handleScrollThrottled = rafThrottle(() => {
      this.calculateVisibleRange()
      this.notifyListeners()
    })
  }

  /**
   * 设置总项数
   * @param count 总项数
   */
  setTotalItems(count: number): void {
    this.totalItems = count
    this.calculateVisibleRange()
    this.notifyListeners()
  }

  /**
   * 设置容器高度
   * @param height 容器高度
   */
  setContainerHeight(height: number): void {
    this.containerHeight = height
    this.calculateVisibleRange()
    this.notifyListeners()
  }

  /**
   * 处理滚动
   * @param scrollTop 滚动距离
   */
  handleScroll(scrollTop: number): void {
    this.scrollTop = scrollTop
    this.handleScrollThrottled()
  }

  /**
   * 计算可见范围
   */
  private calculateVisibleRange(): void {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)

    // 添加缓冲区
    const start = Math.max(0, startIndex - this.bufferSize)
    const end = Math.min(
      this.totalItems,
      startIndex + visibleCount + this.bufferSize
    )

    const offset = start * this.itemHeight

    this.visibleRange = {
      start,
      end,
      offset
    }
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(): VisibleRange {
    return { ...this.visibleRange }
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.totalItems * this.itemHeight
  }

  /**
   * 滚动到指定项
   * @param index 项索引
   */
  scrollToItem(index: number): number {
    if (index < 0 || index >= this.totalItems) {
      return this.scrollTop
    }

    return index * this.itemHeight
  }

  /**
   * 检查项是否在可见范围内
   * @param index 项索引
   */
  isItemVisible(index: number): boolean {
    return index >= this.visibleRange.start && index < this.visibleRange.end
  }

  /**
   * 订阅可见范围变化
   * @param listener 监听器
   */
  subscribe(listener: (range: VisibleRange) => void): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.visibleRange)
      } catch (error) {
        console.error('Error in virtual scroll listener:', error)
      }
    })
  }

  /**
   * 销毁虚拟滚动管理器
   */
  destroy(): void {
    this.handleScrollThrottled.cancel()
    this.listeners.clear()
  }
}

/**
 * 创建虚拟滚动管理器
 */
export function createVirtualScrollManager(
  config: VirtualScrollConfig
): VirtualScrollManager {
  return new VirtualScrollManager(config)
}



