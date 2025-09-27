import { DocumentType, DocumentViewerError, ErrorCode } from '../types'

/**
 * 获取容器元素
 */
export function getContainer(container: HTMLElement | string): HTMLElement {
  if (typeof container === 'string') {
    const element = document.querySelector(container) as HTMLElement
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

/**
 * 检测文档类型
 */
export async function detectDocumentType(file: File | string | ArrayBuffer): Promise<DocumentType> {
  if (file instanceof File) {
    return detectDocumentTypeFromFile(file)
  } else if (typeof file === 'string') {
    return detectDocumentTypeFromUrl(file)
  } else {
    return detectDocumentTypeFromBuffer(file)
  }
}

/**
 * 从文件检测文档类型
 */
function detectDocumentTypeFromFile(file: File): DocumentType {
  const extension = getFileExtension(file.name).toLowerCase()
  return getDocumentTypeFromExtension(extension)
}

/**
 * 从 URL 检测文档类型
 */
function detectDocumentTypeFromUrl(url: string): DocumentType {
  const extension = getFileExtension(url).toLowerCase()
  return getDocumentTypeFromExtension(extension)
}

/**
 * 从 ArrayBuffer 检测文档类型
 */
function detectDocumentTypeFromBuffer(buffer: ArrayBuffer): DocumentType {
  // 通过文件头检测文档类型
  const uint8Array = new Uint8Array(buffer)
  
  // ZIP 文件头 (Office 2007+ 格式)
  if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
    // 需要进一步检测具体的 Office 文档类型
    // 这里简化处理，返回 Word 类型
    return DocumentType.WORD
  }
  
  // OLE 文件头 (Office 97-2003 格式)
  if (uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF) {
    return DocumentType.WORD
  }
  
  // 默认返回 Word 类型
  return DocumentType.WORD
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1) : ''
}

/**
 * 根据扩展名获取文档类型
 */
function getDocumentTypeFromExtension(extension: string): DocumentType {
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

/**
 * 读取文件为 ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 读取文件为文本
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * 从 URL 获取文件
 */
export async function fetchFile(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.arrayBuffer()
  } catch (error) {
    throw new DocumentViewerError(
      `Failed to fetch file from URL: ${url}`,
      ErrorCode.LOAD_FAILED,
      error as Error
    )
  }
}

/**
 * 创建下载链接
 */
export function createDownloadLink(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
