/**
 * 性能监控 Hook
 * 
 * @description
 * 提供性能监控相关的 Vue 3 组合式函数
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { createTimer, getMemoryUsage, getPagePerformance } from '../utils/performance'

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  } | null
  pageMetrics: {
    domContentLoaded: number
    loadComplete: number
    firstPaint?: number
    firstContentfulPaint?: number
  } | null
}

/**
 * 使用性能监控
 * 
 * @returns 性能监控相关的响应式数据和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { metrics, startMeasure, endMeasure, measureRender } = usePerformance()
 *     
 *     onMounted(() => {
 *       measureRender()
 *     })
 *     
 *     const handleExpensiveOperation = async () => {
 *       startMeasure('operation')
 *       await someExpensiveOperation()
 *       endMeasure('operation')
 *     }
 *     
 *     return {
 *       metrics,
 *       handleExpensiveOperation
 *     }
 *   }
 * })
 * ```
 */
export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: null,
    pageMetrics: null
  })

  const timer = createTimer()
  const measurements = ref<Record<string, number>>({})

  /**
   * 开始测量
   * @param name - 测量名称
   */
  const startMeasure = (name: string) => {
    timer.mark(`${name}_start`)
  }

  /**
   * 结束测量
   * @param name - 测量名称
   * @returns 耗时（毫秒）
   */
  const endMeasure = (name: string): number => {
    timer.mark(`${name}_end`)
    const duration = timer.measure(`${name}_start`, `${name}_end`)
    measurements.value[name] = duration
    return duration
  }

  /**
   * 测量组件渲染时间
   */
  const measureRender = () => {
    timer.start()
    
    // 在下一个 tick 中结束测量，确保渲染完成
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        metrics.value.renderTime = timer.end()
      })
    })
  }

  /**
   * 更新内存使用情况
   */
  const updateMemoryUsage = () => {
    metrics.value.memoryUsage = getMemoryUsage()
  }

  /**
   * 更新页面性能指标
   */
  const updatePageMetrics = () => {
    metrics.value.pageMetrics = getPagePerformance()
  }

  /**
   * 获取所有测量结果
   */
  const getAllMeasurements = () => {
    return { ...measurements.value }
  }

  /**
   * 清除所有测量结果
   */
  const clearMeasurements = () => {
    measurements.value = {}
    timer.clear()
  }

  // 定期更新内存使用情况
  let memoryInterval: NodeJS.Timeout | null = null

  onMounted(() => {
    updatePageMetrics()
    updateMemoryUsage()
    
    // 每5秒更新一次内存使用情况
    memoryInterval = setInterval(updateMemoryUsage, 5000)
  })

  onUnmounted(() => {
    if (memoryInterval) {
      clearInterval(memoryInterval)
    }
    clearMeasurements()
  })

  return {
    metrics: metrics as Ref<PerformanceMetrics>,
    measurements: measurements as Ref<Record<string, number>>,
    startMeasure,
    endMeasure,
    measureRender,
    updateMemoryUsage,
    updatePageMetrics,
    getAllMeasurements,
    clearMeasurements
  }
}

/**
 * 使用渲染性能监控
 * 
 * @returns 渲染性能相关的响应式数据和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { renderTime, measureRender } = useRenderPerformance()
 *     
 *     // 自动测量初始渲染时间
 *     onMounted(measureRender)
 *     
 *     return {
 *       renderTime
 *     }
 *   }
 * })
 * ```
 */
export function useRenderPerformance() {
  const renderTime = ref(0)
  const timer = createTimer()

  const measureRender = () => {
    timer.start()
    
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        renderTime.value = timer.end()
      })
    })
  }

  return {
    renderTime,
    measureRender
  }
}

/**
 * 使用内存监控
 * 
 * @param interval - 更新间隔（毫秒，默认5000）
 * @returns 内存使用情况的响应式数据
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const memoryUsage = useMemoryMonitor(3000) // 每3秒更新一次
 *     
 *     return {
 *       memoryUsage
 *     }
 *   }
 * })
 * ```
 */
export function useMemoryMonitor(interval = 5000) {
  const memoryUsage = ref<{
    used: number
    total: number
    percentage: number
  } | null>(null)

  let memoryInterval: NodeJS.Timeout | null = null

  const updateMemoryUsage = () => {
    memoryUsage.value = getMemoryUsage()
  }

  onMounted(() => {
    updateMemoryUsage()
    memoryInterval = setInterval(updateMemoryUsage, interval)
  })

  onUnmounted(() => {
    if (memoryInterval) {
      clearInterval(memoryInterval)
    }
  })

  return memoryUsage
}
