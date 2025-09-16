/**
 * 提醒插件
 */

import type { CalendarPlugin, PluginContext, ReminderOptions } from './types'
import type { CalendarEvent, ReminderConfig } from '../types'
import { DateUtils } from '../utils/date'

/**
 * 提醒插件类
 */
export class ReminderPlugin implements CalendarPlugin {
  public readonly name = 'ReminderPlugin'
  public readonly version = '1.0.0'
  public readonly description = '事件提醒插件，支持多种提醒方式'
  public readonly author = 'ldesign'

  public readonly defaultOptions: ReminderOptions = {
    enabled: true,
    priority: 15,
    config: {
      defaultMinutes: [15, 30, 60],
      methods: ['popup', 'notification'],
      showNotification: true,
      checkPermission: true
    }
  }

  private context?: PluginContext
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private notificationPermission: NotificationPermission = 'default'

  /**
   * 安装插件
   */
  public install(context: PluginContext): void {
    this.context = context
    this.checkNotificationPermission()
    this.bindEvents()
  }

  /**
   * 卸载插件
   */
  public uninstall(context: PluginContext): void {
    this.clearAllReminders()
  }

  /**
   * 初始化插件
   */
  public init(context: PluginContext): void {
    this.scheduleExistingReminders()
  }

  /**
   * 销毁插件
   */
  public destroy(context: PluginContext): void {
    this.clearAllReminders()
  }

  /**
   * 事件创建后钩子
   */
  public afterEventCreate(context: PluginContext, event: CalendarEvent): void {
    this.scheduleEventReminders(event)
  }

  /**
   * 事件更新后钩子
   */
  public afterEventUpdate(context: PluginContext, event: CalendarEvent): void {
    // 清除旧的提醒
    this.clearEventReminders(event.id)
    // 重新安排提醒
    this.scheduleEventReminders(event)
  }

  /**
   * 事件删除后钩子
   */
  public afterEventDelete(context: PluginContext, eventId: string): void {
    this.clearEventReminders(eventId)
  }

  /**
   * 添加提醒
   */
  public addReminder(eventId: string, reminder: Omit<ReminderConfig, 'id'>): string {
    if (!this.context) throw new Error('Plugin not initialized')

    const event = this.context.calendar.getEventManager().getEvent(eventId)
    if (!event) {
      throw new Error(`Event with id "${eventId}" not found`)
    }

    const reminderId = `${eventId}-${Date.now()}`
    const newReminder: ReminderConfig = {
      id: reminderId,
      ...reminder
    }

    // 添加到事件的提醒列表
    if (!event.reminders) {
      event.reminders = []
    }
    event.reminders.push(newReminder)

    // 更新事件
    this.context.calendar.getEventManager().updateEvent(eventId, { reminders: event.reminders })

    // 安排提醒
    this.scheduleReminder(event, newReminder)

    return reminderId
  }

  /**
   * 移除提醒
   */
  public removeReminder(eventId: string, reminderId: string): boolean {
    if (!this.context) return false

    const event = this.context.calendar.getEventManager().getEvent(eventId)
    if (!event || !event.reminders) {
      return false
    }

    // 从事件的提醒列表中移除
    const index = event.reminders.findIndex(r => r.id === reminderId)
    if (index === -1) {
      return false
    }

    event.reminders.splice(index, 1)

    // 更新事件
    this.context.calendar.getEventManager().updateEvent(eventId, { reminders: event.reminders })

    // 清除定时器
    const timerKey = `${eventId}-${reminderId}`
    const timer = this.timers.get(timerKey)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(timerKey)
    }

    return true
  }

  /**
   * 请求通知权限
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = 'granted'
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      this.notificationPermission = 'denied'
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      this.notificationPermission = permission
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      this.notificationPermission = 'denied'
      return 'denied'
    }
  }

  /**
   * 显示通知
   */
  public showNotification(title: string, options: NotificationOptions = {}): Notification | null {
    if (!('Notification' in window) || this.notificationPermission !== 'granted') {
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // 自动关闭通知
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  /**
   * 显示弹窗提醒
   */
  public showPopupReminder(event: CalendarEvent, reminder: ReminderConfig): void {
    const message = reminder.message || `事件提醒：${event.title}`
    const startTime = DateUtils.format(event.start, 'YYYY-MM-DD HH:mm')
    
    const confirmed = confirm(
      `${message}\n\n` +
      `时间：${startTime}\n` +
      `${event.description ? `描述：${event.description}\n` : ''}` +
      `${event.location?.name ? `地点：${event.location.name}\n` : ''}\n` +
      `点击确定查看详情，取消关闭提醒。`
    )

    if (confirmed) {
      // 触发事件点击，显示详情
      this.context?.emit('event:click', event)
    }
  }

  /**
   * 播放提醒声音
   */
  public playReminderSound(soundFile?: string): void {
    try {
      const config = this.context?.options
      const audioFile = soundFile || config?.soundFile || '/notification.mp3'
      
      const audio = new Audio(audioFile)
      audio.volume = 0.5
      audio.play().catch(error => {
        console.warn('Could not play reminder sound:', error)
      })
    } catch (error) {
      console.warn('Error playing reminder sound:', error)
    }
  }

  /**
   * 安排事件提醒
   */
  private scheduleEventReminders(event: CalendarEvent): void {
    if (!event.reminders || event.reminders.length === 0) {
      return
    }

    event.reminders.forEach(reminder => {
      this.scheduleReminder(event, reminder)
    })
  }

  /**
   * 安排单个提醒
   */
  private scheduleReminder(event: CalendarEvent, reminder: ReminderConfig): void {
    if (reminder.triggered) {
      return // 已经触发过的提醒不再安排
    }

    const eventStart = DateUtils.dayjs(event.start)
    const reminderTime = eventStart.subtract(reminder.minutes, 'minute')
    const now = DateUtils.now()

    // 如果提醒时间已过，直接触发
    if (reminderTime.isBefore(now)) {
      this.triggerReminder(event, reminder)
      return
    }

    // 计算延迟时间
    const delay = reminderTime.diff(now)
    
    // 安排定时器
    const timerKey = `${event.id}-${reminder.id}`
    const timer = setTimeout(() => {
      this.triggerReminder(event, reminder)
      this.timers.delete(timerKey)
    }, delay)

    this.timers.set(timerKey, timer)
  }

  /**
   * 触发提醒
   */
  private triggerReminder(event: CalendarEvent, reminder: ReminderConfig): void {
    if (!this.context) return

    // 标记为已触发
    reminder.triggered = true
    reminder.triggerTime = new Date()

    // 更新事件
    this.context.calendar.getEventManager().updateEvent(event.id, { reminders: event.reminders })

    const config = this.context.options
    const methods = reminder.method ? [reminder.method] : (config.methods || ['popup'])

    // 执行提醒方法
    methods.forEach(method => {
      switch (method) {
        case 'popup':
          this.showPopupReminder(event, reminder)
          break
        case 'notification':
          if (config.showNotification && this.notificationPermission === 'granted') {
            const message = reminder.message || `事件提醒：${event.title}`
            const startTime = DateUtils.format(event.start, 'HH:mm')
            this.showNotification(message, {
              body: `时间：${startTime}${event.location?.name ? `\n地点：${event.location.name}` : ''}`,
              tag: `reminder-${event.id}-${reminder.id}`,
              requireInteraction: true
            })
          }
          break
        case 'sound':
          this.playReminderSound(config.soundFile)
          break
      }
    })

    // 触发提醒事件
    this.context.emit('reminder:trigger', event, reminder)
  }

  /**
   * 清除事件的所有提醒
   */
  private clearEventReminders(eventId: string): void {
    const timersToDelete: string[] = []
    
    this.timers.forEach((timer, key) => {
      if (key.startsWith(`${eventId}-`)) {
        clearTimeout(timer)
        timersToDelete.push(key)
      }
    })

    timersToDelete.forEach(key => {
      this.timers.delete(key)
    })
  }

  /**
   * 清除所有提醒
   */
  private clearAllReminders(): void {
    this.timers.forEach(timer => {
      clearTimeout(timer)
    })
    this.timers.clear()
  }

  /**
   * 安排现有事件的提醒
   */
  private scheduleExistingReminders(): void {
    if (!this.context) return

    const events = this.context.calendar.getEventManager().getAllEvents()
    events.forEach(event => {
      this.scheduleEventReminders(event)
    })
  }

  /**
   * 检查通知权限
   */
  private checkNotificationPermission(): void {
    if (!this.context) return

    const config = this.context.options
    if (!config.checkPermission || !('Notification' in window)) {
      return
    }

    this.notificationPermission = Notification.permission

    if (this.notificationPermission === 'default' && config.showNotification) {
      // 自动请求权限
      this.requestNotificationPermission()
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.context) return

    // 监听页面可见性变化，重新安排提醒
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.scheduleExistingReminders()
      }
    })

    // 监听时间变化（如系统时间调整）
    let lastTime = Date.now()
    setInterval(() => {
      const currentTime = Date.now()
      const timeDiff = Math.abs(currentTime - lastTime - 60000) // 1分钟间隔

      // 如果时间差异超过5秒，可能是系统时间被调整
      if (timeDiff > 5000) {
        this.clearAllReminders()
        this.scheduleExistingReminders()
      }

      lastTime = currentTime
    }, 60000) // 每分钟检查一次
  }
}
