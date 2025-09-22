/**
 * 文件上传工具函数
 * 提供文件上传、进度监控、断点续传等功能
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 文件上传配置
 */
export interface UploadConfig extends Omit<RequestConfig, 'data'> {
  /** 文件字段名 */
  fileField?: string
  /** 额外的表单数据 */
  formData?: Record<string, string | Blob>
  /** 上传进度回调 */
  onProgress?: (progress: UploadProgress) => void
  /** 分片大小（字节），用于大文件分片上传 */
  chunkSize?: number
  /** 是否启用断点续传 */
  resumable?: boolean
  /** 文件类型限制 */
  accept?: string[]
  /** 文件大小限制（字节） */
  maxSize?: number
  /** 并发上传数量 */
  concurrent?: number
}

/**
 * 上传进度信息
 */
export interface UploadProgress {
  /** 已上传字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 上传百分比 (0-100) */
  percentage: number
  /** 上传速度 (字节/秒) */
  speed: number
  /** 预计剩余时间 (秒) */
  timeRemaining: number
  /** 已耗时 (毫秒) */
  elapsed: number
  /** 当前上传的文件 */
  file?: File
  /** 当前分片索引 */
  chunkIndex?: number
  /** 总分片数 */
  totalChunks?: number
}

/**
 * 上传结果
 */
export interface UploadResult<T = any> extends ResponseData<T> {
  /** 上传的文件信息 */
  file: File
  /** 上传耗时 */
  duration: number
}

/**
 * 分片信息
 */
export interface ChunkInfo {
  /** 分片索引 */
  index: number
  /** 分片数据 */
  chunk: Blob
  /** 分片大小 */
  size: number
  /** 分片开始位置 */
  start: number
  /** 分片结束位置 */
  end: number
  /** 文件哈希 */
  fileHash: string
}

/**
 * 文件验证错误
 */
export class FileValidationError extends Error {
  constructor(
    message: string,
    public file: File,
    public code: 'TYPE_NOT_ALLOWED' | 'SIZE_TOO_LARGE' | 'INVALID_FILE',
  ) {
    super(message)
    this.name = 'FileValidationError'
  }
}

/**
 * 验证文件
 */
export function validateFile(file: File, config: UploadConfig): void {
  // 检查文件类型
  if (config.accept && config.accept.length > 0) {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    const isTypeAllowed = config.accept.some((accept) => {
      if (accept.startsWith('.')) {
        // 扩展名匹配
        return fileName.endsWith(accept.toLowerCase())
      }
      else if (accept.includes('/')) {
        // MIME 类型匹配
        return fileType === accept || fileType.startsWith(accept.replace('*', ''))
      }
      return false
    })

    if (!isTypeAllowed) {
      throw new FileValidationError(
        `文件类型不被允许: ${fileType}`,
        file,
        'TYPE_NOT_ALLOWED',
      )
    }
  }

  // 检查文件大小
  if (config.maxSize && file.size > config.maxSize) {
    throw new FileValidationError(
      `文件大小超出限制: ${formatFileSize(file.size)} > ${formatFileSize(config.maxSize)}`,
      file,
      'SIZE_TOO_LARGE',
    )
  }

  // 检查文件是否有效
  if (file.size === 0) {
    throw new FileValidationError(
      '文件为空',
      file,
      'INVALID_FILE',
    )
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * 生成文件哈希
 */
export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 将文件分片
 */
export function createFileChunks(file: File, chunkSize: number): ChunkInfo[] {
  const chunks: ChunkInfo[] = []
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    chunks.push({
      index: i,
      chunk,
      size: chunk.size,
      start,
      end,
      fileHash: '', // 将在上传时生成
    })
  }

  return chunks
}

/**
 * 创建上传表单数据
 */
export function createUploadFormData(
  file: File,
  config: UploadConfig,
  chunkInfo?: ChunkInfo,
): FormData {
  const formData = new FormData()

  // 添加文件
  const fileField = config.fileField || 'file'
  if (chunkInfo) {
    formData.append(fileField, chunkInfo.chunk, file.name)
    formData.append('chunkIndex', chunkInfo.index.toString())
    formData.append('totalChunks', Math.ceil(file.size / (config.chunkSize || file.size)).toString())
    formData.append('fileHash', chunkInfo.fileHash)
  }
  else {
    formData.append(fileField, file)
  }

  // 添加额外的表单数据
  if (config.formData) {
    Object.entries(config.formData).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  // 添加文件信息
  formData.append('fileName', file.name)
  formData.append('fileSize', file.size.toString())
  formData.append('fileType', file.type)

  return formData
}

/**
 * 计算上传进度
 */
export class ProgressCalculator {
  private startTime: number = Date.now()
  private lastLoaded: number = 0
  private lastTime: number = Date.now()
  private speeds: number[] = []

  calculate(loaded: number, total: number, file?: File): UploadProgress {
    const now = Date.now()
    const deltaTime = now - this.lastTime
    const deltaLoaded = loaded - this.lastLoaded

    // 计算瞬时速度
    const instantSpeed = deltaTime > 0 ? (deltaLoaded / deltaTime) * 1000 : 0
    this.speeds.push(instantSpeed)

    // 保持最近10个速度样本
    if (this.speeds.length > 10) {
      this.speeds.shift()
    }

    // 计算平均速度
    const avgSpeed = this.speeds.reduce((sum, speed) => sum + speed, 0) / this.speeds.length

    // 计算剩余时间
    const remaining = total - loaded
    const timeRemaining = avgSpeed > 0 ? remaining / avgSpeed : 0

    this.lastLoaded = loaded
    this.lastTime = now

    return {
      loaded,
      total,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
      speed: avgSpeed,
      timeRemaining,
      elapsed: now - this.startTime,
      file,
    }
  }

  reset(): void {
    this.startTime = Date.now()
    this.lastLoaded = 0
    this.lastTime = Date.now()
    this.speeds = []
  }
}

/**
 * 检查文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 检查文件是否为视频
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * 检查文件是否为音频
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

/**
 * 检查文件是否为文档
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ]

  return documentTypes.includes(file.type)
}

/**
 * 生成文件预览URL
 */
export function createFilePreviewURL(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * 释放文件预览URL
 */
export function revokeFilePreviewURL(url: string): void {
  URL.revokeObjectURL(url)
}
