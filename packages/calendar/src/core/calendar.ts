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
import { MonthView } from '../views/month-view'
import { WeekView } from '../views/week-view'
import { DayView } from '../views/day-view'
import { EventManager } from './event-manager'
import { StateManager } from './state-manager'
import { ContextMenuManager, type ContextMenuConfig } from './context-menu-manager'
import { DragDropManager, type DragDropConfig } from './drag-drop-manager'
import { KeyboardManager, type KeyboardConfig } from './keyboard-manager'

/**
 * 日历主类
 */
export class Calendar implements ICalendar {
  private config: CalendarConfig
  private container: HTMLElement
  private destroyed = false
  private isRendering = false
  private isInitializing = false
  private renderTimeout: NodeJS.Timeout | null = null
  private renderCount = 0
  private lastRenderTime = 0

  /** 事件管理器 */
  private eventManager: EventManager

  /** 状态管理器 */
  private stateManager: StateManager

  /** 右键菜单管理器 */
  private contextMenuManager: ContextMenuManager

  /** 拖拽管理器 */
  private dragDropManager: DragDropManager

  /** 键盘管理器 */
  private keyboardManager: KeyboardManager

  /** 月视图实例 */
  private monthView: MonthView | null = null

  /** 周视图实例 */
  private weekView: WeekView | null = null

  /** 日视图实例 */
  private dayView: DayView | null = null

  /** 当前视图实例 */
  public currentView: MonthView | WeekView | DayView | null = null

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

    // 初始化交互管理器
    this.initializeInteractionManagers()

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
    this.isInitializing = true

    // 设置容器类名
    this.container.classList.add('ldesign-calendar')

    // 初始化各个子系统
    this.initializeSubsystems()

    // 渲染初始视图
    this.render()

    // 绑定事件监听器
    this.bindEventListeners()

    this.isInitializing = false
  }

  /**
   * 初始化交互管理器
   */
  private initializeInteractionManagers(): void {
    // 初始化右键菜单管理器
    this.contextMenuManager = new ContextMenuManager({
      enabled: this.config.contextMenu !== false,
      ...this.config.contextMenu
    })

    // 初始化拖拽管理器
    this.dragDropManager = new DragDropManager({
      enabled: this.config.draggable !== false,
      allowMove: this.config.draggable !== false,
      allowResize: this.config.resizable !== false,
      ...this.config.dragDrop
    })

    // 初始化键盘管理器
    this.keyboardManager = new KeyboardManager({
      enabled: this.config.keyboardNavigation !== false,
      ...this.config.keyboard
    })

    // 绑定交互管理器事件
    this.bindInteractionEvents()
  }

  /**
   * 绑定交互管理器事件
   */
  private bindInteractionEvents(): void {
    // 转发右键菜单显示/隐藏事件
    this.contextMenuManager.on('menuShow', (data) => {
      this.eventManager.emit('menuShow', data)
    })

    this.contextMenuManager.on('menuHide', () => {
      this.eventManager.emit('menuHide')
    })

    // 右键菜单事件
    this.contextMenuManager.on('addEvent', (context) => {
      this.config.onDateClick?.(context.date!)
    })

    this.contextMenuManager.on('editEvent', (context) => {
      this.config.onEventClick?.(context.event!)
    })

    this.contextMenuManager.on('deleteEvent', (context) => {
      if (context.event) {
        this.removeEvent(context.event.id)
      }
    })

    this.contextMenuManager.on('duplicateEvent', (context) => {
      if (context.event) {
        const duplicatedEvent = {
          ...context.event,
          id: Date.now().toString(),
          title: `${context.event.title} (副本)`
        }
        this.addEvent(duplicatedEvent)
      }
    })

    this.contextMenuManager.on('goToToday', () => {
      this.today()
    })

    // 拖拽事件
    this.dragDropManager.on('dragEnd', (dragContext) => {
      if (dragContext.targetTime && dragContext.event) {
        const updatedEvent = {
          ...dragContext.event,
          start: dragContext.targetTime.start,
          end: dragContext.targetTime.end
        }
        this.updateEvent(updatedEvent)
      }
    })

    // 键盘事件
    this.keyboardManager.on('goToToday', () => this.today())
    this.keyboardManager.on('previousPeriod', () => this.prev())
    this.keyboardManager.on('nextPeriod', () => this.next())
    this.keyboardManager.on('setView', (view) => this.setView(view))
    this.keyboardManager.on('newEvent', () => {
      // 转发键盘快捷键事件到Vue组件
      this.eventManager.emit('shortcutTriggered', { action: 'addEvent' })
      // 同时也调用原有的回调
      const today = new Date()
      this.config.onDateClick?.(today)
    })

    // 转发其他键盘事件
    this.keyboardManager.on('editEvent', () => {
      this.eventManager.emit('shortcutTriggered', { action: 'editEvent' })
    })

    this.keyboardManager.on('deleteEvent', () => {
      this.eventManager.emit('shortcutTriggered', { action: 'deleteEvent' })
    })

    this.keyboardManager.on('duplicateEvent', () => {
      this.eventManager.emit('shortcutTriggered', { action: 'duplicateEvent' })
    })

    this.keyboardManager.on('escape', () => {
      this.eventManager.emit('shortcutTriggered', { action: 'escape' })
    })

    this.keyboardManager.on('refresh', () => {
      this.eventManager.emit('shortcutTriggered', { action: 'refresh' })
    })
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

    // 绑定状态管理器监听器 - 移除自动渲染以防止无限循环
    // 注意：不再自动监听 stateChanged 事件来触发渲染，改为手动控制渲染时机

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
  render(): void {
    // 检查是否已销毁
    if (this.destroyed) {
      return
    }

    // 严格防止重复渲染
    if (this.isRendering) {
      return
    }

    // 严格的渲染节流 - 200ms内只允许一次渲染
    const now = Date.now()
    if (now - this.lastRenderTime < 200) {
      return
    }

    this.lastRenderTime = now
    this.isRendering = true

    try {
      // 如果是第一次渲染，创建完整结构
      if (this.container.children.length === 0) {
        this.renderInitial()
      } else {
        // 只更新内容，不重新创建结构
        this.updateContent()
      }
    } finally {
      this.isRendering = false
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
    // 临时设置标志，防止DOM变化触发新的渲染
    const wasRendering = this.isRendering
    this.isRendering = true

    try {
      // 对于所有视图，都重新渲染主体以确保一致性
      const wrapper = this.container.querySelector('.ldesign-calendar-wrapper')
      if (wrapper) {
        const oldBody = wrapper.querySelector('.ldesign-calendar-body')
        if (oldBody) {
          const newBody = this.createBody()
          wrapper.replaceChild(newBody, oldBody)
        }
      }
    } finally {
      // 恢复原始状态
      this.isRendering = wasRendering
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
    if (currentView === 'month') {
      body.appendChild(this.createMonthView())
    } else if (currentView === 'week') {
      body.appendChild(this.createWeekView())
    } else if (currentView === 'day') {
      body.appendChild(this.createDayView())
    }

    return body
  }

  /**
   * 创建月视图
   */
  private createMonthView(): HTMLElement {
    console.log('createMonthView() 被调用')
    // 创建月视图容器
    const monthViewContainer = document.createElement('div')
    monthViewContainer.className = 'ldesign-calendar-month-view'

    // 创建或重用MonthView实例
    if (!this.monthView) {
      console.log('创建新的MonthView实例')
      this.monthView = new MonthView({
        enabled: true,
        displayName: '月视图',
        options: {
          firstDay: 0, // 周日开始
          showWeekends: true,
          showLunar: this.config.showLunar || false,
          showHolidays: this.config.showHolidays || false
        }
      })

      // 只在第一次创建时初始化
      const context = {
        calendar: this,
        viewType: 'month' as const,
        currentDate: this.stateManager.getCurrentDate(),
        dateRange: this.monthView.getDateRange(),
        events: this.stateManager.getEvents(),
        config: this.monthView.config,
        container: monthViewContainer
      }

      console.log('调用 monthView.init()')
      this.monthView.init(context)

      // 设置当前视图
      this.currentView = this.monthView

      // 初始化后进行渲染
      this.monthView.render()
    } else {
      console.log('重用现有的MonthView实例')
      // 重用时更新容器和事件数据
      this.monthView.setContainer(monthViewContainer)

      // 更新上下文中的其他数据
      const context = this.monthView.getContext()
      if (context) {
        context.events = this.stateManager.getEvents()
        context.currentDate = this.stateManager.getCurrentDate()
      }

      // 重用时也需要重新渲染
      this.monthView.render()
    }

    return monthViewContainer
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
    // 绑定右键菜单事件
    this.container.addEventListener('contextmenu', this.handleContainerContextMenu.bind(this))

    // 绑定拖拽事件
    if (this.config.draggable) {
      this.container.addEventListener('mousedown', this.handleContainerMouseDown.bind(this))
    }

    // 绑定键盘事件
    if (this.config.keyboardNavigation) {
      this.keyboardManager.activate(this.container)
    }

    // TODO: 绑定触摸事件
    // TODO: 绑定窗口大小变化事件
  }

  /**
   * 处理容器鼠标按下事件
   */
  private handleContainerMouseDown(event: MouseEvent): void {
    // 只处理左键
    if (event.button !== 0) {
      return
    }

    const target = event.target as HTMLElement

    // 检查是否点击在事件上
    const eventElement = target.closest('.ldesign-calendar-event')
    if (eventElement) {
      const eventId = eventElement.getAttribute('data-event-id')
      if (eventId) {
        const calendarEvent = this.stateManager.getEvents().find(e => e.id === eventId)
        if (calendarEvent && calendarEvent.draggable !== false) {
          // 开始拖拽事件
          this.startDrag(calendarEvent, event, 'move')
          return
        }
      }
    }
  }

  /**
   * 处理容器右键菜单事件
   */
  private handleContainerContextMenu(event: MouseEvent): void {
    event.preventDefault()

    const target = event.target as HTMLElement

    // 检查是否点击在日期单元格上
    const dateCell = target.closest('.ldesign-calendar-day-cell')
    if (dateCell) {
      const dateStr = dateCell.getAttribute('data-date')
      if (dateStr) {
        const date = new Date(dateStr)
        this.handleContextMenu(event, 'date', { date })
        return
      }
    }

    // 检查是否点击在事件上
    const eventElement = target.closest('.ldesign-calendar-event')
    if (eventElement) {
      const eventId = eventElement.getAttribute('data-event-id')
      if (eventId) {
        const event = this.stateManager.getEvents().find(e => e.id === eventId)
        if (event) {
          this.handleContextMenu(event, 'event', { event })
          return
        }
      }
    }

    // 空白区域右键
    this.handleContextMenu(event, 'empty')
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
      end: event.end || new Date(),
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
   * @returns 事件ID
   */
  addEvent(event: Partial<CalendarEvent>): string {
    // 生成事件ID（如果没有提供）
    const eventId = event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const fullEvent: CalendarEvent = {
      id: eventId,
      title: event.title || '未命名事件',
      start: event.start || new Date(),
      end: event.end || new Date(),
      allDay: event.allDay || false,
      ...(event.description !== undefined && { description: event.description }),
      ...(event.type !== undefined && { type: event.type }),
      ...(event.color !== undefined && { color: event.color }),
      ...(event.location !== undefined && { location: event.location }),
      ...(event.recurrence !== undefined && { recurrence: event.recurrence }),
      ...(event.customData !== undefined && { customData: event.customData }),
      ...(event.draggable !== undefined && { draggable: event.draggable }),
    }

    this.eventManager.addEvent(fullEvent)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())

    // 重新渲染当前视图以显示新事件
    this.render()

    return eventId
  }

  /**
   * 更新事件（简化版本）
   * @param eventId 事件ID
   * @param updates 更新数据
   */
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): void {
    const existingEvent = this.eventManager.getEvent(eventId)
    if (!existingEvent) {
      console.warn(`Event with id ${eventId} not found`)
      return
    }

    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      ...updates,
      id: eventId, // 确保ID不被覆盖
    }

    this.eventManager.updateEvent(updatedEvent)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())

    // 重新渲染当前视图以显示更新的事件
    this.render()
  }

  /**
   * 删除事件（简化版本）
   * @param eventId 事件ID
   */
  removeEvent(eventId: string): void {
    this.eventManager.removeEvent(eventId)
    // 更新状态管理器中的事件
    this.stateManager.setEvents(this.eventManager.getEvents())

    // 重新渲染当前视图以移除删除的事件
    this.render()
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



  // ==================== 交互功能API ====================

  /**
   * 处理右键菜单
   */
  handleContextMenu(event: MouseEvent, type: 'date' | 'event' | 'empty', data?: { date?: Date; event?: CalendarEvent }): boolean {
    return this.contextMenuManager.handleContextMenu(event, type, data)
  }

  /**
   * 隐藏右键菜单
   */
  hideContextMenu(): void {
    this.contextMenuManager.hideMenu()
  }

  /**
   * 开始拖拽事件
   */
  startDrag(event: CalendarEvent, mouseEvent: MouseEvent, type: 'move' | 'resize-start' | 'resize-end' = 'move'): boolean {
    return this.dragDropManager.startDrag(event, mouseEvent, type)
  }

  /**
   * 取消拖拽
   */
  cancelDrag(): void {
    this.dragDropManager.cancelDrag()
  }

  /**
   * 激活键盘导航
   */
  activateKeyboard(): void {
    this.keyboardManager.activate(this.container)
  }

  /**
   * 停用键盘导航
   */
  deactivateKeyboard(): void {
    this.keyboardManager.deactivate(this.container)
  }

  /**
   * 获取所有快捷键
   */
  getKeyboardShortcuts() {
    return this.keyboardManager.getShortcuts()
  }

  /**
   * 更新交互配置
   */
  updateInteractionConfig(config: {
    contextMenu?: Partial<ContextMenuConfig>
    dragDrop?: Partial<DragDropConfig>
    keyboard?: Partial<KeyboardConfig>
  }): void {
    if (config.contextMenu) {
      this.contextMenuManager.updateConfig(config.contextMenu)
    }
    if (config.dragDrop) {
      this.dragDropManager.updateConfig(config.dragDrop)
    }
    if (config.keyboard) {
      this.keyboardManager.updateConfig(config.keyboard)
    }
  }

  /**
   * 销毁日历实例
   */
  destroy(): void {
    if (this.destroyed) return

    // 销毁视图
    if (this.monthView) {
      this.monthView.destroy()
      this.monthView = null
    }

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

    // 清理交互管理器
    this.contextMenuManager.destroy()
    this.dragDropManager.destroy()
    this.keyboardManager.destroy()

    // 清理渲染timeout
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
      this.renderTimeout = null
    }

    // 清理DOM
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-calendar')

    this.destroyed = true
  }
}
