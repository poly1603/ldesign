/**
 * PDF引擎测试用例
 * 测试PDF引擎的核心功能，包括初始化、文档加载、页面获取等
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { PdfEngine, createPdfEngine } from '../../src/engine/pdf-engine'
import { ErrorCode } from '../../src/types'

// 模拟PDF.js库
const mockPdfJs = {
  version: '4.0.379',
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: vi.fn(),
}

// 模拟PDF文档
const mockPdfDoc = {
  numPages: 10,
  fingerprint: 'test-fingerprint',
  getPage: vi.fn(),
  getMetadata: vi.fn(),
  getOutline: vi.fn(),
  getPermissions: vi.fn(),
  destroy: vi.fn(),
}

// 模拟PDF页面
const mockPdfPage = {
  pageNumber: 1,
  pageIndex: 0,
  rotate: 0,
  ref: { num: 1, gen: 0 },
  userUnit: 1,
  view: [0, 0, 612, 792],
  getViewport: vi.fn(),
  render: vi.fn(),
  getTextContent: vi.fn(),
  getAnnotations: vi.fn(),
  cleanup: vi.fn(),
}

// 模拟加载任务
const mockLoadingTask = {
  promise: Promise.resolve(mockPdfDoc),
  destroy: vi.fn(),
}

describe('PDF引擎测试', () => {
  let engine: PdfEngine

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // 配置mock返回值
    mockPdfJs.getDocument.mockReturnValue(mockLoadingTask)
    mockPdfDoc.getPage.mockResolvedValue(mockPdfPage)
    mockPdfDoc.getMetadata.mockResolvedValue({
      info: { Title: 'Test PDF' },
      metadata: null,
    })
    mockPdfDoc.getOutline.mockResolvedValue([])
    mockPdfDoc.getPermissions.mockResolvedValue([])
    
    mockPdfPage.getViewport.mockReturnValue({
      width: 612,
      height: 792,
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      transform: [1, 0, 0, 1, 0, 0],
    })
    
    mockPdfPage.render.mockReturnValue({
      promise: Promise.resolve(),
      cancel: vi.fn(),
    })
    
    mockPdfPage.getTextContent.mockResolvedValue({
      items: [],
      styles: {},
    })
    
    mockPdfPage.getAnnotations.mockResolvedValue([])

    engine = createPdfEngine({
      debug: false,
      enablePerformanceMonitoring: true,
    })
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('引擎初始化', () => {
    it('应该成功初始化引擎', async () => {
      await expect(engine.initialize(mockPdfJs)).resolves.not.toThrow()
      expect(engine.status.initialized).toBe(true)
    })

    it('应该拒绝无效的PDF.js库', async () => {
      await expect(engine.initialize(null)).rejects.toThrow()
      await expect(engine.initialize({})).rejects.toThrow()
    })

    it('应该避免重复初始化', async () => {
      await engine.initialize(mockPdfJs)
      await engine.initialize(mockPdfJs) // 第二次调用应该被忽略
      expect(engine.status.initialized).toBe(true)
    })

    it('应该在销毁后拒绝初始化', async () => {
      engine.destroy()
      await expect(engine.initialize(mockPdfJs)).rejects.toThrow()
    })
  })

  describe('文档加载', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该成功加载PDF文档（URL）', async () => {
      const source = 'https://example.com/test.pdf'
      const document = await engine.loadDocument(source)
      
      expect(document).toBeDefined()
      expect(document.numPages).toBe(10)
      expect(document.fingerprint).toBe('test-fingerprint')
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          url: source,
        })
      )
    })

    it('应该成功加载PDF文档（ArrayBuffer）', async () => {
      const source = new ArrayBuffer(1024)
      const document = await engine.loadDocument(source)
      
      expect(document).toBeDefined()
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          data: source,
        })
      )
    })

    it('应该成功加载PDF文档（Uint8Array）', async () => {
      const source = new Uint8Array(1024)
      const document = await engine.loadDocument(source)
      
      expect(document).toBeDefined()
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          data: source,
        })
      )
    })

    it('应该成功加载PDF文档（File）', async () => {
      const source = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const document = await engine.loadDocument(source)
      
      expect(document).toBeDefined()
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          data: source,
        })
      )
    })

    it('应该缓存已加载的文档', async () => {
      const source = 'https://example.com/test.pdf'
      
      const doc1 = await engine.loadDocument(source)
      const doc2 = await engine.loadDocument(source)
      
      expect(doc1).toBe(doc2)
      expect(mockPdfJs.getDocument).toHaveBeenCalledTimes(1)
    })

    it('应该处理加载错误', async () => {
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.reject(new Error('Load failed')),
        destroy: vi.fn(),
      })
      
      const source = 'https://example.com/test.pdf'
      await expect(engine.loadDocument(source)).rejects.toThrow()
    })

    it('应该处理密码错误', async () => {
      const passwordError = new Error('Password required')
      passwordError.name = 'PasswordException'
      
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.reject(passwordError),
        destroy: vi.fn(),
      })
      
      const source = 'https://example.com/test.pdf'
      
      try {
        await engine.loadDocument(source)
        expect.fail('应该抛出错误')
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.PASSWORD_REQUIRED)
      }
    })
  })

  describe('页面获取', () => {
    let document: any

    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
      document = await engine.loadDocument('https://example.com/test.pdf')
    })

    it('应该成功获取PDF页面', async () => {
      const page = await document.getPage(1)
      
      expect(page).toBeDefined()
      expect(page.pageNumber).toBe(1)
      expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1)
    })

    it('应该拒绝无效的页码', async () => {
      await expect(document.getPage(0)).rejects.toThrow()
      await expect(document.getPage(11)).rejects.toThrow()
      await expect(document.getPage(-1)).rejects.toThrow()
    })

    it('应该缓存已获取的页面', async () => {
      const page1 = await document.getPage(1)
      const page2 = await document.getPage(1)
      
      expect(page1).toBe(page2)
      expect(mockPdfDoc.getPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('元数据获取', () => {
    let document: any

    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
      document = await engine.loadDocument('https://example.com/test.pdf')
    })

    it('应该成功获取文档元数据', async () => {
      const metadata = await document.getMetadata()
      
      expect(metadata).toBeDefined()
      expect(metadata.info.Title).toBe('Test PDF')
    })

    it('应该获取文档大纲', async () => {
      const outline = await document.getOutline()
      
      expect(outline).toBeDefined()
      expect(Array.isArray(outline)).toBe(true)
    })

    it('应该获取文档权限', async () => {
      const permissions = await document.getPermissions()
      
      expect(permissions).toBeDefined()
      expect(Array.isArray(permissions)).toBe(true)
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该记录性能指标', async () => {
      await engine.loadDocument('https://example.com/test.pdf')
      
      const metrics = engine.metrics
      expect(metrics).toBeDefined()
      expect(typeof metrics.loadTime).toBe('number')
      expect(typeof metrics.cacheHitRate).toBe('number')
      expect(typeof metrics.errorRate).toBe('number')
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该发送文档加载事件', async () => {
      const eventSpy = vi.fn()
      engine.on('documentLoaded', eventSpy)
      
      await engine.loadDocument('https://example.com/test.pdf')
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.any(Object),
          loadTime: expect.any(Number),
        })
      )
    })

    it('应该发送错误事件', async () => {
      const eventSpy = vi.fn()
      engine.on('error', eventSpy)
      
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.reject(new Error('Test error')),
        destroy: vi.fn(),
      })
      
      try {
        await engine.loadDocument('https://example.com/test.pdf')
      } catch {
        // 忽略错误
      }
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        })
      )
    })
  })

  describe('缓存管理', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该限制并发文档数量', async () => {
      // 设置较小的并发限制
      const smallEngine = createPdfEngine({
        maxConcurrentDocuments: 2,
      })
      await smallEngine.initialize(mockPdfJs)
      
      try {
        // 加载多个文档
        await Promise.all([
          smallEngine.loadDocument('https://example.com/test1.pdf'),
          smallEngine.loadDocument('https://example.com/test2.pdf'),
          smallEngine.loadDocument('https://example.com/test3.pdf'),
        ])
        
        // 验证缓存限制
        expect(smallEngine.status.documentCount).toBeLessThanOrEqual(2)
      } finally {
        smallEngine.destroy()
      }
    })
  })

  describe('销毁和清理', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该正确销毁引擎', () => {
      engine.destroy()
      
      expect(engine.status.destroyed).toBe(true)
      expect(engine.status.initialized).toBe(false)
    })

    it('应该清理所有资源', async () => {
      await engine.loadDocument('https://example.com/test.pdf')
      
      expect(engine.status.documentCount).toBeGreaterThan(0)
      
      engine.destroy()
      
      expect(engine.status.documentCount).toBe(0)
      expect(engine.status.pageCount).toBe(0)
    })
  })

  describe('错误恢复', () => {
    beforeEach(async () => {
      await engine.initialize(mockPdfJs)
    })

    it('应该正确识别可恢复的错误', async () => {
      const networkError = new Error('Network error')
      networkError.name = 'MissingPDFException'
      
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.reject(networkError),
        destroy: vi.fn(),
      })
      
      try {
        await engine.loadDocument('https://example.com/test.pdf')
        expect.fail('应该抛出错误')
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.NETWORK_ERROR)
        expect(error.recoverable).toBe(true)
      }
    })
  })
})