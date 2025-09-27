/**
 * @file 兼容性检查工具
 * @description 检查浏览器功能支持情况
 */

import type { CompatibilityResult } from '../types'

/**
 * 检查Canvas支持
 */
export function checkCanvasSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  } catch {
    return false
  }
}

/**
 * 检查FileReader支持
 */
export function checkFileReaderSupport(): boolean {
  return typeof FileReader !== 'undefined'
}

/**
 * 检查Blob支持
 */
export function checkBlobSupport(): boolean {
  try {
    return typeof Blob !== 'undefined' && !!new Blob()
  } catch {
    return false
  }
}

/**
 * 检查触摸支持
 */
export function checkTouchSupport(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

/**
 * 检查WebGL支持
 */
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

/**
 * 检查URL.createObjectURL支持
 */
export function checkObjectURLSupport(): boolean {
  return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
}

/**
 * 检查requestAnimationFrame支持
 */
export function checkAnimationFrameSupport(): boolean {
  return typeof requestAnimationFrame === 'function'
}

/**
 * 检查CSS transform支持
 */
export function checkTransformSupport(): boolean {
  const testElement = document.createElement('div')
  const prefixes = ['transform', 'webkitTransform', 'mozTransform', 'msTransform']
  
  return prefixes.some(prefix => prefix in testElement.style)
}

/**
 * 检查CSS filter支持
 */
export function checkFilterSupport(): boolean {
  const testElement = document.createElement('div')
  const prefixes = ['filter', 'webkitFilter', 'mozFilter', 'msFilter']
  
  return prefixes.some(prefix => prefix in testElement.style)
}

/**
 * 检查Pointer Events支持
 */
export function checkPointerEventsSupport(): boolean {
  return typeof PointerEvent !== 'undefined'
}

/**
 * 检查Intersection Observer支持
 */
export function checkIntersectionObserverSupport(): boolean {
  return typeof IntersectionObserver !== 'undefined'
}

/**
 * 检查ResizeObserver支持
 */
export function checkResizeObserverSupport(): boolean {
  return typeof ResizeObserver !== 'undefined'
}

/**
 * 检查Passive Event Listeners支持
 */
export function checkPassiveEventSupport(): boolean {
  let supportsPassive = false
  
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true
        return false
      },
    })
    
    window.addEventListener('testPassive', () => {}, opts)
    window.removeEventListener('testPassive', () => {}, opts)
  } catch {
    // 忽略错误
  }
  
  return supportsPassive
}

/**
 * 获取浏览器信息
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
  
  // 检测浏览器
  if (userAgent.includes('Chrome')) {
    name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    if (match) version = match[1]
    engine = 'Blink'
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    if (match) version = match[1]
    engine = 'Gecko'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    if (match) version = match[1]
    engine = 'WebKit'
  } else if (userAgent.includes('Edge')) {
    name = 'Edge'
    const match = userAgent.match(/Edge\/(\d+)/)
    if (match) version = match[1]
    engine = 'EdgeHTML'
  } else if (userAgent.includes('Edg')) {
    name = 'Edge Chromium'
    const match = userAgent.match(/Edg\/(\d+)/)
    if (match) version = match[1]
    engine = 'Blink'
  }
  
  return { name, version, engine }
}

/**
 * 检查是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 检查是否为iOS设备
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * 检查是否为Android设备
 */
export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent)
}

/**
 * 获取设备类型
 */
export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (isMobileDevice()) {
    // 简单的平板检测
    if (window.innerWidth >= 768) {
      return 'tablet'
    }
    return 'mobile'
  }
  return 'desktop'
}

/**
 * 完整的兼容性检查
 */
export function checkCompatibility(): CompatibilityResult {
  const features = {
    canvas: checkCanvasSupport(),
    fileReader: checkFileReaderSupport(),
    blob: checkBlobSupport(),
    touch: checkTouchSupport(),
    webgl: checkWebGLSupport(),
    objectURL: checkObjectURLSupport(),
    animationFrame: checkAnimationFrameSupport(),
    transform: checkTransformSupport(),
    filter: checkFilterSupport(),
    pointerEvents: checkPointerEventsSupport(),
    intersectionObserver: checkIntersectionObserverSupport(),
    resizeObserver: checkResizeObserverSupport(),
    passiveEvents: checkPassiveEventSupport(),
  }
  
  const errors: string[] = []
  
  // 检查必需的功能
  if (!features.canvas) {
    errors.push('Canvas API is not supported')
  }
  
  if (!features.fileReader) {
    errors.push('FileReader API is not supported')
  }
  
  if (!features.blob) {
    errors.push('Blob API is not supported')
  }
  
  const supported = errors.length === 0
  
  return {
    supported,
    features,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * 获取功能支持报告
 */
export function getFeatureReport(): Record<string, boolean> {
  return {
    canvas: checkCanvasSupport(),
    fileReader: checkFileReaderSupport(),
    blob: checkBlobSupport(),
    touch: checkTouchSupport(),
    webgl: checkWebGLSupport(),
    objectURL: checkObjectURLSupport(),
    animationFrame: checkAnimationFrameSupport(),
    transform: checkTransformSupport(),
    filter: checkFilterSupport(),
    pointerEvents: checkPointerEventsSupport(),
    intersectionObserver: checkIntersectionObserverSupport(),
    resizeObserver: checkResizeObserverSupport(),
    passiveEvents: checkPassiveEventSupport(),
  }
}
