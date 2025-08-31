/**
 * 通用工具函数测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  hasOwn,
  getPropertyValFromObj,
  isPlainObject,
  isPromise,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  generateId,
  generateUUID,
  delay,
  retry,
  isEmpty,
} from '../general'

describe('通用工具函数', () => {
  describe('hasOwn', () => {
    it('应该检查对象是否拥有指定属性', () => {
      const obj = { name: 'John', age: 30 }

      expect(hasOwn(obj, 'name')).toBe(true)
      expect(hasOwn(obj, 'age')).toBe(true)
      expect(hasOwn(obj, 'invalid')).toBe(false)
    })

    it('应该处理 Symbol 键', () => {
      const sym = Symbol('test')
      const obj = { [sym]: 'value' }

      expect(hasOwn(obj, sym)).toBe(true)
    })
  })

  describe('getPropertyValFromObj', () => {
    it('应该安全地获取属性值', () => {
      const obj = { name: 'John', age: 30 }

      expect(getPropertyValFromObj(obj, 'name')).toBe('John')
      expect(getPropertyValFromObj(obj, 'age')).toBe(30)
      expect(getPropertyValFromObj(obj, 'invalid')).toBeUndefined()
    })
  })

  describe('isPlainObject', () => {
    it('应该识别纯对象', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ name: 'John' })).toBe(true)
    })

    it('应该拒绝非纯对象', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(42)).toBe(false)
    })
  })

  describe('isPromise', () => {
    it('应该识别 Promise 对象', () => {
      expect(isPromise(Promise.resolve())).toBe(true)
      expect(isPromise(Promise.reject().catch(() => { }))).toBe(true)
    })

    it('应该识别类 Promise 对象', () => {
      const thenable = {
        then: () => { },
        catch: () => { },
      }
      expect(isPromise(thenable)).toBe(true)
    })

    it('应该拒绝非 Promise 对象', () => {
      expect(isPromise({})).toBe(false)
      expect(isPromise(null)).toBe(false)
      expect(isPromise('string')).toBe(false)
      expect(isPromise(42)).toBe(false)
    })
  })

  describe('deepClone', () => {
    it('应该深度克隆对象', () => {
      const original = {
        name: 'John',
        address: { city: 'New York', country: 'USA' },
        hobbies: ['reading', 'coding'],
      }

      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.address).not.toBe(original.address)
      expect(cloned.hobbies).not.toBe(original.hobbies)
    })

    it('应该克隆日期对象', () => {
      const date = new Date('2023-12-25')
      const cloned = deepClone(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('应该克隆数组', () => {
      const array = [1, [2, 3], { a: 4 }]
      const cloned = deepClone(array)

      expect(cloned).toEqual(array)
      expect(cloned).not.toBe(array)
      expect(cloned[1]).not.toBe(array[1])
      expect(cloned[2]).not.toBe(array[2])
    })

    it('应该处理原始值', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('string')).toBe('string')
      expect(deepClone(true)).toBe(true)
    })
  })

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const target = { a: 1, b: { x: 1 } }
      const source1 = { b: { y: 2 }, c: 3 } as any
      const source2 = { d: 4 } as any

      const result = deepMerge(target, source1, source2)

      expect(result).toEqual({
        a: 1,
        b: { x: 1, y: 2 },
        c: 3,
        d: 4,
      })
    })

    it('应该覆盖非对象属性', () => {
      const target = { a: 1, b: 'old' }
      const source = { b: 'new', c: 3 }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 'new', c: 3 })
    })

    it('应该处理空源对象', () => {
      const target = { a: 1 }
      const result = deepMerge(target)

      expect(result).toEqual({ a: 1 })
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该取消之前的调用', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持立即执行', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100, true)

      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该限制函数执行频率', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      throttledFn()
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^id_\d+_[a-z0-9]+$/)
    })

    it('应该支持自定义前缀', () => {
      const id = generateId('user')
      expect(id).toMatch(/^user_\d+_[a-z0-9]+$/)
    })
  })

  describe('generateUUID', () => {
    it('应该生成有效的 UUID v4', () => {
      const uuid = generateUUID()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('应该生成不同的 UUID', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('delay', () => {
    it('应该延迟指定时间', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(90) // 允许一些误差
    })
  })

  describe('retry', () => {
    it('应该在成功时返回结果', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await retry(fn, 3)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该重试失败的函数', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retry(fn, 3, 0) // 0 延迟以加快测试

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const error = new Error('persistent failure')
      const fn = vi.fn().mockRejectedValue(error)

      await expect(retry(fn, 2, 0)).rejects.toThrow('persistent failure')
      expect(fn).toHaveBeenCalledTimes(3) // 初始调用 + 2 次重试
    })
  })

  describe('isEmpty', () => {
    it('应该识别空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('应该识别非空值', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ name: 'John' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })
})
