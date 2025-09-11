/**
 * 散点图数据适配器
 * 
 * 专门处理散点图的数据转换和配置优化
 */

import type { ChartData, DataPoint } from '../core/types'
import { DataAdapter, type AdaptedData } from './DataAdapter'

/**
 * 散点图适配器
 * 
 * 提供散点图特有的数据处理和优化：
 * - 二维散点图
 * - 气泡图
 * - 分类散点图
 * - 回归线
 */
export class ScatterAdapter extends DataAdapter {
  /**
   * 适配散点图数据
   * @param data - 原始数据
   * @param options - 散点图选项
   * @returns 适配后的数据
   */
  adaptScatter(
    data: ChartData,
    options: ScatterAdapterOptions = {}
  ): AdaptedData {
    const adaptedData = this.adapt(data, 'scatter')
    
    // 应用散点图特有的配置
    adaptedData.series = adaptedData.series.map(series => ({
      ...series,
      type: 'scatter',
      symbolSize: options.symbolSize || 10,
      symbol: options.symbol || 'circle',
      itemStyle: {
        opacity: options.opacity || 0.8,
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
   * 创建二维散点图数据
   * @param data - 二维数据
   * @param options - 二维散点图选项
   * @returns 适配后的数据
   */
  adaptScatter2D(
    data: Scatter2DData[],
    options: Scatter2DOptions = {}
  ): AdaptedData {
    const scatterData = data.map(item => [item.x, item.y])
    
    const series = [{
      name: options.seriesName || '散点图',
      type: 'scatter',
      data: scatterData,
      symbolSize: options.symbolSize || 10,
      symbol: options.symbol || 'circle',
      itemStyle: {
        opacity: options.opacity || 0.8,
      },
    }]
    
    return {
      categories: [],
      series,
      raw: data,
    }
  }

  /**
   * 创建气泡图数据
   * @param data - 气泡数据
   * @param options - 气泡图选项
   * @returns 适配后的数据
   */
  adaptBubble(
    data: BubbleData[],
    options: BubbleOptions = {}
  ): AdaptedData {
    const bubbleData = data.map(item => [item.x, item.y, item.size])
    
    const series = [{
      name: options.seriesName || '气泡图',
      type: 'scatter',
      data: bubbleData,
      symbolSize: (data: number[]) => {
        const size = data[2]
        const minSize = options.minSymbolSize || 10
        const maxSize = options.maxSymbolSize || 50
        const minValue = Math.min(...bubbleData.map(d => d[2]))
        const maxValue = Math.max(...bubbleData.map(d => d[2]))
        
        if (maxValue === minValue) return minSize
        
        const ratio = (size - minValue) / (maxValue - minValue)
        return minSize + ratio * (maxSize - minSize)
      },
      symbol: options.symbol || 'circle',
      itemStyle: {
        opacity: options.opacity || 0.6,
      },
      label: options.showLabel ? {
        show: true,
        formatter: (params: any) => {
          const [x, y, size] = params.data
          return options.labelFormatter 
            ? options.labelFormatter({ x, y, size })
            : `(${x}, ${y}, ${size})`
        },
      } : undefined,
    }]
    
    return {
      categories: [],
      series,
      raw: data,
    }
  }

  /**
   * 创建分类散点图数据
   * @param data - 分类散点数据
   * @param options - 分类散点图选项
   * @returns 适配后的数据
   */
  adaptCategoricalScatter(
    data: CategoricalScatterData,
    options: CategoricalScatterOptions = {}
  ): AdaptedData {
    const { categories } = data
    const series = Object.entries(data.series).map(([category, points]) => ({
      name: category,
      type: 'scatter',
      data: points.map(point => [point.x, point.y]),
      symbolSize: options.symbolSize || 10,
      symbol: options.symbol || 'circle',
    }))
    
    return {
      categories: categories || [],
      series,
      raw: data,
    }
  }

  /**
   * 添加回归线
   * @param adaptedData - 已适配的散点图数据
   * @param options - 回归线选项
   * @returns 包含回归线的适配数据
   */
  addRegressionLine(
    adaptedData: AdaptedData,
    options: RegressionLineOptions = {}
  ): AdaptedData {
    const scatterSeries = adaptedData.series[0]
    if (!scatterSeries || scatterSeries.type !== 'scatter') {
      throw new Error('只能为散点图添加回归线')
    }
    
    const data = scatterSeries.data as number[][]
    const regression = this._calculateLinearRegression(data)
    
    const minX = Math.min(...data.map(d => d[0]))
    const maxX = Math.max(...data.map(d => d[0]))
    
    const regressionLine = [
      [minX, regression.slope * minX + regression.intercept],
      [maxX, regression.slope * maxX + regression.intercept],
    ]
    
    const regressionSeries = {
      name: options.name || '回归线',
      type: 'line',
      data: regressionLine,
      lineStyle: {
        color: options.color || '#ff0000',
        width: options.width || 2,
        type: options.lineType || 'solid',
      },
      symbol: 'none',
      silent: true,
    }
    
    return {
      ...adaptedData,
      series: [...adaptedData.series, regressionSeries],
    }
  }

  /**
   * 计算线性回归
   * @param data - 二维数据点
   * @returns 回归参数
   */
  private _calculateLinearRegression(data: number[][]): { slope: number; intercept: number; r2: number } {
    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point[0], 0)
    const sumY = data.reduce((sum, point) => sum + point[1], 0)
    const sumXY = data.reduce((sum, point) => sum + point[0] * point[1], 0)
    const sumXX = data.reduce((sum, point) => sum + point[0] * point[0], 0)
    const sumYY = data.reduce((sum, point) => sum + point[1] * point[1], 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // 计算 R²
    const meanY = sumY / n
    const ssRes = data.reduce((sum, point) => {
      const predicted = slope * point[0] + intercept
      return sum + Math.pow(point[1] - predicted, 2)
    }, 0)
    const ssTot = data.reduce((sum, point) => sum + Math.pow(point[1] - meanY, 2), 0)
    const r2 = 1 - (ssRes / ssTot)
    
    return { slope, intercept, r2 }
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 散点图适配器选项
 */
export interface ScatterAdapterOptions {
  /** 符号大小 */
  symbolSize?: number | ((value: any) => number)
  /** 符号类型 */
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow'
  /** 透明度 */
  opacity?: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right' | 'inside'
  /** 标签格式化 */
  labelFormatter?: string | ((params: any) => string)
  /** 标签样式 */
  labelStyle?: Record<string, unknown>
  /** 数据点样式 */
  itemStyle?: Record<string, unknown>
  /** 高亮样式 */
  emphasis?: Record<string, unknown>
}

/**
 * 二维散点数据
 */
export interface Scatter2DData {
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 额外数据 */
  [key: string]: unknown
}

/**
 * 二维散点图选项
 */
export interface Scatter2DOptions {
  /** 系列名称 */
  seriesName?: string
  /** 符号大小 */
  symbolSize?: number
  /** 符号类型 */
  symbol?: string
  /** 透明度 */
  opacity?: number
}

/**
 * 气泡数据
 */
export interface BubbleData {
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 气泡大小 */
  size: number
  /** 额外数据 */
  [key: string]: unknown
}

/**
 * 气泡图选项
 */
export interface BubbleOptions {
  /** 系列名称 */
  seriesName?: string
  /** 最小符号大小 */
  minSymbolSize?: number
  /** 最大符号大小 */
  maxSymbolSize?: number
  /** 符号类型 */
  symbol?: string
  /** 透明度 */
  opacity?: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签格式化 */
  labelFormatter?: (data: { x: number; y: number; size: number }) => string
}

/**
 * 分类散点数据
 */
export interface CategoricalScatterData {
  /** 分类列表 */
  categories?: string[]
  /** 按分类组织的散点数据 */
  series: Record<string, Scatter2DData[]>
}

/**
 * 分类散点图选项
 */
export interface CategoricalScatterOptions {
  /** 符号大小 */
  symbolSize?: number
  /** 符号类型 */
  symbol?: string
}

/**
 * 回归线选项
 */
export interface RegressionLineOptions {
  /** 回归线名称 */
  name?: string
  /** 线条颜色 */
  color?: string
  /** 线条宽度 */
  width?: number
  /** 线条类型 */
  lineType?: 'solid' | 'dashed' | 'dotted'
}

/**
 * 创建散点图适配器实例
 * @returns 散点图适配器实例
 */
export function createScatterAdapter(): ScatterAdapter {
  return new ScatterAdapter()
}
