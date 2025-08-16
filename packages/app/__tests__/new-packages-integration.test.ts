/**
 * 新集成包的完整测试
 *
 * 测试 Cache、Color、Crypto、Size、Store 五个新集成包的功能
 */

// 导入新集成的包
import { createCache } from '@ldesign/cache'
import { ThemePlugin } from '@ldesign/color/vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'

import { VueSizePlugin } from '@ldesign/size/vue'
import { createStoreProviderPlugin } from '@ldesign/store/vue'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'

describe('新集成包功能测试', () => {
  let app: any

  beforeEach(() => {
    app = createApp({
      template: '<div>Test App</div>',
    })
  })

  describe('cache 缓存管理', () => {
    it('应该能够创建缓存实例', () => {
      const cache = createCache({
        defaultTTL: 5000,
        maxSize: 100,
      })

      expect(cache).toBeDefined()
      expect(typeof cache.set).toBe('function')
      expect(typeof cache.get).toBe('function')
      expect(typeof cache.delete).toBe('function')
    })

    it('应该能够设置和获取缓存', () => {
      const cache = createCache()
      const key = 'test-key'
      const value = 'test-value'

      cache.set(key, value)
      const retrieved = cache.get(key)

      expect(retrieved).toBe(value)
    })
  })

  describe('color 颜色主题', () => {
    it('应该能够安装主题插件', () => {
      expect(() => {
        app.use(ThemePlugin, {
          defaultTheme: 'default',
          autoDetect: false,
        })
      }).not.toThrow()
    })
  })

  describe('crypto 加密功能', () => {
    it('应该能够安装加密插件', () => {
      expect(() => {
        app.use(CryptoPlugin, {
          globalPropertyName: '$crypto',
        })
      }).not.toThrow()
    })
  })

  describe('size 尺寸缩放', () => {
    it('应该能够安装尺寸插件', () => {
      expect(() => {
        app.use(VueSizePlugin, {
          defaultSize: 'medium',
        })
      }).not.toThrow()
    })
  })

  describe('store 状态管理', () => {
    it('应该能够安装 Pinia 和 Store 插件', () => {
      const pinia = createPinia()

      expect(() => {
        app.use(pinia)
        app.use(
          createStoreProviderPlugin({
            enableDevtools: false,
          })
        )
      }).not.toThrow()
    })
  })

  describe('完整集成测试', () => {
    it('应该能够同时安装所有新包', () => {
      const pinia = createPinia()
      const cache = createCache()

      expect(() => {
        // 安装所有插件
        app.use(ThemePlugin, { defaultTheme: 'default' })
        app.use(VueSizePlugin, { defaultSize: 'medium' })
        app.use(CryptoPlugin, { globalPropertyName: '$crypto' })
        app.use(pinia)
        app.use(createStoreProviderPlugin({ enableDevtools: false }))

        // 提供缓存实例
        app.provide('cache', cache)
      }).not.toThrow()
    })

    it('应该能够访问全局属性', () => {
      const pinia = createPinia()

      app.use(ThemePlugin, { defaultTheme: 'default' })
      app.use(CryptoPlugin, { globalPropertyName: '$crypto' })
      app.use(pinia)

      // 模拟组件实例
      const instance = {
        appContext: {
          config: {
            globalProperties: app.config.globalProperties,
          },
        },
      }

      expect(instance.appContext.config.globalProperties.$crypto).toBeDefined()
    })
  })
})
