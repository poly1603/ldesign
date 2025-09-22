/**
 * Vue I18n 高级功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18nPlugin } from '../src/vue/plugin'
import {
  I18nC,
  I18nDT,
  I18nIf,
  I18nChain,
  useI18nValidation,
  useI18nRouter
} from '../src/vue/index'

// 测试消息
const messages = {
  'en': {
    hello: 'Hello',
    welcome: 'Welcome {name}',
    item: {
      one: 'one item',
      other: '{count} items'
    },
    user: {
      profile: {
        name: 'Profile Name',
        title: 'User Profile'
      }
    },
    validation: {
      required: '{field} is required',
      email: '{field} must be a valid email',
      minLength: '{field} must be at least {minLength} characters'
    },
    routes: {
      titles: {
        home: 'Home',
        about: 'About Us',
        contact: 'Contact'
      }
    },
    conditions: {
      empty: 'No items',
      single: 'One item',
      multiple: '{count} items'
    },
    chain: {
      step1: 'chain.step2',
      step2: 'chain.step3',
      step3: 'Final result'
    }
  },
  'zh-CN': {
    hello: '你好',
    welcome: '欢迎 {name}',
    item: {
      one: '一个项目',
      other: '{count} 个项目'
    },
    user: {
      profile: {
        name: '个人资料名称',
        title: '用户资料'
      }
    },
    validation: {
      required: '{field}是必填项',
      email: '{field}必须是有效的邮箱地址',
      minLength: '{field}长度不能少于{minLength}个字符'
    },
    routes: {
      titles: {
        home: '首页',
        about: '关于我们',
        contact: '联系我们'
      }
    },
    conditions: {
      empty: '没有项目',
      single: '一个项目',
      multiple: '{count} 个项目'
    },
    chain: {
      step1: 'chain.step2',
      step2: 'chain.step3',
      step3: '最终结果'
    }
  }
}

describe('Vue I18n Advanced Features', () => {
  let plugin: any

  beforeEach(() => {
    plugin = createI18nPlugin({
      locale: 'en',
      fallbackLocale: 'en',
      messages
    })
  })

  describe('I18nC Currency Component', () => {
    it('should format currency correctly', () => {
      const wrapper = mount(I18nC, {
        props: {
          value: 1234.56,
          currency: 'USD'
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toMatch(/\$1,234\.56|\$1234\.56|USD/)
    })

    it('should show currency code when requested', () => {
      const wrapper = mount(I18nC, {
        props: {
          value: 100,
          currency: 'EUR',
          showCode: true
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toContain('EUR')
    })
  })

  describe('I18nDT DateTime Component', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2023-12-25T10:30:00Z')

      const wrapper = mount(I18nDT, {
        props: {
          value: testDate,
          format: 'medium'
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBeTruthy()
      expect(wrapper.attributes('datetime')).toBe(testDate.toISOString())
    })

    it('should format relative time', () => {
      const pastDate = new Date(Date.now() - 60000) // 1 minute ago

      const wrapper = mount(I18nDT, {
        props: {
          value: pastDate,
          format: 'relative',
          updateInterval: 0 // Disable auto-update for testing
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toMatch(/minute|ago|前/)
    })

    it('should use custom template', () => {
      const testDate = new Date('2023-12-25T10:30:00Z')

      const wrapper = mount(I18nDT, {
        props: {
          value: testDate,
          format: 'custom',
          template: 'YYYY-MM-DD'
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('2023-12-25')
    })
  })

  describe('I18nIf Conditional Component', () => {
    it('should render based on conditions', () => {
      const wrapper = mount(I18nIf, {
        props: {
          conditions: [
            { when: 'count > 1', keypath: 'conditions.multiple' },
            { when: 'count === 1', keypath: 'conditions.single' },
            { when: 'count === 0', keypath: 'conditions.empty' }
          ],
          context: { count: 5 },
          params: { count: 5 }
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('5 items')
    })

    it('should use default keypath when no conditions match', () => {
      const wrapper = mount(I18nIf, {
        props: {
          conditions: [
            { when: 'count > 10', keypath: 'conditions.multiple' }
          ],
          context: { count: 5 },
          defaultKeypath: 'conditions.single'
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('One item')
    })

    it('should handle function conditions', () => {
      const wrapper = mount(I18nIf, {
        props: {
          conditions: [
            {
              when: (ctx: any) => ctx.count === 0,
              keypath: 'conditions.empty',
              priority: 10
            },
            {
              when: (ctx: any) => ctx.count > 0,
              keypath: 'conditions.multiple',
              priority: 5
            }
          ],
          context: { count: 0 },
          params: { count: 0 }
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('No items')
    })
  })

  describe('I18nChain Translation Chain Component', () => {
    it('should resolve translation chain', () => {
      const wrapper = mount(I18nChain, {
        props: {
          keypath: 'chain.step1',
          maxDepth: 5
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('Final result')
    })

    it('should handle predefined chain', () => {
      const wrapper = mount(I18nChain, {
        props: {
          chain: ['chain.step1', 'chain.step2', 'chain.step3']
        },
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toBe('Final result')
    })

    it('should prevent infinite loops', () => {
      // Create a circular reference for testing
      const circularMessages = {
        en: {
          circular1: 'circular2',
          circular2: 'circular1'
        }
      }

      const circularPlugin = createI18nPlugin({
        locale: 'en',
        messages: circularMessages
      })

      const wrapper = mount(I18nChain, {
        props: {
          keypath: 'circular1',
          maxDepth: 3,
          circularDetection: true
        },
        global: {
          plugins: [circularPlugin]
        }
      })

      // Should stop at circular reference
      expect(wrapper.text()).toBe('circular1')
    })
  })

  describe('useI18nValidation', () => {
    it('should provide validation functionality', () => {
      const TestComponent = {
        template: '<div>{{ fieldLabel }} - {{ errorMessage }}</div>',
        setup() {
          const validation = useI18nValidation({
            defaultMessagePrefix: 'validation'
          })

          validation.registerField({
            name: 'email',
            labelKey: 'fields.email',
            rules: ['required', 'email']
          })

          const fieldLabel = validation.getFieldLabel('email')
          validation.addValidationError('email', 'required')
          const errorMessage = validation.getFirstFieldError('email')

          return {
            fieldLabel,
            errorMessage
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toContain('email')
      expect(wrapper.text()).toContain('required')
    })
  })

  describe('useI18nRouter', () => {
    it('should provide router i18n functionality', () => {
      const TestComponent = {
        template: '<div>{{ routeTitle }} - {{ breadcrumbs.length }}</div>',
        setup() {
          const router = useI18nRouter({
            titlePrefix: 'routes.titles'
          })

          router.registerRoute({
            name: 'home',
            path: '/',
            titleKey: 'routes.titles.home'
          })

          router.registerRoute({
            name: 'about',
            path: '/about',
            titleKey: 'routes.titles.about',
            parent: 'home'
          })

          const routeTitle = router.getRouteTitle('home')
          const breadcrumbs = router.generateBreadcrumbs('about')

          return {
            routeTitle,
            breadcrumbs
          }
        }
      }

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [plugin]
        }
      })

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('2') // Home + About breadcrumbs
    })
  })
})
