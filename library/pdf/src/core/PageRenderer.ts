import type { PDFPageProxy, RenderTask } from 'pdfjs-dist'
import { CacheManager } from '../utils/CacheManager'
import type { PageRenderInfo, RotationAngle } from '../types'

/**
 * 页面渲染器
 * 负责PDF页面的渲染和缓存管理
 */
export class PageRenderer {
  private cacheManager: CacheManager<HTMLCanvasElement>
  private renderTasks: Map<number, RenderTask> = new Map()
  private rotation: RotationAngle = 0

  constructor(maxCachePages: number = 20) {
    this.cacheManager = new CacheManager<HTMLCanvasElement>(maxCachePages)
  }

  /**
   * 渲染页面到Canvas
   * @param page PDF页面对象
   * @param container 容器元素
   * @param scale 缩放比例
   * @param rotation 旋转角度
   */
  async renderPage(
    page: PDFPageProxy,
    container: HTMLElement,
    scale: number = 1.0,
    rotation: RotationAngle = 0
  ): Promise<PageRenderInfo> {
    const pageNumber = page.pageNumber
    const cacheKey = this.getCacheKey(pageNumber, scale, rotation)

    // 取消该页面的之前的渲染任务
    this.cancelRenderTask(pageNumber)

    // 检查缓存
    const cachedCanvas = this.cacheManager.get(cacheKey)
    if (cachedCanvas) {
      this.displayCanvas(container, cachedCanvas)
      return { pageNumber, page, scale, rotation }
    }

    // 创建canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { alpha: false })

    if (!context) {
      throw new Error('Failed to get canvas 2d context')
    }

    // 计算视口
    const viewport = page.getViewport({ scale, rotation })

    // 设置canvas尺寸
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.className = 'pdf-page-canvas'

    // 开始渲染
    const renderContext = {
      canvasContext: context,
      viewport
    }

    const renderTask = page.render(renderContext)
    this.renderTasks.set(pageNumber, renderTask)

    try {
      await renderTask.promise

      // 缓存渲染结果
      this.cacheManager.set(cacheKey, canvas)

      // 显示canvas
      this.displayCanvas(container, canvas)

      // 清理渲染任务
      this.renderTasks.delete(pageNumber)

      return { pageNumber, page, scale, rotation, task: renderTask }
    } catch (error: any) {
      // 如果是取消渲染，不抛出错误
      if (error.name === 'RenderingCancelledException') {
        return { pageNumber, page, scale, rotation }
      }
      throw error
    }
  }

  /**
   * 显示Canvas
   */
  private displayCanvas(container: HTMLElement, canvas: HTMLCanvasElement): void {
    // 清空容器
    container.innerHTML = ''

    // 克隆canvas以避免缓存引用问题
    const clonedCanvas = canvas.cloneNode(true) as HTMLCanvasElement
    const clonedContext = clonedCanvas.getContext('2d')
    const originalContext = canvas.getContext('2d')

    if (clonedContext && originalContext) {
      clonedContext.drawImage(canvas, 0, 0)
    }

    container.appendChild(clonedCanvas)
  }

  /**
   * 取消页面渲染任务
   * @param pageNumber 页码
   */
  cancelRenderTask(pageNumber: number): void {
    const task = this.renderTasks.get(pageNumber)
    if (task) {
      task.cancel()
      this.renderTasks.delete(pageNumber)
    }
  }

  /**
   * 取消所有渲染任务
   */
  cancelAllRenderTasks(): void {
    this.renderTasks.forEach(task => task.cancel())
    this.renderTasks.clear()
  }

  /**
   * 设置旋转角度
   * @param rotation 旋转角度
   */
  setRotation(rotation: RotationAngle): void {
    this.rotation = rotation
  }

  /**
   * 获取旋转角度
   */
  getRotation(): RotationAngle {
    return this.rotation
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(pageNumber: number, scale: number, rotation: RotationAngle): string {
    return `page-${pageNumber}-scale-${scale.toFixed(2)}-rotation-${rotation}`
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cacheManager.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cacheManager.getStats()
  }

  /**
   * 预渲染页面
   * @param page PDF页面对象
   * @param scale 缩放比例
   * @param rotation 旋转角度
   */
  async prerenderPage(
    page: PDFPageProxy,
    scale: number = 1.0,
    rotation: RotationAngle = 0
  ): Promise<void> {
    const pageNumber = page.pageNumber
    const cacheKey = this.getCacheKey(pageNumber, scale, rotation)

    // ��果已经缓存，则跳过
    if (this.cacheManager.has(cacheKey)) {
      return
    }

    // 创建临时canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { alpha: false })

    if (!context) {
      throw new Error('Failed to get canvas 2d context')
    }

    const viewport = page.getViewport({ scale, rotation })
    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
      canvasContext: context,
      viewport
    }

    try {
      await page.render(renderContext).promise
      this.cacheManager.set(cacheKey, canvas)
    } catch (error: any) {
      // 忽略渲染错误
      if (error.name !== 'RenderingCancelledException') {
        console.warn(`Failed to prerender page ${pageNumber}:`, error)
      }
    }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.cancelAllRenderTasks()
    this.clearCache()
  }
}
