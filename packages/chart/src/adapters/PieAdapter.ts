/**
 * 饼图数据适配器
 * 
 * 专门处理饼图的数据转换和配置优化
 */

import type { ChartData, DataPoint } from '../core/types'
import { DataAdapter, type AdaptedData } from './DataAdapter'

/**
 * 饼图适配器
 * 
 * 提供饼图特有的数据处理和优化：
 * - 环形图配置
 * - 玫瑰图配置
 * - 数据标签配置
 * - 扇区样式配置
 */
export class PieAdapter extends DataAdapter {
  /**
   * 适配饼图数据
   * @param data - 原始数据
   * @param options - 饼图选项
   * @returns 适配后的数据
   */
  adaptPie(
    data: ChartData,
    options: PieAdapterOptions = {}
  ): AdaptedData {
    // 饼图只支持简单数据格式
    if (!Array.isArray(data)) {
      throw new Error('饼图只支持 DataPoint 数组格式的数据')
    }

    const pieData = data.map(item => ({
      name: item.name,
      value: Array.isArray(item.value) ? item.value[0] : item.value,
      ...this._extractItemProperties(item),
    }))

    const series = [{
      name: options.seriesName || '饼图',
      type: 'pie',
      data: pieData,
      radius: options.radius || '70%',
      center: options.center || ['50%', '50%'],
      roseType: options.roseType,
      avoidLabelOverlap: options.avoidLabelOverlap ?? true,
      itemStyle: {
        borderRadius: options.borderRadius || 0,
        borderColor: options.borderColor || '#fff',
        borderWidth: options.borderWidth || 2,
        ...options.itemStyle,
      },
      label: this._buildLabelConfig(options),
      labelLine: options.showLabelLine ? {
        show: true,
        length: options.labelLineLength || 15,
        length2: options.labelLineLength2 || 10,
        ...options.labelLineStyle,
      } : { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
        ...options.emphasis,
      },
    }]

    return {
      categories: [],
      series,
      raw: data,
    }
  }

  /**
   * 创建环形图数据
   * @param data - 原始数据
   * @param options - 环形图选项
   * @returns 适配后的数据
   */
  adaptDonut(
    data: DataPoint[],
    options: DonutOptions = {}
  ): AdaptedData {
    const pieOptions: PieAdapterOptions = {
      ...options,
      radius: options.radius || ['40%', '70%'],
    }
    
    return this.adaptPie(data, pieOptions)
  }

  /**
   * 创建玫瑰图数据
   * @param data - 原始数据
   * @param options - 玫瑰图选项
   * @returns 适配后的数据
   */
  adaptRose(
    data: DataPoint[],
    options: RoseOptions = {}
  ): AdaptedData {
    const pieOptions: PieAdapterOptions = {
      ...options,
      roseType: options.roseType || 'radius',
      radius: options.radius || '70%',
    }
    
    return this.adaptPie(data, pieOptions)
  }

  /**
   * 创建嵌套饼图数据
   * @param data - 嵌套数据
   * @param options - 嵌套饼图选项
   * @returns 适配后的数据
   */
  adaptNestedPie(
    data: NestedPieData,
    options: NestedPieOptions = {}
  ): AdaptedData {
    const { inner, outer } = data
    
    const innerSeries = {
      name: options.innerName || '内层',
      type: 'pie',
      data: inner.map(item => ({
        name: item.name,
        value: Array.isArray(item.value) ? item.value[0] : item.value,
      })),
      radius: options.innerRadius || ['0%', '30%'],
      center: options.center || ['50%', '50%'],
      label: { show: false },
      labelLine: { show: false },
    }

    const outerSeries = {
      name: options.outerName || '外层',
      type: 'pie',
      data: outer.map(item => ({
        name: item.name,
        value: Array.isArray(item.value) ? item.value[0] : item.value,
      })),
      radius: options.outerRadius || ['40%', '70%'],
      center: options.center || ['50%', '50%'],
      label: {
        show: true,
        position: 'outside',
      },
    }

    return {
      categories: [],
      series: [innerSeries, outerSeries],
      raw: data,
    }
  }

  /**
   * 构建标签配置
   * @param options - 饼图选项
   * @returns 标签配置
   */
  private _buildLabelConfig(options: PieAdapterOptions): any {
    if (!options.showLabel) {
      return { show: false }
    }

    return {
      show: true,
      position: options.labelPosition || 'outside',
      formatter: options.labelFormatter || '{b}: {c} ({d}%)',
      fontSize: options.labelFontSize || 12,
      color: options.labelColor,
      ...options.labelStyle,
    }
  }

  /**
   * 提取数据项的额外属性
   * @param item - 数据项
   * @returns 额外属性对象
   */
  private _extractItemProperties(item: DataPoint): Record<string, unknown> {
    const { name, value, category, ...extraProps } = item
    return extraProps
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 饼图适配器选项
 */
export interface PieAdapterOptions {
  /** 系列名称 */
  seriesName?: string
  /** 饼图半径 */
  radius?: string | string[]
  /** 饼图中心位置 */
  center?: string[]
  /** 玫瑰图类型 */
  roseType?: 'radius' | 'area' | false
  /** 是否避免标签重叠 */
  avoidLabelOverlap?: boolean
  /** 扇区边框圆角 */
  borderRadius?: number
  /** 扇区边框颜色 */
  borderColor?: string
  /** 扇区边框宽度 */
  borderWidth?: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'outside' | 'inside' | 'center'
  /** 标签格式化 */
  labelFormatter?: string | ((params: any) => string)
  /** 标签字体大小 */
  labelFontSize?: number
  /** 标签颜色 */
  labelColor?: string
  /** 标签样式 */
  labelStyle?: Record<string, unknown>
  /** 是否显示标签线 */
  showLabelLine?: boolean
  /** 标签线第一段长度 */
  labelLineLength?: number
  /** 标签线第二段长度 */
  labelLineLength2?: number
  /** 标签线样式 */
  labelLineStyle?: Record<string, unknown>
  /** 扇区样式 */
  itemStyle?: Record<string, unknown>
  /** 高亮样式 */
  emphasis?: Record<string, unknown>
}

/**
 * 环形图选项
 */
export interface DonutOptions extends Omit<PieAdapterOptions, 'radius'> {
  /** 环形图半径 */
  radius?: string[]
}

/**
 * 玫瑰图选项
 */
export interface RoseOptions extends PieAdapterOptions {
  /** 玫瑰图类型 */
  roseType?: 'radius' | 'area'
}

/**
 * 嵌套饼图数据
 */
export interface NestedPieData {
  /** 内层数据 */
  inner: DataPoint[]
  /** 外层数据 */
  outer: DataPoint[]
}

/**
 * 嵌套饼图选项
 */
export interface NestedPieOptions {
  /** 内层名称 */
  innerName?: string
  /** 外层名称 */
  outerName?: string
  /** 内层半径 */
  innerRadius?: string[]
  /** 外层半径 */
  outerRadius?: string[]
  /** 中心位置 */
  center?: string[]
}

/**
 * 创建饼图适配器实例
 * @returns 饼图适配器实例
 */
export function createPieAdapter(): PieAdapter {
  return new PieAdapter()
}
