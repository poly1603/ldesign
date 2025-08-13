import { describe, expect, it, vi } from 'vitest'
import {
  debounce,
  deepMerge,
  formatError,
  generateId,
  get,
  isEmpty,
  isObject,
  isValidInput,
  retry,
  safeJsonParse,
  safeJsonStringify,
  set,
  sleep,
  throttle,
} from '../src/utils'

describe('utils', () => {
  describe('isValidInput', () => {
    it('应该对有效输入返回 true', () => {
      expect(isValidInput('string')).toBe(true)
      expect(isValidInput(123)).toBe(true)
      expect(isValidInput({})).toBe(true)
      expect(isValidInput([])).toBe(true)
      expect(isValidInput(false)).toBe(true)
      expect(isValidInput(0)).toBe(true)
    })

    it('应该对无效输入返回 false', () => {
      expect(isValidInput(null)).toBe(false)
      expect(isValidInput(undefined)).toBe(false)
    })
  })

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: { d: 3 }, e: 4 }

      const result = deepMerge(target, source)

      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      })
    })

    it('应该处理多个源对象', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }

      const result = deepMerge(target, source1, source2)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('isObject', () => {
    it('应该正确识别对象', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })

    it('应该正确识别非对象', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject('string')).toBe(false)
      expect(isObject(123)).toBe(false)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^id_\d+_[a-z0-9]+$/)
    })

    it('应该使用自定义前缀', () => {
      const id = generateId('test')
      expect(id).toMatch(/^test_\d+_[a-z0-9]+$/)
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

      await sleep(150)
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

      await sleep(150)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('retry', () => {
    it('应该在成功时返回结果', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retry(fn, 3, 10)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在失败时重试', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retry(fn, 3, 10)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数时抛出错误', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fail'))

      await expect(retry(fn, 2, 10)).rejects.toThrow('always fail')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('formatError', () => {
    it('应该格式化 Error 对象', () => {
      const error = new Error('test error')
      expect(formatError(error)).toBe('test error')
    })

    it('应该格式化字符串错误', () => {
      expect(formatError('string error')).toBe('string error')
    })

    it('应该格式化对象错误', () => {
      expect(formatError({ message: 'object error' })).toBe('object error')
      expect(formatError({ msg: 'object msg' })).toBe('object msg')
    })

    it('应该处理其他类型的错误', () => {
      expect(formatError(123)).toBe('123')
      expect(formatError(null)).toBe('null')
    })
  })

  describe('isEmpty', () => {
    it('应该正确识别空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('应该正确识别非空值', () => {
      expect(isEmpty('text')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('safeJsonParse', () => {
    it('应该解析有效的 JSON', () => {
      const result = safeJsonParse('{"a": 1}', {})
      expect(result).toEqual({ a: 1 })
    })

    it('应该在解析失败时返回默认值', () => {
      const result = safeJsonParse('invalid json', { default: true })
      expect(result).toEqual({ default: true })
    })
  })

  describe('safeJsonStringify', () => {
    it('应该字符串化有效对象', () => {
      const result = safeJsonStringify({ a: 1 })
      expect(result).toBe('{"a":1}')
    })

    it('应该在字符串化失败时返回默认值', () => {
      const circular: any = {}
      circular.self = circular

      const result = safeJsonStringify(circular, '{}')
      expect(result).toBe('{}')
    })
  })

  describe('get', () => {
    it('应该获取嵌套属性值', () => {
      const obj = { a: { b: { c: 'value' } } }

      expect(get(obj, 'a.b.c')).toBe('value')
      expect(get(obj, 'a.b')).toEqual({ c: 'value' })
      expect(get(obj, 'a')).toEqual({ b: { c: 'value' } })
    })

    it('应该在路径不存在时返回默认值', () => {
      const obj = { a: { b: 'value' } }

      expect(get(obj, 'a.b.c', 'default')).toBe('default')
      expect(get(obj, 'x.y.z', 'default')).toBe('default')
    })
  })

  describe('set', () => {
    it('应该设置嵌套属性值', () => {
      const obj: any = {}

      set(obj, 'a.b.c', 'value')

      expect(obj).toEqual({
        a: {
          b: {
            c: 'value',
          },
        },
      })
    })

    it('应该覆盖现有值', () => {
      const obj = { a: { b: 'old' } }

      set(obj, 'a.b', 'new')

      expect(obj.a.b).toBe('new')
    })
  })
})
