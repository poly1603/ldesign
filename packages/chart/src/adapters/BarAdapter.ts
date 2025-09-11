/**
 * 柱状图数据适配器
 * 
 * 专门处理柱状图的数据转换和配置优化
 */

import type { ChartData } from '../core/types'
import { DataAdapter, type AdaptedData } from './DataAdapter'

/**
 * 柱状图适配器
 * 
 * 提供柱状图特有的数据处理和优化：
 * - 柱子宽度配置
 * - 堆叠柱状图
 * - 水平柱状图
 * - 分组柱状图
 */
export class BarAdapter extends DataAdapter {
  /**
   * 适配柱状图数据
   * @param data - 原始数据
   * @param options - 柱状图选项
   * @returns 适配后的数据
   */
  adaptBar(
    data: ChartData,
    options: BarAdapterOptions = {}
  ): AdaptedData {
    const adaptedData = this.adapt(data, 'bar')

    // 应用柱状图特有的配置
    adaptedData.series = adaptedData.series.map((series, index) => ({
      ...series,
      type: 'bar',
      barWidth: options.barWidth,
      barMaxWidth: options.barMaxWidth,
      barMinWidth: options.barMinWidth,
      barGap: options.barGap,
      barCategoryGap: options.barCategoryGap,
      stack: options.stack ? (options.stackName || 'total') : undefined,
      itemStyle: {
        borderRadius: options.borderRadius || 0,
        borderWidth: options.borderWidth || 0,
        borderColor: options.borderColor,
        ...options.itemStyle,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
        ...options.emphasis,
      },
      label: options.showLabel ? {
        show: true,
        position: options.labelPosition || 'top',
        formatter: options.labelFormatter,
        ...options.labelStyle,
      } : undefined,
    }))

    return adaptedData
  }

  /**
   * 适配堆叠柱状图（简化版本）
   * @param data - 原始数据
   * @param options - 堆叠选项
   * @returns 适配后的数据
   */
  adaptStacked(
    data: ChartData,
    options: StackedBarOptions = {}
  ): AdaptedData {
    const adaptedData = this.adapt(data, 'bar')

    // 为所有系列设置相同的堆叠名称
    const stackName = options.stackName || 'total'
    adaptedData.series = adaptedData.series.map(series => ({
      ...series,
      type: 'bar',
      stack: stackName,
      emphasis: {
        focus: 'series',
      },
    }))

    return adaptedData
  }

  /**
   * 创建堆叠柱状图数据
   * @param data - 堆叠数据
   * @param options - 堆叠选项
   * @returns 适配后的数据
   */
  adaptStackedBar(
    data: StackedBarData,
    options: StackedBarOptions = {}
  ): AdaptedData {
    const { categories, series: seriesData } = data

    const series = seriesData.map(seriesItem => ({
      name: seriesItem.name,
      type: 'bar',
      data: seriesItem.data,
      stack: options.stackName || 'total',
      barWidth: options.barWidth,
      itemStyle: {
        borderRadius: seriesItem === seriesData[seriesData.length - 1]
          ? [4, 4, 0, 0] // 最后一个系列顶部圆角
          : 0,
      },
      emphasis: {
        focus: 'series',
      },
    }))

    return {
      categories: categories || [],
      series,
      raw: data,
    }
  }

  /**
   * 创建水平柱状图数据
   * @param data - 原始数据
   * @param options - 水平柱状图选项
   * @returns 适配后的数据
   */
  adaptHorizontalBar(
    data: ChartData,
    options: HorizontalBarOptions = {}
  ): AdaptedData {
    const adaptedData = this.adapt(data, 'bar')

    // 水平柱状图需要交换 x 轴和 y 轴的数据
    adaptedData.series = adaptedData.series.map(series => ({
      ...series,
      type: 'bar',
      barHeight: options.barHeight,
      itemStyle: {
        borderRadius: [0, 4, 4, 0], // 右侧圆角
        ...options.itemStyle,
      },
      label: options.showLabel ? {
        show: true,
        position: 'right',
        ...options.labelStyle,
      } : undefined,
    }))

    // 标记为水平柱状图，供配置构建器使用
    adaptedData.isHorizontal = true

    return adaptedData
  }

  /**
   * 创建分组柱状图数据
   * @param data - 分组数据
   * @param options - 分组选项
   * @returns 适配后的数据
   */
  adaptGroupedBar(
    data: GroupedBarData,
    options: GroupedBarOptions = {}
  ): AdaptedData {
    const { categories, groups } = data

    const series = groups.map(group => ({
      name: group.name,
      type: 'bar',
      data: group.data,
      barGap: options.barGap || '20%',
      barCategoryGap: options.barCategoryGap || '40%',
      itemStyle: {
        borderRadius: options.borderRadius || 2,
      },
    }))

    return {
      categories: categories || [],
      series,
      raw: data,
    }
  }

  /**
   * 创建瀑布图数据
   * @param data - 瀑布图数据
   * @param options - 瀑布图选项
   * @returns 适配后的数据
   */
  adaptWaterfallBar(
    data: WaterfallData[],
    options: WaterfallOptions = {}
  ): AdaptedData {
    const categories = data.map(item => item.name)
    let cumulative = 0

    const seriesData = data.map((item, index) => {
      if (item.type === 'total') {
        cumulative = item.value
        return item.value
      } else {
        const value = item.value
        const result = [cumulative, cumulative + value]
        cumulative += value
        return result
      }
    })

    const series = [{
      name: options.seriesName || '瀑布图',
      type: 'bar',
      data: seriesData,
      itemStyle: {
        borderRadius: 2,
        color: (params: any) => {
          const value = data[params.dataIndex].value
          if (data[params.dataIndex].type === 'total') {
            return options.totalColor || '#5470c6'
          }
          return value >= 0
            ? (options.positiveColor || '#91cc75')
            : (options.negativeColor || '#ee6666')
        },
      },
    }]

    return {
      categories,
      series,
      raw: data,
    }
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 柱状图适配器选项
 */
export interface BarAdapterOptions {
  /** 柱子宽度 */
  barWidth?: number | string
  /** 柱子最大宽度 */
  barMaxWidth?: number | string
  /** 柱子最小宽度 */
  barMinWidth?: number | string
  /** 柱子间距 */
  barGap?: number | string
  /** 分类间距 */
  barCategoryGap?: number | string
  /** 是否堆叠 */
  stack?: boolean
  /** 堆叠名称 */
  stackName?: string
  /** 边框圆角 */
  borderRadius?: number | number[]
  /** 边框宽度 */
  borderWidth?: number
  /** 边框颜色 */
  borderColor?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'top' | 'bottom' | 'inside' | 'insideTop' | 'insideBottom'
  /** 标签格式化函数 */
  labelFormatter?: string | ((params: any) => string)
  /** 标签样式 */
  labelStyle?: Record<string, unknown>
  /** 柱子样式 */
  itemStyle?: Record<string, unknown>
  /** 高亮样式 */
  emphasis?: Record<string, unknown>
}

/**
 * 堆叠柱状图数据
 */
export interface StackedBarData {
  /** 分类数据 */
  categories?: string[]
  /** 系列数据 */
  series: Array<{
    name: string
    data: number[]
  }>
}

/**
 * 堆叠柱状图选项
 */
export interface StackedBarOptions {
  /** 堆叠名称 */
  stackName?: string
  /** 柱子宽度 */
  barWidth?: number | string
}

/**
 * 水平柱状图选项
 */
export interface HorizontalBarOptions {
  /** 柱子高度 */
  barHeight?: number | string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签样式 */
  labelStyle?: Record<string, unknown>
  /** 柱子样式 */
  itemStyle?: Record<string, unknown>
}

/**
 * 分组柱状图数据
 */
export interface GroupedBarData {
  /** 分类数据 */
  categories?: string[]
  /** 分组数据 */
  groups: Array<{
    name: string
    data: number[]
  }>
}

/**
 * 分组柱状图选项
 */
export interface GroupedBarOptions {
  /** 柱子间距 */
  barGap?: string
  /** 分类间距 */
  barCategoryGap?: string
  /** 边框圆角 */
  borderRadius?: number
}

/**
 * 瀑布图数据项
 */
export interface WaterfallData {
  /** 名称 */
  name: string
  /** 数值 */
  value: number
  /** 类型 */
  type?: 'positive' | 'negative' | 'total'
}

/**
 * 瀑布图选项
 */
export interface WaterfallOptions {
  /** 系列名称 */
  seriesName?: string
  /** 正值颜色 */
  positiveColor?: string
  /** 负值颜色 */
  negativeColor?: string
  /** 总计颜色 */
  totalColor?: string
}

/**
 * 扩展适配后的数据，添加水平柱状图标记
 */
declare module './DataAdapter' {
  interface AdaptedData {
    /** 是否为水平柱状图 */
    isHorizontal?: boolean
  }
}

/**
 * 创建柱状图适配器实例
 * @returns 柱状图适配器实例
 */
export function createBarAdapter(): BarAdapter {
  return new BarAdapter()
}
