/**
 * 文件处理工具函数
 * 提供文件类型检测、转换等功能
 */

import type { PdfInput } from '../core/types'

/**
 * 检查输入是否为有效的PDF数据
 */
export function isValidPdfInput(input: unknown): input is PdfInput {
  return (
    typeof input === 'string' ||
    input instanceof File ||
    input instanceof ArrayBuffer ||
    input instanceof Uint8Array
  )
}

/**
 * 检查文件是否为PDF格式
 */
export function isPdfFile(file: File): boolean {
  // 检查MIME类型
  if (file.type === 'application/pdf') {
    return true
  }

  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.pdf')
}

/**
 * 检查URL是否指向PDF文件
 */
export function isPdfUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    return pathname.endsWith('.pdf')
  }
  catch {
    return false
  }
}

/**
 * 将File对象转换为ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      }
      else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 将ArrayBuffer转换为Uint8Array
 */
export function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}

/**
 * 检查ArrayBuffer是否为PDF格式
 */
export function isPdfArrayBuffer(buffer: ArrayBufferLike): boolean {
  const uint8Array = new Uint8Array(buffer)
  
  // PDF文件以"%PDF-"开头
  const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2D] // %PDF-
  
  if (uint8Array.length < pdfSignature.length) {
    return false
  }
  
  for (let i = 0; i < pdfSignature.length; i++) {
    if (uint8Array[i] !== pdfSignature[i]) {
      return false
    }
  }
  
  return true
}

/**
 * 获取文件大小的可读格式
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 从URL获取文件名
 */
export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split('/').pop() || 'document.pdf'
    return fileName.includes('.') ? fileName : `${fileName}.pdf`
  }
  catch {
    return 'document.pdf'
  }
}

/**
 * 验证PDF输入并返回标准化的数据
 */
export async function validateAndNormalizePdfInput(input: PdfInput): Promise<{
  data: string | ArrayBuffer | Uint8Array
  type: 'url' | 'file' | 'buffer'
  size?: number
  name?: string
}> {
  if (typeof input === 'string') {
    // URL字符串
    if (!isPdfUrl(input)) {
      console.warn('URL may not point to a PDF file')
    }
    
    return {
      data: input,
      type: 'url',
      name: getFileNameFromUrl(input),
    }
  }
  else if (input instanceof File) {
    // File对象
    if (!isPdfFile(input)) {
      throw new Error('File is not a PDF')
    }
    
    const arrayBuffer = await fileToArrayBuffer(input)
    
    if (!isPdfArrayBuffer(arrayBuffer)) {
      throw new Error('File content is not a valid PDF')
    }
    
    return {
      data: arrayBuffer,
      type: 'file',
      size: input.size,
      name: input.name,
    }
  }
  else if (input instanceof ArrayBuffer) {
    // ArrayBuffer
    if (!isPdfArrayBuffer(input)) {
      throw new Error('ArrayBuffer content is not a valid PDF')
    }
    
    return {
      data: input,
      type: 'buffer',
      size: input.byteLength,
    }
  }
  else if (input instanceof Uint8Array) {
    // Uint8Array
    const arrayBuffer = input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength
    )
    
    if (!isPdfArrayBuffer(arrayBuffer)) {
      throw new Error('Uint8Array content is not a valid PDF')
    }
    
    return {
      data: input,
      type: 'buffer',
      size: input.length,
    }
  }
  else {
    throw new Error('Unsupported input type')
  }
}

/**
 * 创建用于下载的Blob URL
 */
export function createDownloadUrl(data: ArrayBuffer | Uint8Array, filename: string): string {
  const buffer: ArrayBuffer = data instanceof Uint8Array
    ? data.slice().buffer
    : data
  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  
  return url
}

/**
 * 清理Blob URL
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 检查浏览器是否支持PDF预览
 */
export function isBrowserSupportPdf(): boolean {
  // 检查是否支持Canvas
  const canvas = document.createElement('canvas')
  const canvasSupported = !!(canvas.getContext && canvas.getContext('2d'))
  
  // 检查是否支持ArrayBuffer
  const arrayBufferSupported = typeof ArrayBuffer !== 'undefined'
  
  // 检查是否支持Uint8Array
  const uint8ArraySupported = typeof Uint8Array !== 'undefined'
  
  // 检查是否支持FileReader
  const fileReaderSupported = typeof FileReader !== 'undefined'
  
  return canvasSupported && arrayBufferSupported && uint8ArraySupported && fileReaderSupported
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo(): {
  name: string
  version: string
  isSupported: boolean
} {
  const userAgent = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'
  
  if (userAgent.includes('Chrome')) {
    name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  else if (userAgent.includes('Safari')) {
    name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  else if (userAgent.includes('Edge')) {
    name = 'Edge'
    const match = userAgent.match(/Edge\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  
  return {
    name,
    version,
    isSupported: isBrowserSupportPdf(),
  }
}
