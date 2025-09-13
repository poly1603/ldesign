/**
 * 虚拟滚动组件
 * 优化大型PDF文档的渲染性能，只渲染可见区域
 */

export interface VirtualScrollOptions {
  itemHeight?: number // 固定项高度（如果知道）
  estimatedItemHeight?: number // 估算项高度
  overscan?: number // 预渲染项数量
  threshold?: number // 滚动阈值
  renderAhead?: number // 提前渲染距离（像素）
  useFixedHeight?: boolean // 是否使用固定高度
  enableSmoothScrolling?: boolean // 启用平滑滚动
  debounceDelay?: number // 防抖延迟
  containerHeight?: number // 容器高度
}

export interface VirtualItem {
  index: number
  start: number
  end: number
  height: number
  isVisible: boolean
  element?: HTMLElement
}

export interface ScrollState {
  scrollTop: number
  scrollDirection: 'up' | 'down' | 'none'
  isScrolling: boolean
  velocityY: number
}

export interface VirtualRange {
  startIndex: number
  endIndex: number
  visibleStartIndex: number
  visibleEndIndex: number
  totalHeight: number
}

/**
 * 虚拟滚动管理器
 */
export class VirtualScroller {
  private options: Required<VirtualScrollOptions>
  private container: HTMLElement | null = null
  private scrollContainer: HTMLElement | null = null
  
  // 滚动状态
  private scrollState: ScrollState = {
    scrollTop: 0,
    scrollDirection: 'none',
    isScrolling: false,
    velocityY: 0
  }
  
  // 项目管理
  private items: VirtualItem[] = []
  private itemCount = 0
  private measuredHeights = new Map<number, number>()
  private estimatedTotalHeight = 0
  
  // 缓存
  private rangeCache = new Map<string, VirtualRange>()
  private lastScrollTop = 0
  private lastScrollTime = 0
  
  // 事件处理
  private scrollHandler: ((event: Event) => void) | null = null
  private resizeObserver: ResizeObserver | null = null
  private scrollTimeout: number | null = null
  
  // 回调函数
  private onRangeChange: ((range: VirtualRange) => void) | null = null
  private onItemVisibilityChange: ((item: VirtualItem, isVisible: boolean) => void) | null = null
  private onScrollStateChange: ((state: ScrollState) => void) | null = null

  constructor(options: VirtualScrollOptions = {}) {
    this.options = {
      itemHeight: 0,
      estimatedItemHeight: 800, // PDF页面估算高度
      overscan: 3,
      threshold: 10,
      renderAhead: 1000,
      useFixedHeight: false,
      enableSmoothScrolling: true,
      debounceDelay: 16, // ~60fps
      containerHeight: 600,
      ...options
    }

    this.setupScrollHandler()
  }

  /**
   * 初始化虚拟滚动
   */
  initialize(container: HTMLElement, scrollContainer?: HTMLElement): void {
    this.container = container
    this.scrollContainer = scrollContainer || container

    // 设置容器样式
    this.setupContainerStyles()

    // 绑定事件
    this.bindEvents()

    // 初始化尺寸观察器
    this.setupResizeObserver()
  }

  /**
   * 设置项目数量
   */
  setItemCount(count: number): void {
    this.itemCount = count
    this.items = []
    this.measuredHeights.clear()
    this.rangeCache.clear()
    
    // 预估总高度
    this.estimatedTotalHeight = count * this.options.estimatedItemHeight
    
    // 初始化项目
    for (let i = 0; i < count; i++) {
      this.items.push({
        index: i,
        start: i * this.options.estimatedItemHeight,
        end: (i + 1) * this.options.estimatedItemHeight,
        height: this.options.estimatedItemHeight,
        isVisible: false
      })
    }

    this.updateScrollbarSize()
    this.calculateVisibleRange()
  }

  /**
   * 测量项目高度
   */
  measureItem(index: number, height: number): void {
    if (index < 0 || index >= this.itemCount) return

    const previousHeight = this.measuredHeights.get(index) || this.options.estimatedItemHeight
    this.measuredHeights.set(index, height)

    // 更新项目信息
    const item = this.items[index]
    if (item) {
      item.height = height
      
      // 重新计算位置
      this.recalculatePositions(index)
      
      // 如果高度发生变化，更新总高度
      const heightDiff = height - previousHeight
      if (heightDiff !== 0) {
        this.estimatedTotalHeight += heightDiff
        this.updateScrollbarSize()
      }
    }

    // 清除相关缓存
    this.clearRangeCache()
  }

  /**
   * 重新计算位置
   */
  private recalculatePositions(fromIndex: number = 0): void {
    let currentStart = fromIndex === 0 ? 0 : this.items[fromIndex - 1].end

    for (let i = fromIndex; i < this.items.length; i++) {
      const item = this.items[i]
      const height = this.measuredHeights.get(i) || this.options.estimatedItemHeight
      
      item.start = currentStart
      item.end = currentStart + height
      item.height = height
      
      currentStart = item.end
    }

    // 更新总高度
    if (this.items.length > 0) {
      this.estimatedTotalHeight = this.items[this.items.length - 1].end
    }
  }

  /**
   * 计算可见范围
   */
  calculateVisibleRange(): VirtualRange {
    const scrollTop = this.scrollState.scrollTop
    const containerHeight = this.getContainerHeight()
    const cacheKey = `${scrollTop}-${containerHeight}`

    // 检查缓存
    const cached = this.rangeCache.get(cacheKey)
    if (cached) return cached

    let startIndex = 0
    let endIndex = this.itemCount - 1
    let visibleStartIndex = 0
    let visibleEndIndex = this.itemCount - 1

    if (this.items.length > 0) {
      // 二分查找起始索引
      startIndex = this.findStartIndex(scrollTop - this.options.renderAhead)
      
      // 二分查找结束索引
      endIndex = this.findEndIndex(scrollTop + containerHeight + this.options.renderAhead)

      // 计算严格可见范围
      visibleStartIndex = this.findStartIndex(scrollTop)
      visibleEndIndex = this.findEndIndex(scrollTop + containerHeight)

      // 应用 overscan
      startIndex = Math.max(0, startIndex - this.options.overscan)
      endIndex = Math.min(this.itemCount - 1, endIndex + this.options.overscan)
    }

    const range: VirtualRange = {
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex,
      totalHeight: this.estimatedTotalHeight
    }

    // 缓存结果
    this.rangeCache.set(cacheKey, range)
    
    return range
  }

  /**
   * 二分查找起始索引
   */
  private findStartIndex(scrollTop: number): number {
    let left = 0
    let right = this.items.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const item = this.items[mid]

      if (item.end <= scrollTop) {
        left = mid + 1
      } else if (item.start > scrollTop) {
        right = mid - 1
      } else {
        return mid
      }
    }

    return left
  }

  /**
   * 二分查找结束索引
   */
  private findEndIndex(scrollBottom: number): number {
    let left = 0
    let right = this.items.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const item = this.items[mid]

      if (item.start >= scrollBottom) {
        right = mid - 1
      } else if (item.end < scrollBottom) {
        left = mid + 1
      } else {
        return mid
      }
    }

    return right
  }

  /**
   * 滚动到指定项目
   */
  scrollToItem(index: number, alignment: 'start' | 'center' | 'end' = 'start'): void {
    if (index < 0 || index >= this.itemCount || !this.scrollContainer) return

    const item = this.items[index]
    if (!item) return

    const containerHeight = this.getContainerHeight()
    let targetScrollTop = item.start

    switch (alignment) {
      case 'center':
        targetScrollTop = item.start - (containerHeight - item.height) / 2
        break
      case 'end':
        targetScrollTop = item.end - containerHeight
        break
      default:
        targetScrollTop = item.start
    }

    // 确保不超出边界
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, this.estimatedTotalHeight - containerHeight))

    if (this.options.enableSmoothScrolling) {
      this.scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    } else {
      this.scrollContainer.scrollTop = targetScrollTop
    }
  }

  /**
   * 获取项目位置信息
   */
  getItemRect(index: number): DOMRect | null {
    if (index < 0 || index >= this.itemCount) return null

    const item = this.items[index]
    if (!item) return null

    return new DOMRect(0, item.start, this.getContainerWidth(), item.height)
  }

  /**
   * 获取可见项目
   */
  getVisibleItems(): VirtualItem[] {
    const range = this.calculateVisibleRange()
    return this.items.slice(range.visibleStartIndex, range.visibleEndIndex + 1)
  }

  /**
   * 设置容器样式
   */
  private setupContainerStyles(): void {
    if (!this.container || !this.scrollContainer) return

    // 设置滚动容器样式
    const scrollContainerStyle = this.scrollContainer.style
    scrollContainerStyle.overflowY = 'auto'
    scrollContainerStyle.overflowX = 'hidden'
    
    if (this.options.enableSmoothScrolling) {
      scrollContainerStyle.scrollBehavior = 'smooth'
    }

    // 设置内容容器样式
    const containerStyle = this.container.style
    containerStyle.position = 'relative'
    containerStyle.height = `${this.estimatedTotalHeight}px`
  }

  /**
   * 更新滚动条大小
   */
  private updateScrollbarSize(): void {
    if (this.container) {
      this.container.style.height = `${this.estimatedTotalHeight}px`
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.scrollContainer) return

    this.scrollContainer.addEventListener('scroll', this.scrollHandler!, { passive: true })
  }

  /**
   * 设置滚动处理器
   */
  private setupScrollHandler(): void {
    let ticking = false

    this.scrollHandler = (event: Event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll(event)
          ticking = false
        })
        ticking = true
      }
    }
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(event: Event): void {
    if (!this.scrollContainer) return

    const now = performance.now()
    const scrollTop = this.scrollContainer.scrollTop
    const deltaTime = now - this.lastScrollTime
    const deltaY = scrollTop - this.lastScrollTop

    // 更新滚动状态
    this.scrollState = {
      scrollTop,
      scrollDirection: deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none',
      isScrolling: true,
      velocityY: deltaTime > 0 ? deltaY / deltaTime : 0
    }

    this.lastScrollTop = scrollTop
    this.lastScrollTime = now

    // 计算新的可见范围
    const range = this.calculateVisibleRange()
    
    // 更新项目可见性
    this.updateItemVisibility(range)

    // 触发回调
    if (this.onRangeChange) {
      this.onRangeChange(range)
    }

    if (this.onScrollStateChange) {
      this.onScrollStateChange(this.scrollState)
    }

    // 设置滚动结束检测
    this.setScrollEndTimer()
  }

  /**
   * 更新项目可见性
   */
  private updateItemVisibility(range: VirtualRange): void {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      const wasVisible = item.isVisible
      const isVisible = i >= range.visibleStartIndex && i <= range.visibleEndIndex

      if (wasVisible !== isVisible) {
        item.isVisible = isVisible
        
        if (this.onItemVisibilityChange) {
          this.onItemVisibilityChange(item, isVisible)
        }
      }
    }
  }

  /**
   * 设置滚动结束计时器
   */
  private setScrollEndTimer(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }

    this.scrollTimeout = window.setTimeout(() => {
      this.scrollState.isScrolling = false
      this.scrollState.velocityY = 0
      
      if (this.onScrollStateChange) {
        this.onScrollStateChange(this.scrollState)
      }
    }, 150)
  }

  /**
   * 设置尺寸观察器
   */
  private setupResizeObserver(): void {
    if (!this.container || !('ResizeObserver' in window)) return

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 容器尺寸变化时重新计算
        this.clearRangeCache()
        
        const range = this.calculateVisibleRange()
        if (this.onRangeChange) {
          this.onRangeChange(range)
        }
      }
    })

    this.resizeObserver.observe(this.container)
    
    if (this.scrollContainer !== this.container && this.scrollContainer) {
      this.resizeObserver.observe(this.scrollContainer)
    }
  }

  /**
   * 获取容器高度
   */
  private getContainerHeight(): number {
    return this.scrollContainer?.clientHeight || this.options.containerHeight
  }

  /**
   * 获取容器宽度
   */
  private getContainerWidth(): number {
    return this.container?.clientWidth || 0
  }

  /**
   * 清除范围缓存
   */
  private clearRangeCache(): void {
    this.rangeCache.clear()
  }

  /**
   * 设置回调函数
   */
  onRangeChanged(callback: (range: VirtualRange) => void): void {
    this.onRangeChange = callback
  }

  onItemVisibilityChanged(callback: (item: VirtualItem, isVisible: boolean) => void): void {
    this.onItemVisibilityChange = callback
  }

  onScrollStateChanged(callback: (state: ScrollState) => void): void {
    this.onScrollStateChange = callback
  }

  /**
   * 获取滚动状态
   */
  getScrollState(): ScrollState {
    return { ...this.scrollState }
  }

  /**
   * 获取当前范围
   */
  getCurrentRange(): VirtualRange {
    return this.calculateVisibleRange()
  }

  /**
   * 获取项目信息
   */
  getItem(index: number): VirtualItem | null {
    return this.items[index] || null
  }

  /**
   * 获取所有项目
   */
  getAllItems(): VirtualItem[] {
    return [...this.items]
  }

  /**
   * 刷新
   */
  refresh(): void {
    this.clearRangeCache()
    this.recalculatePositions()
    this.updateScrollbarSize()
    
    const range = this.calculateVisibleRange()
    if (this.onRangeChange) {
      this.onRangeChange(range)
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 移除事件监听
    if (this.scrollContainer && this.scrollHandler) {
      this.scrollContainer.removeEventListener('scroll', this.scrollHandler)
    }

    // 断开尺寸观察器
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // 清理计时器
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
      this.scrollTimeout = null
    }

    // 清理引用
    this.container = null
    this.scrollContainer = null
    this.scrollHandler = null
    this.onRangeChange = null
    this.onItemVisibilityChange = null
    this.onScrollStateChange = null

    // 清理缓存
    this.items = []
    this.measuredHeights.clear()
    this.rangeCache.clear()
  }
}

/**
 * 创建虚拟滚动器
 */
export function createVirtualScroller(options?: VirtualScrollOptions): VirtualScroller {
  return new VirtualScroller(options)
}
