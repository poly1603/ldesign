/**
 * Calendar 核心类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Calendar } from '../calendar'
import type { CalendarConfig } from '../../types/calendar'
import type { CalendarEvent } from '../../types/event'

// Mock DOM
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16)
  },
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

describe('Calendar', () => {
  let container: HTMLElement
  let calendar: Calendar

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-calendar'
    document.body.appendChild(container)

    // 创建日历实例
    calendar = new Calendar(container)
  })

  afterEach(() => {
    // 清理
    if (calendar) {
      calendar.destroy()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should create calendar instance correctly', () => {
    expect(calendar).toBeInstanceOf(Calendar)
    expect(calendar.getContainer()).toBe(container)
  })

  it('should initialize with default config', () => {
    const config = calendar.getConfig()
    expect(config.view).toBe('month')
    expect(config.locale).toBe('zh-CN')
    expect(config.weekStartsOn).toBe(1) // 周一开始
  })

  it('should initialize with custom config', () => {
    const customConfig: Partial<CalendarConfig> = {
      view: 'week',
      locale: 'en-US',
      weekStartsOn: 0, // 周日开始
      timeFormat: '12h',
    }

    const customCalendar = new Calendar(container, customConfig)
    const config = customCalendar.getConfig()

    expect(config.view).toBe('week')
    expect(config.locale).toBe('en-US')
    expect(config.weekStartsOn).toBe(0)
    expect(config.timeFormat).toBe('12h')

    customCalendar.destroy()
  })

  it('should render calendar correctly', () => {
    calendar.render()

    // 检查是否创建了基本的DOM结构
    expect(container.classList.contains('ldesign-calendar')).toBe(true)

    const wrapperElement = container.querySelector('.ldesign-calendar-wrapper')
    expect(wrapperElement).toBeTruthy()

    const headerElement = container.querySelector('.ldesign-calendar-header')
    expect(headerElement).toBeTruthy()

    const bodyElement = container.querySelector('.ldesign-calendar-body')
    expect(bodyElement).toBeTruthy()
  })

  it('should switch views correctly', () => {
    calendar.render()

    // 切换到周视图
    calendar.setView('week')
    expect(calendar.getCurrentView()).toBe('week')

    // 切换到日视图
    calendar.setView('day')
    expect(calendar.getCurrentView()).toBe('day')

    // 切换回月视图
    calendar.setView('month')
    expect(calendar.getCurrentView()).toBe('month')
  })

  it('should navigate dates correctly', () => {
    calendar.render()

    const initialDate = calendar.getCurrentDate()

    // 导航到下个月
    calendar.next()
    const nextDate = calendar.getCurrentDate()
    expect(nextDate.getMonth()).toBe((initialDate.getMonth() + 1) % 12)

    // 导航到上个月
    calendar.prev()
    const prevDate = calendar.getCurrentDate()
    expect(prevDate.getMonth()).toBe(initialDate.getMonth())

    // 导航到今天
    calendar.today()
    const todayDate = calendar.getCurrentDate()
    const now = new Date()
    expect(todayDate.toDateString()).toBe(now.toDateString())
  })

  it('should go to specific date', () => {
    calendar.render()

    const targetDate = new Date('2023-12-25')
    calendar.goToDate(targetDate)

    const currentDate = calendar.getCurrentDate()
    expect(currentDate.toDateString()).toBe(targetDate.toDateString())
  })

  it('should add events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    calendar.addEvent(event)

    const events = calendar.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual(event)
  })

  it('should update events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    calendar.addEvent(event)

    const updatedEvent: CalendarEvent = {
      ...event,
      title: 'Updated Event',
      description: 'Updated description',
    }

    calendar.updateEvent(updatedEvent)

    const events = calendar.getEvents()
    expect(events[0].title).toBe('Updated Event')
    expect(events[0].description).toBe('Updated description')
  })

  it('should remove events correctly', () => {
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    calendar.addEvent(event)
    expect(calendar.getEvents()).toHaveLength(1)

    calendar.removeEvent('test-event-1')
    expect(calendar.getEvents()).toHaveLength(0)
  })

  it('should get events by date range', () => {
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

    events.forEach(event => calendar.addEvent(event))

    const rangeEvents = calendar.getEventsByDateRange(
      new Date('2023-12-25'),
      new Date('2023-12-26')
    )

    expect(rangeEvents).toHaveLength(2)
    expect(rangeEvents.map(e => e.id)).toEqual(['event-1', 'event-2'])
  })

  it('should handle event listeners correctly', () => {
    const eventHandler = vi.fn()

    calendar.on('eventAdd', eventHandler)

    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    calendar.addEvent(event)

    expect(eventHandler).toHaveBeenCalledWith(event)

    // 移除监听器
    calendar.off('eventAdd', eventHandler)

    const anotherEvent: CalendarEvent = {
      id: 'test-event-2',
      title: 'Another Event',
      start: new Date('2023-12-26T10:00:00'),
      end: new Date('2023-12-26T11:00:00'),
      allDay: false,
    }

    calendar.addEvent(anotherEvent)

    // 应该只被调用一次（第一次添加事件时）
    expect(eventHandler).toHaveBeenCalledTimes(1)
  })

  it('should refresh view correctly', () => {
    calendar.render()

    const renderSpy = vi.spyOn(calendar, 'render')

    calendar.refresh()

    expect(renderSpy).toHaveBeenCalled()

    renderSpy.mockRestore()
  })

  it('should resize correctly', () => {
    calendar.render()

    const renderSpy = vi.spyOn(calendar, 'render')

    calendar.resize()

    expect(renderSpy).toHaveBeenCalled()

    renderSpy.mockRestore()
  })

  it('should destroy correctly', () => {
    calendar.render()

    // 添加一些事件监听器
    const handler = vi.fn()
    calendar.on('eventAdd', handler)

    // 添加一些事件
    const event: CalendarEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }
    calendar.addEvent(event)

    // 销毁日历
    calendar.destroy()

    // 检查容器是否被清空
    expect(container.innerHTML).toBe('')

    // 检查事件是否被清空
    expect(calendar.getEvents()).toHaveLength(0)
  })

  it('should handle invalid container', () => {
    expect(() => {
      new Calendar(null as any)
    }).toThrow('Container element is required')
  })

  it('should handle invalid view type', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    calendar.setView('invalid' as any)

    expect(consoleSpy).toHaveBeenCalledWith('Invalid view type: invalid')
    expect(calendar.getCurrentView()).toBe('month') // 应该保持原来的视图

    consoleSpy.mockRestore()
  })
})
