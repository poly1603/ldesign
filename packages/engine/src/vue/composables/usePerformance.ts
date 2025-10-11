import { computed, onMounted, onUnmounted, ref } from 'vue'
// TODO: Fix imports when these modules are available
// import {
//   type CoreWebVitalsMetrics,
//   globalCoreWebVitalsMonitor,
//   globalRealtimePerformanceMonitor,
//   type PerformanceAlert,
//   type RealtimePerformanceData
// } from '../../utils'

import { useEngine } from './useEngine'

/**
 * 性能监控组合式函数
 *
 * @returns 性能指标和控制函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePerformance } from '@ldesign/engine'
 *
 * const { metrics, startMeasure, endMeasure, fps } = usePerformance()
 *
 * function handleClick() {
 *   startMeasure('button-click')
 *   // 执行操作
 *   setTimeout(() => endMeasure('button-click'), 100)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <p>FPS: {{ fps }}</p>
 *     <p>Metrics: {{ metrics }}</p>
 *     <button @click="handleClick">Test Performance</button>
 *   </div>
 * </template>
 * ```
 */
export function usePerformance() {
  const engine = useEngine()
  const performance = engine.performance

  // 响应式性能指标
  const metrics = ref<Record<string, number>>({})
  const fps = ref(0)
  const memoryUsage = ref<{ used: number; total: number }>({ used: 0, total: 0 })

  // 更新性能指标
  const updateMetrics = () => {
    // Use fallback if getMeasures doesn't exist
    if (typeof (performance as any).getMeasures === 'function') {
      const measures = (performance as any).getMeasures()
      const newMetrics: Record<string, number> = {}

      measures.forEach((measure: any) => {
        newMetrics[measure.name] = measure.duration
      })

      metrics.value = newMetrics
    }
  }

  // FPS 监控
  let fpsCounter = 0
  let lastTime = Date.now()
  let animationId: number

  const updateFPS = () => {
    fpsCounter++
    const currentTime = Date.now()

    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round((fpsCounter * 1000) / (currentTime - lastTime))
      fpsCounter = 0
      lastTime = currentTime
    }

    animationId = requestAnimationFrame(updateFPS)
  }

  // 内存使用监控
  const updateMemoryUsage = () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory
      memoryUsage.value = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024)
      }
    }
  }

  // 定时更新内存使用情况
  let memoryInterval: ReturnType<typeof setInterval>

  onMounted(() => {
    // 开始 FPS 监控
    updateFPS()

    // 开始内存监控
    memoryInterval = setInterval(updateMemoryUsage, 1000)
    updateMemoryUsage()
  })

  onUnmounted(() => {
    // 停止 FPS 监控
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    // 停止内存监控
    if (memoryInterval) {
      clearInterval(memoryInterval)
    }
  })

  // 开始性能测量
  const startMeasure = (name: string) => {
    if (typeof (performance as any).startMeasure === 'function') {
      ; (performance as any).startMeasure(name)
    } else if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      window.performance.mark(`${name}-start`)
    }
  }

  // 结束性能测量
  const endMeasure = (name: string) => {
    if (typeof (performance as any).endMeasure === 'function') {
      ; (performance as any).endMeasure(name)
      updateMetrics()
    } else if (typeof window !== 'undefined' && window.performance && window.performance.mark && window.performance.measure) {
      window.performance.mark(`${name}-end`)
      try {
        window.performance.measure(name, `${name}-start`, `${name}-end`)
        updateMetrics()
      } catch {
        // Ignore measurement errors
      }
    }
  }

  // 获取性能报告
  const getReport = () => {
    if (typeof (performance as any).generateReport === 'function') {
      return (performance as any).generateReport()
    }
    return { metrics: metrics.value }
  }

  // 清除所有测量
  const clearMeasures = () => {
    if (typeof (performance as any).clearMeasures === 'function') {
      ; (performance as any).clearMeasures()
    }
    metrics.value = {}
  }

  return {
    metrics: computed(() => metrics.value),
    fps: computed(() => fps.value),
    memoryUsage: computed(() => memoryUsage.value),
    startMeasure,
    endMeasure,
    getReport,
    clearMeasures
  }
}

/**
 * 组件性能监控组合式函数
 *
 * @param componentName 组件名称
 * @returns 组件性能指标
 *
 * @example
 * ```vue
 * <script setup>
 * import { useComponentPerformance } from '@ldesign/engine'
 *
 * const { renderTime, updateCount } = useComponentPerformance('MyComponent')
 * </script>
 * ```
 */
export function useComponentPerformance(componentName: string) {
  const { startMeasure, endMeasure, metrics } = usePerformance()

  const renderTime = computed(() => metrics.value[`${componentName}-render`] || 0)
  const updateCount = ref(0)

  onMounted(() => {
    startMeasure(`${componentName}-mount`)
    endMeasure(`${componentName}-mount`)
  })

  onUnmounted(() => {
    startMeasure(`${componentName}-unmount`)
    endMeasure(`${componentName}-unmount`)
  })

  // 监控更新次数
  const trackUpdate = () => {
    updateCount.value++
    startMeasure(`${componentName}-update-${updateCount.value}`)

    // 在下一个 tick 结束测量
    setTimeout(() => {
      endMeasure(`${componentName}-update-${updateCount.value}`)
    }, 0)
  }

  return {
    renderTime,
    updateCount: computed(() => updateCount.value),
    trackUpdate
  }
}

/**
 * 内存管理组合式函数
 *
 * @returns 内存管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMemoryManager } from '@ldesign/engine'
 *
 * const { registerResource, cleanup, stats } = useMemoryManager()
 *
 * onMounted(() => {
 *   const resourceId = registerResource('my-resource', myResource)
 *
 *   onUnmounted(() => {
 *     cleanup(resourceId)
 *   })
 * })
 * </script>
 * ```
 */
export function useMemoryManager() {
  const engine = useEngine()
  // Use global memory manager as fallback
  const memoryManager = (globalThis as any).GlobalMemoryManager || (engine as any).memory || {
    getOverallStats: () => ({ totalResources: 0, activeTimers: 0, activeListeners: 0 }),
    registerResource: () => 'mock-id',
    cleanup: () => { },
    setTimeout: (cb: () => void, delay: number) => globalThis.setTimeout(cb, delay),
    addEventListener: () => 'mock-id'
  }

  const stats = ref(memoryManager.getOverallStats())

  // 定时更新统计信息
  let statsInterval: ReturnType<typeof setInterval>

  onMounted(() => {
    statsInterval = setInterval(() => {
      stats.value = memoryManager.getOverallStats()
    }, 1000)
  })

  onUnmounted(() => {
    if (statsInterval) {
      clearInterval(statsInterval)
    }
  })

  const registerResource = (name: string, resource: any) => {
    return memoryManager.registerResource(name, resource)
  }

  const cleanup = (resourceId?: string) => {
    if (resourceId) {
      memoryManager.cleanup(resourceId)
    } else {
      memoryManager.cleanup()
    }
    stats.value = memoryManager.getOverallStats()
  }

  const setTimeout = (callback: () => void, delay: number) => {
    return memoryManager.setTimeout(callback, delay)
  }

  const addEventListener = (
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    return memoryManager.addEventListener(target, event, listener, options)
  }

  const removeEventListener = (
    target: EventTarget,
    event: string,
    listener: EventListener
  ) => {
    if (typeof memoryManager.removeEventListener === 'function') {
      return memoryManager.removeEventListener(target, event, listener)
    } else {
      // 回退到原生方法
      target.removeEventListener(event, listener)
    }
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    if (statsInterval) {
      clearInterval(statsInterval)
    }
    // 执行内存管理器的清理
    if (typeof memoryManager.cleanup === 'function') {
      memoryManager.cleanup()
    }
  })

  return {
    stats: computed(() => stats.value),
    registerResource,
    cleanup,
    setTimeout,
    addEventListener,
    removeEventListener
  }
}

/**
 * 缓存管理组合式函数
 *
 * @returns 缓存管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCache } from '@ldesign/engine'
 *
 * const { get, set, has, remove, clear, stats } = useCache()
 *
 * const cachedData = await get('user-data', async () => {
 *   return await fetchUserData()
 * })
 * </script>
 * ```
 */
export function useCache() {
  const engine = useEngine()
  const cache = engine.cache

  const stats = ref(cache.getStats())

  // 性能优化：减少统计更新频率
  let statsInterval: ReturnType<typeof setInterval>

  onMounted(() => {
    statsInterval = setInterval(() => {
      stats.value = cache.getStats()
    }, 5000) // 从1秒改为5秒，减少性能开销
  })

  onUnmounted(() => {
    if (statsInterval) {
      clearInterval(statsInterval)
    }
  })

  const get = async <T>(key: string, factory?: () => Promise<T> | T): Promise<T | undefined> => {
    if (factory && !cache.has(key)) {
      const value = await factory()
      cache.set(key, value)
      stats.value = cache.getStats()
      return value
    }
    return cache.get(key) as T | undefined
  }

  const set = <T>(key: string, value: T, ttl?: number) => {
    cache.set(key, value, ttl)
    stats.value = cache.getStats()
  }

  const has = (key: string) => {
    return cache.has(key)
  }

  const remove = (key: string) => {
    cache.delete(key)
    stats.value = cache.getStats()
  }

  const clear = () => {
    cache.clear()
    stats.value = cache.getStats()
  }

  return {
    stats: computed(() => stats.value),
    get,
    set,
    has,
    remove,
    clear
  }
}

/**
 * Core Web Vitals 监控组合式函数
 * TODO: Fix when globalCoreWebVitalsMonitor is available
 */
// export function useCoreWebVitals() {
//   const metrics = ref<CoreWebVitalsMetrics>({})
//   const score = ref(100)
//
//   onMounted(() => {
//     // 监听Core Web Vitals指标更新
//     globalCoreWebVitalsMonitor.onMetric((newMetrics) => {
//       metrics.value = newMetrics
//       score.value = globalCoreWebVitalsMonitor.getPerformanceScore()
//     })
//
//     // 启动监控
//     globalCoreWebVitalsMonitor.start()
//   })
//
//   onUnmounted(() => {
//     globalCoreWebVitalsMonitor.stop()
//   })
//
//   const isGood = computed(() => {
//     const m = metrics.value
//     return (
//       (!m.lcp || m.lcp.rating === 'good') &&
//       (!m.fcp || m.fcp.rating === 'good') &&
//       (!m.cls || m.cls.rating === 'good') &&
//       (!m.fid || m.fid.rating === 'good')
//     )
//   })
//
//   const hasIssues = computed(() => {
//     const m = metrics.value
//     return (
//       (m.lcp && m.lcp.rating === 'poor') ||
//       (m.fcp && m.fcp.rating === 'poor') ||
//       (m.cls && m.cls.rating === 'poor') ||
//       (m.fid && m.fid.rating === 'poor')
//     )
//   })
//
//   return {
//     metrics: computed(() => metrics.value),
//     score: computed(() => score.value),
//     isGood,
//     hasIssues
//   }
// }

/**
 * 实时性能监控组合式函数
 * TODO: Fix when globalRealtimePerformanceMonitor is available
 */
// export function useRealtimePerformance() {
//   const data = ref<RealtimePerformanceData | null>(null)
//   const alerts = ref<PerformanceAlert[]>([])
//
//   onMounted(() => {
//     // 监听实时性能数据更新
//     globalRealtimePerformanceMonitor.onData((newData) => {
//       data.value = newData
//     })
//
//     // 监听性能告警
//     globalRealtimePerformanceMonitor.onAlert((_alert) => {
//       alerts.value = globalRealtimePerformanceMonitor.getActiveAlerts()
//     })
//
//     // 启动监控
//     globalRealtimePerformanceMonitor.start()
//   })
//
//   onUnmounted(() => {
//     globalRealtimePerformanceMonitor.stop()
//   })
//
//   const isHealthy = computed(() => {
//     return alerts.value.filter(alert => alert.level === 'critical').length === 0
//   })
//
//   const memoryUsage = computed(() => {
//     return data.value?.system.memory.percentage || 0
//   })
//
//   const fps = computed(() => {
//     return data.value?.system.fps || 0
//   })
//
//   const domNodes = computed(() => {
//     return data.value?.dom.nodeCount || 0
//   })
//
//   return {
//     data: computed(() => data.value),
//     alerts: computed(() => alerts.value),
//     isHealthy,
//     memoryUsage,
//     fps,
//     domNodes
//   }
// }
