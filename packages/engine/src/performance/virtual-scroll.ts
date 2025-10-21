/**
 * Virtual Scrolling System
 * 
 * 高性能虚拟滚动和组件懒加载系统
 * - 虚拟列表渲染
 * - 动态高度支持
 * - 组件懒加载
 * - 资源预加载
 * - 滚动性能优化
 */

import type { Logger } from '../types'
import { type Component, computed, type ComputedRef, onUnmounted, ref, type Ref, shallowRef, watchEffect } from 'vue'

// 虚拟滚动项
export interface VirtualItem<T = any> {
  index: number
  data: T
  offset: number
  size: number
  visible: boolean
}

// 虚拟滚动配置
export interface VirtualScrollConfig {
  itemHeight?: number | ((index: number, item: any) => number)
  buffer?: number
  overscan?: number
  horizontal?: boolean
  pageMode?: boolean
  preloadTime?: number
  estimateSize?: number
  keepAlive?: boolean
  threshold?: number
  // 新增配置
  bidirectional?: boolean // 双向滚动支持
  adaptiveBuffer?: boolean // 自适应缓冲区
  minBuffer?: number // 最小缓冲区
  maxBuffer?: number // 最大缓冲区
}

// 滚动状态
export interface ScrollState {
  offset: number
  clientSize: number
  scrollSize: number
  startIndex: number
  endIndex: number
  visibleItems: number
}

// 懒加载组件配置
export interface LazyComponentConfig {
  loading?: Component
  error?: Component
  delay?: number
  timeout?: number
  retries?: number
  preload?: boolean
  distance?: number
}

/**
 * 虚拟滚动管理器
 */
export class VirtualScroller<T = any> {
  // 响应式数据
  private items = shallowRef<T[]>([])
  private scrollOffset = ref(0)
  private clientSize = ref(0)
  private scrollSize = ref(0)
  private isScrolling = ref(false)

  // 缓存 (with LRU eviction)
  private sizeCache = new Map<number, number>()
  private offsetCache = new Map<number, number>()
  private cacheAccessOrder = new Set<number>()  // Track access order for LRU
  private readonly maxCacheSize = 1000  // Maximum cache entries
  private lastMeasuredIndex = -1

  // 配置
  private config: Required<VirtualScrollConfig>

  // 计算属性
  public readonly visibleRange: ComputedRef<{ start: number; end: number }>
  public readonly visibleItems: ComputedRef<VirtualItem<T>[]>
  public readonly scrollState: ComputedRef<ScrollState>

  // 性能监控
  private scrollTimer: NodeJS.Timeout | null = null
  private rafId: number | null = null
  private lastScrollTime = 0
  private scrollVelocity = 0

  constructor(
    config: VirtualScrollConfig = {},
    private logger?: Logger
  ) {
    this.config = {
      itemHeight: 50,
      buffer: 5,
      overscan: 3,
      horizontal: false,
      pageMode: false,
      preloadTime: 50,
      estimateSize: 50,
      keepAlive: false,
      threshold: 0.1,
      bidirectional: config.bidirectional ?? false,
      adaptiveBuffer: config.adaptiveBuffer ?? true,
      minBuffer: config.minBuffer || 3,
      maxBuffer: config.maxBuffer || 10,
      ...config
    }

    // 初始化计算属性
    this.visibleRange = computed(() => this.calculateVisibleRange())
    this.visibleItems = computed(() => this.getVisibleItems())
    this.scrollState = computed(() => this.getScrollState())

    this.logger?.debug('Virtual scroller initialized', this.config)
  }

  /**
   * 设置数据项
   */
  setItems(items: T[]): void {
    this.items.value = items
    this.resetCache()
    this.updateScrollSize()
  }

  /**
   * 更新容器尺寸
   */
  updateSize(clientSize: number): void {
    this.clientSize.value = clientSize
  }

  /**
   * 处理滚动事件
   */
  handleScroll(offset: number): void {
    const now = Date.now()
    const timeDelta = now - this.lastScrollTime

    if (timeDelta > 0) {
      const offsetDelta = offset - this.scrollOffset.value
      this.scrollVelocity = offsetDelta / timeDelta
    }

    this.scrollOffset.value = offset
    this.lastScrollTime = now

    // 防抖处理
    this.isScrolling.value = true

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }

    this.scrollTimer = setTimeout(() => {
      this.isScrolling.value = false
      this.scrollVelocity = 0
      // 清理远离视口的缓存
      this.cleanupDistantCache()
      this.scrollTimer = null
    }, 150)

    // 预测滚动
    if (Math.abs(this.scrollVelocity) > 0.5) {
      this.predictivePreload()
    }
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(
    index: number,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto'
  ): void {
    const targetOffset = this.getItemOffset(index)
    const itemSize = this.getItemSize(index)

    let offset = targetOffset

    switch (align) {
      case 'center':
        offset = targetOffset - (this.clientSize.value - itemSize) / 2
        break
      case 'end':
        offset = targetOffset - this.clientSize.value + itemSize
        break
      case 'auto': {
        const currentOffset = this.scrollOffset.value
        const currentEnd = currentOffset + this.clientSize.value

        if (targetOffset < currentOffset) {
          offset = targetOffset
        } else if (targetOffset + itemSize > currentEnd) {
          offset = targetOffset - this.clientSize.value + itemSize
        } else {
          return // 已在视口内
        }
        break
      }
    }

    this.smoothScrollTo(Math.max(0, offset))
  }

  /**
   * 平滑滚动
   */
  private smoothScrollTo(target: number): void {
    const start = this.scrollOffset.value
    const distance = target - start
    const duration = Math.min(500, Math.abs(distance) * 2)
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeProgress = this.easeInOutCubic(progress)

      const currentOffset = start + distance * easeProgress
      this.scrollOffset.value = currentOffset

      if (progress < 1) {
        this.rafId = requestAnimationFrame(animate)
      }
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    animate()
  }

  /**
   * 缓动函数
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 + 4 * (t - 1) * (t - 1) * (t - 1)
  }

  /**
   * 计算可见范围（支持自适应缓冲区）
   */
  private calculateVisibleRange(): { start: number; end: number } {
    let { buffer, overscan } = this.config
    const { adaptiveBuffer, minBuffer, maxBuffer, bidirectional } = this.config
    const scrollTop = this.scrollOffset.value
    const clientHeight = this.clientSize.value

    // 自适应缓冲区：根据滚动速度调整
    if (adaptiveBuffer) {
      const velocity = Math.abs(this.scrollVelocity)

      if (velocity > 2) {
        // 快速滚动：增加缓冲区
        buffer = Math.min(maxBuffer, buffer + Math.floor(velocity))
      } else if (velocity < 0.5) {
        // 慢速或静止：减少缓冲区
        buffer = Math.max(minBuffer, buffer - 1)
      }
    }

    // 二分查找起始索引
    let startIndex = this.findNearestIndex(scrollTop)
    let endIndex = this.findNearestIndex(scrollTop + clientHeight)

    // 添加缓冲区
    if (bidirectional || this.scrollVelocity < 0) {
      // 双向或向上滚动：两个方向都加缓冲
      startIndex = Math.max(0, startIndex - buffer - overscan)
      endIndex = Math.min(this.items.value.length - 1, endIndex + buffer + overscan)
    } else {
      // 向下滚动：在滚动方向增加更多缓冲
      startIndex = Math.max(0, startIndex - Math.floor(buffer / 2) - overscan)
      endIndex = Math.min(this.items.value.length - 1, endIndex + buffer * 2 + overscan)
    }

    return { start: startIndex, end: endIndex }
  }

  /**
   * 二分查找最近的索引
   */
  private findNearestIndex(offset: number): number {
    const items = this.items.value
    let low = 0
    let high = items.length - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midOffset = this.getItemOffset(mid)

      if (midOffset < offset) {
        low = mid + 1
      } else if (midOffset > offset) {
        high = mid - 1
      } else {
        return mid
      }
    }

    return low
  }

  /**
   * 获取可见项
   */
  private getVisibleItems(): VirtualItem<T>[] {
    const { start, end } = this.visibleRange.value
    const items: VirtualItem<T>[] = []

    for (let i = start; i <= end; i++) {
      const item = this.items.value[i]
      if (!item) continue

      items.push({
        index: i,
        data: item,
        offset: this.getItemOffset(i),
        size: this.getItemSize(i),
        visible: true
      })
    }

    return items
  }

  /**
   * 获取项大小
   */
  private getItemSize(index: number): number {
    // 检查缓存
    if (this.sizeCache.has(index)) {
      this.updateCacheAccess(index)
      return this.sizeCache.get(index)!
    }

    const { itemHeight, estimateSize } = this.config

    if (typeof itemHeight === 'function') {
      const item = this.items.value[index]
      const size = itemHeight(index, item) || estimateSize
      this.setCacheWithEviction(index, size, 'size')
      return size
    }

    return itemHeight
  }

  /**
   * 获取项偏移
   */
  private getItemOffset(index: number): number {
    if (index < 0 || index >= this.items.value.length) {
      return 0
    }

    // 检查缓存
    if (this.offsetCache.has(index)) {
      this.updateCacheAccess(index)
      return this.offsetCache.get(index)!
    }

    let offset = 0

    // 计算到最后测量位置的偏移
    if (this.lastMeasuredIndex >= 0 && index > this.lastMeasuredIndex) {
      offset = this.offsetCache.get(this.lastMeasuredIndex) || 0

      for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
        offset += this.getItemSize(i - 1)
      }
    } else {
      // 从头计算
      for (let i = 0; i < index; i++) {
        offset += this.getItemSize(i)
      }
    }

    this.setCacheWithEviction(index, offset, 'offset')
    this.lastMeasuredIndex = Math.max(this.lastMeasuredIndex, index)

    return offset
  }

  /**
   * 更新滚动尺寸
   */
  private updateScrollSize(): void {
    const itemCount = this.items.value.length
    if (itemCount === 0) {
      this.scrollSize.value = 0
      return
    }

    const lastOffset = this.getItemOffset(itemCount - 1)
    const lastSize = this.getItemSize(itemCount - 1)
    this.scrollSize.value = lastOffset + lastSize
  }

  /**
   * 预测性预加载
   */
  private predictivePreload(): void {
    const { preloadTime } = this.config
    const predictedOffset = this.scrollOffset.value + this.scrollVelocity * preloadTime

    const predictedStart = this.findNearestIndex(predictedOffset)
    const predictedEnd = this.findNearestIndex(
      predictedOffset + this.clientSize.value
    )

    // 触发预加载
    this.logger?.debug('Predictive preload', {
      velocity: this.scrollVelocity,
      predictedRange: { start: predictedStart, end: predictedEnd }
    })
  }

  /**
   * 获取滚动状态
   */
  private getScrollState(): ScrollState {
    const { start, end } = this.visibleRange.value

    return {
      offset: this.scrollOffset.value,
      clientSize: this.clientSize.value,
      scrollSize: this.scrollSize.value,
      startIndex: start,
      endIndex: end,
      visibleItems: end - start + 1
    }
  }

  /**
   * 重置缓存
   */
  private resetCache(): void {
    this.sizeCache.clear()
    this.offsetCache.clear()
    this.cacheAccessOrder.clear()
    this.lastMeasuredIndex = -1
  }

  /**
   * 更新缓存访问顺序 (LRU)
   */
  private updateCacheAccess(index: number): void {
    this.cacheAccessOrder.delete(index)
    this.cacheAccessOrder.add(index)
  }

  /**
   * 设置缓存并进行LRU驱逐
   */
  private setCacheWithEviction(index: number, value: number, type: 'size' | 'offset'): void {
    const cache = type === 'size' ? this.sizeCache : this.offsetCache

    // 如果缓存已满，驱逐最少使用的项
    if (cache.size >= this.maxCacheSize && !cache.has(index)) {
      const lruIndex = this.cacheAccessOrder.values().next().value
      if (lruIndex !== undefined) {
        this.sizeCache.delete(lruIndex)
        this.offsetCache.delete(lruIndex)
        this.cacheAccessOrder.delete(lruIndex)
      }
    }

    cache.set(index, value)
    this.updateCacheAccess(index)
  }

  /**
   * 清理远离当前视口的缓存
   */
  private cleanupDistantCache(): void {
    const { start, end } = this.visibleRange.value
    const keepDistance = 100  // Keep items within 100 indices

    for (const index of this.cacheAccessOrder) {
      if (index < start - keepDistance || index > end + keepDistance) {
        this.sizeCache.delete(index)
        this.offsetCache.delete(index)
        this.cacheAccessOrder.delete(index)
      }
    }
  }

  /**
   * 更新项大小
   */
  updateItemSize(index: number, size: number): void {
    const oldSize = this.sizeCache.get(index)

    if (oldSize !== size) {
      this.sizeCache.set(index, size)
      this.updateCacheAccess(index)

      // 清除后续偏移缓存
      for (let i = index + 1; i <= this.lastMeasuredIndex; i++) {
        this.offsetCache.delete(i)
        this.cacheAccessOrder.delete(i)
      }

      this.updateScrollSize()
    }
  }

  /**
   * 销毁
   */
  dispose(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    this.resetCache()

    // 重置状态
    this.items.value = []
    this.scrollOffset.value = 0
    this.clientSize.value = 0
    this.scrollSize.value = 0
    this.isScrolling.value = false
    this.scrollVelocity = 0
    this.lastScrollTime = 0
  }
}

/**
 * 组件懒加载器
 */
export class ComponentLazyLoader {
  private loadedComponents = new Set<string>()
  private loadingComponents = new Map<string, Promise<Component>>()
  private componentCache = new Map<string, Component>()
  private observers = new Map<string, IntersectionObserver>()
  private readonly maxCacheSize = 50  // Limit component cache size
  private loadTimeouts = new Map<string, NodeJS.Timeout>()

  constructor(
    private config: LazyComponentConfig = {},
    private logger?: Logger
  ) {
    this.config = {
      delay: 0,
      timeout: 10000,
      retries: 3,
      preload: false,
      distance: 50,
      ...config
    }
  }

  /**
   * 懒加载组件
   */
  async loadComponent(
    loader: () => Promise<Component>,
    key: string
  ): Promise<Component> {
    // 检查缓存
    if (this.componentCache.has(key)) {
      return this.componentCache.get(key)!
    }

    // 检查是否正在加载
    if (this.loadingComponents.has(key)) {
      return this.loadingComponents.get(key)!
    }

    // 开始加载
    const loadPromise = this.loadWithRetry(loader, key)
    this.loadingComponents.set(key, loadPromise)

    try {
      const component = await loadPromise

      // 缓存大小限制
      if (this.componentCache.size >= this.maxCacheSize) {
        const firstKey = this.componentCache.keys().next().value
        if (firstKey) {
          this.componentCache.delete(firstKey)
          this.loadedComponents.delete(firstKey)
        }
      }

      this.componentCache.set(key, component)
      this.loadedComponents.add(key)
      this.loadingComponents.delete(key)

      this.logger?.debug(`Component loaded: ${key}`)

      return component
    } catch (error) {
      this.loadingComponents.delete(key)
      this.logger?.error(`Failed to load component: ${key}`, error)
      throw error
    }
  }

  /**
   * 带重试的加载
   */
  private async loadWithRetry(
    loader: () => Promise<Component>,
    key: string,
    attempt = 1
  ): Promise<Component> {
    const { timeout, retries, delay } = this.config

    try {
      // 延迟加载
      if (delay && attempt === 1) {
        await new Promise(resolve => {
          const timer = setTimeout(resolve, delay)
          this.loadTimeouts.set(`${key}_delay`, timer)
        })
        this.loadTimeouts.delete(`${key}_delay`)
      }

      // 超时控制
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Load timeout')), timeout)
        this.loadTimeouts.set(`${key}_timeout`, timer)
      })

      const result = await Promise.race([loader(), timeoutPromise])
      this.clearTimeout(`${key}_timeout`)
      return result
    } catch (error) {
      this.clearTimeout(`${key}_timeout`)
      if (attempt < retries!) {
        this.logger?.debug(`Retrying component load: ${key} (attempt ${attempt + 1})`)

        // 指数退避
        await new Promise(resolve =>
          setTimeout(resolve, 2 ** attempt * 1000)
        )

        return this.loadWithRetry(loader, key, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Clear timeout helper
   */
  private clearTimeout(key: string): void {
    const timeout = this.loadTimeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      this.loadTimeouts.delete(key)
    }
  }

  /**
   * 观察元素并自动加载
   */
  observe(
    element: Element,
    loader: () => Promise<Component>,
    key: string
  ): void {
    const { distance, preload } = this.config

    // 清理旧观察器
    const oldObserver = this.observers.get(key)
    if (oldObserver) {
      oldObserver.disconnect()
    }

    // 创建观察器
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || (preload && entry.boundingClientRect.top < distance!)) {
            // 开始加载
            this.loadComponent(loader, key).catch(error => {
              this.logger?.error(`Failed to lazy load component: ${key}`, error)
            })

            // 停止观察
            observer.unobserve(element)
            observer.disconnect()
            this.observers.delete(key)
          }
        }
      },
      {
        rootMargin: `${distance}px`,
        threshold: 0
      }
    )

    observer.observe(element)
    this.observers.set(key, observer)
  }

  /**
   * 预加载组件
   */
  async preload(
    loaders: Array<{ key: string; loader: () => Promise<Component> }>
  ): Promise<void> {
    const promises = loaders.map(({ key, loader }) =>
      this.loadComponent(loader, key).catch(error => {
        this.logger?.warn(`Failed to preload component: ${key}`, error)
      })
    )

    await Promise.all(promises)
  }

  /**
   * 获取加载状态
   */
  getLoadStatus(): {
    loaded: string[]
    loading: string[]
    cached: number
  } {
    return {
      loaded: Array.from(this.loadedComponents),
      loading: Array.from(this.loadingComponents.keys()),
      cached: this.componentCache.size
    }
  }

  /**
   * 清理缓存
   */
  clearCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => {
        this.componentCache.delete(key)
        this.loadedComponents.delete(key)
        this.loadingComponents.delete(key)

        // Clear observer for specific key
        const observer = this.observers.get(key)
        if (observer) {
          observer.disconnect()
          this.observers.delete(key)
        }

        // Clear timeouts for specific key
        this.clearTimeout(`${key}_timeout`)
        this.clearTimeout(`${key}_delay`)
      })
    } else {
      this.componentCache.clear()
      this.loadedComponents.clear()
      this.loadingComponents.clear()

      // Clear all observers
      this.observers.forEach(observer => observer.disconnect())
      this.observers.clear()

      // Clear all timeouts
      this.loadTimeouts.forEach(timeout => clearTimeout(timeout))
      this.loadTimeouts.clear()
    }
  }

  /**
   * 销毁
   */
  dispose(): void {
    // Clear all caches and observers
    this.clearCache()

    // Clear all pending timeouts
    this.loadTimeouts.forEach(timeout => clearTimeout(timeout))
    this.loadTimeouts.clear()

    // Clear logger reference
    this.logger = undefined
  }
}

/**
 * 资源预加载器
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>()
  private preloadQueue: Array<{
    url: string
    type: 'image' | 'script' | 'style' | 'font' | 'data'
    priority: number
  }> = []

  private isPreloading = false
  private concurrentLoads = 3

  constructor(private logger?: Logger) { }

  /**
   * 预加载资源
   */
  async preload(
    resources: Array<{
      url: string
      type: 'image' | 'script' | 'style' | 'font' | 'data'
      priority?: number
    }>
  ): Promise<void> {
    // 添加到队列
    resources.forEach(resource => {
      if (!this.preloadedResources.has(resource.url)) {
        this.preloadQueue.push({
          ...resource,
          priority: resource.priority || 0
        })
      }
    })

    // 按优先级排序
    this.preloadQueue.sort((a, b) => b.priority - a.priority)

    // 开始预加载
    if (!this.isPreloading) {
      await this.processQueue()
    }
  }

  /**
   * 处理预加载队列
   */
  private async processQueue(): Promise<void> {
    this.isPreloading = true

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, this.concurrentLoads)

      await Promise.all(
        batch.map(resource => this.loadResource(resource))
      )
    }

    this.isPreloading = false
  }

  /**
   * 加载单个资源
   */
  private async loadResource(resource: {
    url: string
    type: 'image' | 'script' | 'style' | 'font' | 'data'
  }): Promise<void> {
    const { url, type } = resource

    try {
      switch (type) {
        case 'image':
          await this.preloadImage(url)
          break
        case 'script':
          await this.preloadScript(url)
          break
        case 'style':
          await this.preloadStyle(url)
          break
        case 'font':
          await this.preloadFont(url)
          break
        case 'data':
          await this.preloadData(url)
          break
      }

      this.preloadedResources.add(url)
      this.logger?.debug(`Resource preloaded: ${url}`)
    } catch (error) {
      this.logger?.error(`Failed to preload resource: ${url}`, error)
    }
  }

  /**
   * 预加载图片
   */
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 预加载脚本
   */
  private preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = url
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  /**
   * 预加载样式
   */
  private preloadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = url
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  /**
   * 预加载字体
   */
  private preloadFont(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.href = url
      link.crossOrigin = 'anonymous'
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  /**
   * 预加载数据
   */
  private async preloadData(url: string): Promise<void> {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  }

  /**
   * 检查资源是否已预加载
   */
  isPreloaded(url: string): boolean {
    return this.preloadedResources.has(url)
  }

  /**
   * 获取预加载状态
   */
  getStatus(): {
    preloaded: number
    queued: number
    isPreloading: boolean
  } {
    return {
      preloaded: this.preloadedResources.size,
      queued: this.preloadQueue.length,
      isPreloading: this.isPreloading
    }
  }
}

/**
 * Vue 组合式 API
 */
export function useVirtualScroll<T = any>(
  items: Ref<T[]>,
  config?: VirtualScrollConfig
): {
  scroller: VirtualScroller<T>
  visibleItems: ComputedRef<VirtualItem<T>[]>
  scrollState: ComputedRef<ScrollState>
  handleScroll: (offset: number) => void
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void
} {
  const scroller = new VirtualScroller<T>(config)

  // 监听数据变化
  watchEffect(() => {
    scroller.setItems(items.value)
  })

  // 组件卸载时自动清理
  onUnmounted(() => scroller.dispose())

  return {
    scroller,
    visibleItems: scroller.visibleItems,
    scrollState: scroller.scrollState,
    handleScroll: (offset) => scroller.handleScroll(offset),
    scrollToIndex: (index, align) => scroller.scrollToIndex(index, align)
  }
}

/**
 * 创建组件懒加载器
 */
export function createComponentLazyLoader(
  config?: LazyComponentConfig,
  logger?: Logger
): ComponentLazyLoader {
  return new ComponentLazyLoader(config, logger)
}

/**
 * 创建资源预加载器
 */
export function createResourcePreloader(logger?: Logger): ResourcePreloader {
  return new ResourcePreloader(logger)
}