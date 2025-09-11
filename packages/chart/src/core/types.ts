/**
 * 图表库核心类型定义
 * 
 * 这个文件定义了图表库的所有核心类型，包括：
 * - 图表类型枚举
 * - 数据接口
 * - 配置接口
 * - 事件接口
 * - 主题接口
 */

import type { ECharts, EChartsOption } from 'echarts'

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 支持的图表类型
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'area'

/**
 * 图表尺寸配置
 */
export interface ChartSize {
  /** 图表宽度，支持数字（像素）或字符串（百分比） */
  width?: number | string
  /** 图表高度，支持数字（像素）或字符串（百分比） */
  height?: number | string
}

/**
 * 图表位置配置
 */
export interface ChartPosition {
  /** 左边距 */
  left?: number | string
  /** 右边距 */
  right?: number | string
  /** 上边距 */
  top?: number | string
  /** 下边距 */
  bottom?: number | string
}

// ============================================================================
// 数据接口定义
// ============================================================================

/**
 * 单个数据点
 */
export interface DataPoint {
  /** 数据点名称 */
  name: string
  /** 数据值，支持单个数值或数值数组（用于散点图等） */
  value: number | number[]
  /** 数据分类（可选） */
  category?: string
  /** 额外的数据属性 */
  [key: string]: unknown
}

/**
 * 数据系列
 */
export interface DataSeries {
  /** 系列名称 */
  name: string
  /** 系列数据 */
  data: number[]
  /** 系列类型（可选，默认使用图表类型） */
  type?: ChartType
  /** 系列颜色（可选） */
  color?: string
  /** 额外的系列配置 */
  [key: string]: unknown
}

/**
 * 图表数据接口
 * 支持两种数据格式：
 * 1. 简单格式：DataPoint 数组
 * 2. 复杂格式：包含分类和多系列的对象
 */
export type ChartData = DataPoint[] | {
  /** 数据分类（X轴标签） */
  categories?: string[]
  /** 数据系列 */
  series: DataSeries[]
}

// ============================================================================
// 配置接口定义
// ============================================================================

/**
 * 图例配置
 */
export interface LegendConfig {
  /** 是否显示图例 */
  show?: boolean
  /** 图例位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 图例方向 */
  orient?: 'horizontal' | 'vertical'
  /** 图例样式 */
  textStyle?: {
    color?: string
    fontSize?: number
    fontFamily?: string
  }
}

/**
 * 提示框配置
 */
export interface TooltipConfig {
  /** 是否显示提示框 */
  show?: boolean
  /** 触发类型 */
  trigger?: 'item' | 'axis' | 'none'
  /** 自定义格式化函数 */
  formatter?: string | ((params: unknown) => string)
  /** 提示框样式 */
  textStyle?: {
    color?: string
    fontSize?: number
    fontFamily?: string
  }
}

/**
 * 坐标轴配置
 */
export interface AxisConfig {
  /** 是否显示坐标轴 */
  show?: boolean
  /** 坐标轴名称 */
  name?: string
  /** 坐标轴类型 */
  type?: 'category' | 'value' | 'time' | 'log'
  /** 坐标轴位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 坐标轴样式 */
  axisLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  /** 刻度样式 */
  axisTick?: {
    show?: boolean
    length?: number
  }
  /** 标签样式 */
  axisLabel?: {
    show?: boolean
    color?: string
    fontSize?: number
    rotate?: number
  }
}

/**
 * 网格配置
 */
export interface GridConfig {
  /** 是否显示网格 */
  show?: boolean
  /** 网格位置 */
  left?: number | string
  right?: number | string
  top?: number | string
  bottom?: number | string
  /** 是否包含坐标轴 */
  containLabel?: boolean
}

/**
 * 主图表配置接口
 */
export interface ChartConfig {
  /** 图表类型 */
  type: ChartType
  /** 图表数据 */
  data: ChartData
  /** 图表标题 */
  title?: string
  /** 图表主题 */
  theme?: string | ThemeConfig
  /** 图表尺寸 */
  size?: ChartSize
  /** 图例配置 */
  legend?: boolean | LegendConfig
  /** 提示框配置 */
  tooltip?: boolean | TooltipConfig
  /** X轴配置 */
  xAxis?: AxisConfig
  /** Y轴配置 */
  yAxis?: AxisConfig
  /** 网格配置 */
  grid?: GridConfig
  /** 是否启用响应式 */
  responsive?: boolean
  /** 是否启用动画 */
  animation?: boolean
  /** 性能配置 */
  performance?: {
    /** 是否启用性能监控 */
    enableMonitoring?: boolean
    /** 大数据量阈值 */
    largeDataThreshold?: number
    /** 是否启用数据采样 */
    enableDataSampling?: boolean
    /** 是否启用虚拟滚动 */
    enableVirtualScrolling?: boolean
    /** 是否启用渐进式渲染 */
    enableProgressiveRendering?: boolean
  }
  /** 内存管理配置 */
  memory?: {
    /** 最大缓存图表数量 */
    maxCacheSize?: number
    /** 内存警告阈值 (MB) */
    memoryWarningThreshold?: number
    /** 是否启用自动清理 */
    enableAutoCleanup?: boolean
    /** 是否启用内存监控 */
    enableMemoryMonitoring?: boolean
  }
  /** 实时数据配置 */
  realTime?: {
    /** 是否启用实时数据 */
    enabled?: boolean
    /** 更新间隔（毫秒） */
    updateInterval?: number
    /** 最大数据点数量 */
    maxDataPoints?: number
    /** 是否启用数据聚合 */
    enableAggregation?: boolean
    /** 聚合窗口大小 */
    aggregationWindow?: number
    /** 是否启用虚拟滚动 */
    enableVirtualScrolling?: boolean
    /** 缓冲区大小 */
    bufferSize?: number
  }
  /** 数据流配置 */
  dataStream?: {
    /** 批处理大小 */
    batchSize?: number
    /** 处理间隔（毫秒） */
    processInterval?: number
    /** 是否启用数据验证 */
    enableValidation?: boolean
    /** 是否启用数据转换 */
    enableTransformation?: boolean
    /** 最大队列大小 */
    maxQueueSize?: number
  }
  /** 自定义 ECharts 配置（高级用法） */
  echartsOption?: Partial<EChartsOption>
}

// ============================================================================
// 主题接口定义
// ============================================================================

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色调 */
  primary?: string
  /** 辅助色调 */
  secondary?: string
  /** 背景色 */
  background?: string
  /** 文字颜色 */
  text?: string
  /** 边框颜色 */
  border?: string
  /** 调色板 */
  palette?: string[]
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体族 */
  family?: string
  /** 字体大小 */
  size?: number
  /** 字体粗细 */
  weight?: number | string
  /** 行高 */
  lineHeight?: number
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 颜色配置 */
  colors: ColorConfig
  /** 字体配置 */
  fonts?: FontConfig
  /** 自定义 CSS 变量 */
  cssVars?: Record<string, string>
  /** 扩展配置 */
  [key: string]: unknown
}

/**
 * 主题编辑器配置接口
 */
export interface ThemeEditorConfig {
  /** 主题名称 */
  name: string
  /** 颜色配置 */
  colors: ColorConfig
  /** 字体配置 */
  fonts: FontConfig
  /** 预览数据 */
  previewData?: any
}

/**
 * 主题预览接口
 */
export interface ThemePreview {
  /** 主题名称 */
  name: string
  /** 主色调 */
  primaryColor: string
  /** 背景色 */
  backgroundColor: string
  /** 文字颜色 */
  textColor: string
  /** 调色板 */
  palette: string[]
  /** 字体族 */
  fontFamily: string
}

// ============================================================================
// 事件接口定义
// ============================================================================

/**
 * 图表事件类型
 */
export type ChartEventType =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'globalout'
  | 'contextmenu'
  | 'legendselectchanged'
  | 'datazoom'
  | 'datarangeselected'
  | 'timelinechanged'
  | 'timelineplaychanged'
  | 'restore'
  | 'dataviewchanged'
  | 'magictypechanged'
  | 'geoselectchanged'
  | 'geoselected'
  | 'geounselected'
  | 'pieselectchanged'
  | 'pieselected'
  | 'pieunselected'
  | 'mapselectchanged'
  | 'mapselected'
  | 'mapunselected'
  | 'axisareaselected'
  | 'focusnodeadjacency'
  | 'unfocusnodeadjacency'
  | 'brush'
  | 'brushselected'

/**
 * 事件处理函数
 */
export type EventHandler = (params: unknown) => void

/**
 * 事件管理器接口
 */
export interface EventManagerInterface {
  /** 注册事件监听器 */
  on(eventType: ChartEventType, handler: EventHandler): void
  /** 注销事件监听器 */
  off(eventType: ChartEventType, handler?: EventHandler): void
  /** 触发事件 */
  emit(eventType: ChartEventType, params: unknown): void
  /** 清除所有事件监听器 */
  clear(): void
}

// ============================================================================
// 图表实例接口定义
// ============================================================================

/**
 * 图表实例接口
 */
export interface ChartInstance {
  /** ECharts 实例 */
  readonly echarts: ECharts
  /** 图表配置 */
  readonly config: ChartConfig
  /** 图表容器 */
  readonly container: HTMLElement

  /** 更新图表数据 */
  updateData(data: ChartData): void
  /** 更新图表配置 */
  updateConfig(config: Partial<ChartConfig>): void
  /** 设置主题 */
  setTheme(theme: string | ThemeConfig): void
  /** 调整图表大小 */
  resize(size?: ChartSize): void
  /** 显示加载动画 */
  showLoading(text?: string): void
  /** 隐藏加载动画 */
  hideLoading(): void
  /** 清空图表 */
  clear(): void
  /** 销毁图表 */
  dispose(): void

  /** 事件管理 */
  on(eventType: ChartEventType, handler: EventHandler): void
  off(eventType: ChartEventType, handler?: EventHandler): void
}
