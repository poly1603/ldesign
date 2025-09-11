/**
 * usePieChart Composable
 * 
 * 专门用于饼图的 Composable
 */

import { computed } from 'vue'
import { useChart } from './useChart'
import type { ChartData } from '../../core/types'
import type { UsePieChartOptions, UseChartReturn } from '../types'

/**
 * 饼图 Composable
 * 
 * @param data - 图表数据（可以是响应式的）
 * @param options - 饼图选项
 * @returns 图表管理对象
 * 
 * @example
 * ```typescript
 * const data = ref([
 *   { name: '直接访问', value: 335 },
 *   { name: '邮件营销', value: 310 },
 *   { name: '联盟广告', value: 234 }
 * ])
 * 
 * const pieChart = usePieChart(data, {
 *   donut: true,
 *   innerRadius: '40%',
 *   config: { title: '访问来源' }
 * })
 * ```
 */
export function usePieChart(
  data: ChartData | (() => ChartData),
  options: UsePieChartOptions = {}
): UseChartReturn {
  // 处理数据（支持响应式数据和函数）
  const chartData = computed(() => {
    return typeof data === 'function' ? data() : data
  })

  // 构建饼图特定的配置
  const pieConfig = computed(() => {
    const config = { ...options.config }
    
    // 添加饼图特定配置
    if (options.donut !== undefined) {
      config.donut = options.donut
    }
    
    if (options.innerRadius !== undefined) {
      config.innerRadius = options.innerRadius
    }
    
    if (options.outerRadius !== undefined) {
      config.outerRadius = options.outerRadius
    }
    
    if (options.roseType !== undefined) {
      config.roseType = options.roseType
    }

    return config
  })

  // 使用基础的 useChart
  return useChart({
    type: 'pie',
    data: chartData.value,
    config: pieConfig.value,
    theme: options.theme,
    autoResize: options.autoResize,
    debounceDelay: options.debounceDelay,
    immediate: options.immediate
  })
}

/**
 * 环形图 Composable
 * 
 * @param data - 图表数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useDonutChart(
  data: ChartData | (() => ChartData),
  options: UsePieChartOptions & {
    /** 中心文本 */
    centerText?: string
    /** 中心文本样式 */
    centerTextStyle?: any
  } = {}
): UseChartReturn {
  const donutConfig = computed(() => {
    const config = { ...options.config }
    
    // 强制启用环形图
    config.donut = true
    
    // 设置默认内半径
    if (!options.innerRadius) {
      config.innerRadius = '50%'
    }
    
    // 中心文本配置
    if (options.centerText) {
      config.graphic = {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: options.centerText,
          textAlign: 'center',
          fill: '#333',
          fontSize: 16,
          ...options.centerTextStyle
        }
      }
    }

    return config
  })

  return usePieChart(data, {
    ...options,
    config: donutConfig.value
  })
}

/**
 * 玫瑰图 Composable
 * 
 * @param data - 图表数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useRoseChart(
  data: ChartData | (() => ChartData),
  options: UsePieChartOptions & {
    /** 玫瑰图类型 */
    roseType?: 'radius' | 'area'
  } = {}
): UseChartReturn {
  const roseConfig = computed(() => {
    const config = { ...options.config }
    
    // 启用玫瑰图
    config.roseType = options.roseType || 'radius'
    
    // 调整标签位置
    config.label = {
      show: true,
      position: 'outside',
      ...config.label
    }

    return config
  })

  return usePieChart(data, {
    ...options,
    config: roseConfig.value
  })
}

/**
 * 嵌套饼图 Composable
 * 
 * @param innerData - 内层数据
 * @param outerData - 外层数据
 * @param options - 配置选项
 * @returns 图表管理对象
 */
export function useNestedPieChart(
  innerData: ChartData | (() => ChartData),
  outerData: ChartData | (() => ChartData),
  options: UsePieChartOptions = {}
): UseChartReturn {
  // 合并内外层数据
  const nestedData = computed(() => {
    const inner = typeof innerData === 'function' ? innerData() : innerData
    const outer = typeof outerData === 'function' ? outerData() : outerData
    
    return {
      series: [
        {
          name: '内层',
          data: inner,
          radius: ['0%', '30%']
        },
        {
          name: '外层',
          data: outer,
          radius: ['40%', '70%']
        }
      ]
    }
  })

  const nestedConfig = computed(() => {
    const config = { ...options.config }
    
    // 配置图例
    config.legend = {
      show: true,
      orient: 'vertical',
      left: 'left',
      ...config.legend
    }

    return config
  })

  return useChart({
    type: 'pie',
    data: nestedData.value,
    config: nestedConfig.value,
    theme: options.theme,
    autoResize: options.autoResize,
    debounceDelay: options.debounceDelay,
    immediate: options.immediate
  })
}
