/**
 * 文件下载工具函数
 * 提供文件下载、进度监控、断点续传等功能
 */

import type { RequestConfig } from '../types'

/**
 * 下载配置
 */
export interface DownloadConfig extends RequestConfig {
  /** 下载文件名 */
  filename?: string
  /** 下载进度回调 */
  onProgress?: (progress: DownloadProgress) => void
  /** 是否启用断点续传 */
  resumable?: boolean
  /** 分片大小（字节），用于大文件分片下载 */
  chunkSize?: number
  /** 是否自动保存文件 */
  autoSave?: boolean
  /** 保存目录（仅 Node.js 环境） */
  saveDir?: string
}

/**
 * 下载进度信息
 */
export interface DownloadProgress {
  /** 已下载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 下载百分比 (0-100) */
  percentage: number
  /** 下载速度 (字节/秒) */
  speed: number
  /** 预计剩余时间 (秒) */
  timeRemaining: number
  /** 已耗时 (毫秒) */
  elapsed: number
  /** 下载的文件名 */
  filename?: string
  /** 当前分片索引 */
  chunkIndex?: number
  /** 总分片数 */
  totalChunks?: number
}

/**
 * 下载结果
 */
export interface DownloadResult {
  /** 下载的数据 */
  data: Blob | ArrayBuffer | string
  /** 文件名 */
  filename: string
  /** 文件大小 */
  size: number
  /** 文件类型 */
  type: string
  /** 下载耗时 */
  duration: number
  /** 下载URL（如果自动保存） */
  url?: string
}

/**
 * 分片下载信息
 */
export interface DownloadChunk {
  /** 分片索引 */
  index: number
  /** 分片开始位置 */
  start: number
  /** 分片结束位置 */
  end: number
  /** 分片大小 */
  size: number
  /** 分片数据 */
  data?: ArrayBuffer
  /** 是否已完成 */
  completed: boolean
}

/**
 * 下载进度计算器
 */
export class DownloadProgressCalculator {
  private startTime: number = Date.now()
  private lastLoaded: number = 0
  private lastTime: number = Date.now()
  private speeds: number[] = []

  calculate(loaded: number, total: number, filename?: string): DownloadProgress {
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
      filename,
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
 * 从响应头获取文件名
 */
export function getFilenameFromResponse(headers: Record<string, string>): string | null {
  const contentDisposition = headers['content-disposition'] || headers['Content-Disposition']

  if (!contentDisposition) {
    return null
  }

  // 尝试匹配 filename*=UTF-8''filename 格式
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i)
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1])
  }

  // 尝试匹配 filename="filename" 格式
  const quotedMatch = contentDisposition.match(/filename="(.+)"/i)
  if (quotedMatch) {
    return quotedMatch[1]
  }

  // 尝试匹配 filename=filename 格式
  const unquotedMatch = contentDisposition.match(/filename=([^;]+)/i)
  if (unquotedMatch) {
    return unquotedMatch[1].trim()
  }

  return null
}

/**
 * 从URL获取文件名
 */
export function getFilenameFromURL(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'download'

    // 移除查询参数
    return filename.split('?')[0]
  }
  catch {
    return 'download'
  }
}

/**
 * 获取文件MIME类型
 */
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',

    // 文档
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // 文本
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',

    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',

    // 视频
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',

    // 压缩文件
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * 保存文件到本地（浏览器环境）
 */
export function saveFileToLocal(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 清理URL
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * 创建下载分片
 */
export function createDownloadChunks(totalSize: number, chunkSize: number): DownloadChunk[] {
  const chunks: DownloadChunk[] = []
  const totalChunks = Math.ceil(totalSize / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize - 1, totalSize - 1)

    chunks.push({
      index: i,
      start,
      end,
      size: end - start + 1,
      completed: false,
    })
  }

  return chunks
}

/**
 * 合并下载分片
 */
export function mergeDownloadChunks(chunks: DownloadChunk[]): ArrayBuffer {
  // 按索引排序
  chunks.sort((a, b) => a.index - b.index)

  // 计算总大小
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)

  // 创建结果数组
  const result = new Uint8Array(totalSize)
  let offset = 0

  // 合并数据
  for (const chunk of chunks) {
    if (chunk.data) {
      const chunkData = new Uint8Array(chunk.data)
      result.set(chunkData, offset)
      offset += chunkData.length
    }
  }

  return result.buffer
}

/**
 * 检查是否支持断点续传
 */
export function supportsRangeRequests(headers: Record<string, string>): boolean {
  const acceptRanges = headers['accept-ranges'] || headers['Accept-Ranges']
  return acceptRanges === 'bytes'
}

/**
 * 创建Range请求头
 */
export function createRangeHeader(start: number, end?: number): string {
  if (end !== undefined) {
    return `bytes=${start}-${end}`
  }
  return `bytes=${start}-`
}

/**
 * 解析Content-Range响应头
 */
export function parseContentRange(contentRange: string): {
  start: number
  end: number
  total: number
} | null {
  const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/)

  if (!match) {
    return null
  }

  return {
    start: Number.parseInt(match[1], 10),
    end: Number.parseInt(match[2], 10),
    total: Number.parseInt(match[3], 10),
  }
}

/**
 * 格式化下载速度
 */
export function formatDownloadSpeed(bytesPerSecond: number): string {
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  let size = bytesPerSecond
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * 格式化剩余时间
 */
export function formatTimeRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '未知'
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}秒`
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}分${remainingSeconds}秒`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

/**
 * 检查文件是否可以预览
 */
export function isPreviewableFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  const previewableExts = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'pdf',
    'txt',
    'json',
    'xml',
    'html',
    'css',
    'js',
    'mp3',
    'wav',
    'ogg',
    'mp4',
    'avi',
    'mov',
  ]

  return previewableExts.includes(ext || '')
}
