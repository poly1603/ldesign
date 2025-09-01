/**
 * 格式化工具函数测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatUtils } from '../../src/utils/format'

describe('formatUtils', () => {
  beforeEach(() => {
    // 设置固定的时间用于测试
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatFileSize', () => {
    it('应该格式化字节大小', () => {
      expect(formatUtils.formatFileSize(0)).toBe('0 B')
      expect(formatUtils.formatFileSize(512)).toBe('512 B')
      expect(formatUtils.formatFileSize(1023)).toBe('1023 B')
    })

    it('应该格式化KB大小', () => {
      expect(formatUtils.formatFileSize(1024)).toBe('1 KB')
      expect(formatUtils.formatFileSize(1536)).toBe('1.5 KB')
      expect(formatUtils.formatFileSize(2048)).toBe('2 KB')
    })

    it('应该格式化MB大小', () => {
      expect(formatUtils.formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatUtils.formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
      expect(formatUtils.formatFileSize(1024 * 1024 * 2)).toBe('2 MB')
    })

    it('应该格式化GB大小', () => {
      expect(formatUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatUtils.formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB')
    })

    it('应该格式化TB大小', () => {
      expect(formatUtils.formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
    })

    it('应该处理负数', () => {
      expect(formatUtils.formatFileSize(-1024)).toBe('0 B')
    })

    it('应该处理小数精度', () => {
      expect(formatUtils.formatFileSize(1536, 2)).toBe('1.50 KB')
      expect(formatUtils.formatFileSize(1536, 0)).toBe('2 KB')
    })
  })

  describe('formatTimeAgo', () => {
    it('应该格式化秒前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 30 * 1000)).toBe('30秒前')
      expect(formatUtils.formatTimeAgo(now - 45 * 1000)).toBe('45秒前')
    })

    it('应该格式化分钟前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 60 * 1000)).toBe('1分钟前')
      expect(formatUtils.formatTimeAgo(now - 2 * 60 * 1000)).toBe('2分钟前')
      expect(formatUtils.formatTimeAgo(now - 30 * 60 * 1000)).toBe('30分钟前')
    })

    it('应该格式化小时前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 60 * 60 * 1000)).toBe('1小时前')
      expect(formatUtils.formatTimeAgo(now - 2 * 60 * 60 * 1000)).toBe('2小时前')
      expect(formatUtils.formatTimeAgo(now - 12 * 60 * 60 * 1000)).toBe('12小时前')
    })

    it('应该格式化天前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 24 * 60 * 60 * 1000)).toBe('1天前')
      expect(formatUtils.formatTimeAgo(now - 3 * 24 * 60 * 60 * 1000)).toBe('3天前')
    })

    it('应该格式化周前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 7 * 24 * 60 * 60 * 1000)).toBe('1周前')
      expect(formatUtils.formatTimeAgo(now - 2 * 7 * 24 * 60 * 60 * 1000)).toBe('2周前')
    })

    it('应该格式化月前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 30 * 24 * 60 * 60 * 1000)).toBe('1个月前')
      expect(formatUtils.formatTimeAgo(now - 2 * 30 * 24 * 60 * 60 * 1000)).toBe('2个月前')
    })

    it('应该格式化年前', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now - 365 * 24 * 60 * 60 * 1000)).toBe('1年前')
      expect(formatUtils.formatTimeAgo(now - 2 * 365 * 24 * 60 * 60 * 1000)).toBe('2年前')
    })

    it('应该处理未来时间', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now + 60 * 1000)).toBe('刚刚')
    })

    it('应该处理刚刚', () => {
      const now = Date.now()
      expect(formatUtils.formatTimeAgo(now)).toBe('刚刚')
      expect(formatUtils.formatTimeAgo(now - 5 * 1000)).toBe('刚刚')
    })
  })

  describe('formatTemplateName', () => {
    it('应该格式化模板名称', () => {
      expect(formatUtils.formatTemplateName('login-modern-v2')).toBe('Login Modern V2')
      expect(formatUtils.formatTemplateName('dashboard_analytics')).toBe('Dashboard Analytics')
      expect(formatUtils.formatTemplateName('user.profile.settings')).toBe('User Profile Settings')
    })

    it('应该处理驼峰命名', () => {
      expect(formatUtils.formatTemplateName('loginModernTemplate')).toBe('Login Modern Template')
      expect(formatUtils.formatTemplateName('dashboardAnalyticsView')).toBe('Dashboard Analytics View')
    })

    it('应该处理单词', () => {
      expect(formatUtils.formatTemplateName('login')).toBe('Login')
      expect(formatUtils.formatTemplateName('DASHBOARD')).toBe('Dashboard')
    })

    it('应该处理空字符串', () => {
      expect(formatUtils.formatTemplateName('')).toBe('')
      expect(formatUtils.formatTemplateName('   ')).toBe('')
    })

    it('应该处理特殊字符', () => {
      expect(formatUtils.formatTemplateName('login@modern#template')).toBe('Login Modern Template')
      expect(formatUtils.formatTemplateName('user$profile%settings')).toBe('User Profile Settings')
    })
  })

  describe('formatError', () => {
    it('应该格式化Error对象', () => {
      const error = new Error('Test error message')
      const formatted = formatUtils.formatError(error)

      expect(formatted).toContain('Test error message')
      expect(formatted).toContain('Error')
    })

    it('应该格式化字符串错误', () => {
      const formatted = formatUtils.formatError('Simple error message')
      expect(formatted).toBe('Simple error message')
    })

    it('应该格式化对象错误', () => {
      const error = { message: 'Object error', code: 500 }
      const formatted = formatUtils.formatError(error)

      expect(formatted).toContain('Object error')
      expect(formatted).toContain('500')
    })

    it('应该处理未知错误类型', () => {
      const formatted = formatUtils.formatError(null)
      expect(formatted).toBe('Unknown error')

      const formatted2 = formatUtils.formatError(undefined)
      expect(formatted2).toBe('Unknown error')
    })

    it('应该包含堆栈信息', () => {
      const error = new Error('Test error')
      const formatted = formatUtils.formatError(error, true)

      expect(formatted).toContain('Test error')
      expect(formatted).toContain('Stack trace:')
    })
  })

  describe('formatDuration', () => {
    it('应该格式化毫秒', () => {
      expect(formatUtils.formatDuration(500)).toBe('500ms')
      expect(formatUtils.formatDuration(999)).toBe('999ms')
    })

    it('应该格式化秒', () => {
      expect(formatUtils.formatDuration(1000)).toBe('1s')
      expect(formatUtils.formatDuration(1500)).toBe('1.5s')
      expect(formatUtils.formatDuration(30000)).toBe('30s')
    })

    it('应该格式化分钟', () => {
      expect(formatUtils.formatDuration(60000)).toBe('1m')
      expect(formatUtils.formatDuration(90000)).toBe('1m 30s')
      expect(formatUtils.formatDuration(120000)).toBe('2m')
    })

    it('应该格式化小时', () => {
      expect(formatUtils.formatDuration(3600000)).toBe('1h')
      expect(formatUtils.formatDuration(3660000)).toBe('1h 1m')
      expect(formatUtils.formatDuration(7200000)).toBe('2h')
    })

    it('应该处理零值', () => {
      expect(formatUtils.formatDuration(0)).toBe('0ms')
    })

    it('应该处理负值', () => {
      expect(formatUtils.formatDuration(-1000)).toBe('0ms')
    })
  })

  describe('formatPercentage', () => {
    it('应该格式化百分比', () => {
      expect(formatUtils.formatPercentage(0.5)).toBe('50%')
      expect(formatUtils.formatPercentage(0.75)).toBe('75%')
      expect(formatUtils.formatPercentage(1)).toBe('100%')
    })

    it('应该处理小数精度', () => {
      expect(formatUtils.formatPercentage(0.123, 1)).toBe('12.3%')
      expect(formatUtils.formatPercentage(0.123, 2)).toBe('12.30%')
      expect(formatUtils.formatPercentage(0.123, 0)).toBe('12%')
    })

    it('应该处理超过100%的值', () => {
      expect(formatUtils.formatPercentage(1.5)).toBe('150%')
      expect(formatUtils.formatPercentage(2)).toBe('200%')
    })

    it('应该处理负值', () => {
      expect(formatUtils.formatPercentage(-0.1)).toBe('-10%')
    })

    it('应该处理零值', () => {
      expect(formatUtils.formatPercentage(0)).toBe('0%')
    })
  })

  describe('formatNumber', () => {
    it('应该格式化数字', () => {
      expect(formatUtils.formatNumber(1000)).toBe('1,000')
      expect(formatUtils.formatNumber(1000000)).toBe('1,000,000')
      expect(formatUtils.formatNumber(1234567)).toBe('1,234,567')
    })

    it('应该处理小数', () => {
      expect(formatUtils.formatNumber(1234.56)).toBe('1,234.56')
      expect(formatUtils.formatNumber(1000.123)).toBe('1,000.123')
    })

    it('应该处理负数', () => {
      expect(formatUtils.formatNumber(-1000)).toBe('-1,000')
      expect(formatUtils.formatNumber(-1234.56)).toBe('-1,234.56')
    })

    it('应该处理小数精度', () => {
      expect(formatUtils.formatNumber(1234.5678, 2)).toBe('1,234.57')
      expect(formatUtils.formatNumber(1234.5678, 0)).toBe('1,235')
    })

    it('应该处理零值', () => {
      expect(formatUtils.formatNumber(0)).toBe('0')
    })
  })

  describe('formatCurrency', () => {
    it('应该格式化货币', () => {
      expect(formatUtils.formatCurrency(1000)).toBe('¥1,000.00')
      expect(formatUtils.formatCurrency(1234.56)).toBe('¥1,234.56')
    })

    it('应该支持不同货币', () => {
      expect(formatUtils.formatCurrency(1000, 'USD')).toBe('$1,000.00')
      expect(formatUtils.formatCurrency(1000, 'EUR')).toBe('€1,000.00')
    })

    it('应该处理负值', () => {
      expect(formatUtils.formatCurrency(-1000)).toBe('-¥1,000.00')
    })

    it('应该处理零值', () => {
      expect(formatUtils.formatCurrency(0)).toBe('¥0.00')
    })
  })

  describe('formatDate', () => {
    it('应该格式化日期', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(formatUtils.formatDate(date)).toBe('2024-01-01')
    })

    it('应该支持自定义格式', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(formatUtils.formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/01')
      expect(formatUtils.formatDate(date, 'MM-DD-YYYY')).toBe('01-01-2024')
    })

    it('应该处理时间戳', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z').getTime()
      expect(formatUtils.formatDate(timestamp)).toBe('2024-01-01')
    })

    it('应该处理字符串日期', () => {
      expect(formatUtils.formatDate('2024-01-01')).toBe('2024-01-01')
    })
  })

  describe('formatTime', () => {
    it('应该格式化时间', () => {
      const date = new Date('2024-01-01T12:30:45Z')
      expect(formatUtils.formatTime(date)).toBe('12:30:45')
    })

    it('应该支持12小时制', () => {
      const date = new Date('2024-01-01T14:30:45Z')
      expect(formatUtils.formatTime(date, true)).toBe('2:30:45 PM')
    })

    it('应该处理午夜和正午', () => {
      const midnight = new Date('2024-01-01T00:00:00Z')
      const noon = new Date('2024-01-01T12:00:00Z')

      expect(formatUtils.formatTime(midnight, true)).toBe('12:00:00 AM')
      expect(formatUtils.formatTime(noon, true)).toBe('12:00:00 PM')
    })
  })
})
