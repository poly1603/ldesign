/**
 * 折线图数据适配器
 * 
 * 专门处理折线图的数据转换和配置优化
 */

import type { ChartData, DataPoint, DataSeries } from '../core/types'
import { DataAdapter, type AdaptedData } from './DataAdapter'

/**
 * 折线图适配器
 * 
 * 提供折线图特有的数据处理和优化：
 * - 平滑曲线配置
 * - 数据点标记
 * - 线条样式
 * - 面积填充（可选）
 */
export class LineAdapter extends DataAdapter {
  /**
   * 适配折线图数据
   * @param data - 原始数据
   * @param options - 折线图选项
   * @returns 适配后的数据
   */
  adaptLine(
    data: ChartData,
    options: LineAdapterOptions = {}
  ): AdaptedData {
    const adaptedData = this.adapt(data, 'line')
    
    // 应用折线图特有的配置
    adaptedData.series = adaptedData.series.map(series => ({
      ...series,
      type: 'line',
      smooth: options.smooth ?? false,
      symbol: options.showSymbol ? (options.symbol || 'circle') : 'none',
      symbolSize: options.symbolSize || 6,
      lineStyle: {
        width: options.lineWidth || 2,
        type: options.lineType || 'solid',
        ...options.lineStyle,
      },
      itemStyle: {
        borderWidth: options.symbolBorderWidth || 2,
        ...options.itemStyle,
      },
      emphasis: {
        focus: 'series',
        ...options.emphasis,
      },
      ...(options.areaStyle && {
        areaStyle: {
          opacity: 0.3,
          ...options.areaStyle,
        },
      }),
    }))
    
    return adaptedData
  }

  /**
   * 创建时间序列折线图数据
   * @param timeData - 时间数据数组
   * @param options - 时间序列选项
   * @returns 适配后的数据
   */
  adaptTimeSeries(
    timeData: TimeSeriesData[],
    options: TimeSeriesOptions = {}
  ): AdaptedData {
    const categories = timeData.map(item => this._formatTime(item.time, options.timeFormat))
    const values = timeData.map(item => item.value)
    
    const series = [{
      name: options.seriesName || '时间序列',
      type: 'line',
      data: values,
      smooth: options.smooth ?? true,
      symbol: options.showSymbol ? 'circle' : 'none',
      symbolSize: 4,
      lineStyle: {
        width: 2,
      },
    }]
    
    return {
      categories,
      series,
      raw: timeData,
    }
  }

  /**
   * 创建多条折线图数据
   * @param data - 多系列数据
   * @param options - 多系列选项
   * @returns 适配后的数据
   */
  adaptMultiLine(
    data: MultiLineData,
    options: MultiLineOptions = {}
  ): AdaptedData {
    const { categories, series: seriesData } = data
    
    const series = seriesData.map((seriesItem, index) => ({
      name: seriesItem.name,
      type: 'line',
      data: seriesItem.data,
      smooth: options.smooth ?? false,
      symbol: options.showSymbol ? 'circle' : 'none',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        type: options.lineTypes?.[index] || 'solid',
      },
      connectNulls: options.connectNulls ?? true,
    }))
    
    return {
      categories: categories || [],
      series,
      raw: data,
    }
  }

  /**
   * 格式化时间
   * @param time - 时间值
   * @param format - 格式化选项
   * @returns 格式化后的时间字符串
   */
  private _formatTime(time: string | number | Date, format?: string): string {
    const date = new Date(time)
    
    if (format) {
      // 简单的时间格式化
      return format
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', date.getDate().toString().padStart(2, '0'))
        .replace('HH', date.getHours().toString().padStart(2, '0'))
        .replace('mm', date.getMinutes().toString().padStart(2, '0'))
        .replace('ss', date.getSeconds().toString().padStart(2, '0'))
    }
    
    return date.toLocaleDateString()
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 折线图适配器选项
 */
export interface LineAdapterOptions {
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示数据点标记 */
  showSymbol?: boolean
  /** 数据点标记类型 */
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none'
  /** 数据点标记大小 */
  symbolSize?: number
  /** 数据点边框宽度 */
  symbolBorderWidth?: number
  /** 线条宽度 */
  lineWidth?: number
  /** 线条类型 */
  lineType?: 'solid' | 'dashed' | 'dotted'
  /** 线条样式 */
  lineStyle?: Record<string, unknown>
  /** 数据点样式 */
  itemStyle?: Record<string, unknown>
  /** 高亮样式 */
  emphasis?: Record<string, unknown>
  /** 面积样式（用于面积图） */
  areaStyle?: Record<string, unknown>
}

/**
 * 时间序列数据
 */
export interface TimeSeriesData {
  /** 时间 */
  time: string | number | Date
  /** 数值 */
  value: number
}

/**
 * 时间序列选项
 */
export interface TimeSeriesOptions {
  /** 系列名称 */
  seriesName?: string
  /** 时间格式 */
  timeFormat?: string
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示数据点标记 */
  showSymbol?: boolean
}

/**
 * 多条折线图数据
 */
export interface MultiLineData {
  /** 分类数据 */
  categories?: string[]
  /** 系列数据 */
  series: Array<{
    name: string
    data: number[]
  }>
}

/**
 * 多条折线图选项
 */
export interface MultiLineOptions {
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示数据点标记 */
  showSymbol?: boolean
  /** 线条类型数组 */
  lineTypes?: Array<'solid' | 'dashed' | 'dotted'>
  /** 是否连接空数据 */
  connectNulls?: boolean
}

/**
 * 创建折线图适配器实例
 * @returns 折线图适配器实例
 */
export function createLineAdapter(): LineAdapter {
  return new LineAdapter()
}
