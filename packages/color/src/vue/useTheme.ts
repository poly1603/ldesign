/**
 * Vue 3 Composable for theme management
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ThemeManager, ThemeState, ThemeOptions } from '../themes/themeManager'
import { presetThemes, PresetTheme } from '../themes/presets'

export interface UseThemeOptions extends ThemeOptions {
  immediate?: boolean
}

export function useTheme(options: UseThemeOptions = {}) {
  const themeManager = new ThemeManager(options)
  const currentTheme = ref<ThemeState | null>(null)
  const presets = ref<PresetTheme[]>(presetThemes)
  const isLoading = ref(false)

  // 计算属性
  const primaryColor = computed(() => currentTheme.value?.primaryColor || '')
  const themeName = computed(() => currentTheme.value?.themeName || '')
  const isDark = computed(() => currentTheme.value?.isDark || false)

  // 应用主题
  const applyTheme = async (colorOrName: string, themeOptions?: ThemeOptions) => {
    isLoading.value = true
    try {
      const theme = themeManager.applyTheme(colorOrName, themeOptions)
      currentTheme.value = theme
      return theme
    } finally {
      isLoading.value = false
    }
  }

  // 应用预设主题
  const applyPresetTheme = async (name: string, themeOptions?: ThemeOptions) => {
    isLoading.value = true
    try {
      const theme = themeManager.applyPresetTheme(name, themeOptions)
      currentTheme.value = theme
      return theme
    } finally {
      isLoading.value = false
    }
  }

  // 恢复主题
  const restoreTheme = () => {
    const theme = themeManager.restore()
    if (theme) {
      currentTheme.value = theme
    }
    return theme
  }

  // 清除主题
  const clearTheme = () => {
    themeManager.clear()
    currentTheme.value = null
  }

  // 获取当前主题
  const getCurrentTheme = () => {
    const theme = themeManager.getCurrentTheme()
    currentTheme.value = theme
    return theme
  }

  // 监听主题变化
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    // 恢复或获取当前主题
    if (options.immediate !== false) {
      const theme = themeManager.getCurrentTheme() || themeManager.restore()
      if (theme) {
        currentTheme.value = theme
      }
    }

    // 监听主题变化
    unsubscribe = themeManager.onChange((theme) => {
      currentTheme.value = theme
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    // 状态
    currentTheme,
    presets,
    isLoading,
    // 计算属性
    primaryColor,
    themeName,
    isDark,
    // 方法
    applyTheme,
    applyPresetTheme,
    restoreTheme,
    clearTheme,
    getCurrentTheme
  }
}

/**
 * 创建一个全局的主题管理器实例
 */
export function createThemeProvider(options: UseThemeOptions = {}) {
  const themeManager = new ThemeManager(options)
  
  return {
    install(app: any) {
      app.provide('themeManager', themeManager)
      app.config.globalProperties.$theme = themeManager
    }
  }
}