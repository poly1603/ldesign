/**
 * @file 工具函数
 * @description 提供主题包相关的工具函数
 */

import type { WidgetConfig, AnimationConfig, WidgetPosition } from '../core/types'

/**
 * 验证挂件配置
 * @param widget 挂件配置
 * @returns 验证结果
 */
export function validateWidgetConfig(widget: WidgetConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查必需字段
  if (!widget.id) {
    errors.push('Widget ID is required')
  }
  if (!widget.name) {
    errors.push('Widget name is required')
  }
  if (!widget.type) {
    errors.push('Widget type is required')
  }
  if (!widget.content) {
    errors.push('Widget content is required')
  }

  // 检查ID格式
  if (widget.id && !/^[a-zA-Z0-9-_]+$/.test(widget.id)) {
    errors.push('Widget ID must contain only alphanumeric characters, hyphens, and underscores')
  }

  // 检查位置配置
  if (widget.position) {
    const { position, anchor } = widget.position
    if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined') {
      errors.push('Widget position must have x and y coordinates')
    }
    if (anchor && !['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(anchor)) {
      errors.push('Invalid anchor value')
    }
  }

  // 检查样式配置
  if (widget.style) {
    if (widget.style.opacity !== undefined && (widget.style.opacity < 0 || widget.style.opacity > 1)) {
      errors.push('Opacity must be between 0 and 1')
    }
    if (widget.style.zIndex !== undefined && widget.style.zIndex < 0) {
      errors.push('Z-index must be non-negative')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 生成唯一的挂件ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateWidgetId(prefix: string = 'widget'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * 合并动画配置
 * @param base 基础动画配置
 * @param override 覆盖动画配置
 * @returns 合并后的动画配置
 */
export function mergeAnimationConfigs(
  base: AnimationConfig,
  override: Partial<AnimationConfig>
): AnimationConfig {
  return {
    ...base,
    ...override
  }
}

/**
 * 计算最优位置
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param widgetWidth 挂件宽度
 * @param widgetHeight 挂件高度
 * @param preferredPosition 首选位置
 * @returns 最优位置
 */
export function calculateOptimalPosition(
  containerWidth: number,
  containerHeight: number,
  widgetWidth: number,
  widgetHeight: number,
  preferredPosition?: { x: number; y: number }
): WidgetPosition {
  let x = preferredPosition?.x ?? containerWidth * 0.5
  let y = preferredPosition?.y ?? containerHeight * 0.5

  // 确保挂件不会超出容器边界
  x = Math.max(widgetWidth / 2, Math.min(containerWidth - widgetWidth / 2, x))
  y = Math.max(widgetHeight / 2, Math.min(containerHeight - widgetHeight / 2, y))

  // 转换为百分比
  const xPercent = `${(x / containerWidth * 100).toFixed(1)}%`
  const yPercent = `${(y / containerHeight * 100).toFixed(1)}%`

  return {
    type: 'fixed',
    position: { x: xPercent, y: yPercent },
    anchor: 'center'
  }
}

/**
 * 检测挂件碰撞
 * @param widgets 挂件列表
 * @param newWidget 新挂件
 * @param tolerance 容忍度（像素）
 * @returns 是否有碰撞
 */
export function detectCollisions(
  widgets: WidgetConfig[],
  newWidget: WidgetConfig,
  tolerance: number = 10
): boolean {
  if (!newWidget.position) return false

  const newPos = parsePosition(newWidget.position)
  if (!newPos) return false

  for (const widget of widgets) {
    if (!widget.position || widget.id === newWidget.id) continue

    const pos = parsePosition(widget.position)
    if (!pos) continue

    const distance = Math.sqrt(
      Math.pow(newPos.x - pos.x, 2) + Math.pow(newPos.y - pos.y, 2)
    )

    if (distance < tolerance) {
      return true
    }
  }

  return false
}

/**
 * 解析位置配置为像素坐标
 * @param position 位置配置
 * @returns 像素坐标
 */
function parsePosition(position: WidgetPosition): { x: number; y: number } | null {
  try {
    const { x, y } = position.position

    let xPx: number
    let yPx: number

    if (typeof x === 'string' && x.endsWith('%')) {
      xPx = (parseFloat(x) / 100) * window.innerWidth
    } else {
      xPx = typeof x === 'number' ? x : parseFloat(x)
    }

    if (typeof y === 'string' && y.endsWith('%')) {
      yPx = (parseFloat(y) / 100) * window.innerHeight
    } else {
      yPx = typeof y === 'number' ? y : parseFloat(y)
    }

    return { x: xPx, y: yPx }
  } catch {
    return null
  }
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取设备像素比
 * @returns 设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * 检查是否支持 WebGL
 * @returns 是否支持 WebGL
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * 检查是否支持 CSS 动画
 * @returns 是否支持 CSS 动画
 */
export function supportsCSSAnimations(): boolean {
  const element = document.createElement('div')
  return 'animationName' in element.style
}

/**
 * 检查是否支持 Web Animations API
 * @returns 是否支持 Web Animations API
 */
export function supportsWebAnimations(): boolean {
  return 'animate' in document.createElement('div')
}

/**
 * 获取浏览器信息
 * @returns 浏览器信息
 */
export function getBrowserInfo(): {
  name: string
  version: string
  engine: string
} {
  const userAgent = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'
  let engine = 'Unknown'

  if (userAgent.includes('Chrome')) {
    name = 'Chrome'
    engine = 'Blink'
    const match = userAgent.match(/Chrome\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    engine = 'Gecko'
    const match = userAgent.match(/Firefox\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.includes('Safari')) {
    name = 'Safari'
    engine = 'WebKit'
    const match = userAgent.match(/Version\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.includes('Edge')) {
    name = 'Edge'
    engine = 'EdgeHTML'
    const match = userAgent.match(/Edge\/(\d+)/)
    if (match) version = match[1]
  }

  return { name, version, engine }
}

/**
 * 创建节日主题（重新导出）
 */
export { createFestivalTheme, themeTemplates } from '../themes/base/theme-factory'
