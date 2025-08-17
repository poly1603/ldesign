import type { ConfigManager, ConfigSchema } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createConfigManager, defaultConfigSchema } from '../src/config/config-manager'

describe('configManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = createConfigManager()
  })

  describe('基础操作', () => {
    it('应该能够设置和获取配置值', () => {
      configManager.set('test.key', 'value')
      expect(configManager.get('test.key')).toBe('value')
    })

    it('应该能够检查配置是否存在', () => {
      configManager.set('exists', true)
      expect(configManager.has('exists')).toBe(true)
      expect(configManager.has('notExists')).toBe(false)
    })

    it('应该能够删除配置', () => {
      configManager.set('toDelete', 'value')
      expect(configManager.has('toDelete')).toBe(true)

      configManager.remove('toDelete')
      expect(configManager.has('toDelete')).toBe(false)
    })

    it('应该能够清空所有配置', () => {
      configManager.set('key1', 'value1')
      configManager.set('key2', 'value2')

      configManager.clear()
      expect(configManager.has('key1')).toBe(false)
      expect(configManager.has('key2')).toBe(false)
    })
  })

  describe('嵌套配置', () => {
    it('应该能够处理嵌套路径', () => {
      configManager.set('app.name', 'Test App')
      configManager.set('app.version', '1.0.0')

      expect(configManager.get('app.name')).toBe('Test App')
      expect(configManager.get('app.version')).toBe('1.0.0')
    })

    it('应该能够获取嵌套对象', () => {
      configManager.set('database.host', 'localhost')
      configManager.set('database.port', 5432)

      const database = configManager.get('database')
      expect(database).toEqual({
        host: 'localhost',
        port: 5432,
      })
    })
  })

  describe('配置合并', () => {
    it('应该能够合并配置对象', () => {
      configManager.set('app.name', 'Original App')
      configManager.set('app.version', '1.0.0')

      configManager.merge({
        app: {
          name: 'Updated App',
          description: 'Test Description',
        },
        newKey: 'newValue',
      })

      expect(configManager.get('app.name')).toBe('Updated App')
      expect(configManager.get('app.version')).toBe('1.0.0') // 保持原值
      expect(configManager.get('app.description')).toBe('Test Description')
      expect(configManager.get('newKey')).toBe('newValue')
    })
  })

  describe('配置监听', () => {
    it('应该能够监听配置变化', () => {
      const callback = vi.fn()

      configManager.watch('test.key', callback)
      configManager.set('test.key', 'new value')

      expect(callback).toHaveBeenCalledWith('new value', undefined, 'test.key')
    })

    it('应该能够取消监听', () => {
      const callback = vi.fn()

      const unwatch = configManager.watch('test.key', callback)
      configManager.set('test.key', 'value1')

      unwatch()
      configManager.set('test.key', 'value2')

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('配置验证', () => {
    it('应该能够验证配置Schema', () => {
      const schema: ConfigSchema = {
        app: {
          type: 'object',
          required: true,
          children: {
            name: {
              type: 'string',
              required: true,
            },
            version: {
              type: 'string',
              required: true,
            },
          },
        },
      }

      configManager.setSchema(schema)

      // 有效配置
      configManager.set('app.name', 'Test App')
      configManager.set('app.version', '1.0.0')

      const validation = configManager.validate()
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('应该能够检测无效配置', () => {
      const schema: ConfigSchema = {
        port: {
          type: 'number',
          required: true,
        },
      }

      configManager.setSchema(schema)

      // 设置无效类型
      expect(() => {
        configManager.set('port', 'invalid')
      }).toThrow()
    })
  })

  describe('环境管理', () => {
    it('应该能够设置和获取环境', () => {
      configManager.setEnvironment('production')
      expect(configManager.getEnvironment()).toBe('production')
    })

    it('应该能够检测默认环境', () => {
      // 在测试环境中，环境应该被检测为 'test'
      expect(configManager.getEnvironment()).toBe('test')
    })
  })

  describe('配置快照', () => {
    it('应该能够创建配置快照', () => {
      configManager.set('test.key', 'value')

      const snapshot = configManager.createSnapshot()
      expect(snapshot.config).toEqual({
        test: { key: 'value' },
      })
      expect(snapshot.timestamp).toBeTypeOf('number')
    })

    it('应该能够恢复配置快照', () => {
      configManager.set('original.key', 'original')
      const snapshot = configManager.createSnapshot()

      configManager.set('original.key', 'modified')
      configManager.set('new.key', 'new')

      configManager.restoreSnapshot(snapshot)

      expect(configManager.get('original.key')).toBe('original')
      expect(configManager.has('new.key')).toBe(false)
    })
  })

  describe('命名空间', () => {
    it('应该能够创建命名空间配置管理器', () => {
      const appConfig = configManager.namespace('app')

      appConfig.set('name', 'Test App')
      appConfig.set('version', '1.0.0')

      expect(configManager.get('app.name')).toBe('Test App')
      expect(configManager.get('app.version')).toBe('1.0.0')
      expect(appConfig.get('name')).toBe('Test App')
    })

    it('命名空间应该能够独立清理', () => {
      const appConfig = configManager.namespace('app')
      const dbConfig = configManager.namespace('database')

      appConfig.set('name', 'Test App')
      dbConfig.set('host', 'localhost')

      appConfig.clear()

      expect(configManager.has('app.name')).toBe(false)
      expect(configManager.has('database.host')).toBe(true)
    })
  })

  describe('默认配置Schema', () => {
    it('应该包含必要的配置字段', () => {
      expect(defaultConfigSchema.app).toBeDefined()
      expect(defaultConfigSchema.environment).toBeDefined()
      expect(defaultConfigSchema.debug).toBeDefined()
      expect(defaultConfigSchema.features).toBeDefined()
    })

    it('应该有正确的默认值', () => {
      configManager.setSchema(defaultConfigSchema)
      configManager.reset()

      expect(configManager.get('app.name')).toBe('Vue Engine App')
      expect(configManager.get('environment')).toBe('development')
      expect(configManager.get('debug')).toBe(true)
    })
  })

  describe('配置统计', () => {
    it('应该能够获取配置统计信息', () => {
      configManager.set('key1', 'value1')
      configManager.set('key2.nested', 'value2')

      const stats = configManager.getStats()
      expect(stats.totalKeys).toBeGreaterThan(0)
      expect(stats.watchers).toBe(0)
      expect(stats.memoryUsage).toMatch(/\d+\.\d+ KB/)
    })
  })
})
