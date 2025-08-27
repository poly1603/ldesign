/**
 * @ldesign/router 组合式 API 测试
 */

import type { RouteRecordRaw } from '../src'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, watch } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  useHash,
  useLink,
  useMatched,
  useMeta,
  useNavigation,
  useParams,
  useQuery,
  useRoute,
  useRouter,
} from '../src'

describe('composables', () => {
  let app: any
  let router: any

  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: () => Promise.resolve({ name: 'Home' }),
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => Promise.resolve({ name: 'User' }),
      meta: { title: 'User Profile', requiresAuth: true },
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
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    app = createApp({})
    app.use(router)
  })

  describe('useRouter', () => {
    it('should return router instance', () => {
      let routerInstance: any

      const TestComponent = {
        setup() {
          routerInstance = useRouter()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      expect(routerInstance).toBe(router)
    })

    it('should throw error when used outside router context', () => {
      expect(() => {
        useRouter()
      }).toThrow(
        'useRouter() can only be used inside a component that has a router instance',
      )
    })
  })

  describe('useRoute', () => {
    it('should return current route', async () => {
      let currentRoute: any

      const TestComponent = {
        setup() {
          currentRoute = useRoute()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123?tab=info#section1')
      await nextTick()

      expect(currentRoute.value.path).toBe('/user/123')
      expect(currentRoute.value.params.id).toBe('123')
      expect(currentRoute.value.query.tab).toBe('info')
      expect(currentRoute.value.hash).toBe('#section1')
    })

    it('should be reactive to route changes', async () => {
      let currentRoute: any
      const paths: string[] = []

      const TestComponent = {
        setup() {
          currentRoute = useRoute()
          watch(
            () => currentRoute.value.path,
            (path) => {
              paths.push(path)
            },
            { immediate: true },
          )
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123')
      await nextTick()

      await router.push('/posts')
      await nextTick()

      expect(paths).toContain('/user/123')
      expect(paths).toContain('/posts')
    })
  })

  describe('useParams', () => {
    it('should return route parameters', async () => {
      let params: any

      const TestComponent = {
        setup() {
          params = useParams()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123')
      await nextTick()

      expect(params.value.id).toBe('123')
    })

    it('should be reactive to parameter changes', async () => {
      let params: any
      const ids: string[] = []

      const TestComponent = {
        setup() {
          params = useParams()
          watch(
            () => params.value.id,
            (newId: string) => {
              if (newId) {
                ids.push(newId)
              }
            },
            { immediate: true },
          )
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123')
      await nextTick()

      await router.push('/user/456')
      await nextTick()

      expect(ids).toContain('123')
      expect(ids).toContain('456')
    })
  })

  describe('useQuery', () => {
    it('should return query parameters', async () => {
      let query: any

      const TestComponent = {
        setup() {
          query = useQuery()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123?tab=info&sort=name')
      await nextTick()

      expect(query.value.tab).toBe('info')
      expect(query.value.sort).toBe('name')
    })
  })

  describe('useHash', () => {
    it('should return hash value', async () => {
      let hash: any

      const TestComponent = {
        setup() {
          hash = useHash()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123#section1')
      await nextTick()

      expect(hash.value).toBe('#section1')
    })
  })

  describe('useMeta', () => {
    it('should return route meta information', async () => {
      let meta: any

      const TestComponent = {
        setup() {
          meta = useMeta()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/user/123')
      await nextTick()

      expect(meta.value.title).toBe('User Profile')
      expect(meta.value.requiresAuth).toBe(true)
    })
  })

  describe('useMatched', () => {
    it('should return matched route records', async () => {
      let matched: any

      const TestComponent = {
        setup() {
          matched = useMatched()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/posts/123')
      await nextTick()

      expect(matched.value.length).toBeGreaterThanOrEqual(1)
      expect(
        matched.value.some(
          (route: any) => route.name === 'posts' || route.path === '/posts/:id',
        ),
      ).toBe(true)
    })
  })

  describe('useNavigation', () => {
    it('should provide navigation methods', () => {
      let navigation: any

      const TestComponent = {
        setup() {
          navigation = useNavigation()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      expect(navigation.push).toBeDefined()
      expect(navigation.replace).toBeDefined()
      expect(navigation.go).toBeDefined()
      expect(navigation.back).toBeDefined()
      expect(navigation.forward).toBeDefined()
    })

    it('should navigate using navigation methods', async () => {
      let navigation: any

      const TestComponent = {
        setup() {
          navigation = useNavigation()
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await navigation.push('/user/123')
      expect(router.currentRoute.value.path).toBe('/user/123')

      await navigation.replace('/posts')
      expect(router.currentRoute.value.path).toBe('/posts')
    })
  })

  describe('useLink', () => {
    it('should provide link functionality', () => {
      let link: any

      const TestComponent = {
        setup() {
          link = useLink({ to: '/user/123' })
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      expect(link.href).toBeDefined()
      expect(link.route).toBeDefined()
      expect(link.isActive).toBeDefined()
      expect(link.isExactActive).toBeDefined()
      expect(link.navigate).toBeDefined()
    })

    it('should generate correct href', () => {
      let link: any

      const TestComponent = {
        setup() {
          link = useLink({ to: '/user/123?tab=info#section1' })
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      expect(link.href.value).toBe('/user/123?tab=info#section1')
    })

    it('should detect active state', async () => {
      let link: any

      const TestComponent = {
        setup() {
          link = useLink({ to: '/user/123' })
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      expect(link.isActive.value).toBe(false)
      expect(link.isExactActive.value).toBe(false)

      await router.push('/user/123')
      await nextTick()

      expect(link.isActive.value).toBe(true)
      expect(link.isExactActive.value).toBe(true)
    })

    it('should navigate when navigate method is called', async () => {
      let link: any

      const TestComponent = {
        setup() {
          link = useLink({ to: '/user/123' })
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await link.navigate()
      expect(router.currentRoute.value.path).toBe('/user/123')
    })

    it('should support replace navigation', async () => {
      let link: any

      const TestComponent = {
        setup() {
          link = useLink({ to: '/user/123', replace: true })
          return () => h('div')
        },
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      testApp.mount(document.createElement('div'))

      await router.push('/posts')
      await link.navigate()

      expect(router.currentRoute.value.path).toBe('/user/123')
    })

    it('应该处理无效的to参数', () => {
      const TestComponent = {
        setup() {
          const link = useLink({ to: null as any })
          return { href: link.href.value }
        },
        template: '<div>{{ href }}</div>'
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      const wrapper = testApp.mount(document.createElement('div'))

      expect(wrapper.href).toBe('/')
    })

    it('应该处理复杂的路由对象', () => {
      const TestComponent = {
        setup() {
          const link = useLink({
            to: {
              name: 'user',
              params: { id: '123' },
              query: { tab: 'profile' },
              hash: '#section1'
            }
          })
          return { href: link.href.value }
        },
        template: '<div>{{ href }}</div>'
      }

      const testApp = createApp(TestComponent)
      testApp.use(router)
      const wrapper = testApp.mount(document.createElement('div'))

      expect(wrapper.href).toContain('/user/123')
    })
  })


})
