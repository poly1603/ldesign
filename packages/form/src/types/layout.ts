/**
 * 布局相关类型定义
 */

import type { ResponsiveValue, BreakpointType, CSSValue, AnyObject } from './common'

// 布局类型
export type LayoutType = 'grid' | 'flex' | 'table' | 'inline' | 'float'

// 展开模式
export type ExpandMode = 'inline' | 'dropdown' | 'modal' | 'drawer' | 'popover'

// 按钮位置
export type ActionPosition = 'inline' | 'newline' | 'fixed' | 'floating' | 'sticky'

// 标题位置
export type LabelPosition = 'left' | 'right' | 'top' | 'bottom'

// 标题对齐方式
export type LabelAlign = 'left' | 'center' | 'right'

// 标题宽度策略
export type LabelWidthStrategy = 'auto' | 'uniform' | 'fixed' | 'custom'

// 响应式断点配置
export interface BreakpointConfig {
  // 断点值（像素）
  value: number
  
  // 断点名称
  name: BreakpointType
  
  // 是否启用
  enabled?: boolean
  
  // 列数
  columns?: number
  
  // 最小列宽
  minColumnWidth?: number
  
  // 间距
  gap?: number
  
  // 标题位置
  labelPosition?: LabelPosition
  
  // 标题宽度
  labelWidth?: number | string
  
  // 自定义样式
  styles?: AnyObject
}

// 响应式配置
export interface ResponsiveConfig {
  // 是否启用响应式
  enabled?: boolean
  
  // 断点配置
  breakpoints?: Record<BreakpointType, BreakpointConfig>
  
  // 默认断点
  defaultBreakpoint?: BreakpointType
  
  // 断点检测方式
  detection?: 'window' | 'container' | 'custom'
  
  // 自定义检测函数
  detector?: () => BreakpointType
  
  // 防抖延迟（毫秒）
  debounce?: number
  
  // 是否使用媒体查询
  useMediaQuery?: boolean
}

// Grid布局配置
export interface GridLayoutConfig {
  // 列数
  columns?: ResponsiveValue<number>
  
  // 行数
  rows?: ResponsiveValue<number>
  
  // 列间距
  columnGap?: ResponsiveValue<CSSValue>
  
  // 行间距
  rowGap?: ResponsiveValue<CSSValue>
  
  // 间距（同时设置行列间距）
  gap?: ResponsiveValue<CSSValue>
  
  // 列模板
  gridTemplateColumns?: ResponsiveValue<string>
  
  // 行模板
  gridTemplateRows?: ResponsiveValue<string>
  
  // 区域模板
  gridTemplateAreas?: ResponsiveValue<string>
  
  // 自动列大小
  gridAutoColumns?: ResponsiveValue<string>
  
  // 自动行大小
  gridAutoRows?: ResponsiveValue<string>
  
  // 自动流向
  gridAutoFlow?: ResponsiveValue<'row' | 'column' | 'row dense' | 'column dense'>
  
  // 对齐内容
  justifyContent?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly'>
  
  // 对齐项目
  alignContent?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly'>
  
  // 对齐项目
  justifyItems?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
  
  // 对齐项目
  alignItems?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
}

// Flex布局配置
export interface FlexLayoutConfig {
  // 主轴方向
  flexDirection?: ResponsiveValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>
  
  // 换行方式
  flexWrap?: ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>
  
  // 主轴对齐
  justifyContent?: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>
  
  // 交叉轴对齐
  alignItems?: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'>
  
  // 多行对齐
  alignContent?: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch'>
  
  // 间距
  gap?: ResponsiveValue<CSSValue>
  
  // 行间距
  rowGap?: ResponsiveValue<CSSValue>
  
  // 列间距
  columnGap?: ResponsiveValue<CSSValue>
}

// 标题配置
export interface LabelConfig {
  // 标题位置
  position?: ResponsiveValue<LabelPosition>
  
  // 标题宽度策略
  widthStrategy?: LabelWidthStrategy
  
  // 标题宽度
  width?: ResponsiveValue<number | string | number[]>
  
  // 标题对齐方式
  align?: ResponsiveValue<LabelAlign>
  
  // 是否显示冒号
  showColon?: boolean
  
  // 冒号文本
  colonText?: string
  
  // 必填标记
  requiredMark?: string | boolean
  
  // 必填标记位置
  requiredMarkPosition?: 'before' | 'after'
  
  // 标题样式
  className?: string
  style?: AnyObject
  
  // 标题包装器样式
  wrapperClassName?: string
  wrapperStyle?: AnyObject
  
  // 标题文本样式
  textClassName?: string
  textStyle?: AnyObject
  
  // 是否换行
  wrap?: boolean
  
  // 文本省略
  ellipsis?: boolean
  
  // 工具提示
  tooltip?: boolean | string
  
  // 帮助图标
  helpIcon?: string
  
  // 帮助文本
  helpText?: string
}

// 布局计算配置
export interface LayoutCalculationConfig {
  // 是否自动计算列数
  autoCalculate?: boolean
  
  // 最小列宽（用于自动计算）
  minColumnWidth?: number
  
  // 最大列数
  maxColumns?: number
  
  // 最小列数
  minColumns?: number
  
  // 默认列数
  defaultColumns?: number
  
  // 容器内边距
  containerPadding?: number | [number, number] | [number, number, number, number]
  
  // 容器外边距
  containerMargin?: number | [number, number] | [number, number, number, number]
  
  // 是否考虑滚动条宽度
  includeScrollbar?: boolean
  
  // 滚动条宽度
  scrollbarWidth?: number
  
  // 计算精度
  precision?: number
  
  // 计算缓存
  cache?: boolean
  
  // 缓存时间（毫秒）
  cacheTTL?: number
}

// 分区配置
export interface SectionConfig {
  // 默认显示行数
  defaultRows?: number
  
  // 展开模式
  expandMode?: ExpandMode
  
  // 展开动画
  expandAnimation?: {
    enabled?: boolean
    duration?: number
    easing?: string
    delay?: number
  }
  
  // 展开触发器配置
  expandTrigger?: {
    type?: 'button' | 'link' | 'icon' | 'text'
    text?: string
    expandText?: string
    collapseText?: string
    icon?: string
    expandIcon?: string
    collapseIcon?: string
    position?: 'inline' | 'newline' | 'fixed'
    className?: string
    style?: AnyObject
  }
  
  // 下拉配置
  dropdown?: {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    offset?: number
    className?: string
    style?: AnyObject
    maxHeight?: number
    scrollable?: boolean
    closeOnClickOutside?: boolean
    showArrow?: boolean
  }
  
  // 模态框配置
  modal?: {
    title?: string
    width?: number | string
    height?: number | string
    className?: string
    style?: AnyObject
    maskClosable?: boolean
    keyboard?: boolean
    centered?: boolean
    destroyOnClose?: boolean
  }
  
  // 抽屉配置
  drawer?: {
    title?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    width?: number | string
    height?: number | string
    className?: string
    style?: AnyObject
    maskClosable?: boolean
    keyboard?: boolean
    destroyOnClose?: boolean
  }
  
  // 气泡配置
  popover?: {
    title?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    trigger?: 'click' | 'hover' | 'focus'
    className?: string
    style?: AnyObject
    overlayClassName?: string
    overlayStyle?: AnyObject
  }
}

// 按钮组布局配置
export interface ActionLayoutConfig {
  // 按钮组位置
  position?: ResponsiveValue<ActionPosition>
  
  // 占用列数
  span?: ResponsiveValue<number | 'auto' | 'fill'>
  
  // 对齐方式
  align?: ResponsiveValue<'left' | 'center' | 'right'>
  
  // 垂直对齐
  valign?: ResponsiveValue<'top' | 'middle' | 'bottom'>
  
  // 按钮间距
  gap?: ResponsiveValue<CSSValue>
  
  // 按钮大小
  size?: ResponsiveValue<'small' | 'medium' | 'large'>
  
  // 按钮形状
  shape?: ResponsiveValue<'default' | 'round' | 'circle'>
  
  // 是否块级按钮
  block?: ResponsiveValue<boolean>
  
  // 按钮组样式
  className?: string
  style?: AnyObject
  
  // 按钮包装器样式
  wrapperClassName?: string
  wrapperStyle?: AnyObject
  
  // 固定位置配置
  fixed?: {
    top?: CSSValue
    bottom?: CSSValue
    left?: CSSValue
    right?: CSSValue
    zIndex?: number
    background?: string
    shadow?: boolean
  }
  
  // 浮动位置配置
  floating?: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    offset?: [number, number]
    zIndex?: number
    background?: string
    shadow?: boolean
    borderRadius?: CSSValue
  }
  
  // 粘性位置配置
  sticky?: {
    top?: CSSValue
    bottom?: CSSValue
    zIndex?: number
    background?: string
    shadow?: boolean
  }
}

// 完整布局配置
export interface LayoutConfig {
  // 布局类型
  type?: LayoutType
  
  // 列数配置
  columns?: ResponsiveValue<number>
  
  // 行数配置
  rows?: ResponsiveValue<number>
  
  // Grid布局配置
  grid?: GridLayoutConfig
  
  // Flex布局配置
  flex?: FlexLayoutConfig
  
  // 响应式配置
  responsive?: ResponsiveConfig
  
  // 标题配置
  label?: LabelConfig
  
  // 布局计算配置
  calculation?: LayoutCalculationConfig
  
  // 分区配置
  section?: SectionConfig
  
  // 按钮组布局配置
  actions?: ActionLayoutConfig
  
  // 容器样式
  containerClassName?: string
  containerStyle?: AnyObject
  
  // 内容样式
  contentClassName?: string
  contentStyle?: AnyObject
  
  // 自定义CSS变量
  cssVariables?: Record<string, CSSValue>
  
  // 主题配置
  theme?: {
    name?: string
    variables?: Record<string, CSSValue>
    className?: string
  }
}

// 布局引擎接口
export interface LayoutEngine {
  // 计算布局
  calculate(config: LayoutConfig, containerWidth: number): LayoutResult
  
  // 计算列数
  calculateColumns(config: LayoutConfig, containerWidth: number): number
  
  // 计算字段位置
  calculateFieldPositions(fields: any[], columns: number): FieldPosition[]
  
  // 计算分区
  calculateSections(fields: any[], columns: number, defaultRows: number): SectionResult
  
  // 计算标题宽度
  calculateLabelWidth(fields: any[], strategy: LabelWidthStrategy): number | number[]
  
  // 计算按钮组位置
  calculateActionPosition(config: ActionLayoutConfig, context: any): ActionPositionResult
  
  // 响应式计算
  calculateResponsive(config: ResponsiveConfig, containerWidth: number): BreakpointType
  
  // 更新布局
  updateLayout(config: LayoutConfig): void
  
  // 重置布局
  resetLayout(): void
  
  // 销毁布局
  destroyLayout(): void
}

// 布局计算结果
export interface LayoutResult {
  // 计算后的列数
  columns: number
  
  // 计算后的行数
  rows: number
  
  // 容器尺寸
  containerSize: { width: number; height: number }
  
  // 可用尺寸
  availableSize: { width: number; height: number }
  
  // 列宽
  columnWidth: number
  
  // 行高
  rowHeight: number
  
  // 间距
  gap: { horizontal: number; vertical: number }
  
  // 标题宽度
  labelWidth: number | number[]
  
  // 响应式断点
  breakpoint: BreakpointType
  
  // CSS样式
  styles: AnyObject
  
  // CSS变量
  variables: Record<string, CSSValue>
}

// 字段位置信息
export interface FieldPosition {
  // 字段配置
  field: any
  
  // 行位置（从1开始）
  row: number
  
  // 列位置（从1开始）
  column: number
  
  // 占用列数
  span: number
  
  // Grid区域
  gridArea: string
  
  // 绝对位置
  position: { x: number; y: number; width: number; height: number }
  
  // 是否可见
  visible: boolean
  
  // 是否在默认区域
  inDefaultSection: boolean
}

// 分区计算结果
export interface SectionResult {
  // 默认区域字段
  defaultSection: any[]
  
  // 展开区域字段
  expandedSection: any[]
  
  // 是否需要展开功能
  needsExpand: boolean
  
  // 默认区域行数
  defaultRows: number
  
  // 展开区域行数
  expandedRows: number
  
  // 总行数
  totalRows: number
}

// 按钮组位置结果
export interface ActionPositionResult {
  // 所在行
  row: number
  
  // 所在列
  column: number
  
  // 占用列数
  span: number
  
  // 是否独占新行
  isNewLine: boolean
  
  // 是否固定位置
  isFixed: boolean
  
  // 位置样式
  styles: AnyObject
  
  // Grid区域
  gridArea?: string
}
