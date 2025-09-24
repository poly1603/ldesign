/**
 * 数据管理器类
 * 负责管理Excel工作簿数据，包括读取、写入、导入导出等功能
 */

import * as XLSX from 'xlsx'
import type {
  Workbook,
  Worksheet,
  Cell,
  CellPosition,
  CellValueType
} from '../types/index.js'
import { EventEmitter } from './EventEmitter.js'

/**
 * 数据管理器类
 * 提供工作簿数据的增删改查功能
 */
export class DataManager extends EventEmitter {
  /** 工作簿数据 */
  private workbook: Workbook

  /**
   * 构造函数
   * @param initialData 初始工作簿数据
   */
  constructor(initialData: Workbook) {
    super()
    this.workbook = this.cloneWorkbook(initialData)
  }

  /**
   * 深度克隆工作簿数据
   * @param workbook 工作簿数据
   * @returns 克隆的工作簿数据
   */
  private cloneWorkbook(workbook: Workbook): Workbook {
    return JSON.parse(JSON.stringify(workbook))
  }

  /**
   * 生成单元格键名
   * @param position 单元格位置
   * @returns 单元格键名
   */
  private getCellKey(position: CellPosition): string {
    const columnName = this.numberToColumnName(position.column)
    return `${columnName}${position.row + 1}`
  }

  /**
   * 将数字转换为列名（A, B, C, ..., Z, AA, AB, ...）
   * @param num 列索引（从0开始）
   * @returns 列名
   */
  private numberToColumnName(num: number): string {
    let result = ''
    while (num >= 0) {
      result = String.fromCharCode(65 + (num % 26)) + result
      num = Math.floor(num / 26) - 1
    }
    return result
  }

  /**
   * 将列名转换为数字
   * @param columnName 列名
   * @returns 列索引（从0开始）
   */
  private columnNameToNumber(columnName: string): number {
    let result = 0
    for (let i = 0; i < columnName.length; i++) {
      result = result * 26 + (columnName.charCodeAt(i) - 64)
    }
    return result - 1
  }

  /**
   * 获取工作簿数据
   * @returns 工作簿数据
   */
  getWorkbook(): Workbook {
    return this.cloneWorkbook(this.workbook)
  }

  /**
   * 设置工作簿数据
   * @param workbook 工作簿数据
   */
  setWorkbook(workbook: Workbook): void {
    this.workbook = this.cloneWorkbook(workbook)
    this.emit('dataChange', { worksheetIndex: this.workbook.activeSheetIndex })
  }

  /**
   * 获取当前活动工作表
   * @returns 当前活动工作表
   */
  getActiveWorksheet(): Worksheet {
    return this.workbook.worksheets[this.workbook.activeSheetIndex]
  }

  /**
   * 设置活动工作表
   * @param index 工作表索引
   */
  setActiveWorksheet(index: number): void {
    if (index >= 0 && index < this.workbook.worksheets.length) {
      this.workbook.activeSheetIndex = index
      this.emit('worksheetChange', { worksheetIndex: index })
    }
  }

  /**
   * 获取指定工作表
   * @param index 工作表索引，默认为当前活动工作表
   * @returns 工作表
   */
  getWorksheet(index?: number): Worksheet {
    const worksheetIndex = index ?? this.workbook.activeSheetIndex
    return this.workbook.worksheets[worksheetIndex]
  }

  /**
   * 获取单元格值
   * @param position 单元格位置
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   * @returns 单元格值
   */
  getCellValue(position: CellPosition, worksheetIndex?: number): CellValueType {
    const cell = this.getCell(position, worksheetIndex)
    return cell?.value
  }

  /**
   * 设置单元格值
   * @param position 单元格位置
   * @param value 单元格值
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   */
  setCellValue(position: CellPosition, value: CellValueType, worksheetIndex?: number): void {
    const worksheet = this.getWorksheet(worksheetIndex)
    const cellKey = this.getCellKey(position)
    
    const oldValue = worksheet.cells[cellKey]?.value
    
    if (!worksheet.cells[cellKey]) {
      worksheet.cells[cellKey] = { value }
    } else {
      worksheet.cells[cellKey].value = value
    }

    // 更新工作簿修改时间
    if (this.workbook.properties) {
      this.workbook.properties.modified = new Date()
    }

    this.emit('dataChange', {
      position,
      oldValue,
      newValue: value,
      worksheetIndex: worksheetIndex ?? this.workbook.activeSheetIndex
    })
  }

  /**
   * 获取单元格对象
   * @param position 单元格位置
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   * @returns 单元格对象
   */
  getCell(position: CellPosition, worksheetIndex?: number): Cell | undefined {
    const worksheet = this.getWorksheet(worksheetIndex)
    const cellKey = this.getCellKey(position)
    return worksheet.cells[cellKey]
  }

  /**
   * 设置单元格对象
   * @param position 单元格位置
   * @param cell 单元格对象
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   */
  setCell(position: CellPosition, cell: Cell, worksheetIndex?: number): void {
    const worksheet = this.getWorksheet(worksheetIndex)
    const cellKey = this.getCellKey(position)
    
    const oldCell = worksheet.cells[cellKey]
    worksheet.cells[cellKey] = { ...cell }

    // 更新工作簿修改时间
    if (this.workbook.properties) {
      this.workbook.properties.modified = new Date()
    }

    this.emit('dataChange', {
      position,
      oldValue: oldCell?.value,
      newValue: cell.value,
      worksheetIndex: worksheetIndex ?? this.workbook.activeSheetIndex
    })
  }

  /**
   * 导出为Excel文件
   * @param filename 文件名
   */
  async exportToExcel(filename: string = 'workbook.xlsx'): Promise<void> {
    try {
      const wb = XLSX.utils.book_new()

      this.workbook.worksheets.forEach((worksheet, index) => {
        const ws = XLSX.utils.json_to_sheet([])
        
        // 转换单元格数据
        Object.entries(worksheet.cells).forEach(([cellKey, cell]) => {
          ws[cellKey] = {
            v: cell.value,
            t: this.getCellType(cell.value)
          }
        })

        // 设置工作表范围
        const range = this.calculateWorksheetRange(worksheet)
        ws['!ref'] = range

        XLSX.utils.book_append_sheet(wb, ws, worksheet.name)
      })

      // 下载文件
      XLSX.writeFile(wb, filename)
      
      this.emit('afterSave', { filename })
    } catch (error) {
      this.emit('error', { error: error as Error })
      throw error
    }
  }

  /**
   * 从Excel文件导入
   * @param file Excel文件
   * @returns 工作簿数据
   */
  async importFromExcel(file: File): Promise<Workbook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const wb = XLSX.read(data, { type: 'array' })
          
          const workbook: Workbook = {
            worksheets: [],
            activeSheetIndex: 0,
            properties: {
              title: file.name,
              created: new Date(),
              modified: new Date()
            }
          }

          wb.SheetNames.forEach((sheetName, index) => {
            const ws = wb.Sheets[sheetName]
            const worksheet: Worksheet = {
              name: sheetName,
              cells: {},
              rowCount: 100,
              columnCount: 26
            }

            // 转换单元格数据
            Object.entries(ws).forEach(([cellKey, cellData]: [string, any]) => {
              if (cellKey.startsWith('!')) return // 跳过元数据
              
              worksheet.cells[cellKey] = {
                value: cellData.v,
                type: this.xlsxTypeToOurType(cellData.t)
              }
            })

            workbook.worksheets.push(worksheet)
          })

          resolve(workbook)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 获取单元格类型
   * @param value 单元格值
   * @returns 单元格类型
   */
  private getCellType(value: CellValueType): string {
    if (typeof value === 'number') return 'n'
    if (typeof value === 'boolean') return 'b'
    if (value instanceof Date) return 'd'
    return 's'
  }

  /**
   * 转换XLSX类型到我们的类型
   * @param xlsxType XLSX类型
   * @returns 我们的类型
   */
  private xlsxTypeToOurType(xlsxType: string): 'text' | 'number' | 'boolean' | 'date' {
    switch (xlsxType) {
      case 'n': return 'number'
      case 'b': return 'boolean'
      case 'd': return 'date'
      default: return 'text'
    }
  }

  /**
   * 计算工作表范围
   * @param worksheet 工作表
   * @returns 范围字符串
   */
  private calculateWorksheetRange(worksheet: Worksheet): string {
    const cellKeys = Object.keys(worksheet.cells)
    if (cellKeys.length === 0) return 'A1:A1'

    let minRow = Infinity, maxRow = -Infinity
    let minCol = Infinity, maxCol = -Infinity

    cellKeys.forEach(cellKey => {
      const match = cellKey.match(/^([A-Z]+)(\d+)$/)
      if (match) {
        const col = this.columnNameToNumber(match[1])
        const row = parseInt(match[2]) - 1

        minRow = Math.min(minRow, row)
        maxRow = Math.max(maxRow, row)
        minCol = Math.min(minCol, col)
        maxCol = Math.max(maxCol, col)
      }
    })

    const startCell = `${this.numberToColumnName(minCol)}${minRow + 1}`
    const endCell = `${this.numberToColumnName(maxCol)}${maxRow + 1}`
    
    return `${startCell}:${endCell}`
  }
}
