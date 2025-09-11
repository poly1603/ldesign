/**
 * useBarChart Composable
 * 
 * 专门用于柱状图的 Composable
 */

import { computed } from 'vue'
import { useChart } from './useChart'
import type { ChartData } from '../../core/types'
import type { UseBarChartOptions, UseChartReturn } from '../types'

/**
 * 柱状图 Composable
 * 
 * @param data - 图表数据（可以是响应式的）
 * @param options - 柱状图选项
 * @returns 图表管理对象
 * 
 * @example
 * ```typescript
 * const data = ref([
 *   { name: '产品A', value: 100 },
 *   { name: '产品B', value: 200 }
 * ])
 * 
 * const barChart = useBarChart(data, {
 *   stack: true,
 *   horizontal: false,
 *   config: { title: '产品销量' }
 * })
 * ```
 */
export function useBarChart(
  data: ChartData | (() => ChartData),
  options: UseBarChartOptions = {}
): UseChartReturn {
  // 处理数据（支持响应式数据和函数）
  const chartData = computed(() => {
    return typeof data === 'function' ? data() : data
  })

  // 构建柱状图特定的配置
  const barConfig = computed(() => {
    const config = { ...options.config }
    
    // 添加柱状图特定配置
    if (options.stack !== undefined) {
      config.stack = options.stack
    }
    
    if (options.horizontal !== undefined) {
      config.horizontal = options.horizontal
    }
    
    if (options.barWidth !== undefined) {
      config.barWidth = options.barWidth
    }
    
    if (options.barGap !== undefined) {
      config.barGap = options.barGap
    }

    return config
  })

  // 使用基础的 useChart
  return useChart({
    type: 'bar',
    data: chartData.value,
    config: barConfig.value,
    theme: options.theme,
    autoResize: options.autoResize,
    debounceDelay: options.debounceDelay,
    immediate: options.immediate
  })
}

/**
 * 堆叠柱状图 Composable
 * 
 * @param data - 堆叠数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useStackedBarChart(
  data: ChartData | (() => ChartData),
  options: UseBarChartOptions & {
    /** 堆叠组名称 */
    stackName?: string
    /** 是否显示总计 */
    showTotal?: boolean
  } = {}
): UseChartReturn {
  const stackedConfig = computed(() => {
    const config = { ...options.config }
    
    // 强制启用堆叠
    config.stack = true
    
    // 堆叠组名称
    if (options.stackName) {
      config.stackName = options.stackName
    }
    
    // 显示总计
    if (options.showTotal) {
      config.label = {
        show: true,
        position: 'top',
        ...config.label
      }
    }

    return config
  })

  return useBarChart(data, {
    ...options,
    config: stackedConfig.value
  })
}

/**
 * 水平柱状图 Composable
 * 
 * @param data - 图表数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useHorizontalBarChart(
  data: ChartData | (() => ChartData),
  options: UseBarChartOptions = {}
): UseChartReturn {
  const horizontalConfig = computed(() => {
    const config = { ...options.config }
    
    // 强制启用水平显示
    config.horizontal = true
    
    // 调整轴配置
    config.xAxis = {
      type: 'value',
      ...config.xAxis
    }
    
    config.yAxis = {
      type: 'category',
      ...config.yAxis
    }

    return config
  })

  return useBarChart(data, {
    ...options,
    config: horizontalConfig.value
  })
}

/**
 * 分组柱状图 Composable
 * 
 * @param data - 分组数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useGroupedBarChart(
  data: ChartData | (() => ChartData),
  options: UseBarChartOptions & {
    /** 分组间距 */
    categoryGap?: string | number
    /** 柱子间距 */
    barCategoryGap?: string | number
  } = {}
): UseChartReturn {
  const groupedConfig = computed(() => {
    const config = { ...options.config }
    
    // 禁用堆叠
    config.stack = false
    
    // 分组间距配置
    if (options.categoryGap !== undefined) {
      config.categoryGap = options.categoryGap
    }
    
    if (options.barCategoryGap !== undefined) {
      config.barCategoryGap = options.barCategoryGap
    }

    return config
  })

  return useBarChart(data, {
    ...options,
    config: groupedConfig.value
  })
}
