/**
 * PDF处理工具函数
 * 提供PDF相关的实用功能
 */

import type { PDFPageProxy } from 'pdfjs-dist'
import type { ZoomMode, RotationAngle, ThumbnailOptions } from '../core/types'

/**
 * 计算适合容器的缩放比例
 */
export function calculateFitScale(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number,
  mode: ZoomMode,
  padding = 20
): number {
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2

  switch (mode) {
    case 'fit-width':
      return availableWidth / pageWidth
    case 'fit-page':
      return Math.min(availableWidth / pageWidth, availableHeight / pageHeight)
    case 'auto':
      // 自动选择最合适的模式
      const widthScale = availableWidth / pageWidth
      const heightScale = availableHeight / pageHeight
      return Math.min(widthScale, heightScale)
    default:
      return 1
  }
}

/**
 * 获取页面的实际尺寸（考虑旋转）
 */
export function getRotatedPageSize(
  width: number,
  height: number,
  rotation: RotationAngle
): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }
  return { width, height }
}

/**
 * 创建缩略图
 */
export async function createThumbnail(
  page: PDFPageProxy,
  options: ThumbnailOptions = {}
): Promise<HTMLCanvasElement> {
  const {
    width = 150,
    height = 200,
    scale,
  } = options

  // 获取页面视口
  const viewport = page.getViewport({ scale: 1 })
  
  // 计算缩放比例
  let thumbnailScale: number
  if (scale) {
    thumbnailScale = scale
  } else {
    const scaleX = width / viewport.width
    const scaleY = height / viewport.height
    thumbnailScale = Math.min(scaleX, scaleY)
  }

  const thumbnailViewport = page.getViewport({ scale: thumbnailScale })

  // 创建canvas
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Failed to get canvas context')
  }

  canvas.width = thumbnailViewport.width
  canvas.height = thumbnailViewport.height

  // 渲染页面
  const renderContext = {
    canvasContext: context,
    viewport: thumbnailViewport,
  }

  await page.render(renderContext).promise

  return canvas
}

/**
 * 将canvas转换为Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, type, quality)
  })
}

/**
 * 将canvas转换为DataURL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92): string {
  return canvas.toDataURL(type, quality)
}

/**
 * 下载canvas为图片
 */
export async function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  type = 'image/png'
): Promise<void> {
  const dataURL = canvasToDataURL(canvas, type)
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取页面文本内容
 */
export async function getPageTextContent(page: PDFPageProxy): Promise<string> {
  try {
    const textContent = await page.getTextContent()
    return textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim()
  } catch (error) {
    console.warn('Failed to extract text content:', error)
    return ''
  }
}

/**
 * 在文本中搜索关键词
 */
export function searchInText(
  text: string,
  query: string,
  caseSensitive = false,
  wholeWords = false
): Array<{ index: number; length: number; match: string }> {
  if (!query.trim()) {
    return []
  }

  let searchText = text
  let searchQuery = query

  if (!caseSensitive) {
    searchText = text.toLowerCase()
    searchQuery = query.toLowerCase()
  }

  const results: Array<{ index: number; length: number; match: string }> = []
  let startIndex = 0

  while (true) {
    let index: number

    if (wholeWords) {
      const regex = new RegExp(`\\b${escapeRegExp(searchQuery)}\\b`, caseSensitive ? 'g' : 'gi')
      regex.lastIndex = startIndex
      const match = regex.exec(searchText)
      if (!match) break
      index = match.index
    } else {
      index = searchText.indexOf(searchQuery, startIndex)
      if (index === -1) break
    }

    results.push({
      index,
      length: searchQuery.length,
      match: text.substring(index, index + searchQuery.length),
    })

    startIndex = index + 1
  }

  return results
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 高亮显示搜索结果
 */
export function highlightSearchResults(
  text: string,
  results: Array<{ index: number; length: number; match: string }>,
  highlightClass = 'pdf-search-highlight'
): string {
  if (results.length === 0) {
    return text
  }

  // 按索引倒序排列，避免索引偏移问题
  const sortedResults = [...results].sort((a, b) => b.index - a.index)

  let highlightedText = text
  for (const result of sortedResults) {
    const before = highlightedText.substring(0, result.index)
    const match = highlightedText.substring(result.index, result.index + result.length)
    const after = highlightedText.substring(result.index + result.length)
    
    highlightedText = `${before}<span class="${highlightClass}">${match}</span>${after}`
  }

  return highlightedText
}

/**
 * 计算页面在容器中的居中位置
 */
export function calculateCenterPosition(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, (containerWidth - pageWidth) / 2),
    y: Math.max(0, (containerHeight - pageHeight) / 2),
  }
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout as any)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'pdf'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 平滑滚动到元素
 */
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({ behavior, block: 'center' })
}

/**
 * 解析打印页面范围（如 "1-5,8,10-12"）为页码数组
 */
export function parsePageRange(range: string, totalPages: number): number[] {
  const result = new Set<number>()
  const parts = (range || '').split(',').map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/)
    if (!m) continue
    const start = Math.max(1, Math.min(totalPages, parseInt(m[1], 10)))
    const end = m[2] ? Math.max(1, Math.min(totalPages, parseInt(m[2], 10))) : start
    const [from, to] = start <= end ? [start, end] : [end, start]
    for (let p = from; p <= to; p++) result.add(p)
  }
  // 默认返回空代表非法/未解析，让上层用全量兜底
  return Array.from(result).sort((a, b) => a - b)
}
