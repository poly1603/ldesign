import { describe, expect, it, vi } from 'vitest'
import { NavigationFailureType } from '../src/core/constants'
import {
  assert,
  createNavigationFailure,
  debounce,
  deepClone,
  isNavigationFailure,
  isSameRouteLocation,
  merge,
  normalizeParams,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
  throttle,
  warn,
} from '../src/utils'

describe('utils', () => {
  describe('parseURL', () => {
    it('should parse simple path', () => {
      const result = parseURL('/home')
      expect(result).toEqual({
        path: '/home',
        query: {},
        hash: '',
      })
    })

    it('should parse path with query', () => {
      const result = parseURL('/home?name=john&age=25')
      expect(result).toEqual({
        path: '/home',
        query: { name: 'john', age: '25' },
        hash: '',
      })
    })

    it('should parse path with hash', () => {
      const result = parseURL('/home#section1')
      expect(result).toEqual({
        path: '/home',
        query: {},
        hash: 'section1',
      })
    })

    it('should parse path with query and hash', () => {
      const result = parseURL('/home?name=john#section1')
      expect(result).toEqual({
        path: '/home',
        query: { name: 'john' },
        hash: 'section1',
      })
    })
  })

  describe('stringifyURL', () => {
    it('should stringify simple path', () => {
      const result = stringifyURL({
        path: '/home',
        query: {},
        hash: '',
      })
      expect(result).toBe('/home')
    })

    it('should stringify path with query', () => {
      const result = stringifyURL({
        path: '/home',
        query: { name: 'john', age: '25' },
        hash: '',
      })
      expect(result).toBe('/home?name=john&age=25')
    })

    it('should stringify path with hash', () => {
      const result = stringifyURL({
        path: '/home',
        query: {},
        hash: 'section1',
      })
      expect(result).toBe('/home#section1')
    })

    it('should stringify path with query and hash', () => {
      const result = stringifyURL({
        path: '/home',
        query: { name: 'john' },
        hash: 'section1',
      })
      expect(result).toBe('/home?name=john#section1')
    })
  })

  describe('parseQuery', () => {
    it('should parse empty query', () => {
      expect(parseQuery('')).toEqual({})
      expect(parseQuery('?')).toEqual({})
    })

    it('should parse simple query', () => {
      const result = parseQuery('name=john&age=25')
      expect(result).toEqual({ name: 'john', age: '25' })
    })

    it('should parse query with leading question mark', () => {
      const result = parseQuery('?name=john&age=25')
      expect(result).toEqual({ name: 'john', age: '25' })
    })

    it('should parse query with array values', () => {
      const result = parseQuery('tags=vue&tags=router&tags=typescript')
      expect(result).toEqual({ tags: ['vue', 'router', 'typescript'] })
    })

    it('should parse query with null values', () => {
      const result = parseQuery('flag&name=john')
      expect(result).toEqual({ flag: null, name: 'john' })
    })

    it('should handle URL encoding', () => {
      const result = parseQuery('name=john%20doe&message=hello%20world')
      expect(result).toEqual({ name: 'john doe', message: 'hello world' })
    })
  })

  describe('stringifyQuery', () => {
    it('should stringify empty query', () => {
      expect(stringifyQuery({})).toBe('')
    })

    it('should stringify simple query', () => {
      const result = stringifyQuery({ name: 'john', age: '25' })
      expect(result).toBe('name=john&age=25')
    })

    it('should stringify query with array values', () => {
      const result = stringifyQuery({ tags: ['vue', 'router', 'typescript'] })
      expect(result).toBe('tags=vue&tags=router&tags=typescript')
    })

    it('should stringify query with null values', () => {
      const result = stringifyQuery({ flag: null, name: 'john' })
      expect(result).toBe('flag&name=john')
    })

    it('should handle URL encoding', () => {
      const result = stringifyQuery({
        name: 'john doe',
        message: 'hello world',
      })
      expect(result).toBe('name=john+doe&message=hello+world')
    })
  })

  describe('normalizeParams', () => {
    it('should normalize string params', () => {
      const result = normalizeParams({ id: '123', name: 'john' })
      expect(result).toEqual({ id: '123', name: 'john' })
    })

    it('should normalize number params', () => {
      const result = normalizeParams({ id: 123, age: 25 })
      expect(result).toEqual({ id: '123', age: '25' })
    })

    it('should normalize array params', () => {
      const result = normalizeParams({ tags: ['vue', 'router'] })
      expect(result).toEqual({ tags: ['vue', 'router'] })
    })

    it('should filter out null/undefined params', () => {
      const result = normalizeParams({ id: '123', name: null, age: undefined })
      expect(result).toEqual({ id: '123' })
    })
  })

  describe('isNavigationFailure', () => {
    it('should identify navigation failure', () => {
      const failure = createNavigationFailure(
        NavigationFailureType.aborted,
        { path: '/' },
        { path: '/about' }
      )

      expect(isNavigationFailure(failure)).toBe(true)
      expect(isNavigationFailure(failure, NavigationFailureType.aborted)).toBe(
        true
      )
      expect(
        isNavigationFailure(failure, NavigationFailureType.cancelled)
      ).toBe(false)
    })

    it('should not identify regular errors as navigation failure', () => {
      const error = new Error('Regular error')
      expect(isNavigationFailure(error)).toBe(false)
    })
  })

  describe('createNavigationFailure', () => {
    it('should create navigation failure with correct properties', () => {
      const from = { path: '/' }
      const to = { path: '/about' }
      const failure = createNavigationFailure(
        NavigationFailureType.aborted,
        from,
        to
      )

      expect(failure).toBeInstanceOf(Error)
      expect(failure.type).toBe(NavigationFailureType.aborted)
      expect(failure.from).toBe(from)
      expect(failure.to).toBe(to)
      expect(failure.message).toContain('Navigation failed')
    })
  })

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    it('should clone arrays', () => {
      const original = [1, 2, { a: 3 }]
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[2]).not.toBe(original[2])
    })

    it('should clone objects', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })

    it('should clone dates', () => {
      const original = new Date('2023-01-01')
      const cloned = deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned).toBeInstanceOf(Date)
    })
  })

  describe('merge', () => {
    it('should merge objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = merge(target, source)

      expect(result).toBe(target)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should merge multiple sources', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }
      const result = merge(target, source1, source2)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should skip undefined values', () => {
      const target = { a: 1, b: 2 }
      const source = { b: undefined, c: 3 }
      const result = merge(target, source)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('isSameRouteLocation', () => {
    it('should return true for identical routes', () => {
      const route1 = { path: '/home', query: { a: '1' }, hash: 'section' }
      const route2 = { path: '/home', query: { a: '1' }, hash: 'section' }

      expect(isSameRouteLocation(route1, route2)).toBe(true)
    })

    it('should return false for different paths', () => {
      const route1 = { path: '/home', query: {}, hash: '' }
      const route2 = { path: '/about', query: {}, hash: '' }

      expect(isSameRouteLocation(route1, route2)).toBe(false)
    })

    it('should return false for different queries', () => {
      const route1 = { path: '/home', query: { a: '1' }, hash: '' }
      const route2 = { path: '/home', query: { a: '2' }, hash: '' }

      expect(isSameRouteLocation(route1, route2)).toBe(false)
    })

    it('should return false for different hashes', () => {
      const route1 = { path: '/home', query: {}, hash: 'section1' }
      const route2 = { path: '/home', query: {}, hash: 'section2' }

      expect(isSameRouteLocation(route1, route2)).toBe(false)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
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
    it('should throttle function calls', async () => {
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

  describe('warn', () => {
    it('should warn in development', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      warn('Test warning')
      expect(consoleSpy).toHaveBeenCalledWith(
        '[LDesign Router warn]: Test warning'
      )

      process.env.NODE_ENV = originalEnv
      consoleSpy.mockRestore()
    })
  })

  describe('assert', () => {
    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'Should not throw')).not.toThrow()
    })

    it('should throw when condition is false', () => {
      expect(() => assert(false, 'Should throw')).toThrow(
        '[LDesign Router error]: Should throw'
      )
    })
  })
})
