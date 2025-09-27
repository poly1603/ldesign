import { Spreadsheet } from 'x-spreadsheet'
import 'x-spreadsheet/dist/x-spreadsheet.css'
import * as XLSX from 'xlsx'
import {
  IDocumentViewer,
  DocumentInfo,
  DocumentContent,
  DocumentType,
  DocumentViewerError,
  ErrorCode,
  CallbackConfig
} from '../types'
import { readFileAsArrayBuffer, fetchFile } from '../utils'

/**
 * Excel 文档查看器选项
 */
interface ExcelViewerOptions {
  container: HTMLElement
  editable?: boolean
  callbacks?: CallbackConfig
}

/**
 * Excel 文档查看器
 * 使用 x-spreadsheet 和 xlsx 处理 Excel 文档
 */
export class ExcelViewer implements IDocumentViewer {
  private container: HTMLElement
  private options: ExcelViewerOptions
  private documentInfo: DocumentInfo | null = null
  private documentContent: DocumentContent | null = null
  private spreadsheet: Spreadsheet | null = null
  private workbook: XLSX.WorkBook | null = null
  private isEditable: boolean = false

  constructor(options: ExcelViewerOptions) {
    this.container = options.container
    this.options = options
    this.isEditable = options.editable || false
    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    this.container.classList.add('ldesign-excel-viewer')
    this.container.innerHTML = `
      <div class="excel-viewer-toolbar">
        <select class="sheet-selector" style="margin-right: 10px;">
          <option value="">选择工作表</option>
        </select>
        <button class="add-sheet-btn" style="display: ${this.isEditable ? 'inline-block' : 'none'}">添加工作表</button>
      </div>
      <div class="excel-viewer-content"></div>
    `

    this.bindToolbarEvents()
  }

  /**
   * 绑定工具栏事件
   */
  private bindToolbarEvents(): void {
    const sheetSelector = this.container.querySelector('.sheet-selector') as HTMLSelectElement
    const addSheetBtn = this.container.querySelector('.add-sheet-btn') as HTMLButtonElement

    if (sheetSelector) {
      sheetSelector.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement
        this.switchSheet(target.value)
      })
    }

    if (addSheetBtn) {
      addSheetBtn.addEventListener('click', () => {
        this.addSheet()
      })
    }
  }

  /**
   * 加载文档
   */
  async loadDocument(file: File | string | ArrayBuffer): Promise<void> {
    try {
      let arrayBuffer: ArrayBuffer
      let fileName: string = 'document.xlsx'
      let fileSize: number = 0
      let lastModified: Date = new Date()

      // 处理不同类型的输入
      if (file instanceof File) {
        arrayBuffer = await readFileAsArrayBuffer(file)
        fileName = file.name
        fileSize = file.size
        lastModified = new Date(file.lastModified)
      } else if (typeof file === 'string') {
        arrayBuffer = await fetchFile(file)
        fileName = file.split('/').pop() || 'document.xlsx'
        fileSize = arrayBuffer.byteLength
      } else {
        arrayBuffer = file
        fileSize = arrayBuffer.byteLength
      }

      // 使用 XLSX 解析工作簿
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // 创建文档信息
      this.documentInfo = {
        type: DocumentType.EXCEL,
        name: fileName,
        size: fileSize,
        lastModified,
        pageCount: this.workbook.SheetNames.length
      }

      // 转换为 x-spreadsheet 格式
      const spreadsheetData = this.convertWorkbookToSpreadsheetData(this.workbook)

      // 创建文档内容
      this.documentContent = {
        raw: arrayBuffer,
        html: this.generateHtmlFromWorkbook(this.workbook),
        text: this.extractTextFromWorkbook(this.workbook),
        metadata: {
          sheetNames: this.workbook.SheetNames,
          sheetCount: this.workbook.SheetNames.length
        }
      }

      // 更新工作表选择器
      this.updateSheetSelector()

      // 初始化 x-spreadsheet
      this.initializeSpreadsheet(spreadsheetData)

    } catch (error) {
      const docError = new DocumentViewerError(
        'Failed to load Excel document',
        ErrorCode.LOAD_FAILED,
        error as Error
      )
      this.options.callbacks?.onError?.(docError)
      throw docError
    }
  }

  /**
   * 初始化电子表格
   */
  private initializeSpreadsheet(data: any): void {
    const contentElement = this.container.querySelector('.excel-viewer-content') as HTMLElement
    if (!contentElement) return

    // 清空容器
    contentElement.innerHTML = ''

    // 创建 x-spreadsheet 实例
    this.spreadsheet = new Spreadsheet(contentElement, {
      mode: this.isEditable ? 'edit' : 'read',
      showToolbar: this.isEditable,
      showGrid: true,
      showContextmenu: this.isEditable,
      view: {
        height: () => contentElement.clientHeight - 40,
        width: () => contentElement.clientWidth
      }
    })

    // 加载数据
    if (data && data.length > 0) {
      this.spreadsheet.loadData(data[0])
    }

    // 绑定变化事件
    if (this.isEditable) {
      this.bindSpreadsheetEvents()
    }
  }

  /**
   * 绑定电子表格事件
   */
  private bindSpreadsheetEvents(): void {
    if (!this.spreadsheet) return

    // 监听单元格变化
    this.spreadsheet.on('cell-selected', (cell: any) => {
      // 可以在这里处理单元格选择事件
    })

    // 监听数据变化
    this.spreadsheet.on('cell-edited', (text: string, ri: number, ci: number) => {
      this.updateDocumentContent()
      this.options.callbacks?.onChange?.(this.getContent())
    })
  }

  /**
   * 更新文档内容
   */
  private updateDocumentContent(): void {
    if (!this.spreadsheet || !this.documentContent) return

    const data = this.spreadsheet.getData()
    this.documentContent = {
      ...this.documentContent,
      raw: data,
      html: this.generateHtmlFromSpreadsheetData(data),
      text: this.extractTextFromSpreadsheetData(data)
    }
  }

  /**
   * 更新工作表选择器
   */
  private updateSheetSelector(): void {
    const sheetSelector = this.container.querySelector('.sheet-selector') as HTMLSelectElement
    if (!sheetSelector || !this.workbook) return

    sheetSelector.innerHTML = '<option value="">选择工作表</option>'
    
    this.workbook.SheetNames.forEach((sheetName, index) => {
      const option = document.createElement('option')
      option.value = sheetName
      option.textContent = sheetName
      if (index === 0) option.selected = true
      sheetSelector.appendChild(option)
    })
  }

  /**
   * 切换工作表
   */
  private switchSheet(sheetName: string): void {
    if (!this.workbook || !sheetName) return

    const worksheet = this.workbook.Sheets[sheetName]
    if (!worksheet) return

    const spreadsheetData = this.convertWorksheetToSpreadsheetData(worksheet)
    
    if (this.spreadsheet) {
      this.spreadsheet.loadData(spreadsheetData)
    }
  }

  /**
   * 添加工作表
   */
  private addSheet(): void {
    if (!this.isEditable || !this.spreadsheet) return

    const newSheetName = `Sheet${Date.now()}`
    // 这里可以实现添加新工作表的逻辑
    // x-spreadsheet 的具体 API 可能需要查阅文档
  }

  /**
   * 转换工作簿为 x-spreadsheet 数据格式
   */
  private convertWorkbookToSpreadsheetData(workbook: XLSX.WorkBook): any[] {
    return workbook.SheetNames.map(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      return this.convertWorksheetToSpreadsheetData(worksheet)
    })
  }

  /**
   * 转换工作表为 x-spreadsheet 数据格式
   */
  private convertWorksheetToSpreadsheetData(worksheet: XLSX.WorkSheet): any {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
    
    const rows: any = {}
    jsonData.forEach((row: any[], rowIndex: number) => {
      const cells: any = {}
      row.forEach((cellValue: any, colIndex: number) => {
        if (cellValue !== '') {
          cells[colIndex] = { text: cellValue.toString() }
        }
      })
      if (Object.keys(cells).length > 0) {
        rows[rowIndex] = { cells }
      }
    })

    return {
      name: 'Sheet1',
      rows,
      cols: {},
      merges: []
    }
  }

  /**
   * 从工作簿生成 HTML
   */
  private generateHtmlFromWorkbook(workbook: XLSX.WorkBook): string {
    let html = '<div class="excel-html-export">'
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      html += `<h3>${sheetName}</h3>`
      html += XLSX.utils.sheet_to_html(worksheet)
    })
    
    html += '</div>'
    return html
  }

  /**
   * 从工作簿提取文本
   */
  private extractTextFromWorkbook(workbook: XLSX.WorkBook): string {
    let text = ''
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      text += `${sheetName}:\n`
      text += XLSX.utils.sheet_to_csv(worksheet) + '\n\n'
    })
    
    return text
  }

  /**
   * 从电子表格数据生成 HTML
   */
  private generateHtmlFromSpreadsheetData(data: any): string {
    // 简化实现，实际可能需要更复杂的转换
    return '<div>Spreadsheet data converted to HTML</div>'
  }

  /**
   * 从电子表格数据提取文本
   */
  private extractTextFromSpreadsheetData(data: any): string {
    // 简化实现，实际可能需要更复杂的转换
    return 'Spreadsheet data converted to text'
  }

  /**
   * 获取文档内容
   */
  getContent(): DocumentContent | null {
    if (this.isEditable && this.spreadsheet) {
      this.updateDocumentContent()
    }
    return this.documentContent
  }

  /**
   * 保存文档
   */
  async save(): Promise<Blob> {
    if (!this.documentContent || !this.spreadsheet) {
      throw new DocumentViewerError('No document content to save', ErrorCode.SAVE_FAILED)
    }

    try {
      // 获取当前数据
      const data = this.spreadsheet.getData()
      
      // 转换为 XLSX 格式
      const worksheet = XLSX.utils.aoa_to_sheet([])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      // 生成 Excel 文件
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
    } catch (error) {
      throw new DocumentViewerError('Failed to save Excel document', ErrorCode.SAVE_FAILED, error as Error)
    }
  }

  /**
   * 设置编辑模式
   */
  setEditable(editable: boolean): void {
    this.isEditable = editable
    
    // 重新初始化电子表格以应用新的编辑模式
    if (this.documentContent && this.workbook) {
      const spreadsheetData = this.convertWorkbookToSpreadsheetData(this.workbook)
      this.initializeSpreadsheet(spreadsheetData)
    }

    // 显示/隐藏添加工作表按钮
    const addSheetBtn = this.container.querySelector('.add-sheet-btn') as HTMLButtonElement
    if (addSheetBtn) {
      addSheetBtn.style.display = editable ? 'inline-block' : 'none'
    }
  }

  /**
   * 获取文档信息
   */
  getDocumentInfo(): DocumentInfo | null {
    return this.documentInfo
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.spreadsheet) {
      // x-spreadsheet 可能有 destroy 方法，需要查阅文档
      this.spreadsheet = null
    }
    
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-excel-viewer')
    this.documentInfo = null
    this.documentContent = null
    this.workbook = null
  }
}
