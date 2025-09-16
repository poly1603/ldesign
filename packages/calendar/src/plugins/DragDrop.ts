/**
 * 拖拽插件
 */

import type { CalendarPlugin, PluginContext, DragDropOptions } from './types'
import type { CalendarEvent } from '../types'
import { DateUtils } from '../utils/date'
import { DOMUtils } from '../utils/dom'

/**
 * 拖拽插件类
 */
export class DragDropPlugin implements CalendarPlugin {
  public readonly name = 'DragDropPlugin'
  public readonly version = '1.0.0'
  public readonly description = '拖拽插件，支持事件拖拽和调整大小'
  public readonly author = 'ldesign'

  public readonly defaultOptions: DragDropOptions = {
    enabled: true,
    priority: 20,
    config: {
      enableDrag: true,
      enableDrop: true,
      enableResize: true,
      dragOpacity: 0.7,
      dragCursor: 'grabbing',
      showGuides: true
    }
  }

  private context?: PluginContext
  private isDragging = false
  private isResizing = false
  private dragElement?: HTMLElement
  private dragEvent?: CalendarEvent
  private dragStartPos = { x: 0, y: 0 }
  private dragOffset = { x: 0, y: 0 }
  private originalPosition?: { top: number; left: number }
  private dropZones: HTMLElement[] = []
  private guideLines: HTMLElement[] = []

  /**
   * 安装插件
   */
  public install(context: PluginContext): void {
    this.context = context
    this.bindEvents()
  }

  /**
   * 卸载插件
   */
  public uninstall(context: PluginContext): void {
    this.cleanup()
  }

  /**
   * 日历渲染后钩子
   */
  public afterRender(context: PluginContext): void {
    this.setupDragDropElements()
  }

  /**
   * 设置拖拽元素
   */
  private setupDragDropElements(): void {
    if (!this.context) return

    const config = this.context.options
    const calendarContainer = this.context.calendar.getContainer()

    // 为事件元素添加拖拽功能
    if (config.enableDrag) {
      const eventElements = calendarContainer.querySelectorAll('.ldesign-calendar-event')
      eventElements.forEach(element => {
        this.makeElementDraggable(element as HTMLElement)
      })
    }

    // 为日期单元格添加放置功能
    if (config.enableDrop) {
      const dateCells = calendarContainer.querySelectorAll('.ldesign-calendar-date-cell, .ldesign-calendar-day-time-cell')
      dateCells.forEach(cell => {
        this.makeElementDroppable(cell as HTMLElement)
      })
    }

    // 为事件元素添加调整大小功能
    if (config.enableResize) {
      const eventElements = calendarContainer.querySelectorAll('.ldesign-calendar-event')
      eventElements.forEach(element => {
        this.makeElementResizable(element as HTMLElement)
      })
    }
  }

  /**
   * 使元素可拖拽
   */
  private makeElementDraggable(element: HTMLElement): void {
    element.draggable = true
    element.style.cursor = 'grab'

    element.addEventListener('dragstart', this.handleDragStart.bind(this))
    element.addEventListener('dragend', this.handleDragEnd.bind(this))
    
    // 鼠标事件（用于更精确的拖拽控制）
    element.addEventListener('mousedown', this.handleMouseDown.bind(this))
  }

  /**
   * 使元素可放置
   */
  private makeElementDroppable(element: HTMLElement): void {
    element.addEventListener('dragover', this.handleDragOver.bind(this))
    element.addEventListener('drop', this.handleDrop.bind(this))
    element.addEventListener('dragenter', this.handleDragEnter.bind(this))
    element.addEventListener('dragleave', this.handleDragLeave.bind(this))
  }

  /**
   * 使元素可调整大小
   */
  private makeElementResizable(element: HTMLElement): void {
    // 添加调整大小手柄
    const resizeHandles = ['top', 'bottom']
    
    resizeHandles.forEach(direction => {
      const handle = DOMUtils.createElement('div', {
        className: `ldesign-calendar-resize-handle resize-${direction}`,
        style: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          cursor: direction === 'top' || direction === 'bottom' ? 'n-resize' : 'e-resize',
          zIndex: '10'
        }
      })

      if (direction === 'top') {
        handle.style.top = '-2px'
        handle.style.left = '0'
        handle.style.right = '0'
        handle.style.height = '4px'
      } else if (direction === 'bottom') {
        handle.style.bottom = '-2px'
        handle.style.left = '0'
        handle.style.right = '0'
        handle.style.height = '4px'
      }

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        this.handleResizeStart(e, element, direction)
      })

      element.appendChild(handle)
    })
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart(event: DragEvent): void {
    if (!this.context || !event.target) return

    const element = event.target as HTMLElement
    const eventId = element.dataset.eventId
    if (!eventId) return

    const calendarEvent = this.context.calendar.getEventManager().getEvent(eventId)
    if (!calendarEvent) return

    this.isDragging = true
    this.dragElement = element
    this.dragEvent = calendarEvent

    const config = this.context.options
    
    // 设置拖拽样式
    element.style.opacity = config.dragOpacity?.toString() || '0.7'
    element.style.cursor = config.dragCursor || 'grabbing'

    // 设置拖拽数据
    event.dataTransfer?.setData('text/plain', eventId)
    event.dataTransfer?.setData('application/json', JSON.stringify(calendarEvent))

    // 显示辅助线
    if (config.showGuides) {
      this.showGuideLines()
    }

    this.context.emit('drag:start', calendarEvent, element)
  }

  /**
   * 处理拖拽结束
   */
  private handleDragEnd(event: DragEvent): void {
    if (!this.context || !this.dragElement || !this.dragEvent) return

    // 恢复样式
    this.dragElement.style.opacity = '1'
    this.dragElement.style.cursor = 'grab'

    // 隐藏辅助线
    this.hideGuideLines()

    this.context.emit('drag:end', this.dragEvent, this.dragElement)

    // 清理状态
    this.isDragging = false
    this.dragElement = undefined
    this.dragEvent = undefined
  }

  /**
   * 处理鼠标按下
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.context || event.button !== 0) return // 只处理左键

    const element = event.target as HTMLElement
    const eventId = element.dataset.eventId
    if (!eventId) return

    this.dragStartPos = { x: event.clientX, y: event.clientY }
    this.dragOffset = {
      x: event.clientX - element.getBoundingClientRect().left,
      y: event.clientY - element.getBoundingClientRect().top
    }

    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.dragElement) return

    const deltaX = event.clientX - this.dragStartPos.x
    const deltaY = event.clientY - this.dragStartPos.y

    // 更新元素位置
    this.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    this.dragElement.style.zIndex = '1000'

    // 更新辅助线
    this.updateGuideLines(event.clientX, event.clientY)
  }

  /**
   * 处理鼠标释放
   */
  private handleMouseUp(event: MouseEvent): void {
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this))

    if (!this.isDragging || !this.dragElement || !this.dragEvent) return

    // 查找放置目标
    const dropTarget = this.findDropTarget(event.clientX, event.clientY)
    if (dropTarget) {
      this.handleEventDrop(dropTarget)
    } else {
      // 恢复原位置
      this.dragElement.style.transform = ''
      this.dragElement.style.zIndex = ''
    }
  }

  /**
   * 处理拖拽悬停
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
  }

  /**
   * 处理拖拽进入
   */
  private handleDragEnter(event: DragEvent): void {
    const element = event.target as HTMLElement
    element.classList.add('drag-over')
  }

  /**
   * 处理拖拽离开
   */
  private handleDragLeave(event: DragEvent): void {
    const element = event.target as HTMLElement
    element.classList.remove('drag-over')
  }

  /**
   * 处理放置
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault()
    
    const element = event.target as HTMLElement
    element.classList.remove('drag-over')

    this.handleEventDrop(element)
  }

  /**
   * 处理事件放置
   */
  private handleEventDrop(dropTarget: HTMLElement): void {
    if (!this.context || !this.dragEvent) return

    const newDate = this.getDateFromElement(dropTarget)
    if (!newDate) return

    // 计算新的开始和结束时间
    const originalStart = DateUtils.dayjs(this.dragEvent.start)
    const originalEnd = this.dragEvent.end ? DateUtils.dayjs(this.dragEvent.end) : null
    const duration = originalEnd ? originalEnd.diff(originalStart) : 0

    const newStart = DateUtils.dayjs(newDate)
    const newEnd = originalEnd ? newStart.add(duration, 'millisecond') : null

    // 更新事件
    const updates: Partial<CalendarEvent> = {
      start: newStart.toDate(),
      end: newEnd?.toDate()
    }

    this.context.calendar.getEventManager().updateEvent(this.dragEvent.id, updates)

    // 恢复拖拽元素样式
    if (this.dragElement) {
      this.dragElement.style.transform = ''
      this.dragElement.style.zIndex = ''
    }

    this.context.emit('event:drop', this.dragEvent, newStart.toDate(), this.dragElement)
  }

  /**
   * 处理调整大小开始
   */
  private handleResizeStart(event: MouseEvent, element: HTMLElement, direction: string): void {
    if (!this.context) return

    event.preventDefault()
    event.stopPropagation()

    const eventId = element.dataset.eventId
    if (!eventId) return

    const calendarEvent = this.context.calendar.getEventManager().getEvent(eventId)
    if (!calendarEvent) return

    this.isResizing = true
    this.dragElement = element
    this.dragEvent = calendarEvent
    this.dragStartPos = { x: event.clientX, y: event.clientY }

    document.addEventListener('mousemove', (e) => this.handleResizeMove(e, direction))
    document.addEventListener('mouseup', this.handleResizeEnd.bind(this))

    this.context.emit('resize:start', calendarEvent, element)
  }

  /**
   * 处理调整大小移动
   */
  private handleResizeMove(event: MouseEvent, direction: string): void {
    if (!this.isResizing || !this.dragElement || !this.dragEvent) return

    const deltaY = event.clientY - this.dragStartPos.y
    const rect = this.dragElement.getBoundingClientRect()

    if (direction === 'bottom') {
      const newHeight = rect.height + deltaY
      if (newHeight > 20) { // 最小高度
        this.dragElement.style.height = `${newHeight}px`
      }
    } else if (direction === 'top') {
      const newHeight = rect.height - deltaY
      if (newHeight > 20) { // 最小高度
        this.dragElement.style.height = `${newHeight}px`
        this.dragElement.style.top = `${rect.top + deltaY}px`
      }
    }
  }

  /**
   * 处理调整大小结束
   */
  private handleResizeEnd(event: MouseEvent): void {
    document.removeEventListener('mousemove', this.handleResizeMove.bind(this))
    document.removeEventListener('mouseup', this.handleResizeEnd.bind(this))

    if (!this.isResizing || !this.dragElement || !this.dragEvent || !this.context) return

    // 计算新的时间
    const newHeight = parseInt(this.dragElement.style.height)
    const hourHeight = 60 // 假设每小时60px
    const newDuration = Math.round((newHeight / hourHeight) * 60) // 分钟

    const originalStart = DateUtils.dayjs(this.dragEvent.start)
    const newEnd = originalStart.add(newDuration, 'minute')

    // 更新事件
    const updates: Partial<CalendarEvent> = {
      end: newEnd.toDate()
    }

    this.context.calendar.getEventManager().updateEvent(this.dragEvent.id, updates)

    this.context.emit('resize:end', this.dragEvent, this.dragElement)

    // 清理状态
    this.isResizing = false
    this.dragElement = undefined
    this.dragEvent = undefined
  }

  /**
   * 显示辅助线
   */
  private showGuideLines(): void {
    if (!this.context) return

    const calendarContainer = this.context.calendar.getContainer()
    
    // 创建垂直辅助线
    const verticalGuide = DOMUtils.createElement('div', {
      className: 'drag-guide-vertical',
      style: {
        position: 'absolute',
        width: '1px',
        backgroundColor: '#722ED1',
        zIndex: '999',
        display: 'none'
      }
    })

    // 创建水平辅助线
    const horizontalGuide = DOMUtils.createElement('div', {
      className: 'drag-guide-horizontal',
      style: {
        position: 'absolute',
        height: '1px',
        backgroundColor: '#722ED1',
        zIndex: '999',
        display: 'none'
      }
    })

    calendarContainer.appendChild(verticalGuide)
    calendarContainer.appendChild(horizontalGuide)

    this.guideLines = [verticalGuide, horizontalGuide]
  }

  /**
   * 更新辅助线
   */
  private updateGuideLines(x: number, y: number): void {
    if (this.guideLines.length < 2) return

    const [verticalGuide, horizontalGuide] = this.guideLines
    const calendarContainer = this.context?.calendar.getContainer()
    if (!calendarContainer) return

    const containerRect = calendarContainer.getBoundingClientRect()

    // 更新垂直辅助线
    verticalGuide.style.display = 'block'
    verticalGuide.style.left = `${x - containerRect.left}px`
    verticalGuide.style.top = '0'
    verticalGuide.style.height = `${containerRect.height}px`

    // 更新水平辅助线
    horizontalGuide.style.display = 'block'
    horizontalGuide.style.top = `${y - containerRect.top}px`
    horizontalGuide.style.left = '0'
    horizontalGuide.style.width = `${containerRect.width}px`
  }

  /**
   * 隐藏辅助线
   */
  private hideGuideLines(): void {
    this.guideLines.forEach(guide => {
      guide.remove()
    })
    this.guideLines = []
  }

  /**
   * 查找放置目标
   */
  private findDropTarget(x: number, y: number): HTMLElement | null {
    const elements = document.elementsFromPoint(x, y)
    
    for (const element of elements) {
      if (element.classList.contains('ldesign-calendar-date-cell') ||
          element.classList.contains('ldesign-calendar-day-time-cell')) {
        return element as HTMLElement
      }
    }

    return null
  }

  /**
   * 从元素获取日期
   */
  private getDateFromElement(element: HTMLElement): Date | null {
    const dateStr = element.dataset.date
    if (!dateStr) return null

    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.context) return

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && (this.isDragging || this.isResizing)) {
        this.cancelDragOrResize()
      }
    })
  }

  /**
   * 取消拖拽或调整大小
   */
  private cancelDragOrResize(): void {
    if (this.isDragging && this.dragElement) {
      this.dragElement.style.transform = ''
      this.dragElement.style.zIndex = ''
      this.dragElement.style.opacity = '1'
      this.hideGuideLines()
    }

    if (this.isResizing && this.dragElement) {
      // 恢复原始大小
      this.dragElement.style.height = ''
      this.dragElement.style.top = ''
    }

    this.isDragging = false
    this.isResizing = false
    this.dragElement = undefined
    this.dragEvent = undefined
  }

  /**
   * 清理
   */
  private cleanup(): void {
    this.cancelDragOrResize()
    this.hideGuideLines()
  }
}
