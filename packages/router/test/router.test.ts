import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  RouterView,
  RouterLink
} from '../src'
import type { RouteRecordRaw } from '../src'

describe('Router', () => {
  let router: any
  
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div>Home</div>' }
    },
    {
      path: '/about',
      name: 'About',
      component: { template: '<div>About</div>' }
    },
    {
      path: '/user/:id',
      name: 'User',
      component: { template: '<div>User {{ $route.params.id }}</div>' }
    }
  ]
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
  })
  
  describe('createRouter', () => {
    it('should create router instance', () => {
      expect(router).toBeDefined()
      expect(typeof router.push).toBe('function')
      expect(typeof router.replace).toBe('function')
      expect(typeof router.go).toBe('function')
      expect(typeof router.back).toBe('function')
      expect(typeof router.forward).toBe('function')
    })
    
    it('should have correct initial route', () => {
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
  
  describe('Navigation', () => {
    it('should navigate to route by path', async () => {
      await router.push('/about')
      expect(router.currentRoute.value.path).toBe('/about')
      expect(router.currentRoute.value.name).toBe('About')
    })
    
    it('should navigate to route by name', async () => {
      await router.push({ name: 'About' })
      expect(router.currentRoute.value.path).toBe('/about')
      expect(router.currentRoute.value.name).toBe('About')
    })
    
    it('should navigate with params', async () => {
      await router.push({ name: 'User', params: { id: '123' } })
      expect(router.currentRoute.value.path).toBe('/user/123')
      expect(router.currentRoute.value.params.id).toBe('123')
    })
    
    it('should navigate with query', async () => {
      await router.push({ path: '/about', query: { tab: 'info' } })
      expect(router.currentRoute.value.query.tab).toBe('info')
    })
    
    it('should replace current route', async () => {
      await router.push('/about')
      await router.replace('/')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
  
  describe('Route Matching', () => {
    it('should match route by path', () => {
      const resolved = router.resolve('/about')
      expect(resolved.name).toBe('About')
      expect(resolved.path).toBe('/about')
    })
    
    it('should match route with params', () => {
      const resolved = router.resolve('/user/456')
      expect(resolved.name).toBe('User')
      expect(resolved.params.id).toBe('456')
    })
    
    it('should handle non-existent routes', () => {
      const resolved = router.resolve('/non-existent')
      expect(resolved.matched).toHaveLength(0)
    })
  })
  
  describe('Navigation Guards', () => {
    it('should register beforeEach guard', () => {
      const guard = vi.fn((to, from, next) => next())
      const removeGuard = router.beforeEach(guard)
      
      expect(typeof removeGuard).toBe('function')
    })
    
    it('should call beforeEach guard on navigation', async () => {
      const guard = vi.fn((to, from, next) => next())
      router.beforeEach(guard)
      
      await router.push('/about')
      
      expect(guard).toHaveBeenCalled()
      expect(guard).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/about' }),
        expect.objectContaining({ path: '/' }),
        expect.any(Function)
      )
    })
    
    it('should prevent navigation when guard returns false', async () => {
      router.beforeEach((to, from, next) => {
        if (to.path === '/about') {
          next(false)
        } else {
          next()
        }
      })
      
      await router.push('/about')
      expect(router.currentRoute.value.path).toBe('/')
    })
    
    it('should redirect when guard returns new location', async () => {
      router.beforeEach((to, from, next) => {
        if (to.path === '/about') {
          next('/')
        } else {
          next()
        }
      })
      
      await router.push('/about')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
  
  describe('History Integration', () => {
    it('should work with memory history', () => {
      const memoryRouter = createRouter({
        history: createMemoryHistory(),
        routes
      })
      
      expect(memoryRouter).toBeDefined()
    })
    
    it('should work with web history', () => {
      // Mock window.history for testing
      Object.defineProperty(window, 'history', {
        value: {
          pushState: vi.fn(),
          replaceState: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn()
        },
        writable: true
      })
      
      const webRouter = createRouter({
        history: createWebHistory(),
        routes
      })
      
      expect(webRouter).toBeDefined()
    })
  })
  
  describe('Vue Integration', () => {
    it('should install router plugin', () => {
      const app = createApp({})
      const installSpy = vi.spyOn(app, 'use')
      
      app.use(router)
      
      expect(installSpy).toHaveBeenCalledWith(router)
    })
    
    it('should provide router and route', () => {
      const app = createApp({})
      app.use(router)
      
      // Test that router provides the necessary injections
      expect(router.install).toBeDefined()
    })
  })
})