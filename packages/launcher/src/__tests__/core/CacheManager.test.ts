/**
 * 缓存管理系统单元测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheManager } from '../../core/CacheManager'
import { Logger } from '../../utils/logger'
import fs from 'fs-extra'
import path from 'path'

describe('CacheManager', () => {
  let cacheManager: CacheManager
  let mockLogger: Logger
  let tempCacheDir: string

  beforeEach(async () => {
    mockLogger = new Logger('Test', { level: 'silent' })
    tempCacheDir = path.join(__dirname, '.test-cache')
    
    // 确保测试缓存目录存在
    await fs.ensureDir(tempCacheDir)
    
    cacheManager = new CacheManager({
      enabled: true,
      cacheDir: tempCacheDir,
      maxSize: 10, // 10MB for testing
      ttl: 60000, // 1 minute
      types: ['build', 'deps', 'modules', 'transform'],
      compression: false,
      autoClean: {
        enabled: false, // 禁用自动清理在测试中
        interval: 1,
        threshold: 0.8
      }
    }, mockLogger)

    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(async () => {
    // 清理测试缓存目录
    if (await fs.pathExists(tempCacheDir)) {
      await fs.remove(tempCacheDir)
    }
    
    // 销毁缓存管理器
    await cacheManager.destroy()
  })

  describe('基本缓存操作', () => {
    it('应该能够设置和获取缓存', async () => {
      const key = 'test-key'
      const type = 'build'
      const data = { message: 'hello world', number: 42 }

      // 设置缓存
      await cacheManager.set(key, type, data)

      // 获取缓存
      const retrieved = await cacheManager.get(key, type)
      expect(retrieved).toEqual(data)
    })

    it('应该能够检查缓存是否存在', async () => {
      const key = 'test-key'
      const type = 'deps'
      const data = { test: true }

      // 初始时不存在
      expect(await cacheManager.has(key, type)).toBe(false)

      // 设置缓存后存在
      await cacheManager.set(key, type, data)
      expect(await cacheManager.has(key, type)).toBe(true)
    })

    it('应该能够删除缓存', async () => {
      const key = 'test-key'
      const type = 'modules'
      const data = { test: true }

      // 设置缓存
      await cacheManager.set(key, type, data)
      expect(await cacheManager.has(key, type)).toBe(true)

      // 删除缓存
      await cacheManager.delete(key, type)
      expect(await cacheManager.has(key, type)).toBe(false)
    })

    it('对于不存在的缓存应该返回 null', async () => {
      const result = await cacheManager.get('non-existent-key', 'build')
      expect(result).toBeNull()
    })
  })

  describe('缓存过期', () => {
    it('应该在缓存过期后返回 null', async () => {
      const key = 'expiry-test'
      const type = 'build'
      const data = { test: true }
      const shortTTL = 50 // 50ms

      await cacheManager.set(key, type, data, shortTTL)

      // 立即获取应该有效
      expect(await cacheManager.get(key, type)).toEqual(data)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 100))

      // 过期后应该返回 null
      expect(await cacheManager.get(key, type)).toBeNull()
    })
  })

  describe('缓存类型过滤', () => {
    it('应该只缓存允许的类型', async () => {
      const key = 'type-test'
      const data = { test: true }

      // 允许的类型应该被缓存
      await cacheManager.set(key, 'build', data)
      expect(await cacheManager.get(key, 'build')).toEqual(data)

      // 不允许的类型不应该被缓存
      await cacheManager.set(key, 'assets', data)
      expect(await cacheManager.get(key, 'assets')).toBeNull()
    })
  })

  describe('缓存清理', () => {
    it('应该能够清理特定类型的缓存', async () => {
      // 设置不同类型的缓存
      await cacheManager.set('key1', 'build', { test: 1 })
      await cacheManager.set('key2', 'deps', { test: 2 })
      await cacheManager.set('key3', 'build', { test: 3 })

      // 清理 build 类型的缓存
      await cacheManager.clear('build')

      // build 类型的缓存应该被清理
      expect(await cacheManager.get('key1', 'build')).toBeNull()
      expect(await cacheManager.get('key3', 'build')).toBeNull()

      // 其他类型的缓存应该仍然存在
      expect(await cacheManager.get('key2', 'deps')).toEqual({ test: 2 })
    })

    it('应该能够清理所有缓存', async () => {
      // 设置各种类型的缓存
      await cacheManager.set('key1', 'build', { test: 1 })
      await cacheManager.set('key2', 'deps', { test: 2 })
      await cacheManager.set('key3', 'modules', { test: 3 })

      // 清理所有缓存
      await cacheManager.clear()

      // 所有缓存都应该被清理
      expect(await cacheManager.get('key1', 'build')).toBeNull()
      expect(await cacheManager.get('key2', 'deps')).toBeNull()
      expect(await cacheManager.get('key3', 'modules')).toBeNull()
    })
  })

  describe('缓存统计', () => {
    it('应该提供正确的统计信息', async () => {
      // 设置一些缓存
      await cacheManager.set('key1', 'build', { data: 'test1' })
      await cacheManager.set('key2', 'deps', { data: 'test2' })
      await cacheManager.set('key3', 'build', { data: 'test3' })

      const stats = cacheManager.getStats()

      expect(stats.totalItems).toBe(3)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.byType.build.count).toBe(2)
      expect(stats.byType.deps.count).toBe(1)
      expect(stats.byType.modules.count).toBe(0)
    })

    it('应该计算正确的命中率', async () => {
      const key = 'hit-test'
      const type = 'build'
      const data = { test: true }

      // 设置缓存
      await cacheManager.set(key, type, data)

      // 命中缓存几次
      await cacheManager.get(key, type)
      await cacheManager.get(key, type)

      // 尝试获取不存在的缓存（未命中）
      await cacheManager.get('non-existent', type)

      const stats = cacheManager.getStats()
      
      // 2次命中，1次未命中，命中率应该是 2/3 ≈ 0.67
      expect(stats.hitRate).toBeCloseTo(0.67, 1)
    })
  })

  describe('持久化存储', () => {
    it('应该能够将缓存持久化到磁盘', async () => {
      const key = 'persist-test'
      const type = 'build'
      const data = { message: 'persistent data' }

      // 设置缓存
      await cacheManager.set(key, type, data)

      // 等待写入磁盘
      await new Promise(resolve => setTimeout(resolve, 100))

      // 检查缓存文件是否存在
      const files = await fs.readdir(tempCacheDir)
      expect(files.length).toBeGreaterThan(0)

      // 创建新的缓存管理器实例
      const newCacheManager = new CacheManager({
        enabled: true,
        cacheDir: tempCacheDir,
        types: ['build'],
        autoClean: { enabled: false, interval: 1, threshold: 0.8 }
      }, mockLogger)

      // 等待加载现有缓存
      await new Promise(resolve => setTimeout(resolve, 200))

      // 应该能够从新实例中获取之前的缓存
      const retrieved = await newCacheManager.get(key, type)
      expect(retrieved).toEqual(data)

      await newCacheManager.destroy()
    })
  })

  describe('缓存大小限制', () => {
    it('应该在超过大小限制时清理旧缓存', async () => {
      // 创建一个小缓存限制的管理器
      const smallCacheManager = new CacheManager({
        enabled: true,
        cacheDir: tempCacheDir,
        maxSize: 0.001, // 1KB 限制
        types: ['build'],
        autoClean: { enabled: false, interval: 1, threshold: 0.8 }
      }, mockLogger)

      // 添加大量数据直到超过限制
      const largeData = 'x'.repeat(500) // 500 字节
      const items = []

      for (let i = 0; i < 10; i++) {
        const key = `large-key-${i}`
        await smallCacheManager.set(key, 'build', { data: largeData })
        items.push(key)
        
        // 模拟不同的访问时间
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      const stats = smallCacheManager.getStats()
      
      // 由于大小限制，不应该有所有 10 项
      expect(stats.totalItems).toBeLessThan(10)

      await smallCacheManager.destroy()
    })
  })

  describe('自动清理', () => {
    it('应该能够执行手动清理', async () => {
      // 设置一些缓存，包括过期的
      await cacheManager.set('key1', 'build', { test: 1 })
      await cacheManager.set('key2', 'build', { test: 2 }, 1) // 1ms TTL，很快过期

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 50))

      // 执行清理
      await cacheManager.cleanup()

      const stats = cacheManager.getStats()
      
      // 过期的缓存应该被清理
      expect(await cacheManager.get('key2', 'build')).toBeNull()
      // 未过期的缓存应该仍然存在
      expect(await cacheManager.get('key1', 'build')).toEqual({ test: 1 })
    })
  })
})
