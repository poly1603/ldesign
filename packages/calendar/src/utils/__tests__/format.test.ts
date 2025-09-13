/**
 * 格式化工具函数测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DateFormatter,
  NumberFormatter,
  TextFormatter,
  formatDate,
  formatTime,
  formatRelative,
  formatDuration,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  truncate,
  capitalize,
  titleCase,
} from '../format'

// Mock i18n
vi.mock('../i18n', () => ({
  i18n: {
    getCurrentLanguage: () => 'zh-CN',
    formatRelativeTime: (key: string, value?: number) => {
      const map: Record<string, string> = {
        's': '几秒',
        'm': '1分钟',
        'mm': '%d分钟',
        'h': '1小时',
        'hh': '%d小时',
        'd': '1天',
        'dd': '%d天',
        'M': '1个月',
        'MM': '%d个月',
        'y': '1年',
        'yy': '%d年',
        'past': '%s前',
        'future': '%s后',
      }
      let result = map[key] || key
      if (value !== undefined && result.includes('%d')) {
        result = result.replace('%d', String(value))
      }
      return result
    },
  },
}))

describe('DateFormatter', () => {
  const testDate = new Date('2023-12-25T14:30:45')

  it('should format dates with predefined formats', () => {
    expect(DateFormatter.format(testDate, 'short')).toContain('2023')
    expect(DateFormatter.format(testDate, 'medium')).toContain('2023')
    expect(DateFormatter.format(testDate, 'long')).toContain('2023')
    expect(DateFormatter.format(testDate, 'full')).toContain('2023')
  })

  it('should format dates with custom formats', () => {
    expect(DateFormatter.format(testDate, 'YYYY-MM-DD')).toBe('2023-12-25')
    expect(DateFormatter.format(testDate, 'YYYY/MM/DD')).toBe('2023/12/25')
    expect(DateFormatter.format(testDate, 'DD/MM/YYYY')).toBe('25/12/2023')
    expect(DateFormatter.format(testDate, 'HH:mm:ss')).toBe('14:30:45')
    expect(DateFormatter.format(testDate, 'YYYY-MM-DD HH:mm')).toBe('2023-12-25 14:30')
  })

  it('should handle invalid dates', () => {
    expect(DateFormatter.format('invalid', 'YYYY-MM-DD')).toBe('Invalid Date')
  })

  it('should format time correctly', () => {
    const result24h = DateFormatter.formatTime(testDate, '24h')
    expect(result24h).toContain('14')
    expect(result24h).toContain('30')

    const result12h = DateFormatter.formatTime(testDate, '12h')
    expect(result12h).toContain('2')
    expect(result12h).toContain('30')
  })

  it('should format relative time', () => {
    const now = new Date('2023-12-25T15:30:45') // 1小时后
    const result = DateFormatter.formatRelative(testDate, now)
    expect(result).toContain('1小时前')

    const future = new Date('2023-12-25T13:30:45') // 1小时前
    const futureResult = DateFormatter.formatRelative(testDate, future)
    expect(futureResult).toContain('1小时后')
  })

  it('should format duration correctly', () => {
    const start = new Date('2023-12-25T10:00:00')
    const end = new Date('2023-12-25T11:30:00')

    const result = DateFormatter.formatDuration(start, end)
    expect(result).toContain('1小时')
    expect(result).toContain('30分钟')

    // 测试跨天
    const endNextDay = new Date('2023-12-26T11:30:00')
    const dayResult = DateFormatter.formatDuration(start, endNextDay)
    expect(dayResult).toContain('1天')
  })

  it('should handle invalid duration', () => {
    const start = new Date('2023-12-25T10:00:00')
    const end = new Date('2023-12-25T09:00:00') // 结束时间早于开始时间

    expect(DateFormatter.formatDuration(start, end)).toBe('Invalid Duration')
    expect(DateFormatter.formatDuration('invalid', start)).toBe('Invalid Duration')
  })
})

describe('NumberFormatter', () => {
  it('should format numbers correctly', () => {
    expect(NumberFormatter.format(1234.56)).toContain('1')
    expect(NumberFormatter.format(1234.56)).toContain('234')
  })

  it('should format currency correctly', () => {
    const result = NumberFormatter.formatCurrency(1234.56, 'CNY')
    expect(result).toContain('1,234.56') // 可能包含千分位分隔符
  })

  it('should format percentage correctly', () => {
    const result = NumberFormatter.formatPercent(0.1234)
    expect(result).toContain('12') // 12.34%
  })

  it('should format file size correctly', () => {
    expect(NumberFormatter.formatFileSize(0)).toBe('0 B')
    expect(NumberFormatter.formatFileSize(1024)).toBe('1.00 KB')
    expect(NumberFormatter.formatFileSize(1048576)).toBe('1.00 MB')
    expect(NumberFormatter.formatFileSize(1073741824)).toBe('1.00 GB')
    expect(NumberFormatter.formatFileSize(1099511627776)).toBe('1.00 TB')
    expect(NumberFormatter.formatFileSize(500)).toBe('500.00 B')
    expect(NumberFormatter.formatFileSize(1536, 1)).toBe('1.5 KB')
  })

  it('should format ordinal numbers correctly', () => {
    expect(NumberFormatter.formatOrdinal(1, 'zh-CN')).toBe('第1')
    expect(NumberFormatter.formatOrdinal(2, 'zh-CN')).toBe('第2')

    expect(NumberFormatter.formatOrdinal(1, 'en-US')).toBe('1st')
    expect(NumberFormatter.formatOrdinal(2, 'en-US')).toBe('2nd')
    expect(NumberFormatter.formatOrdinal(3, 'en-US')).toBe('3rd')
    expect(NumberFormatter.formatOrdinal(4, 'en-US')).toBe('4th')
    expect(NumberFormatter.formatOrdinal(21, 'en-US')).toBe('21st')
    expect(NumberFormatter.formatOrdinal(22, 'en-US')).toBe('22nd')
    expect(NumberFormatter.formatOrdinal(23, 'en-US')).toBe('23rd')
  })
})

describe('TextFormatter', () => {
  it('should truncate text correctly', () => {
    expect(TextFormatter.truncate('Hello World', 5)).toBe('He...')
    expect(TextFormatter.truncate('Hello', 10)).toBe('Hello')
    expect(TextFormatter.truncate('Hello World', 5, '***')).toBe('He***')
  })

  it('should capitalize text correctly', () => {
    expect(TextFormatter.capitalize('hello world')).toBe('Hello world')
    expect(TextFormatter.capitalize('HELLO WORLD')).toBe('Hello world')
    expect(TextFormatter.capitalize('')).toBe('')
  })

  it('should convert to title case correctly', () => {
    expect(TextFormatter.titleCase('hello world')).toBe('Hello World')
    expect(TextFormatter.titleCase('HELLO WORLD')).toBe('Hello World')
    expect(TextFormatter.titleCase('hello-world')).toBe('Hello-World')
  })

  it('should convert to camel case correctly', () => {
    expect(TextFormatter.camelCase('hello world')).toBe('helloWorld')
    expect(TextFormatter.camelCase('hello-world')).toBe('helloWorld')
    expect(TextFormatter.camelCase('hello_world')).toBe('helloWorld')
    expect(TextFormatter.camelCase('hello')).toBe('hello')
  })

  it('should convert to kebab case correctly', () => {
    expect(TextFormatter.kebabCase('helloWorld')).toBe('hello-world')
    expect(TextFormatter.kebabCase('hello world')).toBe('hello-world')
    expect(TextFormatter.kebabCase('hello_world')).toBe('hello-world')
    expect(TextFormatter.kebabCase('hello')).toBe('hello')
  })

  it('should convert to snake case correctly', () => {
    expect(TextFormatter.snakeCase('helloWorld')).toBe('hello_world')
    expect(TextFormatter.snakeCase('hello world')).toBe('hello_world')
    expect(TextFormatter.snakeCase('hello-world')).toBe('hello_world')
    expect(TextFormatter.snakeCase('hello')).toBe('hello')
  })

  it('should strip HTML tags correctly', () => {
    expect(TextFormatter.stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
    expect(TextFormatter.stripHtml('Hello World')).toBe('Hello World')
    expect(TextFormatter.stripHtml('<div><span>Test</span></div>')).toBe('Test')
  })

  it('should escape HTML correctly', () => {
    expect(TextFormatter.escapeHtml('<script>alert("xss")</script>')).toContain('&lt;')
    expect(TextFormatter.escapeHtml('Hello & World')).toContain('&amp;')
  })

  it('should unescape HTML correctly', () => {
    expect(TextFormatter.unescapeHtml('&lt;script&gt;')).toBe('<script>')
    expect(TextFormatter.unescapeHtml('Hello &amp; World')).toBe('Hello & World')
  })

  it('should format phone numbers correctly', () => {
    expect(TextFormatter.formatPhone('13812345678')).toBe('138 1234 5678')
    expect(TextFormatter.formatPhone('1234567890')).toBe('(123) 456-7890')
    expect(TextFormatter.formatPhone('123')).toBe('123') // 不符合格式的保持原样
  })

  it('should format ID card numbers correctly', () => {
    expect(TextFormatter.formatIdCard('123456789012345678')).toBe('123456 78901234 5678')
    expect(TextFormatter.formatIdCard('123456')).toBe('123456') // 不符合格式的保持原样
  })
})

describe('Convenience functions', () => {
  it('should export convenience functions', () => {
    expect(typeof formatDate).toBe('function')
    expect(typeof formatTime).toBe('function')
    expect(typeof formatRelative).toBe('function')
    expect(typeof formatDuration).toBe('function')
    expect(typeof formatNumber).toBe('function')
    expect(typeof formatCurrency).toBe('function')
    expect(typeof formatPercent).toBe('function')
    expect(typeof formatFileSize).toBe('function')
    expect(typeof truncate).toBe('function')
    expect(typeof capitalize).toBe('function')
    expect(typeof titleCase).toBe('function')
  })

  it('should work with convenience functions', () => {
    const testDate = new Date('2023-12-25T14:30:45')

    expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2023-12-25')
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(truncate('Hello World', 5)).toBe('He...')
    expect(capitalize('hello')).toBe('Hello')
    expect(titleCase('hello world')).toBe('Hello World')
  })
})
