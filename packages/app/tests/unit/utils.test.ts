import { describe, expect, it, vi } from 'vitest'
import {
  debounce,
  deepClone,
  formatDate,
  generateId,
  isEmpty,
  throttle,
} from '../../src/utils'

describe('工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15 10:30:45')
      expect(formatDate(date)).toBe('2024-01-15 10:30:45')
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date, 'HH:mm:ss')).toBe('10:30:45')
    })

    it('应该处理字符串和数字输入', () => {
      expect(formatDate('2024-01-15')).toMatch(/2024-01-15/)
      expect(formatDate(1705305045000)).toMatch(/2024-01-15/)
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', async () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('deepClone', () => {
    it('应该深度克隆对象', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2024-01-15'),
      }

      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.b.d).not.toBe(original.b.d)
      expect(cloned.e).not.toBe(original.e)
    })

    it('应该处理基本类型', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^id_\d+_[a-z0-9]+$/)
    })

    it('应该支持自定义前缀', () => {
      const id = generateId('test')
      expect(id).toMatch(/^test_\d+_[a-z0-9]+$/)
    })
  })

  describe('isEmpty', () => {
    it('应该正确判断空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('应该正确判断非空值', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })
})
