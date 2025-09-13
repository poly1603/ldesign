/**
 * 类型定义测试
 */

import { describe, it, expect } from 'vitest'
import type {
  CalendarOptions,
  CalendarState,
  CalendarEvent,
  CalendarPlugin,
  CalendarTheme,
  ViewType
} from '../src/types/index'

describe('类型定义测试', () => {
  it('应该正确定义 CalendarOptions 类型', () => {
    const options: CalendarOptions = {
      container: '#calendar',
      view: 'month',
      date: new Date(),
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true,
      draggable: true,
      keyboardNavigation: true,
      responsive: true,
    }

    expect(options.container).toBe('#calendar')
    expect(options.view).toBe('month')
    expect(options.locale).toBe('zh-CN')
    expect(options.showLunar).toBe(true)
  })

  it('应该正确定义 CalendarEvent 类型', () => {
    const event: CalendarEvent = {
      id: '1',
      title: '测试事件',
      start: new Date('2024-01-15 10:00'),
      end: new Date('2024-01-15 11:00'),
      allDay: false,
      type: 'event',
      status: 'confirmed',
      color: '#ff0000',
      location: '会议室A',
      description: '这是一个测试事件',
      editable: true,
      draggable: true,
      resizable: true,
    }

    expect(event.id).toBe('1')
    expect(event.title).toBe('测试事件')
    expect(event.type).toBe('event')
    expect(event.status).toBe('confirmed')
  })

  it('应该正确定义 ViewType 类型', () => {
    const monthView: ViewType = 'month'
    const weekView: ViewType = 'week'
    const dayView: ViewType = 'day'

    expect(monthView).toBe('month')
    expect(weekView).toBe('week')
    expect(dayView).toBe('day')
  })

  it('应该正确定义 CalendarState 类型', () => {
    const state: CalendarState = {
      currentView: 'month',
      currentDate: new Date(),
      selectedDate: new Date(),
      selectedRange: {
        start: new Date(),
        end: new Date(),
      },
      events: [],
      loading: false,
      error: null,
      dragging: false,
      draggingEvent: null,
    }

    expect(state.currentView).toBe('month')
    expect(state.loading).toBe(false)
    expect(state.dragging).toBe(false)
  })

  it('应该支持插件类型定义', () => {
    const plugin: CalendarPlugin = {
      metadata: {
        name: 'test-plugin',
        version: '1.0.0',
        description: '测试插件',
      },
      install: () => { },
      uninstall: () => { },
    }

    expect(plugin.metadata.name).toBe('test-plugin')
    expect(plugin.metadata.version).toBe('1.0.0')
    expect(typeof plugin.install).toBe('function')
  })

  it('应该支持主题类型定义', () => {
    const theme: CalendarTheme = {
      name: 'test-theme',
      displayName: '测试主题',
      dark: false,
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#333333',
      },
    }

    expect(theme.name).toBe('test-theme')
    expect(theme.dark).toBe(false)
    expect(theme.colors.primary).toBe('#007bff')
  })
})
