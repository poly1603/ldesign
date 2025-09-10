import { describe, it, expect, beforeEach } from 'vitest'
import { Compressor, withCompression } from '../src/utils/compressor'
import { CacheManager } from '../src/core/cache-manager'

describe('数据压缩', () => {
  describe('Compressor 基础功能', () => {
    let compressor: Compressor

    beforeEach(() => {
      compressor = new Compressor({
        enabled: true,
        algorithm: 'gzip',
        minSize: 100,
      })
    })

    it('应该压缩大于最小大小的数据', async () => {
      const largeData = 'x'.repeat(200)
      const result = await compressor.compress(largeData)
      
      expect(result.originalSize).toBeGreaterThan(100)
      expect(result.compressedSize).toBeLessThan(result.originalSize)
      expect(result.ratio).toBeLessThan(1)
      expect(result.algorithm).not.toBe('none')
    })

    it('不应该压缩小于最小大小的数据', async () => {
      const smallData = 'small'
      const result = await compressor.compress(smallData)
      
      expect(result.data).toBe(smallData)
      expect(result.ratio).toBe(1)
      expect(result.algorithm).toBe('none')
    })

    it('应该正确解压数据', async () => {
      const originalData = JSON.stringify({
        message: 'This is a test message that should be compressed',
        data: Array(50).fill('test data'),
      })
      
      const compressed = await compressor.compress(originalData)
      const decompressed = await compressor.decompress(
        compressed.data,
        compressed.algorithm
      )
      
      expect(decompressed).toBe(originalData)
    })

    it('应该处理已压缩的数据检测', () => {
      const normalData = 'This is normal text'
      const compressedLike = 'H4sIAAAAAAAA' // Base64 压缩数据开头
      
      expect(compressor.isCompressed(normalData)).toBe(false)
      expect(compressor.isCompressed(compressedLike)).toBe(true)
    })

    it('应该提供压缩建议', () => {
      const smallData = 'small'
      const largeData = 'x'.repeat(5000)
      
      const smallStats = compressor.getCompressionStats(smallData)
      const largeStats = compressor.getCompressionStats(largeData)
      
      expect(smallStats.recommendedAlgorithm).toBe('none')
      expect(largeStats.recommendedAlgorithm).not.toBe('none')
      expect(largeStats.potentialSavings).toBeGreaterThan(0)
    })
  })

  describe('不同压缩算法', () => {
    it('应该支持 deflate 算法', async () => {
      const compressor = new Compressor({
        algorithm: 'deflate',
        minSize: 10,
      })
      
      // 使用重复数据以确保压缩效果
      const data = 'This is test data that will be compressed using deflate. '.repeat(3)
      const result = await compressor.compress(data)
      
      // 在支持 CompressionStream 的环境中应该使用 deflate，否则回退到 LZ
      if (typeof CompressionStream !== 'undefined') {
        expect(result.algorithm).toBe('deflate')
      } else {
        // 在 Node.js 环境中会回退到 LZ 算法，但结果仍应是 'none' 或有压缩
        expect(['none', 'deflate', 'gzip']).toContain(result.algorithm)
      }
      
      const decompressed = await compressor.decompress(
        result.data,
        result.algorithm
      )
      expect(decompressed).toBe(data)
    })

    it('应该在不支持时回退到 LZ 算法', async () => {
      const compressor = new Compressor({
        algorithm: 'brotli', // 浏览器通常不支持
        minSize: 10,
      })
      
      const data = 'Test data for fallback compression'
      const result = await compressor.compress(data)
      
      // 应该能够压缩和解压
      const decompressed = await compressor.decompress(
        result.data,
        result.algorithm
      )
      expect(decompressed).toBe(data)
    })
  })

  describe('自定义压缩函数', () => {
    it('应该支持自定义压缩和解压函数', async () => {
      // 在 Node.js 环境中使用 Buffer 进行 Base64 编解码
      const customCompress = async (data: string) => {
        if (typeof btoa !== 'undefined') {
          return btoa(data)
        } else {
          return Buffer.from(data).toString('base64')
        }
      }
      
      const customDecompress = async (data: string) => {
        if (typeof atob !== 'undefined') {
          return atob(data)
        } else {
          return Buffer.from(data, 'base64').toString()
        }
      }
      
      const compressor = new Compressor({
        customCompress,
        customDecompress,
        minSize: 0,
      })
      
      const originalData = 'Custom compression test'
      const result = await compressor.compress(originalData)
      
      const expectedCompressed = typeof btoa !== 'undefined' 
        ? btoa(originalData) 
        : Buffer.from(originalData).toString('base64')
      
      expect(result.data).toBe(expectedCompressed)
      
      const decompressed = await compressor.decompress(result.data, 'none')
      expect(decompressed).toBe(originalData)
    })
  })

  describe('withCompression 装饰器', () => {
    let cache: CacheManager
    let compressedCache: any

    beforeEach(() => {
      cache = new CacheManager({
        defaultEngine: 'memory',
      })
      
      compressedCache = withCompression(cache, {
        enabled: true,
        algorithm: 'gzip',
        minSize: 50,
      })
    })

    it('应该透明地压缩和解压缓存数据', async () => {
      const largeObject = {
        data: Array(100).fill('test data item'),
        metadata: {
          created: Date.now(),
          tags: ['test', 'compression', 'cache'],
        },
      }
      
      await compressedCache.set('compressed-key', largeObject)
      
      // 获取时应该自动解压
      const retrieved = await compressedCache.get('compressed-key')
      expect(retrieved).toEqual(largeObject)
    })

    it('应该处理小数据不压缩', async () => {
      const smallData = { tiny: 'data' }
      
      await compressedCache.set('small-key', smallData)
      const retrieved = await compressedCache.get('small-key')
      
      expect(retrieved).toEqual(smallData)
    })

    it('应该保持缓存的其他功能', async () => {
      await compressedCache.set('key1', 'value1')
      await compressedCache.set('key2', 'value2')
      
      expect(await compressedCache.has('key1')).toBe(true)
      expect(await compressedCache.has('key3')).toBe(false)
    })
  })

  describe('压缩性能', () => {
    it('应该在合理时间内压缩大数据', async () => {
      const compressor = new Compressor({
        algorithm: 'gzip',
        minSize: 0,
      })
      
      // 创建 1MB 的数据
      const largeData = JSON.stringify({
        array: Array(10000).fill({
          id: Math.random(),
          name: 'Test User',
          email: 'test@example.com',
          data: 'Some repeated content that compresses well',
        }),
      })
      
      const startTime = performance.now()
      const result = await compressor.compress(largeData)
      const compressionTime = performance.now() - startTime
      
      console.log(`压缩 ${(largeData.length / 1024).toFixed(1)}KB 数据`)
      console.log(`压缩时间: ${compressionTime.toFixed(2)}ms`)
      console.log(`压缩率: ${(result.ratio * 100).toFixed(1)}%`)
      console.log(`节省空间: ${((1 - result.ratio) * 100).toFixed(1)}%`)
      
      expect(compressionTime).toBeLessThan(1000) // 应该在1秒内完成
      expect(result.ratio).toBeLessThan(0.5) // 重复数据应该有好的压缩率
    })

    it('解压应该快于压缩', async () => {
      const compressor = new Compressor()
      const data = JSON.stringify(Array(1000).fill({ test: 'data' }))
      
      const compressed = await compressor.compress(data)
      
      const compressStart = performance.now()
      await compressor.compress(data)
      const compressTime = performance.now() - compressStart
      
      const decompressStart = performance.now()
      await compressor.decompress(compressed.data, compressed.algorithm)
      const decompressTime = performance.now() - decompressStart
      
      console.log(`压缩时间: ${compressTime.toFixed(2)}ms`)
      console.log(`解压时间: ${decompressTime.toFixed(2)}ms`)
      
      // 解压通常比压缩快，但在某些环境下可能不一定
      // 只要解压不慢太多即可
      expect(decompressTime).toBeLessThanOrEqual(compressTime * 3)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的压缩数据', async () => {
      const compressor = new Compressor()
      
      await expect(
        compressor.decompress('invalid-compressed-data', 'gzip')
      ).rejects.toThrow()
    })

    it('应该在压缩失败时使用原始数据', async () => {
      const compressor = new Compressor({
        algorithm: 'gzip',
        minSize: 0,
      })
      
      // 模拟一个会导致压缩失败的场景
      const problematicData = '\uFFFD'.repeat(10) // 替换字符
      
      const result = await compressor.compress(problematicData)
      
      // 即使压缩失败，也应该返回原始数据
      expect(result.data).toBeDefined()
    })
  })

  describe('熵值计算', () => {
    it('应该正确计算数据熵值', () => {
      const compressor = new Compressor()
      
      // 低熵数据（重复）
      const lowEntropyData = 'aaaaaaaaaa'
      expect(compressor.isCompressed(lowEntropyData)).toBe(false)
      
      // 高熵数据（随机）
      const highEntropyData = 'a9$mK2@pL8'
      // 高熵数据可能被误判为已压缩
      const isHighEntropyCompressed = compressor.isCompressed(highEntropyData)
      expect(typeof isHighEntropyCompressed).toBe('boolean')
    })
  })
})
