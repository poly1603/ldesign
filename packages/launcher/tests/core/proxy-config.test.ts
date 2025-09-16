/**
 * 代理配置处理工具测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest'
import { ProxyConfigProcessor, createProxyConfig, validateProxy } from '../../src/utils/proxy-config'
import type { SimpleProxyConfig } from '../../src/utils/proxy-config'

describe('ProxyConfigProcessor', () => {
  describe('transformSimpleConfig', () => {
    it('应该正确转换 API 代理配置', () => {
      const simpleConfig: SimpleProxyConfig = {
        api: {
          target: 'http://localhost:8080',
          pathPrefix: '/api',
          rewrite: true,
          headers: {
            'X-Forwarded-Host': 'localhost'
          },
          timeout: 5000
        }
      }

      const result = ProxyConfigProcessor.transformSimpleConfig(simpleConfig)

      expect(result).toHaveProperty('/api')
      expect(result['/api']).toMatchObject({
        target: 'http://localhost:8080',
        changeOrigin: true,
        headers: {
          'X-Forwarded-Host': 'localhost'
        },
        timeout: 5000
      })
      expect(result['/api']).toHaveProperty('rewrite')
      expect(result['/api']).toHaveProperty('configure')
    })

    it('应该正确转换静态资源代理配置', () => {
      const simpleConfig: SimpleProxyConfig = {
        assets: {
          target: 'http://localhost:9000',
          pathPrefix: '/assets',
          cache: {
            maxAge: 3600,
            etag: true
          }
        }
      }

      const result = ProxyConfigProcessor.transformSimpleConfig(simpleConfig)

      expect(result).toHaveProperty('/assets')
      expect(result['/assets']).toMatchObject({
        target: 'http://localhost:9000',
        changeOrigin: true
      })
      expect(result['/assets']).toHaveProperty('configure')
    })

    it('应该正确转换 WebSocket 代理配置', () => {
      const simpleConfig: SimpleProxyConfig = {
        websocket: {
          target: 'http://localhost:8080',
          pathPrefix: '/ws'
        }
      }

      const result = ProxyConfigProcessor.transformSimpleConfig(simpleConfig)

      expect(result).toHaveProperty('/ws')
      expect(result['/ws']).toMatchObject({
        target: 'ws://localhost:8080',
        changeOrigin: true,
        ws: true
      })
    })

    it('应该正确转换自定义代理规则', () => {
      const simpleConfig: SimpleProxyConfig = {
        custom: [
          {
            path: '/custom',
            target: 'http://localhost:7000',
            options: {
              secure: false,
              timeout: 10000
            }
          }
        ]
      }

      const result = ProxyConfigProcessor.transformSimpleConfig(simpleConfig)

      expect(result).toHaveProperty('/custom')
      expect(result['/custom']).toMatchObject({
        target: 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
        timeout: 10000
      })
    })

    it('应该处理复合配置', () => {
      const simpleConfig: SimpleProxyConfig = {
        api: {
          target: 'http://localhost:8080'
        },
        assets: {
          target: 'http://localhost:9000'
        },
        websocket: {
          target: 'ws://localhost:8080'
        }
      }

      const result = ProxyConfigProcessor.transformSimpleConfig(simpleConfig)

      expect(Object.keys(result)).toHaveLength(3)
      expect(result).toHaveProperty('/api')
      expect(result).toHaveProperty('/assets')
      expect(result).toHaveProperty('/ws')
    })
  })

  describe('validateProxyConfig', () => {
    it('应该验证有效的代理配置', () => {
      const config = {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }

      const result = ProxyConfigProcessor.validateProxyConfig(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的目标地址', () => {
      const config = {
        '/api': {
          target: 'invalid-url',
          changeOrigin: true
        }
      }

      const result = ProxyConfigProcessor.validateProxyConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('代理规则 "/api" 的目标地址格式无效: invalid-url')
    })

    it('应该检测缺少目标地址', () => {
      const config = {
        '/api': {
          changeOrigin: true
        }
      }

      const result = ProxyConfigProcessor.validateProxyConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('代理规则 "/api" 缺少有效的目标地址')
    })

    it('应该生成警告信息', () => {
      const config = {
        '/ws': {
          target: 'http://localhost:8080',
          ws: true
        },
        '/secure': {
          target: 'https://localhost:8080',
          secure: false
        }
      }

      const result = ProxyConfigProcessor.validateProxyConfig(config)

      expect(result.warnings).toContain('代理规则 "/ws" 启用了 WebSocket 但目标地址不是 ws:// 协议')
      expect(result.warnings).toContain('代理规则 "/secure" 禁用了安全验证但目标是 HTTPS')
    })

    it('应该处理非对象配置', () => {
      const result = ProxyConfigProcessor.validateProxyConfig(null)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('代理配置必须是一个对象')
    })
  })

  describe('mergeProxyConfigs', () => {
    it('应该合并代理配置', () => {
      const baseConfig = {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }

      const overrideConfig = {
        '/api': {
          timeout: 5000
        },
        '/assets': {
          target: 'http://localhost:9000',
          changeOrigin: true
        }
      }

      const result = ProxyConfigProcessor.mergeProxyConfigs(baseConfig, overrideConfig)

      expect(result['/api']).toMatchObject({
        target: 'http://localhost:8080',
        changeOrigin: true,
        timeout: 5000
      })
      expect(result['/assets']).toMatchObject({
        target: 'http://localhost:9000',
        changeOrigin: true
      })
    })

    it('应该处理空配置', () => {
      const result1 = ProxyConfigProcessor.mergeProxyConfigs(null, { '/api': { target: 'http://localhost:8080' } })
      const result2 = ProxyConfigProcessor.mergeProxyConfigs({ '/api': { target: 'http://localhost:8080' } }, null)
      const result3 = ProxyConfigProcessor.mergeProxyConfigs(null, null)

      expect(result1).toEqual({ '/api': { target: 'http://localhost:8080' } })
      expect(result2).toEqual({ '/api': { target: 'http://localhost:8080' } })
      expect(result3).toEqual({})
    })
  })

  describe('generateExample', () => {
    it('应该生成简单配置示例', () => {
      const example = ProxyConfigProcessor.generateExample('simple')

      expect(example).toHaveProperty('api')
      expect(example).toHaveProperty('assets')
      expect(example).toHaveProperty('websocket')
    })

    it('应该生成高级配置示例', () => {
      const example = ProxyConfigProcessor.generateExample('advanced')

      expect(example).toHaveProperty('/api')
      expect(example).toHaveProperty('/upload')
      expect(example).toHaveProperty('^/ws/.*')
    })
  })
})

describe('createProxyConfig', () => {
  it('应该创建代理配置', () => {
    const simpleConfig: SimpleProxyConfig = {
      api: {
        target: 'http://localhost:8080'
      }
    }

    const result = createProxyConfig(simpleConfig)

    expect(result).toHaveProperty('/api')
    expect(result['/api']).toMatchObject({
      target: 'http://localhost:8080',
      changeOrigin: true
    })
  })
})

describe('validateProxy', () => {
  it('应该验证代理配置', () => {
    const config = {
      '/api': {
        target: 'http://localhost:8080'
      }
    }

    const result = validateProxy(config)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
