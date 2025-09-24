import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SyncManager } from '../../src/core/sync-manager'
import { CacheManager } from '../../src/core/cache-manager'
import type { CacheEvent } from '../../src/types'

// Mock BroadcastChannel
class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null
  
  constructor(public name: string) {}
  
  postMessage(data: any) {
    // 模拟异步消息传递
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data } as MessageEvent)
      }
    }, 0)
  }
  
  close() {}
}

// Mock localStorage
const mockLocalStorage = {
  data: new Map<string, string>(),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data.set(key, value)
  }),
  getItem: vi.fn((key: string) => mockLocalStorage.data.get(key) || null),
  removeItem: vi.fn((key: string) => {
    mockLocalStorage.data.delete(key)
  }),
  clear: vi.fn(() => mockLocalStorage.data.clear())
}

describe('SyncManager', () => {
  let cacheManager: CacheManager
  let syncManager: SyncManager
  
  beforeEach(() => {
    vi.useFakeTimers()
    
    // Mock global objects
    global.BroadcastChannel = MockBroadcastChannel as any
    global.window = {
      localStorage: mockLocalStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn((fn, delay) => setTimeout(fn, delay)),
      clearTimeout: vi.fn(clearTimeout)
    } as any
    
    cacheManager = new CacheManager()
    syncManager = new SyncManager(cacheManager)
  })
  
  afterEach(() => {
    vi.useRealTimers()
    syncManager.destroy()
    mockLocalStorage.data.clear()
  })

  describe('基础功能', () => {
    it('应该能够创建同步管理器', () => {
      expect(syncManager).toBeDefined()
      expect(syncManager).toBeInstanceOf(SyncManager)
    })

    it('应该能够使用自定义配置', () => {
      const customSync = new SyncManager(cacheManager, {
        enabled: false,
        channel: 'custom-channel',
        debounce: 500,
        engines: ['localStorage'],
        events: ['set', 'remove']
      })
      
      expect(customSync).toBeDefined()
      customSync.destroy()
    })

    it('应该能够自动初始化同步', () => {
      expect(syncManager).toBeDefined()
    })

    it('应该能够销毁同步管理器', () => {
      syncManager.destroy()
      expect(syncManager).toBeDefined()
    })
  })

  describe('BroadcastChannel 同步', () => {
    it('应该能够通过 BroadcastChannel 发送消息', async () => {
      const listener = vi.fn()
      syncManager.on('sync', listener)

      // 模拟缓存操作
      await cacheManager.set('test-key', 'test-value', { engine: 'localStorage' })

      // 等待异步操作完成
      await vi.runAllTimersAsync()

      expect(listener).toHaveBeenCalled()
    })

    it('应该能够接收 BroadcastChannel 消息', async () => {
      const setSpy = vi.spyOn(cacheManager, 'set')

      // 模拟接收到同步消息
      const message = {
        type: 'set' as const,
        key: 'remote-key',
        value: 'remote-value',
        timestamp: Date.now(),
        source: 'other-tab'
      }

      // 直接调用消息处理器
      await (syncManager as any).handleSyncMessage(message)

      expect(setSpy).toHaveBeenCalledWith('remote-key', 'remote-value')
    })
  })

  describe('Storage 事件同步', () => {
    beforeEach(() => {
      // 禁用 BroadcastChannel 以测试 storage 事件
      global.BroadcastChannel = undefined as any
    })

    it('应该能够通过 storage 事件发送消息', async () => {
      await cacheManager.set('storage-key', 'storage-value', { engine: 'localStorage' })

      await vi.runAllTimersAsync()

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })

    it('应该能够处理 storage 事件', async () => {
      const setSpy = vi.spyOn(cacheManager, 'set')
      
      // 模拟 storage 事件
      const storageEvent = {
        key: '__sync__123456',
        newValue: JSON.stringify({
          type: 'set',
          key: 'storage-sync-key',
          value: 'storage-sync-value',
          timestamp: Date.now(),
          source: 'other-tab'
        })
      } as StorageEvent
      
      // 直接调用 storage 处理器
      const handler = (syncManager as any).storageHandler
      if (handler) {
        handler(storageEvent)
      }
      
      await vi.runAllTimersAsync()
      
      expect(setSpy).toHaveBeenCalledWith('storage-sync-key', 'storage-sync-value')
    })
  })

  describe('同步过滤', () => {
    it('应该只同步指定的存储引擎', async () => {
      const filteredSync = new SyncManager(cacheManager, {
        engines: ['localStorage']
      })
      
      const broadcastSpy = vi.spyOn(filteredSync as any, 'broadcastMessage')

      // localStorage 操作应该被同步
      await cacheManager.set('local-key', 'local-value', { engine: 'localStorage' })

      // memory 操作不应该被同步
      await cacheManager.set('memory-key', 'memory-value', { engine: 'memory' })

      await vi.runAllTimersAsync()

      expect(broadcastSpy).toHaveBeenCalledTimes(1)

      filteredSync.destroy()
    })

    it('应该只同步指定的事件类型', async () => {
      const eventSync = new SyncManager(cacheManager, {
        events: ['set']
      })

      const broadcastSpy = vi.spyOn(eventSync as any, 'broadcastMessage')

      // set 操作应该被同步
      await cacheManager.set('event-key', 'event-value', { engine: 'localStorage' })

      // remove 操作不应该被同步
      await cacheManager.remove('event-key')
      
      await vi.runAllTimersAsync()
      
      expect(broadcastSpy).toHaveBeenCalledTimes(1)
      
      eventSync.destroy()
    })
  })

  describe('防抖功能', () => {
    it('应该能够防抖同步消息', async () => {
      const debouncedSync = new SyncManager(cacheManager, {
        debounce: 100
      })
      
      const sendSpy = vi.spyOn(debouncedSync as any, 'sendMessage')

      // 快速连续操作
      await cacheManager.set('debounce-1', 'value-1', { engine: 'localStorage' })
      await cacheManager.set('debounce-2', 'value-2', { engine: 'localStorage' })
      await cacheManager.set('debounce-3', 'value-3', { engine: 'localStorage' })
      
      // 在防抖时间内，应该只发送最后一次
      expect(sendSpy).not.toHaveBeenCalled()
      
      // 等待防抖时间
      await vi.advanceTimersByTimeAsync(100)
      
      expect(sendSpy).toHaveBeenCalledTimes(1)
      
      debouncedSync.destroy()
    })
  })

  describe('全量同步', () => {
    it('应该能够请求全量同步', async () => {
      const sendSpy = vi.spyOn(syncManager as any, 'sendMessage')
      
      await syncManager.requestSync()
      
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sync'
        })
      )
    })

    it('应该能够处理全量同步请求', async () => {
      // 添加一些数据
      await cacheManager.set('sync-key-1', 'sync-value-1')
      await cacheManager.set('sync-key-2', 'sync-value-2')
      
      const broadcastSpy = vi.spyOn(syncManager as any, 'broadcastMessage')
      
      // 处理同步请求
      await (syncManager as any).handleSyncRequest()
      
      expect(broadcastSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('事件监听', () => {
    it('应该能够监听同步事件', () => {
      const listener = vi.fn()
      
      syncManager.on('sync', listener)
      
      // 触发同步事件
      const message = {
        type: 'set' as const,
        key: 'event-key',
        value: 'event-value',
        timestamp: Date.now(),
        source: 'test'
      }
      
      ;(syncManager as any).emitter.emit('sync', message)
      
      expect(listener).toHaveBeenCalledWith(message)
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()
      
      syncManager.on('sync', listener)
      syncManager.off('sync', listener)
      
      ;(syncManager as any).emitter.emit('sync', {})
      
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该能够处理无效的同步消息', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // 模拟无效的 storage 事件
      const invalidEvent = {
        key: '__sync__invalid',
        newValue: 'invalid json'
      } as StorageEvent
      
      const handler = (syncManager as any).storageHandler
      if (handler) {
        handler(invalidEvent)
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse sync message:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('应该忽略自己发送的消息', async () => {
      const setSpy = vi.spyOn(cacheManager, 'set')
      
      // 使用自己的 sourceId 发送消息
      const selfMessage = {
        type: 'set' as const,
        key: 'self-key',
        value: 'self-value',
        timestamp: Date.now(),
        source: (syncManager as any).sourceId
      }
      
      await (syncManager as any).handleSyncMessage(selfMessage)
      
      expect(setSpy).not.toHaveBeenCalled()
    })
  })
})
