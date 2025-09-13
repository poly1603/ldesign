/**
 * 主表格类
 * 
 * 完整的表格实现，提供所有功能特性
 * 支持虚拟滚动、固定列、多选、排序、过滤等
 * 框架无关设计，可在任意前端框架中使用
 */

import { BaseTable } from './BaseTable'
import type {
  TableConfig,
  TableRow,
  TableColumn,
  TableId,
  SortDirection,
  ColumnSorter
} from '../types'

/**
 * 表格主类
 * 
 * 功能特性：
 * - 继承基础表格的所有功能
 * - 实现完整的交互功能
 * - 支持所有高级特性
 * - 提供友好的API接口
 */
export class Table<T extends TableRow = TableRow> extends BaseTable<T> {
  /**
   * 构造函数
   * @param config 表格配置
   */
  constructor(config: TableConfig<T>) {
    super(config)

    // 自动初始化
    this.initialize()

    // 绑定DOM事件
    this.bindDOMEvents()
  }

  /**
   * 子类初始化钩子
   * @protected
   */
  protected onInitialize(): void {
    // 设置容器样式
    this.container.classList.add('ldesign-table')

    // 应用配置样式
    if (this.config.className) {
      this.container.classList.add(this.config.className)
    }

    if (this.config.style) {
      Object.assign(this.container.style, this.config.style)
    }

    // 设置表格高度
    if (this.config.height) {
      this.container.style.height = `${this.config.height}px`
    }

    if (this.config.maxHeight) {
      this.container.style.maxHeight = `${this.config.maxHeight}px`
    }

    // 初始化高级功能
    this.initializeAdvancedFeatures()
  }

  /**
   * 子类渲染钩子
   * @protected
   */
  protected onRender(): void {
    // 应用表格样式类
    this.applyTableClasses()

    // 更新虚拟滚动状态
    this.updateVirtualScrollState()
  }

  /**
   * 子类销毁钩子
   * @protected
   */
  protected onDestroy(): void {
    // 移除DOM事件监听
    this.unbindDOMEvents()

    // 清理容器样式
    this.container.className = ''
    this.container.removeAttribute('style')
  }

  // ==================== 公共API方法 ====================

  /**
   * 选择行
   * @param keys 行键数组
   * @param replace 是否替换当前选择
   */
  selectRows(keys: TableId[], replace: boolean = false): void {
    if (!this.config.selection?.enabled) {
      return
    }

    this.selectionManager.selectRows(keys, replace)
    this.renderManager.updateSelection(this.selectionManager.getSelectedKeys())

    // 触发选择变化事件
    this.eventManager.emit('selection-change', {
      selectedRows: this.selectionManager.getSelectedRows(),
      selectedKeys: this.selectionManager.getSelectedKeys(),
      changedRows: [],
      changedKeys: keys
    })
  }

  /**
   * 取消选择行
   * @param keys 行键数组
   */
  deselectRows(keys: TableId[]): void {
    if (!this.config.selection?.enabled) {
      return
    }

    this.selectionManager.deselectRows(keys)
    this.renderManager.updateSelection(this.selectionManager.getSelectedKeys())

    // 触发选择变化事件
    this.eventManager.emit('selection-change', {
      selectedRows: this.selectionManager.getSelectedRows(),
      selectedKeys: this.selectionManager.getSelectedKeys(),
      changedRows: [],
      changedKeys: keys
    })
  }

  /**
   * 切换行选择状态
   * @param keys 行键数组
   */
  toggleRowSelection(keys: TableId[]): void {
    if (!this.config.selection?.enabled) {
      return
    }

    this.selectionManager.toggleRows(keys)
    this.renderManager.updateSelection(this.selectionManager.getSelectedKeys())

    // 触发选择变化事件
    this.eventManager.emit('selection-change', {
      selectedRows: this.selectionManager.getSelectedRows(),
      selectedKeys: this.selectionManager.getSelectedKeys(),
      changedRows: [],
      changedKeys: keys
    })
  }

  /**
   * 全选
   */
  selectAll(): void {
    if (!this.config.selection?.enabled || !this.config.selection.multiple) {
      return
    }

    const allKeys = this.dataManager.getData().map(row => this.dataManager.getRowKey(row))
    this.selectionManager.selectAll(allKeys)
    this.renderManager.updateSelection(this.selectionManager.getSelectedKeys())

    // 触发选择变化事件
    this.eventManager.emit('selection-change', {
      selectedRows: this.selectionManager.getSelectedRows(),
      selectedKeys: this.selectionManager.getSelectedKeys(),
      changedRows: this.selectionManager.getSelectedRows(),
      changedKeys: this.selectionManager.getSelectedKeys()
    })
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    if (!this.config.selection?.enabled) {
      return
    }

    const previousKeys = this.selectionManager.getSelectedKeys()
    this.selectionManager.clearSelection()
    this.renderManager.updateSelection([])

    // 触发选择变化事件
    this.eventManager.emit('selection-change', {
      selectedRows: [],
      selectedKeys: [],
      changedRows: [],
      changedKeys: previousKeys
    })
  }

  /**
   * 获取选中的行
   */
  getSelectedRows(): T[] {
    return this.selectionManager.getSelectedRows()
  }

  /**
   * 获取选中的行键
   */
  getSelectedKeys(): TableId[] {
    return this.selectionManager.getSelectedKeys()
  }

  /**
   * 展开行
   * @param keys 行键数组
   */
  expandRows(keys: TableId[]): void {
    if (!this.config.expand?.enabled) {
      return
    }

    this.expandManager.expandRows(keys)
    this.renderManager.updateExpansion(this.expandManager.getExpandedKeys())

    // 触发展开变化事件
    keys.forEach(key => {
      const row = this.dataManager.getRowByKey(key)
      if (row) {
        this.eventManager.emit('expand-change', {
          row,
          rowKey: key,
          expanded: true,
          expandedKeys: this.expandManager.getExpandedKeys()
        })
      }
    })
  }

  /**
   * 折叠行
   * @param keys 行键数组
   */
  collapseRows(keys: TableId[]): void {
    if (!this.config.expand?.enabled) {
      return
    }

    this.expandManager.collapseRows(keys)
    this.renderManager.updateExpansion(this.expandManager.getExpandedKeys())

    // 触发展开变化事件
    keys.forEach(key => {
      const row = this.dataManager.getRowByKey(key)
      if (row) {
        this.eventManager.emit('expand-change', {
          row,
          rowKey: key,
          expanded: false,
          expandedKeys: this.expandManager.getExpandedKeys()
        })
      }
    })
  }

  /**
   * 设置排序
   * @param column 列键
   * @param direction 排序方向
   * @param sorter 自定义排序函数
   */
  sort(column: string, direction: SortDirection, sorter?: ColumnSorter<T>): void {
    this.dataManager.setSort(column, direction, sorter)
    this.renderManager.updateSort(this.dataManager.getSortState())
    this.render()

    // 触发排序变化事件
    this.eventManager.emit('sort-change', {
      column,
      direction,
      sorter
    })
  }

  /**
   * 清除排序
   */
  clearSort(): void {
    this.dataManager.clearSort()
    this.renderManager.updateSort(null)
    this.render()

    // 触发排序变化事件
    this.eventManager.emit('sort-change', {
      column: '',
      direction: null
    })
  }

  /**
   * 设置过滤
   * @param column 列键
   * @param filters 过滤值数组
   */
  filter(column: string, filters: any[]): void {
    this.dataManager.setFilter(column, filters)
    this.renderManager.updateFilter(this.dataManager.getFilterState())
    this.render()

    // 触发过滤变化事件
    this.eventManager.emit('filter-change', {
      column,
      filters,
      filteredData: this.dataManager.getFilteredData()
    })
  }

  /**
   * 清除过滤
   * @param column 列键，不传则清除所有过滤
   */
  clearFilter(column?: string): void {
    this.dataManager.clearFilter(column)
    this.renderManager.updateFilter(this.dataManager.getFilterState())
    this.render()

    // 触发过滤变化事件
    this.eventManager.emit('filter-change', {
      column: column || '',
      filters: [],
      filteredData: this.dataManager.getFilteredData()
    })
  }

  // ==================== 私有方法 ====================

  /**
   * 绑定DOM事件
   * @private
   */
  private bindDOMEvents(): void {
    // 绑定容器点击事件
    this.container.addEventListener('click', this.handleContainerClick.bind(this))

    // 绑定容器双击事件
    this.container.addEventListener('dblclick', this.handleContainerDoubleClick.bind(this))

    // 绑定滚动事件
    const bodyElement = this.container.querySelector('.ldesign-table-body')
    if (bodyElement) {
      bodyElement.addEventListener('scroll', this.handleScroll.bind(this))
    }

    // 绑定键盘事件
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this))

    // 绑定鼠标事件
    this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this))
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }

  /**
   * 解绑DOM事件
   * @private
   */
  private unbindDOMEvents(): void {
    // 移除容器事件监听
    this.container.removeEventListener('click', this.handleContainerClick.bind(this))
    this.container.removeEventListener('dblclick', this.handleContainerDoubleClick.bind(this))
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this))
    this.container.removeEventListener('mouseenter', this.handleMouseEnter.bind(this))
    this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this))

    // 移除滚动事件监听
    const bodyElement = this.container.querySelector('.ldesign-table-body')
    if (bodyElement) {
      bodyElement.removeEventListener('scroll', this.handleScroll.bind(this))
    }
  }

  /**
   * 处理容器点击事件
   * @private
   */
  private handleContainerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement

    // 处理行点击
    const row = target.closest('.ldesign-table-body-row')
    if (row) {
      const rowKey = (row as HTMLElement).dataset.key
      const rowIndex = parseInt((row as HTMLElement).dataset.index || '0')
      const rowData = this.dataManager.getRowByKey(rowKey as TableId)

      if (rowData) {
        this.eventManager.emit('row-click', {
          row: rowData,
          rowKey: rowKey as TableId,
          rowIndex,
          event
        })
      }
    }

    // 处理单元格点击
    const cell = target.closest('.ldesign-table-body-cell')
    if (cell && row) {
      const columnIndex = Array.from(row.children).indexOf(cell)
      const column = this.config.columns[columnIndex]
      const rowKey = (row as HTMLElement).dataset.key
      const rowIndex = parseInt((row as HTMLElement).dataset.index || '0')
      const rowData = this.dataManager.getRowByKey(rowKey as TableId)

      if (rowData && column) {
        this.eventManager.emit('cell-click', {
          row: rowData,
          column,
          rowKey: rowKey as TableId,
          rowIndex,
          columnIndex,
          value: rowData[column.key],
          event
        })
      }
    }

    // 处理表头点击
    const headerCell = target.closest('.ldesign-table-header-cell')
    if (headerCell) {
      const headerRow = headerCell.closest('.ldesign-table-header-row')
      if (headerRow) {
        const columnIndex = Array.from(headerRow.children).indexOf(headerCell)
        const column = this.config.columns[columnIndex]

        if (column) {
          this.eventManager.emit('header-click', {
            column,
            columnIndex,
            event
          })

          // 处理排序
          if (column.sortable) {
            this.handleSort(column.key)
          }
        }
      }
    }

    // 处理选择框点击
    const checkbox = target.closest('.ldesign-table-checkbox')
    if (checkbox && row) {
      const rowKey = (row as HTMLElement).dataset.key
      if (rowKey) {
        this.toggleRowSelection([rowKey as TableId])
      }
    }

    // 处理展开按钮点击
    const expandButton = target.closest('.ldesign-table-expand-button')
    if (expandButton && row) {
      const rowKey = (row as HTMLElement).dataset.key
      if (rowKey) {
        const isExpanded = this.expandManager.isExpanded(rowKey as TableId)
        if (isExpanded) {
          this.collapseRows([rowKey as TableId])
        } else {
          this.expandRows([rowKey as TableId])
        }
      }
    }
  }

  /**
   * 处理容器双击事件
   * @private
   */
  private handleContainerDoubleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement

    // 处理行双击
    const row = target.closest('.ldesign-table-body-row')
    if (row) {
      const rowKey = (row as HTMLElement).dataset.key
      const rowIndex = parseInt((row as HTMLElement).dataset.index || '0')
      const rowData = this.dataManager.getRowByKey(rowKey as TableId)

      if (rowData) {
        this.eventManager.emit('row-dblclick', {
          row: rowData,
          rowKey: rowKey as TableId,
          rowIndex,
          event
        })
      }
    }
  }

  /**
   * 处理滚动事件
   * @private
   */
  private handleScroll(event: Event): void {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    const scrollLeft = target.scrollLeft

    // 更新虚拟滚动
    if (this.config.virtualScroll?.enabled) {
      this.virtualScrollManager.updateScrollPosition(scrollTop)
      this.render()
    }

    // 触发滚动事件
    this.eventManager.emit('scroll', {
      scrollTop,
      scrollLeft,
      event
    })
  }

  /**
   * 处理键盘事件
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 处理键盘导航和快捷键
    this.eventManager.emit('keydown', {
      event
    })
  }

  /**
   * 处理鼠标进入事件
   * @private
   */
  private handleMouseEnter(event: MouseEvent): void {
    this.eventManager.emit('mouse-enter', {
      event
    })
  }

  /**
   * 处理鼠标离开事件
   * @private
   */
  private handleMouseLeave(event: MouseEvent): void {
    this.eventManager.emit('mouse-leave', {
      event
    })
  }

  /**
   * 处理排序
   * @private
   */
  private handleSort(column: string): void {
    const currentSort = this.dataManager.getSortState()
    let direction: SortDirection = 'asc'

    if (currentSort && currentSort.column === column) {
      // 切换排序方向
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc'
    }

    this.sort(column, direction)
  }

  /**
   * 应用表格样式类
   * @private
   */
  private applyTableClasses(): void {
    if (this.config.bordered) {
      this.container.classList.add('ldesign-table-bordered')
    }

    if (this.config.striped) {
      this.container.classList.add('ldesign-table-striped')
    }

    if (this.config.loading) {
      this.container.classList.add('ldesign-table-loading')
    }
  }

  /**
   * 更新虚拟滚动状态
   * @private
   */
  private updateVirtualScrollState(): void {
    if (this.config.virtualScroll?.enabled) {
      this.virtualScrollManager.setItemCount(this.dataManager.getDisplayData().length)
    }
  }

  // ==================== 事件方法 ====================

  // ==================== 分页功能 ====================

  /**
   * 获取分页状态
   */
  getPaginationState() {
    return this.paginationManager.getState()
  }

  /**
   * 设置页码
   * @param page 页码
   */
  setPage(page: number): void {
    this.paginationManager.setPage(page)
    this.render()
  }

  /**
   * 设置每页条数
   * @param pageSize 每页条数
   */
  setPageSize(pageSize: number): void {
    this.paginationManager.setPageSize(pageSize)
    this.render()
  }

  /**
   * 设置总条数（后端分页时使用）
   * @param total 总条数
   */
  setPaginationTotal(total: number): void {
    this.paginationManager.setTotal(total)
  }

  /**
   * 启用分页
   */
  enablePagination(): void {
    this.paginationManager.enable()
    this.render()
  }

  /**
   * 禁用分页
   */
  disablePagination(): void {
    this.paginationManager.disable()
    this.render()
  }

  // ==================== 事件系统 ====================

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event?: string, listener?: (data: any) => void): void {
    if (event) {
      this.eventManager.off(event, listener)
    } else {
      this.eventManager.clear()
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit(event: string, data?: any): void {
    this.eventManager.emit(event, data)
  }

  /**
   * 检查表格是否已销毁
   * @returns 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }

  // ==================== 数据访问方法 ====================

  /**
   * 获取展开的行键
   */
  getExpandedKeys(): TableId[] {
    return this.expandManager.getExpandedKeys()
  }

  /**
   * 获取显示数据
   */
  getDisplayData(): T[] {
    return this.dataManager.getDisplayData()
  }

  /**
   * 获取排序状态
   */
  getSortState(): TableSortState | null {
    return this.dataManager.getSortState()
  }

  /**
   * 获取过滤状态
   */
  getFilterState(): TableFilterState {
    return this.dataManager.getFilterState()
  }

  /**
   * 添加数据
   * @param data 要添加的数据
   */
  addData(data: T | T[]): void {
    const dataArray = Array.isArray(data) ? data : [data]
    const currentData = this.dataManager.getData()
    this.dataManager.setData([...currentData, ...dataArray])
  }

  /**
   * 移除数据
   * @param keys 要移除的行键
   */
  removeData(keys: TableId | TableId[]): void {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    const currentData = this.dataManager.getData()
    const filteredData = currentData.filter(row => {
      const rowKey = this.dataManager.getRowKey(row)
      return !keyArray.includes(rowKey)
    })
    this.dataManager.setData(filteredData)
  }

  /**
   * 更新数据
   * @param key 行键
   * @param data 更新的数据
   */
  updateData(key: TableId, data: Partial<T>): void {
    this.dataManager.updateData(key, data)
  }

  // ==================== 高级功能方法 ====================

  /**
   * 初始化高级功能
   * @private
   */
  private initializeAdvancedFeatures(): void {
    // 初始化可编辑单元格事件
    if (this.config.editable?.enabled) {
      this.initializeEditableCell()
    }

    // 初始化拖拽排序
    if (this.config.dragSort?.enabled) {
      this.initializeDragSort()
    }

    // 初始化导出功能
    if (this.config.export?.enabled) {
      this.initializeExport()
    }
  }

  /**
   * 初始化可编辑单元格
   * @private
   */
  private initializeEditableCell(): void {
    // 监听编辑事件
    this.editableCell.on('edit-start', (data) => {
      this.eventManager.emit('cell-edit-start', data)
    })

    this.editableCell.on('edit-finish', (data) => {
      // 更新数据
      const { row, column, newValue, rowIndex } = data
      const rowKey = row[this.config.rowKey || 'id']
      this.dataManager.updateData(rowKey, { [column.key]: newValue })

      // 触发事件
      this.eventManager.emit('cell-edit-finish', data)
      this.config.editable?.onEdit?.(data)
    })

    this.editableCell.on('edit-cancel', (data) => {
      this.eventManager.emit('cell-edit-cancel', data)
      this.config.editable?.onCancel?.(data)
    })

    // 绑定单元格点击事件
    if (this.config.editable?.trigger === 'click') {
      this.container.addEventListener('click', this.handleCellClick.bind(this))
    } else if (this.config.editable?.trigger === 'dblclick') {
      this.container.addEventListener('dblclick', this.handleCellClick.bind(this))
    }
  }

  /**
   * 处理单元格点击
   * @private
   */
  private handleCellClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const cell = target.closest('td') as HTMLElement

    if (!cell) return

    const rowIndex = parseInt(cell.getAttribute('data-row-index') || '0')
    const columnKey = cell.getAttribute('data-column-key') || ''

    this.startEdit(rowIndex, columnKey)
  }

  /**
   * 初始化拖拽排序
   * @private
   */
  private initializeDragSort(): void {
    this.dragSort.init(this.container)

    // 监听排序事件
    this.dragSort.on('sort-change', (data) => {
      const { fromIndex, toIndex } = data

      // 更新数据顺序
      const displayData = [...this.state.displayData]
      const [movedItem] = displayData.splice(fromIndex, 1)
      displayData.splice(toIndex, 0, movedItem)

      // 更新数据管理器
      this.dataManager.setData(displayData)

      // 触发事件
      this.eventManager.emit('row-sort-change', data)
      this.config.dragSort?.onSortChange?.(fromIndex, toIndex, data.row)
    })
  }

  /**
   * 初始化导出功能
   * @private
   */
  private initializeExport(): void {
    // 监听导出事件
    this.dataExporter.on('export-start', (data) => {
      this.eventManager.emit('export-start', data)
    })

    this.dataExporter.on('export-progress', (data) => {
      this.eventManager.emit('export-progress', data)
    })

    this.dataExporter.on('export-complete', (data) => {
      this.eventManager.emit('export-complete', data)
    })

    this.dataExporter.on('export-error', (data) => {
      this.eventManager.emit('export-error', data)
    })
  }
}
