/**
 * 配置管理器测试
 */

import type { TemplateSystemConfig } from '../src/types/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getConfigManager, resetConfigManager, TemplateConfigManager } from '../src/config/config-manager'
import { defaultConfig } from '../src/config/default.config'

describe('templateConfigManager', () => {
  let configManager: TemplateConfigManager
  let mockConfig: Partial<TemplateSystemConfig>

  beforeEach(() => {
    // 重置全局配置管理器
    resetConfigManager()

    // 创建测试配置
    mockConfig = {
      templatesDir: 'test/templates',
      autoScan: true,
      enableHMR: false,
      defaultDevice: 'desktop',
      debug: true,
      cache: {
        enabled: true,
        strategy: 'lru',
        maxSize: 50,
        ttl: 30 * 60 * 1000,
      },
      scanner: {
        maxDepth: 3,
        includeExtensions: ['.vue'],
        excludePatterns: ['test'],
        enableCache: true,
        watchMode: false,
        debounceDelay: 200,
        batchSize: 5,
      },
    }

    configManager = new TemplateConfigManager(mockConfig)
  })

  afterEach(() => {
    configManager.destroy()
    resetConfigManager()
  })

  describe('构造函数', () => {
    it('应该使用默认配置创建管理器', () => {
      const defaultManager = new TemplateConfigManager()
      const config = defaultManager.getConfig()

      expect(config.templatesDir).toBe(defaultConfig.templatesDir)
      expect(config.autoScan).toBe(defaultConfig.autoScan)
      expect(config.enableHMR).toBe(defaultConfig.enableHMR)
    })

    it('应该合并自定义配置', () => {
      const config = configManager.getConfig()

      expect(config.templatesDir).toBe('test/templates')
      expect(config.autoScan).toBe(true)
      expect(config.enableHMR).toBe(false)
      expect(config.debug).toBe(true)
    })

    it('应该深度合并嵌套配置', () => {
      const config = configManager.getConfig()

      expect(config.cache.enabled).toBe(true)
      expect(config.cache.strategy).toBe('lru')
      expect(config.cache.maxSize).toBe(50)
      expect(config.scanner.maxDepth).toBe(3)
      expect(config.scanner.includeExtensions).toEqual(['.vue'])
    })
  })

  describe('配置获取', () => {
    it('应该能够获取完整配置', () => {
      const config = configManager.getConfig()

      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
      expect(config.templatesDir).toBeDefined()
      expect(config.cache).toBeDefined()
      expect(config.scanner).toBeDefined()
    })

    it('应该能够获取嵌套配置值', () => {
      const cacheEnabled = configManager.get('cache.enabled')
      const scannerMaxDepth = configManager.get('scanner.maxDepth')
      const templatesDir = configManager.get('templatesDir')

      expect(cacheEnabled).toBe(true)
      expect(scannerMaxDepth).toBe(3)
      expect(templatesDir).toBe('test/templates')
    })

    it('应该返回undefined对于不存在的配置路径', () => {
      const nonExistent = configManager.get('nonexistent.path')
      expect(nonExistent).toBeUndefined()
    })
  })

  describe('配置更新', () => {
    it('应该能够更新单个配置值', () => {
      configManager.set('templatesDir', 'new/templates')

      const updatedValue = configManager.get('templatesDir')
      expect(updatedValue).toBe('new/templates')
    })

    it('应该能够更新嵌套配置值', () => {
      configManager.set('cache.maxSize', 100)
      configManager.set('scanner.maxDepth', 5)

      expect(configManager.get('cache.maxSize')).toBe(100)
      expect(configManager.get('scanner.maxDepth')).toBe(5)
    })

    it('应该能够批量更新配置', () => {
      const updates = {
        templatesDir: 'batch/templates',
        debug: false,
        cache: {
          enabled: false,
          maxSize: 200,
        },
      }

      configManager.updateConfig(updates)

      expect(configManager.get('templatesDir')).toBe('batch/templates')
      expect(configManager.get('debug')).toBe(false)
      expect(configManager.get('cache.enabled')).toBe(false)
      expect(configManager.get('cache.maxSize')).toBe(200)
    })

    it('应该触发配置更新事件', () => {
      const updateListener = vi.fn()
      configManager.addListener(updateListener)

      configManager.set('templatesDir', 'event/templates')

      expect(updateListener).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'templatesDir',
          oldValue: 'test/templates',
          newValue: 'event/templates',
          timestamp: expect.any(Number),
        }),
      )
    })
  })

  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      const validConfig = {
        templatesDir: 'valid/templates',
        autoScan: true,
        enableHMR: false,
      }

      const result = configManager.validateConfig(validConfig)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效配置', () => {
      const invalidConfig = {
        templatesDir: '', // 空字符串无效
        autoScan: 'invalid', // 应该是布尔值
        cache: {
          maxSize: -1, // 负数无效
        },
      }

      const result = configManager.validateConfig(invalidConfig as any)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该提供修复建议', () => {
      const invalidConfig = {
        templatesDir: '',
        cache: {
          maxSize: -1,
        },
      }

      const result = configManager.validateConfig(invalidConfig as any)

      expect(result.fixedConfig).toBeDefined()
      expect(result.fixedConfig?.templatesDir).toBe(defaultConfig.templatesDir)
    })
  })

  describe('环境变量支持', () => {
    beforeEach(() => {
      // 设置测试环境变量
      process.env.TEMPLATE_TEMPLATES_DIR = 'env/templates'
      process.env.TEMPLATE_CACHE_ENABLED = 'false'
      process.env.TEMPLATE_DEBUG = 'true'
    })

    afterEach(() => {
      // 清理环境变量
      delete process.env.TEMPLATE_TEMPLATES_DIR
      delete process.env.TEMPLATE_CACHE_ENABLED
      delete process.env.TEMPLATE_DEBUG
    })

    it('应该从环境变量加载配置', () => {
      const envManager = new TemplateConfigManager()
      const config = envManager.getConfig()

      expect(config.templatesDir).toBe('env/templates')
      expect(config.cache.enabled).toBe(false)
      expect(config.debug).toBe(true)
    })

    it('应该优先使用显式配置而不是环境变量', () => {
      const explicitConfig = {
        templatesDir: 'explicit/templates',
        debug: false,
      }

      const manager = new TemplateConfigManager(explicitConfig)
      const config = manager.getConfig()

      expect(config.templatesDir).toBe('explicit/templates')
      expect(config.debug).toBe(false)
    })
  })

  describe('事件监听', () => {
    it('应该能够添加和移除监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const unsubscribe1 = configManager.addListener(listener1)
      const unsubscribe2 = configManager.addListener(listener2)

      configManager.set('debug', false)

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()

      // 移除监听器
      unsubscribe1()
      vi.clearAllMocks()

      configManager.set('autoScan', false)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()

      unsubscribe2()
    })

    it('应该能够移除所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      configManager.addListener(listener1)
      configManager.addListener(listener2)

      configManager.removeAllListeners()

      configManager.set('debug', false)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('全局配置管理器', () => {
    it('应该返回单例实例', () => {
      const manager1 = getConfigManager()
      const manager2 = getConfigManager()

      expect(manager1).toBe(manager2)
    })

    it('应该能够重置全局实例', () => {
      const manager1 = getConfigManager()
      resetConfigManager()
      const manager2 = getConfigManager()

      expect(manager1).not.toBe(manager2)
    })

    it('应该使用初始配置创建全局实例', () => {
      const initialConfig = {
        templatesDir: 'global/templates',
        debug: true,
      }

      const manager = getConfigManager(initialConfig)
      const config = manager.getConfig()

      expect(config.templatesDir).toBe('global/templates')
      expect(config.debug).toBe(true)
    })
  })

  describe('配置持久化', () => {
    it('应该能够导出配置', () => {
      const exportedConfig = configManager.exportConfig()

      expect(exportedConfig).toBeDefined()
      expect(typeof exportedConfig).toBe('string')
      expect(() => JSON.parse(exportedConfig)).not.toThrow()
    })

    it('应该能够导入配置', () => {
      const originalConfig = configManager.getConfig()
      const exportedConfig = configManager.exportConfig()

      // 修改配置
      configManager.set('templatesDir', 'modified/templates')

      // 导入原始配置
      configManager.importConfig(exportedConfig)

      const restoredConfig = configManager.getConfig()
      expect(restoredConfig.templatesDir).toBe(originalConfig.templatesDir)
    })

    it('应该处理无效的导入数据', () => {
      expect(() => {
        configManager.importConfig('invalid json')
      }).toThrow()

      expect(() => {
        configManager.importConfig('{"invalid": "config"}')
      }).toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速处理大量配置更新', () => {
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        configManager.set(`test.key${i}`, `value${i}`)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 1秒内完成
    })

    it('应该高效处理大量监听器', () => {
      const listeners = Array.from({ length: 100 }, () => vi.fn())

      listeners.forEach((listener) => {
        configManager.addListener(listener)
      })

      const startTime = Date.now()
      configManager.set('test.performance', 'value')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100) // 100ms内完成
      expect(listeners.every(listener => listener.mock.calls.length === 1)).toBe(true)
    })
  })
})
