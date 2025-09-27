import * as XLSX from 'xlsx'
import JSZip from 'jszip'
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
 * PowerPoint 文档查看器选项
 */
interface PowerPointViewerOptions {
  container: HTMLElement
  editable?: boolean
  callbacks?: CallbackConfig
}

/**
 * PowerPoint 文档查看器
 * 处理 PowerPoint 文档的预览功能
 */
export class PowerPointViewer implements IDocumentViewer {
  private container: HTMLElement
  private options: PowerPointViewerOptions
  private documentInfo: DocumentInfo | null = null
  private documentContent: DocumentContent | null = null
  private slides: any[] = []
  private currentSlideIndex: number = 0
  private isEditable: boolean = false

  constructor(options: PowerPointViewerOptions) {
    this.container = options.container
    this.options = options
    this.isEditable = options.editable || false
    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    this.container.classList.add('ldesign-powerpoint-viewer')
    this.container.innerHTML = `
      <div class="ppt-viewer-toolbar">
        <button class="prev-slide-btn" disabled>上一页</button>
        <span class="slide-counter">0 / 0</span>
        <button class="next-slide-btn" disabled>下一页</button>
        <select class="slide-selector">
          <option value="">选择幻灯片</option>
        </select>
      </div>
      <div class="ppt-viewer-content">
        <div class="slide-container">
          <div class="slide-content" ${this.isEditable ? 'contenteditable="true"' : ''}></div>
        </div>
      </div>
      <div class="ppt-viewer-thumbnails">
        <div class="thumbnails-container"></div>
      </div>
    `

    this.bindNavigationEvents()
    
    if (this.isEditable) {
      this.bindEditEvents()
    }
  }

  /**
   * 绑定导航事件
   */
  private bindNavigationEvents(): void {
    const prevBtn = this.container.querySelector('.prev-slide-btn') as HTMLButtonElement
    const nextBtn = this.container.querySelector('.next-slide-btn') as HTMLButtonElement
    const slideSelector = this.container.querySelector('.slide-selector') as HTMLSelectElement

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSlide())
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide())
    }

    if (slideSelector) {
      slideSelector.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement
        const slideIndex = parseInt(target.value)
        if (!isNaN(slideIndex)) {
          this.goToSlide(slideIndex)
        }
      })
    }

    // 键盘导航
    document.addEventListener('keydown', (event) => {
      if (this.container.contains(document.activeElement)) {
        switch (event.key) {
          case 'ArrowLeft':
            this.previousSlide()
            break
          case 'ArrowRight':
            this.nextSlide()
            break
        }
      }
    })
  }

  /**
   * 绑定编辑事件
   */
  private bindEditEvents(): void {
    const slideContent = this.container.querySelector('.slide-content') as HTMLElement
    if (!slideContent) return

    let timeout: NodeJS.Timeout | null = null

    slideContent.addEventListener('input', () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = setTimeout(() => {
        this.updateCurrentSlide()
        this.options.callbacks?.onChange?.(this.getContent())
      }, 300)
    })
  }

  /**
   * 加载文档
   */
  async loadDocument(file: File | string | ArrayBuffer): Promise<void> {
    try {
      let arrayBuffer: ArrayBuffer
      let fileName: string = 'document.pptx'
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
        fileName = file.split('/').pop() || 'document.pptx'
        fileSize = arrayBuffer.byteLength
      } else {
        arrayBuffer = file
        fileSize = arrayBuffer.byteLength
      }

      // 解析 PowerPoint 文件
      await this.parsePowerPointFile(arrayBuffer)
      
      // 创建文档信息
      this.documentInfo = {
        type: DocumentType.POWERPOINT,
        name: fileName,
        size: fileSize,
        lastModified,
        pageCount: this.slides.length
      }

      // 创建文档内容
      this.documentContent = {
        raw: arrayBuffer,
        html: this.generateHtmlFromSlides(),
        text: this.extractTextFromSlides(),
        metadata: {
          slideCount: this.slides.length,
          slides: this.slides.map((slide, index) => ({
            index,
            title: slide.title || `幻灯片 ${index + 1}`
          }))
        }
      }

      // 更新 UI
      this.updateSlideSelector()
      this.updateThumbnails()
      this.goToSlide(0)

    } catch (error) {
      const docError = new DocumentViewerError(
        'Failed to load PowerPoint document',
        ErrorCode.LOAD_FAILED,
        error as Error
      )
      this.options.callbacks?.onError?.(docError)
      throw docError
    }
  }

  /**
   * 解析 PowerPoint 文件
   */
  private async parsePowerPointFile(arrayBuffer: ArrayBuffer): Promise<void> {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer)
      
      // 获取幻灯片文件
      const slideFiles: { [key: string]: JSZip.JSZipObject } = {}
      
      zip.forEach((relativePath, file) => {
        if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
          slideFiles[relativePath] = file
        }
      })

      // 解析每个幻灯片
      this.slides = []
      const slideKeys = Object.keys(slideFiles).sort()
      
      for (const slideKey of slideKeys) {
        const slideXml = await slideFiles[slideKey].async('text')
        const slide = this.parseSlideXml(slideXml)
        this.slides.push(slide)
      }

      if (this.slides.length === 0) {
        // 如果没有找到幻灯片，创建一个默认的
        this.slides.push({
          title: '幻灯片 1',
          content: '<p>无法解析幻灯片内容</p>',
          notes: ''
        })
      }

    } catch (error) {
      // 如果解析失败，创建一个错误提示幻灯片
      this.slides = [{
        title: '解析错误',
        content: '<p>无法解析 PowerPoint 文件内容。可能是不支持的格式或文件已损坏。</p>',
        notes: ''
      }]
    }
  }

  /**
   * 解析幻灯片 XML
   */
  private parseSlideXml(xml: string): any {
    // 简化的 XML 解析，实际项目中可能需要更复杂的解析逻辑
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    
    // 提取文本内容
    const textElements = doc.querySelectorAll('a\\:t, t')
    let content = ''
    let title = ''
    
    textElements.forEach((element, index) => {
      const text = element.textContent || ''
      if (index === 0 && text.trim()) {
        title = text.trim()
      }
      if (text.trim()) {
        content += `<p>${text.trim()}</p>`
      }
    })

    return {
      title: title || `幻灯片 ${this.slides.length + 1}`,
      content: content || '<p>空白幻灯片</p>',
      notes: ''
    }
  }

  /**
   * 更新幻灯片选择器
   */
  private updateSlideSelector(): void {
    const slideSelector = this.container.querySelector('.slide-selector') as HTMLSelectElement
    if (!slideSelector) return

    slideSelector.innerHTML = '<option value="">选择幻灯片</option>'
    
    this.slides.forEach((slide, index) => {
      const option = document.createElement('option')
      option.value = index.toString()
      option.textContent = `${index + 1}. ${slide.title}`
      slideSelector.appendChild(option)
    })
  }

  /**
   * 更新缩略图
   */
  private updateThumbnails(): void {
    const thumbnailsContainer = this.container.querySelector('.thumbnails-container') as HTMLElement
    if (!thumbnailsContainer) return

    thumbnailsContainer.innerHTML = ''
    
    this.slides.forEach((slide, index) => {
      const thumbnail = document.createElement('div')
      thumbnail.className = 'slide-thumbnail'
      thumbnail.innerHTML = `
        <div class="thumbnail-content">${slide.content}</div>
        <div class="thumbnail-title">${index + 1}. ${slide.title}</div>
      `
      
      thumbnail.addEventListener('click', () => this.goToSlide(index))
      thumbnailsContainer.appendChild(thumbnail)
    })
  }

  /**
   * 跳转到指定幻灯片
   */
  private goToSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) return

    this.currentSlideIndex = index
    const slide = this.slides[index]
    
    // 更新幻灯片内容
    const slideContent = this.container.querySelector('.slide-content') as HTMLElement
    if (slideContent) {
      slideContent.innerHTML = slide.content
    }

    // 更新计数器
    const slideCounter = this.container.querySelector('.slide-counter') as HTMLElement
    if (slideCounter) {
      slideCounter.textContent = `${index + 1} / ${this.slides.length}`
    }

    // 更新按钮状态
    const prevBtn = this.container.querySelector('.prev-slide-btn') as HTMLButtonElement
    const nextBtn = this.container.querySelector('.next-slide-btn') as HTMLButtonElement
    
    if (prevBtn) prevBtn.disabled = index === 0
    if (nextBtn) nextBtn.disabled = index === this.slides.length - 1

    // 更新选择器
    const slideSelector = this.container.querySelector('.slide-selector') as HTMLSelectElement
    if (slideSelector) {
      slideSelector.value = index.toString()
    }

    // 更新缩略图高亮
    this.updateThumbnailHighlight(index)
  }

  /**
   * 更新缩略图高亮
   */
  private updateThumbnailHighlight(activeIndex: number): void {
    const thumbnails = this.container.querySelectorAll('.slide-thumbnail')
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('active', index === activeIndex)
    })
  }

  /**
   * 上一张幻灯片
   */
  private previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.goToSlide(this.currentSlideIndex - 1)
    }
  }

  /**
   * 下一张幻灯片
   */
  private nextSlide(): void {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.goToSlide(this.currentSlideIndex + 1)
    }
  }

  /**
   * 更新当前幻灯片内容
   */
  private updateCurrentSlide(): void {
    const slideContent = this.container.querySelector('.slide-content') as HTMLElement
    if (!slideContent || !this.slides[this.currentSlideIndex]) return

    this.slides[this.currentSlideIndex].content = slideContent.innerHTML
    
    // 更新文档内容
    if (this.documentContent) {
      this.documentContent.html = this.generateHtmlFromSlides()
      this.documentContent.text = this.extractTextFromSlides()
    }
  }

  /**
   * 从幻灯片生成 HTML
   */
  private generateHtmlFromSlides(): string {
    let html = '<div class="powerpoint-html-export">'
    
    this.slides.forEach((slide, index) => {
      html += `
        <div class="slide" data-slide="${index + 1}">
          <h2>${slide.title}</h2>
          <div class="slide-content">${slide.content}</div>
        </div>
      `
    })
    
    html += '</div>'
    return html
  }

  /**
   * 从幻灯片提取文本
   */
  private extractTextFromSlides(): string {
    return this.slides.map((slide, index) => {
      const div = document.createElement('div')
      div.innerHTML = slide.content
      const text = div.textContent || div.innerText || ''
      return `幻灯片 ${index + 1}: ${slide.title}\n${text}\n`
    }).join('\n')
  }

  /**
   * 获取文档内容
   */
  getContent(): DocumentContent | null {
    if (this.isEditable) {
      this.updateCurrentSlide()
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

    // 注意：这里只能保存为 HTML 格式，因为生成 PPTX 需要复杂的库
    const html = this.documentContent.html || ''
    return new Blob([html], { type: 'text/html' })
  }

  /**
   * 设置编辑模式
   */
  setEditable(editable: boolean): void {
    this.isEditable = editable
    const slideContent = this.container.querySelector('.slide-content') as HTMLElement
    
    if (slideContent) {
      slideContent.contentEditable = editable.toString()
      
      if (editable && !slideContent.hasAttribute('data-events-bound')) {
        this.bindEditEvents()
        slideContent.setAttribute('data-events-bound', 'true')
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
    this.container.classList.remove('ldesign-powerpoint-viewer')
    this.documentInfo = null
    this.documentContent = null
    this.slides = []
  }
}
