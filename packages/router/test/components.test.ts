import type { Router, RouteRecordRaw } from '../src'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  RouterLink,
  RouterView,
} from '../src'

describe('components', () => {
  let router: Router

  const HomeComponent = defineComponent({
    template: '<div class="home">Home Page</div>',
  })

  const AboutComponent = defineComponent({
    template: '<div class="about">About Page</div>',
  })

  const UserComponent = defineComponent({
    template: '<div class="user">User: {{ $route.params.id }}</div>',
  })

  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'Home',
      component: HomeComponent,
    },
    {
      path: '/about',
      name: 'About',
      component: AboutComponent,
    },
    {
      path: '/user/:id',
      name: 'User',
      component: UserComponent,
    },
  ]

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
  })

  describe('routerView', () => {
    it('should render matched component', async () => {
      await router.push('/')

      const wrapper = mount(RouterView, {
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.find('.home').exists()).toBe(true)
      expect(wrapper.text()).toContain('Home Page')
    })

    it('should update when route changes', async () => {
      const wrapper = mount(RouterView, {
        global: {
          plugins: [router],
        },
      })

      await router.push('/')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.home').exists()).toBe(true)

      await router.push('/about')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.about').exists()).toBe(true)
    })

    it('should render nothing when no route matches', async () => {
      await router.push('/non-existent')

      const wrapper = mount(RouterView, {
        global: {
          plugins: [router],
        },
      })

      // RouterView会渲染transition包装器，但内容为空
      expect(wrapper.html()).toContain('transition-stub')
      expect(wrapper.find('.home').exists()).toBe(false)
      expect(wrapper.find('.about').exists()).toBe(false)
    })

    it('should support named views', async () => {
      const routerWithNamedViews = createRouter({
        history: createMemoryHistory(),
        routes: [
          {
            path: '/',
            components: {
              default: HomeComponent,
              sidebar: defineComponent({
                template: '<div class="sidebar">Sidebar</div>',
              }),
            },
          },
        ],
      })

      await routerWithNamedViews.push('/')

      const wrapper = mount(RouterView, {
        props: { name: 'sidebar' },
        global: {
          plugins: [routerWithNamedViews],
        },
      })

      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('should support slot rendering', async () => {
      await router.push('/')

      const wrapper = mount(RouterView, {
        global: {
          plugins: [router],
        },
        slots: {
          default: ({ Component }) =>
            h('div', { class: 'wrapper' }, Component ? [h(Component)] : []),
        },
      })

      expect(wrapper.find('.wrapper').exists()).toBe(true)
    })
  })

  describe('routerLink', () => {
    it('should render anchor tag by default', () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.text()).toBe('About')
      expect(wrapper.attributes('href')).toBe('/about')
    })

    it('should navigate on click', async () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      await wrapper.trigger('click')
      expect(router.currentRoute.value.path).toBe('/about')
    })

    it('should support object-style to prop', () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: { name: 'About' },
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      expect(wrapper.attributes('href')).toBe('/about')
    })

    it('should support replace prop', async () => {
      await router.push('/')

      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          replace: true,
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      const replaceSpy = vi.spyOn(router, 'replace')
      await wrapper.trigger('click')

      expect(replaceSpy).toHaveBeenCalled()
    })

    it('should add active class when route matches', async () => {
      await router.push('/about')

      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          activeClass: 'active',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      expect(wrapper.classes()).toContain('active')
    })

    it('should add exact active class when route exactly matches', async () => {
      await router.push('/about')

      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          exactActiveClass: 'exact-active',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      expect(wrapper.classes()).toContain('exact-active')
    })

    it('should support custom tag', () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          tag: 'button',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('should support custom event', async () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          event: 'mouseenter',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10)) // 等待异步导航
      expect(router.currentRoute.value.path).toBe('/about')
    })

    it('should support custom rendering with slot', () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
          custom: true,
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: ({ navigate, isActive }) =>
            h(
              'button',
              { onClick: navigate, class: { active: isActive } },
              'Custom Link'
            ),
        },
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toBe('Custom Link')
    })

    it('should prevent navigation with modifier keys', async () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      await wrapper.trigger('click', { ctrlKey: true })
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('should prevent navigation with right click', async () => {
      const wrapper = mount(RouterLink, {
        props: {
          to: '/about',
        },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'About',
        },
      })

      await wrapper.trigger('click', { button: 2 })
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
