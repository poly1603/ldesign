import {
  DocumentType,
  DocumentViewerOptions,
  IDocumentViewer,
  DocumentInfo,
  DocumentContent,
  DocumentViewerError,
  ErrorCode
} from '../types'
import { WordViewer } from './word-viewer'
import { ExcelViewer } from './excel-viewer'
import { PowerPointViewer } from './powerpoint-viewer'
import { detectDocumentType, getContainer } from '../utils'

/**
 * 主要的文档查看器类
 * 支持 Word、Excel、PowerPoint 文档的预览和编辑
 */
export class DocumentViewer implements IDocumentViewer {
  private container: HTMLElement
  private options: DocumentViewerOptions
  private currentViewer: IDocumentViewer | null = null
  private documentInfo: DocumentInfo | null = null

  constructor(options: DocumentViewerOptions) {
    this.options = {
      editable: false,
      toolbar: { show: true, position: 'top' },
      theme: {},
      callbacks: {},
      ...options
    }

    // 获取容器元素
    this.container = getContainer(options.container)
    if (!this.container) {
      throw new DocumentViewerError(
        'Invalid container element',
        ErrorCode.INVALID_CONTAINER
      )
    }

    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    this.container.classList.add('ldesign-docview-container')
    this.container.innerHTML = `
      <div class="ldesign-docview-toolbar" style="display: ${this.options.toolbar?.show ? 'block' : 'none'}">
        <div class="ldesign-docview-toolbar-content">
          <button class="ldesign-docview-btn" data-action="save">保存</button>
          <button class="ldesign-docview-btn" data-action="download">下载</button>
          <button class="ldesign-docview-btn" data-action="print">打印</button>
        </div>
      </div>
      <div class="ldesign-docview-content"></div>
    `

    // 绑定工具栏事件
    this.bindToolbarEvents()
    
    // 应用主题
    this.applyTheme()
  }

  /**
   * 绑定工具栏事件
   */
  private bindToolbarEvents(): void {
    const toolbar = this.container.querySelector('.ldesign-docview-toolbar')
    if (!toolbar) return

    toolbar.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const action = target.getAttribute('data-action')
      
      switch (action) {
        case 'save':
          this.handleSave()
          break
        case 'download':
          this.handleDownload()
          break
        case 'print':
          this.handlePrint()
          break
      }
    })
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const { theme } = this.options
    if (!theme) return

    const style = this.container.style
    if (theme.primaryColor) {
      style.setProperty('--ldesign-docview-primary-color', theme.primaryColor)
    }
    if (theme.backgroundColor) {
      style.setProperty('--ldesign-docview-bg-color', theme.backgroundColor)
    }
    if (theme.textColor) {
      style.setProperty('--ldesign-docview-text-color', theme.textColor)
    }
    if (theme.borderColor) {
      style.setProperty('--ldesign-docview-border-color', theme.borderColor)
    }
  }

  /**
   * 加载文档
   */
  async loadDocument(file: File | string | ArrayBuffer): Promise<void> {
    try {
      // 检测文档类型
      const documentType = await detectDocumentType(file)
      
      // 创建对应的查看器
      this.currentViewer = this.createViewer(documentType)
      
      // 获取内容容器
      const contentContainer = this.container.querySelector('.ldesign-docview-content') as HTMLElement
      
      // 加载文档
      await this.currentViewer.loadDocument(file)
      
      // 获取文档信息
      this.documentInfo = this.currentViewer.getDocumentInfo()
      
      // 触发加载完成回调
      this.options.callbacks?.onLoad?.(this.documentInfo!)
      
    } catch (error) {
      const docError = error instanceof DocumentViewerError 
        ? error 
        : new DocumentViewerError('Failed to load document', ErrorCode.LOAD_FAILED, error as Error)
      
      this.options.callbacks?.onError?.(docError)
      throw docError
    }
  }

  /**
   * 创建对应类型的查看器
   */
  private createViewer(type: DocumentType): IDocumentViewer {
    const contentContainer = this.container.querySelector('.ldesign-docview-content') as HTMLElement
    
    const viewerOptions = {
      container: contentContainer,
      editable: this.options.editable,
      callbacks: {
        onChange: this.options.callbacks?.onChange,
        onError: this.options.callbacks?.onError
      }
    }

    switch (type) {
      case DocumentType.WORD:
        return new WordViewer(viewerOptions)
      case DocumentType.EXCEL:
        return new ExcelViewer(viewerOptions)
      case DocumentType.POWERPOINT:
        return new PowerPointViewer(viewerOptions)
      default:
        throw new DocumentViewerError(
          `Unsupported document type: ${type}`,
          ErrorCode.UNSUPPORTED_FORMAT
        )
    }
  }

  /**
   * 获取文档内容
   */
  getContent(): DocumentContent | null {
    return this.currentViewer?.getContent() || null
  }

  /**
   * 保存文档
   */
  async save(): Promise<Blob> {
    if (!this.currentViewer) {
      throw new DocumentViewerError('No document loaded', ErrorCode.SAVE_FAILED)
    }
    return await this.currentViewer.save()
  }

  /**
   * 设置编辑模式
   */
  setEditable(editable: boolean): void {
    this.options.editable = editable
    this.currentViewer?.setEditable(editable)
  }

  /**
   * 获取文档信息
   */
  getDocumentInfo(): DocumentInfo | null {
    return this.documentInfo
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.currentViewer?.destroy()
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-docview-container')
  }

  /**
   * 处理保存操作
   */
  private async handleSave(): Promise<void> {
    try {
      const content = this.getContent()
      if (content) {
        this.options.callbacks?.onSave?.(content)
      }
    } catch (error) {
      this.options.callbacks?.onError?.(error as Error)
    }
  }

  /**
   * 处理下载操作
   */
  private async handleDownload(): Promise<void> {
    try {
      const blob = await this.save()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.documentInfo?.name || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      this.options.callbacks?.onError?.(error as Error)
    }
  }

  /**
   * 处理打印操作
   */
  private handlePrint(): void {
    const content = this.getContent()
    if (content?.html) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>打印文档</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>${content.html}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }
}
