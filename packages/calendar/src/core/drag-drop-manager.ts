/**
 * 拖拽管理器
 * 
 * 框架无关的拖拽核心逻辑，负责：
 * - 事件拖拽状态管理
 * - 拖拽位置计算和验证
 * - 拖拽预览和反馈
 * - 拖拽完成后的事件更新
 */

import type { CalendarEvent } from '../types/event'

/**
 * 拖拽类型
 */
export type DragType = 'move' | 'resize-start' | 'resize-end'

/**
 * 拖拽上下文
 */
export interface DragContext {
  /** 拖拽类型 */
  type: DragType
  /** 被拖拽的事件 */
  event: CalendarEvent
  /** 拖拽开始位置 */
  startPosition: { x: number; y: number }
  /** 当前拖拽位置 */
  currentPosition: { x: number; y: number }
  /** 拖拽开始时的事件数据 */
  originalEvent: CalendarEvent
  /** 拖拽目标日期 */
  targetDate?: Date
  /** 拖拽目标时间 */
  targetTime?: { start: Date; end: Date }
  /** 原始DOM事件 */
  originalMouseEvent: MouseEvent
}

/**
 * 拖拽配置
 */
export interface DragDropConfig {
  /** 是否启用拖拽 */
  enabled?: boolean
  /** 是否启用事件移动 */
  allowMove?: boolean
  /** 是否启用事件调整大小 */
  allowResize?: boolean
  /** 拖拽网格对齐（分钟） */
  snapToGrid?: number
  /** 最小事件持续时间（分钟） */
  minDuration?: number
  /** 最大事件持续时间（分钟） */
  maxDuration?: number
  /** 拖拽时的CSS类名 */
  draggingClassName?: string
  /** 拖拽预览的CSS类名 */
  previewClassName?: string
  /** 自定义拖拽验证函数 */
  validateDrop?: (context: DragContext) => boolean
}

/**
 * 拖拽管理器类
 */
export class DragDropManager {
  private config: DragDropConfig
  private eventListeners: Map<string, Function[]> = new Map()
  private currentDrag: DragContext | null = null
  private isDragging = false
  private dragPreviewElement: HTMLElement | null = null

  constructor(config: DragDropConfig = {}) {
    this.config = {
      enabled: true,
      allowMove: true,
      allowResize: true,
      snapToGrid: 15, // 15分钟对齐
      minDuration: 15, // 最小15分钟
      maxDuration: 24 * 60, // 最大24小时
      draggingClassName: 'ldesign-calendar-event--dragging',
      previewClassName: 'ldesign-calendar-drag-preview',
      ...config
    }
  }

  /**
   * 开始拖拽
   */
  startDrag(event: CalendarEvent, mouseEvent: MouseEvent, type: DragType = 'move'): boolean {
    if (!this.config.enabled) {
      return false
    }

    // 检查是否允许此类型的拖拽
    if (type === 'move' && !this.config.allowMove) {
      return false
    }
    if ((type === 'resize-start' || type === 'resize-end') && !this.config.allowResize) {
      return false
    }

    // 检查事件是否可拖拽
    if (!event.draggable) {
      return false
    }

    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()

    // 创建拖拽上下文
    this.currentDrag = {
      type,
      event,
      startPosition: { x: mouseEvent.clientX, y: mouseEvent.clientY },
      currentPosition: { x: mouseEvent.clientX, y: mouseEvent.clientY },
      originalEvent: { ...event },
      originalMouseEvent: mouseEvent
    }

    this.isDragging = true

    // 添加全局事件监听器
    this.addGlobalEventListeners()

    // 发出拖拽开始事件
    this.emit('dragStart', this.currentDrag)

    return true
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove(mouseEvent: MouseEvent): void {
    if (!this.isDragging || !this.currentDrag) {
      return
    }

    // 更新当前位置
    this.currentDrag.currentPosition = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    }

    // 计算拖拽目标
    this.calculateDragTarget(mouseEvent)

    // 发出拖拽移动事件
    this.emit('dragMove', this.currentDrag)
  }

  /**
   * 计算拖拽目标
   */
  private calculateDragTarget(mouseEvent: MouseEvent): void {
    if (!this.currentDrag) return

    // 获取鼠标下的元素
    const elementUnderMouse = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY)
    if (!elementUnderMouse) return

    // 查找日期单元格
    const dateCell = elementUnderMouse.closest('.ldesign-calendar-day-cell')
    if (!dateCell) return

    // 获取日期信息
    const dateStr = dateCell.getAttribute('data-date')
    if (!dateStr) return

    const targetDate = new Date(dateStr)
    this.currentDrag.targetDate = targetDate

    // 根据拖拽类型计算目标时间
    this.calculateTargetTime(targetDate, mouseEvent)
  }

  /**
   * 计算目标时间
   */
  private calculateTargetTime(targetDate: Date, mouseEvent: MouseEvent): void {
    if (!this.currentDrag) return

    const originalEvent = this.currentDrag.originalEvent
    const dragType = this.currentDrag.type

    switch (dragType) {
      case 'move':
        // 移动事件：保持持续时间不变
        const duration = originalEvent.end.getTime() - originalEvent.start.getTime()
        const newStart = new Date(targetDate)
        newStart.setHours(originalEvent.start.getHours(), originalEvent.start.getMinutes())
        const newEnd = new Date(newStart.getTime() + duration)
        
        this.currentDrag.targetTime = {
          start: this.snapToGrid(newStart),
          end: this.snapToGrid(newEnd)
        }
        break

      case 'resize-start':
        // 调整开始时间
        const newStartTime = this.calculateTimeFromPosition(targetDate, mouseEvent)
        this.currentDrag.targetTime = {
          start: this.snapToGrid(newStartTime),
          end: originalEvent.end
        }
        break

      case 'resize-end':
        // 调整结束时间
        const newEndTime = this.calculateTimeFromPosition(targetDate, mouseEvent)
        this.currentDrag.targetTime = {
          start: originalEvent.start,
          end: this.snapToGrid(newEndTime)
        }
        break
    }

    // 验证时间范围
    this.validateTargetTime()
  }

  /**
   * 根据鼠标位置计算时间
   */
  private calculateTimeFromPosition(date: Date, mouseEvent: MouseEvent): Date {
    // 这里需要根据具体的日历布局来计算
    // 简化实现：假设一天24小时均匀分布
    const dayElement = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY)?.closest('.ldesign-calendar-day-cell')
    if (!dayElement) return date

    const rect = dayElement.getBoundingClientRect()
    const relativeY = mouseEvent.clientY - rect.top
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height))
    
    const targetTime = new Date(date)
    const totalMinutes = 24 * 60
    const targetMinutes = Math.floor(percentage * totalMinutes)
    
    targetTime.setHours(Math.floor(targetMinutes / 60), targetMinutes % 60, 0, 0)
    
    return targetTime
  }

  /**
   * 网格对齐
   */
  private snapToGrid(date: Date): Date {
    if (!this.config.snapToGrid) return date

    const minutes = date.getMinutes()
    const snappedMinutes = Math.round(minutes / this.config.snapToGrid) * this.config.snapToGrid
    
    const result = new Date(date)
    result.setMinutes(snappedMinutes, 0, 0)
    
    return result
  }

  /**
   * 验证目标时间
   */
  private validateTargetTime(): void {
    if (!this.currentDrag?.targetTime) return

    const { start, end } = this.currentDrag.targetTime
    const duration = (end.getTime() - start.getTime()) / (1000 * 60) // 分钟

    // 检查最小持续时间
    if (duration < (this.config.minDuration || 15)) {
      const newEnd = new Date(start.getTime() + (this.config.minDuration || 15) * 60 * 1000)
      this.currentDrag.targetTime.end = newEnd
    }

    // 检查最大持续时间
    if (duration > (this.config.maxDuration || 24 * 60)) {
      const newEnd = new Date(start.getTime() + (this.config.maxDuration || 24 * 60) * 60 * 1000)
      this.currentDrag.targetTime.end = newEnd
    }

    // 确保结束时间晚于开始时间
    if (end <= start) {
      this.currentDrag.targetTime.end = new Date(start.getTime() + (this.config.minDuration || 15) * 60 * 1000)
    }
  }

  /**
   * 结束拖拽
   */
  private handleDragEnd(mouseEvent: MouseEvent): void {
    if (!this.isDragging || !this.currentDrag) {
      return
    }

    // 验证拖拽是否有效
    const isValidDrop = this.validateDrop()

    if (isValidDrop) {
      // 发出拖拽完成事件
      this.emit('dragEnd', this.currentDrag)
    } else {
      // 发出拖拽取消事件
      this.emit('dragCancel', this.currentDrag)
    }

    // 清理拖拽状态
    this.cleanup()
  }

  /**
   * 验证拖拽是否有效
   */
  private validateDrop(): boolean {
    if (!this.currentDrag) return false

    // 检查是否有目标时间
    if (!this.currentDrag.targetTime) return false

    // 使用自定义验证函数
    if (this.config.validateDrop) {
      return this.config.validateDrop(this.currentDrag)
    }

    return true
  }

  /**
   * 取消拖拽
   */
  cancelDrag(): void {
    if (this.isDragging && this.currentDrag) {
      this.emit('dragCancel', this.currentDrag)
      this.cleanup()
    }
  }

  /**
   * 添加全局事件监听器
   */
  private addGlobalEventListeners(): void {
    document.addEventListener('mousemove', this.handleDragMove.bind(this))
    document.addEventListener('mouseup', this.handleDragEnd.bind(this))
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 移除全局事件监听器
   */
  private removeGlobalEventListeners(): void {
    document.removeEventListener('mousemove', this.handleDragMove.bind(this))
    document.removeEventListener('mouseup', this.handleDragEnd.bind(this))
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isDragging) {
      this.cancelDrag()
    }
  }

  /**
   * 清理拖拽状态
   */
  private cleanup(): void {
    this.removeGlobalEventListeners()
    this.isDragging = false
    this.currentDrag = null
    
    if (this.dragPreviewElement) {
      this.dragPreviewElement.remove()
      this.dragPreviewElement = null
    }
  }

  /**
   * 获取当前拖拽上下文
   */
  getCurrentDrag(): DragContext | null {
    return this.currentDrag
  }

  /**
   * 是否正在拖拽
   */
  isDraggingActive(): boolean {
    return this.isDragging
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DragDropConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 发出事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.cancelDrag()
    this.eventListeners.clear()
  }
}
