/**
 * @ldesign/form - Layout Calculator
 * 布局计算器
 */

import type { FieldSpan } from '../../utils/types'
import { isNumber, isString } from '../../utils/helpers'
import { MIN_FIELD_WIDTH } from '../../utils/constants'

/**
 * 计算列数
 * @param containerWidth 容器宽度
 * @param spanWidth 列宽
 * @param maxSpan 最大列数
 * @param minSpan 最小列数
 */
export function calculateColumns(
  containerWidth: number,
  spanWidth: number,
  maxSpan: number,
  minSpan: number
): number {
  if (containerWidth <= 0 || spanWidth <= 0) {
    return minSpan
  }

  // 根据容器宽度和列宽计算可容纳的列数
  let columns = Math.floor(containerWidth / spanWidth)

  // 应用最大最小限制
  columns = Math.max(minSpan, Math.min(maxSpan, columns))

  return columns
}

/**
 * 解析字段 span 值
 * @param span 字段 span 配置
 * @param totalColumns 总列数
 */
export function parseFieldSpan(span: FieldSpan | undefined, totalColumns: number): number {
  if (span === undefined || span === null) {
    return 1
  }

  // 数字类型
  if (isNumber(span)) {
    // -1 表示占满整行
    if (span === -1) {
      return totalColumns
    }
    return Math.max(1, Math.min(totalColumns, Math.floor(span)))
  }

  // 字符串类型
  if (isString(span)) {
    // 百分比
    if (span.endsWith('%')) {
      const percentage = parseInt(span, 10)
      if (!isNaN(percentage)) {
        const calculatedSpan = Math.floor((percentage / 100) * totalColumns)
        return Math.max(1, Math.min(totalColumns, calculatedSpan))
      }
    }

    // 数字字符串
    const numSpan = parseInt(span, 10)
    if (!isNaN(numSpan)) {
      if (numSpan === -1) {
        return totalColumns
      }
      return Math.max(1, Math.min(totalColumns, numSpan))
    }
  }

  return 1
}

/**
 * 计算字段布局信息
 * @param fields 字段列表
 * @param totalColumns 总列数
 */
export function calculateFieldLayouts(
  fields: Array<{ name: string; span?: FieldSpan; visible?: boolean }>,
  totalColumns: number
): Array<{
  name: string
  span: number
  row: number
  column: number
  visible: boolean
}> {
  const layouts: Array<{
    name: string
    span: number
    row: number
    column: number
    visible: boolean
  }> = []

  let currentRow = 0
  let currentColumn = 0

  fields.forEach(field => {
    const visible = field.visible !== false
    const span = parseFieldSpan(field.span, totalColumns)

    // 如果当前行剩余空间不足，换行
    if (currentColumn + span > totalColumns && currentColumn > 0) {
      currentRow++
      currentColumn = 0
    }

    layouts.push({
      name: field.name,
      span,
      row: currentRow,
      column: currentColumn,
      visible
    })

    // 更新当前列位置
    currentColumn += span

    // 如果当前行已满，换行
    if (currentColumn >= totalColumns) {
      currentRow++
      currentColumn = 0
    }
  })

  return layouts
}

/**
 * 计算按钮组位置
 * @param fieldCount 字段数量
 * @param totalColumns 总列数
 * @param buttonSpan 按钮占列数
 * @param buttonPosition 按钮位置模式
 */
export function calculateButtonPosition(
  fieldCount: number,
  totalColumns: number,
  buttonSpan: number,
  buttonPosition: 'inline' | 'block'
): {
  row: number
  column: number
  span: number
} {
  // block 模式：按钮独占一行
  if (buttonPosition === 'block') {
    const row = Math.ceil(fieldCount / totalColumns)
    return {
      row,
      column: 0,
      span: totalColumns
    }
  }

  // inline 模式：按钮在最后一个字段的同一行
  const lastFieldRow = Math.floor((fieldCount - 1) / totalColumns)
  const lastFieldColumn = (fieldCount - 1) % totalColumns + 1
  const remainingColumns = totalColumns - lastFieldColumn

  // 如果剩余空间足够，放在同一行
  if (remainingColumns >= buttonSpan) {
    return {
      row: lastFieldRow,
      column: lastFieldColumn,
      span: buttonSpan
    }
  }

  // 否则换行
  return {
    row: lastFieldRow + 1,
    column: 0,
    span: buttonSpan
  }
}

/**
 * 计算标题宽度
 * @param labels 标签文本数组（按列分组）
 * @param fontSize 字体大小
 * @param padding 内边距
 */
export function calculateLabelWidth(
  labels: string[],
  fontSize = 14,
  padding = 8
): number {
  if (labels.length === 0) {
    return 0
  }

  // 简单估算：中文字符宽度约为字号大小，英文字符约为字号的一半
  const maxLength = Math.max(
    ...labels.map(label => {
      let width = 0
      for (let i = 0; i < label.length; i++) {
        const char = label.charCodeAt(i)
        // 中文字符范围
        if (char >= 0x4e00 && char <= 0x9fa5) {
          width += fontSize
        } else {
          width += fontSize * 0.6
        }
      }
      return width
    })
  )

  // 加上内边距和一些额外空间
  return Math.ceil(maxLength + padding * 2 + 16)
}

/**
 * 计算按列的标题宽度
 * @param fieldLayouts 字段布局信息
 * @param labels 标签文本映射
 * @param fontSize 字体大小
 * @param padding 内边距
 */
export function calculateLabelWidthByColumn(
  fieldLayouts: Array<{
    name: string
    column: number
    visible: boolean
  }>,
  labels: Record<string, string>,
  fontSize = 14,
  padding = 8
): number[] {
  // 按列分组
  const columnGroups: Record<number, string[]> = {}

  fieldLayouts.forEach(layout => {
    if (!layout.visible) return

    const column = layout.column
    const label = labels[layout.name] || ''

    if (!columnGroups[column]) {
      columnGroups[column] = []
    }
    columnGroups[column].push(label)
  })

  // 计算每列的最大宽度
  const widths: number[] = []
  Object.keys(columnGroups).forEach(col => {
    const colLabels = columnGroups[Number(col)]
    widths[Number(col)] = calculateLabelWidth(colLabels, fontSize, padding)
  })

  return widths
}

/**
 * 验证最小宽度
 * @param fieldWidth 字段宽度
 * @param minWidth 最小宽度
 */
export function validateMinWidth(fieldWidth: number, minWidth = MIN_FIELD_WIDTH): boolean {
  return fieldWidth >= minWidth
}

/**
 * 计算间距
 * @param space 间距配置（px或css变量）
 * @param defaultValue 默认值
 */
export function calculateSpacing(space: number | string | undefined, defaultValue = 16): number | string {
  if (space === undefined) {
    return defaultValue
  }

  if (isNumber(space)) {
    return space
  }

  if (isString(space)) {
    // CSS 变量
    if (space.startsWith('var(')) {
      return space
    }

    // 数字字符串
    const num = parseInt(space, 10)
    if (!isNaN(num)) {
      return num
    }
  }

  return defaultValue
}




