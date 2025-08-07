import type { RouteRecordRaw } from '../src/types'
import { describe, expect, it } from 'vitest'
import { createRouterMatcher } from '../src/matcher'

describe('matcher', () => {
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div>Home</div>' },
    },
    {
      path: '/about',
      name: 'About',
      component: { template: '<div>About</div>' },
    },
    {
      path: '/user/:id',
      name: 'User',
      component: { template: '<div>User</div>' },
    },
    {
      path: '/user/:id/profile',
      name: 'UserProfile',
      component: { template: '<div>Profile</div>' },
    },
    {
      path: '/products/:category',
      name: 'Products',
      component: { template: '<div>Products</div>' },
    },
  ]

  const matcher = createRouterMatcher(routes)

  const currentLocation = {
    path: '/',
    matched: [],
    meta: {},
    query: {},
    hash: '',
    fullPath: '/',
    href: '/',
    name: undefined,
    params: {},
    redirectedFrom: undefined,
  }

  describe('addRoute', () => {
    it('should add new route', () => {
      matcher.addRoute({
        path: '/contact',
        name: 'Contact',
        component: { template: '<div>Contact</div>' },
      })

      const resolved = matcher.resolve('/contact', currentLocation)
      expect(resolved.name).toBe('Contact')
    })

    it('should add nested route', () => {
      matcher.addRoute({
        path: '/user/:id/settings',
        name: 'UserSettings',
        component: { template: '<div>Settings</div>' },
      })

      const resolved = matcher.resolve('/user/123/settings', currentLocation)
      expect(resolved.name).toBe('UserSettings')
    })
  })

  describe('removeRoute', () => {
    it('should remove route by name', () => {
      matcher.addRoute({
        path: '/temp',
        name: 'Temp',
        component: { template: '<div>Temp</div>' },
      })

      let resolved = matcher.resolve('/temp', currentLocation)
      expect(resolved.name).toBe('Temp')

      matcher.removeRoute('Temp')

      // 检查路由是否真的被移除了
      expect(matcher.hasRoute('Temp')).toBe(false)

      resolved = matcher.resolve('/temp', currentLocation)
      expect(resolved.matched).toHaveLength(0)
    })
  })

  describe('resolve', () => {
    it('should resolve simple path', () => {
      const resolved = matcher.resolve('/about', currentLocation)
      expect(resolved.name).toBe('About')
      expect(resolved.path).toBe('/about')
      expect(resolved.params).toEqual({})
    })

    it('should resolve path with params', () => {
      const resolved = matcher.resolve('/user/123', currentLocation)
      expect(resolved.name).toBe('User')
      expect(resolved.params).toEqual({ id: '123' })
    })

    it('should resolve nested path with params', () => {
      const resolved = matcher.resolve('/user/123/profile', currentLocation)
      expect(resolved.name).toBe('UserProfile')
      expect(resolved.params).toEqual({ id: '123' })
    })

    it('should resolve path with category params', () => {
      const resolved = matcher.resolve('/products/electronics', currentLocation)
      expect(resolved.name).toBe('Products')
      expect(resolved.params).toEqual({ category: 'electronics' })
    })

    it('should resolve by name', () => {
      const resolved = matcher.resolve(
        { name: 'User', params: { id: '456' } },
        currentLocation
      )
      expect(resolved.path).toBe('/user/456')
      expect(resolved.params).toEqual({ id: '456' })
    })

    it('should resolve with query and hash', () => {
      const resolved = matcher.resolve(
        { path: '/about', query: { tab: 'info' }, hash: 'section1' },
        currentLocation
      )
      expect(resolved.query).toEqual({ tab: 'info' })
      expect(resolved.hash).toBe('section1')
      expect(resolved.fullPath).toBe('/about?tab=info#section1')
    })

    it('should return empty matched for non-existent route', () => {
      const resolved = matcher.resolve('/non-existent', currentLocation)
      expect(resolved.matched).toHaveLength(0)
      expect(resolved.name).toBeUndefined()
    })
  })

  describe('getRoutes', () => {
    it('should return all routes', () => {
      const allRoutes = matcher.getRoutes()
      expect(allRoutes.length).toBeGreaterThan(0)
      expect(allRoutes.some(route => route.name === 'Home')).toBe(true)
      expect(allRoutes.some(route => route.name === 'About')).toBe(true)
    })
  })

  describe('hasRoute', () => {
    it('should check if route exists', () => {
      expect(matcher.hasRoute('Home')).toBe(true)
      expect(matcher.hasRoute('About')).toBe(true)
      expect(matcher.hasRoute('NonExistent')).toBe(false)
    })
  })
})
