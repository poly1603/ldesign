import type { StorageStrategyConfig } from '../../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { StorageStrategy } from '../../src/strategies/storage-strategy'

describe('storageStrategy', () => {
  let strategy: StorageStrategy

  beforeEach(() => {
    const config: Partial<StorageStrategyConfig> = {
      enabled: true,
      sizeThresholds: {
        small: 1024, // 1KB
        medium: 64 * 1024, // 64KB
        large: 1024 * 1024, // 1MB
      },
      ttlThresholds: {
        short: 5 * 60 * 1000, // 5分钟
        medium: 24 * 60 * 60 * 1000, // 24小时
        long: 7 * 24 * 60 * 60 * 1000, // 7天
      },
      enginePriority: [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'memory',
        'cookie',
      ],
    }
    strategy = new StorageStrategy(config)
  })

  describe('基于大小的策略', () => {
    it('小数据应该选择 localStorage', async () => {
      const smallData = 'small'
      const result = await strategy.selectEngine('test-key', smallData)

      expect(result.engine).toBe('localStorage')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.reason).toContain('localStorage')
    })

    it('中等数据应该选择合适的引擎', async () => {
      const mediumData = 'x'.repeat(10 * 1024) // 10KB
      const result = await strategy.selectEngine('test-key', mediumData)

      expect(['localStorage', 'sessionStorage', 'indexedDB']).toContain(
        result.engine,
      )
    })

    it('大数据应该选择 IndexedDB', async () => {
      const largeData = 'x'.repeat(500 * 1024) // 500KB
      const result = await strategy.selectEngine('test-key', largeData)

      expect(result.engine).toBe('indexedDB')
    })
  })

  describe('基于 TTL 的策略', () => {
    it('短期缓存应该选择内存', async () => {
      const data = 'test data'
      const shortTTL = 1000 // 1秒

      const result = await strategy.selectEngine('test-key', data, {
        ttl: shortTTL,
      })

      expect(result.engine).toBe('memory')
    })

    it('中期缓存应该选择 sessionStorage', async () => {
      const data = 'test data'
      const mediumTTL = 2 * 60 * 60 * 1000 // 2小时

      const result = await strategy.selectEngine('test-key', data, {
        ttl: mediumTTL,
      })

      expect(['sessionStorage', 'localStorage']).toContain(result.engine)
    })

    it('长期缓存应该选择 localStorage', async () => {
      const data = 'test data'
      const longTTL = 30 * 24 * 60 * 60 * 1000 // 30天

      const result = await strategy.selectEngine('test-key', data, {
        ttl: longTTL,
      })

      expect(['localStorage', 'indexedDB']).toContain(result.engine)
    })

    it('无过期时间应该选择持久化存储', async () => {
      const data = 'persistent data'

      const result = await strategy.selectEngine('test-key', data)

      expect(['localStorage', 'indexedDB']).toContain(result.engine)
    })
  })

  describe('基于数据类型的策略', () => {
    it('简单类型应该选择 localStorage', async () => {
      const stringData = 'simple string'
      const numberData = 42
      const booleanData = true

      const stringResult = await strategy.selectEngine('string-key', stringData)
      const numberResult = await strategy.selectEngine('number-key', numberData)
      const booleanResult = await strategy.selectEngine(
        'boolean-key',
        booleanData,
      )

      expect(['localStorage', 'sessionStorage']).toContain(stringResult.engine)
      expect(['localStorage', 'sessionStorage']).toContain(numberResult.engine)
      expect(['localStorage', 'sessionStorage']).toContain(booleanResult.engine)
    })

    it('复杂对象应该选择 IndexedDB', async () => {
      const complexObject = {
        users: [
          { id: 1, name: '用户1', profile: { age: 25 } },
          { id: 2, name: '用户2', profile: { age: 30 } },
        ],
        metadata: {
          total: 2,
          lastUpdated: new Date().toISOString(),
        },
      }

      const result = await strategy.selectEngine('complex-key', complexObject)

      expect(result.engine).toBe('indexedDB')
    })

    it('数组数据应该选择 IndexedDB', async () => {
      const arrayData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
      }))

      const result = await strategy.selectEngine('array-key', arrayData)

      expect(result.engine).toBe('indexedDB')
    })
  })

  describe('综合策略', () => {
    it('应该综合考虑多个因素', async () => {
      // 小数据 + 短期 TTL = 内存缓存
      const smallShortData = 'small'
      const shortTTL = 1000

      const result1 = await strategy.selectEngine('test1', smallShortData, {
        ttl: shortTTL,
      })
      expect(result1.engine).toBe('memory')

      // 大数据 + 长期 TTL = IndexedDB
      const largeData = 'x'.repeat(100 * 1024)
      const longTTL = 7 * 24 * 60 * 60 * 1000

      const result2 = await strategy.selectEngine('test2', largeData, {
        ttl: longTTL,
      })
      expect(result2.engine).toBe('indexedDB')
    })

    it('应该返回置信度分数', async () => {
      const data = 'test data'
      const result = await strategy.selectEngine('test-key', data)

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('应该提供选择原因', async () => {
      const data = 'test data'
      const result = await strategy.selectEngine('test-key', data)

      expect(result.reason).toBeDefined()
      expect(typeof result.reason).toBe('string')
      expect(result.reason.length).toBeGreaterThan(0)
    })
  })

  describe('配置管理', () => {
    it('应该能够更新配置', () => {
      const newConfig: Partial<StorageStrategyConfig> = {
        sizeThresholds: {
          small: 2048,
          medium: 128 * 1024,
          large: 2 * 1024 * 1024,
        },
      }

      strategy.updateConfig(newConfig)
      const config = strategy.getConfig()

      expect(config.sizeThresholds?.small).toBe(2048)
      expect(config.sizeThresholds?.medium).toBe(128 * 1024)
      expect(config.sizeThresholds?.large).toBe(2 * 1024 * 1024)
    })

    it('应该能够获取当前配置', () => {
      const config = strategy.getConfig()

      expect(config).toBeDefined()
      expect(config.enabled).toBe(true)
      expect(config.sizeThresholds).toBeDefined()
      expect(config.ttlThresholds).toBeDefined()
      expect(config.enginePriority).toBeDefined()
    })

    it('禁用策略时应该使用默认引擎', async () => {
      strategy.updateConfig({ enabled: false })

      const result = await strategy.selectEngine('test-key', 'test data')

      expect(result.confidence).toBe(0.5)
      expect(result.reason).toContain('Strategy disabled')
    })
  })

  describe('边界情况', () => {
    it('应该处理空数据', async () => {
      const result = await strategy.selectEngine('empty-key', '')

      expect(result.engine).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('应该处理 null 和 undefined', async () => {
      const nullResult = await strategy.selectEngine('null-key', null)
      const undefinedResult = await strategy.selectEngine(
        'undefined-key',
        undefined,
      )

      expect(nullResult.engine).toBeDefined()
      expect(undefinedResult.engine).toBeDefined()
    })

    it('应该处理极大的 TTL 值', async () => {
      const data = 'test data'
      const hugeTTL = Number.MAX_SAFE_INTEGER

      const result = await strategy.selectEngine('huge-ttl-key', data, {
        ttl: hugeTTL,
      })

      expect(result.engine).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
    })
  })
})
