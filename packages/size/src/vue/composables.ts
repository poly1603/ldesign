/**
 * Vue Composition API Hooks
 */

import type {
  SizeChangeEvent,
  SizeConfig,
  SizeManager,
  SizeMode,
} from '../types'
import { computed, inject, onMounted, onUnmounted, reactive, ref, type Ref, toRefs } from 'vue'
import { createSizeManager, globalSizeManager } from '../core/size-manager'
import {
  createResponsiveSizeWatcher,
  getNextSizeMode,
  getPreviousSizeMode,
  getRecommendedSizeMode,
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
    // 如果没有注入的管理器，优先使用全局管理器而不是创建新实例
    // 这样可以避免路由切换时样式丢失的问题
    console.warn('[useSize] No injected manager found, falling back to global manager to prevent style loss')
    sizeManager = globalSizeManager
  }

  // 响应式状态
  const currentMode = ref<SizeMode>(sizeManager.getCurrentMode())
  const currentConfig = ref<SizeConfig>(sizeManager.getConfig())

  // 计算属性
  const currentModeDisplayName = computed(() =>
    getSizeModeDisplayName(currentMode.value),
  )

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
    // 但是由于我们现在默认使用全局管理器，这个条件基本不会触发
    if (!global && !injectedManager && sizeManager !== globalSizeManager) {
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
 *
 * 修复说明：默认使用全局管理器，避免在路由切换时因组件卸载导致样式丢失
 * 原因：当组件使用非全局管理器时，组件卸载会调用destroy()移除CSS样式
 */
export function useSizeSwitcher(options: UseSizeOptions = {}) {
  // 默认使用全局管理器，避免创建新实例导致样式丢失
  const sizeHook = useSize({ global: true, ...options })
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
export function useSizeResponsive(
  _breakpoints?: Partial<Record<SizeMode, boolean>>,
) {
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
  const { sizeManager } = useSize({ global: true, ...options })

  const unsubscribe = sizeManager.onSizeChange(callback)

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    unsubscribe,
  }
}

/**
 * 使用智能尺寸管理 Hook
 * 自动检测用户偏好和设备特性
 */
export function useSmartSize(options: UseSizeOptions & {
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 是否启用响应式 */
  responsive?: boolean
  /** 是否记住用户选择 */
  remember?: boolean
} = {}) {
  const { autoDetect = true, responsive = true, remember = true, ...sizeOptions } = options

  // 检测推荐的尺寸模式
  const recommendedMode = ref<SizeMode>('medium')
  const userPreferredMode = ref<SizeMode | null>(null)

  // 初始化推荐模式
  if (autoDetect) {
    recommendedMode.value = getRecommendedSizeMode()
  }

  const sizeHook = useSize({
    global: true, // 默认使用全局管理器
    ...sizeOptions,
    initialMode: userPreferredMode.value || recommendedMode.value,
  })

  // 响应式监听器
  let responsiveUnsubscriber: (() => void) | null = null

  onMounted(() => {
    if (responsive) {
      responsiveUnsubscriber = createResponsiveSizeWatcher((newRecommendedMode) => {
        recommendedMode.value = newRecommendedMode
        // 如果用户没有手动选择过，则自动切换
        if (!userPreferredMode.value) {
          sizeHook.setMode(newRecommendedMode)
        }
      })
    }
  })

  onUnmounted(() => {
    if (responsiveUnsubscriber) {
      responsiveUnsubscriber()
    }
  })

  // 增强的设置模式方法
  const setModeWithMemory = (mode: SizeMode, isUserChoice = true) => {
    sizeHook.setMode(mode)
    if (isUserChoice && remember) {
      userPreferredMode.value = mode
    }
  }

  // 重置为推荐模式
  const resetToRecommended = () => {
    userPreferredMode.value = null
    sizeHook.setMode(recommendedMode.value)
  }

  // 获取当前状态
  const isUsingRecommended = computed(() =>
    sizeHook.currentMode.value === recommendedMode.value,
  )

  const isUserOverride = computed(() =>
    userPreferredMode.value !== null && userPreferredMode.value !== recommendedMode.value,
  )

  return {
    ...sizeHook,
    recommendedMode,
    userPreferredMode,
    isUsingRecommended,
    isUserOverride,
    setMode: setModeWithMemory,
    resetToRecommended,
  }
}

/**
 * 使用尺寸动画 Hook
 */
export function useSizeAnimation(options: {
  /** 动画持续时间 */
  duration?: string
  /** 动画缓动函数 */
  easing?: string
  /** 是否启用动画 */
  enabled?: boolean
} = {}) {
  const { duration = '0.3s', easing = 'ease-in-out', enabled = true } = options

  const isAnimating = ref(false)
  const { currentMode, setMode: originalSetMode, sizeManager } = useSize({ global: true })

  // 带动画的设置模式
  const setModeWithAnimation = async (mode: SizeMode) => {
    if (!enabled || mode === currentMode.value) {
      originalSetMode(mode)
      return
    }

    isAnimating.value = true

    // 更新CSS注入器的动画设置
    const cssInjector = (sizeManager as any).cssInjector
    if (cssInjector) {
      cssInjector.updateOptions({
        enableTransition: true,
        transitionDuration: duration,
        transitionEasing: easing,
      })
    }

    originalSetMode(mode)

    // 等待动画完成
    await new Promise((resolve) => {
      const timeoutMs = Number.parseFloat(duration) * 1000
      setTimeout(resolve, timeoutMs)
    })

    isAnimating.value = false
  }

  return {
    currentMode,
    isAnimating,
    setMode: setModeWithAnimation,
    setModeInstant: originalSetMode,
  }
}

/**
 * 使用尺寸状态管理 Hook
 * 提供完整的状态管理功能
 */
export function useSizeState(options: UseSizeOptions & {
  /** 是否启用历史记录 */
  enableHistory?: boolean
  /** 历史记录最大长度 */
  maxHistoryLength?: number
} = {}) {
  const { enableHistory = true, maxHistoryLength = 10, ...sizeOptions } = options

  const sizeHook = useSize({ global: true, ...sizeOptions })

  // 历史记录
  const history = ref<SizeMode[]>([])
  const historyIndex = ref(-1)

  // 状态
  const state = reactive({
    canUndo: computed(() => historyIndex.value > 0),
    canRedo: computed(() => historyIndex.value < history.value.length - 1),
    historyLength: computed(() => history.value.length),
  })

  // 添加到历史记录
  const addToHistory = (mode: SizeMode) => {
    if (!enableHistory)
      return

    // 移除当前位置之后的历史记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // 添加新记录
    history.value.push(mode)
    historyIndex.value = history.value.length - 1

    // 限制历史记录长度
    if (history.value.length > maxHistoryLength) {
      history.value = history.value.slice(-maxHistoryLength)
      historyIndex.value = history.value.length - 1
    }
  }

  // 增强的设置模式方法
  const setModeWithHistory = (mode: SizeMode) => {
    if (mode !== sizeHook.currentMode.value) {
      addToHistory(mode)
      sizeHook.setMode(mode)
    }
  }

  // 撤销
  const undo = () => {
    if (state.canUndo) {
      historyIndex.value--
      const mode = history.value[historyIndex.value]
      sizeHook.setMode(mode)
    }
  }

  // 重做
  const redo = () => {
    if (state.canRedo) {
      historyIndex.value++
      const mode = history.value[historyIndex.value]
      sizeHook.setMode(mode)
    }
  }

  // 清空历史记录
  const clearHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  // 初始化历史记录
  if (enableHistory) {
    addToHistory(sizeHook.currentMode.value)
  }

  return {
    ...sizeHook,
    ...toRefs(state),
    history,
    historyIndex,
    setMode: setModeWithHistory,
    undo,
    redo,
    clearHistory,
  }
}
