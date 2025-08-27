import { describe, it, expect } from 'vitest'
import {
  assertType,
  createEnum,
  createTypedError,
  deepClone,
  isArray,
  isFunction,
  isNonNull,
  isNumber,
  isObject,
  isString,
  safeGet,
  safeGetNested,
  safeJsonParse,
  typedEntries,
  typedFilter,
  typedKeys,
  typedMerge,
  typedValues,
  wrapPromise,
} from '../../../src/types/utils'

describe('Type Utils', () => {
  describe('Type Guards', () => {
    it('should correctly identify non-null values', () => {
      expect(isNonNull('hello')).toBe(true)
      expect(isNonNull(0)).toBe(true)
      expect(isNonNull(false)).toBe(true)
      expect(isNonNull(null)).toBe(false)
      expect(isNonNull(undefined)).toBe(false)
    })

    it('should correctly identify strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
    })

    it('should correctly identify numbers', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-1)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(NaN)).toBe(false)
      expect(isNumber('123')).toBe(false)
    })

    it('should correctly identify objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject([])).toBe(false)
      expect(isObject(null)).toBe(false)
      expect(isObject('string')).toBe(false)
    })

    it('should correctly identify arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray({})).toBe(false)
      expect(isArray('string')).toBe(false)
    })

    it('should correctly identify functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function() {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
      expect(isFunction({})).toBe(false)
      expect(isFunction('string')).toBe(false)
    })
  })

  describe('Type Assertions', () => {
    it('should assert type correctly', () => {
      const value: unknown = 'hello'
      
      expect(() => {
        assertType(value, isString)
        // 如果到达这里，说明断言成功
      }).not.toThrow()

      expect(() => {
        assertType(123, isString)
      }).toThrow('Type assertion failed')
    })
  })

  describe('Object Utilities', () => {
    it('should get typed keys', () => {
      const obj = { a: 1, b: 'hello', c: true }
      const keys = typedKeys(obj)
      
      expect(keys).toEqual(['a', 'b', 'c'])
      expect(keys).toHaveLength(3)
    })

    it('should get typed values', () => {
      const obj = { a: 1, b: 'hello', c: true }
      const values = typedValues(obj)
      
      expect(values).toEqual([1, 'hello', true])
      expect(values).toHaveLength(3)
    })

    it('should get typed entries', () => {
      const obj = { a: 1, b: 'hello' }
      const entries = typedEntries(obj)
      
      expect(entries).toEqual([['a', 1], ['b', 'hello']])
      expect(entries).toHaveLength(2)
    })

    it('should merge objects safely', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      const merged = typedMerge(obj1, obj2)
      
      expect(merged).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should safely get object properties', () => {
      const obj = { a: 1, b: { c: 2 } }
      
      expect(safeGet(obj, 'a')).toBe(1)
      expect(safeGet(obj, 'b')).toEqual({ c: 2 })
      expect(safeGet(obj, 'nonexistent' as any)).toBeUndefined()
    })

    it('should safely get nested properties', () => {
      const obj = { a: { b: { c: 'deep value' } } }
      
      expect(safeGetNested(obj, 'a.b.c')).toBe('deep value')
      expect(safeGetNested(obj, 'a.b')).toEqual({ c: 'deep value' })
      expect(safeGetNested(obj, 'a.nonexistent.c')).toBeUndefined()
    })
  })

  describe('Array Utilities', () => {
    it('should filter arrays with type safety', () => {
      const mixed: (string | number)[] = ['hello', 123, 'world', 456]
      const strings = typedFilter(mixed, isString)
      
      expect(strings).toEqual(['hello', 'world'])
      expect(strings.every(item => typeof item === 'string')).toBe(true)
    })
  })

  describe('Enum Creation', () => {
    it('should create frozen enums', () => {
      const Colors = createEnum({
        RED: 'red',
        GREEN: 'green',
        BLUE: 'blue',
      } as const)
      
      expect(Colors.RED).toBe('red')
      expect(Colors.GREEN).toBe('green')
      expect(Colors.BLUE).toBe('blue')
      expect(Object.isFrozen(Colors)).toBe(true)
    })
  })

  describe('Deep Clone', () => {
    it('should deep clone objects', () => {
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

    it('should handle primitive values', () => {
      expect(deepClone(123)).toBe(123)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    it('should handle arrays', () => {
      const original = [1, { a: 2 }, [3, 4]]
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[1]).not.toBe(original[1])
      expect(cloned[2]).not.toBe(original[2])
    })

    it('should handle dates', () => {
      const original = new Date('2023-01-01')
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.getTime()).toBe(original.getTime())
    })
  })

  describe('JSON Utilities', () => {
    it('should safely parse valid JSON', () => {
      const validJson = '{"a": 1, "b": "hello"}'
      const parsed = safeJsonParse(validJson)
      
      expect(parsed).toEqual({ a: 1, b: 'hello' })
    })

    it('should return null for invalid JSON', () => {
      const invalidJson = '{"a": 1, "b": hello}'
      const parsed = safeJsonParse(invalidJson)
      
      expect(parsed).toBeNull()
    })

    it('should handle empty string', () => {
      const parsed = safeJsonParse('')
      expect(parsed).toBeNull()
    })
  })

  describe('Error Creation', () => {
    it('should create typed errors', () => {
      const error = createTypedError('NETWORK_ERROR', 'Connection failed')
      
      expect(error.type).toBe('NETWORK_ERROR')
      expect(error.message).toBe('Connection failed')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create typed errors with cause', () => {
      const originalError = new Error('Original error')
      const error = createTypedError('WRAPPED_ERROR', 'Wrapped error', originalError)
      
      expect(error.type).toBe('WRAPPED_ERROR')
      expect(error.message).toBe('Wrapped error')
      expect(error.cause).toBe(originalError)
    })
  })

  describe('Promise Utilities', () => {
    it('should wrap promises correctly', async () => {
      const originalPromise = Promise.resolve('test value')
      const wrapped = wrapPromise(originalPromise)
      
      expect(wrapped.promise).toBeInstanceOf(Promise)
      expect(typeof wrapped.resolve).toBe('function')
      expect(typeof wrapped.reject).toBe('function')
      
      const result = await wrapped.promise
      expect(result).toBe('test value')
    })

    it('should handle promise rejection', async () => {
      const originalPromise = Promise.reject(new Error('test error'))
      const wrapped = wrapPromise(originalPromise)
      
      await expect(wrapped.promise).rejects.toThrow('test error')
    })

    it('should allow manual resolution', async () => {
      const originalPromise = new Promise(() => {}) // 永不解决的 Promise
      const wrapped = wrapPromise(originalPromise)
      
      // 手动解决
      wrapped.resolve('manual value')
      
      const result = await wrapped.promise
      expect(result).toBe('manual value')
    })

    it('should allow manual rejection', async () => {
      const originalPromise = new Promise(() => {}) // 永不解决的 Promise
      const wrapped = wrapPromise(originalPromise)
      
      // 手动拒绝
      wrapped.reject(new Error('manual error'))
      
      await expect(wrapped.promise).rejects.toThrow('manual error')
    })
  })
})
