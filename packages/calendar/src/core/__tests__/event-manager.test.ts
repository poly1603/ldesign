/**
 * EventManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventManager } from '../event-manager'
import type { CalendarEvent } from '../../types/event'

describe('EventManager', () => {
  let eventManager: EventManager

  beforeEach(() => {
    eventManager = new EventManager()
  })

  it('should create event manager instance correctly', () => {
    expect(eventManager).toBeInstanceOf(EventManager)
  })

  it('should add events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    
    const events = eventManager.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual(event)
  })

  it('should not add duplicate events', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    eventManager.addEvent(event) // 尝试添加重复事件
    
    const events = eventManager.getEvents()
    expect(events).toHaveLength(1)
  })

  it('should update events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    
    const updatedEvent: CalendarEvent = {
      ...event,
      title: 'Updated Event',
      description: 'Updated description',
    }

    const result = eventManager.updateEvent(updatedEvent)
    expect(result).toBe(true)
    
    const events = eventManager.getEvents()
    expect(events[0].title).toBe('Updated Event')
    expect(events[0].description).toBe('Updated description')
  })

  it('should not update non-existent events', () => {
    const event: CalendarEvent = {
      id: 'non-existent',
      title: 'Non-existent Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    const result = eventManager.updateEvent(event)
    expect(result).toBe(false)
  })

  it('should remove events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    expect(eventManager.getEvents()).toHaveLength(1)
    
    const result = eventManager.removeEvent('test-event-1')
    expect(result).toBe(true)
    expect(eventManager.getEvents()).toHaveLength(0)
  })

  it('should not remove non-existent events', () => {
    const result = eventManager.removeEvent('non-existent')
    expect(result).toBe(false)
  })

  it('should get event by ID correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    
    const foundEvent = eventManager.getEvent('test-event-1')
    expect(foundEvent).toEqual(event)
    
    const notFoundEvent = eventManager.getEvent('non-existent')
    expect(notFoundEvent).toBeNull()
  })

  it('should get events by date range correctly', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Event 1',
        start: new Date('2023-12-25T10:00:00'),
        end: new Date('2023-12-25T11:00:00'),
        allDay: false,
      },
      {
        id: 'event-2',
        title: 'Event 2',
        start: new Date('2023-12-26T10:00:00'),
        end: new Date('2023-12-26T11:00:00'),
        allDay: false,
      },
      {
        id: 'event-3',
        title: 'Event 3',
        start: new Date('2023-12-27T10:00:00'),
        end: new Date('2023-12-27T11:00:00'),
        allDay: false,
      },
    ]

    events.forEach(event => eventManager.addEvent(event))
    
    const rangeEvents = eventManager.getEventsByDateRange(
      new Date('2023-12-25'),
      new Date('2023-12-26')
    )
    
    expect(rangeEvents).toHaveLength(2)
    expect(rangeEvents.map(e => e.id)).toEqual(['event-1', 'event-2'])
  })

  it('should get events by date correctly', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Event 1',
        start: new Date('2023-12-25T10:00:00'),
        end: new Date('2023-12-25T11:00:00'),
        allDay: false,
      },
      {
        id: 'event-2',
        title: 'Event 2',
        start: new Date('2023-12-25T14:00:00'),
        end: new Date('2023-12-25T15:00:00'),
        allDay: false,
      },
      {
        id: 'event-3',
        title: 'Event 3',
        start: new Date('2023-12-26T10:00:00'),
        end: new Date('2023-12-26T11:00:00'),
        allDay: false,
      },
    ]

    events.forEach(event => eventManager.addEvent(event))
    
    const dateEvents = eventManager.getEventsByDate(new Date('2023-12-25'))
    
    expect(dateEvents).toHaveLength(2)
    expect(dateEvents.map(e => e.id)).toEqual(['event-1', 'event-2'])
  })

  it('should handle all-day events correctly', () => {
    const allDayEvent: CalendarEvent = {
      id: 'all-day-event',
      title: 'All Day Event',
      start: new Date('2023-12-25'),
      end: new Date('2023-12-25'),
      allDay: true,
    }

    eventManager.addEvent(allDayEvent)
    
    const dateEvents = eventManager.getEventsByDate(new Date('2023-12-25'))
    expect(dateEvents).toHaveLength(1)
    expect(dateEvents[0].allDay).toBe(true)
  })

  it('should handle multi-day events correctly', () => {
    const multiDayEvent: CalendarEvent = {
      id: 'multi-day-event',
      title: 'Multi Day Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-27T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(multiDayEvent)
    
    // 检查第一天
    const day1Events = eventManager.getEventsByDate(new Date('2023-12-25'))
    expect(day1Events).toHaveLength(1)
    
    // 检查中间一天
    const day2Events = eventManager.getEventsByDate(new Date('2023-12-26'))
    expect(day2Events).toHaveLength(1)
    
    // 检查最后一天
    const day3Events = eventManager.getEventsByDate(new Date('2023-12-27'))
    expect(day3Events).toHaveLength(1)
  })

  it('should clear all events correctly', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Event 1',
        start: new Date('2023-12-25T10:00:00'),
        end: new Date('2023-12-25T11:00:00'),
        allDay: false,
      },
      {
        id: 'event-2',
        title: 'Event 2',
        start: new Date('2023-12-26T10:00:00'),
        end: new Date('2023-12-26T11:00:00'),
        allDay: false,
      },
    ]

    events.forEach(event => eventManager.addEvent(event))
    expect(eventManager.getEvents()).toHaveLength(2)
    
    eventManager.clearEvents()
    expect(eventManager.getEvents()).toHaveLength(0)
  })

  it('should handle event listeners correctly', () => {
    const addHandler = vi.fn()
    const updateHandler = vi.fn()
    const removeHandler = vi.fn()

    eventManager.on('eventAdd', addHandler)
    eventManager.on('eventUpdate', updateHandler)
    eventManager.on('eventRemove', removeHandler)

    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    // 测试添加事件
    eventManager.addEvent(event)
    expect(addHandler).toHaveBeenCalledWith(event)

    // 测试更新事件
    const updatedEvent = { ...event, title: 'Updated Event' }
    eventManager.updateEvent(updatedEvent)
    expect(updateHandler).toHaveBeenCalledWith(updatedEvent)

    // 测试删除事件
    eventManager.removeEvent('test-event-1')
    expect(removeHandler).toHaveBeenCalledWith('test-event-1')
  })

  it('should remove event listeners correctly', () => {
    const handler = vi.fn()

    eventManager.on('eventAdd', handler)
    
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    expect(handler).toHaveBeenCalledTimes(1)

    // 移除监听器
    eventManager.off('eventAdd', handler)

    const anotherEvent: CalendarEvent = {
      id: 'test-event-2',
      title: 'Another Event',
      start: new Date('2023-12-26T10:00:00'),
      end: new Date('2023-12-26T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(anotherEvent)
    expect(handler).toHaveBeenCalledTimes(1) // 应该还是1次
  })

  it('should remove all listeners correctly', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventManager.on('eventAdd', handler1)
    eventManager.on('eventUpdate', handler2)

    eventManager.removeAllListeners()

    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    eventManager.addEvent(event)
    eventManager.updateEvent({ ...event, title: 'Updated' })

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })
})
