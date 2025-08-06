import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createMemoryHistory, createRouter, useRoute, useRouter, useParams, useQuery, useHash, useMeta, useMatched } from '../src'
import type { RouteRecordRaw } from '../src/types'

describe('composables', () => {
  let router: any
  let app: any

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
  ]

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    app = createApp({})
    app.use(router)
  })

  describe('useRouter', () => {
    it('should return router instance', () => {
      // 模拟在组件内部调用
      app.runWithContext(() => {
        const routerInstance = useRouter()
        expect(routerInstance).toBe(router)
        expect(typeof routerInstance.push).toBe('function')
        expect(typeof routerInstance.replace).toBe('function')
        expect(typeof routerInstance.go).toBe('function')
      })
    })

    it('should throw error when called outside of setup', () => {
      expect(() => {
        useRouter()
      }).toThrow('useRouter() must be called within a router context')
    })
  })

  describe('useRoute', () => {
    it('should return current route', async () => {
      await router.push('/about')

      app.runWithContext(() => {
        const route = useRoute()
        expect(route.value.path).toBe('/about')
        expect(route.value.name).toBe('About')
      })
    })

    it('should be reactive to route changes', async () => {
      app.runWithContext(() => {
        const route = useRoute()

        // 初始路由
        expect(route.value.path).toBe('/')

        // 导航到新路由
        router.push('/about').then(() => {
          expect(route.value.path).toBe('/about')
        })
      })
    })

    it('should include route params', async () => {
      await router.push('/user/123')

      app.runWithContext(() => {
        const route = useRoute()
        expect(route.value.params.id).toBe('123')
      })
    })

    it('should include route query', async () => {
      await router.push('/about?tab=info&page=1')

      app.runWithContext(() => {
        const route = useRoute()
        expect(route.value.query.tab).toBe('info')
        expect(route.value.query.page).toBe('1')
      })
    })

    it('should include route hash', async () => {
      await router.push('/about#section1')

      app.runWithContext(() => {
        const route = useRoute()
        expect(route.value.hash).toBe('section1')
      })
    })

    it('should throw error when called outside of setup', () => {
      expect(() => {
        useRoute()
      }).toThrow('useRoute() must be called within a router context')
    })
  })

  describe('useParams', () => {
    it('should return route params', async () => {
      await router.push('/user/123')

      app.runWithContext(() => {
        const params = useParams()
        expect(params.value).toEqual({ id: '123' })
      })
    })
  })

  describe('useQuery', () => {
    it('should return route query', async () => {
      await router.push('/about?name=test&age=25')

      app.runWithContext(() => {
        const query = useQuery()
        expect(query.value).toEqual({ name: 'test', age: '25' })
      })
    })
  })

  describe('useHash', () => {
    it('should return route hash', async () => {
      await router.push('/about#section1')

      app.runWithContext(() => {
        const hash = useHash()
        expect(hash.value).toBe('section1')
      })
    })
  })

  describe('useMeta', () => {
    it('should return route meta', async () => {
      await router.push('/about')

      app.runWithContext(() => {
        const meta = useMeta()
        expect(meta.value).toEqual({})
      })
    })
  })

  describe('useMatched', () => {
    it('should return matched routes', async () => {
      await router.push('/about')

      app.runWithContext(() => {
        const matched = useMatched()
        expect(matched.value).toHaveLength(1)
        expect(matched.value[0].name).toBe('About')
      })
    })
  })

  describe('integration', () => {
    it('should work together in component setup', async () => {
      await router.push('/user/456')

      app.runWithContext(() => {
        const routerInstance = useRouter()
        const route = useRoute()

        expect(routerInstance).toBe(router)
        expect(route.value.path).toBe('/user/456')
        expect(route.value.params.id).toBe('456')

        // 测试导航
        routerInstance.push('/about').then(() => {
          expect(route.value.path).toBe('/about')
        })
      })
    })

    it('should maintain reactivity across multiple components', async () => {
      app.runWithContext(() => {
        const route1 = useRoute()
        const route2 = useRoute()

        // 两个组件应该获得相同的响应式对象
        expect(route1).toBe(route2)
      })
    })
  })
})
