/**
 * 配置管理器单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ConfigManager } from '../../src/core/config-manager'
import type { WebSocketConfig } from '../../src/types'

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = new ConfigManager()
  })

  describe('构造函数和初始化', () => {
    it('应该使用默认配置创建配置管理器', () => {
      const config = configManager.getConfig()

      expect(config.url).toBe('')
      expect(config.connectionTimeout).toBe(10000)
      expect(config.logLevel).toBe('info')
      expect(config.debug).toBe(false)
      expect(config.reconnect.enabled).toBe(true)
      expect(config.heartbeat.enabled).toBe(true)
      expect(config.messageQueue.enabled).toBe(true)
    })

    it('应该合并初始配置', () => {
      const initialConfig: Partial<WebSocketConfig> = {
        url: 'ws://localhost:8080',
        debug: true,
        logLevel: 'debug'
      }

      const manager = new ConfigManager(initialConfig)
      const config = manager.getConfig()

      expect(config.url).toBe('ws://localhost:8080')
      expect(config.debug).toBe(true)
      expect(config.logLevel).toBe('debug')
      expect(config.connectionTimeout).toBe(10000) // 默认值保持
    })

    it('应该验证初始配置', () => {
      expect(() => {
        new ConfigManager({ url: 'invalid-url' })
      }).toThrow('无效的WebSocket URL')
    })
  })

  describe('配置获取', () => {
    beforeEach(() => {
      configManager = new ConfigManager({
        url: 'ws://localhost:8080',
        debug: true,
        reconnect: {
          enabled: true,
          maxAttempts: 10
        }
      })
    })

    it('应该获取完整配置', () => {
      const config = configManager.getConfig()

      expect(config.url).toBe('ws://localhost:8080')
      expect(config.debug).toBe(true)
      expect(config.reconnect.maxAttempts).toBe(10)
    })

    it('应该获取指定配置项', () => {
      expect(configManager.get('url')).toBe('ws://localhost:8080')
      expect(configManager.get('debug')).toBe(true)
      expect(configManager.get('reconnect.maxAttempts')).toBe(10)
      expect(configManager.get('reconnect.enabled')).toBe(true)
    })

    it('应该返回配置的深拷贝', () => {
      const config1 = configManager.getConfig()
      const config2 = configManager.getConfig()

      expect(config1).not.toBe(config2)
      expect(config1.reconnect).not.toBe(config2.reconnect)
      expect(config1).toEqual(config2)
    })
  })

  describe('配置设置', () => {
    it('应该设置简单配置项', () => {
      const configChangedSpy = vi.fn()
      configManager.on('configChanged', configChangedSpy)

      configManager.set('debug', true)

      expect(configManager.get('debug')).toBe(true)
      expect(configChangedSpy).toHaveBeenCalledWith({
        key: 'debug',
        oldValue: false,
        newValue: true,
        config: expect.any(Object)
      })
    })

    it('应该设置嵌套配置项', () => {
      configManager.set('reconnect.maxAttempts', 15)

      expect(configManager.get('reconnect.maxAttempts')).toBe(15)
      expect(configManager.get('reconnect.enabled')).toBe(true) // 其他值不变
    })

    it('应该验证配置值', () => {
      expect(() => {
        configManager.set('url', 'invalid-url')
      }).toThrow('配置验证失败')
    })

    it('应该支持跳过验证', () => {
      expect(() => {
        configManager.set('url', 'invalid-url', false)
      }).not.toThrow()

      expect(configManager.get('url')).toBe('invalid-url')
    })
  })

  describe('批量配置更新', () => {
    it('应该批量更新配置', () => {
      const updates: Partial<WebSocketConfig> = {
        url: 'ws://localhost:8080',
        debug: true,
        logLevel: 'debug',
        reconnect: {
          enabled: true,
          maxAttempts: 20
        }
      }

      configManager.update(updates)

      expect(configManager.get('url')).toBe('ws://localhost:8080')
      expect(configManager.get('debug')).toBe(true)
      expect(configManager.get('logLevel')).toBe('debug')
      expect(configManager.get('reconnect.maxAttempts')).toBe(20)
    })

    it('应该触发配置变更事件', () => {
      const configChangedSpy = vi.fn()
      configManager.on('configChanged', configChangedSpy)

      configManager.update({
        debug: true,
        logLevel: 'debug'
      })

      expect(configChangedSpy).toHaveBeenCalledTimes(2)
    })

    it('应该验证批量更新的配置', () => {
      expect(() => {
        configManager.update({
          url: 'invalid-url',
          connectionTimeout: -1000
        })
      }).toThrow()
    })
  })

  describe('配置重置', () => {
    beforeEach(() => {
      configManager.update({
        url: 'ws://localhost:8080',
        debug: true,
        logLevel: 'debug',
        reconnect: {
          enabled: false,
          maxAttempts: 20
        }
      })
    })

    it('应该重置所有配置', () => {
      const configResetSpy = vi.fn()
      configManager.on('configReset', configResetSpy)

      configManager.reset()

      expect(configManager.get('url')).toBe('')
      expect(configManager.get('debug')).toBe(false)
      expect(configManager.get('logLevel')).toBe('info')
      expect(configManager.get('reconnect.enabled')).toBe(true)
      expect(configManager.get('reconnect.maxAttempts')).toBe(5)

      expect(configResetSpy).toHaveBeenCalledWith({
        oldConfig: expect.any(Object),
        newConfig: expect.any(Object)
      })
    })

    it('应该重置指定配置', () => {
      configManager.reset(['debug', 'logLevel'])

      expect(configManager.get('debug')).toBe(false)
      expect(configManager.get('logLevel')).toBe('info')
      expect(configManager.get('url')).toBe('ws://localhost:8080') // 不变
      expect(configManager.get('reconnect.enabled')).toBe(false) // 不变
    })
  })

  describe('配置验证器', () => {
    it('应该注册自定义验证器', () => {
      configManager.registerValidator('customField', {
        validate: (value: any) => {
          if (typeof value !== 'string') {
            return '必须是字符串'
          }
          return true
        }
      })

      expect(() => {
        configManager.set('customField', 123)
      }).toThrow('必须是字符串')

      expect(() => {
        configManager.set('customField', 'valid')
      }).not.toThrow()
    })

    it('应该移除验证器', () => {
      configManager.registerValidator('testField', {
        validate: () => '总是失败'
      })

      expect(() => {
        configManager.set('testField', 'value')
      }).toThrow('总是失败')

      configManager.removeValidator('testField')

      expect(() => {
        configManager.set('testField', 'value')
      }).not.toThrow()
    })

    it('应该触发验证失败事件', () => {
      const validationFailedSpy = vi.fn()
      configManager.on('configValidationFailed', validationFailedSpy)

      expect(() => {
        configManager.set('url', 'invalid')
      }).toThrow()

      expect(validationFailedSpy).toHaveBeenCalledWith({
        key: 'url',
        value: 'invalid',
        error: expect.any(String)
      })
    })
  })

  describe('内置验证器', () => {
    it('应该验证URL', () => {
      expect(() => {
        configManager.set('url', 'invalid-url')
      }).toThrow('无效的URL格式')

      expect(() => {
        configManager.set('url', 'ws://localhost:8080')
      }).not.toThrow()

      expect(() => {
        configManager.set('url', '')
      }).not.toThrow() // 空字符串是允许的
    })

    it('应该验证日志级别', () => {
      expect(() => {
        configManager.set('logLevel', 'invalid' as any)
      }).toThrow('无效的日志级别')

      expect(() => {
        configManager.set('logLevel', 'debug')
      }).not.toThrow()
    })

    it('应该验证连接超时', () => {
      expect(() => {
        configManager.set('connectionTimeout', -1000)
      }).toThrow('连接超时必须是大于0的数字')

      expect(() => {
        configManager.set('connectionTimeout', 'invalid' as any)
      }).toThrow('连接超时必须是大于0的数字')

      expect(() => {
        configManager.set('connectionTimeout', 5000)
      }).not.toThrow()
    })
  })

  describe('配置验证', () => {
    it('应该验证重连配置', () => {
      expect(() => {
        new ConfigManager({
          url: 'ws://localhost:8080',
          reconnect: {
            enabled: true,
            strategy: 'exponential',
            initialDelay: -1000,
            maxDelay: 30000,
            maxAttempts: 5,
            backoffMultiplier: 2,
            jitter: 1000
          }
        })
      }).toThrow('初始重连延迟必须大于0')
    })

    it('应该验证心跳配置', () => {
      expect(() => {
        new ConfigManager({
          url: 'ws://localhost:8080',
          heartbeat: {
            enabled: true,
            interval: -1000,
            timeout: 5000,
            message: 'ping',
            messageType: 'text',
            maxFailures: 3
          }
        })
      }).toThrow('心跳间隔必须大于0')
    })

    it('应该验证消息队列配置', () => {
      expect(() => {
        new ConfigManager({
          url: 'ws://localhost:8080',
          messageQueue: {
            enabled: true,
            maxSize: -100,
            persistent: false,
            storageKey: 'test',
            messageExpiry: 300000,
            deduplication: true
          }
        })
      }).toThrow('消息队列最大大小必须大于0')
    })
  })

  describe('嵌套路径处理', () => {
    it('应该正确处理深层嵌套路径', () => {
      configManager.set('reconnect.strategy', 'linear')
      expect(configManager.get('reconnect.strategy')).toBe('linear')

      configManager.set('heartbeat.message', 'custom-ping')
      expect(configManager.get('heartbeat.message')).toBe('custom-ping')
    })

    it('应该处理不存在的路径', () => {
      expect(configManager.get('nonexistent.path')).toBeUndefined()
    })

    it('应该创建新的嵌套对象', () => {
      configManager.set('new.nested.value', 'test')
      expect(configManager.get('new.nested.value')).toBe('test')
    })
  })
})
