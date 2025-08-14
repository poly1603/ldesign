/**
 * @ldesign/theme - useTheme 组合式函数
 *
 * 提供主题管理的响应式接口
 */

import { inject, computed, type ComputedRef, type Ref } from 'vue'
import type {
  UseThemeReturn,
  VueThemeContext,
  ThemeConfig,
  ThemeEventType,
  ThemeEventListener,
} from '../types'
import { VueThemeContextKey } from '../types'

/**
 * 使用主题的组合式函数
 */
export function useTheme(): UseThemeReturn {
  // 注入主题上下文
  const themeContext = inject<VueThemeContext>(VueThemeContextKey)

  if (!themeContext) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  const { themeManager, currentTheme, availableThemes, isLoading, error } =
    themeContext

  /**
   * 设置主题
   */
  const setTheme = async (name: string): Promise<void> => {
    if (!themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    try {
      await themeManager.value.setTheme(name)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * 获取主题配置
   */
  const getTheme = (name: string): ThemeConfig | undefined => {
    if (!themeManager.value) {
      return undefined
    }

    return themeManager.value.getTheme(name)
  }

  /**
   * 添加主题
   */
  const addTheme = (theme: ThemeConfig): void => {
    if (!themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    themeManager.value.addTheme(theme)
  }

  /**
   * 移除主题
   */
  const removeTheme = (name: string): void => {
    if (!themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    themeManager.value.removeTheme(name)
  }

  /**
   * 添加事件监听器
   */
  const on = (event: ThemeEventType, listener: ThemeEventListener): void => {
    if (!themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    themeManager.value.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  const off = (event: ThemeEventType, listener: ThemeEventListener): void => {
    if (!themeManager.value) {
      return
    }

    themeManager.value.off(event, listener)
  }

  return {
    currentTheme,
    availableThemes,
    isLoading,
    error,
    setTheme,
    getTheme,
    addTheme,
    removeTheme,
    on,
    off,
  }
}

/**
 * 使用当前主题配置的组合式函数
 */
export function useCurrentTheme(): ComputedRef<ThemeConfig | undefined> {
  const { currentTheme, getTheme } = useTheme()

  return computed(() => {
    if (!currentTheme.value) {
      return undefined
    }

    return getTheme(currentTheme.value)
  })
}

/**
 * 使用主题状态的组合式函数
 */
export function useThemeState(): {
  currentTheme: Ref<string | undefined>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  hasTheme: ComputedRef<boolean>
  isThemeActive: (name: string) => ComputedRef<boolean>
} {
  const { currentTheme, isLoading, error } = useTheme()

  const hasTheme = computed(() => !!currentTheme.value)

  const isThemeActive = (name: string) =>
    computed(() => currentTheme.value === name)

  return {
    currentTheme,
    isLoading,
    error,
    hasTheme,
    isThemeActive,
  }
}

/**
 * 使用主题切换的组合式函数
 */
export function useThemeToggle(themes: string[]): {
  currentIndex: ComputedRef<number>
  nextTheme: ComputedRef<string | undefined>
  previousTheme: ComputedRef<string | undefined>
  toggleNext: () => Promise<void>
  togglePrevious: () => Promise<void>
  toggleTo: (index: number) => Promise<void>
} {
  const { currentTheme, setTheme } = useTheme()

  const currentIndex = computed(() => {
    if (!currentTheme.value) {
      return -1
    }

    return themes.indexOf(currentTheme.value)
  })

  const nextTheme = computed(() => {
    const index = currentIndex.value
    if (index === -1 || index === themes.length - 1) {
      return themes[0]
    }

    return themes[index + 1]
  })

  const previousTheme = computed(() => {
    const index = currentIndex.value
    if (index === -1 || index === 0) {
      return themes[themes.length - 1]
    }

    return themes[index - 1]
  })

  const toggleNext = async (): Promise<void> => {
    if (nextTheme.value) {
      await setTheme(nextTheme.value)
    }
  }

  const togglePrevious = async (): Promise<void> => {
    if (previousTheme.value) {
      await setTheme(previousTheme.value)
    }
  }

  const toggleTo = async (index: number): Promise<void> => {
    if (index >= 0 && index < themes.length) {
      await setTheme(themes[index])
    }
  }

  return {
    currentIndex,
    nextTheme,
    previousTheme,
    toggleNext,
    togglePrevious,
    toggleTo,
  }
}

/**
 * 使用主题预加载的组合式函数
 */
export function useThemePreload(): {
  preloadTheme: (name: string) => Promise<void>
  preloadAllThemes: () => Promise<void>
  isPreloading: Ref<boolean>
  preloadError: Ref<Error | null>
} {
  const { availableThemes } = useTheme()
  const themeContext = inject<VueThemeContext>(VueThemeContextKey)!

  const isPreloading = ref(false)
  const preloadError = ref<Error | null>(null)

  const preloadTheme = async (name: string): Promise<void> => {
    if (!themeContext.themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    try {
      isPreloading.value = true
      preloadError.value = null

      await themeContext.themeManager.value.preloadResources(name)
    } catch (err) {
      preloadError.value = err as Error
      throw err
    } finally {
      isPreloading.value = false
    }
  }

  const preloadAllThemes = async (): Promise<void> => {
    const themes = availableThemes.value

    for (const theme of themes) {
      try {
        await preloadTheme(theme)
      } catch (err) {
        console.warn(`Failed to preload theme: ${theme}`, err)
      }
    }
  }

  return {
    preloadTheme,
    preloadAllThemes,
    isPreloading,
    preloadError,
  }
}
