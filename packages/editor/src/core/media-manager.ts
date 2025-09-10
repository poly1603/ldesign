/**
 * 媒体管理器
 * 负责处理文件上传、媒体文件管理等功能
 */

import type { 
  IMediaManager, 
  MediaFile, 
  MediaType, 
  UploadConfig,
  IEventManager 
} from '../types'
import { generateId } from '../utils'

/**
 * 默认上传配置
 */
const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*'],
  maxSize: 10 * 1024 * 1024, // 10MB
  uploadUrl: '/api/upload',
  multiple: true
}

/**
 * 媒体管理器实现
 */
export class MediaManager implements IMediaManager {
  private mediaFiles: Map<string, MediaFile> = new Map()
  private uploadConfig: UploadConfig = { ...DEFAULT_UPLOAD_CONFIG }
  private eventManager: IEventManager

  constructor(eventManager: IEventManager) {
    this.eventManager = eventManager
  }

  /**
   * 上传文件
   */
  async upload(files: File[]): Promise<MediaFile[]> {
    const results: MediaFile[] = []

    for (const file of files) {
      try {
        // 验证文件
        this.validateFile(file)

        // 创建媒体文件对象
        const mediaFile = await this.createMediaFile(file)

        // 执行上传
        const uploadedFile = await this.uploadFile(file, mediaFile)

        // 存储文件信息
        this.mediaFiles.set(uploadedFile.id, uploadedFile)
        results.push(uploadedFile)

        // 触发上传成功事件
        this.eventManager.emit('media:uploaded', uploadedFile)
      } catch (error) {
        console.error('文件上传失败:', error)
        
        // 触发上传失败事件
        this.eventManager.emit('media:upload-error', {
          file: file.name,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    return results
  }

  /**
   * 获取媒体文件
   */
  getMedia(id: string): MediaFile | undefined {
    return this.mediaFiles.get(id)
  }

  /**
   * 获取所有媒体文件
   */
  getAllMedia(): MediaFile[] {
    return Array.from(this.mediaFiles.values())
  }

  /**
   * 删除媒体文件
   */
  deleteMedia(id: string): boolean {
    const mediaFile = this.mediaFiles.get(id)
    if (!mediaFile) {
      return false
    }

    // 删除文件
    this.mediaFiles.delete(id)

    // 触发删除事件
    this.eventManager.emit('media:deleted', mediaFile)

    return true
  }

  /**
   * 设置上传配置
   */
  setUploadConfig(config: UploadConfig): void {
    this.uploadConfig = { ...this.uploadConfig, ...config }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.mediaFiles.clear()
  }

  /**
   * 验证文件
   */
  private validateFile(file: File): void {
    // 检查文件类型
    const isAllowedType = this.uploadConfig.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isAllowedType) {
      throw new Error(`不支持的文件类型: ${file.type}`)
    }

    // 检查文件大小
    if (file.size > this.uploadConfig.maxSize) {
      throw new Error(`文件大小超过限制: ${this.formatFileSize(file.size)} > ${this.formatFileSize(this.uploadConfig.maxSize)}`)
    }
  }

  /**
   * 创建媒体文件对象
   */
  private async createMediaFile(file: File): Promise<MediaFile> {
    const id = generateId()
    const mediaType = this.getMediaType(file.type)

    const mediaFile: MediaFile = {
      id,
      name: file.name,
      type: mediaType,
      mimeType: file.type,
      size: file.size,
      url: '', // 上传后设置
      uploadTime: new Date(),
      metadata: await this.extractMetadata(file)
    }

    return mediaFile
  }

  /**
   * 执行文件上传
   */
  private async uploadFile(file: File, mediaFile: MediaFile): Promise<MediaFile> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(mediaFile))

    const response = await fetch(this.uploadConfig.uploadUrl, {
      method: 'POST',
      headers: this.uploadConfig.headers,
      body: formData
    })

    if (!response.ok) {
      throw new Error(`上传失败: ${response.statusText}`)
    }

    const result = await response.json()
    
    // 更新文件URL
    mediaFile.url = result.url
    if (result.thumbnailUrl) {
      mediaFile.thumbnailUrl = result.thumbnailUrl
    }

    return mediaFile
  }

  /**
   * 获取媒体类型
   */
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document'
    }
    return 'other'
  }

  /**
   * 提取文件元数据
   */
  private async extractMetadata(file: File): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      lastModified: file.lastModified
    }

    // 如果是图片，提取图片信息
    if (file.type.startsWith('image/')) {
      try {
        const imageInfo = await this.getImageInfo(file)
        metadata.width = imageInfo.width
        metadata.height = imageInfo.height
      } catch (error) {
        console.warn('无法提取图片信息:', error)
      }
    }

    return metadata
  }

  /**
   * 获取图片信息
   */
  private getImageInfo(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('无法加载图片'))
      }

      img.src = url
    })
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

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
}
