/**
 * @file 数学工具函数
 * @description 提供数学计算相关的工具函数
 */

import type { Point, Size, Rect, BoundingBox } from '../types'

/**
 * 将角度转换为弧度
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * 将弧度转换为角度
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 计算两点之间的距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算点绕另一点旋转后的新坐标
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const rad = degToRad(angle)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  
  const dx = point.x - center.x
  const dy = point.y - center.y
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

/**
 * 计算矩形的中心点
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }
}

/**
 * 计算矩形的边界框
 */
export function getRectBounds(rect: Rect): BoundingBox {
  return {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
  }
}

/**
 * 检查点是否在矩形内
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
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius
}

/**
 * 计算适合容器的尺寸（保持宽高比）
 */
export function fitSize(
  originalSize: Size,
  containerSize: Size,
  mode: 'contain' | 'cover' = 'contain'
): Size {
  const originalRatio = originalSize.width / originalSize.height
  const containerRatio = containerSize.width / containerSize.height
  
  let width: number
  let height: number
  
  if (mode === 'contain') {
    if (originalRatio > containerRatio) {
      width = containerSize.width
      height = width / originalRatio
    } else {
      height = containerSize.height
      width = height * originalRatio
    }
  } else {
    // cover
    if (originalRatio > containerRatio) {
      height = containerSize.height
      width = height * originalRatio
    } else {
      width = containerSize.width
      height = width / originalRatio
    }
  }
  
  return { width, height }
}

/**
 * 计算缩放后的尺寸
 */
export function scaleSize(size: Size, scale: number): Size {
  return {
    width: size.width * scale,
    height: size.height * scale,
  }
}

/**
 * 计算旋转后的边界框
 */
export function getRotatedBounds(rect: Rect, angle: number): BoundingBox {
  const center = getRectCenter(rect)
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ]
  
  const rotatedCorners = corners.map(corner => rotatePoint(corner, center, angle))
  
  const xs = rotatedCorners.map(p => p.x)
  const ys = rotatedCorners.map(p => p.y)
  
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  }
}

/**
 * 约束矩形在边界内
 */
export function constrainRect(rect: Rect, bounds: BoundingBox): Rect {
  const result = { ...rect }
  
  // 约束位置
  result.x = clamp(result.x, bounds.left, bounds.right - result.width)
  result.y = clamp(result.y, bounds.top, bounds.bottom - result.height)
  
  // 约束尺寸
  result.width = Math.min(result.width, bounds.right - result.x)
  result.height = Math.min(result.height, bounds.bottom - result.y)
  
  return result
}

/**
 * 根据宽高比调整矩形
 */
export function adjustRectByAspectRatio(
  rect: Rect,
  aspectRatio: number,
  anchor: 'center' | 'top-left' = 'center'
): Rect {
  if (aspectRatio <= 0) return rect
  
  const currentRatio = rect.width / rect.height
  let newWidth = rect.width
  let newHeight = rect.height
  
  if (currentRatio > aspectRatio) {
    newWidth = rect.height * aspectRatio
  } else {
    newHeight = rect.width / aspectRatio
  }
  
  let newX = rect.x
  let newY = rect.y
  
  if (anchor === 'center') {
    newX = rect.x + (rect.width - newWidth) / 2
    newY = rect.y + (rect.height - newHeight) / 2
  }
  
  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  }
}

/**
 * 计算两个矩形的交集
 */
export function intersectRect(rect1: Rect, rect2: Rect): Rect | null {
  const left = Math.max(rect1.x, rect2.x)
  const top = Math.max(rect1.y, rect2.y)
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width)
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height)
  
  if (left >= right || top >= bottom) {
    return null
  }
  
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }
}

/**
 * 检查两个矩形是否相交
 */
export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
  return intersectRect(rect1, rect2) !== null
}

/**
 * 计算矩形的面积
 */
export function getRectArea(rect: Rect): number {
  return rect.width * rect.height
}

/**
 * 标准化角度到 0-360 度范围
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360
  return angle < 0 ? angle + 360 : angle
}

/**
 * 计算最接近的90度倍数角度
 */
export function snapToRightAngle(angle: number): number {
  const normalized = normalizeAngle(angle)
  const quarters = Math.round(normalized / 90)
  return quarters * 90
}
