/**
 * Vue 集成测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { mount } from '@vue/test-utils'
import {
  useApi,
  useApiCall,
  useSystemApi,
  ApiVuePlugin,
  API_ENGINE_INJECTION_KEY,
  createApiVuePlugin,
} from '../src/vue'
import { createApiEngine } from '../src/core/factory'
import type { ApiEngine } from '../src/types'

// Mock DOM environment
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost' },
  writable: true,
})

describe('Vue 集成', () => {
  let apiEngine: ApiEngine

  beforeEach(() => {
    apiEngine = createApiEngine({
      debug: false,
      http: {
        baseURL: 'https://api.test.com',
        timeout: 5000,
      },
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })
  })

  describe('Vue 插件', () => {
    it('应该能够安装 Vue 插件', () => {
      const app = createApp({})

      expect(() => {
        app.use(ApiVuePlugin, {
          engine: apiEngine,
          globalPropertyName: '$api',
        })
      }).not.toThrow()
    })

    it('应该能够通过全局属性访问 API 引擎', () => {
      const app = createApp({
        template:
          '<div>{{ $api ? "API Available" : "API Not Available" }}</div>',
      })

      app.use(ApiVuePlugin, {
        engine: apiEngine,
        globalPropertyName: '$api',
      })

      expect(app.config.globalProperties.$api).toBe(apiEngine)
    })

    it('应该能够创建自定义 Vue 插件', () => {
      const customPlugin = createApiVuePlugin({
        engine: apiEngine,
        globalPropertyName: '$customApi',
      })

      const app = createApp({})

      expect(() => {
        app.use(customPlugin)
      }).not.toThrow()

      expect(app.config.globalProperties.$customApi).toBe(apiEngine)
    })
  })

  describe('导出检查', () => {
    it('应该导出必要的函数和类型', () => {
      expect(typeof useApi).toBe('function')
      expect(typeof useApiCall).toBe('function')
      expect(typeof useSystemApi).toBe('function')
      expect(typeof createApiVuePlugin).toBe('function')
    })

    it('应该导出 Vue 插件', () => {
      expect(ApiVuePlugin).toBeDefined()
      expect(typeof ApiVuePlugin.install).toBe('function')
    })

    it('应该导出注入键', () => {
      expect(API_ENGINE_INJECTION_KEY).toBeDefined()
      expect(typeof API_ENGINE_INJECTION_KEY).toBe('symbol')
    })
  })
})
