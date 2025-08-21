// 数学计算工具函数

/**
 * 计算网格列数
 */
export function calculateColumns(
  containerWidth: number,
  minColumnWidth: number,
  maxColumns?: number,
): number {
  const columns = Math.floor(containerWidth / minColumnWidth)
  return maxColumns ? Math.min(columns, maxColumns) : Math.max(columns, 1)
}

/**
 * 计算列宽
 */
export function calculateColumnWidth(
  containerWidth: number,
  columns: number,
  gap: number = 0,
): number {
  const totalGap = (columns - 1) * gap
  return (containerWidth - totalGap) / columns
}

/**
 * 计算跨列宽度
 */
export function calculateSpanWidth(
  columnWidth: number,
  span: number,
  gap: number = 0,
): number {
  return columnWidth * span + gap * (span - 1)
}

/**
 * 解析跨列配置
 */
export function parseSpan(span: number | string, totalColumns: number): number {
  if (typeof span === 'number') {
    return Math.min(Math.max(span, 1), totalColumns)
  }

  if (typeof span === 'string') {
    if (span.endsWith('%')) {
      const percentage = Number.parseFloat(span) / 100
      return Math.max(Math.round(totalColumns * percentage), 1)
    }

    const parsed = Number.parseInt(span, 10)
    if (!isNaN(parsed)) {
      return Math.min(Math.max(parsed, 1), totalColumns)
    }
  }

  return 1
}

/**
 * 计算网格位置
 */
export function calculateGridPosition(
  index: number,
  columns: number,
  spans: number[],
): { row: number, column: number } {
  let currentRow = 0
  let currentColumn = 0

  for (let i = 0; i < index; i++) {
    const span = spans[i] || 1

    // 检查当前行是否有足够空间
    if (currentColumn + span > columns) {
      currentRow++
      currentColumn = 0
    }

    if (i === index - 1) {
      break
    }

    currentColumn += span

    // 如果到达行末，换行
    if (currentColumn >= columns) {
      currentRow++
      currentColumn = 0
    }
  }

  return { row: currentRow, column: currentColumn }
}

/**
 * 计算响应式断点
 */
export function getBreakpoint(width: number): string {
  if (width < 576)
    return 'xs'
  if (width < 768)
    return 'sm'
  if (width < 992)
    return 'md'
  if (width < 1200)
    return 'lg'
  return 'xl'
}

/**
 * 计算容器内可容纳的行数
 */
export function calculateVisibleRows(
  containerHeight: number,
  rowHeight: number,
  gap: number = 0,
): number {
  if (rowHeight <= 0)
    return 0
  return Math.floor((containerHeight + gap) / (rowHeight + gap))
}

/**
 * 计算元素在网格中的位置
 */
export function calculateElementPosition(
  row: number,
  column: number,
  columnWidth: number,
  rowHeight: number,
  horizontalGap: number = 0,
  verticalGap: number = 0,
): { x: number, y: number } {
  return {
    x: column * (columnWidth + horizontalGap),
    y: row * (rowHeight + verticalGap),
  }
}

/**
 * 计算元素尺寸
 */
export function calculateElementSize(
  span: number,
  columnWidth: number,
  rowHeight: number,
  horizontalGap: number = 0,
): { width: number, height: number } {
  return {
    width: calculateSpanWidth(columnWidth, span, horizontalGap),
    height: rowHeight,
  }
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

/**
 * 计算百分比
 */
export function percentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100
}

/**
 * 四舍五入到指定小数位
 */
export function round(value: number, decimals: number = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * 计算两点之间的距离
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * 计算角度（弧度转角度）
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * 计算角度（角度转弧度）
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 生成随机数
 */
export function random(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min
}

/**
 * 生成随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1))
}

/**
 * 检查数值是否在范围内
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 计算数组的平均值
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0)
    return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

/**
 * 计算数组的总和
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0)
}

/**
 * 查找数组中的最大值
 */
export function max(numbers: number[]): number {
  return Math.max(...numbers)
}

/**
 * 查找数组中的最小值
 */
export function min(numbers: number[]): number {
  return Math.min(...numbers)
}

/**
 * 计算网格布局的总高度
 */
export function calculateGridHeight(
  rows: number,
  rowHeight: number,
  verticalGap: number = 0,
): number {
  if (rows <= 0)
    return 0
  return rows * rowHeight + (rows - 1) * verticalGap
}

/**
 * 计算网格布局的总宽度
 */
export function calculateGridWidth(
  columns: number,
  columnWidth: number,
  horizontalGap: number = 0,
): number {
  if (columns <= 0)
    return 0
  return columns * columnWidth + (columns - 1) * horizontalGap
}

/**
 * 解析CSS尺寸值
 */
export function parseCssSize(value: string | number): {
  value: number
  unit: string
} {
  if (typeof value === 'number') {
    return { value, unit: 'px' }
  }

  const match = value.match(/^(\d+(?:\.\d+)?)(px|%|em|rem|vh|vw)?$/)
  if (match) {
    return {
      value: Number.parseFloat(match[1]),
      unit: match[2] || 'px',
    }
  }

  return { value: 0, unit: 'px' }
}

/**
 * 转换CSS尺寸值为像素
 */
export function convertToPixels(
  value: string | number,
  containerSize?: number,
  fontSize?: number,
): number {
  const { value: numValue, unit } = parseCssSize(value)

  switch (unit) {
    case 'px':
      return numValue
    case '%':
      return containerSize ? (numValue / 100) * containerSize : 0
    case 'em':
    case 'rem':
      return fontSize ? numValue * fontSize : numValue * 16
    case 'vh':
      return (numValue / 100) * window.innerHeight
    case 'vw':
      return (numValue / 100) * window.innerWidth
    default:
      return numValue
  }
}
