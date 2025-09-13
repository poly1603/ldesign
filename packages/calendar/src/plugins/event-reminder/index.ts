/**
 * 事件提醒插件
 * 
 * 提供事件提醒功能：
 * - 提醒设置
 * - 提醒通知
 * - 提醒历史
 * - 提醒管理
 */

import type { CalendarPlugin, EventReminderPluginConfig } from '../../types/plugin'
import type { ICalendar } from '../../types/calendar'
import type { CalendarEvent } from '../../types/event'

/**
 * 提醒信息接口
 */
interface Reminder {
  id: string
  eventId: string
  minutes: number
  method: 'popup' | 'notification' | 'email'
  triggered: boolean
  createdAt: number
}

/**
 * 事件提醒管理器
 */
class EventReminderManager {
  private config: EventReminderPluginConfig
  private reminders: Map<string, Reminder[]> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private calendar: ICalendar

  constructor(calendar: ICalendar, config: EventReminderPluginConfig) {
    this.calendar = calendar
    this.config = config
    this.requestNotificationPermission()
  }

  /**
   * 请求通知权限
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (error) {
        console.warn('无法请求通知权限:', error)
      }
    }
  }

  /**
   * 添加提醒
   */
  addReminder(eventId: string, minutes: number, method: 'popup' | 'notification' | 'email' = 'popup'): string {
    const reminderId = this.generateId()
    const reminder: Reminder = {
      id: reminderId,
      eventId,
      minutes,
      method,
      triggered: false,
      createdAt: Date.now(),
    }

    if (!this.reminders.has(eventId)) {
      this.reminders.set(eventId, [])
    }

    this.reminders.get(eventId)!.push(reminder)
    this.scheduleReminder(reminder)

    return reminderId
  }

  /**
   * 移除提醒
   */
  removeReminder(eventId: string, reminderId: string): boolean {
    const eventReminders = this.reminders.get(eventId)
    if (!eventReminders) return false

    const index = eventReminders.findIndex(r => r.id === reminderId)
    if (index === -1) return false

    // 清除定时器
    const timerId = `${eventId}-${reminderId}`
    const timer = this.timers.get(timerId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(timerId)
    }

    // 移除提醒
    eventReminders.splice(index, 1)
    if (eventReminders.length === 0) {
      this.reminders.delete(eventId)
    }

    return true
  }

  /**
   * 获取事件的所有提醒
   */
  getReminders(eventId: string): Reminder[] {
    return this.reminders.get(eventId) || []
  }

  /**
   * 安排提醒
   */
  private scheduleReminder(reminder: Reminder): void {
    const event = this.getEventById(reminder.eventId)
    if (!event) return

    const eventTime = new Date(event.start).getTime()
    const reminderTime = eventTime - (reminder.minutes * 60 * 1000)
    const now = Date.now()

    if (reminderTime <= now) {
      // 如果提醒时间已过，立即触发
      this.triggerReminder(reminder)
    } else {
      // 设置定时器
      const delay = reminderTime - now
      const timerId = `${reminder.eventId}-${reminder.id}`
      const timer = setTimeout(() => {
        this.triggerReminder(reminder)
        this.timers.delete(timerId)
      }, delay)

      this.timers.set(timerId, timer)
    }
  }

  /**
   * 触发提醒
   */
  private triggerReminder(reminder: Reminder): void {
    if (reminder.triggered) return

    const event = this.getEventById(reminder.eventId)
    if (!event) return

    reminder.triggered = true

    switch (reminder.method) {
      case 'popup':
        this.showPopupReminder(event, reminder)
        break
      case 'notification':
        this.showNotificationReminder(event, reminder)
        break
      case 'email':
        this.sendEmailReminder(event, reminder)
        break
    }
  }

  /**
   * 显示弹窗提醒
   */
  private showPopupReminder(event: CalendarEvent, reminder: Reminder): void {
    const popup = document.createElement('div')
    popup.className = 'ldesign-reminder-popup'
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      max-width: 300px;
      z-index: 2000;
      animation: slideInRight 0.3s ease-out;
    `

    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <h4 style="margin: 0; color: #1890ff;">事件提醒</h4>
        <button class="close-btn" style="border: none; background: none; font-size: 18px; cursor: pointer;">&times;</button>
      </div>
      <div style="margin-bottom: 8px;">
        <strong>${event.title}</strong>
      </div>
      <div style="color: #666; font-size: 14px; margin-bottom: 8px;">
        ${this.formatEventTime(event)}
      </div>
      ${event.description ? `<div style="color: #999; font-size: 12px;">${event.description}</div>` : ''}
    `

    // 添加关闭按钮事件
    const closeBtn = popup.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.remove()
      })
    }

    // 自动关闭
    if (this.config.autoClose) {
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove()
        }
      }, this.config.autoCloseDelay || 5000)
    }

    document.body.appendChild(popup)
  }

  /**
   * 显示系统通知提醒
   */
  private showNotificationReminder(event: CalendarEvent, _reminder: Reminder): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`事件提醒: ${event.title}`, {
        body: `${this.formatEventTime(event)}${event.description ? '\n' + event.description : ''}`,
        icon: '/favicon.ico',
        tag: event.id,
      })

      // 点击通知时聚焦到日历
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // 自动关闭
      if (this.config.autoClose) {
        setTimeout(() => {
          notification.close()
        }, this.config.autoCloseDelay || 5000)
      }
    }
  }

  /**
   * 发送邮件提醒
   */
  private sendEmailReminder(_event: CalendarEvent, _reminder: Reminder): void {
    // TODO: 实现邮件提醒功能
    console.log('邮件提醒功能待实现')
  }

  /**
   * 格式化事件时间
   */
  private formatEventTime(event: CalendarEvent): string {
    const start = new Date(event.start)
    const end = new Date(event.end)

    if (event.allDay) {
      return '全天事件'
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    if (start.toDateString() === end.toDateString()) {
      return `${formatTime(start)} - ${formatTime(end)}`
    } else {
      return `${start.toLocaleDateString('zh-CN')} ${formatTime(start)} - ${end.toLocaleDateString('zh-CN')} ${formatTime(end)}`
    }
  }

  /**
   * 根据ID获取事件
   */
  private getEventById(eventId: string): CalendarEvent | null {
    // 这里需要从日历实例中获取事件
    // 假设日历有 getEvent 方法
    return (this.calendar as any).getEvent?.(eventId) || null
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  /**
   * 清理所有提醒
   */
  destroy(): void {
    // 清除所有定时器
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // 清除所有提醒
    this.reminders.clear()

    // 移除所有弹窗
    const popups = document.querySelectorAll('.ldesign-reminder-popup')
    popups.forEach(popup => popup.remove())
  }
}

/**
 * 事件提醒插件
 */
export const EventReminderPlugin: CalendarPlugin = {
  metadata: {
    name: 'event-reminder',
    version: '1.0.0',
    description: '事件提醒插件',
    author: 'ldesign',
  },

  options: {
    enabled: true,
    priority: 90,
    config: {
      defaultReminder: 15,
      methods: ['popup', 'notification'],
      autoClose: true,
      autoCloseDelay: 5000,
    } as EventReminderPluginConfig,
  },

  install(calendar: ICalendar, options?: any): void {
    console.log('事件提醒插件已安装')

    const config = { ...this.options?.config, ...options?.config } as EventReminderPluginConfig

    // 创建提醒管理器实例
    const reminderManager = new EventReminderManager(calendar, config)

      // 将提醒管理器存储到日历中
      ; (calendar as any)._reminderManager = reminderManager

    // 监听事件变化，自动设置提醒
    this.bindEventHandlers(calendar, reminderManager)
  },

  uninstall(calendar: ICalendar): void {
    console.log('事件提醒插件已卸载')

    const reminderManager = (calendar as any)._reminderManager
    if (reminderManager) {
      // 清理提醒管理器
      reminderManager.destroy()

      // 解绑事件处理器
      this.unbindEventHandlers(calendar)

      // 从日历中移除引用
      delete (calendar as any)._reminderManager
    }
  },

  /**
   * 绑定事件处理器
   */
  bindEventHandlers(calendar: ICalendar, reminderManager: EventReminderManager): void {
    // 监听事件添加，自动设置默认提醒
    const originalAddEvent = (calendar as any).addEvent
    if (originalAddEvent) {
      (calendar as any).addEvent = function (event: CalendarEvent) {
        const result = originalAddEvent.call(this, event)

        // 如果事件没有设置提醒，添加默认提醒
        if (!event.reminders || event.reminders.length === 0) {
          const config = reminderManager['config'] as EventReminderPluginConfig
          reminderManager.addReminder(event.id, config.defaultReminder || 15)
        }

        return result
      }
    }
  },

  /**
   * 解绑事件处理器
   */
  unbindEventHandlers(_calendar: ICalendar): void {
    // 这里应该恢复原始的方法
    // 为了简化，这里只是占位
  },

  api: {
    /**
     * 添加提醒
     * @param eventId 事件ID
     * @param minutes 提前分钟数
     * @param method 提醒方式
     */
    addReminder(eventId: string, minutes: number, method: 'popup' | 'notification' | 'email' = 'popup'): string {
      const calendar = this.calendar as any
      const reminderManager = calendar._reminderManager as EventReminderManager
      if (reminderManager) {
        return reminderManager.addReminder(eventId, minutes, method)
      }
      return ''
    },

    /**
     * 移除提醒
     * @param eventId 事件ID
     * @param reminderId 提醒ID
     */
    removeReminder(eventId: string, reminderId: string): boolean {
      const calendar = this.calendar as any
      const reminderManager = calendar._reminderManager as EventReminderManager
      if (reminderManager) {
        return reminderManager.removeReminder(eventId, reminderId)
      }
      return false
    },

    /**
     * 获取提醒列表
     * @param eventId 事件ID
     */
    getReminders(eventId: string): Reminder[] {
      const calendar = this.calendar as any
      const reminderManager = calendar._reminderManager as EventReminderManager
      if (reminderManager) {
        return reminderManager.getReminders(eventId)
      }
      return []
    },

    /**
     * 清除所有提醒
     */
    clearAllReminders(): void {
      const calendar = this.calendar as any
      const reminderManager = calendar._reminderManager as EventReminderManager
      if (reminderManager) {
        reminderManager.destroy()
      }
    },

    /**
     * 测试提醒功能
     * @param title 测试标题
     * @param method 提醒方式
     */
    testReminder(title: string = '测试提醒', method: 'popup' | 'notification' = 'popup'): void {
      const testEvent: CalendarEvent = {
        id: 'test-' + Date.now(),
        title,
        start: new Date(),
        end: new Date(Date.now() + 60 * 60 * 1000),
        allDay: false,
        description: '这是一个测试提醒',
      }

      const calendar = this.calendar as any
      const reminderManager = calendar._reminderManager as EventReminderManager
      if (reminderManager) {
        // 创建一个立即触发的提醒
        const reminder: Reminder = {
          id: 'test-reminder',
          eventId: testEvent.id,
          minutes: 0,
          method,
          triggered: false,
          createdAt: Date.now(),
        }

        // 直接触发提醒
        reminderManager['triggerReminder'](reminder)
      }
    },
  },
}
