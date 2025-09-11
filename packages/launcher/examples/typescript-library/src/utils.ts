/**
 * 工具函数集合
 */

import type { LibraryConfig, DeepPartial } from './types'

/**
 * 格式化数字为字符串
 */
export function formatNumber(num: number, precision: number = 2): string {
  return Number(num.toFixed(precision)).toString()
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any
    }
  }

  return result
}

/**
 * 检查是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 防抖函数
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

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
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
 * 休眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 数组分组
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item).toString()
    groups[key] = groups[key] || []
    groups[key].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 验证配置对象
 */
export function validateConfig(config: Partial<LibraryConfig>): config is LibraryConfig {
  return (
    typeof config.debug === 'boolean' &&
    typeof config.version === 'string' &&
    Array.isArray(config.features) &&
    config.features.every(f => typeof f === 'string')
  )
}
