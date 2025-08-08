// 布局相关类型定义

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 默认展示行数，超出部分可展开/收起 */
  defaultRows?: number

  /** 每列最小宽度，单位像素 */
  minColumnWidth?: number

  /** 是否自动计算列数，根据容器宽度和最小列宽自动计算 */
  autoCalculate?: boolean

  /** 固定列数，设置后禁用 autoCalculate */
  columns?: number

  /** 表单项水平间距，单位像素 */
  horizontalGap?: number

  /** 表单项垂直间距，单位像素 */
  verticalGap?: number

  /** 标题配置 */
  label?: LabelConfig

  /** 按钮组配置 */
  button?: ButtonConfig

  /** 响应式断点配置 */
  breakpoints?: BreakpointConfig

  /** 容器配置 */
  container?: ContainerConfig

  /** 表单样式主题 */
  theme?: FormTheme

  /** 自定义CSS类名 */
  className?: string

  /** 是否自动计算列数 */
  autoColumns?: boolean

  /** 字段最小宽度（用于自动列数计算），默认200px */
  fieldMinWidth?: number

  /** 是否统一间距设置 */
  unifiedSpacing?: boolean

  /** 默认显示行数，0表示显示全部 */
  defaultRows?: number

  /** 展开模式 */
  expandMode?: ExpandMode

  /** 是否显示展开按钮 */
  showExpandButton?: boolean
}

/**
 * 表单样式主题
 */
export type FormTheme = 'default' | 'bordered'

/**
 * 展开模式
 */
export type ExpandMode = 'inline' | 'popup'

/**
 * 标题配置
 */
export interface LabelConfig {
  /** 是否显示标题后的冒号 */
  showColon?: boolean

  /** 标题位置 */
  position?: LabelPosition

  /** 标题宽度 */
  width?: LabelWidth

  /** 标题对齐方式 */
  align?: LabelAlign

  /** 标题换行方式 */
  wrap?: boolean

  /** 标题与组件间距，范围0-20px，默认8px */
  gap?: number

  /** 是否自动计算标题宽度 */
  autoWidth?: boolean

  /** 标题宽度计算模式 */
  widthMode?: 'auto' | 'manual'

  /** 按列设置标题宽度 */
  widthByColumn?: Record<number, number>
}

/**
 * 标题位置
 */
export type LabelPosition = 'left' | 'right' | 'top'

/**
 * 标题宽度
 */
export type LabelWidth = 'auto' | number | number[]

/**
 * 标题对齐方式
 */
export type LabelAlign = 'left' | 'center' | 'right'

/**
 * 按钮组配置
 */
export interface ButtonConfig {
  /** 按钮位置 */
  position?: ButtonPosition

  /** 按钮组所占列数 */
  span?: number

  /** 按钮对齐方式 */
  align?: ButtonAlign

  /** 展开功能配置 */
  expand?: ExpandConfig
}

/**
 * 按钮位置
 */
export type ButtonPosition =
  | 'inline'
  | 'newline'
  | 'follow-last-row'
  | 'separate-row'

/**
 * 按钮对齐方式
 */
export type ButtonAlign = 'left' | 'center' | 'right'

/**
 * 展开功能配置
 */
export interface ExpandConfig {
  /** 展开方式 */
  mode?: ExpandMode

  /** 展开按钮文本 */
  expandText?: string

  /** 收起按钮文本 */
  collapseText?: string

  /** 是否显示展开按钮 */
  showButton?: boolean

  /** 展开动画配置 */
  animation?: AnimationConfig

  /** 悬浮框配置（当 mode 为 popup 时使用） */
  popup?: PopupConfig
}

/**
 * 悬浮框配置
 */
export interface PopupConfig {
  /** 标题 */
  title?: string

  /** 宽度 */
  width?: number | string

  /** 高度 */
  height?: number | string

  /** 是否可关闭 */
  closable?: boolean

  /** 点击遮罩是否关闭 */
  maskClosable?: boolean

  /** 是否居中显示 */
  centered?: boolean

  /** 层级 */
  zIndex?: number
}

/**
 * 展开方式
 */
export type ExpandMode = 'toggle' | 'modal'

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画持续时间（毫秒） */
  duration?: number

  /** 动画缓动函数 */
  easing?: string

  /** 是否启用动画 */
  enabled?: boolean
}

/**
 * 响应式断点配置
 */
export interface BreakpointConfig {
  /** 超小屏幕 (<576px) */
  xs?: ResponsiveConfig

  /** 小屏幕 (≥576px) */
  sm?: ResponsiveConfig

  /** 中等屏幕 (≥768px) */
  md?: ResponsiveConfig

  /** 大屏幕 (≥992px) */
  lg?: ResponsiveConfig

  /** 超大屏幕 (≥1200px) */
  xl?: ResponsiveConfig
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  /** 列数 */
  columns?: number

  /** 最小列宽 */
  minColumnWidth?: number

  /** 水平间距 */
  horizontalGap?: number

  /** 垂直间距 */
  verticalGap?: number

  /** 标题配置 */
  label?: Partial<LabelConfig>
}

/**
 * 容器配置
 */
export interface ContainerConfig {
  /** 容器最大宽度 */
  maxWidth?: number | string

  /** 容器内边距 */
  padding?: number | string

  /** 容器外边距 */
  margin?: number | string

  /** 容器背景色 */
  background?: string

  /** 容器边框 */
  border?: string

  /** 容器圆角 */
  borderRadius?: number | string

  /** 容器阴影 */
  boxShadow?: string
}

/**
 * 布局计算结果
 */
export interface LayoutResult {
  /** 计算出的列数 */
  columns: number

  /** 每列宽度 */
  columnWidth: number

  /** 字段布局信息 */
  fields: FieldLayout[]

  /** 容器尺寸 */
  containerSize: {
    width: number
    height: number
  }

  /** 是否需要展开按钮 */
  needsExpand: boolean

  /** 可见字段数量 */
  visibleFieldCount: number

  /** 隐藏字段数量 */
  hiddenFieldCount: number
}

/**
 * 字段布局信息
 */
export interface FieldLayout {
  /** 字段名称 */
  name: string

  /** 行索引 */
  row: number

  /** 列索引 */
  column: number

  /** 跨列数 */
  span: number

  /** 字段宽度 */
  width: number

  /** 字段高度 */
  height?: number

  /** 是否可见 */
  visible: boolean

  /** 位置信息 */
  position: {
    x: number
    y: number
  }

  /** 尺寸信息 */
  size: {
    width: number
    height: number
  }
}
