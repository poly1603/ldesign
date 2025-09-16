/**
 * 月视图组件
 */

import type { Dayjs } from 'dayjs'
import type { ViewType } from '../types'
import { BaseView } from './BaseView'
import { DOMUtils } from '../utils/dom'
import { DateUtils } from '../utils/date'

/**
 * 月视图类
 */
export class MonthView extends BaseView {
  protected viewType: ViewType = 'month'

  /**
   * 创建视图结构
   */
  protected createViewStructure(): HTMLElement {
    const monthView = DOMUtils.createElement('div', 'ldesign-calendar-month-view')

    // 创建表格结构
    const table = DOMUtils.createElement('table', 'ldesign-calendar-month-table')
    
    // 创建表头（星期）
    const thead = this.createTableHeader()
    DOMUtils.appendChild(table, thead)
    
    // 创建表体（日期）
    const tbody = this.createTableBody()
    DOMUtils.appendChild(table, tbody)
    
    DOMUtils.appendChild(monthView, table)
    
    return monthView
  }

  /**
   * 创建表头
   */
  private createTableHeader(): HTMLElement {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const i18nManager = calendar.getI18nManager()
    
    const thead = DOMUtils.createElement('thead', 'ldesign-calendar-month-header')
    const tr = DOMUtils.createElement('tr')
    
    // 获取星期名称
    const weekdayNames = i18nManager.getWeekdayNames('short')
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    // 根据每周起始日调整星期顺序
    const orderedWeekdays = this.getOrderedWeekdays(weekdayNames, firstDayOfWeek)
    
    // 如果显示周数，添加周数列
    if (configManager.get('showWeekNumbers')) {
      const weekNumberTh = DOMUtils.createElement('th', 'ldesign-calendar-week-number-header')
      DOMUtils.setTextContent(weekNumberTh, '周')
      DOMUtils.appendChild(tr, weekNumberTh)
    }
    
    // 添加星期列
    orderedWeekdays.forEach((weekday, index) => {
      const th = DOMUtils.createElement('th', 'ldesign-calendar-weekday-header')
      DOMUtils.setTextContent(th, weekday)
      
      // 添加周末样式
      const dayIndex = (firstDayOfWeek + index) % 7
      if (dayIndex === 0 || dayIndex === 6) {
        DOMUtils.addClass(th, 'weekend')
      }
      
      DOMUtils.appendChild(tr, th)
    })
    
    DOMUtils.appendChild(thead, tr)
    return thead
  }

  /**
   * 创建表体
   */
  private createTableBody(): HTMLElement {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    
    const tbody = DOMUtils.createElement('tbody', 'ldesign-calendar-month-body')
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    // 获取月视图的所有日期
    const dates = DateUtils.getMonthViewDates(this.currentDate, firstDayOfWeek)
    
    // 按周分组
    const weeks = this.groupDatesByWeek(dates)
    
    weeks.forEach((week, weekIndex) => {
      const tr = DOMUtils.createElement('tr', 'ldesign-calendar-week-row')
      DOMUtils.setData(tr, 'week', weekIndex.toString())
      
      // 如果显示周数，添加周数单元格
      if (configManager.get('showWeekNumbers')) {
        const weekNumberTd = this.createWeekNumberCell(week[0])
        DOMUtils.appendChild(tr, weekNumberTd)
      }
      
      // 添加日期单元格
      week.forEach(date => {
        const td = this.createDateCellElement(date)
        DOMUtils.appendChild(tr, td)
      })
      
      DOMUtils.appendChild(tbody, tr)
    })
    
    return tbody
  }

  /**
   * 创建日期单元格元素
   */
  private createDateCellElement(date: Dayjs): HTMLElement {
    const dateCell = this.createDateCell(date)
    const td = DOMUtils.createElement('td', 'ldesign-calendar-date-cell')
    
    // 添加日期元素
    const dateElement = this.createDateElement(dateCell)
    DOMUtils.appendChild(td, dateElement)
    
    return td
  }

  /**
   * 创建周数单元格
   */
  private createWeekNumberCell(date: Dayjs): HTMLElement {
    const td = DOMUtils.createElement('td', 'ldesign-calendar-week-number-cell')
    const weekNumber = DateUtils.getWeekOfYear(date)
    DOMUtils.setTextContent(td, weekNumber.toString())
    return td
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
   * 按周分组日期
   */
  private groupDatesByWeek(dates: Dayjs[]): Dayjs[][] {
    const weeks: Dayjs[][] = []
    
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7))
    }
    
    return weeks
  }

  /**
   * 获取视图日期范围
   */
  public getDateRange(): { start: Dayjs; end: Dayjs } {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    const monthStart = DateUtils.startOfMonth(this.currentDate)
    const monthEnd = DateUtils.endOfMonth(this.currentDate)
    const viewStart = DateUtils.startOfWeek(monthStart, firstDayOfWeek)
    const viewEnd = DateUtils.endOfWeek(monthEnd, firstDayOfWeek)
    
    return { start: viewStart, end: viewEnd }
  }

  /**
   * 跳转到指定日期
   */
  public goToDate(date: Dayjs): void {
    this.currentDate = date
    this.refresh()
  }

  /**
   * 上一月
   */
  public prevMonth(): void {
    this.currentDate = this.currentDate.subtract(1, 'month')
    this.refresh()
  }

  /**
   * 下一月
   */
  public nextMonth(): void {
    this.currentDate = this.currentDate.add(1, 'month')
    this.refresh()
  }

  /**
   * 获取当前月份信息
   */
  public getMonthInfo(): {
    year: number
    month: number
    monthName: string
    daysInMonth: number
    firstDay: Dayjs
    lastDay: Dayjs
  } {
    const calendar = this.calendar as any
    const i18nManager = calendar.getI18nManager()
    
    const year = this.currentDate.year()
    const month = this.currentDate.month() + 1
    const monthNames = i18nManager.getMonthNames('long')
    const monthName = monthNames[this.currentDate.month()]
    const daysInMonth = DateUtils.daysInMonth(this.currentDate)
    const firstDay = DateUtils.startOfMonth(this.currentDate)
    const lastDay = DateUtils.endOfMonth(this.currentDate)
    
    return {
      year,
      month,
      monthName,
      daysInMonth,
      firstDay,
      lastDay
    }
  }

  /**
   * 获取月视图的所有日期
   */
  public getAllDates(): Dayjs[] {
    const calendar = this.calendar as any
    const configManager = calendar.getConfigManager()
    const firstDayOfWeek = configManager.get('firstDayOfWeek')
    
    return DateUtils.getMonthViewDates(this.currentDate, firstDayOfWeek)
  }

  /**
   * 获取当前月的日期
   */
  public getCurrentMonthDates(): Dayjs[] {
    return DateUtils.getDatesInMonth(this.currentDate)
  }

  /**
   * 检查日期是否在当前月
   */
  public isDateInCurrentMonth(date: Dayjs): boolean {
    return DateUtils.isSameMonth(date, this.currentDate)
  }

  /**
   * 获取指定日期的单元格元素
   */
  public getDateCellElement(date: Dayjs): HTMLElement | null {
    if (!this.container) return null
    
    const dateStr = date.format('YYYY-MM-DD')
    return this.container.querySelector(`[data-date="${dateStr}"]`)
  }

  /**
   * 高亮指定日期
   */
  public highlightDate(date: Dayjs, className = 'highlighted'): void {
    const cellElement = this.getDateCellElement(date)
    if (cellElement) {
      DOMUtils.addClass(cellElement, className)
    }
  }

  /**
   * 取消高亮指定日期
   */
  public unhighlightDate(date: Dayjs, className = 'highlighted'): void {
    const cellElement = this.getDateCellElement(date)
    if (cellElement) {
      DOMUtils.removeClass(cellElement, className)
    }
  }

  /**
   * 高亮日期范围
   */
  public highlightDateRange(start: Dayjs, end: Dayjs, className = 'range-highlighted'): void {
    const dates = DateUtils.getDatesBetween(start, end)
    dates.forEach(date => {
      this.highlightDate(date, className)
    })
  }

  /**
   * 取消高亮日期范围
   */
  public unhighlightDateRange(start: Dayjs, end: Dayjs, className = 'range-highlighted'): void {
    const dates = DateUtils.getDatesBetween(start, end)
    dates.forEach(date => {
      this.unhighlightDate(date, className)
    })
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
   * 滚动到指定日期
   */
  public scrollToDate(date: Dayjs): void {
    const cellElement = this.getDateCellElement(date)
    if (cellElement) {
      DOMUtils.scrollToElement(cellElement)
    }
  }

  /**
   * 获取可见的日期范围
   */
  public getVisibleDateRange(): { start: Dayjs; end: Dayjs } {
    return this.getDateRange()
  }

  /**
   * 检查日期是否可见
   */
  public isDateVisible(date: Dayjs): boolean {
    const { start, end } = this.getVisibleDateRange()
    return DateUtils.isInRange(date, start, end)
  }

  /**
   * 获取月视图统计信息
   */
  public getStatistics(): {
    totalDays: number
    currentMonthDays: number
    prevMonthDays: number
    nextMonthDays: number
    weekends: number
    holidays: number
    events: number
  } {
    const allDates = this.getAllDates()
    const currentMonthDates = this.getCurrentMonthDates()
    
    const calendar = this.calendar as any
    const eventManager = calendar.getEventManager()
    const { start, end } = this.getDateRange()
    const events = eventManager.getEventsInRange(start, end)
    
    let weekends = 0
    let holidays = 0
    
    allDates.forEach(date => {
      if (DateUtils.isWeekend(date)) weekends++
      // 这里可以添加节假日检查逻辑
    })
    
    return {
      totalDays: allDates.length,
      currentMonthDays: currentMonthDates.length,
      prevMonthDays: allDates.filter(date => date.isBefore(currentMonthDates[0], 'day')).length,
      nextMonthDays: allDates.filter(date => date.isAfter(currentMonthDates[currentMonthDates.length - 1], 'day')).length,
      weekends,
      holidays,
      events: events.length
    }
  }
}
