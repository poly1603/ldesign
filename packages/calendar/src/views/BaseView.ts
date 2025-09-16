/**
 * 基础视图类 - 所有视图的基类
 */

import type { Dayjs } from 'dayjs'
import type { Calendar } from '../core/Calendar'
import type { CalendarEvent, DateCell, ViewType } from '../types'
import { DOMUtils } from '../utils/dom'
import { DateUtils } from '../utils/date'
import { LunarUtils } from '../utils/lunar'

/**
 * 基础视图抽象类
 */
export abstract class BaseView {
  /** 日历实例 */
  protected calendar: Calendar
  /** 视图类型 */
  protected abstract viewType: ViewType
  /** 视图容器 */
  protected container: HTMLElement | null = null
  /** 当前日期 */
  protected currentDate: Dayjs
  /** 事件监听器 */
  protected listeners: Map<string, Function[]> = new Map()

  constructor(calendar: Calendar) {
    this.calendar = calendar
    this.currentDate = DateUtils.now()
  }

  /**
   * 渲染视图
   */
  public render(container: HTMLElement, date: Dayjs): void {
    this.container = container
    this.currentDate = date
    
    // 清空容器
    DOMUtils.empty(container)
    
    // 创建视图结构
    const viewElement = this.createViewStructure()
    DOMUtils.appendChild(container, viewElement)
    
    // 绑定事件
    this.bindEvents()
    
    // 触发渲染完成事件
    this.emit('rendered', this.viewType, date)
  }

  /**
   * 创建视图结构 - 子类必须实现
   */
  protected abstract createViewStructure(): HTMLElement

  /**
   * 绑定事件
   */
  protected bindEvents(): void {
    if (!this.container) return

    // 日期点击事件
    DOMUtils.addEventListener(this.container, 'click', (e) => {
      const target = e.target as HTMLElement
      
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date')) {
        this.handleDateClick(target, e)
      }
      
      if (DOMUtils.hasClass(target, 'ldesign-calendar-event')) {
        this.handleEventClick(target, e)
      }
    })

    // 双击事件
    DOMUtils.addEventListener(this.container, 'dblclick', (e) => {
      const target = e.target as HTMLElement
      
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date')) {
        this.handleDateDoubleClick(target, e)
      }
    })

    // 右键菜单事件
    DOMUtils.addEventListener(this.container, 'contextmenu', (e) => {
      const target = e.target as HTMLElement
      
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date') || 
          DOMUtils.hasClass(target, 'ldesign-calendar-event')) {
        this.handleContextMenu(target, e)
      }
    })

    // 拖拽事件
    if (this.isDragDropEnabled()) {
      this.bindDragDropEvents()
    }
  }

  /**
   * 处理日期点击
   */
  protected handleDateClick(element: HTMLElement, event: MouseEvent): void {
    const dateStr = DOMUtils.getData(element, 'date')
    if (!dateStr) return

    const date = DateUtils.dayjs(dateStr)
    const calendar = this.calendar as any
    
    // 选择日期
    calendar.selectDate(date)
    
    this.emit('dateClick', date, element, event)
  }

  /**
   * 处理日期双击
   */
  protected handleDateDoubleClick(element: HTMLElement, event: MouseEvent): void {
    const dateStr = DOMUtils.getData(element, 'date')
    if (!dateStr) return

    const date = DateUtils.dayjs(dateStr)
    this.emit('dateDoubleClick', date, element, event)
  }

  /**
   * 处理事件点击
   */
  protected handleEventClick(element: HTMLElement, event: MouseEvent): void {
    const eventId = DOMUtils.getData(element, 'eventId')
    if (!eventId) return

    const calendar = this.calendar as any
    const calendarEvent = calendar.getEventManager().getEvent(eventId)
    
    if (calendarEvent) {
      this.emit('eventClick', calendarEvent, element, event)
    }
  }

  /**
   * 处理右键菜单
   */
  protected handleContextMenu(element: HTMLElement, event: MouseEvent): void {
    DOMUtils.preventDefault(event)
    
    const dateStr = DOMUtils.getData(element, 'date')
    const eventId = DOMUtils.getData(element, 'eventId')
    
    if (eventId) {
      const calendar = this.calendar as any
      const calendarEvent = calendar.getEventManager().getEvent(eventId)
      this.emit('eventContextMenu', calendarEvent, element, event)
    } else if (dateStr) {
      const date = DateUtils.dayjs(dateStr)
      this.emit('dateContextMenu', date, element, event)
    }
  }

  /**
   * 绑定拖拽事件
   */
  protected bindDragDropEvents(): void {
    if (!this.container) return

    let dragElement: HTMLElement | null = null
    let dragData: any = null

    // 拖拽开始
    DOMUtils.addEventListener(this.container, 'dragstart', (e) => {
      const target = e.target as HTMLElement
      
      if (DOMUtils.hasClass(target, 'ldesign-calendar-event')) {
        dragElement = target
        const eventId = DOMUtils.getData(target, 'eventId')
        
        if (eventId) {
          const calendar = this.calendar as any
          dragData = calendar.getEventManager().getEvent(eventId)
          
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', eventId)
          }
          
          this.emit('dragStart', dragData, target, e)
        }
      }
    })

    // 拖拽结束
    DOMUtils.addEventListener(this.container, 'dragend', (e) => {
      if (dragElement && dragData) {
        this.emit('dragEnd', dragData, dragElement, e)
        dragElement = null
        dragData = null
      }
    })

    // 拖拽进入
    DOMUtils.addEventListener(this.container, 'dragenter', (e) => {
      DOMUtils.preventDefault(e)
      
      const target = e.target as HTMLElement
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date')) {
        DOMUtils.addClass(target, 'drag-over')
      }
    })

    // 拖拽离开
    DOMUtils.addEventListener(this.container, 'dragleave', (e) => {
      const target = e.target as HTMLElement
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date')) {
        DOMUtils.removeClass(target, 'drag-over')
      }
    })

    // 拖拽悬停
    DOMUtils.addEventListener(this.container, 'dragover', (e) => {
      DOMUtils.preventDefault(e)
      
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }
    })

    // 拖拽放下
    DOMUtils.addEventListener(this.container, 'drop', (e) => {
      DOMUtils.preventDefault(e)
      
      const target = e.target as HTMLElement
      if (DOMUtils.hasClass(target, 'ldesign-calendar-date')) {
        DOMUtils.removeClass(target, 'drag-over')
        
        const dateStr = DOMUtils.getData(target, 'date')
        const eventId = e.dataTransfer?.getData('text/plain')
        
        if (dateStr && eventId && dragData) {
          const newDate = DateUtils.dayjs(dateStr)
          this.emit('drop', dragData, newDate, target, e)
        }
      }
    })
  }

  /**
   * 创建日期单元格
   */
  protected createDateCell(date: Dayjs): DateCell {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const eventManager = calendar.getEventManager()
    const i18nManager = calendar.getI18nManager()

    // 获取当日事件
    const events = eventManager.getEventsForDate(date)

    // 检查是否为当前月
    const isCurrentMonth = DateUtils.isSameMonth(date, this.currentDate)

    // 检查是否为今天
    const isToday = DateUtils.isToday(date)

    // 检查是否被选中
    const selectedDates = calendar.getSelectedDates()
    const isSelected = selectedDates.some((selectedDate: Dayjs) => 
      DateUtils.isSameDay(date, selectedDate)
    )

    // 检查是否被禁用
    const isDisabled = configManager.isDateDisabled(date)

    // 检查是否为周末
    const isWeekend = DateUtils.isWeekend(date)

    // 获取农历信息
    let lunar: any = undefined
    if (configManager.get('showLunar')) {
      lunar = LunarUtils.getLunarInfo(date)
    }

    // 获取节假日信息
    let holiday: any = undefined
    if (configManager.get('showHolidays')) {
      const monthDay = date.format('MMDD')
      const holidayName = i18nManager.getHoliday(monthDay)
      if (holidayName) {
        holiday = {
          name: holidayName,
          type: 'holiday' as const
        }
      }
    }

    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isDisabled,
      isWeekend,
      isHoliday: !!holiday,
      lunar,
      holiday,
      events
    }
  }

  /**
   * 创建日期元素
   */
  protected createDateElement(dateCell: DateCell): HTMLElement {
    const { date, isCurrentMonth, isToday, isSelected, isDisabled, isWeekend, isHoliday, lunar, holiday, events } = dateCell

    // 创建日期容器
    const dateElement = DOMUtils.createElement('div', 'ldesign-calendar-date')
    DOMUtils.setData(dateElement, 'date', date.format('YYYY-MM-DD'))

    // 添加状态类名
    if (!isCurrentMonth) DOMUtils.addClass(dateElement, 'other-month')
    if (isToday) DOMUtils.addClass(dateElement, 'today')
    if (isSelected) DOMUtils.addClass(dateElement, 'selected')
    if (isDisabled) DOMUtils.addClass(dateElement, 'disabled')
    if (isWeekend) DOMUtils.addClass(dateElement, 'weekend')
    if (isHoliday) DOMUtils.addClass(dateElement, 'holiday')

    // 创建日期数字
    const dayNumber = DOMUtils.createElement('div', 'ldesign-calendar-day-number')
    DOMUtils.setTextContent(dayNumber, date.date().toString())
    DOMUtils.appendChild(dateElement, dayNumber)

    // 添加农历信息
    if (lunar) {
      const lunarElement = DOMUtils.createElement('div', 'ldesign-calendar-lunar')
      const lunarText = LunarUtils.getLunarDisplayText(lunar)
      DOMUtils.setTextContent(lunarElement, lunarText)
      DOMUtils.appendChild(dateElement, lunarElement)
    }

    // 添加节假日信息
    if (holiday) {
      const holidayElement = DOMUtils.createElement('div', 'ldesign-calendar-holiday')
      DOMUtils.setTextContent(holidayElement, holiday.name)
      DOMUtils.appendChild(dateElement, holidayElement)
    }

    // 添加事件指示器
    if (events.length > 0) {
      const eventsContainer = DOMUtils.createElement('div', 'ldesign-calendar-events')
      
      events.slice(0, 3).forEach(event => {
        const eventElement = this.createEventElement(event)
        DOMUtils.appendChild(eventsContainer, eventElement)
      })

      // 如果事件超过3个，显示更多指示器
      if (events.length > 3) {
        const moreElement = DOMUtils.createElement('div', 'ldesign-calendar-more-events')
        DOMUtils.setTextContent(moreElement, `+${events.length - 3}`)
        DOMUtils.appendChild(eventsContainer, moreElement)
      }

      DOMUtils.appendChild(dateElement, eventsContainer)
    }

    return dateElement
  }

  /**
   * 创建事件元素
   */
  protected createEventElement(event: CalendarEvent): HTMLElement {
    const eventElement = DOMUtils.createElement('div', 'ldesign-calendar-event')
    DOMUtils.setData(eventElement, 'eventId', event.id)

    // 设置事件样式
    DOMUtils.setStyle(eventElement, {
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      color: event.textColor
    })

    // 添加事件标题
    const titleElement = DOMUtils.createElement('span', 'ldesign-calendar-event-title')
    DOMUtils.setTextContent(titleElement, event.title)
    DOMUtils.appendChild(eventElement, titleElement)

    // 添加时间信息（如果不是全天事件）
    if (!event.allDay) {
      const timeElement = DOMUtils.createElement('span', 'ldesign-calendar-event-time')
      const startTime = DateUtils.dayjs(event.start).format('HH:mm')
      DOMUtils.setTextContent(timeElement, startTime)
      DOMUtils.appendChild(eventElement, timeElement)
    }

    // 设置拖拽属性
    if (event.draggable && this.isDragDropEnabled()) {
      DOMUtils.setAttribute(eventElement, 'draggable', 'true')
    }

    return eventElement
  }

  /**
   * 检查是否启用拖拽
   */
  protected isDragDropEnabled(): boolean {
    const calendar = this.calendar as any
    return calendar.getConfigManager().isFeatureEnabled('dragDrop')
  }

  /**
   * 检查是否启用调整大小
   */
  protected isResizeEnabled(): boolean {
    const calendar = this.calendar as any
    return calendar.getConfigManager().isFeatureEnabled('resize')
  }

  /**
   * 获取视图日期范围
   */
  public abstract getDateRange(): { start: Dayjs; end: Dayjs }

  /**
   * 刷新视图
   */
  public refresh(): void {
    if (this.container) {
      this.render(this.container, this.currentDate)
    }
  }

  /**
   * 事件监听
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return
    
    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  protected emit(event: string, ...args: any[]): void {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in view handler for "${event}":`, error)
      }
    })
  }

  /**
   * 销毁视图
   */
  public destroy(): void {
    this.listeners.clear()
    this.container = null
  }
}
