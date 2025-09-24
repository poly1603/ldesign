/**
 * Excel编辑器核心类
 * 提供完整的Excel表格编辑功能
 */

import type {
  ExcelEditorOptions,
  Workbook,
  Worksheet,
  Cell,
  CellPosition,
  CellRange,
  CellValueType,
  ExcelEventType,
  ExcelEventListener
} from '../types/index.js'
import { EventEmitter } from './EventEmitter.js'
import { RenderEngine } from './RenderEngine.js'
import { DataManager } from './DataManager.js'

/**
 * Excel编辑器主类
 * 提供简单易用的API接口来创建和操作Excel表格
 */
export class ExcelEditor extends EventEmitter {
  /** 配置选项 */
  private options: Required<ExcelEditorOptions>
  
  /** 容器元素 */
  private container: HTMLElement
  
  /** 渲染引擎 */
  private renderEngine: RenderEngine
  
  /** 数据管理器 */
  private dataManager: DataManager
  
  /** 是否已初始化 */
  private initialized = false

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: ExcelEditorOptions) {
    super()
    
    // 设置默认配置
    this.options = this.mergeDefaultOptions(options)
    
    // 获取容器元素
    this.container = this.getContainer(this.options.container)
    
    // 初始化组件
    this.initializeComponents()
    
    // 初始化编辑器
    this.initialize()
  }

  /**
   * 合并默认配置
   * @param options 用户配置
   * @returns 完整配置
   */
  private mergeDefaultOptions(options: ExcelEditorOptions): Required<ExcelEditorOptions> {
    return {
      container: options.container,
      data: options.data || this.createEmptyWorkbook(),
      readonly: options.readonly || false,
      theme: options.theme || 'light',
      showGridlines: options.showGridlines !== false,
      showRowNumbers: options.showRowNumbers !== false,
      showColumnHeaders: options.showColumnHeaders !== false,
      enableFormulas: options.enableFormulas !== false,
      enableUndo: options.enableUndo !== false,
      maxUndoSteps: options.maxUndoSteps || 100,
      virtualScroll: {
        enabled: options.virtualScroll?.enabled !== false,
        rowHeight: options.virtualScroll?.rowHeight || 25,
        columnWidth: options.virtualScroll?.columnWidth || 100,
        bufferSize: options.virtualScroll?.bufferSize || 10
      }
    }
  }

  /**
   * 获取容器元素
   * @param container 容器选择器或元素
   * @returns 容器元素
   */
  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement
      if (!element) {
        throw new Error(`Container element not found: ${container}`)
      }
      return element
    }
    return container
  }

  /**
   * 创建空工作簿
   * @returns 空工作簿
   */
  private createEmptyWorkbook(): Workbook {
    const worksheet: Worksheet = {
      name: 'Sheet1',
      cells: {},
      rowCount: 100,
      columnCount: 26
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
   * 初始化组件
   */
  private initializeComponents(): void {
    this.dataManager = new DataManager(this.options.data)
    this.renderEngine = new RenderEngine(this.container, this.options)
    
    // 绑定事件
    this.bindEvents()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 数据管理器事件
    this.dataManager.on('dataChange', (data) => {
      this.emit('cellChange', data)
      this.renderEngine.render()
    })

    // 渲染引擎事件
    this.renderEngine.on('cellSelect', (data) => {
      this.emit('cellSelect', data)
    })

    this.renderEngine.on('cellEdit', (data) => {
      this.emit('beforeEdit', data)
      this.dataManager.setCellValue(data.position!, data.newValue!)
      this.emit('afterEdit', data)
    })
  }

  /**
   * 初始化编辑器
   */
  private initialize(): void {
    if (this.initialized) {
      return
    }

    try {
      // 渲染界面
      this.renderEngine.render()
      
      this.initialized = true
      
      // 触发初始化完成事件
      this.emit('ready', {})
      
    } catch (error) {
      this.emit('error', { error: error as Error })
      throw error
    }
  }

  /**
   * 获取单元格值
   * @param position 单元格位置
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   * @returns 单元格值
   */
  getCellValue(position: CellPosition, worksheetIndex?: number): CellValueType {
    return this.dataManager.getCellValue(position, worksheetIndex)
  }

  /**
   * 设置单元格值
   * @param position 单元格位置
   * @param value 单元格值
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   */
  setCellValue(position: CellPosition, value: CellValueType, worksheetIndex?: number): void {
    this.emit('beforeEdit', { position, newValue: value, worksheetIndex })
    this.dataManager.setCellValue(position, value, worksheetIndex)
    this.emit('afterEdit', { position, newValue: value, worksheetIndex })
  }

  /**
   * 获取单元格对象
   * @param position 单元格位置
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   * @returns 单元格对象
   */
  getCell(position: CellPosition, worksheetIndex?: number): Cell | undefined {
    return this.dataManager.getCell(position, worksheetIndex)
  }

  /**
   * 设置单元格对象
   * @param position 单元格位置
   * @param cell 单元格对象
   * @param worksheetIndex 工作表索引，默认为当前活动工作表
   */
  setCell(position: CellPosition, cell: Cell, worksheetIndex?: number): void {
    this.dataManager.setCell(position, cell, worksheetIndex)
  }

  /**
   * 获取工作簿数据
   * @returns 工作簿数据
   */
  getData(): Workbook {
    return this.dataManager.getWorkbook()
  }

  /**
   * 设置工作簿数据
   * @param data 工作簿数据
   */
  setData(data: Workbook): void {
    this.dataManager.setWorkbook(data)
    this.renderEngine.render()
  }

  /**
   * 导出为Excel文件
   * @param filename 文件名
   */
  async exportToExcel(filename: string = 'workbook.xlsx'): Promise<void> {
    return this.dataManager.exportToExcel(filename)
  }

  /**
   * 从Excel文件导入
   * @param file Excel文件
   */
  async importFromExcel(file: File): Promise<void> {
    const workbook = await this.dataManager.importFromExcel(file)
    this.setData(workbook)
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.renderEngine.destroy()
    this.removeAllListeners()
    this.initialized = false
  }

  /**
   * 刷新渲染
   */
  refresh(): void {
    this.renderEngine.render()
  }

  /**
   * 获取当前活动工作表
   * @returns 当前活动工作表
   */
  getActiveWorksheet(): Worksheet {
    return this.dataManager.getActiveWorksheet()
  }

  /**
   * 设置活动工作表
   * @param index 工作表索引
   */
  setActiveWorksheet(index: number): void {
    this.dataManager.setActiveWorksheet(index)
    this.emit('worksheetChange', { worksheetIndex: index })
    this.renderEngine.render()
  }
}
