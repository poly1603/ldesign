/**
 * 月视图组件
 * 
 * 实现月视图的显示和交互功能：
 * - 月份日期网格显示
 * - 事件在日期单元格中的显示
 * - 日期选择和范围选择
 * - 农历和节假日显示
 * - 响应式布局
 */

import { BaseView } from './base-view'
import type { ViewType } from '../types/view'
import type { CalendarEvent } from '../types/event'
import { getLunarShortText } from '../utils/lunar'
import { getHolidayName } from '../utils/holidays'

/**
 * 月视图类
 */
export class MonthView extends BaseView {
  /** 视图类型 */
  readonly type: ViewType = 'month'

  /** 当前显示的月份 */
  private currentMonth: Date = new Date()

  /** 日期网格元素 */
  private gridElement: HTMLElement | null = null

  /** 头部元素 */
  private headerElement: HTMLElement | null = null

  /**
   * 获取视图日期范围
   */
  getDateRange(): { start: Date; end: Date } {
    const year = this.currentMonth.getFullYear()
    const month = this.currentMonth.getMonth()

    // 获取月份第一天
    const firstDay = new Date(year, month, 1)

    // 获取月份最后一天
    const lastDay = new Date(year, month + 1, 0)

    // 获取显示范围的开始日期（包含上个月的日期）
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // 获取显示范围的结束日期（包含下个月的日期）
    const endDate = new Date(lastDay)
    const remainingDays = 6 - lastDay.getDay()
    endDate.setDate(endDate.getDate() + remainingDays)

    return {
      start: startDate,
      end: endDate,
    }
  }

  /**
   * 跳转到指定日期
   * @param date 目标日期
   */
  goToDate(date: Date): void {
    this.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    this.render()
  }

  /**
   * 上一页（上个月）
   */
  prev(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1)
    this.render()
  }

  /**
   * 下一页（下个月）
   */
  next(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1)
    this.render()
  }

  /**
   * 视图渲染实现
   */
  protected onRender(): void {
    if (!this.container) return

    // 创建月视图结构
    this.container.innerHTML = `
      <div class="ldesign-calendar-month">
        <div class="ldesign-calendar-month-header"></div>
        <div class="ldesign-calendar-month-grid"></div>
      </div>
    `

    this.headerElement = this.container.querySelector('.ldesign-calendar-month-header')
    this.gridElement = this.container.querySelector('.ldesign-calendar-month-grid')

    // 渲染头部
    this.renderHeader()

    // 渲染日期网格
    this.renderGrid()

    // 渲染事件
    this.renderEvents()
  }

  /**
   * 渲染头部
   */
  private renderHeader(): void {
    if (!this.headerElement) return

    // 渲染星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekdayRow = this.createElement('div', 'ldesign-calendar-weekdays')

    weekdays.forEach(weekday => {
      const weekdayCell = this.createElement('div', 'ldesign-calendar-weekday', weekday)
      weekdayRow.appendChild(weekdayCell)
    })

    this.headerElement.appendChild(weekdayRow)
  }

  /**
   * 渲染日期网格
   */
  private renderGrid(): void {
    if (!this.gridElement) return

    const { start, end } = this.getDateRange()
    const today = new Date()
    const currentDate = this.context?.currentDate || new Date()

    // 创建日期网格
    const currentDateIter = new Date(start)

    while (currentDateIter <= end) {
      const dateCell = this.createDateCell(currentDateIter, today, currentDate)
      this.gridElement.appendChild(dateCell)

      // 移动到下一天
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }
  }

  /**
   * 创建日期单元格
   * @param date 日期
   * @param today 今天日期
   * @param currentDate 当前选中日期
   */
  private createDateCell(date: Date, today: Date, currentDate: Date): HTMLElement {
    const dateCell = this.createElement('div', 'ldesign-calendar-day-cell')

    // 添加日期相关的CSS类
    const isToday = this.isSameDay(date, today)
    const isCurrentMonth = date.getMonth() === this.currentMonth.getMonth()
    const isSelected = this.isSameDay(date, currentDate)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    if (isToday) dateCell.classList.add('is-today')
    if (!isCurrentMonth) dateCell.classList.add('is-other-month')
    if (isSelected) dateCell.classList.add('is-selected')
    if (isWeekend) dateCell.classList.add('is-weekend')

    // 创建日期内容
    const dateContent = this.createElement('div', 'ldesign-calendar-day-content')

    // 日期数字
    const dateNumber = this.createElement('div', 'ldesign-calendar-day-number', String(date.getDate()))
    dateContent.appendChild(dateNumber)

    // 农历显示（如果启用）
    if (this.context?.calendar.getConfig().showLunar) {
      const lunarText = this.getLunarText(date)
      if (lunarText) {
        const lunarElement = this.createElement('div', 'ldesign-calendar-lunar', lunarText)
        dateContent.appendChild(lunarElement)
      }
    }

    // 节假日显示（如果启用）
    if (this.context?.calendar.getConfig().showHolidays) {
      const holidayText = this.getHolidayText(date)
      if (holidayText) {
        const holidayElement = this.createElement('div', 'ldesign-calendar-holiday', holidayText)
        dateContent.appendChild(holidayElement)
        dateCell.classList.add('has-holiday')
      }
    }

    dateCell.appendChild(dateContent)

    // 事件容器
    const eventsContainer = this.createElement('div', 'ldesign-calendar-events')
    dateCell.appendChild(eventsContainer)

    // 绑定点击事件
    this.addEventListener(dateCell, 'click', (e) => {
      this.handleDateClick(new Date(date), e)
    })

    // 设置数据属性
    dateCell.setAttribute('data-date', this.formatDate(date))

    return dateCell
  }

  /**
   * 渲染事件
   */
  private renderEvents(): void {
    if (!this.gridElement) return

    const events = this.getEvents()
    const { start, end } = this.getDateRange()

    // 过滤出在当前月份范围内的事件
    const visibleEvents = events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      return (eventStart >= start && eventStart <= end) ||
        (eventEnd >= start && eventEnd <= end) ||
        (eventStart <= start && eventEnd >= end)
    })

    // 为每个事件创建显示元素
    visibleEvents.forEach(event => {
      this.renderEvent(event)
    })
  }

  /**
   * 渲染单个事件
   * @param event 事件对象
   */
  private renderEvent(event: CalendarEvent): void {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // 如果是全天事件或跨天事件，需要特殊处理
    if (event.allDay || !this.isSameDay(eventStart, eventEnd)) {
      this.renderMultiDayEvent(event)
    } else {
      this.renderSingleDayEvent(event)
    }
  }

  /**
   * 渲染单日事件
   * @param event 事件对象
   */
  private renderSingleDayEvent(event: CalendarEvent): void {
    const eventDate = new Date(event.start)
    const dateStr = this.formatDate(eventDate)
    const dateCell = this.gridElement?.querySelector(`[data-date="${dateStr}"]`)

    if (dateCell) {
      const eventsContainer = dateCell.querySelector('.ldesign-calendar-events')
      if (eventsContainer) {
        const eventElement = this.createEventElement(event)
        eventsContainer.appendChild(eventElement)
      }
    }
  }

  /**
   * 渲染多日事件
   * @param event 事件对象
   */
  private renderMultiDayEvent(event: CalendarEvent): void {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const { start: viewStart, end: viewEnd } = this.getDateRange()

    // 计算事件在视图中的实际开始和结束日期
    const displayStart = eventStart < viewStart ? viewStart : eventStart
    const displayEnd = eventEnd > viewEnd ? viewEnd : eventEnd

    // 计算跨越的天数
    const startDate = new Date(displayStart)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(displayEnd)
    endDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // 为每一天创建事件片段
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)

      const dateStr = this.formatDate(currentDate)
      const dateCell = this.gridElement?.querySelector(`[data-date="${dateStr}"]`)

      if (dateCell) {
        const eventsContainer = dateCell.querySelector('.ldesign-calendar-events')
        if (eventsContainer) {
          const eventElement = this.createMultiDayEventElement(event, i, daysDiff)
          eventsContainer.appendChild(eventElement)
        }
      }
    }
  }

  /**
   * 创建多日事件元素
   * @param event 事件对象
   * @param dayIndex 当前天在事件中的索引
   * @param totalDays 事件总天数
   */
  private createMultiDayEventElement(event: CalendarEvent, dayIndex: number, totalDays: number): HTMLElement {
    const eventElement = this.createElement('div', 'ldesign-calendar-multi-day-event')

    // 设置事件样式
    if (event.color) {
      eventElement.style.backgroundColor = event.backgroundColor || event.color
      eventElement.style.borderColor = event.borderColor || event.color
      eventElement.style.color = event.textColor || '#ffffff'
    }

    // 根据位置设置不同的样式
    eventElement.classList.add('multi-day-event')
    if (dayIndex === 0) {
      eventElement.classList.add('multi-day-start')
    }
    if (dayIndex === totalDays) {
      eventElement.classList.add('multi-day-end')
    }
    if (dayIndex > 0 && dayIndex < totalDays) {
      eventElement.classList.add('multi-day-middle')
    }

    // 只在第一天显示标题
    if (dayIndex === 0) {
      const eventTitle = this.createElement('div', 'ldesign-calendar-event-title', event.title)
      eventElement.appendChild(eventTitle)

      // 如果不是全天事件，在第一天显示开始时间
      if (!event.allDay) {
        const eventTime = this.createElement('div', 'ldesign-calendar-event-time',
          this.formatTime(new Date(event.start)))
        eventElement.appendChild(eventTime)
      }
    } else if (dayIndex === totalDays && !event.allDay) {
      // 在最后一天显示结束时间
      const eventTime = this.createElement('div', 'ldesign-calendar-event-time',
        `至 ${this.formatTime(new Date(event.end))}`)
      eventElement.appendChild(eventTime)
    }

    // 绑定事件处理器
    this.addEventListener(eventElement, 'click', (e) => {
      this.handleEventClick(event, e)
    })

    return eventElement
  }

  /**
   * 创建事件元素
   * @param event 事件对象
   */
  private createEventElement(event: CalendarEvent): HTMLElement {
    const eventElement = this.createElement('div', 'ldesign-calendar-event')

    // 设置事件样式
    if (event.color) {
      eventElement.style.backgroundColor = event.backgroundColor || event.color
      eventElement.style.borderColor = event.borderColor || event.color
      eventElement.style.color = event.textColor || '#ffffff'
    }

    // 事件标题
    const eventTitle = this.createElement('div', 'ldesign-calendar-event-title', event.title)
    eventElement.appendChild(eventTitle)

    // 事件时间（如果不是全天事件）
    if (!event.allDay) {
      const eventTime = this.createElement('div', 'ldesign-calendar-event-time',
        this.formatTime(new Date(event.start)))
      eventElement.appendChild(eventTime)
    }

    // 绑定事件处理器
    this.addEventListener(eventElement, 'click', (e) => {
      this.handleEventClick(event, e)
    })

    // 如果事件可拖拽，设置拖拽属性
    if (event.draggable) {
      eventElement.draggable = true
      this.addEventListener(eventElement, 'dragstart', (e) => {
        this.handleDragStart(event, e as DragEvent)
      })
    }

    return eventElement
  }

  /**
   * 判断两个日期是否是同一天
   * @param date1 日期1
   * @param date2 日期2
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
  }

  /**
   * 获取农历文本
   * @param date 日期
   */
  private getLunarText(date: Date): string {
    try {
      return getLunarShortText(date)
    } catch (error) {
      console.warn('农历功能加载失败:', error)
      return ''
    }
  }

  /**
   * 获取节假日文本
   * @param date 日期
   */
  private getHolidayText(date: Date): string {
    try {
      return getHolidayName(date) || ''
    } catch (error) {
      console.warn('节假日功能加载失败:', error)
      return ''
    }
  }
}
