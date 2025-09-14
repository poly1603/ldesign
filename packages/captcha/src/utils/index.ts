/**
 * 工具函数集合
 */

import type { Point, Size, Rect } from '../types'

// 导出主题管理器
export * from './theme-manager'

/**
 * 生成随机数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机浮点数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param chars 字符集
 * @returns 随机字符串
 */
export function randomString(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 打乱数组
 * @param array 原数组
 * @returns 打乱后的新数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 计算两点之间的距离
 * @param p1 点1
 * @param p2 点2
 * @returns 距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 检查点是否在矩形内
 * @param point 点
 * @param rect 矩形
 * @returns 是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
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
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param t 插值参数 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 角度转弧度
 * @param degrees 角度
 * @returns 弧度
 */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180
}

/**
 * 弧度转角度
 * @param radians 弧度
 * @returns 角度
 */
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI
}

/**
 * 标准化角度到 0-360 范围
 * @param angle 角度
 * @returns 标准化后的角度
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360
  return angle < 0 ? angle + 360 : angle
}

/**
 * 计算角度差值
 * @param angle1 角度1
 * @param angle2 角度2
 * @returns 角度差值 (-180 到 180)
 */
export function angleDifference(angle1: number, angle2: number): number {
  let diff = normalizeAngle(angle2) - normalizeAngle(angle1)
  if (diff > 180) {
    diff -= 360
  } else if (diff < -180) {
    diff += 360
  }
  return diff
}

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
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间
 * @returns 节流后的函数
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
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 加载图片
 * @param src 图片地址
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 获取图片数据
 * @param img 图片元素
 * @param width 宽度
 * @param height 高度
 * @returns ImageData
 */
export function getImageData(img: HTMLImageElement, width?: number, height?: number): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = width || img.width
  canvas.height = height || img.height

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

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
  const ctx = canvas.getContext('2d')!

  canvas.width = width
  canvas.height = height

  return { canvas, ctx }
}

/**
 * 获取元素相对于页面的位置
 * @param element 元素
 * @returns 位置信息
 */
export function getElementOffset(element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + window.pageXOffset,
    y: rect.top + window.pageYOffset
  }
}

/**
 * 获取鼠标/触摸相对于元素的位置
 * @param event 事件对象
 * @param element 元素
 * @returns 相对位置
 */
export function getRelativePosition(
  event: MouseEvent | TouchEvent,
  element: HTMLElement
): Point {
  const rect = element.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否支持触摸
 * @returns 是否支持触摸
 */
export function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
