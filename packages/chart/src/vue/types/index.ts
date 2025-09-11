/**
 * Vue 支持的类型定义
 * 
 * 这个文件定义了 Vue 组件和 Composables 的所有类型
 */

import type { Ref, ComputedRef } from 'vue'
import type {
  ChartConfig,
  ChartData,
  ChartType,
  ChartEventType,
  EventHandler,
  ThemeConfig,
  ChartInstance as BaseChartInstance
} from '../../core/types'

// ============================================================================
// Vue 组件相关类型
// ============================================================================

/**
 * Vue 图表组件的 Props 类型
 */
export interface ChartProps {
  /** 图表类型 */
  type: ChartType
  /** 图表数据 */
  data: ChartData
  /** 图表配置 */
  config?: Partial<ChartConfig>
  /** 主题配置 */
  theme?: string | ThemeConfig
  /** 图表宽度 */
  width?: number | string
  /** 图表高度 */
  height?: number | string
  /** 是否显示加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string | Error | null
  /** 是否自动调整大小 */
  autoResize?: boolean
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
}

/**
 * Vue 图表组件的事件类型
 */
export interface ChartEmits {
  /** 图表点击事件 */
  click: [params: any]
  /** 图表双击事件 */
  dblclick: [params: any]
  /** 鼠标悬停事件 */
  mouseover: [params: any]
  /** 鼠标移出事件 */
  mouseout: [params: any]
  /** 图例选择变化事件 */
  legendselectchanged: [params: any]
  /** 数据缩放事件 */
  datazoom: [params: any]
  /** 刷选事件 */
  brush: [params: any]
  /** 图表初始化完成事件 */
  ready: [instance: BaseChartInstance]
  /** 图表更新事件 */
  updated: [instance: BaseChartInstance]
  /** 错误事件 */
  error: [error: Error]
}

/**
 * 特定图表组件的 Props 类型
 */
export interface LineChartProps extends Omit<ChartProps, 'type'> {
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示面积 */
  area?: boolean
  /** 是否堆叠 */
  stack?: boolean
  /** 是否显示数据点 */
  showSymbol?: boolean
}

export interface BarChartProps extends Omit<ChartProps, 'type'> {
  /** 是否堆叠 */
  stack?: boolean
  /** 是否水平显示 */
  horizontal?: boolean
  /** 柱子宽度 */
  barWidth?: number | string
  /** 柱子间距 */
  barGap?: number | string
}

export interface PieChartProps extends Omit<ChartProps, 'type'> {
  /** 是否显示为环形图 */
  donut?: boolean
  /** 内半径（环形图） */
  innerRadius?: number | string
  /** 外半径 */
  outerRadius?: number | string
  /** 是否显示玫瑰图 */
  roseType?: boolean | 'radius' | 'area'
}

export interface ScatterChartProps extends Omit<ChartProps, 'type'> {
  /** 是否显示回归线 */
  regression?: boolean
  /** 点的大小 */
  symbolSize?: number | number[] | ((value: any) => number)
  /** 点的形状 */
  symbol?: string
}

// ============================================================================
// Composables 相关类型
// ============================================================================

/**
 * useChart Composable 的选项类型
 */
export interface UseChartOptions {
  /** 图表类型 */
  type: ChartType
  /** 初始数据 */
  data?: ChartData
  /** 图表配置 */
  config?: Partial<ChartConfig>
  /** 主题配置 */
  theme?: string | ThemeConfig
  /** 是否自动调整大小 */
  autoResize?: boolean
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  /** 是否立即初始化 */
  immediate?: boolean
}

/**
 * useChart Composable 的返回类型
 */
export interface UseChartReturn {
  /** 图表容器引用 */
  chartRef: Ref<HTMLElement | null>
  /** 图表实例 */
  chartInstance: Ref<BaseChartInstance | null>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | Error | null>
  /** 图表是否已准备就绪 */
  ready: ComputedRef<boolean>
  /** 更新数据 */
  updateData: (data: ChartData) => void
  /** 更新配置 */
  updateConfig: (config: Partial<ChartConfig>) => void
  /** 设置主题 */
  setTheme: (theme: string | ThemeConfig) => void
  /** 调整大小 */
  resize: (width?: number, height?: number) => void
  /** 显示加载状态 */
  showLoading: (text?: string) => void
  /** 隐藏加载状态 */
  hideLoading: () => void
  /** 清空图表 */
  clear: () => void
  /** 销毁图表 */
  dispose: () => void
  /** 导出图片 */
  exportImage: (type?: 'png' | 'jpeg' | 'svg', options?: any) => Promise<Blob>
  /** 导出 PDF */
  exportPDF: (options?: any) => Promise<Blob>
  /** 导出数据 */
  exportData: (format?: 'excel' | 'csv' | 'json', options?: any) => Promise<Blob>
  /** 注册事件监听器 */
  on: (eventType: ChartEventType, handler: EventHandler) => void
  /** 移除事件监听器 */
  off: (eventType: ChartEventType, handler?: EventHandler) => void
}

/**
 * 特定图表 Composables 的选项类型
 */
export interface UseLineChartOptions extends Omit<UseChartOptions, 'type'> {
  smooth?: boolean
  area?: boolean
  stack?: boolean
  showSymbol?: boolean
}

export interface UseBarChartOptions extends Omit<UseChartOptions, 'type'> {
  stack?: boolean
  horizontal?: boolean
  barWidth?: number | string
  barGap?: number | string
}

export interface UsePieChartOptions extends Omit<UseChartOptions, 'type'> {
  donut?: boolean
  innerRadius?: number | string
  outerRadius?: number | string
  roseType?: boolean | 'radius' | 'area'
}

export interface UseScatterChartOptions extends Omit<UseChartOptions, 'type'> {
  regression?: boolean
  symbolSize?: number | number[] | ((value: any) => number)
  symbol?: string
}

// ============================================================================
// 指令相关类型
// ============================================================================

/**
 * v-chart 指令的值类型
 */
export interface ChartDirectiveValue {
  /** 图表类型 */
  type: ChartType
  /** 图表数据 */
  data: ChartData
  /** 图表配置 */
  config?: Partial<ChartConfig>
  /** 主题配置 */
  theme?: string | ThemeConfig
  /** 事件监听器 */
  listeners?: Record<string, EventHandler>
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 响应式图表数据类型
 */
export type ReactiveChartData = Ref<ChartData> | ComputedRef<ChartData>

/**
 * 响应式图表配置类型
 */
export type ReactiveChartConfig = Ref<Partial<ChartConfig>> | ComputedRef<Partial<ChartConfig>>

/**
 * 响应式主题配置类型
 */
export type ReactiveThemeConfig = Ref<string | ThemeConfig> | ComputedRef<string | ThemeConfig>

/**
 * Vue 图表实例类型（扩展基础实例）
 */
export interface VueChartInstance extends BaseChartInstance {
  /** Vue 组件实例引用 */
  vueComponent?: any
  /** 响应式数据监听器 */
  watchers?: Array<() => void>
}
