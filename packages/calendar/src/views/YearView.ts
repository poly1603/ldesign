/**
 * 年视图组件
 */

import type { Dayjs } from 'dayjs'
import type { ViewType } from '../types'
import { BaseView } from './BaseView'
import { DOMUtils } from '../utils/dom'
import { DateUtils } from '../utils/date'

/**
 * 年视图类
 */
export class YearView extends BaseView {
  protected viewType: ViewType = 'year'

  /**
   * 创建视图结构
   */
  protected createViewStructure(): HTMLElement {
    const yearView = DOMUtils.createElement('div', 'ldesign-calendar-year-view')

    // 创建年份标题
    const yearHeader = this.createYearHeader()
    DOMUtils.appendChild(yearView, yearHeader)

    // 创建月份网格
    const monthsGrid = this.createMonthsGrid()
    DOMUtils.appendChild(yearView, monthsGrid)

    return yearView
  }

  /**
   * 创建年份标题
   */
  private createYearHeader(): HTMLElement {
    const header = DOMUtils.createElement('div', 'ldesign-calendar-year-header')
    
    const yearTitle = DOMUtils.createElement('h2', 'ldesign-calendar-year-title')
    DOMUtils.setTextContent(yearTitle, this.currentDate.year().toString())
    DOMUtils.appendChild(header, yearTitle)
    
    return header
  }

  /**
   * 创建月份网格
   */
  private createMonthsGrid(): HTMLElement {
    const grid = DOMUtils.createElement('div', 'ldesign-calendar-months-grid')
    
    // 获取年份的所有月份
    const months = DateUtils.getYearViewMonths(this.currentDate)
    
    months.forEach((month, index) => {
      const monthCard = this.createMonthCard(month, index)
      DOMUtils.appendChild(grid, monthCard)
    })
    
    return grid
  }

  /**
   * 创建月份卡片
   */
  private createMonthCard(month: Dayjs, index: number): HTMLElement {
    const calendar = this.calendar as any
    const i18nManager = calendar.getI18nManager()
    
    const monthCard = DOMUtils.createElement('div', 'ldesign-calendar-month-card')
    DOMUtils.setData(monthCard, 'month', index.toString())
    DOMUtils.setData(monthCard, 'date', month.format('YYYY-MM-DD'))
    
    // 月份标题
    const monthHeader = DOMUtils.createElement('div', 'ldesign-calendar-month-header')
    const monthNames = i18nManager.getMonthNames('short')
    const monthName = monthNames[month.month()]
    DOMUtils.setTextContent(monthHeader, monthName)
    DOMUtils.appendChild(monthCard, monthHeader)
    
    // 月份日历
    const monthCalendar = this.createMiniMonthCalendar(month)
    DOMUtils.appendChild(monthCard, monthCalendar)
    
    // 添加当前月标记
    if (DateUtils.isSameMonth(month, DateUtils.now())) {
      DOMUtils.addClass(monthCard, 'current-month')
    }
    
    // 添加选中月标记
    if (DateUtils.isSameMonth(month, this.currentDate)) {
      DOMUtils.addClass(monthCard, 'selected-month')
    }
    
    return monthCard
  }

  /**
   * 创建迷你月份日历
   */
  private createMiniMonthCalendar(month: Dayjs): HTMLElement {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const i18nManager = calendar.getI18nManager()
    
    const miniCalendar = DOMUtils.createElement('div', 'ldesign-calendar-mini-month')
    
    // 创建星期标题
    const weekdaysHeader = DOMUtils.createElement('div', 'ldesign-calendar-mini-weekdays')
    const weekdayNames = i18nManager.getWeekdayNames('narrow')
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    // 根据每周起始日调整星期顺序
    const orderedWeekdays = this.getOrderedWeekdays(weekdayNames, firstDayOfWeek)
    
    orderedWeekdays.forEach(weekday => {
      const weekdayElement = DOMUtils.createElement('div', 'ldesign-calendar-mini-weekday')
      DOMUtils.setTextContent(weekdayElement, weekday)
      DOMUtils.appendChild(weekdaysHeader, weekdayElement)
    })
    
    DOMUtils.appendChild(miniCalendar, weekdaysHeader)
    
    // 创建日期网格
    const datesGrid = DOMUtils.createElement('div', 'ldesign-calendar-mini-dates')
    const dates = DateUtils.getMonthViewDates(month, firstDayOfWeek)
    
    dates.forEach(date => {
      const dateElement = this.createMiniDateElement(date, month)
      DOMUtils.appendChild(datesGrid, dateElement)
    })
    
    DOMUtils.appendChild(miniCalendar, datesGrid)
    
    return miniCalendar
  }

  /**
   * 创建迷你日期元素
   */
  private createMiniDateElement(date: Dayjs, currentMonth: Dayjs): HTMLElement {
    const dateElement = DOMUtils.createElement('div', 'ldesign-calendar-mini-date')
    DOMUtils.setData(dateElement, 'date', date.format('YYYY-MM-DD'))
    DOMUtils.setTextContent(dateElement, date.date().toString())
    
    // 添加状态类名
    if (!DateUtils.isSameMonth(date, currentMonth)) {
      DOMUtils.addClass(dateElement, 'other-month')
    }
    
    if (DateUtils.isToday(date)) {
      DOMUtils.addClass(dateElement, 'today')
    }
    
    if (DateUtils.isWeekend(date)) {
      DOMUtils.addClass(dateElement, 'weekend')
    }
    
    // 检查是否有事件
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const dayEvents = eventManager.getEventsForDate(date)
    
    if (dayEvents.length > 0) {
      DOMUtils.addClass(dateElement, 'has-events')
      
      // 添加事件指示器
      const eventIndicator = DOMUtils.createElement('div', 'ldesign-calendar-event-indicator')
      DOMUtils.appendChild(dateElement, eventIndicator)
    }
    
    return dateElement
  }

  /**
   * 获取排序后的星期名称
   */
  private getOrderedWeekdays(weekdays: string[], firstDayOfWeek: number): string[] {
    if (firstDayOfWeek === 0) {
      // 周日开始，保持原顺序
      return weekdays
    } else {
      // 周一开始，调整顺序
      return [...weekdays.slice(1), weekdays[0]]
    }
  }

  /**
   * 绑定事件
   */
  protected bindEvents(): void {
    super.bindEvents()
    
    if (!this.container) return
    
    // 月份卡片点击事件
    DOMUtils.addEventListener(this.container, 'click', (e) => {
      const target = e.target as HTMLElement
      const monthCard = DOMUtils.closest(target, '.ldesign-calendar-month-card')
      
      if (monthCard) {
        this.handleMonthCardClick(monthCard, e)
      }
    })
    
    // 月份卡片双击事件
    DOMUtils.addEventListener(this.container, 'dblclick', (e) => {
      const target = e.target as HTMLElement
      const monthCard = DOMUtils.closest(target, '.ldesign-calendar-month-card')
      
      if (monthCard) {
        this.handleMonthCardDoubleClick(monthCard, e)
      }
    })
  }

  /**
   * 处理月份卡片点击
   */
  private handleMonthCardClick(monthCard: HTMLElement, event: MouseEvent): void {
    const dateStr = DOMUtils.getData(monthCard, 'date')
    if (!dateStr) return
    
    const date = DateUtils.dayjs(dateStr)
    
    // 更新选中状态
    this.updateSelectedMonth(date)
    
    this.emit('monthClick', date, monthCard, event)
  }

  /**
   * 处理月份卡片双击
   */
  private handleMonthCardDoubleClick(monthCard: HTMLElement, event: MouseEvent): void {
    const dateStr = DOMUtils.getData(monthCard, 'date')
    if (!dateStr) return
    
    const date = DateUtils.dayjs(dateStr)
    this.emit('monthDoubleClick', date, monthCard, event)
  }

  /**
   * 更新选中月份
   */
  private updateSelectedMonth(selectedMonth: Dayjs): void {
    if (!this.container) return
    
    // 移除之前的选中状态
    const prevSelected = this.container.querySelector('.selected-month')
    if (prevSelected) {
      DOMUtils.removeClass(prevSelected as HTMLElement, 'selected-month')
    }
    
    // 添加新的选中状态
    const monthCards = this.container.querySelectorAll('.ldesign-calendar-month-card')
    monthCards.forEach(card => {
      const dateStr = DOMUtils.getData(card as HTMLElement, 'date')
      if (dateStr) {
        const cardDate = DateUtils.dayjs(dateStr)
        if (DateUtils.isSameMonth(cardDate, selectedMonth)) {
          DOMUtils.addClass(card as HTMLElement, 'selected-month')
        }
      }
    })
    
    this.currentDate = selectedMonth
  }

  /**
   * 获取视图日期范围
   */
  public getDateRange(): { start: Dayjs; end: Dayjs } {
    const start = DateUtils.startOfYear(this.currentDate)
    const end = DateUtils.endOfYear(this.currentDate)
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
   * 上一年
   */
  public prevYear(): void {
    this.currentDate = this.currentDate.subtract(1, 'year')
    this.refresh()
  }

  /**
   * 下一年
   */
  public nextYear(): void {
    this.currentDate = this.currentDate.add(1, 'year')
    this.refresh()
  }

  /**
   * 获取当前年份信息
   */
  public getYearInfo(): {
    year: number
    isLeapYear: boolean
    daysInYear: number
    startDate: Dayjs
    endDate: Dayjs
    months: Dayjs[]
  } {
    const year = this.currentDate.year()
    const isLeapYear = DateUtils.isLeapYear(year)
    const daysInYear = DateUtils.daysInYear(this.currentDate)
    const { start, end } = this.getDateRange()
    const months = DateUtils.getYearViewMonths(this.currentDate)
    
    return {
      year,
      isLeapYear,
      daysInYear,
      startDate: start,
      endDate: end,
      months
    }
  }

  /**
   * 获取指定月份的卡片元素
   */
  public getMonthCardElement(month: Dayjs): HTMLElement | null {
    if (!this.container) return null
    
    const monthCards = this.container.querySelectorAll('.ldesign-calendar-month-card')
    
    for (let i = 0; i < monthCards.length; i++) {
      const card = monthCards[i]
      const dateStr = DOMUtils.getData(card as HTMLElement, 'date')
      if (dateStr) {
        const cardDate = DateUtils.dayjs(dateStr)
        if (DateUtils.isSameMonth(cardDate, month)) {
          return card as HTMLElement
        }
      }
    }
    
    return null
  }

  /**
   * 高亮指定月份
   */
  public highlightMonth(month: Dayjs, className = 'highlighted'): void {
    const cardElement = this.getMonthCardElement(month)
    if (cardElement) {
      DOMUtils.addClass(cardElement, className)
    }
  }

  /**
   * 取消高亮指定月份
   */
  public unhighlightMonth(month: Dayjs, className = 'highlighted'): void {
    const cardElement = this.getMonthCardElement(month)
    if (cardElement) {
      DOMUtils.removeClass(cardElement, className)
    }
  }

  /**
   * 高亮月份范围
   */
  public highlightMonthRange(start: Dayjs, end: Dayjs, className = 'range-highlighted'): void {
    let current = start.startOf('month')
    const endMonth = end.startOf('month')
    
    while (current.isSameOrBefore(endMonth, 'month')) {
      this.highlightMonth(current, className)
      current = current.add(1, 'month')
    }
  }

  /**
   * 取消高亮月份范围
   */
  public unhighlightMonthRange(start: Dayjs, end: Dayjs, className = 'range-highlighted'): void {
    let current = start.startOf('month')
    const endMonth = end.startOf('month')
    
    while (current.isSameOrBefore(endMonth, 'month')) {
      this.unhighlightMonth(current, className)
      current = current.add(1, 'month')
    }
  }

  /**
   * 清除所有高亮
   */
  public clearHighlights(className?: string): void {
    if (!this.container) return
    
    const selector = className ? `.${className}` : '.highlighted, .range-highlighted'
    const highlightedElements = this.container.querySelectorAll(selector)
    
    highlightedElements.forEach(element => {
      if (className) {
        DOMUtils.removeClass(element as HTMLElement, className)
      } else {
        DOMUtils.removeClass(element as HTMLElement, 'highlighted')
        DOMUtils.removeClass(element as HTMLElement, 'range-highlighted')
      }
    })
  }

  /**
   * 滚动到指定月份
   */
  public scrollToMonth(month: Dayjs): void {
    const cardElement = this.getMonthCardElement(month)
    if (cardElement) {
      DOMUtils.scrollToElement(cardElement)
    }
  }

  /**
   * 获取年视图统计信息
   */
  public getStatistics(): {
    totalDays: number
    totalEvents: number
    monthsWithEvents: number
    busyMonths: Array<{ month: Dayjs; eventCount: number }>
    holidays: number
  } {
    const { start, end } = this.getDateRange()
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const events = eventManager.getEventsInRange(start, end)
    
    const totalDays = DateUtils.daysInYear(this.currentDate)
    const months = DateUtils.getYearViewMonths(this.currentDate)
    
    // 按月统计事件
    const monthEventCounts = new Map<string, number>()
    
    events.forEach(event => {
      const eventMonth = DateUtils.dayjs(event.start).format('YYYY-MM')
      const count = monthEventCounts.get(eventMonth) || 0
      monthEventCounts.set(eventMonth, count + 1)
    })
    
    const monthsWithEvents = monthEventCounts.size
    
    // 找出最忙碌的月份
    const busyMonths = months
      .map(month => ({
        month,
        eventCount: monthEventCounts.get(month.format('YYYY-MM')) || 0
      }))
      .filter(item => item.eventCount > 0)
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5) // 取前5个最忙碌的月份
    
    return {
      totalDays,
      totalEvents: events.length,
      monthsWithEvents,
      busyMonths,
      holidays: 0 // 这里可以添加节假日统计逻辑
    }
  }

  /**
   * 获取季度信息
   */
  public getQuarterInfo(): Array<{
    quarter: number
    months: Dayjs[]
    startDate: Dayjs
    endDate: Dayjs
    eventCount: number
  }> {
    const year = this.currentDate.year()
    const quarters = []
    
    for (let q = 1; q <= 4; q++) {
      const startMonth = (q - 1) * 3
      const months = []
      
      for (let m = 0; m < 3; m++) {
        months.push(DateUtils.dayjs().year(year).month(startMonth + m))
      }
      
      const startDate = months[0].startOf('month')
      const endDate = months[2].endOf('month')
      
      // 统计季度事件数量
      const calendar = this.calendar as any
      const eventManager = calendar.getEventManager()
      const quarterEvents = eventManager.getEventsInRange(startDate, endDate)
      
      quarters.push({
        quarter: q,
        months,
        startDate,
        endDate,
        eventCount: quarterEvents.length
      })
    }
    
    return quarters
  }
}
