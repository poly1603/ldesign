/**
 * 布局相关工具函数
 */

import type { 
  LayoutConfig, 
  LayoutResult, 
  BreakpointConfig, 
  BreakpointType,
  FormFieldItem,
  FormFieldConfig,
  FormGroupConfig
} from '../types'

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: Record<BreakpointType, BreakpointConfig> = {
  xs: { value: 0, name: 'xs', columns: 1 },
  sm: { value: 576, name: 'sm', columns: 2 },
  md: { value: 768, name: 'md', columns: 3 },
  lg: { value: 992, name: 'lg', columns: 4 },
  xl: { value: 1200, name: 'xl', columns: 5 }
}

/**
 * 根据容器宽度计算当前断点
 */
export function calculateBreakpoint(
  width: number,
  breakpoints: Record<BreakpointType, BreakpointConfig> = DEFAULT_BREAKPOINTS
): BreakpointType {
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b.value - a.value)
  
  for (const [name, config] of sortedBreakpoints) {
    if (width >= config.value) {
      return name as BreakpointType
    }
  }
  
  return 'xs'
}

/**
 * 计算网格列数
 */
export function calculateColumns(
  width: number,
  config: LayoutConfig,
  breakpoint: BreakpointType
): number {
  // 优先使用响应式配置
  if (config.responsive?.enabled && config.responsive.breakpoints) {
    const breakpointConfig = config.responsive.breakpoints[breakpoint]
    if (breakpointConfig) {
      return breakpointConfig.columns
    }
  }
  
  // 使用固定列数
  if (config.columns) {
    return config.columns
  }
  
  // 自动计算列数
  const minColumnWidth = config.minColumnWidth || 300
  const maxColumns = config.maxColumns || 6
  const minColumns = config.minColumns || 1
  
  const calculatedColumns = Math.floor(width / minColumnWidth)
  return Math.max(minColumns, Math.min(maxColumns, calculatedColumns))
}

/**
 * 计算网格间距
 */
export function calculateGap(config: LayoutConfig): { horizontal: number; vertical: number } {
  if (typeof config.gap === 'number') {
    return { horizontal: config.gap, vertical: config.gap }
  }
  
  if (config.gap && typeof config.gap === 'object') {
    return {
      horizontal: config.gap.horizontal || 16,
      vertical: config.gap.vertical || 16
    }
  }
  
  return { horizontal: 16, vertical: 16 }
}

/**
 * 计算字段的网格位置
 */
export function calculateFieldPosition(
  field: FormFieldConfig,
  index: number,
  columns: number
): { column: number; row: number; span: number } {
  let span = 1
  
  // 解析span配置
  if (field.span) {
    if (typeof field.span === 'number') {
      span = Math.min(field.span, columns)
    } else if (typeof field.span === 'string') {
      if (field.span === 'auto') {
        span = 1
      } else if (field.span === 'fill') {
        span = columns
      } else {
        const parsed = parseInt(field.span)
        if (!isNaN(parsed)) {
          span = Math.min(parsed, columns)
        }
      }
    }
  }
  
  // 计算位置
  const column = index % columns
  const row = Math.floor(index / columns)
  
  return { column, row, span }
}

/**
 * 分析字段布局需求
 */
export function analyzeFieldLayout(fields: FormFieldItem[]): {
  totalFields: number
  maxSpan: number
  hasFullWidthFields: boolean
  hasGroupFields: boolean
} {
  let totalFields = 0
  let maxSpan = 1
  let hasFullWidthFields = false
  let hasGroupFields = false
  
  function analyzeField(field: FormFieldItem) {
    if (field.type === 'group' && 'fields' in field) {
      hasGroupFields = true
      const groupField = field as FormGroupConfig
      groupField.fields.forEach(analyzeField)
    } else if (field.type !== 'actions' && 'name' in field) {
      totalFields++
      const fieldConfig = field as FormFieldConfig
      
      if (fieldConfig.span) {
        if (typeof fieldConfig.span === 'number') {
          maxSpan = Math.max(maxSpan, fieldConfig.span)
        } else if (fieldConfig.span === 'fill') {
          hasFullWidthFields = true
        }
      }
    }
  }
  
  fields.forEach(analyzeField)
  
  return {
    totalFields,
    maxSpan,
    hasFullWidthFields,
    hasGroupFields
  }
}

/**
 * 优化布局配置
 */
export function optimizeLayoutConfig(
  config: LayoutConfig,
  containerWidth: number,
  fieldAnalysis: ReturnType<typeof analyzeFieldLayout>
): LayoutConfig {
  const optimized = { ...config }
  
  // 如果有全宽字段，建议减少列数
  if (fieldAnalysis.hasFullWidthFields && optimized.columns && optimized.columns > 3) {
    optimized.columns = Math.min(optimized.columns, 3)
  }
  
  // 如果字段数量较少，建议减少列数
  if (fieldAnalysis.totalFields <= 3 && optimized.columns && optimized.columns > fieldAnalysis.totalFields) {
    optimized.columns = fieldAnalysis.totalFields
  }
  
  // 如果容器宽度较小，强制使用单列布局
  if (containerWidth < 600) {
    optimized.columns = 1
  }
  
  return optimized
}

/**
 * 生成CSS Grid样式
 */
export function generateGridStyles(
  columns: number,
  gap: { horizontal: number; vertical: number }
): Record<string, string> {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap.vertical}px ${gap.horizontal}px`,
    width: '100%'
  }
}

/**
 * 生成字段样式
 */
export function generateFieldStyles(
  position: { column: number; row: number; span: number },
  field: FormFieldConfig
): Record<string, string> {
  const styles: Record<string, string> = {}
  
  // 设置网格跨度
  if (position.span > 1) {
    styles.gridColumn = `span ${position.span}`
  }
  
  // 应用自定义样式
  if (field.style) {
    Object.assign(styles, field.style)
  }
  
  // 应用Grid属性
  if (field.gridColumn) {
    styles.gridColumn = field.gridColumn
  }
  
  if (field.gridRow) {
    styles.gridRow = field.gridRow
  }
  
  if (field.gridArea) {
    styles.gridArea = field.gridArea
  }
  
  return styles
}

/**
 * 计算布局结果
 */
export function calculateLayout(
  config: LayoutConfig,
  containerWidth: number,
  fields: FormFieldItem[]
): LayoutResult {
  // 分析字段布局需求
  const fieldAnalysis = analyzeFieldLayout(fields)
  
  // 优化配置
  const optimizedConfig = optimizeLayoutConfig(config, containerWidth, fieldAnalysis)
  
  // 计算断点
  const breakpoint = calculateBreakpoint(containerWidth, optimizedConfig.responsive?.breakpoints)
  
  // 计算列数
  const columns = calculateColumns(containerWidth, optimizedConfig, breakpoint)
  
  // 计算间距
  const gap = calculateGap(optimizedConfig)
  
  // 生成样式
  const styles = generateGridStyles(columns, gap)
  
  // 计算行数（估算）
  const rows = Math.ceil(fieldAnalysis.totalFields / columns)
  
  return {
    columns,
    rows,
    gap,
    breakpoint,
    containerWidth,
    styles,
    variables: {
      '--form-columns': columns.toString(),
      '--form-gap-horizontal': `${gap.horizontal}px`,
      '--form-gap-vertical': `${gap.vertical}px`,
      '--form-breakpoint': breakpoint
    }
  }
}

/**
 * 分割字段到不同区域
 */
export function splitFieldsToSections(
  fields: FormFieldItem[],
  expandConfig?: { enabled: boolean; threshold?: number }
): { defaultSection: FormFieldItem[]; expandedSection: FormFieldItem[] } {
  if (!expandConfig?.enabled) {
    return {
      defaultSection: fields,
      expandedSection: []
    }
  }
  
  const threshold = expandConfig.threshold || 6
  
  if (fields.length <= threshold) {
    return {
      defaultSection: fields,
      expandedSection: []
    }
  }
  
  return {
    defaultSection: fields.slice(0, threshold),
    expandedSection: fields.slice(threshold)
  }
}

/**
 * 检查布局是否需要响应式调整
 */
export function shouldAdjustLayout(
  currentWidth: number,
  previousWidth: number,
  breakpoints: Record<BreakpointType, BreakpointConfig> = DEFAULT_BREAKPOINTS
): boolean {
  const currentBreakpoint = calculateBreakpoint(currentWidth, breakpoints)
  const previousBreakpoint = calculateBreakpoint(previousWidth, breakpoints)
  
  return currentBreakpoint !== previousBreakpoint
}

/**
 * 获取推荐的布局配置
 */
export function getRecommendedLayoutConfig(
  containerWidth: number,
  fieldCount: number
): LayoutConfig {
  const breakpoint = calculateBreakpoint(containerWidth)
  
  let columns: number
  
  if (containerWidth < 600) {
    columns = 1
  } else if (containerWidth < 900) {
    columns = Math.min(2, fieldCount)
  } else if (containerWidth < 1200) {
    columns = Math.min(3, fieldCount)
  } else {
    columns = Math.min(4, fieldCount)
  }
  
  return {
    type: 'grid',
    columns,
    gap: 16,
    responsive: {
      enabled: true,
      breakpoints: DEFAULT_BREAKPOINTS
    },
    minColumnWidth: 300,
    maxColumns: 6,
    minColumns: 1
  }
}
