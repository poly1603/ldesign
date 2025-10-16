/**
 * 增强型错误处理系统单元测试
 * 🧪 测试错误处理和自动恢复功能
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createEnhancedErrorManager,
  DataRecoveryStrategy,
  EngineError,
  EnhancedErrorManager,
  ErrorCategory,
  ErrorSeverity,
  NetworkErrorRecoveryStrategy,
} from '../../src/errors/enhanced-error-handler'

describe('engineError', () => {
  it('应该创建结构化错误', () => {
    const error = new EngineError('测试错误', {
      code: 'TEST_ERROR',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.ERROR,
      context: { url: '/api/test' },
      recoverable: true,
    })

    expect(error.message).toBe('测试错误')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.category).toBe(ErrorCategory.NETWORK)
    expect(error.severity).toBe(ErrorSeverity.ERROR)
    expect(error.context.url).toBe('/api/test')
    expect(error.recoverable).toBe(true)
    expect(error.timestamp).toBeGreaterThan(0)
  })

  it('应该有默认值', () => {
    const error = new EngineError('简单错误')

    expect(error.code).toBe('UNKNOWN_ERROR')
    expect(error.category).toBe(ErrorCategory.UNKNOWN)
    expect(error.severity).toBe(ErrorSeverity.ERROR)
    expect(error.recoverable).toBe(false)
    expect(error.context).toEqual({})
  })

  it('应该转换为JSON', () => {
    const originalError = new Error('原始错误')
    const error = new EngineError('包装错误', {
      code: 'WRAPPED',
      cause: originalError,
    })

    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'EngineError')
    expect(json).toHaveProperty('message', '包装错误')
    expect(json).toHaveProperty('code', 'WRAPPED')
    expect(json).toHaveProperty('timestamp')
    expect(json).toHaveProperty('cause')
    expect(json.cause).toHaveProperty('message', '原始错误')
  })

  it('应该生成用户友好消息', () => {
    const networkError = new EngineError('网络错误', {
      category: ErrorCategory.NETWORK,
    })
    expect(networkError.toUserMessage()).toContain('网络')

    const validationError = new EngineError('验证错误', {
      category: ErrorCategory.VALIDATION,
    })
    expect(validationError.toUserMessage()).toContain('格式')

    const authError = new EngineError('授权错误', {
      category: ErrorCategory.AUTHORIZATION,
    })
    expect(authError.toUserMessage()).toContain('权限')
  })

  it('应该保持正确的原型链', () => {
    const error = new EngineError('测试')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('EngineError')
  })
})

describe('networkErrorRecoveryStrategy', () => {
  let strategy: NetworkErrorRecoveryStrategy

  beforeEach(() => {
    strategy = new NetworkErrorRecoveryStrategy()
  })

  it('应该识别网络错误', () => {
    const networkError = new EngineError('网络请求失败', {
      category: ErrorCategory.NETWORK,
      recoverable: true,
    })

    expect(strategy.canRecover(networkError)).toBe(true)
  })

  it('应该拒绝非网络错误', () => {
    const validationError = new EngineError('验证失败', {
      category: ErrorCategory.VALIDATION,
    })

    expect(strategy.canRecover(validationError)).toBe(false)
  })

  it('应该有正确的优先级', () => {
    expect(strategy.priority).toBe(100)
  })
})

describe('dataRecoveryStrategy', () => {
  let strategy: DataRecoveryStrategy
  let mockCache: any

  beforeEach(() => {
    mockCache = {
      get: vi.fn(),
    }
    strategy = new DataRecoveryStrategy(mockCache)
  })

  it('应该识别数据错误', () => {
    const dataError = new EngineError('数据丢失', {
      category: ErrorCategory.DATA,
      context: { cacheKey: 'test-key' },
      recoverable: true,
    })

    expect(strategy.canRecover(dataError)).toBe(true)
  })

  it('应该拒绝没有缓存键的错误', () => {
    const dataError = new EngineError('数据错误', {
      category: ErrorCategory.DATA,
    })

    expect(strategy.canRecover(dataError)).toBe(false)
  })

  it('应该从缓存恢复数据', async () => {
    const cachedData = { value: 'cached' }
    mockCache.get.mockReturnValue(cachedData)

    const error = new EngineError('数据丢失', {
      category: ErrorCategory.DATA,
      context: { cacheKey: 'test-key' },
      recoverable: true,
    })

    const recovered = await strategy.recover(error)

    expect(recovered).toBe(true)
    expect(mockCache.get).toHaveBeenCalledWith('test-key')
    expect(error.context.recoveredData).toEqual(cachedData)
  })

  it('应该在缓存无数据时失败', async () => {
    mockCache.get.mockReturnValue(undefined)

    const error = new EngineError('数据丢失', {
      category: ErrorCategory.DATA,
      context: { cacheKey: 'missing-key' },
      recoverable: true,
    })

    const recovered = await strategy.recover(error)

    expect(recovered).toBe(false)
  })
})

describe('enhancedErrorManager', () => {
  let manager: EnhancedErrorManager

  beforeEach(() => {
    manager = new EnhancedErrorManager()
  })

  describe('策略管理', () => {
    it('应该注册恢复策略', () => {
      const mockStrategy = {
        name: 'MockStrategy',
        priority: 50,
        canRecover: vi.fn(() => false),
        recover: vi.fn(),
      }

      manager.registerStrategy(mockStrategy)
      
      // 验证策略已注册（通过尝试恢复来测试）
      const error = new EngineError('测试', { recoverable: true })
      manager.handleError(error)
      
      // 策略应该被检查
      expect(mockStrategy.canRecover).toHaveBeenCalled()
    })

    it('应该按优先级排序策略', () => {
      const lowPriority = {
        name: 'Low',
        priority: 10,
        canRecover: vi.fn(() => true),
        recover: vi.fn(async () => true),
      }

      const highPriority = {
        name: 'High',
        priority: 100,
        canRecover: vi.fn(() => true),
        recover: vi.fn(async () => false),
      }

      manager.registerStrategy(lowPriority)
      manager.registerStrategy(highPriority)

      const error = new EngineError('测试', { recoverable: true })
      manager.handleError(error)

      // 高优先级策略应该先被调用
      expect(highPriority.canRecover).toHaveBeenCalled()
    })

    it('应该移除策略', () => {
      const strategy = {
        name: 'TestStrategy',
        canRecover: vi.fn(() => false),
        recover: vi.fn(),
      }

      manager.registerStrategy(strategy)
      const removed = manager.unregisterStrategy('TestStrategy')

      expect(removed).toBe(true)
    })

    it('移除不存在的策略应该返回false', () => {
      const removed = manager.unregisterStrategy('NonExistent')
      expect(removed).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理普通Error并转换为EngineError', async () => {
      const error = new Error('普通错误')
      await manager.handleError(error)

      const history = manager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toBeInstanceOf(EngineError)
    })

    it('应该处理EngineError', async () => {
      const error = new EngineError('引擎错误', {
        code: 'ENGINE_ERROR',
      })

      await manager.handleError(error)

      const history = manager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].code).toBe('ENGINE_ERROR')
    })

    it('应该自动分类错误', async () => {
      const networkError = new Error('network timeout')
      await manager.handleError(networkError)

      const history = manager.getHistory()
      expect(history[0].category).toBe(ErrorCategory.NETWORK)
    })

    it('应该尝试恢复可恢复的错误', async () => {
      const mockStrategy = {
        name: 'MockRecovery',
        priority: 100,
        canRecover: vi.fn(() => true),
        recover: vi.fn(async () => true),
      }

      manager.registerStrategy(mockStrategy)

      const error = new EngineError('可恢复错误', {
        recoverable: true,
      })

      const recovered = await manager.handleError(error)

      expect(mockStrategy.recover).toHaveBeenCalled()
      expect(recovered).toBe(true)
    })

    it('应该在恢复失败时返回false', async () => {
      const mockStrategy = {
        name: 'FailedRecovery',
        canRecover: vi.fn(() => true),
        recover: vi.fn(async () => false),
      }

      manager.registerStrategy(mockStrategy)

      const error = new EngineError('恢复失败', {
        recoverable: true,
      })

      const recovered = await manager.handleError(error)
      expect(recovered).toBe(false)
    })
  })

  describe('错误监听器', () => {
    it('应该注册全局错误处理器', async () => {
      const handler = vi.fn()
      manager.onError(handler)

      const error = new EngineError('测试错误')
      await manager.handleError(error)

      expect(handler).toHaveBeenCalledWith(expect.any(EngineError))
    })

    it('应该注册分类错误处理器', async () => {
      const networkHandler = vi.fn()
      manager.onError(ErrorCategory.NETWORK, networkHandler)

      const networkError = new EngineError('网络错误', {
        category: ErrorCategory.NETWORK,
      })
      await manager.handleError(networkError)

      expect(networkHandler).toHaveBeenCalledWith(networkError)
    })

    it('应该支持取消监听', async () => {
      const handler = vi.fn()
      const unsubscribe = manager.onError(handler)

      unsubscribe()

      const error = new EngineError('测试')
      await manager.handleError(error)

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该在处理器出错时继续执行', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      const normalHandler = vi.fn()

      manager.onError(errorHandler)
      manager.onError(normalHandler)

      const error = new EngineError('测试')
      await manager.handleError(error)

      // 两个处理器都应该被调用
      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalled()
    })
  })

  describe('错误历史', () => {
    it('应该记录错误历史', async () => {
      const error1 = new EngineError('错误1')
      const error2 = new EngineError('错误2')

      await manager.handleError(error1)
      await manager.handleError(error2)

      const history = manager.getHistory()
      expect(history).toHaveLength(2)
    })

    it('应该按类别过滤历史', async () => {
      const networkError = new EngineError('网络', {
        category: ErrorCategory.NETWORK,
      })
      const validationError = new EngineError('验证', {
        category: ErrorCategory.VALIDATION,
      })

      await manager.handleError(networkError)
      await manager.handleError(validationError)

      const networkHistory = manager.getHistory({
        category: ErrorCategory.NETWORK,
      })

      expect(networkHistory).toHaveLength(1)
      expect(networkHistory[0].category).toBe(ErrorCategory.NETWORK)
    })

    it('应该按严重程度过滤历史', async () => {
      const warning = new EngineError('警告', {
        severity: ErrorSeverity.WARNING,
      })
      const fatal = new EngineError('致命', {
        severity: ErrorSeverity.FATAL,
      })

      await manager.handleError(warning)
      await manager.handleError(fatal)

      const fatalHistory = manager.getHistory({
        severity: ErrorSeverity.FATAL,
      })

      expect(fatalHistory).toHaveLength(1)
      expect(fatalHistory[0].severity).toBe(ErrorSeverity.FATAL)
    })

    it('应该限制历史数量', async () => {
      const history = manager.getHistory({ limit: 5 })
      
      for (let i = 0; i < 10; i++) {
        await manager.handleError(new EngineError(`错误${i}`))
      }

      const limited = manager.getHistory({ limit: 5 })
      expect(limited).toHaveLength(5)
    })

    it('应该清除历史', async () => {
      await manager.handleError(new EngineError('测试'))
      
      manager.clearHistory()
      
      const history = manager.getHistory()
      expect(history).toHaveLength(0)
    })
  })

  describe('错误统计', () => {
    it('应该提供统计信息', async () => {
      const networkError = new EngineError('网络', {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
      })
      const validationError = new EngineError('验证', {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
      })

      await manager.handleError(networkError)
      await manager.handleError(validationError)

      const stats = manager.getStatistics()

      expect(stats.total).toBe(2)
      expect(stats.byCategory[ErrorCategory.NETWORK]).toBe(1)
      expect(stats.byCategory[ErrorCategory.VALIDATION]).toBe(1)
      expect(stats.bySeverity[ErrorSeverity.ERROR]).toBe(1)
      expect(stats.bySeverity[ErrorSeverity.WARNING]).toBe(1)
      expect(stats.recentErrors).toHaveLength(2)
    })

    it('应该只返回最近10个错误', async () => {
      for (let i = 0; i < 20; i++) {
        await manager.handleError(new EngineError(`错误${i}`))
      }

      const stats = manager.getStatistics()
      expect(stats.recentErrors).toHaveLength(10)
    })
  })
})

describe('createEnhancedErrorManager', () => {
  it('应该创建错误管理器', () => {
    const manager = createEnhancedErrorManager()
    expect(manager).toBeInstanceOf(EnhancedErrorManager)
  })

  it('应该注册自定义策略', () => {
    const customStrategy = {
      name: 'Custom',
      canRecover: vi.fn(() => false),
      recover: vi.fn(),
    }

    const manager = createEnhancedErrorManager({
      strategies: [customStrategy],
    })

    const error = new EngineError('测试', { recoverable: true })
    manager.handleError(error)

    expect(customStrategy.canRecover).toHaveBeenCalled()
  })
})

describe('错误分类逻辑', () => {
  let manager: EnhancedErrorManager

  beforeEach(() => {
    manager = new EnhancedErrorManager()
  })

  it('应该识别网络错误', async () => {
    const errors = [
      new Error('network timeout'),
      new Error('fetch failed'),
      new Error('connection timeout'),
    ]

    for (const error of errors) {
      await manager.handleError(error)
    }

    const history = manager.getHistory()
    expect(history.every(e => e.category === ErrorCategory.NETWORK)).toBe(true)
  })

  it('应该识别授权错误', async () => {
    const errors = [
      new Error('unauthorized access'),
      new Error('forbidden resource'),
    ]

    for (const error of errors) {
      await manager.handleError(error)
    }

    const history = manager.getHistory()
    expect(history.every(e => e.category === ErrorCategory.AUTHORIZATION)).toBe(true)
  })

  it('应该识别验证错误', async () => {
    const errors = [
      new Error('validation failed'),
      new Error('invalid input'),
    ]

    for (const error of errors) {
      await manager.handleError(error)
    }

    const history = manager.getHistory()
    expect(history.every(e => e.category === ErrorCategory.VALIDATION)).toBe(true)
  })

  it('应该将未知错误归类为UNKNOWN', async () => {
    const error = new Error('something went wrong')
    await manager.handleError(error)

    const history = manager.getHistory()
    expect(history[0].category).toBe(ErrorCategory.UNKNOWN)
  })
})
