/**
 * React Chart 组件
 */

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Chart as ChartCore } from '../../../core/chart'
import type { ChartConfig, ChartData } from '../../../types'

export interface ChartProps {
  type: string
  data: ChartData
  title?: string
  theme?: string
  darkMode?: boolean
  fontSize?: number
  width?: number | string
  height?: number | string
  lazy?: boolean
  virtual?: boolean
  worker?: boolean
  cache?: boolean
  responsive?: boolean
  echarts?: any
  className?: string
  style?: React.CSSProperties
  onReady?: (chart: ChartCore) => void
  onError?: (error: Error) => void
  onDataUpdate?: (data: any) => void
}

export interface ChartRef {
  chart: ChartCore | undefined
  refresh: () => void
  resize: () => void
  getDataURL: () => string
  getInstance: () => any
}

export const Chart = forwardRef<ChartRef, ChartProps>((props, ref) => {
  const {
    type,
    data,
    title,
    theme,
    darkMode,
    fontSize,
    width,
    height,
    lazy,
    virtual,
    worker,
    cache,
    responsive,
    echarts,
    className,
    style,
    onReady,
    onError,
    onDataUpdate,
  } = props

  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<ChartCore>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 初始化图表
  useEffect(() => {
    const initChart = async () => {
      if (!chartRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        if (instanceRef.current) {
          instanceRef.current.dispose()
        }

        const config: ChartConfig = {
          type: type as any,
          data,
          title,
          theme,
          darkMode,
          fontSize,
          lazy,
          virtual,
          worker,
          cache,
          responsive,
          echarts,
        }

        instanceRef.current = new ChartCore(chartRef.current, config)

        setIsLoading(false)
        onReady?.(instanceRef.current)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
        onError?.(err as Error)
      }
    }

    initChart()

    return () => {
      instanceRef.current?.dispose()
    }
  }, [type, theme, echarts]) // 这些变化需要重新初始化

  // 更新数据
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.updateData(data)
      onDataUpdate?.(data)
    }
  }, [data])

  // 主题变化
  useEffect(() => {
    if (theme) instanceRef.current?.setTheme(theme)
  }, [theme])

  // 暗黑模式
  useEffect(() => {
    if (darkMode !== undefined) {
      instanceRef.current?.setDarkMode(darkMode)
    }
  }, [darkMode])

  // 字体大小
  useEffect(() => {
    if (fontSize) instanceRef.current?.setFontSize(fontSize)
  }, [fontSize])

  // 暴露方法
  useImperativeHandle(ref, () => ({
    chart: instanceRef.current,
    refresh: () => instanceRef.current?.refresh(),
    resize: () => instanceRef.current?.resize(),
    getDataURL: () => instanceRef.current?.getDataURL() || '',
    getInstance: () => instanceRef.current?.getInstance(),
  }))

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height || '400px',
    position: 'relative',
    ...style,
  }

  return (
    <div
      ref={chartRef}
      className={`ldesign-chart ${className || ''} ${isLoading ? 'is-loading' : ''}`}
      style={containerStyle}
    >
      {isLoading && <div className="chart-loading">加载中...</div>}
      {error && <div className="chart-error">{error.message}</div>}
    </div>
  )
})

Chart.displayName = 'Chart'

export default Chart

