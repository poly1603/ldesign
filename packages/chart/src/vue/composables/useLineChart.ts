/**
 * useLineChart Composable
 * 
 * 专门用于折线图的 Composable
 */

import { computed } from 'vue'
import { useChart } from './useChart'
import type { ChartData } from '../../core/types'
import type { UseLineChartOptions, UseChartReturn } from '../types'

/**
 * 折线图 Composable
 * 
 * @param data - 图表数据（可以是响应式的）
 * @param options - 折线图选项
 * @returns 图表管理对象
 * 
 * @example
 * ```typescript
 * const data = ref([
 *   { name: '1月', value: 100 },
 *   { name: '2月', value: 200 }
 * ])
 * 
 * const lineChart = useLineChart(data, {
 *   smooth: true,
 *   area: true,
 *   config: { title: '销售趋势' }
 * })
 * ```
 */
export function useLineChart(
  data: ChartData | (() => ChartData),
  options: UseLineChartOptions = {}
): UseChartReturn {
  // 处理数据（支持响应式数据和函数）
  const chartData = computed(() => {
    return typeof data === 'function' ? data() : data
  })

  // 构建折线图特定的配置
  const lineConfig = computed(() => {
    const config = { ...options.config }
    
    // 添加折线图特定配置
    if (options.smooth !== undefined) {
      config.smooth = options.smooth
    }
    
    if (options.area !== undefined) {
      config.area = options.area
    }
    
    if (options.stack !== undefined) {
      config.stack = options.stack
    }
    
    if (options.showSymbol !== undefined) {
      config.showSymbol = options.showSymbol
    }

    return config
  })

  // 使用基础的 useChart
  return useChart({
    type: 'line',
    data: chartData.value,
    config: lineConfig.value,
    theme: options.theme,
    autoResize: options.autoResize,
    debounceDelay: options.debounceDelay,
    immediate: options.immediate
  })
}

/**
 * 时间序列折线图 Composable
 * 
 * @param data - 时间序列数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useTimeSeriesChart(
  data: ChartData | (() => ChartData),
  options: UseLineChartOptions & {
    /** 时间轴格式 */
    timeFormat?: string
    /** 是否显示时间范围选择器 */
    dataZoom?: boolean
  } = {}
): UseChartReturn {
  const timeSeriesConfig = computed(() => {
    const config = { ...options.config }
    
    // 时间轴配置
    config.xAxis = {
      ...config.xAxis,
      type: 'time'
    }
    
    // 时间格式配置
    if (options.timeFormat) {
      config.xAxis.axisLabel = {
        ...config.xAxis.axisLabel,
        formatter: options.timeFormat
      }
    }
    
    // 数据缩放配置
    if (options.dataZoom) {
      config.dataZoom = [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ]
    }

    return config
  })

  return useLineChart(data, {
    ...options,
    config: timeSeriesConfig.value
  })
}

/**
 * 多系列折线图 Composable
 * 
 * @param data - 多系列数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useMultiLineChart(
  data: ChartData | (() => ChartData),
  options: UseLineChartOptions & {
    /** 系列颜色配置 */
    colors?: string[]
    /** 是否显示图例 */
    legend?: boolean
  } = {}
): UseChartReturn {
  const multiLineConfig = computed(() => {
    const config = { ...options.config }
    
    // 颜色配置
    if (options.colors) {
      config.color = options.colors
    }
    
    // 图例配置
    if (options.legend !== false) {
      config.legend = {
        show: true,
        ...config.legend
      }
    }

    return config
  })

  return useLineChart(data, {
    ...options,
    config: multiLineConfig.value
  })
}
