/**
 * React Hooks
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { Chart } from '../../../core/chart'
import type { ChartConfig, ChartData } from '../../../types'

/**
 * 使用图表
 */
export function useChart(config: ChartConfig) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [instance, setInstance] = useState<Chart>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const init = useCallback(async (container?: HTMLElement) => {
    const el = container || chartRef.current
    if (!el) return

    try {
      setIsLoading(true)
      setError(null)

      if (instance) {
        instance.dispose()
      }

      const chart = new Chart(el, config)
      setInstance(chart)
      setIsLoading(false)
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
    }
  }, [config])

  useEffect(() => {
    if (instance && config.data) {
      instance.updateData(config.data)
    }
  }, [config.data, instance])

  useEffect(() => {
    return () => {
      instance?.dispose()
    }
  }, [instance])

  return {
    chartRef,
    instance,
    isLoading,
    error,
    init,
    updateData: useCallback((data: ChartData) => instance?.updateData(data), [instance]),
    setTheme: useCallback((theme: string) => instance?.setTheme(theme), [instance]),
    setDarkMode: useCallback((enabled: boolean) => instance?.setDarkMode(enabled), [instance]),
    resize: useCallback(() => instance?.resize(), [instance]),
    refresh: useCallback(() => instance?.refresh(), [instance]),
  }
}

/**
 * 使用图表主题
 */
export function useChartTheme(initialTheme = 'light') {
  const [theme, setTheme] = useState(initialTheme)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev)
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

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
export function useChartResize(chart?: Chart) {
  useEffect(() => {
    if (!chart) return

    const handleResize = () => chart.resize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [chart])
}

