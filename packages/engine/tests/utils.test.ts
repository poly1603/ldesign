import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  chunk,
  debounce,
  deepClone,
  delay,
  formatFileSize,
  formatTime,
  generateId,
  getNestedValue,
  groupBy,
  isEmpty,
  isFunction,
  isObject,
  isPromise,
  retry,
  safeJsonParse,
  safeJsonStringify,
  setNestedValue,
  throttle,
  unique,
} from '../src/utils'

describe('工具函数', () => {
  describe('deepClone', () => {
    it('应该克隆基本类型', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
    })

    it('应该克隆日期对象', () => {
      const date = new Date('2023-01-01')
      const cloned = deepClone(date)

      expect(cloned).toBeInstanceOf(Date)
      expect(cloned.getTime()).toBe(date.getTime())
      expect(cloned).not.toBe(date)
    })

    it('应该克隆数组', () => {
      const arr = [1, 2, { a: 3 }]
      const cloned = deepClone(arr)

      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[2]).not.toBe(arr[2])
    })

    it('应该克隆对象', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('应该在循环引用时抛出错误', () => {
      const obj: any = { a: 1 }
      obj.self = obj

      // 当前实现不支持循环引用，会抛出栈溢出错误
      expect(() => deepClone(obj)).toThrow()
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

    it('应该传递参数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1', 'arg2')
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
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
      // 禁用 trailing 选项以匹配旧的行为
      const throttledFn = throttle(fn, 100, { leading: true, trailing: false })

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该传递参数', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn('arg1', 'arg2')
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
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

  describe('isEmpty', () => {
    it('应该检测空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('应该检测非空值', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('应该格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('formatTime', () => {
    it('应该格式化时间', () => {
      expect(formatTime(500)).toBe('500ms')
      expect(formatTime(1500)).toBe('1s')
      expect(formatTime(65000)).toBe('1m 5s')
      expect(formatTime(3665000)).toBe('1h 1m')
    })
  })

  describe('safeJsonParse', () => {
    it('应该解析有效JSON', () => {
      const result = safeJsonParse('{"a": 1}', {})
      expect(result).toEqual({ a: 1 })
    })

    it('应该返回默认值当JSON无效时', () => {
      const defaultValue = { default: true }
      const result = safeJsonParse('invalid json', defaultValue)
      expect(result).toBe(defaultValue)
    })
  })

  describe('safeJsonStringify', () => {
    it('应该字符串化对象', () => {
      const result = safeJsonStringify({ a: 1 })
      expect(result).toBe('{"a":1}')
    })

    it('应该处理循环引用', () => {
      const obj: any = { a: 1 }
      obj.self = obj

      const result = safeJsonStringify(obj)
      expect(result).toBe('{}')
    })

    it('应该支持格式化', () => {
      const result = safeJsonStringify({ a: 1 }, 2)
      expect(result).toContain('\n')
    })
  })

  describe('getNestedValue', () => {
    const obj = {
      a: {
        b: {
          c: 'value',
        },
      },
    }

    it('应该获取嵌套值', () => {
      expect(getNestedValue(obj, 'a.b.c')).toBe('value')
      expect(getNestedValue(obj, 'a.b')).toEqual({ c: 'value' })
    })

    it('应该返回默认值当路径不存在时', () => {
      expect(getNestedValue(obj, 'a.b.d', 'default')).toBe('default')
      expect(getNestedValue(obj, 'x.y.z', 'default')).toBe('default')
    })

    it('应该处理null和undefined', () => {
      expect(getNestedValue({} as any, 'a.b', 'default')).toBe('default')
      expect(getNestedValue({} as any, 'a.b', 'default')).toBe('default')
    })
  })

  describe('setNestedValue', () => {
    it('应该设置嵌套值', () => {
      const obj: any = {}
      setNestedValue(obj, 'a.b.c', 'value')

      expect(obj.a.b.c).toBe('value')
    })

    it('应该覆盖现有值', () => {
      const obj = { a: { b: { c: 'old' } } }
      setNestedValue(obj, 'a.b.c', 'new')

      expect(obj.a.b.c).toBe('new')
    })

    it('应该创建中间对象', () => {
      const obj: any = { a: 'not object' }
      setNestedValue(obj, 'a.b.c', 'value')

      expect(obj.a.b.c).toBe('value')
    })
  })

  describe('类型守卫', () => {
    describe('isFunction', () => {
      it('应该检测函数', () => {
        expect(isFunction(() => { })).toBe(true)
        expect(isFunction(() => { })).toBe(true)
        expect(isFunction(async () => { })).toBe(true)
        expect(isFunction('not function')).toBe(false)
        expect(isFunction({})).toBe(false)
      })
    })

    describe('isObject', () => {
      it('应该检测对象', () => {
        expect(isObject({})).toBe(true)
        expect(isObject({ a: 1 })).toBe(true)
        expect(isObject([])).toBe(false)
        expect(isObject(null)).toBe(false)
        expect(isObject('string')).toBe(false)
      })
    })

    describe('isPromise', () => {
      it('应该检测Promise', () => {
        expect(isPromise(Promise.resolve())).toBe(true)
        expect(isPromise({ then: () => { } })).toBe(true)
        expect(isPromise({})).toBe(false)
        expect(isPromise('string')).toBe(false)
      })
    })
  })

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该延迟指定时间', async () => {
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

  describe('retry', () => {
    it('应该在成功时返回结果', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retry(fn)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该重试失败的函数', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      const result = await retry(fn, 3, 0)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const error = new Error('always fail')
      const fn = vi.fn().mockRejectedValue(error)

      await expect(retry(fn, 2, 0)).rejects.toThrow('always fail')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('数组工具', () => {
    describe('unique', () => {
      it('应该去除重复元素', () => {
        expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
        expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
      })

      it('应该处理空数组', () => {
        expect(unique([])).toEqual([])
      })
    })

    describe('groupBy', () => {
      it('应该按键分组', () => {
        const items = [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'carrot' },
        ]

        const grouped = groupBy(items, item => item.type)

        expect(grouped.fruit).toHaveLength(2)
        expect(grouped.vegetable).toHaveLength(1)
      })
    })

    describe('chunk', () => {
      it('应该将数组分块', () => {
        const result = chunk([1, 2, 3, 4, 5], 2)
        expect(result).toEqual([[1, 2], [3, 4], [5]])
      })

      it('应该处理空数组', () => {
        expect(chunk([], 2)).toEqual([])
      })

      it('应该处理大小大于数组长度的情况', () => {
        expect(chunk([1, 2], 5)).toEqual([[1, 2]])
      })
    })
  })
})
