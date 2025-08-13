/**
 * @ldesign/router 路由器核心测试
 */

import type { RouteRecordRaw } from '../src'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from '../src'

describe('router Core', () => {
  let router: any
  let history: any

  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: () => Promise.resolve({ name: 'Home' }),
    },
    {
      path: '/about',
      name: 'about',
      component: () => Promise.resolve({ name: 'About' }),
      meta: { title: 'About Page' },
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => Promise.resolve({ name: 'User' }),
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => Promise.resolve({ name: 'Posts' }),
      children: [
        {
          path: ':id',
          name: 'post',
          component: () => Promise.resolve({ name: 'Post' }),
        },
      ],
    },
  ]

  beforeEach(() => {
    history = createMemoryHistory()
    router = createRouter({
      history,
      routes,
    })
  })

  describe('router Creation', () => {
    it('should create router instance', () => {
      expect(router).toBeDefined()
      expect(router.currentRoute).toBeDefined()
      expect(router.options).toBeDefined()
    })

    it('should have correct initial route', () => {
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('should register routes correctly', () => {
      const allRoutes = router.getRoutes()
      expect(allRoutes).toHaveLength(4)
      expect(allRoutes.some((r: any) => r.name === 'home')).toBe(true)
      expect(allRoutes.some((r: any) => r.name === 'about')).toBe(true)
    })
  })

  describe('route Management', () => {
    it('should add route dynamically', () => {
      const removeRoute = router.addRoute({
        path: '/dynamic',
        name: 'dynamic',
        component: () => Promise.resolve({ name: 'Dynamic' }),
      })

      expect(router.hasRoute('dynamic')).toBe(true)

      removeRoute()
      expect(router.hasRoute('dynamic')).toBe(false)
    })

    it('should add child route', () => {
      router.addRoute('posts', {
        path: 'new',
        name: 'newPost',
        component: () => Promise.resolve({ name: 'NewPost' }),
      })

      expect(router.hasRoute('newPost')).toBe(true)
    })

    it('should remove route by name', () => {
      router.removeRoute('about')
      expect(router.hasRoute('about')).toBe(false)
    })
  })

  describe('route Resolution', () => {
    it('should resolve route by path', () => {
      const resolved = router.resolve('/about')
      expect(resolved.path).toBe('/about')
      expect(resolved.name).toBe('about')
      expect(resolved.meta.title).toBe('About Page')
    })

    it('should resolve route by name', () => {
      const resolved = router.resolve({ name: 'user', params: { id: '123' } })
      expect(resolved.path).toBe('/user/123')
      expect(resolved.params.id).toBe('123')
    })

    it('should resolve nested route', () => {
      const resolved = router.resolve('/posts/456')
      expect(resolved.path).toBe('/posts/456')
      expect(resolved.params.id).toBe('456')
    })

    it('should throw error for invalid route', () => {
      expect(() => router.resolve('/nonexistent')).toThrow()
    })
  })

  describe('navigation', () => {
    it('should navigate to route by path', async () => {
      await router.push('/about')
      expect(router.currentRoute.value.path).toBe('/about')
      expect(router.currentRoute.value.name).toBe('about')
    })

    it('should navigate to route by name', async () => {
      await router.push({ name: 'user', params: { id: '123' } })
      expect(router.currentRoute.value.path).toBe('/user/123')
      expect(router.currentRoute.value.params.id).toBe('123')
    })

    it('should replace current route', async () => {
      await router.push('/about')
      await router.replace('/user/456')
      expect(router.currentRoute.value.path).toBe('/user/456')
    })

    it('should handle navigation with query and hash', async () => {
      await router.push({
        path: '/about',
        query: { tab: 'info' },
        hash: '#section1',
      })

      expect(router.currentRoute.value.query.tab).toBe('info')
      expect(router.currentRoute.value.hash).toBe('#section1')
    })
  })

  describe('navigation Guards', () => {
    it('should execute beforeEach guard', async () => {
      const guard = vi.fn((to, from, next) => next())
      const removeGuard = router.beforeEach(guard)

      await router.push('/about')

      expect(guard).toHaveBeenCalledTimes(1)
      expect(guard).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/about' }),
        expect.objectContaining({ path: '/' }),
        expect.any(Function)
      )

      removeGuard()
    })

    it('should execute beforeResolve guard', async () => {
      const guard = vi.fn((to, from, next) => next())
      const removeGuard = router.beforeResolve(guard)

      await router.push('/about')

      expect(guard).toHaveBeenCalledTimes(1)
      removeGuard()
    })

    it('should execute afterEach hook', async () => {
      const hook = vi.fn()
      const removeHook = router.afterEach(hook)

      await router.push('/about')

      expect(hook).toHaveBeenCalledTimes(1)
      expect(hook).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/about' }),
        expect.objectContaining({ path: '/' })
      )

      removeHook()
    })

    it('should cancel navigation when guard returns false', async () => {
      router.beforeEach((to, from, next) => next(false))

      await router.push('/about')

      // Should stay on current route
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('should redirect when guard returns route location', async () => {
      router.beforeEach((to, from, next) => {
        if (to.path === '/about') {
          next('/user/123')
        } else {
          next()
        }
      })

      await router.push('/about')

      expect(router.currentRoute.value.path).toBe('/user/123')
    })
  })

  describe('error Handling', () => {
    it('should handle navigation errors', async () => {
      const errorHandler = vi.fn()
      const removeHandler = router.onError(errorHandler)

      router.beforeEach(() => {
        throw new Error('Navigation error')
      })

      await router.push('/about')

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
      removeHandler()
    })
  })

  describe('history Integration', () => {
    it('should update history on navigation', async () => {
      await router.push('/about')
      expect(history.location.pathname).toBe('/about')
    })

    it('should handle browser back/forward', async () => {
      await router.push('/about')
      await router.push('/user/123')

      router.back()
      expect(router.currentRoute.value.path).toBe('/about')

      router.forward()
      expect(router.currentRoute.value.path).toBe('/user/123')
    })

    it('should handle go navigation', async () => {
      await router.push('/about')
      await router.push('/user/123')
      await router.push('/posts')

      router.go(-2)
      expect(router.currentRoute.value.path).toBe('/about')
    })
  })

  describe('ready State', () => {
    it('should resolve isReady promise', async () => {
      await expect(router.isReady()).resolves.toBeUndefined()
    })
  })
})
