/**
 * 默认配置定义
 * 
 * 这个文件定义了各种图表类型的默认配置
 */

import type { ChartConfig, LegendConfig, TooltipConfig, AxisConfig, GridConfig } from '../core/types'

// ============================================================================
// 通用默认配置
// ============================================================================

/**
 * 默认图例配置
 */
export const DEFAULT_LEGEND: LegendConfig = {
  show: true,
  position: 'top',
  orient: 'horizontal',
  textStyle: {
    color: '#333',
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}

/**
 * 默认提示框配置
 */
export const DEFAULT_TOOLTIP: TooltipConfig = {
  show: true,
  trigger: 'axis',
  textStyle: {
    color: '#333',
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}

/**
 * 默认 X 轴配置
 */
export const DEFAULT_X_AXIS: AxisConfig = {
  show: true,
  type: 'category',
  axisLine: {
    show: true,
    lineStyle: {
      color: '#e0e0e0',
      width: 1,
    },
  },
  axisTick: {
    show: true,
    length: 5,
  },
  axisLabel: {
    show: true,
    color: '#666',
    fontSize: 12,
    rotate: 0,
  },
}

/**
 * 默认 Y 轴配置
 */
export const DEFAULT_Y_AXIS: AxisConfig = {
  show: true,
  type: 'value',
  axisLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: true,
    color: '#666',
    fontSize: 12,
  },
}

/**
 * 默认网格配置
 */
export const DEFAULT_GRID: GridConfig = {
  left: '10%',
  right: '10%',
  top: '15%',
  bottom: '10%',
  containLabel: true,
}

// ============================================================================
// 图表类型特定默认配置
// ============================================================================

/**
 * 折线图默认配置
 */
export const LINE_CHART_DEFAULTS: Partial<ChartConfig> = {
  legend: DEFAULT_LEGEND,
  tooltip: {
    ...DEFAULT_TOOLTIP,
    trigger: 'axis',
  },
  xAxis: DEFAULT_X_AXIS,
  yAxis: DEFAULT_Y_AXIS,
  grid: DEFAULT_GRID,
  animation: true,
  responsive: true,
}

/**
 * 柱状图默认配置
 */
export const BAR_CHART_DEFAULTS: Partial<ChartConfig> = {
  legend: DEFAULT_LEGEND,
  tooltip: {
    ...DEFAULT_TOOLTIP,
    trigger: 'axis',
  },
  xAxis: DEFAULT_X_AXIS,
  yAxis: DEFAULT_Y_AXIS,
  grid: DEFAULT_GRID,
  animation: true,
  responsive: true,
}

/**
 * 饼图默认配置
 */
export const PIE_CHART_DEFAULTS: Partial<ChartConfig> = {
  legend: {
    ...DEFAULT_LEGEND,
    position: 'right',
    orient: 'vertical',
  },
  tooltip: {
    ...DEFAULT_TOOLTIP,
    trigger: 'item',
  },
  animation: true,
  responsive: true,
}

/**
 * 散点图默认配置
 */
export const SCATTER_CHART_DEFAULTS: Partial<ChartConfig> = {
  legend: DEFAULT_LEGEND,
  tooltip: {
    ...DEFAULT_TOOLTIP,
    trigger: 'item',
  },
  xAxis: {
    ...DEFAULT_X_AXIS,
    type: 'value',
  },
  yAxis: DEFAULT_Y_AXIS,
  grid: DEFAULT_GRID,
  animation: true,
  responsive: true,
}

/**
 * 面积图默认配置
 */
export const AREA_CHART_DEFAULTS: Partial<ChartConfig> = {
  legend: DEFAULT_LEGEND,
  tooltip: {
    ...DEFAULT_TOOLTIP,
    trigger: 'axis',
  },
  xAxis: DEFAULT_X_AXIS,
  yAxis: DEFAULT_Y_AXIS,
  grid: DEFAULT_GRID,
  animation: true,
  responsive: true,
}

// ============================================================================
// 配置获取函数
// ============================================================================

/**
 * 根据图表类型获取默认配置
 * @param chartType - 图表类型
 * @returns 默认配置
 */
export function getDefaultConfig(chartType: string): Partial<ChartConfig> {
  const defaults = {
    line: LINE_CHART_DEFAULTS,
    bar: BAR_CHART_DEFAULTS,
    pie: PIE_CHART_DEFAULTS,
    scatter: SCATTER_CHART_DEFAULTS,
    area: AREA_CHART_DEFAULTS,
  }

  return defaults[chartType as keyof typeof defaults] || LINE_CHART_DEFAULTS
}

/**
 * 合并用户配置和默认配置
 * @param userConfig - 用户配置
 * @param chartType - 图表类型
 * @returns 合并后的配置
 */
export function mergeWithDefaults(userConfig: ChartConfig, chartType?: string): ChartConfig {
  const defaultConfig = getDefaultConfig(chartType || userConfig.type)

  return {
    ...defaultConfig,
    ...userConfig,
    // 深度合并对象类型的配置
    legend: typeof userConfig.legend === 'object'
      ? { ...defaultConfig.legend, ...userConfig.legend }
      : userConfig.legend,
    tooltip: typeof userConfig.tooltip === 'object'
      ? { ...defaultConfig.tooltip, ...userConfig.tooltip }
      : userConfig.tooltip,
    xAxis: userConfig.xAxis
      ? { ...defaultConfig.xAxis, ...userConfig.xAxis }
      : defaultConfig.xAxis,
    yAxis: userConfig.yAxis
      ? { ...defaultConfig.yAxis, ...userConfig.yAxis }
      : defaultConfig.yAxis,
    grid: userConfig.grid
      ? { ...defaultConfig.grid, ...userConfig.grid }
      : defaultConfig.grid,
  }
}

// ============================================================================
// 响应式配置
// ============================================================================

/**
 * 移动端默认配置调整
 */
export const MOBILE_CONFIG_ADJUSTMENTS = {
  grid: {
    left: '5%',
    right: '5%',
    top: '10%',
    bottom: '15%',
  },
  legend: {
    textStyle: {
      fontSize: 10,
    },
  },
  tooltip: {
    textStyle: {
      fontSize: 10,
    },
  },
  xAxis: {
    axisLabel: {
      fontSize: 10,
      rotate: 45,
    },
  },
  yAxis: {
    axisLabel: {
      fontSize: 10,
    },
  },
}

/**
 * 根据容器大小调整配置
 * @param config - 原始配置
 * @param containerWidth - 容器宽度
 * @param containerHeight - 容器高度
 * @returns 调整后的配置
 */
export function adjustConfigForSize(
  config: ChartConfig,
  containerWidth: number,
  containerHeight: number
): ChartConfig {
  const isMobile = containerWidth < 768

  if (!isMobile) {
    return config
  }

  // 移动端配置调整
  return {
    ...config,
    grid: config.grid
      ? { ...config.grid, ...MOBILE_CONFIG_ADJUSTMENTS.grid }
      : MOBILE_CONFIG_ADJUSTMENTS.grid,
    legend: typeof config.legend === 'object'
      ? {
        ...config.legend,
        textStyle: {
          ...config.legend.textStyle,
          ...MOBILE_CONFIG_ADJUSTMENTS.legend.textStyle
        }
      }
      : config.legend,
    tooltip: typeof config.tooltip === 'object'
      ? {
        ...config.tooltip,
        textStyle: {
          ...config.tooltip.textStyle,
          ...MOBILE_CONFIG_ADJUSTMENTS.tooltip.textStyle
        }
      }
      : config.tooltip,
    xAxis: config.xAxis
      ? {
        ...config.xAxis,
        axisLabel: {
          ...config.xAxis.axisLabel,
          ...MOBILE_CONFIG_ADJUSTMENTS.xAxis.axisLabel
        }
      }
      : MOBILE_CONFIG_ADJUSTMENTS.xAxis,
    yAxis: config.yAxis
      ? {
        ...config.yAxis,
        axisLabel: {
          ...config.yAxis.axisLabel,
          ...MOBILE_CONFIG_ADJUSTMENTS.yAxis.axisLabel
        }
      }
      : MOBILE_CONFIG_ADJUSTMENTS.yAxis,
  }
}
