/**
 * UrlUtils 测试用例
 */

import { describe, expect, it } from 'vitest'
import { UrlUtils } from '../../src/utils/url-utils'

describe('UrlUtils', () => {
  describe('buildUrl', () => {
    it('应该构建带查询参数的URL', () => {
      const result = UrlUtils.buildUrl('https://api.example.com/users', {
        page: 1,
        limit: 10,
        search: 'john'
      })
      
      expect(result).toBe('https://api.example.com/users?page=1&limit=10&search=john')
    })

    it('应该处理数组参数', () => {
      const result = UrlUtils.buildUrl('https://api.example.com/search', {
        tags: ['javascript', 'typescript'],
        category: 'tech'
      })
      
      expect(result).toBe('https://api.example.com/search?tags=javascript&tags=typescript&category=tech')
    })

    it('应该忽略null和undefined值', () => {
      const result = UrlUtils.buildUrl('https://api.example.com/users', {
        page: 1,
        search: null,
        filter: undefined,
        limit: 10
      })
      
      expect(result).toBe('https://api.example.com/users?page=1&limit=10')
    })

    it('应该处理空参数对象', () => {
      const result = UrlUtils.buildUrl('https://api.example.com/users', {})
      expect(result).toBe('https://api.example.com/users')
    })

    it('应该处理已有查询参数的URL', () => {
      const result = UrlUtils.buildUrl('https://api.example.com/users?existing=true', {
        page: 1
      })
      
      expect(result).toBe('https://api.example.com/users?existing=true&page=1')
    })
  })

  describe('parseQuery', () => {
    it('应该解析查询字符串', () => {
      const result = UrlUtils.parseQuery('?page=1&limit=10&search=john')
      
      expect(result).toEqual({
        page: '1',
        limit: '10',
        search: 'john'
      })
    })

    it('应该处理不带?的查询字符串', () => {
      const result = UrlUtils.parseQuery('page=1&limit=10')
      
      expect(result).toEqual({
        page: '1',
        limit: '10'
      })
    })

    it('应该处理重复的参数键', () => {
      const result = UrlUtils.parseQuery('tags=js&tags=ts&tags=react')
      
      expect(result).toEqual({
        tags: ['js', 'ts', 'react']
      })
    })

    it('应该处理URL编码的值', () => {
      const result = UrlUtils.parseQuery('name=John%20Doe&message=Hello%20World!')
      
      expect(result).toEqual({
        name: 'John Doe',
        message: 'Hello World!'
      })
    })

    it('应该处理空查询字符串', () => {
      expect(UrlUtils.parseQuery('')).toEqual({})
      expect(UrlUtils.parseQuery('?')).toEqual({})
    })
  })

  describe('stringifyQuery', () => {
    it('应该将对象转换为查询字符串', () => {
      const result = UrlUtils.stringifyQuery({
        page: 1,
        limit: 10,
        search: 'john'
      })
      
      expect(result).toBe('page=1&limit=10&search=john')
    })

    it('应该处理数组值', () => {
      const result = UrlUtils.stringifyQuery({
        tags: ['js', 'ts'],
        category: 'tech'
      })
      
      expect(result).toBe('tags=js&tags=ts&category=tech')
    })

    it('应该忽略null和undefined值', () => {
      const result = UrlUtils.stringifyQuery({
        page: 1,
        search: null,
        filter: undefined
      })
      
      expect(result).toBe('page=1')
    })

    it('应该处理空对象', () => {
      const result = UrlUtils.stringifyQuery({})
      expect(result).toBe('')
    })
  })

  describe('normalize', () => {
    it('应该规范化URL协议和主机名', () => {
      const result = UrlUtils.normalize('HTTP://EXAMPLE.COM/Path')
      expect(result).toBe('http://example.com/Path')
    })

    it('应该移除默认端口', () => {
      expect(UrlUtils.normalize('http://example.com:80/path')).toBe('http://example.com/path')
      expect(UrlUtils.normalize('https://example.com:443/path')).toBe('https://example.com/path')
    })

    it('应该保留非默认端口', () => {
      const result = UrlUtils.normalize('http://example.com:8080/path')
      expect(result).toBe('http://example.com:8080/path')
    })

    it('应该规范化路径中的多余斜杠', () => {
      const result = UrlUtils.normalize('https://example.com//path///to//resource')
      expect(result).toBe('https://example.com/path/to/resource')
    })

    it('应该处理无效URL', () => {
      const invalidUrl = 'not-a-url'
      const result = UrlUtils.normalize(invalidUrl)
      expect(result).toBe(invalidUrl)
    })
  })

  describe('isAbsolute', () => {
    it('应该识别绝对URL', () => {
      expect(UrlUtils.isAbsolute('https://example.com')).toBe(true)
      expect(UrlUtils.isAbsolute('http://example.com/path')).toBe(true)
      expect(UrlUtils.isAbsolute('ftp://example.com')).toBe(true)
    })

    it('应该识别相对URL', () => {
      expect(UrlUtils.isAbsolute('/path/to/resource')).toBe(false)
      expect(UrlUtils.isAbsolute('path/to/resource')).toBe(false)
      expect(UrlUtils.isAbsolute('../path')).toBe(false)
      expect(UrlUtils.isAbsolute('./path')).toBe(false)
    })
  })

  describe('join', () => {
    it('应该连接URL路径片段', () => {
      const result = UrlUtils.join('https://example.com', 'api', 'v1', 'users')
      expect(result).toBe('https://example.com/api/v1/users')
    })

    it('应该处理带斜杠的路径片段', () => {
      const result = UrlUtils.join('https://example.com/', '/api/', '/v1/', '/users/')
      expect(result).toBe('https://example.com/api/v1/users/')
    })

    it('应该连接相对路径', () => {
      const result = UrlUtils.join('/api', 'v1', 'users')
      expect(result).toBe('/api/v1/users')
    })

    it('应该处理空字符串', () => {
      const result = UrlUtils.join('https://example.com', '', 'api', '', 'users')
      expect(result).toBe('https://example.com/api/users')
    })

    it('应该处理空参数', () => {
      expect(UrlUtils.join()).toBe('')
    })
  })

  describe('getDomain', () => {
    it('应该提取域名', () => {
      expect(UrlUtils.getDomain('https://www.example.com/path')).toBe('example.com')
      expect(UrlUtils.getDomain('https://api.sub.example.com')).toBe('example.com')
      expect(UrlUtils.getDomain('http://example.com')).toBe('example.com')
    })

    it('应该处理顶级域名', () => {
      expect(UrlUtils.getDomain('https://example.co.uk')).toBe('co.uk')
      expect(UrlUtils.getDomain('https://sub.example.co.uk')).toBe('co.uk')
    })

    it('应该处理IP地址', () => {
      expect(UrlUtils.getDomain('http://192.168.1.1')).toBe('192.168.1.1')
    })

    it('应该处理无效URL', () => {
      expect(UrlUtils.getDomain('not-a-url')).toBe('')
    })
  })

  describe('getSubdomain', () => {
    it('应该提取子域名', () => {
      expect(UrlUtils.getSubdomain('https://www.example.com')).toBe('www')
      expect(UrlUtils.getSubdomain('https://api.v1.example.com')).toBe('api.v1')
    })

    it('应该处理没有子域名的情况', () => {
      expect(UrlUtils.getSubdomain('https://example.com')).toBe('')
    })

    it('应该处理无效URL', () => {
      expect(UrlUtils.getSubdomain('not-a-url')).toBe('')
    })
  })

  describe('isSameDomain', () => {
    it('应该识别相同域名', () => {
      expect(UrlUtils.isSameDomain(
        'https://www.example.com/path1',
        'https://api.example.com/path2'
      )).toBe(true)
      
      expect(UrlUtils.isSameDomain(
        'http://example.com',
        'https://example.com'
      )).toBe(true)
    })

    it('应该识别不同域名', () => {
      expect(UrlUtils.isSameDomain(
        'https://example.com',
        'https://other.com'
      )).toBe(false)
      
      expect(UrlUtils.isSameDomain(
        'https://example.com',
        'https://example.org'
      )).toBe(false)
    })

    it('应该处理无效URL', () => {
      expect(UrlUtils.isSameDomain('not-a-url', 'https://example.com')).toBe(false)
      expect(UrlUtils.isSameDomain('https://example.com', 'not-a-url')).toBe(false)
    })
  })
})

