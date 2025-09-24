/**
 * 防抖管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DebounceManagerImpl } from '../src/utils/DebounceManager'

describe('DebounceManager', () => {
  let debounceManager: DebounceManagerImpl

  beforeEach(() => {
    debounceManager = new DebounceManagerImpl()
    vi.useFakeTimers()
  })

  afterEach(() => {
    debounceManager.clear()
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该正确执行防抖函数', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')
      
      const promise = debounceManager.execute('test-key', mockFn, 100)
      
      // 立即检查，函数还未执行
      expect(mockFn).not.toHaveBeenCalled()
      expect(debounceManager.has('test-key')).toBe(true)
      expect(debounceManager.size()).toBe(1)
      
      // 快进时间
      vi.advanceTimersByTime(100)
      
      const result = await promise
      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(debounceManager.has('test-key')).toBe(false)
      expect(debounceManager.size()).toBe(0)
    })

    it('应该正确处理防抖延迟', async () => {
      const mockFn = vi.fn().mockResolvedValue('delayed')
      
      const promise = debounceManager.execute('delay-key', mockFn, 500)
      
      // 300ms 后检查，函数还未执行
      vi.advanceTimersByTime(300)
      expect(mockFn).not.toHaveBeenCalled()
      
      // 再过 200ms，总共 500ms
      vi.advanceTimersByTime(200)
      
      const result = await promise
      expect(result).toBe('delayed')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理函数错误', async () => {
      const error = new Error('Test error')
      const mockFn = vi.fn().mockRejectedValue(error)
      
      const promise = debounceManager.execute('error-key', mockFn, 100)
      
      vi.advanceTimersByTime(100)
      
      await expect(promise).rejects.toThrow('Test error')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(debounceManager.has('error-key')).toBe(false)
    })
  })

  describe('防抖策略', () => {
    it('应该取消之前的防抖并执行最新的', async () => {
      const mockFn1 = vi.fn().mockResolvedValue('first')
      const mockFn2 = vi.fn().mockResolvedValue('second')
      
      // 第一次调用
      const promise1 = debounceManager.execute('same-key', mockFn1, 100)
      
      // 50ms 后再次调用，应该取消第一次
      vi.advanceTimersByTime(50)
      const promise2 = debounceManager.execute('same-key', mockFn2, 100)
      
      // 再过 100ms，只有第二个函数应该执行
      vi.advanceTimersByTime(100)
      
      // 第一个 promise 应该永远不会 resolve（被取消了）
      const result2 = await promise2
      expect(result2).toBe('second')
      expect(mockFn1).not.toHaveBeenCalled()
      expect(mockFn2).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个不同键的并发防抖', async () => {
      const mockFn1 = vi.fn().mockResolvedValue('key1')
      const mockFn2 = vi.fn().mockResolvedValue('key2')
      
      const promise1 = debounceManager.execute('key1', mockFn1, 100)
      const promise2 = debounceManager.execute('key2', mockFn2, 150)
      
      expect(debounceManager.size()).toBe(2)
      
      // 100ms 后，第一个函数执行
      vi.advanceTimersByTime(100)
      const result1 = await promise1
      expect(result1).toBe('key1')
      expect(debounceManager.size()).toBe(1)
      
      // 再过 50ms，第二个函数执行
      vi.advanceTimersByTime(50)
      const result2 = await promise2
      expect(result2).toBe('key2')
      expect(debounceManager.size()).toBe(0)
    })
  })

  describe('取消操作', () => {
    it('应该正确取消指定键的防抖', async () => {
      const mockFn = vi.fn().mockResolvedValue('cancelled')
      
      const promise = debounceManager.execute('cancel-key', mockFn, 100)
      
      expect(debounceManager.has('cancel-key')).toBe(true)
      
      // 取消防抖
      debounceManager.cancel('cancel-key')
      
      expect(debounceManager.has('cancel-key')).toBe(false)
      expect(debounceManager.size()).toBe(0)
      
      // 即使时间过去，函数也不应该执行
      vi.advanceTimersByTime(200)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('应该正确处理取消不存在的键', () => {
      expect(() => {
        debounceManager.cancel('nonexistent-key')
      }).not.toThrow()
    })

    it('应该正确清除所有防抖', async () => {
      const mockFn1 = vi.fn().mockResolvedValue('1')
      const mockFn2 = vi.fn().mockResolvedValue('2')
      const mockFn3 = vi.fn().mockResolvedValue('3')
      
      debounceManager.execute('key1', mockFn1, 100)
      debounceManager.execute('key2', mockFn2, 200)
      debounceManager.execute('key3', mockFn3, 300)
      
      expect(debounceManager.size()).toBe(3)
      
      // 清除所有
      debounceManager.clear()
      
      expect(debounceManager.size()).toBe(0)
      expect(debounceManager.has('key1')).toBe(false)
      expect(debounceManager.has('key2')).toBe(false)
      expect(debounceManager.has('key3')).toBe(false)
      
      // 即使时间过去，函数也不应该执行
      vi.advanceTimersByTime(500)
      expect(mockFn1).not.toHaveBeenCalled()
      expect(mockFn2).not.toHaveBeenCalled()
      expect(mockFn3).not.toHaveBeenCalled()
    })
  })

  describe('状态查询', () => {
    it('应该正确报告防抖项数量', () => {
      expect(debounceManager.size()).toBe(0)
      
      debounceManager.execute('key1', vi.fn(), 100)
      expect(debounceManager.size()).toBe(1)
      
      debounceManager.execute('key2', vi.fn(), 100)
      expect(debounceManager.size()).toBe(2)
      
      debounceManager.cancel('key1')
      expect(debounceManager.size()).toBe(1)
      
      debounceManager.clear()
      expect(debounceManager.size()).toBe(0)
    })

    it('应该正确检查防抖项是否存在', () => {
      expect(debounceManager.has('test-key')).toBe(false)
      
      debounceManager.execute('test-key', vi.fn(), 100)
      expect(debounceManager.has('test-key')).toBe(true)
      
      debounceManager.cancel('test-key')
      expect(debounceManager.has('test-key')).toBe(false)
    })

    it('应该正确获取所有防抖键', () => {
      expect(debounceManager.keys()).toEqual([])
      
      debounceManager.execute('key1', vi.fn(), 100)
      debounceManager.execute('key2', vi.fn(), 100)
      debounceManager.execute('key3', vi.fn(), 100)
      
      const keys = debounceManager.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })
  })

  describe('边界情况', () => {
    it('应该处理零延迟', async () => {
      const mockFn = vi.fn().mockResolvedValue('immediate')
      
      const promise = debounceManager.execute('zero-delay', mockFn, 0)
      
      vi.advanceTimersByTime(0)
      
      const result = await promise
      expect(result).toBe('immediate')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该处理负延迟', async () => {
      const mockFn = vi.fn().mockResolvedValue('negative')
      
      const promise = debounceManager.execute('negative-delay', mockFn, -100)
      
      vi.advanceTimersByTime(0)
      
      const result = await promise
      expect(result).toBe('negative')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该处理空字符串键', async () => {
      const mockFn = vi.fn().mockResolvedValue('empty-key')
      
      const promise = debounceManager.execute('', mockFn, 100)
      
      expect(debounceManager.has('')).toBe(true)
      
      vi.advanceTimersByTime(100)
      
      const result = await promise
      expect(result).toBe('empty-key')
    })

    it('应该处理异步函数中的异常', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Async error'))

      const promise = debounceManager.execute('async-error', mockFn, 100)

      vi.advanceTimersByTime(100)

      await expect(promise).rejects.toThrow('Async error')
      expect(debounceManager.has('async-error')).toBe(false)
    })
  })
})
