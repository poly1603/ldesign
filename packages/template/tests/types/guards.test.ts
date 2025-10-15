import { describe, it, expect } from 'vitest'
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isPromise,
  isNull,
  isUndefined,
  isNil,
  isDefined,
  isEmpty,
  isPlainObject,
  isDate,
  isRegExp,
  isError,
  isSymbol,
  isBigInt,
} from '../../src/types/guards'

describe('Type Guards', () => {
  describe('isString', () => {
    it('应该识别字符串', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
      expect(isString(String('test'))).toBe(true)
    })

    it('应该拒绝非字符串', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
      expect(isString([])).toBe(false)
    })

    it('类型断言应该正确工作', () => {
      const value: unknown = 'hello'
      if (isString(value)) {
        // TypeScript 应该知道 value 是 string
        const upper: string = value.toUpperCase()
        expect(upper).toBe('HELLO')
      }
    })
  })

  describe('isNumber', () => {
    it('应该识别数字', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-123)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(Infinity)).toBe(true)
      expect(isNumber(Number.NaN)).toBe(true)
    })

    it('应该拒绝非数字', () => {
      expect(isNumber('123')).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber({})).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('应该识别布尔值', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
      expect(isBoolean(Boolean(1))).toBe(true)
    })

    it('应该拒绝非布尔值', () => {
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean('true')).toBe(false)
      expect(isBoolean(null)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('应该识别对象', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ key: 'value' })).toBe(true)
      expect(isObject(new Date())).toBe(true)
      expect(isObject(new Error())).toBe(true)
      expect(isObject([])).toBe(true) // 数组也是对象
    })

    it('应该拒绝非对象', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject(123)).toBe(false)
      expect(isObject('string')).toBe(false)
      expect(isObject(true)).toBe(false)
    })
  })

  describe('isArray', () => {
    it('应该识别数组', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray(Array.from({ length: 5 }))).toBe(true)
      expect(isArray([])).toBe(true)
    })

    it('应该拒绝非数组', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('array')).toBe(false)
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
      expect(isArray({ length: 0 })).toBe(false) // 类数组对象
    })

    it('类型断言应该正确工作', () => {
      const value: unknown = [1, 2, 3]
      if (isArray(value)) {
        // TypeScript 应该知道 value 是数组
        const sum = value.reduce((a, b) => a + b, 0)
        expect(sum).toBe(6)
      }
    })
  })

  describe('isFunction', () => {
    it('应该识别函数', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
      expect(isFunction(function*() {})).toBe(true)
      expect(isFunction(Date)).toBe(true)
      expect(isFunction(class {})).toBe(true)
    })

    it('应该拒绝非函数', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction([])).toBe(false)
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
      expect(isFunction(123)).toBe(false)
    })

    it('类型断言应该正确工作', () => {
      const value: unknown = (x: number) => x * 2
      if (isFunction(value)) {
        const result = value(21)
        expect(result).toBe(42)
      }
    })
  })

  describe('isPromise', () => {
    it('应该识别 Promise', () => {
      expect(isPromise(Promise.resolve())).toBe(true)
      expect(isPromise(Promise.reject().catch(() => {}))).toBe(true)
      expect(isPromise(new Promise(() => {}))).toBe(true)
      expect(isPromise((async () => {})())).toBe(true)
    })

    it('应该识别类 Promise 对象', () => {
      const thenable = {
        then: (resolve: Function) => resolve('value'),
      }
      expect(isPromise(thenable)).toBe(true)
    })

    it('应该拒绝非 Promise', () => {
      expect(isPromise({})).toBe(false)
      expect(isPromise({ then: 'not a function' })).toBe(false)
      expect(isPromise(null)).toBe(false)
      expect(isPromise(undefined)).toBe(false)
      expect(isPromise(() => {})).toBe(false)
    })

    it('类型断言应该正确工作', async () => {
      const value: unknown = Promise.resolve(42)
      if (isPromise(value)) {
        const result = await value
        expect(result).toBe(42)
      }
    })
  })

  describe('isNull', () => {
    it('应该识别 null', () => {
      expect(isNull(null)).toBe(true)
    })

    it('应该拒绝非 null', () => {
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
      expect(isNull(false)).toBe(false)
      expect(isNull('')).toBe(false)
      expect(isNull({})).toBe(false)
    })
  })

  describe('isUndefined', () => {
    it('应该识别 undefined', () => {
      expect(isUndefined(undefined)).toBe(true)
      expect(isUndefined(void 0)).toBe(true)
    })

    it('应该拒绝非 undefined', () => {
      expect(isUndefined(null)).toBe(false)
      expect(isUndefined(0)).toBe(false)
      expect(isUndefined(false)).toBe(false)
      expect(isUndefined('')).toBe(false)
    })
  })

  describe('isNil', () => {
    it('应该识别 null 和 undefined', () => {
      expect(isNil(null)).toBe(true)
      expect(isNil(undefined)).toBe(true)
    })

    it('应该拒绝其他值', () => {
      expect(isNil(0)).toBe(false)
      expect(isNil(false)).toBe(false)
      expect(isNil('')).toBe(false)
      expect(isNil({})).toBe(false)
      expect(isNil([])).toBe(false)
    })
  })

  describe('isDefined', () => {
    it('应该识别非 undefined 值', () => {
      expect(isDefined(null)).toBe(true)
      expect(isDefined(0)).toBe(true)
      expect(isDefined(false)).toBe(true)
      expect(isDefined('')).toBe(true)
      expect(isDefined({})).toBe(true)
    })

    it('应该拒绝 undefined', () => {
      expect(isDefined(undefined)).toBe(false)
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
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })

    it('应该处理 Map 和 Set', () => {
      expect(isEmpty(new Map())).toBe(true)
      expect(isEmpty(new Set())).toBe(true)

      const map = new Map()
      map.set('key', 'value')
      expect(isEmpty(map)).toBe(false)

      const set = new Set()
      set.add(1)
      expect(isEmpty(set)).toBe(false)
    })
  })

  describe('isPlainObject', () => {
    it('应该识别纯对象', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ key: 'value' })).toBe(true)
      expect(isPlainObject(Object.create(null))).toBe(true)
    })

    it('应该拒绝非纯对象', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(new Error())).toBe(false)
      expect(isPlainObject(/regex/)).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)

      class MyClass {}
      expect(isPlainObject(new MyClass())).toBe(false)
    })
  })

  describe('isDate', () => {
    it('应该识别 Date 对象', () => {
      expect(isDate(new Date())).toBe(true)
      expect(isDate(new Date('2025-01-01'))).toBe(true)
    })

    it('应该拒绝非 Date', () => {
      expect(isDate('2025-01-01')).toBe(false)
      expect(isDate(1609459200000)).toBe(false)
      expect(isDate({})).toBe(false)
      expect(isDate(null)).toBe(false)
    })

    it('应该识别无效的 Date', () => {
      const invalidDate = new Date('invalid')
      expect(isDate(invalidDate)).toBe(true) // 仍然是 Date 对象
    })
  })

  describe('isRegExp', () => {
    it('应该识别正则表达式', () => {
      expect(isRegExp(/test/)).toBe(true)
      expect(isRegExp(new RegExp('test'))).toBe(true)
      expect(isRegExp(/test/gi)).toBe(true)
    })

    it('应该拒绝非正则表达式', () => {
      expect(isRegExp('/test/')).toBe(false)
      expect(isRegExp({})).toBe(false)
      expect(isRegExp(null)).toBe(false)
    })
  })

  describe('isError', () => {
    it('应该识别 Error 对象', () => {
      expect(isError(new Error())).toBe(true)
      expect(isError(new TypeError())).toBe(true)
      expect(isError(new RangeError())).toBe(true)
      expect(isError(new EvalError())).toBe(true)
    })

    it('应该识别自定义 Error', () => {
      class CustomError extends Error {}
      expect(isError(new CustomError())).toBe(true)
    })

    it('应该拒绝非 Error', () => {
      expect(isError({ message: 'error' })).toBe(false)
      expect(isError('error')).toBe(false)
      expect(isError(null)).toBe(false)
    })
  })

  describe('isSymbol', () => {
    it('应该识别 Symbol', () => {
      expect(isSymbol(Symbol())).toBe(true)
      expect(isSymbol(Symbol('test'))).toBe(true)
      expect(isSymbol(Symbol.iterator)).toBe(true)
    })

    it('应该拒绝非 Symbol', () => {
      expect(isSymbol('Symbol()')).toBe(false)
      expect(isSymbol({})).toBe(false)
      expect(isSymbol(null)).toBe(false)
    })
  })

  describe('isBigInt', () => {
    it('应该识别 BigInt', () => {
      expect(isBigInt(BigInt(123))).toBe(true)
      expect(isBigInt(123n)).toBe(true)
      expect(isBigInt(BigInt('123'))).toBe(true)
    })

    it('应该拒绝非 BigInt', () => {
      expect(isBigInt(123)).toBe(false)
      expect(isBigInt('123n')).toBe(false)
      expect(isBigInt(null)).toBe(false)
    })
  })

  describe('复杂类型组合', () => {
    it('应该正确处理嵌套对象', () => {
      const value: unknown = {
        name: 'test',
        age: 25,
        hobbies: ['reading', 'coding'],
        address: {
          city: 'New York',
          zip: 10001,
        },
      }

      expect(isObject(value)).toBe(true)
      if (isObject(value)) {
        expect(isArray((value as any).hobbies)).toBe(true)
        expect(isPlainObject((value as any).address)).toBe(true)
        expect(isString((value as any).name)).toBe(true)
        expect(isNumber((value as any).age)).toBe(true)
      }
    })

    it('应该正确处理可选值', () => {
      const value: string | null | undefined = null

      if (!isNil(value)) {
        // TypeScript 知道 value 不是 null/undefined
        const upper = value.toUpperCase()
      }
 else {
        // TypeScript 知道 value 是 null 或 undefined
        expect(isNil(value)).toBe(true)
      }
    })

    it('应该正确处理联合类型', () => {
      const value: string | number | boolean = 'hello'

      if (isString(value)) {
        expect(value.length).toBeGreaterThan(0)
      }
 else if (isNumber(value)) {
        expect(value).toBeGreaterThan(0)
      }
 else if (isBoolean(value)) {
        expect(value).toBe(true)
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理原型链', () => {
      const proto = { protoKey: 'value' }
      const obj = Object.create(proto)
      obj.ownKey = 'value'

      expect(isObject(obj)).toBe(true)
      expect(isPlainObject(obj)).toBe(false) // 有自定义原型
    })

    it('应该处理冻结的对象', () => {
      const obj = Object.freeze({ key: 'value' })
      expect(isObject(obj)).toBe(true)
      expect(isPlainObject(obj)).toBe(true)
    })

    it('应该处理密封的对象', () => {
      const obj = Object.seal({ key: 'value' })
      expect(isObject(obj)).toBe(true)
      expect(isPlainObject(obj)).toBe(true)
    })

    it('应该处理 Proxy', () => {
      const target = { key: 'value' }
      const proxy = new Proxy(target, {})

      expect(isObject(proxy)).toBe(true)
      expect(isPlainObject(proxy)).toBe(true)
    })

    it('应该处理 getter/setter', () => {
      const obj = {
        _value: 0,
        get value() {
          return this._value
        },
        set value(val) {
          this._value = val
        },
      }

      expect(isObject(obj)).toBe(true)
      expect(isPlainObject(obj)).toBe(true)
    })
  })

  describe('性能', () => {
    it('类型守卫应该快速执行', () => {
      const iterations = 100000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        isString('test')
        isNumber(123)
        isBoolean(true)
        isObject({})
        isArray([])
        isFunction(() => {})
      }
      const end = performance.now()

      const duration = end - start
      expect(duration).toBeLessThan(100) // 应该很快
    })
  })

  describe('TypeScript 类型推断', () => {
    it('应该正确窄化类型', () => {
      function process(value: unknown) {
        if (isString(value)) {
          // value 类型应该是 string
          return value.toUpperCase()
        }
 else if (isNumber(value)) {
          // value 类型应该是 number
          return value.toFixed(2)
        }
 else if (isArray(value)) {
          // value 类型应该是 unknown[]
          return value.length
        }
 else if (isPlainObject(value)) {
          // value 类型应该是 object
          return Object.keys(value).length
        }
        return null
      }

      expect(process('hello')).toBe('HELLO')
      expect(process(3.14159)).toBe('3.14')
      expect(process([1, 2, 3])).toBe(3)
      expect(process({ a: 1, b: 2 })).toBe(2)
      expect(process(null)).toBeNull()
    })

    it('应该支持类型断言链', () => {
      const value: unknown = { items: ['a', 'b', 'c'] }

      if (isObject(value) && 'items' in value) {
        const items = (value as any).items
        if (isArray(items) && items.every(isString)) {
          expect(items).toEqual(['a', 'b', 'c'])
        }
      }
    })
  })
})
