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
