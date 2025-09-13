/**
 * @file 云端存储UI组件
 * @description 云端存储和社交媒体分享的用户界面
 */

import {
  CloudStorageManager,
  CloudServiceType,
  SocialMediaType,
  UploadStatus,
  type UploadTask,
  type CloudStorageEventData,
  type UploadOptions,
  type ShareOptions
} from './cloud-storage'

/**
 * 云端存储UI配置
 */
export interface CloudUIConfig {
  /** 主题 */
  theme: 'light' | 'dark'
  /** 显示模式 */
  mode: 'modal' | 'panel'
  /** 是否显示任务历史 */
  showHistory: boolean
  /** 最大历史记录数 */
  maxHistoryItems: number
  /** 支持的云端服务 */
  supportedCloudServices: CloudServiceType[]
  /** 支持的社交媒体 */
  supportedSocialMedia: SocialMediaType[]
}

/**
 * 服务信息
 */
interface ServiceInfo {
  type: string
  name: string
  icon: string
  description: string
  isConnected: boolean
  isEnabled: boolean
}

/**
 * 云端存储UI类
 */
export class CloudUI {
  /** 云端存储管理器 */
  private cloudManager: CloudStorageManager

  /** 容器元素 */
  private container: HTMLElement

  /** 配置选项 */
  private config: CloudUIConfig

  /** 当前要分享的图片数据 */
  private currentBlob: Blob | null = null

  /** UI元素引用 */
  private elements: {
    cloudServices?: HTMLElement
    socialMedia?: HTMLElement
    taskList?: HTMLElement
    uploadForm?: HTMLElement
    shareForm?: HTMLElement
  } = {}

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: CloudUIConfig = {
    theme: 'light',
    mode: 'modal',
    showHistory: true,
    maxHistoryItems: 50,
    supportedCloudServices: [
      CloudServiceType.GOOGLE_DRIVE,
      CloudServiceType.DROPBOX,
      CloudServiceType.ONEDRIVE
    ],
    supportedSocialMedia: [
      SocialMediaType.FACEBOOK,
      SocialMediaType.TWITTER,
      SocialMediaType.INSTAGRAM
    ]
  }

  /**
   * 构造函数
   */
  constructor(
    container: HTMLElement,
    cloudManager: CloudStorageManager,
    config: Partial<CloudUIConfig> = {}
  ) {
    this.container = container
    this.cloudManager = cloudManager
    this.config = { ...CloudUI.DEFAULT_CONFIG, ...config }

    this.init()
    this.bindEvents()
  }

  /**
   * 初始化UI
   */
  private init(): void {
    this.container.className = `cloud-ui cloud-ui--${this.config.theme} cloud-ui--${this.config.mode}`
    
    this.container.innerHTML = `
      <div class="cloud-ui__overlay ${this.config.mode === 'modal' ? 'cloud-ui__overlay--modal' : ''}">
        <div class="cloud-ui__container">
          <div class="cloud-ui__header">
            <h3 class="cloud-ui__title">保存和分享</h3>
            ${this.config.mode === 'modal' ? '<button class="cloud-ui__close-btn" aria-label="关闭">&times;</button>' : ''}
          </div>

          <div class="cloud-ui__content">
            <div class="cloud-ui__tabs">
              <button class="cloud-ui__tab cloud-ui__tab--active" data-tab="cloud">云端存储</button>
              <button class="cloud-ui__tab" data-tab="social">社交分享</button>
              ${this.config.showHistory ? '<button class="cloud-ui__tab" data-tab="history">历史记录</button>' : ''}
            </div>

            <div class="cloud-ui__tab-content">
              <!-- 云端存储页面 -->
              <div class="cloud-ui__tab-panel cloud-ui__tab-panel--active" data-panel="cloud">
                <div class="cloud-ui__services" data-type="cloud">
                  ${this.createCloudServicesHTML()}
                </div>
                <div class="cloud-ui__upload-form">
                  <div class="cloud-ui__form-group">
                    <label for="cloud-filename">文件名</label>
                    <input type="text" id="cloud-filename" class="cloud-ui__input" placeholder="输入文件名（可选）">
                  </div>
                  <div class="cloud-ui__form-group">
                    <label for="cloud-folder">文件夹</label>
                    <input type="text" id="cloud-folder" class="cloud-ui__input" placeholder="输入文件夹路径（可选）">
                  </div>
                  <div class="cloud-ui__form-group">
                    <label>
                      <input type="checkbox" id="cloud-public" class="cloud-ui__checkbox">
                      公开访问
                    </label>
                  </div>
                </div>
              </div>

              <!-- 社交分享页面 -->
              <div class="cloud-ui__tab-panel" data-panel="social">
                <div class="cloud-ui__services" data-type="social">
                  ${this.createSocialMediaHTML()}
                </div>
                <div class="cloud-ui__share-form">
                  <div class="cloud-ui__form-group">
                    <label for="share-title">标题</label>
                    <input type="text" id="share-title" class="cloud-ui__input" placeholder="输入标题（可选）">
                  </div>
                  <div class="cloud-ui__form-group">
                    <label for="share-description">描述</label>
                    <textarea id="share-description" class="cloud-ui__textarea" placeholder="输入描述或说明文字" rows="3"></textarea>
                  </div>
                  <div class="cloud-ui__form-group">
                    <label for="share-tags">标签</label>
                    <input type="text" id="share-tags" class="cloud-ui__input" placeholder="输入标签，用逗号分隔">
                  </div>
                  <div class="cloud-ui__form-group">
                    <label>
                      <input type="checkbox" id="share-private" class="cloud-ui__checkbox">
                      私密分享
                    </label>
                  </div>
                </div>
              </div>

              ${this.config.showHistory ? `
              <!-- 历史记录页面 -->
              <div class="cloud-ui__tab-panel" data-panel="history">
                <div class="cloud-ui__task-list">
                  <div class="cloud-ui__task-list-empty">暂无上传记录</div>
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="cloud-ui__footer">
            <div class="cloud-ui__selected-service">
              <span class="cloud-ui__selected-text">请选择服务</span>
            </div>
            <div class="cloud-ui__actions">
              <button class="cloud-ui__btn cloud-ui__btn--cancel">取消</button>
              <button class="cloud-ui__btn cloud-ui__btn--primary" disabled>开始上传</button>
            </div>
          </div>
        </div>
      </div>
    `

    // 获取元素引用
    this.elements = {
      cloudServices: this.container.querySelector('.cloud-ui__services[data-type="cloud"]')!,
      socialMedia: this.container.querySelector('.cloud-ui__services[data-type="social"]')!,
      taskList: this.container.querySelector('.cloud-ui__task-list'),
      uploadForm: this.container.querySelector('.cloud-ui__upload-form')!,
      shareForm: this.container.querySelector('.cloud-ui__share-form')!
    }

    this.createStyles()
  }

  /**
   * 创建云端服务HTML
   */
  private createCloudServicesHTML(): string {
    const services: ServiceInfo[] = [
      {
        type: CloudServiceType.GOOGLE_DRIVE,
        name: 'Google Drive',
        icon: '🔍',
        description: '存储到Google云端硬盘',
        isConnected: false,
        isEnabled: this.config.supportedCloudServices.includes(CloudServiceType.GOOGLE_DRIVE)
      },
      {
        type: CloudServiceType.DROPBOX,
        name: 'Dropbox',
        icon: '📦',
        description: '存储到Dropbox',
        isConnected: false,
        isEnabled: this.config.supportedCloudServices.includes(CloudServiceType.DROPBOX)
      },
      {
        type: CloudServiceType.ONEDRIVE,
        name: 'OneDrive',
        icon: '☁️',
        description: '存储到Microsoft OneDrive',
        isConnected: false,
        isEnabled: this.config.supportedCloudServices.includes(CloudServiceType.ONEDRIVE)
      },
      {
        type: CloudServiceType.AMAZON_S3,
        name: 'Amazon S3',
        icon: '🪣',
        description: '存储到Amazon S3',
        isConnected: false,
        isEnabled: this.config.supportedCloudServices.includes(CloudServiceType.AMAZON_S3)
      }
    ]

    return services
      .filter(service => service.isEnabled)
      .map(service => `
        <div class="cloud-ui__service ${!service.isConnected ? 'cloud-ui__service--disconnected' : ''}" 
             data-service="${service.type}">
          <div class="cloud-ui__service-icon">${service.icon}</div>
          <div class="cloud-ui__service-info">
            <div class="cloud-ui__service-name">${service.name}</div>
            <div class="cloud-ui__service-description">${service.description}</div>
          </div>
          <div class="cloud-ui__service-status">
            ${service.isConnected 
              ? '<span class="cloud-ui__status-connected">已连接</span>'
              : '<span class="cloud-ui__status-disconnected">未连接</span>'
            }
          </div>
        </div>
      `).join('')
  }

  /**
   * 创建社交媒体HTML
   */
  private createSocialMediaHTML(): string {
    const socialMedia: ServiceInfo[] = [
      {
        type: SocialMediaType.FACEBOOK,
        name: 'Facebook',
        icon: '📘',
        description: '分享到Facebook',
        isConnected: false,
        isEnabled: this.config.supportedSocialMedia.includes(SocialMediaType.FACEBOOK)
      },
      {
        type: SocialMediaType.TWITTER,
        name: 'Twitter/X',
        icon: '🐦',
        description: '分享到Twitter/X',
        isConnected: false,
        isEnabled: this.config.supportedSocialMedia.includes(SocialMediaType.TWITTER)
      },
      {
        type: SocialMediaType.INSTAGRAM,
        name: 'Instagram',
        icon: '📷',
        description: '分享到Instagram',
        isConnected: false,
        isEnabled: this.config.supportedSocialMedia.includes(SocialMediaType.INSTAGRAM)
      },
      {
        type: SocialMediaType.LINKEDIN,
        name: 'LinkedIn',
        icon: '💼',
        description: '分享到LinkedIn',
        isConnected: false,
        isEnabled: this.config.supportedSocialMedia.includes(SocialMediaType.LINKEDIN)
      },
      {
        type: SocialMediaType.PINTEREST,
        name: 'Pinterest',
        icon: '📌',
        description: '分享到Pinterest',
        isConnected: false,
        isEnabled: this.config.supportedSocialMedia.includes(SocialMediaType.PINTEREST)
      }
    ]

    return socialMedia
      .filter(service => service.isEnabled)
      .map(service => `
        <div class="cloud-ui__service ${!service.isConnected ? 'cloud-ui__service--disconnected' : ''}" 
             data-service="${service.type}">
          <div class="cloud-ui__service-icon">${service.icon}</div>
          <div class="cloud-ui__service-info">
            <div class="cloud-ui__service-name">${service.name}</div>
            <div class="cloud-ui__service-description">${service.description}</div>
          </div>
          <div class="cloud-ui__service-status">
            ${service.isConnected 
              ? '<span class="cloud-ui__status-connected">已连接</span>'
              : '<span class="cloud-ui__status-disconnected">未连接</span>'
            }
          </div>
        </div>
      `).join('')
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    this.bindUIEvents()
    this.bindCloudEvents()
  }

  /**
   * 绑定UI事件
   */
  private bindUIEvents(): void {
    // 关闭按钮
    const closeBtn = this.container.querySelector('.cloud-ui__close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide())
    }

    // 标签切换
    const tabs = this.container.querySelectorAll('.cloud-ui__tab')
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const tabName = target.dataset.tab
        if (tabName) {
          this.switchTab(tabName)
        }
      })
    })

    // 服务选择
    const services = this.container.querySelectorAll('.cloud-ui__service')
    services.forEach(service => {
      service.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const serviceType = target.dataset.service
        if (serviceType) {
          this.selectService(serviceType)
        }
      })
    })

    // 取消按钮
    const cancelBtn = this.container.querySelector('.cloud-ui__btn--cancel')!
    cancelBtn.addEventListener('click', () => this.hide())

    // 主要操作按钮
    const primaryBtn = this.container.querySelector('.cloud-ui__btn--primary')!
    primaryBtn.addEventListener('click', () => this.performAction())

    // 点击遮罩层关闭（仅在modal模式下）
    if (this.config.mode === 'modal') {
      const overlay = this.container.querySelector('.cloud-ui__overlay')!
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide()
        }
      })
    }
  }

  /**
   * 绑定云端存储事件
   */
  private bindCloudEvents(): void {
    this.cloudManager.on('taskAdded', (data: CloudStorageEventData) => {
      if (data.task) {
        this.addTaskToHistory(data.task)
      }
    })

    this.cloudManager.on('taskStarted', (data: CloudStorageEventData) => {
      if (data.task) {
        this.updateTaskStatus(data.task)
      }
    })

    this.cloudManager.on('taskCompleted', (data: CloudStorageEventData) => {
      if (data.task) {
        this.updateTaskStatus(data.task)
        this.showSuccess(`成功${this.isCloudService(data.task.service) ? '上传到' : '分享到'} ${this.getServiceName(data.task.service)}`)
      }
    })

    this.cloudManager.on('taskError', (data: CloudStorageEventData) => {
      if (data.task) {
        this.updateTaskStatus(data.task)
        this.showError(`${this.isCloudService(data.task.service) ? '上传' : '分享'}失败: ${data.task.error}`)
      }
    })
  }

  /**
   * 显示界面
   */
  show(blob: Blob): void {
    this.currentBlob = blob
    this.container.style.display = 'block'
    
    // 触发动画
    setTimeout(() => {
      this.container.classList.add('cloud-ui--visible')
    }, 10)
  }

  /**
   * 隐藏界面
   */
  hide(): void {
    this.container.classList.remove('cloud-ui--visible')
    
    setTimeout(() => {
      this.container.style.display = 'none'
      this.currentBlob = null
      this.resetForm()
    }, 300)
  }

  /**
   * 切换标签
   */
  private switchTab(tabName: string): void {
    // 更新标签状态
    const tabs = this.container.querySelectorAll('.cloud-ui__tab')
    tabs.forEach(tab => {
      tab.classList.toggle('cloud-ui__tab--active', tab.getAttribute('data-tab') === tabName)
    })

    // 更新面板显示
    const panels = this.container.querySelectorAll('.cloud-ui__tab-panel')
    panels.forEach(panel => {
      panel.classList.toggle('cloud-ui__tab-panel--active', panel.getAttribute('data-panel') === tabName)
    })

    // 重置选择状态
    this.clearServiceSelection()
  }

  /**
   * 选择服务
   */
  private selectService(serviceType: string): void {
    // 清除所有选择
    this.clearServiceSelection()

    // 选中当前服务
    const serviceElement = this.container.querySelector(`[data-service="${serviceType}"]`)!
    serviceElement.classList.add('cloud-ui__service--selected')

    // 更新底部信息
    const selectedText = this.container.querySelector('.cloud-ui__selected-text')!
    selectedText.textContent = this.getServiceName(serviceType)

    // 启用操作按钮
    const primaryBtn = this.container.querySelector('.cloud-ui__btn--primary')! as HTMLButtonElement
    primaryBtn.disabled = false
    primaryBtn.textContent = this.isCloudService(serviceType) ? '开始上传' : '开始分享'
  }

  /**
   * 清除服务选择
   */
  private clearServiceSelection(): void {
    const services = this.container.querySelectorAll('.cloud-ui__service')
    services.forEach(service => {
      service.classList.remove('cloud-ui__service--selected')
    })

    const selectedText = this.container.querySelector('.cloud-ui__selected-text')!
    selectedText.textContent = '请选择服务'

    const primaryBtn = this.container.querySelector('.cloud-ui__btn--primary')! as HTMLButtonElement
    primaryBtn.disabled = true
    primaryBtn.textContent = '开始上传'
  }

  /**
   * 执行操作
   */
  private async performAction(): Promise<void> {
    if (!this.currentBlob) return

    const selectedService = this.container.querySelector('.cloud-ui__service--selected')
    if (!selectedService) return

    const serviceType = selectedService.getAttribute('data-service')!
    const primaryBtn = this.container.querySelector('.cloud-ui__btn--primary')! as HTMLButtonElement
    
    try {
      primaryBtn.disabled = true
      primaryBtn.textContent = this.isCloudService(serviceType) ? '上传中...' : '分享中...'

      if (this.isCloudService(serviceType)) {
        await this.uploadToCloud(serviceType as CloudServiceType)
      } else {
        await this.shareToSocial(serviceType as SocialMediaType)
      }

    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      primaryBtn.disabled = false
      primaryBtn.textContent = this.isCloudService(serviceType) ? '开始上传' : '开始分享'
    }
  }

  /**
   * 上传到云端
   */
  private async uploadToCloud(serviceType: CloudServiceType): Promise<void> {
    const options: UploadOptions = {
      fileName: (this.container.querySelector('#cloud-filename') as HTMLInputElement).value || undefined,
      folder: (this.container.querySelector('#cloud-folder') as HTMLInputElement).value || undefined,
      isPublic: (this.container.querySelector('#cloud-public') as HTMLInputElement).checked
    }

    await this.cloudManager.uploadToCloud(this.currentBlob!, serviceType, options)
  }

  /**
   * 分享到社交媒体
   */
  private async shareToSocial(socialType: SocialMediaType): Promise<void> {
    const tags = (this.container.querySelector('#share-tags') as HTMLInputElement).value
    const options: ShareOptions = {
      title: (this.container.querySelector('#share-title') as HTMLInputElement).value || undefined,
      description: (this.container.querySelector('#share-description') as HTMLTextAreaElement).value || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      isPrivate: (this.container.querySelector('#share-private') as HTMLInputElement).checked
    }

    await this.cloudManager.shareToSocial(this.currentBlob!, socialType, options)
  }

  /**
   * 添加任务到历史
   */
  private addTaskToHistory(task: UploadTask): void {
    if (!this.config.showHistory || !this.elements.taskList) return

    // 移除空状态
    const emptyState = this.elements.taskList.querySelector('.cloud-ui__task-list-empty')
    if (emptyState) {
      emptyState.remove()
    }

    const taskElement = document.createElement('div')
    taskElement.className = 'cloud-ui__task-item'
    taskElement.dataset.taskId = task.id
    
    taskElement.innerHTML = `
      <div class="cloud-ui__task-icon">${this.getServiceIcon(task.service)}</div>
      <div class="cloud-ui__task-info">
        <div class="cloud-ui__task-name">${task.fileName}</div>
        <div class="cloud-ui__task-service">${this.getServiceName(task.service)}</div>
      </div>
      <div class="cloud-ui__task-status">
        <div class="cloud-ui__task-status-text">${this.getStatusText(task.status)}</div>
        <div class="cloud-ui__task-time">${this.formatTime(task.createdAt)}</div>
      </div>
      <div class="cloud-ui__task-actions">
        ${task.status === UploadStatus.COMPLETED && task.result?.url ? 
          `<button class="cloud-ui__task-btn" title="查看" data-action="view" data-url="${task.result.url}">👁️</button>` : ''
        }
        <button class="cloud-ui__task-btn" title="删除" data-action="remove">🗑️</button>
      </div>
    `

    // 绑定任务操作事件
    const actionBtns = taskElement.querySelectorAll('.cloud-ui__task-btn')
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const action = target.getAttribute('data-action')
        const url = target.getAttribute('data-url')
        
        if (action === 'view' && url) {
          window.open(url, '_blank')
        } else if (action === 'remove') {
          this.removeTaskFromHistory(task.id)
        }
      })
    })

    this.elements.taskList.insertBefore(taskElement, this.elements.taskList.firstChild)

    // 限制历史记录数量
    const taskItems = this.elements.taskList.querySelectorAll('.cloud-ui__task-item')
    if (taskItems.length > this.config.maxHistoryItems) {
      taskItems[taskItems.length - 1].remove()
    }
  }

  /**
   * 更新任务状态
   */
  private updateTaskStatus(task: UploadTask): void {
    if (!this.elements.taskList) return

    const taskElement = this.elements.taskList.querySelector(`[data-task-id="${task.id}"]`)
    if (!taskElement) return

    const statusText = taskElement.querySelector('.cloud-ui__task-status-text')!
    statusText.textContent = this.getStatusText(task.status)

    // 更新任务样式
    taskElement.className = `cloud-ui__task-item cloud-ui__task-item--${task.status}`

    // 如果完成了，添加查看按钮
    if (task.status === UploadStatus.COMPLETED && task.result?.url) {
      const actionsContainer = taskElement.querySelector('.cloud-ui__task-actions')!
      const viewBtn = document.createElement('button')
      viewBtn.className = 'cloud-ui__task-btn'
      viewBtn.title = '查看'
      viewBtn.innerHTML = '👁️'
      viewBtn.onclick = () => window.open(task.result!.url, '_blank')
      
      actionsContainer.insertBefore(viewBtn, actionsContainer.firstChild)
    }
  }

  /**
   * 从历史中移除任务
   */
  private removeTaskFromHistory(taskId: string): void {
    if (!this.elements.taskList) return

    const taskElement = this.elements.taskList.querySelector(`[data-task-id="${taskId}"]`)
    if (taskElement) {
      taskElement.remove()
    }

    // 如果没有任务了，显示空状态
    const remainingTasks = this.elements.taskList.querySelectorAll('.cloud-ui__task-item')
    if (remainingTasks.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'cloud-ui__task-list-empty'
      emptyState.textContent = '暂无上传记录'
      this.elements.taskList.appendChild(emptyState)
    }
  }

  /**
   * 重置表单
   */
  private resetForm(): void {
    const inputs = this.container.querySelectorAll('input, textarea')
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        (input as HTMLInputElement).checked = false
      } else {
        (input as HTMLInputElement | HTMLTextAreaElement).value = ''
      }
    })

    this.clearServiceSelection()
  }

  /**
   * 显示成功消息
   */
  private showSuccess(message: string): void {
    this.showNotification(message, 'success')
  }

  /**
   * 显示错误消息
   */
  private showError(message: string): void {
    this.showNotification(message, 'error')
  }

  /**
   * 显示通知
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div')
    notification.className = `cloud-ui__notification cloud-ui__notification--${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    // 显示动画
    setTimeout(() => {
      notification.classList.add('cloud-ui__notification--visible')
    }, 10)

    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('cloud-ui__notification--visible')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  /**
   * 判断是否为云端服务
   */
  private isCloudService(serviceType: string): boolean {
    return Object.values(CloudServiceType).includes(serviceType as CloudServiceType)
  }

  /**
   * 获取服务名称
   */
  private getServiceName(serviceType: string): string {
    const serviceNames: Record<string, string> = {
      [CloudServiceType.GOOGLE_DRIVE]: 'Google Drive',
      [CloudServiceType.DROPBOX]: 'Dropbox',
      [CloudServiceType.ONEDRIVE]: 'OneDrive',
      [CloudServiceType.AMAZON_S3]: 'Amazon S3',
      [SocialMediaType.FACEBOOK]: 'Facebook',
      [SocialMediaType.TWITTER]: 'Twitter/X',
      [SocialMediaType.INSTAGRAM]: 'Instagram',
      [SocialMediaType.LINKEDIN]: 'LinkedIn',
      [SocialMediaType.PINTEREST]: 'Pinterest'
    }

    return serviceNames[serviceType] || serviceType
  }

  /**
   * 获取服务图标
   */
  private getServiceIcon(serviceType: string): string {
    const serviceIcons: Record<string, string> = {
      [CloudServiceType.GOOGLE_DRIVE]: '🔍',
      [CloudServiceType.DROPBOX]: '📦',
      [CloudServiceType.ONEDRIVE]: '☁️',
      [CloudServiceType.AMAZON_S3]: '🪣',
      [SocialMediaType.FACEBOOK]: '📘',
      [SocialMediaType.TWITTER]: '🐦',
      [SocialMediaType.INSTAGRAM]: '📷',
      [SocialMediaType.LINKEDIN]: '💼',
      [SocialMediaType.PINTEREST]: '📌'
    }

    return serviceIcons[serviceType] || '📁'
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: UploadStatus): string {
    const statusTexts: Record<UploadStatus, string> = {
      [UploadStatus.PENDING]: '等待中',
      [UploadStatus.UPLOADING]: '上传中',
      [UploadStatus.COMPLETED]: '已完成',
      [UploadStatus.ERROR]: '失败',
      [UploadStatus.CANCELLED]: '已取消'
    }

    return statusTexts[status]
  }

  /**
   * 格式化时间
   */
  private formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * 创建样式
   */
  private createStyles(): void {
    const styleId = 'cloud-ui-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .cloud-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        display: none;
        z-index: 1000;
      }

      .cloud-ui--visible .cloud-ui__container {
        transform: translateY(0);
        opacity: 1;
      }

      .cloud-ui__overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cloud-ui__overlay--modal {
        z-index: 1001;
      }

      .cloud-ui__container {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        transform: translateY(-20px);
        opacity: 0;
        transition: all 0.3s ease;
      }

      .cloud-ui--dark .cloud-ui__container {
        background: #2d3748;
        color: #e2e8f0;
      }

      .cloud-ui__header {
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cloud-ui--dark .cloud-ui__header {
        border-bottom-color: #4a5568;
      }

      .cloud-ui__title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .cloud-ui__close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
      }

      .cloud-ui__close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .cloud-ui--dark .cloud-ui__close-btn:hover {
        background: #4a5568;
        color: #e2e8f0;
      }

      .cloud-ui__content {
        height: 500px;
        display: flex;
        flex-direction: column;
      }

      .cloud-ui__tabs {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
      }

      .cloud-ui--dark .cloud-ui__tabs {
        border-bottom-color: #4a5568;
      }

      .cloud-ui__tab {
        flex: 1;
        padding: 16px 20px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        border-bottom: 3px solid transparent;
        transition: all 0.2s ease;
      }

      .cloud-ui__tab:hover {
        color: #374151;
        background: #f9fafb;
      }

      .cloud-ui__tab--active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }

      .cloud-ui--dark .cloud-ui__tab {
        color: #9ca3af;
      }

      .cloud-ui--dark .cloud-ui__tab:hover {
        color: #e2e8f0;
        background: #374151;
      }

      .cloud-ui__tab-content {
        flex: 1;
        overflow: hidden;
      }

      .cloud-ui__tab-panel {
        height: 100%;
        display: none;
        padding: 20px;
        overflow-y: auto;
      }

      .cloud-ui__tab-panel--active {
        display: block;
      }

      .cloud-ui__services {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .cloud-ui__service {
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .cloud-ui__service:hover {
        border-color: #cbd5e0;
        background: #f9fafb;
      }

      .cloud-ui__service--selected {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .cloud-ui__service--disconnected {
        opacity: 0.6;
      }

      .cloud-ui--dark .cloud-ui__service {
        border-color: #4a5568;
        background: #1a202c;
      }

      .cloud-ui--dark .cloud-ui__service:hover {
        border-color: #718096;
        background: #2d3748;
      }

      .cloud-ui--dark .cloud-ui__service--selected {
        border-color: #63b3ed;
        background: #2c5282;
      }

      .cloud-ui__service-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .cloud-ui__service-info {
        flex: 1;
        min-width: 0;
      }

      .cloud-ui__service-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .cloud-ui__service-description {
        font-size: 12px;
        color: #6b7280;
      }

      .cloud-ui--dark .cloud-ui__service-description {
        color: #9ca3af;
      }

      .cloud-ui__service-status {
        flex-shrink: 0;
      }

      .cloud-ui__status-connected {
        color: #10b981;
        font-size: 12px;
        font-weight: 500;
      }

      .cloud-ui__status-disconnected {
        color: #ef4444;
        font-size: 12px;
        font-weight: 500;
      }

      .cloud-ui__upload-form,
      .cloud-ui__share-form {
        display: grid;
        gap: 16px;
      }

      .cloud-ui__form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .cloud-ui__form-group label {
        font-weight: 500;
        font-size: 13px;
        color: #374151;
      }

      .cloud-ui--dark .cloud-ui__form-group label {
        color: #e2e8f0;
      }

      .cloud-ui__input,
      .cloud-ui__textarea {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .cloud-ui__input:focus,
      .cloud-ui__textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .cloud-ui--dark .cloud-ui__input,
      .cloud-ui--dark .cloud-ui__textarea {
        background: #4a5568;
        border-color: #718096;
        color: #e2e8f0;
      }

      .cloud-ui__checkbox {
        margin-right: 8px;
      }

      .cloud-ui__task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 400px;
        overflow-y: auto;
      }

      .cloud-ui__task-list-empty {
        text-align: center;
        color: #6b7280;
        padding: 40px 20px;
        font-style: italic;
      }

      .cloud-ui__task-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f9fafb;
      }

      .cloud-ui__task-item--uploading {
        border-color: #fbbf24;
        background: #fef3c7;
      }

      .cloud-ui__task-item--completed {
        border-color: #10b981;
        background: #d1fae5;
      }

      .cloud-ui__task-item--error {
        border-color: #ef4444;
        background: #fee2e2;
      }

      .cloud-ui--dark .cloud-ui__task-item {
        border-color: #4a5568;
        background: #2d3748;
      }

      .cloud-ui__task-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .cloud-ui__task-info {
        flex: 1;
        min-width: 0;
      }

      .cloud-ui__task-name {
        font-weight: 500;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cloud-ui__task-service {
        font-size: 12px;
        color: #6b7280;
      }

      .cloud-ui--dark .cloud-ui__task-service {
        color: #9ca3af;
      }

      .cloud-ui__task-status {
        text-align: right;
        margin-right: 12px;
      }

      .cloud-ui__task-status-text {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .cloud-ui__task-time {
        font-size: 11px;
        color: #6b7280;
      }

      .cloud-ui__task-actions {
        display: flex;
        gap: 4px;
      }

      .cloud-ui__task-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
      }

      .cloud-ui__task-btn:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .cloud-ui__footer {
        padding: 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cloud-ui--dark .cloud-ui__footer {
        border-top-color: #4a5568;
      }

      .cloud-ui__selected-service {
        color: #6b7280;
        font-size: 14px;
      }

      .cloud-ui--dark .cloud-ui__selected-service {
        color: #9ca3af;
      }

      .cloud-ui__actions {
        display: flex;
        gap: 12px;
      }

      .cloud-ui__btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .cloud-ui__btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .cloud-ui__btn--cancel {
        background: #f3f4f6;
        color: #374151;
      }

      .cloud-ui__btn--cancel:hover:not(:disabled) {
        background: #e5e7eb;
      }

      .cloud-ui__btn--primary {
        background: #3b82f6;
        color: white;
      }

      .cloud-ui__btn--primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .cloud-ui--dark .cloud-ui__btn--cancel {
        background: #4a5568;
        color: #e2e8f0;
      }

      .cloud-ui--dark .cloud-ui__btn--cancel:hover:not(:disabled) {
        background: #718096;
      }

      .cloud-ui__notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1002;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
      }

      .cloud-ui__notification--visible {
        transform: translateX(0);
        opacity: 1;
      }

      .cloud-ui__notification--success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .cloud-ui__notification--error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * 销毁UI
   */
  destroy(): void {
    this.hide()
    this.container.innerHTML = ''
  }
}
