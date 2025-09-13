/**
 * 日历核心类
 * 
 * 这是日历组件的主要入口类，负责：
 * - 初始化日历实例
 * - 管理日历状态
 * - 协调各个子系统（视图、事件、插件、主题等）
 * - 提供公共API接口
 */

import type {
  CalendarConfig,
  CalendarState,
  CalendarViewType,
  ICalendar
} from '../types/calendar'
import type { CalendarEvent } from '../types/event'
import { getMonthViewDates, isInCurrentMonth } from '../utils/date-utils'
import { WeekView } from '../views/week-view'
import { DayView } from '../views/day-view'
import { EventManager } from './event-manager'
import { StateManager } from './state-manager'

/**
 * 日历主类
 */
export class Calendar implements ICalendar {
  private config: CalendarConfig
  private container: HTMLElement
  private destroyed = false

  /** 事件管理器 */
  private eventManager: EventManager

  /** 状态管理器 */
  private stateManager: StateManager

  /** 周视图实例 */
  private weekView: WeekView | null = null

  /** 日视图实例 */
  private dayView: DayView | null = null

  /**
   * 构造函数
   * @param containerOrConfig 容器元素或日历配置
   * @param config 可选的日历配置（当第一个参数是容器时）
   */
  constructor(containerOrConfig: HTMLElement | CalendarConfig, config?: Partial<CalendarConfig>) {
    // 处理参数
    if (containerOrConfig instanceof HTMLElement) {
      // 第一个参数是容器元素
      this.config = { ...this.getDefaultConfig(), container: containerOrConfig, ...config }
    } else {
      // 第一个参数是配置对象
      this.config = { ...this.getDefaultConfig(), ...containerOrConfig }
    }

    // 验证容器
    if (!this.config.container) {
      throw new Error('Container element is required')
    }

    // 获取容器元素
    this.container = this.resolveContainer(this.config.container)

    // 初始化状态管理器
    this.stateManager = new StateManager(this.getInitialState())

    // 初始化事件管理器
    this.eventManager = new EventManager()

    // 初始化日历
    this.init()
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Partial<CalendarConfig> {
    return {
      view: 'month',
      date: new Date(),
      locale: 'zh-CN',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekStartsOn: 1, // 周一开始
      showLunar: false,
      showHolidays: true,
      draggable: true,
      keyboardNavigation: true,
      responsive: true,
      theme: 'default',
      plugins: [],
      viewConfig: {},
      eventConfig: {
        allowOverlap: true,
        maxOverlapLayers: 3,
        minEventHeight: 30,
        defaultDuration: 60,
        timeStep: 15,
        showTime: true,
        timeFormat: 'HH:mm',
      },
      performance: {
        virtualScroll: false,
        virtualScrollBuffer: 10,
        lazyLoad: true,
        debounceDelay: 300,
        throttleDelay: 100,
        memoryOptimization: true,
      },
    }
  }

  /**
   * 获取初始状态
   */
  private getInitialState(): CalendarState {
    return {
      currentView: this.config.view || 'month',
      currentDate: new Date(this.config.date || new Date()),
      selectedDate: null,
      selectedRange: null,
      events: [],
      loading: false,
      error: null,
      dragging: false,
      draggingEvent: null,
    }
  }

  /**
   * 解析容器元素
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`找不到容器元素: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  /**
   * 初始化日历
   */
  init(): void {
    // 设置容器类名
    this.container.classList.add('ldesign-calendar')

    // 初始化各个子系统
    this.initializeSubsystems()

    // 渲染初始视图
    this.render()

    // 绑定事件监听器
    this.bindEventListeners()
  }

  /**
   * 初始化子系统
   */
  private initializeSubsystems(): void {
    // 绑定事件管理器监听器
    this.eventManager.on('eventCreated', (event: CalendarEvent) => {
      this.stateManager.addEvent(event)
      this.config.onEventCreate?.(event)
    })

    this.eventManager.on('eventUpdated', (event: CalendarEvent) => {
      this.stateManager.updateEvent(event.id, event)
      this.config.onEventUpdate?.(event)
    })

    this.eventManager.on('eventDeleted', (event: CalendarEvent) => {
      this.stateManager.removeEvent(event.id)
      this.config.onEventDelete?.(event.id)
    })

    // 绑定状态管理器监听器
    this.stateManager.on('stateChanged', () => {
      this.render()
    })

    this.stateManager.on('currentViewChanged', (view: CalendarViewType) => {
      this.config.onViewChange?.(view, this.stateManager.getCurrentDate())
    })

    this.stateManager.on('loadingChanged', (loading: boolean) => {
      this.config.onLoadingChange?.(loading)
    })

    this.stateManager.on('error', (error: string) => {
      this.config.onError?.(new Error(error))
    })

    // TODO: 初始化视图管理器
    // TODO: 初始化插件管理器
    // TODO: 初始化主题管理器
  }

  /**
   * 渲染日历
   */
  private render(): void {
    console.log('render() 被调用，容器子元素数量:', this.container.children.length)
    // 如果是第一次渲染，创建完整结构
    if (this.container.children.length === 0) {
      console.log('第一次渲染，调用 renderInitial()')
      this.renderInitial()
    } else {
      console.log('更新渲染，调用 updateContent()')
      // 只更新内容，不重新创建结构
      this.updateContent()
    }
  }

  /**
   * 初始渲染
   */
  private renderInitial(): void {
    // 清空容器
    this.container.innerHTML = ''

    // 创建日历结构
    const calendarWrapper = document.createElement('div')
    calendarWrapper.className = 'ldesign-calendar-wrapper'

    // 创建头部
    const header = this.createHeader()
    calendarWrapper.appendChild(header)

    // 创建主体内容
    const body = this.createBody()
    calendarWrapper.appendChild(body)

    // 添加到容器
    this.container.appendChild(calendarWrapper)
  }

  /**
   * 更新内容
   */
  private updateContent(): void {
    console.log('updateContent() 被调用')
    // 对于所有视图，都重新渲染主体以确保一致性
    const wrapper = this.container.querySelector('.ldesign-calendar-wrapper')
    if (wrapper) {
      console.log('找到wrapper元素')
      const oldBody = wrapper.querySelector('.ldesign-calendar-body')
      if (oldBody) {
        console.log('找到oldBody元素，准备创建新的body')
        const newBody = this.createBody()
        wrapper.replaceChild(newBody, oldBody)
        console.log('body替换完成')
      } else {
        console.log('未找到oldBody元素')
      }
    } else {
      console.log('未找到wrapper元素')
    }
  }

  /**
   * 创建日历头部
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div')
    header.className = 'ldesign-calendar-header'

    // 创建导航按钮
    const prevBtn = document.createElement('button')
    prevBtn.className = 'ldesign-calendar-nav-btn ldesign-calendar-prev'
    prevBtn.textContent = '‹'
    prevBtn.onclick = () => this.prev()

    const nextBtn = document.createElement('button')
    nextBtn.className = 'ldesign-calendar-nav-btn ldesign-calendar-next'
    nextBtn.textContent = '›'
    nextBtn.onclick = () => this.next()

    // 创建标题
    const title = document.createElement('div')
    title.className = 'ldesign-calendar-title'
    title.textContent = this.getTitle()

    header.appendChild(prevBtn)
    header.appendChild(title)
    header.appendChild(nextBtn)

    return header
  }

  /**
   * 创建日历主体
   */
  private createBody(): HTMLElement {
    const body = document.createElement('div')
    body.className = 'ldesign-calendar-body'

    // 根据当前视图创建内容
    const currentView = this.stateManager.getCurrentView()
    console.log('createBody() - 当前视图:', currentView)
    if (currentView === 'month') {
      console.log('createBody() - 创建月视图')
      body.appendChild(this.createMonthView())
    } else if (currentView === 'week') {
      console.log('createBody() - 创建周视图')
      body.appendChild(this.createWeekView())
    } else if (currentView === 'day') {
      console.log('createBody() - 创建日视图')
      body.appendChild(this.createDayView())
    }

    return body
  }

  /**
   * 创建月视图
   */
  private createMonthView(): HTMLElement {
    const monthView = document.createElement('div')
    monthView.className = 'ldesign-calendar-month-view'

    // 创建星期标题
    const weekHeader = document.createElement('div')
    weekHeader.className = 'ldesign-calendar-week-header'

    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    weekdays.forEach(day => {
      const dayHeader = document.createElement('div')
      dayHeader.className = 'ldesign-calendar-weekday'
      dayHeader.textContent = day
      weekHeader.appendChild(dayHeader)
    })

    monthView.appendChild(weekHeader)

    // 创建日期网格
    const dateGrid = document.createElement('div')
    dateGrid.className = 'ldesign-calendar-date-grid'

    // 获取当前月份的日期信息
    const currentDate = this.stateManager.getCurrentDate()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // 获取第一天是星期几
    const firstDayOfWeek = firstDay.getDay()

    // 添加上个月的日期（如果需要）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      const dayCell = this.createDayCell(prevDate, true)
      dateGrid.appendChild(dayCell)
    }

    // 添加当月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dayCell = this.createDayCell(date, false)
      dateGrid.appendChild(dayCell)
    }

    // 添加下个月的日期（填满6行）
    const totalCells = dateGrid.children.length
    const remainingCells = 42 - totalCells // 6行 * 7列
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(year, month + 1, day)
      const dayCell = this.createDayCell(nextDate, true)
      dateGrid.appendChild(dayCell)
    }

    monthView.appendChild(dateGrid)

    return monthView
  }

  /**
   * 创建日期单元格
   */
  private createDayCell(date: Date, isOtherMonth: boolean): HTMLElement {
    const dayCell = document.createElement('div')
    dayCell.className = `ldesign-calendar-day-cell ${isOtherMonth ? 'other-month' : ''}`

    // 添加日期数字
    const dayNumber = document.createElement('div')
    dayNumber.className = 'ldesign-calendar-day-number'
    dayNumber.textContent = date.getDate().toString()
    dayCell.appendChild(dayNumber)

    // 检查是否是今天
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      dayCell.classList.add('today')
    }

    // 获取该日期的事件并显示
    const dayEvents = this.getEventsForDate(date)
    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement('div')
      eventsContainer.className = 'ldesign-calendar-day-events'

      // 最多显示3个事件，超出的显示"更多"
      const maxDisplayEvents = 3
      const displayEvents = dayEvents.slice(0, maxDisplayEvents)

      displayEvents.forEach(event => {
        const eventElement = this.createEventElement(event)
        eventsContainer.appendChild(eventElement)
      })

      // 如果有更多事件，显示"更多"提示
      if (dayEvents.length > maxDisplayEvents) {
        const moreElement = document.createElement('div')
        moreElement.className = 'ldesign-calendar-event-more'
        moreElement.textContent = `+${dayEvents.length - maxDisplayEvents}更多`
        eventsContainer.appendChild(moreElement)
      }

      dayCell.appendChild(eventsContainer)
    }

    // 添加点击事件
    dayCell.onclick = (e) => {
      // 如果点击的是事件，不触发日期选择
      if ((e.target as HTMLElement).closest('.ldesign-calendar-event')) {
        return
      }
      this.config.onDateSelect?.(date)
    }

    return dayCell
  }

  /**
   * 获取指定日期的事件
   */
  private getEventsForDate(date: Date): CalendarEvent[] {
    return this.stateManager.getEvents().filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  /**
   * 创建事件元素
   */
  private createEventElement(event: CalendarEvent): HTMLElement {
    const eventElement = document.createElement('div')
    eventElement.className = 'ldesign-calendar-event'

    // 设置事件颜色
    if (event.color) {
      eventElement.style.backgroundColor = event.color
      eventElement.style.borderColor = event.color
    }

    // 创建事件标题
    const eventTitle = document.createElement('span')
    eventTitle.className = 'ldesign-calendar-event-title'
    eventTitle.textContent = event.title
    eventElement.appendChild(eventTitle)

    // 如果不是全天事件，显示时间
    if (!event.allDay) {
      const eventTime = document.createElement('span')
      eventTime.className = 'ldesign-calendar-event-time'
      const startTime = new Date(event.start).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
      eventTime.textContent = startTime
      eventElement.appendChild(eventTime)
    }

    // 添加点击事件
    eventElement.onclick = (e) => {
      e.stopPropagation()
      this.config.onEventClick?.(event)
    }

    return eventElement
  }

  /**
   * 获取月视图需要显示的所有日期
   */
  private getMonthViewDates(date: Date): Date[] {
    return getMonthViewDates(date, 0) // 周日开始
  }

  /**
   * 判断日期是否在当前月份
   */
  private isInCurrentMonth(date: Date, referenceDate: Date): boolean {
    return isInCurrentMonth(date, referenceDate)
  }

  /**
   * 创建周视图
   */
  private createWeekView(): HTMLElement {
    console.log('createWeekView() 被调用')
    // 创建周视图容器
    const weekViewContainer = document.createElement('div')
    weekViewContainer.className = 'ldesign-calendar-week-view'

    // 创建或重用WeekView实例
    if (!this.weekView) {
      console.log('创建新的WeekView实例')
      this.weekView = new WeekView({
        enabled: true,
        displayName: '周视图',
        options: {
          firstDay: 0, // 周日开始
          showWeekends: true,
          startTime: '00:00',
          endTime: '23:59',
          timeStep: 60
        }
      })

      // 只在第一次创建时初始化
      const context = {
        calendar: this,
        viewType: 'week' as const,
        currentDate: this.stateManager.getCurrentDate(),
        dateRange: this.weekView.getDateRange(),
        events: this.stateManager.getEvents(),
        config: this.weekView.config,
        container: weekViewContainer
      }

      console.log('调用 weekView.init()')
      this.weekView.init(context)
    } else {
      console.log('重用现有的WeekView实例')
      // 重用时更新容器和事件数据
      this.weekView.setContainer(weekViewContainer)

      // 更新上下文中的其他数据
      const context = this.weekView.getContext()
      if (context) {
        context.events = this.stateManager.getEvents()
        context.currentDate = this.stateManager.getCurrentDate()
      }

      // 更新事件数据（setContainer已经会重新渲染，所以不需要再调用update）
      // this.weekView.update(this.stateManager.getEvents())
    }

    // 设置当前日期（但不重新渲染，因为setContainer或init已经渲染过了）
    this.weekView.currentWeek = new Date(this.stateManager.getCurrentDate())

    return weekViewContainer
  }

  /**
   * 创建日视图
   */
  private createDayView(): HTMLElement {
    console.log('createDayView() 被调用')
    // 创建日视图容器
    const dayViewContainer = document.createElement('div')
    dayViewContainer.className = 'ldesign-calendar-day-view'

    // 创建或重用DayView实例
    if (!this.dayView) {
      console.log('创建新的DayView实例')
      this.dayView = new DayView({
        enabled: true,
        displayName: '日视图',
        options: {
          startTime: '00:00',
          endTime: '23:59',
          timeStep: 15
        }
      })

      // 只在第一次创建时初始化
      const context = {
        calendar: this,
        viewType: 'day' as const,
        currentDate: this.stateManager.getCurrentDate(),
        dateRange: this.dayView.getDateRange(),
        events: this.stateManager.getEvents(),
        config: this.dayView.config,
        container: dayViewContainer
      }

      console.log('调用 dayView.init()')
      this.dayView.init(context)
    } else {
      console.log('重用现有的DayView实例')
      // 重用时更新容器和事件数据
      this.dayView.setContainer(dayViewContainer)

      // 更新上下文中的其他数据
      const context = this.dayView.getContext()
      if (context) {
        context.events = this.stateManager.getEvents()
        context.currentDate = this.stateManager.getCurrentDate()
      }
    }

    // 设置当前日期
    this.dayView.goToDate(this.stateManager.getCurrentDate())

    return dayViewContainer
  }

  /**
   * 获取当前标题
   */
  private getTitle(): string {
    const date = this.stateManager.getCurrentDate()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const currentView = this.stateManager.getCurrentView()

    if (currentView === 'month') {
      return `${year}年${month}月`
    } else if (currentView === 'week') {
      return `${year}年第${this.getWeekNumber(date)}周`
    } else {
      return `${year}年${month}月${date.getDate()}日`
    }
  }

  /**
   * 获取周数
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  /**
   * 绑定事件监听器
   */
  private bindEventListeners(): void {
    // TODO: 绑定键盘事件
    // TODO: 绑定鼠标事件
    // TODO: 绑定触摸事件
    // TODO: 绑定窗口大小变化事件
  }

  /**
   * 获取当前配置
   */
  getConfig(): CalendarConfig {
    return { ...this.config }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取当前视图
   */
  getCurrentView(): CalendarViewType {
    return this.stateManager.getCurrentView()
  }

  /**
   * 获取当前日期
   */
  getCurrentDate(): Date {
    return this.stateManager.getCurrentDate()
  }

  /**
   * 设置视图
   */
  setView(view: CalendarViewType): void {
    if (!['month', 'week', 'day'].includes(view)) {
      console.warn(`Invalid view type: ${view}`)
      return
    }
    this.switchView(view)
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CalendarConfig>): void {
    this.config = { ...this.config, ...config }
    // TODO: 重新初始化受影响的子系统
    this.render()
  }

  /**
   * 获取当前状态
   */
  getState(): CalendarState {
    return this.stateManager.getState()
  }

  /**
   * 切换视图
   */
  switchView(view: CalendarViewType): void {
    if (this.stateManager.getCurrentView() === view) return

    this.stateManager.setCurrentView(view)
  }

  /**
   * 跳转到指定日期
   */
  goToDate(date: Date | string): void {
    const targetDate = typeof date === 'string' ? new Date(date) : date
    this.stateManager.setCurrentDate(targetDate)
  }

  /**
   * 跳转到今天
   */
  goToToday(): void {
    this.goToDate(new Date())
  }

  /**
   * 切换视图
   */
  changeView(view: CalendarViewType): void {
    console.log('changeView() 被调用，切换到视图:', view)
    this.stateManager.setCurrentView(view)
    console.log('changeView() 调用完成')
  }

  /**
   * 设置主题
   */
  setTheme(theme: string): void {
    // TODO: 实现主题切换逻辑
    console.log('切换主题:', theme)

    // 移除旧的主题类
    this.container.classList.remove('ldesign-calendar-theme-default', 'ldesign-calendar-theme-dark')

    // 添加新的主题类
    this.container.classList.add(`ldesign-calendar-theme-${theme}`)
  }

  /**
   * 上一页
   */
  prev(): void {
    const currentDate = new Date(this.stateManager.getCurrentDate())
    const currentView = this.stateManager.getCurrentView()

    switch (currentView) {
      case 'month':
        currentDate.setMonth(currentDate.getMonth() - 1)
        break
      case 'week':
        currentDate.setDate(currentDate.getDate() - 7)
        break
      case 'day':
        currentDate.setDate(currentDate.getDate() - 1)
        break
    }

    this.goToDate(currentDate)
  }

  /**
   * 下一页
   */
  next(): void {
    const currentDate = new Date(this.stateManager.getCurrentDate())
    const currentView = this.stateManager.getCurrentView()

    switch (currentView) {
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1)
        break
    }

    this.goToDate(currentDate)
  }

  /**
   * 添加事件（完整版本）
   */
  async addEventFull(event: Partial<CalendarEvent>): Promise<string> {
    const result = await this.eventManager.createEvent({
      title: event.title || '未命名事件',
      start: event.start || new Date(),
      end: event.end,
      allDay: event.allDay,
      description: event.description,
      type: event.type,
      color: event.color,
      location: event.location,
      recurrence: event.recurrence,
      customData: event.customData,
    })

    if (!result.success) {
      throw new Error(result.error || '添加事件失败')
    }

    return result.event!.id
  }

  /**
   * 更新事件（完整版本）
   */
  async updateEventFull(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const result = await this.eventManager.updateEventFull(eventId, updates)

    if (!result.success) {
      throw new Error(result.error || '更新事件失败')
    }
  }

  /**
   * 删除事件（完整版本）
   */
  async removeEventFull(eventId: string): Promise<void> {
    const result = await this.eventManager.deleteEvent(eventId)

    if (!result.success) {
      throw new Error(result.error || '删除事件失败')
    }
  }

  /**
   * 获取事件
   */
  getEvent(eventId: string): CalendarEvent | null {
    return this.eventManager.getEvent(eventId)
  }

  /**
   * 获取所有事件
   */
  getEvents(): CalendarEvent[] {
    return this.eventManager.getEvents()
  }

  // ========== 简化的事件管理方法（为了兼容测试） ==========

  /**
   * 添加事件（简化版本）
   * @param event 事件数据
   */
  addEvent(event: CalendarEvent): void {
    this.eventManager.addEvent(event)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())
  }

  /**
   * 更新事件（简化版本）
   * @param event 事件数据
   */
  updateEvent(event: CalendarEvent): void {
    this.eventManager.updateEvent(event)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())
  }

  /**
   * 删除事件（简化版本）
   * @param eventId 事件ID
   */
  removeEvent(eventId: string): void {
    this.eventManager.removeEvent(eventId)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())
  }

  /**
   * 根据日期范围获取事件
   */
  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.eventManager.getEventsByDateRange(startDate, endDate)
  }

  /**
   * 事件监听器
   */
  on(event: string, listener: Function): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 刷新视图
   */
  refresh(): void {
    this.render()
  }

  /**
   * 调整大小
   */
  resize(): void {
    this.render()
  }



  /**
   * 跳转到今天
   */
  today(): void {
    this.stateManager.setCurrentDate(new Date())
  }

  /**
   * 获取指定日期范围的事件
   */
  getEventsInRange(start: Date, end: Date): CalendarEvent[] {
    const result = this.eventManager.queryEvents({ start, end })
    return result.events
  }



  /**
   * 销毁日历实例
   */
  destroy(): void {
    if (this.destroyed) return

    // 销毁视图
    if (this.weekView) {
      this.weekView.destroy()
      this.weekView = null
    }

    if (this.dayView) {
      this.dayView.destroy()
      this.dayView = null
    }

    // 清理事件管理器
    this.eventManager.clearEvents()
    this.eventManager.removeAllListeners()

    // 清理状态管理器
    this.stateManager.removeAllListeners()

    // 清理DOM
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-calendar')

    this.destroyed = true
  }
}
