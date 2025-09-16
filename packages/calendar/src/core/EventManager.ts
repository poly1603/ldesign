/**
 * 事件管理器 - 负责日历事件的增删改查和管理
 */

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type {
  CalendarEvent,
  RepeatConfig,
  ReminderConfig,
  DateInput,
  EventCreateCallback,
  EventUpdateCallback,
  EventDeleteCallback
} from '../types'
import { DateUtils } from '../utils/date'

/**
 * 事件管理器类
 */
export class EventManager {
  /** 事件存储 */
  private events: Map<string, CalendarEvent> = new Map()
  /** 重复事件缓存 */
  private repeatEventCache: Map<string, CalendarEvent[]> = new Map()
  /** 事件监听器 */
  private listeners: Map<string, Function[]> = new Map()
  /** 自动ID计数器 */
  private autoIdCounter = 1

  constructor() {
    this.init()
  }

  /**
   * 初始化事件管理器
   */
  private init(): void {
    // 可以在这里初始化一些默认配置
  }

  /**
   * 添加事件
   */
  public addEvent(event: Partial<CalendarEvent>): CalendarEvent {
    // 生成ID（如果没有提供）
    if (!event.id) {
      event.id = this.generateId()
    }

    // 验证必需字段
    if (!event.title || !event.start) {
      throw new Error('Event must have title and start date')
    }

    // 创建完整的事件对象
    const fullEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end || event.start,
      allDay: event.allDay || false,
      description: event.description || '',
      color: event.color || '#1890ff',
      backgroundColor: event.backgroundColor || event.color || '#1890ff',
      borderColor: event.borderColor || event.color || '#1890ff',
      textColor: event.textColor || '#ffffff',
      category: event.category || 'default',
      priority: event.priority || 'medium',
      status: event.status || 'confirmed',
      repeat: event.repeat,
      reminders: event.reminders || [],
      data: event.data || {},
      editable: event.editable !== false,
      draggable: event.draggable !== false,
      resizable: event.resizable !== false
    }

    // 验证日期
    this.validateEventDates(fullEvent)

    // 存储事件
    this.events.set(fullEvent.id, fullEvent)

    // 如果是重复事件，清除缓存
    if (fullEvent.repeat && fullEvent.repeat.type !== 'none') {
      this.clearRepeatEventCache(fullEvent.id)
    }

    this.emit('event:add', fullEvent)
    return fullEvent
  }

  /**
   * 更新事件
   */
  public updateEvent(id: string, changes: Partial<CalendarEvent>): CalendarEvent | null {
    const event = this.events.get(id)
    if (!event) {
      return null
    }

    // 创建更新后的事件
    const updatedEvent: CalendarEvent = {
      ...event,
      ...changes,
      id // 确保ID不被修改
    }

    // 验证日期
    this.validateEventDates(updatedEvent)

    // 更新存储
    this.events.set(id, updatedEvent)

    // 如果是重复事件，清除缓存
    if (updatedEvent.repeat && updatedEvent.repeat.type !== 'none') {
      this.clearRepeatEventCache(id)
    }

    this.emit('event:update', updatedEvent, changes)
    return updatedEvent
  }

  /**
   * 删除事件
   */
  public deleteEvent(id: string): boolean {
    const event = this.events.get(id)
    if (!event) {
      return false
    }

    this.events.delete(id)
    this.clearRepeatEventCache(id)

    this.emit('event:delete', id)
    return true
  }

  /**
   * 获取事件
   */
  public getEvent(id: string): CalendarEvent | null {
    return this.events.get(id) || null
  }

  /**
   * 获取所有事件
   */
  public getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values())
  }

  /**
   * 获取指定日期范围内的事件
   */
  public getEventsInRange(start: DateInput, end: DateInput): CalendarEvent[] {
    const startDate = dayjs(start).startOf('day')
    const endDate = dayjs(end).endOf('day')
    const events: CalendarEvent[] = []

    for (const event of this.events.values()) {
      // 获取事件的所有实例（包括重复事件）
      const eventInstances = this.getEventInstances(event, startDate, endDate)
      events.push(...eventInstances)
    }

    // 按开始时间排序
    return events.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
  }

  /**
   * 获取指定日期的事件
   */
  public getEventsForDate(date: DateInput): CalendarEvent[] {
    const targetDate = dayjs(date)
    const startOfDay = targetDate.startOf('day')
    const endOfDay = targetDate.endOf('day')

    return this.getEventsInRange(startOfDay, endOfDay)
  }

  /**
   * 搜索事件
   */
  public searchEvents(query: string): CalendarEvent[] {
    const lowerQuery = query.toLowerCase()
    const results: CalendarEvent[] = []

    for (const event of this.events.values()) {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(event)
      }
    }

    return results
  }

  /**
   * 获取事件实例（处理重复事件）
   */
  private getEventInstances(event: CalendarEvent, rangeStart: Dayjs, rangeEnd: Dayjs): CalendarEvent[] {
    // 如果不是重复事件，直接检查是否在范围内
    if (!event.repeat || event.repeat.type === 'none') {
      const eventStart = dayjs(event.start)
      const eventEnd = dayjs(event.end || event.start)

      if (this.isEventInRange(eventStart, eventEnd, rangeStart, rangeEnd)) {
        return [event]
      }
      return []
    }

    // 处理重复事件
    return this.generateRepeatEventInstances(event, rangeStart, rangeEnd)
  }

  /**
   * 生成重复事件实例
   */
  private generateRepeatEventInstances(event: CalendarEvent, rangeStart: Dayjs, rangeEnd: Dayjs): CalendarEvent[] {
    const cacheKey = `${event.id}_${rangeStart.format('YYYY-MM-DD')}_${rangeEnd.format('YYYY-MM-DD')}`
    
    // 检查缓存
    if (this.repeatEventCache.has(cacheKey)) {
      return this.repeatEventCache.get(cacheKey)!
    }

    const instances: CalendarEvent[] = []
    const repeat = event.repeat!
    const eventStart = dayjs(event.start)
    const eventEnd = dayjs(event.end || event.start)
    const duration = eventEnd.diff(eventStart)

    let currentDate = eventStart
    let count = 0
    const maxCount = repeat.count || 1000 // 防止无限循环
    const until = repeat.until ? dayjs(repeat.until) : rangeEnd.add(1, 'year')

    while (currentDate.isBefore(until) && count < maxCount) {
      // 检查当前日期是否在范围内
      if (this.isEventInRange(currentDate, currentDate.add(duration), rangeStart, rangeEnd)) {
        // 创建事件实例
        const instance: CalendarEvent = {
          ...event,
          id: `${event.id}_${currentDate.format('YYYY-MM-DD')}`,
          start: currentDate.toDate(),
          end: currentDate.add(duration).toDate()
        }
        instances.push(instance)
      }

      // 计算下一个重复日期
      currentDate = this.getNextRepeatDate(currentDate, repeat)
      count++

      // 如果超出范围，停止生成
      if (currentDate.isAfter(rangeEnd)) {
        break
      }
    }

    // 缓存结果
    this.repeatEventCache.set(cacheKey, instances)
    return instances
  }

  /**
   * 获取下一个重复日期
   */
  private getNextRepeatDate(currentDate: Dayjs, repeat: RepeatConfig): Dayjs {
    const interval = repeat.interval || 1

    switch (repeat.type) {
      case 'daily':
        return currentDate.add(interval, 'day')
      
      case 'weekly':
        if (repeat.byWeekday && repeat.byWeekday.length > 0) {
          // 按指定星期重复
          const currentWeekday = currentDate.day()
          const nextWeekday = repeat.byWeekday.find(day => day > currentWeekday)
          
          if (nextWeekday !== undefined) {
            return currentDate.day(nextWeekday)
          } else {
            // 下一周的第一个指定星期
            return currentDate.add(interval, 'week').day(repeat.byWeekday[0])
          }
        }
        return currentDate.add(interval, 'week')
      
      case 'monthly':
        if (repeat.byMonthday && repeat.byMonthday.length > 0) {
          // 按指定日期重复
          const currentDay = currentDate.date()
          const nextDay = repeat.byMonthday.find(day => day > currentDay)
          
          if (nextDay !== undefined) {
            return currentDate.date(nextDay)
          } else {
            // 下个月的第一个指定日期
            return currentDate.add(interval, 'month').date(repeat.byMonthday[0])
          }
        }
        return currentDate.add(interval, 'month')
      
      case 'yearly':
        if (repeat.byMonth && repeat.byMonth.length > 0) {
          // 按指定月份重复
          const currentMonth = currentDate.month() + 1
          const nextMonth = repeat.byMonth.find(month => month > currentMonth)
          
          if (nextMonth !== undefined) {
            return currentDate.month(nextMonth - 1)
          } else {
            // 下一年的第一个指定月份
            return currentDate.add(interval, 'year').month(repeat.byMonth[0] - 1)
          }
        }
        return currentDate.add(interval, 'year')
      
      default:
        return currentDate.add(1, 'day')
    }
  }

  /**
   * 检查事件是否在指定范围内
   */
  private isEventInRange(eventStart: Dayjs, eventEnd: Dayjs, rangeStart: Dayjs, rangeEnd: Dayjs): boolean {
    // 使用 isSameOrBefore 和 isSameOrAfter 来包含边界情况
    return eventStart.isSameOrBefore(rangeEnd) && eventEnd.isSameOrAfter(rangeStart)
  }

  /**
   * 验证事件日期
   */
  private validateEventDates(event: CalendarEvent): void {
    const start = dayjs(event.start)

    if (!start.isValid()) {
      throw new Error('Invalid start date')
    }

    if (event.end) {
      const end = dayjs(event.end)

      if (!end.isValid()) {
        throw new Error('Invalid end date')
      }

      if (end.isBefore(start)) {
        throw new Error('End date cannot be before start date')
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `event_${Date.now()}_${this.autoIdCounter++}`
  }

  /**
   * 清除重复事件缓存
   */
  private clearRepeatEventCache(eventId?: string): void {
    if (eventId) {
      // 清除特定事件的缓存
      for (const key of this.repeatEventCache.keys()) {
        if (key.startsWith(eventId)) {
          this.repeatEventCache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.repeatEventCache.clear()
    }
  }

  /**
   * 检查事件冲突
   */
  public checkEventConflicts(event: CalendarEvent): CalendarEvent[] {
    const conflicts: CalendarEvent[] = []
    const eventStart = dayjs(event.start)
    const eventEnd = dayjs(event.end || event.start)

    for (const existingEvent of this.events.values()) {
      if (existingEvent.id === event.id) continue

      const existingStart = dayjs(existingEvent.start)
      const existingEnd = dayjs(existingEvent.end || existingEvent.start)

      // 检查时间重叠
      if (this.isEventInRange(eventStart, eventEnd, existingStart, existingEnd)) {
        conflicts.push(existingEvent)
      }
    }

    return conflicts
  }

  /**
   * 批量操作
   */
  public batchOperation(operations: Array<{
    type: 'add' | 'update' | 'delete'
    event?: Partial<CalendarEvent>
    id?: string
    changes?: Partial<CalendarEvent>
  }>): void {
    const results: any[] = []

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'add':
            if (operation.event) {
              results.push(this.addEvent(operation.event))
            }
            break
          case 'update':
            if (operation.id && operation.changes) {
              results.push(this.updateEvent(operation.id, operation.changes))
            }
            break
          case 'delete':
            if (operation.id) {
              results.push(this.deleteEvent(operation.id))
            }
            break
        }
      } catch (error) {
        console.error('Batch operation error:', error)
        results.push({ error: error.message })
      }
    }

    this.emit('batchOperationCompleted', results)
  }

  /**
   * 导出事件数据
   */
  public exportEvents(format: 'json' | 'ical' | 'csv' = 'json'): string {
    const events = this.getAllEvents()

    switch (format) {
      case 'json':
        return JSON.stringify(events, null, 2)
      
      case 'ical':
        return this.exportToICal(events)
      
      case 'csv':
        return this.exportToCSV(events)
      
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 导出为iCal格式
   */
  private exportToICal(events: CalendarEvent[]): string {
    let ical = 'BEGIN:VCALENDAR\r\n'
    ical += 'VERSION:2.0\r\n'
    ical += 'PRODID:-//LDesign//Calendar//EN\r\n'

    for (const event of events) {
      ical += 'BEGIN:VEVENT\r\n'
      ical += `UID:${event.id}\r\n`
      ical += `SUMMARY:${event.title}\r\n`
      ical += `DTSTART:${dayjs(event.start).format('YYYYMMDD[T]HHmmss')}\r\n`
      ical += `DTEND:${dayjs(event.end || event.start).format('YYYYMMDD[T]HHmmss')}\r\n`
      
      if (event.description) {
        ical += `DESCRIPTION:${event.description}\r\n`
      }
      
      ical += 'END:VEVENT\r\n'
    }

    ical += 'END:VCALENDAR\r\n'
    return ical
  }

  /**
   * 导出为CSV格式
   */
  private exportToCSV(events: CalendarEvent[]): string {
    const headers = ['ID', 'Title', 'Start', 'End', 'All Day', 'Description', 'Category']
    let csv = headers.join(',') + '\n'

    for (const event of events) {
      const row = [
        event.id,
        `"${event.title}"`,
        dayjs(event.start).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(event.end || event.start).format('YYYY-MM-DD HH:mm:ss'),
        event.allDay ? 'true' : 'false',
        `"${event.description || ''}"`,
        event.category || ''
      ]
      csv += row.join(',') + '\n'
    }

    return csv
  }

  /**
   * 导入事件数据
   */
  public importEvents(data: string, format: 'json' | 'ical' | 'csv' = 'json'): CalendarEvent[] {
    let events: Partial<CalendarEvent>[] = []

    switch (format) {
      case 'json':
        events = JSON.parse(data)
        break
      
      case 'ical':
        events = this.parseICal(data)
        break
      
      case 'csv':
        events = this.parseCSV(data)
        break
      
      default:
        throw new Error(`Unsupported import format: ${format}`)
    }

    const importedEvents: CalendarEvent[] = []
    for (const eventData of events) {
      try {
        const event = this.addEvent(eventData)
        importedEvents.push(event)
      } catch (error) {
        console.error('Error importing event:', error)
      }
    }

    return importedEvents
  }

  /**
   * 解析iCal数据
   */
  private parseICal(data: string): Partial<CalendarEvent>[] {
    // 简化的iCal解析实现
    const events: Partial<CalendarEvent>[] = []
    const lines = data.split('\n')
    let currentEvent: Partial<CalendarEvent> | null = null

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
        events.push(currentEvent)
        currentEvent = null
      } else if (currentEvent) {
        const [key, value] = trimmedLine.split(':')
        
        switch (key) {
          case 'UID':
            currentEvent.id = value
            break
          case 'SUMMARY':
            currentEvent.title = value
            break
          case 'DTSTART':
            currentEvent.start = this.parseICalDate(value)
            break
          case 'DTEND':
            currentEvent.end = this.parseICalDate(value)
            break
          case 'DESCRIPTION':
            currentEvent.description = value
            break
        }
      }
    }

    return events
  }

  /**
   * 解析iCal日期
   */
  private parseICalDate(dateStr: string): Date {
    // 简化的日期解析
    if (dateStr.includes('T')) {
      return dayjs(dateStr, 'YYYYMMDD[T]HHmmss').toDate()
    } else {
      return dayjs(dateStr, 'YYYYMMDD').toDate()
    }
  }

  /**
   * 解析CSV数据
   */
  private parseCSV(data: string): Partial<CalendarEvent>[] {
    const lines = data.split('\n')
    const headers = lines[0].split(',')
    const events: Partial<CalendarEvent>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length < headers.length) continue

      const event: Partial<CalendarEvent> = {}
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].toLowerCase()
        const value = values[j].replace(/"/g, '')
        
        switch (header) {
          case 'id':
            event.id = value
            break
          case 'title':
            event.title = value
            break
          case 'start':
            event.start = new Date(value)
            break
          case 'end':
            event.end = new Date(value)
            break
          case 'all day':
            event.allDay = value === 'true'
            break
          case 'description':
            event.description = value
            break
          case 'category':
            event.category = value
            break
        }
      }

      if (event.title && event.start) {
        events.push(event)
      }
    }

    return events
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
        console.error(`Error in event manager handler for "${event}":`, error)
      }
    })
  }

  /**
   * 销毁事件管理器
   */
  public destroy(): void {
    this.events.clear()
    this.repeatEventCache.clear()
    this.listeners.clear()
  }

  // 测试需要的额外方法
  public filterEvents(criteria: any): CalendarEvent[] {
    const events = this.getAllEvents()
    return events.filter(event => {
      for (const [key, value] of Object.entries(criteria)) {
        if ((event as any)[key] !== value) {
          return false
        }
      }
      return true
    })
  }

  public generateRecurringInstances(event: CalendarEvent, startDate: Date, endDate: Date): CalendarEvent[] {
    // 简化实现，返回基础重复实例
    const instances: CalendarEvent[] = []
    if (!event.repeat || event.repeat.type === 'none') {
      return [event]
    }

    const start = DateUtils.dayjs(startDate)
    const end = DateUtils.dayjs(endDate)
    const until = event.repeat.until ? DateUtils.dayjs(event.repeat.until) : null
    let current = DateUtils.dayjs(event.start)
    let count = 0

    while (current.isSameOrBefore(end, 'day') && count < (event.repeat.count || 100)) {
      // 检查是否超过until日期
      if (until && current.isAfter(until, 'day')) {
        break
      }

      if (current.isSameOrAfter(start, 'day')) {
        const instance = {
          ...event,
          id: `${event.id}-${count}`,
          start: current.toDate(),
          end: event.end ? current.add(DateUtils.dayjs(event.end).diff(DateUtils.dayjs(event.start))).toDate() : undefined
        }
        instances.push(instance)
      }

      switch (event.repeat.type) {
        case 'daily':
          current = current.add(event.repeat.interval || 1, 'day')
          break
        case 'weekly':
          current = current.add((event.repeat.interval || 1) * 7, 'day')
          break
        case 'monthly':
          current = current.add(event.repeat.interval || 1, 'month')
          break
        case 'yearly':
          current = current.add(event.repeat.interval || 1, 'year')
          break
      }

      count++
    }

    return instances
  }

  public checkConflicts(event: CalendarEvent): CalendarEvent[] {
    if (event.allDay) {
      return [] // 全天事件不检查冲突
    }

    const conflicts: CalendarEvent[] = []
    const eventStart = DateUtils.dayjs(event.start)
    const eventEnd = event.end ? DateUtils.dayjs(event.end) : eventStart

    for (const existingEvent of this.events.values()) {
      if (existingEvent.id === event.id || existingEvent.allDay) {
        continue
      }

      const existingStart = DateUtils.dayjs(existingEvent.start)
      const existingEnd = existingEvent.end ? DateUtils.dayjs(existingEvent.end) : existingStart

      // 检查时间重叠
      if (eventStart.isBefore(existingEnd) && eventEnd.isAfter(existingStart)) {
        conflicts.push(existingEvent)
      }
    }

    return conflicts
  }

  public batchAddEvents(events: any[]): CalendarEvent[] {
    const addedEvents: CalendarEvent[] = []
    events.forEach(eventData => {
      const event = this.addEvent(eventData)
      addedEvents.push(event)
    })
    return addedEvents
  }

  public batchDeleteEvents(ids: string[]): number {
    let deletedCount = 0
    ids.forEach(id => {
      if (this.deleteEvent(id)) {
        deletedCount++
      }
    })
    return deletedCount
  }

  public batchUpdateEvents(updates: Array<{ id: string; updates: any }>): CalendarEvent[] {
    const updatedEvents: CalendarEvent[] = []
    updates.forEach(({ id, updates: eventUpdates }) => {
      const updated = this.updateEvent(id, eventUpdates)
      if (updated) {
        updatedEvents.push(updated)
      }
    })
    return updatedEvents
  }

  public exportToJSON(): string {
    const events = this.getAllEvents()
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      events: events
    })
  }

  public importFromJSON(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData)
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid JSON format')
      }

      let importedCount = 0
      data.events.forEach((eventData: any) => {
        try {
          this.addEvent(eventData)
          importedCount++
        } catch (error) {
          console.warn('Failed to import event:', eventData, error)
        }
      })

      return importedCount
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error}`)
    }
  }

  public clear(): void {
    this.events.clear()
    this.repeatEventCache.clear()
    this.emit('events:clear')
  }

}
