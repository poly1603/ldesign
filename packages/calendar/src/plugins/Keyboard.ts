/**
 * 键盘导航插件
 */

import type { CalendarPlugin, PluginContext, KeyboardOptions } from './types'
import type { ViewType } from '../types'
import { DateUtils } from '../utils/date'

/**
 * 键盘导航插件类
 */
export class KeyboardPlugin implements CalendarPlugin {
  public readonly name = 'KeyboardPlugin'
  public readonly version = '1.0.0'
  public readonly description = '键盘导航插件，提供键盘快捷键支持'
  public readonly author = 'ldesign'

  public readonly defaultOptions: KeyboardOptions = {
    enabled: true,
    priority: 25,
    config: {
      shortcuts: {
        'ArrowLeft': 'prev',
        'ArrowRight': 'next',
        'ArrowUp': 'prevWeek',
        'ArrowDown': 'nextWeek',
        'Home': 'goToToday',
        'PageUp': 'prevMonth',
        'PageDown': 'nextMonth',
        'Enter': 'selectDate',
        'Escape': 'clearSelection',
        'KeyM': 'monthView',
        'KeyW': 'weekView',
        'KeyD': 'dayView',
        'KeyY': 'yearView',
        'KeyT': 'goToToday',
        'KeyN': 'createEvent',
        'Delete': 'deleteEvent',
        'F2': 'editEvent'
      },
      enableArrowKeys: true,
      enableTabNavigation: true,
      enableEnterSelect: true,
      enableEscapeCancel: true
    }
  }

  private context?: PluginContext
  private focusedElement?: HTMLElement
  private focusedDate?: Date
  private isActive = false

  /**
   * 安装插件
   */
  public install(context: PluginContext): void {
    this.context = context
    this.bindEvents()
  }

  /**
   * 卸载插件
   */
  public uninstall(context: PluginContext): void {
    this.unbindEvents()
  }

  /**
   * 日历渲染后钩子
   */
  public afterRender(context: PluginContext): void {
    this.setupKeyboardNavigation()
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    if (!this.context) return

    const calendarContainer = this.context.calendar.getContainer()
    
    // 设置容器可聚焦
    calendarContainer.tabIndex = 0
    calendarContainer.style.outline = 'none'

    // 为日期单元格添加tabindex
    const dateCells = calendarContainer.querySelectorAll('.ldesign-calendar-date-cell')
    dateCells.forEach((cell, index) => {
      const element = cell as HTMLElement
      element.tabIndex = -1 // 可通过程序聚焦，但不在Tab顺序中
      
      // 添加焦点样式
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid #722ED1'
        element.style.outlineOffset = '-2px'
        this.focusedElement = element
        this.focusedDate = this.getDateFromElement(element)
      })
      
      element.addEventListener('blur', () => {
        element.style.outline = ''
        element.style.outlineOffset = ''
      })
    })

    // 设置初始焦点
    this.setInitialFocus()
  }

  /**
   * 设置初始焦点
   */
  private setInitialFocus(): void {
    if (!this.context) return

    const calendarContainer = this.context.calendar.getContainer()
    const currentDate = this.context.calendar.getCurrentDate()
    
    // 查找今天的单元格
    const todayCell = calendarContainer.querySelector(`[data-date="${DateUtils.format(currentDate, 'YYYY-MM-DD')}"]`) as HTMLElement
    
    if (todayCell) {
      this.focusElement(todayCell)
    } else {
      // 如果找不到今天，聚焦第一个日期单元格
      const firstCell = calendarContainer.querySelector('.ldesign-calendar-date-cell') as HTMLElement
      if (firstCell) {
        this.focusElement(firstCell)
      }
    }
  }

  /**
   * 聚焦元素
   */
  private focusElement(element: HTMLElement): void {
    if (this.focusedElement) {
      this.focusedElement.style.outline = ''
      this.focusedElement.style.outlineOffset = ''
    }

    this.focusedElement = element
    this.focusedDate = this.getDateFromElement(element)
    
    element.focus()
    element.style.outline = '2px solid #722ED1'
    element.style.outlineOffset = '-2px'
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.context || !this.isActive) return

    const config = this.context.options
    const shortcuts = config.shortcuts || {}
    
    // 构建按键标识符
    const keyIdentifier = this.getKeyIdentifier(event)
    const action = shortcuts[keyIdentifier]

    if (action) {
      event.preventDefault()
      this.executeAction(action, event)
      this.context.emit('keyboard:shortcut', keyIdentifier, action)
    }
  }

  /**
   * 获取按键标识符
   */
  private getKeyIdentifier(event: KeyboardEvent): string {
    const modifiers = []
    if (event.ctrlKey) modifiers.push('Ctrl')
    if (event.altKey) modifiers.push('Alt')
    if (event.shiftKey) modifiers.push('Shift')
    if (event.metaKey) modifiers.push('Meta')

    const key = event.code || event.key
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
  }

  /**
   * 执行动作
   */
  private executeAction(action: string, event: KeyboardEvent): void {
    if (!this.context) return

    const calendar = this.context.calendar

    switch (action) {
      case 'prev':
        this.navigateDate(-1, 'day')
        break
      case 'next':
        this.navigateDate(1, 'day')
        break
      case 'prevWeek':
        this.navigateDate(-1, 'week')
        break
      case 'nextWeek':
        this.navigateDate(1, 'week')
        break
      case 'prevMonth':
        this.navigateDate(-1, 'month')
        break
      case 'nextMonth':
        this.navigateDate(1, 'month')
        break
      case 'goToToday':
        calendar.goToToday()
        this.setInitialFocus()
        break
      case 'selectDate':
        if (this.focusedDate) {
          calendar.selectDate(this.focusedDate)
        }
        break
      case 'clearSelection':
        calendar.clearSelection()
        break
      case 'monthView':
        calendar.changeView('month')
        break
      case 'weekView':
        calendar.changeView('week')
        break
      case 'dayView':
        calendar.changeView('day')
        break
      case 'yearView':
        calendar.changeView('year')
        break
      case 'createEvent':
        this.createEventAtFocusedDate()
        break
      case 'deleteEvent':
        this.deleteEventAtFocusedDate()
        break
      case 'editEvent':
        this.editEventAtFocusedDate()
        break
    }
  }

  /**
   * 导航日期
   */
  private navigateDate(amount: number, unit: 'day' | 'week' | 'month'): void {
    if (!this.focusedDate || !this.context) return

    const newDate = DateUtils.dayjs(this.focusedDate).add(amount, unit).toDate()
    const calendarContainer = this.context.calendar.getContainer()
    
    // 查找新日期的单元格
    const newCell = calendarContainer.querySelector(`[data-date="${DateUtils.format(newDate, 'YYYY-MM-DD')}"]`) as HTMLElement
    
    if (newCell) {
      this.focusElement(newCell)
    } else {
      // 如果新日期不在当前视图中，切换到包含该日期的视图
      this.context.calendar.goToDate(newDate)
      
      // 等待重新渲染后聚焦
      setTimeout(() => {
        const updatedCell = calendarContainer.querySelector(`[data-date="${DateUtils.format(newDate, 'YYYY-MM-DD')}"]`) as HTMLElement
        if (updatedCell) {
          this.focusElement(updatedCell)
        }
      }, 100)
    }
  }

  /**
   * 在聚焦日期创建事件
   */
  private createEventAtFocusedDate(): void {
    if (!this.focusedDate || !this.context) return

    const startTime = DateUtils.dayjs(this.focusedDate).hour(9).minute(0).toDate()
    const endTime = DateUtils.dayjs(this.focusedDate).hour(10).minute(0).toDate()

    const newEvent = {
      title: '新事件',
      start: startTime,
      end: endTime,
      description: ''
    }

    this.context.emit('event:create', newEvent)
  }

  /**
   * 删除聚焦日期的事件
   */
  private deleteEventAtFocusedDate(): void {
    if (!this.focusedDate || !this.context) return

    const events = this.context.calendar.getEventManager().getEventsForDate(this.focusedDate)
    
    if (events.length === 1) {
      // 如果只有一个事件，直接删除
      const confirmed = confirm(`确定要删除事件"${events[0].title}"吗？`)
      if (confirmed) {
        this.context.calendar.getEventManager().deleteEvent(events[0].id)
      }
    } else if (events.length > 1) {
      // 如果有多个事件，显示选择列表
      this.showEventSelectionDialog(events, 'delete')
    }
  }

  /**
   * 编辑聚焦日期的事件
   */
  private editEventAtFocusedDate(): void {
    if (!this.focusedDate || !this.context) return

    const events = this.context.calendar.getEventManager().getEventsForDate(this.focusedDate)
    
    if (events.length === 1) {
      // 如果只有一个事件，直接编辑
      this.context.emit('event:edit', events[0])
    } else if (events.length > 1) {
      // 如果有多个事件，显示选择列表
      this.showEventSelectionDialog(events, 'edit')
    }
  }

  /**
   * 显示事件选择对话框
   */
  private showEventSelectionDialog(events: any[], action: 'edit' | 'delete'): void {
    const eventTitles = events.map((event, index) => `${index + 1}. ${event.title}`).join('\n')
    const message = `选择要${action === 'edit' ? '编辑' : '删除'}的事件：\n\n${eventTitles}\n\n请输入事件编号（1-${events.length}）：`
    
    const input = prompt(message)
    if (input) {
      const index = parseInt(input) - 1
      if (index >= 0 && index < events.length) {
        const selectedEvent = events[index]
        
        if (action === 'edit') {
          this.context?.emit('event:edit', selectedEvent)
        } else if (action === 'delete') {
          const confirmed = confirm(`确定要删除事件"${selectedEvent.title}"吗？`)
          if (confirmed) {
            this.context?.calendar.getEventManager().deleteEvent(selectedEvent.id)
          }
        }
      }
    }
  }

  /**
   * 从元素获取日期
   */
  private getDateFromElement(element: HTMLElement): Date | null {
    const dateStr = element.dataset.date
    if (!dateStr) return null

    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.context) return

    const calendarContainer = this.context.calendar.getContainer()

    // 监听容器焦点事件
    calendarContainer.addEventListener('focus', () => {
      this.isActive = true
    })

    calendarContainer.addEventListener('blur', () => {
      this.isActive = false
    })

    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))

    // 监听鼠标点击，更新焦点
    calendarContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const dateCell = target.closest('.ldesign-calendar-date-cell') as HTMLElement
      
      if (dateCell) {
        this.focusElement(dateCell)
        this.isActive = true
      }
    })
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 获取帮助信息
   */
  public getHelpText(): string {
    const config = this.context?.options
    const shortcuts = config?.shortcuts || {}

    const helpItems = [
      '键盘快捷键：',
      '',
      '导航：',
      '  ← → ↑ ↓  导航日期',
      '  Home      回到今天',
      '  PageUp    上一月',
      '  PageDown  下一月',
      '',
      '视图切换：',
      '  M         月视图',
      '  W         周视图',
      '  D         日视图',
      '  Y         年视图',
      '',
      '操作：',
      '  Enter     选择日期',
      '  Escape    清除选择',
      '  N         创建事件',
      '  F2        编辑事件',
      '  Delete    删除事件',
      '',
      '提示：点击日历获得焦点后即可使用键盘导航'
    ]

    return helpItems.join('\n')
  }

  /**
   * 显示帮助
   */
  public showHelp(): void {
    alert(this.getHelpText())
  }
}
