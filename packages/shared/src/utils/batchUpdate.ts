/**
 * 批量更新优化工具
 * 
 * @description
 * 提供批量更新机制，减少频繁的 DOM 操作和重渲染，提升性能
 */

import { nextTick } from 'vue'

/**
 * 批量更新配置
 */
export interface BatchUpdateConfig {
  /** 批量大小 */
  batchSize?: number
  /** 延迟时间(ms) */
  delay?: number
  /** 是否使用 requestAnimationFrame */
  useRAF?: boolean
  /** 更新回调 */
  onUpdate?: (items: any[]) => void
  /** 完成回调 */
  onComplete?: () => void
}

/**
 * 创建批量更新器
 * 
 * @param config - 配置选项
 * @returns 批量更新器实例
 * 
 * @example
 * ```typescript
 * const batcher = createBatchUpdater({
 *   batchSize: 100,
 *   delay: 16,
 *   onUpdate: (items) => {
 *     
 *   }
 * })
 * 
 * // 添加更新项
 * for (let i = 0; i < 1000; i++) {
 *   batcher.add({ id: i, value: Math.random() })
 * }
 * 
 * // 执行批量更新
 * await batcher.flush()
 * ```
 */
export function createBatchUpdater<T = any>(config: BatchUpdateConfig = {}) {
  const {
    batchSize = 50,
    delay = 0,
    useRAF = true,
    onUpdate,
    onComplete,
  } = config

  const queue: T[] = []
  let isProcessing = false
  let rafId: number | null = null
  let timerId: NodeJS.Timeout | null = null

  /**
   * 添加项目到队列
   */
  const add = (item: T): void => {
    queue.push(item)
    
    if (!isProcessing) {
      scheduleUpdate()
    }
  }

  /**
   * 添加多个项目到队列
   */
  const addAll = (items: T[]): void => {
    queue.push(...items)
    
    if (!isProcessing) {
      scheduleUpdate()
    }
  }

  /**
   * 调度更新
   */
  const scheduleUpdate = (): void => {
    if (isProcessing) return
    
    isProcessing = true
    
    if (useRAF && typeof requestAnimationFrame !== 'undefined') {
      rafId = requestAnimationFrame(processBatch)
    } else if (delay > 0) {
      timerId = setTimeout(processBatch, delay)
    } else {
      nextTick(processBatch)
    }
  }

  /**
   * 处理批次
   */
  const processBatch = async (): Promise<void> => {
    if (queue.length === 0) {
      isProcessing = false
      return
    }

    const batch = queue.splice(0, batchSize)
    
    // 执行更新回调
    if (onUpdate) {
      await Promise.resolve(onUpdate(batch))
    }

    // 如果还有剩余项目，继续处理
    if (queue.length > 0) {
      scheduleUpdate()
    } else {
      isProcessing = false
      onComplete?.()
    }
  }

  /**
   * 立即执行所有待处理项目
   */
  const flush = async (): Promise<void> => {
    // 取消已调度的更新
    cancel()
    
    while (queue.length > 0) {
      await processBatch()
    }
  }

  /**
   * 取消待处理的更新
   */
  const cancel = (): void => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    
    isProcessing = false
  }

  /**
   * 清空队列
   */
  const clear = (): void => {
    cancel()
    queue.length = 0
  }

  /**
   * 获取队列大小
   */
  const size = (): number => queue.length

  /**
   * 是否正在处理
   */
  const isActive = (): boolean => isProcessing

  return {
    add,
    addAll,
    flush,
    cancel,
    clear,
    size,
    isActive,
  }
}

/**
 * 批量渲染组件
 * 
 * @param items - 要渲染的项目列表
 * @param renderFn - 渲染函数
 * @param config - 配置选项
 * @returns Promise
 * 
 * @example
 * ```typescript
 * const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
 * 
 * await batchRender(items, (item) => {
 *   // 渲染单个项目
 *   const element = document.createElement('div')
 *   element.textContent = item.name
 *   container.appendChild(element)
 * }, {
 *   batchSize: 100,
 *   delay: 16
 * })
 * ```
 */
export async function batchRender<T>(
  items: T[],
  renderFn: (item: T, index: number) => void | Promise<void>,
  config: Omit<BatchUpdateConfig, 'onUpdate'> = {}
): Promise<void> {
  return new Promise((resolve) => {
    let currentIndex = 0
    
    const batcher = createBatchUpdater({
      ...config,
      onUpdate: async (batch: T[]) => {
        for (const item of batch) {
          await renderFn(item, currentIndex++)
        }
      },
      onComplete: resolve,
    })
    
    batcher.addAll(items)
  })
}

/**
 * 分块处理大数组
 * 
 * @param array - 要处理的数组
 * @param processFn - 处理函数
 * @param chunkSize - 分块大小
 * @returns Promise
 * 
 * @example
 * ```typescript
 * const data = Array.from({ length: 100000 }, (_, i) => i)
 * 
 * const results = await processInChunks(data, async (chunk) => {
 *   // 处理每个分块
 *   return chunk.map(n => n * 2)
 * }, 1000)
 * ```
 */
export async function processInChunks<T, R>(
  array: T[],
  processFn: (chunk: T[]) => R | Promise<R>,
  chunkSize = 1000
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    const result = await processFn(chunk)
    results.push(result)
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  
  return results
}

/**
 * 虚拟滚动辅助函数
 * 
 * @param totalItems - 总项目数
 * @param itemHeight - 单项高度
 * @param containerHeight - 容器高度
 * @param scrollTop - 滚动位置
 * @param overscan - 额外渲染的项目数
 * @returns 可见项目的索引范围
 * 
 * @example
 * ```typescript
 * const { startIndex, endIndex } = getVisibleRange(
 *   1000,  // 总共1000个项目
 *   50,    // 每个项目50px高
 *   500,   // 容器500px高
 *   1000,  // 滚动了1000px
 *   3      // 额外渲染3个项目
 * )
 * 
 * // 只渲染可见范围内的项目
 * const visibleItems = items.slice(startIndex, endIndex)
 * ```
 */
export function getVisibleRange(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number,
  overscan = 3
): { startIndex: number; endIndex: number; offsetY: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  const offsetY = startIndex * itemHeight
  
  return { startIndex, endIndex, offsetY }
}
