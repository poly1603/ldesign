/**
 * Vue Composition API Hooks
 */

import type { SizeChangeEvent, SizeConfig, SizeManager, SizeMode } from '../types'
import { computed, inject, onUnmounted, ref, type Ref } from 'vue'
import { createSizeManager, globalSizeManager } from '../core/size-manager'
import {
  getNextSizeMode,
  getPreviousSizeMode,
  getSizeModeDisplayName,
  isValidSizeMode,
} from '../utils'
import { VueSizeSymbol } from './plugin'

/**
 * useSize Hook 选项
 */
export interface UseSizeOptions {
  /** 是否使用全局管理器 */
  global?: boolean
  /** 初始尺寸模式 */
  initialMode?: SizeMode
  /** 是否自动注入CSS */
  autoInject?: boolean
}

/**
 * useSize Hook 返回值
 */
export interface UseSizeReturn {
  /** 当前尺寸模式 */
  currentMode: Ref<SizeMode>
  /** 当前尺寸配置 */
  currentConfig: Ref<SizeConfig>
  /** 当前模式显示名称 */
  currentModeDisplayName: Ref<string>
  /** 设置尺寸模式 */
  setMode: (mode: SizeMode) => void
  /** 切换到下一个尺寸模式 */
  nextMode: () => void
  /** 切换到上一个尺寸模式 */
  previousMode: () => void
  /** 获取尺寸配置 */
  getConfig: (mode?: SizeMode) => SizeConfig
  /** 生成CSS变量 */
  generateCSSVariables: (mode?: SizeMode) => Record<string, string>
  /** 注入CSS */
  injectCSS: (mode?: SizeMode) => void
  /** 移除CSS */
  removeCSS: () => void
  /** 尺寸管理器实例 */
  sizeManager: SizeManager
}

/**
 * 使用尺寸管理 Hook
 */
export function useSize(options: UseSizeOptions = {}): UseSizeReturn {
  const { global = false, initialMode, autoInject = true } = options

  // 尝试从插件注入获取管理器
  const injectedManager = inject<SizeManager | null>(VueSizeSymbol, null)

  // 选择管理器
  let sizeManager: SizeManager
  if (global) {
    sizeManager = globalSizeManager
  }
  else if (injectedManager) {
    sizeManager = injectedManager
  }
  else {
    sizeManager = createSizeManager({
      defaultMode: initialMode,
      autoInject,
    })
  }

  // 响应式状态
  const currentMode = ref<SizeMode>(sizeManager.getCurrentMode())
  const currentConfig = ref<SizeConfig>(sizeManager.getConfig())

  // 计算属性
  const currentModeDisplayName = computed(() => getSizeModeDisplayName(currentMode.value))

  // 监听尺寸变化
  const unsubscribe = sizeManager.onSizeChange((event: SizeChangeEvent) => {
    currentMode.value = event.currentMode
    currentConfig.value = sizeManager.getConfig(event.currentMode)
  })

  // 方法
  const setMode = (mode: SizeMode) => {
    sizeManager.setMode(mode)
  }

  const nextMode = () => {
    const next = getNextSizeMode(currentMode.value)
    setMode(next)
  }

  const previousMode = () => {
    const previous = getPreviousSizeMode(currentMode.value)
    setMode(previous)
  }

  const getConfig = (mode?: SizeMode) => {
    return sizeManager.getConfig(mode)
  }

  const generateCSSVariables = (mode?: SizeMode) => {
    return sizeManager.generateCSSVariables(mode)
  }

  const injectCSS = (mode?: SizeMode) => {
    sizeManager.injectCSS(mode)
  }

  const removeCSS = () => {
    sizeManager.removeCSS()
  }

  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribe()
    // 如果不是全局管理器且不是注入的管理器，则销毁
    if (!global && !injectedManager) {
      sizeManager.destroy()
    }
  })

  return {
    currentMode,
    currentConfig,
    currentModeDisplayName,
    setMode,
    nextMode,
    previousMode,
    getConfig,
    generateCSSVariables,
    injectCSS,
    removeCSS,
    sizeManager,
  }
}

/**
 * 使用全局尺寸管理 Hook
 */
export function useGlobalSize(): UseSizeReturn {
  return useSize({ global: true })
}

/**
 * 使用尺寸切换器 Hook
 */
export function useSizeSwitcher(options: UseSizeOptions = {}) {
  const sizeHook = useSize(options)
  const availableModes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']

  const switchToMode = (mode: string) => {
    if (isValidSizeMode(mode)) {
      sizeHook.setMode(mode)
    }
  }

  const getModeDisplayName = (mode: SizeMode) => {
    return getSizeModeDisplayName(mode)
  }

  return {
    ...sizeHook,
    availableModes,
    switchToMode,
    getModeDisplayName,
  }
}

/**
 * 使用尺寸响应式 Hook
 */
export function useSizeResponsive(breakpoints?: Partial<Record<SizeMode, boolean>>) {
  const { currentMode } = useSize({ global: true })

  const isSmall = computed(() => currentMode.value === 'small')
  const isMedium = computed(() => currentMode.value === 'medium')
  const isLarge = computed(() => currentMode.value === 'large')
  const isExtraLarge = computed(() => currentMode.value === 'extra-large')

  const isAtLeast = (mode: SizeMode) => {
    const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
    const currentIndex = modes.indexOf(currentMode.value)
    const targetIndex = modes.indexOf(mode)
    return currentIndex >= targetIndex
  }

  const isAtMost = (mode: SizeMode) => {
    const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
    const currentIndex = modes.indexOf(currentMode.value)
    const targetIndex = modes.indexOf(mode)
    return currentIndex <= targetIndex
  }

  return {
    currentMode,
    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
    isAtLeast,
    isAtMost,
  }
}

/**
 * 使用尺寸监听器 Hook
 */
export function useSizeWatcher(
  callback: (event: SizeChangeEvent) => void,
  options: UseSizeOptions = {},
) {
  const { sizeManager } = useSize(options)

  const unsubscribe = sizeManager.onSizeChange(callback)

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    unsubscribe,
  }
}
