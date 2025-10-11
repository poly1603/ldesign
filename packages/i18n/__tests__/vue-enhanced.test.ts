/**
 * Vue I18n 增强功能测试
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18nPlugin, useI18nEnhanced, useI18nScope } from '../src/vue'
import I18nL from '../src/vue/components/I18nL.vue'
import I18nP from '../src/vue/components/I18nP.vue'
import I18nR from '../src/vue/components/I18nR.vue'
import TranslationMissing from '../src/vue/components/TranslationMissing.vue'

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('vue I18n Enhanced Features', () => {
  const messages = {
    'en': {
      'hello': 'Hello',
      'welcome': 'Welcome {name}',
      'item': 'item | items',
      'item.one': 'one item',
      'item.other': '{count} items',
      'user': {
        profile: {
          name: 'Profile Name',
        },
      },
    },
    'zh-CN': {
      'hello': '你好',
      'welcome': '欢迎 {name}',
      'item': '项目 | 项目',
      'item.one': '一个项目',
      'item.other': '{count} 个项目',
    },
  }

  let plugin: any
  let wrapper: any

  beforeEach(() => {
    plugin = createI18nPlugin({
      locale: 'en',
      fallbackLocale: 'en',
      messages,
    })
  })

  describe('translationMissing Component', () => {
    it('should display missing key in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      wrapper = mount(TranslationMissing, {
        props: {
          keypath: 'missing.key',
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.find('.translation-missing__key').text()).toBe('missing.key')
      expect(wrapper.find('.translation-missing__dev').exists()).toBe(true)

      process.env.NODE_ENV = originalEnv
    })

    it('should display fallback text in production mode', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      wrapper = mount(TranslationMissing, {
        props: {
          keypath: 'missing.key',
          fallbackText: 'Fallback Text',
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.find('.translation-missing__fallback').text()).toBe('Fallback Text')
      expect(wrapper.find('.translation-missing__dev').exists()).toBe(false)

      process.env.NODE_ENV = originalEnv
    })

    it('should show suggestions when provided', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      wrapper = mount(TranslationMissing, {
        props: {
          keypath: 'missing.key',
          suggestions: ['hello', 'welcome'],
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.find('.translation-missing__suggestions').exists()).toBe(true)
      expect(wrapper.findAll('.translation-missing__suggestion')).toHaveLength(2)

      process.env.NODE_ENV = originalEnv
    })

    it('should copy keypath to clipboard', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      wrapper = mount(TranslationMissing, {
        props: {
          keypath: 'missing.key',
        },
        global: {
          plugins: [plugin],
        },
      })

      const copyButton = wrapper.find('.translation-missing__copy')
      await copyButton.trigger('click')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('missing.key')

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('useI18nEnhanced', () => {
    it('should provide enhanced translation functions', () => {
      const TestComponent = {
        template: '<div>{{ result.text }}</div>',
        setup() {
          const { tSafe } = useI18nEnhanced()
          const result = tSafe('hello')
          return { result }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('Hello')
    })

    it('should handle missing keys safely', () => {
      const TestComponent = {
        template: '<div>{{ result.text }}</div>',
        setup() {
          const { tSafe } = useI18nEnhanced()
          const result = tSafe('missing.key', { fallback: 'Default Text' })
          return { result }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('Default Text')
    })

    it('should provide batch translation', () => {
      const TestComponent = {
        template: '<div>{{ results.hello.text }} {{ results.welcome.text }}</div>',
        setup() {
          const { tBatch } = useI18nEnhanced()
          const results = tBatch(['hello', 'welcome'])
          return { results }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toContain('Hello')
      expect(wrapper.text()).toContain('Welcome')
    })
  })

  describe('useI18nScope', () => {
    it('should provide scoped translation', () => {
      const TestComponent = {
        template: '<div>{{ text }}</div>',
        setup() {
          const scope = useI18nScope({ namespace: 'user.profile' })
          const text = scope.t('name')
          return { text }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('Profile Name')
    })

    it('should create sub-scopes', () => {
      const TestComponent = {
        template: '<div>{{ text }}</div>',
        setup() {
          const userScope = useI18nScope({ namespace: 'user' })
          const profileScope = userScope.createSubScope('profile')
          const text = profileScope.t('name')
          return { text }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('Profile Name')
    })

    it('should fallback to global keys when enabled', () => {
      const TestComponent = {
        template: '<div>{{ text }}</div>',
        setup() {
          const scope = useI18nScope({
            namespace: 'nonexistent',
            fallbackToGlobal: true,
          })
          const text = scope.t('hello')
          return { text }
        },
      }

      wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('Hello')
    })
  })

  describe('i18nP Component', () => {
    it('should handle plural forms correctly', () => {
      wrapper = mount(I18nP, {
        props: {
          keypath: 'item',
          count: 1,
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('item')

      wrapper = mount(I18nP, {
        props: {
          keypath: 'item',
          count: 5,
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('items')
    })

    it('should use structured plural keys', () => {
      wrapper = mount(I18nP, {
        props: {
          keypath: 'item',
          count: 1,
        },
        global: {
          plugins: [plugin],
        },
      })

      // Should try item.one first, then fallback to pipe-delimited
      expect(wrapper.text()).toBe('one item')
    })

    it('should include count in parameters', () => {
      wrapper = mount(I18nP, {
        props: {
          keypath: 'item',
          count: 5,
          includeCount: true,
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toBe('5 items')
    })
  })

  describe('i18nR Component', () => {
    it('should format relative time', () => {
      const pastDate = new Date(Date.now() - 60000) // 1 minute ago

      wrapper = mount(I18nR, {
        props: {
          value: pastDate,
          updateInterval: 0, // Disable auto-update for testing
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toMatch(/minute.*ago|ago.*minute/i)
    })

    it('should format future time', () => {
      const futureDate = new Date(Date.now() + 3600000) // 1 hour from now

      wrapper = mount(I18nR, {
        props: {
          value: futureDate,
          updateInterval: 0, // Disable auto-update for testing
        },
        global: {
          plugins: [plugin],
        },
      })

      expect(wrapper.text()).toMatch(/in.*hour|hour.*in/i)
    })
  })

  describe('i18nL Component', () => {
    it('should format conjunction lists', () => {
      wrapper = mount(I18nL, {
        props: {
          items: ['Apple', 'Banana', 'Orange'],
          type: 'conjunction',
        },
        global: {
          plugins: [plugin],
        },
      })

      const text = wrapper.text()
      expect(text).toContain('Apple')
      expect(text).toContain('Banana')
      expect(text).toContain('Orange')
      expect(text).toMatch(/and|,/)
    })

    it('should format disjunction lists', () => {
      wrapper = mount(I18nL, {
        props: {
          items: ['Red', 'Green'],
          type: 'disjunction',
        },
        global: {
          plugins: [plugin],
        },
      })

      const text = wrapper.text()
      expect(text).toContain('Red')
      expect(text).toContain('Green')
      expect(text).toMatch(/or/)
    })

    it('should limit items and show more text', () => {
      wrapper = mount(I18nL, {
        props: {
          items: ['A', 'B', 'C', 'D', 'E'],
          maxItems: 3,
        },
        global: {
          plugins: [plugin],
        },
      })

      const text = wrapper.text()
      expect(text).toContain('A')
      expect(text).toContain('B')
      expect(text).toContain('C')
      expect(text).toMatch(/\+2/)
    })
  })
})
