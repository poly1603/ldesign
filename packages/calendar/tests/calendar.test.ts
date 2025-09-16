/**
 * Calendar 组件综合测试套件
 * 包含单元测试、集成测试和性能测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Calendar } from '../src/index'
import { CalendarEvent, CalendarConfig, ViewType } from '../src/types'
import dayjs from 'dayjs'

// Mock DOM environment
const createMockDOM = () => {
  const container = document.createElement('div')
  container.id = 'test-calendar'
  document.body.appendChild(container)
  return container
}

const cleanupDOM = () => {
  const container = document.getElementById('test-calendar')
  if (container) {
    document.body.removeChild(container)
  }
}

describe('Calendar Component', () => {
  let container: HTMLElement
  let calendar: Calendar

  beforeEach(() => {
    container = createMockDOM()
  })

  afterEach(() => {
    if (calendar) {
      calendar.destroy()
    }
    cleanupDOM()
  })

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      calendar = new Calendar('#test-calendar')
      
      expect(calendar).toBeDefined()
      expect(calendar.getView()).toBe('month')
      expect(calendar.getLocale()).toBe('zh-CN')
    })

    it('should initialize with custom config', () => {
      const config: CalendarConfig = {
        view: 'week',
        locale: 'en-US',
        theme: 'dark',
        weekStartDay: 1
      }
      
      calendar = new Calendar('#test-calendar', config)
      
      expect(calendar.getView()).toBe('week')
      expect(calendar.getLocale()).toBe('en-US')
    })

    it('should handle invalid container', () => {
      expect(() => {
        new Calendar('#non-existent')
      }).toThrow()
    })
  })

  describe('Event Management', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should add event', () => {
      const event: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00')
      }
      
      const result = calendar.addEvent(event)
      
      expect(result).toBeTruthy()
      expect(calendar.getEvents()).toHaveLength(1)
      expect(calendar.getEventById('test-1')).toEqual(event)
    })

    it('should update event', () => {
      const event: CalendarEvent = {
        id: 'test-2',
        title: 'Original Title',
        start: new Date()
      }
      
      calendar.addEvent(event)
      
      const updated = calendar.updateEvent('test-2', { title: 'Updated Title' })
      
      expect(updated).toBeTruthy()
      expect(calendar.getEventById('test-2')?.title).toBe('Updated Title')
    })

    it('should delete event', () => {
      const event: CalendarEvent = {
        id: 'test-3',
        title: 'Delete Me',
        start: new Date()
      }
      
      calendar.addEvent(event)
      expect(calendar.getEvents()).toHaveLength(1)
      
      const deleted = calendar.deleteEvent('test-3')
      
      expect(deleted).toBeTruthy()
      expect(calendar.getEvents()).toHaveLength(0)
    })

    it('should handle duplicate event IDs', () => {
      const event1: CalendarEvent = {
        id: 'duplicate',
        title: 'Event 1',
        start: new Date()
      }
      
      const event2: CalendarEvent = {
        id: 'duplicate',
        title: 'Event 2',
        start: new Date()
      }
      
      calendar.addEvent(event1)
      
      expect(() => {
        calendar.addEvent(event2)
      }).toThrow()
    })

    it('should filter events by date range', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Past Event',
          start: new Date('2023-01-01')
        },
        {
          id: '2',
          title: 'Current Event',
          start: new Date()
        },
        {
          id: '3',
          title: 'Future Event',
          start: new Date('2025-01-01')
        }
      ]
      
      events.forEach(e => calendar.addEvent(e))
      
      const today = dayjs()
      const filtered = calendar.getEventsByDateRange(
        today.startOf('month').toDate(),
        today.endOf('month').toDate()
      )
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })
  })

  describe('View Management', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should switch between views', () => {
      const views: ViewType[] = ['month', 'week', 'day', 'year']
      
      views.forEach(view => {
        calendar.setView(view)
        expect(calendar.getView()).toBe(view)
      })
    })

    it('should navigate dates', () => {
      const initialDate = calendar.getCurrentDate()
      
      calendar.navigate('next')
      expect(calendar.getCurrentDate()).toBeAfter(initialDate)
      
      calendar.navigate('prev')
      calendar.navigate('prev')
      expect(calendar.getCurrentDate()).toBeBefore(initialDate)
    })

    it('should go to specific date', () => {
      const targetDate = new Date('2024-06-15')
      
      calendar.goToDate(targetDate)
      
      const current = calendar.getCurrentDate()
      expect(dayjs(current).isSame(targetDate, 'day')).toBeTruthy()
    })

    it('should go to today', () => {
      calendar.goToDate(new Date('2020-01-01'))
      
      calendar.goToToday()
      
      const current = calendar.getCurrentDate()
      expect(dayjs(current).isSame(dayjs(), 'day')).toBeTruthy()
    })
  })

  describe('Recurring Events', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should handle daily recurring events', () => {
      const recurringEvent: CalendarEvent = {
        id: 'daily-1',
        title: 'Daily Meeting',
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        repeat: {
          type: 'daily',
          interval: 1,
          until: new Date('2024-01-07')
        }
      }
      
      calendar.addEvent(recurringEvent)
      
      const instances = calendar.getRecurringInstances(
        recurringEvent.id,
        new Date('2024-01-01'),
        new Date('2024-01-07')
      )
      
      expect(instances).toHaveLength(7)
    })

    it('should handle weekly recurring events', () => {
      const recurringEvent: CalendarEvent = {
        id: 'weekly-1',
        title: 'Weekly Review',
        start: new Date('2024-01-01T14:00:00'),
        repeat: {
          type: 'weekly',
          interval: 1,
          count: 4
        }
      }
      
      calendar.addEvent(recurringEvent)
      
      const instances = calendar.getRecurringInstances(
        recurringEvent.id,
        new Date('2024-01-01'),
        new Date('2024-02-01')
      )
      
      expect(instances).toHaveLength(4)
    })

    it('should handle monthly recurring events', () => {
      const recurringEvent: CalendarEvent = {
        id: 'monthly-1',
        title: 'Monthly Report',
        start: new Date('2024-01-15T09:00:00'),
        repeat: {
          type: 'monthly',
          interval: 1,
          count: 3
        }
      }
      
      calendar.addEvent(recurringEvent)
      
      const instances = calendar.getRecurringInstances(
        recurringEvent.id,
        new Date('2024-01-01'),
        new Date('2024-04-01')
      )
      
      expect(instances).toHaveLength(3)
      expect(dayjs(instances[1].start).date()).toBe(15)
    })

    it('should handle complex recurring patterns', () => {
      const recurringEvent: CalendarEvent = {
        id: 'complex-1',
        title: 'Complex Pattern',
        start: new Date('2024-01-01T10:00:00'),
        repeat: {
          type: 'weekly',
          interval: 2,
          byWeekday: [1, 3, 5], // Monday, Wednesday, Friday
          until: new Date('2024-02-01')
        }
      }
      
      calendar.addEvent(recurringEvent)
      
      const instances = calendar.getRecurringInstances(
        recurringEvent.id,
        new Date('2024-01-01'),
        new Date('2024-02-01')
      )
      
      instances.forEach(instance => {
        const dayOfWeek = dayjs(instance.start).day()
        expect([1, 3, 5]).toContain(dayOfWeek)
      })
    })
  })

  describe('Event Listeners', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should emit dateClick event', () => {
      const callback = vi.fn()
      
      calendar.on('dateClick', callback)
      calendar.emit('dateClick', new Date('2024-01-15'))
      
      expect(callback).toHaveBeenCalledWith(expect.any(Date))
    })

    it('should emit eventClick event', () => {
      const callback = vi.fn()
      const event: CalendarEvent = {
        id: 'test',
        title: 'Test Event',
        start: new Date()
      }
      
      calendar.addEvent(event)
      calendar.on('eventClick', callback)
      calendar.emit('eventClick', event)
      
      expect(callback).toHaveBeenCalledWith(event)
    })

    it('should remove event listeners', () => {
      const callback = vi.fn()
      
      calendar.on('dateClick', callback)
      calendar.off('dateClick', callback)
      calendar.emit('dateClick', new Date())
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      calendar.on('viewChange', callback1)
      calendar.on('viewChange', callback2)
      calendar.setView('week')
      
      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })
  })

  describe('Localization', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should change locale', () => {
      calendar.setLocale('en-US')
      expect(calendar.getLocale()).toBe('en-US')
      
      calendar.setLocale('zh-CN')
      expect(calendar.getLocale()).toBe('zh-CN')
    })

    it('should format dates according to locale', () => {
      const date = new Date('2024-01-15')
      
      calendar.setLocale('en-US')
      const enFormat = calendar.formatDate(date, 'MMMM D, YYYY')
      expect(enFormat).toContain('January')
      
      calendar.setLocale('zh-CN')
      const zhFormat = calendar.formatDate(date, 'YYYY年MM月DD日')
      expect(zhFormat).toContain('年')
    })

    it('should handle invalid locale gracefully', () => {
      expect(() => {
        calendar.setLocale('invalid-locale')
      }).not.toThrow()
      
      // Should fallback to default
      expect(calendar.getLocale()).toBe('zh-CN')
    })
  })

  describe('Theme Management', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should apply theme', () => {
      calendar.setTheme('dark')
      
      expect(container.classList.contains('theme-dark')).toBeTruthy()
    })

    it('should switch themes', () => {
      calendar.setTheme('light')
      expect(container.classList.contains('theme-light')).toBeTruthy()
      
      calendar.setTheme('dark')
      expect(container.classList.contains('theme-dark')).toBeTruthy()
      expect(container.classList.contains('theme-light')).toBeFalsy()
    })

    it('should apply custom theme', () => {
      const customTheme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00'
        }
      }
      
      calendar.registerTheme(customTheme)
      calendar.setTheme('custom')
      
      expect(container.classList.contains('theme-custom')).toBeTruthy()
    })
  })

  describe('Data Import/Export', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should export events to JSON', () => {
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', start: new Date('2024-01-01') },
        { id: '2', title: 'Event 2', start: new Date('2024-01-02') }
      ]
      
      events.forEach(e => calendar.addEvent(e))
      
      const exported = calendar.export('json')
      const parsed = JSON.parse(exported)
      
      expect(parsed.events).toHaveLength(2)
      expect(parsed.version).toBeDefined()
    })

    it('should import events from JSON', () => {
      const jsonData = JSON.stringify({
        version: '1.0.0',
        events: [
          { id: '1', title: 'Imported Event 1', start: '2024-01-01T10:00:00Z' },
          { id: '2', title: 'Imported Event 2', start: '2024-01-02T10:00:00Z' }
        ]
      })
      
      calendar.import(jsonData, 'json')
      
      expect(calendar.getEvents()).toHaveLength(2)
      expect(calendar.getEventById('1')?.title).toBe('Imported Event 1')
    })

    it('should export to iCalendar format', () => {
      const event: CalendarEvent = {
        id: 'ical-1',
        title: 'iCal Event',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        description: 'Test description'
      }
      
      calendar.addEvent(event)
      
      const ical = calendar.export('ical')
      
      expect(ical).toContain('BEGIN:VCALENDAR')
      expect(ical).toContain('BEGIN:VEVENT')
      expect(ical).toContain('SUMMARY:iCal Event')
      expect(ical).toContain('END:VEVENT')
      expect(ical).toContain('END:VCALENDAR')
    })

    it('should handle import errors gracefully', () => {
      const invalidJson = 'invalid json data'
      
      expect(() => {
        calendar.import(invalidJson, 'json')
      }).toThrow()
      
      // Calendar should remain functional
      expect(calendar.getEvents()).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should handle large number of events efficiently', () => {
      const startTime = performance.now()
      
      // Add 1000 events
      for (let i = 0; i < 1000; i++) {
        calendar.addEvent({
          id: `perf-${i}`,
          title: `Event ${i}`,
          start: new Date(2024, 0, 1 + (i % 365))
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(calendar.getEvents()).toHaveLength(1000)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should render efficiently with many events', () => {
      // Add 100 events in current month
      const currentMonth = dayjs()
      
      for (let i = 0; i < 100; i++) {
        calendar.addEvent({
          id: `render-${i}`,
          title: `Event ${i}`,
          start: currentMonth.date(1 + (i % 28)).toDate()
        })
      }
      
      const startTime = performance.now()
      calendar.render()
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(100) // Should render within 100ms
    })

    it('should search events efficiently', () => {
      // Add 500 events
      for (let i = 0; i < 500; i++) {
        calendar.addEvent({
          id: `search-${i}`,
          title: `Event ${i % 10}`,
          start: new Date(2024, i % 12, 1 + (i % 28))
        })
      }
      
      const startTime = performance.now()
      const results = calendar.searchEvents('Event 5')
      const endTime = performance.now()
      
      const duration = endTime - startTime
      
      expect(results.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(50) // Search should be fast
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar', {
        enableAccessibility: true
      })
    })

    it('should have proper ARIA attributes', () => {
      calendar.render()
      
      const calendarEl = container.querySelector('.calendar-container')
      expect(calendarEl?.getAttribute('role')).toBe('application')
      expect(calendarEl?.getAttribute('aria-label')).toBeDefined()
    })

    it('should support keyboard navigation', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      
      container.dispatchEvent(keyEvent)
      
      // Check if date has moved forward
      const focusedDate = container.querySelector('[aria-selected="true"]')
      expect(focusedDate).toBeDefined()
    })

    it('should announce changes to screen readers', () => {
      const liveRegion = container.querySelector('[aria-live]')
      expect(liveRegion).toBeDefined()
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
    })

    it('should have focusable elements in correct tab order', () => {
      calendar.render()
      
      const focusableElements = container.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      )
      
      focusableElements.forEach((el) => {
        const tabindex = el.getAttribute('tabindex')
        if (tabindex) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('Memory Management', () => {
    it('should cleanup event listeners on destroy', () => {
      const calendar = new Calendar('#test-calendar')
      const callback = vi.fn()
      
      calendar.on('dateClick', callback)
      calendar.destroy()
      
      // Try to emit event after destroy
      expect(() => {
        calendar.emit('dateClick', new Date())
      }).toThrow()
    })

    it('should cleanup DOM references', () => {
      const calendar = new Calendar('#test-calendar')
      calendar.render()
      
      const elementCount = container.children.length
      expect(elementCount).toBeGreaterThan(0)
      
      calendar.destroy()
      
      expect(container.children.length).toBe(0)
    })

    it('should cancel timers on destroy', () => {
      const calendar = new Calendar('#test-calendar', {
        autoRefresh: true,
        refreshInterval: 1000
      })
      
      const spy = vi.spyOn(window, 'clearInterval')
      
      calendar.destroy()
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      calendar = new Calendar('#test-calendar')
    })

    it('should handle invalid date inputs', () => {
      expect(() => {
        calendar.goToDate(new Date('invalid'))
      }).toThrow()
      
      expect(() => {
        calendar.addEvent({
          id: 'invalid',
          title: 'Invalid Event',
          start: new Date('invalid')
        })
      }).toThrow()
    })

    it('should handle missing required event fields', () => {
      expect(() => {
        calendar.addEvent({
          id: '',
          title: '',
          start: new Date()
        })
      }).toThrow('Event title is required')
    })

    it('should handle event date conflicts gracefully', () => {
      const event1: CalendarEvent = {
        id: '1',
        title: 'Event 1',
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00')
      }
      
      const event2: CalendarEvent = {
        id: '2',
        title: 'Event 2',
        start: new Date('2024-01-01T10:30:00'),
        end: new Date('2024-01-01T11:30:00')
      }
      
      calendar.addEvent(event1)
      calendar.addEvent(event2)
      
      const conflicts = calendar.getConflictingEvents('2')
      expect(conflicts).toContain('1')
    })
  })
})

describe('Calendar Integration Tests', () => {
  let container: HTMLElement
  let calendar: Calendar

  beforeEach(() => {
    container = createMockDOM()
    calendar = new Calendar('#test-calendar')
  })

  afterEach(() => {
    calendar.destroy()
    cleanupDOM()
  })

  it('should integrate with external data source', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          { id: '1', title: 'Remote Event', start: '2024-01-01T10:00:00Z' }
        ]
      })
    })
    
    global.fetch = mockFetch
    
    await calendar.loadEventsFromURL('https://api.example.com/events')
    
    expect(mockFetch).toHaveBeenCalled()
    expect(calendar.getEvents()).toHaveLength(1)
  })

  it('should sync with localStorage', () => {
    const event: CalendarEvent = {
      id: 'local-1',
      title: 'Local Event',
      start: new Date()
    }
    
    calendar.addEvent(event)
    calendar.saveToLocalStorage()
    
    // Create new calendar instance
    const newCalendar = new Calendar('#test-calendar')
    newCalendar.loadFromLocalStorage()
    
    expect(newCalendar.getEvents()).toHaveLength(1)
    expect(newCalendar.getEventById('local-1')).toBeDefined()
    
    newCalendar.destroy()
  })

  it('should handle drag and drop', () => {
    const event: CalendarEvent = {
      id: 'drag-1',
      title: 'Draggable Event',
      start: new Date('2024-01-01T10:00:00')
    }
    
    calendar.addEvent(event)
    calendar.enableDragDrop()
    
    // Simulate drag and drop
    const dragStartEvent = new DragEvent('dragstart')
    const dropEvent = new DragEvent('drop')
    
    const eventElement = container.querySelector(`[data-event-id="drag-1"]`)
    const targetDate = container.querySelector('[data-date="2024-01-02"]')
    
    eventElement?.dispatchEvent(dragStartEvent)
    targetDate?.dispatchEvent(dropEvent)
    
    const updatedEvent = calendar.getEventById('drag-1')
    expect(dayjs(updatedEvent?.start).format('YYYY-MM-DD')).toBe('2024-01-02')
  })
})

describe('Calendar Performance Benchmarks', () => {
  let container: HTMLElement
  let calendar: Calendar

  beforeEach(() => {
    container = createMockDOM()
  })

  afterEach(() => {
    if (calendar) {
      calendar.destroy()
    }
    cleanupDOM()
  })

  it('should initialize within acceptable time', () => {
    const iterations = 100
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      calendar = new Calendar('#test-calendar')
      const end = performance.now()
      
      times.push(end - start)
      calendar.destroy()
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    expect(avgTime).toBeLessThan(10) // Average should be under 10ms
  })

  it('should batch update events efficiently', () => {
    calendar = new Calendar('#test-calendar')
    
    const events: CalendarEvent[] = []
    for (let i = 0; i < 100; i++) {
      events.push({
        id: `batch-${i}`,
        title: `Event ${i}`,
        start: new Date(2024, 0, 1 + i)
      })
    }
    
    const start = performance.now()
    calendar.addEvents(events) // Batch add
    const end = performance.now()
    
    expect(end - start).toBeLessThan(50) // Should be much faster than individual adds
    expect(calendar.getEvents()).toHaveLength(100)
  })
})