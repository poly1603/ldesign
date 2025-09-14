/**
 * 树形组件虚拟滚动功能模块
 * 
 * 提供虚拟滚动功能，优化大数据量场景下的性能
 */

import type { TreeNode, TreeNodeId } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'

/**
 * 虚拟滚动项接口
 */
export interface VirtualItem {
  id: TreeNodeId
  node: TreeNode
  index: number
  top: number
  height: number
  visible: boolean
}

/**
 * 滚动范围接口
 */
export interface ScrollRange {
  start: number
  end: number
  visibleStart: number
  visibleEnd: number
}

/**
 * 虚拟滚动配置接口
 */
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan: number
  threshold: number
}

/**
 * 虚拟滚动管理器类
 */
export class VirtualScrollManager {
  private options: TreeOptions
  private config: VirtualScrollConfig
  private flattenedNodes: TreeNode[] = []
  private virtualItems: VirtualItem[] = []
  private scrollTop: number = 0
  private containerElement?: HTMLElement
  private scrollElement?: HTMLElement

  // 缓存
  private heightCache: Map<TreeNodeId, number> = new Map()
  private positionCache: Map<TreeNodeId, number> = new Map()

  // 回调函数
  private onScroll?: (scrollTop: number, range: ScrollRange) => void
  private onRangeChange?: (range: ScrollRange) => void

  constructor(options: TreeOptions) {
    this.options = options
    this.config = {
      itemHeight: options.virtualScroll?.itemHeight || 32,
      containerHeight: options.virtualScroll?.containerHeight || 400,
      overscan: options.virtualScroll?.overscan || 5,
      threshold: options.virtualScroll?.threshold || 100,
    }
  }

  /**
   * 设置容器元素
   */
  setContainer(container: HTMLElement, scrollElement?: HTMLElement): void {
    this.containerElement = container
    this.scrollElement = scrollElement || container

    // 绑定滚动事件
    this.scrollElement.addEventListener('scroll', this.handleScroll.bind(this))
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onScroll?: (scrollTop: number, range: ScrollRange) => void
    onRangeChange?: (range: ScrollRange) => void
  }): void {
    this.onScroll = callbacks.onScroll
    this.onRangeChange = callbacks.onRangeChange
  }

  /**
   * 更新扁平化节点列表
   */
  updateFlattenedNodes(nodes: TreeNode[]): void {
    this.flattenedNodes = this.flattenNodes(nodes)
    this.updateVirtualItems()
    this.updateScrollRange()
  }

  /**
   * 扁平化树形节点
   */
  private flattenNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = []

    const traverse = (nodeList: TreeNode[]) => {
      for (const node of nodeList) {
        result.push(node)
        
        // 如果节点展开且有子节点，递归处理子节点
        if (node.expanded && node.children.length > 0) {
          traverse(node.children)
        }
      }
    }

    traverse(nodes)
    return result
  }

  /**
   * 更新虚拟项列表
   */
  private updateVirtualItems(): void {
    this.virtualItems = []
    let currentTop = 0

    for (let i = 0; i < this.flattenedNodes.length; i++) {
      const node = this.flattenedNodes[i]
      const height = this.getItemHeight(node)

      const virtualItem: VirtualItem = {
        id: node.id,
        node,
        index: i,
        top: currentTop,
        height,
        visible: false,
      }

      this.virtualItems.push(virtualItem)
      this.positionCache.set(node.id, currentTop)
      currentTop += height
    }
  }

  /**
   * 获取项目高度
   */
  private getItemHeight(node: TreeNode): number {
    // 检查缓存
    const cachedHeight = this.heightCache.get(node.id)
    if (cachedHeight !== undefined) {
      return cachedHeight
    }

    // 计算高度
    let height = this.config.itemHeight

    // 根据节点类型调整高度
    if (node.data?.height) {
      height = node.data.height
    } else if (node.className?.includes('large')) {
      height = this.config.itemHeight * 1.5
    } else if (node.className?.includes('small')) {
      height = this.config.itemHeight * 0.8
    }

    // 缓存高度
    this.heightCache.set(node.id, height)
    return height
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(event: Event): void {
    const target = event.target as HTMLElement
    this.scrollTop = target.scrollTop

    this.updateScrollRange()

    // 触发滚动回调
    if (this.onScroll) {
      this.onScroll(this.scrollTop, this.getCurrentRange())
    }
  }

  /**
   * 更新滚动范围
   */
  private updateScrollRange(): void {
    const range = this.calculateVisibleRange()
    this.updateVisibleItems(range)

    // 触发范围变化回调
    if (this.onRangeChange) {
      this.onRangeChange(range)
    }
  }

  /**
   * 计算可见范围
   */
  private calculateVisibleRange(): ScrollRange {
    const containerHeight = this.config.containerHeight
    const overscan = this.config.overscan

    // 找到第一个可见项
    let start = 0
    let visibleStart = 0

    for (let i = 0; i < this.virtualItems.length; i++) {
      const item = this.virtualItems[i]
      if (item.top + item.height > this.scrollTop) {
        start = Math.max(0, i - overscan)
        visibleStart = i
        break
      }
    }

    // 找到最后一个可见项
    let end = this.virtualItems.length - 1
    let visibleEnd = this.virtualItems.length - 1

    for (let i = visibleStart; i < this.virtualItems.length; i++) {
      const item = this.virtualItems[i]
      if (item.top > this.scrollTop + containerHeight) {
        end = Math.min(this.virtualItems.length - 1, i + overscan)
        visibleEnd = i - 1
        break
      }
    }

    return { start, end, visibleStart, visibleEnd }
  }

  /**
   * 更新可见项
   */
  private updateVisibleItems(range: ScrollRange): void {
    // 重置所有项的可见状态
    for (const item of this.virtualItems) {
      item.visible = false
    }

    // 设置可见范围内的项
    for (let i = range.start; i <= range.end; i++) {
      if (this.virtualItems[i]) {
        this.virtualItems[i].visible = true
      }
    }
  }

  /**
   * 获取当前滚动范围
   */
  getCurrentRange(): ScrollRange {
    return this.calculateVisibleRange()
  }

  /**
   * 获取可见的虚拟项
   */
  getVisibleItems(): VirtualItem[] {
    return this.virtualItems.filter(item => item.visible)
  }

  /**
   * 获取所有虚拟项
   */
  getAllItems(): VirtualItem[] {
    return [...this.virtualItems]
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    if (this.virtualItems.length === 0) {
      return 0
    }

    const lastItem = this.virtualItems[this.virtualItems.length - 1]
    return lastItem.top + lastItem.height
  }

  /**
   * 滚动到指定节点
   */
  scrollToNode(nodeId: TreeNodeId, align: 'start' | 'center' | 'end' = 'start'): void {
    const position = this.positionCache.get(nodeId)
    if (position === undefined || !this.scrollElement) {
      return
    }

    let scrollTop = position

    // 根据对齐方式调整滚动位置
    if (align === 'center') {
      scrollTop = position - this.config.containerHeight / 2
    } else if (align === 'end') {
      scrollTop = position - this.config.containerHeight + this.config.itemHeight
    }

    // 确保滚动位置在有效范围内
    scrollTop = Math.max(0, Math.min(scrollTop, this.getTotalHeight() - this.config.containerHeight))

    this.scrollElement.scrollTop = scrollTop
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): void {
    if (index < 0 || index >= this.virtualItems.length) {
      return
    }

    const item = this.virtualItems[index]
    this.scrollToNode(item.id, align)
  }

  /**
   * 获取节点在视口中的位置
   */
  getNodePosition(nodeId: TreeNodeId): { top: number; visible: boolean } | null {
    const position = this.positionCache.get(nodeId)
    if (position === undefined) {
      return null
    }

    const relativeTop = position - this.scrollTop
    const visible = relativeTop >= 0 && relativeTop < this.config.containerHeight

    return { top: relativeTop, visible }
  }

  /**
   * 更新项目高度
   */
  updateItemHeight(nodeId: TreeNodeId, height: number): void {
    this.heightCache.set(nodeId, height)
    this.updateVirtualItems()
    this.updateScrollRange()
  }

  /**
   * 清除高度缓存
   */
  clearHeightCache(): void {
    this.heightCache.clear()
    this.updateVirtualItems()
    this.updateScrollRange()
  }

  /**
   * 获取滚动统计信息
   */
  getScrollStats(): {
    totalItems: number
    visibleItems: number
    scrollTop: number
    totalHeight: number
    containerHeight: number
  } {
    const visibleItems = this.getVisibleItems()

    return {
      totalItems: this.virtualItems.length,
      visibleItems: visibleItems.length,
      scrollTop: this.scrollTop,
      totalHeight: this.getTotalHeight(),
      containerHeight: this.config.containerHeight,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<VirtualScrollConfig>): void {
    this.config = { ...this.config, ...config }
    this.clearHeightCache()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll.bind(this))
    }

    this.flattenedNodes = []
    this.virtualItems = []
    this.heightCache.clear()
    this.positionCache.clear()
    this.containerElement = undefined
    this.scrollElement = undefined
  }
}
