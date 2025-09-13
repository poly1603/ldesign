/**
 * 视图基类
 * 
 * 所有视图组件的基类，提供通用的视图功能：
 * - 视图初始化和销毁
 * - 事件处理
 * - DOM操作
 * - 渲染管理
 */

import type { IView, ViewType, ViewConfig, ViewRenderContext } from '../types/view'
import type { CalendarEvent } from '../types/event'

/**
 * 视图基类
 */
export abstract class BaseView implements IView {
  /** 视图类型 */
  abstract readonly type: ViewType

  /** 视图配置 */
  config: ViewConfig

  /** 渲染上下文 */
  protected context: ViewRenderContext | null = null

  /** 容器元素 */
  protected container: HTMLElement | null = null

  /** 是否已初始化 */
  protected initialized = false

  /** 是否已销毁 */
  protected destroyed = false

  /** 事件监听器映射 */
  protected eventListeners: Map<string, EventListener[]> = new Map()

  /**
   * 构造函数
   * @param config 视图配置
   */
  constructor(config: ViewConfig) {
    this.config = { ...config }
  }

  /**
   * 初始化视图
   * @param context 渲染上下文
   */
  init(context: ViewRenderContext): void {
    if (this.initialized) {
      console.warn(`视图 ${this.type} 已经初始化`)
      return
    }

    this.context = context
    this.container = context.container

    // 设置容器类名
    this.container.classList.add('ldesign-calendar-view', `ldesign-calendar-${this.type}-view`)

    // 初始化视图特定逻辑
    this.onInit()

    // 绑定事件监听器
    this.bindEventListeners()

    this.initialized = true

    // 初始渲染
    this.render()
  }

  /**
   * 渲染视图
   */
  render(): void {
    console.log(`BaseView render() 被调用，视图类型: ${this.type}`)
    if (!this.initialized || this.destroyed) {
      console.warn(`视图 ${this.type} 未初始化或已销毁`)
      return
    }

    // 清空容器
    if (this.container) {
      console.log(`BaseView 清空容器，视图类型: ${this.type}`)
      this.container.innerHTML = ''
    }

    // 执行具体的渲染逻辑
    console.log(`BaseView 调用 onRender()，视图类型: ${this.type}`)
    this.onRender()
  }

  /**
   * 更新视图
   * @param events 事件列表
   */
  update(events?: CalendarEvent[]): void {
    if (!this.initialized || this.destroyed) {
      return
    }

    if (events && this.context) {
      this.context.events = events
    }

    this.onUpdate()
  }

  /**
   * 刷新视图
   */
  refresh(): void {
    this.render()
  }

  /**
   * 销毁视图
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // 移除事件监听器
    this.removeAllEventListeners()

    // 清理DOM
    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('ldesign-calendar-view', `ldesign-calendar-${this.type}-view`)
    }

    // 执行视图特定的清理逻辑
    this.onDestroy()

    this.context = null
    this.container = null
    this.destroyed = true
  }

  /**
   * 获取视图日期范围
   */
  abstract getDateRange(): { start: Date; end: Date }

  /**
   * 跳转到指定日期
   * @param date 目标日期
   */
  abstract goToDate(date: Date): void

  /**
   * 上一页
   */
  abstract prev(): void

  /**
   * 下一页
   */
  abstract next(): void

  /**
   * 获取视图中的事件
   */
  getEvents(): CalendarEvent[] {
    return this.context?.events || []
  }

  /**
   * 获取渲染上下文
   */
  getContext(): ViewRenderContext | null {
    return this.context
  }

  /**
   * 更新容器
   * @param container 新的容器元素
   */
  setContainer(container: HTMLElement): void {
    // 清理旧容器
    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('ldesign-calendar-view', `ldesign-calendar-${this.type}-view`)
    }

    // 设置新容器
    if (this.context) {
      this.context.container = container
    }
    this.container = container

    // 设置容器类名
    this.container.classList.add('ldesign-calendar-view', `ldesign-calendar-${this.type}-view`)

    // 重新渲染
    this.render()
  }

  /**
   * 获取指定位置的日期
   * @param x X坐标
   * @param y Y坐标
   */
  getDateAtPosition(_x: number, _y: number): Date | null {
    // 默认实现，子类可以重写
    return null
  }

  /**
   * 获取指定日期的位置
   * @param date 日期
   */
  getPositionForDate(_date: Date): { x: number; y: number } | null {
    // 默认实现，子类可以重写
    return null
  }

  /**
   * 处理事件点击
   * @param event 日历事件
   * @param nativeEvent 原生事件
   */
  handleEventClick(event: CalendarEvent, nativeEvent: Event): void {
    nativeEvent.preventDefault()
    nativeEvent.stopPropagation()

    // 触发事件点击回调
    this.context?.calendar.getConfig().onEventClick?.(event)
  }

  /**
   * 处理日期点击
   * @param date 日期
   * @param nativeEvent 原生事件
   */
  handleDateClick(date: Date, nativeEvent: Event): void {
    nativeEvent.preventDefault()
    nativeEvent.stopPropagation()

    // 触发日期选择回调
    this.context?.calendar.getConfig().onDateSelect?.(date)
  }

  /**
   * 处理拖拽开始
   * @param event 日历事件
   * @param nativeEvent 拖拽事件
   */
  handleDragStart(event: CalendarEvent, nativeEvent: DragEvent): void {
    if (!event.draggable) {
      nativeEvent.preventDefault()
      return
    }

    // 设置拖拽数据
    nativeEvent.dataTransfer?.setData('text/plain', event.id)

    // 触发拖拽开始回调
    this.context?.calendar.getConfig().onEventDragStart?.(event)
  }

  /**
   * 处理拖拽中
   * @param event 日历事件
   * @param nativeEvent 拖拽事件
   */
  handleDrag(_event: CalendarEvent, _nativeEvent: DragEvent): void {
    // 子类可以重写此方法
  }

  /**
   * 处理拖拽结束
   * @param event 日历事件
   * @param nativeEvent 拖拽事件
   */
  handleDragEnd(_event: CalendarEvent, _nativeEvent: DragEvent): void {
    // 子类可以重写此方法
  }

  /**
   * 添加事件监听器
   * @param element 目标元素
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  protected addEventListener(element: Element, eventType: string, listener: EventListener): void {
    element.addEventListener(eventType, listener)

    const key = `${eventType}_${element.tagName}_${Date.now()}`
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, [])
    }
    this.eventListeners.get(key)!.push(listener)
  }

  /**
   * 移除所有事件监听器
   */
  protected removeAllEventListeners(): void {
    this.eventListeners.forEach((listeners, _key) => {
      listeners.forEach(_listener => {
        // 这里需要保存元素引用才能正确移除监听器
        // 实际实现中可能需要更复杂的管理机制
      })
    })
    this.eventListeners.clear()
  }

  /**
   * 创建DOM元素
   * @param tagName 标签名
   * @param className 类名
   * @param textContent 文本内容
   */
  protected createElement(tagName: string, className?: string, textContent?: string): HTMLElement {
    const element = document.createElement(tagName)
    if (className) {
      element.className = className
    }
    if (textContent) {
      element.textContent = textContent
    }
    return element
  }

  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式
   */
  protected formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    // 简单的日期格式化实现，实际项目中可能使用dayjs等库
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
  }

  /**
   * 格式化时间
   * @param date 日期
   * @param format 格式
   */
  protected formatTime(date: Date, format: string = 'HH:mm'): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return format
      .replace('HH', hours)
      .replace('mm', minutes)
  }

  /**
   * 视图初始化钩子（子类重写）
   */
  protected onInit(): void {
    // 子类可以重写此方法
  }

  /**
   * 视图渲染钩子（子类重写）
   */
  protected abstract onRender(): void

  /**
   * 视图更新钩子（子类重写）
   */
  protected onUpdate(): void {
    // 默认重新渲染
    this.render()
  }

  /**
   * 视图销毁钩子（子类重写）
   */
  protected onDestroy(): void {
    // 子类可以重写此方法
  }

  /**
   * 绑定事件监听器（子类重写）
   */
  protected bindEventListeners(): void {
    // 子类可以重写此方法
  }
}
