/**
 * 验证工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  Validator,
  DateValidator,
  EventValidator,
  ConfigValidator,
  TypeChecker,
  eventValidator,
  isValidDate,
  isValidEvent,
  checkConflicts,
} from '../validation'
import type { CalendarEvent } from '../../types/event'
import type { CalendarConfig } from '../../types/calendar'

describe('Validator', () => {
  it('should validate with rules correctly', () => {
    const validator = new Validator()
      .addRule({
        name: 'required',
        validator: (value) => value !== null && value !== undefined && value !== '',
        message: 'Field is required',
        required: true,
      })
      .addRule({
        name: 'minLength',
        validator: (value) => typeof value === 'string' && value.length >= 3,
        message: 'Minimum length is 3',
      })

    // 测试有效值
    const validResult = validator.validate('hello')
    expect(validResult.valid).toBe(true)
    expect(validResult.errors).toHaveLength(0)

    // 测试无效值
    const invalidResult = validator.validate('hi')
    expect(invalidResult.valid).toBe(false)
    expect(invalidResult.errors).toContain('Minimum length is 3')

    // 测试必填项
    const emptyResult = validator.validate('')
    expect(emptyResult.valid).toBe(false)
    expect(emptyResult.errors).toContain('Field is required')
  })

  it('should handle custom error messages', () => {
    const validator = new Validator()
      .addRule({
        name: 'custom',
        validator: () => 'Custom error message',
      })

    const result = validator.validate('test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Custom error message')
  })

  it('should clear rules', () => {
    const validator = new Validator()
      .addRule({
        name: 'test',
        validator: () => false,
      })

    validator.clear()
    const result = validator.validate('test')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('DateValidator', () => {
  it('should validate dates correctly', () => {
    expect(DateValidator.isValidDate(new Date())).toBe(true)
    expect(DateValidator.isValidDate('2023-12-25')).toBe(true)
    expect(DateValidator.isValidDate(1703462400000)).toBe(true)
    expect(DateValidator.isValidDate('invalid')).toBe(false)
    expect(DateValidator.isValidDate(null)).toBe(false)
    expect(DateValidator.isValidDate(undefined)).toBe(false)
  })

  it('should validate date formats', () => {
    expect(DateValidator.isValidDateFormat('2023-12-25', 'YYYY-MM-DD')).toBe(true)
    expect(DateValidator.isValidDateFormat('2023/12/25', 'YYYY/MM/DD')).toBe(true)
    expect(DateValidator.isValidDateFormat('25/12/2023', 'DD/MM/YYYY')).toBe(true)
    expect(DateValidator.isValidDateFormat('12/25/2023', 'MM/DD/YYYY')).toBe(true)
    expect(DateValidator.isValidDateFormat('2023-12-25 14:30', 'YYYY-MM-DD HH:mm')).toBe(true)
    expect(DateValidator.isValidDateFormat('2023-12-25 14:30:45', 'YYYY-MM-DD HH:mm:ss')).toBe(true)
    
    expect(DateValidator.isValidDateFormat('2023-12-25', 'YYYY/MM/DD')).toBe(false)
    expect(DateValidator.isValidDateFormat('invalid', 'YYYY-MM-DD')).toBe(false)
    expect(DateValidator.isValidDateFormat('2023-12-25', 'INVALID_FORMAT')).toBe(false)
  })

  it('should validate date ranges', () => {
    const date = new Date('2023-12-25')
    const minDate = new Date('2023-12-01')
    const maxDate = new Date('2023-12-31')

    expect(DateValidator.isDateInRange(date, minDate, maxDate)).toBe(true)
    expect(DateValidator.isDateInRange(date, minDate)).toBe(true)
    expect(DateValidator.isDateInRange(date, undefined, maxDate)).toBe(true)
    
    const earlyDate = new Date('2023-11-25')
    const lateDate = new Date('2024-01-25')
    
    expect(DateValidator.isDateInRange(earlyDate, minDate, maxDate)).toBe(false)
    expect(DateValidator.isDateInRange(lateDate, minDate, maxDate)).toBe(false)
  })

  it('should validate time formats', () => {
    expect(DateValidator.isValidTimeFormat('14:30')).toBe(true)
    expect(DateValidator.isValidTimeFormat('09:05')).toBe(true)
    expect(DateValidator.isValidTimeFormat('23:59')).toBe(true)
    expect(DateValidator.isValidTimeFormat('00:00')).toBe(true)
    
    expect(DateValidator.isValidTimeFormat('24:00')).toBe(false)
    expect(DateValidator.isValidTimeFormat('14:60')).toBe(false)
    expect(DateValidator.isValidTimeFormat('invalid')).toBe(false)
    expect(DateValidator.isValidTimeFormat('14')).toBe(false)
  })
})

describe('EventValidator', () => {
  const validEvent: CalendarEvent = {
    id: 'event-1',
    title: 'Test Event',
    start: new Date('2023-12-25T10:00:00'),
    end: new Date('2023-12-25T11:00:00'),
    allDay: false,
  }

  it('should validate valid events', () => {
    const result = EventValidator.validateEvent(validEvent)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate required fields', () => {
    const invalidEvent = {
      title: '',
      start: null,
      end: null,
    }

    const result = EventValidator.validateEvent(invalidEvent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Event ID is required')
    expect(result.errors).toContain('Event title is required')
    expect(result.errors).toContain('Event start time is required')
    expect(result.errors).toContain('Event end time is required')
  })

  it('should validate date logic', () => {
    const invalidEvent = {
      ...validEvent,
      start: new Date('2023-12-25T11:00:00'),
      end: new Date('2023-12-25T10:00:00'), // 结束时间早于开始时间
    }

    const result = EventValidator.validateEvent(invalidEvent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Start time must be before end time')
  })

  it('should validate field lengths', () => {
    const longTitleEvent = {
      ...validEvent,
      title: 'a'.repeat(101), // 超过100字符
      description: 'b'.repeat(1001), // 超过1000字符
    }

    const result = EventValidator.validateEvent(longTitleEvent)
    expect(result.warnings).toContain('Event title is longer than 100 characters')
    expect(result.warnings).toContain('Event description is longer than 1000 characters')
  })

  it('should validate color format', () => {
    const invalidColorEvent = {
      ...validEvent,
      color: 'invalid-color',
    }

    const result = EventValidator.validateEvent(invalidColorEvent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid color format')

    // 测试有效颜色
    const validColorEvent = {
      ...validEvent,
      color: '#ff0000',
    }

    const validResult = EventValidator.validateEvent(validColorEvent)
    expect(validResult.valid).toBe(true)
  })

  it('should check event conflicts', () => {
    const event1: CalendarEvent = {
      id: 'event-1',
      title: 'Event 1',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    const event2: CalendarEvent = {
      id: 'event-2',
      title: 'Event 2',
      start: new Date('2023-12-25T10:30:00'),
      end: new Date('2023-12-25T11:30:00'),
      allDay: false,
    }

    const event3: CalendarEvent = {
      id: 'event-3',
      title: 'Event 3',
      start: new Date('2023-12-25T12:00:00'),
      end: new Date('2023-12-25T13:00:00'),
      allDay: false,
    }

    const conflicts = EventValidator.checkEventConflict(event1, [event2, event3])
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].id).toBe('event-2')

    const noConflicts = EventValidator.checkEventConflict(event1, [event3])
    expect(noConflicts).toHaveLength(0)
  })
})

describe('ConfigValidator', () => {
  it('should validate valid config', () => {
    const validConfig: Partial<CalendarConfig> = {
      defaultView: 'month',
      locale: 'zh-CN',
      timeFormat: '24h',
      weekStartsOn: 1,
    }

    const result = ConfigValidator.validateConfig(validConfig)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate invalid config', () => {
    const invalidConfig: Partial<CalendarConfig> = {
      defaultView: 'invalid' as any,
      locale: 123 as any,
      timeFormat: 'invalid' as any,
      weekStartsOn: 7,
    }

    const result = ConfigValidator.validateConfig(invalidConfig)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid default view')
    expect(result.errors).toContain('Locale must be a string')
    expect(result.errors).toContain('Time format must be "12h" or "24h"')
    expect(result.errors).toContain('Week starts on must be an integer between 0 and 6')
  })
})

describe('TypeChecker', () => {
  it('should check types correctly', () => {
    expect(TypeChecker.isString('hello')).toBe(true)
    expect(TypeChecker.isString(123)).toBe(false)

    expect(TypeChecker.isNumber(123)).toBe(true)
    expect(TypeChecker.isNumber('123')).toBe(false)
    expect(TypeChecker.isNumber(NaN)).toBe(false)

    expect(TypeChecker.isBoolean(true)).toBe(true)
    expect(TypeChecker.isBoolean('true')).toBe(false)

    expect(TypeChecker.isObject({})).toBe(true)
    expect(TypeChecker.isObject([])).toBe(false)
    expect(TypeChecker.isObject(null)).toBe(false)

    expect(TypeChecker.isArray([])).toBe(true)
    expect(TypeChecker.isArray({})).toBe(false)

    expect(TypeChecker.isFunction(() => {})).toBe(true)
    expect(TypeChecker.isFunction('function')).toBe(false)

    expect(TypeChecker.isDate(new Date())).toBe(true)
    expect(TypeChecker.isDate('2023-12-25')).toBe(false)

    expect(TypeChecker.isNullOrUndefined(null)).toBe(true)
    expect(TypeChecker.isNullOrUndefined(undefined)).toBe(true)
    expect(TypeChecker.isNullOrUndefined('')).toBe(false)

    expect(TypeChecker.isEmptyString('')).toBe(true)
    expect(TypeChecker.isEmptyString('  ')).toBe(true)
    expect(TypeChecker.isEmptyString('hello')).toBe(false)

    expect(TypeChecker.isEmptyObject({})).toBe(true)
    expect(TypeChecker.isEmptyObject({ a: 1 })).toBe(false)

    expect(TypeChecker.isEmptyArray([])).toBe(true)
    expect(TypeChecker.isEmptyArray([1])).toBe(false)
  })
})

describe('Convenience functions', () => {
  it('should export convenience functions', () => {
    expect(typeof isValidDate).toBe('function')
    expect(typeof isValidEvent).toBe('function')
    expect(typeof checkConflicts).toBe('function')
  })

  it('should work with convenience functions', () => {
    expect(isValidDate(new Date())).toBe(true)
    expect(isValidDate('invalid')).toBe(false)

    const validEvent: CalendarEvent = {
      id: 'event-1',
      title: 'Test Event',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      allDay: false,
    }

    expect(isValidEvent(validEvent)).toBe(true)
    expect(isValidEvent({ title: '' })).toBe(false)
  })
})
