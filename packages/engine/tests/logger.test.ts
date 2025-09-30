import type { LogEntry, Logger } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createLogger,
  logFormatters,
  logTransports,
} from '../src/logger/logger'

// Mock console methods
const originalConsole = { ...console }

describe('logger', () => {
  let logger: Logger

  beforeEach(() => {
    logger = createLogger('debug')
    // Mock console methods
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.debug = vi.fn()
    console.info = vi.fn()
  })

  afterEach(() => {
    // Restore console methods
    Object.assign(console, originalConsole)
  })

  describe('基础功能', () => {
    it('应该创建日志器实例', () => {
      expect(logger).toBeDefined()
      expect(logger.getLevel()).toBe('debug')
      expect(logger.getMaxLogs()).toBe(1000)
    })

    it('应该记录不同级别的日志', () => {
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')

      const logs = logger.getLogs()
      expect(logs).toHaveLength(4)
      expect(logs[0].level).toBe('error')
      expect(logs[1].level).toBe('warn')
      expect(logs[2].level).toBe('info')
      expect(logs[3].level).toBe('debug')
    })

    it('应该记录带数据的日志', () => {
      const testData = { userId: 123, action: 'login' }
      logger.info('User action', testData)

      const logs = logger.getLogs()
      expect(logs[0].data).toEqual(testData)
    })

    it('应该按时间戳排序日志（最新的在前）', () => {
      const startTime = Date.now()

      logger.info('First message')
      logger.info('Second message')
      logger.info('Third message')

      const logs = logger.getLogs()
      expect(logs[0].message).toBe('Third message')
      expect(logs[1].message).toBe('Second message')
      expect(logs[2].message).toBe('First message')

      // 验证时间戳
      expect(logs[0].timestamp).toBeGreaterThanOrEqual(startTime)
      expect(logs[1].timestamp).toBeGreaterThanOrEqual(startTime)
      expect(logs[2].timestamp).toBeGreaterThanOrEqual(startTime)
    })

    it('应该输出到控制台', () => {
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')

      // 新实现使用不同的 console 方法
      expect(console.debug).toHaveBeenCalled()
      expect(console.info).toHaveBeenCalled()
      expect(console.warn).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('日志级别控制', () => {
    it('应该根据级别过滤日志', () => {
      logger.setLevel('warn')

      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')

      const logs = logger.getLogs()
      expect(logs).toHaveLength(2)
      expect(logs[0].level).toBe('error')
      expect(logs[1].level).toBe('warn')
    })

    it('应该正确设置和获取日志级别', () => {
      logger.setLevel('error')
      expect(logger.getLevel()).toBe('error')

      logger.setLevel('info')
      expect(logger.getLevel()).toBe('info')
    })

    it('应该在不同级别下正确过滤控制台输出', () => {
      // 创建新的 logger 实例并清除 mock
      const errorSpy = vi.fn()
      const debugSpy = vi.fn()
      const infoSpy = vi.fn()
      const warnSpy = vi.fn()

      console.error = errorSpy
      console.debug = debugSpy
      console.info = infoSpy
      console.warn = warnSpy

      const testLogger = createLogger('error')

      testLogger.debug('Debug message')
      testLogger.info('Info message')
      testLogger.warn('Warning message')
      testLogger.error('Error message')

      // 只有 error 级别的日志应该输出到控制台
      expect(errorSpy).toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })

  describe('日志管理', () => {
    it('应该限制最大日志数量', () => {
      logger.setMaxLogs(3)

      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')
      logger.info('Message 4')
      logger.info('Message 5')

      const logs = logger.getLogs()
      expect(logs).toHaveLength(3)
      expect(logs[0].message).toBe('Message 5')
      expect(logs[1].message).toBe('Message 4')
      expect(logs[2].message).toBe('Message 3')
    })

    it('应该清空日志', () => {
      logger.info('Message 1')
      logger.info('Message 2')

      expect(logger.getLogs()).toHaveLength(2)

      logger.clearLogs()
      expect(logger.getLogs()).toHaveLength(0)
    })

    it('应该使用 clear() 方法清空日志', () => {
      logger.info('Message 1')
      logger.info('Message 2')

      expect(logger.getLogs()).toHaveLength(2)

      logger.clear()
      expect(logger.getLogs()).toHaveLength(0)
    })

    it('应该设置和获取最大日志数量', () => {
      expect(logger.getMaxLogs()).toBe(1000)

      logger.setMaxLogs(500)
      expect(logger.getMaxLogs()).toBe(500)
    })

    it('应该在设置更小的最大值时截断现有日志', () => {
      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')
      logger.info('Message 4')

      expect(logger.getLogs()).toHaveLength(4)

      logger.setMaxLogs(2)
      expect(logger.getLogs()).toHaveLength(2)
      expect(logger.getLogs()[0].message).toBe('Message 4')
      expect(logger.getLogs()[1].message).toBe('Message 3')
    })
  })

  describe('日志查询', () => {
    beforeEach(() => {
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')
    })

    it('应该按级别获取日志', () => {
      const errorLogs = (logger as any).getLogsByLevel('error')
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].level).toBe('error')

      const infoLogs = (logger as any).getLogsByLevel('info')
      expect(infoLogs).toHaveLength(1)
      expect(infoLogs[0].level).toBe('info')
    })

    it('应该按时间范围获取日志', () => {
      const now = Date.now()
      const oneHourAgo = now - 60 * 60 * 1000
      const oneHourLater = now + 60 * 60 * 1000

      const logsInRange = (logger as any).getLogsByTimeRange(oneHourAgo, oneHourLater)
      expect(logsInRange).toHaveLength(4)

      const logsInPast = (logger as any).getLogsByTimeRange(
        oneHourAgo - 1000,
        oneHourAgo,
      )
      expect(logsInPast).toHaveLength(0)
    })

    it('应该搜索日志', () => {
      logger.info('User login successful')
      logger.info('User logout')
      logger.error('Database connection failed')

      const userLogs = (logger as any).searchLogs('user')
      expect(userLogs).toHaveLength(2)

      const loginLogs = (logger as any).searchLogs('login')
      expect(loginLogs).toHaveLength(1)

      const databaseLogs = (logger as any).searchLogs('database')
      expect(databaseLogs).toHaveLength(1)
    })

    it('应该获取日志统计信息', () => {
      logger.info('Info 1')
      logger.info('Info 2')
      logger.warn('Warning 1')
      logger.error('Error 1')

      const stats = (logger as any).getLogStats()
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.byLevel.info).toBeGreaterThan(0)
      expect(stats.byLevel.warn).toBeGreaterThan(0)
      expect(stats.byLevel.error).toBeGreaterThan(0)
      expect(stats.recent24h).toBeGreaterThan(0)
      expect(stats.recentHour).toBeGreaterThan(0)
    })
  })

  describe('日志导出', () => {
    beforeEach(() => {
      logger.info('Test message 1', { data: 'test1' })
      logger.warn('Test message 2', { data: 'test2' })
      logger.error('Test message 3', { data: 'test3' })
    })

    it('应该导出 JSON 格式的日志', () => {
      const exported = (logger as any).exportLogs('json')
      expect(() => JSON.parse(exported)).not.toThrow()

      const logs = JSON.parse(exported)
      expect(Array.isArray(logs)).toBe(true)
      expect(logs.length).toBeGreaterThan(0)
    })

    it('应该导出 CSV 格式的日志', () => {
      const exported = (logger as any).exportLogs('csv')
      expect(exported).toContain('timestamp,level,message,data') // 修正列顺序
      expect(exported).toContain('Test message 1')
      expect(exported).toContain('Test message 2')
      expect(exported).toContain('Test message 3')
    })

    it('应该导出文本格式的日志', () => {
      const exported = (logger as any).exportLogs('txt')
      expect(exported).toContain('Test message 1')
      expect(exported).toContain('Test message 2')
      expect(exported).toContain('Test message 3')
      expect(exported).toContain('INFO')
      expect(exported).toContain('WARN')
      expect(exported).toContain('ERROR')
    })

    it('应该默认导出 JSON 格式', () => {
      const exported = (logger as any).exportLogs()
      expect(() => JSON.parse(exported)).not.toThrow()
    })
  })

  describe('子日志器', () => {
    it('应该创建带前缀的子日志器', () => {
      const childLogger = (logger as any).createChild('[MODULE]')

      childLogger.info('Child message')

      const logs = logger.getLogs()
      expect(logs[0].message).toBe('[MODULE] Child message')
    })

    it('应该创建命名空间日志器', () => {
      const nsLogger = (logger as any).namespace('auth')

      nsLogger.info('Authentication successful')

      const logs = logger.getLogs()
      expect(logs[0].message).toBe('[auth] Authentication successful')
    })

    it('子日志器应该继承父日志器的配置', () => {
      logger.setLevel('warn')
      const childLogger = (logger as any).createChild('[CHILD]')

      expect(childLogger.getLevel()).toBe('warn')
      expect(childLogger.getMaxLogs()).toBe(logger.getMaxLogs())
    })

    it('子日志器的配置更改应该影响父日志器', () => {
      const childLogger = (logger as any).createChild('[CHILD]')

      childLogger.setLevel('error')
      expect(logger.getLevel()).toBe('error')

      childLogger.setMaxLogs(100)
      expect(logger.getMaxLogs()).toBe(100)
    })

    it('子日志器应该共享父日志器的日志存储', () => {
      const childLogger = (logger as any).createChild('[CHILD]')

      logger.info('Parent message')
      childLogger.info('Child message')

      const parentLogs = logger.getLogs()
      const childLogs = childLogger.getLogs()

      expect(parentLogs).toEqual(childLogs)
      expect(parentLogs).toHaveLength(2)
    })
  })
})

describe('日志格式化器', () => {
  let testEntry: LogEntry

  beforeEach(() => {
    testEntry = {
      level: 'info',
      message: 'Test message',
      timestamp: 1640995200000, // 2022-01-01 00:00:00 UTC
      data: { userId: 123, action: 'login' },
    }
  })

  describe('simple 格式化器', () => {
    it('应该格式化简单日志', () => {
      const formatted = logFormatters.simple(testEntry)
      expect(formatted).toContain('INFO')
      expect(formatted).toContain('Test message')
      expect(formatted).toMatch(/\[\d{1,2}:\d{2}:\d{2}\]/) // 匹配时间格式
    })

    it('应该处理没有数据的日志', () => {
      const entryWithoutData = { ...testEntry, data: undefined }
      const formatted = logFormatters.simple(entryWithoutData)
      expect(formatted).toContain('INFO')
      expect(formatted).toContain('Test message')
    })
  })

  describe('detailed 格式化器', () => {
    it('应该格式化详细日志', () => {
      const formatted = logFormatters.detailed(testEntry)
      expect(formatted).toContain('INFO')
      expect(formatted).toContain('Test message')
      expect(formatted).toContain('2022-01-01')
      expect(formatted).toContain('userId')
      expect(formatted).toContain('123')
    })

    it('应该处理没有数据的日志', () => {
      const entryWithoutData = { ...testEntry, data: undefined }
      const formatted = logFormatters.detailed(entryWithoutData)
      expect(formatted).toContain('INFO')
      expect(formatted).toContain('Test message')
      expect(formatted).not.toContain('Data:')
    })
  })

  describe('json 格式化器', () => {
    it('应该格式化为 JSON', () => {
      const formatted = logFormatters.json(testEntry)
      expect(() => JSON.parse(formatted)).not.toThrow()

      const parsed = JSON.parse(formatted)
      expect(parsed.level).toBe('info')
      expect(parsed.message).toBe('Test message')
      expect(parsed.timestamp).toBe('2022-01-01T00:00:00.000Z') // JSON 格式化器将时间戳转换为 ISO 字符串
      expect(parsed.data).toEqual({ userId: 123, action: 'login' })
    })
  })
})

describe('日志传输器', () => {
  let testEntry: LogEntry

  beforeEach(() => {
    testEntry = {
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
      data: { test: 'data' },
    }

    // Mock console methods
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    // Restore console methods
    Object.assign(console, originalConsole)
  })

  describe('console 传输器', () => {
    it('应该输出到控制台', () => {
      const transport = logTransports.console()
      transport(testEntry)

      expect(console.log).toHaveBeenCalled()
    })

    it('应该根据日志级别选择正确的控制台方法', () => {
      const consoleTransport = logTransports.console()

      consoleTransport({ ...testEntry, level: 'info' })
      expect(console.log).toHaveBeenCalled()

      consoleTransport({ ...testEntry, level: 'warn' })
      expect(console.warn).toHaveBeenCalled()

      consoleTransport({ ...testEntry, level: 'error' })
      expect(console.error).toHaveBeenCalled()
    })

    it('应该使用自定义格式化器', () => {
      const customFormatter = vi
        .fn()
        .mockReturnValue('Custom formatted message')
      const transport = logTransports.console(customFormatter)

      transport(testEntry)

      expect(customFormatter).toHaveBeenCalledWith(testEntry)
      expect(console.log).toHaveBeenCalledWith('Custom formatted message')
    })
  })

  describe('localStorage 传输器', () => {
    let mockLocalStorage: { [key: string]: string }

    beforeEach(() => {
      mockLocalStorage = {}

      // Mock localStorage
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            mockLocalStorage[key] = value
          }),
        },
        writable: true,
      })
    })

    it('应该存储日志到 localStorage', () => {
      const transport = logTransports.localStorage()
      transport(testEntry)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'engine-logs',
        expect.stringContaining('"message":"Test message"'),
      )
    })

    it('应该使用自定义键名', () => {
      const transport = logTransports.localStorage('custom-logs')
      transport(testEntry)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'custom-logs',
        expect.any(String),
      )
    })

    it('应该限制存储的日志数量', () => {
      const transport = logTransports.localStorage('test-logs', 2)

      transport({ ...testEntry, message: 'Message 1' })
      transport({ ...testEntry, message: 'Message 2' })
      transport({ ...testEntry, message: 'Message 3' })

      const storedData = JSON.parse(mockLocalStorage['test-logs'])
      expect(storedData).toHaveLength(2)
      expect(storedData[0].message).toBe('Message 3')
      expect(storedData[1].message).toBe('Message 2')
    })

    it('应该处理 localStorage 错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      // Mock localStorage.setItem to throw an error
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const transport = logTransports.localStorage()

      expect(() => transport(testEntry)).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store log in localStorage:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('remote 传输器', () => {
    let mockFetch: any

    beforeEach(() => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
      globalThis.fetch = mockFetch
    })

    it('应该批量发送日志到远程服务', async () => {
      const config = {
        endpoint: 'https://api.example.com/logs',
        batchSize: 2,
      }
      const transport = logTransports.remote(config)

      // 发送第一条日志（不应该触发请求）
      await transport({ ...testEntry, message: 'Message 1' })
      expect(mockFetch).not.toHaveBeenCalled()

      // 发送第二条日志（应该触发批量请求）
      await transport({ ...testEntry, message: 'Message 2' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"message":"Message 1"'),
        }),
      )
    })

    it('应该包含 API 密钥', async () => {
      const config = {
        endpoint: 'https://api.example.com/logs',
        apiKey: 'test-api-key',
        batchSize: 1,
      }
      const transport = logTransports.remote(config)

      await transport(testEntry)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/logs',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
        }),
      )
    })

    it('应该处理网络错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      mockFetch.mockRejectedValue(new Error('Network error'))

      const config = {
        endpoint: 'https://api.example.com/logs',
        batchSize: 1,
      }
      const transport = logTransports.remote(config)

      await expect(transport(testEntry)).resolves.not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send logs to remote service:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })

    it('应该使用默认批量大小', async () => {
      const config = {
        endpoint: 'https://api.example.com/logs',
      }
      const transport = logTransports.remote(config)

      // 发送 9 条日志（默认批量大小是 10）
      for (let i = 1; i <= 9; i++) {
        await transport({ ...testEntry, message: `Message ${i}` })
      }
      expect(mockFetch).not.toHaveBeenCalled()

      // 发送第 10 条日志应该触发请求
      await transport({ ...testEntry, message: 'Message 10' })
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
