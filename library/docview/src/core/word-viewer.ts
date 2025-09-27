import mammoth from 'mammoth'
import {
  IDocumentViewer,
  DocumentInfo,
  DocumentContent,
  DocumentType,
  DocumentViewerError,
  ErrorCode,
  CallbackConfig
} from '../types'
import { readFileAsArrayBuffer, fetchFile } from '../utils'

/**
 * Word 文档查看器选项
 */
interface WordViewerOptions {
  container: HTMLElement
  editable?: boolean
  callbacks?: CallbackConfig
}

/**
 * Word 文档查看器
 * 使用 mammoth.js 处理 Word 文档
 */
export class WordViewer implements IDocumentViewer {
  private container: HTMLElement
  private options: WordViewerOptions
  private documentInfo: DocumentInfo | null = null
  private documentContent: DocumentContent | null = null
  private isEditable: boolean = false

  constructor(options: WordViewerOptions) {
    this.container = options.container
    this.options = options
    this.isEditable = options.editable || false
    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    this.container.classList.add('ldesign-word-viewer')
    this.container.innerHTML = `
      <div class="word-viewer-content" ${this.isEditable ? 'contenteditable="true"' : ''}></div>
    `

    // 如果是编辑模式，绑定内容变化事件
    if (this.isEditable) {
      this.bindEditEvents()
    }
  }

  /**
   * 绑定编辑事件
   */
  private bindEditEvents(): void {
    const contentElement = this.container.querySelector('.word-viewer-content') as HTMLElement
    if (!contentElement) return

    let timeout: NodeJS.Timeout | null = null

    contentElement.addEventListener('input', () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = setTimeout(() => {
        this.updateContent()
        this.options.callbacks?.onChange?.(this.getContent())
      }, 300)
    })
  }

  /**
   * 更新内容
   */
  private updateContent(): void {
    const contentElement = this.container.querySelector('.word-viewer-content') as HTMLElement
    if (!contentElement || !this.documentContent) return

    this.documentContent = {
      ...this.documentContent,
      html: contentElement.innerHTML,
      text: contentElement.textContent || ''
    }
  }

  /**
   * 加载文档
   */
  async loadDocument(file: File | string | ArrayBuffer): Promise<void> {
    try {
      let arrayBuffer: ArrayBuffer
      let fileName: string = 'document.docx'
      let fileSize: number = 0
      let lastModified: Date = new Date()

      // 处理不同类型的输入
      if (file instanceof File) {
        arrayBuffer = await readFileAsArrayBuffer(file)
        fileName = file.name
        fileSize = file.size
        lastModified = new Date(file.lastModified)
      } else if (typeof file === 'string') {
        arrayBuffer = await fetchFile(file)
        fileName = file.split('/').pop() || 'document.docx'
        fileSize = arrayBuffer.byteLength
      } else {
        arrayBuffer = file
        fileSize = arrayBuffer.byteLength
      }

      // 使用 mammoth 转换文档
      const result = await mammoth.convertToHtml({ arrayBuffer })
      
      // 创建文档信息
      this.documentInfo = {
        type: DocumentType.WORD,
        name: fileName,
        size: fileSize,
        lastModified,
        pageCount: this.estimatePageCount(result.value)
      }

      // 创建文档内容
      this.documentContent = {
        raw: arrayBuffer,
        html: result.value,
        text: this.extractTextFromHtml(result.value),
        metadata: {
          messages: result.messages,
          warnings: result.messages.filter(m => m.type === 'warning'),
          errors: result.messages.filter(m => m.type === 'error')
        }
      }

      // 渲染内容
      this.renderContent()

      // 处理警告信息
      if (result.messages.length > 0) {
        console.warn('Word document conversion warnings:', result.messages)
      }

    } catch (error) {
      const docError = new DocumentViewerError(
        'Failed to load Word document',
        ErrorCode.LOAD_FAILED,
        error as Error
      )
      this.options.callbacks?.onError?.(docError)
      throw docError
    }
  }

  /**
   * 渲染内容
   */
  private renderContent(): void {
    const contentElement = this.container.querySelector('.word-viewer-content') as HTMLElement
    if (!contentElement || !this.documentContent) return

    contentElement.innerHTML = this.documentContent.html || ''
    
    // 应用样式
    this.applyStyles(contentElement)
  }

  /**
   * 应用样式
   */
  private applyStyles(element: HTMLElement): void {
    element.style.cssText = `
      padding: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Times New Roman', serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      overflow-wrap: break-word;
    `

    // 为表格添加样式
    const tables = element.querySelectorAll('table')
    tables.forEach(table => {
      table.style.cssText = `
        border-collapse: collapse;
        width: 100%;
        margin: 10px 0;
      `
      
      const cells = table.querySelectorAll('td, th')
      cells.forEach(cell => {
        (cell as HTMLElement).style.cssText = `
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        `
      })
    })

    // 为图片添加样式
    const images = element.querySelectorAll('img')
    images.forEach(img => {
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px 0;
      `
    })
  }

  /**
   * 估算页数
   */
  private estimatePageCount(html: string): number {
    // 简单估算：每 3000 个字符约为一页
    const textLength = this.extractTextFromHtml(html).length
    return Math.max(1, Math.ceil(textLength / 3000))
  }

  /**
   * 从 HTML 提取文本
   */
  private extractTextFromHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  /**
   * 获取文档内容
   */
  getContent(): DocumentContent | null {
    if (this.isEditable) {
      this.updateContent()
    }
    return this.documentContent
  }

  /**
   * 保存文档
   */
  async save(): Promise<Blob> {
    if (!this.documentContent) {
      throw new DocumentViewerError('No document content to save', ErrorCode.SAVE_FAILED)
    }

    // 注意：mammoth.js 主要用于读取，不支持写入
    // 这里返回 HTML 内容作为 Blob
    const html = this.documentContent.html || ''
    return new Blob([html], { type: 'text/html' })
  }

  /**
   * 设置编辑模式
   */
  setEditable(editable: boolean): void {
    this.isEditable = editable
    const contentElement = this.container.querySelector('.word-viewer-content') as HTMLElement
    
    if (contentElement) {
      contentElement.contentEditable = editable.toString()
      
      if (editable && !contentElement.hasAttribute('data-events-bound')) {
        this.bindEditEvents()
        contentElement.setAttribute('data-events-bound', 'true')
      }
    }
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
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-word-viewer')
    this.documentInfo = null
    this.documentContent = null
  }
}
