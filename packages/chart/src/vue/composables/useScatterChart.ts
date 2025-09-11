/**
 * useScatterChart Composable
 * 
 * 专门用于散点图的 Composable
 */

import { computed } from 'vue'
import { useChart } from './useChart'
import type { ChartData } from '../../core/types'
import type { UseScatterChartOptions, UseChartReturn } from '../types'

/**
 * 散点图 Composable
 * 
 * @param data - 图表数据（可以是响应式的）
 * @param options - 散点图选项
 * @returns 图表管理对象
 * 
 * @example
 * ```typescript
 * const data = ref([
 *   { name: '点1', value: [10, 20] },
 *   { name: '点2', value: [15, 25] },
 *   { name: '点3', value: [20, 30] }
 * ])
 * 
 * const scatterChart = useScatterChart(data, {
 *   regression: true,
 *   symbolSize: 10,
 *   config: { title: '数据分布' }
 * })
 * ```
 */
export function useScatterChart(
  data: ChartData | (() => ChartData),
  options: UseScatterChartOptions = {}
): UseChartReturn {
  // 处理数据（支持响应式数据和函数）
  const chartData = computed(() => {
    return typeof data === 'function' ? data() : data
  })

  // 构建散点图特定的配置
  const scatterConfig = computed(() => {
    const config = { ...options.config }
    
    // 添加散点图特定配置
    if (options.regression !== undefined) {
      config.regression = options.regression
    }
    
    if (options.symbolSize !== undefined) {
      config.symbolSize = options.symbolSize
    }
    
    if (options.symbol !== undefined) {
      config.symbol = options.symbol
    }

    return config
  })

  // 使用基础的 useChart
  return useChart({
    type: 'scatter',
    data: chartData.value,
    config: scatterConfig.value,
    theme: options.theme,
    autoResize: options.autoResize,
    debounceDelay: options.debounceDelay,
    immediate: options.immediate
  })
}

/**
 * 气泡图 Composable
 * 
 * @param data - 气泡数据（包含 x, y, size）
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useBubbleChart(
  data: ChartData | (() => ChartData),
  options: UseScatterChartOptions & {
    /** 最小气泡大小 */
    minBubbleSize?: number
    /** 最大气泡大小 */
    maxBubbleSize?: number
    /** 气泡透明度 */
    bubbleOpacity?: number
  } = {}
): UseChartReturn {
  const bubbleConfig = computed(() => {
    const config = { ...options.config }
    
    // 气泡大小配置
    if (options.minBubbleSize !== undefined || options.maxBubbleSize !== undefined) {
      config.symbolSize = (value: any) => {
        const size = Array.isArray(value) && value.length > 2 ? value[2] : 10
        const min = options.minBubbleSize || 5
        const max = options.maxBubbleSize || 50
        return Math.max(min, Math.min(max, size))
      }
    }
    
    // 透明度配置
    if (options.bubbleOpacity !== undefined) {
      config.itemStyle = {
        opacity: options.bubbleOpacity,
        ...config.itemStyle
      }
    }

    return config
  })

  return useScatterChart(data, {
    ...options,
    config: bubbleConfig.value
  })
}

/**
 * 回归分析散点图 Composable
 * 
 * @param data - 散点数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useRegressionChart(
  data: ChartData | (() => ChartData),
  options: UseScatterChartOptions & {
    /** 回归线类型 */
    regressionType?: 'linear' | 'polynomial' | 'exponential'
    /** 回归线颜色 */
    regressionColor?: string
    /** 显示回归方程 */
    showEquation?: boolean
    /** 显示相关系数 */
    showCorrelation?: boolean
  } = {}
): UseChartReturn {
  const regressionConfig = computed(() => {
    const config = { ...options.config }
    
    // 强制启用回归线
    config.regression = true
    
    // 回归线类型
    if (options.regressionType) {
      config.regressionType = options.regressionType
    }
    
    // 回归线颜色
    if (options.regressionColor) {
      config.regressionColor = options.regressionColor
    }
    
    // 显示回归方程和相关系数
    if (options.showEquation || options.showCorrelation) {
      config.graphic = {
        type: 'group',
        left: 'right',
        top: 'top',
        children: []
      }
      
      if (options.showEquation) {
        config.graphic.children.push({
          type: 'text',
          style: {
            text: '回归方程: y = ax + b',
            fill: '#666',
            fontSize: 12
          }
        })
      }
      
      if (options.showCorrelation) {
        config.graphic.children.push({
          type: 'text',
          top: options.showEquation ? 20 : 0,
          style: {
            text: '相关系数: r = 0.xx',
            fill: '#666',
            fontSize: 12
          }
        })
      }
    }

    return config
  })

  return useScatterChart(data, {
    ...options,
    config: regressionConfig.value
  })
}

/**
 * 分类散点图 Composable
 * 
 * @param data - 分类散点数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useCategoricalScatterChart(
  data: ChartData | (() => ChartData),
  options: UseScatterChartOptions & {
    /** 分类颜色映射 */
    categoryColors?: Record<string, string>
    /** 分类符号映射 */
    categorySymbols?: Record<string, string>
  } = {}
): UseChartReturn {
  const categoricalConfig = computed(() => {
    const config = { ...options.config }
    
    // 分类颜色配置
    if (options.categoryColors) {
      config.visualMap = {
        type: 'piecewise',
        categories: Object.keys(options.categoryColors),
        inRange: {
          color: Object.values(options.categoryColors)
        },
        ...config.visualMap
      }
    }
    
    // 分类符号配置
    if (options.categorySymbols) {
      config.symbolMap = options.categorySymbols
    }

    return config
  })

  return useScatterChart(data, {
    ...options,
    config: categoricalConfig.value
  })
}
