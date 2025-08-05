/**
 * 主题选择器组合式 API
 */

import type { ThemeManagerInstance } from '../../../core/types'
import type { UseThemeSelectorReturn } from '../types'
import { computed } from 'vue'
import { useTheme } from './useTheme'
import type { ThemeConfig } from '../../../core/types'

/**
 * 主题选择器组合式 API
 * @param manager 可选的主题管理器实例
 * @returns 主题选择相关的响应式状态和方法
 */
export function useThemeSelector(manager?: ThemeManagerInstance): UseThemeSelectorReturn {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    getThemeConfig,
  } = useTheme(manager)

  const themeConfigs = computed(() => {
    return availableThemes.value
      .map(name => getThemeConfig(name))
      .filter(Boolean) as ThemeConfig[]
  })

  const selectTheme = async (theme: string) => {
    await setTheme(theme)
  }

  return {
    currentTheme,
    availableThemes,
    themeConfigs,
    selectTheme,
    setTheme,
  }
}
