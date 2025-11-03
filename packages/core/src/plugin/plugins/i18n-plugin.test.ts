import { describe, it, expect, beforeEach } from 'vitest'
import { createI18nPlugin, LOCALE_CODES } from './i18n-plugin'

describe('i18n Plugin', () => {
  describe('createI18nPlugin', () => {
    it('should create plugin with correct structure', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
        },
      })

      expect(plugin.name).toBe('i18n')
      expect(plugin.version).toBeDefined()
      expect(plugin.install).toBeDefined()
    })

    it('should use default locale if not provided', () => {
      const plugin = createI18nPlugin({
        messages: {
          'en-US': { hello: 'Hello' },
        },
      })

      expect(plugin).toBeDefined()
      // Plugin should have default configuration
    })

    it('should validate required messages', () => {
      expect(() => {
        createI18nPlugin({
          locale: 'en-US',
          // @ts-expect-error - testing missing required field
          messages: undefined,
        })
      }).toThrow()
    })
  })

  describe('LOCALE_CODES', () => {
    it('should contain common locale codes', () => {
      expect(LOCALE_CODES).toContain('en-US')
      expect(LOCALE_CODES).toContain('zh-CN')
      expect(LOCALE_CODES).toContain('ja-JP')
    })

    it('should be a readonly array', () => {
      expect(Array.isArray(LOCALE_CODES)).toBe(true)
      expect(LOCALE_CODES.length).toBeGreaterThan(0)
    })
  })

  describe('Plugin Installation', () => {
    it('should install without errors', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
          'zh-CN': { hello: '你好' },
        },
      })

      const mockEngine = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      expect(() => {
        plugin.install(mockEngine as any)
      }).not.toThrow()
    })

    it('should register locale methods on engine', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.setLocale).toBeDefined()
      expect(mockEngine.getLocale).toBeDefined()
      expect(mockEngine.t).toBeDefined()
    })
  })

  describe('Translation', () => {
    it('should translate messages correctly', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { 
            hello: 'Hello',
            welcome: 'Welcome, {name}!',
          },
          'zh-CN': {
            hello: '你好',
            welcome: '欢迎，{name}！',
          },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'en-US'),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.t('hello')).toBe('Hello')
    })

    it('should handle missing translations', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        fallbackLocale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'en-US'),
        },
      }

      plugin.install(mockEngine)

      // Should return key if translation not found
      expect(mockEngine.t('missing.key')).toBe('missing.key')
    })

    it('should interpolate variables', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { 
            welcome: 'Welcome, {name}!',
          },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'en-US'),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.t('welcome', { name: 'John' })).toBe('Welcome, John!')
    })
  })

  describe('Locale Switching', () => {
    it('should switch locale correctly', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
          'zh-CN': { hello: '你好' },
        },
      })

      let currentLocale = 'en-US'
      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn((key, value) => {
            if (key === 'i18n.locale') {
              currentLocale = value
            }
          }),
          get: vi.fn(() => currentLocale),
        },
      }

      plugin.install(mockEngine)

      mockEngine.setLocale('zh-CN')
      
      expect(mockEngine.state.set).toHaveBeenCalledWith('i18n.locale', 'zh-CN')
      expect(mockEngine.events.emit).toHaveBeenCalledWith('i18n:locale-changed', expect.anything())
    })

    it('should emit event when locale changes', () => {
      const plugin = createI18nPlugin({
        locale: 'en-US',
        messages: {
          'en-US': { hello: 'Hello' },
          'zh-CN': { hello: '你好' },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'en-US'),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setLocale('zh-CN')

      expect(mockEngine.events.emit).toHaveBeenCalledWith(
        'i18n:locale-changed',
        expect.objectContaining({
          oldLocale: 'en-US',
          newLocale: 'zh-CN',
        })
      )
    })
  })
})
