/**
 * EventManager 事件管理器单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventManager } from '../../src/core/EventManager'
import { TestUtils } from '../setup'
import type { CalendarEvent } from '../../src/types'

describe('EventManager', () => {
  let eventManager: EventManager

  beforeEach(() => {
    eventManager = new EventManager()
  })

  describe('事件CRUD操作', () => {
    it('应该正确添加事件', () => {
      const eventData = TestUtils.createMockEvent()
      const event = eventManager.addEvent(eventData)

      expect(event).toBeDefined()
      expect(event.id).toBeDefined()
      expect(event.title).toBe(eventData.title)
      expect(event.start).toEqual(eventData.start)
      expect(event.end).toEqual(eventData.end)
    })

    it('应该为新事件生成唯一ID', () => {
      const event1 = eventManager.addEvent(TestUtils.createMockEvent())
      const event2 = eventManager.addEvent(TestUtils.createMockEvent())

      expect(event1.id).not.toBe(event2.id)
    })

    it('应该正确获取事件', () => {
      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      const retrievedEvent = eventManager.getEvent(addedEvent.id)
      expect(retrievedEvent).toEqual(addedEvent)
    })

    it('应该在事件不存在时返回null', () => {
      const event = eventManager.getEvent('non-existent-id')
      expect(event).toBeNull()
    })

    it('应该正确更新事件', () => {
      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      const updates = {
        title: 'Updated Title',
        description: 'Updated Description'
      }

      const updatedEvent = eventManager.updateEvent(addedEvent.id, updates)

      expect(updatedEvent).toBeDefined()
      expect(updatedEvent!.title).toBe('Updated Title')
      expect(updatedEvent!.description).toBe('Updated Description')
      expect(updatedEvent!.start).toEqual(addedEvent.start) // 未更新的字段保持不变
    })

    it('应该在更新不存在的事件时返回null', () => {
      const result = eventManager.updateEvent('non-existent-id', { title: 'New Title' })
      expect(result).toBeNull()
    })

    it('应该正确删除事件', () => {
      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      const deleted = eventManager.deleteEvent(addedEvent.id)
      expect(deleted).toBe(true)

      const retrievedEvent = eventManager.getEvent(addedEvent.id)
      expect(retrievedEvent).toBeNull()
    })

    it('应该在删除不存在的事件时返回false', () => {
      const deleted = eventManager.deleteEvent('non-existent-id')
      expect(deleted).toBe(false)
    })
  })

  describe('事件查询', () => {
    beforeEach(() => {
      // 添加测试事件
      const events = [
        TestUtils.createMockEvent({
          id: 'event-1',
          title: 'Event 1',
          start: new Date('2024-01-15T09:00:00'),
          end: new Date('2024-01-15T10:00:00')
        }),
        TestUtils.createMockEvent({
          id: 'event-2',
          title: 'Event 2',
          start: new Date('2024-01-15T14:00:00'),
          end: new Date('2024-01-15T15:00:00')
        }),
        TestUtils.createMockEvent({
          id: 'event-3',
          title: 'Event 3',
          start: new Date('2024-01-16T09:00:00'),
          end: new Date('2024-01-16T10:00:00')
        })
      ]

      events.forEach(event => eventManager.addEvent(event))
    })

    it('应该正确获取所有事件', () => {
      const allEvents = eventManager.getAllEvents()
      expect(allEvents).toHaveLength(3)
    })

    it('应该正确获取指定日期的事件', () => {
      const date = new Date('2024-01-15')
      const events = eventManager.getEventsForDate(date)

      expect(events).toHaveLength(2)
      expect(events[0].title).toBe('Event 1')
      expect(events[1].title).toBe('Event 2')
    })

    it('应该正确获取日期范围内的事件', () => {
      const startDate = new Date('2024-01-15')
      const endDate = new Date('2024-01-16')
      const events = eventManager.getEventsInRange(startDate, endDate)

      expect(events).toHaveLength(3)
    })

    it('应该正确搜索事件', () => {
      const results = eventManager.searchEvents('Event 1')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Event 1')
    })

    it('应该支持不区分大小写的搜索', () => {
      const results = eventManager.searchEvents('event 1')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Event 1')
    })

    it('应该在描述中搜索', () => {
      eventManager.addEvent(TestUtils.createMockEvent({
        id: 'event-4',
        title: 'Meeting',
        description: 'Important discussion about project'
      }))

      const results = eventManager.searchEvents('discussion')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Meeting')
    })
  })

  describe('事件过滤', () => {
    beforeEach(() => {
      const events = [
        TestUtils.createMockEvent({
          id: 'event-1',
          category: 'work',
          priority: 'high'
        }),
        TestUtils.createMockEvent({
          id: 'event-2',
          category: 'personal',
          priority: 'low'
        }),
        TestUtils.createMockEvent({
          id: 'event-3',
          category: 'work',
          priority: 'medium'
        })
      ]

      events.forEach(event => eventManager.addEvent(event))
    })

    it('应该正确按分类过滤事件', () => {
      const workEvents = eventManager.filterEvents({ category: 'work' })
      expect(workEvents).toHaveLength(2)
      workEvents.forEach(event => {
        expect(event.category).toBe('work')
      })
    })

    it('应该正确按优先级过滤事件', () => {
      const highPriorityEvents = eventManager.filterEvents({ priority: 'high' })
      expect(highPriorityEvents).toHaveLength(1)
      expect(highPriorityEvents[0].priority).toBe('high')
    })

    it('应该支持多条件过滤', () => {
      const filteredEvents = eventManager.filterEvents({
        category: 'work',
        priority: 'high'
      })
      expect(filteredEvents).toHaveLength(1)
      expect(filteredEvents[0].category).toBe('work')
      expect(filteredEvents[0].priority).toBe('high')
    })
  })

  describe('重复事件', () => {
    it('应该正确生成每日重复事件', () => {
      const eventData = TestUtils.createMockEvent({
        repeat: {
          type: 'daily',
          interval: 1,
          count: 5
        }
      })

      const event = eventManager.addEvent(eventData)
      const instances = eventManager.generateRecurringInstances(event, 
        new Date('2024-01-15'), 
        new Date('2024-01-20')
      )

      expect(instances).toHaveLength(5)
    })

    it('应该正确生成每周重复事件', () => {
      const eventData = TestUtils.createMockEvent({
        start: new Date('2024-01-15T09:00:00'), // 周一
        repeat: {
          type: 'weekly',
          interval: 1,
          count: 3
        }
      })

      const event = eventManager.addEvent(eventData)
      const instances = eventManager.generateRecurringInstances(event,
        new Date('2024-01-15'),
        new Date('2024-01-29')
      )

      expect(instances).toHaveLength(3)
      // 验证日期间隔为7天
      expect(instances[1].start.getTime() - instances[0].start.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
    })

    it('应该正确处理重复事件的结束条件', () => {
      const eventData = TestUtils.createMockEvent({
        repeat: {
          type: 'daily',
          interval: 1,
          until: new Date('2024-01-18T23:59:59')
        }
      })

      const event = eventManager.addEvent(eventData)
      const instances = eventManager.generateRecurringInstances(event,
        new Date('2024-01-15'),
        new Date('2024-01-20')
      )

      expect(instances).toHaveLength(4) // 15, 16, 17, 18
    })
  })

  describe('事件冲突检测', () => {
    beforeEach(() => {
      eventManager.addEvent(TestUtils.createMockEvent({
        id: 'existing-event',
        start: new Date('2024-01-15T09:00:00'),
        end: new Date('2024-01-15T10:00:00')
      }))
    })

    it('应该检测到时间冲突', () => {
      const conflictingEvent = TestUtils.createMockEvent({
        start: new Date('2024-01-15T09:30:00'),
        end: new Date('2024-01-15T10:30:00')
      })

      const conflicts = eventManager.checkConflicts(conflictingEvent)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].id).toBe('existing-event')
    })

    it('应该不检测到相邻事件为冲突', () => {
      const adjacentEvent = TestUtils.createMockEvent({
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00')
      })

      const conflicts = eventManager.checkConflicts(adjacentEvent)
      expect(conflicts).toHaveLength(0)
    })

    it('应该忽略全天事件的冲突检测', () => {
      const allDayEvent = TestUtils.createMockEvent({
        start: new Date('2024-01-15T00:00:00'),
        end: new Date('2024-01-15T23:59:59'),
        allDay: true
      })

      const conflicts = eventManager.checkConflicts(allDayEvent)
      expect(conflicts).toHaveLength(0)
    })
  })

  describe('批量操作', () => {
    it('应该正确批量添加事件', () => {
      const events = TestUtils.createMockEvents(5)
      const addedEvents = eventManager.batchAddEvents(events)

      expect(addedEvents).toHaveLength(5)
      expect(eventManager.getAllEvents()).toHaveLength(5)
    })

    it('应该正确批量删除事件', () => {
      const events = TestUtils.createMockEvents(5)
      const addedEvents = eventManager.batchAddEvents(events)
      const idsToDelete = addedEvents.slice(0, 3).map(e => e.id)

      const deletedCount = eventManager.batchDeleteEvents(idsToDelete)

      expect(deletedCount).toBe(3)
      expect(eventManager.getAllEvents()).toHaveLength(2)
    })

    it('应该正确批量更新事件', () => {
      const events = TestUtils.createMockEvents(3)
      const addedEvents = eventManager.batchAddEvents(events)

      const updates = addedEvents.map(event => ({
        id: event.id,
        updates: { title: `Updated ${event.title}` }
      }))

      const updatedEvents = eventManager.batchUpdateEvents(updates)

      expect(updatedEvents).toHaveLength(3)
      updatedEvents.forEach(event => {
        expect(event.title).toContain('Updated')
      })
    })
  })

  describe('事件导入导出', () => {
    beforeEach(() => {
      const events = TestUtils.createMockEvents(3)
      events.forEach(event => eventManager.addEvent(event))
    })

    it('应该正确导出为JSON', () => {
      const jsonData = eventManager.exportToJSON()
      const parsed = JSON.parse(jsonData)

      expect(parsed.events).toHaveLength(3)
      expect(parsed.version).toBeDefined()
      expect(parsed.exportDate).toBeDefined()
    })

    it('应该正确从JSON导入', () => {
      const jsonData = eventManager.exportToJSON()
      
      // 清空现有事件
      eventManager.clear()
      expect(eventManager.getAllEvents()).toHaveLength(0)

      // 导入事件
      const importedCount = eventManager.importFromJSON(jsonData)
      expect(importedCount).toBe(3)
      expect(eventManager.getAllEvents()).toHaveLength(3)
    })

    it('应该处理无效的JSON导入', () => {
      const invalidJson = '{"invalid": "data"}'
      
      expect(() => {
        eventManager.importFromJSON(invalidJson)
      }).toThrow()
    })
  })

  describe('事件监听', () => {
    it('应该在添加事件时触发事件', () => {
      const onEventAdd = vi.fn()
      eventManager.on('event:add', onEventAdd)

      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      expect(onEventAdd).toHaveBeenCalledWith(addedEvent)
    })

    it('应该在更新事件时触发事件', () => {
      const onEventUpdate = vi.fn()
      eventManager.on('event:update', onEventUpdate)

      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      const updates = { title: 'Updated Title' }
      const updatedEvent = eventManager.updateEvent(addedEvent.id, updates)

      expect(onEventUpdate).toHaveBeenCalledWith(updatedEvent, updates)
    })

    it('应该在删除事件时触发事件', () => {
      const onEventDelete = vi.fn()
      eventManager.on('event:delete', onEventDelete)

      const eventData = TestUtils.createMockEvent()
      const addedEvent = eventManager.addEvent(eventData)

      eventManager.deleteEvent(addedEvent.id)

      expect(onEventDelete).toHaveBeenCalledWith(addedEvent.id)
    })
  })

  describe('清理和重置', () => {
    it('应该正确清空所有事件', () => {
      const events = TestUtils.createMockEvents(5)
      events.forEach(event => eventManager.addEvent(event))

      expect(eventManager.getAllEvents()).toHaveLength(5)

      eventManager.clear()

      expect(eventManager.getAllEvents()).toHaveLength(0)
    })

    it('应该在清空时触发事件', () => {
      const onClear = vi.fn()
      eventManager.on('events:clear', onClear)

      eventManager.clear()

      expect(onClear).toHaveBeenCalled()
    })
  })
})
