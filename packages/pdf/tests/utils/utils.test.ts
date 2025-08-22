/**
 * 工具函数测试用例
 * 测试各种工具函数的功能和边界情况
 */

import { describe, expect, it, vi } from 'vitest'
import {
  typeUtils,
  dataUtils,
  cacheUtils,
  asyncUtils,
  domUtils,
  mathUtils,
  formatUtils,
  debugUtils,
} from '../../src/utils'

describe('工具函数测试', () => {
  describe('类型检查工具', () => {
    it('应该正确检查ArrayBuffer', () => {
      const buffer = new ArrayBuffer(10)
      const notBuffer = new Uint8Array(10)
      
      expect(typeUtils.isArrayBuffer(buffer)).toBe(true)
      expect(typeUtils.isArrayBuffer(notBuffer)).toBe(false)
      expect(typeUtils.isArrayBuffer(null)).toBe(false)
    })

    it('应该正确检查Uint8Array', () => {
      const array = new Uint8Array(10)
      const notArray = new ArrayBuffer(10)
      
      expect(typeUtils.isUint8Array(array)).toBe(true)
      expect(typeUtils.isUint8Array(notArray)).toBe(false)
    })

    it('应该正确检查File', () => {
      const file = new File(['test'], 'test.txt')
      const notFile = new Blob(['test'])
      
      expect(typeUtils.isFile(file)).toBe(true)
      expect(typeUtils.isFile(notFile)).toBe(false)
    })

    it('应该正确检查URL', () => {
      expect(typeUtils.isUrl('https://example.com')).toBe(true)
      expect(typeUtils.isUrl('http://localhost:3000')).toBe(true)
      expect(typeUtils.isUrl('not-a-url')).toBe(false)
      expect(typeUtils.isUrl('')).toBe(false)
      expect(typeUtils.isUrl(null)).toBe(false)
    })

    it('应该正确验证页码', () => {
      expect(typeUtils.isValidPageNumber(1)).toBe(true)
      expect(typeUtils.isValidPageNumber(1, 10)).toBe(true)
      expect(typeUtils.isValidPageNumber(0)).toBe(false)
      expect(typeUtils.isValidPageNumber(-1)).toBe(false)
      expect(typeUtils.isValidPageNumber(1.5)).toBe(false)
      expect(typeUtils.isValidPageNumber(11, 10)).toBe(false)
      expect(typeUtils.isValidPageNumber('1')).toBe(false)
    })
  })

  describe('数据转换工具', () => {
    it('应该正确转换ArrayBuffer和Uint8Array', () => {
      const buffer = new ArrayBuffer(10)
      const array = dataUtils.arrayBufferToUint8Array(buffer)
      
      expect(array).toBeInstanceOf(Uint8Array)
      expect(array.length).toBe(10)
      
      const convertedBuffer = dataUtils.uint8ArrayToArrayBuffer(array)
      expect(convertedBuffer).toBeInstanceOf(ArrayBuffer)
      expect(convertedBuffer.byteLength).toBe(10)
    })

    it('应该正确转换Base64', () => {
      const originalData = 'Hello, World!'
      const buffer = new TextEncoder().encode(originalData).buffer
      
      const base64 = dataUtils.arrayBufferToBase64(buffer)
      expect(typeof base64).toBe('string')
      
      const convertedBuffer = dataUtils.base64ToArrayBuffer(`data:text/plain;base64,${base64}`)
      const convertedText = new TextDecoder().decode(convertedBuffer)
      
      expect(convertedText).toBe(originalData)
    })

    it('应该处理Blob转换', async () => {
      const testData = 'test data'
      const blob = new Blob([testData], { type: 'text/plain' })
      
      const buffer = await dataUtils.blobToArrayBuffer(blob)
      expect(buffer).toBeInstanceOf(ArrayBuffer)
      
      const text = new TextDecoder().decode(buffer)
      expect(text).toBe(testData)
    })
  })

  describe('缓存工具', () => {
    it('应该生成一致的哈希', () => {
      const str1 = 'test string'
      const str2 = 'test string'
      const str3 = 'different string'
      
      const hash1 = cacheUtils.hashString(str1)
      const hash2 = cacheUtils.hashString(str2)
      const hash3 = cacheUtils.hashString(str3)
      
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('应该为相同缓冲区生成相同哈希', () => {
      const buffer1 = new Uint8Array([1, 2, 3, 4, 5])
      const buffer2 = new Uint8Array([1, 2, 3, 4, 5])
      const buffer3 = new Uint8Array([1, 2, 3, 4, 6])
      
      const hash1 = cacheUtils.hashBuffer(buffer1)
      const hash2 = cacheUtils.hashBuffer(buffer2)
      const hash3 = cacheUtils.hashBuffer(buffer3)
      
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('应该生成正确的缓存键', () => {
      const docKey = cacheUtils.generateDocumentKey('https://example.com/test.pdf')
      const pageKey = cacheUtils.generatePageKey(docKey, 1)
      const renderKey = cacheUtils.generateRenderKey(pageKey, 1.5, 90)
      
      expect(docKey).toContain('doc_')
      expect(pageKey).toContain('page_')
      expect(pageKey).toContain('_1')
      expect(renderKey).toContain('render_')
      expect(renderKey).toContain('_1.5_90_')
    })
  })

  describe('异步工具', () => {
    it('应该实现延迟功能', async () => {
      const start = Date.now()
      await asyncUtils.delay(100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(90) // 允许一些误差
    })

    it('应该实现超时功能', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 200))
      
      await expect(
        asyncUtils.withTimeout(slowPromise, 100)
      ).rejects.toThrow('Operation timed out')
    })

    it('应该实现重试功能', async () => {
      let attempts = 0
      const flaky = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      }
      
      const result = await asyncUtils.retry(flaky, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('应该限制并发执行', async () => {
      const items = [1, 2, 3, 4, 5]
      let concurrent = 0
      let maxConcurrent = 0
      
      const executor = async (item: number) => {
        concurrent++
        maxConcurrent = Math.max(maxConcurrent, concurrent)
        await asyncUtils.delay(50)
        concurrent--
        return item * 2
      }
      
      const results = await asyncUtils.batchExecute(items, executor, 2)
      
      expect(results).toHaveLength(5)
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })
  })

  describe('DOM工具', () => {
    it('应该创建Canvas元素', () => {
      const canvas = domUtils.createCanvas(800, 600)
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
    })

    it('应该获取Canvas上下文', () => {
      const canvas = domUtils.createCanvas(100, 100)
      const context = domUtils.getCanvas2DContext(canvas)
      
      expect(context).toBeInstanceOf(CanvasRenderingContext2D)
    })

    it('应该正确检查功能支持', () => {
      expect(typeof domUtils.supportsOffscreenCanvas()).toBe('boolean')
      expect(typeof domUtils.supportsWebWorker()).toBe('boolean')
    })
  })

  describe('数学工具', () => {
    it('应该正确限制数值范围', () => {
      expect(mathUtils.clamp(5, 0, 10)).toBe(5)
      expect(mathUtils.clamp(-5, 0, 10)).toBe(0)
      expect(mathUtils.clamp(15, 0, 10)).toBe(10)
    })

    it('应该实现线性插值', () => {
      expect(mathUtils.lerp(0, 10, 0.5)).toBe(5)
      expect(mathUtils.lerp(0, 10, 0)).toBe(0)
      expect(mathUtils.lerp(0, 10, 1)).toBe(10)
    })

    it('应该计算两点距离', () => {
      expect(mathUtils.distance(0, 0, 3, 4)).toBe(5)
      expect(mathUtils.distance(0, 0, 0, 0)).toBe(0)
    })

    it('应该转换角度和弧度', () => {
      expect(mathUtils.degToRad(180)).toBeCloseTo(Math.PI)
      expect(mathUtils.radToDeg(Math.PI)).toBeCloseTo(180)
    })

    it('应该计算适应缩放', () => {
      const scale = mathUtils.calculateFitScale(200, 100, 100, 100)
      expect(scale).toBe(0.5) // 应该缩放到50%以适应容器
    })
  })

  describe('格式化工具', () => {
    it('应该格式化文件大小', () => {
      expect(formatUtils.formatFileSize(0)).toBe('0 B')
      expect(formatUtils.formatFileSize(1024)).toBe('1 KB')
      expect(formatUtils.formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatUtils.formatFileSize(1536)).toBe('1.5 KB')
    })

    it('应该格式化时间', () => {
      expect(formatUtils.formatDuration(500)).toBe('500ms')
      expect(formatUtils.formatDuration(1500)).toBe('1.5s')
      expect(formatUtils.formatDuration(90000)).toBe('1.5m')
      expect(formatUtils.formatDuration(7200000)).toBe('2.0h')
    })

    it('应该格式化百分比', () => {
      expect(formatUtils.formatPercentage(50)).toBe('50.0%')
      expect(formatUtils.formatPercentage(33.333, 2)).toBe('33.33%')
    })
  })

  describe('调试工具', () => {
    it('应该创建日志记录器', () => {
      const logger = debugUtils.createLogger('TEST', true)
      
      expect(typeof logger.log).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.time).toBe('function')
      expect(typeof logger.timeEnd).toBe('function')
    })

    it('应该执行性能基准测试', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await debugUtils.benchmark('test', async () => {
        await asyncUtils.delay(10)
        return 'completed'
      })
      
      expect(result).toBe('completed')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Benchmark] test:'),
        expect.stringContaining('ms')
      )
      
      consoleSpy.mockRestore()
    })

    it('应该处理基准测试中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(
        debugUtils.benchmark('failing test', async () => {
          throw new Error('Test error')
        })
      ).rejects.toThrow('Test error')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Benchmark] failing test failed'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
})