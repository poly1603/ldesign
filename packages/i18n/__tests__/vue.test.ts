/**
 * Vue 集成测试
 */

import { describe, expect, it, vi } from 'vitest'
import {
  createI18nPlugin,
  createVueI18n,
  I18nD,
  I18nN,
  I18nT,
  installI18n,
  useI18n,
} from '../src/vue'

// Mock Vue 相关功能（使用 hoisted 避免顶层初始化顺序问题）
const hoisted = vi.hoisted(() => ({
  mockInject: vi.fn(),
  mockReactive: vi.fn((obj: any) => obj),
  mockComputed: vi.fn((fn: any) => ({ value: fn() })),
  mockRef: vi.fn((val: any) => ({ value: val })),
  mockWatch: vi.fn(),
  mockH: vi.fn((tag: any, props: any, children: any) => ({ tag, props, children })),
  mockDefineComponent: vi.fn((options: any) => options),
}))

const { mockInject, mockReactive, mockComputed, mockRef, mockWatch, mockH, mockDefineComponent } = hoisted as any

vi.mock('vue', async () => {
  const actual: any = await vi.importActual('vue')
  return {
    ...actual,
    inject: (hoisted as any).mockInject,
    reactive: (hoisted as any).mockReactive,
    computed: (hoisted as any).mockComputed,
    ref: (hoisted as any).mockRef,
    watch: (hoisted as any).mockWatch,
    h: (hoisted as any).mockH,
    defineComponent: (hoisted as any).mockDefineComponent,
  }
})

describe('vue I18n 集成', () => {
  const testMessages = {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}',
      nested: {
        message: '嵌套消息',
      },
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}',
      nested: {
        message: 'Nested message',
      },
    },
  }

  describe('createVueI18n', () => {
    it('应该正确创建 Vue I18n 实例', async () => {
      const vueI18n = createVueI18n({
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: testMessages,
      })

      expect(vueI18n).toBeDefined()
      expect(vueI18n.global).toBeDefined()
      expect(typeof vueI18n.t).toBe('function')
      expect(typeof vueI18n.te).toBe('function')
      expect(typeof vueI18n.setLocale).toBe('function')
    })

    it('应该正确翻译文本', async () => {
      const vueI18n = createVueI18n({
        locale: 'zh-CN',
        messages: testMessages,
      })

      // 等待初始化完成
      await vueI18n.global.init()

      expect(vueI18n.t('hello')).toBe('你好')
      expect(vueI18n.t('welcome', { name: 'Vue' })).toBe('欢迎 Vue')
    })

    it('应该正确检查键存在性', async () => {
      const vueI18n = createVueI18n({
        locale: 'zh-CN',
        messages: testMessages,
      })

      await vueI18n.global.init()

      expect(vueI18n.te('hello')).toBe(true)
      expect(vueI18n.te('nonexistent')).toBe(false)
    })

    it('应该正确切换语言', async () => {
      const vueI18n = createVueI18n({
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: testMessages,
      })

      await vueI18n.global.init()

      expect(vueI18n.t('hello')).toBe('你好')

      await vueI18n.setLocale('en')
      // 由于测试环境对 computed 进行了静态 mock，这里使用 API 获取当前语言
      expect(vueI18n.getCurrentLanguage()).toBe('en')
      expect(vueI18n.t('hello')).toBe('Hello')
    })
  })

  describe('createI18nPlugin', () => {
    it('应该正确创建 Vue 插件', () => {
      const plugin = createI18nPlugin({
        locale: 'zh-CN',
        messages: testMessages,
      })

      expect(plugin).toBeDefined()
      expect(typeof plugin.install).toBe('function')
    })

    it('应该正确安装插件', () => {
      const mockApp = {
        provide: vi.fn(),
        config: {
          globalProperties: {},
        },
      }

      const plugin = createI18nPlugin({
        locale: 'zh-CN',
        messages: testMessages,
      })

      plugin.install(mockApp)

      expect(mockApp.provide).toHaveBeenCalled()
      expect(mockApp.config.globalProperties.$i18n).toBeDefined()
      expect(mockApp.config.globalProperties.$t).toBeDefined()
      expect(mockApp.config.globalProperties.$te).toBeDefined()
    })
  })

  describe('useI18n', () => {
    it('应该在没有安装插件时抛出错误', () => {
      mockInject.mockReturnValue(undefined)

      expect(() => useI18n()).toThrow('useI18n() 必须在安装了 I18n 插件的 Vue 应用中使用')
    })

    it('应该正确返回 I18n 实例', () => {
      const mockI18n = {
        locale: { value: 'zh-CN' },
        availableLocales: { value: ['zh-CN', 'en'] },
        t: vi.fn(),
        te: vi.fn(),
        setLocale: vi.fn(),
        setLocaleMessage: vi.fn(),
        getLocaleMessage: vi.fn(),
      }

      mockInject.mockReturnValue(mockI18n)
      mockComputed.mockImplementation(fn => ({ value: fn() }))

      const result = useI18n()

      expect(result).toBeDefined()
      expect(result.locale.value).toBe('zh-CN')
      expect(result.availableLocales.value).toEqual(['zh-CN', 'en'])
      expect(typeof result.t).toBe('function')
      expect(typeof result.te).toBe('function')
    })
  })

  describe('i18n 组件', () => {
    describe('i18nT', () => {
      it('应该正确定义组件', () => {
        expect(I18nT).toBeDefined()
        expect(I18nT.name).toBe('I18nT')
        expect(I18nT.props).toBeDefined()
      })

      it('应该有正确的 props 定义', () => {
        const props = I18nT.props
        expect(props.keypath).toBeDefined()
        expect(props.keypath.required).toBe(true)
        expect(props.params).toBeDefined()
        expect(props.tag).toBeDefined()
        expect(props.tag.default).toBe('span')
      })
    })

    describe('i18nN', () => {
      it('应该正确定义组件', () => {
        expect(I18nN).toBeDefined()
        expect(I18nN.name).toBe('I18nN')
        expect(I18nN.props).toBeDefined()
      })

      it('应该有正确的 props 定义', () => {
        const props = I18nN.props
        expect(props.value).toBeDefined()
        expect(props.value.required).toBe(true)
        expect(props.format).toBeDefined()
        expect(props.format.default).toBe('number')
      })
    })

    describe('i18nD', () => {
      it('应该正确定义组件', () => {
        expect(I18nD).toBeDefined()
        expect(I18nD.name).toBe('I18nD')
        expect(I18nD.props).toBeDefined()
      })

      it('应该有正确的 props 定义', () => {
        const props = I18nD.props
        expect(props.value).toBeDefined()
        expect(props.value.required).toBe(true)
        expect(props.format).toBeDefined()
        expect(props.format.default).toBe('medium')
      })
    })
  })

  describe('installI18n', () => {
    it('应该正确安装所有功能', () => {
      const mockApp = {
        use: vi.fn(),
        component: vi.fn(),
        directive: vi.fn(),
        provide: vi.fn(),
        config: {
          globalProperties: {},
        },
      }

      installI18n(mockApp, {
        locale: 'zh-CN',
        messages: testMessages,
      })

      expect(mockApp.use).toHaveBeenCalled()
      expect(mockApp.component).toHaveBeenCalledWith('I18nT', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledWith('I18nN', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledWith('I18nD', expect.any(Object))
      expect(mockApp.directive).toHaveBeenCalledWith('t', expect.any(Object))
      expect(mockApp.directive).toHaveBeenCalledWith('t-html', expect.any(Object))
      expect(mockApp.directive).toHaveBeenCalledWith('t-title', expect.any(Object))
    })
  })
})
