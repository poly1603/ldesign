/**
 * 渲染引擎类
 * 负责Excel表格的DOM渲染和用户交互
 */

import type {
  ExcelEditorOptions,
  CellPosition,
  CellRange,
  Cell,
  Worksheet
} from '../types/index.js'
import { EventEmitter } from './EventEmitter.js'

/**
 * 渲染引擎类
 * 处理表格的视觉渲染和用户交互
 */
export class RenderEngine extends EventEmitter {
  /** 容器元素 */
  private container: HTMLElement
  
  /** 配置选项 */
  private options: Required<ExcelEditorOptions>
  
  /** 表格容器 */
  private tableContainer: HTMLElement | null = null
  
  /** 当前选中的单元格位置 */
  private selectedCell: CellPosition | null = null
  
  /** 当前选中的范围 */
  private selectedRange: CellRange | null = null
  
  /** 是否正在编辑 */
  private isEditing = false
  
  /** 编辑输入框 */
  private editInput: HTMLInputElement | null = null

  /**
   * 构造函数
   * @param container 容器元素
   * @param options 配置选项
   */
  constructor(container: HTMLElement, options: Required<ExcelEditorOptions>) {
    super()
    this.container = container
    this.options = options
    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    this.container.className = `ldesign-excel-editor ${this.options.theme}`
    this.container.innerHTML = ''
    
    // 创建表格容器
    this.tableContainer = document.createElement('div')
    this.tableContainer.className = 'excel-table-container'
    this.container.appendChild(this.tableContainer)
    
    // 绑定事件
    this.bindEvents()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.tableContainer) return

    // 单元格点击事件
    this.tableContainer.addEventListener('click', this.handleCellClick.bind(this))
    
    // 双击编辑事件
    this.tableContainer.addEventListener('dblclick', this.handleCellDoubleClick.bind(this))
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    
    // 阻止右键菜单
    this.tableContainer.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  /**
   * 处理单元格点击
   * @param event 点击事件
   */
  private handleCellClick(event: Event): void {
    const target = event.target as HTMLElement
    const cellElement = target.closest('.excel-cell') as HTMLElement
    
    if (!cellElement) return

    const position = this.getCellPositionFromElement(cellElement)
    if (position) {
      this.selectCell(position)
    }
  }

  /**
   * 处理单元格双击
   * @param event 双击事件
   */
  private handleCellDoubleClick(event: Event): void {
    const target = event.target as HTMLElement
    const cellElement = target.closest('.excel-cell') as HTMLElement
    
    if (!cellElement || this.options.readonly) return

    const position = this.getCellPositionFromElement(cellElement)
    if (position) {
      this.startEditing(position, cellElement)
    }
  }

  /**
   * 处理键盘事件
   * @param event 键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.selectedCell) return

    switch (event.key) {
      case 'Enter':
        if (this.isEditing) {
          this.finishEditing()
        } else if (!this.options.readonly) {
          this.startEditing(this.selectedCell)
        }
        break
        
      case 'Escape':
        if (this.isEditing) {
          this.cancelEditing()
        }
        break
        
      case 'ArrowUp':
        event.preventDefault()
        this.moveSelection(0, -1)
        break
        
      case 'ArrowDown':
        event.preventDefault()
        this.moveSelection(0, 1)
        break
        
      case 'ArrowLeft':
        event.preventDefault()
        this.moveSelection(-1, 0)
        break
        
      case 'ArrowRight':
        event.preventDefault()
        this.moveSelection(1, 0)
        break
        
      case 'Delete':
        if (!this.options.readonly && !this.isEditing) {
          this.emit('cellEdit', {
            position: this.selectedCell,
            oldValue: this.getCellValue(this.selectedCell),
            newValue: null
          })
        }
        break
        
      default:
        // 如果是可打印字符且不在编辑状态，开始编辑
        if (!this.isEditing && !this.options.readonly && event.key.length === 1) {
          this.startEditing(this.selectedCell, undefined, event.key)
        }
        break
    }
  }

  /**
   * 从元素获取单元格位置
   * @param element 单元格元素
   * @returns 单元格位置
   */
  private getCellPositionFromElement(element: HTMLElement): CellPosition | null {
    const row = parseInt(element.dataset.row || '0')
    const column = parseInt(element.dataset.column || '0')
    
    if (isNaN(row) || isNaN(column)) return null
    
    return { row, column }
  }

  /**
   * 选中单元格
   * @param position 单元格位置
   */
  private selectCell(position: CellPosition): void {
    // 清除之前的选中状态
    this.clearSelection()
    
    this.selectedCell = position
    
    // 添加选中样式
    const cellElement = this.getCellElement(position)
    if (cellElement) {
      cellElement.classList.add('selected')
    }
    
    this.emit('cellSelect', { position })
  }

  /**
   * 清除选中状态
   */
  private clearSelection(): void {
    const selectedElements = this.tableContainer?.querySelectorAll('.excel-cell.selected')
    selectedElements?.forEach(element => {
      element.classList.remove('selected')
    })
    
    this.selectedCell = null
    this.selectedRange = null
  }

  /**
   * 移动选中位置
   * @param deltaColumn 列偏移
   * @param deltaRow 行偏移
   */
  private moveSelection(deltaColumn: number, deltaRow: number): void {
    if (!this.selectedCell) return

    const newPosition: CellPosition = {
      row: Math.max(0, this.selectedCell.row + deltaRow),
      column: Math.max(0, this.selectedCell.column + deltaColumn)
    }

    this.selectCell(newPosition)
  }

  /**
   * 开始编辑单元格
   * @param position 单元格位置
   * @param cellElement 单元格元素
   * @param initialValue 初始值
   */
  private startEditing(position: CellPosition, cellElement?: HTMLElement, initialValue?: string): void {
    if (this.isEditing || this.options.readonly) return

    const element = cellElement || this.getCellElement(position)
    if (!element) return

    this.isEditing = true
    
    // 创建编辑输入框
    this.editInput = document.createElement('input')
    this.editInput.type = 'text'
    this.editInput.className = 'excel-cell-editor'
    this.editInput.value = initialValue || this.getCellDisplayValue(position) || ''
    
    // 设置输入框样式和位置
    const rect = element.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()
    
    this.editInput.style.position = 'absolute'
    this.editInput.style.left = `${rect.left - containerRect.left}px`
    this.editInput.style.top = `${rect.top - containerRect.top}px`
    this.editInput.style.width = `${rect.width}px`
    this.editInput.style.height = `${rect.height}px`
    this.editInput.style.zIndex = '1000'
    
    // 添加到容器
    this.container.appendChild(this.editInput)
    
    // 聚焦并选中文本
    this.editInput.focus()
    this.editInput.select()
    
    // 绑定编辑事件
    this.editInput.addEventListener('blur', this.finishEditing.bind(this))
    this.editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishEditing()
      } else if (e.key === 'Escape') {
        this.cancelEditing()
      }
      e.stopPropagation()
    })
  }

  /**
   * 完成编辑
   */
  private finishEditing(): void {
    if (!this.isEditing || !this.editInput || !this.selectedCell) return

    const newValue = this.editInput.value
    const oldValue = this.getCellValue(this.selectedCell)
    
    // 移除编辑输入框
    this.editInput.remove()
    this.editInput = null
    this.isEditing = false
    
    // 如果值有变化，触发编辑事件
    if (newValue !== oldValue) {
      this.emit('cellEdit', {
        position: this.selectedCell,
        oldValue,
        newValue
      })
    }
  }

  /**
   * 取消编辑
   */
  private cancelEditing(): void {
    if (!this.isEditing || !this.editInput) return

    this.editInput.remove()
    this.editInput = null
    this.isEditing = false
  }

  /**
   * 获取单元格元素
   * @param position 单元格位置
   * @returns 单元格元素
   */
  private getCellElement(position: CellPosition): HTMLElement | null {
    return this.tableContainer?.querySelector(
      `.excel-cell[data-row="${position.row}"][data-column="${position.column}"]`
    ) as HTMLElement || null
  }

  /**
   * 获取单元格值（用于显示）
   * @param position 单元格位置
   * @returns 单元格显示值
   */
  private getCellDisplayValue(position: CellPosition): string {
    // 这里应该从数据管理器获取值，暂时返回空字符串
    return ''
  }

  /**
   * 获取单元格值
   * @param position 单元格位置
   * @returns 单元格值
   */
  private getCellValue(position: CellPosition): any {
    // 这里应该从数据管理器获取值，暂时返回null
    return null
  }

  /**
   * 渲染表格
   */
  render(): void {
    if (!this.tableContainer) return

    // 清空容器
    this.tableContainer.innerHTML = ''
    
    // 创建表格结构
    this.createTable()
  }

  /**
   * 创建表格
   */
  private createTable(): void {
    if (!this.tableContainer) return

    const table = document.createElement('table')
    table.className = 'excel-table'
    
    // 创建表头
    if (this.options.showColumnHeaders) {
      this.createTableHeader(table)
    }
    
    // 创建表体
    this.createTableBody(table)
    
    this.tableContainer.appendChild(table)
  }

  /**
   * 创建表头
   * @param table 表格元素
   */
  private createTableHeader(table: HTMLTableElement): void {
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    
    // 行号列头
    if (this.options.showRowNumbers) {
      const th = document.createElement('th')
      th.className = 'excel-row-header'
      headerRow.appendChild(th)
    }
    
    // 列头
    for (let col = 0; col < 26; col++) {
      const th = document.createElement('th')
      th.className = 'excel-column-header'
      th.textContent = this.numberToColumnName(col)
      headerRow.appendChild(th)
    }
    
    thead.appendChild(headerRow)
    table.appendChild(thead)
  }

  /**
   * 创建表体
   * @param table 表格元素
   */
  private createTableBody(table: HTMLTableElement): void {
    const tbody = document.createElement('tbody')
    
    for (let row = 0; row < 100; row++) {
      const tr = document.createElement('tr')
      
      // 行号
      if (this.options.showRowNumbers) {
        const th = document.createElement('th')
        th.className = 'excel-row-number'
        th.textContent = (row + 1).toString()
        tr.appendChild(th)
      }
      
      // 单元格
      for (let col = 0; col < 26; col++) {
        const td = document.createElement('td')
        td.className = 'excel-cell'
        td.dataset.row = row.toString()
        td.dataset.column = col.toString()
        
        // 这里应该从数据管理器获取单元格数据
        td.textContent = ''
        
        tr.appendChild(td)
      }
      
      tbody.appendChild(tr)
    }
    
    table.appendChild(tbody)
  }

  /**
   * 将数字转换为列名
   * @param num 列索引
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
   * 销毁渲染引擎
   */
  destroy(): void {
    this.cancelEditing()
    this.clearSelection()
    
    if (this.tableContainer) {
      this.tableContainer.innerHTML = ''
    }
    
    this.removeAllListeners()
  }
}
