/**
 * 基础表格类
 * 
 * 提供表格的基础功能和架构
 * 作为所有表格实现的基类
 * 定义表格的核心接口和生命周期
 */

import type {
  TableConfig,
  TableRow,
  TableColumn,
  TableState,
  TableId,
  IEventManager,
  IDataManager,
  ISelectionManager,
  IExpandManager,
  IVirtualScrollManager,
  IRenderManager,
  EventHandlerConfig
} from '../types'

import {
  EventManager,
  DataManager,
  SelectionManager,
  ExpandManager,
  VirtualScrollManager,
  RenderManager,
  PaginationManager,
  ThemeManager
} from '../managers'

import { EditableCell } from '../components/EditableCell'
import { DragSort } from '../components/DragSort'
import { DataExporter } from '../components/DataExporter'

/**
 * 基础表格类
 * 
 * 功能特性：
 * - 完整的管理器集成
 * - 生命周期管理
 * - 事件系统支持
 * - 配置管理
 * - 状态同步
 */
export abstract class BaseTable<T extends TableRow = TableRow> {
  /** 表格配置 */
  protected config: TableConfig<T>

  /** 表格容器元素 */
  protected container: HTMLElement

  /** 事件管理器 */
  protected eventManager: IEventManager

  /** 数据管理器 */
  protected dataManager: IDataManager<T>

  /** 选择管理器 */
  protected selectionManager: ISelectionManager<T>

  /** 展开管理器 */
  protected expandManager: IExpandManager<T>

  /** 虚拟滚动管理器 */
  protected virtualScrollManager: IVirtualScrollManager

  /** 渲染管理器 */
  protected renderManager: IRenderManager<T>

  /** 分页管理器 */
  protected paginationManager: PaginationManager<T>

  /** 主题管理器 */
  protected themeManager: ThemeManager

  /** 可编辑单元格 */
  protected editableCell: EditableCell<T>

  /** 拖拽排序 */
  protected dragSort: DragSort<T>

  /** 数据导出器 */
  protected dataExporter: DataExporter<T>

  /** 表格状态 */
  protected state: TableState<T>

  /** 是否已初始化 */
  protected initialized: boolean = false

  /** 是否已销毁 */
  protected destroyed: boolean = false

  /**
   * 构造函数
   * @param config 表格配置
   */
  constructor(config: TableConfig<T>) {
    this.config = { ...config }

    // 解析容器元素
    this.container = this.resolveContainer(config.container)

    // 初始化管理器
    this.initializeManagers()

    // 初始化状态
    this.initializeState()

    // 绑定事件处理器
    this.bindEventHandlers()
  }

  /**
   * 初始化表格
   */
  initialize(): void {
    if (this.initialized || this.destroyed) {
      return
    }

    // 设置数据
    this.dataManager.setData(this.config.data)

    // 设置虚拟滚动配置
    if (this.config.virtualScroll?.enabled) {
      this.virtualScrollManager.enable()
      this.virtualScrollManager.setItemHeight(this.config.virtualScroll.itemHeight)
      this.virtualScrollManager.setItemCount(this.config.data.length)
    }

    // 设置分页数据
    if (this.config.pagination?.enabled) {
      this.paginationManager.setData(this.config.data)
    }

    // 初始化选择状态已在构造函数中完成

    // 执行子类初始化
    this.onInitialize()

    this.initialized = true

    // 执行初始渲染
    this.render()
  }

  /**
   * 渲染表格
   */
  render(): void {
    if (!this.initialized || this.destroyed) {
      return
    }

    // 获取渲染上下文
    const context = this.getRenderContext()

    // 执行渲染
    this.renderManager.render(context)

    // 执行子类渲染逻辑
    this.onRender()

    // 触发渲染完成事件
    this.eventManager.emit('render-complete', { context })
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<TableConfig<T>>): void {
    this.config = { ...this.config, ...config }

    // 更新数据
    if (config.data) {
      this.setData(config.data)
    }

    // 更新列配置
    if (config.columns) {
      this.setColumns(config.columns)
    }

    // 重新渲染
    this.render()
  }

  /**
   * 设置数据
   * @param data 新数据
   */
  setData(data: T[]): void {
    this.config.data = data
    this.dataManager.setData(data)
    this.updateState()
    this.render()

    // 触发数据变化事件
    this.eventManager.emit('data-change', { data })
  }

  /**
   * 获取数据
   */
  getData(): T[] {
    return this.dataManager.getData()
  }

  /**
   * 设置列配置
   * @param columns 新列配置
   */
  setColumns(columns: TableColumn<T>[]): void {
    this.config.columns = columns
    this.render()
  }

  /**
   * 获取列配置
   */
  getColumns(): TableColumn<T>[] {
    return [...this.config.columns]
  }

  /**
   * 获取表格状态
   */
  getState(): TableState<T> {
    return { ...this.state }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }



  /**
   * 解析容器元素
   * @param container 容器选择器或元素
   * @private
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement
      if (!element) {
        throw new Error(`找不到容器元素: ${container}`)
      }
      return element
    }
    return container
  }

  /**
   * 初始化管理器
   * @private
   */
  private initializeManagers(): void {
    // 创建事件管理器
    this.eventManager = new EventManager()

    // 创建数据管理器
    this.dataManager = new DataManager<T>({
      rowKey: this.config.rowKey
    })

    // 创建选择管理器
    const selectionMode = this.config.selection?.multiple === false ? 'single' : 'multiple'
    this.selectionManager = new SelectionManager<T>(
      this.dataManager,
      selectionMode
    )

    // 创建展开管理器
    this.expandManager = new ExpandManager<T>(this.dataManager)

    // 创建虚拟滚动管理器
    this.virtualScrollManager = new VirtualScrollManager({
      container: this.container,
      itemHeight: this.config.virtualScroll?.itemHeight || 40,
      bufferSize: this.config.virtualScroll?.bufferSize,
      dynamicHeight: this.config.virtualScroll?.dynamicHeight,
      throttleMs: this.config.virtualScroll?.throttleMs
    })

    // 创建渲染管理器
    this.renderManager = new RenderManager<T>({
      container: this.container,
      columns: this.config.columns
    })

    // 创建分页管理器
    this.paginationManager = new PaginationManager({
      enabled: this.config.pagination?.enabled || false,
      mode: this.config.pagination?.mode || 'frontend',
      pagination: this.config.pagination || {},
      container: this.config.pagination?.container
    })

    // 创建主题管理器
    this.themeManager = new ThemeManager(this.container, this.eventManager)

    // 创建可编辑单元格
    this.editableCell = new EditableCell<T>()

    // 创建拖拽排序
    this.dragSort = new DragSort<T>({
      enabled: this.config.dragSort?.enabled || false,
      handleSelector: this.config.dragSort?.handleSelector,
      onSortChange: this.config.dragSort?.onSortChange
    })

    // 创建数据导出器
    this.dataExporter = new DataExporter<T>()
  }

  /**
   * 初始化状态
   * @private
   */
  private initializeState(): void {
    this.state = {
      originalData: [],
      filteredData: [],
      sortedData: [],
      displayData: [],
      selectedRows: [],
      selectedKeys: [],
      expandedKeys: [],
      sortState: null,
      filterState: {},
      scrollTop: 0,
      scrollLeft: 0
    }
  }

  /**
   * 绑定事件处理器
   * @private
   */
  private bindEventHandlers(): void {
    // 绑定配置中的事件处理器
    const handlers = this.config as EventHandlerConfig<T>

    if (handlers.onRowClick) {
      this.eventManager.on('row-click', handlers.onRowClick)
    }
    if (handlers.onCellClick) {
      this.eventManager.on('cell-click', handlers.onCellClick)
    }
    if (handlers.onSelectionChange) {
      this.eventManager.on('selection-change', handlers.onSelectionChange)
    }
    // ... 绑定其他事件处理器
  }

  /**
   * 获取渲染上下文
   * @private
   */
  private getRenderContext() {
    const virtualRange = this.virtualScrollManager.isEnabled()
      ? this.virtualScrollManager.getVisibleRange()
      : undefined

    // 获取要渲染的数据（考虑分页）
    const displayData = this.paginationManager.isEnabled()
      ? this.paginationManager.getCurrentPageData()
      : this.dataManager.getDisplayData()

    return {
      data: displayData,
      columns: this.config.columns,
      state: this.state,
      virtualRange
    }
  }

  /**
   * 更新状态
   * @private
   */
  private updateState(): void {
    this.state.originalData = this.dataManager.getData()
    this.state.filteredData = this.dataManager.getFilteredData()
    this.state.sortedData = this.dataManager.getSortedData()
    this.state.displayData = this.dataManager.getDisplayData()
    this.state.selectedRows = this.selectionManager.getSelectedRows()
    this.state.selectedKeys = this.selectionManager.getSelectedKeys()
    this.state.expandedKeys = this.expandManager.getExpandedKeys()
    this.state.sortState = this.dataManager.getSortState()
    this.state.filterState = this.dataManager.getFilterState()
  }

  // ==================== 高级功能方法 ====================

  /**
   * 开始编辑单元格
   */
  startEdit(rowIndex: number, columnKey: string): void {
    if (!this.config.editable?.enabled) return

    const row = this.state.displayData[rowIndex]
    const column = this.config.columns.find(col => col.key === columnKey)

    if (!row || !column || !column.editable) return

    const cell = this.container.querySelector(
      `[data-row-index="${rowIndex}"][data-column-key="${columnKey}"]`
    ) as HTMLElement

    if (cell) {
      this.editableCell.startEdit(cell, row, column, rowIndex, this.config.columns.indexOf(column))
    }
  }

  /**
   * 导出数据
   */
  async exportData(config: import('../components/DataExporter').ExportConfig<T>): Promise<void> {
    if (!this.config.export?.enabled) return

    await this.dataExporter.export(this.state.displayData, this.config.columns, config)
  }

  /**
   * 获取可编辑单元格实例
   */
  getEditableCell(): EditableCell<T> {
    return this.editableCell
  }

  /**
   * 获取拖拽排序实例
   */
  getDragSort(): DragSort<T> {
    return this.dragSort
  }

  /**
   * 获取数据导出器实例
   */
  getDataExporter(): DataExporter<T> {
    return this.dataExporter
  }

  // ==================== 抽象方法 ====================

  /**
   * 子类初始化钩子
   * @protected
   */
  protected abstract onInitialize(): void

  /**
   * 子类渲染钩子
   * @protected
   */
  protected abstract onRender(): void

  /**
   * 子类销毁钩子
   * @protected
   */
  protected abstract onDestroy(): void

  /**
   * 设置主题
   */
  setTheme(config: Partial<import('../managers/ThemeManager').ThemeConfig>): void {
    this.themeManager.setTheme(config)
  }

  /**
   * 获取当前主题
   */
  getTheme(): import('../managers/ThemeManager').ThemeConfig {
    return this.themeManager.getTheme()
  }

  /**
   * 切换主题（明亮/暗黑）
   */
  toggleTheme(): void {
    this.themeManager.toggleTheme()
  }

  /**
   * 切换响应式模式
   */
  toggleResponsiveMode(): void {
    this.themeManager.toggleResponsiveMode()
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager
  }

  /**
   * 销毁表格
   */
  destroy(): void {
    if (this.destroyed) return

    // 调用子类销毁钩子
    this.onDestroy()

    // 销毁所有管理器
    this.eventManager?.destroy()
    this.dataManager?.destroy()
    this.selectionManager?.destroy()
    this.expandManager?.destroy()
    this.virtualScrollManager?.destroy()
    this.renderManager?.destroy()
    this.paginationManager?.destroy()
    this.themeManager?.destroy()

    // 销毁高级功能组件
    this.editableCell?.destroy()
    this.dragSort?.destroy()
    this.dataExporter?.destroy()

    // 清理DOM
    if (this.container) {
      this.container.innerHTML = ''
    }

    this.destroyed = true
  }

  /**
   * 获取数据管理器
   */
  getDataManager(): IDataManager<T> {
    return this.dataManager
  }
}
