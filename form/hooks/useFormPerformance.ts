/**
 * 表单性能优化 Hook
 * 提供防抖、节流、渲染优化等性能优化功能
 */

import { ref, computed, watch, nextTick, shallowRef, markRaw, onUnmounted } from 'vue'
import type { Ref, ComputedRef, WatchStopHandle } from 'vue'

export interface PerformanceConfig {
  // 防抖配置
  debounce?: {
    enabled: boolean
    delay: number
    fields?: string[] // 指定字段，为空则应用到所有字段
  }
  // 节流配置
  throttle?: {
    enabled: boolean
    delay: number
    fields?: string[]
  }
  // 渲染优化
  rendering?: {
    batchUpdate: boolean // 批量更新
    lazyValidation: boolean // 懒验证
    virtualScroll: boolean // 虚拟滚动
    memoization: boolean // 记忆化
  }
  // 数据优化
  data?: {
    shallowWatch: boolean // 浅层监听
    immutable: boolean // 不可变数据
    compression: boolean // 数据压缩
  }
}

export interface PerformanceMetrics {
  renderCount: number
  validationCount: number
  updateCount: number
  averageRenderTime: number
  memoryUsage: number
  lastUpdateTime: number
}

export interface FormPerformanceReturn {
  // 性能指标
  metrics: Ref<PerformanceMetrics>
  
  // 防抖函数
  debounce: <T extends (...args: any[]) => any>(fn: T, delay?: number) => T
  
  // 节流函数
  throttle: <T extends (...args: any[]) => any>(fn: T, delay?: number) => T
  
  // 批量更新
  batchUpdate: (updates: () => void) => Promise<void>
  
  // 记忆化缓存
  memoize: <T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: any[]) => string) => T
  
  // 性能监控
  startPerformanceMonitor: () => void
  stopPerformanceMonitor: () => void
  resetMetrics: () => void
  
  // 优化建议
  getOptimizationSuggestions: () => string[]
}

/**
 * 表单性能优化 Hook
 */
export function useFormPerformance(config: Ref<PerformanceConfig>): FormPerformanceReturn {
  const metrics = ref<PerformanceMetrics>({
    renderCount: 0,
    validationCount: 0,
    updateCount: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    lastUpdateTime: 0
  })

  const debounceTimers = new Map<string, NodeJS.Timeout>()
  const throttleTimers = new Map<string, { timer: NodeJS.Timeout; lastExec: number }>()
  const memoCache = new Map<string, any>()
  const renderTimes: number[] = []
  const batchUpdateQueue: (() => void)[] = []
  let batchUpdateTimer: NodeJS.Timeout | null = null
  let performanceObserver: PerformanceObserver | null = null
  let isMonitoring = false

  // 防抖函数
  const debounce = <T extends (...args: any[]) => any>(fn: T, delay?: number): T => {
    const debounceDelay = delay ?? config.value.debounce?.delay ?? 300
    const fnKey = fn.toString()

    return ((...args: any[]) => {
      if (debounceTimers.has(fnKey)) {
        clearTimeout(debounceTimers.get(fnKey)!)
      }

      const timer = setTimeout(() => {
        fn.apply(null, args)
        debounceTimers.delete(fnKey)
      }, debounceDelay)

      debounceTimers.set(fnKey, timer)
    }) as T
  }

  // 节流函数
  const throttle = <T extends (...args: any[]) => any>(fn: T, delay?: number): T => {
    const throttleDelay = delay ?? config.value.throttle?.delay ?? 100
    const fnKey = fn.toString()

    return ((...args: any[]) => {
      const now = Date.now()
      const throttleInfo = throttleTimers.get(fnKey)

      if (!throttleInfo) {
        fn.apply(null, args)
        throttleTimers.set(fnKey, {
          timer: setTimeout(() => throttleTimers.delete(fnKey), throttleDelay),
          lastExec: now
        })
        return
      }

      if (now - throttleInfo.lastExec >= throttleDelay) {
        fn.apply(null, args)
        clearTimeout(throttleInfo.timer)
        throttleTimers.set(fnKey, {
          timer: setTimeout(() => throttleTimers.delete(fnKey), throttleDelay),
          lastExec: now
        })
      }
    }) as T
  }

  // 批量更新
  const batchUpdate = async (updates: () => void): Promise<void> => {
    if (!config.value.rendering?.batchUpdate) {
      updates()
      return
    }

    return new Promise((resolve) => {
      batchUpdateQueue.push(() => {
        updates()
        resolve()
      })

      if (batchUpdateTimer) {
        return
      }

      batchUpdateTimer = setTimeout(async () => {
        const queue = [...batchUpdateQueue]
        batchUpdateQueue.length = 0
        batchUpdateTimer = null

        // 批量执行更新
        queue.forEach(update => update())
        
        // 等待 DOM 更新
        await nextTick()
      }, 0)
    })
  }

  // 记忆化缓存
  const memoize = <T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: any[]) => string
  ): T => {
    if (!config.value.rendering?.memoization) {
      return fn
    }

    return ((...args: any[]) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      if (memoCache.has(key)) {
        return memoCache.get(key)
      }

      const result = fn.apply(null, args)
      memoCache.set(key, result)
      
      // 限制缓存大小
      if (memoCache.size > 1000) {
        const firstKey = memoCache.keys().next().value
        memoCache.delete(firstKey)
      }

      return result
    }) as T
  }

  // 性能监控
  const startPerformanceMonitor = () => {
    if (isMonitoring || typeof PerformanceObserver === 'undefined') {
      return
    }

    isMonitoring = true

    // 监控渲染性能
    performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          renderTimes.push(entry.duration)
          metrics.value.renderCount++
          
          // 计算平均渲染时间
          if (renderTimes.length > 100) {
            renderTimes.shift()
          }
          metrics.value.averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        }
      })
    })

    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })

    // 监控内存使用
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        metrics.value.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }
    }

    updateMemoryUsage()
    const memoryTimer = setInterval(updateMemoryUsage, 5000)

    // 清理函数
    onUnmounted(() => {
      clearInterval(memoryTimer)
    })
  }

  // 停止性能监控
  const stopPerformanceMonitor = () => {
    if (performanceObserver) {
      performanceObserver.disconnect()
      performanceObserver = null
    }
    isMonitoring = false
  }

  // 重置性能指标
  const resetMetrics = () => {
    metrics.value = {
      renderCount: 0,
      validationCount: 0,
      updateCount: 0,
      averageRenderTime: 0,
      memoryUsage: 0,
      lastUpdateTime: 0
    }
    renderTimes.length = 0
    memoCache.clear()
  }

  // 获取优化建议
  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = []
    const m = metrics.value

    if (m.averageRenderTime > 16) {
      suggestions.push('渲染时间过长，建议启用虚拟滚动或减少DOM节点')
    }

    if (m.renderCount > 1000) {
      suggestions.push('渲染次数过多，建议启用防抖或批量更新')
    }

    if (m.memoryUsage > 50) {
      suggestions.push('内存使用过高，建议清理缓存或使用浅层监听')
    }

    if (m.validationCount > m.updateCount * 2) {
      suggestions.push('验证次数过多，建议启用懒验证')
    }

    if (!config.value.rendering?.batchUpdate) {
      suggestions.push('建议启用批量更新以提升性能')
    }

    if (!config.value.data?.shallowWatch) {
      suggestions.push('建议启用浅层监听以减少不必要的响应式更新')
    }

    if (!config.value.rendering?.memoization) {
      suggestions.push('建议启用记忆化缓存以避免重复计算')
    }

    return suggestions
  }

  // 清理资源
  onUnmounted(() => {
    // 清理定时器
    debounceTimers.forEach(timer => clearTimeout(timer))
    throttleTimers.forEach(info => clearTimeout(info.timer))
    if (batchUpdateTimer) {
      clearTimeout(batchUpdateTimer)
    }

    // 清理缓存
    memoCache.clear()
    
    // 停止性能监控
    stopPerformanceMonitor()
  })

  return {
    metrics,
    debounce,
    throttle,
    batchUpdate,
    memoize,
    startPerformanceMonitor,
    stopPerformanceMonitor,
    resetMetrics,
    getOptimizationSuggestions
  }
}

/**
 * 渲染性能监控装饰器
 */
export function withPerformanceMonitor<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  metrics: Ref<PerformanceMetrics>
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    performance.mark(`${name}-start`)
    
    const result = fn.apply(null, args)
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // 更新指标
    metrics.value.lastUpdateTime = Date.now()
    
    if (name.includes('render')) {
      metrics.value.renderCount++
    } else if (name.includes('validate')) {
      metrics.value.validationCount++
    } else {
      metrics.value.updateCount++
    }
    
    return result
  }) as T
}

/**
 * 创建优化的响应式数据
 */
export function createOptimizedReactive<T extends Record<string, any>>(
  initialValue: T,
  config: PerformanceConfig
): Ref<T> {
  if (config.data?.shallowWatch) {
    return shallowRef(config.data?.immutable ? markRaw(initialValue) : initialValue)
  }
  
  return ref(config.data?.immutable ? markRaw(initialValue) : initialValue)
}

/**
 * 性能优化工具函数
 */
export const performanceUtils = {
  // 检测是否需要优化
  shouldOptimize: (itemCount: number, threshold = 100): boolean => {
    return itemCount > threshold
  },

  // 计算虚拟滚动参数
  calculateVirtualScrollParams: (containerHeight: number, itemHeight: number, bufferRatio = 0.5) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const bufferSize = Math.ceil(visibleCount * bufferRatio)
    return { visibleCount, bufferSize }
  },

  // 优化大数据渲染
  optimizeDataRendering: <T>(data: T[], chunkSize = 100): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    return chunks
  },

  // 内存使用监控
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  },

  // 检测性能瓶颈
  detectBottlenecks: (metrics: PerformanceMetrics): string[] => {
    const bottlenecks: string[] = []
    
    if (metrics.averageRenderTime > 16) {
      bottlenecks.push('render')
    }
    
    if (metrics.validationCount > metrics.updateCount * 3) {
      bottlenecks.push('validation')
    }
    
    if (metrics.memoryUsage > 100) {
      bottlenecks.push('memory')
    }
    
    return bottlenecks
  }
}