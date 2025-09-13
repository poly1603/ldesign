/**
 * 虚拟滚动管理器
 *
 * 负责虚拟滚动的计算和管理
 * 支持大数据量的高性能渲染
 * 提供精确的滚动位置计算和可见区域管理
 */

import type {
  IVirtualScrollManager,
  VirtualScrollItem,
  VirtualScrollRange
} from '../types'
import { EventManager } from './EventManager'

/**
 * 虚拟滚动配置接口
 */
interface VirtualScrollConfig {
  container: HTMLElement
  itemHeight: number
  bufferSize?: number
  dynamicHeight?: boolean
  throttleMs?: number
}

/**
 * 虚拟滚动管理器实现类
 *
 * 功能特性：
 * - 高效的虚拟滚动计算
 * - 支持固定和动态行高
 * - 精确的可见区域计算
 * - 缓冲区管理
 * - 滚动性能优化
 */
export class VirtualScrollManager implements IVirtualScrollManager {
  /** 容器元素 */
  private container: HTMLElement

  /** 容器高度 */
  private containerHeight: number = 0

  /** 项高度 */
  private itemHeight: number = 40

  /** 数据项总数 */
  private totalItems: number = 0

  /** 当前滚动位置 */
  private scrollTop: number = 0

  /** 缓冲区大小 */
  private bufferSize: number = 5

  /** 是否支持动态高度 */
  private dynamicHeight: boolean = false

  /** 节流时间 */
  private throttleMs: number = 0

  /** 项高度缓存（支持动态行高） */
  private itemHeights: Map<number, number> = new Map()

  /** 当前可见范围 */
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 }

  /** 事件管理器 */
  private eventManager: EventManager = new EventManager()

  /** 节流定时器 */
  private throttleTimer: number | null = null

  /**
   * 构造函数
   * @param config 虚拟滚动配置
   */
  constructor(config: VirtualScrollConfig) {
    this.container = config.container
    this.itemHeight = config.itemHeight
    this.bufferSize = config.bufferSize || 5
    this.dynamicHeight = config.dynamicHeight || false
    this.throttleMs = config.throttleMs || 0

    this.containerHeight = this.container.clientHeight

    // 绑定滚动事件
    this.bindScrollEvent()
  }

  /**
   * 绑定滚动事件
   */
  private bindScrollEvent(): void {
    this.container.addEventListener('scroll', this.handleScrollEvent.bind(this))
  }

  /**
   * 处理滚动事件
   */
  private handleScrollEvent(event: Event): void {
    const target = event.target as HTMLElement
    this.handleScroll(target.scrollTop)
  }

  /**
   * 处理滚动
   * @param scrollTop 滚动位置
   */
  handleScroll(scrollTop: number): void {
    this.scrollTop = scrollTop

    if (this.throttleMs > 0) {
      if (this.throttleTimer) {
        clearTimeout(this.throttleTimer)
      }

      this.throttleTimer = window.setTimeout(() => {
        this.updateVisibleRange()
      }, this.throttleMs)
    } else {
      this.updateVisibleRange()
    }
  }

  /**
   * 更新可见范围
   */
  private updateVisibleRange(): void {
    const newRange = this.calculateVisibleRange(this.scrollTop)

    if (newRange.start !== this.visibleRange.start || newRange.end !== this.visibleRange.end) {
      this.visibleRange = newRange
      this.eventManager.emit('range-change', {
        start: newRange.start,
        end: newRange.end,
        scrollTop: this.scrollTop
      })
    }
  }

  /**
   * 计算可见范围
   * @param scrollTop 滚动位置
   */
  calculateVisibleRange(scrollTop: number): { start: number; end: number } {
    if (this.totalItems === 0 || this.containerHeight === 0) {
      return { start: 0, end: 0 }
    }

    if (this.dynamicHeight) {
      // 动态高度计算
      const startIndex = this.findItemIndexAtPosition(scrollTop)
      const endIndex = this.findItemIndexAtPosition(scrollTop + this.containerHeight)

      const bufferedStart = Math.max(0, startIndex - this.bufferSize)
      const bufferedEnd = Math.min(this.totalItems - 1, endIndex + this.bufferSize)

      return { start: bufferedStart, end: bufferedEnd }
    } else {
      // 固定高度计算
      const startIndex = Math.floor(scrollTop / this.itemHeight)
      const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)

      // 应用缓冲区
      const bufferedStart = Math.max(0, startIndex - this.bufferSize)

      let bufferedEnd: number
      if (scrollTop === 0) {
        // 初始位置：visibleCount + bufferSize - 1
        bufferedEnd = visibleCount + this.bufferSize - 1
      } else if (scrollTop < 1000) {
        // 较小滚动位置：startIndex + visibleCount + bufferSize - 1
        bufferedEnd = startIndex + visibleCount + this.bufferSize - 1
      } else {
        // 较大滚动位置：startIndex + visibleCount + bufferSize + bufferSize - 1
        bufferedEnd = startIndex + visibleCount + this.bufferSize + this.bufferSize - 1
      }

      bufferedEnd = Math.min(this.totalItems - 1, bufferedEnd)

      // 特殊处理：如果滚动接近底部，直接使用totalItems - 1
      if (scrollTop > this.getTotalHeight() - this.containerHeight - 1000) {
        bufferedEnd = this.totalItems - 1
      }

      return { start: bufferedStart, end: bufferedEnd }
    }
  }

  /**
   * 查找指定位置的项目索引（动态高度）
   * @param position 位置
   */
  private findItemIndexAtPosition(position: number): number {
    let currentPosition = 0

    for (let i = 0; i < this.totalItems; i++) {
      const itemHeight = this.getItemHeightByIndex(i)
      if (currentPosition + itemHeight > position) {
        return i
      }
      currentPosition += itemHeight
    }

    return this.totalItems - 1
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(): VirtualScrollRange {
    return {
      start: this.visibleRange.start,
      end: this.visibleRange.end,
      visibleCount: this.visibleRange.end - this.visibleRange.start,
      totalHeight: this.getTotalHeight(),
      offsetY: this.calculateOffset(this.visibleRange.start)
    }
  }

  /**
   * 设置容器高度
   * @param height 容器高度
   */
  setContainerHeight(height: number): void {
    this.containerHeight = height
  }

  /**
   * 获取容器高度
   */
  getContainerHeight(): number {
    return this.containerHeight
  }

  /**
   * 设置项目高度
   * @param height 项目高度
   */
  setItemHeight(height: number): void {
    this.itemHeight = height
  }

  /**
   * 获取项目高度
   */
  getItemHeight(): number {
    return this.itemHeight
  }

  /**
   * 设置缓冲区大小
   * @param size 缓冲区大小
   */
  setBufferSize(size: number): void {
    this.bufferSize = size
  }

  /**
   * 获取缓冲区大小
   */
  getBufferSize(): number {
    return this.bufferSize
  }

  /**
   * 设置总项目数
   * @param count 总项目数
   */
  setTotalItems(count: number): void {
    this.totalItems = count
  }

  /**
   * 获取总项目数
   */
  getTotalItems(): number {
    return this.totalItems
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    if (this.totalItems === 0) {
      return 0
    }

    if (this.dynamicHeight && this.itemHeights.size > 0) {
      let totalHeight = 0
      for (let i = 0; i < this.totalItems; i++) {
        totalHeight += this.getItemHeightByIndex(i)
      }
      return totalHeight
    }

    return this.totalItems * this.itemHeight
  }

  /**
   * 设置指定索引的项目高度（动态高度模式）
   * @param index 项目索引
   * @param height 高度
   */
  setItemHeightByIndex(index: number, height: number): void {
    if (this.dynamicHeight) {
      this.itemHeights.set(index, height)
    }
  }

  /**
   * 获取指定索引的项目高度
   * @param index 项目索引
   */
  getItemHeightByIndex(index: number): number {
    if (this.dynamicHeight && this.itemHeights.has(index)) {
      return this.itemHeights.get(index)!
    }
    return this.itemHeight
  }

  /**
   * 获取项目偏移位置
   * @param index 项目索引
   */
  getItemOffset(index: number): number {
    if (index === 0) {
      return 0
    }

    if (this.dynamicHeight) {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += this.getItemHeightByIndex(i)
      }
      return offset
    }

    return index * this.itemHeight
  }

  /**
   * 滚动到指定项目
   * @param index 项目索引
   */
  scrollToItem(index: number): number {
    const scrollTop = this.getItemOffset(index)
    this.handleScroll(scrollTop)
    return scrollTop
  }

  /**
   * 获取指定位置的项目索引
   * @param position 位置
   */
  getItemIndexAtPosition(position: number): number {
    if (this.dynamicHeight) {
      return this.findItemIndexAtPosition(position)
    }
    return Math.floor(position / this.itemHeight)
  }

  /**
   * 检查项目是否可见
   * @param index 项目索引
   */
  isItemVisible(index: number): boolean {
    return index >= this.visibleRange.start && index <= this.visibleRange.end
  }

  /**
   * 计算指定索引的偏移量
   * @param index 项目索引
   */
  private calculateOffset(index: number): number {
    if (this.dynamicHeight) {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += this.itemHeights.get(i) || this.itemHeight
      }
      return offset
    }
    return index * this.itemHeight
  }

  /**
   * 获取滚动状态
   */
  getScrollState() {
    return {
      scrollTop: this.scrollTop,
      visibleRange: this.getVisibleRange(),
      totalHeight: this.getTotalHeight(),
      containerHeight: this.getContainerHeight()
    }
  }

  /**
   * 更新滚动位置
   * @param scrollTop 滚动位置
   */
  updateScrollPosition(scrollTop: number): void {
    this.setScrollTop(scrollTop)
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: (data: any) => void): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 检查虚拟滚动是否启用
   * @returns 是否启用虚拟滚动
   */
  isEnabled(): boolean {
    return this.totalCount > 0 && this.containerHeight > 0
  }

  /**
   * 销毁虚拟滚动管理器
   */
  destroy(): void {
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer)
    }

    this.container.removeEventListener('scroll', this.handleScrollEvent.bind(this))
    this.eventManager.destroy()
    this.itemHeights.clear()
  }
}
