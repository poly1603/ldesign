/**
 * 图表库常量定义
 * 
 * 这个文件定义了图表库中使用的所有常量，包括：
 * - 默认配置
 * - 图表类型映射
 * - 主题常量
 * - 事件常量
 */

import type { ChartConfig, ThemeConfig, ColorConfig } from './types'

// ============================================================================
// 图表类型常量
// ============================================================================

/**
 * 支持的图表类型列表
 */
export const CHART_TYPES = ['line', 'bar', 'pie', 'scatter', 'area'] as const

/**
 * 图表类型到 ECharts 系列类型的映射
 */
export const CHART_TYPE_MAPPING = {
  line: 'line',
  bar: 'bar',
  pie: 'pie',
  scatter: 'scatter',
  area: 'line', // 面积图使用 line 类型，但设置 areaStyle
} as const

// ============================================================================
// 默认配置常量
// ============================================================================

/**
 * 默认图表尺寸
 */
export const DEFAULT_CHART_SIZE = {
  width: '100%',
  height: 400,
} as const

/**
 * 默认图表配置
 */
export const DEFAULT_CHART_CONFIG: Partial<ChartConfig> = {
  theme: 'light',
  responsive: true,
  animation: true,
  legend: true,
  tooltip: true,
  size: DEFAULT_CHART_SIZE,
}

/**
 * 默认图例配置
 */
export const DEFAULT_LEGEND_CONFIG = {
  show: true,
  position: 'top',
  orient: 'horizontal',
} as const

/**
 * 默认提示框配置
 */
export const DEFAULT_TOOLTIP_CONFIG = {
  show: true,
  trigger: 'axis',
} as const

/**
 * 默认坐标轴配置
 */
export const DEFAULT_AXIS_CONFIG = {
  show: true,
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
  },
} as const

/**
 * 默认网格配置
 */
export const DEFAULT_GRID_CONFIG = {
  left: '10%',
  right: '10%',
  top: '15%',
  bottom: '10%',
  containLabel: true,
} as const

// ============================================================================
// 主题常量
// ============================================================================

/**
 * 默认颜色调色板
 */
export const DEFAULT_COLOR_PALETTE = [
  '#722ED1', // 主紫色
  '#1890FF', // 蓝色
  '#52C41A', // 绿色
  '#FAAD14', // 橙色
  '#F5222D', // 红色
  '#FA8C16', // 橙红色
  '#13C2C2', // 青色
  '#EB2F96', // 粉色
  '#722ED1', // 紫色
  '#FADB14', // 黄色
] as const

/**
 * 浅色主题颜色配置
 */
export const LIGHT_THEME_COLORS: ColorConfig = {
  primary: '#722ED1',
  secondary: '#1890FF',
  background: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
  palette: [...DEFAULT_COLOR_PALETTE],
}

/**
 * 深色主题颜色配置
 */
export const DARK_THEME_COLORS: ColorConfig = {
  primary: '#722ED1',
  secondary: '#1890FF',
  background: '#1f1f1f',
  text: '#ffffff',
  border: '#404040',
  palette: [...DEFAULT_COLOR_PALETTE],
}

/**
 * 彩色主题颜色配置
 */
export const COLORFUL_THEME_COLORS: ColorConfig = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#ffffff',
  text: '#2C3E50',
  border: '#BDC3C7',
  palette: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ],
}

/**
 * 商务主题颜色配置
 */
export const BUSINESS_THEME_COLORS: ColorConfig = {
  primary: '#1F4E79',
  secondary: '#2E75B6',
  background: '#ffffff',
  text: '#333333',
  border: '#D1D5DB',
  palette: [
    '#1F4E79', '#2E75B6', '#4A90C2', '#7BB3F0', '#A8D0F0',
    '#D6E9F8', '#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD',
  ],
}

/**
 * 科技主题颜色配置
 */
export const TECH_THEME_COLORS: ColorConfig = {
  primary: '#00D9FF',
  secondary: '#7C3AED',
  background: '#0F172A',
  text: '#F8FAFC',
  border: '#334155',
  palette: [
    '#00D9FF', '#7C3AED', '#06B6D4', '#8B5CF6', '#14B8A6',
    '#F59E0B', '#EF4444', '#10B981', '#F97316', '#EC4899',
  ],
}

/**
 * 自然主题颜色配置
 */
export const NATURE_THEME_COLORS: ColorConfig = {
  primary: '#16A085',
  secondary: '#27AE60',
  background: '#F8FDF8',
  text: '#2D5A27',
  border: '#A7D7A7',
  palette: [
    '#16A085', '#27AE60', '#2ECC71', '#58D68D', '#82E0AA',
    '#A9DFBF', '#D5F4E6', '#1ABC9C', '#48C9B0', '#76D7C4',
  ],
}

/**
 * 优雅主题颜色配置
 */
export const ELEGANT_THEME_COLORS: ColorConfig = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  background: '#FEFEFE',
  text: '#374151',
  border: '#E5E7EB',
  palette: [
    '#8B5CF6', '#EC4899', '#A855F7', '#F472B6', '#C084FC',
    '#F9A8D4', '#DDD6FE', '#FBBF24', '#34D399', '#60A5FA',
  ],
}

/**
 * 预设主题配置
 */
export const PRESET_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: 'light',
    colors: LIGHT_THEME_COLORS,
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  dark: {
    name: 'dark',
    colors: DARK_THEME_COLORS,
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  colorful: {
    name: 'colorful',
    colors: COLORFUL_THEME_COLORS,
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  business: {
    name: 'business',
    colors: BUSINESS_THEME_COLORS,
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  tech: {
    name: 'tech',
    colors: TECH_THEME_COLORS,
    fonts: {
      family: 'JetBrains Mono, Consolas, "Courier New", monospace',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  nature: {
    name: 'nature',
    colors: NATURE_THEME_COLORS,
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
  elegant: {
    name: 'elegant',
    colors: ELEGANT_THEME_COLORS,
    fonts: {
      family: '"Playfair Display", Georgia, serif',
      size: 12,
      weight: 'normal',
      lineHeight: 1.5,
    },
  },
}

// ============================================================================
// 事件常量
// ============================================================================

/**
 * 图表事件类型列表
 */
export const CHART_EVENT_TYPES = [
  'click',
  'dblclick',
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseover',
  'mouseout',
  'globalout',
  'contextmenu',
  'legendselectchanged',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
] as const

/**
 * 鼠标事件类型
 */
export const MOUSE_EVENT_TYPES = [
  'click',
  'dblclick',
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseover',
  'mouseout',
  'contextmenu',
] as const

/**
 * 交互事件类型
 */
export const INTERACTION_EVENT_TYPES = [
  'legendselectchanged',
  'datazoom',
  'datarangeselected',
  'brush',
  'brushselected',
] as const

// ============================================================================
// 性能常量
// ============================================================================

/**
 * 响应式更新防抖延迟（毫秒）
 */
export const RESIZE_DEBOUNCE_DELAY = 100

/**
 * 数据更新防抖延迟（毫秒）
 */
export const DATA_UPDATE_DEBOUNCE_DELAY = 50

/**
 * 最大数据点数量（性能考虑）
 */
export const MAX_DATA_POINTS = 10000

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = 300

// ============================================================================
// CSS 类名常量
// ============================================================================

/**
 * CSS 类名前缀
 */
export const CSS_PREFIX = 'ldesign-chart'

/**
 * 图表容器类名
 */
export const CHART_CONTAINER_CLASS = `${CSS_PREFIX}-container`

/**
 * 加载状态类名
 */
export const LOADING_CLASS = `${CSS_PREFIX}-loading`

/**
 * 错误状态类名
 */
export const ERROR_CLASS = `${CSS_PREFIX}-error`

/**
 * 响应式类名
 */
export const RESPONSIVE_CLASS = `${CSS_PREFIX}-responsive`

// ============================================================================
// 错误消息常量
// ============================================================================

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  INVALID_CONTAINER: '无效的容器元素',
  INVALID_DATA: '无效的图表数据',
  INVALID_CONFIG: '无效的图表配置',
  INVALID_THEME: '无效的主题配置',
  ECHARTS_NOT_FOUND: 'ECharts 未找到，请确保已正确安装',
  CHART_DISPOSED: '图表已被销毁',
  UNSUPPORTED_CHART_TYPE: '不支持的图表类型',
} as const

// ============================================================================
// 版本信息
// ============================================================================

/**
 * 库版本信息
 */
export const VERSION = '0.1.0'

/**
 * 支持的 ECharts 版本范围
 */
export const SUPPORTED_ECHARTS_VERSION = '^5.0.0'
