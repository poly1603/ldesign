// 模拟的 DocumentViewer 类，用于演示
// 在实际项目中应该从 @ldesign/docview 导入

// 文档类型枚举
export const DocumentType = {
  WORD: 'word',
  EXCEL: 'excel',
  POWERPOINT: 'powerpoint'
}

// 错误类
export class DocumentViewerError extends Error {
  constructor(message, code, originalError) {
    super(message)
    this.name = 'DocumentViewerError'
    this.code = code
    this.originalError = originalError
  }
}

// 错误代码
export const ErrorCode = {
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  LOAD_FAILED: 'LOAD_FAILED',
  PARSE_FAILED: 'PARSE_FAILED',
  SAVE_FAILED: 'SAVE_FAILED',
  INVALID_CONTAINER: 'INVALID_CONTAINER'
}

// 工具函数
function getContainer(container) {
  if (typeof container === 'string') {
    const element = document.querySelector(container)
    if (!element) {
      throw new DocumentViewerError(
        `Container element not found: ${container}`,
        ErrorCode.INVALID_CONTAINER
      )
    }
    return element
  }
  return container
}

function detectDocumentType(file) {
  if (file instanceof File) {
    const extension = getFileExtension(file.name).toLowerCase()
    return getDocumentTypeFromExtension(extension)
  }
  return DocumentType.WORD // 默认
}

function getFileExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1) : ''
}

function getDocumentTypeFromExtension(extension) {
  switch (extension) {
    case 'doc':
    case 'docx':
      return DocumentType.WORD
    case 'xls':
    case 'xlsx':
      return DocumentType.EXCEL
    case 'ppt':
    case 'pptx':
      return DocumentType.POWERPOINT
    default:
      throw new DocumentViewerError(
        `Unsupported file extension: ${extension}`,
        ErrorCode.UNSUPPORTED_FORMAT
      )
  }
}

// 模拟的文档查看器类
export class DocumentViewer {
  constructor(options) {
    this.options = {
      editable: false,
      toolbar: { show: true, position: 'top' },
      theme: {},
      callbacks: {},
      ...options
    }

    this.container = getContainer(options.container)
    if (!this.container) {
      throw new DocumentViewerError(
        'Invalid container element',
        ErrorCode.INVALID_CONTAINER
      )
    }

    this.documentInfo = null
    this.documentContent = null
    this.initializeContainer()
  }

  initializeContainer() {
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

    this.bindToolbarEvents()
    this.applyTheme()
  }

  bindToolbarEvents() {
    const toolbar = this.container.querySelector('.ldesign-docview-toolbar')
    if (!toolbar) return

    toolbar.addEventListener('click', (event) => {
      const target = event.target
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

  applyTheme() {
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

  async loadDocument(file) {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      const documentType = detectDocumentType(file)
      
      // 创建文档信息
      this.documentInfo = {
        type: documentType,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        pageCount: Math.floor(Math.random() * 10) + 1
      }

      // 根据文档类型创建内容
      const content = await this.createMockContent(file, documentType)
      
      this.documentContent = {
        raw: file,
        html: content.html,
        text: content.text,
        metadata: content.metadata
      }

      // 渲染内容
      this.renderContent()

      // 触发加载完成回调
      this.options.callbacks?.onLoad?.(this.documentInfo)

    } catch (error) {
      const docError = error instanceof DocumentViewerError 
        ? error 
        : new DocumentViewerError('Failed to load document', ErrorCode.LOAD_FAILED, error)
      
      this.options.callbacks?.onError?.(docError)
      throw docError
    }
  }

  async createMockContent(file, type) {
    // 读取文件内容
    const text = await this.readFileAsText(file)
    
    switch (type) {
      case DocumentType.WORD:
        return this.createWordContent(text)
      case DocumentType.EXCEL:
        return this.createExcelContent(text)
      case DocumentType.POWERPOINT:
        return this.createPowerPointContent(text)
      default:
        throw new DocumentViewerError(
          `Unsupported document type: ${type}`,
          ErrorCode.UNSUPPORTED_FORMAT
        )
    }
  }

  createWordContent(text) {
    const html = `
      <div class="word-document">
        <div class="word-content" ${this.options.editable ? 'contenteditable="true"' : ''}>
          ${text.replace(/\n/g, '<br>')}
        </div>
      </div>
    `
    
    return {
      html,
      text,
      metadata: { type: 'word', editable: this.options.editable }
    }
  }

  createExcelContent(text) {
    // 简单的表格渲染
    const lines = text.split('\n').filter(line => line.trim())
    const rows = lines.map(line => line.split(','))
    
    let tableHtml = '<table class="excel-table" border="1" cellpadding="5" cellspacing="0">'
    
    rows.forEach((row, index) => {
      const tag = index === 0 ? 'th' : 'td'
      tableHtml += '<tr>'
      row.forEach(cell => {
        tableHtml += `<${tag}>${cell.trim()}</${tag}>`
      })
      tableHtml += '</tr>'
    })
    
    tableHtml += '</table>'
    
    const html = `
      <div class="excel-document">
        <div class="excel-toolbar">
          <span>工作表1</span>
        </div>
        <div class="excel-content">
          ${tableHtml}
        </div>
      </div>
    `
    
    return {
      html,
      text,
      metadata: { type: 'excel', sheets: 1 }
    }
  }

  createPowerPointContent(text) {
    // 简单的幻灯片渲染
    const slides = text.split('<div class="slide">').filter(slide => slide.trim())
    
    let slidesHtml = '<div class="ppt-container">'
    slidesHtml += '<div class="ppt-toolbar">'
    slidesHtml += '<button class="ppt-btn" onclick="this.parentElement.parentElement.querySelector(\'.ppt-slide.active\').previousElementSibling?.click()">上一页</button>'
    slidesHtml += '<span class="slide-counter">1 / ' + slides.length + '</span>'
    slidesHtml += '<button class="ppt-btn" onclick="this.parentElement.parentElement.querySelector(\'.ppt-slide.active\').nextElementSibling?.click()">下一页</button>'
    slidesHtml += '</div>'
    slidesHtml += '<div class="ppt-content">'
    
    slides.forEach((slide, index) => {
      const cleanSlide = slide.replace('</div>', '').trim()
      slidesHtml += `
        <div class="ppt-slide ${index === 0 ? 'active' : ''}" onclick="this.parentElement.querySelectorAll('.ppt-slide').forEach(s => s.classList.remove('active')); this.classList.add('active')">
          ${cleanSlide}
        </div>
      `
    })
    
    slidesHtml += '</div></div>'
    
    return {
      html: slidesHtml,
      text,
      metadata: { type: 'powerpoint', slides: slides.length }
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  renderContent() {
    const contentContainer = this.container.querySelector('.ldesign-docview-content')
    if (!contentContainer || !this.documentContent) return

    contentContainer.innerHTML = this.documentContent.html

    // 应用样式
    this.applyContentStyles(contentContainer)

    // 如果是编辑模式，绑定变化事件
    if (this.options.editable) {
      this.bindContentEvents(contentContainer)
    }
  }

  applyContentStyles(container) {
    container.style.cssText = `
      padding: 20px;
      background: white;
      height: calc(100% - ${this.options.toolbar?.show ? '50px' : '0px'});
      overflow: auto;
    `

    // Word 文档样式
    const wordContent = container.querySelector('.word-content')
    if (wordContent) {
      wordContent.style.cssText = `
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      `
    }

    // Excel 表格样式
    const excelTable = container.querySelector('.excel-table')
    if (excelTable) {
      excelTable.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        font-size: 12px;
      `
      
      const cells = excelTable.querySelectorAll('th, td')
      cells.forEach(cell => {
        cell.style.cssText = `
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        `
      })
      
      const headers = excelTable.querySelectorAll('th')
      headers.forEach(header => {
        header.style.backgroundColor = '#f8f9fa'
        header.style.fontWeight = 'bold'
      })
    }

    // PowerPoint 样式
    const pptContainer = container.querySelector('.ppt-container')
    if (pptContainer) {
      pptContainer.style.cssText = `
        height: 100%;
        display: flex;
        flex-direction: column;
      `
      
      const pptToolbar = container.querySelector('.ppt-toolbar')
      if (pptToolbar) {
        pptToolbar.style.cssText = `
          padding: 10px;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
          display: flex;
          align-items: center;
          gap: 10px;
        `
      }
      
      const pptContent = container.querySelector('.ppt-content')
      if (pptContent) {
        pptContent.style.cssText = `
          flex: 1;
          position: relative;
          overflow: hidden;
        `
      }
      
      const slides = container.querySelectorAll('.ppt-slide')
      slides.forEach(slide => {
        slide.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 40px;
          background: white;
          border: 1px solid #ddd;
          display: none;
          overflow: auto;
        `
      })
      
      const activeSlide = container.querySelector('.ppt-slide.active')
      if (activeSlide) {
        activeSlide.style.display = 'block'
      }
    }
  }

  bindContentEvents(container) {
    const editableElements = container.querySelectorAll('[contenteditable="true"]')
    
    editableElements.forEach(element => {
      let timeout = null
      
      element.addEventListener('input', () => {
        if (timeout) clearTimeout(timeout)
        
        timeout = setTimeout(() => {
          this.updateContent()
          this.options.callbacks?.onChange?.(this.getContent())
        }, 300)
      })
    })
  }

  updateContent() {
    const contentContainer = this.container.querySelector('.ldesign-docview-content')
    if (!contentContainer || !this.documentContent) return

    this.documentContent = {
      ...this.documentContent,
      html: contentContainer.innerHTML,
      text: contentContainer.textContent || ''
    }
  }

  getContent() {
    if (this.options.editable) {
      this.updateContent()
    }
    return this.documentContent
  }

  async save() {
    if (!this.documentContent) {
      throw new DocumentViewerError('No document content to save', ErrorCode.SAVE_FAILED)
    }

    const html = this.documentContent.html || ''
    return new Blob([html], { type: 'text/html' })
  }

  setEditable(editable) {
    this.options.editable = editable
    
    const editableElements = this.container.querySelectorAll('[contenteditable]')
    editableElements.forEach(element => {
      element.contentEditable = editable.toString()
    })
    
    if (editable) {
      const contentContainer = this.container.querySelector('.ldesign-docview-content')
      this.bindContentEvents(contentContainer)
    }
  }

  getDocumentInfo() {
    return this.documentInfo
  }

  destroy() {
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-docview-container')
    this.documentInfo = null
    this.documentContent = null
  }

  handleSave() {
    const content = this.getContent()
    if (content) {
      this.options.callbacks?.onSave?.(content)
    }
  }

  handleDownload() {
    // 由外部处理
  }

  handlePrint() {
    // 由外部处理
  }
}
