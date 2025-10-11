import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

/**
 * 简化版PDF查看器 - 快速、简单、可靠
 */
export class SimplePDFViewer {
  private container: HTMLElement
  private document: PDFDocumentProxy | null = null
  private currentPage: number = 1
  private scale: number = 1.5
  private workerSrc: string

  constructor(containerSelector: string, workerSrc: string = '/pdf.worker.min.mjs') {
    const el = document.querySelector(containerSelector)
    if (!el) throw new Error(`Container not found: ${containerSelector}`)
    this.container = el as HTMLElement
    this.workerSrc = workerSrc
    this.init()
  }

  private init() {
    console.log('[SimplePDFViewer] Initializing...')
    
    // 设置worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc
    console.log('[SimplePDFViewer] Worker configured:', this.workerSrc)
    
    // 创建UI
    this.createUI()
    console.log('[SimplePDFViewer] UI created')
  }

  private createUI() {
    this.container.innerHTML = `
      <div class="simple-pdf-viewer">
        <div class="simple-pdf-toolbar">
          <button class="pdf-btn" id="prevPage">◀ Previous</button>
          <span class="pdf-page-indicator"><span id="pageNum">-</span> / <span id="pageCount">-</span></span>
          <button class="pdf-btn" id="nextPage">Next ▶</button>
          <button class="pdf-btn" id="zoomOut">Zoom Out</button>
          <span class="pdf-zoom-indicator"><span id="zoomLevel">150</span>%</span>
          <button class="pdf-btn" id="zoomIn">Zoom In</button>
        </div>
        <div class="simple-pdf-canvas-container" id="canvasContainer"></div>
      </div>
    `

    // 添加样式
    this.applyStyles()

    // 绑定事件
    this.bindEvents()
  }

  private applyStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .simple-pdf-viewer {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .simple-pdf-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .pdf-btn {
        padding: 8px 16px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .pdf-btn:hover {
        background: #0052a3;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,102,204,0.3);
      }
      .pdf-btn:active {
        transform: translateY(0);
      }
      .pdf-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
      .pdf-page-indicator, .pdf-zoom-indicator {
        padding: 8px 12px;
        background: #f0f0f0;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        min-width: 100px;
        text-align: center;
      }
      .simple-pdf-canvas-container {
        flex: 1;
        overflow: auto;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
      }
      .simple-pdf-canvas-container canvas {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 4px;
        background: white;
      }
    `
    document.head.appendChild(style)
  }

  private bindEvents() {
    document.getElementById('prevPage')?.addEventListener('click', () => this.previousPage())
    document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage())
    document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomIn())
    document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomOut())
  }

  async loadDocument(url: string): Promise<void> {
    try {
      console.log('[SimplePDFViewer] Loading document:', url)
      
      const loadingTask = pdfjsLib.getDocument(url)
      this.document = await loadingTask.promise
      
      console.log('[SimplePDFViewer] Document loaded, pages:', this.document.numPages)
      
      this.updatePageCount()
      await this.renderPage(1)
      
    } catch (error) {
      console.error('[SimplePDFViewer] Error loading document:', error)
      alert(`Failed to load PDF: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async renderPage(pageNumber: number): Promise<void> {
    if (!this.document) {
      console.error('[SimplePDFViewer] No document loaded')
      return
    }

    try {
      console.log('[SimplePDFViewer] Rendering page:', pageNumber)
      
      const page = await this.document.getPage(pageNumber)
      const viewport = page.getViewport({ scale: this.scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Cannot get canvas context')

      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise

      const container = document.getElementById('canvasContainer')
      if (container) {
        container.innerHTML = ''
        container.appendChild(canvas)
      }

      this.currentPage = pageNumber
      this.updatePageNumber()
      this.updateButtons()
      
      console.log('[SimplePDFViewer] Page rendered successfully')

    } catch (error) {
      console.error('[SimplePDFViewer] Error rendering page:', error)
      alert(`Failed to render page: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private updatePageCount() {
    const el = document.getElementById('pageCount')
    if (el && this.document) {
      el.textContent = String(this.document.numPages)
    }
  }

  private updatePageNumber() {
    const el = document.getElementById('pageNum')
    if (el) {
      el.textContent = String(this.currentPage)
    }
  }

  private updateButtons() {
    const prevBtn = document.getElementById('prevPage') as HTMLButtonElement
    const nextBtn = document.getElementById('nextPage') as HTMLButtonElement
    
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1
    if (nextBtn) nextBtn.disabled = !this.document || this.currentPage >= this.document.numPages
  }

  private previousPage() {
    if (this.currentPage > 1) {
      this.renderPage(this.currentPage - 1)
    }
  }

  private nextPage() {
    if (this.document && this.currentPage < this.document.numPages) {
      this.renderPage(this.currentPage + 1)
    }
  }

  private zoomIn() {
    this.scale = Math.min(3.0, this.scale + 0.25)
    this.updateZoomLevel()
    this.renderPage(this.currentPage)
  }

  private zoomOut() {
    this.scale = Math.max(0.5, this.scale - 0.25)
    this.updateZoomLevel()
    this.renderPage(this.currentPage)
  }

  private updateZoomLevel() {
    const el = document.getElementById('zoomLevel')
    if (el) {
      el.textContent = String(Math.round(this.scale * 100))
    }
  }
}
