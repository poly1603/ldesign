/**
 * PDF缩略图管理器
 * 提供缩略图生成、缓存和管理功能
 */

import type { PDFPageProxy } from 'pdfjs-dist'
import type { ThumbnailOptions } from '../core/types'
import { createThumbnail } from './pdf-utils'
import { ThumbnailCacheManager } from './cache-manager'

/**
 * 缩略图项
 */
interface ThumbnailItem {
  pageNumber: number
  canvas: HTMLCanvasElement
  width: number
  height: number
  scale: number
  isLoading: boolean
  error?: Error
}

/**
 * 缩略图管理器
 */
export class PdfThumbnailManager {
  private thumbnails = new Map<number, ThumbnailItem>()
  private cacheManager: ThumbnailCacheManager
  private documentId: string
  private loadingPromises = new Map<number, Promise<HTMLCanvasElement>>()

  constructor(documentId: string) {
    this.documentId = documentId
    this.cacheManager = new ThumbnailCacheManager()
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(
    page: PDFPageProxy,
    pageNumber: number,
    options: ThumbnailOptions = {}
  ): Promise<HTMLCanvasElement> {
    const {
      width = 150,
      height = 200,
      scale,
      enableCache = true,
    } = options

    // 检查缓存
    if (enableCache) {
      const cached = this.cacheManager.getCachedThumbnail(
        this.documentId,
        pageNumber,
        width,
        height
      )
      if (cached) {
        return cached
      }
    }

    // 检查是否正在加载
    const loadingPromise = this.loadingPromises.get(pageNumber)
    if (loadingPromise) {
      return loadingPromise
    }

    // 创建加载Promise
    const promise = this.createThumbnailInternal(page, pageNumber, options)
    this.loadingPromises.set(pageNumber, promise)

    try {
      const canvas = await promise
      
      // 缓存结果
      if (enableCache) {
        this.cacheManager.cacheThumbnail(
          this.documentId,
          pageNumber,
          width,
          height,
          canvas
        )
      }

      // 存储缩略图信息
      this.thumbnails.set(pageNumber, {
        pageNumber,
        canvas,
        width: canvas.width,
        height: canvas.height,
        scale: scale || this.calculateScale(page, width, height),
        isLoading: false,
      })

      return canvas
    }
    catch (error) {
      // 存储错误信息
      this.thumbnails.set(pageNumber, {
        pageNumber,
        canvas: this.createErrorCanvas(width, height),
        width,
        height,
        scale: 1,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      })

      throw error
    }
    finally {
      this.loadingPromises.delete(pageNumber)
    }
  }

  /**
   * 内部创建缩略图方法
   */
  private async createThumbnailInternal(
    page: PDFPageProxy,
    pageNumber: number,
    options: ThumbnailOptions
  ): Promise<HTMLCanvasElement> {
    // 标记为加载中
    const existingItem = this.thumbnails.get(pageNumber)
    if (existingItem) {
      existingItem.isLoading = true
    }

    return createThumbnail(page, options)
  }

  /**
   * 计算缩放比例
   */
  private calculateScale(page: PDFPageProxy, targetWidth: number, targetHeight: number): number {
    const viewport = page.getViewport({ scale: 1 })
    const scaleX = targetWidth / viewport.width
    const scaleY = targetHeight / viewport.height
    return Math.min(scaleX, scaleY)
  }

  /**
   * 创建错误占位符canvas
   */
  private createErrorCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 绘制错误占位符
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#ddd'
      ctx.strokeRect(0, 0, width, height)

      ctx.fillStyle = '#999'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('加载失败', width / 2, height / 2)
    }

    return canvas
  }

  /**
   * 批量生成缩略图
   */
  async generateThumbnails(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    pageNumbers: number[],
    options: ThumbnailOptions = {}
  ): Promise<Map<number, HTMLCanvasElement>> {
    const results = new Map<number, HTMLCanvasElement>()
    const promises = pageNumbers.map(async (pageNumber) => {
      try {
        const page = await getPage(pageNumber)
        const canvas = await this.generateThumbnail(page, pageNumber, options)
        results.set(pageNumber, canvas)
      }
      catch (error) {
        console.warn(`Failed to generate thumbnail for page ${pageNumber}:`, error)
      }
    })

    await Promise.all(promises)
    return results
  }

  /**
   * 获取缩略图
   */
  getThumbnail(pageNumber: number): ThumbnailItem | null {
    return this.thumbnails.get(pageNumber) || null
  }

  /**
   * 检查缩略图是否存在
   */
  hasThumbnail(pageNumber: number): boolean {
    return this.thumbnails.has(pageNumber)
  }

  /**
   * 检查缩略图是否正在加载
   */
  isLoading(pageNumber: number): boolean {
    const item = this.thumbnails.get(pageNumber)
    return item?.isLoading || this.loadingPromises.has(pageNumber)
  }

  /**
   * 获取所有缩略图
   */
  getAllThumbnails(): Map<number, ThumbnailItem> {
    return new Map(this.thumbnails)
  }

  /**
   * 删除缩略图
   */
  removeThumbnail(pageNumber: number): boolean {
    return this.thumbnails.delete(pageNumber)
  }

  /**
   * 清空所有缩略图
   */
  clearThumbnails(): void {
    this.thumbnails.clear()
    this.loadingPromises.clear()
  }

  /**
   * 预加载缩略图
   */
  async preloadThumbnails(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    startPage: number,
    endPage: number,
    options: ThumbnailOptions = {}
  ): Promise<void> {
    const pageNumbers: number[] = []
    for (let i = startPage; i <= endPage; i++) {
      if (!this.hasThumbnail(i)) {
        pageNumbers.push(i)
      }
    }

    if (pageNumbers.length > 0) {
      await this.generateThumbnails(getPage, pageNumbers, options)
    }
  }

  /**
   * 创建缩略图导航元素
   */
  createThumbnailNavigation(
    container: HTMLElement,
    onPageClick?: (pageNumber: number) => void,
    currentPage?: number
  ): void {
    // 清空容器
    container.innerHTML = ''
    container.className = 'pdf-thumbnail-navigation'

    // 添加样式
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '8px'
    container.style.padding = '16px'
    container.style.overflowY = 'auto'
    container.style.backgroundColor = '#f8f9fa'
    container.style.borderRight = '1px solid #dee2e6'

    // 创建缩略图元素
    const sortedThumbnails = Array.from(this.thumbnails.entries())
      .sort(([a], [b]) => a - b)

    for (const [pageNumber, thumbnail] of sortedThumbnails) {
      const thumbnailElement = this.createThumbnailElement(
        thumbnail,
        onPageClick,
        currentPage === pageNumber
      )
      container.appendChild(thumbnailElement)
    }
  }

  /**
   * 创建单个缩略图元素
   */
  private createThumbnailElement(
    thumbnail: ThumbnailItem,
    onPageClick?: (pageNumber: number) => void,
    isActive = false
  ): HTMLElement {
    const element = document.createElement('div')
    element.className = `pdf-thumbnail ${isActive ? 'active' : ''}`
    element.style.cursor = 'pointer'
    element.style.padding = '8px'
    element.style.border = isActive ? '2px solid #007bff' : '1px solid #dee2e6'
    element.style.borderRadius = '4px'
    element.style.backgroundColor = isActive ? '#e3f2fd' : '#ffffff'
    element.style.textAlign = 'center'
    element.style.transition = 'all 0.2s ease'

    // 添加canvas
    const canvasContainer = document.createElement('div')
    canvasContainer.style.marginBottom = '4px'
    canvasContainer.appendChild(thumbnail.canvas)
    element.appendChild(canvasContainer)

    // 添加页码
    const pageLabel = document.createElement('div')
    pageLabel.textContent = `第 ${thumbnail.pageNumber} 页`
    pageLabel.style.fontSize = '12px'
    pageLabel.style.color = '#6c757d'
    element.appendChild(pageLabel)

    // 添加点击事件
    if (onPageClick) {
      element.addEventListener('click', () => {
        onPageClick(thumbnail.pageNumber)
      })

      // 添加悬停效果
      element.addEventListener('mouseenter', () => {
        if (!isActive) {
          element.style.backgroundColor = '#f8f9fa'
          element.style.borderColor = '#adb5bd'
        }
      })

      element.addEventListener('mouseleave', () => {
        if (!isActive) {
          element.style.backgroundColor = '#ffffff'
          element.style.borderColor = '#dee2e6'
        }
      })
    }

    return element
  }

  /**
   * 更新活动缩略图
   */
  updateActiveThumbnail(container: HTMLElement, currentPage: number): void {
    const thumbnails = container.querySelectorAll('.pdf-thumbnail')
    thumbnails.forEach((thumbnail, index) => {
      const pageNumber = index + 1
      const isActive = pageNumber === currentPage

      if (isActive) {
        thumbnail.classList.add('active')
        thumbnail.setAttribute('style', 
          thumbnail.getAttribute('style')?.replace(/border: [^;]+;/, 'border: 2px solid #007bff;') || ''
        )
        thumbnail.setAttribute('style',
          thumbnail.getAttribute('style')?.replace(/background-color: [^;]+;/, 'background-color: #e3f2fd;') || ''
        )
      } else {
        thumbnail.classList.remove('active')
        thumbnail.setAttribute('style',
          thumbnail.getAttribute('style')?.replace(/border: [^;]+;/, 'border: 1px solid #dee2e6;') || ''
        )
        thumbnail.setAttribute('style',
          thumbnail.getAttribute('style')?.replace(/background-color: [^;]+;/, 'background-color: #ffffff;') || ''
        )
      }
    })
  }

  /**
   * 获取缩略图统计信息
   */
  getStats(): {
    totalThumbnails: number
    loadingThumbnails: number
    errorThumbnails: number
    cacheStats: any
  } {
    let loadingCount = 0
    let errorCount = 0

    for (const thumbnail of this.thumbnails.values()) {
      if (thumbnail.isLoading) loadingCount++
      if (thumbnail.error) errorCount++
    }

    return {
      totalThumbnails: this.thumbnails.size,
      loadingThumbnails: loadingCount,
      errorThumbnails: errorCount,
      cacheStats: this.cacheManager.getStats(),
    }
  }

  /**
   * 销毁缩略图管理器
   */
  destroy(): void {
    this.clearThumbnails()
    this.cacheManager.clearDocument(this.documentId)
  }
}
