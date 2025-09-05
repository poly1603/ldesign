/**
 * 工厂函数测试
 */

import { describe, it, expect, afterEach } from 'vitest'
import {
  createApiEngine,
  createApiEngineWithDefaults,
  createDevelopmentApiEngine,
  createProductionApiEngine,
  createTestApiEngine,
  createApiEngineByEnv,
  createSingletonApiEngine,
  destroySingletonApiEngine,
} from '../src/core/factory'
import type { ApiEngine } from '../src/types'

describe('工厂函数', () => {
  let engines: ApiEngine[] = []

  afterEach(() => {
    // 清理所有创建的引擎
    engines.forEach(engine => engine.destroy())
    engines = []
    destroySingletonApiEngine()
  })

  describe('createApiEngine', () => {
    it('应该创建基本的 API 引擎', () => {
      const engine = createApiEngine()
      engines.push(engine)

      expect(engine).toBeDefined()
      expect(engine.config).toBeDefined()
      expect(engine.httpClient).toBeDefined()
    })

    it('应该使用提供的配置', () => {
      const config = {
        debug: true,
        http: {
          baseURL: 'https://api.example.com',
          timeout: 15000,
        },
        cache: {
          enabled: false,
        },
      }

      const engine = createApiEngine(config)
      engines.push(engine)

      expect(engine.config.debug).toBe(true)
      expect(engine.config.http?.baseURL).toBe('https://api.example.com')
      expect(engine.config.http?.timeout).toBe(15000)
      expect(engine.config.cache?.enabled).toBe(false)
    })
  })

  describe('createApiEngineWithDefaults', () => {
    it('应该创建带有默认配置的 API 引擎', () => {
      const engine = createApiEngineWithDefaults('https://api.example.com')
      engines.push(engine)

      expect(engine.config.http?.baseURL).toBe('https://api.example.com')
      expect(engine.config.http?.timeout).toBe(10000)
      expect(engine.config.cache?.enabled).toBe(true)
      expect(engine.config.debounce?.enabled).toBe(true)
      expect(engine.config.deduplication?.enabled).toBe(true)
    })

    it('应该允许覆盖默认配置', () => {
      const engine = createApiEngineWithDefaults('https://api.example.com', {
        debug: true,
        http: {
          timeout: 20000,
        },
        cache: {
          ttl: 600000,
        },
      })
      engines.push(engine)

      expect(engine.config.debug).toBe(true)
      expect(engine.config.http?.baseURL).toBe('https://api.example.com')
      expect(engine.config.http?.timeout).toBe(20000)
      expect(engine.config.cache?.ttl).toBe(600000)
    })
  })

  describe('createDevelopmentApiEngine', () => {
    it('应该创建开发环境的 API 引擎', () => {
      const engine = createDevelopmentApiEngine('http://localhost:3000/api')
      engines.push(engine)

      expect(engine.config.debug).toBe(true)
      expect(engine.config.http?.baseURL).toBe('http://localhost:3000/api')
      expect(engine.config.http?.timeout).toBe(30000)
      expect(engine.config.cache?.enabled).toBe(false)
    })
  })

  describe('createProductionApiEngine', () => {
    it('应该创建生产环境的 API 引擎', () => {
      const engine = createProductionApiEngine('https://api.example.com')
      engines.push(engine)

      expect(engine.config.debug).toBe(false)
      expect(engine.config.http?.baseURL).toBe('https://api.example.com')
      expect(engine.config.http?.timeout).toBe(10000)
      expect(engine.config.cache?.enabled).toBe(true)
      expect(engine.config.cache?.ttl).toBe(600000)
      expect(engine.config.debounce?.delay).toBe(500)
    })
  })

  describe('createTestApiEngine', () => {
    it('应该创建测试环境的 API 引擎', () => {
      const engine = createTestApiEngine('http://test-api.example.com')
      engines.push(engine)

      expect(engine.config.debug).toBe(true)
      expect(engine.config.http?.baseURL).toBe('http://test-api.example.com')
      expect(engine.config.http?.timeout).toBe(5000)
      expect(engine.config.cache?.enabled).toBe(false)
      expect(engine.config.debounce?.enabled).toBe(false)
      expect(engine.config.deduplication?.enabled).toBe(false)
    })
  })

  describe('createApiEngineByEnv', () => {
    it('应该根据环境变量创建相应的引擎', () => {
      // 模拟开发环境
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const engine = createApiEngineByEnv('https://api.example.com')
      engines.push(engine)

      expect(engine.config.debug).toBe(true)
      expect(engine.config.cache?.enabled).toBe(false)

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })

    it('应该在生产环境中创建生产配置', () => {
      // 模拟生产环境
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const engine = createApiEngineByEnv('https://api.example.com')
      engines.push(engine)

      expect(engine.config.debug).toBe(false)
      expect(engine.config.cache?.enabled).toBe(true)

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('createSingletonApiEngine', () => {
    it('应该创建单例 API 引擎', () => {
      const config = {
        http: { baseURL: 'https://api.example.com' },
      }

      const engine1 = createSingletonApiEngine(config)
      const engine2 = createSingletonApiEngine()

      expect(engine1).toBe(engine2)
      expect(engine1.config.http?.baseURL).toBe('https://api.example.com')
    })

    it('应该能够销毁单例引擎', () => {
      const engine1 = createSingletonApiEngine({
        http: { baseURL: 'https://api.example.com' },
      })

      destroySingletonApiEngine()

      const engine2 = createSingletonApiEngine({
        http: { baseURL: 'https://api2.example.com' },
      })

      expect(engine1).not.toBe(engine2)
      expect(engine2.config.http?.baseURL).toBe('https://api2.example.com')
    })
  })

  describe('配置合并', () => {
    it('应该正确合并深层配置', () => {
      const engine = createApiEngineWithDefaults('https://api.example.com', {
        http: {
          headers: {
            Authorization: 'Bearer token',
          },
        },
        cache: {
          maxSize: 200,
        },
      })
      engines.push(engine)

      expect(engine.config.http?.baseURL).toBe('https://api.example.com')
      expect(engine.config.http?.timeout).toBe(10000) // 默认值
      expect(engine.config.http?.headers?.['Authorization']).toBe(
        'Bearer token'
      )
      expect(engine.config.cache?.enabled).toBe(true) // 默认值
      expect(engine.config.cache?.maxSize).toBe(200) // 覆盖值
    })
  })

  describe('错误处理', () => {
    it('应该在无效配置时使用默认值', () => {
      const engine = createApiEngine({
        // @ts-ignore - 故意传入无效配置进行测试
        http: null,
        cache: undefined,
      })
      engines.push(engine)

      expect(engine.config.http).toBeDefined()
      expect(engine.config.cache).toBeDefined()
    })
  })
})
