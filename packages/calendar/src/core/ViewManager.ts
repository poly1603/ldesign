/**
 * 视图管理器 - 负责管理不同的日历视图
 */

import type { Dayjs } from 'dayjs'
import type { ViewType, CalendarEvent, DateCell } from '../types'
import type { Calendar } from './Calendar'
import { MonthView } from '../views/MonthView'
import { WeekView } from '../views/WeekView'
import { DayView } from '../views/DayView'
import { YearView } from '../views/YearView'
import type { BaseView } from '../views/BaseView'

/**
 * 视图管理器类
 */
export class ViewManager {
  /** 日历实例 */
  private calendar: Calendar
  /** 视图实例映射 */
  private views: Map<ViewType, BaseView> = new Map()
  /** 当前视图 */
  private currentView: BaseView | null = null
  /** 视图容器 */
  private viewContainer: HTMLElement | null = null

  constructor(calendar: Calendar) {
    this.calendar = calendar
    this.init()
  }

  /**
   * 初始化视图管理器
   */
  private init(): void {
    // 创建视图实例
    this.views.set('month', new MonthView(this.calendar))
    this.views.set('week', new WeekView(this.calendar))
    this.views.set('day', new DayView(this.calendar))
    this.views.set('year', new YearView(this.calendar))
  }

  /**
   * 渲染指定视图
   */
  public renderView(viewType: ViewType, date: Dayjs): void {
    const view = this.views.get(viewType)
    if (!view) {
      throw new Error(`Invalid view type: ${viewType}`)
    }

    // 获取视图容器
    this.viewContainer = this.getViewContainer()
    if (!this.viewContainer) {
      throw new Error('View container not found')
    }

    // 如果视图发生变化，清理当前视图
    if (this.currentView && this.currentView !== view) {
      this.currentView.destroy()
    }

    // 设置当前视图
    this.currentView = view

    // 渲染视图
    view.render(this.viewContainer, date)

    // 更新视图按钮状态
    this.updateViewButtonStates(viewType)
  }

  /**
   * 获取视图容器
   */
  private getViewContainer(): HTMLElement | null {
    const calendar = this.calendar as any
    const container = calendar.container
    if (!container) return null

    let viewContainer = container.querySelector('.ldesign-calendar-view')
    if (!viewContainer) {
      viewContainer = document.createElement('div')
      viewContainer.className = 'ldesign-calendar-view'
      container.appendChild(viewContainer)
    }

    return viewContainer as HTMLElement
  }

  /**
   * 更新视图按钮状态
   */
  private updateViewButtonStates(activeView: ViewType): void {
    const calendar = this.calendar as any
    const container = calendar.container
    if (!container) return

    const viewButtons = container.querySelectorAll('.ldesign-calendar-view-btn')
    viewButtons.forEach((button: HTMLElement) => {
      const viewType = button.dataset.view
      if (viewType === activeView) {
        button.classList.add('active')
      } else {
        button.classList.remove('active')
      }
    })
  }

  /**
   * 获取当前视图
   */
  public getCurrentView(): BaseView | null {
    return this.currentView
  }

  /**
   * 获取指定类型的视图
   */
  public getView(viewType: ViewType): BaseView | null {
    return this.views.get(viewType) || null
  }

  /**
   * 注册自定义视图
   */
  public registerView(viewType: ViewType, view: BaseView): void {
    this.views.set(viewType, view)
  }

  /**
   * 注销视图
   */
  public unregisterView(viewType: ViewType): void {
    const view = this.views.get(viewType)
    if (view) {
      view.destroy()
      this.views.delete(viewType)
    }
  }

  /**
   * 刷新当前视图
   */
  public refresh(): void {
    if (this.currentView && this.viewContainer) {
      const calendar = this.calendar as any
      this.currentView.render(this.viewContainer, calendar.getCurrentDate())
    }
  }

  /**
   * 销毁视图管理器
   */
  public destroy(): void {
    // 销毁所有视图
    for (const view of this.views.values()) {
      view.destroy()
    }
    this.views.clear()
    this.currentView = null
    this.viewContainer = null
  }
}
