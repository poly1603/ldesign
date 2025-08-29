/**
 * NetworkManager 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { NetworkManager } from '../src/services/NetworkManager'
import { ProxyConfigBuilder, ProxyTemplates } from '../src/utils/proxy-helper'
import type { ProxyConfig, AliasConfig, CORSConfig } from '../src/types/network'

describe('NetworkManager', () => {
  let networkManager: NetworkManager

  beforeEach(() => {
    networkManager = new NetworkManager()
  })

  describe('代理配置', () => {
    it('应该能够配置基本代理', () => {
      const proxyConfig: ProxyConfig = {
        '/api': 'http://localhost:8080',
      }

      networkManager.configureProxy(proxyConfig)
      const config = networkManager.getProxyConfig()

      expect(config['/api']).toBe('http://localhost:8080')
    })

    it('应该能够配置详细代理规则', () => {
      const proxyConfig: ProxyConfig = {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        },
      }

      networkManager.configureProxy(proxyConfig)
      const config = networkManager.getProxyConfig()

      expect(config['/api']).toEqual({
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      })
    })

    it('应该能够添加和移除代理规则', () => {
      networkManager.addProxyRule('/api', 'http://localhost:8080')
      expect(networkManager.getProxyConfig()['/api']).toBe('http://localhost:8080')

      networkManager.removeProxyRule('/api')
      expect(networkManager.getProxyConfig()['/api']).toBeUndefined()
    })

    it('应该能够生成 Vite 代理配置', () => {
      const proxyConfig: ProxyConfig = {
        '/api': 'http://localhost:8080',
        '/ws': {
          target: 'ws://localhost:8081',
          ws: true,
        },
      }

      networkManager.configureProxy(proxyConfig)
      const viteConfig = networkManager.generateViteProxyConfig()

      expect(viteConfig['/api']).toEqual({
        target: 'http://localhost:8080',
        changeOrigin: true,
      })

      expect(viteConfig['/ws']).toEqual({
        target: 'ws://localhost:8081',
        changeOrigin: true,
        ws: true,
        secure: true,
      })
    })

    it('应该能够匹配代理规则', () => {
      const proxyConfig: ProxyConfig = {
        '/api/*': 'http://localhost:8080',
        '/static': 'http://localhost:8081',
      }

      networkManager.configureProxy(proxyConfig)

      const apiMatch = networkManager.matchProxyRule('/api/users')
      expect(apiMatch.matched).toBe(true)
      expect(apiMatch.pattern).toBe('/api/*')

      const staticMatch = networkManager.matchProxyRule('/static')
      expect(staticMatch.matched).toBe(true)
      expect(staticMatch.pattern).toBe('/static')

      const noMatch = networkManager.matchProxyRule('/other')
      expect(noMatch.matched).toBe(false)
    })
  })

  describe('别名配置', () => {
    it('应该能够配置路径别名', () => {
      const aliasConfig: AliasConfig = {
        '@': './src',
        '@components': './src/components',
      }

      networkManager.configureAlias(aliasConfig)
      const config = networkManager.getAliasConfig()

      expect(config['@']).toContain('src')
      expect(config['@components']).toContain('src/components')
    })

    it('应该能够解析别名路径', () => {
      const aliasConfig: AliasConfig = {
        '@': './src',
        '@components': './src/components',
      }

      networkManager.configureAlias(aliasConfig)

      const resolved1 = networkManager.resolveAlias('@/utils/helper.ts')
      expect(resolved1).toContain('src/utils/helper.ts')

      const resolved2 = networkManager.resolveAlias('@components/Button.vue')
      expect(resolved2).toContain('src/components/Button.vue')
    })

    it('应该能够添加和移除别名', () => {
      networkManager.addAlias('@utils', './src/utils')
      expect(networkManager.getAliasConfig()['@utils']).toContain('src/utils')

      networkManager.removeAlias('@utils')
      expect(networkManager.getAliasConfig()['@utils']).toBeUndefined()
    })

    it('应该能够生成 Vite 别名配置', () => {
      const aliasConfig: AliasConfig = {
        '@': './src',
        '~': './node_modules',
      }

      networkManager.configureAlias(aliasConfig)
      const viteConfig = networkManager.generateViteAliasConfig()

      expect(viteConfig['@']).toContain('src')
      expect(viteConfig['~']).toContain('node_modules')
    })

    it('应该能够提供详细的别名解析结果', () => {
      const aliasConfig: AliasConfig = {
        '@': './src',
      }

      networkManager.configureAlias(aliasConfig)

      const result = networkManager.resolveAliasDetailed('@/components/Button.vue')
      expect(result.resolved).toBe(true)
      expect(result.alias).toBe('@')
      expect(result.resolvedPath).toContain('src/components/Button.vue')

      const noAliasResult = networkManager.resolveAliasDetailed('./local/file.js')
      expect(noAliasResult.resolved).toBe(false)
      expect(noAliasResult.alias).toBeUndefined()
    })
  })

  describe('CORS 配置', () => {
    it('应该能够配置 CORS', () => {
      const corsConfig: CORSConfig = {
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST'],
      }

      networkManager.configureCORS(corsConfig)
      const config = networkManager.getCORSConfig()

      expect(config.origin).toBe('http://localhost:3000')
      expect(config.credentials).toBe(true)
      expect(config.methods).toEqual(['GET', 'POST'])
    })
  })

  describe('配置验证', () => {
    it('应该能够验证有效的网络配置', () => {
      const validConfig = {
        proxy: {
          '/api': 'http://localhost:8080',
        },
        alias: {
          '@': './src',
        },
        port: 3000,
        host: 'localhost',
      }

      const isValid = networkManager.validateConfig(validConfig)
      expect(isValid).toBe(true)
    })

    it('应该能够检测无效的网络配置', () => {
      const invalidConfig = {
        proxy: {
          '/api': 'invalid-url',
        },
        port: 99999, // 无效端口
      }

      const isValid = networkManager.validateConfig(invalidConfig)
      expect(isValid).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该能够跟踪代理和别名使用统计', () => {
      networkManager.configureAlias({ '@': './src' })
      
      // 触发一些别名解析
      networkManager.resolveAlias('@/component.vue')
      networkManager.resolveAlias('@/utils.ts')
      networkManager.resolveAlias('./local.js') // 不会匹配别名

      const stats = networkManager.getStats()
      expect(stats.alias.totalResolves).toBe(3)
      expect(stats.alias.successResolves).toBe(2)
    })
  })

  describe('重置功能', () => {
    it('应该能够重置所有配置', () => {
      networkManager.configureProxy({ '/api': 'http://localhost:8080' })
      networkManager.configureAlias({ '@': './src' })
      networkManager.configureCORS({ origin: 'http://localhost:3000' })

      networkManager.reset()

      const proxyConfig = networkManager.getProxyConfig()
      const aliasConfig = networkManager.getAliasConfig()
      const corsConfig = networkManager.getCORSConfig()

      expect(Object.keys(proxyConfig)).toHaveLength(0)
      // 别名配置应该有默认值
      expect(aliasConfig['@']).toBeDefined()
      expect(corsConfig.origin).toBe(true) // 默认 CORS 配置
    })
  })
})

describe('ProxyConfigBuilder', () => {
  it('应该能够构建代理配置', () => {
    const config = new ProxyConfigBuilder()
      .api('http://localhost:8080', '/api')
      .static('http://localhost:8081', '/static')
      .websocket('ws://localhost:8082', '/ws')
      .build()

    expect(config['/api']).toEqual({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })

    expect(config['/static']).toEqual({
      target: 'http://localhost:8081',
      changeOrigin: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    })

    expect(config['/ws']).toEqual({
      target: 'ws://localhost:8082',
      changeOrigin: true,
      ws: true,
      timeout: 30000,
    })
  })

  it('应该能够添加多个服务', () => {
    const config = new ProxyConfigBuilder()
      .services({
        'user': 'http://localhost:8001',
        'order': 'http://localhost:8002',
      })
      .build()

    expect(config['/user']).toEqual({
      target: 'http://localhost:8001',
      changeOrigin: true,
      pathRewrite: {
        '^/user': '',
      },
    })

    expect(config['/order']).toEqual({
      target: 'http://localhost:8002',
      changeOrigin: true,
      pathRewrite: {
        '^/order': '',
      },
    })
  })
})

describe('ProxyTemplates', () => {
  it('应该能够生成 API 代理模板', () => {
    const config = ProxyTemplates.api('http://localhost:8080', '/api')

    expect(config['/api']).toEqual({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      headers: {
        'X-Forwarded-For': '$remote_addr',
        'X-Forwarded-Proto': '$scheme',
      },
    })
  })

  it('应该能够生成微服务代理模板', () => {
    const services = {
      'user': 'http://localhost:8001',
      'order': 'http://localhost:8002',
    }

    const config = ProxyTemplates.microservice(services)

    expect(config['/user']).toBeDefined()
    expect(config['/order']).toBeDefined()
    expect(config['/user'].target).toBe('http://localhost:8001')
    expect(config['/order'].target).toBe('http://localhost:8002')
  })
})
