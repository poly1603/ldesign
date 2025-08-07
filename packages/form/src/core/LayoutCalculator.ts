// 布局计算器

import type {
  LayoutConfig,
  LayoutResult,
  FieldLayout,
  ResponsiveConfig,
  BreakpointConfig,
} from '../types/layout'
import type { FormItemConfig } from '../types/field'
import {
  calculateColumns,
  calculateColumnWidth,
  calculateSpanWidth,
  parseSpan,
  calculateGridPosition,
  getBreakpoint,
  calculateElementPosition,
  calculateElementSize,
  clamp,
} from '../utils/math'
import { SimpleEventEmitter } from '../utils/event'

/**
 * 布局计算器
 */
export class LayoutCalculator extends SimpleEventEmitter {
  private config: LayoutConfig
  private containerSize: { width: number; height: number } = {
    width: 0,
    height: 0,
  }
  private currentBreakpoint: string = 'lg'

  constructor(config: LayoutConfig = {}) {
    super()
    this.config = {
      defaultRows: 3,
      minColumnWidth: 300,
      autoCalculate: true,
      horizontalGap: 16,
      verticalGap: 16,
      ...config,
    }
  }

  /**
   * 计算布局
   */
  calculateLayout(
    fields: FormItemConfig[],
    containerWidth: number,
    containerHeight: number = 0
  ): LayoutResult {
    this.containerSize = { width: containerWidth, height: containerHeight }
    this.currentBreakpoint = getBreakpoint(containerWidth)

    // 获取响应式配置
    const responsiveConfig = this.getResponsiveConfig()
    const effectiveConfig = { ...this.config, ...responsiveConfig }

    // 计算列数
    const columns = this.calculateEffectiveColumns(
      containerWidth,
      effectiveConfig
    )

    // 计算列宽
    const columnWidth = calculateColumnWidth(
      containerWidth,
      columns,
      effectiveConfig.horizontalGap || 0
    )

    // 过滤可见字段
    const visibleFields = fields.filter(field => !field.hidden)

    // 计算字段布局
    const fieldLayouts = this.calculateFieldLayouts(
      visibleFields,
      columns,
      columnWidth,
      effectiveConfig
    )

    // 计算是否需要展开按钮
    const needsExpand = this.shouldShowExpandButton(
      fieldLayouts,
      effectiveConfig
    )

    const result: LayoutResult = {
      columns,
      columnWidth,
      fields: fieldLayouts,
      containerSize: this.containerSize,
      needsExpand,
      visibleFieldCount: visibleFields.length,
      hiddenFieldCount: fields.length - visibleFields.length,
    }

    this.emit('layoutCalculated', result)
    return result
  }

  /**
   * 计算有效列数
   */
  private calculateEffectiveColumns(
    containerWidth: number,
    config: LayoutConfig
  ): number {
    if (config.columns && !config.autoCalculate) {
      return config.columns
    }

    const minWidth = config.minColumnWidth || 300
    const maxColumns = config.columns || 12

    return calculateColumns(containerWidth, minWidth, maxColumns)
  }

  /**
   * 获取响应式配置
   */
  private getResponsiveConfig(): Partial<LayoutConfig> {
    const breakpoints = this.config.breakpoints
    if (!breakpoints) {
      return {}
    }

    const currentConfig =
      breakpoints[this.currentBreakpoint as keyof BreakpointConfig]
    if (!currentConfig) {
      return {}
    }

    return {
      columns: currentConfig.columns,
      minColumnWidth: currentConfig.minColumnWidth,
      horizontalGap: currentConfig.horizontalGap,
      verticalGap: currentConfig.verticalGap,
    }
  }

  /**
   * 计算字段布局
   */
  private calculateFieldLayouts(
    fields: FormItemConfig[],
    columns: number,
    columnWidth: number,
    config: LayoutConfig
  ): FieldLayout[] {
    const layouts: FieldLayout[] = []
    const spans = fields.map(field => parseSpan(field.span || 1, columns))

    let currentRow = 0
    let currentColumn = 0

    fields.forEach((field, index) => {
      const span = spans[index]

      // 检查当前行是否有足够空间
      if (currentColumn + span > columns) {
        currentRow++
        currentColumn = 0
      }

      // 计算位置和尺寸
      const position = calculateElementPosition(
        currentRow,
        currentColumn,
        columnWidth,
        this.getRowHeight(),
        config.horizontalGap || 0,
        config.verticalGap || 0
      )

      const size = calculateElementSize(
        span,
        columnWidth,
        this.getRowHeight(),
        config.horizontalGap || 0
      )

      // 判断是否可见（基于默认行数）
      const visible = currentRow < (config.defaultRows || 3)

      const layout: FieldLayout = {
        name: field.name,
        row: currentRow,
        column: currentColumn,
        span,
        width: size.width,
        height: size.height,
        visible,
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
   * 获取行高
   */
  private getRowHeight(): number {
    // 默认行高，可以根据需要调整
    return 60
  }

  /**
   * 判断是否应该显示展开按钮
   */
  private shouldShowExpandButton(
    layouts: FieldLayout[],
    config: LayoutConfig
  ): boolean {
    const defaultRows = config.defaultRows || 3
    const maxRow = Math.max(...layouts.map(layout => layout.row), -1)
    return maxRow >= defaultRows
  }

  /**
   * 重新计算指定字段的布局
   */
  recalculateField(
    fieldName: string,
    fields: FormItemConfig[],
    containerWidth: number
  ): FieldLayout | null {
    const fieldIndex = fields.findIndex(field => field.name === fieldName)
    if (fieldIndex === -1) {
      return null
    }

    const layout = this.calculateLayout(fields, containerWidth)
    return layout.fields[fieldIndex] || null
  }

  /**
   * 获取字段在指定断点下的布局
   */
  getFieldLayoutAtBreakpoint(
    field: FormItemConfig,
    breakpoint: string,
    containerWidth: number
  ): Partial<FieldLayout> {
    const oldBreakpoint = this.currentBreakpoint
    this.currentBreakpoint = breakpoint

    const responsiveConfig = this.getResponsiveConfig()
    const effectiveConfig = { ...this.config, ...responsiveConfig }

    const columns = this.calculateEffectiveColumns(
      containerWidth,
      effectiveConfig
    )
    const columnWidth = calculateColumnWidth(
      containerWidth,
      columns,
      effectiveConfig.horizontalGap || 0
    )

    const span = parseSpan(field.span || 1, columns)
    const size = calculateElementSize(
      span,
      columnWidth,
      this.getRowHeight(),
      effectiveConfig.horizontalGap || 0
    )

    this.currentBreakpoint = oldBreakpoint

    return {
      span,
      width: size.width,
      height: size.height,
      size,
    }
  }

  /**
   * 计算最小容器宽度
   */
  calculateMinContainerWidth(fields: FormItemConfig[]): number {
    const minColumnWidth = this.config.minColumnWidth || 300
    const horizontalGap = this.config.horizontalGap || 0

    // 找到最大跨列数
    const maxSpan = Math.max(
      ...fields.map(field => {
        if (typeof field.span === 'number') {
          return field.span
        }
        if (typeof field.span === 'string' && field.span.endsWith('%')) {
          const percentage = parseFloat(field.span) / 100
          return Math.ceil(12 * percentage) // 假设最大12列
        }
        return 1
      })
    )

    return maxSpan * minColumnWidth + (maxSpan - 1) * horizontalGap
  }

  /**
   * 计算推荐容器高度
   */
  calculateRecommendedHeight(layout: LayoutResult): number {
    if (layout.fields.length === 0) {
      return 0
    }

    const maxRow = Math.max(...layout.fields.map(field => field.row))
    const rowHeight = this.getRowHeight()
    const verticalGap = this.config.verticalGap || 0

    return (maxRow + 1) * rowHeight + maxRow * verticalGap
  }

  /**
   * 获取布局统计信息
   */
  getLayoutStats(layout: LayoutResult): {
    totalRows: number
    visibleRows: number
    hiddenRows: number
    averageSpan: number
    utilization: number
  } {
    const totalRows = Math.max(...layout.fields.map(field => field.row), -1) + 1
    const visibleRows =
      Math.max(
        ...layout.fields.filter(field => field.visible).map(field => field.row),
        -1
      ) + 1
    const hiddenRows = totalRows - visibleRows

    const totalSpan = layout.fields.reduce((sum, field) => sum + field.span, 0)
    const averageSpan =
      layout.fields.length > 0 ? totalSpan / layout.fields.length : 0

    const maxPossibleSpan = totalRows * layout.columns
    const utilization =
      maxPossibleSpan > 0 ? (totalSpan / maxPossibleSpan) * 100 : 0

    return {
      totalRows,
      visibleRows,
      hiddenRows,
      averageSpan: Math.round(averageSpan * 100) / 100,
      utilization: Math.round(utilization * 100) / 100,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config }
    this.emit('configUpdated', this.config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): LayoutConfig {
    return { ...this.config }
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): string {
    return this.currentBreakpoint
  }

  /**
   * 获取容器尺寸
   */
  getContainerSize(): { width: number; height: number } {
    return { ...this.containerSize }
  }

  /**
   * 验证布局配置
   */
  validateConfig(config: LayoutConfig): string[] {
    const errors: string[] = []

    if (config.minColumnWidth && config.minColumnWidth <= 0) {
      errors.push('最小列宽必须大于0')
    }

    if (config.columns && config.columns <= 0) {
      errors.push('列数必须大于0')
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

    return errors
  }

  /**
   * 销毁布局计算器
   */
  destroy(): void {
    this.removeAllListeners()
  }
}
