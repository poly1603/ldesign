/**
 * Vue 3 Composable for theme management
 */

import type { PresetTheme } from '../themes/presets';
import type { ThemeOptions, ThemeState } from '../themes/themeManager';
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { presetThemes } from '../themes/presets'
import { ThemeManager } from '../themes/themeManager'

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
    // 清理订阅
    if (unsubscribe) {
      unsubscribe()
    }
    // 销毁主题管理器以防止内存泄漏
    if (themeManager && typeof themeManager.destroy === 'function') {
      themeManager.destroy()
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
let globalThemeManager: ThemeManager | null = null

export function createThemeProvider(options: UseThemeOptions = {}) {
  // 使用单例模式，避免重复创建
  if (!globalThemeManager) {
    globalThemeManager = new ThemeManager(options)
  }
  
  return {
    install(app: any) {
      app.provide('themeManager', globalThemeManager)
      app.config.globalProperties.$theme = globalThemeManager
      
      // 应用卸载时清理
      app.unmount = new Proxy(app.unmount, {
        apply(target, thisArg, args) {
          if (globalThemeManager && typeof globalThemeManager.destroy === 'function') {
            globalThemeManager.destroy()
            globalThemeManager = null
          }
          return Reflect.apply(target, thisArg, args)
        }
      })
    }
  }
}
