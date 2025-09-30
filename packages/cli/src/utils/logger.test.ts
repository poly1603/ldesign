/**
 * 日志工具测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger, logger } from './logger.js'

describe('Logger 类', () => {
  let testLogger: Logger
  let originalConsole: {
    log: typeof console.log
    warn: typeof console.warn
    error: typeof console.error
  }

  beforeEach(() => {
    testLogger = new Logger()
    originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    }
    
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  it('应该能够设置和获取日志级别', () => {
    expect(testLogger.getLevel()).toBe('info')
    
    testLogger.setLevel('debug')
    expect(testLogger.getLevel()).toBe('debug')
    
    testLogger.setLevel('error')
    expect(testLogger.getLevel()).toBe('error')
  })

  it('应该根据日志级别过滤输出', () => {
    testLogger.setLevel('warn')
    
    testLogger.debug('debug message')
    testLogger.info('info message')
    testLogger.warn('warn message')
    testLogger.error('error message')
    
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('应该在静默模式下不输出任何日志', () => {
    testLogger.setLevel('silent')
    
    testLogger.debug('debug message')
    testLogger.info('info message')
    testLogger.warn('warn message')
    testLogger.error('error message')
    
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('应该能够输出调试日志', () => {
    testLogger.setLevel('debug')
    testLogger.debug('test debug message')
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      'test debug message'
    )
  })

  it('应该能够输出信息日志', () => {
    testLogger.info('test info message')
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'test info message'
    )
  })

  it('应该能够输出警告日志', () => {
    testLogger.warn('test warn message')
    
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      'test warn message'
    )
  })

  it('应该能够输出错误日志', () => {
    testLogger.error('test error message')
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'test error message'
    )
  })

  it('应该能够输出成功日志', () => {
    testLogger.success('test success message')
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[SUCCESS]'),
      'test success message'
    )
  })

  it('应该能够创建带前缀的日志记录器', () => {
    const prefixedLogger = testLogger.withPrefix('TEST')
    
    prefixedLogger.info('test message')
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      '[TEST] test message'
    )
  })

  it('应该能够处理多个参数', () => {
    testLogger.info('message', { key: 'value' }, 123)
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'message',
      { key: 'value' },
      123
    )
  })

  it('应该包含时间戳', () => {
    testLogger.info('test message')
    
    const call = (console.log as any).mock.calls[0]
    const timestamp = call[0]
    
    expect(timestamp).toMatch(/\[\d{1,2}:\d{2}:\d{2}\]/)
  })
})

describe('全局 logger 实例', () => {
  it('应该是 Logger 类的实例', () => {
    expect(logger).toBeInstanceOf(Logger)
  })

  it('应该有默认的日志级别', () => {
    expect(logger.getLevel()).toBe('info')
  })
})
