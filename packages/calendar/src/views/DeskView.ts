/**
 * 台历视图组件
 */

import { DOMUtils } from '../utils/dom'
import { LunarUtils } from '../utils/lunar'
import { DateUtils } from '../utils/date'
import type { CalendarEvent, DateInput } from '../types'
import type { Calendar } from '../core/Calendar'

export class DeskView {
  private container: HTMLElement
  private calendar: Calendar
  private currentDate: Date

  constructor(calendar: Calendar, container: HTMLElement) {
    this.calendar = calendar
    this.container = container
    this.currentDate = new Date()
  }

  /**
   * 渲染台历视图
   */
  public render(date: DateInput): void {
    // 安全地转换DateInput到Date
    if (typeof date === 'string' || typeof date === 'number') {
      this.currentDate = new Date(date)
    } else if (date instanceof Date) {
      this.currentDate = date
    } else {
      // 假设是Dayjs对象
      this.currentDate = (date as any).toDate()
    }
    this.container.innerHTML = ''
    this.container.className = 'ldesign-calendar-desk-view'

    const deskElement = this.createDeskStructure()
    this.container.appendChild(deskElement)
  }

  /**
   * 创建台历结构
   */
  private createDeskStructure(): HTMLElement {
    const desk = DOMUtils.createElement('div', 'ldesign-calendar-desk-container')

    // 创建头部
    const header = this.createHeader()
    desk.appendChild(header)

    // 创建主体
    const body = this.createBody()
    desk.appendChild(body)

    return desk
  }

  /**
   * 创建头部
   */
  private createHeader(): HTMLElement {
    const header = DOMUtils.createElement('div', 'ldesign-calendar-desk-header')
    
    const date = DateUtils.dayjs(this.currentDate)
    
    // 日期数字
    const dateNumber = DOMUtils.createElement('div', 'ldesign-calendar-desk-date')
    dateNumber.textContent = date.format('DD')
    
    // 星期
    const weekday = DOMUtils.createElement('div', 'ldesign-calendar-desk-weekday')
    weekday.textContent = date.format('dddd')
    
    // 年月
    const monthYear = DOMUtils.createElement('div', 'ldesign-calendar-desk-month-year')
    monthYear.textContent = date.format('YYYY年MM月')
    
    header.appendChild(dateNumber)
    header.appendChild(weekday)
    header.appendChild(monthYear)
    
    return header
  }

  /**
   * 创建主体
   */
  private createBody(): HTMLElement {
    const body = DOMUtils.createElement('div', 'ldesign-calendar-desk-body')
    
    // 农历信息区域
    const lunarSection = this.createLunarSection()
    body.appendChild(lunarSection)
    
    // 事件区域
    const eventsSection = this.createEventsSection()
    body.appendChild(eventsSection)
    
    return body
  }

  /**
   * 创建农历信息区域
   */
  private createLunarSection(): HTMLElement {
    const section = DOMUtils.createElement('div', 'ldesign-calendar-desk-lunar-section')
    
    const title = DOMUtils.createElement('h3', 'ldesign-calendar-desk-section-title')
    title.textContent = '农历信息'
    section.appendChild(title)
    
    const lunarInfo = LunarUtils.getLunarInfo(this.currentDate)
    
    // 农历日期
    const lunarDate = DOMUtils.createElement('div', 'ldesign-calendar-desk-lunar-date')
    lunarDate.textContent = `${lunarInfo.month}${lunarInfo.day}`
    section.appendChild(lunarDate)
    
    // 天干地支
    const ganzhi = DOMUtils.createElement('div', 'ldesign-calendar-desk-ganzhi')
    ganzhi.textContent = `${lunarInfo.ganzhi.year}年 ${lunarInfo.ganzhi.month}月 ${lunarInfo.ganzhi.day}日`
    section.appendChild(ganzhi)
    
    // 生肖
    const zodiac = DOMUtils.createElement('div', 'ldesign-calendar-desk-zodiac')
    zodiac.textContent = `生肖：${lunarInfo.zodiac}`
    section.appendChild(zodiac)
    
    // 节气或节日
    if (lunarInfo.term) {
      const term = DOMUtils.createElement('div', 'ldesign-calendar-desk-term')
      term.textContent = `节气：${lunarInfo.term}`
      term.className = 'ldesign-calendar-solar-term'
      section.appendChild(term)
    }
    
    if (lunarInfo.festival) {
      const festival = DOMUtils.createElement('div', 'ldesign-calendar-desk-festival')
      festival.textContent = lunarInfo.festival
      festival.className = 'ldesign-calendar-festival'
      section.appendChild(festival)
    }
    
    // 宜忌
    const suitableAvoid = this.createSuitableAvoidSection(lunarInfo)
    section.appendChild(suitableAvoid)
    
    return section
  }

  /**
   * 创建宜忌区域
   */
  private createSuitableAvoidSection(lunarInfo: any): HTMLElement {
    const container = DOMUtils.createElement('div', 'ldesign-calendar-desk-suitable-avoid')
    
    // 宜
    const suitableDiv = DOMUtils.createElement('div', 'ldesign-calendar-desk-suitable')
    const suitableTitle = DOMUtils.createElement('div', 'ldesign-calendar-desk-suitable-title')
    suitableTitle.textContent = '宜'
    const suitableList = DOMUtils.createElement('div', 'ldesign-calendar-desk-suitable-list')
    suitableList.textContent = lunarInfo.suitable?.join('、') || '无特别宜做之事'
    suitableDiv.appendChild(suitableTitle)
    suitableDiv.appendChild(suitableList)
    
    // 忌
    const avoidDiv = DOMUtils.createElement('div', 'ldesign-calendar-desk-avoid')
    const avoidTitle = DOMUtils.createElement('div', 'ldesign-calendar-desk-avoid-title')
    avoidTitle.textContent = '忌'
    const avoidList = DOMUtils.createElement('div', 'ldesign-calendar-desk-avoid-list')
    avoidList.textContent = lunarInfo.avoid?.join('、') || '无特别忌做之事'
    avoidDiv.appendChild(avoidTitle)
    avoidDiv.appendChild(avoidList)
    
    container.appendChild(suitableDiv)
    container.appendChild(avoidDiv)
    
    return container
  }

  /**
   * 创建事件区域
   */
  private createEventsSection(): HTMLElement {
    const section = DOMUtils.createElement('div', 'ldesign-calendar-desk-events-section')
    
    const title = DOMUtils.createElement('h3', 'ldesign-calendar-desk-section-title')
    title.textContent = '今日日程'
    section.appendChild(title)
    
    // 获取当天的事件
    const events = this.getTodayEvents()
    
    if (events.length === 0) {
      const noEvents = DOMUtils.createElement('div', 'ldesign-calendar-desk-no-events')
      noEvents.textContent = '今日暂无日程安排'
      noEvents.style.color = 'rgba(255, 255, 255, 0.7)'
      noEvents.style.fontStyle = 'italic'
      section.appendChild(noEvents)
    } else {
      events.forEach(event => {
        const eventElement = this.createEventElement(event)
        section.appendChild(eventElement)
      })
    }
    
    return section
  }

  /**
   * 创建事件元素
   */
  private createEventElement(event: CalendarEvent): HTMLElement {
    const eventDiv = DOMUtils.createElement('div', 'ldesign-calendar-desk-event')
    
    const title = DOMUtils.createElement('div', 'ldesign-calendar-desk-event-title')
    title.textContent = event.title
    
    const time = DOMUtils.createElement('div', 'ldesign-calendar-desk-event-time')
    if (event.allDay) {
      time.textContent = '全天'
    } else {
      const startTime = DateUtils.dayjs(event.start).format('HH:mm')
      const endTime = event.end ? DateUtils.dayjs(event.end).format('HH:mm') : ''
      time.textContent = endTime ? `${startTime} - ${endTime}` : startTime
    }
    
    if (event.description) {
      const description = DOMUtils.createElement('div', 'ldesign-calendar-desk-event-description')
      description.textContent = event.description
      description.style.fontSize = '0.8rem'
      description.style.opacity = '0.8'
      description.style.marginTop = '4px'
      eventDiv.appendChild(description)
    }
    
    // 设置事件颜色
    if (event.color) {
      eventDiv.style.borderLeft = `4px solid ${event.color}`
    }
    
    eventDiv.appendChild(title)
    eventDiv.appendChild(time)
    
    return eventDiv
  }

  /**
   * 获取今天的事件
   */
  private getTodayEvents(): CalendarEvent[] {
    const startOfDay = DateUtils.dayjs(this.currentDate).startOf('day').toDate()
    const endOfDay = DateUtils.dayjs(this.currentDate).endOf('day').toDate()
    
    return this.calendar.getEventManager().getEventsInRange(startOfDay, endOfDay)
  }

  /**
   * 更新日期
   */
  public updateDate(date: DateInput): void {
    // 安全地转换DateInput到Date
    if (typeof date === 'string' || typeof date === 'number') {
      this.currentDate = new Date(date)
    } else if (date instanceof Date) {
      this.currentDate = date
    } else {
      // 假设是Dayjs对象
      this.currentDate = (date as any).toDate()
    }
    this.render(date)
  }

  /**
   * 销毁视图
   */
  public destroy(): void {
    this.container.innerHTML = ''
  }
}
