/**
 * 工具函数单元测试
 * 
 * 测试各种工具函数的功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateUUID,
  generateShortId,
  delay,
  withTimeout,
  retry,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isValidUrl,
  isWebSocketUrl,
  formatBytes,
  now,
  isEmpty,
  safeJsonParse,
  safeJsonStringify
} from '@/utils'

describe('工具函数', () => {
  describe('ID 生成', () => {
    it('应该生成有效的 UUID', () => {
      const uuid = generateUUID()
      
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('应该生成唯一的 UUID', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      
      expect(uuid1).not.toBe(uuid2)
    })

    it('应该生成指定长度的短 ID', () => {
      const shortId = generateShortId(10)
      
      expect(shortId).toHaveLength(10)
      expect(shortId).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('应该生成默认长度的短 ID', () => {
      const shortId = generateShortId()
      
      expect(shortId).toHaveLength(8)
    })
  })

  describe('异步工具', () => {
    it('应该延迟指定时间', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(90) // 允许一些误差
    })

    it('应该在超时时间内完成', async () => {
      const promise = Promise.resolve('success')
      const result = await withTimeout(promise, 100)
      
      expect(result).toBe('success')
    })

    it('应该在超时时抛出错误', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 200))
      
      await expect(withTimeout(promise, 100)).rejects.toThrow('操作超时')
    })

    it('应该使用自定义超时错误信息', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 200))
      
      await expect(withTimeout(promise, 100, '自定义超时')).rejects.toThrow('自定义超时')
    })
  })

  describe('重试机制', () => {
    it('应该在成功时不重试', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const result = await retry(fn)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在失败时重试', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')
      
      const result = await retry(fn, { maxAttempts: 3 })
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数时抛出错误', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fail'))
      
      await expect(retry(fn, { maxAttempts: 2 })).rejects.toThrow('always fail')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该使用自定义重试条件', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('retryable'))
        .mockRejectedValueOnce(new Error('non-retryable'))
      
      const shouldRetry = (error: Error) => error.message === 'retryable'
      
      await expect(retry(fn, { maxAttempts: 3, shouldRetry })).rejects.toThrow('non-retryable')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('防抖和节流', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该防抖函数调用', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, { delay: 100 })
      
      debouncedFn('call 1')
      debouncedFn('call 2')
      debouncedFn('call 3')
      
      expect(fn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('call 3')
    })

    it('应该支持立即执行的防抖', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, { delay: 100, immediate: true })
      
      debouncedFn('call 1')
      
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('call 1')
      
      debouncedFn('call 2')
      vi.advanceTimersByTime(100)
      
      expect(fn).toHaveBeenCalledTimes(1) // 不应该再次调用
    })

    it('应该取消防抖函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, { delay: 100 })
      
      debouncedFn('call 1')
      debouncedFn.cancel()
      
      vi.advanceTimersByTime(100)
      
      expect(fn).not.toHaveBeenCalled()
    })

    it('应该立即执行防抖函数', () => {
      const fn = vi.fn().mockReturnValue('result')
      const debouncedFn = debounce(fn, { delay: 100 })
      
      debouncedFn('call 1')
      const result = debouncedFn.flush()
      
      expect(fn).toHaveBeenCalledWith('call 1')
      expect(result).toBe('result')
    })
  })

  describe('对象操作', () => {
    it('应该深度克隆对象', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }]
        },
        f: new Date('2023-01-01')
      }
      
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.b.d).not.toBe(original.b.d)
      expect(cloned.f).not.toBe(original.f)
    })

    it('应该深度合并对象', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      }
      
      const source = {
        b: {
          d: 4,
          e: 5
        },
        f: 6
      }
      
      const result = deepMerge(target, source)
      
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 4,
          e: 5
        },
        f: 6
      })
    })
  })

  describe('URL 验证', () => {
    it('应该验证有效的 URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:8080')).toBe(true)
      expect(isValidUrl('ws://localhost:8080')).toBe(true)
      expect(isValidUrl('wss://example.com/socket')).toBe(true)
    })

    it('应该拒绝无效的 URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('://invalid')).toBe(false)
    })

    it('应该验证 WebSocket URL', () => {
      expect(isWebSocketUrl('ws://localhost:8080')).toBe(true)
      expect(isWebSocketUrl('wss://example.com/socket')).toBe(true)
    })

    it('应该拒绝非 WebSocket URL', () => {
      expect(isWebSocketUrl('http://example.com')).toBe(false)
      expect(isWebSocketUrl('https://example.com')).toBe(false)
      expect(isWebSocketUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('格式化工具', () => {
    it('应该格式化字节大小', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1536, 0)).toBe('2 KB')
    })

    it('应该返回当前时间戳', () => {
      const timestamp = now()
      const currentTime = Date.now()
      
      expect(timestamp).toBeCloseTo(currentTime, -2) // 允许一些误差
    })
  })

  describe('类型检查', () => {
    it('应该检查空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('JSON 工具', () => {
    it('应该安全解析 JSON', () => {
      expect(safeJsonParse('{"a": 1}', {})).toEqual({ a: 1 })
      expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true })
    })

    it('应该安全字符串化对象', () => {
      expect(safeJsonStringify({ a: 1 })).toBe('{"a":1}')
      
      // 创建循环引用
      const obj: any = { a: 1 }
      obj.self = obj
      
      expect(safeJsonStringify(obj, 'fallback')).toBe('fallback')
    })
  })
})
