/**
 * 图表工厂类
 * 
 * 负责创建不同类型的图表实例，提供统一的创建接口
 */

import type { ChartConfig, ChartType, ChartData } from './types'
import { Chart } from './Chart'
import { LineAdapter } from '../adapters/LineAdapter'
import { BarAdapter } from '../adapters/BarAdapter'
import { PieAdapter } from '../adapters/PieAdapter'
import { ScatterAdapter } from '../adapters/ScatterAdapter'
import { HeatmapChart } from '../charts/HeatmapChart'
import { RadarChart } from '../charts/RadarChart'
import { FunnelChart } from '../charts/FunnelChart'
import { GaugeChart } from '../charts/GaugeChart'
import { CHART_TYPES, ERROR_MESSAGES } from './constants'

/**
 * 图表工厂类
 * 
 * 提供便捷的图表创建方法，支持各种图表类型的快速创建
 */
export class ChartFactory {
  /**
   * 创建图表实例
   * @param container - 容器元素
   * @param config - 图表配置
   * @returns 图表实例
   */
  static create(container: HTMLElement | string, config: ChartConfig): Chart {
    this._validateChartType(config.type)
    return new Chart(container, config)
  }

  /**
   * 创建折线图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 折线图选项
   * @returns 图表实例
   */
  static createLineChart(
    container: HTMLElement | string,
    data: ChartData,
    options: LineChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'line',
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      legend: options.legend ?? true,
      tooltip: options.tooltip ?? true,
      size: options.size,
    }

    return new Chart(container, config)
  }

  /**
   * 创建柱状图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 柱状图选项
   * @returns 图表实例
   */
  static createBarChart(
    container: HTMLElement | string,
    data: ChartData,
    options: BarChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'bar',
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      legend: options.legend ?? true,
      tooltip: options.tooltip ?? true,
      size: options.size,
    }

    return new Chart(container, config)
  }

  /**
   * 创建饼图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 饼图选项
   * @returns 图表实例
   */
  static createPieChart(
    container: HTMLElement | string,
    data: ChartData,
    options: PieChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'pie',
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      legend: options.legend ?? true,
      tooltip: options.tooltip ?? true,
      size: options.size,
    }

    return new Chart(container, config)
  }

  /**
   * 创建散点图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 散点图选项
   * @returns 图表实例
   */
  static createScatterChart(
    container: HTMLElement | string,
    data: ChartData,
    options: ScatterChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'scatter',
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      legend: options.legend ?? true,
      tooltip: options.tooltip ?? true,
      size: options.size,
    }

    return new Chart(container, config)
  }

  /**
   * 创建面积图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 面积图选项
   * @returns 图表实例
   */
  static createAreaChart(
    container: HTMLElement | string,
    data: ChartData,
    options: AreaChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'area',
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      legend: options.legend ?? true,
      tooltip: options.tooltip ?? true,
      size: options.size,
    }

    return new Chart(container, config)
  }

  /**
   * 创建热力图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 热力图选项
   * @returns 图表实例
   */
  static createHeatmapChart(
    container: HTMLElement | string,
    data: ChartData,
    options: HeatmapChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'heatmap' as ChartType,
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      ...options
    }
    return new Chart(container, config)
  }

  /**
   * 创建雷达图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 雷达图选项
   * @returns 图表实例
   */
  static createRadarChart(
    container: HTMLElement | string,
    data: ChartData,
    options: RadarChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'radar' as ChartType,
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      ...options
    }
    return new Chart(container, config)
  }

  /**
   * 创建漏斗图
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 漏斗图选项
   * @returns 图表实例
   */
  static createFunnelChart(
    container: HTMLElement | string,
    data: ChartData,
    options: FunnelChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'funnel' as ChartType,
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      ...options
    }
    return new Chart(container, config)
  }

  /**
   * 创建仪表盘
   * @param container - 容器元素
   * @param data - 图表数据
   * @param options - 仪表盘选项
   * @returns 图表实例
   */
  static createGaugeChart(
    container: HTMLElement | string,
    data: ChartData,
    options: GaugeChartOptions = {}
  ): Chart {
    const config: ChartConfig = {
      type: 'gauge' as ChartType,
      data,
      title: options.title,
      theme: options.theme || 'light',
      responsive: options.responsive ?? true,
      animation: options.animation ?? true,
      ...options
    }
    return new Chart(container, config)
  }

  /**
   * 获取支持的图表类型列表
   * @returns 图表类型数组
   */
  static getSupportedChartTypes(): readonly ChartType[] {
    return CHART_TYPES
  }

  /**
   * 检查是否支持指定的图表类型
   * @param chartType - 图表类型
   * @returns 是否支持
   */
  static isChartTypeSupported(chartType: string): chartType is ChartType {
    return CHART_TYPES.includes(chartType as ChartType)
  }

  /**
   * 获取图表类型的适配器
   * @param chartType - 图表类型
   * @returns 适配器实例
   */
  static getAdapter(chartType: ChartType): any {
    const adapters = {
      line: () => new LineAdapter(),
      bar: () => new BarAdapter(),
      pie: () => new PieAdapter(),
      scatter: () => new ScatterAdapter(),
      area: () => new LineAdapter(), // 面积图使用折线图适配器
      heatmap: () => new HeatmapChart(),
      radar: () => new RadarChart(),
      funnel: () => new FunnelChart(),
      gauge: () => new GaugeChart(),
    }

    const adapterFactory = adapters[chartType]
    if (!adapterFactory) {
      throw new Error(`${ERROR_MESSAGES.UNSUPPORTED_CHART_TYPE}: ${chartType}`)
    }

    return adapterFactory()
  }

  /**
   * 验证图表类型
   * @param chartType - 图表类型
   */
  private static _validateChartType(chartType: string): asserts chartType is ChartType {
    if (!this.isChartTypeSupported(chartType)) {
      throw new Error(`${ERROR_MESSAGES.UNSUPPORTED_CHART_TYPE}: ${chartType}`)
    }
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 基础图表选项
 */
interface BaseChartOptions {
  /** 图表标题 */
  title?: string
  /** 图表主题 */
  theme?: string
  /** 图表尺寸 */
  size?: { width?: number | string; height?: number | string }
  /** 是否启用响应式 */
  responsive?: boolean
  /** 是否启用动画 */
  animation?: boolean
  /** 图例配置 */
  legend?: boolean | any
  /** 提示框配置 */
  tooltip?: boolean | any
}

/**
 * 折线图选项
 */
export interface LineChartOptions extends BaseChartOptions {
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示数据点 */
  showSymbol?: boolean
  /** 是否填充面积 */
  areaStyle?: any
}

/**
 * 柱状图选项
 */
export interface BarChartOptions extends BaseChartOptions {
  /** 柱子宽度 */
  barWidth?: number | string
  /** 是否堆叠 */
  stack?: boolean
  /** 是否水平显示 */
  horizontal?: boolean
}

/**
 * 饼图选项
 */
export interface PieChartOptions extends BaseChartOptions {
  /** 饼图半径 */
  radius?: string | string[]
  /** 是否为环形图 */
  donut?: boolean
  /** 是否为玫瑰图 */
  roseType?: 'radius' | 'area' | false
}

/**
 * 散点图选项
 */
export interface ScatterChartOptions extends BaseChartOptions {
  /** 符号大小 */
  symbolSize?: number
  /** 符号类型 */
  symbol?: string
  /** 是否显示回归线 */
  showRegressionLine?: boolean
}

/**
 * 面积图选项
 */
export interface AreaChartOptions extends BaseChartOptions {
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 面积透明度 */
  areaOpacity?: number
  /** 是否堆叠 */
  stack?: boolean
}

// ============================================================================
// 便捷创建函数
// ============================================================================

/**
 * 创建折线图的便捷函数
 * @param container - 容器元素
 * @param data - 图表数据
 * @param options - 选项
 * @returns 图表实例
 */
export function createLineChart(
  container: HTMLElement | string,
  data: ChartData,
  options?: LineChartOptions
): Chart {
  return ChartFactory.createLineChart(container, data, options)
}

/**
 * 创建柱状图的便捷函数
 * @param container - 容器元素
 * @param data - 图表数据
 * @param options - 选项
 * @returns 图表实例
 */
export function createBarChart(
  container: HTMLElement | string,
  data: ChartData,
  options?: BarChartOptions
): Chart {
  return ChartFactory.createBarChart(container, data, options)
}

/**
 * 创建饼图的便捷函数
 * @param container - 容器元素
 * @param data - 图表数据
 * @param options - 选项
 * @returns 图表实例
 */
export function createPieChart(
  container: HTMLElement | string,
  data: ChartData,
  options?: PieChartOptions
): Chart {
  return ChartFactory.createPieChart(container, data, options)
}

/**
 * 创建散点图的便捷函数
 * @param container - 容器元素
 * @param data - 图表数据
 * @param options - 选项
 * @returns 图表实例
 */
export function createScatterChart(
  container: HTMLElement | string,
  data: ChartData,
  options?: ScatterChartOptions
): Chart {
  return ChartFactory.createScatterChart(container, data, options)
}

/**
 * 创建面积图的便捷函数
 * @param container - 容器元素
 * @param data - 图表数据
 * @param options - 选项
 * @returns 图表实例
 */
export function createAreaChart(
  container: HTMLElement | string,
  data: ChartData,
  options?: AreaChartOptions
): Chart {
  return ChartFactory.createAreaChart(container, data, options)
}

/**
 * 热力图选项
 */
export interface HeatmapChartOptions extends BaseChartOptions {
  /** 颜色映射 */
  colorMap?: {
    min?: string
    max?: string
    colors?: string[]
  }
  /** 是否显示数值标签 */
  showLabel?: boolean
}

/**
 * 雷达图选项
 */
export interface RadarChartOptions extends BaseChartOptions {
  /** 指标配置 */
  indicators?: Array<{
    name: string
    max?: number
    min?: number
  }>
  /** 雷达图形状 */
  shape?: 'polygon' | 'circle'
}

/**
 * 漏斗图选项
 */
export interface FunnelChartOptions extends BaseChartOptions {
  /** 漏斗图排序 */
  sort?: 'ascending' | 'descending' | 'none'
  /** 是否显示标签 */
  showLabel?: boolean
}

/**
 * 仪表盘选项
 */
export interface GaugeChartOptions extends BaseChartOptions {
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 仪表盘半径 */
  radius?: string | number
}
