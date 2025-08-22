import { UseThemeReturn } from '../types.js'
import { ComputedRef, Ref } from 'vue'
import { ThemeConfig } from '../../../core/types.js'

/**
 * @ldesign/theme - useTheme 组合式函数
 *
 * 提供主题管理的响应式接口
 */

/**
 * 使用主题的组合式函数
 */
declare function useTheme(): UseThemeReturn
/**
 * 使用当前主题配置的组合式函数
 */
declare function useCurrentTheme(): ComputedRef<ThemeConfig | undefined>
/**
 * 使用主题状态的组合式函数
 */
declare function useThemeState(): {
  currentTheme: Ref<string | undefined>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  hasTheme: ComputedRef<boolean>
  isThemeActive: (name: string) => ComputedRef<boolean>
}
/**
 * 使用主题切换的组合式函数
 */
declare function useThemeToggle(themes: string[]): {
  currentIndex: ComputedRef<number>
  nextTheme: ComputedRef<string | undefined>
  previousTheme: ComputedRef<string | undefined>
  toggleNext: () => Promise<void>
  togglePrevious: () => Promise<void>
  toggleTo: (index: number) => Promise<void>
}
/**
 * 使用主题预加载的组合式函数
 */
declare function useThemePreload(): {
  preloadTheme: (name: string) => Promise<void>
  preloadAllThemes: () => Promise<void>
  isPreloading: Ref<boolean>
  preloadError: Ref<Error | null>
}

export {
  useCurrentTheme,
  useTheme,
  useThemePreload,
  useThemeState,
  useThemeToggle,
}
