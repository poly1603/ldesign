/**
 * 配置构建器
 * 
 * 负责将简化的图表配置转换为完整的 ECharts 配置
 */

import type { EChartsOption } from 'echarts'
import type { ChartConfig, LegendConfig, TooltipConfig, AxisConfig, GridConfig } from '../core/types'
import type { AdaptedData } from '../adapters/DataAdapter'
import {
  DEFAULT_LEGEND_CONFIG,
  DEFAULT_TOOLTIP_CONFIG,
  DEFAULT_AXIS_CONFIG,
  DEFAULT_GRID_CONFIG,
  ANIMATION_DURATION,
} from '../core/constants'

/**
 * 配置构建器类
 * 
 * 使用示例：
 * ```typescript
 * const builder = new ConfigBuilder()
 * const option = builder.build(config, adaptedData)
 * ```
 */
export class ConfigBuilder {
  /**
   * 构建 ECharts 配置
   * @param config - 图表配置
   * @param data - 适配后的数据
   * @returns ECharts 配置对象
   */
  build(config: ChartConfig, data: AdaptedData): EChartsOption {
    const option: EChartsOption = {}

    // 构建标题
    if (config.title) {
      option.title = this._buildTitle(config.title)
    }

    // 构建图例
    if (config.legend) {
      option.legend = this._buildLegend(config.legend)
    }

    // 构建提示框
    if (config.tooltip) {
      option.tooltip = this._buildTooltip(config.tooltip)
    }

    // 构建坐标轴（非饼图）
    if (config.type !== 'pie') {
      const { xAxis, yAxis } = this._buildAxes(config, data)
      option.xAxis = xAxis
      option.yAxis = yAxis
    }

    // 构建网格
    if (config.grid && config.type !== 'pie') {
      option.grid = this._buildGrid(config.grid)
    }

    // 构建系列
    option.series = data.series

    // 构建动画
    if (config.animation !== false) {
      option.animation = true
      option.animationDuration = ANIMATION_DURATION
    }

    // 构建颜色
    if (data.series.length > 1) {
      option.color = this._getColorPalette()
    }

    // 合并自定义 ECharts 配置
    if (config.echartsOption) {
      this._mergeDeep(option, config.echartsOption)
    }

    return option
  }

  /**
   * 构建标题配置
   * @param title - 标题文本
   * @returns 标题配置
   */
  private _buildTitle(title: string): any {
    return {
      text: title,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    }
  }

  /**
   * 构建图例配置
   * @param legend - 图例配置
   * @returns 图例配置
   */
  private _buildLegend(legend: boolean | LegendConfig): any {
    if (legend === false) {
      return { show: false }
    }

    const legendConfig = legend === true ? {} : legend
    const config = { ...DEFAULT_LEGEND_CONFIG, ...legendConfig }

    return {
      show: config.show,
      type: 'scroll',
      orient: config.orient,
      left: this._getLegendPosition(config.position, config.orient).left,
      top: this._getLegendPosition(config.position, config.orient).top,
      textStyle: config.textStyle,
    }
  }

  /**
   * 获取图例位置
   * @param position - 位置
   * @param orient - 方向
   * @returns 位置配置
   */
  private _getLegendPosition(
    position: string = 'top',
    orient: string = 'horizontal'
  ): { left: string; top: string } {
    const positions = {
      top: { left: 'center', top: '0%' },
      bottom: { left: 'center', top: '95%' },
      left: { left: '0%', top: 'middle' },
      right: { left: '95%', top: 'middle' },
    }

    return positions[position as keyof typeof positions] || positions.top
  }

  /**
   * 构建提示框配置
   * @param tooltip - 提示框配置
   * @returns 提示框配置
   */
  private _buildTooltip(tooltip: boolean | TooltipConfig): any {
    if (tooltip === false) {
      return { show: false }
    }

    const tooltipConfig = tooltip === true ? {} : tooltip
    const config = { ...DEFAULT_TOOLTIP_CONFIG, ...tooltipConfig }

    return {
      show: config.show,
      trigger: config.trigger,
      formatter: config.formatter,
      textStyle: config.textStyle,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      padding: [8, 12],
    }
  }

  /**
   * 构建坐标轴配置
   * @param config - 图表配置
   * @param data - 适配后的数据
   * @returns 坐标轴配置
   */
  private _buildAxes(config: ChartConfig, data: AdaptedData): { xAxis: any; yAxis: any } {
    const isHorizontal = (data as any).isHorizontal

    if (isHorizontal) {
      // 水平柱状图：交换 x 轴和 y 轴
      return {
        xAxis: this._buildValueAxis(config.xAxis),
        yAxis: this._buildCategoryAxis(config.yAxis, data.categories),
      }
    } else {
      // 普通图表
      return {
        xAxis: this._buildCategoryAxis(config.xAxis, data.categories),
        yAxis: this._buildValueAxis(config.yAxis),
      }
    }
  }

  /**
   * 构建分类轴配置
   * @param axisConfig - 轴配置
   * @param categories - 分类数据
   * @returns 分类轴配置
   */
  private _buildCategoryAxis(axisConfig: AxisConfig = {}, categories: string[]): any {
    const config = { ...DEFAULT_AXIS_CONFIG, ...axisConfig }

    return {
      type: 'category',
      data: categories,
      name: config.name,
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: config.axisLine,
      axisTick: config.axisTick,
      axisLabel: {
        ...config.axisLabel,
        interval: 0,
        rotate: categories.length > 6 ? 45 : 0,
      },
      splitLine: {
        show: false,
      },
    }
  }

  /**
   * 构建数值轴配置
   * @param axisConfig - 轴配置
   * @returns 数值轴配置
   */
  private _buildValueAxis(axisConfig: AxisConfig = {}): any {
    const config = { ...DEFAULT_AXIS_CONFIG, ...axisConfig }

    return {
      type: 'value',
      name: config.name,
      nameLocation: 'middle',
      nameGap: 50,
      axisLine: config.axisLine,
      axisTick: config.axisTick,
      axisLabel: config.axisLabel,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'solid',
        },
      },
    }
  }

  /**
   * 构建网格配置
   * @param grid - 网格配置
   * @returns 网格配置
   */
  private _buildGrid(grid: GridConfig): any {
    const config = { ...DEFAULT_GRID_CONFIG, ...grid }

    return {
      left: config.left,
      right: config.right,
      top: config.top,
      bottom: config.bottom,
      containLabel: config.containLabel,
    }
  }

  /**
   * 获取默认调色板
   * @returns 颜色数组
   */
  private _getColorPalette(): string[] {
    return [
      '#722ED1', '#1890FF', '#52C41A', '#FAAD14', '#F5222D',
      '#FA8C16', '#13C2C2', '#EB2F96', '#722ED1', '#FADB14',
    ]
  }

  /**
   * 深度合并对象
   * @param target - 目标对象
   * @param source - 源对象
   */
  private _mergeDeep(target: any, source: any): void {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        this._mergeDeep(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
}

/**
 * 创建配置构建器实例
 * @returns 配置构建器实例
 */
export function createConfigBuilder(): ConfigBuilder {
  return new ConfigBuilder()
}

/**
 * 快速构建配置的工具函数
 * @param config - 图表配置
 * @param data - 适配后的数据
 * @returns ECharts 配置对象
 */
export function buildConfig(config: ChartConfig, data: AdaptedData): EChartsOption {
  const builder = new ConfigBuilder()
  return builder.build(config, data)
}
