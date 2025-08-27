import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  DeduplicationManager,
  DeduplicationKeyGenerator,
  createDeduplicationManager,
  createDeduplicationKeyGenerator,
} from '../../../src/utils/concurrency'

describe('DeduplicationManager', () => {
  let manager: DeduplicationManager

  beforeEach(() => {
    manager = createDeduplicationManager()
  })

  describe('execute', () => {
    it('should execute request only once for same key', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test', status: 200 })

      // 同时发起三个相同的请求
      const promises = [
        manager.execute('test-key', mockFn),
        manager.execute('test-key', mockFn),
        manager.execute('test-key', mockFn),
      ]

      const results = await Promise.all(promises)

      // 函数只应该被调用一次
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 所有结果应该相同
      results.forEach(result => {
        expect(result).toEqual({ data: 'test', status: 200 })
      })
    })

    it('should execute different keys separately', async () => {
      const mockFn1 = vi.fn().mockResolvedValue({ data: 'test1', status: 200 })
      const mockFn2 = vi.fn().mockResolvedValue({ data: 'test2', status: 200 })

      const [result1, result2] = await Promise.all([
        manager.execute('key1', mockFn1),
        manager.execute('key2', mockFn2),
      ])

      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(1)
      expect(result1.data).toBe('test1')
      expect(result2.data).toBe('test2')
    })

    it('should handle request failures correctly', async () => {
      const error = new Error('Request failed')
      const mockFn = vi.fn().mockRejectedValue(error)

      // 同时发起多个会失败的请求
      const promises = [
        manager.execute('fail-key', mockFn).catch(e => e),
        manager.execute('fail-key', mockFn).catch(e => e),
        manager.execute('fail-key', mockFn).catch(e => e),
      ]

      const results = await Promise.all(promises)

      // 函数只应该被调用一次
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 所有结果都应该是错误
      results.forEach(result => {
        expect(result).toBe(error)
      })
    })

    it('should update statistics correctly', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test', status: 200 })

      // 发起多个相同请求
      await Promise.all([
        manager.execute('stats-key', mockFn),
        manager.execute('stats-key', mockFn),
        manager.execute('stats-key', mockFn),
      ])

      const stats = manager.getStats()
      expect(stats.executions).toBe(1)
      expect(stats.duplications).toBe(2)
      expect(stats.savedRequests).toBe(2)
      expect(stats.deduplicationRate).toBeCloseTo(2 / 3)
    })
  })

  describe('task management', () => {
    it('should track running tasks', async () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 100))
      )

      const promise = manager.execute('running-key', mockFn)

      expect(manager.isRunning('running-key')).toBe(true)
      expect(manager.getPendingCount()).toBe(1)
      expect(manager.getPendingKeys()).toContain('running-key')

      await promise

      expect(manager.isRunning('running-key')).toBe(false)
      expect(manager.getPendingCount()).toBe(0)
    })

    it('should provide task information', async () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 50))
      )

      const promise = manager.execute('info-key', mockFn)

      // 等待一小段时间确保任务已经开始
      await new Promise(resolve => setTimeout(resolve, 10))

      const taskInfo = manager.getTaskInfo('info-key')
      expect(taskInfo).toBeTruthy()
      expect(taskInfo!.key).toBe('info-key')
      expect(taskInfo!.refCount).toBe(1)
      expect(taskInfo!.duration).toBeGreaterThanOrEqual(0)

      await promise

      expect(manager.getTaskInfo('info-key')).toBeNull()
    })

    it('should track reference count correctly', async () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 100))
      )

      // 启动第一个请求
      const promise1 = manager.execute('ref-key', mockFn)
      expect(manager.getTaskInfo('ref-key')!.refCount).toBe(1)

      // 启动第二个相同请求
      const promise2 = manager.execute('ref-key', mockFn)
      expect(manager.getTaskInfo('ref-key')!.refCount).toBe(2)

      // 启动第三个相同请求
      const promise3 = manager.execute('ref-key', mockFn)
      expect(manager.getTaskInfo('ref-key')!.refCount).toBe(3)

      await Promise.all([promise1, promise2, promise3])
    })
  })

  describe('utility methods', () => {
    it('should cancel specific tasks', () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 100))
      )

      manager.execute('cancel-key', mockFn)
      expect(manager.isRunning('cancel-key')).toBe(true)

      manager.cancel('cancel-key')
      expect(manager.isRunning('cancel-key')).toBe(false)
    })

    it('should cancel all tasks', async () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 100))
      )

      manager.execute('key1', mockFn)
      manager.execute('key2', mockFn)
      manager.execute('key3', mockFn)

      expect(manager.getPendingCount()).toBe(3)

      manager.cancelAll()
      expect(manager.getPendingCount()).toBe(0)
    })

    it('should wait for specific task completion', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'wait-test', status: 200 })

      const executePromise = manager.execute('wait-key', mockFn)
      const waitPromise = manager.waitFor('wait-key')

      const [executeResult, waitResult] = await Promise.all([executePromise, waitPromise])

      expect(executeResult).toEqual(waitResult)
      expect(waitResult!.data).toBe('wait-test')
    })

    it('should wait for all tasks completion', async () => {
      const mockFn1 = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test1', status: 200 }), 50))
      )
      const mockFn2 = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test2', status: 200 }), 100))
      )

      manager.execute('wait-all-1', mockFn1)
      manager.execute('wait-all-2', mockFn2)

      const startTime = Date.now()
      await manager.waitForAll()
      const duration = Date.now() - startTime

      // 应该等待所有任务完成（至少100ms）
      expect(duration).toBeGreaterThan(90)
      expect(manager.getPendingCount()).toBe(0)
    })

    it('should reset statistics', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test', status: 200 })

      await Promise.all([
        manager.execute('reset-key', mockFn),
        manager.execute('reset-key', mockFn),
      ])

      let stats = manager.getStats()
      expect(stats.executions).toBe(1)
      expect(stats.duplications).toBe(1)

      manager.resetStats()

      stats = manager.getStats()
      expect(stats.executions).toBe(0)
      expect(stats.duplications).toBe(0)
      expect(stats.savedRequests).toBe(0)
    })

    it('should cleanup timeout tasks', async () => {
      const mockFn = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'test', status: 200 }), 200))
      )

      manager.execute('timeout-key', mockFn)
      expect(manager.getPendingCount()).toBe(1)

      // 清理超时任务（50ms超时）
      const cleanedCount = manager.cleanupTimeoutTasks(50)
      expect(cleanedCount).toBe(0) // 任务刚创建，不应该被清理

      // 等待一段时间后再清理
      await new Promise(resolve => setTimeout(resolve, 60))
      const cleanedCount2 = manager.cleanupTimeoutTasks(50)
      expect(cleanedCount2).toBe(1) // 现在应该被清理了
      expect(manager.getPendingCount()).toBe(0)
    })
  })
})

describe('DeduplicationKeyGenerator', () => {
  let generator: DeduplicationKeyGenerator

  beforeEach(() => {
    generator = createDeduplicationKeyGenerator()
  })

  it('should generate consistent keys for same config', () => {
    const config = {
      method: 'GET',
      url: '/api/users',
      params: { page: 1, size: 10 }
    }

    const key1 = generator.generate(config)
    const key2 = generator.generate(config)

    expect(key1).toBe(key2)
    expect(key1).toContain('method:GET')
    expect(key1).toContain('url:/api/users')
    expect(key1).toContain('params:')
  })

  it('should generate different keys for different configs', () => {
    const config1 = { method: 'GET', url: '/api/users' }
    const config2 = { method: 'POST', url: '/api/users' }

    const key1 = generator.generate(config1)
    const key2 = generator.generate(config2)

    expect(key1).not.toBe(key2)
  })

  it('should handle custom key generator', () => {
    const customGenerator = createDeduplicationKeyGenerator({
      customGenerator: (config) => `custom:${config.method}:${config.url}`
    })

    const config = { method: 'GET', url: '/api/test' }
    const key = customGenerator.generate(config)

    expect(key).toBe('custom:GET:/api/test')
  })

  it('should handle FormData correctly', () => {
    const formData = new FormData()
    formData.append('name', 'test')
    formData.append('file', new File(['content'], 'test.txt'))

    const generator = createDeduplicationKeyGenerator({
      includeData: true
    })

    const config = {
      method: 'POST',
      url: '/api/upload',
      data: formData
    }

    const key = generator.generate(config)
    expect(key).toContain('data:')
    expect(key).toContain('name:test')
    expect(key).toContain('[File]')
  })

  it('should sort object keys for consistency', () => {
    const config1 = {
      method: 'GET',
      url: '/api/test',
      params: { b: 2, a: 1, c: 3 }
    }

    const config2 = {
      method: 'GET',
      url: '/api/test',
      params: { a: 1, c: 3, b: 2 }
    }

    const key1 = generator.generate(config1)
    const key2 = generator.generate(config2)

    expect(key1).toBe(key2)
  })
})
