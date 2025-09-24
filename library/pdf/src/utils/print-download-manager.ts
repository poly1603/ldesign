/**
 * PDF打印和下载管理器
 * 提供PDF文档的打印和下载功能
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { PrintOptions, DownloadOptions } from '../core/types'

/**
 * 打印和下载管理器
 */
export class PdfPrintDownloadManager {
  private documentProxy: PDFDocumentProxy | null = null
  private originalData: ArrayBuffer | null = null

  constructor(documentProxy?: PDFDocumentProxy) {
    this.documentProxy = documentProxy || null
  }

  /**
   * 设置文档代理
   */
  setDocument(documentProxy: PDFDocumentProxy, originalData?: ArrayBuffer): void {
    this.documentProxy = documentProxy
    this.originalData = originalData || null
  }

  /**
   * 下载PDF文档
   */
  async downloadPdf(options: DownloadOptions = {}): Promise<void> {
    if (!this.documentProxy) {
      throw new Error('No document loaded')
    }

    const {
      filename = 'document.pdf',
      saveAsCopy = false,
    } = options

    try {
      let data: ArrayBuffer

      if (this.originalData && !saveAsCopy) {
        // 使用原始数据
        data = this.originalData
      } else {
        // 重新生成PDF数据
        data = await this.generatePdfData()
      }

      // 创建下载链接
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = this.ensurePdfExtension(filename)
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理URL
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    catch (error) {
      throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 打印PDF文档
   */
  async printPdf(options: PrintOptions = {}): Promise<void> {
    if (!this.documentProxy) {
      throw new Error('No document loaded')
    }

    const {
      pageRange,
      fitToPage = true,
      quality = 'normal',
      showDialog = true,
    } = options

    try {
      // 解析页面范围
      const pageNumbers = this.parsePageRange(pageRange, this.documentProxy.numPages)

      if (showDialog) {
        // 使用浏览器打印对话框
        await this.printWithDialog(pageNumbers, fitToPage, quality)
      } else {
        // 直接打印
        await this.printDirect(pageNumbers, fitToPage, quality)
      }
    }
    catch (error) {
      throw new Error(`Failed to print PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 使用浏览器打印对话框打印
   */
  private async printWithDialog(
    pageNumbers: number[],
    fitToPage: boolean,
    quality: 'draft' | 'normal' | 'high'
  ): Promise<void> {
    // 创建打印窗口
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      throw new Error('Failed to open print window')
    }

    try {
      // 设置打印窗口内容
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>打印PDF</title>
          <style>
            body { margin: 0; padding: 0; }
            .page { 
              page-break-after: always; 
              display: flex; 
              justify-content: center; 
              align-items: center;
              ${fitToPage ? 'width: 100%; height: 100vh;' : ''}
            }
            .page:last-child { page-break-after: avoid; }
            canvas { 
              max-width: 100%; 
              max-height: 100%; 
              ${fitToPage ? 'width: auto; height: auto;' : ''}
            }
            @media print {
              .page { margin: 0; }
            }
          </style>
        </head>
        <body>
        </body>
        </html>
      `)

      // 渲染页面到打印窗口
      for (const pageNumber of pageNumbers) {
        const canvas = await this.renderPageForPrint(pageNumber, quality)
        const pageDiv = printWindow.document.createElement('div')
        pageDiv.className = 'page'
        pageDiv.appendChild(canvas)
        printWindow.document.body.appendChild(pageDiv)
      }

      // 等待内容加载完成
      await new Promise(resolve => {
        printWindow.addEventListener('load', resolve)
        if (printWindow.document.readyState === 'complete') {
          resolve(undefined)
        }
      })

      // 打印
      printWindow.print()

      // 关闭窗口
      setTimeout(() => printWindow.close(), 1000)
    }
    catch (error) {
      printWindow.close()
      throw error
    }
  }

  /**
   * 直接打印（不显示对话框）
   */
  private async printDirect(
    pageNumbers: number[],
    fitToPage: boolean,
    quality: 'draft' | 'normal' | 'high'
  ): Promise<void> {
    // 创建隐藏的iframe进行打印
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document')
      }

      // 设置iframe内容
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            .page { 
              page-break-after: always; 
              display: flex; 
              justify-content: center; 
              align-items: center;
              ${fitToPage ? 'width: 100%; height: 100vh;' : ''}
            }
            .page:last-child { page-break-after: avoid; }
            canvas { 
              max-width: 100%; 
              max-height: 100%; 
            }
          </style>
        </head>
        <body>
        </body>
        </html>
      `)

      // 渲染页面
      for (const pageNumber of pageNumbers) {
        const canvas = await this.renderPageForPrint(pageNumber, quality)
        const pageDiv = iframeDoc.createElement('div')
        pageDiv.className = 'page'
        pageDiv.appendChild(canvas)
        iframeDoc.body.appendChild(pageDiv)
      }

      // 打印
      iframe.contentWindow?.print()
    }
    finally {
      // 清理iframe
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }
  }

  /**
   * 为打印渲染页面
   */
  private async renderPageForPrint(
    pageNumber: number,
    quality: 'draft' | 'normal' | 'high'
  ): Promise<HTMLCanvasElement> {
    if (!this.documentProxy) {
      throw new Error('No document loaded')
    }

    const page = await this.documentProxy.getPage(pageNumber)

    // 根据质量设置缩放比例
    let scale: number
    switch (quality) {
      case 'draft':
        scale = 1
        break
      case 'normal':
        scale = 1.5
        break
      case 'high':
        scale = 2
        break
    }

    const viewport = page.getViewport({ scale })

    // 创建canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    canvas.width = viewport.width
    canvas.height = viewport.height

    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport,
    }

    await page.render(renderContext).promise

    return canvas
  }

  /**
   * 解析页面范围
   */
  private parsePageRange(pageRange: string | undefined, totalPages: number): number[] {
    if (!pageRange) {
      // 返回所有页面
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const ranges = pageRange.split(',')

    for (const range of ranges) {
      const trimmedRange = range.trim()

      if (trimmedRange.includes('-')) {
        // 页面范围，如 "1-5"
        const [start, end] = trimmedRange.split('-').map(s => parseInt(s.trim(), 10))
        if (isNaN(start) || isNaN(end)) {
          throw new Error(`Invalid page range: ${trimmedRange}`)
        }

        const startPage = Math.max(1, Math.min(start, totalPages))
        const endPage = Math.max(1, Math.min(end, totalPages))

        for (let i = startPage; i <= endPage; i++) {
          if (!pages.includes(i)) {
            pages.push(i)
          }
        }
      } else {
        // 单个页面
        const pageNumber = parseInt(trimmedRange, 10)
        if (isNaN(pageNumber)) {
          throw new Error(`Invalid page number: ${trimmedRange}`)
        }

        const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages))
        if (!pages.includes(validPageNumber)) {
          pages.push(validPageNumber)
        }
      }
    }

    return pages.sort((a, b) => a - b)
  }

  /**
   * 生成PDF数据
   */
  private async generatePdfData(): Promise<ArrayBuffer> {
    if (!this.documentProxy) {
      throw new Error('No document loaded')
    }

    // 这里应该实现PDF重新生成逻辑
    // 由于PDF.js主要用于渲染而不是生成，这里返回原始数据
    if (this.originalData) {
      return this.originalData
    }

    throw new Error('No original PDF data available')
  }

  /**
   * 确保文件名有PDF扩展名
   */
  private ensurePdfExtension(filename: string): string {
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return `${filename}.pdf`
    }
    return filename
  }

  /**
   * 检查浏览器是否支持打印
   */
  static isPrintSupported(): boolean {
    return typeof window !== 'undefined' && 'print' in window
  }

  /**
   * 检查浏览器是否支持下载
   */
  static isDownloadSupported(): boolean {
    return typeof window !== 'undefined' && 'URL' in window && 'createObjectURL' in URL
  }

  /**
   * 获取支持的打印格式
   */
  static getSupportedFormats(): string[] {
    return ['application/pdf']
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.documentProxy = null
    this.originalData = null
  }
}
