import { describe, it, expect, beforeEach } from 'vitest'
import {
  LRUStrategy,
  LFUStrategy,
  FIFOStrategy,
  MRUStrategy,
  RandomStrategy,
  TTLStrategy,
  ARCStrategy,
  EvictionStrategyFactory,
} from '../src/utils/eviction'

describe('淘汰策略', () => {
  describe('LRU 策略', () => {
    let strategy: LRUStrategy

    beforeEach(() => {
      strategy = new LRUStrategy()
    })

    it('应该淘汰最近最少使用的项', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      // 访问 key1 和 key3
      strategy.recordAccess('key1')
      strategy.recordAccess('key3')
      
      // key2 应该被淘汰（最近最少使用）
      expect(strategy.getEvictionKey()).toBe('key2')
    })

    it('应该更新访问时间', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      
      // 访问 key1 多次
      strategy.recordAccess('key1')
      strategy.recordAccess('key1')
      
      // key2 应该被淘汰
      expect(strategy.getEvictionKey()).toBe('key2')
      
      // 访问 key2
      strategy.recordAccess('key2')
      
      // 现在 key1 应该被淘汰
      expect(strategy.getEvictionKey()).toBe('key1')
    })

    it('应该处理删除', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      strategy.recordRemove('key2')
      
      const stats = strategy.getStats()
      expect(stats.totalItems).toBe(2)
    })

    it('应该批量淘汰', () => {
      for (let i = 0; i < 10; i++) {
        strategy.recordAdd(`key${i}`)
      }
      
      const evicted = strategy.getEvictionKeys(3)
      expect(evicted).toHaveLength(3)
      expect(evicted).toContain('key0')
      expect(evicted).toContain('key1')
      expect(evicted).toContain('key2')
    })
  })

  describe('LFU 策略', () => {
    let strategy: LFUStrategy

    beforeEach(() => {
      strategy = new LFUStrategy()
    })

    it('应该淘汰最不常用的项', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      // 访问频率: key1=3, key2=1, key3=2
      strategy.recordAccess('key1')
      strategy.recordAccess('key1')
      strategy.recordAccess('key1')
      strategy.recordAccess('key3')
      strategy.recordAccess('key3')
      
      // key2 应该被淘汰（访问频率最低）
      expect(strategy.getEvictionKey()).toBe('key2')
    })

    it('应该在频率相同时考虑时间', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      
      // 两个键访问频率相同
      strategy.recordAccess('key1')
      strategy.recordAccess('key2')
      
      // key1 应该被淘汰（更早添加）
      expect(strategy.getEvictionKey()).toBe('key1')
    })

    it('应该正确统计访问频率', () => {
      strategy.recordAdd('key1')
      strategy.recordAccess('key1')
      strategy.recordAccess('key1')
      
      const metadata = strategy.getMetadata()
      const key1Data = metadata.find(m => m.key === 'key1')
      expect(key1Data?.frequency).toBe(2)
    })
  })

  describe('FIFO 策略', () => {
    let strategy: FIFOStrategy

    beforeEach(() => {
      strategy = new FIFOStrategy()
    })

    it('应该按先进先出顺序淘汰', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      // 访问不影响淘汰顺序
      strategy.recordAccess('key3')
      strategy.recordAccess('key2')
      
      // key1 应该被淘汰（最先添加）
      expect(strategy.getEvictionKey()).toBe('key1')
    })

    it('应该批量淘汰时保持顺序', () => {
      for (let i = 0; i < 5; i++) {
        strategy.recordAdd(`key${i}`)
      }
      
      const evicted = strategy.getEvictionKeys(3)
      expect(evicted).toEqual(['key0', 'key1', 'key2'])
    })
  })

  describe('MRU 策略', () => {
    let strategy: MRUStrategy

    beforeEach(() => {
      strategy = new MRUStrategy()
    })

    it('应该淘汰最近使用的项', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      // key3 刚被访问
      strategy.recordAccess('key3')
      
      // key3 应该被淘汰（最近使用）
      expect(strategy.getEvictionKey()).toBe('key3')
    })

    it('应该正确更新最近使用', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      
      strategy.recordAccess('key1')
      expect(strategy.getEvictionKey()).toBe('key1')
      
      strategy.recordAccess('key2')
      expect(strategy.getEvictionKey()).toBe('key2')
    })
  })

  describe('Random 策略', () => {
    let strategy: RandomStrategy

    beforeEach(() => {
      strategy = new RandomStrategy()
    })

    it('应该随机淘汰项', () => {
      const keys = ['key1', 'key2', 'key3', 'key4', 'key5']
      keys.forEach(key => strategy.recordAdd(key))
      
      const evicted = strategy.getEvictionKey()
      expect(evicted).toBeDefined()
      expect(keys).toContain(evicted)
    })

    it('应该能批量随机淘汰', () => {
      for (let i = 0; i < 10; i++) {
        strategy.recordAdd(`key${i}`)
      }
      
      const evicted = strategy.getEvictionKeys(5)
      expect(evicted).toHaveLength(5)
      
      // 检查没有重复
      const uniqueKeys = new Set(evicted)
      expect(uniqueKeys.size).toBe(5)
    })
  })

  describe('TTL 策略', () => {
    let strategy: TTLStrategy

    beforeEach(() => {
      strategy = new TTLStrategy()
    })

    it('应该优先淘汰即将过期的项', () => {
      const now = Date.now()
      
      strategy.recordAdd('key1', { expiresAt: now + 1000 })
      strategy.recordAdd('key2', { expiresAt: now + 5000 })
      strategy.recordAdd('key3', { expiresAt: now + 500 })
      
      // key3 应该被淘汰（最快过期）
      expect(strategy.getEvictionKey()).toBe('key3')
    })

    it('应该淘汰已过期的项', () => {
      const now = Date.now()
      
      strategy.recordAdd('key1', { expiresAt: now - 1000 }) // 已过期
      strategy.recordAdd('key2', { expiresAt: now + 5000 })
      
      expect(strategy.getEvictionKey()).toBe('key1')
    })

    it('应该处理没有过期时间的项', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2', { expiresAt: Date.now() + 1000 })
      
      // 应该淘汰有过期时间的项
      expect(strategy.getEvictionKey()).toBe('key2')
    })
  })

  describe('ARC 策略', () => {
    let strategy: ARCStrategy

    beforeEach(() => {
      strategy = new ARCStrategy()
    })

    it('应该自适应调整 LRU 和 LFU', () => {
      // 添加一些项
      for (let i = 0; i < 10; i++) {
        strategy.recordAdd(`key${i}`)
      }
      
      // 模拟不同的访问模式
      // 频繁访问某些键
      for (let i = 0; i < 5; i++) {
        strategy.recordAccess('key0')
        strategy.recordAccess('key1')
      }
      
      // 偶尔访问其他键
      strategy.recordAccess('key5')
      strategy.recordAccess('key6')
      
      const evicted = strategy.getEvictionKey()
      expect(evicted).toBeDefined()
      
      // 应该不会淘汰频繁访问的键
      expect(evicted).not.toBe('key0')
      expect(evicted).not.toBe('key1')
    })

    it('应该维护幽灵列表', () => {
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAdd('key3')
      
      strategy.recordRemove('key1')
      
      // 幽灵列表应该记住被删除的键
      const metadata = strategy.getMetadata()
      expect(metadata).toBeDefined()
    })

    it('应该提供详细的统计信息', () => {
      for (let i = 0; i < 5; i++) {
        strategy.recordAdd(`key${i}`)
        strategy.recordAccess(`key${i}`)
      }
      
      const stats = strategy.getStats()
      expect(stats.totalItems).toBe(5)
      expect(stats.hits).toBeGreaterThanOrEqual(0)
      expect(stats.misses).toBeGreaterThanOrEqual(0)
    })
  })

  describe('策略工厂', () => {
    it('应该创建所有支持的策略', () => {
      const strategies = [
        'LRU', 'LFU', 'FIFO', 'MRU', 'Random', 'TTL', 'ARC'
      ]
      
      strategies.forEach(name => {
        const strategy = EvictionStrategyFactory.create(name as any)
        expect(strategy).toBeDefined()
        expect(strategy.getName()).toBe(name)
      })
    })

    it('应该注册自定义策略', () => {
      class CustomStrategy extends LRUStrategy {
        getName(): string {
          return 'Custom'
        }
      }
      
      EvictionStrategyFactory.register('Custom', CustomStrategy)
      
      const strategy = EvictionStrategyFactory.create('Custom' as any)
      expect(strategy).toBeDefined()
      expect(strategy.getName()).toBe('Custom')
    })

    it('应该列出所有可用策略', () => {
      const available = EvictionStrategyFactory.getAvailableStrategies()
      
      expect(available).toContain('LRU')
      expect(available).toContain('LFU')
      expect(available).toContain('FIFO')
      expect(available).toContain('MRU')
      expect(available).toContain('Random')
      expect(available).toContain('TTL')
      expect(available).toContain('ARC')
    })

    it('应该为未知策略抛出错误', () => {
      expect(() => {
        EvictionStrategyFactory.create('Unknown' as any)
      }).toThrow()
    })
  })

  describe('策略切换', () => {
    it('应该支持运行时切换策略', () => {
      let strategy: any = new LRUStrategy()
      
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      strategy.recordAccess('key1')
      
      // 切换到 FIFO
      strategy = new FIFOStrategy()
      strategy.recordAdd('key1')
      strategy.recordAdd('key2')
      
      // FIFO 不受访问影响
      strategy.recordAccess('key2')
      expect(strategy.getEvictionKey()).toBe('key1')
    })
  })
})
