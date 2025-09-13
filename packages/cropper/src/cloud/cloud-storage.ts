/**
 * @file 云端存储集成系统
 * @description 支持多种云端服务和社交媒体分享
 */

/**
 * 云端服务类型
 */
export enum CloudServiceType {
  /** Google Drive */
  GOOGLE_DRIVE = 'google-drive',
  /** Dropbox */
  DROPBOX = 'dropbox',
  /** OneDrive */
  ONEDRIVE = 'onedrive',
  /** Amazon S3 */
  AMAZON_S3 = 'amazon-s3',
  /** 阿里云OSS */
  ALIYUN_OSS = 'aliyun-oss',
  /** 腾讯云COS */
  TENCENT_COS = 'tencent-cos',
  /** 七牛云 */
  QINIU = 'qiniu'
}

/**
 * 社交媒体类型
 */
export enum SocialMediaType {
  /** Facebook */
  FACEBOOK = 'facebook',
  /** Twitter/X */
  TWITTER = 'twitter',
  /** Instagram */
  INSTAGRAM = 'instagram',
  /** LinkedIn */
  LINKEDIN = 'linkedin',
  /** Pinterest */
  PINTEREST = 'pinterest',
  /** 微博 */
  WEIBO = 'weibo',
  /** 微信 */
  WECHAT = 'wechat'
}

/**
 * 上传状态
 */
export enum UploadStatus {
  /** 等待中 */
  PENDING = 'pending',
  /** 上传中 */
  UPLOADING = 'uploading',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 出错 */
  ERROR = 'error',
  /** 已取消 */
  CANCELLED = 'cancelled'
}

/**
 * 云端服务配置
 */
export interface CloudServiceConfig {
  /** 服务类型 */
  type: CloudServiceType
  /** 服务名称 */
  name: string
  /** API Key */
  apiKey?: string
  /** 访问令牌 */
  accessToken?: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 应用ID */
  appId?: string
  /** 应用密钥 */
  appSecret?: string
  /** 存储桶名称 */
  bucket?: string
  /** 区域 */
  region?: string
  /** 自定义端点 */
  endpoint?: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 社交媒体配置
 */
export interface SocialMediaConfig {
  /** 平台类型 */
  type: SocialMediaType
  /** 平台名称 */
  name: string
  /** 应用ID */
  appId?: string
  /** 访问令牌 */
  accessToken?: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 上传选项
 */
export interface UploadOptions {
  /** 文件名 */
  fileName?: string
  /** 文件夹路径 */
  folder?: string
  /** 是否公开 */
  isPublic?: boolean
  /** 元数据 */
  metadata?: Record<string, any>
  /** 压缩质量 */
  quality?: number
  /** 最大尺寸 */
  maxSize?: { width: number; height: number }
}

/**
 * 分享选项
 */
export interface ShareOptions {
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 标签 */
  tags?: string[]
  /** 是否私密 */
  isPrivate?: boolean
  /** 链接 */
  url?: string
}

/**
 * 上传任务
 */
export interface UploadTask {
  /** 任务ID */
  id: string
  /** 文件blob */
  blob: Blob
  /** 文件名 */
  fileName: string
  /** 目标服务 */
  service: CloudServiceType | SocialMediaType
  /** 上传选项 */
  options: UploadOptions | ShareOptions
  /** 状态 */
  status: UploadStatus
  /** 进度 */
  progress: number
  /** 错误信息 */
  error?: string
  /** 结果 */
  result?: {
    url: string
    id?: string
    shareUrl?: string
    metadata?: any
  }
  /** 创建时间 */
  createdAt: number
  /** 开始时间 */
  startedAt?: number
  /** 完成时间 */
  completedAt?: number
}

/**
 * 云端存储事件数据
 */
export interface CloudStorageEventData {
  /** 事件类型 */
  type: string
  /** 上传任务 */
  task?: UploadTask
  /** 任务列表 */
  tasks?: UploadTask[]
  /** 错误信息 */
  error?: any
}

/**
 * 抽象云端服务接口
 */
export abstract class CloudService {
  /** 服务配置 */
  protected config: CloudServiceConfig

  constructor(config: CloudServiceConfig) {
    this.config = config
  }

  /**
   * 认证
   */
  abstract authenticate(): Promise<boolean>

  /**
   * 上传文件
   */
  abstract upload(blob: Blob, options: UploadOptions): Promise<any>

  /**
   * 获取文件列表
   */
  abstract listFiles(folder?: string): Promise<any[]>

  /**
   * 删除文件
   */
  abstract deleteFile(fileId: string): Promise<boolean>

  /**
   * 获取下载链接
   */
  abstract getDownloadUrl(fileId: string): Promise<string>
}

/**
 * 抽象社交媒体接口
 */
export abstract class SocialMedia {
  /** 平台配置 */
  protected config: SocialMediaConfig

  constructor(config: SocialMediaConfig) {
    this.config = config
  }

  /**
   * 认证
   */
  abstract authenticate(): Promise<boolean>

  /**
   * 分享图片
   */
  abstract share(blob: Blob, options: ShareOptions): Promise<any>

  /**
   * 获取用户信息
   */
  abstract getUserInfo(): Promise<any>
}

/**
 * Google Drive 服务
 */
export class GoogleDriveService extends CloudService {
  private static readonly API_URL = 'https://www.googleapis.com/drive/v3'
  private static readonly UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

  async authenticate(): Promise<boolean> {
    try {
      // 使用 Google API 进行认证
      if (!this.config.accessToken) {
        // 触发OAuth流程
        await this.initiateOAuth()
      }
      
      // 验证访问令牌
      const response = await fetch(`${GoogleDriveService.API_URL}/about?fields=user`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Google Drive authentication failed:', error)
      return false
    }
  }

  async upload(blob: Blob, options: UploadOptions): Promise<any> {
    const metadata = {
      name: options.fileName || `cropped_image_${Date.now()}.png`,
      parents: options.folder ? [options.folder] : undefined,
      description: 'Uploaded by Image Cropper'
    }

    // 创建multipart请求
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)

    const response = await fetch(`${GoogleDriveService.UPLOAD_URL}?uploadType=multipart&fields=id,webViewLink,webContentLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      },
      body: form
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  async listFiles(folder?: string): Promise<any[]> {
    let query = "mimeType contains 'image/'"
    if (folder) {
      query += ` and '${folder}' in parents`
    }

    const response = await fetch(`${GoogleDriveService.API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,thumbnailLink,createdTime)`, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`List files failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.files || []
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const response = await fetch(`${GoogleDriveService.API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    })

    return response.ok
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    return `${GoogleDriveService.API_URL}/files/${fileId}?alt=media`
  }

  private async initiateOAuth(): Promise<void> {
    // 简化的OAuth实现，实际应该使用Google OAuth库
    const clientId = this.config.appId
    const redirectUri = window.location.origin + '/auth/google/callback'
    const scope = 'https://www.googleapis.com/auth/drive.file'
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline`

    // 打开认证窗口
    const authWindow = window.open(authUrl, 'google_auth', 'width=500,height=600')
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          reject(new Error('Authentication cancelled'))
        }
      }, 1000)

      // 监听认证完成消息
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          this.config.accessToken = event.data.accessToken
          resolve()
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }
}

/**
 * Dropbox 服务
 */
export class DropboxService extends CloudService {
  private static readonly API_URL = 'https://api.dropboxapi.com/2'
  private static readonly CONTENT_URL = 'https://content.dropboxapi.com/2'

  async authenticate(): Promise<boolean> {
    try {
      if (!this.config.accessToken) {
        await this.initiateOAuth()
      }

      const response = await fetch(`${DropboxService.API_URL}/users/get_current_account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Dropbox authentication failed:', error)
      return false
    }
  }

  async upload(blob: Blob, options: UploadOptions): Promise<any> {
    const path = `/${options.folder || ''}/${options.fileName || `cropped_image_${Date.now()}.png`}`

    const response = await fetch(`${DropboxService.CONTENT_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: blob
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  async listFiles(folder?: string): Promise<any[]> {
    const response = await fetch(`${DropboxService.API_URL}/files/list_folder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: folder ? `/${folder}` : '',
        recursive: false
      })
    })

    if (!response.ok) {
      throw new Error(`List files failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.entries?.filter((entry: any) => entry['.tag'] === 'file') || []
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const response = await fetch(`${DropboxService.API_URL}/files/delete_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: fileId
      })
    })

    return response.ok
  }

  async getDownloadUrl(fileId: string): Promise<string> {
    const response = await fetch(`${DropboxService.API_URL}/files/get_temporary_link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: fileId
      })
    })

    if (!response.ok) {
      throw new Error(`Get download URL failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.link
  }

  private async initiateOAuth(): Promise<void> {
    const clientId = this.config.appId
    const redirectUri = window.location.origin + '/auth/dropbox/callback'
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code`

    const authWindow = window.open(authUrl, 'dropbox_auth', 'width=500,height=600')
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          reject(new Error('Authentication cancelled'))
        }
      }, 1000)

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'DROPBOX_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          this.config.accessToken = event.data.accessToken
          resolve()
        } else if (event.data.type === 'DROPBOX_AUTH_ERROR') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }
}

/**
 * Facebook 社交媒体
 */
export class FacebookSocial extends SocialMedia {
  private static readonly API_URL = 'https://graph.facebook.com/v18.0'

  async authenticate(): Promise<boolean> {
    try {
      // 使用Facebook SDK进行认证
      return new Promise((resolve) => {
        if (typeof FB === 'undefined') {
          console.error('Facebook SDK not loaded')
          resolve(false)
          return
        }

        FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            this.config.accessToken = response.authResponse.accessToken
            resolve(true)
          } else {
            FB.login((response: any) => {
              if (response.authResponse) {
                this.config.accessToken = response.authResponse.accessToken
                resolve(true)
              } else {
                resolve(false)
              }
            }, { scope: 'publish_to_groups,pages_manage_posts' })
          }
        })
      })
    } catch (error) {
      console.error('Facebook authentication failed:', error)
      return false
    }
  }

  async share(blob: Blob, options: ShareOptions): Promise<any> {
    // 首先上传图片
    const formData = new FormData()
    formData.append('source', blob)
    formData.append('published', 'false') // 先不发布，只上传

    const uploadResponse = await fetch(`${FacebookSocial.API_URL}/me/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    const uploadData = await uploadResponse.json()

    // 然后发布帖子
    const postData = new FormData()
    postData.append('message', options.description || '')
    postData.append('attached_media[0]', JSON.stringify({
      media_fbid: uploadData.id
    }))

    const postResponse = await fetch(`${FacebookSocial.API_URL}/me/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      },
      body: postData
    })

    if (!postResponse.ok) {
      throw new Error(`Post failed: ${postResponse.statusText}`)
    }

    return postResponse.json()
  }

  async getUserInfo(): Promise<any> {
    const response = await fetch(`${FacebookSocial.API_URL}/me?fields=name,email,picture`, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Get user info failed: ${response.statusText}`)
    }

    return response.json()
  }
}

/**
 * Twitter/X 社交媒体
 */
export class TwitterSocial extends SocialMedia {
  private static readonly API_URL = 'https://api.twitter.com/2'
  private static readonly UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json'

  async authenticate(): Promise<boolean> {
    try {
      // Twitter OAuth 2.0 认证流程
      if (!this.config.accessToken) {
        await this.initiateOAuth()
      }

      const response = await fetch(`${TwitterSocial.API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Twitter authentication failed:', error)
      return false
    }
  }

  async share(blob: Blob, options: ShareOptions): Promise<any> {
    // 首先上传媒体
    const mediaFormData = new FormData()
    mediaFormData.append('media', blob)

    const uploadResponse = await fetch(TwitterSocial.UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      },
      body: mediaFormData
    })

    if (!uploadResponse.ok) {
      throw new Error(`Media upload failed: ${uploadResponse.statusText}`)
    }

    const uploadData = await uploadResponse.json()

    // 然后发布推文
    const tweetData = {
      text: options.description || '',
      media: {
        media_ids: [uploadData.media_id_string]
      }
    }

    const tweetResponse = await fetch(`${TwitterSocial.API_URL}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweetData)
    })

    if (!tweetResponse.ok) {
      throw new Error(`Tweet failed: ${tweetResponse.statusText}`)
    }

    return tweetResponse.json()
  }

  async getUserInfo(): Promise<any> {
    const response = await fetch(`${TwitterSocial.API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Get user info failed: ${response.statusText}`)
    }

    return response.json()
  }

  private async initiateOAuth(): Promise<void> {
    // Twitter OAuth 2.0 PKCE流程
    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${this.config.appId}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/twitter/callback')}&` +
      `scope=${encodeURIComponent('tweet.read tweet.write users.read')}&` +
      `state=state&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    const authWindow = window.open(authUrl, 'twitter_auth', 'width=500,height=600')
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          reject(new Error('Authentication cancelled'))
        }
      }, 1000)

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          // 这里需要用code换取access token
          this.exchangeCodeForToken(event.data.code, codeVerifier).then(resolve).catch(reject)
        } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }

  private generateCodeVerifier(): string {
    const array = new Uint32Array(28)
    crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<void> {
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.config.appId!,
        redirect_uri: window.location.origin + '/auth/twitter/callback',
        code_verifier: codeVerifier
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokenData = await tokenResponse.json()
    this.config.accessToken = tokenData.access_token
  }
}

/**
 * 云端存储管理器
 */
export class CloudStorageManager {
  /** 云端服务 */
  private cloudServices: Map<CloudServiceType, CloudService> = new Map()

  /** 社交媒体 */
  private socialMedia: Map<SocialMediaType, SocialMedia> = new Map()

  /** 上传任务 */
  private tasks: Map<string, UploadTask> = new Map()

  /** 事件监听器 */
  private eventListeners = new Map<string, Set<Function>>()

  /** 任务ID计数器 */
  private taskIdCounter = 0

  /**
   * 注册云端服务
   */
  registerCloudService(service: CloudService): void {
    this.cloudServices.set(service.config.type, service)
  }

  /**
   * 注册社交媒体
   */
  registerSocialMedia(social: SocialMedia): void {
    this.socialMedia.set(social.config.type, social)
  }

  /**
   * 上传到云端服务
   */
  async uploadToCloud(
    blob: Blob, 
    serviceType: CloudServiceType, 
    options: UploadOptions = {}
  ): Promise<string> {
    const service = this.cloudServices.get(serviceType)
    if (!service) {
      throw new Error(`Cloud service ${serviceType} not registered`)
    }

    const taskId = this.generateTaskId()
    const task: UploadTask = {
      id: taskId,
      blob,
      fileName: options.fileName || `image_${Date.now()}.png`,
      service: serviceType,
      options,
      status: UploadStatus.PENDING,
      progress: 0,
      createdAt: Date.now()
    }

    this.tasks.set(taskId, task)
    this.emit('taskAdded', { type: 'taskAdded', task })

    try {
      // 检查认证状态
      if (!(await service.authenticate())) {
        throw new Error('Authentication failed')
      }

      // 开始上传
      task.status = UploadStatus.UPLOADING
      task.startedAt = Date.now()
      this.emit('taskStarted', { type: 'taskStarted', task })

      // 执行上传
      const result = await service.upload(blob, options)
      
      task.status = UploadStatus.COMPLETED
      task.progress = 100
      task.completedAt = Date.now()
      task.result = result

      this.emit('taskCompleted', { type: 'taskCompleted', task })
      return taskId

    } catch (error) {
      task.status = UploadStatus.ERROR
      task.error = error instanceof Error ? error.message : 'Upload failed'
      this.emit('taskError', { type: 'taskError', task })
      throw error
    }
  }

  /**
   * 分享到社交媒体
   */
  async shareToSocial(
    blob: Blob, 
    socialType: SocialMediaType, 
    options: ShareOptions = {}
  ): Promise<string> {
    const social = this.socialMedia.get(socialType)
    if (!social) {
      throw new Error(`Social media ${socialType} not registered`)
    }

    const taskId = this.generateTaskId()
    const task: UploadTask = {
      id: taskId,
      blob,
      fileName: `shared_image_${Date.now()}.png`,
      service: socialType,
      options,
      status: UploadStatus.PENDING,
      progress: 0,
      createdAt: Date.now()
    }

    this.tasks.set(taskId, task)
    this.emit('taskAdded', { type: 'taskAdded', task })

    try {
      // 检查认证状态
      if (!(await social.authenticate())) {
        throw new Error('Authentication failed')
      }

      // 开始分享
      task.status = UploadStatus.UPLOADING
      task.startedAt = Date.now()
      this.emit('taskStarted', { type: 'taskStarted', task })

      // 执行分享
      const result = await social.share(blob, options)
      
      task.status = UploadStatus.COMPLETED
      task.progress = 100
      task.completedAt = Date.now()
      task.result = result

      this.emit('taskCompleted', { type: 'taskCompleted', task })
      return taskId

    } catch (error) {
      task.status = UploadStatus.ERROR
      task.error = error instanceof Error ? error.message : 'Share failed'
      this.emit('taskError', { type: 'taskError', task })
      throw error
    }
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): UploadTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  getTasks(): UploadTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || task.status === UploadStatus.COMPLETED) return false

    task.status = UploadStatus.CANCELLED
    this.emit('taskCancelled', { type: 'taskCancelled', task })
    return true
  }

  /**
   * 清空任务
   */
  clearTasks(): void {
    this.tasks.clear()
    this.emit('tasksCleared', { type: 'tasksCleared' })
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${++this.taskIdCounter}`
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: CloudStorageEventData): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in cloud storage event listener:', error)
        }
      })
    }
  }
}
