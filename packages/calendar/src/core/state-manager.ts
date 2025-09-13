/**
 * 状态管理器
 * 
 * 负责管理日历的全局状态，包括：
 * - 当前视图状态
 * - 选中日期状态
 * - 事件状态
 * - 加载状态
 * - 错误状态
 * - 拖拽状态
 */

import type { CalendarState, DateRange } from '../types/calendar'
import type { CalendarEvent } from '../types/event'

/**
 * 状态管理器类
 */
export class StateManager {
  private state: CalendarState
  private listeners: Map<string, Function[]> = new Map()
  private history: CalendarState[] = []
  private maxHistorySize = 50

  /**
   * 构造函数
   * @param initialState 初始状态
   */
  constructor(initialState: CalendarState) {
    this.state = { ...initialState }
    this.saveToHistory()
  }

  /**
   * 获取当前状态
   * @returns 当前状态的副本
   */
  getState(): CalendarState {
    return { ...this.state }
  }

  /**
   * 更新状态
   * @param updates 状态更新
   */
  updateState(updates: Partial<CalendarState>): void {
    const previousState = { ...this.state }
    this.state = { ...this.state, ...updates }

    // 保存到历史记录
    this.saveToHistory()

    // 触发状态变化监听器
    this.emit('stateChanged', this.state, previousState)

    // 触发特定字段的监听器
    Object.keys(updates).forEach(key => {
      this.emit(`${key}Changed`, (updates as any)[key], (previousState as any)[key])
    })
  }

  /**
   * 设置当前视图
   * @param view 视图类型
   */
  setCurrentView(view: CalendarState['currentView']): void {
    if (this.state.currentView !== view) {
      this.updateState({ currentView: view })
    }
  }

  /**
   * 获取当前视图
   * @returns 当前视图类型
   */
  getCurrentView(): CalendarState['currentView'] {
    return this.state.currentView
  }

  /**
   * 设置当前日期
   * @param date 日期
   */
  setCurrentDate(date: Date): void {
    if (this.state.currentDate.getTime() !== date.getTime()) {
      this.updateState({ currentDate: new Date(date) })
    }
  }

  /**
   * 获取当前日期
   * @returns 当前日期
   */
  getCurrentDate(): Date {
    return new Date(this.state.currentDate)
  }

  /**
   * 设置选中日期
   * @param date 选中的日期
   */
  setSelectedDate(date: Date | null): void {
    const selectedDate = date ? new Date(date) : null
    this.updateState({ selectedDate })
  }

  /**
   * 获取选中日期
   * @returns 选中的日期
   */
  getSelectedDate(): Date | null {
    return this.state.selectedDate ? new Date(this.state.selectedDate) : null
  }

  /**
   * 设置选中日期范围
   * @param range 日期范围
   */
  setSelectedRange(range: DateRange | null): void {
    const selectedRange = range ? {
      start: new Date(range.start),
      end: new Date(range.end),
    } : null
    this.updateState({ selectedRange })
  }

  /**
   * 获取选中日期范围
   * @returns 选中的日期范围
   */
  getSelectedRange(): DateRange | null {
    return this.state.selectedRange ? {
      start: new Date(this.state.selectedRange.start),
      end: new Date(this.state.selectedRange.end),
    } : null
  }

  /**
   * 设置事件列表
   * @param events 事件列表
   */
  setEvents(events: CalendarEvent[]): void {
    this.updateState({ events: [...events] })
  }

  /**
   * 获取事件列表
   * @returns 事件列表
   */
  getEvents(): CalendarEvent[] {
    return [...this.state.events]
  }

  /**
   * 添加事件
   * @param event 事件
   */
  addEvent(event: CalendarEvent): void {
    const events = [...this.state.events, event]
    this.updateState({ events })
  }

  /**
   * 更新事件
   * @param eventId 事件ID
   * @param updates 更新数据
   */
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): void {
    const events = this.state.events.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    )
    this.updateState({ events })
  }

  /**
   * 删除事件
   * @param eventId 事件ID
   */
  removeEvent(eventId: string): void {
    const events = this.state.events.filter(event => event.id !== eventId)
    this.updateState({ events })
  }

  /**
   * 设置加载状态
   * @param loading 是否正在加载
   */
  setLoading(loading: boolean): void {
    if (this.state.loading !== loading) {
      this.updateState({ loading })
    }
  }

  /**
   * 获取加载状态
   * @returns 是否正在加载
   */
  isLoading(): boolean {
    return this.state.loading
  }

  /**
   * 设置错误信息
   * @param error 错误信息
   */
  setError(error: string | null): void {
    if (this.state.error !== error) {
      this.updateState({ error })
    }
  }

  /**
   * 获取错误信息
   * @returns 错误信息
   */
  getError(): string | null {
    return this.state.error
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    this.setError(null)
  }

  /**
   * 设置拖拽状态
   * @param dragging 是否正在拖拽
   * @param draggingEvent 正在拖拽的事件
   */
  setDragging(dragging: boolean, draggingEvent: CalendarEvent | null = null): void {
    this.updateState({ dragging, draggingEvent })
  }

  /**
   * 获取拖拽状态
   * @returns 拖拽状态信息
   */
  getDraggingState(): { dragging: boolean; draggingEvent: CalendarEvent | null } {
    return {
      dragging: this.state.dragging,
      draggingEvent: this.state.draggingEvent,
    }
  }

  /**
   * 重置状态到初始值
   * @param initialState 初始状态
   */
  reset(initialState?: Partial<CalendarState>): void {
    const defaultState: CalendarState = {
      currentView: 'month',
      currentDate: new Date(),
      selectedDate: null,
      selectedRange: null,
      events: [],
      loading: false,
      error: null,
      dragging: false,
      draggingEvent: null,
    }

    this.state = { ...defaultState, ...initialState }
    this.history = []
    this.saveToHistory()
    this.emit('stateReset', this.state)
  }

  /**
   * 撤销到上一个状态
   * @returns 是否成功撤销
   */
  undo(): boolean {
    if (this.history.length > 1) {
      this.history.pop() // 移除当前状态
      const previousState = this.history[this.history.length - 1]
      if (previousState) {
        this.state = {
          currentView: previousState.currentView,
          currentDate: previousState.currentDate,
          selectedDate: previousState.selectedDate,
          selectedRange: previousState.selectedRange,
          events: previousState.events,
          loading: previousState.loading,
          error: previousState.error,
          dragging: previousState.dragging,
          draggingEvent: previousState.draggingEvent,
        }
        this.emit('stateChanged', this.state, previousState)
        return true
      }
    }
    return false
  }

  /**
   * 获取状态历史记录
   * @returns 状态历史记录
   */
  getHistory(): CalendarState[] {
    return [...this.history]
  }

  /**
   * 清空状态历史记录
   */
  clearHistory(): void {
    this.history = [{ ...this.state }]
  }

  /**
   * 添加状态监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * 移除状态监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }

  /**
   * 保存状态到历史记录
   */
  private saveToHistory(): void {
    this.history.push({ ...this.state })

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
  }

  /**
   * 触发事件监听器
   * @param event 事件名称
   * @param args 参数
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`状态监听器执行错误 (${event}):`, error)
        }
      })
    }
  }
}
