/**
 * Vue 组合式 API for @ldesign/color
 */

import { ref, computed, inject, getCurrentInstance } from 'vue'
import type { ThemeManagerInstance, ColorMode } from '../../core/types'

/**
 * 使用主题管理器的组合式 API
 * @returns 主题管理器相关的响应式状态和方法
 */
export function useTheme() {
  // 尝试从注入中获取主题管理器
  const injectedThemeManager = inject<ThemeManagerInstance>('$themeManager')
  
  // 尝试从全局属性获取主题管理器
  const instance = getCurrentInstance()
  const globalThemeManager = instance?.appContext.config.globalProperties.$themeManager

  const themeManager = injectedThemeManager || globalThemeManager

  if (!themeManager) {
    console.warn('[useTheme] ThemeManager not found. Make sure the color plugin is installed.')
    // 返回默认值
    return {
      currentTheme: ref('default'),
      currentMode: ref<ColorMode>('light'),
      availableThemes: ref<string[]>([]),
      setTheme: async () => {},
      setMode: async () => {},
      toggleMode: async () => {},
      themeManager: null,
    }
  }

  // 创建响应式状态
  const currentTheme = ref(themeManager.getCurrentTheme())
  const currentMode = ref(themeManager.getCurrentMode())
  const availableThemes = ref(themeManager.getThemeNames())

  // 监听主题变化
  themeManager.on('theme-changed', (data: any) => {
    currentTheme.value = data.theme || themeManager.getCurrentTheme()
  })

  themeManager.on('mode-changed', (data: any) => {
    currentMode.value = data.mode || themeManager.getCurrentMode()
  })

  // 主题切换方法
  const setTheme = async (theme: string, mode?: ColorMode) => {
    await themeManager.setTheme(theme, mode)
    currentTheme.value = themeManager.getCurrentTheme()
    if (mode) {
      currentMode.value = themeManager.getCurrentMode()
    }
  }

  // 模式切换方法
  const setMode = async (mode: ColorMode) => {
    await themeManager.setMode(mode)
    currentMode.value = themeManager.getCurrentMode()
  }

  // 切换模式方法
  const toggleMode = async () => {
    await themeManager.toggleMode()
    currentMode.value = themeManager.getCurrentMode()
  }

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')

  return {
    // 响应式状态
    currentTheme,
    currentMode,
    availableThemes,
    isDark,
    isLight,
    
    // 方法
    setTheme,
    setMode,
    toggleMode,
    
    // 原始实例
    themeManager,
  }
}

/**
 * 使用颜色管理器的组合式 API（useTheme 的别名）
 */
export const useColor = useTheme

/**
 * 使用主题模式的组合式 API
 * @returns 主题模式相关的响应式状态和方法
 */
export function useThemeMode() {
  const { currentMode, isDark, isLight, setMode, toggleMode } = useTheme()
  
  return {
    currentMode,
    isDark,
    isLight,
    setMode,
    toggleMode,
  }
}

/**
 * 使用主题切换的组合式 API
 * @returns 主题切换相关的响应式状态和方法
 */
export function useThemeSwitch() {
  const { currentTheme, availableThemes, setTheme } = useTheme()
  
  return {
    currentTheme,
    availableThemes,
    setTheme,
  }
}
