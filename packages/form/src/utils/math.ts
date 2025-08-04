/**
 * 数学计算工具类
 */

import type { FormItemConfig, LayoutConfig, ResponsiveConfig } from '../types'

// 计算最佳列数
export function calculateOptimalColumns(
  containerWidth: number,
  config: LayoutConfig
): number {
  const { columnWidth = 200, gap = { horizontal: 16, vertical: 16 }, minColumns = 1, maxColumns = 4 } = config
  
  // 计算可用宽度（减去间距）
  const availableWidth = containerWidth - gap.horizontal
  
  // 计算理论列数
  const theoreticalColumns = Math.floor((availableWidth + gap.horizontal) / (columnWidth + gap.horizontal))
  
  // 限制在最小和最大列数之间
  return Math.max(minColumns, Math.min(maxColumns, theoreticalColumns))
}

// 根据响应式配置计算列数
export function calculateResponsiveColumns(
  containerWidth: number,
  responsive: ResponsiveConfig
): number {
  if (containerWidth < 576 && responsive.xs !== undefined) {
    return responsive.xs
  }
  if (containerWidth < 768 && responsive.sm !== undefined) {
    return responsive.sm
  }
  if (containerWidth < 992 && responsive.md !== undefined) {
    return responsive.md
  }
  if (containerWidth < 1200 && responsive.lg !== undefined) {
    return responsive.lg
  }
  if (containerWidth < 1400 && responsive.xl !== undefined) {
    return responsive.xl
  }
  if (responsive.xxl !== undefined) {
    return responsive.xxl
  }
  
  // 默认返回4列
  return 4
}

// 计算网格布局
export function calculateGridLayout(
  items: FormItemConfig[],
  columns: number,
  config: LayoutConfig
): Array<{
  key: string
  row: number
  column: number
  span: number
  width: number
  height: number
}> {
  const { columnWidth = 200, gap = { horizontal: 16, vertical: 16 } } = config
  const layout: Array<{
    key: string
    row: number
    column: number
    span: number
    width: number
    height: number
  }> = []
  
  let currentRow = 0
  let currentColumn = 0
  
  items.forEach(item => {
    const span = Math.min(item.span || 1, columns)
    
    // 检查当前行是否有足够空间
    if (currentColumn + span > columns) {
      // 移到下一行
      currentRow++
      currentColumn = 0
    }
    
    // 计算宽度
    const width = span * columnWidth + (span - 1) * gap.horizontal
    const height = getItemHeight(item)
    
    layout.push({
      key: item.key,
      row: currentRow,
      column: currentColumn,
      span,
      width,
      height,
    })
    
    currentColumn += span
    
    // 如果当前行已满，移到下一行
    if (currentColumn >= columns) {
      currentRow++
      currentColumn = 0
    }
  })
  
  return layout
}

// 获取表单项高度
export function getItemHeight(item: FormItemConfig): number {
  switch (item.type) {
    case 'textarea':
      return 80
    case 'select':
      return 32
    case 'checkbox':
    case 'radio':
      return 24
    case 'range':
      return 20
    default:
      return 32
  }
}

// 计算容器所需高度
export function calculateContainerHeight(
  layout: Array<{ row: number; height: number }>,
  config: LayoutConfig
): number {
  if (layout.length === 0) return 0
  
  const { gap = { horizontal: 16, vertical: 16 } } = config
  const maxRow = Math.max(...layout.map(item => item.row))
  
  // 计算每行的最大高度
  const rowHeights: number[] = []
  for (let row = 0; row <= maxRow; row++) {
    const rowItems = layout.filter(item => item.row === row)
    const maxHeight = Math.max(...rowItems.map(item => item.height))
    rowHeights.push(maxHeight)
  }
  
  // 计算总高度
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0)
  const totalGap = Math.max(0, rowHeights.length - 1) * gap.vertical
  
  return totalHeight + totalGap
}

// 计算可见项目
export function calculateVisibleItems(
  items: FormItemConfig[],
  defaultRows: number,
  columns: number
): {
  visible: FormItemConfig[]
  hidden: FormItemConfig[]
  hasMore: boolean
} {
  const maxVisibleItems = defaultRows * columns
  
  if (items.length <= maxVisibleItems) {
    return {
      visible: items,
      hidden: [],
      hasMore: false,
    }
  }
  
  return {
    visible: items.slice(0, maxVisibleItems - 1), // 留一个位置给操作按钮
    hidden: items.slice(maxVisibleItems - 1),
    hasMore: true,
  }
}

// 计算项目位置
export function calculateItemPosition(
  row: number,
  column: number,
  span: number,
  config: LayoutConfig
): {
  x: number
  y: number
  width: number
  height: number
} {
  const { columnWidth = 200, gap = { horizontal: 16, vertical: 16 } } = config
  const itemHeight = 32 // 默认高度
  
  const x = column * (columnWidth + gap.horizontal)
  const y = row * (itemHeight + gap.vertical)
  const width = span * columnWidth + (span - 1) * gap.horizontal
  const height = itemHeight
  
  return { x, y, width, height }
}

// 计算自动填充
export function calculateAutoFill(
  layout: Array<{
    key: string
    row: number
    column: number
    span: number
  }>,
  columns: number
): Array<{
  key: string
  row: number
  column: number
  span: number
  autoExpanded?: boolean
}> {
  const result = [...layout]
  
  // 按行分组
  const rowGroups = new Map<number, typeof layout>()
  layout.forEach(item => {
    if (!rowGroups.has(item.row)) {
      rowGroups.set(item.row, [])
    }
    rowGroups.get(item.row)!.push(item)
  })
  
  // 处理每一行的自动填充
  rowGroups.forEach((rowItems, row) => {
    const totalSpan = rowItems.reduce((sum, item) => sum + item.span, 0)
    const remainingColumns = columns - totalSpan
    
    if (remainingColumns > 0 && rowItems.length > 0) {
      // 扩展最后一个项目
      const lastItem = rowItems[rowItems.length - 1]
      const resultIndex = result.findIndex(item => item.key === lastItem.key)
      if (resultIndex !== -1) {
        result[resultIndex] = {
          ...result[resultIndex],
          span: result[resultIndex].span + remainingColumns,
          autoExpanded: true,
        }
      }
    }
  })
  
  return result
}

// 计算分页信息
export function calculatePagination(
  totalItems: number,
  itemsPerPage: number,
  currentPage: number = 1
): {
  totalPages: number
  startIndex: number
  endIndex: number
  hasNext: boolean
  hasPrev: boolean
} {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

// 计算缩放比例
export function calculateScale(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  mode: 'fit' | 'fill' | 'stretch' = 'fit'
): {
  scaleX: number
  scaleY: number
  scale: number
} {
  const scaleX = containerWidth / contentWidth
  const scaleY = containerHeight / contentHeight
  
  let scale: number
  
  switch (mode) {
    case 'fit':
      scale = Math.min(scaleX, scaleY)
      break
    case 'fill':
      scale = Math.max(scaleX, scaleY)
      break
    case 'stretch':
      scale = 1
      break
    default:
      scale = Math.min(scaleX, scaleY)
  }
  
  return { scaleX, scaleY, scale }
}

// 计算边界
export function calculateBounds(
  items: Array<{ x: number; y: number; width: number; height: number }>
): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  if (items.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }
  
  const minX = Math.min(...items.map(item => item.x))
  const minY = Math.min(...items.map(item => item.y))
  const maxX = Math.max(...items.map(item => item.x + item.width))
  const maxY = Math.max(...items.map(item => item.y + item.height))
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

// 限制数值范围
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// 线性插值
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

// 计算距离
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// 角度转弧度
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// 弧度转角度
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI)
}