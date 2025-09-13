import { BasePlugin } from '../base-plugin'
import { LDesignEditor } from '../../core/editor'
import { ToolbarItem } from '../../types'

/**
 * 媒体类型枚举
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}

/**
 * 媒体文件接口
 */
export interface MediaFile {
  /** 文件ID */
  id: string
  /** 文件名 */
  name: string
  /** 文件类型 */
  type: MediaType
  /** MIME类型 */
  mimeType: string
  /** 文件大小（字节） */
  size: number
  /** 文件URL */
  url: string
  /** 缩略图URL */
  thumbnailUrl?: string
  /** 文件宽度（图片/视频） */
  width?: number
  /** 文件高度（图片/视频） */
  height?: number
  /** 时长（视频/音频，秒） */
  duration?: number
  /** 上传时间 */
  uploadTime: Date
  /** 描述信息 */
  description?: string
  /** 标签 */
  tags?: string[]
}

/**
 * 媒体插件配置接口
 */
export interface MediaConfig {
  /** 是否启用媒体功能 */
  enabled?: boolean
  /** 支持的媒体类型 */
  supportedTypes?: MediaType[]
  /** 最大文件大小（MB） */
  maxFileSize?: number
  /** 图片最大尺寸 */
  maxImageSize?: { width: number; height: number }
  /** 视频最大尺寸 */
  maxVideoSize?: { width: number; height: number }
  /** 支持的文件格式 */
  allowedFormats?: {
    image: string[]
    video: string[]
    audio: string[]
  }
  /** 上传处理器 */
  uploadHandler?: (file: File) => Promise<MediaFile>
  /** 存储提供商 */
  storageProvider?: 'local' | 'cloud' | 'custom'
  /** 压缩选项 */
  compression?: {
    enabled: boolean
    quality: number
    maxWidth: number
    maxHeight: number
  }
}

/**
 * 媒体插件类
 * 提供图片、视频、音频等媒体文件的管理和编辑功能
 */
export class MediaPlugin extends BasePlugin {
  name = 'media'
  
  private config: Required<MediaConfig>
  private mediaLibraryDialog: HTMLElement | null = null
  private uploadDialog: HTMLElement | null = null
  private mediaLibrary: Map<string, MediaFile> = new Map()
  private currentMedia: MediaFile | null = null

  constructor(editor: LDesignEditor, config: MediaConfig = {}) {
    super(editor)
    
    // 设置默认配置
    this.config = {
      enabled: true,
      supportedTypes: [MediaType.IMAGE, MediaType.VIDEO, MediaType.AUDIO],
      maxFileSize: 50, // 50MB
      maxImageSize: { width: 4000, height: 4000 },
      maxVideoSize: { width: 1920, height: 1080 },
      allowedFormats: {
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        video: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
        audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a']
      },
      uploadHandler: this.defaultUploadHandler.bind(this),
      storageProvider: 'local',
      compression: {
        enabled: true,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080
      },
      ...config
    }
  }

  /**
   * 初始化插件
   */
  init(): void {
    if (!this.config.enabled) return

    this.registerCommands()
    this.registerEventHandlers()
    this.createMediaLibraryDialog()
    this.createUploadDialog()
    this.loadMediaLibrary()
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.removeMediaLibraryDialog()
    this.removeUploadDialog()
    this.clearMediaLibrary()
    super.destroy()
  }

  /**
   * 获取工具栏项
   */
  getToolbarItems(): ToolbarItem[] {
    if (!this.config.enabled) return []

    const items: ToolbarItem[] = []

    // 图片按钮
    if (this.config.supportedTypes.includes(MediaType.IMAGE)) {
      items.push({
        id: 'insert-image',
        type: 'button',
        label: '插入图片',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="3" width="12" height="10" rx="1" fill="none" stroke="currentColor"/>
          <circle cx="6" cy="7" r="1.5" fill="currentColor"/>
          <path d="M12 11L9 8L6 10L4 9" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>`,
        title: '插入图片',
        command: 'insertImage',
        group: 'media'
      })
    }

    // 视频按钮
    if (this.config.supportedTypes.includes(MediaType.VIDEO)) {
      items.push({
        id: 'insert-video',
        type: 'button',
        label: '插入视频',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="3" width="12" height="10" rx="1" fill="none" stroke="currentColor"/>
          <path d="M7 5L11 8L7 11Z" fill="currentColor"/>
        </svg>`,
        title: '插入视频',
        command: 'insertVideo',
        group: 'media'
      })
    }

    // 音频按钮
    if (this.config.supportedTypes.includes(MediaType.AUDIO)) {
      items.push({
        id: 'insert-audio',
        type: 'button',
        label: '插入音频',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 3V13M5 9H11M6 6H10M7 12H9" stroke="currentColor" stroke-width="1" fill="none"/>
          <path d="M3 5V11C3 12.1 3.9 13 5 13H11C12.1 13 13 12.1 13 11V5C13 3.9 12.1 3 11 3H5C3.9 3 3 3.9 3 5Z" 
                stroke="currentColor" stroke-width="1" fill="none"/>
        </svg>`,
        title: '插入音频',
        command: 'insertAudio',
        group: 'media'
      })
    }

    // 媒体库按钮
    items.push({
      id: 'media-library',
      type: 'button',
      label: '媒体库',
      icon: `<svg width="16" height="16" viewBox="0 0 16 16">
        <rect x="2" y="2" width="4" height="4" rx="0.5" fill="none" stroke="currentColor"/>
        <rect x="7" y="2" width="4" height="4" rx="0.5" fill="none" stroke="currentColor"/>
        <rect x="12" y="2" width="2" height="4" rx="0.5" fill="none" stroke="currentColor"/>
        <rect x="2" y="7" width="4" height="4" rx="0.5" fill="none" stroke="currentColor"/>
        <rect x="7" y="7" width="7" height="2" rx="0.5" fill="none" stroke="currentColor"/>
        <rect x="7" y="10" width="7" height="3" rx="0.5" fill="none" stroke="currentColor"/>
      </svg>`,
      title: '媒体库管理',
      command: 'showMediaLibrary',
      group: 'media'
    })

    return items
  }

  /**
   * 注册命令
   */
  private registerCommands(): void {
    // 插入图片命令
    this.editor.commands.register({
      name: 'insertImage',
      execute: () => this.showUploadDialog(MediaType.IMAGE)
    })

    // 插入视频命令
    this.editor.commands.register({
      name: 'insertVideo',
      execute: () => this.showUploadDialog(MediaType.VIDEO)
    })

    // 插入音频命令
    this.editor.commands.register({
      name: 'insertAudio',
      execute: () => this.showUploadDialog(MediaType.AUDIO)
    })

    // 显示媒体库命令
    this.editor.commands.register({
      name: 'showMediaLibrary',
      execute: () => this.showMediaLibraryDialog()
    })

    // 上传文件命令
    this.editor.commands.register({
      name: 'uploadMediaFile',
      execute: (file: File, type?: MediaType) => this.uploadMediaFile(file, type)
    })

    // 插入媒体命令
    this.editor.commands.register({
      name: 'insertMedia',
      execute: (mediaFile: MediaFile) => this.insertMediaElement(mediaFile)
    })

    // 删除媒体命令
    this.editor.commands.register({
      name: 'deleteMediaFile',
      execute: (mediaId: string) => this.deleteMediaFile(mediaId)
    })
  }

  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 监听拖拽上传
    this.editor.content.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'copy'
    })

    this.editor.content.addEventListener('drop', (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer?.files || [])
      this.handleFilesDrop(files)
    })

    // 监听粘贴上传
    this.editor.content.addEventListener('paste', (e) => {
      const items = Array.from(e.clipboardData?.items || [])
      const files = items
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(Boolean) as File[]
      
      if (files.length > 0) {
        e.preventDefault()
        this.handleFilesDrop(files)
      }
    })

    // 监听媒体元素点击编辑
    this.editor.content.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'AUDIO') {
        this.handleMediaElementClick(target)
      }
    })
  }

  /**
   * 显示上传对话框
   */
  private showUploadDialog(type: MediaType): void {
    if (!this.uploadDialog) return

    // 设置当前上传类型
    const typeTitle = this.uploadDialog.querySelector('.upload-type-title') as HTMLElement
    const fileInput = this.uploadDialog.querySelector('#file-input') as HTMLInputElement
    
    if (typeTitle) {
      const typeNames = {
        [MediaType.IMAGE]: '图片',
        [MediaType.VIDEO]: '视频',
        [MediaType.AUDIO]: '音频'
      }
      typeTitle.textContent = `上传${typeNames[type]}`
    }

    // 设置文件类型限制
    if (fileInput) {
      const acceptTypes = {
        [MediaType.IMAGE]: 'image/*',
        [MediaType.VIDEO]: 'video/*',
        [MediaType.AUDIO]: 'audio/*'
      }
      fileInput.accept = acceptTypes[type]
      fileInput.dataset.uploadType = type
    }

    this.uploadDialog.style.display = 'block'
    this.uploadDialog.classList.add('show')
  }

  /**
   * 隐藏上传对话框
   */
  private hideUploadDialog(): void {
    if (!this.uploadDialog) return
    
    this.uploadDialog.style.display = 'none'
    this.uploadDialog.classList.remove('show')
    
    // 重置上传状态
    this.resetUploadState()
  }

  /**
   * 显示媒体库对话框
   */
  private showMediaLibraryDialog(): void {
    if (!this.mediaLibraryDialog) return

    this.mediaLibraryDialog.style.display = 'block'
    this.mediaLibraryDialog.classList.add('show')
    
    // 刷新媒体库显示
    this.refreshMediaLibraryDisplay()
  }

  /**
   * 隐藏媒体库对话框
   */
  private hideMediaLibraryDialog(): void {
    if (!this.mediaLibraryDialog) return
    
    this.mediaLibraryDialog.style.display = 'none'
    this.mediaLibraryDialog.classList.remove('show')
  }

  /**
   * 创建上传对话框
   */
  private createUploadDialog(): void {
    this.uploadDialog = document.createElement('div')
    this.uploadDialog.className = 'ldesign-media-upload-dialog'
    this.uploadDialog.innerHTML = `
      <div class="upload-dialog-content">
        <div class="upload-dialog-header">
          <h3 class="upload-type-title">上传媒体</h3>
          <button class="dialog-close" type="button" title="关闭">×</button>
        </div>
        <div class="upload-dialog-body">
          <div class="upload-area" id="upload-area">
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <polyline points="9,15 12,12 15,15"></polyline>
              </svg>
            </div>
            <div class="upload-text">
              <p class="upload-title">点击上传或拖拽文件到此处</p>
              <p class="upload-hint">支持单个或多个文件上传</p>
            </div>
            <input type="file" id="file-input" multiple style="display: none" />
          </div>
          
          <div class="upload-progress" id="upload-progress" style="display: none">
            <div class="progress-info">
              <span class="progress-text">上传中...</span>
              <span class="progress-percent">0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
          
          <div class="upload-list" id="upload-list"></div>
        </div>
        <div class="upload-dialog-footer">
          <button class="btn btn-secondary dialog-close">取消</button>
          <button class="btn btn-primary" id="confirm-upload" style="display: none">确定上传</button>
        </div>
      </div>
    `

    // 绑定事件
    this.bindUploadDialogEvents()

    // 添加到编辑器容器
    this.editor.container.appendChild(this.uploadDialog)
  }

  /**
   * 绑定上传对话框事件
   */
  private bindUploadDialogEvents(): void {
    if (!this.uploadDialog) return

    const uploadArea = this.uploadDialog.querySelector('#upload-area') as HTMLElement
    const fileInput = this.uploadDialog.querySelector('#file-input') as HTMLInputElement
    const confirmBtn = this.uploadDialog.querySelector('#confirm-upload') as HTMLButtonElement

    // 关闭按钮
    const closeButtons = this.uploadDialog.querySelectorAll('.dialog-close')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hideUploadDialog())
    })

    // 上传区域点击
    uploadArea?.addEventListener('click', () => {
      fileInput?.click()
    })

    // 文件选择
    fileInput?.addEventListener('change', (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        this.handleFilesSelected(files)
      }
    })

    // 拖拽事件
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('drag-over')
    })

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over')
    })

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('drag-over')
      const files = Array.from(e.dataTransfer?.files || [])
      if (files.length > 0) {
        this.handleFilesSelected(files)
      }
    })

    // 确定上传
    confirmBtn?.addEventListener('click', () => {
      this.processSelectedFiles()
    })

    // 点击外部关闭
    this.uploadDialog.addEventListener('click', (e) => {
      if (e.target === this.uploadDialog) {
        this.hideUploadDialog()
      }
    })
  }

  /**
   * 处理文件选择
   */
  private handleFilesSelected(files: File[]): void {
    const uploadList = this.uploadDialog?.querySelector('#upload-list') as HTMLElement
    const confirmBtn = this.uploadDialog?.querySelector('#confirm-upload') as HTMLButtonElement
    
    if (!uploadList) return

    // 清空之前的列表
    uploadList.innerHTML = ''
    
    const validFiles: File[] = []
    
    files.forEach(file => {
      const validation = this.validateFile(file)
      const fileItem = this.createFileListItem(file, validation.valid, validation.error)
      uploadList.appendChild(fileItem)
      
      if (validation.valid) {
        validFiles.push(file)
      }
    })

    // 显示确定按钮
    if (validFiles.length > 0) {
      confirmBtn.style.display = 'inline-block'
      confirmBtn.dataset.validFiles = JSON.stringify(validFiles.map(f => f.name))
    } else {
      confirmBtn.style.display = 'none'
    }
  }

  /**
   * 创建文件列表项
   */
  private createFileListItem(file: File, valid: boolean, error?: string): HTMLElement {
    const item = document.createElement('div')
    item.className = `file-item ${valid ? 'valid' : 'invalid'}`
    
    const sizeText = this.formatFileSize(file.size)
    const statusIcon = valid ? '✓' : '✗'
    const statusClass = valid ? 'success' : 'error'
    
    item.innerHTML = `
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-details">${sizeText} • ${file.type || '未知类型'}</div>
        ${error ? `<div class="file-error">${error}</div>` : ''}
      </div>
      <div class="file-status ${statusClass}">${statusIcon}</div>
    `
    
    return item
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
  }

  /**
   * 处理选中的文件
   */
  private async processSelectedFiles(): void {
    const fileInput = this.uploadDialog?.querySelector('#file-input') as HTMLInputElement
    const files = Array.from(fileInput?.files || [])
    
    const validFiles = files.filter(file => this.validateFile(file).valid)
    
    if (validFiles.length === 0) return
    
    // 显示进度
    this.showUploadProgress()
    
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const progress = ((i + 1) / validFiles.length) * 100
        
        this.updateUploadProgress(progress, `上传 ${file.name}...`)
        
        // 上传文件
        const mediaFile = await this.uploadMediaFile(file)
        if (mediaFile) {
          // 直接插入到编辑器
          this.insertMediaElement(mediaFile)
        }
      }
      
      this.updateUploadProgress(100, '上传完成！')
      
      // 延迟关闭对话框
      setTimeout(() => {
        this.hideUploadDialog()
      }, 1000)
      
    } catch (error) {
      console.error('上传失败:', error)
      this.updateUploadProgress(0, `上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 显示上传进度
   */
  private showUploadProgress(): void {
    const uploadArea = this.uploadDialog?.querySelector('#upload-area') as HTMLElement
    const uploadProgress = this.uploadDialog?.querySelector('#upload-progress') as HTMLElement
    const confirmBtn = this.uploadDialog?.querySelector('#confirm-upload') as HTMLButtonElement
    
    if (uploadArea) uploadArea.style.display = 'none'
    if (uploadProgress) uploadProgress.style.display = 'block'
    if (confirmBtn) confirmBtn.disabled = true
  }

  /**
   * 更新上传进度
   */
  private updateUploadProgress(percent: number, text: string): void {
    const progressText = this.uploadDialog?.querySelector('.progress-text') as HTMLElement
    const progressPercent = this.uploadDialog?.querySelector('.progress-percent') as HTMLElement
    const progressFill = this.uploadDialog?.querySelector('.progress-fill') as HTMLElement
    
    if (progressText) progressText.textContent = text
    if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`
    if (progressFill) progressFill.style.width = `${percent}%`
  }

  /**
   * 重置上传状态
   */
  private resetUploadState(): void {
    const uploadArea = this.uploadDialog?.querySelector('#upload-area') as HTMLElement
    const uploadProgress = this.uploadDialog?.querySelector('#upload-progress') as HTMLElement
    const uploadList = this.uploadDialog?.querySelector('#upload-list') as HTMLElement
    const confirmBtn = this.uploadDialog?.querySelector('#confirm-upload') as HTMLButtonElement
    const fileInput = this.uploadDialog?.querySelector('#file-input') as HTMLInputElement
    
    if (uploadArea) uploadArea.style.display = 'block'
    if (uploadProgress) uploadProgress.style.display = 'none'
    if (uploadList) uploadList.innerHTML = ''
    if (confirmBtn) {
      confirmBtn.style.display = 'none'
      confirmBtn.disabled = false
    }
    if (fileInput) fileInput.value = ''
  }

  /**
   * 移除上传对话框
   */
  private removeUploadDialog(): void {
    if (this.uploadDialog) {
      this.uploadDialog.remove()
      this.uploadDialog = null
    }
  }

  /**
   * 上传媒体文件
   */
  private async uploadMediaFile(file: File, type?: MediaType): Promise<MediaFile | null> {
    try {
      const mediaFile = await this.config.uploadHandler(file)
      
      // 添加到媒体库
      this.mediaLibrary.set(mediaFile.id, mediaFile)
      
      // 保存到本地存储
      this.saveMediaLibraryToStorage()
      
      return mediaFile
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  /**
   * 插入媒体元素
   */
  private insertMediaElement(mediaFile: MediaFile): void {
    let element: HTMLElement
    
    switch (mediaFile.type) {
      case MediaType.IMAGE:
        element = this.createImageElement(mediaFile)
        break
      case MediaType.VIDEO:
        element = this.createVideoElement(mediaFile)
        break
      case MediaType.AUDIO:
        element = this.createAudioElement(mediaFile)
        break
      default:
        console.warn('不支持的媒体类型:', mediaFile.type)
        return
    }
    
    // 插入到编辑器
    this.insertElementAtCursor(element)
    
    // 记录历史
    this.editor.history?.record(`插入${this.getMediaTypeDisplayName(mediaFile.type)}`)
  }

  /**
   * 创建媒体库对话框
   */
  private createMediaLibraryDialog(): void {
    this.mediaLibraryDialog = document.createElement('div')
    this.mediaLibraryDialog.className = 'ldesign-media-library-dialog'
    this.mediaLibraryDialog.innerHTML = `
      <div class="library-dialog-content">
        <div class="library-dialog-header">
          <h3>媒体库</h3>
          <button class="dialog-close" type="button" title="关闭">×</button>
        </div>
        <div class="library-dialog-body">
          <div class="library-toolbar">
            <div class="library-stats">
              <span class="stat-item">共 <span id="total-count">0</span> 个文件</span>
              <span class="stat-item">大小: <span id="total-size">0 B</span></span>
            </div>
            <div class="library-actions">
              <button class="btn btn-sm btn-primary" id="upload-media">上传</button>
              <button class="btn btn-sm btn-secondary" id="clear-library">清空</button>
            </div>
          </div>
          <div class="library-filter">
            <select id="type-filter">
              <option value="all">所有类型</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
              <option value="audio">音频</option>
            </select>
            <input type="text" id="search-input" placeholder="搜索媒体文件..." />
          </div>
          <div class="library-content" id="library-content">
            <div class="library-empty">
              <p>媒体库为空</p>
              <p>点击上传按钮添加媒体文件</p>
            </div>
          </div>
        </div>
        <div class="library-dialog-footer">
          <button class="btn btn-secondary dialog-close">关闭</button>
        </div>
      </div>
    `

    // 绑定事件
    this.bindMediaLibraryEvents()

    // 添加到编辑器容器
    this.editor.container.appendChild(this.mediaLibraryDialog)
  }

  /**
   * 绑定媒体库事件
   */
  private bindMediaLibraryEvents(): void {
    if (!this.mediaLibraryDialog) return

    // 关闭按钮
    const closeButtons = this.mediaLibraryDialog.querySelectorAll('.dialog-close')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hideMediaLibraryDialog())
    })

    // 上传按钮
    const uploadBtn = this.mediaLibraryDialog.querySelector('#upload-media')
    uploadBtn?.addEventListener('click', () => {
      this.hideMediaLibraryDialog()
      this.showUploadDialog(MediaType.IMAGE) // 默认上传图片
    })

    // 清空按钮
    const clearBtn = this.mediaLibraryDialog.querySelector('#clear-library')
    clearBtn?.addEventListener('click', () => {
      if (confirm('确定要清空所有媒体文件吗？')) {
        this.clearMediaLibrary()
        this.refreshMediaLibraryDisplay()
      }
    })

    // 类型过滤
    const typeFilter = this.mediaLibraryDialog.querySelector('#type-filter') as HTMLSelectElement
    typeFilter?.addEventListener('change', () => this.refreshMediaLibraryDisplay())

    // 搜索输入
    const searchInput = this.mediaLibraryDialog.querySelector('#search-input') as HTMLInputElement
    searchInput?.addEventListener('input', () => this.refreshMediaLibraryDisplay())

    // 点击外部关闭
    this.mediaLibraryDialog.addEventListener('click', (e) => {
      if (e.target === this.mediaLibraryDialog) {
        this.hideMediaLibraryDialog()
      }
    })
  }

  /**
   * 刷新媒体库显示
   */
  private refreshMediaLibraryDisplay(): void {
    if (!this.mediaLibraryDialog) return

    const content = this.mediaLibraryDialog.querySelector('#library-content') as HTMLElement
    const totalCount = this.mediaLibraryDialog.querySelector('#total-count') as HTMLElement
    const totalSize = this.mediaLibraryDialog.querySelector('#total-size') as HTMLElement
    const typeFilter = this.mediaLibraryDialog.querySelector('#type-filter') as HTMLSelectElement
    const searchInput = this.mediaLibraryDialog.querySelector('#search-input') as HTMLInputElement

    // 获取统计信息
    const stats = this.getMediaStats()
    if (totalCount) totalCount.textContent = stats.total.toString()
    if (totalSize) totalSize.textContent = this.formatFileSize(stats.totalSize)

    // 过滤媒体
    let filteredMedia = Array.from(this.mediaLibrary.values())

    // 按类型过滤
    if (typeFilter?.value && typeFilter.value !== 'all') {
      filteredMedia = filteredMedia.filter(media => media.type === typeFilter.value)
    }

    // 按搜索关键词过滤
    if (searchInput?.value.trim()) {
      const keyword = searchInput.value.toLowerCase()
      filteredMedia = filteredMedia.filter(media => 
        media.name.toLowerCase().includes(keyword) ||
        (media.description && media.description.toLowerCase().includes(keyword))
      )
    }

    // 清空内容
    if (content) {
      if (filteredMedia.length === 0) {
        content.innerHTML = `
          <div class="library-empty">
            <p>没有找到匹配的媒体文件</p>
          </div>
        `
      } else {
        content.innerHTML = `
          <div class="library-grid">
            ${filteredMedia.map(media => this.createMediaLibraryItem(media)).join('')}
          </div>
        `
        
        // 绑定媒体项事件
        this.bindMediaItemEvents(content)
      }
    }
  }

  /**
   * 创建媒体库项
   */
  private createMediaLibraryItem(media: MediaFile): string {
    const typeIcon = {
      [MediaType.IMAGE]: '🖼️',
      [MediaType.VIDEO]: '🎥',
      [MediaType.AUDIO]: '🎧'
    }[media.type] || '📁'

    return `
      <div class="media-item" data-media-id="${media.id}">
        <div class="media-preview">
          ${media.type === MediaType.IMAGE 
            ? `<img src="${media.url}" alt="${media.name}" />` 
            : `<div class="media-icon">${typeIcon}</div>`
          }
        </div>
        <div class="media-info">
          <div class="media-name" title="${media.name}">${media.name}</div>
          <div class="media-size">${this.formatFileSize(media.size)}</div>
        </div>
        <div class="media-actions">
          <button class="btn btn-sm btn-primary media-insert" title="插入">插入</button>
          <button class="btn btn-sm btn-secondary media-delete" title="删除">🗑️</button>
        </div>
      </div>
    `
  }

  /**
   * 绑定媒体项事件
   */
  private bindMediaItemEvents(container: HTMLElement): void {
    // 插入按钮
    const insertButtons = container.querySelectorAll('.media-insert')
    insertButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const mediaItem = (e.target as HTMLElement).closest('.media-item')
        const mediaId = mediaItem?.getAttribute('data-media-id')
        if (mediaId) {
          const mediaFile = this.mediaLibrary.get(mediaId)
          if (mediaFile) {
            this.insertMediaElement(mediaFile)
            this.hideMediaLibraryDialog()
          }
        }
      })
    })

    // 删除按钮
    const deleteButtons = container.querySelectorAll('.media-delete')
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const mediaItem = (e.target as HTMLElement).closest('.media-item')
        const mediaId = mediaItem?.getAttribute('data-media-id')
        if (mediaId) {
          const mediaFile = this.mediaLibrary.get(mediaId)
          if (mediaFile && confirm(`删除 ${mediaFile.name}？`)) {
            this.deleteMediaFile(mediaId)
            this.refreshMediaLibraryDisplay()
          }
        }
      })
    })
  }

  /**
   * 移除媒体库对话框
   */
  private removeMediaLibraryDialog(): void {
    if (this.mediaLibraryDialog) {
      this.mediaLibraryDialog.remove()
      this.mediaLibraryDialog = null
    }
  }

  private saveMediaLibraryToStorage(): void {
    try {
      const mediaArray = Array.from(this.mediaLibrary.entries())
      localStorage.setItem('ldesign-media-library', JSON.stringify(mediaArray))
    } catch (error) {
      console.warn('保存媒体库失败:', error)
    }
  }

  /**
   * 创建图片元素
   */
  private createImageElement(mediaFile: MediaFile): HTMLElement {
    const img = document.createElement('img')
    img.src = mediaFile.url
    img.alt = mediaFile.description || mediaFile.name
    img.dataset.mediaId = mediaFile.id
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.borderRadius = '4px'
    img.style.cursor = 'pointer'
    img.className = 'ldesign-media-image'
    
    // 设置尺寸
    if (mediaFile.width && mediaFile.height) {
      const maxWidth = Math.min(mediaFile.width, 800)
      const ratio = maxWidth / mediaFile.width
      img.style.width = `${maxWidth}px`
      img.style.height = `${mediaFile.height * ratio}px`
    }
    
    return img
  }

  /**
   * 创建视频元素
   */
  private createVideoElement(mediaFile: MediaFile): HTMLElement {
    const video = document.createElement('video')
    video.src = mediaFile.url
    video.controls = true
    video.preload = 'metadata'
    video.dataset.mediaId = mediaFile.id
    video.style.maxWidth = '100%'
    video.style.height = 'auto'
    video.style.borderRadius = '4px'
    video.className = 'ldesign-media-video'
    
    // 设置尺寸
    if (mediaFile.width && mediaFile.height) {
      const maxWidth = Math.min(mediaFile.width, 800)
      const ratio = maxWidth / mediaFile.width
      video.style.width = `${maxWidth}px`
      video.style.height = `${mediaFile.height * ratio}px`
    }
    
    // 添加错误处理
    video.onerror = () => {
      console.error('视频加载失败:', mediaFile.url)
    }
    
    return video
  }

  /**
   * 创建音频元素
   */
  private createAudioElement(mediaFile: MediaFile): HTMLElement {
    const audio = document.createElement('audio')
    audio.src = mediaFile.url
    audio.controls = true
    audio.preload = 'metadata'
    audio.dataset.mediaId = mediaFile.id
    audio.style.width = '100%'
    audio.style.maxWidth = '400px'
    audio.className = 'ldesign-media-audio'
    
    // 添加错误处理
    audio.onerror = () => {
      console.error('音频加载失败:', mediaFile.url)
    }
    
    return audio
  }

  /**
   * 在光标位置插入元素
   */
  private insertElementAtCursor(element: HTMLElement): void {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      // 如果没有选区，插入到编辑器末尾
      this.editor.content.appendChild(element)
      return
    }
    
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(element)
    
    // 移动光标到元素后面
    range.setStartAfter(element)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 添加一个段落符
    const br = document.createElement('br')
    range.insertNode(br)
  }

  /**
   * 获取媒体类型显示名称
   */
  private getMediaTypeDisplayName(type: MediaType): string {
    const names = {
      [MediaType.IMAGE]: '图片',
      [MediaType.VIDEO]: '视频',
      [MediaType.AUDIO]: '音频'
    }
    return names[type] || '媒体'
  }

  /**
   * 加载媒体库
   */
  private loadMediaLibrary(): void {
    try {
      const stored = localStorage.getItem('ldesign-media-library')
      if (stored) {
        const mediaArray = JSON.parse(stored) as [string, MediaFile][]
        this.mediaLibrary = new Map(mediaArray.map(([id, media]) => [
          id,
          { ...media, uploadTime: new Date(media.uploadTime) }
        ]))
      }
    } catch (error) {
      console.warn('加载媒体库失败:', error)
      this.mediaLibrary.clear()
    }
  }

  /**
   * 清除媒体库
   */
  private clearMediaLibrary(): void {
    this.mediaLibrary.clear()
    try {
      localStorage.removeItem('ldesign-media-library')
    } catch (error) {
      console.warn('清除媒体库失败:', error)
    }
  }

  /**
   * 删除媒体文件
   */
  private deleteMediaFile(mediaId: string): void {
    if (this.mediaLibrary.has(mediaId)) {
      this.mediaLibrary.delete(mediaId)
      this.saveMediaLibraryToStorage()
      
      // 从编辑器中移除对应元素
      const elements = this.editor.content.querySelectorAll(`[data-media-id="${mediaId}"]`)
      elements.forEach(el => el.remove())
    }
  }

  /**
   * 处理文件拖拽
   */
  private handleFilesDrop(files: File[]): void {
    // 过滤合法文件
    const validFiles = files.filter(file => this.validateFile(file).valid)
    
    if (validFiles.length === 0) {
      alert('没有合法的媒体文件')
      return
    }
    
    // 上传所有合法文件
    validFiles.forEach(async file => {
      try {
        const mediaFile = await this.uploadMediaFile(file)
        if (mediaFile) {
          this.insertMediaElement(mediaFile)
        }
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error)
      }
    })
  }

  /**
   * 处理媒体元素点击
   */
  private handleMediaElementClick(element: HTMLElement): void {
    // 选中元素
    this.selectMediaElement(element)
    
    // 显示媒体编辑工具栏（简单实现）
    this.showMediaToolbar(element)
  }

  /**
   * 选中媒体元素
   */
  private selectMediaElement(element: HTMLElement): void {
    // 清除其他元素的选中状态
    const selected = this.editor.content.querySelectorAll('.ldesign-media-selected')
    selected.forEach(el => el.classList.remove('ldesign-media-selected'))
    
    // 添加选中状态
    element.classList.add('ldesign-media-selected')
  }

  /**
   * 显示媒体工具栏（简化版）
   */
  private showMediaToolbar(element: HTMLElement): void {
    // 简单的右键菜单实现
    const mediaId = element.dataset.mediaId
    if (!mediaId) return
    
    const mediaFile = this.mediaLibrary.get(mediaId)
    if (!mediaFile) return
    
    // 使用原生 confirm 对话框
    if (confirm(`删除这个${this.getMediaTypeDisplayName(mediaFile.type)}？`)) {
      this.deleteMediaFile(mediaId)
    }
  }

  /**
   * 默认上传处理器
   */
  private async defaultUploadHandler(file: File): Promise<MediaFile> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        const mediaFile: MediaFile = {
          id: this.generateMediaId(),
          name: file.name,
          type: this.detectMediaType(file),
          mimeType: file.type,
          size: file.size,
          url: fileReader.result as string,
          uploadTime: new Date()
        }

        // 如果是图片，获取尺寸信息
        if (mediaFile.type === MediaType.IMAGE) {
          this.getImageDimensions(mediaFile.url).then(dimensions => {
            mediaFile.width = dimensions.width
            mediaFile.height = dimensions.height
            resolve(mediaFile)
          }).catch(() => resolve(mediaFile))
        } else {
          resolve(mediaFile)
        }
      }
      
      fileReader.onerror = () => reject(new Error('文件读取失败'))
      fileReader.readAsDataURL(file)
    })
  }

  /**
   * 检测媒体类型
   */
  private detectMediaType(file: File): MediaType {
    if (file.type.startsWith('image/')) return MediaType.IMAGE
    if (file.type.startsWith('video/')) return MediaType.VIDEO
    if (file.type.startsWith('audio/')) return MediaType.AUDIO
    
    // 根据扩展名检测
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    
    if (this.config.allowedFormats.image.includes(extension)) return MediaType.IMAGE
    if (this.config.allowedFormats.video.includes(extension)) return MediaType.VIDEO
    if (this.config.allowedFormats.audio.includes(extension)) return MediaType.AUDIO
    
    return MediaType.IMAGE // 默认为图片
  }

  /**
   * 获取图片尺寸
   */
  private getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => reject(new Error('无法加载图片'))
      img.src = url
    })
  }

  /**
   * 生成媒体文件ID
   */
  private generateMediaId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 验证文件格式
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    const type = this.detectMediaType(file)
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    
    // 检查是否支持该类型
    if (!this.config.supportedTypes.includes(type)) {
      return { valid: false, error: `不支持的媒体类型: ${type}` }
    }
    
    // 检查文件格式
    const allowedFormats = this.config.allowedFormats[type]
    if (!allowedFormats.includes(extension)) {
      return { valid: false, error: `不支持的文件格式: .${extension}` }
    }
    
    // 检查文件大小
    const maxSizeBytes = this.config.maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `文件大小超过限制: ${this.config.maxFileSize}MB` }
    }
    
    return { valid: true }
  }

  /**
   * 获取媒体库统计
   */
  public getMediaStats(): {
    total: number
    images: number
    videos: number
    audios: number
    totalSize: number
  } {
    let images = 0, videos = 0, audios = 0, totalSize = 0
    
    for (const media of this.mediaLibrary.values()) {
      totalSize += media.size
      switch (media.type) {
        case MediaType.IMAGE: images++; break
        case MediaType.VIDEO: videos++; break
        case MediaType.AUDIO: audios++; break
      }
    }
    
    return {
      total: this.mediaLibrary.size,
      images,
      videos,
      audios,
      totalSize
    }
  }
}
