import type { RequestConfig } from '@/types'
import { describe, expect, it } from 'vitest'
import {
  buildQueryString,
  buildURL,
  combineURLs,
  createHttpError,
  deepClone,
  isAbsoluteURL,
  isArrayBuffer,
  isBlob,
  isFormData,
  isURLSearchParams,
  mergeConfig,
} from '@/utils'

describe('utils', () => {
  describe('mergeConfig', () => {
    it('should merge configs correctly', () => {
      const defaultConfig: RequestConfig = {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        params: {
          version: 'v1',
        },
      }

      const customConfig: RequestConfig = {
        timeout: 10000,
        headers: {
          Authorization: 'Bearer token',
        },
        params: {
          page: 1,
        },
        data: { test: true },
      }

      const merged = mergeConfig(defaultConfig, customConfig)

      expect(merged).toEqual({
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer token',
        },
        params: {
          version: 'v1',
          page: 1,
        },
        data: { test: true },
      })
    })

    it('should handle undefined custom config', () => {
      const defaultConfig: RequestConfig = {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }

      const merged = mergeConfig(defaultConfig)

      expect(merged).toEqual(defaultConfig)
    })
  })

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const params = {
        page: 1,
        limit: 10,
        search: 'test query',
        active: true,
      }

      const queryString = buildQueryString(params)

      expect(queryString).toBe('page=1&limit=10&search=test+query&active=true')
    })

    it('should handle array values', () => {
      const params = {
        tags: ['javascript', 'typescript'],
        ids: [1, 2, 3],
      }

      const queryString = buildQueryString(params)

      expect(queryString).toBe('tags=javascript&tags=typescript&ids=1&ids=2&ids=3')
    })

    it('should skip null and undefined values', () => {
      const params = {
        page: 1,
        search: null,
        filter: undefined,
        active: true,
      }

      const queryString = buildQueryString(params)

      expect(queryString).toBe('page=1&active=true')
    })

    it('should handle empty object', () => {
      const queryString = buildQueryString({})
      expect(queryString).toBe('')
    })
  })

  describe('buildURL', () => {
    it('should build URL with base URL', () => {
      const url = buildURL('/users', 'https://api.example.com')
      expect(url).toBe('https://api.example.com/users')
    })

    it('should build URL with params', () => {
      const url = buildURL('/users', undefined, { page: 1, limit: 10 })
      expect(url).toBe('/users?page=1&limit=10')
    })

    it('should build URL with base URL and params', () => {
      const url = buildURL('/users', 'https://api.example.com', { page: 1 })
      expect(url).toBe('https://api.example.com/users?page=1')
    })

    it('should handle absolute URLs', () => {
      const url = buildURL('https://other.example.com/users', 'https://api.example.com')
      expect(url).toBe('https://other.example.com/users')
    })

    it('should append params to existing query string', () => {
      const url = buildURL('/users?sort=name', undefined, { page: 1 })
      expect(url).toBe('/users?sort=name&page=1')
    })
  })

  describe('isAbsoluteURL', () => {
    it('should detect absolute URLs', () => {
      expect(isAbsoluteURL('https://example.com')).toBe(true)
      expect(isAbsoluteURL('http://example.com')).toBe(true)
      expect(isAbsoluteURL('ftp://example.com')).toBe(true)
      expect(isAbsoluteURL('//example.com')).toBe(true)
    })

    it('should detect relative URLs', () => {
      expect(isAbsoluteURL('/users')).toBe(false)
      expect(isAbsoluteURL('users')).toBe(false)
      expect(isAbsoluteURL('./users')).toBe(false)
      expect(isAbsoluteURL('../users')).toBe(false)
    })
  })

  describe('combineURLs', () => {
    it('should combine URLs correctly', () => {
      expect(combineURLs('https://api.example.com', '/users')).toBe('https://api.example.com/users')
      expect(combineURLs('https://api.example.com/', '/users')).toBe('https://api.example.com/users')
      expect(combineURLs('https://api.example.com', 'users')).toBe('https://api.example.com/users')
      expect(combineURLs('https://api.example.com/', 'users')).toBe('https://api.example.com/users')
    })

    it('should handle empty relative URL', () => {
      expect(combineURLs('https://api.example.com', '')).toBe('https://api.example.com')
    })
  })

  describe('createHttpError', () => {
    it('should create HTTP error with basic info', () => {
      const error = createHttpError('Test error')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.isNetworkError).toBe(false)
      expect(error.isTimeoutError).toBe(false)
      expect(error.isCancelError).toBe(false)
    })

    it('should create HTTP error with config and code', () => {
      const config: RequestConfig = { url: '/test', method: 'GET' }
      const error = createHttpError('Test error', config, 'TEST_ERROR')

      expect(error.config).toBe(config)
      expect(error.code).toBe('TEST_ERROR')
    })

    it('should detect timeout errors', () => {
      const error = createHttpError('Request timeout', undefined, 'ECONNABORTED')
      expect(error.isTimeoutError).toBe(true)
    })

    it('should detect network errors', () => {
      const error = createHttpError('Network Error')
      expect(error.isNetworkError).toBe(true)
    })

    it('should detect cancel errors', () => {
      const error = createHttpError('Request canceled')
      expect(error.isCancelError).toBe(true)
    })
  })

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('test')).toBe('test')
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    it('should clone dates', () => {
      const date = new Date('2023-01-01')
      const cloned = deepClone(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('should clone arrays', () => {
      const array = [1, 2, { a: 3 }]
      const cloned = deepClone(array)

      expect(cloned).toEqual(array)
      expect(cloned).not.toBe(array)
      expect(cloned[2]).not.toBe(array[2])
    })

    it('should clone objects', () => {
      const obj = {
        a: 1,
        b: 'test',
        c: {
          d: 2,
          e: [1, 2, 3],
        },
      }
      const cloned = deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.c).not.toBe(obj.c)
      expect(cloned.c.e).not.toBe(obj.c.e)
    })
  })

  describe('type checkers', () => {
    it('should detect FormData', () => {
      const formData = new FormData()
      expect(isFormData(formData)).toBe(true)
      expect(isFormData({})).toBe(false)
      expect(isFormData('test')).toBe(false)
    })

    it('should detect Blob', () => {
      const blob = new Blob(['test'])
      expect(isBlob(blob)).toBe(true)
      expect(isBlob({})).toBe(false)
      expect(isBlob('test')).toBe(false)
    })

    it('should detect ArrayBuffer', () => {
      const buffer = new ArrayBuffer(8)
      expect(isArrayBuffer(buffer)).toBe(true)
      expect(isArrayBuffer({})).toBe(false)
      expect(isArrayBuffer('test')).toBe(false)
    })

    it('should detect URLSearchParams', () => {
      const params = new URLSearchParams()
      expect(isURLSearchParams(params)).toBe(true)
      expect(isURLSearchParams({})).toBe(false)
      expect(isURLSearchParams('test')).toBe(false)
    })
  })
})
