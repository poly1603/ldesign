/**
 * 性能监控组合式 API
 */

import type { UsePerformanceReturn } from '../types'
import { computed, ref } from 'vue'

/**
 * 性能监控组合式 API
 * @returns 性能监控相关的响应式状态和方法
 */
export function usePerformance(): UsePerformanceReturn {
  const themeChangeTime = ref(0)
  const colorGenerationTime = ref(0)
  const cssInjectionTime = ref(0)
  const memoryUsage = ref(0)

  // 历史记录用于计算平均值
  const themeChangeTimes = ref<number[]>([])
  const colorGenerationTimes = ref<number[]>([])
  const cssInjectionTimes = ref<number[]>([])

  // 性能统计计算属性
  const performanceStats = computed(() => {
    const avgThemeChange = themeChangeTimes.value.length > 0
      ? themeChangeTimes.value.reduce((a, b) => a + b, 0) / themeChangeTimes.value.length
      : 0

    const avgColorGeneration = colorGenerationTimes.value.length > 0
      ? colorGenerationTimes.value.reduce((a, b) => a + b, 0) / colorGenerationTimes.value.length
      : 0

    const avgCssInjection = cssInjectionTimes.value.length > 0
      ? cssInjectionTimes.value.reduce((a, b) => a + b, 0) / cssInjectionTimes.value.length
      : 0

    return {
      averageThemeChangeTime: Math.round(avgThemeChange * 100) / 100,
      averageColorGenerationTime: Math.round(avgColorGeneration * 100) / 100,
      averageCssInjectionTime: Math.round(avgCssInjection * 100) / 100,
      totalOperations: themeChangeTimes.value.length
        + colorGenerationTimes.value.length
        + cssInjectionTimes.value.length,
    }
  })

  // 记录主题切换时间
  const recordThemeChangeTime = (time: number) => {
    themeChangeTime.value = time
    themeChangeTimes.value.push(time)
    // 保持最近100条记录
    if (themeChangeTimes.value.length > 100) {
      themeChangeTimes.value.shift()
    }
  }

  // 记录颜色生成时间
  const recordColorGenerationTime = (time: number) => {
    colorGenerationTime.value = time
    colorGenerationTimes.value.push(time)
    if (colorGenerationTimes.value.length > 100) {
      colorGenerationTimes.value.shift()
    }
  }

  // 记录CSS注入时间
  const recordCssInjectionTime = (time: number) => {
    cssInjectionTime.value = time
    cssInjectionTimes.value.push(time)
    if (cssInjectionTimes.value.length > 100) {
      cssInjectionTimes.value.shift()
    }
  }

  // 更新内存使用情况
  const updateMemoryUsage = () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as unknown as { memory: { usedJSHeapSize: number } })) {
      const memory = (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory
      memoryUsage.value = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
  }

  // 重置统计
  const resetStats = () => {
    themeChangeTime.value = 0
    colorGenerationTime.value = 0
    cssInjectionTime.value = 0
    memoryUsage.value = 0
    themeChangeTimes.value = []
    colorGenerationTimes.value = []
    cssInjectionTimes.value = []
  }

  // 定期更新内存使用情况
  if (typeof window !== 'undefined') {
    setInterval(updateMemoryUsage, 5000)
  }

  return {
    themeChangeTime,
    colorGenerationTime,
    cssInjectionTime,
    memoryUsage,
    performanceStats,
    resetStats,
    // 内部方法，供其他组合式API使用
    recordThemeChangeTime,
    recordColorGenerationTime,
    recordCssInjectionTime,
  } as UsePerformanceReturn & {
    recordThemeChangeTime: (time: number) => void
    recordColorGenerationTime: (time: number) => void
    recordCssInjectionTime: (time: number) => void
  }
}
