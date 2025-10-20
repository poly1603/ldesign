import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  debounce,
  deepClone,
  delay,
  EventEmitter,
  formatBytes,
  generateId,
  isBrowser,
  isNode,
  isValidInput,
  safeJsonParse,
  safeJsonStringify,
  throttle,
} from '../../src/utils/index'

describe('utils', () => {
  describe('eventEmitter', () => {
    it('should be exported', () => {
      expect(EventEmitter).toBeDefined()
      expect(typeof EventEmitter).toBe('function')
    })
  })

  describe('isValidInput', () => {
    it('should return true for valid inputs', () => {
      expect(isValidInput('string')).toBe(true)
      expect(isValidInput(123)).toBe(true)
      expect(isValidInput(true)).toBe(true)
      expect(isValidInput(false)).toBe(true)
      expect(isValidInput({})).toBe(true)
      expect(isValidInput([])).toBe(true)
      expect(isValidInput(0)).toBe(true)
      expect(isValidInput('')).toBe(true)
    })

    it('should return false for invalid inputs', () => {
      expect(isValidInput(null)).toBe(false)
      expect(isValidInput(undefined)).toBe(false)
    })
  })

  describe('isBrowser', () => {
    it('should detect browser environment', () => {
      // In test environment, window and document are available
      expect(isBrowser()).toBe(true)
    })
  })

  describe('isNode', () => {
    it('should detect Node.js environment', () => {
      // In test environment, process is available
      expect(isNode()).toBe(true)
    })
  })

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const obj = { name: 'test', value: 123 }
      const json = JSON.stringify(obj)
      expect(safeJsonParse(json, null)).toEqual(obj)
    })

    it('should return default value for invalid JSON', () => {
      const defaultValue = { default: true }
      expect(safeJsonParse('invalid json', defaultValue)).toEqual(defaultValue)
    })

    it('should handle different default value types', () => {
      expect(safeJsonParse('invalid', 'default')).toBe('default')
      expect(safeJsonParse('invalid', 123)).toBe(123)
      expect(safeJsonParse('invalid', [])).toEqual([])
    })
  })

  describe('safeJsonStringify', () => {
    it('should stringify valid objects', () => {
      const obj = { name: 'test', value: 123 }
      expect(safeJsonStringify(obj)).toBe(JSON.stringify(obj))
    })

    it('should handle circular references', () => {
      const obj: any = { name: 'test' }
      obj.self = obj // Create circular reference

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = safeJsonStringify(obj)

      expect(consoleSpy).toHaveBeenCalled()
      expect(result).toBe('[object Object]')

      consoleSpy.mockRestore()
    })

    it('should handle primitive values', () => {
      expect(safeJsonStringify('string')).toBe('"string"')
      expect(safeJsonStringify(123)).toBe('123')
      expect(safeJsonStringify(true)).toBe('true')
      expect(safeJsonStringify(null)).toBe('null')
    })
  })

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(123)).toBe(123)
      expect(deepClone('string')).toBe('string')
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    it('should clone Date objects', () => {
      const date = new Date('2023-01-01')
      const cloned = deepClone(date)
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('should clone arrays', () => {
      const arr = [1, 2, { nested: true }]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[2]).not.toBe(arr[2])
    })

    it('should clone objects', () => {
      const obj = {
        name: 'test',
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
      }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.nested).not.toBe(obj.nested)
      expect(cloned.nested.array).not.toBe(obj.nested.array)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should debounce function calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg3')
    })

    it('should reset timer on subsequent calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1')
      vi.advanceTimersByTime(50)
      debouncedFn('arg2')
      vi.advanceTimersByTime(50)

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg2')
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should throttle function calls', () => {
      const fn = vi.fn()
    const throttledFn = throttle(fn, { flushInterval: 100 })

      // 第一次调用应该立即执行
      throttledFn('arg1')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1')

      // 在节流期间的调用应该被忽略
      throttledFn('arg2')
      throttledFn('arg3')
      expect(fn).toHaveBeenCalledTimes(1) // 仍然只调用了一次

      // 推进时间，节流期结束
      vi.advanceTimersByTime(100)

      // 现在再次调用应该立即执行
      throttledFn('arg4')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('arg4')
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
    })

    it('should handle decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB')
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 2)).toBe('1.5 KB')
    })

    it('should handle negative decimals', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
      expect(id2.length).toBeGreaterThan(0)
    })
  })

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should delay execution', async () => {
      const promise = delay(1000)
      let resolved = false

      promise.then(() => {
        resolved = true
      })

      expect(resolved).toBe(false)

      vi.advanceTimersByTime(1000)
      await promise

      expect(resolved).toBe(true)
    })
  })
})
