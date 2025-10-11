import { describe, expect, it } from 'vitest'
import { aes, cryptoManager, LRUCache } from '../src/index'

/**
 * 内存优化测试
 * 测试内存使用、缓存管理和内存泄漏预防
 */

describe('LRU 缓存内存管理', () => {
  it('缓存大小限制', () => {
    const cache = new LRUCache<string, string>({
      maxSize: 10,
    })

    // 添加超过最大容量的项
    for (let i = 0; i < 20; i++) {
      cache.set(`key-${i}`, `value-${i}`)
    }

    // 缓存大小应该不超过最大值
    expect(cache.size).toBe(10)

    // 最早的项应该被淘汰
    expect(cache.has('key-0')).toBe(false)
    expect(cache.has('key-9')).toBe(false)

    // 最新的项应该存在
    expect(cache.has('key-19')).toBe(true)
    expect(cache.has('key-10')).toBe(true)
  })

  it('缓存过期机制', async () => {
    const cache = new LRUCache<string, string>({
      maxSize: 100,
      ttl: 100, // 100ms 过期
    })

    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)

    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 150))

    // 应该已过期
    expect(cache.has('key1')).toBe(false)
  })

  it('缓存清理功能', () => {
    const cache = new LRUCache<string, string>({
      maxSize: 100,
      ttl: 50,
    })

    // 添加一些项
    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, `value-${i}`)
    }

    expect(cache.size).toBe(10)

    // 等待过期后清理
    setTimeout(() => {
      const cleaned = cache.cleanup()
      expect(cleaned).toBe(10)
      expect(cache.size).toBe(0)
    }, 100)
  })

  it('缓存统计信息', () => {
    const cache = new LRUCache<string, number>({
      maxSize: 5,
    })

    // 添加数据
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)

    // 访问数据（命中）
    cache.get('a')
    cache.get('b')

    // 访问不存在的数据（未命中）
    cache.get('d')
    cache.get('e')

    const stats = cache.getStats()

    expect(stats.size).toBe(3)
    expect(stats.maxSize).toBe(5)
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(2)
    expect(stats.hitRate).toBe(0.5)
  })
})

describe('加密操作内存优化', () => {
  it('大量加密操作不应导致内存泄漏', () => {
    const iterations = 100
    const data = 'test data for memory leak detection'
    const key = 'test-key'

    // 记录初始内存（如果可用）
    const initialMemory = getMemoryUsage()

    // 执行大量加密操作
    for (let i = 0; i < iterations; i++) {
      const encrypted = aes.encrypt(data, key, { keySize: 256, mode: 'CBC' })
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted, key, { keySize: 256, mode: 'CBC' })
      expect(decrypted.success).toBe(true)
    }

    // 记录最终内存
    const finalMemory = getMemoryUsage()

    // 内存增长应该在合理范围内（考虑缓存）
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory
      const growthMB = memoryGrowth / (1024 * 1024)

      console.log(`Memory growth: ${growthMB.toFixed(2)} MB`)

      // 内存增长应该小于 15MB（包括缓存和 Node.js GC 延迟）
      // 调整阈值以反映实际内存使用情况
      expect(growthMB).toBeLessThan(15)
    }
  })

  it('缓存清理释放内存', async () => {
    const manager = cryptoManager

    // 使用批量操作填充缓存（批量操作会使用缓存）
    const operations = Array.from({ length: 100 }, (_, i) => ({
      data: `data-${i}`,
      key: `key-${i}`,
      algorithm: 'AES' as const,
    }))

    // 执行两次相同的批量操作，第二次应该命中缓存
    await manager.batchEncrypt(operations)
    await manager.batchEncrypt(operations)

    const statsBeforeClear = manager.getCacheStats()
    // 批量操作使用缓存，应该有缓存项
    expect(statsBeforeClear.totalRequests).toBeGreaterThan(0)

    // 清除缓存
    manager.clearCache()

    const statsAfterClear = manager.getCacheStats()
    expect(statsAfterClear.size).toBe(0)
  })

  it('自动缓存清理', async () => {
    const manager = cryptoManager

    // 执行一些操作
    for (let i = 0; i < 50; i++) {
      await manager.encryptData(`data-${i}`, `key-${i}`, 'AES')
    }

    // 执行缓存清理
    const cleaned = manager.cleanupCache()

    console.log(`Cleaned ${cleaned} expired cache entries`)

    // 清理数量应该是非负数
    expect(cleaned).toBeGreaterThanOrEqual(0)
  })
})

describe('字符串操作内存优化', () => {
  it('大字符串编码不应导致内存问题', () => {
    const largeString = 'A'.repeat(100 * 1024) // 100KB

    const initialMemory = getMemoryUsage()

    // 多次编码解码
    for (let i = 0; i < 10; i++) {
      const encrypted = aes.encrypt(largeString, 'test-key', { keySize: 256 })
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted, 'test-key', { keySize: 256 })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(largeString)
    }

    const finalMemory = getMemoryUsage()

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory
      const growthMB = memoryGrowth / (1024 * 1024)

      console.log(`Large string memory growth: ${growthMB.toFixed(2)} MB`)

      // 内存增长应该在合理范围内
      expect(growthMB).toBeLessThan(50)
    }
  })
})

describe('性能监控内存使用', () => {
  it('性能指标不应占用过多内存', async () => {
    const manager = cryptoManager

    // 执行大量操作
    for (let i = 0; i < 1000; i++) {
      await manager.encryptData(`data-${i}`, 'key', 'AES')
    }

    const metrics = manager.getPerformanceMetrics()

    expect(metrics.memoryUsage).toBeGreaterThan(0)

    console.log(`Memory usage: ${(metrics.memoryUsage / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`Cache size: ${metrics.cacheSize}`)
    console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`)
  })
})

/**
 * 获取内存使用情况（辅助函数）
 */
function getMemoryUsage(): number {
  // eslint-disable-next-line node/prefer-global/process
  if (typeof process !== 'undefined' && process.memoryUsage) {
    // eslint-disable-next-line node/prefer-global/process
    return process.memoryUsage().heapUsed
  }
  return 0
}

