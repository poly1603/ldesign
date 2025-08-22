/**
 * PDF API层测试用例
 * 测试PDF API的核心功能，包括文档加载、页面渲染、预览组件等
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { PdfApi } from '../../src/api/pdf-api'
import { PdfPreviewOptions } from '../../src/types'

// 模拟PDF.js库
const mockPdfJs = {
  version: '4.0.379',
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: vi.fn(),
}

// 模拟Canvas元素
const mockCanvas = {
  getContext: vi.fn(),
  width: 0,
  height: 0,
  toBlob: vi.fn(),
  toDataURL: vi.fn(),
} as unknown as HTMLCanvasElement

// 模拟Canvas 2D上下文
const mockContext = {
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
} as unknown as CanvasRenderingContext2D

// 模拟文档元素
const mockContainer = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  querySelector: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  style: {},
  offsetWidth: 800,
  offsetHeight: 600,
} as unknown as HTMLElement

describe('PDF API测试', () => {
  let api: PdfApi

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // 配置Canvas mock
    mockCanvas.getContext = vi.fn().mockReturnValue(mockContext)
    
    // 配置DOM mock
    vi.stubGlobal('document', {
      createElement: vi.fn().mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas
        }
        return {}
      }),
    })

    api = new PdfApi({
      pdfjs: mockPdfJs,
      enableWorker: false,
      debug: false,
    })
  })

  afterEach(() => {
    api.destroy()
    vi.unstubAllGlobals()
  })

  describe('API初始化', () => {
    it('应该成功初始化API', () => {
      expect(api).toBeDefined()
      expect(api.isInitialized).toBe(true)
    })

    it('应该使用默认配置', () => {
      const defaultApi = new PdfApi()
      expect(defaultApi).toBeDefined()
      defaultApi.destroy()
    })

    it('应该正确设置配置选项', () => {
      const customApi = new PdfApi({
        enableWorker: true,
        debug: true,
        workerPoolSize: 4,
      })
      
      expect(customApi).toBeDefined()
      customApi.destroy()
    })
  })

  describe('文档预览', () => {
    const mockOptions: PdfPreviewOptions = {
      container: mockContainer,
      scale: 1.0,
      enableNavigation: true,
      enableZoom: true,
    }

    it('应该创建PDF预览', async () => {
      const preview = await api.createPreview('https://example.com/test.pdf', mockOptions)
      
      expect(preview).toBeDefined()
      expect(preview.totalPages).toBeGreaterThan(0)
      expect(preview.currentPage).toBe(1)
    })

    it('应该支持ArrayBuffer数据源', async () => {
      const buffer = new ArrayBuffer(1024)
      const preview = await api.createPreview(buffer, mockOptions)
      
      expect(preview).toBeDefined()
    })

    it('应该支持File对象数据源', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const preview = await api.createPreview(file, mockOptions)
      
      expect(preview).toBeDefined()
    })

    it('应该处理无效数据源', async () => {
      await expect(api.createPreview(null as any, mockOptions)).rejects.toThrow()
    })
  })

  describe('页面渲染', () => {
    it('应该渲染PDF页面到Canvas', async () => {
      const result = await api.renderPage({
        source: 'https://example.com/test.pdf',
        pageNumber: 1,
        canvas: mockCanvas,
        scale: 1.0,
      })

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该支持自定义渲染选项', async () => {
      const result = await api.renderPage({
        source: 'https://example.com/test.pdf',
        pageNumber: 1,
        canvas: mockCanvas,
        scale: 2.0,
        rotation: 90,
        background: '#ffffff',
      })

      expect(result).toBeDefined()
    })

    it('应该处理渲染错误', async () => {
      // 模拟Canvas错误
      mockCanvas.getContext = vi.fn().mockReturnValue(null)

      await expect(api.renderPage({
        source: 'https://example.com/test.pdf',
        pageNumber: 1,
        canvas: mockCanvas,
      })).rejects.toThrow()
    })
  })

  describe('文档信息', () => {
    it('应该获取PDF文档信息', async () => {
      const info = await api.getDocumentInfo('https://example.com/test.pdf')
      
      expect(info).toBeDefined()
      expect(info.numPages).toBeGreaterThan(0)
      expect(info.fingerprint).toBeDefined()
    })

    it('应该获取文档元数据', async () => {
      const metadata = await api.getDocumentMetadata('https://example.com/test.pdf')
      
      expect(metadata).toBeDefined()
      expect(metadata.info).toBeDefined()
    })

    it('应该获取文档大纲', async () => {
      const outline = await api.getDocumentOutline('https://example.com/test.pdf')
      
      expect(outline).toBeDefined()
      expect(Array.isArray(outline)).toBe(true)
    })
  })

  describe('文本提取', () => {
    it('应该提取页面文本内容', async () => {
      const textContent = await api.extractText('https://example.com/test.pdf', 1)
      
      expect(textContent).toBeDefined()
      expect(textContent.items).toBeDefined()
      expect(Array.isArray(textContent.items)).toBe(true)
    })

    it('应该支持批量文本提取', async () => {
      const textContent = await api.extractText('https://example.com/test.pdf', [1, 2, 3])
      
      expect(textContent).toBeDefined()
      expect(Array.isArray(textContent)).toBe(true)
      expect(textContent.length).toBe(3)
    })
  })

  describe('缓存管理', () => {
    it('应该缓存已加载的文档', async () => {
      const source = 'https://example.com/test.pdf'
      
      const info1 = await api.getDocumentInfo(source)
      const info2 = await api.getDocumentInfo(source)
      
      expect(info1).toBe(info2) // 应该返回相同的引用
    })

    it('应该清理缓存', () => {
      api.clearCache()
      
      const stats = api.getCacheStats()
      expect(stats.itemCount).toBe(0)
    })

    it('应该获取缓存统计信息', async () => {
      await api.getDocumentInfo('https://example.com/test.pdf')
      
      const stats = api.getCacheStats()
      expect(stats).toBeDefined()
      expect(typeof stats.itemCount).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      await expect(api.getDocumentInfo('https://invalid-url')).rejects.toThrow()
    })

    it('应该处理无效页码', async () => {
      await expect(api.renderPage({
        source: 'https://example.com/test.pdf',
        pageNumber: -1,
        canvas: mockCanvas,
      })).rejects.toThrow()
    })

    it('应该处理损坏的PDF文件', async () => {
      const invalidData = new ArrayBuffer(10)
      await expect(api.getDocumentInfo(invalidData)).rejects.toThrow()
    })
  })

  describe('事件系统', () => {
    it('应该发送加载进度事件', async () => {
      const progressSpy = vi.fn()
      api.on('loadProgress', progressSpy)
      
      await api.getDocumentInfo('https://example.com/test.pdf')
      
      expect(progressSpy).toHaveBeenCalled()
    })

    it('应该发送渲染完成事件', async () => {
      const renderSpy = vi.fn()
      api.on('renderComplete', renderSpy)
      
      await api.renderPage({
        source: 'https://example.com/test.pdf',
        pageNumber: 1,
        canvas: mockCanvas,
      })
      
      expect(renderSpy).toHaveBeenCalled()
    })

    it('应该发送错误事件', async () => {
      const errorSpy = vi.fn()
      api.on('error', errorSpy)
      
      try {
        await api.getDocumentInfo('https://invalid-url')
      } catch {
        // 忽略错误
      }
      
      expect(errorSpy).toHaveBeenCalled()
    })
  })

  describe('性能监控', () => {
    it('应该记录性能指标', async () => {
      await api.getDocumentInfo('https://example.com/test.pdf')
      
      const metrics = api.getPerformanceMetrics()
      expect(metrics).toBeDefined()
      expect(typeof metrics.loadTime).toBe('number')
      expect(typeof metrics.renderTime).toBe('number')
    })

    it('应该重置性能指标', () => {
      api.resetPerformanceMetrics()
      
      const metrics = api.getPerformanceMetrics()
      expect(metrics.loadTime).toBe(0)
      expect(metrics.renderTime).toBe(0)
    })
  })

  describe('销毁和清理', () => {
    it('应该正确销毁API实例', () => {
      const testApi = new PdfApi()
      testApi.destroy()
      
      expect(() => {
        testApi.getDocumentInfo('https://example.com/test.pdf')
      }).toThrow()
    })

    it('应该清理所有资源', async () => {
      await api.getDocumentInfo('https://example.com/test.pdf')
      
      const stats = api.getCacheStats()
      expect(stats.itemCount).toBeGreaterThan(0)
      
      api.destroy()
      
      // 销毁后应该清理所有资源
      expect(() => api.getCacheStats()).toThrow()
    })
  })
})