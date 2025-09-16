/**
 * 导出插件
 */

import type { CalendarPlugin, PluginContext, ExportOptions } from './types'
import type { CalendarEvent } from '../types'
import { DateUtils } from '../utils/date'

/**
 * 导出插件类
 */
export class ExportPlugin implements CalendarPlugin {
  public readonly name = 'ExportPlugin'
  public readonly version = '1.0.0'
  public readonly description = '事件导出插件，支持多种格式导出'
  public readonly author = 'ldesign'

  public readonly defaultOptions: ExportOptions = {
    enabled: true,
    priority: 5,
    config: {
      formats: ['json', 'ical', 'csv'],
      defaultFilename: 'calendar-events',
      includePrivate: false,
      dateRange: {}
    }
  }

  private context?: PluginContext

  /**
   * 安装插件
   */
  public install(context: PluginContext): void {
    this.context = context
    this.addExportMethods()
  }

  /**
   * 卸载插件
   */
  public uninstall(context: PluginContext): void {
    // 清理导出方法
  }

  /**
   * 导出为JSON格式
   */
  public exportToJSON(events: CalendarEvent[], options: Partial<ExportOptions['config']> = {}): string {
    const config = { ...this.context?.options, ...options }
    
    // 过滤事件
    const filteredEvents = this.filterEvents(events, config)
    
    // 转换为导出格式
    const exportData = {
      version: '1.0',
      generator: '@ldesign/calendar',
      exportDate: new Date().toISOString(),
      events: filteredEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: DateUtils.format(event.start, 'YYYY-MM-DDTHH:mm:ss'),
        end: event.end ? DateUtils.format(event.end, 'YYYY-MM-DDTHH:mm:ss') : null,
        allDay: event.allDay || false,
        description: event.description || '',
        category: event.category || '',
        priority: event.priority || 'medium',
        status: event.status || 'confirmed',
        location: event.location,
        attendees: event.attendees || [],
        reminders: event.reminders || [],
        repeat: event.repeat,
        tags: event.tags || [],
        color: event.color,
        private: event.private || false,
        createdAt: event.createdAt?.toISOString(),
        updatedAt: event.updatedAt?.toISOString()
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导出为iCal格式
   */
  public exportToICal(events: CalendarEvent[], options: Partial<ExportOptions['config']> = {}): string {
    const config = { ...this.context?.options, ...options }
    
    // 过滤事件
    const filteredEvents = this.filterEvents(events, config)
    
    const lines: string[] = []
    
    // iCal头部
    lines.push('BEGIN:VCALENDAR')
    lines.push('VERSION:2.0')
    lines.push('PRODID:-//LDesign//Calendar//EN')
    lines.push('CALSCALE:GREGORIAN')
    lines.push('METHOD:PUBLISH')
    
    // 添加事件
    filteredEvents.forEach(event => {
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${event.id}@ldesign-calendar`)
      lines.push(`SUMMARY:${this.escapeICalText(event.title)}`)
      
      if (event.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${DateUtils.format(event.start, 'YYYYMMDD')}`)
        if (event.end) {
          // 全天事件的结束日期需要加一天
          const endDate = DateUtils.dayjs(event.end).add(1, 'day')
          lines.push(`DTEND;VALUE=DATE:${DateUtils.format(endDate, 'YYYYMMDD')}`)
        }
      } else {
        lines.push(`DTSTART:${DateUtils.format(event.start, 'YYYYMMDDTHHmmss')}Z`)
        if (event.end) {
          lines.push(`DTEND:${DateUtils.format(event.end, 'YYYYMMDDTHHmmss')}Z`)
        }
      }
      
      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeICalText(event.description)}`)
      }
      
      if (event.location?.name) {
        lines.push(`LOCATION:${this.escapeICalText(event.location.name)}`)
      }
      
      if (event.category) {
        lines.push(`CATEGORIES:${this.escapeICalText(event.category)}`)
      }
      
      // 状态映射
      const statusMap: Record<string, string> = {
        confirmed: 'CONFIRMED',
        tentative: 'TENTATIVE',
        cancelled: 'CANCELLED'
      }
      if (event.status && statusMap[event.status]) {
        lines.push(`STATUS:${statusMap[event.status]}`)
      }
      
      // 优先级映射
      const priorityMap: Record<string, string> = {
        low: '9',
        medium: '5',
        high: '1'
      }
      if (event.priority && priorityMap[event.priority]) {
        lines.push(`PRIORITY:${priorityMap[event.priority]}`)
      }
      
      // 创建和修改时间
      if (event.createdAt) {
        lines.push(`CREATED:${DateUtils.format(event.createdAt, 'YYYYMMDDTHHmmss')}Z`)
      }
      if (event.updatedAt) {
        lines.push(`LAST-MODIFIED:${DateUtils.format(event.updatedAt, 'YYYYMMDDTHHmmss')}Z`)
      }
      
      // 重复规则
      if (event.repeat && event.repeat.type !== 'none') {
        const rrule = this.buildRRule(event.repeat)
        if (rrule) {
          lines.push(`RRULE:${rrule}`)
        }
      }
      
      // 提醒
      if (event.reminders && event.reminders.length > 0) {
        event.reminders.forEach(reminder => {
          lines.push('BEGIN:VALARM')
          lines.push('ACTION:DISPLAY')
          lines.push(`DESCRIPTION:${this.escapeICalText(reminder.message || event.title)}`)
          lines.push(`TRIGGER:-PT${reminder.minutes}M`)
          lines.push('END:VALARM')
        })
      }
      
      lines.push('END:VEVENT')
    })
    
    // iCal尾部
    lines.push('END:VCALENDAR')
    
    return lines.join('\r\n')
  }

  /**
   * 导出为CSV格式
   */
  public exportToCSV(events: CalendarEvent[], options: Partial<ExportOptions['config']> = {}): string {
    const config = { ...this.context?.options, ...options }
    
    // 过滤事件
    const filteredEvents = this.filterEvents(events, config)
    
    const headers = [
      'ID',
      '标题',
      '开始时间',
      '结束时间',
      '全天',
      '描述',
      '分类',
      '优先级',
      '状态',
      '位置',
      '标签',
      '颜色',
      '私有',
      '创建时间',
      '更新时间'
    ]
    
    const rows = filteredEvents.map(event => [
      event.id,
      this.escapeCSVField(event.title),
      DateUtils.format(event.start, 'YYYY-MM-DD HH:mm:ss'),
      event.end ? DateUtils.format(event.end, 'YYYY-MM-DD HH:mm:ss') : '',
      event.allDay ? '是' : '否',
      this.escapeCSVField(event.description || ''),
      this.escapeCSVField(event.category || ''),
      event.priority || '',
      event.status || '',
      this.escapeCSVField(event.location?.name || ''),
      this.escapeCSVField((event.tags || []).join(', ')),
      event.color || '',
      event.private ? '是' : '否',
      event.createdAt ? DateUtils.format(event.createdAt, 'YYYY-MM-DD HH:mm:ss') : '',
      event.updatedAt ? DateUtils.format(event.updatedAt, 'YYYY-MM-DD HH:mm:ss') : ''
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
    
    return csvContent
  }

  /**
   * 下载文件
   */
  public downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * 导出事件
   */
  public exportEvents(format: 'json' | 'ical' | 'csv', events?: CalendarEvent[], options: Partial<ExportOptions['config']> = {}): void {
    if (!this.context) return

    this.context.emit('export:start', format)

    try {
      // 获取事件
      const eventsToExport = events || this.context.calendar.getEventManager().getAllEvents()
      
      let content: string
      let filename: string
      let mimeType: string

      const config = { ...this.context.options, ...options }
      const baseFilename = config.defaultFilename || 'calendar-events'
      const timestamp = DateUtils.format(new Date(), 'YYYY-MM-DD')

      switch (format) {
        case 'json':
          content = this.exportToJSON(eventsToExport, config)
          filename = `${baseFilename}-${timestamp}.json`
          mimeType = 'application/json'
          break
        case 'ical':
          content = this.exportToICal(eventsToExport, config)
          filename = `${baseFilename}-${timestamp}.ics`
          mimeType = 'text/calendar'
          break
        case 'csv':
          content = this.exportToCSV(eventsToExport, config)
          filename = `${baseFilename}-${timestamp}.csv`
          mimeType = 'text/csv'
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      this.downloadFile(content, filename, mimeType)
      this.context.emit('export:complete', format, { filename, size: content.length })
    } catch (error) {
      console.error('Export failed:', error)
      this.context.emit('export:error', format, error)
    }
  }

  /**
   * 过滤事件
   */
  private filterEvents(events: CalendarEvent[], config: any): CalendarEvent[] {
    let filtered = [...events]

    // 过滤私有事件
    if (!config.includePrivate) {
      filtered = filtered.filter(event => !event.private)
    }

    // 过滤日期范围
    if (config.dateRange?.start || config.dateRange?.end) {
      filtered = filtered.filter(event => {
        const eventStart = DateUtils.dayjs(event.start)
        const eventEnd = event.end ? DateUtils.dayjs(event.end) : eventStart

        if (config.dateRange.start) {
          const rangeStart = DateUtils.dayjs(config.dateRange.start)
          if (eventEnd.isBefore(rangeStart)) return false
        }

        if (config.dateRange.end) {
          const rangeEnd = DateUtils.dayjs(config.dateRange.end)
          if (eventStart.isAfter(rangeEnd)) return false
        }

        return true
      })
    }

    return filtered
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
   * 转义CSV字段
   */
  private escapeCSVField(text: string): string {
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  /**
   * 构建重复规则
   */
  private buildRRule(repeat: any): string | null {
    const parts: string[] = []

    switch (repeat.type) {
      case 'daily':
        parts.push('FREQ=DAILY')
        if (repeat.interval && repeat.interval > 1) {
          parts.push(`INTERVAL=${repeat.interval}`)
        }
        break
      case 'weekly':
        parts.push('FREQ=WEEKLY')
        if (repeat.interval && repeat.interval > 1) {
          parts.push(`INTERVAL=${repeat.interval}`)
        }
        if (repeat.byWeekday && repeat.byWeekday.length > 0) {
          const weekdays = repeat.byWeekday.map((day: number) => {
            const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
            return dayMap[day]
          }).join(',')
          parts.push(`BYDAY=${weekdays}`)
        }
        break
      case 'monthly':
        parts.push('FREQ=MONTHLY')
        if (repeat.interval && repeat.interval > 1) {
          parts.push(`INTERVAL=${repeat.interval}`)
        }
        if (repeat.byMonthday && repeat.byMonthday.length > 0) {
          parts.push(`BYMONTHDAY=${repeat.byMonthday.join(',')}`)
        }
        break
      case 'yearly':
        parts.push('FREQ=YEARLY')
        if (repeat.interval && repeat.interval > 1) {
          parts.push(`INTERVAL=${repeat.interval}`)
        }
        if (repeat.byMonth && repeat.byMonth.length > 0) {
          parts.push(`BYMONTH=${repeat.byMonth.join(',')}`)
        }
        break
      default:
        return null
    }

    // 结束条件
    if (repeat.until) {
      parts.push(`UNTIL=${DateUtils.format(repeat.until, 'YYYYMMDDTHHmmss')}Z`)
    } else if (repeat.count) {
      parts.push(`COUNT=${repeat.count}`)
    }

    return parts.join(';')
  }

  /**
   * 添加导出方法到日历实例
   */
  private addExportMethods(): void {
    if (!this.context) return

    // 添加导出方法到日历实例
    const calendar = this.context.calendar as any
    
    calendar.exportToJSON = (events?: CalendarEvent[], options?: any) => {
      return this.exportToJSON(events || calendar.getEventManager().getAllEvents(), options)
    }
    
    calendar.exportToICal = (events?: CalendarEvent[], options?: any) => {
      return this.exportToICal(events || calendar.getEventManager().getAllEvents(), options)
    }
    
    calendar.exportToCSV = (events?: CalendarEvent[], options?: any) => {
      return this.exportToCSV(events || calendar.getEventManager().getAllEvents(), options)
    }
    
    calendar.exportEvents = (format: string, events?: CalendarEvent[], options?: any) => {
      this.exportEvents(format as any, events, options)
    }
  }
}
