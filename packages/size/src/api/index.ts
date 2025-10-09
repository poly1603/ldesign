/**
 * 便捷API函数
 * 提供简化的使用方式
 */

import type { SizeManagerOptions, SizeMode } from '../types'
import { createSizeManager, globalSizeManager } from '../core/size-manager'
import {
  compareSizeModes,
  createResponsiveSizeWatcher,
  detectPreferredSizeMode,
  getNextSizeMode,
  getPreviousSizeMode,
  getRecommendedSizeMode,
  getSizeModeDisplayName,
  isValidSizeMode,
} from '../utils'

/**
 * 所有可用的尺寸模式常量
 */
export const SIZE_MODES: readonly SizeMode[] = ['small', 'medium', 'large', 'extra-large'] as const

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
  const next = getNextSizeMode(globalSizeManager.getCurrentMode())
  globalSizeManager.setMode(next)
}

/**
 * 切换到上一个尺寸模式
 */
export function previousGlobalSize(): void {
  const previous = getPreviousSizeMode(globalSizeManager.getCurrentMode())
  globalSizeManager.setMode(previous)
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
 * 获取所有可用的尺寸模式
 */
export function getAvailableSizes(): readonly SizeMode[] {
  return SIZE_MODES
}

/**
 * 获取尺寸模式的描述
 */
export function getSizeDescription(mode: SizeMode): string {
  const descriptions: Record<SizeMode, string> = {
    'small': '适合移动设备和小屏幕',
    'medium': '适合桌面和平板设备',
    'large': '适合大屏幕和高分辨率显示器',
    'extra-large': '适合超大屏幕和演示模式',
  }
  return descriptions[mode]
}

/**
 * 获取比指定模式更大的模式
 */
export function getLargerSize(mode: SizeMode): SizeMode | null {
  const currentIndex = SIZE_MODES.indexOf(mode)
  return currentIndex < SIZE_MODES.length - 1 ? SIZE_MODES[currentIndex + 1] : null
}

/**
 * 获取比指定模式更小的模式
 */
export function getSmallerSize(mode: SizeMode): SizeMode | null {
  const currentIndex = SIZE_MODES.indexOf(mode)
  return currentIndex > 0 ? SIZE_MODES[currentIndex - 1] : null
}

/**
 * 检查是否为最小尺寸
 */
export function isSmallestSize(mode: SizeMode): boolean {
  return mode === SIZE_MODES[0]
}

/**
 * 检查是否为最大尺寸
 */
export function isLargestSize(mode: SizeMode): boolean {
  return mode === SIZE_MODES[SIZE_MODES.length - 1]
}

/**
 * 获取尺寸范围内的所有模式
 */
export function getSizeRange(from: SizeMode, to: SizeMode): SizeMode[] {
  const fromIndex = SIZE_MODES.indexOf(from)
  const toIndex = SIZE_MODES.indexOf(to)

  if (fromIndex === -1 || toIndex === -1) {
    return []
  }

  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)

  return SIZE_MODES.slice(start, end + 1) as SizeMode[]
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
 * 创建响应式尺寸管理器
 * 自动根据视口大小调整尺寸模式
 */
export function createResponsiveSize(options: {
  /** 是否自动应用推荐的尺寸 */
  autoApply?: boolean
  /** 自定义回调函数 */
  onChange?: (mode: SizeMode) => void
} = {}) {
  const { autoApply = true, onChange } = options

  const unsubscribe = createResponsiveSizeWatcher((recommendedMode) => {
    if (autoApply) {
      globalSizeManager.setMode(recommendedMode)
    }
    onChange?.(recommendedMode)
  })

  return {
    unsubscribe,
    getCurrentRecommended: getRecommendedSizeMode,
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

  // 工具函数（从 utils 导入）
  isValid: isValidSizeMode,
  compare: compareSizeModes,
  displayName: getSizeModeDisplayName,
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
  createResponsive: createResponsiveSize,

  // 常量
  MODES: SIZE_MODES,
  SMALL: 'small' as const,
  MEDIUM: 'medium' as const,
  LARGE: 'large' as const,
  EXTRA_LARGE: 'extra-large' as const,
}

// 默认导出便捷对象
export default Size
