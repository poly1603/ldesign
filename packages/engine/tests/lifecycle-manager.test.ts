import type { LifecycleManager } from '../src/lifecycle/lifecycle-manager'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createLifecycleManager,
  LIFECYCLE_PHASES,
  LifecycleHelper,
} from '../src/lifecycle/lifecycle-manager'
import { createLogger } from '../src/logger/logger'

describe('lifecycleManager', () => {
  let lifecycleManager: LifecycleManager
  let mockEngine: any

  beforeEach(() => {
    const logger = createLogger('debug')
    lifecycleManager = createLifecycleManager(logger)
    mockEngine = { name: 'test-engine' }
  })

  describe('钩子注册', () => {
    it('应该能够注册生命周期钩子', () => {
      const hook = vi.fn()
      const hookId = lifecycleManager.on('init', hook)

      expect(hookId).toBeDefined()
      expect(typeof hookId).toBe('string')
      expect(lifecycleManager.hasHooks('init')).toBe(true)
      expect(lifecycleManager.getHookCount('init')).toBe(1)
    })

    it('应该能够注册一次性钩子', () => {
      const hook = vi.fn()
      const hookId = lifecycleManager.once('init', hook)

      expect(hookId).toBeDefined()
      expect(lifecycleManager.hasHooks('init')).toBe(true)
    })

    it('应该能够注销钩子', () => {
      const hook = vi.fn()
      const hookId = lifecycleManager.on('init', hook)

      expect(lifecycleManager.hasHooks('init')).toBe(true)

      const removed = lifecycleManager.off(hookId)
      expect(removed).toBe(true)
      expect(lifecycleManager.hasHooks('init')).toBe(false)
    })

    it('应该能够注销所有钩子', () => {
      lifecycleManager.on('init', vi.fn())
      lifecycleManager.on('init', vi.fn())
      lifecycleManager.on('mount', vi.fn())

      expect(lifecycleManager.getHookCount()).toBe(3)

      const removedCount = lifecycleManager.offAll('init')
      expect(removedCount).toBe(2)
      expect(lifecycleManager.getHookCount()).toBe(1)

      lifecycleManager.offAll()
      expect(lifecycleManager.getHookCount()).toBe(0)
    })
  })

  describe('钩子优先级', () => {
    it('应该按优先级顺序执行钩子', async () => {
      const executionOrder: number[] = []

      lifecycleManager.on('init', () => {
        executionOrder.push(1)
      }, 1)
      lifecycleManager.on('init', () => {
        executionOrder.push(3)
      }, 3)
      lifecycleManager.on('init', () => {
        executionOrder.push(2)
      }, 2)

      await lifecycleManager.execute('init', mockEngine)

      expect(executionOrder).toEqual([3, 2, 1]) // 高优先级先执行
    })
  })

  describe('生命周期执行', () => {
    it('应该能够异步执行生命周期钩子', async () => {
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      lifecycleManager.on('init', hook1)
      lifecycleManager.on('init', hook2)

      const event = await lifecycleManager.execute('init', mockEngine, { test: 'data' })

      expect(hook1).toHaveBeenCalledWith({
        phase: 'init',
        timestamp: expect.any(Number),
        engine: mockEngine,
        data: { test: 'data' },
      })
      expect(hook2).toHaveBeenCalledWith({
        phase: 'init',
        timestamp: expect.any(Number),
        engine: mockEngine,
        data: { test: 'data' },
      })

      expect(event.phase).toBe('init')
      expect(event.success).toBe(true)
      expect(event.hooksExecuted).toBe(2)
      expect(event.duration).toBeGreaterThanOrEqual(0)
    })

    it('应该能够同步执行生命周期钩子', () => {
      const hook = vi.fn()

      lifecycleManager.on('init', hook)

      const event = lifecycleManager.executeSync('init', mockEngine)

      expect(hook).toHaveBeenCalled()
      expect(event.phase).toBe('init')
      expect(event.success).toBe(true)
      expect(event.hooksExecuted).toBe(1)
    })

    it('应该处理钩子执行错误', async () => {
      const errorHook = vi.fn(() => {
        throw new Error('Hook error')
      })
      const normalHook = vi.fn()

      lifecycleManager.on('init', errorHook)
      lifecycleManager.on('init', normalHook)

      const event = await lifecycleManager.execute('init', mockEngine)

      expect(event.success).toBe(false)
      expect(event.error).toBeInstanceOf(Error)
      expect(event.error?.message).toBe('Hook error')
    })

    it('应该自动移除一次性钩子', async () => {
      const hook = vi.fn()

      lifecycleManager.once('init', hook)
      expect(lifecycleManager.hasHooks('init')).toBe(true)

      await lifecycleManager.execute('init', mockEngine)
      expect(hook).toHaveBeenCalledTimes(1)
      expect(lifecycleManager.hasHooks('init')).toBe(false)

      // 再次执行不应该调用钩子
      await lifecycleManager.execute('init', mockEngine)
      expect(hook).toHaveBeenCalledTimes(1)
    })
  })

  describe('生命周期状态', () => {
    it('应该跟踪当前生命周期阶段', async () => {
      expect(lifecycleManager.getCurrentPhase()).toBeUndefined()

      lifecycleManager.on('init', () => {
        expect(lifecycleManager.getCurrentPhase()).toBe('init')
      })

      await lifecycleManager.execute('init', mockEngine)
    })

    it('应该记录生命周期历史', async () => {
      await lifecycleManager.execute('init', mockEngine)
      await lifecycleManager.execute('mount', mockEngine)

      const history = lifecycleManager.getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].phase).toBe('init')
      expect(history[1].phase).toBe('mount')

      const lastEvent = lifecycleManager.getLastEvent()
      expect(lastEvent?.phase).toBe('mount')
    })

    it('应该检查阶段是否已执行', async () => {
      expect(lifecycleManager.isPhaseExecuted('init')).toBe(false)

      await lifecycleManager.execute('init', mockEngine)
      expect(lifecycleManager.isPhaseExecuted('init')).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该能够监听错误', async () => {
      const errorCallback = vi.fn()

      lifecycleManager.onError(errorCallback)
      lifecycleManager.on('init', () => {
        throw new Error('Test error')
      })

      await lifecycleManager.execute('init', mockEngine)

      expect(errorCallback).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          phase: 'init',
          error: expect.any(Error),
        }),
      )
    })
  })

  describe('统计信息', () => {
    it('应该提供统计信息', async () => {
      lifecycleManager.on('init', vi.fn())
      lifecycleManager.on('mount', vi.fn())
      lifecycleManager.on('mount', vi.fn())

      await lifecycleManager.execute('init', mockEngine)
      await lifecycleManager.execute('mount', mockEngine)

      const stats = lifecycleManager.getStats()

      expect(stats.totalHooks).toBe(3)
      expect(stats.phaseStats.init).toBe(1)
      expect(stats.phaseStats.mount).toBe(2)
      expect(stats.executionHistory).toHaveLength(2)
      expect(stats.averageExecutionTime).toBeGreaterThanOrEqual(0)
      expect(stats.errorCount).toBe(0)
    })
  })

  describe('清理操作', () => {
    it('应该能够清理所有钩子', () => {
      lifecycleManager.on('init', vi.fn())
      lifecycleManager.on('mount', vi.fn())

      expect(lifecycleManager.getHookCount()).toBe(2)

      lifecycleManager.clear()
      expect(lifecycleManager.getHookCount()).toBe(0)
    })

    it('应该能够重置管理器', async () => {
      lifecycleManager.on('init', vi.fn())
      await lifecycleManager.execute('init', mockEngine)

      expect(lifecycleManager.getHookCount()).toBe(1)
      expect(lifecycleManager.getHistory()).toHaveLength(1)

      lifecycleManager.reset()

      expect(lifecycleManager.getHookCount()).toBe(0)
      expect(lifecycleManager.getHistory()).toHaveLength(0)
      expect(lifecycleManager.getCurrentPhase()).toBeUndefined()
    })
  })
})

describe('lifecycleHelper', () => {
  describe('阶段验证', () => {
    it('应该验证有效的生命周期阶段', () => {
      expect(LifecycleHelper.isValidPhase('init')).toBe(true)
      expect(LifecycleHelper.isValidPhase('mount')).toBe(true)
      expect(LifecycleHelper.isValidPhase('invalid')).toBe(false)
    })
  })

  describe('阶段顺序', () => {
    it('应该正确比较阶段顺序', () => {
      expect(LifecycleHelper.isPhaseBefore('init', 'mount')).toBe(true)
      expect(LifecycleHelper.isPhaseAfter('mount', 'init')).toBe(true)
      expect(LifecycleHelper.isPhaseBefore('mount', 'init')).toBe(false)
    })

    it('应该获取下一个和上一个阶段', () => {
      expect(LifecycleHelper.getNextPhase('init')).toBe('afterInit')
      expect(LifecycleHelper.getPreviousPhase('afterInit')).toBe('init')
      expect(LifecycleHelper.getNextPhase('afterDestroy')).toBeUndefined()
      expect(LifecycleHelper.getPreviousPhase('beforeInit')).toBeUndefined()
    })
  })
})

describe('lIFECYCLE_PHASES', () => {
  it('应该包含所有预定义的生命周期阶段', () => {
    expect(LIFECYCLE_PHASES.BEFORE_INIT).toBe('beforeInit')
    expect(LIFECYCLE_PHASES.INIT).toBe('init')
    expect(LIFECYCLE_PHASES.AFTER_INIT).toBe('afterInit')
    expect(LIFECYCLE_PHASES.BEFORE_MOUNT).toBe('beforeMount')
    expect(LIFECYCLE_PHASES.MOUNT).toBe('mount')
    expect(LIFECYCLE_PHASES.AFTER_MOUNT).toBe('afterMount')
    expect(LIFECYCLE_PHASES.BEFORE_UNMOUNT).toBe('beforeUnmount')
    expect(LIFECYCLE_PHASES.UNMOUNT).toBe('unmount')
    expect(LIFECYCLE_PHASES.AFTER_UNMOUNT).toBe('afterUnmount')
    expect(LIFECYCLE_PHASES.BEFORE_DESTROY).toBe('beforeDestroy')
    expect(LIFECYCLE_PHASES.DESTROY).toBe('destroy')
    expect(LIFECYCLE_PHASES.AFTER_DESTROY).toBe('afterDestroy')
    expect(LIFECYCLE_PHASES.ERROR).toBe('error')
    expect(LIFECYCLE_PHASES.CUSTOM).toBe('custom')
  })
})
