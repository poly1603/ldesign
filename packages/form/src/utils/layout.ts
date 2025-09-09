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
  mode: 'vertical',
  columns: 1,
  gutter: 16,
  labelWidth: 120,
  labelAlign: 'right',
  responsive: true,
  breakpoints: DEFAULT_BREAKPOINTS,
  horizontal: {
    columnsPerRow: 1,
    useGrid: true,
    gridTemplateColumns: 'repeat(1, 1fr)',
    rowGap: 16,
    columnGap: 16,
    autoFill: true,
    buttonPosition: 'separate-row',
    buttonColSpan: 1,
  },
  collapsible: {
    enabled: false,
    defaultVisibleRows: 3,
    expandText: '展开',
    collapseText: '收起',
    buttonPosition: 'bottom',
    showFieldCount: true,
    animationDuration: 300,
  },
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

/**
 * 计算水平布局的Grid样式
 *
 * @param config 布局配置
 * @param containerWidth 容器宽度
 * @returns Grid样式对象
 */
export function calculateHorizontalGridStyles(
  config: LayoutConfig,
  containerWidth: number
): Record<string, string | number> {
  const horizontal = config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal
  const columnsPerRow = horizontal.columnsPerRow || config.columns || 1

  const styles: Record<string, string | number> = {
    display: 'grid',
    gap: `${horizontal.rowGap || 16}px ${horizontal.columnGap || 16}px`,
  }

  if (horizontal.useGrid && horizontal.gridTemplateColumns) {
    styles.gridTemplateColumns = horizontal.gridTemplateColumns
  } else {
    styles.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`
  }

  // 响应式处理
  if (config.responsive && config.breakpoints) {
    const breakpoint = getCurrentBreakpoint(containerWidth, config.breakpoints)

    // 根据断点调整列数
    let responsiveColumns = columnsPerRow
    if (containerWidth < (config.breakpoints.sm || 576)) {
      responsiveColumns = 1 // 小屏幕单列
    } else if (containerWidth < (config.breakpoints.md || 768)) {
      responsiveColumns = Math.min(2, columnsPerRow) // 中小屏幕最多2列
    }

    if (responsiveColumns !== columnsPerRow) {
      styles.gridTemplateColumns = `repeat(${responsiveColumns}, 1fr)`
    }
  }

  return styles
}

/**
 * 计算字段在水平布局中的样式
 *
 * @param field 字段配置
 * @param config 布局配置
 * @param containerWidth 容器宽度
 * @returns 字段样式对象
 */
export function calculateHorizontalFieldStyles(
  field: FieldConfig,
  config: LayoutConfig,
  containerWidth: number
): Record<string, string | number> {
  const layout = field.layout || {}
  const styles: Record<string, string | number> = {}

  // Grid item 样式
  if (layout.span && layout.span > 1) {
    styles.gridColumn = `span ${layout.span}`
  }

  if (layout.offset && layout.offset > 0) {
    styles.gridColumnStart = layout.offset + 1
  }

  if (layout.order) {
    styles.order = layout.order
  }

  return styles
}

/**
 * 生成水平布局的CSS类名
 *
 * @param config 布局配置
 * @param containerWidth 容器宽度
 * @returns CSS类名数组
 */
export function generateHorizontalLayoutClasses(
  config: LayoutConfig,
  containerWidth: number
): string[] {
  const classes: string[] = ['ldesign-form--horizontal']

  const horizontal = config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal
  const columnsPerRow = horizontal.columnsPerRow || config.columns || 1

  classes.push(`ldesign-form--columns-${columnsPerRow}`)

  if (horizontal.useGrid) {
    classes.push('ldesign-form--grid')
  }

  if (horizontal.autoFill) {
    classes.push('ldesign-form--auto-fill')
  }

  // 响应式类名
  if (config.responsive) {
    const breakpoint = getCurrentBreakpoint(containerWidth, config.breakpoints)
    classes.push(`ldesign-form--${breakpoint}`)
  }

  return classes
}

/**
 * 验证水平布局配置
 *
 * @param config 布局配置
 * @returns 验证结果
 */
export function validateHorizontalLayoutConfig(config: LayoutConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (config.mode === 'horizontal') {
    const horizontal = config.horizontal

    if (horizontal) {
      if (horizontal.columnsPerRow && horizontal.columnsPerRow < 1) {
        errors.push('columnsPerRow must be greater than 0')
      }

      if (horizontal.rowGap && typeof horizontal.rowGap === 'number' && horizontal.rowGap < 0) {
        errors.push('rowGap must be non-negative')
      }

      if (horizontal.columnGap && typeof horizontal.columnGap === 'number' && horizontal.columnGap < 0) {
        errors.push('columnGap must be non-negative')
      }

      if (horizontal.gridTemplateColumns && typeof horizontal.gridTemplateColumns !== 'string') {
        errors.push('gridTemplateColumns must be a string')
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 计算可见字段
 * 统一使用行数配置，支持横向和纵向布局
 *
 * @param fields 所有字段配置
 * @param config 布局配置
 * @param isExpanded 是否已展开
 * @returns 可见字段配置数组
 */
export function calculateVisibleFields(
  fields: FieldConfig[],
  config: LayoutConfig,
  isExpanded: boolean
): FieldConfig[] {
  const collapsible = config.collapsible || DEFAULT_LAYOUT_CONFIG.collapsible

  if (!collapsible.enabled || isExpanded) {
    return fields
  }

  // 获取默认显示行数
  const defaultVisibleRows = collapsible.defaultVisibleRows || 3

  // 获取每行最大列数
  let columnsPerRow = 1 // 纵向布局默认每行1列
  if (config.mode === 'horizontal') {
    const horizontal = config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal
    columnsPerRow = horizontal.columnsPerRow || 2
  }

  // 根据字段的colSpan累计计算可见字段
  const visibleFields: FieldConfig[] = []
  let usedCells = 0
  let currentRow = 1

  // 检查是否需要为按钮组预留空间
  const needsButtonSpace = config.mode === 'horizontal' &&
    (config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal).buttonPosition === 'inline'
  const buttonColSpan = needsButtonSpace ?
    ((config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal).buttonColSpan || 1) : 0

  for (const field of fields) {
    // 字段占用的列数，不能超过每行最大列数
    const fieldColSpan = Math.min(field.colSpan || 1, columnsPerRow)

    // 计算添加这个字段后会占用到第几行
    const newUsedCells = usedCells + fieldColSpan
    const newCurrentRow = Math.ceil(newUsedCells / columnsPerRow)

    // 检查是否超出了默认显示行数
    if (newCurrentRow > defaultVisibleRows) {
      break
    }

    // 如果是最后一行，需要检查是否为按钮组留出了空间
    if (needsButtonSpace && newCurrentRow === defaultVisibleRows) {
      const lastRowUsedCells = newUsedCells % columnsPerRow || columnsPerRow
      const lastRowRemainingCells = columnsPerRow - lastRowUsedCells

      // 如果最后一行剩余空间不足以放置按钮组，则不添加这个字段
      if (lastRowRemainingCells < buttonColSpan) {
        break
      }
    }

    visibleFields.push(field)
    usedCells = newUsedCells
    currentRow = newCurrentRow
  }

  return visibleFields
}

/**
 * 计算隐藏字段数量
 *
 * @param fields 所有字段配置
 * @param config 布局配置
 * @returns 隐藏的字段数量
 */
export function calculateHiddenFieldsCount(
  fields: FieldConfig[],
  config: LayoutConfig
): number {
  const collapsible = config.collapsible || DEFAULT_LAYOUT_CONFIG.collapsible

  if (!collapsible.enabled) {
    return 0
  }

  const visibleFields = calculateVisibleFields(fields, config, false)
  return Math.max(0, fields.length - visibleFields.length)
}

/**
 * 计算按钮组在网格中的位置
 *
 * @param fields 所有字段配置
 * @param config 布局配置
 * @param isExpanded 是否已展开
 * @returns 按钮组位置信息
 */
export function calculateButtonPosition(
  fields: FieldConfig[],
  config: LayoutConfig,
  isExpanded: boolean
): {
  shouldInline: boolean
  gridColumn?: string
  needsNewRow: boolean
} {
  // 纵向布局或按钮组配置为独占行时，不内联
  if (config.mode !== 'horizontal') {
    return { shouldInline: false, needsNewRow: true }
  }

  const horizontal = config.horizontal || DEFAULT_LAYOUT_CONFIG.horizontal
  if (horizontal.buttonPosition !== 'inline') {
    return { shouldInline: false, needsNewRow: true }
  }

  const columnsPerRow = horizontal.columnsPerRow || 2
  const buttonColSpan = horizontal.buttonColSpan || 1

  // 如果是展开状态，需要计算所有字段渲染后的剩余空间
  if (isExpanded) {
    let usedCells = 0
    for (const field of fields) {
      const fieldColSpan = Math.min(field.colSpan || 1, columnsPerRow)
      usedCells += fieldColSpan
    }

    // 计算最后一行已使用的列数
    const lastRowUsedCells = usedCells % columnsPerRow
    const remainingCells = lastRowUsedCells === 0 ? 0 : columnsPerRow - lastRowUsedCells

    if (remainingCells >= buttonColSpan) {
      // 最后一行有足够空间，按钮组应该尽可能定位在最后一列
      const endColumn = columnsPerRow
      const startColumn = endColumn - buttonColSpan + 1
      return {
        shouldInline: true,
        gridColumn: buttonColSpan === 1 ? `${endColumn}` : `${startColumn} / ${endColumn + 1}`,
        needsNewRow: false
      }
    } else {
      // 最后一行空间不足，按钮组独占新行
      return {
        shouldInline: true,
        gridColumn: buttonColSpan === 1 ? 'auto' : `span ${buttonColSpan}`,
        needsNewRow: true
      }
    }
  } else {
    // 默认状态，按钮组应该尽可能定位在最后一行的最后一列
    const endColumn = columnsPerRow
    const startColumn = endColumn - buttonColSpan + 1
    return {
      shouldInline: true,
      gridColumn: buttonColSpan === 1 ? `${endColumn}` : `${startColumn} / ${endColumn + 1}`,
      needsNewRow: false
    }
  }
}

/**
 * 生成展开/收起按钮的HTML
 *
 * @param config 布局配置
 * @param isExpanded 是否已展开
 * @param hiddenCount 隐藏字段数量
 * @returns 按钮HTML字符串
 */
export function generateCollapseButtonHTML(
  config: LayoutConfig,
  isExpanded: boolean,
  hiddenCount: number
): string {
  const collapsible = config.collapsible || DEFAULT_LAYOUT_CONFIG.collapsible

  if (!collapsible.enabled || hiddenCount === 0) {
    return ''
  }

  const buttonText = isExpanded
    ? collapsible.collapseText || '收起'
    : collapsible.expandText || '展开'

  const countText = collapsible.showFieldCount && !isExpanded
    ? ` (${hiddenCount})`
    : ''

  return `
    <div class="ldesign-form-collapse-button-container">
      <button type="button" class="ldesign-form-collapse-button" data-action="${isExpanded ? 'collapse' : 'expand'}">
        <span class="ldesign-form-collapse-button-text">${buttonText}${countText}</span>
        <span class="ldesign-form-collapse-button-icon ${isExpanded ? 'expanded' : 'collapsed'}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10.5L4 6.5h8L8 10.5z"/>
          </svg>
        </span>
      </button>
    </div>
  `
}

/**
 * 应用展开/收起动画
 *
 * @param element 目标元素
 * @param isExpanding 是否正在展开
 * @param duration 动画持续时间
 */
export function applyCollapseAnimation(
  element: HTMLElement,
  isExpanding: boolean,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const startHeight = element.scrollHeight
    const endHeight = isExpanding ? element.scrollHeight : 0

    element.style.height = `${startHeight}px`
    element.style.overflow = 'hidden'
    element.style.transition = `height ${duration}ms ease-in-out`

    // 强制重绘
    element.offsetHeight

    element.style.height = `${endHeight}px`

    setTimeout(() => {
      element.style.height = ''
      element.style.overflow = ''
      element.style.transition = ''
      resolve()
    }, duration)
  })
}
