/**
 * 路径工具函数测试
 */

import { describe, expect, it } from 'vitest'
import {
  buildPath,
  extractParams,
  joinPaths,
  matchPath,
  normalizeParams,
  normalizePath,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
} from '../../src/utils'

describe('路径工具函数', () => {
  describe('normalizePath', () => {
    it('应该规范化路径', () => {
      expect(normalizePath('/path//to///file')).toBe('/path/to/file')
      expect(normalizePath('path/to/file/')).toBe('/path/to/file')
      expect(normalizePath('')).toBe('/')
      expect(normalizePath('/')).toBe('/')
    })

    it('应该处理相对路径', () => {
      expect(normalizePath('./path/to/file')).toBe('/path/to/file')
      expect(normalizePath('../path/to/file')).toBe('/path/to/file')
      expect(normalizePath('path/../to/file')).toBe('/to/file')
    })

    it('应该保留查询参数和哈希', () => {
      expect(normalizePath('/path?query=1#hash')).toBe('/path?query=1#hash')
      expect(normalizePath('/path//to?a=1&b=2#section')).toBe('/path/to?a=1&b=2#section')
    })
  })

  describe('joinPaths', () => {
    it('应该连接路径段', () => {
      expect(joinPaths('/', 'path', 'to', 'file')).toBe('/path/to/file')
      expect(joinPaths('/base', '/path', 'file')).toBe('/base/path/file')
      expect(joinPaths('base', 'path/', '/file')).toBe('/base/path/file')
    })

    it('应该处理空路径段', () => {
      expect(joinPaths('', 'path', '', 'file')).toBe('/path/file')
      expect(joinPaths()).toBe('/')
    })

    it('应该处理根路径', () => {
      expect(joinPaths('/', '/', '/')).toBe('/')
      expect(joinPaths('/', 'path')).toBe('/path')
    })
  })

  describe('parseURL', () => {
    it('应该解析 URL', () => {
      const result = parseURL('/path/to/file?query=1&name=test#section')
      expect(result).toEqual({
        path: '/path/to/file',
        query: { query: '1', name: 'test' },
        hash: '#section',
      })
    })

    it('应该处理没有查询参数和哈希的 URL', () => {
      const result = parseURL('/path/to/file')
      expect(result).toEqual({
        path: '/path/to/file',
        query: {},
        hash: '',
      })
    })

    it('应该处理根路径', () => {
      const result = parseURL('/')
      expect(result).toEqual({
        path: '/',
        query: {},
        hash: '',
      })
    })
  })

  describe('stringifyURL', () => {
    it('应该构建 URL', () => {
      const url = stringifyURL('/path', { query: '1', name: 'test' }, 'section')
      expect(url).toBe('/path?query=1&name=test#section')
    })

    it('应该处理没有查询参数和哈希的情况', () => {
      const url = stringifyURL('/path')
      expect(url).toBe('/path')
    })

    it('应该处理空查询参数', () => {
      const url = stringifyURL('/path', {}, 'section')
      expect(url).toBe('/path#section')
    })
  })

  describe('matchPath', () => {
    it('应该匹配静态路径', () => {
      const result = matchPath('/users/profile', '/users/profile')
      expect(result).toBe(true)
    })

    it('应该匹配动态路径', () => {
      const result = matchPath('/users/:id', '/users/123')
      expect(result).toBe(true)
    })

    it('应该匹配多个参数', () => {
      const result = matchPath('/users/:userId/posts/:postId', '/users/123/posts/456')
      expect(result).toBe(true)
    })

    it('应该匹配通配符', () => {
      const result = matchPath('/files/*', '/files/docs/readme.txt')
      expect(result).toBe(true)
    })

    it('应该处理不匹配的路径', () => {
      const result = matchPath('/users/:id', '/posts/123')
      expect(result).toBe(false)
    })

    it('应该处理可选参数', () => {
      const result1 = matchPath('/users/:id?', '/users/')
      expect(result1).toBe(true)

      const result2 = matchPath('/users/:id?', '/users/123')
      expect(result2).toBe(true)
    })
  })

  describe('extractParams', () => {
    it('应该提取路径参数', () => {
      const params = extractParams('/users/:id', '/users/123')
      expect(params).toEqual({ id: '123' })
    })

    it('应该提取多个参数', () => {
      const params = extractParams('/users/:userId/posts/:postId', '/users/123/posts/456')
      expect(params).toEqual({ userId: '123', postId: '456' })
    })

    it('应该处理可选参数', () => {
      const params1 = extractParams('/users/:id?', '/users')
      expect(params1).toEqual({ id: undefined })

      const params2 = extractParams('/users/:id?', '/users/123')
      expect(params2).toEqual({ id: '123' })
    })
  })

  describe('buildPath', () => {
    it('应该构建带参数的路径', () => {
      expect(buildPath('/users/:id', { id: '123' })).toBe('/users/123')
      expect(buildPath('/users/:userId/posts/:postId', {
        userId: '123',
        postId: '456',
      })).toBe('/users/123/posts/456')
    })

    it('应该处理缺失的必需参数', () => {
      expect(() => buildPath('/users/:id', {})).toThrow('Missing required parameter: id')
    })

    it('应该处理可选参数', () => {
      expect(buildPath('/users/:id?', {})).toBe('/users/')
      expect(buildPath('/users/:id?', { id: '123' })).toBe('/users/123')
    })
  })

  describe('parseQuery', () => {
    it('应该解析查询字符串', () => {
      expect(parseQuery('?name=john&age=30')).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理空查询', () => {
      expect(parseQuery('')).toEqual({})
      expect(parseQuery('?')).toEqual({})
    })

    it('应该处理数组参数', () => {
      expect(parseQuery('?tags=js&tags=vue&tags=router')).toEqual({
        tags: ['js', 'vue', 'router'],
      })
    })

    it('应该处理编码的参数', () => {
      expect(parseQuery('?name=john%20doe&message=hello%20world')).toEqual({
        name: 'john doe',
        message: 'hello world',
      })
    })

    it('应该处理布尔值', () => {
      expect(parseQuery('?active=true&disabled=false')).toEqual({
        active: 'true',
        disabled: 'false',
      })
    })
  })

  describe('stringifyQuery', () => {
    it('应该序列化查询对象', () => {
      expect(stringifyQuery({
        name: 'john',
        age: '30',
      })).toBe('?name=john&age=30')
    })

    it('应该处理空对象', () => {
      expect(stringifyQuery({})).toBe('')
    })

    it('应该处理数组值', () => {
      expect(stringifyQuery({
        tags: ['js', 'vue', 'router'],
      })).toBe('?tags=js&tags=vue&tags=router')
    })

    it('应该编码特殊字符', () => {
      expect(stringifyQuery({
        name: 'john doe',
        message: 'hello world',
      })).toBe('?name=john%20doe&message=hello%20world')
    })

    it('应该过滤空值', () => {
      expect(stringifyQuery({
        name: 'john',
        age: null,
        active: undefined,
        count: '',
      })).toBe('?name=john&count=')
    })
  })

  describe('normalizeParams', () => {
    it('应该标准化路由参数', () => {
      const params = normalizeParams({
        id: '123',
        name: 'test',
        tags: ['a', 'b'],
        active: 'true',
      })
      expect(params).toEqual({
        id: '123',
        name: 'test',
        tags: ['a', 'b'],
        active: 'true',
      })
    })

    it('应该过滤空值', () => {
      const params = normalizeParams({
        id: '123',
        name: null as any,
        active: undefined as any,
      })
      expect(params).toEqual({
        id: '123',
      })
    })

    it('应该处理数字和布尔值转换', () => {
      // 这个测试用例验证 normalizeParams 内部会正确转换类型
      const inputWithInvalidTypes: any = {
        id: 123,
        count: 456,
        active: true,
        disabled: false,
      }
      const params = normalizeParams(inputWithInvalidTypes)
      expect(params).toEqual({
        id: '123',
        count: '456',
        active: 'true',
        disabled: 'false',
      })
    })
  })
})
