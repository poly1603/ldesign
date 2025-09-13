/**
 * 渲染管理器
 * 
 * 负责表格的DOM渲染和更新
 * 支持高效的增量更新和虚拟滚动渲染
 * 提供完整的表格结构渲染功能
 */

import type {
  IRenderManager,
  RenderContext,
  TableRow,
  TableColumn,
  TableId,
  TableSortState,
  TableFilterState,
  VirtualScrollRange
} from '../types'
import { SortIndicator } from '../components/SortIndicator'
import { FilterDropdown, type FilterOption } from '../components/FilterDropdown'

/**
 * 渲染管理器实现类
 * 
 * 功能特性：
 * - 高效的DOM渲染和更新
 * - 支持虚拟滚动渲染
 * - 增量更新优化
 * - 表格结构完整渲染
 * - 事件绑定和管理
 */
export class RenderManager<T extends TableRow = TableRow> implements IRenderManager<T> {
  /** 表格容器元素 */
  private container: HTMLElement

  /** 表格包装器元素 */
  private wrapper: HTMLElement | null = null

  /** 表头元素 */
  private header: HTMLElement | null = null

  /** 表体元素 */
  private body: HTMLElement | null = null

  /** 表脚元素 */
  private footer: HTMLElement | null = null

  /** 虚拟滚动容器 */
  private virtualContainer: HTMLElement | null = null

  /** 当前渲染的数据 */
  private currentData: T[] = []

  /** 当前渲染的列配置 */
  private currentColumns: TableColumn<T>[] = []

  /** 是否已初始化 */
  private initialized: boolean = false

  /** 可见范围 */
  private visibleRange: { start: number; end: number } | null = null

  /** 是否可选择 */
  private selectable: boolean = false

  /** 是否可展开 */
  private expandable: boolean = false

  /** 项目高度 */
  private itemHeight: number = 40

  /** 是否动态高度 */
  private dynamicHeight: boolean = false

  /** 项目高度映射 */
  private itemHeights: Map<number, number> | null = null

  /** 展开渲染器 */
  private expandRenderer: ((row: T) => string) | null = null

  /** 排序指示器映射 */
  private sortIndicators: Map<string, SortIndicator> = new Map()

  /** 筛选下拉框映射 */
  private filterDropdowns: Map<string, FilterDropdown> = new Map()

  /** 当前排序状态 */
  private currentSortState: TableSortState | null = null

  /** 当前筛选状态 */
  private currentFilterState: TableFilterState = {}

  /** 事件监听器映射 */
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  /** 表尾数据 */
  private footerData: any[] = []

  /**
   * 构造函数
   * @param config 渲染管理器配置
   */
  constructor(config: { container: HTMLElement; columns?: TableColumn<T>[] }) {
    this.container = config.container
    if (config.columns) {
      this.currentColumns = config.columns
    }
    this.initializeContainer()
  }

  /**
   * 渲染表格
   * @param context 渲染上下文
   */
  render(context?: RenderContext<T>): void {
    if (!context) {
      context = {
        data: this.currentData,
        columns: this.currentColumns,
        state: {},
        virtualRange: undefined
      }
    }

    const { data, columns, state, virtualRange } = context

    if (!this.initialized) {
      this.initializeStructure()
      this.initialized = true
    }

    // 更新当前状态
    this.currentData = data
    this.currentColumns = columns

    // 渲染表头
    this.renderHeaderInternal(columns, state)

    // 渲染表体
    if (virtualRange) {
      this.renderVirtualBody(data, columns, state, virtualRange)
    } else {
      this.renderBodyInternal(data, columns, state)
    }

    // 渲染表脚（如果需要）
    this.renderFooterInternal(columns, state)
  }

  /**
   * 更新表格数据
   * @param data 新数据
   */
  updateData(data: T[]): void {
    this.currentData = data
    // 这里可以实现增量更新优化
    this.renderBodyRows(data, this.currentColumns)
  }

  /**
   * 更新表格列
   * @param columns 新列配置
   */
  updateColumns(columns: TableColumn<T>[]): void {
    this.currentColumns = columns
    // 重新渲染整个表格结构
    this.renderHeaderInternal(columns)
    this.renderBodyRows(this.currentData, columns)
  }





  /**
   * 更新排序状态
   * @param sortState 排序状态
   */
  updateSort(sortState: TableSortState | null): void {
    // 清除所有列的排序状态
    const headerCells = this.header?.querySelectorAll('th')
    headerCells?.forEach(cell => {
      cell.classList.remove('sorted', 'sorted-asc', 'sorted-desc')
    })

    // 设置当前排序列的状态
    if (sortState) {
      const sortColumnIndex = this.currentColumns.findIndex(col => col.key === sortState.column)
      if (sortColumnIndex !== -1 && headerCells) {
        const sortCell = headerCells[sortColumnIndex]
        sortCell.classList.add('sorted', `sorted-${sortState.direction}`)
      }
    }
  }

  /**
   * 更新过滤状态
   * @param filterState 过滤状态
   */
  updateFilter(filterState: TableFilterState): void {
    // 更新列的过滤状态
    const headerCells = this.header?.querySelectorAll('th')
    headerCells?.forEach((cell, index) => {
      const column = this.currentColumns[index]
      if (column && filterState[column.key] && filterState[column.key].length > 0) {
        cell.classList.add('filtered')
      } else {
        cell.classList.remove('filtered')
      }
    })
  }

  /**
   * 更新滚动位置
   * @param scrollTop 垂直滚动位置
   * @param scrollLeft 水平滚动位置
   */
  updateScroll(scrollTop: number, scrollLeft: number): void {
    if (this.body) {
      this.body.scrollTop = scrollTop
      this.body.scrollLeft = scrollLeft
    }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    // 清理排序和筛选组件
    this.cleanupSortFilterComponents()

    if (this.wrapper) {
      this.container.removeChild(this.wrapper)
    }

    this.wrapper = null
    this.header = null
    this.body = null
    this.footer = null
    this.virtualContainer = null
    this.currentData = []
    this.currentColumns = []
    this.initialized = false
  }

  /**
   * 初始化容器
   * @private
   */
  private initializeContainer(): void {
    this.container.classList.add('ldesign-table-container')
  }

  /**
   * 初始化表格结构
   * @private
   */
  private initializeStructure(): void {
    // 创建表格包装器
    this.wrapper = document.createElement('div')
    this.wrapper.className = 'ldesign-table-wrapper'

    // 检查是否有固定列
    const hasFixedColumns = this.currentColumns.some(col => col.fixed)

    if (hasFixedColumns) {
      this.initializeFixedStructure()
    } else {
      this.initializeNormalStructure()
    }

    this.container.appendChild(this.wrapper)
  }

  /**
   * 初始化普通表格结构
   * @private
   */
  private initializeNormalStructure(): void {
    // 创建滚动容器
    const scrollContainer = document.createElement('div')
    scrollContainer.className = 'ldesign-table-scroll-container'

    // 创建表格元素
    const table = document.createElement('table')
    table.className = 'ldesign-table'

    // 创建表头
    this.header = document.createElement('thead')
    this.header.className = 'ldesign-table-header'

    // 创建表体
    this.body = document.createElement('tbody')
    this.body.className = 'ldesign-table-body'

    // 创建表脚
    this.footer = document.createElement('tfoot')
    this.footer.className = 'ldesign-table-footer'

    // 组装结构
    table.appendChild(this.header)
    table.appendChild(this.body)
    table.appendChild(this.footer)

    scrollContainer.appendChild(table)
    this.wrapper!.appendChild(scrollContainer)
  }

  /**
   * 初始化固定列表格结构
   * @private
   */
  private initializeFixedStructure(): void {
    // 创建左固定区域
    const leftFixedColumns = this.currentColumns.filter(col => col.fixed === 'left')
    if (leftFixedColumns.length > 0) {
      const leftFixed = this.createFixedArea('left', leftFixedColumns)
      this.wrapper!.appendChild(leftFixed)
    }

    // 创建中间滚动区域
    const normalColumns = this.currentColumns.filter(col => !col.fixed)
    if (normalColumns.length > 0) {
      const scrollArea = this.createScrollArea(normalColumns)
      this.wrapper!.appendChild(scrollArea)
    }

    // 创建右固定区域
    const rightFixedColumns = this.currentColumns.filter(col => col.fixed === 'right')
    if (rightFixedColumns.length > 0) {
      const rightFixed = this.createFixedArea('right', rightFixedColumns)
      this.wrapper!.appendChild(rightFixed)
    }
  }

  /**
   * 创建固定区域
   * @private
   */
  private createFixedArea(position: 'left' | 'right', columns: TableColumn<T>[]): HTMLElement {
    const fixedArea = document.createElement('div')
    fixedArea.className = `ldesign-table-fixed ldesign-table-fixed-${position}`

    const table = document.createElement('table')
    table.className = 'ldesign-table'

    const header = document.createElement('thead')
    header.className = 'ldesign-table-header'

    const body = document.createElement('tbody')
    body.className = 'ldesign-table-body'

    const footer = document.createElement('tfoot')
    footer.className = 'ldesign-table-footer'

    table.appendChild(header)
    table.appendChild(body)
    table.appendChild(footer)
    fixedArea.appendChild(table)

    // 如果是主要区域，设置为主要元素
    if (position === 'left' && !this.header) {
      this.header = header
      this.body = body
      this.footer = footer
    }

    return fixedArea
  }

  /**
   * 创建滚动区域
   * @private
   */
  private createScrollArea(columns: TableColumn<T>[]): HTMLElement {
    const scrollArea = document.createElement('div')
    scrollArea.className = 'ldesign-table-scroll-area'

    const table = document.createElement('table')
    table.className = 'ldesign-table'

    const header = document.createElement('thead')
    header.className = 'ldesign-table-header'

    const body = document.createElement('tbody')
    body.className = 'ldesign-table-body'

    const footer = document.createElement('tfoot')
    footer.className = 'ldesign-table-footer'

    table.appendChild(header)
    table.appendChild(body)
    table.appendChild(footer)
    scrollArea.appendChild(table)

    // 设置为主要元素（如果还没有设置）
    if (!this.header) {
      this.header = header
      this.body = body
      this.footer = footer
    }

    return scrollArea
  }

  /**
   * 渲染表头
   * @param columns 列配置
   * @param state 表格状态
   * @private
   */
  private renderHeaderInternal(columns: TableColumn<T>[], state?: any): void {
    if (!this.header) return

    // 清空现有内容
    this.header.innerHTML = ''

    // 检查是否有多级表头
    const hasMultiLevel = columns.some(col => (col as any).children)

    if (hasMultiLevel) {
      this.renderMultiLevelHeader(columns)
    } else {
      this.renderSingleLevelHeader(columns)
    }
  }

  /**
   * 渲染单级表头
   */
  private renderSingleLevelHeader(columns: TableColumn<T>[]): void {
    const headerRow = document.createElement('tr')
    headerRow.className = 'ldesign-table-header-row'

    columns.forEach((column, index) => {
      const cell = document.createElement('th')
      cell.className = 'ldesign-table-header-cell'
      cell.dataset.columnKey = column.key
      cell.dataset.columnIndex = String(index)

      // 创建表头内容容器
      const cellContent = document.createElement('div')
      cellContent.className = 'ldesign-table-header-cell-content'

      // 创建标题元素
      const titleElement = document.createElement('span')
      titleElement.className = 'ldesign-table-header-title'
      titleElement.textContent = column.title
      cellContent.appendChild(titleElement)

      // 添加排序指示器（只在可排序时显示）
      if (column.sortable) {
        cell.classList.add('ldesign-table-sortable')
        const sortIndicator = this.createSortIndicator(column)
        cellContent.appendChild(sortIndicator)
      }

      // 添加过滤器
      if (column.filterable) {
        cell.classList.add('ldesign-table-filterable')
        const filterTrigger = this.createFilterTrigger(column)
        cellContent.appendChild(filterTrigger)
      }

      // 添加列调整器
      if (column.resizable !== false) {
        const resizer = this.createColumnResizer()
        cellContent.appendChild(resizer)
      }

      cell.appendChild(cellContent)

      // 设置列样式
      if (column.width) {
        cell.style.width = `${column.width}px`
        cell.style.minWidth = `${column.minWidth || 50}px`
        cell.style.maxWidth = `${column.maxWidth || 'none'}`
      }
      if (column.align) {
        cell.style.textAlign = column.align
      }
      if (column.fixed) {
        cell.classList.add(`ldesign-table-fixed-${column.fixed}`)
      }
      if (column.className) {
        cell.classList.add(column.className)
      }

      headerRow.appendChild(cell)
    })

    this.header!.appendChild(headerRow)
  }

  /**
   * 创建排序指示器
   * @private
   */
  private createSortIndicator(column: TableColumn<T>): HTMLElement {
    const container = document.createElement('span')
    container.className = 'ldesign-table-sort-container'

    // 创建排序指示器实例
    const sortIndicator = new SortIndicator(container, {
      direction: this.currentSortState?.column === column.key ? this.currentSortState.direction : null,
      sortable: column.sortable !== false,
      onClick: (direction) => {
        this.handleSortChange(column.key, direction)
      }
    })

    // 保存引用以便后续更新
    this.sortIndicators.set(column.key, sortIndicator)

    return container
  }

  /**
   * 创建过滤器触发器
   * @private
   */
  private createFilterTrigger(column: TableColumn<T>): HTMLElement {
    const container = document.createElement('span')
    container.className = 'ldesign-table-filter-container'
    container.style.position = 'relative'

    // 获取筛选选项
    const filterOptions = this.getFilterOptions(column)
    const selectedValues = this.currentFilterState[column.key] || []

    // 创建筛选下拉框实例
    const filterDropdown = new FilterDropdown(container, {
      options: filterOptions,
      selectedValues,
      placeholder: `筛选${column.title}`,
      onChange: (values) => {
        this.handleFilterChange(column.key, values)
      }
    })

    // 保存引用以便后续更新
    this.filterDropdowns.set(column.key, filterDropdown)

    return container
  }

  /**
   * 创建列调整器
   * @private
   */
  private createColumnResizer(): HTMLElement {
    const resizer = document.createElement('span')
    resizer.className = 'ldesign-table-column-resizer'

    let isResizing = false
    let startX = 0
    let startWidth = 0

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true
      startX = e.clientX
      const th = resizer.closest('th') as HTMLElement
      startWidth = th.offsetWidth

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      e.preventDefault()
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const th = resizer.closest('th') as HTMLElement
      const diff = e.clientX - startX
      const newWidth = Math.max(50, startWidth + diff)

      th.style.width = `${newWidth}px`

      // 触发列宽变化事件
      this.emit('column-resize', {
        columnKey: th.dataset.columnKey,
        width: newWidth
      })
    }

    const handleMouseUp = () => {
      isResizing = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    return resizer
  }

  /**
   * 显示过滤下拉框
   * @private
   */
  private showFilterDropdown(column: TableColumn<T>, trigger: HTMLElement): void {
    // 移除现有的下拉框
    const existingDropdown = document.querySelector('.ldesign-table-filter-dropdown')
    if (existingDropdown) {
      existingDropdown.remove()
    }

    // 创建下拉框
    const dropdown = document.createElement('div')
    dropdown.className = 'ldesign-table-filter-dropdown'

    // 如果有预定义的过滤选项
    if (column.filters && column.filters.length > 0) {
      column.filters.forEach(filter => {
        const option = document.createElement('div')
        option.className = 'ldesign-table-filter-option'
        option.textContent = filter.text
        option.addEventListener('click', () => {
          this.emit('filter-change', {
            column: column.key,
            value: filter.value
          })
          dropdown.remove()
        })
        dropdown.appendChild(option)
      })
    } else {
      // 创建搜索输入框
      const searchInput = document.createElement('input')
      searchInput.type = 'text'
      searchInput.className = 'ldesign-table-filter-input'
      searchInput.placeholder = `搜索 ${column.title}`

      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.emit('filter-change', {
            column: column.key,
            value: searchInput.value
          })
          dropdown.remove()
        }
      })

      dropdown.appendChild(searchInput)

      // 自动聚焦
      setTimeout(() => searchInput.focus(), 0)
    }

    // 定位下拉框
    const rect = trigger.getBoundingClientRect()
    dropdown.style.position = 'fixed'
    dropdown.style.top = `${rect.bottom + 5}px`
    dropdown.style.left = `${rect.left}px`
    dropdown.style.zIndex = '1000'

    document.body.appendChild(dropdown)

    // 点击外部关闭
    const closeDropdown = (e: MouseEvent) => {
      if (!dropdown.contains(e.target as Node)) {
        dropdown.remove()
        document.removeEventListener('click', closeDropdown)
      }
    }

    setTimeout(() => {
      document.addEventListener('click', closeDropdown)
    }, 0)
  }

  /**
   * 渲染多级表头
   */
  private renderMultiLevelHeader(columns: any[]): void {
    // 第一行：父级表头
    const firstRow = document.createElement('tr')
    // 第二行：子级表头
    const secondRow = document.createElement('tr')

    columns.forEach(column => {
      if (column.children) {
        // 父级单元格
        const parentCell = document.createElement('th')
        parentCell.textContent = column.title
        parentCell.colSpan = column.children.length
        firstRow.appendChild(parentCell)

        // 子级单元格
        column.children.forEach((child: any) => {
          const childCell = document.createElement('th')
          childCell.textContent = child.title
          if (child.width) {
            childCell.style.width = `${child.width}px`
          }
          secondRow.appendChild(childCell)
        })
      } else {
        // 跨行单元格
        const cell = document.createElement('th')
        cell.textContent = column.title
        cell.rowSpan = 2
        if (column.width) {
          cell.style.width = `${column.width}px`
        }
        firstRow.appendChild(cell)
      }
    })

    this.header!.appendChild(firstRow)
    this.header!.appendChild(secondRow)
  }

  /**
   * 渲染表体
   * @param data 数据
   * @param columns 列配置
   * @param state 表格状态
   * @private
   */
  private renderBodyInternal(data: T[], columns: TableColumn<T>[], state?: any): void {
    if (!this.body) return

    this.renderBodyRows(data, columns)
  }

  /**
   * 渲染虚拟表体
   * @param data 数据
   * @param columns 列配置
   * @param state 表格状态
   * @param virtualRange 虚拟滚动范围
   * @private
   */
  private renderVirtualBody(data: T[], columns: TableColumn<T>[], state: any, virtualRange: VirtualScrollRange): void {
    if (!this.body) return

    // 创建虚拟容器
    if (!this.virtualContainer) {
      this.virtualContainer = document.createElement('div')
      this.virtualContainer.className = 'ldesign-table-virtual-container'
      this.body.appendChild(this.virtualContainer)
    }

    // 设置虚拟容器高度
    this.virtualContainer.style.height = `${virtualRange.totalHeight}px`
    this.virtualContainer.style.transform = `translateY(${virtualRange.offsetY}px)`

    // 渲染可见范围内的行
    const visibleData = data.slice(virtualRange.start, virtualRange.end)
    this.renderBodyRows(visibleData, columns, virtualRange.start)
  }

  /**
   * 渲染表体行
   * @param data 数据
   * @param columns 列配置
   * @param startIndex 起始索引
   * @private
   */
  private renderBodyRows(data: T[], columns: TableColumn<T>[], startIndex: number = 0): void {
    const container = this.virtualContainer || this.body
    if (!container) return

    container.innerHTML = ''

    data.forEach((row, index) => {
      const actualIndex = startIndex + index
      const rowKey = this.getRowKey(row)

      // 创建主行
      const rowElement = this.createBodyRow(row, columns, actualIndex, rowKey)
      container.appendChild(rowElement)

      // 如果行是展开状态，创建展开行
      if (this.expandable && this.isRowExpanded(rowKey)) {
        const expandedRow = this.createExpandedRow(row, columns, actualIndex)
        container.appendChild(expandedRow)
      }
    })
  }

  /**
   * 创建表体行
   * @private
   */
  private createBodyRow(row: T, columns: TableColumn<T>[], index: number, rowKey: TableId): HTMLElement {
    const rowElement = document.createElement('tr')
    rowElement.className = 'ldesign-table-body-row'
    rowElement.dataset['index'] = String(index)
    rowElement.dataset['key'] = String(rowKey)

    // 添加行状态类
    if (this.isRowSelected(rowKey)) {
      rowElement.classList.add('ldesign-table-row-selected')
    }
    if (this.isRowExpanded(rowKey)) {
      rowElement.classList.add('ldesign-table-row-expanded')
    }

    // 添加选择列
    if (this.selectable) {
      const selectionCell = this.createSelectionCell(rowKey)
      rowElement.appendChild(selectionCell)
    }

    // 添加展开列
    if (this.expandable) {
      const expandCell = this.createExpandCell(rowKey)
      rowElement.appendChild(expandCell)
    }

    // 添加数据列
    columns.forEach((column, columnIndex) => {
      const cell = this.createDataCell(row, column, index, columnIndex)
      rowElement.appendChild(cell)
    })

    return rowElement
  }

  /**
   * 创建选择单元格
   * @private
   */
  private createSelectionCell(rowKey: TableId): HTMLElement {
    const cell = document.createElement('td')
    cell.className = 'ldesign-table-selection-cell'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'ldesign-table-checkbox'
    checkbox.checked = this.isRowSelected(rowKey)

    checkbox.addEventListener('change', () => {
      this.emit('selection-change', {
        rowKey,
        selected: checkbox.checked
      })
    })

    cell.appendChild(checkbox)
    return cell
  }

  /**
   * 创建展开单元格
   * @private
   */
  private createExpandCell(rowKey: TableId): HTMLElement {
    const cell = document.createElement('td')
    cell.className = 'ldesign-table-expand-cell'

    const button = document.createElement('button')
    button.className = 'ldesign-table-expand-button'
    button.type = 'button'

    const isExpanded = this.isRowExpanded(rowKey)
    button.innerHTML = isExpanded ? '−' : '+'
    button.setAttribute('aria-expanded', String(isExpanded))

    button.addEventListener('click', () => {
      this.emit('expand-change', {
        rowKey,
        expanded: !isExpanded
      })
    })

    cell.appendChild(button)
    return cell
  }

  /**
   * 创建数据单元格
   * @private
   */
  private createDataCell(row: T, column: TableColumn<T>, rowIndex: number, columnIndex: number): HTMLElement {
    const cell = document.createElement('td')
    cell.className = 'ldesign-table-body-cell'
    cell.dataset.columnKey = column.key
    cell.dataset.columnIndex = String(columnIndex)

    // 渲染单元格内容
    const value = row[column.key]
    if (column.render) {
      const rendered = column.render(value, row, rowIndex)
      if (typeof rendered === 'string') {
        cell.innerHTML = rendered
      } else {
        cell.appendChild(rendered)
      }
    } else {
      cell.textContent = String(value ?? '')
    }

    // 设置列样式
    if (column.width) {
      cell.style.width = `${column.width}px`
    }
    if (column.align) {
      cell.style.textAlign = column.align
    }
    if (column.fixed) {
      cell.classList.add(`ldesign-table-fixed-${column.fixed}`)
    }
    if (column.className) {
      cell.classList.add(column.className)
    }

    return cell
  }

  /**
   * 创建展开行
   * @private
   */
  private createExpandedRow(row: T, columns: TableColumn<T>[], index: number): HTMLElement {
    const expandedRow = document.createElement('tr')
    expandedRow.className = 'ldesign-table-expanded-row'
    expandedRow.dataset['parentIndex'] = String(index)

    const cell = document.createElement('td')
    cell.className = 'ldesign-table-expanded-cell'

    // 计算colspan
    let colspan = columns.length
    if (this.selectable) colspan++
    if (this.expandable) colspan++
    cell.colSpan = colspan

    // 渲染展开内容
    if (this.expandRenderer) {
      const content = this.expandRenderer(row)
      if (typeof content === 'string') {
        cell.innerHTML = content
      } else {
        cell.appendChild(content as HTMLElement)
      }
    }

    expandedRow.appendChild(cell)
    return expandedRow
  }

  /**
   * 检查行是否被选中
   * @private
   */
  private isRowSelected(rowKey: TableId): boolean {
    // 这里应该从状态管理器获取选中状态
    // 暂时返回false，实际实现时需要连接到SelectionManager
    return false
  }

  /**
   * 检查行是否展开
   * @private
   */
  private isRowExpanded(rowKey: TableId): boolean {
    // 这里应该从状态管理器获取展开状态
    // 暂时返回false，实际实现时需要连接到ExpandManager
    return false
  }

  /**
   * 渲染表脚
   * @param columns 列配置
   * @param state 表格状态
   * @private
   */
  private renderFooterInternal(columns: TableColumn<T>[], state?: any): void {
    if (!this.footer || this.footerData.length === 0) return

    // 清空现有内容
    this.footer.innerHTML = ''

    // 为每行表尾数据创建一行
    this.footerData.forEach(rowData => {
      const footerRow = document.createElement('tr')

      columns.forEach(column => {
        const cell = document.createElement('td')
        const value = rowData[column.key]
        cell.textContent = value != null ? String(value) : ''

        // 设置列样式
        if (column.width) {
          cell.style.width = `${column.width}px`
        }
        if (column.align) {
          cell.style.textAlign = column.align
        }

        footerRow.appendChild(cell)
      })

      this.footer.appendChild(footerRow)
    })
  }

  /**
   * 获取行键
   * @param row 行数据
   * @private
   */
  private getRowKey(row: T): TableId {
    return (row as any)['id'] ?? (row as any)['key'] ?? JSON.stringify(row)
  }

  /**
   * 获取容器元素
   * @returns 容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取列配置
   * @returns 列配置数组
   */
  getColumns(): TableColumn<T>[] {
    return this.currentColumns
  }

  /**
   * 设置列配置
   * @param columns 列配置数组
   */
  setColumns(columns: TableColumn<T>[]): void {
    this.currentColumns = columns
  }

  /**
   * 设置数据
   * @param data 数据数组
   */
  setData(data: T[]): void {
    this.currentData = data
  }

  /**
   * 获取数据
   * @returns 数据数组
   */
  getData(): T[] {
    return this.currentData
  }





  /**
   * 设置表尾数据
   * @param data 表尾数据
   */
  setFooterData(data: any[]): void {
    this.footerData = data
  }

  /**
   * 设置是否可排序
   * @param sortable 是否可排序
   */
  setSortable(sortable: boolean): void {
    // 设置排序逻辑
  }

  /**
   * 更新排序状态
   * @param column 列键
   * @param direction 排序方向
   */
  updateSortState(column: string, direction: 'asc' | 'desc'): void {
    // 更新排序状态逻辑
  }

  /**
   * 设置是否可过滤
   * @param filterable 是否可过滤
   */
  setFilterable(filterable: boolean): void {
    // 设置过滤逻辑
  }

  /**
   * 更新过滤状态
   * @param filters 过滤条件
   */
  updateFilterState(filters: Record<string, any>): void {
    // 更新过滤状态逻辑
  }

  /**
   * 设置节流时间
   * @param ms 节流时间（毫秒）
   */
  setThrottleMs(ms: number): void {
    // 设置节流时间逻辑
  }

  /**
   * 发射事件
   * @private
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error)
        }
      })
    }
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) return

    if (listener) {
      const listeners = this.eventListeners.get(eventName)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(eventName)
    }
  }

  /**
   * 设置选择状态
   */
  setSelectable(selectable: boolean): void {
    this.selectable = selectable
  }

  /**
   * 设置展开状态
   */
  setExpandable(expandable: boolean): void {
    this.expandable = expandable
  }

  /**
   * 设置展开渲染器
   */
  setExpandRenderer(renderer: (row: T) => string): void {
    this.expandRenderer = renderer
  }

  /**
   * 设置项目高度
   */
  setItemHeight(height: number): void {
    this.itemHeight = height
  }

  /**
   * 设置动态高度
   */
  setDynamicHeight(dynamic: boolean): void {
    this.dynamicHeight = dynamic
    if (dynamic) {
      this.itemHeights = new Map()
    }
  }

  /**
   * 获取行高度
   */
  getItemHeight(index: number): number {
    if (this.dynamicHeight && this.itemHeights?.has(index)) {
      return this.itemHeights.get(index)!
    }
    return this.itemHeight
  }

  /**
   * 设置行高度
   */
  setItemHeightAt(index: number, height: number): void {
    if (this.dynamicHeight) {
      if (!this.itemHeights) {
        this.itemHeights = new Map()
      }
      this.itemHeights.set(index, height)
    }
  }

  /**
   * 绑定事件
   */
  bindEvents(): void {
    if (!this.container) return

    // 绑定点击事件
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'TD') {
        this.emit('cell-click', { target, event })
      }
    })

    // 绑定键盘事件
    this.container.addEventListener('keydown', (event) => {
      this.emit('key-down', { event })
    })
  }



  /**
   * 公共渲染表头方法
   * @returns 表头元素
   */
  renderHeader(): HTMLElement | undefined {
    if (!this.header) {
      this.initializeStructure()
    }

    if (this.currentColumns.length > 0) {
      this.renderHeaderInternal(this.currentColumns)
    }

    return this.header
  }

  /**
   * 公共渲染表体方法
   * @returns 表体元素
   */
  renderBody(): HTMLElement | undefined {
    if (!this.body) {
      this.initializeStructure()
    }

    if (this.currentData.length > 0 && this.currentColumns.length > 0) {
      // 使用可见范围渲染
      const range = this.getVisibleRange()
      const visibleData = this.currentData.slice(range.start, range.end)
      this.renderBodyRows(visibleData, this.currentColumns, range.start)
    }

    return this.body
  }

  /**
   * 公共渲染表尾方法
   * @returns 表尾元素
   */
  renderFooter(): HTMLElement | undefined {
    if (!this.footer) {
      this.initializeStructure()
    }

    if (this.footerData.length > 0) {
      this.renderFooterInternal(this.currentColumns)
    }

    return this.footer
  }

  /**
   * 渲染单元格
   * @param row 行数据
   * @param column 列配置
   * @returns 单元格元素
   */
  renderCell(row: T, column: TableColumn<T>): HTMLElement {
    const cell = document.createElement('td')
    cell.className = 'ldesign-table-cell'

    if (column.render) {
      const value = row[column.key]
      const rendered = column.render(value, row, 0)
      if (typeof rendered === 'string') {
        cell.innerHTML = rendered
      } else {
        cell.appendChild(rendered)
      }
    } else {
      const value = (row as any)[column.key]
      cell.textContent = value != null ? String(value) : ''
    }

    return cell
  }

  /**
   * 设置可见范围
   * @param range 可见范围
   */
  setVisibleRange(range: { start: number; end: number }): void {
    this.visibleRange = range
  }

  /**
   * 获取可见范围
   * @returns 可见范围
   */
  getVisibleRange(): { start: number; end: number } {
    return this.visibleRange || { start: 0, end: this.currentData.length }
  }



  /**
   * 更新虚拟滚动内容
   * @param range 可见范围
   */
  updateVirtualContent(range: { start: number; end: number }): void {
    this.setVisibleRange(range)
    if (this.currentData.length > 0 && this.currentColumns.length > 0) {
      this.renderBodyRows(this.currentData.slice(range.start, range.end), this.currentColumns)
    }
  }



  /**
   * 按索引设置项目高度
   * @param index 索引
   * @param height 高度
   */
  setItemHeightByIndex(index: number, height: number): void {
    if (!this.itemHeights) {
      this.itemHeights = new Map()
    }
    this.itemHeights.set(index, height)
  }

  /**
   * 计算虚拟滚动偏移
   * @param startIndex 开始索引
   * @returns 偏移量
   */
  calculateVirtualOffset(startIndex: number): number {
    if (this.dynamicHeight && this.itemHeights) {
      let offset = 0
      for (let i = 0; i < startIndex; i++) {
        offset += this.itemHeights.get(i) || this.itemHeight || 40
      }
      return offset
    }
    return startIndex * (this.itemHeight || 40)
  }

  /**
   * 更新选择状态
   * @param selectedKeys 选中的行键
   */
  updateSelection(selectedKeys: TableId[]): void {
    if (!this.body) return

    // 将所有键转换为字符串进行比较
    const selectedSet = new Set(selectedKeys.map(key => String(key)))
    const rows = this.body.querySelectorAll('tr')

    rows.forEach(row => {
      const key = row.dataset['key']
      if (key) {
        if (selectedSet.has(key)) {
          row.classList.add('selected')
        } else {
          row.classList.remove('selected')
        }
      }
    })
  }

  /**
   * 更新表头选择状态
   * @param state 选择状态
   */
  updateHeaderSelectionState(state: 'all' | 'none' | 'indeterminate'): void {
    if (!this.header) return

    let headerCheckbox = this.header.querySelector('input[type="checkbox"]') as HTMLInputElement

    // 如果没有checkbox，创建一个
    if (!headerCheckbox) {
      const firstCell = this.header.querySelector('th')
      if (firstCell) {
        headerCheckbox = document.createElement('input')
        headerCheckbox.type = 'checkbox'
        firstCell.insertBefore(headerCheckbox, firstCell.firstChild)
      }
    }

    if (headerCheckbox) {
      headerCheckbox.checked = state === 'all'
      headerCheckbox.indeterminate = state === 'indeterminate'
    }
  }

  /**
   * 更新展开状态
   * @param expandedKeys 展开的行键
   */
  updateExpansion(expandedKeys: TableId[]): void {
    if (!this.body) return

    // 将所有键转换为字符串进行比较
    const expandedSet = new Set(expandedKeys.map(key => String(key)))
    const rows = this.body.querySelectorAll('tr')

    rows.forEach(row => {
      const key = row.dataset['key']
      if (key) {
        if (expandedSet.has(key)) {
          row.classList.add('expanded')
        } else {
          row.classList.remove('expanded')
        }
      }
    })
  }



  /**
   * 渲染展开内容
   * @param row 行数据
   * @returns 展开内容元素
   */
  renderExpandedContent(row: T): HTMLElement {
    const expandedElement = document.createElement('div')
    expandedElement.className = 'ldesign-table-expanded-content'

    if (this.expandRenderer) {
      expandedElement.innerHTML = this.expandRenderer(row)
    }

    return expandedElement
  }

  // ==================== 排序和筛选UI处理方法 ====================

  /**
   * 处理排序变化
   * @private
   */
  private handleSortChange(column: string, direction: any): void {
    this.currentSortState = direction ? { column, direction } : null

    // 触发排序变化事件
    if (this.eventManager) {
      this.eventManager.emit('sort-change', {
        column,
        direction,
        sortState: this.currentSortState
      })
    }
  }

  /**
   * 处理筛选变化
   * @private
   */
  private handleFilterChange(column: string, values: any[]): void {
    if (values.length === 0) {
      delete this.currentFilterState[column]
    } else {
      this.currentFilterState[column] = values
    }

    // 触发筛选变化事件
    if (this.eventManager) {
      this.eventManager.emit('filter-change', {
        column,
        values,
        filterState: this.currentFilterState
      })
    }
  }

  /**
   * 获取筛选选项
   * @private
   */
  private getFilterOptions(column: TableColumn<T>): FilterOption[] {
    // 如果列配置中有预定义的筛选选项，使用它们
    if (column.filters && Array.isArray(column.filters)) {
      return column.filters.map(filter => ({
        value: filter.value,
        label: filter.text || String(filter.value)
      }))
    }

    // 否则从当前数据中提取唯一值
    const uniqueValues = new Set<any>()
    this.currentData.forEach(row => {
      const value = row[column.key]
      if (value !== null && value !== undefined) {
        uniqueValues.add(value)
      }
    })

    return Array.from(uniqueValues).map(value => ({
      value,
      label: String(value)
    }))
  }

  /**
   * 更新排序指示器状态
   */
  updateSortIndicators(sortState: TableSortState | null): void {
    this.currentSortState = sortState

    // 更新所有排序指示器
    this.sortIndicators.forEach((indicator, column) => {
      const direction = sortState?.column === column ? sortState.direction : null
      indicator.setDirection(direction)
    })
  }

  /**
   * 更新筛选下拉框状态
   */
  updateFilterDropdowns(filterState: TableFilterState): void {
    this.currentFilterState = filterState

    // 更新所有筛选下拉框
    this.filterDropdowns.forEach((dropdown, column) => {
      const selectedValues = filterState[column] || []
      dropdown.setSelectedValues(selectedValues)
    })
  }

  /**
   * 清理排序和筛选UI组件
   * @private
   */
  private cleanupSortFilterComponents(): void {
    // 销毁排序指示器
    this.sortIndicators.forEach(indicator => {
      indicator.destroy()
    })
    this.sortIndicators.clear()

    // 销毁筛选下拉框
    this.filterDropdowns.forEach(dropdown => {
      dropdown.destroy()
    })
    this.filterDropdowns.clear()
  }

}
