/**
 * 事件管理器
 * 
 * 负责管理日历中的所有事件，包括：
 * - 事件的增删改查
 * - 事件数据验证
 * - 事件冲突检测
 * - 事件持久化
 * - 事件搜索和过滤
 */

import type {
  CalendarEvent,
  CreateEventParams,
  UpdateEventParams,
  EventQueryParams,
  EventQueryResult,
  EventOperationResult,
  BatchEventOperation,
  BatchEventOperationResult
} from '../types/event'

/**
 * 事件管理器类
 */
export class EventManager {
  private events: Map<string, CalendarEvent> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  /**
   * 添加事件（完整版本）
   * @param params 事件创建参数
   * @returns 操作结果
   */
  async createEvent(params: CreateEventParams): Promise<EventOperationResult> {
    try {
      // 验证事件数据
      const validationResult = this.validateEventData(params)
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error || '验证失败',
        }
      }

      // 生成事件ID
      const eventId = this.generateEventId()

      // 创建事件对象
      const event = {
        id: eventId,
        title: params.title,
        start: new Date(params.start),
        end: params.end ? new Date(params.end) : this.calculateDefaultEndTime(new Date(params.start)),
        allDay: params.allDay || false,
        description: params.description || '',
        type: params.type || 'event',
        color: params.color || '#722ED1',
        location: params.location || '',
        recurrence: params.recurrence,
        reminders: params.reminders?.map(r => ({
          ...r,
          id: this.generateReminderId(),
          triggered: false,
        })),
        customData: params.customData,
        createdAt: new Date(),
        updatedAt: new Date(),
        editable: true,
        draggable: true,
        resizable: true,
      } as CalendarEvent

      // 检查事件冲突
      const conflictCheck = await this.checkEventConflict(event)
      if (conflictCheck.hasConflict && !conflictCheck.allowOverlap) {
        return {
          success: false,
          error: `事件时间冲突: ${conflictCheck.conflictingEvents.map(e => e.title).join(', ')}`,
        }
      }

      // 保存事件
      this.events.set(eventId, event)

      // 触发事件创建监听器
      this.emit('eventCreated', event)

      return {
        success: true,
        event,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加事件失败',
      }
    }
  }

  /**
   * 更新事件（完整版本）
   * @param eventId 事件ID
   * @param updates 更新数据
   * @returns 操作结果
   */
  async updateEventFull(eventId: string, updates: UpdateEventParams): Promise<EventOperationResult> {
    try {
      const existingEvent = this.events.get(eventId)
      if (!existingEvent) {
        return {
          success: false,
          error: `找不到事件: ${eventId}`,
        }
      }

      // 检查事件是否可编辑
      if (existingEvent.editable === false) {
        return {
          success: false,
          error: '该事件不可编辑',
        }
      }

      // 合并更新数据
      const updatedEvent: CalendarEvent = {
        ...existingEvent,
        ...updates,
        id: eventId, // 确保ID不被修改
        updatedAt: new Date(),
      }

      // 验证更新后的事件数据
      const validationResult = this.validateEventData(updatedEvent)
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error || '验证失败',
        }
      }

      // 检查事件冲突（排除自身）
      const conflictCheck = await this.checkEventConflict(updatedEvent, [eventId])
      if (conflictCheck.hasConflict && !conflictCheck.allowOverlap) {
        return {
          success: false,
          error: `事件时间冲突: ${conflictCheck.conflictingEvents.map(e => e.title).join(', ')}`,
        }
      }

      // 保存更新
      this.events.set(eventId, updatedEvent)

      // 触发事件更新监听器
      this.emit('eventUpdated', updatedEvent, existingEvent)

      return {
        success: true,
        event: updatedEvent,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新事件失败',
      }
    }
  }

  /**
   * 删除事件（完整版本）
   * @param eventId 事件ID
   * @returns 操作结果
   */
  async deleteEvent(eventId: string): Promise<EventOperationResult> {
    try {
      const event = this.events.get(eventId)
      if (!event) {
        return {
          success: false,
          error: `找不到事件: ${eventId}`,
        }
      }

      // 检查事件是否可删除
      if (event.editable === false) {
        return {
          success: false,
          error: '该事件不可删除',
        }
      }

      // 删除事件
      this.events.delete(eventId)

      // 触发事件删除监听器
      this.emit('eventDeleted', event)

      return {
        success: true,
        event,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除事件失败',
      }
    }
  }

  /**
   * 获取事件
   * @param eventId 事件ID
   * @returns 事件对象或null
   */
  getEvent(eventId: string): CalendarEvent | null {
    return this.events.get(eventId) || null
  }

  /**
   * 获取所有事件
   * @returns 事件数组
   */
  getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values())
  }

  /**
   * 查询事件
   * @param params 查询参数
   * @returns 查询结果
   */
  queryEvents(params: EventQueryParams = {}): EventQueryResult {
    let events = Array.from(this.events.values())

    // 日期范围过滤
    if (params.start || params.end) {
      events = events.filter(event => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        if (params.start && eventEnd < params.start) return false
        if (params.end && eventStart > params.end) return false

        return true
      })
    }

    // 类型过滤
    if (params.type) {
      const types = Array.isArray(params.type) ? params.type : [params.type]
      events = events.filter(event => types.includes(event.type || 'event'))
    }

    // 状态过滤
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status]
      events = events.filter(event => statuses.includes(event.status || 'confirmed'))
    }

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      events = events.filter(event =>
        event.title.toLowerCase().includes(keyword) ||
        (event.description && event.description.toLowerCase().includes(keyword)) ||
        (event.location && event.location.toLowerCase().includes(keyword))
      )
    }

    // 分类过滤
    if (params.categories && params.categories.length > 0) {
      events = events.filter(event =>
        event.categories && event.categories.some(cat => params.categories!.includes(cat))
      )
    }

    // 优先级过滤
    if (params.priority && params.priority.length > 0) {
      events = events.filter(event =>
        event.priority && params.priority!.includes(event.priority)
      )
    }

    // 排序
    if (params.sortBy) {
      events.sort((a, b) => {
        let aValue: any, bValue: any

        switch (params.sortBy) {
          case 'start':
            aValue = new Date(a.start).getTime()
            bValue = new Date(b.start).getTime()
            break
          case 'end':
            aValue = new Date(a.end).getTime()
            bValue = new Date(b.end).getTime()
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'createdAt':
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
            break
          case 'updatedAt':
            aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
            break
          default:
            return 0
        }

        const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return params.sortOrder === 'desc' ? -result : result
      })
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || events.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedEvents = events.slice(startIndex, endIndex)

    return {
      events: paginatedEvents,
      total: events.length,
      page,
      pageSize,
      totalPages: Math.ceil(events.length / pageSize),
    }
  }

  /**
   * 批量操作事件
   * @param operation 批量操作参数
   * @returns 批量操作结果
   */
  async batchOperation(operation: BatchEventOperation): Promise<BatchEventOperationResult> {
    const results: EventOperationResult[] = []
    const errors: string[] = []
    let successCount = 0
    let failureCount = 0

    try {
      switch (operation.operation) {
        case 'create':
          if (operation.events) {
            for (const eventData of operation.events) {
              const result = await this.addEvent(eventData as CreateEventParams)
              results.push(result)
              if (result.success) {
                successCount++
              } else {
                failureCount++
                if (result.error) errors.push(result.error)
              }
            }
          }
          break

        case 'update':
          if (operation.eventIds && operation.events) {
            for (let i = 0; i < operation.eventIds.length; i++) {
              const eventId = operation.eventIds[i]
              const updateData = operation.events[i] as UpdateEventParams
              const result = await this.updateEvent(eventId!, updateData)
              results.push(result)
              if (result.success) {
                successCount++
              } else {
                failureCount++
                if (result.error) errors.push(result.error)
              }
            }
          }
          break

        case 'delete':
          if (operation.eventIds) {
            for (const eventId of operation.eventIds) {
              const result = await this.removeEvent(eventId)
              results.push(result)
              if (result.success) {
                successCount++
              } else {
                failureCount++
                if (result.error) errors.push(result.error)
              }
            }
          }
          break
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '批量操作失败')
      failureCount++
    }

    return {
      successCount,
      failureCount,
      results,
      errors,
    }
  }

  /**
   * 清空所有事件
   */
  clear(): void {
    this.events.clear()
    this.emit('eventsCleared')
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.eventListeners.clear()
  }

  // ========== 便捷方法（为了兼容测试和简化API） ==========

  /**
   * 添加事件（简化版本）
   * @param event 事件对象
   */
  addEvent(event: CalendarEvent): void {
    // 如果事件已存在，不重复添加
    if (this.events.has(event.id)) {
      return
    }

    this.events.set(event.id, event)
    this.emit('eventAdd', event)
  }

  /**
   * 更新事件（简化版本）
   * @param event 事件对象
   * @returns 是否更新成功
   */
  updateEvent(event: CalendarEvent): boolean {
    if (!this.events.has(event.id)) {
      return false
    }

    this.events.set(event.id, event)
    this.emit('eventUpdate', event)
    return true
  }

  /**
   * 删除事件（简化版本）
   * @param eventId 事件ID
   * @returns 是否删除成功
   */
  removeEvent(eventId: string): boolean {
    if (!this.events.has(eventId)) {
      return false
    }

    this.events.delete(eventId)
    this.emit('eventRemove', eventId)
    return true
  }

  /**
   * 获取所有事件（简化版本）
   * @returns 事件数组
   */
  getEvents(): CalendarEvent[] {
    return Array.from(this.events.values())
  }

  /**
   * 根据日期范围获取事件
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 事件数组
   */
  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    // 确保结束日期包含整天
    const endOfEndDate = new Date(endDate)
    endOfEndDate.setHours(23, 59, 59, 999)

    return this.getEvents().filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // 检查事件是否与日期范围有重叠
      return (
        (eventStart >= startDate && eventStart <= endOfEndDate) ||
        (eventEnd >= startDate && eventEnd <= endOfEndDate) ||
        (eventStart <= startDate && eventEnd >= endOfEndDate)
      )
    })
  }

  /**
   * 根据日期获取事件
   * @param date 日期
   * @returns 事件数组
   */
  getEventsByDate(date: Date): CalendarEvent[] {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.getEvents().filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // 检查事件是否在这一天
      return (
        (eventStart >= startOfDay && eventStart <= endOfDay) ||
        (eventEnd >= startOfDay && eventEnd <= endOfDay) ||
        (eventStart <= startOfDay && eventEnd >= endOfDay)
      )
    })
  }

  /**
   * 清空所有事件（简化版本）
   */
  clearEvents(): void {
    this.events.clear()
    this.emit('eventsCleared')
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 参数
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成提醒ID
   */
  private generateReminderId(): string {
    return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 计算默认结束时间
   * @param startTime 开始时间
   * @returns 结束时间
   */
  private calculateDefaultEndTime(startTime: Date): Date {
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 1) // 默认1小时
    return endTime
  }

  /**
   * 验证事件数据
   * @param eventData 事件数据
   * @returns 验证结果
   */
  private validateEventData(eventData: any): { valid: boolean; error?: string } {
    if (!eventData.title || eventData.title.trim() === '') {
      return { valid: false, error: '事件标题不能为空' }
    }

    if (!eventData.start) {
      return { valid: false, error: '事件开始时间不能为空' }
    }

    const startTime = new Date(eventData.start)
    const endTime = new Date(eventData.end || eventData.start)

    if (isNaN(startTime.getTime())) {
      return { valid: false, error: '事件开始时间格式无效' }
    }

    if (isNaN(endTime.getTime())) {
      return { valid: false, error: '事件结束时间格式无效' }
    }

    if (endTime <= startTime) {
      return { valid: false, error: '事件结束时间必须晚于开始时间' }
    }

    return { valid: true }
  }

  /**
   * 检查事件冲突
   * @param event 要检查的事件
   * @param excludeIds 排除的事件ID列表
   * @returns 冲突检查结果
   */
  private async checkEventConflict(
    event: CalendarEvent,
    excludeIds: string[] = []
  ): Promise<{
    hasConflict: boolean
    allowOverlap: boolean
    conflictingEvents: CalendarEvent[]
  }> {
    const conflictingEvents: CalendarEvent[] = []

    for (const existingEvent of this.events.values()) {
      // 排除指定的事件ID
      if (excludeIds.includes(existingEvent.id)) continue

      // 检查时间重叠
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const existingStart = new Date(existingEvent.start)
      const existingEnd = new Date(existingEvent.end)

      const hasTimeOverlap = (
        (eventStart >= existingStart && eventStart < existingEnd) ||
        (eventEnd > existingStart && eventEnd <= existingEnd) ||
        (eventStart <= existingStart && eventEnd >= existingEnd)
      )

      if (hasTimeOverlap) {
        conflictingEvents.push(existingEvent)
      }
    }

    return {
      hasConflict: conflictingEvents.length > 0,
      allowOverlap: true, // TODO: 从配置中获取
      conflictingEvents,
    }
  }
}
