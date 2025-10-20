/**
 * 懒加载工具 - 支持代码分割和按需加载
 * 
 * 提供模块懒加载、预加载和缓存功能
 */

// 模块缓存
const moduleCache = new Map<string, Promise<any>>()

// 预加载队列
const preloadQueue = new Set<string>()

/**
 * 懒加载模块
 * @param importFn 动态导入函数
 * @param cacheKey 缓存键（可选）
 * @returns Promise<模块>
 */
export async function lazyLoad<T = any>(
  importFn: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  // 使用缓存键或创建唯一键
  const key = cacheKey || importFn.toString()
  
  // 检查缓存
  if (moduleCache.has(key)) {
    return moduleCache.get(key)!
  }
  
  // 加载模块
  const promise = importFn()
  moduleCache.set(key, promise)
  
  return promise
}

/**
 * 预加载模块（在空闲时加载）
 * @param importFn 动态导入函数
 * @param cacheKey 缓存键（可选）
 */
export function preload<T = any>(
  importFn: () => Promise<T>,
  cacheKey?: string
): void {
  const key = cacheKey || importFn.toString()
  
  // 避免重复预加载
  if (moduleCache.has(key) || preloadQueue.has(key)) {
    return
  }
  
  preloadQueue.add(key)
  
  // 使用 requestIdleCallback 在空闲时加载
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      lazyLoad(importFn, cacheKey).finally(() => {
        preloadQueue.delete(key)
      })
    })
  } else {
    // 降级到 setTimeout
    setTimeout(() => {
      lazyLoad(importFn, cacheKey).finally(() => {
        preloadQueue.delete(key)
      })
    }, 0)
  }
}

/**
 * 批量预加载
 * @param loaders 加载器数组
 */
export function preloadBatch(
  loaders: Array<{ importFn: () => Promise<any>; cacheKey?: string }>
): void {
  loaders.forEach(({ importFn, cacheKey }) => {
    preload(importFn, cacheKey)
  })
}

/**
 * 清除模块缓存
 * @param cacheKey 缓存键（可选，不提供则清除所有）
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    moduleCache.delete(cacheKey)
  } else {
    moduleCache.clear()
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats(): {
  size: number
  keys: string[]
} {
  return {
    size: moduleCache.size,
    keys: Array.from(moduleCache.keys())
  }
}

/**
 * 懒加载组件装饰器（用于 Vue 组件）
 * @param importFn 组件导入函数
 * @returns Vue 异步组件
 */
export function lazyComponent<T = any>(
  importFn: () => Promise<T>
): () => Promise<T> {
  return () => lazyLoad(importFn)
}

/**
 * 智能预加载 - 基于用户行为预测
 */
export class SmartPreloader {
  private patterns = new Map<string, number>()
  private threshold = 3 // 访问3次后触发预加载
  
  /**
   * 记录访问
   * @param key 访问键
   */
  record(key: string): void {
    const count = (this.patterns.get(key) || 0) + 1
    this.patterns.set(key, count)
  }
  
  /**
   * 检查是否应该预加载
   * @param key 检查键
   * @returns 是否应该预加载
   */
  shouldPreload(key: string): boolean {
    return (this.patterns.get(key) || 0) >= this.threshold
  }
  
  /**
   * 重置统计
   */
  reset(): void {
    this.patterns.clear()
  }
  
  /**
   * 获取热门项
   * @param limit 限制数量
   * @returns 热门项列表
   */
  getTopPatterns(limit = 10): Array<[string, number]> {
    return Array.from(this.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }
}

// 导出全局预加载器实例
export const smartPreloader = new SmartPreloader()

