/**
 * @ldesign/form - Layout Engine
 * 布局引擎
 */

import type { LayoutConfig, FieldConfig, FieldSpan } from '../../utils/types'
import type { LayoutResult, FieldLayout } from '../../utils/types'
import { DEFAULT_LAYOUT_CONFIG } from '../../utils/constants'
import {
  calculateColumns,
  parseFieldSpan,
  calculateFieldLayouts,
  calculateButtonPosition,
  calculateLabelWidthByColumn,
  calculateSpacing
} from './calculator'
import { ResponsiveLayoutManager } from './responsive'
import { debounce } from '../../utils/performance'
import { deepMerge } from '../../utils/helpers'

/**
 * 布局引擎配置
 */
export interface LayoutEngineConfig extends LayoutConfig {
  /** 字段配置 */
  fields?: Array<{
    name: string
    label?: string
    span?: FieldSpan
    visible?: boolean
  }>
}

/**
 * 布局引擎类
 */
export class LayoutEngine {
  private config: Required<LayoutConfig>
  private fields: Array<{
    name: string
    label?: string
    span?: FieldSpan
    visible?: boolean
  }>
  private responsiveManager: ResponsiveLayoutManager | null
  private containerWidth: number
  private cachedColumns: number
  private cachedFieldLayouts: FieldLayout[]
  private recalculateDebounced: () => void

  constructor(config: LayoutEngineConfig = {}) {
    this.config = deepMerge({ ...DEFAULT_LAYOUT_CONFIG }, config as any)
    this.fields = config.fields || []
    this.responsiveManager = null
    this.containerWidth = 0
    this.cachedColumns = this.config.maxSpan
    this.cachedFieldLayouts = []

    // 创建防抖的重新计算函数
    this.recalculateDebounced = debounce(() => {
      this.recalculate()
    }, 100)

    // 如果启用响应式，创建响应式管理器
    if (this.config.responsive) {
      this.responsiveManager = new ResponsiveLayoutManager(
        this.config.breakpoints
      )
    }
  }

  /**
   * 初始化布局引擎
   * @param container 容器元素
   */
  init(container: HTMLElement): void {
    this.containerWidth = container.offsetWidth

    if (this.responsiveManager) {
      this.responsiveManager.init(container)
      this.responsiveManager.subscribe((_, columns) => {
        this.cachedColumns = columns
        this.recalculateDebounced()
      })
    }

    this.recalculate()
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = deepMerge(this.config, config as any)

    if (config.breakpoints && this.responsiveManager) {
      this.responsiveManager.updateBreakpoints(config.breakpoints)
    }

    this.recalculateDebounced()
  }

  /**
   * 更新字段列表
   * @param fields 字段配置
   */
  updateFields(
    fields: Array<{
      name: string
      label?: string
      span?: FieldSpan
      visible?: boolean
    }>
  ): void {
    this.fields = fields
    this.recalculateDebounced()
  }

  /**
   * 更新容器宽度
   * @param width 容器宽度
   */
  updateContainerWidth(width: number): void {
    if (width !== this.containerWidth) {
      this.containerWidth = width
      this.recalculateDebounced()
    }
  }

  /**
   * 重新计算布局
   */
  private recalculate(): void {
    // 计算列数
    if (!this.responsiveManager) {
      this.cachedColumns = calculateColumns(
        this.containerWidth,
        this.config.spanWidth!,
        this.config.maxSpan!,
        this.config.minSpan!
      )
    }

    // 计算字段布局
    this.cachedFieldLayouts = this.calculateFieldLayouts()
  }

  /**
   * 计算字段布局
   */
  private calculateFieldLayouts(): FieldLayout[] {
    const layouts = calculateFieldLayouts(this.fields, this.cachedColumns)

    return layouts.map(layout => ({
      name: layout.name,
      span: layout.span,
      row: layout.row,
      column: layout.column,
      visible: layout.visible,
      inPreview: false // 预览状态由外部控制
    }))
  }

  /**
   * 获取布局结果
   */
  getLayoutResult(): LayoutResult {
    const columnWidth = this.containerWidth / this.cachedColumns
    const labelWidth = this.calculateLabelWidth()

    return {
      columns: this.cachedColumns,
      columnWidth,
      labelWidth,
      containerWidth: this.containerWidth,
      needWrap: this.cachedColumns < this.fields.length
    }
  }

  /**
   * 获取字段布局
   * @param fieldName 字段名（可选）
   */
  getFieldLayouts(fieldName?: string): FieldLayout[] | FieldLayout | undefined {
    if (fieldName) {
      return this.cachedFieldLayouts.find(layout => layout.name === fieldName)
    }
    return this.cachedFieldLayouts
  }

  /**
   * 计算标题宽度
   */
  private calculateLabelWidth(): number {
    // 如果配置了固定宽度
    if (this.config.labelWidth && this.config.labelWidth !== 'auto') {
      if (typeof this.config.labelWidth === 'number') {
        return this.config.labelWidth
      }
      const width = parseInt(String(this.config.labelWidth), 10)
      if (!isNaN(width)) {
        return width
      }
    }

    // 自动计算
    const labels: Record<string, string> = {}
    this.fields.forEach(field => {
      if (field.label) {
        labels[field.name] = field.label
      }
    })

    const widths = calculateLabelWidthByColumn(
      this.cachedFieldLayouts,
      labels,
      14,
      8
    )

    return Math.max(...widths, 80) // 最小80px
  }

  /**
   * 获取当前列数
   */
  getColumns(): number {
    return this.cachedColumns
  }

  /**
   * 获取间距配置
   */
  getSpacing(): {
    space: number | string
    gap: number | string
  } {
    return {
      space: calculateSpacing(this.config.space),
      gap: calculateSpacing(this.config.gap, 8)
    }
  }

  /**
   * 获取按钮位置
   * @param buttonSpan 按钮占列数
   * @param buttonPosition 按钮位置
   */
  getButtonPosition(
    buttonSpan: number,
    buttonPosition: 'inline' | 'block'
  ): {
    row: number
    column: number
    span: number
  } {
    const visibleFields = this.fields.filter(f => f.visible !== false)
    return calculateButtonPosition(
      visibleFields.length,
      this.cachedColumns,
      buttonSpan,
      buttonPosition
    )
  }

  /**
   * 销毁布局引擎
   */
  destroy(): void {
    if (this.responsiveManager) {
      this.responsiveManager.destroy()
      this.responsiveManager = null
    }
  }
}

/**
 * 创建布局引擎
 */
export function createLayoutEngine(
  config?: LayoutEngineConfig
): LayoutEngine {
  return new LayoutEngine(config)
}




