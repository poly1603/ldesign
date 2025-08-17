import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createErrorManager, ErrorCategory } from '../src/errors/error-manager'

describe('errorManager', () => {
  let errorManager: ReturnType<typeof createErrorManager>

  beforeEach(() => {
    errorManager = createErrorManager()
  })

  describe('错误捕获', () => {
    it('应该捕获错误', () => {
      const error = new Error('Test error')
      errorManager.captureError(error)

      const errors = errorManager.getErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toBe('Test error')
      expect(errors[0].level).toBe('error')
    })

    it('应该捕获带组件信息的错误', () => {
      const error = new Error('Component error')
      const component = { name: 'TestComponent' } as any

      errorManager.captureError(error, component, 'render error')

      const errors = errorManager.getErrors()
      expect(errors[0].component).toBe(component)
      expect(errors[0].info).toBe('render error')
    })

    it('应该记录错误时间戳', () => {
      const before = Date.now()
      const error = new Error('Test error')
      errorManager.captureError(error)
      const after = Date.now()

      const errors = errorManager.getErrors()
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(errors[0].timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('错误处理器', () => {
    it('应该注册和调用错误处理器', () => {
      const handler = vi.fn()
      errorManager.onError(handler)

      const error = new Error('Test error')
      errorManager.captureError(error)

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          level: 'error',
        }),
      )
    })

    it('应该移除错误处理器', () => {
      const handler = vi.fn()
      errorManager.onError(handler)
      errorManager.offError(handler)

      const error = new Error('Test error')
      errorManager.captureError(error)

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该支持多个错误处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      errorManager.onError(handler1)
      errorManager.onError(handler2)

      const error = new Error('Test error')
      errorManager.captureError(error)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('应该处理处理器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      const faultyHandler = vi.fn(() => {
        throw new Error('Handler error')
      })

      errorManager.onError(faultyHandler)

      const error = new Error('Test error')
      errorManager.captureError(error)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in error handler:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('错误管理', () => {
    it('应该限制错误数量', () => {
      (errorManager as any).setMaxErrors(3)

      for (let i = 0; i < 5; i++) {
        errorManager.captureError(new Error(`Error ${i}`))
      }

      const errors = errorManager.getErrors()
      expect(errors).toHaveLength(3)
      expect(errors[0].message).toBe('Error 4') // 最新的错误
    })

    it('应该清空错误列表', () => {
      errorManager.captureError(new Error('Error 1'))
      errorManager.captureError(new Error('Error 2'))

      errorManager.clearErrors()
      expect(errorManager.getErrors()).toHaveLength(0)
    })

    it('应该按级别获取错误', () => {
      // 创建不同级别的错误
      const error1 = new Error('Error 1')
      const _error2 = new Error('Error 2')

      errorManager.captureError(error1)
      // 手动添加 warn 级别的错误
      const errorInfo = {
        message: 'Warning message',
        level: 'warn' as const,
        timestamp: Date.now(),
        stack: undefined,
        component: undefined,
        info: undefined,
      };
      (errorManager as any).addError(errorInfo)

      const errorLevelErrors = (errorManager as any).getErrorsByLevel('error')
      const warnLevelErrors = (errorManager as any).getErrorsByLevel('warn')

      expect(errorLevelErrors).toHaveLength(1)
      expect(warnLevelErrors).toHaveLength(1)
      expect(errorLevelErrors[0].message).toBe('Error 1')
      expect(warnLevelErrors[0].message).toBe('Warning message')
    })

    it('应该按时间范围获取错误', async () => {
      const now = Date.now()
      const error1 = new Error('Error 1')
      const error2 = new Error('Error 2')

      errorManager.captureError(error1)

      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10))

      errorManager.captureError(error2)

      const recentErrors = (errorManager as any).getErrorsByTimeRange(now, Date.now())
      expect(recentErrors).toHaveLength(2)
    })

    it('应该获取最近的错误', () => {
      for (let i = 0; i < 5; i++) {
        errorManager.captureError(new Error(`Error ${i}`))
      }

      const recentErrors = (errorManager as any).getRecentErrors(3)
      expect(recentErrors).toHaveLength(3)
      expect(recentErrors[0].message).toBe('Error 4') // 最新的
    })

    it('应该搜索错误', () => {
      errorManager.captureError(new Error('Network timeout'))
      errorManager.captureError(new Error('Component render failed'))
      errorManager.captureError(new Error('Database connection error'))

      const networkErrors = (errorManager as any).searchErrors('network')
      const renderErrors = (errorManager as any).searchErrors('render')

      expect(networkErrors).toHaveLength(1)
      expect(renderErrors).toHaveLength(1)
      expect(networkErrors[0].message).toContain('Network')
      expect(renderErrors[0].message).toContain('render')
    })
  })

  describe('错误统计', () => {
    it('应该返回错误统计信息', () => {
      errorManager.captureError(new Error('Error 1'))
      errorManager.captureError(new Error('Error 2'))

      const stats = (errorManager as any).getErrorStats()
      expect(stats.total).toBe(2)
      expect(stats.byLevel.error).toBe(2)
      expect(stats.byLevel.warn).toBe(0)
      expect(stats.byLevel.info).toBe(0)
    })
  })

  describe('错误分类', () => {
    it('应该正确分类网络错误', () => {
      const networkError = new Error('Network request failed')
      errorManager.captureError(networkError)

      const categoryStats = (errorManager as any).getCategoryStats()
      expect(categoryStats[ErrorCategory.NETWORK]).toBeGreaterThan(0)
    })

    it('应该正确分类组件错误', () => {
      const componentError = new Error('Component error')
      const component = { name: 'TestComponent' } as any
      errorManager.captureError(componentError, component)

      const categoryStats = (errorManager as any).getCategoryStats()
      expect(categoryStats[ErrorCategory.COMPONENT]).toBeGreaterThan(0)
    })

    it('应该正确分类安全错误', () => {
      const securityError = new Error('XSS attack detected')
      errorManager.captureError(securityError)

      const categoryStats = (errorManager as any).getCategoryStats()
      expect(categoryStats[ErrorCategory.SECURITY]).toBeGreaterThan(0)
    })
  })

  describe('错误导出', () => {
    it('应该导出 JSON 格式的错误', () => {
      errorManager.captureError(new Error('Test error'))

      const exported = (errorManager as any).exportErrors('json')
      const parsed = JSON.parse(exported)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed[0].message).toBe('Test error')
    })

    it('应该导出 CSV 格式的错误', () => {
      errorManager.captureError(new Error('Test error'))

      const exported = (errorManager as any).exportErrors('csv')
      const lines = exported.split('\n')

      expect(lines[0]).toContain('timestamp,level,message,stack,info')
      expect(lines[1]).toContain('Test error')
    })
  })

  describe('错误报告', () => {
    it('应该创建错误报告', () => {
      errorManager.captureError(new Error('Error 1'))
      errorManager.captureError(new Error('Error 2'))
      errorManager.captureError(new Error('Error 1')) // 重复错误

      const report = (errorManager as any).createErrorReport()

      expect(report.summary.total).toBe(3)
      expect(report.recentErrors).toHaveLength(3)
      expect(report.topErrors).toHaveLength(2)
      expect(report.topErrors[0].message).toBe('Error 1')
      expect(report.topErrors[0].count).toBe(2)
    })
  })

  describe('错误爆发检测', () => {
    it('应该检测错误爆发', () => {
      const logger = { warn: vi.fn() } as any
      const manager = createErrorManager(logger)

      // 快速产生多个错误
      for (let i = 0; i < 15; i++) {
        manager.captureError(new Error(`Burst error ${i}`))
      }

      expect(logger.warn).toHaveBeenCalledWith(
        'Error burst detected',
        expect.objectContaining({ count: expect.any(Number) }),
      )
    })
  })
})
