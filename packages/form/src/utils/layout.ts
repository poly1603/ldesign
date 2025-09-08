/**
 * 表单布局工具函数
 * 
 * 提供表单布局相关的工具函数，包括：
 * - 响应式布局计算
 * - 栅格系统工具
 * - 标签宽度计算
 * - 字段排列工具
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FieldConfig, FieldLayout, LayoutConfig } from '../types'
import { isNumber, isString } from './helpers'

/**
 * 默认响应式断点配置
 */
export const DEFAULT_BREAKPOINTS = {
  xs: 576,   // < 576px
  sm: 576,   // >= 576px
  md: 768,   // >= 768px
  lg: 992,   // >= 992px
  xl: 1200,  // >= 1200px
  xxl: 1600, // >= 1600px
} as const

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT_CONFIG: Required<LayoutConfig> = {
  columns: 1,
  gutter: 16,
  labelWidth: 120,
  labelAlign: 'right',
  responsive: true,
  breakpoints: DEFAULT_BREAKPOINTS,
}

/**
 * 获取当前屏幕尺寸对应的断点
 * 
 * @param width 屏幕宽度
 * @param breakpoints 断点配置
 * @returns 当前断点
 */
export function getCurrentBreakpoint(
  width: number,
  breakpoints = DEFAULT_BREAKPOINTS
): keyof typeof DEFAULT_BREAKPOINTS {
  if (width < breakpoints.xs) return 'xs'
  if (width < breakpoints.sm) return 'xs'
  if (width < breakpoints.md) return 'sm'
  if (width < breakpoints.lg) return 'md'
  if (width < breakpoints.xl) return 'lg'
  if (width < breakpoints.xxl) return 'xl'
  return 'xxl'
}

/**
 * 计算响应式列数
 * 
 * @param width 容器宽度
 * @param config 布局配置
 * @returns 列数
 */
export function calculateResponsiveColumns(width: number, config: LayoutConfig): number {
  if (!config.responsive) {
    return config.columns || 1
  }

  const breakpoint = getCurrentBreakpoint(width, config.breakpoints)
  
  // 根据断点返回合适的列数
  switch (breakpoint) {
    case 'xs':
      return 1
    case 'sm':
      return Math.min(config.columns || 1, 2)
    case 'md':
      return Math.min(config.columns || 1, 3)
    case 'lg':
    case 'xl':
    case 'xxl':
    default:
      return config.columns || 1
  }
}

/**
 * 计算字段的响应式span
 * 
 * @param field 字段配置
 * @param width 容器宽度
 * @param totalColumns 总列数
 * @param breakpoints 断点配置
 * @returns 计算后的span值
 */
export function calculateFieldSpan(
  field: FieldConfig,
  width: number,
  totalColumns: number,
  breakpoints = DEFAULT_BREAKPOINTS
): number {
  const layout = field.layout || {}
  
  if (!layout.responsive) {
    return Math.min(layout.span || 1, totalColumns)
  }

  const breakpoint = getCurrentBreakpoint(width, breakpoints)
  const responsiveConfig = layout.responsive?.[breakpoint]
  
  if (responsiveConfig?.span !== undefined) {
    return Math.min(responsiveConfig.span, totalColumns)
  }
  
  // 如果没有响应式配置，使用默认span
  return Math.min(layout.span || 1, totalColumns)
}

/**
 * 计算字段的响应式offset
 * 
 * @param field 字段配置
 * @param width 容器宽度
 * @param breakpoints 断点配置
 * @returns 计算后的offset值
 */
export function calculateFieldOffset(
  field: FieldConfig,
  width: number,
  breakpoints = DEFAULT_BREAKPOINTS
): number {
  const layout = field.layout || {}
  
  if (!layout.responsive) {
    return layout.offset || 0
  }

  const breakpoint = getCurrentBreakpoint(width, breakpoints)
  const responsiveConfig = layout.responsive?.[breakpoint]
  
  if (responsiveConfig?.offset !== undefined) {
    return responsiveConfig.offset
  }
  
  return layout.offset || 0
}

/**
 * 将字段按行分组
 * 
 * @param fields 字段配置数组
 * @param width 容器宽度
 * @param config 布局配置
 * @returns 分组后的字段数组
 */
export function groupFieldsByRows(
  fields: FieldConfig[],
  width: number,
  config: LayoutConfig
): FieldConfig[][] {
  const totalColumns = calculateResponsiveColumns(width, config)
  const rows: FieldConfig[][] = []
  let currentRow: FieldConfig[] = []
  let currentRowSpan = 0

  for (const field of fields) {
    // 跳过不可见的字段
    if (field.visible === false) {
      continue
    }

    const fieldSpan = calculateFieldSpan(field, width, totalColumns, config.breakpoints)
    const fieldOffset = calculateFieldOffset(field, width, config.breakpoints)
    
    // 如果当前行放不下这个字段，开始新行
    if (currentRowSpan + fieldOffset + fieldSpan > totalColumns && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }
    
    // 添加字段到当前行
    currentRow.push({
      ...field,
      layout: {
        ...field.layout,
        span: fieldSpan,
        offset: fieldOffset,
      },
    })
    
    currentRowSpan += fieldOffset + fieldSpan
    
    // 如果当前行已满，开始新行
    if (currentRowSpan >= totalColumns) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }
  }
  
  // 添加最后一行
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }
  
  return rows
}

/**
 * 计算标签宽度
 * 
 * @param label 标签文本
 * @param fontSize 字体大小
 * @returns 标签宽度（像素）
 */
export function calculateLabelWidth(label: string, fontSize = 14): number {
  if (!label) return 0
  
  // 创建临时元素来测量文本宽度
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (!context) {
    // 如果无法获取context，使用估算方法
    // 中文字符约为字体大小的1倍宽度，英文字符约为字体大小的0.6倍宽度
    let width = 0
    for (const char of label) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        width += fontSize
      } else {
        width += fontSize * 0.6
      }
    }
    return Math.ceil(width)
  }
  
  context.font = `${fontSize}px sans-serif`
  const metrics = context.measureText(label)
  return Math.ceil(metrics.width)
}

/**
 * 计算最优标签宽度
 * 
 * @param fields 字段配置数组
 * @param fontSize 字体大小
 * @returns 最优标签宽度
 */
export function calculateOptimalLabelWidth(fields: FieldConfig[], fontSize = 14): number {
  let maxWidth = 0
  
  for (const field of fields) {
    if (field.label && field.visible !== false) {
      const labelText = isString(field.label) ? field.label : ''
      const width = calculateLabelWidth(labelText, fontSize)
      maxWidth = Math.max(maxWidth, width)
    }
  }
  
  // 添加一些padding
  return maxWidth + 16
}

/**
 * 标准化标签宽度值
 * 
 * @param labelWidth 标签宽度配置
 * @param containerWidth 容器宽度
 * @returns 标准化后的标签宽度（像素）
 */
export function normalizeLabelWidth(labelWidth: number | string, containerWidth: number): number {
  if (isNumber(labelWidth)) {
    return labelWidth
  }
  
  if (isString(labelWidth)) {
    if (labelWidth.endsWith('px')) {
      return Number.parseInt(labelWidth, 10)
    }
    
    if (labelWidth.endsWith('%')) {
      const percentage = Number.parseFloat(labelWidth) / 100
      return Math.floor(containerWidth * percentage)
    }
    
    if (labelWidth.endsWith('em')) {
      const em = Number.parseFloat(labelWidth)
      return Math.floor(em * 16) // 假设1em = 16px
    }
    
    // 尝试解析为数字
    const num = Number.parseFloat(labelWidth)
    if (!Number.isNaN(num)) {
      return num
    }
  }
  
  return 120 // 默认值
}

/**
 * 计算字段的CSS样式
 * 
 * @param field 字段配置
 * @param config 布局配置
 * @param containerWidth 容器宽度
 * @returns CSS样式对象
 */
export function calculateFieldStyles(
  field: FieldConfig,
  config: LayoutConfig,
  containerWidth: number
): Record<string, string | number> {
  const layout = field.layout || {}
  const totalColumns = calculateResponsiveColumns(containerWidth, config)
  const span = calculateFieldSpan(field, containerWidth, totalColumns, config.breakpoints)
  const offset = calculateFieldOffset(field, containerWidth, config.breakpoints)
  
  const styles: Record<string, string | number> = {
    width: `${(span / totalColumns) * 100}%`,
  }
  
  if (offset > 0) {
    styles.marginLeft = `${(offset / totalColumns) * 100}%`
  }
  
  if (config.gutter) {
    styles.paddingLeft = `${config.gutter / 2}px`
    styles.paddingRight = `${config.gutter / 2}px`
  }
  
  return styles
}

/**
 * 计算表单容器的CSS样式
 * 
 * @param config 布局配置
 * @returns CSS样式对象
 */
export function calculateFormStyles(config: LayoutConfig): Record<string, string | number> {
  const styles: Record<string, string | number> = {}
  
  if (config.gutter) {
    styles.marginLeft = `-${config.gutter / 2}px`
    styles.marginRight = `-${config.gutter / 2}px`
  }
  
  return styles
}

/**
 * 生成栅格CSS类名
 * 
 * @param span 占用列数
 * @param offset 偏移列数
 * @param totalColumns 总列数
 * @param prefix 类名前缀
 * @returns CSS类名数组
 */
export function generateGridClasses(
  span: number,
  offset: number,
  totalColumns: number,
  prefix = 'ldesign-col'
): string[] {
  const classes: string[] = []
  
  classes.push(`${prefix}-${span}`)
  
  if (offset > 0) {
    classes.push(`${prefix}-offset-${offset}`)
  }
  
  return classes
}

/**
 * 检查字段是否在指定断点下可见
 * 
 * @param field 字段配置
 * @param breakpoint 断点
 * @returns 是否可见
 */
export function isFieldVisibleAtBreakpoint(
  field: FieldConfig,
  breakpoint: keyof typeof DEFAULT_BREAKPOINTS
): boolean {
  if (field.visible === false) {
    return false
  }
  
  const layout = field.layout
  if (!layout?.responsive) {
    return true
  }
  
  const responsiveConfig = layout.responsive[breakpoint]
  if (responsiveConfig && 'span' in responsiveConfig) {
    return (responsiveConfig.span || 0) > 0
  }
  
  return true
}

/**
 * 排序字段（考虑order属性）
 * 
 * @param fields 字段配置数组
 * @returns 排序后的字段数组
 */
export function sortFieldsByOrder(fields: FieldConfig[]): FieldConfig[] {
  return [...fields].sort((a, b) => {
    const orderA = a.layout?.order || 0
    const orderB = b.layout?.order || 0
    return orderA - orderB
  })
}
