/**
 * @ldesign/router 工具函数测试
 */

import { describe, expect, it } from 'vitest'
import { NavigationFailureType } from '../src'
import {
  buildPath,
  createNavigationFailure,
  extractParams,
  getRouteDepth,
  isChildRoute,
  isNavigationFailure,
  isSameRouteLocation,
  joinPaths,
  matchPath,
  mergeQuery,
  normalizeParams,
  normalizePath,
  parsePathParams,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
} from '../src/utils'

describe('utils', () => {
  describe('path Processing', () => {
    describe('normalizePath', () => {
      it('should normalize path correctly', () => {
        expect(normalizePath('/')).toBe('/')
        expect(normalizePath('/path')).toBe('/path')
        expect(normalizePath('path')).toBe('/path')
        expect(normalizePath('/path/')).toBe('/path')
        expect(normalizePath('//path//to//resource//')).toBe(
          '/path/to/resource'
        )
        expect(normalizePath('')).toBe('/')
      })
    })

    describe('joinPaths', () => {
      it('should join paths correctly', () => {
        expect(joinPaths('/', 'path')).toBe('/path')
        expect(joinPaths('/base', 'path')).toBe('/base/path')
        expect(joinPaths('/base/', '/path/')).toBe('/base/path')
        expect(joinPaths('base', 'path', 'to', 'resource')).toBe(
          '/base/path/to/resource'
        )
        expect(joinPaths('', 'path')).toBe('/path')
      })
    })

    describe('parsePathParams', () => {
      it('should parse path parameters', () => {
        expect(parsePathParams('/user/:id', '/user/123')).toEqual({ id: '123' })
        expect(
          parsePathParams('/user/:id/post/:postId', '/user/123/post/456')
        ).toEqual({
          id: '123',
          postId: '456',
        })
        expect(parsePathParams('/user/:id?', '/user/')).toEqual({
          id: '',
        })
        expect(parsePathParams('/static', '/static')).toEqual({})
      })

      it('should decode URI components', () => {
        expect(parsePathParams('/user/:name', '/user/john%20doe')).toEqual({
          name: 'john doe',
        })
      })
    })

    describe('buildPath', () => {
      it('should build path from pattern and params', () => {
        expect(buildPath('/user/:id', { id: '123' })).toBe('/user/123')
        expect(
          buildPath('/user/:id/post/:postId', { id: '123', postId: '456' })
        ).toBe('/user/123/post/456')
        expect(buildPath('/user/:id?', {})).toBe('/user/')
        expect(buildPath('/static', {})).toBe('/static')
      })

      it('should encode URI components', () => {
        expect(buildPath('/user/:name', { name: 'john doe' })).toBe(
          '/user/john%20doe'
        )
      })

      it('should throw error for missing required params', () => {
        expect(() => buildPath('/user/:id', {})).toThrow(
          'Missing required parameter: id'
        )
      })
    })
  })

  describe('query Processing', () => {
    describe('parseQuery', () => {
      it('should parse query string', () => {
        expect(parseQuery('?name=john&age=30')).toEqual({
          name: 'john',
          age: '30',
        })
        expect(parseQuery('name=john&age=30')).toEqual({
          name: 'john',
          age: '30',
        })
        expect(parseQuery('?')).toEqual({})
        expect(parseQuery('')).toEqual({})
      })

      it('should handle multiple values for same key', () => {
        expect(parseQuery('?tag=vue&tag=router')).toEqual({
          tag: ['vue', 'router'],
        })
      })

      it('should decode URI components', () => {
        expect(parseQuery('?name=john%20doe&city=new%20york')).toEqual({
          name: 'john doe',
          city: 'new york',
        })
      })

      it('should handle empty values', () => {
        expect(parseQuery('?name=&age=30')).toEqual({ name: '', age: '30' })
        expect(parseQuery('?name&age=30')).toEqual({ name: '', age: '30' })
      })
    })

    describe('stringifyQuery', () => {
      it('should stringify query object', () => {
        expect(stringifyQuery({ name: 'john', age: '30' })).toBe(
          '?name=john&age=30'
        )
        expect(stringifyQuery({})).toBe('')
        expect(stringifyQuery({ name: null, age: undefined })).toBe('')
      })

      it('should handle array values', () => {
        expect(stringifyQuery({ tag: ['vue', 'router'] })).toBe(
          '?tag=vue&tag=router'
        )
      })

      it('should encode URI components', () => {
        expect(stringifyQuery({ name: 'john doe', city: 'new york' })).toBe(
          '?name=john%20doe&city=new%20york'
        )
      })
    })

    describe('mergeQuery', () => {
      it('should merge query objects', () => {
        expect(mergeQuery({ a: '1' }, { b: '2' })).toEqual({ a: '1', b: '2' })
        expect(mergeQuery({ a: '1' }, { a: '2' })).toEqual({ a: '2' })
        expect(mergeQuery({}, { a: '1' })).toEqual({ a: '1' })
      })
    })
  })

  describe('uRL Processing', () => {
    describe('parseURL', () => {
      it('should parse URL correctly', () => {
        expect(parseURL('/path?name=john&age=30#section1')).toEqual({
          path: '/path',
          query: { name: 'john', age: '30' },
          hash: '#section1',
        })

        expect(parseURL('/path')).toEqual({
          path: '/path',
          query: {},
          hash: '',
        })

        expect(parseURL('/path?name=john')).toEqual({
          path: '/path',
          query: { name: 'john' },
          hash: '',
        })

        expect(parseURL('/path#section1')).toEqual({
          path: '/path',
          query: {},
          hash: '#section1',
        })
      })
    })

    describe('stringifyURL', () => {
      it('should stringify URL components', () => {
        expect(
          stringifyURL('/path', { name: 'john', age: '30' }, '#section1')
        ).toBe('/path?name=john&age=30#section1')

        expect(stringifyURL('/path')).toBe('/path')
        expect(stringifyURL('/path', { name: 'john' })).toBe('/path?name=john')
        expect(stringifyURL('/path', {}, '#section1')).toBe('/path#section1')
        expect(stringifyURL('/path', {}, 'section1')).toBe('/path#section1')
      })
    })
  })

  describe('route Location Processing', () => {
    describe('normalizeParams', () => {
      it('should normalize route parameters', () => {
        expect(normalizeParams({ id: 123 as any, name: 'john' })).toEqual({
          id: '123',
          name: 'john',
        })

        expect(
          normalizeParams({ id: null as any, name: undefined as any })
        ).toEqual({})

        expect(normalizeParams({ tags: ['vue', 'router'] })).toEqual({
          tags: ['vue', 'router'],
        })
      })
    })

    describe('isSameRouteLocation', () => {
      it('should compare route locations correctly', () => {
        const route1 = {
          path: '/user/123',
          query: { tab: 'info' },
          hash: '#section1',
          params: { id: '123' },
        } as any

        const route2 = {
          path: '/user/123',
          query: { tab: 'info' },
          hash: '#section1',
          params: { id: '123' },
        } as any

        const route3 = {
          path: '/user/456',
          query: { tab: 'info' },
          hash: '#section1',
          params: { id: '456' },
        } as any

        expect(isSameRouteLocation(route1, route2)).toBe(true)
        expect(isSameRouteLocation(route1, route3)).toBe(false)
      })
    })
  })

  describe('navigation Failure', () => {
    describe('createNavigationFailure', () => {
      it('should create navigation failure object', () => {
        const from = { path: '/from' } as any
        const to = { path: '/to' } as any
        const failure = createNavigationFailure(
          NavigationFailureType.aborted,
          from,
          to,
          'Custom message'
        )

        expect(failure.type).toBe(NavigationFailureType.aborted)
        expect(failure.from).toBe(from)
        expect(failure.to).toBe(to)
        expect(failure.message).toBe('Custom message')
      })
    })

    describe('isNavigationFailure', () => {
      it('should detect navigation failure', () => {
        const from = { path: '/from' } as any
        const to = { path: '/to' } as any
        const failure = createNavigationFailure(
          NavigationFailureType.aborted,
          from,
          to
        )
        const error = new Error('Regular error')

        expect(isNavigationFailure(failure)).toBe(true)
        expect(
          isNavigationFailure(failure, NavigationFailureType.aborted)
        ).toBe(true)
        expect(
          isNavigationFailure(failure, NavigationFailureType.cancelled)
        ).toBe(false)
        expect(isNavigationFailure(error)).toBe(false)
      })
    })
  })

  describe('route Matching', () => {
    describe('matchPath', () => {
      it('should match static paths', () => {
        expect(matchPath('/user', '/user')).toBe(true)
        expect(matchPath('/user', '/admin')).toBe(false)
      })

      it('should match dynamic paths', () => {
        expect(matchPath('/user/:id', '/user/123')).toBe(true)
        expect(matchPath('/user/:id', '/user/')).toBe(false)
        expect(matchPath('/user/:id?', '/user/')).toBe(true)
      })

      it('should match wildcard paths', () => {
        expect(matchPath('/files/*', '/files/docs/readme.md')).toBe(true)
        expect(matchPath('/files/*', '/files/')).toBe(true)
      })
    })

    describe('extractParams', () => {
      it('should extract parameters from path', () => {
        expect(extractParams('/user/:id', '/user/123')).toEqual({ id: '123' })
        expect(
          extractParams('/user/:id/post/:postId', '/user/123/post/456')
        ).toEqual({
          id: '123',
          postId: '456',
        })
        expect(extractParams('/files/*', '/files/docs/readme.md')).toEqual({})
      })

      it('should decode extracted parameters', () => {
        expect(extractParams('/user/:name', '/user/john%20doe')).toEqual({
          name: 'john doe',
        })
      })
    })
  })

  describe('route Utilities', () => {
    describe('getRouteDepth', () => {
      it('should calculate route depth', () => {
        expect(getRouteDepth({ path: '/' } as any)).toBe(0)
        expect(getRouteDepth({ path: '/user' } as any)).toBe(1)
        expect(getRouteDepth({ path: '/user/123' } as any)).toBe(2)
        expect(getRouteDepth({ path: '/user/123/posts/456' } as any)).toBe(4)
      })
    })

    describe('isChildRoute', () => {
      it('should detect child routes', () => {
        expect(isChildRoute('/user', '/user/123')).toBe(true)
        expect(isChildRoute('/user', '/user')).toBe(true)
        expect(isChildRoute('/user', '/admin')).toBe(false)
        expect(isChildRoute('/user/123', '/user')).toBe(false)
      })
    })
  })
})
