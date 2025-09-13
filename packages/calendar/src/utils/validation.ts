/**
 * 验证工具函数
 * 
 * 提供数据验证相关的工具函数：
 * - 日期验证
 * - 事件验证
 * - 配置验证
 * - 类型检查
 * - 格式验证
 */

import type { CalendarEvent } from '../types/event'
import type { CalendarConfig } from '../types/calendar'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 验证规则接口
 */
export interface ValidationRule<T = any> {
  name: string
  validator: (value: T) => boolean | string
  message?: string
  required?: boolean
}

/**
 * 验证器类
 */
export class Validator {
  private rules: ValidationRule[] = []

  /**
   * 添加验证规则
   * @param rule 验证规则
   */
  addRule(rule: ValidationRule): this {
    this.rules.push(rule)
    return this
  }

  /**
   * 验证值
   * @param value 要验证的值
   */
  validate(value: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    }

    for (const rule of this.rules) {
      // 检查必填项
      if (rule.required && (value === null || value === undefined || value === '')) {
        result.valid = false
        result.errors.push(rule.message || `${rule.name} is required`)
        continue
      }

      // 如果值为空且不是必填项，跳过验证
      if (!rule.required && (value === null || value === undefined || value === '')) {
        continue
      }

      // 执行验证
      const validationResult = rule.validator(value)
      if (validationResult === false) {
        result.valid = false
        result.errors.push(rule.message || `${rule.name} validation failed`)
      } else if (typeof validationResult === 'string') {
        result.valid = false
        result.errors.push(validationResult)
      }
    }

    return result
  }

  /**
   * 清空规则
   */
  clear(): this {
    this.rules = []
    return this
  }
}

/**
 * 日期验证器
 */
export class DateValidator {
  /**
   * 验证日期是否有效
   * @param date 日期
   */
  static isValidDate(date: any): boolean {
    if (date instanceof Date) {
      return !isNaN(date.getTime())
    }
    
    if (typeof date === 'string' || typeof date === 'number') {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }
    
    return false
  }

  /**
   * 验证日期字符串格式
   * @param dateString 日期字符串
   * @param format 期望格式
   */
  static isValidDateFormat(dateString: string, format: string): boolean {
    // 简单的格式验证，可以根据需要扩展
    const formatRegexMap: Record<string, RegExp> = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'YYYY-MM-DD HH:mm': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      'YYYY-MM-DD HH:mm:ss': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
    }

    const regex = formatRegexMap[format]
    if (!regex) {
      return false
    }

    return regex.test(dateString)
  }

  /**
   * 验证日期范围
   * @param date 日期
   * @param minDate 最小日期
   * @param maxDate 最大日期
   */
  static isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
    if (!this.isValidDate(date)) {
      return false
    }

    if (minDate && date < minDate) {
      return false
    }

    if (maxDate && date > maxDate) {
      return false
    }

    return true
  }

  /**
   * 验证时间格式
   * @param timeString 时间字符串
   */
  static isValidTimeFormat(timeString: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(timeString)
  }
}

/**
 * 事件验证器
 */
export class EventValidator {
  /**
   * 验证事件对象
   * @param event 事件对象
   */
  static validateEvent(event: Partial<CalendarEvent>): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    }

    // 验证必填字段
    if (!event.id) {
      result.valid = false
      result.errors.push('Event ID is required')
    }

    if (!event.title || event.title.trim() === '') {
      result.valid = false
      result.errors.push('Event title is required')
    }

    if (!event.start) {
      result.valid = false
      result.errors.push('Event start time is required')
    }

    if (!event.end) {
      result.valid = false
      result.errors.push('Event end time is required')
    }

    // 验证日期
    if (event.start && !DateValidator.isValidDate(event.start)) {
      result.valid = false
      result.errors.push('Invalid start date')
    }

    if (event.end && !DateValidator.isValidDate(event.end)) {
      result.valid = false
      result.errors.push('Invalid end date')
    }

    // 验证时间逻辑
    if (event.start && event.end) {
      const startDate = new Date(event.start)
      const endDate = new Date(event.end)

      if (startDate >= endDate) {
        result.valid = false
        result.errors.push('Start time must be before end time')
      }

      // 检查事件持续时间是否合理
      const duration = endDate.getTime() - startDate.getTime()
      const maxDuration = 7 * 24 * 60 * 60 * 1000 // 7天
      
      if (duration > maxDuration) {
        result.warnings.push('Event duration is longer than 7 days')
      }
    }

    // 验证标题长度
    if (event.title && event.title.length > 100) {
      result.warnings.push('Event title is longer than 100 characters')
    }

    // 验证描述长度
    if (event.description && event.description.length > 1000) {
      result.warnings.push('Event description is longer than 1000 characters')
    }

    // 验证颜色格式
    if (event.color && !this.isValidColor(event.color)) {
      result.valid = false
      result.errors.push('Invalid color format')
    }

    return result
  }

  /**
   * 验证颜色格式
   * @param color 颜色值
   */
  private static isValidColor(color: string): boolean {
    // 支持十六进制颜色和CSS颜色名称
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[01]?\.?\d*\s*\)$/
    
    return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color)
  }

  /**
   * 验证事件冲突
   * @param newEvent 新事件
   * @param existingEvents 现有事件列表
   */
  static checkEventConflict(
    newEvent: CalendarEvent,
    existingEvents: CalendarEvent[]
  ): CalendarEvent[] {
    const conflicts: CalendarEvent[] = []
    const newStart = new Date(newEvent.start)
    const newEnd = new Date(newEvent.end)

    for (const event of existingEvents) {
      if (event.id === newEvent.id) {
        continue // 跳过自己
      }

      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // 检查时间重叠
      if (
        (newStart < eventEnd && newEnd > eventStart) ||
        (eventStart < newEnd && eventEnd > newStart)
      ) {
        conflicts.push(event)
      }
    }

    return conflicts
  }
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证日历配置
   * @param config 配置对象
   */
  static validateConfig(config: Partial<CalendarConfig>): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    }

    // 验证视图配置
    if (config.defaultView && !['month', 'week', 'day'].includes(config.defaultView)) {
      result.valid = false
      result.errors.push('Invalid default view')
    }

    // 验证语言配置
    if (config.locale && typeof config.locale !== 'string') {
      result.valid = false
      result.errors.push('Locale must be a string')
    }

    // 验证时间格式
    if (config.timeFormat && !['12h', '24h'].includes(config.timeFormat)) {
      result.valid = false
      result.errors.push('Time format must be "12h" or "24h"')
    }

    // 验证周开始日
    if (config.weekStartsOn !== undefined) {
      if (!Number.isInteger(config.weekStartsOn) || config.weekStartsOn < 0 || config.weekStartsOn > 6) {
        result.valid = false
        result.errors.push('Week starts on must be an integer between 0 and 6')
      }
    }

    return result
  }
}

/**
 * 类型检查器
 */
export class TypeChecker {
  /**
   * 检查是否为字符串
   */
  static isString(value: any): value is string {
    return typeof value === 'string'
  }

  /**
   * 检查是否为数字
   */
  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value)
  }

  /**
   * 检查是否为布尔值
   */
  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean'
  }

  /**
   * 检查是否为对象
   */
  static isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  /**
   * 检查是否为数组
   */
  static isArray(value: any): value is any[] {
    return Array.isArray(value)
  }

  /**
   * 检查是否为函数
   */
  static isFunction(value: any): value is Function {
    return typeof value === 'function'
  }

  /**
   * 检查是否为日期
   */
  static isDate(value: any): value is Date {
    return value instanceof Date
  }

  /**
   * 检查是否为空值
   */
  static isNullOrUndefined(value: any): value is null | undefined {
    return value === null || value === undefined
  }

  /**
   * 检查是否为空字符串
   */
  static isEmptyString(value: any): boolean {
    return this.isString(value) && value.trim() === ''
  }

  /**
   * 检查是否为空对象
   */
  static isEmptyObject(value: any): boolean {
    return this.isObject(value) && Object.keys(value).length === 0
  }

  /**
   * 检查是否为空数组
   */
  static isEmptyArray(value: any): boolean {
    return this.isArray(value) && value.length === 0
  }
}

// 创建预定义验证器
export const eventValidator = new Validator()
  .addRule({
    name: 'title',
    validator: (value: string) => TypeChecker.isString(value) && value.trim().length > 0,
    message: 'Title is required and must be a non-empty string',
    required: true,
  })
  .addRule({
    name: 'start',
    validator: (value: any) => DateValidator.isValidDate(value),
    message: 'Start date must be a valid date',
    required: true,
  })
  .addRule({
    name: 'end',
    validator: (value: any) => DateValidator.isValidDate(value),
    message: 'End date must be a valid date',
    required: true,
  })

// 导出便捷函数
export const isValidDate = DateValidator.isValidDate
export const isValidEvent = (event: Partial<CalendarEvent>) => EventValidator.validateEvent(event).valid
export const checkConflicts = EventValidator.checkEventConflict
