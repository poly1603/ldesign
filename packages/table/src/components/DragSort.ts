/**
 * 拖拽排序组件
 * 
 * 提供表格行的拖拽排序功能
 * 支持可视化拖拽反馈和排序动画
 */

import type { TableRow, TableId } from '../types'
import { EventManager } from '../managers/EventManager'

/**
 * 拖拽配置
 */
export interface DragSortConfig {
  /** 是否启用拖拽排序 */
  enabled: boolean
  /** 拖拽手柄选择器 */
  handleSelector?: string
  /** 是否显示拖拽指示器 */
  showIndicator?: boolean
  /** 拖拽动画持续时间 */
  animationDuration?: number
  /** 是否启用自动滚动 */
  autoScroll?: boolean
  /** 自动滚动速度 */
  scrollSpeed?: number
  /** 拖拽约束 */
  constraints?: {
    /** 最小行索引 */
    minIndex?: number
    /** 最大行索引 */
    maxIndex?: number
    /** 禁止拖拽的行 */
    disabledRows?: TableId[]
  }
}

/**
 * 拖拽事件数据
 */
export interface DragEventData<T = any> {
  /** 拖拽的行数据 */
  row: T
  /** 原始索引 */
  fromIndex: number
  /** 目标索引 */
  toIndex: number
  /** 拖拽元素 */
  element: HTMLElement
}

/**
 * 拖拽状态
 */
interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 拖拽元素 */
  dragElement: HTMLElement | null
  /** 拖拽行数据 */
  dragRow: any
  /** 拖拽起始索引 */
  startIndex: number
  /** 当前目标索引 */
  targetIndex: number
  /** 拖拽偏移 */
  offset: { x: number; y: number }
  /** 占位符元素 */
  placeholder: HTMLElement | null
}

/**
 * 拖拽排序实现类
 */
export class DragSort<T extends TableRow = TableRow> {
  /** 事件管理器 */
  private eventManager: EventManager

  /** 配置 */
  private config: Required<DragSortConfig>

  /** 表格容器 */
  private container: HTMLElement | null = null

  /** 表格体元素 */
  private tbody: HTMLElement | null = null

  /** 拖拽状态 */
  private dragState: DragState = {
    isDragging: false,
    dragElement: null,
    dragRow: null,
    startIndex: -1,
    targetIndex: -1,
    offset: { x: 0, y: 0 },
    placeholder: null
  }

  /** 行元素缓存 */
  private rowElements: HTMLElement[] = []

  /** 自动滚动定时器 */
  private autoScrollTimer: number | null = null

  /**
   * 构造函数
   */
  constructor(config: DragSortConfig = { enabled: true }) {
    this.config = {
      enabled: true,
      handleSelector: '.drag-handle',
      showIndicator: true,
      animationDuration: 300,
      autoScroll: true,
      scrollSpeed: 5,
      constraints: {},
      ...config
    }

    this.eventManager = new EventManager()
    this.bindGlobalEvents()
  }

  /**
   * 初始化拖拽排序
   */
  init(container: HTMLElement): void {
    this.container = container
    this.tbody = container.querySelector('tbody')
    
    if (!this.tbody) {
      console.warn('DragSort: 未找到tbody元素')
      return
    }

    this.updateRowElements()
    this.bindDragEvents()
  }

  /**
   * 更新行元素缓存
   */
  updateRowElements(): void {
    if (!this.tbody) return

    this.rowElements = Array.from(this.tbody.querySelectorAll('tr'))
    this.updateDragHandles()
  }

  /**
   * 更新拖拽手柄
   * @private
   */
  private updateDragHandles(): void {
    this.rowElements.forEach((row, index) => {
      // 添加拖拽属性
      row.setAttribute('draggable', 'true')
      row.setAttribute('data-row-index', index.toString())

      // 查找或创建拖拽手柄
      let handle = row.querySelector(this.config.handleSelector) as HTMLElement
      if (!handle && this.config.handleSelector === '.drag-handle') {
        handle = this.createDragHandle()
        const firstCell = row.querySelector('td')
        if (firstCell) {
          firstCell.insertBefore(handle, firstCell.firstChild)
        }
      }

      if (handle) {
        handle.style.cursor = 'grab'
        handle.title = '拖拽排序'
      }
    })
  }

  /**
   * 创建拖拽手柄
   * @private
   */
  private createDragHandle(): HTMLElement {
    const handle = document.createElement('span')
    handle.className = 'drag-handle'
    handle.innerHTML = '⋮⋮'
    handle.style.cssText = `
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      color: var(--ldesign-text-color-placeholder);
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      cursor: grab;
      user-select: none;
    `
    return handle
  }

  /**
   * 绑定全局事件
   * @private
   */
  private bindGlobalEvents(): void {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
  }

  /**
   * 绑定拖拽事件
   * @private
   */
  private bindDragEvents(): void {
    if (!this.tbody) return

    this.tbody.addEventListener('dragstart', this.handleDragStart.bind(this))
    this.tbody.addEventListener('dragover', this.handleDragOver.bind(this))
    this.tbody.addEventListener('drop', this.handleDrop.bind(this))
    this.tbody.addEventListener('dragend', this.handleDragEnd.bind(this))
  }

  /**
   * 处理拖拽开始
   * @private
   */
  private handleDragStart(event: DragEvent): void {
    if (!this.config.enabled) return

    const target = event.target as HTMLElement
    const row = target.closest('tr') as HTMLElement
    
    if (!row || !this.isValidDragTarget(target, row)) {
      event.preventDefault()
      return
    }

    const rowIndex = parseInt(row.getAttribute('data-row-index') || '0')
    
    // 检查拖拽约束
    if (!this.canDragRow(rowIndex)) {
      event.preventDefault()
      return
    }

    // 设置拖拽状态
    this.dragState = {
      isDragging: true,
      dragElement: row,
      dragRow: this.getRowData(rowIndex),
      startIndex: rowIndex,
      targetIndex: rowIndex,
      offset: { x: 0, y: 0 },
      placeholder: null
    }

    // 设置拖拽效果
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', row.outerHTML)
    }

    // 创建占位符
    this.createPlaceholder(row)

    // 设置拖拽样式
    row.style.opacity = '0.5'
    row.style.transform = 'rotate(2deg)'

    // 触发拖拽开始事件
    this.eventManager.emit('drag-start', {
      row: this.dragState.dragRow,
      fromIndex: rowIndex,
      toIndex: rowIndex,
      element: row
    })
  }

  /**
   * 处理拖拽悬停
   * @private
   */
  private handleDragOver(event: DragEvent): void {
    if (!this.dragState.isDragging) return

    event.preventDefault()
    
    const target = event.target as HTMLElement
    const row = target.closest('tr') as HTMLElement
    
    if (!row) return

    const rowIndex = parseInt(row.getAttribute('data-row-index') || '0')
    
    if (rowIndex !== this.dragState.targetIndex) {
      this.dragState.targetIndex = rowIndex
      this.updatePlaceholderPosition(rowIndex)
    }

    // 自动滚动
    if (this.config.autoScroll) {
      this.handleAutoScroll(event)
    }
  }

  /**
   * 处理拖拽放置
   * @private
   */
  private handleDrop(event: DragEvent): void {
    if (!this.dragState.isDragging) return

    event.preventDefault()

    const fromIndex = this.dragState.startIndex
    const toIndex = this.dragState.targetIndex

    if (fromIndex !== toIndex) {
      // 触发排序事件
      this.eventManager.emit('sort-change', {
        row: this.dragState.dragRow,
        fromIndex,
        toIndex,
        element: this.dragState.dragElement
      })
    }

    this.finishDrag()
  }

  /**
   * 处理拖拽结束
   * @private
   */
  private handleDragEnd(event: DragEvent): void {
    this.finishDrag()
  }

  /**
   * 处理鼠标移动（用于自定义拖拽效果）
   * @private
   */
  private handleMouseMove(event: MouseEvent): void {
    // 可以在这里添加自定义拖拽效果
  }

  /**
   * 处理鼠标释放
   * @private
   */
  private handleMouseUp(event: MouseEvent): void {
    // 可以在这里添加自定义拖拽结束逻辑
  }

  /**
   * 检查是否为有效的拖拽目标
   * @private
   */
  private isValidDragTarget(target: HTMLElement, row: HTMLElement): boolean {
    // 如果指定了手柄选择器，检查是否点击了手柄
    if (this.config.handleSelector) {
      return target.closest(this.config.handleSelector) !== null
    }
    return true
  }

  /**
   * 检查行是否可以拖拽
   * @private
   */
  private canDragRow(index: number): boolean {
    const constraints = this.config.constraints

    // 检查索引范围
    if (constraints.minIndex !== undefined && index < constraints.minIndex) {
      return false
    }
    if (constraints.maxIndex !== undefined && index > constraints.maxIndex) {
      return false
    }

    // 检查禁用行
    if (constraints.disabledRows) {
      const rowData = this.getRowData(index)
      if (rowData && constraints.disabledRows.includes(rowData.id)) {
        return false
      }
    }

    return true
  }

  /**
   * 获取行数据
   * @private
   */
  private getRowData(index: number): any {
    // 这里需要从外部获取行数据，可以通过事件或回调实现
    return { id: index, index }
  }

  /**
   * 创建占位符
   * @private
   */
  private createPlaceholder(row: HTMLElement): void {
    if (!this.config.showIndicator) return

    const placeholder = row.cloneNode(true) as HTMLElement
    placeholder.style.cssText = `
      opacity: 0.3;
      background-color: var(--ldesign-brand-color-2);
      border: 2px dashed var(--ldesign-brand-color);
      pointer-events: none;
    `
    placeholder.className += ' drag-placeholder'

    this.dragState.placeholder = placeholder
  }

  /**
   * 更新占位符位置
   * @private
   */
  private updatePlaceholderPosition(targetIndex: number): void {
    if (!this.dragState.placeholder || !this.tbody) return

    const targetRow = this.rowElements[targetIndex]
    if (!targetRow) return

    // 移除旧占位符
    const oldPlaceholder = this.tbody.querySelector('.drag-placeholder')
    if (oldPlaceholder) {
      oldPlaceholder.remove()
    }

    // 插入新占位符
    if (targetIndex > this.dragState.startIndex) {
      targetRow.parentNode?.insertBefore(this.dragState.placeholder, targetRow.nextSibling)
    } else {
      targetRow.parentNode?.insertBefore(this.dragState.placeholder, targetRow)
    }
  }

  /**
   * 处理自动滚动
   * @private
   */
  private handleAutoScroll(event: DragEvent): void {
    if (!this.container) return

    const containerRect = this.container.getBoundingClientRect()
    const scrollThreshold = 50
    const mouseY = event.clientY

    let scrollDirection = 0

    if (mouseY < containerRect.top + scrollThreshold) {
      scrollDirection = -1
    } else if (mouseY > containerRect.bottom - scrollThreshold) {
      scrollDirection = 1
    }

    if (scrollDirection !== 0) {
      if (!this.autoScrollTimer) {
        this.autoScrollTimer = window.setInterval(() => {
          this.container!.scrollTop += scrollDirection * this.config.scrollSpeed
        }, 16)
      }
    } else {
      this.stopAutoScroll()
    }
  }

  /**
   * 停止自动滚动
   * @private
   */
  private stopAutoScroll(): void {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer)
      this.autoScrollTimer = null
    }
  }

  /**
   * 完成拖拽
   * @private
   */
  private finishDrag(): void {
    if (!this.dragState.isDragging) return

    // 恢复拖拽元素样式
    if (this.dragState.dragElement) {
      this.dragState.dragElement.style.opacity = ''
      this.dragState.dragElement.style.transform = ''
    }

    // 移除占位符
    if (this.dragState.placeholder && this.dragState.placeholder.parentNode) {
      this.dragState.placeholder.parentNode.removeChild(this.dragState.placeholder)
    }

    // 停止自动滚动
    this.stopAutoScroll()

    // 触发拖拽结束事件
    this.eventManager.emit('drag-end', {
      row: this.dragState.dragRow,
      fromIndex: this.dragState.startIndex,
      toIndex: this.dragState.targetIndex,
      element: this.dragState.dragElement
    })

    // 重置拖拽状态
    this.dragState = {
      isDragging: false,
      dragElement: null,
      dragRow: null,
      startIndex: -1,
      targetIndex: -1,
      offset: { x: 0, y: 0 },
      placeholder: null
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DragSortConfig>): void {
    this.config = { ...this.config, ...config }
    this.updateRowElements()
  }

  /**
   * 获取拖拽状态
   */
  isDragging(): boolean {
    return this.dragState.isDragging
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁拖拽排序
   */
  destroy(): void {
    this.stopAutoScroll()
    this.finishDrag()
    this.eventManager.destroy()
    this.container = null
    this.tbody = null
    this.rowElements = []
  }
}
