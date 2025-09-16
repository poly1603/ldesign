/**
 * 高级日历功能模块
 * 包含：时区支持、重复事件异常、日历分享、多日历管理等
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarEvent, RepeatConfig } from '../types'

// 扩展 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 时区管理器
 */
export class TimezoneManager {
  private currentTimezone: string
  private availableTimezones: Map<string, string> = new Map([
    ['UTC', 'Coordinated Universal Time'],
    ['America/New_York', 'Eastern Time'],
    ['America/Chicago', 'Central Time'],
    ['America/Denver', 'Mountain Time'],
    ['America/Los_Angeles', 'Pacific Time'],
    ['Europe/London', 'British Time'],
    ['Europe/Paris', 'Central European Time'],
    ['Europe/Moscow', 'Moscow Time'],
    ['Asia/Shanghai', 'China Standard Time'],
    ['Asia/Tokyo', 'Japan Standard Time'],
    ['Asia/Dubai', 'Gulf Standard Time'],
    ['Asia/Kolkata', 'India Standard Time'],
    ['Australia/Sydney', 'Australian Eastern Time'],
    ['Pacific/Auckland', 'New Zealand Time']
  ])

  constructor(timezone?: string) {
    this.currentTimezone = timezone || dayjs.tz.guess()
  }

  /**
   * 获取当前时区
   */
  getCurrentTimezone(): string {
    return this.currentTimezone
  }

  /**
   * 设置时区
   */
  setTimezone(timezone: string): void {
    if (this.availableTimezones.has(timezone)) {
      this.currentTimezone = timezone
    } else {
      throw new Error(`Unsupported timezone: ${timezone}`)
    }
  }

  /**
   * 获取可用时区列表
   */
  getAvailableTimezones(): Map<string, string> {
    return new Map(this.availableTimezones)
  }

  /**
   * 转换事件到指定时区
   */
  convertEventToTimezone(event: CalendarEvent, timezone: string): CalendarEvent {
    const convertedStart = dayjs(event.start).tz(timezone)
    const convertedEnd = event.end ? dayjs(event.end).tz(timezone) : undefined

    return {
      ...event,
      start: convertedStart.toDate(),
      end: convertedEnd?.toDate()
    }
  }

  /**
   * 批量转换事件时区
   */
  convertEventsToTimezone(events: CalendarEvent[], timezone: string): CalendarEvent[] {
    return events.map(event => this.convertEventToTimezone(event, timezone))
  }

  /**
   * 获取时区偏移
   */
  getTimezoneOffset(timezone: string): number {
    return dayjs().tz(timezone).utcOffset()
  }

  /**
   * 格式化时区显示
   */
  formatTimezone(timezone: string): string {
    const offset = this.getTimezoneOffset(timezone)
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    const sign = offset >= 0 ? '+' : '-'
    
    return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
}

/**
 * 重复事件异常管理
 */
export interface RecurrenceException {
  date: Date
  type: 'skip' | 'modify' | 'add'
  modifiedEvent?: Partial<CalendarEvent>
}

export class RecurrenceManager {
  private exceptions: Map<string, RecurrenceException[]> = new Map()

  /**
   * 添加异常
   */
  addException(eventId: string, exception: RecurrenceException): void {
    if (!this.exceptions.has(eventId)) {
      this.exceptions.set(eventId, [])
    }
    
    const exceptions = this.exceptions.get(eventId)!
    const existingIndex = exceptions.findIndex(e => 
      dayjs(e.date).isSame(exception.date, 'day')
    )
    
    if (existingIndex >= 0) {
      exceptions[existingIndex] = exception
    } else {
      exceptions.push(exception)
    }
  }

  /**
   * 移除异常
   */
  removeException(eventId: string, date: Date): boolean {
    const exceptions = this.exceptions.get(eventId)
    if (!exceptions) return false
    
    const index = exceptions.findIndex(e => 
      dayjs(e.date).isSame(date, 'day')
    )
    
    if (index >= 0) {
      exceptions.splice(index, 1)
      return true
    }
    
    return false
  }

  /**
   * 获取事件的所有异常
   */
  getExceptions(eventId: string): RecurrenceException[] {
    return this.exceptions.get(eventId) || []
  }

  /**
   * 检查日期是否为异常
   */
  isException(eventId: string, date: Date): RecurrenceException | null {
    const exceptions = this.exceptions.get(eventId)
    if (!exceptions) return null
    
    return exceptions.find(e => 
      dayjs(e.date).isSame(date, 'day')
    ) || null
  }

  /**
   * 生成重复事件实例（考虑异常）
   */
  generateRecurringInstances(
    baseEvent: CalendarEvent,
    startDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    const instances: CalendarEvent[] = []
    
    if (!baseEvent.repeat || baseEvent.repeat.type === 'none') {
      return [baseEvent]
    }
    
    let currentDate = dayjs(baseEvent.start)
    const end = dayjs(endDate)
    let instanceCount = 0
    
    while (currentDate.isSameOrBefore(end) && instanceCount < 365) {
      const exception = this.isException(baseEvent.id, currentDate.toDate())
      
      if (exception) {
        if (exception.type === 'skip') {
          // 跳过这个实例
        } else if (exception.type === 'modify' && exception.modifiedEvent) {
          // 使用修改后的事件
          instances.push({
            ...baseEvent,
            ...exception.modifiedEvent,
            id: `${baseEvent.id}_${currentDate.format('YYYYMMDD')}`,
            start: currentDate.toDate()
          })
        } else if (exception.type === 'add') {
          // 添加额外的实例
          instances.push({
            ...baseEvent,
            id: `${baseEvent.id}_${currentDate.format('YYYYMMDD')}`,
            start: currentDate.toDate()
          })
        }
      } else if (currentDate.isSameOrAfter(dayjs(startDate))) {
        // 正常实例
        instances.push({
          ...baseEvent,
          id: `${baseEvent.id}_${currentDate.format('YYYYMMDD')}`,
          start: currentDate.toDate()
        })
      }
      
      // 计算下一个重复日期
      currentDate = this.getNextRecurrenceDate(currentDate, baseEvent.repeat)
      instanceCount++
    }
    
    return instances
  }

  /**
   * 获取下一个重复日期
   */
  private getNextRecurrenceDate(current: dayjs.Dayjs, repeat: RepeatConfig): dayjs.Dayjs {
    const interval = repeat.interval || 1
    
    switch (repeat.type) {
      case 'daily':
        return current.add(interval, 'day')
      case 'weekly':
        return current.add(interval, 'week')
      case 'monthly':
        return current.add(interval, 'month')
      case 'yearly':
        return current.add(interval, 'year')
      default:
        return current.add(1, 'day')
    }
  }
}

/**
 * 日历分享管理器
 */
export interface ShareSettings {
  shareId: string
  calendarId: string
  permissions: 'view' | 'edit' | 'admin'
  expiresAt?: Date
  password?: string
  publicUrl?: string
}

export class CalendarSharingManager {
  private shares: Map<string, ShareSettings> = new Map()

  /**
   * 创建分享链接
   */
  createShareLink(
    calendarId: string,
    permissions: 'view' | 'edit' | 'admin' = 'view',
    options?: {
      expiresAt?: Date
      password?: string
    }
  ): ShareSettings {
    const shareId = this.generateShareId()
    const publicUrl = this.generatePublicUrl(shareId)
    
    const shareSettings: ShareSettings = {
      shareId,
      calendarId,
      permissions,
      expiresAt: options?.expiresAt,
      password: options?.password,
      publicUrl
    }
    
    this.shares.set(shareId, shareSettings)
    return shareSettings
  }

  /**
   * 撤销分享
   */
  revokeShare(shareId: string): boolean {
    return this.shares.delete(shareId)
  }

  /**
   * 获取分享设置
   */
  getShareSettings(shareId: string): ShareSettings | null {
    const settings = this.shares.get(shareId)
    
    if (settings) {
      // 检查是否过期
      if (settings.expiresAt && dayjs().isAfter(settings.expiresAt)) {
        this.shares.delete(shareId)
        return null
      }
      return settings
    }
    
    return null
  }

  /**
   * 验证分享访问
   */
  validateAccess(shareId: string, password?: string): boolean {
    const settings = this.getShareSettings(shareId)
    
    if (!settings) return false
    
    if (settings.password && settings.password !== password) {
      return false
    }
    
    return true
  }

  /**
   * 更新分享权限
   */
  updatePermissions(shareId: string, permissions: 'view' | 'edit' | 'admin'): boolean {
    const settings = this.shares.get(shareId)
    
    if (settings) {
      settings.permissions = permissions
      return true
    }
    
    return false
  }

  /**
   * 生成分享ID
   */
  private generateShareId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * 生成公开URL
   */
  private generatePublicUrl(shareId: string): string {
    // 在实际应用中，这应该是真实的域名
    return `https://calendar.example.com/share/${shareId}`
  }

  /**
   * 导出分享配置
   */
  exportShareConfig(shareId: string): string | null {
    const settings = this.getShareSettings(shareId)
    
    if (!settings) return null
    
    return JSON.stringify({
      shareId: settings.shareId,
      publicUrl: settings.publicUrl,
      permissions: settings.permissions,
      expiresAt: settings.expiresAt,
      requiresPassword: !!settings.password
    })
  }
}

/**
 * 多日历管理器
 */
export interface CalendarInfo {
  id: string
  name: string
  description?: string
  color: string
  isVisible: boolean
  isDefault?: boolean
  owner?: string
  shared?: boolean
  permissions?: 'owner' | 'editor' | 'viewer'
}

export class MultiCalendarManager {
  private calendars: Map<string, CalendarInfo> = new Map()
  private eventCalendarMap: Map<string, string> = new Map() // eventId -> calendarId
  private activeCalendars: Set<string> = new Set()

  /**
   * 创建日历
   */
  createCalendar(info: Omit<CalendarInfo, 'id'>): CalendarInfo {
    const id = this.generateCalendarId()
    const calendar: CalendarInfo = {
      id,
      ...info
    }
    
    this.calendars.set(id, calendar)
    
    if (calendar.isVisible) {
      this.activeCalendars.add(id)
    }
    
    if (calendar.isDefault) {
      // 确保只有一个默认日历
      this.calendars.forEach((cal, calId) => {
        if (calId !== id) {
          cal.isDefault = false
        }
      })
    }
    
    return calendar
  }

  /**
   * 删除日历
   */
  deleteCalendar(calendarId: string): boolean {
    const calendar = this.calendars.get(calendarId)
    
    if (calendar?.isDefault) {
      throw new Error('Cannot delete default calendar')
    }
    
    // 移除关联的事件映射
    const eventsToRemove: string[] = []
    this.eventCalendarMap.forEach((calId, eventId) => {
      if (calId === calendarId) {
        eventsToRemove.push(eventId)
      }
    })
    
    eventsToRemove.forEach(eventId => {
      this.eventCalendarMap.delete(eventId)
    })
    
    this.activeCalendars.delete(calendarId)
    return this.calendars.delete(calendarId)
  }

  /**
   * 更新日历信息
   */
  updateCalendar(calendarId: string, updates: Partial<CalendarInfo>): boolean {
    const calendar = this.calendars.get(calendarId)
    
    if (!calendar) return false
    
    Object.assign(calendar, updates)
    
    if (updates.isVisible !== undefined) {
      if (updates.isVisible) {
        this.activeCalendars.add(calendarId)
      } else {
        this.activeCalendars.delete(calendarId)
      }
    }
    
    return true
  }

  /**
   * 获取日历信息
   */
  getCalendar(calendarId: string): CalendarInfo | null {
    return this.calendars.get(calendarId) || null
  }

  /**
   * 获取所有日历
   */
  getAllCalendars(): CalendarInfo[] {
    return Array.from(this.calendars.values())
  }

  /**
   * 获取活动日历
   */
  getActiveCalendars(): CalendarInfo[] {
    return Array.from(this.activeCalendars)
      .map(id => this.calendars.get(id))
      .filter(cal => cal !== undefined) as CalendarInfo[]
  }

  /**
   * 关联事件到日历
   */
  assignEventToCalendar(eventId: string, calendarId: string): boolean {
    if (!this.calendars.has(calendarId)) {
      return false
    }
    
    this.eventCalendarMap.set(eventId, calendarId)
    return true
  }

  /**
   * 获取事件所属日历
   */
  getEventCalendar(eventId: string): string | null {
    return this.eventCalendarMap.get(eventId) || null
  }

  /**
   * 获取日历的所有事件
   */
  getCalendarEvents(calendarId: string): string[] {
    const events: string[] = []
    
    this.eventCalendarMap.forEach((calId, eventId) => {
      if (calId === calendarId) {
        events.push(eventId)
      }
    })
    
    return events
  }

  /**
   * 移动事件到另一个日历
   */
  moveEventToCalendar(eventId: string, targetCalendarId: string): boolean {
    if (!this.calendars.has(targetCalendarId)) {
      return false
    }
    
    this.eventCalendarMap.set(eventId, targetCalendarId)
    return true
  }

  /**
   * 切换日历可见性
   */
  toggleCalendarVisibility(calendarId: string): boolean {
    const calendar = this.calendars.get(calendarId)
    
    if (!calendar) return false
    
    calendar.isVisible = !calendar.isVisible
    
    if (calendar.isVisible) {
      this.activeCalendars.add(calendarId)
    } else {
      this.activeCalendars.delete(calendarId)
    }
    
    return true
  }

  /**
   * 获取默认日历
   */
  getDefaultCalendar(): CalendarInfo | null {
    for (const calendar of this.calendars.values()) {
      if (calendar.isDefault) {
        return calendar
      }
    }
    
    // 如果没有默认日历，返回第一个
    const firstCalendar = this.calendars.values().next().value
    return firstCalendar || null
  }

  /**
   * 设置默认日历
   */
  setDefaultCalendar(calendarId: string): boolean {
    const calendar = this.calendars.get(calendarId)
    
    if (!calendar) return false
    
    // 清除其他日历的默认状态
    this.calendars.forEach(cal => {
      cal.isDefault = false
    })
    
    calendar.isDefault = true
    return true
  }

  /**
   * 生成日历ID
   */
  private generateCalendarId(): string {
    return `cal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 导出日历配置
   */
  exportConfiguration(): string {
    const config = {
      calendars: Array.from(this.calendars.entries()),
      eventCalendarMap: Array.from(this.eventCalendarMap.entries()),
      activeCalendars: Array.from(this.activeCalendars)
    }
    
    return JSON.stringify(config, null, 2)
  }

  /**
   * 导入日历配置
   */
  importConfiguration(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson)
      
      this.calendars = new Map(config.calendars)
      this.eventCalendarMap = new Map(config.eventCalendarMap)
      this.activeCalendars = new Set(config.activeCalendars)
      
      return true
    } catch (error) {
      console.error('Failed to import configuration:', error)
      return false
    }
  }
}

/**
 * 导入导出增强管理器
 */
export class EnhancedImportExportManager {
  /**
   * 导出为iCalendar格式（增强版）
   */
  exportToICalendar(events: CalendarEvent[], options?: {
    includeAlarms?: boolean
    includeAttachments?: boolean
    timezone?: string
  }): string {
    let ical = 'BEGIN:VCALENDAR\r\n'
    ical += 'VERSION:2.0\r\n'
    ical += 'PRODID:-//LDesign//Calendar//EN\r\n'
    ical += 'CALSCALE:GREGORIAN\r\n'
    
    if (options?.timezone) {
      ical += `X-WR-TIMEZONE:${options.timezone}\r\n`
    }
    
    events.forEach(event => {
      ical += 'BEGIN:VEVENT\r\n'
      ical += `UID:${event.id}\r\n`
      ical += `SUMMARY:${this.escapeICalText(event.title)}\r\n`
      ical += `DTSTART:${this.formatICalDate(event.start)}\r\n`
      ical += `DTEND:${this.formatICalDate(event.end || event.start)}\r\n`
      
      if (event.description) {
        ical += `DESCRIPTION:${this.escapeICalText(event.description)}\r\n`
      }
      
      if (event.category) {
        ical += `CATEGORIES:${event.category}\r\n`
      }
      
      if (event.repeat && event.repeat.type !== 'none') {
        ical += `RRULE:${this.formatRecurrenceRule(event.repeat)}\r\n`
      }
      
      if (event.status) {
        ical += `STATUS:${event.status.toUpperCase()}\r\n`
      }
      
      if (event.priority) {
        const priorityMap = { low: 9, medium: 5, high: 1 }
        ical += `PRIORITY:${priorityMap[event.priority]}\r\n`
      }
      
      if (options?.includeAlarms && event.reminders) {
        event.reminders.forEach(reminder => {
          ical += 'BEGIN:VALARM\r\n'
          ical += 'ACTION:DISPLAY\r\n'
          ical += `TRIGGER:-PT${reminder.minutes}M\r\n`
          ical += `DESCRIPTION:${reminder.message || event.title}\r\n`
          ical += 'END:VALARM\r\n'
        })
      }
      
      ical += 'END:VEVENT\r\n'
    })
    
    ical += 'END:VCALENDAR\r\n'
    return ical
  }

  /**
   * 导出为Google Calendar CSV格式
   */
  exportToGoogleCalendarCSV(events: CalendarEvent[]): string {
    const headers = [
      'Subject',
      'Start Date',
      'Start Time',
      'End Date',
      'End Time',
      'All Day Event',
      'Description',
      'Location',
      'Private'
    ]
    
    let csv = headers.join(',') + '\n'
    
    events.forEach(event => {
      const start = dayjs(event.start)
      const end = dayjs(event.end || event.start)
      
      const row = [
        `"${event.title}"`,
        start.format('MM/DD/YYYY'),
        event.allDay ? '' : start.format('HH:mm:ss'),
        end.format('MM/DD/YYYY'),
        event.allDay ? '' : end.format('HH:mm:ss'),
        event.allDay ? 'TRUE' : 'FALSE',
        `"${event.description || ''}"`,
        '""', // Location
        'FALSE' // Private
      ]
      
      csv += row.join(',') + '\n'
    })
    
    return csv
  }

  /**
   * 导出为Outlook CSV格式
   */
  exportToOutlookCSV(events: CalendarEvent[]): string {
    const headers = [
      'Subject',
      'Start Date',
      'Start Time',
      'End Date',
      'End Time',
      'All day event',
      'Description',
      'Categories',
      'Show time as'
    ]
    
    let csv = headers.join(',') + '\n'
    
    events.forEach(event => {
      const start = dayjs(event.start)
      const end = dayjs(event.end || event.start)
      
      const row = [
        `"${event.title}"`,
        start.format('YYYY/MM/DD'),
        event.allDay ? '' : start.format('HH:mm'),
        end.format('YYYY/MM/DD'),
        event.allDay ? '' : end.format('HH:mm'),
        event.allDay ? 'TRUE' : 'FALSE',
        `"${event.description || ''}"`,
        `"${event.category || ''}"`,
        '2' // Busy
      ]
      
      csv += row.join(',') + '\n'
    })
    
    return csv
  }

  /**
   * 转义iCal文本
   */
  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
  }

  /**
   * 格式化iCal日期
   */
  private formatICalDate(date: Date): string {
    return dayjs(date).format('YYYYMMDDTHHmmss')
  }

  /**
   * 格式化重复规则
   */
  private formatRecurrenceRule(repeat: RepeatConfig): string {
    let rrule = `FREQ=${repeat.type.toUpperCase()}`
    
    if (repeat.interval && repeat.interval > 1) {
      rrule += `;INTERVAL=${repeat.interval}`
    }
    
    if (repeat.count) {
      rrule += `;COUNT=${repeat.count}`
    }
    
    if (repeat.until) {
      rrule += `;UNTIL=${this.formatICalDate(repeat.until)}`
    }
    
    if (repeat.byWeekday && repeat.byWeekday.length > 0) {
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
      const days = repeat.byWeekday.map(d => weekdays[d]).join(',')
      rrule += `;BYDAY=${days}`
    }
    
    if (repeat.byMonthday && repeat.byMonthday.length > 0) {
      rrule += `;BYMONTHDAY=${repeat.byMonthday.join(',')}`
    }
    
    if (repeat.byMonth && repeat.byMonth.length > 0) {
      rrule += `;BYMONTH=${repeat.byMonth.join(',')}`
    }
    
    return rrule
  }
}

export default {
  TimezoneManager,
  RecurrenceManager,
  CalendarSharingManager,
  MultiCalendarManager,
  EnhancedImportExportManager
}