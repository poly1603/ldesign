/**
 * 便捷API函数
 * 提供简化的使用方式
 */

import type { SizeManagerOptions, SizeMode } from '../types'
import { createSizeManager, globalSizeManager } from '../core/size-manager'
import { detectPreferredSizeMode, getRecommendedSizeMode } from '../utils'

/**
 * 快速设置全局尺寸模式
 */
export function setGlobalSize(mode: SizeMode): void {
  globalSizeManager.setMode(mode)
}

/**
 * 获取当前全局尺寸模式
 */
export function getGlobalSize(): SizeMode {
  return globalSizeManager.getCurrentMode()
}

/**
 * 切换到下一个尺寸模式
 */
export function nextGlobalSize(): void {
  const modes: SizeMode[] = ['small', 'medium', 'large']
  const current = globalSizeManager.getCurrentMode()
  const currentIndex = modes.indexOf(current)
  const nextIndex = (currentIndex + 1) % modes.length
  globalSizeManager.setMode(modes[nextIndex])
}

/**
 * 切换到上一个尺寸模式
 */
export function previousGlobalSize(): void {
  const modes: SizeMode[] = ['small', 'medium', 'large']
  const current = globalSizeManager.getCurrentMode()
  const currentIndex = modes.indexOf(current)
  const previousIndex = (currentIndex - 1 + modes.length) % modes.length
  globalSizeManager.setMode(modes[previousIndex])
}

/**
 * 在指定的尺寸模式之间循环切换
 */
export function toggleGlobalSize(modes: SizeMode[] = ['small', 'medium', 'large']): void {
  const current = globalSizeManager.getCurrentMode()
  const currentIndex = modes.indexOf(current)
  const nextIndex = (currentIndex + 1) % modes.length
  globalSizeManager.setMode(modes[nextIndex])
}

/**
 * 重置为推荐的尺寸模式
 */
export function resetToRecommendedSize(): void {
  const recommended = getRecommendedSizeMode()
  globalSizeManager.setMode(recommended)
}

/**
 * 自动检测并设置最佳尺寸模式
 */
export function autoDetectSize(): void {
  const detected = detectPreferredSizeMode()
  globalSizeManager.setMode(detected)
}

/**
 * 监听全局尺寸变化
 */
export function watchGlobalSize(callback: (mode: SizeMode) => void): () => void {
  return globalSizeManager.onSizeChange((event) => {
    callback(event.currentMode)
  })
}

/**
 * 创建尺寸管理器的便捷函数
 */
export function createSize(options?: SizeManagerOptions) {
  return createSizeManager(options)
}

/**
 * 批量设置尺寸配置
 * @deprecated 此功能暂未实现，请使用 createSizeManager 创建自定义管理器
 */
export function configureSizes(_configs: Record<SizeMode, any>): void {
  throw new Error('configureSizes is not yet implemented. Please use createSizeManager to create custom managers.')
}

/**
 * 获取所有可用的尺寸模式
 */
export function getAvailableSizes(): SizeMode[] {
  return ['small', 'medium', 'large', 'extra-large']
}

/**
 * 检查是否为有效的尺寸模式
 */
export function isValidSize(mode: string): mode is SizeMode {
  return ['small', 'medium', 'large', 'extra-large'].includes(mode as SizeMode)
}

/**
 * 获取尺寸模式的显示名称
 */
export function getSizeDisplayName(mode: SizeMode): string {
  const names: Partial<Record<SizeMode, string>> = {
    'small': '小',
    'medium': '中',
    'large': '大',
    'extra-large': '超大',
  }
  return names[mode] || mode
}

/**
 * 获取尺寸模式的描述
 */
export function getSizeDescription(mode: SizeMode): string {
  const descriptions: Partial<Record<SizeMode, string>> = {
    'small': '适合移动设备和小屏幕',
    'medium': '适合桌面和平板设备',
    'large': '适合大屏幕和高分辨率显示器',
    'extra-large': '适合超大屏幕和演示模式',
  }
  return descriptions[mode] || ''
}

/**
 * 比较两个尺寸模式的大小
 */
export function compareSizes(a: SizeMode, b: SizeMode): number {
  const order: Partial<Record<SizeMode, number>> = {
    'small': 0,
    'medium': 1,
    'large': 2,
    'extra-large': 3,
  }
  return (order[a] ?? 0) - (order[b] ?? 0)
}

/**
 * 获取比指定模式更大的模式
 */
export function getLargerSize(mode: SizeMode): SizeMode | null {
  const modes: SizeMode[] = ['small', 'medium', 'large']
  const index = modes.indexOf(mode)
  return index < modes.length - 1 ? modes[index + 1] : null
}

/**
 * 获取比指定模式更小的模式
 */
export function getSmallerSize(mode: SizeMode): SizeMode | null {
  const modes: SizeMode[] = ['small', 'medium', 'large']
  const index = modes.indexOf(mode)
  return index > 0 ? modes[index - 1] : null
}

/**
 * 检查是否为最小尺寸
 */
export function isSmallestSize(mode: SizeMode): boolean {
  return mode === 'small'
}

/**
 * 检查是否为最大尺寸
 */
export function isLargestSize(mode: SizeMode): boolean {
  return mode === 'large'
}

/**
 * 获取尺寸范围内的所有模式
 */
export function getSizeRange(from: SizeMode, to: SizeMode): SizeMode[] {
  const modes: SizeMode[] = ['small', 'medium', 'large']
  const fromIndex = modes.indexOf(from)
  const toIndex = modes.indexOf(to)

  if (fromIndex === -1 || toIndex === -1) {
    return []
  }

  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)

  return modes.slice(start, end + 1)
}

/**
 * 创建尺寸切换器
 */
export function createSizeToggler(modes: SizeMode[] = ['small', 'medium', 'large']) {
  let currentIndex = 0

  return {
    current: () => modes[currentIndex],
    next: () => {
      currentIndex = (currentIndex + 1) % modes.length
      return modes[currentIndex]
    },
    previous: () => {
      currentIndex = (currentIndex - 1 + modes.length) % modes.length
      return modes[currentIndex]
    },
    set: (mode: SizeMode) => {
      const index = modes.indexOf(mode)
      if (index !== -1) {
        currentIndex = index
      }
    },
    reset: () => {
      currentIndex = 0
    },
  }
}

/**
 * 创建尺寸状态管理器
 */
export function createSizeState(initialMode: SizeMode = 'medium') {
  let currentMode = initialMode
  const listeners: Array<(mode: SizeMode) => void> = []

  return {
    get: () => currentMode,
    set: (mode: SizeMode) => {
      if (mode !== currentMode) {
        currentMode = mode
        listeners.forEach(listener => listener(mode))
      }
    },
    subscribe: (listener: (mode: SizeMode) => void) => {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    },
    destroy: () => {
      listeners.length = 0
    },
  }
}

/**
 * 便捷的尺寸管理对象
 */
export const Size = {
  // 基础操作
  get: getGlobalSize,
  set: setGlobalSize,
  next: nextGlobalSize,
  previous: previousGlobalSize,
  toggle: toggleGlobalSize,

  // 智能操作
  auto: autoDetectSize,
  reset: resetToRecommendedSize,
  recommended: getRecommendedSizeMode,

  // 监听
  watch: watchGlobalSize,

  // 工具函数
  isValid: isValidSize,
  compare: compareSizes,
  displayName: getSizeDisplayName,
  description: getSizeDescription,

  // 范围操作
  larger: getLargerSize,
  smaller: getSmallerSize,
  range: getSizeRange,

  // 检查
  isSmallest: isSmallestSize,
  isLargest: isLargestSize,

  // 创建工具
  createToggler: createSizeToggler,
  createState: createSizeState,
  createManager: createSize,

  // 常量
  MODES: getAvailableSizes(),
  SMALL: 'small' as const,
  MEDIUM: 'medium' as const,
  LARGE: 'large' as const,
  EXTRA_LARGE: 'extra-large' as const,
}

// 默认导出便捷对象
export default Size
