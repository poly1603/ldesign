/**
 * 格式化工具函数
 * 提供时间、文件大小、URL等格式化功能
 */

/**
 * 格式化时间（秒转换为 HH:MM:SS 或 MM:SS）
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00'
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * 解析时间字符串为秒数
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(part => parseInt(part, 10))
  
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化比特率
 */
export function formatBitrate(bps: number): string {
  if (bps === 0) return '0 bps'
  
  const k = 1000
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps']
  const i = Math.floor(Math.log(bps) / Math.log(k))
  
  return `${parseFloat((bps / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%'
  
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化数字（添加千分位分隔符）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * 格式化播放速度
 */
export function formatPlaybackRate(rate: number): string {
  if (rate === 1) return '正常'
  return `${rate}x`
}

/**
 * 格式化分辨率
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`
}

/**
 * 获取分辨率标签
 */
export function getResolutionLabel(width: number, height: number): string {
  const resolutions: Record<string, string> = {
    '7680x4320': '8K',
    '3840x2160': '4K',
    '2560x1440': '2K',
    '1920x1080': '1080p',
    '1280x720': '720p',
    '854x480': '480p',
    '640x360': '360p',
    '426x240': '240p'
  }
  
  const key = `${width}x${height}`
  return resolutions[key] || formatResolution(width, height)
}

/**
 * 格式化URL
 */
export function formatURL(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.href
  } catch {
    return url
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 获取MIME类型
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  
  const mimeTypes: Record<string, string> = {
    // 视频格式
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    '3gp': 'video/3gpp',
    
    // 音频格式
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'flac': 'audio/flac',
    'm4a': 'audio/x-m4a',
    
    // 字幕格式
    'srt': 'text/srt',
    'vtt': 'text/vtt',
    'ass': 'text/x-ass',
    'ssa': 'text/x-ssa'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * 检查是否为视频文件
 */
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'm4v', '3gp']
  const ext = getFileExtension(filename)
  return videoExtensions.includes(ext)
}

/**
 * 检查是否为音频文件
 */
export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
  const ext = getFileExtension(filename)
  return audioExtensions.includes(ext)
}

/**
 * 检查是否为字幕文件
 */
export function isSubtitleFile(filename: string): boolean {
  const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'ttml']
  const ext = getFileExtension(filename)
  return subtitleExtensions.includes(ext)
}

/**
 * 格式化错误消息
 */
export function formatError(error: Error | string): string {
  if (typeof error === 'string') {
    return error
  }
  
  return error.message || '未知错误'
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | number | string): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '无效日期'
  }
  
  return d.toLocaleString()
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | number | string): string {
  const now = new Date()
  const target = new Date(date)
  
  if (isNaN(target.getTime())) {
    return '无效日期'
  }
  
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return formatDateTime(target)
  }
}

/**
 * 格式化颜色值
 */
export function formatColor(color: string): string {
  // 如果是十六进制颜色，确保格式正确
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      // 将 #RGB 转换为 #RRGGBB
      return `#${hex.split('').map(c => c + c).join('')}`
    } else if (hex.length === 6) {
      return color.toUpperCase()
    }
  }
  
  return color
}

/**
 * 将RGB转换为十六进制
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 将十六进制转换为RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * 格式化CSS值
 */
export function formatCSSValue(value: string | number, unit = 'px'): string {
  if (typeof value === 'number') {
    return `${value}${unit}`
  }
  
  return value
}

/**
 * 清理HTML标签
 */
export function stripHTML(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 转义HTML字符
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 反转义HTML字符
 */
export function unescapeHTML(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 格式化查询参数
 */
export function formatQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * 解析查询参数
 */
export function parseQueryParams(search: string): Record<string, string> {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(search)
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}
