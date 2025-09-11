/**
 * 地图工具函数集合
 * 提供常用的地理计算、坐标转换、样式处理等功能
 */

import type { LngLat, Position, BBox } from '../types'

/**
 * 地图错误类
 * 用于处理地图相关的错误信息
 */
export class MapError extends Error {
  public code: string
  public details?: any

  constructor(message: string, code = 'MAP_ERROR', details?: any) {
    super(message)
    this.name = 'MapError'
    this.code = code
    this.details = details
  }
}

/**
 * 角度转弧度
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 弧度转角度
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * 计算两点之间的距离（米）
 * 使用Haversine公式
 */
export function getDistance(point1: LngLat, point2: LngLat): number {
  const R = 6371000 // 地球半径（米）
  const lat1Rad = degToRad(point1[1])
  const lat2Rad = degToRad(point2[1])
  const deltaLatRad = degToRad(point2[1] - point1[1])
  const deltaLngRad = degToRad(point2[0] - point1[0])

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * 计算两点之间的方位角（度）
 */
export function getBearing(point1: LngLat, point2: LngLat): number {
  const lat1Rad = degToRad(point1[1])
  const lat2Rad = degToRad(point2[1])
  const deltaLngRad = degToRad(point2[0] - point1[0])

  const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad)

  const bearingRad = Math.atan2(y, x)
  return (radToDeg(bearingRad) + 360) % 360
}

/**
 * 根据起点、距离和方位角计算终点坐标
 */
export function getDestination(point: LngLat, distance: number, bearing: number): LngLat {
  const R = 6371000 // 地球半径（米）
  const bearingRad = degToRad(bearing)
  const lat1Rad = degToRad(point[1])
  const lng1Rad = degToRad(point[0])

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(distance / R) +
    Math.cos(lat1Rad) * Math.sin(distance / R) * Math.cos(bearingRad)
  )

  const lng2Rad = lng1Rad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1Rad),
    Math.cos(distance / R) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
  )

  return [radToDeg(lng2Rad), radToDeg(lat2Rad)]
}

/**
 * 计算多个点的中心点
 */
export function getCenter(points: LngLat[]): LngLat {
  if (points.length === 0) {
    throw new Error('点数组不能为空')
  }

  let totalLng = 0
  let totalLat = 0

  points.forEach(point => {
    totalLng += point[0]
    totalLat += point[1]
  })

  return [totalLng / points.length, totalLat / points.length]
}

/**
 * 计算多个点的边界框
 */
export function getBounds(points: LngLat[]): BBox {
  if (points.length === 0) {
    throw new Error('点数组不能为空')
  }

  let minLng = points[0][0]
  let minLat = points[0][1]
  let maxLng = points[0][0]
  let maxLat = points[0][1]

  points.forEach(point => {
    minLng = Math.min(minLng, point[0])
    minLat = Math.min(minLat, point[1])
    maxLng = Math.max(maxLng, point[0])
    maxLat = Math.max(maxLat, point[1])
  })

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * 判断点是否在边界框内
 */
export function isPointInBounds(point: LngLat, bounds: BBox): boolean {
  const [lng, lat] = point
  const [west, south, east, north] = bounds
  return lng >= west && lng <= east && lat >= south && lat <= north
}

/**
 * 扩展边界框
 */
export function expandBounds(bounds: BBox, padding: number): BBox {
  const [west, south, east, north] = bounds
  return [west - padding, south - padding, east + padding, north + padding]
}

/**
 * 生成随机颜色
 */
export function randomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * 颜色透明度处理
 */
export function addOpacity(color: string, opacity: number): string {
  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // 处理RGB颜色
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }

  // 处理RGBA颜色
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`)
  }

  return color
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
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

/**
 * 判断是否为对象
 */
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'ldesign'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals)
}

/**
 * 格式化距离
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}

/**
 * 格式化坐标
 */
export function formatCoordinate(lngLat: LngLat, decimals = 6): string {
  return `${lngLat[0].toFixed(decimals)}, ${lngLat[1].toFixed(decimals)}`
}

/**
 * 验证坐标是否有效
 */
export function isValidCoordinate(lngLat: LngLat): boolean {
  const [lng, lat] = lngLat
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90
}

/**
 * 验证缩放级别是否有效
 */
export function isValidZoom(zoom: number, minZoom = 0, maxZoom = 24): boolean {
  return zoom >= minZoom && zoom <= maxZoom
}

/**
 * 创建CSS样式字符串
 */
export function createStyleString(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * 加载外部脚本
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * 加载外部样式
 */
export function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
    document.head.appendChild(link)
  })
}
