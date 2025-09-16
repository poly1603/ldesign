/**
 * 周视图组件
 */

import type { Dayjs } from 'dayjs'
import type { ViewType, CalendarEvent } from '../types'
import { BaseView } from './BaseView'
import { DOMUtils } from '../utils/dom'
import { DateUtils } from '../utils/date'

/**
 * 周视图类
 */
export class WeekView extends BaseView {
  protected viewType: ViewType = 'week'
  /** 时间轴小时数 */
  private readonly HOURS_IN_DAY = 24
  /** 时间轴间隔（分钟） */
  private readonly TIME_INTERVAL = 60

  /**
   * 创建视图结构
   */
  protected createViewStructure(): HTMLElement {
    const weekView = DOMUtils.createElement('div', 'ldesign-calendar-week-view')

    // 创建头部（日期标题）
    const header = this.createWeekHeader()
    DOMUtils.appendChild(weekView, header)

    // 创建主体（时间轴和事件）
    const body = this.createWeekBody()
    DOMUtils.appendChild(weekView, body)

    return weekView
  }

  /**
   * 创建周视图头部
   */
  private createWeekHeader(): HTMLElement {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const i18nManager = calendar.getI18nManager()
    
    const header = DOMUtils.createElement('div', 'ldesign-calendar-week-header')
    const headerTable = DOMUtils.createElement('table', 'ldesign-calendar-week-header-table')
    const headerRow = DOMUtils.createElement('tr')

    // 时间轴占位列
    const timeAxisPlaceholder = DOMUtils.createElement('th', 'ldesign-calendar-time-axis-placeholder')
    DOMUtils.appendChild(headerRow, timeAxisPlaceholder)

    // 获取本周日期
    const weekDates = this.getWeekDates()
    const weekdayNames = i18nManager.getWeekdayNames('short')
    const firstDayOfWeek = configManager.get('firstDayOfWeek')

    weekDates.forEach((date, index) => {
      const th = DOMUtils.createElement('th', 'ldesign-calendar-week-day-header')
      
      // 添加日期信息
      const dayInfo = DOMUtils.createElement('div', 'ldesign-calendar-day-info')
      
      // 星期名称
      const weekdayIndex = (firstDayOfWeek + index) % 7
      const weekdayName = weekdayNames[weekdayIndex]
      const weekdayElement = DOMUtils.createElement('div', 'ldesign-calendar-weekday-name')
      DOMUtils.setTextContent(weekdayElement, weekdayName)
      DOMUtils.appendChild(dayInfo, weekdayElement)
      
      // 日期数字
      const dayNumber = DOMUtils.createElement('div', 'ldesign-calendar-day-number')
      DOMUtils.setTextContent(dayNumber, date.date().toString())
      DOMUtils.appendChild(dayInfo, dayNumber)
      
      // 添加状态样式
      if (DateUtils.isToday(date)) {
        DOMUtils.addClass(th, 'today')
      }
      if (DateUtils.isWeekend(date)) {
        DOMUtils.addClass(th, 'weekend')
      }
      
      DOMUtils.appendChild(th, dayInfo)
      DOMUtils.appendChild(headerRow, th)
    })

    DOMUtils.appendChild(headerTable, headerRow)
    DOMUtils.appendChild(header, headerTable)
    
    return header
  }

  /**
   * 创建周视图主体
   */
  private createWeekBody(): HTMLElement {
    const body = DOMUtils.createElement('div', 'ldesign-calendar-week-body')
    const bodyTable = DOMUtils.createElement('table', 'ldesign-calendar-week-body-table')
    const tbody = DOMUtils.createElement('tbody')

    // 创建时间轴和日期列
    for (let hour = 0; hour < this.HOURS_IN_DAY; hour++) {
      const row = this.createTimeRow(hour)
      DOMUtils.appendChild(tbody, row)
    }

    DOMUtils.appendChild(bodyTable, tbody)
    DOMUtils.appendChild(body, bodyTable)

    // 添加事件层
    const eventsLayer = this.createEventsLayer()
    DOMUtils.appendChild(body, eventsLayer)

    return body
  }

  /**
   * 创建时间行
   */
  private createTimeRow(hour: number): HTMLElement {
    const row = DOMUtils.createElement('tr', 'ldesign-calendar-time-row')
    DOMUtils.setData(row, 'hour', hour.toString())

    // 时间轴单元格
    const timeCell = DOMUtils.createElement('td', 'ldesign-calendar-time-cell')
    const timeLabel = DOMUtils.createElement('div', 'ldesign-calendar-time-label')
    DOMUtils.setTextContent(timeLabel, this.formatHour(hour))
    DOMUtils.appendChild(timeCell, timeLabel)
    DOMUtils.appendChild(row, timeCell)

    // 日期单元格
    const weekDates = this.getWeekDates()
    weekDates.forEach(date => {
      const dayCell = this.createDayTimeCell(date, hour)
      DOMUtils.appendChild(row, dayCell)
    })

    return row
  }

  /**
   * 创建日期时间单元格
   */
  private createDayTimeCell(date: Dayjs, hour: number): HTMLElement {
    const cell = DOMUtils.createElement('td', 'ldesign-calendar-day-time-cell')
    const cellTime = date.hour(hour).minute(0).second(0)
    
    DOMUtils.setData(cell, 'date', date.format('YYYY-MM-DD'))
    DOMUtils.setData(cell, 'hour', hour.toString())
    DOMUtils.setData(cell, 'datetime', cellTime.format('YYYY-MM-DD HH:mm'))

    // 添加当前时间指示器
    if (DateUtils.isToday(date) && hour === DateUtils.now().hour()) {
      DOMUtils.addClass(cell, 'current-hour')
    }

    // 添加工作时间样式
    if (this.isWorkingHour(hour)) {
      DOMUtils.addClass(cell, 'working-hour')
    }

    return cell
  }

  /**
   * 创建事件层
   */
  private createEventsLayer(): HTMLElement {
    const eventsLayer = DOMUtils.createElement('div', 'ldesign-calendar-events-layer')
    
    // 获取本周的所有事件
    const { start, end } = this.getDateRange()
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const events = eventManager.getEventsInRange(start, end)

    // 按日期分组事件
    const eventsByDate = this.groupEventsByDate(events)
    const weekDates = this.getWeekDates()

    weekDates.forEach((date, dayIndex) => {
      const dateStr = date.format('YYYY-MM-DD')
      const dayEvents = eventsByDate.get(dateStr) || []
      
      if (dayEvents.length > 0) {
        const dayEventsContainer = this.createDayEventsContainer(date, dayEvents, dayIndex)
        DOMUtils.appendChild(eventsLayer, dayEventsContainer)
      }
    })

    return eventsLayer
  }

  /**
   * 创建日期事件容器
   */
  private createDayEventsContainer(date: Dayjs, events: CalendarEvent[], dayIndex: number): HTMLElement {
    const container = DOMUtils.createElement('div', 'ldesign-calendar-day-events')
    DOMUtils.setData(container, 'date', date.format('YYYY-MM-DD'))
    
    // 设置容器位置
    const leftPercent = (dayIndex / 7) * 100
    const widthPercent = 100 / 7
    DOMUtils.setStyle(container, {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    })

    // 处理事件重叠
    const positionedEvents = this.calculateEventPositions(events)

    positionedEvents.forEach(eventInfo => {
      const eventElement = this.createWeekEventElement(eventInfo.event, eventInfo.position)
      DOMUtils.appendChild(container, eventElement)
    })

    return container
  }

  /**
   * 创建周视图事件元素
   */
  private createWeekEventElement(event: CalendarEvent, position: {
    top: number
    height: number
    left: number
    width: number
  }): HTMLElement {
    const eventElement = DOMUtils.createElement('div', 'ldesign-calendar-week-event')
    DOMUtils.setData(eventElement, 'eventId', event.id)

    // 设置事件样式
    DOMUtils.setStyle(eventElement, {
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      color: event.textColor,
      top: `${position.top}px`,
      height: `${position.height}px`,
      left: `${position.left}%`,
      width: `${position.width}%`
    })

    // 事件标题
    const titleElement = DOMUtils.createElement('div', 'ldesign-calendar-event-title')
    DOMUtils.setTextContent(titleElement, event.title)
    DOMUtils.appendChild(eventElement, titleElement)

    // 事件时间
    if (!event.allDay) {
      const timeElement = DOMUtils.createElement('div', 'ldesign-calendar-event-time')
      const startTime = DateUtils.dayjs(event.start).format('HH:mm')
      const endTime = DateUtils.dayjs(event.end || event.start).format('HH:mm')
      DOMUtils.setTextContent(timeElement, `${startTime} - ${endTime}`)
      DOMUtils.appendChild(eventElement, timeElement)
    }

    // 设置拖拽和调整大小
    if (event.draggable && this.isDragDropEnabled()) {
      DOMUtils.setAttribute(eventElement, 'draggable', 'true')
    }

    if (event.resizable && this.isResizeEnabled()) {
      this.addResizeHandles(eventElement)
    }

    return eventElement
  }

  /**
   * 添加调整大小手柄
   */
  private addResizeHandles(eventElement: HTMLElement): void {
    const topHandle = DOMUtils.createElement('div', 'ldesign-calendar-resize-handle resize-top')
    const bottomHandle = DOMUtils.createElement('div', 'ldesign-calendar-resize-handle resize-bottom')
    
    DOMUtils.appendChild(eventElement, topHandle)
    DOMUtils.appendChild(eventElement, bottomHandle)
  }

  /**
   * 计算事件位置
   */
  private calculateEventPositions(events: CalendarEvent[]): Array<{
    event: CalendarEvent
    position: { top: number; height: number; left: number; width: number }
  }> {
    const HOUR_HEIGHT = 60 // 每小时的像素高度
    const positioned: Array<{
      event: CalendarEvent
      position: { top: number; height: number; left: number; width: number }
    }> = []

    // 按开始时间排序
    const sortedEvents = events.sort((a, b) => 
      DateUtils.dayjs(a.start).valueOf() - DateUtils.dayjs(b.start).valueOf()
    )

    sortedEvents.forEach((event, index) => {
      const startTime = DateUtils.dayjs(event.start)
      const endTime = DateUtils.dayjs(event.end || event.start)
      
      // 计算垂直位置
      const startHour = startTime.hour() + startTime.minute() / 60
      const endHour = endTime.hour() + endTime.minute() / 60
      const top = startHour * HOUR_HEIGHT
      const height = (endHour - startHour) * HOUR_HEIGHT

      // 计算水平位置（处理重叠）
      let left = 0
      let width = 100
      
      // 检查与之前事件的重叠
      const overlappingEvents = positioned.filter(pos => {
        const posStartTime = DateUtils.dayjs(pos.event.start)
        const posEndTime = DateUtils.dayjs(pos.event.end || pos.event.start)
        return this.isTimeOverlapping(startTime, endTime, posStartTime, posEndTime)
      })

      if (overlappingEvents.length > 0) {
        width = 100 / (overlappingEvents.length + 1)
        left = overlappingEvents.length * width
      }

      positioned.push({
        event,
        position: { top, height, left, width }
      })
    })

    return positioned
  }

  /**
   * 检查时间是否重叠
   */
  private isTimeOverlapping(start1: Dayjs, end1: Dayjs, start2: Dayjs, end2: Dayjs): boolean {
    return start1.isBefore(end2) && end1.isAfter(start2)
  }

  /**
   * 按日期分组事件
   */
  private groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const grouped = new Map<string, CalendarEvent[]>()

    events.forEach(event => {
      const startDate = DateUtils.dayjs(event.start)
      const endDate = DateUtils.dayjs(event.end || event.start)
      
      // 如果事件跨天，需要为每一天创建条目
      let currentDate = startDate.startOf('day')
      const lastDate = endDate.startOf('day')
      
      while (currentDate.isSameOrBefore(lastDate)) {
        const dateStr = currentDate.format('YYYY-MM-DD')
        
        if (!grouped.has(dateStr)) {
          grouped.set(dateStr, [])
        }
        
        grouped.get(dateStr)!.push(event)
        currentDate = currentDate.add(1, 'day')
      }
    })

    return grouped
  }

  /**
   * 获取本周日期
   */
  private getWeekDates(): Dayjs[] {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    return DateUtils.getWeekViewDates(this.currentDate, firstDayOfWeek)
  }

  /**
   * 格式化小时
   */
  private formatHour(hour: number): string {
    return hour.toString().padStart(2, '0') + ':00'
  }

  /**
   * 检查是否为工作时间
   */
  private isWorkingHour(hour: number): boolean {
    return hour >= 9 && hour < 18 // 9:00 - 18:00
  }

  /**
   * 获取视图日期范围
   */
  public getDateRange(): { start: Dayjs; end: Dayjs } {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    const weekStart = DateUtils.startOfWeek(this.currentDate, firstDayOfWeek)
    const weekEnd = DateUtils.endOfWeek(this.currentDate, firstDayOfWeek)
    
    return { start: weekStart, end: weekEnd }
  }

  /**
   * 跳转到指定日期
   */
  public goToDate(date: Dayjs): void {
    this.currentDate = date
    this.refresh()
  }

  /**
   * 上一周
   */
  public prevWeek(): void {
    this.currentDate = this.currentDate.subtract(1, 'week')
    this.refresh()
  }

  /**
   * 下一周
   */
  public nextWeek(): void {
    this.currentDate = this.currentDate.add(1, 'week')
    this.refresh()
  }

  /**
   * 获取当前周信息
   */
  public getWeekInfo(): {
    year: number
    weekOfYear: number
    startDate: Dayjs
    endDate: Dayjs
    dates: Dayjs[]
  } {
    const { start, end } = this.getDateRange()
    const dates = this.getWeekDates()
    
    return {
      year: this.currentDate.year(),
      weekOfYear: DateUtils.getWeekOfYear(this.currentDate),
      startDate: start,
      endDate: end,
      dates
    }
  }

  /**
   * 滚动到指定时间
   */
  public scrollToTime(hour: number): void {
    if (!this.container) return
    
    const timeRow = this.container.querySelector(`[data-hour="${hour}"]`)
    if (timeRow) {
      DOMUtils.scrollToElement(timeRow as HTMLElement)
    }
  }

  /**
   * 滚动到当前时间
   */
  public scrollToCurrentTime(): void {
    const currentHour = DateUtils.now().hour()
    this.scrollToTime(currentHour)
  }

  /**
   * 获取指定时间的单元格
   */
  public getTimeCellElement(date: Dayjs, hour: number): HTMLElement | null {
    if (!this.container) return null
    
    const dateStr = date.format('YYYY-MM-DD')
    return this.container.querySelector(`[data-date="${dateStr}"][data-hour="${hour}"]`)
  }

  /**
   * 高亮时间段
   */
  public highlightTimeSlot(date: Dayjs, startHour: number, endHour: number, className = 'highlighted'): void {
    for (let hour = startHour; hour < endHour; hour++) {
      const cellElement = this.getTimeCellElement(date, hour)
      if (cellElement) {
        DOMUtils.addClass(cellElement, className)
      }
    }
  }

  /**
   * 取消高亮时间段
   */
  public unhighlightTimeSlot(date: Dayjs, startHour: number, endHour: number, className = 'highlighted'): void {
    for (let hour = startHour; hour < endHour; hour++) {
      const cellElement = this.getTimeCellElement(date, hour)
      if (cellElement) {
        DOMUtils.removeClass(cellElement, className)
      }
    }
  }
}
