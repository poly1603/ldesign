/**
 * @ldesign/excel-editor
 * 基于Web的现代化Excel表格编辑器插件
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导出核心类
export { ExcelEditor } from './core/ExcelEditor.js'
export { EventEmitter } from './core/EventEmitter.js'
export { DataManager } from './core/DataManager.js'
export { RenderEngine } from './core/RenderEngine.js'

// 导出类型定义
export type {
  // 核心接口
  ExcelEditorOptions,
  Workbook,
  Worksheet,
  Cell,
  CellStyle,
  BorderStyle,
  WorkbookProperties,
  
  // 位置和范围
  CellPosition,
  CellRange,
  
  // 数据类型
  CellValueType,
  
  // 配置选项
  VirtualScrollOptions,
  
  // 事件相关
  ExcelEventType,
  ExcelEventData,
  ExcelEventListener
} from './types/index.js'

// 导出工具函数
export * from './utils/index.js'

// 导出样式
import './styles/index.less'

/**
 * 创建Excel编辑器实例的便捷函数
 * @param options 配置选项
 * @returns Excel编辑器实例
 * 
 * @example
 * ```typescript
 * import { createExcelEditor } from '@ldesign/excel-editor'
 * 
 * const editor = createExcelEditor({
 *   container: '#excel-container',
 *   data: {
 *     worksheets: [{
 *       name: 'Sheet1',
 *       cells: {
 *         'A1': { value: 'Hello' },
 *         'B1': { value: 'World' }
 *       },
 *       rowCount: 100,
 *       columnCount: 26
 *     }],
 *     activeSheetIndex: 0
 *   }
 * })
 * 
 * // 监听单元格变化
 * editor.on('cellChange', (data) => {
 *   console.log('Cell changed:', data)
 * })
 * ```
 */
export function createExcelEditor(options: ExcelEditorOptions): ExcelEditor {
  return new ExcelEditor(options)
}

/**
 * 创建空的工作簿数据
 * @param worksheetName 工作表名称，默认为'Sheet1'
 * @param rowCount 行数，默认为100
 * @param columnCount 列数，默认为26
 * @returns 空的工作簿数据
 * 
 * @example
 * ```typescript
 * import { createEmptyWorkbook } from '@ldesign/excel-editor'
 * 
 * const workbook = createEmptyWorkbook('My Sheet', 200, 50)
 * ```
 */
export function createEmptyWorkbook(
  worksheetName: string = 'Sheet1',
  rowCount: number = 100,
  columnCount: number = 26
): Workbook {
  const worksheet: Worksheet = {
    name: worksheetName,
    cells: {},
    rowCount,
    columnCount
  }

  return {
    worksheets: [worksheet],
    activeSheetIndex: 0,
    properties: {
      title: 'New Workbook',
      created: new Date(),
      modified: new Date()
    }
  }
}

/**
 * 将列索引转换为列名（A, B, C, ..., Z, AA, AB, ...）
 * @param columnIndex 列索引（从0开始）
 * @returns 列名
 * 
 * @example
 * ```typescript
 * import { columnIndexToName } from '@ldesign/excel-editor'
 * 
 * console.log(columnIndexToName(0))  // 'A'
 * console.log(columnIndexToName(25)) // 'Z'
 * console.log(columnIndexToName(26)) // 'AA'
 * ```
 */
export function columnIndexToName(columnIndex: number): string {
  let result = ''
  while (columnIndex >= 0) {
    result = String.fromCharCode(65 + (columnIndex % 26)) + result
    columnIndex = Math.floor(columnIndex / 26) - 1
  }
  return result
}

/**
 * 将列名转换为列索引
 * @param columnName 列名
 * @returns 列索引（从0开始）
 * 
 * @example
 * ```typescript
 * import { columnNameToIndex } from '@ldesign/excel-editor'
 * 
 * console.log(columnNameToIndex('A'))  // 0
 * console.log(columnNameToIndex('Z'))  // 25
 * console.log(columnNameToIndex('AA')) // 26
 * ```
 */
export function columnNameToIndex(columnName: string): number {
  let result = 0
  for (let i = 0; i < columnName.length; i++) {
    result = result * 26 + (columnName.charCodeAt(i) - 64)
  }
  return result - 1
}

/**
 * 生成单元格引用名称（如A1, B2等）
 * @param position 单元格位置
 * @returns 单元格引用名称
 * 
 * @example
 * ```typescript
 * import { getCellReference } from '@ldesign/excel-editor'
 * 
 * console.log(getCellReference({ row: 0, column: 0 })) // 'A1'
 * console.log(getCellReference({ row: 1, column: 1 })) // 'B2'
 * ```
 */
export function getCellReference(position: CellPosition): string {
  return `${columnIndexToName(position.column)}${position.row + 1}`
}

/**
 * 解析单元格引用名称为位置
 * @param reference 单元格引用名称
 * @returns 单元格位置
 * 
 * @example
 * ```typescript
 * import { parseCellReference } from '@ldesign/excel-editor'
 * 
 * console.log(parseCellReference('A1')) // { row: 0, column: 0 }
 * console.log(parseCellReference('B2')) // { row: 1, column: 1 }
 * ```
 */
export function parseCellReference(reference: string): CellPosition | null {
  const match = reference.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null

  const column = columnNameToIndex(match[1])
  const row = parseInt(match[2]) - 1

  return { row, column }
}

// 默认导出主类
export default ExcelEditor
