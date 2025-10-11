import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ResourceManager } from '../../src/utils/ResourceManager'

describe('resourceManager - Core Features', () => {
  let manager: ResourceManager

  beforeEach(() => {
    manager = ResourceManager.getInstance({
      maxCacheSize: 10 * 1024 * 1024,
      maxConcurrent: 3,
      defaultRetries: 2,
      autoCleanup: false,
    })
  })

  afterEach(() => {
    manager.destroy()
  })

  describe('\u521d\u59cb\u5316', () => {
    it('\u5e94\u8be5\u521b\u5efa\u5355\u4f8b\u5b9e\u4f8b', () => {
      const instance1 = ResourceManager.getInstance()
      const instance2 = ResourceManager.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('\u5e94\u8be5\u8fd4\u56de ResourceManager \u5b9e\u4f8b', () => {
      expect(manager).toBeInstanceOf(ResourceManager)
    })
  })

  describe('\u8d44\u6e90\u7edf\u8ba1', () => {
    it('\u5e94\u8be5\u8fd4\u56de\u521d\u59cb\u7edf\u8ba1\u4fe1\u606f', () => {
      const stats = manager.getStats()

      expect(stats).toHaveProperty('totalResources')
      expect(stats).toHaveProperty('loadedResources')
      expect(stats).toHaveProperty('cachedResources')
      expect(stats).toHaveProperty('errorResources')
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('cacheHitRate')
      expect(stats).toHaveProperty('averageLoadTime')

      expect(stats.totalResources).toBe(0)
      expect(stats.loadedResources).toBe(0)
      expect(stats.totalSize).toBe(0)
    })
  })

  describe('\u8d44\u6e90\u7ba1\u7406', () => {
    it('\u5e94\u8be5\u68c0\u6d4b\u8d44\u6e90\u662f\u5426\u5b58\u5728', () => {
      const exists = manager.has('test.jpg')
      expect(exists).toBe(false)
    })

    it('\u5e94\u8be5\u83b7\u53d6\u4e0d\u5b58\u5728\u7684\u8d44\u6e90\u8fd4\u56de undefined', () => {
      const resource = manager.get('nonexistent.jpg')
      expect(resource).toBeUndefined()
    })

    it('\u5e94\u8be5\u6e05\u9664\u6240\u6709\u8d44\u6e90', () => {
      manager.clear()
      const stats = manager.getStats()
      expect(stats.totalResources).toBe(0)
      expect(stats.totalSize).toBe(0)
    })

    it('\u5e94\u8be5\u91ca\u653e\u5355\u4e2a\u8d44\u6e90', () => {
      const released = manager.release('test.jpg')
      expect(typeof released).toBe('boolean')
    })

    it('\u5e94\u8be5\u6309\u7c7b\u578b\u91ca\u653e\u8d44\u6e90', () => {
      const count = manager.releaseByType('image')
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('\u8fdb\u5ea6\u76d1\u542c', () => {
    it('\u5e94\u8be5\u6dfb\u52a0\u8fdb\u5ea6\u76d1\u542c\u5668', () => {
      const callback = () => {}
      const unsubscribe = manager.onProgress(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('\u5e94\u8be5\u79fb\u9664\u8fdb\u5ea6\u76d1\u542c\u5668', () => {
      const callback = () => {}
      const unsubscribe = manager.onProgress(callback)

      expect(() => unsubscribe()).not.toThrow()
    })
  })

  describe('\u9500\u6bc1', () => {
    it('\u5e94\u8be5\u6e05\u7406\u6240\u6709\u8d44\u6e90', () => {
      manager.destroy()
      const stats = manager.getStats()
      expect(stats.totalResources).toBe(0)
    })
  })

  describe('\u9884\u52a0\u8f7d', () => {
    it('\u5e94\u8be5\u63a5\u53d7\u8d44\u6e90\u914d\u7f6e\u6570\u7ec4', () => {
      expect(() => {
        manager.preload([
          { url: '/test/image.jpg', type: 'image' },
          { url: '/test/data.json', type: 'data' },
        ])
      }).not.toThrow()
    })

    it('\u5e94\u8be5\u4e0d\u963b\u585e\u6267\u884c', () => {
      const result = manager.preload([
        { url: '/test/image.jpg', type: 'image' },
      ])
      expect(result).toBeUndefined()
    })
  })
})
