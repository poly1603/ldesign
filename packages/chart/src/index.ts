/**
 * @ldesign/chart - 基于 ECharts 的通用图表组件库
 * 
 * 主入口文件，导出所有公共 API
 */

// ============================================================================
// 核心类和接口
// ============================================================================

export { Chart } from './core/Chart'
export { ChartFactory } from './core/ChartFactory'
export type {
  ChartConfig,
  ChartData,
  ChartSize,
  ChartType,
  ChartEventType,
  ChartInstance,
  DataPoint,
  DataSeries,
  EventHandler,
  LegendConfig,
  TooltipConfig,
  AxisConfig,
  GridConfig,
  ColorConfig,
  FontConfig,
  ThemeConfig,
} from './core/types'

// ============================================================================
// 数据适配器
// ============================================================================

export { DataAdapter } from './adapters/DataAdapter'
export { LineAdapter } from './adapters/LineAdapter'
export { BarAdapter } from './adapters/BarAdapter'
export { PieAdapter } from './adapters/PieAdapter'
export { ScatterAdapter } from './adapters/ScatterAdapter'

export type { AdaptedData } from './adapters/DataAdapter'
export type {
  LineAdapterOptions,
  TimeSeriesData,
  TimeSeriesOptions,
  MultiLineData,
  MultiLineOptions,
} from './adapters/LineAdapter'
export type {
  BarAdapterOptions,
  StackedBarData,
  StackedBarOptions,
  HorizontalBarOptions,
  GroupedBarData,
  GroupedBarOptions,
  WaterfallData,
  WaterfallOptions,
} from './adapters/BarAdapter'
export type {
  PieAdapterOptions,
  DonutOptions,
  RoseOptions,
  NestedPieData,
  NestedPieOptions,
} from './adapters/PieAdapter'
export type {
  ScatterAdapterOptions,
  Scatter2DData,
  Scatter2DOptions,
  BubbleData,
  BubbleOptions,
  CategoricalScatterData,
  CategoricalScatterOptions,
  RegressionLineOptions,
} from './adapters/ScatterAdapter'

// ============================================================================
// 配置构建器
// ============================================================================

export { ConfigBuilder } from './config/ConfigBuilder'
export {
  getDefaultConfig,
  mergeWithDefaults,
  adjustConfigForSize,
} from './config/defaults'

// ============================================================================
// 工具函数
// ============================================================================

export {
  validateContainer,
  validateConfig,
  validateData,
  validateDataPoint,
  validateDataSeries,
  validateTheme,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  generateId,
  formatNumber,
  formatPercentage,
  detectDevice,
  getComputedStyleProperty,
  isElementInViewport,
  sleep,
  safeExecute,
  isDevelopment,
  createError,
} from './utils/helpers'

export {
  validateChartConfig,
  validateChartData,
  validateSimpleData,
  validateComplexData,
  validateThemeConfig,
  validateSizeConfig,
  createValidationError,
} from './utils/validators'

export type {
  ValidationResult,
  ValidationOptions,
} from './utils/validators'

// ============================================================================
// 常量
// ============================================================================

export {
  CHART_TYPES,
  CHART_TYPE_MAPPING,
  DEFAULT_CHART_SIZE,
  DEFAULT_CHART_CONFIG,
  DEFAULT_COLOR_PALETTE,
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
  COLORFUL_THEME_COLORS,
  PRESET_THEMES,
  CHART_EVENT_TYPES,
  MOUSE_EVENT_TYPES,
  INTERACTION_EVENT_TYPES,
  RESIZE_DEBOUNCE_DELAY,
  DATA_UPDATE_DEBOUNCE_DELAY,
  MAX_DATA_POINTS,
  ANIMATION_DURATION,
  CSS_PREFIX,
  CHART_CONTAINER_CLASS,
  LOADING_CLASS,
  ERROR_CLASS,
  RESPONSIVE_CLASS,
  ERROR_MESSAGES,
  VERSION,
  SUPPORTED_ECHARTS_VERSION,
} from './core/constants'

// ============================================================================
// 便捷创建函数
// ============================================================================

export {
  createLineChart,
  createBarChart,
  createPieChart,
  createScatterChart,
  createAreaChart,
} from './core/ChartFactory'

export type {
  LineChartOptions,
  BarChartOptions,
  PieChartOptions,
  ScatterChartOptions,
  AreaChartOptions,
} from './core/ChartFactory'

// ============================================================================
// 适配器创建函数
// ============================================================================

export { createDataAdapter, adaptData } from './adapters/DataAdapter'
export { createLineAdapter } from './adapters/LineAdapter'
export { createBarAdapter } from './adapters/BarAdapter'
export { createPieAdapter } from './adapters/PieAdapter'
export { createScatterAdapter } from './adapters/ScatterAdapter'

// ============================================================================
// 配置构建函数
// ============================================================================

export { createConfigBuilder, buildConfig } from './config/ConfigBuilder'

// ============================================================================
// 默认导出
// ============================================================================

/**
 * 默认导出 Chart 类，提供最常用的功能
 */
import { Chart } from './core/Chart'
export default Chart

// ============================================================================
// 版本信息
// ============================================================================

/**
 * 库版本信息
 */
export const version = '0.1.0'

/**
 * 获取库信息
 * @returns 库信息对象
 */
export function getLibraryInfo(): {
  name: string
  version: string
  description: string
  supportedEChartsVersion: string
  supportedChartTypes: readonly ChartType[]
} {
  return {
    name: '@ldesign/chart',
    version: '0.1.0',
    description: '基于 ECharts 的通用图表组件库',
    supportedEChartsVersion: '^5.0.0',
    supportedChartTypes: ['line', 'bar', 'pie', 'scatter', 'area'] as const,
  }
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查是否为有效的图表类型
 * @param type - 待检查的类型
 * @returns 是否为有效的图表类型
 */
export function isValidChartType(type: any): type is ChartType {
  const chartTypes = ['line', 'bar', 'pie', 'scatter', 'area'] as const
  return typeof type === 'string' && chartTypes.includes(type as ChartType)
}

/**
 * 检查是否为简单数据格式
 * @param data - 待检查的数据
 * @returns 是否为简单数据格式
 */
export function isSimpleData(data: ChartData): data is DataPoint[] {
  return Array.isArray(data)
}

/**
 * 检查是否为复杂数据格式
 * @param data - 待检查的数据
 * @returns 是否为复杂数据格式
 */
export function isComplexData(data: ChartData): data is { categories?: string[]; series: DataSeries[] } {
  return !Array.isArray(data) && typeof data === 'object' && 'series' in data
}

// ============================================================================
// Vue 支持
// ============================================================================

// 注意：Vue 支持作为可选导入，避免在非 Vue 环境中引入 Vue 依赖
// 使用方式：import { LChart, useChart } from '@ldesign/chart/vue'

// ============================================================================
// 全局配置
// ============================================================================

/**
 * 全局配置接口
 */
export interface GlobalConfig {
  /** 默认主题 */
  defaultTheme?: string
  /** 默认动画持续时间 */
  defaultAnimationDuration?: number
  /** 默认防抖延迟 */
  defaultDebounceDelay?: number
  /** 是否启用开发模式 */
  development?: boolean
}

/**
 * 全局配置对象
 */
// 安全的环境检测函数
function isDevelopmentEnv(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development'
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.NODE_ENV === 'development'
  }
  return false
}

let globalConfig: GlobalConfig = {
  defaultTheme: 'light',
  defaultAnimationDuration: 300,
  defaultDebounceDelay: 300,
  development: isDevelopmentEnv(),
}

/**
 * 设置全局配置
 * @param config - 全局配置
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 获取全局配置
 * @returns 全局配置
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig }
}

/**
 * 重置全局配置为默认值
 */
export function resetGlobalConfig(): void {
  globalConfig = {
    defaultTheme: 'light',
    defaultAnimationDuration: 300,
    defaultDebounceDelay: 300,
    development: isDevelopmentEnv(),
  }
}
