/**
 * 布局计算器 - 负责计算表单项的位置和布局
 */

import type {
  FormItemConfig,
  LayoutConfig,
  ItemPosition,
  ResponsiveConfig,
} from '../types'
import { calculateOptimalColumns, calculateItemPositions, clamp } from '../utils/math'

export interface LayoutCalculatorOptions {
  /** 最大列数 */
  maxColumns?: number
  /** 最小列数 */
  minColumns?: number
  /** 列间距 */
  columnGap?: number
  /** 行间距 */
  rowGap?: number
  /** 最小列宽 */
  minColumnWidth?: number
  /** 是否启用响应式 */
  responsive?: boolean
}

export class LayoutCalculator {
  private config: Required<LayoutCalculatorOptions>
  private containerWidth: number = 0
  private containerHeight: number = 0
  private currentColumns: number = 1
  private itemPositions: Map<string, ItemPosition> = new Map()
  private visibleItems: FormItemConfig[] = []
  private isExpanded: boolean = false
  private maxVisibleItems: number = 6

  constructor(options: LayoutCalculatorOptions = {}) {
    this.config = {
      maxColumns: options.maxColumns ?? 4,
      minColumns: options.minColumns ?? 1,
      columnGap: options.columnGap ?? 16,
      rowGap: options.rowGap ?? 16,
      minColumnWidth: options.minColumnWidth ?? 200,
      responsive: options.responsive ?? true,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(options: Partial<LayoutCalculatorOptions>): void {
    Object.assign(this.config, options)
    this.recalculate()
  }

  /**
   * 更新容器尺寸
   */
  updateContainerSize(width: number, height: number): void {
    if (this.containerWidth !== width || this.containerHeight !== height) {
      this.containerWidth = width
      this.containerHeight = height
      this.recalculate()
    }
  }

  /**
   * 计算最优列数
   */
  calculateOptimalColumns(): number {
    if (!this.config.responsive) {
      return this.config.maxColumns
    }

    const availableWidth = this.containerWidth - this.config.columnGap
    const columnWidth = this.config.minColumnWidth + this.config.columnGap
    
    const theoreticalColumns = Math.floor(
      (availableWidth + this.config.columnGap) / columnWidth
    )
    
    return clamp(
      theoreticalColumns,
      this.config.minColumns,
      this.config.maxColumns
    )
  }

  /**
   * 计算表单项位置
   */
  calculateItemPositions(
    items: FormItemConfig[],
    layoutConfig?: LayoutConfig
  ): Map<string, ItemPosition> {
    this.visibleItems = this.getVisibleItems(items)
    this.currentColumns = this.calculateOptimalColumns()
    
    const positions = new Map<string, ItemPosition>()
    const columnWidth = this.getColumnWidth()
    
    let currentRow = 0
    let currentCol = 0
    
    this.visibleItems.forEach((item, index) => {
      const span = this.getItemSpan(item, layoutConfig)
      
      // 检查当前行是否有足够空间
      if (currentCol + span > this.currentColumns) {
        currentRow++
        currentCol = 0
      }
      
      const position: ItemPosition = {
        row: currentRow,
        col: currentCol,
        span: span,
        width: columnWidth * span + this.config.columnGap * (span - 1),
        height: this.getItemHeight(item),
        x: currentCol * (columnWidth + this.config.columnGap),
        y: currentRow * (this.getItemHeight(item) + this.config.rowGap),
        visible: true,
        index,
      }
      
      positions.set(item.key, position)
      currentCol += span
    })
    
    this.itemPositions = positions
    return positions
  }

  /**
   * 获取可见的表单项
   */
  private getVisibleItems(items: FormItemConfig[]): FormItemConfig[] {
    if (this.isExpanded) {
      return items.filter(item => item.visible !== false)
    }
    
    const visibleItems = items.filter(item => item.visible !== false)
    return visibleItems.slice(0, this.maxVisibleItems)
  }

  /**
   * 获取表单项的列占用
   */
  private getItemSpan(item: FormItemConfig, layoutConfig?: LayoutConfig): number {
    let span = item.span ?? 1
    
    // 应用响应式配置
    if (this.config.responsive && item.responsive) {
      const responsive = item.responsive
      const columns = this.currentColumns
      
      if (columns <= 1 && responsive.xs !== undefined) {
        span = responsive.xs
      } else if (columns <= 2 && responsive.sm !== undefined) {
        span = responsive.sm
      } else if (columns <= 3 && responsive.md !== undefined) {
        span = responsive.md
      } else if (columns <= 4 && responsive.lg !== undefined) {
        span = responsive.lg
      } else if (responsive.xl !== undefined) {
        span = responsive.xl
      }
    }
    
    // 应用布局配置的默认span
    if (span === 1 && layoutConfig?.defaultSpan) {
      span = layoutConfig.defaultSpan
    }
    
    // 确保span不超过当前列数
    return Math.min(span, this.currentColumns)
  }

  /**
   * 获取列宽
   */
  private getColumnWidth(): number {
    const totalGap = this.config.columnGap * (this.currentColumns - 1)
    return (this.containerWidth - totalGap) / this.currentColumns
  }

  /**
   * 获取表单项高度
   */
  private getItemHeight(item: FormItemConfig): number {
    // 根据表单项类型返回不同的高度
    switch (item.type) {
      case 'textarea':
        return 80
      case 'select':
      case 'date':
      case 'time':
      case 'datetime':
        return 40
      case 'checkbox':
      case 'radio':
        return 32
      case 'switch':
        return 24
      default:
        return 40
    }
  }

  /**
   * 设置展开状态
   */
  setExpanded(expanded: boolean): void {
    if (this.isExpanded !== expanded) {
      this.isExpanded = expanded
      this.recalculate()
    }
  }

  /**
   * 设置最大可见项数
   */
  setMaxVisibleItems(count: number): void {
    if (this.maxVisibleItems !== count) {
      this.maxVisibleItems = count
      this.recalculate()
    }
  }

  /**
   * 重新计算布局
   */
  private recalculate(): void {
    if (this.visibleItems.length > 0) {
      this.calculateItemPositions(this.visibleItems)
    }
  }

  /**
   * 获取当前列数
   */
  getCurrentColumns(): number {
    return this.currentColumns
  }

  /**
   * 获取容器尺寸
   */
  getContainerSize(): { width: number; height: number } {
    return {
      width: this.containerWidth,
      height: this.containerHeight,
    }
  }

  /**
   * 获取表单项位置
   */
  getItemPosition(key: string): ItemPosition | undefined {
    return this.itemPositions.get(key)
  }

  /**
   * 获取所有表单项位置
   */
  getAllItemPositions(): Map<string, ItemPosition> {
    return new Map(this.itemPositions)
  }

  /**
   * 获取布局信息
   */
  getLayoutInfo(): {
    columns: number
    rows: number
    totalItems: number
    visibleItems: number
    containerSize: { width: number; height: number }
    columnWidth: number
    isExpanded: boolean
  } {
    const rows = Math.max(
      ...Array.from(this.itemPositions.values()).map(pos => pos.row)
    ) + 1
    
    return {
      columns: this.currentColumns,
      rows: rows || 0,
      totalItems: this.visibleItems.length,
      visibleItems: this.visibleItems.length,
      containerSize: this.getContainerSize(),
      columnWidth: this.getColumnWidth(),
      isExpanded: this.isExpanded,
    }
  }

  /**
   * 检查是否需要展开收起功能
   */
  needsExpandCollapse(totalItems: number): boolean {
    return totalItems > this.maxVisibleItems
  }

  /**
   * 获取隐藏的表单项数量
   */
  getHiddenItemsCount(totalItems: number): number {
    if (this.isExpanded) {
      return 0
    }
    return Math.max(0, totalItems - this.maxVisibleItems)
  }

  /**
   * 计算容器所需高度
   */
  calculateRequiredHeight(): number {
    if (this.itemPositions.size === 0) {
      return 0
    }
    
    let maxY = 0
    let maxHeight = 0
    
    this.itemPositions.forEach(position => {
      const bottom = position.y + position.height
      if (bottom > maxY + maxHeight) {
        maxY = position.y
        maxHeight = position.height
      }
    })
    
    return maxY + maxHeight
  }

  /**
   * 获取指定行的表单项
   */
  getItemsInRow(row: number): FormItemConfig[] {
    const items: FormItemConfig[] = []
    
    this.itemPositions.forEach((position, key) => {
      if (position.row === row) {
        const item = this.visibleItems.find(item => item.key === key)
        if (item) {
          items.push(item)
        }
      }
    })
    
    return items.sort((a, b) => {
      const posA = this.itemPositions.get(a.key)!
      const posB = this.itemPositions.get(b.key)!
      return posA.col - posB.col
    })
  }

  /**
   * 获取指定列的表单项
   */
  getItemsInColumn(col: number): FormItemConfig[] {
    const items: FormItemConfig[] = []
    
    this.itemPositions.forEach((position, key) => {
      if (position.col <= col && position.col + position.span > col) {
        const item = this.visibleItems.find(item => item.key === key)
        if (item) {
          items.push(item)
        }
      }
    })
    
    return items.sort((a, b) => {
      const posA = this.itemPositions.get(a.key)!
      const posB = this.itemPositions.get(b.key)!
      return posA.row - posB.row
    })
  }

  /**
   * 销毁计算器
   */
  destroy(): void {
    this.itemPositions.clear()
    this.visibleItems = []
  }
}

/**
 * 创建布局计算器
 */
export function createLayoutCalculator(
  options?: LayoutCalculatorOptions
): LayoutCalculator {
  return new LayoutCalculator(options)
}

/**
 * 计算响应式列数
 */
export function calculateResponsiveColumns(
  containerWidth: number,
  options: {
    minColumnWidth?: number
    columnGap?: number
    minColumns?: number
    maxColumns?: number
  } = {}
): number {
  const {
    minColumnWidth = 200,
    columnGap = 16,
    minColumns = 1,
    maxColumns = 4,
  } = options
  
  const availableWidth = containerWidth - columnGap
  const columnWidth = minColumnWidth + columnGap
  
  const theoreticalColumns = Math.floor(
    (availableWidth + columnGap) / columnWidth
  )
  
  return clamp(theoreticalColumns, minColumns, maxColumns)
}

/**
 * 计算网格布局
 */
export function calculateGridLayout(
  items: FormItemConfig[],
  columns: number,
  options: {
    columnGap?: number
    rowGap?: number
    containerWidth?: number
  } = {}
): Map<string, ItemPosition> {
  const {
    columnGap = 16,
    rowGap = 16,
    containerWidth = 800,
  } = options
  
  const positions = new Map<string, ItemPosition>()
  const columnWidth = (containerWidth - columnGap * (columns - 1)) / columns
  
  let currentRow = 0
  let currentCol = 0
  
  items.forEach((item, index) => {
    const span = Math.min(item.span ?? 1, columns)
    
    // 检查当前行是否有足够空间
    if (currentCol + span > columns) {
      currentRow++
      currentCol = 0
    }
    
    const position: ItemPosition = {
      row: currentRow,
      col: currentCol,
      span: span,
      width: columnWidth * span + columnGap * (span - 1),
      height: 40, // 默认高度
      x: currentCol * (columnWidth + columnGap),
      y: currentRow * (40 + rowGap),
      visible: item.visible !== false,
      index,
    }
    
    positions.set(item.key, position)
    currentCol += span
  })
  
  return positions
}