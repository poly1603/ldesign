/**
 * @file 工具函数集合
 * @description 提供图片裁剪器所需的各种工具函数
 */

import type { Point, Size, Rectangle, Transform } from '@/types'
import { ImageFormat } from '@/types'

/**
 * 数学工具函数
 */
export const MathUtils = {
  /**
   * 将角度转换为弧度
   * @param degrees 角度值
   * @returns 弧度值
   */
  degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  },

  /**
   * 将弧度转换为角度
   * @param radians 弧度值
   * @returns 角度值
   */
  radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI
  },

  /**
   * 限制数值在指定范围内
   * @param value 要限制的值
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的值
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  },

  /**
   * 计算两点之间的距离
   * @param p1 第一个点
   * @param p2 第二个点
   * @returns 距离
   */
  distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * 计算点绕另一点旋转后的新坐标
   * @param point 要旋转的点
   * @param center 旋转中心
   * @param angle 旋转角度（弧度）
   * @returns 旋转后的点
   */
  rotatePoint(point: Point, center: Point, angle: number): Point {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const dx = point.x - center.x
    const dy = point.y - center.y

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    }
  },

  /**
   * 检查点是否在矩形内
   * @param point 要检查的点
   * @param rect 矩形区域
   * @returns 是否在矩形内
   */
  isPointInRect(point: Point, rect: Rectangle): boolean {
    return (
      point.x >= rect.x
      && point.x <= rect.x + rect.width
      && point.y >= rect.y
      && point.y <= rect.y + rect.height
    )
  },

  /**
   * 检查点是否在圆形内
   * @param point 要检查的点
   * @param center 圆心
   * @param radius 半径
   * @returns 是否在圆形内
   */
  isPointInCircle(point: Point, center: Point, radius: number): boolean {
    return this.distance(point, center) <= radius
  },
}

/**
 * DOM 工具函数
 */
export const DOMUtils = {
  /**
   * 获取元素的边界矩形
   * @param element HTML 元素
   * @returns 边界矩形
   */
  getBoundingRect(element: HTMLElement): Rectangle {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }
  },

  /**
   * 获取鼠标或触摸事件的坐标
   * @param event 事件对象
   * @returns 坐标点
   */
  getEventPoint(event: MouseEvent | TouchEvent): Point {
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    }
    return {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY,
    }
  },

  /**
   * 获取相对于元素的坐标
   * @param event 事件对象
   * @param element 参考元素
   * @returns 相对坐标
   */
  getRelativePoint(event: MouseEvent | TouchEvent, element: HTMLElement): Point {
    const point = this.getEventPoint(event)
    const rect = this.getBoundingRect(element)
    return {
      x: point.x - rect.x,
      y: point.y - rect.y,
    }
  },

  /**
   * 创建 Canvas 元素
   * @param width 宽度
   * @param height 高度
   * @returns Canvas 元素
   */
  createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  },

  /**
   * 检查是否支持触摸事件
   * @returns 是否支持触摸
   */
  isTouchSupported(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param delay 延迟时间（毫秒）
   * @returns 防抖后的函数
   */
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }) as T
  },

  /**
   * 节流函数
   * @param func 要节流的函数
   * @param delay 延迟时间（毫秒）
   * @returns 节流后的函数
   */
  throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let lastCall = 0
    return ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return func.apply(this, args)
      }
    }) as T
  },
}

/**
 * 图片工具函数
 */
export const ImageUtils = {
  /**
   * 加载图片
   * @param src 图片源
   * @returns Promise<HTMLImageElement>
   */
  loadImage(src: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))

      if (typeof src === 'string') {
        img.src = src
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(src)
      }
    })
  },

  /**
   * 获取图片格式
   * @param src 图片源
   * @returns 图片格式
   */
  getImageFormat(src: string): ImageFormat {
    const extension = src.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return ImageFormat.JPEG
      case 'png':
        return ImageFormat.PNG
      case 'webp':
        return ImageFormat.WEBP
      case 'bmp':
        return ImageFormat.BMP
      default:
        return ImageFormat.JPEG
    }
  },

  /**
   * 计算适应容器的图片尺寸
   * @param imageSize 图片原始尺寸
   * @param containerSize 容器尺寸
   * @param mode 适应模式
   * @returns 计算后的尺寸
   */
  calculateFitSize(
    imageSize: Size,
    containerSize: Size,
    mode: 'contain' | 'cover' | 'fill' = 'contain',
  ): Size {
    const imageRatio = imageSize.width / imageSize.height
    const containerRatio = containerSize.width / containerSize.height

    switch (mode) {
      case 'contain': {
        if (imageRatio > containerRatio) {
          return {
            width: containerSize.width,
            height: containerSize.width / imageRatio,
          }
        } else {
          return {
            width: containerSize.height * imageRatio,
            height: containerSize.height,
          }
        }
      }
      case 'cover': {
        if (imageRatio > containerRatio) {
          return {
            width: containerSize.height * imageRatio,
            height: containerSize.height,
          }
        } else {
          return {
            width: containerSize.width,
            height: containerSize.width / imageRatio,
          }
        }
      }
      case 'fill':
        return containerSize
      default:
        return imageSize
    }
  },

  /**
   * Canvas 转 Blob
   * @param canvas Canvas 元素
   * @param format 输出格式
   * @param quality 输出质量
   * @returns Promise<Blob>
   */
  canvasToBlob(
    canvas: HTMLCanvasElement,
    format: ImageFormat = ImageFormat.PNG,
    quality = 0.9,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        format,
        quality,
      )
    })
  },

  /**
   * 下载图片
   * @param canvas Canvas 元素
   * @param filename 文件名
   * @param format 图片格式
   * @param quality 图片质量
   */
  async downloadImage(
    canvas: HTMLCanvasElement,
    filename = 'cropped-image',
    format: ImageFormat = ImageFormat.PNG,
    quality = 0.9,
  ): Promise<void> {
    try {
      const blob = await this.canvasToBlob(canvas, format, quality)
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${format.split('/')[1]}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
      throw error
    }
  },
}

/**
 * 颜色工具函数
 */
export const ColorUtils = {
  /**
   * 十六进制颜色转 RGBA
   * @param hex 十六进制颜色
   * @param alpha 透明度
   * @returns RGBA 字符串
   */
  hexToRgba(hex: string, alpha = 1): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  },

  /**
   * 获取对比色
   * @param color 原始颜色
   * @returns 对比色
   */
  getContrastColor(color: string): string {
    // 简单的黑白对比色计算
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  },
}

/**
 * 性能工具函数
 */
export const PerformanceUtils = {
  /**
   * 请求动画帧的 Promise 版本
   * @returns Promise<number>
   */
  nextFrame(): Promise<number> {
    return new Promise(resolve => requestAnimationFrame(resolve))
  },

  /**
   * 延迟执行
   * @param ms 延迟时间（毫秒）
   * @returns Promise<void>
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 测量函数执行时间
   * @param fn 要测量的函数
   * @param label 标签
   * @returns 函数执行结果
   */
  measure<T>(fn: () => T, label = 'Function'): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`${label} took ${end - start} milliseconds`)
    return result
  },

  /**
   * 内存使用情况（如果支持）
   * @returns 内存信息
   */
  getMemoryInfo(): any {
    return (performance as any).memory || null
  },
}
