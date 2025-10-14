import { Editor } from '../core/Editor'

export interface MediaInsertOptions {
  title: string
  accept?: string
  mediaType: 'image' | 'video' | 'audio' | 'file'
  onInsert: (url: string, file?: File) => void
  onCancel?: () => void
}

export class MediaInsertDialog {
  private container: HTMLDivElement
  private editor: Editor
  private options: MediaInsertOptions
  private fileInput: HTMLInputElement
  private urlInput: HTMLInputElement
  private previewArea?: HTMLDivElement
  private selectedFile?: File
  private currentTab: 'local' | 'url' = 'local'

  constructor(editor: Editor, options: MediaInsertOptions) {
    this.editor = editor
    this.options = options
    this.container = document.createElement('div')
    this.fileInput = document.createElement('input')
    this.urlInput = document.createElement('input')
    this.init()
  }

  private init() {
    this.container.className = 'ldesign-media-dialog-overlay'
    this.container.innerHTML = this.getDialogHTML()
    document.body.appendChild(this.container)

    this.setupEventListeners()
    this.setupFileInput()
  }

  private getDialogHTML(): string {
    return `
      <div class="ldesign-media-dialog">
        <div class="ldesign-media-dialog-header">
          <h3>${this.options.title}</h3>
          <button class="ldesign-media-dialog-close">×</button>
        </div>
        <div class="ldesign-media-dialog-body">
          <div class="ldesign-media-tabs">
            <button class="ldesign-media-tab active" data-tab="local">本地文件</button>
            <button class="ldesign-media-tab" data-tab="url">网络地址</button>
          </div>
          
          <div class="ldesign-media-tab-content" data-content="local">
            <div class="ldesign-media-upload-area">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>点击或拖拽文件到这里</p>
              <button class="ldesign-media-select-btn">选择文件</button>
            </div>
            <div class="ldesign-media-preview" style="display: none;"></div>
          </div>
          
          <div class="ldesign-media-tab-content" data-content="url" style="display: none;">
            <div class="ldesign-media-url-input-group">
              <label>${this.getUrlLabel()}</label>
              <input type="url" class="ldesign-media-url-input" placeholder="https://example.com/media.${this.getFileExtension()}">
              <div class="ldesign-media-url-preview" style="display: none;"></div>
            </div>
          </div>
        </div>
        
        <div class="ldesign-media-dialog-footer">
          <button class="ldesign-media-btn ldesign-media-btn-cancel">取消</button>
          <button class="ldesign-media-btn ldesign-media-btn-primary" disabled>插入</button>
        </div>
      </div>
    `
  }

  private getUrlLabel(): string {
    const labels = {
      'image': '图片地址',
      'video': '视频地址',
      'audio': '音频地址',
      'file': '文件地址'
    }
    return labels[this.options.mediaType]
  }

  private getFileExtension(): string {
    const extensions = {
      'image': 'jpg',
      'video': 'mp4',
      'audio': 'mp3',
      'file': 'pdf'
    }
    return extensions[this.options.mediaType]
  }

  private setupEventListeners() {
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    
    // 关闭按钮
    const closeBtn = dialog.querySelector('.ldesign-media-dialog-close') as HTMLButtonElement
    closeBtn.addEventListener('click', () => this.close())

    // Tab 切换
    const tabs = dialog.querySelectorAll('.ldesign-media-tab')
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const tabName = target.dataset.tab as 'local' | 'url'
        this.switchTab(tabName)
      })
    })

    // 取消按钮
    const cancelBtn = dialog.querySelector('.ldesign-media-btn-cancel') as HTMLButtonElement
    cancelBtn.addEventListener('click', () => this.close())

    // 插入按钮
    const insertBtn = dialog.querySelector('.ldesign-media-btn-primary') as HTMLButtonElement
    insertBtn.addEventListener('click', () => this.handleInsert())

    // 选择文件按钮
    const selectBtn = dialog.querySelector('.ldesign-media-select-btn') as HTMLButtonElement
    selectBtn.addEventListener('click', () => this.fileInput.click())

    // 上传区域点击
    const uploadArea = dialog.querySelector('.ldesign-media-upload-area') as HTMLElement
    uploadArea.addEventListener('click', () => this.fileInput.click())

    // 拖拽上传
    this.setupDragAndDrop(uploadArea)

    // URL输入
    this.urlInput = dialog.querySelector('.ldesign-media-url-input') as HTMLInputElement
    this.urlInput.addEventListener('input', () => this.handleUrlInput())

    // 点击遮罩关闭
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close()
      }
    })

    // ESC键关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
  }

  private setupFileInput() {
    this.fileInput.type = 'file'
    this.fileInput.accept = this.getAcceptTypes()
    this.fileInput.style.display = 'none'
    
    this.fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        this.handleFileSelect(target.files[0])
      }
    })
    
    document.body.appendChild(this.fileInput)
  }

  private getAcceptTypes(): string {
    const types = {
      'image': 'image/*',
      'video': 'video/*',
      'audio': 'audio/*',
      'file': '*'
    }
    return this.options.accept || types[this.options.mediaType]
  }

  private setupDragAndDrop(uploadArea: HTMLElement) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragging')
    })

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragging')
    })

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragging')
      
      const files = e.dataTransfer?.files
      if (files && files[0]) {
        this.handleFileSelect(files[0])
      }
    })
  }

  private switchTab(tabName: 'local' | 'url') {
    this.currentTab = tabName
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    
    // 切换tab按钮状态
    const tabs = dialog.querySelectorAll('.ldesign-media-tab')
    tabs.forEach(tab => {
      const tabElement = tab as HTMLElement
      if (tabElement.dataset.tab === tabName) {
        tabElement.classList.add('active')
      } else {
        tabElement.classList.remove('active')
      }
    })

    // 切换内容区域
    const contents = dialog.querySelectorAll('.ldesign-media-tab-content')
    contents.forEach(content => {
      const contentElement = content as HTMLElement
      if (contentElement.dataset.content === tabName) {
        contentElement.style.display = 'block'
      } else {
        contentElement.style.display = 'none'
      }
    })

    // 更新插入按钮状态
    this.updateInsertButton()
  }

  private handleFileSelect(file: File) {
    this.selectedFile = file
    
    // 验证文件类型
    if (!this.validateFileType(file)) {
      alert(`请选择正确的${this.getMediaTypeName()}文件`)
      return
    }

    // 显示预览
    this.showLocalPreview(file)
    
    // 启用插入按钮
    this.updateInsertButton()
  }

  private validateFileType(file: File): boolean {
    const type = file.type
    switch (this.options.mediaType) {
      case 'image':
        return type.startsWith('image/')
      case 'video':
        return type.startsWith('video/')
      case 'audio':
        return type.startsWith('audio/')
      case 'file':
        return true
    }
  }

  private getMediaTypeName(): string {
    const names = {
      'image': '图片',
      'video': '视频',
      'audio': '音频',
      'file': '文件'
    }
    return names[this.options.mediaType]
  }

  private showLocalPreview(file: File) {
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    const uploadArea = dialog.querySelector('.ldesign-media-upload-area') as HTMLElement
    const previewArea = dialog.querySelector('.ldesign-media-preview') as HTMLDivElement
    
    uploadArea.style.display = 'none'
    previewArea.style.display = 'block'
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const url = e.target?.result as string
      previewArea.innerHTML = this.getPreviewHTML(url, file.name)
      
      // 添加删除按钮事件
      const removeBtn = previewArea.querySelector('.ldesign-media-remove-btn')
      removeBtn?.addEventListener('click', () => {
        this.removeSelectedFile()
      })
    }
    
    if (this.options.mediaType === 'file') {
      previewArea.innerHTML = this.getFilePreviewHTML(file.name, file.size)
      const removeBtn = previewArea.querySelector('.ldesign-media-remove-btn')
      removeBtn?.addEventListener('click', () => {
        this.removeSelectedFile()
      })
    } else {
      reader.readAsDataURL(file)
    }
  }

  private getPreviewHTML(url: string, filename: string): string {
    switch (this.options.mediaType) {
      case 'image':
        return `
          <div class="ldesign-media-preview-item">
            <img src="${url}" alt="${filename}">
            <div class="ldesign-media-preview-info">
              <span>${filename}</span>
              <button class="ldesign-media-remove-btn">删除</button>
            </div>
          </div>
        `
      case 'video':
        return `
          <div class="ldesign-media-preview-item">
            <video src="${url}" controls></video>
            <div class="ldesign-media-preview-info">
              <span>${filename}</span>
              <button class="ldesign-media-remove-btn">删除</button>
            </div>
          </div>
        `
      case 'audio':
        return `
          <div class="ldesign-media-preview-item">
            <audio src="${url}" controls></audio>
            <div class="ldesign-media-preview-info">
              <span>${filename}</span>
              <button class="ldesign-media-remove-btn">删除</button>
            </div>
          </div>
        `
      default:
        return this.getFilePreviewHTML(filename, 0)
    }
  }

  private getFilePreviewHTML(filename: string, filesize: number): string {
    const size = this.formatFileSize(filesize)
    return `
      <div class="ldesign-media-preview-item ldesign-media-file-preview">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <div class="ldesign-media-preview-info">
          <span>${filename}</span>
          <span class="ldesign-media-file-size">${size}</span>
          <button class="ldesign-media-remove-btn">删除</button>
        </div>
      </div>
    `
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  private removeSelectedFile() {
    this.selectedFile = undefined
    this.fileInput.value = ''
    
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    const uploadArea = dialog.querySelector('.ldesign-media-upload-area') as HTMLElement
    const previewArea = dialog.querySelector('.ldesign-media-preview') as HTMLDivElement
    
    uploadArea.style.display = 'block'
    previewArea.style.display = 'none'
    previewArea.innerHTML = ''
    
    this.updateInsertButton()
  }

  private handleUrlInput() {
    const url = this.urlInput.value.trim()
    
    if (url && this.isValidUrl(url)) {
      this.showUrlPreview(url)
    } else {
      this.hideUrlPreview()
    }
    
    this.updateInsertButton()
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private showUrlPreview(url: string) {
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    const previewArea = dialog.querySelector('.ldesign-media-url-preview') as HTMLDivElement
    
    previewArea.style.display = 'block'
    
    switch (this.options.mediaType) {
      case 'image':
        previewArea.innerHTML = `
          <div class="ldesign-media-url-preview-item">
            <img src="${url}" alt="Preview" onError="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E加载失败%3C/text%3E%3C/svg%3E'">
          </div>
        `
        break
      case 'video':
        previewArea.innerHTML = `
          <div class="ldesign-media-url-preview-item">
            <video src="${url}" controls></video>
          </div>
        `
        break
      case 'audio':
        previewArea.innerHTML = `
          <div class="ldesign-media-url-preview-item">
            <audio src="${url}" controls></audio>
          </div>
        `
        break
      case 'file':
        const filename = url.split('/').pop() || 'file'
        previewArea.innerHTML = `
          <div class="ldesign-media-url-preview-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>${filename}</span>
          </div>
        `
        break
    }
  }

  private hideUrlPreview() {
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    const previewArea = dialog.querySelector('.ldesign-media-url-preview') as HTMLDivElement
    previewArea.style.display = 'none'
    previewArea.innerHTML = ''
  }

  private updateInsertButton() {
    const dialog = this.container.querySelector('.ldesign-media-dialog') as HTMLElement
    const insertBtn = dialog.querySelector('.ldesign-media-btn-primary') as HTMLButtonElement
    
    if (this.currentTab === 'local') {
      insertBtn.disabled = !this.selectedFile
    } else {
      const url = this.urlInput.value.trim()
      insertBtn.disabled = !url || !this.isValidUrl(url)
    }
  }

  private async handleInsert() {
    if (this.currentTab === 'local' && this.selectedFile) {
      // 将文件转换为Data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        this.options.onInsert(url, this.selectedFile)
        this.close()
      }
      reader.readAsDataURL(this.selectedFile)
    } else if (this.currentTab === 'url') {
      const url = this.urlInput.value.trim()
      if (url && this.isValidUrl(url)) {
        this.options.onInsert(url)
        this.close()
      }
    }
  }

  private close() {
    // 清理文件输入
    if (this.fileInput.parentNode) {
      this.fileInput.parentNode.removeChild(this.fileInput)
    }
    
    // 移除对话框
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    
    // 调用取消回调
    if (this.options.onCancel) {
      this.options.onCancel()
    }
  }

  public show() {
    this.container.style.display = 'flex'
  }
}