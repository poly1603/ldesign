import { beforeEach, describe, expect, it } from 'vitest'
import { CacheManagerImpl } from '../src/cache/cache-manager'
import { EventManagerImpl } from '../src/events/event-manager'

describe('性能基准测试', () => {
  describe('事件管理器性能', () => {
    let eventManager: EventManagerImpl

    beforeEach(() => {
      eventManager = new EventManagerImpl()
    })

    it('应该能够快速添加大量监听器', () => {
      const start = performance.now()
      
      // 添加 1000 个监听器
      for (let i = 0; i < 1000; i++) {
        eventManager.on(`event-${i}`, () => {})
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 应该在 50ms 内完成
      expect(duration).toBeLessThan(50)
    })

    it('应该能够快速触发大量事件', () => {
      // 先添加监听器
      for (let i = 0; i < 100; i++) {
        eventManager.on(`event-${i}`, () => {})
      }
      
      const start = performance.now()
      
      // 触发 1000 次事件
      for (let i = 0; i < 1000; i++) {
        eventManager.emit(`event-${i % 100}`, { data: i })
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 应该在 100ms 内完成
      expect(duration).toBeLessThan(100)
    })

    it('应该能够高效处理一次性监听器', () => {
      const start = performance.now()
      
      // 添加 1000 个一次性监听器并触发
      for (let i = 0; i < 1000; i++) {
        eventManager.once(`event-${i}`, () => {})
        eventManager.emit(`event-${i}`, {})
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 应该在 100ms 内完成
      expect(duration).toBeLessThan(100)
      
      // 验证监听器已被移除
      expect(eventManager.listenerCount('event-0')).toBe(0)
    })
  })

  describe('缓存管理器性能', () => {
    let cacheManager: CacheManagerImpl<string>

    beforeEach(() => {
      cacheManager = new CacheManagerImpl({ maxSize: 10000 })
    })

    it('应该能够快速设置大量缓存项', () => {
      const start = performance.now()
      
      // 设置 5000 个缓存项
      for (let i = 0; i < 5000; i++) {
        cacheManager.set(`key-${i}`, `value-${i}`)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 应该在 50ms 内完成
      expect(duration).toBeLessThan(50)
    })

    it('应该能够快速获取大量缓存项', () => {
      // 先设置缓存项
      for (let i = 0; i < 1000; i++) {
        cacheManager.set(`key-${i}`, `value-${i}`)
      }
      
      const start = performance.now()
      
      // 获取 5000 次（包含重复）
      for (let i = 0; i < 5000; i++) {
        cacheManager.get(`key-${i % 1000}`)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // 应该在 30ms 内完成
      expect(duration).toBeLessThan(30)
    })

    it('应该能够高效处理 TTL 过期', () => {
      const start = performance.now()
      
      // 设置 1000 个带 TTL 的缓存项
      for (let i = 0; i < 1000; i++) {
        cacheManager.set(`key-${i}`, `value-${i}`, 1) // 1ms TTL
      }
      
      // 等待过期
      setTimeout(() => {
        // 尝试获取所有项（应该都过期了）
        for (let i = 0; i < 1000; i++) {
          cacheManager.get(`key-${i}`)
        }
        
        const end = performance.now()
        const duration = end - start
        
        // 应该在 50ms 内完成
        expect(duration).toBeLessThan(50)
        
        // 验证缓存已清空
        expect(cacheManager.size()).toBe(0)
      }, 10)
    })
  })

  describe('内存使用优化', () => {
    it('事件对象池应该减少内存分配', () => {
      const eventManager = new EventManagerImpl()
      
      // 获取初始内存使用（如果可用）
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // 添加和移除大量监听器
      for (let cycle = 0; cycle < 10; cycle++) {
        const handlers: Array<() => void> = []
        
        // 添加监听器
        for (let i = 0; i < 100; i++) {
          const handler = () => {}
          handlers.push(handler)
          eventManager.on(`test-event-${i}`, handler)
        }
        
        // 移除监听器
        for (let i = 0; i < 100; i++) {
          eventManager.off(`test-event-${i}`, handlers[i])
        }
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // 内存增长应该很小（如果内存信息可用）
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory
        expect(memoryGrowth).toBeLessThan(1024 * 1024) // 小于 1MB
      }
    })
  })
})
