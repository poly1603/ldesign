/**
 * 工具函数
 */

import type { SizeMode } from '../types'
import { getSizeConfig } from '../core/presets'

/**
 * 检查是否为有效的尺寸模式
 */
export function isValidSizeMode(mode: string): mode is SizeMode {
  return ['small', 'medium', 'large', 'extra-large'].includes(mode)
}

/**
 * 获取下一个尺寸模式
 */
export function getNextSizeMode(currentMode: SizeMode): SizeMode {
  const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
  const currentIndex = modes.indexOf(currentMode)
  const nextIndex = (currentIndex + 1) % modes.length
  return modes[nextIndex]
}

/**
 * 获取上一个尺寸模式
 */
export function getPreviousSizeMode(currentMode: SizeMode): SizeMode {
  const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
  const currentIndex = modes.indexOf(currentMode)
  const previousIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1
  return modes[previousIndex]
}

/**
 * 比较两个尺寸模式的大小
 */
export function compareSizeModes(mode1: SizeMode, mode2: SizeMode): number {
  const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
  const index1 = modes.indexOf(mode1)
  const index2 = modes.indexOf(mode2)
  return index1 - index2
}

/**
 * 获取尺寸模式的显示名称
 */
export function getSizeModeDisplayName(mode: SizeMode): string {
  const displayNames: Record<SizeMode, string> = {
    'small': '小',
    'medium': '中',
    'large': '大',
    'extra-large': '超大',
  }
  return displayNames[mode]
}

/**
 * 从字符串解析尺寸模式
 */
export function parseSizeMode(value: string): SizeMode | null {
  const normalizedValue = value.toLowerCase().trim()

  // 直接匹配
  if (isValidSizeMode(normalizedValue)) {
    return normalizedValue
  }

  // 别名匹配
  const aliases: Record<string, SizeMode> = {
    s: 'small',
    m: 'medium',
    l: 'large',
    xl: 'extra-large',
    小: 'small',
    中: 'medium',
    大: 'large',
    超大: 'extra-large',
  }

  return aliases[normalizedValue] || null
}

/**
 * 计算尺寸缩放比例
 */
export function calculateSizeScale(
  fromMode: SizeMode,
  toMode: SizeMode,
): number {
  const fromConfig = getSizeConfig(fromMode)
  const toConfig = getSizeConfig(toMode)

  // 使用基础字体大小计算缩放比例
  const fromSize = Number.parseFloat(fromConfig.fontSize.base)
  const toSize = Number.parseFloat(toConfig.fontSize.base)

  return toSize / fromSize
}

/**
 * 格式化CSS值
 */
export function formatCSSValue(value: string | number, unit?: string): string {
  if (typeof value === 'number') {
    return unit ? `${value}${unit}` : `${value}px`
  }
  return value
}

/**
 * 解析CSS值
 */
export function parseCSSValue(value: string): { number: number, unit: string } {
  const match = value.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(.*)$/)
  if (match) {
    return {
      number: Number.parseFloat(match[1]),
      unit: match[2] || 'px',
    }
  }
  return { number: 0, unit: 'px' }
}

/**
 * 深度合并配置对象
 */
export function deepMergeConfig<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object'
        && source[key] !== null
        && !Array.isArray(source[key])
        && typeof target[key] === 'object'
        && target[key] !== null
        && !Array.isArray(target[key])
      ) {
        result[key] = deepMergeConfig(target[key], source[key])
      }
      else {
        result[key] = source[key] as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
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
  wait: number,
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

export function isValidInput(input: unknown): boolean {
  return input != null
}

/**
 * 检测用户偏好的尺寸模式
 */
export function detectPreferredSizeMode(): SizeMode {
  if (typeof window === 'undefined') {
    return 'medium'
  }

  // 检查媒体查询偏好
  const preferLargeText = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 1200px)')
  const preferSmallText = window.matchMedia('(max-width: 768px)')

  if (preferLargeText.matches) {
    return 'large'
  }
  else if (preferSmallText.matches) {
    return 'small'
  }

  return 'medium'
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') {
    return 1
  }
  return window.devicePixelRatio || 1
}

/**
 * 检查是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

/**
 * 获取视口尺寸
 */
export function getViewportSize(): { width: number, height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }
  }

  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  }
}

/**
 * 根据视口尺寸推荐尺寸模式
 */
export function getRecommendedSizeMode(): SizeMode {
  const { width } = getViewportSize()
  const isMobile = isMobileDevice()

  if (isMobile || width < 768) {
    return 'small'
  }
  else if (width >= 1200) {
    return 'large'
  }
  else {
    return 'medium'
  }
}

/**
 * 创建CSS变量名
 */
export function createCSSVariableName(prefix: string, name: string): string {
  return `${prefix}-${name}`
}

/**
 * 解析CSS变量名
 */
export function parseCSSVariableName(variableName: string): { prefix: string, name: string } {
  const parts = variableName.split('-')
  if (parts.length < 2) {
    return { prefix: '', name: variableName }
  }

  const prefix = parts.slice(0, 2).join('-')
  const name = parts.slice(2).join('-')
  return { prefix, name }
}

/**
 * 监听媒体查询变化
 */
export function watchMediaQuery(
  query: string,
  callback: (matches: boolean) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => { }
  }

  const mediaQuery = window.matchMedia(query)
  const handler = (e: MediaQueryListEvent) => callback(e.matches)

  // 立即执行一次
  callback(mediaQuery.matches)

  // 监听变化
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }
  else {
    // 兼容旧版本浏览器
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }
}

/**
 * 监听视口尺寸变化
 */
export function watchViewportSize(
  callback: (size: { width: number, height: number }) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => { }
  }

  const handler = () => callback(getViewportSize())

  // 立即执行一次
  handler()

  // 监听变化
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}

/**
 * 创建响应式尺寸监听器
 */
export function createResponsiveSizeWatcher(
  callback: (recommendedMode: SizeMode) => void,
): () => void {
  const unsubscribers: Array<() => void> = []

  // 监听视口尺寸变化
  const unsubscribeViewport = watchViewportSize(() => {
    const recommendedMode = getRecommendedSizeMode()
    callback(recommendedMode)
  })
  unsubscribers.push(unsubscribeViewport)

  // 监听设备方向变化
  if (typeof window !== 'undefined' && 'orientation' in window) {
    const handleOrientationChange = () => {
      // 延迟执行，等待视口尺寸更新
      setTimeout(() => {
        const recommendedMode = getRecommendedSizeMode()
        callback(recommendedMode)
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    unsubscribers.push(() => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    })
  }

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}
