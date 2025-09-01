/**
 * PDF页面渲染器
 * 负责将PDF页面渲染到DOM元素中
 */

import type { PDFPageProxy } from 'pdfjs-dist'
import type { IPdfPageRenderer, RenderOptions, RotationAngle } from './types'

/**
 * PDF页面渲染器实现
 */
export class PdfPageRenderer implements IPdfPageRenderer {
  private renderTasks = new Map<HTMLElement, any>()
  private textLayers = new Map<HTMLElement, HTMLElement>()

  /**
   * 渲染PDF页面
   */
  async renderPage(
    page: PDFPageProxy,
    container: HTMLElement,
    options: RenderOptions = {}
  ): Promise<void> {
    try {
      // 取消之前的渲染任务
      await this.cancelRenderTask(container)

      // 清理容器
      this.cleanupContainer(container)

      // 设置默认选项
      const renderOptions = {
        mode: 'canvas' as const,
        scale: 1,
        rotation: 0 as RotationAngle,
        enableTextSelection: true,
        enableAnnotations: true,
        backgroundColor: '#ffffff',
        useHighQuality: true,
        ...options,
      }

      // 获取页面视口
      const viewport = page.getViewport({
        scale: renderOptions.scale,
        rotation: renderOptions.rotation,
      })

      // 根据渲染模式选择渲染方法
      switch (renderOptions.mode) {
        case 'canvas':
          await this.renderToCanvas(page, container, viewport, renderOptions)
          break
        case 'svg':
          await this.renderToSvg(page, container, viewport, renderOptions)
          break
        case 'text':
          await this.renderTextOnly(page, container, viewport, renderOptions)
          break
        default:
          throw new Error(`Unsupported render mode: ${renderOptions.mode}`)
      }

      // 渲染文本层（如果启用）
      if (renderOptions.enableTextSelection && renderOptions.mode !== 'text') {
        await this.renderTextLayer(page, container, viewport)
      }

      // 渲染注释层（如果启用）
      if (renderOptions.enableAnnotations) {
        await this.renderAnnotationLayer(page, container, viewport)
      }
    }
    catch (error) {
      throw new Error(`Failed to render page: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 渲染到Canvas
   */
  private async renderToCanvas(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    // 创建canvas元素
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    // 设置canvas尺寸
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    // 设置背景色
    if (options.backgroundColor) {
      canvas.style.backgroundColor = options.backgroundColor
    }

    // 设置高质量渲染
    if (options.useHighQuality) {
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = viewport.width * devicePixelRatio
      canvas.height = viewport.height * devicePixelRatio
      context.scale(devicePixelRatio, devicePixelRatio)
    }

    // 渲染页面 - PDF.js 3.x 格式
    const renderContext = {
      canvasContext: context,
      viewport,
    }

    try {
      console.log('开始渲染PDF页面到Canvas...')
      const renderTask = page.render(renderContext)
      this.renderTasks.set(container, renderTask)

      await renderTask.promise
      console.log('PDF页面渲染完成')
    } catch (error) {
      console.error('PDF页面渲染失败:', error)
      throw error
    }

    // 将canvas添加到容器
    container.appendChild(canvas)
  }

  /**
   * 渲染到SVG
   */
  private async renderToSvg(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', viewport.width.toString())
    svg.setAttribute('height', viewport.height.toString())
    svg.style.backgroundColor = options.backgroundColor || '#ffffff'

    // 渲染页面到SVG - PDF.js 3.x 格式
    const renderContext = {
      canvasContext: svg as any,
      viewport,
    }

    const renderTask = page.render(renderContext)
    this.renderTasks.set(container, renderTask)

    await renderTask.promise

    // 将SVG添加到容器
    container.appendChild(svg)
  }

  /**
   * 仅渲染文本
   */
  private async renderTextOnly(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    // 创建文本容器
    const textContainer = document.createElement('div')
    textContainer.style.width = `${viewport.width}px`
    textContainer.style.height = `${viewport.height}px`
    textContainer.style.backgroundColor = options.backgroundColor || '#ffffff'
    textContainer.style.position = 'relative'
    textContainer.style.overflow = 'hidden'

    // 渲染文本层
    await this.renderTextLayer(page, textContainer, viewport)

    container.appendChild(textContainer)
  }

  /**
   * 渲染文本层
   */
  private async renderTextLayer(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any
  ): Promise<void> {
    try {
      // 获取文本内容
      const textContent = await page.getTextContent()

      // 创建文本层容器
      const textLayerDiv = document.createElement('div')
      textLayerDiv.className = 'textLayer'
      textLayerDiv.style.position = 'absolute'
      textLayerDiv.style.left = '0'
      textLayerDiv.style.top = '0'
      textLayerDiv.style.right = '0'
      textLayerDiv.style.bottom = '0'
      textLayerDiv.style.overflow = 'hidden'
      textLayerDiv.style.opacity = '0.2'
      textLayerDiv.style.lineHeight = '1.0'

      // 渲染文本项
      const textDivs: HTMLElement[] = []
      const textContentItemsStr: string[] = []

      // 手动渲染文本内容（兼容性更好）
      textContent.items.forEach((item: any, index: number) => {
        const textDiv = document.createElement('span')
        textDiv.textContent = item.str
        textDiv.style.position = 'absolute'
        textDiv.style.whiteSpace = 'pre'
        textDiv.style.color = 'transparent'
        textDiv.style.userSelect = 'text'

        // 设置文本位置和样式
        const transform = viewport.transform
        const [x, y] = transform.slice(4, 6)
        textDiv.style.left = `${item.transform[4] + x}px`
        textDiv.style.top = `${viewport.height - (item.transform[5] + y)}px`
        textDiv.style.fontSize = `${Math.abs(item.transform[0])}px`

        textLayerDiv.appendChild(textDiv)
        textDivs.push(textDiv)
        textContentItemsStr.push(item.str)
      })

      // 保存文本层引用
      this.textLayers.set(container, textLayerDiv)

      // 添加到容器
      container.appendChild(textLayerDiv)
    }
    catch (error) {
      console.warn('Failed to render text layer:', error)
    }
  }

  /**
   * 渲染注释层
   */
  private async renderAnnotationLayer(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any
  ): Promise<void> {
    try {
      // 获取注释
      const annotations = await page.getAnnotations()

      if (annotations.length === 0) {
        return
      }

      // 创建注释层容器
      const annotationLayerDiv = document.createElement('div')
      annotationLayerDiv.className = 'annotationLayer'
      annotationLayerDiv.style.position = 'absolute'
      annotationLayerDiv.style.left = '0'
      annotationLayerDiv.style.top = '0'
      annotationLayerDiv.style.right = '0'
      annotationLayerDiv.style.bottom = '0'

      // 手动渲染注释（简化版本）
      annotations.forEach((annotation: any) => {
        if (annotation.subtype === 'Link' && annotation.url) {
          const link = document.createElement('a')
          link.href = annotation.url
          link.target = '_blank'
          link.style.position = 'absolute'
          link.style.display = 'block'
          link.style.backgroundColor = 'rgba(0, 0, 255, 0.1)'
          link.style.border = '1px solid rgba(0, 0, 255, 0.3)'

          // 设置链接位置
          const rect = annotation.rect
          if (rect && rect.length >= 4) {
            const [x1, y1, x2, y2] = rect
            link.style.left = `${Math.min(x1, x2)}px`
            link.style.top = `${viewport.height - Math.max(y1, y2)}px`
            link.style.width = `${Math.abs(x2 - x1)}px`
            link.style.height = `${Math.abs(y2 - y1)}px`
          }

          annotationLayerDiv.appendChild(link)
        }
      })

      // 添加到容器
      container.appendChild(annotationLayerDiv)
    }
    catch (error) {
      console.warn('Failed to render annotation layer:', error)
    }
  }

  /**
   * 取消渲染任务
   */
  private async cancelRenderTask(container: HTMLElement): Promise<void> {
    const renderTask = this.renderTasks.get(container)
    if (renderTask) {
      try {
        await renderTask.cancel()
      }
      catch (error) {
        // 忽略取消错误
      }
      this.renderTasks.delete(container)
    }
  }

  /**
   * 清理容器
   */
  private cleanupContainer(container: HTMLElement): void {
    // 移除文本层引用
    this.textLayers.delete(container)

    // 清空容器内容
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }

  /**
   * 清理所有渲染内容
   */
  cleanup(): void {
    // 取消所有渲染任务
    for (const [container] of this.renderTasks) {
      this.cancelRenderTask(container)
    }

    // 清理引用
    this.renderTasks.clear()
    this.textLayers.clear()
  }
}
