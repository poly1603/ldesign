/**
 * 主题切换组合式 API
 */

import type { ThemeManagerInstance } from '../../../core/types'
import type { UseThemeToggleReturn } from '../types'
import { computed } from 'vue'
import { useTheme } from './useTheme'

/**
 * 主题切换器组合式 API
 * @param manager 可选的主题管理器实例
 * @returns 主题切换相关的响应式状态和方法
 */
export function useThemeToggle(
  manager?: ThemeManagerInstance,
): UseThemeToggleReturn {
  const { currentMode, setMode } = useTheme(manager)

  const toggle = async () => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const isLight = computed(() => currentMode.value === 'light')
  const isDark = computed(() => currentMode.value === 'dark')

  return {
    currentMode,
    toggle,
    isLight,
    isDark,
  }
}
