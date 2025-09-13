/**
 * 日视图组件
 * 
 * 实现日视图的显示和交互功能：
 * - 单日的详细时间轴显示
 * - 事件在时间轴上的精确显示
 * - 小时级别的时间选择
 * - 当前时间线显示
 * - 事件详情展示
 */

import { BaseView } from './base-view'
import type { ViewType } from '../types/view'

/**
 * 日视图类
 */
export class DayView extends BaseView {
  /** 视图类型 */
  readonly type: ViewType = 'day'

  /** 当前显示的日期 */
  private currentDay: Date = new Date()

  /**
   * 获取视图日期范围
   */
  getDateRange(): { start: Date; end: Date } {
    const start = new Date(this.currentDay)
    start.setHours(0, 0, 0, 0)

    const end = new Date(this.currentDay)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  /**
   * 跳转到指定日期
   * @param date 目标日期
   */
  goToDate(date: Date): void {
    this.currentDay = new Date(date)
    this.render()
  }

  /**
   * 上一页（上一天）
   */
  prev(): void {
    this.currentDay.setDate(this.currentDay.getDate() - 1)
    this.render()
  }

  /**
   * 下一页（下一天）
   */
  next(): void {
    this.currentDay.setDate(this.currentDay.getDate() + 1)
    this.render()
  }

  /**
   * 视图渲染实现
   */
  protected onRender(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="ldesign-calendar-day">
        <div class="ldesign-calendar-day-header">
          <div class="ldesign-calendar-day-title"></div>
        </div>
        <div class="ldesign-calendar-day-body">
          <div class="ldesign-calendar-time-axis"></div>
          <div class="ldesign-calendar-day-content"></div>
        </div>
      </div>
    `

    this.renderHeader()
    this.renderTimeAxis()
    this.renderContent()
    this.renderEvents()
  }

  /**
   * 渲染头部
   */
  private renderHeader(): void {
    const headerContainer = this.container?.querySelector('.ldesign-calendar-day-title')
    if (!headerContainer) return

    const today = new Date()
    const isToday = this.isSameDay(this.currentDay, today)

    const dayTitle = this.createElement('div', 'ldesign-calendar-day-name')
    dayTitle.textContent = `${this.formatDate(this.currentDay, 'YYYY年MM月DD日')} ${this.getDayName(this.currentDay.getDay())}`

    if (isToday) {
      dayTitle.classList.add('is-today')
    }

    headerContainer.appendChild(dayTitle)
  }

  /**
   * 渲染时间轴
   */
  private renderTimeAxis(): void {
    const timeAxisContainer = this.container?.querySelector('.ldesign-calendar-time-axis')
    if (!timeAxisContainer) return

    // 生成24小时的时间标签，每小时分为4个15分钟段
    for (let hour = 0; hour < 24; hour++) {
      const hourContainer = this.createElement('div', 'ldesign-calendar-hour-container')

      // 小时标签
      const hourLabel = this.createElement('div', 'ldesign-calendar-hour-label',
        `${String(hour).padStart(2, '0')}:00`)
      hourContainer.appendChild(hourLabel)

      // 15分钟间隔
      for (let quarter = 0; quarter < 4; quarter++) {
        const quarterSlot = this.createElement('div', 'ldesign-calendar-quarter-slot')
        if (quarter > 0) {
          const quarterLabel = this.createElement('div', 'ldesign-calendar-quarter-label',
            `${String(hour).padStart(2, '0')}:${String(quarter * 15).padStart(2, '0')}`)
          quarterSlot.appendChild(quarterLabel)
        }
        hourContainer.appendChild(quarterSlot)
      }

      timeAxisContainer.appendChild(hourContainer)
    }
  }

  /**
   * 渲染内容区域
   */
  private renderContent(): void {
    const contentContainer = this.container?.querySelector('.ldesign-calendar-day-content')
    if (!contentContainer) return

    // 创建24小时的内容网格
    for (let hour = 0; hour < 24; hour++) {
      const hourContainer = this.createElement('div', 'ldesign-calendar-hour-content')

      // 每小时分为4个15分钟段
      for (let quarter = 0; quarter < 4; quarter++) {
        const quarterSlot = this.createElement('div', 'ldesign-calendar-quarter-content')
        quarterSlot.setAttribute('data-hour', String(hour))
        quarterSlot.setAttribute('data-quarter', String(quarter))

        // 绑定点击事件
        this.addEventListener(quarterSlot, 'click', (e) => {
          const clickDate = new Date(this.currentDay)
          clickDate.setHours(hour, quarter * 15, 0, 0)
          this.handleDateClick(clickDate, e)
        })

        hourContainer.appendChild(quarterSlot)
      }

      contentContainer.appendChild(hourContainer)
    }
  }

  /**
   * 渲染事件
   */
  private renderEvents(): void {
    const contentContainer = this.container?.querySelector('.ldesign-calendar-day-content')
    if (!contentContainer) return

    const events = this.getEvents()
    const { start, end } = this.getDateRange()

    // 过滤当天的事件
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      return (eventStart >= start && eventStart <= end) ||
        (eventEnd >= start && eventEnd <= end) ||
        (eventStart <= start && eventEnd >= end)
    })

    // 清除现有事件
    const existingEvents = contentContainer.querySelectorAll('.ldesign-calendar-event')
    existingEvents.forEach(event => event.remove())

    // 渲染每个事件
    dayEvents.forEach(event => {
      const eventElement = this.createEventElement(event)
      if (eventElement) {
        contentContainer.appendChild(eventElement)
      }
    })
  }

  /**
   * 创建事件元素
   * @param event 事件数据
   */
  private createEventElement(event: any): HTMLElement | null {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // 如果是全天事件，显示在顶部
    if (event.allDay) {
      return this.createAllDayEventElement(event)
    }

    // 计算事件在时间轴上的位置
    const startHour = eventStart.getHours()
    const startMinute = eventStart.getMinutes()
    const endHour = eventEnd.getHours()
    const endMinute = eventEnd.getMinutes()

    // 计算顶部位置（以15分钟为单位）
    const startQuarters = startHour * 4 + Math.floor(startMinute / 15)
    const endQuarters = endHour * 4 + Math.floor(endMinute / 15)
    const durationQuarters = endQuarters - startQuarters

    // 创建事件元素
    const eventElement = this.createElement('div', 'ldesign-calendar-event')
    eventElement.style.position = 'absolute'
    eventElement.style.top = `${startQuarters * 15}px` // 每个15分钟段15px高
    eventElement.style.height = `${Math.max(durationQuarters * 15, 15)}px` // 最小高度15px
    eventElement.style.left = '60px' // 时间轴宽度
    eventElement.style.right = '10px'
    eventElement.style.backgroundColor = event.color || '#722ED1'
    eventElement.style.color = 'white'
    eventElement.style.borderRadius = '4px'
    eventElement.style.padding = '4px 8px'
    eventElement.style.fontSize = '12px'
    eventElement.style.overflow = 'hidden'
    eventElement.style.cursor = 'pointer'
    eventElement.style.zIndex = '10'
    eventElement.style.border = '1px solid rgba(255,255,255,0.2)'

    // 设置事件内容
    const eventTitle = this.createElement('div', 'ldesign-calendar-event-title', event.title)
    eventTitle.style.fontWeight = '500'
    eventTitle.style.marginBottom = '2px'

    const eventTime = this.createElement('div', 'ldesign-calendar-event-time',
      `${this.formatTime(eventStart)} - ${this.formatTime(eventEnd)}`)
    eventTime.style.fontSize = '11px'
    eventTime.style.opacity = '0.9'

    eventElement.appendChild(eventTitle)
    if (durationQuarters >= 2) { // 只有持续时间超过30分钟才显示时间
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
   * 创建全天事件元素
   * @param event 事件数据
   */
  private createAllDayEventElement(event: any): HTMLElement {
    const eventElement = this.createElement('div', 'ldesign-calendar-all-day-event')
    eventElement.style.position = 'absolute'
    eventElement.style.top = '0'
    eventElement.style.left = '60px'
    eventElement.style.right = '10px'
    eventElement.style.height = '24px'
    eventElement.style.backgroundColor = event.color || '#722ED1'
    eventElement.style.color = 'white'
    eventElement.style.borderRadius = '4px'
    eventElement.style.padding = '4px 8px'
    eventElement.style.fontSize = '12px'
    eventElement.style.display = 'flex'
    eventElement.style.alignItems = 'center'
    eventElement.style.cursor = 'pointer'
    eventElement.style.zIndex = '20'

    const eventTitle = this.createElement('span', 'ldesign-calendar-event-title', event.title)
    eventTitle.style.fontWeight = '500'

    const allDayLabel = this.createElement('span', 'ldesign-calendar-all-day-label', '全天')
    allDayLabel.style.marginLeft = 'auto'
    allDayLabel.style.fontSize = '10px'
    allDayLabel.style.opacity = '0.8'

    eventElement.appendChild(eventTitle)
    eventElement.appendChild(allDayLabel)

    // 绑定点击事件
    this.addEventListener(eventElement, 'click', (e) => {
      e.stopPropagation()
      this.handleEventClick(event, e)
    })

    return eventElement
  }

  /**
   * 获取星期名称
   * @param dayOfWeek 星期几（0-6）
   */
  private getDayName(dayOfWeek: number): string {
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
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
}
