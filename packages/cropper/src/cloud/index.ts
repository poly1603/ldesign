/**
 * @file 云端存储系统导出
 * @description 导出所有云端存储相关的类、接口和工厂函数
 */

// 核心云端存储
export {
  CloudStorageManager,
  CloudService,
  SocialMedia,
  GoogleDriveService,
  DropboxService,
  FacebookSocial,
  TwitterSocial,
  CloudServiceType,
  SocialMediaType,
  UploadStatus
} from './cloud-storage'

export type {
  CloudServiceConfig,
  SocialMediaConfig,
  UploadOptions,
  ShareOptions,
  UploadTask,
  CloudStorageEventData
} from './cloud-storage'

// 云端存储UI
export { CloudUI } from './cloud-ui'
export type { CloudUIConfig } from './cloud-ui'

/**
 * 云端管理器
 */
export class CloudManager {
  /** 云端存储管理器 */
  private storageManager: CloudStorageManager

  /** 云端存储UI */
  private cloudUI?: CloudUI

  /**
   * 构造函数
   */
  constructor(
    container?: HTMLElement,
    storageConfig?: any,
    uiConfig?: any
  ) {
    this.storageManager = new CloudStorageManager()

    if (container) {
      this.cloudUI = new CloudUI(container, this.storageManager, uiConfig)
    }
  }

  /**
   * 获取存储管理器
   */
  getStorageManager(): CloudStorageManager {
    return this.storageManager
  }

  /**
   * 获取UI
   */
  getUI(): CloudUI | undefined {
    return this.cloudUI
  }

  /**
   * 注册云端服务
   */
  registerCloudService(service: CloudService): void {
    this.storageManager.registerCloudService(service)
  }

  /**
   * 注册社交媒体
   */
  registerSocialMedia(social: SocialMedia): void {
    this.storageManager.registerSocialMedia(social)
  }

  /**
   * 显示云端存储界面
   */
  show(blob: Blob): void {
    this.cloudUI?.show(blob)
  }

  /**
   * 隐藏界面
   */
  hide(): void {
    this.cloudUI?.hide()
  }

  /**
   * 上传到云端
   */
  async uploadToCloud(
    blob: Blob,
    serviceType: CloudServiceType,
    options?: any
  ): Promise<string> {
    return this.storageManager.uploadToCloud(blob, serviceType, options)
  }

  /**
   * 分享到社交媒体
   */
  async shareToSocial(
    blob: Blob,
    socialType: SocialMediaType,
    options?: any
  ): Promise<string> {
    return this.storageManager.shareToSocial(blob, socialType, options)
  }

  /**
   * 获取任务
   */
  getTasks(): UploadTask[] {
    return this.storageManager.getTasks()
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    this.storageManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    this.storageManager.off(event, listener)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.cloudUI?.destroy()
  }
}

/**
 * 创建云端管理器的工厂函数
 */
export function createCloudManager(
  container?: HTMLElement,
  options: {
    storage?: any
    ui?: any
  } = {}
): CloudManager {
  return new CloudManager(container, options.storage, options.ui)
}

/**
 * 使用示例：
 * 
 * ```typescript
 * import { 
 *   createCloudManager, 
 *   GoogleDriveService, 
 *   FacebookSocial,
 *   CloudServiceType,
 *   SocialMediaType 
 * } from '@/cloud'
 * 
 * const container = document.getElementById('cloud-container')
 * 
 * const cloudManager = createCloudManager(container, {
 *   ui: {
 *     theme: 'dark',
 *     mode: 'modal',
 *     showHistory: true
 *   }
 * })
 * 
 * // 注册服务
 * const googleDrive = new GoogleDriveService({
 *   type: CloudServiceType.GOOGLE_DRIVE,
 *   name: 'Google Drive',
 *   appId: 'your-google-client-id',
 *   enabled: true
 * })
 * 
 * const facebook = new FacebookSocial({
 *   type: SocialMediaType.FACEBOOK,
 *   name: 'Facebook',
 *   appId: 'your-facebook-app-id',
 *   enabled: true
 * })
 * 
 * cloudManager.registerCloudService(googleDrive)
 * cloudManager.registerSocialMedia(facebook)
 * 
 * // 监听事件
 * cloudManager.on('taskCompleted', (data) => {
 *   console.log('上传/分享完成:', data)
 * })
 * 
 * // 显示云端存储界面
 * const imageBlob = canvas.toBlob((blob) => {
 *   cloudManager.show(blob)
 * })
 * 
 * // 直接上传（不显示UI）
 * cloudManager.uploadToCloud(blob, CloudServiceType.GOOGLE_DRIVE, {
 *   fileName: 'my-image.png',
 *   folder: 'cropped-images',
 *   isPublic: true
 * })
 * 
 * // 直接分享（不显示UI）
 * cloudManager.shareToSocial(blob, SocialMediaType.FACEBOOK, {
 *   description: '看看我刚刚编辑的图片！',
 *   tags: ['图片编辑', '创作']
 * })
 * ```
 */
