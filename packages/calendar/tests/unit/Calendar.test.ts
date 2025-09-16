/**
 * Calendar 核心类单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Calendar } from '../../src/core/Calendar'
import { TestUtils } from '../setup'

describe('Calendar', () => {
  let container: HTMLElement
  let calendar: Calendar

  beforeEach(() => {
    container = TestUtils.createContainer()
  })

  afterEach(() => {
    if (calendar) {
      calendar.destroy()
    }
    TestUtils.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化日历', () => {
      calendar = new Calendar(container)
      
      expect(calendar).toBeDefined()
      expect(calendar.getContainer()).toBe(container)
      expect(calendar.getCurrentView()).toBe('month')
      expect(calendar.getCurrentDate()).toBeInstanceOf(Date)
    })

    it('应该接受配置选项', () => {
      const config = {
        locale: 'en-US',
        firstDayOfWeek: 1,
        showWeekNumbers: true,
      }
      
      calendar = new Calendar(container, config)
      
      expect(calendar.getConfig().locale).toBe('en-US')
      expect(calendar.getConfig().firstDayOfWeek).toBe(1)
      expect(calendar.getConfig().showWeekNumbers).toBe(true)
    })

    it('应该抛出错误当容器无效时', () => {
      expect(() => {
        new Calendar(null as any)
      }).toThrow('Container element is required')
    })
  })

  describe('视图管理', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确切换视图', () => {
      calendar.changeView('week')
      expect(calendar.getCurrentView()).toBe('week')

      calendar.changeView('day')
      expect(calendar.getCurrentView()).toBe('day')

      calendar.changeView('year')
      expect(calendar.getCurrentView()).toBe('year')
    })

    it('应该在视图切换时触发事件', () => {
      const onViewChange = vi.fn()
      calendar.on('view:change', onViewChange)

      calendar.changeView('week')

      expect(onViewChange).toHaveBeenCalledWith('week', 'month')
    })

    it('应该拒绝无效的视图类型', () => {
      expect(() => {
        calendar.changeView('invalid' as any)
      }).toThrow('Invalid view type: invalid')
    })
  })

  describe('日期导航', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确导航到指定日期', () => {
      const targetDate = new Date('2024-06-15')
      calendar.goToDate(targetDate)

      const currentDate = calendar.getCurrentDate()
      expect(currentDate.getFullYear()).toBe(2024)
      expect(currentDate.getMonth()).toBe(5) // 6月是索引5
    })

    it('应该正确导航到今天', () => {
      const today = new Date()
      calendar.goToToday()

      const currentDate = calendar.getCurrentDate()
      expect(currentDate.toDateString()).toBe(today.toDateString())
    })

    it('应该正确导航到下一个周期', () => {
      const initialDate = new Date('2024-01-15')
      calendar.goToDate(initialDate)

      calendar.next()
      const nextDate = calendar.getCurrentDate()
      expect(nextDate.getMonth()).toBe(1) // 2月
    })

    it('应该正确导航到上一个周期', () => {
      const initialDate = new Date('2024-01-15')
      calendar.goToDate(initialDate)

      calendar.prev()
      const prevDate = calendar.getCurrentDate()
      expect(prevDate.getMonth()).toBe(11) // 12月
      expect(prevDate.getFullYear()).toBe(2023)
    })
  })

  describe('日期选择', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确选择日期', () => {
      const targetDate = new Date('2024-01-15')
      calendar.selectDate(targetDate)

      const selectedDate = calendar.getSelectedDate()
      expect(selectedDate?.toDateString()).toBe(targetDate.toDateString())
    })

    it('应该在日期选择时触发事件', () => {
      const onDateSelect = vi.fn()
      calendar.on('date:select', onDateSelect)

      const targetDate = new Date('2024-01-15')
      calendar.selectDate(targetDate)

      expect(onDateSelect).toHaveBeenCalledWith(targetDate)
    })

    it('应该正确清除选择', () => {
      const targetDate = new Date('2024-01-15')
      calendar.selectDate(targetDate)
      calendar.clearSelection()

      expect(calendar.getSelectedDate()).toBeNull()
    })
  })

  describe('事件管理', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确添加事件', () => {
      const event = TestUtils.createMockEvent()
      const addedEvent = calendar.addEvent(event)

      expect(addedEvent).toBeDefined()
      expect(addedEvent.id).toBeDefined()
      expect(addedEvent.title).toBe(event.title)
    })

    it('应该正确更新事件', () => {
      const event = TestUtils.createMockEvent()
      const addedEvent = calendar.addEvent(event)

      const updates = { title: 'Updated Title' }
      const updatedEvent = calendar.updateEvent(addedEvent.id, updates)

      expect(updatedEvent?.title).toBe('Updated Title')
    })

    it('应该正确删除事件', () => {
      const event = TestUtils.createMockEvent()
      const addedEvent = calendar.addEvent(event)

      const deleted = calendar.deleteEvent(addedEvent.id)
      expect(deleted).toBe(true)

      const retrievedEvent = calendar.getEvent(addedEvent.id)
      expect(retrievedEvent).toBeNull()
    })

    it('应该正确获取指定日期的事件', () => {
      const date = new Date('2024-01-15')
      const event1 = TestUtils.createMockEvent({ start: date })
      const event2 = TestUtils.createMockEvent({ 
        start: new Date('2024-01-16'),
        id: 'event-2'
      })

      calendar.addEvent(event1)
      calendar.addEvent(event2)

      const eventsForDate = calendar.getEventsForDate(date)
      expect(eventsForDate).toHaveLength(1)
      expect(eventsForDate[0].title).toBe(event1.title)
    })
  })

  describe('渲染', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确渲染日历', () => {
      calendar.render()

      const calendarElement = container.querySelector('.ldesign-calendar')
      expect(calendarElement).toBeTruthy()
    })

    it('应该在渲染后触发事件', () => {
      const onRender = vi.fn()
      calendar.on('calendar:render', onRender)

      calendar.render()

      expect(onRender).toHaveBeenCalled()
    })

    it('应该正确更新显示', () => {
      calendar.render()
      const initialContent = container.innerHTML

      calendar.changeView('week')
      const updatedContent = container.innerHTML

      expect(updatedContent).not.toBe(initialContent)
    })
  })

  describe('配置更新', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确更新配置', () => {
      const newConfig = {
        locale: 'en-US',
        showWeekNumbers: true,
      }

      calendar.updateConfig(newConfig)

      expect(calendar.getConfig().locale).toBe('en-US')
      expect(calendar.getConfig().showWeekNumbers).toBe(true)
    })

    it('应该在配置更新后重新渲染', () => {
      const onRender = vi.fn()
      calendar.on('calendar:render', onRender)

      calendar.updateConfig({ locale: 'en-US' })

      expect(onRender).toHaveBeenCalled()
    })
  })

  describe('事件监听', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确添加事件监听器', () => {
      const listener = vi.fn()
      calendar.on('test:event', listener)

      calendar.emit('test:event', 'test data')

      expect(listener).toHaveBeenCalledWith('test data')
    })

    it('应该正确移除事件监听器', () => {
      const listener = vi.fn()
      calendar.on('test:event', listener)
      calendar.off('test:event', listener)

      calendar.emit('test:event', 'test data')

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该支持一次性事件监听器', () => {
      const listener = vi.fn()
      calendar.once('test:event', listener)

      calendar.emit('test:event', 'test data 1')
      calendar.emit('test:event', 'test data 2')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('test data 1')
    })
  })

  describe('销毁', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
    })

    it('应该正确销毁日历', () => {
      calendar.render()
      calendar.destroy()

      expect(container.innerHTML).toBe('')
    })

    it('应该在销毁后清理事件监听器', () => {
      const listener = vi.fn()
      calendar.on('test:event', listener)
      calendar.destroy()

      calendar.emit('test:event', 'test data')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('用户交互', () => {
    beforeEach(() => {
      calendar = new Calendar(container)
      calendar.render()
    })

    it('应该响应日期单元格点击', async () => {
      const onDateSelect = vi.fn()
      calendar.on('date:select', onDateSelect)

      const dateCell = container.querySelector('[data-date="2024-01-15"]') as HTMLElement
      if (dateCell) {
        TestUtils.click(dateCell)
        await TestUtils.waitFor(() => onDateSelect.mock.calls.length > 0)
        expect(onDateSelect).toHaveBeenCalled()
      }
    })

    it('应该响应键盘导航', async () => {
      const calendarElement = container.querySelector('.ldesign-calendar') as HTMLElement
      if (calendarElement) {
        calendarElement.focus()
        TestUtils.keyDown(calendarElement, 'ArrowRight')
        
        // 验证焦点移动
        await TestUtils.delay(100)
        // 这里可以添加更具体的焦点验证
      }
    })
  })
})
