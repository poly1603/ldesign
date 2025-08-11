/**
 * 主题管理组合式 API
 */

import type {
  ColorMode,
  ThemeConfig,
  ThemeManagerInstance,
} from '../../../core/types'
import type { UseThemeReturn } from '../types'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { THEME_MANAGER_KEY } from '../types'

/**
 * 使用主题管理器的组合式 API
 * @param manager 可选的主题管理器实例
 * @returns 主题管理相关的响应式状态和方法
 */
export function useTheme(manager?: ThemeManagerInstance): UseThemeReturn {
  // 尝试从注入中获取主题管理器
  const injectedManager = inject<ThemeManagerInstance>(THEME_MANAGER_KEY)
  const themeManager = manager || injectedManager

  if (!themeManager) {
    throw new Error(
      'Theme manager not found. Please provide a manager or install the Vue plugin.'
    )
  }

  // 响应式状态
  const currentTheme = ref(themeManager.getCurrentTheme())
  const currentMode = ref(themeManager.getCurrentMode())
  const availableThemes = ref(themeManager.getThemeNames())

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')
  const currentThemeConfig = computed(() =>
    themeManager.getThemeConfig(currentTheme.value)
  )

  // 状态更新函数
  const updateState = () => {
    currentTheme.value = themeManager.getCurrentTheme()
    currentMode.value = themeManager.getCurrentMode()
    availableThemes.value = themeManager.getThemeNames()
  }

  // 事件监听器
  let unsubscribeCallbacks: (() => void)[] = []

  onMounted(() => {
    // 初始更新
    updateState()

    // 监听主题变化事件
    if (themeManager.on) {
      themeManager.on('theme-changed', updateState)
      themeManager.on('mode-changed', updateState)
      themeManager.on('theme-registered', updateState)

      // 简化清理逻辑
      unsubscribeCallbacks = [
        () => {
          // 这里应该有具体的取消订阅逻辑
          // 暂时使用空函数
        },
      ]
    } else {
      // 如果没有事件系统，使用轮询（降级方案）
      const interval = setInterval(updateState, 1000)
      unsubscribeCallbacks = [() => clearInterval(interval)]
    }
  })

  onUnmounted(() => {
    // 清理事件监听器
    unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
  })

  // 方法
  const setTheme = async (theme: string, mode?: ColorMode) => {
    await themeManager.setTheme(theme, mode)
    updateState()
  }

  const setMode = async (mode: ColorMode) => {
    await themeManager.setMode(mode)
    updateState()
  }

  const toggleMode = async () => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const registerTheme = (config: ThemeConfig) => {
    themeManager.registerTheme(config)
    updateState()
  }

  const getThemeConfig = (name: string) => {
    return themeManager.getThemeConfig(name)
  }

  const resetToDefault = async () => {
    const defaultTheme = availableThemes.value[0]
    if (defaultTheme) {
      await setTheme(defaultTheme, 'light')
    }
  }

  // 监听外部状态变化
  watch([currentTheme, currentMode], () => {
    // 可以在这里添加额外的副作用
  })

  return {
    themeManager,
    currentTheme,
    currentMode,
    isDark,
    isLight,
    availableThemes,
    currentThemeConfig,
    setTheme,
    setMode,
    toggleMode,
    registerTheme,
    getThemeConfig,
    resetToDefault,
  }
}
