// 布局工具函数

import type {
  LayoutConfig,
  FieldLayout,
  ResponsiveConfig,
} from '../types/layout'
import type { FormItemConfig } from '../types/field'

/**
 * 断点定义
 */
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(width: number): keyof typeof breakpoints {
  if (width >= breakpoints.xxl) return 'xxl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

/**
 * 解析跨列配置
 */
export function parseSpan(
  span: number | string | undefined,
  totalColumns: number
): number {
  if (!span) return 1

  if (typeof span === 'number') {
    return Math.min(Math.max(1, span), totalColumns)
  }

  if (typeof span === 'string') {
    // 处理百分比
    if (span.endsWith('%')) {
      const percentage = parseFloat(span) / 100
      return Math.max(1, Math.round(totalColumns * percentage))
    }

    // 处理分数
    if (span.includes('/')) {
      const [numerator, denominator] = span.split('/').map(Number)
      if (numerator && denominator) {
        return Math.max(1, Math.round(totalColumns * (numerator / denominator)))
      }
    }

    // 处理数字字符串
    const numSpan = parseInt(span, 10)
    if (!isNaN(numSpan)) {
      return Math.min(Math.max(1, numSpan), totalColumns)
    }
  }

  return 1
}

/**
 * 计算字段位置
 */
export function calculateFieldPosition(
  row: number,
  column: number,
  columnWidth: number,
  rowHeight: number,
  horizontalGap: number = 0,
  verticalGap: number = 0
): { x: number; y: number } {
  return {
    x: column * (columnWidth + horizontalGap),
    y: row * (rowHeight + verticalGap),
  }
}

/**
 * 计算字段尺寸
 */
export function calculateFieldSize(
  span: number,
  columnWidth: number,
  rowHeight: number,
  horizontalGap: number = 0
): { width: number; height: number } {
  return {
    width: span * columnWidth + (span - 1) * horizontalGap,
    height: rowHeight,
  }
}

/**
 * 计算网格布局
 */
export function calculateGridLayout(
  fields: FormItemConfig[],
  columns: number,
  columnWidth: number,
  rowHeight: number = 60,
  horizontalGap: number = 16,
  verticalGap: number = 16
): FieldLayout[] {
  const layouts: FieldLayout[] = []
  let currentRow = 0
  let currentColumn = 0

  fields.forEach((field, index) => {
    const span = parseSpan(field.span, columns)

    // 检查当前行是否有足够空间
    if (currentColumn + span > columns) {
      currentRow++
      currentColumn = 0
    }

    // 计算位置和尺寸
    const position = calculateFieldPosition(
      currentRow,
      currentColumn,
      columnWidth,
      rowHeight,
      horizontalGap,
      verticalGap
    )

    const size = calculateFieldSize(span, columnWidth, rowHeight, horizontalGap)

    const layout: FieldLayout = {
      name: field.name,
      row: currentRow,
      column: currentColumn,
      span,
      width: size.width,
      height: size.height,
      visible: !field.hidden,
      position,
      size,
    }

    layouts.push(layout)

    // 更新当前位置
    currentColumn += span

    // 如果到达行末，换行
    if (currentColumn >= columns) {
      currentRow++
      currentColumn = 0
    }
  })

  return layouts
}

/**
 * 计算响应式列数
 */
export function calculateResponsiveColumns(
  width: number,
  config: LayoutConfig
): number {
  const breakpoint = getCurrentBreakpoint(width)

  // 检查响应式配置
  if (config.breakpoints?.[breakpoint]?.columns) {
    return config.breakpoints[breakpoint].columns!
  }

  // 使用默认配置
  if (config.columns && !config.autoCalculate) {
    return config.columns
  }

  // 自动计算列数
  const minWidth = config.minColumnWidth || 300
  const maxColumns = config.columns || 12

  return Math.min(Math.max(1, Math.floor(width / minWidth)), maxColumns)
}

/**
 * 获取响应式配置
 */
export function getResponsiveConfig(
  width: number,
  config: LayoutConfig
): Partial<LayoutConfig> {
  const breakpoint = getCurrentBreakpoint(width)
  return config.breakpoints?.[breakpoint] || {}
}

/**
 * 创建默认布局配置
 */
export function createDefaultLayoutConfig(): LayoutConfig {
  return {
    columns: 3,
    minColumnWidth: 300,
    autoCalculate: true,
    horizontalGap: 16,
    verticalGap: 16,
    defaultRows: 3,
    label: {
      position: 'left',
      width: 100,
      showColon: true,
    },
    button: {
      position: 'newline',
      align: 'left',
    },
  }
}

/**
 * 合并布局配置
 */
export function mergeLayoutConfig(
  base: LayoutConfig,
  override: Partial<LayoutConfig>
): LayoutConfig {
  return {
    ...base,
    ...override,
    label: {
      ...base.label,
      ...override.label,
    },
    button: {
      ...base.button,
      ...override.button,
    },
    breakpoints: {
      ...base.breakpoints,
      ...override.breakpoints,
    },
  }
}

/**
 * 验证布局配置
 */
export function validateLayoutConfig(config: LayoutConfig): string[] {
  const errors: string[] = []

  if (config.columns && config.columns <= 0) {
    errors.push('列数必须大于0')
  }

  if (config.minColumnWidth && config.minColumnWidth <= 0) {
    errors.push('最小列宽必须大于0')
  }

  if (config.defaultRows && config.defaultRows <= 0) {
    errors.push('默认行数必须大于0')
  }

  if (config.horizontalGap && config.horizontalGap < 0) {
    errors.push('水平间距不能为负数')
  }

  if (config.verticalGap && config.verticalGap < 0) {
    errors.push('垂直间距不能为负数')
  }

  if (config.label?.width && config.label.width <= 0) {
    errors.push('标签宽度必须大于0')
  }

  return errors
}

/**
 * 计算容器最小宽度
 */
export function calculateMinContainerWidth(
  fields: FormItemConfig[],
  config: LayoutConfig
): number {
  const minColumnWidth = config.minColumnWidth || 300
  const horizontalGap = config.horizontalGap || 0

  // 找到最大跨列数
  const maxSpan = Math.max(
    ...fields.map(field => parseSpan(field.span, config.columns || 12))
  )

  return maxSpan * minColumnWidth + (maxSpan - 1) * horizontalGap
}

/**
 * 计算推荐容器高度
 */
export function calculateRecommendedHeight(
  layouts: FieldLayout[],
  rowHeight: number = 60,
  verticalGap: number = 16
): number {
  if (layouts.length === 0) return 0

  const maxRow = Math.max(...layouts.map(layout => layout.row))
  return (maxRow + 1) * rowHeight + maxRow * verticalGap
}

/**
 * 布局优化器
 */
export class LayoutOptimizer {
  /**
   * 优化字段排列
   */
  static optimizeFieldOrder(
    fields: FormItemConfig[],
    columns: number
  ): FormItemConfig[] {
    // 按跨列数排序，大的在前
    const sortedFields = [...fields].sort((a, b) => {
      const spanA = parseSpan(a.span, columns)
      const spanB = parseSpan(b.span, columns)
      return spanB - spanA
    })

    return sortedFields
  }

  /**
   * 计算布局利用率
   */
  static calculateUtilization(layouts: FieldLayout[], columns: number): number {
    if (layouts.length === 0) return 0

    const totalRows = Math.max(...layouts.map(layout => layout.row)) + 1
    const totalCells = totalRows * columns
    const usedCells = layouts.reduce((sum, layout) => sum + layout.span, 0)

    return (usedCells / totalCells) * 100
  }

  /**
   * 建议最优列数
   */
  static suggestOptimalColumns(
    fields: FormItemConfig[],
    containerWidth: number,
    minColumnWidth: number = 300
  ): number {
    const maxColumns = Math.floor(containerWidth / minColumnWidth)
    const fieldSpans = fields.map(field => parseSpan(field.span, 12))

    // 尝试不同的列数，找到利用率最高的
    let bestColumns = 1
    let bestUtilization = 0

    for (let cols = 1; cols <= maxColumns; cols++) {
      const layouts = calculateGridLayout(fields, cols, containerWidth / cols)
      const utilization = this.calculateUtilization(layouts, cols)

      if (utilization > bestUtilization) {
        bestUtilization = utilization
        bestColumns = cols
      }
    }

    return bestColumns
  }
}
