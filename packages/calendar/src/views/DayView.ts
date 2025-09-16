/**
 * 日视图组件
 */

import type { Dayjs } from 'dayjs'
import type { ViewType, CalendarEvent } from '../types'
import { BaseView } from './BaseView'
import { DOMUtils } from '../utils/dom'
import { DateUtils } from '../utils/date'

/**
 * 日视图类
 */
export class DayView extends BaseView {
  protected viewType: ViewType = 'day'
  /** 时间轴小时数 */
  private readonly HOURS_IN_DAY = 24
  /** 时间轴间隔（分钟） */
  private readonly TIME_INTERVAL = 30
  /** 每小时的像素高度 */
  private readonly HOUR_HEIGHT = 80

  /**
   * 创建视图结构
   */
  protected createViewStructure(): HTMLElement {
    const dayView = DOMUtils.createElement('div', 'ldesign-calendar-day-view')

    // 创建头部（日期信息）
    const header = this.createDayHeader()
    DOMUtils.appendChild(dayView, header)

    // 创建主体（时间轴和事件）
    const body = this.createDayBody()
    DOMUtils.appendChild(dayView, body)

    return dayView
  }

  /**
   * 创建日视图头部
   */
  private createDayHeader(): HTMLElement {
    const calendar = this.calendar as any
    const i18nManager = calendar.getI18nManager()
    
    const header = DOMUtils.createElement('div', 'ldesign-calendar-day-header')
    
    // 日期信息容器
    const dateInfo = DOMUtils.createElement('div', 'ldesign-calendar-day-info')
    
    // 星期名称
    const weekdayName = this.currentDate.format('dddd')
    const weekdayElement = DOMUtils.createElement('div', 'ldesign-calendar-weekday-name')
    DOMUtils.setTextContent(weekdayElement, weekdayName)
    DOMUtils.appendChild(dateInfo, weekdayElement)
    
    // 日期
    const dateElement = DOMUtils.createElement('div', 'ldesign-calendar-date-number')
    DOMUtils.setTextContent(dateElement, this.currentDate.date().toString())
    DOMUtils.appendChild(dateInfo, dateElement)
    
    // 月份年份
    const monthYearElement = DOMUtils.createElement('div', 'ldesign-calendar-month-year')
    const monthNames = i18nManager.getMonthNames('long')
    const monthName = monthNames[this.currentDate.month()]
    DOMUtils.setTextContent(monthYearElement, `${monthName} ${this.currentDate.year()}`)
    DOMUtils.appendChild(dateInfo, monthYearElement)
    
    // 添加今天标记
    if (DateUtils.isToday(this.currentDate)) {
      DOMUtils.addClass(header, 'today')
      const todayLabel = DOMUtils.createElement('div', 'ldesign-calendar-today-label')
      DOMUtils.setTextContent(todayLabel, i18nManager.t('today'))
      DOMUtils.appendChild(dateInfo, todayLabel)
    }
    
    // 添加周末标记
    if (DateUtils.isWeekend(this.currentDate)) {
      DOMUtils.addClass(header, 'weekend')
    }
    
    DOMUtils.appendChild(header, dateInfo)
    
    // 添加全天事件区域
    const allDayEvents = this.createAllDayEventsArea()
    DOMUtils.appendChild(header, allDayEvents)
    
    return header
  }

  /**
   * 创建全天事件区域
   */
  private createAllDayEventsArea(): HTMLElement {
    const allDayArea = DOMUtils.createElement('div', 'ldesign-calendar-all-day-events')
    
    // 获取当天的全天事件
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const dayEvents = eventManager.getEventsForDate(this.currentDate)
    const allDayEvents = dayEvents.filter(event => event.allDay)
    
    if (allDayEvents.length > 0) {
      const allDayLabel = DOMUtils.createElement('div', 'ldesign-calendar-all-day-label')
      DOMUtils.setTextContent(allDayLabel, '全天')
      DOMUtils.appendChild(allDayArea, allDayLabel)
      
      const allDayContainer = DOMUtils.createElement('div', 'ldesign-calendar-all-day-container')
      
      allDayEvents.forEach(event => {
        const eventElement = this.createAllDayEventElement(event)
        DOMUtils.appendChild(allDayContainer, eventElement)
      })
      
      DOMUtils.appendChild(allDayArea, allDayContainer)
    }
    
    return allDayArea
  }

  /**
   * 创建全天事件元素
   */
  private createAllDayEventElement(event: CalendarEvent): HTMLElement {
    const eventElement = DOMUtils.createElement('div', 'ldesign-calendar-all-day-event')
    DOMUtils.setData(eventElement, 'eventId', event.id)
    
    // 设置事件样式
    DOMUtils.setStyle(eventElement, {
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      color: event.textColor
    })
    
    // 事件标题
    const titleElement = DOMUtils.createElement('span', 'ldesign-calendar-event-title')
    DOMUtils.setTextContent(titleElement, event.title)
    DOMUtils.appendChild(eventElement, titleElement)
    
    // 设置拖拽
    if (event.draggable && this.isDragDropEnabled()) {
      DOMUtils.setAttribute(eventElement, 'draggable', 'true')
    }
    
    return eventElement
  }

  /**
   * 创建日视图主体
   */
  private createDayBody(): HTMLElement {
    const body = DOMUtils.createElement('div', 'ldesign-calendar-day-body')
    
    // 创建时间轴容器
    const timeAxisContainer = DOMUtils.createElement('div', 'ldesign-calendar-time-axis-container')
    const timeAxis = this.createTimeAxis()
    DOMUtils.appendChild(timeAxisContainer, timeAxis)
    DOMUtils.appendChild(body, timeAxisContainer)
    
    // 创建事件容器
    const eventsContainer = DOMUtils.createElement('div', 'ldesign-calendar-day-events-container')
    const eventsArea = this.createEventsArea()
    DOMUtils.appendChild(eventsContainer, eventsArea)
    DOMUtils.appendChild(body, eventsContainer)
    
    // 添加当前时间指示器
    if (DateUtils.isToday(this.currentDate)) {
      const currentTimeIndicator = this.createCurrentTimeIndicator()
      DOMUtils.appendChild(eventsContainer, currentTimeIndicator)
    }
    
    return body
  }

  /**
   * 创建时间轴
   */
  private createTimeAxis(): HTMLElement {
    const timeAxis = DOMUtils.createElement('div', 'ldesign-calendar-time-axis')
    
    for (let hour = 0; hour < this.HOURS_IN_DAY; hour++) {
      const timeSlot = DOMUtils.createElement('div', 'ldesign-calendar-time-slot')
      DOMUtils.setData(timeSlot, 'hour', hour.toString())
      DOMUtils.setStyle(timeSlot, { height: `${this.HOUR_HEIGHT}px` })
      
      // 时间标签
      const timeLabel = DOMUtils.createElement('div', 'ldesign-calendar-time-label')
      DOMUtils.setTextContent(timeLabel, this.formatHour(hour))
      DOMUtils.appendChild(timeSlot, timeLabel)
      
      // 半小时分割线
      if (this.TIME_INTERVAL === 30) {
        const halfHourLine = DOMUtils.createElement('div', 'ldesign-calendar-half-hour-line')
        DOMUtils.setStyle(halfHourLine, { top: `${this.HOUR_HEIGHT / 2}px` })
        DOMUtils.appendChild(timeSlot, halfHourLine)
      }
      
      DOMUtils.appendChild(timeAxis, timeSlot)
    }
    
    return timeAxis
  }

  /**
   * 创建事件区域
   */
  private createEventsArea(): HTMLElement {
    const eventsArea = DOMUtils.createElement('div', 'ldesign-calendar-events-area')
    
    // 创建时间网格
    const timeGrid = this.createTimeGrid()
    DOMUtils.appendChild(eventsArea, timeGrid)
    
    // 创建事件层
    const eventsLayer = this.createEventsLayer()
    DOMUtils.appendChild(eventsArea, eventsLayer)
    
    return eventsArea
  }

  /**
   * 创建时间网格
   */
  private createTimeGrid(): HTMLElement {
    const timeGrid = DOMUtils.createElement('div', 'ldesign-calendar-time-grid')
    
    for (let hour = 0; hour < this.HOURS_IN_DAY; hour++) {
      const gridSlot = DOMUtils.createElement('div', 'ldesign-calendar-grid-slot')
      DOMUtils.setData(gridSlot, 'hour', hour.toString())
      DOMUtils.setData(gridSlot, 'date', this.currentDate.format('YYYY-MM-DD'))
      DOMUtils.setData(gridSlot, 'datetime', this.currentDate.hour(hour).minute(0).format('YYYY-MM-DD HH:mm'))
      DOMUtils.setStyle(gridSlot, { height: `${this.HOUR_HEIGHT}px` })
      
      // 添加工作时间样式
      if (this.isWorkingHour(hour)) {
        DOMUtils.addClass(gridSlot, 'working-hour')
      }
      
      // 添加当前小时样式
      if (DateUtils.isToday(this.currentDate) && hour === DateUtils.now().hour()) {
        DOMUtils.addClass(gridSlot, 'current-hour')
      }
      
      DOMUtils.appendChild(timeGrid, gridSlot)
    }
    
    return timeGrid
  }

  /**
   * 创建事件层
   */
  private createEventsLayer(): HTMLElement {
    const eventsLayer = DOMUtils.createElement('div', 'ldesign-calendar-events-layer')
    
    // 获取当天的定时事件
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const dayEvents = eventManager.getEventsForDate(this.currentDate)
    const timedEvents = dayEvents.filter(event => !event.allDay)
    
    // 计算事件位置并创建元素
    const positionedEvents = this.calculateEventPositions(timedEvents)
    
    positionedEvents.forEach(eventInfo => {
      const eventElement = this.createTimedEventElement(eventInfo.event, eventInfo.position)
      DOMUtils.appendChild(eventsLayer, eventElement)
    })
    
    return eventsLayer
  }

  /**
   * 创建定时事件元素
   */
  private createTimedEventElement(event: CalendarEvent, position: {
    top: number
    height: number
    left: number
    width: number
  }): HTMLElement {
    const eventElement = DOMUtils.createElement('div', 'ldesign-calendar-timed-event')
    DOMUtils.setData(eventElement, 'eventId', event.id)
    
    // 设置事件样式和位置
    DOMUtils.setStyle(eventElement, {
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      color: event.textColor,
      top: `${position.top}px`,
      height: `${position.height}px`,
      left: `${position.left}%`,
      width: `${position.width}%`
    })
    
    // 事件内容
    const eventContent = DOMUtils.createElement('div', 'ldesign-calendar-event-content')
    
    // 事件标题
    const titleElement = DOMUtils.createElement('div', 'ldesign-calendar-event-title')
    DOMUtils.setTextContent(titleElement, event.title)
    DOMUtils.appendChild(eventContent, titleElement)
    
    // 事件时间
    const timeElement = DOMUtils.createElement('div', 'ldesign-calendar-event-time')
    const startTime = DateUtils.dayjs(event.start).format('HH:mm')
    const endTime = DateUtils.dayjs(event.end || event.start).format('HH:mm')
    DOMUtils.setTextContent(timeElement, `${startTime} - ${endTime}`)
    DOMUtils.appendChild(eventContent, timeElement)
    
    // 事件描述（如果有空间）
    if (position.height > 60 && event.description) {
      const descElement = DOMUtils.createElement('div', 'ldesign-calendar-event-description')
      DOMUtils.setTextContent(descElement, event.description)
      DOMUtils.appendChild(eventContent, descElement)
    }
    
    DOMUtils.appendChild(eventElement, eventContent)
    
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
   * 创建当前时间指示器
   */
  private createCurrentTimeIndicator(): HTMLElement {
    const indicator = DOMUtils.createElement('div', 'ldesign-calendar-current-time-indicator')
    
    const now = DateUtils.now()
    const hour = now.hour()
    const minute = now.minute()
    const topPosition = (hour + minute / 60) * this.HOUR_HEIGHT
    
    DOMUtils.setStyle(indicator, {
      top: `${topPosition}px`
    })
    
    // 添加时间标签
    const timeLabel = DOMUtils.createElement('div', 'ldesign-calendar-current-time-label')
    DOMUtils.setTextContent(timeLabel, now.format('HH:mm'))
    DOMUtils.appendChild(indicator, timeLabel)
    
    // 定时更新指示器位置
    this.updateCurrentTimeIndicator(indicator)
    
    return indicator
  }

  /**
   * 更新当前时间指示器
   */
  private updateCurrentTimeIndicator(indicator: HTMLElement): void {
    const updatePosition = () => {
      if (!DateUtils.isToday(this.currentDate)) return
      
      const now = DateUtils.now()
      const hour = now.hour()
      const minute = now.minute()
      const topPosition = (hour + minute / 60) * this.HOUR_HEIGHT
      
      DOMUtils.setStyle(indicator, {
        top: `${topPosition}px`
      })
      
      const timeLabel = indicator.querySelector('.ldesign-calendar-current-time-label')
      if (timeLabel) {
        DOMUtils.setTextContent(timeLabel as HTMLElement, now.format('HH:mm'))
      }
    }
    
    // 每分钟更新一次
    setInterval(updatePosition, 60000)
  }

  /**
   * 计算事件位置
   */
  private calculateEventPositions(events: CalendarEvent[]): Array<{
    event: CalendarEvent
    position: { top: number; height: number; left: number; width: number }
  }> {
    const positioned: Array<{
      event: CalendarEvent
      position: { top: number; height: number; left: number; width: number }
    }> = []
    
    // 按开始时间排序
    const sortedEvents = events.sort((a, b) => 
      DateUtils.dayjs(a.start).valueOf() - DateUtils.dayjs(b.start).valueOf()
    )
    
    sortedEvents.forEach(event => {
      const startTime = DateUtils.dayjs(event.start)
      const endTime = DateUtils.dayjs(event.end || event.start)
      
      // 计算垂直位置
      const startHour = startTime.hour() + startTime.minute() / 60
      const endHour = endTime.hour() + endTime.minute() / 60
      const top = startHour * this.HOUR_HEIGHT
      const height = Math.max((endHour - startHour) * this.HOUR_HEIGHT, 20) // 最小高度20px
      
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
    const start = this.currentDate.startOf('day')
    const end = this.currentDate.endOf('day')
    return { start, end }
  }

  /**
   * 跳转到指定日期
   */
  public goToDate(date: Dayjs): void {
    this.currentDate = date
    this.refresh()
  }

  /**
   * 上一天
   */
  public prevDay(): void {
    this.currentDate = this.currentDate.subtract(1, 'day')
    this.refresh()
  }

  /**
   * 下一天
   */
  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day')
    this.refresh()
  }

  /**
   * 获取当前日期信息
   */
  public getDayInfo(): {
    date: Dayjs
    year: number
    month: number
    day: number
    weekday: string
    isToday: boolean
    isWeekend: boolean
  } {
    const calendar = this.calendar as any
    const i18nManager = calendar.getI18nManager()
    
    return {
      date: this.currentDate,
      year: this.currentDate.year(),
      month: this.currentDate.month() + 1,
      day: this.currentDate.date(),
      weekday: this.currentDate.format('dddd'),
      isToday: DateUtils.isToday(this.currentDate),
      isWeekend: DateUtils.isWeekend(this.currentDate)
    }
  }

  /**
   * 滚动到指定时间
   */
  public scrollToTime(hour: number, minute = 0): void {
    if (!this.container) return
    
    const position = (hour + minute / 60) * this.HOUR_HEIGHT
    const eventsContainer = this.container.querySelector('.ldesign-calendar-day-events-container')
    
    if (eventsContainer) {
      eventsContainer.scrollTop = position
    }
  }

  /**
   * 滚动到当前时间
   */
  public scrollToCurrentTime(): void {
    if (DateUtils.isToday(this.currentDate)) {
      const now = DateUtils.now()
      this.scrollToTime(now.hour(), now.minute())
    }
  }

  /**
   * 获取指定时间的网格单元格
   */
  public getTimeGridCell(hour: number): HTMLElement | null {
    if (!this.container) return null
    
    return this.container.querySelector(`[data-hour="${hour}"]`)
  }

  /**
   * 高亮时间段
   */
  public highlightTimeSlot(startHour: number, endHour: number, className = 'highlighted'): void {
    for (let hour = startHour; hour < endHour; hour++) {
      const cellElement = this.getTimeGridCell(hour)
      if (cellElement) {
        DOMUtils.addClass(cellElement, className)
      }
    }
  }

  /**
   * 取消高亮时间段
   */
  public unhighlightTimeSlot(startHour: number, endHour: number, className = 'highlighted'): void {
    for (let hour = startHour; hour < endHour; hour++) {
      const cellElement = this.getTimeGridCell(hour)
      if (cellElement) {
        DOMUtils.removeClass(cellElement, className)
      }
    }
  }

  /**
   * 获取当天事件统计
   */
  public getDayStatistics(): {
    totalEvents: number
    allDayEvents: number
    timedEvents: number
    workingHourEvents: number
    duration: number
  } {
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const dayEvents = eventManager.getEventsForDate(this.currentDate)
    
    const allDayEvents = dayEvents.filter(event => event.allDay)
    const timedEvents = dayEvents.filter(event => !event.allDay)
    const workingHourEvents = timedEvents.filter(event => {
      const hour = DateUtils.dayjs(event.start).hour()
      return this.isWorkingHour(hour)
    })
    
    // 计算总时长（分钟）
    const duration = timedEvents.reduce((total, event) => {
      const start = DateUtils.dayjs(event.start)
      const end = DateUtils.dayjs(event.end || event.start)
      return total + end.diff(start, 'minute')
    }, 0)
    
    return {
      totalEvents: dayEvents.length,
      allDayEvents: allDayEvents.length,
      timedEvents: timedEvents.length,
      workingHourEvents: workingHourEvents.length,
      duration
    }
  }
}
