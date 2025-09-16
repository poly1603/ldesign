/**
 * 日历核心类 - 主要的日历控制器
 */

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { EventManager } from './EventManager'
import { ViewManager } from './ViewManager'
import { ConfigManager } from './ConfigManager'
import { ThemeManager } from '../themes/ThemeManager'
import { I18nManager } from '../utils/i18n'
import { DateUtils } from '../utils/date'
import { DOMUtils } from '../utils/dom'
import { ContextMenu, createDateContextMenuItems, createEventContextMenuItems } from '../components/ContextMenu'
import { EventModal } from '../components/EventModal'
import { DetailModal } from '../components/DetailModal'
import { DeskView } from '../views/DeskView'
import type {
  CalendarConfig,
  CalendarEvent,
  ViewType,
  DateInput,
  DateSelectCallback,
  EventClickCallback,
  EventCreateCallback,
  EventUpdateCallback,
  EventDeleteCallback,
  ViewChangeCallback,
  DateChangeCallback
} from '../types'

/**
 * 日历主类
 */
export class Calendar {
  /** 配置管理器 */
  private configManager: ConfigManager
  /** 事件管理器 */
  private eventManager: EventManager
  /** 视图管理器 */
  private viewManager: ViewManager
  /** 主题管理器 */
  private themeManager: ThemeManager
  /** 国际化管理器 */
  private i18nManager: I18nManager
  /** 容器元素 */
  private container: HTMLElement
  /** 当前日期 */
  private currentDate: Dayjs
  /** 当前视图 */
  private currentView: ViewType
  /** 选中的日期 */
  private selectedDates: Dayjs[] = []
  /** 是否已初始化 */
  private initialized = false
  /** 事件监听器 */
  private listeners: Map<string, Function[]> = new Map()
  /** 右键菜单 */
  private contextMenu: ContextMenu
  /** 事件弹窗 */
  private eventModal: EventModal | null = null
  /** 详情弹窗 */
  private detailModal: DetailModal | null = null
  /** 台历视图 */
  private deskView: DeskView | null = null

  constructor(container: string | HTMLElement, config: CalendarConfig = {}) {
    // 初始化容器
    this.container = typeof container === 'string' 
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('Container element is required')
    }

    // 初始化管理器
    this.configManager = new ConfigManager(config)
    this.eventManager = new EventManager()
    this.viewManager = new ViewManager(this)
    this.themeManager = new ThemeManager(this.container)
    this.i18nManager = new I18nManager()

    // 初始化组件
    this.contextMenu = new ContextMenu()

    // 初始化状态
    this.currentDate = dayjs(config.date || new Date())
    this.currentView = config.view || 'month'

    // 初始化日历
    this.init()
  }

  /**
   * 初始化日历
   */
  private init(): void {
    if (this.initialized) return

    // 设置容器类名
    this.container.className = `ldesign-calendar ${this.configManager.get('className') || ''}`
    
    // 应用主题
    this.themeManager.applyTheme(this.configManager.get('theme') || 'default')
    
    // 设置语言
    this.i18nManager.setLocale(this.configManager.get('locale') || 'zh-CN')
    
    // 绑定事件
    this.bindEvents()
    
    // 渲染日历
    this.render()
    
    this.initialized = true
    this.emit('initialized')
  }

  /**
   * 渲染日历
   */
  public render(): void {
    if (!this.container) return

    // 清空容器
    this.container.innerHTML = ''
    
    // 创建日历结构
    const calendarElement = this.createCalendarStructure()
    this.container.appendChild(calendarElement)
    
    // 渲染当前视图
    this.viewManager.renderView(this.currentView, this.currentDate)
    
    this.emit('calendar:render')
  }

  /**
   * 创建日历结构
   */
  private createCalendarStructure(): HTMLElement {
    const calendar = DOMUtils.createElement('div', 'ldesign-calendar')

    // 添加当前主题类
    const currentTheme = this.themeManager.getCurrentTheme()
    if (currentTheme) {
      calendar.classList.add(`theme-${currentTheme}`)
    }

    // 工具栏
    if (this.configManager.get('showToolbar')) {
      const toolbar = this.createToolbar()
      calendar.appendChild(toolbar)
    }

    // 导航栏
    if (this.configManager.get('showNavigation')) {
      const navigation = this.createNavigation()
      calendar.appendChild(navigation)
    }

    // 视图容器
    const viewContainer = DOMUtils.createElement('div', 'ldesign-calendar-view')
    calendar.appendChild(viewContainer)

    return calendar
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): HTMLElement {
    const toolbar = DOMUtils.createElement('div', 'ldesign-calendar-toolbar')
    
    // 视图切换按钮
    const viewButtons = ['month', 'week', 'day', 'year'].map(view => {
      const button = DOMUtils.createElement('button', 'ldesign-calendar-view-btn')
      button.textContent = this.i18nManager.t(`view.${view}`)
      button.dataset.view = view
      if (view === this.currentView) {
        button.classList.add('active')
      }
      return button
    })
    
    const viewGroup = DOMUtils.createElement('div', 'ldesign-calendar-view-group')
    viewButtons.forEach(btn => viewGroup.appendChild(btn))
    toolbar.appendChild(viewGroup)
    
    // 今天按钮
    if (this.configManager.get('showToday')) {
      const todayBtn = DOMUtils.createElement('button', 'ldesign-calendar-today-btn')
      todayBtn.textContent = this.i18nManager.t('today')
      toolbar.appendChild(todayBtn)
    }
    
    return toolbar
  }

  /**
   * 创建导航栏
   */
  private createNavigation(): HTMLElement {
    const navigation = DOMUtils.createElement('div', 'ldesign-calendar-navigation')
    
    // 上一个按钮
    const prevBtn = DOMUtils.createElement('button', 'ldesign-calendar-prev-btn')
    prevBtn.innerHTML = '‹'
    
    // 下一个按钮
    const nextBtn = DOMUtils.createElement('button', 'ldesign-calendar-next-btn')
    nextBtn.innerHTML = '›'
    
    // 日期标题
    const title = DOMUtils.createElement('div', 'ldesign-calendar-title')
    title.textContent = this.getDateTitle()
    
    navigation.appendChild(prevBtn)
    navigation.appendChild(title)
    navigation.appendChild(nextBtn)
    
    return navigation
  }

  /**
   * 获取日期标题
   */
  private getDateTitle(): string {
    const year = this.currentDate.year()
    const month = this.currentDate.month()
    const day = this.currentDate.date()

    // 获取月份名称数组 - 使用完整月份名称
    const monthNames = this.i18nManager.getMonthNames('long')
    const monthName = monthNames[month] || `${month + 1}`

    if (this.currentView === 'year') {
      return `${year} ${this.i18nManager.t('date.year')}`
    } else if (this.currentView === 'month') {
      return `${year} ${monthName}`
    } else {
      return `${year} ${monthName} ${day}`
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 工具栏事件
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      
      // 视图切换
      if (target.classList.contains('ldesign-calendar-view-btn')) {
        const view = target.dataset.view as ViewType
        this.changeView(view)
      }
      
      // 今天按钮
      if (target.classList.contains('ldesign-calendar-today-btn')) {
        this.goToToday()
      }
      
      // 导航按钮
      if (target.classList.contains('ldesign-calendar-prev-btn')) {
        this.prev()
      }
      
      if (target.classList.contains('ldesign-calendar-next-btn')) {
        this.next()
      }
      
      // 日期点击
      if (target.classList.contains('ldesign-calendar-date')) {
        const dateStr = target.dataset.date
        if (dateStr) {
          const date = dayjs(dateStr)
          this.selectDate(date)
        }
      }
    })
    
    // 键盘事件
    if (this.configManager.get('enableKeyboard')) {
      this.bindKeyboardEvents()
    }
    
    // 触摸事件
    if (this.configManager.get('enableTouch')) {
      this.bindTouchEvents()
    }
  }

  /**
   * 绑定键盘事件
   */
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.container.contains(document.activeElement)) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          this.prev()
          break
        case 'ArrowRight':
          e.preventDefault()
          this.next()
          break
        case 'ArrowUp':
          e.preventDefault()
          this.prevWeek()
          break
        case 'ArrowDown':
          e.preventDefault()
          this.nextWeek()
          break
        case 'Home':
          e.preventDefault()
          this.goToToday()
          break
        case 'PageUp':
          e.preventDefault()
          this.prevMonth()
          break
        case 'PageDown':
          e.preventDefault()
          this.nextMonth()
          break
      }
    })

    // 右键菜单事件
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      const target = e.target as HTMLElement

      // 日期右键
      if (target.classList.contains('ldesign-calendar-date')) {
        const dateStr = target.dataset.date
        if (dateStr) {
          const date = dayjs(dateStr)
          this.showDateContextMenu(e, date)
        }
      }

      // 事件右键
      if (target.classList.contains('ldesign-calendar-event')) {
        const eventId = target.dataset.eventId
        if (eventId) {
          const event = this.eventManager.getEvent(eventId)
          if (event) {
            this.showEventContextMenu(e, event)
          }
        }
      }
    })
  }

  /**
   * 绑定触摸事件
   */
  private bindTouchEvents(): void {
    let startX = 0
    let startY = 0
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    })
    
    this.container.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - startX
      const deltaY = endY - startY
      
      // 水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.prev()
        } else {
          this.next()
        }
      }
    })
  }

  // ==================== 公共API ====================

  /**
   * 切换视图
   */
  public changeView(view: ViewType): void {
    if (this.currentView === view) return

    const oldView = this.currentView
    this.currentView = view
    this.viewManager.renderView(view, this.currentDate)
    this.updateTitle()
    this.emit('view:change', view, oldView)
  }

  /**
   * 跳转到指定日期
   */
  public goToDate(date: DateInput): void {
    this.currentDate = dayjs(date)
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 跳转到今天
   */
  public goToToday(): void {
    this.goToDate(new Date())
  }

  /**
   * 上一个周期
   */
  public prev(): void {
    const unit = this.currentView === 'year' ? 'year' :
                 this.currentView === 'month' ? 'month' :
                 this.currentView === 'week' ? 'week' : 'day'
    
    this.currentDate = this.currentDate.subtract(1, unit)
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 下一个周期
   */
  public next(): void {
    const unit = this.currentView === 'year' ? 'year' :
                 this.currentView === 'month' ? 'month' :
                 this.currentView === 'week' ? 'week' : 'day'
    
    this.currentDate = this.currentDate.add(1, unit)
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 上一周
   */
  public prevWeek(): void {
    this.currentDate = this.currentDate.subtract(1, 'week')
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 下一周
   */
  public nextWeek(): void {
    this.currentDate = this.currentDate.add(1, 'week')
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 上一月
   */
  public prevMonth(): void {
    this.currentDate = this.currentDate.subtract(1, 'month')
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 下一月
   */
  public nextMonth(): void {
    this.currentDate = this.currentDate.add(1, 'month')
    this.viewManager.renderView(this.currentView, this.currentDate)
    this.updateTitle()
    this.emit('dateChange', this.currentDate)
  }

  /**
   * 选择日期
   */
  public selectDate(date: Date | Dayjs): void {
    const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date)
    const selectionMode = this.configManager.get('selectionMode') || 'single'
    
    switch (selectionMode) {
      case 'single':
        this.selectedDates = [dayjsDate]
        break
      case 'multiple':
        const index = this.selectedDates.findIndex(d => d.isSame(dayjsDate, 'day'))
        if (index >= 0) {
          this.selectedDates.splice(index, 1)
        } else {
          const maxSelections = this.configManager.get('maxSelections')
          if (!maxSelections || this.selectedDates.length < maxSelections) {
            this.selectedDates.push(dayjsDate)
          }
        }
        break
      case 'range':
        if (this.selectedDates.length === 0 || this.selectedDates.length === 2) {
          this.selectedDates = [dayjsDate]
        } else {
          const start = this.selectedDates[0]
          if (dayjsDate.isBefore(start)) {
            this.selectedDates = [dayjsDate, start]
          } else {
            this.selectedDates = [start, dayjsDate]
          }
        }
        break
    }

    this.viewManager.renderView(this.currentView, this.currentDate)
    this.emit('date:select', dayjsDate.toDate())
  }

  /**
   * 更新标题
   */
  private updateTitle(): void {
    const titleElement = this.container.querySelector('.ldesign-calendar-title')
    if (titleElement) {
      titleElement.textContent = this.getDateTitle()
    }
  }

  /**
   * 事件监听
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return
    
    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in calendar event handler for "${event}":`, error)
      }
    })
  }

  /**
   * 显示日期右键菜单
   */
  private showDateContextMenu(e: MouseEvent, date: Dayjs): void {
    const items = createDateContextMenuItems(date.toDate(), {
      onCreateEvent: (date) => this.showEventModal('create', { date }),
      onViewDetails: (date) => this.showDetailModal(date),
      onGoToToday: () => this.goToToday()
    })

    this.contextMenu.show({
      items,
      x: e.clientX,
      y: e.clientY,
      date: date.toDate()
    })
  }

  /**
   * 显示事件右键菜单
   */
  private showEventContextMenu(e: MouseEvent, event: CalendarEvent): void {
    const items = createEventContextMenuItems(event, {
      onEditEvent: (event) => this.showEventModal('edit', { event }),
      onDeleteEvent: (event) => this.deleteEvent(event.id),
      onDuplicateEvent: (event) => this.duplicateEvent(event)
    })

    this.contextMenu.show({
      items,
      x: e.clientX,
      y: e.clientY,
      event
    })
  }

  /**
   * 显示事件弹窗
   */
  private showEventModal(mode: 'create' | 'edit', options: { event?: CalendarEvent; date?: DateInput } = {}): void {
    if (!this.eventModal) {
      this.eventModal = new EventModal()
    }

    this.eventModal.show({
      mode,
      event: options.event,
      date: options.date,
      onSave: (event) => {
        if (mode === 'create') {
          this.addEvent(event)
        } else {
          this.updateEvent(event.id, event)
        }
      },
      onDelete: (event) => this.deleteEvent(event.id)
    })
  }

  /**
   * 显示详情弹窗
   */
  private showDetailModal(date: DateInput): void {
    if (!this.detailModal) {
      this.detailModal = new DetailModal()
    }

    const startOfDay = dayjs(date).startOf('day').toDate()
    const endOfDay = dayjs(date).endOf('day').toDate()
    const events = this.eventManager.getEventsInRange(startOfDay, endOfDay)

    this.detailModal.show({
      date,
      events,
      onCreateEvent: (date) => this.showEventModal('create', { date }),
      onEditEvent: (event) => this.showEventModal('edit', { event })
    })
  }

  /**
   * 复制事件
   */
  private duplicateEvent(event: CalendarEvent): void {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
      title: `${event.title} (副本)`
    }
    this.addEvent(newEvent)
  }

  /**
   * 销毁日历
   */
  public destroy(): void {
    // 清理组件
    this.contextMenu?.destroy()
    this.eventModal?.hide()
    this.detailModal?.hide()
    this.deskView?.destroy()

    // 清理事件监听器
    this.listeners.clear()

    // 清空容器
    if (this.container) {
      this.container.innerHTML = ''
      this.container.className = ''
    }

    // 清理管理器
    this.eventManager.destroy()
    this.viewManager.destroy()
    this.themeManager.destroy()

    this.initialized = false
    this.emit('destroyed')
  }

  // ==================== Getter方法 ====================

  public getCurrentDate(): Date {
    return this.currentDate.toDate()
  }

  public getCurrentView(): ViewType {
    return this.currentView
  }

  public getSelectedDates(): Dayjs[] {
    return [...this.selectedDates]
  }

  public getConfig(): CalendarConfig {
    return this.configManager.getAll()
  }

  public getEventManager(): EventManager {
    return this.eventManager
  }

  public getViewManager(): ViewManager {
    return this.viewManager
  }

  public getThemeManager(): ThemeManager {
    return this.themeManager
  }

  public getI18nManager(): I18nManager {
    return this.i18nManager
  }

  public getContainer(): HTMLElement {
    return this.container
  }

  public getConfigManager(): ConfigManager {
    return this.configManager
  }

  public getPluginManager(): any {
    // TODO: 实现插件管理器
    return {
      isPluginLoaded: () => true
    }
  }

  public getSelectedDate(): Date | null {
    return this.selectedDates.length > 0 ? this.selectedDates[0].toDate() : null
  }

  public clearSelection(): void {
    this.selectedDates = []
    this.emit('selection:clear')
    this.render()
  }

  // 事件管理的便捷方法
  public addEvent(eventData: any): any {
    return this.eventManager.addEvent(eventData)
  }

  public updateEvent(id: string, updates: any): any {
    return this.eventManager.updateEvent(id, updates)
  }

  public deleteEvent(id: string): boolean {
    return this.eventManager.deleteEvent(id)
  }

  public getEvent(id: string): any {
    return this.eventManager.getEvent(id)
  }

  public getAllEvents(): any[] {
    return this.eventManager.getAllEvents()
  }

  public getEventsForDate(date: Date): any[] {
    return this.eventManager.getEventsForDate(date)
  }

  // 主题方法
  public setTheme(theme: string): void {
    this.themeManager.setTheme(theme)
  }

  // 导出方法（插件提供）
  public exportToJSON(): string {
    // TODO: 通过插件实现
    return JSON.stringify({ events: this.getAllEvents() })
  }

  public importFromURL(url: string): Promise<void> {
    // TODO: 实现远程导入
    return Promise.reject(new Error('Not implemented'))
  }

  // 配置更新
  public updateConfig(config: Partial<CalendarConfig>): void {
    this.configManager.setMultiple(config)
    this.emit('config:update', config)
    this.render()
  }

  // 一次性事件监听器
  public once(event: string, callback: Function): void {
    const onceWrapper = (...args: any[]) => {
      callback(...args)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
  }
}
