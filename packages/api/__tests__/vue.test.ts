import { describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import {
  API_ENGINE_KEY,
  apiVuePlugin,
  createApiProvider,
  useApi,
  useApiCall,
  useSystemApi,
} from '../src/vue'

// Mock DOM environment
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost' },
  writable: true,
})

describe('vue Integration', () => {
  describe('apiVuePlugin', () => {
    it('应该能够安装 Vue 插件', () => {
      const app = createApp({})
      const mockProvide = vi.fn()
      app.provide = mockProvide

      app.use(apiVuePlugin, {
        debug: false,
        globalPropertyName: '$api',
      })

      expect(mockProvide).toHaveBeenCalled()
      expect(app.config.globalProperties.$api).toBeDefined()
    })

    it('应该使用自定义配置', () => {
      const app = createApp({})
      const mockProvide = vi.fn()
      app.provide = mockProvide

      app.use(apiVuePlugin, {
        globalPropertyName: '$customApi',
        debug: true,
      })

      expect(app.config.globalProperties.$customApi).toBeDefined()
    })
  })

  describe('createApiProvider', () => {
    it('应该创建 API 提供者', () => {
      const provider = createApiProvider({
        debug: false,
      })

      expect(provider.apiEngine).toBeDefined()
      expect(typeof provider.provide).toBe('function')
      expect(typeof provider.use).toBe('function')
    })
  })

  // Vue 组合式 API 测试需要在真实的 Vue 环境中运行
  // 这里只测试基本的导出和类型
  describe('vue 集成导出', () => {
    it('应该导出必要的函数和类型', () => {
      expect(typeof useApi).toBe('function')
      expect(typeof useApiCall).toBe('function')
      expect(typeof useSystemApi).toBe('function')
      expect(typeof createApiProvider).toBe('function')
    })

    it('应该导出 Vue 插件', () => {
      expect(apiVuePlugin).toBeDefined()
      expect(typeof apiVuePlugin.install).toBe('function')
    })

    it('应该导出注入键', () => {
      expect(API_ENGINE_KEY).toBeDefined()
      expect(typeof API_ENGINE_KEY).toBe('symbol')
    })
  })
})
