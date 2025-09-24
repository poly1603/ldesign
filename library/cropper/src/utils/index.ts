/**
 * @file 工具函数库
 * @description 提供图片处理、数学计算、DOM操作等辅助功能
 */

import type { Point, Rect, Transform, BoundingBox, ImageSource } from '../types'

// ==================== 数学工具 ====================

/**
 * 角度转弧度
 * @param degrees 角度
 * @returns 弧度
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * 弧度转角度
 * @param radians 弧度
 * @returns 角度
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * 限制数值在指定范围内
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 计算两点之间的距离
 * @param p1 点1
 * @param p2 点2
 * @returns 距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算点到直线的距离
 * @param point 点
 * @param lineStart 直线起点
 * @param lineEnd 直线终点
 * @returns 距离
 */
export function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  const dx = point.x - xx
  const dy = point.y - yy
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 旋转点
 * @param point 原始点
 * @param center 旋转中心
 * @param angle 旋转角度（弧度）
 * @returns 旋转后的点
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  }
}

/**
 * 计算矩形的边界框
 * @param rect 矩形
 * @param transform 变换
 * @returns 边界框
 */
export function getBoundingBox(rect: Rect, transform?: Transform): BoundingBox {
  const points: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ]

  if (transform) {
    const center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }

    points.forEach((point, index) => {
      // 应用缩放
      point.x = center.x + (point.x - center.x) * transform.scaleX
      point.y = center.y + (point.y - center.y) * transform.scaleY

      // 应用旋转
      if (transform.rotation !== 0) {
        const rotated = rotatePoint(point, center, degreesToRadians(transform.rotation))
        point.x = rotated.x
        point.y = rotated.y
      }

      // 应用平移
      point.x += transform.translateX
      point.y += transform.translateY

      points[index] = point
    })
  }

  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// ==================== 图片工具 ====================

/**
 * 获取图片信息
 * @param source 图片源
 * @returns Promise<ImageInfo>
 */
export async function getImageInfo(source: ImageSource): Promise<{
  naturalWidth: number
  naturalHeight: number
  width: number
  height: number
  aspectRatio: number
  size?: number
  type?: string
  name?: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const info: {
        naturalWidth: number
        naturalHeight: number
        width: number
        height: number
        aspectRatio: number
        size?: number
        type?: string
        name?: string
      } = {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: img.width,
        height: img.height,
        aspectRatio: img.naturalWidth / img.naturalHeight
      }

      if (source instanceof File) {
        info.size = source.size
        info.type = source.type
        info.name = source.name
      }

      resolve(info)
    }
    img.onerror = () => reject(new Error('Failed to load image'))

    if (typeof source === 'string') {
      img.src = source
    } else if (source instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(source)
    } else if (source instanceof HTMLCanvasElement) {
      img.src = source.toDataURL()
    }
  })
}

/**
 * 检查图片格式是否支持
 * @param type MIME类型
 * @returns 是否支持
 */
export function isSupportedImageType(type: string): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ]
  return supportedTypes.includes(type.toLowerCase())
}

/**
 * 获取图片文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
export function getImageExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext || ''
}

/**
 * 根据扩展名获取MIME类型
 * @param extension 扩展名
 * @returns MIME类型
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml'
  }
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg'
}

// ==================== Canvas工具 ====================

/**
 * 创建Canvas元素
 * @param width 宽度
 * @param height 高度
 * @returns Canvas元素和上下文
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

/**
 * 清空Canvas
 * @param ctx Canvas上下文
 * @param width 宽度
 * @param height 高度
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height)
}

/**
 * 绘制圆角矩形
 * @param ctx Canvas上下文
 * @param x X坐标
 * @param y Y坐标
 * @param width 宽度
 * @param height 高度
 * @param radius 圆角半径
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 绘制虚线
 * @param ctx Canvas上下文
 * @param x1 起点X
 * @param y1 起点Y
 * @param x2 终点X
 * @param y2 终点Y
 * @param dashLength 虚线长度
 */
export function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLength: number = 5
): void {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  const dashCount = Math.floor(distance / dashLength)
  const unitX = dx / distance
  const unitY = dy / distance

  ctx.beginPath()
  for (let i = 0; i < dashCount; i += 2) {
    const startX = x1 + unitX * dashLength * i
    const startY = y1 + unitY * dashLength * i
    const endX = x1 + unitX * dashLength * (i + 1)
    const endY = y1 + unitY * dashLength * (i + 1)

    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
  }
  ctx.stroke()
}

// ==================== DOM工具 ====================

/**
 * 获取元素的边界矩形
 * @param element DOM元素
 * @returns 边界矩形
 */
export function getElementRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取鼠标相对于元素的坐标
 * @param event 鼠标事件
 * @param element 目标元素
 * @returns 相对坐标
 */
export function getRelativeMousePosition(event: MouseEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

/**
 * 获取触摸相对于元素的坐标
 * @param touch 触摸对象
 * @param element 目标元素
 * @returns 相对坐标
 */
export function getRelativeTouchPosition(touch: Touch, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  }
}

/**
 * 检查点是否在矩形内
 * @param point 点
 * @param rect 矩形
 * @returns 是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/**
 * 检查点是否在圆形内
 * @param point 点
 * @param center 圆心
 * @param radius 半径
 * @returns 是否在圆形内
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius
}

// ==================== 颜色工具 ====================

/**
 * 十六进制颜色转RGB
 * @param hex 十六进制颜色
 * @returns RGB对象
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * RGB转十六进制颜色
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @returns 十六进制颜色
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * 获取颜色的RGBA字符串
 * @param color 颜色
 * @param alpha 透明度
 * @returns RGBA字符串
 */
export function getRgbaString(color: string, alpha: number = 1): string {
  const rgb = hexToRgb(color)
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

// ==================== 性能工具 ====================

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 请求动画帧的Promise版本
 * @returns Promise
 */
export function nextFrame(): Promise<number> {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}

// ==================== 验证工具 ====================

/**
 * 检查是否为有效的数字
 * @param value 值
 * @returns 是否为有效数字
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * 检查是否为有效的坐标点
 * @param point 点
 * @returns 是否为有效坐标点
 */
export function isValidPoint(point: any): point is Point {
  return (
    point &&
    typeof point === 'object' &&
    isValidNumber(point.x) &&
    isValidNumber(point.y)
  )
}

/**
 * 检查是否为有效的矩形
 * @param rect 矩形
 * @returns 是否为有效矩形
 */
export function isValidRect(rect: any): rect is Rect {
  return (
    rect &&
    typeof rect === 'object' &&
    isValidNumber(rect.x) &&
    isValidNumber(rect.y) &&
    isValidNumber(rect.width) &&
    isValidNumber(rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  )
}