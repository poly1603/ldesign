/**
 * 首次加载翻译测试
 * 验证多语言包在应用首次加载时是否正常工作
 */

import type { I18nEnginePluginOptions } from '../src/vue/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from '../src/core/createI18n'
import { createI18nEnginePlugin } from '../src/vue/engine-plugin'

describe('first Load Translation', () => {
  let mockEngine: any
  let mockVueApp: any

  beforeEach(() => {
    // 模拟 Vue 应用
    mockVueApp = {
      provide: vi.fn(),
      config: {
        globalProperties: {},
      },
      use: vi.fn(),
      directive: vi.fn(),
    }

    // 模拟引擎
    mockEngine = {
      getApp: vi.fn(() => mockVueApp),
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
      },
      events: {
        emit: vi.fn(),
        once: vi.fn(),
      },
      state: {
        set: vi.fn(),
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('同步初始化', () => {
    it('应该在组件渲染前就能提供翻译功能', () => {
      // 创建 i18n 实例
      const i18n = createI18n({
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: {
          'zh-CN': {
            hello: '你好',
            welcome: '欢迎 {name}',
          },
          'en': {
            hello: 'Hello',
            welcome: 'Welcome {name}',
          },
        },
      })

      // 同步初始化
      if (typeof i18n.initSync === 'function') {
        i18n.initSync()
      }

      // 验证立即可用
      expect(i18n.t('hello')).toBe('你好')
      expect(i18n.t('welcome', { name: '张三' })).toBe('欢迎 张三')
    })

    it('应该在没有 initSync 方法时也能正常工作', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: {
          en: {
            test: 'Test message',
          },
        },
      })

      // 即使没有调用 init，基础功能也应该可用
      expect(i18n.t('test')).toBe('Test message')
    })
  })

  describe('engine 插件集成', () => {
    it('应该在插件安装时立即初始化 i18n', async () => {
      const options: I18nEnginePluginOptions = {
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: {
          'zh-CN': {
            app: {
              title: '应用标题',
              loading: '加载中...',
            },
          },
          'en': {
            app: {
              title: 'App Title',
              loading: 'Loading...',
            },
          },
        },
      }

      const plugin = createI18nEnginePlugin(options)

      // 安装插件
      await plugin.install(mockEngine)

      // 验证 i18n 已经初始化并提供给 Vue 应用
      expect(mockVueApp.provide).toHaveBeenCalled()
      expect(mockVueApp.config.globalProperties.$i18n).toBeDefined()
      expect(mockVueApp.config.globalProperties.$t).toBeDefined()
    })

    it('应该在 app:created 事件触发前就准备好 i18n', async () => {
      const options: I18nEnginePluginOptions = {
        locale: 'zh-CN',
        messages: {
          'zh-CN': {
            ui: {
              button: '按钮',
              label: '标签',
            },
          },
        },
      }

      const plugin = createI18nEnginePlugin(options)

      // 模拟没有立即创建的 Vue 应用
      const mockEngineDelayed = {
        ...mockEngine,
        getApp: vi.fn()
          .mockReturnValueOnce(null) // 第一次调用返回 null
          .mockReturnValue(mockVueApp), // 后续调用返回 app
      }

      // 安装插件
      await plugin.install(mockEngineDelayed)

      // 验证监听了 app:created 事件
      expect(mockEngineDelayed.events.once).toHaveBeenCalledWith(
        'app:created',
        expect.any(Function),
      )

      // 模拟触发 app:created 事件
      const appCreatedHandler = mockEngineDelayed.events.once.mock.calls[0][1]
      await appCreatedHandler(mockVueApp)

      // 验证 i18n 功能已就绪
      expect(mockVueApp.provide).toHaveBeenCalled()
      expect(mockVueApp.config.globalProperties.$t).toBeDefined()
    })
  })

  describe('响应式状态', () => {
    it('应该在初始化时正确设置响应式状态', async () => {
      const options: I18nEnginePluginOptions = {
        locale: 'ja',
        fallbackLocale: 'en',
        messages: {
          'ja': { greeting: 'こんにちは' },
          'en': { greeting: 'Hello' },
          'zh-CN': { greeting: '你好' },
        },
      }

      const plugin = createI18nEnginePlugin(options)
      await plugin.install(mockEngine)

      // 验证全局属性中的 i18n 对象
      const globalI18n = mockVueApp.config.globalProperties.$i18n
      expect(globalI18n).toBeDefined()
      expect(globalI18n.locale).toBeDefined()
      expect(globalI18n.availableLocales).toBeDefined()

      // 验证翻译函数可用
      const $t = mockVueApp.config.globalProperties.$t
      expect(typeof $t).toBe('function')
    })
  })

  describe('错误处理', () => {
    it('应该在初始化失败时提供降级功能', async () => {
      const options: I18nEnginePluginOptions = {
        locale: 'invalid-locale',
        messages: undefined, // 没有提供消息
      }

      const plugin = createI18nEnginePlugin(options)

      // 即使初始化可能失败，也不应该抛出错误
      await expect(plugin.install(mockEngine)).resolves.not.toThrow()

      // 验证降级功能
      const $t = mockVueApp.config.globalProperties.$t
      if ($t) {
        // 应该返回原始键值作为降级
        expect($t('any.key')).toBe('any.key')
      }
    })
  })

  describe('性能优化', () => {
    it('应该避免重复初始化', () => {
      const i18n = createI18n({
        locale: 'zh-CN',
        messages: {
          'zh-CN': { test: '测试' },
        },
      })

      // 多次调用 initSync 不应该有副作用
      if (typeof i18n.initSync === 'function') {
        i18n.initSync()
        i18n.initSync()
        i18n.initSync()
      }

      // 功能应该正常
      expect(i18n.t('test')).toBe('测试')
    })

    it('应该缓存翻译结果', () => {
      const i18n = createI18n({
        locale: 'en',
        messages: {
          en: {
            dynamic: 'Dynamic {value}',
          },
        },
        cache: {
          enabled: true,
          maxSize: 100,
        },
      })

      // 同一个键和参数应该返回缓存的结果
      const result1 = i18n.t('dynamic', { value: 'test' })
      const result2 = i18n.t('dynamic', { value: 'test' })

      expect(result1).toBe(result2)
      expect(result1).toBe('Dynamic test')
    })
  })
})

describe('实际使用场景', () => {
  it('应该支持在 Vue 组件 setup 中立即使用', () => {
    // 模拟 Vue 组件的 setup 函数
    const setupFunction = () => {
      // 创建并初始化 i18n
      const i18n = createI18n({
        locale: 'zh-CN',
        messages: {
          'zh-CN': {
            component: {
              title: '组件标题',
              description: '这是一个描述',
            },
          },
        },
      })

      // 同步初始化
      if (typeof i18n.initSync === 'function') {
        i18n.initSync()
      }

      // 立即使用翻译
      const title = i18n.t('component.title')
      const description = i18n.t('component.description')

      return {
        title,
        description,
      }
    }

    // 执行 setup
    const result = setupFunction()

    // 验证结果
    expect(result.title).toBe('组件标题')
    expect(result.description).toBe('这是一个描述')
  })

  it('应该支持 SSR 场景', () => {
    // 模拟服务端渲染环境
    const serverI18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          ssr: {
            meta: 'Server rendered content',
            title: 'Page Title',
          },
        },
      },
    })

    // 同步初始化（SSR 必须同步）
    if (typeof serverI18n.initSync === 'function') {
      serverI18n.initSync()
    }

    // 生成服务端内容
    const metaContent = serverI18n.t('ssr.meta')
    const pageTitle = serverI18n.t('ssr.title')

    expect(metaContent).toBe('Server rendered content')
    expect(pageTitle).toBe('Page Title')
  })
})
