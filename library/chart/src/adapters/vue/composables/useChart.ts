/**
 * Vue 组合式函数
 */

import { ref, watch, onUnmounted, unref, type MaybeRef } from 'vue'
import { Chart } from '../../../core/chart'
import type { ChartConfig, ChartData } from '../../../types'

/**
 * 使用图表
 */
export function useChart(config: MaybeRef<ChartConfig>) {
  const chartRef = ref<HTMLDivElement>()
  const instance = ref<Chart>()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const init = async (container?: HTMLElement) => {
    const el = container || chartRef.value
    if (!el) return

    try {
      isLoading.value = true
      error.value = null

      if (instance.value) {
        instance.value.dispose()
      }

      instance.value = new Chart(el, unref(config))
      isLoading.value = false
    } catch (err) {
      error.value = err as Error
      isLoading.value = false
    }
  }

  watch(() => unref(config).data, (newData) => {
    instance.value?.updateData(newData)
  }, { deep: true })

  onUnmounted(() => {
    instance.value?.dispose()
  })

  return {
    chartRef,
    instance,
    isLoading,
    error,
    init,
    updateData: (data: ChartData) => instance.value?.updateData(data),
    setTheme: (theme: string) => instance.value?.setTheme(theme),
    setDarkMode: (enabled: boolean) => instance.value?.setDarkMode(enabled),
    resize: () => instance.value?.resize(),
    refresh: () => instance.value?.refresh(),
  }
}

/**
 * 使用图表主题
 */
export function useChartTheme(initialTheme = 'light') {
  const theme = ref(initialTheme)
  const darkMode = ref(false)

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    theme.value = darkMode.value ? 'dark' : 'light'
  }

  const setTheme = (newTheme: string) => {
    theme.value = newTheme
  }

  return {
    theme,
    darkMode,
    toggleDarkMode,
    setTheme,
  }
}

/**
 * 使用图表响应式
 */
export function useChartResize(chart: MaybeRef<Chart | undefined>) {
  const resize = () => {
    const instance = unref(chart)
    instance?.resize()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', resize)
    onUnmounted(() => {
      window.removeEventListener('resize', resize)
    })
  }

  return { resize }
}

