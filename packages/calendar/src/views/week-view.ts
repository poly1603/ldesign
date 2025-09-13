/**
 * 周视图组件
 * 
 * 实现周视图的显示和交互功能：
 * - 一周7天的时间轴显示
 * - 事件在时间轴上的显示
 * - 时间段选择
 * - 全天事件区域
 * - 当前时间线显示
 */

import { BaseView } from './base-view'
import type { ViewType } from '../types/view'

/**
 * 周视图类
 */
export class WeekView extends BaseView {
  /** 视图类型 */
  readonly type: ViewType = 'week'

  /** 当前显示的周 */
  public currentWeek: Date = new Date()

  /**
   * 获取视图日期范围
   */
  getDateRange(): { start: Date; end: Date } {
    const startOfWeek = this.getStartOfWeek(this.currentWeek)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    return {
      start: startOfWeek,
      end: endOfWeek,
    }
  }

  /**
   * 跳转到指定日期
   * @param date 目标日期
   */
  goToDate(date: Date): void {
    this.currentWeek = new Date(date)
    this.render()
  }

  /**
   * 上一页（上一周）
   */
  prev(): void {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7)
    this.render()
  }

  /**
   * 下一页（下一周）
   */
  next(): void {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7)
    this.render()
  }

  /**
   * 视图渲染实现
   */
  protected onRender(): void {
    if (!this.container) return

    console.log('WeekView onRender() 开始')
    this.container.innerHTML = `
      <div class="ldesign-calendar-week">
        <div class="ldesign-calendar-week-header">
          <div class="ldesign-calendar-time-axis-header"></div>
          <div class="ldesign-calendar-week-days"></div>
        </div>
        <div class="ldesign-calendar-week-body">
          <div class="ldesign-calendar-time-axis"></div>
          <div class="ldesign-calendar-week-grid"></div>
        </div>
      </div>
    `

    console.log('WeekView HTML结构创建完成')
    this.renderHeader()
    console.log('WeekView 头部渲染完成')
    this.renderTimeAxis()
    console.log('WeekView 时间轴渲染完成')
    this.renderGrid()
    console.log('WeekView 网格渲染完成')
    this.renderEvents()
    console.log('WeekView 事件渲染完成')
  }

  /**
   * 渲染头部
   */
  private renderHeader(): void {
    const weekDaysContainer = this.container?.querySelector('.ldesign-calendar-week-days')
    if (!weekDaysContainer) return

    const { start } = this.getDateRange()
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)

      const dayElement = this.createElement('div', 'ldesign-calendar-week-day')

      if (this.isSameDay(date, today)) {
        dayElement.classList.add('is-today')
      }

      const dayName = this.createElement('div', 'ldesign-calendar-day-name',
        this.getDayName(date.getDay()))
      const dayNumber = this.createElement('div', 'ldesign-calendar-day-number',
        String(date.getDate()))

      dayElement.appendChild(dayName)
      dayElement.appendChild(dayNumber)
      weekDaysContainer.appendChild(dayElement)
    }
  }

  /**
   * 渲染时间轴
   */
  private renderTimeAxis(): void {
    const timeAxisContainer = this.container?.querySelector('.ldesign-calendar-time-axis')
    if (!timeAxisContainer) return

    // 生成24小时的时间标签
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = this.createElement('div', 'ldesign-calendar-time-slot')
      const timeLabel = this.createElement('div', 'ldesign-calendar-time-label',
        `${String(hour).padStart(2, '0')}:00`)

      timeSlot.appendChild(timeLabel)
      timeAxisContainer.appendChild(timeSlot)
    }
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    const gridContainer = this.container?.querySelector('.ldesign-calendar-week-grid')
    if (!gridContainer) return

    // 创建7天 x 24小时的网格
    for (let day = 0; day < 7; day++) {
      const dayColumn = this.createElement('div', 'ldesign-calendar-day-column')

      for (let hour = 0; hour < 24; hour++) {
        const timeSlot = this.createElement('div', 'ldesign-calendar-time-slot')
        timeSlot.setAttribute('data-day', String(day))
        timeSlot.setAttribute('data-hour', String(hour))

        // 绑定点击事件
        this.addEventListener(timeSlot, 'click', (e) => {
          const { start } = this.getDateRange()
          const clickDate = new Date(start)
          clickDate.setDate(clickDate.getDate() + day)
          clickDate.setHours(hour, 0, 0, 0)
          this.handleDateClick(clickDate, e)
        })

        dayColumn.appendChild(timeSlot)
      }

      gridContainer.appendChild(dayColumn)
    }
  }

  /**
   * 渲染事件
   */
  private renderEvents(): void {
    console.log('WeekView renderEvents() 开始')
    const events = this.getEvents()
    console.log('WeekView 获取到事件数量:', events?.length || 0)
    if (!events || !this.container) {
      console.log('WeekView renderEvents 退出: 没有事件或容器')
      return
    }

    const gridContainer = this.container.querySelector('.ldesign-calendar-week-grid')
    console.log('WeekView 找到网格容器:', !!gridContainer)
    if (!gridContainer) {
      console.log('WeekView renderEvents 退出: 没有找到网格容器')
      return
    }

    // 清除现有事件
    const existingEvents = gridContainer.querySelectorAll('.ldesign-calendar-event')
    console.log('WeekView 清除现有事件数量:', existingEvents.length)
    existingEvents.forEach(event => event.remove())

    const { start, end } = this.getDateRange()
    console.log('WeekView 当前周范围:', start.toISOString(), '到', end.toISOString())

    // 过滤当前周的事件
    const weekEvents = events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      console.log('WeekView 检查事件:', event.title, '时间:', eventStart.toISOString(), '到', eventEnd.toISOString())

      // 检查事件是否与当前周重叠
      const overlaps = eventStart < end && eventEnd > start
      console.log('WeekView 事件是否在当前周:', overlaps)
      return overlaps
    })

    console.log('WeekView 当前周事件数量:', weekEvents.length)

    // 按天分组事件
    const eventsByDay: { [key: number]: typeof weekEvents } = {}
    for (let i = 0; i < 7; i++) {
      eventsByDay[i] = []
    }

    weekEvents.forEach(event => {
      const eventStart = new Date(event.start)
      const dayIndex = this.getDayIndex(eventStart, start)

      if (dayIndex >= 0 && dayIndex < 7) {
        eventsByDay[dayIndex].push(event)
      }
    })

    // 渲染每天的事件
    Object.keys(eventsByDay).forEach(dayKey => {
      const dayIndex = parseInt(dayKey)
      const dayEvents = eventsByDay[dayIndex]

      if (dayEvents.length > 0) {
        this.renderDayEvents(dayIndex, dayEvents)
      }
    })
  }

  /**
   * 渲染某一天的事件
   * @param dayIndex 天索引（0-6）
   * @param events 该天的事件列表
   */
  private renderDayEvents(dayIndex: number, events: any[]): void {
    const gridContainer = this.container?.querySelector('.ldesign-calendar-week-grid')
    if (!gridContainer) return

    const dayColumn = gridContainer.children[dayIndex] as HTMLElement
    if (!dayColumn) return

    events.forEach(event => {
      const eventElement = this.createEventElement(event, dayIndex)
      if (eventElement) {
        dayColumn.appendChild(eventElement)
      }
    })
  }

  /**
   * 创建事件元素
   * @param event 事件数据
   * @param dayIndex 天索引
   */
  private createEventElement(event: any, dayIndex: number): HTMLElement | null {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // 计算事件在时间轴上的位置和高度
    const startHour = eventStart.getHours()
    const startMinute = eventStart.getMinutes()
    const endHour = eventEnd.getHours()
    const endMinute = eventEnd.getMinutes()

    // 计算顶部位置（以小时为单位）
    const topPosition = startHour + (startMinute / 60)

    // 计算高度（以小时为单位）
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)

    // 创建事件元素
    const eventElement = this.createElement('div', 'ldesign-calendar-event')
    eventElement.style.position = 'absolute'
    eventElement.style.top = `${topPosition * 60}px` // 每小时60px
    eventElement.style.height = `${Math.max(duration * 60, 20)}px` // 最小高度20px
    eventElement.style.left = '2px'
    eventElement.style.right = '2px'
    eventElement.style.backgroundColor = event.color || '#722ED1'
    eventElement.style.color = 'white'
    eventElement.style.borderRadius = '4px'
    eventElement.style.padding = '2px 6px'
    eventElement.style.fontSize = '12px'
    eventElement.style.overflow = 'hidden'
    eventElement.style.cursor = 'pointer'
    eventElement.style.zIndex = '10'

    // 设置事件内容
    const eventTitle = this.createElement('div', 'ldesign-calendar-event-title', event.title)
    eventTitle.style.fontWeight = '500'
    eventTitle.style.marginBottom = '2px'

    const eventTime = this.createElement('div', 'ldesign-calendar-event-time',
      `${this.formatTime(eventStart)} - ${this.formatTime(eventEnd)}`)
    eventTime.style.fontSize = '11px'
    eventTime.style.opacity = '0.9'

    eventElement.appendChild(eventTitle)
    if (duration >= 1) { // 只有持续时间超过1小时才显示时间
      eventElement.appendChild(eventTime)
    }

    // 绑定点击事件
    this.addEventListener(eventElement, 'click', (e) => {
      e.stopPropagation()
      this.handleEventClick(event, e)
    })

    return eventElement
  }

  /**
   * 获取日期在周中的索引
   * @param date 日期
   * @param weekStart 周开始日期
   */
  private getDayIndex(date: Date, weekStart: Date): number {
    const diffTime = date.getTime() - weekStart.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  /**
   * 格式化时间
   * @param date 日期
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /**
   * 获取一周的开始日期（周日）
   * @param date 参考日期
   */
  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  }

  /**
   * 获取星期名称
   * @param dayOfWeek 星期几（0-6）
   */
  private getDayName(dayOfWeek: number): string {
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    return dayNames[dayOfWeek] || '未知'
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
   * 重写更新方法，只更新事件而不重新渲染整个视图
   */
  protected onUpdate(): void {
    if (!this.container) return

    // 只重新渲染事件，不重新渲染整个视图结构
    this.renderEvents()
  }
}
