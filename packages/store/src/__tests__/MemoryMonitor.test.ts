import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryMonitor } from '../core/MemoryMonitor'
import { BaseStore } from '../core/BaseStore'
import { StorePool } from '../core/storePool'

describe('MemoryMonitor', () => {
  let monitor: MemoryMonitor

  beforeEach(() => {
    monitor = MemoryMonitor.getInstance({
      enabled: false, // 禁用自动启动
      sampleInterval: 100, // 加快测试速度
      historySize: 10,
    })
  })

  afterEach(() => {
    monitor.dispose()
  })

  describe('基本功能', () => {
    it('应该能够启动和停止监控', () => {
      monitor.start()
      expect(() => monitor.stop()).not.toThrow()
    })

    it('应该能够注册Store实例', () => {
      const store = new TestStore('test')
      expect(() => monitor.registerStore(store)).not.toThrow()
    })

    it('应该能够注册缓存实例', () => {
      const cache = { data: {} }
      expect(() => monitor.registerCache(cache, 1024)).not.toThrow()
    })
  })

  describe('内存采样', () => {
    it('应该能够收集内存使用信息', async () => {
      monitor.start()
      
      // 等待第一次采样
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const report = monitor.getMemoryReport()
      expect(report.current).toBeDefined()
      expect(report.current?.storeInstances).toBeGreaterThanOrEqual(0)
      expect(report.current?.cacheEntries).toBeGreaterThanOrEqual(0)
      
      monitor.stop()
    })

    it('应该记录历史数据', async () => {
      monitor.start()
      
      // 等待多次采样
      await new Promise(resolve => setTimeout(resolve, 350))
      
      const report = monitor.getMemoryReport()
      expect(report.history.length).toBeGreaterThan(0)
      expect(report.history.length).toBeLessThanOrEqual(10)
      
      monitor.stop()
    })
  })

  describe('内存泄漏检测', () => {
    it('应该检测内存增长', () => {
      // 模拟历史数据
      for (let i = 0; i < 10; i++) {
        (monitor as any).history.push({
          storeInstances: i * 2,
          cacheEntries: i,
          estimatedSize: i * 1024 * 1024,
          timestamp: Date.now() - (10 - i) * 1000,
          details: {
            stores: new Map(),
            caches: new Map(),
          },
        })
      }

      const detection = monitor.detectMemoryLeak()
      expect(detection.suspected).toBe(true)
      expect(detection.growthRate).toBeGreaterThan(0)
    })

    it('应该识别问题Store', () => {
      const storeDetails1 = new Map([['TestStore', 5]])
      const storeDetails2 = new Map([['TestStore', 20]])
      
      // 模拟历史数据
      for (let i = 0; i < 10; i++) {
        (monitor as any).history.push({
          storeInstances: 10,
          cacheEntries: 0,
          estimatedSize: 1024,
          timestamp: Date.now() - (10 - i) * 1000,
          details: {
            stores: i < 5 ? storeDetails1 : storeDetails2,
            caches: new Map(),
          },
        })
      }

      const detection = monitor.detectMemoryLeak()
      expect(detection.problematicStores).toContain('TestStore')
    })
  })

  describe('内存趋势分析', () => {
    it('应该识别稳定趋势', () => {
      // 模拟稳定的内存使用
      for (let i = 0; i < 3; i++) {
        (monitor as any).history.push({
          storeInstances: 10,
          cacheEntries: 5,
          estimatedSize: 5 * 1024 * 1024,
          timestamp: Date.now() - (3 - i) * 1000,
          details: {
            stores: new Map(),
            caches: new Map(),
          },
        })
      }

      const report = monitor.getMemoryReport()
      expect(report.trend).toBe('stable')
    })

    it('应该识别增长趋势', () => {
      // 模拟增长的内存使用
      for (let i = 0; i < 3; i++) {
        (monitor as any).history.push({
          storeInstances: 10,
          cacheEntries: 5,
          estimatedSize: (i + 1) * 10 * 1024 * 1024,
          timestamp: Date.now() - (3 - i) * 1000,
          details: {
            stores: new Map(),
            caches: new Map(),
          },
        })
      }

      const report = monitor.getMemoryReport()
      expect(report.trend).toBe('growing')
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      monitor.updateConfig({
        alertThreshold: 50 * 1024 * 1024,
        autoCleanup: false,
      })
      
      expect((monitor as any).config.alertThreshold).toBe(50 * 1024 * 1024)
      expect((monitor as any).config.autoCleanup).toBe(false)
    })

    it('应该在更新配置后重启监控', () => {
      const startSpy = vi.spyOn(monitor, 'start')
      const stopSpy = vi.spyOn(monitor, 'stop')
      
      monitor.updateConfig({ enabled: true })
      
      expect(stopSpy).toHaveBeenCalled()
      expect(startSpy).toHaveBeenCalled()
    })
  })

  describe('事件订阅', () => {
    it('应该支持订阅内存使用更新', async () => {
      const callback = vi.fn()
      const unsubscribe = monitor.subscribe(callback)
      
      monitor.start()
      
      // 等待采样
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(callback).toHaveBeenCalled()
      
      unsubscribe()
      monitor.stop()
    })

    it('应该支持取消订阅', async () => {
      const callback = vi.fn()
      const unsubscribe = monitor.subscribe(callback)
      
      unsubscribe()
      
      monitor.start()
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // callback 应该只被调用一次（取消订阅前）
      expect(callback).not.toHaveBeenCalled()
      
      monitor.stop()
    })
  })
})

// 测试用的Store类
class TestStore extends BaseStore {
  constructor(id: string) {
    super(id, {
      state: () => ({ count: 0 }),
    })
  }
}