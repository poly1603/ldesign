/**
 * 闲时处理器测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addIdleTask,
  addIdleTasks,
  createConditionalIdleTask,
  createDelayedIdleTask,
  createIdleProcessor,
  defaultIdleProcessor,
  getDefaultProcessorStatus,
  IdleProcessorImpl,
  supportsIdleCallback,
} from '../src/utils/idle-processor'

// Mock requestIdleCallback and cancelIdleCallback
const mockRequestIdleCallback = vi.fn()
const mockCancelIdleCallback = vi.fn()

describe('idleProcessorImpl', () => {
  let originalRequestIdleCallback: any
  let originalCancelIdleCallback: any

  beforeEach(() => {
    originalRequestIdleCallback = globalThis.requestIdleCallback
    originalCancelIdleCallback = globalThis.cancelIdleCallback

    globalThis.requestIdleCallback = mockRequestIdleCallback
    globalThis.cancelIdleCallback = mockCancelIdleCallback

    mockRequestIdleCallback.mockClear()
    mockCancelIdleCallback.mockClear()
  })

  afterEach(() => {
    globalThis.requestIdleCallback = originalRequestIdleCallback
    globalThis.cancelIdleCallback = originalCancelIdleCallback
  })

  describe('基本功能', () => {
    it('应该创建闲时处理器', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })
      expect(processor).toBeDefined()
    })

    it('应该添加任务到队列', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })
      const mockTask = vi.fn()

      processor.addTask(mockTask)
      const status = processor.getQueueStatus()

      expect(status.length).toBe(1)
    })

    it('应该按优先级排序任务', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })
      const task1 = vi.fn()
      const task2 = vi.fn()
      const task3 = vi.fn()

      processor.addTask(task1, 3) // 低优先级
      processor.addTask(task2, 1) // 高优先级
      processor.addTask(task3, 2) // 中优先级

      processor.start()

      // 模拟requestIdleCallback被调用
      expect(mockRequestIdleCallback).toHaveBeenCalled()
      const idleCallback = mockRequestIdleCallback.mock.calls[0][0]

      // 模拟idle deadline
      const mockDeadline = {
        timeRemaining: () => 50,
        didTimeout: false,
      }

      // 执行回调
      idleCallback(mockDeadline)

      // 由于是异步执行，我们检查任务被调用的顺序
      expect(task2).toHaveBeenCalled() // 最高优先级先执行
    })

    it('应该在队列满时丢弃最旧的任务', () => {
      const processor = new IdleProcessorImpl({
        autoStart: false,
        maxQueueSize: 2,
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      processor.addTask(vi.fn(), 1)
      processor.addTask(vi.fn(), 2)
      processor.addTask(vi.fn(), 3) // 应该导致第一个任务被丢弃

      expect(consoleSpy).toHaveBeenCalledWith('Idle task queue is full, dropping oldest task')
      expect(processor.getQueueStatus().length).toBe(2)

      consoleSpy.mockRestore()
    })

    it('应该启动和停止处理器', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })

      expect(processor.getQueueStatus().isRunning).toBe(false)

      processor.start()
      expect(processor.getQueueStatus().isRunning).toBe(true)

      processor.stop()
      expect(processor.getQueueStatus().isRunning).toBe(false)
    })

    it('应该清空任务队列', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })

      processor.addTask(vi.fn())
      processor.addTask(vi.fn())

      expect(processor.getQueueStatus().length).toBe(2)

      processor.clear()
      expect(processor.getQueueStatus().length).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理任务执行中的错误', async () => {
      const mockOnError = vi.fn()
      const processor = new IdleProcessorImpl({
        autoStart: false,
        onError: mockOnError,
      })

      const errorTask = vi.fn(() => {
        throw new Error('Task error')
      })
      const normalTask = vi.fn()

      processor.addTask(errorTask)
      processor.addTask(normalTask)
      processor.start()

      // 模拟requestIdleCallback执行
      const idleCallback = mockRequestIdleCallback.mock.calls[0][0]
      const mockDeadline = {
        timeRemaining: () => 50,
        didTimeout: false,
      }

      await idleCallback(mockDeadline)

      expect(mockOnError).toHaveBeenCalled()
      expect(normalTask).toHaveBeenCalled() // 正常任务应该仍然执行
    })

    it('应该使用默认错误处理器', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const errorTask = vi.fn(() => {
        throw new Error('Task error')
      })

      processor.addTask(errorTask)
      processor.start()

      // 模拟任务执行
      const idleCallback = mockRequestIdleCallback.mock.calls[0][0]
      const mockDeadline = {
        timeRemaining: () => 50,
        didTimeout: false,
      }

      idleCallback(mockDeadline)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Idle task task-1 failed:'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('回退机制', () => {
    beforeEach(() => {
      // 测试没有requestIdleCallback的情况
      globalThis.requestIdleCallback = undefined as any
      globalThis.cancelIdleCallback = undefined as any
    })

    it('应该回退到setTimeout', () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
      const processor = new IdleProcessorImpl({ autoStart: false })

      processor.addTask(vi.fn())
      processor.start()

      expect(setTimeoutSpy).toHaveBeenCalled()

      setTimeoutSpy.mockRestore()
    })
  })

  describe('选项管理', () => {
    it('应该使用默认选项', () => {
      const processor = new IdleProcessorImpl()
      const options = processor.getOptions()

      expect(options.maxProcessingTime).toBe(50)
      expect(options.maxQueueSize).toBe(100)
      expect(options.autoStart).toBe(true)
      expect(options.onError).toBeDefined()
    })

    it('应该更新选项', () => {
      const processor = new IdleProcessorImpl({ autoStart: false })

      processor.updateOptions({ maxProcessingTime: 100 })
      const options = processor.getOptions()

      expect(options.maxProcessingTime).toBe(100)
    })
  })
})

describe('便捷函数', () => {
  beforeEach(() => {
    defaultIdleProcessor.clear()
    defaultIdleProcessor.stop()
  })

  afterEach(() => {
    defaultIdleProcessor.clear()
    defaultIdleProcessor.stop()
  })

  it('addIdleTask应该添加任务到默认处理器', () => {
    const task = vi.fn()
    addIdleTask(task, 1)

    const status = getDefaultProcessorStatus()
    expect(status.length).toBe(1)
  })

  it('addIdleTasks应该批量添加任务', () => {
    const tasks = [
      { task: vi.fn(), priority: 1 },
      { task: vi.fn(), priority: 2 },
    ]

    addIdleTasks(tasks)

    const status = getDefaultProcessorStatus()
    expect(status.length).toBe(2)
  })

  it('createDelayedIdleTask应该延迟添加任务', async () => {
    const task = vi.fn()
    createDelayedIdleTask(task, 10)

    // 立即检查应该没有任务
    expect(getDefaultProcessorStatus().length).toBe(0)

    // 等待延迟
    await new Promise(resolve => setTimeout(resolve, 15))

    // 现在应该有任务了
    expect(getDefaultProcessorStatus().length).toBe(1)
  })

  it('createConditionalIdleTask应该条件执行任务', () => {
    const shouldExecute = false
    const task = vi.fn()
    const condition = () => shouldExecute

    createConditionalIdleTask(condition, task)

    const status = getDefaultProcessorStatus()
    expect(status.length).toBe(1)

    // 任务被添加但条件决定是否执行
    expect(task).not.toHaveBeenCalled()
  })

  it('supportsIdleCallback应该检测支持情况', () => {
    // 当前环境有requestIdleCallback
    globalThis.requestIdleCallback = mockRequestIdleCallback
    expect(supportsIdleCallback()).toBe(true)

    // 移除后应该返回false
    globalThis.requestIdleCallback = undefined as any
    expect(supportsIdleCallback()).toBe(false)
  })

  it('getDefaultProcessorStatus应该返回状态', () => {
    const status = getDefaultProcessorStatus()

    expect(status).toHaveProperty('length')
    expect(status).toHaveProperty('isRunning')
    expect(status).toHaveProperty('isProcessing')
    expect(status).toHaveProperty('supportsIdleCallback')
  })

  it('createIdleProcessor应该创建新实例', () => {
    const processor = createIdleProcessor({ maxQueueSize: 50 })
    expect(processor).toBeDefined()
    expect(processor.getQueueStatus).toBeDefined()
  })
})
